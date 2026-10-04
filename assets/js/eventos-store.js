/*
 * Datos del calendario: sesión con Google, roles (admin / jefe), eventos y flyers.
 *
 * Hay dos "motores" con la misma interfaz:
 *  - Firebase (Auth + Firestore), cuando config.js tiene los datos del proyecto.
 *  - Demostración, cuando no los tiene: guarda todo en el navegador para probar la página.
 *
 * Colecciones en Firestore (reglas en firestore.rules):
 *  usuarios/{uid}  nombre, email, foto, ultimoIngreso         (quien ingresó alguna vez)
 *  roles/{uid}     rol ('admin' | 'jefe'), rama, nombre, email (solo lo escribe un admin)
 *  eventos/{id}    titulo, fecha, fechaFin, hora, lugar, rama, tipo, descripcion, costo,
 *                  link, info, thumb (miniatura), tieneFlyer, autorUid, autorNombre, creado
 *  flyers/{id}     data (imagen en base64), autorUid       (separado para que la lista cargue rápido)
 */

const FIREBASE_V = '12.19.0';

export function rolPuedePublicar(user) {
  return !!user && (user.rol === 'jefe' || user.rol === 'admin');
}

export async function crearStore(config) {
  const fb = config && config.firebase;
  if (fb && fb.apiKey && fb.projectId) return crearFirebase(fb);
  return crearDemo();
}

