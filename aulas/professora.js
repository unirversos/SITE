/* Unirversos · Aulas particulares — tela da professora.
   aulas/{email} (o que o aluno vê) e aulas_notas/{email} (anotações só suas). Quem pode abrir é decidido pelas regras do Firestore. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { proximas, DIAS, chave } from "/aulas/aulas-comum.js?v=2";

const $ = id => document.getElementById(id), area = $('area');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const quando = d => d.toLocaleString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
let alunos = [], editando = null, perfis = null;
/* pessoas que já entraram no site (anotadas no login) */
async function lePerfis(){
  if (perfis) return perfis;
  try { const s = await getDocs(collection(db, 'perfis')); perfis = s.docs.map(d => d.data()).filter(p => p && p.email).sort((a, b) => (b.visto || '').localeCompare(a.visto || '')); }
  catch (e) { console.warn('perfis', e && e.code); perfis = []; }
  return perfis;
}
function avatar(a){ try { if (!a.avatar || !window.UtopiaAvatar) return ''; return window.UtopiaAvatar.svg(JSON.parse(a.avatar), { viewBox: '40 46 160 160', still: true, label: 'Avatar de ' + (a.nome || '') }); } catch (e) { return ''; } }

async function carrega(){
  area.innerHTML = '<p class="mut">Carregando os alunos…</p>';
  try {
    const s = await getDocs(collection(db, 'aulas'));
    alunos = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    lista();
  } catch (e) {
    console.warn(e);
    area.innerHTML = `<section class="cx"><h2>Esta página é só da professora</h2><p class="mut">${e && e.code === 'permission-denied' ? 'A sua conta não tem acesso a esta tela. Se você é a Aline, confira se entrou com o e-mail certo e se as regras do Firestore foram publicadas.' : 'Não consegui carregar agora. Confira a internet e recarregue.'}</p></section>`;
  }
}
function lista(){
  editando = null;
  const cards = alunos.map(a => {
    const p = proximas(a, 1)[0];
    return `<button type="button" class="aluno" data-id="${esc(a.id)}">
      <span class="av">${avatar(a) || esc((a.nome || a.id).charAt(0).toUpperCase())}</span>
      <span class="info"><b>${esc(a.nome || 'Sem nome')}</b><span class="mut peq">${esc(a.id)}</span></span>
      <span class="prox">${p && (a.gravar || []).includes(chave(p.ini)) ? '<em class="tag rec">gravar a próxima</em> ' : ''}${a.tarefa && a.tarefaFeita === a.tarefa ? '<em class="tag">tarefa feita</em> ' : ''}${a.ativo === false ? '<em class="tag">pausado</em>' : p ? 'próxima: ' + esc(quando(p.ini)) : '<span class="mut">sem aula marcada</span>'}</span></button>`;
  }).join('');
  area.innerHTML = `<div class="topo"><h2>Seus alunos <span class="mut">(${alunos.length})</span></h2><div class="linha"><a class="btn claro" href="/idiomas/atividades/gramatica-n2/">✦ Atividades</a><button type="button" class="btn claro" id="todos">📚 Mandar para todos</button><button type="button" class="btn" id="novo">+ Novo aluno</button></div></div>
    <div class="alunos">${cards || '<p class="mut">Nenhum aluno ainda. Clique em "+ Novo aluno" para começar.</p>'}</div>`;
  $('novo').onclick = () => ficha(null); $('todos').onclick = mandarTodos;
  area.querySelectorAll('.aluno').forEach(b => b.onclick = () => ficha(alunos.find(a => a.id === b.dataset.id)));
}

