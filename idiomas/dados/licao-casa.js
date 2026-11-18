/* Unirversos · Lição de casa: monta, a partir dos dados de cada aula, uma anotação no Caderno com
   (1) a cópia do que a aula ensinou e (2) exercícios de ESCREVER (texto ou caneta). Só acrescenta: não mexe nas aulas.
   Uso: UniLicao.abrir(slug, aula?) · UniLicao.texto(slug, aula?) · UniLicao.slugs */
(function () {
  if (window.UniLicao) return;
  var AZ = [{"n": 1, "jp": "です", "molde": "coisa です", "ro": "[coisa] desu", "ex": "おにぎりです", "exro": "onigiri desu", "dia": "Com です você já responde “o que é isso?” em qualquer lugar do Japão."}, {"n": 2, "jp": "じゃない", "molde": "coisa じゃない", "ro": "[coisa] janai", "ex": "バスじゃない", "exro": "basu janai", "dia": "Com じゃない você corrige: “não é isso, é aquilo”."}, {"n": 3, "jp": "ます", "molde": "coisa を / lugar に ação ます", "ro": "[coisa] o / [lugar] ni + [ação]-masu", "ex": "とうきょうにいきます", "exro": "Tōkyō ni ikimasu", "dia": "Com ます você diz o que faz: vou, como, bebo, compro."}, {"n": 4, "jp": "ません", "molde": "coisa を ação ません", "ro": "[coisa] o [ação]-masen", "ex": "さかなをたべません", "exro": "sakana o tabemasen", "dia": "Com ません você diz o que não come nem bebe, e evita um susto no restaurante."}, {"n": 5, "jp": "ください", "molde": "すみません、coisa を ください", "ro": "sumimasen, [coisa] o kudasai", "ex": "おちゃをください", "exro": "ocha o kudasai", "dia": "Com ください você pede. É a chave que abre os balcões."}];
  var SLUGS = ['aulazero','aeroporto','hotel','restaurante','kombini','trens','compras','roupas','emergencia','apresentacao','horas','planos','sinalizacao'];
  function limpa(s) { return String(s == null ? '' : s).replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); }
  function kana(s) { return limpa(String(s).split('|')[0]); }
  var LINHA = '________________________';
  var COMO = 'Escreva em kana ou romaji. Pode usar o teclado ou a caneta (botão Caneta, em cima).\nSe você tem aulas com a professora, ela vê esta lição de casa. Para esconder, use o botão “Mostrar para a professora”, embaixo.';

  function secoesAulaZero() {
    var S = [], t = 'COPIADO DA AULA · as 5 chaves';
    S.push('Lição de casa · Aula Zero\n' + COMO);
    AZ.forEach(function (c) { t += '\n' + c.n + ' ' + c.jp + ': ' + c.molde + '\n   ' + c.ex; });
    S.push(t);
    AZ.forEach(function (c) { S.push('EXERCÍCIO · chave 0' + c.n + ' ' + c.jp + '\n' + c.molde + '\n1) ' + LINHA + '\n2) ' + LINHA); });
    S.push('EXERCÍCIO · minha frase\nEscolha a chave que mais gostou e escreva uma frase sobre você:\n' + LINHA);
    return S;
  }

  function secoesMapa(A) {
    var ws = A.words || [], ms = A.moldes || [], cs = A.cenas || [], S = [], t;
    S.push('Lição de casa · ' + (A.emoji || '') + ' ' + A.titulo + '\n' + COMO);
    if (ws.length) { t = 'COPIADO DA AULA · palavras'; ws.slice(0, 6).forEach(function (w) { t += '\n' + limpa(w.k) + ' ' + limpa(w.pt); }); S.push(t); }
    if (ms.length) { t = 'COPIADO DA AULA · moldes'; ms.slice(0, 3).forEach(function (m) { t += '\n' + limpa(m.titulo) + ' → ' + limpa(m.tpl); }); S.push(t); }
    var n = 1;
    if (ws.length) { t = 'EXERCÍCIO ' + n++ + ' · palavras\nEscreva em japonês:'; ws.slice(0, 6).forEach(function (w) { t += '\n' + limpa(w.pt) + ': ' + LINHA; }); S.push(t); }
    if (ms.length) { t = 'EXERCÍCIO ' + n++ + ' · moldes\nUma frase sua com cada molde:'; ms.slice(0, 3).forEach(function (m) { t += '\n' + limpa(m.titulo) + '\n' + LINHA; }); S.push(t); }
    if (cs.length) { t = 'EXERCÍCIO ' + n++ + ' · responda'; cs.slice(0, 2).forEach(function (c) { t += '\n' + limpa(c.say) + ' = ' + limpa(c.pt) + '\n(' + limpa(c.ansPt) + ') ' + LINHA; }); S.push(t); }
    S.push('EXERCÍCIO ' + n + ' · minha frase\nEscreva uma frase sua com o que aprendeu:\n' + LINHA);
    return S;
  }

  /* divide em páginas do caderno (o texto não cabe numa folha só): ~12 linhas visuais por página */
  function largura(l) { var w = 0; for (var i = 0; i < l.length; i++) w += l.charCodeAt(i) > 255 ? 2 : 1; return w; }
  function paginas(secoes) {
    var pgs = [], cur = [], rows = 0, MAX = 10;
    function linhasDe(txt) { return txt.split('\n').reduce(function (a, l) { return a + Math.max(1, Math.ceil(largura(l) / 38)); }, 0); }
    function fecha() { if (cur.length) pgs.push(cur.join('\n\n')); cur = []; rows = 0; }
    secoes.forEach(function (sec) {
      var r = linhasDe(sec) + 1;
      if (r > MAX) { /* seção maior que uma folha: quebra por linhas */
        fecha(); var parte = [], pr = 0;
        sec.split('\n').forEach(function (l) { var lr = Math.max(1, Math.ceil(largura(l) / 38)); if (pr + lr > MAX && parte.length) { pgs.push(parte.join('\n')); parte = []; pr = 0; } parte.push(l); pr += lr; });
        if (parte.length) pgs.push(parte.join('\n')); return;
      }
      if (rows + r > MAX) fecha();
      cur.push(sec); rows += r;
    });
    fecha(); return pgs;
  }
  function dados(slug, aula) { return aula || (slug !== 'aulazero' && (window.AULAS || {})[slug]) || null; }
  function secoes(slug, aula) { if (slug === 'aulazero') return secoesAulaZero(); var A = dados(slug, aula); return A ? secoesMapa(A) : []; }
  function texto(slug, aula) { return secoes(slug, aula).join('\n\n'); }
  function titulo(slug, aula) { if (slug === 'aulazero') return 'Lição de casa · Aula Zero'; var A = dados(slug, aula); return 'Lição de casa · ' + (A ? A.titulo : slug); }

  /* cria a anotação uma vez e depois só reabre (não sobrescreve o que a pessoa escreveu) */
  function abrir(slug, aula) {
    var K = 'uniLicao_' + slug, tent = 0;
    function vai() {
      var CF = window.UniCadernoFlutuante, C = window.UniCaderno;
      if (!CF || !C) { if (++tent > 40) { location.href = '/idiomas/caderno/'; return; } return setTimeout(vai, 250); }
      var id = null; try { id = localStorage.getItem(K); } catch (e) {}
      if (id && C.obter(id)) { CF.abrirNota(id); return; }
      var sc = secoes(slug, aula); if (!sc.length) { location.href = '/idiomas/caderno/'; return; }
      var n = C.nova(); id = n.id; try { localStorage.setItem(K, id); } catch (e) {}
      var pgs = paginas(sc);
      /* sp: aparece em “Anotações que o aluno mostrou” na página da professora (só vai se a pessoa for aluna dela; dá para desligar no caderno) */
      CF.nomear(id, { t: titulo(slug, aula), x: pgs[0], pp: pgs.slice(1).map(function (x) { return { x: x, s: [] }; }), sp: true });
    }
    vai();
  }
  window.UniLicao = { abrir: abrir, paginas: paginas, secoes: secoes, texto: texto, titulo: titulo, slugs: SLUGS };
})();
