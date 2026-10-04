/* Recorrido guiado de la página de inicio: resalta cada parte y explica para qué sirve. */
(function () {
  var PASOS = [
    { sel: '[data-tour="itinerario"]', t: 'El itinerario, en el centro', x: 'Es la guía para dirigentes y portadores: el texto completo con las cuatro etapas del grupo de vida. Todo lo demás de la página ayuda a recorrerlo.' },
    { sel: '[data-tour="itinerario"]', t: 'Diagnóstico del grupo', x: 'Dentro del itinerario, al costado del texto, está el diagnóstico: nueve preguntas de sí o no que te dicen en qué etapa está tu grupo, qué pasos dar y qué material usar.' },
    { sel: '[data-tour="biblioteca"]', t: 'La biblioteca', x: 'Todo el material de la JM, sin repetidos, ordenado en un índice: Talleres, Libros, Recursos y “Con María, pasión que transforma”. Cada archivo abre en Drive.' },
    { sel: '[data-tour="buscar"]', t: 'Buscador', x: 'Si ya sabés qué buscás, escribilo acá: “alianza”, “Kentenich”, “encíclica”… Te lleva a la biblioteca con los resultados.' },
    { sel: '[data-tour="asistente"]', t: 'El asistente', x: 'Si no sabés por dónde empezar, el asistente te hace preguntas concretas (para quién, para qué, qué tema) y te recomienda material explicando por qué.' },
    { sel: '[data-tour="cuadernos"]', t: 'Cuadernos de NotebookLM', x: 'Para profundizar: cada cuaderno tiene las fuentes de un tema y responde citando los textos. Ideal para preparar un encuentro.' },
    { sel: '[data-tour="historia"]', t: 'Historia de la JM', x: 'La línea del tiempo de la JM Argentina, el Ideal Nacional y el símbolo. Cada hito tiene su ficha.' },
    { sel: '[data-tour="tour"]', t: '¡Listo!', x: 'Podés volver a hacer este recorrido cuando quieras desde este botón. Te recomendamos empezar por el itinerario.' }
  ];
  var box = document.getElementById('tour');
  var start = document.getElementById('startTour');
  if (!box || !start) return;
  var spot = document.getElementById('tourSpot'), pop = document.getElementById('tourPop');
  var i = 0, lastFocus = null;

  function place() {
    var p = PASOS[i];
    var target = document.querySelector(p.sel);
    if (!target) return;
    var r = target.getBoundingClientRect();
    var pad = 8;
    spot.style.top = (r.top - pad) + 'px';
    spot.style.left = (r.left - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';
    var pw = pop.offsetWidth, ph = pop.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var top = r.bottom + 16;
    if (top + ph > vh - 12) top = r.top - ph - 16;
    if (top < 12) top = Math.max(12, vh - ph - 12);
    var left = Math.min(Math.max(12, r.left), vw - pw - 12);
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  function show(n) {
    i = Math.max(0, Math.min(PASOS.length - 1, n));
    var p = PASOS[i];
    document.getElementById('tourStep').textContent = 'Paso ' + (i + 1) + ' de ' + PASOS.length;
    document.getElementById('tourTitle').textContent = p.t;
    document.getElementById('tourText').textContent = p.x;
    document.getElementById('tourPrev').disabled = i === 0;
    document.getElementById('tourNext').textContent = i === PASOS.length - 1 ? 'Terminar' : 'Siguiente';
    var target = document.querySelector(p.sel);
    if (target) {
      var r = target.getBoundingClientRect();
      var visible = r.top > 80 && r.bottom < window.innerHeight - 220;
      if (!visible) {
        window.scrollTo({ top: window.scrollY + r.top - Math.max(90, (window.innerHeight - r.height) / 3), behavior: 'auto' });
      }
    }
    place();
    document.getElementById('tourNext').focus();
  }

  function open() {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add('has-modal');
    var toast = document.getElementById('tourToast');
    if (toast) toast.remove();
    try { localStorage.setItem('jm-tour-visto', '1'); } catch (e) {}
    show(0);
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove('has-modal');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  start.addEventListener('click', open);
  document.getElementById('tourNext').addEventListener('click', function () { if (i === PASOS.length - 1) close(); else show(i + 1); });
  document.getElementById('tourPrev').addEventListener('click', function () { show(i - 1); });
  document.getElementById('tourSkip').addEventListener('click', close);
  spot.parentNode.addEventListener('click', function (ev) { if (ev.target === box) close(); });
  document.addEventListener('keydown', function (ev) {
    if (box.hidden) return;
    if (ev.key === 'Escape') close();
    if (ev.key === 'ArrowRight') document.getElementById('tourNext').click();
    if (ev.key === 'ArrowLeft' && i > 0) show(i - 1);
  });
  window.addEventListener('resize', function () { if (!box.hidden) place(); });
  window.addEventListener('scroll', function () { if (!box.hidden) place(); }, { passive: true });

  // La primera vez, ofrecer el recorrido con un aviso discreto.
  var visto = false;
  try { visto = localStorage.getItem('jm-tour-visto') === '1'; } catch (e) {}
  if (!visto) {
    var t = JM.el('div', { class: 'tour-toast', id: 'tourToast', role: 'status' }, [
      JM.el('span', null, [JM.el('strong', { text: '¿Primera vez acá? ' }), 'Te mostramos la plataforma en un minuto.']),
      JM.el('div', { class: 'row', style: 'gap: 8px' }, [
        JM.el('button', { type: 'button', class: 'btn btn--sun btn--sm', text: 'Ver el recorrido', onclick: open }),
        JM.el('button', { type: 'button', class: 'btn btn--ghost btn--sm', text: 'Ahora no', onclick: function () { t.remove(); try { localStorage.setItem('jm-tour-visto', '1'); } catch (e) {} } })
      ])
    ]);
    setTimeout(function () { document.body.appendChild(t); }, 1200);
  }
})();