const linhaHorario = (h = { dia: 1, hora: '19:00' }) => `<div class="rep" data-tipo="h"><label class="sr">Dia</label><select>${DIAS.map((d, i) => `<option value="${i}"${Number(h.dia) === i ? ' selected' : ''}>${d}</option>`).join('')}</select><label class="sr">Hora</label><input type="time" value="${esc(h.hora)}" required><button type="button" class="x" aria-label="Tirar este horário">×</button></div>`;
const linhaAvulsa = (v = '') => `<div class="rep" data-tipo="v"><label class="sr">Data e hora</label><input type="datetime-local" value="${esc(v)}" required><button type="button" class="x" aria-label="Tirar esta aula">×</button></div>`;
const linhaPular = (v = '') => `<div class="rep" data-tipo="p"><label class="sr">Dia sem aula</label><input type="date" value="${esc(v)}" required><button type="button" class="x" aria-label="Tirar este dia">×</button></div>`;
const linhaGrav = (m = { t: '', url: '' }) => `<div class="rep mat" data-tipo="g"><label class="sr">Título</label><input type="text" placeholder="Título (ex.: Aula de 19/11)" value="${esc(m.t)}"><label class="sr">Link</label><input type="url" placeholder="https://…" value="${esc(m.url)}"><button type="button" class="x" aria-label="Tirar esta gravação">×</button></div>`;
const pedidos = a => { const hoje = chave(new Date(Date.now() - 3 * 3600e3)).slice(0, 10), l = (a.gravar || []).filter(k => k.slice(0, 10) >= hoje);
  return l.length ? `<div class="pedido"><b>O aluno pediu gravação:</b> ${l.map(k => esc(new Date(k + ':00-03:00').toLocaleString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))).join(' · ')}<br><span class="peq">Lembre de apertar "Gravar" no Meet. Depois, cole o link em Gravações.</span></div>` : ''; };
/* catálogo único (idiomas/dados/cursos-gratis.js) */
/* conteúdo da própria Unirversos: aparece primeiro no "escolher da biblioteca" (com emoji no lugar do ícone) */
const UNI = { b: '✦', s: 'Unirversos', itens: [
  { id: 'u-aula-zero', n: 'Aula Zero', emo: '🎫', url: '/idiomas/aula-zero/' },
  ...((window.UniTrilha && window.UniTrilha.MAPAS) || []).map(m => ({ id: 'u-mapa-' + m[0], n: 'Mapa · ' + m[2], emo: m[1], url: '/idiomas/mapas/' + m[0] + '/aula/' })),
  { id: 'u-gram-n2', n: 'Gramática N2 · galeria', emo: '✦', url: '/idiomas/atividades/gramatica-n2/', restrito: true },
  { id: 'u-caderno', n: 'Caderno', emo: '📓', url: '/idiomas/caderno/' },
  { id: 'u-biblioteca', n: 'Biblioteca livre', emo: '📚', url: '/idiomas/biblioteca/' }
] };
const SECOES = [UNI].concat(window.UniCursos || []);
const CAT = SECOES.flatMap(sc => sc.itens.map(i => Object.assign({ sec: sc.b }, i)));
const daCat = id => CAT.find(i => i.id === id);
const absUrl = u => /^\//.test(u || '') ? 'https://unirversos.com' + u : (u || '');
const icone = (i, cls = 'mi') => !i ? '' : i.emo ? `<span class="${cls} emo" aria-hidden="true">${i.emo}</span>` : `<span class="${cls}" style="--c:var(--c-${i.c})"><svg viewBox="0 0 24 24">${i.svg}</svg></span>`;
let feitosAtual = [];
const linhaMat = (m = { t: '', url: '' }) => {
  const i = m.cat && daCat(m.cat), fez = m.url && feitosAtual.includes(m.url);
  return `<div class="rep mat${i ? ' doCat' : ''}" data-tipo="m"${i ? ` data-cat="${esc(i.id)}"` : ''}>${icone(i)}<div class="campos">
    <div class="lin1"><label class="sr">Título</label><input type="text" data-k="t" placeholder="Título (ex.: Aula 3 · slides)" value="${esc(m.t)}">${i && i.pg ? `<span class="pg">${esc(i.pg)}</span>` : ''}${fez ? '<em class="tag">✓ o aluno fez</em>' : ''}</div>
    <div class="lin1"><label class="sr">Link exato</label><input type="url" data-k="url" placeholder="${i ? 'Cole aqui o link exato (ex.: a lição 3)' : 'https://…'}" value="${esc(m.url)}">${i ? `<a class="abre" href="${esc(absUrl(i.url))}" target="_blank" rel="noopener" title="Abrir o site para achar a página e copiar o link">abrir ↗</a>` : ''}<button type="button" class="copia" title="Copiar este link">⧉</button></div>
    ${i ? '<p class="mut peq dica">Abra o site, ache a página certa e cole o link dela aqui. Sem link exato, o aluno vai para a página inicial.</p>' : ''}
    <label class="sr">Frase para o aluno</label><input type="text" data-k="nota" class="nota" placeholder="Sua frase para o aluno (opcional), ex.: ouça antes de quinta" value="${esc(m.nota)}">
  </div><button type="button" class="x" aria-label="Tirar este material">×</button></div>`;
};
const leMat = r => { const g = k => (r.querySelector(`[data-k="${k}"]`) || {}).value || ''; const url = g('url').trim(), m = { t: g('t').trim() || url, url }; if (r.dataset.cat) { m.cat = r.dataset.cat; const i = daCat(m.cat); if (i && i.emo) m.emo = i.emo; } if (g('nota').trim()) m.nota = g('nota').trim(); return m; };
/* escolher da biblioteca: grade de ícones por nível */
function abrePicker(onEscolhe, extraHtml = ''){
  fechaPicker();
  const d = document.createElement('div'); d.className = 'picker'; d.id = 'picker'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Escolher da biblioteca');
  d.innerHTML = `<div class="pk-box"><div class="topo"><h2>📚 Biblioteca livre</h2><button type="button" class="x" id="pk-x" aria-label="Fechar">×</button></div>${extraHtml}
    ${SECOES.map(sc => `<div class="pk-sec"><p class="eyebrow">${esc(sc.b)} · ${esc(sc.s)}</p><div class="pk-g">${sc.itens.map(i => `<button type="button" class="pk-t" data-id="${esc(i.id)}">${icone(i, 'mi')}<b>${i.n}</b>${i.pg ? `<span class="pg">${esc(i.pg)}</span>` : ''}</button>`).join('')}</div></div>`).join('')}
    <p class="mut peq">Os links levam aos sites oficiais e gratuitos. Depois de escolher, cole o link exato da página que você quer.</p></div>`;
  document.body.appendChild(d);
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('#pk-x')) return fechaPicker(); const b = e.target.closest('.pk-t'); if (b) onEscolhe(daCat(b.dataset.id), d); });
  document.addEventListener('keydown', escFecha);
  d.querySelector('.pk-t').focus();
}
function escFecha(e){ if (e.key === 'Escape') fechaPicker(); }
function fechaPicker(){ const d = $('picker'); if (d) d.remove(); document.removeEventListener('keydown', escFecha); }
const tituloDe = i => i.n.replace(/&amp;/g, '&');

