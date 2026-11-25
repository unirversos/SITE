/* Unirversos · Sala de atividades — lista das Atividades Unirversos (material exclusivo).
   Acesso: professora, ou quem tem o documento atividades/{e-mail} (a professora libera na ficha do aluno).
   Só LÊ do Firestore (nada é gravado aqui). Para incluir outra atividade, acrescente uma linha em ATIVIDADES. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* id = o mesmo id usado no Firestore (atividades/{e-mail} → { [id]: respostas }); livro = documento biblioteca/{livro} com os itens */
/* ícones pelo Quadrado Elemental: 🔥 gramática (as peças) · 💧 vocabulário (o radar) · 🌬️ leitura · 🌱 kanji (materializar) */
const ATIVIDADES = [
  { id: 'n2gram', livro: 'n2gram', num: '01', ic: '🔥', s: '#fbf1de', jp: '文法 N2', cur: 'Gramática N2 · 8 semanas', nivel: 'N2', t: 'Gramática N2 · 8 semanas', d: 'Uma estrutura por vez: entenda a nuance, veja o exemplo e escreva a sua frase.', url: '/idiomas/atividades/gramatica-n2/', cor: 'var(--gold)' },
  { id: 'n2voc', livro: 'n2voc', num: '05', ic: '💧', s: '#f8e6de', jp: '語彙 N2', cur: 'Vocabulário N2 · 8 semanas', nivel: 'N2', t: 'Vocabulário N2 · 8 semanas', d: '48 palavras do 総まとめ N2: nuance, exemplo e a sua frase, com correção da professora.', url: '/idiomas/atividades/vocabulario-n2/', cor: 'var(--pink)' },
  { id: 'n2kanji', livro: 'n2kanji', num: '07', ic: '🌱', s: '#e8efe8', jp: '漢字 N2', cur: 'Kanji N2 · 8 semanas', nivel: 'N2', t: 'Kanji N2 · 8 semanas', d: '96 kanji do 総まとめ N2 漢字: leituras, palavras-chave, exemplo e a sua frase.', url: '/idiomas/atividades/kanji-n2/', cor: 'var(--sage)' },
  { id: 'n2dokkai', livro: 'n2dokkai', num: '06', ic: '🌬️', s: '#f3f0fa', jp: '読解 N2', cur: 'Leitura N2 · 6 semanas', nivel: 'N2', t: 'Leitura N2 · 6 semanas', d: '42 lições do 総まとめ N2 読解: estratégia do dia, acertos, tempo e a sua síntese.', url: '/idiomas/atividades/dokkai-n2/', cor: 'var(--lav)' },
  { id: 'n3gram', livro: 'n3gram', num: '08', ic: '🔥', s: '#f8e6de', jp: '文法 N3', cur: 'Gramática N3 · 6 semanas', nivel: 'N3', t: 'Gramática N3 · 6 semanas', d: '103 estruturas do 総まとめ N3 文法: nuance, exemplo e a sua frase, com correção da professora.', url: '/idiomas/atividades/gramatica-n3/', cor: 'var(--terra)' },
  { id: 'n3voc', livro: 'n3voc', num: '09', ic: '💧', s: '#f8e6de', jp: '語彙 N3', cur: 'Vocabulário N3 · 6 semanas', nivel: 'N3', t: 'Vocabulário N3 · 6 semanas', d: '108 palavras do 総まとめ N3 語彙: nuance, exemplo e a sua frase, com correção da professora.', url: '/idiomas/atividades/vocabulario-n3/', cor: 'var(--terra)' },
  { id: 'n3kanji', livro: 'n3kanji', num: '10', ic: '🌱', s: '#f8e6de', jp: '漢字 N3', cur: 'Kanji N3 · 6 semanas', nivel: 'N3', t: 'Kanji N3 · 6 semanas', d: '108 kanji do 総まとめ N3 漢字: leituras on/kun, palavras-chave e a sua frase.', url: '/idiomas/atividades/kanji-n3/', cor: 'var(--terra)' },
  { id: 'n3dokkai', livro: 'n3dokkai', num: '11', ic: '🌬️', s: '#f8e6de', jp: '読解 N3', cur: 'Leitura N3 · 6 semanas', nivel: 'N3', t: 'Leitura N3 · 6 semanas', d: '42 textos do 総まとめ N3 読解 com questão, gabarito comentado e vocabulário.', url: '/idiomas/atividades/dokkai-n3/', cor: 'var(--terra)' },
  { id: 'n4gram', livro: 'n4gram', num: '12', ic: '🔥', s: '#fbf1de', jp: '文法 N4', cur: 'Gramática N4 · 32 histórias', nivel: 'N4', t: 'Gramática N4 · 32 histórias', d: '81 estruturas do にほんごチャレンジ N4, história por história: nuance, exemplo e a sua frase.', url: '/idiomas/atividades/gramatica-n4/', cor: 'var(--gold)' },
  { id: 'n4dokkai', livro: 'n4dokkai', num: '13', ic: '🌬️', s: '#fbf1de', jp: '読解 N4', cur: 'Leitura N4 · 16 exercícios', nivel: 'N4', t: 'Leitura N4 · 16 exercícios', d: '16 exercícios de leitura N4 com questão, gabarito e explicação.', url: '/idiomas/atividades/dokkai-n4/', cor: 'var(--gold)' },
  { id: 'n5voc', livro: 'n5voc', num: '14', ic: '💧', s: '', jp: '語彙 N5', cur: 'Vocabulário N5 · 5 módulos', nivel: 'N5', t: 'Vocabulário N5 · 5 módulos', d: '100 palavras essenciais do N5, lição por lição: nuance, exemplo e a sua frase.', url: '/idiomas/atividades/vocabulario-n5/', cor: '' },
  { id: 'n5kanji', livro: 'n5kanji', num: '15', ic: '🌱', s: '', jp: '漢字 N5', cur: 'Kanji N5 · 6 módulos', nivel: 'N5', t: 'Kanji N5 · 6 módulos', d: 'Os kanji do N5 com leituras on/kun, palavras-chave e a sua frase.', url: '/idiomas/atividades/kanji-n5/', cor: '' },
  { id: 'n4voc', livro: 'n4voc', num: '16', ic: '💧', s: '', jp: '語彙 N4', cur: 'Vocabulário N4 · 4 módulos', nivel: 'N4', t: 'Vocabulário N4 · 4 módulos', d: '100 palavras do にほんごチャレンジ ことば N4: nuance, exemplo e a sua frase.', url: '/idiomas/atividades/vocabulario-n4/', cor: '' },
  { id: 'n1voc', livro: 'n1voc', num: '17', ic: '💧', s: '', jp: '語彙 N1', cur: 'Vocabulário N1 · 8 semanas', nivel: 'N1', t: 'Vocabulário N1 · 8 semanas', d: '96 palavras do 総まとめ N1 語彙: nuance, exemplo e a sua frase.', url: '/idiomas/atividades/vocabulario-n1/', cor: '' },
  { id: 'n1gram', livro: 'n1gram', num: '18', ic: '🔥', s: '', jp: '文法 N1', cur: 'Gramática N1 · 8 semanas', nivel: 'N1', t: 'Gramática N1 · 8 semanas', d: '96 estruturas do 総まとめ N1 文法: nuance, exemplo e a sua frase.', url: '/idiomas/atividades/gramatica-n1/', cor: '' },
  { id: 'n1kanji', livro: 'n1kanji', num: '19', ic: '🌱', s: '', jp: '漢字 N1', cur: 'Kanji N1 · 8 semanas', nivel: 'N1', t: 'Kanji N1 · 8 semanas', d: '96 kanji do 総まとめ N1 漢字: leituras, palavras-chave e a sua frase.', url: '/idiomas/atividades/kanji-n1/', cor: '' },
  { id: 'n1dokkai', livro: 'n1dokkai', num: '20', ic: '🌬️', s: '', jp: '読解 N1', cur: 'Leitura N1 · 8 semanas', nivel: 'N1', t: 'Leitura N1 · 8 semanas', d: '48 textos do 総まとめ N1 読解 com estratégia, questão, análise do gabarito e vocabulário.', url: '/idiomas/atividades/dokkai-n1/', cor: '' },
  { id: 'n1drill', livro: 'n1drill', num: '21', ic: '🔥', s: '', jp: 'パワードリル N1', cur: 'Power Drill N1 · 30 sessões', nivel: 'N1', t: 'Power Drill N1 · 30 sessões', d: 'Cronograma das 30 sessões do 日本語パワードリル N1 文法: pontos, tempo e anotações de erros.', url: '/idiomas/atividades/power-drill-n1/', cor: '' },
  { id: 'n1drillx', livro: 'n1drillx', num: '22', ic: '🔥', s: '', jp: '集中トレーニング N1', cur: 'Power Drill N1 · Treino intensivo', nivel: 'N1', t: 'Power Drill N1 · Treino intensivo', d: '30 estruturas dos blocos 集中①〜⑩: nuance, exemplo do livro e a sua frase.', url: '/idiomas/atividades/power-drill-n1-treino/', cor: '' },
  { id: 'verbos', livro: 'verbos', num: '02', ic: '🏃', s: '#e8efe8', jp: '他動詞と自動詞', cur: 'Verbos transitivos e intransitivos', nivel: 'N5–N3', t: 'Verbos transitivos e intransitivos', d: '75 pares (150 verbos): compare 他動詞 e 自動詞, veja o exemplo e escreva a sua frase.', url: '/idiomas/atividades/verbos/', cor: 'var(--sage)', por: 2 },
  { id: 'adjetivos', livro: 'adjetivos', num: '03', ic: '☯️', s: '#f8e6de', jp: '形容詞と反対語', cur: 'Adjetivos e opostos', nivel: 'N5–N2', t: 'Adjetivos e opostos', d: '60 pares (120 adjetivos い e な): um adjetivo e o seu oposto, com exemplo e a sua frase.', url: '/idiomas/atividades/adjetivos/', cor: 'var(--terra)', por: 2 },
  { id: 'karamade', livro: 'karamade', num: '04', ic: '🔥', s: '#f3f0fa', jp: '「から」と「まで」', cur: 'De onde, até onde', nivel: 'N5', t: 'から e まで', d: '11 questões com correção na hora: lacunas, leitura de placa e montar a frase.', url: '/idiomas/atividades/kara-made/', cor: 'var(--lav)', quiz: true }
];

