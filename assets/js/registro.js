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
        await F.setDoc(F.doc(db, 'roles', u.uid), {
          rol: d.rol, rama: d.rama || '', nombre: u.displayName || '', email,
          asignadoPor: d.invitadoPor || '', fecha: F.serverTimestamp(), porInvitacion: true
        });
        rol = d.rol; rama = d.rama || '';
        try { await F.deleteDoc(inv.ref); } catch (e) { /* queda la invitación, no afecta */ }
      }
    } catch (e) { console.warn('No se pudo aplicar la invitación', e); }
  }
  return { rol, rama };
}