/* anotações do Caderno que o aluno escolheu mostrar (aulas_cadernos/{e-mail}); só leitura, no mesmo visual de caderno */
async function cadernoDoAluno(email){
  const box = $('cad-al'); if (!box) return;
  const topo = '<div class="topo"><h2>Anotações que o aluno mostrou</h2><button type="button" class="mini" id="cad-at">↻ Atualizar</button></div>';
  box.innerHTML = topo + '<p class="mut">Carregando…</p>';
  $('cad-at').onclick = () => cadernoDoAluno(email);
  let notas = [];
  try { const sn = await getDoc(doc(db, 'aulas_cadernos', email)); notas = sn.exists() && Array.isArray(sn.data().notas) ? sn.data().notas : []; }
  catch (e) {
    if (!$('cad-al')) return;
    box.innerHTML = topo + `<p class="mut">${e && e.code === 'permission-denied' ? 'Ainda não foi liberado: publique a regra de <b>aulas_cadernos</b> no Firestore para a professora poder ler.' : 'Não consegui carregar agora. Tente atualizar.'}</p>`;
    $('cad-at').onclick = () => cadernoDoAluno(email); return;
  }
  if (!$('cad-al') || editando !== email) return;
  notas = notas.filter(n => n && n.id).sort((x, y) => (y.m || 0) - (x.m || 0));
  const ehLicao = n => /^Lição de casa/.test((n.t || '').trim());
  notas = notas.filter(ehLicao).concat(notas.filter(n => !ehLicao(n))); /* lições de casa primeiro */
  if (!notas.length || !window.UniLivro) {
    box.innerHTML = topo + '<p class="mut">Este aluno ainda não mostrou nenhuma anotação. Ele escolhe, anotação por anotação, no botão “Mostrar para a professora” do Caderno.</p>';
    $('cad-at').onclick = () => cadernoDoAluno(email); return;
  }
  const nome = n => (ehLicao(n) ? '📝 ' : '') + ((n.t || '').trim() || (n.x || '').trim().split('\n')[0].slice(0, 50) || 'Sem título');
  const dt = n => n.m ? new Date(n.m).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : '';
  box.innerHTML = topo + `<label class="sr" for="cad-sel">Anotação</label><select id="cad-sel">${notas.map(n => `<option value="${esc(n.id)}">${esc(nome(n))} · ${esc(dt(n))}</option>`).join('')}</select><div id="cad-lv" style="margin-top:12px"></div>`;
  $('cad-at').onclick = () => cadernoDoAluno(email);
  const livro = window.UniLivro.montar($('cad-lv'), { leitura: true, C: { obter: id => notas.find(n => n.id === id) || null, atualizar: () => null } });
  livro.abrir(notas[0].id);
  $('cad-sel').onchange = e => livro.abrir(e.target.value);
}

