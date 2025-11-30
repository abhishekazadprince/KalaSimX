// --- KALA-SIMUX SERVICE WORKER V11 ---
// Optimized for Standalone Installation on all browsers (Chrome, Opera, etc.)

const CACHE_NAME = 'kala-simux-v11-standalone';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Kala-SimuX.png', // Ensure this file exists and has NO spaces in name
  // External Dependencies required for offline functionality
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap'
];

// 1. INSTALL EVENT
// Forces the SW to wait until all critical files are cached.
// If any file in URLS_TO_CACHE fails (e.g., image not found), installation fails.
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching Core Files for Offline Support');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => console.error('SW: Critical Cache Failure', err))
  );
});

// 2. ACTIVATE EVENT
// Cleans up old caches to ensure the new icon/manifest logic takes over.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages immediately
});

// 3. FETCH EVENT
// Serves cached content when offline.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache if available, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});
