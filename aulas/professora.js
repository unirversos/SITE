/* Unirversos · Aulas particulares — tela da professora.
   aulas/{email} (o que o aluno vê) e aulas_notas/{email} (anotações só suas). Quem pode abrir é decidido pelas regras do Firestore. */
import { auth, db } from "/idiomas/dados/conta.js?v=4";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { proximas, DIAS, chave } from "/aulas/aulas-comum.js?v=2";

const $ = id => document.getElementById(id), area = $('area');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const quando = d => d.toLocaleString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
let alunos = [], editando = null;
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
  area.innerHTML = `<div class="topo"><h2>Seus alunos <span class="mut">(${alunos.length})</span></h2><button type="button" class="btn" id="novo">+ Novo aluno</button></div>
    <div class="alunos">${cards || '<p class="mut">Nenhum aluno ainda. Clique em "+ Novo aluno" para começar.</p>'}</div>`;
  $('novo').onclick = () => ficha(null);
  area.querySelectorAll('.aluno').forEach(b => b.onclick = () => ficha(alunos.find(a => a.id === b.dataset.id)));
}

const linhaHorario = (h = { dia: 1, hora: '19:00' }) => `<div class="rep" data-tipo="h"><label class="sr">Dia</label><select>${DIAS.map((d, i) => `<option value="${i}"${Number(h.dia) === i ? ' selected' : ''}>${d}</option>`).join('')}</select><label class="sr">Hora</label><input type="time" value="${esc(h.hora)}" required><button type="button" class="x" aria-label="Tirar este horário">×</button></div>`;
const linhaAvulsa = (v = '') => `<div class="rep" data-tipo="v"><label class="sr">Data e hora</label><input type="datetime-local" value="${esc(v)}" required><button type="button" class="x" aria-label="Tirar esta aula">×</button></div>`;
const linhaPular = (v = '') => `<div class="rep" data-tipo="p"><label class="sr">Dia sem aula</label><input type="date" value="${esc(v)}" required><button type="button" class="x" aria-label="Tirar este dia">×</button></div>`;
const linhaGrav = (m = { t: '', url: '' }) => `<div class="rep mat" data-tipo="g"><label class="sr">Título</label><input type="text" placeholder="Título (ex.: Aula de 19/11)" value="${esc(m.t)}"><label class="sr">Link</label><input type="url" placeholder="https://…" value="${esc(m.url)}"><button type="button" class="x" aria-label="Tirar esta gravação">×</button></div>`;
const pedidos = a => { const hoje = chave(new Date(Date.now() - 3 * 3600e3)).slice(0, 10), l = (a.gravar || []).filter(k => k.slice(0, 10) >= hoje);
  return l.length ? `<div class="pedido"><b>O aluno pediu gravação:</b> ${l.map(k => esc(new Date(k + ':00-03:00').toLocaleString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))).join(' · ')}<br><span class="peq">Lembre de apertar "Gravar" no Meet. Depois, cole o link em Gravações.</span></div>` : ''; };
const linhaMat = (m = { t: '', url: '' }) => `<div class="rep mat" data-tipo="m"><label class="sr">Título</label><input type="text" placeholder="Título (ex.: Aula 3 · slides)" value="${esc(m.t)}"><label class="sr">Link</label><input type="url" placeholder="https://…" value="${esc(m.url)}"><button type="button" class="x" aria-label="Tirar este material">×</button></div>`;

async function ficha(a){
  editando = a ? a.id : null; a = a || { ativo: true, dur: 60, horarios: [], avulsas: [], pular: [], material: [] };
  let notas = '';
  if (editando) { try { const n = await getDoc(doc(db, 'aulas_notas', editando)); if (n.exists()) notas = n.data().texto || ''; } catch (e) {} }
  area.innerHTML = `<button type="button" class="voltar" id="voltar">← Todos os alunos</button>
  <form class="cx ficha" id="f">
    <h2>${editando ? esc(a.nome || editando) : 'Novo aluno'}</h2>
    <div class="dois">
      <div><label for="f-nome">Nome</label><input id="f-nome" type="text" required value="${esc(a.nome)}"></div>
      <div><label for="f-email">E-mail que o aluno usa para entrar</label><input id="f-email" type="email" required value="${esc(editando || '')}" ${editando ? 'readonly' : ''}></div>
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
    <fieldset><legend>Materiais</legend><div id="ms">${(a.material || []).map(linhaMat).join('')}</div><button type="button" class="mini" data-add="m">+ material</button></fieldset>

    ${pedidos(a)}
    <fieldset><legend>Gravações <span class="mut">(link do Drive ou YouTube; só para aulas que o aluno pediu)</span></legend><div id="gs">${(a.gravacoes || []).map(linhaGrav).join('')}</div><button type="button" class="mini" data-add="g">+ gravação</button></fieldset>

    <div class="privado"><label for="f-notas">Suas anotações <span class="mut">(só você vê)</span></label><textarea id="f-notas" rows="4">${esc(notas)}</textarea></div>

    <div class="linha"><button type="submit" class="btn">Salvar</button>${editando ? '<button type="button" class="btn claro perigo" id="apagar">Apagar aluno</button>' : ''}<span class="mut peq" id="st" aria-live="polite"></span></div>
  </form>`;
  const f = $('f');
  $('voltar').onclick = () => lista();
  f.addEventListener('click', e => {
    const x = e.target.closest('.x'); if (x) { x.parentNode.remove(); return; }
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
      nome: $('f-nome').value.trim(), email, meet: $('f-meet').value.trim(), dur: Number($('f-dur').value) || 60, ativo: $('f-ativo').checked,
      horarios: [...f.querySelectorAll('[data-tipo="h"]')].map(r => ({ dia: Number(r.querySelector('select').value), hora: r.querySelector('input').value })).filter(h => h.hora),
      avulsas: [...f.querySelectorAll('[data-tipo="v"] input')].map(i => i.value).filter(Boolean).sort(),
      pular: [...f.querySelectorAll('[data-tipo="p"] input')].map(i => i.value).filter(Boolean).sort(),
      material: [...f.querySelectorAll('[data-tipo="m"]')].map(r => { const [t, u] = r.querySelectorAll('input'); return { t: t.value.trim(), url: u.value.trim() }; }).filter(m => m.t),
      recado: $('f-recado').value.trim(), tarefa: $('f-tarefa').value.trim(), gravacoes: [...f.querySelectorAll('[data-tipo="g"]')].map(r => { const [t, u] = r.querySelectorAll('input'); return { t: t.value.trim(), url: u.value.trim() }; }).filter(m => m.t),
      gravar: a.gravar || [], avatar: a.avatar || '', tarefaFeita: (a.tarefaFeita && a.tarefaFeita === $('f-tarefa').value.trim()) ? a.tarefaFeita : '', atualizado: new Date().toISOString()
    };
    st.textContent = 'Salvando…';
    try {
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
