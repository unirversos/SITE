/* =========================================================
   ACHADOS NO JAPÃO · lista de produtos da vitrine
   Para adicionar um achado, copie um bloco { ... }, cole abaixo
   e troque os textos. Campos:
     id     : nome curto sem espaços e sem acento (ex.: '3ds-rosa-gloss'). É o que liga o cartão ao status do admin
     cat    : 'consoles' | 'colec' | 'reliquias' | 'gadgets'
     nome   : nome do produto
     desc   : por que é um achado (1 ou 2 frases)
     de, ate: faixa de preço em ienes (só números). Se for preço único, repita o número.
     fotos  : lista de várias fotos (opcional): ['/loja/fotos/a.jpg','/loja/fotos/b.jpg']. A primeira é a capa
     foto   : caminho da imagem, ex.: '/loja/fotos/console.jpg' (deixe '' para usar o ícone)
     link   : link de afiliado ou do redirecionador (ZenMarket, Buyee...). Deixe '' para "link em breve".
     total  : preço total em reais (opcional). O produto é o total menos o imposto
     imposto: estimativa do imposto de importação em reais, pago na chegada (opcional)
     chegada: texto como 'dezembro' (opcional)
     exemplo: true só nos cards de exemplo. Apague os exemplos quando colocar os seus.
   ========================================================= */
