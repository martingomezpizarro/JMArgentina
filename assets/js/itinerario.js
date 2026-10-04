/* Itinerario: diagnóstico del grupo, recomendaciones y preguntas frecuentes. */
(function () {
  var el = JM.el;
  var CFG = window.JM_CONFIG || {};
  var D = 'https://drive.google.com/file/d/';
  function u(id, rk) { return D + id + '/view' + (rk ? '?resourcekey=' + rk : ''); }

  /* ---------- Datos ---------- */
  var PREGUNTAS = [
    { e: 1, t: '¿Los miembros se conocen en profundidad: historia de vida, familia, cómo vive cada uno la fe?' },
    { e: 1, t: '¿El grupo vive el encuentro como un lugar distinto, con libertad y confianza para hablar?' },
    { e: 1, t: '¿La Mater y el Santuario tienen un lugar explícito en los encuentros?' },
    { e: 2, t: '¿Conocen la historia de Schoenstatt y qué es la alianza de amor?' },
    { e: 2, t: '¿El grupo (o la mayoría) selló la alianza de amor?' },
    { e: 3, t: '¿Se sostienen unos a otros en lo bueno y en lo malo, también fuera del encuentro?' },
    { e: 3, t: '¿Tienen un ideal o nombre de grupo, o sellaron la alianza fraterna?' },
    { e: 4, t: '¿Llevan adelante juntos un proyecto de apostolado o misión?' },
    { e: 4, t: '¿Proyectan lo vivido en el grupo a su familia, estudio o trabajo?' }
  ];
  var OPCIONES = ['No', 'En parte', 'Sí'];
  var TIEMPOS = ['Menos de 6 meses', '6 meses a 1 año', '1 a 3 años', 'Más de 3 años'];

  var ETAPAS = [
    { nombre: 'Armar la comunidad', objetivo: 'Autoconocimiento y que se conozcan entre ellos; desde ahí se planean las actividades.',
      pasos: ['Dedicar encuentros a la historia de vida y la familia de cada uno.', 'Usar un test de personalidad o temperamentos.', 'Visitar juntos el Santuario y darle un lugar a la Mater.'] },
    { nombre: 'Alianza de amor', objetivo: 'Encaminar al grupo hacia la alianza de amor.',
      pasos: ['Trabajar la historia de Schoenstatt y el 18 de octubre de 1914.', 'Hacer el taller de alianza y preparar el rito.', 'Ayudar a llevar a María al día a día, el propio campo de batalla.'] },
    { nombre: 'Solidaridad de destinos', objetivo: 'Jugársela los unos por los otros, hacia una santidad comunitaria.',
      pasos: ['Discernir un nombre o ideal de grupo.', 'Preparar y sellar la alianza fraterna.', 'Aprender la corrección fraterna y la conciencia de familia.'] },
    { nombre: 'Misión', objetivo: 'Llevar todo el trayecto a la misión: apostolado.',
      pasos: ['Elegir juntos un proyecto de apostolado concreto.', 'Proyectar lo vivido a la familia, el estudio y el trabajo.', 'Revisar el camino recorrido y purificar la misión.'] }
  ];

  // [tipo, título, para qué sirve, url, utilidad (3 = muy útil, 2 = útil)]
  var MATERIAL = {
    1: [
      ['Taller', 'Taller de Autoconocimiento y Autoeducación', 'Taller listo para trabajar el autoconocimiento, objetivo central de la etapa.', u('1cHGJ0E37OZC_qsmZAgCHGTw9-KMghvr-'), 3],
      ['Recurso', 'Test de 4 temperamentos – versión larga', 'El test de personalidad que propone el itinerario como dinámica.', u('1r60HCoDrp9-ahSXulU2dIUE03g7sx8eC'), 3],
      ['Recurso', 'Dinámicas para grupos', 'Dinámicas para presentarse y romper el hielo en los primeros encuentros.', u('1oc0zN9ZoxV6A1DWBOMN40qLmJmKd398Z'), 3],
      ['Taller', 'Taller Introducción a Schoenstatt', 'Para dar un lugar explícito a la Mater y al Santuario desde el inicio.', u('1X3fr8T3B6lG_zGBmoqfsPfO3i9c40WP4'), 2],
      ['Pioneros', 'Pioneros – Manual 2010', 'Para grupos de Pioneros: las etapas bandera, santuario, corona y cruz-espada.', u('1FYLyk8MMAW9mbWhfad67_cXGN7aI6Tvu'), 2],
      ['Secundarios', 'Taller del Hombre Nuevo – Manual', 'Para grupos de Secundarios: el camino formativo de la rama.', u('1KxIdc4CFnkKN-sYeeFOaufvvsgbkEYAO'), 2]
    ],
    2: [
      ['Taller', 'Taller de Alianza', 'Explica qué es la alianza de amor y cómo prepararla en el grupo.', u('1gg2h7fT3GQKuMIw2JcRmt23vASF42Tyw'), 3],
      ['Padre Kentenich', 'Primera Acta de Fundación – Alianza de Amor', 'El texto del 18 de octubre de 1914 para leer y rezar con el grupo.', u('1VTC1sTbQo5_lJuBfQ7MAgzMpRz0ZLiJ5'), 3],
      ['Retiros y ritos', 'Rito Alianza de Amor', 'El rito para el momento de sellar la alianza.', u('1P0AWCBypGMIa3fPKUkTd4iInFfVxBT0J'), 3],
      ['Padre Kentenich', 'El Padre Kentenich explica la Alianza de Amor', 'Textos del fundador para profundizar el sentido de la alianza.', u('1wurvjvuwcLCKsU9Y1N3GvjlZSPwYegHn'), 2],
      ['Taller', 'Taller Conociendo al PK', 'Para conocer la historia de Schoenstatt desde la figura del fundador.', u('1SsT-59ziOq1w5FZzIDo2wwBnddsfVUTO'), 2]
    ],
    3: [
      ['Taller', 'Taller Nombre de grupo', 'Pasos para discernir el nombre o ideal del grupo.', u('1J6Zh_Gv3rmDv9xhewCoAZZFjHgMTt1h-'), 3],
      ['Taller', 'Preguntas para sacar nombre de grupo', 'Preguntas guía para el discernimiento del ideal de grupo.', u('1HOfzKzhpx2CF4ClyMIvUFmBApGTXpbJH'), 3],
      ['Pedagogía', 'Correctio fraterna', 'Para aprender a sostenerse y corregirse como hermanos.', u('1gOjTNK1k3zMpIa5ap_a__RSicvAUDijz'), 2],
      ['Taller', 'Taller de Ideal Personal', 'Complementa el ideal de grupo con el camino de cada uno.', u('1nbi_W9F859Oa34j1ACAbTBLTZo_3jPdH'), 2],
      ['Taller', 'Taller de Poder en Blanco', 'Profundización de la alianza para grupos ya maduros.', u('1QJAjSihUuLd7YXbyviWXZ7jG9m7M6g3z'), 2]
    ],
    4: [
      ['Taller', 'Taller Nuestro Rol en la Sociedad', 'Para pensar el compromiso del grupo con su realidad.', u('1m-NkRtYKbwmSgtbWX5_myw-SZjkfbkuZ'), 3],
      ['Taller', 'Taller Acción Apostólica en Schoenstatt', 'Para armar un proyecto de apostolado del grupo.', u('1j_UxH9aeJbPlS_WaY9EaKKrLoXAzuss0'), 3],
      ['Dirigentes', 'Motivación al apostolado', 'Charla para encender la misión en el grupo.', u('0B8-ondZ1ey9PYmRqRC1DMlM1a0E', '0-yYX-P6PWe35TfXdbf-0tkA'), 2],
      ['Encíclicas', 'Evangelii gaudium – Francisco (2013)', 'La Iglesia en salida, base para el apostolado.', u('0B8-ondZ1ey9PYUJDZWk1YzN6N3M', '0-Pr1rTaF_uPh6BXqb2l47Cw'), 2],
      ['Dirigentes', 'Charla Impacto Social Schoenstatt', 'Ejemplos de misión de Schoenstatt en la sociedad.', u('1zidaWzuFJbTIjSkHehLrOkNCd2oUsIR_'), 2]
    ]
  };

  var FAQ = [
    { q: '¿Cuánto dura cada etapa?', k: 'dura tiempo cuanto meses anos años etapa largo rapido',
      a: 'Entre seis meses y tres años, según el momento en que empieza el grupo. Las etapas se entrelazan, pero cada una debería dejar cierto nivel de maduración.',
      cita: 'Es esperable que cada etapa se desarrolle entre seis meses y tres años', fuente: 'Aplicación para los grupos de vida', ancla: 't-apli' },
    { q: '¿Es obligatorio seguirlo?', k: 'obligatorio imposicion curriculum libertad tengo que seguir',
      a: 'No. No es un currículum ni una imposición: pone nombre a procesos que ya se dan y respeta la libertad de cada grupo.',
      cita: 'no quiere ser esto un currículum ni una imposición', fuente: 'Introducción', ancla: 't-intro' },
    { q: 'Ya sellamos la alianza, ¿y ahora?', k: 'sellamos sellaron alianza despues ahora fraterna desarma desarmando ideal nombre',
      a: 'El grupo no termina en la alianza. Sigue la tercera etapa: madurar la alianza en la vida y condensarla en la alianza fraterna y un ideal de grupo.',
      cita: 'La alianza en la vida es probada y así madurada', fuente: 'Aplicación · Tercera etapa', ancla: 't-e3' },
    { q: '¿Qué dinámicas uso al principio?', k: 'dinamica dinamicas principio empezar nuevo conocer conocen presentarse test inicio arrancar',
      a: 'Para armar la comunidad: presentarse, historia de vida, familia, test de personalidad y cómo vive cada uno la fe.',
      cita: 'presentarse, historia de vida, familia, test de personalidad', fuente: 'Aplicación · Primera etapa', ancla: 't-e1' },
    { q: '¿Qué distingue a un grupo de vida?', k: 'distingue grupo vida diferencia cristo social amigos centro',
      a: 'Cristo en el centro: no es un grupo social, ideológico ni terapéutico. No seguimos una idea, sino a alguien.',
      cita: 'No seguimos una idea o una ley, sino a alguien: Jesucristo', fuente: 'Fundamentación carismática', ancla: 't-fund' },
    { q: '¿Cómo pasamos a la misión?', k: 'mision apostolado salida proyecto servir afuera cuarta',
      a: 'En la cuarta etapa lo vivido en la intimidad del grupo se proyecta en salida: un apostolado concreto y la propia vida (familia, estudio, trabajo) vivida desde lo aprendido.',
      cita: 'Lo que se vive en esta intimidad se proyecta en salida', fuente: 'Aplicación · Cuarta etapa', ancla: 't-e4' }
  ];

  /* ---------- Pestañas ---------- */
  var tabs = [document.getElementById('tab-diag'), document.getElementById('tab-preg')];
  function selectTab(i) {
    tabs.forEach(function (t, j) {
      if (!t) return;
      t.setAttribute('aria-selected', i === j ? 'true' : 'false');
      t.tabIndex = i === j ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = i !== j;
    });
  }
  tabs.forEach(function (t, i) {
    if (!t) return;
    t.addEventListener('click', function () { selectTab(i); });
    t.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        var n = (i + 1) % 2; selectTab(n); tabs[n].focus();
      }
    });
  });

  /* ---------- Ventana de consulta (diagnóstico / preguntar) ---------- */
  var dlg = document.getElementById('consulta');
  function openConsulta(which) {
    selectTab(which === 'preg' ? 1 : 0);
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      document.body.classList.add('has-modal');
    }
    dlg.scrollTop = 0;
  }
  function closeConsulta() {
    if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  }
  dlg.addEventListener('close', function () {
    document.body.classList.remove('has-modal');
    if (/^#(consultar|preguntar)$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  });
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) closeConsulta(); });
  document.getElementById('closeConsulta').addEventListener('click', closeConsulta);
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-consulta]'), function (b) {
    b.addEventListener('click', function () { openConsulta(b.getAttribute('data-open-consulta')); });
  });
  document.getElementById('resLink').addEventListener('click', function () { closeConsulta(); });
  function hashOpen() {
    if (location.hash === '#consultar') openConsulta('diag');
    if (location.hash === '#preguntar') openConsulta('preg');
  }
  window.addEventListener('hashchange', hashOpen);
  hashOpen();

  /* ---------- Diagnóstico ---------- */
  var state = { tiempo: null, ans: PREGUNTAS.map(function () { return null; }) };

  function radioGroup(container, labels, getVal, setVal, label) {
    container.textContent = '';
    container.setAttribute('role', 'radiogroup');
    if (label) container.setAttribute('aria-label', label);
    var buttons = labels.map(function (l, v) {
      return el('button', {
        type: 'button', class: 'pill', role: 'radio', text: l,
        onclick: function () { setVal(v); render(); },
        onkeydown: function (ev) {
          var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0);
          if (!d) return;
          ev.preventDefault();
          var n = (v + d + labels.length) % labels.length;
          setVal(n); render(); buttons[n].focus();
        }
      });
    });
    buttons.forEach(function (b) { container.appendChild(b); });
    return function update() {
      var cur = getVal();
      buttons.forEach(function (b, v) {
        b.setAttribute('aria-checked', cur === v ? 'true' : 'false');
        b.tabIndex = (cur === v || (cur === null && v === 0)) ? 0 : -1;
      });
    };
  }

  var updaters = [];
  var timeBox = document.getElementById('timeOpts');
  updaters.push(radioGroup(timeBox, TIEMPOS, function () { return state.tiempo; }, function (v) { state.tiempo = v; }, 'Tiempo del grupo'));

  var qBox = document.getElementById('questions');
  PREGUNTAS.forEach(function (p, i) {
    var opts = el('div', { class: 'row', style: 'gap: 8px' });
    var fs = el('fieldset', { class: 'question' }, [
      el('legend', null, [el('b', { text: 'E' + p.e }), el('span', { text: (i + 1) + '. ' + p.t })]),
      opts
    ]);
    qBox.appendChild(fs);
    updaters.push(radioGroup(opts, OPCIONES, function () { return state.ans[i]; }, function (v) { state.ans[i] = v; }, 'Pregunta ' + (i + 1)));
  });
  document.getElementById('totalQ').textContent = PREGUNTAS.length;

  document.getElementById('resetDiag').addEventListener('click', function () {
    state.tiempo = null;
    state.ans = PREGUNTAS.map(function () { return null; });
    render();
  });

  function evaluar() {
    var v = function (i) { return state.ans[i] == null ? 0 : state.ans[i]; };
    var score = [
      { s: v(0) + v(1) + v(2), max: 6, min: 5 },
      { s: v(3) + v(4), max: 4, min: 3 },
      { s: v(5) + v(6), max: 4, min: 3 },
      { s: v(7) + v(8), max: 4, min: 3 }
    ];
    score.forEach(function (x, k) { x.ok = x.s >= x.min && !(k === 1 && v(4) === 0); });
    var etapa = 4;
    for (var k = 0; k < 4; k++) { if (!score[k].ok) { etapa = k + 1; break; } }
    var enMision = score.every(function (x) { return x.ok; });
    return { score: score, etapa: etapa, enMision: enMision };
  }

  function render() {
    updaters.forEach(function (f) { f(); });
    var respondidas = state.ans.filter(function (x) { return x != null; }).length;
    document.getElementById('answered').textContent = respondidas;

    var title = document.getElementById('resTitle');
    var text = document.getElementById('resText');
    var bars = document.getElementById('bars');
    var goal = document.getElementById('resGoal');
    var time = document.getElementById('resTime');
    var steps = document.getElementById('resSteps');
    var link = document.getElementById('resLink');
    var recoStage = document.getElementById('recoStage');
    var recos = document.getElementById('recos');

    var side = document.getElementById('sideResult');
    if (respondidas === 0) {
      side.hidden = true;
      title.textContent = 'Respondé las preguntas';
      text.textContent = 'El resultado aparece a medida que contestás. Si no sabés alguna, dejala sin responder.';
      bars.textContent = ''; goal.textContent = '—'; time.textContent = ''; steps.textContent = '';
      recoStage.textContent = '—';
      recos.textContent = '';
      recos.appendChild(el('p', { class: 'muted', text: 'Las recomendaciones de la biblioteca aparecen cuando empezás el diagnóstico.' }));
      link.setAttribute('href', '#texto');
      return;
    }

    var r = evaluar();
    var e = ETAPAS[r.etapa - 1];
    title.textContent = r.enMision ? 'El grupo está en misión' : 'Etapa ' + r.etapa + ' · ' + e.nombre;
    var anteriores = r.score.slice(0, r.etapa - 1).length;
    text.textContent = r.enMision
      ? 'Las cuatro etapas aparecen vividas. El desafío es sostener la misión y purificarla.'
      : (anteriores > 0 ? 'Las etapas anteriores aparecen consolidadas. Lo que falta madurar corresponde a esta etapa.' : 'Todavía hay que afianzar lo propio de la primera etapa antes de avanzar.');
    if (respondidas < PREGUNTAS.length) text.textContent += ' (Resultado provisorio: faltan ' + (PREGUNTAS.length - respondidas) + ' respuestas.)';

    bars.textContent = '';
    r.score.forEach(function (x, k) {
      var pct = Math.round((x.s / x.max) * 100);
      var estado = x.ok ? 'Consolidada' : (k + 1 === r.etapa ? 'En curso' : (k + 1 < r.etapa ? 'Revisar' : 'Pendiente'));
      var color = x.ok ? 'var(--celeste)' : (k + 1 === r.etapa ? 'var(--amarillo)' : '#5A62A8');
      bars.appendChild(el('div', { class: 'stack', style: 'gap: 4px' }, [
        el('div', { class: 'row between small' }, [el('span', { text: (k + 1) + ' · ' + ETAPAS[k].nombre }), el('strong', { text: estado })]),
        el('span', { class: 'bar', role: 'img', 'aria-label': ETAPAS[k].nombre + ': ' + pct + '%' }, [el('span', { style: 'width:' + pct + '%; background:' + color })])
      ]));
    });

    goal.textContent = e.objetivo;
    time.textContent = state.tiempo == null ? 'Cada etapa suele llevar entre seis meses y tres años.'
      : 'El grupo lleva ' + TIEMPOS[state.tiempo].toLowerCase() + '. Cada etapa suele llevar entre seis meses y tres años.';
    steps.textContent = '';
    e.pasos.forEach(function (p) { steps.appendChild(el('li', { text: p })); });
    link.setAttribute('href', '#t-e' + r.etapa);

    side.hidden = false;
    side.textContent = '';
    side.appendChild(el('span', { text: 'Tu último diagnóstico' }));
    side.appendChild(el('strong', { text: r.enMision ? 'El grupo está en misión' : 'Etapa ' + r.etapa + ' · ' + e.nombre }));
    side.appendChild(el('a', { href: '#t-e' + r.etapa, style: 'color: #fff; font-weight: 700', text: 'Leer esta etapa en el texto ↓' }));

    recoStage.textContent = r.etapa + ' · ' + e.nombre;
    recos.textContent = '';
    MATERIAL[r.etapa].forEach(function (m) {
      recos.appendChild(el('article', { class: 'mat-card' }, [
        el('div', { class: 'row between', style: 'gap: 8px' }, [
          el('span', { class: 'kind', text: m[0] }),
          el('span', { class: 'tag ' + (m[4] === 3 ? 'tag--azul' : 'tag--celeste'), text: m[4] === 3 ? 'Muy útil' : 'Útil' })
        ]),
        el('strong', { text: m[1] }),
        el('p', { text: m[2] }),
        el('a', { class: 'btn btn--sm btn--outline', href: m[3], target: '_blank', rel: 'noopener', text: 'Abrir en Drive ↗' })
      ]));
    });
  }
  render();

  /* ---------- Preguntar ---------- */
  var chips = document.getElementById('faqChips');
  var chipEls = [];
  function showFaq(i) {
    var f = FAQ[i];
    document.getElementById('faqQ').textContent = f.q;
    document.getElementById('faqA').textContent = f.a;
    document.getElementById('faqCita').textContent = '“' + f.cita + '”';
    var fuente = document.getElementById('faqFuente');
    fuente.textContent = '';
    fuente.appendChild(document.createTextNode('Fuente: Itinerario, sección '));
    fuente.appendChild(el('a', { href: '#' + f.ancla, text: f.fuente }));
    chipEls.forEach(function (c, j) { c.classList.toggle('is-active', i === j); c.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
  }
  FAQ.forEach(function (f, i) {
    var c = el('button', { type: 'button', class: 'chip', text: f.q, onclick: function () { showFaq(i); } });
    chipEls.push(c);
    chips.appendChild(c);
  });
  showFaq(0);

  function buscar() {
    var q = JM.norm(document.getElementById('preg').value);
    if (!q.trim()) return;
    var words = q.split(/[^a-z0-9ñ]+/).filter(function (w) { return w.length > 3; });
    var best = -1, bestScore = 0;
    FAQ.forEach(function (f, i) {
      var hay = JM.norm(f.q + ' ' + f.k + ' ' + f.a);
      var s = 0;
      words.forEach(function (w) { if (hay.indexOf(w) !== -1 || hay.indexOf(w.slice(0, 5)) !== -1) s++; });
      if (s > bestScore) { bestScore = s; best = i; }
    });
    if (best >= 0) {
      showFaq(best);
    } else {
      chipEls.forEach(function (c) { c.classList.remove('is-active'); });
      document.getElementById('faqQ').textContent = 'No encontramos una respuesta directa';
      document.getElementById('faqA').textContent = 'Probá con otras palabras, elegí una pregunta frecuente o hacé tu consulta en el cuaderno de NotebookLM del itinerario: ahí podés preguntar sobre el texto completo y el material.';
      document.getElementById('faqCita').textContent = '';
      document.getElementById('faqFuente').textContent = '';
    }
  }
  document.getElementById('askBtn').addEventListener('click', buscar);
  document.getElementById('preg').addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) buscar();
  });

  var nb = (CFG.cuadernos || []).filter(function (c) { return c.url; })[0];
  var nbLink = document.getElementById('nbLink');
  if (nb && nbLink) nbLink.href = nb.url;

  var printBtn = document.getElementById('printText');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
})();
