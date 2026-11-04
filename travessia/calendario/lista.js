/* Lista "Quero fazer": lugares e rolês que a pessoa quer encaixar na viagem.
   Cada item tem nome e endereço (achado pelo mapa a partir do nome, ou do endereço/link que ela colar).
   Depois dá para puxar o item pelo formulário do evento. Fica em S.lista (salvo junto com o calendário). */
(function(){
'use strict';
var G=window.CalGeo;
/* categoria → [ícone, nome, tipo do evento no calendário] */
var CATS={passeio:['⛩️','Passeio','passeio'],cultura:['🏛️','Cultura (templos, museus)','passeio'],parque:['🎡','Parque e diversão','passeio'],nerd:['🎮','Nerd (jogos, anime, colecionáveis)','passeio'],natureza:['🌸','Natureza e mirantes','passeio'],experiencia:['🎟️','Experiência (aula, show, evento)','ingresso'],onsen:['🛁','Onsen e relax','outro'],restaurante:['🍜','Restaurante','comida'],cafe:['☕','Café e doces','comida'],bar:['🍶','Bar e noite','comida'],beco:['🏮','Beco para jantar (yokocho)','comida'],compras:['🛍️','Compras','outro']};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

/* limpa o que vem do disco, da nuvem ou de um arquivo */
function limpa(a){
  var r=[]; (Array.isArray(a)?a:[]).slice(0,300).forEach(function(x){
    if(!x||typeof x!=='object'||typeof x.nome!=='string'||!x.nome.trim())return;
    r.push({id:typeof x.id==='string'&&x.id?x.id.slice(0,40):uid(),nome:x.nome.trim().slice(0,80),
      cat:CATS[x.cat]?x.cat:'passeio',evId:typeof x.evId==='string'?x.evId.slice(0,40):'',nota:typeof x.nota==='string'?x.nota.trim().slice(0,600):'',local:typeof x.local==='string'?x.local.slice(0,600):'',achado:typeof x.achado==='string'?x.achado.slice(0,200):'',
      achouPeloNome:!!x.achouPeloNome,comprar:(x.comprar==='sim'||x.comprar==='ok')?x.comprar:''});
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
  return '<li class="lq-i"><b>'+CATS[x.cat][0]+' '+esc(x.nome)+'</b>'+(x.achado?'<small class="nota">'+esc(x.achado)+'</small>':'')+aviso+(x.nota?'<small class="nota" style="white-space:pre-wrap">📝 '+esc(x.nota)+'</small>':'')+
    (x.comprar==='sim'?'<small class="nota" style="color:#8a3b00">🛒 Comprar antes · <button type="button" class="btn sm" data-lq="comprei" data-id="'+esc(x.id)+'">✓ Já comprei</button></small>':x.comprar==='ok'?'<small class="nota">🛒 ✓ Comprado</small>':'')+
    '<div class="barra">'+(ev?'<small class="nota">✓ Já está no calendário em '+dm(ev.data)+'.</small>':'<button type="button" class="btn sm pri" data-lq="usar" data-id="'+esc(x.id)+'">📅 Pôr no calendário</button>')+
    '<button type="button" class="btn sm" data-lq="edit" data-id="'+esc(x.id)+'">✏️ Editar</button><button type="button" class="btn sm" data-lq="del" data-id="'+esc(x.id)+'">Excluir</button></div></li>';
}
/* cidade pelo ponto no mapa: a cidade conhecida mais perto, até 40 km (sem consultar internet) */
var CIDADES=[['Tóquio',35.6762,139.6503],['Yokohama',35.4437,139.6380],['Kamakura',35.3192,139.5467],['Hakone',35.2326,139.1070],['Nikko',36.7500,139.5985],['Quioto',35.0116,135.7681],['Osaka',34.6937,135.5023],['Nara',34.6851,135.8048],['Kobe',34.6901,135.1955],['Himeji',34.8151,134.6853],['Nagoya',35.1815,136.9066],['Kanazawa',36.5613,136.6562],['Hiroshima',34.3853,132.4553],['Fukuoka',33.5902,130.4017],['Sapporo',43.0618,141.3545]];
var SEMLOC='Sem localização';
function cidadeDe(x){
  var c=x.local&&G?G.coordDe(x.local):null; if(!c)return SEMLOC;
  var best=null; CIDADES.forEach(function(k){var d=G.km(c,{lat:k[1],lon:k[2]}); if(!best||d<best.d)best={d:d,n:k[0]};});
  return best&&best.d<=40?best.n:'Outros lugares';
}
function html(lista,evs){
  var porCid={}; lista.forEach(function(x){var c=cidadeDe(x); (porCid[c]=porCid[c]||[]).push(x);});
  var cids=Object.keys(porCid).sort(function(a,b){
    var pa=a===SEMLOC?2:a==='Outros lugares'?1:0, pb=b===SEMLOC?2:b==='Outros lugares'?1:0;
    return pa!==pb?pa-pb:porCid[b].length-porCid[a].length;});
  var grupos=cids.map(function(c){
    var LC=porCid[c];
    return '<h3 class="lq-c">📍 '+esc(c)+' ('+LC.length+')</h3>'+Object.keys(CATS).map(function(k){
      var L=LC.filter(function(x){return x.cat===k;}); if(!L.length)return '';
      return '<h4 class="lq-h">'+CATS[k][0]+' '+CATS[k][1]+' ('+L.length+')</h4><ul class="lq">'+L.map(function(x){return itemHtml(x,evs);}).join('')+'</ul>';}).join('');}).join('');
  var cats=Object.keys(CATS).map(function(k){return '<option value="'+k+'">'+CATS[k][0]+' '+CATS[k][1]+'</option>';}).join('');
  return '<div class="dlg-top"><h2 id="dlgT" style="text-transform:none">⭐ Quero fazer</h2><button class="btn sm" type="button" data-act="fechar" aria-label="Fechar">✕</button></div>'+
    '<p class="nota">Anote os lugares e rolês que você quer encaixar na viagem. Eu procuro o endereço pelo nome, você confere, e depois é só puxar para um evento.</p>'+
    '<form id="lqF" novalidate class="wrap" style="gap:10px">'+
    '<label class="f">Categoria<select name="cat">'+cats+'</select></label>'+
    '<label class="f">Nome do lugar ou do rolê<input name="nome" maxlength="80" placeholder="ex.: teamLab Planets, Tóquio" autocomplete="off"><small>Escreva com a cidade: acho melhor.</small></label>'+
    '<label class="f">Endereço ou link do Google Maps (opcional)<input name="end" maxlength="600" placeholder="se colar o link do Maps, o ponto fica exato" autocomplete="off"></label>'+
    '<label class="f">Anotações (opcional)<textarea name="nota" maxlength="600" rows="3" placeholder="horário, preço, reserva, o que pedir, quem vai…"></textarea></label>'+
    '<label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" name="comprar" style="width:auto"> 🛒 Preciso comprar antes (ingresso, reserva): avisar em “Compre com antecedência”</label>'+
    '<p class="nota" id="lqEd" hidden></p><p class="erro" id="lqErr" role="alert"></p><div id="lqRes" class="nota" role="status"></div>'+
    '<div class="barra"><button class="btn pri" type="submit" id="lqSub">➕ Add</button><button class="btn" type="button" id="lqCan" hidden>Cancelar edição</button></div></form>'+
    '<h3 style="margin:6px 0 0">Minha lista ('+lista.length+')</h3>'+
    (lista.length?'<div class="lqg">'+grupos+'</div>':'<p class="nota">Ainda não tem nada na lista.</p>');
}

/* bloco da visão em lista: o que ainda está sem dia, com cor própria */
function semDia(lista,evs){
  var L=(lista||[]).filter(function(x){return !noCal(x,evs);}); if(!L.length)return '';
  return '<section class="grp qf"><h3>⭐ Quero fazer · sem dia ('+L.length+')</h3>'+L.map(function(x){
    return '<div class="qf-i"><div><b>'+CATS[x.cat][0]+' '+esc(x.nome)+'</b>'+(x.achado?'<small class="nota">'+esc(x.achado.split(',').slice(0,3).join(','))+'</small>':'')+
      (x.local?(x.achouPeloNome?'<small class="nota" style="color:#8a5a00">⚠ endereço achado pelo nome</small>':''):'<small class="nota" style="color:#8a5a00">⚠ sem endereço</small>')+(x.nota?'<small class="nota" style="white-space:pre-wrap">📝 '+esc(x.nota.length>140?x.nota.slice(0,139)+'…':x.nota)+'</small>':'')+'</div>'+
      '<button type="button" class="btn sm pri" data-act="qusar" data-id="'+esc(x.id)+'">📅 Escolher o dia</button></div>';}).join('')+
    '<div class="barra"><button type="button" class="btn sm" data-act="qlista">⭐ Abrir minha lista</button></div></section>';
}

/* ---- sugestões: itens da lista que ficam perto do roteiro de um dia ---- */
var RAIO=2.5; /* km em linha reta: dá uns 40 min a pé */
function caminhando(km){return Math.max(1,Math.round(km*1.3/4.8*60));}
function coordsDe(e){var c=G&&G.coordDe(e.local); if(c)return Promise.resolve(c); return G?G.geocodificar(e.local).catch(function(){return null;}):Promise.resolve(null);}
/* âncoras do dia: os eventos "de rolê"; se não houver, a hospedagem */
function ancoras(evsDia){
  var L=(evsDia||[]).filter(function(e){return e.local&&e.tipo!=='hosp'&&e.tipo!=='transp'&&e.tipo!=='voo';});
  if(!L.length)L=(evsDia||[]).filter(function(e){return e.local&&e.tipo==='hosp';});
  return L;
}
function perto(S,evsDia){
  var itens=(S.lista||[]).filter(function(x){return !noCal(x,S.ev)&&x.local&&G&&G.coordDe(x.local);}), A=ancoras(evsDia);
  if(!itens.length||!A.length)return Promise.resolve([]);
  return Promise.all(A.map(function(e){return coordsDe(e).then(function(c){return c?{e:e,c:c}:null;});})).then(function(P){
    P=P.filter(Boolean); var r=[];
    itens.forEach(function(x){var cx=G.coordDe(x.local), best=null;
      P.forEach(function(a){var k=G.km(cx,a.c); if(!best||k<best.km)best={km:k,de:a.e.titulo};});
      if(best&&best.km<=RAIO)r.push({x:x,km:best.km,de:best.de,min:caminhando(best.km)});});
    r.sort(function(a,b){return a.km-b.km;}); return r;});
}
function preencherPerto(box,S,d,evsDia,usar){
  if(!box)return; var filtro='';
  perto(S,evsDia).then(function(R){
    if(!box.isConnected)return;
    if(!R.length){box.innerHTML='';return;}
    function desenha(){
      var cats=Object.keys(CATS).filter(function(k){return R.some(function(r){return r.x.cat===k;});});
      var V=R.filter(function(r){return !filtro||r.x.cat===filtro;});
      box.innerHTML='<div class="qf qp"><h3>⭐ Da sua lista, perto do roteiro de hoje</h3>'+
        (cats.length>1?'<div class="barra" role="group" aria-label="Filtrar por categoria"><button type="button" class="btn sm" data-qf="" aria-pressed="'+(!filtro)+'">Todos ('+R.length+')</button>'+cats.map(function(k){return '<button type="button" class="btn sm" data-qf="'+k+'" aria-pressed="'+(filtro===k)+'">'+CATS[k][0]+' '+CATS[k][1].split(' (')[0]+'</button>';}).join('')+'</div>':'')+
        V.map(function(r){return '<div class="qf-i"><div><b>'+CATS[r.x.cat][0]+' '+esc(r.x.nome)+'</b><small class="nota">'+(r.min<=40?'~'+G.fmtMin(r.min)+' a pé':'~'+G.fmtKm(r.km))+' de “'+esc(r.de)+'” (estimado)</small>'+
          (r.x.achouPeloNome?'<small class="nota" style="color:#8a5a00">⚠ endereço achado pelo nome</small>':'')+(r.x.nota?'<small class="nota" style="white-space:pre-wrap">📝 '+esc(r.x.nota.length>100?r.x.nota.slice(0,99)+'…':r.x.nota)+'</small>':'')+'</div>'+
          '<button type="button" class="btn sm pri" data-qp="'+esc(r.x.id)+'">📅 Pôr neste dia</button></div>';}).join('')+'</div>';
    }
    desenha();
    box.onclick=function(ev){
      var f=ev.target.closest('[data-qf]'); if(f){filtro=f.dataset.qf; desenha(); return;}
      var b=ev.target.closest('[data-qp]'); if(!b)return; var it=R.find(function(r){return r.x.id===b.dataset.qp;}); if(it)usar(it.x,d);
    };
  });
}
/* na visão em lista: um botão por dia que tem sugestões */
function marcarPerto(root,S,doDia,abrirDia){
  root.querySelectorAll('.qpd').forEach(function(el){
    var d=el.dataset.d; perto(S,doDia(d)).then(function(R){
      if(!el.isConnected||!R.length)return;
      el.innerHTML='<button type="button" class="btn sm" data-qdia="'+d+'">⭐ '+R.length+' da sua lista '+(R.length===1?'fica':'ficam')+' perto deste dia</button>';
      el.firstChild.onclick=function(){abrirDia(d);};
    });
  });
}

/* ---- rolê antes do beco: hora do pôr do sol e itens da lista a pé do beco ---- */
function porDoSol(lat,lon,data,zenite){
  var d0=new Date(data+'T00:00:00Z'); if(isNaN(d0))return null;
  var n=Math.floor((d0-Date.UTC(d0.getUTCFullYear(),0,0))/864e5), g=2*Math.PI/365*(n-1+0.5), R=Math.PI/180;
  var eqt=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  var dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  var cosH=Math.cos(zenite*R)/(Math.cos(lat*R)*Math.cos(dec))-Math.tan(lat*R)*Math.tan(dec); if(cosH<-1||cosH>1)return null;
  var min=720-4*(lon-Math.acos(cosH)/R)-eqt; return new Date(d0.getTime()+min*60000);
}
function horaLocal(dt,lon){
  try{return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:(lon>122&&lon<146)?'Asia/Tokyo':undefined}).format(dt);}catch(e){return '';}
}
var ROLE=['passeio','cultura','parque','nerd','natureza','experiencia','onsen','compras'], RAIO_PRE=2; /* km */
function preBeco(S,evsDia,d){
  var becos=(evsDia||[]).filter(function(e){return e.local&&(S.lista||[]).some(function(x){return x.cat==='beco'&&x.evId===e.id;});});
  if(!becos.length||!G)return Promise.resolve([]);
  var itens=(S.lista||[]).filter(function(x){return ROLE.indexOf(x.cat)>=0&&!noCal(x,S.ev)&&x.local&&G.coordDe(x.local);});
  return Promise.all(becos.map(function(e){return coordsDe(e).then(function(c){if(!c)return null;
    var sol=porDoSol(c.lat,c.lon,d,90.833), fim=porDoSol(c.lat,c.lon,d,96);
    var L=itens.map(function(x){var k=G.km(G.coordDe(x.local),c);return {x:x,km:k,min:caminhando(k)};}).filter(function(r){return r.km<=RAIO_PRE;}).sort(function(a,b){return a.km-b.km;});
    return {e:e,sol:sol&&horaLocal(sol,c.lon),fim:fim&&horaLocal(fim,c.lon),itens:L};});})).then(function(P){return P.filter(Boolean);});
}
function preencherPre(box,S,d,evsDia,usar){
  if(!box)return;
  preBeco(S,evsDia,d).then(function(P){
    if(!box.isConnected||!P.length){return;}
    box.innerHTML=P.map(function(p){
      return '<div class="qf qp"><h3>🌆 Antes do beco “'+esc(p.e.titulo)+'”</h3>'+
        (p.sol?'<small class="nota">Pôr do sol ~'+p.sol+(p.fim?' · luz do crepúsculo até ~'+p.fim:'')+' (cálculo aproximado, sem clima).'+(p.e.hora?' Jantar marcado às '+esc(p.e.hora)+'.':'')+'</small>':'')+
        (p.itens.length?p.itens.map(function(r){return '<div class="qf-i"><div><b>'+CATS[r.x.cat][0]+' '+esc(r.x.nome)+'</b><small class="nota">~'+G.fmtMin(r.min)+' a pé do beco (estimado)</small>'+(r.x.achouPeloNome?'<small class="nota" style="color:#8a5a00">⚠ endereço achado pelo nome</small>':'')+'</div>'+
          '<button type="button" class="btn sm pri" data-qp="'+esc(r.x.id)+'">📅 Pôr neste dia</button></div>';}).join(''):'<small class="nota">Nada da sua lista a menos de 2 km. Adicione rolês perto em ⭐ Quero fazer.</small>')+'</div>';}).join('');
    box.onclick=function(ev){var b=ev.target.closest('[data-qp]'); if(!b)return; var it=null; P.forEach(function(p){p.itens.forEach(function(r){if(r.x.id===b.dataset.qp)it=r;});}); if(it)usar(it.x,d);};
  });
}

/* ligar(raiz, getS, gravar, compacta, usar, redesenhar): eventos do painel */
function ligar(root,getS,gravar,compacta,usar,redesenhar){
  var f=root.querySelector('#lqF'); if(!f)return;
  var seq=0, editId='';
  function cv(prev){return f.comprar&&f.comprar.checked?(prev==='ok'?'ok':'sim'):'';}
  root.querySelector('#lqCan').onclick=function(){editId='';redesenhar();};
  function salva(nome,local,achado,pelo){ var cat=CATS[f.cat.value]?f.cat.value:'passeio';
    var S=getS(); if(!Array.isArray(S.lista))S.lista=[];
    var ex=editId?S.lista.find(function(z){return z.id===editId;}):null;
    var nt=f.nota.value.trim().slice(0,600), cp=cv(ex&&ex.comprar);
    if(ex){ex.nome=nome;ex.cat=cat;ex.local=local;ex.achado=achado;ex.achouPeloNome=!!pelo;ex.nota=nt;ex.comprar=cp;}
    else S.lista.push({id:uid(),nome:nome,cat:cat,nota:nt,local:local,achado:achado,achouPeloNome:!!pelo,comprar:cp});
    editId=''; gravar(); redesenhar();
  }
  f.onsubmit=function(ev){
    ev.preventDefault();
    var nome=f.nome.value.trim(), end=f.end.value.trim(), er=root.querySelector('#lqErr'), res=root.querySelector('#lqRes'); er.textContent=''; res.innerHTML='';
    if(!nome){er.textContent='Escreva o nome do lugar ou do rolê.';return;}
    var meu=++seq;
    var ant=editId?(getS().lista||[]).find(function(z){return z.id===editId;}):null, cat0=CATS[f.cat.value]?f.cat.value:'passeio';
    if(ant&&(!end||end===ant.local)&&ant.local&&G&&G.coordDe(ant.local)){ /* só mudou nome ou categoria: mantém o ponto */
      var c0=G.coordDe(ant.local); ant.nome=nome; ant.cat=cat0; ant.nota=f.nota.value.trim().slice(0,600); ant.comprar=cv(ant.comprar); ant.local=localDe(nome,c0); editId=''; gravar(); redesenhar(); return; }
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
    if(b.dataset.lq==='comprei'){x.comprar='ok';gravar();redesenhar();return;}
    if(b.dataset.lq==='edit'){
      editId=x.id; f.cat.value=x.cat; f.nome.value=x.nome; f.end.value=x.local||''; f.nota.value=x.nota||''; if(f.comprar)f.comprar.checked=!!x.comprar;
      var ed=root.querySelector('#lqEd'); ed.hidden=false;
      ed.textContent='✏️ Editando “'+x.nome+'”. '+(x.local?'O ponto no mapa continua o mesmo'+(x.achado?' ('+x.achado.split(',').slice(0,3).join(',')+')':'')+'. Para trocar, apague o campo de endereço e escreva o novo endereço ou cole o link do Google Maps.':'Este item está sem endereço: escreva o endereço, cole o link do Maps, ou deixe vazio para procurar pelo nome.');
      root.querySelector('#lqSub').textContent=x.local?'💾 Salvar alterações':'💾 Salvar'; root.querySelector('#lqCan').hidden=false;
      root.querySelector('#lqRes').textContent=''; f.nome.focus(); try{f.scrollIntoView({block:'center'});}catch(e){} return; }
    if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Confirmar exclusão?';setTimeout(function(){if(b.isConnected){b.dataset.sure='';b.textContent='Excluir';}},4000);return;}
    S.lista=S.lista.filter(function(z){return z.id!==id;}); gravar(); redesenhar();
  });
}

/* opções do seletor "Puxar da minha lista" no formulário do evento */
function opcoes(lista){return Object.keys(CATS).map(function(k){
  var L=lista.filter(function(x){return x.cat===k;}); if(!L.length)return '';
  return '<optgroup label="'+CATS[k][0]+' '+CATS[k][1]+'">'+L.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.nome)+(x.local?'':' (sem endereço)')+'</option>';}).join('')+'</optgroup>';}).join('');}

function paraComprar(S,evs){
  var pend=[],ok=[]; (S.lista||[]).forEach(function(x){ if(x.comprar==='sim'||x.comprar==='ok'){ var e=noCal(x,evs||S.ev); (x.comprar==='sim'?pend:ok).push({x:x,data:e?e.data:''}); }});
  pend.sort(function(a,b){return (a.data||'9999')<(b.data||'9999')?-1:1;}); return {pend:pend,ok:ok};
}
window.CalLista={paraComprar:paraComprar,preencherPre:preencherPre,porDoSol:porDoSol,cidadeDe:cidadeDe,preencherPerto:preencherPerto,marcarPerto:marcarPerto,semDia:semDia,CATS:CATS,limpa:limpa,html:html,ligar:ligar,opcoes:opcoes};
})();
