/* Unirversos · Minhas aulas (página do aluno)
   Firestore: aulas/{email em minúsculas} — só o próprio aluno (e-mail confirmado) e a professora conseguem ler. */
import { auth, db } from "/idiomas/dados/conta.js?v=5";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { proximas, DIAS, chave } from "/aulas/aulas-comum.js?v=2";

const ANTES = 15 * 60e3; /* o botão fica ativo 15 minutos antes */
const REMARCAR = '5519996390950'; /* número de WhatsApp com DDI e DDD, só dígitos (ex.: 5519999999999); vazio = e-mail */
const EMAIL = 'unirversos.idiomas@gmail.com';
const $ = id => document.getElementById(id), area = $('area');
/* também roda dentro da Área do aluno (/aluno/): lá não há cabeçalho próprio e quem não é aluno não vê nada */
const NA_AREA = !!document.getElementById('caderno');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone, longe = !/Sao_Paulo|Brasilia/.test(tz) && new Date().getTimezoneOffset() !== 180;
const fmt = (d, o) => d.toLocaleString('pt-BR', o);
const quando = d => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + fmt(d, { hour: '2-digit', minute: '2-digit' })
  + (longe ? ' (' + fmt(d, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) + ' em Brasília)' : '');
const linkOk = u => /^https:\/\//.test(u || '');
/* texto com links: o que começa com https:// vira link clicável (abre em nova aba) */
const comLinks = t => esc(t).replace(/https:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, u => `<a class="lk" href="${u}" target="_blank" rel="noopener">${u.replace(/^https:\/\/(www\.)?/, '').slice(0, 48)}${u.length > 56 ? '…' : ''} ↗</a>`);
let aula = null, timer = null, meuEmail = '';
/* links de material: formato + seta "↗" quando abre fora do site */
function tipo(u){
  try {
    const x = new URL(u), h = x.hostname.replace(/^www\./, ''), path = x.pathname.toLowerCase();
    if (/\.pdf$/.test(path)) return 'PDF';
    if (h === 'docs.google.com') return /\/presentation\//.test(path) ? 'Slides' : /\/spreadsheets\//.test(path) ? 'Planilha' : /\/forms\//.test(path) ? 'Formulário' : 'Documento';
    if (h === 'drive.google.com') return 'Drive';
    if (/(^|\.)youtube\.com$|^youtu\.be$/.test(h)) return 'Vídeo';
    if (/\.(mp3|m4a|wav|ogg)$/.test(path)) return 'Áudio';
    if (/\.(mp4|mov|webm)$/.test(path)) return 'Vídeo';
    if (/\.(png|jpe?g|webp|gif)$/.test(path)) return 'Imagem';
  } catch (e) {}
  return '';
}
const fora = u => { try { return !/(^|\.)unirversos\.com$/.test(new URL(u).hostname); } catch (e) { return true; } };
const linkMat = m => {
  if (!linkOk(m.url)) return esc(m.t);
  const t = tipo(m.url), ext = fora(m.url);
  return `<a href="${esc(m.url)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(m.t)}${t ? ` <span class="fmt">${t}</span>` : ''} <span aria-hidden="true">${ext ? '↗' : '→'}</span>${ext ? '<span class="sr"> (abre em nova aba)</span>' : ''}</a>`;
};

/* avatar do Ateliê (vem da conta: o conta.js copia o progresso para o navegador ao entrar) */
function meuAvatar(){ try { const a = window.UtopiaAvatar && window.UtopiaAvatar.load(); return a && a.sel ? a : null; } catch (e) { return null; } }
function pintaAvatar(){
  const a = meuAvatar(), box = $('meu-av'), lk = $('av-link');
  if (!box || !lk) {} else if (a) { box.innerHTML = window.UtopiaAvatar.svg(a.sel, { viewBox: '40 46 160 160', still: true, label: 'Seu avatar' }); lk.innerHTML = '<a href="/idiomas/avatar/">editar avatar</a>'; }
  else { box.innerHTML = ''; lk.innerHTML = '<a href="/idiomas/avatar/">Crie o seu avatar no Ateliê →</a>'; }
  /* a professora também vê o avatar na lista de alunos */
  if (aula && meuEmail) {
    const v = a ? JSON.stringify(a.sel) : '';
    if ((aula.avatar || '') !== v) updateDoc(doc(db, 'aulas', meuEmail), { avatar: v }).then(() => { aula.avatar = v; }).catch(() => {});
  }
}
document.addEventListener('uni-progresso', pintaAvatar);

function falta(ms){
  const m = Math.round(ms / 60e3), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
  return d ? `${d} dia${d > 1 ? 's' : ''}${h ? ' e ' + h + ' h' : ''}` : h ? `${h} h${mi ? ' e ' + mi + ' min' : ''}` : `${mi} min`;
}
const btnGravar = (v, a) => { const on = (a.gravar || []).includes(chave(v.ini));
  return `<button type="button" class="gravar${on ? ' on' : ''}" data-gravar="${chave(v.ini)}" aria-pressed="${on}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>${on ? 'Gravação pedida' : 'Pedir gravação'}</button>`; };
