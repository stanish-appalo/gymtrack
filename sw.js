// GymTrack service worker — offline support (only caches successful responses)
const CACHE = 'gymtrack-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'assets/exmap.js', 'assets/library.js', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') {        // only cache successful same-origin responses
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      if (req.mode === 'navigate') {
        const fb = await caches.match('index.html');
        if (fb) return fb;
      }
      throw err;
    }
  })());
});
