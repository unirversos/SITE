/* Unirversos · "← Voltar para ..." em qualquer página do site: se a pessoa chegou por um link de outra página
   daqui, aparece uma faixa fina no topo que leva de volta (com a rolagem de onde estava).
   Não aparece se a página já tem o seu próprio voltar (link do topo ou chip do Baú), na home, no Planeta Utopia
   nem quando a pessoa chegou direto (link externo, favorito). */
(function () {
  if (window.top !== window || window.UniVoltarGlobal) return; window.UniVoltarGlobal = true;
  var K = 'uni-last', path = location.pathname + location.search;
  function nome(t, p) {
    if (p === '/') return 'o início';
    var n = String(t || '').split(/\s[—·|:]\s/)[0].replace(/Unirversos\s*\/?\s*/i, '').trim();
    return n || 'a página anterior';
  }
  var prev = null;
  try { prev = JSON.parse(sessionStorage.getItem(K) || 'null'); } catch (e) {}
  try { sessionStorage.setItem(K, JSON.stringify({ u: path, p: location.pathname, n: nome(document.title, location.pathname) })); } catch (e) {}

  var ref = null;
  try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) {}
  if (!ref || ref.origin !== location.origin || ref.pathname === location.pathname) return;
  if (location.pathname === '/' || location.pathname.indexOf('/idiomas/planeta-utopia/') === 0 || location.pathname.indexOf('/idiomas/nova/') === 0 || location.pathname.indexOf('/idiomas/aula-zero/') === 0) return;
  var n = (prev && prev.p === ref.pathname) ? prev.n : 'a página anterior';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mostra() {
    if (document.querySelector('a[data-volta]') || document.getElementById('bz-chip') || document.getElementById('uv-chip')) return;
    var st = document.createElement('style');
    st.textContent = '#uv-chip{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 14px;background:#FFF6E6;border-bottom:1px solid #ead9b0;font:14px/1.4 "Zen Maru Gothic",system-ui,sans-serif}' +
      '#uv-chip .v{font:inherit;font-weight:700;border:0;background:transparent;color:#7A5B21;cursor:pointer;padding:4px 2px;min-height:32px;text-align:left}' +
      '#uv-chip .x{font:inherit;border:0;background:transparent;color:#71676e;font-size:20px;line-height:1;cursor:pointer;min-width:32px;min-height:32px}';
    document.head.appendChild(st);
    var c = document.createElement('div');
    c.id = 'uv-chip'; c.setAttribute('role', 'navigation'); c.setAttribute('aria-label', 'Voltar');
    c.innerHTML = '<button class="v" type="button">← Voltar para ' + esc(n) + '</button><button class="x" type="button" aria-label="Dispensar">×</button>';
    document.body.insertBefore(c, document.body.firstChild);
    c.querySelector('.v').onclick = function () { if (history.length > 1) history.back(); else location.href = ref.pathname + ref.search; };
    c.querySelector('.x').onclick = function () { c.remove(); };
  }
  function inicia() { setTimeout(mostra, 350); }
  if (document.body) inicia(); else document.addEventListener('DOMContentLoaded', inicia);
})();
