/* Historia: línea del tiempo filtrable, símbolos y morfología del símbolo nacional. */
(function () {
  var el = JM.el;
  var CFG = window.JM_CONFIG || {};

  var H = window.JM_HISTORIA || { HITOS: [], ESTRATEGIAS: [] };
  var HITOS = H.HITOS;
  var CATS = ['Todo', 'Corrientes de vida', 'Encuentros nacionales', 'Ideal', 'Símbolo', 'Misiones'];
  var CAT_TAG = { 'Corrientes de vida': 'tag--suave', 'Encuentros nacionales': 'tag--celeste', 'Ideal': 'tag--crema', 'Símbolo': 'tag--sun', 'Misiones': 'tag--verde' };

  var SIMBOLOS = [
    { nombre: 'Santuario', elegido: true, texto: 'Nuestra casa y refugio, la fuente que nos enciende, unidad con Cristo y María.' },
    { nombre: 'Fuego', elegido: true, texto: 'Ser luz y encender a los demás; arder por Cristo y por la Mater.' },
    { nombre: 'Bandera', elegido: true, texto: 'Nuestra identidad, signo de lucha y victoria: celeste de unión, blanco de pureza.' },
    { nombre: 'Abrazo', elegido: false, texto: 'Unidad: Dios presente en la JM en lo más pequeño. Acompañamiento y corrección fraterna.' },
    { nombre: 'Cruz', elegido: false, texto: 'El amor infinito de Dios que marca el camino. Lucha y sacrificio por el bien común.' },
    { nombre: 'Montaña', elegido: false, texto: 'Fuerza y firmeza, el desafío de superarnos. Nos recuerda que somos hombre roca.' }
  ];

  var MORF = [
    { nombre: 'Fuego', titulo: 'FUEGO', img: 'assets/img/jm-fuego.svg', alt: 'Símbolo con el fuego resaltado', texto: 'El fuego de la pasión que se enciende en el interior del Santuario y desde ahí nos envía al mundo. Arde por Cristo y por la Mater.' },
    { nombre: 'Santuario', titulo: 'SANTUARIO', img: 'assets/img/jm-santuario.svg', alt: 'Símbolo con el santuario resaltado', texto: 'El lugar de la Mater. Sin ella no somos nosotros: esa alianza nos distingue. Tiene forma de casa, porque es hogar.' },
    { nombre: 'Bandera', titulo: 'BANDERA', img: 'assets/img/jm-bandera.svg', alt: 'Símbolo con la bandera resaltada', texto: 'El lugar de nuestra misión: transformar nuestro país. La patria es una tarea; desde nuestra realidad, el mundo entero.' },
    { nombre: 'Sol naciente', titulo: 'SOL NACIENTE', img: 'assets/img/jm-sol.svg', alt: 'Símbolo con el sol naciente resaltado', texto: 'El sol de Cristo que ilumina todo desde lo alto. Nuestro horizonte y nuestro norte.' }
  ];

  /* Línea del tiempo */
  var cat = 0;
  var catBox = document.getElementById('catFilters');
  var tl = document.getElementById('timeline');
  function renderTimeline() {
    catBox.textContent = '';
    CATS.forEach(function (l, i) {
      catBox.appendChild(el('button', { type: 'button', class: 'pill', role: 'radio', 'aria-checked': cat === i ? 'true' : 'false', text: l, onclick: function () { cat = i; renderTimeline(); } }));
    });
    tl.textContent = '';
    HITOS.forEach(function (h, i) {
      if (!(cat === 0 || h.cat === CATS[cat])) return;
      tl.appendChild(el('li', { class: h.key ? 'is-key' : '' }, [
        el('span', { class: 'year', text: h.anio }),
        el('button', { type: 'button', class: 'body hito-btn', 'aria-haspopup': 'dialog', onclick: function () { openFicha(i); } }, [
          el('span', { class: 'row', style: 'gap: 8px; align-items: center' }, [el('strong', { text: h.titulo }), el('span', { class: 'tag ' + CAT_TAG[h.cat], text: h.cat })]),
          el('span', { class: 'hito-resumen', text: h.resumen }),
          el('span', { class: 'hito-mas', text: 'Leer la ficha →' })
        ])
      ]));
    });
  }
  renderTimeline();

  /* Ficha de cada hito */
  var dlg = document.getElementById('ficha');
  var cur = 0;
  function visibleIdx() {
    return HITOS.map(function (h, i) { return i; }).filter(function (i) { return cat === 0 || HITOS[i].cat === CATS[cat]; });
  }
  function para(list, box) { (list || []).forEach(function (t) { box.appendChild(el('p', { text: t })); }); }
  function openFicha(i) {
    cur = i;
    var h = HITOS[i];
    var body = document.getElementById('fichaBody');
    body.textContent = '';
    document.getElementById('fichaAnio').textContent = h.anio;
    var tag = document.getElementById('fichaCat');
    tag.className = 'tag ' + CAT_TAG[h.cat]; tag.textContent = h.cat;
    document.getElementById('fichaTitulo').textContent = h.titulo;
    para(h.parrafos, body);
    if (h.lista) body.appendChild(el('ul', null, h.lista.map(function (t) { return el('li', { text: t }); })));
    (h.bloques || []).forEach(function (b) {
      body.appendChild(el('div', { class: 'ficha-bloque' }, [el('strong', { text: b.t }), el('ul', null, b.l.map(function (t) { return el('li', { text: t }); }))]));
    });
    para(h.parrafos2, body);
    if (h.cita) body.appendChild(el('blockquote', { text: '“' + h.cita + '”' }));
    document.getElementById('fichaFuente').textContent = h.fuente ? 'Fuente: ' + h.fuente : (h.pendiente ? 'Ficha pendiente de completar.' : '');
    var v = visibleIdx(), k = v.indexOf(i);
    var prev = document.getElementById('fichaPrev'), next = document.getElementById('fichaNext');
    prev.disabled = k <= 0; next.disabled = k === -1 || k >= v.length - 1;
    prev.textContent = k > 0 ? '← ' + HITOS[v[k - 1]].titulo : '←';
    next.textContent = k < v.length - 1 ? HITOS[v[k + 1]].titulo + ' →' : '→';
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); document.body.classList.add('has-modal'); }
    dlg.querySelector('.modal-inner').scrollTop = 0; dlg.scrollTop = 0;
  }
  function step(d) { var v = visibleIdx(), k = v.indexOf(cur); if (v[k + d] !== undefined) openFicha(v[k + d]); }
  document.getElementById('fichaPrev').addEventListener('click', function () { step(-1); });
  document.getElementById('fichaNext').addEventListener('click', function () { step(1); });
  document.getElementById('fichaClose').addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('close', function () { document.body.classList.remove('has-modal'); });
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight') step(1); if (ev.key === 'ArrowLeft') step(-1); });

  /* Estrategias expandibles */
  var estBox = document.getElementById('estrategias');
  (H.ESTRATEGIAS || []).forEach(function (e, i) {
    var d = el('details', { class: 'estrategia' }, [
      el('summary', null, [
        el('span', { class: 'est-num', text: String(e.n) }),
        el('span', { class: 'est-head' }, [el('strong', { text: e.titulo }), el('span', { text: e.lema })])
      ]),
      el('div', { class: 'est-body' }, [
        el('blockquote', { text: '“' + e.manual + '”' }),
        el('div', null, e.parrafos.map(function (t) { return el('p', { text: t }); })),
        el('strong', { class: 'small', style: 'color: var(--amarillo)', text: 'Cómo se vive' }),
        el('ul', null, e.vivir.map(function (t) { return el('li', { text: t }); })),
        el('a', { href: e.link.href, text: e.link.text + ' →' }),
        el('span', { class: 'small', style: 'color: var(--texto-claro)', text: 'Fuente: Manual de Mística con el Ideal Nacional' })
      ])
    ]);
    estBox.appendChild(d);
  });

  var prop = document.getElementById('proponer');
  if (prop) prop.href = (CFG.contactoAcceso || 'mailto:').replace(/subject=[^&]*/, 'subject=' + encodeURIComponent('Propuesta de hito para la historia de la JM'));

  /* Símbolos de Chaco 2017 */
  var simBox = document.getElementById('simbolos');
  SIMBOLOS.forEach(function (s) {
    simBox.appendChild(el('div', { class: 'card', style: s.elegido ? 'border-color: var(--amarillo)' : '' }, [
      el('div', { class: 'row between', style: 'gap: 8px' }, [el('strong', { style: 'font-size: 20px; font-weight: 800', text: s.nombre }), s.elegido ? el('span', { class: 'tag tag--sun', text: 'En el símbolo' }) : null]),
      el('p', { class: 'small', text: s.texto })
    ]));
  });

  /* Morfología del símbolo */
  var tabsBox = document.getElementById('morphTabs');
  var img = document.getElementById('morphImg');
  var tabBtns = [];
  function pick(i, focus) {
    var m = MORF[i];
    img.src = m.img; img.alt = m.alt;
    document.getElementById('morphTitle').textContent = m.titulo;
    document.getElementById('morphText').textContent = m.texto;
    tabBtns.forEach(function (b, j) { b.setAttribute('aria-selected', i === j ? 'true' : 'false'); b.tabIndex = i === j ? 0 : -1; });
    if (focus) tabBtns[i].focus();
  }
  MORF.forEach(function (m, i) {
    var b = el('button', {
      type: 'button', class: 'pill', role: 'tab', id: 'morph-' + i, 'aria-controls': 'morphPanel', text: m.nombre,
      style: 'min-height: 52px; border-radius: 14px; font-size: 16px',
      onclick: function () { pick(i); },
      onkeydown: function (ev) {
        if (ev.key === 'ArrowRight') pick((i + 1) % MORF.length, true);
        if (ev.key === 'ArrowLeft') pick((i - 1 + MORF.length) % MORF.length, true);
      }
    });
    tabBtns.push(b);
    tabsBox.appendChild(b);
  });
  pick(0);
  // Precarga de las variantes para que el cambio sea inmediato.
  MORF.forEach(function (m) { var p = new Image(); p.src = m.img; });
})();
