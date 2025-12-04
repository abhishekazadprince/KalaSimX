const CACHE_NAME = 'kala-simux-v24-ultimate';

// We explicitly cache the CDNs so the app works even without internet later
const EXTERNAL_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap'
];

// Local files to cache
const APP_SHELL = [
  './',
  './index.html', // IMPORTANT: Your main HTML file MUST be named index.html
  './manifest.json',
  './Kala-SimuX.png'
];

// 1. Install Phase
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // We try to cache everything, but we don't fail if one local file is missing (except the start url)
      return cache.addAll([...EXTERNAL_ASSETS, ...APP_SHELL]).catch(err => {
        console.warn('Some assets failed to cache, but app will still install:', err);
      });
    })
  );
});

// 2. Activate Phase (Cleanup)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// 3. Fetch Phase (Offline Capability)
self.addEventListener('fetch', event => {
  // Navigation requests (HTML) - Network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // Asset requests - Cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache new assets we encounter
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
