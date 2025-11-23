const CACHE_NAME = 'physics-app-v5';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event - caches the files
self.addEventListener('install', event => {
  self.skipWaiting(); // Forces this new worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event - cleans up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Takes control of the page immediately
});

// Fetch event - serves from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
