/* Unirversos · Caderno flutuante: aba na borda direita que abre o caderno sem sair da página.
   Usa as mesmas anotações de /idiomas/caderno/ e da Área do aluno (caderno em páginas, uma por vez aqui). Sempre começa recolhido. */
(function () {
  if (location.pathname.indexOf('/idiomas/caderno/') === 0 || location.pathname.indexOf('/aluno/') === 0) return;
  var C = null, livro = null, pede = false, tl = null, tTeclou = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = document.createElement('style');
  css.textContent =
    '#cf-aba{position:fixed;right:0;top:42%;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 7px;border:1.5px solid #ecdadd;border-right:0;border-left:4px solid #c23f5e;border-radius:14px 0 0 14px;background:#fff;color:#3a2b38;font:700 13px "Zen Maru Gothic",system-ui,sans-serif;cursor:pointer;box-shadow:-6px 8px 20px -12px rgba(58,43,56,.35);min-height:44px}' +
    '#cf-aba span{writing-mode:vertical-rl;letter-spacing:.08em}#cf-aba svg{width:18px;height:18px;stroke:#c23f5e;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}' +
    '@media (min-width:1100px){#cf-aba{top:auto;bottom:140px}}#cf-aba:hover{background:#fdf6f4}#cf-aba:focus-visible,#cf-p button:focus-visible,#cf-p select:focus-visible,#cf-p textarea:focus-visible,#cf-p a:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    '#cf-p{position:fixed;right:0;top:0;bottom:0;z-index:9001;width:min(440px,96vw);display:flex;flex-direction:column;gap:10px;padding:16px 16px calc(14px + env(safe-area-inset-bottom,0px));background:#fdf6f4;border-left:4px solid #c23f5e;box-shadow:-14px 0 36px -18px rgba(58,43,56,.45);color:#3a2b38;font:15px/1.5 "Zen Maru Gothic",system-ui,sans-serif;transform:translateX(105%);visibility:hidden;overflow-y:auto;overscroll-behavior:contain}' +
    '#cf-p.on{transform:none;visibility:visible;transition:transform .22s ease}' +
    '@media (prefers-reduced-motion:reduce){#cf-p{transition:none}}' +
    '#cf-p .h{display:flex;align-items:center;justify-content:space-between;gap:8px}#cf-p h2{margin:0;font:800 20px "Baloo 2",system-ui,sans-serif}' +
    '#cf-p .x{border:1.5px solid #ecdadd;background:#fff;border-radius:99px;width:36px;height:36px;font-size:18px;line-height:1;cursor:pointer;color:#3a2b38}' +
    '#cf-p .r{display:flex;gap:8px}#cf-p select{flex:1;min-width:0;font:inherit;font-size:14px;border:1.5px solid #ecdadd;border-radius:12px;padding:6px 10px;background:#fff;color:#3a2b38}' +
    '#cf-p .b{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #ecdadd;background:#fff;border-radius:99px;padding:6px 14px;cursor:pointer;color:#3a2b38;min-height:38px;white-space:nowrap}#cf-p .b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}' +
    '#cf-p .f{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 10px;font-size:12.5px;color:#705f6c}#cf-p .f a{color:#a8324f;font-weight:700;text-decoration:none}' +
    '#cf-p .vz{background:#fff;border:1.5px dashed #ecdadd;border-radius:16px;padding:28px 16px;text-align:center;color:#705f6c}';
  document.head.appendChild(css);

  var aba = document.createElement('button');
  aba.id = 'cf-aba'; aba.type = 'button'; aba.setAttribute('aria-expanded', 'false'); aba.setAttribute('aria-controls', 'cf-p'); aba.setAttribute('aria-label', 'Abrir o Caderno');
  aba.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 4v16M12 9h4M12 13h4"/></svg><span>Caderno</span>';

  var p = document.createElement('aside');
  p.id = 'cf-p'; p.setAttribute('aria-label', 'Caderno de anotações');
  p.innerHTML =
    '<div class="h"><h2>Caderno</h2><button class="x" type="button" id="cf-f" aria-label="Fechar o Caderno">×</button></div>' +
    '<div class="r"><select id="cf-l" aria-label="Anotação"></select><button class="b p" type="button" id="cf-n">+ Nova</button></div>' +
    '<div id="cf-lv"></div><div class="vz" id="cf-vz" hidden>Ainda não há anotações. Toque em <b>+ Nova</b>.</div>' +
    '<div class="f"><span><span id="cf-e" aria-live="polite">Salvo neste aparelho</span> <button class="b" type="button" id="cf-en" hidden>Entrar</button></span><span><button class="b" type="button" id="cf-z">Apagar</button> <a href="/idiomas/caderno/">Abrir em tela cheia →</a></span></div>';

  function $(i) { return document.getElementById(i); }
  function lista() {
    var vs = C.vivas(), atual = livro && livro.id();
    $('cf-l').innerHTML = vs.map(function (n) { var np = 1 + (Array.isArray(n.pp) ? n.pp.length : 0); return '<option value="' + n.id + '"' + (n.id === atual ? ' selected' : '') + '>' + esc(C.nome(n)) + (np > 1 ? ' · ' + np + ' pág.' : '') + '</option>'; }).join('');
  }
  function abre(id) { livro.abrir(id); $('cf-lv').hidden = false; $('cf-vz').hidden = true; lista(); }
  function abreProxima() { var vs = C.vivas(); if (vs.length) abre(vs[0].id); else { livro.abrir(null); $('cf-lv').hidden = true; $('cf-vz').hidden = false; lista(); } }
  function nova() { var n = C.nova(); abre(n.id); livro.foca(); }
  function estado() { $('cf-e').textContent = C.texto(); $('cf-en').hidden = C.estado() !== 'sem-login'; }
  function abrir(v) {
    p.classList.toggle('on', v); aba.setAttribute('aria-expanded', String(v)); aba.style.display = v ? 'none' : '';
    if (v) { estado(); if (!livro.id() || !C.obter(livro.id())) abreProxima(); livro.reajustar(); setTimeout(function () { livro.reajustar(); livro.foca(); }, 250); }
    else { C.agora(); aba.focus(); }
  }

  function montar() {
    document.body.appendChild(aba); document.body.appendChild(p);
    livro = UniLivro.montar($('cf-lv'), { simples: true, aoMudar: function () { tTeclou = Date.now(); clearTimeout(tl); tl = setTimeout(lista, 250); } });
    aba.onclick = function () { abrir(true); };
    $('cf-f').onclick = function () { abrir(false); };
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') abrir(false); });
    $('cf-n').onclick = nova;
    $('cf-l').onchange = function () { abre(this.value); };
    $('cf-en').onclick = function () { C.entrar(); };
    $('cf-z').onclick = function () {
      if (!livro.id()) return;
      if (!pede) { pede = true; this.textContent = 'Apagar mesmo?'; var b = this; setTimeout(function () { pede = false; b.textContent = 'Apagar'; }, 3000); return; }
      pede = false; this.textContent = 'Apagar'; C.apagar(livro.id()); abreProxima();
    };
    C.on(function (tipo) {
      if (tipo === 'estado') estado();
      if (tipo === 'remoto') { lista(); var id = livro.id(), n = id && C.obter(id); if (id && !n) abreProxima(); else if (n && (n.m || 0) > livro.ultimoM() && Date.now() - tTeclou > 5000) livro.abrir(id, true); }
    });
  }
  function carrega(src, fn) { var t = document.createElement('script'); t.src = src; t.onload = fn; document.head.appendChild(t); }
  function inicia() {
    function pronto() { C = window.UniCaderno; if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar); }
    function com() { if (window.UniLivro) pronto(); else carrega('/caderno-livro.js?v=5', pronto); }
    if (window.UniCaderno) com(); else carrega('/caderno-dados.js?v=2', com);
  }
  inicia();
})();
