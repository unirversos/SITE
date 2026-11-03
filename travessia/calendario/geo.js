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

window.CalGeo={geocodificar:geocodificar,coordDe:coordDe,soLinkCurto:soLinkCurto,km:km,estima:estima,estimaLonga:estimaLonga,estTarifa:estTarifa,fmtMin:fmtMin,fmtKm:fmtKm,chave:chave,yen:function(n){return '¥ '+Math.round(n).toLocaleString('pt-BR');}};
})();
