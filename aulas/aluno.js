/* Unirversos · Aulas particulares dentro da Área do aluno (/aluno/)
   Firestore: aulas/{email em minúsculas} — só o próprio aluno (e-mail confirmado) e a professora conseguem ler.
   Quem não é aluno particular não vê nada. Textos em português ou inglês (aluno/i18n.js). */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { proximas, chave } from "/aulas/aulas-comum.js?v=2";

const ANTES = 15 * 60e3;            /* o botão fica ativo 15 minutos antes */
const PRAZO = 12 * 3600e3;          /* remarcar: só com 12 horas de antecedência */
const REMARCAR = '5519996390950';   /* WhatsApp com DDI e DDD, só dígitos; vazio = e-mail */
const EMAIL = 'unirversos.idiomas@gmail.com';
const L = window.UniL, t = L.t;
const $ = id => document.getElementById(id), area = $('area');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const longe = new Date().getTimezoneOffset() !== 180;
const fmt = (d, o) => d.toLocaleString(L.loc, o);
const hora = (d, tz) => fmt(d, Object.assign({ hour: '2-digit', minute: '2-digit', hour12: false }, tz ? { timeZone: tz } : {}));
const quando = d => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + hora(d) + (longe ? ' (' + hora(d, 'America/Sao_Paulo') + ' ' + t('emBrasilia') + ')' : '');
const linkOk = u => /^https:\/\//.test(u || '');
/* texto com links: o que começa com https:// vira link clicável (abre em nova aba) */
const comLinks = s => esc(s).replace(/https:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, u => `<a class="lk" href="${u}" target="_blank" rel="noopener">${u.replace(/^https:\/\/(www\.)?/, '').slice(0, 48)}${u.length > 56 ? '…' : ''} ↗</a>`);
let aula = null, timer = null, meuEmail = '', aberto = false, novos = { recado: false, tarefa: false, itens: new Set() };

/* formato do material + seta "↗" quando abre fora do site */
function tipo(u){
  try {
    const x = new URL(u), h = x.hostname.replace(/^www\./, ''), path = x.pathname.toLowerCase(), en = L.lang === 'en';
    if (/\.pdf$/.test(path)) return 'PDF';
    if (h === 'docs.google.com') return /\/presentation\//.test(path) ? 'Slides' : /\/spreadsheets\//.test(path) ? (en ? 'Sheet' : 'Planilha') : /\/forms\//.test(path) ? (en ? 'Form' : 'Formulário') : (en ? 'Doc' : 'Documento');
    if (h === 'drive.google.com') return 'Drive';
    if (/(^|\.)youtube\.com$|^youtu\.be$/.test(h) || /\.(mp4|mov|webm)$/.test(path)) return en ? 'Video' : 'Vídeo';
    if (/\.(mp3|m4a|wav|ogg)$/.test(path)) return en ? 'Audio' : 'Áudio';
    if (/\.(png|jpe?g|webp|gif)$/.test(path)) return en ? 'Image' : 'Imagem';
  } catch (e) {}
  return '';
}
const fora = u => { try { return !/(^|\.)unirversos\.com$/.test(new URL(u).hostname); } catch (e) { return true; } };
const idItem = m => (m.t || '') + '|' + (m.url || '');
const tagNovo = sim => sim ? ` <em class="tag novo">${t('novo')}</em>` : '';
const linkMat = m => {
  const n = tagNovo(novos.itens.has(idItem(m)));
  if (!linkOk(m.url)) return esc(m.t) + n;
  const tp = tipo(m.url), ext = fora(m.url);
  return `<a href="${esc(m.url)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(m.t)}${tp ? ` <span class="fmt">${tp}</span>` : ''} <span aria-hidden="true">${ext ? '↗' : '→'}</span>${ext ? `<span class="sr">${t('novaAba')}</span>` : ''}</a>${n}`;
};

