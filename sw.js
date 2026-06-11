/* sw.js — la galería funciona aunque no haya señal.
   Estrategia: cache-first con revalidación en segundo plano (stale-while-revalidate).
   Sube la versión al cambiar assets para limpiar cachés viejos. */
const VERSION = 'esli-v1';
const ASSETS = [
  './', 'index.html', 'css/style.css',
  'js/art.js', 'js/sprites.js', 'js/data.js', 'js/board.js',
  'js/modes.js', 'js/battle.js', 'js/ui.js', 'js/main.js',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      const refresh = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || refresh;
    })
  );
});
