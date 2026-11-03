/* De → Para: distância, tempo e passagem estimada entre dois lugares.
   Lê o calendário salvo neste navegador (para sugerir trechos) e guarda o preço no mesmo calendário. */
(function(){
'use strict';
var G=window.CalGeo, KEY='uniCalendario1';
function $(s){return document.querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var S=null; try{S=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){S=null;}
if(!S||typeof S!=='object')S=null;
function orc(){ if(!S)S={titulo:'',ini:'',fim:'',fuso:'auto',chegada:'',atualizado:'',ev:[]}; if(!S.orc||typeof S.orc!=='object')S.orc={cot:'',pax:1,t:{}}; if(!S.orc.t)S.orc.t={}; if(!S.orc.pax)S.orc.pax=1; return S.orc; }
function grava(){ try{ S.atualizado=new Date().toISOString(); localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }

/* ---------- lugares do calendário ---------- */
var lugares={}, eventos=[];
(function(){
  var ev=(S&&Array.isArray(S.ev)?S.ev:[]).filter(function(e){return e&&e.local&&e.titulo;});
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
function rotaUrl(pa,pb){return 'https://www.google.com/maps/dir/?api=1&origin='+pa.lat+','+pa.lon+'&destination='+pb.lat+','+pb.lon+'&travelmode=transit';}

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

function mostra(a,b,pa,pb){
  var d=G.km(pa,pb), res=$('#res'), key=kTar(a,b), est=G.estTarifa(d), o=orc(), t=o.t[key], conf=!!t, v=conf?t.v:est, h='';
  var tempos;
  if(d<=30){ var e=G.estima(d); tempos=(e.pe<=120?'<div>🚶 a pé<b>'+G.fmtMin(e.pe)+'</b></div>':'')+'<div>🚆 trem / ônibus<b>'+G.fmtMin(e.trans)+'</b></div>'; }
  else { var L=G.estimaLonga(d); tempos='<div>'+L.modo+'<b>'+G.fmtMin(L.min)+'</b></div>'; }
  h+='<div class="km">'+G.fmtKm(d).replace(' km','')+' <small>km em linha reta</small></div><div class="tempos">'+tempos+'</div>'+
    '<div class="preco"><label>Passagem (¥)<input id="pv" type="number" inputmode="numeric" min="0" step="10" value="'+v+'" class="'+(conf?'ok':'')+'"></label>'+
    '<label>Pessoas<input id="pp" type="number" min="1" max="20" value="'+o.pax+'" style="width:76px"></label>'+
    '<label>¥ 100 = R$<input id="pc" type="number" inputmode="decimal" min="0" step="0.01" value="'+(o.cot?(o.cot*100).toFixed(2):'')+'" placeholder="3,50" style="width:96px"></label></div>'+
    '<div class="preco"><span class="rs" id="tot"></span><span class="tg'+(conf?' ok':'')+'" id="tg">'+(conf?'✓ valor confirmado':'estimativa')+'</span>'+(conf?'<button type="button" class="btn sm" id="rev">↺ estimativa</button>':'')+'</div>'+
    '<a class="btn pri" href="'+esc(rotaUrl(pa,pb))+'" target="_blank" rel="noopener" style="justify-self:start">🚆 Ver rota e preço</a>';
  res.innerHTML=h; res.hidden=false; total(est);
  $('#pv').onchange=function(){var x=Math.round(parseFloat(String(this.value).replace(',','.'))); if(isFinite(x)&&x>=0&&x<=99999999){ if(!(x===est&&!orc().t[key]))orc().t[key]={v:x,c:1}; grava(); mostra(a,b,pa,pb);} };
  $('#pp').onchange=function(){var n=parseInt(this.value,10); if(n>=1&&n<=20){orc().pax=n;grava();total(est);} };
  $('#pc').onchange=function(){var c=parseFloat(String(this.value).replace(',','.')); orc().cot=(isFinite(c)&&c>0&&c<100000)?c/100:''; grava(); total(est);};
  if($('#rev'))$('#rev').onclick=function(){delete orc().t[key];grava();mostra(a,b,pa,pb);};
  function total(es){
    var oo=orc(), vv=parseFloat($('#pv').value); if(!isFinite(vv))vv=es; var tp=vv*oo.pax;
    $('#tot').textContent=G.yen(tp)+(oo.pax>1?' ('+oo.pax+' pessoas)':'')+(oo.cot?' · ≈ R$ '+(tp*oo.cot).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'');
  }
}
var tmr; function agenda(){clearTimeout(tmr);tmr=setTimeout(calcula,450);}
$('#de').addEventListener('input',agenda); $('#para').addEventListener('input',agenda);
$('#de').addEventListener('change',calcula); $('#para').addEventListener('change',calcula);
$('#troca').onclick=function(){var x=$('#de').value;$('#de').value=$('#para').value;$('#para').value=x;calcula();};
})();
