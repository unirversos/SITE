/* Roteiros das chamadas de vídeo (prova de cada mapa). Um roteiro por território.
   turno: { say (voz), kana (legenda), ro (romaji), tr (tradução), kws (palavras que valem, "a|b|c" = alternativas),
            model/modelRo (resposta de exemplo), opts (frases para escolher se o microfone falhar; a 1ª é a certa) }
   Só entra vocabulário que a aula do mapa ensina. */
window.CHAMADAS = {
 "aeroporto": {
  "slug": "aeroporto",
  "quem": "Oficial da imigração",
  "abre": {
   "say": "こんにちは。",
   "kana": "こんにちは。",
   "ro": "Konnichiwa.",
   "tr": "Boa tarde."
  },
  "turnos": [
   {
    "say": "目的は何ですか。",
    "kana": "もくてきは なんですか。",
    "ro": "Mokuteki wa nan desu ka.",
    "tr": "Qual é o motivo da viagem?",
    "kws": [
     "かんこう|観光|kankou|kankō",
     "しごと|仕事|shigoto",
     "りょこう|旅行|ryokou"
    ],
    "model": "かんこうです。",
    "modelRo": "Kankou desu.",
    "opts": [
     "かんこうです。",
     "パスポートです。",
     "ふたつです。"
    ]
   },
   {
    "say": "目的地はどこですか。",
    "kana": "もくてきちは どこですか。",
    "ro": "Mokutekichi wa doko desu ka.",
    "tr": "Qual é o seu destino?",
    "kws": [
     "とうきょう|東京|toukyou|tōkyō|tokyo",
     "おおさか|大阪|oosaka|osaka",
     "きょうと|京都|kyouto|kyoto"
    ],
    "model": "とうきょうです。",
    "modelRo": "Tōkyō desu.",
    "opts": [
     "とうきょうです。",
     "かんこうです。",
     "ふたつです。"
    ]
   },
   {
    "say": "ご予約はございますか。",
    "kana": "ごよやくは ございますか。",
    "ro": "Go-yoyaku wa gozaimasu ka.",
    "tr": "Tem reserva?",
    "kws": [
     "あります|有ります|arimasu",
     "よやく|予約|yoyaku",
     "はい|hai"
    ],
    "model": "はい、よやくが あります。",
    "modelRo": "Hai, yoyaku ga arimasu.",
    "opts": [
     "はい、よやくが あります。",
     "とうきょうです。",
     "かんこうです。"
    ]
   },
   {
    "say": "荷物はいくつですか。",
    "kana": "にもつは いくつですか。",
    "ro": "Nimotsu wa ikutsu desu ka.",
    "tr": "Quantas bagagens?",
    "kws": [
     "ひとつ|一つ|hitotsu",
     "ふたつ|二つ|futatsu",
     "みっつ|三つ|mittsu",
     "よっつ|四つ|yottsu"
    ],
    "model": "ふたつです。",
    "modelRo": "Futatsu desu.",
    "opts": [
     "ふたつです。",
     "とうきょうです。",
     "かんこうです。"
    ]
   }
  ],
  "fim": {
   "say": "ありがとうございます。ようこそ日本へ。",
   "kana": "ありがとうございます。ようこそ にほんへ。",
   "ro": "Arigatou gozaimasu. Youkoso Nihon e.",
   "tr": "Obrigado. Bem-vindo(a) ao Japão!"
  }
 },
 "hotel": {
  "slug": "hotel",
  "quem": "Recepcionista",
  "abre": {
   "say": "いらっしゃいませ。",
   "kana": "いらっしゃいませ。",
   "ro": "Irasshaimase.",
   "tr": "Bem-vindo(a)."
  },
  "turnos": [
   {
    "say": "いらっしゃいませ。ご予約はありますか。",
    "kana": "いらっしゃいませ。ごよやくは ありますか。",
    "ro": "Irasshaimase. Go-yoyaku wa arimasu ka.",
    "tr": "Bem-vindo(a). Tem reserva?",
    "kws": [
     "あります|有ります|arimasu",
     "よやく|予約|yoyaku"
    ],
    "model": "よやくが あります",
    "modelRo": "Yoyaku ga arimasu.",
    "opts": [
     "よやくが あります",
     "だいじょうぶです",
     "おかいけいを おねがいします。"
    ]
   },
   {
    "say": "お名前をお願いします。",
    "kana": "おなまえを おねがいします。",
    "ro": "O-namae o onegaishimasu.",
    "tr": "Seu nome, por favor.",
    "kws": [
     "です|desu|といいます|もうします"
    ],
    "model": "[seu nome]です。",
    "modelRo": "[seu nome] desu.",
    "opts": [
     "[seu nome]です。",
     "にかいです",
     "いいえ"
    ]
   },
   {
    "say": "朝食は七時から十時までです。",
    "kana": "ちょうしょくは しちじから じゅうじまでです。",
    "ro": "Choushoku wa shichi-ji kara juu-ji made desu.",
    "tr": "O café da manhã é das 7h às 10h.",
    "kws": [
     "わかりました|分かりました|wakarimashita",
     "ありがとう|有難う|arigatou"
    ],
    "model": "わかりました。ありがとう ございます。",
    "modelRo": "Wakarimashita. Arigatou gozaimasu.",
    "opts": [
     "わかりました。ありがとう ございます。",
     "あたためますか",
     "たすけて"
    ]
   },
   {
    "say": "何かご質問はありますか。",
    "kana": "なにか ごしつもんは ありますか。",
    "ro": "Nanika go-shitsumon wa arimasu ka.",
    "tr": "Tem alguma pergunta?",
    "kws": [
     "ワイファイ|わいふぁい|waifai|wifi|wi-fi",
     "かぎ|カギ|鍵|kagi",
     "おねがいします|お願いします|onegaishimasu|onegaishimas"
    ],
    "model": "ワイファイの パスワードを おねがいします。",
    "modelRo": "Waifai no pasuwaado o onegaishimasu.",
    "opts": [
     "ワイファイの パスワードを おねがいします。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "ごゆっくり どうぞ。",
   "kana": "ごゆっくり どうぞ。",
   "ro": "Go-yukkuri douzo.",
   "tr": "Aproveite a estadia."
  }
 },
 "conbini": {
  "slug": "kombini",
  "quem": "Caixa",
  "abre": {
   "say": "こんにちは。",
   "kana": "こんにちは。",
   "ro": "Konnichiwa.",
   "tr": "Boa tarde."
  },
  "turnos": [
   {
    "say": "お弁当を温めますか。",
    "kana": "おべんとうを あたためますか。",
    "ro": "O-bentou o atatamemasu ka.",
    "tr": "Quer que eu esquente a marmita?",
    "kws": [
     "おねがいします|お願いします|onegaishimasu|onegaishimas",
     "はい|hai"
    ],
    "model": "はい、おねがいします。",
    "modelRo": "Hai, onegaishimasu.",
    "opts": [
     "はい、おねがいします。",
     "いくらですか。",
     "ふたつです。"
    ]
   },
   {
    "say": "袋はご利用ですか。",
    "kana": "ふくろは ごりようですか。",
    "ro": "Fukuro wa go-riyou desu ka.",
    "tr": "Vai querer sacola?",
    "kws": [
     "だいじょうぶ|大丈夫|daijoubu|daijobu",
     "いらない|いりません|irimasen|iranai"
    ],
    "model": "だいじょうぶです。",
    "modelRo": "Daijoubu desu.",
    "opts": [
     "だいじょうぶです。",
     "あたためて ください。",
     "ふたつです。"
    ]
   },
   {
    "say": "五百円です。ポイントカードはありますか。",
    "kana": "ごひゃく えんです。ポイント カードは ありますか。",
    "ro": "Go-hyaku en desu. Pointo kaado wa arimasu ka.",
    "tr": "São 500 ienes. Tem cartão de pontos?",
    "kws": [
     "ない|無い|nai",
     "だいじょうぶ|大丈夫|daijoubu|daijobu",
     "カード|かーど|kaado|kado|card",
     "げんきん|現金|genkin",
     "おねがいします|お願いします|onegaishimasu|onegaishimas"
    ],
    "model": "ないです。カードで おねがいします。",
    "modelRo": "Nai desu. Kaado de onegaishimasu.",
    "opts": [
     "ないです。カードで おねがいします。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "ありがとうございました。",
   "kana": "ありがとうございました。",
   "ro": "Arigatou gozaimashita.",
   "tr": "Muito obrigado."
  }
 },
 "restaurante": {
  "slug": "restaurante",
  "quem": "Atendente",
  "abre": {
   "say": "いらっしゃいませ。",
   "kana": "いらっしゃいませ。",
   "ro": "Irasshaimase.",
   "tr": "Bem-vindo(a)."
  },
  "turnos": [
   {
    "say": "何名様ですか。",
    "kana": "なんめい さまですか。",
    "ro": "Nan-mei sama desu ka.",
    "tr": "Mesa para quantos?",
    "kws": [
     "さんにん|三人|sannin|さんめい|3人|ひとり|一人|ふたり|二人|よにん|四人",
     "にん|人|nin|名|めい"
    ],
    "model": "さんにんです",
    "modelRo": "San-nin desu.",
    "opts": [
     "さんにんです",
     "さんじです",
     "メニューです。"
    ]
   },
   {
    "say": "ご注文はお決まりですか。",
    "kana": "ごちゅうもんは おきまりですか。",
    "ro": "Go-chuumon wa o-kimari desu ka.",
    "tr": "Já decidiu o pedido?",
    "kws": [
     "ラーメン|らーめん|raamen|ramen",
     "します|shimasu|おねがいします|お願いします|ください"
    ],
    "model": "ラーメンに します",
    "modelRo": "Raamen ni shimasu.",
    "opts": [
     "ラーメンに します",
     "ラーメンは どこですか。",
     "ふたつです。"
    ]
   },
   {
    "say": "お飲み物はいかがですか。",
    "kana": "おのみものは いかがですか。",
    "ro": "O-nomimono wa ikaga desu ka.",
    "tr": "E para beber?",
    "kws": [
     "みず|水|mizu",
     "おねがいします|お願いします|onegaishimasu|onegaishimas"
    ],
    "model": "みずを おねがいします。",
    "modelRo": "Mizu o onegaishimasu.",
    "opts": [
     "みずを おねがいします。",
     "おかいけいを おねがいします。",
     "ふたつです。"
    ]
   },
   {
    "say": "店内ですか、お持ち帰りですか。",
    "kana": "てんないですか、おもちかえりですか。",
    "ro": "Tennai desu ka, o-mochikaeri desu ka.",
    "tr": "É para comer aqui ou para viagem?",
    "kws": [
     "てんない|店内|tennai",
     "おかいけい|お会計|okaikei",
     "おもちかえり|お持ち帰り|omochikaeri",
     "おねがいします|お願いします|onegaishimasu|onegaishimas"
    ],
    "model": "てんないで おねがいします。… おかいけいを おねがいします。",
    "modelRo": "Tennai de onegaishimasu. ... Okaikei o onegaishimasu.",
    "opts": [
     "てんないで おねがいします。… おかいけいを おねがいします。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "ありがとうございました。",
   "kana": "ありがとうございました。",
   "ro": "Arigatou gozaimashita.",
   "tr": "Muito obrigado."
  }
 },
 "trens": {
  "slug": "trens",
  "quem": "Funcionária da estação",
  "abre": {
   "say": "すみません。",
   "kana": "すみません。",
   "ro": "Sumimasen.",
   "tr": "Com licença."
  },
  "turnos": [
   {
    "say": "すみません、何かお探しですか。",
    "kana": "すみません、なにか おさがしですか。",
    "ro": "Sumimasen, nanika o-sagashi desu ka.",
    "tr": "Com licença, procurando algo?",
    "kws": [
     "ホーム|ほーむ|hoomu|ホ-ム",
     "どこ|何処|doko"
    ],
    "model": "ホームは どこですか",
    "modelRo": "Hoomu wa doko desu ka.",
    "opts": [
     "ホームは どこですか",
     "おかいけいを おねがいします。",
     "あたためますか。"
    ]
   },
   {
    "say": "三番ホームです。まっすぐです。",
    "kana": "さんばん ホームです。まっすぐです。",
    "ro": "San-ban hoomu desu. Massugu desu.",
    "tr": "Plataforma 3. É direto em frente.",
    "kws": [
     "ありがとう|有難う|arigatou"
    ],
    "model": "ありがとう ございます！",
    "modelRo": "Arigatou gozaimasu!",
    "opts": [
     "ありがとう ございます！",
     "だいじょうぶです。",
     "ふたつです。"
    ]
   },
   {
    "say": "この電車は金沢に行きますよ。",
    "kana": "この でんしゃは かなざわに いきますよ。",
    "ro": "Kono densha wa Kanazawa ni ikimasu yo.",
    "tr": "Este trem vai para Kanazawa, viu.",
    "kws": [
     "わかりました|分かりました|wakarimashita",
     "ありがとう|有難う|arigatou"
    ],
    "model": "わかりました。ありがとう ございます。",
    "modelRo": "Wakarimashita. Arigatou gozaimasu.",
    "opts": [
     "わかりました。ありがとう ございます。",
     "いくらですか。",
     "ふたつです。"
    ]
   },
   {
    "say": "次は乗り換えです。ご注意ください。",
    "kana": "つぎは のりかえです。ごちゅうい ください。",
    "ro": "“Tsugi wa norikae desu. Go-chuui kudasai.”",
    "tr": "(anúncio) Próxima estação: baldeação. Atenção.",
    "kws": [
     "のりかえ|乗り換え|乗換|norikae",
     "どこ|何処|doko",
     "です|desu",
     "か|ka",
     "せん|線|sen"
    ],
    "model": "すみません、のりかえは どこですか。",
    "modelRo": "Sumimasen, norikae wa doko desu ka.",
    "opts": [
     "すみません、のりかえは どこですか。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "おきをつけて。",
   "kana": "お気をつけて。",
   "ro": "O-ki o tsukete.",
   "tr": "Cuide-se na viagem."
  }
 },
 "compras": {
  "slug": "compras",
  "quem": "Vendedora",
  "abre": {
   "say": "いらっしゃいませ。",
   "kana": "いらっしゃいませ。",
   "ro": "Irasshaimase.",
   "tr": "Bem-vinda."
  },
  "turnos": [
   {
    "say": "いらっしゃいませ。何かお探しですか。",
    "kana": "いらっしゃいませ。なにか おさがしですか。",
    "ro": "Irasshaimase. Nanika o-sagashi desu ka.",
    "tr": "Bem-vinda! Procurando algo?",
    "kws": [
     "いくら|幾ら|ikura",
     "これ|kore"
    ],
    "model": "これは いくらですか",
    "modelRo": "Kore wa ikura desu ka.",
    "opts": [
     "これは いくらですか",
     "トイレは どこですか。",
     "たすけて！"
    ]
   },
   {
    "say": "三千円です。",
    "kana": "さんぜん えんです。",
    "ro": "San-zen en desu.",
    "tr": "São 3 mil ienes.",
    "kws": [
     "これ|kore",
     "します|shimasu|ください|kudasai"
    ],
    "model": "じゃ、これに します",
    "modelRo": "Ja, kore ni shimasu.",
    "opts": [
     "じゃ、これに します",
     "とおかかんです。",
     "ふたつです。"
    ]
   },
   {
    "say": "お支払いはどうなさいますか。",
    "kana": "おしはらいは どう なさいますか。",
    "ro": "O-shiharai wa dou nasaimasu ka.",
    "tr": "Como vai pagar?",
    "kws": [
     "カード|かーど|kaado|kado|card",
     "げんきん|現金|genkin"
    ],
    "model": "カードで いいですか。",
    "modelRo": "Kaado de ii desu ka.",
    "opts": [
     "カードで いいですか。",
     "かんこうです。",
     "ふたつです。"
    ]
   },
   {
    "say": "免税をご希望ですか。パスポートはお持ちですか。",
    "kana": "めんぜいを ごきぼうですか。パスポートは おもちですか。",
    "ro": "Menzei o go-kibou desu ka. Pasupooto wa o-mochi desu ka.",
    "tr": "Deseja tax-free? Está com o passaporte?",
    "kws": [
     "めんぜい|免税|menzei",
     "パスポート|ぱすぽーと|pasupooto|pasupoto|passport",
     "はい|hai",
     "あります|有ります|arimasu",
     "おねがいします|お願いします|onegaishimasu|onegaishimas"
    ],
    "model": "はい、めんぜいを おねがいします。パスポートは あります。",
    "modelRo": "Hai, menzei o onegaishimasu. Pasupooto wa arimasu.",
    "opts": [
     "はい、めんぜいを おねがいします。パスポートは あります。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "ありがとうございました。",
   "kana": "ありがとうございました。",
   "ro": "Arigatou gozaimashita.",
   "tr": "Muito obrigada."
  }
 },
 "roupas": {
  "slug": "roupas",
  "quem": "Vendedora",
  "abre": {
   "say": "いらっしゃいませ。",
   "kana": "いらっしゃいませ。",
   "ro": "Irasshaimase.",
   "tr": "Bem-vinda."
  },
  "turnos": [
   {
    "say": "ご試着なさいますか。",
    "kana": "ごしちゃく なさいますか。",
    "ro": "Go-shichaku nasaimasu ka.",
    "tr": "Gostaria de provar?",
    "kws": [
     "きがえて|着替えて|kigaete|しちゃく|試着|shichaku",
     "いい|ii|ですか|desu ka"
    ],
    "model": "きがえて みても いいですか。",
    "modelRo": "Kigaete mitemo ii desu ka.",
    "opts": [
     "きがえて みても いいですか。",
     "おかいけいを おねがいします。",
     "ふたつです。"
    ]
   },
   {
    "say": "試着室はあちらです。",
    "kana": "しちゃくしつは あちらです。",
    "ro": "Shichakushitsu wa achira desu.",
    "tr": "O provador é ali.",
    "kws": [
     "ありがとう|有難う|arigatou"
    ],
    "model": "ありがとう ございます。",
    "modelRo": "Arigatou gozaimasu.",
    "opts": [
     "ありがとう ございます。",
     "あたためますか。",
     "ふたつです。"
    ]
   },
   {
    "say": "サイズはいかがですか。",
    "kana": "サイズは いかがですか。",
    "ro": "Saizu wa ikaga desu ka.",
    "tr": "E o tamanho, como está?",
    "kws": [
     "おおきい|大きい|ookii|ちいさい|小さい|chiisai|もっと|motto",
     "ありますか|arimasu"
    ],
    "model": "もっと おおきいのが ありますか。",
    "modelRo": "Motto ookii no ga arimasu ka.",
    "opts": [
     "もっと おおきいのが ありますか。",
     "さんにんです。",
     "ふたつです。"
    ]
   },
   {
    "say": "こちらはセール品です。いかがですか。",
    "kana": "こちらは セールひんです。いかがですか。",
    "ro": "Kochira wa seeru-hin desu. Ikaga desu ka.",
    "tr": "Esta está em promoção. O que acha?",
    "kws": [
     "これ|kore",
     "に|ni",
     "します|shimasu",
     "ください|下さい|kudasai",
     "いくら|幾ら|ikura"
    ],
    "model": "いいですね！じゃ、これに します。",
    "modelRo": "Ii desu ne! Ja, kore ni shimasu.",
    "opts": [
     "いいですね！じゃ、これに します。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "ありがとうございました。",
   "kana": "ありがとうございました。",
   "ro": "Arigatou gozaimashita.",
   "tr": "Muito obrigada."
  }
 },
 "sos": {
  "slug": "emergencia",
  "quem": "Policial do posto",
  "abre": {
   "say": "こんばんは。",
   "kana": "こんばんは。",
   "ro": "Konbanwa.",
   "tr": "Boa noite."
  },
  "turnos": [
   {
    "say": "こんばんは。どうしましたか。",
    "kana": "こんばんは。どう しましたか。",
    "ro": "Konbanwa. Dou shimashita ka.",
    "tr": "Boa noite. O que aconteceu?",
    "kws": [
     "みち|道|michi",
     "まよい|迷い|mayoi"
    ],
    "model": "みちに まよいました",
    "modelRo": "Michi ni mayoimashita.",
    "opts": [
     "みちに まよいました",
     "ラーメンに します。",
     "ふたつです。"
    ]
   },
   {
    "say": "どこに行きたいですか。",
    "kana": "どこに いきたいですか。",
    "ro": "Doko ni ikitai desu ka.",
    "tr": "Para onde você quer ir?",
    "kws": [
     "ホテル|ほてる|hoteru",
     "いきたい|行きたい|ikitai"
    ],
    "model": "ホテルに いきたいです。",
    "modelRo": "Hoteru ni ikitai desu.",
    "opts": [
     "ホテルに いきたいです。",
     "だいじょうぶです。",
     "ふたつです。"
    ]
   },
   {
    "say": "まっすぐ行って、右です。",
    "kana": "まっすぐ いって、みぎです。",
    "ro": "Massugu itte, migi desu.",
    "tr": "Vá reto e vire à direita.",
    "kws": [
     "わかりました|分かりました|wakarimashita",
     "ありがとう|有難う|arigatou"
    ],
    "model": "わかりました。ありがとう ございます！",
    "modelRo": "Wakarimashita. Arigatou gozaimasu!",
    "opts": [
     "わかりました。ありがとう ございます！",
     "めんぜいは できますか。",
     "ふたつです。"
    ]
   },
   {
    "say": "大丈夫ですか。他に何かありますか。",
    "kana": "だいじょうぶですか。ほかに なにか ありますか。",
    "ro": "Daijoubu desu ka. Hoka ni nanika arimasu ka.",
    "tr": "Você está bem? Precisa de mais algo?",
    "kws": [
     "だいじょうぶ|大丈夫|daijoubu|daijobu",
     "ありがとう|有難う|有り難う|arigatou|arigato",
     "です|desu",
     "ございます|ございました|gozaimasu|gozaimashita"
    ],
    "model": "だいじょうぶです。ありがとう ございました！",
    "modelRo": "Daijoubu desu. Arigatou gozaimashita!",
    "opts": [
     "だいじょうぶです。ありがとう ございました！",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "おきをつけて。",
   "kana": "お気をつけて。",
   "ro": "O-ki o tsukete.",
   "tr": "Cuide-se."
  }
 },
 "base": {
  "slug": "apresentacao",
  "quem": "Fátima",
  "abre": {
   "say": "こんにちは！",
   "kana": "こんにちは！",
   "ro": "Konnichiwa!",
   "tr": "Oi!"
  },
  "turnos": [
   {
    "say": "はじめまして！",
    "kana": "はじめまして！",
    "ro": "Hajimemashite!",
    "tr": "Prazer em conhecer!",
    "kws": [
     "はじめまして|初めまして|hajimemashite",
     "です|desu"
    ],
    "model": "はじめまして、[seu nome]です。",
    "modelRo": "Hajimemashite, [seu nome] desu.",
    "opts": [
     "はじめまして、[seu nome]です。",
     "さようなら。",
     "ふたつです。"
    ]
   },
   {
    "say": "どちらから来ましたか。",
    "kana": "どちらから きましたか。",
    "ro": "Dochira kara kimashita ka.",
    "tr": "De onde você veio?",
    "kws": [
     "ブラジル|ぶらじる|burajiru|brazil",
     "から|kara"
    ],
    "model": "ブラジルから きました。",
    "modelRo": "Burajiru kara kimashita.",
    "opts": [
     "ブラジルから きました。",
     "にかいです。",
     "ふたつです。"
    ]
   },
   {
    "say": "日本は初めてですか。",
    "kana": "にほんは はじめてですか。",
    "ro": "Nihon wa hajimete desu ka.",
    "tr": "É sua primeira vez no Japão?",
    "kws": [
     "はじめて|初めて|hajimete",
     "はい|hai"
    ],
    "model": "はい、はじめてです。",
    "modelRo": "Hai, hajimete desu.",
    "opts": [
     "はい、はじめてです。",
     "おかいけいを おねがいします。",
     "ふたつです。"
    ]
   },
   {
    "say": "これからもよろしくね。",
    "kana": "これからも よろしくね。",
    "ro": "Kore kara mo yoroshiku ne.",
    "tr": "Conto com você daqui pra frente, tá?",
    "kws": [
     "よろしく|宜しく|yoroshiku",
     "おねがいします|お願いします|onegaishimasu|onegaishimas",
     "こちら|此方|kochira"
    ],
    "model": "こちら こそ、よろしく おねがいします！",
    "modelRo": "Kochira koso, yoroshiku onegaishimasu!",
    "opts": [
     "こちら こそ、よろしく おねがいします！",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 1
   }
  ],
  "fim": {
   "say": "よろしくね。",
   "kana": "よろしくね。",
   "ro": "Yoroshiku ne.",
   "tr": "Conto com você!"
  }
 },
 "numeros": {
  "slug": "horas",
  "quem": "Recepção do museu",
  "abre": {
   "say": "もしもし。",
   "kana": "もしもし。",
   "ro": "Moshi moshi.",
   "tr": "Alô."
  },
  "turnos": [
   {
    "say": "今何時ですか、そっちは。",
    "kana": "いま なんじですか、そっちは。",
    "ro": "Ima nanji desu ka, socchi wa.",
    "tr": "Que horas são aí agora?",
    "kws": [
     "じ|時|ji",
     "です|desu"
    ],
    "model": "さんじです",
    "modelRo": "San-ji desu.",
    "opts": [
     "さんじです",
     "さんにんです。",
     "ふたつです。"
    ]
   },
   {
    "say": "明日会いましょうか。",
    "kana": "あした あいましょうか。",
    "ro": "Ashita aimashou ka.",
    "tr": "A gente se encontra amanhã?",
    "kws": [
     "いい|ii|いいですね",
     "ですね|desu ne"
    ],
    "model": "いいですね！",
    "modelRo": "Ii desu ne!",
    "opts": [
     "いいですね！",
     "いくらですか。",
     "ふたつです。"
    ]
   },
   {
    "say": "何時に会いましょうか。",
    "kana": "なんじに あいましょうか。",
    "ro": "Nanji ni aimashou ka.",
    "tr": "A que horas nos encontramos?",
    "kws": [
     "じ|時|ji",
     "あいましょう|会いましょう|aimashou|aimasho"
    ],
    "model": "くじに あいましょう",
    "modelRo": "Ku-ji ni aimashou.",
    "opts": [
     "くじに あいましょう",
     "とおかかんです。",
     "ふたつです。"
    ]
   },
   {
    "say": "九時？午前ですか、午後ですか。",
    "kana": "くじ？ごぜんですか、ごごですか。",
    "ro": "Ku-ji? Gozen desu ka, gogo desu ka.",
    "tr": "Nove? Da manhã ou da noite?",
    "kws": [
     "ごぜん|午前|gozen",
     "ごご|午後|gogo",
     "じ|時|ji",
     "です|desu"
    ],
    "model": "ごぜん くじです！",
    "modelRo": "Gozen ku-ji desu!",
    "opts": [
     "ごぜん くじです！",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "じゃ、またあとで。",
   "kana": "じゃ、また あとで。",
   "ro": "Ja, mata ato de.",
   "tr": "Até mais tarde."
  }
 },
 "planos": {
  "slug": "planos",
  "quem": "Hana (amiga)",
  "abre": {
   "say": "やあ。",
   "kana": "やあ。",
   "ro": "Yaa.",
   "tr": "Oi."
  },
  "turnos": [
   {
    "say": "週末、何をしたいですか。",
    "kana": "しゅうまつ、なにを したいですか。",
    "ro": "Shuumatsu, nani o shitai desu ka.",
    "tr": "O que você quer fazer no fim de semana?",
    "kws": [
     "きょうと|京都|kyouto|kyoto|いきたい|行きたい|ikitai",
     "いきたい|行きたい|ikitai|たい|tai"
    ],
    "model": "きょうとに いきたいです。",
    "modelRo": "Kyoto ni ikitai desu.",
    "opts": [
     "きょうとに いきたいです。",
     "みちに まよいました。",
     "ふたつです。"
    ]
   },
   {
    "say": "いいですね！一緒に行きましょうか。",
    "kana": "いいですね！いっしょに いきましょうか。",
    "ro": "Ii desu ne! Issho ni ikimashou ka.",
    "tr": "Boa! Vamos juntos?",
    "kws": [
     "いいですね|ii desu ne",
     "いっしょ|一緒|issho|いきましょう|行きましょう|ikimashou"
    ],
    "model": "いいですね！いっしょに いきましょう。",
    "modelRo": "Ii desu ne! Issho ni ikimashou.",
    "opts": [
     "いいですね！いっしょに いきましょう。",
     "だいじょうぶです。",
     "ふたつです。"
    ]
   },
   {
    "say": "何を食べましょうか。",
    "kana": "なにを たべましょうか。",
    "ro": "Nani o tabemashou ka.",
    "tr": "O que vamos comer?",
    "kws": [
     "ラーメン|らーめん|raamen|ramen",
     "たべましょう|食べましょう|tabemashou|たべよう"
    ],
    "model": "ラーメンを たべましょう！",
    "modelRo": "Raamen o tabemashou!",
    "opts": [
     "ラーメンを たべましょう！",
     "パスポートです。",
     "ふたつです。"
    ]
   },
   {
    "say": "じゃ、何時に出発しましょうか。",
    "kana": "じゃ、なんじに しゅっぱつ しましょうか。",
    "ro": "Ja, nanji ni shuppatsu shimashou ka.",
    "tr": "Então, que horas a gente sai?",
    "kws": [
     "じ|時|ji",
     "に|ni",
     "いきましょう|行きましょう|ikimashou|ikimasho",
     "あいましょう|会いましょう|aimashou|aimasho",
     "しゅっぱつ|出発|shuppatsu"
    ],
    "model": "くじに いきましょう！",
    "modelRo": "Ku-ji ni ikimashou!",
    "opts": [
     "くじに いきましょう！",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "じゃ、またね。",
   "kana": "じゃ、またね。",
   "ro": "Ja, mata ne.",
   "tr": "Até logo!"
  }
 },
 "placas": {
  "slug": "sinalizacao",
  "quem": "Senhora na estação",
  "abre": {
   "say": "すみません。",
   "kana": "すみません。",
   "ro": "Sumimasen.",
   "tr": "Com licença."
  },
  "turnos": [
   {
    "say": "あの店は営業中ですよ。",
    "kana": "あの みせは えいぎょうちゅうですよ。",
    "ro": "Ano mise wa eigyouchuu desu yo.",
    "tr": "Aquela loja está aberta, viu.",
    "kws": [
     "ありがとう|有難う|arigatou"
    ],
    "model": "ありがとう ございます！",
    "modelRo": "Arigatou gozaimasu!",
    "opts": [
     "ありがとう ございます！",
     "あたためますか。",
     "ふたつです。"
    ]
   },
   {
    "say": "出口はあそこです。",
    "kana": "でぐちは あそこです。",
    "ro": "Deguchi wa asoko desu.",
    "tr": "A saída é ali.",
    "kws": [
     "わかりました|分かりました|wakarimashita"
    ],
    "model": "わかりました。",
    "modelRo": "Wakarimashita.",
    "opts": [
     "わかりました。",
     "さんじです。",
     "ふたつです。"
    ]
   },
   {
    "say": "すみません、ここは禁煙です。",
    "kana": "すみません、ここは きんえんです。",
    "ro": "Sumimasen, koko wa kin'en desu.",
    "tr": "Com licença, aqui é proibido fumar.",
    "kws": [
     "すみません|sumimasen",
     "わかりました|分かりました|wakarimashita"
    ],
    "model": "すみません！わかりました。",
    "modelRo": "Sumimasen! Wakarimashita.",
    "opts": [
     "すみません！わかりました。",
     "いいですね！",
     "ふたつです。"
    ]
   },
   {
    "say": "すみません、非常口はどこですか。",
    "kana": "すみません、ひじょうぐちは どこですか。",
    "ro": "Sumimasen, hijouguchi wa doko desu ka.",
    "tr": "Com licença, onde é a saída de emergência?",
    "kws": [
     "あそこ|彼処|asoko",
     "です|desu",
     "まっすぐ|真っ直ぐ|真っすぐ|massugu",
     "みぎ|右|migi",
     "ひだり|左|hidari"
    ],
    "model": "あそこです。まっすぐ いって、みぎです。",
    "modelRo": "Asoko desu. Massugu itte, migi desu.",
    "opts": [
     "あそこです。まっすぐ いって、みぎです。",
     "ふたつです。",
     "かんこうです。"
    ],
    "min": 2
   }
  ],
  "fim": {
   "say": "どういたしまして。",
   "kana": "どういたしまして。",
   "ro": "Dou itashimashite.",
   "tr": "De nada!"
  }
 }
};
