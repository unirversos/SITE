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
  { id:'cx-anessa-milk', grupo:'Rosto e proteção solar', nome:'Anessa Perfect UV Skincare Milk NA', tam:'60 ml', preco:245, foto:'/loja/fotos/kit-gi-1.jpg', ic:'🧴',
    desc:'Protetor solar da Shiseido, FPS 50+ PA++++ (como na embalagem). Produto novo.' },
  { id:'cx-melano-cc', grupo:'Rosto e proteção solar', nome:'Melano CC · essência de vitamina C', tam:'20 ml', preco:97, foto:'/loja/fotos/kit-gi-2.jpg', ic:'🍋',
    desc:'Essência (sérum) Melano CC da Rohto, versão premium para manchas (薬用しみ集中対策プレミアム美容液). Produto novo.' },
  { id:'cx-nameraka-olhos', grupo:'Rosto e proteção solar', nome:'Nameraka Honpo · creme para os olhos antirrugas', tam:'20 g', preco:70, foto:'/loja/fotos/kit-gi-3.jpg', ic:'👁️',
    desc:'Wrinkle Eye Cream N da linha Nameraka Honpo (Sana). Produto novo.' },
  { id:'cx-fino-mask', grupo:'Cabelo', nome:'Fino Premium Touch · máscara capilar', tam:'230 g', preco:77, foto:'/loja/fotos/kit-gi-4.jpg', ic:'💆',
    desc:'Máscara capilar concentrada com sérum, da Fine Today. Produto novo.' },
  { id:'cx-tsubaki-mask', grupo:'Cabelo', nome:'Tsubaki Premium EX · máscara de reparação', tam:'180 g', preco:104, foto:'/loja/fotos/kit-gi-5.jpg', ic:'🌸',
    desc:'Máscara de reparação capilar Tsubaki Premium EX, da Fine Today. Produto novo.' },
  { id:'cx-medicube-pad', grupo:'Rosto e proteção solar', nome:'Medicube Zero Pore Pad 2.0', tam:'70 discos', preco:176, foto:'/loja/fotos/cx-medicube-pad.jpg', ic:'💧',
    desc:'Discos faciais da Medicube. Na embalagem constam AHA, BHA, pantenol, alantoína e hialuronato de sódio. Produto novo.' },
  { id:'cx-medicube-pdrn', grupo:'Rosto e proteção solar', nome:'Medicube PDRN Pink Collagen Exosome Shot 2000', tam:'30 ml', preco:223, foto:'/loja/fotos/cx-medicube-pdrn.jpg', ic:'🌸',
    desc:'Sérum da Medicube. Na embalagem constam PDRN (sodium DNA), colágeno e exossomo. Produto novo.' },
  { id:'cx-vt-retinal', grupo:'Rosto e proteção solar', nome:'VT Retinal Peptide Spot Cream', tam:'15 ml', preco:158, foto:'/loja/fotos/cx-vt-retinal.jpg', ic:'✨',
    desc:'Creme localizado da VT Cosmetics, com retinal e peptídeo, indicado na embalagem para áreas pequenas como olhos e boca. Produto novo.' },
  { id:'cx-fino-oleo', grupo:'Cabelo', nome:'Fino Premium Touch · óleo capilar', tam:'70 ml', preco:104, foto:'/loja/fotos/cx-fino-oleo.jpg', ic:'💆',
    desc:'Óleo capilar concentrado (濃厚美容液ヘアオイル) da Fino, da Fine Today. Produto novo.' },
  { id:'cx-fino-airy', grupo:'Cabelo', nome:'Fino Premium Touch · óleo capilar Airy Smooth', tam:'70 ml', preco:104, foto:'/loja/fotos/cx-fino-airy.jpg', ic:'💆',
    desc:'Óleo capilar de textura leve (浸透美容液ヘアオイル, さらさらタイプ) da Fino, da Fine Today. Produto novo.' },
  { id:'cx-honey-shampoo', grupo:'Cabelo', nome:'&honey Deep Moist · shampoo (Step 1.0)', tam:'440 ml', preco:128, foto:'/loja/fotos/cx-honey-shampoo.jpg', ic:'🍯',
    desc:'Shampoo da linha &honey. Segundo a embalagem, feito com óleo de argan e mel. Produto novo.' },
  { id:'cx-honey-tratamento', grupo:'Cabelo', nome:'&honey Deep Moist · tratamento (Step 2.0)', tam:'445 g', preco:128, foto:'/loja/fotos/cx-honey-tratamento.jpg', ic:'🍯',
    desc:'Tratamento capilar da linha &honey. Segundo a embalagem, feito com óleo de argan e mel. Produto novo.' },
  { id:'cx-honey-melty', grupo:'Cabelo', nome:'&honey Melty Moist Rich · óleo capilar (Step 3.0)', tam:'100 ml', preco:128, foto:'/loja/fotos/cx-honey-melty.jpg', ic:'🍯',
    desc:'Óleo capilar da linha &honey. Segundo a embalagem, feito com óleo de argan e mel. Produto novo.' },
  { id:'cx-honey-rich', grupo:'Cabelo', nome:'&honey Rich Luxe Repair · tratamento', tam:'440 g', preco:132, foto:'/loja/fotos/cx-honey-rich.jpg', ic:'🍯',
    desc:'Tratamento capilar Luxe Repair da linha &honey Rich. Produto novo.' },
  { id:'cx-honey-booster', grupo:'Cabelo', nome:'&honey Professional iPS System Repair · booster (1.5)', tam:'100 ml', preco:150, foto:'/loja/fotos/cx-honey-booster.jpg', ic:'🍯',
    desc:'Tratamento capilar booster da linha &honey Professional (iPS System Repair Formula, como na embalagem). Produto novo.' },
  { id:'cx-curel-creme', grupo:'Rosto e proteção solar', nome:'Curél Intensive Moisture Care · creme facial', tam:'40 g', preco:238, max:3, foto:'/loja/fotos/cx-curel.jpg', ic:'🧴',
    desc:'Creme facial hidratante da Curél (Kao), para pele seca e sensível, conforme a embalagem (乾燥性敏感肌を考えた). Produto novo. No máximo 3 por pedido.' },
  { id:'cx-medicube-serum', grupo:'Rosto e proteção solar', nome:'Medicube PDRN Pink Peptide Serum', tam:'30 ml', preco:202, foto:'/loja/fotos/cx-medicube-serum.jpg', ic:'🌸',
    desc:'Sérum da Medicube. Na embalagem constam PDRN (sodium DNA) 1% e complexo de 5 tipos de peptídeos. Produto novo.' }
];
