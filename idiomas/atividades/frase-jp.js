/* Unirversos · Frases em japonês das Atividades: tocar numa palavra abre o Dicionário do site,
   e o botão ふりがな mostra a leitura em cima dos kanji.
   Cada frase pode vir com as palavras já separadas (feito uma vez, quando a atividade é carregada no Firebase):
   [[texto, leitura em hiragana ou '', forma de dicionário ou '' (igual ao texto) ou '-' (pontuação: não toca)], ...]
   Sem essa lista, a frase aparece como texto normal. */
(function () {
  if (window.FraseJP) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var KANJI = /[㐀-鿿々ヶ]/;
  var hira = function (t) { return String(t || '').replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); };

  /* 促し + うながし → 促<rt>うなが</rt>し : a leitura fica só em cima do kanji */
  function ruby(s, r) {
    if (!r || !KANJI.test(s)) return esc(s);
    r = hira(r);
    var a = 0, b = 0;
    while (a < s.length && !KANJI.test(s[a]) && hira(s[a]) === r[a]) a++;
    while (b < s.length - a && !KANJI.test(s[s.length - 1 - b]) && hira(s[s.length - 1 - b]) === r[r.length - 1 - b]) b++;
    var meio = s.slice(a, s.length - b), rm = r.slice(a, r.length - b);
    if (!meio || !rm) return esc(s);
    return esc(s.slice(0, a)) + '<ruby>' + esc(meio) + '<rt>' + esc(rm) + '</rt></ruby>' + esc(s.slice(s.length - b));
  }

  function html(tk, texto) {
    if (!Array.isArray(tk) || !tk.length) return esc(texto);
    return tk.map(function (t) {
      var s = t[0], l = t[2];
      if (l === '-') return esc(s);
      return '<span class="tk" role="button" tabindex="0" data-l="' + esc(l || s) + '" title="Ver no dicionário">' + ruby(s, t[1]) + '</span>';
    }).join('');
  }

  /* abre o Dicionário do site (aba lateral) já buscando a palavra */
  function busca(p) {
    var dab = document.getElementById('cf-dab');
    if (!dab) { window.open('https://jotoba.de/search/0/' + encodeURIComponent(p), '_blank', 'noopener'); return; }
    if (dab.getAttribute('aria-expanded') !== 'true') dab.click();
    var tenta = 0;
    (function vai() {
      var q = document.getElementById('dc-q');
      if (q && q.form) { q.value = p; q.form.requestSubmit(); return; }
      if (tenta++ < 20) setTimeout(vai, 100);
    })();
  }
  function toca(el) {
    var ant = document.querySelector('.tk.on'); if (ant) ant.classList.remove('on');
    el.classList.add('on');
    busca(el.getAttribute('data-l'));
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.tk[data-l]');
    if (!el || (getSelection && String(getSelection()).length > 1)) return; /* quem selecionou texto usa o botão de seleção */
    toca(el);
  });
  document.addEventListener('keydown', function (e) {
    var el = e.target.closest && e.target.closest('.tk[data-l]');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toca(el); }
  });

  /* botão ふりがな: a escolha fica guardada no aparelho */
  var KEY = 'uniFurigana';
  var ligado = function () { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  function aplica(b) {
    var on = ligado();
    document.documentElement.classList.toggle('furi', on);
    if (b) { b.textContent = on ? 'ふりがな ✓' : 'ふりがな'; b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); }
  }
  function botao(id) {
    var b = document.getElementById(id); aplica(b);
    if (b) b.onclick = function () { try { localStorage.setItem(KEY, ligado() ? '0' : '1'); } catch (e) {} aplica(b); };
  }

  var css = document.createElement('style');
  css.textContent = '.tk{cursor:pointer;border-radius:4px;transition:background .15s}' +
    '.tk:hover,.tk:focus-visible{background:#f3f0fa;outline:none}.tk.on{background:#e7e1f6;box-shadow:0 2px 0 #6f5fa8}' +
    '.tk ruby rt{display:none;font-size:.55em;color:#7a6a76;font-weight:500}html.furi .tk ruby rt{display:revert}' +
    'html.furi .jp,html.furi .fc-c p[lang=ja]{line-height:2.1}';
  document.head.appendChild(css);
  aplica();
  window.FraseJP = { html: html, botao: botao, busca: busca };
})();
