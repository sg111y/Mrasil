// يكفي رفع الملفات المعدَّلة: يكتشف التطبيق تلقائيًا أن index.html أو tarajim.js تغيّر ويعرض إشعار التحديث.
const V='almursalun-v2';
const F=['./','index.html','tarajim.js','manifest.webmanifest','icon-192.png','icon-512.png'];
const WATCH=['index.html','tarajim.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'}))))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
async function check(){
  try{
    const c=await caches.open(V);let changed=false;
    for(const u of WATCH){
      const r=await fetch(u,{cache:'no-store'});
      if(!r.ok)continue;
      const old=await c.match(u);
      const fresh=await r.clone().text();
      if(!old){await c.put(u,r);continue}
      if(fresh!==await old.text()){await c.put(u,r);changed=true}
    }
    if(changed)(await self.clients.matchAll()).forEach(x=>x.postMessage('UPDATE'));
  }catch(e){}
}
self.addEventListener('message',e=>{
  if(e.data==='SKIP_WAITING')self.skipWaiting();
  if(e.data==='CHECK')e.waitUntil(check());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(e.request,c));return res})));
});
