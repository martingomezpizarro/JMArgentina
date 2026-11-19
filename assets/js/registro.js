/*
 * Registro de cada ingreso con Google, en cualquier página del sitio.
 *
 *  1. Guarda nombre y correo en usuarios/{uid}, para que el admin lo vea en "Gestionar jefes".
 *  2. Lee su rol en roles/{uid}.
 *  3. Si todavía no tiene rol y el admin lo habilitó por mail (invitaciones/{correo}),
 *     se aplica la invitación: se crea roles/{uid} con ese rol y esa rama, y se borra la invitación.
 *
 * Lo usan auth.js (todas las páginas) y eventos-store.js (calendario). Se ejecuta una sola vez
 * por usuario y por página aunque lo llamen los dos.
 */
const enCurso = new Map();

export function registrarIngreso(F, db, u) {
  if (!enCurso.has(u.uid)) enCurso.set(u.uid, registrar(F, db, u));
  return enCurso.get(u.uid);
}

async function registrar(F, db, u) {
  const email = (u.email || '').toLowerCase();
  try {
    await F.setDoc(F.doc(db, 'usuarios', u.uid),
      { nombre: u.displayName || '', email, foto: u.photoURL || '', ultimoIngreso: F.serverTimestamp() }, { merge: true });
  } catch (e) { console.warn('No se pudo registrar el ingreso', e); }

  let rol = 'usuario', rama = '';
  let tieneRol = false;
  try {
    const r = await F.getDoc(F.doc(db, 'roles', u.uid));
    if (r.exists()) { tieneRol = true; rol = r.data().rol || 'usuario'; rama = r.data().rama || ''; }
  } catch (e) { console.warn(e); }

  if (!tieneRol && email) {
    try {
      const inv = await F.getDoc(F.doc(db, 'invitaciones', email));
      if (inv.exists()) {
        const d = inv.data();
        const b = F.writeBatch(db);
        b.set(F.doc(db, 'roles', u.uid), {
          rol: d.rol, rama: d.rama || '', nombre: u.displayName || '', email,
          asignadoPor: d.invitadoPor || '', fecha: F.serverTimestamp(), porInvitacion: true
        });
        b.set(F.doc(F.collection(db, 'registro')), entradaRegistro(F, u, {
          tipo: 'rol', accion: 'aplicar', objetoId: u.uid, objetoNombre: u.displayName || email, rama: d.rama || '',
          despues: { rol: d.rol, rama: d.rama || '' }, nota: 'Habilitación por mail aplicada en su primer ingreso'
        }));
        await b.commit();
        rol = d.rol; rama = d.rama || '';
        try { await F.deleteDoc(inv.ref); } catch (e) { /* queda la invitación, no afecta */ }
      }
    } catch (e) { console.warn('No se pudo aplicar la invitación', e); }
  }
  return { rol, rama };
}

/*
 * Registro de cambios (colección registro/{id}), solo lo lee el administrador.
 * Cada cambio en eventos y fichas se guarda en el mismo lote que su entrada del registro;
 * las reglas de Firestore rechazan el cambio si falta la entrada (ver firestore.rules).
 *
 *  tipo: 'evento' | 'ficha' | 'rol' | 'invitacion'
 *  accion: 'crear' | 'editar' | 'borrar' | 'asignar' | 'quitar' | 'aplicar'
 *  antes / despues: copia de los datos (sin imágenes), para ver qué cambió y poder restaurarlo.
 */
const SIN_COPIAR = ['thumb', 'creado', 'actualizado', 'fecha_registro', 'registro', 'fotos'];

export function copiaParaRegistro(d) {
  if (!d) return null;
  const out = {};
  Object.keys(d).forEach((k) => {
    if (SIN_COPIAR.includes(k)) return;
    const v = d[k];
    if (v === undefined || typeof v === 'function') return;
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.toDate === 'function') return; // Timestamp
    if (v && typeof v === 'object' && v.constructor && v.constructor.name && /FieldValue|Sentinel/.test(v.constructor.name)) return;
    out[k] = typeof v === 'string' ? v.slice(0, 4000) : v;
  });
  return out;
}

export function entradaRegistro(F, quien, datos) {
  return {
    tipo: datos.tipo,
    accion: datos.accion,
    objetoId: String(datos.objetoId || ''),
    objetoNombre: String(datos.objetoNombre || '').slice(0, 200),
    rama: String(datos.rama || '').slice(0, 120),
    uid: quien.uid,
    nombre: quien.displayName || quien.nombre || '',
    email: (quien.email || '').toLowerCase(),
    fecha: F.serverTimestamp(),
    antes: copiaParaRegistro(datos.antes),
    despues: copiaParaRegistro(datos.despues),
    nota: String(datos.nota || '').slice(0, 300)
  };
}
