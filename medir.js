/* medir.js — contagem de visitas do Unirversos (Cloudflare Web Analytics)
   Sem cookies e sem guardar nada no aparelho da pessoa, por isso não precisa de aviso.
   Mostra: visitas, páginas mais vistas, de onde a pessoa veio (Instagram, Google…), país e aparelho.
   O token abaixo não é senha: ele aparece no código de qualquer página que usa o Cloudflare. */
(function () {
  var TOKEN = '08d0715411b2429ca591be268eb49cb1'; // token do Cloudflare Web Analytics (site unirversos.com)
  if (!TOKEN || window.__uniMedirLigado) return;
  if (location.hostname !== 'unirversos.com' && location.hostname !== 'www.unirversos.com') return; // não conta testes no computador
  window.__uniMedirLigado = true;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));
  document.head.appendChild(s);
})();
