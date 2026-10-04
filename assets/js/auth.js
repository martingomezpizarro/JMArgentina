/*
 * Adaptador de inicio de sesión para los formularios del sitio (assets/js/acciones.js).
 * Usa el mismo proyecto de Firebase que el calendario (config.js → firebase) y la misma sesión de Google.
 * Si Firebase no está configurado, no define JM_AUTH y los formularios usan el modo provisorio por correo.
 */
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
  const oyentes = [];
  A.onAuthStateChanged(auth, (u) => {
    actual = u ? { uid: u.uid, nombre: u.displayName || u.email, email: u.email || '', foto: u.photoURL || '' } : null;
    oyentes.forEach((cb) => cb(actual));
  });

  window.JM_AUTH = {
    usuario: () => actual,
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
  document.dispatchEvent(new CustomEvent('jm-auth-listo'));
})();
