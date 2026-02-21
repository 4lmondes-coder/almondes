const CACHE_NAME = 'player-cache-v1';
const PRECACHE = ['./', 'manifest.json', 'index.html', 'icons/icon-192.png','icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  if(e.request.url.startsWith('chrome-extension:')||e.request.url.startsWith('data:')||e.request.url.startsWith('blob:')) return;
  e.respondWith(
    caches.match(e.request).then(resp=>resp||fetch(e.request).then(r=>{caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone())); return r;}))
  );
});
