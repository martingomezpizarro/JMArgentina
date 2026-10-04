/* Biblioteca: índice jerárquico, búsqueda y listado de materiales. */
(function () {
  var el = JM.el, norm = JM.norm;
  var CFG = window.JM_CONFIG || {};
  var PAGE = 40, MORE = 60;

  var treeBox = document.getElementById('libTree');
  var listBox = document.getElementById('libList');
  var moreBtn = document.getElementById('libMore');
  var countBox = document.getElementById('libCount');
  var titleBox = document.getElementById('libTitle');
  var crumbBox = document.getElementById('libCrumb');
  var input = document.getElementById('q');
  var filtersBox = document.getElementById('libFilters');

  document.getElementById('libContact').href = CFG.contactoAcceso || '#';
  document.getElementById('libDrive').href = CFG.carpetaDrive || '#';

  var params = new URLSearchParams(location.search);
  var state = { carpeta: params.get('carpeta') || '', q: params.get('q') || '', acceso: '', limit: PAGE };
  input.value = state.q;

  var data = { carpetas: [], materiales: [] };
  var counts = {};

  var LIC_TAG = {
    'Propio JM': 'tag--azul',
    'Magisterio': 'tag--crema',
    'Dominio público': 'tag--verde',
    'Con derechos de autor': 'tag--lila',
    'Copia no oficial': 'tag--rojo'
  };
  var FILTROS = [
    { v: '', l: 'Todos' },
    { v: 'abierto', l: 'De acceso libre' },
    { v: 'derechos', l: 'Con derechos' }
  ];

  function label(path) { var p = path.split(' / '); return p[p.length - 1]; }
  function depth(path) { return path.split(' / ').length; }
  function inBranch(path, sel) { return sel && (sel === path || sel.indexOf(path + ' / ') === 0); }
  function under(itemPath, sel) { return !sel || itemPath === sel || itemPath.indexOf(sel + ' / ') === 0; }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.carpeta) p.set('carpeta', state.carpeta);
    if (state.q) p.set('q', state.q);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function select(path) {
    state.carpeta = path;
    state.limit = PAGE;
    syncUrl();
    renderTree();
    renderList();
    if (window.innerWidth < 860) titleBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Todos los nodos del árbol, incluidos los intermedios que no figuran como carpeta propia. */
  function allNodes() {
    var set = {};
    data.carpetas.concat(data.materiales.map(function (m) { return m.carpeta; })).forEach(function (c) {
      var parts = c.split(' / ');
      for (var i = 1; i <= parts.length; i++) set[parts.slice(0, i).join(' / ')] = true;
    });
    return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'es', { numeric: true }); });
  }

  function renderTree() {
    treeBox.textContent = '';
    var all = el('button', { type: 'button', class: 'lvl-1', 'aria-current': state.carpeta === '' ? 'true' : null, onclick: function () { select(''); } },
      [el('span', { text: 'Toda la biblioteca' }), el('span', { class: 'count', text: String(visibles().length) })]);
    treeBox.appendChild(all);
    allNodes().forEach(function (path) {
      var d = depth(path);
      var parent = path.split(' / ').slice(0, -1).join(' / ');
      // Se muestran los dos primeros niveles; los más profundos, solo dentro de la rama elegida.
      if (d > 2 && !inBranch(parent, state.carpeta)) return;
      var cls = d === 1 ? 'lvl-1' : (inBranch(path, state.carpeta) && path !== state.carpeta ? 'in-branch' : '');
      var b = el('button', {
        type: 'button', class: cls, style: 'padding-left:' + (10 + (d - 1) * 16) + 'px',
        'aria-current': path === state.carpeta ? 'true' : null,
        onclick: function () { select(path); }
      }, [el('span', { text: label(path) }), el('span', { class: 'count', text: String(counts[path] || 0) })]);
      treeBox.appendChild(b);
    });
  }

  function visibles() {
    return data.materiales.filter(function (m) {
      return m.acceso !== 'no-publicar' || CFG.mostrarCopiasNoOficiales;
    });
  }

  function filtered() {
    var q = norm(state.q).trim();
    var words = q ? q.split(/\s+/) : [];
    return visibles().filter(function (m) {
      if (!under(m.carpeta, state.carpeta)) return false;
      if (state.acceso && m.acceso !== state.acceso) return false;
      if (!words.length) return true;
      var hay = m._n;
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }

  function linkFor(m) {
    if (m.acceso === 'abierto' || (m.acceso === 'derechos' && CFG.mostrarMaterialConDerechos)) {
      return el('a', { class: 'btn btn--sm btn--outline', href: m.url, target: '_blank', rel: 'noopener', text: m.formato === 'folder' ? 'Abrir carpeta ↗' : 'Abrir ↗', 'aria-label': 'Abrir ' + m.titulo + ' en Drive' });
    }
    if (m.acceso === 'derechos') {
      var subj = encodeURIComponent('Pedido de acceso: ' + m.titulo);
      var href = (CFG.contactoAcceso || '#').replace(/subject=[^&]*/, 'subject=' + subj);
      return el('a', { class: 'btn btn--sm btn--ghost', style: 'color: var(--azul); border-color: var(--linea-2)', href: href, text: 'Solicitar acceso' });
    }
    return el('span', { class: 'small muted', text: 'No disponible' });
  }

  function renderList() {
    var items = filtered();
    titleBox.textContent = state.carpeta ? label(state.carpeta) : 'Todos los materiales';
    crumbBox.textContent = state.carpeta ? state.carpeta.split(' / ').slice(0, -1).join(' › ') || 'Biblioteca' : 'Toda la biblioteca';
    countBox.textContent = items.length + (items.length === 1 ? ' material' : ' materiales') + (state.q ? ' para “' + state.q + '”' : '');
    listBox.textContent = '';
    if (!items.length) {
      listBox.appendChild(el('div', { class: 'lib-empty' }, [
        el('p', { text: 'No hay materiales que coincidan.' }),
        state.q ? el('button', { type: 'button', class: 'btn btn--sm btn--outline', style: 'margin-top: 12px', text: 'Borrar la búsqueda', onclick: function () { input.value = ''; state.q = ''; syncUrl(); renderList(); } }) : null
      ]));
      moreBtn.hidden = true;
      return;
    }
    items.slice(0, state.limit).forEach(function (m) {
      var sub = state.carpeta && m.carpeta === state.carpeta ? '' : m.carpeta.replace(/^\d+\.\s*/, '');
      listBox.appendChild(el('div', { class: 'lib-row' }, [
        el('span', { class: 'lib-ext', 'aria-hidden': 'true', text: (m.formato === 'folder' ? 'CARP' : m.formato).toUpperCase().slice(0, 4) }),
        el('span', { class: 'lib-title' }, [el('strong', { text: m.titulo }), sub ? el('span', { text: sub }) : null]),
        el('span', { class: 'tag ' + (LIC_TAG[m.licencia] || 'tag--suave'), text: m.licencia }),
        linkFor(m)
      ]));
    });
    var rest = items.length - state.limit;
    moreBtn.hidden = rest <= 0;
    moreBtn.textContent = 'Ver más (' + Math.max(rest, 0) + ' restantes)';
  }

  function renderFilters() {
    filtersBox.textContent = '';
    FILTROS.forEach(function (f) {
      filtersBox.appendChild(el('button', {
        type: 'button', class: 'chip' + (state.acceso === f.v ? ' is-active' : ''), 'aria-pressed': state.acceso === f.v ? 'true' : 'false', text: f.l,
        onclick: function () { state.acceso = f.v; state.limit = PAGE; renderFilters(); renderList(); }
      }));
    });
  }

  moreBtn.addEventListener('click', function () { state.limit += MORE; renderList(); });
  var t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value; state.limit = PAGE; syncUrl(); renderList(); }, 150);
  });
  document.getElementById('libSearch').addEventListener('submit', function () {
    state.q = input.value; state.limit = PAGE; syncUrl(); renderList();
  });

  listBox.appendChild(el('div', { class: 'lib-empty', text: 'Cargando la biblioteca…' }));
  fetch('data/biblioteca.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) {
      data = json;
      data.materiales.forEach(function (m) { m._n = norm(m.titulo + ' ' + m.carpeta + ' ' + m.licencia); });
      visibles().forEach(function (m) {
        var parts = m.carpeta.split(' / ');
        for (var i = 1; i <= parts.length; i++) {
          var k = parts.slice(0, i).join(' / ');
          counts[k] = (counts[k] || 0) + 1;
        }
      });
      document.getElementById('libTotal').textContent = visibles().length;
      renderFilters();
      renderTree();
      renderList();
    })
    .catch(function () {
      listBox.textContent = '';
      listBox.appendChild(el('div', { class: 'lib-empty', text: 'No se pudo cargar la biblioteca. Si abriste el archivo directamente, levantá un servidor local (ver README).' }));
    });
})();
