/* Mapa dos deslocamentos do calendário.
   Pega os eventos do dia que têm "Local", acha cada lugar no mapa (OpenStreetMap/Nominatim),
   desenha o caminho na ordem do dia e estima distância e tempo entre um lugar e o próximo.
   As estimativas são aproximadas (linha reta + margem); a rota real abre no Google Maps. */
(function(){
'use strict';
var GEO_KEY='uniCalGeo1', LEAFLET_JS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js', LEAFLET_CSS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
var cache={}, mapa=null, camada=null, dia='', comHotel=true, colocando=-1, paradas=[], geoSeq=0;
function $(s){return document.querySelector(s);}
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

/* ---------- paradas do dia ---------- */
function montaParadas(S,d,doDia){
  var evs=doDia(d), ini=null, fim=null, meio=[], i, e;
  for(i=0;i<evs.length;i++){e=evs[i];
    if(e.tipo!=='hosp'||!e.local)continue;
    if(e.data<d&&(!ini||e.data>ini.data))ini=e;            /* dormiu aqui na noite anterior: sai daqui de manhã */
    if((!e.dataFim||e.dataFim>d)&&(!fim||e.data>fim.data))fim=e; /* dorme aqui esta noite: volta pra cá */
  }
  for(i=0;i<evs.length;i++){e=evs[i]; if(!e.local||e.tipo==='hosp')continue; meio.push({ev:e,rotulo:e.titulo,local:e.local,hora:e.hora,horaFim:e.horaFim});}
  var lista=[];
  if(comHotel&&ini)lista.push({ev:ini,rotulo:'🏨 '+ini.titulo+' (saída)',local:ini.local,hotel:true});
  lista=lista.concat(meio);
  if(comHotel&&fim&&1)lista.push({ev:fim,rotulo:'🏨 '+fim.titulo+' (volta)',local:fim.local,hotel:true});
  return lista;
}
function diasComLocal(S){var o={};S.ev.forEach(function(e){if(!e.local)return;var f=e.dataFim||e.data,x=e.data;
  if(e.tipo==='hosp'){o[e.data]=1;return;} o[x]=1;});return Object.keys(o).sort();}

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
/* nome da região quando só temos coordenadas (busca reversa, 1 por região) */
function nomeReverso(pos){
  var k='rev:'+pos.lat.toFixed(1)+','+pos.lon.toFixed(1);
  if(cache.hasOwnProperty(k))return Promise.resolve(cache[k]);
  var p=fila.then(function(){var esp=Math.max(0,1100-(Date.now()-ultimo));
    return new Promise(function(r){setTimeout(r,esp);}).then(function(){ultimo=Date.now();
      return fetch('https://nominatim.openstreetmap.org/reverse?format=json&zoom=8&addressdetails=1&accept-language=pt&lat='+pos.lat+'&lon='+pos.lon);})
    .then(function(r){if(!r.ok)throw new Error('http');return r.json();})
    .then(function(j){var n=regiaoDe(j&&j.address); cache[k]=n; salvaCache(); return n;});});
  fila=p.catch(function(){}); return p;
}

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

/* ---------- Leaflet ---------- */
var carregandoL=null;
function carregaLeaflet(){
  if(window.L&&window.L.map)return Promise.resolve(true);
  if(carregandoL)return carregandoL;
  carregandoL=new Promise(function(ok){
    var c=document.createElement('link');c.rel='stylesheet';c.href=LEAFLET_CSS;document.head.appendChild(c);
    var s=document.createElement('script');s.src=LEAFLET_JS;s.onload=function(){ok(!!(window.L&&window.L.map));};s.onerror=function(){carregandoL=null;ok(false);};document.head.appendChild(s);
  });
  return carregandoL;
}
function iniciaMapa(box){
  if(mapa)return; box.innerHTML='';mapa=L.map(box,{scrollWheelZoom:false}).setView([35.68,139.76],11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapa);
  mapa.on('click',function(ev){ if(colocando<0||dia==='all')return; var p=paradas[colocando]; p.pos={lat:ev.latlng.lat,lon:ev.latlng.lng,nome:'marcado por você'}; cache[chave(p.local)]=p.pos; salvaCache(); colocando=-1; pinta(); });
}
function desenhaMapa(){
  var box=$('#mapaBox'); if(!box)return;
  var pts=paradas.filter(function(p){return p.pos;});
  if(!window.L||!window.L.map){box.innerHTML='<p class="nota" style="padding:14px">O mapa não carregou (precisa de internet). A lista abaixo continua valendo.</p>';return;}
  iniciaMapa(box);
  if(camada)camada.remove(); camada=L.featureGroup().addTo(mapa);
  pts.forEach(function(p){var n=paradas.indexOf(p)+1;
    L.marker([p.pos.lat,p.pos.lon],{icon:L.divIcon({className:'mk',html:'<span>'+n+'</span>',iconSize:[28,28],iconAnchor:[14,14]}),title:p.rotulo.replace(/^🏨 /,'')}).addTo(camada);});
  if(pts.length>1)L.polyline(pts.map(function(p){return [p.pos.lat,p.pos.lon];}),{color:'#c23f5e',weight:3,dashArray:'6 8'}).addTo(camada);
  if(pts.length)mapa.fitBounds(camada.getBounds().pad(.25),{maxZoom:15});
  setTimeout(function(){mapa.invalidateSize();},60);
}

/* ---------- orçamento das passagens (¥) ----------
   Cada trecho tem uma ESTIMATIVA automática (por distância e tipo de transporte) que a pessoa
   pode trocar pelo valor real conferido nos links de rota. O valor real fica salvo no calendário. */
function estTarifa(d){
  if(d<=LIM_CIDADE_B){ var real=d*1.3; if(real/4.8*60<=15)return 0; return Math.min(600,Math.round((170+12*real)/10)*10); }
  if(d<=100)return Math.round(20*d*1.25/10)*10;
  if(d<=700)return Math.round(30*d*1.25/100)*100;
  return Math.round((20000+5*d)/1000)*1000;
}
var LIM_CIDADE_B=30;
function orc(){var S=window.CalAPI.estado(); if(!S.orc)S.orc={cot:'',pax:1,t:{}}; return S.orc;}
function kTar(a,b){return [chave(a.local),chave(b.local)].sort().join('>');}
function yen(n){return '¥ '+Math.round(n).toLocaleString('pt-BR');}
function brl(n){return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
/* item: {key, est}; devolve {v, conf} */
function valor(it){var t=orc().t[it.key]; return t?{v:t.v,conf:true}:{v:it.est,conf:false};}
function campoPreco(it){var x=valor(it);
  return '<div class="pc'+(x.conf?' ok':'')+'"><label>Passagem (¥, por pessoa) <input type="number" inputmode="numeric" min="0" step="10" value="'+x.v+'" data-leg="'+esc(it.key)+'" data-est="'+it.est+'"></label>'+
    '<span class="tg">'+(x.conf?'✓ valor confirmado':'estimativa — confira nos links')+'</span>'+(x.conf?' <button type="button" class="btn sm" data-rev="'+esc(it.key)+'">↺ voltar à estimativa</button>':'')+'</div>';}
function painelOrc(items,rotulo){
  var o=orc(), tot=0, conf=0; items.forEach(function(it){var x=valor(it);tot+=x.v;if(x.conf)conf++;});
  var tp=tot*o.pax, h='<div class="orc"><b>💴 '+rotulo+'</b><div class="orcl">'+
    '<label>Pessoas <input type="number" min="1" max="20" step="1" value="'+o.pax+'" data-pax></label>'+
    '<label>Cotação: ¥ 100 = R$ <input type="number" inputmode="decimal" min="0" step="0.01" value="'+(o.cot?(o.cot*100).toFixed(2):'')+'" placeholder="ex.: 3,50" data-cot></label></div>'+
    '<p class="orct">Por pessoa: <b>'+yen(tot)+'</b>'+(o.pax>1?' · para '+o.pax+' pessoas: <b>'+yen(tp)+'</b>':'')+
    (o.cot?' · <b>≈ '+brl(tp*o.cot)+'</b>':' · <span class="nota">digite a cotação para ver em reais</span>')+'</p>'+
    '<p class="nota">'+conf+' de '+items.length+' trecho'+(items.length===1?'':'s')+' com valor confirmado; o resto é estimativa (pode errar bastante). Não inclui reserva de assento, taxas de cartão nem o IOF.</p></div>';
  return h;
}
function ligaOrc(onMudou){
  var el=$('#mapaLista'); if(!el||el._orcLigado)return; el._orcLigado=true;
  el.addEventListener('change',function(ev){var t=ev.target,o=orc();
    if(t.dataset&&t.dataset.leg!==undefined){var v=Math.round(parseFloat(String(t.value).replace(',','.')));
      if(isFinite(v)&&v>=0&&v<=99999999){ if(v===+t.dataset.est&&!o.t[t.dataset.leg]){} else o.t[t.dataset.leg]={v:v,c:1}; } onMudou(true);}
    else if(t.hasAttribute&&t.hasAttribute('data-pax')){var n=parseInt(t.value,10);if(n>=1&&n<=20)o.pax=n;onMudou(true);}
    else if(t.hasAttribute&&t.hasAttribute('data-passe')){var ps=Math.round(parseFloat(t.value));if(isFinite(ps)&&ps>0)o.passe=ps;else delete o.passe;onMudou(true);}
    else if(t.hasAttribute&&t.hasAttribute('data-cot')){var c=parseFloat(String(t.value).replace(',','.'));o.cot=(isFinite(c)&&c>0&&c<100000)?c/100:'';onMudou(true);}
  });
  el.addEventListener('click',function(ev){var b=ev.target.closest('[data-rev]'); if(!b)return; delete orc().t[b.dataset.rev]; onMudou(true);});
}
/* ---------- comparador com o passe de trem para turistas (JR Pass) ----------
   Preços 'ordinary' adulto a partir de 1/out/2026 (japan.travel, confirmado em nov/2026): 7 d ¥53.000 · 14 d ¥84.000 · 21 d ¥105.000.
   Conta só os trechos de trem rápido entre cidades (100–700 km). Os preços do passe são editáveis. */
var PASSES=[{d:7,v:53000},{d:14,v:84000},{d:21,v:105000}];
function dif(a,b){return Math.round((Date.UTC(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8))-Date.UTC(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8)))/864e5);}
function comparaPasse(legs){
  var o=orc(), cob=legs.filter(function(g){return g.d>100&&g.d<=700;});
  var h='<div class="orc"><b>🎫 Vale a pena o passe de trem (JR Pass)?</b>';
  if(!cob.length)return h+'<p class="orct">Não há trem rápido entre cidades na sua viagem; o passe provavelmente <b>não compensa</b>.</p></div>';
  var dias=cob.map(function(g){return g.b.dia;}).sort(), span=dif(dias[0],dias[dias.length-1])+1;
  var pas=PASSES.filter(function(x){return x.d>=span;})[0];
  var soma=0,conf=0; cob.forEach(function(g){var x=valor(g.it);soma+=x.v;if(x.conf)conf++;});
  if(!pas)return h+'<p class="orct">Seus trens rápidos vão de '+esc(dias[0].slice(8)+'/'+dias[0].slice(5,7))+' a '+esc(dias[dias.length-1].slice(8)+'/'+dias[dias.length-1].slice(5,7))+' ('+span+' dias): mais que o maior passe (21 dias). Compare por partes, passe a passe.</p></div>';
  var preco=o.passe||pas.v, dif2=soma-preco;
  h+='<p class="orct">Seus <b>'+cob.length+' trecho'+(cob.length>1?'s':'')+' de trem rápido</b> acontecem em '+span+' dia'+(span>1?'s':'')+' seguidos → passe de <b>'+pas.d+' dias</b>.</p>'+
    '<div class="orcl"><label>Passe de '+pas.d+' dias (¥) <input type="number" min="0" step="100" value="'+preco+'" data-passe></label></div>'+
    '<p class="orct">Passagens avulsas: <b>'+yen(soma)+'</b> · Passe: <b>'+yen(preco)+'</b> por pessoa → '+
    (dif2>0?'<b style="color:var(--sage)">o passe compensa: economiza ≈ '+yen(dif2)+'</b>':'<b style="color:var(--red)">o passe não compensa: as avulsas saem ≈ '+yen(-dif2)+' mais baratas</b>')+'.</p>'+
    '<p class="nota">'+conf+' de '+cob.length+' trecho'+(cob.length>1?'s':'')+' com valor confirmado'+(conf<cob.length?' (confirme os outros para a comparação ficar firme)':'')+'. Preço do passe: tabela “ordinary”, adulto, a partir de 1/out/2026 ([ver fonte](https://www.japan.travel/en/ca/news/price-increases-are-coming-to-the-nationwide-japan-rail-pass-2026/)). Não conta trem comum nem metrô, que o passe só cobre nas linhas JR. Até onde sei, trens Nozomi e Mizuho do trem-bala não entram no passe; confirme as regras e o preço em <a href="https://japanrailpass.net" target="_blank" rel="noopener">japanrailpass.net</a> antes de comprar.</p></div>';
  return h.replace(/\[ver fonte\]\(([^)]+)\)/,'<a href="$1" target="_blank" rel="noopener">ver fonte</a>');
}
function salvaOrc(){try{window.CalAPI.gravar();}catch(e){}}
function digitando(){var a=document.activeElement,el=$('#mapaLista');return !!(a&&el&&el.contains(a)&&a.tagName==='INPUT');}

