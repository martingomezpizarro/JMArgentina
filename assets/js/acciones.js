/*
 * Acciones con formulario: proponer un hito, solicitar acceso a un material y proponer material.
 * Cualquier botón con data-accion="proponer-hito" | "solicitar-acceso" | "proponer-material" las abre
 * (data-material="Título" completa el material en "solicitar-acceso").
 *
 * Inicio de sesión: este archivo no depende de Firebase. Espera un adaptador global JM_AUTH
 * (ver README, "Integración con el inicio de sesión") con esta forma:
 *   JM_AUTH.usuario()            → { uid, nombre, email } o null
 *   JM_AUTH.onCambio(cb)         → avisa cuando alguien entra o sale
 *   JM_AUTH.ingresar()           → abre el inicio de sesión (Promise)
 *   JM_AUTH.guardar(col, datos)  → guarda la propuesta, p. ej. en Firestore (Promise)
 * Mientras no exista, se usa el modo provisorio de config.js (acciones.modoProvisorio).
 */
(function () {
  var el = JM.el;
  var CFG = window.JM_CONFIG || {};
  var AC = CFG.acciones || {};
  var CATS = ['Encuentros nacionales', 'Corrientes de vida', 'Ideal', 'Símbolo', 'Misiones', 'Historia de una rama'];
  var RAMAS = ['Pioneros', 'Secundarios', 'Universitarios', 'Dirigentes / jefes', 'Asesor', 'Otro'];

  var ACCIONES = {
    'proponer-hito': {
      titulo: 'Proponer un hito', coleccion: 'propuestas_hitos',
      intro: 'Contanos un momento importante de la historia de la JM. El equipo nacional lo revisa antes de sumarlo a la línea del tiempo.',
      campos: [
        { id: 'anio', l: 'Año o fecha', req: true, ph: 'Ej.: 2009 o 15/08/2009' },
        { id: 'titulo', l: 'Título del hito', req: true, ph: 'Ej.: Primer campamento nacional de Pioneros' },
        { id: 'tipo', l: 'Tipo de hito', tipo: 'select', ops: CATS },
        { id: 'descripcion', l: '¿Qué pasó?', tipo: 'textarea', req: true, ph: 'Dónde fue, quiénes participaron, por qué fue importante…' },
        { id: 'fuente', l: 'Fuente o material de respaldo', ph: 'Link a fotos, documento, conclusiones… (opcional)' }
      ]
    },
    'solicitar-acceso': {
      titulo: 'Solicitar acceso a un material', coleccion: 'solicitudes_acceso',
      intro: 'Este material tiene derechos de autor vigentes, por eso no se publica abierto. Se comparte para uso formativo dentro de la JM.',
      campos: [
        { id: 'material', l: 'Material', req: true, soloLectura: true },
        { id: 'uso', l: '¿Para qué lo vas a usar?', tipo: 'textarea', req: true, ph: 'Ej.: preparar un taller con mi grupo de universitarios' },
        { id: 'compromiso', l: 'Me comprometo a usarlo solo para la formación dentro de la JM y a no redistribuirlo.', tipo: 'check', req: true }
      ]
    },
    'proponer-material': {
      titulo: 'Proponer material o una corrección', coleccion: 'propuestas_material',
      intro: 'Sumá un taller, libro o recurso a la biblioteca, o avisanos si algo está mal ubicado.',
      campos: [
        { id: 'titulo', l: 'Título del material', req: true },
        { id: 'link', l: 'Link (Drive u otro)', ph: 'https://…' },
        { id: 'carpeta', l: '¿Dónde iría?', tipo: 'select', ops: ['1. Talleres', '2. Libros', '3. Recursos', '4. Con María, pasión que transforma', 'No sé'] },
        { id: 'descripcion', l: 'Descripción o corrección', tipo: 'textarea', req: true, ph: 'De qué trata, para qué rama sirve, o qué hay que corregir' }
      ]
    }
  };

  /* ---------- Ventana ---------- */
  var dlg = el('dialog', { class: 'modal modal--form', 'aria-labelledby': 'accTitulo' });
  var inner = el('div', { class: 'modal-inner' });
  dlg.appendChild(inner);
  document.body.appendChild(dlg);
  dlg.addEventListener('close', function () { document.body.classList.remove('has-modal'); });
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });

  function abrirDlg() {
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
    document.body.classList.add('has-modal');
  }
  function cabecera(t) {
    return el('div', { class: 'row between', style: 'align-items: flex-start; gap: 12px' }, [
      el('h2', { class: 'h3', id: 'accTitulo', text: t }),
      el('button', { type: 'button', class: 'modal-close', 'aria-label': 'Cerrar', text: '✕', onclick: function () { dlg.close(); } })
    ]);
  }

  function auth() { return window.JM_AUTH || null; }
  function usuario() { var a = auth(); return a && a.usuario ? a.usuario() : null; }

  function abrir(nombre, datos) {
    var acc = ACCIONES[nombre];
    if (!acc) return;
    inner.textContent = '';
    inner.appendChild(cabecera(acc.titulo));
    var a = auth();
    var fbOn = CFG.firebase && CFG.firebase.apiKey && CFG.firebase.projectId;
    if (fbOn && !a) {
      inner.appendChild(el('p', { text: 'Conectando con el inicio de sesión…' }));
      abrirDlg();
      document.addEventListener('jm-auth-listo', function () { if (dlg.open) abrir(nombre, datos); }, { once: true });
      return;
    }

    // Con inicio de sesión disponible y obligatorio: pedir ingreso primero.
    if (a && AC.requiereLogin !== false && !usuario()) {
      inner.appendChild(el('p', { text: 'Para ' + acc.titulo.toLowerCase() + ' tenés que ingresar con tu cuenta de Google. Es la misma cuenta que se usa en el calendario.' }));
      inner.appendChild(el('button', { type: 'button', class: 'btn btn--primary', style: 'align-self: flex-start', text: 'Ingresar con Google', onclick: function () {
        Promise.resolve(a.ingresar()).then(function () { if (usuario()) abrir(nombre, datos); });
      } }));
      abrirDlg();
      return;
    }
    // Sin inicio de sesión todavía y modo provisorio desactivado.
    if (!a && AC.modoProvisorio !== 'correo') {
      inner.appendChild(el('p', { text: 'Muy pronto vas a poder hacerlo iniciando sesión. Estamos habilitando el ingreso para los miembros de la JM.' }));
      abrirDlg();
      return;
    }

    var u = usuario();
    var form = el('form', { class: 'acc-form', novalidate: true });
    form.appendChild(el('p', { class: 'muted small', text: acc.intro }));
    var campos = acc.campos.slice();
    if (!u) {
      campos = [
        { id: 'nombre', l: 'Tu nombre', req: true },
        { id: 'email', l: 'Tu correo', req: true, tipo: 'email' },
        { id: 'rama', l: 'Rama o ciudad', ph: 'Ej.: Universitarios · Córdoba' }
      ].concat(campos);
    } else {
      form.appendChild(el('p', { class: 'small', text: 'Enviás como ' + (u.nombre || u.email) + '.' }));
      campos = [{ id: 'rama', l: 'Rama o ciudad', ph: 'Ej.: Universitarios · Córdoba' }].concat(campos);
    }
    campos.forEach(function (c) {
      var id = 'acc-' + c.id, ctrl;
      if (c.tipo === 'textarea') ctrl = el('textarea', { id: id, name: c.id, rows: '4', class: 'input', placeholder: c.ph || '', required: c.req || null });
      else if (c.tipo === 'select') ctrl = el('select', { id: id, name: c.id, class: 'input' }, c.ops.map(function (o) { return el('option', { value: o, text: o }); }));
      else if (c.tipo === 'check') {
        form.appendChild(el('label', { class: 'acc-check', for: id }, [el('input', { type: 'checkbox', id: id, name: c.id, required: c.req || null }), el('span', { text: c.l })]));
        return;
      } else ctrl = el('input', { id: id, name: c.id, type: c.tipo || 'text', class: 'input', placeholder: c.ph || '', required: c.req || null, readonly: c.soloLectura || null });
      if (datos && datos[c.id]) ctrl.value = datos[c.id];
      form.appendChild(el('label', { class: 'acc-field', for: id }, [el('span', { text: c.l + (c.req ? ' *' : '') }), ctrl]));
    });
    var err = el('p', { class: 'acc-error', role: 'alert' });
    form.appendChild(err);
    var nota = !a ? el('p', { class: 'small muted', text: 'Por ahora el pedido se envía por correo: al tocar “Enviar” se abre tu programa de correo con todo completo.' }) : null;
    if (nota) form.appendChild(nota);
    form.appendChild(el('div', { class: 'row', style: 'gap: 8px' }, [
      el('button', { type: 'submit', class: 'btn btn--primary', text: 'Enviar' }),
      el('button', { type: 'button', class: 'btn btn--outline', text: 'Cancelar', onclick: function () { dlg.close(); } })
    ]));
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { err.textContent = 'Completá los campos marcados con *.'; var bad = form.querySelector(':invalid'); if (bad) bad.focus(); return; }
      err.textContent = '';
      var datosForm = {};
      campos.forEach(function (c) { var f = form.elements[c.id]; if (f) datosForm[c.id] = c.tipo === 'check' ? f.checked : f.value.trim(); });
      datosForm.pagina = location.pathname.split('/').pop() || 'index.html';
      datosForm.fecha = new Date().toISOString();
      if (u) { datosForm.uid = u.uid; datosForm.nombre = u.nombre || ''; datosForm.email = u.email || ''; }
      enviar(acc, datosForm);
    });
    inner.appendChild(form);
    abrirDlg();
    var first = form.querySelector('input:not([readonly]), textarea, select');
    if (first) first.focus();
  }

  function enviar(acc, d) {
    var a = auth();
    if (a && a.guardar) {
      Promise.resolve(a.guardar(acc.coleccion, d)).then(function () { gracias(acc, false); }, function () {
        var e = inner.querySelector('.acc-error'); if (e) e.textContent = 'No se pudo enviar. Probá de nuevo en un rato.';
      });
      return;
    }
    // Modo provisorio: correo con todo completo.
    var dest = AC.correo || ((CFG.contactoAcceso || '').replace(/^mailto:/, '').split('?')[0]);
    var cuerpo = Object.keys(d).filter(function (k) { return k !== 'fecha'; }).map(function (k) { return k + ': ' + (d[k] === true ? 'sí' : d[k]); }).join('\n');
    location.href = 'mailto:' + dest + '?subject=' + encodeURIComponent(acc.titulo + (d.material ? ': ' + d.material : d.titulo ? ': ' + d.titulo : '')) + '&body=' + encodeURIComponent(cuerpo);
    gracias(acc, true);
  }

  function gracias(acc, correo) {
    inner.textContent = '';
    inner.appendChild(cabecera('¡Gracias!'));
    inner.appendChild(el('p', { text: correo
      ? 'Se abrió tu correo con el pedido listo. Solo falta que lo envíes. Si no se abrió, escribinos a ' + (AC.correo || (CFG.contactoAcceso || '').replace(/^mailto:/, '').split('?')[0]) + '.'
      : 'Recibimos tu pedido. El equipo nacional lo va a revisar y te va a responder por correo.' }));
    inner.appendChild(el('button', { type: 'button', class: 'btn btn--primary', style: 'align-self: flex-start', text: 'Listo', onclick: function () { dlg.close(); } }));
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-accion]');
    if (!b) return;
    ev.preventDefault();
    abrir(b.getAttribute('data-accion'), { material: b.getAttribute('data-material') || '' });
  });

  window.JM_ACCIONES = { abrir: abrir };
})();
