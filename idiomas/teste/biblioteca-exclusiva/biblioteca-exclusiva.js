/* Unirversos · Biblioteca exclusiva — material da professora, só para alunos liberados.
   Acesso: quem tem o documento atividades/{e-mail} (a professora libera na ficha) ou é professora.
   A lista de materiais fica no Firestore (biblioteca/exclusiva), não num arquivo do site: o repositório é público. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NIVEIS = ['N5 · Começando', 'N4', 'N3', 'N2', 'N1', 'Geral'];

/* atividades interativas do próprio site (só o título é público; o conteúdo pede liberação) */
const ATIVIDADES = [
  { t: 'Gramática N2 · 8 semanas', d: '104 estruturas, flashcards e correção da professora', emo: '✦', c: 'var(--gold-s)', url: '/idiomas/teste/galeria/' }
];

/* tipo de arquivo pelo link */
const gid = u => (u.match(/\/d\/([\w-]+)/) || [])[1];
const tipo = u => !u ? '' : /docs\.google\.com\/spreadsheets\/d\//.test(u) ? 'plan' : /docs\.google\.com\/document\/d\//.test(u) ? 'doc'
  : /docs\.google\.com\/presentation\/d\//.test(u) ? 'slides' : /drive\.google\.com\/file\/d\//.test(u) ? 'drive'
  : /drive\.google\.com\/drive\/(u\/\d+\/)?folders\//.test(u) ? 'pasta' : 'link';
const ICO = { plan: ['📊', 'var(--sage-s)'], doc: ['📄', '#f4ecee'], slides: ['🖼️', 'var(--gold-s)'], drive: ['📁', 'var(--lav-s)'], pasta: ['🗂️', 'var(--lav-s)'], link: ['🔗', '#f4ecee'] };
const embed = u => { const t = tipo(u), id = gid(u);
  if (t === 'plan') return `https://docs.google.com/spreadsheets/d/${id}/preview`;
  if (t === 'doc') return `https://docs.google.com/document/d/${id}/preview`;
  if (t === 'slides') return `https://docs.google.com/presentation/d/${id}/preview`;
  if (t === 'drive') return `https://drive.google.com/file/d/${id}/preview`;
  if (t === 'pasta') { const f = (u.match(/folders\/([\w-]+)/) || [])[1]; return `https://drive.google.com/embeddedfolderview?id=${f}#grid`; }
  return ''; };

let itens = [], souProf = false, liberado = false, aberto = null, cheia = false;

function tile(i, k){
  const [emo, cor] = i.emo ? [i.emo, i.c || 'var(--gold-s)'] : (ICO[tipo(i.url)] || ICO.link);
  const lock = !liberado && !souProf;
  const tag = lock ? '🔒' : i.au ? '🎧 áudio' : '';
  const attrs = lock ? 'aria-disabled="true"' : i.url && i.url.startsWith('/') ? `href="${esc(i.url)}"` : `data-abre="${k}"`;
  const tagName = !lock && i.url && i.url.startsWith('/') ? 'a' : 'button';
  return `<${tagName} class="t${lock ? ' lock' : ''}" ${tagName === 'button' ? 'type="button" ' : ''}${attrs}>${tag ? `<span class="tag">${tag}</span>` : ''}<span class="ic" style="--c:${cor}" aria-hidden="true">${emo}</span><span class="n">${esc(i.t)}</span>${i.d || i.nota ? `<span class="d">${esc(i.d || i.nota)}</span>` : ''}</${tagName}>`;
}
function pinta(){
  let h = `<section class="sec"><div class="sec-h"><b>✦ Atividades Unirversos</b><span>interativas, com o seu progresso</span></div><div class="g">${ATIVIDADES.map(a => tile(a)).join('')}</div></section>`;
  if (liberado || souProf) {
    const grupos = NIVEIS.map(n => [n, itens.map((x, k) => [x, k]).filter(([x]) => (x.nivel || 'Geral') === n)]).filter(([, l]) => l.length);
    h += grupos.length ? grupos.map(([n, l]) => `<section class="sec"><div class="sec-h"><b>${esc(n)}</b><span>${l.length} ${l.length > 1 ? 'materiais' : 'material'}</span></div><div class="g">${l.map(([x, k]) => tile(x, k)).join('')}</div></section>`).join('')
      : `<section class="sec"><div class="sec-h"><b>Materiais</b></div><p class="vazio">${souProf ? 'Ainda não tem material aqui. Adicione no quadro "Adicionar material", logo abaixo.' : 'Em breve a sensei coloca materiais aqui.'}</p></section>`;
  } else h += `<section class="sec"><div class="sec-h"><b>Materiais da sensei</b><span>PDFs, áudios e planilhas</span></div><p class="vazio">🔒 Os materiais aparecem aqui quando a professora liberar o seu acesso.</p></section>`;
  $('conteudo').innerHTML = h;
  $('conteudo').querySelectorAll('[data-abre]').forEach(b => b.onclick = () => abre(Number(b.dataset.abre)));
}

