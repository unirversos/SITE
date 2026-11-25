/* Unirversos · Caderno completo (busca, estante de cadernos, favoritos, lista de anotações + caderno em páginas)
   UniCadernoUI.montar(elemento) → { id(), salvaLinha(linha), novaSobre(titulo, data) }
   Usado em /idiomas/caderno/ e na Área do aluno. Depende de caderno-dados.js e caderno-livro.js. */
(function () {
  if (window.UniCadernoUI) return;
  var css = document.createElement('style');
  css.textContent = [
    '.cdu{display:grid;gap:12px;font-family:"Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38;min-width:0}',
    '.cdu [hidden]{display:none!important}',
    '.cdu-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-width:0}',
    '.cdu-busca{flex:1 1 200px;min-width:0;font:inherit;font-size:14px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:8px 14px;min-height:40px}',
    '.cdu-busca:focus{outline:none;border-color:#c23f5e}',
    '.cdu-filtros{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 4px;scrollbar-width:thin;min-width:0}',
    '.cdu-f{font:inherit;cursor:pointer;flex:none;border:1.5px solid #ecdadd;background:#fff;color:#705f6c;border-radius:99px;padding:4px 12px;font-size:12.5px;font-weight:700;min-height:32px;white-space:nowrap}',
    '.cdu-f[aria-pressed="true"]{background:#3a2b38;border-color:#3a2b38;color:#fff}',
    '.cdu-l{display:flex;gap:8px;align-items:center;min-width:0}',
    '.cdu-b{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:8px 16px;font-size:14px;font-weight:700;min-height:40px;white-space:nowrap;flex:none}',
    '.cdu-b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}.cdu-b.sm{padding:4px 12px;min-height:34px;font-size:13px}',
    '.cdu-b.fav[aria-pressed="true"]{border-color:#d97706;background:#fef6e7;color:#9a5204}',
    '.cdu-b:focus-visible,.cdu-i:focus-visible,.cdu-f:focus-visible,.cdu-busca:focus-visible,.cdu-cadSel:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}',
    '.cdu-is{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin;min-width:0;flex:1}',
    '.cdu-i{font:inherit;color:inherit;text-align:left;cursor:pointer;border:1.5px solid #ecdadd;background:#fdf6f4;border-radius:14px;padding:6px 12px;display:grid;gap:1px;flex:none;max-width:230px}',
    '.cdu-i b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cdu-i small{color:#705f6c;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.cdu-i[aria-current="true"]{border-color:#c23f5e;background:#fff}',
    '.cdu-v{color:#705f6c;font-size:14px;margin:4px 2px;white-space:nowrap}',
    '.cdu-m{display:grid;gap:10px;min-width:0}',
    '.cdu-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px}',
    '.cdu-cadSel{font:inherit;cursor:pointer;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:4px 12px;font-size:13px;font-weight:700;min-height:34px}',
    '.cdu-r{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:#705f6c}',
    '.cdu-vazio{background:#fff;border:1.5px dashed #ecdadd;border-radius:18px;padding:40px 20px;text-align:center;color:#705f6c}'
  ].join('');
  document.head.appendChild(css);

  function montar(el) {
    var C = window.UniCaderno, tl = null, tTeclou = 0, pede = false, filtro = '__todos__', termo = '';
    el.classList.add('cdu');
    el.innerHTML =
      '<div class="cdu-top">' +
      '<button class="cdu-b p" type="button" data-a="nova">+ Nova anotação</button>' +
      '<input class="cdu-busca" type="search" placeholder="Buscar por título, palavra ou kanji…" aria-label="Buscar anotações">' +
      '</div>' +
      '<div class="cdu-filtros" role="group" aria-label="Filtrar por caderno"></div>' +
      '<div class="cdu-l" role="group" aria-label="Suas anotações"><div class="cdu-is"></div></div>' +
      '<div class="cdu-m">' +
      '<div class="cdu-meta" hidden>' +
      '<button class="cdu-b sm fav" type="button" data-a="fav" aria-pressed="false" title="Fixar anotação no topo">☆ Favoritar</button>' +
      '<select class="cdu-cadSel" aria-label="Caderno desta anotação" title="Mover para um caderno"></select>' +
      '</div>' +
      '<div class="cdu-livro"></div><div class="cdu-vazio" hidden>Ainda não há anotações. Toque em <b>+ Nova anotação</b> para começar.</div>' +
      '<div class="cdu-r"><span><span class="cdu-e" aria-live="polite">Salvo neste aparelho</span> <button class="cdu-b sm" type="button" data-a="entrar" hidden>Entrar</button></span>' +
      '<button class="cdu-b sm" type="button" data-a="apaga">Apagar anotação</button></div></div>';
    var is = el.querySelector('.cdu-is'), vazio = el.querySelector('.cdu-vazio'), est = el.querySelector('.cdu-e'),
      btEntrar = el.querySelector('[data-a="entrar"]'), btApaga = el.querySelector('[data-a="apaga"]'),
      busca = el.querySelector('.cdu-busca'), filtrosEl = el.querySelector('.cdu-filtros'),
      metaEl = el.querySelector('.cdu-meta'), btFav = el.querySelector('[data-a="fav"]'), cadSel = el.querySelector('.cdu-cadSel');
    var livro = UniLivro.montar(el.querySelector('.cdu-livro'), { aoMudar: function () { tTeclou = Date.now(); clearTimeout(tl); tl = setTimeout(lista, 250); } });

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function data(ms) { return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
    function temDesenho(n) { return (n.s && n.s.length) || (Array.isArray(n.pp) && n.pp.some(function (q) { return q && q.s && q.s.length; })); }
    function bateBusca(n, q) {
      if (!q) return true;
      var s = ((n.t || '') + ' ' + (n.x || '') + ' ' + (n.cad || '') + ' ' + (Array.isArray(n.pp) ? n.pp.map(function (p) { return (p && p.x) || ''; }).join(' ') : '')).toLowerCase();
      return s.indexOf(q) >= 0;
    }
    function filtradas() {
      var vs = C.vivas(), q = termo.trim().toLowerCase();
      return vs.filter(function (n) {
        if (filtro === '__fav__' && !n.fav) return false;
        if (filtro !== '__todos__' && filtro !== '__fav__' && (n.cad || '') !== filtro) return false;
        return bateBusca(n, q);
      });
    }
    function pintaFiltros() {
      var cads = C.cadernos ? C.cadernos() : [];
      var temFav = C.vivas().some(function (n) { return !!n.fav; });
      if (filtro !== '__todos__' && filtro !== '__fav__' && cads.indexOf(filtro) < 0) filtro = '__todos__';
      var bts = ['<button class="cdu-f" type="button" data-fil="__todos__" aria-pressed="' + (filtro === '__todos__') + '">Todos</button>'];
      if (temFav || filtro === '__fav__') bts.push('<button class="cdu-f" type="button" data-fil="__fav__" aria-pressed="' + (filtro === '__fav__') + '">★ Favoritas</button>');
      cads.forEach(function (c) {
        bts.push('<button class="cdu-f" type="button" data-fil="' + esc(c) + '" aria-pressed="' + (filtro === c) + '">📓 ' + esc(c) + '</button>');
      });
      filtrosEl.innerHTML = bts.join('');
      filtrosEl.hidden = bts.length <= 1;
    }
    function pintaMeta() {
      var id = livro.id(), n = id && C.obter(id);
      metaEl.hidden = !n;
      if (!n) return;
      var fav = !!n.fav;
      btFav.setAttribute('aria-pressed', String(fav));
      btFav.textContent = fav ? '★ Favorita' : '☆ Favoritar';
      var cads = C.cadernos ? C.cadernos() : [];
      var cur = n.cad || '';
      var opts = ['<option value="">Sem caderno</option>'];
      cads.forEach(function (c) { opts.push('<option value="' + esc(c) + '"' + (c === cur ? ' selected' : '') + '>📓 ' + esc(c) + '</option>'); });
      opts.push('<option value="__novo__">+ Novo caderno…</option>');
      cadSel.innerHTML = opts.join('');
      if (cur && cads.indexOf(cur) < 0) cadSel.value = '';
    }
    function lista() {
      pintaFiltros();
      pintaMeta();
      var vs = filtradas(), atual = livro.id();
      is.innerHTML = vs.length ? vs.map(function (n) {
        var np = 1 + (Array.isArray(n.pp) ? n.pp.length : 0);
        var meta = data(n.m) + (n.cad ? ' · ' + n.cad : '') + (np > 1 ? ' · ' + np + ' pág.' : '');
        return '<button class="cdu-i" type="button" data-id="' + n.id + '"' + (n.id === atual ? ' aria-current="true"' : '') + '><b>' + (n.fav ? '★ ' : '') + esc(C.nome(n)) + (temDesenho(n) ? ' ✎' : '') + '</b><small>' + esc(meta) + '</small></button>';
      }).join('') : '<p class="cdu-v">' + (termo.trim() || filtro !== '__todos__' ? 'Nenhuma anotação nesse filtro.' : 'Ainda não há anotações.') + '</p>';
    }
    function abre(id) { livro.abrir(id); vazio.hidden = true; el.querySelector('.cdu-livro').hidden = false; btApaga.hidden = false; lista(); }
    function abreProxima() {
      var vs = C.vivas(); if (vs.length) { abre(vs[0].id); return; }
      livro.abrir(null); vazio.hidden = false; el.querySelector('.cdu-livro').hidden = true; btApaga.hidden = true; metaEl.hidden = true; lista();
    }
    function nova() {
      var cadInicial = (filtro !== '__todos__' && filtro !== '__fav__') ? filtro : '';
      var n = C.nova(cadInicial);
      abre(n.id); livro.foca();
    }
    function estado() { est.textContent = C.texto(); btEntrar.hidden = C.estado() !== 'sem-login'; }

    busca.addEventListener('input', function () { termo = busca.value; lista(); });
    cadSel.addEventListener('change', function () {
      var id = livro.id(); if (!id) return;
      var v = cadSel.value;
      if (v === '__novo__') {
        var nomeCad = window.prompt('Nome do novo caderno (ex.: JLPT N5, Aulas, Diário):', '');
        nomeCad = nomeCad ? nomeCad.trim().slice(0, 40) : '';
        if (!nomeCad) { pintaMeta(); return; }
        C.atualizar(id, { cad: nomeCad });
        lista(); return;
      }
      C.atualizar(id, { cad: v });
      lista();
    });
    el.addEventListener('click', function (e) {
      var fl = e.target.closest('.cdu-f'); if (fl) { filtro = fl.dataset.fil; lista(); return; }
      var i = e.target.closest('.cdu-i'); if (i) { abre(i.dataset.id); return; }
      var b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'nova') nova();
      if (b.dataset.a === 'entrar') C.entrar();
      if (b.dataset.a === 'fav') {
        var id = livro.id(), n = id && C.obter(id);
        if (!n) return;
        C.atualizar(id, { fav: !n.fav });
        lista();
      }
      if (b.dataset.a === 'apaga') {
        if (!livro.id()) return;
        if (!pede) { pede = true; b.textContent = 'Apagar mesmo?'; setTimeout(function () { pede = false; b.textContent = 'Apagar anotação'; }, 3000); return; }
        pede = false; b.textContent = 'Apagar anotação'; C.apagar(livro.id()); abreProxima();
      }
    });
    C.on(function (tipo) {
      if (tipo === 'estado') estado();
      if (tipo === 'remoto') {
        lista(); var id = livro.id(), n = id && C.obter(id);
        if (id && !n) abreProxima();
        else if (n && (n.m || 0) > livro.ultimoM() && Date.now() - tTeclou > 5000) livro.abrir(id, true);
        else if (!id) abreProxima();
      }
    });
    estado(); abreProxima();
    /* links da Área do aluno: ?n=<id> abre uma anotação; ?nova=1 começa uma nova */
    try {
      var q = new URLSearchParams(location.search), qn = q.get('n');
      if (qn && C.obter(qn)) { abre(qn); setTimeout(function () { livro.foca(); }, 300); }
      else if (q.get('nova')) nova();
      if (qn || q.get('nova')) history.replaceState(null, '', location.pathname);
    } catch (e) {}
    return {
      id: function () { return livro.id(); },
      /* acrescenta uma linha no fim da anotação aberta (ou cria uma anotação nova) — usado pelo dicionário */
      salvaLinha: function (linha) {
        var id = livro.id(), n = id && C.obter(id);
        if (!n) { n = C.nova(); id = n.id; }
        C.atualizar(id, { x: (n.x ? n.x.replace(/\s+$/, '') + '\n' : '') + linha }); abre(id);
      },
      novaSobre: function (titulo, dt) { var id = livro.novaSobre(titulo, dt); abre(id); setTimeout(function () { livro.foca(); }, 300); return id; }
    };
  }
  window.UniCadernoUI = { montar: montar };
})();
