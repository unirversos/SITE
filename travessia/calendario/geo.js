/* Ajudas de lugar e distância (sem tela): coordenadas, busca no OpenStreetMap, estimativas de tempo e passagem. */
(function(){
'use strict';
var GEO_KEY='uniCalGeo1', cache={};
var LIM_CIDADE=30, LIM_CIDADE_B=30;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
try{cache=JSON.parse(localStorage.getItem(GEO_KEY)||'{}')||{};}catch(e){cache={};}
function salvaCache(){try{localStorage.setItem(GEO_KEY,JSON.stringify(cache));}catch(e){}}
function chave(q){return String(q).trim().toLowerCase();}

/* ---------- cálculo ---------- */
function km(a,b){var R=6371,r=Math.PI/180,dLa=(b.lat-a.lat)*r,dLo=(b.lon-a.lon)*r,
  x=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)*Math.sin(dLo/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));}
/* linha reta × 1,3 para aproximar ruas/trilhos; a pé 4,8 km/h; transporte: 10 min de espera/baldeação + 32 km/h */
function estima(d){var real=d*1.3, a_pe=Math.round(real/4.8*60), trans=Math.round(10+real/32*60);
  return {km:d,real:real,pe:a_pe,trans:trans,melhor:a_pe<=15?'pe':'trans',min:a_pe<=15?a_pe:Math.min(a_pe,trans)};}
function mins(t){return t&&/^\d\d:\d\d$/.test(t)?(+t.slice(0,2))*60+(+t.slice(3)):null;}
function fmtMin(m){if(m<60)return m+' min';var h=Math.floor(m/60),r=m%60;return h+' h'+(r?' '+(r<10?'0':'')+r:'');}
function fmtKm(d){return (d<10?d.toFixed(1):Math.round(d)).toString().replace('.',',')+' km';}


/* ---------- coordenadas que já vêm dentro do texto do Local (cópias do Google Maps) ---------- */
function okLL(la,lo){return isFinite(la)&&isFinite(lo)&&Math.abs(la)<=90&&Math.abs(lo)<=180&&!(la===0&&lo===0);}
function num(x){return parseFloat(String(x).replace(',','.'));}
function coordDe(t){
  t=String(t||''); var m;
  if((m=t.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/))||(m=t.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/))||(m=t.match(/[?&](?:q|ll|query)=(-?\d{1,2}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)/))){
    if(okLL(+m[1],+m[2]))return {lat:+m[1],lon:+m[2],nome:'coordenadas do link',reg:''}; }
  /* graus e minutos decimais: N 035° 30.492, E 138° 44.308 */
  if((m=t.match(/([NS])\s*0*(\d{1,2})\s*°\s*(\d{1,2}(?:[.,]\d+)?)[^EW\d]{0,6}([EW])\s*0*(\d{1,3})\s*°\s*(\d{1,2}(?:[.,]\d+)?)/i))){
    var la=(+m[2]+num(m[3])/60)*(/s/i.test(m[1])?-1:1), lo=(+m[5]+num(m[6])/60)*(/w/i.test(m[4])?-1:1);
    if(okLL(la,lo))return {lat:la,lon:lo,nome:'coordenadas do texto',reg:''}; }
  /* graus, minutos e segundos: 35°30'29.5"N 138°44'18.5"E */
  if((m=t.match(/(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:[.,]\d+)?)["″]?\s*([NS])[\s,]*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:[.,]\d+)?)["″]?\s*([EW])/i))){
    var a=(+m[1]+ +m[2]/60+num(m[3])/3600)*(/s/i.test(m[4])?-1:1), b=(+m[5]+ +m[6]/60+num(m[7])/3600)*(/w/i.test(m[8])?-1:1);
    if(okLL(a,b))return {lat:a,lon:b,nome:'coordenadas do texto',reg:''}; }
  /* decimais soltos: 35.5082, 138.7385 */
  if((m=t.match(/(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/))&&okLL(+m[1],+m[2]))return {lat:+m[1],lon:+m[2],nome:'coordenadas do texto',reg:''};
  return null;
}
/* texto para procurar: tira links e a parte de telefone/coordenadas/detalhes */
function limpaQ(q){
  var t=String(q||'').replace(/https?:\/\/\S+/g,' ').replace(/\s+(Telefone|Coordenadas|Detalhes)\b.*$/i,'').replace(/\s+/g,' ').trim();
  return t.slice(0,180);
}
function soLinkCurto(q){return /^\s*https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/)\S*\s*$/i.test(String(q||''));}

