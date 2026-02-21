const CACHE_NAME = 'player-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './auto-play.js', // se tiver script separado
  './player.js',    // se tiver script separado
  'https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js',
  // adicione aqui outros arquivos estáticos que queira offline
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Cacheando arquivos');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removendo cache antigo', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((res) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, res.clone());
              return res;
            });
          });
      })
      .catch(() => {
        // fallback opcional se estiver offline
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});