function pinta(){
  const a = aula, prox = proximas(a, 5), agora = Date.now(), p = prox[0], feita = !!a.tarefa && a.tarefaFeita === a.tarefa;
  let cartao;
  if (!p) cartao = `<p class="eyebrow">próxima aula</p><h2>Nenhuma aula marcada</h2><p class="mut">Quando a Aline marcar a próxima, ela aparece aqui.</p>`;
  else {
    const aberta = agora >= p.ini - ANTES && agora < p.fim, agoraMesmo = agora >= p.ini;
    cartao = `<p class="eyebrow">${NA_AREA ? 'aula particular · ' : ''}${agoraMesmo ? 'acontecendo agora' : 'próxima aula'}</p><h2 class="cap">${esc(quando(p.ini))}</h2>`
      + (aberta && linkOk(a.meet)
        ? `<a class="btn grande primary" href="${esc(a.meet)}" target="_blank" rel="noopener">Entrar na aula <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10l5-3v10l-5-3z"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg></a><p class="mut peq">A sala abre no Google Meet. Se pedir para entrar, a Aline aprova.</p>`
        : aberta ? `<p class="mut">A Aline ainda não colocou o link da sala. Fale com ela.</p>`
        : `<p class="mut">Faltam ${falta(p.ini - agora)}. O botão ficará ativo 15 minutos antes da aula.</p><span class="btn grande off" aria-disabled="true">Entrar na aula</span>`);
  }
  /* remarcar: só com 12 horas de antecedência; vale para a primeira aula que ainda dá tempo */
  const PRAZO = 12 * 3600e3, rem = prox.find(v => v.ini - agora >= PRAZO);
  let remarcar = '';
  if (rem) {
    const txt = 'Oi, Aline! Preciso remarcar a aula de ' + quando(rem.ini) + '.';
    const href = REMARCAR ? 'https://wa.me/' + REMARCAR + '?text=' + encodeURIComponent(txt)
      : 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Remarcar aula') + '&body=' + encodeURIComponent(txt);
    remarcar = `<a class="remarcar" href="${esc(href)}" target="_blank" rel="noopener">Precisa remarcar?</a>`;
  }
  if (p && NA_AREA && window.CadernoNovaSobre) cartao += `<button type="button" class="remarcar" id="anotar" style="align-self:flex-start">Anotar sobre esta aula no caderno</button>`;
  if (p && agora < p.ini) cartao += `<div class="linha">${btnGravar(p, a)}<span class="mut peq">Só grava se você pedir, até o começo da aula. A aula inteira fica gravada.</span></div>`;
  const lista = prox.slice(1, 2).map(v => `<li class="li-aula"><span><span class="cap">${esc(quando(v.ini))}</span>${v.avulsa ? ' <em class="tag">avulsa</em>' : ''}</span>${btnGravar(v, a)}</li>`).join('');
  const gravs = (a.gravacoes || []).filter(m => m && m.t).map(m => `<li>${linkMat(m)}</li>`).join('');
  const fixos = (a.horarios || []).map(h => `toda ${DIAS[h.dia]}${Number(h.dia) === 0 || Number(h.dia) === 6 ? '' : '-feira'} às ${esc(h.hora)}`).join(' · ');
  const mats = (a.material || []).filter(m => m && m.t).map(m => `<li>${linkMat(m)}</li>`).join('');
  area.innerHTML = `
    <section class="cx destaque">${cartao}</section>
    ${a.recado ? `<section class="cx"><p class="eyebrow verde">recado da Aline</p><p class="pre">${comLinks(a.recado)}</p></section>` : ''}
    <div class="dois">
      <section class="cx"><p class="eyebrow">tarefa</p>${a.tarefa ? `<label class="tarefa${feita ? ' feita' : ''}"><input type="checkbox" id="feita"${feita ? ' checked' : ''}><span class="pre">${comLinks(a.tarefa)}</span></label><p class="mut peq" id="st-t" aria-live="polite">${feita ? 'Marcada como feita. A Aline vê isso.' : ''}</p>` : '<p class="mut">Nenhuma tarefa por agora.</p>'}</section>
      <section class="cx"><p class="eyebrow">materiais</p>${mats ? `<ul class="lst">${mats}</ul>` : '<p class="mut">Os materiais das aulas vão aparecer aqui.</p>'}${gravs ? `<p class="eyebrow" style="margin-top:8px">gravações</p><ul class="lst">${gravs}</ul>` : ''}</section>
    </div>
    <section class="cx"><p class="eyebrow">próximas aulas</p>${fixos ? `<p>${fixos.charAt(0).toUpperCase() + fixos.slice(1)} <span class="mut">(horário de Brasília)</span></p>` : ''}${lista ? `<p class="mut peq" style="margin-top:6px">Depois da próxima:</p><ul class="lst">${lista}</ul>` : (fixos ? '' : '<p class="mut">Sem horário fixo: as aulas são marcadas uma a uma.</p>')}
      ${p ? `<div class="regra"><p class="peq">Remarcações só com pelo menos <b>12 horas de antecedência</b>. Com menos de 12 horas, a aula conta como cancelada.</p>${remarcar}</div>` : ''}</section>`;
  area.querySelectorAll('[data-gravar]').forEach(b => b.onclick = async () => {
    const k = b.dataset.gravar, atual = (aula.gravar || []).filter(x => x >= chave(new Date()));
    const novo = atual.includes(k) ? atual.filter(x => x !== k) : atual.concat(k).sort();
    b.disabled = true;
    try { await updateDoc(doc(db, 'aulas', meuEmail), { gravar: novo }); aula.gravar = novo; pinta(); }
    catch (e) { console.warn(e); b.disabled = false; b.textContent = 'Não consegui salvar. Tente de novo.'; }
  });
  if ($('anotar')) $('anotar').onclick = () => window.CadernoNovaSobre('Aula de ' + p.ini.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }), p.ini);
  const ck = $('feita');
  if (ck) ck.onchange = async () => {
    const valor = ck.checked ? a.tarefa : '';
    try { await updateDoc(doc(db, 'aulas', meuEmail), { tarefaFeita: valor }); aula.tarefaFeita = valor; pinta(); }
    catch (e) { console.warn(e); ck.checked = !ck.checked; $('st-t').textContent = 'Não consegui salvar agora. Tente de novo.'; }
  };
  clearTimeout(timer); timer = setTimeout(pinta, 30e3);
}
function aviso(t, extra){ area.innerHTML = `<section class="cx"><h2>${t}</h2>${extra || ''}</section>`; }

