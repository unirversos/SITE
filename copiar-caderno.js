/* Unirversos · "Adicionar no caderno?": ao copiar um trecho de qualquer página, aparece um aviso pequeno.
   Se a pessoa aceitar, o trecho vira uma anotação nova no Caderno (com o nome da página de onde veio).
   Não aparece ao copiar dentro de campos de texto nem dentro do próprio Caderno. */
(function () {
  if (window.top !== window || window.UniCopiarCaderno) return; window.UniCopiarCaderno = true;
  /* só nas páginas de idiomas (na Travessia e nos Tesouros copiar costuma ser endereço, preço, e-mail) */
  if (location.pathname.indexOf('/idiomas/') !== 0 || location.pathname.indexOf('/idiomas/caderno/') === 0 || location.pathname.indexOf('/idiomas/aula-zero') === 0) return;
  var OFF = 'uniCopiarCadernoOff';
  try { if (localStorage.getItem(OFF) === '1') return; } catch (e) {}
  var el = null, tmr = null, mudo = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('cc-css')) return;
    var s = document.createElement('style'); s.id = 'cc-css';
    s.textContent = '#cc-toast{position:fixed;left:50%;bottom:max(76px,calc(env(safe-area-inset-bottom,0px) + 76px));transform:translateX(-50%);z-index:9500;max-width:min(92vw,420px);display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;padding:10px 14px;background:#fff;border:1.5px solid #ecdadd;border-radius:16px;box-shadow:0 14px 30px -14px rgba(74,40,40,.55);font:14px/1.4 "Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38}' +
      '#cc-toast b{font-weight:700}#cc-toast button{font:inherit;font-weight:700;border-radius:99px;padding:6px 14px;min-height:36px;cursor:pointer;border:1.5px solid #c23f5e;background:#c23f5e;color:#fff}' +
      '#cc-toast button.n{background:#fff;color:#71676e;border-color:#ddd7dc}#cc-toast button.z{background:transparent;border:0;color:#71676e;font-weight:500;text-decoration:underline;min-height:28px;padding:2px 6px;font-size:12.5px}';
    document.head.appendChild(s);
  }
  function some() { clearTimeout(tmr); if (el) { el.remove(); el = null; } }
  function caixa(html, ms) {
    css(); some();
    el = document.createElement('div'); el.id = 'cc-toast'; el.setAttribute('role', 'status'); el.innerHTML = html; document.body.appendChild(el);
    tmr = setTimeout(some, ms || 9000); return el;
  }
  function carrega(src, fn) { var t = document.createElement('script'); t.src = src; t.onload = fn; t.onerror = function () { caixa('<span>Não consegui abrir o caderno agora.</span>', 4000); }; document.head.appendChild(t); }
  function comCaderno(fn) { if (window.UniCaderno) fn(window.UniCaderno); else carrega('/caderno-dados.js?v=8', function () { fn(window.UniCaderno); }); }

  function guarda(texto) {
    comCaderno(function (C) {
      var dt = new Date(), fonte = String(document.title || '').split(/\s[—·|]\s/)[0].trim();
      var n = C.nova();
      C.atualizar(n.id, { x: texto + (fonte ? '\n\n(' + fonte + ')' : ''), a: String(dt.getFullYear()), o: String(dt.getMonth() + 1), d: String(dt.getDate()), w: String((dt.getDay() + 6) % 7) });
      C.agora();
      var b = caixa('<span>✓ Guardado no caderno</span><button type="button" class="a">Abrir</button>', 6000);
      b.querySelector('.a').onclick = function () {
        some();
        if (window.UniCadernoFlutuante && window.UniCadernoFlutuante.abrirNota) window.UniCadernoFlutuante.abrirNota(n.id);
        else location.href = '/idiomas/caderno/';
      };
    });
  }

  document.addEventListener('copy', function () {
    if (mudo) return;
    var a = document.activeElement, sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed) return;
    if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;
    var no = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    if (no && no.closest && no.closest('#cf-p, #cf-aba, #bz-p, #cc-toast, #uv-chip')) return;
    var t = sel.toString().replace(/\n{3,}/g, '\n\n').trim();
    if (t.length < 2 || t.length > 3000) return;
    var b = caixa('<b>Adicionar no caderno?</b><button type="button" class="s">Adicionar</button><button type="button" class="n">Agora não</button><button type="button" class="z">Não perguntar mais</button>');
    b.querySelector('.s').onclick = function () { guarda(t); };
    b.querySelector('.n').onclick = some;
    b.querySelector('.z').onclick = function () { mudo = true; try { localStorage.setItem(OFF, '1'); } catch (e) {} some(); caixa('<span>Combinado, não pergunto mais.</span>', 3000); };
  });
})();
