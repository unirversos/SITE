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
  if(ev&&ev._id){var b=(window.AGENDA_REGRAS||[]).filter(function(x){return x.id===ev._id;})[0]; return b?{tipo:'atracao',a:b}:null;}
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
    if(g.semHora){abre=jst(y,am,g.dia,'09:00');aprox=true;txt='A venda abre <b>por volta do dia '+g.dia+' de '+MES[((am%12)+12)%12]+'</b>; o site oficial não informa o horário.';}
    else if(g.variavel){abre=Date.UTC(y,am,15,3);aprox=true;txt='A venda abre em <b>'+MES[((am%12)+12)%12]+'</b>, com a data anunciada no site oficial.';}
    else{abre=jst(y,am,g.dia,g.hora);txt='Venda abre '+quando(abre)+', liberando as datas de '+MES[m]+'.';}
  } else if(g.t==='loteria'){
    var lm=m-g.offset;
    abre=Date.UTC(y,lm,g.mesInteiro?1:g.d1,3); fim=g.mesInteiro?Date.UTC(y,lm+1,0,14,59):Date.UTC(y,lm,g.d2,23);  /* mês inteiro: até 23h59 do último dia (Japão) */
    txt=(g.mesInteiro?'Inscrições ao longo de <b>'+MES[((lm%12)+12)%12]+'</b>':'Inscrições de <b>'+g.d1+' a '+g.d2+' de '+MES[((lm%12)+12)%12]+'</b>')+' (é sorteio: o dia da inscrição não muda nada).';
  } else if(g.t==='mesesAntes'){abre=jst(y,m-g.meses,d,g.hora);txt='Cada dia abre '+g.meses+' meses antes: '+quando(abre)+'.';}
  else if(g.t==='antes'){abre=jst(y,m,d-g.dias,g.hora);txt='Abre '+g.dias+' dias antes: '+quando(abre)+'.';}
  else if(g.t==='antecedencia'){abre=Date.UTC(y,m-g.meses,d,12);aprox=true;txt='A venda abre cerca de '+g.meses+(g.meses>1?' meses':' mês')+' antes, por ordem de chegada: quanto antes, melhor.';}
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
/* Plano de avisos para quem quer ir a uma atração em certo dia: quando a venda abre e quando avisar.
   Venda aproximada (sem horário oficial): só o aviso de 1 dia antes. Loteria: 1 dia antes de abrir e 1 dia antes de fechar. */
function plano(id,data){
  var av=para({_id:id,data:data}); if(!av)return null;
  var MIN=60000, DIA=1440*MIN, it=[];
  function pos(ms,tit){it.push({ms:ms,titulo:tit});}
  var nm=av.nome;
  if(av.fim){var manha=function(ms){return Math.floor(ms/DIA)*DIA-DIA+12*60*MIN;};  /* 9h de Brasília do dia anterior */
    pos(manha(av.abre),'⏰ Amanhã abrem as inscrições: '+nm);pos(manha(av.fim),'⏰ Amanhã fecham as inscrições: '+nm);}
  else if(av.aprox){pos(av.abre-DIA,'⏰ Amanhã deve abrir a venda: '+nm+' (confira a data no site)');}
  else{pos(av.abre-DIA,'⏰ Em 1 dia abre a venda: '+nm);pos(av.abre-20*MIN,'⏰ Em 20 min abre a venda: '+nm);pos(av.abre-10*MIN,'⏰ Em 10 min abre a venda: '+nm);}
  return {av:av,avisos:it};
}
function brParts(ms){
  var f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)),o={};
  f.forEach(function(x){o[x.type]=x.value;}); return {data:o.year+'-'+o.month+'-'+o.day,hora:o.hour+':'+o.minute};
}
function icsTxt(t){return String(t||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');}
function icsUtc(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
function icsFold(l){var o=[];while(l.length>73){o.push(l.slice(0,73));l=' '+l.slice(73);}o.push(l);return o.join('\r\n');}
/* itens: [{id,data,pl}] -> texto .ics (avisos só no futuro) */
function ics(itens,agora){
  agora=agora||Date.now(); var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Unirversos//Travessia//PT','CALSCALE:GREGORIAN'];
  itens.forEach(function(x){
    var u='quero-ir-'+x.id+'-'+x.data+'@unirversos.com', av=x.pl.av;
    L.push('BEGIN:VEVENT','UID:'+u+'-visita','DTSTAMP:'+icsUtc(agora),'DTSTART;VALUE=DATE:'+x.data.replace(/-/g,''),'SUMMARY:'+icsTxt('🎟️ Quero ir: '+av.nome),'DESCRIPTION:'+icsTxt(av.url||''),'END:VEVENT');
    x.pl.avisos.forEach(function(a,i){ if(a.ms<=agora)return;
      L.push('BEGIN:VEVENT','UID:'+u+'-'+i,'DTSTAMP:'+icsUtc(agora),'DTSTART:'+icsUtc(a.ms),'DTEND:'+icsUtc(a.ms+10*60000),'SUMMARY:'+icsTxt(a.titulo),
        'DESCRIPTION:'+icsTxt((av.url?av.url+'\n':'')+'Regra do site, confira na página oficial.'),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsTxt(a.titulo),'TRIGGER:PT0S','END:VALARM','END:VEVENT');
    });
  });
  L.push('END:VCALENDAR'); return L.map(icsFold).join('\r\n')+'\r\n';
}
window.CalAvisos={plano:plano,brParts:brParts,ics:ics,para:para,situacao:situacao,quando:quando,_achaRegra:achaRegra};
})();
