(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).hotel={
  slug:'hotel', num:'01', titulo:'Hotel', emoji:'🏨', jp:'ホテル', h1:'Fazendo o check-in',
  fim:'Você fez o check-in e resolveu tudo no quarto em japonês.',
  intro:{titulo:'🏨 Chegou ao hotel!',
    txt:['Depois do voo, você chega ao hotel cansada e com a mala. Na recepção (<b>フロント</b>, "front") a recepcionista vai pedir o seu nome, perguntar quantas noites você fica e te entregar a chave.',
         'Depois, no quarto, algo não funciona… e você vai precisar avisar. Vamos com calma: palavras, moldes, ouvido e só então a conversa.'],
    metas:['dizer seu nome e quantas noites vai ficar','perguntar o horário do café da manhã','pedir uma toalha (ou qualquer coisa)','avisar que algo quebrou no quarto']},
  npc:{nome:'Recepcionista', sel:{hair:'odango',hairColor:'kuro',face:'egao',clothes:'suutsu',clothColor:'murasaki',acc:['ribon'],traits:[],skin:2}},
  svgi:{taoru:'<rect x="16" y="56" width="68" height="16" rx="6" fill="#cfe6f3"/><rect x="20" y="40" width="60" height="18" rx="6" fill="#f8dde1"/><rect x="24" y="24" width="52" height="18" rx="6" fill="#e8efe8"/><path d="M24 33h52M20 49h60M16 64h68" stroke="#fff" stroke-width="2" opacity=".8"/>'},
  cen:{wall:'#f7efe4', floor:'#e9dccb', meProp:'svg:nimotsu',
    back:`<rect x="24" y="16" width="96" height="70" rx="6" fill="#fff" stroke="#d9c3a8" stroke-width="5"/><path d="M30 78 L62 38 L80 58 L92 46 L114 78 Z" fill="#9cc3dd"/><path d="M52 50 L62 38 L72 50 L66 47 L62 51 L58 47 Z" fill="#fff"/><circle cx="100" cy="30" r="7" fill="#f3c969"/>
      <g transform="translate(160 40)"><path d="M18 58 h28 l-4 30 h-20 z" fill="#c98b5e"/><ellipse cx="32" cy="46" rx="22" ry="16" fill="#8fb996"/><ellipse cx="20" cy="30" rx="12" ry="16" fill="#7fa487"/><ellipse cx="44" cy="30" rx="12" ry="16" fill="#7fa487"/></g>`,
    board:`<rect width="106" height="56" rx="8" fill="#b98a5e"/><text x="53" y="16" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="10" font-weight="700" fill="#fff">KEYS</text>${[0,1,2,3,4].map(k=>`<g transform="translate(${12+k*19} 24)"><circle r="3" fill="#f3c969"/><path d="M0 3 v12" stroke="#f3c969" stroke-width="2.5"/><path d="M0 12 h4 M0 15 h3" stroke="#f3c969" stroke-width="2"/></g>`).join('')}`,
    counter:{label:'フロント', color:'#d9c3a8', top:'#f3e7d6'},
    prop:'<g transform="translate(14 18)"><path d="M2 20 a14 14 0 0 1 28 0z" fill="#e3b341"/><rect x="-2" y="19" width="36" height="5" rx="2" fill="#b98a2a"/><circle cx="16" cy="5" r="3" fill="#b98a2a"/></g>'},
  words:[
    {id:'yoyaku',h:R('予約','よやく'),k:'よやく',r:'yoyaku',pt:'reserva',en:'reservation',ic:'svg:yoyaku',tip:'Você já viu no aeroporto. No hotel ela volta!'},
    {id:'nihaku',h:R('二泊','にはく'),k:'にはく',r:'nihaku',pt:'duas noites',en:'two nights',ic:'🌙',tip:'泊 (haku) conta noites de hospedagem. O som muda: いっぱく, にはく, さんぱく. Veja de 1 a 10 noites em <a href="/idiomas/numeros/#haku" target="_blank" rel="noopener">contagem de noites →</a>'},
    {id:'kagi',h:R('鍵','かぎ'),k:'かぎ',r:'kagi',pt:'chave',en:'key',ic:'🔑',tip:'Em hotel moderno a "chave" pode ser um cartão, mas a palavra continua かぎ.'},
    {id:'choushoku',h:R('朝食','ちょうしょく'),k:'ちょうしょく',r:'chōshoku',pt:'café da manhã',en:'breakfast',ic:'🍳',tip:'Palavra de hotel e restaurante. Em casa se diz あさごはん.'},
    {id:'nanji',h:R('何時','なんじ'),k:'なんじ',r:'nanji',pt:'que horas',en:'what time',ic:'🕙',tip:'なん (o quê) + じ (hora) = que horas.'},
    {id:'taoru',k:'タオル',r:'taoru',pt:'toalha',en:'towel',ic:'svg:taoru',tip:'Vem do inglês "towel".'},
    {id:'eakon',k:'エアコン',r:'eakon',pt:'ar-condicionado',en:'air conditioner',ic:'❄️',tip:'Abreviação japonesa de "air conditioner".'},
    {id:'kowaremashita',h:R('壊','こわ')+'れました',k:'こわれました',r:'kowaremashita',pt:'quebrou',en:'broke',ic:'🔧',tip:'O final -ました indica passado educado.'},
    {id:'namae',h:R('名前','なまえ'),k:'なまえ',r:'namae',pt:'nome',en:'name',ic:'🪪',tip:'おなまえは？ = o seu nome? O お na frente é educação.'},
    {id:'heya',h:R('部屋','へや'),k:'へや',r:'heya',pt:'quarto',en:'room',ic:'🛏️',tip:'Quem atende diz おへや, com お de educação.'},
    {id:'ikaga',k:'いかが',r:'ikaga',pt:'que tal / como está (educado)',en:'how is it',ic:'💭',tip:'おへやは いかがですか？ = como está o quarto?'},
    {id:'hokani',k:'ほかに',r:'hoka ni',pt:'mais alguma coisa',en:'anything else',ic:'➕',tip:'ほかに なにか ございますか？ = precisa de mais alguma coisa?'}
  ],
  moldes:[
    {titulo:'"São ___ noites."', tpl:'<i>noites</i> です', tplRo:'[noites] desu', parts:[0,'です|desu'],
     slots:[[['いっぱく|ippaku','É uma noite.','One night.',R('一泊','いっぱく')],['にはく|nihaku','São duas noites.','Two nights.',R('二泊','にはく')],['さんぱく|sanpaku','São três noites.','Three nights.',R('三泊','さんぱく')]]],
     gram:'O contador de noites <b>泊</b> muda de som com o número: <b>いっぱく</b> (1), <b>にはく</b> (2), <b>さんぱく</b> (3). Não precisa decorar todos agora: ouça e repita.', use:'Na cena: dizer quantas noites você fica.'},
    {titulo:'"___, por favor."', tpl:'<i>coisa</i> を おねがいします', tplRo:'[coisa] o onegaishimasu', parts:[0,'を|o','おねがいします|onegaishimasu'],
     slots:[[['タオル|taoru','Uma toalha, por favor.','A towel, please.'],['かぎ|kagi','A chave, por favor.','The key, please.',R('鍵','かぎ')],['チェックアウト|chekku-auto','Check-out, por favor.','Check-out, please.']]],
     gram:'<b>を おねがいします</b> serve para pedir quase tudo com educação. A partícula <b>を</b> se lê <b>o</b> e marca a coisa pedida.', use:'Na cena: pedir uma toalha.'},
    {titulo:'"A que horas é ___?"', tpl:'<i>coisa</i> は なんじ ですか', tplRo:'[coisa] wa nanji desu ka', parts:[0,'は|wa',{k:'なんじ',r:'nanji',h:R('何時','なんじ')},'ですか|desu ka'],
     slots:[[['ちょうしょく|chōshoku','A que horas é o café da manhã?','What time is breakfast?',R('朝食','ちょうしょく')],['チェックアウト|chekku-auto','A que horas é o check-out?','What time is check-out?'],['チェックイン|chekku-in','A que horas é o check-in?','What time is check-in?']]],
     gram:'<b>か</b> no fim transforma a frase em pergunta. É como o ponto de interrogação falado.', use:'Na cena: perguntar o horário do café.'},
    {titulo:'"___ quebrou."', tpl:'<i>coisa</i> が こわれました', tplRo:'[coisa] ga kowaremashita', parts:[0,'が|ga',{k:'こわれました',r:'kowaremashita',h:R('壊','こわ')+'れました'}],
     slots:[[['エアコン|eakon','O ar-condicionado quebrou.','The air conditioner is broken.'],['テレビ|terebi','A TV quebrou.','The TV is broken.'],['シャワー|shawā','O chuveiro quebrou.','The shower is broken.']]],
     gram:'<b>が</b> aponta quem fez a ação (aqui, quem quebrou). <b>こわれました</b> = quebrou.', use:'Na cena: avisar do problema no quarto.'}
  ],
  cenas:[
    {q:'ご'+R('予約','よやく')+'の お'+R('名前','なまえ')+'は？', say:'ごよやくの おなまえは？', ro:'Go-yoyaku no o-namae wa?', pt:'Qual o nome da reserva?',
     ans:['{NOME}|{NOMERO}','です|desu'], extra:['よやく|yoyaku','を|o','かぎ|kagi'], ansPt:'Sou {NOMERO}. (seu nome + です)', molde:null, dica:'Diga o seu nome + です.', distr:['Qual é o número do quarto?','Quantas pessoas?']},
    {q:R('何泊','なんぱく')+'の ご'+R('予定','よてい')+'ですか？', say:'なんぱくの ごよていですか？', ro:'Nanpaku no go-yotei desu ka?', pt:'Quantas noites pretende ficar?',
     ans:['にはく|nihaku','です|desu'], extra:['いっぱく|ippaku','タオル|taoru','を|o'], ansPt:'São duas noites.', molde:0, distr:['A que horas é o check-out?','Tem reserva?']},
    {q:'こちらが お'+R('部屋','へや')+'の '+R('鍵','かぎ')+'です。', say:'こちらが おへやの かぎです。', ro:'Kochira ga o-heya no kagi desu.', pt:'Aqui está a chave do seu quarto.',
     ans:['ちょうしょく|chōshoku','は|wa','なんじ|nanji','ですか|desu ka'], extra:['が|ga','エアコン|eakon','です|desu'], tarefa:1, ansPt:'A que horas é o café da manhã?', molde:2, distr:['O quarto fica no terceiro andar.','Onde está a sua mala?']},
    {q:R('朝食','ちょうしょく')+'は '+R('七時','しちじ')+'からです。ほかに '+R('何','なに')+'か ございますか？', say:'ちょうしょくは しちじからです。ほかに なにか ございますか？', ro:'Chōshoku wa shichi-ji kara desu. Hoka ni nani ka gozaimasu ka?', pt:'O café é a partir das 7h. Precisa de mais alguma coisa?',
     ans:['タオル|taoru','を|o','おねがいします|onegaishimasu'], extra:['は|wa','かぎ|kagi','こわれました|kowaremashita'], tarefa:1, ansPt:'Uma toalha, por favor.', molde:1, distr:['O café é às 9h. Pode pagar agora?','O check-out é às 7h.']},
    {quem:'Recepcionista (no dia seguinte)', q:'お'+R('部屋','へや')+'は いかがですか？', say:'おへやは いかがですか？', ro:'O-heya wa ikaga desu ka?', pt:'Como está o quarto?',
     ans:['エアコン|eakon','が|ga','こわれました|kowaremashita'], extra:['を|o','タオル|taoru','です|desu'], tarefa:1, ansPt:'O ar-condicionado quebrou.', molde:3, distr:['Onde fica o seu quarto?','Quer trocar de quarto?']}
  ]
};
})();
