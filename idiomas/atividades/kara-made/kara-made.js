/* Unirversos · Atividades ✦ — から e まで (N5): lacunas, leitura de placa (V/F) e montar a frase, com correção automática.
   Conteúdo: Firestore biblioteca/karamade (só liberados leem; o repositório é público).
   Respostas: Firestore atividades/{e-mail} → { karamade: { r: {...}, acertos, total, m } }. Só grava ao tocar em "Verificar". */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ID = 'karamade';
const PROFS = ['unirversos.idiomas@gmail.com'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
/* compara frases sem ligar para espaços, números largos/estreitos e pontuação final */
const norm = s => String(s || '').replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 0xFEE0)).replace(/[\s　、,。.！!]/g, '').trim();

let verTradPlaca = false, C = null, R = {}, alvo = '', souProf = false, liberado = false, conferido = false, modoDig = {};
const total = () => C.lacunas.length + C.vf.length + C.montar.length;

/* ---------- respostas e correção ---------- */
const certoLac = (q, i) => (R['l' + i] || []).length === q.r.length && q.r.every((r, k) => (R['l' + i] || [])[k] === r);
const certoVf = (q, i) => R['v' + i] === q.r;
const certoMon = (q, i) => { const a = norm(R['m' + i]); return !!a && q.r.some(r => norm(r) === a); };
const respondida = k => { const v = R[k]; return Array.isArray(v) ? v.some(Boolean) : v !== undefined && v !== ''; };
function contagem(){
  const resp = C.lacunas.filter((q, i) => (R['l' + i] || []).filter(Boolean).length === q.r.length).length
    + C.vf.filter((q, i) => R['v' + i] !== undefined).length + C.montar.filter((q, i) => !!(R['m' + i] || '').trim()).length;
  const ac = C.lacunas.filter(certoLac).length + C.vf.filter(certoVf).length + C.montar.filter(certoMon).length;
  return { resp, ac };
}
function pintaProg(){
  const { resp } = contagem(), t = total();
  $('pr-t').innerHTML = `<span>Progresso</span><span><b>${resp} de ${t}</b> respondidas</span>`;
  $('pr-b').style.width = (100 * resp / t) + '%';
}

