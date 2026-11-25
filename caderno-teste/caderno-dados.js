/* Unirversos · dados do Caderno (v2: IndexedDB local + 1 documento por anotação no Firestore)
   As anotações ficam no aparelho (IndexedDB "uniCadernoDB" + espelho rápido em localStorage "uniCadernoNotas1" quando couber)
   e, com login, também na conta em progress/{uid}/caderno_notas/{id} (1 doc por anotação, sem limite global de 700 KB).
   Se as regras do Firestore ainda não liberarem a subcoleção, cai automaticamente no formato legado progress/{uid}.caderno.notas.
   Cada anotação: { id, t:título, x:texto, a/o/d:ano-mês-dia, w:dia da semana, s:traços, pp:páginas extras, f:foto, pap:papel, cad:caderno, fav:favorita, sp:professora, m:última edição (ms), del:apagada }.
   Ao sincronizar, vale a edição mais recente de cada anotação; apagar deixa uma marca por 60 dias para o apagado valer nos outros aparelhos. */
(function () {
  if (window.UniCaderno) return;
  var K = 'uniCadernoNotas1', LIMITE_DOC = 750000, LIMITE_LEGADO = 700000, DIAS = 60;
  var notas = [], ouv = [], est = 'local', tLocal = null, tNuvem = null, ocupado = false, de_novo = false;
  var sujas = {}, modoNuvem = 'sub', leuLegado = false;
  var profOk = null, profBusca = false, estProf = '', ultimoProf = null; /* "Mostrar para a professora": só para quem tem aulas particulares */

  /* ---------- IndexedDB local (sem limite de ~5 MB do localStorage) ---------- */
  var IDB = (function () {
    var DBP = null;
    function abre() {
      if (DBP) return DBP;
      DBP = new Promise(function (res, rej) {
        try {
          if (!window.indexedDB) return rej(new Error('sem-idb'));
          var q = indexedDB.open('uniCadernoDB', 1);
          q.onupgradeneeded = function () {
            var db = q.result;
            if (!db.objectStoreNames.contains('notas')) db.createObjectStore('notas', { keyPath: 'id' });
          };
          q.onsuccess = function () { res(q.result); };
          q.onerror = function () { rej(q.error); };
        } catch (e) { rej(e); }
      });
      return DBP;
    }
    function lerTodas() {
      return abre().then(function (db) {
        return new Promise(function (res, rej) {
          var t = db.transaction('notas', 'readonly'), r = t.objectStore('notas').getAll();
          t.oncomplete = function () { res(Array.isArray(r.result) ? r.result : []); };
          t.onerror = t.onabort = function () { rej(t.error); };
        });
      }).catch(function () { return null; });
    }
    function gravarLista(arr) {
      return abre().then(function (db) {
        return new Promise(function (res, rej) {
          var t = db.transaction('notas', 'readwrite'), st = t.objectStore('notas');
          arr.forEach(function (n) { if (n && n.id) st.put(n); });
          t.oncomplete = function () { res(true); };
          t.onerror = t.onabort = function () { rej(t.error); };
        });
      }).catch(function () { return false; });
    }
    return { lerTodas: lerTodas, gravarLista: gravarLista };
  })();

  /* ---------- servidor (trocável nos testes) ---------- */
  var remoto = {
    pronto: function () { var C = window.UniConta; return !!(C && C.auth && C.auth.currentUser); },
    fs: function () { return import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'); },
    ref: function (fs) { var C = window.UniConta; return fs.doc(C.db, 'progress', C.auth.currentUser.uid); },
    colRef: function (fs) { var C = window.UniConta; return fs.collection(C.db, 'progress', C.auth.currentUser.uid, 'caderno_notas'); },
    notaRef: function (fs, id) { var C = window.UniConta; return fs.doc(C.db, 'progress', C.auth.currentUser.uid, 'caderno_notas', id); },
    ler: function () {
      var me = this;
      return me.fs().then(function (fs) {
        return fs.getDoc(me.ref(fs)).then(function (s) {
          var d = s.exists() ? s.data().caderno : null;
          return (d && Array.isArray(d.notas)) ? d.notas : [];
        });
      });
    },
    gravar: function (arr) {
      var me = this;
      return me.fs().then(function (fs) {
        return fs.setDoc(me.ref(fs), { caderno: { notas: arr, atualizado: new Date().toISOString() } }, { merge: true });
      });
    },
    lerSub: function () {
      var me = this;
      return me.fs().then(function (fs) {
        return fs.getDocs(me.colRef(fs)).then(function (qs) {
          var out = [];
          qs.forEach(function (d) { var v = d.data(); if (v && v.id) out.push(v); });
          return out;
        });
      });
    },
    gravarNota: function (n) {
      var me = this;
      return me.fs().then(function (fs) {
        return fs.setDoc(me.notaRef(fs, n.id), n);
      });
    }
  };

  /* ---------- local ---------- */
  function lerLocalSync() { try { var v = JSON.parse(localStorage.getItem(K) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function gravarLocal(especificas) {
    clearTimeout(tLocal); tLocal = null;
    var alvo = Array.isArray(especificas) && especificas.length ? especificas : notas;
    IDB.gravarLista(alvo).then(function (ok) {
      if (!ok) {
        try { localStorage.setItem(K, JSON.stringify(notas)); } catch (e) { setEst('erro-local'); }
      }
    });
    /* mantém espelho no localStorage enquanto couber (abertura instantânea + compatibilidade) */
    try {
      var s = JSON.stringify(notas);
      if (s.length < 3500000) localStorage.setItem(K, s);
    } catch (e) {}
  }
  function agLocal(id) {
    if (id) sujas[id] = 1;
    clearTimeout(tLocal);
    tLocal = setTimeout(function () {
      var ids = Object.keys(sujas); sujas = {};
      var arr = ids.length ? notas.filter(function (n) { return ids.indexOf(n.id) >= 0; }) : notas;
      gravarLocal(arr);
    }, 300);
  }
  function emitir(tipo) { ouv.forEach(function (f) { try { f(tipo, est); } catch (e) {} }); }
  function setEst(e) { if (est !== e) { est = e; emitir('estado'); } }

  /* ---------- mesclar ---------- */
  function juntar(a, b) {
    var mp = {}, lim = Date.now() - DIAS * 864e5;
    a.concat(b).forEach(function (n) { if (!n || !n.id) return; var o = mp[n.id]; if (!o || (n.m || 0) > (o.m || 0)) mp[n.id] = n; });
    return Object.keys(mp).map(function (k) { return mp[k]; }).filter(function (n) { return !(n.del && (n.m || 0) < lim); });
  }
  function chave(arr) { return JSON.stringify(arr.slice().sort(function (x, y) { return x.id < y.id ? -1 : 1; })); }

  /* ---------- conta (incremental por documento na subcoleção, com fallback legado) ---------- */
  function agNuvem() { clearTimeout(tNuvem); tNuvem = setTimeout(sincronizar, 2000); if (remoto.pronto() && est !== 'sincronizando') setEst('pendente'); }
  function sincronizarLegado() {
    return remoto.ler().then(function (rem) {
      var antes = chave(notas), j = juntar(notas, rem), mudouAqui = chave(j) !== antes;
      notas = j; if (mudouAqui) { gravarLocal(j); emitir('remoto'); }
      if (chave(j) === chave(rem)) { setEst('ok'); return; }
      if (JSON.stringify(j).length > LIMITE_LEGADO) { setEst('grande'); return; }
      return remoto.gravar(j).then(function () { setEst('ok'); });
    });
  }
  function sincronizarSub() {
    var pSub = remoto.lerSub();
    var pLeg = leuLegado ? Promise.resolve([]) : remoto.ler().catch(function () { return []; });
    return Promise.all([pSub, pLeg]).then(function (res) {
      leuLegado = true;
      var remSub = res[0] || [], remLeg = res[1] || [];
      var remMap = {};
      remSub.forEach(function (n) { remMap[n.id] = n; });
      var antes = chave(notas);
      var j = juntar(notas, juntar(remSub, remLeg));
      var mudouAqui = chave(j) !== antes;
      notas = j;
      if (mudouAqui) { gravarLocal(j); emitir('remoto'); }
      /* sobe apenas as notas novas ou mais recentes que a cópia da subcoleção */
      var enviar = j.filter(function (n) {
        var r = remMap[n.id];
        return !r || (n.m || 0) > (r.m || 0);
      });
      if (!enviar.length) { setEst('ok'); return; }
      var grande = false;
      return enviar.reduce(function (p, n) {
        return p.then(function () {
          if (JSON.stringify(n).length > LIMITE_DOC) { grande = true; return; }
          return remoto.gravarNota(n);
        });
      }, Promise.resolve()).then(function () { setEst(grande ? 'grande-nota' : 'ok'); });
    });
  }
  function sincronizar() {
    clearTimeout(tNuvem); tNuvem = null;
    if (!remoto.pronto()) { setEst('sem-login'); return Promise.resolve(); }
    checaProf();
    if (ocupado) { de_novo = true; return Promise.resolve(); }
    ocupado = true; setEst('sincronizando');
    var op = (modoNuvem === 'sub')
      ? sincronizarSub().catch(function (e) {
          if (e && e.code === 'permission-denied') {
            modoNuvem = 'legado';
            return sincronizarLegado();
          }
          throw e;
        })
      : sincronizarLegado();
    return op.catch(function (e) {
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
      var o = { id: n.id, t: n.t || '', x: n.x || '', a: n.a || '', o: n.o || '', d: n.d || '', w: n.w == null ? null : n.w, s: n.s || [], pp: n.pp || [], m: n.m || 0 };
      if (n.f) o.f = n.f;
      if (n.pap) o.pap = n.pap;
      return o;
    });
    if (!comp.length && !notas.some(function (n) { return n.sp === false; })) return Promise.resolve(); /* nunca compartilhou nada */
    var ch = chave(comp); if (ch === ultimoProf) return Promise.resolve();
    if (JSON.stringify(comp).length > LIMITE_LEGADO) { setProf('grande'); return Promise.resolve(); }
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
  function vivas() {
    return notas.filter(function (n) { return !n.del; }).sort(function (a, b) {
      var fa = a.fav ? 1 : 0, fb = b.fav ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return (b.m || 0) - (a.m || 0);
    });
  }
  function cadernos() {
    var mp = {};
    notas.forEach(function (n) { if (!n.del && n.cad && n.cad.trim()) mp[n.cad.trim()] = 1; });
    return Object.keys(mp).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  }
  function obter(id) { return notas.filter(function (n) { return n.id === id && !n.del; })[0] || null; }
  function nome(n) {
    return (n.t || '').trim() || (n.x || '').trim().split('\n')[0].slice(0, 60) || ((n.s && n.s.length) ? 'Desenho' : 'Sem título');
  }
  function nova(cad) {
    var n = { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: '', x: '', m: Date.now() };
    if (cad && String(cad).trim()) n.cad = String(cad).trim();
    notas.push(n); gravarLocal([n]); agNuvem(); return n;
  }
  function atualizar(id, campos) {
    var n = obter(id); if (!n) return null;
    Object.keys(campos).forEach(function (k) { n[k] = campos[k]; });
    n.m = Date.now(); agLocal(id); agNuvem(); return n;
  }
  function apagar(id) {
    var n = obter(id); if (!n) return;
    /* limpa fotos vinculadas (evita arquivos órfãos no IndexedDB/Firestore) */
    if (window.UniFotos && window.UniFotos.apagar) {
      if (n.f) window.UniFotos.apagar(n.f);
      if (Array.isArray(n.pp)) n.pp.forEach(function (q) { if (q && q.f) window.UniFotos.apagar(q.f); });
    }
    if (n.sp) n.sp = false; /* some também da vista da professora */
    n.del = true; n.t = ''; n.x = ''; n.s = []; n.pp = []; n.f = null; n.pap = null; n.cad = ''; n.fav = false; n.a = n.o = n.d = ''; n.w = null; n.m = Date.now(); gravarLocal([n]); agNuvem();
  }
  function agora() { gravarLocal(); }
  function exportarBackup() {
    return JSON.stringify({ versao: 2, app: 'Caderno Unirversos', exportadoEm: new Date().toISOString(), notas: vivas() }, null, 2);
  }
  function importarBackup(textoJson) {
    var obj = JSON.parse(String(textoJson || ''));
    var lista = Array.isArray(obj) ? obj : (obj && Array.isArray(obj.notas) ? obj.notas : null);
    if (!lista) throw new Error('Arquivo de backup inválido');
    var validas = lista.filter(function (n) { return n && typeof n.id === 'string'; });
    notas = juntar(notas, validas);
    gravarLocal(notas); agNuvem(); emitir('remoto');
    return validas.length;
  }
  function entrar() {
    var C = window.UniConta;
    if (C && C.entrar) C.entrar({ titulo: 'Guarde o seu caderno na conta', texto: 'Com a conta, as suas anotações e desenhos vão junto para qualquer celular, tablet ou computador.', peq: 'Guardamos só o seu e-mail e o que você escreve aqui e nos estudos.' });
  }
  function texto() {
    return { 'local': 'Salvo neste aparelho', 'pendente': 'Salvo · subindo para a conta…', 'sincronizando': 'Guardando na conta…', 'ok': 'Guardado na conta ✓',
      'sem-login': 'Salvo neste aparelho · entre para guardar na conta', 'offline': 'Sem internet: salvo neste aparelho, sobe depois',
      'erro': 'Não consegui falar com a conta agora: salvo neste aparelho', 'sem-permissao': 'A conta não aceitou guardar o caderno: salvo neste aparelho',
      'grande': 'Caderno grande demais para a conta: apague desenhos antigos',
      'grande-nota': 'Uma anotação ficou muito grande para a conta: divida em duas anotações',
      'erro-local': 'Não consegui salvar neste aparelho' }[est] || 'Salvo';
  }

  /* inicialização: carrega instantaneamente do localStorage e hidrata/migra com IndexedDB */
  notas = lerLocalSync();
  IDB.lerTodas().then(function (idbNotas) {
    if (!idbNotas) return;
    var antes = chave(notas);
    var j = juntar(notas, idbNotas);
    notas = j;
    if (idbNotas.length < j.length) IDB.gravarLista(j);
    if (chave(j) !== antes) emitir('remoto');
  });

  window.UniCaderno = { vivas: vivas, cadernos: cadernos, obter: obter, nova: nova, atualizar: atualizar, apagar: apagar, nome: nome, agora: agora, exportarBackup: exportarBackup, importarBackup: importarBackup, sincronizar: sincronizar, entrar: entrar,
    estado: function () { return est; }, texto: texto, prof: { disponivel: function () { return !!profOk; }, estado: function () { return estProf; }, texto: textoProf }, on: function (f) { ouv.push(f); }, _remoto: remoto, _juntar: juntar, _recarregar: function () { notas = lerLocalSync(); } };

  document.addEventListener('uni-conta', function (e) { if (e.detail && e.detail.user) { leuLegado = false; sincronizar(); } else setEst('sem-login'); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') sincronizar(); else gravarLocal(); });
  window.addEventListener('pagehide', function () { gravarLocal(); });
  window.addEventListener('online', sincronizar);
  setTimeout(function () { if (remoto.pronto()) sincronizar(); else setEst('sem-login'); }, 800);
})();