/* links que o aluno mandou (campo "links" no aulas/{email}) */
function linksDoAluno(a){
  const l = (a.links || []).filter(x => x && x.url);
  return `<fieldset><legend>Links que o aluno mandou para você</legend>${l.length ? `<ul class="lista">${l.map((x, n) => `<li class="lk-al"><span><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.t || x.url)} ↗</a>${x.q ? ` <span class="mut peq">· ${esc(new Date(x.q).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }))}</span>` : ''}</span><button type="button" class="mini" data-tira-link="${n}">já vi, tirar</button></li>`).join('')}</ul>` : '<p class="mut peq">Nenhum ainda. Na Área do aluno ele tem o botão "📎 Mandar um link para a professora".</p>'}</fieldset>`;
}
async function tiraLink(n, b){
  const a = alunos.find(x => x.id === editando); if (!a || !a.links) return;
  const item = a.links[n]; b.disabled = true;
  try { await updateDoc(doc(db, 'aulas', editando), { links: arrayRemove(item) }); a.links = a.links.filter((_, i) => i !== n); b.closest('li').remove(); }
  catch (e) { console.warn(e); b.disabled = false; b.textContent = 'não consegui'; }
}
/* mandar um material da biblioteca para todos os alunos ativos */
function mandarTodos(){
  abrePicker((i, d) => {
    const box = d.querySelector('.pk-box');
    box.innerHTML = `<div class="topo"><h2>Mandar para todos</h2><button type="button" class="x" id="pk-x" aria-label="Fechar">×</button></div>
      <div class="rep mat doCat">${icone(i)}<div class="campos"><div class="lin1"><input type="text" id="mt-t" value="${esc(tituloDe(i))}" aria-label="Título"></div>
      <div class="lin1"><input type="url" id="mt-u" value="${esc(absUrl(i.url))}" aria-label="Link exato"><a class="abre" href="${esc(absUrl(i.url))}" target="_blank" rel="noopener">abrir ↗</a></div>
      <p class="mut peq dica">Cole o link exato da página que você quer que eles vejam.</p>
      <input type="text" id="mt-n" class="nota" placeholder="Sua frase para os alunos (opcional)" aria-label="Frase"></div></div>
      <p class="mut peq">Vai para ${alunos.filter(x => x.ativo !== false).length} alunos ativos.</p>
      <div class="linha"><button type="button" class="btn" id="mt-ok">Mandar</button><span class="mut peq" id="mt-st" aria-live="polite"></span></div>`;
    $('mt-u').focus(); $('mt-u').select();
    $('mt-ok').onclick = async () => {
      const url = $('mt-u').value.trim(), m = { t: $('mt-t').value.trim() || url, url, cat: i.id }; if ($('mt-n').value.trim()) m.nota = $('mt-n').value.trim();
      const alvo = alunos.filter(x => x.ativo !== false); $('mt-ok').disabled = true; $('mt-st').textContent = 'Mandando…';
      let ok = 0; for (const x of alvo) { try { await updateDoc(doc(db, 'aulas', x.id), { material: arrayUnion(m) }); x.material = (x.material || []).concat(m); ok++; } catch (e) { console.warn(x.id, e); } }
      $('mt-st').textContent = `Mandado para ${ok} de ${alvo.length} ✓`;
    };
  });
}

