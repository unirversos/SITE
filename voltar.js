/* Unirversos · "← Voltar": o link "← Minha trilha" / "← Trilha de japonês" do topo das ferramentas e aulas
   passa a levar para a página de onde a pessoa veio (dentro do site), com o nome dela.
   Se a pessoa chegou direto (link externo, favorito), o link continua indo para a trilha. */
(function () {
  if (window.UniVoltar) return; window.UniVoltar = true;
  var NOMES = {
    '/': 'o início', '/idiomas/': 'Idiomas', '/idiomas/nova/': 'Idiomas', '/idiomas/japones/': 'Minha trilha', '/aluno/': 'Área do aluno',
    '/idiomas/avatar/': 'Meu avatar', '/idiomas/palavras/': 'Minhas palavras', '/idiomas/hiragana/': 'Hiragana', '/idiomas/katakana/': 'Katakana',
    '/idiomas/kanji/': 'Kanji', '/idiomas/numeros/': 'Números', '/idiomas/calendario/': 'Calendário', '/idiomas/gravador/': 'Gravador',
    '/idiomas/amuleto/': 'Amuleto', '/idiomas/ar/': 'Ar', '/idiomas/guia/': 'Mini guia', '/idiomas/caderno/': 'o Caderno',
    '/idiomas/mapas/': 'Mapas', '/idiomas/aula-zero/': 'Aula zero', '/idiomas/autoanalise/': 'o quiz'
  };
  function nome(p) {
    if (NOMES[p]) return NOMES[p];
    if (/^\/idiomas\/mapas\/[^/]+\/aula\/$/.test(p)) return 'a aula';
    if (p.indexOf('/idiomas/planeta-utopia/') === 0) return 'Planeta Utopia';
    return '';
  }
  function aplica() {
    var ref = null;
    try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) {}
    if (!ref || ref.origin !== location.origin || ref.pathname === location.pathname) return;
    var links = document.querySelectorAll('a[href="/idiomas/japones/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!/^\s*←/.test(a.textContent)) continue;
      if (ref.pathname === '/idiomas/japones/') return; /* já é a trilha: nada muda */
      var n = nome(ref.pathname);
      a.textContent = n ? '← Voltar para ' + n : '← Voltar';
      a.href = ref.pathname + ref.search;
      a.setAttribute('data-volta', '1');
      /* voltar pelo histórico devolve a pessoa ao mesmo ponto da página */
      a.addEventListener('click', function (e) {
        if (history.length > 1 && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); history.back(); }
      });
      return;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplica); else aplica();
})();
