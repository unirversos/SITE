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
  var evs=doDia(d), hotel=null, meio=[], i, e;
  for(i=0;i<evs.length;i++){e=evs[i];
    if(e.tipo==='hosp'&&e.local){ if(!hotel||e.data<d)hotel=e; if(e.data===d&&e.dataFim&&e.dataFim>d)hotel=e; }
  }
  for(i=0;i<evs.length;i++){e=evs[i]; if(!e.local||e.tipo==='hosp')continue; meio.push({ev:e,rotulo:e.titulo,local:e.local,hora:e.hora,horaFim:e.horaFim});}
  var lista=[];
  if(comHotel&&hotel&&hotel.data<d)lista.push({ev:hotel,rotulo:'🏨 '+hotel.titulo+' (saída)',local:hotel.local,hotel:true});
  lista=lista.concat(meio);
  if(comHotel&&hotel&&(!hotel.dataFim||d<hotel.dataFim))lista.push({ev:hotel,rotulo:'🏨 '+hotel.titulo+' (volta)',local:hotel.local,hotel:true});
  return lista;
}
function diasComLocal(S){var o={};S.ev.forEach(function(e){if(!e.local)return;var f=e.dataFim||e.data,x=e.data;
  if(e.tipo==='hosp'){o[e.data]=1;return;} o[x]=1;});return Object.keys(o).sort();}

/* ---------- geocodificação (OpenStreetMap Nominatim, 1 pedido por segundo, com cache) ---------- */
var fila=Promise.resolve(), ultimo=0;
function geocodificar(q){
  var k=chave(q); if(cache.hasOwnProperty(k))return Promise.resolve(cache[k]);
  var p=fila.then(function(){
    var esp=Math.max(0,1100-(Date.now()-ultimo));
    return new Promise(function(r){setTimeout(r,esp);}).then(function(){
      ultimo=Date.now();
      return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt&q='+encodeURIComponent(q),{headers:{'Accept':'application/json'}});
    }).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();})
    .then(function(j){var v=(j&&j[0])?{lat:+j[0].lat,lon:+j[0].lon,nome:String(j[0].display_name||'').slice(0,160)}:null;
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
function desenhaMapa(){
  var box=$('#mapaBox'); if(!box)return;
  var pts=paradas.filter(function(p){return p.pos;});
  if(!window.L||!window.L.map){box.innerHTML='<p class="nota" style="padding:14px">O mapa não carregou (precisa de internet). A lista abaixo continua valendo.</p>';return;}
  if(!mapa){box.innerHTML='';mapa=L.map(box,{scrollWheelZoom:false}).setView([35.68,139.76],11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapa);
    mapa.on('click',function(ev){ if(colocando<0)return; var p=paradas[colocando]; p.pos={lat:ev.latlng.lat,lon:ev.latlng.lng,nome:'marcado por você'}; cache[chave(p.local)]=p.pos; salvaCache(); colocando=-1; pinta(); });
  }
  if(camada)camada.remove(); camada=L.featureGroup().addTo(mapa);
  pts.forEach(function(p){var n=paradas.indexOf(p)+1;
    L.marker([p.pos.lat,p.pos.lon],{icon:L.divIcon({className:'mk',html:'<span>'+n+'</span>',iconSize:[28,28],iconAnchor:[14,14]}),title:p.rotulo.replace(/^🏨 /,'')}).addTo(camada);});
  if(pts.length>1)L.polyline(pts.map(function(p){return [p.pos.lat,p.pos.lon];}),{color:'#c23f5e',weight:3,dashArray:'6 8'}).addTo(camada);
  if(pts.length)mapa.fitBounds(camada.getBounds().pad(.25),{maxZoom:15});
  setTimeout(function(){mapa.invalidateSize();},60);
}

/* ---------- tela ---------- */
function rotaUrl(a,b,modo){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(a.local)+'&destination='+encodeURIComponent(b.local)+'&travelmode='+modo;}
function pinta(){
  var el=$('#mapaLista'); if(!el)return;
  var h='<ol class="mp">',tot=0,totMin=0,alertas=0,i;
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
          '<div class="lk"><a href="'+esc(rotaUrl(p,q,'transit'))+'" target="_blank" rel="noopener">🚆 rota de trem</a> · <a href="'+esc(rotaUrl(p,q,'walking'))+'" target="_blank" rel="noopener">🚶 a pé</a></div></div></li>';
      } else h+='<li class="leg"><span class="mn">↓</span><div class="nota">Sem como calcular: falta achar um dos lugares no mapa.</div></li>';
    }
  }
  h+='</ol>';
  if(paradas.length>1&&tot>0)h='<p class="mt"><b>Total do dia:</b> ≈ '+fmtKm(tot)+' em linha reta · cerca de '+fmtMin(totMin)+' só de deslocamento'+(alertas?' · <b style="color:var(--red)">'+alertas+' trecho(s) apertado(s)</b>':'')+'</p>'+h;
  el.innerHTML=h;
  desenhaMapa();
}
function resolve(){
  var seq=++geoSeq;
  paradas.forEach(function(p){var k=chave(p.local);
    if(cache.hasOwnProperty(k)){p.pos=cache[k];return;}
    p.buscando=true;
    geocodificar(p.local).then(function(v){ if(seq!==geoSeq)return; p.pos=v; p.buscando=false; pinta(); }).catch(function(){ if(seq!==geoSeq)return; p.buscando=false; pinta(); });
  });
}
function carrega(){
  var api=window.CalAPI; if(!api)return;
  var S=api.estado(); paradas=montaParadas(S,dia,api.doDia); colocando=-1;
  var vazio=!paradas.length;
  $('#mapaVazio').hidden=!vazio; $('#mapaCorpo').hidden=vazio;
  if(vazio)return;
  var tem=paradas.some(function(p){return p.hotel;}); $('#mapaHotelBox').hidden=!tem;
  pinta(); resolve();
}
function abrir(){
  var api=window.CalAPI; if(!api)return;
  var S=api.estado(), ds=diasComLocal(S), sel=$('#mapaDia');
  if(!ds.length){sel.innerHTML='';dia='';$('#mapaVazio').hidden=false;$('#mapaCorpo').hidden=true;return;}
  var hoje=new Date().toISOString().slice(0,10);
  if(ds.indexOf(dia)<0)dia=ds.indexOf(hoje)>=0?hoje:ds[0];
  sel.innerHTML=ds.map(function(d){return '<option value="'+d+'"'+(d===dia?' selected':'')+'>'+esc(api.longo(d))+'</option>';}).join('');
  carregaLeaflet().then(function(){ carrega(); });
}
function ligar(){
  if(!$('#mapaDia'))return;
  $('#mapaDia').onchange=function(){dia=this.value;carrega();};
  $('#mapaHotel').onchange=function(){comHotel=this.checked;carrega();};
  $('#mapaLista').addEventListener('click',function(ev){var b=ev.target.closest('[data-marca]');if(!b)return;colocando=+b.dataset.marca;pinta();var bx=$('#mapaBox');if(bx&&bx.scrollIntoView)bx.scrollIntoView({block:'center',behavior:'smooth'});});
}
window.CalMapa={abrir:abrir,_km:km,_estima:estima,_montaParadas:montaParadas};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar);else ligar();
})();
