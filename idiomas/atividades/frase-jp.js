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
  /* quadradinho do dicionário: abre pequeno, à direita, sem cobrir a lição */
  var caixa = null, dic = null;
  function carregaDic(fn) {
    if (window.UniDic) return fn();
    var t = document.createElement('script'); t.src = '/caderno-dic.js?v=6'; t.onload = fn; document.head.appendChild(t);
  }
  function salvaNoCaderno(linha) {
    var C = window.UniCaderno; if (!C) return;
    var K = 'uniNotaPalavrasAtiv', id = null; try { id = localStorage.getItem(K); } catch (e) {}
    var n = id && C.obter(id);
    if (!n) { n = C.nova(); id = n.id; try { localStorage.setItem(K, id); } catch (e) {} n = C.obter(id) || n; if (!n.x) C.atualizar(id, { x: 'Palavras das atividades' }); n = C.obter(id) || n; }
    C.atualizar(id, { x: (n.x ? n.x.replace(/\s+$/, '') + '\n' : '') + linha });
  }
  function fecha() { if (caixa) caixa.hidden = true; var a = document.querySelector('.tk.on'); if (a) a.classList.remove('on'); }
  function quadradinho(p, el) {
    if (!caixa) {
      caixa = document.createElement('div'); caixa.className = 'pdic'; caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-label', 'Dicionário');
      caixa.innerHTML = '<div class="pd-top"><b lang="ja" class="pd-p"></b><span><button type="button" class="pd-mais" title="Abrir o Dicionário completo">⤢</button><button type="button" class="pd-x" aria-label="Fechar">×</button></span></div><div class="pd-r"></div>';
      document.body.appendChild(caixa);
      caixa.querySelector('.pd-x').onclick = fecha;
      caixa.querySelector('.pd-mais').onclick = function () { var t = caixa.querySelector('.pd-p').textContent; fecha(); busca(t); };
      dic = null;
    }
    caixa.hidden = false;
    caixa.querySelector('.pd-p').textContent = p;
    /* fica na altura da palavra tocada, sem sair da tela */
    var r = el.getBoundingClientRect(), alto = Math.min(window.innerHeight * 0.6, 420);
    if (window.innerWidth > 640) caixa.style.top = Math.max(12, Math.min(r.top - 20, window.innerHeight - alto - 12)) + 'px'; else caixa.style.top = '';
    carregaDic(function () {
      if (!dic) dic = window.UniDic.montar(caixa.querySelector('.pd-r'), { salvar: salvaNoCaderno });
      var q = caixa.querySelector('.pd-r input'); if (!q || !q.form) return;
      q.value = p; q.form.requestSubmit();
    });
  }
  function toca(el) {
    var ant = document.querySelector('.tk.on'); if (ant) ant.classList.remove('on');
    el.classList.add('on');
    quadradinho(el.getAttribute('data-l'), el);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && caixa && !caixa.hidden) fecha(); });
  document.addEventListener('click', function (e) { if (caixa && !caixa.hidden && !caixa.contains(e.target) && !(e.target.closest && e.target.closest('.tk'))) fecha(); });
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
    'html.furi .jp,html.furi .fc-c p[lang=ja]{line-height:2.1}' +
    '.pdic{position:fixed;right:14px;top:90px;z-index:85;width:min(270px,calc(100vw - 28px));max-height:min(45vh,300px);overflow:auto;background:#fffaf8;border:1.5px solid #e7e1f6;border-left:4px solid #6f5fa8;border-radius:14px;padding:7px 9px;box-shadow:0 14px 30px -16px rgba(58,43,56,.55)}' +
    '.pdic[hidden]{display:none}@media(min-width:760px){.pdic{right:76px}}@media(max-width:640px){.pdic{top:auto;bottom:76px}}' +
    '.pd-top{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px}.pd-p{font-size:15px}' +
    '.pd-top button{font:inherit;font-size:12px;width:26px;height:26px;border-radius:50%;border:1.5px solid #ecdadd;background:#fff;cursor:pointer;margin-left:4px;color:#3a2b38}' +
    '.pdic .dc form{display:none}.pdic .dc .it:nth-child(n+2){display:none}.pdic .dc > .nt{display:none}.pdic .dc .it{padding:6px 8px;gap:3px;border-radius:12px}.pdic .dc .jp{font-size:17px}.pdic .dc .rd{font-size:12px}.pdic .dc ol{font-size:13px;padding-left:16px}.pdic .dc .nt{font-size:11.5px}.pdic .dc .sv{font-size:12px;min-height:30px;padding:3px 10px}.pdic .dc .cm{font-size:10px}';
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
    /* "〜（ら）れる [~(ra)reru]" → られる ; "〜ないと / 〜なくちゃ [...]" → ないと、なくちゃ */
    if (/\s\[[^\]]*\]\s*$/.test(String(e || ''))) return String(e).replace(/\s*\[[^\]]*\]\s*$/, '').replace(/[〜～~（）()]/g, '').replace(/\s*\/\s*/g, '、').trim();
    var m = String(e || '').match(/[（(]\s*([\u3040-\u30ff・ー]+)/);
    return m ? m[1] : String(e || '').replace(/[（(].*$/, '').replace(/[〜～~]/g, '').trim();
  }

  /* ---------- só a professora: "Preparar leituras" ----------
     Separa as palavras das frases de exemplo (com leitura e forma de dicionário) e grava junto da atividade no Firebase.
     O analisador (kuromoji, ~18 MB) só é baixado aqui, quando a professora toca no botão; os alunos não baixam nada. */
  var KURO = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/';
  function carregaKuromoji() {
    return new Promise(function (ok, no) {
      /* o kuromoji junta os caminhos com path.join, que estraga "https://" em "https:/" e faz o navegador
         procurar o dicionário dentro do próprio site; enquanto ele carrega, o endereço é consertado */
      var go = function () {
        var X = XMLHttpRequest.prototype, abre = X.open;
        X.open = function (m, u) { var a = Array.prototype.slice.call(arguments); if (typeof u === 'string') a[1] = u.replace(/^(https?):\/(?!\/)/, '$1://'); return abre.apply(this, a); };
        var volta = function () { X.open = abre; };
        window.kuromoji.builder({ dicPath: KURO + 'dict/' }).build(function (e, t) { volta(); e ? no(e) : ok(t); });
      };
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
    else if (tipo === 'dokkai') itens.forEach(function (r) { while (r.length < 11) r.push(''); r[11] = separa(tok, r[8]); });
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
