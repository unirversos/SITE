/* Unirversos · "← Voltar" padrão, em todas as páginas (menos a home e a Aula Zero, que tem o seu próprio).
   Faixa fina no topo, sempre igual:
   - se a pessoa veio de outra página do site: "← Voltar para <página>" (volta com a rolagem de onde estava);
   - se chegou direto (link externo, favorito): "← Voltar para <seção>" (Idiomas, Travessia, Tesouros... ou o início).
   O link "← Minha trilha" do topo das ferramentas (voltar.js) fica escondido enquanto a faixa está na tela, para não duplicar.
   Se o Baú abriu uma ferramenta, quem manda é a faixa dele (mesmo visual). */
(function () {
  if (window.top !== window || window.UniVoltarGlobal) return; window.UniVoltarGlobal = true;
  var P = location.pathname, K = 'uni-last', path = P + location.search;
  if (P === '/' || P === '/index.html' || P.indexOf('/idiomas/aula-zero/') === 0 || P.indexOf('/idiomas/aula-zero-teste/') === 0) return;

  function nome(t, p) {
    if (p === '/') return 'o início';
    var n = String(t || '').split(/\s[—·|:]\s/)[0].replace(/Unirversos\s*\/?\s*/i, '').trim();
    return n || 'a página anterior';
  }
  var prev = null;
  try { prev = JSON.parse(sessionStorage.getItem(K) || 'null'); } catch (e) {}
  try { sessionStorage.setItem(K, JSON.stringify({ u: path, p: P, n: nome(document.title, P) })); } catch (e) {}

  var ref = null;
  try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) {}
  var veio = ref && ref.origin === location.origin && ref.pathname !== P;

  /* destino quando a pessoa chegou direto: a seção da página, ou o início */
  var SEC = [['/idiomas/', 'Idiomas'], ['/travessia/', 'Travessia'], ['/loja/', 'Tesouros'], ['/paralelos/', 'Paralelos'], ['/japao/', 'Japão'], ['/aulas/', 'Área do aluno'], ['/aluno/', 'Idiomas']];
  var alvo = '/', n = 'o início';
  for (var i = 0; i < SEC.length; i++) {
    var s = SEC[i];
    if (P.indexOf(s[0]) === 0 && P !== s[0] && P !== s[0] + 'index.html') { alvo = s[0]; n = SEC[i][1]; break; }
  }
  if (P.indexOf('/aluno/') === 0) { alvo = '/idiomas/'; n = 'Idiomas'; }
  if (veio) n = (prev && prev.p === ref.pathname) ? prev.n : 'a página anterior';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mostra() {
    if (document.getElementById('bz-chip') || document.getElementById('uv-chip')) return;
    var st = document.createElement('style');
    st.textContent = '#uv-chip{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 16px;background:#FFF6E6;border-bottom:1px solid #ead9b0;font:14px/1.4 "Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38;position:relative;z-index:50}' +
      '#uv-chip .v{font:inherit;font-weight:700;border:1.5px solid #C0913F;background:#fff;color:#7A5B21;border-radius:99px;padding:5px 14px;min-height:36px;cursor:pointer}' +
      '#uv-chip .x{font:inherit;border:0;background:transparent;color:#71676e;font-size:20px;line-height:1;cursor:pointer;min-width:36px;min-height:36px}' +
      'body.uv-on a[data-volta],body.uv-on .eyebrow.back{display:none!important}';
    document.head.appendChild(st);
    var c = document.createElement('div');
    c.id = 'uv-chip'; c.setAttribute('role', 'navigation'); c.setAttribute('aria-label', 'Voltar');
    c.innerHTML = '<button class="v" type="button">← Voltar para ' + esc(n) + '</button><button class="x" type="button" aria-label="Dispensar">×</button>';
    document.body.insertBefore(c, document.body.firstChild);
    document.body.classList.add('uv-on');
    c.querySelector('.v').onclick = function () {
      if (veio && history.length > 1) history.back(); else location.href = veio ? ref.pathname + ref.search : alvo;
    };
    c.querySelector('.x').onclick = function () { c.remove(); document.body.classList.remove('uv-on'); };
  }
  function inicia() { setTimeout(mostra, 350); }
  if (document.body) inicia(); else document.addEventListener('DOMContentLoaded', inicia);
})();
