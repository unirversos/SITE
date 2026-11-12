/* Unirversos · caneta do Caderno (tablet com stylus, dedo ou mouse)
   UniCaneta.montar(elemento, { aoMudar(traços) }) → { carregar(traços), traços(), destruir() }
   Cada traço: { k: cor (0-3), w: espessura (0-2), d: [x0,y0,p0, dx,dy,p, ...] } em uma folha lógica de 2000 x 1400.
   Pressão p de 0 a 9. Com a caneta em uso, o toque da palma da mão é ignorado. */
(function () {
  if (window.UniCaneta) return;
  var W = 2000, H = 1400, CORES = ['#3a2b38', '#c23f5e', '#517158', '#4f46a5'], NOMES = ['Tinta escura', 'Rosa', 'Verde', 'Roxo'], ESP = [5, 9, 16], ENOMES = ['Fina', 'Média', 'Grossa'];

  var css = document.createElement('style');
  css.textContent =
    '.ucn{display:grid;gap:8px}.ucn-b{display:flex;flex-wrap:wrap;align-items:center;gap:6px}' +
    '.ucn-b button{font:inherit;cursor:pointer;display:inline-grid;place-items:center;min-width:38px;height:38px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:12px;padding:0 8px;font-size:13px;font-weight:700}' +
    '.ucn-b button[aria-pressed="true"]{border-color:#c23f5e;background:#fdf1f4}.ucn-b button:disabled{opacity:.4;cursor:default}' +
    '.ucn-b button:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    '.ucn-b svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}' +
    '.ucn-b .cor{width:30px;min-width:30px;height:30px;border-radius:50%;padding:0;border-width:2px}.ucn-b .cor i{display:block;width:16px;height:16px;border-radius:50%}' +
    '.ucn-b .esp i{display:block;border-radius:50%;background:#3a2b38}' +
    '.ucn-b .sep{width:1px;height:24px;background:#ecdadd;margin:0 2px}' +
    '.ucn-f{position:relative;width:100%;aspect-ratio:2000/1400;border:1.5px solid #ecdadd;border-radius:14px;overflow:hidden;background:#fff;background-image:radial-gradient(#ecdadd 1.2px,transparent 1.3px);background-size:5% 7.1429%}' +
    '.ucn-f canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;display:block}' +
    '.ucn-f.bor canvas{cursor:cell}.ucn-d{font-size:12px;color:#705f6c;margin:0}';
  document.head.appendChild(css);

  var IC = {
    pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>',
    bor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20h11M5.5 14.5l8-8a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8l-2.5-2.5a2 2 0 0 1 0-2z"/></svg>',
    und: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 0 10h-3"/></svg>',
    cl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/></svg>'
  };

  function montar(el, opc) {
    opc = opc || {};
    var borrou = false, tr = [], hist = [], cor = 0, esp = 1, modo = 'pen', canvas, ctx, dpr = 1, atual = null, penVisto = 0, apagando = false, pedeLimpar = false, ro = null;

    el.classList.add('ucn');
    el.innerHTML =
      '<div class="ucn-b" role="toolbar" aria-label="Ferramentas da caneta">' +
      '<button type="button" data-f="pen" aria-pressed="true" aria-label="Caneta" title="Caneta">' + IC.pen + '</button>' +
      '<button type="button" data-f="bor" aria-pressed="false" aria-label="Borracha: passe sobre o traço para apagar" title="Borracha">' + IC.bor + '</button><span class="sep"></span>' +
      CORES.map(function (c, i) { return '<button type="button" class="cor" data-c="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + NOMES[i] + '" title="' + NOMES[i] + '"><i style="background:' + c + '"></i></button>'; }).join('') + '<span class="sep"></span>' +
      ESP.map(function (w, i) { return '<button type="button" class="esp" data-e="' + i + '" aria-pressed="' + (i === 1) + '" aria-label="Espessura ' + ENOMES[i].toLowerCase() + '" title="' + ENOMES[i] + '"><i style="width:' + (4 + i * 4) + 'px;height:' + (4 + i * 4) + 'px"></i></button>'; }).join('') + '<span class="sep"></span>' +
      '<button type="button" data-f="und" aria-label="Desfazer" title="Desfazer">' + IC.und + '</button>' +
      '<button type="button" data-f="cl" aria-label="Limpar a folha" title="Limpar a folha">' + IC.cl + '</button>' +
      '<button type="button" data-f="dl" aria-label="Baixar como imagem" title="Baixar como imagem">' + IC.dl + '</button></div>' +
      '<div class="ucn-f"><canvas aria-label="Folha para escrever à mão"></canvas></div>' +
      '<p class="ucn-d">Escreva com a caneta do tablet, o dedo ou o mouse. Com a caneta em uso, a palma da mão não risca a folha.</p>';
    canvas = el.querySelector('canvas'); ctx = canvas.getContext('2d');
    var barra = el.querySelector('.ucn-b'), folha = el.querySelector('.ucn-f'), btUnd = barra.querySelector('[data-f="und"]');

    function mudou() { btUnd.disabled = !hist.length; if (opc.aoMudar) opc.aoMudar(tr); }
    function salvaHist() { hist.push(JSON.stringify(tr)); if (hist.length > 30) hist.shift(); }

    function ajusta() {
      var r = canvas.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); desenhaTudo();
    }
    function larg(t, p) { return ESP[t.w] * (0.55 + 0.9 * (p / 9)); }
    function pts(t) { var o = [], x = 0, y = 0, d = t.d; for (var i = 0; i < d.length; i += 3) { x = i ? x + d[i] : d[i]; y = i ? y + d[i + 1] : d[i + 1]; o.push([x, y, d[i + 2]]); } return o; }
    function traco(t) {
      var P = pts(t), s = canvas.width / W; ctx.strokeStyle = CORES[t.k] || CORES[0]; ctx.fillStyle = ctx.strokeStyle; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (P.length === 1) { ctx.beginPath(); ctx.arc(P[0][0] * s, P[0][1] * s, larg(t, P[0][2]) * s / 2, 0, 6.2832); ctx.fill(); return; }
      for (var i = 1; i < P.length; i++) {
        var a = P[i - 1], b = P[i], m0 = i === 1 ? a : [(P[i - 2][0] + a[0]) / 2, (P[i - 2][1] + a[1]) / 2], m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        ctx.lineWidth = larg(t, b[2]) * s; ctx.beginPath(); ctx.moveTo(m0[0] * s, m0[1] * s); ctx.quadraticCurveTo(a[0] * s, a[1] * s, m1[0] * s, m1[1] * s); ctx.stroke();
      }
    }
    function desenhaTudo() { ctx.clearRect(0, 0, canvas.width, canvas.height); tr.forEach(traco); if (atual) traco(atual); }

    function pos(e) { var r = canvas.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]; }
    function adiciona(e) {
      var p = pos(e), pr = e.pointerType === 'pen' ? Math.max(1, Math.round((e.pressure || .5) * 9)) : 5, d = atual.d, n = d.length;
      if (n) { var lx = 0, ly = 0; for (var i = 0; i < n; i += 3) { lx = i ? lx + d[i] : d[i]; ly = i ? ly + d[i + 1] : d[i + 1]; } if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < 3) return false; d.push(p[0] - lx, p[1] - ly, pr); }
      else d.push(p[0], p[1], pr);
      return true;
    }
    function apaga(e) {
      var p = pos(e), r = 36;
      var resto = tr.filter(function (t) { return !pts(t).some(function (q) { return Math.abs(q[0] - p[0]) < r && Math.abs(q[1] - p[1]) < r; }); });
      if (resto.length === tr.length) return;
      if (!borrou) { salvaHist(); borrou = true; }
      tr = resto; desenhaTudo();
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'pen') penVisto = Date.now();
      if (e.pointerType === 'touch' && Date.now() - penVisto < 4000) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      var borr = modo === 'bor' || (e.pointerType === 'pen' && (e.buttons & 32));
      if (borr) { apagando = true; borrou = false; apaga(e); return; }
      atual = { k: cor, w: esp, d: [] }; adiciona(e); desenhaTudo();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'pen') penVisto = Date.now();
      if (apagando) { var ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev.length) ev = [e]; ev.forEach(apaga); return; }
      if (!atual) return; e.preventDefault();
      var ev2 = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!ev2.length) ev2 = [e];
      var novo = false; ev2.forEach(function (x) { if (adiciona(x)) novo = true; }); if (novo) desenhaTudo();
    });
    function fim() {
      if (apagando) { apagando = false; if (borrou) mudou(); borrou = false; return; }
      if (!atual) return; if (atual.d.length) { salvaHist(); tr.push(atual); } atual = null; desenhaTudo(); mudou();
    }
    canvas.addEventListener('pointerup', fim); canvas.addEventListener('pointercancel', fim); canvas.addEventListener('lostpointercapture', function () { if (atual) fim(); });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function pressiona(sel, atr, valor) { Array.prototype.forEach.call(barra.querySelectorAll(sel), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(atr) === String(valor))); }); }
    barra.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.c != null) { cor = +b.dataset.c; modo = 'pen'; pressiona('.cor', 'data-c', cor); pressiona('[data-f="pen"],[data-f="bor"]', 'data-f', 'pen'); folha.classList.remove('bor'); return; }
      if (b.dataset.e != null) { esp = +b.dataset.e; pressiona('.esp', 'data-e', esp); return; }
      var f = b.dataset.f;
      if (f === 'pen' || f === 'bor') { modo = f; pressiona('[data-f="pen"],[data-f="bor"]', 'data-f', f); folha.classList.toggle('bor', f === 'bor'); }
      if (f === 'und' && hist.length) { tr = JSON.parse(hist.pop()); desenhaTudo(); mudou(); }
      if (f === 'cl') {
        if (!tr.length) return;
        if (!pedeLimpar) { pedeLimpar = true; b.setAttribute('aria-label', 'Limpar mesmo? Toque de novo'); b.style.borderColor = '#c23f5e'; setTimeout(function () { pedeLimpar = false; b.setAttribute('aria-label', 'Limpar a folha'); b.style.borderColor = ''; }, 3000); return; }
        pedeLimpar = false; b.style.borderColor = ''; salvaHist(); tr = []; desenhaTudo(); mudou();
      }
      if (f === 'dl') {
        var c2 = document.createElement('canvas'); c2.width = W; c2.height = H; var c = c2.getContext('2d');
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        var oc = canvas, octx = ctx; ctx = c; canvas = c2; tr.forEach(traco); ctx = octx; canvas = oc;
        c2.toBlob(function (bl) { var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'caderno-desenho.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); });
      }
    });

    if (window.ResizeObserver) { ro = new ResizeObserver(function () { ajusta(); }); ro.observe(canvas); } else window.addEventListener('resize', ajusta);
    ajusta(); btUnd.disabled = true;

    return {
      carregar: function (t) { tr = Array.isArray(t) ? JSON.parse(JSON.stringify(t)) : []; hist = []; atual = null; btUnd.disabled = true; ajusta(); desenhaTudo(); },
      tracos: function () { return tr; },
      reajustar: ajusta,
      destruir: function () { if (ro) ro.disconnect(); el.innerHTML = ''; }
    };
  }
  window.UniCaneta = { montar: montar };
})();
