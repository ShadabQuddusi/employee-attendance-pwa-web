const CACHE='attendance-pwa-v2';
const ASSETS=['./','./index.html','./manifest.json','./css/app.css','./js/config.js','./js/api.js','./js/geofence.js','./js/device.js','./js/app.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
