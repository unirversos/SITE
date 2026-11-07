/* Provas em etapas (resposta ABERTA, sem alternativas; cada item tem hab = habilidades que treina [escuta, fala, leitura, escrita] e modo = escrever | falar). Chave = id do território da prova.
   Só vocabulário que a aula do mapa ensina. Cada item: kws (grupos "a|b|c": basta um de cada; min = quantos grupos precisam bater),
   model/modelRo (resposta mostrada ao acertar ou após 3 erros), dica, why/tr (explicação).
   ouvir: {say,kws,...} · montar: {pt,kws,...} · ler: {obj,qs:[{q,kws,...}]} · surpresa: {cena,obj?,say,kana,ro,tr,kws,...} */
window.PROVAS={
 "numeros": {
  "titulo": "Horas",
  "aula": "/idiomas/mapas/horas/aula/",
  "etapas": [
   {
    "tipo": "ouvir",
    "nome": "Ouvir, escrever e repetir",
    "instr": "Você vai ouvir uma frase. Em algumas, escreva o que ouviu (kana ou romaji); em outras, repita em voz alta. Pode ouvir quantas vezes quiser.",
    "itens": [
     {
      "say": "いま、よじです。",
      "kws": [
       "いま|ima",
       "よじ|yoji|四時"
      ],
      "model": "いま、よじです。",
      "modelRo": "Ima, yoji desu.",
      "tr": "Agora são 4 horas.",
      "dica": "Começa com “agora” e termina com a hora: 4 é um número especial.",
      "hab": [
       "escuta",
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "say": "にじはんです。",
      "kws": [
       "にじ|niji|二時",
       "はん|han|半"
      ],
      "model": "にじはんです。",
      "modelRo": "Niji han desu.",
      "tr": "São duas e meia.",
      "dica": "Hora + はん (meia).",
      "hab": [
       "escuta",
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "say": "くじ",
      "kws": [
       "くじ|kuji|九時"
      ],
      "model": "くじ",
      "modelRo": "kuji",
      "tr": "Nove horas.",
      "dica": "9 horas não é きゅうじ.",
      "hab": [
       "escuta",
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "say": "きょうの ツアーは もう おわりました。",
      "kws": [
       "きょう|kyou|kyo|今日",
       "ツアー|tsuaa|tsua",
       "おわりました|owarimashita|終わりました"
      ],
      "min": 2,
      "model": "きょうの ツアーは もう おわりました。",
      "modelRo": "Kyō no tsuā wa mō owarimashita.",
      "tr": "O tour de hoje já acabou.",
      "dica": "Fala de hoje, do tour e de “já acabou”.",
      "hab": [
       "escuta",
       "fala"
      ],
      "modo": "falar"
     },
     {
      "say": "みせは なんじまでですか。",
      "kws": [
       "みせ|mise|店",
       "なんじ|nanji|何時",
       "まで|made"
      ],
      "min": 2,
      "model": "みせは なんじまでですか。",
      "modelRo": "Mise wa nanji made desu ka.",
      "tr": "Até que horas a loja fica aberta?",
      "dica": "Uma pergunta sobre a loja e “até que horas”.",
      "hab": [
       "escuta",
       "fala"
      ],
      "modo": "falar"
     }
    ]
   },
   {
    "tipo": "montar",
    "nome": "Dizer e escrever em japonês",
    "instr": "Você lê em português e responde em japonês. Cada frase pede uma habilidade: às vezes falar, às vezes escrever (kana ou romaji). Use os moldes da aula.",
    "itens": [
     {
      "pt": "Até que horas o museu fica aberto?",
      "say": "びじゅつかんは なんじまでですか。",
      "kws": [
       "びじゅつかん|bijutsukan|美術館",
       "なんじ|nanji|何時",
       "まで|made"
      ],
      "min": 3,
      "model": "びじゅつかんは なんじまでですか。",
      "modelRo": "Bijutsukan wa nanji made desu ka.",
      "dica": "Molde: lugar + は + なんじ + まで + ですか。",
      "hab": [
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "pt": "Agora são quatro horas.",
      "say": "いま、よじです。",
      "kws": [
       "いま|ima",
       "よじ|yoji|四時"
      ],
      "model": "いま、よじです。",
      "modelRo": "Ima, yoji desu.",
      "dica": "いま + hora + です. Quatro horas é よじ.",
      "hab": [
       "fala"
      ],
      "modo": "falar"
     },
     {
      "pt": "Amanhã, às 3, por favor.",
      "say": "あしたの さんじに おねがいします。",
      "kws": [
       "あした|ashita|明日",
       "さんじ|sanji|三時",
       "おねがいします|onegaishimasu|onegai|お願い"
      ],
      "min": 3,
      "model": "あしたの さんじに おねがいします。",
      "modelRo": "Ashita no sanji ni onegaishimasu.",
      "dica": "Molde: dia + の + hora + に + おねがいします。",
      "hab": [
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "pt": "São duas e meia.",
      "say": "にじはんです。",
      "kws": [
       "にじ|niji|二時",
       "はん|han|半"
      ],
      "model": "にじはんです。",
      "modelRo": "Niji han desu.",
      "dica": "Hora + はん + です.",
      "hab": [
       "fala"
      ],
      "modo": "falar"
     }
    ]
   },
   {
    "tipo": "ler",
    "nome": "Ler o mundo real",
    "instr": "Olhe a placa, o ingresso e o relógio, como você vai ver no Japão, e responda em japonês (escrevendo ou falando).",
    "itens": [
     {
      "obj": {
       "tipo": "placa",
       "nome": "びじゅつかん",
       "hora": "9:00 – 17:00"
      },
      "qs": [
       {
        "q": "A que horas o museu abre? Responda só com a hora.",
        "kws": [
         "くじ|kuji|九時"
        ],
        "model": "くじ",
        "modelRo": "kuji",
        "why": "9:00 é くじ.",
        "dica": "É o 9 especial, não きゅうじ.",
        "hab": [
         "leitura",
         "escrita"
        ],
        "modo": "escrever"
       },
       {
        "q": "Até que horas o museu fica aberto? Responda só com a hora.",
        "kws": [
         "ごじ|goji|五時"
        ],
        "model": "ごじまで",
        "modelRo": "goji made",
        "why": "17:00 é 5 da tarde: ごじ. E まで = até.",
        "dica": "17:00 é 5 da tarde.",
        "hab": [
         "leitura",
         "fala"
        ],
        "modo": "falar"
       }
      ]
     },
     {
      "obj": {
       "tipo": "ingresso",
       "nome": "ツアー",
       "dia": "あした",
       "hora": "3:00"
      },
      "qs": [
       {
        "q": "Quando é o tour? Diga o dia e a hora.",
        "kws": [
         "あした|ashita|明日",
         "さんじ|sanji|三時"
        ],
        "model": "あした、さんじ",
        "modelRo": "ashita, sanji",
        "why": "あした = amanhã, 3:00 = さんじ.",
        "dica": "Dia primeiro, hora depois.",
        "hab": [
         "leitura",
         "escrita"
        ],
        "modo": "escrever"
       }
      ]
     },
     {
      "obj": {
       "tipo": "relogio",
       "h": 4,
       "m": 30
      },
      "qs": [
       {
        "q": "Que horas são no relógio?",
        "kws": [
         "よじ|yoji|四時",
         "はん|han|半"
        ],
        "model": "よじはん",
        "modelRo": "yoji han",
        "why": "O ponteiro curto está entre o 4 e o 5 e o longo no 6: quatro e meia.",
        "dica": "O ponteiro longo no 6 é “meia”.",
        "hab": [
         "leitura",
         "fala"
        ],
        "modo": "falar"
       }
      ]
     }
    ]
   },
   {
    "tipo": "surpresa",
    "nome": "Situação surpresa",
    "instr": "Nem tudo sai como combinado. Ouça e responda em japonês, escrevendo ou falando.",
    "itens": [
     {
      "cena": "Você chegou às 4 e a recepcionista avisa:",
      "say": "きょうの ツアーは もう おわりました。",
      "kana": "きょうの ツアーは もう おわりました。",
      "ro": "Kyō no tsuā wa mō owarimashita.",
      "tr": "O tour de hoje já acabou.",
      "kws": [
       "あした|ashita|明日",
       "おねがいします|onegai|お願い|きます|kimasu"
      ],
      "min": 2,
      "model": "あした、さんじに おねがいします。",
      "modelRo": "Ashita, sanji ni onegaishimasu.",
      "dica": "O tour de hoje acabou: remarque para outro dia.",
      "why": "Qualquer hora serve: o importante é remarcar. あした + hora + に + おねがいします.",
      "hab": [
       "escuta",
       "fala"
      ],
      "modo": "falar"
     },
     {
      "cena": "Olhe o relógio. A recepcionista pergunta:",
      "obj": {
       "tipo": "relogio",
       "h": 5,
       "m": 30
      },
      "say": "ごじまでです。いま、なんじですか？",
      "kana": "ごじまでです。いま、なんじですか？",
      "ro": "Goji made desu. Ima, nanji desu ka?",
      "tr": "É até as 5. Que horas são agora?",
      "kws": [
       "ごじ|goji|五時",
       "はん|han|半"
      ],
      "min": 2,
      "model": "いま、ごじはんです。",
      "modelRo": "Ima, goji han desu.",
      "dica": "Veja o relógio na tela: o ponteiro longo está no 6.",
      "why": "5:30 é ごじ はん. Já passou do horário: o museu fechou às 5.",
      "hab": [
       "escuta",
       "escrita"
      ],
      "modo": "escrever"
     },
     {
      "cena": "Você quer comprar uma lembrança na lojinha. A atendente avisa:",
      "say": "みせは もう おわりました。",
      "kana": "みせは もう おわりました。",
      "ro": "Mise wa mō owarimashita.",
      "tr": "A loja já fechou.",
      "kws": [
       "あした|ashita|明日",
       "きます|kimasu|来ます"
      ],
      "min": 2,
      "model": "あした、くじに きます。",
      "modelRo": "Ashita, kuji ni kimasu.",
      "dica": "Diga que você volta amanhã: あした + hora + に + きます.",
      "why": "Loja fechada: diga quando você volta.",
      "hab": [
       "escuta",
       "fala"
      ],
      "modo": "falar"
     }
    ]
   },
   {
    "tipo": "chamada",
    "nome": "Chamada",
    "instr": "Agora a conversa de verdade: a recepção do museu liga para você. Tem um imprevisto no meio."
   }
  ]
 }
};
