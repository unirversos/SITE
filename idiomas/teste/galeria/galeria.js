/* Unirversos · Atividades ✦ — galeria de gramática (cards, flashcard, progresso).
   Modelo: window.UniAtividade (arquivo estático). Respostas: Firestore atividades/{e-mail} → { [atividade.id]: { [n]: {f, st, c, m} } }.
   Aluno escreve a frase e o status; a professora vê qualquer aluno (?aluno=e-mail) e escreve a correção. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com', 'li.kikuti@gmail.com'];
const A = window.UniAtividade, $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const ST = { pendente: 'A praticar', feito: 'Feito', corrigir: 'Corrigir', dominado: 'Dominado ✓' };
const DIA = n => n + '日目', SEM = n => '第' + n + '週';
const itens = A.itens.map((r, n) => ({ n, s: r[0], d: r[1], e: r[2], nu: r[3], x: r[4], tr: r[5] }));
let oculta = (() => { try { return localStorage.getItem('uniAtivOculta') !== '0'; } catch (e) { return true; } })(), abertosEx = new Set();
let R = {}, alvo = '', souProf = false, nuvem = true, filtro = { sem: 0, st: '', q: '' }, abertosPt = new Set();

$('tit').textContent = A.titulo; $('sub').textContent = A.sub;
const resp = n => R[n] || {};
/* o que é novo: correção que o aluno ainda não viu / frase que a professora ainda não viu (guardado no aparelho de cada um) */
let visto = {};
const chaveVisto = () => 'uniAtivVisto:' + (souProf ? 'prof:' : '') + A.id + ':' + alvo;
const leVisto = () => { try { visto = JSON.parse(localStorage.getItem(chaveVisto()) || '{}'); } catch (e) { visto = {}; } };
const marcaVisto = n => { visto[n] = Date.now(); try { localStorage.setItem(chaveVisto(), JSON.stringify(visto)); } catch (e) {} };
const novo = n => { const r = resp(n);
  return souProf ? !!(r.f || '').trim() && (r.fm || r.m || 0) > (visto[n] || 0) && r.st !== 'dominado'
                 : !!(r.c || '').trim() && (r.cm || 0) > (visto[n] || 0); };
const stDe = n => resp(n).st || (resp(n).f ? 'feito' : 'pendente');

/* ---------- guardar ---------- */
const chaveLocal = () => 'uniAtiv:' + A.id + ':' + alvo;
let liberado = false;
async function carrega(){
  R = {}; liberado = false;
  try { const s = await getDoc(doc(db, 'atividades', alvo)); liberado = s.exists(); R = (s.exists() && s.data()[A.id]) || {}; nuvem = true; }
  catch (e) { console.warn(e); nuvem = false; try { R = JSON.parse(localStorage.getItem(chaveLocal()) || '{}'); } catch (x) {} }
  $('aviso').innerHTML = nuvem ? '' : '<p class="aviso">Por enquanto, o que você escrever fica salvo só neste aparelho. Falta liberar o espaço de atividades no Firebase.</p>';
}
const fila = {};
function grava(n, campos, el){
  R[n] = Object.assign({}, resp(n), campos, { m: Date.now() });
  clearTimeout(fila[n]);
  if (el) el.textContent = 'salvando…';
  fila[n] = setTimeout(async () => {
    if (nuvem) {
      try { await setDoc(doc(db, 'atividades', alvo), { [A.id]: { [n]: R[n] } }, { merge: true }); if (el) el.textContent = 'salvo ✓'; }
      catch (e) { console.warn(e); nuvem = false; if (el) el.textContent = 'salvo neste aparelho'; }
    }
    if (!nuvem) { try { localStorage.setItem(chaveLocal(), JSON.stringify(R)); } catch (e) {} if (el) el.textContent = 'salvo neste aparelho'; }
    pintaNums();
  }, 700);
}

/* ---------- números e semanas ---------- */
function pintaNums(){
  const tot = itens.length, com = itens.filter(i => (resp(i.n).f || '').trim()).length;
  const cont = k => itens.filter(i => stDe(i.n) === k).length;
  $('nums').innerHTML = [
    ['Estruturas', tot, 'var(--ink)'], ['Com frase própria', com, 'var(--gold)'],
    ['A praticar', cont('pendente') + cont('corrigir'), 'var(--terra)'], ['Dominadas', cont('dominado'), 'var(--sage)']
  ].map(([t, v, c]) => `<div class="num" style="--c:${c}"><b>${v}</b><span>${t}</span></div>`).join('');
  const sems = [...new Set(itens.map(i => i.s))];
  $('sems').innerHTML = sems.map(s => {
    const da = itens.filter(i => i.s === s), ok = da.filter(i => ['feito', 'dominado'].includes(stDe(i.n))).length;
    return `<button type="button" class="sem${filtro.sem === s ? ' on' : ''}" data-sem="${s}" aria-pressed="${filtro.sem === s}">${SEM(s)}<small>${ok}/${da.length}</small><span class="tr"><i style="width:${Math.round(100 * ok / da.length)}%"></i></span></button>`;
  }).join('');
}
$('sems').onclick = e => { const b = e.target.closest('[data-sem]'); if (!b) return; const s = Number(b.dataset.sem); filtro.sem = filtro.sem === s ? 0 : s; pintaNums(); pintaCards(); };

