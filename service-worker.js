const CACHE_NAME = 'myfinance-app-v1';
const urlsToCache = [
  // Pastikan semua path relatif terhadap root repositori GitHub Pages
  '/Financial-Notes-APP/', // Penting: cache root aplikasi
  '/Financial-Notes-APP/index.html',
  '/Financial-Notes-APP/manifest.json',
  // CSS
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  // JavaScript
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.16/jspdf.plugin.autotable.min.js',
  // Icons (pastikan Anda membuat folder 'icons' dan menempatkan ikon di dalamnya)
  '/Financial-Notes-APP/icons/icon-72x72.png',
  '/Financial-Notes-APP/icons/icon-96x96.png',
  '/Financial-Notes-APP/icons/icon-128x128.png',
  '/Financial-Notes-APP/icons/icon-144x144.png',
  '/Financial-Notes-APP/icons/icon-152x152.png',
  '/Financial-Notes-APP/icons/icon-192x192.png',
  '/Financial-Notes-APP/icons/icon-384x384.png',
  '/Financial-Notes-APP/icons/icon-512x512.png'
];

// Event: Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching shell assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Gagal menyimpan aset ke cache:', error);
      })
  );
});

// Event: Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Klaim klien agar halaman yang sudah terbuka menggunakan service worker baru
  return self.clients.claim();
});

// Event: Fetch (intercept network requests)
self.addEventListener('fetch', (event) => {
  // Hanya tangani permintaan HTTP/HTTPS, bukan chrome-extension:// atau lainnya
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Jika tidak ada di cache, lakukan fetch dari jaringan
          return fetch(event.request)
            .then((networkResponse) => {
              // Periksa apakah respons valid sebelum di-cache
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              // Penting: Klon respons karena stream hanya bisa dibaca sekali
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => {
              // Jika fetch gagal (offline), coba cari di cache untuk halaman offline
              // Ini bisa diperluas untuk menampilkan halaman offline khusus
              console.log('Service Worker: Fetch gagal, mencoba dari cache untuk offline.');
              // Anda bisa menambahkan logika untuk mengembalikan halaman offline.html di sini
              // return caches.match('/Financial-Notes-APP/offline.html'); // Contoh: jika ada halaman offline khusus
            });
        })
    );
  }
});
