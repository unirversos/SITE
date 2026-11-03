/* Passagens de trem/avião no Calendário: cria o trecho (também vira evento), lista com prazo de compra, links e código. */
(function(){
var ROTULO={comprar:'A comprar',comprado:'Comprado',cancelado:'Cancelado'};
var COMPRA=[['SmartEX','https://smart-ex.jp/en/','Tóquio ↔ Nagoia ↔ Quioto ↔ Osaka ↔ Hiroshima ↔ Hakata'],['JR-East','https://www.eki-net.com/en/jreast-train-reservation/','saindo de Tóquio para Nagano, Niigata, Kanazawa e o norte'],['JR-West','https://www.westjr.co.jp/global/en/','Kansai, Hokuriku e Sanyo']];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fd(d){return d?d.slice(8)+'/'+d.slice(5,7):'';}
function brl(n){return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function rid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function pas(S){if(!Array.isArray(S.pas))S.pas=[];return S.pas;}
function sync(S,G,p){
  if(!Array.isArray(S.ev))S.ev=[]; if(!S.ok)S.ok={};
  var ev=S.ev.filter(function(e){return e.id===p.evId;})[0];
  var tit=p.de+' → '+p.para+(p.rapido?' (trem-bala)':' ('+G.MODOS[p.modo].replace(/^\S+\s/,'').toLowerCase()+')');
  var det=p.de+' → '+p.para+'\nMeio: '+G.MODOS[p.modo]+'\nCusto: '+G.yen(p.v)+' por pessoa × '+p.pax+' = '+G.yen(p.v*p.pax)+'\nEstado: '+ROTULO[p.estado]+(p.codigo?'\nCódigo da reserva: '+p.codigo:'');
  if(!ev){ p.evId='e'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    ev={id:p.evId,titulo:tit,tipo:'transp',data:p.data,dataFim:'',hora:p.hora,horaFim:'',fuso:(S.fuso||'auto'),local:p.deLocal,detalhes:det}; S.ev.push(ev); }
  else { ev.titulo=tit; ev.data=p.data; ev.hora=p.hora; ev.local=p.deLocal; ev.detalhes=det; }
  if(p.estado==='comprado')S.ok[p.evId]=1; else delete S.ok[p.evId];
}
function nova(S,G,d){
  var p={id:rid(),evId:'',de:d.de,para:d.para,deLocal:d.deLocal||'',paraLocal:d.paraLocal||'',modo:d.modo,rapido:!!d.rapido,data:d.data,hora:d.hora||'',v:d.v,pax:d.pax||1,estado:'comprar',codigo:''};
  pas(S).push(p); sync(S,G,p); return p;
}
function jaSalvo(S,a,b){ return pas(S).some(function(p){return p.evId===a.id||p.evId===b.id||(p.de===a.titulo&&p.para===b.titulo);}); }
function remover(S,p){ S.ev=S.ev.filter(function(e){return e.id!==p.evId;}); if(S.ok)delete S.ok[p.evId]; S.pas=pas(S).filter(function(x){return x.id!==p.id;}); }
function html(S,G){
  var L=pas(S); if(!L.length)return '';
  var cot=(S.orc&&S.orc.cot)||0, ativos=L.filter(function(p){return p.estado!=='cancelado';}), tC=0,tA=0;
  ativos.forEach(function(p){var x=p.v*p.pax; if(p.estado==='comprado')tC+=x; else tA+=x;});
  function m(x){return G.yen(x)+(cot?' <small>≈ '+brl(x*cot)+'</small>':'');}
  var nA=ativos.filter(function(p){return p.estado==='comprar';}).length;
  var h='<details class="pasp"'+(nA?' open':'')+'><summary>🎫 Passagens · '+L.length+(L.length===1?' trecho':' trechos')+(nA?' · '+nA+' a comprar':' · tudo comprado')+'</summary>'+
    '<div class="tots"><div><small>Comprado</small><b>'+m(tC)+'</b></div><div><small>A comprar</small><b>'+m(tA)+'</b></div><div><small>Total</small><b>'+m(tC+tA)+'</b></div></div>';
  L.slice().sort(function(a,b){return (a.data+a.hora)<(b.data+b.hora)?-1:1;}).forEach(function(p){
    var aviso='';
    if(p.rapido&&p.estado==='comprar'&&window.CalAvisos&&p.data){var av=CalAvisos.para({data:p.data,tipo:'transp',titulo:'trem-bala'}); if(av){var st=CalAvisos.situacao(av); aviso='<div class="aviso">⏰ '+(st.est==='aberto'?'Já abriu: compre agora. ':st.est==='hoje'?'Abre hoje. ':'Faltam '+st.dias+' dias. ')+esc(av.texto)+'</div>';}}
    var links=(p.rapido&&p.estado!=='cancelado')?'<div class="onde">Onde comprar: '+COMPRA.map(function(c){return '<a href="'+esc(c[1])+'" target="_blank" rel="noopener" title="'+esc(c[2])+'">'+c[0]+'</a>';}).join(' · ')+'<small>SmartEX: '+esc(COMPRA[0][2])+'. JR-East: '+esc(COMPRA[1][2])+'. JR-West: '+esc(COMPRA[2][2])+'.</small></div>':'';
    h+='<div class="pas '+p.estado+'" data-pid="'+esc(p.id)+'"><div class="ph"><b>'+esc(p.de)+' → '+esc(p.para)+'</b><span class="md2">'+G.MODOS[p.modo]+'</span></div>'+
      '<div class="pl">'+esc(fd(p.data))+(p.hora?' às '+esc(p.hora):'')+' · '+G.yen(p.v)+' × '+p.pax+' = <b>'+G.yen(p.v*p.pax)+'</b>'+(cot?' · ≈ '+brl(p.v*p.pax*cot):'')+'</div>'+
      '<div class="pr"><label>Estado<select data-pe>'+Object.keys(ROTULO).map(function(k){return '<option value="'+k+'"'+(k===p.estado?' selected':'')+'>'+ROTULO[k]+'</option>';}).join('')+'</select></label>'+
      '<label>Código da reserva<input data-pc value="'+esc(p.codigo)+'" maxlength="60" placeholder="quando comprar"></label><button type="button" class="btn sm" data-px>Remover</button></div>'+aviso+links+'</div>';
  });
  return h+'</details>';
}
/* mudou(): função da página que grava e redesenha */
function ligar(root,getS,G,mudou){ /* getS: função que devolve o estado atual (a página troca o objeto ao abrir cópia ou sincronizar) */
  function S(){return getS();}
  root.addEventListener('change',function(ev){
    var c=ev.target.closest('.pas'); if(!c)return; var p=pas(S()).filter(function(x){return x.id===c.dataset.pid;})[0]; if(!p)return;
    if(ev.target.hasAttribute('data-pe'))p.estado=ev.target.value; else if(ev.target.hasAttribute('data-pc'))p.codigo=ev.target.value.trim().slice(0,60); else return;
    sync(S(),G,p); mudou(); });
  root.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-px]'); if(!b)return; var c=b.closest('.pas'), p=pas(S()).filter(function(x){return x.id===c.dataset.pid;})[0]; if(!p)return;
    if(!confirm('Remover esta passagem da lista e do calendário?'))return;
    remover(S(),p); mudou(); });
}
window.CalPas={ROTULO:ROTULO,COMPRA:COMPRA,nova:nova,sync:sync,jaSalvo:jaSalvo,html:html,ligar:ligar};
})();