/* ---------- filtros ---------- */
function pintaChips(){
  $('oc').textContent = oculta ? '👁 Mostrar explicações' : '🙈 Ocultar explicações'; $('oc').setAttribute('aria-pressed', oculta);
  const nn = itens.filter(i => novo(i.n)).length;
  $('chips').innerHTML = (nn ? `<button type="button" class="chip novas${filtro.st === 'novas' ? ' on' : ''}" data-st="novas">${souProf ? '✎ Para corrigir' : '✦ Correções novas'} (${nn})</button> ` : '') + [['', 'Todas'], ['pendente', 'A praticar'], ['feito', 'Feito'], ['corrigir', 'Corrigir'], ['dominado', 'Dominadas']]
    .map(([k, t]) => `<button type="button" class="chip${filtro.st === k ? ' on' : ''}" data-st="${k}">${t}</button>`).join(' ');
}
$('oc').onclick = () => { oculta = !oculta; abertosEx.clear(); try { localStorage.setItem('uniAtivOculta', oculta ? '1' : '0'); } catch (e) {} pintaChips(); pintaCards(); };
$('chips').onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; filtro.st = b.dataset.st; pintaChips(); pintaCards(); };
$('q').oninput = () => { filtro.q = $('q').value.trim().toLowerCase(); pintaCards(); };
const visiveis = () => itens.filter(i => (!filtro.sem || i.s === filtro.sem) && (!filtro.st || (filtro.st === 'novas' ? novo(i.n) : stDe(i.n) === filtro.st))
  && (!filtro.q || [i.e, i.nu, i.x, i.tr, resp(i.n).f].join(' ').toLowerCase().includes(filtro.q)));

