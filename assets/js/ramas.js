/*
 * Ramas: mapa de santuarios + fichas de cada rama.
 * Los datos están en data/ramas.json (santuarios y ramas).
 */
(function () {
  var el = JM.el;
  var D = { santuarios: [], ramas: [] };
  var mapa, marcadores = {}, activo = null;

  var PIN = function (color, size) {
    return '<svg class="jm-pin" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M15 1C7.3 1 1 7.1 1 14.7 1 25 15 37 15 37s14-12 14-22.3C29 7.1 22.7 1 15 1z" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
      '<path d="M15 7l7 8.5-1.2 1.3-.7 7.7H9.9l-.7-7.7L8 15.5z" fill="#fff"/>' +
      '<path d="M15.6 13.2c-1.8 1.4-2.4 3.6-1.3 5.3.5.8 1.6 1 2.2.2.7-.9.1-1.8-.4-2.6-.5-.9-.8-1.9-.5-2.9z" fill="' + color + '"/></svg>';
  };

  function iconoPara(s, on) {
    var color = s.tipo === 'ermita' ? '#5B8FBF' : '#205487';
    if (on) color = '#1B1F4F';
    return L.divIcon({
      className: '',
      html: PIN(color).replace('class="jm-pin"', 'class="jm-pin' + (on ? ' is-active' : '') + '"'),
      iconSize: on ? [40, 50] : [30, 38],
      iconAnchor: on ? [20, 49] : [15, 37],
      tooltipAnchor: [0, on ? -44 : -34]
    });
  }

  function ramasDeProvincia(prov) {
    return D.ramas.filter(function (r) { return r.provincia === prov; });
  }

  function iniciales(nombre) {
    return nombre.replace(/^JM\s+/i, '').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function comoLlegar(s) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Santuario de Schoenstatt ' + s.direccion + ', ' + s.ciudad + ', ' + s.provincia + ', Argentina');
  }

  function tarjetaRama(r) {
    var faltan = camposFaltantes(r);
    return el('button', { class: 'rama-card', type: 'button', onclick: function () { abrirFicha(r); } }, [
      el('span', { class: 'rama-ico', text: iniciales(r.nombre) }),
      el('span', { style: 'flex:1;min-width:0' }, [
        el('strong', { text: r.nombre }),
        el('span', { text: r.provincia + (faltan ? ' · ficha a completar' : '') })
      ]),
      el('span', { 'aria-hidden': 'true', style: 'font-weight:800;color:var(--azul)', text: '→' })
    ]);
  }

  function seleccionar(id, mover) {
    var s = D.santuarios.find(function (x) { return x.id === id; });
    if (!s) return;
    if (activo && marcadores[activo]) {
      var prev = D.santuarios.find(function (x) { return x.id === activo; });
      marcadores[activo].setIcon(iconoPara(prev, false)).setZIndexOffset(0);
    }
    activo = id;
    marcadores[id].setIcon(iconoPara(s, true)).setZIndexOffset(1000);
    if (mover) mapa.flyTo([s.lat, s.lng], Math.max(mapa.getZoom(), 11), { duration: 0.8 });

    document.querySelectorAll('#provList button').forEach(function (b) {
      b.setAttribute('aria-current', b.dataset.id === id ? 'true' : 'false');
      if (b.dataset.id === id) b.closest('details').open = true;
    });

    var ramas = ramasDeProvincia(s.provincia);
    var propias = ramas.filter(function (r) { return r.santuario === s.id; });
    var panel = document.getElementById('santPanel');
    panel.innerHTML = '';
    panel.appendChild(el('p', { class: 'eyebrow', text: (s.tipo === 'ermita' ? 'Ermita' : 'Santuario') + ' · ' + s.provincia }));
    panel.appendChild(el('h2', { text: s.nombre }));
    panel.appendChild(el('p', { class: 'small', text: s.direccion + ' · ' + s.ciudad }));
    if (s.nota) panel.appendChild(el('p', { class: 'small muted', text: s.nota }));
    panel.appendChild(el('a', { class: 'btn btn--outline btn--sm', href: comoLlegar(s), target: '_blank', rel: 'noopener', style: 'align-self:flex-start', text: 'Cómo llegar ↗' }));
    panel.appendChild(el('strong', { style: 'margin-top:6px', text: ramas.length ? 'Ramas de ' + s.provincia : 'Ramas de ' + s.provincia }));
    if (!ramas.length) {
      panel.appendChild(el('p', { class: 'small muted', text: 'Todavía no hay fichas de ramas en esta provincia. Si tu rama se reúne acá, escribinos por Instagram @jm.argentina.' }));
    } else {
      // Primero las ramas de este santuario, después el resto de la provincia.
      propias.concat(ramas.filter(function (r) { return propias.indexOf(r) < 0; })).forEach(function (r) {
        panel.appendChild(tarjetaRama(r));
      });
    }
    if (window.matchMedia('(max-width: 960px)').matches && !mover) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function camposFaltantes(r) {
    var n = 0;
    if (!r.descripcion) n++;
    if (!r.instagram) n++;
    if (!r.encuentros) n++;
    if (!(r.actividades || []).length) n++;
    if (!(r.fotos || []).length && !r.cantidadFotos) n++;
    if (!r.video) n++;
    if (!r.jefe || !r.jefe.nombre) n++;
    return n;
  }

  function pendiente(txt) { return el('span', { class: 'pending', text: txt || 'A completar' }); }

  function seccion(titulo, contenido) {
    return el('div', { class: 'ficha-sec' }, [el('h3', { text: titulo })].concat(contenido));
  }

  function linkInstagram(v) {
    var user = String(v).trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
    return el('a', { href: 'https://www.instagram.com/' + encodeURIComponent(user) + '/', target: '_blank', rel: 'noopener', text: '@' + user + ' ↗' });
  }

  function videoNodo(url) {
    var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (m) {
      return el('div', { class: 'video-box' }, [el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + m[1], title: 'Video de la rama', loading: 'lazy',
        allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: true
      })]);
    }
    return el('a', { href: url, target: '_blank', rel: 'noopener', text: 'Ver video ↗' });
  }

  function abrirFicha(r) {
    var dlg = document.getElementById('fichaModal');
    var body = document.getElementById('fichaBody');
    var s = D.santuarios.find(function (x) { return x.id === r.santuario; });
    document.getElementById('fichaTitulo').textContent = r.nombre;
    body.innerHTML = '';

    var faltan = camposFaltantes(r);
    body.appendChild(el('div', { class: 'row', style: 'gap:8px' }, [
      el('span', { class: 'tag tag--suave', text: r.provincia }),
      s ? el('span', { class: 'tag tag--celeste', text: 'Santuario ' + s.nombre }) : null,
      faltan ? el('span', { class: 'tag tag--crema', text: 'Ficha a completar' }) : el('span', { class: 'tag tag--verde', text: 'Ficha completa' })
    ]));

    body.appendChild(seccion('Quiénes somos', [r.descripcion ? el('p', { text: r.descripcion }) : el('p', { class: 'muted small' }, ['Una breve presentación de la rama: historia, cuántos son, qué los caracteriza. ', pendiente()])]));

    body.appendChild(seccion('Encuentros', [
      el('dl', { class: 'kv' }, [
        el('dt', { text: 'Cuándo' }), el('dd', {}, [r.encuentros ? r.encuentros : pendiente()]),
        el('dt', { text: 'Grupos de vida' }), el('dd', {}, [r.gruposDeVida ? String(r.gruposDeVida) : pendiente()]),
        el('dt', { text: 'Jefe de rama' }), el('dd', {}, [r.jefe && r.jefe.nombre ? r.jefe.nombre : pendiente()]),
        el('dt', { text: 'Contacto' }), el('dd', {}, [r.contacto ? r.contacto : pendiente()])
      ])
    ]));

    var acts = (r.actividades || []);
    body.appendChild(seccion('Actividades', acts.length
      ? [el('ul', { class: 'list-plain' }, acts.map(function (a) { return el('li', { text: typeof a === 'string' ? a : a.nombre }); }))]
      : [el('p', { class: 'muted small' }, ['Misiones, campamentos, jornadas, peregrinaciones, encuentros de rama… ', pendiente()])]));

    var grilla = el('div', { class: 'ficha-fotos' });
    var pintarFotos = function (fotos) {
      grilla.innerHTML = '';
      (fotos.length ? fotos.map(function (f) { return el('img', { src: f, alt: 'Foto de ' + r.nombre, loading: 'lazy' }); })
        : [1, 2, 3].map(function () { return el('div', { class: 'ph', text: 'Foto a completar' }); })).forEach(function (n) { grilla.appendChild(n); });
    };
    pintarFotos(r.fotos || []);
    if (!(r.fotos || []).length && r.cantidadFotos && window.JM_AUTH) {
      window.JM_AUTH.fotosFicha(r.id).then(function (f) { r.fotos = f; pintarFotos(f); }).catch(function () {});
    }
    body.appendChild(seccion('Fotos', [grilla]));

    body.appendChild(seccion('Video', [r.video ? videoNodo(r.video) : el('p', { class: 'muted small' }, ['Un video de YouTube de la rama. ', pendiente()])]));

    body.appendChild(seccion('Instagram', [r.instagram ? linkInstagram(r.instagram) : pendiente()]));

    if (s) {
      body.appendChild(seccion('Santuario', [
        el('p', { text: s.nombre + ' · ' + s.direccion + ', ' + s.ciudad }),
        el('a', { class: 'btn btn--outline btn--sm', href: comoLlegar(s), target: '_blank', rel: 'noopener', style: 'align-self:flex-start', text: 'Cómo llegar ↗' })
      ]));
    }

    if (r.actualizadoPor) body.appendChild(el('p', { class: 'small muted', text: 'Última actualización: ' + r.actualizadoPor + '.' }));
    body.appendChild(accesoEdicion(r));
    if (!dlg.open) dlg.showModal();
    fichaAbierta = r;
  }

  /* ---------- Edición (solo jefes de la rama y admin) ---------- */
  var usuario = null, fichaAbierta = null;

  function accesoEdicion(r) {
    var box = el('div', { class: 'ficha-sec' });
    var A = window.JM_AUTH;
    if (A && A.puedeEditarRama(r.nombre)) {
      box.appendChild(el('button', { class: 'btn btn--primary', type: 'button', style: 'align-self:flex-start', text: camposFaltantes(r) ? 'Completar la ficha' : 'Editar la ficha', onclick: function () { abrirEditor(r); } }));
      return box;
    }
    var p = el('p', { class: 'small muted' });
    if (!A) {
      p.append('¿Sos jefe de esta rama? Mandá la información por Instagram a ', el('a', { href: 'https://www.instagram.com/jm.argentina/', target: '_blank', rel: 'noopener', text: '@jm.argentina' }), '.');
      box.appendChild(p);
    } else if (!usuario) {
      p.textContent = 'Las fichas las completan los jefes de cada rama. Si sos jefe de ' + r.nombre + ', ingresá con tu cuenta de Google.';
      box.appendChild(p);
      box.appendChild(el('button', { class: 'btn btn--outline btn--sm', type: 'button', style: 'align-self:flex-start', text: 'Ingresar con Google (jefes)', onclick: function () {
        A.ingresar().catch(function (e) { alert('No se pudo ingresar: ' + (e && e.message)); });
      } }));
    } else {
      p.append('Solo el jefe de ' + r.nombre + ' y el administrador pueden completar esta ficha. Si sos el jefe y no te deja, pedile al administrador que te asigne esta rama, o escribinos por Instagram a ',
        el('a', { href: 'https://www.instagram.com/jm.argentina/', target: '_blank', rel: 'noopener', text: '@jm.argentina' }), '.');
      box.appendChild(p);
    }
    return box;
  }

  function campo(id, label, valor, opts) {
    opts = opts || {};
    var input = opts.area
      ? el('textarea', { class: 'input', id: id, rows: opts.rows || 4, maxlength: opts.max || 3000, placeholder: opts.ph || '' })
      : el('input', { class: 'input', id: id, type: opts.type || 'text', maxlength: opts.max || 300, placeholder: opts.ph || '', min: opts.min });
    input.value = valor == null ? '' : valor;
    return el('div', { class: 'field' + (opts.full ? ' full' : '') }, [el('label', { for: id, text: label }), input, opts.hint ? el('span', { class: 'hint', text: opts.hint }) : null]);
  }

  function achicarImagen(file, lado, maxChars) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var l = lado, out;
        do {
          var esc = Math.min(1, l / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * esc); c.height = Math.round(img.naturalHeight * esc);
          var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
          var q = 0.82; out = c.toDataURL('image/jpeg', q);
          while (out.length > maxChars && q > 0.45) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
          l = Math.round(l * 0.8);
        } while (out.length > maxChars && l > 300);
        res(out);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen.')); };
      img.src = url;
    });
  }

  async function abrirEditor(r) {
    var body = document.getElementById('fichaBody');
    document.getElementById('fichaTitulo').textContent = 'Ficha de ' + r.nombre;
    body.innerHTML = '';
    body.appendChild(el('p', { class: 'small muted', text: 'Lo que cargues acá lo ve todo el mundo en la página. Completá lo que tengas; se puede editar cuando quieras.' }));
    var fotos = (r.fotos || []).slice();
    if (!fotos.length && r.cantidadFotos) { try { fotos = await window.JM_AUTH.fotosFicha(r.id); } catch (e) {} }

    var form = el('form', { class: 'form', novalidate: true });
    form.appendChild(campo('fDesc', 'Quiénes somos', r.descripcion, { area: true, full: true, rows: 5, ph: 'Historia de la rama, cuántos son, qué los caracteriza…' }));
    form.appendChild(campo('fEnc', 'Encuentros', r.encuentros, { ph: 'Ej.: sábados 17 h en el santuario', max: 500 }));
    form.appendChild(campo('fGrupos', 'Cantidad de grupos de vida', r.gruposDeVida, { type: 'number', min: '0' }));
    form.appendChild(campo('fJefe', 'Jefe de rama', r.jefe && r.jefe.nombre, { ph: 'Nombre y apellido' }));
    form.appendChild(campo('fContacto', 'Contacto', r.contacto, { ph: 'WhatsApp o correo de la rama', hint: 'Va a ser público: mejor un contacto de la rama que uno personal.' }));
    form.appendChild(campo('fIg', 'Instagram', r.instagram, { ph: '@jm.ejemplo' }));
    form.appendChild(campo('fVideo', 'Video de YouTube', r.video, { type: 'url', ph: 'https://youtu.be/…', max: 400 }));
    form.appendChild(campo('fActs', 'Actividades (una por línea)', (r.actividades || []).map(function (a) { return typeof a === 'string' ? a : a.nombre; }).join('\n'), { area: true, full: true, rows: 5, ph: 'Misión de verano\nCampamento de Pioneros\nPeregrinación al santuario' }));

    var grilla = el('div', { class: 'ficha-fotos' });
    var inputFotos = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'visually-hidden', id: 'fFotos' });
    var pintar = function () {
      grilla.innerHTML = '';
      fotos.forEach(function (f, i) {
        grilla.appendChild(el('div', { style: 'position:relative' }, [
          el('img', { src: f, alt: 'Foto ' + (i + 1) }),
          el('button', { type: 'button', class: 'dlg-close', style: 'position:absolute;top:6px;right:6px;width:34px;height:34px;font-size:18px', 'aria-label': 'Quitar foto ' + (i + 1), text: '×', onclick: function () { fotos.splice(i, 1); pintar(); } })
        ]));
      });
      if (fotos.length < 6) grilla.appendChild(el('label', { class: 'ph', for: 'fFotos', style: 'cursor:pointer', text: '+ Agregar foto' }));
    };
    inputFotos.addEventListener('change', async function () {
      var files = Array.prototype.slice.call(inputFotos.files, 0, 6 - fotos.length);
      for (var i = 0; i < files.length; i++) {
        try { fotos.push(await achicarImagen(files[i], 1000, 125000)); } catch (e) { alert(e.message); }
      }
      inputFotos.value = '';
      pintar();
    });
    pintar();
    form.appendChild(el('div', { class: 'field full' }, [el('span', { class: 'label', text: 'Fotos (hasta 6)' }), grilla, inputFotos, el('span', { class: 'hint', text: 'Se achican automáticamente para que carguen rápido.' })]));
    var msg = el('div', { class: 'full', role: 'alert' });
    form.appendChild(msg);
    var guardar = el('button', { class: 'btn btn--primary', type: 'submit', text: 'Guardar ficha' });
    form.appendChild(el('div', { class: 'row full', style: 'justify-content:flex-end' }, [
      el('button', { class: 'btn btn--outline', type: 'button', text: 'Cancelar', onclick: function () { abrirFicha(r); } }), guardar
    ]));

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      var video = v('fVideo');
      if (video && !/^https?:\/\//i.test(video)) { msg.innerHTML = '<p class="form-msg form-msg--error">El video tiene que ser un link que empiece con https://</p>'; return; }
      var datos = {
        nombre: r.nombre,
        descripcion: v('fDesc'), encuentros: v('fEnc'),
        gruposDeVida: v('fGrupos') ? Math.max(0, parseInt(v('fGrupos'), 10) || 0) : null,
        jefe: { nombre: v('fJefe') }, contacto: v('fContacto'), instagram: v('fIg'), video: video,
        actividades: v('fActs').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 20)
      };
      guardar.disabled = true; guardar.textContent = 'Guardando…';
      try {
        await window.JM_AUTH.guardarFicha(r.id, datos, fotos);
        Object.assign(r, datos, { fotos: fotos, cantidadFotos: fotos.length, actualizadoPor: (usuario && usuario.nombre) || '' });
        refrescarGrilla();
        abrirFicha(r);
      } catch (e) {
        var txt = e && (e.code === 'permission-denied' || /permission/i.test(e.message)) ? 'tu cuenta no tiene permiso para esta rama. Pedile al administrador que te asigne como jefe de ' + r.nombre + '.' : (e && e.message) || 'error desconocido';
        msg.innerHTML = '';
        msg.appendChild(el('p', { class: 'form-msg form-msg--error', text: 'No se pudo guardar: ' + txt }));
      } finally { guardar.disabled = false; guardar.textContent = 'Guardar ficha'; }
    });
    body.appendChild(form);
    document.getElementById('fDesc').focus();
  }

  function refrescarGrilla() {
    var g = document.getElementById('ramasGrid');
    g.innerHTML = '';
    D.ramas.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }).forEach(function (x) { g.appendChild(tarjetaRama(x)); });
  }

  // Trae las fichas completadas por los jefes (Firestore) y las suma a las de data/ramas.json.
  function conectarAuth() {
    var A = window.JM_AUTH;
    if (!A) return;
    A.fichas().then(function (remotas) {
      D.ramas.forEach(function (r) {
        var x = remotas[r.id];
        if (x && x.nombre === r.nombre) Object.assign(r, x);
      });
      refrescarGrilla();
    }).catch(function () {});
    A.onCambio(function (u) {
      usuario = u;
      var dlg = document.getElementById('fichaModal');
      if (fichaAbierta && dlg.open && !document.querySelector('#fichaBody form')) abrirFicha(fichaAbierta);
    });
  }

  function armarLista() {
    var porProv = {};
    D.santuarios.forEach(function (s) { (porProv[s.provincia] = porProv[s.provincia] || []).push(s); });
    // Provincias con ramas pero sin santuario también aparecen (para poder abrir sus fichas).
    D.ramas.forEach(function (r) { if (!porProv[r.provincia]) porProv[r.provincia] = []; });
    var box = document.getElementById('provList');
    Object.keys(porProv).sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (prov) {
      var lista = porProv[prov];
      var ramas = ramasDeProvincia(prov);
      var det = el('details', {}, [
        el('summary', {}, [el('span', { text: prov }), el('span', { class: 'count', text: lista.length + (lista.length === 1 ? ' santuario' : ' santuarios') + ' · ' + ramas.length + (ramas.length === 1 ? ' rama' : ' ramas') })])
      ]);
      lista.forEach(function (s) {
        det.appendChild(el('button', { type: 'button', 'data-id': s.id, onclick: function () { seleccionar(s.id, true); } }, [
          s.nombre, el('span', { text: (s.tipo === 'ermita' ? 'Ermita · ' : '') + s.ciudad })
        ]));
      });
      if (!lista.length) {
        ramas.forEach(function (r) {
          det.appendChild(el('button', { type: 'button', onclick: function () { abrirFicha(r); } }, [r.nombre, el('span', { text: 'Rama sin santuario cargado · abrir ficha' })]));
        });
      }
      box.appendChild(det);
    });
  }

  function armarGrilla() {
    var g = document.getElementById('ramasGrid');
    D.ramas.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }).forEach(function (r) { g.appendChild(tarjetaRama(r)); });
    var provs = {};
    D.santuarios.forEach(function (s) { provs[s.provincia] = 1; });
    var st = document.getElementById('ramasStats');
    [[D.santuarios.filter(function (s) { return s.tipo !== 'ermita'; }).length, 'santuarios'], [Object.keys(provs).length, 'provincias'], [D.ramas.length, 'ramas con ficha']].forEach(function (x) {
      st.appendChild(el('span', { class: 'tag tag--sun', style: 'font-size:14px;padding:8px 14px', text: x[0] + ' ' + x[1] }));
    });
  }

  function armarMapa() {
    mapa = L.map('mapa', { zoomSnap: 0.5, scrollWheelZoom: false, minZoom: 3, maxZoom: 17 });
    mapa.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    var ign = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
      attribution: '<a href="https://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank" rel="noopener">Instituto Geográfico Nacional</a> + OpenStreetMap',
      maxZoom: 18
    });
    ign.addTo(mapa);
    // Si los mapas del IGN no responden, se usa el mapa base estándar del IGN en color.
    var errores = 0;
    ign.on('tileerror', function () {
      errores++;
      if (errores === 6) {
        mapa.removeLayer(ign);
        L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
          attribution: '<a href="https://www.ign.gob.ar/" target="_blank" rel="noopener">Instituto Geográfico Nacional</a> + OpenStreetMap', maxZoom: 18
        }).addTo(mapa);
      }
    });
    mapa.fitBounds([[-55.1, -73.6], [-21.8, -53.6]]);
    mapa.on('click', function () { mapa.scrollWheelZoom.enable(); });

    D.santuarios.forEach(function (s) {
      var m = L.marker([s.lat, s.lng], { icon: iconoPara(s, false), title: s.nombre, alt: s.nombre, keyboard: true })
        .bindTooltip(s.nombre + ' · ' + s.ciudad, { className: 'jm-tip', direction: 'top' })
        .on('click', function () { seleccionar(s.id, false); })
        .addTo(mapa);
      marcadores[s.id] = m;
    });
  }

  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('dialog').close(); });
  });
  document.getElementById('fichaModal').addEventListener('click', function (e) { if (e.target === this && !document.querySelector('#fichaBody form')) this.close(); });
  document.getElementById('fichaModal').addEventListener('close', function () { fichaAbierta = null; });

  fetch('data/ramas.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    armarMapa();
    armarLista();
    armarGrilla();
    if (window.JM_AUTH) conectarAuth(); else document.addEventListener('jm-auth-listo', conectarAuth, { once: true });
    var q = new URLSearchParams(location.search).get('santuario');
    if (q && marcadores[q]) seleccionar(q, true);
  }).catch(function () {
    document.getElementById('santPanel').innerHTML = '<p>No se pudieron cargar los santuarios. Probá recargar la página.</p>';
  });
})();
