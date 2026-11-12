/* Unirversos · Mural da comunidade (Paralelos)
   Lê os três diários que já existiam (diario/{ja|en|pt}/posts) e mostra tudo junto, em ordem de data.
   Posts novos continuam nessas mesmas coleções ({ texto, nome, uid, criadoEm }), com o idioma escolhido.
   Reações e respostas ficam em mural_reacoes e mural_respostas: só aparecem quando as regras do Firestore as permitem. */
import { auth, db, entrar } from "/idiomas/dados/conta.js?v=2";
import { collection, query, orderBy, limit, onSnapshot, addDoc, setDoc, deleteDoc, doc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const MOD = 'unirversos.idiomas@gmail.com';
const LANGS = ['ja', 'en', 'pt'];
const ROTULO = { ja: '日本語', en: 'English', pt: 'Português' };
const HTML_LANG = { ja: 'ja', en: 'en', pt: 'pt-BR' };
const MAX = 280;
const REACOES = [
  { k: 'entendi', t: 'Entendi!', d: 'M5 13l4 4L19 7' },
  { k: 'frase', t: 'Boa frase', d: 'M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z' },
  { k: 'inspirou', t: 'Me inspirou', d: 'M12 3l2.2 5.6L20 9.3l-4.4 3.8L17 19l-5-3-5 3 1.4-5.9L4 9.3l5.8-.7z' }
];
/* um tema por semana, em ciclo; a semana 1 começa na segunda-feira 9/11/2026 */
const TEMAS = ["Um som que ouvi hoje","O que comi hoje","Uma cor que vi hoje","Um cheiro que me lembrou alguém","Algo macio ou áspero que toquei hoje","O clima de hoje, em uma frase",
"O caminho que fiz hoje","Uma coisa pequena que me fez sorrir","O que tem na minha mesa agora","Minha manhã em três ações","Uma conversa curta que tive hoje","Algo que eu quase esqueci de fazer",
"Um lugar onde me sinto bem","Uma lembrança de infância","Uma comida da minha família","A janela de onde escrevo","Uma música que não sai da minha cabeça","Um lugar que quero visitar",
"Algo pelo qual sou grata hoje","Alguém que me inspira","Um momento em que me senti corajosa","O que me deixou cansada e o que me deu energia","Um conselho que eu daria para mim mesma","Uma palavra que define minha semana",
"Uma palavra nova que aprendi","Algo que eu ainda não sei dizer no idioma que estudo","O que mais me surpreende no Japão (ou na cultura que estudo)","Uma frase que ouvi e quero guardar","Meu plano para o próximo mês","Algo que mudou desde que comecei a estudar"];

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const lista = $('mural'), form = $('formPost'), porta = $('diarioEntrar'), nomeEl = $('author'), textoEl = $('text'), aviso = $('diarioAviso'), abas = $('abas'), escolha = $('escolhaLang');
let user = null, filtro = 'todos', langNovo = 'pt';
const porLang = { ja: [], en: [], pt: [] };
let reac = [], resp = [], recursos = true, carregou = 0, abertas = {}, rascunho = {};

/* tema da semana */
(function(){
  const ini = new Date(2026, 10, 9), hoje = new Date(); hoje.setHours(0,0,0,0);
  const sem = Math.floor(Math.round((hoje - ini) / 864e5) / 7);
  const i = ((sem % TEMAS.length) + TEMAS.length) % TEMAS.length;
  $('temaTitulo').textContent = TEMAS[i];
  $('temaSemana').textContent = 'Semana ' + (i + 1) + ' de ' + TEMAS.length + ' · muda toda segunda-feira';
  textoEl.placeholder = TEMAS[i] + '…';
})();

/* idioma escolhido e filtro (vem de ?l= quando alguém usa os links antigos) */
try {
  const l = new URLSearchParams(location.search).get('l');
  if (LANGS.includes(l)) filtro = l;
  const s = localStorage.getItem('uniMuralLang'); if (LANGS.includes(s)) langNovo = s;
  if (LANGS.includes(l)) langNovo = l;
  const n = localStorage.getItem('uniDiarioNome'); if (n) nomeEl.value = n;
} catch (e) {}

function pintaAbas(){
  abas.innerHTML = [['todos','Todos']].concat(LANGS.map(l => [l, ROTULO[l]])).map(([k, t]) =>
    `<button type="button" class="chip${filtro === k ? ' on' : ''}" data-f="${k}" aria-pressed="${filtro === k}">${t}</button>`).join('');
  escolha.innerHTML = LANGS.map(l =>
    `<button type="button" class="chip${langNovo === l ? ' on' : ''}" data-l="${l}" aria-pressed="${langNovo === l}">${ROTULO[l]}</button>`).join('');
}
abas.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; filtro = b.dataset.f; pintaAbas(); desenha(); });
escolha.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; langNovo = b.dataset.l; try { localStorage.setItem('uniMuralLang', langNovo); } catch (x) {} pintaAbas(); });