function regiaoDe(a){a=a||{};var r=a.state||a.province||a.city||a.town||a.county||'';
  return String(r).replace(/\s*(Prefecture|prefecture|Prefeitura|Province|Província|-ken|-to)$/,'').trim().slice(0,40);}

/* ---------- coordenadas que já vêm dentro do texto do Local (cópias do Google Maps) ---------- */
function okLL(la,lo){return isFinite(la)&&isFinite(lo)&&Math.abs(la)<=90&&Math.abs(lo)<=180&&!(la===0&&lo===0);}
function num(x){return parseFloat(String(x).replace(',','.'));}
function coordDe(t){
  t=String(t||''); var m;
  if((m=t.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/))||(m=t.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/))||(m=t.match(/[?&](?:q|ll|query)=(-?\d{1,2}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)/))){
    if(okLL(+m[1],+m[2]))return {lat:+m[1],lon:+m[2],nome:'coordenadas do link',reg:''}; }
  /* graus e minutos decimais: N 035° 30.492, E 138° 44.308 */
  if((m=t.match(/([NS])\s*0*(\d{1,2})\s*°\s*(\d{1,2}(?:[.,]\d+)?)[^EW\d]{0,6}([EW])\s*0*(\d{1,3})\s*°\s*(\d{1,2}(?:[.,]\d+)?)/i))){
    var la=(+m[2]+num(m[3])/60)*(/s/i.test(m[1])?-1:1), lo=(+m[5]+num(m[6])/60)*(/w/i.test(m[4])?-1:1);
    if(okLL(la,lo))return {lat:la,lon:lo,nome:'coordenadas do texto',reg:''}; }
  /* graus, minutos e segundos: 35°30'29.5"N 138°44'18.5"E */
  if((m=t.match(/(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:[.,]\d+)?)["″]?\s*([NS])[\s,]*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:[.,]\d+)?)["″]?\s*([EW])/i))){
    var a=(+m[1]+ +m[2]/60+num(m[3])/3600)*(/s/i.test(m[4])?-1:1), b=(+m[5]+ +m[6]/60+num(m[7])/3600)*(/w/i.test(m[8])?-1:1);
    if(okLL(a,b))return {lat:a,lon:b,nome:'coordenadas do texto',reg:''}; }
  /* decimais soltos: 35.5082, 138.7385 */
  if((m=t.match(/(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/))&&okLL(+m[1],+m[2]))return {lat:+m[1],lon:+m[2],nome:'coordenadas do texto',reg:''};
  return null;
}
/* texto para procurar: tira links e a parte de telefone/coordenadas/detalhes */
function limpaQ(q){
  var t=String(q||'').replace(/https?:\/\/\S+/g,' ').replace(/\s+(Telefone|Coordenadas|Detalhes)\b.*$/i,'').replace(/\s+/g,' ').trim();
  return t.slice(0,180);
}
function soLinkCurto(q){return /^\s*https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/)\S*\s*$/i.test(String(q||''));}


/* ---------- geocodificação (OpenStreetMap Nominatim, 1 pedido por segundo, com cache) ---------- */
var fila=Promise.resolve(), ultimo=0;
function geocodificar(q){
  var k=chave(q); if(cache.hasOwnProperty(k))return Promise.resolve(cache[k]);
  var cd=coordDe(q); if(cd)return Promise.resolve(cd);
  if(soLinkCurto(q))return Promise.resolve(null);
  var qq=limpaQ(q); if(!qq)return Promise.resolve(null);
  var p=fila.then(function(){
    var esp=Math.max(0,1100-(Date.now()-ultimo));
    return new Promise(function(r){setTimeout(r,esp);}).then(function(){
      ultimo=Date.now();
      return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&accept-language=pt&q='+encodeURIComponent(qq),{headers:{'Accept':'application/json'}});
    }).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();})
    .then(function(j){var v=(j&&j[0])?{lat:+j[0].lat,lon:+j[0].lon,nome:String(j[0].display_name||'').slice(0,160),reg:regiaoDe(j[0].address)}:null;
      if(v&&(isNaN(v.lat)||isNaN(v.lon)))v=null; cache[k]=v; salvaCache(); return v;});
  });
  fila=p.catch(function(){}); return p;
}


function estimaLonga(d){var real=d*1.25;
  if(d<=100)return {modo:'🚆 trem/ônibus',min:Math.round(20+real/60*60)};
  if(d<=700)return {modo:'🚄 trem rápido (ex.: trem-bala)',min:Math.round(40+real/180*60)};
  return {modo:'✈️ avião (incluindo aeroporto)',min:Math.round(150+d/750*60)};}

