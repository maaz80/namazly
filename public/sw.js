const CACHE_NAME = 'namazly-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// Service Worker Install phase
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm up cache with core files for offline PWA requirements
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force active immediately
  self.skipWaiting();
});

// Activate phase - remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Clearing legacy service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Claim active clients instantly
  self.clients.claim();
});

// Strict Network-First fetch strategy
// This guarantees the absolute newest files are fetched from the server/network instantly
// on app load/reload, while falling back to cache ONLY when completely offline.
self.addEventListener('fetch', (event) => {
  // Only handle standard GET requests
  if (event.request.method !== 'GET') return;

  // Don't intercept chrome-extension or external URLs
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If fetch succeeds, clone response, refresh cache, and return immediately
        if (networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback strictly to cache only when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If neither, fail standardly
          return new Response('Offline: Connection required for this resource', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});
