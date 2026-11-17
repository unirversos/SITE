/* Unirversos · Arrume a mala (jogo individual) · Fase 1: Embarque para o inverno
   Arraste (ou toque) os objetos para a mala e a mochila. Depois, fecha a mala e vê o que aconteceu no destino. */

/* ================= kana e romaji ================= */
const H = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
const R = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po'.split(' ');
const KR = {}; [...H].forEach((k, i) => { KR[k] = R[i]; });
const hira = s => String(s).replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const PONT = { '。': '.', '、': ',', '？': '?', '！': '!', '・': ' ', '「': '"', '」': '"' };
function romTok(tok) {
  const s = hira(tok); let out = '', dobra = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], nx = s[i + 1];
    if (c === 'っ') { dobra = true; continue; }
    if (c === 'ー') { out = out.replace(/[aiueo]$/, v => ({ a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' }[v])); continue; }
    let r = KR[c];
    if (r === undefined) { out += (PONT[c] !== undefined ? PONT[c] : c); dobra = false; continue; }
    if (nx && 'ゃゅょ'.includes(nx)) { const y = { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o' }[nx]; r = /^(sh|ch|j)i$/.test(r) ? r.slice(0, -1) + y : r.slice(0, -1) + 'y' + y; i++; }
    else if (nx && 'ぁぃぅぇぉ'.includes(nx)) { const v = { 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o' }[nx]; r = (c === 'ふ' ? 'f' : c === 'う' ? 'w' : r.slice(0, -1)) + v; i++; }
    if (dobra) { r = (r.startsWith('ch') ? 't' : r[0]) + r; dobra = false; }
    out += r;
  }
  return out.replace(/([a-zāīūēō])san(?=[,.!?]|$)/, '$1-san').replace(/([a-zāīūēō])(janakattadesu|janaidesu|deshita|desu)(ka|ne)?(?=[.,!?]|$)/g, '$1 $2$3').replace(/([.,!?])(?=[a-zāīūēō0-9])/g, '$1 ');
}
function romaji(txt) {
  return String(txt).split(/(\s+)/).map(tok => {
    if (!tok.trim()) return tok;
    if (tok === 'は') return 'wa';
    const m = tok.match(/^(.+?)([はを])([。、？！]*)$/);
    if (m && /[ぁ-ゖァ-ヶー0-9]$/.test(m[1])) return romTok(m[1]) + (m[2] === 'は' ? ' wa' : ' o') + romTok(m[3]);
    return romTok(tok);
  }).join('');
}

/* ================= o jogo ================= */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let ROM = false; try { ROM = localStorage.getItem('utopiaRomaji') === '1'; } catch (e) {}
const ja = t => { const r = romaji(t); return `<span class="jp" lang="ja">${esc(t)}</span>` + (r !== String(t) ? `<span class="wro"${ROM ? '' : ' hidden'}>${esc(r)}</span>` : ''); };

const CAP = { mala: 6, mochila: 2 };
const NOME_CX = { mala: 'スーツケース', mochila: 'リュック' };
/* onde: onde o item deve ir · lugar: onde ele está no quarto · pt: tradução */
const ITENS = [
  { id: 'casaco', ic: '🧥', n: 'あつい コート', pt: 'casaco pesado de lã', onde: 'mala', em: 'cama', lug: 'ベッドの うえ', lugPt: 'em cima da cama', ess: 1 },
  { id: 'cachecol', ic: '🧣', n: 'マフラー', pt: 'cachecol', onde: 'mala', em: 'cama', lug: 'ベッドの うえ', lugPt: 'em cima da cama', ess: 1 },
  { id: 'luvas', ic: '🧤', n: 'てぶくろ', pt: 'luvas', onde: 'mala', em: 'cama', lug: 'ベッドの うえ', lugPt: 'em cima da cama', ess: 1 },
  { id: 'botas', ic: '🥾', n: 'スノーブーツ', pt: 'botas de neve', onde: 'mala', em: 'cama', lug: 'ベッドの した', lugPt: 'embaixo da cama', ess: 1 },
  { id: 'adapt', ic: '🔌', n: 'アダプター', pt: 'adaptador de tomada', onde: 'mala', em: 'mesa', lug: 'つくえの うえ', lugPt: 'em cima da escrivaninha', ess: 1 },
  { id: 'passa', ic: '🛂', n: 'パスポート', pt: 'passaporte', onde: 'mochila', em: 'mesa', lug: 'つくえの うえ', lugPt: 'em cima da escrivaninha', ess: 1 },
  { id: 'carreg', ic: '🔋', n: 'じゅうでんき', pt: 'carregador de celular', onde: 'mochila', em: 'mesa', lug: 'つくえの うえ', lugPt: 'em cima da escrivaninha', ess: 1 },
  { id: 'mizugi', ic: '👙', n: 'みずぎ', pt: 'biquíni / sunga', onde: 'casa', em: 'cama', lug: 'ベッドの うえ', lugPt: 'em cima da cama' },
  { id: 'tank', ic: '🎽', n: 'タンクトップ', pt: 'regata', onde: 'casa', em: 'cama', lug: 'ベッドの うえ', lugPt: 'em cima da cama' },
  { id: 'sandal', ic: '🩴', n: 'ビーチサンダル', pt: 'chinelo de dedo', onde: 'casa', em: 'mesa', lug: 'つくえの した', lugPt: 'embaixo da escrivaninha' },
  { id: 'hiyake', ic: '🧴', n: 'ひやけどめ', pt: 'protetor solar', onde: 'casa', em: 'mesa', lug: 'つくえの うえ', lugPt: 'em cima da escrivaninha' },
  { id: 'kasa', ic: '☂️', n: 'おおきい かさ', pt: 'guarda-chuva gigante', onde: 'grande', em: 'mesa', lug: 'つくえの よこ', lugPt: 'ao lado da escrivaninha' }
];
const it = id => ITENS.find(x => x.id === id);
const BRIEF = { jp: 'ひこうきは 2じかんあとに でます。さっぽろは ゆきです。-2ど。パスポートと じゅうでんきは リュックに、あつい ふくは スーツケースに いれましょう！',
  pt: 'Atenção! O voo sai em 2 horas. Sapporo está com neve, −2 °C. Passaporte e carregador vão na mochila; as roupas pesadas, na mala.' };

let E = { fase: 'quarto', where: {}, sel: null, msg: '', res: null, brilha: [], zip: false };
const reinicia = () => { E = { mexeu: false, fase: 'quarto', where: Object.fromEntries(ITENS.map(x => [x.id, 'quarto'])), sel: null, msg: '', res: null, brilha: [], zip: false }; };
reinicia();
const dentro = cx => ITENS.filter(x => E.where[x.id] === cx);
let MELHOR = 0; try { MELHOR = +localStorage.getItem('utopiaMalaF1') || 0; } catch (e) {}

/* ---------- som e voz ---------- */
function zipSom() {
  try { const C = new (window.AudioContext || window.webkitAudioContext)(), n = 0.55, sr = C.sampleRate, buf = C.createBuffer(1, sr * n, sr), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(t * 120 * (1 + t * 6))) * (1 - t / n); }
    const s = C.createBufferSource(), f = C.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(900, C.currentTime); f.frequency.linearRampToValueAtTime(3200, C.currentTime + n);
    s.buffer = buf; s.connect(f); f.connect(C.destination); s.start(); setTimeout(() => C.close(), 900); } catch (e) {}
}
function fala(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/-2/g, 'マイナス2')); u.lang = 'ja-JP'; u.rate = 0.9; const v = speechSynthesis.getVoices().find(x => /^ja/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} }

/* ---------- mover itens ---------- */
function mover(id, para) {
  const x = it(id); E.msg = ''; E.sel = null; E.mexeu = true;
  if (para === 'mala' || para === 'mochila') {
    if (x.onde === 'grande') { E.msg = `<b lang="ja">おおきすぎます！</b> Grande demais: o ${x.pt} não cabe. <span class="pt">(おおきすぎます = é grande demais)</span>`; E.tremer = id; }
    else if (E.where[id] !== para && dentro(para).length >= CAP[para]) E.msg = `Cheio! ${para === 'mala' ? 'A mala leva' : 'A mochila leva'} só ${CAP[para]} coisas. Tire alguma para trocar.`;
    else E.where[id] = para;
  } else E.where[id] = 'quarto';
  render();
}
function itemHTML(x, extra) {
  const br = E.brilha.includes(x.id) ? ' brilha' : '', sel = E.sel === x.id ? ' sel' : '', tr = E.tremer === x.id ? ' treme' : '';
  return `<button type="button" class="mi${sel}${br}${tr}${extra || ''}" data-mi="${x.id}" aria-label="${esc(x.pt)}"><span class="ic">${x.ic}</span><span class="tx">${ja(x.n)}<small>${esc(x.pt)}</small></span></button>`;
}
function render() {
  const B = $('brief'); B.hidden = false; if (E.mexeu && E.fase === 'quarto') B.innerHTML = `<div class="notif mini"><span class="sino">✈️</span><div><b>Sapporo · −2 °C · neve</b> <small>passaporte e carregador na mochila; roupas pesadas na mala</small></div><button type="button" class="btn peq" id="ouveBrief">🔊</button></div>`; else B.innerHTML = `<div class="notif"><span class="sino">✈️</span><div><b>Aviso do voo · Sapporo (北海道)</b><div class="bj">${ja(BRIEF.jp)}</div><p class="sub">${esc(BRIEF.pt)}</p><button type="button" class="btn peq" id="ouveBrief">🔊 Ouvir</button></div></div>`;
  if (E.fase === 'fim') { renderFim(); return; }
  $('jogo').hidden = false; $('final').hidden = true;
  const caixa = (cx, tit, ic) => `<div class="caixa ${cx}" data-zona="${cx}"><small class="rot">${ic} ${tit} · ${dentro(cx).length} de ${CAP[cx]}</small><div class="chips">${dentro(cx).map(x => itemHTML(x)).join('') || `<span class="vazio">arraste ou toque aqui</span>`}</div></div>`;
  const sala = em => ITENS.filter(x => E.where[x.id] === 'quarto' && x.em === em).map(x => itemHTML(x)).join('');
  $('jogo').innerHTML = `<div class="caixas">${caixa('mala', 'スーツケース', '🧳')}${caixa('mochila', 'リュック', '🎒')}</div>
    ${E.msg ? `<p class="fb" role="status">${E.msg}</p>` : `<p class="sub dica">${E.sel ? `Agora toque na <b>mala</b> ou na <b>mochila</b> para guardar ${it(E.sel).ic}.` : 'Arraste os objetos para a mala ou a mochila (ou toque no objeto e depois na caixa). Toque num objeto guardado para tirá-lo.'}</p>`}
    <div class="quarto" data-zona="quarto"><div class="movel"><small class="rot">🛏️ NA CAMA</small><div class="chips">${sala('cama') || '<span class="vazio">vazio</span>'}</div></div><div class="movel"><small class="rot">🖥️ NA ESCRIVANINHA</small><div class="chips">${sala('mesa') || '<span class="vazio">vazio</span>'}</div></div></div>
    <div class="row"><button class="btn pri" type="button" id="fechar">🧳 Fechar a mala e ir para o aeroporto</button></div>`;
  E.tremer = null;
}

/* ---------- resultado ---------- */
function avalia() {
  const ess = ITENS.filter(x => x.ess), falta = ess.filter(x => E.where[x.id] === 'quarto');
  if (falta.length) { const k = falta.find(x => x.id === 'passa') || falta.find(x => x.id === 'casaco') || falta[0]; return { tipo: 'B', k, falta }; }
  const erradas = ITENS.filter(x => { const w = E.where[x.id]; return w !== 'quarto' && w !== x.onde; });
  if (erradas.length) { const ord = ['passa', 'carreg']; const k = erradas.find(x => x.id === 'passa') || erradas.find(x => x.id === 'carreg') || erradas.find(x => x.onde !== 'casa') || erradas[0]; return { tipo: 'C', k, erradas }; }
  return { tipo: 'A' };
}
function cena(r) {
  if (r.tipo === 'A') return { fundo: 'neve', lugar: '🏔️ Sapporo, na neve', av: '😄', extra: '📸', falas: [{ q: 'eu', jp: 'ぜんぶ ありました！ いえに なにも わすれませんでした。さあ、たびの はじまりです！', pt: 'Tudo certo! Não esqueci nada em casa. Que comece a viagem!' }], estrelas: 3 };
  if (r.tipo === 'B') { const k = r.k;
    if (k.id === 'passa') return { fundo: 'aero', lugar: '🛫 Balcão de check-in', av: '😱', pensa: k, falas: [{ q: 'eu', jp: 'あっ！ パスポートを いえの つくえの うえに わすれました！ ひこうきに のれません！', pt: 'Ah, não! Esqueci meu passaporte em cima da escrivaninha, em casa! Não posso embarcar!' }], estrelas: 1 };
    if (k.id === 'casaco') return { fundo: 'neve', lugar: '🏔️ Sapporo, na neve', av: '🥶', pensa: k, falas: [{ q: 'eu', jp: 'さむい！ ゆきが ふって います。ベッドの うえに コートを わすれました！', pt: 'Brrr! Está nevando e esqueci meu casaco na cama!' }], estrelas: 1 };
    return { fundo: 'neve', lugar: '🏔️ Sapporo, na neve', av: '😰', pensa: k, falas: [{ q: 'eu', jp: `あっ！ ${k.n}を いえの ${k.lug}に わすれました！`, pt: `Ah, não! Esqueci ${k.pt} em casa, ${k.lugPt}!` }], estrelas: 1 }; }
  const k = r.k, w = E.where[k.id];
  if (k.id === 'passa') return { fundo: 'aero', lugar: '🛃 Imigração', av: '😅', mala: 1, falas: [{ q: 'ag', jp: 'パスポートを おねがいします。', pt: 'O passaporte, por favor.' }, { q: 'eu', jp: 'すみません！ パスポートを おおきい スーツケースに いれました。リュックに いれませんでした！', pt: 'Desculpe! Coloquei o passaporte na mala grande, não na mochila!' }], estrelas: 1 };
  if (k.onde === 'casa') return { fundo: 'neve', lugar: '🏔️ Sapporo, na neve', av: '🙃', falas: [{ q: 'eu', jp: `しまった！ ゆきの まちに ${k.n}を もって きました。ここでは いりません！`, pt: `Ops! Trouxe ${k.pt} para a cidade da neve. Aqui não preciso!` }], estrelas: 1 };
  const cx = c => NOME_CX[c];
  return { fundo: 'aero', lugar: '🛃 Imigração', av: '😅', mala: 1, falas: [{ q: 'eu', jp: `すみません！ ${k.n}を ${cx(w)}に いれました。${cx(k.onde)}に いれませんでした！`, pt: `Desculpe! Coloquei ${k.pt} ${w === 'mala' ? 'na mala' : 'na mochila'}, e não ${k.onde === 'mala' ? 'na mala' : 'na mochila'}!` }], estrelas: 1 };
}
function renderFim() {
  const r = E.res, c = cena(r); $('jogo').hidden = true; $('final').hidden = false;
  const bal = f => `<div class="bal ${f.q}"><div class="who">${f.q === 'ag' ? '🛃 Agente' : '🙂 Você'}</div>${ja(f.jp)}<p class="sub">${esc(f.pt)}</p><button type="button" class="btn peq" data-fala="${esc(f.jp)}">🔊 Ouvir</button></div>`;
  const estrelas = '⭐'.repeat(c.estrelas) + '☆'.repeat(3 - c.estrelas);
  const titulo = r.tipo === 'A' ? '🏅 Viajante profissional!' : r.tipo === 'B' ? '😱 Você esqueceu em casa!' : '🧳 Isso não vai aí!';
  const dica = r.tipo === 'B' ? `Faltaram: ${r.falta.map(x => `${x.ic} ${x.pt}`).join(', ')}.` : r.tipo === 'C' ? `Lugar errado: ${r.erradas.map(x => `${x.ic} ${x.pt}`).join(', ')}.` : 'Tudo no lugar certo, sem esquecer nada.';
  $('final').innerHTML = `<div class="cena ${c.fundo}"><span class="placa">${c.lugar}</span><div class="av">${c.av}${c.extra || ''}</div>${c.mala ? '<div class="esteira">🧳🧳🧳</div>' : ''}${c.pensa ? `<div class="pensa">💭 ${c.pensa.ic}<small>${esc(c.pensa.lugPt)}</small></div>` : ''}</div>
    <h2>${titulo} <span class="estr" aria-label="${c.estrelas} de 3 estrelas">${estrelas}</span></h2>
    ${c.falas.map(bal).join('')}<p class="nota">${esc(dica)}</p>
    <details class="aprendi"><summary>📚 O que esta cena ensina</summary><ul><li>${ja('〜を いれました')} = coloquei ○○ <small>(ex.: パスポートを リュックに いれました)</small></li><li>${ja('〜を わすれました')} = esqueci ○○ <small>(ex.: コートを いえに わすれました)</small></li><li>${ja('〜に いれませんでした')} = não coloquei em ○○</li><li>${ja('わすれませんでした')} = não esqueci</li></ul></details>
    <div class="row">${r.tipo === 'A' ? '<button class="btn pri" type="button" id="denovo">🔁 Jogar de novo</button>' : '<button class="btn pri" type="button" id="corrige">↩ Voltar para o quarto e corrigir</button><button class="btn" type="button" id="denovo">🔁 Começar do zero</button>'}</div>`;
  if (r.tipo === 'A') { setTimeout(() => fala(c.falas[0].jp), 400); } else setTimeout(() => fala(c.falas[c.falas.length - 1].jp), 400);
}
function fecha() {
  if (E.zip) return; E.zip = true; zipSom();
  const j = $('jogo'); j.classList.add('fechando'); setTimeout(() => { j.classList.remove('fechando'); E.zip = false; E.res = avalia(); E.fase = 'fim'; const est = cena(E.res).estrelas; if (est > MELHOR) { MELHOR = est; try { localStorage.setItem('utopiaMalaF1', String(est)); } catch (e) {} } render(); $('final').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 650);
}
function corrige() {
  const r = E.res; E.fase = 'quarto'; E.msg = ''; E.sel = null;
  E.brilha = r.tipo === 'B' ? r.falta.map(x => x.id) : r.erradas.map(x => x.id);
  if (r.tipo === 'C') r.erradas.forEach(x => { E.where[x.id] = 'quarto'; });   /* o que estava no lugar errado volta para o quarto, brilhando */
  render(); $('jogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- arrastar e tocar ---------- */
let DR = null;
document.addEventListener('pointerdown', e => { const el = e.target.closest('[data-mi]'); if (!el || E.fase !== 'quarto' || E.zip) return; const z = el.closest('[data-zona]'); DR = { id: el.dataset.mi, x: e.clientX, y: e.clientY, mov: false, gh: null, de: z ? z.dataset.zona : 'quarto' }; });
document.addEventListener('pointermove', e => { if (!DR) return;
  if (!DR.mov && Math.hypot(e.clientX - DR.x, e.clientY - DR.y) > 8) { DR.mov = true; const gh = document.createElement('div'); gh.className = 'mi gh'; gh.innerHTML = `<span class="ic">${it(DR.id).ic}</span>`; document.body.appendChild(gh); DR.gh = gh; }
  if (DR.gh) { DR.gh.style.left = (e.clientX - 24) + 'px'; DR.gh.style.top = (e.clientY - 24) + 'px'; document.querySelectorAll('[data-zona]').forEach(z => z.classList.remove('alvo')); const t = document.elementFromPoint(e.clientX, e.clientY), zn = t && t.closest('[data-zona]'); if (zn) zn.classList.add('alvo'); } });
document.addEventListener('pointerup', e => { if (!DR) return; const d = DR; DR = null; if (d.gh) d.gh.remove(); document.querySelectorAll('[data-zona]').forEach(z => z.classList.remove('alvo')); if (E.fase !== 'quarto') return;
  if (d.mov) { const t = document.elementFromPoint(e.clientX, e.clientY), zn = t && t.closest('[data-zona]'); if (zn) mover(d.id, zn.dataset.zona); else render(); return; }
  /* toque simples: guardado → volta ao quarto · no quarto → seleciona */
  if (d.de !== 'quarto') { if (E.sel && (d.de === 'mala' || d.de === 'mochila')) { mover(E.sel, d.de); return; } mover(d.id, 'quarto'); return; }
  E.sel = E.sel === d.id ? null : d.id; E.msg = ''; render(); });
document.addEventListener('pointercancel', () => { if (DR && DR.gh) DR.gh.remove(); DR = null; });
document.addEventListener('click', e => {
  const z = e.target.closest('[data-zona]');
  if (E.fase === 'quarto' && E.sel && z && !e.target.closest('[data-mi]') && (z.dataset.zona === 'mala' || z.dataset.zona === 'mochila')) { mover(E.sel, z.dataset.zona); return; }
  const f = e.target.closest('[data-fala]'); if (f) { fala(f.dataset.fala); return; }
  if (e.target.closest('#ouveBrief')) { fala(BRIEF.jp); return; }
  if (e.target.closest('#fechar')) { fecha(); return; }
  if (e.target.closest('#corrige')) { corrige(); return; }
  if (e.target.closest('#denovo')) { reinicia(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
});
$('btnRo').onclick = () => { ROM = !ROM; try { localStorage.setItem('utopiaRomaji', ROM ? '1' : '0'); } catch (e) {} $('btnRo').textContent = 'Romaji: ' + (ROM ? 'sim' : 'não'); $('btnRo').setAttribute('aria-pressed', String(ROM)); render(); };
$('btnRo').textContent = 'Romaji: ' + (ROM ? 'sim' : 'não');
render();
