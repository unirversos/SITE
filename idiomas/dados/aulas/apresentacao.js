(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).apresentacao={
  slug:'apresentacao', num:'08', titulo:'Apresentação', emoji:'🤝', jp:R('自己紹介','じこしょうかい'), h1:'Uma nova amiga',
  fim:'Você se apresentou e fez uma amiga nova em japonês.',
  intro:{titulo:'☕ Encontro de intercâmbio',
    txt:['Você foi a um café de intercâmbio de idiomas. Uma moça simpática chamada <b>ファティマ</b> (Fátima) senta na sua mesa.',
         'Ela vai querer saber seu nome, de onde você é, com o que trabalha e do que gosta. É a conversa que você mais vai ter no Japão!'],
    metas:['dizer はじめまして e seu nome','dizer de que país você veio','falar do seu trabalho','falar do seu hobby']},
  npc:{nome:'ファティマ (Fátima)', sel:{hair:'mijikai',hairColor:'kuro',face:'egao',clothes:'seetaa',clothColor:'murasaki',acc:['hijabu'],traits:[],skin:2}},
  cen:{wall:'#f4efe6', floor:'#e3d6c3',
    back:`<rect x="16" y="14" width="246" height="92" rx="12" fill="#e8f3e8" stroke="#d6c7b0" stroke-width="4"/><g fill="#8fb996"><circle cx="50" cy="96" r="20"/><circle cx="74" cy="90" r="16"/><circle cx="210" cy="96" r="22"/><circle cx="236" cy="92" r="14"/></g><g fill="#f4a6bf"><circle cx="60" cy="40" r="4"/><circle cx="120" cy="30" r="3"/><circle cx="180" cy="50" r="4"/><circle cx="220" cy="28" r="3"/></g><path d="M139 14 V106" stroke="#d6c7b0" stroke-width="4"/>`,
    board:`<rect width="106" height="60" rx="6" fill="#3a3a36"/><rect x="4" y="4" width="98" height="52" rx="3" fill="#4a4a44"/><text x="53" y="24" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="11" font-weight="700" fill="#fff">カフェ</text><text x="53" y="42" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="9" fill="#f3c969">language exchange</text>`,
    counter:{label:'', color:'#c98b5e', top:'#e7c49f'},
    prop:'<g transform="translate(4 14)"><path d="M0 4 h16 v10 a8 8 0 0 1 -16 0z" fill="#fff"/><path d="M16 7 q6 0 6 5 q0 5 -6 5" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M30 4 h16 v10 a8 8 0 0 1 -16 0z" fill="#f8dde1"/><path d="M6 -2 q2 -4 0 -8 M38 -2 q2 -4 0 -8" stroke="#ccc" stroke-width="1.5" fill="none"/></g>'},
  words:[
    {id:'hajimemashite',h:R('初','はじ')+'めまして',k:'はじめまして',r:'hajimemashite',pt:'muito prazer',en:'nice to meet you',ic:'👋',tip:'Só na primeira vez que você encontra a pessoa.'},
    {id:'watashi',h:R('私','わたし'),k:'わたし',r:'watashi',pt:'eu',en:'I',ic:'🙋',tip:'Os japoneses falam わたし bem menos que nós falamos "eu". Muitas vezes fica subentendido.'},
    {id:'namae',h:R('名前','なまえ'),k:'なまえ',r:'namae',pt:'nome',en:'name',ic:'📛',tip:'O seu nome em katakana está na sua carteirinha do Ateliê!'},
    {id:'burajiru',k:'ブラジル',r:'Burajiru',pt:'Brasil',en:'Brazil',ic:'🌎',tip:'Países estrangeiros são escritos em katakana.'},
    {id:'shigoto',h:R('仕事','しごと'),k:'しごと',r:'shigoto',pt:'trabalho',en:'work, job',ic:'💼',tip:'Ouvir お仕事は？ é bem comum.'},
    {id:'sensei',h:R('先生','せんせい'),k:'せんせい',r:'sensei',pt:'professor(a)',en:'teacher',ic:'🧑‍🏫',tip:'Também usado para médicos.'},
    {id:'shumi',h:R('趣味','しゅみ'),k:'しゅみ',r:'shumi',pt:'hobby',en:'hobby',ic:'🎨',tip:'Uma ótima forma de puxar assunto.'},
    {id:'yoroshiku',h:'よろしく お'+R('願','ねが')+'いします',k:'よろしく おねがいします',r:'yoroshiku onegaishimasu',pt:'conto com você / prazer',en:'nice to meet you (I look forward to…)',ic:'🙇',tip:'Fecha a apresentação. Não tem tradução exata: é um "vamos nos dar bem".'},
    {id:'kuni',h:R('国','くに'),k:'くに',r:'kuni',pt:'país',en:'country',ic:'🌎',tip:'おくには どちらですか？ = de que país você é?'}
  ],
  moldes:[
    {titulo:'"Eu sou ___."', tpl:'わたし は <i>nome</i> です', tplRo:'watashi wa [nome] desu', parts:[{k:'わたし',r:'watashi',h:R('私','わたし')},'は|wa',0,'です|desu'],
     slots:[[['{NOME}|{NOMERO}','Eu sou {NOMERO}.',"I'm {NOMERO}."],['ケン|Ken','Eu sou o Ken.',"I'm Ken."],['ユキ|Yuki','Eu sou a Yuki.',"I'm Yuki."]]],
     gram:'Na conversa, dá para tirar o <b>わたし は</b> e dizer só <b>nome + です</b>.', use:'Na cena: dizer o seu nome.'},
    {titulo:'"Vim de ___."', tpl:'<i>país</i> から きました', tplRo:'[país] kara kimashita', parts:[0,'から|kara',{k:'きました',r:'kimashita',h:R('来','き')+'ました'}],
     slots:[[['ブラジル|Burajiru','Vim do Brasil.','I came from Brazil.'],['ポルトガル|Porutogaru','Vim de Portugal.','I came from Portugal.'],['アンゴラ|Angora','Vim de Angola.','I came from Angola.']]],
     gram:'<b>から</b> = de, a partir de. <b>きました</b> = vim.', use:'Na cena: dizer de onde você é.'},
    {titulo:'"Meu trabalho é ___."', tpl:'しごと は <i>profissão</i> です', tplRo:'shigoto wa [profissão] desu', parts:[{k:'しごと',r:'shigoto',h:R('仕事','しごと')},'は|wa',0,'です|desu'],
     slots:[[['せんせい|sensei','Sou professora.',"I'm a teacher.",R('先生','せんせい')],['がくせい|gakusei','Sou estudante.',"I'm a student.",R('学生','がくせい')],['エンジニア|enjinia','Sou engenheira.',"I'm an engineer."]]],
     gram:'Literalmente "o trabalho é professora". Estudantes costumam dizer só <b>がくせいです</b>.', use:'Na cena: falar do seu trabalho.'},
    {titulo:'"Meu hobby é ___."', tpl:'しゅみ は <i>hobby</i> です', tplRo:'shumi wa [hobby] desu', parts:[{k:'しゅみ',r:'shumi',h:R('趣味','しゅみ')},'は|wa',0,'です|desu'],
     slots:[[['アニメ|anime','Meu hobby é anime.','My hobby is anime.'],['りょうり|ryōri','Meu hobby é cozinhar.','My hobby is cooking.',R('料理','りょうり')],['サッカー|sakkā','Meu hobby é futebol.','My hobby is soccer.']]],
     gram:'O mesmo molde de antes! Só trocou しごと por <b>しゅみ</b>.', use:'Na cena: falar do que você gosta.'}
  ],
  cenas:[
    {q:R('初','はじ')+'めまして！ファティマです。', say:'はじめまして！ファティマです。', ro:'Hajimemashite! Fatima desu.', pt:'Muito prazer! Sou a Fátima.',
     ans:['はじめまして|hajimemashite','{NOME}|{NOMERO}','です|desu'], extra:['から|kara','しごと|shigoto','は|wa'], ansPt:'Muito prazer. Sou {NOMERO}.', molde:0, distr:['Bom dia! Tudo bem?','Até mais, Fátima!']},
    {q:'お'+R('国','くに')+'は どちらですか？', say:'おくには どちらですか？', ro:'O-kuni wa dochira desu ka?', pt:'De que país você é?',
     ans:[['ブラジル|Burajiru','ポルトガル|Porutogaru','アンゴラ|Angora'],'から|kara','きました|kimashita'], extra:['です|desu','は|wa'], ansPt:'Vim do meu país. (qualquer país vale!)', molde:1, dica:'Diga o seu país.', distr:['Onde você mora no Japão?','Você fala inglês?']},
    {q:'お'+R('仕事','しごと')+'は '+R('何','なん')+'ですか？', say:'おしごとは なんですか？', ro:'O-shigoto wa nan desu ka?', pt:'Com o que você trabalha?',
     ans:['しごと|shigoto','は|wa',['せんせい|sensei','がくせい|gakusei','エンジニア|enjinia'],'です|desu'], extra:['から|kara','しゅみ|shumi'], ansPt:'Fala do seu trabalho. (qualquer profissão vale!)', molde:2, dica:'Escolha a sua profissão.', distr:['Qual é o seu hobby?','Quantos anos você tem?']},
    {q:R('趣味','しゅみ')+'は '+R('何','なん')+'ですか？', say:'しゅみは なんですか？', ro:'Shumi wa nan desu ka?', pt:'Qual é o seu hobby?',
     ans:['しゅみ|shumi','は|wa',['アニメ|anime','りょうり|ryōri','サッカー|sakkā'],'です|desu'], extra:['しごと|shigoto','から|kara'], ansPt:'Fala do seu hobby. (qualquer um vale!)', molde:3, dica:'Escolha o seu hobby.', distr:['Qual é o seu trabalho?','Qual é o seu nome?']},
    {q:'よろしく お'+R('願','ねが')+'いします！', say:'よろしく おねがいします！', ro:'Yoroshiku onegaishimasu!', pt:'Prazer! (vamos nos dar bem!)',
     ans:['こちらこそ|kochira koso','よろしく おねがいします|yoroshiku onegaishimasu'], extra:['はじめまして|hajimemashite','です|desu'], ansPt:'Eu é que digo: prazer! (こちらこそ = "eu é que…")', molde:null, dica:'こちらこそ = "eu é que digo". Responda com ele + よろしく おねがいします.', distr:['Muito obrigada!','Com licença!']}
  ]
};
})();