/* contador */
const conta = document.createElement('p');
conta.className = 'conta'; conta.setAttribute('aria-live', 'polite');
textoEl.insertAdjacentElement('afterend', conta);
function atualizaConta(){ const r = MAX - textoEl.value.length; conta.textContent = r + '/' + MAX + ' caracteres restantes'; conta.classList.toggle('alerta', r <= 20); }
textoEl.addEventListener('input', atualizaConta); atualizaConta();

function data(ts){
  const d = ts && ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
const ico = d => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const souMod = () => !!(user && user.email === MOD && user.emailVerified);

function desenha(){
  const foco = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.resp : null;
  const todos = [].concat(porLang.ja, porLang.en, porLang.pt).filter(p => filtro === 'todos' || p.lang === filtro)
    .sort((a, b) => ((b.criadoEm && b.criadoEm.seconds) || 9e12) - ((a.criadoEm && a.criadoEm.seconds) || 9e12)).slice(0, 80);
  if (carregou < 3 && !todos.length) { lista.innerHTML = '<div class="vazio"><p>Carregando os registros…</p></div>'; return; }
  if (!todos.length) { lista.innerHTML = '<div class="vazio"><p>O mural está aberto. Deixe aqui o seu primeiro registro. 🌱</p></div>'; return; }
  lista.innerHTML = todos.map(p => {
    const chave = p.lang + '_' + p.id, meu = user && p.uid === user.uid;
    const rs = recursos ? resp.filter(r => r.post === p.lang + '/' + p.id) : [];
    const barra = recursos ? REACOES.map(r => {
      const mine = user && reac.some(x => x.id === `${chave}_${user.uid}_${r.k}`);
      const n = reac.filter(x => x.post === p.lang + '/' + p.id && x.tipo === r.k).length;
      return `<button type="button" class="reacao${mine ? ' on' : ''}" data-reage="${esc(chave)}" data-k="${r.k}" aria-pressed="${!!mine}">${ico(r.d)}<span>${r.t}</span>${n ? `<b>${n}</b>` : ''}</button>`;
    }).join('') : '';
    const acao = (meu || souMod())
      ? `<button type="button" class="mini" data-apaga="${esc(chave)}">apagar</button>`
      : `<a class="mini" href="mailto:${MOD}?subject=${encodeURIComponent('Denúncia no mural · ' + p.lang + '/' + p.id)}">Denunciar</a>`;
    const respostas = rs.map(r => `<div class="resp"><span class="resp-nome">${esc(r.nome || 'Aprendiz')} <span>respondeu</span></span><span class="resp-txt">${esc(r.texto)}</span>${(user && r.uid === user.uid) || souMod() ? `<button type="button" class="mini" data-apaga-r="${esc(r.id)}">apagar</button>` : ''}</div>`).join('');
    const abre = abertas[chave];
    const campo = abre ? `<form class="resp-form" data-form="${esc(chave)}"><label class="sr" for="r-${esc(chave)}">Sua resposta</label><input id="r-${esc(chave)}" data-resp="${esc(chave)}" maxlength="${MAX}" autocomplete="off" placeholder="Escreva uma resposta curta…" value="${esc(rascunho[chave] || '')}"><button type="submit" class="btn peq">Enviar</button></form>` : '';
    return `<article class="post">
      <div class="post-top"><div class="quem"><span class="av">${esc((p.nome || 'A').trim().charAt(0).toUpperCase())}</span><div><b>${esc(p.nome || 'Aprendiz')}</b><span class="quando">${esc(data(p.criadoEm))}</span></div></div><span class="etq">${ROTULO[p.lang]}</span></div>
      <p class="texto" lang="${HTML_LANG[p.lang]}">${esc(p.texto)}</p>
      <div class="rodape">${barra}<span class="esp"></span>${recursos ? `<button type="button" class="mini forte" data-responder="${esc(chave)}">Responder${rs.length ? ' · ' + rs.length : ''}</button>` : ''}${acao}</div>
      ${respostas}${campo}
    </article>`;
  }).join('');
  if (foco) { const el = lista.querySelector(`[data-resp="${CSS.escape(foco)}"]`); if (el) { el.focus(); const v = el.value; el.value = ''; el.value = v; } }
}

lista.addEventListener('input', e => { const i = e.target.closest('[data-resp]'); if (i) rascunho[i.dataset.resp] = i.value; });
lista.addEventListener('click', async e => {
  const t = e.target;
  const ap = t.closest('[data-apaga]');
  if (ap) { if (!confirm('Apagar este registro? Não dá para desfazer.')) return;
    const [l, ...r] = ap.dataset.apaga.split('_'); try { await deleteDoc(doc(db, 'diario', l, 'posts', r.join('_'))); } catch (x) { console.warn(x); } return; }
  const apr = t.closest('[data-apaga-r]');
  if (apr) { if (!confirm('Apagar esta resposta?')) return; try { await deleteDoc(doc(db, 'mural_respostas', apr.dataset.apagaR)); } catch (x) { console.warn(x); } return; }
  const rp = t.closest('[data-responder]');
  if (rp) { if (!user) { entrar(LOGIN); return; } const k = rp.dataset.responder; abertas[k] = !abertas[k]; desenha(); if (abertas[k]) { const el = lista.querySelector(`[data-resp="${CSS.escape(k)}"]`); if (el) el.focus(); } return; }
  const re = t.closest('[data-reage]');
  if (re) {
    if (!user) { entrar(LOGIN); return; }
    const chave = re.dataset.reage, k = re.dataset.k, id = `${chave}_${user.uid}_${k}`;
    try {
      if (reac.some(x => x.id === id)) await deleteDoc(doc(db, 'mural_reacoes', id));
      else { const [l, ...r] = chave.split('_'); await setDoc(doc(db, 'mural_reacoes', id), { post: l + '/' + r.join('_'), tipo: k, uid: user.uid, criadoEm: serverTimestamp() }); }
    } catch (x) { console.warn(x); }
  }
});
lista.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  const chave = f.dataset.form, inp = f.querySelector('input'), texto = inp.value.trim().slice(0, MAX); if (!texto || !user) return;
  const [l, ...r] = chave.split('_'), nome = (nomeEl.value.trim() || (user.displayName || '').split(' ')[0] || 'Aprendiz').slice(0, 40);
  try { await addDoc(collection(db, 'mural_respostas'), { post: l + '/' + r.join('_'), texto, nome, uid: user.uid, criadoEm: serverTimestamp() }); rascunho[chave] = ''; abertas[chave] = false; desenha(); }
  catch (x) { console.warn(x); inp.setCustomValidity('Não consegui enviar a resposta. Tente de novo.'); inp.reportValidity(); inp.setCustomValidity(''); }
});

