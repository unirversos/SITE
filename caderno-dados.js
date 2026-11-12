/* Unirversos · dados do Caderno
   As anotações ficam no aparelho (localStorage "uniCadernoNotas1") e, com login, também na conta
   (Firestore: progress/{uid}, campo "caderno"), no mesmo documento do progresso e do calendário.
   Cada anotação: { id, t:título, x:texto, a/o/d:ano-mês-dia, w:dia da semana, s:traços da caneta, m:última edição (ms), del:apagada }.
   Ao sincronizar, vale a edição mais recente de cada anotação; apagar deixa uma marca por 60 dias para o apagado valer nos outros aparelhos. */
(function () {
  if (window.UniCaderno) return;
  var K = 'uniCadernoNotas1', LIMITE = 700000, DIAS = 60;
  var notas = [], ouv = [], est = 'local', tLocal = null, tNuvem = null, ocupado = false, de_novo = false;

  /* ---------- servidor (trocável nos testes) ---------- */
  var remoto = {
    pronto: function () { var C = window.UniConta; return !!(C && C.auth && C.auth.currentUser); },
    fs: function () { return import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'); },
    ref: function (fs) { var C = window.UniConta; return fs.doc(C.db, 'progress', C.auth.currentUser.uid); },
    ler: function () { var me = this; return me.fs().then(function (fs) { return fs.getDoc(me.ref(fs)).then(function (s) { var d = s.exists() ? s.data().caderno : null; return (d && Array.isArray(d.notas)) ? d.notas : []; }); }); },
    gravar: function (arr) { var me = this; return me.fs().then(function (fs) { return fs.setDoc(me.ref(fs), { caderno: { notas: arr, atualizado: new Date().toISOString() } }, { merge: true }); }); }
  };

  /* ---------- local ---------- */
  function lerLocal() { try { var v = JSON.parse(localStorage.getItem(K) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function gravarLocal() { clearTimeout(tLocal); tLocal = null; try { localStorage.setItem(K, JSON.stringify(notas)); } catch (e) { setEst('erro-local'); } }
  function agLocal() { clearTimeout(tLocal); tLocal = setTimeout(gravarLocal, 300); }
  function emitir(tipo) { ouv.forEach(function (f) { try { f(tipo, est); } catch (e) {} }); }
  function setEst(e) { if (est !== e) { est = e; emitir('estado'); } }

  /* ---------- mesclar ---------- */
  function juntar(a, b) {
    var mp = {}, lim = Date.now() - DIAS * 864e5;
    a.concat(b).forEach(function (n) { if (!n || !n.id) return; var o = mp[n.id]; if (!o || (n.m || 0) > (o.m || 0)) mp[n.id] = n; });
    return Object.keys(mp).map(function (k) { return mp[k]; }).filter(function (n) { return !(n.del && (n.m || 0) < lim); });
  }
  function chave(arr) { return JSON.stringify(arr.slice().sort(function (x, y) { return x.id < y.id ? -1 : 1; })); }

  /* ---------- conta ---------- */
  function agNuvem() { clearTimeout(tNuvem); tNuvem = setTimeout(sincronizar, 2000); if (remoto.pronto() && est !== 'sincronizando') setEst('pendente'); }
  function sincronizar() {
    clearTimeout(tNuvem); tNuvem = null;
    if (!remoto.pronto()) { setEst('sem-login'); return Promise.resolve(); }
    if (ocupado) { de_novo = true; return Promise.resolve(); }
    ocupado = true; setEst('sincronizando');
    return remoto.ler().then(function (rem) {
      var antes = chave(notas), j = juntar(notas, rem), mudouAqui = chave(j) !== antes;
      notas = j; if (mudouAqui) { gravarLocal(); emitir('remoto'); }
      if (chave(j) === chave(rem)) { setEst('ok'); return; }
      if (JSON.stringify(j).length > LIMITE) { setEst('grande'); return; }
      return remoto.gravar(j).then(function () { setEst('ok'); });
    }).catch(function (e) {
      setEst((e && e.code === 'permission-denied') ? 'sem-permissao' : (navigator.onLine === false ? 'offline' : 'erro'));
    }).then(function () { ocupado = false; if (de_novo) { de_novo = false; sincronizar(); } });
  }

  /* ---------- API ---------- */
  function vivas() { return notas.filter(function (n) { return !n.del; }).sort(function (a, b) { return (b.m || 0) - (a.m || 0); }); }
  function obter(id) { return notas.filter(function (n) { return n.id === id && !n.del; })[0] || null; }
  function nome(n) {
    return (n.t || '').trim() || (n.x || '').trim().split('\n')[0].slice(0, 60) || ((n.s && n.s.length) ? 'Desenho' : 'Sem título');
  }
  function nova() {
    var n = { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: '', x: '', m: Date.now() };
    notas.push(n); gravarLocal(); agNuvem(); return n;
  }
  function atualizar(id, campos) {
    var n = obter(id); if (!n) return null;
    Object.keys(campos).forEach(function (k) { n[k] = campos[k]; });
    n.m = Date.now(); agLocal(); agNuvem(); return n;
  }
  function apagar(id) {
    var n = obter(id); if (!n) return;
    n.del = true; n.t = ''; n.x = ''; n.s = []; n.a = n.o = n.d = ''; n.w = null; n.m = Date.now(); gravarLocal(); agNuvem();
  }
  function agora() { gravarLocal(); }
  function entrar() {
    var C = window.UniConta;
    if (C && C.entrar) C.entrar({ titulo: 'Guarde o seu caderno na conta', texto: 'Com a conta, as suas anotações e desenhos vão junto para qualquer celular, tablet ou computador.', peq: 'Guardamos só o seu e-mail e o que você escreve aqui e nos estudos.' });
  }
  function texto() {
    return { 'local': 'Salvo neste aparelho', 'pendente': 'Salvo · subindo para a conta…', 'sincronizando': 'Guardando na conta…', 'ok': 'Guardado na conta ✓',
      'sem-login': 'Salvo neste aparelho · entre para guardar na conta', 'offline': 'Sem internet: salvo neste aparelho, sobe depois',
      'erro': 'Não consegui falar com a conta agora: salvo neste aparelho', 'sem-permissao': 'A conta não aceitou guardar o caderno: salvo neste aparelho',
      'grande': 'Caderno grande demais para a conta: apague desenhos antigos', 'erro-local': 'Não consegui salvar neste aparelho' }[est] || 'Salvo';
  }

  notas = lerLocal();
  window.UniCaderno = { vivas: vivas, obter: obter, nova: nova, atualizar: atualizar, apagar: apagar, nome: nome, agora: agora, sincronizar: sincronizar, entrar: entrar,
    estado: function () { return est; }, texto: texto, on: function (f) { ouv.push(f); }, _remoto: remoto, _juntar: juntar, _recarregar: function () { notas = lerLocal(); } };

  document.addEventListener('uni-conta', function (e) { if (e.detail && e.detail.user) sincronizar(); else setEst('sem-login'); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') sincronizar(); else gravarLocal(); });
  window.addEventListener('pagehide', gravarLocal);
  window.addEventListener('online', sincronizar);
  setTimeout(function () { if (remoto.pronto()) sincronizar(); else setEst('sem-login'); }, 800);
})();
