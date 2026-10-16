(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
(window.AULAS=window.AULAS||{}).roupas={
  slug:'roupas', num:'06', titulo:'Roupas', emoji:'👗', jp:R('服','ふく'), h1:'Provando roupa',
  fim:'Você provou, trocou o tamanho e escolheu a cor em japonês.',
  intro:{titulo:'👚 Uma camiseta linda na vitrine',
    txt:['Você viu uma peça linda e quer provar. Mas os tamanhos japoneses costumam ser menores…',
         'Vai pedir para provar, dizer que ficou pequeno, pedir outro tamanho e outra cor.'],
    metas:['pedir para provar','dizer se ficou pequeno, grande ou perfeito','pedir um tamanho maior ou menor','perguntar por outra cor']},
  npc:{nome:'Vendedora', sel:{hair:'pony',hairColor:'kuro',face:'egao',clothes:'wanpiisu',clothColor:'aka',acc:['megane'],traits:[],skin:1}},
  cen:{wall:'#f6f0fa', floor:'#e6dcea',
    back:`<path d="M24 26 H250" stroke="#8a7a8a" stroke-width="4" stroke-linecap="round"/>${[0,1,2,3,4,5].map(k=>`<g transform="translate(${34+k*36} 26)"><path d="M14 0 v6" stroke="#8a7a8a" stroke-width="2"/><path d="M2 14 L14 6 L26 14 L22 18 L22 60 H6 V18 Z" fill="${['#f19bb5','#3a2b38','#fff','#7aa8d6','#f3c969','#8fb996'][k]}" stroke="#0002" stroke-width="1"/></g>`).join('')}`,
    board:`<ellipse cx="53" cy="34" rx="34" ry="32" fill="#c9b6d6"/><ellipse cx="53" cy="34" rx="28" ry="26" fill="#e9f3fa"/><path d="M38 20 l10 -6 M40 30 l18 -12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    counter:{label:'レジ', color:'#d6c8dc', top:'#efe7f2'},
    prop:'<g transform="translate(6 14)"><rect width="36" height="16" rx="3" fill="#f19bb5"/><path d="M6 0 l12 8 l12 -8" fill="none" stroke="#d9506f" stroke-width="2"/></g>'},
  words:[
    {id:'saizu',k:'サイズ',r:'saizu',pt:'tamanho',en:'size',ic:'📏',tip:'Do inglês "size". Os tamanhos são S, M, L (エス、エム、エル).'},
    {id:'shichaku',h:R('試着','しちゃく'),k:'しちゃく',r:'shichaku',pt:'provar (roupa)',en:'try on',ic:'👚',tip:'Só para roupa. Provar comida é outra palavra.'},
    {id:'shichakushitsu',h:R('試着室','しちゃくしつ'),k:'しちゃくしつ',r:'shichakushitsu',pt:'provador',en:'fitting room',ic:'🪞',tip:'しつ = sala. Tire os sapatos antes de entrar!'},
    {id:'ookii',h:R('大','おお')+'きい',k:'おおきい',r:'ōkii',pt:'grande',en:'big',ic:'🐘',tip:'O o comprido: oo-kii.'},
    {id:'chiisai',h:R('小','ちい')+'さい',k:'ちいさい',r:'chiisai',pt:'pequeno',en:'small',ic:'🐭',tip:'O i comprido: chii-sai.'},
    {id:'iro',h:R('色','いろ'),k:'いろ',r:'iro',pt:'cor',en:'color',ic:'🎨',tip:'Você aprendeu várias cores no Ateliê do avatar!'},
    {id:'kuro',h:R('黒','くろ'),k:'くろ',r:'kuro',pt:'preto',en:'black',ic:'⚫',tip:'しろ = branco, あか = vermelho, あお = azul.'},
    {id:'pittari',k:'ぴったり',r:'pittari',pt:'perfeito, sob medida',en:'perfect fit',ic:'👌',tip:'Também serve para horário: ぴったり = na hora exata.'}
  ],
  moldes:[
    {titulo:'"Posso provar ___?"', tpl:'<i>peça</i> を しちゃく しても いいですか', tplRo:'[peça] o shichaku shite mo ii desu ka', parts:[0,'を|o',{k:'しちゃく',r:'shichaku',h:R('試着','しちゃく')},'しても|shite mo','いいですか|ii desu ka'], pt:'Posso provar {0}?', en:'Can I try on {0}?',
     slots:[[['これ|kore','isto','this'],['この シャツ|kono shatsu','esta camisa','this shirt'],['この スカート|kono sukāto','esta saia','this skirt']]],
     gram:'<b>しても いいですか</b> = "posso fazer…?". Serve para pedir permissão para qualquer coisa.', use:'Na cena: pedir para provar.'},
    {titulo:'"Está ___."', tpl:'<i>como ficou</i> です', tplRo:'[como ficou] desu', parts:[0,'です|desu'],
     slots:[[['ちょっと ちいさい|chotto chiisai','Está um pouco pequeno.',"It's a little small.",'ちょっと '+R('小','ちい')+'さい'],['ちょっと おおきい|chotto ōkii','Está um pouco grande.',"It's a little big.",'ちょっと '+R('大','おお')+'きい'],['ぴったり|pittari','Ficou perfeito!','It fits perfectly!']]],
     gram:'<b>ちょっと</b> = um pouco. Os japoneses usam muito para suavizar uma reclamação.', use:'Na cena: dizer como ficou.'},
    {titulo:'"Tem tamanho ___?"', tpl:'もっと <i>maior / menor</i> サイズ は ありますか', tplRo:'motto [ōkii/chiisai] saizu wa arimasu ka', parts:['もっと|motto',0,'サイズ|saizu','は|wa','ありますか|arimasu ka'],
     slots:[[['おおきい|ōkii','Tem um tamanho maior?','Do you have a bigger size?',R('大','おお')+'きい'],['ちいさい|chiisai','Tem um tamanho menor?','Do you have a smaller size?',R('小','ちい')+'さい']]],
     gram:'<b>もっと</b> = mais. もっと おおきい = maior.', use:'Na cena: pedir outro tamanho.'},
    {titulo:'"Tem em ___?"', tpl:'<i>cor</i> は ありますか', tplRo:'[cor] wa arimasu ka', parts:[0,'は|wa','ありますか|arimasu ka'],
     slots:[[['くろ|kuro','Tem em preto?','Do you have it in black?',R('黒','くろ')],['しろ|shiro','Tem em branco?','Do you have it in white?',R('白','しろ')],['あか|aka','Tem em vermelho?','Do you have it in red?',R('赤','あか')]]],
     gram:'O mesmo <b>ありますか</b> das compras. Só troque a coisa pela cor.', use:'Na cena: pedir outra cor.'}
  ],
  cenas:[
    {q:'いらっしゃいませ。どうぞ ご'+R('覧','らん')+'ください。', say:'いらっしゃいませ。どうぞ ごらんください。', ro:'Irasshaimase. Dōzo go-ran kudasai.', pt:'Bem-vinda. Fique à vontade para olhar.',
     ans:['これ|kore','を|o','しちゃく|shichaku','しても|shite mo','いいですか|ii desu ka'], extra:['は|wa','ありますか|arimasu ka'], ansPt:'Posso provar isto?', molde:0, distr:['Bem-vinda. O provador está ocupado.','Bem-vinda. Hoje fechamos cedo.']},
    {q:'サイズは いかがですか？', say:'サイズは いかがですか？', ro:'Saizu wa ikaga desu ka?', pt:'Como ficou o tamanho?',
     ans:['ちょっと ちいさい|chotto chiisai','です|desu'], extra:['ぴったり|pittari','もっと|motto','は|wa'], ansPt:'Está um pouco pequeno.', molde:1, dica:'Ficou apertado.', distr:['Qual é o seu tamanho?','Quer outra cor?']},
    {q:'そうですか…。', say:'そうですか。', ro:'Sō desu ka…', pt:'Ah, é mesmo?…',
     ans:['もっと|motto','おおきい|ōkii','サイズ|saizu','は|wa','ありますか|arimasu ka'], extra:['ちいさい|chiisai','を|o'], ansPt:'Tem um tamanho maior?', molde:2, distr:['Que pena, acabou.','Pode pagar no caixa.']},
    {q:'はい、こちらです。いかがですか？', say:'はい、こちらです。いかがですか？', ro:'Hai, kochira desu. Ikaga desu ka?', pt:'Sim, aqui está. Que tal?',
     ans:['ぴったり|pittari','です|desu'], extra:['ちょっと おおきい|chotto ōkii','ありますか|arimasu ka'], ansPt:'Ficou perfeito!', molde:1, dica:'Agora serviu certinho.', distr:['Não temos esse tamanho.','O provador é ali.']},
    {q:R('色','いろ')+'は この '+R('白','しろ')+'で よろしいですか？', say:'いろは この しろで よろしいですか？', ro:'Iro wa kono shiro de yoroshii desu ka?', pt:'A cor, pode ser este branco?',
     ans:['くろ|kuro','は|wa','ありますか|arimasu ka'], extra:['あか|aka','です|desu','を|o'], ansPt:'Tem em preto?', molde:3, dica:'Você prefere preto.', distr:['O tamanho está bom?','Vai levar duas?']}
  ]
};
})();
