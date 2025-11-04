const CACHE_NAME = 'indyverse-ai-v9-' + Date.now();
const RUNTIME_CACHE = 'indyverse-runtime-ai-v9';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

const SKIP_CACHE_PATTERNS = [
  /\/api\//,
  /anthropic\.com/,
  /openai\.com/,
  /deepseek\.com/,
  /x\.ai/,
  /googleapis\.com/,
  /github\.com/
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (SKIP_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      // For HTML/navigation requests, always try network first to get fresh content
      if (request.destination === 'document' || request.mode === 'navigate') {
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
            return response;
          }
        } catch (err) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/offline.html');
        }
      }

      // For other resources, use cache-first strategy
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const response = await fetch(request);
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        if (url.origin === location.origin) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      } catch (err) {
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
        return new Response('Offline - content not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
