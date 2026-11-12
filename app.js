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

/* Botão "Instalar" na barra do topo: abre o pedido do navegador (Android/computador) ou mostra o passo a passo (iPhone e outros). */
(function () {
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var alvo = document.querySelector('.sitebar .navlinks') || document.querySelector('.nav .links');
  if (!alvo) return;
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var evt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); evt = e; });
  window.addEventListener('appinstalled', function () { var x = document.querySelector('.uni-inst'); if (x) x.remove(); });
  var st = document.createElement('style');
  st.textContent = '.uni-inst{display:inline-flex;align-items:center;margin-left:8px}.uni-inst button{display:inline-flex;align-items:center;gap:6px;border:1px solid #9c2f4c;background:#fff;color:#9c2f4c;font:inherit;font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px;cursor:pointer;white-space:nowrap}'
    + '#uni-inst-dlg{position:fixed;inset:0;z-index:99998;background:rgba(58,43,56,.55);display:flex;align-items:center;justify-content:center;padding:16px}#uni-inst-dlg div{background:#fff;color:#3a2b38;max-width:380px;border-radius:16px;padding:18px 20px;font:15px/1.5 system-ui,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.35)}#uni-inst-dlg h2{margin:0 0 8px;font-size:18px}#uni-inst-dlg ol{margin:8px 0 12px;padding-left:20px}#uni-inst-dlg button{border:0;background:#c4405f;color:#fff;font:700 14px system-ui,sans-serif;padding:8px 18px;border-radius:999px;cursor:pointer}';
  document.head.appendChild(st);
  function dialogo() {
    var d = document.createElement('div'); d.id = 'uni-inst-dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Instalar o app');
    var passos = ios
      ? '<li>Abra este site no <b>Safari</b> (em outro navegador não aparece).</li><li>Toque no botão <b>Compartilhar</b> (o quadrado com uma seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li>'
      : '<li>Abra o <b>menu do navegador</b> (⋮ ou ⋯).</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li><li>Se a opção não aparecer, navegue uns segundos pelo site e tente de novo.</li>';
    d.innerHTML = '<div><h2>Instalar o app</h2><ol>' + passos + '</ol><button type="button">Entendi</button></div>';
    d.onclick = function (e) { if (e.target === d || e.target.tagName === 'BUTTON') d.remove(); };
    document.body.appendChild(d);
  }
  var c = document.createElement('span'); c.className = 'uni-inst';
  c.innerHTML = '<button type="button"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg><span>Instalar</span></button>';
  c.firstChild.onclick = function () {
    if (evt) { var e = evt; evt = null; e.prompt(); e.userChoice && e.userChoice.then(function (r) { if (r && r.outcome === 'accepted') c.remove(); }); }
    else dialogo();
  };
  alvo.appendChild(c);
})();
