/* Unirversos · Atividades ✦ — 曜日: os dias da semana (N5). Guia dos 7 luminares, cards e jogo de 10 perguntas com correção na hora.
   Conteúdo: Firestore biblioteca/dias (só liberados leem; o repositório é público).
   Respostas: Firestore atividades/{e-mail} → { dias: { r: {...}, acertos, total, conferido, m } }. Só grava ao tocar em "Salvar resultado". */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ID = 'dias';
const PROFS = ['unirversos.idiomas@gmail.com'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
/* uma cor para cada astro */
const COR = { '月': 'var(--lav)', '火': 'var(--terra)', '水': '#3f7fa8', '木': 'var(--sage)', '金': 'var(--gold)', '土': '#8a6a4a', '日': 'var(--pink)' };
const corDe = t => { for (const k of String(t || '')) if (COR[k]) return COR[k]; return 'var(--line)'; };
const fala = t => { if (window.FraseJP) FraseJP.fala(t); };

let C = null, R = {}, alvo = '', souProf = false, liberado = false, conferido = false, aba = 'dias', virados = {};
const total = () => C.jogo.length;
const acertos = () => C.jogo.filter((q, i) => R['j' + i] === q.r).length;
const respondidas = () => C.jogo.filter((q, i) => R['j' + i] !== undefined).length;
/* ordem das alternativas embaralhada, mas sempre a mesma para cada pergunta */
const ordem = (n, i) => { const a = [...Array(n).keys()]; let s = i * 7 + 3; for (let k = n - 1; k > 0; k--) { s = (s * 9301 + 49297) % 233280; const j = s % (k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };

function guia(){
  const G = C.guia;
  return `<section class="sec" style="--c:var(--gold)"><div class="sec-h"><span class="n">01</span><h2>Guia: os 7 luminares (<span lang="ja">七曜</span>)</h2></div>
    <div class="intro">${G.intro.map(t => `<p>${esc(t)}</p>`).join('')}</div>
    <p class="inst" style="margin-top:16px">Toque em 🔊 para ouvir.</p>
    <div class="dias">${G.dias.map(d => `<div class="dia" style="--c:${corDe(d[2])}">
      <div class="kj"><span lang="ja">${esc(d[1])}</span><button type="button" class="som" data-fala="${esc(d[1])}" aria-label="Ouvir ${esc(d[1])}">🔊</button></div>
      <div class="le" lang="ja">${esc(d[3])} · ${esc(d[4])}</div><div class="pt">${esc(d[0])}</div>
      <div class="as">${esc(d[5])} · ${esc(d[6])} · <span lang="ja">${esc(d[7])}</span></div><p>${esc(d[8])}</p></div>`).join('')}</div>
    <details class="mito"><summary>🏛️ Paralelo mitológico: nórdico, greco-romano, védico e japonês</summary>
      <div class="mt">${G.mito.map(m => `<div style="--c:${corDe(m[1])}"><b>${esc(m[0])}</b> · <span lang="ja">${esc(m[1])}</span> · ${esc(m[2])}
        <small>Nórdica / inglês: ${esc(m[3])}</small><small>Greco-romana / latim: ${esc(m[4])}</small><small>Hindu / védica: ${esc(m[5])}</small><p style="margin:4px 0 0">💡 ${esc(m[6])}</p></div>`).join('')}</div></details>
    <p class="dica">💡 ${esc(G.sintese)}</p></section>`;
}
function cards(){
  const lista = C.cards.filter(c => c.g === aba);
  return `<section class="sec" style="--c:var(--lav)"><div class="sec-h"><span class="n">02</span><h2>Cards para memorizar</h2></div>
    <p class="inst">Olhe o kanji e tente lembrar a leitura e o significado. Depois toque no card para virar.</p>
    <div class="abas"><button type="button" class="chip${aba === 'dias' ? ' on' : ''}" data-aba="dias">Os 7 dias</button><button type="button" class="chip${aba === 'tempo' ? ' on' : ''}" data-aba="tempo">Hoje, amanhã, ontem…</button></div>
    <div class="cards">${lista.map(c => { const k = C.cards.indexOf(c), v = virados[k];
      return `<button type="button" class="fc" data-card="${k}" style="--c:${corDe(c.f)}"><span class="tt">${esc(c.t)}</span>
        ${v ? `<ul class="vr">${c.v.map(x => `<li>${esc(x)}</li>`).join('')}</ul><span class="rp">${esc(c.a)}<br>${esc(c.b)}</span>`
            : `<span class="fr" lang="ja">${esc(c.f)}</span><span class="vira">toque para virar ↻</span>`}</button>`; }).join('')}</div></section>`;
}
function pergunta(q, i){
  const v = R['j' + i], fim = conferido || v !== undefined, st = v === undefined ? '' : v === q.r ? 'ok' : 'erro';
  const ops = ordem(q.ops.length, i).map(o => { let c = v === o ? 'on' : ''; if (fim && o === q.r) c = 'ok'; else if (fim && v === o) c = 'erro';
    return `<button type="button" class="${c}" data-j="${i}" data-o="${o}" ${souProf ? 'disabled' : ''} lang="ja">${esc(q.ops[o])}</button>`; }).join('');
  return `<div class="q ${st}"><div class="cat">${i + 1} de ${total()} · ${esc(q.cat)} · ${esc(q.ast)}</div>
    <p style="margin:4px 0 0"><span class="kq" lang="ja">${esc(q.k)}</span>${esc(q.q)}</p><div class="op">${ops}</div>
    ${st ? `<p class="fb ${st}">${st === 'ok' ? '✓ Correto! 🎉' : '✗ Resposta certa: ' + esc(q.ops[q.r])}</p><p class="dc">💡 ${esc(q.dica)}</p>` : conferido ? `<p class="fb erro">Sem resposta. Certa: ${esc(q.ops[q.r])}</p>` : ''}</div>`;
}
function jogo(){
  return `<section class="sec" style="--c:var(--terra)"><div class="sec-h"><span class="n">03</span><h2>Jogo: desafio dos 7 luminares</h2></div>
    <p class="inst">Escolha uma alternativa: a correção aparece na hora. No fim, salve o resultado para a professora ver.</p>
    <div class="prog" aria-live="polite"><div class="prog-t" id="pr-t"></div><div class="prog-b"><i id="pr-b"></i></div></div>
    <div id="perg">${C.jogo.map(pergunta).join('')}</div><div id="nota"></div>
    <div class="fim">${souProf ? '<span class="salvo">Você está vendo as respostas do aluno (só leitura).</span>' : `<button type="button" class="btn" id="salva">✓ Salvar resultado</button><button type="button" class="btn claro" id="refaz">↺ Jogar de novo</button><span class="salvo" id="st" aria-live="polite"></span>`}</div></section>`;
}
function pinta(){
  $('conteudo').innerHTML = guia() + cards() + jogo();
  pintaProg();
  if ($('salva')) $('salva').onclick = salva;
  if ($('refaz')) $('refaz').onclick = () => { if (!confirm('Apagar as respostas e jogar de novo?')) return; R = {}; conferido = false; guarda(); pintaJogo(); };
}
const pintaJogo = () => { $('perg').innerHTML = C.jogo.map(pergunta).join(''); pintaProg(); };
const pintaCards = () => { const s = $('conteudo').querySelectorAll('section.sec')[1]; s.outerHTML = cards(); };
function pintaProg(){
  const r = respondidas(), t = total(), a = acertos();
  $('pr-t').innerHTML = `<span>Progresso</span><span><b>${r} de ${t}</b> respondidas · <b>${a}</b> certas</span>`;
  $('pr-b').style.width = (100 * r / t) + '%';
  $('nota').innerHTML = conferido ? `<div class="nota"><b>${a} de ${t}</b> certas. ${a === t ? 'Perfeito! 🎉' : 'Veja as dicas e tente de novo quando quiser.'}</div>` : '';
}

$('conteudo').addEventListener('click', e => {
  const f = e.target.closest('[data-fala]'); if (f) return fala(f.dataset.fala);
  const ab = e.target.closest('[data-aba]'); if (ab) { aba = ab.dataset.aba; return pintaCards(); }
  const c = e.target.closest('[data-card]'); if (c) { const k = +c.dataset.card; virados[k] = !virados[k]; if (!virados[k]) fala(C.cards[k].f); return pintaCards(); }
  const o = e.target.closest('[data-o]'); if (!o || souProf) return;
  const i = +o.dataset.j; if (R['j' + i] !== undefined) return; /* a primeira escolha vale, como na planilha */
  R['j' + i] = +o.dataset.o; if (conferido) conferido = false; guardaLocal(); pintaJogo();
});

const chaveLocal = () => 'uniAtiv:' + ID + ':' + alvo;
const guardaLocal = () => { try { localStorage.setItem(chaveLocal(), JSON.stringify({ r: R, m: Date.now() })); } catch (e) {} };
async function guarda(){
  guardaLocal();
  try { await setDoc(doc(db, 'atividades', alvo), { [ID]: { r: R, acertos: conferido ? acertos() : null, total: total(), conferido, m: Date.now() } }, { merge: true }); return true; }
  catch (e) { console.warn(e); return false; }
}
async function salva(){
  conferido = true; pintaJogo();
  $('st').textContent = 'salvando…';
  $('st').textContent = (await guarda()) ? 'salvo ✓ a professora vê o resultado' : '⚠️ não salvou na nuvem · guardado neste aparelho';
  $('nota').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- quem está vendo (igual ao から/まで) ---------- */
async function abre(email){
  alvo = email; R = {}; conferido = false; liberado = false; let nuvem = true;
  try { const s = await getDoc(doc(db, 'atividades', alvo)); liberado = s.exists() || TESTE; const d = (s.exists() && s.data()[ID]) || {}; R = d.r || {}; conferido = !!d.conferido;
    const L = (() => { try { return JSON.parse(localStorage.getItem(chaveLocal()) || 'null'); } catch (e) { return null; } })();
    if (!souProf && L && (L.m || 0) > (d.m || 0)) { R = L.r || {}; conferido = false; } }
  catch (e) { console.warn(e); nuvem = false; }
  const lib = $('lib'); if (lib) lib.remove();
  if (nuvem && !liberado) {
    $('conteudo').innerHTML = '';
    $('aviso').innerHTML = souProf
      ? '<div class="aviso" id="lib">Esta atividade ainda não foi liberada para este aluno. <button type="button" class="btn" id="lib-ok" style="margin-left:8px">Liberar para este aluno</button></div>'
      : '<p class="aviso" id="lib">✦ Atividade exclusiva. Peça acesso à sua professora.</p>';
    if ($('lib-ok')) $('lib-ok').onclick = async () => { $('lib-ok').disabled = true; try { await setDoc(doc(db, 'atividades', alvo), { liberado: new Date().toISOString() }, { merge: true }); abre(alvo); } catch (e) { $('lib-ok').textContent = 'Não consegui liberar'; } };
    return;
  }
  $('aviso').innerHTML = nuvem ? '' : '<p class="aviso">Sem conexão com a nuvem agora: o que você fizer fica salvo neste aparelho.</p>';
  if (!C) { $('aviso').innerHTML = '<p class="aviso">O conteúdo desta atividade ainda não foi carregado.</p>'; return; }
  pinta();
}
let TESTE = false;
onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(); souProf = PROFS.includes(eu);
  try { const s = await getDoc(doc(db, 'biblioteca', ID)); if (s.exists()) C = JSON.parse(s.data().itens || 'null'); } catch (e) { /* sem permissão */ }
  if (!souProf) { $('quem').innerHTML = ''; return abre(eu); }
  let alunos = [];
  try { alunos = (await getDocs(collection(db, 'aulas'))).docs.map(d => ({ id: d.id, nome: d.data().nome || d.id })).sort((a, b) => a.nome.localeCompare(b.nome)); } catch (e) {}
  const pedido = (new URLSearchParams(location.search).get('aluno') || '').toLowerCase();
  const ini = pedido || (alunos[0] && alunos[0].id) || eu;
  alunos = [{ id: eu, nome: '✎ Eu (testar)' }].concat(alunos.filter(a => a.id !== eu));
  const nomeDe = id => (alunos.find(a => a.id === id) || { nome: id }).nome;
  const modo = id => { const m = $('modo'); if (!m) return;
    m.innerHTML = id === eu ? '<b>✎ Você está testando como aluna.</b> As suas respostas ficam só na sua conta.'
      : `👁 Vendo as respostas de <b>${esc(nomeDe(id))}</b> (só leitura). Para responder, escolha “✎ Eu (testar)”.`; };
  const trocaAlvo = id => { TESTE = id === eu; souProf = !TESTE; modo(id); abre(id); };
  $('quem').innerHTML = `<span class="pill">Você está como professora</span><label for="al">Aluno:</label><select id="al">${alunos.map(a => `<option value="${esc(a.id)}"${a.id === ini ? ' selected' : ''}>${esc(a.nome)}</option>`).join('')}</select><p class="aviso" id="modo" style="flex-basis:100%;margin:6px 0 0"></p>`;
  $('al').onchange = () => { history.replaceState(null, '', '?aluno=' + encodeURIComponent($('al').value)); trocaAlvo($('al').value); };
  trocaAlvo(ini);
});
