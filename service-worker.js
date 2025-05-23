const CACHE_NAME = 'walkie-talkie-cache-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});