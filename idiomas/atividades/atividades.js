/* Unirversos · Sala de atividades — lista das Atividades Unirversos (material exclusivo).
   Acesso: professora, ou quem tem o documento atividades/{e-mail} (a professora libera na ficha do aluno).
   Só LÊ do Firestore (nada é gravado aqui). Para incluir outra atividade, acrescente uma linha em ATIVIDADES. */
import { auth, db } from "/idiomas/dados/conta.js?v=6";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PROFS = ['unirversos.idiomas@gmail.com', 'li.kikuti@gmail.com'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* id = o mesmo id usado no Firestore (atividades/{e-mail} → { [id]: respostas }); livro = documento biblioteca/{livro} com os itens */
const ATIVIDADES = [
  { id: 'n2gram', livro: 'n2gram', num: '01', nivel: 'N2', t: 'Gramática N2 · 8 semanas', d: 'Uma estrutura por vez: entenda a nuance, veja o exemplo e escreva a sua frase.', url: '/idiomas/atividades/gramatica-n2/', cor: 'var(--gold)' },
  { id: 'verbos', livro: 'verbos', num: '02', nivel: 'N5–N3', t: 'Verbos transitivos e intransitivos', d: '75 pares (150 verbos): compare 他動詞 e 自動詞, veja o exemplo e escreva a sua frase.', url: '/idiomas/atividades/verbos/', cor: 'var(--sage)', por: 2 },
  { id: 'adjetivos', livro: 'adjetivos', num: '03', nivel: 'N5–N2', t: 'Adjetivos e opostos', d: '60 pares (120 adjetivos い e な): um adjetivo e o seu oposto, com exemplo e a sua frase.', url: '/idiomas/atividades/adjetivos/', cor: 'var(--terra)', por: 2 }
];

/* mesma regra da galeria: "feito" só conta depois de aprovado pela professora */
const feita = r => r && ((r.st === 'feito' && r.ap) || r.st === 'dominado');

function pinta(liberado, souProf, resp, totais){
  $('lista').innerHTML = ATIVIDADES.map(a => {
    const trava = !liberado && !souProf, breve = !!a.breve;
    const R = resp[a.id] || {}, tot = totais[a.id] || 0;
    const feitas = Object.keys(R).filter(n => feita(R[n])).length;
    const prog = !souProf && !trava && tot ? `<div class="tr" role="img" aria-label="${feitas} de ${tot} estruturas feitas"><i style="width:${Math.round(feitas / tot * 100)}%"></i></div><span class="prog">${feitas} de ${tot} feitas</span>` : '';
    const corpo = `<div class="top"><span class="nu">${esc(a.num)}</span><span>${breve ? 'em breve' : trava ? '🔒 alunos' : esc(a.nivel)}</span></div><h2>${esc(a.t)}</h2><p>${esc(a.d)}</p>${prog}<span class="ir">${breve ? 'Em construção' : trava ? 'Libera com a professora' : 'Abrir →'}</span>`;
    return trava || breve ? `<div class="at lock" style="--c:${a.cor}">${corpo}</div>` : `<a class="at" style="--c:${a.cor}" href="${esc(a.url)}">${corpo}</a>`;
  }).join('');
}

onAuthStateChanged(auth, async u => {
  if (!u) return;
  const eu = (u.email || '').toLowerCase(), souProf = PROFS.includes(eu);
  let liberado = souProf, resp = {}, totais = {};
  if (!souProf) {
    try { const s = await getDoc(doc(db, 'atividades', eu)); liberado = s.exists(); resp = (s.exists() && s.data()) || {}; } catch (e) { console.warn(e); }
  }
  if (liberado && !souProf) {
    for (const a of ATIVIDADES) {
      try { const s = await getDoc(doc(db, 'biblioteca', a.livro)); if (s.exists()) totais[a.id] = JSON.parse(s.data().itens || '[]').length * (a.por || 1); } catch (e) { console.warn(e); }
    }
  }
  $('selo').hidden = false;
  $('selo').textContent = souProf ? '✦ Você está como professora' : liberado ? '✦ Acesso liberado' : '🔒 Acesso exclusivo para alunos';
  $('trava').innerHTML = liberado ? '' : '<div class="trava"><b>Estas atividades são dos alunos da Aline.</b>Peça acesso à sua professora. Ainda não é aluno? <a href="/idiomas/#planeta-utopia" style="color:var(--pink-d)">Veja as vagas abertas</a>.</div>';
  pinta(liberado, souProf, resp, totais);
});