/* leitor: PDF/Docs/planilha/pasta aqui mesmo, com o áudio junto */
function abre(k){
  const i = itens[k]; if (!i) return;
  const L = $('leitor'), src = embed(i.url);
  if (!src) { window.open(i.url, '_blank', 'noopener'); return; }
  aberto = k; cheia = false; L.hidden = false; L.classList.remove('cheia');
  const au = i.au && gid(i.au) ? `https://drive.google.com/file/d/${gid(i.au)}/preview` : '';
  L.innerHTML = `<div class="lt-bar"><b>${(ICO[tipo(i.url)] || ICO.link)[0]} ${esc(i.t)}</b><button type="button" class="mini" id="lt-cheia">⤢ Tela cheia</button><a class="mini" href="${esc(i.url)}" target="_blank" rel="noopener">Abrir no Google ↗</a><button type="button" class="mini" id="lt-x">Fechar</button></div>
    ${au ? `<div class="au-bar"><span>🎧 Áudio</span><iframe class="au-if" src="${esc(au)}" title="Áudio: ${esc(i.t)}" allow="autoplay"></iframe></div>` : ''}
    <iframe class="lt-if" src="${esc(src)}" title="${esc(i.t)}" allow="autoplay; fullscreen"></iframe>
    ${i.nota ? `<p class="nota">${esc(i.nota)}</p>` : ''}
    <p class="nota">Se pedir login, entre com o e-mail que a professora liberou, ou abra no Google. Caderno e Dicionário ficam na lateral direita.</p>`;
  $('lt-x').onclick = () => { L.hidden = true; L.innerHTML = ''; aberto = null; };
  $('lt-cheia').onclick = () => { cheia = !cheia; L.classList.toggle('cheia', cheia); $('lt-cheia').textContent = cheia ? '↙ Sair da tela cheia' : '⤢ Tela cheia'; };
  L.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && cheia) $('lt-cheia').click(); });

/* edição (só a professora) */
function edicao(){
  if (!souProf) { $('edicao').innerHTML = ''; return; }
  $('edicao').innerHTML = `<section class="ed"><h2>Adicionar material <span class="st">(só você vê este quadro)</span></h2>
    <form id="ed-f"><label>Título<input id="ed-t" required placeholder="Ex.: Irodori A1 · lição 3"></label>
      <label>Nível<select id="ed-n">${NIVEIS.map(n => `<option>${esc(n)}</option>`).join('')}</select></label>
      <label class="full">Link do Drive (PDF, Docs, planilha, apresentação ou pasta)<input id="ed-u" type="url" required placeholder="https://drive.google.com/file/d/…"></label>
      <label class="full">🎧 Áudio junto (opcional, link do Drive)<input id="ed-a" type="url" placeholder="https://drive.google.com/file/d/…"></label>
      <label class="full">Frase para os alunos (opcional)<input id="ed-o" placeholder="Ex.: leia e ouça antes da aula"></label>
      <div class="full"><button class="btn" type="submit">Adicionar</button> <span class="st" id="ed-st" aria-live="polite"></span></div></form>
    <p class="st">Lembre de compartilhar o arquivo no Drive com os alunos (ou "qualquer pessoa com o link").</p>
    <ul class="ed-l">${itens.map((x, k) => `<li><span>${(ICO[tipo(x.url)] || ICO.link)[0]} <b>${esc(x.t)}</b> · ${esc(x.nivel || 'Geral')}${x.au ? ' · 🎧' : ''}</span><button type="button" class="x" data-tira="${k}" aria-label="Tirar ${esc(x.t)}">×</button></li>`).join('')}</ul></section>`;
  $('ed-f').onsubmit = async e => {
    e.preventDefault();
    const novo = { t: $('ed-t').value.trim(), nivel: $('ed-n').value, url: $('ed-u').value.trim() };
    if ($('ed-a').value.trim()) novo.au = $('ed-a').value.trim();
    if ($('ed-o').value.trim()) novo.nota = $('ed-o').value.trim();
    await salva(itens.concat(novo), $('ed-st'));
  };
  $('edicao').querySelectorAll('[data-tira]').forEach(b => b.onclick = () => { const k = Number(b.dataset.tira); if (confirm('Tirar "' + itens[k].t + '" da biblioteca?')) salva(itens.filter((_, i) => i !== k), $('ed-st')); });
}
async function salva(lista, st){
  if (st) st.textContent = 'Salvando…';
  try { await setDoc(doc(db, 'biblioteca', 'exclusiva'), { itens: lista, atualizado: new Date().toISOString() }); itens = lista; pinta(); edicao(); const s = $('ed-st'); if (s) s.textContent = 'Salvo ✓'; }
  catch (e) { console.warn(e); if (st) st.textContent = e.code === 'permission-denied' ? 'Falta liberar a biblioteca no Firebase.' : 'Não consegui salvar agora.'; }
}

onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(); souProf = PROFS.includes(eu);
  try { liberado = souProf || (await getDoc(doc(db, 'atividades', eu))).exists(); } catch (e) { liberado = souProf; }
  if (liberado) { try { const s = await getDoc(doc(db, 'biblioteca', 'exclusiva')); itens = (s.exists() && s.data().itens) || []; } catch (e) { console.warn(e); } }
  $('selo').hidden = false;
  $('selo').textContent = souProf ? '✦ Você está como professora' : liberado ? '✦ Acesso liberado' : '🔒 Acesso exclusivo para alunos';
  $('trava').innerHTML = liberado || souProf ? '' : '<div class="trava"><b>Esta biblioteca é dos alunos da Aline.</b>Peça acesso à sua professora. Ainda não é aluno? <a href="/idiomas/#planeta-utopia" style="color:var(--pink-d)">Veja as vagas abertas</a>.</div>';
  pinta(); edicao();
});
