/* =========================================================
   ACHADOS NO JAPÃO · lista de produtos da vitrine
   Para adicionar um achado, copie um bloco { ... }, cole abaixo
   e troque os textos. Campos:
     cat    : 'consoles' | 'colec' | 'reliquias' | 'gadgets'
     nome   : nome do produto
     desc   : por que é um achado (1 ou 2 frases)
     de, ate: faixa de preço em ienes (só números). Se for preço único, repita o número.
     foto   : caminho da imagem, ex.: '/loja/fotos/console.jpg' (deixe '' para usar o ícone)
     link   : link de afiliado ou do redirecionador (ZenMarket, Buyee...). Deixe '' para "link em breve".
     total  : preço total em reais (opcional). O parcelado em 12x é o total menos o imposto
     imposto: estimativa do imposto de importação em reais, pago na chegada (opcional)
     chegada: texto como 'dezembro' (opcional)
     exemplo: true só nos cards de exemplo. Apague os exemplos quando colocar os seus.
   ========================================================= */
window.ACHADOS = [
  { cat:'consoles', nome:'Nintendo 3DS · vermelho metálico',
    desc:'Console portátil da Nintendo em estado de como novo, segundo o vendedor. Acessórios a confirmar.',
    de:0, ate:0, total:1500, imposto:445, chegada:'dezembro', foto:'', link:'' },
  { cat:'consoles', nome:'Nintendo 3DS · rosa gloss',
    desc:'Console portátil da Nintendo na cor rosa gloss. Estado e acessórios a confirmar com o vendedor.',
    de:0, ate:0, total:1875, imposto:557, chegada:'dezembro', foto:'', link:'' },
  { cat:'consoles', nome:'Nintendo 3DS · rosa claro',
    desc:'Console portátil da Nintendo na cor rosa claro. Estado e acessórios a confirmar com o vendedor.',
    de:0, ate:0, total:1740, imposto:515, chegada:'dezembro', foto:'', link:'' },
  { cat:'consoles', nome:'Nintendo 3DS · rosa claro, com carregador',
    desc:'Console portátil da Nintendo na cor rosa claro, com carregador. Estado e caixa a confirmar com o vendedor.',
    de:0, ate:0, total:1110, imposto:330, chegada:'dezembro', foto:'', link:'' },
  { cat:'colec', nome:'Zelda · Master Sword e outros itens',
    desc:'Itens de The Legend of Zelda em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { cat:'colec', nome:'Sofubi Godzilla',
    desc:'Figures de vinil do Godzilla, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { cat:'colec', nome:'Pelúcias Pokémon Fit',
    desc:'Pelúcias pequenas de Pokémon, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { cat:'colec', nome:'Amiibos',
    desc:'Amiibos em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { cat:'gadgets', nome:'Mini impressora de fotos',
    desc:'Impressora portátil de fotos, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' },
  { cat:'gadgets', nome:'Fones transparentes',
    desc:'Fones de ouvido de design transparente, em seleção para o malote de dezembro.',
    de:0, ate:0, foto:'', link:'' }
];
