(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).aeroporto={
  slug:'aeroporto', num:'00', titulo:'Aeroporto', emoji:'🛂', jp:R('空港','くうこう'), h1:'Chegando em Tóquio',
  fim:'Você passou pela imigração inteira falando japonês.',
  intro:{titulo:'✈️ Você acabou de pousar em Tóquio!',
    txt:['Antes de sair do aeroporto, você passa pela imigração e pelo balcão da companhia aérea. Lá vão te fazer <b>5 perguntas</b> curtas, em japonês.',
         'Calma: ninguém vai te jogar na conversa sem preparo. Primeiro você conhece as <b>palavras</b>, depois aprende os <b>moldes</b> das frases, treina o <b>ouvido</b>, e só então conversa.'],
    metas:['dizer que veio fazer turismo','dizer para onde você vai','dizer se tem reserva e se tem visto','dizer quantas malas está levando']},
  npc:{nome:'Oficial da imigração', sel:{hair:'mijikai',hairColor:'kuro',face:'egao',clothes:'suutsu',clothColor:'ao',acc:['nekutai'],traits:[],skin:1},
    extra:'<path d="M66 90 Q120 34 174 90 Z" fill="#2e3f6e"/><rect x="60" y="84" width="120" height="13" rx="6" fill="#22305a"/><path d="M60 95 Q120 112 180 95 L176 100 Q120 116 64 100 Z" fill="#1b2546"/><circle cx="120" cy="68" r="7" fill="#e3b341"/><path d="M116 68 h8 M120 64 v8" stroke="#b98a2a" stroke-width="2"/>'},
  cen:{wall:'#fbefe6', floor:'#f1dccd', meProp:'svg:nimotsu',
    back:`<defs><linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f2"/><stop offset="1" stop-color="#e6f3fa"/></linearGradient></defs>
      <rect x="14" y="12" width="250" height="96" rx="14" fill="url(#skyA)" stroke="#e8d7cb" stroke-width="4"/>
      <g fill="#fff" opacity=".95"><ellipse cx="70" cy="44" rx="24" ry="9"/><ellipse cx="86" cy="38" rx="14" ry="9"/><ellipse cx="196" cy="70" rx="22" ry="8"/><ellipse cx="210" cy="64" rx="12" ry="8"/></g>
      <g class="plane"><g transform="translate(20 52)"><path d="M0 8 L36 6 Q44 6 46 9 Q44 12 36 12 L0 10 Z" fill="#fff"/><path d="M14 8 L26 -4 L30 -4 L22 8 Z M14 11 L26 22 L30 22 L22 11 Z M2 8 L-2 0 L3 0 L8 8 Z" fill="#d9506f"/></g></g>
      <path d="M139 12 V108" stroke="#e8d7cb" stroke-width="4"/>`,
    board:`<rect width="106" height="56" rx="8" fill="#3a2b38"/><text x="10" y="20" font-family="Baloo 2, sans-serif" font-size="10" font-weight="700" fill="#f3c969">DEP</text><text x="40" y="20" font-family="Baloo 2, sans-serif" font-size="10" fill="#fff">TOKYO</text>
      <text x="10" y="36" font-family="Baloo 2, sans-serif" font-size="10" font-weight="700" fill="#f3c969">10:30</text><text x="48" y="36" font-family="Baloo 2, sans-serif" font-size="10" fill="#9fd3a8">ON TIME</text><circle class="blink" cx="96" cy="46" r="3" fill="#f3c969"/>`,
    counter:{label:'にゅうこく', color:'#e7cdb9', top:'#f6e5d8'},
    prop:'<g transform="translate(10 18) rotate(-8)"><rect width="32" height="20" rx="3" fill="#7d2b3a"/><circle cx="16" cy="10" r="5" fill="none" stroke="#e3b341" stroke-width="1.5"/></g>'},
  words:[
    {id:'pasupooto',k:'パスポート',r:'pasupōto',pt:'passaporte',en:'passport',ic:'svg:pasupooto',tip:'Vem do inglês "passport". Por isso está em katakana.'},
    {id:'biza',k:'ビザ',r:'biza',pt:'visto',en:'visa',ic:'svg:biza',tip:'Também vem do inglês, "visa".'},
    {id:'nimotsu',h:R('荷物','にもつ'),k:'にもつ',r:'nimotsu',pt:'bagagem',en:'luggage',ic:'svg:nimotsu',tip:'Serve para qualquer volume: mala, mochila, sacola.'},
    {id:'yoyaku',h:R('予約','よやく'),k:'よやく',r:'yoyaku',pt:'reserva',en:'reservation',ic:'svg:yoyaku',tip:'Você vai ouvir no aeroporto, no hotel e no restaurante.'},
    {id:'kankou',h:R('観光','かんこう'),k:'かんこう',r:'kankō',pt:'turismo',en:'sightseeing',ic:'svg:kankou',tip:'A resposta mais comum para "qual o motivo da viagem?".'},
    {id:'mokutekichi',h:R('目的地','もくてきち'),k:'もくてきち',r:'mokutekichi',pt:'destino',en:'destination',ic:'svg:mokutekichi',tip:'Cuidado: もくてき (sem ち) é "motivo". Com ち no fim vira "lugar de destino".'},
    {id:'tookyoo',h:R('東京','とうきょう'),k:'とうきょう',r:'Tōkyō',pt:'Tóquio',en:'Tokyo',ic:'svg:tookyoo',tip:'O "ō" com tracinho é um o comprido: tooo-kyooo.'},
    {id:'futatsu',k:'ふたつ',r:'futatsu',pt:'dois (objetos)',en:'two (things)',ic:'svg:futatsu',tip:'Para contar coisas: ひとつ 1, ふたつ 2, みっつ 3.'}
  ],
  moldes:[
    {titulo:'"É ___."', tpl:'<i>coisa</i> です', tplRo:'[coisa] desu', parts:[0,'です|desu'],
     slots:[[['かんこう|kankō','É turismo.',"It's sightseeing.",R('観光','かんこう')],['にもつ|nimotsu','É a bagagem.',"It's the luggage.",R('荷物','にもつ')],['パスポート|pasupōto','É o passaporte.',"It's the passport."]]],
     gram:'<b>です</b> (desu) fecha a frase com educação e já quer dizer "é". Responder só <b>かんこう です</b> é perfeitamente natural.', use:'Na cena: responder o motivo da viagem.'},
    {titulo:'"Meu destino é ___."', tpl:'もくてきち は <i>lugar</i> です', tplRo:'mokutekichi wa [lugar] desu', parts:[{k:'もくてきち',r:'mokutekichi',h:R('目的地','もくてきち')},'は|wa',0,'です|desu'],
     slots:[[['とうきょう|Tōkyō','Meu destino é Tóquio.','My destination is Tokyo.',R('東京','とうきょう')],['おおさか|Ōsaka','Meu destino é Osaka.','My destination is Osaka.'],['きょうと|Kyōto','Meu destino é Kyoto.','My destination is Kyoto.']]],
     gram:'<b>は</b> se escreve は mas se lê <b>wa</b> quando marca o assunto da frase: "sobre o destino… é Tóquio".', use:'Na cena: dizer para onde você vai.'},
    {titulo:'"Tenho ___." / "Não tenho ___."', tpl:'<i>coisa</i> が <i>tenho / não tenho</i>', tplRo:'[coisa] ga arimasu / arimasen', parts:[0,'が|ga',1], pt:'{1} {0}.', en:'{1} {0}.',
     slots:[[['よやく|yoyaku','reserva','a reservation',R('予約','よやく')],['ビザ|biza','visto','a visa'],['パスポート|pasupōto','passaporte','a passport']],[['あります|arimasu','Tenho','I have'],['ありません|arimasen','Não tenho',"I don't have"]]],
     gram:'<b>あります</b> = tenho, existe. <b>ありません</b> = não tenho, não existe. Só muda o final: <b>-masu</b> vira <b>-masen</b>. A partícula <b>が</b> (ga) aponta a coisa que existe.', use:'Na cena: falar da reserva e do visto.'},
    {titulo:'"São ___ bagagens."', tpl:'にもつ は <i>quantidade</i> です', tplRo:'nimotsu wa [quantidade] desu', parts:[{k:'にもつ',r:'nimotsu',h:R('荷物','にもつ')},'は|wa',0,'です|desu'],
     slots:[[['ひとつ|hitotsu','É uma bagagem.','One piece of luggage.'],['ふたつ|futatsu','São duas bagagens.','Two pieces of luggage.'],['みっつ|mittsu','São três bagagens.','Three pieces of luggage.']]],
     gram:'Para contar objetos o japonês usa uma série própria: <b>ひとつ</b> 1, <b>ふたつ</b> 2, <b>みっつ</b> 3. Serve para malas, cafés, ingressos…', use:'Na cena: dizer quantas malas você despacha.'}
  ],
  cenas:[
    {quem:'Oficial da imigração', q:R('目的','もくてき')+'は'+R('何','なん')+'ですか？', say:'もくてきは なんですか？', ro:'Mokuteki wa nan desu ka?', pt:'Qual é o motivo da viagem?',
     ans:['かんこう|kankō','です|desu'], extra:['よやく|yoyaku','ビザ|biza','が|ga'], ansPt:'É turismo.', molde:0, distr:['Onde fica o banheiro?','Qual é o seu nome?']},
    {quem:'Oficial da imigração', q:R('目的地','もくてきち')+'はどこですか？', say:'もくてきちは どこですか？', ro:'Mokutekichi wa doko desu ka?', pt:'Qual é o seu destino?',
     ans:['もくてきち|mokutekichi','は|wa','とうきょう|Tōkyō','です|desu'], extra:['が|ga','にもつ|nimotsu','ありません|arimasen'], ansPt:'Meu destino é Tóquio.', molde:1, distr:['Qual é o motivo da viagem?','Quanto custa?']},
    {quem:'Balcão da companhia', q:'ご'+R('予約','よやく')+'はございますか？', say:'ごよやくは ございますか？', ro:'Go-yoyaku wa gozaimasu ka?', pt:'Tem reserva?',
     ans:['よやく|yoyaku','が|ga','あります|arimasu'], extra:['ありません|arimasen','かんこう|kankō','は|wa'], ansPt:'Tenho reserva.', molde:2, distr:['Tem passaporte?','Qual é o seu destino?']},
    {quem:'Oficial da imigração', q:'ビザはありますか？', say:'ビザは ありますか？', ro:'Biza wa arimasu ka?', pt:'Tem visto?',
     ans:['ビザ|biza','が|ga','ありません|arimasen'], extra:['あります|arimasu','です|desu','パスポート|pasupōto'], ansPt:'Não tenho visto.', molde:2, distr:['Tem reserva?','Tem bagagem?']},
    {quem:'Balcão da companhia', q:R('荷物','にもつ')+'はいくつですか？', say:'にもつは いくつですか？', ro:'Nimotsu wa ikutsu desu ka?', pt:'Quantas bagagens?',
     ans:['にもつ|nimotsu','は|wa','ふたつ|futatsu','です|desu'], extra:['が|ga','よやく|yoyaku','とうきょう|Tōkyō'], ansPt:'São duas bagagens.', molde:3, distr:['Onde está a bagagem?','Quantas pessoas?']}
  ]
};
})();
