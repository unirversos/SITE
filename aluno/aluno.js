/* Unirversos · Área do aluno: perfil, trilha, prévia do caderno, atalhos e conta.
   As aulas particulares vêm de /aulas/aluno.js. Textos em português ou inglês (aluno/i18n.js). */
import { auth } from "/idiomas/dados/conta.js?v=6";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const L = window.UniL, t = L.t;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const ler = k => { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } };
L.aplica();
document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => L.muda(b.dataset.lang));

/* ---------- perfil ---------- */
function perfil(u){
  const A = window.UtopiaAvatar, a = A && A.load(), g = ler('utopiaSave1') || {};
  const nome = (a && a.profile && (a.profile.name || a.profile.kata)) || (u && (u.displayName || '').split(' ')[0]) || (u && u.email.split('@')[0]) || '';
  $('nome').textContent = nome;
  if (a && a.sel) {
    $('av').innerHTML = A.svg(a.sel, { viewBox: '40 46 160 160', still: true, label: 'Avatar' });
    const lv = g.level || 1;
    $('nivel').innerHTML = t('nv') + ' ' + lv + ' · ' + (A.titleHTML ? A.titleHTML(lv) : '') + `<a href="/idiomas/avatar/">${t('editarAvatar')}</a>`;
  } else {
    $('av').textContent = '🎨';
    $('nivel').innerHTML = t('semAvatar') + `<a href="/idiomas/avatar/">${t('criarAvatar')}</a>`;
  }
}

/* ---------- continuar a trilha: sempre o próximo mapa ou a próxima prova ---------- */
function trilha(){
  const T = window.UniTrilha; if (!T) return;
  const E = T.estado(), feitos = E.filter(m => m.aula && m.prova).length;
  let tt = null, h = null, d = '';
  for (let i = 0; i < E.length; i++) { const m = E[i];
    if (!m.aula) { tt = t('mapa') + ' ' + (i + 1) + ' · ' + m.titulo; h = m.aulaHref; d = m.desc; break; }
    if (!m.prova) { tt = t('prova') + ' ' + (i + 1) + ' · ' + m.titulo; h = m.testeHref; d = t('provaDesc'); break; } }
  const fim = !tt;
  if (fim) { tt = t('completa'); h = '/idiomas/japones/'; d = t('completaDesc'); }
  $('h-cont').textContent = tt; $('cont-desc').textContent = d; $('cont-btn').href = h;
  $('cont-btn').textContent = fim ? t('verTrilha') : t('btnContinuar');
  $('cont-barra').style.width = Math.round(feitos / E.length * 100) + '%';
  $('cont-num').textContent = t('feitos', { n: feitos, t: E.length });
}

/* ---------- caderno: prévia compacta; o caderno completo abre em /idiomas/caderno/ ---------- */
const C = window.UniCaderno;
function caderno(){
  if (!C) return;
  const vs = C.vivas().slice(0, 3), box = $('cad-lista');
  box.innerHTML = vs.length ? vs.map(n => {
    const np = 1 + (Array.isArray(n.pp) ? n.pp.length : 0), nome = C.nome(n);
    return `<a class="cad-i" href="/idiomas/caderno/?n=${encodeURIComponent(n.id)}"><b>${esc(nome === 'Sem título' ? t('cadSem') : nome)}</b><small>${new Date(n.m).toLocaleDateString(L.loc, { day: 'numeric', month: 'short' })}${np > 1 ? ' · ' + np + ' ' + t('cadPag') : ''}</small></a>`;
  }).join('') : `<p class="mut">${t('cadVazio')}</p>`;
}
if (C) { C.on(tipo => { if (tipo === 'remoto') caderno(); }); caderno(); }
/* abre o caderno aqui mesmo (painel flutuante); sem ele, o link leva à tela cheia */
document.addEventListener('click', e => {
  const F = window.UniCadernoFlutuante; if (!F) return;
  const a = e.target.closest && e.target.closest('#cad-lista a.cad-i, a[href="/idiomas/caderno/?nova=1"]'); if (!a) return;
  e.preventDefault();
  const m = /[?&]n=([^&]+)/.exec(a.getAttribute('href'));
  if (m) F.abrirNota(decodeURIComponent(m[1])); else F.nova();
});
/* "Anotar sobre esta aula": cria a nota com título e data e abre o caderno nela */
window.CadernoNovaSobre = (titulo, d) => {
  if (!C) return;
  const n = C.nova(), c = { t: titulo };
  if (d) { c.a = String(d.getFullYear()); c.o = String(d.getMonth() + 1); c.d = String(d.getDate()); c.w = String((d.getDay() + 6) % 7); }
  C.atualizar(n.id, c); C.agora();
  if (window.UniCadernoFlutuante) { window.UniCadernoFlutuante.abrirNota(n.id); return; }
  location.href = '/idiomas/caderno/?n=' + encodeURIComponent(n.id);
};

/* ---------- comunidade, professora e conta ---------- */
try { const tm = window.UniTemas.atual(); $('tema').textContent = t('temaSemana', { t: tm.titulo }); } catch (e) {}
async function sair(){ try { if (window.UniConta && window.UniConta.enviar) await window.UniConta.enviar(); } catch (e) {} await signOut(auth); location.href = '/'; }
$('sair').onclick = sair; $('sair-topo').onclick = sair;

function mostraProf(){ $('prof-card').hidden = false; }
document.addEventListener('uni-professora', mostraProf);
if (document.documentElement.classList.contains('uni-professora')) mostraProf();

onAuthStateChanged(auth, u => {
  if (!u) return;
  if (window.UniConta && window.UniConta.professora) window.UniConta.professora().then(sim => { if (sim) mostraProf(); });
  $('email').textContent = t('entrou', { e: u.email });
  perfil(u); trilha();
});
document.addEventListener('uni-progresso', () => { perfil(auth.currentUser); trilha(); });
