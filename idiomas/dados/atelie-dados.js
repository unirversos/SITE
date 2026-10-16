/* Unirversos · Planeta Utopia — vocabulário do Ateliê de Avatar (japonês).
   Fonte de revisão: planilha atelie-avatar-termos.xlsx. Usado pelo Ateliê e pelo Caderno. */

const find=(arr,id)=>arr.find(o=>o.id===id)||arr[0];
const furi=t=>t?t.replace(/([一-龯々]+)([぀-ゟ]*)\s*\(([぀-ゟ]+)\)/g,(m,k,oku,r)=>{
  const read=oku&&r.endsWith(oku)?r.slice(0,-oku.length):r; return `<ruby>${k}<rt>${read}</rt></ruby>${oku}`; }):t;
const hasKanji=s=>/[一-龯々]/.test(s);
const ruby=o=>hasKanji(o.jp)?`<ruby>${o.jp}<rt>${o.kana}</rt></ruby>`:o.jp;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ---------- vocabulário ---------- */
const COLORS=[
 {id:'kuro',en:'black',jp:'黒',kana:'くろ',ro:'kuro',pt:'preto',hex:'#2b2730',mod:'くろい'},
 {id:'chairo',en:'brown',jp:'茶色',kana:'ちゃいろ',ro:'chairo',pt:'marrom',hex:'#7a4b2a',mod:'ちゃいろい'},
 {id:'kiniro',en:'gold',jp:'金色',kana:'きんいろ',ro:"kin'iro",pt:'dourado',hex:'#d9a93c',mod:'きんいろの'},
 {id:'aka',en:'red',jp:'赤',kana:'あか',ro:'aka',pt:'vermelho',hex:'#d2463f',mod:'あかい'},
 {id:'ao',en:'blue',jp:'青',kana:'あお',ro:'ao',pt:'azul',hex:'#3e6fc4',mod:'あおい'},
 {id:'shiro',en:'white',jp:'白',kana:'しろ',ro:'shiro',pt:'branco',hex:'#f2efe9',mod:'しろい'},
 {id:'pinku',en:'pink',jp:'ピンク',kana:'ピンク',ro:'pinku',pt:'rosa',hex:'#f19bb5',mod:'ピンクの'},
 {id:'murasaki',en:'purple',jp:'紫',kana:'むらさき',ro:'murasaki',pt:'roxo',hex:'#8a62b8',mod:'むらさきの'},
 {id:'midori',en:'green',jp:'緑',kana:'みどり',ro:'midori',pt:'verde',hex:'#4f9a6a',mod:'みどりの'}
].map(c=>({...c,tip: c.mod.endsWith('い')
  ? `Antes de um substantivo vira adjetivo com い: <b>${c.mod}</b> ふく (roupa ${c.pt}).`
  : `Esta cor não ganha い — liga-se com の: <b>${c.mod}</b> ふく (roupa ${c.pt}).`}));

