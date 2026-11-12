/* Unirversos · temas da semana do mural (Paralelos). Um por semana, em ciclo; a semana 1 começa na segunda 9/11/2026. */
(function(){
  var TEMAS=["Um som que ouvi hoje","O que comi hoje","Uma cor que vi hoje","Um cheiro que me lembrou alguém","Algo macio ou áspero que toquei hoje","O clima de hoje, em uma frase",
  "O caminho que fiz hoje","Uma coisa pequena que me fez sorrir","O que tem na minha mesa agora","Minha manhã em três ações","Uma conversa curta que tive hoje","Algo que eu quase esqueci de fazer",
  "Um lugar onde me sinto bem","Uma lembrança de infância","Uma comida da minha família","A janela de onde escrevo","Uma música que não sai da minha cabeça","Um lugar que quero visitar",
  "Algo pelo qual sou grata hoje","Alguém que me inspira","Um momento em que me senti corajosa","O que me deixou cansada e o que me deu energia","Um conselho que eu daria para mim mesma","Uma palavra que define minha semana",
  "Uma palavra nova que aprendi","Algo que eu ainda não sei dizer no idioma que estudo","O que mais me surpreende no Japão (ou na cultura que estudo)","Uma frase que ouvi e quero guardar","Meu plano para o próximo mês","Algo que mudou desde que comecei a estudar"];
  function atual(){
    var ini=new Date(2026,10,9), hoje=new Date(); hoje.setHours(0,0,0,0);
    var sem=Math.floor(Math.round((hoje-ini)/864e5)/7), i=((sem%TEMAS.length)+TEMAS.length)%TEMAS.length;
    return { i:i, numero:i+1, total:TEMAS.length, titulo:TEMAS[i] };
  }
  window.UniTemas={ TEMAS:TEMAS, atual:atual };
})();
