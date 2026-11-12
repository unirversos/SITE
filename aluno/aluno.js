/* Unirversos · Área do aluno: perfil, trilha, aula particular (se houver) e conta.
   O caderno da página é o mesmo de /idiomas/caderno/ (caderno-dados.js + caderno-caneta.js). */
import { auth, db } from "/idiomas/dados/conta.js?v=5";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { proximas } from "/aulas/aulas-comum.js?v=2";

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const ler = k => { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } };

/* ---------- perfil ---------- */
function perfil(u){
  const A = window.UtopiaAvatar, a = A && A.load(), g = ler('utopiaSave1') || {};
  const nome = (a && a.profile && (a.profile.name || a.profile.kata)) || (u && (u.displayName || '').split(' ')[0]) || (u && u.email.split('@')[0]) || 'você';
  $('nome').textContent = nome;
  if (a && a.sel) {
    $('av').innerHTML = A.svg(a.sel, { viewBox: '40 46 160 160', still: true, label: 'Seu avatar' });
    const lv = g.level || 1;
    $('nivel').innerHTML = 'Nv. ' + lv + ' · ' + (A.titleHTML ? A.titleHTML(lv) : '') + '<a href="/idiomas/avatar/">editar avatar</a>';
  } else {
    $('av').textContent = '🎨';
    $('nivel').innerHTML = 'Você ainda não tem avatar.<a href="/idiomas/avatar/">Criar no Ateliê →</a>';
  }
}

/* ---------- continuar a trilha (mesmo critério da home) ---------- */
function trilha(){
  const T = window.UniTrilha; if (!T) return;
  const E = T.estado(), av = ler('utopiaAvatar1'), feitos = E.filter(m => m.aula && m.prova).length;
  let t = null, h = null, d = '';
  if (!(av && av.sel) && !E.some(m => m.aula || m.prova)) { t = 'Crie seu avatar'; h = '/idiomas/avatar/'; d = 'Ele vai junto em todas as aulas da trilha.'; }
  else for (let i = 0; i < E.length; i++) { const m = E[i];
    if (!m.aula) { t = 'Mapa ' + (i + 1) + ' · ' + m.titulo; h = m.aulaHref; d = m.desc; break; }
    if (!m.prova) { t = 'Prova do mapa ' + (i + 1) + ' · ' + m.titulo; h = m.testeHref; d = 'Ganhe o carimbo no passaporte do Planeta Utopia.'; break; } }
  if (!t) { t = 'Trilha completa!'; h = '/idiomas/japones/'; d = 'Você fez os 12 mapas. Que tal revisar um deles?'; }
  $('h-cont').textContent = t; $('cont-desc').textContent = d; $('cont-btn').href = h;
  $('cont-btn').textContent = t === 'Trilha completa!' ? 'Ver a trilha →' : 'Continuar →';
  $('cont-barra').style.width = Math.round(feitos / E.length * 100) + '%';
  $('cont-num').textContent = feitos + ' de ' + E.length + ' mapas da trilha de japonês concluídos (aula + prova)';
}

/* ---------- aula particular: só aparece para quem é aluno da Aline ---------- */
const quando = d => d.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
async function aula(u){
  const box = $('aula-part'); box.hidden = true;
  if (!u || !u.emailVerified) return;
  let a = null;
  try { const s = await getDoc(doc(db, 'aulas', u.email.toLowerCase())); if (s.exists()) a = s.data(); } catch (e) { return; }
  if (!a) return;
  const p = proximas(a, 1)[0], agora = Date.now();
  const aberta = p && agora >= p.ini - 15 * 60e3 && agora < p.fim && /^https:\/\//.test(a.meet || '');
  box.innerHTML = `<p class="eyebrow">aula particular</p>
    <h2 id="h-aula" class="cap">${p ? esc(quando(p.ini)) : 'Nenhuma aula marcada'}</h2>
    ${a.tarefa && a.tarefaFeita !== a.tarefa ? `<p class="mut">Tarefa: ${esc(a.tarefa)}</p>` : ''}
    <div class="linha">
      ${aberta ? `<a class="btn primary" href="${esc(a.meet)}" target="_blank" rel="noopener">Entrar na aula ↗</a>` : ''}
      <a class="btn" href="/aulas/">Minhas aulas →</a>
      ${p ? '<button type="button" class="btn" id="anotar">Anotar sobre esta aula</button>' : ''}
    </div>`;
  box.hidden = false;
  if (p) $('anotar').onclick = () => { if (window.CadernoNovaSobre) window.CadernoNovaSobre('Aula de ' + p.ini.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }), p.ini); };
}

/* ---------- comunidade e conta ---------- */
try { const t = window.UniTemas.atual(); $('tema').textContent = 'Tema da semana: “' + t.titulo + '”'; } catch (e) {}
$('sair').onclick = async () => { try { if (window.UniConta && window.UniConta.enviar) await window.UniConta.enviar(); } catch (e) {} await signOut(auth); location.href = '/'; };

onAuthStateChanged(auth, u => {
  if (!u) return;
  $('email').textContent = 'Você entrou com ' + u.email;
  perfil(u); trilha(); aula(u);
});
document.addEventListener('uni-progresso', () => { perfil(auth.currentUser); trilha(); });