/* ---------- viagem toda: regiões e deslocamentos entre cidades ---------- */
var LIM_CIDADE=30; /* km: pontos mais perto que isso contam como a mesma cidade/região */
function estimaLonga(d){var real=d*1.25;
  if(d<=100)return {modo:'🚆 trem/ônibus',min:Math.round(20+real/60*60)};
  if(d<=700)return {modo:'🚄 trem rápido (ex.: trem-bala)',min:Math.round(40+real/180*60)};
  return {modo:'✈️ avião (incluindo aeroporto)',min:Math.round(150+d/750*60)};}
function sequenciaViagem(S,doDia){
  var ds=diasComLocal(S), seq=[], antes=comHotel; comHotel=true;
  ds.forEach(function(d){montaParadas(S,d,doDia).forEach(function(p){seq.push({dia:d,rotulo:p.rotulo.replace(/^🏨 /,'').replace(/ \((saída|volta)\)$/,''),local:p.local,hora:p.hora,horaFim:p.horaFim,hotel:!!p.hotel});});});
  comHotel=antes;
  /* tira repetições seguidas do mesmo lugar (hotel de manhã e à noite) */
  return seq.filter(function(x,i){return i===0||chave(x.local)!==chave(seq[i-1].local);});
}
function agrupaRegioes(seq){
  var regs=[];
  seq.forEach(function(x){ if(!x.pos){x.reg=-1;return;}
    var k=-1,i; for(i=0;i<regs.length;i++){ if(km(regs[i].ref,x.pos)<=LIM_CIDADE){k=i;break;} }
    if(k<0){regs.push({ref:x.pos,nomes:{},pts:[]});k=regs.length-1;}
    x.reg=k; regs[k].pts.push(x); if(x.pos.reg)regs[k].nomes[x.pos.reg]=(regs[k].nomes[x.pos.reg]||0)+1; });
  regs.forEach(function(r,i){var best='',n=0;for(var k in r.nomes){if(r.nomes[k]>n){n=r.nomes[k];best=k;}}
    if(!best){var ck='rev:'+r.ref.lat.toFixed(1)+','+r.ref.lon.toFixed(1); if(cache[ck])best=cache[ck];
      else if(!r.pedido){r.pedido=1; nomeReverso(r.ref).then(function(){ if(dia==='all')pintaViagem(); }).catch(function(){});}}
    r.nome=best||('Região '+(i+1));});
  return regs;
}
function pintaViagem(){
  var el=$('#mapaLista'); if(!el)return;
  if(digitando()){setTimeout(pintaViagem,900);return;}
  var seq=viagem.seq, regs=agrupaRegioes(seq), faltam=seq.filter(function(x){return !x.pos&&!x.buscando;}).length, buscando=seq.filter(function(x){return x.buscando;}).length;
  var kmLoc=0,minLoc=0,kmEnt=0,minEnt=0,legs=[],locais=[],i;
  for(i=0;i<seq.length-1;i++){var a=seq[i],b=seq[i+1]; if(!a.pos||!b.pos)continue; var d=km(a.pos,b.pos);
    if(d<=LIM_CIDADE){var e=estima(d);kmLoc+=d;minLoc+=e.min;locais.push({a:a,b:b,it:{key:kTar(a,b),est:estTarifa(d)}});}
    else{var L2=estimaLonga(d);kmEnt+=d;minEnt+=L2.min;legs.push({a:a,b:b,d:d,e:L2,it:{key:kTar(a,b),est:estTarifa(d)}});} }
  var h='';
  if(buscando)h+='<p class="nota">Procurando os lugares no mapa… ('+buscando+' restante'+(buscando>1?'s':'')+')</p>';
  var usadas=regs.filter(function(r){return r.pts.length;});
  h+='<p class="mt"><b>Viagem toda:</b> '+usadas.length+(usadas.length===1?' cidade/região':' cidades/regiões')+
    (legs.length?' · <b>entre cidades:</b> ≈ '+fmtKm(kmEnt)+' e cerca de '+fmtMin(minEnt)+' em '+legs.length+' trajeto'+(legs.length>1?'s':''):'')+
    ' · <b>dentro das cidades:</b> ≈ '+fmtKm(kmLoc)+' e cerca de '+fmtMin(minLoc)+'</p>';
  /* linha do tempo: regiões na ordem em que você passa por elas */
  var etapas=[],cur=null;
  seq.forEach(function(x){ if(x.reg<0)return; if(!cur||cur.reg!==x.reg){cur={reg:x.reg,ini:x.dia,fim:x.dia,n:0};etapas.push(cur);} cur.fim=x.dia;cur.n++; });
  h+='<ol class="mp">';
  etapas.forEach(function(et,k){var r=regs[et.reg], api=window.CalAPI;
    h+='<li><span class="mn">'+(k+1)+'</span><div><b>'+esc(r.nome)+'</b> <span class="ho">'+esc(et.ini===et.fim?api.longo(et.ini).replace(/^[^,]+, /,''):(et.ini.slice(8)+'/'+et.ini.slice(5,7)+' a '+et.fim.slice(8)+'/'+et.fim.slice(5,7)))+'</span>'+
      '<div class="lc">'+et.n+' parada'+(et.n>1?'s':'')+' neste trecho da viagem</div></div></li>';
    var prox=etapas[k+1];
    if(prox){ var leg=legs.filter(function(g){return g.a.reg===et.reg&&g.b.reg===prox.reg;})[0];
      if(leg)h+='<li class="leg"><span class="mn">↓</span><div><b>'+esc(r.nome)+' → '+esc(regs[prox.reg].nome)+'</b>: '+fmtKm(leg.d)+' em linha reta · '+leg.e.modo+' ≈ '+fmtMin(leg.e.min)+
        '<div class="lk"><a href="'+esc(rotaUrl(leg.a,leg.b,'transit'))+'" target="_blank" rel="noopener">🚆 ver rota e preço</a></div>'+campoPreco(leg.it)+'</div></li>';
      else h+='<li class="leg"><span class="mn">↓</span><div class="nota">Sem como calcular este trecho ainda.</div></li>'; }
  });
  h+='</ol>';
  /* lista de trechos dentro das cidades (um campo por par de lugares; ida e volta valem o mesmo) */
  var vistos={},unicos=[]; locais.forEach(function(g){if(!vistos[g.it.key]){vistos[g.it.key]=1;unicos.push(g);}});
  var itensU=legs.map(function(g){return g.it;});
  itensU=itensU.filter(function(it,i,ar){return ar.findIndex(function(z){return z.key===it.key;})===i;}).concat(unicos.map(function(g){return g.it;}));
  /* o total conta cada trecho tantas vezes quanto ele é feito */
  var cont={}; legs.concat(locais).forEach(function(g){cont[g.it.key]=(cont[g.it.key]||0)+1;});
  var itensCont=[]; itensU.forEach(function(it){for(var n=0;n<cont[it.key];n++)itensCont.push(it);});
  if(itensCont.length){ h=painelOrc(itensCont,'Orçamento das passagens da viagem toda')+comparaPasse(legs)+h;
    if(unicos.length)h+='<details class="mais"><summary>Trechos dentro das cidades ('+unicos.length+')</summary><div style="display:grid;gap:10px;margin-top:8px">'+unicos.map(function(g){return '<div><b>'+esc(g.a.rotulo)+' → '+esc(g.b.rotulo)+'</b> <span class="nota">('+fmtKm(km(g.a.pos,g.b.pos))+(cont[g.it.key]>1?' · '+cont[g.it.key]+'×':'')+')</span>'+campoPreco(g.it)+'</div>';}).join('')+'</div></details>'; }
  if(faltam)h+='<p class="nota"><b>'+faltam+' lugar'+(faltam>1?'es':'')+' não achado'+(faltam>1?'s':'')+' no mapa</b> e ficou'+(faltam>1?'ram':'')+' de fora da conta. Veja o dia a dia para marcar no mapa: '+seq.filter(function(x){return !x.pos&&!x.buscando;}).map(function(x){return esc(x.rotulo)+(soLinkCurto(x.local)?' (link curto do Google Maps: abra o link, copie o endereço ou as coordenadas e cole no campo Local)':'');}).join('; ')+'.</p>';
  el.innerHTML=h;
  ligaOrc(function(){salvaOrc();pintaViagem();});
  desenhaViagem(seq,legs,regs);
}
function desenhaViagem(seq,legs,regs){
  var box=$('#mapaBox'); if(!box)return;
  if(!window.L||!window.L.map){box.innerHTML='<p class="nota" style="padding:14px">O mapa não carregou (precisa de internet). A lista abaixo continua valendo.</p>';return;}
  iniciaMapa(box);
  if(camada)camada.remove(); camada=L.featureGroup().addTo(mapa);
  var cores=['#c23f5e','#4f7461','#8e6a1f','#6b5bb0','#2a7fa8','#b0552a'];
  seq.forEach(function(x){ if(!x.pos)return; var c=cores[x.reg%cores.length];
    L.circleMarker([x.pos.lat,x.pos.lon],{radius:5,color:'#fff',weight:1.5,fillColor:c,fillOpacity:1}).bindTooltip(x.rotulo).addTo(camada); });
  legs.forEach(function(g){ L.polyline([[g.a.pos.lat,g.a.pos.lon],[g.b.pos.lat,g.b.pos.lon]],{color:'#c23f5e',weight:3,dashArray:'6 8'}).addTo(camada); });
  var n=0; regs.forEach(function(r,i){ if(!r.pts.length)return; n++; });
  if(camada.getLayers().length)mapa.fitBounds(camada.getBounds().pad(.2),{maxZoom:12});
  setTimeout(function(){mapa.invalidateSize();},60);
}
var viagem={seq:[]};
function carregaViagem(){
  var api=window.CalAPI, S=api.estado(); viagem.seq=sequenciaViagem(S,api.doDia);
  $('#mapaVazio').hidden=viagem.seq.length>0; $('#mapaCorpo').hidden=!viagem.seq.length; $('#mapaHotelBox').hidden=true;
  if(!viagem.seq.length)return;
  var seq=++geoSeq;
  viagem.seq.forEach(function(x){var k=chave(x.local);
    if(cache.hasOwnProperty(k)){x.pos=cache[k];return;}
    var cd=coordDe(x.local); if(cd){x.pos=cd;return;}
    x.buscando=true;
    geocodificar(x.local).then(function(v){ if(seq!==geoSeq)return; x.pos=v;x.buscando=false;pintaViagem(); }).catch(function(){ if(seq!==geoSeq)return; x.buscando=false;pintaViagem(); });
  });
  pintaViagem();
}

