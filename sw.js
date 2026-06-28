const CACHE_NAME = 'tuji-pwa-v1';
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  OFFLINE_URL
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Basic cache-first strategy with navigation fallback to offline page
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      // Optionally cache fetched assets (simple runtime cache)
      if (event.request.method === 'GET' && resp && resp.status === 200 && resp.type !== 'opaque') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
      }
      return resp;
    }).catch(() => {
      // If image request fails, could return a data URI or a placeholder image if added to cache
      return caches.match('/icon-192.png');
    }))
  );
});
