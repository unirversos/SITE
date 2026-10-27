(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).planos={
  slug:'planos', num:'10', titulo:'Planos', emoji:'🎉', jp:R('約束','やくそく'), h1:'Vamos sair?',
  fim:'Você convidou, combinou, recusou com jeitinho e aceitou em japonês.',
  intro:{titulo:'🎬 Combinando um programa',
    txt:['Sua amiga <b>ハナ</b> (Hana) está de bobeira. Que tal convidar para um filme?',
         'Você vai aprender a convidar, sugerir um dia, aceitar com animação e também recusar sem dizer "não": o famoso <b>ちょっと…</b>.'],
    metas:['convidar alguém para fazer algo junto','sugerir um dia','aceitar: "vamos!"','recusar com educação']},
  npc:{nome:'ハナ (amiga)', sel:{hair:'kurukuru',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'ao',acc:['hochouki'],traits:[],skin:5}},
  cen:{wall:'#f7eee8', floor:'#e6d3c6',
    back:`<rect x="16" y="14" width="246" height="92" rx="12" fill="#f6c9a8" stroke="#dcbfa8" stroke-width="4"/><circle cx="200" cy="80" r="22" fill="#f3a46b"/><rect x="16" y="78" width="246" height="28" fill="#d9a07f" opacity=".6"/><g fill="#8a6a7a"><rect x="40" y="62" width="20" height="44"/><rect x="66" y="50" width="16" height="56"/><rect x="100" y="70" width="24" height="36"/></g><path d="M139 14 V106" stroke="#dcbfa8" stroke-width="4"/>`,
    board:`<rect x="16" width="74" height="66" rx="4" fill="#3a2b38"/><rect x="21" y="5" width="64" height="40" rx="2" fill="#b7a6dc"/><circle cx="53" cy="25" r="10" fill="#f3c969"/><text x="53" y="59" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="10" font-weight="700" fill="#fff">えいが</text>`,
    counter:{label:'', color:'#c98b5e', top:'#e7c49f'},
    prop:'<g transform="translate(4 14)"><path d="M0 4 h16 v10 a8 8 0 0 1 -16 0z" fill="#e8efe8"/><path d="M30 4 h16 v10 a8 8 0 0 1 -16 0z" fill="#e8efe8"/><path d="M6 -2 q2 -4 0 -8 M38 -2 q2 -4 0 -8" stroke="#ccc" stroke-width="1.5" fill="none"/></g>'},
  words:[
    {id:'issho',h:R('一緒','いっしょ')+'に',k:'いっしょに',r:'issho ni',pt:'juntos',en:'together',ic:'🤝',tip:'O っ pequeno é uma pausinha: i-ssho.'},
    {id:'konban',h:R('今晩','こんばん'),k:'こんばん',r:'konban',pt:'hoje à noite',en:'tonight',ic:'🌙',tip:'Parente de こんばんは (boa noite).'},
    {id:'ashita',h:R('明日','あした'),k:'あした',r:'ashita',pt:'amanhã',en:'tomorrow',ic:'📅',tip:'どようび = sábado, にちようび = domingo.'},
    {id:'eiga',h:R('映画','えいが'),k:'えいが',r:'eiga',pt:'filme',en:'movie',ic:'🎬',tip:'えいがを みます = ver um filme.'},
    {id:'gohan',h:'ご'+R('飯','はん'),k:'ごはん',r:'gohan',pt:'refeição, arroz',en:'meal, rice',ic:'🍚',tip:'ごはんを たべます = comer.'},
    {id:'ocha',h:'お'+R('茶','ちゃ'),k:'おちゃ',r:'ocha',pt:'chá',en:'tea',ic:'🍵',tip:'おちゃを のみます = tomar chá. Também é "um cafezinho" para conversar.'},
    {id:'iidesune',k:'いいですね',r:'ii desu ne',pt:'que bom! boa ideia!',en:'sounds good!',ic:'😊',tip:'O jeito animado de aceitar.'},
    {id:'chotto',k:'ちょっと…',r:'chotto…',pt:'é que… (recusa)',en:'well… (polite no)',ic:'😅',tip:'Dizer ちょっと… com a voz sumindo já é um "não" educado. Ninguém vai insistir.'}
  ],
  moldes:[
    {titulo:'"Vamos ___ juntos?"', tpl:'いっしょに <i>atividade</i> ませんか', tplRo:'issho ni [atividade]-masen ka', parts:[{k:'いっしょに',r:'issho ni',h:R('一緒','いっしょ')+'に'},0],
     slots:[[['えいがを みませんか|eiga o mimasen ka','Vamos ver um filme juntos?','Shall we watch a movie together?',R('映画','えいが')+'を '+R('見','み')+'ませんか'],['ごはんを たべませんか|gohan o tabemasen ka','Vamos comer juntos?','Shall we eat together?','ご'+R('飯','はん')+'を '+R('食','た')+'べませんか'],['おちゃを のみませんか|ocha o nomimasen ka','Vamos tomar um chá juntos?','Shall we have tea together?','お'+R('茶','ちゃ')+'を '+R('飲','の')+'みませんか']]],
     gram:'<b>〜ませんか</b> parece negativo ("não vamos…?"), mas é o jeito mais gentil de convidar.', use:'Na cena: convidar a Hana.'},
    {titulo:'"Que tal ___?"', tpl:'<i>quando</i> は どうですか', tplRo:'[quando] wa dō desu ka', parts:[0,'は|wa','どうですか|dō desu ka'],
     slots:[[['あした|ashita','Que tal amanhã?','How about tomorrow?',R('明日','あした')],['こんばん|konban','Que tal hoje à noite?','How about tonight?',R('今晩','こんばん')],['どようび|doyōbi','Que tal sábado?','How about Saturday?',R('土曜日','どようび')]]],
     gram:'<b>どうですか</b> = "que tal?". Serve para sugerir qualquer coisa.', use:'Na cena: sugerir um dia.'},
    {titulo:'"Que bom! Vamos ___!"', tpl:'いいですね！ <i>verbo</i>ましょう', tplRo:'ii desu ne! [verbo]-mashō', parts:['いいですね|ii desu ne',0],
     slots:[[['みましょう|mimashō','Que bom! Vamos ver!',"Sounds good! Let's watch!",R('見','み')+'ましょう'],['たべましょう|tabemashō','Que bom! Vamos comer!',"Sounds good! Let's eat!",R('食','た')+'べましょう'],['のみましょう|nomimashō','Que bom! Vamos tomar!',"Sounds good! Let's drink!",R('飲','の')+'みましょう']]],
     gram:'<b>〜ましょう</b> = "vamos…!". É a resposta animada para um 〜ませんか.', use:'Na cena: aceitar o convite.'},
    {titulo:'"___ não dá muito…"', tpl:'<i>quando</i> は ちょっと…', tplRo:'[quando] wa chotto…', parts:[0,'は|wa','ちょっと…|chotto…'],
     slots:[[['どようび|doyōbi','Sábado não dá muito…',"Saturday is a bit…",R('土曜日','どようび')],['あした|ashita','Amanhã não dá muito…',"Tomorrow is a bit…",R('明日','あした')],['こんばん|konban','Hoje à noite não dá muito…',"Tonight is a bit…",R('今晩','こんばん')]]],
     gram:'Em japonês quase nunca se diz "não" direto. <b>ちょっと…</b> deixa a frase no ar, e o outro entende.', use:'Na cena: recusar com jeitinho.'}
  ],
  cenas:[
    {q:'ひまですね〜。', say:'ひまですねー。', ro:'Hima desu ne~.', pt:'Que tédio, né…',
     ans:['いっしょに|issho ni','えいがを みませんか|eiga o mimasen ka'], extra:['ごはんを たべませんか|gohan o tabemasen ka','どうですか|dō desu ka'], tarefa:1, ansPt:'Vamos ver um filme juntas?', molde:0, dica:'Convide para ver um filme.', distr:['Que calor, né…','Que fome, né…']},
    {q:'いいですね！いつが いいですか？', say:'いいですね！いつが いいですか？', ro:'Ii desu ne! Itsu ga ii desu ka?', pt:'Boa! Quando é melhor?',
     ans:['あした|ashita','は|wa','どうですか|dō desu ka'], extra:['ちょっと…|chotto…','みましょう|mimashō'], ansPt:'Que tal amanhã?', molde:1, dica:'Sugira amanhã.', distr:['Boa! Onde vamos?','Boa! Que filme?']},
    {q:R('明日','あした')+'は ちょっと…。'+R('今晩','こんばん')+'は どうですか？', say:'あしたは ちょっと…。こんばんは どうですか？', ro:'Ashita wa chotto…. Konban wa dō desu ka?', pt:'Amanhã não dá muito… Que tal hoje à noite?',
     ans:['いいですね|ii desu ne','みましょう|mimashō'], extra:['のみましょう|nomimashō','ちょっと…|chotto…'], ansPt:'Que bom! Vamos ver!', molde:2, dica:'Hoje à noite está ótimo!', distr:['Amanhã está ótimo! Que horas?','Hoje à noite não dá. E amanhã?']},
    {q:R('土曜日','どようび')+'も '+R('会','あ')+'いませんか？', say:'どようびも あいませんか？', ro:'Doyōbi mo aimasen ka?', pt:'Vamos nos ver no sábado também?',
     ans:['どようび|doyōbi','は|wa','ちょっと…|chotto…'], extra:['いいですね|ii desu ne','どうですか|dō desu ka'], ansPt:'Sábado não dá muito…', molde:3, dica:'No sábado você já tem compromisso.', distr:['Vamos ao cinema no domingo?','Você trabalha no sábado?']},
    {q:R('残念','ざんねん')+'！じゃあ、'+R('映画','えいが')+'の あと、お'+R('茶','ちゃ')+'を '+R('飲','の')+'みませんか？', say:'ざんねん！じゃあ、えいがの あと、おちゃを のみませんか？', ro:'Zannen! Jā, eiga no ato, o-cha o nomimasen ka?', pt:'Que pena! Então, depois do filme, vamos tomar um chá?',
     ans:['いいですね|ii desu ne','のみましょう|nomimashō'], extra:['たべましょう|tabemashō','ちょっと…|chotto…'], ansPt:'Que bom! Vamos tomar!', molde:2, distr:['Que pena! Então vamos comer antes do filme?','Que pena! Então até a próxima.']}
  ]
};
})();
