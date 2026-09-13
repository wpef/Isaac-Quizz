/* Isaac Theorycraft Trainer — offline-first service worker.
 * App shell: network-first (so deploys show up), falls back to cache.
 * Sprites / fonts / data chunks: cache-first (immutable, hashed or versioned paths).
 */
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => ![SHELL, ASSETS].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

  const isAsset = /^\/(sprites|fonts|icons|assets)\//.test(url.pathname);
  if (isAsset) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Navigation + shell: network first, cache fallback (offline).
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) caches.open(SHELL).then((c) => c.put(request, res.clone()));
        return res;
      })
      .catch(async () => (await caches.match(request)) || (await caches.match('/index.html'))),
  );
});