/* ---------- cards ---------- */
function card(i){
  const r = resp(i.n), st = stDe(i.n), pt = abertosPt.has(i.n);
  const m = i.e.match(/^(.*?)\s*\(([^)]*)\)\s*$/), est = m ? m[1] : i.e, ro = m ? m[2] : '';
  const opcoes = (souProf ? Object.keys(ST) : ['pendente', 'feito', 'dominado'].concat(st === 'corrigir' ? ['corrigir'] : []))
    .map(k => `<option value="${k}"${k === st ? ' selected' : ''}>${ST[k]}</option>`).join('');
  const corr = souProf
    ? `<div class="corr"><label class="l" for="c${i.n}">CORREÇÃO DA PROFESSORA</label><textarea id="c${i.n}" data-c="${i.n}" rows="2" placeholder="Escreva a frase corrigida ou um comentário">${esc(r.c)}</textarea></div>`
    : (r.c ? `<div class="corr"><b>CORREÇÃO DA PROFESSORA</b><div style="white-space:pre-wrap">${esc(r.c)}</div></div>` : '');
  return `<article class="card s-${st}" data-n="${i.n}">
    <div class="top"><span>${SEM(i.s)} · ${DIA(i.d)}</span><span>${novo(i.n) ? `<button type="button" class="novo" data-visto="${i.n}" title="Marcar como visto">${souProf ? 'frase nova · ✓ vi' : 'nova correção · ✓ vi'}</button> ` : ''}<span class="pill p-${st}">${ST[st]}</span></span></div>
    <h3><span lang="ja">${esc(est)}</span> ${ro ? `<small>${esc(ro)}</small>` : ''}</h3>
    ${oculta && !abertosEx.has(i.n) ? `<button type="button" class="verex" data-ex="${i.n}">👁 ver explicação</button>` : `<p class="nu">${esc(i.nu)}</p>
    <div class="ex"><button type="button" class="som" data-som="${i.n}" aria-label="Ouvir o exemplo">🔊</button><p><span class="jp" lang="ja">${esc(i.x)}</span><br>${pt ? `<span class="pt">${esc(i.tr)}</span>` : `<button type="button" class="verpt" data-pt="${i.n}">ver tradução</button>`}</p></div>`}
    <label class="l" for="f${i.n}">MINHA FRASE</label>
    <textarea id="f${i.n}" data-f="${i.n}" rows="2" lang="ja" placeholder="Escreva uma frase sua com essa estrutura" ${souProf ? 'readonly' : ''}>${esc(r.f)}</textarea>
    ${corr}
    <div class="pe"><label class="sr" for="s${i.n}">Status</label><select id="s${i.n}" data-s="${i.n}">${opcoes}</select><span class="salvo" id="ok${i.n}" aria-live="polite"></span></div>
  </article>`;
}
function pintaCards(){
  const v = visiveis();
  $('mostra').textContent = `Mostrando ${v.length} de ${itens.length} estruturas`;
  $('cards').innerHTML = v.map(card).join('') || '<p class="sub">Nenhuma estrutura com esse filtro.</p>';
}
$('cards').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f) { const n = Number(t.dataset.f); const ja = stDe(n); grava(n, Object.assign({ f: t.value, fm: Date.now() }, t.value.trim() && ja === 'pendente' ? { st: 'feito' } : {}), $('ok' + n)); }
  if (t.dataset.c) { const n = Number(t.dataset.c); grava(n, { c: t.value, cm: Date.now() }, $('ok' + n)); marcaVisto(n); const b = t.closest('.card').querySelector('.novo'); if (b) { b.remove(); pintaChips(); } }
});
$('cards').addEventListener('change', e => {
  const t = e.target; if (!t.dataset.s) return;
  const n = Number(t.dataset.s); grava(n, { st: t.value }, $('ok' + n)); if (souProf) { marcaVisto(n); const b = t.closest('.card').querySelector('.novo'); if (b) b.remove(); pintaChips(); }
  const c = t.closest('.card'); c.className = 'card s-' + t.value; c.querySelector('.pill').className = 'pill p-' + t.value; c.querySelector('.pill').textContent = ST[t.value];
});
$('cards').addEventListener('click', e => {
  const vv = e.target.closest('[data-visto]'); if (vv) { marcaVisto(Number(vv.dataset.visto)); vv.remove(); pintaChips(); if (filtro.st === 'novas' && !itens.some(i => novo(i.n))) { filtro.st = ''; pintaChips(); pintaCards(); } return; }
  const x = e.target.closest('[data-ex]'); if (x) { abertosEx.add(Number(x.dataset.ex)); const c = x.closest('.card'); c.outerHTML = card(itens[Number(x.dataset.ex)]); return; }
  const p = e.target.closest('[data-pt]'); if (p) { abertosPt.add(Number(p.dataset.pt)); p.outerHTML = `<span class="pt">${esc(itens[Number(p.dataset.pt)].tr)}</span>`; return; }
  const s = e.target.closest('[data-som]'); if (s) fala(itens[Number(s.dataset.som)].x);
});
function fala(t){
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ja-JP'; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
}

