// Service Worker untuk Daisha Maintenance Desktop PWA
const CACHE_NAME = 'daisha-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo-bs.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// 1. Install Event: Pra-cache aset dasar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Bersihkan cache versi lama & klaim klien aktif
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Network-First untuk Data Realtime & Halaman
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan cache permintaan API, biarkan selalu network langsung untuk data SQLite real-time
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  // Strategi Network-First dengan Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          (url.pathname.startsWith('/_next/static/') || STATIC_ASSETS.includes(url.pathname))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Jika offline dan membuka halaman, kembalikan shell cache '/'
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// 4. Message Event untuk auto update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