/* mesma regra da galeria: "feito" só conta depois de aprovado pela professora */
const feita = r => r && ((r.st === 'feito' && r.ap) || r.st === 'dominado');

/* filtro de nível: "N5–N3" vale para N5, N4 e N3; a escolha fica guardada no aparelho */
const NIVEIS = ['N5', 'N4', 'N3', 'N2', 'N1'];
/* uma cor por nível; atividade com vários níveis fica com as cores de todos */
const COR = { N5: ['#517158', '#e8efe8'], N4: ['#a0712a', '#fbf1de'], N3: ['#b0583a', '#f8e6de'], N2: ['#c23f5e', '#f9e3e8'], N1: ['#6f5fa8', '#f3f0fa'] };
const faixa = (l, k) => l.length === 1 ? COR[l[0]][k] : `linear-gradient(90deg,${l.map(n => COR[n][k]).join(',')})`;
const niveisDe = a => { const m = a.nivel.match(/N(\d)(?:\s*[–-]\s*N(\d))?/); if (!m) return []; const x = +m[1], y = +(m[2] || m[1]);
  return NIVEIS.filter(n => { const k = +n[1]; return k <= Math.max(x, y) && k >= Math.min(x, y); }); };
let nivel = (() => { try { return localStorage.getItem('uniAtivNivel') || ''; } catch (e) { return ''; } })();
let ultimo = null;
function pintaFiltro(){
  $('niv').innerHTML = ['', ...NIVEIS].map(n => `<button type="button" class="chip${nivel === n ? ' on' : ''}" data-n="${n}" aria-pressed="${nivel === n}"${n ? ` style="--nc:${COR[n][0]};--ns:${COR[n][1]}"` : ''}>${n || 'Todos'}</button>`).join('');
}
$('niv').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; nivel = b.dataset.n; try { localStorage.setItem('uniAtivNivel', nivel); } catch (er) {} pintaFiltro(); if (ultimo) pinta(...ultimo); };
pintaFiltro();

