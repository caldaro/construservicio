const CACHE = 'construservicio-os-v2';
const ASSETS = ['./','./index.html','./manifest.json','./sw.js','./css/styles.css','./js/app.js','./js/calculator.js','./js/signature.js','./js/pdf-engine.js','./js/whatsapp-bridge.js','./vendor/jspdf.umd.min.js','./assets/icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match('./index.html')))));
