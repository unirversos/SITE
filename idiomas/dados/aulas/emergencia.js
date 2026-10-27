(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).emergencia={
  slug:'emergencia', num:'07', titulo:'Emergência', emoji:'🆘', jp:R('緊急','きんきゅう'), h1:'No posto policial',
  fim:'Você pediu ajuda, explicou o problema e chamou socorro em japonês.',
  intro:{titulo:'🆘 Respira: você vai saber pedir ajuda',
    txt:['Ninguém quer precisar, mas é bom saber. No Japão existe o <b>こうばん</b> (kōban), um posto policial pequeno em quase toda esquina. Os policiais ajudam com coisas perdidas, caminhos e emergências.',
         'Números para guardar: <b>110</b> polícia, <b>119</b> ambulância e bombeiros.'],
    metas:['dizer que perdeu alguma coisa','dizer onde está doendo','perguntar onde fica o hospital','pedir para chamar a ambulância']},
  npc:{nome:'Policial do posto', sel:{hair:'bouzu',hairColor:'kuro',face:'egao',clothes:'suutsu',clothColor:'ao',acc:['nekutai'],traits:[],skin:5},
    extra:'<path d="M66 90 Q120 34 174 90 Z" fill="#26324f"/><rect x="60" y="84" width="120" height="13" rx="6" fill="#1b2546"/><path d="M60 95 Q120 112 180 95 L176 100 Q120 116 64 100 Z" fill="#141c33"/><circle cx="120" cy="68" r="7" fill="#e3b341"/>'},
  cen:{wall:'#f3f1ec', floor:'#dedad2',
    back:`<rect x="20" y="18" width="110" height="80" rx="6" fill="#fff" stroke="#c8c2b6" stroke-width="3"/><path d="M28 30 h94 M28 50 h60 M28 70 h80" stroke="#cfe6f3" stroke-width="6"/><path d="M60 26 v66 M96 26 v66" stroke="#e8efe8" stroke-width="5"/><circle cx="84" cy="58" r="5" fill="#d9506f"/>
      <rect x="150" y="30" width="70" height="56" rx="6" fill="#fff8e6" stroke="#e3d3a8" stroke-width="3"/><text x="185" y="56" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="16" font-weight="800" fill="#c94a4a">110</text><text x="185" y="76" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="16" font-weight="800" fill="#d98a2c">119</text>`,
    board:`<rect x="18" y="10" width="70" height="30" rx="6" fill="#fff" stroke="#26324f" stroke-width="3"/><text x="53" y="31" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="12" font-weight="700" fill="#26324f">こうばん</text><circle class="blink" cx="53" cy="2" r="7" fill="#e5605a"/>`,
    counter:{label:'こうばん', color:'#c9cdd8', top:'#e6e8ee'},
    prop:'<g transform="translate(10 14)"><rect width="30" height="18" rx="4" fill="#3a2b38"/><rect x="4" y="-6" width="22" height="8" rx="4" fill="#3a2b38"/><circle cx="15" cy="9" r="5" fill="#9aa"/></g>'},
  words:[
    {id:'tasukete',h:R('助','たす')+'けて',k:'たすけて',r:'tasukete',pt:'socorro!',en:'help!',ic:'🆘',tip:'Grite alto. Mais educado: たすけて ください.'},
    {id:'keisatsu',h:R('警察','けいさつ'),k:'けいさつ',r:'keisatsu',pt:'polícia',en:'police',ic:'👮',tip:'Telefone 110 (ひゃくとおばん).'},
    {id:'byouin',h:R('病院','びょういん'),k:'びょういん',r:'byōin',pt:'hospital',en:'hospital',ic:'🏥',tip:'Cuidado: びよういん (com よ grande) é salão de beleza!'},
    {id:'kyuukyuusha',h:R('救急車','きゅうきゅうしゃ'),k:'きゅうきゅうしゃ',r:'kyūkyūsha',pt:'ambulância',en:'ambulance',ic:'🚑',tip:'Telefone 119.'},
    {id:'itai',h:R('痛','いた')+'い',k:'いたい',r:'itai',pt:'dói, dolorido',en:'it hurts',ic:'🤕',tip:'Sozinho, いたい！ já é o nosso "ai!".'},
    {id:'atama',h:R('頭','あたま'),k:'あたま',r:'atama',pt:'cabeça',en:'head',ic:'🧠',tip:'おなか = barriga, あし = pé ou perna.'},
    {id:'saifu',h:R('財布','さいふ'),k:'さいふ',r:'saifu',pt:'carteira',en:'wallet',ic:'👛',tip:'Coisas perdidas no Japão muitas vezes voltam pelo こうばん!'},
    {id:'nakushimashita',k:'なくしました',r:'nakushimashita',pt:'perdi',en:'I lost (it)',ic:'🔍',tip:'Passado educado de なくす (perder).'}
  ],
  moldes:[
    {titulo:'"Perdi ___."', tpl:'<i>coisa</i> を なくしました', tplRo:'[coisa] o nakushimashita', parts:[0,'を|o','なくしました|nakushimashita'],
     slots:[[['さいふ|saifu','Perdi a carteira.','I lost my wallet.',R('財布','さいふ')],['パスポート|pasupōto','Perdi o passaporte.','I lost my passport.'],['スマホ|sumaho','Perdi o celular.','I lost my phone.']]],
     gram:'<b>を</b> marca o que foi perdido. <b>-ました</b> = passado.', use:'Na cena: contar o que aconteceu.'},
    {titulo:'"Estou com dor de ___."', tpl:'<i>parte do corpo</i> が いたいです', tplRo:'[parte] ga itai desu', parts:[0,'が|ga',{k:'いたいです',r:'itai desu',h:R('痛','いた')+'いです'}],
     slots:[[['あたま|atama','Estou com dor de cabeça.','I have a headache.',R('頭','あたま')],['おなか|onaka','Estou com dor de barriga.','I have a stomachache.'],['あし|ashi','Estou com dor no pé / na perna.','My foot / leg hurts.',R('足','あし')]]],
     gram:'<b>が</b> aponta o lugar que dói. Se não lembrar a palavra, aponte e diga <b>ここが いたいです</b> (dói aqui).', use:'Na cena: explicar o que sente.'},
    {titulo:'"Onde fica ___?"', tpl:'<i>lugar</i> は どこ ですか', tplRo:'[lugar] wa doko desu ka', parts:[0,'は|wa','どこ|doko','ですか|desu ka'],
     slots:[[['びょういん|byōin','Onde fica o hospital?','Where is the hospital?',R('病院','びょういん')],['やっきょく|yakkyoku','Onde fica a farmácia?','Where is the pharmacy?',R('薬局','やっきょく')],['こうばん|kōban','Onde fica o posto policial?','Where is the police box?',R('交番','こうばん')]]],
     gram:'O molde mais útil da viagem: coisa + <b>は どこ ですか</b>.', use:'Na cena: achar o hospital.'},
    {titulo:'"Chame ___, por favor!"', tpl:'<i>quem</i> を よんで ください', tplRo:'[quem] o yonde kudasai', parts:[0,'を|o',{k:'よんで ください',r:'yonde kudasai',h:R('呼','よ')+'んで ください'}],
     slots:[[['きゅうきゅうしゃ|kyūkyūsha','Chame uma ambulância, por favor!','Please call an ambulance!',R('救急車','きゅうきゅうしゃ')],['けいさつ|keisatsu','Chame a polícia, por favor!','Please call the police!',R('警察','けいさつ')]]],
     gram:'<b>〜て ください</b> = "faça…, por favor". <b>よんで</b> vem de よぶ (chamar).', use:'Na cena: pedir socorro para outra pessoa.'}
  ],
  cenas:[
    {q:'どうしましたか？', say:'どうしましたか？', ro:'Dō shimashita ka?', pt:'O que aconteceu?',
     ans:['さいふ|saifu','を|o','なくしました|nakushimashita'], extra:['が|ga','いたいです|itai desu','は|wa'], tarefa:1, ansPt:'Perdi a carteira.', molde:0, dica:'Você perdeu a carteira.', distr:['Onde você mora?','Precisa de um táxi?']},
    {q:'お'+R('名前','なまえ')+'は？', say:'おなまえは？', ro:'O-namae wa?', pt:'Qual é o seu nome?',
     ans:['{NOME}|{NOMERO}','です|desu'], extra:['を|o','さいふ|saifu'], ansPt:'Sou {NOMERO}. (seu nome + です)', molde:null, dica:'Diga o seu nome + です.', distr:['Qual é o seu telefone?','De onde você é?']},
    {q:R('顔色','かおいろ')+'が '+R('悪','わる')+'いですね。'+R('大丈夫','だいじょうぶ')+'ですか？', say:'かおいろが わるいですね。だいじょうぶですか？', ro:'Kaoiro ga warui desu ne. Daijōbu desu ka?', pt:'Você está pálida. Está tudo bem?',
     ans:['あたま|atama','が|ga','いたいです|itai desu'], extra:['を|o','なくしました|nakushimashita','おなか|onaka'], ansPt:'Estou com dor de cabeça.', molde:1, dica:'Sua cabeça está doendo.', distr:['Você está com fome?','Você perdeu o passaporte?']},
    {q:R('病院','びょういん')+'に '+R('行','い')+'きますか？', say:'びょういんに いきますか？', ro:'Byōin ni ikimasu ka?', pt:'Vai ao hospital?',
     ans:['びょういん|byōin','は|wa','どこ|doko','ですか|desu ka'], extra:['が|ga','を|o','けいさつ|keisatsu'], tarefa:1, ansPt:'Onde fica o hospital?', molde:2, distr:['Vai à farmácia?','Vai para o hotel?']},
    {q:'あっ！あの '+R('人','ひと')+'が '+R('倒','たお')+'れました！', say:'あっ！あの ひとが たおれました！', ro:'A! Ano hito ga taoremashita!', pt:'Ah! Aquela pessoa desmaiou!',
     ans:['きゅうきゅうしゃ|kyūkyūsha','を|o','よんで ください|yonde kudasai'], extra:['けいさつ|keisatsu','は|wa','どこ|doko'], tarefa:1, ansPt:'Chame uma ambulância, por favor!', molde:3, distr:['Ah! Aquela pessoa perdeu a carteira!','Ah! O trem chegou!']}
  ]
};
})();
