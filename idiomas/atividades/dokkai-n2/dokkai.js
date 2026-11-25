/* Unirversos · Atividades ✦ — Leitura N2 (読解 / Dokkai), 6 semanas, 42 lições.
   Mesma base da galeria da Gramática N2: o aluno lê o texto do livro e escreve a síntese, os acertos e o tempo; a professora corrige e aprova.
   Conteúdo: Firestore biblioteca/n2dokkai. Respostas: atividades/{e-mail} → { n2dokkai: { [n]: {f, ac, tp, st, c, m, ...} } }. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com'];
const $ = id => document.getElementById(id);
/* o conteúdo da atividade fica no Firestore (biblioteca/n2gram), que só alunos liberados e professoras leem.
   Quem não tem acesso recebe só o título: as frases não estão em nenhum arquivo público do site. */
/* outras galerias no mesmo formato (ex.: Vocabulário N2) definem window.GALERIA_CFG antes de carregar este arquivo */
const CFG = Object.assign({ id: 'n2gram', titulo: 'Gramática N2 · 8 semanas', sub: 'Uma estrutura por vez: entenda a nuance, veja o exemplo e escreva a sua frase.', un: ['estrutura', 'estruturas'] }, window.GALERIA_CFG || {});
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
/* caminho de cada estrutura: A praticar → (aluno escreve) Aguardando a professora → Feito ✓ (aprovada) ou Corrigir (volta com a correção) */
const ST = { pendente: 'A praticar', revisao: 'Aguardando a professora', corrigir: 'Corrigir', feito: 'Feito ✓' };
const PRATICAR = ['pendente', 'revisao', 'corrigir'];
/* rótulos dos grupos: semanas (padrão), módulos/histórias ou tipos de texto, conforme GALERIA_CFG */
const SEM = n => CFG.grupos ? (CFG.grupos[n - 1] || n) : CFG.semRot ? CFG.semRot.replace('{n}', n) : '第' + n + '週';
const DIA = n => CFG.diaRot ? CFG.diaRot.replace('{n}', n) : n + '日目';
/* posições: 0 semana, 1 dia, 2 tema, 3 tipo, 4 estratégia, 5 vocabulário, 6 pedido da síntese, 7 minutos,
   8 texto de leitura, 9 questão (pergunta + 4 alternativas), 10 gabarito e explicação, 11 palavras do texto (Preparar leituras) */
const questao = t => { const l = String(t || '').split('\n').map(x => x.trim()).filter(Boolean);
  const ops = l.filter(x => /^[1-4１-４][\.．]/.test(x)).map(x => x.replace(/^[1-4１-４][\.．]\s*/, ''));
  return { p: l.filter(x => !/^[1-4１-４][\.．]/.test(x)).join(' '), ops }; };
const gabarito = t => { const m = String(t || '').match(/正解[：:]\s*([1-4１-４])/); const n = m ? '1234１２３４'.indexOf(m[1]) % 4 + 1 : 0;
  return { n, ex: String(t || '').replace(/^.*?正解[：:]\s*[1-4１-４]\s*/s, '').replace(/^【解説】\s*/, '').trim() }; };
const itens = A.itens.map((r, n) => ({ n, s: r[0], d: r[1], tm: r[2], tipo: r[3], es: r[4], vo: r[5], q: r[6], min: r[7], tx: r[8] || '', qq: questao(r[9]), gb: gabarito(r[10]), xt: r[11] }));
/* sem estratégia no material (ex.: Leitura N3): o botão de mostrar estratégias some */
if (!itens.some(i => i.es)) $('oc').hidden = true;
let oculta = (() => { try { return localStorage.getItem('uniAtivOcultaEstr') !== '0'; } catch (e) { return true; } })(), abertosEx = new Set();
let R = {}, alvo = '', souProf = false, nuvem = true, filtro = { sem: 0, st: 'praticar', q: '' }, abertosPt = new Set();

