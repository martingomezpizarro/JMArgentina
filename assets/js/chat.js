/*
 * Asistente en formato chat: botón flotante abajo a la derecha en todas las páginas.
 * Usa el motor (assets/js/motor.js). Cualquier elemento con data-open-chat lo abre.
 */
(function () {
  if (!window.JM_MOTOR) return;
  var el = JM.el, M = window.JM_MOTOR;
  var CFG = window.JM_CONFIG || {};

  var A, pendiente = null, lista = [], mostrados = 0;
  function nuevo() { A = { para: null, rama: null, tema: [], formato: null, texto: '', etapa: null }; }
  nuevo();

  /* ---------- Estructura ---------- */
  var fab = el('button', { type: 'button', class: 'chat-fab', 'aria-controls': 'chatPanel', 'aria-expanded': 'false' }, [
    el('img', { src: 'assets/img/jm-simbolo.svg', alt: '', width: '34', height: '26' }),
    el('span', { text: 'Asistente' })
  ]);
  var log = el('div', { class: 'chat-log', id: 'chatLog', role: 'log', 'aria-live': 'polite' });
  var input = el('input', { type: 'text', class: 'chat-input', id: 'chatInput', placeholder: 'Escribí lo que buscás…', autocomplete: 'off', 'aria-label': 'Mensaje para el asistente' });
  var form = el('form', { class: 'chat-form' }, [input, el('button', { type: 'submit', class: 'chat-send', 'aria-label': 'Enviar', text: '➤' })]);
  var panel = el('section', { class: 'chat-panel', id: 'chatPanel', role: 'dialog', 'aria-label': 'Asistente de material de la JM', hidden: true }, [
    el('header', { class: 'chat-head' }, [
      el('img', { src: 'assets/img/jm-simbolo.svg', alt: '', width: '40', height: '30' }),
      el('div', { class: 'chat-head-text' }, [el('strong', { text: 'Asistente JM' }), el('span', { text: 'Te ayudo a encontrar material' })]),
      el('button', { type: 'button', class: 'chat-reset', title: 'Empezar de nuevo', 'aria-label': 'Empezar de nuevo', text: '↺', onclick: function () { reiniciar(); } }),
      el('button', { type: 'button', class: 'chat-close', 'aria-label': 'Cerrar asistente', text: '✕', onclick: function () { cerrar(); } })
    ]),
    log,
    form
  ]);
  document.body.appendChild(panel);
  document.body.appendChild(fab);

  /* ---------- Mensajes ---------- */
  function scroll() { log.scrollTop = log.scrollHeight; }
  function bot(nodos) {
    var b = el('div', { class: 'msg msg--bot' }, Array.isArray(nodos) ? nodos : [typeof nodos === 'string' ? el('p', { text: nodos }) : nodos]);
    log.appendChild(b); scroll(); return b;
  }
  function yo(texto) { log.appendChild(el('div', { class: 'msg msg--yo' }, [el('p', { text: texto })])); scroll(); }
  function quitarChips() { Array.prototype.forEach.call(log.querySelectorAll('.chat-chips'), function (c) { c.remove(); }); }
  function chips(ops, multi) {
    quitarChips();
    var box = el('div', { class: 'chat-chips' });
    var sel = [];
    ops.forEach(function (o) {
      var b = el('button', { type: 'button', class: 'chat-chip' + (o.primario ? ' is-primary' : ''), text: o.l, 'aria-pressed': multi && !o.fin ? 'false' : null,
        onclick: function () {
          if (multi && !o.fin) {
            var i = sel.indexOf(o.v);
            if (i !== -1) sel.splice(i, 1); else if (sel.length < multi) sel.push(o.v);
            b.setAttribute('aria-pressed', sel.indexOf(o.v) !== -1 ? 'true' : 'false');
            return;
          }
          o.fn(multi ? sel : o.v, o.l);
        } });
      box.appendChild(b);
    });
    log.appendChild(box); scroll();
  }

  /* ---------- Flujo de preguntas ---------- */
  function opsDe(id) { return M.PREGUNTAS.filter(function (p) { return p.id === id; })[0].ops; }

  function saludo() {
    log.textContent = '';
    var ctx = window.JM_CONTEXTO || {};
    bot([el('p', { text: '¡Hola! Soy el asistente de la JM. Te ayudo a encontrar el material justo para tu grupo.' }),
      el('p', { text: 'Contame en una frase qué buscás, o elegí una opción:' })]);
    var ops = [];
    if (ctx.etapa) ops.push({ v: 'etapa', l: 'Material para mi grupo (etapa ' + ctx.etapa + ')', primario: true, fn: function (v, l) { yo(l); A.etapa = ctx.etapa; A.para = 'encuentro'; A.tema = temasDeEtapa(ctx.etapa); preguntarRama(); } });
    opsDe('para').forEach(function (o) { ops.push({ v: o.v, l: o.l, fn: function (v, l) { yo(l); A.para = v; siguiente(); } }); });
    chips(ops);
    pendiente = 'para';
  }

  function temasDeEtapa(e) { return { 1: ['autoconocimiento', 'grupo'], 2: ['alianza', 'maria'], 3: ['grupo', 'idealpersonal'], 4: ['apostolado'] }[e] || []; }

  function siguiente() {
    if (!A.rama) return preguntarRama();
    if (!A.tema.length && A.para !== 'cantar') return preguntarTema();
    if (!A.formato && A.para !== 'cantar' && A.para !== 'retiro' && A.para !== 'rezar') return preguntarFormato();
    resultados();
  }
  function preguntarRama() {
    pendiente = 'rama';
    bot('¿Para quién es?');
    chips(opsDe('rama').map(function (o) { return { v: o.v, l: o.l, fn: function (v, l) { yo(l); A.rama = v; siguiente(); } }; }));
  }
  function preguntarTema() {
    pendiente = 'tema';
    bot([el('p', { text: '¿Sobre qué tema? Podés marcar hasta tres y tocar “Listo”.' })]);
    var ops = Object.keys(M.TEMAS).map(function (k) { return { v: k, l: M.TEMAS[k].l }; });
    ops.push({ l: 'Listo →', fin: true, primario: true, fn: function (sel) {
      if (!sel.length) { bot('Elegí al menos un tema, o escribilo con tus palabras.'); return; }
      A.tema = sel.slice();
      yo(sel.map(function (k) { return M.TEMAS[k].l; }).join(', '));
      siguiente();
    } });
    chips(ops, 3);
  }
  function preguntarFormato() {
    pendiente = 'formato';
    bot('¿Qué tipo de material preferís?');
    chips(opsDe('formato').map(function (o) { return { v: o.v, l: o.l, fn: function (v, l) { yo(l); A.formato = v; siguiente(); } }; }));
  }

  /* ---------- Resultados ---------- */
  function tarjeta(r) {
    var m = r.m, f = r.ficha, link = M.linkMaterial(m);
    var accion = link.abierto
      ? el('a', { class: 'chat-mat-btn', href: link.href, target: '_blank', rel: 'noopener', text: 'Abrir en Drive ↗' })
      : el('button', { type: 'button', class: 'chat-mat-btn chat-mat-btn--alt', 'data-accion': 'solicitar-acceso', 'data-material': m.titulo, text: 'Solicitar acceso' });
    return el('article', { class: 'chat-mat' }, [
      el('div', { class: 'chat-mat-top' }, [el('span', { text: m.carpeta.replace(/^\d+\.\s*/, '').split(' / ').slice(0, 2).join(' · ') }), el('b', { class: 'chat-nivel', text: r.nivel })]),
      el('strong', { text: m.titulo }),
      f && (f.resumen || f.para_que) ? el('p', { text: f.para_que || f.resumen }) : null,
      r.por.length ? el('small', { text: r.por.slice(0, 2).join(' · ') }) : null,
      accion
    ]);
  }

  function resultados() {
    pendiente = null;
    quitarChips();
    M.cargar().then(function () {
      lista = M.recomendar(A, 15);
      mostrados = 0;
      if (!lista.length) {
        bot('Con eso no encontré un material que encaje bien. Probá con otras palabras o elegí otro tema.');
        return finales(false);
      }
      var partes = [];
      if (A.rama && A.rama !== 'cualquiera') partes.push('para ' + M.RAMAS[A.rama].l);
      if (A.tema.length) partes.push('sobre ' + A.tema.map(function (k) { return M.TEMAS[k].l.toLowerCase(); }).join(', '));
      var intro = bot('Esto es lo que te recomiendo' + (partes.length ? ' ' + partes.join(' ') : '') + ':');
      mas();
      log.scrollTop = Math.max(0, intro.offsetTop - 12);
    });
  }
  function mas() {
    var box = el('div', { class: 'chat-mats' });
    lista.slice(mostrados, mostrados + 4).forEach(function (r) { box.appendChild(tarjeta(r)); });
    mostrados += 4;
    var b = bot(box);
    finales(true);
    log.scrollTop = Math.max(0, b.offsetTop - 70);
  }
  function finales(hay) {
    var ops = [];
    if (hay && mostrados < lista.length) ops.push({ l: 'Ver más', fn: function () { yo('Ver más'); mas(); } });
    var nb = M.cuaderno(A);
    if (hay && nb) ops.push({ l: 'Profundizar en NotebookLM', primario: true, fn: function () { yo('Profundizar en NotebookLM'); notebook(nb); } });
    var et = M.etapaDe(A);
    if (et && !/itinerario/.test(location.pathname)) ops.push({ l: 'Leer la etapa ' + et + ' del itinerario', fn: function () { location.href = 'itinerario.html#t-e' + et; } });
    else if (et) ops.push({ l: 'Leer la etapa ' + et + ' del itinerario', fn: function () { cerrar(); location.hash = '#t-e' + et; } });
    ops.push({ l: 'Cambiar la rama', fn: function () { yo('Cambiar la rama'); A.rama = null; preguntarRama(); } });
    ops.push({ l: 'Buscar otra cosa', fn: function () { yo('Buscar otra cosa'); reiniciar(true); } });
    chips(ops);
  }
  function notebook(nb) {
    var prompt = M.preguntaNotebook(A, lista);
    var p = el('p', { class: 'chat-prompt', text: prompt });
    var copy = el('button', { type: 'button', class: 'chat-mat-btn chat-mat-btn--alt', text: 'Copiar pregunta', onclick: function () {
      var ok = function () { copy.textContent = '¡Copiada!'; setTimeout(function () { copy.textContent = 'Copiar pregunta'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(prompt).then(ok, function () {}); else ok();
    } });
    bot([el('p', { text: 'El cuaderno “' + nb.tema + '” tiene las fuentes de este tema. Copiá esta pregunta y pegala ahí:' }), p,
      el('div', { class: 'row', style: 'gap: 8px' }, [copy, el('a', { class: 'chat-mat-btn', href: nb.url, target: '_blank', rel: 'noopener', text: 'Abrir cuaderno ↗' })])]);
    finales(true);
  }

  /* ---------- Texto libre ---------- */
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var t = input.value.trim();
    if (!t) return;
    input.value = '';
    yo(t);
    quitarChips();
    if (pendiente === 'para' || pendiente === null) { var et = A.etapa; nuevo(); A.etapa = et; }
    A.texto = (A.texto ? A.texto + ' ' : '') + t;
    M.inferir(t, A);
    if (!A.tema.length && !A.para) {
      bot('Entiendo. Para afinar, ¿sobre qué tema es?');
      return preguntarTema();
    }
    if (!A.rama) { A.rama = 'cualquiera'; }
    resultados();
  });

  /* ---------- Abrir / cerrar ---------- */
  var iniciado = false;
  function abrir(opts) {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('chat-open');
    if (opts && opts.etapa) { window.JM_CONTEXTO = { etapa: opts.etapa }; iniciado = false; }
    if (!iniciado) { saludo(); iniciado = true; M.cargar(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function cerrar() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('chat-open');
    fab.focus();
  }
  function reiniciar(sinAbrir) { nuevo(); lista = []; saludo(); if (!sinAbrir) input.focus(); }

  fab.addEventListener('click', function () { if (panel.hidden) abrir(); else cerrar(); });
  panel.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') cerrar(); });
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-open-chat]');
    if (!t) return;
    ev.preventDefault();
    var et = parseInt(t.getAttribute('data-etapa') || '', 10);
    abrir(et ? { etapa: et } : null);
  });
  if (location.hash === '#asistente') abrir();

  window.JM_CHAT = { abrir: abrir, cerrar: cerrar };
})();
