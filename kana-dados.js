/* Unirversos · Trilhas de Hiragana e Katakana — dados.
   Todo exemplo é escrito só em kana (sem kanji), porque a trilha vem antes do kanji. */
(function(){
const ROWS=[
 {id:'a', label:'あ', kana:[['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']]},
 {id:'ka',label:'か', kana:[['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']]},
 {id:'sa',label:'さ', kana:[['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']]},
 {id:'ta',label:'た', kana:[['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']]},
 {id:'na',label:'な', kana:[['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']]},
 {id:'ha',label:'は', kana:[['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']]},
 {id:'ma',label:'ま', kana:[['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']]},
 {id:'ya',label:'や', kana:[['や','ya'],['ゆ','yu'],['よ','yo']]},
 {id:'ra',label:'ら', kana:[['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']]},
 {id:'wa',label:'わ', kana:[['わ','wa'],['を','o'],['ん','n']]}
];
/* exemplo: [palavra, romaji, pt, en] */
const EX_HIRA={
 あ:['あか','aka','vermelho','red'], い:['いろ','iro','cor','color'], う:['うみ','umi','mar','sea'], え:['えがお','egao','sorriso','smile'], お:['おだんご','odango','coque','bun'],
 か:['かみ','kami','cabelo','hair'], き:['きもの','kimono','quimono','kimono'], く:['くろ','kuro','preto','black'], け:['けむり','kemuri','fumaça','smoke'], こ:['こい','koi','escuro (cor intensa)','dark'],
 さ:['さくら','sakura','cerejeira','cherry blossom'], し:['しろ','shiro','branco','white'], す:['すし','sushi','sushi','sushi'], せ:['せかい','sekai','mundo','world'], そ:['そら','sora','céu','sky'],
 た:['たまご','tamago','ovo','egg'], ち:['ちゃいろ','chairo','marrom','brown'], つ:['つき','tsuki','lua','moon'], て:['て','te','mão','hand'], と:['とり','tori','pássaro','bird'],
 な:['ながい','nagai','longo','long'], に:['にほん','nihon','Japão','Japan'], ぬ:['いぬ','inu','cachorro','dog'], ね:['ねむい','nemui','com sono','sleepy'], の:['のる','noru','subir, andar em (veículo)','to ride'],
 は:['はたち','hatachi','20 anos','20 years old'], ひ:['ひよこ','hiyoko','pintinho','chick'], ふ:['ふく','fuku','roupa','clothes'], へ:['へや','heya','quarto','room'], ほ:['ほくろ','hokuro','pinta','beauty mark'],
 ま:['まど','mado','janela','window'], み:['みどり','midori','verde','green'], む:['むらさき','murasaki','roxo','purple'], め:['めがね','megane','óculos','glasses'], も:['もの','mono','coisa','thing'],
 や:['やま','yama','montanha','mountain'], ゆ:['ゆき','yuki','neve','snow'], よ:['よる','yoru','noite','night'],
 ら:['らくだ','rakuda','camelo','camel'], り:['りんご','ringo','maçã','apple'], る:['はる','haru','primavera','spring'], れ:['きれい','kirei','bonito, limpo','pretty, clean'], ろ:['ろく','roku','seis','six'],
 わ:['わたし','watashi','eu','I'], を:['ふくを きる','fuku o kiru','vestir a roupa (を marca o objeto)','to wear clothes'], ん:['ほん','hon','livro','book']
};
const EX_KATA={
 ア:['アフロ','afuro','black power','afro'], イ:['インク','inku','tinta','ink'], ウ:['ウインク','uinku','piscadinha','wink'], エ:['エアコン','eakon','ar-condicionado','air conditioner'], オ:['オレンジ','orenji','laranja','orange'],
 カ:['カメラ','kamera','câmera','camera'], キ:['キウイ','kiui','kiwi','kiwi'], ク:['クッキー','kukkii','biscoito','cookie'], ケ:['ケーキ','kēki','bolo','cake'], コ:['コーヒー','kōhii','café','coffee'],
 サ:['サラダ','sarada','salada','salad'], シ:['シャツ','shatsu','camisa','shirt'], ス:['スーツ','sūtsu','terno','suit'], セ:['セーター','sētā','suéter','sweater'], ソ:['ソファ','sofa','sofá','sofa'],
 タ:['タクシー','takushii','táxi','taxi'], チ:['チーズ','chiizu','queijo','cheese'], ツ:['ツアー','tsuā','excursão','tour'], テ:['テレビ','terebi','televisão','TV'], ト:['トマト','tomato','tomate','tomato'],
 ナ:['ナイフ','naifu','faca','knife'], ニ:['ニュース','nyūsu','notícias','news'], ヌ:['ヌードル','nūdoru','macarrão (noodle)','noodles'], ネ:['ネクタイ','nekutai','gravata','necktie'], ノ:['ノート','nōto','caderno','notebook'],
 ハ:['ハンバーガー','hanbāgā','hambúrguer','hamburger'], ヒ:['ヒジャブ','hijabu','hijab','hijab'], フ:['フォーク','fōku','garfo','fork'], ヘ:['ヘッドホン','heddohon','fones de ouvido','headphones'], ホ:['ホテル','hoteru','hotel','hotel'],
 マ:['マスク','masuku','máscara','mask'], ミ:['ミルク','miruku','leite','milk'], ム:['ムービー','mūbii','filme','movie'], メ:['メロン','meron','melão','melon'], モ:['モデル','moderu','modelo','model'],
 ヤ:['タイヤ','taiya','pneu','tire'], ユ:['ユニフォーム','yunifōmu','uniforme','uniform'], ヨ:['ヨーグルト','yōguruto','iogurte','yogurt'],
 ラ:['ラーメン','rāmen','lámen','ramen'], リ:['リボン','ribon','laço','bow'], ル:['ルール','rūru','regra','rule'], レ:['レモン','remon','limão','lemon'], ロ:['ロボット','robotto','robô','robot'],
 ワ:['ワンピース','wanpiisu','vestido','dress'], ヲ:['—','o','quase nunca aparece em katakana','rarely used'], ン:['ピンク','pinku','rosa','pink']
};
/* letras parecidas: dica mostrada no cartão */
const TIPS_HIRA={さ:'Cuidado com ち: são espelhadas. さ abre para a esquerda embaixo.',ち:'Cuidado com さ: são espelhadas. ち abre para a direita.',
 ぬ:'Parece め, mas ぬ tem um lacinho no final.',め:'Parece ぬ, mas め termina sem lacinho.',ね:'ね, れ e わ começam iguais: ね termina num lacinho.',
 れ:'れ termina com um rabinho para fora.',わ:'わ termina numa curva fechada, sem lacinho.',る:'る tem um lacinho embaixo; ろ não tem.',ろ:'ろ não tem lacinho; る tem.',
 は:'は e ほ: ほ tem um traço a mais em cima.',ほ:'ほ tem dois traços horizontais; は tem um.',い:'Parece り, mas い tem os dois traços quase do mesmo tamanho.',
 り:'り tem o traço da direita bem mais comprido.',を:'Soa como お. Só aparece como partícula, depois do objeto: ふくを きる.',
 は_part:'', ん:'É a única letra que é só consoante. Sozinha, soa como "n" ou "m".'};
const TIPS_KATA={シ:'シ e ツ: em シ os pontinhos ficam à esquerda e o traço sobe de baixo para cima.',ツ:'Em ツ os pontinhos ficam em cima e o traço desce de cima para baixo.',
 ソ:'ソ e ン: em ソ o primeiro traço é quase vertical.',ン:'Em ン o primeiro traço é quase deitado e o último sobe.',ク:'ク e タ: タ tem um tracinho a mais no meio.',
 タ:'タ é ク com um tracinho a mais no meio.',ウ:'ウ e ワ: ウ tem um tracinho em cima.',ワ:'ワ é como ウ sem o tracinho de cima.',コ:'コ e ユ: em ユ o traço de baixo passa do lado.',
 ユ:'Em ユ o traço de baixo é mais comprido que o de cima.',チ:'チ e テ: チ tem o traço de cima inclinado.',テ:'テ tem os dois traços de cima retos.',
 ア:'ア e マ: マ é mais aberta e tem um tracinho no meio.',マ:'マ parece um "2" virado; ア tem uma perninha comprida.',ヌ:'ヌ e ス: ヌ tem um tracinho cortando.',
 ス:'ス não tem o tracinho que corta ヌ.',ヲ:'Soa como オ e quase não aparece em katakana.'};
/* extras */
const DAKU=[['か','が'],['き','ぎ'],['く','ぐ'],['け','げ'],['こ','ご'],['さ','ざ'],['し','じ'],['す','ず'],['せ','ぜ'],['そ','ぞ'],['た','だ'],['ち','ぢ'],['つ','づ'],['て','で'],['と','ど'],['は','ば'],['ひ','び'],['ふ','ぶ'],['へ','べ'],['ほ','ぼ']];
const HANDAKU=[['は','ぱ'],['ひ','ぴ'],['ふ','ぷ'],['へ','ぺ'],['ほ','ぽ']];
const SMALL=[['つ','っ'],['や','ゃ'],['ゆ','ゅ'],['よ','ょ'],['あ','ぁ'],['い','ぃ'],['う','ぅ'],['え','ぇ'],['お','ぉ']];
const RO_EXTRA={が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po'};
const YOON=['き','し','ち','に','ひ','み','り','ぎ','じ','び','ぴ'];
const EXTRAS_INFO=[
 {title:'Tenten ゛ e maru ゜',body:'Dois risquinhos (゛) deixam o som "sujo": か ka → が ga, さ sa → ざ za, は ha → ば ba. A bolinha (゜) só vai na linha do は: は → ぱ pa.',ex:[['えがお','egao','sorriso'],['ぼうし','bōshi','chapéu']]},
 {title:'Pequenas ゃ ゅ ょ',body:'Escritas pequenas depois de uma letra que termina em i, viram um som só: き + ゃ = きゃ kya, し + ょ = しょ sho.',ex:[['ちゃいろ','chairo','marrom'],['ひょうじょう','hyōjō','expressão do rosto']]},
 {title:'O っ pequeno',body:'Um つ pequeno é uma pausa curta: dobra a consoante seguinte. はっさい = hassai (8 anos).',ex:[['はっさい','hassai','8 anos'],['いっさい','issai','1 ano']]}
];
const EXTRAS_INFO_KATA=[
 {title:'A barra ー',body:'Em katakana, a barra alonga a vogal de antes: ケーキ = kēki, スーツ = sūtsu.',ex:[['ケーキ','kēki','bolo'],['ラーメン','rāmen','lámen']]},
 {title:'Tenten, maru e pequenas',body:'Funcionam igual ao hiragana: カ → ガ, ハ → パ, キ + ャ = キャ, e ッ dobra a consoante: クッキー = kukkii.',ex:[['ヘッドホン','heddohon','fones'],['シャツ','shatsu','camisa']]},
 {title:'Sons novos para palavras estrangeiras',body:'O katakana combina letras para sons que o japonês não tinha: テ + ィ = ティ (ti), フ + ァ = ファ (fa), シ + ェ = シェ (she).',ex:[['ティーシャツ','tiishatsu','camiseta'],['フォーク','fōku','garfo']]}
];
/* palavras para a etapa Ar (ler) */
const READ_HIRA=[['あか','aka','vermelho','red'],['うみ','umi','mar','sea'],['そら','sora','céu','sky'],['やま','yama','montanha','mountain'],['さくら','sakura','cerejeira','cherry blossom'],['よる','yoru','noite','night'],['ねむい','nemui','com sono','sleepy'],['ながい','nagai','longo','long'],['みどり','midori','verde','green'],['めがね','megane','óculos','glasses'],['きもの','kimono','quimono','kimono'],['いぬ','inu','cachorro','dog'],['すし','sushi','sushi','sushi'],['りんご','ringo','maçã','apple'],['つき','tsuki','lua','moon'],['ほん','hon','livro','book'],['はる','haru','primavera','spring'],['くろ','kuro','preto','black'],['しろ','shiro','branco','white'],['ふく','fuku','roupa','clothes'],['とり','tori','pássaro','bird'],['ゆき','yuki','neve','snow'],['いろ','iro','cor','color'],['かみ','kami','cabelo','hair']];
const READ_KATA=[['パーカー','pākā','moletom com capuz','hoodie'],['ヘッドホン','heddohon','fones de ouvido','headphones'],['スーツ','sūtsu','terno','suit'],['ピンク','pinku','rosa','pink'],['アフロ','afuro','black power','afro'],['リボン','ribon','laço','bow'],['セーター','sētā','suéter','sweater'],['ネクタイ','nekutai','gravata','necktie'],['カメラ','kamera','câmera','camera'],['ケーキ','kēki','bolo','cake'],['コーヒー','kōhii','café','coffee'],['ラーメン','rāmen','lámen','ramen'],['ホテル','hoteru','hotel','hotel'],['テレビ','terebi','televisão','TV'],['メロン','meron','melão','melon'],['トマト','tomato','tomate','tomato'],['レモン','remon','limão','lemon'],['ミルク','miruku','leite','milk'],['ノート','nōto','caderno','notebook'],['タクシー','takushii','táxi','taxi']];
const toKata=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const toHira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
function build(kind){
  const conv=kind==='kata'?toKata:(x=>x), EX=kind==='kata'?EX_KATA:EX_HIRA, TIPS=kind==='kata'?TIPS_KATA:TIPS_HIRA;
  const rows=ROWS.map(r=>({id:r.id,label:conv(r.label),kana:r.kana.map(([k,ro])=>{const c=conv(k);return {k:c,ro,ex:EX[c]||null,tip:TIPS[c]||''};})}));
  const all=[].concat(...rows.map(r=>r.kana));
  const yoon=YOON.map(b=>[['ゃ','a'],['ゅ','u'],['ょ','o']].map(([s,v])=>{const base=({き:'ky',し:'sh',ち:'ch',に:'ny',ひ:'hy',み:'my',り:'ry',ぎ:'gy',じ:'j',び:'by',ぴ:'py'})[b];return {k:conv(b+s),ro:base+v};}));
  return {kind,name:kind==='kata'?'カタカナ':'ひらがな',ptName:kind==='kata'?'Katakana':'Hiragana',rows,all,
    daku:DAKU.map(([a,b])=>({from:conv(a),k:conv(b),ro:RO_EXTRA[b]})),handaku:HANDAKU.map(([a,b])=>({from:conv(a),k:conv(b),ro:RO_EXTRA[b]})),
    small:SMALL.map(([a,b])=>[conv(a),conv(b)]),yoon,
    info:kind==='kata'?EXTRAS_INFO_KATA:EXTRAS_INFO.map(x=>({...x})),
    read:kind==='kata'?READ_KATA:READ_HIRA};
}
const READ_ROWS={"hira": {"a": [["あい", "ai", "amor", "love", "❤️"], ["いえ", "ie", "casa", "house", "🏠"], ["うえ", "ue", "em cima", "up", "⬆️"], ["あお", "ao", "azul", "blue", "🔵"], ["いい", "ii", "bom", "good", "👍"], ["え", "e", "desenho, pintura", "picture", "🖼️"]], "ka": [["あか", "aka", "vermelho", "red", "🔴"], ["かお", "kao", "rosto", "face", "🙂"], ["えき", "eki", "estação", "station", "🚉"], ["あき", "aki", "outono", "autumn", "🍂"], ["こい", "koi", "carpa", "carp", "🎏"], ["こえ", "koe", "voz", "voice", "🗣️"], ["いけ", "ike", "lagoa", "pond", "🏞️"], ["きく", "kiku", "crisântemo", "chrysanthemum", "🌼"]], "sa": [["すし", "sushi", "sushi", "sushi", "🍣"], ["あさ", "asa", "manhã", "morning", "🌅"], ["いす", "isu", "cadeira", "chair", "🪑"], ["かさ", "kasa", "guarda-chuva", "umbrella", "☂️"], ["しお", "shio", "sal", "salt", "🧂"], ["すいか", "suika", "melancia", "watermelon", "🍉"], ["うし", "ushi", "vaca", "cow", "🐄"], ["あし", "ashi", "perna, pé", "leg, foot", "🦵"]], "ta": [["たこ", "tako", "polvo", "octopus", "🐙"], ["くつ", "kutsu", "sapato", "shoe", "👟"], ["て", "te", "mão", "hand", "✋"], ["つき", "tsuki", "lua", "moon", "🌙"], ["とけい", "tokei", "relógio", "clock", "⏰"], ["うた", "uta", "canção", "song", "🎵"], ["くち", "kuchi", "boca", "mouth", "👄"], ["たいこ", "taiko", "tambor", "drum", "🥁"]], "na": [["ねこ", "neko", "gato", "cat", "🐱"], ["いぬ", "inu", "cachorro", "dog", "🐶"], ["なす", "nasu", "berinjela", "eggplant", "🍆"], ["さかな", "sakana", "peixe", "fish", "🐟"], ["にく", "niku", "carne", "meat", "🥩"], ["なつ", "natsu", "verão", "summer", "🏖️"], ["おかね", "okane", "dinheiro", "money", "💴"], ["きのこ", "kinoko", "cogumelo", "mushroom", "🍄"]], "ha": [["はな", "hana", "flor", "flower", "🌸"], ["ほし", "hoshi", "estrela", "star", "⭐"], ["ひこうき", "hikōki", "avião", "airplane", "✈️"], ["ふね", "fune", "barco", "boat", "⛵"], ["はし", "hashi", "pauzinhos", "chopsticks", "🥢"], ["ほね", "hone", "osso", "bone", "🦴"], ["はこ", "hako", "caixa", "box", "📦"], ["ふく", "fuku", "roupa", "clothes", "👕"]], "ma": [["もも", "momo", "pêssego", "peach", "🍑"], ["くま", "kuma", "urso", "bear", "🐻"], ["うま", "uma", "cavalo", "horse", "🐴"], ["みみ", "mimi", "orelha", "ear", "👂"], ["め", "me", "olho", "eye", "👁️"], ["むし", "mushi", "inseto", "bug", "🐛"], ["あめ", "ame", "chuva", "rain", "🌧️"], ["まめ", "mame", "feijão", "bean", "🫘"]], "ya": [["やま", "yama", "montanha", "mountain", "⛰️"], ["ゆき", "yuki", "neve", "snow", "❄️"], ["やさい", "yasai", "legumes", "vegetables", "🥕"], ["ゆめ", "yume", "sonho", "dream", "💭"], ["おゆ", "oyu", "água quente", "hot water", "♨️"], ["へや", "heya", "quarto", "room", "🛏️"], ["ゆかた", "yukata", "yukata (quimono leve)", "yukata", "👘"]], "ra": [["くるま", "kuruma", "carro", "car", "🚗"], ["とり", "tori", "pássaro", "bird", "🐦"], ["いるか", "iruka", "golfinho", "dolphin", "🐬"], ["りす", "risu", "esquilo", "squirrel", "🐿️"], ["そら", "sora", "céu", "sky", "☁️"], ["よる", "yoru", "noite", "night", "🌙"], ["さくら", "sakura", "cerejeira", "cherry blossom", "🌸"], ["ろうそく", "rōsoku", "vela", "candle", "🕯️"]], "wa": [["わに", "wani", "jacaré", "crocodile", "🐊"], ["ほん", "hon", "livro", "book", "📖"], ["みかん", "mikan", "tangerina", "tangerine", "🍊"], ["にわとり", "niwatori", "galinha", "chicken", "🐔"], ["かわ", "kawa", "rio", "river", "🌊"], ["わたし", "watashi", "eu", "I", "🙋"], ["ほんを よむ", "hon o yomu", "ler um livro", "read a book", "📚"]]}, "kata": {"a": [["エア", "ea", "ar", "air", "💨"], ["アイ", "ai", "olho (\"eye\", como em アイシャドウ)", "eye", "👁️"]], "ka": [["ケーキ", "kēki", "bolo", "cake", "🍰"], ["ココア", "kokoa", "chocolate quente", "cocoa", "🍫"], ["イカ", "ika", "lula", "squid", "🦑"], ["カカオ", "kakao", "cacau", "cacao", "🫘"], ["エコ", "eko", "ecológico", "eco", "♻️"]], "sa": [["アイス", "aisu", "sorvete", "ice cream", "🍦"], ["スキー", "sukii", "esqui", "ski", "⛷️"], ["ソース", "sōsu", "molho", "sauce", "🥫"], ["シーソー", "shiisō", "gangorra", "seesaw", "🎢"]], "ta": [["タクシー", "takushii", "táxi", "taxi", "🚕"], ["チケット", "chiketto", "ingresso", "ticket", "🎫"], ["サッカー", "sakkā", "futebol", "soccer", "⚽"], ["ツアー", "tsuā", "excursão", "tour", "🧳"], ["トースト", "tōsuto", "torrada", "toast", "🍞"], ["スーツ", "sūtsu", "terno", "suit", "🤵"], ["テスト", "tesuto", "prova", "test", "📝"]], "na": [["テニス", "tenisu", "tênis (esporte)", "tennis", "🎾"], ["ネクタイ", "nekutai", "gravata", "necktie", "👔"], ["ノート", "nōto", "caderno", "notebook", "📓"], ["カヌー", "kanū", "canoa", "canoe", "🛶"], ["ナッツ", "nattsu", "castanhas", "nuts", "🥜"], ["ツナ", "tsuna", "atum", "tuna", "🐟"]], "ha": [["ハート", "hāto", "coração", "heart", "❤️"], ["コーヒー", "kōhii", "café", "coffee", "☕"], ["ホットケーキ", "hottokēki", "panqueca", "pancake", "🥞"], ["ソファ", "sofa", "sofá", "sofa", "🛋️"], ["ヒーター", "hiitā", "aquecedor", "heater", "🔥"], ["ヘア", "hea", "cabelo (penteado)", "hair", "💇"]], "ma": [["マスク", "masuku", "máscara", "mask", "😷"], ["メモ", "memo", "anotação", "memo", "🗒️"], ["ハム", "hamu", "presunto", "ham", "🍖"], ["トマト", "tomato", "tomate", "tomato", "🍅"], ["ムース", "mūsu", "musse", "mousse", "🍮"], ["マスカット", "masukatto", "uva verde", "muscat grape", "🍇"]], "ya": [["ヨーヨー", "yōyō", "ioiô", "yo-yo", "🪀"], ["タイヤ", "taiya", "pneu", "tire", "🛞"], ["ヨット", "yotto", "veleiro", "yacht", "⛵"], ["ユニホーム", "yunihōmu", "uniforme", "uniform", "👕"]], "ra": [["カメラ", "kamera", "câmera", "camera", "📷"], ["ホテル", "hoteru", "hotel", "hotel", "🏨"], ["トイレ", "toire", "banheiro", "toilet", "🚻"], ["ロケット", "roketto", "foguete", "rocket", "🚀"], ["ルール", "rūru", "regra", "rule", "📏"], ["クリーム", "kuriimu", "creme", "cream", "🧴"]], "wa": [["ワイン", "wain", "vinho", "wine", "🍷"], ["ラーメン", "rāmen", "lámen", "ramen", "🍜"], ["レモン", "remon", "limão", "lemon", "🍋"], ["メロン", "meron", "melão", "melon", "🍈"], ["ミシン", "mishin", "máquina de costura", "sewing machine", "🧵"]]}};
window.KanaData={hira:build('hira'),kata:build('kata'),toKata,toHira};
['hira','kata'].forEach(k=>{ const rr=READ_ROWS[k]; window.KanaData[k].readRows=rr; window.KanaData[k].read=[].concat(...Object.values(rr)); });
})();
