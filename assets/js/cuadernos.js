/* Cuadernos: tarjetas de NotebookLM por tema, filtrables por etapa. */
(function () {
  var el = JM.el;
  var CUADERNOS = (window.JM_CONFIG || {}).cuadernos || [];
  var ETAPAS = ['Todas', 'Etapa 1', 'Etapa 2', 'Etapa 3', 'Etapa 4'];
  var grid = document.getElementById('nbGrid');
  var filters = document.getElementById('nbFilters');
  var sel = 0;

  function render() {
    filters.textContent = '';
    ETAPAS.forEach(function (l, i) {
      filters.appendChild(el('button', {
        type: 'button', class: 'pill', role: 'radio', 'aria-checked': sel === i ? 'true' : 'false', text: l,
        onclick: function () { sel = i; render(); }
      }));
    });
    grid.textContent = '';
    CUADERNOS.filter(function (c) { return sel === 0 || c.etapas.indexOf(sel) !== -1; }).forEach(function (c) {
      var activo = !!c.url;
      grid.appendChild(el('article', { class: 'card' + (activo ? '' : ' card--dashed') }, [
        el('div', { class: 'row between', style: 'gap: 8px' }, [
          el('span', { class: 'tag ' + (activo ? 'tag--azul' : 'tag--suave'), text: activo ? 'Activo' : 'Propuesto' }),
          el('span', { class: 'small muted', text: 'Etapas ' + c.etapas.join(', ') })
        ]),
        el('h3', { class: 'h3', text: c.tema }),
        el('p', { class: 'small', text: c.descripcion }),
        el('p', { class: 'small', style: 'background: var(--fondo-2); border-radius: 12px; padding: 10px 12px; color: var(--tinta-2)' }, [
          el('strong', { text: 'Probá preguntarle: ' }), '“' + c.pregunta + '”'
        ]),
        activo
          ? el('a', { class: 'btn btn--primary btn--sm', style: 'align-self: flex-start; margin-top: auto', href: c.url, target: '_blank', rel: 'noopener', text: 'Abrir en NotebookLM ↗' })
          : el('span', { class: 'small muted', style: 'margin-top: auto', text: 'Todavía no está creado.' })
      ]));
    });
  }
  render();
})();
