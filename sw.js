/*
 * Service worker de JM Argentina: permite instalar el sitio como app en el celular
 * y abrir las páginas ya visitadas sin conexión.
 * Cuando cambies archivos importantes, subí el número de VERSION para renovar la caché.
 */
var VERSION = 'jm-v7';
var BASE = [
  './',
  'index.html',
  'itinerario.html',
  'biblioteca.html',
  'cuadernos.html',
  'historia.html',
  'asistente.html',
  'calendario.html',
  'ramas.html',
  '404.html',
  'manifest.webmanifest',
  'assets/css/styles.css',
  'assets/css/editorial.css',
  'assets/fonts/barlow-condensed-latin-700-normal.woff2',
  'assets/fonts/jetbrains-mono-latin-500-normal.woff2',
  'assets/js/config.js',
  'assets/js/common.js',
  'assets/js/motor.js',
  'assets/js/chat.js',
  'assets/js/acciones.js',
  'data/biblioteca.json',
  'data/fichas.json',
  'assets/img/jm-simbolo.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Solo cacheamos archivos del propio sitio. Firebase, Google y los mapas van siempre a la red.
  if (url.origin !== self.location.origin) return;

  // Páginas y datos: primero la red (para ver siempre lo último), si no hay conexión, la caché.
  if (req.mode === 'navigate' || url.pathname.endsWith('.json')) {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
    }));
    return;
  }

  // Estilos, scripts e imágenes: primero la caché, y se actualiza en segundo plano.
  e.respondWith(caches.match(req).then(function (cached) {
    var red = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return cached; });
    return cached || red;
  }));
});
