/* Unirversos · Atividades ✦ — galeria de PARES (verbos transitivos/intransitivos, adjetivos e opostos…).
   Cada página define window.PARES_CFG antes de carregar este arquivo (id, título, rótulos dos dois lados, filtro).
   Mesmo modelo da Gramática N2: o conteúdo fica no Firestore (biblioteca/{id}, só liberados leem; o repositório é público).
   Respostas: Firestore atividades/{e-mail} → { [id]: { "<par>t" | "<par>i": {f, st, c, m, ap, cm, h} } }.
   Cada palavra tem a sua frase, o seu status e a sua correção. O aluno escreve; a professora corrige e aprova. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com', 'li.kikuti@gmail.com'];
const $ = id => document.getElementById(id);
const CFG = window.PARES_CFG;
const BASE = { id: CFG.id, titulo: CFG.titulo, sub: CFG.sub, itens: [] };
const A = await new Promise(res => {
  let pronto = false;
  const off = onAuthStateChanged(auth, async u => {
    if (!u || pronto) return; pronto = true; if (typeof off === 'function') off();
    try { const s = await getDoc(doc(db, 'biblioteca', BASE.id)); if (s.exists()) { const d = s.data(); return res({ ...BASE, ...d, itens: JSON.parse(d.itens || '[]') }); } }
    catch (e) { /* sem permissão: atividade não liberada */ }
    res(BASE);
  });
});
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const ST = { pendente: 'A praticar', revisao: 'Aguardando a professora', corrigir: 'Corrigir', feito: 'Feito ✓' };
const PRATICAR = ['pendente', 'revisao', 'corrigir'];
const KIND = { t: Object.assign({ cls: 'k-t' }, CFG.lados.t), i: Object.assign({ cls: 'k-i' }, CFG.lados.i) };
const UN = CFG.unidade; /* ex.: ['verbo', 'verbos'] */

/* cada par vira dois verbos; a chave é "<par>t" ou "<par>i" */
const pares = A.itens;
const verbos = {}; pares.forEach(p => { verbos[p.n + 't'] = Object.assign({ k: p.n + 't', p, tipo: 't' }, p.t); verbos[p.n + 'i'] = Object.assign({ k: p.n + 'i', p, tipo: 'i' }, p.i); });
const chaves = Object.keys(verbos);
const NIVEIS = [...new Set(pares.map(p => p.nv))].sort();
/* segundo filtro: tema (verbos) ou tipo い/な (adjetivos); vale se qualquer lado do par combinar */
const campo2 = CFG.filtro2.campo, valores2 = p => [...new Set([p.t[campo2], p.i[campo2]])];
const TEMAS = [...new Set(pares.flatMap(valores2))].sort((a, b) => a.localeCompare(b, 'pt'));
let oculta = false, R = {}, alvo = '', souProf = false, nuvem = true, liberado = false, filtro = { st: 'praticar', nv: '', tema: '', q: '' }, abertosPt = new Set();

$('tit').textContent = A.titulo; $('sub').textContent = A.sub;
const resp = k => R[k] || {};
let visto = {};
const chaveVisto = () => 'uniAtivVisto:' + A.id + ':' + alvo;
const leVisto = () => { try { visto = JSON.parse(localStorage.getItem(chaveVisto()) || '{}'); } catch (e) { visto = {}; } };
const marcaVisto = k => { visto[k] = Date.now(); try { localStorage.setItem(chaveVisto(), JSON.stringify(visto)); } catch (e) {} };
const stDe = k => { const r = resp(k);
  if ((r.st === 'feito' && r.ap) || r.st === 'dominado') return 'feito';
  if (r.st === 'corrigir') return 'corrigir';
  return (r.f || '').trim() ? 'revisao' : 'pendente'; };
const novo = k => { const r = resp(k); return !souProf && !!(r.c || '').trim() && (r.cm || 0) > (visto[k] || 0) && stDe(k) !== 'feito'; };

