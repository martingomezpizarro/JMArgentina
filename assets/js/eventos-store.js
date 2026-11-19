/*
 * Datos del calendario: sesión con Google, roles (admin / jefe), eventos y flyers.
 *
 * Hay dos "motores" con la misma interfaz:
 *  - Firebase (Auth + Firestore), cuando config.js tiene los datos del proyecto.
 *  - Demostración, cuando no los tiene: guarda todo en el navegador para probar la página.
 *
 * Colecciones en Firestore (reglas en firestore.rules):
 *  usuarios/{uid}  nombre, email, foto, ultimoIngreso         (quien ingresó alguna vez)
 *  roles/{uid}     rol ('admin' | 'jefe'), rama, nombre, email (lo escribe un admin, o el propio
 *                  usuario al aplicar su invitación)
 *  invitaciones/{correo}  rol, rama, invitadoPor              (habilitación por mail, antes de ingresar)
 *  eventos/{id}    titulo, fecha, fechaFin, hora, lugar, rama, tipo, descripcion, costo,
 *                  link, info, thumb (miniatura), tieneFlyer, autorUid, autorNombre, creado
 *  flyers/{id}     data (imagen en base64), autorUid       (separado para que la lista cargue rápido)
 */

import { registrarIngreso, entradaRegistro } from './registro.js?v=9';

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
    const { rol, rama } = await registrarIngreso(F, db, u);
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
    // Cada cambio va en el mismo lote que su entrada en registro/ (las reglas lo exigen).
    async guardarEvento(id, datos, flyer, user) {
      const ref = id ? F.doc(db, 'eventos', id) : F.doc(F.collection(db, 'eventos'));
      let antes = null;
      if (id) { try { const d = await F.getDoc(ref); antes = d.exists() ? d.data() : null; } catch (e) { /* sigue sin copia */ } }
      const b = F.writeBatch(db);
      const ev = { ...datos };
      if (flyer === null) { ev.thumb = ''; ev.tieneFlyer = false; b.delete(F.doc(db, 'flyers', ref.id)); }
      else if (flyer) { ev.thumb = flyer.thumb; ev.tieneFlyer = true; b.set(F.doc(db, 'flyers', ref.id), { data: flyer.full, subidoPor: user.uid }); }
      const log = F.doc(F.collection(db, 'registro'));
      ev.registro = log.id;
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
      const despues = { ...(antes || {}), ...ev };
      if (flyer === null) despues.flyer = 'quitado';
      else if (flyer) despues.flyer = 'nuevo';
      b.set(log, entradaRegistro(F, auth.currentUser, {
        tipo: 'evento', accion: id ? 'editar' : 'crear', objetoId: ref.id, objetoNombre: ev.titulo, rama: ev.rama, antes, despues
      }));
      await b.commit();
      return ref.id;
    },
    async borrarEvento(id) {
      const ref = F.doc(db, 'eventos', id);
      let antes = null;
      try { const d = await F.getDoc(ref); antes = d.exists() ? d.data() : null; } catch (e) { /* sigue sin copia */ }
      const b = F.writeBatch(db);
      b.set(F.doc(db, 'registro', 'borrar-evento-' + id), entradaRegistro(F, auth.currentUser, {
        tipo: 'evento', accion: 'borrar', objetoId: id, objetoNombre: antes ? antes.titulo : '', rama: antes ? antes.rama : '', antes
      }));
      b.delete(ref);
      b.delete(F.doc(db, 'flyers', id));
      await b.commit();
    },
    async flyer(id) {
      const d = await F.getDoc(F.doc(db, 'flyers', id));
      return d.exists() ? d.data().data : null;
    },

    // Solo para el administrador.
    // Lista a quienes ingresaron alguna vez y también a quienes tienen rol aunque no figuren en usuarios.
    async usuarios() {
      const [us, rs] = await Promise.all([F.getDocs(F.collection(db, 'usuarios')), F.getDocs(F.collection(db, 'roles'))]);
      const roles = {};
      rs.forEach((d) => { roles[d.id] = d.data(); });
      const lista = us.docs.map((d) => ({ uid: d.id, ...d.data(), rol: (roles[d.id] && roles[d.id].rol) || 'usuario', rama: (roles[d.id] && roles[d.id].rama) || '' }));
      Object.keys(roles).forEach((uid) => {
        if (!lista.some((x) => x.uid === uid)) lista.push({ uid, nombre: roles[uid].nombre || '', email: roles[uid].email || '', rol: roles[uid].rol || 'usuario', rama: roles[uid].rama || '' });
      });
      return lista.sort((a, b) => (a.nombre || a.email || '').localeCompare(b.nombre || b.email || '', 'es'));
    },
    async asignarRol(u, rol, rama, admin) {
      const ref = F.doc(db, 'roles', u.uid);
      // Si había una habilitación por mail pendiente para esta persona, ya no hace falta.
      if (u.email) { try { await F.deleteDoc(F.doc(db, 'invitaciones', u.email.toLowerCase())); } catch (e) { /* no había */ } }
      const b = F.writeBatch(db);
      if (rol === 'usuario') b.delete(ref);
      else b.set(ref, { rol, rama: rama || '', nombre: u.nombre || '', email: u.email || '', asignadoPor: admin.uid, fecha: F.serverTimestamp() });
      b.set(F.doc(F.collection(db, 'registro')), entradaRegistro(F, auth.currentUser, {
        tipo: 'rol', accion: rol === 'usuario' ? 'quitar' : 'asignar', objetoId: u.uid, objetoNombre: u.nombre || u.email || u.uid, rama: rama || '',
        antes: { rol: u.rol || 'usuario', rama: u.rama || '' }, despues: { rol, rama: rol === 'usuario' ? '' : (rama || '') }
      }));
      return b.commit();
    },
    // Habilitaciones por mail de personas que todavía no ingresaron (invitaciones/{correo}).
    async invitaciones() {
      const snap = await F.getDocs(F.collection(db, 'invitaciones'));
      return snap.docs.map((d) => ({ email: d.id, ...d.data() })).sort((a, b) => a.email.localeCompare(b.email));
    },
    async invitar(email, rol, rama, admin) {
      const mail = email.trim().toLowerCase();
      const b = F.writeBatch(db);
      b.set(F.doc(db, 'invitaciones', mail), { rol, rama: rama || '', invitadoPor: admin.uid, invitadoPorNombre: admin.nombre || '', fecha: F.serverTimestamp() });
      b.set(F.doc(F.collection(db, 'registro')), entradaRegistro(F, auth.currentUser, {
        tipo: 'invitacion', accion: 'crear', objetoId: mail, objetoNombre: mail, rama: rama || '', despues: { rol, rama: rama || '' }
      }));
      return b.commit();
    },
    borrarInvitacion(email) {
      const mail = email.toLowerCase();
      const b = F.writeBatch(db);
      b.delete(F.doc(db, 'invitaciones', mail));
      b.set(F.doc(F.collection(db, 'registro')), entradaRegistro(F, auth.currentUser, {
        tipo: 'invitacion', accion: 'borrar', objetoId: mail, objetoNombre: mail
      }));
      return b.commit();
    },
    // Registro de cambios (solo admin), los más recientes primero.
    async registro(cantidad) {
      const q = F.query(F.collection(db, 'registro'), F.orderBy('fecha', 'desc'), F.limit(cantidad || 300));
      const snap = await F.getDocs(q);
      return snap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, ...x, fecha: x.fecha && x.fecha.toDate ? x.fecha.toDate() : null };
      });
    }
  };
}

