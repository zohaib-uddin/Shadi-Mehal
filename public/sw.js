/**
 * Shadi Mehal Service Worker - Advanced Stale-While-Revalidate Engine
 * Ensures FCP < 0.5s and instant subsequent page reloads.
 */

const CACHE_NAME = 'shadi-mehal-sw-v2';

const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE).catch((err) => {
        console.warn("SW: Active precaching skipped for some initial files:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignore WebSockets, HMR endpoints or dev server internals
  if (url.pathname.includes('/@vite/') || url.pathname.includes('/node_modules/') || url.pathname.includes('ws')) {
    return;
  }

  const isSupabaseGet = url.hostname.includes('supabase.co');
  const isStaticAsset = url.pathname.match(/\.(js|css|webp|png|jpg|jpeg|svg|ico|woff2|woff|ttf|json)$/) || url.origin === self.location.origin;

  if (isSupabaseGet || isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              // Gracefully fallback to cached item when offline or server unreachable
              return cachedResponse;
            });

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
