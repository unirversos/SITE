/* Unirversos · conta e progresso
   - Páginas com <html data-login="obrigatorio"> pedem login (e-mail/senha ou Google).
   - O progresso continua sendo gravado no navegador (localStorage), como antes, e é
     copiado para a conta (Firestore: progress/{uid}, campo "idiomas"). Ao entrar, o que
     já estava no navegador soma com o que está na conta.
   Usa o mesmo projeto Firebase da autoanálise. */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CFG = {
  apiKey: "AIzaSyCoo0UB5rWjD4ZGE3xKO32zXYPUQFYObmc",
  authDomain: "unirversos-site.firebaseapp.com",
  projectId: "unirversos-site",
  storageBucket: "unirversos-site.firebasestorage.app",
  messagingSenderId: "608479693630",
  appId: "1:608479693630:web:38240bf82e09d72fd5ba6f"
};
/* chaves do progresso de Idiomas que vão para a conta */
const KEYS = ['utopiaAvatar1','utopiaSave1','utopiaKana1','utopiaMapas1','utopiaPulos1',
  'aulaZeroCompleted','aulaZeroPulada','utopiaRomaji'];

const app = getApps()[0] || initializeApp(CFG);
const auth = getAuth(app);
const db = getFirestore(app);
const html = document.documentElement;
const OBRIG = html.dataset.login === 'obrigatorio';

/* ---------- estilos ---------- */
const st = document.createElement('style');
st.textContent = `
#uni-gate{position:fixed;inset:0;z-index:9999;background:rgba(253,246,244,.97);display:grid;place-items:center;padding:20px;font-family:"Zen Maru Gothic","Hiragino Maru Gothic ProN",system-ui,sans-serif;color:#3a2b38;overflow:auto}
#uni-gate .cx{background:#fff;border:1.5px solid #ecdadd;border-radius:22px;padding:28px 26px;max-width:420px;width:100%;display:grid;gap:12px;box-shadow:0 18px 40px -24px rgba(58,43,56,.4)}
#uni-gate h2{font-family:"Baloo 2",system-ui,sans-serif;font-size:26px;line-height:1.15;margin:0}
#uni-gate p{margin:0;font-size:14.5px;color:#6b5a67;line-height:1.55}
#uni-gate .tabs{display:flex;gap:6px;background:#fdf6f4;border-radius:999px;padding:4px}
#uni-gate .tabs button{flex:1;border:0;background:none;font:inherit;font-weight:700;font-size:14px;padding:8px;border-radius:999px;cursor:pointer;color:#6b5a67}
#uni-gate .tabs button[aria-pressed="true"]{background:#3a2b38;color:#fff}
#uni-gate form{display:grid;gap:8px}
#uni-gate input{font:inherit;padding:10px 12px;border:1.5px solid #ecdadd;border-radius:12px;width:100%;box-sizing:border-box}
#uni-gate .pri{font:inherit;font-weight:700;border:0;background:#c23f5e;color:#fff;padding:11px;border-radius:999px;cursor:pointer}
#uni-gate .gg{font:inherit;font-weight:700;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;padding:10px;border-radius:999px;cursor:pointer}
#uni-gate .ou{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#6b5a67}
#uni-gate .ou::before,#uni-gate .ou::after{content:"";flex:1;height:1px;background:#ecdadd}
#uni-gate .err{color:#b3261e;font-size:13px;min-height:1.2em}
#uni-gate .peq{font-size:12.5px}
#uni-gate a{color:#c23f5e}
#uni-gate .lk{border:0;background:none;color:#c23f5e;font:inherit;font-size:13px;cursor:pointer;padding:0;justify-self:start;text-decoration:underline}
.uni-chip{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#6b5a67;white-space:nowrap}
.uni-chip button{border:1px solid #ecdadd;background:#fff;border-radius:999px;padding:3px 10px;font:inherit;font-size:12.5px;cursor:pointer;color:#6b5a67}
.uni-chip.solta{position:fixed;right:12px;bottom:12px;z-index:50;background:#fff;border:1px solid #ecdadd;border-radius:999px;padding:4px 6px 4px 12px;box-shadow:0 6px 16px -10px rgba(58,43,56,.4)}
`;
document.head.appendChild(st);

