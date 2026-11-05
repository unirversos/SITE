/* Unirversos · service worker (app instalável + funciona sem internet)
   Regra: com internet, SEMPRE busca a versão nova (rede primeiro). Sem internet, usa a última cópia guardada.
   Só mexe em arquivos do próprio site; Firebase, mapas e buscas passam direto, sem cache. */
const CACHE = 'unirversos-v1';
const PRE = ['/offline.html', '/manifest.webmanifest', '/travessia/calendario/', '/travessia/deslocamento/', '/favicon.svg', '/icones/icone-192.png'];
const SDK = /^https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\//;
const ESPERA = 3500; /* ms: se a rede demorar, mostra a cópia guardada */

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.tipo === 'guardar' && Array.isArray(d.urls)) {
    e.waitUntil(caches.open(CACHE).then(c => Promise.all(d.urls.slice(0, 80).map(u => {
      let url; try { url = new URL(u, self.location.origin); } catch (_) { return null; }
      if (url.origin !== self.location.origin && !SDK.test(url.href)) return null;
      return fetch(url.href).then(r => r.ok ? c.put(url.href, r) : null).catch(() => null);
    }))));
  }
});

function redePrimeiro(req) {
  return new Promise(resolve => {
    let feito = false;
    const guardada = () => caches.match(req).then(r => r || caches.match(req, { ignoreSearch: true }));
    const t = setTimeout(() => guardada().then(r => { if (r && !feito) { feito = true; resolve(r); } }), ESPERA);
    fetch(req).then(r => {
      clearTimeout(t);
      if (r && r.status === 200 && r.type === 'basic' && +(r.headers.get('content-length') || 0) < 5e6) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); }
      if (!feito) { feito = true; resolve(r); }
    }).catch(() => {
      clearTimeout(t);
      guardada().then(r => {
        if (feito) return; feito = true;
        if (r) return resolve(r);
        if (req.mode === 'navigate') return caches.match('/offline.html').then(o => resolve(o || Response.error()));
        resolve(Response.error());
      });
    });
  });
}
function cacheDepois(req) { /* SDK do Firebase (versão fixa na URL): cópia guardada primeiro */
  return caches.match(req).then(r => r || fetch(req).then(n => { if (n && (n.ok || n.type === 'opaque')) { const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); } return n; }));
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname === '/sw.js') return;
    e.respondWith(redePrimeiro(req)); return;
  }
  if (SDK.test(req.url)) e.respondWith(cacheDepois(req));
});