function estTarifa(d){
  if(d<=LIM_CIDADE_B){ var real=d*1.3; if(real/4.8*60<=15)return 0; return Math.min(600,Math.round((170+12*real)/10)*10); }
  if(d<=100)return Math.round(20*d*1.25/10)*10;
  if(d<=700)return Math.round(30*d*1.25/100)*100;
  return Math.round((20000+5*d)/1000)*1000;
}

/* Estimativas por meio de transporte (valores de partida; a pessoa confirma o real):
   a pé ¥0 · trem: por distância · ônibus urbano ~¥230 (Quioto) e rodoviário ~¥12/km · táxi ~¥500 + ¥390/km (Tóquio) · avião ~¥20.000 + ¥5/km */
var MODOS={pe:'🚶 A pé',trem:'🚆 Trem',onibus:'🚌 Ônibus',taxi:'🚕 Táxi',aviao:'✈️ Avião'};
function modoPadrao(d){ if(d<=1.2)return 'pe'; if(d>700)return 'aviao'; return 'trem'; }
function estModoBase(m,d,rr){
  var real=(rr&&rr.km)?rr.km:d*1.3, r;
  if(m==='pe') return {min:(rr&&rr.min)?rr.min:Math.round(real/4.8*60),fare:0,nota:'Estimativa de 4,8 km/h.'};
  if(m==='trem'){ var t=d<=LIM_CIDADE?estima(d).trans:estimaLonga(d).min; var f=estTarifa(d); if(d<=LIM_CIDADE)f=Math.max(f,170);
    return {min:t,fare:f,nota:d>100?'Trem rápido (ex.: trem-bala): conta espera e acesso às estações.':'Inclui uns 10 min de espera.'}; }
  if(m==='onibus'){ if(d<=30){ return {min:Math.round(10+real/18*60),fare:Math.round((230+Math.max(0,real-6)*30)/10)*10,nota:'Ônibus urbano: base de ¥ 230; em algumas cidades o preço sobe com a distância.'}; }
    return {min:Math.round(20+real/60*60),fare:Math.max(1500,Math.round(real*12/100)*100),nota:'Ônibus rodoviário: valor muito variável conforme a empresa e o horário.'}; }
  if(m==='taxi'){ var sp=d<=30?25:60; return {min:(rr&&rr.min)?rr.min:Math.round((d<=30?0:10)+real/sp*60),fare:Math.round((500+Math.max(0,real-1.1)*390)/10)*10,nota:'Táxi: bandeirada de ~¥ 500 e ~¥ 390 por km (Tóquio); fora de Tóquio costuma ser parecido.'}; }
  return {min:Math.round(150+d/750*60),fare:Math.round((20000+5*d)/1000)*1000,nota:'Avião: inclui aeroporto; o preço varia muito conforme a data.'};
}

/* ---------- "Ver rota" de cada meio: abre o site certo já preenchido ---------- */
/* aeroportos com voo doméstico (código, lat, lon, nome); TYO e OSA juntam os aeroportos da mesma cidade no Google Voos */
var AERO=[['TYO',35.5494,139.7798,'Tóquio (Haneda)'],['TYO',35.7720,140.3929,'Tóquio (Narita)'],['OSA',34.7855,135.4382,'Osaka (Itami)'],['OSA',34.4320,135.2304,'Osaka (Kansai)'],['UKB',34.6328,135.2239,'Kobe'],
  ['NGO',34.8584,136.8054,'Nagoya (Chubu)'],['CTS',42.7752,141.6923,'Sapporo (New Chitose)'],['HKD',41.7700,140.8219,'Hakodate'],['AKJ',43.6708,142.4475,'Asahikawa'],['AOJ',40.7347,140.6908,'Aomori'],
  ['AXT',39.6156,140.2189,'Akita'],['SDJ',38.1397,140.9170,'Sendai'],['KIJ',37.9559,139.1206,'Niigata'],['TOY',36.6483,137.1875,'Toyama'],['KMQ',36.3946,136.4065,'Komatsu (Kanazawa)'],
  ['FSZ',34.7960,138.1894,'Shizuoka'],['OKJ',34.7569,133.8553,'Okayama'],['HIJ',34.4361,132.9195,'Hiroshima'],['TAK',34.2142,134.0156,'Takamatsu'],['MYJ',33.8272,132.6997,'Matsuyama'],
  ['KCZ',33.5461,133.6694,'Kochi'],['FUK',33.5859,130.4511,'Fukuoka'],['NGS',32.9169,129.9136,'Nagasaki'],['KMJ',32.8373,130.8550,'Kumamoto'],['OIT',33.4794,131.7372,'Oita'],
  ['KMI',31.8772,131.4486,'Miyazaki'],['KOJ',31.8034,130.7194,'Kagoshima'],['OKA',26.1958,127.6459,'Naha (Okinawa)'],['ISG',24.3964,124.2450,'Ishigaki'],['MMY',24.7828,125.2950,'Miyako']];
