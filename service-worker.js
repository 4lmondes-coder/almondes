const CACHE_NAME='player-cache-v1';
const FILES_TO_CACHE=['./','./index.html','./manifest.json','https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES_TO_CACHE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>key!==CACHE_NAME?caches.delete(key):null))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(resp=>resp||fetch(e.request).then(res=>caches.open(CACHE_NAME).then(c=>{c.put(e.request,res.clone());return res;}))).catch(()=>e.request.destination==='document'?caches.match('./index.html'):null));});
