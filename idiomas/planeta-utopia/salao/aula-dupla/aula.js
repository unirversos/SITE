/* Unirversos · Aula em dupla "Do encontro ao café" (piloto)
   Duas alunas, cada uma na sua tela, ligadas pelo Realtime Database (mesmo banco do Salão).
   Estado da aula: salao/mesas/sala-aula/s/<sala>/jogo  (sala padrão: "cafe"; outra dupla: ?sala=nome)
   Etapas: chegada → ficha → batalha naval → convite → café (robô) → papo → conta → lembrança.
   Respostas sempre escritas (kana ou romaji) e ditas em voz alta; nada de múltipla escolha de resposta. */

const Q = new URLSearchParams(location.search);
const SALA = (Q.get('sala') || 'cafe').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'cafe';
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && Q.get('local') === '1';
const DB_URL = 'https://unirversos-site-default-rtdb.firebaseio.com';
const CAMINHO = 'salao/mesas/sala-aula/s/' + SALA + '/jogo';
const FB = 'https://www.gstatic.com/firebasejs/10.12.0/';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const outro = r => (r === 'a' ? 'b' : 'a');
const conta = o => Object.keys(o || {}).length;

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
/* romaji digitado na ficha vira hiragana, para o tabuleiro ficar todo em kana */
const RK = {}; [...H].forEach((k, i) => { if (!(R[i] in RK)) RK[R[i]] = k; });
Object.assign(RK, { si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ', zi: 'じ', wo: 'を' });
[['ky', 'き'], ['gy', 'ぎ'], ['sh', 'し'], ['sy', 'し'], ['j', 'じ'], ['jy', 'じ'], ['ch', 'ち'], ['ty', 'ち'], ['ny', 'に'], ['hy', 'ひ'], ['by', 'び'], ['py', 'ぴ'], ['my', 'み'], ['ry', 'り']]
  .forEach(([c, k]) => { [['a', 'ゃ'], ['u', 'ゅ'], ['o', 'ょ']].forEach(([v, y]) => { RK[c + v] = k + y; }); });
function romaParaKana(txt) {
  const t = String(txt).trim(); if (!/[a-zA-Z]/.test(t)) return t;
  return t.replace(/[a-zA-Z][a-zA-Z\-']*/g, r => ({ o: 'を', wa: 'は' }[r.toLowerCase()] || trechoKana(r)))
    .replace(/\s+(が|を|は|に|で|と|も|の|か)(?=\s|$)/g, '$1').replace(/じ\s+はん/, 'じはん');
}
function trechoKana(t) {
  const s = t.toLowerCase(); let out = '';
  for (let i = 0; i < s.length;) {
    const c = s[i], nx = s[i + 1] || '';
    if (c === ' ') { out += ' '; i++; continue; }
    if (c === '-') { out += 'ー'; i++; continue; }
    if (c === "'") { i++; continue; }
    if (c === 'n' && (nx === 'n' || nx === "'" || !/[aiueoy]/.test(nx))) { out += 'ん'; i += (nx === 'n' && !/[aiueoy]/.test(s[i + 2] || '')) ? 2 : 1; continue; }
    if (c === nx && /[bcdfghjkmpqrstvwxyz]/.test(c)) { out += 'っ'; i++; continue; }
    if (c === 't' && nx === 'c') { out += 'っ'; i++; continue; }
    let ok = false;
    for (const n of [3, 2, 1]) { const p = s.substr(i, n); if (RK[p]) { out += RK[p]; i += n; ok = true; break; } }
    if (!ok) { out += c; i++; }
  }
  return out;
}
/* comparação tolerante: aceita kana, katakana, romaji com ou sem vogal longa */
function norm(t) {
  return hira(String(t || '').normalize('NFKC').toLowerCase())
    .replace(/[āâ]/g, 'a').replace(/[īî]/g, 'i').replace(/[ūû]/g, 'u').replace(/[ēê]/g, 'e').replace(/[ōô]/g, 'o')
    .replace(/[\s\-ー、。,.!?！？「」…・~〜'＿_]/g, '')
    .replace(/([aiueo])\1+/g, '$1').replace(/ou/g, 'o');
}
const tem = (txt, alts) => { const t = norm(txt); return alts.split('|').some(a => { a = norm(a); return a && t.includes(a); }); };
const falta = (txt, grupos) => (grupos || []).filter(g => !tem(txt, g));

/* ================= conteúdo da aula ================= */
const ETAPAS = [
  { id: 'chegada', nome: 'Chegada', min: 4, fundo: 'salao', placa: '🏮 Salão' },
  { id: 'ficha', nome: 'Minha ficha', min: 7, fundo: 'salao', placa: '🏮 Salão' },
  { id: 'batalha', nome: 'Batalha naval', min: 18, fundo: 'salao', placa: '🏮 Salão' },
  { id: 'convite', nome: 'Convite', min: 5, fundo: 'rua', placa: '🚶 まち' },
  { id: 'cafe', nome: 'O pedido no café', min: 12, fundo: 'cafe', placa: '☕ カフェ' },
  { id: 'papo', nome: 'Papo na mesa', min: 8, fundo: 'cafe', placa: '☕ カフェ' },
  { id: 'conta', nome: 'A conta', min: 3, fundo: 'cafe', placa: '☕ カフェ' },
  { id: 'lembranca', nome: 'Lembrança', min: 3, fundo: 'cafe', placa: '☕ カフェ' }
];
const TOTAL_MIN = ETAPAS.reduce((s, e) => s + e.min, 0);

/* as 6 casas da batalha naval = os 6 campos da ficha */
const soNum = x => String(x).normalize('NFKC').replace(/\D/g, '');
const CASAS = [
  { id: 'idade', ic: '🎂', rot: 'とし', pt: 'idade',
    campo: { perg: 'Quantos anos você tem?', antes: 'わたしは', depois: 'さいです。', curto: true, modo: 'numeric', ph: '28',
      ideias: [['ひみつ', 'segredo']],
      valor: x => (tem(x, 'ひみつ|himitsu|秘密') ? 'ひみつです' : (soNum(x) && +soNum(x) < 121 ? soNum(x) + 'さいです' : '')) },
    perg: { m: N => `${N}さんは なんさいですか。`, d1: N => `${N}さんは なん…`, d2: N => `${N}さんは ＿＿＿ですか。`, pt: 'Quantos anos você tem?', k: ['なんさい|nansai|何歳|何才|おいくつ|oikutsu'] },
    resp: { d2: '＿＿さいです。', k: ['さい|sai|歳|才|ひみつ|himitsu'] } },
  { id: 'trab', ic: '💼', rot: 'しごと', pt: 'o que ela faz',
    campo: { perg: 'O que você faz?', antes: 'わたしは', depois: 'です。', ph: 'かいしゃいん',
      ideias: [['かいしゃいん', 'funcionária de empresa'], ['がくせい', 'estudante'], ['せんせい', 'professora'], ['いしゃ', 'médica'], ['かんごし', 'enfermeira'], ['しゅふ', 'dona de casa'], ['エンジニア', 'engenheira'], ['デザイナー', 'designer']],
      valor: x => { x = romaParaKana(x).replace(/\s*(です|desu)[。.]?$/i, '').trim(); return x ? x + 'です' : ''; } },
    perg: { m: N => `${N}さんの おしごとは なんですか。`, d1: N => `${N}さんの おしごとは…`, d2: N => `${N}さんの ＿＿＿は なんですか。`, pt: 'Qual é o seu trabalho?', k: ['しごと|shigoto|仕事', 'なん|nan|何'] },
    resp: { d2: '＿＿＿です。', k: ['です|desu'] } },
  { id: 'acorda', ic: '⏰', rot: 'あさ', pt: 'que horas ela acorda',
    campo: { perg: 'Que horas você acorda todo dia?', antes: 'まいにち', depois: 'に おきます。', ph: '6じはん',
      ideias: [['6じ', '6h'], ['6じはん', '6h30'], ['7じ', '7h'], ['7じはん', '7h30'], ['8じ', '8h']],
      valor: x => { x = romaParaKana(String(x).normalize('NFKC')).replace(/\s*に.*$/, '').trim(); if (/^\d{1,2}$/.test(x)) x += 'じ'; return x ? x + 'に おきます' : ''; } },
    perg: { m: () => 'まいにち なんじに おきますか。', d1: () => 'まいにち なんじに…', d2: () => 'まいにち ＿＿＿に おきますか。', pt: 'Que horas você acorda todo dia?', k: ['なんじ|nanji|何時', 'おき|oki|起き'] },
    resp: { d2: '＿じに おきます。', k: ['じ|ji|時', 'おき|oki|起き'] } },
  { id: 'fds', ic: '🌈', rot: 'しゅうまつ', pt: 'o que ela faz no fim de semana',
    campo: { perg: 'O que você costuma fazer no fim de semana?', antes: 'しゅうまつは たいてい', depois: '', ph: 'えいがを みます',
      ideias: [['えいがを みます', 'vejo filme'], ['ほんを よみます', 'leio livro'], ['おんがくを ききます', 'ouço música'], ['スポーツを します', 'faço esporte'], ['かいものを します', 'faço compras'], ['うちで ねます', 'durmo em casa'], ['ともだちと はなします', 'converso com amigos']],
      valor: x => { x = romaParaKana(x).replace(/[。.]$/, '').replace(/^(しゅうまつは\s*)?(たいてい\s*)?/, '').trim(); return x ? 'たいてい ' + x : ''; } },
    perg: { m: () => 'しゅうまつは たいてい なにを しますか。', d1: () => 'しゅうまつは たいてい…', d2: () => 'しゅうまつは たいてい ＿＿を しますか。', pt: 'O que você costuma fazer no fim de semana?', k: ['しゅうまつ|shumatsu|週末', 'なに|nani|何'] },
    resp: { d2: 'たいてい ＿＿＿ます。', k: ['ます|masu|ません|masen'] } },
  { id: 'cafe', ic: '☕', rot: 'コーヒー', pt: 'se ela toma muito café',
    campo: { perg: 'Você toma café com que frequência?', antes: 'コーヒーを', depois: '', ph: 'よく のみます',
      ideias: [['まいにち のみます', 'todo dia'], ['よく のみます', 'muito'], ['ときどき のみます', 'às vezes'], ['あまり のみません', 'quase não tomo'], ['ぜんぜん のみません', 'nunca tomo']],
      valor: x => { x = romaParaKana(x).replace(/[。.]$/, '').trim(); return x; } },
    perg: { m: () => 'よく コーヒーを のみますか。', d1: () => 'よく コーヒーを…', d2: () => '＿＿ コーヒーを のみますか。', pt: 'Você toma café com frequência?', k: ['こーひー|kohi|coffee|珈琲', 'のみ|nomi|飲み'] },
    resp: { d2: '＿＿＿ のみます。／ のみません。', k: ['のみ|nomi|飲み'] } },
  { id: 'pet', ic: '🐾', rot: 'いぬ・ねこ', pt: 'se ela tem cachorro ou gato',
    campo: { perg: 'Tem cachorro ou gato em casa?', antes: 'うちに', depois: '', ph: 'いぬが います',
      ideias: [['いぬが います', 'tenho cachorro'], ['ねこが います', 'tenho gato'], ['いぬと ねこが います', 'tenho os dois'], ['いぬも ねこも いません', 'não tenho nenhum']],
      valor: x => { x = romaParaKana(x).replace(/[。.]$/, '').trim(); return x; } },
    perg: { m: () => 'うちに いぬが いますか。', d1: () => 'うちに いぬが…', d2: () => 'うちに いぬが ＿＿＿か。', pt: 'Tem cachorro na sua casa?', k: ['います|imasu|ありますか', 'いぬ|inu|ねこ|neko|ぺっと|petto|犬|猫'] },
    resp: { d2: '＿＿が います。／ いません。', k: ['います|imasu|いません|imasen'] } }
];
const casaDe = id => CASAS.find(c => c.id === id);
const REACOES = [
  { t: 'そうですか。', pt: 'Ah, é?' },
  { t: 'いいですね！', pt: 'Que legal!' },
  { t: 'わたしもです！', pt: 'Eu também!' },
  { t: 'すみません、もういちど おねがいします。', pt: 'Não entendi: pedir para repetir', ar: true }
];

const LUGARES = [
  { ic: '🏦', n: 'ぎんこう', pt: 'banco', k: 'ぎんこう|ginko|銀行' },
  { ic: '🏤', n: 'ゆうびんきょく', pt: 'correio', k: 'ゆうびんきょく|yubinkyoku|郵便局' },
  { ic: '📚', n: 'ほんや', pt: 'livraria', k: 'ほんや|honya|本屋' }
];
const BEBIDAS = [
  { id: 'kohi', ic: '☕', n: 'コーヒー', p: 400, k: 'こーひー|kohi|coffee|珈琲' },
  { id: 'ocha', ic: '🍵', n: 'おちゃ', p: 350, k: 'おちゃ|ocha|お茶' },
  { id: 'jusu', ic: '🧃', n: 'ジュース', p: 450, k: 'じゅーす|jusu|juice' },
  { id: 'kokoa', ic: '🍫', n: 'ココア', p: 480, k: 'ここあ|kokoa|cocoa' }
];
const COMIDAS = [
  { id: 'keki', ic: '🍰', n: 'ケーキ', p: 500, k: 'けーき|keki|cake' },
  { id: 'aisu', ic: '🍨', n: 'アイスクリーム', p: 300, k: 'あいす|aisu|icecream' },
  { id: 'sando', ic: '🥪', n: 'サンドイッチ', p: 600, k: 'さんど|sando|sandwich' }
];
const item = id => BEBIDAS.concat(COMIDAS).find(x => x.id === id);
const K_KUDASAI = 'ください|kudasai|下さい|おねがい|onegai|お願い';

/* ================= estado ================= */
let S = null, EU = null, sync = null, pedindoLugar = false;
let ROM = false; try { ROM = localStorage.getItem('utopiaRomaji') === '1'; } catch (e) {}
const AV = window.UtopiaAvatar && UtopiaAvatar.load();
const MEU_SEL = AV && AV.sel ? AV.sel : null;
const PERFIL = (AV && AV.profile) || {};
const avatarHTML = sel => (sel && window.UtopiaAvatar) ? UtopiaAvatar.svg(sel, { viewBox: '40 46 160 160', still: true, label: 'Avatar' }) : '🧳';
const nome = r => (S && S.jog && S.jog[r] && S.jog[r].nome) || 'Viajante';
const iEtapa = () => Math.max(0, ETAPAS.findIndex(e => e.id === S.etapa));
const novo = () => ({ v: 1, etapa: 'chegada', p: 0, t0: Date.now() });
const logN = root => conta(root.log);
function poeLog(root, q, t, ex) { root.log = root.log || {}; root.log[String(logN(root)).padStart(4, '0') + q] = Object.assign({ q, t }, ex || {}); }
const ja = t => { const r = romaji(t); return `<span class="jp" lang="ja">${esc(t)}</span>` + (r !== String(t) ? `<span class="wro"${ROM ? '' : ' hidden'}>${esc(r)}</span>` : ''); };

/* ---------- voz ---------- */
function fala(t) {
  try {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(String(t).replace(/＿/g, ''));
    u.lang = 'ja-JP'; u.rate = .8 * (window.UniVel ? UniVel.get() : 1);
    const v = speechSynthesis.getVoices().find(x => /^ja/i.test(x.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ================= roteiro das etapas com falas em sequência ================= */
function passos() {
  const A = nome('a'), B = nome('b'), s = S, cv = s.cv || {}, cf = s.cafe || {}, beb = cf.beb || {};
  const F = (quem, instr, m, d1, d2, pt, k, ex) => Object.assign({ tipo: 'fala', quem, instr, m, d1, d2, pt, k }, ex || {});
  if (s.etapa === 'chegada') return [
    F('a', `Cumprimente ${esc(B)} e diga o seu nome.`, `こんにちは。はじめまして。${A}です。`, 'こんにちは。はじめ…', 'こんにちは。はじめまして。＿＿＿です。', 'Olá. Prazer em conhecer. Sou a …', ['はじめまして|hajimemashite|初めまして']),
    F('b', 'Responda ao cumprimento e diga o seu nome.', `はじめまして。${B}です。どうぞ よろしく おねがいします。`, 'はじめまして。…', 'はじめまして。＿＿＿です。どうぞ よろしく ＿＿＿＿＿。', 'Prazer. Sou a … Conto com você.', ['はじめまして|hajimemashite|初めまして', 'よろしく|yoroshiku|宜しく']),
    F('a', 'Feche o cumprimento.', 'どうぞ よろしく おねがいします。', 'どうぞ よろ…', 'どうぞ ＿＿＿＿ おねがいします。', 'Conto com você também.', ['よろしく|yoroshiku|宜しく'])
  ];
  if (s.etapa === 'convite') {
    const L = LUGARES[cv.alvo || 0];
    return [
      F('a', `Convide ${esc(B)} para tomar um café com você.`, `${B}さん、いっしょに コーヒーを のみませんか。`, `${B}さん、いっしょに…`, `${B}さん、いっしょに コーヒーを ＿＿＿＿＿か。`, 'Vamos tomar um café juntas?', ['のみませんか|nomimasenka|飲みませんか']),
      F('b', 'Aceite e pergunte onde fica o café.', 'いいですね。カフェは どこですか。', 'いいですね。カフェは…', 'いいですね。カフェは ＿＿ですか。', 'Boa ideia. Onde fica o café?', ['どこ|doko|何処']),
      F('a', `Olhe o mapa (só você vê) e diga para ${esc(B)} onde fica o café.`, `カフェは ${L.n}の となりです。`, 'カフェは…', 'カフェは ＿＿＿＿の となりです。', `O café fica ao lado do(a) ${L.pt}.`, [L.k, 'となり|tonari|隣|よこ|yoko|ちかく|chikaku|近く']),
      { tipo: 'toque', quem: 'b', instr: `Leia a resposta de ${esc(A)} e toque no mapa: qual desses lugares é o café?` }
    ];
  }
  if (s.etapa === 'cafe') {
    const bA = item(beb.a) || BEBIDAS[0], bB = item(beb.b) || BEBIDAS[0], igual = bA.id === bB.id;
    const errado = bB.id === 'ocha' ? item('kohi') : item('ocha');
    const c1 = item(cf.com1), c2 = item(cf.com2) || COMIDAS.find(c => c.id !== cf.com1);
    const kCom = COMIDAS.map(c => c.k).join('|');
    return [
      { tipo: 'bebida', quem: 'ambas' },
      F('a', `Pergunte a ${esc(B)} o que ela vai beber.`, `${B}さんは なにを のみますか。`, `${B}さんは なにを…`, `${B}さんは ＿＿を のみますか。`, 'O que você vai beber?', ['なに|nani|何', 'のみ|nomi|飲み']),
      F('b', 'Responda com a bebida que você escolheu.', `わたしは ${bB.n}を のみます。`, 'わたしは…', 'わたしは ＿＿＿を のみます。', `Eu vou beber ${bB.n}.`, [bB.k]),
      F('b', `Agora devolva a pergunta para ${esc(A)}.`, `${A}さんは なにを のみますか。`, `${A}さんは…`, `${A}さんは ＿＿を のみますか。`, 'E você, o que vai beber?', ['なに|nani|何|さんは|sanwa|sanha']),
      F('a', igual ? 'Você escolheu a mesma bebida! Use も (também).' : 'Responda com a bebida que você escolheu.', igual ? `わたしも ${bA.n}を のみます。` : `わたしは ${bA.n}を のみます。`, igual ? 'わたしも…' : 'わたしは…', igual ? 'わたしも ＿＿＿を のみます。' : 'わたしは ＿＿＿を のみます。', igual ? `Eu também vou beber ${bA.n}.` : `Eu vou beber ${bA.n}.`, [bA.k]),
      F('b', `Chame o robô e peça as duas bebidas: a sua e a de ${esc(A)}.`, igual ? `すみません。${bB.n}を ください。${A}さんも ${bA.n}です。` : `すみません。${bB.n}と ${bA.n}を ください。`, 'すみません。…', igual ? `すみません。＿＿＿を ください。${A}さんも ＿＿＿です。` : 'すみません。＿＿＿と ＿＿＿を ください。', igual ? `Com licença. Um ${bB.n}, por favor. Para ${A} também.` : `Com licença. ${bB.n} e ${bA.n}, por favor.`,
        igual ? [bB.k, K_KUDASAI] : [bB.k, bA.k, K_KUDASAI],
        { depois: (txt, root) => poeLog(root, 'r', igual ? `はい。${bB.n}を ふたつですね。` : `はい。${bB.n}と ${bA.n}ですね。`, { pt: igual ? `Certo. Dois ${bB.n}, né?` : `Certo. ${bB.n} e ${bA.n}, né?` }) }),
      F('a', 'Peça também alguma coisa para comer. Escolha no cardápio.', 'ケーキも ください。', '＿＿＿も…', '＿＿＿も ください。', 'Um(a) …, também, por favor.', [kCom, K_KUDASAI],
        { depois: (txt, root) => { const c = COMIDAS.find(x => tem(txt, x.k)) || COMIDAS[0]; root.cafe = root.cafe || {}; root.cafe.com1 = c.id;
            poeLog(root, 'r', `すみません。${c.n}は ありません。`, { pt: `Desculpe. Não temos ${c.n}.` }); } }),
      F('a', `Acabou! Peça outra coisa do cardápio (comece com じゃあ: "então…").`, `じゃあ、${c2.n}を ください。`, 'じゃあ、…', 'じゃあ、＿＿＿を ください。', `Então, um(a) ${c2.n}, por favor.`, [COMIDAS.filter(c => c.id !== cf.com1).map(c => c.k).join('|'), K_KUDASAI],
        { aviso: txt => (c1 && tem(txt, c1.k) && !COMIDAS.some(x => x.id !== c1.id && tem(txt, x.k))) ? `${c1.n} acabou! Peça outra coisa do cardápio.` : null,
          depois: (txt, root, forcado) => { let c = COMIDAS.find(x => x.id !== root.cafe.com1 && tem(txt, x.k));
            if (!c && !forcado && c1 && tem(txt, c1.k)) return `${c1.n} acabou! Peça outra coisa do cardápio.`;
            c = c || COMIDAS.find(x => x.id !== root.cafe.com1); root.cafe.com2 = c.id;
            poeLog(root, 'r', 'はい、わかりました。', { pt: 'Certo, entendido.' });
            poeLog(root, 'r', 'おまたせしました。どうぞ。', { pt: 'Desculpem a demora. Aqui está.' });
            poeLog(root, 's', `☕ As bebidas chegaram… mas veio ${errado.n} para ${nome('b')}!`); } }),
      F('b', `O robô errou a sua bebida: veio ${errado.n}. Avise que isso não é ${bB.n}.`, `すみません。これは ${bB.n}じゃないです。`, 'すみません。これは…', `すみません。これは ${bB.n}＿＿＿＿＿。`, `Com licença. Isto não é ${bB.n}.`, ['じゃない|janai|じゃありません|jaarimasen|ではありません|dewaarimasen|ではない|dewanai'],
        { depois: (txt, root) => { poeLog(root, 'r', `あ、すみません！ ${bB.n}を どうぞ。`, { pt: `Ah, desculpe! Aqui está o ${bB.n}.` });
            poeLog(root, 'r', `この ${c2.n}は だれのですか。`, { pt: `De quem é este(a) ${c2.n}?` }); } }),
      F('a', 'O robô quer saber de quem é a comida. É sua!', 'わたしのです。', 'わたし…', '＿＿＿のです。', 'É meu.', ['わたしの|watashino|私の'],
        { depois: (txt, root) => poeLog(root, 'r', 'はい、どうぞ。', { pt: 'Aqui está.' }) })
    ];
  }
  if (s.etapa === 'papo') {
    const q1 = (q, N) => F(q, `Pergunte a ${esc(N)} o que ela fez no fim de semana.`, `${N}さん、しゅうまつ、なにを しましたか。`, `${N}さん、しゅうまつ、…`, `${N}さん、しゅうまつ、なにを ＿＿＿＿か。`, 'O que você fez no fim de semana?', ['しゅうまつ|shumatsu|週末', 'しました|shimashita|ましたか|mashitaka']);
    const r1 = (q, m, pt) => F(q, 'Conte o que você fez, no passado. Tente usar と (com quem) ou じかん (quanto tempo).', m, m.split(' ')[0] + '…', '＿＿＿と ＿＿＿を ＿＿ました。／ ＿じかん ＿＿ました。', pt, ['ました|mashita|でした|deshita|ませんでした|masendeshita']);
    const q2 = q => F(q, 'Pergunte se ontem foi dia de folga.', 'きのうは やすみでしたか。', 'きのうは…', 'きのうは やすみ＿＿＿か。', 'Ontem foi folga?', ['きのう|kino|昨日', 'でした|deshita']);
    const r2 = q => F(q, 'Responda: foi folga (でした) ou não foi (じゃなかったです)?', 'いいえ、やすみじゃなかったです。しごとでした。', 'はい、…／ いいえ、…', 'はい、やすみでした。／ いいえ、やすみ＿＿＿＿＿＿です。', 'Não, não foi folga. Foi trabalho. (Ou: はい、やすみでした。)', ['でした|deshita|じゃなかった|janakatta|ではなかった|ありませんでした']);
    return [
      q1('a', B), r1('b', 'ともだちと えいがを みました。', 'Vi um filme com uma amiga.'), q2('b'), r2('a'),
      q1('b', A), r1('a', 'うちで 2じかん にほんごを べんきょうしました。', 'Estudei japonês por 2 horas em casa.'), q2('a'), r2('b')
    ];
  }
  if (s.etapa === 'conta') return [
    F('b', 'Chame o robô e pergunte quanto deu.', 'すみません、いくらですか。', 'すみません、いく…', 'すみません、＿＿＿ですか。', 'Com licença, quanto é?', ['いくら|ikura|幾ら'],
      { depois: (txt, root) => poeLog(root, 'r', `ぜんぶで ${totalDe(root)}えんです。`, { pt: `No total, ${totalDe(root)} ienes.`, oc: 1 }) }),
    { tipo: 'preco', quem: 'a' }
  ];
  return [];
}
function totalDe(root) { const c = root.cafe || {}, b = c.beb || {}; return [b.a || 'kohi', b.b || 'kohi', c.com2 || 'keki'].map(item).filter(Boolean).reduce((s, x) => s + x.p, 0); }

function concluida() {
  const s = S, f = s.ficha || {};
  if (s.etapa === 'ficha') return !!(f.a && f.a.ok && f.b && f.b.ok);
  if (s.etapa === 'batalha') return !!(s.bat && s.bat.fim);
  if (s.etapa === 'lembranca') return false;
  return (s.p || 0) >= passos().length;
}
function vezDe() {
  const s = S;
  if (concluida() || s.etapa === 'ficha' || s.etapa === 'lembranca') return 'ambas';
  if (s.etapa === 'batalha') { const b = s.bat || {}; return b.fase === 'responder' ? outro(b.vez || 'b') : (b.vez || 'b'); }
  const st = passos()[s.p || 0]; return st ? st.quem : 'ambas';
}
/* o que acontece ao entrar em cada etapa */
function entra(root) {
  const e = ETAPAS.find(x => x.id === root.etapa);
  poeLog(root, 's', `— ${ETAPAS.indexOf(e) + 1}. ${e.nome} —`);
  if (root.etapa === 'batalha') root.bat = { vez: 'b', fase: 'perguntar' };
  if (root.etapa === 'convite') root.cv = { alvo: Math.floor(Math.random() * LUGARES.length) };
  if (root.etapa === 'cafe') { root.cafe = {}; poeLog(root, 'r', 'いらっしゃいませ。メニューを どうぞ。', { pt: 'Bem-vindas! Aqui está o cardápio.' }); }
}
function avanca(de) {
  return sync.tx(root => { if (!root || root.etapa !== de) return; const i = ETAPAS.findIndex(e => e.id === de); if (i < 0 || i >= ETAPAS.length - 1) return;
    root.etapa = ETAPAS[i + 1].id; root.p = 0; root.pronto = null; entra(root); return root; });
}

/* ================= ligação entre as duas telas ================= */
function poe(obj, caminho, val) { const ks = caminho.split('/'); let o = obj; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; } if (val === null) delete o[ks[ks.length - 1]]; else o[ks[ks.length - 1]] = val; }
function ligaLocal() {
  const K = 'aulaDupla:' + SALA, ler = () => { try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { return null; } }; let cb = null;
  const grava = v => { localStorage.setItem(K, JSON.stringify(v)); if (cb) cb(ler()); };
  window.addEventListener('storage', e => { if (e.key === K && cb) cb(ler()); });
  return { uid: Q.get('eu') || 'u1', nomeConta: Q.get('nome') || '', on: f => { cb = f; f(ler()); },
    update: async p => { const v = ler() || {}; Object.entries(p).forEach(([k, x]) => poe(v, k, x)); grava(v); },
    tx: async fn => { const r = fn(ler()); if (r !== undefined) grava(r); } };
}
async function ligaFirebase() {
  const [{ getApps }, { getAuth, onAuthStateChanged }, D] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-database.js')]);
  const user = await new Promise(res => { (function espera() { const a = getApps()[0]; if (!a) { setTimeout(espera, 300); return; } onAuthStateChanged(getAuth(a), u => { if (u) res(u); }); })(); });
  const r = D.ref(D.getDatabase(getApps()[0], DB_URL), CAMINHO);
  return { uid: user.uid, nomeConta: (user.displayName || '').split(' ')[0],
    on: (f, err) => D.onValue(r, s => f(s.val()), err), update: p => D.update(r, p), tx: fn => D.runTransaction(r, cur => fn(cur)) };
}
const meuJog = () => ({ uid: sync.uid, nome: ((PERFIL.kata || PERFIL.name || '').trim() || sync.nomeConta || 'Viajante').slice(0, 20), sel: MEU_SEL || null });
function sentar() {
  if (pedindoLugar) return; pedindoLugar = true;
  sync.tx(root => { root = (root && root.etapa) ? root : novo(); const j = root.jog = root.jog || {};
    if ((j.a && j.a.uid === sync.uid) || (j.b && j.b.uid === sync.uid)) return;
    if (!j.a) j.a = meuJog(); else if (!j.b) j.b = meuJog(); else return;
    if (j.a && j.b) root.t0 = Date.now();
    return root; }).catch(semLigacao).finally(() => { pedindoLugar = false; });
}
function semLigacao() {
  $('aula').hidden = true; $('entrada').hidden = false;
  $('entrada').innerHTML = '<h2>Não consegui ligar as duas telas</h2><p class="sub">Confira a internet e recarregue a página. Se continuar, avise a professora: pode ser a permissão do banco para esta aula.</p><div class="row"><button class="btn pri" type="button" onclick="location.reload()">Recarregar</button></div>';
}

/* ================= desenho da tela ================= */
let ui = { chave: '', nivel: 0, tent: 0, casa: null, verPreco: false };
let falados = null, logChave = '';

function recebe(v) {
  S = v;
  const j = (S && S.jog) || {};
  EU = (j.a && j.a.uid === sync.uid) ? 'a' : (j.b && j.b.uid === sync.uid) ? 'b' : null;
  if (!EU) {
    if (!S || !S.etapa || !j.a || !j.b) { sentar(); return; }
    $('aula').hidden = true; $('rodape').hidden = true; $('entrada').hidden = false; document.querySelector('.wrap').classList.remove('em-aula');
    $('entrada').innerHTML = `<h2>Esta aula já tem uma dupla</h2><p class="sub">${esc(j.a.nome)} e ${esc(j.b.nome)} estão (ou estiveram) nesta aula. Se a aula delas já acabou, você pode começar uma nova.</p><div class="row"><button class="btn pri" type="button" id="novaAula">Começar uma aula nova</button></div>`;
    $('novaAula').onclick = () => sync.tx(() => { const n = novo(); n.jog = { a: meuJog() }; return n; }).catch(semLigacao);
    return;
  }
  $('rodape').hidden = false;
  if (!j.a || !j.b) {
    $('aula').hidden = true; $('entrada').hidden = false;
    $('entrada').innerHTML = `<div class="row"><div class="c-av eu"><div class="face">${avatarHTML(j[EU].sel)}</div></div><div><h2>Você chegou, ${esc(j[EU].nome)}!</h2><p class="sub">A aula começa quando a sua dupla entrar por este mesmo endereço.</p></div></div><div class="espera"><i></i><span>Esperando a outra aluna…</span></div>`;
    return;
  }
  $('entrada').hidden = true; $('aula').hidden = false; document.querySelector('.wrap').classList.add('em-aula');
  /* quando as duas tocam em "próxima etapa", a aula avança */
  const pr = S.pronto || {};
  if (pr.a === S.etapa && pr.b === S.etapa) { avanca(S.etapa); }
  /* café: as duas escolheram a bebida → começa a conversa */
  if (S.etapa === 'cafe' && (S.p || 0) === 0) { const b = (S.cafe || {}).beb || {}; if (b.a && b.b) sync.tx(root => { if (!root || root.etapa !== 'cafe' || (root.p || 0) !== 0) return; root.p = 1; return root; }); }
  desenha();
}

function chave() {
  const s = S, b = s.bat || {}, ab = b.ab || {}, c = s.cafe || {}, cv = s.cv || {}, l = s.lemb || {}, f = s.ficha || {};
  return JSON.stringify([s.etapa, s.p || 0, concluida(), (s.pronto || {})[EU] || 0, b.vez, b.fase, b.casa, conta(ab.a), conta(ab.b), !!(f[EU] && f[EU].ok), (c.beb || {})[EU] || 0, cv.erro || 0, !!l[EU], !!(l.a && l.b), l.ok || 0]);
}
function desenha(forca) {
  const i = iEtapa(), e = ETAPAS[i], P = outro(EU), vz = vezDe();
  $('trilho').innerHTML = `<div class="pts" role="img" aria-label="Etapa ${i + 1} de ${ETAPAS.length}">${ETAPAS.map((x, k) => `<i class="${k < i ? 'f' : k === i ? 'a' : ''}"></i>`).join('')}</div><div class="leg"><b>${i + 1}. ${esc(e.nome)}</b><span>etapa ${i + 1} de ${ETAPAS.length} · cerca de ${e.min} min</span></div>`;
  /* cena */
  const c = S.cafe || {}, servido = ['papo', 'conta', 'lembranca'].includes(S.etapa) || (S.etapa === 'cafe' && (S.p || 0) >= 8);
  const av = r => `<div class="c-av${r === EU ? ' eu' : ''}${(vz === r || vz === 'ambas') ? ' vez' : ''}"><div class="face">${avatarHTML(S.jog[r].sel)}</div><b>${esc(nome(r))}${r === EU ? ' (você)' : ''}</b></div>`;
  const meio = e.fundo === 'salao' ? '<div class="mesa">🪑</div>' : e.fundo === 'rua' ? '<div>🏦🏤📚</div><small>カフェは どこ？</small>'
    : `<div>🤖</div><div class="mesa">${servido ? ((item((c.beb || {}).a) || {}).ic || '☕') + ((item(c.com2) || {}).ic || '') + ((item((c.beb || {}).b) || {}).ic || '☕') : '📋'}</div>`;
  const cn = $('cena'); cn.dataset.fundo = e.fundo; cn.innerHTML = `<span class="placa">${e.placa}</span>${av(EU)}<div class="c-meio">${meio}</div>${av(P)}`;
  conversa();
  const k = chave();
  if (forca || k !== ui.chave) {
    const mesma = k === ui.chave, antes = mesma && $('inp') ? $('inp').value : '';
    if (!mesma) ui = { chave: k, nivel: 0, tent: 0, casa: null, verPreco: false };
    painel(); acao();
    if (antes && $('inp')) $('inp').value = antes;
    if (!mesma && (vz === EU || vz === 'ambas')) { const st = passos()[S.p || 0], b = S.bat || {};
      const noPainel = !concluida() && ((S.etapa === 'batalha' && b.fase === 'perguntar') || (st && (st.tipo === 'toque' || (st.tipo === 'bebida' && !((S.cafe || {}).beb || {})[EU]))));
      try { (noPainel ? $('painel') : $('acao')).scrollIntoView({ behavior: 'smooth', block: noPainel ? 'start' : 'nearest' }); } catch (e) {} }
  }
  $('btnRo').textContent = 'Romaji: ' + (ROM ? 'sim' : 'não'); $('btnRo').setAttribute('aria-pressed', String(ROM));
  relogio();
}
function relogio() { if (!S || !S.t0 || !EU) { $('relogio').textContent = ''; return; } const m = Math.max(0, Math.floor((Date.now() - S.t0) / 60000)); $('relogio').textContent = `⏱ ${m} min de ${TOTAL_MIN}`; }
setInterval(relogio, 20000);

/* ---------- conversa ---------- */
function precoEscondido() { return S.etapa === 'conta' && (S.p || 0) === 1 && !ui.verPreco; }
function conversa() {
  const ks = Object.keys(S.log || {}).sort(), k2 = ks.length + '|' + precoEscondido() + '|' + ROM + '|' + EU;
  const idf = k => k + '|' + S.log[k].t;
  if (falados === null || ks.length < falados.size) falados = new Set(ks.map(idf));          /* ao abrir a página (ou recomeçar), não repete as falas antigas */
  ks.forEach(k => { const m = S.log[k]; if (!falados.has(idf(k))) { falados.add(idf(k)); if (m.q === 'r') fala(m.t); } });
  if (k2 === logChave) return; logChave = k2;
  const box = $('conv');
  box.innerHTML = ks.map(k => { const m = S.log[k];
    if (m.q === 's') return `<div class="msg sis">${esc(m.t)}</div>`;
    if (m.q === 'r') { const oc = m.oc && precoEscondido();
      return `<div class="msg robo"><span class="quem">🤖 ロボ</span>${oc ? '<span>🔊 Ouça com atenção…</span>' : ja(m.t) + (m.pt ? `<span class="pt">${esc(m.pt)}</span>` : '')}<button class="ou" type="button" data-fala="${esc(m.t)}">🔊 ouvir</button></div>`; }
    return `<div class="msg ${m.q === EU ? 'meu' : 'dele'}"><span class="quem">${esc(nome(m.q))}${m.q === EU ? ' (você)' : ''}</span>${ja(m.t)}${m.q === EU ? '' : `<button class="ou" type="button" data-fala="${esc(m.t)}">🔊 ouvir</button>`}</div>`;
  }).join('') || '<div class="msg sis">A conversa de vocês aparece aqui.</div>';
  box.scrollTop = box.scrollHeight;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-fala]'); if (b) { try { speechSynthesis.cancel(); } catch (x) {} fala(b.dataset.fala); } });

/* ---------- painel: o que cada uma vê ---------- */
function tabuleiro(dono, opt) {
  opt = opt || {}; const f = (S.ficha || {})[dono] || {}, ab = ((S.bat || {}).ab || {})[dono] || {};
  return `<div class="casas">${CASAS.map(c => { const aberta = opt.tudo || ab[c.id];
    if (aberta) return `<div class="casa ab"><span class="ic">${c.ic}</span><span class="vl" lang="ja">${esc(f[c.id] || '')}</span>${ROM ? `<span class="wro">${esc(romaji(f[c.id] || ''))}</span>` : ''}</div>`;
    return `<button type="button" class="casa${ui.casa === c.id ? ' sel' : ''}" data-casa="${c.id}"${opt.toca ? '' : ' disabled'} aria-label="Casa fechada: ${esc(c.pt)}"><span class="ic">${c.ic}</span><span class="rt" lang="ja">${c.rot}</span><span class="int">？</span></button>`; }).join('')}</div>`;
}
function minhaFicha(aberta) {
  const f = (S.ficha || {})[EU] || {}, b = S.bat || {}, ab = (b.ab || {})[EU] || {}, ped = S.etapa === 'batalha' && b.fase === 'responder' && outro(b.vez) === EU ? b.casa : null;
  return `<details class="minha"${aberta || ped ? ' open' : ''}><summary>🔒 Minha ficha (só você vê)</summary><ul>${CASAS.map(c => `<li class="${ab[c.id] ? 'ach' : ''}${ped === c.id ? ' ped' : ''}">${c.ic} ${ja(f[c.id] || '')}${ab[c.id] ? ' ✓' : ''}</li>`).join('')}</ul></details>`;
}
function cardapio(toca) {
  const c = S.cafe || {}, meu = (c.beb || {})[EU], fora = c.com1;
  const lin = (x, bot) => { const cls = 'it' + (x.id === meu ? ' meu' : '') + (x.id === fora ? ' fora' : ''), inner = `<span class="nm">${x.ic} ${ja(x.n)}</span><span class="pr">${x.p}えん</span>`;
    return bot ? `<button type="button" class="${cls}" data-beb="${x.id}">${inner}</button>` : `<div class="${cls}">${inner}</div>`; };
  return `<div class="menu"><h3 lang="ja">メニュー</h3><div class="cols"><div><span class="grp">のみもの · bebidas</span>${BEBIDAS.map(x => lin(x, toca)).join('')}</div><div><span class="grp">たべもの · comidas</span>${COMIDAS.map(x => lin(x, false)).join('')}</div></div></div>`;
}
function painel() {
  const p = $('painel'), s = S, P = outro(EU), st = passos()[s.p || 0]; let h = '';
  if (s.etapa === 'ficha' && (s.ficha || {})[EU] && s.ficha[EU].ok) h = minhaFicha(true);
  if (s.etapa === 'batalha') {
    const b = s.bat || {}, toca = !b.fim && b.fase === 'perguntar' && b.vez === EU;
    h = `<div class="row" style="justify-content:space-between"><h3>🎯 Tabuleiro de ${esc(nome(P))}</h3><span class="sub">${conta((b.ab || {})[P])} de ${CASAS.length} abertas</span></div>${tabuleiro(P, { toca })}${minhaFicha()}`;
  }
  if (s.etapa === 'convite') {
    const cv = s.cv || {}, sabe = EU === 'a', toca = !sabe && st && st.tipo === 'toque', achou = concluida();
    h = `<div class="row" style="justify-content:space-between"><h3>🗺️ Mapa</h3>${sabe ? '<span class="so-voce">🔒 só você vê onde é o café</span>' : ''}</div><div class="mapa">${LUGARES.map((L, i) => {
      const eCafe = i === cv.alvo, mostra = (sabe || achou) && eCafe;
      const viz = mostra ? `<div class="pred cafe">☕<small lang="ja">カフェ</small></div>` : (sabe || achou) ? `<div class="pred">🏠</div>` : `<button type="button" class="pred${cv.ult === i && !achou ? ' no' : ''}" data-pred="${i}"${toca ? '' : ' disabled'} aria-label="Prédio ao lado de ${L.pt}">❓</button>`;
      return `<div class="quadra"><div class="pred">${L.ic}<small lang="ja">${L.n}</small></div>${viz}</div>`; }).join('')}</div>${toca && cv.erro ? '<p class="fb">ちがいます！ Não é esse. Leia de novo a resposta e tente outro.</p>' : ''}`;
  }
  if (s.etapa === 'cafe') {
    const bB = item(((s.cafe || {}).beb || {}).b), errado = bB && bB.id === 'ocha' ? item('kohi') : item('ocha');
    h = ((s.p || 0) === 8 && EU === 'b' && bB ? `<div class="errado">Você pediu <b lang="ja">${bB.ic} ${bB.n}</b>, mas chegou <b lang="ja">${errado.ic} ${errado.n}</b>.</div>` : '') + cardapio(st && st.tipo === 'bebida' && !((s.cafe || {}).beb || {})[EU]);
  }
  if (s.etapa === 'papo') h = `<h3>🔥 Peças para usar no passado</h3><div class="pecas">${[['〜と', 'com (alguém)'], ['〜じかん', 'por … horas'], ['たくさん', 'muito'], ['〜ました', 'fiz'], ['〜でした', 'foi'], ['〜じゃなかったです', 'não foi']].map(x => `<span><b lang="ja">${x[0]}</b> ${x[1]}</span>`).join('')}</div>`;
  if (s.etapa === 'conta' && concluida()) { const c = s.cafe || {}, its = [(c.beb || {}).a, (c.beb || {}).b, c.com2].map(item).filter(Boolean);
    h = `<div class="menu"><h3 lang="ja">レシート</h3>${its.map(x => `<div class="it"><span class="nm">${x.ic} ${ja(x.n)}</span><span class="pr">${x.p}えん</span></div>`).join('')}<div class="it"><span class="nm"><b lang="ja">ぜんぶで</b></span><span class="pr">${totalDe(s)}えん</span></div></div>`; }
  if (s.etapa === 'lembranca' && !((s.lemb || {}).a && s.lemb.b)) h = `<h3>📒 O que você descobriu sobre ${esc(nome(P))}</h3>${tabuleiro(P, { tudo: true })}`;
  p.innerHTML = h; p.hidden = !h;
}
$('painel').addEventListener('click', e => {
  const c = e.target.closest('[data-casa]'); if (c && !c.disabled) { ui.casa = c.dataset.casa; ui.nivel = 0; ui.tent = 0; painel(); acao(); const i = $('inp'); if (i) i.focus(); return; }
  const b = e.target.closest('[data-beb]'); if (b) { sync.update({ ['cafe/beb/' + EU]: b.dataset.beb }); return; }
  const pr = e.target.closest('[data-pred]'); if (pr && !pr.disabled) { const i = +pr.dataset.pred, cv = S.cv || {};
    if (i === cv.alvo) sync.tx(root => { if (!root || root.etapa !== 'convite' || (root.p || 0) !== 3) return; root.p = 4; poeLog(root, 's', '🚶 Vocês chegaram ao カフェ！'); return root; });
    else sync.update({ 'cv/erro': (cv.erro || 0) + 1, 'cv/ult': i }); }
});

/* ---------- ação: o que fazer agora ---------- */
const espera = t => `<div class="espera"><i></i><span>${t}</span></div>`;
function uiFala(cfg) {
  const a = $('acao');
  a.innerHTML = `<div class="vez"><b>✍️ Sua vez</b><p>${cfg.instr}</p></div><p class="sub">Escreva e diga em voz alta para a sua dupla.</p><div id="dicas"></div>
    <div class="escrever"><input id="inp" type="text" lang="ja" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Escreva em japonês (kana ou romaji)" aria-label="Sua frase"><button class="btn pri" type="button" id="envia">Enviar</button></div>
    <div class="row"><button class="btn peq" type="button" id="btDica">💡 Dica</button><button class="btn peq" type="button" id="forca" hidden>Enviar assim mesmo</button></div><p class="fb" id="fb" aria-live="polite"></p>`;
  const inp = $('inp'), fb = $('fb');
  const dicas = () => { const n = ui.nivel, d = $('dicas');
    d.innerHTML = n === 1 ? `<div class="dica"><small>COMEÇO DA FRASE</small>${ja(cfg.d1)}</div>` : n === 2 ? `<div class="dica"><small>COMPLETE AS LACUNAS</small>${ja(cfg.d2)}</div>`
      : n >= 3 ? `<div class="dica"><small>FRASE INTEIRA</small>${ja(cfg.m)}${cfg.pt ? `<span class="pt">${esc(cfg.pt)}</span>` : ''}<button class="btn peq" type="button" data-fala="${esc(cfg.m)}" style="justify-self:start">🔊 Ouvir</button></div>` : '';
    $('btDica').textContent = n === 0 ? '💡 Dica' : n < 3 ? '💡 Mais dica' : '💡 Dica completa'; $('btDica').disabled = n >= 3; $('forca').hidden = ui.tent < 2; };
  dicas();
  $('btDica').onclick = () => { ui.nivel = Math.min(3, ui.nivel + 1); dicas(); inp.focus(); };
  const manda = forcado => { const txt = inp.value.trim(); if (!txt) { inp.focus(); return; }
    const av = !forcado && cfg.aviso ? cfg.aviso(txt) : null;
    if (av) { ui.tent++; dicas(); fb.textContent = av; inp.focus(); return; }
    if (!forcado && falta(txt, cfg.k).length) { ui.tent++; ui.nivel = Math.min(3, Math.max(ui.nivel + 1, 1)); dicas(); fb.textContent = 'Quase! Olhe a dica e tente de novo.'; inp.focus(); return; }
    $('envia').disabled = true;
    Promise.resolve(cfg.envia(txt, forcado)).then(err => { if (err) { fb.textContent = err; $('envia').disabled = false; ui.tent++; dicas(); } }).catch(() => { fb.textContent = 'Não consegui enviar. Tente de novo.'; $('envia').disabled = false; }); };
  $('envia').onclick = () => manda(false); $('forca').onclick = () => manda(true);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); manda(false); } });
}
/* grava uma fala no roteiro: a fala, o que o robô responde e o passo seguinte, tudo de uma vez */
function gravaPasso(st, txt, forcado) {
  let erro = null; const de = S.etapa, p = S.p || 0;
  return sync.tx(root => { if (!root || root.etapa !== de || (root.p || 0) !== p) return;
    poeLog(root, EU, txt); if (st.depois) { erro = st.depois(txt, root, forcado) || null; if (erro) return; } root.p = p + 1; return root; }).then(() => erro);
}
function acao() {
  const a = $('acao'), s = S, P = outro(EU), Pn = esc(nome(P)), vz = vezDe();
  a.classList.toggle('minha-vez', vz === EU || vz === 'ambas');
  /* fim de etapa: um único botão para as duas */
  if (concluida()) {
    const prox = ETAPAS[iEtapa() + 1], eu = (s.pronto || {})[EU] === s.etapa;
    a.innerHTML = `<div class="vez"><b>✓ Etapa concluída!</b><p>Próxima etapa: <b>${esc(prox.nome)}</b>.</p></div>` + (eu ? espera(`Esperando ${Pn} tocar no botão…`) : `<div class="row"><button class="btn pri" type="button" id="proxima" style="flex:1">Vamos para a próxima ➡️</button></div>`);
    if (!eu) $('proxima').onclick = () => { $('proxima').disabled = true; sync.update({ ['pronto/' + EU]: s.etapa }); };
    return;
  }
  if (s.etapa === 'ficha') return acaoFicha();
  if (s.etapa === 'batalha') return acaoBatalha();
  if (s.etapa === 'lembranca') return acaoLembranca();
  const st = passos()[s.p || 0];
  if (st.tipo === 'bebida') {
    const meu = item(((s.cafe || {}).beb || {})[EU]);
    a.innerHTML = meu ? `<div class="vez"><b>Você escolheu ${meu.ic} <span lang="ja">${meu.n}</span></b><p>Guarde segredo: ${Pn} vai ter que perguntar.</p></div>${espera(`Esperando ${Pn} escolher…`)}`
      : `<div class="vez"><b>👆 Escolha a sua bebida</b><p>Toque no cardápio, em segredo. Depois vocês perguntam uma à outra.</p></div>`;
    return;
  }
  if (st.quem !== EU) { a.innerHTML = `<div class="vez"><b>Vez de ${Pn}</b><p>${st.tipo === 'toque' ? 'Ela está procurando o café no mapa.' : st.tipo === 'preco' ? 'Ela está ouvindo o preço. Ouça você também!' : 'Ouça o que ela diz e leia aqui na conversa.'}</p></div>${espera(`${Pn} está respondendo…`)}`; return; }
  if (st.tipo === 'toque') { a.innerHTML = `<div class="vez"><b>👆 Sua vez</b><p>${st.instr}</p></div><div class="pilulas"><button type="button" class="ar" id="arMapa"><span lang="ja">すみません、もういちど おねがいします。</span><small>🌬️ Não entendi: pedir para repetir</small></button></div>`;
    $('arMapa').onclick = () => sync.tx(root => { if (!root || root.etapa !== 'convite' || (root.p || 0) !== 3) return; poeLog(root, EU, 'すみません、もういちど おねがいします。'); root.p = 2; return root; });
    return; }
  if (st.tipo === 'preco') {
    const linha = Object.values(s.log || {}).filter(m => m.oc).pop();
    a.innerHTML = `<div class="vez"><b>👂 Sua vez de ouvir</b><p>O robô disse o preço. Ouça e escreva o valor em números.</p></div>
      <div class="row"><button class="btn" type="button" data-fala="${esc(linha ? linha.t : '')}">🔊 Ouvir o preço</button><button class="btn peq" type="button" id="verPreco" hidden>Ver o texto</button></div>
      <div class="escrever"><input id="inp" type="text" inputmode="numeric" autocomplete="off" placeholder="Ex.: 980" aria-label="Preço em números"><button class="btn pri" type="button" id="envia">Enviar</button></div><p class="fb" id="fb" aria-live="polite"></p>`;
    const manda = () => { const v = soNum($('inp').value); if (!v) return;
      if (+v !== totalDe(s)) { ui.tent++; $('fb').textContent = 'Ainda não. Ouça de novo com calma.'; $('verPreco').hidden = ui.tent < 2; return; }
      sync.tx(root => { if (!root || root.etapa !== 'conta' || (root.p || 0) !== 1) return; poeLog(root, EU, `${totalDe(root)}えんですね。`); poeLog(root, 'r', 'ありがとうございました。', { pt: 'Muito obrigado!' }); root.p = 2; return root; }); };
    $('envia').onclick = manda; $('inp').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); manda(); } });
    $('verPreco').onclick = () => { ui.verPreco = true; conversa(); };
    return;
  }
  uiFala(Object.assign({}, st, { envia: (txt, forcado) => gravaPasso(st, txt, forcado) }));
}

/* ---------- etapa 2: ficha ---------- */
let rasc = {};
function acaoFicha() {
  const a = $('acao'), P = esc(nome(outro(EU))), f = (S.ficha || {})[EU];
  if (f && f.ok) { a.innerHTML = `<div class="vez"><b>✓ Ficha pronta!</b><p>Ela é o seu tabuleiro secreto na batalha naval.</p></div>${espera(`Esperando ${P} terminar a ficha dela…`)}`; return; }
  a.innerHTML = `<div class="vez"><b>✍️ Preencha a sua ficha</b><p>Escreva sobre você, em japonês. ${P} não vê: ela vai ter que descobrir perguntando.</p></div><span class="so-voce" style="justify-self:start">🔒 só você vê</span>
    <div class="campos">${CASAS.map(c => { const k = c.campo; return `<div class="campo" data-c="${c.id}"><label for="f-${c.id}">${c.ic} ${esc(k.perg)}</label>
      <div class="frase" lang="ja">${k.antes ? `<span>${k.antes}</span>` : ''}<input id="f-${c.id}" type="text" class="${k.curto ? 'curto' : ''}"${k.modo ? ` inputmode="${k.modo}"` : ''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(k.ph)}" value="${esc(rasc[c.id] || '')}">${k.depois ? `<span>${k.depois}</span>` : ''}</div>
      <div class="ideias"><small>Ideias (toque para usar) ou escreva a sua:</small>${k.ideias.map(([j, pt]) => `<button type="button" data-id="${esc(j)}" title="${esc(pt)}"><span lang="ja">${esc(j)}</span> · ${esc(pt)}</button>`).join('')}</div></div>`; }).join('')}</div>
    <p class="fb" id="fb" aria-live="polite"></p><div class="row"><button class="btn pri" type="button" id="salvaFicha" style="flex:1">Minha ficha está pronta ✓</button></div>`;
  const marca = () => CASAS.forEach(c => { const v = c.campo.valor($('f-' + c.id).value); a.querySelector(`[data-c="${c.id}"]`).classList.toggle('ok', !!v); });
  marca();
  a.querySelector('.campos').addEventListener('input', e => { const d = e.target.closest('[data-c]'); if (d) { rasc[d.dataset.c] = e.target.value; marca(); } });
  a.querySelector('.campos').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (!b) return; const d = b.closest('[data-c]'), i = d.querySelector('input'); i.value = b.dataset.id; rasc[d.dataset.c] = i.value; marca(); });
  $('salvaFicha').onclick = () => { const out = { ok: true }; let vazio = null;
    CASAS.forEach(c => { const v = c.campo.valor($('f-' + c.id).value); if (!v && !vazio) vazio = c; out[c.id] = v.slice(0, 60); });
    if (vazio) { $('fb').textContent = `Falta responder: ${vazio.campo.perg}`; $('f-' + vazio.id).focus(); return; }
    sync.update({ ['ficha/' + EU]: out }); };
}