/* ---------- guardar (mesma segurança da Gramática N2: nuvem + cópia no aparelho) ---------- */
const chaveLocal = () => 'uniAtiv:' + A.id + ':' + alvo;
const leLocal = () => { try { return JSON.parse(localStorage.getItem(chaveLocal()) || '{}'); } catch (e) { return {}; } };
const guardaLocal = () => { try { localStorage.setItem(chaveLocal(), JSON.stringify(R)); } catch (e) {} };
async function carrega(){
  R = {}; liberado = false;
  try { const s = await getDoc(doc(db, 'atividades', alvo)); liberado = s.exists(); R = (s.exists() && s.data()[A.id]) || {}; nuvem = true; }
  catch (e) { console.warn(e); nuvem = false; R = leLocal(); }
  if (nuvem && liberado) {
    const L = leLocal(), pend = {};
    Object.keys(L).forEach(k => { if (L[k] && (L[k].m || 0) > ((R[k] || {}).m || 0)) { R[k] = L[k]; pend[k] = L[k]; } });
    if (Object.keys(pend).length) setDoc(doc(db, 'atividades', alvo), { [A.id]: pend }, { merge: true }).catch(e => console.warn('reenvio', e));
  }
  $('aviso').innerHTML = nuvem ? '' : '<p class="aviso">Sem conexão com a nuvem agora: o que você escrever fica salvo neste aparelho e vai para a nuvem quando voltar.</p>';
}
let semNuvem = false;
function avisoNuvem(on){
  if (on === semNuvem) return; semNuvem = on;
  let b = $('nuvem-av');
  if (!on) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'nuvem-av'; b.className = 'nuvem-av'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
  b.innerHTML = `<b>⚠️ ${souProf ? 'Não salvou na nuvem agora.' : 'Suas frases não foram para a nuvem agora.'}</b> ${souProf ? 'A correção ficou guardada neste aparelho e' : 'Elas ficaram guardadas neste aparelho e'} vão para a nuvem sozinhas na próxima vez que você abrir esta página <u>neste mesmo aparelho</u>${souProf ? '.' : ', e aí a professora vê.'} Não limpe os dados do navegador até lá.`;
}
const fila = {};
function grava(k, campos, el){
  R[k] = Object.assign({}, resp(k), campos, { m: Date.now() });
  guardaLocal();
  clearTimeout(fila[k]);
  if (el) el.textContent = 'salvando…';
  fila[k] = setTimeout(async () => {
    if (nuvem) {
      const ok = await Promise.race([
        setDoc(doc(db, 'atividades', alvo), { [A.id]: { [k]: R[k] } }, { merge: true }).then(() => true, e => { console.warn(e); return false; }),
        new Promise(r => setTimeout(() => r(null), 6000))
      ]);
      if (el) el.textContent = ok ? 'salvo ✓' : '⚠️ não salvou na nuvem · guardado neste aparelho';
      avisoNuvem(!ok);
    } else { if (el) el.textContent = '⚠️ guardado só neste aparelho'; avisoNuvem(true); }
    pintaNums();
  }, 700);
}

/* ---------- números ---------- */
function barra(lista){
  const tot = lista.length || 1, c = s => lista.filter(k => stDe(k) === s).length;
  return ['feito', 'revisao', 'corrigir'].map(s => `<i class="b-${s}" style="width:${100 * c(s) / tot}%"></i>`).join('');
}
function pintaNums(){
  const tot = chaves.length, c = s => chaves.filter(k => stDe(k) === s).length, f = c('feito');
  $('nums').innerHTML = `<div class="prog"><div class="prog-t"><b>${f} de ${tot}</b> ${UN[1]} feitos <span>${tot ? Math.round(100 * f / tot) : 0}%</span></div>
    <div class="prog-b">${barra(chaves)}</div>
    <div class="leg"><span><i class="b-feito"></i>Feitos ✓ ${f}</span><span><i class="b-revisao"></i>Aguardando a professora ${c('revisao')}</span><span><i class="b-corrigir"></i>Para corrigir ${c('corrigir')}</span><span><i class="b-pendente"></i>Ainda sem frase ${c('pendente')}</span></div></div>`;
}

