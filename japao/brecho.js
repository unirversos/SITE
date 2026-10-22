/* =========================================================
   ACHADOS NO JAPÃO · Brechó (peças únicas, 1 unidade cada)
   1) Coloque abaixo o WhatsApp que recebe os pedidos do brechó
      (só números, com código do país: Japão = 81, Brasil = 55).
   2) Para cada peça, copie um bloco { ... }. Campos:
     cod     : código curto da peça, ex.: 'BR-001' (vai junto na mensagem do WhatsApp)
     nome    : nome do achado
     origem  : bairro ou brechó + cidade, ex.: 'Shimokitazawa, Tóquio'
     detalhe : tamanho, medidas, estado, marca (1 ou 2 frases)
     de, ate : faixa de preço em ienes (só números; preço único = repita o número)
     foto    : caminho da foto, ex.: '/japao/fotos/br-001.jpg' ('' mostra um ícone)
     status  : 'disponivel' | 'reservada' | 'vendida'
     exemplo : true só nos cards de exemplo. Apague os exemplos quando colocar as suas peças.
   ========================================================= */
window.BRECHO_WHATSAPP = '';
window.BRECHO = [
  { cod:'EX-01', nome:'Exemplo · jaqueta vintage', origem:'Shimokitazawa, Tóquio',
    detalhe:'Peça de exemplo: troque pela sua. Coloque tamanho, medidas (ombro, busto, comprimento) e o estado.',
    de:6000, ate:6000, foto:'', status:'disponivel', exemplo:true },
  { cod:'EX-02', nome:'Exemplo · bolsa de couro anos 90', origem:'Kōenji, Tóquio',
    detalhe:'Peça de exemplo: troque pela sua. Conte a marca, se tiver, e qualquer marquinha de uso.',
    de:8000, ate:8000, foto:'', status:'reservada', exemplo:true },
  { cod:'EX-03', nome:'Exemplo · quimono de seda', origem:'Harajuku, Tóquio',
    detalhe:'Peça de exemplo: troque pela sua. Peça vendida fica na galeria com o selo "vendida".',
    de:12000, ate:12000, foto:'', status:'vendida', exemplo:true }
];