/* ---------- etapa 3: batalha naval ---------- */
function acaoBatalha() {
  const a = $('acao'), b = S.bat || {}, P = outro(EU), Pn = nome(P), vez = b.vez || 'b', f = (S.ficha || {})[EU] || {};
  const escreve = (txt, muda) => sync.tx(root => { if (!root || root.etapa !== 'batalha' || !root.bat || root.bat.fase !== b.fase || (root.bat.vez || 'b') !== vez) return; poeLog(root, EU, txt); muda(root.bat); return root; }).then(() => null);
  if (b.fase === 'perguntar') {
    if (vez !== EU) { a.innerHTML = `<div class="vez"><b>Vez de ${esc(Pn)}</b><p>Ela vai fazer uma pergunta sobre você. A resposta está na sua ficha.</p></div>${espera(`${esc(Pn)} está escolhendo a pergunta…`)}`; return; }
    const c = casaDe(ui.casa);
    if (!c) { a.innerHTML = `<div class="vez"><b>🎯 Sua vez de perguntar</b><p>Toque numa casa fechada (？) do tabuleiro de ${esc(Pn)}.</p></div>`; return; }
    uiFala({ instr: `Pergunte a ${esc(Pn)}: <b>${esc(c.pt)}</b> ${c.ic}`, m: c.perg.m(Pn), d1: c.perg.d1(Pn), d2: c.perg.d2(Pn), pt: c.perg.pt, k: c.perg.k,
      envia: txt => escreve(txt, bt => { bt.casa = c.id; bt.fase = 'responder'; }) });
    return;
  }
  const c = casaDe(b.casa) || CASAS[0];
  if (b.fase === 'responder') {
    if (vez === EU) { a.innerHTML = `<div class="vez"><b>Vez de ${esc(Pn)}</b><p>Ouça a resposta dela. A casa ${c.ic} abre quando ela responder.</p></div>${espera(`${esc(Pn)} está respondendo…`)}`; return; }
    const val = (f[c.id] || '') + '。';
    uiFala({ instr: `Responda a pergunta de ${esc(Pn)} ${c.ic}. A resposta está na sua ficha.`, m: val, d1: val.slice(0, 2) + '…', d2: c.resp.d2, pt: '', k: c.resp.k,
      envia: txt => escreve(txt, bt => { bt.ab = bt.ab || {}; bt.ab[EU] = bt.ab[EU] || {}; bt.ab[EU][c.id] = true; bt.fase = 'reagir'; }) });
    return;
  }
  /* reagir */
  if (vez !== EU) { a.innerHTML = `<div class="vez"><b>Vez de ${esc(Pn)}</b><p>Ela descobriu uma casa da sua ficha ${c.ic} e vai reagir.</p></div>${espera(`Esperando a reação de ${esc(Pn)}…`)}`; return; }
  a.innerHTML = `<div class="vez"><b>💬 Casa aberta! Reaja à resposta</b><p>Toque numa reação e diga em voz alta.</p></div><div class="pilulas">${REACOES.map((r, i) => `<button type="button" data-re="${i}" class="${r.ar ? 'ar' : ''}">${ja(r.t)}<small>${r.ar ? '🌬️ ' : ''}${esc(r.pt)}</small></button>`).join('')}</div>`;
  a.querySelector('.pilulas').onclick = e => { const bt = e.target.closest('[data-re]'); if (!bt) return; const r = REACOES[+bt.dataset.re];
    escreve(r.t, x => { if (r.ar) { x.fase = 'responder'; return; }
      const ab = x.ab || {}, falta_ = q => conta(ab[q]) < CASAS.length;      /* falta_(q): a ficha de q ainda tem casa fechada */
      x.casa = null; x.fase = 'perguntar';
      if (falta_(vez)) x.vez = outro(vez); else if (falta_(outro(vez))) x.vez = vez; else x.fim = true; }); };
}

