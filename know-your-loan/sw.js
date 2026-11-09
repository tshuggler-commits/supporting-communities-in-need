/* Offline support. Everything the app needs is saved on the phone the first time it loads.
   Change VERSION when you change any file, so phones pick up the new copy on the next launch.
   There is no forced update: the new copy is used after the app is closed and opened again. */
const VERSION = 'kyl-v4';
const ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'js/calc.js',
  'js/app.js',
  'locales/en.js',
  'locales/es.js',
  'locales/fr.js',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || fetch(event.request))
  );
});
