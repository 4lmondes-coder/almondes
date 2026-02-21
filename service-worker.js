const CACHE_NAME = 'player-douglas-cache-v1';
const PRECACHE = [
  './',
  'https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js',
  'player.js',
  'auto-play.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  if (
    event.request.url.startsWith('chrome-extension:') ||
    event.request.url.startsWith('data:') ||
    event.request.url.startsWith('blob:')
  ) return;
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;
      return fetch(event.request).then(fetchResp => {
        if (fetchResp && fetchResp.ok) {
          const copy = fetchResp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return fetchResp;
      }).catch(() => caches.match('./'));
    })
  );
});