/* ---------- filtros ---------- */
const parPassaSt = p => ['t', 'i'].some(t => { const k = p.n + t, st = stDe(k);
  return !filtro.st || (filtro.st === 'novas' ? novo(k) : filtro.st === 'praticar' ? PRATICAR.includes(st) : st === filtro.st); });
const visiveis = () => pares.filter(p => (!filtro.nv || p.nv === filtro.nv) && (!filtro.tema || valores2(p).includes(filtro.tema)) && parPassaSt(p)
  && (!filtro.q || [p.t.j, p.t.ka, p.t.ro, p.t.sig, p.t.x, p.t.tr, p.i.j, p.i.ka, p.i.ro, p.i.sig, p.i.x, p.i.tr, resp(p.n + 't').f, resp(p.n + 'i').f].join(' ').toLowerCase().includes(filtro.q)));
function pintaChips(){
  const nRev = chaves.filter(k => stDe(k) === 'revisao').length, nNov = chaves.filter(novo).length;
  const nPr = chaves.filter(k => PRATICAR.includes(stDe(k))).length;
  const ch = (k, t, cls = '') => `<button type="button" class="chip${cls}${filtro.st === k ? ' on' : ''}" data-st="${k}">${t}</button>`;
  $('chips').innerHTML = [
    souProf && nRev ? ch('revisao', `✎ Para aprovar (${nRev})`, ' novas') : '',
    !souProf && nNov ? ch('novas', `✦ Correções novas (${nNov})`, ' novas') : '',
    ch('praticar', `A praticar (${nPr})`), ch('feito', `Feito ✓ (${chaves.length - nPr})`), ch('', 'Todos')
  ].join(' ');
  const g = (a, v, t) => `<button type="button" class="chip${filtro[a] === v ? ' on' : ''}" data-f="${a}" data-v="${esc(v)}">${esc(t)}</button>`;
  $('niv').innerHTML = [g('nv', '', 'Todos'), ...NIVEIS.map(n => g('nv', n, n))].join(' ');
  $('tem').innerHTML = [g('tema', '', 'Todos'), ...TEMAS.map(t => g('tema', t, t))].join(' ');
}
$('chips').onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; filtro.st = b.dataset.st; pintaChips(); pintaCards(); };
const filtros = e => { const b = e.target.closest('[data-f]'); if (!b) return; filtro[b.dataset.f] = b.dataset.v; pintaChips(); pintaCards(); };
$('niv').onclick = filtros; $('tem').onclick = filtros;
$('q').oninput = () => { filtro.q = $('q').value.trim().toLowerCase(); pintaCards(); };

/* ---------- histórico de correções ---------- */
const hist = (k, e) => (resp(k).h || []).concat(Object.assign({ t: Date.now() }, e)).slice(-20);
const dataCurta = t => new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
function blocoHist(r){
  const h = (r.h || []).filter(x => x && x.f); if (!h.length) return '';
  return `<details class="hist"><summary>📜 Histórico (${h.length})</summary><ol>${h.map(x => `<li><span class="hd">${dataCurta(x.t)}</span>
    <span class="hf" lang="ja">${esc(x.f)}</span>${x.ok ? '<span class="hok">✓ aprovada</span>' : `<span class="hc">→ <span lang="ja">${esc(x.c)}</span></span>`}</li>`).join('')}</ol></details>`;
}