window.ACHADOS = [
  { id:'pro-controller-zelda-40', cat:'zelda', nome:'Zelda 40 anos · controle Pro para Nintendo Switch 2 · com base', novo:true, br:{preco:2000,rotulo:'com base'},
    desc:'Controle Pro do Nintendo Switch 2, edição de 40 anos de The Legend of Zelda, novo. Na foto aparece na caixa, com o controle dourado e verde e a base de exibição incluída (a caixa indica “ディスプレイスタンド付き”, com suporte de exibição). Atenção: existe uma versão parecida do controle SEM a base, mais barata; esta é a versão COM base. Só há uma foto no anúncio, então o estado da embalagem e o conteúdo da caixa devem ser confirmados com o vendedor.',
    de:0, ate:0, total:2176, imposto:0, custoImposto:649, chegada:'dezembro', foto:'', fotos:['/loja/fotos/pro-controller-zelda-3.jpg','/loja/fotos/pro-controller-zelda-1.jpg'], contem:true, link:'' },
  { id:'game-watch-zelda', cat:'zelda', nome:'Game & Watch · The Legend of Zelda', novo:true,
    desc:'Console portátil Game & Watch da Nintendo, edição The Legend of Zelda, novo e lacrado (indicado no título do anúncio, “新品未開封”). Na foto aparece na embalagem, com a tela mostrando a abertura do jogo original. Só há uma foto no anúncio, então o conteúdo da caixa e o estado da embalagem devem ser confirmados com o vendedor.',
    de:0, ate:0, total:616, imposto:0, custoImposto:192, chegada:'dezembro', foto:'', fotos:['/loja/fotos/game-watch-zelda-1.jpg','/loja/fotos/game-watch-zelda-2.jpg'], contem:true, link:'' },
  { id:'joycon-zelda-azul', cat:'zelda', nome:'Nintendo Switch · Joy-Con azuis com tema Zelda',
    desc:'Par de Joy-Con da Nintendo Switch, azuis com motivos de The Legend of Zelda (emblema vermelho e detalhes dourados), vistos na foto acoplados a um suporte de Joy-Con. O título do anúncio informa “funcionamento verificado” (動作確認済み). Só há uma foto no anúncio, então o desgaste, o que acompanha o par e o estado dos analógicos devem ser confirmados com o vendedor.',
    antes:['Item usado, garimpado no Japão e vendido no estado mostrado nas fotos.','O anúncio diz que o funcionamento foi verificado, mas não detalha desgaste nem bateria.','Analógico com “drift” é um desgaste comum em Joy-Con usados: vale pedir ao vendedor para testar e confirmar.'],
    de:0, ate:0, total:799, imposto:0, custoImposto:215, chegada:'dezembro', foto:'', fotos:['/loja/fotos/joycon-zelda-1.jpg'], contem:true, link:'' },
  { id:'3ds-vermelho-metalico', vendido:true, cat:'consoles', nome:'Nintendo 3DS · vermelho metálico',
    desc:'Console portátil da Nintendo em estado de como novo, segundo o vendedor. Acompanha carregador, base de carregamento, caneta e cartão SD de 4 GB, como mostram as fotos.',
    de:0, ate:0, total:1500, imposto:445, chegada:'dezembro', foto:'', fotos:['/loja/fotos/3ds-vermelho-1.jpg','/loja/fotos/3ds-vermelho-2.jpg','/loja/fotos/3ds-vermelho-3.jpg','/loja/fotos/3ds-vermelho-4.jpg','/loja/fotos/3ds-vermelho-5.jpg','/loja/fotos/3ds-vermelho-6.jpg'], link:'' },
  { id:'3ds-rosa-gloss', cat:'consoles', nome:'Nintendo 3DS · rosa gloss',
    desc:'Console portátil da Nintendo na cor rosa gloss. Pelo que se vê nas fotos: riscos na tela de baixo e uma pequena lasca de tinta na dobradiça. Aparecem também carregador, base de carregamento, caneta e dois jogos (Luigi’s Mansion 2 e Tomodachi Collection, em japonês). Confirmar com o vendedor o que está incluído.',
    de:0, ate:0, total:1875, imposto:557, chegada:'dezembro', foto:'', fotos:['/loja/fotos/3ds-rosa-gloss-1.jpg','/loja/fotos/3ds-rosa-gloss-2.jpg','/loja/fotos/3ds-rosa-gloss-3.jpg','/loja/fotos/3ds-rosa-gloss-4.jpg','/loja/fotos/3ds-rosa-gloss-5.jpg','/loja/fotos/3ds-rosa-gloss-7.jpg','/loja/fotos/3ds-rosa-gloss-6.jpg'], link:'' },
  { id:'3ds-rosa-claro', cat:'consoles', nome:'Nintendo 3DS · rosa claro',
    desc:'Console portátil da Nintendo na cor rosa claro, com caixa original, manual, carregador, base de carregamento e caneta, como mostram as fotos. Nas fotos o console liga e mostra a tela de abertura. A tela de baixo tem vários riscos visíveis. Confirmar com o vendedor o que está incluído.',
    de:0, ate:0, total:1740, imposto:515, chegada:'dezembro', foto:'', fotos:['/loja/fotos/3ds-rosa-claro-1.jpg','/loja/fotos/3ds-rosa-claro-2.jpg','/loja/fotos/3ds-rosa-claro-3.jpg','/loja/fotos/3ds-rosa-claro-4.jpg','/loja/fotos/3ds-rosa-claro-5.jpg','/loja/fotos/3ds-rosa-claro-6.jpg','/loja/fotos/3ds-rosa-claro-7.jpg','/loja/fotos/3ds-rosa-claro-8.jpg'], link:'' },
  { id:'3ds-rosa-claro-carregador', cat:'consoles', nome:'Nintendo 3DS · rosa claro, com carregador',
    desc:'Console portátil da Nintendo na cor rosa claro, com carregador. Nas fotos a tela de cima mostra pontos escuros (pode ser sujeira ou resto de película) e as telas aparecem desligadas, então não dá para ver se liga. Sem caixa nas fotos. Confirmar com o vendedor.',
    de:0, ate:0, total:1110, imposto:330, chegada:'dezembro', foto:'', fotos:['/loja/fotos/3ds-rosa-claro-carregador-1.jpg','/loja/fotos/3ds-rosa-claro-carregador-2.jpg','/loja/fotos/3ds-rosa-claro-carregador-3.jpg','/loja/fotos/3ds-rosa-claro-carregador-4.jpg','/loja/fotos/3ds-rosa-claro-carregador-5.jpg'], link:'' },
  { id:'miku-tmost-nt', cat:'colec', nome:'Hatsune Miku · T-most (NT ver.)',
    desc:'Figure da Hatsune Miku da linha T-most, da Taito (versão NT), na caixa original. Pela foto, a caixa aparece fechada e sem avarias visíveis. Só há uma foto no anúncio, então o estado interno da figure e de eventuais detalhes da caixa deve ser confirmado com o vendedor.',
    de:0, ate:0, total:240, imposto:71, chegada:'dezembro', foto:'', fotos:['/loja/fotos/miku-tmost-nt-1.jpg'], contem:true, link:'' },
  { id:'miku-conjunto-5', cat:'colec', nome:'Hatsune Miku · conjunto com 5 figures (Taito)',
    desc:'Conjunto de 5 figures da Hatsune Miku, da Taito, todas em caixa. Pelas caixas na foto: T-most, T-most (NT ver.), Snow Miku All Stars (2012 ver. e 2013 ver.) e Birthday 2026. As caixas aparecem fechadas na foto, sem avarias visíveis. Só há uma foto no anúncio, então o estado das figures e das caixas deve ser confirmado com o vendedor. Vendido como conjunto, não separado.',
    de:0, ate:0, total:925, imposto:275, chegada:'dezembro', foto:'', fotos:['/loja/fotos/miku-conjunto-5-1.jpg'], contem:true, link:'' },
  { id:'miku-conjunto-5b', cat:'colec', nome:'Hatsune Miku · segundo conjunto com 5 figures',
    desc:'Conjunto de 5 figures da Hatsune Miku, todas em caixa. Pelas caixas na foto: Snow Miku All Stars (2012 ver. e 2013 ver., da Taito), uma da Furyu em parceria com Melffy, e duas da linha Figurizm α, da SEGA (uma delas com “Cosmic” na caixa). As caixas aparecem fechadas na foto, sem avarias visíveis. Só há uma foto no anúncio, então o estado das figures e das caixas deve ser confirmado com o vendedor. Vendido como conjunto, não separado.',
    de:0, ate:0, total:1014, imposto:301, chegada:'dezembro', foto:'', fotos:['/loja/fotos/miku-conjunto-5b-1.jpg'], contem:true, link:'' },
  { id:'onepiece-luffy-gear5-b', cat:'colec', nome:'One Piece · Luffy Gear 5 · Ichiban Kuji prêmio B (Masterlise Expiece)',
    desc:'Figure do Monkey D. Luffy no Gear 5, prêmio B da Ichiban Kuji de One Piece “思い描く未来”, linha Masterlise Expiece, da Bandai Namco (全1種, ou seja, um único modelo nesse prêmio). Na foto aparece na caixa, com a caixa fechada e sem avarias visíveis. O anúncio traz só uma foto, então o estado da caixa e do conteúdo deve ser confirmado com o vendedor.',
    de:1849, ate:1849, total:231, imposto:69, chegada:'dezembro', foto:'', fotos:['/loja/fotos/onepiece-luffy-gear5-1.jpg'], contem:true, link:'' },
  { id:'onepiece-zoro-world-journey', cat:'colec', nome:'One Piece · Roronoa Zoro · Treasure Cruise World Journey vol.1',
    desc:'Figure do Roronoa Zoro, da linha Treasure Cruise World Journey vol.1, da Banpresto (Bandai Spirits), edição do aniversário de 20 anos de One Piece (selo “20th Anniversary” na caixa). Na foto aparece na caixa, que parece fechada, em bom estado. O anúncio traz só uma foto, então o estado da caixa e do conteúdo deve ser confirmado com o vendedor.',
    de:2800, ate:2800, total:350, imposto:104, chegada:'dezembro', foto:'', fotos:['/loja/fotos/onepiece-zoro-1.jpg'], contem:true, link:'' },
  { id:'onepiece-luffy-maximatic', cat:'colec', nome:'One Piece · Monkey D. Luffy · Maximatic Plus', novo:true,
    desc:'Figure do Monkey D. Luffy, linha Maximatic Plus (MAXIMATICPLUS MONKEY.D.LUFFY I), da Bandai Namco / Banpresto (全1種, um único modelo). O título do anúncio informa “novo e lacrado” (新品未開封). Na foto aparece na caixa fechada. O anúncio traz só uma foto, então o estado da caixa deve ser confirmado com o vendedor.',
    de:2800, ate:2800, total:350, imposto:104, chegada:'dezembro', foto:'', fotos:['/loja/fotos/onepiece-luffy-maximatic-1.jpg'], contem:true, link:'' },
  { id:'zelda-case-switch2-40', cat:'zelda', nome:'Zelda 40 anos · estojo para Nintendo Switch 2',
    desc:'Estojo de transporte para Nintendo Switch 2 da edição de 40 anos de The Legend of Zelda, com a Triforce dourada na frente. Na foto aparece na caixa, com plástico de proteção e a indicação “新品未開封” (novo, lacrado), e a caixa cita uma película protetora de tela inclusa. Só há uma foto no anúncio, então a condição e o que está incluído devem ser confirmados com o vendedor.',
    de:0, ate:0, total:758, imposto:0, custoImposto:204, chegada:'dezembro', foto:'', fotos:['/loja/fotos/zelda-case-switch2-1.jpg'], contem:true, link:'' },
  { id:'zelda-master-sword', cat:'colec', nome:'Zelda · Master Sword e outros itens',
    desc:'Itens de The Legend of Zelda em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'sofubi-godzilla', cat:'colec', nome:'Sofubi Godzilla',
    desc:'Figures de vinil do Godzilla, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'pelucias-pokemon-fit', cat:'colec', nome:'Pelúcias Pokémon Fit',
    desc:'Pelúcias pequenas de Pokémon, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'amiibos', cat:'colec', nome:'Amiibos',
    desc:'Amiibos em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'mini-impressora-fotos', cat:'gadgets', nome:'Mini impressora de fotos',
    desc:'Impressora portátil de fotos, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'fones-transparentes', cat:'gadgets', nome:'Fones transparentes',
    desc:'Fones de ouvido de design transparente, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { id:'genki-1-livro', cat:'didatico', nome:'Genki I · Livro-texto (3ª edição)',
    desc:'Livro-texto Genki I, 3ª edição: “An Integrated Course in Elementary Japanese” (初級日本語 げんき), da The Japan Times Publishing, de Eri Banno, Yoko Ikeda, Yutaka Ohno, Chikako Shinagawa e Kyoko Tokashiki. Capa laranja, volume I. O estado (novo ou usado) deve ser confirmado antes da compra.',
    de:3500, ate:3500, total:330, imposto:130, chegada:'dezembro', foto:'', fotos:['/loja/fotos/genki-1-livro-1.jpg'], contem:true, link:'' },
  { id:'genki-1-workbook', cat:'didatico', nome:'Genki I · Workbook (3ª edição)',
    desc:'Workbook (ワークブック) do Genki I, 3ª edição, da The Japan Times Publishing: caderno de exercícios que acompanha o livro-texto do volume I. O estado (novo ou usado) deve ser confirmado antes da compra.',
    de:1500, ate:1500, total:162, imposto:56, chegada:'dezembro', foto:'', fotos:['/loja/fotos/genki-1-workbook-1.jpg'], contem:true, link:'' },
  { id:'genki-2-workbook', cat:'didatico', nome:'Genki II · Workbook (3ª edição)',
    desc:'Workbook (ワークブック) do Genki II, 3ª edição, da The Japan Times Publishing: caderno de exercícios que acompanha o livro-texto do volume II. Capa verde. O estado (novo ou usado) deve ser confirmado antes da compra.',
    de:1500, ate:1500, total:162, imposto:56, chegada:'dezembro', foto:'', fotos:['/loja/fotos/genki-2-workbook-1.jpg'], contem:true, link:'' },
  { id:'genki-2-livro', cat:'didatico', nome:'Genki II · Livro-texto (3ª edição)',
    desc:'Livro-texto Genki II, 3ª edição: “An Integrated Course in Elementary Japanese” (初級日本語 げんき), da The Japan Times Publishing, dos mesmos autores do volume I. Capa verde, volume II. O estado (novo ou usado) deve ser confirmado antes da compra.',
    de:3500, ate:3500, total:330, imposto:130, chegada:'dezembro', foto:'', fotos:['/loja/fotos/genki-2-livro-1.jpg'], contem:true, link:'' },
];
