(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).sinalizacao={
  slug:'sinalizacao', num:'11', titulo:'Sinalização', emoji:'🪧', jp:R('看板','かんばん'), h1:'Lendo as placas',
  fim:'Você leu as placas, achou o caminho e ainda ajudou alguém.',
  intro:{titulo:'🪧 Placas por todo lado',
    txt:['Na praça da estação tem placa para tudo: saída, entrada, proibido fumar, perigo… Uma senhora simpática, a <b>おばあさん</b>, está ali do lado.',
         'Você vai perguntar como se lê uma placa, achar o banheiro e ainda avisar alguém de um perigo.'],
    metas:['perguntar como se lê uma placa','perguntar onde fica a saída ou o banheiro','perguntar se algo é proibido','avisar alguém de um perigo']},
  npc:{nome:'Senhora na estação', sel:{hair:'odango',hairColor:'shiro',face:'egao',clothes:'seetaa',clothColor:'murasaki',acc:['megane'],traits:[],skin:1}},
  cen:{wall:'#eef1ec', floor:'#d7ddd4',
    back:`<rect x="10" y="10" width="262" height="100" rx="6" fill="#e1e7de"/><g transform="translate(176 20)"><rect width="84" height="34" rx="5" fill="#3c8d5a"/><text x="42" y="22" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="13" font-weight="700" fill="#fff">でぐち →</text></g>
      <g transform="translate(184 64)"><circle cx="16" cy="16" r="15" fill="#fff" stroke="#c94a4a" stroke-width="4"/><rect x="5" y="14" width="20" height="5" fill="#7c6a78"/><path d="M5 27 L27 5" stroke="#c94a4a" stroke-width="4"/></g>
      <g transform="translate(228 62)"><path d="M16 2 L31 30 H1 Z" fill="#f3c969" stroke="#3a2b38" stroke-width="2" stroke-linejoin="round"/><text x="16" y="26" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="14" font-weight="800" fill="#3a2b38">!</text></g>
      <path d="M0 150 H400" stroke="#f3c969" stroke-width="0"/>`,
    board:`<rect y="6" width="106" height="44" rx="8" fill="#26324f"/><text x="53" y="26" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="11" font-weight="700" fill="#fff">えき</text><text x="53" y="42" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="9" fill="#cfd6e6">STATION</text>`,
    counter:null, prop:'<g transform="translate(-140 66)"><rect width="400" height="6" fill="#f3c969"/><g fill="#e5b84f">'+[...Array(20)].map((_,k)=>`<rect x="${k*20+4}" y="1" width="10" height="4" rx="1"/>`).join('')+'</g></g>'},
  words:[
    {id:'deguchi',h:R('出口','でぐち'),k:'でぐち',r:'deguchi',pt:'saída',en:'exit',ic:'🚪',tip:'Placas de saída costumam ser verdes ou amarelas.'},
    {id:'iriguchi',h:R('入口','いりぐち'),k:'いりぐち',r:'iriguchi',pt:'entrada',en:'entrance',ic:'🚶',tip:'O kanji 口 (boca) aparece nos dois: entrada e saída são "bocas" do prédio.'},
    {id:'toire',k:'トイレ',r:'toire',pt:'banheiro',en:'restroom',ic:'🚻',tip:'Do inglês "toilet". Mais formal: おてあらい.'},
    {id:'kinen',h:R('禁煙','きんえん'),k:'きんえん',r:"kin'en",pt:'proibido fumar',en:'no smoking',ic:'🚭',tip:'O apóstrofo no romaji separa: kin-en, não ki-nen.'},
    {id:'kinshi',h:R('禁止','きんし'),k:'きんし',r:'kinshi',pt:'proibido',en:'prohibited',ic:'🚫',tip:'さつえい きんし = proibido fotografar.'},
    {id:'abunai',h:R('危','あぶ')+'ない',k:'あぶない',r:'abunai',pt:'perigoso!',en:'dangerous!',ic:'⚠️',tip:'Sozinho, あぶない！ é o nosso "cuidado!".'},
    {id:'chuui',h:R('注意','ちゅうい'),k:'ちゅうい',r:'chūi',pt:'atenção',en:'caution',ic:'❗',tip:'Aparece em placas amarelas: あしもと ちゅうい = cuidado com o degrau.'},
    {id:'yomimasu',h:R('読','よ')+'みます',k:'よみます',r:'yomimasu',pt:'ler',en:'to read',ic:'📖',tip:'なんと よみますか = como se lê?'}
  ],
  moldes:[
    {titulo:'"Como se lê ___?"', tpl:'<i>これ / それ / あれ</i> は なんと よみますか', tplRo:'[kore/sore/are] wa nan to yomimasu ka', parts:[0,'は|wa','なんと|nan to',{k:'よみますか',r:'yomimasu ka',h:R('読','よ')+'みますか'}],
     slots:[[['これ|kore','Como se lê isto?','How do you read this?'],['それ|sore','Como se lê isso?','How do you read that?'],['あれ|are','Como se lê aquilo?','How do you read that one over there?']]],
     gram:'<b>なんと</b> = "como" (literalmente "o quê"). Ótima pergunta para kanji desconhecido!', use:'Na cena: perguntar o que diz uma placa.'},
    {titulo:'"Onde fica ___?"', tpl:'<i>lugar</i> は どこ ですか', tplRo:'[lugar] wa doko desu ka', parts:[0,'は|wa','どこ|doko','ですか|desu ka'],
     slots:[[['トイレ|toire','Onde fica o banheiro?','Where is the restroom?'],['でぐち|deguchi','Onde fica a saída?','Where is the exit?',R('出口','でぐち')],['いりぐち|iriguchi','Onde fica a entrada?','Where is the entrance?',R('入口','いりぐち')]]],
     gram:'Você já sabe este de cor, né? 😉', use:'Na cena: achar o banheiro.'},
    {titulo:'"Aqui é ___?"', tpl:'ここ は <i>regra</i> ですか', tplRo:'koko wa [regra] desu ka', parts:['ここ|koko','は|wa',0,'ですか|desu ka'],
     slots:[[['きんえん|kin\'en','Aqui é proibido fumar?','Is this a no-smoking area?',R('禁煙','きんえん')],['きんし|kinshi','Aqui é proibido?','Is it prohibited here?',R('禁止','きんし')]]],
     gram:'<b>ここ</b> = aqui. Família do これ: ここ (aqui), そこ (aí), あそこ (lá).', use:'Na cena: confirmar uma regra.'},
    {titulo:'"Com licença, ___!"', tpl:'すみません、<i>aviso</i> ですよ', tplRo:'sumimasen, [aviso] desu yo', parts:['すみません|sumimasen',0,'ですよ|desu yo'],
     slots:[[['あぶない|abunai','Com licença, é perigoso!',"Excuse me, it's dangerous!",R('危','あぶ')+'ない'],['きんえん|kin\'en','Com licença, aqui é proibido fumar!',"Excuse me, it's no smoking!",R('禁煙','きんえん')]]],
     gram:'<b>よ</b> no fim avisa algo que o outro não sabe: "olha, é perigoso!".', use:'Na cena: avisar alguém.'}
  ],
  cenas:[
    {q:R('何','なに')+'か お'+R('困','こま')+'りですか？', say:'なにか おこまりですか？', ro:'Nani ka o-komari desu ka?', pt:'Está precisando de ajuda?',
     ans:['あれ|are','は|wa','なんと|nan to','よみますか|yomimasu ka'], extra:['どこ|doko','ですか|desu ka'], ansPt:'Como se lê aquilo? (apontando para a placa)', molde:0, dica:'A placa está longe, lá no alto.', distr:['Está procurando a saída?','Está com fome?']},
    {q:'「でぐち」と '+R('読','よ')+'みます。'+R('出口','でぐち')+'の '+R('意味','いみ')+'ですよ。', say:'でぐちと よみます。でぐちの いみですよ。', ro:'"Deguchi" to yomimasu. Deguchi no imi desu yo.', pt:'Lê-se "deguchi". Quer dizer saída.',
     ans:['トイレ|toire','は|wa','どこ|doko','ですか|desu ka'], extra:['ここ|koko','きんし|kinshi'], ansPt:'Onde fica o banheiro?', molde:1, dica:'Agradeça com os olhos e pergunte pelo banheiro.', distr:['Lê-se "iriguchi". Quer dizer entrada.','Lê-se "kinshi". Quer dizer proibido.']},
    {q:'トイレは あちらです。あっ、あの '+R('子','こ')+'、'+R('線','せん')+'の '+R('外','そと')+'に…！', say:'トイレは あちらです。あっ、あの こ、せんの そとに…！', ro:'Toire wa achira desu. A, ano ko, sen no soto ni…!', pt:'O banheiro é ali. Ah, aquela criança está fora da faixa…!',
     ans:['すみません|sumimasen','あぶない|abunai','ですよ|desu yo'], extra:['きんえん|kin\'en','ですか|desu ka'], ansPt:'Com licença, é perigoso!', molde:3, dica:'Avise a criança.', distr:['O banheiro está fechado.','Aquela criança está chorando.']},
    {q:'よかった…。あの '+R('人','ひと')+'、たばこを '+R('吸','す')+'っていますね。', say:'よかった。あの ひと、たばこを すっていますね。', ro:'Yokatta…. Ano hito, tabako o sutte imasu ne.', pt:'Ufa… Aquele homem está fumando, né.',
     ans:['ここ|koko','は|wa','きんえん|kin\'en','ですか|desu ka'], extra:['あぶない|abunai','ですよ|desu yo'], ansPt:'Aqui é proibido fumar?', molde:2, distr:['Aquele homem está perdido, né.','Aquele homem está atrasado, né.']},
    {q:'はい、ここは '+R('禁煙','きんえん')+'ですよ。', say:'はい、ここは きんえんですよ。', ro:'Hai, koko wa kin\'en desu yo.', pt:'Sim, aqui é proibido fumar.',
     ans:['すみません|sumimasen','きんえん|kin\'en','ですよ|desu yo'], extra:['ここ|koko','ですか|desu ka'], ansPt:'Com licença, aqui é proibido fumar! (para o moço)', molde:3, dica:'Avise o moço com educação.', distr:['Sim, aqui é a saída.','Não, aqui pode fumar.']}
  ]
};
})();