/* ---------- cards ---------- */
function lado(v){
  const k = v.k, r = resp(k), st = stDe(k), pt = abertosPt.has(k), K = KIND[v.tipo];
  const corr = souProf
    ? `<div class="corr"><label class="l" for="c${k}">CORREÇÃO DA PROFESSORA</label><textarea id="c${k}" data-c="${k}" rows="2" placeholder="Escreva a frase corrigida ou um comentário">${esc(r.c)}</textarea></div>`
    : (r.c && st !== 'feito' ? `<div class="corr"><b>CORREÇÃO DA PROFESSORA</b><div style="white-space:pre-wrap">${esc(r.c)}</div></div>` : '');
  const acoes = souProf
    ? (st === 'feito' ? `<button type="button" class="mini" data-acao="reabre" data-k="${k}">↺ Reabrir</button>`
       : (r.f || '').trim() ? `<button type="button" class="mini ok" data-acao="aprova" data-k="${k}">✓ Aprovar</button><button type="button" class="mini" data-acao="corrige" data-k="${k}">✎ Pedir correção</button>` : '<span class="salvo">Ainda sem frase do aluno.</span>')
    : (st === 'revisao' ? '<span class="salvo">Enviada · a professora vai ver</span>' : st === 'corrigir' ? '<span class="salvo">Reescreva a frase com a correção</span>' : '');
  return `<div class="lado ${K.cls} s-${st}" data-k="${k}">
    <div class="tp"><span class="tag">${esc(K.nome)}${K.rot ? ` · <span lang="ja">${esc(K.rot)}</span>` : ''}</span><span class="pill p-${st}">${ST[st]}</span></div>
    <h3><span lang="ja">${esc(v.j)}</span> <small>${[v.ka, v.ro, v.g].filter(Boolean).map(esc).join(' · ')}</small></h3>
    <p class="sig"><b>${esc(v.sig)}</b>${v.nu ? ` <span>· ${esc(v.nu)}</span>` : ''}</p>
    <div class="ex"><button type="button" class="som" data-som="${k}" aria-label="Ouvir o exemplo">🔊</button><p><span class="jp" lang="ja">${esc(v.x)}</span><br>${pt ? `<span class="pt">${esc(v.tr)}</span> <button type="button" class="verpt" data-pt="${k}">ocultar tradução</button>` : `<button type="button" class="verpt" data-pt="${k}">ver tradução</button>`}</p></div>
    <label class="l" for="f${k}">${souProf ? 'FRASE DO ALUNO' : 'MINHA FRASE'}</label>
    <textarea id="f${k}" data-f="${k}" rows="2" lang="ja" placeholder="${souProf ? 'O aluno ainda não escreveu' : 'Escreva uma frase sua com ' + esc(v.j)}" ${souProf ? 'readonly' : ''}>${esc(r.f)}</textarea>
    ${corr}
    ${blocoHist(r)}
    <div class="pe"><span class="acoes">${acoes}${novo(k) ? ` <button type="button" class="novo" data-visto="${k}" title="Marcar como visto">nova correção · ✓ vi</button>` : ''}</span><span class="salvo" id="ok${k}" aria-live="polite"></span></div>
  </div>`;
}
const cardPar = p => `<article class="par" data-n="${p.n}"><div class="top"><span>Par ${String(p.n).padStart(2, '0')} · ${esc(p.nv)}</span><span>${esc([...new Set([p.t.tema, p.i.tema])].join(' · '))}</span></div><div class="lados">${lado(verbos[p.n + 't'])}${lado(verbos[p.n + 'i'])}</div></article>`;
function pintaCards(){
  const v = visiveis();
  $('mostra').textContent = `Mostrando ${v.length} de ${pares.length} pares`;
  $('cards').innerHTML = v.map(cardPar).join('') || `<p class="sub">${filtro.st === 'revisao' ? 'Tudo aprovado por aqui ✓' : filtro.st === 'praticar' ? 'Nada para praticar com esse filtro 🎉' : 'Nenhum par com esse filtro.'}</p>`;
}
/* troca só o lado que mudou, para não atrapalhar quem está digitando no outro */
function repinta(k){
  const el = $('cards').querySelector(`.lado[data-k="${k}"]`); if (el) el.outerHTML = lado(verbos[k]);
}
function depois(k){ pintaNums(); pintaChips(); repinta(k); }