/* ---------- tela ---------- */
function rotaUrl(a,b,modo){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(a.local)+'&destination='+encodeURIComponent(b.local)+'&travelmode='+modo;}
function pinta(){
  var el=$('#mapaLista'); if(!el)return;
  if(digitando()){setTimeout(pinta,900);return;}
  var h='<ol class="mp">',tot=0,totMin=0,alertas=0,i,itens=[];
  for(i=0;i<paradas.length;i++){var p=paradas[i];
    h+='<li><span class="mn">'+(i+1)+'</span><div><b>'+esc(p.rotulo)+'</b>'+(p.hora?' <span class="ho">'+esc(p.hora)+(p.horaFim?'–'+esc(p.horaFim):'')+'</span>':'')+
      '<div class="lc">📍 '+esc(p.local)+(p.pos?'':' — '+(p.buscando?'procurando no mapa…':'<b>não achei no mapa</b> <button type="button" class="btn sm" data-marca="'+i+'">'+(colocando===i?'toque no mapa…':'📍 marcar no mapa')+'</button>'))+'</div></div></li>';
    if(i<paradas.length-1){var q=paradas[i+1];
      if(p.pos&&q.pos){var es=estima(km(p.pos,q.pos));tot+=es.km;totMin+=es.min;
        var gap=null;if(p.horaFim&&q.hora){gap=mins(q.hora)-mins(p.horaFim);}
        var risco=gap!==null&&gap<es.min;if(risco)alertas++;
        h+='<li class="leg'+(risco?' risco':'')+'"><span class="mn">↓</span><div>'+
          '<b>'+fmtKm(es.km)+'</b> em linha reta · a pé ≈ '+fmtMin(es.pe)+' · de trem/ônibus ≈ '+fmtMin(es.trans)+
          (gap!==null?'<div class="gp">'+(risco?'⚠️ Só '+fmtMin(Math.max(gap,0))+' entre o fim de um e o começo do outro — pode ficar apertado.':'✓ Sobram '+fmtMin(gap)+' entre os dois.')+'</div>':'')+
          '<div class="lk"><a href="'+esc(rotaUrl(p,q,'transit'))+'" target="_blank" rel="noopener">🚆 rota de trem</a> · <a href="'+esc(rotaUrl(p,q,'walking'))+'" target="_blank" rel="noopener">🚶 a pé</a></div>'+(function(){var it={key:kTar(p,q),est:estTarifa(es.km)};itens.push(it);return campoPreco(it);})()+'</div></li>';
      } else h+='<li class="leg"><span class="mn">↓</span><div class="nota">Sem como calcular: falta achar um dos lugares no mapa.</div></li>';
    }
  }
  h+='</ol>';
  if(itens.length)h=painelOrc(itens,'Custo de transporte deste dia')+h;
  if(paradas.length>1&&tot>0)h='<p class="mt"><b>Total do dia:</b> ≈ '+fmtKm(tot)+' em linha reta · cerca de '+fmtMin(totMin)+' só de deslocamento'+(alertas?' · <b style="color:var(--red)">'+alertas+' trecho(s) apertado(s)</b>':'')+'</p>'+h;
  el.innerHTML=h;
  ligaOrc(function(){salvaOrc();pinta();});
  desenhaMapa();
}
function resolve(){
  var seq=++geoSeq;
  paradas.forEach(function(p){var k=chave(p.local);
    if(cache.hasOwnProperty(k)){p.pos=cache[k];return;}
    var cd=coordDe(p.local); if(cd){p.pos=cd;return;}
    p.buscando=true;
    geocodificar(p.local).then(function(v){ if(seq!==geoSeq)return; p.pos=v; p.buscando=false; pinta(); }).catch(function(){ if(seq!==geoSeq)return; p.buscando=false; pinta(); });
  });
}
function carrega(){
  var api=window.CalAPI; if(!api)return;
  if(dia==='all')return carregaViagem();
  var S=api.estado(); paradas=montaParadas(S,dia,api.doDia); colocando=-1;
  var vazio=!paradas.length;
  $('#mapaVazio').hidden=!vazio; $('#mapaCorpo').hidden=vazio;
  if(vazio)return;
  var tem=paradas.some(function(p){return p.hotel;}); $('#mapaHotelBox').hidden=!tem;
  resolve(); pinta();
}
function abrir(){
  var api=window.CalAPI; if(!api)return;
  var S=api.estado(), ds=diasComLocal(S), sel=$('#mapaDia');
  if(!ds.length){sel.innerHTML='';dia='';$('#mapaVazio').hidden=false;$('#mapaCorpo').hidden=true;return;}
  var hoje=new Date().toISOString().slice(0,10);
  if(dia!=='all'&&ds.indexOf(dia)<0)dia=(ds.length>1?'all':(ds.indexOf(hoje)>=0?hoje:ds[0]));
  sel.innerHTML='<option value="all"'+(dia==='all'?' selected':'')+'>🧳 Viagem toda (entre cidades)</option>'+ds.map(function(d){return '<option value="'+d+'"'+(d===dia?' selected':'')+'>'+esc(api.longo(d))+'</option>';}).join('');
  carregaLeaflet().then(function(){ carrega(); });
}
function ligar(){
  if(!$('#mapaDia'))return;
  $('#mapaDia').onchange=function(){dia=this.value;carrega();};
  $('#mapaHotel').onchange=function(){comHotel=this.checked;carrega();};
  $('#mapaLista').addEventListener('click',function(ev){var b=ev.target.closest('[data-marca]');if(!b)return;colocando=+b.dataset.marca;pinta();var bx=$('#mapaBox');if(bx&&bx.scrollIntoView)bx.scrollIntoView({block:'center',behavior:'smooth'});});
}
window.CalGeo={geocodificar:geocodificar,coordDe:coordDe,soLinkCurto:soLinkCurto,km:km,estima:estima,estimaLonga:estimaLonga,estTarifa:estTarifa,fmtMin:fmtMin,fmtKm:fmtKm,chave:chave,yen:function(n){return '¥ '+Math.round(n).toLocaleString('pt-BR');}};
window.CalMapa={abrir:abrir,_agrupa:agrupaRegioes,_longa:estimaLonga,_km:km,_estima:estima,_montaParadas:montaParadas};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar);else ligar();
})();