$('tit').textContent = A.titulo; $('sub').textContent = A.sub;
const resp = n => R[n] || {};
/* correção nova que o aluno ainda não viu (guardado no aparelho dele) */
let visto = {};
const chaveVisto = () => 'uniAtivVisto:' + A.id + ':' + alvo;
const leVisto = () => { try { visto = JSON.parse(localStorage.getItem(chaveVisto()) || '{}'); } catch (e) { visto = {}; } };
const marcaVisto = n => { visto[n] = Date.now(); try { localStorage.setItem(chaveVisto(), JSON.stringify(visto)); } catch (e) {} };
const novo = n => { const r = resp(n); return !souProf && !!(r.c || '').trim() && (r.cm || 0) > (visto[n] || 0) && stDe(n) !== 'feito'; };
const stDe = n => { const r = resp(n);
  if ((r.st === 'feito' && r.ap) || r.st === 'dominado') return 'feito';
  if (r.st === 'corrigir') return 'corrigir';
  return (r.f || '').trim() ? 'revisao' : 'pendente'; };

/* ---------- guardar ---------- */
const chaveLocal = () => 'uniAtiv:' + A.id + ':' + alvo;
let liberado = false;
/* cópia de segurança no aparelho: tudo o que se escreve fica também no navegador; ao abrir, o que estiver mais novo
   no aparelho do que na nuvem é reenviado (salva o trabalho se a internet ou o Firebase falharem) */
const leLocal = () => { try { return JSON.parse(localStorage.getItem(chaveLocal()) || '{}'); } catch (e) { return {}; } };
const guardaLocal = () => { try { localStorage.setItem(chaveLocal(), JSON.stringify(R)); } catch (e) {} };
async function carrega(){
  R = {}; liberado = false;
  try { const s = await getDoc(doc(db, 'atividades', alvo)); liberado = s.exists() || TESTE; R = (s.exists() && s.data()[A.id]) || {}; nuvem = true; }
  catch (e) { console.warn(e); nuvem = false; R = leLocal(); }
  if (nuvem && liberado) {
    const L = leLocal(), pend = {};
    Object.keys(L).forEach(n => { if (L[n] && (L[n].m || 0) > ((R[n] || {}).m || 0)) { R[n] = L[n]; pend[n] = L[n]; } });
    if (Object.keys(pend).length) setDoc(doc(db, 'atividades', alvo), { [A.id]: pend }, { merge: true }).catch(e => console.warn('reenvio', e));
  }
  $('aviso').innerHTML = nuvem ? '' : '<p class="aviso">Sem conexão com a nuvem agora: o que você escrever fica salvo neste aparelho e vai para a nuvem quando voltar.</p>';
}
/* aviso fixo quando a nuvem não salvou: o trabalho está no aparelho e sobe sozinho depois */
let semNuvem = false;
function avisoNuvem(on){
  if (on === semNuvem) return; semNuvem = on;
  let b = $('nuvem-av');
  if (!on) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'nuvem-av'; b.className = 'nuvem-av'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
  b.innerHTML = `<b>⚠️ ${souProf ? 'Não salvou na nuvem agora.' : 'Suas frases não foram para a nuvem agora.'}</b> ${souProf ? 'A correção ficou guardada neste aparelho e' : 'Elas ficaram guardadas neste aparelho e'} vão para a nuvem sozinhas na próxima vez que você abrir esta página <u>neste mesmo aparelho</u>${souProf ? '.' : ', e aí a professora vê.'} Não limpe os dados do navegador até lá.`;
}
const fila = {};
function grava(n, campos, el){
  R[n] = Object.assign({}, resp(n), campos, { m: Date.now() });
  guardaLocal();
  clearTimeout(fila[n]);
  if (el) el.textContent = 'salvando…';
  fila[n] = setTimeout(async () => {
    if (nuvem) {
      const ok = await Promise.race([
        setDoc(doc(db, 'atividades', alvo), { [A.id]: { [n]: R[n] } }, { merge: true }).then(() => true, e => { console.warn(e); return false; }),
        new Promise(r => setTimeout(() => r(null), 6000))
      ]);
      if (el) el.textContent = ok ? 'salvo ✓' : '⚠️ não salvou na nuvem · guardado neste aparelho';
      avisoNuvem(!ok);
    } else { if (el) el.textContent = '⚠️ guardado só neste aparelho'; avisoNuvem(true); }
    pintaNums();
  }, 700);
}