/* ---------- desenho ---------- */
const trad = (q, k) => `<p class="ro">${esc(q.ro || '')}</p><p class="tr">${esc(q.pt)} <i>· ${esc(q.en)}</i></p>`;
function lacuna(q, i){
  let b = 0;
  const partes = q.p.map(t => t === '_' ? (() => { const k = b++, v = (R['l' + i] || [])[k] || '';
    const cls = conferido ? (v === q.r[k] ? ' ok' : ' erro') : '';
    return `<select class="lac${cls}" data-l="${i}" data-k="${k}" aria-label="Lacuna ${k + 1}" ${souProf ? 'disabled' : ''}><option value="">(　)</option>${['から', 'まで'].map(o => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select>`; })() : `<span>${esc(t)}</span>`).join(' ');
  const st = conferido ? (certoLac(q, i) ? 'ok' : 'erro') : '';
  return `<div class="q ${st}"><div class="jp" lang="ja">${i + 1}. ${partes}</div>${trad(q)}<button type="button" class="ver" data-ro>ver romaji</button>${st ? `<p class="fb ${st}">${st === 'ok' ? '✓ Certo' : '✗ Resposta: ' + esc(q.r.join(' … '))}</p>` : ''}</div>`;
}
function verdFalso(q, i){
  const v = R['v' + i], st = conferido && v !== undefined ? (certoVf(q, i) ? 'ok' : 'erro') : conferido ? 'erro' : '';
  const bt = (val, t) => { let c = v === val ? ' on' : ''; if (conferido && v === val) c = certoVf(q, i) ? ' ok' : ' erro'; return `<button type="button" class="${c.trim()}" data-v="${i}" data-val="${val}" ${souProf ? 'disabled' : ''}>${t}</button>`; };
  return `<div class="q ${st}"><div class="jp" lang="ja">${i + 1}. ${esc(q.jp)}</div>${trad(q)}<button type="button" class="ver" data-ro>ver romaji</button>
    <div class="vf">${bt(true, 'Verdadeiro')}${bt(false, 'Falso')}</div>${st ? `<p class="fb ${st}">${st === 'ok' ? '✓ Certo' : `✗ É ${q.r ? 'Verdadeiro' : 'Falso'}${q.porque ? '. ' + esc(q.porque) : ''}`}</p>` : ''}</div>`;
}
/* blocos usados guardados como índices, para o mesmo texto repetido funcionar */
const usados = i => (R['mb' + i] || []);
function montar(q, i){
  const st = conferido ? (certoMon(q, i) ? 'ok' : 'erro') : '', dig = modoDig[i];
  const corpo = dig
    ? `<input class="dig" lang="ja" data-dig="${i}" value="${esc(R['m' + i] || '')}" placeholder="Digite a frase em japonês" ${souProf ? 'readonly' : ''}>`
    : `<div class="alvo" data-alvo="${i}">${usados(i).map((b, k) => `<button type="button" class="bl" data-tira="${i}" data-k="${k}" lang="ja" ${souProf ? 'disabled' : ''}>${esc(q.blocos[b])}</button>`).join('')}</div>
       <div class="blocos">${q.blocos.map((t, b) => `<button type="button" class="bl" data-poe="${i}" data-b="${b}" lang="ja" ${usados(i).includes(b) || souProf ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>`;
  return `<div class="q ${st}"><p style="margin:0;font-weight:700">${i + 1}. “${esc(q.pt)}”</p><p class="tr" style="margin:0"><i>${esc(q.en)}</i></p>
    <p class="dica" style="margin-top:8px">💡 ${esc(q.dica)}</p>${corpo}
    ${souProf ? '' : `<button type="button" class="modo" data-modo="${i}">${dig ? '🧩 Prefiro montar com blocos' : '⌨️ Prefiro digitar'}</button>`}
    ${st ? `<p class="fb ${st}">${st === 'ok' ? '✓ Certo' : '✗ Uma resposta certa: <span lang="ja">' + esc(q.r[0]) + '</span>'}</p>` : ''}</div>`;
}
function pinta(){
  const p = C.placa;
  $('conteudo').innerHTML = `
    <div class="resumo"><div class="rs" style="--c:var(--lav)"><b lang="ja">から</b>kara<p>Indica o <b style="font-size:inherit;font-family:inherit;color:inherit">ponto de partida</b> no tempo ou no espaço: “de…”, “a partir de…”.</p></div>
      <div class="rs" style="--c:var(--pink)"><b lang="ja">まで</b>made<p>Indica o <b style="font-size:inherit;font-family:inherit;color:inherit">limite ou destino</b> no tempo ou no espaço: “até…”.</p></div></div>
    <p class="dica">💡 Os dois podem vir juntos na mesma frase (<span lang="ja">9じから 5じまで</span>, das 9 às 5) ou separados, conforme o que você quer destacar.</p>
    <div class="prog" aria-live="polite"><div class="prog-t" id="pr-t"></div><div class="prog-b"><i id="pr-b"></i></div></div>
    <section class="sec" style="--c:var(--lav)"><div class="sec-h"><span class="n">01</span><h2>Aquecimento: complete as lacunas</h2></div>
      <p class="inst">Escolha <b lang="ja">から</b> ou <b lang="ja">まで</b> em cada lacuna.</p>${C.lacunas.map(lacuna).join('')}</section>
    <section class="sec" style="--c:var(--gold)"><div class="sec-h"><span class="n">02</span><h2>Contexto real: leia a placa</h2></div>
      <p class="inst">Veja o horário de uma cafeteria em Tóquio e marque Verdadeiro ou Falso.</p>
      <div class="placa${verTradPlaca ? ' com-trad' : ''}"><div class="tp">☕ <span lang="ja">${esc(p.nome)}</span> · ${esc(p.sub)}</div><h3 lang="ja">${esc(p.tit)}</h3>
        <table>${p.linhas.map(l => `<tr><td><span lang="ja">${esc(l[0])}</span><small class="trd">${esc(l[1])}</small></td><td class="h" lang="ja">${esc(l[2])}</td></tr>`).join('')}</table><button type="button" class="ver" data-trp>${verTradPlaca ? 'ocultar tradução' : 'ver tradução'}</button></div>
      ${C.vf.map(verdFalso).join('')}</section>
    <section class="sec" style="--c:var(--terra)"><div class="sec-h"><span class="n">03</span><h2>Desafio: monte a frase em japonês</h2></div>
      <p class="inst">Toque nos blocos na ordem certa (ou digite, se preferir). Tem blocos sobrando de propósito.</p>${C.montar.map(montar).join('')}</section>
    <div id="nota"></div>
    <div class="fim">${souProf ? '<span class="salvo">Você está vendo as respostas do aluno (só leitura).</span>' : `<button type="button" class="btn" id="verifica">✓ Verificar respostas</button><button type="button" class="btn claro" id="refaz">↺ Refazer</button><span class="salvo" id="st" aria-live="polite"></span>`}</div>
    <p style="margin-top:18px"><a class="btn claro" href="/idiomas/atividades/" style="display:inline-block;text-decoration:none">← Voltar para a sala de atividades</a></p>`;
  pintaProg(); pintaNota();
  if ($('verifica')) $('verifica').onclick = verifica;
  if ($('refaz')) $('refaz').onclick = () => { if (!confirm('Apagar as respostas e começar de novo?')) return; R = {}; conferido = false; pinta(); guarda(); };
}
function pintaNota(){
  if (!conferido) { $('nota').innerHTML = ''; return; }
  const { ac } = contagem(), t = total();
  $('nota').innerHTML = `<div class="nota"><b>${ac} de ${t}</b> certas. ${ac === t ? 'Perfeito! 🎉' : 'Veja as correções em cada questão e tente de novo.'}</div>`;
}

/* ---------- chuva de sakura (ao acertar) ---------- */
function chuvaSakura(n){
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  if (!document.getElementById('sk-css')) {
    const st = document.createElement('style'); st.id = 'sk-css';
    st.textContent = '.sk-box{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60}.sk-p{position:absolute;top:-30px;background:linear-gradient(135deg,#f9c9d8,#ef8fae);border-radius:150% 0 150% 0;opacity:.9;animation:skCai linear forwards}@keyframes skCai{0%{transform:translate3d(0,0,0) rotate(0)}100%{transform:translate3d(var(--dx),110vh,0) rotate(var(--rot))}}';
    document.head.appendChild(st);
  }
  const box = document.createElement('div'); box.className = 'sk-box'; box.setAttribute('aria-hidden', 'true');
  let fim = 0;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), t = 3 + Math.random() * 3, d = Math.random() * 1.8, w = 9 + Math.random() * 10;
    p.className = 'sk-p'; fim = Math.max(fim, t + d);
    p.style.cssText = `left:${Math.random() * 100}%;width:${w}px;height:${w * .75}px;animation-duration:${t}s;animation-delay:${d}s;--dx:${(Math.random() * 160 - 80)}px;--rot:${(Math.random() * 720 - 360)}deg`;
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), (fim + .5) * 1000);
}

/* ---------- interação (só o aluno) ---------- */
$('conteudo').addEventListener('change', e => {
  const s = e.target.closest('select.lac'); if (!s || souProf) return;
  const i = +s.dataset.l, k = +s.dataset.k, a = (R['l' + i] || []).slice(); a[k] = s.value; R['l' + i] = a; mexeu(false);
});
$('conteudo').addEventListener('input', e => {
  const d = e.target.closest('[data-dig]'); if (!d || souProf) return; R['m' + d.dataset.dig] = d.value; R['mb' + d.dataset.dig] = []; mexeu(false);
});
$('conteudo').addEventListener('click', e => {
  if (e.target.closest('[data-ro]')) { e.target.closest('.q').classList.toggle('vis'); const b = e.target.closest('[data-ro]'); b.textContent = b.textContent === 'ver romaji' ? 'ocultar romaji' : 'ver romaji'; return; }
  const tp = e.target.closest('[data-trp]'); if (tp) { verTradPlaca = !verTradPlaca; tp.closest('.placa').classList.toggle('com-trad', verTradPlaca); tp.textContent = verTradPlaca ? 'ocultar tradução' : 'ver tradução'; return; }
  if (souProf) return;
  const v = e.target.closest('[data-v]'); if (v) { R['v' + v.dataset.v] = v.dataset.val === 'true'; return mexeu(); }
  const po = e.target.closest('[data-poe]'); if (po) { const i = +po.dataset.poe; R['mb' + i] = usados(i).concat(+po.dataset.b); R['m' + i] = R['mb' + i].map(b => C.montar[i].blocos[b]).join(' '); return mexeu(); }
  const ti = e.target.closest('[data-tira]'); if (ti) { const i = +ti.dataset.tira; R['mb' + i] = usados(i).filter((_, k) => k !== +ti.dataset.k); R['m' + i] = R['mb' + i].map(b => C.montar[i].blocos[b]).join(' '); return mexeu(); }
  const mo = e.target.closest('[data-modo]'); if (mo) { const i = +mo.dataset.modo; modoDig[i] = !modoDig[i]; pinta(); }
});
/* mudou uma resposta: a correção antiga some até verificar de novo; o rascunho fica no aparelho */
function mexeu(repinta = true){
  if (conferido) { conferido = false; repinta = true; }
  guardaLocal(); if (repinta) pinta(); else pintaProg();
}
const chaveLocal = () => 'uniAtiv:' + ID + ':' + alvo;
const guardaLocal = () => { try { localStorage.setItem(chaveLocal(), JSON.stringify({ r: R, m: Date.now() })); } catch (e) {} };
async function guarda(){
  guardaLocal();
  const { ac } = contagem();
  try { await setDoc(doc(db, 'atividades', alvo), { [ID]: { r: R, acertos: conferido ? ac : null, total: total(), conferido, m: Date.now() } }, { merge: true }); return true; }
  catch (e) { console.warn(e); return false; }
}
async function verifica(){
  conferido = true; pinta();
  { const { ac } = contagem(), t = total(); if (ac > 0) chuvaSakura(ac === t ? 80 : Math.min(40, 8 + ac * 3)); }
  $('st').textContent = 'salvando…';
  $('st').textContent = (await guarda()) ? 'salvo ✓ a professora vê o resultado' : '⚠️ não salvou na nuvem · guardado neste aparelho';
  $('nota').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- quem está vendo ---------- */
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
/* "✎ Eu (testar)": a professora faz a atividade como aluna, na própria conta, sem misturar com os alunos */
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
