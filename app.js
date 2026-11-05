/* Unirversos · instalar como app: registra o service worker e avisa quando há versão nova */
(function () {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  var primeira = !navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (primeira) { primeira = false; return; }
    if (document.getElementById('uni-novo')) return;
    var b = document.createElement('button'); b.id = 'uni-novo'; b.type = 'button';
    b.textContent = '🔄 Atualizamos o site. Toque para recarregar.';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;border:0;border-radius:14px;padding:12px 14px;background:#3a2b38;color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);cursor:pointer';
    b.onclick = function () { location.reload(); };
    document.body.appendChild(b);
  });
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      var guardar = function () {
        var urls = performance.getEntriesByType('resource').map(function (r) { return r.name; }).filter(function (u) { return /^https:\/\/www\.gstatic\.com\/firebasejs\//.test(u) || u.indexOf(location.origin) === 0; });
        urls.push(location.href);
        var sw = reg.active || navigator.serviceWorker.controller; if (sw) sw.postMessage({ tipo: 'guardar', urls: urls });
      };
      navigator.serviceWorker.ready.then(function () { setTimeout(guardar, 1500); });
    }).catch(function () {});
  });
})();