function pinta(liberado, souProf, resp, totais){
  ultimo = [liberado, souProf, resp, totais];
  /* em ordem de nível, do N5 ao N1 (a de vários níveis entra pelo mais básico) */
  const ordem = a => { const n = niveisDe(a); return n.length ? NIVEIS.indexOf(n[0]) : 9; };
  /* dentro do nível, a ordem do Quadrado: 🔥 gramática, 💧 vocabulário, 🌱 kanji, 🌬️ leitura, depois os extras */
  const tipo = a => /gram$/.test(a.id) ? 0 : /voc$/.test(a.id) ? 1 : /kanji$/.test(a.id) ? 2 : /dokkai$/.test(a.id) ? 3 : /drill/.test(a.id) ? 4 : 5;
  const lista = ATIVIDADES.filter(a => !nivel || niveisDe(a).includes(nivel)).map((a, k) => [a, k]).sort((x, y) => (nivel ? 0 : ordem(x[0]) - ordem(y[0])) || tipo(x[0]) - tipo(y[0]) || x[1] - y[1]).map(x => x[0]);
  if (!lista.length) { $('lista').innerHTML = `<p class="vazio">Ainda não há atividades de ${esc(nivel)}. Em breve a sensei coloca aqui.</p>`; return; }
  const cardDe = a => {
    const trava = !liberado && !souProf, breve = !!a.breve;
    const R = resp[a.id] || {}, tot = totais[a.id] || 0;
    const feitas = a.quiz ? (R.acertos || 0) : Object.keys(R).filter(n => feita(R[n])).length;
    const pct = tot ? Math.round(feitas / tot * 100) : 0;
    const prog = !souProf && !trava && tot ? `<span class="pb" role="img" aria-label="${feitas} de ${tot} ${a.quiz ? 'certas' : 'feitas'}"><i style="width:${pct}%"></i></span>` : '';
    const tag = breve ? 'em breve' : trava ? '🔒' : esc(a.nivel);
    const corpo = `<span class="tag">${tag}</span><span class="ic" aria-hidden="true">${a.ic}</span><b class="n" lang="ja">${esc(a.jp)}</b><span class="d">${esc(a.cur)}</span>${prog}`;
    const nv = niveisDe(a).length ? niveisDe(a) : ['N5'];
    const at = `class="at${trava || breve ? ' lock' : ''}" style="--c:${COR[nv[0]][0]};--s:${COR[nv[0]][1]};--topo:${faixa(nv, 1)};--barra:${faixa(nv, 0)}" title="${esc(a.d)}"`;
    return trava || breve ? `<div ${at}>${corpo}</div>` : `<a ${at} href="${esc(a.url)}">${corpo}</a>`;
  };
  /* em "Todos": uma seção por nível, com título na cor do nível; filtrado: só os cards */
  if (nivel) { $('lista').className = 'lista'; $('lista').innerHTML = lista.map(cardDe).join(''); return; }
  const porNivel = NIVEIS.map(n => [n, lista.filter(a => (niveisDe(a)[0] || 'N5') === n)]).filter(x => x[1].length);
  $('lista').className = 'secoes';
  $('lista').innerHTML = porNivel.map(([n, l]) => `<section class="sec-n" style="--nc:${COR[n][0]};--ns:${COR[n][1]}">
    <h2 class="sec-t"><span class="sec-b">${n}</span><span class="sec-q">${l.length} ${l.length === 1 ? 'atividade' : 'atividades'}</span></h2>
    <div class="lista">${l.map(cardDe).join('')}</div></section>`).join('');
}

onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(), souProf = PROFS.includes(eu);
  let liberado = souProf, resp = {}, totais = {};
  if (!souProf) {
    try { const s = await getDoc(doc(db, 'atividades', eu)); liberado = s.exists(); resp = (s.exists() && s.data()) || {}; } catch (e) { console.warn(e); }
  }
  if (liberado && !souProf) {
    for (const a of ATIVIDADES) {
      try { const s = await getDoc(doc(db, 'biblioteca', a.livro)); if (s.exists()) { const it = JSON.parse(s.data().itens || '[]'); totais[a.id] = a.quiz ? (it.lacunas.length + it.vf.length + it.montar.length) : it.length * (a.por || 1); } } catch (e) { console.warn(e); }
    }
  }
  $('selo').hidden = false;
  $('selo').textContent = souProf ? '✦ Você está como professora' : liberado ? '✦ Acesso liberado' : '🔒 Acesso exclusivo para alunos';
  $('trava').innerHTML = liberado ? '' : '<div class="trava"><b>Estas atividades são dos alunos da Aline.</b>Peça acesso à sua professora. Ainda não é aluno? <a href="/idiomas/#planeta-utopia" style="color:var(--pink-d)">Veja as vagas abertas</a>.</div>';
  pinta(liberado, souProf, resp, totais);
});
