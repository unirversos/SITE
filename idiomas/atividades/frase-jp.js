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
  /* voz em japonês: espera as vozes do aparelho carregarem e escolhe uma japonesa;
     sem voz japonesa no aparelho, avisa em vez de ler com sotaque de outra língua */
  var vozes = [];
  function carregaVozes() { try { vozes = speechSynthesis.getVoices() || []; } catch (e) { vozes = []; } }
  try { carregaVozes(); speechSynthesis.addEventListener('voiceschanged', carregaVozes); } catch (e) {}
  function vozJa() {
    var ja = vozes.filter(function (v) { return /^ja/i.test(v.lang) || /japan|日本/i.test(v.name); });
    return ja.find(function (v) { return /google/i.test(v.name); }) || ja.find(function (v) { return v.localService; }) || ja[0] || null;
  }
  function aviso(t) {
    var b = document.getElementById('voz-av'); if (!b) { b = document.createElement('div'); b.id = 'voz-av'; b.setAttribute('role', 'status');
      b.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:90;background:#fbf1de;color:#6b4b14;border:1.5px solid #e6c98a;border-radius:14px;padding:10px 14px;font-size:14px;max-width:min(560px,calc(100% - 24px))';
      document.body.appendChild(b); }
    b.textContent = t; clearTimeout(b._t); b._t = setTimeout(function () { b.remove(); }, 6000);
  }
  function fala(t) {
    if (!t || !window.speechSynthesis) return;
    var vai = function () {
      speechSynthesis.cancel();
      var v = vozJa();
      if (!v) { aviso('Este aparelho não tem voz em japonês instalada. No Android: Configurações › Idioma › Saída de texto para fala › instale o japonês.'); return; }
      var u = new SpeechSynthesisUtterance(t); u.lang = v.lang || 'ja-JP'; u.voice = v; u.rate = .9;
      speechSynthesis.speak(u);
    };
    if (vozes.length) vai(); else { carregaVozes(); setTimeout(function () { carregaVozes(); vai(); }, vozes.length ? 0 : 400); }
  }
  function cala() { try { speechSynthesis.cancel(); } catch (e) {} }
  /* romaji simples (Hepburn, sem macron) → hiragana, para a voz ler 開く como あく e não ひらく.
     Com ō/ū ou algo que não entende, devolve '' e a voz lê o kanji. */
  var SIL = { kya:'きゃ',kyu:'きゅ',kyo:'きょ',sha:'しゃ',shu:'しゅ',sho:'しょ',cha:'ちゃ',chu:'ちゅ',cho:'ちょ',nya:'にゃ',nyu:'にゅ',nyo:'にょ',hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',mya:'みゃ',myu:'みゅ',myo:'みょ',rya:'りゃ',ryu:'りゅ',ryo:'りょ',gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',ja:'じゃ',ju:'じゅ',jo:'じょ',bya:'びゃ',byu:'びゅ',byo:'びょ',pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ',
    shi:'し',chi:'ち',tsu:'つ',ji:'じ',fu:'ふ',ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',sa:'さ',su:'す',se:'せ',so:'そ',ta:'た',te:'て',to:'と',na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',ha:'は',hi:'ひ',he:'へ',ho:'ほ',ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',ya:'や',yu:'ゆ',yo:'よ',ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',wa:'わ',wo:'を',
    ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',za:'ざ',zu:'ず',ze:'ぜ',zo:'ぞ',da:'だ',de:'で',do:'ど',ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',a:'あ',i:'い',u:'う',e:'え',o:'お' };
  function kana(ro) {
    var t = String(ro || '').toLowerCase().replace(/[\s'-]/g, ''), out = '';
    if (!t || /[^a-z]/.test(t)) return '';
    for (var i = 0; i < t.length;) {
      if (t[i] === 'n' && (i + 1 === t.length || !/[aiueoy]/.test(t[i + 1]))) { out += 'ん'; i++; continue; }
      if (i + 1 < t.length && t[i] === t[i + 1] && !/[aiueon]/.test(t[i])) { out += 'っ'; i++; continue; }
      var ok = false;
      for (var n = 3; n >= 1; n--) { var s = t.substr(i, n); if (SIL[s]) { out += SIL[s]; i += n; ok = true; break; } }
      if (!ok) return '';
    }
    return out;
  }
  /* "促す (うながす / unagasu)" → うながす ; "〜っぽい (ppoi)" → っぽい */
  function leituraDe(e) {
    var m = String(e || '').match(/[（(]\s*([\u3040-\u30ff・ー]+)/);
    return m ? m[1] : String(e || '').replace(/[（(].*$/, '').replace(/[〜～~]/g, '').trim();
  }

  /* ---------- só a professora: "Preparar leituras" ----------
     Separa as palavras das frases de exemplo (com leitura e forma de dicionário) e grava junto da atividade no Firebase.
     O analisador (kuromoji, ~18 MB) só é baixado aqui, quando a professora toca no botão; os alunos não baixam nada. */
  var KURO = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/';
  function carregaKuromoji() {
    return new Promise(function (ok, no) {
      var go = function () { window.kuromoji.builder({ dicPath: KURO + 'dict/' }).build(function (e, t) { e ? no(e) : ok(t); }); };
      if (window.kuromoji) return go();
      var sc = document.createElement('script'); sc.src = KURO + 'build/kuromoji.js'; sc.onload = go; sc.onerror = function () { no(new Error('não carregou o analisador')); };
      document.head.appendChild(sc);
    });
  }
  function separa(tok, frase) {
    return tok.tokenize(String(frase || '')).map(function (x) {
      var s = x.surface_form;
      if (x.pos === '記号') return [s, '', '-'];
      var r = KANJI.test(s) && x.reading && x.reading !== '*' ? hira(x.reading) : '';
      var l = x.basic_form && x.basic_form !== '*' && x.basic_form !== s ? x.basic_form : '';
      return [s, r, l];
    });
  }
  /* tipo 'galeria': linhas [s, d, palavra, nuance, exemplo, tradução, tema] → exemplo na posição 4, palavras na 7
     tipo 'pares': { t: {x}, i: {x} } → t.xt e i.xt */
  async function preparar(id, tipo, st) {
    var m = await import('/idiomas/dados/conta.js?v=6');
    var fs = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    st('lendo a atividade…');
    var snap = await fs.getDoc(fs.doc(m.db, 'biblioteca', id));
    if (!snap.exists()) throw new Error('atividade não encontrada');
    var itens = JSON.parse(snap.data().itens || '[]');
    st('baixando o analisador (só desta vez, pode levar um minuto)…');
    var tok = await carregaKuromoji();
    st('separando as palavras…');
    if (tipo === 'pares') itens.forEach(function (p) { p.t.xt = separa(tok, p.t.x); p.i.xt = separa(tok, p.i.x); });
    else itens.forEach(function (r) { while (r.length < 7) r.push(''); r[7] = separa(tok, r[4]); });
    st('gravando…');
    await fs.setDoc(fs.doc(m.db, 'biblioteca', id), { itens: JSON.stringify(itens), leituras: new Date().toISOString() }, { merge: true });
    return itens.length;
  }
  function botaoProf(id, tipo, depoisDe) {
    if (document.getElementById('prep-l')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.id = 'prep-l';
    b.textContent = '⚙︎ Preparar leituras'; b.title = 'Só você vê: separa as palavras das frases para o toque e o ふりがな';
    var ref = document.getElementById(depoisDe || 'furi'); if (!ref) return;
    ref.insertAdjacentElement('afterend', b);
    b.onclick = function () {
      b.disabled = true;
      var st = function (t) { b.textContent = '⏳ ' + t; };
      preparar(id, tipo, st).then(function (n) { b.textContent = '✓ ' + n + ' itens prontos · recarregando'; setTimeout(function () { location.reload(); }, 1200); },
        function (e) { console.warn(e); b.disabled = false; b.textContent = '⚠️ Não deu: ' + (e && e.message || e) + ' · tocar de novo'; });
    };
  }

  window.FraseJP = { html: html, botao: botao, busca: busca, fala: fala, cala: cala, leituraDe: leituraDe, botaoProf: botaoProf, kana: kana };
})();