/* galeria de gramática: liberar e abrir direto da ficha (sem copiar link) */
async function atividadesDoAluno(email){
  const box = $('ativ'); if (!box) return;
  const url = '/idiomas/atividades/gramatica-n2/?aluno=' + encodeURIComponent(email);
  let lib = false;
  try { lib = (await getDoc(doc(db, 'atividades', email))).exists(); } catch (e) { box.innerHTML = '<legend>✦ Atividades exclusivas</legend><p class="mut peq">Não consegui ver agora.</p>'; return; }
  if (!$('ativ') || editando !== email) return;
  box.innerHTML = `<legend>✦ Atividades exclusivas</legend><div class="lk-al"><span><b>Gramática N2 · 8 semanas</b> ${lib ? '<em class="tag">liberada</em>' : '<span class="mut peq">· ainda não liberada</span>'}</span>
    ${lib ? `<a class="mini" href="${url}">Abrir a galeria deste aluno →</a>` : '<button type="button" class="mini" id="ativ-lib">✦ Liberar para este aluno</button>'}</div>
    ${lib ? '<p class="mut peq">Ele vê "✦ Suas atividades" na Área do aluno, sem precisar de link.</p>' : ''}`;
  if ($('ativ-lib')) $('ativ-lib').onclick = async () => {
    $('ativ-lib').disabled = true;
    try { await setDoc(doc(db, 'atividades', email), { liberado: new Date().toISOString(), n2gram: {} }, { merge: true }); atividadesDoAluno(email); }
    catch (e) { console.warn(e); $('ativ-lib').textContent = 'Não consegui liberar'; }
  };
}

