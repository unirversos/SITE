/* =========================================================
   ACHADOS NO JAPÃO · lista de produtos da vitrine
   Para adicionar um achado, copie um bloco { ... }, cole abaixo
   e troque os textos. Campos:
     cat    : 'beleza' | 'nerd' | 'tech' | 'moda'
     nome   : nome do produto
     desc   : por que é um achado (1 ou 2 frases)
     de, ate: faixa de preço em ienes (só números). Se for preço único, repita o número.
     foto   : caminho da imagem, ex.: '/loja/fotos/protetor.jpg' (deixe '' para usar o ícone)
     link   : link de afiliado ou do redirecionador (ZenMarket, Buyee...). Deixe '' para "link em breve".
     exemplo: true só nos cards de exemplo. Apague os exemplos quando colocar os seus.
   ========================================================= */
window.ACHADOS = [
  { cat:'beleza', nome:'Exemplo · protetor solar de farmácia',
    desc:'Card de exemplo: troque pelo seu achado. Aqui vai em uma frase por que vale a pena trazer do Japão.',
    de:1000, ate:2000, foto:'', link:'', exemplo:true },
  { cat:'nerd', nome:'Exemplo · item do Pokémon Center',
    desc:'Card de exemplo: troque pelo seu achado. Conte se é exclusivo, edição limitada ou difícil de achar fora do Japão.',
    de:2000, ate:5000, foto:'', link:'', exemplo:true },
  { cat:'tech', nome:'Exemplo · gadget do mercado japonês',
    desc:'Card de exemplo: troque pelo seu achado. Avise se a tomada, a voltagem ou o idioma do aparelho exigem cuidado.',
    de:3000, ate:8000, foto:'', link:'', exemplo:true },
  { cat:'moda', nome:'Exemplo · tênis de tiragem limitada',
    desc:'Card de exemplo: troque pelo seu achado. Diga a numeração japonesa (em cm) para a pessoa não errar o tamanho.',
    de:12000, ate:20000, foto:'', link:'', exemplo:true }
];