/* ---------- números e semanas ---------- */
function barra(lista){
  const tot = lista.length, c = k => lista.filter(i => stDe(i.n) === k).length;
  return ['feito', 'revisao', 'corrigir'].map(k => `<i class="b-${k}" style="width:${100 * c(k) / tot}%"></i>`).join('');
}
function pintaNums(){
  const tot = itens.length, c = k => itens.filter(i => stDe(i.n) === k).length, f = c('feito');
  $('nums').innerHTML = `<div class="prog"><div class="prog-t"><b>${f} de ${tot}</b> textos lidos <span>${Math.round(100 * f / tot)}%</span></div>
    <div class="prog-b">${barra(itens)}</div>
    <div class="leg"><span><i class="b-feito"></i>Lidos ✓ ${f}</span><span><i class="b-revisao"></i>Aguardando a professora ${c('revisao')}</span><span><i class="b-corrigir"></i>Para corrigir ${c('corrigir')}</span><span><i class="b-pendente"></i>Ainda sem síntese ${c('pendente')}</span></div></div>`;
  const sems = [...new Set(itens.map(i => i.s))];
  $('sems').innerHTML = sems.map(s => {
    const da = itens.filter(i => i.s === s), ok = da.filter(i => stDe(i.n) === 'feito').length;
    return `<button type="button" class="sem${filtro.sem === s ? ' on' : ''}${ok === da.length ? ' cheia' : ''}" data-sem="${s}" aria-pressed="${filtro.sem === s}">${SEM(s)}<small>${ok}/${da.length} ✓</small><span class="tr">${barra(da)}</span></button>`;
  }).join('');
}
$('sems').onclick = e => { const b = e.target.closest('[data-sem]'); if (!b) return; const s = Number(b.dataset.sem); filtro.sem = filtro.sem === s ? 0 : s; pintaNums(); pintaCards(); };

/* ---------- filtros ---------- */
function pintaChips(){
  $('oc').textContent = oculta ? '👁 Mostrar estratégias' : '🙈 Ocultar estratégias'; $('oc').setAttribute('aria-pressed', oculta);
  const nPr = itens.filter(i => PRATICAR.includes(stDe(i.n))).length, nRev = itens.filter(i => stDe(i.n) === 'revisao').length, nNov = itens.filter(i => novo(i.n)).length;
  const ch = (k, t, cls = '') => `<button type="button" class="chip${cls}${filtro.st === k ? ' on' : ''}" data-st="${k}">${t}</button>`;
  $('chips').innerHTML = [
    souProf && nRev ? ch('revisao', `✎ Para aprovar (${nRev})`, ' novas') : '',
    !souProf && nNov ? ch('novas', `✦ Correções novas (${nNov})`, ' novas') : '',
    ch('praticar', `A praticar (${nPr})`), ch('feito', `Feito ✓ (${itens.length - nPr})`), ch('', 'Todas')
  ].join(' ');
}
$('oc').onclick = () => { oculta = !oculta; abertosEx.clear(); try { localStorage.setItem('uniAtivOcultaEstr', oculta ? '1' : '0'); } catch (e) {} pintaChips(); pintaCards(); };
$('chips').onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; filtro.st = b.dataset.st; pintaChips(); pintaCards(); };
$('q').oninput = () => { filtro.q = $('q').value.trim().toLowerCase(); pintaCards(); };
const passa = i => { const st = stDe(i.n);
  return !filtro.st || (filtro.st === 'novas' ? novo(i.n) : filtro.st === 'praticar' ? PRATICAR.includes(st) : st === filtro.st); };
const visiveis = () => itens.filter(i => (!filtro.sem || i.s === filtro.sem) && passa(i)
  && (!filtro.q || [i.tm, i.tipo, i.es, i.vo, i.q, i.tx, resp(i.n).f].join(' ').toLowerCase().includes(filtro.q)));

/* ---------- histórico de correções (fica no card para o aluno rever) ---------- */
const hist = (n, e) => (resp(n).h || []).concat(Object.assign({ t: Date.now() }, e)).slice(-20);
const dataCurta = t => new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
function blocoHist(r){
  const h = (r.h || []).filter(x => x && x.f); if (!h.length) return '';
  return `<details class="hist"><summary>📜 Histórico (${h.length})</summary><ol>${h.map(x => `<li><span class="hd">${dataCurta(x.t)}</span>
    <span class="hf" lang="ja">${esc(x.f)}</span>${x.ok ? '<span class="hok">✓ aprovada</span>' : `<span class="hc">→ <span lang="ja">${esc(x.c)}</span></span>`}</li>`).join('')}</ol></details>`;
}

