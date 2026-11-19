/* Unirversos · destaca no menu o universo em que a pessoa está (idiomas, travessia, paralelos, tesouros, sobre; o Planeta Utopia fica dentro de idiomas) */
(function () {
  var seg = location.pathname.split('/')[1];
  if (['idiomas', 'travessia', 'paralelos', 'loja', 'sobre'].indexOf(seg) < 0) return;
  var nomes = { loja: 'tesouros' };
  document.querySelectorAll('a').forEach(function (a) {
    var h = a.getAttribute('href'), t = a.textContent.trim().toLowerCase();
    if ((h === '/' + seg + '/' || h === 'https://unirversos.com/' + seg + '/') && (t === seg || t === nomes[seg])) a.setAttribute('aria-current', 'page');
  });
})();
