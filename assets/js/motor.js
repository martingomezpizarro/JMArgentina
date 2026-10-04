/*
 * Motor del asistente: reglas de temas y ramas + puntaje de cada material.
 * Lo usa el chat (assets/js/chat.js). Datos: data/biblioteca.json y data/fichas.json.
 * Las fichas (resúmenes de NotebookLM) mejoran el puntaje: temas, ramas, etapas, formato y utilidad.
 */
window.JM_MOTOR = (function () {
  var norm = JM.norm;
  var CFG = window.JM_CONFIG || {};

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


  var LIB = [], FICHAS = {}, listo = null;

  function idDe(url) { var m = /\/d\/([^/?]+)/.exec(url || '') || /[?&]id=([^&]+)/.exec(url || '') || /folders\/([^/?]+)/.exec(url || ''); return m ? m[1] : url; }

  function cargar() {
    if (listo) return listo;
    listo = Promise.all([
      fetch('data/biblioteca.json').then(function (r) { return r.json(); }),
      fetch('data/fichas.json').then(function (r) { return r.ok ? r.json() : { fichas: [] }; }).catch(function () { return { fichas: [] }; })
    ]).then(function (res) {
      LIB = res[0].materiales.filter(function (m) { return m.acceso !== 'no-publicar'; });
      LIB.forEach(function (m) { m._t = norm(m.titulo); m._c = norm(m.carpeta); });
      (res[1].fichas || []).forEach(function (f) { FICHAS[idDe(f.url)] = f; });
      return true;
    });
    return listo;
  }

  function inferir(q, A) {
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

  function contiene(n, lista) { return lista.filter(function (k) { return n.indexOf(k) !== -1; }); }

  function contiene(n, lista) { return lista.filter(function (k) { return n.indexOf(k) !== -1; }); }

  function puntuar(m, A) {
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

    // Formato declarado en la ficha
    if (f && f.formato) {
      var fl = norm(f.formato);
      if (A.formato === 'listo' && /taller|dinamica|charla|guia|rito/.test(fl)) s += 2;
      if (A.formato === 'leer' && /libro|lectura|documento/.test(fl)) s += 2;
    }

    // Rama
    if (A.rama && A.rama !== 'cualquiera') {
      var fichaRama = f && f.ramas && f.ramas.length ? f.ramas.indexOf(A.rama) !== -1 : null;
      var propia = fichaRama === true || contiene(c + ' ' + t, RAMAS[A.rama].k).length > 0;
      var otra = Object.keys(RAMAS).some(function (r) { return r !== A.rama && r !== 'dirigentes' && contiene(c, RAMAS[r].k).length > 0; });
      if (propia) { s += 4; por.push('Pensado para ' + RAMAS[A.rama].l); }
      else if (fichaRama === false) s -= 3;
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
      var hay = t + ' ' + (f ? norm((f.resumen || '') + ' ' + (f.para_que || '')) : '');
      var hits = words.filter(function (w) { return hay.indexOf(w.slice(0, 6)) !== -1; });
      if (hits.length) { s += 3 * hits.length; por.push('Coincide con lo que escribiste'); }
    }

    // Ficha (resumen de NotebookLM / selección del itinerario)
    if (f) {
      s += f.utilidad === 3 ? 3 : 2;
      var et = f.etapas || (f.etapa ? [f.etapa] : []);
      if (A.etapa && et.indexOf(A.etapa) !== -1) { s += 4; por.push('Sirve para la etapa ' + A.etapa + ' del itinerario'); }
      else if (et.length === 1) por.push('Recomendado para la etapa ' + et[0] + ' del itinerario');
    }

    if (m.acceso === 'derechos' && !CFG.mostrarMaterialConDerechos) s -= 1;
    return { s: s, por: por, ficha: f };
  }

  function recomendar(A, n) {
    var vistos = {};
    var lista = LIB.map(function (m) { var r = puntuar(m, A); r.m = m; return r; })
      .filter(function (r) { return r.s >= 4; })
      .sort(function (a, b) { return b.s - a.s || a.m.titulo.localeCompare(b.m.titulo); })
      .filter(function (r) {
        var key = norm(r.m.titulo).replace(/\.(pdf|docx?|pptx?)$/, '').replace(/[^a-z0-9]/g, '');
        var dup = Object.keys(vistos).some(function (k) { var a = k.slice(0, 22), b = key.slice(0, 22); return a === b || (Math.min(k.length, key.length) >= 10 && (k.indexOf(key) === 0 || key.indexOf(k) === 0)); });
        if (dup) return false; vistos[key] = true; return true;
      });
    var top = lista.length ? lista[0].s : 0;
    lista.forEach(function (r) { r.nivel = r.s >= top * 0.75 ? 'Muy útil' : (r.s >= top * 0.45 ? 'Útil' : 'Complementario'); });
    return lista.slice(0, n || 9);
  }

  function cuaderno(A) {
    var cs = CFG.cuadernos || [];
    var idx = A.tema.length ? TEMAS[A.tema[0]].nb : 0;
    return cs[idx] && cs[idx].url ? cs[idx] : cs.filter(function (c) { return c.url; })[0];
  }

  function preguntaNotebook(A, lista) {
    var quien = A.rama && A.rama !== 'cualquiera' ? RAMAS[A.rama].l.toLowerCase() : 'mi grupo';
    var sobre = A.tema.map(function (k) { return TEMAS[k].l.toLowerCase(); }).join(', ') || A.texto || 'este tema';
    var ref = lista && lista[0] ? ' Usá como base “' + lista[0].m.titulo + '”.' : '';
    return 'Estoy preparando un encuentro para ' + quien + ' sobre ' + sobre + '. ¿Qué dicen las fuentes y cómo lo puedo trabajar en una hora, con una dinámica y preguntas para compartir?' + ref;
  }

  function etapaDe(A) { return A.etapa || A.tema.map(function (k) { return TEMAS[k].etapa; }).filter(Boolean)[0] || null; }

  function linkMaterial(m) {
    var abierto = m.acceso === 'abierto' || (m.acceso === 'derechos' && CFG.mostrarMaterialConDerechos);
    return abierto ? { href: m.url, abierto: true } : { href: null, abierto: false };
  }

  return {
    TEMAS: TEMAS, RAMAS: RAMAS, PREGUNTAS: PREGUNTAS,
    cargar: cargar, inferir: inferir, recomendar: recomendar,
    cuaderno: cuaderno, preguntaNotebook: preguntaNotebook, etapaDe: etapaDe, linkMaterial: linkMaterial,
    fichas: function () { return FICHAS; }, idDe: idDe
  };
})();