/* ---------- etapa 8: lembrança ---------- */
let rascL = ['', ''];
function acaoLembranca() {
  const a = $('acao'), P = outro(EU), Pn = nome(P), l = S.lemb || {}, fP = (S.ficha || {})[P] || {};
  if (l.a && l.b) {
    const hoje = new Date(), data = `${hoje.getFullYear()}ねん ${hoje.getMonth() + 1}がつ ${hoje.getDate()}にち`, c = S.cafe || {}, ok = l.ok || {};
    const bloco = (autor, alvo) => `<h3>${esc(nome(autor))} escreveu sobre ${esc(nome(alvo))}</h3><div class="sobre">${[0, 1].map(i => { const k = autor + i, marcado = ok[k];
      return `<div class="fr${marcado ? ' ok' : ''}"><span>${ja(l[autor]['f' + i] || '')}</span>${marcado ? '<b>✓</b>' : alvo === EU ? `<button class="btn peq" type="button" data-ok="${k}" lang="ja">はい、そうです！</button>` : ''}</div>`; }).join('')}</div>`;
    a.classList.remove('minha-vez');
    a.innerHTML = `<div class="foto"><div class="duo"><div class="face">${avatarHTML(S.jog[EU].sel)}</div><span>${(item((c.beb || {}).a) || {}).ic || '☕'}${(item(c.com2) || {}).ic || '🍰'}${(item((c.beb || {}).b) || {}).ic || '☕'}</span><div class="face">${avatarHTML(S.jog[P].sel)}</div></div>
      <div class="leg" lang="ja">${esc(nome(EU))} と ${esc(nome(P))} · カフェで<br>${data}</div></div>
      ${bloco(P, EU)}<p class="sub">Está certo o que ${esc(Pn)} escreveu sobre você? Confirme com はい、そうです！</p>${bloco(EU, P)}
      <div class="vez" style="text-align:center"><b lang="ja">おつかれさまでした！</b><p>Aula concluída. Tire um print para guardar a lembrança. 📸</p></div>`;
    a.onclick = e => { const b = e.target.closest('[data-ok]'); if (b) sync.update({ ['lemb/ok/' + b.dataset.ok]: true }); };
    return;
  }
  a.onclick = null;
  if (l[EU]) { a.innerHTML = `<div class="vez"><b>✓ Frases enviadas!</b></div>${espera(`Esperando ${esc(Pn)} escrever sobre você…`)}`; return; }
  const sug = [`${Pn}さんは ${fP.trab || 'かいしゃいんです'}。`, `${Pn}さんは コーヒーを ${fP.cafe || 'よく のみます'}。`];
  a.innerHTML = `<div class="vez"><b>✍️ Escreva 2 frases sobre ${esc(Pn)}</b><p>Use o que você descobriu hoje. Comece com <b lang="ja">${esc(Pn)}さんは…</b></p></div>
    <div class="campos">${[0, 1].map(i => `<div class="campo"><label for="l-${i}">Frase ${i + 1}</label><div class="frase"><input id="l-${i}" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(Pn)}さんは…" value="${esc(rascL[i])}"></div></div>`).join('')}</div>
    <div id="dicas"></div><p class="fb" id="fb" aria-live="polite"></p><div class="row"><button class="btn peq" type="button" id="btDica">💡 Dica</button><button class="btn pri" type="button" id="salvaL" style="flex:1">Enviar as frases</button></div>`;
  [0, 1].forEach(i => $('l-' + i).addEventListener('input', e => { rascL[i] = e.target.value; }));
  $('btDica').onclick = () => { $('dicas').innerHTML = `<div class="dica"><small>EXEMPLOS</small>${sug.map(ja).join('')}</div>`; };
  $('salvaL').onclick = () => { const v = [0, 1].map(i => $('l-' + i).value.trim());
    if (!v[0] || !v[1]) { $('fb').textContent = 'Escreva as duas frases.'; $('l-' + (v[0] ? 1 : 0)).focus(); return; }
    sync.update({ ['lemb/' + EU]: { f0: v[0].slice(0, 80), f1: v[1].slice(0, 80) } }); };
}

/* ---------- rodapé: romaji, pular etapa, recomeçar ---------- */
$('btnRo').onclick = () => { ROM = !ROM; try { localStorage.setItem('utopiaRomaji', ROM ? '1' : '0'); } catch (e) {} if (S && EU && S.jog && S.jog.a && S.jog.b) desenha(true); else { $('btnRo').textContent = 'Romaji: ' + (ROM ? 'sim' : 'não'); } };
function doisToques(btn, rotulo, faz) { let armado = false, t = null;
  btn.onclick = () => { if (!armado) { armado = true; btn.textContent = 'toque de novo para confirmar'; t = setTimeout(() => { armado = false; btn.textContent = rotulo; }, 4000); return; }
    clearTimeout(t); armado = false; btn.textContent = rotulo; faz(); }; }
doisToques($('pular'), 'pular esta etapa', () => { if (!S || !EU) return;
  if (S.etapa === 'ficha' || S.etapa === 'batalha') { /* sem ficha não há tabuleiro: completa o que faltar com um exemplo */
    sync.tx(root => { if (!root) return; root.ficha = root.ficha || {}; ['a', 'b'].forEach(r => { const f = root.ficha[r] = root.ficha[r] || {}; CASAS.forEach(c => { if (!f[c.id]) f[c.id] = c.campo.valor(c.campo.ideias[0][0]); }); f.ok = true; }); return root; }).then(() => avanca(S.etapa));
  } else avanca(S.etapa); });
doisToques($('reiniciar'), 'recomeçar a aula', () => { if (!S || !EU) return; rasc = {}; rascL = ['', '']; falados = null; logChave = '';
  sync.tx(root => { const n = novo(); n.jog = (root && root.jog) || {}; return n; }); });

/* ================= começa ================= */
(async function () {
  try { sync = LOCAL ? ligaLocal() : await ligaFirebase(); } catch (e) { semLigacao(); return; }
  sync.on(recebe, semLigacao);
})();
