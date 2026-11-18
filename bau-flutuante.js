/* Unirversos · Baú flutuante: aba na borda direita (acima da aba do Caderno) que abre a lista de ferramentas
   sem sair da página. Tem botão "Recolher", e ao escolher uma ferramenta guarda de onde a pessoa veio:
   na página da ferramenta aparece "← Voltar para ..." que leva de volta ao mesmo lugar (e à mesma rolagem).
   Sempre começa recolhido. */
(function () {
  if (window.top !== window) return;
  var KEY = 'uni-bau', VK = 'uni-bau-volta', RK = 'uni-bau-ret', TTL = 6 * 3600 * 1000;
  try { localStorage.removeItem(KEY); } catch (e) {}

  var path = location.pathname, atual = path + location.search;
  /* nestas páginas o baú já está na tela (/idiomas/) ou o foco é o jogo (Planeta Utopia) */
  if (path === '/idiomas/' || path === '/idiomas/index.html' || path.indexOf('/idiomas/nova/') === 0 || path.indexOf('/idiomas/planeta-utopia/') === 0) return;

  function lerJSON(k) { try { var v = JSON.parse(sessionStorage.getItem(k) || 'null'); return v && (Date.now() - (v.t0 || 0) < TTL) ? v : null; } catch (e) { return null; } }
  function gravar(k, v) { try { v.t0 = Date.now(); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function apagar(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* voltou com "Voltar": devolve a rolagem de onde a pessoa estava */
  var ret = lerJSON(RK);
  if (ret) {
    apagar(RK);
    if (ret.u === atual && ret.y) { var vai = function () { window.scrollTo(0, ret.y); }; setTimeout(vai, 250); window.addEventListener('load', function () { setTimeout(vai, 150); }); }
  }

  var ITENS = [
    ['praticar', [
      ['絵', '/idiomas/avatar/', 'Meu avatar'], ['言', '/idiomas/palavras/', 'Minhas palavras'], ['あ', '/idiomas/hiragana/', 'Hiragana'], ['ア', '/idiomas/katakana/', 'Katakana'],
      ['漢', '/idiomas/kanji/', 'Kanji'], ['数', '/idiomas/numeros/', 'Números'], ['暦', '/idiomas/calendario/', 'Calendário'], ['声', '/idiomas/gravador/', 'Gravador']]],
    ['consultar', [
      ['守', '/idiomas/amuleto/', 'Amuleto de bolso'], ['風', '/idiomas/ar/', 'Ar'], ['道', '/idiomas/guia/', 'Mini guia']]]
  ];

  var css = document.createElement('style');
  css.textContent =
    /* a barra de pílulas "Ferramentas" é substituída pelo baú */
    '.trail .caixa{display:none!important}' +
    '#bz-aba{position:fixed;right:0;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 11px;border:2px solid #e6d3a3;border-right:0;border-left:6px solid #C0913F;border-radius:18px 0 0 18px;background:#fff;color:#3a2b38;font:800 17px "Zen Maru Gothic",system-ui,sans-serif;cursor:pointer;box-shadow:-6px 8px 20px -12px rgba(58,43,56,.35)}' +
    '#bz-aba span{writing-mode:vertical-rl;letter-spacing:.1em}#bz-aba svg{width:26px;height:26px;stroke:#8f6a25;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}#bz-aba:hover{background:#fffaf0}' +
    /* celular: as abas viram pílulas na base da tela (não cobrem mais o conteúdo) */
    '@media (max-width:700px){#bz-aba{top:auto!important;bottom:max(10px,env(safe-area-inset-bottom,0px))!important;left:10px!important;right:auto!important;flex-direction:row;gap:8px;padding:8px 16px;min-height:44px;border:2px solid #e6d3a3;border-left:2px solid #e6d3a3;border-radius:999px;font-size:15px;box-shadow:0 8px 18px -10px rgba(58,43,56,.45)}#bz-aba span{writing-mode:horizontal-tb;letter-spacing:.02em}#bz-aba svg{width:20px;height:20px}body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}}' +
    '#bz-aba:focus-visible,#bz-p button:focus-visible,#bz-p a:focus-visible,#bz-chip button:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    '#bz-p{position:fixed;right:0;top:0;bottom:0;z-index:9001;width:min(380px,96vw);display:flex;flex-direction:column;gap:6px;padding:16px 18px calc(16px + env(safe-area-inset-bottom,0px));background:#FBF6F1;border-left:4px solid #C0913F;box-shadow:-14px 0 36px -18px rgba(58,43,56,.45);color:#3a2b38;font:15px/1.5 "Zen Maru Gothic",system-ui,sans-serif;transform:translateX(105%);visibility:hidden;overflow-y:auto;overscroll-behavior:contain}' +
    '#bz-p.on{transform:none;visibility:visible;transition:transform .22s ease}@media (prefers-reduced-motion:reduce){#bz-p{transition:none}}' +
    '#bz-p .h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}#bz-p h2{margin:0;font:800 20px "Baloo 2",system-ui,sans-serif}' +
    '#bz-p .rec{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #e6d3a3;background:#fff;border-radius:99px;padding:6px 14px;min-height:38px;cursor:pointer;color:#3a2b38;white-space:nowrap}#bz-p .rec:hover{background:#fffaf0}' +
    '#bz-p h3{margin:12px 0 2px;font:700 11.5px "Zen Maru Gothic",system-ui,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#8a7568}' +
    '#bz-p a.it{display:flex;align-items:center;gap:12px;padding:8px 6px;border-radius:12px;color:#3a2b38;text-decoration:none;font-weight:700;min-height:48px}#bz-p a.it:hover{background:#f3e8dd}' +
    '#bz-p a.it i{font-style:normal;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:18px;flex:none;background:#FBF2DF;color:#7A5B21}#bz-p a.it.c i{background:#E8EFE8;color:#3d6050}' +
    '#bz-p a.it[aria-current="page"]{background:#efe3d6}' +
    '#bz-chip{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 16px;background:#FFF6E6;border-bottom:1px solid #ead9b0;font:14px/1.4 "Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38}' +
    '#bz-chip .v{font:inherit;font-weight:700;border:1.5px solid #C0913F;background:#fff;color:#7A5B21;border-radius:99px;padding:5px 14px;min-height:36px;cursor:pointer}#bz-chip .x{font:inherit;border:0;background:transparent;color:#71676e;font-size:20px;line-height:1;cursor:pointer;min-width:36px;min-height:36px}';
  document.head.appendChild(css);

  var aba = document.createElement('button');
  aba.id = 'bz-aba'; aba.type = 'button'; aba.setAttribute('aria-expanded', 'false'); aba.setAttribute('aria-controls', 'bz-p'); aba.setAttribute('aria-label', 'Abrir o Baú de ferramentas');
  aba.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11V8a8 5 0 0 1 16 0v3"/><rect x="3" y="11" width="18" height="9" rx="2"/><path d="M12 11v4M10.5 13h3"/></svg><span>Baú</span>';

  var p = document.createElement('aside');
  p.id = 'bz-p'; p.setAttribute('aria-label', 'Baú de ferramentas');
  var html = '<div class="h"><h2>Baú de ferramentas</h2><button class="rec" type="button" id="bz-rec" aria-label="Recolher o Baú">Recolher ↘</button></div>';
  ITENS.forEach(function (g, gi) {
    html += '<h3>' + g[0] + '</h3>';
    g[1].forEach(function (it) {
      html += '<a class="it' + (gi ? ' c' : '') + '" href="' + it[1] + '"' + (path.indexOf(it[1]) === 0 ? ' aria-current="page"' : '') + '><i aria-hidden="true">' + it[0] + '</i>' + it[2] + '</a>';
    });
  });
  p.innerHTML = html;

  function nome(t) { return String(t || '').split(/\s[—·|]\s/)[0].trim() || 'a página anterior'; }
  function abrir(v) {
    p.classList.toggle('on', v); aba.setAttribute('aria-expanded', String(v)); aba.style.display = v ? 'none' : '';
    if (v) setTimeout(function () { var r = document.getElementById('bz-rec'); r && r.focus(); }, 60);
    else { aba.focus(); posicionar(); }
  }
  /* empilha a aba do Baú logo acima da aba do Caderno (que muda de altura/lugar conforme o aparelho) */
  function posicionar() {
    var c = document.getElementById('cf-aba'), h = aba.offsetHeight || 112;
    if (c && c.offsetHeight > 0) { aba.style.bottom = 'auto'; aba.style.top = Math.max(8, c.getBoundingClientRect().top - h - 12) + 'px'; }
    else { aba.style.top = 'auto'; aba.style.bottom = window.innerWidth >= 1100 ? '140px' : '40%'; }
  }

  function montar() {
    document.body.appendChild(aba); document.body.appendChild(p);
    posicionar();
    var n = 0, iv = setInterval(function () { posicionar(); if (++n > 15) clearInterval(iv); }, 400);
    window.addEventListener('resize', posicionar);
    aba.onclick = function () { abrir(true); };
    document.getElementById('bz-rec').onclick = function () { abrir(false); };
    p.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') abrir(false); });
    p.addEventListener('keyup', function (e) { e.stopPropagation(); });
    p.addEventListener('keypress', function (e) { e.stopPropagation(); });
    /* tocar fora do painel também recolhe */
    document.addEventListener('click', function (e) { if (p.classList.contains('on') && !p.contains(e.target) && e.target !== aba && !aba.contains(e.target)) abrir(false); });
    /* escolheu uma ferramenta: guarda de onde veio (se já veio de outra por aqui, mantém o ponto de partida original) */
    p.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.it'); if (!a) return;
      if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); abrir(false); return; }
      if (!lerJSON(VK)) gravar(VK, { u: atual, y: window.scrollY || 0, n: nome(document.title) });
    });
    setTimeout(chip, 60);
  }

  /* "← Voltar para ..." no topo da ferramenta escolhida */
  function chip() {
    var v = lerJSON(VK);
    if (!v || v.u === atual) return;
    /* o link do topo já virou "← Voltar para ..." (voltar.js): não precisa de outro */
    if (document.querySelector('a[data-volta]')) { apagar(VK); return; }
    var c = document.createElement('div');
    c.id = 'bz-chip'; c.setAttribute('role', 'region'); c.setAttribute('aria-label', 'Voltar');
    c.innerHTML = '<button class="v" type="button">← Voltar para ' + esc(v.n) + '</button><button class="x" type="button" aria-label="Dispensar">×</button>';
    document.body.insertBefore(c, document.body.firstChild);
    c.querySelector('.v').onclick = function () { apagar(VK); gravar(RK, { u: v.u, y: v.y || 0 }); location.href = v.u; };
    c.querySelector('.x').onclick = function () { apagar(VK); c.remove(); };
  }

  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();
