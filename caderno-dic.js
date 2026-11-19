/* Unirversos · Dicionário dentro do Caderno: busca japonês, romaji, inglês ou português e mostra o resultado no próprio painel.
   Fontes (do navegador, sem servidor nosso): Jotoba (principal) e Jisho (reserva). Os significados chegam em inglês;
   o português é tradução automática (MyMemory), marcada como tal. Nada disso depende do login. */
(function () {
  if (window.UniDic) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var TEM_JA = /[぀-ヿ㐀-鿿]/;
  /* endereço do intermediário (Cloudflare Worker); vazio = o navegador fala direto com os dicionários */
  var API = '';
  var CK = 'uniDicPt1';
  function lerCache() { try { return JSON.parse(localStorage.getItem(CK) || '{}'); } catch (e) { return {}; } }
  function gravaCache(c) { try { var k = Object.keys(c); if (k.length > 300) k.slice(0, 100).forEach(function (x) { delete c[x]; }); localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} }

  function tempo(ms, p) { return new Promise(function (ok, no) { var t = setTimeout(function () { no(new Error('tempo')); }, ms); p.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); no(e); }); }); }

  /* tradução automática (MyMemory) */
  function traduz(txt, de, para) {
    var url = API ? API + '/traduz?q=' + encodeURIComponent(txt) + '&de=' + de + '&para=' + para : 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(txt) + '&langpair=' + de + '|' + para;
    return tempo(8000, fetch(url)).then(function (r) { return r.json(); }).then(function (j) {
      var t = j && j.responseData && j.responseData.translatedText;
      if (!t || /MYMEMORY|INVALID|QUERY LENGTH/i.test(t)) throw new Error('sem tradução');
      return t;
    });
  }

  function jotoba(q) {
    return tempo(9000, fetch(API ? API + '/jotoba' : 'https://jotoba.de/api/search/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, language: 'English', no_english: false }) }))
      .then(function (r) { if (!r.ok) throw new Error('jotoba ' + r.status); return r.json(); })
      .then(function (j) {
        return (j.words || []).slice(0, 8).map(function (w) {
          var rd = w.reading || {};
          var sens = (w.senses || []).slice(0, 4).map(function (s) { return { g: (s.glosses || []).slice(0, 4), pos: s.pos ? [].concat(s.pos).map(function (p) { return typeof p === 'string' ? p : (p && (p.Noun || p.Verb || Object.keys(p)[0])) || ''; }).filter(Boolean).slice(0, 2) : [] }; }).filter(function (s) { return s.g.length; });
          return { k: rd.kanji || '', r: rd.kana || '', comum: !!w.common, s: sens };
        }).filter(function (x) { return x.s.length && (x.k || x.r); });
      });
  }
  function jisho(q) {
    return tempo(9000, fetch(API ? API + '/jisho?keyword=' + encodeURIComponent(q) : 'https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(q)))
      .then(function (r) { if (!r.ok) throw new Error('jisho ' + r.status); return r.json(); })
      .then(function (j) {
        return (j.data || []).slice(0, 8).map(function (w) {
          var jp = (w.japanese || [])[0] || {};
          return { k: jp.word || '', r: jp.reading || '', comum: !!w.is_common, s: (w.senses || []).slice(0, 4).map(function (s) { return { g: (s.english_definitions || []).slice(0, 4), pos: (s.parts_of_speech || []).slice(0, 2) }; }).filter(function (s) { return s.g.length; }) };
        }).filter(function (x) { return x.s.length && (x.k || x.r); });
      });
  }
  function busca(q) {
    return jotoba(q).then(function (r) { if (!r.length) throw new Error('vazio'); return r; })
      .catch(function (e1) { return jisho(q).then(function (r) { r.fonte = 'Jisho'; return r; }, function () { throw e1; }); });
  }

  var CSS = '.dc{display:flex;flex-direction:column;gap:10px}.dc form{display:flex;gap:8px}.dc input{flex:1;min-width:0;font:inherit;font-size:16px;border:1.5px solid #ecdadd;border-radius:12px;padding:9px 12px;background:#fff;color:#3a2b38}' +
    '.dc .bt{font:inherit;font-size:14px;font-weight:700;border:1.5px solid #c23f5e;background:#c23f5e;color:#fff;border-radius:99px;padding:6px 16px;min-height:42px;cursor:pointer}.dc .bt:focus-visible,.dc input:focus-visible,.dc .sv:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}' +
    '.dc .it{background:#fff;border:1.5px solid #ecdadd;border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}.dc .pal{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.dc .jp{font:800 24px/1.2 "Zen Maru Gothic",system-ui,sans-serif}.dc .rd{font-size:14px;color:#705f6c}' +
    '.dc .cm{font-size:11px;font-weight:800;color:#a8324f;background:#fdeaee;border-radius:99px;padding:1px 8px}.dc ol{margin:0;padding-left:20px;font-size:14.5px}.dc li{margin:2px 0}.dc .en{font-size:12.5px;color:#705f6c}.dc .nt{font-size:12.5px;color:#705f6c}' +
    '.dc .sv{align-self:flex-start;font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #c23f5e;background:#fff;color:#a8324f;border-radius:99px;padding:6px 14px;min-height:38px;cursor:pointer}.dc .sv.ok{background:#e8efe8;border-color:#9bb59b;color:#3f5a3f}' +
    '.dc .ms{background:#fff;border:1.5px dashed #ecdadd;border-radius:16px;padding:18px 14px;text-align:center;color:#705f6c;font-size:14px}.dc .ms a{color:#a8324f;font-weight:700}';

  function montar(el, op) {
    if (!document.getElementById('dc-css')) { var st = document.createElement('style'); st.id = 'dc-css'; st.textContent = CSS; document.head.appendChild(st); }
    el.innerHTML = '<div class="dc"><form role="search"><input type="search" id="dc-q" placeholder="水 · mizu · water · água" aria-label="Palavra para buscar" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="bt" type="submit">Buscar</button></form><div id="dc-r" aria-live="polite"></div></div>';
    var f = el.querySelector('form'), q = el.querySelector('#dc-q'), R = el.querySelector('#dc-r'), seq = 0;
    function msg(h) { R.innerHTML = '<div class="ms">' + h + '</div>'; }
    function links(t) { return 'Abrir "' + esc(t) + '" em <a href="https://jotoba.de/search/0/' + encodeURIComponent(t) + '" target="_blank" rel="noopener">Jotoba</a> ou <a href="https://jisho.org/search/' + encodeURIComponent(t) + '" target="_blank" rel="noopener">Jisho</a>.'; }
    function linhaSalvar(x, pt) { return (x.k ? x.k + (x.r ? ' (' + x.r + ')' : '') : x.r) + ' — ' + (pt || x.s[0].g.slice(0, 3).join(', ')); }
    function pinta(rs, texto) {
      R.innerHTML = '<div class="dc">' + rs.map(function (x, i) {
        return '<div class="it" data-i="' + i + '"><div class="pal"><span class="jp">' + esc(x.k || x.r) + '</span>' + (x.k && x.r ? '<span class="rd">' + esc(x.r) + '</span>' : '') + (x.comum ? '<span class="cm">comum</span>' : '') + '</div>' +
          '<ol>' + x.s.slice(0, 3).map(function (s) { return '<li>' + esc(s.g.join('; ')) + '</li>'; }).join('') + '</ol>' +
          '<div class="pt nt" hidden></div><button class="sv" type="button">+ Salvar no caderno</button></div>';
      }).join('') + '<div class="nt">' + texto + '</div></div>';
      var cache = lerCache();
      Array.prototype.forEach.call(R.querySelectorAll('.it'), function (card, i) {
        var x = rs[i], en = x.s[0].g.slice(0, 3).join(', '), ptEl = card.querySelector('.pt');
        function mostra(t) { x.pt = t; ptEl.hidden = false; ptEl.textContent = 'PT (tradução automática): ' + t; }
        if (cache[en]) mostra(cache[en]);
        else if (i < 5) traduz(en, 'en', 'pt-BR').then(function (t) { var c = lerCache(); c[en] = t; gravaCache(c); mostra(t); }, function () {});
        card.querySelector('.sv').onclick = function () { var b = this; op.salvar(linhaSalvar(x, x.pt)); b.textContent = '✓ Salvo'; b.classList.add('ok'); setTimeout(function () { b.textContent = '+ Salvar no caderno'; b.classList.remove('ok'); }, 1800); };
      });
    }
    f.onsubmit = function (e) {
      e.preventDefault();
      var t = q.value.trim(); if (!t) return;
      var n = ++seq; msg('Buscando…');
      var extra = null;
      var tarefas = [busca(t).catch(function (e) { return e; })];
      if (!TEM_JA.test(t)) tarefas.push(traduz(t, 'pt-BR', 'en').then(function (en) { if (en && en.toLowerCase() !== t.toLowerCase()) { extra = en; return busca(en).catch(function () { return []; }); } return []; }, function () { return []; }));
      Promise.all(tarefas).then(function (v) {
        if (n !== seq) return;
        var a = Array.isArray(v[0]) ? v[0] : null, b = v[1] || [];
        if (!a && !b.length) { msg('Não consegui falar com o dicionário agora (internet ou bloqueio do navegador). ' + links(t)); return; }
        var vistos = {}, rs = [];
        (b || []).concat(a || []).forEach(function (x) { var k = (x.k || '') + '|' + x.r; if (!vistos[k]) { vistos[k] = 1; rs.push(x); } });
        if (!rs.length) { msg('Nada encontrado para "' + esc(t) + '". ' + links(t)); return; }
        pinta(rs.slice(0, 10), 'Significados em inglês pelo ' + (a && a.fonte || 'Jotoba') + (extra ? ' · também busquei por "' + esc(extra) + '"' : '') + '. O português é tradução automática: confira antes de estudar.');
      });
    };
    return { foca: function () { setTimeout(function () { q.focus(); }, 50); } };
  }
  window.UniDic = { montar: montar };
})();
