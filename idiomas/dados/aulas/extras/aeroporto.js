/* Piloto (teste): ideias do pacote do Neon aplicadas ao Aeroporto atual, sem tirar nada do mapa.
   fio = de onde a pessoa vem e para onde vai · hotspots = pontos clicáveis na cena (x e y em %)
   erroNpc = reação do personagem quando a resposta não bate (pela frase "say" da cena) · cadernoPrompt = frase para completar no caderno */
(function(){
const A=(window.AULAS||{}).aeroporto; if(!A) return;
A.fio={
  anterior:'Você saiu da Aula Zero com 5 chaves no bolso. Agora elas vão ser usadas de verdade.',
  proximo:'Passaporte carimbado e malas na mão. Agora é achar as placas do terminal rumo ao trem →'
};
A.cen.hotspots=[
  {x:22, y:80, say:'パスポートです', ro:'pasupōto desu', pt:'É o passaporte.'},
  {x:82, y:39, say:'とうきょうです', ro:'Tōkyō desu', pt:'É Tóquio (o painel de chegada).'},
  {x:49, y:80, say:'にもつです', ro:'nimotsu desu', pt:'É a bagagem.'}
];
const ERRO={
  'もくてきは なんですか？':'O oficial espera, caneta parada no ar. Ele quer saber <b>por que</b> você veio.',
  'もくてきちは どこですか？':'Ele aponta para o mapa do Japão na parede. Ele quer o <b>nome da cidade</b>.',
  'ごよやくは ございますか？':'A atendente olha a tela do computador e sorri, esperando. Você <b>tem</b> reserva.',
  'ビザは ありますか？':'Ele folheia o passaporte procurando um visto. Brasileiro a turismo <b>não precisa</b> de visto.',
  'にもつは いくつですか？':'Ela olha para as suas malas no chão e conta com os dedos. Quantas são?'
};
A.cenas.forEach(c=>{ if(ERRO[c.say]) c.erroNpc=ERRO[c.say]; });
A.cadernoPrompt={molde:'もくてきち は ＿＿ です。', dica:'Guarde no caderno o destino da sua viagem:'};
})();
/* área de teste: cenário ilustrado (aeroporto) */
(function(){ const A=(window.AULAS||{})['aeroporto']; if(!A) return; Object.assign(A.cen,{bg:'/idiomas/img/cenas/aeroporto.webp', bgFrente:176, npcX:86, npcY:58, npcW:112, meX:282, meY:98, meW:116}); })();