$('cards').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f && !souProf) {
    const k = t.dataset.f, antes = stDe(k), tem = !!t.value.trim();
    grava(k, { f: t.value, fm: Date.now(), st: tem ? 'revisao' : 'pendente', ap: false }, $('ok' + k));
    const agora = stDe(k); if (agora !== antes) { const c = t.closest('.lado'); c.className = 'lado ' + KIND[verbos[k].tipo].cls + ' s-' + agora; const p = c.querySelector('.pill'); p.className = 'pill p-' + agora; p.textContent = ST[agora]; pintaNums(); pintaChips(); }
  }
  if (t.dataset.c) { const k = t.dataset.c; grava(k, { c: t.value, cm: Date.now() }, $('ok' + k)); }
});
$('cards').addEventListener('click', e => {
  const ac = e.target.closest('[data-acao]');
  if (ac) { const k = ac.dataset.k, a = ac.dataset.acao;
    if (a === 'aprova') grava(k, { st: 'feito', ap: true, apm: Date.now(), h: hist(k, { f: resp(k).f, ok: 1 }) }, $('ok' + k));
    if (a === 'corrige') { const ta = $('c' + k); if (!ta.value.trim()) { ta.focus(); ta.placeholder = 'Escreva aqui a correção e toque de novo em “Pedir correção”'; return; } grava(k, { st: 'corrigir', ap: false, cm: Date.now(), h: hist(k, { f: resp(k).f, c: ta.value.trim() }) }, $('ok' + k)); }
    if (a === 'reabre') grava(k, { st: (resp(k).f || '').trim() ? 'revisao' : 'pendente', ap: false }, $('ok' + k));
    depois(k); return; }
  const vv = e.target.closest('[data-visto]'); if (vv) { marcaVisto(vv.dataset.visto); vv.remove(); pintaChips(); return; }
  const p = e.target.closest('[data-pt]'); if (p) { const k = p.dataset.pt; abertosPt.has(k) ? abertosPt.delete(k) : abertosPt.add(k); repinta(k); return; }
  const s = e.target.closest('[data-som]'); if (s) fala(verbos[s.dataset.som].x);
});
function fala(t){
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ja-JP'; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
}

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
const trava = on => document.querySelectorAll('#nums,.ferr,.fil,#mostra,#cards').forEach(el => el.hidden = on);
/* ao vivo: o que muda em outro aparelho aparece aqui sem recarregar. Só lê, nunca grava. */
let pararVivo = null;
function aoVivo(){
  if (pararVivo) { pararVivo(); pararVivo = null; }
  if (!nuvem || !liberado) return;
  pararVivo = onSnapshot(doc(db, 'atividades', alvo), s => {
    if (s.metadata.hasPendingWrites || !s.exists()) return;
    const d = s.data()[A.id] || {}, mud = [];
    Object.keys(d).forEach(k => { if (d[k] && (d[k].m || 0) > ((R[k] || {}).m || 0)) { R[k] = d[k]; mud.push(k); } });
    if (!mud.length) return;
    pintaNums(); pintaChips();
    mud.forEach(k => {
      if (!verbos[k]) return;
      const c = $('cards').querySelector(`.lado[data-k="${k}"]`);
      if (c && c.contains(document.activeElement)) return; /* não atrapalha quem está digitando */
      if (c) { repinta(k); const nc = $('cards').querySelector(`.lado[data-k="${k}"]`); if (nc) { nc.classList.add('chegou'); setTimeout(() => nc.classList.remove('chegou'), 1600); } }
    });
  }, e => console.warn('ao vivo', e));
}
async function abre(email){
  alvo = email; await carrega(); aoVivo();
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
  if (!pares.length) { trava(true); $('aviso').innerHTML = '<p class="aviso">O conteúdo desta atividade ainda não foi carregado.</p>'; return; }
  leVisto(); filtro.st = souProf ? (chaves.some(k => stDe(k) === 'revisao') ? 'revisao' : 'praticar') : (chaves.some(novo) ? 'novas' : 'praticar');
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