/* o que mudou desde a última visita (recado, tarefa, materiais, gravações) ganha a etiqueta "novo" */
function calculaNovos(a){
  const k = 'uniAulasVisto:' + meuEmail, itens = [].concat(a.material || [], a.gravacoes || []).filter(m => m && m.t).map(idItem);
  let v = null; try { v = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {}
  if (v) {
    novos.recado = !!a.recado && a.recado !== v.recado;
    novos.tarefa = !!a.tarefa && a.tarefa !== v.tarefa;
    const antes = new Set(v.itens || []); novos.itens = new Set(itens.filter(i => !antes.has(i)));
  }
  try { localStorage.setItem(k, JSON.stringify({ recado: a.recado || '', tarefa: a.tarefa || '', itens })); } catch (e) {}
}

/* avatar: a professora também vê na lista de alunos */
function mandaAvatar(){
  if (!aula || !meuEmail) return;
  let a = null; try { a = window.UtopiaAvatar && window.UtopiaAvatar.load(); } catch (e) {}
  const v = a && a.sel ? JSON.stringify(a.sel) : '';
  if ((aula.avatar || '') !== v) updateDoc(doc(db, 'aulas', meuEmail), { avatar: v }).then(() => { aula.avatar = v; }).catch(() => {});
}
document.addEventListener('uni-progresso', mandaAvatar);

function falta(ms){
  const m = Math.round(ms / 60e3), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
  return d ? `${d} ${d > 1 ? t('dias') : t('dia')}${h ? ' ' + t('e') + ' ' + h + ' h' : ''}` : h ? `${h} h${mi ? ' ' + t('e') + ' ' + mi + ' min' : ''}` : `${mi} min`;
}
const icoGrav = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>';
const btnGravar = (v, a) => { const on = (a.gravar || []).includes(chave(v.ini));
  return `<button type="button" class="gravar${on ? ' on' : ''}" data-gravar="${chave(v.ini)}" aria-pressed="${on}">${icoGrav}${on ? t('gravPedida') : t('pedirGrav')}</button>`; };

function pinta(){
  const a = aula, prox = proximas(a, 5), agora = Date.now(), p = prox[0], feita = !!a.tarefa && a.tarefaFeita === a.tarefa;
  /* cartão principal: próxima aula, entrar, gravação, recado e tarefa */
  let c = '';
  if (!p) c = `<p class="eyebrow">${t('aulaPart')}</p><h2>${t('semAula')}</h2><p class="mut">${t('semAulaDesc')}</p>`;
  else {
    const abertaAgora = agora >= p.ini - ANTES && agora < p.fim, agoraMesmo = agora >= p.ini;
    c = `<p class="eyebrow">${t('aulaPart')} · ${agoraMesmo ? t('agora') : t('proxima')}</p><h2 class="cap">${esc(quando(p.ini))}</h2>`
      + (abertaAgora && linkOk(a.meet)
        ? `<a class="btn grande primary" href="${esc(a.meet)}" target="_blank" rel="noopener">${t('entrar')} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10l5-3v10l-5-3z"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg></a><p class="mut peq">${t('abreMeet')}</p>`
        : abertaAgora ? `<p class="mut">${t('semLink')}</p>`
        : `<p class="mut">${t('faltam', { f: falta(p.ini - agora) })}</p><span class="btn grande off" aria-disabled="true">${t('entrar')}</span>`);
    if (agora < p.ini) c += `<div class="linha">${btnGravar(p, a)}<span class="mut peq">${t('gravDica')}</span></div>`;
  }
  if (a.recado) c += `<div class="bloco"><p class="eyebrow verde">${t('recado')}${tagNovo(novos.recado)}</p><p class="pre">${comLinks(a.recado)}</p></div>`;
  if (a.tarefa) c += `<div class="bloco"><p class="eyebrow">${t('tarefa')}${tagNovo(novos.tarefa)}</p><label class="tarefa${feita ? ' feita' : ''}"><input type="checkbox" id="feita"${feita ? ' checked' : ''}><span class="pre">${comLinks(a.tarefa)}</span></label><p class="mut peq" id="st-t" aria-live="polite">${feita ? t('feita') : ''}</p></div>`;
  if (p) c += `<button type="button" class="remarcar" id="anotar" style="align-self:flex-start">${t('anotar')}</button>`;

  /* detalhes: materiais, gravações, próximas aulas e remarcação */
  const mats = (a.material || []).filter(m => m && m.t).map(m => `<li>${linkMat(m)}</li>`).join('');
  const gravs = (a.gravacoes || []).filter(m => m && m.t).map(m => `<li>${linkMat(m)}</li>`).join('');
  const sem = t('semana'), fixos = (a.horarios || []).map(h => t('toda', { d: sem[h.dia], h: esc(h.hora) })).join(' · ');
  const seg = prox.slice(1, 2).map(v => `<li class="li-aula"><span><span class="cap">${esc(quando(v.ini))}</span>${v.avulsa ? ` <em class="tag">${t('avulsa')}</em>` : ''}</span>${btnGravar(v, a)}</li>`).join('');
  const rem = prox.find(v => v.ini - agora >= PRAZO);
  let remarcar = '';
  if (rem) {
    const txt = t('remarcarMsg', { q: quando(rem.ini) });
    const href = REMARCAR ? 'https://wa.me/' + REMARCAR + '?text=' + encodeURIComponent(txt) : 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(t('remarcar')) + '&body=' + encodeURIComponent(txt);
    remarcar = `<a class="remarcar" href="${esc(href)}" target="_blank" rel="noopener">${t('remarcar')}</a>`;
  }
  const d = `<details class="det"${aberto ? ' open' : ''}><summary>${t('detalhes')}${tagNovo(novos.itens.size > 0)}</summary><div class="det-c">
      <div><p class="eyebrow">${t('materiais')}</p>${mats ? `<ul class="lst">${mats}</ul>` : `<p class="mut">${t('semMat')}</p>`}</div>
      ${gravs ? `<div><p class="eyebrow">${t('gravacoes')}</p><ul class="lst">${gravs}</ul></div>` : ''}
      <div><p class="eyebrow">${t('proximas')}</p>${fixos ? `<p>${fixos} <span class="mut">${t('horaBr')}</span></p>` : `<p class="mut">${t('semFixo')}</p>`}${seg ? `<p class="mut peq" style="margin-top:6px">${t('depois')}</p><ul class="lst">${seg}</ul>` : ''}</div>
      ${p ? `<div class="regra"><p class="peq">${t('regra')}</p>${remarcar}</div>` : ''}
    </div></details>`;
  area.innerHTML = `<section class="cx destaque">${c}${d}</section>`;

  area.querySelector('.det').addEventListener('toggle', e => { aberto = e.target.open; });
  area.querySelectorAll('[data-gravar]').forEach(b => b.onclick = async () => {
    const k = b.dataset.gravar, atual = (aula.gravar || []).filter(x => x >= chave(new Date()));
    const novo = atual.includes(k) ? atual.filter(x => x !== k) : atual.concat(k).sort();
    b.disabled = true;
    try { await updateDoc(doc(db, 'aulas', meuEmail), { gravar: novo }); aula.gravar = novo; pinta(); }
    catch (e) { console.warn(e); b.disabled = false; b.textContent = t('erroSalvar'); }
  });
  if ($('anotar')) $('anotar').onclick = () => { if (window.CadernoNovaSobre) window.CadernoNovaSobre(t('aulaDe', { d: p.ini.toLocaleDateString(L.loc, { day: 'numeric', month: 'long' }) }), p.ini); };
  const ck = $('feita');
  if (ck) ck.onchange = async () => {
    const valor = ck.checked ? a.tarefa : '';
    try { await updateDoc(doc(db, 'aulas', meuEmail), { tarefaFeita: valor }); aula.tarefaFeita = valor; pinta(); }
    catch (e) { console.warn(e); ck.checked = !ck.checked; $('st-t').textContent = t('erroSalvar'); }
  };
  clearTimeout(timer); timer = setTimeout(pinta, 30e3);
}

onAuthStateChanged(auth, async u => {
  if (!u) { area.innerHTML = ''; return; }
  if (!u.emailVerified) {
    area.innerHTML = `<section class="cx"><p class="eyebrow">${t('aulaPart')}</p><p class="mut">${t('confirma')}</p><div class="linha"><button class="btn" id="mandar" type="button">${t('mandar')}</button><button class="btn" id="ja" type="button">${t('jaConf')}</button></div><p class="mut peq" id="st" aria-live="polite"></p></section>`;
    $('mandar').onclick = async () => { try { await sendEmailVerification(u); $('st').textContent = t('mandado'); } catch (e) { $('st').textContent = t('naoMandou'); } };
    $('ja').onclick = async () => { await u.reload(); if (auth.currentUser.emailVerified) { await auth.currentUser.getIdToken(true); location.reload(); } else $('st').textContent = t('aindaNao'); };
    return;
  }
  try {
    meuEmail = u.email.toLowerCase();
    const s = await getDoc(doc(db, 'aulas', meuEmail));
    if (!s.exists()) { area.innerHTML = ''; return; }
    aula = s.data(); calculaNovos(aula); pinta(); mandaAvatar();
  } catch (e) { console.warn(e); area.innerHTML = ''; }
});
