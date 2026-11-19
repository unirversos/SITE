/* Baú flutuante: aba no canto com todas as ferramentas */
(function(){if(window.top!==window||document.getElementById('bz-js'))return;var s=document.createElement('script');s.id='bz-js';s.src='/bau-flutuante.js?v=7';s.defer=true;document.head.appendChild(s);})();
(function(){if(document.getElementById('volta-js'))return;var s=document.createElement('script');s.id='volta-js';s.src='/voltar.js?v=1';document.head.appendChild(s);})();
/* Unirversos · Caderno flutuante: aba na borda direita que abre o caderno sem sair da página.
   Usa as mesmas anotações de /idiomas/caderno/ e da Área do aluno (caderno em páginas, uma por vez aqui). Sempre começa recolhido. */
(function () {
  if (location.pathname.indexOf('/idiomas/caderno/') === 0) return;
  var C = null, livro = null, pede = false, tl = null, tTeclou = 0, fila = [];
  /* API para outras páginas (Área do aluno etc.): funciona mesmo antes do caderno terminar de carregar */
  function quando(fn) { return function () { var a = arguments; if (livro) return fn.apply(null, a); fila.push(function () { fn.apply(null, a); }); }; }
  window.UniCadernoFlutuante = { abrir: quando(function () { abrir(true); }), nova: quando(function () { abrir(true); nova(); }), abrirNota: quando(function (id) { abrir(true); if (C.obter(id)) abre(id); }), nomear: quando(function (id, c) { C.atualizar(id, c); C.agora(); abrir(true); abre(id); }) };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = document.createElement('style');
  css.textContent =
    '#cf-aba{position:fixed;right:0;top:42%;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 11px;border:2px solid #ecdadd;border-right:0;border-left:6px solid #c23f5e;border-radius:18px 0 0 18px;background:#fff;color:#3a2b38;font:800 17px "Zen Maru Gothic",system-ui,sans-serif;cursor:pointer;box-shadow:-6px 8px 20px -12px rgba(58,43,56,.35);min-height:64px}' +
    '#cf-aba span{writing-mode:vertical-rl;letter-spacing:.1em}#cf-aba svg{width:30px;height:30px;stroke-linecap:round;stroke-linejoin:round}' +
    '@media (min-width:1100px){#cf-aba{top:auto;bottom:140px}}#cf-aba:hover{background:#fdf6f4}#cf-aba:focus-visible,#cf-p button:focus-visible,#cf-p select:focus-visible,#cf-p textarea:focus-visible,#cf-p a:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    /* celular: as abas viram pílulas na base da tela (não cobrem mais o conteúdo) */
    '@media (max-width:700px){#cf-aba{top:auto!important;bottom:max(10px,env(safe-area-inset-bottom,0px))!important;right:10px!important;flex-direction:row;gap:8px;padding:8px 16px;min-height:44px;border:2px solid #ecdadd;border-left:2px solid #ecdadd;border-radius:999px;font-size:15px;box-shadow:0 8px 18px -10px rgba(58,43,56,.45)}#cf-aba span{writing-mode:horizontal-tb;letter-spacing:.02em}#cf-aba svg{width:20px;height:20px}body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}}' +
    '#cf-p{position:fixed;right:0;top:0;bottom:0;z-index:9001;width:min(440px,96vw);display:flex;flex-direction:column;gap:10px;padding:16px 16px calc(14px + env(safe-area-inset-bottom,0px));background:#fdf6f4;border-left:4px solid #c23f5e;box-shadow:-14px 0 36px -18px rgba(58,43,56,.45);color:#3a2b38;font:15px/1.5 "Zen Maru Gothic",system-ui,sans-serif;transform:translateX(105%);visibility:hidden;overflow-y:auto;overscroll-behavior:contain}' +
    '#cf-p.on{transform:none;visibility:visible;transition:transform .22s ease}' +
    '@media (prefers-reduced-motion:reduce){#cf-p{transition:none}}' +
    '#cf-p .h{display:flex;align-items:center;justify-content:space-between;gap:8px}#cf-p h2{margin:0;font:800 20px "Baloo 2",system-ui,sans-serif}' +
    '#cf-p .x{border:1.5px solid #ecdadd;background:#fff;border-radius:99px;width:36px;height:36px;font-size:18px;line-height:1;cursor:pointer;color:#3a2b38}' +
    '#cf-p .r{display:flex;gap:8px}#cf-p select{flex:1;min-width:0;font:inherit;font-size:14px;border:1.5px solid #ecdadd;border-radius:12px;padding:6px 10px;background:#fff;color:#3a2b38}' +
    '#cf-p .b{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #ecdadd;background:#fff;border-radius:99px;padding:6px 14px;cursor:pointer;color:#3a2b38;min-height:38px;white-space:nowrap}#cf-p .b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}' +
    '#cf-p .f{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 10px;font-size:12.5px;color:#705f6c}#cf-p .f a{color:#a8324f;font-weight:700;text-decoration:none}' +
    '#cf-p .ab{display:flex;gap:6px}#cf-p .ab button{flex:1;font:inherit;font-size:14px;font-weight:800;border:1.5px solid #ecdadd;background:#fff;border-radius:99px;padding:7px 10px;min-height:40px;cursor:pointer;color:#705f6c;display:flex;align-items:center;justify-content:center;gap:6px}#cf-p .ab button svg{width:18px;height:18px}#cf-p .ab button.on{background:#c23f5e;border-color:#c23f5e;color:#fff}#cf-p [hidden]{display:none!important}' +
    '#cf-p .vz{background:#fff;border:1.5px dashed #ecdadd;border-radius:16px;padding:28px 16px;text-align:center;color:#705f6c}';
  document.head.appendChild(css);

  var aba = document.createElement('button');
  aba.id = 'cf-aba'; aba.type = 'button'; aba.setAttribute('aria-expanded', 'false'); aba.setAttribute('aria-controls', 'cf-p'); aba.setAttribute('aria-label', 'Abrir o Caderno de Unir Versos');
  aba.innerHTML = '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="5" y="2.500" width="17.500" height="22" rx="1.600" fill="#B5514D" stroke="#8a3a37" stroke-width="1.200"/><rect x="5" y="2.500" width="3" height="22" rx="1" fill="#8a3a37" stroke="none"/><rect x="17" y="1.800" width="2.200" height="23.400" rx="1" fill="#3a2b38" stroke="none"/><rect x="9.500" y="8" width="6.600" height="7" rx="1" fill="#fffdf9" stroke="none"/><path d="M10.800 10.400h4M10.800 12.600h4" stroke="#3a2b38" stroke-width="1" fill="none"/><path d="M11.500 24.500v3.200l1.500-1.100 1.500 1.100v-3.200Z" fill="#C0913F" stroke="none"/></svg><span>Caderno</span>';

  var p = document.createElement('aside');
  p.id = 'cf-p'; p.setAttribute('aria-label', 'Caderno de Unir Versos');
  p.innerHTML =
    '<div class="h"><h2>Caderno de Unir Versos</h2><button class="x" type="button" id="cf-f" aria-label="Fechar o Caderno de Unir Versos">×</button></div>' +
    '<div class="ab" role="tablist"><button type="button" id="cf-ta" class="on" role="tab" aria-selected="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2.500" width="11" height="15" rx="1.500"/><path d="M7 7h5M7 10h5"/></svg>Caderno</button><button type="button" id="cf-td" role="tab" aria-selected="false"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.500c2.500-1 4.500-.8 7 .8 2.500-1.600 4.500-1.800 7-.8v11c-2.500-1-4.500-.8-7 .8-2.500-1.600-4.500-1.800-7-.8Z"/><path d="M10 5.300v11"/></svg>Dicionário</button></div>' +
    '<div id="cf-dc" hidden></div>' +
    '<div class="r" id="cf-r"><select id="cf-l" aria-label="Anotação"></select><button class="b p" type="button" id="cf-n">+ Nova</button></div>' +
    '<div id="cf-nb"><div id="cf-lv"></div><div class="vz" id="cf-vz" hidden>Ainda não há anotações. Toque em <b>+ Nova</b>.</div></div>' +
    '<div class="f"><span><span id="cf-e" aria-live="polite">Salvo neste aparelho</span> <button class="b" type="button" id="cf-en" hidden>Entrar</button></span><span><button class="b" type="button" id="cf-z">Apagar</button> <a href="/idiomas/caderno/" id="cf-tc">Abrir em tela cheia →</a></span></div>';

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
    /* teclas digitadas no caderno não chegam aos jogos/atalhos da página */
    p.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') abrir(false); });
    p.addEventListener('keyup', function (e) { e.stopPropagation(); });
    p.addEventListener('keypress', function (e) { e.stopPropagation(); });
    while (fila.length) fila.shift()();
    /* tela cheia: guarda de onde veio e qual anotação estava aberta, para o botão "Recolher" voltar e continuar de onde parou */
    $('cf-tc').onclick = function (e) {
      e.preventDefault();
      var id = livro.id();
      try { C.agora(); sessionStorage.setItem('uni-cf-volta', JSON.stringify({ u: location.pathname + location.search + location.hash, id: id || null })); } catch (x) {}
      location.href = '/idiomas/caderno/' + (id ? '?n=' + encodeURIComponent(id) : '');
    };
    /* voltou da tela cheia com "Recolher": reabre o painel na mesma anotação */
    try {
      var v = JSON.parse(sessionStorage.getItem('uni-cf-volta') || 'null');
      if (v && v.r && v.u === location.pathname + location.search + location.hash) {
        sessionStorage.removeItem('uni-cf-volta');
        abrir(true); if (v.id && C.obter(v.id)) abre(v.id);
      }
    } catch (x) {}
    $('cf-n').onclick = nova;
    var dic = null;
    function vista(d) {
      $('cf-ta').classList.toggle('on', !d); $('cf-td').classList.toggle('on', d); $('cf-ta').setAttribute('aria-selected', String(!d)); $('cf-td').setAttribute('aria-selected', String(d));
      $('cf-r').hidden = d; $('cf-nb').hidden = d; $('cf-dc').hidden = !d;
      if (d) {
        if (!dic) {
          var fazer = function () { dic = UniDic.montar($('cf-dc'), { salvar: salvaPalavra }); dic.foca(); };
          if (window.UniDic) fazer(); else carrega('/caderno-dic.js?v=1', fazer);
        } else dic.foca();
      } else { livro.reajustar(); }
    }
    /* "Salvar no caderno": acrescenta a palavra no fim da anotação aberta (ou cria uma anotação nova) */
    function salvaPalavra(linha) {
      var id = livro.id(), n = id && C.obter(id);
      if (!n) { n = C.nova(); id = n.id; }
      C.atualizar(id, { x: (n.x ? n.x.replace(/\s+$/, '') + '\n' : '') + linha });
      abre(id);
    }
    $('cf-ta').onclick = function () { vista(false); };
    $('cf-td').onclick = function () { vista(true); };
    window.UniCadernoFlutuante.dicionario = function () { abrir(true); vista(true); };
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
    function com() { if (window.UniLivro) pronto(); else carrega('/caderno-livro.js?v=8', pronto); }
    if (window.UniCaderno) com(); else carrega('/caderno-dados.js?v=2', com);
  }
  inicia();
})();
