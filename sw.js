/* Offline-Cache für die Web-App: erst Netz (damit Updates ankommen), bei fehlendem oder langsamem Netz aus dem Cache */
var CACHE='mitarbeit-v4';
var FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','pdf.js','lib/jspdf.umd.min.js','lib/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function fromNet(req){
  return new Promise(function(res,rej){
    var t=setTimeout(function(){rej(new Error('timeout'));},3500);
    fetch(req).then(function(r){clearTimeout(t);res(r);},function(err){clearTimeout(t);rej(err);});
  });
}
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(fromNet(e.request).then(function(r){
    if(r&&r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);});}
    return r;
  }).catch(function(){
    return caches.match(e.request,{ignoreSearch:true}).then(function(m){return m||caches.match('index.html');});
  }));
});