const ERR = {
  'auth/invalid-email':'E-mail inválido.', 'auth/user-not-found':'Não achei essa conta. Quer criar uma?',
  'auth/wrong-password':'Senha incorreta.', 'auth/invalid-credential':'E-mail ou senha incorretos.',
  'auth/email-already-in-use':'Esse e-mail já tem conta. Use "Entrar".', 'auth/weak-password':'A senha precisa de pelo menos 6 caracteres.',
  'auth/popup-closed-by-user':'A janela do Google foi fechada antes de terminar.', 'auth/popup-blocked':'O navegador bloqueou a janela do Google. Libere e tente de novo.',
  'auth/network-request-failed':'Sem conexão. Confira a internet e tente de novo.', 'auth/too-many-requests':'Muitas tentativas. Espere um pouco e tente de novo.'
};
const msg = e => ERR[e && e.code] || 'Algo deu errado. Tente de novo.';

/* ---------- portão de login ---------- */
let modo = 'criar';
/* opc: { titulo, texto } — abre o mesmo portão, com botão de fechar (para quem não é página obrigatória) */
function gate(opc){
  if (document.getElementById('uni-gate')) return;
  const fecha = !!opc; opc = opc || {};
  const g = document.createElement('div'); g.id = 'uni-gate'; g.setAttribute('role','dialog'); g.setAttribute('aria-modal','true'); g.setAttribute('aria-labelledby','uni-gate-t');
  g.innerHTML = `<div class="cx">
    <h2 id="uni-gate-t">${opc.titulo || 'Crie sua conta grátis para começar'}</h2>
    <p>${opc.texto || 'Com a conta, o seu avatar, as aulas feitas e os carimbos ficam guardados e vão junto para qualquer celular ou computador.'}</p>
    <div class="tabs" role="group" aria-label="Escolha"><button type="button" data-m="criar" aria-pressed="true">Criar conta</button><button type="button" data-m="entrar" aria-pressed="false">Já tenho conta</button></div>
    <button type="button" class="gg" id="uni-g">Continuar com o Google</button>
    <div class="ou">ou com e-mail</div>
    <form id="uni-f"><input type="email" id="uni-e" placeholder="Seu e-mail" autocomplete="email" required>
      <input type="password" id="uni-s" placeholder="Senha (mínimo 6 caracteres)" autocomplete="new-password" minlength="6" required>
      <button type="submit" class="pri" id="uni-b">Criar conta</button></form>
    <button type="button" class="lk" id="uni-esq" hidden>Esqueci a senha</button>
    <p class="err" id="uni-err" aria-live="polite"></p>
    <p class="peq">${opc.peq || 'Guardamos só o seu e-mail e o seu progresso nos estudos.'} <a href="/privacidade/">Como cuidamos dos seus dados</a>${fecha ? '' : ' · <a href="/idiomas/">voltar para Idiomas</a>'}</p>
    ${fecha ? '<button type="button" class="lk" id="uni-x">fechar</button>' : ''}
  </div>`;
  document.body.appendChild(g);
  if (fecha) { document.getElementById('uni-x').onclick = tiraGate; g.addEventListener('keydown', e => { if (e.key === 'Escape') tiraGate(); }); }
  const $ = id => document.getElementById(id), err = t => { $('uni-err').textContent = t || ''; };
  g.querySelector('.tabs').onclick = e => { const b = e.target.closest('button[data-m]'); if (!b) return; modo = b.dataset.m;
    g.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('uni-b').textContent = modo === 'criar' ? 'Criar conta' : 'Entrar';
    $('uni-s').autocomplete = modo === 'criar' ? 'new-password' : 'current-password';
    $('uni-esq').hidden = modo === 'criar'; err(''); };
  $('uni-g').onclick = async () => { err(''); try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { err(msg(e)); } };
  $('uni-f').onsubmit = async e => { e.preventDefault(); err(''); const em = $('uni-e').value.trim(), pw = $('uni-s').value;
    try { if (modo === 'criar') await createUserWithEmailAndPassword(auth, em, pw); else await signInWithEmailAndPassword(auth, em, pw); } catch (x) { err(msg(x)); } };
  $('uni-esq').onclick = async () => { const em = $('uni-e').value.trim(); if (!em) { err('Escreva o seu e-mail acima e clique de novo.'); return; }
    try { await sendPasswordResetEmail(auth, em); err('Mandamos um link para trocar a senha no seu e-mail.'); } catch (x) { err(msg(x)); } };
}
function tiraGate(){ const g = document.getElementById('uni-gate'); if (g) g.remove(); }

