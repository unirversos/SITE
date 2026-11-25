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
  var W = 2000, H = 2800,
    CORES = ['#3a2b38', '#c23f5e', '#517158', '#4f46a5', '#d97706', '#0284c7'],
    NOMES = ['Tinta escura', 'Rosa', 'Verde', 'Roxo', 'Âmbar', 'Azul'],
    ESP = [5, 9, 16], ENOMES = ['Fina', 'Média', 'Grossa'],
    PAPEIS = [
      { id: 'pautado', nome: 'Pautado' },
      { id: 'kanji', nome: 'Kanji' },
      { id: 'cornell', nome: 'Vocabulário' },
      { id: 'pontilhado', nome: 'Pontilhado' },
      { id: 'branco', nome: 'Branco' }
    ],
    SEM = [['月', 'げつ', 'segunda-feira'], ['火', 'か', 'terça-feira'], ['水', 'すい', 'quarta-feira'], ['木', 'もく', 'quinta-feira'], ['金', 'きん', 'sexta-feira'], ['土', 'ど', 'sábado'], ['日', 'にち', 'domingo']];

  var KANJI_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect x='0.5' y='0.5' width='47' height='47' fill='none' stroke='%23e5cfd4' stroke-width='1'/%3E%3Cline x1='24' y1='0' x2='24' y2='48' stroke='%23f1e2e5' stroke-width='1' stroke-dasharray='3 3'/%3E%3Cline x1='0' y1='24' x2='48' y2='24' stroke='%23f1e2e5' stroke-width='1' stroke-dasharray='3 3'/%3E%3C/svg%3E\")";

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
    '.lv-tcor{display:inline-flex;align-items:center;gap:5px;padding:3px 6px;border-radius:99px;background:#fff;border:1.5px solid #ecdadd;min-height:40px}',
    '.lv-tcor button{cursor:pointer;display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;border:2px solid transparent;background:transparent;padding:0}',
    '.lv-tcor button i{display:block;width:15px;height:15px;border-radius:50%}',
    '.lv-tcor button[aria-pressed="true"]{border-color:#c23f5e;background:#fdf1f4}',
    '.lv.leitura .lv-tcor,.lv.caneta .lv-tcor{display:none!important}',
    '.lv-fer .esp i{display:block;border-radius:50%;background:#3a2b38}.lv-sep{width:1px;height:24px;background:#ecdadd;margin:0 2px}',
    '.lv button:focus-visible,.lv input:focus-visible,.lv textarea:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}',
    '.lv-fotoBt,.lv-dlBt,.lv-estBt{font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;font-weight:700;font-size:13.5px;padding:5px 14px;border-radius:99px;min-height:40px;display:inline-flex;align-items:center;gap:6px}',
    '.lv-fotoBt:disabled,.lv-dlBt:disabled,.lv-estBt:disabled{opacity:.5;cursor:default}',
    '.lv-estBt[aria-pressed="true"]{background:#517158;border-color:#517158;color:#fff}',
    '.lv-papSel{font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;font-weight:700;font-size:13.5px;padding:5px 12px;border-radius:99px;min-height:40px}',
    '.lv-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:0;background:#fff}',
    '.lv-pg.c-foto .lv-tx{position:relative;z-index:1;background:none}',
    '.lv-fmsg{position:absolute;left:8%;right:8%;top:42%;z-index:1;text-align:center;font-size:13px;color:#705f6c}',
    '.lv-rf{position:absolute;top:calc(var(--u,4px)*1.6);left:calc(var(--u,4px)*1.6);z-index:4;font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#705f6c;border-radius:99px;font-size:12px;font-weight:700;padding:3px 10px;min-height:28px}',
    '.lv.caneta .lv-rf{display:none}.lv.leitura .lv-rf,.lv.leitura .lv-fotoBt,.lv.leitura .lv-papSel,.lv.leitura .lv-dlBt,.lv.leitura .lv-estBt{display:none!important}',
    /* painel de estudo / flashcards */
    '.lv-est{background:#fff;border:1.5px solid #ecdadd;border-radius:18px;padding:18px;display:grid;gap:14px;box-shadow:0 14px 30px -22px rgba(58,43,56,.45)}',
    '.lv-est-h{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '.lv-est-h b{font-family:"Baloo 2",system-ui,sans-serif;font-size:18px}',
    '.lv-est-prg{font-size:13px;color:#705f6c;font-weight:700}',
    '.lv-card{background:#fdf6f4;border:1.5px solid #ecdadd;border-radius:16px;padding:28px 20px;min-height:170px;display:grid;place-items:center;text-align:center;gap:12px;cursor:pointer;transition:border-color .15s}',
    '.lv-card:hover{border-color:#c23f5e}',
    '.lv-card-f{font-family:"Zen Maru Gothic",system-ui,sans-serif;font-size:clamp(22px,4vw,30px);font-weight:800;color:#3a2b38;word-break:break-word}',
    '.lv-card-v{font-size:17px;color:#517158;font-weight:700;padding-top:10px;border-top:1.5px dashed #ecdadd;width:100%}',
    '.lv-card-d{font-size:13px;color:#705f6c}',
    '.lv-est-acts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}',
    '.lv-est-acts button{font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:8px 16px;font-size:14px;font-weight:700;min-height:40px}',
    '.lv-est-acts button.ok{background:#517158;border-color:#517158;color:#fff}',
    '.lv-est-acts button.rv{border-color:#c23f5e;color:#c23f5e}',
    /* livro aberto + palco de zoom/pan */
    '.lv-stage{position:relative;overflow:hidden;border-radius:16px}',
    '.lv-livro{position:relative;display:grid;grid-template-columns:1fr;gap:0;perspective:1800px;touch-action:pan-y;transform-origin:0 0;will-change:transform}',
    '.lv.zoom .lv-stage{cursor:grab}.lv.zoom .lv-livro{touch-action:none}',
    '.lv-fer .zm{min-width:46px;font-size:12px;padding:0 6px}',
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
    '.lv-dt{display:flex;align-items:flex-end;gap:calc(var(--u,4px)*1.2)}',
    '.lv-dt input{font:inherit;font-family:"Baloo 2",system-ui,sans-serif;font-weight:700;font-size:max(15px,calc(var(--u,4px)*4.4));text-align:center;color:#3a2b38;border:0;border-bottom:2px solid #ecdadd;background:transparent;border-radius:0;padding:0;height:1.5em;-moz-appearance:textfield}',
    '.lv-dt input::-webkit-outer-spin-button,.lv-dt input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',
    '.lv-dt input:focus{outline:none;border-bottom-color:#c23f5e}',
    '.lv-dt .a{width:4.2ch}.lv-dt .o,.lv-dt .d{width:2.6ch}',
    '.lv-dt ruby,.lv-sem ruby{font-family:"Baloo 2",system-ui,sans-serif;font-weight:700;font-size:max(15px,calc(var(--u,4px)*4.4));margin-right:calc(var(--u,4px)*1.2)}',
    '.lv-dt rt,.lv-sem rt{font-family:"Zen Maru Gothic",system-ui,sans-serif;font-size:max(8px,calc(var(--u,4px)*1.9));font-weight:500;color:#705f6c}',
    '.lv-sem{display:flex;gap:calc(var(--u,4px)*0.8)}',
    '.lv-sem button{font:inherit;cursor:pointer;position:relative;min-width:0;flex:0 1 auto;width:max(22px,calc(var(--u,4px)*7.6));height:max(32px,calc(var(--u,4px)*7.6));border:0;background:transparent;color:#3a2b38;display:grid;place-items:center;padding:0}',
    '.lv-sem button ruby{margin:0;display:grid;justify-items:center;font-size:max(12px,calc(var(--u,4px)*4))}',
    '.lv-sem button::before{content:"";position:absolute;inset:0;border:2.5px solid #c23f5e;border-radius:52% 48% 55% 45%/48% 55% 45% 52%;transform:rotate(-6deg) scale(.6);opacity:0;transition:opacity .15s,transform .15s}',
    '.lv-sem button[aria-pressed="true"]{color:#c23f5e}.lv-sem button[aria-pressed="true"]::before{opacity:1;transform:rotate(-6deg) scale(1)}',
    '.lv-sem button:hover::before{opacity:.35;transform:rotate(-6deg) scale(1)}.lv-sem button[aria-pressed="true"]:hover::before{opacity:1}',
    '.lv-tit{font-family:"Baloo 2",system-ui,sans-serif;font-weight:800;font-size:max(18px,calc(var(--u,4px)*5.4));border:0;border-bottom:1.5px dashed #ecdadd;background:transparent;color:#3a2b38;padding:calc(var(--u,4px)*1.4) 0 calc(var(--u,4px)*1.6);width:100%;margin-bottom:calc(var(--u,4px)*1)}',
    '.lv-tit:focus{outline:none;border-bottom-color:#c23f5e}',
    /* folha pautada e variações de papel (contenteditable com cor por letra/palavra) */
    '.lv-tx{flex:1;min-height:0;width:100%;overflow-y:auto;border:0;padding:0;color:#3a2b38;font:inherit;font-size:max(14px,calc(var(--u,4px)*3.7));line-height:max(27px,calc(var(--u,4px)*6.6));white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;background:repeating-linear-gradient(transparent 0 calc(max(27px,calc(var(--u,4px)*6.6)) - 1px),#ecdadd calc(max(27px,calc(var(--u,4px)*6.6)) - 1px) max(27px,calc(var(--u,4px)*6.6)));background-attachment:local}',
    '.lv-tx:empty::before{content:attr(data-ph);color:#a8969f;pointer-events:none}',
    '.lv-tx:focus:empty::before,.lv-pg.tocou .lv-tx:empty::before{color:transparent}',
    '.lv-pg.pap-kanji .lv-tx{background-image:' + KANJI_SVG + ';background-size:calc(max(36px,calc(var(--u,4px)*11))) calc(max(36px,calc(var(--u,4px)*11)));background-repeat:repeat;background-attachment:local}',
    '.lv-pg.pap-cornell .lv-tx{background:linear-gradient(90deg,transparent 0 calc(36% - 1px),#e8bcc5 calc(36% - 1px) calc(36% + 1px),transparent calc(36% + 1px) 100%),repeating-linear-gradient(transparent 0 calc(max(27px,calc(var(--u,4px)*6.6)) - 1px),#ecdadd calc(max(27px,calc(var(--u,4px)*6.6)) - 1px) max(27px,calc(var(--u,4px)*6.6)));background-attachment:local}',
    '.lv-pg.pap-pontilhado .lv-tx{background-image:radial-gradient(#d8c1c7 1.35px,transparent 1.45px);background-size:calc(max(18px,calc(var(--u,4px)*4.8))) calc(max(18px,calc(var(--u,4px)*4.8)));background-attachment:local}',
    '.lv-pg.pap-branco .lv-tx{background:none}',
    '.lv-tx:focus{outline:none}',
    /* a dica some ao tocar (teclado) e também ao tocar com a caneta */
    '.lv-tit:focus::placeholder,.lv-tx:focus::placeholder,.lv-pg.tocou .lv-tit::placeholder,.lv-pg.tocou .lv-tx::placeholder{color:transparent}',
    '.lv-num{position:absolute;bottom:calc(var(--u,4px)*1.6);font-size:max(11px,calc(var(--u,4px)*2.4));color:#a8969f;pointer-events:none}',
    '.lv-pg .lv-num{right:calc(var(--u,4px)*4)}.lv.dupla .lv-pg.esq .lv-num{right:auto;left:calc(var(--u,4px)*4)}',
    '.lv-del{position:absolute;top:calc(var(--u,4px)*1.6);right:calc(var(--u,4px)*1.6);z-index:4;font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#705f6c;border-radius:99px;font-size:12px;font-weight:700;padding:3px 10px;min-height:30px;opacity:.75}',
    '.lv-del:hover{opacity:1;color:#a32a2a;border-color:#d9a3a9}',
    '.lv.caneta .lv-del{display:none}',
    /* no modo Caneta, rolar com a caneta virava risco: botões para ir à folha de cima e à próxima */
    '.lv-rola{display:none}.lv.caneta .lv-rola{display:flex;flex-direction:column;gap:8px;position:sticky;bottom:12px;margin:-104px 8px 0 auto;width:max-content;z-index:5}',
    '.lv-rola button{font:inherit;font-size:16px;width:46px;height:46px;border-radius:50%;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;cursor:pointer;box-shadow:0 8px 18px -10px rgba(58,43,56,.45)}.lv-rola button:disabled{opacity:.35;cursor:default}',
    /* caneta por cima (duplo canvas: bg para traços salvos, fg para traço ativo) */
    '.lv-pg canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;touch-action:none;display:block}',
    '.lv-pg canvas.lv-cv-fg{z-index:3}',
    '.lv.caneta .lv-pg canvas.lv-cv-fg{pointer-events:auto;cursor:crosshair}.lv.caneta.borracha .lv-pg canvas.lv-cv-fg{cursor:cell}',
    '.lv.caneta .lv-tx,.lv.caneta .lv-dia,.lv.caneta .lv-tit{pointer-events:none}',
    /* navegação */
    '.lv-nav{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}',
    '.lv-nav .lbl{font-size:13.5px;color:#705f6c;min-width:9em;text-align:center}',
    '.lv-nav .mais{padding:0 14px}.lv-nav .vst{padding:0 12px;gap:6px;display:inline-flex;align-items:center}.lv-nav .vst svg{width:20px;height:20px}',
    /* virar a página */
    '@keyframes lvFrente{from{transform:rotateY(-28deg);opacity:.25}to{transform:none;opacity:1}}',
    '@keyframes lvTras{from{transform:rotateY(28deg);opacity:.25}to{transform:none;opacity:1}}',
    '.lv:not(.dupla) .lv-livro.vai .lv-pg:not(.fora){transform-origin:left center;animation:lvFrente .38s ease-out}',
    '.lv:not(.dupla) .lv-livro.volta .lv-pg:not(.fora){transform-origin:right center;animation:lvTras .38s ease-out}',
    /* caderno aberto (2 páginas): vira só UMA folha, presa na lombada, como num livro de verdade */
    '@keyframes lvFolhaE{from{transform:rotateY(90deg)}to{transform:none}}',
    '@keyframes lvFolhaD{from{transform:rotateY(-90deg)}to{transform:none}}',
    '.lv.dupla .lv-livro.vai,.lv.dupla .lv-livro.volta{perspective:2200px}',
    '.lv.dupla .lv-livro.vai .lv-pg.esq{transform-origin:right center;animation:lvFolhaE .45s cubic-bezier(.2,.7,.3,1);backface-visibility:hidden;z-index:2}',
    '.lv.dupla .lv-livro.volta .lv-pg.dir{transform-origin:left center;animation:lvFolhaD .45s cubic-bezier(.2,.7,.3,1);backface-visibility:hidden;z-index:2}',
    '@media (prefers-reduced-motion:reduce){.lv-livro.vai .lv-pg,.lv-livro.volta .lv-pg{animation:none}}',
    /* duas folhas num espaço estreito: uma embaixo da outra, cada uma com a largura toda */
    '.lv.dupla.empilha .lv-livro{grid-template-columns:1fr;gap:14px}.lv.dupla.empilha .lv-livro::after{display:none}',
    '.lv.dupla.empilha .lv-pg.esq,.lv.dupla.empilha .lv-pg.dir{border-radius:16px;border:1.5px solid #ecdadd}',
    '.lv.dupla.empilha .lv-pg.esq .lv-num{left:auto;right:calc(var(--u,4px)*4)}.lv.dupla.empilha .lv-fant{aspect-ratio:auto;min-height:76px}',
    '.lv.dupla.empilha .lv-livro.vai .lv-pg,.lv.dupla.empilha .lv-livro.volta .lv-pg{animation:none}',
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
    mar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l-6 6v3h9l3-3"/><path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>',
    bor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20h11M5.5 14.5l8-8a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8l-2.5-2.5a2 2 0 0 1 0-2z"/></svg>',
    und: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 0 10h-3"/></svg>',
    red: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 7l4 4-4 4"/><path d="M19 11h-9a5 5 0 0 0 0 10h3"/></svg>',
    cl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/></svg>',
    ant: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    prox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- fotos do caderno ----------
     A foto fica numa página (campo f = id). O arquivo em si NÃO vai dentro da anotação (o documento da conta é pequeno):
     fica no aparelho (IndexedDB "uniCadernoFotos") e, com login, em progress/{uid}/fotos/{id} (Firestore). */
  var Fotos = (function () {
    var DBP = null, subindo = false;
    function abre() {
      if (DBP) return DBP;
      DBP = new Promise(function (res, rej) {
        try { var q = indexedDB.open('uniCadernoFotos', 1); q.onupgradeneeded = function () { q.result.createObjectStore('f', { keyPath: 'id' }); }; q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }
        catch (e) { rej(e); }
      });
      return DBP;
    }
    function op(modo, fn) { return abre().then(function (db) { return new Promise(function (res, rej) { var t = db.transaction('f', modo), r = fn(t.objectStore('f')); t.oncomplete = function () { res(r && r.result); }; t.onerror = t.onabort = function () { rej(t.error); }; }); }); }
    function pega(id) { return op('readonly', function (s) { return s.get(id); }).catch(function () { return null; }); }
    function poe(rec) { return op('readwrite', function (s) { return s.put(rec); }); }
    function todas() { return op('readonly', function (s) { return s.getAll(); }).catch(function () { return []; }); }
    function conta() { var C = window.UniConta; return (C && C.auth && C.auth.currentUser && C.db) ? C : null; }
    function fsm() { return import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'); }
    function ref(f, C, id) { return f.doc(C.db, 'progress', C.auth.currentUser.uid, 'fotos', id); }
    function sobe(rec) {
      var C = conta(); if (!C) return Promise.resolve(false);
      return fsm().then(function (f) { return f.setDoc(ref(f, C, rec.id), { d: rec.d, m: rec.m }); })
        .then(function () { return poe({ id: rec.id, d: rec.d, m: rec.m, up: 1 }); }).then(function () { return true; }, function () { return false; });
    }
    function sincroniza() {
      if (subindo || !conta()) return Promise.resolve();
      subindo = true;
      return todas().then(function (l) { return l.filter(function (r) { return !r.up; }).reduce(function (p, r) { return p.then(function () { return sobe(r); }); }, Promise.resolve()); })
        .then(function () { subindo = false; }, function () { subindo = false; });
    }
    function baixa(id) {
      var C = conta(); if (!C) return Promise.resolve(null);
      return fsm().then(function (f) { return f.getDoc(ref(f, C, id)); }).then(function (s) { return s.exists() ? s.data().d : null; }).catch(function () { return null; });
    }
    function obter(id) {
      return pega(id).then(function (r) {
        if (r && r.d) return r.d;
        return baixa(id).then(function (d) { if (d) poe({ id: id, d: d, m: Date.now(), up: 1 }).catch(function () {}); return d; });
      });
    }
    function apagar(id) {
      op('readwrite', function (s) { return s.delete(id); }).catch(function () {});
      var C = conta(); if (C) fsm().then(function (f) { return f.deleteDoc(ref(f, C, id)); }).catch(function () {});
    }
    /* reduz a foto (lado maior 1600 px, JPEG) para caber num documento do Firestore (limite de 1 MB) */
    function reduz(arquivo) {
      return new Promise(function (res, rej) {
        var u = URL.createObjectURL(arquivo), im = new Image();
        im.onload = function () {
          URL.revokeObjectURL(u);
          var lado = 1600, q = 0.72, d = '';
          for (var t = 0; t < 8; t++) {
            var s = Math.min(1, lado / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
            var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
            d = c.toDataURL('image/jpeg', q);
            if (d.length <= 750000) return res(d);
            if (q > 0.5) q -= 0.1; else lado = Math.round(lado * 0.8);
          }
          rej(new Error('grande'));
        };
        im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('imagem')); };
        im.src = u;
      });
    }
    function guardar(arquivo) {
      return reduz(arquivo).then(function (d) {
        var rec = { id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), d: d, m: Date.now(), up: 0 };
        return poe(rec).then(function () { sincroniza(); return rec; });
      });
    }
    return { guardar: guardar, obter: obter, apagar: apagar, sincroniza: sincroniza, reduz: reduz };
  })();
  window.UniFotos = Fotos;

  function montar(el, opc) {
    opc = opc || {};
    var C = opc.C || window.UniCaderno, id = null, pags = [], ini = 0, dupla = false, pref = (function () { try { return localStorage.getItem('uniCadernoVista'); } catch (x) { return null; } })(), modo = 'txt', cor = 0, esp = 1, ferr = 'pen',
      hist = [], redo = [], penVisto = 0, ultimoM = 0, tSalva = null, pedeLimpar = false, ro = null;

    el.classList.add('lv'); if (opc.leitura) el.classList.add('leitura');
    el.innerHTML =
      '<div class="lv-bar">' +
      '<div class="lv-modo" role="group" aria-label="Como escrever"><button type="button" data-m="txt" aria-pressed="true">Texto</button><button type="button" data-m="pen" aria-pressed="false">Caneta</button></div>' +
      '<select class="lv-papSel" aria-label="Modelo de papel da página" title="Modelo de papel">' +
      PAPEIS.map(function (p) { return '<option value="' + p.id + '">📄 ' + p.nome + '</option>'; }).join('') + '</select>' +
      '<div class="lv-tcor" role="group" aria-label="Cor da fonte">' +
      CORES.map(function (c, i) { return '<button type="button" data-tc="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Fonte ' + NOMES[i] + '" title="Cor da fonte: ' + NOMES[i] + '"><i style="background:' + c + '"></i></button>'; }).join('') + '</div>' +
      '<button type="button" class="lv-fotoBt" aria-label="Colocar uma foto numa página">📷 Foto</button><input type="file" class="lv-fotoIn" accept="image/*" hidden>' +
      '<button type="button" class="lv-estBt" aria-pressed="false" aria-label="Estudar palavras desta anotação como flashcards" title="Modo estudo / Flashcards">🧠 Estudar</button>' +
      '<button type="button" class="lv-dlBt" data-exp="png" aria-label="Baixar página como imagem PNG" title="Baixar página como imagem PNG">↓ PNG</button>' +
      '<button type="button" class="lv-dlBt" data-exp="pdf" aria-label="Exportar anotação completa como PDF" title="Salvar anotação inteira em PDF">↓ PDF</button>' +
      '<div class="lv-fer" role="toolbar" aria-label="Ferramentas da caneta" hidden>' +
      '<button type="button" data-f="pen" aria-pressed="true" aria-label="Caneta" title="Caneta">' + IC.pen + '</button>' +
      '<button type="button" data-f="mar" aria-pressed="false" aria-label="Marca-texto" title="Marca-texto">' + IC.mar + '</button>' +
      '<button type="button" data-f="bor" aria-pressed="false" aria-label="Borracha: passe sobre o traço para apagar" title="Borracha">' + IC.bor + '</button><span class="lv-sep"></span>' +
      CORES.map(function (c, i) { return '<button type="button" class="cor" data-c="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + NOMES[i] + '" title="' + NOMES[i] + '"><i style="background:' + c + '"></i></button>'; }).join('') + '<span class="lv-sep"></span>' +
      ESP.map(function (w, i) { return '<button type="button" class="esp" data-e="' + i + '" aria-pressed="' + (i === 1) + '" aria-label="Espessura ' + ENOMES[i].toLowerCase() + '" title="' + ENOMES[i] + '"><i style="width:' + (4 + i * 4) + 'px;height:' + (4 + i * 4) + 'px"></i></button>'; }).join('') + '<span class="lv-sep"></span>' +
      '<button type="button" data-f="und" aria-label="Desfazer" title="Desfazer (Ctrl+Z)" disabled>' + IC.und + '</button>' +
      '<button type="button" data-f="red" aria-label="Refazer" title="Refazer (Ctrl+Y)" disabled>' + IC.red + '</button>' +
      '<button type="button" data-f="cl" aria-label="Limpar os desenhos desta página" title="Limpar os desenhos desta página">' + IC.cl + '</button><span class="lv-sep"></span>' +
      '<button type="button" data-f="z-" aria-label="Diminuir zoom" title="Diminuir zoom">−</button>' +
      '<button type="button" class="zm" data-f="z0" aria-label="Restaurar zoom 100%" title="Restaurar zoom">100%</button>' +
      '<button type="button" data-f="z+" aria-label="Aumentar zoom" title="Aumentar zoom">+</button></div>' +
      '</div>' +
      '<div class="lv-est" hidden></div>' +
      '<div class="lv-stage"><div class="lv-livro" aria-live="off"></div></div>' +
      '<div class="lv-rola"><button type="button" data-r="-1" aria-label="Folha de cima" title="Folha de cima">▲</button><button type="button" data-r="1" aria-label="Próxima folha" title="Próxima folha">▼</button></div>' +
      '<div class="lv-nav"><button type="button" data-n="-1" aria-label="Página anterior">' + IC.ant + '</button><span class="lbl" aria-live="polite"></span><button type="button" data-n="1" aria-label="Próxima página">' + IC.prox + '</button><button type="button" class="mais" data-n="mais">+ página</button><button type="button" class="vst" data-n="vista" aria-label="Mudar entre uma página e duas páginas"></button></div>' +
      '<div class="lv-prof" hidden><button type="button" class="lv-pf" aria-pressed="false"></button><span class="lv-pfs" aria-live="polite"></span></div>' +
      '<p class="lv-dica" hidden>Com a caneta em uso, a palma da mão não risca a folha. Para virar a página, use as setas.</p>';
    var fBt = el.querySelector('.lv-fotoBt'), fIn = el.querySelector('.lv-fotoIn'), papSel = el.querySelector('.lv-papSel'),
      tcorBox = el.querySelector('.lv-tcor'),
      dlPng = el.querySelector('[data-exp="png"]'), dlPdf = el.querySelector('[data-exp="pdf"]'),
      estBt = el.querySelector('.lv-estBt'), estBox = el.querySelector('.lv-est');
    papSel.onchange = function () {
      if (!id || !pags[ini]) return;
      var v = papSel.value === 'pautado' ? null : papSel.value;
      pags[ini].pap = v;
      aplicaPapel(pg(ini), v);
      salvaTudo();
    };
    dlPng.onclick = function () { if (!id || !pags[ini]) return; exportarPng(ini); };
    dlPdf.onclick = function () { if (!id || !pags.length) return; exportarPdf(); };
    estBt.onclick = function () { alternarEstudo(); };
    fBt.onclick = function () { if (!id) return; fIn.value = ''; fIn.click(); };
    fIn.onchange = function () {
      var f = fIn.files && fIn.files[0]; if (!f || !id) return;
      fBt.disabled = true; fBt.textContent = 'Salvando a foto…';
      Fotos.guardar(f).then(function (r) { colocaFoto(r.id); }, function () { fBt.textContent = 'Não consegui usar essa foto'; return new Promise(function (ok) { setTimeout(ok, 2500); }); })
        .then(function () { fBt.disabled = false; fBt.textContent = '📷 Foto'; });
    };
    Fotos.sincroniza();
    var stage = el.querySelector('.lv-stage'), livro = el.querySelector('.lv-livro'), barra = el.querySelector('.lv-bar'), fer = el.querySelector('.lv-fer'), nav = el.querySelector('.lv-nav'),
      lbl = nav.querySelector('.lbl'), btUnd = fer.querySelector('[data-f="und"]'), btRed = fer.querySelector('[data-f="red"]'), btZm = fer.querySelector('[data-f="z0"]'), dica = el.querySelector('.lv-dica');
    var zm = 1, panX = 0, panY = 0, emPinch = false;
    function limitaPan() {
      var sw = stage.clientWidth || 1, sh = stage.clientHeight || 1;
      var minX = Math.min(0, sw - sw * zm), minY = Math.min(0, sh - sh * zm);
      panX = Math.max(minX, Math.min(0, panX));
      panY = Math.max(minY, Math.min(0, panY));
    }
    function aplicaZoom() {
      limitaPan();
      livro.style.transform = zm > 1.001 ? ('translate(' + panX.toFixed(1) + 'px,' + panY.toFixed(1) + 'px) scale(' + zm.toFixed(3) + ')') : '';
      el.classList.toggle('zoom', zm > 1.001);
      if (btZm) btZm.textContent = Math.round(zm * 100) + '%';
    }
    function setZoom(novo, cx, cy) {
      var z0 = zm;
      zm = Math.max(1, Math.min(3.5, novo));
      if (zm <= 1.01) { zm = 1; panX = 0; panY = 0; aplicaZoom(); return; }
      var r = stage.getBoundingClientRect();
      var ox = cx != null ? (cx - r.left) : r.width / 2;
      var oy = cy != null ? (cy - r.top) : r.height / 2;
      panX = ox - (ox - panX) * (zm / z0);
      panY = oy - (oy - panY) * (zm / z0);
      aplicaZoom();
    }
    function resetaZoom() { zm = 1; panX = 0; panY = 0; emPinch = false; aplicaZoom(); }

    /* ---------- dados ---------- */
    var corTextoAtiva = 0, pagFoco = 0;
    function nota() { return id ? C.obter(id) : null; }
    function lePags(n) {
      var p = [{ x: n.x || '', h: n.h || '', s: Array.isArray(n.s) ? n.s : [], f: n.f || null, pap: n.pap || null, tc: n.tc || 0 }];
      (Array.isArray(n.pp) ? n.pp : []).forEach(function (q) { p.push({ x: (q && q.x) || '', h: (q && q.h) || '', s: (q && Array.isArray(q.s)) ? q.s : [], f: (q && q.f) || null, pap: (q && q.pap) || null, tc: (q && q.tc) || 0 }); });
      return p;
    }
    function salva(campos) {
      if (!id) return; var n = C.atualizar(id, campos); if (n) ultimoM = n.m;
      if (opc.aoMudar) opc.aoMudar(n);
    }
    function salvaPag(i) { if (i === 0) salva({ x: pags[0].x, h: pags[0].h || '', s: pags[0].s }); else salva({ pp: pags.slice(1).map(pp1) }); }
    function pp1(q) { var o = { x: q.x, s: q.s }; if (q.h) o.h = q.h; if (q.f) o.f = q.f; if (q.pap) o.pap = q.pap; if (q.tc) o.tc = q.tc; return o; }
    function salvaTudo() { salva({ x: pags[0].x, h: pags[0].h || '', s: pags[0].s, f: pags[0].f || null, pap: pags[0].pap || null, tc: pags[0].tc || 0, pp: pags.slice(1).map(pp1) }); }
    function aplicaPapel(d, pap) {
      if (!d) return;
      d.classList.remove('pap-kanji', 'pap-cornell', 'pap-pontilhado', 'pap-branco');
      if (pap && pap !== 'pautado') d.classList.add('pap-' + pap);
    }
    function aplicaCorTexto(d, tc) {
      if (!d) return;
      var tx = d.querySelector('.lv-tx');
      if (tx) tx.style.color = CORES[tc || 0] || CORES[0];
    }
    function syncCorTextoBar(idx) {
      if (!tcorBox) return;
      var cur = idx != null ? idx : corTextoAtiva;
      Array.prototype.forEach.call(tcorBox.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(+b.dataset.tc === cur));
      });
    }
    function normCorHex(col) {
      if (!col) return '';
      var s = String(col).trim().toLowerCase();
      if (/^#[0-9a-f]{6}$/.test(s)) return s;
      var m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (!m) return '';
      var hex = function (v) { var h = Math.max(0, Math.min(255, +v)).toString(16); return h.length < 2 ? '0' + h : h; };
      return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
    }
    function textoDeEl(elTx) {
      return String(elTx.innerText || '').replace(/\r\n/g, '\n').replace(/\n$/, '');
    }
    function sanitizaNo(raiz, exigeCor) {
      var temCor = false;
      var IGNORA = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, NOSCRIPT: 1, TEMPLATE: 1 };
      function andaNo(no, corAtual) {
        if (no.nodeType === 3) return esc(no.nodeValue || '');
        if (no.nodeType !== 1) return '';
        var tag = no.tagName;
        if (IGNORA[tag]) return '';
        if (tag === 'BR') return '<br>';
        var c = normCorHex(no.style && no.style.color) || (tag === 'FONT' ? normCorHex(no.getAttribute('color')) : '');
        if (c && !/^#[0-9a-f]{6}$/.test(c)) c = '';
        var dentro = '';
        for (var k = 0; k < no.childNodes.length; k++) dentro += andaNo(no.childNodes[k], c || corAtual);
        if (tag === 'DIV' || tag === 'P') {
          var prev = no.previousSibling;
          var pref = prev && !(prev.nodeType === 1 && prev.tagName === 'BR') ? '<br>' : '';
          return pref + (c && c !== corAtual ? (temCor = true, '<span style="color:' + c + '">' + dentro + '</span>') : dentro);
        }
        if (c && c !== corAtual) {
          temCor = true;
          return '<span style="color:' + c + '">' + dentro + '</span>';
        }
        return dentro;
      }
      var res = '';
      for (var i = 0; i < raiz.childNodes.length; i++) res += andaNo(raiz.childNodes[i], '');
      return exigeCor ? (temCor ? res : '') : res;
    }
    function sanitizaHtml(elTx) { return sanitizaNo(elTx, true); }
    /* limpa uma string HTML vinda do Firestore/professora/backup num documento inerte (DOMParser),
       permitindo apenas texto escapado, <br> e <span style="color:#rrggbb"> */
    function limpaH(h) {
      if (typeof h !== 'string' || !h) return '';
      if (window.DOMParser) {
        try {
          var doc = new DOMParser().parseFromString(h, 'text/html');
          return doc && doc.body ? sanitizaNo(doc.body, false) : '';
        } catch (e) {}
      }
      return esc(h.replace(/<[^>]*>/g, ''));
    }
    function colocaCursorFim(elTx) {
      elTx.focus();
      try {
        var r = document.createRange(); r.selectNodeContents(elTx); r.collapse(false);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      } catch (e) {}
    }
    function cursorNoInicio(elTx) {
      try {
        var s = window.getSelection(); if (!s || !s.rangeCount || !s.isCollapsed) return false;
        var r = s.getRangeAt(0).cloneRange(); r.selectNodeContents(elTx); r.setEnd(s.anchorNode, s.anchorOffset);
        return r.toString().length === 0;
      } catch (e) { return false; }
    }

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
        if (pg.f) d.classList.add('c-foto');
        aplicaPapel(d, pg.pap);
        d.innerHTML = (pg.f ? '<img class="lv-img" alt="Foto da página ' + (i + 1) + '" hidden><span class="lv-fmsg" hidden></span>' : '') + (i === 0 ? cabecalho(n) : '') +
          '<div class="lv-tx" role="textbox" aria-multiline="true" aria-label="Texto da página ' + (i + 1) + '" data-ph="' + (i === 0 ? 'Escreva aqui…' : '') + '"' + (opc.leitura ? ' contenteditable="false"' : ' contenteditable="true" spellcheck="false"') + '></div>' +
          '<canvas class="lv-cv-bg" aria-hidden="true"></canvas>' +
          '<canvas class="lv-cv-fg" aria-label="Desenho da página ' + (i + 1) + '"></canvas><span class="lv-num" aria-hidden="true">' + (i + 1) + '</span>' +
          (i > 0 ? '<button type="button" class="lv-del" aria-label="Apagar a página ' + (i + 1) + '">apagar página</button>' : '') +
          (pg.f ? '<button type="button" class="lv-rf" aria-label="Tirar a foto da página ' + (i + 1) + '">tirar foto</button>' : '');
        var txEl = d.querySelector('.lv-tx'), hLimpo = limpaH(pg.h);
        if (hLimpo) txEl.innerHTML = hLimpo; else txEl.textContent = pg.x;
        aplicaCorTexto(d, pg.tc);
        livro.appendChild(d);
        liga(d, i);
        if (pg.f) carregaFoto(d, pg.f);
        if (opc.leitura) Array.prototype.forEach.call(d.querySelectorAll('input'), function (x) { x.readOnly = true; x.tabIndex = -1; });
      });
      mostra(); requestAnimationFrame(function () { ajusta(); });
    }
    function carregaFoto(d, fid) {
      var im = d.querySelector('.lv-img'), msg = d.querySelector('.lv-fmsg');
      msg.textContent = 'Carregando a foto…'; msg.hidden = false;
      Fotos.obter(fid).then(function (src) {
        if (src) { im.src = src; im.hidden = false; msg.hidden = true; }
        else msg.textContent = opc.leitura ? 'Foto não disponível aqui.' : 'Esta foto ainda não chegou neste aparelho. Abra o caderno com internet e com login para ela carregar.';
      }, function () { msg.textContent = 'Não consegui abrir a foto.'; });
    }
    function colocaFoto(fid) {
      var i = ini, p = pags[i];
      if (i > 0 && p && !p.x && !p.s.length && !p.f) { p.f = fid; salvaTudo(); constroi(); return; }   /* página em branco: usa ela */
      pags.push({ x: '', s: [], f: fid }); salvaTudo(); constroi(); vaiPara(pags.length - 1);
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
        var emp = el.classList.contains('empilha'), lado = i === v[0] ? '1' : '2';
        p.style.gridColumn = on && dupla ? (emp ? '1' : lado) : ''; p.style.gridRow = on && dupla && emp ? lado : '';
      });
      /* no caderno aberto, a página da direita ainda em branco vira um convite para continuar */
      var fan = livro.querySelector('.lv-fant');
      if (dupla && !opc.leitura && pags.length && ini + 1 >= pags.length) {
        if (!fan) { fan = document.createElement('div'); fan.className = 'lv-pg lv-fant dir'; fan.innerHTML = '<button type="button">+ nova página</button>'; fan.querySelector('button').onclick = function () { maisPagina(true); }; livro.appendChild(fan); }
        var empF = el.classList.contains('empilha'); fan.style.gridColumn = empF ? '1' : '2'; fan.style.gridRow = empF ? '2' : '';
      } else if (fan) fan.remove();
      var ult = Math.min(pags.length, ini + (dupla ? 2 : 1));
      lbl.textContent = (dupla && ult > ini + 1 ? 'páginas ' + (ini + 1) + '–' + ult : 'página ' + (ini + 1)) + ' de ' + pags.length;
      if (papSel && pags[ini]) papSel.value = pags[ini].pap || 'pautado';
      syncCorTextoBar();
      nav.querySelector('[data-n="-1"]').disabled = ini <= 0;
      nav.querySelector('[data-n="1"]').disabled = ini + (dupla ? 2 : 1) >= pags.length;
      if (anim) { livro.classList.remove('vai', 'volta'); void livro.offsetWidth; livro.classList.add(anim > 0 ? 'vai' : 'volta'); }
      desenhaVisiveis();
    }
    function vaiPara(i, foco) {
      i = Math.max(0, Math.min(pags.length - 1, i));
      var alvo = dupla ? i - (i % 2) : i; if (alvo === ini) return;
      resetaZoom();
      var dir = alvo > ini ? 1 : -1; ini = alvo; mostra(dir);
      if (foco) { var t = pg(i).querySelector('.lv-tx'); t.focus(); }
    }
    function anda(d) { vaiPara(ini + d * (dupla ? 2 : 1)); }
    /* ▲ ▼ do modo Caneta: com as folhas uma embaixo da outra, primeiro rola até a outra folha; depois vira a página */
    function rola(d) {
      var v = visiveis().filter(function (i) { return i < pags.length; }), emp = dupla && el.classList.contains('empilha');
      var ver = function (i) { var p = pg(i); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if (emp && v.length > 1) {
        var r2 = pg(v[1]).getBoundingClientRect(), naSegunda = r2.top < window.innerHeight * 0.45;
        if (d > 0 && !naSegunda) return ver(v[1]);
        if (d < 0 && naSegunda) return ver(v[0]);
      }
      var antes = ini; anda(d); if (ini === antes) return;
      var v2 = visiveis().filter(function (i) { return i < pags.length; });
      ver(d < 0 && emp && v2.length > 1 ? v2[1] : v2[0]);
    }
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
        pags[i].x = textoDeEl(t);
        pags[i].h = sanitizaHtml(t);
        salvaPag(i);
      });
      t.addEventListener('paste', function (e) {
        if (opc.leitura) return;
        e.preventDefault();
        var txt = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
        document.execCommand('insertText', false, txt);
      });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && i > 0 && cursorNoInicio(t)) {
          e.preventDefault(); vaiPara(i - 1); var t0 = pg(i - 1).querySelector('.lv-tx'); colocaCursorFim(t0);
        }
      });
      t.addEventListener('focus', function () { pagFoco = i; if (visiveis().indexOf(i) < 0) vaiPara(i); });
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
      var rf = d.querySelector('.lv-rf');
      if (rf) rf.onclick = function () {
        if (!this.dataset.p) { this.dataset.p = '1'; this.textContent = 'tirar mesmo?'; var b = this; setTimeout(function () { b.dataset.p = ''; b.textContent = 'tirar foto'; }, 3000); return; }
        var fid = pags[i].f; pags[i].f = null; salvaTudo(); constroi(); if (fid) Fotos.apagar(fid);
      };
      var del = d.querySelector('.lv-del');
      if (del) del.onclick = function () {
        if (!this.dataset.p) { this.dataset.p = '1'; this.textContent = 'apagar mesmo?'; var b = this; setTimeout(function () { b.dataset.p = ''; b.textContent = 'apagar página'; }, 3000); return; }
        pags.splice(i, 1); salvaTudo(); constroi(); vaiPara(Math.min(i, pags.length - 1));
      };
      caneta(d.querySelector('.lv-cv-fg'), i);
    }

    /* ---------- caneta (duplo canvas + O(1) + marca-texto + redo) ---------- */
    function larg(t, p) {
      var base = (ESP[t.w] || ESP[1]) * (0.55 + 0.9 * (p / 9));
      return t.m ? base * 2.6 : base;
    }
    function pts(t) { var o = [], x = 0, y = 0, d = t.d; for (var i = 0; i < d.length; i += 3) { x = i ? x + d[i] : d[i]; y = i ? y + d[i + 1] : d[i + 1]; o.push([x, y, d[i + 2]]); } return o; }
    function traco(ctx, t, s) {
      var P = pts(t); if (!P.length) return;
      ctx.save();
      ctx.strokeStyle = CORES[t.k] || CORES[0]; ctx.fillStyle = ctx.strokeStyle; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (t.m) ctx.globalAlpha = 0.28;
      if (P.length === 1) { ctx.beginPath(); ctx.arc(P[0][0] * s, P[0][1] * s, larg(t, P[0][2]) * s / 2, 0, 6.2832); ctx.fill(); ctx.restore(); return; }
      if (t.m) {
        /* marca-texto contínuo em um único path para não acumular opacidade entre segmentos */
        ctx.lineWidth = larg(t, 5) * s;
        ctx.beginPath(); ctx.moveTo(P[0][0] * s, P[0][1] * s);
        for (var j = 1; j < P.length; j++) {
          var pa = P[j - 1], pb = P[j], pm = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
          ctx.quadraticCurveTo(pa[0] * s, pa[1] * s, pm[0] * s, pm[1] * s);
        }
        ctx.lineTo(P[P.length - 1][0] * s, P[P.length - 1][1] * s);
        ctx.stroke(); ctx.restore(); return;
      }
      for (var i = 1; i < P.length; i++) {
        var a = P[i - 1], b = P[i], m0 = i === 1 ? a : [(P[i - 2][0] + a[0]) / 2, (P[i - 2][1] + a[1]) / 2], m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        ctx.lineWidth = larg(t, b[2]) * s; ctx.beginPath(); ctx.moveTo(m0[0] * s, m0[1] * s); ctx.quadraticCurveTo(a[0] * s, a[1] * s, m1[0] * s, m1[1] * s); ctx.stroke();
      }
      ctx.restore();
    }
    function syncCanvas(c) {
      var r = c.getBoundingClientRect(); if (!r.width) return 0;
      var dpr = Math.min(window.devicePixelRatio || 1, 3), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      return c.width / W;
    }
    function desenha(i) {
      { var pe0 = pg(i); if (pe0 && pags[i] && pags[i].s && pags[i].s.length) pe0.classList.add('tocou'); }
      var p = pg(i); if (!p || p.classList.contains('fora')) return;
      var cBg = p.querySelector('.lv-cv-bg'), cFg = p.querySelector('.lv-cv-fg');
      var s = syncCanvas(cBg); if (!s) return;
      syncCanvas(cFg);
      var ctx = cBg.getContext('2d'); ctx.clearRect(0, 0, cBg.width, cBg.height);
      pags[i].s.forEach(function (t) { traco(ctx, t, s); });
      var ctxFg = cFg.getContext('2d'); ctxFg.clearRect(0, 0, cFg.width, cFg.height);
    }
    function desenhaAtivo(i, atual) {
      var p = pg(i); if (!p || p.classList.contains('fora')) return;
      var cFg = p.querySelector('.lv-cv-fg'), s = syncCanvas(cFg); if (!s) return;
      var ctx = cFg.getContext('2d'); ctx.clearRect(0, 0, cFg.width, cFg.height);
      if (atual) traco(ctx, atual, s);
    }
    function commitTraco(i, t) {
      var p = pg(i); if (!p || p.classList.contains('fora')) return;
      var cBg = p.querySelector('.lv-cv-bg'), cFg = p.querySelector('.lv-cv-fg');
      var s = syncCanvas(cBg);
      if (s) traco(cBg.getContext('2d'), t, s);
      if (cFg.width) cFg.getContext('2d').clearRect(0, 0, cFg.width, cFg.height);
    }
    function desenhaVisiveis() { visiveis().forEach(function (i) { if (i < pags.length) desenha(i); }); }
    function atualizaHistBts() { btUnd.disabled = !hist.length; btRed.disabled = !redo.length; }
    function guardaHist(i) { hist.push({ i: i, s: JSON.stringify(pags[i].s) }); if (hist.length > 40) hist.shift(); redo = []; atualizaHistBts(); }
    function desfazer() {
      if (!hist.length) return;
      var h = hist.pop();
      if (h.i < pags.length) {
        redo.push({ i: h.i, s: JSON.stringify(pags[h.i].s) });
        pags[h.i].s = JSON.parse(h.s); salvaPag(h.i); vaiPara(h.i); desenha(h.i);
      }
      atualizaHistBts();
    }
    function refazer() {
      if (!redo.length) return;
      var h = redo.pop();
      if (h.i < pags.length) {
        hist.push({ i: h.i, s: JSON.stringify(pags[h.i].s) });
        pags[h.i].s = JSON.parse(h.s); salvaPag(h.i); vaiPara(h.i); desenha(h.i);
      }
      atualizaHistBts();
    }
    function renderPaginaCanvas(i) {
      var p = pags[i], n = nota(), dEl = pg(i); if (!p || !n) return null;
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      /* desenha papel de fundo */
      var pap = p.pap || 'pautado';
      if (!p.f) {
        if (pap === 'pautado' || pap === 'cornell') {
          ctx.strokeStyle = '#ecdadd'; ctx.lineWidth = 3;
          for (var y = 360; y < H - 140; y += 92) { ctx.beginPath(); ctx.moveTo(120, y); ctx.lineTo(W - 120, y); ctx.stroke(); }
          if (pap === 'cornell') {
            ctx.strokeStyle = '#e8bcc5'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(Math.round(W * 0.36), 280); ctx.lineTo(Math.round(W * 0.36), H - 140); ctx.stroke();
          }
        } else if (pap === 'kanji') {
          var step = 160; ctx.strokeStyle = '#e5cfd4'; ctx.lineWidth = 2.5;
          for (var xk = 120; xk <= W - 120; xk += step) { ctx.beginPath(); ctx.moveTo(xk, 280); ctx.lineTo(xk, H - 160); ctx.stroke(); }
          for (var yk = 280; yk <= H - 160; yk += step) { ctx.beginPath(); ctx.moveTo(120, yk); ctx.lineTo(W - 120, yk); ctx.stroke(); }
        } else if (pap === 'pontilhado') {
          ctx.fillStyle = '#d8c1c7';
          for (var xp = 140; xp < W - 120; xp += 72) for (var yp = 280; yp < H - 140; yp += 72) { ctx.beginPath(); ctx.arc(xp, yp, 3.5, 0, 6.2832); ctx.fill(); }
        }
      }
      var imEl = dEl && dEl.querySelector('.lv-img');
      if (p.f && imEl && imEl.complete && imEl.naturalWidth) {
        var sc = Math.min(W / imEl.naturalWidth, H / imEl.naturalHeight);
        var dw = imEl.naturalWidth * sc, dh = imEl.naturalHeight * sc;
        ctx.drawImage(imEl, (W - dw) / 2, (H - dh) / 2, dw, dh);
      }
      /* título e texto */
      ctx.fillStyle = '#3a2b38';
      var ty = 170;
      if (i === 0 && n.t) {
        ctx.font = '800 64px "Baloo 2", system-ui, sans-serif';
        ctx.fillText(n.t.slice(0, 50), 140, ty);
        ty += 110;
      }
      if (p.x || p.h) {
        ctx.font = '500 44px "Zen Maru Gothic", system-ui, sans-serif';
        var baseCor = CORES[p.tc || 0] || CORES[0];
        var hLimpo = limpaH(p.h);
        if (hLimpo && window.DOMParser) {
          var docTmp = new DOMParser().parseFromString(hLimpo, 'text/html');
          var tmp = docTmp && docTmp.body;
          var cx = 140;
          function desenhaNo(no, corAtual) {
            if (ty >= H - 140) return;
            if (no.nodeType === 3) {
              var partes = String(no.nodeValue || '').split('\n');
              partes.forEach(function (pt, idx) {
                if (idx > 0) { cx = 140; ty += 76; }
                if (!pt || ty >= H - 140) return;
                ctx.fillStyle = corAtual || baseCor;
                ctx.fillText(pt, cx, ty);
                cx += ctx.measureText(pt).width;
                if (cx > W - 160) { cx = 140; ty += 76; }
              });
              return;
            }
            if (no.nodeType !== 1) return;
            if (no.tagName === 'BR') { cx = 140; ty += 76; return; }
            var c = normCorHex(no.style && no.style.color) || corAtual;
            for (var k = 0; k < no.childNodes.length; k++) desenhaNo(no.childNodes[k], c);
          }
          if (tmp) for (var j = 0; j < tmp.childNodes.length; j++) desenhaNo(tmp.childNodes[j], baseCor);
        } else {
          ctx.fillStyle = baseCor;
          var linhas = p.x.split('\n');
          linhas.forEach(function (ln) {
            if (ty < H - 140) { ctx.fillText(ln, 140, ty, W - 280); ty += 76; }
          });
        }
      }
      /* traços da caneta */
      p.s.forEach(function (t) { traco(ctx, t, 1); });
      return c;
    }
    function exportarPng(i) {
      var c = renderPaginaCanvas(i); if (!c) return;
      c.toBlob(function (bl) {
        if (!bl) return;
        var a = document.createElement('a'); a.href = URL.createObjectURL(bl);
        a.download = 'caderno-pagina-' + (i + 1) + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      });
    }
    function exportarPdf() {
      var n = nota(); if (!n || !pags.length) return;
      var imgs = [];
      for (var i = 0; i < pags.length; i++) {
        var c = renderPaginaCanvas(i);
        if (c) imgs.push(c.toDataURL('image/png'));
      }
      if (!imgs.length) return;
      var w = window.open('', '_blank');
      if (!w) { window.print(); return; }
      var tit = esc((n.t || 'Caderno de Unir Versos').trim());
      w.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' + tit + '</title><style>@page{size:A4 portrait;margin:0}body{margin:0;background:#fff}img{display:block;width:100vw;height:auto;page-break-after:always;break-after:page}img:last-child{page-break-after:auto;break-after:auto}</style></head><body>' +
        imgs.map(function (src, idx) { return '<img src="' + src + '" alt="Página ' + (idx + 1) + '">'; }).join('') +
        '<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script></body></html>');
      w.document.close();
    }

    /* ---------- modo estudo / flashcards automáticos ---------- */
    var estudoOn = false, filaEst = [], totalEst = 0, acertosEst = 0, reveladoEst = false;
    function extrairCartoes() {
      var out = [];
      pags.forEach(function (pg) {
        String(pg.x || '').split('\n').forEach(function (ln) {
          var t = ln.trim(); if (!t) return;
          var m = t.match(/^(.+?)\s*(?:—|–|\s-\s|:\s+|=\s+)\s*(.+)$/);
          if (m && m[1].trim() && m[2].trim()) out.push({ f: m[1].trim(), v: m[2].trim() });
        });
      });
      return out;
    }
    function falarJaEst(txt) {
      if (window.UniDic && window.UniDic.falar) { window.UniDic.falar(txt); return; }
      if (!txt || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(txt)); u.lang = 'ja-JP'; u.rate = 0.92;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
    function textoFala(frente) {
      var m = frente.match(/\(([^·)]+)/);
      return m ? m[1].trim() : frente.replace(/\([^)]*\)/g, '').trim();
    }
    function pintaEstudo() {
      if (!estudoOn) { estBox.hidden = true; stage.hidden = false; nav.hidden = false; return; }
      estBox.hidden = false; stage.hidden = true; nav.hidden = true;
      if (!totalEst) {
        estBox.innerHTML = '<div class="lv-est-h"><b>🧠 Modo Estudo</b><button type="button" class="lv-estBt" data-es="fechar">Voltar ao caderno</button></div>' +
          '<p class="lv-card-d">Para gerar flashcards automáticos, escreva linhas no formato <b>termo — tradução</b> (ou use o botão <b>+ Salvar no caderno</b> do Dicionário!).</p>';
        return;
      }
      if (!filaEst.length) {
        estBox.innerHTML = '<div class="lv-est-h"><b>🧠 Revisão concluída!</b><button type="button" class="lv-estBt" data-es="fechar">Voltar ao caderno</button></div>' +
          '<div class="lv-card"><div class="lv-card-f">✨ ' + acertosEst + ' de ' + totalEst + ' dominados!</div><div class="lv-card-d">Você revisou todos os cartões desta anotação.</div></div>' +
          '<div class="lv-est-acts"><button type="button" class="ok" data-es="reiniciar">Estudar novamente</button><button type="button" data-es="fechar">Voltar ao caderno</button></div>';
        return;
      }
      var cur = filaEst[0], temVoz = !!window.speechSynthesis;
      estBox.innerHTML = '<div class="lv-est-h"><b>🧠 Modo Estudo</b><span class="lv-est-prg">Restam ' + filaEst.length + ' · ✓ ' + acertosEst + '/' + totalEst + '</span><button type="button" class="lv-estBt" data-es="fechar">Voltar ao caderno</button></div>' +
        '<div class="lv-card" data-es="virar" role="button" tabindex="0" aria-label="Toque para revelar a tradução">' +
        '<div class="lv-card-f">' + esc(cur.f) + '</div>' +
        (reveladoEst ? '<div class="lv-card-v">' + esc(cur.v) + '</div>' : '<div class="lv-card-d">Toque no cartão para revelar a tradução</div>') +
        '</div>' +
        '<div class="lv-est-acts">' +
        (temVoz ? '<button type="button" data-es="ouvir">🔊 Ouvir</button>' : '') +
        (reveladoEst ? '<button type="button" class="rv" data-es="revisar">↺ Revisar de novo</button><button type="button" class="ok" data-es="acertei">✓ Sei essa</button>' : '<button type="button" class="ok" data-es="virar">Revelar tradução</button>') +
        '</div>';
    }
    function alternarEstudo(forca) {
      estudoOn = forca != null ? !!forca : !estudoOn;
      estBt.setAttribute('aria-pressed', String(estudoOn));
      if (estudoOn) {
        filaEst = extrairCartoes(); totalEst = filaEst.length; acertosEst = 0; reveladoEst = false;
      }
      pintaEstudo();
    }
    estBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-es]'); if (!b) return;
      var a = b.dataset.es;
      if (a === 'fechar') alternarEstudo(false);
      else if (a === 'reiniciar') alternarEstudo(true);
      else if (a === 'virar') { if (!reveladoEst) { reveladoEst = true; pintaEstudo(); } }
      else if (a === 'ouvir' && filaEst[0]) falarJaEst(textoFala(filaEst[0].f));
      else if (a === 'acertei' && filaEst.length) { filaEst.shift(); acertosEst++; reveladoEst = false; pintaEstudo(); }
      else if (a === 'revisar' && filaEst.length) { var item = filaEst.shift(); filaEst.push(item); reveladoEst = false; pintaEstudo(); }
    });
    function caneta(c, i) {
      var atual = null, lx = 0, ly = 0, apagando = false, borrou = false;
      function pos(e) { var r = c.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]; }
      function adiciona(e) {
        var p = pos(e), pr = e.pointerType === 'pen' ? Math.max(1, Math.round((e.pressure || .5) * 9)) : 5, d = atual.d;
        if (d.length) {
          if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < 3) return false;
          d.push(p[0] - lx, p[1] - ly, pr);
        } else {
          d.push(p[0], p[1], pr);
        }
        lx = p[0]; ly = p[1];
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
        if (modo !== 'pen' || emPinch) return;
        if (e.pointerType === 'pen') penVisto = Date.now();
        if (e.pointerType === 'touch' && Date.now() - penVisto < 4000) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (x) {}
        { var pgEl = pg(i); if (pgEl) pgEl.classList.add('tocou'); }
        /* borracha: ferramenta escolhida, ponta de borracha (32) ou o botão lateral da caneta apertado (2, ex.: S Pen) */
        if (ferr === 'bor' || (e.pointerType === 'pen' && (e.buttons & 34))) { apagando = true; borrou = false; apaga(e); return; }
        atual = ferr === 'mar' ? { k: cor, w: esp, m: 1, d: [] } : { k: cor, w: esp, d: [] };
        adiciona(e); desenhaAtivo(i, atual);
      });
      c.addEventListener('pointermove', function (e) {
        if (emPinch) { if (atual) { atual = null; desenhaAtivo(i, null); } return; }
        if (e.pointerType === 'pen') penVisto = Date.now();
        if (!apagando && atual && e.pointerType === 'pen' && (e.buttons & 34)) { /* apertou o botão no meio do traço: guarda o traço e passa a apagar */
          if (atual.d.length) { guardaHist(i); pags[i].s = pags[i].s.concat([atual]); commitTraco(i, atual); } atual = null; salvaPag(i); apagando = true; borrou = false; }
        if (apagando) { var ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev.length) ev = [e]; ev.forEach(apaga); return; }
        if (!atual) return; e.preventDefault();
        var ev2 = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev2.length) ev2 = [e];
        var novo = false; ev2.forEach(function (x) { if (adiciona(x)) novo = true; }); if (novo) desenhaAtivo(i, atual);
      });
      function fim() {
        if (apagando) { apagando = false; if (borrou) salvaPag(i); borrou = false; return; }
        if (!atual) return;
        if (atual.d.length) { guardaHist(i); pags[i].s = pags[i].s.concat([atual]); commitTraco(i, atual); }
        else desenhaAtivo(i, null);
        atual = null; salvaPag(i);
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
      if (m !== 'pen') resetaZoom();
      if (m === 'pen' && document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }
    /* impede perder a seleção de texto ao clicar numa cor da fonte */
    if (tcorBox) tcorBox.addEventListener('mousedown', function (e) { e.preventDefault(); });
    barra.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.m) { setModo(b.dataset.m); return; }
      if (b.dataset.tc != null) {
        if (!id || !pags.length) return;
        var idx = +b.dataset.tc, corHex = CORES[idx] || CORES[0];
        corTextoAtiva = idx;
        syncCorTextoBar(idx);
        var alvoI = (pagFoco >= 0 && pagFoco < pags.length && visiveis().indexOf(pagFoco) >= 0) ? pagFoco : ini;
        var tx = pg(alvoI) && pg(alvoI).querySelector('.lv-tx');
        if (!tx) return;
        var sel = window.getSelection && window.getSelection();
        var dentro = sel && sel.rangeCount && tx.contains(sel.anchorNode);
        if (!dentro) colocaCursorFim(tx);
        try { document.execCommand('styleWithCSS', false, true); } catch (x) {}
        try { document.execCommand('foreColor', false, corHex); } catch (x) {}
        pags[alvoI].x = textoDeEl(tx);
        pags[alvoI].h = sanitizaHtml(tx);
        salvaPag(alvoI);
        return;
      }
      if (b.dataset.c != null) { cor = +b.dataset.c; if (ferr === 'bor') { ferr = 'pen'; pressiona('[data-f="pen"],[data-f="mar"],[data-f="bor"]', 'data-f', 'pen'); el.classList.remove('borracha'); } pressiona('.cor', 'data-c', cor); return; }
      if (b.dataset.e != null) { esp = +b.dataset.e; pressiona('.esp', 'data-e', esp); return; }
      var f = b.dataset.f;
      if (f === 'pen' || f === 'mar' || f === 'bor') { ferr = f; pressiona('[data-f="pen"],[data-f="mar"],[data-f="bor"]', 'data-f', f); el.classList.toggle('borracha', f === 'bor'); }
      if (f === 'und') desfazer();
      if (f === 'red') refazer();
      if (f === 'z+') setZoom(zm + 0.35);
      if (f === 'z-') setZoom(zm - 0.35);
      if (f === 'z0') resetaZoom();
      if (f === 'cl') {
        var alvo = visiveis().filter(function (i) { return i < pags.length && pags[i].s.length; });
        if (!alvo.length) return;
        if (!pedeLimpar) { pedeLimpar = true; b.setAttribute('aria-label', 'Limpar mesmo? Toque de novo'); b.style.borderColor = '#c23f5e'; setTimeout(function () { pedeLimpar = false; b.setAttribute('aria-label', 'Limpar os desenhos desta página'); b.style.borderColor = ''; }, 3000); return; }
        pedeLimpar = false; b.style.borderColor = '';
        alvo.forEach(function (i) { guardaHist(i); pags[i].s = []; salvaPag(i); desenha(i); });
      }
    });
    /* pinch-to-zoom + pan com 2 dedos no modo Caneta, e Ctrl+Scroll no desktop */
    var pDist = 0, pMidX = 0, pMidY = 0;
    stage.addEventListener('touchstart', function (e) {
      if (modo === 'pen' && e.touches.length === 2) {
        emPinch = true;
        var a = e.touches[0], b = e.touches[1];
        pDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) || 1;
        pMidX = (a.clientX + b.clientX) / 2; pMidY = (a.clientY + b.clientY) / 2;
      }
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (!emPinch || e.touches.length !== 2) return;
      e.preventDefault();
      var a = e.touches[0], b = e.touches[1];
      var d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) || 1;
      var mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      panX += mx - pMidX; panY += my - pMidY;
      setZoom(zm * (d / pDist), mx, my);
      pDist = d; pMidX = mx; pMidY = my;
    }, { passive: false });
    stage.addEventListener('touchend', function (e) {
      if (emPinch && e.touches.length < 2) setTimeout(function () { emPinch = false; }, 120);
    }, { passive: true });
    stage.addEventListener('wheel', function (e) {
      if (modo !== 'pen' || !e.ctrlKey) return;
      e.preventDefault();
      setZoom(zm * (e.deltaY < 0 ? 1.12 : 0.89), e.clientX, e.clientY);
    }, { passive: false });
    el.querySelector('.lv-rola').addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (b) rola(+b.dataset.r); });
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.n === 'mais') maisPagina(true); else if (b.dataset.n === 'vista') { pref = dupla ? '1' : '2'; try { localStorage.setItem('uniCadernoVista', pref); } catch (x) {} ajusta(); } else anda(+b.dataset.n);
    });
    /* arrastar para o lado (no modo Texto) e setas do teclado */
    var x0 = null, y0 = null;
    livro.addEventListener('touchstart', function (e) { if (modo === 'pen' || e.touches.length !== 1) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    livro.addEventListener('touchend', function (e) {
      if (x0 == null) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) anda(dx < 0 ? 1 : -1);
    }, { passive: true });
    el.addEventListener('keydown', function (e) {
      if (modo === 'pen' && (e.ctrlKey || e.metaKey)) {
        var k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); desfazer(); return; }
        if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); refazer(); return; }
      }
      var tg = e.target, campo = tg && (tg.tagName === 'TEXTAREA' || tg.tagName === 'INPUT' || tg.isContentEditable);
      if (campo && !(e.altKey)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); anda(1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); anda(-1); }
    });

    /* ---------- tamanho ---------- */
    function ajusta() {
      var w = el.clientWidth, d = pref === '2' ? true : pref === '1' ? false : (w >= 760);
      var vb = nav.querySelector('.vst'); if (vb) { vb.innerHTML = d ? '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4.500" y="2.500" width="11" height="15" rx="1.500"/></svg>1 pág.' : '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1.500" y="3.500" width="7.500" height="13" rx="1.200"/><rect x="11" y="3.500" width="7.500" height="13" rx="1.200"/></svg>2 pág.'; vb.title = d ? 'Ver uma página por vez' : 'Ver duas páginas lado a lado'; }
      /* 1% da largura da folha, em px (no lugar de unidades de container: elas deixavam cada tecla lenta, ~1 s) */
      var emp = d && w < 560, mudouEmp = emp !== el.classList.contains('empilha'); el.classList.toggle('empilha', emp);
      if (w) el.style.setProperty('--u', ((d && !emp ? w / 2 : w) / 100).toFixed(3) + 'px');
      if (d !== dupla) { dupla = d; el.classList.toggle('dupla', d); ini = dupla ? ini - (ini % 2) : ini; mostra(); } else if (mudouEmp) mostra();
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
        if (estudoOn) alternarEstudo(false);
        var n = C.obter(novoId); if (!n) { id = null; pags = []; livro.innerHTML = ''; lbl.textContent = ''; cxProf.hidden = true; resetaZoom(); return; }
        var mesmo = novoId === id; id = novoId; ultimoM = n.m || 0; pags = lePags(n); hist = []; redo = []; atualizaHistBts();
        if (!(mesmo && manter)) { ini = 0; resetaZoom(); } ini = Math.min(ini, pags.length - 1); if (dupla) ini -= ini % 2;
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
