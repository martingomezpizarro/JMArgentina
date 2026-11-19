/*
 * Adaptador de inicio de sesión para los formularios del sitio (assets/js/acciones.js).
 * Usa el mismo proyecto de Firebase que el calendario (config.js → firebase) y la misma sesión de Google.
 * Si Firebase no está configurado, no define JM_AUTH y los formularios usan el modo provisorio por correo.
 */
import { registrarIngreso, entradaRegistro } from './registro.js?v=9';
import { armarPerfil } from './perfil.js?v=1';

const FIREBASE_V = '12.19.0';

(async function () {
  const cfg = (window.JM_CONFIG || {}).firebase;
  if (!cfg || !cfg.apiKey || !cfg.projectId) return;

  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_V}/`;
  const [App, A, F] = await Promise.all([
    import(base + 'firebase-app.js'),
    import(base + 'firebase-auth.js'),
    import(base + 'firebase-firestore.js')
  ]);
  const app = App.getApps().length ? App.getApp() : App.initializeApp(cfg);
  const auth = A.getAuth(app);
  auth.languageCode = 'es';
  const db = F.getFirestore(app);
  const proveedor = new A.GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: 'select_account' });
  A.getRedirectResult(auth).catch(() => {});

  let actual = null;
  let resuelto = false; // true cuando Firebase ya dijo si hay sesión o no
  const oyentes = [];
  A.onAuthStateChanged(auth, async (u) => {
    actual = u ? { uid: u.uid, nombre: u.displayName || u.email, email: u.email || '', foto: u.photoURL || '', rol: 'usuario', rama: '' } : null;
    if (u) {
      // Registra el ingreso (para que el admin lo vea en "Gestionar jefes"), lee su rol y rama
      // y aplica la habilitación por mail si el admin la cargó antes de que ingresara.
      try {
        const r = await registrarIngreso(F, db, u);
        actual.rol = r.rol; actual.rama = r.rama;
      } catch (e) { /* sin permiso o sin conexión: queda como usuario */ }
    }
    resuelto = true;
    oyentes.forEach((cb) => cb(actual));
  });

  window.JM_AUTH = {
    usuario: () => actual,
    resuelto: () => resuelto,
    onCambio: (cb) => { oyentes.push(cb); cb(actual); },
    async ingresar() {
      try {
        await A.signInWithPopup(auth, proveedor);
      } catch (e) {
        if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
          await A.signInWithRedirect(auth, proveedor);
        } else if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
          throw e;
        }
      }
    },
    salir: () => A.signOut(auth),

    // Fichas de las ramas (fichas_ramas/{id} y fichas_fotos/{id}). Las completan los jefes de esa rama y el admin.
    puedeEditarRama(nombreRama) {
      return !!actual && (actual.rol === 'admin' || (actual.rol === 'jefe' && actual.rama === nombreRama));
    },
    async fichas() {
      const snap = await F.getDocs(F.collection(db, 'fichas_ramas'));
      const out = {};
      snap.forEach((d) => { out[d.id] = d.data(); });
      return out;
    },
    async fotosFicha(id) {
      const d = await F.getDoc(F.doc(db, 'fichas_fotos', id));
      return d.exists() ? (d.data().fotos || []) : [];
    },
    // Cada cambio de ficha va en el mismo lote que su entrada en registro/ (las reglas lo exigen).
    async guardarFicha(id, datos, fotos) {
      if (!actual) throw new Error('sin sesión');
      const ref = F.doc(db, 'fichas_ramas', id);
      let antes = null;
      try { const d = await F.getDoc(ref); antes = d.exists() ? d.data() : null; } catch (e) { /* sigue sin copia */ }
      const b = F.writeBatch(db);
      const log = F.doc(F.collection(db, 'registro'));
      const ficha = { ...datos, cantidadFotos: fotos ? fotos.length : (datos.cantidadFotos || 0),
        actualizado: F.serverTimestamp(), actualizadoPor: actual.nombre || actual.email || '', registro: log.id };
      b.set(ref, ficha);
      if (fotos) b.set(F.doc(db, 'fichas_fotos', id), { nombre: datos.nombre, fotos });
      b.set(log, entradaRegistro(F, auth.currentUser, {
        tipo: 'ficha', accion: antes ? 'editar' : 'crear', objetoId: id, objetoNombre: datos.nombre, rama: datos.nombre,
        antes, despues: ficha, nota: fotos ? 'Cambió las fotos (' + fotos.length + ')' : ''
      }));
      await b.commit();
    },
    // Guarda un pedido (propuestas_hitos, solicitudes_acceso, propuestas_material). Ver firestore.rules.
    async guardar(coleccion, datos) {
      if (!actual) throw new Error('sin sesión');
      const limpio = {};
      Object.keys(datos).forEach((k) => {
        const v = datos[k];
        limpio[k] = typeof v === 'string' ? v.slice(0, 4000) : v;
      });
      limpio.uid = actual.uid;
      limpio.nombre = actual.nombre || '';
      limpio.email = actual.email || '';
      limpio.estado = 'pendiente';
      limpio.creado = F.serverTimestamp();
      delete limpio.fecha;
      await F.addDoc(F.collection(db, coleccion), limpio);
    }
  };
  armarPerfil(window.JM_AUTH);
  document.dispatchEvent(new CustomEvent('jm-auth-listo'));
})();