/* ---------- cards ---------- */
/* questão: o aluno escolhe; a resposta e a explicação aparecem depois da escolha */
function blocoQuestao(i, r){
  const esc2 = esc, op = r.op, certo = i.gb.n;
  const bt = (t, k) => { const n = k + 1; let c = '';
    if (op) c = n === certo ? ' ok' : n === op ? ' erro' : '';
    return `<button type="button" class="op${c}" data-op="${i.n}" data-k="${n}" ${souProf || op ? 'disabled' : ''}><b>${n}</b><span lang="ja">${esc2(t)}</span></button>`; };
  const fim = op ? `<p class="fb ${op === certo ? 'ok' : 'erro'}">${op === certo ? '✓ Certo!' : `✗ A resposta é a ${certo}.`}</p>${i.gb.ex ? `<div class="expl" lang="ja">${esc2(i.gb.ex)}</div>` : ''}${souProf ? '' : '<button type="button" class="verpt" data-refaz="' + i.n + '">responder de novo</button>'}`
    : souProf ? '<span class="salvo">O aluno ainda não respondeu.</span>' : '';
  return `<div class="questao"><p class="qp" lang="ja">❓ ${esc2(i.qq.p)}</p><div class="ops">${i.qq.ops.map(bt).join('')}</div>${fim}</div>`;
}
function card(i){
  const r = resp(i.n), st = stDe(i.n);
  const corr = souProf
    ? `<div class="corr"><label class="l" for="c${i.n}">CORREÇÃO DA PROFESSORA</label><textarea id="c${i.n}" data-c="${i.n}" rows="2" placeholder="Escreva um comentário ou a síntese corrigida">${esc(r.c)}</textarea></div>`
    : (r.c && st !== 'feito' ? `<div class="corr"><b>CORREÇÃO DA PROFESSORA</b><div style="white-space:pre-wrap">${esc(r.c)}</div></div>` : '');
  const acoes = souProf
    ? (st === 'feito' ? `<button type="button" class="mini" data-acao="reabre" data-n="${i.n}">↺ Reabrir</button>`
       : (r.f || '').trim() ? `<button type="button" class="mini ok" data-acao="aprova" data-n="${i.n}">✓ Aprovar</button><button type="button" class="mini" data-acao="corrige" data-n="${i.n}">✎ Pedir correção</button>` : '<span class="salvo">Ainda sem síntese do aluno.</span>')
    : (st === 'revisao' ? '<span class="salvo">Enviada · a professora vai ver</span>' : st === 'corrigir' ? '<span class="salvo">Reescreva a síntese com a correção</span>' : '');
  const ro = souProf ? 'readonly' : '';
  return `<article class="card s-${st}" data-n="${i.n}">
    <div class="top"><span>${SEM(i.s)} · ${DIA(i.d)}${i.min ? ` · ⏱ ${i.min} min` : ''}</span><span>${novo(i.n) ? `<button type="button" class="novo" data-visto="${i.n}" title="Marcar como visto">nova correção · ✓ vi</button> ` : ''}<span class="pill p-${st}">${ST[st]}</span></span></div>
    <h3><span lang="ja">${esc(i.tm)}</span></h3>
    ${i.tipo ? `<p class="tipo">${esc(i.tipo)}</p>` : ''}
    ${!i.es ? '' : oculta && !abertosEx.has(i.n) ? `<button type="button" class="verex" data-ex="${i.n}">👁 ver estratégia</button>` : `<div class="estr"><b>Estratégia</b>${esc(i.es)}${oculta ? ` <button type="button" class="verpt" data-ex="${i.n}">ocultar</button>` : ''}</div>`}
    ${i.tx ? `<div class="texto"><div class="tx-top"><b>Texto</b><button type="button" class="som" data-som="${i.n}" aria-label="Ouvir o texto" title="Ouvir o texto">🔊</button></div><div class="jp tx" lang="ja">${window.FraseJP ? FraseJP.html(i.xt, i.tx) : esc(i.tx)}</div></div>` : ''}
    ${i.qq.ops.length === 4 ? blocoQuestao(i, r) : ''}
    ${i.vo ? `<p class="voc"><b>Vocabulário</b> <span lang="ja">${esc(i.vo)}</span></p>` : ''}
    ${i.q ? `<p class="perg">✍️ ${esc(i.q)}</p>` : ''}
    <label class="l" for="f${i.n}">${souProf ? 'SÍNTESE DO ALUNO' : 'MINHA SÍNTESE'}</label>
    <textarea id="f${i.n}" data-f="${i.n}" rows="3" placeholder="${souProf ? 'O aluno ainda não escreveu' : 'Escreva aqui, em português ou em japonês'}" ${ro}>${esc(r.f)}</textarea>
    <div class="num2"><label>${esc(CFG.acRot || 'Acertos')} <input data-ac="${i.n}" value="${esc(r.ac)}" placeholder="${esc(CFG.acPh || 'ex.: 3/4')}" ${ro}></label><label>Tempo (min) <input data-tp="${i.n}" value="${esc(r.tp)}" inputmode="numeric" placeholder="${i.min || ''}" ${ro}></label></div>
    ${corr}
    ${blocoHist(r)}
    <div class="pe"><span class="acoes">${acoes}</span><span class="salvo" id="ok${i.n}" aria-live="polite"></span></div>
  </article>`;
}
function pintaCards(){
  const v = visiveis();
  $('mostra').textContent = `Mostrando ${v.length} de ${itens.length} ${CFG.un[1]}`;
  $('cards').innerHTML = v.map(card).join('') || `<p class="sub">${filtro.st === 'revisao' ? 'Tudo aprovado por aqui ✓' : filtro.st === 'praticar' ? 'Nada para praticar com esse filtro 🎉' : 'Nenhuma estrutura com esse filtro.'}</p>`;
}
/* depois de mudar o status: atualiza números e, se o card não cabe mais no filtro, ele sai da tela */
function depois(n){
  pintaNums(); pintaChips();
  const c = $('cards').querySelector(`.card[data-n="${n}"]`); if (!c) return;
  if (passa(itens[n])) { c.outerHTML = card(itens[n]); return; }
  c.classList.add('saindo'); setTimeout(() => { c.remove(); if (!$('cards').querySelector('.card')) pintaCards(); else $('mostra').textContent = `Mostrando ${visiveis().length} de ${itens.length} ${CFG.un[1]}`; }, 420);
}
$('cards').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f && !souProf) {
    const n = Number(t.dataset.f), antes = stDe(n), tem = !!t.value.trim();
    grava(n, { f: t.value, fm: Date.now(), st: tem ? 'revisao' : 'pendente', ap: false }, $('ok' + n));
    const agora = stDe(n); if (agora !== antes) { const c = t.closest('.card'); c.className = 'card s-' + agora; const p = c.querySelector('.pill'); p.className = 'pill p-' + agora; p.textContent = ST[agora]; pintaNums(); pintaChips(); }
  }
  if (t.dataset.c) { const n = Number(t.dataset.c); grava(n, { c: t.value, cm: Date.now() }, $('ok' + n)); }
  if ((t.dataset.ac || t.dataset.tp) && !souProf) { const n = Number(t.dataset.ac || t.dataset.tp); grava(n, t.dataset.ac ? { ac: t.value } : { tp: t.value }, $('ok' + n)); }
});
$('cards').addEventListener('click', e => {
  const ac = e.target.closest('[data-acao]');
  if (ac) { const n = Number(ac.dataset.n), a = ac.dataset.acao;
    if (a === 'aprova') grava(n, { st: 'feito', ap: true, apm: Date.now(), h: hist(n, { f: resp(n).f, ok: 1 }) }, $('ok' + n));
    if (a === 'corrige') { const ta = $('c' + n); if (!ta.value.trim()) { ta.focus(); ta.placeholder = 'Escreva aqui a correção e toque de novo em “Pedir correção”'; return; } grava(n, { st: 'corrigir', ap: false, cm: Date.now(), h: hist(n, { f: resp(n).f, c: ta.value.trim() }) }, $('ok' + n)); }
    if (a === 'reabre') grava(n, { st: (resp(n).f || '').trim() ? 'revisao' : 'pendente', ap: false }, $('ok' + n));
    depois(n); return; }
  const vv = e.target.closest('[data-visto]'); if (vv) { marcaVisto(Number(vv.dataset.visto)); vv.remove(); pintaChips(); if (filtro.st === 'novas' && !itens.some(i => novo(i.n))) { filtro.st = 'praticar'; pintaChips(); pintaCards(); } return; }
  const x = e.target.closest('[data-ex]'); if (x) { const k = Number(x.dataset.ex); abertosEx.has(k) ? abertosEx.delete(k) : abertosEx.add(k); const c = x.closest('.card'); c.outerHTML = card(itens[Number(x.dataset.ex)]); return; }
  const p = e.target.closest('[data-pt]'); if (p) { const k = Number(p.dataset.pt); abertosPt.has(k) ? abertosPt.delete(k) : abertosPt.add(k); p.closest('.card').outerHTML = card(itens[k]); return; }
  const ob = e.target.closest('[data-op]'); if (ob && !souProf) { const n = Number(ob.dataset.op); grava(n, { op: Number(ob.dataset.k), opm: Date.now() }, $('ok' + n)); const c = $('cards').querySelector(`.card[data-n="${n}"]`); if (c) c.outerHTML = card(itens[n]); return; }
  const rf = e.target.closest('[data-refaz]'); if (rf && !souProf) { const n = Number(rf.dataset.refaz); grava(n, { op: 0 }, $('ok' + n)); const c = $('cards').querySelector(`.card[data-n="${n}"]`); if (c) c.outerHTML = card(itens[n]); return; }
  const s = e.target.closest('[data-som]'); if (s) fala(itens[Number(s.dataset.som)].tx);
});
function fala(t){
  if (window.FraseJP) return FraseJP.fala(t);
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ja-JP'; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
}

