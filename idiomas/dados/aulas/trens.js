(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).trens={
  slug:'trens', num:'04', titulo:'Trens', emoji:'🚆', jp:R('電車','でんしゃ'), h1:'Pegando o trem certo',
  fim:'Você descobriu o preço, a plataforma e a saída falando japonês.',
  intro:{titulo:'🚆 Rumo a Shinjuku',
    txt:['A estação parece um labirinto, mas no guichê tem sempre alguém para ajudar. Você quer ir até <b>しんじゅく</b> (Shinjuku).',
         'Vai precisar dizer para onde vai, perguntar o preço, a plataforma e onde fica a saída.'],
    metas:['dizer para onde quer ir','perguntar quanto custa','perguntar a plataforma','perguntar onde fica a saída ou a baldeação']},
  npc:{nome:'Funcionária da estação', sel:{hair:'nagai',hairColor:'kuro',face:'egao',clothes:'suutsu',clothColor:'kuro',acc:['megane','nekutai'],traits:[],skin:2},
    extra:'<path d="M66 90 Q120 34 174 90 Z" fill="#26324f"/><rect x="60" y="84" width="120" height="13" rx="6" fill="#d2463f"/><path d="M60 95 Q120 112 180 95 L176 100 Q120 116 64 100 Z" fill="#1b2546"/>'},
  cen:{wall:'#eef1f6', floor:'#d9dee8',
    back:`<rect x="14" y="20" width="250" height="78" rx="10" fill="#cfe6f3" stroke="#b8c2d6" stroke-width="4"/><g transform="translate(40 42)"><rect width="200" height="44" rx="12" fill="#fff"/><rect y="28" width="200" height="6" fill="#7fa487"/>${[0,1,2,3,4,5].map(k=>`<rect x="${12+k*31}" y="8" width="22" height="14" rx="3" fill="#7aa8d6"/>`).join('')}</g><rect x="14" y="94" width="250" height="6" fill="#b8c2d6"/>`,
    board:`<rect width="106" height="56" rx="8" fill="#26324f"/><text x="8" y="18" font-family="Zen Maru Gothic, sans-serif" font-size="9" font-weight="700" fill="#f3c969">3ばんせん</text><text x="62" y="18" font-family="Baloo 2, sans-serif" font-size="9" fill="#fff">10:05</text><text x="8" y="34" font-family="Zen Maru Gothic, sans-serif" font-size="9" fill="#9fd3a8">しんじゅく</text><text x="8" y="49" font-family="Zen Maru Gothic, sans-serif" font-size="8" fill="#cfd6e6">1ばんせん  10:12</text>`,
    counter:{label:'きっぷ', color:'#c7cfdf', top:'#e6ebf3'},
    prop:'<g transform="translate(12 18) rotate(-6)"><rect width="30" height="16" rx="2" fill="#f3e7c9"/><rect x="0" y="0" width="7" height="16" fill="#7aa8d6"/><path d="M11 6 h14 M11 10 h10" stroke="#7c6a78" stroke-width="1.5"/></g>'},
  words:[
    {id:'eki',h:R('駅','えき'),k:'えき',r:'eki',pt:'estação',en:'station',ic:'🚉',tip:'しんじゅくえき = estação Shinjuku.'},
    {id:'densha',h:R('電車','でんしゃ'),k:'でんしゃ',r:'densha',pt:'trem',en:'train',ic:'🚃',tip:'でん (eletricidade) + しゃ (veículo).'},
    {id:'kippu',h:R('切符','きっぷ'),k:'きっぷ',r:'kippu',pt:'bilhete',en:'ticket',ic:'🎫',tip:'O っ pequeno é uma pausinha: ki-ppu.'},
    {id:'ikitai',h:R('行','い')+'きたい',k:'いきたい',r:'ikitai',pt:'quero ir',en:'want to go',ic:'🧭',tip:'いく (ir) + たい (querer).'},
    {id:'ikura',k:'いくら',r:'ikura',pt:'quanto custa',en:'how much',ic:'💴',tip:'Vale para tudo: passagem, comida, lembrancinha.'},
    {id:'nanbansen',h:R('何番線','なんばんせん'),k:'なんばんせん',r:'nanbansen',pt:'qual plataforma',en:'which platform',ic:'🔢',tip:'ばんせん = plataforma número… 3ばんせん = plataforma 3.'},
    {id:'norikae',h:R('乗','の')+'り'+R('換','か')+'え',k:'のりかえ',r:'norikae',pt:'baldeação',en:'transfer',ic:'🔀',tip:'Trocar de trem ou de linha.'},
    {id:'deguchi',h:R('出口','でぐち'),k:'でぐち',r:'deguchi',pt:'saída',en:'exit',ic:'🚪',tip:'Estações grandes têm muitas saídas, com nomes como "saída leste".'}
  ],
  moldes:[
    {titulo:'"Quero ir a ___."', tpl:'<i>lugar</i> に いきたいです', tplRo:'[lugar] ni ikitai desu', parts:[0,'に|ni',{k:'いきたいです',r:'ikitai desu',h:R('行','い')+'きたいです'}],
     slots:[[['しんじゅく|Shinjuku','Quero ir a Shinjuku.','I want to go to Shinjuku.',R('新宿','しんじゅく')],['あさくさ|Asakusa','Quero ir a Asakusa.','I want to go to Asakusa.',R('浅草','あさくさ')],['きょうと|Kyōto','Quero ir a Kyoto.','I want to go to Kyoto.',R('京都','きょうと')]]],
     gram:'<b>に</b> aponta o destino, como o "a/para" do português.', use:'Na cena: dizer para onde você vai.'},
    {titulo:'"Quanto custa até ___?"', tpl:'<i>lugar</i> まで いくら ですか', tplRo:'[lugar] made ikura desu ka', parts:[0,'まで|made','いくら|ikura','ですか|desu ka'],
     slots:[[['しんじゅく|Shinjuku','Quanto custa até Shinjuku?','How much is it to Shinjuku?',R('新宿','しんじゅく')],['あさくさ|Asakusa','Quanto custa até Asakusa?','How much is it to Asakusa?',R('浅草','あさくさ')],['きょうと|Kyōto','Quanto custa até Kyoto?','How much is it to Kyoto?',R('京都','きょうと')]]],
     gram:'<b>まで</b> = até. <b>いくら</b> = quanto (dinheiro).', use:'Na cena: perguntar o preço.'},
    {titulo:'"Em que plataforma sai o ___?"', tpl:'<i>trem</i> は なんばんせん ですか', tplRo:'[trem] wa nanbansen desu ka', parts:[0,'は|wa',{k:'なんばんせん',r:'nanbansen',h:R('何番線','なんばんせん')},'ですか|desu ka'],
     slots:[[['でんしゃ|densha','Em que plataforma sai o trem?','Which platform is the train?',R('電車','でんしゃ')],['とっきゅう|tokkyū','Em que plataforma sai o expresso?','Which platform is the limited express?',R('特急','とっきゅう')],['しんかんせん|shinkansen','Em que plataforma sai o trem-bala?','Which platform is the bullet train?',R('新幹線','しんかんせん')]]],
     gram:'<b>なん</b> = o quê / qual. <b>ばんせん</b> = plataforma número.', use:'Na cena: achar a plataforma.'},
    {titulo:'"Onde fica ___?"', tpl:'<i>lugar</i> は どこ ですか', tplRo:'[lugar] wa doko desu ka', parts:[0,'は|wa','どこ|doko','ですか|desu ka'],
     slots:[[['でぐち|deguchi','Onde fica a saída?','Where is the exit?',R('出口','でぐち')],['のりかえ|norikae','Onde é a baldeação?','Where do I transfer?',R('乗','の')+'り'+R('換','か')+'え'],['トイレ|toire','Onde fica o banheiro?','Where is the restroom?']]],
     gram:'O mesmo molde do kombini: coisa + <b>は どこ ですか</b>.', use:'Na cena: achar a saída.'}
  ],
  cenas:[
    {q:'どちらまで ですか？', say:'どちらまで ですか？', ro:'Dochira made desu ka?', pt:'Até onde você vai?',
     ans:['しんじゅく|Shinjuku','に|ni','いきたいです|ikitai desu'], extra:['まで|made','は|wa','でぐち|deguchi'], ansPt:'Quero ir a Shinjuku.', molde:0, distr:['Quanto custa?','Onde fica a saída?']},
    {q:R('切符','きっぷ')+'ですね。', say:'きっぷですね。', ro:'Kippu desu ne.', pt:'Um bilhete, certo?',
     ans:['しんじゅく|Shinjuku','まで|made','いくら|ikura','ですか|desu ka'], extra:['に|ni','どこ|doko','でんしゃ|densha'], ansPt:'Quanto custa até Shinjuku?', molde:1, distr:['Uma baldeação, certo?','Uma saída, certo?']},
    {q:R('二百円','にひゃくえん')+'です。', say:'にひゃくえんです。', ro:'Nihyaku-en desu.', pt:'São 200 ienes.',
     ans:['でんしゃ|densha','は|wa','なんばんせん|nanbansen','ですか|desu ka'], extra:['いくら|ikura','に|ni','えき|eki'], ansPt:'Em que plataforma sai o trem?', molde:2, distr:['São 2.000 ienes.','É a plataforma 2.']},
    {q:R('三番線','さんばんせん')+'です。ほかに '+R('何','なに')+'か？', say:'さんばんせんです。ほかに なにか？', ro:'Sanbansen desu. Hoka ni nani ka?', pt:'É a plataforma 3. Mais alguma coisa?',
     ans:['でぐち|deguchi','は|wa','どこ|doko','ですか|desu ka'], extra:['まで|made','いきたいです|ikitai desu','を|o'], ansPt:'Onde fica a saída?', molde:3, distr:['É a plataforma 1. Boa viagem!','O trem sai às 3h.']}
  ]
};
})();