/* ======================= Demostración ======================= */
function crearDemo() {
  const KEY = 'jm-demo-eventos-v1';
  const KEY_ROL = 'jm-demo-rol';
  const KEY_US = 'jm-demo-usuarios-v1';
  const KEY_INV = 'jm-demo-invitaciones-v1';
  const KEY_LOG = 'jm-demo-registro-v1';
  function anotar(tipo, accion, objetoId, objetoNombre, rama, antes, despues) {
    const u = usuarioActual() || {};
    const log = leer(KEY_LOG, []);
    const copia = (d) => { if (!d) return null; const o = { ...d }; delete o.thumb; delete o._flyer; return o; };
    log.push({ id: 'l' + Date.now() + Math.random().toString(36).slice(2, 6), tipo, accion, objetoId, objetoNombre, rama: rama || '', uid: u.uid || '', nombre: u.nombre || '', email: u.email || '', fecha: new Date().toISOString(), antes: copia(antes), despues: copia(despues) });
    escribir(KEY_LOG, log.slice(-500));
  }
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
      const antesDemo = id ? { ...eventos.find((e) => e.id === id) } : null;
      if (id) { ev = eventos.find((e) => e.id === id); Object.assign(ev, datos); }
      else { ev = { id: 'd' + Date.now(), ...datos, autorUid: user.uid, autorNombre: user.nombre, thumb: '', tieneFlyer: false, _flyer: null }; eventos.push(ev); }
      if (flyer === null) { ev.thumb = ''; ev.tieneFlyer = false; ev._flyer = null; }
      else if (flyer) { ev.thumb = flyer.thumb; ev.tieneFlyer = true; ev._flyer = flyer.full; }
      escribir(KEY, eventos);
      anotar('evento', id ? 'editar' : 'crear', ev.id, ev.titulo, ev.rama, antesDemo, ev);
      avisarEv();
      return ev.id;
    },
    async borrarEvento(id) { const a = eventos.find((e) => e.id === id); eventos = eventos.filter((e) => e.id !== id); escribir(KEY, eventos); if (a) anotar('evento', 'borrar', id, a.titulo, a.rama, a, null); avisarEv(); },
    async flyer(id) { const e = eventos.find((x) => x.id === id); return e ? e._flyer : null; },
    async usuarios() { return usuarios.slice(); },
    async registro() { return leer(KEY_LOG, []).map((x) => ({ ...x, fecha: new Date(x.fecha) })).reverse(); },
    async invitaciones() { return leer(KEY_INV, []); },
    async invitar(email, rol, rama) {
      const mail = email.trim().toLowerCase();
      const inv = leer(KEY_INV, []).filter((x) => x.email !== mail);
      inv.push({ email: mail, rol, rama: rama || '' });
      escribir(KEY_INV, inv);
    },
    async borrarInvitacion(email) { escribir(KEY_INV, leer(KEY_INV, []).filter((x) => x.email !== email.toLowerCase())); },
    async asignarRol(u, rol, rama) {
      const x = usuarios.find((y) => y.uid === u.uid);
      if (x) { anotar('rol', rol === 'usuario' ? 'quitar' : 'asignar', x.uid, x.nombre, rama, { rol: x.rol, rama: x.rama }, { rol, rama }); x.rol = rol; x.rama = rol === 'usuario' ? '' : rama; }
      escribir(KEY_US, usuarios);
      avisar();
    }
  };
}
