/* Avisos de antecedência: para cada evento do calendário, quando abre a venda (ingressos e trem-bala),
   com a hora do Japão convertida para Brasília. Usa as regras do Cronograma de ingressos (agendamentos/regras.js). */
(function(){
'use strict';
var MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var TREM=/shinkansen|新幹線|nozomi|hikari|kodama|hayabusa|sakura\b|mizuho|trem[- ]bala|bullet\s*train/i;
function jst(y,m,d,h){var p=String(h||'0:0').split(':'),H=+p[0],M=+p[1]||0; return Date.UTC(y,m,d,(isFinite(H)?H:0)-9,M);}  /* instante absoluto: JST = UTC+9 */
function fmt(ms,tz){return new Date(ms).toLocaleString('pt-BR',{timeZone:tz,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',',' às').replace(':','h');}
function quando(ms){return fmt(ms,'America/Sao_Paulo')+' de Brasília ('+fmt(ms,'Asia/Tokyo')+' no Japão)';}
function achaRegra(ev){
  var txt=(ev.titulo||'')+' '+(ev.local||''), R=window.AGENDA_REGRAS||[];
  if(ev.tipo==='transp'&&TREM.test(txt+' '+(ev.detalhes||'')))return {tipo:'trem'};
  var id=(window.LeitorReserva&&LeitorReserva.acharAtracao)?LeitorReserva.acharAtracao(txt):'';
  var a=R.filter(function(x){return x.id===id;})[0];
  return a?{tipo:'atracao',a:a}:null;
}
/* devolve {nome, abre(ms), fim(ms|null), texto, url, aprox} ou null */
function para(ev){
  if(!ev||!/^\d{4}-\d{2}-\d{2}$/.test(ev.data||''))return null;
  var y=+ev.data.slice(0,4), m=+ev.data.slice(5,7)-1, d=+ev.data.slice(8), r=achaRegra(ev); if(!r)return null;
  if(r.tipo==='trem'){
    var q=jst(y,m-1,d,'10:00');
    return {nome:'Trem-bala · assento reservado',abre:q,fim:null,url:'https://smart-ex.jp/en/',
      texto:'No balcão da estação ou em agência, o assento reservado abre <b>1 mês antes, às 10h do Japão</b>: '+quando(q)+'. Pelo SmartEX dá para reservar antes (até 1 ano), e o assento é confirmado a partir das 8h de 1 mês antes.'};
  }
  var a=r.a, g=a.regra, abre=null, fim=null, txt='', aprox=false;
  if(g.t==='mensal'){
    var am=m-g.offset;
    if(g.variavel){abre=Date.UTC(y,am,15,3);aprox=true;txt='A venda abre em <b>'+MES[((am%12)+12)%12]+'</b>, com a data anunciada no site oficial.';}
    else{abre=jst(y,am,g.dia,g.hora);txt='Venda abre '+quando(abre)+', liberando as datas de '+MES[m]+'.';}
  } else if(g.t==='loteria'){
    var lm=m-g.offset;
    abre=Date.UTC(y,lm,g.mesInteiro?1:g.d1,3); fim=Date.UTC(y,lm,g.mesInteiro?28:g.d2,23);
    txt=(g.mesInteiro?'Inscrições ao longo de <b>'+MES[((lm%12)+12)%12]+'</b>':'Inscrições de <b>'+g.d1+' a '+g.d2+' de '+MES[((lm%12)+12)%12]+'</b>')+' (é sorteio: o dia da inscrição não muda nada).';
  } else if(g.t==='mesesAntes'){abre=jst(y,m-g.meses,d,g.hora);txt='Cada dia abre '+g.meses+' meses antes: '+quando(abre)+'.';}
  else if(g.t==='antes'){abre=jst(y,m,d-g.dias,g.hora);txt='Abre '+g.dias+' dias antes: '+quando(abre)+'.';}
  else if(g.t==='antecedencia'){abre=Date.UTC(y,m-g.meses,d,12);txt='A venda abre cerca de '+g.meses+(g.meses>1?' meses':' mês')+' antes, por ordem de chegada: quanto antes, melhor.';}
  else return null;
  return {nome:a.nome,abre:abre,fim:fim,texto:txt,url:a.url||'',aprox:aprox};
}
/* situação em relação a agora: 'futuro' | 'logo' (≤14 dias) | 'hoje' | 'aberto' (já abriu) | 'passou' (inscrição encerrada) */
function situacao(av,agora){
  agora=agora||Date.now(); var dias=Math.ceil((av.abre-agora)/864e5);
  if(av.fim&&agora>av.fim)return {est:'passou',dias:dias};
  if(agora>=av.abre)return {est:'aberto',dias:dias};
  if(dias<=0)return {est:'hoje',dias:0};
  return {est:dias<=14?'logo':'futuro',dias:dias};
}
window.CalAvisos={para:para,situacao:situacao,quando:quando,_achaRegra:achaRegra};
})();
