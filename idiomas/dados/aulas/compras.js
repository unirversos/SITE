(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).compras={
  slug:'compras', num:'05', titulo:'Compras', emoji:'🛍️', jp:R('買','か')+'い'+R('物','もの'), h1:'Lembrancinhas para levar',
  fim:'Você escolheu, negociou o desconto e pagou falando japonês.',
  intro:{titulo:'🎁 Hora das lembrancinhas',
    txt:['Você entra numa lojinha cheia de <b>おみやげ</b> (lembrancinhas) para levar ao Brasil.',
         'Vai perguntar se tem lembrancinhas, quanto custa, se tem desconto, escolher e pagar. E vai aprender o trio mais útil do japonês: <b>これ・それ・あれ</b>.'],
    metas:['perguntar se a loja tem alguma coisa','perguntar o preço com これ / それ / あれ','dizer qual vai levar','dizer como vai pagar']},
  npc:{nome:'Vendedora', sel:{hair:'mitsuami',hairColor:'chairo',face:'egao',clothes:'seetaa',clothColor:'pinku',acc:[],traits:['sobakasu'],skin:4}},
  cen:{wall:'#fdf0f2', floor:'#efdcd8',
    back:`${[0,1].map(r=>`<rect x="18" y="${44+r*44}" width="236" height="5" rx="2" fill="#d9b9b0"/>${[0,1,2,3,4,5,6].map(k=>`<g transform="translate(${26+k*33} ${18+r*44})"><rect width="24" height="26" rx="3" fill="${['#f19bb5','#f3c969','#7aa8d6','#8fb996','#b7a6dc'][(k+r*2)%5]}"/><path d="M12 0 v26 M0 12 h24" stroke="#fff" stroke-width="3"/></g>`).join('')}`).join('')}`,
    board:`<rect width="106" height="50" rx="10" fill="#d9506f"/><text x="53" y="22" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="14" font-weight="800" fill="#fff">SALE</text><text x="53" y="40" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="10" font-weight="700" fill="#fff">わりびき 20%</text>`,
    counter:{label:'レジ', color:'#e6c9c2', top:'#f6e6e2'},
    prop:'<g transform="translate(10 8)"><rect y="8" width="30" height="22" rx="3" fill="#7aa8d6"/><rect x="12" y="8" width="6" height="22" fill="#f3c969"/><path d="M15 8 q-10 -10 -12 0 M15 8 q10 -10 12 0" fill="none" stroke="#f3c969" stroke-width="3"/></g>'},
  words:[
    {id:'omiyage',h:'お'+R('土産','みやげ'),k:'おみやげ',r:'omiyage',pt:'lembrancinha',en:'souvenir',ic:'🎁',tip:'No Japão é tradição trazer おみやげ das viagens para a família e o trabalho.'},
    {id:'kore',k:'これ',r:'kore',pt:'isto (perto de mim)',en:'this',ic:'👇',tip:'これ = perto de quem fala.'},
    {id:'sore',k:'それ',r:'sore',pt:'isso (perto de você)',en:'that (near you)',ic:'👉',tip:'それ = perto de quem escuta.'},
    {id:'are',k:'あれ',r:'are',pt:'aquilo (longe)',en:'that (over there)',ic:'🔭',tip:'あれ = longe dos dois.'},
    {id:'ikura',k:'いくら',r:'ikura',pt:'quanto custa',en:'how much',ic:'💴',tip:'Você já viu nos trens!'},
    {id:'waribiki',h:R('割引','わりびき'),k:'わりびき',r:'waribiki',pt:'desconto',en:'discount',ic:'🏷️',tip:'にわりびき = 20% de desconto (わり = 10%).'},
    {id:'kaado',k:'カード',r:'kādo',pt:'cartão',en:'card',ic:'💳',tip:'Cartão de crédito ou débito.'},
    {id:'genkin',h:R('現金','げんきん'),k:'げんきん',r:'genkin',pt:'dinheiro vivo',en:'cash',ic:'💵',tip:'Algumas lojas pequenas só aceitam げんきん.'}
  ],
  moldes:[
    {titulo:'"Tem ___?"', tpl:'<i>coisa</i> は ありますか', tplRo:'[coisa] wa arimasu ka', parts:[0,'は|wa','ありますか|arimasu ka'],
     slots:[[['おみやげ|omiyage','Tem lembrancinhas?','Do you have souvenirs?','お'+R('土産','みやげ')],['わりびき|waribiki','Tem desconto?','Is there a discount?',R('割引','わりびき')],['タックスフリー|takkusu furī','Tem isenção de imposto?','Is it tax-free?']]],
     gram:'<b>ありますか</b> = "tem?". Lembra do <b>あります</b> do aeroporto? Com <b>か</b> vira pergunta.', use:'Na cena: perguntar por lembrancinhas e desconto.'},
    {titulo:'"Quanto custa ___?"', tpl:'<i>これ / それ / あれ</i> は いくら ですか', tplRo:'[kore/sore/are] wa ikura desu ka', parts:[0,'は|wa','いくら|ikura','ですか|desu ka'],
     slots:[[['これ|kore','Quanto custa isto (aqui comigo)?','How much is this?'],['それ|sore','Quanto custa isso (aí com você)?','How much is that?'],['あれ|are','Quanto custa aquilo (lá longe)?','How much is that over there?']]],
     gram:'<b>これ</b> perto de mim, <b>それ</b> perto de você, <b>あれ</b> longe dos dois. O português tem o mesmo trio: isto, isso, aquilo.', use:'Na cena: perguntar o preço.'},
    {titulo:'"Vou levar ___."', tpl:'<i>これ / それ / あれ</i> に します', tplRo:'[kore/sore/are] ni shimasu', parts:[0,'に|ni','します|shimasu'],
     slots:[[['これ|kore','Vou levar este.',"I'll take this one."],['それ|sore','Vou levar esse.',"I'll take that one."],['あれ|are','Vou levar aquele.',"I'll take the one over there."]]],
     gram:'O mesmo <b>に します</b> do restaurante: "decido por…".', use:'Na cena: escolher o que vai levar.'},
    {titulo:'"Com ___, por favor."', tpl:'<i>pagamento</i> で おねがいします', tplRo:'[pagamento] de onegaishimasu', parts:[0,'で|de','おねがいします|onegaishimasu'],
     slots:[[['カード|kādo','Com cartão, por favor.','By card, please.'],['げんきん|genkin','Em dinheiro, por favor.','In cash, please.',R('現金','げんきん')]]],
     gram:'<b>で</b> marca o meio: com cartão, de trem, em japonês (<b>にほんごで</b>).', use:'Na cena: dizer como vai pagar.'}
  ],
  cenas:[
    {q:'いらっしゃいませ！'+R('何','なに')+'か お'+R('探','さが')+'しですか？', say:'いらっしゃいませ！なにか おさがしですか？', ro:'Irasshaimase! Nani ka o-sagashi desu ka?', pt:'Bem-vinda! Procura alguma coisa?',
     ans:['おみやげ|omiyage','は|wa','ありますか|arimasu ka'], extra:['いくら|ikura','で|de','これ|kore'], ansPt:'Tem lembrancinhas?', molde:0, distr:['Bem-vinda! Vai pagar com cartão?','Bem-vinda! Quer uma sacola?']},
    {q:'こちらは いかがですか？', say:'こちらは いかがですか？', ro:'Kochira wa ikaga desu ka?', pt:'Que tal estes aqui?',
     ans:['これ|kore','は|wa','いくら|ikura','ですか|desu ka'], extra:['に|ni','します|shimasu','あれ|are'], ansPt:'Quanto custa isto?', molde:1, dica:'Você está segurando a lembrancinha.', distr:['Este é o mais barato.','Onde você mora?']},
    {q:R('千五百円','せんごひゃくえん')+'です。', say:'せんごひゃくえんです。', ro:'Sen-gohyaku-en desu.', pt:'São 1.500 ienes.',
     ans:['わりびき|waribiki','は|wa','ありますか|arimasu ka'], extra:['げんきん|genkin','で|de','それ|sore'], ansPt:'Tem desconto?', molde:0, distr:['São 5.000 ienes.','São 150 ienes.']},
    {q:R('今日','きょう')+'は '+R('二割引','にわりびき')+'です！どれに なさいますか？', say:'きょうは にわりびきです！どれに なさいますか？', ro:'Kyō wa niwaribiki desu! Dore ni nasaimasu ka?', pt:'Hoje tem 20% de desconto! Qual vai levar?',
     ans:['あれ|are','に|ni','します|shimasu'], extra:['は|wa','いくら|ikura','おみやげ|omiyage'], ansPt:'Vou levar aquele (lá na prateleira).', molde:2, dica:'Você quer aquele, lá longe na prateleira.', distr:['Hoje a loja fecha cedo!','Hoje não tem desconto.']},
    {q:'お'+R('支払','しはら')+'いは どう なさいますか？', say:'おしはらいは どう なさいますか？', ro:'O-shiharai wa dō nasaimasu ka?', pt:'Como vai pagar?',
     ans:['カード|kādo','で|de','おねがいします|onegaishimasu'], extra:['に|ni','を|o','げんきん|genkin'], ansPt:'Com cartão, por favor.', molde:3, dica:'Pague com cartão.', distr:['Quer embrulhar para presente?','Quantos vai levar?']}
  ]
};
})();
