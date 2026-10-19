(function(){
const R=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
const VERB={iki:['ir','go'],tabe:['comer','eat'],nomi:['beber','drink'],wakari:['entender','understand'],ki:['vir','come']};
const PT={iki:['Vou.','Não vou.','Fui.','Não fui.'],tabe:['Como.','Não como.','Comi.','Não comi.'],nomi:['Bebo.','Não bebo.','Bebi.','Não bebi.'],wakari:['Entendo.','Não entendo.','Entendi.','Não entendi.'],ki:['Venho.','Não venho.','Vim.','Não vim.']};
const EN={iki:['I go.',"I don't go.",'I went.',"I didn't go."],tabe:['I eat.',"I don't eat.",'I ate.',"I didn't eat."],nomi:['I drink.',"I don't drink.",'I drank.',"I didn't drink."],wakari:['I understand.',"I don't understand.",'I understood.',"I didn't understand."],ki:['I come.',"I don't come.",'I came.',"I didn't come."]};
const FIM=['ます','ません','ました','ませんでした'];
const NEG={'パスポート':['Não é o passaporte.',"It's not the passport."],'すし':['Não é sushi.',"It's not sushi."],'がくせい':['Não sou estudante.',"I'm not a student."]};
const vid=s=>s[0].r.toLowerCase(), fid=s=>FIM.indexOf(s[1].k);
const NOUN={'パスポート':[['É o passaporte.','Não é o passaporte.','É o passaporte?'],["It's the passport.","It's not the passport.",'Is it the passport?']],
  'ブラジルじん':[['Sou brasileira(o).','Não sou brasileira(o).','Você é brasileira(o)?'],["I'm Brazilian.","I'm not Brazilian.",'Are you Brazilian?']],
  'がくせい':[['Sou estudante.','Não sou estudante.','Você é estudante?'],["I'm a student.","I'm not a student.",'Are you a student?']]};
(window.AULAS=window.AULAS||{}).aulazero={
  slug:'aulazero', num:'', titulo:'Aula Zero', emoji:'🎓', jp:R('準備','じゅんび'), h1:'As chaves antes da viagem',
  eyebrow:'Antes dos mapas', docTitle:'Aula Zero · Unirversos Idiomas', insignia:'Aula Zero concluída! Os 12 mapas estão abertos.',
  fim:'Você já tem as chaves que abrem todas as conversas dos mapas.', fimLink:['🗺️ Ir para os mapas de contexto →','/idiomas/mapas/'],
  cenaAudio:{src:'audio/4-teste.mp3',titulo:'A professora explica o teste'},
  onFinish:()=>{ try{ localStorage.setItem('aulaZeroCompleted','true'); }catch(e){} },
  linkList:[['← Idiomas','/idiomas/'],['🎨 Ateliê de Avatar','/idiomas/planeta-utopia/atelie/'],['🗺️ Mapas de contexto →','/idiomas/mapas/']],
  intro:{titulo:'🎒 Antes de embarcar, uma aula com a せんせい',
    txt:['Cada mapa é uma situação da viagem: aeroporto, hotel, restaurante… Mas todos eles usam as mesmas <b>chaves</b>: dizer que algo <b>é</b> ou <b>não é</b>, fazer uma <b>pergunta</b>, falar de <b>ações</b> (ir, comer, beber, entender) e <b>pedir</b> algo.',
         'A professora vai te guiar passo a passo por essas chaves. No fim, tem um pequeno desafio prático: responda tudo e os 12 mapas se abrem.'],
    metas:['afirmar, negar e perguntar com です','dizer "não é" do jeito formal e do jeito de amigos (じゃない)','usar os verbos com ます, no presente e no passado','perguntar onde, o quê, quanto, quando e quem','pedir as coisas com educação']},
  npc:{nome:'せんせい (professora)', sel:{hair:'nagai',hairColor:'shiro',face:'egao',clothes:'seetaa',clothColor:'midori',acc:['megane'],traits:[],skin:2}},
  cen:{wall:'#f3efe6', floor:'#e2d5c0',
    back:`<rect x="16" y="14" width="200" height="88" rx="6" fill="#4d6b58" stroke="#b98a5e" stroke-width="6"/>
      <text x="30" y="40" font-family="Zen Maru Gothic, sans-serif" font-size="16" font-weight="700" fill="#fff" opacity=".92">です・ですか</text>
      <text class="ro" x="132" y="40" font-family="Baloo 2, sans-serif" font-size="9" fill="#f3c969">desu · desu ka</text>
      <text x="30" y="64" font-family="Zen Maru Gothic, sans-serif" font-size="14" fill="#fff" opacity=".85">ます → ました</text>
      <text class="ro" x="132" y="64" font-family="Baloo 2, sans-serif" font-size="9" fill="#f3c969">masu → mashita</text>
      <rect x="150" y="96" width="22" height="5" rx="2" fill="#fff"/><rect x="178" y="96" width="14" height="5" rx="2" fill="#f19bb5"/>`,
    board:`<rect x="10" y="4" width="86" height="54" rx="6" fill="#fff" stroke="#e5d3b8" stroke-width="3"/><text x="53" y="28" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="13" font-weight="700" fill="#d9506f">ようこそ</text><text x="53" y="46" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="9" fill="#7c6a78">bem-vinda!</text>`,
    counter:{label:'', color:'#c98b5e', top:'#e7c49f'},
    prop:'<g transform="translate(4 12)"><rect width="34" height="8" rx="2" fill="#7aa8d6"/><rect x="2" y="-7" width="30" height="8" rx="2" fill="#f19bb5"/><rect x="5" y="-14" width="26" height="8" rx="2" fill="#f3c969"/><circle cx="46" cy="0" r="7" fill="#e5605a"/><path d="M46 -7 q3 -5 6 -4" stroke="#7fa487" stroke-width="2" fill="none"/></g>'},
  words:[
    {id:'desu',k:'です',r:'desu',pt:'é / sou / está',en:'is / am / are',ic:'✅',tip:'Vai no fim da frase e deixa tudo educado. パスポートです = É o passaporte.'},
    {id:'dewaarimasen',k:'ではありません',r:'dewa arimasen',pt:'não é / não sou',en:'is not',ic:'❌',tip:'A forma mais formal, de documento e de balcão. Na conversa ela vira じゃありません, じゃないです ou じゃない.'},
    {id:'janai',k:'じゃない',r:'janai',pt:'não é (conversa)',en:"isn't (casual)",ic:'🙅',tip:'É o "não é" que você mais vai ouvir na rua, nos animes e entre amigos. Com です no fim (じゃないです) continua educado.'},
    {id:'ka',k:'か',r:'ka',pt:'(vira pergunta)',en:'(question marker)',ic:'❓',tip:'Coloque か no fim e a frase vira pergunta. です → ですか.'},
    {id:'masu',k:'ます',r:'masu',pt:'final educado dos verbos',en:'polite verb ending',ic:'🔁',tip:'ます (faço), ません (não faço), ました (fiz), ませんでした (não fiz).'},
    {id:'doko',k:'どこ',r:'doko',pt:'onde',en:'where',ic:'📍',tip:'A pergunta que mais salva vidas na viagem.'},
    {id:'nan',h:R('何','なん'),k:'なん',r:'nan / nani',pt:'o quê',en:'what',ic:'🤔',tip:'Antes de です vira なん: なんですか？ (O que é?)'},
    {id:'ikura',k:'いくら',r:'ikura',pt:'quanto (custa)',en:'how much',ic:'💴',tip:'Só para dinheiro.'},
    {id:'itsu',k:'いつ',r:'itsu',pt:'quando',en:'when',ic:'📅',tip:'いつですか？ = Quando é?'},
    {id:'dare',h:R('誰','だれ'),k:'だれ',r:'dare',pt:'quem',en:'who',ic:'🧑',tip:'Mais educado: どなた.'},
    {id:'kudasai',k:'ください',r:'kudasai',pt:'me dê, por favor',en:'please give me',ic:'🤲',tip:'Para pedir coisas: みずを ください.'},
    {id:'onegaishimasu',h:'お'+R('願','ねが')+'いします',k:'おねがいします',r:'onegaishimasu',pt:'por favor (pedido)',en:'please',ic:'🙏',tip:'Serve para coisas e também para serviços: チェックイン、おねがいします.'},
    {id:'sumimasen',k:'すみません',r:'sumimasen',pt:'com licença / desculpe',en:'excuse me / sorry',ic:'🙇',tip:'Abre qualquer conversa. Se levar uma palavra só para o Japão, leve esta.'},
    {id:'sukoshi',h:R('少','すこ')+'し',k:'すこし',r:'sukoshi',pt:'um pouco',en:'a little',ic:'🤏',tip:'すこし わかります = entendo um pouco.'}
  ],
  moldes:[
    {audio:{src:'audio/1-estrutura.mp3',titulo:'Explicação da professora: a estrutura (です, ではありません, ですか)'},titulo:'É, não é, é?', tpl:'<i>coisa</i> <i>です / ではありません / ですか</i>', tplRo:'[coisa] desu / dewa arimasen / desu ka', parts:[0,1],
     pt:s=>NOUN[s[0].k][0][['です','ではありません','ですか'].indexOf(s[1].k)],
     en:s=>NOUN[s[0].k][1][['です','ではありません','ですか'].indexOf(s[1].k)],
     slots:[[['パスポート|pasupōto','',''],['ブラジルじん|Burajiru-jin','','',R('ブラジル人','ブラジルじん')],['がくせい|gakusei','','',R('学生','がくせい')]],[['です|desu','',''],['ではありません|dewa arimasen','',''],['ですか|desu ka','','']]],
     gram:'A mesma palavra, três finais: <b>です</b> afirma, <b>ではありません</b> nega, <b>ですか</b> pergunta. Em japonês "eu" e "você" quase sempre ficam subentendidos. O "não é" tem outros jeitos mais soltos: veja o próximo molde.', use:'Na cena: dizer o que você é e o que não é.'},
    {titulo:'Quatro jeitos de dizer "não é"', tpl:'<i>coisa</i> <i>ではありません / じゃありません / じゃないです / じゃない</i>', tplRo:'[coisa] dewa arimasen / ja arimasen / ja nai desu / ja nai', parts:[0,1],
     pt:s=>`${NEG[s[0].k][0]} ${['(bem formal)','(educado)','(educado e leve, o mais comum)','(entre amigos)'][['ではありません','じゃありません','じゃないです','じゃない'].indexOf(s[1].k)]}`,
     en:s=>`${NEG[s[0].k][1]} ${['(very formal)','(polite)','(polite, everyday)','(casual)'][['ではありません','じゃありません','じゃないです','じゃない'].indexOf(s[1].k)]}`,
     slots:[[['パスポート|pasupōto','',''],['すし|sushi','',''],['がくせい|gakusei','','',R('学生','がくせい')]],[['ではありません|dewa arimasen','',''],['じゃありません|ja arimasen','',''],['じゃないです|ja nai desu','',''],['じゃない|ja nai','','']]],
     gram:'<b>じゃ</b> é só <b>では</b> falado rápido. Do mais formal ao mais solto: <b>ではありません</b> → <b>じゃありません</b> → <b>じゃないです</b> → <b>じゃない</b>. Na viagem, <b>じゃないです</b> é o curinga: educado sem ser duro. <b>じゃない</b> sozinho é para amigos (e é o que você mais ouve em anime!).', use:'Na cena: responder do jeito de amigos.'},
    {audio:{src:'audio/2-verbos.mp3',titulo:'Explicação da professora: os verbos com ます'},titulo:'Verbos com ます', tpl:'<i>verbo</i> <i>ます / ません / ました / ませんでした</i>', tplRo:'[verbo]-masu / masen / mashita / masen deshita', parts:[0,1],
     pt:s=>PT[vid(s)][fid(s)], en:s=>EN[vid(s)][fid(s)],
     slots:[[['いき|iki','','',R('行','い')+'き'],['たべ|tabe','','',R('食','た')+'べ'],['のみ|nomi','','',R('飲','の')+'み'],['わかり|wakari','',''],['き|ki','','',R('来','き')]],[['ます|masu','',''],['ません|masen','',''],['ました|mashita','',''],['ませんでした|masen deshita','','']]],
     gram:'Todo verbo educado termina com uma destas quatro: <b>ます</b> (presente/futuro), <b>ません</b> (não), <b>ました</b> (passado), <b>ませんでした</b> (não, no passado). O começo do verbo não muda!', use:'Na cena: contar o que você comeu e se entende japonês.'},
    {audio:{src:'audio/3-perguntas.mp3',titulo:'Explicação da professora: as perguntas e as frases de sobrevivência'},titulo:'"Onde fica ___?"', tpl:'<i>lugar</i> は どこ ですか', tplRo:'[lugar] wa doko desu ka', parts:[0,'は|wa','どこ|doko','ですか|desu ka'],
     slots:[[['トイレ|toire','Onde fica o banheiro?','Where is the restroom?'],['えき|eki','Onde fica a estação?','Where is the station?',R('駅','えき')],['ホテル|hoteru','Onde fica o hotel?','Where is the hotel?']]],
     gram:'<b>は</b> (a letra <ruby class="rk">は<rt>ha</rt></ruby>, mas lida <b>wa</b>) apresenta o assunto: "o banheiro… onde é?". Este molde aparece em quase todos os mapas.', use:'Na cena: perguntar onde fica o banheiro.'},
    {titulo:'As perguntas curinga', tpl:'<i>pergunta</i> ですか', tplRo:'[pergunta] desu ka', parts:[0,'ですか|desu ka'],
     slots:[[['なん|nan','O que é?','What is it?',R('何','なん')],['どこ|doko','Onde é?','Where is it?'],['いくら|ikura','Quanto custa?','How much is it?'],['いつ|itsu','Quando é?','When is it?'],['だれ|dare','Quem é?','Who is it?',R('誰','だれ')]]],
     gram:'Com uma palavra de pergunta + <b>ですか</b> você já se vira. Aponte para algo e pergunte: <b>これは なんですか？</b> (O que é isto?)', use:'Na cena: perguntar o que é uma coisa.'},
    {titulo:'"___, por favor."', tpl:'<i>coisa</i> を <i>ください / おねがいします</i>', tplRo:'[coisa] o kudasai / onegaishimasu', parts:[0,'を|o',1], pt:'{0}, por favor.', en:'{0}, please.',
     slots:[[['みず|mizu','Água','Water',R('水','みず')],['これ|kore','Isto','This'],['メニュー|menyū','O cardápio','The menu']],[['ください|kudasai','',''],['おねがいします|onegaishimasu','','','お'+R('願','ねが')+'いします']]],
     gram:'<b>を</b> (lido <b>o</b>) marca a coisa pedida. <b>ください</b> e <b>おねがいします</b> funcionam aqui; おねがいします soa um pouquinho mais gentil.', use:'Na cena: pedir água.'},
    {titulo:'Frases de sobrevivência', tpl:'<i>frase pronta</i>', tplRo:'[frase]', parts:[0],
     slots:[[['すみません|sumimasen','Com licença / Desculpe.','Excuse me / Sorry.'],['ありがとうございます|arigatō gozaimasu','Muito obrigada.','Thank you very much.'],['わかりません|wakarimasen','Não entendo.',"I don't understand."],['いいですか|ii desu ka','Pode? / Tudo bem?','Is it okay?']]],
     gram:'Quatro frases prontas, sem montar nada. <b>いいですか</b> + apontar já pede permissão para quase tudo (sentar, tirar foto, provar).', use:'Elas também ficam no botão 🌬️ Ar, sempre à mão.'}
  ],
  cenas:[
    {q:'これは パスポートですか？', say:'これは パスポートですか？', ro:'Kore wa pasupōto desu ka?', pt:'Isto é um passaporte? (ela mostra um mapa)',
     ans:['いいえ|iie','パスポート|pasupōto','ではありません|dewa arimasen'], extra:['です|desu','ですか|desu ka','が|ga'], ansPt:'Não, não é o passaporte. (é um mapa!)', molde:0, dica:'Ela está segurando um mapa, não um passaporte.', distr:['Isto é um mapa?','Onde está o passaporte?']},
    {q:R('日本人','にほんじん')+'ですか？', say:'にほんじんですか？', ro:'Nihon-jin desu ka?', pt:'Você é japonesa?',
     ans:['いいえ|iie','ブラジルじん|Burajiru-jin','です|desu'], extra:['ですか|desu ka','ではありません|dewa arimasen'], ansPt:'Não, sou brasileira.', molde:0, dica:'Diga que é brasileira.', distr:['Você é estudante?','Você é brasileira?']},
    {quem:'せんせい (agora falando como amiga)', q:'これ、すし？', say:'これ、すし？', ro:'Kore, sushi?', pt:'Isso aí é sushi? (jeito de amiga; ela mostra um onigiri)',
     ans:['ううん|uun','すし|sushi','じゃない|ja nai'], extra:['ではありません|dewa arimasen','です|desu','か|ka'], ansPt:'Não, não é sushi. (ううん = "não" entre amigos)', molde:1, dica:'Responda do jeito de amigos: ううん + じゃない.', distr:['Você gosta de sushi?','Isso é um onigiri?']},
    {q:'きのう、すしを '+R('食','た')+'べましたか？', say:'きのう、すしを たべましたか？', ro:'Kinō, sushi o tabemashita ka?', pt:'Ontem você comeu sushi?',
     ans:['はい|hai','たべ|tabe','ました|mashita'], extra:['ます|masu','ません|masen','のみ|nomi'], ansPt:'Sim, comi.', molde:2, dica:'Sim, você comeu (passado).', distr:['Amanhã você vai comer sushi?','Você bebeu chá ontem?']},
    {q:R('日本語','にほんご')+'、わかりますか？', say:'にほんご、わかりますか？', ro:'Nihongo, wakarimasu ka?', pt:'Você entende japonês?',
     ans:['すこし|sukoshi','わかり|wakari','ます|masu'], extra:['ました|mashita','ません|masen','いき|iki'], ansPt:'Entendo um pouco.', molde:2, dica:'Você entende um pouco (presente).', distr:['Você fala inglês?','Você vai ao Japão?']},
    {q:R('何','なに')+'を '+R('飲','の')+'みますか？', say:'なにを のみますか？', ro:'Nani o nomimasu ka?', pt:'O que você vai beber?',
     ans:['みず|mizu','を|o','おねがいします|onegaishimasu'], extra:['は|wa','です|desu','どこ|doko'], ansPt:'Água, por favor.', molde:5, distr:['O que você vai comer?','Onde você vai beber?']},
    {quem:'せんせい (fingindo ser da estação)', q:'どう しましたか？', say:'どう しましたか？', ro:'Dō shimashita ka?', pt:'Aconteceu alguma coisa? / Posso ajudar?',
     ans:['トイレ|toire','は|wa','どこ|doko','ですか|desu ka'], extra:['を|o','いくら|ikura','です|desu'], ansPt:'Onde fica o banheiro?', molde:3, dica:'Você precisa muito achar o banheiro!', distr:['Que horas são?','Você é turista?']},
    {q:'はい、どうぞ。', say:'はい、どうぞ。', ro:'Hai, dōzo.', pt:'Aqui, pegue. (ela te entrega um objeto misterioso)',
     ans:['これ|kore','は|wa','なん|nan','ですか|desu ka'], extra:['だれ|dare','いつ|itsu','を|o'], ansPt:'O que é isto?', molde:4, dica:'Pergunte o que é isto.', distr:['Muito obrigada.','Não tem, desculpe.']}
  ]
};
})();