/* ---------- flashcard ---------- */
let fcLista = [], fcI = 0, fcVira = false;
$('fc-abre').onclick = () => { fcLista = visiveis().filter(i => stDe(i.n) !== 'feito'); if (!fcLista.length) fcLista = visiveis(); fcI = 0; fcVira = false; fcPinta(); };
function fcPinta(){
  let o = $('fc'); if (!o) { o = document.createElement('div'); o.id = 'fc'; o.className = 'fc'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Modo flashcard'); document.body.appendChild(o); }
  if (!fcLista.length) { o.remove(); return; }
  const i = fcLista[fcI];
  o.innerHTML = `<div class="fc-box"><div class="fc-nav"><b>Flashcard · ${fcI + 1} de ${fcLista.length}</b><button type="button" class="chip" id="fc-x">Fechar ×</button></div>
    <div class="fc-c" id="fc-c" tabindex="0">${fcVira
      ? `<p class="nu" style="font-weight:700">${esc(i.nu)}</p><p lang="ja" style="font-size:18px;margin:0">${FraseJP.html(i.xt, i.x)}</p><p class="pt" style="margin:0;color:var(--muted)">${esc(i.tr)}</p>${resp(i.n).f ? `<p style="margin:6px 0 0;font-size:14px">Sua frase: <span lang="ja">${esc(resp(i.n).f)}</span></p>` : ''}`
      : `<p class="dica">${SEM(i.s)} · ${DIA(i.d)}</p><h3 lang="ja">${esc(i.e)}</h3><p class="dica">Lembra o sentido? Toque para virar.</p>`}</div>
    <div class="fc-nav"><button type="button" class="chip" id="fc-ant">← Anterior</button>${fcVira ? `<span><button type="button" class="chip" id="fc-rev">Revisar de novo</button> <button type="button" class="btn" id="fc-sei" style="background:var(--sage)">Já sei ✓</button></span>` : `<button type="button" class="som" id="fc-som" aria-label="Ouvir">🔊</button>`}<button type="button" class="chip" id="fc-prox">Próximo →</button></div></div>`;
  const vai = d => { fcI = (fcI + d + fcLista.length) % fcLista.length; fcVira = false; fcPinta(); };
  $('fc-c').onclick = e => { if (e.target.closest('.tk')) return; fcVira = !fcVira; fcPinta(); };
  $('fc-x').onclick = () => { o.remove(); pintaCards(); };
  $('fc-ant').onclick = () => vai(-1); $('fc-prox').onclick = () => vai(1);
  if ($('fc-som')) $('fc-som').onclick = () => fala(i.x);
  if ($('fc-sei')) $('fc-sei').onclick = () => vai(1);
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
/* ↺ Recomeçar tudo: apaga as respostas desta atividade (alternativas, sínteses, acertos, tempo e correções) */
async function recomeca(){
  if (souProf) return;
  if (!confirm('Recomeçar tudo?\n\nIsso apaga as suas respostas desta atividade: alternativas, sínteses, acertos, tempo e as correções da professora. Não dá para desfazer.')) return;
  const b = $('recomeca'); if (b) { b.disabled = true; b.textContent = 'apagando…'; }
  try { await setDoc(doc(db, 'atividades', alvo), { [A.id]: {} }, { mergeFields: [A.id] }); }
  catch (e) { console.warn(e); if (b) { b.disabled = false; b.textContent = '⚠️ não deu, tentar de novo'; } return; }
  R = {}; try { localStorage.removeItem(chaveLocal()); } catch (e) {}
  if (b) { b.disabled = false; b.textContent = '↺ Recomeçar tudo'; }
  pintaNums(); pintaChips(); pintaCards();
}
function botaoRecomeca(){ const b = $('recomeca'); if (!b) return; b.hidden = souProf; b.onclick = recomeca; }
const trava = on => document.querySelectorAll('#nums,#sems,.ferr,#mostra,#cards').forEach(el => el.hidden = on);
/* ao vivo: o que o aluno (ou a professora) muda em outro aparelho aparece aqui sem recarregar. Só lê, nunca grava. */
let pararVivo = null;
function aoVivo(){
  if (pararVivo) { pararVivo(); pararVivo = null; }
  if (!nuvem || !liberado) return;
  pararVivo = onSnapshot(doc(db, 'atividades', alvo), s => {
    if (s.metadata.hasPendingWrites || !s.exists()) return;
    const d = s.data()[A.id] || {}, mud = [];
    Object.keys(d).forEach(n => { if (d[n] && (d[n].m || 0) > ((R[n] || {}).m || 0)) { R[n] = d[n]; mud.push(Number(n)); } });
    if (!mud.length) return;
    pintaNums(); pintaChips();
    mud.forEach(n => {
      const c = $('cards').querySelector(`.card[data-n="${n}"]`);
      if (c && c.contains(document.activeElement)) return; /* não atrapalha quem está digitando neste card */
      if (c) { if (passa(itens[n])) { c.outerHTML = card(itens[n]); const nc = $('cards').querySelector(`.card[data-n="${n}"]`); if (nc) { nc.classList.add('chegou'); setTimeout(() => nc.classList.remove('chegou'), 1600); } } else depois(n); }
      else if (passa(itens[n])) pintaCards();
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
  leVisto(); filtro.st = souProf ? (itens.some(i => stDe(i.n) === 'revisao') ? 'revisao' : 'praticar') : (itens.some(i => novo(i.n)) ? 'novas' : 'praticar');
  trava(false); botaoRecomeca(); pintaNums(); pintaChips(); pintaCards();
}
/* "✎ Eu (testar)": a professora faz a atividade como aluna, na própria conta, sem misturar com os alunos */
let TESTE = false;
onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(); souProf = PROFS.includes(eu);
  const pedido = (new URLSearchParams(location.search).get('aluno') || '').toLowerCase();
  if (souProf && window.FraseJP && FraseJP.botaoProf) FraseJP.botaoProf(A.id, 'dokkai');
  if (!souProf) { $('quem').innerHTML = ''; return abre(eu); }
  let alunos = [];
  try { alunos = (await getDocs(collection(db, 'aulas'))).docs.map(d => ({ id: d.id, nome: d.data().nome || d.id })).sort((a, b) => a.nome.localeCompare(b.nome)); } catch (e) {}
  const ini = pedido || (alunos[0] && alunos[0].id) || eu;
  alunos = [{ id: eu, nome: '✎ Eu (testar)' }].concat(alunos.filter(a => a.id !== eu));
  const nomeDe = id => (alunos.find(a => a.id === id) || { nome: id }).nome;
  const modo = id => { const m = $('modo'); if (!m) return;
    m.innerHTML = id === eu ? '<b>✎ Você está testando como aluna.</b> As suas respostas ficam só na sua conta.'
      : `👁 Vendo as respostas de <b>${esc(nomeDe(id))}</b>: você escreve as correções. Para fazer a atividade, escolha “✎ Eu (testar)”.`; };
  const trocaAlvo = id => { TESTE = id === eu; souProf = !TESTE; modo(id); abre(id); };
  $('quem').innerHTML = `<span class="pill p-feito">Você está como professora</span><label for="al">Aluno:</label><select id="al">${alunos.map(a => `<option value="${esc(a.id)}"${a.id === ini ? ' selected' : ''}>${esc(a.nome)}</option>`).join('')}</select><p class="aviso" id="modo" style="flex-basis:100%;margin:6px 0 0"></p>`;
  $('al').onchange = () => { history.replaceState(null, '', '?aluno=' + encodeURIComponent($('al').value)); trocaAlvo($('al').value); };
  trocaAlvo(ini);
});
