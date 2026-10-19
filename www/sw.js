/* Offline-Cache für die Web-Version (Installation über „Zum Startbildschirm hinzufügen“) */
var CACHE='mitarbeit-v2';
var FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','capacitor.js'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
/* Erst Netz (damit Updates ankommen), ohne Netz aus dem Cache */
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(function(r){
    var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);});
    return r;
  }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('index.html');});}));
});
