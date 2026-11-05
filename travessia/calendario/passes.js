/* Passes e trens: compensa o JR Pass? Metrô por dia? Compara com o seu roteiro (Tóquio ⇄ Osaka).
   Preços: coletados em 4 nov 2026 nas fontes citadas na tela. Mudam: confira no site oficial antes de comprar. */
(function () {
  'use strict';
  var G = window.CalGeo, L = window.CalLista;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function yen(n) { return '¥' + Math.round(n).toLocaleString('pt-BR'); }

  /* ---------- preços (ienes, adulto) ---------- */
  var P = {
    data: '4 nov 2026',
    jr: { 7: 53000, 14: 84000, 21: 105000 },   /* ordinário. Em vigor desde 1 out 2026 (guia de terceiros) */
    shin: { reservado: 14700, livre: 14000 },   /* Tóquio–Shin-Osaka, Nozomi/Hikari/Kodama, valor aproximado (ekitan, abr 2026) */
    metroTq: { 1: 1000, 2: 1500, 3: 2000 },     /* Tokyo Subway Ticket 24/48/72 h (Tokyo Metro, oficial) */
    osaka: { 1: 3500, 2: 5000 },                /* Osaka Amazing Pass (site oficial) */
    kansaiArea: { 1: 2700, 2: 4700, 3: 5500 }, /* JR West, só trens JR da região; sem Shinkansen, sem Osaka Metro */
    tokyoWide: 16000                            /* 3 dias, JR East; não cobre o Tokaido Shinkansen */
  };
  var FONTES = [
    ['JR Pass 7/14/21 dias (53.000 / 84.000 / 105.000)', 'https://www.thejapanguides.com/news/2026-10-10-japan-rail-pass-new-prices-now-in-effect/', 'guia de terceiros, 10 out 2026 · preços em vigor desde 1 out 2026'],
    ['Shinkansen Tóquio–Shin-Osaka (14.700 reservado)', 'https://ekitan.com/en/article/tokyo-to-osaka-shinkansen', 'ekitan, 1 abr 2026 · valor aproximado, varia por trem e época'],
    ['Tokyo Subway Ticket (1.000 / 1.500 / 2.000)', 'https://www.tokyometro.jp/en/ticket/travel', 'Tokyo Metro (oficial) · compra online'],
    ['Osaka Amazing Pass (3.500 / 5.000)', 'https://osaka-amazing-pass.com/en/info.html', 'site oficial · compra online, QR no celular'],
    ['Kansai Area Pass (2.700 / 4.700 / 5.500)', 'https://www.japan-travel-kit.com/guides/attractions/kansai-area-pass', 'guia de terceiros, nov 2026 (conferido no site da JR West em 3 nov 2026)'],
    ['JR Tokyo Wide Pass (16.000, 3 dias)', 'https://www.japan-guide.com/e/e2361_06.html', 'japan-guide, 14 mar 2026']
  ];

  /* ---------- lê o roteiro: dias por cidade e viagens Tóquio ⇄ Osaka ---------- */
  function doRoteiro(S) {
    var por = {}; /* data -> cidade do último evento com ponto no mapa */
    (S.ev || []).slice().sort(function (a, b) { return (a.data + (a.hora || '')) < (b.data + (b.hora || '')) ? -1 : 1; }).forEach(function (e) {
      if (!e.local || !L || !L.cidadeDe || e.tipo === 'voo') return;
      var c = L.cidadeDe({ local: e.local });
      if (c && c !== 'Sem localização' && c !== 'Outros lugares') (por[e.data] = por[e.data] || []).push(c);
    });
    var datas = Object.keys(por).sort(), dias = {}, viagens = [], ult = null;
    datas.forEach(function (d) {
      var cs = {}; por[d].forEach(function (c) { cs[c] = 1; }); Object.keys(cs).forEach(function (c) { dias[c] = (dias[c] || 0) + 1; });
      por[d].forEach(function (c) {
        if (ult && ult.c !== c && ((ult.c === 'Tóquio' && c === 'Osaka') || (ult.c === 'Osaka' && c === 'Tóquio'))) viagens.push(d);
        ult = { c: c, d: d };
      });
    });
    return { dias: dias, viagens: viagens };
  }

  /* menor custo para cobrir n dias seguidos com bilhetes de 1, 2 ou 3 dias */
  function cobrir(n, tab) {
    var best = {}; best[0] = 0;
    for (var i = 1; i <= n; i++) {
      best[i] = Infinity;
      [1, 2, 3].forEach(function (k) { if (tab[k] != null) best[i] = Math.min(best[i], best[Math.max(0, i - k)] + tab[k]); });
    }
    return best[n];
  }
  function nivelJr(dias) { return dias <= 7 ? 7 : dias <= 14 ? 14 : dias <= 21 ? 21 : null; }

  /* ---------- cálculo ---------- */
  function calcular(v) {
    var shinUnit = v.lugar === 'livre' ? P.shin.livre : P.shin.reservado;
    var shin = v.viagens * shinUnit;
    var extras = v.extraValor * v.extraVezes;
    var metroTqAv = v.diasTq * v.gastoTq, metroOsAv = v.diasOs * v.gastoOs;
    var metroTqPass = cobrir(v.diasTq, P.metroTq), metroOsPass = cobrir(v.diasOs, P.osaka);
    var metroTq = Math.min(metroTqAv, metroTqPass), metroOs = Math.min(metroOsAv, metroOsPass);
    var nj = nivelJr(v.diasJr), jr = nj ? P.jr[nj] : null;
    var rows = [
      { nome: 'Tudo avulso', total: shin + extras + metroTqAv + metroOsAv, nota: 'Shinkansen e metrô pagos a cada viagem.' },
      { nome: 'Shinkansen avulso + passes de metrô', total: shin + extras + metroTq + metroOs, nota: 'Usa o passe de metrô só onde ele sai mais barato que o avulso.' }
    ];
    if (jr != null) rows.push({ nome: 'JR Pass de ' + nj + ' dias', total: jr + metroTq + metroOs, nota: 'JR Pass não cobre metrô, então soma o metrô pelo menor custo. Viagens extras de trem JR ficam por conta do passe.' });
    var melhor = rows.reduce(function (a, b) { return b.total < a.total ? b : a; });
    return { rows: rows, melhor: melhor, shinUnit: shinUnit, jrNivel: nj, metroTq: [metroTqAv, metroTqPass], metroOs: [metroOsAv, metroOsPass] };
  }

  /* ---------- tela ---------- */
  var CHAVE = 'uniPassesCalc';
  function salvo() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function guarda(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) { } }
  function num(x, d) { x = parseFloat(x); return isFinite(x) && x >= 0 ? x : d; }

  function abrir(S, abrirDlg, raiz) {
    var r = doRoteiro(S), sv = salvo();
    var ini = S.ini && S.fim ? Math.max(1, Math.round((new Date(S.fim) - new Date(S.ini)) / 864e5) + 1) : 7;
    var sugJr = r.viagens.length >= 2 ? Math.max(1, Math.round((new Date(r.viagens[r.viagens.length - 1]) - new Date(r.viagens[0])) / 864e5) + 1) : 7;
    var def = {
      viagens: sv.viagens != null ? sv.viagens : r.viagens.length || 2,
      diasTq: sv.diasTq != null ? sv.diasTq : r.dias['Tóquio'] || 0,
      diasOs: sv.diasOs != null ? sv.diasOs : r.dias['Osaka'] || 0,
      gastoTq: sv.gastoTq != null ? sv.gastoTq : 600,
      gastoOs: sv.gastoOs != null ? sv.gastoOs : 500,
      diasJr: sv.diasJr != null ? sv.diasJr : sugJr,
      extraValor: sv.extraValor != null ? sv.extraValor : 0,
      extraVezes: sv.extraVezes != null ? sv.extraVezes : 0,
      lugar: sv.lugar || 'reservado'
    };
    function campo(id, rot, val, ajuda) {
      return '<label class="f" style="display:grid;gap:3px"><span>' + rot + '</span><input type="number" min="0" inputmode="numeric" id="' + id + '" value="' + val + '">' + (ajuda ? '<small class="nota">' + ajuda + '</small>' : '') + '</label>';
    }
    abrirDlg(
      '<div style="display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 style="margin:0">🚆 Vale a pena o passe?</h2><button type="button" class="btn sm" data-act="fechar">✕</button></div>' +
      '<p class="nota" style="margin:0">Compara com o seu roteiro. Os números abaixo vêm do calendário e você pode ajustar. Preços coletados em ' + P.data + '; <b>confira no site oficial antes de comprar</b>.</p>' +
      '<div id="psOut"></div><p class="nota" style="margin:0"><b>Ajuste os números:</b></p><div id="psIn" style="display:grid;gap:8px">' +
      campo('psVia', 'Viagens de Shinkansen Tóquio ⇄ Osaka (cada ida ou volta conta 1)', def.viagens, r.viagens.length ? 'Achei ' + r.viagens.length + ' pelo mapa dos seus eventos.' : 'Não achei no calendário (eventos com ponto no mapa em Tóquio e Osaka). Ajuste.') +
      '<label class="f" style="display:grid;gap:3px"><span>Assento</span><select id="psLug"><option value="reservado"' + (def.lugar === 'reservado' ? ' selected' : '') + '>Reservado (~¥14.700)</option><option value="livre"' + (def.lugar === 'livre' ? ' selected' : '') + '>Livre (~¥14.000)</option></select></label>' +
      campo('psDTq', 'Dias com metrô em Tóquio', def.diasTq, r.dias['Tóquio'] ? 'Calendário: ' + r.dias['Tóquio'] + ' dia(s) com eventos em Tóquio.' : '') +
      campo('psGTq', 'Gasto médio de metrô por dia em Tóquio (¥)', def.gastoTq, 'Chute meu (¥600): troque pelo seu. Não é dado oficial.') +
      campo('psDOs', 'Dias com metrô em Osaka', def.diasOs, r.dias['Osaka'] ? 'Calendário: ' + r.dias['Osaka'] + ' dia(s) com eventos em Osaka.' : '') +
      campo('psGOs', 'Gasto médio de metrô por dia em Osaka (¥)', def.gastoOs, 'Chute meu (¥500): troque pelo seu.') +
      campo('psDJr', 'Dias em que você usaria o JR Pass (do 1º ao último trecho)', def.diasJr, 'Ele vale dias seguidos. Cabe em 7, 14 ou 21.') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + campo('psEV', 'Outra viagem longa: valor (¥)', def.extraValor, 'Opcional: passagem avulsa de um trecho que o JR Pass cobriria.') + campo('psEN', 'Quantas vezes', def.extraVezes, '') + '</div>' +
      '</div>' +
      '<details><summary style="cursor:pointer;font-weight:700">Outros passes (só informação)</summary><div style="display:grid;gap:6px;margin-top:6px;font-size:14px">' +
      '<p style="margin:0"><b>Kansai Area Pass</b> (JR West): 1 dia ' + yen(P.kansaiArea[1]) + ', 2 dias ' + yen(P.kansaiArea[2]) + ', 3 dias ' + yen(P.kansaiArea[3]) + '. Só trens JR em Osaka, Quioto, Kobe, Nara e região. <b>Não cobre o Shinkansen nem o metrô de Osaka.</b> Serve para bate-volta de um dia.</p>' +
      '<p style="margin:0"><b>JR Tokyo Wide Pass</b>: ' + yen(P.tokyoWide) + ' por 3 dias seguidos, trens JR East (Fuji, Nikko, Karuizawa…). <b>Não cobre o Tokaido Shinkansen</b> (Tóquio–Osaka). Só compensa se você fizer esses passeios nos mesmos 3 dias.</p></div></details>' +
      '<details><summary style="cursor:pointer;font-weight:700">Fontes dos preços</summary><ul style="margin:6px 0 0;padding-left:18px;font-size:13px">' + FONTES.map(function (f) { return '<li><a href="' + f[1] + '" target="_blank" rel="noopener">' + esc(f[0]) + '</a> · ' + esc(f[2]) + '</li>'; }).join('') + '</ul>' +
      '<p class="nota">Dúvida que eu não resolvi: se o JR Pass cobre o Nozomi (o trem mais rápido) ou só o Hikari e o Kodama. As fontes de hoje não dizem. Confira no site oficial; o Hikari leva ~3 h contra ~2h30 do Nozomi.</p></details></div>');
    function ler() {
      var v = {
        viagens: num(raiz.querySelector('#psVia').value, 0), lugar: raiz.querySelector('#psLug').value,
        diasTq: num(raiz.querySelector('#psDTq').value, 0), gastoTq: num(raiz.querySelector('#psGTq').value, 0),
        diasOs: num(raiz.querySelector('#psDOs').value, 0), gastoOs: num(raiz.querySelector('#psGOs').value, 0),
        diasJr: num(raiz.querySelector('#psDJr').value, 7), extraValor: num(raiz.querySelector('#psEV').value, 0), extraVezes: num(raiz.querySelector('#psEN').value, 0)
      };
      return v;
    }
    function desenha() {
      var v = ler(); guarda(v); var c = calcular(v);
      var sem = c.rows.length < 3 ? '<p class="nota">Com mais de 21 dias de uso o JR Pass não cabe em um só passe.</p>' : '';
      raiz.querySelector('#psOut').innerHTML = '<div style="display:grid;gap:8px">' + c.rows.map(function (x) {
        var top = x === c.melhor;
        return '<div style="border:1.5px solid ' + (top ? '#2f7d5b' : '#ecdadd') + ';background:' + (top ? '#eaf6ef' : '#fff') + ';border-radius:14px;padding:10px 12px"><div style="display:flex;justify-content:space-between;gap:8px"><b>' + (top ? '✅ ' : '') + esc(x.nome) + '</b><b>' + yen(x.total) + '</b></div><small class="nota">' + esc(x.nota) + '</small></div>';
      }).join('') + sem +
        '<p class="nota" style="margin:0">Mais barato pelas suas contas: <b>' + esc(c.melhor.nome) + '</b>. ' + (c.rows.length > 1 ? 'Diferença para o mais caro: ' + yen(Math.max.apply(null, c.rows.map(function (x) { return x.total; })) - c.melhor.total) + '.' : '') + '</p>' +
        '<p class="nota" style="margin:0">Metrô em Tóquio: avulso ' + yen(c.metroTq[0]) + ' · Tokyo Subway Ticket ' + yen(c.metroTq[1]) + '. Metrô em Osaka: avulso ' + yen(c.metroOs[0]) + ' · Osaka Amazing Pass ' + yen(c.metroOs[1]) + '. É uma conta de ordem de grandeza: não inclui ônibus, táxi nem bate-voltas que você não informou. O JR Pass também vale nos trens JR dentro das cidades (como a Yamanote), o que pode reduzir o seu gasto de metrô, e eu não contei isso.</p></div>';
    }
    raiz.querySelector('#psIn').addEventListener('input', desenha);
    desenha();
  }
  window.CalPasses = { abrir: abrir, calcular: calcular, doRoteiro: doRoteiro, P: P };
})();
