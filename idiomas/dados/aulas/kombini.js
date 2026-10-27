(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).kombini={
  slug:'kombini', num:'03', titulo:'Konbini', emoji:'🏪', jp:'コンビニ', h1:'Lanche na loja de conveniência',
  fim:'Você comprou o seu lanche e respondeu todas as perguntas do caixa.',
  intro:{titulo:'🏪 Uma passadinha no konbini',
    txt:['O <b>コンビニ</b> (konbini) é a loja de conveniência aberta 24 horas. Lá você compra onigiri, bentô, bebidas, paga contas e saca dinheiro.',
         'O caixa fala rápido e faz sempre as mesmas perguntas: quer esquentar? quer sacola? tem cartão de pontos? Depois desta aula você vai reconhecer todas.'],
    metas:['perguntar onde fica alguma coisa','aceitar ou recusar com educação','dizer que não precisa de sacola','pedir o recibo']},
  npc:{nome:'Caixa', sel:{hair:'kurukuru',hairColor:'kuro',face:'egao',clothes:'tshirt',clothColor:'midori',acc:[],traits:[],skin:6},
    extra:'<path d="M70 252 h100" stroke="#fff" stroke-width="5" opacity=".8"/><rect x="140" y="238" width="22" height="12" rx="2" fill="#fff"/>'},
  cen:{wall:'#eef6f1', floor:'#dfe8e2',
    back:`${[0,1,2].map(r=>`<rect x="18" y="${18+r*30}" width="236" height="4" rx="2" fill="#b8c7bd"/>${[0,1,2,3,4,5,6,7,8,9].map(k=>`<rect x="${24+k*23}" y="${2+r*30}" width="16" height="16" rx="3" fill="${['#f19bb5','#f3c969','#7aa8d6','#8fb996','#e5605a'][(k+r)%5]}"/>`).join('')}`).join('')}`,
    board:`<rect width="106" height="40" rx="8" fill="#fff"/><rect y="6" width="106" height="8" fill="#7fa487"/><rect y="16" width="106" height="8" fill="#f3c969"/><rect y="26" width="106" height="8" fill="#7aa8d6"/><text x="53" y="54" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="11" font-weight="800" fill="#7fa487">24h OPEN</text>`,
    counter:{label:'レジ', color:'#cfdccf', top:'#eef3ee'},
    prop:'<g transform="translate(8 12)"><path d="M16 0 L32 26 H0 Z" fill="#fff" stroke="#ddd" stroke-width="1.5" stroke-linejoin="round"/><rect x="6" y="14" width="20" height="12" fill="#3a2b38"/></g>'},
  words:[
    {id:'onigiri',k:'おにぎり',r:'onigiri',pt:'bolinho de arroz',en:'rice ball',ic:'🍙',tip:'O lanche mais famoso do konbini.'},
    {id:'obentou',h:'お'+R('弁当','べんとう'),k:'おべんとう',r:'obentō',pt:'marmita (bentô)',en:'boxed meal',ic:'🍱',tip:'O caixa costuma perguntar se quer esquentar.'},
    {id:'atatamemasu',h:R('温','あたた')+'めます',k:'あたためます',r:'atatamemasu',pt:'esquentar',en:'to heat up',ic:'🔥',tip:'Você vai ouvir como pergunta: あたためますか？'},
    {id:'fukuro',h:R('袋','ふくろ'),k:'ふくろ',r:'fukuro',pt:'sacola',en:'bag',ic:'🛍️',tip:'As sacolas são pagas no Japão, por isso o caixa sempre pergunta.'},
    {id:'ohashi',h:'お'+R('箸','はし'),k:'おはし',r:'ohashi',pt:'hashi (palitinhos)',en:'chopsticks',ic:'🥢',tip:'O お na frente é só educação.'},
    {id:'reshiito',k:'レシート',r:'reshīto',pt:'recibo',en:'receipt',ic:'🧾',tip:'Do inglês "receipt".'},
    {id:'iranai',k:'いらないです',r:'iranai desu',pt:'não preciso',en:"I don't need it",ic:'🙅',tip:'Uma forma simples e educada de recusar.'},
    {id:'pointokaado',k:'ポイントカード',r:'pointo kādo',pt:'cartão de pontos',en:'point card',ic:'💳',tip:'Turista quase nunca tem. Responder いいえ basta.'}
  ],
  moldes:[
    {titulo:'"Onde fica ___?"', tpl:'<i>coisa</i> は どこ ですか', tplRo:'[coisa] wa doko desu ka', parts:[0,'は|wa','どこ|doko','ですか|desu ka'],
     slots:[[['おにぎり|onigiri','Onde ficam os onigiris?','Where are the rice balls?'],['ATM|ē-tī-emu','Onde fica o caixa eletrônico?','Where is the ATM?'],['トイレ|toire','Onde fica o banheiro?','Where is the restroom?']]],
     gram:'<b>どこ</b> = onde. Este molde funciona em qualquer lugar do Japão.', use:'Na cena: achar os onigiris.'},
    {titulo:'Aceitar ou recusar', tpl:'<i>sim ou não</i>', tplRo:'[resposta]', parts:[0],
     slots:[[['はい、おねがいします|hai, onegaishimasu','Sim, por favor.','Yes, please.'],['いいえ、だいじょうぶです|iie, daijōbu desu','Não, obrigada (estou bem).',"No, I'm fine."]]],
     gram:'<b>だいじょうぶです</b> quer dizer "está tudo bem". Usado para recusar, soa mais gentil que um "não" seco.', use:'Na cena: responder se quer esquentar e o cartão de pontos.'},
    {titulo:'"Não preciso de ___."', tpl:'<i>coisa</i> は いらないです', tplRo:'[coisa] wa iranai desu', parts:[0,'は|wa','いらないです|iranai desu'],
     slots:[[['ふくろ|fukuro','Não preciso de sacola.',"I don't need a bag.",R('袋','ふくろ')],['おはし|ohashi','Não preciso de hashi.',"I don't need chopsticks.",'お'+R('箸','はし')],['レシート|reshīto','Não preciso do recibo.',"I don't need the receipt."]]],
     gram:'<b>いらない</b> = não precisa. O <b>です</b> no fim deixa educado.', use:'Na cena: recusar a sacola.'},
    {titulo:'"___, por favor (me dê)."', tpl:'<i>coisa</i> を ください', tplRo:'[coisa] o kudasai', parts:[0,'を|o','ください|kudasai'],
     slots:[[['レシート|reshīto','O recibo, por favor.','The receipt, please.'],['おにぎり|onigiri','Um onigiri, por favor.','A rice ball, please.'],['おはし|ohashi','Hashi, por favor.','Chopsticks, please.','お'+R('箸','はし')]]],
     gram:'<b>ください</b> = "me dê, por favor". Parecido com おねがいします, mas só para coisas.', use:'Na cena: pedir o recibo.'}
  ],
  cenas:[
    {q:'いらっしゃいませー！', say:'いらっしゃいませー！', ro:'Irasshaimasē!', pt:'Bem-vindo! (cumprimento da loja)',
     ans:['おにぎり|onigiri','は|wa','どこ|doko','ですか|desu ka'], extra:['を|o','ください|kudasai','ふくろ|fukuro'], tarefa:1, ansPt:'Onde ficam os onigiris?', molde:0, dica:'Pergunte onde ficam os onigiris.', distr:['Obrigado, volte sempre!','Com licença, um momento.']},
    {q:'お'+R('弁当','べんとう')+'は '+R('温','あたた')+'めますか？', say:'おべんとうは あたためますか？', ro:'O-bentō wa atatamemasu ka?', pt:'Quer que esquente o bentô?',
     ans:['はい、おねがいします|hai, onegaishimasu'], extra:['いいえ、だいじょうぶです|iie, daijōbu desu','いらないです|iranai desu'], ansPt:'Sim, por favor.', molde:1, dica:'Você quer o bentô quentinho.', distr:['Quer uma sacola?','O bentô custa 500 ienes.']},
    {q:R('袋','ふくろ')+'は ご'+R('利用','りよう')+'ですか？', say:'ふくろは ごりようですか？', ro:'Fukuro wa go-riyō desu ka?', pt:'Vai usar sacola?',
     ans:['ふくろ|fukuro','は|wa','いらないです|iranai desu'], extra:['を|o','ください|kudasai','おはし|ohashi'], ansPt:'Não preciso de sacola.', molde:2, distr:['Quer esquentar?','Tem cartão de pontos?']},
    {q:'ポイントカードは お'+R('持','も')+'ちですか？', say:'ポイントカードは おもちですか？', ro:'Pointo kādo wa o-mochi desu ka?', pt:'Tem cartão de pontos?',
     ans:['いいえ、だいじょうぶです|iie, daijōbu desu'], extra:['はい、おねがいします|hai, onegaishimasu','レシート|reshīto'], ansPt:'Não, obrigada.', molde:1, distr:['Vai pagar com cartão?','Quer o recibo?']},
    {q:R('以上','いじょう')+'で よろしいですか？', say:'いじょうで よろしいですか？', ro:'Ijō de yoroshii desu ka?', pt:'É só isso?',
     ans:['レシート|reshīto','を|o','ください|kudasai'], extra:['は|wa','いらないです|iranai desu','どこ|doko'], tarefa:1, ansPt:'O recibo, por favor.', molde:3, dica:'Peça o recibo.', distr:['Quer hashi?','Onde fica o caixa eletrônico?']}
  ]
};
})();