function aeroPerto(p){var m=null,md=1e9; AERO.forEach(function(a){var k=km(p,{lat:a[1],lon:a[2]}); if(k<md){md=k;m=a;}}); return m?{cod:m[0],nome:m[3],lat:m[1],lon:m[2],km:md}:null;}
function crd(p){return (+p.lat).toFixed(5)+','+(+p.lon).toFixed(5);}
function gmaps(pa,pb,tm){return 'https://www.google.com/maps/dir/?api=1&origin='+crd(pa)+'&destination='+crd(pb)+'&travelmode='+tm;}
/* o = {de, para, data 'AAAA-MM-DD', pax, estA, estB, buscando} → {links:[{t,u,pri}], nota} */
function linksRota(m,pa,pb,o){
  o=o||{}; var d=km(pa,pb);
  if(m==='pe')return {links:[{t:'🚶 Ver caminho a pé (Google Maps)',u:gmaps(pa,pb,'walking'),pri:1}],nota:'Abre o Google Maps já no modo a pé.'};
  if(m==='taxi'){
    var u='https://m.uber.com/ul/?action=setPickup&pickup[latitude]='+(+pa.lat).toFixed(6)+'&pickup[longitude]='+(+pa.lon).toFixed(6)+'&pickup[nickname]='+encodeURIComponent(String(o.de||'Origem').slice(0,60))+
      '&dropoff[latitude]='+(+pb.lat).toFixed(6)+'&dropoff[longitude]='+(+pb.lon).toFixed(6)+'&dropoff[nickname]='+encodeURIComponent(String(o.para||'Destino').slice(0,60));
    return {links:[{t:'🚕 Pedir pelo Uber (origem e destino já preenchidos)',u:u,pri:1},{t:'🗺️ Trajeto de carro (Google Maps)',u:gmaps(pa,pb,'driving')}],
      nota:'No Japão o Uber chama táxis comuns nas cidades grandes; se não aparecer carro, dá para pegar táxi no ponto ou pelo app GO.'};
  }
  if(m==='onibus')return {links:[{t:'🚌 Abrir o Japan Bus Online',u:'https://japanbusonline.com/en',pri:1},{t:'🗺️ Ônibus da cidade (Google Maps)',u:gmaps(pa,pb,'transit')}],
    nota:'O Japan Bus Online não aceita o trajeto pelo link: copie a origem e o destino abaixo e cole nos campos de saída e chegada. Para ônibus dentro da cidade, use o Google Maps.'};
  if(m==='aviao'){
    var A=aeroPerto(pa), B=aeroPerto(pb);
    if(!A||!B||A.cod===B.cod)return {links:[{t:'🚆 Ver rota (Google Maps)',u:gmaps(pa,pb,'transit'),pri:1}],nota:'Os dois pontos ficam perto do mesmo aeroporto: avião não compensa aqui.'};
    var q='Flights from '+A.cod+' to '+B.cod+(/^\d{4}-\d{2}-\d{2}$/.test(o.data||'')?' on '+o.data:'')+' one way'+(o.pax>1?' with '+o.pax+' adults':'');
    return {links:[{t:'✈️ Ver voos '+A.cod+' → '+B.cod+' (Google Voos)',u:'https://www.google.com/travel/flights?q='+encodeURIComponent(q)+'&hl=pt-BR&curr=JPY',pri:1},
      {t:'🗺️ Até o aeroporto de '+A.nome,u:gmaps(pa,A,'transit')}],
      nota:'Aeroporto mais perto: saída '+A.nome+' ('+fmtKm(A.km)+'), chegada '+B.nome+' ('+fmtKm(B.km)+'). O Google Voos abre com origem, destino'+(o.data?' e data':'')+' preenchidos; compre direto no site da companhia.'};
  }
  /* trem: Jorudan (乗換案内), com as estações mais perto já preenchidas em japonês */
  if(o.estA&&o.estB&&o.estA.ja&&o.estB.ja&&o.estA.ja!==o.estB.ja)
    return {links:[{t:'🚆 Ver trem e preço no Jorudan: '+o.estA.nome+' → '+o.estB.nome,u:'https://www.jorudan.co.jp/norikae/cgi/nori.cgi?eki1='+encodeURIComponent(o.estA.ja)+'&eki2='+encodeURIComponent(o.estB.ja)+'&Cway=0',pri:1},
      {t:'🔎 Jorudan em inglês (sem preencher)',u:'https://world.jorudan.co.jp/mln/en/'}],
      nota:'O Jorudan abre em japonês, com as estações preenchidas e o horário de agora; troque a data lá se precisar. A versão em inglês não aceita estações pelo link: use os botões de copiar.'};
  return {links:[{t:'🔎 Abrir o Jorudan',u:'https://world.jorudan.co.jp/mln/pt/',pri:1}],nota:o.buscando?'Procurando as estações mais perto para preencher o Jorudan…':'Não achei estação perto de um dos pontos: escreva as estações no Jorudan.'};
}
/* ---------- rota real por rua (a pé / carro): OpenStreetMap, com cache e plano B ---------- */
var ROTA_KEY='uniCalRota1', rcache={}, rfalha={}, rpend={};
try{rcache=JSON.parse(localStorage.getItem(ROTA_KEY)||'{}')||{};}catch(e){rcache={};}
function rchave(a,b,p){return p+'|'+a.lat.toFixed(4)+','+a.lon.toFixed(4)+'>'+b.lat.toFixed(4)+','+b.lon.toFixed(4);}
function perfilDe(m){return m==='pe'?'foot':(m==='taxi'||m==='onibus')?'car':null;}
function rotaCache(a,b,p){return (p&&a&&b)?(rcache[rchave(a,b,p)]||null):null;}
function rotaReal(a,b,p){
  if(!p||!a||!b)return Promise.resolve(null);
  var k=rchave(a,b,p); if(rcache[k])return Promise.resolve(rcache[k]); if(rfalha[k])return Promise.resolve(null); if(rpend[k])return rpend[k];
  var base=p==='foot'?'https://routing.openstreetmap.de/routed-foot':'https://routing.openstreetmap.de/routed-car';
  var url=base+'/route/v1/driving/'+a.lon+','+a.lat+';'+b.lon+','+b.lat+'?overview=false&alternatives=false&steps=false';
  var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){if(ctl)ctl.abort();},7000);
  rpend[k]=fetch(url,ctl?{signal:ctl.signal}:{}).then(function(r){if(!r.ok)throw new Error('http');return r.json();}).then(function(j){
    clearTimeout(to); var x=j&&j.routes&&j.routes[0]; if(!x||!(x.distance>0)||!(x.duration>0)){rfalha[k]=1;return null;}
    var v={km:Math.round(x.distance/100)/10,min:Math.max(1,Math.round(x.duration/60))}; rcache[k]=v;
    var ks=Object.keys(rcache); if(ks.length>400)ks.slice(0,ks.length-400).forEach(function(z){delete rcache[z];});
    try{localStorage.setItem(ROTA_KEY,JSON.stringify(rcache));}catch(e){} return v;
  }).catch(function(){clearTimeout(to);rfalha[k]=1;return null;}).then(function(v){delete rpend[k];return v;});
  return rpend[k];
}
function difHora(s,c){var a=s.split(':'),b=c.split(':'),x=(+b[0]*60+ +b[1])-(+a[0]*60+ +a[1]); if(x<=0)x+=1440; return x;}
/* rr: rota real (km, min) do meio; cf: valores conferidos pela pessoa (min, km, s, c). Devolve também km e as etiquetas kmTag/minTag: real | est | conf */
function estModo(m,d,rr,cf){
  var r=estModoBase(m,d,rr), tem=!!(rr&&rr.km);
  if(m==='trem'||m==='aviao'){r.km=d*(m==='aviao'?1:1.25);r.kmTag='est';}
  else{r.km=tem?rr.km:d*1.3;r.kmTag=tem?'real':'est';}
  r.minTag=(tem&&(m==='pe'||m==='taxi'))?'real':'est';
  if(cf){var cm=+cf.min; if(!(cm>0)&&cf.s&&cf.c)cm=difHora(cf.s,cf.c); if(cm>0){r.min=Math.round(cm);r.minTag='conf';} if(+cf.km>0){r.km=+cf.km;r.kmTag='conf';}}
  return r;
}
window.CalGeo={perfilDe:perfilDe,rotaCache:rotaCache,rotaReal:rotaReal,MODOS:MODOS,modoPadrao:modoPadrao,estModo:estModo,geocodificar:geocodificar,coordDe:coordDe,soLinkCurto:soLinkCurto,km:km,estima:estima,estimaLonga:estimaLonga,estTarifa:estTarifa,fmtMin:fmtMin,fmtKm:fmtKm,chave:chave,linksRota:linksRota,gmaps:gmaps,yen:function(n){return '¥ '+Math.round(n).toLocaleString('pt-BR');}};
})();
