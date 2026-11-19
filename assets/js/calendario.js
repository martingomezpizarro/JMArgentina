/*
 * Calendario y eventos de JM Argentina.
 * Usa eventos-store.js (Firebase o modo demostración) y data/ramas.json para la lista de ramas.
 */
import { crearStore, rolPuedePublicar } from './eventos-store.js?v=9';

const el = window.JM.el;
const CFG = window.JM_CONFIG || {};
const INSTAGRAM = CFG.instagram || 'https://www.instagram.com/jm.argentina/';
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const RAMA_NACIONAL = 'JM Argentina (Nacional)';

const $ = (id) => document.getElementById(id);
const estado = { user: null, eventos: [], mes: null, diaSel: null, editando: null, flyerNuevo: undefined, ramas: [] };
let store;

/* ---------- Fechas ---------- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const deISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const hoyISO = () => iso(new Date());
function fechaLarga(e) {
  const d = deISO(e.fecha);
  let t = `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  if (e.fechaFin && e.fechaFin !== e.fecha) {
    const f = deISO(e.fechaFin);
    t += ` al ${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
  }
  if (d.getFullYear() !== new Date().getFullYear()) t += ` de ${d.getFullYear()}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function cubreDia(e, dISO) { return e.fecha <= dISO && (e.fechaFin && e.fechaFin >= e.fecha ? e.fechaFin : e.fecha) >= dISO; }

/* ---------- Filtros ---------- */
function filtrados() {
  const r = $('fRama').value, t = $('fTipo').value;
  return estado.eventos.filter((e) => (!r || e.rama === r) && (!t || e.tipo === t));
}
const claseTipo = (e) => 't-' + String(e.tipo || 'Rama').toLowerCase();

/* ---------- Calendario mensual ---------- */
function dibujarMes() {
  const m = estado.mes;
  $('mesTitulo').textContent = `${MESES[m.getMonth()]} ${m.getFullYear()}`;
  const grid = $('calGrid');
  grid.innerHTML = '';
  const primero = new Date(m.getFullYear(), m.getMonth(), 1, 12);
  const inicio = new Date(primero);
  inicio.setDate(1 - ((primero.getDay() + 6) % 7)); // semana empieza el lunes
  const hoy = hoyISO();
  const evs = filtrados();
  const movil = window.matchMedia('(max-width: 760px)').matches;

  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    if (i === 35 && d.getMonth() !== m.getMonth()) break; // no mostrar una sexta semana vacía
    const dIso = iso(d);
    const delDia = evs.filter((e) => cubreDia(e, dIso));
    const celda = el('div', {
      class: 'cal-day' + (d.getMonth() !== m.getMonth() ? ' is-out' : '') + (dIso === hoy ? ' is-today' : '') + (delDia.length ? ' has-ev' : '') + (estado.diaSel === dIso ? ' is-selected' : ''),
      role: delDia.length && movil ? 'button' : null,
      tabindex: delDia.length && movil ? '0' : null,
      'aria-label': delDia.length && movil ? `${d.getDate()} de ${MESES[d.getMonth()]}: ${delDia.length} evento${delDia.length > 1 ? 's' : ''}` : null
    }, [el('span', { class: 'cal-num', text: String(d.getDate()) })]);

    delDia.slice(0, 3).forEach((e) => {
      celda.appendChild(el('button', { class: 'cal-ev ' + claseTipo(e), type: 'button', title: e.titulo, onclick: () => abrirEvento(e) }, [(e.hora && e.fecha === dIso ? e.hora + ' · ' : '') + e.titulo]));
    });
    if (delDia.length > 3) celda.appendChild(el('button', { class: 'cal-more', type: 'button', onclick: () => mostrarDia(dIso) }, [`+${delDia.length - 3} más`]));
    if (delDia.length) {
      celda.appendChild(el('span', { class: 'cal-dots', 'aria-hidden': 'true' }, delDia.slice(0, 3).map((e) => el('i', { class: claseTipo(e) }))));
      const abrirDia = () => { if (window.matchMedia('(max-width: 760px)').matches) mostrarDia(dIso); };
      celda.addEventListener('click', (ev) => { if (ev.target === celda || ev.target.classList.contains('cal-num') || ev.target.closest('.cal-dots')) abrirDia(); });
      celda.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrirDia(); } });
    }
    grid.appendChild(celda);
  }
  if (estado.diaSel) mostrarDia(estado.diaSel, true);
}

