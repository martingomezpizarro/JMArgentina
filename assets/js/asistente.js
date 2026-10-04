/*
 * Asistente de material: preguntas guiadas → material recomendado con motivos.
 * Usa data/biblioteca.json (índice) y data/fichas.json (resúmenes por material, p. ej. salidos de NotebookLM).
 */
(function () {
  var el = JM.el, norm = JM.norm;
  var CFG = window.JM_CONFIG || {};

  /* ---------- Temas: palabras clave para reconocerlos en títulos y carpetas ---------- */
  var TEMAS = {
    autoconocimiento: { l: 'Autoconocimiento y temperamentos', k: ['autoconocimiento', 'temperament', 'johari', 'autoestima', 'autoeducacion', 'eneagrama', 'inteligencia emocional', 'tipo 1', 'tipo 2', 'test', 'sembrando', 'donde estoy parado'], etapa: 1, nb: 0 },
    grupo: { l: 'Grupo de vida: comunidad, nombre e ideal', k: ['grupo', 'dinamicas para grupos', 'dinamicas iniciales', 'correctio', 'amistad', 'comunidad', 'nombre de grupo', 'encargado', 'solidaridad'], etapa: 3, nb: 0 },
    alianza: { l: 'Alianza de amor', k: ['alianza', 'acta de fundacion', 'acta de prefundacion', 'poder en blanco', 'inscriptio', 'rueda de alianza', 'santuario hogar', 'santuario-habitacion', 'capital de gracias', 'capitalario', 'post alianza'], etapa: 2, nb: 1 },
    maria: { l: 'María y el Santuario', k: ['maria', 'mater', 'virgen', 'rosario', 'mariano', 'mariologia', 'reina', 'santuario', 'redemptoris-mater', 'ad-caeli-reginam', 'christi-matri', 'mense-maio'], etapa: 2, nb: 1 },
    kentenich: { l: 'Padre Kentenich e historia de Schoenstatt', k: ['kentenich', 'kentenick', 'kentenkch', 'pjk', 'pk ', 'conociendo al pk', 'historia de schoenstatt', 'schoenstatt', 'congregacion', 'congregantes', 'ver sacrum', 'prefundacion', '31 mayo', 'engling', 'heroes de fuego', 'heroes de fuego', 'reinisch', 'leisner', 'wormer', 'brunner', 'langer', 'schaeffer', 'pozzobon'], etapa: 2, nb: 1 },
    idealpersonal: { l: 'Ideal personal y vocación', k: ['ideal personal', 'sentido de vida', 'camino de vida', 'hombre nuevo', 'creciendo', 'vocacion', 'ser varon', 'hombre heroico', 'hacia la cima'], etapa: 3, nb: 0 },
    apostolado: { l: 'Apostolado, misión y sociedad', k: ['apostol', 'mision', 'rol en la sociedad', 'impacto social', 'evangelii', 'social', 'laudato', 'fratelli', 'rerum', 'caritas in veritate', 'caritas-in-veritate', 'populorum', 'centesimus', 'laborem', 'sollicitudo', 'redemptoris-missio', 'patria', 'adicciones', 'magnifica humanitas', 'discipulos y misioneros', 'fidei-donum', 'evangelii-praecones'], etapa: 4, nb: 3 },
    liderazgo: { l: 'Liderazgo y conducción de grupos', k: ['liderazgo', 'lider', 'dirigente', 'jefe', 'conduccion', 'encargado', 'consejo', 'planificacion', 'reuniones', 'escuela nacional de jefes', 'plan ternal', 'elaboracion de charlas', 'actitudes', 'maximas para un jefe', 'pk como educador'], etapa: null, nb: 0 },
    oracion: { l: 'Oración y vida espiritual', k: ['oracion', 'rezar', 'rosario', 'misa', 'horario espiritual', 'espiritualidad', 'examen de conciencia', 'via crucis', 'santisimo', 'hablar con dios', 'tiempo para dios', 'vida interior', 'peregrino ruso', 'filocalia', 'nube del no saber', 'combate espiritual', 'abandono', 'vida devota', 'como hablar con dios', 'espiritu santo'], etapa: null, nb: 5 },
    santos: { l: 'Santos y testigos', k: ['santo', 'santos', 'san ', 'don bosco', 'teresa', 'engling', 'reinisch', 'leisner', 'santidad', 'felipe neri', 'san jose', 'patris corde', 'brochero'], etapa: null, nb: 5 },
    sexualidad: { l: 'Afectividad, sexualidad y noviazgo', k: ['sexualidad', 'pureza', 'afectiva', 'varon', 'masculinidad', 'amor puro', 'matrimonio', 'noviazgo', 'amoris', 'humanae', 'amor y responsabilidad', 'feminidad', 'juventud en extasis', 'energia y pureza', 'crisis matrimonial'], etapa: null, nb: 5 },
    iglesia: { l: 'Iglesia, Magisterio y doctrina', k: ['enciclica', 'catecismo', 'youcat', 'aparecida', 'biblia', 'iglesia', 'papa', 'juan pablo', 'benedicto', 'francisco', 'leon xiii', 'leon xiv', 'pio xii', 'pablo vi', 'juan xxiii', 'credo', 'sacramento'], etapa: null, nb: 3 },
    fe: { l: 'Fe, Jesús y teología', k: ['cristo', 'jesus', 'guardini', 'fe ', 'fides', 'lumen fidei', 'teologia', 'trinidad', 'cristianismo', 'galileo', 'cantalamessa', 'chesterton', 'lewis', 'nouwen', 'hijo prodigo', 'menapace', 'quien es el hombre', 'por que le pasan'], etapa: null, nb: 1 },
    ideal: { l: 'Ideal Nacional y mística JM', k: ['ideal nacional', 'identidad nacional', 'mistica', 'simbolo', 'jornada nacional', 'estrategias jm', 'con maria, pasion', 'camino recorrido', 'material gm'], etapa: null, nb: 2 }
  };

  var RAMAS = {
    pioneros: { l: 'Pioneros', k: ['pioneros', 'pionero', 'pio0', 'pio1', 'pio2', 'pio3', 'pio4', 'etapa bandera', 'etapa santuario', 'etapa corona', 'cruz espada'] },
    secundarios: { l: 'Secundarios', k: ['secundarios', 'hombre nuevo', 'thn', 'taller del hn', 'retiro puma', 'testimonios'] },
    universitarios: { l: 'Universitarios', k: ['universitarios', 'post alianza', 'poder en blanco', 'ideal personal'] },
    dirigentes: { l: 'Dirigentes y jefes', k: ['dirigente', 'jefe de rama', 'itinerario dirigentes', 'ssp', 'gymnich', 'encargado', 'liderazgo', 'escuela nacional de jefes', 'manual del jefe'] }
  };

  var PREGUNTAS = [
    {
      id: 'para', q: '¿Para qué lo necesitás?', help: 'Elegí la opción que más se parezca.',
      ops: [
        { v: 'encuentro', l: 'Preparar un encuentro o taller con mi grupo' },
        { v: 'formarme', l: 'Formarme yo en un tema' },
        { v: 'retiro', l: 'Organizar un retiro, rito o celebración' },
        { v: 'rezar', l: 'Rezar o proponer oración' },
        { v: 'cantar', l: 'Canciones para un encuentro o misa' },
        { v: 'conducir', l: 'Conducir la rama o un consejo' }
      ]
    },
    {
      id: 'rama', q: '¿Para quién es?', help: 'La rama o etapa de los chicos con los que lo vas a usar.',
      ops: [
        { v: 'pioneros', l: 'Pioneros' },
        { v: 'secundarios', l: 'Secundarios' },
        { v: 'universitarios', l: 'Universitarios' },
        { v: 'dirigentes', l: 'Dirigentes y jefes' },
        { v: 'cualquiera', l: 'No importa' }
      ]
    },
    {
      id: 'tema', q: '¿Sobre qué tema?', help: 'Podés elegir hasta tres.', multi: 3,
      skipIf: function (a) { return a.para === 'cantar'; },
      ops: Object.keys(TEMAS).map(function (k) { return { v: k, l: TEMAS[k].l }; })
    },
    {
      id: 'formato', q: '¿Qué tipo de material preferís?', help: 'Si no estás seguro, elegí “Me da igual”.',
      skipIf: function (a) { return a.para === 'cantar' || a.para === 'retiro'; },
      ops: [
        { v: 'listo', l: 'Algo listo para usar (taller, dinámica, charla)' },
        { v: 'leer', l: 'Algo para leer y profundizar (libro, documento)' },
        { v: 'igual', l: 'Me da igual' }
      ]
    },
    {
      id: 'texto', q: '¿Querés agregar algo más?', help: 'Opcional. Contá la situación con tus palabras: ayuda a afinar la búsqueda.',
      text: true
    }
  ];

  /* ---------- Estado y datos ---------- */
  var A = { para: null, rama: null, tema: [], formato: null, texto: '' };
  var paso = 0;
  var LIB = [], FICHAS = {};

  function idDe(url) { var m = /\/d\/([^/?]+)/.exec(url || '') || /[?&]id=([^&]+)/.exec(url || '') || /folders\/([^/?]+)/.exec(url || ''); return m ? m[1] : url; }

  function preguntasActivas() { return PREGUNTAS.filter(function (p) { return !(p.skipIf && p.skipIf(A)); }); }

  /* ---------- Pantalla de preguntas ---------- */
  function render() {
    var qs = preguntasActivas();
    if (paso >= qs.length) { mostrarResultados(); return; }
    var p = qs[paso];
    document.getElementById('asisStep').textContent = 'Pregunta ' + (paso + 1) + ' de ' + qs.length;
    document.getElementById('asisBar').style.width = Math.round((paso / qs.length) * 100) + '%';
    document.getElementById('asisQ').textContent = p.q;
    document.getElementById('asisHelp').textContent = p.help || '';
    var opts = document.getElementById('asisOpts');
    var extra = document.getElementById('asisExtra');
    opts.textContent = ''; extra.textContent = '';
    opts.setAttribute('role', p.multi ? 'group' : 'radiogroup');
    opts.setAttribute('aria-label', p.q);
    if (p.text) {
      var ta = el('textarea', { class: 'input', rows: '3', id: 'asisTexto', placeholder: 'Ej.: el grupo está desmotivado después de sellar la alianza y no sabemos cómo seguir' });
      ta.value = A.texto;
      ta.addEventListener('input', function () { A.texto = ta.value; });
      extra.appendChild(ta);
    } else {
      p.ops.forEach(function (o) {
        var sel = p.multi ? A[p.id].indexOf(o.v) !== -1 : A[p.id] === o.v;
        var b = el('button', {
          type: 'button', class: 'asis-opt', role: p.multi ? null : 'radio',
          'aria-checked': p.multi ? null : (sel ? 'true' : 'false'),
          'aria-pressed': p.multi ? (sel ? 'true' : 'false') : null,
          text: o.l,
          onclick: function () {
            if (p.multi) {
              var arr = A[p.id], i = arr.indexOf(o.v);
              if (i !== -1) arr.splice(i, 1); else if (arr.length < p.multi) arr.push(o.v);
              render();
            } else {
              A[p.id] = o.v;
              paso++; render(); focusQ();
            }
          }
        });
        opts.appendChild(b);
      });
    }
    var last = paso === qs.length - 1;
    var next = document.getElementById('asisNext');
    next.textContent = last ? 'Ver recomendación' : (p.multi || p.text ? 'Siguiente →' : 'Saltear →');
    if (p.multi && A[p.id].length) next.textContent = last ? 'Ver recomendación' : 'Siguiente →';
    document.getElementById('asisBack').disabled = paso === 0;
    renderAnswers();
  }
  function focusQ() { var h = document.getElementById('asisQ'); if (h) h.focus({ preventScroll: true }); }

  function etiqueta(id, v) {
    var p = PREGUNTAS.filter(function (x) { return x.id === id; })[0];
    var o = p && p.ops && p.ops.filter(function (x) { return x.v === v; })[0];
    return o ? o.l : v;
  }

  function renderAnswers() {
    var box = document.getElementById('asisAnswers');
    box.textContent = '';
    var qs = preguntasActivas();
    var any = false;
    qs.forEach(function (p, i) {
      var val = A[p.id];
      if (!val || (Array.isArray(val) && !val.length)) return;
      any = true;
      var txt = Array.isArray(val) ? val.map(function (v) { return etiqueta(p.id, v); }).join(', ') : (p.text ? '“' + val + '”' : etiqueta(p.id, val));
      box.appendChild(el('button', { type: 'button', class: 'asis-ans', title: 'Cambiar esta respuesta', onclick: function () { paso = i; document.getElementById('asisResults').hidden = true; document.getElementById('asisCard').hidden = false; render(); focusQ(); } }, [
        el('span', { text: p.q }), el('strong', { text: txt })
      ]));
    });
    box.hidden = !any;
  }

  document.getElementById('asisNext').addEventListener('click', function () { paso++; render(); focusQ(); });
  document.getElementById('asisBack').addEventListener('click', function () { if (paso > 0) { paso--; render(); focusQ(); } });
  document.getElementById('asisRestart').addEventListener('click', function () {
    A = { para: null, rama: null, tema: [], formato: null, texto: '' }; paso = 0;
    document.getElementById('quickQ').value = '';
    document.getElementById('asisResults').hidden = true;
    document.getElementById('asisCard').hidden = false;
    render(); focusQ();
  });
  document.getElementById('quickForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var q = document.getElementById('quickQ').value.trim();
    if (!q) return;
    A = { para: null, rama: null, tema: [], formato: null, texto: q };
    inferir(q);
    paso = 99;
    mostrarResultados();
  });

  // A partir de texto libre, deduce rama, temas y propósito.
  function inferir(q) {
    var n = ' ' + norm(q) + ' ';
    Object.keys(RAMAS).forEach(function (r) { if (!A.rama && RAMAS[r].k.some(function (k) { return n.indexOf(k) !== -1; })) A.rama = r; });
    if (!A.rama && /secundari|colegio|adolescen/.test(n)) A.rama = 'secundarios';
    if (!A.rama && /universit|facultad/.test(n)) A.rama = 'universitarios';
    var t = [];
    Object.keys(TEMAS).forEach(function (k) {
      var hits = TEMAS[k].k.filter(function (w) { return w.length > 3 && n.indexOf(w) !== -1; }).length;
      if (hits) t.push([k, hits]);
    });
    if (/conoc|presenta|nuevo|empez|arranc|hielo/.test(n)) t.push(['autoconocimiento', 1], ['grupo', 1]);
    if (/desarm|desmotiv|unid|herman|fratern/.test(n)) t.push(['grupo', 2]);
    if (/sell|despues de la alianza|post alianza/.test(n)) t.push(['alianza', 1], ['grupo', 1]);
    t.sort(function (a, b) { return b[1] - a[1]; });
    t.forEach(function (x) { if (A.tema.indexOf(x[0]) === -1 && A.tema.length < 3) A.tema.push(x[0]); });
    if (/dinamica|taller|encuentro|actividad|juego/.test(n)) { A.para = 'encuentro'; A.formato = 'listo'; }
    if (/libro|leer|profundiz|formarme/.test(n)) { A.formato = 'leer'; A.para = A.para || 'formarme'; }
    if (/retiro|rito|ceremonia/.test(n)) A.para = 'retiro';
    if (/cancion|cantar|musica|cancionero/.test(n)) A.para = 'cantar';
    if (/rezar|oracion|rosario/.test(n)) A.para = A.para || 'rezar';
  }

  /* ---------- Motor de recomendación ---------- */
  function contiene(n, lista) { return lista.filter(function (k) { return n.indexOf(k) !== -1; }); }

  function puntuar(m) {
    var t = m._t, c = m._c, s = 0, por = [];
    var f = FICHAS[idDe(m.url)];

    // Propósito
    var carp = m.carpeta;
    var esTaller = /^1\. Talleres/.test(carp) || (!/Retiros y ritos/.test(carp) && /dinamica|taller|charla|test /.test(t));
    var general = /autoconocimiento y dinamicas|nombre e ideal de grupo/.test(c);
    var esLibro = /^2\. Libros/.test(carp);
    if (A.para === 'encuentro') { if (esTaller) { s += 4; por.push('Listo para usar en un encuentro'); } else if (/Retiros y ritos|Itinerario Dirigentes/.test(carp)) s += 1; }
    if (A.para === 'formarme' && esLibro) { s += 3; por.push('Para formarte en profundidad'); }
    if (A.para === 'retiro') { if (/Retiros y ritos/.test(carp) || /retiro|rito|ceremonia/.test(t)) { s += 8; por.push('Material de retiros y ritos'); } else s -= 2; }
    if (A.para === 'rezar') { if (/Oración/.test(carp) || /oracion|rosario|horario espiritual|via crucis|santisimo/.test(t)) { s += 7; por.push('Para la oración'); } }
    if (A.para === 'cantar') { if (/Cancioneros/.test(carp) || /cancionero|musica/.test(t)) { s += 10; por.push('Cancionero'); } else s -= 6; }
    if (A.para === 'conducir') { if (/Manual del Jefe de Rama|Itinerario Dirigentes/.test(carp) || /liderazgo|jefe|conduccion|consejo|dirigente/.test(t)) { s += 7; por.push('Para conducir la rama'); } }

    // Formato
    if (A.formato === 'listo' && esTaller) s += 2;
    if (A.formato === 'listo' && esLibro) s -= 2;
    if (A.formato === 'leer' && esLibro) s += 2;
    if (A.formato === 'leer' && esTaller) s -= 1;

    // Rama
    if (A.rama && A.rama !== 'cualquiera') {
      var propia = contiene(c + ' ' + t, RAMAS[A.rama].k).length > 0;
      var otra = Object.keys(RAMAS).some(function (r) { return r !== A.rama && r !== 'dirigentes' && contiene(c, RAMAS[r].k).length > 0; });
      if (propia) { s += 4; por.push('Pensado para ' + RAMAS[A.rama].l); }
      else if (otra && !general) s -= 4;
    }

    // Temas
    var temasHit = [];
    A.tema.forEach(function (k) {
      var T = TEMAS[k];
      var enTitulo = contiene(' ' + t + ' ', T.k).length;
      var enCarpeta = contiene(c, T.k).length;
      var enFicha = f && f.temas && f.temas.indexOf(k) !== -1;
      if (enTitulo) { s += 6 + Math.min(enTitulo, 2); temasHit.push(T.l); }
      else if (enFicha) { s += 3; temasHit.push(T.l); }
      else if (enCarpeta) { s += 3; temasHit.push(T.l); }
    });
    if (temasHit.length) por.push('Trata sobre ' + temasHit.join(' y ').toLowerCase());
    else if (A.tema.length) s -= 3;

    // Texto libre
    if (A.texto) {
      var STOP = /^(dinamica|dinamicas|grupo|grupos|taller|talleres|material|encuentro|nuevo|nueva|quiero|necesito|para|sobre|secundarios|universitarios|pioneros|chicos|conozca|conozcan)$/;
      var words = norm(A.texto).split(/[^a-z0-9ñ]+/).filter(function (w) { return w.length > 4 && !STOP.test(w); });
      var hits = words.filter(function (w) { return t.indexOf(w.slice(0, 6)) !== -1; });
      if (hits.length) { s += 3 * hits.length; por.push('Coincide con lo que escribiste'); }
    }

    // Ficha (resumen de NotebookLM / selección del itinerario)
    if (f) {
      s += f.utilidad === 3 ? 3 : 2;
      if (f.etapa) por.push('Recomendado por el itinerario para la etapa ' + f.etapa);
    }

    if (m.acceso === 'derechos' && !CFG.mostrarMaterialConDerechos) s -= 1;
    return { s: s, por: por, ficha: f };
  }

  function mostrarResultados() {
    document.getElementById('asisCard').hidden = true;
    renderAnswers();
    var res = document.getElementById('asisResults');
    res.hidden = false;

    var vistos = {};
    var lista = LIB.map(function (m) { var r = puntuar(m); r.m = m; return r; })
      .filter(function (r) { return r.s >= 4; })
      .sort(function (a, b) { return b.s - a.s || a.m.titulo.localeCompare(b.m.titulo); })
      .filter(function (r) {
        var key = norm(r.m.titulo).replace(/[^a-z0-9]/g, '').slice(0, 22);
        if (vistos[key]) return false; vistos[key] = true; return true;
      })
      .slice(0, 9);

    var temaTxt = A.tema.map(function (k) { return TEMAS[k].l.toLowerCase(); }).join(', ');
    document.getElementById('resHead').textContent = lista.length ? lista.length + ' materiales para vos' : 'No encontramos algo preciso';
    var sub = [];
    if (A.para) sub.push(etiqueta('para', A.para).toLowerCase());
    if (A.rama && A.rama !== 'cualquiera') sub.push('para ' + RAMAS[A.rama].l);
    if (temaTxt) sub.push('sobre ' + temaTxt);
    document.getElementById('resSub').textContent = sub.length ? 'Buscamos material para ' + sub.join(' · ') + '.' : (A.texto ? 'A partir de: “' + A.texto + '”.' : '');

    var box = document.getElementById('asisList');
    box.textContent = '';
    if (!lista.length) {
      box.appendChild(el('div', { class: 'card' }, [
        el('p', { text: 'Con esas respuestas no hay un material que encaje bien todavía. Probá con otro tema o menos filtros, buscá en la biblioteca o preguntale al cuaderno de NotebookLM.' })
      ]));
    }
    var top = lista.length ? lista[0].s : 0;
    lista.forEach(function (r, i) {
      var m = r.m;
      var nivel = r.s >= top * 0.75 ? ['Muy útil', 'tag--azul'] : (r.s >= top * 0.45 ? ['Útil', 'tag--celeste'] : ['Complementario', 'tag--suave']);
      var acceso = m.acceso === 'abierto' || (m.acceso === 'derechos' && CFG.mostrarMaterialConDerechos);
      var action = acceso
        ? el('a', { class: 'btn btn--sm btn--primary', href: m.url, target: '_blank', rel: 'noopener', text: 'Abrir en Drive ↗' })
        : el('a', { class: 'btn btn--sm btn--outline', href: (CFG.contactoAcceso || '#').replace(/subject=[^&]*/, 'subject=' + encodeURIComponent('Pedido de acceso: ' + m.titulo)), text: 'Solicitar acceso' });
      box.appendChild(el('article', { class: 'asis-item' + (i === 0 ? ' is-top' : '') }, [
        el('div', { class: 'row between', style: 'gap: 8px; align-items: center' }, [
          el('span', { class: 'kind', text: m.carpeta.replace(/^\d+\.\s*/, '').split(' / ').slice(0, 2).join(' · ') }),
          el('span', { class: 'tag ' + nivel[1], text: nivel[0] })
        ]),
        el('strong', { class: 'asis-title', text: m.titulo }),
        r.ficha && r.ficha.resumen ? el('p', { text: r.ficha.resumen }) : null,
        r.por.length ? el('ul', { class: 'asis-why' }, r.por.slice(0, 3).map(function (x) { return el('li', { text: x }); })) : null,
        el('div', { class: 'row', style: 'gap: 8px; margin-top: auto' }, [action, el('span', { class: 'small muted', text: m.licencia })])
      ]));
    });

    // Cuaderno sugerido
    var nbIdx = A.tema.length ? TEMAS[A.tema[0]].nb : (A.para === 'conducir' ? 0 : 0);
    var cuadernos = CFG.cuadernos || [];
    var nb = cuadernos[nbIdx] && cuadernos[nbIdx].url ? cuadernos[nbIdx] : cuadernos.filter(function (c) { return c.url; })[0];
    var nbBox = document.getElementById('asisNb');
    nbBox.textContent = '';
    if (nb) {
      var quien = A.rama && A.rama !== 'cualquiera' ? RAMAS[A.rama].l.toLowerCase() : 'mi grupo';
      var sobre = temaTxt || (A.texto ? A.texto : 'este tema');
      var ref = lista[0] ? ' Usá como base “' + lista[0].m.titulo + '”.' : '';
      var prompt = 'Estoy preparando un encuentro para ' + quien + ' sobre ' + sobre + '. ¿Qué dicen las fuentes y cómo lo puedo trabajar en una hora, con una dinámica y preguntas para compartir?' + ref;
      var pre = el('p', { class: 'asis-prompt', text: prompt });
      var copy = el('button', { type: 'button', class: 'btn btn--sm btn--ghost', text: 'Copiar pregunta', onclick: function () {
        var done = function () { copy.textContent = '¡Copiada!'; setTimeout(function () { copy.textContent = 'Copiar pregunta'; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(prompt).then(done, function () {});
        else { var r = document.createRange(); r.selectNodeContents(pre); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); done(); }
      } });
      nbBox.appendChild(el('div', { class: 'stack', style: 'gap: 8px; flex: 1 1 420px; min-width: 0' }, [
        el('span', { class: 'eyebrow eyebrow--sun', style: 'font-size: 12px', text: 'Para profundizar · NotebookLM' }),
        el('strong', { style: 'font-size: 18px', text: 'Cuaderno: ' + nb.tema }),
        el('span', { class: 'small', style: 'color: var(--texto-claro)', text: 'Copiá esta pregunta y pegala en el cuaderno:' }),
        pre
      ]));
      nbBox.appendChild(el('div', { class: 'row', style: 'gap: 8px; align-self: flex-end' }, [copy, el('a', { class: 'btn btn--sm btn--sun', href: nb.url, target: '_blank', rel: 'noopener', text: 'Abrir cuaderno ↗' })]));
      nbBox.hidden = false;
    } else nbBox.hidden = true;

    // Etapa del itinerario relacionada
    var et = A.tema.map(function (k) { return TEMAS[k].etapa; }).filter(Boolean)[0];
    var nombres = ['', 'Armar la comunidad', 'Alianza de amor', 'Solidaridad de destinos', 'Misión'];
    var etLink = document.getElementById('asisEtapa');
    if (et) { etLink.hidden = false; etLink.href = 'itinerario.html#t-e' + et; etLink.textContent = 'Leer la etapa ' + et + ' del itinerario: ' + nombres[et]; }
    else etLink.hidden = true;
    var q = A.tema.length ? TEMAS[A.tema[0]].k[0] : (A.texto || '');
    document.getElementById('asisMore').href = 'biblioteca.html' + (q ? '?q=' + encodeURIComponent(q.trim()) : '');

    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Carga de datos ---------- */
  render();
  Promise.all([
    fetch('data/biblioteca.json').then(function (r) { return r.json(); }),
    fetch('data/fichas.json').then(function (r) { return r.ok ? r.json() : { fichas: [] }; }).catch(function () { return { fichas: [] }; })
  ]).then(function (res) {
    LIB = res[0].materiales.filter(function (m) { return m.acceso !== 'no-publicar'; });
    LIB.forEach(function (m) { m._t = norm(m.titulo); m._c = norm(m.carpeta); });
    (res[1].fichas || []).forEach(function (f) { FICHAS[idDe(f.url)] = f; });
  }).catch(function () {
    document.getElementById('asisHelp').textContent = 'No se pudo cargar la biblioteca. Si abriste el archivo directamente, levantá un servidor local (ver README).';
  });
})();