/* leitura: os três diários antigos, juntos */
LANGS.forEach(l => {
  onSnapshot(query(collection(db, 'diario', l, 'posts'), orderBy('criadoEm', 'desc'), limit(40)),
    snap => { porLang[l] = snap.docs.map(d => ({ id: d.id, lang: l, ...d.data() })); carregou = Math.max(carregou, 0); marca(l); desenha(); },
    err => { console.warn(err); marca(l); lista.innerHTML = '<div class="vazio"><p>Não consegui carregar os registros agora. Confira a internet e recarregue a página.</p></div>'; });
});
const ok = new Set(); function marca(l){ ok.add(l); carregou = ok.size; }

/* reações e respostas (opcionais) */
onSnapshot(query(collection(db, 'mural_reacoes'), limit(3000)), s => { reac = s.docs.map(d => ({ id: d.id, ...d.data() })); desenha(); }, err => { console.warn('reações indisponíveis', err.code); recursos = false; desenha(); });
onSnapshot(query(collection(db, 'mural_respostas'), orderBy('criadoEm', 'asc'), limit(1000)), s => { resp = s.docs.map(d => ({ id: d.id, ...d.data() })); desenha(); }, err => { console.warn('respostas indisponíveis', err.code); recursos = false; desenha(); });

const LOGIN = { titulo: 'Crie sua conta grátis para participar', texto: 'Qualquer pessoa pode ler o mural. Para escrever, reagir ou responder, você precisa de uma conta, e assim pode apagar o que publicou.', peq: 'Guardamos só o seu e-mail e o que você publicar.' };
function estado(){ form.hidden = !user; porta.hidden = !!user; if (user && !nomeEl.value) nomeEl.value = (user.displayName || '').split(' ')[0]; desenha(); }
onAuthStateChanged(auth, u => { user = u; estado(); });
porta.querySelector('button').onclick = () => entrar(LOGIN);

form.addEventListener('submit', async e => {
  e.preventDefault(); aviso.textContent = '';
  if (!user) { entrar(LOGIN); return; }
  const texto = textoEl.value.trim().slice(0, MAX), nome = (nomeEl.value.trim() || 'Aprendiz').slice(0, 40);
  if (!texto) return;
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await addDoc(collection(db, 'diario', langNovo, 'posts'), { texto, nome, uid: user.uid, criadoEm: serverTimestamp() });
    try { localStorage.setItem('uniDiarioNome', nome); } catch (x) {}
    textoEl.value = ''; atualizaConta(); textoEl.focus();
  } catch (x) { console.warn(x); aviso.textContent = 'O seu registro não foi publicado. Tente de novo.'; }
  btn.disabled = false;
});
pintaAbas(); desenha();
