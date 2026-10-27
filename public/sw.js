// Service Worker untuk Daisha Maintenance Desktop PWA
// v2: Network-Only untuk /api/** dan Network-First tanpa cache HTML dinamis
const CACHE_NAME = 'daisha-pwa-v2';

// Hanya cache aset statis murni (gambar ikon, manifest, favicon)
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo-bs.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// 1. Install Event: Pra-cache aset statis murni
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

// 2. Activate Event: Bersihkan seluruh cache lama (v1, dll) & klaim klien aktif
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

// 3. Fetch Event:
// - Network-Only untuk semua rute /api/** dan non-GET
// - Network-First murni untuk navigasi halaman HTML (tidak menyimpan HTML berstatus sesi ke cache)
// - Cache-First / Stale-While-Revalidate untuk bundle JS/CSS statis & ikon
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. NETWORK-ONLY: Seluruh rute API & request mutasi (POST, PUT, DELETE, dll)
  // Menjamin data tiket, spareparts, dan status alur request selalu 100% fresh dari PostgreSQL
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return; // Serahkan sepenuhnya ke browser network tanpa sentuh cache
  }

  // B. NETWORK-FIRST untuk Navigasi Halaman HTML
  // Pengguna selalu mendapatkan dokumen HTML halaman terbaru.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return new Response(
          '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/><title>Offline - Daisha Workshop</title><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#0f172a;text-align:center;"><div style="padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;max-width:360px;"><h2 style="margin:0 0 8px 0;color:#dc2626;">Anda Sedang Offline</h2><p style="font-size:14px;color:#64748b;margin:0 0 16px 0;">Sambungkan kembali perangkat Anda ke jaringan intranet/internet untuk memuat data workshop.</p><button onclick="window.location.reload()" style="padding:8px 16px;background:#0f172a;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Muat Ulang</button></div></body></html>',
          {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            status: 503,
            statusText: 'Service Unavailable (Offline)',
          }
        );
      })
    );
    return;
  }

  // C. CACHE-FIRST untuk Aset Statis Murni (_next/static, logo, font, icon)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate di background untuk aset statis
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});

// 4. Message Event untuk auto update PWA
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
