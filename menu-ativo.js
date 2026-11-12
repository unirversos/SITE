/* Unirversos · destaca no menu o universo em que a pessoa está (idiomas, planeta utopia, travessia, paralelos, tesouros, sobre) */
(function () {
  var seg = location.pathname.split('/')[1];
  if (['idiomas', 'travessia', 'paralelos', 'loja', 'sobre'].indexOf(seg) < 0) return;
  var utopia = location.pathname.indexOf('/idiomas/planeta-utopia/') === 0;
  var nomes = { loja: 'tesouros' };
  document.querySelectorAll('a').forEach(function (a) {
    var h = a.getAttribute('href'), t = a.textContent.trim().toLowerCase();
    if (utopia) {
      if (h === '/idiomas/' && t === 'idiomas') a.removeAttribute('aria-current');
      if (h === '/idiomas/planeta-utopia/salao/' && t === 'planeta utopia') a.setAttribute('aria-current', 'page');
      return;
    }
    if ((h === '/' + seg + '/' || h === 'https://unirversos.com/' + seg + '/') && (t === seg || t === nomes[seg])) a.setAttribute('aria-current', 'page');
  });
})();