const HAIR=[
 {id:'nagai',en:'long',enSay:'My hair is long.',jp:'長い',kana:'ながい',ro:'nagai',pt:'longo',ptSay:'Meu cabelo é longo.',tip:'Adjetivo com い. O oposto é 短い (みじかい).'},
 {id:'mijikai',en:'short',enSay:'My hair is short.',jp:'短い',kana:'みじかい',ro:'mijikai',pt:'curto',ptSay:'Meu cabelo é curto.',tip:'Adjetivo com い. O oposto é 長い (ながい).'},
 {id:'pony',en:'ponytail',enSay:'My hair is in a ponytail.',jp:'ポニーテール',kana:'ポニーテール',ro:'ponīteeru',pt:'rabo de cavalo',ptSay:'Meu cabelo é rabo de cavalo.',tip:'Palavra emprestada do inglês, escrita em katakana. A barra ー alonga a vogal.'},
 {id:'odango',en:'bun',enSay:'My hair is in a bun.',jp:'お団子',kana:'おだんご',ro:'odango',pt:'coque',ptSay:'Meu cabelo é um coque.',tip:'Dango é o doce de bolinhas no palito. O coque ganhou o nome pelo formato redondo.'},
 {id:'kurukuru',en:'curly',enSay:'My hair is curly.',jp:'くるくる',kana:'くるくる',ro:'kurukuru',pt:'cacheado',ptSay:'Meu cabelo é cacheado.',tip:'Onomatopeia (gitaigo) de coisas que giram ou enrolam.'},
 {id:'afuro',en:'afro',enSay:'My hair is an afro.',jp:'アフロ',kana:'アフロ',ro:'afuro',pt:'black power',ptSay:'Meu cabelo é black power.',tip:'Em japonês o cabelo crespo volumoso é アフロ. Crespo, em geral: ちぢれげ.'},
 {id:'mitsuami',en:'braids',enSay:'My hair is in braids.',jp:'三つ編み',kana:'みつあみ',ro:'mitsuami',pt:'tranças',ptSay:'Meu cabelo é trançado.',tip:'<ruby>三<rt>みっ</rt></ruby> (três) + <ruby>編<rt>あ</rt></ruby>む (trançar): a trança de três mechas.'},
 {id:'bouzu',en:'buzz cut',enSay:'My hair is a buzz cut.',jp:'坊主',kana:'ぼうず',ro:'bōzu',pt:'raspado',ptSay:'Meu cabelo é raspado.',tip:'<ruby>坊主<rt>ぼうず</rt></ruby> era o monge budista, de cabeça raspada. O corte ficou com o nome.'}
];
const FACE=[
 {id:'egao',en:'smile',enSay:"I'm smiling.",jp:'笑顔',kana:'えがお',ro:'egao',pt:'sorriso',say:'にこにこ しています。',ptSay:'Estou sorrindo.',tip:'<ruby>笑<rt>え</rt></ruby> (rir) + <ruby>顔<rt>がお</rt></ruby> (rosto). にこにこ é a onomatopeia de sorriso.'},
 {id:'bikkuri',en:'surprise',enSay:'What a surprise!',jp:'びっくり',kana:'びっくり',ro:'bikkuri',pt:'surpresa',say:'びっくり しています。',ptSay:'Que surpresa!',tip:'Muito usado na fala: びっくりした！ = "Que susto!"'},
 {id:'nemui',en:'sleepy',enSay:"I'm sleepy.",jp:'眠い',kana:'ねむい',ro:'nemui',pt:'com sono',say:'ねむいです。',ptSay:'Estou com sono.',tip:'Adjetivo com い. O "Z" do mangá se lê ぐうぐう ou すやすや.'},
 {id:'uinku',en:'wink',enSay:"I'm winking.",jp:'ウインク',kana:'ウインク',ro:'uinku',pt:'piscadinha',say:'ウインク しています。',ptSay:'Estou piscando.',tip:'Do inglês "wink". Muitos substantivos viram verbo com する.'},
 {id:'okoru',en:'to get angry',enSay:"I'm angry.",jp:'怒る',kana:'おこる',ro:'okoru',pt:'ficar bravo',say:'おこって います。',ptSay:'Estou com raiva.',tip:'Verbo. Na forma ています descreve o estado agora: おこって います.'}
];
const CLOTHES=[
 {id:'tshirt',en:'T-shirt',jp:'Tシャツ',kana:'ティーシャツ',ro:'tii-shatsu',pt:'camiseta',tip:'Roupa do tronco usa o verbo <b>着る (きる)</b>: Tシャツを きています.'},
 {id:'parka',en:'hoodie',jp:'パーカー',kana:'パーカー',ro:'paakaa',pt:'moletom com capuz',tip:'Falso amigo: no Japão パーカー é o moletom com capuz, não o casaco "parka".'},
 {id:'seetaa',en:'sweater',jp:'セーター',kana:'セーター',ro:'seetaa',pt:'suéter',tip:'Do inglês "sweater". Também usa <b>着る (きる)</b>.'},
 {id:'suutsu',en:'suit',jp:'スーツ',kana:'スーツ',ro:'sūtsu',pt:'terno',tip:'Do inglês "suit". Também usa <b>着る (きる)</b>.'},
 {id:'kimono',en:'kimono',jp:'着物',kana:'きもの',ro:'kimono',pt:'quimono',tip:'Ao pé da letra, "coisa de vestir": <ruby>着<rt>き</rt></ruby> (vestir) + <ruby>物<rt>もの</rt></ruby> (coisa).'},
 {id:'wanpiisu',en:'dress',jp:'ワンピース',kana:'ワンピース',ro:'wanpiisu',pt:'vestido',tip:'Vem de "one piece", peça única. Não tem nada a ver com o mangá.'}
];
const ACC=[
 {id:'nashi',en:'none',jp:'なし',kana:'なし',ro:'nashi',pt:'nada',tip:'なし = "sem". Aparece em placas e cardápios: わさびなし (sem wasabi).'},
 {id:'megane',en:'glasses',enSay:"I'm wearing glasses.",jp:'眼鏡',kana:'めがね',ro:'megane',pt:'óculos',say:'めがねを かけています。',ptSay:'Estou de óculos.',tip:'Óculos "se penduram" no rosto: verbo <b>かける</b>.'},
 {id:'boushi',en:'hat',enSay:"I'm wearing a hat.",jp:'帽子',kana:'ぼうし',ro:'bōshi',pt:'chapéu',say:'ぼうしを かぶっています。',ptSay:'Estou de chapéu.',tip:'O que cobre a cabeça usa <b>かぶる</b>.'},
 {id:'ribon',en:'bow',enSay:"I'm wearing a bow.",jp:'リボン',kana:'リボン',ro:'ribon',pt:'laço',say:'リボンを つけています。',ptSay:'Estou de laço.',tip:'Acessório preso ao corpo usa <b>つける</b>.'},
 {id:'hijabu',en:'hijab',enSay:"I'm wearing a hijab.",jp:'ヒジャブ',kana:'ヒジャブ',ro:'hijabu',pt:'hijab',say:'ヒジャブを かぶっています。',ptSay:'Estou de hijab.',tip:'Cobre a cabeça, então o verbo é <b>かぶる</b>, o mesmo do chapéu.'},
 {id:'nekutai',en:'necktie',enSay:"I'm wearing a tie.",jp:'ネクタイ',kana:'ネクタイ',ro:'nekutai',pt:'gravata',say:'ネクタイを しめています。',ptSay:'Estou de gravata.',tip:'Gravata e cinto se "apertam": verbo <b>しめる</b>.'},
 {id:'heddohon',en:'headphones',enSay:"I'm wearing headphones.",jp:'ヘッドホン',kana:'ヘッドホン',ro:'heddohon',pt:'fones de ouvido',say:'ヘッドホンを つけています。',ptSay:'Estou de fones.',tip:'Também <b>つける</b>. Em português é um verbo só, "usar"; em japonês muda conforme a parte do corpo.'}
];
const TRAITS=[
 {id:'sobakasu',en:'freckles',enSay:'I have freckles.',jp:'そばかす',kana:'そばかす',ro:'sobakasu',pt:'sardas',say:'そばかすが あります。',ptSay:'Tenho sardas.',tip:'Para traços do corpo, usa-se <b>〜が あります</b> (tenho).'},
 {id:'hige',en:'beard',enSay:'I have a beard.',jp:'髭',kana:'ひげ',ro:'hige',pt:'barba',say:'ひげが あります。',ptSay:'Tenho barba.',tip:'Também <b>〜が あります</b>. Bigode é くちひげ (barba da boca).'},
 {id:'hoppe',en:'rosy cheeks',enSay:'My cheeks are rosy.',jp:'ほっぺ',kana:'ほっぺ',ro:'hoppe',pt:'bochechas coradas',say:'ほっぺが あかいです。',ptSay:'Minhas bochechas estão coradas.',tip:'ほっぺ é o jeito carinhoso de dizer ほお (bochecha).'},
 {id:'hokuro',en:'beauty mark',enSay:'I have a beauty mark.',jp:'ほくろ',kana:'ほくろ',ro:'hokuro',pt:'pinta',say:'ほくろが あります。',ptSay:'Tenho uma pinta.',tip:'Pinta perto da boca tem nome próprio: <ruby>口元<rt>くちもと</rt></ruby>ほくろ.'},
 {id:'hochouki',en:'hearing aid',enSay:'I wear a hearing aid.',jp:'補聴器',kana:'ほちょうき',ro:'hochōki',pt:'aparelho auditivo',say:'ほちょうきを つけています。',ptSay:'Uso aparelho auditivo.',tip:'<ruby>補<rt>ほ</rt></ruby> (ajudar) + <ruby>聴<rt>ちょう</rt></ruby> (ouvir) + <ruby>器<rt>き</rt></ruby> (aparelho). Usa <b>つける</b>, como os fones.'},
 {id:'kurumaisu',en:'wheelchair',enSay:'I use a wheelchair.',jp:'車いす',kana:'くるまいす',ro:'kurumaisu',pt:'cadeira de rodas',say:'くるまいすに のっています。',ptSay:'Ando de cadeira de rodas.',tip:'<ruby>車<rt>くるま</rt></ruby> (roda) + いす (cadeira). <b>のる</b> é o mesmo verbo de andar de trem: でんしゃに のる.'}
];
const BG=[
 {id:'sora',en:'sky',enSay:"I'm under the sky.",jp:'空',kana:'そら',ro:'sora',pt:'céu',say:'そらの したに います。',ptSay:'Estou debaixo do céu.',tip:'Um kanji só, simples e muito comum em nomes próprios.'},
 {id:'umi',en:'sea',enSay:"I'm at the sea.",jp:'海',kana:'うみ',ro:'umi',pt:'mar',say:'うみに います。',ptSay:'Estou no mar.',tip:'に います = "estou em" (para pessoas e animais).'},
 {id:'sakura',en:'cherry blossom',enSay:"I'm under the cherry blossoms.",jp:'桜',kana:'さくら',ro:'sakura',pt:'cerejeira',say:'さくらの したに います。',ptSay:'Estou debaixo da cerejeira.',tip:'の した に = "embaixo de".'},
 {id:'yoru',en:'night',enSay:"It's night. The stars are beautiful!",jp:'夜',kana:'よる',ro:'yoru',pt:'noite',say:'よるです。ほしが きれい！',ptSay:'É noite. As estrelas estão lindas!',tip:'ほし = estrela. きれい = bonito, limpo.'},
 {id:'yama',en:'mountain',enSay:"I'm in the mountains.",jp:'山',kana:'やま',ro:'yama',pt:'montanha',say:'やまに います。',ptSay:'Estou na montanha.',tip:'O kanji desenha três picos. <ruby>富士山<rt>ふじさん</rt></ruby> = monte Fuji.'}
];
const CATS=[
 {key:'hair',jp:'髪型',kana:'かみがた',pt:'Cabelo',en:'Hair',opts:HAIR,layer:'hair'},
 {key:'hairColor',jp:'髪の色',kana:'かみのいろ',pt:'Cor do cabelo',en:'Hair color',opts:COLORS,color:true,layer:'hair'},
 {key:'face',jp:'表情',kana:'ひょうじょう',pt:'Expressão',en:'Expression',opts:FACE,layer:'face'},
 {key:'clothes',jp:'服',kana:'ふく',pt:'Roupa',en:'Clothes',opts:CLOTHES,layer:'body'},
 {key:'clothColor',jp:'服の色',kana:'ふくのいろ',pt:'Cor da roupa',en:'Clothing color',opts:COLORS,color:true,layer:'body'},
 {key:'acc',jp:'小物',kana:'こもの',pt:'Acessórios',en:'Accessories',opts:ACC,layer:'acc',multi:true},
 {key:'traits',jp:'特徴',kana:'とくちょう',pt:'Do seu jeito',en:'Just you',opts:TRAITS,layer:'trait',multi:true},
 {key:'bg',jp:'背景',kana:'はいけい',pt:'Cenário',en:'Background',opts:BG,layer:'bg'}
];
const SKIN_WORDS=[
 {id:'akarui',ptSay:'Minha pele é clara.',en:'light',jp:'明るい',kana:'あかるい',ro:'akarui',pt:'claro',tip:'A mesma palavra serve para lugar iluminado e para pessoa alegre: あかるい ひと.'},
 {id:'komugiiro',ptSay:'Minha pele é morena.',en:'tan',jp:'小麦色',kana:'こむぎいろ',ro:'komugiiro',pt:'moreno',tip:'<ruby>小麦<rt>こむぎ</rt></ruby> = trigo. "Cor de trigo" é o jeito comum de dizer pele morena ou bronzeada.'},
 {id:'koi',ptSay:'Minha pele é escura.',en:'dark',jp:'濃い',kana:'こい',ro:'koi',pt:'escuro',tip:'Para pele não se usa 暗い (くらい), que é o escuro de lugar sem luz. Usa-se <ruby>濃<rt>こ</rt></ruby>い, cor intensa. Cuidado: 恋 (こい) é amor; o kanji desfaz a dúvida.'}
];
const AGE_WORDS=[
 {id:'sai',en:'years old',jp:'歳',kana:'さい',ro:'sai',pt:'anos (de idade)',tip:'Contador de idade: número + さい. わたしは ○さいです = Tenho ○ anos.'},
 {id:'issai',en:'1 year old',jp:'1歳',kana:'いっさい',ro:'issai',pt:'1 ano',tip:'いち + さい vira いっさい.'},
 {id:'hassai',en:'8 years old',jp:'8歳',kana:'はっさい',ro:'hassai',pt:'8 anos',tip:'はち + さい vira はっさい.'},
 {id:'jussai',en:'10 years old',jp:'10歳',kana:'じゅっさい',ro:'jussai',pt:'10 anos',tip:'じゅう + さい vira じゅっさい (também se ouve じっさい).'},
 {id:'hatachi',en:'20 years old',jp:'二十歳',kana:'はたち',ro:'hatachi',pt:'20 anos',tip:'20 anos tem palavra própria: はたち. É a idade da cerimônia 成人式 (せいじんしき).'}
];
const U=['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
function numKana(n){ if(n===100) return 'ひゃく'; const t=Math.floor(n/10),u=n%10; return (t?(t===1?'':U[t])+'じゅう':'')+U[u]; }
function ageInfo(n){
  const t=Math.floor(n/10),u=n%10, ts=t?(t===1?'':U[t])+'じゅう':'';
  if(n===20) return {kana:'はたち',word:'hatachi',why:'Aos 20 anos existe uma palavra própria: <b>はたち</b> (<ruby>二十歳<rt>はたち</rt></ruby>). Também se ouve にじゅっさい.'};
  if(n===100) return {kana:'ひゃくさい'};
  if(u===0) return {kana:(t===1?'':U[t])+'じゅっさい',word:'jussai',why:'<b>じゅう</b> + さい vira <b>じゅっさい</b>: o う some e entra o っ, uma pausa curta.'};
  if(u===1) return {kana:ts+'いっさい',word:'issai',why:'<b>いち</b> + さい vira <b>いっさい</b>: o ち some e entra o っ, uma pausa curta.'};
  if(u===8) return {kana:ts+'はっさい',word:'hassai',why:'<b>はち</b> + さい vira <b>はっさい</b>: o ち some e entra o っ, uma pausa curta.'};
  return {kana:ts+U[u]+'さい'};
}
const PRONS=[
 {id:'watashi',en:'I (neutral)',jp:'私',kana:'わたし',ro:'watashi',pt:'eu (neutro)',tip:'<b>わたし</b>: o "eu" neutro. Serve para qualquer pessoa, em qualquer situação. É o mais seguro.'},
 {id:'boku',en:'I (soft)',jp:'僕',kana:'ぼく',ro:'boku',pt:'eu (suave)',tip:'<b>ぼく</b>: informal e suave. Muito usado por meninos e homens, e também por algumas meninas e pessoas não binárias, e por cantores em letras de música.'},
 {id:'ore',en:'I (bold)',jp:'俺',kana:'おれ',ro:'ore',pt:'eu (descolado)',tip:'<b>おれ</b>: bem informal, soa confiante. Comum entre amigos e em heróis de anime. Evite com professores e em entrevistas.'},
 {id:'uchi',en:'I (Kansai)',jp:'うち',kana:'うち',ro:'uchi',pt:'eu (regional)',tip:'<b>うち</b>: informal e regional, muito comum na região de Kansai (Osaka, Kyoto). Também quer dizer "casa".'},
 {id:'jibun',en:'I (serious)',jp:'自分',kana:'じぶん',ro:'jibun',pt:'eu (sério)',tip:'<b>じぶん</b>: "a própria pessoa". Soa sério e disciplinado, comum em esportes e no exército. Em Kansai pode até significar "você"!'}
];
const skinWord=i=>SKIN_WORDS[i<=2?0:i<=5?1:2];
const WORD_XP=5;

const WORDS={}; CATS.forEach(c=>c.opts.forEach(o=>{ if(!WORDS[o.id]) WORDS[o.id]={...o,catPt:c.color?'Cor':c.pt,catEn:c.color?'Color':c.en}; }));
SKIN_WORDS.forEach(o=>{WORDS[o.id]={...o,catPt:'Tom de pele',catEn:'Skin tone'}});
AGE_WORDS.forEach(o=>{WORDS[o.id]={...o,catPt:'Idade',catEn:'Age'}});
PRONS.forEach(o=>{WORDS[o.id]={...o,catPt:'Como dizer "eu"',catEn:'Saying "I"'}});
Object.values(WORDS).forEach(w=>{w.tip=furi(w.tip)});
const TOTAL=Object.keys(WORDS).length;
/* ---------- áudio ---------- */
let jaVoice=null;
function pickVoice(){ if(!window.speechSynthesis) return; const v=speechSynthesis.getVoices(); jaVoice=v.find(x=>/^ja/i.test(x.lang))||null; }
if(window.speechSynthesis){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function speak(text){
  if(!window.speechSynthesis){ if(document.getElementById('voiceNote')) $('voiceNote').textContent='Este navegador não tem voz sintetizada. Na versão final, o áudio vem de gravações.'; return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang='ja-JP'; u.rate=.85; if(jaVoice) u.voice=jaVoice;
  speechSynthesis.speak(u);
}

const MONTH_K=['','いちがつ','にがつ','さんがつ','しがつ','ごがつ','ろくがつ','しちがつ','はちがつ','くがつ','じゅうがつ','じゅういちがつ','じゅうにがつ'];
const DAY_K={1:'ついたち',2:'ふつか',3:'みっか',4:'よっか',5:'いつか',6:'むいか',7:'なのか',8:'ようか',9:'ここのか',10:'とおか',14:'じゅうよっか',20:'はつか',24:'にじゅうよっか'};
function dayKana(n){ if(DAY_K[n]) return DAY_K[n]; return numKana(n).replace(/なな$/,'しち').replace(/きゅう$/,'く')+'にち'; }
function dateJa(d){ const y=d.getFullYear(),m=d.getMonth()+1,dd=d.getDate();
  return `${y}<ruby>年<rt>ねん</rt></ruby><ruby>${m}月<rt>${MONTH_K[m]}</rt></ruby><ruby>${dd}日<rt>${dayKana(dd)}</rt></ruby>（<ruby>令和<rt>れいわ</rt></ruby>${y-2018}<ruby>年<rt>ねん</rt></ruby>）`; }

/* Ordem FIXA das palavras para o link do caderno (QR). Palavra nova: acrescente SEMPRE no fim, nunca no meio. */
const WORD_ORDER=["nagai", "mijikai", "pony", "odango", "kurukuru", "afuro", "mitsuami", "bouzu", "kuro", "chairo", "kiniro", "aka", "ao", "shiro", "pinku", "murasaki", "midori", "egao", "bikkuri", "nemui", "uinku", "okoru", "tshirt", "parka", "seetaa", "suutsu", "kimono", "wanpiisu", "nashi", "megane", "boushi", "ribon", "hijabu", "nekutai", "heddohon", "sobakasu", "hige", "hoppe", "hokuro", "hochouki", "kurumaisu", "sora", "umi", "sakura", "yoru", "yama", "akarui", "komugiiro", "koi", "sai", "issai", "hassai", "jussai", "hatachi", "watashi", "boku", "ore", "uchi", "jibun"];
function encodeWords(learned){ const bytes=new Uint8Array(Math.ceil(WORD_ORDER.length/8));
  WORD_ORDER.forEach((id,i)=>{ if(learned[id]) bytes[i>>3]|=1<<(i&7); });
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function decodeWords(str){ const out={}; try{ const b=atob(str.replace(/-/g,'+').replace(/_/g,'/'));
  WORD_ORDER.forEach((id,i)=>{ const c=b.charCodeAt(i>>3); if(c&(1<<(i&7))) out[id]=true; }); }catch(e){} return out; }
function encodeSel(S){ return [S.hair,S.hairColor,S.face,S.clothes,S.clothColor,S.bg,S.skin,S.age,(S.acc||[]).join('-'),(S.traits||[]).join('-')].join('.'); }
function decodeSel(str){ const p=String(str||'').split('.'); if(p.length<10) return null;
  return {hair:p[0],hairColor:p[1],face:p[2],clothes:p[3],clothColor:p[4],bg:p[5],skin:+p[6]||0,age:+p[7]||20,acc:p[8]?p[8].split('-'):[],traits:p[9]?p[9].split('-'):[]}; }
const SITE='https://unirversos.com';
function cadernoURL(data){ const q=new URLSearchParams({n:data.name||'',w:encodeWords(data.learned||{}),a:encodeSel(data.sel)}); return SITE+'/idiomas/planeta-utopia/caderno/?'+q.toString(); }
