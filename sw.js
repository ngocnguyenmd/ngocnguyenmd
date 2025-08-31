// sw.js
const CACHE_NAME = 'movie-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/index1.html',
    '/phim-han.html',
    '/phim-trung.html',
    '/phim-viet.html',
    '/phim-my.html',
    '/truyen-hinh.html',
    '/hoat-hinh.html',
    '/netflix.html',
    '/ykhoa.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});