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
  { id:'3ds-vermelho-metalico', cat:'consoles', nome:'Nintendo 3DS · vermelho metálico',
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
  { id:'gojo-shibuya-scramble', cat:'colec', nome:'Jujutsu Kaisen · Satoru Gojo, Monochrome Ver. Shibuya Scramble',
    desc:'Figure do Satoru Gojo (Jujutsu Kaisen), versão monocromática Shibuya Scramble. Estado e caixa a confirmar com o vendedor.',
    de:0, ate:0, total:2250, imposto:668, chegada:'dezembro', foto:'', link:'' },
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
    de:0, ate:0, foto:'', link:'' }
];
