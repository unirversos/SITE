/* Unirversos · Diário trilíngue (Paralelos)
   Posts públicos no Firestore: diario/{ja|en|pt}/posts/{id}
   { texto, nome, uid, criadoEm }  — qualquer pessoa lê; para publicar precisa de conta.
   Quem publicou pode apagar o próprio post; a Unirversos também pode (moderação). */
import { auth, db, entrar } from "/idiomas/dados/conta.js?v=2";
import { collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const LANG = document.documentElement.dataset.diario;           // ja | en | pt
const EN = LANG === 'en';
const MOD = 'unirversos.idiomas@gmail.com';
const T = EN ? {
  entrar: 'Sign in to post', sair: 'sign out',
  login: { titulo: 'Create your free account to post', texto: 'Anyone can read the diary. To publish, you need an account, so you can delete your own posts later.', peq: 'We keep only your e-mail and what you publish.' },
  vazio: 'The notebook is open. Leave your first sentence in English here today. 🌱', resta: 'characters left', carregando: 'Loading posts…',
  erro: 'Could not load the posts right now. Check your connection and reload the page.',
  falhou: 'Your post was not published. Try again.', apagar: 'delete', denunciar: 'report',
  confirma: 'Delete this post? This cannot be undone.', anon: 'Learner', data: 'en-US'
} : {
  entrar: 'Entrar para publicar', sair: 'sair',
  login: { titulo: 'Crie sua conta grátis para publicar', texto: 'Qualquer pessoa pode ler o diário. Para publicar, você precisa de uma conta, e assim pode apagar os seus posts depois.', peq: 'Guardamos só o seu e-mail e o que você publicar.' },
  vazio: LANG === 'ja' ? 'O caderno está aberto. Deixe aqui a sua primeira frase em japonês hoje. 🌱' : 'O caderno está aberto. Deixe aqui a sua primeira frase em português hoje. 🌱', resta: 'caracteres restantes', carregando: 'Carregando os posts…',
  erro: 'Não consegui carregar os posts agora. Confira a internet e recarregue a página.',
  falhou: 'O seu post não foi publicado. Tente de novo.', apagar: 'apagar', denunciar: 'denunciar',
  confirma: 'Apagar este post? Não dá para desfazer.', anon: 'Aprendiz', data: LANG === 'ja' ? 'ja-JP' : 'pt-BR'
};

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const lista = $('postsContainer'), form = $('formPost'), porta = $('diarioEntrar'), nomeEl = $('author'), textoEl = $('text'), aviso = $('diarioAviso');
let user = null, posts = [];

/* contador decrescente: quanto espaço ainda sobra */
const MAX = 280, conta = document.createElement('p');
conta.className = 'conta'; conta.setAttribute('aria-live', 'polite');
conta.style.cssText = 'margin:6px 0 0;font-size:13px;text-align:right;color:#6e6370';
textoEl.insertAdjacentElement('afterend', conta);
function atualizaConta(){
  const r = MAX - textoEl.value.length;
  conta.textContent = `${r}/${MAX} · ${T.resta}`;
  conta.style.color = r <= 20 ? '#b3261e' : '#6e6370'; conta.style.fontWeight = r <= 20 ? '700' : '400';
}
textoEl.addEventListener('input', atualizaConta); atualizaConta();

const NOME_KEY = 'uniDiarioNome';
try { const n = localStorage.getItem(NOME_KEY); if (n) nomeEl.value = n; } catch (e) {}

function data(ts){
  const d = ts && ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleDateString(T.data, { year: 'numeric', month: 'long', day: 'numeric' });
}
function desenha(){
  if (!posts.length) { lista.innerHTML = `<div class="empty-state"><p>${T.vazio}</p></div>`; return; }
  const souMod = user && user.email === MOD && user.emailVerified;
  lista.innerHTML = posts.map(p => {
    const meu = user && p.uid === user.uid;
    const acoes = (meu || souMod)
      ? `<button type="button" class="post-acao" data-apaga="${esc(p.id)}">${T.apagar}</button>`
      : `<a class="post-acao" href="mailto:${MOD}?subject=${encodeURIComponent('Denúncia no diário ' + LANG + ' · ' + p.id)}">${T.denunciar}</a>`;
    return `<article class="post">
      <div class="post-header"><span class="post-author">${esc(p.nome || T.anon)}</span><span class="post-date">${esc(data(p.criadoEm))}</span></div>
      <div class="post-text" lang="${LANG}">${esc(p.texto)}</div>
      <div class="post-pe">${acoes}</div>
    </article>`;
  }).join('');
}
lista.addEventListener('click', async e => {
  const b = e.target.closest('[data-apaga]'); if (!b) return;
  if (!confirm(T.confirma)) return;
  try { await deleteDoc(doc(db, 'diario', LANG, 'posts', b.dataset.apaga)); } catch (x) { console.warn(x); }
});

lista.innerHTML = `<div class="empty-state"><p>${T.carregando}</p></div>`;
onSnapshot(query(collection(db, 'diario', LANG, 'posts'), orderBy('criadoEm', 'desc'), limit(60)),
  snap => { posts = snap.docs.map(d => ({ id: d.id, ...d.data() })); desenha(); },
  err => { console.warn(err); lista.innerHTML = `<div class="empty-state"><p>${T.erro}</p></div>`; });

function estado(){
  form.hidden = !user; porta.hidden = !!user;
  if (user && !nomeEl.value) nomeEl.value = (user.displayName || '').split(' ')[0];
  desenha();
}
onAuthStateChanged(auth, u => { user = u; estado(); });
porta.querySelector('button').onclick = () => entrar(T.login);

form.addEventListener('submit', async e => {
  e.preventDefault(); aviso.textContent = '';
  if (!user) { entrar(T.login); return; }
  const texto = textoEl.value.trim().slice(0, 280), nome = (nomeEl.value.trim() || T.anon).slice(0, 40);
  if (!texto) return;
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await addDoc(collection(db, 'diario', LANG, 'posts'), { texto, nome, uid: user.uid, criadoEm: serverTimestamp() });
    try { localStorage.setItem(NOME_KEY, nome); } catch (x) {}
    textoEl.value = ''; atualizaConta(); textoEl.focus();
  } catch (x) { console.warn(x); aviso.textContent = T.falhou; }
  btn.disabled = false;
});
