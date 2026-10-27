/* Os 12 mapas da trilha do japonês: a mesma lista e o mesmo progresso
   usados em /idiomas/japones/ e no Planeta Utopia.
   [slug da aula, emoji, título, descrição, id da cena no Planeta] */
(function(){
  var MAPAS=[
    ['aeroporto','✈️','Aeroporto','Imigração, reserva, bagagem','aeroporto'],
    ['hotel','🏨','Hotel','Check-in, café da manhã, problemas no quarto','hotel'],
    ['restaurante','🍜','Restaurante','Quantas pessoas, pedido, conta','restaurante'],
    ['kombini','🏪','Konbini','Esquentar, sacola, recibo','conbini'],
    ['trens','🚆','Trens','Destino, preço, plataforma','trens'],
    ['compras','🎁','Compras','Preço, desconto, これ・それ・あれ','compras'],
    ['roupas','👚','Roupas','Provar, tamanho, cor','roupas'],
    ['emergencia','🆘','Emergência','Perdi, dói aqui, chame ajuda','sos'],
    ['apresentacao','🤝','Apresentação','Nome, país, trabalho, hobby','base'],
    ['horas','🕒','Horas','Que horas são, marcar horário','numeros'],
    ['planos','🎬','Planos','Convidar, aceitar, recusar','planos'],
    ['sinalizacao','🪧','Sinalização','Placas, saída, proibido, perigo','placas']
  ];
  function ler(k){ try{ var v=localStorage.getItem(k); return v==null?null:JSON.parse(v); }catch(e){ return null; } }
  /* aula: chegou à última etapa da aula · prova: carimbo do Planeta (o mesmo passaporte) */
  function estado(){
    var M=ler('utopiaMapas1')||{}, save=ler('utopiaSave1')||{}, done=(save&&save.done)||{};
    return MAPAS.map(function(m){ return {
      slug:m[0], emoji:m[1], titulo:m[2], desc:m[3], terr:m[4],
      aula:!!(M[m[0]]&&M[m[0]].steps&&M[m[0]].steps[4]),
      prova:!!done['ja:'+m[4]],
      aulaHref:'/idiomas/mapas/'+m[0]+'/aula/',
      testeHref:'/idiomas/planeta-utopia/?lang=ja&terr='+m[4]+'&from=trilha'
    }; });
  }
  window.UniTrilha={MAPAS:MAPAS, estado:estado};
})();
