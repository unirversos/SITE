/* =========================================================
   MONTE SUA CAIXINHA · produtos soltos do carrinho (pedido mínimo R$ 600)
   Campos: id, nome, tam (tamanho), preco (R$ final, sem taxa de alfândega no card),
           foto (caminho; '' usa o ícone), desc, ic (ícone se não houver foto)
   Preço = custo no Japão (¥ com imposto × 0,04) × 2 (margem de 100%), arredondado.
   Para adicionar um produto, copie um bloco { ... } e troque os textos.
   ========================================================= */
window.CAIXINHA_MIN = 600;
window.CAIXINHA_MAX_QTD = 5;
window.CAIXINHA = [
  { id:'cx-anessa-milk', nome:'Anessa Perfect UV Skincare Milk NA', tam:'60 ml', preco:245, foto:'/loja/fotos/kit-gi-1.jpg', ic:'🧴',
    desc:'Protetor solar da Shiseido, FPS 50+ PA++++ (como na embalagem). Produto novo.' },
  { id:'cx-melano-cc', nome:'Melano CC · essência de vitamina C', tam:'20 ml', preco:130, foto:'/loja/fotos/kit-gi-2.jpg', ic:'🍋',
    desc:'Essência (sérum) Melano CC da Rohto, versão premium para manchas (薬用しみ集中対策プレミアム美容液). Produto novo.' },
  { id:'cx-nameraka-olhos', nome:'Nameraka Honpo · creme para os olhos antirrugas', tam:'20 g', preco:70, foto:'/loja/fotos/kit-gi-3.jpg', ic:'👁️',
    desc:'Wrinkle Eye Cream N da linha Nameraka Honpo (Sana). Produto novo.' },
  { id:'cx-fino-mask', nome:'Fino Premium Touch · máscara capilar', tam:'230 g', preco:61, foto:'/loja/fotos/kit-gi-4.jpg', ic:'💆',
    desc:'Máscara capilar concentrada com sérum, da Fine Today. Produto novo.' },
  { id:'cx-tsubaki-mask', nome:'Tsubaki Premium EX · máscara de reparação', tam:'180 g', preco:104, foto:'/loja/fotos/kit-gi-5.jpg', ic:'🌸',
    desc:'Máscara de reparação capilar Tsubaki Premium EX, da Fine Today. Produto novo.' }
];
