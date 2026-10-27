(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).horas={
  slug:'horas', num:'09', titulo:'Horas', emoji:'🕒', jp:R('時間','じかん'), h1:'Marcando um horário',
  fim:'Você perguntou horários e marcou a visita falando japonês.',
  intro:{titulo:'🕒 Visita ao museu',
    txt:['Você chegou ao balcão de um museu. Quer saber até que horas ele fica aberto e marcar uma visita guiada.',
         'Horas em japonês são fáceis: número + <b>じ</b>. Só alguns números mudam o som, e você vai aprender exatamente esses.'],
    metas:['dizer que horas são','dizer horas e meia','marcar um dia e um horário','perguntar até que horas algo fica aberto']},
  npc:{nome:'Recepção do museu', sel:{hair:'nagai',hairColor:'chairo',face:'egao',clothes:'suutsu',clothColor:'midori',acc:['megane'],traits:[],skin:3}},
  cen:{wall:'#f2f0f7', floor:'#dedbe8',
    back:`<g transform="translate(80 58)"><circle r="44" fill="#fff" stroke="#b7a6dc" stroke-width="6"/>${[...Array(12)].map((_,k)=>{const a=k*Math.PI/6;return `<circle cx="${(36*Math.sin(a)).toFixed(1)}" cy="${(-36*Math.cos(a)).toFixed(1)}" r="${k%3?2:3.5}" fill="#7c6a78"/>`}).join('')}<path d="M0 0 L0 -26" stroke="#3a2b38" stroke-width="4" stroke-linecap="round"/><path d="M0 0 L22 10" stroke="#3a2b38" stroke-width="5" stroke-linecap="round" transform="rotate(-100)"/><circle r="4" fill="#d9506f"/></g>
      <g transform="translate(160 22)"><rect width="90" height="70" rx="4" fill="#fff" stroke="#c9c1d8" stroke-width="4"/><path d="M8 62 L36 26 L56 46 L68 36 L84 62 Z" fill="#b7a6dc"/><circle cx="68" cy="18" r="7" fill="#f3c969"/></g>`,
    board:`<rect width="106" height="54" rx="8" fill="#fff" stroke="#b7a6dc" stroke-width="3"/><text x="53" y="20" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="10" font-weight="700" fill="#7c6a78">びじゅつかん</text><text x="53" y="40" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="13" font-weight="800" fill="#3a2b38">9:00 – 17:00</text>`,
    counter:{label:'うけつけ', color:'#d2cce0', top:'#ece9f3'},
    prop:'<g transform="translate(10 16) rotate(-6)"><rect width="30" height="20" rx="2" fill="#fff" stroke="#c9c1d8"/><rect x="3" y="3" width="11" height="14" fill="#b7a6dc"/><path d="M17 6 h10 M17 10 h10 M17 14 h7" stroke="#c9c1d8" stroke-width="1.5"/></g>'},
  words:[
    {id:'ima',h:R('今','いま'),k:'いま',r:'ima',pt:'agora',en:'now',ic:'⏰',tip:'いま なんじ ですか？ = Que horas são agora?'},
    {id:'nanji',h:R('何時','なんじ'),k:'なんじ',r:'nanji',pt:'que horas',en:'what time',ic:'🕒',tip:'Você viu no hotel!'},
    {id:'yoji',h:R('四時','よじ'),k:'よじ',r:'yoji',pt:'quatro horas',en:'four o\'clock',ic:'🕓',tip:'Atenção: 4 horas é よじ (e não よんじ nem しじ).'},
    {id:'kuji',h:R('九時','くじ'),k:'くじ',r:'kuji',pt:'nove horas',en:'nine o\'clock',ic:'🕘',tip:'9 horas é くじ (e não きゅうじ). 7 horas é しちじ.'},
    {id:'han',h:R('半','はん'),k:'はん',r:'han',pt:'e meia',en:'half past',ic:'🕧',tip:'さんじ はん = três e meia.'},
    {id:'kyou',h:R('今日','きょう'),k:'きょう',r:'kyō',pt:'hoje',en:'today',ic:'☀️',tip:'Leitura especial: não se lê pelos kanjis separados.'},
    {id:'ashita',h:R('明日','あした'),k:'あした',r:'ashita',pt:'amanhã',en:'tomorrow',ic:'📅',tip:'Outra leitura especial.'},
    {id:'made',k:'まで',r:'made',pt:'até',en:'until',ic:'🏁',tip:'から = desde; まで = até. くじ から ごじ まで = das 9 às 5.'}
  ],
  moldes:[
    {titulo:'"Agora são ___."', tpl:'いま <i>hora</i> です', tplRo:'ima [hora] desu', parts:[{k:'いま',r:'ima',h:R('今','いま')},0,'です|desu'],
     slots:[[['いちじ|ichiji','Agora é uma hora.',"It's one o'clock now.",R('一時','いちじ')],['よじ|yoji','Agora são quatro horas.',"It's four o'clock now.",R('四時','よじ')],['くじ|kuji','Agora são nove horas.',"It's nine o'clock now.",R('九時','くじ')]]],
     gram:'Hora = número + <b>じ</b>. Os especiais: <b>よじ</b> (4), <b>しちじ</b> (7), <b>くじ</b> (9).', use:'Na cena: dizer que horas são.'},
    {titulo:'"São ___ e meia."', tpl:'<i>hora</i> はん です', tplRo:'[hora] han desu', parts:[0,{k:'はん',r:'han',h:R('半','はん')},'です|desu'],
     slots:[[['にじ|niji','São duas e meia.',"It's two thirty.",R('二時','にじ')],['しちじ|shichiji','São sete e meia.',"It's seven thirty.",R('七時','しちじ')],['じゅうじ|jūji','São dez e meia.',"It's ten thirty.",R('十時','じゅうじ')]]],
     gram:'<b>はん</b> = metade. Vem logo depois da hora.', use:'Na cena: dizer a que horas você chega.'},
    {titulo:'"___, às ___, por favor."', tpl:'<i>dia</i> の <i>hora</i> に おねがいします', tplRo:'[dia] no [hora] ni onegaishimasu', parts:[0,'の|no',1,'に|ni','おねがいします|onegaishimasu'], pt:'{0}, às {1}, por favor.', en:'{0} at {1}, please.',
     slots:[[['あした|ashita','Amanhã','Tomorrow',R('明日','あした')],['きょう|kyō','Hoje','Today',R('今日','きょう')]],[['さんじ|sanji','3h','3:00',R('三時','さんじ')],['ごじ|goji','5h','5:00',R('五時','ごじ')]]],
     gram:'<b>の</b> liga o dia à hora ("de amanhã, às 3"). <b>に</b> marca o momento.', use:'Na cena: marcar a visita guiada.'},
    {titulo:'"Até que horas abre ___?"', tpl:'<i>lugar</i> は なんじ まで ですか', tplRo:'[lugar] wa nanji made desu ka', parts:[0,'は|wa',{k:'なんじ',r:'nanji',h:R('何時','なんじ')},'まで|made','ですか|desu ka'],
     slots:[[['びじゅつかん|bijutsukan','Até que horas abre o museu?','Until what time is the museum open?',R('美術館','びじゅつかん')],['みせ|mise','Até que horas abre a loja?','Until what time is the shop open?',R('店','みせ')],['ぎんこう|ginkō','Até que horas abre o banco?','Until what time is the bank open?',R('銀行','ぎんこう')]]],
     gram:'<b>なんじ まで</b> = até que horas. Para perguntar o começo: <b>なんじ から</b>.', use:'Na cena: perguntar o horário de funcionamento.'}
  ],
  cenas:[
    {q:'いらっしゃいませ。', say:'いらっしゃいませ。', ro:'Irasshaimase.', pt:'Bem-vinda.',
     ans:['びじゅつかん|bijutsukan','は|wa','なんじ|nanji','まで|made','ですか|desu ka'], extra:['の|no','に|ni'], tarefa:1, ansPt:'Até que horas o museu fica aberto?', molde:3, dica:'Pergunte até que horas o museu fica aberto.', distr:['Obrigada pela visita.','Com licença.']},
    {q:R('五時','ごじ')+'までです。'+R('今','いま')+'、'+R('何時','なんじ')+'ですか？', say:'ごじまでです。いま、なんじですか？', ro:'Go-ji made desu. Ima, nan-ji desu ka?', pt:'Até as 5. Que horas são agora?',
     ans:['いま|ima','よじ|yoji','です|desu'], extra:['くじ|kuji','はん|han','まで|made'], ansPt:'Agora são quatro horas.', molde:0, dica:'O relógio da parede marca 4h.', distr:['Até as 9. Vai entrar agora?','Abre às 5. Pode esperar?']},
    {q:R('今日','きょう')+'の ツアーは もう '+R('終','お')+'わりました。', say:'きょうの ツアーは もう おわりました。', ro:'Kyō no tsuā wa mō owarimashita.', pt:'O tour de hoje já acabou.',
     ans:['あした|ashita','の|no','さんじ|sanji','に|ni','おねがいします|onegaishimasu'], extra:['きょう|kyō','まで|made'], tarefa:1, ansPt:'Amanhã, às 3, por favor.', molde:2, dica:'Marque para amanhã às 3h.', distr:['O tour de hoje começa agora.','O museu fecha amanhã.']},
    {q:R('明日','あした')+'の '+R('三時','さんじ')+'ですね。'+R('何時','なんじ')+'に '+R('来','き')+'ますか？', say:'あしたの さんじですね。なんじに きますか？', ro:'Ashita no san-ji desu ne. Nan-ji ni kimasu ka?', pt:'Amanhã às 3, certo. A que horas você chega?',
     ans:['にじ|niji','はん|han','です|desu'], extra:['いま|ima','まで|made','よじ|yoji'], ansPt:'Às duas e meia.', molde:1, dica:'Você chega meia hora antes: 2h30.', distr:['Amanhã às 3, certo. Quantas pessoas?','Hoje às 3, certo. Já pagou?']},
    {q:'ほかに '+R('何','なに')+'か？', say:'ほかに なにか？', ro:'Hoka ni nani ka?', pt:'Mais alguma coisa?',
     ans:['みせ|mise','は|wa','なんじ|nanji','まで|made','ですか|desu ka'], extra:['の|no','いま|ima'], tarefa:1, ansPt:'Até que horas a loja fica aberta?', molde:3, dica:'Pergunte sobre a lojinha do museu.', distr:['Mais alguma pessoa?','Mais um bilhete?']}
  ]
};
})();