onAuthStateChanged(auth, async u => {
  if (!u) { area.innerHTML = ''; return; }
  pintaAvatar();
  if ($('ola')) $('ola').textContent = 'Olá, ' + ((u.displayName || u.email || '').split(' ')[0].split('@')[0]) + '!';
  if (!u.emailVerified && NA_AREA) {
    area.innerHTML = `<section class="cx"><p class="eyebrow">aulas particulares</p><p class="mut">Tem aulas particulares com a Aline? Confirme o seu e-mail para elas aparecerem aqui.</p><div class="linha"><button class="btn" id="mandar" type="button">Mandar link de confirmação</button><button class="btn" id="ja" type="button">Já confirmei</button></div><p class="mut peq" id="st" aria-live="polite"></p></section>`;
    $('mandar').onclick = async () => { try { await sendEmailVerification(u); $('st').textContent = 'Pronto! Confira a sua caixa de entrada (e o spam).'; } catch (e) { $('st').textContent = 'Não consegui mandar agora. Tente de novo mais tarde.'; } };
    $('ja').onclick = async () => { await u.reload(); if (auth.currentUser.emailVerified) { await auth.currentUser.getIdToken(true); location.reload(); } else $('st').textContent = 'Ainda não aparece como confirmado. Abra o link do e-mail e tente de novo.'; };
    return;
  }
  if (!u.emailVerified) {
    aviso('Confirme o seu e-mail', `<p class="mut">Para proteger as suas aulas, preciso saber que o e-mail <b>${esc(u.email)}</b> é seu. Mandamos um link de confirmação: abra o e-mail, clique no link e depois volte aqui.</p><div class="linha"><button class="btn" id="mandar" type="button">Mandar o link de novo</button><button class="btn claro" id="ja" type="button">Já confirmei</button></div><p class="mut peq" id="st" aria-live="polite"></p>`);
    $('mandar').onclick = async () => { try { await sendEmailVerification(u); $('st').textContent = 'Pronto! Confira a sua caixa de entrada (e o spam).'; } catch (e) { $('st').textContent = 'Não consegui mandar agora. Espere um pouco e tente de novo.'; } };
    $('ja').onclick = async () => { await u.reload(); if (auth.currentUser.emailVerified) { await auth.currentUser.getIdToken(true); location.reload(); } else $('st').textContent = 'Ainda não aparece como confirmado. Abra o link do e-mail e tente de novo.'; };
    if (!sessionStorage.getItem('uniVerif')) { sessionStorage.setItem('uniVerif', '1'); sendEmailVerification(u).catch(() => {}); }
    return;
  }
  if (!NA_AREA) area.innerHTML = '<section class="cx"><p class="mut">Carregando as suas aulas…</p></section>';
  try {
    meuEmail = u.email.toLowerCase();
    const s = await getDoc(doc(db, 'aulas', meuEmail));
    if (!s.exists()) { if (NA_AREA) { area.innerHTML = ''; return; } aviso('Ainda não encontrei aulas para você', `<p class="mut">Você entrou com <b>${esc(u.email)}</b>. Se você tem aulas com a Aline, peça para ela conferir se este é o e-mail cadastrado.</p>`); return; }
    aula = s.data(); pinta(); pintaAvatar();
  } catch (e) {
    console.warn(e);
    if (NA_AREA) { area.innerHTML = ''; return; }
    aviso('Ainda não encontrei aulas para você', `<p class="mut">Você entrou com <b>${esc(u.email)}</b>. Se você tem aulas com a Aline, peça para ela conferir se este é o e-mail cadastrado.</p>`);
  }
});