function mostrarDia(dIso, sinScroll) {
  estado.diaSel = dIso;
  document.querySelectorAll('.cal-day.is-selected').forEach((c) => c.classList.remove('is-selected'));
  const box = $('diaSeleccionado');
  const evs = filtrados().filter((e) => cubreDia(e, dIso));
  const d = deISO(dIso);
  $('diaTitulo').textContent = `${DIAS[d.getDay()].replace(/^./, (c) => c.toUpperCase())} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const lista = $('diaLista');
  lista.innerHTML = '';
  if (!evs.length) lista.appendChild(el('p', { class: 'muted', text: 'No hay eventos este día.' }));
  evs.forEach((e) => lista.appendChild(tarjeta(e)));
  box.hidden = false;
  if (!sinScroll) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  dibujarSeleccion(dIso);
}
function dibujarSeleccion(dIso) {
  const cells = $('calGrid').children;
  const m = estado.mes;
  const primero = new Date(m.getFullYear(), m.getMonth(), 1, 12);
  const inicio = new Date(primero); inicio.setDate(1 - ((primero.getDay() + 6) % 7));
  for (let i = 0; i < cells.length; i++) {
    const d = new Date(inicio); d.setDate(inicio.getDate() + i);
    cells[i].classList.toggle('is-selected', iso(d) === dIso);
  }
}

/* ---------- Lista de próximos ---------- */
function tarjeta(e) {
  const d = deISO(e.fecha);
  return el('button', { class: 'ev-card ' + claseTipo(e), type: 'button', onclick: () => abrirEvento(e) }, [
    el('span', { class: 'ev-date' }, [el('b', { text: String(d.getDate()) }), el('span', { text: MES_CORTO[d.getMonth()] })]),
    el('span', { class: 'ev-info' }, [
      el('strong', { text: e.titulo }),
      el('span', { class: 'ev-meta' }, [
        el('span', { text: fechaLarga(e) + (e.hora ? ' · ' + e.hora + ' h' : '') }),
        e.lugar ? el('span', { text: '📍 ' + e.lugar }) : null
      ]),
      el('span', { class: 'row', style: 'gap:6px' }, [
        el('span', { class: 'tag ' + (e.tipo === 'Nacional' ? 'tag--sun' : e.tipo === 'Regional' ? 'tag--celeste' : 'tag--suave'), text: e.tipo === 'Rama' ? 'De una rama' : e.tipo }),
        el('span', { class: 'tag tag--suave', text: e.rama }),
        e.costo ? el('span', { class: 'tag tag--crema', text: e.costo }) : null
      ])
    ]),
    e.thumb ? el('img', { class: 'ev-thumb', src: e.thumb, alt: '', loading: 'lazy' }) : null
  ]);
}

function dibujarProximos() {
  const box = $('proximos');
  box.innerHTML = '';
  const hoy = hoyISO();
  const prox = filtrados().filter((e) => (e.fechaFin || e.fecha) >= hoy).slice(0, 20);
  if (!prox.length) {
    box.appendChild(el('div', { class: 'empty-box' }, [
      el('strong', { text: 'Todavía no hay eventos próximos.' }), el('br'),
      'Si sos jefe de rama, publicá el primero con el botón “Publicar evento”.'
    ]));
    return;
  }
  prox.forEach((e) => box.appendChild(tarjeta(e)));
}

function redibujar() { dibujarMes(); dibujarProximos(); }

/* ---------- Detalle ---------- */
function linkGoogleCalendar(e) {
  const f = (s) => s.replace(/-/g, '');
  let dates;
  if (e.hora) {
    const ini = f(e.fecha) + 'T' + e.hora.replace(':', '') + '00';
    const fin = e.fechaFin && e.fechaFin !== e.fecha ? f(e.fechaFin) + 'T230000' : f(e.fecha) + 'T' + pad(Math.min(23, Number(e.hora.slice(0, 2)) + 2)) + e.hora.slice(3) + '00';
    dates = ini + '/' + fin;
  } else {
    const fin = deISO(e.fechaFin || e.fecha); fin.setDate(fin.getDate() + 1);
    dates = f(e.fecha) + '/' + f(iso(fin));
  }
  const p = new URLSearchParams({ action: 'TEMPLATE', text: e.titulo, dates, details: (e.descripcion || '') + (e.link ? '\n\nInscripción: ' + e.link : '') + '\n\nJM Argentina', location: e.lugar || '', ctz: 'America/Argentina/Buenos_Aires' });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}

function puedeEditar(e) {
  const u = estado.user;
  return !!u && (u.rol === 'admin' || (u.rol === 'jefe' && e.autorUid === u.uid));
}

async function abrirEvento(e) {
  const body = $('mEventoBody');
  $('mEventoTitulo').textContent = e.titulo;
  body.innerHTML = '';
  const img = el('img', { class: 'ev-detail-flyer', alt: 'Flyer de ' + e.titulo, hidden: !e.thumb, src: e.thumb || null });
  body.appendChild(img);
  if (e.tieneFlyer) store.flyer(e.id).then((src) => { if (src) { img.src = src; img.hidden = false; } }).catch(() => {});

  body.appendChild(el('div', { class: 'row', style: 'gap:6px' }, [
    el('span', { class: 'tag ' + (e.tipo === 'Nacional' ? 'tag--sun' : e.tipo === 'Regional' ? 'tag--celeste' : 'tag--suave'), text: e.tipo === 'Rama' ? 'De una rama' : e.tipo }),
    el('span', { class: 'tag tag--suave', text: e.rama })
  ]));
  const kv = el('dl', { class: 'kv' });
  const fila = (k, v) => { if (v) { kv.appendChild(el('dt', { text: k })); kv.appendChild(el('dd', {}, [v])); } };
  fila('Cuándo', fechaLarga(e) + (e.hora ? ' · ' + e.hora + ' h' : ''));
  fila('Dónde', e.lugar);
  fila('Costo estimado', e.costo);
  fila('Inscripción', e.link ? el('a', { href: e.link, target: '_blank', rel: 'noopener', text: 'Abrir formulario ↗' }) : null);
  fila('Publicado por', e.autorNombre);
  body.appendChild(kv);
  body.appendChild(el('p', { style: 'white-space:pre-line', text: e.descripcion || '' }));
  if (e.info) body.appendChild(el('div', { class: 'card card--tint', style: 'padding:16px;gap:6px' }, [el('strong', { text: 'Información extra' }), el('p', { style: 'white-space:pre-line', text: e.info })]));

  const acciones = el('div', { class: 'row', style: 'gap:10px' }, [
    el('a', { class: 'btn btn--primary btn--sm', href: linkGoogleCalendar(e), target: '_blank', rel: 'noopener', text: 'Agregar a mi Google Calendar' })
  ]);
  if (navigator.share) {
    acciones.appendChild(el('button', { class: 'btn btn--outline btn--sm', type: 'button', text: 'Compartir', onclick: () => navigator.share({ title: e.titulo, text: `${e.titulo} · ${fechaLarga(e)}`, url: location.href.split('#')[0] + '#ev-' + e.id }).catch(() => {}) }));
  }
  if (puedeEditar(e)) {
    acciones.appendChild(el('button', { class: 'btn btn--outline btn--sm', type: 'button', text: 'Editar', onclick: () => { $('mEvento').close(); abrirFormulario(e); } }));
    acciones.appendChild(el('button', {
      class: 'btn btn--sm', style: 'background:#FCE8E4;color:#8A2D1A', type: 'button', text: 'Borrar',
      onclick: async () => {
        if (!confirm(`¿Borrar “${e.titulo}”? No se puede deshacer.`)) return;
        try { await store.borrarEvento(e.id); $('mEvento').close(); } catch (err) { alert('No se pudo borrar: ' + mensajeError(err)); }
      }
    }));
  }
  body.appendChild(acciones);
  if (!$('mEvento').open) $('mEvento').showModal();
  history.replaceState(null, '', '#ev-' + e.id);
}

/* ---------- Sesión ---------- */
function etiquetaRol(u) {
  if (!u) return '';
  if (u.rol === 'admin') return 'Administrador';
  if (u.rol === 'jefe') return 'Jefe de rama' + (u.rama ? ' · ' + u.rama : '');
  return 'Usuario';
}

function dibujarSesion() {
  const box = $('session');
  box.innerHTML = '';
  const u = estado.user;
  if (!u) {
    box.appendChild(el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: ingresar }, [iconoGoogle(), 'Ingresar con Google']));
  } else {
    box.appendChild(el('span', { class: 'user-chip' }, [
      u.foto ? el('img', { src: u.foto, alt: '', referrerpolicy: 'no-referrer' }) : el('span', { class: 'avatar', text: (u.nombre || '?').charAt(0).toUpperCase() }),
      el('span', {}, [u.nombre, el('br'), el('span', { style: 'font-size:12px;color:var(--texto-claro);font-weight:500', text: etiquetaRol(u) })])
    ]));
    box.appendChild(el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Salir', onclick: () => store.salir() }));
  }
  $('btnAdmin').hidden = !(u && u.rol === 'admin');
  $('btnRegistro').hidden = !(u && u.rol === 'admin');
}

function iconoGoogle() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 48 48'); s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>';
  return s;
}

async function ingresar() {
  try { await store.ingresar(); }
  catch (err) { alert('No se pudo ingresar: ' + mensajeError(err)); }
}

function mensajeError(err) {
  const c = err && err.code;
  if (c === 'permission-denied' || c === 'firestore/permission-denied') return 'tu cuenta no tiene permiso para hacer esto. Pedile al administrador que te habilite como jefe de rama.';
  if (c === 'auth/unauthorized-domain') return 'este dominio todavía no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'parece que no hay conexión. Probá de nuevo.';
  return (err && err.message) || 'error desconocido';
}

/* ---------- Publicar ---------- */
function clicPublicar() {
  if (rolPuedePublicar(estado.user)) { abrirFormulario(null); return; }
  const body = $('mAvisoBody');
  body.innerHTML = '';
  body.appendChild(el('p', { text: 'Los eventos los publican los jefes de rama. Comunicate con tu jefe de rama o escribinos por Instagram para solicitar un nuevo evento.' }));
  const acciones = el('div', { class: 'stack', style: 'gap:10px' });
  acciones.appendChild(el('a', { class: 'btn btn--primary', href: INSTAGRAM, target: '_blank', rel: 'noopener', text: 'Escribir a @jm.argentina en Instagram' }));
  if (!estado.user) {
    body.appendChild(el('p', { class: 'small muted', text: '¿Sos jefe de rama? Ingresá con tu cuenta de Google. Si ya te habilitaron, vas a poder publicar enseguida.' }));
    acciones.appendChild(el('button', { class: 'btn btn--outline', type: 'button', onclick: () => { $('mAviso').close(); ingresar(); } }, [iconoGoogle(), 'Ingresar con Google (jefes)']));
  } else {
    body.appendChild(el('p', { class: 'small muted', text: `Ingresaste como ${estado.user.email || estado.user.nombre}, pero tu cuenta todavía no está habilitada como jefe de rama. Si sos jefe, pedile al administrador de la página que te habilite.` }));
  }
  body.appendChild(acciones);
  $('mAviso').showModal();
}

function llenarSelectRamas(sel, valor, conVacio) {
  sel.innerHTML = '';
  if (conVacio) sel.appendChild(el('option', { value: '', text: conVacio }));
  [RAMA_NACIONAL].concat(estado.ramas).forEach((r) => sel.appendChild(el('option', { value: r, text: r })));
  if (valor && ![...sel.options].some((o) => o.value === valor)) sel.appendChild(el('option', { value: valor, text: valor }));
  if (valor !== undefined) sel.value = valor;
}

function abrirFormulario(e) {
  const f = $('fEvento');
  f.reset();
  estado.editando = e;
  estado.flyerNuevo = undefined;
  $('fMsg').innerHTML = '';
  $('mFormTitulo').textContent = e ? 'Editar evento' : 'Publicar evento';
  $('fSubmit').textContent = e ? 'Guardar cambios' : 'Publicar evento';
  const u = estado.user;
  llenarSelectRamas($('eRama'), e ? e.rama : (u.rama || (u.rol === 'admin' ? RAMA_NACIONAL : '')));
  if (e) {
    ['titulo', 'fecha', 'fechaFin', 'hora', 'lugar', 'tipo', 'descripcion', 'costo', 'link', 'info'].forEach((k) => { if (f.elements[k]) f.elements[k].value = e[k] || ''; });
  } else {
    f.elements.tipo.value = u.rol === 'admin' ? 'Nacional' : 'Rama';
  }
  mostrarFlyer(e && e.thumb ? e.thumb : null);
  if (e && e.tieneFlyer) store.flyer(e.id).then((src) => { if (src && estado.flyerNuevo === undefined) mostrarFlyer(src); }).catch(() => {});
  $('mForm').showModal();
  $('eTitulo').focus();
}

function mostrarFlyer(src) {
  const img = $('flyerPrev');
  if (src) { img.src = src; img.hidden = false; $('flyerTxt').hidden = true; $('flyerQuitar').hidden = false; }
  else { img.removeAttribute('src'); img.hidden = true; $('flyerTxt').hidden = false; $('flyerQuitar').hidden = true; }
}

function cargarImagen(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}
function achicar(img, lado, maxChars) {
  const esc = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * esc);
  c.height = Math.round(img.naturalHeight * esc);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  let q = 0.85, out = c.toDataURL('image/jpeg', q);
  while (out.length > maxChars && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
  if (out.length > maxChars) return achicar(img, Math.round(lado * 0.75), maxChars);
  return out;
}

async function elegirFlyer(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { $('fMsg').innerHTML = '<p class="form-msg form-msg--error">El archivo tiene que ser una imagen (JPG o PNG).</p>'; return; }
  try {
    const img = await cargarImagen(file);
    const full = achicar(img, 1400, 900000);   // < 1 MB, límite de un documento de Firestore
    const thumb = achicar(img, 320, 45000);
    estado.flyerNuevo = { full, thumb };
    mostrarFlyer(full);
    $('fMsg').innerHTML = '';
  } catch (err) {
    $('fMsg').innerHTML = '<p class="form-msg form-msg--error">' + err.message + '</p>';
  }
}

async function enviarFormulario(ev) {
  ev.preventDefault();
  const f = ev.target;
  const v = (k) => (f.elements[k].value || '').trim();
  const datos = {
    titulo: v('titulo'), fecha: v('fecha'), fechaFin: v('fechaFin'), hora: v('hora'), lugar: v('lugar'),
    rama: v('rama'), tipo: v('tipo'), descripcion: v('descripcion'), costo: v('costo'), link: v('link'), info: v('info')
  };
  const faltan = [];
  if (!datos.titulo) faltan.push('el nombre');
  if (!datos.fecha) faltan.push('la fecha');
  if (!datos.rama) faltan.push('la rama');
  if (!datos.descripcion) faltan.push('la descripción');
  if (datos.fechaFin && datos.fechaFin < datos.fecha) faltan.push('una fecha de fin posterior al inicio');
  if (datos.link && !/^https?:\/\//i.test(datos.link)) faltan.push('un link que empiece con https://');
  if (faltan.length) { $('fMsg').innerHTML = '<p class="form-msg form-msg--error">Falta completar ' + faltan.join(', ') + '.</p>'; return; }
  if (datos.fechaFin === datos.fecha) datos.fechaFin = '';

  const btn = $('fSubmit');
  btn.disabled = true;
  const txt = btn.textContent;
  btn.textContent = 'Guardando…';
  try {
    const id = await store.guardarEvento(estado.editando ? estado.editando.id : null, datos, estado.flyerNuevo, estado.user);
    $('mForm').close();
    estado.mes = new Date(deISO(datos.fecha).getFullYear(), deISO(datos.fecha).getMonth(), 1, 12);
    redibujar();
    const nuevo = estado.eventos.find((x) => x.id === id);
    if (nuevo) abrirEvento(nuevo);
  } catch (err) {
    $('fMsg').innerHTML = '<p class="form-msg form-msg--error">No se pudo guardar: ' + mensajeError(err) + '</p>';
  } finally {
    btn.disabled = false;
    btn.textContent = txt;
  }
}

/* ---------- Administrador ---------- */
let usuariosCache = [];
let invitacionesCache = [];
const MAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function abrirAdmin() {
  if (!$('mAdmin').open) $('mAdmin').showModal();
  llenarSelectRamas($('invRama'), $('invRama').value || '', 'Elegí la rama');
  $('adminLista').innerHTML = '<p class="muted">Cargando…</p>';
  try {
    [usuariosCache, invitacionesCache] = await Promise.all([store.usuarios(), store.invitaciones().catch(() => [])]);
    dibujarPendientes();
    dibujarAdmin();
  } catch (err) {
    $('adminLista').innerHTML = '';
    $('adminLista').appendChild(el('p', { class: 'form-msg form-msg--error', text: 'No se pudo cargar la lista: ' + mensajeError(err) }));
  }
}

function etiquetaInv(i) {
  return i.rol === 'admin' ? 'Administrador' : 'Jefe de rama · ' + (i.rama || 'sin rama');
}

function dibujarPendientes() {
  const box = $('adminPendientes');
  box.innerHTML = '';
  if (!invitacionesCache.length) return;
  box.appendChild(el('strong', { text: 'Habilitados por mail que todavía no ingresaron' }));
  invitacionesCache.forEach((i) => {
    const quitar = el('button', { class: 'btn btn--outline btn--sm', type: 'button', text: 'Quitar', onclick: async () => {
      if (!confirm(`¿Quitar la habilitación de ${i.email}?`)) return;
      quitar.disabled = true;
      try { await store.borrarInvitacion(i.email); invitacionesCache = invitacionesCache.filter((x) => x.email !== i.email); dibujarPendientes(); }
      catch (err) { quitar.disabled = false; alert('No se pudo quitar: ' + mensajeError(err)); }
    } });
    box.appendChild(el('div', { class: 'admin-row' }, [
      el('div', { class: 'who' }, [el('strong', { text: i.email }), el('span', { text: etiquetaInv(i) + ' · pendiente de primer ingreso' })]),
      quitar
    ]));
  });
}

async function enviarInvitacion(ev) {
  ev.preventDefault();
  const email = $('invEmail').value.trim().toLowerCase();
  const rol = $('invRol').value;
  const rama = $('invRama').value;
  const msg = $('invMsg');
  const decir = (t, color) => { msg.textContent = t; msg.style.color = color; };
  if (!MAIL_OK.test(email)) { decir('Revisá el correo.', '#8A2D1A'); return; }
  if (rol === 'jefe' && !rama) { decir('Elegí la rama.', '#8A2D1A'); return; }
  const btn = $('invBoton');
  btn.disabled = true;
  decir('Guardando…', 'var(--gris)');
  try {
    const existente = usuariosCache.find((u) => (u.email || '').toLowerCase() === email);
    if (existente) {
      await store.asignarRol(existente, rol, rol === 'admin' ? '' : rama, estado.user);
      decir(`✓ ${existente.nombre || email} ya había ingresado: quedó habilitado. Que recargue la página.`, '#1F5C3B');
    } else {
      await store.invitar(email, rol, rol === 'admin' ? '' : rama, estado.user);
      decir('✓ Listo. Queda habilitado la primera vez que ingrese con Google con ese correo.', '#1F5C3B');
    }
    $('invEmail').value = '';
    await abrirAdmin();
  } catch (err) {
    decir('Error: ' + mensajeError(err), '#8A2D1A');
  } finally {
    btn.disabled = false;
  }
}

function dibujarAdmin() {
  const q = window.JM.norm($('adminBuscar').value);
  const box = $('adminLista');
  box.innerHTML = '';
  const lista = usuariosCache.filter((u) => !q || window.JM.norm(u.nombre + ' ' + u.email).includes(q));
  if (!lista.length) { box.appendChild(el('p', { class: 'muted', text: 'No hay usuarios que coincidan. Si la persona todavía no ingresó, habilitala por mail con el formulario de arriba.' })); return; }
  lista.forEach((u) => {
    const yo = estado.user && u.uid === estado.user.uid;
    const selRol = el('select', { 'aria-label': 'Rol de ' + u.nombre, disabled: yo }, [
      el('option', { value: 'usuario', text: 'Usuario' }),
      el('option', { value: 'jefe', text: 'Jefe de rama' }),
      el('option', { value: 'admin', text: 'Administrador' })
    ]);
    selRol.value = u.rol || 'usuario';
    const selRama = el('select', { 'aria-label': 'Rama de ' + u.nombre, disabled: yo });
    llenarSelectRamas(selRama, u.rama || '', 'Elegí la rama');
    selRama.hidden = selRol.value === 'usuario';
    const msg = el('span', { class: 'small', style: 'font-weight:700' });
    const guardar = async () => {
      selRama.hidden = selRol.value === 'usuario';
      if (selRol.value === 'jefe' && !selRama.value) { msg.textContent = 'Elegí la rama'; msg.style.color = 'var(--amarillo-texto)'; return; }
      msg.textContent = 'Guardando…'; msg.style.color = 'var(--gris)';
      try {
        await store.asignarRol(u, selRol.value, selRama.value, estado.user);
        u.rol = selRol.value; u.rama = selRol.value === 'usuario' ? '' : selRama.value;
        msg.textContent = '✓ Guardado'; msg.style.color = '#1F5C3B';
      } catch (err) { msg.textContent = 'Error: ' + mensajeError(err); msg.style.color = '#8A2D1A'; }
    };
    selRol.addEventListener('change', guardar);
    selRama.addEventListener('change', guardar);
    box.appendChild(el('div', { class: 'admin-row' }, [
      el('div', { class: 'who' }, [el('strong', { text: (u.nombre || 'Sin nombre') + (yo ? ' (vos)' : '') }), el('span', { text: u.email || u.uid })]),
      selRol, selRama, msg
    ]));
  });
}

/* ---------- Registro de cambios (admin) ---------- */
let registroCache = [];
const ROLES_TXT = { usuario: 'Usuario', jefe: 'Jefe de rama', admin: 'Administrador' };
const CAMPOS = {
  titulo: 'Nombre', fecha: 'Fecha', fechaFin: 'Hasta', hora: 'Hora', lugar: 'Lugar', rama: 'Rama', tipo: 'Alcance',
  descripcion: 'Descripción', costo: 'Costo', link: 'Link de inscripción', info: 'Información extra', flyer: 'Flyer',
  nombre: 'Nombre', jefe: 'Jefe de rama', instagram: 'Instagram', encuentros: 'Encuentros', gruposDeVida: 'Grupos de vida',
  actividades: 'Actividades', video: 'Video', contacto: 'Contacto', cantidadFotos: 'Cantidad de fotos', rol: 'Rol'
};
const OCULTOS = ['autorUid', 'autorNombre', 'tieneFlyer', 'actualizadoPor', 'asignadoPor', 'porInvitacion'];

function valorTxt(k, v) {
  if (v === undefined || v === null || v === '') return '—';
  if (k === 'rol') return ROLES_TXT[v] || v;
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' · ') || '—';
  if (typeof v === 'object') return Object.keys(v).map((x) => `${x}: ${v[x]}`).join(' · ') || '—';
  return String(v);
}

function frase(r) {
  const n = r.objetoNombre ? `“${r.objetoNombre}”` : '';
  const verbo = { crear: 'creó', editar: 'editó', borrar: 'borró' }[r.accion] || r.accion;
  if (r.tipo === 'evento') return `${verbo} el evento ${n}` + (r.rama ? ` (${r.rama})` : '');
  if (r.tipo === 'ficha') return `${r.accion === 'crear' ? 'completó por primera vez' : verbo} la ficha de ${r.objetoNombre || 'una rama'}`;
  if (r.tipo === 'invitacion') return r.accion === 'borrar' ? `quitó la habilitación por mail de ${r.objetoNombre}` : `habilitó por mail a ${r.objetoNombre} como ${valorTxt('rol', r.despues && r.despues.rol)}` + (r.rama ? ` de ${r.rama}` : '');
  if (r.tipo === 'rol') {
    if (r.accion === 'aplicar') return `ingresó por primera vez y se activó su habilitación como ${valorTxt('rol', r.despues && r.despues.rol)}` + (r.rama ? ` de ${r.rama}` : '');
    if (r.accion === 'quitar') return `le quitó el rol a ${r.objetoNombre} (era ${valorTxt('rol', r.antes && r.antes.rol)})`;
    return `puso a ${r.objetoNombre} como ${valorTxt('rol', r.despues && r.despues.rol)}` + (r.despues && r.despues.rama ? ` de ${r.despues.rama}` : '');
  }
  return verbo;
}

function tablaCambios(r) {
  const a = r.antes || {}, d = r.despues || {};
  const claves = [...new Set(Object.keys(a).concat(Object.keys(d)))].filter((k) => !OCULTOS.includes(k));
  const filas = [];
  claves.forEach((k) => {
    const va = valorTxt(k, a[k]), vd = valorTxt(k, d[k]);
    if (r.accion === 'editar' && va === vd) return;
    filas.push([CAMPOS[k] || k, r.accion === 'borrar' ? va : vd, r.accion === 'editar' ? va : null]);
  });
  if (!filas.length) return el('p', { class: 'small muted', text: r.nota || 'Sin diferencias en el texto.' });
  const dl = el('dl', { class: 'kv', style: 'font-size:13px' });
  filas.forEach(([k, nuevo, viejo]) => {
    dl.appendChild(el('dt', { text: k }));
    dl.appendChild(el('dd', { style: 'white-space:pre-line;overflow-wrap:anywhere' }, viejo !== null
      ? [el('span', { style: 'text-decoration:line-through;color:#8A2D1A', text: viejo }), el('br'), el('span', { style: 'color:#1F5C3B;font-weight:600', text: nuevo })]
      : [nuevo]));
  });
  const box = el('div', { class: 'stack', style: 'gap:6px' }, [dl]);
  if (r.nota) box.appendChild(el('p', { class: 'small muted', text: r.nota }));
  if (r.accion === 'borrar') box.prepend(el('p', { class: 'small muted', text: 'Así estaba antes de que lo borraran:' }));
  return box;
}

async function abrirRegistro() {
  if (!$('mRegistro').open) $('mRegistro').showModal();
  $('regLista').innerHTML = '<p class="muted">Cargando…</p>';
  try {
    [registroCache, usuariosCache] = await Promise.all([store.registro(300), store.usuarios().catch(() => usuariosCache)]);
    dibujarRegistro();
  } catch (err) {
    $('regLista').innerHTML = '';
    $('regLista').appendChild(el('p', { class: 'form-msg form-msg--error', text: 'No se pudo cargar el registro: ' + mensajeError(err) }));
  }
}

function dibujarRegistro() {
  const tipo = $('regTipo').value;
  const q = window.JM.norm($('regBuscar').value);
  const box = $('regLista');
  box.innerHTML = '';
  const lista = registroCache.filter((r) => (!tipo || r.tipo === tipo || (tipo === 'rol' && r.tipo === 'invitacion'))
    && (!q || window.JM.norm([r.nombre, r.email, r.objetoNombre, r.rama].join(' ')).includes(q)));
  if (!lista.length) { box.appendChild(el('p', { class: 'muted', text: registroCache.length ? 'No hay cambios que coincidan.' : 'Todavía no hay cambios registrados. Se empiezan a anotar desde ahora.' })); return; }
  lista.forEach((r) => {
    const autor = usuariosCache.find((u) => u.uid === r.uid);
    const yo = estado.user && r.uid === estado.user.uid;
    const cuando = r.fecha ? r.fecha.toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recién';
    const det = el('details', {}, [el('summary', { class: 'small', style: 'cursor:pointer;font-weight:700;color:var(--azul)', text: 'Ver qué cambió' }), tablaCambios(r)]);
    const acciones = [];
    if (autor && !yo && autor.rol === 'jefe') {
      const b = el('button', { class: 'btn btn--sm', style: 'background:#FCE8E4;color:#8A2D1A', type: 'button', text: 'Quitar como jefe', onclick: async () => {
        if (!confirm(`¿Quitarle a ${autor.nombre || autor.email} el rol de jefe? Va a dejar de poder publicar eventos y editar la ficha.`)) return;
        b.disabled = true;
        try { await store.asignarRol(autor, 'usuario', '', estado.user); await abrirRegistro(); }
        catch (err) { b.disabled = false; alert('No se pudo quitar: ' + mensajeError(err)); }
      } });
      acciones.push(b);
    }
    box.appendChild(el('div', { class: 'admin-row', style: 'align-items:flex-start' }, [
      el('div', { class: 'who', style: 'gap:2px' }, [
        el('span', { text: cuando }),
        el('strong', { text: (r.nombre || r.email || 'Sin nombre') + (yo ? ' (vos)' : '') }),
        el('span', { text: r.email + (autor && !yo ? ' · hoy: ' + (autor.rol === 'jefe' ? 'Jefe de ' + (autor.rama || 'rama') : ROLES_TXT[autor.rol] || 'Usuario') : '') }),
        el('p', { style: 'margin:4px 0 0;font-size:15px', text: frase(r) }),
        det
      ])
    ].concat(acciones)));
  });
}

/* ---------- Inicio ---------- */
async function iniciar() {
  const ahora = new Date();
  estado.mes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 12);

  try {
    const d = await (await fetch('data/ramas.json')).json();
    estado.ramas = d.ramas.map((r) => r.nombre).sort((a, b) => a.localeCompare(b, 'es'));
  } catch (e) { estado.ramas = []; }
  llenarSelectRamas($('fRama'), '', 'Todas las ramas');

  try {
    store = await crearStore(CFG);
  } catch (err) {
    $('proximos').innerHTML = '';
    $('proximos').appendChild(el('p', { class: 'form-msg form-msg--error', text: 'No se pudo conectar con el calendario. Revisá tu conexión y recargá la página.' }));
    console.error(err);
    return;
  }

  if (store.modo === 'demo') {
    $('demoBar').hidden = false;
    $('demoRol').value = store.rolDemo();
    $('demoRol').addEventListener('change', (e) => store.cambiarRolDemo(e.target.value));
    $('demoReset').addEventListener('click', () => store.reiniciarDemo());
  }

  store.onUsuario((u) => {
    estado.user = u;
    if (store.modo === 'demo') $('demoRol').value = store.rolDemo();
    dibujarSesion();
  });

  const desde = new Date(); desde.setFullYear(desde.getFullYear() - 1);
  store.onEventos(iso(desde), (lista) => {
    estado.eventos = lista;
    redibujar();
    const m = location.hash.match(/^#ev-(.+)$/);
    if (m && !$('mEvento').open) { const e = lista.find((x) => x.id === m[1]); if (e) abrirEvento(e); }
  }, (err) => {
    console.error(err);
    $('proximos').innerHTML = '';
    $('proximos').appendChild(el('p', { class: 'form-msg form-msg--error', text: 'No se pudieron cargar los eventos: ' + mensajeError(err) }));
  });
}

/* ---------- Eventos de la interfaz ---------- */
$('mesPrev').addEventListener('click', () => { estado.mes.setMonth(estado.mes.getMonth() - 1); estado.diaSel = null; $('diaSeleccionado').hidden = true; dibujarMes(); });
$('mesNext').addEventListener('click', () => { estado.mes.setMonth(estado.mes.getMonth() + 1); estado.diaSel = null; $('diaSeleccionado').hidden = true; dibujarMes(); });
$('mesHoy').addEventListener('click', () => { const h = new Date(); estado.mes = new Date(h.getFullYear(), h.getMonth(), 1, 12); dibujarMes(); });
$('fRama').addEventListener('change', redibujar);
$('fTipo').addEventListener('change', redibujar);
$('btnPublicar').addEventListener('click', clicPublicar);
$('btnAdmin').addEventListener('click', abrirAdmin);
$('adminBuscar').addEventListener('input', dibujarAdmin);
$('fInvitar').addEventListener('submit', enviarInvitacion);
$('btnRegistro').addEventListener('click', abrirRegistro);
$('regTipo').addEventListener('change', dibujarRegistro);
$('regBuscar').addEventListener('input', dibujarRegistro);
$('invRol').addEventListener('change', () => { $('invRama').disabled = $('invRol').value === 'admin'; });
$('fEvento').addEventListener('submit', enviarFormulario);
$('eFlyer').addEventListener('change', (e) => elegirFlyer(e.target.files[0]));
$('flyerQuitar').addEventListener('click', (e) => { e.preventDefault(); estado.flyerNuevo = null; $('eFlyer').value = ''; mostrarFlyer(null); });
const drop = $('flyerDrop');
['dragover', 'dragenter'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.style.borderColor = 'var(--azul)'; }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => { drop.style.borderColor = ''; }));
drop.addEventListener('drop', (e) => { e.preventDefault(); elegirFlyer(e.dataTransfer.files[0]); });
document.querySelectorAll('dialog').forEach((d) => {
  // El formulario no se cierra al tocar afuera, para no perder lo escrito.
  if (d.id !== 'mForm') d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  d.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); d.close(); }));
});
$('mEvento').addEventListener('close', () => { if (location.hash.startsWith('#ev-')) history.replaceState(null, '', location.pathname + location.search); });
let anchoPrevio = window.innerWidth;
window.addEventListener('resize', () => { if ((anchoPrevio <= 760) !== (window.innerWidth <= 760)) dibujarMes(); anchoPrevio = window.innerWidth; });

iniciar();
