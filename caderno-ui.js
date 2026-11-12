/* Unirversos · Caderno completo (lista de anotações + caderno em páginas)
   UniCadernoUI.montar(elemento) → { novaSobre(titulo, data) }
   Usado em /idiomas/caderno/ e na Área do aluno. Depende de caderno-dados.js e caderno-livro.js. */
(function () {
  if (window.UniCadernoUI) return;
  var css = document.createElement('style');
  css.textContent = [
    '.cdu{display:grid;gap:12px;font-family:"Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38;min-width:0}',
    '.cdu [hidden]{display:none!important}',
    '.cdu-l{display:flex;gap:8px;align-items:center;min-width:0}',
    '.cdu-b{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;border-radius:99px;padding:8px 16px;font-size:14px;font-weight:700;min-height:40px;white-space:nowrap;flex:none}',
    '.cdu-b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}.cdu-b.sm{padding:4px 12px;min-height:34px;font-size:13px}',
    '.cdu-b:focus-visible,.cdu-i:focus-visible{outline:3px solid #b7a6dc;outline-offset:2px}',
    '.cdu-is{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin;min-width:0;flex:1}',
    '.cdu-i{font:inherit;color:inherit;text-align:left;cursor:pointer;border:1.5px solid #ecdadd;background:#fdf6f4;border-radius:14px;padding:6px 12px;display:grid;gap:0;flex:none;max-width:220px}',
    '.cdu-i b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cdu-i small{color:#705f6c;font-size:11.5px;white-space:nowrap}',
    '.cdu-i[aria-current="true"]{border-color:#c23f5e;background:#fff}',
    '.cdu-v{color:#705f6c;font-size:14px;margin:4px 2px;white-space:nowrap}',
    '.cdu-m{display:grid;gap:10px;min-width:0}',
    '.cdu-r{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:#705f6c}',
    '.cdu-vazio{background:#fff;border:1.5px dashed #ecdadd;border-radius:18px;padding:40px 20px;text-align:center;color:#705f6c}'
  ].join('');
  document.head.appendChild(css);

  function montar(el) {
    var C = window.UniCaderno, tl = null, tTeclou = 0, pede = false;
    el.classList.add('cdu');
    el.innerHTML =
      '<div class="cdu-l" role="group" aria-label="Suas anotações"><button class="cdu-b p" type="button" data-a="nova">+ Nova anotação</button><div class="cdu-is"></div></div>' +
      '<div class="cdu-m"><div class="cdu-livro"></div><div class="cdu-vazio" hidden>Ainda não há anotações. Toque em <b>+ Nova anotação</b> para começar.</div>' +
      '<div class="cdu-r"><span><span class="cdu-e" aria-live="polite">Salvo neste aparelho</span> <button class="cdu-b sm" type="button" data-a="entrar" hidden>Entrar</button></span>' +
      '<button class="cdu-b sm" type="button" data-a="apaga">Apagar anotação</button></div></div>';
    var is = el.querySelector('.cdu-is'), vazio = el.querySelector('.cdu-vazio'), est = el.querySelector('.cdu-e'),
      btEntrar = el.querySelector('[data-a="entrar"]'), btApaga = el.querySelector('[data-a="apaga"]');
    var livro = UniLivro.montar(el.querySelector('.cdu-livro'), { aoMudar: function () { tTeclou = Date.now(); clearTimeout(tl); tl = setTimeout(lista, 250); } });

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function data(ms) { return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
    function temDesenho(n) { return (n.s && n.s.length) || (Array.isArray(n.pp) && n.pp.some(function (q) { return q && q.s && q.s.length; })); }
    function lista() {
      var vs = C.vivas(), atual = livro.id();
      is.innerHTML = vs.length ? vs.map(function (n) {
        var np = 1 + (Array.isArray(n.pp) ? n.pp.length : 0);
        return '<button class="cdu-i" type="button" data-id="' + n.id + '"' + (n.id === atual ? ' aria-current="true"' : '') + '><b>' + esc(C.nome(n)) + (temDesenho(n) ? ' ✎' : '') + '</b><small>' + data(n.m) + (np > 1 ? ' · ' + np + ' páginas' : '') + '</small></button>';
      }).join('') : '<p class="cdu-v">Ainda não há anotações.</p>';
    }
    function abre(id) { livro.abrir(id); vazio.hidden = true; el.querySelector('.cdu-livro').hidden = false; btApaga.hidden = false; lista(); }
    function abreProxima() {
      var vs = C.vivas(); if (vs.length) { abre(vs[0].id); return; }
      livro.abrir(null); vazio.hidden = false; el.querySelector('.cdu-livro').hidden = true; btApaga.hidden = true; lista();
    }
    function nova() { var n = C.nova(); abre(n.id); livro.foca(); }
    function estado() { est.textContent = C.texto(); btEntrar.hidden = C.estado() !== 'sem-login'; }

    el.addEventListener('click', function (e) {
      var i = e.target.closest('.cdu-i'); if (i) { abre(i.dataset.id); return; }
      var b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'nova') nova();
      if (b.dataset.a === 'entrar') C.entrar();
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
    return {
      novaSobre: function (titulo, dt) { var id = livro.novaSobre(titulo, dt); abre(id); setTimeout(function () { livro.foca(); }, 300); return id; }
    };
  }
  window.UniCadernoUI = { montar: montar };
})();
