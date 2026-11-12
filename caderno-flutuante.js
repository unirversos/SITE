/* Unirversos · Caderno flutuante: aba na borda direita que abre as anotações livres sem sair da página.
   Usa as mesmas anotações da página /idiomas/caderno/ (localStorage "uniCadernoNotas1"). Sempre começa recolhido. */
(function () {
  if (location.pathname.indexOf('/idiomas/caderno/') === 0) return;
  var K = 'uniCadernoNotas1', notas = [], atual = null, t = null, pede = false;

  function ler() { try { var v = JSON.parse(localStorage.getItem(K) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function gravar() { try { localStorage.setItem(K, JSON.stringify(notas)); est.textContent = 'Salvo'; } catch (e) { est.textContent = 'Não consegui salvar neste aparelho'; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nome(n) { return (n.t || '').trim() || (n.x || '').trim().split('\n')[0].slice(0, 40) || 'Sem título'; }
  function achar() { return notas.filter(function (x) { return x.id === atual; })[0]; }

  var css = document.createElement('style');
  css.textContent =
    '#cf-aba{position:fixed;right:0;top:42%;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 7px;border:1.5px solid #ecdadd;border-right:0;border-left:4px solid #c23f5e;border-radius:14px 0 0 14px;background:#fff;color:#3a2b38;font:700 13px "Zen Maru Gothic",system-ui,sans-serif;cursor:pointer;box-shadow:-6px 8px 20px -12px rgba(58,43,56,.35);min-height:44px}' +
    '#cf-aba span{writing-mode:vertical-rl;letter-spacing:.08em}#cf-aba svg{width:18px;height:18px;stroke:#c23f5e;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}' +
    '@media (min-width:1100px){#cf-aba{top:auto;bottom:140px}}#cf-aba:hover{background:#fdf6f4}#cf-aba:focus-visible,#cf-p button:focus-visible,#cf-p select:focus-visible,#cf-p textarea:focus-visible,#cf-p a:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    '#cf-p{position:fixed;right:0;top:0;bottom:0;z-index:9001;width:min(380px,94vw);display:flex;flex-direction:column;gap:10px;padding:16px 16px calc(14px + env(safe-area-inset-bottom,0px));background:#fff;border-left:4px solid #c23f5e;box-shadow:-14px 0 36px -18px rgba(58,43,56,.45);color:#3a2b38;font:15px/1.5 "Zen Maru Gothic",system-ui,sans-serif;transform:translateX(105%);visibility:hidden;transition:transform .22s ease,visibility 0s .22s}' +
    '#cf-p.on{transform:none;visibility:visible;transition:transform .22s ease}' +
    '@media (prefers-reduced-motion:reduce){#cf-p{transition:none}}' +
    '#cf-p .h{display:flex;align-items:center;justify-content:space-between;gap:8px}#cf-p h2{margin:0;font:800 20px "Baloo 2",system-ui,sans-serif}' +
    '#cf-p .x{border:1.5px solid #ecdadd;background:#fff;border-radius:99px;width:36px;height:36px;font-size:18px;line-height:1;cursor:pointer;color:#3a2b38}' +
    '#cf-p .r{display:flex;gap:8px}#cf-p select{flex:1;min-width:0;font:inherit;font-size:14px;border:1.5px solid #ecdadd;border-radius:12px;padding:6px 10px;background:#fdf6f4;color:#3a2b38}' +
    '#cf-p .b{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #ecdadd;background:#fff;border-radius:99px;padding:6px 14px;cursor:pointer;color:#3a2b38;min-height:38px;white-space:nowrap}#cf-p .b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}' +
    '#cf-p .dia{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:6px 12px;padding-bottom:8px;border-bottom:1.5px dashed #ecdadd}' +
    '#cf-p .dt{display:flex;align-items:flex-end;gap:3px 4px}#cf-p .dt input{font:700 17px "Baloo 2",system-ui,sans-serif;text-align:center;color:#3a2b38;border:0;border-bottom:2px solid #ecdadd;background:transparent;border-radius:0;padding:0 1px;height:30px;-moz-appearance:textfield}' +
    '#cf-p .dt input::-webkit-outer-spin-button,#cf-p .dt input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}#cf-p .dt input:focus{outline:none;border-bottom-color:#c23f5e}' +
    '#cf-a{width:4ch}#cf-m,#cf-d{width:2.6ch}#cf-p ruby{font:700 17px "Baloo 2",system-ui,sans-serif;margin-right:5px}#cf-p rt{font:500 8.5px "Zen Maru Gothic",system-ui,sans-serif;color:#705f6c}' +
    '#cf-s{display:flex;gap:1px}#cf-s button{position:relative;width:32px;height:34px;border:0;background:transparent;color:#3a2b38;font:700 17px "Baloo 2",system-ui,sans-serif;display:grid;place-items:center;padding:0;cursor:pointer}' +
    '#cf-s button::before{content:"";position:absolute;inset:0;border:2.5px solid #c23f5e;border-radius:52% 48% 55% 45%/48% 55% 45% 52%;transform:rotate(-6deg) scale(.6);opacity:0;transition:opacity .15s,transform .15s}' +
    '#cf-s button[aria-pressed="true"]{color:#c23f5e}#cf-s button[aria-pressed="true"]::before{opacity:1;transform:rotate(-6deg) scale(1)}#cf-s button:hover::before{opacity:.35;transform:rotate(-6deg) scale(1)}#cf-s button[aria-pressed="true"]:hover::before{opacity:1}' +
    '#cf-x{flex:1;min-height:120px;width:100%;resize:none;border:0;background:repeating-linear-gradient(transparent 0 29px,#ecdadd 29px 30px);background-attachment:local;font:inherit;font-size:16px;line-height:30px;color:#3a2b38;padding:0}' +
    '#cf-p .f{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.5px;color:#705f6c}#cf-p .f a{color:#3a2b38;font-weight:700}';
  document.head.appendChild(css);

  var aba = document.createElement('button');
  aba.id = 'cf-aba'; aba.type = 'button'; aba.setAttribute('aria-expanded', 'false'); aba.setAttribute('aria-controls', 'cf-p'); aba.setAttribute('aria-label', 'Abrir o Caderno');
  aba.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 4v16M12 9h4M12 13h4"/></svg><span>Caderno</span>';

  var p = document.createElement('aside');
  p.id = 'cf-p'; p.setAttribute('aria-label', 'Caderno de anotações');
  p.innerHTML =
    '<div class="h"><h2>Caderno</h2><button class="x" type="button" id="cf-f" aria-label="Fechar o Caderno">×</button></div>' +
    '<div class="r"><select id="cf-l" aria-label="Anotação"></select><button class="b p" type="button" id="cf-n">+ Nova</button></div>' +
    '<div class="dia"><div class="dt" role="group" aria-label="Data">' +
    '<input id="cf-a" type="number" inputmode="numeric" min="1" max="9999" aria-label="Ano"><ruby>年<rt>ねん</rt></ruby>' +
    '<input id="cf-m" type="number" inputmode="numeric" min="1" max="12" aria-label="Mês"><ruby>月<rt>がつ</rt></ruby>' +
    '<input id="cf-d" type="number" inputmode="numeric" min="1" max="31" aria-label="Dia"><ruby>日<rt>にち</rt></ruby></div>' +
    '<div id="cf-s" role="group" aria-label="Dia da semana: toque para circular">' +
    [['月', 'げつ', 'segunda-feira'], ['火', 'か', 'terça-feira'], ['水', 'すい', 'quarta-feira'], ['木', 'もく', 'quinta-feira'], ['金', 'きん', 'sexta-feira'], ['土', 'ど', 'sábado'], ['日', 'にち', 'domingo']]
      .map(function (w, i) { return '<button type="button" data-w="' + i + '" aria-pressed="false" aria-label="' + w[2] + '"><ruby>' + w[0] + '<rt>' + w[1] + '</rt></ruby></button>'; }).join('') +
    '</div></div>' +
    '<textarea id="cf-x" placeholder="Escreva aqui…" aria-label="Texto da anotação"></textarea>' +
    '<div class="f"><span id="cf-e" aria-live="polite">Salvo</span><span><button class="b" type="button" id="cf-z">Apagar</button> <a href="/idiomas/caderno/">Abrir no Caderno →</a></span></div>';

  var est;
  function $(i) { return document.getElementById(i); }

  function lista() {
    notas.sort(function (a, b) { return b.m - a.m; });
    $('cf-l').innerHTML = notas.map(function (n) { return '<option value="' + n.id + '"' + (n.id === atual ? ' selected' : '') + '>' + esc(nome(n)) + '</option>'; }).join('');
  }
  function pinta(w) { Array.prototype.forEach.call($('cf-s').children, function (b) { b.setAttribute('aria-pressed', String(String(w) === b.dataset.w)); }); }
  function abre(id) {
    var n = notas.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    atual = id; $('cf-x').value = n.x || ''; $('cf-a').value = n.a || ''; $('cf-m').value = n.o || ''; $('cf-d').value = n.d || ''; pinta(n.w); lista();
  }
  function nova() {
    var n = { id: 'n' + Date.now().toString(36), t: '', x: '', m: Date.now() }; notas.push(n); gravar(); abre(n.id); $('cf-x').focus();
  }
  function salva() {
    var n = achar(); if (!n) { nova(); n = achar(); }
    n.x = $('cf-x').value; n.a = $('cf-a').value; n.o = $('cf-m').value; n.d = $('cf-d').value; n.m = Date.now(); est.textContent = 'Salvando…';
    clearTimeout(t); t = setTimeout(function () { gravar(); lista(); }, 400);
  }
  function abrir(v) {
    notas = ler(); p.classList.toggle('on', v); aba.setAttribute('aria-expanded', String(v)); aba.style.display = v ? 'none' : '';
    if (v) { if (!notas.length) { notas = []; atual = null; $('cf-l').innerHTML = ''; } else abre(atual && achar() ? atual : notas.sort(function (a, b) { return b.m - a.m; })[0].id); $('cf-x').focus(); }
    else { clearTimeout(t); var n = achar(); if (n) { n.x = $('cf-x').value; n.a = $('cf-a').value; n.o = $('cf-m').value; n.d = $('cf-d').value; gravar(); } aba.focus(); }
  }

  function montar() {
    document.body.appendChild(aba); document.body.appendChild(p); est = $('cf-e');
    aba.onclick = function () { abrir(true); };
    $('cf-f').onclick = function () { abrir(false); };
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') abrir(false); });
    $('cf-n').onclick = nova;
    $('cf-l').onchange = function () { abre(this.value); };
    $('cf-x').oninput = $('cf-a').oninput = $('cf-m').oninput = $('cf-d').oninput = salva;
    $('cf-s').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return; var n = achar(); if (!n) { nova(); n = achar(); }
      n.w = String(n.w) === b.dataset.w ? null : b.dataset.w; pinta(n.w); salva();
    };
    $('cf-z').onclick = function () {
      if (!atual) return;
      if (!pede) { pede = true; this.textContent = 'Apagar mesmo?'; var b = this; setTimeout(function () { pede = false; b.textContent = 'Apagar'; }, 3000); return; }
      pede = false; this.textContent = 'Apagar';
      notas = notas.filter(function (x) { return x.id !== atual; }); gravar(); atual = null;
      if (notas.length) abre(notas.sort(function (a, b) { return b.m - a.m; })[0].id); else { $('cf-x').value = ''; $('cf-a').value = $('cf-m').value = $('cf-d').value = ''; pinta(null); $('cf-l').innerHTML = ''; }
    };
    window.addEventListener('pagehide', function () { var n = achar(); if (n) { n.x = $('cf-x').value; n.a = $('cf-a').value; n.o = $('cf-m').value; n.d = $('cf-d').value; gravar(); } });
  }
  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();
