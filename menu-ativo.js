/* Unirversos · destaca no menu o universo em que a pessoa está (idiomas, travessia, paralelos, loja, sobre) */
(function () {
  var seg = location.pathname.split('/')[1];
  if (['idiomas', 'travessia', 'paralelos', 'loja', 'sobre'].indexOf(seg) < 0) return;
  document.querySelectorAll('a[href="/' + seg + '/"], a[href="https://unirversos.com/' + seg + '/"]').forEach(function (a) {
    if (a.textContent.trim().toLowerCase() === seg) a.setAttribute('aria-current', 'page');
  });
})();
