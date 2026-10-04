/* Historia: línea del tiempo filtrable, símbolos y morfología del símbolo nacional. */
(function () {
  var el = JM.el;
  var CFG = window.JM_CONFIG || {};

  // Para sumar un hito, agregá un objeto a esta lista (key: true = hito destacado).
  var HITOS = [
    { anio: '[año]', cat: 'Encuentros nacionales', titulo: 'Origen de la JM en Argentina', texto: '[A completar por el equipo nacional: primeras ramas y fundadores.]' },
    { anio: '2007–2010', cat: 'Corrientes de vida', titulo: 'Patria de María', texto: 'Rumbo al Bicentenario, la JM se compromete a teñir de celeste y blanco cada rincón de la Patria con el Pacto del Bicentenario.' },
    { anio: '2010–2014', cat: 'Corrientes de vida', titulo: 'Generación Misionera', texto: 'Un pilar por año: Protagonismo, Unidad Internacional, Fuego de la Misión y Cultura de Alianza.', key: true },
    { anio: '2012', cat: 'Ideal', titulo: 'JNJ Mendoza', texto: 'Nos proponemos empezar la búsqueda de la identidad nacional por el Jubileo de los 100 años de Schoenstatt.' },
    { anio: '2013', cat: 'Ideal', titulo: 'JNJ Mar del Plata', texto: '¿Qué somos? Jóvenes alegres, hermanos, valientes. ¿Qué queremos ser? Respuesta concreta al tiempo actual.' },
    { anio: '2013', cat: 'Misiones', titulo: 'Misión Nacional en Florencio Varela', texto: 'Jóvenes de todas las ramas del país en la parroquia San Pantaleón, como regalo a la Mater por el centenario.' },
    { anio: '2013', cat: 'Misiones', titulo: 'Cruzadas de María y JMJ Río', texto: 'Hitos de la Generación Misionera vividos junto a la JM de otros países.' },
    { anio: '2014', cat: 'Encuentros nacionales', titulo: 'JNJ Salta y coronación', texto: 'Rasgos y sueños de la JM Argentina. El 17/10 coronamos a la Mater como Reina de la Generación Misionera.', key: true },
    { anio: '2015', cat: 'Ideal', titulo: 'JNJ San Juan', texto: 'Se pide al Secretariado Nacional una propuesta de camino y un taller para los grupos de vida.' },
    { anio: '2016', cat: 'Ideal', titulo: 'JNJ Sion, Florencio Varela', texto: 'Los jefes se comprometen a trabajar el Taller de Identidad Nacional en todos los grupos.' },
    { anio: '2017', cat: 'Encuentros nacionales', titulo: 'Camino de Brochero', texto: 'Peregrinación de la JM Nacional de 150 km desde la ciudad de Córdoba hasta Villa Cura Brochero.' },
    { anio: '2017', cat: 'Símbolo', titulo: 'JNJ Chaco', texto: 'Concreción de los símbolos: santuario, fuego, bandera, abrazo, cruz y montaña.' },
    { anio: '2018', cat: 'Encuentros nacionales', titulo: 'Campamento Nacional de Secundarios', texto: 'Lago Hermoso, Neuquén: seguir palpitando la misión nacional.' },
    { anio: '20/08/2018', cat: 'Ideal', titulo: 'Congreso JM Argentina', texto: 'Descubrimos lo que somos y estamos llamados a ser: “Con María, pasión que transforma”.', key: true },
    { anio: '2019', cat: 'Ideal', titulo: 'Primer aniversario', texto: 'Cabeza, corazón y manos al ideal: oración del ideal y estrategias regionales en la JNJ de Paraná.' },
    { anio: '2023', cat: 'Símbolo', titulo: 'JNJ La Plata', texto: 'Trabajo en la identidad gráfica: fuego, santuario y bandera como los tres símbolos nacionales.' },
    { anio: '2024', cat: 'Símbolo', titulo: 'JNJ Paraná · Símbolo nacional', texto: 'Convocatoria abierta, decenas de propuestas y la elección en oración del símbolo que nos acompaña.', key: true }
  ];
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
    HITOS.filter(function (h) { return cat === 0 || h.cat === CATS[cat]; }).forEach(function (h) {
      tl.appendChild(el('li', { class: h.key ? 'is-key' : '' }, [
        el('span', { class: 'year', text: h.anio }),
        el('span', { class: 'body' }, [
          el('span', { class: 'row', style: 'gap: 8px; align-items: center' }, [el('strong', { text: h.titulo }), el('span', { class: 'tag ' + CAT_TAG[h.cat], text: h.cat })]),
          el('p', { text: h.texto })
        ])
      ]));
    });
  }
  renderTimeline();

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
