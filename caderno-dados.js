/* Unirversos · dados do Caderno
   As anotações ficam no aparelho (localStorage "uniCadernoNotas1") e, com login, também na conta
   (Firestore: progress/{uid}, campo "caderno"), no mesmo documento do progresso e do calendário.
   Cada anotação: { id, t:título, x:texto, a/o/d:ano-mês-dia, w:dia da semana, s:traços da caneta, m:última edição (ms), del:apagada }.
   Ao sincronizar, vale a edição mais recente de cada anotação; apagar deixa uma marca por 60 dias para o apagado valer nos outros aparelhos. */
(function () {
  if (window.UniCaderno) return;
  var K = 'uniCadernoNotas1', LIMITE = 700000, DIAS = 60;
  var notas = [], ouv = [], est = 'local', tLocal = null, tNuvem = null, ocupado = false, de_novo = false;
  var profOk = null, profBusca = false, estProf = '', ultimoProf = null; /* "Mostrar para a professora": só para quem tem aulas particulares */

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
    checaProf();
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
    }).then(function () { ocupado = false; enviaProf(); if (de_novo) { de_novo = false; sincronizar(); } });
  }


  /* ---------- professora (aluno de aulas particulares) ----------
     O aluno escolhe, anotação por anotação (campo sp), o que a professora pode ver. Só as marcadas vão para
     aulas_cadernos/{e-mail do aluno} (Firestore); o resto do caderno continua só dele. */
  function emailUsuario() { var C = window.UniConta, u = C && C.auth && C.auth.currentUser; return (u && u.email) ? u.email.toLowerCase() : ''; }
  function setProf(e) { if (estProf !== e) { estProf = e; emitir('prof'); } }
  function checaProf() {
    if (profOk !== null || profBusca || !remoto.pronto()) return;
    var u = window.UniConta.auth.currentUser, k = 'uniCadProf:' + u.uid;
    if (!u.emailVerified) return;
    try { if (sessionStorage.getItem(k) === '1') { profOk = true; emitir('prof'); return; } } catch (e) {}
    profBusca = true;
    remoto.fs().then(function (fs) { return fs.getDoc(fs.doc(window.UniConta.db, 'aulas', emailUsuario())); })
      .then(function (d) { profOk = !!d.exists(); }, function () { profOk = false; })
      .then(function () {
        profBusca = false;
        if (profOk) { try { sessionStorage.setItem(k, '1'); } catch (e) {} } else profOk = null; /* quem ainda não é aluno é checado de novo na próxima visita */
        emitir('prof'); enviaProf();
      });
  }
  function enviaProf() {
    if (!profOk || !remoto.pronto()) return Promise.resolve();
    var comp = notas.filter(function (n) { return !n.del && n.sp; }).map(function (n) {
      return { id: n.id, t: n.t || '', x: n.x || '', a: n.a || '', o: n.o || '', d: n.d || '', w: n.w == null ? null : n.w, s: n.s || [], pp: n.pp || [], m: n.m || 0 };
    });
    if (!comp.length && !notas.some(function (n) { return n.sp === false; })) return Promise.resolve(); /* nunca compartilhou nada */
    var ch = chave(comp); if (ch === ultimoProf) return Promise.resolve();
    if (JSON.stringify(comp).length > LIMITE) { setProf('grande'); return Promise.resolve(); }
    setProf('enviando');
    return remoto.fs().then(function (fs) { return fs.setDoc(fs.doc(window.UniConta.db, 'aulas_cadernos', emailUsuario()), { notas: comp, atualizado: new Date().toISOString() }); })
      .then(function () { ultimoProf = ch; setProf('ok'); },
        function (e) { setProf(e && e.code === 'permission-denied' ? 'sem-permissao' : 'erro'); });
  }
  function textoProf() {
    return { 'enviando': 'Enviando para a professora…', 'ok': 'A professora já pode ver ✓', 'sem-permissao': 'A professora ainda não consegue ver: falta liberar no Firestore',
      'erro': 'Não consegui falar com a professora agora; tento de novo daqui a pouco', 'grande': 'Anotação grande demais para mostrar: apague desenhos antigos' }[estProf] || 'Vai ficar visível para a professora em instantes…';
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
    if (n.sp) n.sp = false; /* some também da vista da professora */
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
    estado: function () { return est; }, texto: texto, prof: { disponivel: function () { return !!profOk; }, estado: function () { return estProf; }, texto: textoProf }, on: function (f) { ouv.push(f); }, _remoto: remoto, _juntar: juntar, _recarregar: function () { notas = lerLocal(); } };

  document.addEventListener('uni-conta', function (e) { if (e.detail && e.detail.user) sincronizar(); else setEst('sem-login'); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') sincronizar(); else gravarLocal(); });
  window.addEventListener('pagehide', gravarLocal);
  window.addEventListener('online', sincronizar);
  setTimeout(function () { if (remoto.pronto()) sincronizar(); else setEst('sem-login'); }, 800);
})();
