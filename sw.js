const APP="jml-app-v2",TILES="jml-tiles";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png",
"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css","https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(APP).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
// 頁面本身：有網路時拿最新版，離線時用快取
if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(APP).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"))));return}
// 通用電子地圖、正射影像圖磚：先用快取
if(u.hostname==="wmts.nlsc.gov.tw"){e.respondWith(caches.open(TILES).then(c=>c.match(e.request.url).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==="opaque")c.put(e.request.url,n.clone());return n}))));return}
// Leaflet、字型：先用快取
if(u.hostname==="cdnjs.cloudflare.com"||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(APP).then(c=>c.put(e.request,cp));return n})));return}
});