/* ======================= Firebase ======================= */
async function crearFirebase(cfg) {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_V}/`;
  const [{ initializeApp, getApps, getApp }, A, F] = await Promise.all([
    import(base + 'firebase-app.js'),
    import(base + 'firebase-auth.js'),
    import(base + 'firebase-firestore.js')
  ]);
  // auth.js (formularios del sitio) puede haber iniciado la misma app antes.
  const app = getApps().length ? getApp() : initializeApp(cfg);
  const auth = A.getAuth(app);
  auth.languageCode = 'es';
  const db = F.getFirestore(app);
  const proveedor = new A.GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: 'select_account' });

  // Si el ingreso fue por redirección (celulares que bloquean ventanas emergentes), lo completamos.
  A.getRedirectResult(auth).catch(() => {});

  async function perfil(u) {
    const datos = { nombre: u.displayName || '', email: u.email || '', foto: u.photoURL || '', ultimoIngreso: F.serverTimestamp() };
    try { await F.setDoc(F.doc(db, 'usuarios', u.uid), datos, { merge: true }); } catch (e) { console.warn(e); }
    let rol = 'usuario', rama = '';
    try {
      const r = await F.getDoc(F.doc(db, 'roles', u.uid));
      if (r.exists()) { rol = r.data().rol || 'usuario'; rama = r.data().rama || ''; }
    } catch (e) { console.warn(e); }
    return { uid: u.uid, nombre: u.displayName || u.email, email: u.email, foto: u.photoURL, rol, rama };
  }

  return {
    modo: 'firebase',
    onUsuario(cb) {
      return A.onAuthStateChanged(auth, async (u) => cb(u ? await perfil(u) : null));
    },
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
    salir() { return A.signOut(auth); },

    // Eventos desde hace un año en adelante, en tiempo real.
    onEventos(desdeISO, cb, onError) {
      const q = F.query(F.collection(db, 'eventos'), F.where('fecha', '>=', desdeISO), F.orderBy('fecha'));
      return F.onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
    },
    async guardarEvento(id, datos, flyer, user) {
      const ref = id ? F.doc(db, 'eventos', id) : F.doc(F.collection(db, 'eventos'));
      const b = F.writeBatch(db);
      const ev = { ...datos };
      if (flyer === null) { ev.thumb = ''; ev.tieneFlyer = false; b.delete(F.doc(db, 'flyers', ref.id)); }
      else if (flyer) { ev.thumb = flyer.thumb; ev.tieneFlyer = true; b.set(F.doc(db, 'flyers', ref.id), { data: flyer.full, subidoPor: user.uid }); }
      if (id) {
        ev.actualizado = F.serverTimestamp();
        b.update(ref, ev);
      } else {
        ev.autorUid = user.uid;
        ev.autorNombre = user.nombre || '';
        ev.creado = F.serverTimestamp();
        if (!('thumb' in ev)) { ev.thumb = ''; ev.tieneFlyer = false; }
        b.set(ref, ev);
      }
      await b.commit();
      return ref.id;
    },
    async borrarEvento(id) {
      const b = F.writeBatch(db);
      b.delete(F.doc(db, 'eventos', id));
      b.delete(F.doc(db, 'flyers', id));
      await b.commit();
    },
    async flyer(id) {
      const d = await F.getDoc(F.doc(db, 'flyers', id));
      return d.exists() ? d.data().data : null;
    },

    // Solo para el administrador.
    async usuarios() {
      const [us, rs] = await Promise.all([F.getDocs(F.collection(db, 'usuarios')), F.getDocs(F.collection(db, 'roles'))]);
      const roles = {};
      rs.forEach((d) => { roles[d.id] = d.data(); });
      return us.docs.map((d) => ({ uid: d.id, ...d.data(), rol: (roles[d.id] && roles[d.id].rol) || 'usuario', rama: (roles[d.id] && roles[d.id].rama) || '' }))
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
    },
    async asignarRol(u, rol, rama, admin) {
      const ref = F.doc(db, 'roles', u.uid);
      if (rol === 'usuario') return F.deleteDoc(ref);
      return F.setDoc(ref, { rol, rama: rama || '', nombre: u.nombre || '', email: u.email || '', asignadoPor: admin.uid, fecha: F.serverTimestamp() });
    }
  };
}

/* ======================= Demostración ======================= */
function crearDemo() {
  const KEY = 'jm-demo-eventos-v1';
  const KEY_ROL = 'jm-demo-rol';
  const KEY_US = 'jm-demo-usuarios-v1';
  let oyentesEv = [], oyentesUs = [];

  const leer = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || def; } catch (e) { return def; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio o modo privado */ } };

  function iso(d) { return d.toISOString().slice(0, 10); }
  function dia(offset) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return iso(d); }

  function flyerEjemplo(titulo, color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${color}"/>` +
      `<circle cx="200" cy="190" r="110" fill="#FEC45E"/><path d="M60 250 C160 225 260 225 340 245 L340 275 C260 255 160 255 60 280Z" fill="#8AC0E4"/>` +
      `<path d="M200 120 L270 225 L258 240 L250 330 L150 330 L142 240 L130 225Z" fill="#205487" stroke="#fff" stroke-width="6"/>` +
      `<text x="200" y="400" font-family="Montserrat,Arial" font-size="30" font-weight="800" fill="#fff" text-anchor="middle">${titulo}</text>` +
      `<text x="200" y="440" font-family="Montserrat,Arial" font-size="18" font-weight="600" fill="#DCEBF7" text-anchor="middle">JM Argentina · ejemplo</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function semilla() {
    const f1 = flyerEjemplo('Jornada Nacional', '#1B1F4F');
    const f2 = flyerEjemplo('Misión de verano', '#205487');
    return [
      { id: 'd1', titulo: 'Encuentro de jefes de rama · Región Centro', fecha: dia(3), hora: '10:00', lugar: 'Santuario de la Solidaridad, Córdoba', rama: 'JM Córdoba', tipo: 'Regional', descripcion: 'Evento de ejemplo. Jornada para jefes y subjefes de las ramas de la región: formación, planificación del año y misa en el santuario.', costo: '$8.000 con almuerzo', link: '', info: 'Traer mate y cuaderno.', thumb: '', tieneFlyer: false, autorUid: 'demo-jefe', autorNombre: 'Jefe de ejemplo' },
      { id: 'd2', titulo: 'Rosario y misa de la Alianza', fecha: dia(9), hora: '19:30', lugar: 'Santuario Confidentia', rama: 'JM Confidentia', tipo: 'Rama', descripcion: 'Evento de ejemplo. Renovamos la Alianza de Amor como rama, abierto a todos los grupos de vida.', costo: 'Gratis', link: '', info: '', thumb: '', tieneFlyer: false, autorUid: 'demo-otro', autorNombre: 'Otro jefe' },
      { id: 'd3', titulo: 'Jornada Nacional de Jefes', fecha: dia(18), fechaFin: dia(20), hora: '09:00', lugar: 'Nuevo Schoenstatt, Florencio Varela', rama: 'JM Argentina (Nacional)', tipo: 'Nacional', descripcion: 'Evento de ejemplo. Encuentro nacional de jefes de rama de todo el país.', costo: '$45.000 aprox. (alojamiento y comidas)', link: 'https://forms.gle/', info: 'Cada rama coordina el viaje. Consultá a tu jefe.', thumb: f1, tieneFlyer: true, autorUid: 'demo-admin', autorNombre: 'Administrador' },
      { id: 'd4', titulo: 'Campamento de Pioneros', fecha: dia(26), fechaFin: dia(28), hora: '', lugar: 'Por confirmar', rama: 'JM Salta', tipo: 'Rama', descripcion: 'Evento de ejemplo. Tres días de campamento para la rama de Pioneros.', costo: '$30.000', link: '', info: 'Autorización de padres obligatoria.', thumb: '', tieneFlyer: false, autorUid: 'demo-jefe', autorNombre: 'Jefe de ejemplo' },
      { id: 'd5', titulo: 'Misión de verano', fecha: dia(70), fechaFin: dia(78), hora: '', lugar: 'Interior de Chaco', rama: 'JM Resistencia', tipo: 'Regional', descripcion: 'Evento de ejemplo. Misión en parajes rurales junto a las parroquias de la zona.', costo: 'A confirmar', link: '', info: '', thumb: f2, tieneFlyer: true, autorUid: 'demo-otro', autorNombre: 'Otro jefe' }
    ].map((e) => { e._flyer = e.thumb || null; return e; });
  }

  let eventos = leer(KEY, null);
  if (!eventos) { eventos = semilla(); escribir(KEY, eventos); }
  let usuarios = leer(KEY_US, [
    { uid: 'demo-usuario', nombre: 'Usuario de ejemplo', email: 'usuario@ejemplo.com', rol: 'usuario', rama: '' },
    { uid: 'demo-jefe', nombre: 'Jefe de ejemplo', email: 'jefe@ejemplo.com', rol: 'jefe', rama: 'JM Córdoba' },
    { uid: 'demo-otro', nombre: 'Otro jefe', email: 'otro@ejemplo.com', rol: 'jefe', rama: 'JM Confidentia' },
    { uid: 'demo-admin', nombre: 'Administrador', email: 'admin@ejemplo.com', rol: 'admin', rama: '' }
  ]);

  function usuarioActual() {
    const r = localStorage.getItem(KEY_ROL) || 'visitante';
    if (r === 'visitante') return null;
    const u = usuarios.find((x) => x.uid === 'demo-' + r) || usuarios[0];
    return { uid: u.uid, nombre: u.nombre, email: u.email, foto: '', rol: u.rol, rama: u.rama };
  }
  const avisar = () => { const u = usuarioActual(); oyentesUs.forEach((cb) => cb(u)); };
  const avisarEv = () => oyentesEv.forEach((o) => o.cb(eventos.filter((e) => e.fecha >= o.desde).sort((a, b) => a.fecha.localeCompare(b.fecha))));

  return {
    modo: 'demo',
    rolDemo() { return localStorage.getItem(KEY_ROL) || 'visitante'; },
    cambiarRolDemo(r) { try { localStorage.setItem(KEY_ROL, r); } catch (e) {} avisar(); },
    reiniciarDemo() { eventos = semilla(); escribir(KEY, eventos); avisarEv(); },
    onUsuario(cb) { oyentesUs.push(cb); setTimeout(() => cb(usuarioActual()), 0); return () => {}; },
    async ingresar() { this.cambiarRolDemo('usuario'); },
    async salir() { this.cambiarRolDemo('visitante'); },
    onEventos(desde, cb) { const o = { desde, cb }; oyentesEv.push(o); setTimeout(avisarEv, 0); return () => { oyentesEv = oyentesEv.filter((x) => x !== o); }; },
    async guardarEvento(id, datos, flyer, user) {
      let ev;
      if (id) { ev = eventos.find((e) => e.id === id); Object.assign(ev, datos); }
      else { ev = { id: 'd' + Date.now(), ...datos, autorUid: user.uid, autorNombre: user.nombre, thumb: '', tieneFlyer: false, _flyer: null }; eventos.push(ev); }
      if (flyer === null) { ev.thumb = ''; ev.tieneFlyer = false; ev._flyer = null; }
      else if (flyer) { ev.thumb = flyer.thumb; ev.tieneFlyer = true; ev._flyer = flyer.full; }
      escribir(KEY, eventos);
      avisarEv();
      return ev.id;
    },
    async borrarEvento(id) { eventos = eventos.filter((e) => e.id !== id); escribir(KEY, eventos); avisarEv(); },
    async flyer(id) { const e = eventos.find((x) => x.id === id); return e ? e._flyer : null; },
    async usuarios() { return usuarios.slice(); },
    async asignarRol(u, rol, rama) {
      const x = usuarios.find((y) => y.uid === u.uid);
      if (x) { x.rol = rol; x.rama = rol === 'usuario' ? '' : rama; }
      escribir(KEY_US, usuarios);
      avisar();
    }
  };
}