/* prévia da Área do aluno, dentro da ficha (só leitura) */
function previa(email){
  let box = $('prev-cx');
  if (box) { box.remove(); $('prev-ab').textContent = '👁 Ver como o aluno vê'; return; }
  $('f').insertAdjacentHTML('afterend', `<section class="cx" id="prev-cx"><div class="topo"><h2>Como o aluno vê</h2><div class="linha"><button type="button" class="mini" id="prev-at">↻ Atualizar</button><a class="mini" href="/aluno/?ver=${encodeURIComponent(email)}" target="_blank" rel="noopener">Abrir em tela cheia ↗</a></div></div>
    <p class="mut peq">É a Área do aluno com os dados dele, só para olhar: os botões não gravam nada. Depois de salvar a ficha, toque em Atualizar.</p>
    <iframe id="prev-if" class="prev-if" src="/aluno/?ver=${encodeURIComponent(email)}" title="Prévia da Área do aluno"></iframe></section>`);
  $('prev-ab').textContent = '✕ Fechar a prévia';
  $('prev-at').onclick = () => { $('prev-if').src = $('prev-if').src; };
  $('prev-cx').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function ficha(a){
  editando = a ? a.id : null; feitosAtual = (a && a.feitos) || []; a = a || { ativo: true, dur: 60, horarios: [], avulsas: [], pular: [], material: [] };
  let notas = '';
  if (editando) { try { const n = await getDoc(doc(db, 'aulas_notas', editando)); if (n.exists()) notas = n.data().texto || ''; } catch (e) {} }
  area.innerHTML = `<button type="button" class="voltar" id="voltar">← Todos os alunos</button>
  <form class="cx ficha" id="f">
    <div class="topo"><h2>${editando ? esc(a.nome || editando) : 'Novo aluno'}</h2>${editando ? '<button type="button" class="mini" id="prev-ab">👁 Ver como o aluno vê</button>' : ''}</div>
    <div class="dois">
      <div><label for="f-nome">Nome</label><input id="f-nome" type="text" required value="${esc(a.nome)}"></div>
      <div><label for="f-email">E-mail que o aluno usa para entrar</label><input id="f-email" type="email" required value="${esc(editando || '')}" ${editando ? 'readonly' : 'list="f-pessoas" placeholder="Digite ou escolha da lista"'} autocomplete="off"><datalist id="f-pessoas"></datalist>${editando ? '' : '<p class="mut peq" id="f-pdica"></p>'}</div>
    </div>
    <div class="dois">
      <div><label for="f-meet">Link do Google Meet deste aluno</label><input id="f-meet" type="url" placeholder="https://meet.google.com/…" value="${esc(a.meet)}"></div>
      <div><label for="f-dur">Duração da aula (minutos)</label><input id="f-dur" type="number" min="15" max="240" step="5" value="${esc(a.dur || 60)}"></div>
    </div>
    <label class="ck"><input id="f-ativo" type="checkbox" ${a.ativo === false ? '' : 'checked'}> Aulas ativas <span class="mut">(desmarque para pausar sem apagar)</span></label>

    <fieldset><legend>Horário fixo toda semana <span class="mut">(horário de Brasília)</span></legend><div id="hs">${(a.horarios || []).map(linhaHorario).join('')}</div><button type="button" class="mini" data-add="h">+ horário fixo</button></fieldset>
    <fieldset><legend>Aulas avulsas ou remarcadas</legend><div id="vs">${(a.avulsas || []).map(linhaAvulsa).join('')}</div><button type="button" class="mini" data-add="v">+ aula avulsa</button></fieldset>
    <fieldset><legend>Dias sem aula <span class="mut">(feriado, viagem, falta)</span></legend><div id="ps">${(a.pular || []).map(linhaPular).join('')}</div><button type="button" class="mini" data-add="p">+ dia sem aula</button></fieldset>

    <div><label for="f-recado">Recado para o aluno</label><textarea id="f-recado" rows="2">${esc(a.recado)}</textarea></div>
    <div><label for="f-tarefa">Tarefa ${a.tarefa && a.tarefaFeita === a.tarefa ? '<em class="tag">o aluno marcou como feita</em>' : ''}</label><textarea id="f-tarefa" rows="3">${esc(a.tarefa)}</textarea><p class="mut peq">Se você trocar o texto da tarefa, a marcação de feita volta a ficar em branco para o aluno.</p></div>
    <fieldset><legend>Materiais</legend><div id="ms">${(a.material || []).map(linhaMat).join('')}</div><div class="linha"><button type="button" class="mini" id="pk-abre">📚 escolher da biblioteca</button><button type="button" class="mini" data-add="m">+ material</button></div></fieldset>
    ${linksDoAluno(a)}
    ${editando ? '<fieldset id="ativ"><legend>✦ Atividades exclusivas</legend><p class="mut peq">Carregando…</p></fieldset>' : ''}

    ${pedidos(a)}
    <fieldset><legend>Gravações <span class="mut">(link do Drive ou YouTube; só para aulas que o aluno pediu)</span></legend><div id="gs">${(a.gravacoes || []).map(linhaGrav).join('')}</div><button type="button" class="mini" data-add="g">+ gravação</button></fieldset>

    <div class="privado"><label for="f-notas">Suas anotações <span class="mut">(só você vê)</span></label><textarea id="f-notas" rows="4">${esc(notas)}</textarea></div>

    <div class="linha"><button type="submit" class="btn">Salvar</button>${editando ? '<button type="button" class="btn claro perigo" id="apagar">Apagar aluno</button>' : ''}<span class="mut peq" id="st" aria-live="polite"></span></div>
  </form>`;
  const f = $('f');
  $('voltar').onclick = () => lista();
  if (editando) $('prev-ab').onclick = () => previa(editando);
  if (editando) { area.insertAdjacentHTML('beforeend', '<section class="cx" id="cad-al"></section>'); cadernoDoAluno(editando); atividadesDoAluno(editando); }
  if (!editando) lePerfis().then(ps => {
    const ja = new Set(alunos.map(x => x.id)), livres = ps.filter(p => !ja.has(p.email));
    $('f-pessoas').innerHTML = livres.map(p => `<option value="${esc(p.email)}">${esc(p.nome || '')}</option>`).join('');
    $('f-pdica').textContent = livres.length ? livres.length + (livres.length > 1 ? ' pessoas que já entraram no site aparecem na lista ao clicar no campo.' : ' pessoa que já entrou no site aparece na lista ao clicar no campo.') : 'Quando alguém entrar no site com a conta, o e-mail aparece aqui para você escolher.';
    $('f-email').addEventListener('change', () => { const p = ps.find(x => x.email === $('f-email').value.trim().toLowerCase()); if (p && p.nome && !$('f-nome').value.trim()) $('f-nome').value = p.nome; });
  });
  f.addEventListener('click', e => {
    const x = e.target.closest('.x'); if (x) { x.parentNode.remove(); return; }
    const cp = e.target.closest('.copia'); if (cp) { const u = cp.parentNode.querySelector('input').value.trim(); if (u) navigator.clipboard.writeText(u).then(() => { cp.textContent = '✓'; setTimeout(() => cp.textContent = '⧉', 1500); }).catch(() => {}); return; }
    const rl = e.target.closest('[data-tira-link]'); if (rl) { tiraLink(Number(rl.dataset.tiraLink), rl); return; }
    if (e.target.closest('#pk-abre')) { abrePicker(i => { fechaPicker(); $('ms').insertAdjacentHTML('beforeend', linhaMat({ t: tituloDe(i), url: absUrl(i.url), cat: i.id })); const inp = $('ms').lastElementChild.querySelector('[data-k="url"]'); inp.focus(); inp.select(); }); return; }
    const ad = e.target.closest('[data-add]'); if (!ad) return;
    const k = ad.dataset.add, alvo = { h: 'hs', v: 'vs', p: 'ps', m: 'ms', g: 'gs' }[k], html = { h: linhaHorario, v: linhaAvulsa, p: linhaPular, m: linhaMat, g: linhaGrav }[k]();
    $(alvo).insertAdjacentHTML('beforeend', html); const inp = $(alvo).lastElementChild.querySelector('input,select'); if (inp) inp.focus();
  });
  if (editando) $('apagar').onclick = async () => {
    if (!confirm('Apagar este aluno? Ele deixa de ver as aulas, e as suas anotações sobre ele também são apagadas.')) return;
    try { await deleteDoc(doc(db, 'aulas', editando)); await deleteDoc(doc(db, 'aulas_notas', editando)).catch(() => {}); alunos = alunos.filter(x => x.id !== editando); lista(); }
    catch (e) { $('st').textContent = 'Não consegui apagar. Tente de novo.'; }
  };
  f.onsubmit = async e => {
    e.preventDefault();
    const email = $('f-email').value.trim().toLowerCase(), st = $('st');
    if (!editando && alunos.some(x => x.id === email)) { st.textContent = 'Esse e-mail já está cadastrado.'; return; }
    const dados = {
      nome: $('f-nome').value.trim(), email, meet: $('f-meet').value.trim().replace(/^(https:\/\/meet\.google\.com\/)meet\//i, '$1'), dur: Number($('f-dur').value) || 60, ativo: $('f-ativo').checked,
      horarios: [...f.querySelectorAll('[data-tipo="h"]')].map(r => ({ dia: Number(r.querySelector('select').value), hora: r.querySelector('input').value })).filter(h => h.hora),
      avulsas: [...f.querySelectorAll('[data-tipo="v"] input')].map(i => i.value).filter(Boolean).sort(),
      pular: [...f.querySelectorAll('[data-tipo="p"] input')].map(i => i.value).filter(Boolean).sort(),
      material: [...f.querySelectorAll('[data-tipo="m"]')].map(leMat).filter(m => m.t),
      recado: $('f-recado').value.trim(), tarefa: $('f-tarefa').value.trim(), gravacoes: [...f.querySelectorAll('[data-tipo="g"]')].map(r => { const [t, u] = r.querySelectorAll('input'); const url = u.value.trim(); return { t: t.value.trim() || url, url }; }).filter(m => m.t),
      gravar: a.gravar || [], avatar: a.avatar || '', feitos: a.feitos || [], links: a.links || [], tarefaFeita: (a.tarefaFeita && a.tarefaFeita === $('f-tarefa').value.trim()) ? a.tarefaFeita : '', atualizado: new Date().toISOString()
    };
    st.textContent = 'Salvando…';
    try {
      if (editando) { try { const at = await getDoc(doc(db, 'aulas', email)); if (at.exists()) { const v = at.data(); ['gravar', 'avatar', 'feitos', 'links'].forEach(k => { if (v[k] !== undefined) dados[k] = v[k]; }); } } catch (e) {} }
      await setDoc(doc(db, 'aulas', email), dados);
      await setDoc(doc(db, 'aulas_notas', email), { texto: $('f-notas').value });
      const i = alunos.findIndex(x => x.id === email); const novo = { id: email, ...dados };
      if (i >= 0) alunos[i] = novo; else alunos.push(novo); a = novo;
      alunos.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      editando = email; st.textContent = 'Salvo ✓';
    } catch (x) { console.warn(x); st.textContent = 'Não consegui salvar. Confira a internet e tente de novo.'; }
  };
}
onAuthStateChanged(auth, u => { if (u) carrega(); else area.innerHTML = ''; });
