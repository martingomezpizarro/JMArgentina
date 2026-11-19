/*
 * Perfil arriba a la derecha, en todas las páginas.
 *  - Sin sesión: botón "Ingresar" con Google.
 *  - Con sesión: foto o inicial; al tocarla se abre una fichita con nombre, correo y rol,
 *    accesos según el rol (jefe: publicar evento y su ficha; admin: gestionar jefes y registro)
 *    y "Salir".
 * Lo arma auth.js cuando Firebase está configurado.
 */
const ROLES = { admin: 'Administrador', jefe: 'Jefe de rama', usuario: 'Usuario' };

function el(tag, attrs, children) { return window.JM.el(tag, attrs, children); }

function iconoGoogle() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 48 48'); s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>';
  return s;
}

function avatar(u, clase) {
  return u.foto
    ? el('img', { class: clase, src: u.foto, alt: '', referrerpolicy: 'no-referrer' })
    : el('span', { class: clase + ' perfil-inicial', text: (u.nombre || u.email || '?').charAt(0).toUpperCase() });
}

export function armarPerfil(A) {
  const cont = document.querySelector('.site-header .container');
  if (!cont || document.getElementById('perfil')) return;
  const raiz = el('div', { class: 'perfil', id: 'perfil' });
  cont.appendChild(raiz);
  let abierto = false;

  function cerrar() {
    abierto = false;
    const p = raiz.querySelector('.perfil-panel');
    if (p) p.hidden = true;
    const b = raiz.querySelector('.perfil-btn');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  function ingresar() {
    A.ingresar().catch((e) => alert('No se pudo ingresar: ' + ((e && e.message) || 'error')));
  }

  function dibujar(u) {
    raiz.innerHTML = '';
    if (!A.resuelto()) { raiz.appendChild(el('span', { class: 'perfil-cargando', 'aria-hidden': 'true' })); return; }
    if (!u) {
      raiz.appendChild(el('button', { class: 'perfil-ingresar', type: 'button', onclick: ingresar }, [iconoGoogle(), el('span', { text: 'Ingresar' })]));
      return;
    }
    const btn = el('button', {
      class: 'perfil-btn', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': 'perfilPanel',
      'aria-label': 'Tu perfil: ' + (u.nombre || u.email),
      onclick: (e) => { e.stopPropagation(); abierto = !abierto; panel.hidden = !abierto; btn.setAttribute('aria-expanded', String(abierto)); if (abierto) ubicar(); }
    }, [avatar(u, 'perfil-foto')]);

    const rol = u.rol === 'jefe' ? 'Jefe de rama' + (u.rama ? ' · ' + u.rama : '') : ROLES[u.rol] || 'Usuario';
    const links = [];
    if (u.rol === 'jefe' || u.rol === 'admin') {
      links.push(el('a', { href: 'calendario.html#publicar', text: 'Publicar un evento' }));
    }
    if (u.rol === 'jefe' && u.rama) {
      links.push(el('a', { href: 'ramas.html?rama=' + encodeURIComponent(u.rama), text: 'Ficha de ' + u.rama }));
    }
    if (u.rol === 'admin') {
      links.push(el('a', { href: 'calendario.html#gestionar', text: 'Gestionar jefes' }));
      links.push(el('a', { href: 'calendario.html#registro', text: 'Registro de cambios' }));
    }
    const panel = el('div', { class: 'perfil-panel', id: 'perfilPanel', hidden: true, onclick: (e) => e.stopPropagation() }, [
      el('div', { class: 'perfil-cabeza' }, [
        avatar(u, 'perfil-foto perfil-foto--lg'),
        el('div', { class: 'perfil-datos' }, [
          el('strong', { text: u.nombre || 'Sin nombre' }),
          el('span', { text: u.email || '' }),
          el('span', { class: 'perfil-rol' + (u.rol !== 'usuario' ? ' is-' + u.rol : ''), text: rol })
        ])
      ]),
      links.length ? el('nav', { class: 'perfil-links', 'aria-label': 'Accesos de tu rol' }, links) : null,
      u.rol === 'usuario' ? el('p', { class: 'perfil-nota', text: 'Si sos jefe de rama y todavía no te habilitaron, pedíselo al administrador. Cuando te habilite, recargá la página.' }) : null,
      el('button', { class: 'perfil-salir', type: 'button', text: 'Salir', onclick: () => { cerrar(); A.salir(); } })
    ]);
    raiz.appendChild(btn);
    raiz.appendChild(panel);
    // La fichita se ubica bajo el botón, sin salirse de la pantalla (en el celular el botón no siempre está a la derecha).
    function ubicar() {
      const r = btn.getBoundingClientRect();
      const ancho = panel.offsetWidth;
      const izq = Math.max(12, Math.min(r.right - ancho, window.innerWidth - ancho - 12));
      panel.style.left = (izq - raiz.getBoundingClientRect().left) + 'px';
      panel.style.right = 'auto';
    }
    if (abierto) { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); ubicar(); }
  }

  document.addEventListener('click', () => { if (abierto) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) { cerrar(); const b = raiz.querySelector('.perfil-btn'); if (b) b.focus(); } });
  A.onCambio(dibujar);
}
