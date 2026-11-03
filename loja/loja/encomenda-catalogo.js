/* =========================================================
   UNIRVERSOS TESOUROS · catálogo das encomendas da Aline
   Cada produto é um bloco { ... }. Para adicionar, copie um bloco e troque os textos.
   Campos:
     id      : apelido único, sem espaço (ex.: 'tsubaki-kit')
     cat     : 'cabelo' | 'solar' | 'skincare' | 'otaku' | 'papelaria'
     nome    : nome do produto
     desc    : uma frase: por que vale trazer do Japão
     yen     : preço na loja japonesa, com imposto (só números). null = "preço sob consulta"
     tipo    : 'facil' (farmácia, beleza, papelaria) ou 'exclusivo' (Pokémon Center, Kuji, garimpo)
     peso    : peso aproximado com embalagem, em gramas (serve para escolher o tamanho do pacote)
     foto    : caminho da imagem, ex.: '/loja/fotos/tsubaki.jpg' ('' usa o emoji da categoria)
     fonte   : de onde veio o preço (ex.: '@cosme, out/2026'). Aparece pequeno no card.
     exemplo : true = preço ainda NÃO conferido (aparece o selo "exemplo"). Troque para false
               depois de conferir o preço na loja oficial.
   ========================================================= */
window.CATEGORIAS = [
  { id:'cabelo',    nome:'Cabelo',    emoji:'💇‍♀️' },
  { id:'solar',     nome:'Solar',     emoji:'☀️' },
  { id:'skincare',  nome:'Skincare',  emoji:'🧴' },
  { id:'otaku',     nome:'Otaku',     emoji:'🎴' },
  { id:'papelaria', nome:'Papelaria', emoji:'✏️' }
];

window.CATALOGO = [
  { id:'tsubaki-kit', cat:'cabelo', nome:'Tsubaki Premium · kit shampoo + condicionador',
    desc:'Linha de farmácia japonesa para cabelo danificado.',
    yen:2000, tipo:'facil', peso:1100, foto:'', fonte:'', exemplo:true },
  { id:'the-answer', cat:'cabelo', nome:'The Answer · Complete Lamellar Milk',
    desc:'Tratamento sem enxágue no ranking de cabelo da @cosme 2026.',
    yen:1500, tipo:'facil', peso:150, foto:'', fonte:'', exemplo:true },

  { id:'biore-uv', cat:'solar', nome:'Bioré UV Aqua Rich Watery Essence',
    desc:'O protetor japonês clássico: textura de água, não pesa no calor.',
    yen:1000, tipo:'facil', peso:100, foto:'', fonte:'', exemplo:true },
  { id:'anessa', cat:'solar', nome:'Anessa Perfect UV Milk',
    desc:'Protetor resistente à água e ao suor, para praia e esporte.',
    yen:3000, tipo:'facil', peso:100, foto:'', fonte:'', exemplo:true },

  { id:'dprogram-lotion', cat:'skincare', nome:'d program Moist Care Lotion EX (125 ml)',
    desc:'Grande vencedor da @cosme no 1º semestre de 2026, para pele sensível.',
    yen:3300, tipo:'facil', peso:200, foto:'', fonte:'@cosme Best Cosmetics 2026 (1º sem.)', exemplo:false },
  { id:'hada-labo', cat:'skincare', nome:'Hada Labo Gokujyun · loção',
    desc:'Hidratação com ácido hialurônico, best-seller de farmácia.',
    yen:900, tipo:'facil', peso:200, foto:'', fonte:'', exemplo:true },

  { id:'pokecenter-pelucia', cat:'otaku', nome:'Pelúcia exclusiva do Pokémon Center',
    desc:'Só vendida nas lojas Pokémon Center do Japão.',
    yen:3000, tipo:'exclusivo', peso:300, foto:'', fonte:'', exemplo:true },
  { id:'ichiban-kuji', cat:'otaku', nome:'Ichiban Kuji · 1 bilhete',
    desc:'Loteria de prêmios exclusivos de anime: o prêmio é surpresa.',
    yen:800, tipo:'exclusivo', peso:300, foto:'', fonte:'', exemplo:true },
  { id:'garimpo-mandarake', cat:'otaku', nome:'Garimpo em Mandarake / Suruga-ya',
    desc:'Você diz o que procura (figure, mangá, card) e eu caço em Akihabara e Nakano.',
    yen:null, tipo:'exclusivo', peso:400, foto:'', fonte:'', exemplo:false },

  { id:'kuru-toga', cat:'papelaria', nome:'Lapiseira Kuru Toga',
    desc:'O grafite gira sozinho e não quebra; cores que só saem no Japão.',
    yen:550, tipo:'facil', peso:30, foto:'', fonte:'', exemplo:true },
  { id:'jetstream-4e1', cat:'papelaria', nome:'Uni Jetstream 4&1',
    desc:'4 cores de caneta e lapiseira em uma só.',
    yen:1100, tipo:'facil', peso:30, foto:'', fonte:'', exemplo:true }
];