/* ---------- chip "logada como" ---------- */
function chip(user){
  document.querySelectorAll('.uni-chip').forEach(c => c.remove());
  if (!user) return;
  const c = document.createElement('span'); c.className = 'uni-chip';
  const nome = (user.displayName || user.email || 'você').split(' ')[0].split('@')[0];
  c.innerHTML = `👤 ${nome.replace(/[<>&"]/g,'')} <button type="button">sair</button>`;
  c.querySelector('button').onclick = async () => { await enviar(); await signOut(auth); };
  const alvo = document.querySelector('.sitebar .navlinks') || document.querySelector('.nav .links');
  if (alvo) alvo.appendChild(c); else { c.classList.add('solta'); document.body.appendChild(c); }
}

/* ---------- sincronização do progresso ---------- */
const parse = v => { if (v == null) return null; try { return JSON.parse(v); } catch (e) { return v; } };
function junta(a, b){
  if (a == null) return b; if (b == null) return a;
  if (Array.isArray(a) && Array.isArray(b)) { const s = new Map(); [...a, ...b].forEach(x => s.set(JSON.stringify(x), x)); return [...s.values()]; }
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const o = {}; new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { o[k] = junta(a[k], b[k]); }); return o; }
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return a === true || b === true || a === 'true' || b === 'true';
  if (a === 'true' || b === 'true') return 'true';
  return a === '' ? b : a;
}
const setOrig = Storage.prototype.setItem;
let uid = null, timer = null, pronto = false;
function local(){ const o = {}; KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (e) {} }); return o; }
async function enviar(){
  if (!uid || !pronto) return; clearTimeout(timer); timer = null;
  try { await setDoc(doc(db, 'progress', uid), { idiomas: local(), idiomasAtualizado: new Date().toISOString() }, { merge: true }); } catch (e) { console.warn('progresso não enviado', e); }
}
function agenda(){ if (!uid || !pronto) return; clearTimeout(timer); timer = setTimeout(enviar, 1500); }
Storage.prototype.setItem = function(k, v){ setOrig.call(this, k, v); if (this === window.localStorage && KEYS.includes(k)) agenda(); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) enviar(); });

async function puxa(user){
  uid = user.uid; let mudou = false;
  try {
    const snap = await getDoc(doc(db, 'progress', uid));
    const rem = (snap.exists() && snap.data().idiomas) || {};
    KEYS.forEach(k => {
      const lv = (() => { try { return localStorage.getItem(k); } catch (e) { return null; } })();
      const rv = rem[k] == null ? null : rem[k];
      if (rv == null) return;
      const j = junta(parse(lv), parse(rv));
      const nv = typeof j === 'string' ? j : JSON.stringify(j);
      if (nv !== lv) { try { setOrig.call(localStorage, k, nv); mudou = true; } catch (e) {} }
    });
  } catch (e) { console.warn('não consegui ler o progresso da conta', e); }
  pronto = true; await enviar();
  /* a página leu o progresso antes do login: recarrega uma vez para mostrar o que veio da conta */
  if (mudou) { try { if (!sessionStorage.getItem('uniRecarregou')) { sessionStorage.setItem('uniRecarregou', '1'); location.reload(); return; } } catch (e) {} }
  try { sessionStorage.removeItem('uniRecarregou'); } catch (e) {}
  document.dispatchEvent(new CustomEvent('uni-progresso'));
}

/* ---------- estado do login ---------- */
const entrar = opc => gate(opc || {});
window.UniConta = { auth, db, entrar, sair: () => signOut(auth), enviar };
export { auth, db, entrar };
onAuthStateChanged(auth, async user => {
  if (user) {
    tiraGate(); html.classList.add('uni-ok'); chip(user);
    await puxa(user);
  } else {
    uid = null; pronto = false; chip(null);
    if (OBRIG) gate(); else html.classList.add('uni-ok');
  }
  document.dispatchEvent(new CustomEvent('uni-conta', { detail: { user } }));
});