/* ---------- flashcard ---------- */
let fcLista = [], fcI = 0, fcVira = false;
$('fc-abre').onclick = () => { fcLista = visiveis().filter(i => stDe(i.n) !== 'dominado'); if (!fcLista.length) fcLista = visiveis(); fcI = 0; fcVira = false; fcPinta(); };
function fcPinta(){
  let o = $('fc'); if (!o) { o = document.createElement('div'); o.id = 'fc'; o.className = 'fc'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Modo flashcard'); document.body.appendChild(o); }
  if (!fcLista.length) { o.remove(); return; }
  const i = fcLista[fcI];
  o.innerHTML = `<div class="fc-box"><div class="fc-nav"><b>Flashcard · ${fcI + 1} de ${fcLista.length}</b><button type="button" class="chip" id="fc-x">Fechar ×</button></div>
    <div class="fc-c" id="fc-c" tabindex="0">${fcVira
      ? `<p class="nu" style="font-weight:700">${esc(i.nu)}</p><p lang="ja" style="font-size:18px;margin:0">${esc(i.x)}</p><p class="pt" style="margin:0;color:var(--muted)">${esc(i.tr)}</p>${resp(i.n).f ? `<p style="margin:6px 0 0;font-size:14px">Sua frase: <span lang="ja">${esc(resp(i.n).f)}</span></p>` : ''}`
      : `<p class="dica">${SEM(i.s)} · ${DIA(i.d)}</p><h3 lang="ja">${esc(i.e)}</h3><p class="dica">Lembra o sentido? Toque para virar.</p>`}</div>
    <div class="fc-nav"><button type="button" class="chip" id="fc-ant">← Anterior</button>${fcVira ? `<span><button type="button" class="chip" id="fc-rev">Revisar de novo</button> <button type="button" class="btn" id="fc-sei" style="background:var(--sage)">Já sei ✓</button></span>` : `<button type="button" class="som" id="fc-som" aria-label="Ouvir">🔊</button>`}<button type="button" class="chip" id="fc-prox">Próximo →</button></div></div>`;
  const vai = d => { fcI = (fcI + d + fcLista.length) % fcLista.length; fcVira = false; fcPinta(); };
  $('fc-c').onclick = () => { fcVira = !fcVira; fcPinta(); };
  $('fc-x').onclick = () => { o.remove(); pintaCards(); };
  $('fc-ant').onclick = () => vai(-1); $('fc-prox').onclick = () => vai(1);
  if ($('fc-som')) $('fc-som').onclick = () => fala(i.x);
  if ($('fc-sei')) $('fc-sei').onclick = () => { if (!souProf) grava(i.n, { st: 'dominado' }); vai(1); };
  if ($('fc-rev')) $('fc-rev').onclick = () => vai(1);
  o.onclick = e => { if (e.target === o) { o.remove(); pintaCards(); } };
}
document.addEventListener('keydown', e => {
  if (!$('fc')) return;
  if (e.key === 'Escape') { $('fc').remove(); pintaCards(); }
  else if (e.key === ' ' && document.activeElement === $('fc-c')) { e.preventDefault(); $('fc-c').click(); }
  else if (e.key === 'ArrowRight') $('fc-prox').click(); else if (e.key === 'ArrowLeft') $('fc-ant').click();
});

/* ---------- selecionar uma palavra → Dicionário ---------- */
let bDic = null;
document.addEventListener('mouseup', () => setTimeout(() => {
  const sel = getSelection(), t = sel && sel.toString().trim();
  if (bDic) { bDic.remove(); bDic = null; }
  if (!t || t.length > 30 || !sel.rangeCount || !document.getElementById('cf-dab')) return;
  const r = sel.getRangeAt(0).getBoundingClientRect();
  bDic = document.createElement('button'); bDic.type = 'button'; bDic.className = 'sel-dic'; bDic.textContent = '📖 Buscar no dicionário';
  bDic.style.left = (scrollX + r.left) + 'px'; bDic.style.top = (scrollY + r.bottom + 6) + 'px';
  bDic.onmousedown = ev => ev.preventDefault();
  bDic.onclick = () => {
    const dab = $('cf-dab'); if (dab.getAttribute('aria-expanded') !== 'true') dab.click();
    setTimeout(() => { const q = $('dc-q'); if (q) { q.value = t; q.form.requestSubmit(); } }, 150);
    bDic.remove(); bDic = null;
  };
  document.body.appendChild(bDic);
}, 10));

/* ---------- quem está vendo ---------- */
/* acesso restrito: só quem a professora liberou (o documento atividades/{e-mail} é criado por ela) */
const trava = on => document.querySelectorAll('#nums,#sems,.ferr,#mostra,#cards').forEach(el => el.hidden = on);
async function abre(email){
  alvo = email; await carrega();
  const lib = $('lib'); if (lib) lib.remove();
  if (nuvem && !liberado) {
    trava(true);
    $('aviso').innerHTML = souProf
      ? `<div class="aviso" id="lib">Esta atividade ainda não foi liberada para este aluno. <button type="button" class="btn" id="lib-ok" style="margin-left:8px">Liberar para este aluno</button></div>`
      : '<p class="aviso" id="lib">✦ Atividade exclusiva. Peça acesso à sua professora.</p>';
    if ($('lib-ok')) $('lib-ok').onclick = async () => {
      $('lib-ok').disabled = true;
      try { await setDoc(doc(db, 'atividades', alvo), { liberado: new Date().toISOString(), [A.id]: {} }, { merge: true }); abre(alvo); }
      catch (e) { console.warn(e); $('lib-ok').textContent = 'Não consegui liberar'; }
    };
    return;
  }
  leVisto(); if (itens.some(i => novo(i.n)) && !filtro.st) filtro.st = 'novas';
  trava(false); pintaNums(); pintaChips(); pintaCards();
}
onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(); souProf = PROFS.includes(eu);
  const pedido = (new URLSearchParams(location.search).get('aluno') || '').toLowerCase();
  if (!souProf) { $('quem').innerHTML = ''; return abre(eu); }
  let alunos = [];
  try { alunos = (await getDocs(collection(db, 'aulas'))).docs.map(d => ({ id: d.id, nome: d.data().nome || d.id })).sort((a, b) => a.nome.localeCompare(b.nome)); } catch (e) {}
  const ini = pedido || (alunos[0] && alunos[0].id) || eu;
  $('quem').innerHTML = `<span class="pill p-feito">Você está como professora</span><label for="al">Aluno:</label><select id="al">${alunos.map(a => `<option value="${esc(a.id)}"${a.id === ini ? ' selected' : ''}>${esc(a.nome)}</option>`).join('')}</select><span class="salvo">Você escreve as correções; a frase é do aluno.</span>`;
  $('al').onchange = () => { history.replaceState(null, '', '?aluno=' + encodeURIComponent($('al').value)); abre($('al').value); };
  abre(ini);
});
