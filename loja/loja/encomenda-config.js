/* =========================================================
   UNIRVERSOS TESOUROS · regras das encomendas da Aline
   É aqui que você muda os números da calculadora do checkout.
   Depois de editar, salve e dê push: a página /loja/checkout/ lê daqui.
   ========================================================= */
window.ENCOMENDA = {
  // Viagem e vagas (só aparecem como texto na página)
  viagem: 'Japão · 05/12/2026 a 28/01/2027',
  vagas: 20,

  // Seu WhatsApp, só dígitos, com DDI 55 (ex.: '5519999999999'). Vazio = botão desligado.
  whatsapp: '',

  // Câmbio. A página tenta buscar o câmbio do dia sozinha.
  // Se não conseguir, usa este valor de referência (reais por 1 iene).
  cambioReserva: 0.0322,
  cambioReservaData: '24/10/2026',
  margemCambio: 5,           // % somado ao câmbio para cobrir IOF e spread do cartão

  // Sua taxa
  taxaFixa: 100,             // R$ por pedido
  pctFacil: 10,              // % sobre itens fáceis (farmácia, beleza, papelaria)
  pctExclusivo: 25,          // % sobre exclusivos e garimpo (Pokémon Center, Kuji, Mandarake...)
  minimoIenes: 30000,        // pedido mínimo em produtos (0 = sem mínimo)

  // Frete do Japão ao Brasil por tamanho de pacote.
  // valor: null = "a cotar" (fica fora do total até você preencher com a cotação da agência).
  // ateKg: peso máximo do pacote. O carrinho escolhe o pacote sozinho pelo peso somado dos produtos.
  frete: [
    { id:'p1', nome:'Pequeno · até 1 kg', ateKg:1, dica:'2 a 4 itens de skincare ou papelaria', valor:null },
    { id:'p3', nome:'Médio · até 3 kg',   ateKg:3, dica:'kit de cabelo, vários itens, uma figure', valor:null },
    { id:'p5', nome:'Grande · até 5 kg',  ateKg:5, dica:'pedido grande ou caixas volumosas', valor:null }
  ],
  pesoPadrao: 300,           // gramas usados para produto fora do catálogo (peso desconhecido)

  // Imposto de importação: estimativa SÓ INFORMATIVA (o cliente paga na chegada).
  // Confirme a regra do seu envio com a agência antes de divulgar este número.
  impostoPct: 60,            // % sobre produtos + frete, estimativa conservadora

  // Cartão: taxa da plataforma de link de pagamento + antecipação, somadas.
  // null = ainda não definida (a opção de cartão mostra "a definir").
  cartaoPct: null,
  sinalPix: 50               // % do sinal no Pix
};
