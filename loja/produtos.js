/* =========================================================
   ACHADOS NO JAPÃO · lista de produtos da vitrine
   Para adicionar um achado, copie um bloco { ... }, cole abaixo
   e troque os textos. Campos:
     cat    : 'consoles' | 'colec' | 'reliquias'
     nome   : nome do produto
     desc   : por que é um achado (1 ou 2 frases)
     de, ate: faixa de preço em ienes (só números). Se for preço único, repita o número.
     foto   : caminho da imagem, ex.: '/loja/fotos/console.jpg' (deixe '' para usar o ícone)
     link   : link de afiliado ou do redirecionador (ZenMarket, Buyee...). Deixe '' para "link em breve".
     exemplo: true só nos cards de exemplo. Apague os exemplos quando colocar os seus.
   ========================================================= */
window.ACHADOS = [
  { cat:'consoles', nome:'Exemplo · console ou portátil preservado',
    desc:'Card de exemplo: troque pelo seu achado. Conte o estado de conservação e se vem completo, na caixa.',
    de:0, ate:0, foto:'', link:'', exemplo:true },
  { cat:'colec', nome:'Exemplo · figure ou colecionável',
    desc:'Card de exemplo: troque pelo seu achado. Conte se é edição limitada ou difícil de achar fora do Japão.',
    de:0, ate:0, foto:'', link:'', exemplo:true },
  { cat:'reliquias', nome:'Exemplo · relíquia vintage',
    desc:'Card de exemplo: troque pelo seu achado. Conte de onde veio e por que é especial.',
    de:0, ate:0, foto:'', link:'', exemplo:true }
];
