/* Lista "Quero fazer": lugares e rolês que a pessoa quer encaixar na viagem.
   Cada item tem nome e endereço (achado pelo mapa a partir do nome, ou do endereço/link que ela colar).
   Depois dá para puxar o item pelo formulário do evento. Fica em S.lista (salvo junto com o calendário). */
(function(){
'use strict';
var G=window.CalGeo;
/* categoria → [ícone, nome, tipo do evento no calendário] */
var CATS={passeio:['⛩️','Passeio','passeio'],cultura:['🏛️','Cultura (templos, museus)','passeio'],parque:['🎡','Parque e diversão','passeio'],natureza:['🌸','Natureza e mirantes','passeio'],experiencia:['🎟️','Experiência (aula, show, evento)','ingresso'],onsen:['🛁','Onsen e relax','outro'],restaurante:['🍜','Restaurante','comida'],cafe:['☕','Café e doces','comida'],bar:['🍶','Bar e noite','comida'],compras:['🛍️','Compras','outro']};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

/* limpa o que vem do disco, da nuvem ou de um arquivo */
function limpa(a){
  var r=[]; (Array.isArray(a)?a:[]).slice(0,300).forEach(function(x){
    if(!x||typeof x!=='object'||typeof x.nome!=='string'||!x.nome.trim())return;
    r.push({id:typeof x.id==='string'&&x.id?x.id.slice(0,40):uid(),nome:x.nome.trim().slice(0,80),
      cat:CATS[x.cat]?x.cat:'passeio',evId:typeof x.evId==='string'?x.evId.slice(0,40):'',local:typeof x.local==='string'?x.local.slice(0,600):'',achado:typeof x.achado==='string'?x.achado.slice(0,200):'',
      achouPeloNome:!!x.achouPeloNome});
  });
  return r;
}

/* só o texto "Nome @lat,lon" que o resto do calendário já entende */
function localDe(nome,p){return nome.slice(0,80)+' @'+(+p.lat).toFixed(6)+','+(+p.lon).toFixed(6);}

function noCal(x,evs){return x.evId?(evs||[]).find(function(e){return e.id===x.evId;})||null:null;}
function dm(d){return d.slice(8)+'/'+d.slice(5,7);}
function itemHtml(x,evs){
  var ev=noCal(x,evs);
  var aviso=x.local?(x.achouPeloNome?'<small class="nota" style="color:#8a5a00">⚠ Endereço achado pelo nome: confira se é o lugar certo.</small>':'<small class="nota">✓ Localização do link ou do endereço que você colou.</small>'):'<small class="nota" style="color:#8a5a00">⚠ Sem endereço: não calculo deslocamento para este lugar.</small>';
  return '<li class="lq-i"><b>'+CATS[x.cat][0]+' '+esc(x.nome)+'</b>'+(x.achado?'<small class="nota">'+esc(x.achado)+'</small>':'')+aviso+
    '<div class="barra">'+(ev?'<small class="nota">✓ Já está no calendário em '+dm(ev.data)+'.</small>':'<button type="button" class="btn sm pri" data-lq="usar" data-id="'+esc(x.id)+'">📅 Pôr no calendário</button>')+
    '<button type="button" class="btn sm" data-lq="del" data-id="'+esc(x.id)+'">Excluir</button></div></li>';
}
function html(lista,evs){
  var grupos=Object.keys(CATS).map(function(k){
    var L=lista.filter(function(x){return x.cat===k;}); if(!L.length)return '';
    return '<h4 class="lq-h">'+CATS[k][0]+' '+CATS[k][1]+' ('+L.length+')</h4><ul class="lq">'+L.map(function(x){return itemHtml(x,evs);}).join('')+'</ul>';}).join('');
  var cats=Object.keys(CATS).map(function(k){return '<option value="'+k+'">'+CATS[k][0]+' '+CATS[k][1]+'</option>';}).join('');
  return '<div class="dlg-top"><h2 id="dlgT" style="text-transform:none">⭐ Quero fazer</h2><button class="btn sm" type="button" data-act="fechar" aria-label="Fechar">✕</button></div>'+
    '<p class="nota">Anote os lugares e rolês que você quer encaixar na viagem. Eu procuro o endereço pelo nome, você confere, e depois é só puxar para um evento.</p>'+
    '<form id="lqF" novalidate class="wrap" style="gap:10px">'+
    '<label class="f">Categoria<select name="cat">'+cats+'</select></label>'+
    '<label class="f">Nome do lugar ou do rolê<input name="nome" maxlength="80" placeholder="ex.: teamLab Planets, Tóquio" autocomplete="off"><small>Escreva com a cidade: acho melhor.</small></label>'+
    '<label class="f">Endereço ou link do Google Maps (opcional)<input name="end" maxlength="600" placeholder="se colar o link do Maps, o ponto fica exato" autocomplete="off"></label>'+
    '<p class="erro" id="lqErr" role="alert"></p><div id="lqRes" class="nota" role="status"></div>'+
    '<div class="barra"><button class="btn pri" type="submit">🔎 Procurar o endereço</button></div></form>'+
    '<h3 style="margin:6px 0 0">Minha lista ('+lista.length+')</h3>'+
    (lista.length?'<div class="lqg">'+grupos+'</div>':'<p class="nota">Ainda não tem nada na lista.</p>');
}

/* bloco da visão em lista: o que ainda está sem dia, com cor própria */
function semDia(lista,evs){
  var L=(lista||[]).filter(function(x){return !noCal(x,evs);}); if(!L.length)return '';
  return '<section class="grp qf"><h3>⭐ Quero fazer · sem dia ('+L.length+')</h3>'+L.map(function(x){
    return '<div class="qf-i"><div><b>'+CATS[x.cat][0]+' '+esc(x.nome)+'</b>'+(x.achado?'<small class="nota">'+esc(x.achado.split(',').slice(0,3).join(','))+'</small>':'')+
      (x.local?(x.achouPeloNome?'<small class="nota" style="color:#8a5a00">⚠ endereço achado pelo nome</small>':''):'<small class="nota" style="color:#8a5a00">⚠ sem endereço</small>')+'</div>'+
      '<button type="button" class="btn sm pri" data-act="qusar" data-id="'+esc(x.id)+'">📅 Escolher o dia</button></div>';}).join('')+
    '<div class="barra"><button type="button" class="btn sm" data-act="qlista">⭐ Abrir minha lista</button></div></section>';
}

/* ligar(raiz, getS, gravar, compacta, usar, redesenhar): eventos do painel */
function ligar(root,getS,gravar,compacta,usar,redesenhar){
  var f=root.querySelector('#lqF'); if(!f)return;
  var seq=0;
  function salva(nome,local,achado,pelo){ var cat=CATS[f.cat.value]?f.cat.value:'passeio';
    var S=getS(); if(!Array.isArray(S.lista))S.lista=[];
    S.lista.push({id:uid(),nome:nome,cat:cat,local:local,achado:achado,achouPeloNome:!!pelo});
    gravar(); redesenhar();
  }
  f.onsubmit=function(ev){
    ev.preventDefault();
    var nome=f.nome.value.trim(), end=f.end.value.trim(), er=root.querySelector('#lqErr'), res=root.querySelector('#lqRes'); er.textContent=''; res.innerHTML='';
    if(!nome){er.textContent='Escreva o nome do lugar ou do rolê.';return;}
    var meu=++seq;
    if(end&&G&&G.coordDe(end)){ /* link ou coordenadas coladas: já é exato */
      var c=G.coordDe(end), loc=compacta(end); if(!/@/.test(loc))loc=localDe(nome,c);
      salva(nome,loc,'',false); return; }
    if(end&&G&&G.soLinkCurto(end)){er.textContent='Esse link curto do Google Maps não dá para ler aqui. Abra o lugar no Maps e copie o link da barra de endereços (tem @latitude,longitude), ou escreva o endereço.';return;}
    var q=end||nome; res.textContent='Procurando no mapa…';
    (G?G.geocodificar(q):Promise.resolve(null)).then(function(r){
      if(meu!==seq)return;
      if(!r){res.innerHTML='Não achei “'+esc(q)+'” no mapa. Tente com a cidade, ou cole o link do Google Maps. <button type="button" class="btn sm" id="lqSem">Salvar mesmo assim, sem endereço</button>';
        res.querySelector('#lqSem').onclick=function(){salva(nome,'','',false);}; return; }
      res.innerHTML='Achei: <b>'+esc(r.nome)+'</b>.<br>É esse lugar mesmo? '+
        '<span class="barra" style="margin-top:6px"><button type="button" class="btn sm pri" id="lqOk">✓ É esse, salvar na lista</button><button type="button" class="btn sm" id="lqNao">Não é, vou corrigir</button></span>';
      res.querySelector('#lqOk').onclick=function(){salva(nome,localDe(nome,r),r.nome,true);};
      res.querySelector('#lqNao').onclick=function(){res.textContent='Tente de novo com a cidade, ou cole o link do Google Maps no campo de endereço.'; f.end.focus();};
    }).catch(function(){ if(meu===seq)res.textContent='Sem internet para procurar no mapa. Tente de novo.'; });
  };
  root.querySelector('.lqg')&&(root.querySelector('.lqg').onclick=function(ev){
    var b=ev.target.closest('[data-lq]'); if(!b)return; var S=getS(), id=b.dataset.id, x=(S.lista||[]).find(function(z){return z.id===id;}); if(!x)return;
    if(b.dataset.lq==='usar'){usar(x);return;}
    if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Confirmar exclusão?';setTimeout(function(){if(b.isConnected){b.dataset.sure='';b.textContent='Excluir';}},4000);return;}
    S.lista=S.lista.filter(function(z){return z.id!==id;}); gravar(); redesenhar();
  });
}

/* opções do seletor "Puxar da minha lista" no formulário do evento */
function opcoes(lista){return Object.keys(CATS).map(function(k){
  var L=lista.filter(function(x){return x.cat===k;}); if(!L.length)return '';
  return '<optgroup label="'+CATS[k][0]+' '+CATS[k][1]+'">'+L.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.nome)+(x.local?'':' (sem endereço)')+'</option>';}).join('')+'</optgroup>';}).join('');}

window.CalLista={semDia:semDia,CATS:CATS,limpa:limpa,html:html,ligar:ligar,opcoes:opcoes};
})();
