/* De → Para: distância, tempo e passagem estimada entre dois lugares.
   Lê o calendário salvo neste navegador (para sugerir trechos) e guarda o preço no mesmo calendário. */
(function(){
'use strict';
var G=window.CalGeo, KEY='uniCalendario1';
function $(s){return document.querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var S=null; try{S=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){S=null;}
if(!S||typeof S!=='object')S=null;
function orc(){ if(!S)S={titulo:'',ini:'',fim:'',fuso:'auto',chegada:'',atualizado:'',ev:[],pas:[]}; if(!Array.isArray(S.ev))S.ev=[]; if(!Array.isArray(S.pas))S.pas=[]; if(!S.ok||typeof S.ok!=='object')S.ok={}; if(!S.orc||typeof S.orc!=='object')S.orc={cot:'',pax:1,t:{}}; if(!S.orc.t)S.orc.t={}; if(!S.orc.pax)S.orc.pax=1; return S.orc; }
function grava(){ try{ S.atualizado=new Date().toISOString(); localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }

/* ---------- lugares do calendário ---------- */
var lugares={}, eventos=[];
(function(){
  var meus={}; ((S&&Array.isArray(S.pas))?S.pas:[]).forEach(function(q){if(q&&q.evId)meus[q.evId]=1;});
  var ev=(S&&Array.isArray(S.ev)?S.ev:[]).filter(function(e){return e&&e.local&&e.titulo&&!meus[e.id];});
  ev.sort(function(a,b){return (a.data+(a.hora||'00:00'))<(b.data+(b.hora||'00:00'))?-1:1;});
  var usados={};
  ev.forEach(function(e){
    var nome=String(e.titulo).slice(0,60), n=nome;
    if(usados[n]&&lugares[n]!==e.local)n=nome+' ('+e.data.slice(8)+'/'+e.data.slice(5,7)+')';
    usados[n]=1; lugares[n]=e.local; eventos.push({nome:n,local:e.local,data:e.data});
  });
  $('#lugares').innerHTML=Object.keys(lugares).map(function(n){return '<option value="'+esc(n)+'"></option>';}).join('');
  var hoje=new Date().toISOString().slice(0,10), fut=eventos.filter(function(e){return e.data>=hoje;}), base=fut.length?fut:eventos, pares=[];
  for(var i=0;i<base.length-1&&pares.length<12;i++){
    if(G.chave(base[i].local)!==G.chave(base[i+1].local))pares.push([base[i],base[i+1]]);
  }
  $('#sug').innerHTML=pares.map(function(p,i){return '<button type="button" data-p="'+i+'">'+esc(p[0].nome)+' → '+esc(p[1].nome)+'<small>'+esc(p[1].data.slice(8)+'/'+p[1].data.slice(5,7))+'</small></button>';}).join('');
  $('#sug').onclick=function(ev){var b=ev.target.closest('[data-p]'); if(!b)return; var p=pares[+b.dataset.p]; $('#de').value=p[0].nome; $('#para').value=p[1].nome; calcula();};
  if(!pares.length)$('#sug').hidden=true;
})();

function localDe(v){v=String(v||'').trim(); return lugares[v]||v;}
function kTar(a,b){return [G.chave(a),G.chave(b)].sort().join('>');}
function rotaUrl(pa,pb){return 'https://www.google.com/maps/dir/?api=1&origin='+pontoRota(pa)+'&destination='+pontoRota(pb)+'&travelmode=transit';}

var seq=0;
function calcula(){
  var a=localDe($('#de').value), b=localDe($('#para').value), vazio=$('#vazio'), res=$('#res');
  res.hidden=true; vazio.textContent='';
  if(!a||!b)return;
  if(G.chave(a)===G.chave(b)){vazio.textContent='São o mesmo lugar.';return;}
  var meu=++seq; vazio.textContent='Procurando no mapa…';
  Promise.all([G.geocodificar(a),G.geocodificar(b)]).then(function(r){
    if(meu!==seq)return;
    var pa=r[0], pb=r[1];
    if(!pa||!pb){
      var quem=!pa&&!pb?'os dois lugares':(!pa?'“'+$('#de').value.trim()+'”':'“'+$('#para').value.trim()+'”');
      vazio.textContent=(G.soLinkCurto(a)||G.soLinkCurto(b)?'Link curto do Google Maps não dá para ler: ':'Não achei '+quem+' no mapa: ')+'escreva o nome com a cidade, o endereço, ou cole as coordenadas.';
      return;
    }
    vazio.textContent=''; mostra(a,b,pa,pb);
  }).catch(function(){ if(meu!==seq)return; vazio.textContent='Sem internet para procurar no mapa. Tente de novo.'; });
}

/* ---------- estações perto de cada ponto (OpenStreetMap / Overpass) ---------- */
var EST_KEY='uniEstacoes1', estCache={}; try{estCache=JSON.parse(localStorage.getItem(EST_KEY)||'{}')||{};}catch(e){estCache={};}
function estacaoPerto(pos){
  var k=pos.lat.toFixed(3)+','+pos.lon.toFixed(3);
  if(estCache.hasOwnProperty(k))return Promise.resolve(estCache[k]);
  var q='[out:json][timeout:20];(node(around:1500,'+pos.lat+','+pos.lon+')[railway=station];node(around:1500,'+pos.lat+','+pos.lon+')[railway=halt];);out body 40;';
  return fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(q)})
    .then(function(r){if(!r.ok)throw new Error('http');return r.json();})
    .then(function(j){
      var L=((j&&j.elements)||[]).filter(function(x){return x.tags&&(x.tags['name:pt']||x.tags['name:en']||x.tags.name);}).map(function(x){
        return {nome:String(x.tags['name:pt']||x.tags['name:en']||x.tags.name).slice(0,80),en:String(x.tags['name:en']||x.tags['name:ja-Latn']||x.tags['name:ja_rm']||x.tags.name||'').slice(0,80),lat:x.lat,lon:x.lon,m:Math.round(G.km(pos,{lat:x.lat,lon:x.lon})*1000)};});
      L.sort(function(p,q){return p.m-q.m;});
      var v=L[0]||null; estCache[k]=v; try{localStorage.setItem(EST_KEY,JSON.stringify(estCache));}catch(e){} return v;});
}
function pontoRota(p){return (+p.lat).toFixed(5)+','+(+p.lon).toFixed(5);}
function rotaEntre(o,d){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(pontoRota(o))+'&destination='+encodeURIComponent(pontoRota(d))+'&travelmode=transit';}

function dataDoEvento(local){var k=G.chave(local),e=eventos.filter(function(x){return G.chave(x.local)===k;});return e.length?e[e.length-1].data:'';}

function mostra(a,b,pa,pb){
  var d=G.km(pa,pb), res=$('#res'), rk=kTar(a,b), o=orc();
  if(!o.m)o.m={};
  var modo=o.m[rk]||G.modoPadrao(d), key=rk+'|'+modo, E=G.estModo(modo,d), t=o.t[key], conf=!!t, v=conf?t.v:E.fare, h='';
  var chips=Object.keys(G.MODOS).map(function(m){var em=G.estModo(m,d), tm=o.t[rk+'|'+m], cm=tm?tm.v:em.fare;
    return '<button type="button" class="md'+(m===modo?' on':'')+'" data-m="'+m+'" aria-pressed="'+(m===modo)+'">'+G.MODOS[m]+'<small>'+G.fmtMin(em.min)+' · '+(cm===0?'grátis':G.yen(cm))+(tm?' ✓':'')+'</small></button>';}).join('');
  h+='<div class="km">'+G.fmtKm(d).replace(' km','')+' <small>km em linha reta</small></div>'+
    '<div class="modos" role="group" aria-label="Meio de transporte">'+chips+'</div>'+
    '<div class="tempos"><div>'+G.MODOS[modo]+'<b>'+G.fmtMin(E.min)+'</b></div></div>'+
    '<p class="nt">'+esc(E.nota)+'</p>'+
    '<div id="av"></div>'+
    '<div class="preco"><label>Custo (¥ por pessoa)<input id="pv" type="number" inputmode="numeric" min="0" step="10" value="'+v+'" class="'+(conf?'ok':'')+'"></label>'+
    '<label>Pessoas<input id="pp" type="number" min="1" max="20" value="'+o.pax+'" style="width:76px"></label>'+
    '<label>¥ 100 = R$<input id="pc" type="number" inputmode="decimal" min="0" step="0.01" value="'+(o.cot?(o.cot*100).toFixed(2):'')+'" placeholder="3,50" style="width:96px"></label></div>'+
    '<div class="preco"><span class="rs" id="tot"></span><span class="tg'+(conf?' ok':'')+'" id="tg">'+(conf?'✓ valor confirmado':'estimativa')+'</span>'+(conf?'<button type="button" class="btn sm" id="rev">↺ estimativa</button>':'')+'</div>'+
    '<div id="est" class="est">Procurando estações perto…</div>'+
    '<div class="salva"><label>Data<input id="sd" type="date" value="'+(dataDoEvento(b)||dataDoEvento(a)||'')+'"></label><label>Hora<input id="sh" type="time"></label><button type="button" class="btn pri" id="sv">➕ Salvar esta passagem</button></div><p class="nt" id="smsg"></p>'+
    '<div class="btns"><a class="btn pri" id="rt" href="'+esc(rotaUrl(pa,pb))+'" target="_blank" rel="noopener">🚆 Ver rota e preço</a></div>'+
    '<div class="btns" id="jr"><a class="btn" href="https://world.jorudan.co.jp/mln/pt/" target="_blank" rel="noopener">🔎 Abrir no Jorudan</a><a class="btn" href="https://japantravel.navitime.com/" target="_blank" rel="noopener">🧭 Abrir no NAVITIME</a><button type="button" class="btn sm" id="cpDe" disabled>📋 Copiar origem</button><button type="button" class="btn sm" id="cpPara" disabled>📋 Copiar destino</button></div>';
  res.innerHTML=h; res.hidden=false; total(E.fare);
  res.querySelector('.modos').onclick=function(ev){var bt=ev.target.closest('[data-m]'); if(!bt)return; orc().m[rk]=bt.dataset.m; grava(); mostra(a,b,pa,pb);};
  $('#pv').onchange=function(){var x=Math.round(parseFloat(String(this.value).replace(',','.'))); if(isFinite(x)&&x>=0&&x<=99999999){ if(!(x===E.fare&&!orc().t[key]))orc().t[key]={v:x,c:1}; grava(); mostra(a,b,pa,pb);} };
  $('#pp').onchange=function(){var n=parseInt(this.value,10); if(n>=1&&n<=20){orc().pax=n;grava();total(E.fare);} };
  $('#pc').onchange=function(){var c=parseFloat(String(this.value).replace(',','.')); orc().cot=(isFinite(c)&&c>0&&c<100000)?c/100:''; grava(); total(E.fare);};
  if($('#rev'))$('#rev').onclick=function(){delete orc().t[key];grava();mostra(a,b,pa,pb);};
  $('#sv').onclick=function(){
    var dt=$('#sd').value; if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)){$('#smsg').textContent='Escolha a data da viagem para salvar.';return;}
    var vv=parseFloat($('#pv').value); if(!isFinite(vv))vv=E.fare;
    var p={id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),evId:'',de:$('#de').value.trim().slice(0,120),para:$('#para').value.trim().slice(0,120),deLocal:a.slice(0,300),paraLocal:b.slice(0,300),
      modo:modo,rapido:modo==='trem'&&d>100&&d<=700,data:dt,hora:$('#sh').value||'',v:Math.round(vv),pax:orc().pax,estado:'comprar',codigo:''};
    PAS().push(p); syncEvento(p); grava(); lista(); $('#smsg').textContent='✓ Salva em Minhas passagens e no calendário.'; };
  /* aviso de antecedência do trem-bala */
  if(modo==='trem'&&d>100&&d<=700){
    var dt=dataDoEvento(b)||dataDoEvento(a), av=(window.CalAvisos&&dt)?CalAvisos.para({data:dt,tipo:'transp',titulo:'Shinkansen'}):null;
    $('#av').innerHTML='<div class="aviso">🚄 <b>Assento reservado no trem-bala:</b> '+(av?av.texto:'no balcão abre 1 mês antes, às 10h do Japão; pelo SmartEX dá para reservar antes.')+'</div>';
  }
  /* estações mais perto de cada ponto */
  Promise.all([estacaoPerto(pa),estacaoPerto(pb)]).then(function(r){
    if(!$('#est'))return; var ea=r[0], eb=r[1];
    function lin(rot,e){return e?'🚉 '+rot+': <b>'+esc(e.nome)+'</b> · '+(e.m<1000?e.m+' m':(e.m/1000).toFixed(1).replace('.',',')+' km')+' a pé':'🚉 '+rot+': nenhuma estação em 1,5 km';}
    $('#est').innerHTML=lin('Saindo de',ea)+'<br>'+lin('Chegando em',eb);
    function copia(btn,e,rot){ if(!e)return; btn.disabled=false; btn.onclick=function(){var t=e.en||e.nome; (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){btn.textContent='✓ copiado: '+t;},function(){btn.textContent=t;}); }; }
    copia($('#cpDe'),ea,'origem'); copia($('#cpPara'),eb,'destino');
    if(ea&&eb&&modo==='trem'){ $('#rt').href=rotaEntre(ea,eb); $('#rt').textContent='🚆 Rota de trem: '+ea.nome+' → '+eb.nome; }
  }).catch(function(){ if($('#est'))$('#est').textContent='Não consegui procurar as estações agora (sem internet ou serviço fora do ar). A rota abre pelos endereços.'; });
  function total(es){
    var oo=orc(), vv=parseFloat($('#pv').value); if(!isFinite(vv))vv=es; var tp=vv*oo.pax;
    $('#tot').textContent=G.yen(tp)+(oo.pax>1?' ('+oo.pax+' pessoas)':'')+(oo.cot?' · ≈ R$ '+(tp*oo.cot).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'');
  }
}
/* ---------- minhas passagens ---------- */
function PAS(){orc();return S.pas;}
var ROTULO={comprar:'A comprar',comprado:'Comprado',cancelado:'Cancelado'};
function fd(d){return d?d.slice(8)+'/'+d.slice(5,7):'';}
function brl(n){return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function syncEvento(p){
  var o=orc(), ev=o&&S.ev.filter(function(e){return e.id===p.evId;})[0];
  var tit=p.de+' → '+p.para+(p.rapido?' (trem-bala)':' ('+G.MODOS[p.modo].replace(/^\S+\s/,'').toLowerCase()+')');
  var det=p.de+' → '+p.para+'\nMeio: '+G.MODOS[p.modo]+'\nCusto: '+G.yen(p.v)+' por pessoa × '+p.pax+' = '+G.yen(p.v*p.pax)+'\nEstado: '+ROTULO[p.estado]+(p.codigo?'\nCódigo da reserva: '+p.codigo:'');
  if(!ev){ p.evId='e'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    ev={id:p.evId,titulo:tit,tipo:'transp',data:p.data,dataFim:'',hora:p.hora,horaFim:'',fuso:(S.fuso||'auto'),local:p.deLocal,detalhes:det}; S.ev.push(ev); }
  else { ev.titulo=tit; ev.data=p.data; ev.hora=p.hora; ev.local=p.deLocal; ev.detalhes=det; }
  if(p.estado==='comprado')S.ok[p.evId]=1; else delete S.ok[p.evId];
}
var COMPRA=[['SmartEX','https://smart-ex.jp/en/','Tóquio ↔ Nagoia ↔ Quioto ↔ Osaka ↔ Hiroshima ↔ Hakata'],['JR-East','https://www.eki-net.com/en/jreast-train-reservation/','saindo de Tóquio para Nagano, Niigata, Kanazawa e o norte'],['JR-West','https://www.westjr.co.jp/global/en/','Kansai, Hokuriku e Sanyo']];
function lista(){
  var box=$('#minhas'), L=(S&&Array.isArray(S.pas))?S.pas:[]; if(!box)return;
  if(!L.length){box.hidden=true;return;}
  box.hidden=false; var o=orc(), cot=o.cot||0, ativos=L.filter(function(p){return p.estado!=='cancelado';});
  var tC=0,tA=0; ativos.forEach(function(p){var x=p.v*p.pax; if(p.estado==='comprado')tC+=x; else tA+=x;});
  function m(x){return G.yen(x)+(cot?'<small>≈ '+brl(x*cot)+'</small>':'');}
  var h='<h2>Minhas passagens</h2><div class="tots"><div><small>Comprado</small><b>'+m(tC)+'</b></div><div><small>A comprar</small><b>'+m(tA)+'</b></div><div><small>Total</small><b>'+m(tC+tA)+'</b></div></div>';
  L.slice().sort(function(a,b){return (a.data+a.hora)<(b.data+b.hora)?-1:1;}).forEach(function(p){
    var aviso='';
    if(p.rapido&&p.estado==='comprar'&&window.CalAvisos&&p.data){var av=CalAvisos.para({data:p.data,tipo:'transp',titulo:'trem-bala'}); if(av){var st=CalAvisos.situacao(av); aviso='<div class="aviso">⏰ '+(st.est==='aberto'?'Já abriu: compre agora. ':st.est==='hoje'?'Abre hoje. ':'Faltam '+st.dias+' dias. ')+av.texto+'</div>';}}
    var links=(p.rapido&&p.estado!=='cancelado')?'<div class="onde">Onde comprar: '+COMPRA.map(function(c){return '<a href="'+esc(c[1])+'" target="_blank" rel="noopener" title="'+esc(c[2])+'">'+c[0]+'</a>';}).join(' · ')+'<small>SmartEX: '+esc(COMPRA[0][2])+'. JR-East: '+esc(COMPRA[1][2])+'. JR-West: '+esc(COMPRA[2][2])+'.</small></div>':'';
    h+='<div class="pas '+p.estado+'" data-id="'+esc(p.id)+'"><div class="ph"><b>'+esc(p.de)+' → '+esc(p.para)+'</b><span class="md2">'+G.MODOS[p.modo]+'</span></div>'+
      '<div class="pl">'+esc(fd(p.data))+(p.hora?' às '+esc(p.hora):'')+' · '+G.yen(p.v)+' × '+p.pax+' = <b>'+G.yen(p.v*p.pax)+'</b>'+(cot?' · ≈ '+brl(p.v*p.pax*cot):'')+'</div>'+
      '<div class="pr"><label>Estado<select data-e>'+Object.keys(ROTULO).map(function(k){return '<option value="'+k+'"'+(k===p.estado?' selected':'')+'>'+ROTULO[k]+'</option>';}).join('')+'</select></label>'+
      '<label>Código da reserva<input data-c value="'+esc(p.codigo)+'" maxlength="60" placeholder="quando comprar"></label><button type="button" class="btn sm" data-x>Remover</button></div>'+aviso+links+'</div>';
  });
  box.innerHTML=h;
}
$('#minhas').addEventListener('change',function(ev){
  var c=ev.target.closest('.pas'); if(!c)return; var p=PAS().filter(function(x){return x.id===c.dataset.id;})[0]; if(!p)return;
  if(ev.target.hasAttribute('data-e'))p.estado=ev.target.value; else if(ev.target.hasAttribute('data-c'))p.codigo=ev.target.value.trim().slice(0,60);
  syncEvento(p); grava(); lista(); });
$('#minhas').addEventListener('click',function(ev){
  var b=ev.target.closest('[data-x]'); if(!b)return; var c=b.closest('.pas'), o=orc(), p=PAS().filter(function(x){return x.id===c.dataset.id;})[0]; if(!p)return;
  if(!confirm('Remover esta passagem da lista e do calendário?'))return;
  S.ev=S.ev.filter(function(e){return e.id!==p.evId;}); delete S.ok[p.evId]; S.pas=S.pas.filter(function(x){return x.id!==p.id;}); grava(); lista(); });
lista();
var tmr; function agenda(){clearTimeout(tmr);tmr=setTimeout(calcula,450);}
$('#de').addEventListener('input',agenda); $('#para').addEventListener('input',agenda);
$('#de').addEventListener('change',calcula); $('#para').addEventListener('change',calcula);
(function(){try{var q=new URLSearchParams(location.search),d=q.get('de'),p=q.get('para'); if(d&&p){$('#de').value=d.slice(0,120);$('#para').value=p.slice(0,120);calcula();}}catch(e){}})();
$('#troca').onclick=function(){var x=$('#de').value;$('#de').value=$('#para').value;$('#para').value=x;calcula();};
})();
