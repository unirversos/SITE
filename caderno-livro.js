/* Unirversos · Caderno em páginas (visual de revista)
   UniLivro.montar(elemento, { simples: true }) → { abrir(id), novaSobre(titulo, data), reajustar(), id() }
   - Cada anotação tem páginas. Página 1 = campos antigos x (texto) e s (traços); as demais ficam em pp: [{ x, s }].
   - Texto e caneta na mesma página: no modo Caneta a gente desenha por cima do texto.
   - Duas páginas lado a lado quando há espaço; uma por vez no celular (ou com { simples: true }).
   - Traços: { k: cor, w: espessura, d: [x0,y0,p0, dx,dy,p, ...] } numa página lógica de 2000 x 2800.
     (Os desenhos antigos, feitos numa folha de 2000 x 1400, aparecem na metade de cima da página 1.)
   Depende de window.UniCaderno (caderno-dados.js). */
(function () {
  if (window.UniLivro) return;
  var W = 2000, H = 2800, CORES = ['#3a2b38', '#c23f5e', '#517158', '#4f46a5'], NOMES = ['Tinta escura', 'Rosa', 'Verde', 'Roxo'],
    ESP = [5, 9, 16], ENOMES = ['Fina', 'Média', 'Grossa'],
    SEM = [['月', 'げつ', 'segunda-feira'], ['火', 'か', 'terça-feira'], ['水', 'すい', 'quarta-feira'], ['木', 'もく', 'quinta-feira'], ['金', 'きん', 'sexta-feira'], ['土', 'ど', 'sábado'], ['日', 'にち', 'domingo']];

  var css = document.createElement('style');
  css.textContent = [
    '.lv{display:grid;gap:10px;font-family:"Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38}',
    '.lv [hidden]{display:none!important}',
    '.lv-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}',
    '.lv-modo{display:inline-flex;gap:4px;padding:3px;border-radius:99px;background:#fdf6f4;border:1.5px solid #ecdadd}',
    '.lv-modo button{font:inherit;cursor:pointer;border:0;background:transparent;color:#705f6c;font-weight:700;font-size:13.5px;padding:5px 16px;border-radius:99px;min-height:34px}',
    '.lv-modo button[aria-pressed="true"]{background:#3a2b38;color:#fff}',
    '.lv-fer{display:flex;flex-wrap:wrap;align-items:center;gap:6px}',
    '.lv-fer button,.lv-nav button{font:inherit;cursor:pointer;display:inline-grid;place-items:center;min-width:38px;height:38px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:12px;padding:0 8px;font-size:13px;font-weight:700}',
    '.lv-fer button[aria-pressed="true"]{border-color:#c23f5e;background:#fdf1f4}.lv-fer button:disabled,.lv-nav button:disabled{opacity:.35;cursor:default}',
    '.lv-fer svg,.lv-nav svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}',
    '.lv-fer .cor{width:30px;min-width:30px;height:30px;border-radius:50%;padding:0;border-width:2px}.lv-fer .cor i{display:block;width:16px;height:16px;border-radius:50%}',
    '.lv-fer .esp i{display:block;border-radius:50%;background:#3a2b38}.lv-sep{width:1px;height:24px;background:#ecdadd;margin:0 2px}',
    '.lv button:focus-visible,.lv input:focus-visible,.lv textarea:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}',
    /* livro aberto */
    '.lv-livro{position:relative;display:grid;grid-template-columns:1fr;gap:0;perspective:1800px;touch-action:pan-y}',
    '.lv.dupla .lv-livro{grid-template-columns:1fr 1fr}',
    '.lv.dupla .lv-livro::after{content:"";position:absolute;top:2%;bottom:2%;left:50%;width:22px;margin-left:-11px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(58,43,56,.10) 45%,rgba(58,43,56,.16) 50%,rgba(58,43,56,.10) 55%,transparent);z-index:3}',
    '.lv-pg{position:relative;aspect-ratio:2000/2800;background:#fff;border:1.5px solid #ecdadd;display:flex;flex-direction:column;padding:6% 7% 7%;overflow:hidden;box-shadow:0 14px 30px -22px rgba(58,43,56,.45)}',
    '.lv-pg.fora{visibility:hidden;position:absolute;left:0;top:0;width:100%;pointer-events:none}',
    '.lv.dupla .lv-pg.fora{width:50%}',
    '.lv.dupla .lv-pg.esq{border-radius:16px 4px 4px 16px;border-right:0}.lv.dupla .lv-pg.dir{border-radius:4px 16px 16px 4px}',
    '.lv:not(.dupla) .lv-pg{border-radius:16px}',
    '.lv-pg.p1{border-left:5px solid #c23f5e}',
    '.lv.dupla .lv-pg.p1.dir{border-left:1.5px solid #ecdadd}',
    /* cabeçalho japonês (página 1) */
    '.lv-dia{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:calc(var(--u,4px)*1) calc(var(--u,4px)*3);padding-bottom:calc(var(--u,4px)*2);border-bottom:1.5px dashed #ecdadd}',
    '.lv-dt{display:flex;align-items:flex-end;gap:.calc(var(--u,4px)*6)}',
    '.lv-dt input{font:inherit;font-family:"Baloo 2",system-ui,sans-serif;font-weight:700;font-size:max(15px,calc(var(--u,4px)*4.4));text-align:center;color:#3a2b38;border:0;border-bottom:2px solid #ecdadd;background:transparent;border-radius:0;padding:0;height:1.5em;-moz-appearance:textfield}',
    '.lv-dt input::-webkit-outer-spin-button,.lv-dt input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',
    '.lv-dt input:focus{outline:none;border-bottom-color:#c23f5e}',
    '.lv-dt .a{width:4.2ch}.lv-dt .o,.lv-dt .d{width:2.6ch}',
    '.lv-dt ruby,.lv-sem ruby{font-family:"Baloo 2",system-ui,sans-serif;font-weight:700;font-size:max(15px,calc(var(--u,4px)*4.4));margin-right:calc(var(--u,4px)*1.2)}',
    '.lv-dt rt,.lv-sem rt{font-family:"Zen Maru Gothic",system-ui,sans-serif;font-size:max(8px,calc(var(--u,4px)*1.9));font-weight:500;color:#705f6c}',
    '.lv-sem{display:flex;gap:.calc(var(--u,4px)*4)}',
    '.lv-sem button{font:inherit;cursor:pointer;position:relative;width:max(30px,calc(var(--u,4px)*7.6));height:max(32px,calc(var(--u,4px)*7.6));border:0;background:transparent;color:#3a2b38;display:grid;place-items:center;padding:0}',
    '.lv-sem button ruby{margin:0;display:grid;justify-items:center;font-size:max(14px,calc(var(--u,4px)*4))}',
    '.lv-sem button::before{content:"";position:absolute;inset:0;border:2.5px solid #c23f5e;border-radius:52% 48% 55% 45%/48% 55% 45% 52%;transform:rotate(-6deg) scale(.6);opacity:0;transition:opacity .15s,transform .15s}',
    '.lv-sem button[aria-pressed="true"]{color:#c23f5e}.lv-sem button[aria-pressed="true"]::before{opacity:1;transform:rotate(-6deg) scale(1)}',
    '.lv-sem button:hover::before{opacity:.35;transform:rotate(-6deg) scale(1)}.lv-sem button[aria-pressed="true"]:hover::before{opacity:1}',
    '.lv-tit{font-family:"Baloo 2",system-ui,sans-serif;font-weight:800;font-size:max(18px,calc(var(--u,4px)*5.4));border:0;border-bottom:1.5px dashed #ecdadd;background:transparent;color:#3a2b38;padding:calc(var(--u,4px)*1.4) 0 calc(var(--u,4px)*1.6);width:100%;margin-bottom:calc(var(--u,4px)*1)}',
    '.lv-tit:focus{outline:none;border-bottom-color:#c23f5e}',
    /* folha pautada */
    '.lv-tx{flex:1;min-height:0;width:100%;resize:none;overflow:hidden;border:0;padding:0;color:#3a2b38;font:inherit;font-size:max(14px,calc(var(--u,4px)*3.7));line-height:max(27px,calc(var(--u,4px)*6.6));background:repeating-linear-gradient(transparent 0 calc(max(27px,calc(var(--u,4px)*6.6)) - 1px),#ecdadd calc(max(27px,calc(var(--u,4px)*6.6)) - 1px) max(27px,calc(var(--u,4px)*6.6)));background-attachment:local}',
    '.lv-tx:focus{outline:none}',
    '.lv-num{position:absolute;bottom:calc(var(--u,4px)*1.6);font-size:max(11px,calc(var(--u,4px)*2.4));color:#a8969f;pointer-events:none}',
    '.lv-pg .lv-num{right:calc(var(--u,4px)*4)}.lv.dupla .lv-pg.esq .lv-num{right:auto;left:calc(var(--u,4px)*4)}',
    '.lv-del{position:absolute;top:calc(var(--u,4px)*1.6);right:calc(var(--u,4px)*1.6);z-index:4;font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#705f6c;border-radius:99px;font-size:12px;font-weight:700;padding:3px 10px;min-height:30px;opacity:.75}',
    '.lv-del:hover{opacity:1;color:#a32a2a;border-color:#d9a3a9}',
    '.lv.caneta .lv-del{display:none}',
    /* caneta por cima */
    '.lv-pg canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;touch-action:none;display:block}',
    '.lv.caneta .lv-pg canvas{pointer-events:auto;cursor:crosshair}.lv.caneta.borracha .lv-pg canvas{cursor:cell}',
    '.lv.caneta .lv-tx,.lv.caneta .lv-dia,.lv.caneta .lv-tit{pointer-events:none}',
    /* navegação */
    '.lv-nav{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}',
    '.lv-nav .lbl{font-size:13.5px;color:#705f6c;min-width:9em;text-align:center}',
    '.lv-nav .mais{padding:0 14px}',
    /* virar a página */
    '@keyframes lvFrente{from{transform:rotateY(-28deg);opacity:.25}to{transform:none;opacity:1}}',
    '@keyframes lvTras{from{transform:rotateY(28deg);opacity:.25}to{transform:none;opacity:1}}',
    '.lv-livro.vai .lv-pg:not(.fora){transform-origin:left center;animation:lvFrente .38s ease-out}',
    '.lv-livro.volta .lv-pg:not(.fora){transform-origin:right center;animation:lvTras .38s ease-out}',
    '@media (prefers-reduced-motion:reduce){.lv-livro.vai .lv-pg,.lv-livro.volta .lv-pg{animation:none}}',
    '.lv-fant{background:#fffdfc;align-items:center;justify-content:center;box-shadow:none}',
    '.lv-fant button{font:inherit;cursor:pointer;border:1.5px dashed #d9c3c9;background:#fff;color:#705f6c;border-radius:99px;padding:8px 18px;font-weight:700;font-size:14px;min-height:40px}.lv-fant button:hover{border-color:#c23f5e;color:#c23f5e}',
    '.lv-dica{font-size:12px;color:#705f6c;margin:0;text-align:center}',
    /* mostrar para a professora */
    '.lv-prof{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 12px}',
    '.lv-pf{font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:6px 16px;font-size:13.5px;font-weight:700;min-height:38px}',
    '.lv-pf[aria-pressed="true"]{border-color:#517158;background:#e8efe8;color:#2f4a36}',
    '.lv-pfs{font-size:12px;color:#705f6c}',
    /* modo leitura (a professora vendo o caderno que o aluno mostrou) */
    '.lv.leitura .lv-bar,.lv.leitura .lv-nav .mais,.lv.leitura .lv-del,.lv.leitura .lv-fant,.lv.leitura .lv-dica,.lv.leitura .lv-prof{display:none!important}',
    '.lv.leitura .lv-sem,.lv.leitura canvas{pointer-events:none}',
    '.lv.leitura .lv-tit,.lv.leitura .lv-dt input{background:transparent!important;color:#3a2b38!important;border-radius:0!important;box-shadow:none!important}',
  ].join('');
  document.head.appendChild(css);

  var IC = {
    pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>',
    bor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20h11M5.5 14.5l8-8a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8l-2.5-2.5a2 2 0 0 1 0-2z"/></svg>',
    und: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 0 10h-3"/></svg>',
    cl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
    ant: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    prox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  function montar(el, opc) {
    opc = opc || {};
    var C = opc.C || window.UniCaderno, id = null, pags = [], ini = 0, dupla = false, modo = 'txt', cor = 0, esp = 1, ferr = 'pen',
      hist = [], penVisto = 0, ultimoM = 0, tSalva = null, pedeLimpar = false, ro = null;

    el.classList.add('lv'); if (opc.leitura) el.classList.add('leitura');
    el.innerHTML =
      '<div class="lv-bar">' +
      '<div class="lv-modo" role="group" aria-label="Como escrever"><button type="button" data-m="txt" aria-pressed="true">Texto</button><button type="button" data-m="pen" aria-pressed="false">Caneta</button></div>' +
      '<div class="lv-fer" role="toolbar" aria-label="Ferramentas da caneta" hidden>' +
      '<button type="button" data-f="pen" aria-pressed="true" aria-label="Caneta" title="Caneta">' + IC.pen + '</button>' +
      '<button type="button" data-f="bor" aria-pressed="false" aria-label="Borracha: passe sobre o traço para apagar" title="Borracha">' + IC.bor + '</button><span class="lv-sep"></span>' +
      CORES.map(function (c, i) { return '<button type="button" class="cor" data-c="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + NOMES[i] + '" title="' + NOMES[i] + '"><i style="background:' + c + '"></i></button>'; }).join('') + '<span class="lv-sep"></span>' +
      ESP.map(function (w, i) { return '<button type="button" class="esp" data-e="' + i + '" aria-pressed="' + (i === 1) + '" aria-label="Espessura ' + ENOMES[i].toLowerCase() + '" title="' + ENOMES[i] + '"><i style="width:' + (4 + i * 4) + 'px;height:' + (4 + i * 4) + 'px"></i></button>'; }).join('') + '<span class="lv-sep"></span>' +
      '<button type="button" data-f="und" aria-label="Desfazer" title="Desfazer" disabled>' + IC.und + '</button>' +
      '<button type="button" data-f="cl" aria-label="Limpar os desenhos desta página" title="Limpar os desenhos desta página">' + IC.cl + '</button></div>' +
      '</div>' +
      '<div class="lv-livro" aria-live="off"></div>' +
      '<div class="lv-nav"><button type="button" data-n="-1" aria-label="Página anterior">' + IC.ant + '</button><span class="lbl" aria-live="polite"></span><button type="button" data-n="1" aria-label="Próxima página">' + IC.prox + '</button><button type="button" class="mais" data-n="mais">+ página</button></div>' +
      '<div class="lv-prof" hidden><button type="button" class="lv-pf" aria-pressed="false"></button><span class="lv-pfs" aria-live="polite"></span></div>' +
      '<p class="lv-dica" hidden>Com a caneta em uso, a palma da mão não risca a folha. Para virar a página, use as setas.</p>';
    var livro = el.querySelector('.lv-livro'), barra = el.querySelector('.lv-bar'), fer = el.querySelector('.lv-fer'), nav = el.querySelector('.lv-nav'),
      lbl = nav.querySelector('.lbl'), btUnd = fer.querySelector('[data-f="und"]'), dica = el.querySelector('.lv-dica');

    /* ---------- dados ---------- */
    function nota() { return id ? C.obter(id) : null; }
    function lePags(n) {
      var p = [{ x: n.x || '', s: Array.isArray(n.s) ? n.s : [] }];
      (Array.isArray(n.pp) ? n.pp : []).forEach(function (q) { p.push({ x: (q && q.x) || '', s: (q && Array.isArray(q.s)) ? q.s : [] }); });
      return p;
    }
    function salva(campos) {
      if (!id) return; var n = C.atualizar(id, campos); if (n) ultimoM = n.m;
      if (opc.aoMudar) opc.aoMudar(n);
    }
    function salvaPag(i) { if (i === 0) salva({ x: pags[0].x, s: pags[0].s }); else salva({ pp: pags.slice(1).map(function (q) { return { x: q.x, s: q.s }; }) }); }
    function salvaTudo() { salva({ x: pags[0].x, s: pags[0].s, pp: pags.slice(1).map(function (q) { return { x: q.x, s: q.s }; }) }); }

    /* ---------- páginas ---------- */
    function cabecalho(n) {
      return '<div class="lv-dia"><div class="lv-dt" role="group" aria-label="Data">' +
        '<input class="a" type="number" inputmode="numeric" min="1" max="9999" aria-label="Ano" value="' + esc(n.a || '') + '"><ruby>年<rt>ねん</rt></ruby>' +
        '<input class="o" type="number" inputmode="numeric" min="1" max="12" aria-label="Mês" value="' + esc(n.o || '') + '"><ruby>月<rt>がつ</rt></ruby>' +
        '<input class="d" type="number" inputmode="numeric" min="1" max="31" aria-label="Dia" value="' + esc(n.d || '') + '"><ruby>日<rt>にち</rt></ruby></div>' +
        '<div class="lv-sem" role="group" aria-label="Dia da semana: toque para circular">' +
        SEM.map(function (w, i) { return '<button type="button" data-w="' + i + '" aria-pressed="' + (String(n.w) === String(i)) + '" aria-label="' + w[2] + '"><ruby>' + w[0] + '<rt>' + w[1] + '</rt></ruby></button>'; }).join('') +
        '</div></div><input class="lv-tit" type="text" placeholder="Título (opcional)" maxlength="120" aria-label="Título da anotação" value="' + esc(n.t || '') + '">';
    }
    function constroi() {
      var n = nota(); livro.innerHTML = '';
      if (!n) return;
      pags.forEach(function (pg, i) {
        var d = document.createElement('section');
        d.className = 'lv-pg' + (i === 0 ? ' p1' : ''); d.dataset.i = i; d.setAttribute('aria-label', 'Página ' + (i + 1));
        d.innerHTML = (i === 0 ? cabecalho(n) : '') +
          '<textarea class="lv-tx" aria-label="Texto da página ' + (i + 1) + '" placeholder="' + (i === 0 ? 'Escreva aqui…' : '') + '"></textarea>' +
          '<canvas aria-label="Desenho da página ' + (i + 1) + '"></canvas><span class="lv-num" aria-hidden="true">' + (i + 1) + '</span>' +
          (i > 0 ? '<button type="button" class="lv-del" aria-label="Apagar a página ' + (i + 1) + '">apagar página</button>' : '');
        d.querySelector('textarea').value = pg.x;
        livro.appendChild(d);
        liga(d, i);
        if (opc.leitura) Array.prototype.forEach.call(d.querySelectorAll('input,textarea'), function (x) { x.readOnly = true; x.tabIndex = -1; });
      });
      mostra(); requestAnimationFrame(function () { ajusta(); });
    }
    function paginas() { return livro.querySelectorAll('.lv-pg:not(.lv-fant)'); }
    function pg(i) { return livro.querySelector('.lv-pg[data-i="' + i + '"]'); }
    function visiveis() { return dupla ? [ini, ini + 1] : [ini]; }
    function mostra(anim) {
      var v = visiveis();
      Array.prototype.forEach.call(paginas(), function (p) {
        var i = +p.dataset.i, on = v.indexOf(i) >= 0;
        p.classList.toggle('fora', !on); p.classList.toggle('esq', dupla && i === v[0]); p.classList.toggle('dir', dupla && i === v[1]);
        p.setAttribute('aria-hidden', String(!on));
        p.style.gridColumn = on && dupla ? (i === v[0] ? '1' : '2') : '';
      });
      /* no caderno aberto, a página da direita ainda em branco vira um convite para continuar */
      var fan = livro.querySelector('.lv-fant');
      if (dupla && !opc.leitura && pags.length && ini + 1 >= pags.length) {
        if (!fan) { fan = document.createElement('div'); fan.className = 'lv-pg lv-fant dir'; fan.innerHTML = '<button type="button">+ nova página</button>'; fan.querySelector('button').onclick = function () { maisPagina(true); }; livro.appendChild(fan); }
        fan.style.gridColumn = '2';
      } else if (fan) fan.remove();
      var ult = Math.min(pags.length, ini + (dupla ? 2 : 1));
      lbl.textContent = (dupla && ult > ini + 1 ? 'páginas ' + (ini + 1) + '–' + ult : 'página ' + (ini + 1)) + ' de ' + pags.length;
      nav.querySelector('[data-n="-1"]').disabled = ini <= 0;
      nav.querySelector('[data-n="1"]').disabled = ini + (dupla ? 2 : 1) >= pags.length;
      if (anim) { livro.classList.remove('vai', 'volta'); void livro.offsetWidth; livro.classList.add(anim > 0 ? 'vai' : 'volta'); }
      desenhaVisiveis();
    }
    function vaiPara(i, foco) {
      i = Math.max(0, Math.min(pags.length - 1, i));
      var alvo = dupla ? i - (i % 2) : i; if (alvo === ini) return;
      var dir = alvo > ini ? 1 : -1; ini = alvo; mostra(dir);
      if (foco) { var t = pg(i).querySelector('.lv-tx'); t.focus(); }
    }
    function anda(d) { vaiPara(ini + d * (dupla ? 2 : 1)); }
    function maisPagina(foco) {
      pags.push({ x: '', s: [] }); salvaTudo(); constroi(); vaiPara(pags.length - 1, foco);
      if (foco && modo === 'txt') pg(pags.length - 1).querySelector('.lv-tx').focus();
    }

    /* ---------- texto que passa da página vai para a seguinte ---------- */
    function cabe(t, txt) { var v = t.value; t.value = txt; var ok = t.scrollHeight <= t.clientHeight + 2; t.value = v; return ok; }
    function encaixa(i, cursor) {
      var p = pg(i); if (!p) return; var t = p.querySelector('.lv-tx'), txt = pags[i].x;
      if (!t.clientHeight || t.scrollHeight <= t.clientHeight + 2) return;
      var lo = 0, hi = txt.length;
      while (lo < hi) { var m = (lo + hi + 1) >> 1; if (cabe(t, txt.slice(0, m))) lo = m; else hi = m - 1; }
      var corte = lo, esp2 = Math.max(txt.lastIndexOf(' ', lo), txt.lastIndexOf('\n', lo));
      if (esp2 > lo - 40 && esp2 > 0) corte = esp2 + 1;
      if (corte <= 0) corte = lo || 1;
      var resto = txt.slice(corte);
      pags[i].x = txt.slice(0, corte).replace(/[ ]+$/, ''); t.value = pags[i].x;
      if (i + 1 >= pags.length) { pags.push({ x: '', s: [] }); salvaTudo(); constroi(); }
      pags[i + 1].x = resto + (pags[i + 1].x ? (resto.endsWith('\n') ? '' : '\n') + pags[i + 1].x : '');
      var t2 = pg(i + 1).querySelector('.lv-tx'); t2.value = pags[i + 1].x;
      salvaTudo(); encaixa(i + 1);
      if (cursor != null && cursor >= corte) {
        vaiPara(i + 1); var c = Math.min(cursor - corte, resto.length); t2.focus(); t2.setSelectionRange(c, c);
      }
    }

    /* ---------- eventos de uma página ---------- */
    function liga(d, i) {
      var t = d.querySelector('.lv-tx');
      t.addEventListener('input', function () {
        pags[i].x = t.value; salvaPag(i);
        if (t.scrollHeight > t.clientHeight + 2) encaixa(i, t.selectionStart);
      });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && i > 0 && t.selectionStart === 0 && t.selectionEnd === 0) {
          e.preventDefault(); vaiPara(i - 1); var t0 = pg(i - 1).querySelector('.lv-tx'); t0.focus(); t0.setSelectionRange(t0.value.length, t0.value.length);
        }
      });
      t.addEventListener('focus', function () { if (visiveis().indexOf(i) < 0) vaiPara(i); });
      if (i === 0) {
        d.querySelector('.a').oninput = function () { salva({ a: this.value }); };
        d.querySelector('.o').oninput = function () { salva({ o: this.value }); };
        d.querySelector('.d').oninput = function () { salva({ d: this.value }); };
        d.querySelector('.lv-tit').oninput = function () { salva({ t: this.value }); };
        d.querySelector('.lv-sem').onclick = function (e) {
          var b = e.target.closest('button'); if (!b || opc.leitura) return; var n = nota(); if (!n) return;
          var w = String(n.w) === b.dataset.w ? null : b.dataset.w;
          Array.prototype.forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', String(String(w) === x.dataset.w)); });
          salva({ w: w });
        };
      }
      var del = d.querySelector('.lv-del');
      if (del) del.onclick = function () {
        if (!this.dataset.p) { this.dataset.p = '1'; this.textContent = 'apagar mesmo?'; var b = this; setTimeout(function () { b.dataset.p = ''; b.textContent = 'apagar página'; }, 3000); return; }
        pags.splice(i, 1); salvaTudo(); constroi(); vaiPara(Math.min(i, pags.length - 1));
      };
      caneta(d.querySelector('canvas'), i);
    }

    /* ---------- caneta ---------- */
    function larg(t, p) { return ESP[t.w] * (0.55 + 0.9 * (p / 9)); }
    function pts(t) { var o = [], x = 0, y = 0, d = t.d; for (var i = 0; i < d.length; i += 3) { x = i ? x + d[i] : d[i]; y = i ? y + d[i + 1] : d[i + 1]; o.push([x, y, d[i + 2]]); } return o; }
    function traco(ctx, t, s) {
      var P = pts(t); ctx.strokeStyle = CORES[t.k] || CORES[0]; ctx.fillStyle = ctx.strokeStyle; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (P.length === 1) { ctx.beginPath(); ctx.arc(P[0][0] * s, P[0][1] * s, larg(t, P[0][2]) * s / 2, 0, 6.2832); ctx.fill(); return; }
      for (var i = 1; i < P.length; i++) {
        var a = P[i - 1], b = P[i], m0 = i === 1 ? a : [(P[i - 2][0] + a[0]) / 2, (P[i - 2][1] + a[1]) / 2], m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        ctx.lineWidth = larg(t, b[2]) * s; ctx.beginPath(); ctx.moveTo(m0[0] * s, m0[1] * s); ctx.quadraticCurveTo(a[0] * s, a[1] * s, m1[0] * s, m1[1] * s); ctx.stroke();
      }
    }
    function desenha(i, extra) {
      var p = pg(i); if (!p || p.classList.contains('fora')) return;
      var c = p.querySelector('canvas'), r = c.getBoundingClientRect(); if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 3), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      var ctx = c.getContext('2d'), s = c.width / W; ctx.clearRect(0, 0, c.width, c.height);
      pags[i].s.forEach(function (t) { traco(ctx, t, s); }); if (extra) traco(ctx, extra, s);
    }
    function desenhaVisiveis() { visiveis().forEach(function (i) { if (i < pags.length) desenha(i); }); }
    function guardaHist(i) { hist.push({ i: i, s: JSON.stringify(pags[i].s) }); if (hist.length > 40) hist.shift(); btUnd.disabled = false; }
    function caneta(c, i) {
      var atual = null, apagando = false, borrou = false;
      function pos(e) { var r = c.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]; }
      function adiciona(e) {
        var p = pos(e), pr = e.pointerType === 'pen' ? Math.max(1, Math.round((e.pressure || .5) * 9)) : 5, d = atual.d, n = d.length;
        if (n) { var lx = 0, ly = 0; for (var k = 0; k < n; k += 3) { lx = k ? lx + d[k] : d[k]; ly = k ? ly + d[k + 1] : d[k + 1]; } if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < 3) return false; d.push(p[0] - lx, p[1] - ly, pr); }
        else d.push(p[0], p[1], pr);
        return true;
      }
      function apaga(e) {
        var p = pos(e), r = 36, tr = pags[i].s;
        var resto = tr.filter(function (t) { return !pts(t).some(function (q) { return Math.abs(q[0] - p[0]) < r && Math.abs(q[1] - p[1]) < r; }); });
        if (resto.length === tr.length) return;
        if (!borrou) { guardaHist(i); borrou = true; }
        pags[i].s = resto; desenha(i);
      }
      c.addEventListener('pointerdown', function (e) {
        if (modo !== 'pen') return;
        if (e.pointerType === 'pen') penVisto = Date.now();
        if (e.pointerType === 'touch' && Date.now() - penVisto < 4000) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (x) {}
        if (ferr === 'bor' || (e.pointerType === 'pen' && (e.buttons & 32))) { apagando = true; borrou = false; apaga(e); return; }
        atual = { k: cor, w: esp, d: [] }; adiciona(e); desenha(i, atual);
      });
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'pen') penVisto = Date.now();
        if (apagando) { var ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev.length) ev = [e]; ev.forEach(apaga); return; }
        if (!atual) return; e.preventDefault();
        var ev2 = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev2.length) ev2 = [e];
        var novo = false; ev2.forEach(function (x) { if (adiciona(x)) novo = true; }); if (novo) desenha(i, atual);
      });
      function fim() {
        if (apagando) { apagando = false; if (borrou) salvaPag(i); borrou = false; return; }
        if (!atual) return; if (atual.d.length) { guardaHist(i); pags[i].s = pags[i].s.concat([atual]); } atual = null; desenha(i); salvaPag(i);
      }
      c.addEventListener('pointerup', fim); c.addEventListener('pointercancel', fim);
      c.addEventListener('lostpointercapture', function () { if (atual) fim(); });
      c.addEventListener('contextmenu', function (e) { if (modo === 'pen') e.preventDefault(); });
    }

    /* ---------- barra ---------- */
    function pressiona(sel, atr, valor) { Array.prototype.forEach.call(fer.querySelectorAll(sel), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(atr) === String(valor))); }); }
    function setModo(m) {
      modo = m; el.classList.toggle('caneta', m === 'pen'); fer.hidden = m !== 'pen'; dica.hidden = m !== 'pen';
      Array.prototype.forEach.call(barra.querySelectorAll('.lv-modo button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
      if (m === 'pen' && document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }
    barra.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.m) { setModo(b.dataset.m); return; }
      if (b.dataset.c != null) { cor = +b.dataset.c; ferr = 'pen'; pressiona('.cor', 'data-c', cor); pressiona('[data-f="pen"],[data-f="bor"]', 'data-f', 'pen'); el.classList.remove('borracha'); return; }
      if (b.dataset.e != null) { esp = +b.dataset.e; pressiona('.esp', 'data-e', esp); return; }
      var f = b.dataset.f;
      if (f === 'pen' || f === 'bor') { ferr = f; pressiona('[data-f="pen"],[data-f="bor"]', 'data-f', f); el.classList.toggle('borracha', f === 'bor'); }
      if (f === 'und' && hist.length) {
        var h = hist.pop(); if (h.i < pags.length) { pags[h.i].s = JSON.parse(h.s); salvaPag(h.i); vaiPara(h.i); desenha(h.i); }
        btUnd.disabled = !hist.length;
      }
      if (f === 'cl') {
        var alvo = visiveis().filter(function (i) { return i < pags.length && pags[i].s.length; });
        if (!alvo.length) return;
        if (!pedeLimpar) { pedeLimpar = true; b.setAttribute('aria-label', 'Limpar mesmo? Toque de novo'); b.style.borderColor = '#c23f5e'; setTimeout(function () { pedeLimpar = false; b.setAttribute('aria-label', 'Limpar os desenhos desta página'); b.style.borderColor = ''; }, 3000); return; }
        pedeLimpar = false; b.style.borderColor = '';
        alvo.forEach(function (i) { guardaHist(i); pags[i].s = []; salvaPag(i); desenha(i); });
      }
    });
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.n === 'mais') maisPagina(true); else anda(+b.dataset.n);
    });
    /* arrastar para o lado (no modo Texto) e setas do teclado */
    var x0 = null, y0 = null;
    livro.addEventListener('touchstart', function (e) { if (modo === 'pen' || e.touches.length !== 1) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    livro.addEventListener('touchend', function (e) {
      if (x0 == null) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) anda(dx < 0 ? 1 : -1);
    }, { passive: true });
    el.addEventListener('keydown', function (e) {
      var tg = e.target, campo = tg && (tg.tagName === 'TEXTAREA' || tg.tagName === 'INPUT');
      if (campo && !(e.altKey)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); anda(1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); anda(-1); }
    });

    /* ---------- tamanho ---------- */
    function ajusta() {
      var w = el.clientWidth, d = !opc.simples && w >= 760;
      /* 1% da largura da folha, em px (no lugar de unidades de container: elas deixavam cada tecla lenta, ~1 s) */
      if (w) el.style.setProperty('--u', ((d ? w / 2 : w) / 100).toFixed(3) + 'px');
      if (d !== dupla) { dupla = d; el.classList.toggle('dupla', d); ini = dupla ? ini - (ini % 2) : ini; mostra(); }
      desenhaVisiveis();
    }
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { ajusta(); }); ro.observe(el); } else window.addEventListener('resize', ajusta);

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    /* ---------- mostrar para a professora ---------- */
    var cxProf = el.querySelector('.lv-prof'), btProf = cxProf.querySelector('button'), stProf = cxProf.querySelector('.lv-pfs');
    function atualizaProf() {
      var n = nota(), ok = !opc.leitura && C.prof && C.prof.disponivel() && n;
      cxProf.hidden = !ok; if (!ok) return;
      var on = !!n.sp; btProf.setAttribute('aria-pressed', String(on));
      btProf.textContent = on ? '✓ Mostrando para a professora' : 'Mostrar para a professora';
      btProf.title = on ? 'Toque para deixar de mostrar esta anotação' : 'Só esta anotação fica visível para a professora';
      stProf.textContent = on ? C.prof.texto() : 'Só esta anotação. Você pode deixar de mostrar quando quiser.';
    }
    btProf.addEventListener('click', function () { var n = nota(); if (!n) return; salva({ sp: !n.sp }); atualizaProf(); });
    if (!opc.leitura && C.on) C.on(function (tipo) { if (tipo === 'prof') atualizaProf(); });

    var api = {
      abrir: function (novoId, manter) {
        var n = C.obter(novoId); if (!n) { id = null; pags = []; livro.innerHTML = ''; lbl.textContent = ''; cxProf.hidden = true; return; }
        var mesmo = novoId === id; id = novoId; ultimoM = n.m || 0; pags = lePags(n); hist = []; btUnd.disabled = true;
        if (!(mesmo && manter)) ini = 0; ini = Math.min(ini, pags.length - 1); if (dupla) ini -= ini % 2;
        constroi(); atualizaProf();
      },
      id: function () { return id; },
      ultimoM: function () { return ultimoM; },
      foca: function () { if (!pags.length) return; var t = pg(ini) && pg(ini).querySelector('.lv-tx'); if (t && modo === 'txt') t.focus(); },
      novaSobre: function (titulo, dt) {
        var n = C.nova(), c = { t: titulo };
        if (dt) { c.a = String(dt.getFullYear()); c.o = String(dt.getMonth() + 1); c.d = String(dt.getDate()); c.w = String((dt.getDay() + 6) % 7); }
        C.atualizar(n.id, c); setModo('txt'); api.abrir(n.id); return n.id;
      },
      modo: setModo,
      reajustar: ajusta
    };
    ajusta();
    return api;
  }
  window.UniLivro = { montar: montar };
})();
