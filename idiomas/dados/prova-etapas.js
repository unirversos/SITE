/* Prova em etapas (mapa a mapa): ouvir e reagir → montar a frase → ler o mundo real → situação surpresa → chamada → resultado.
   Os roteiros ficam em /idiomas/dados/prova-etapas-dados.js (window.PROVAS[terr]). Só entra vocabulário que a aula do mapa ensina.
   Uso: UniProva.start(terr,{say, sayGravado, nome, chamada(onFim,onErro), onMistake, onDone, onExit}) → true se há prova em etapas para o mapa. */
(function(){
  var CSS='#up{position:fixed;inset:0;z-index:290;background:#fdf6f2;color:#3a2b38;overflow-y:auto;font-family:inherit}#up[hidden]{display:none}'+
  '.up-in{width:100%;max-width:640px;margin:0 auto;padding:14px 16px 40px;display:grid;gap:12px}'+
  '.up-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.up-top b{font-size:15px}'+
  '.up-x{background:#fff;border:1.5px solid #e6d3d3;border-radius:20px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer;color:#3a2b38}'+
  '.up-pills{display:flex;gap:6px;flex-wrap:wrap}.up-pills span{font-size:12px;border:1.5px solid #e6d3d3;border-radius:20px;padding:4px 10px;background:#fff;color:#7c6a78}'+
  '.up-pills span.now{background:#c8415f;border-color:#c8415f;color:#fff;font-weight:700}.up-pills span.ok{background:#e8efe8;border-color:#bcd2bf;color:#3f6a4a}'+
  '.up-card{background:#fff;border:1.5px solid #ead9d9;border-radius:18px;padding:16px;display:grid;gap:12px}'+
  '.up-h{font-size:19px;font-weight:800;margin:0}.up-sub{font-size:14px;color:#7c6a78;margin:0}.up-q{font-size:16px;font-weight:700;margin:0}'+
  '.up-cnt{font-size:12.5px;color:#7c6a78;text-align:right}'+
  '.up-play{justify-self:start;background:#fff;border:2px solid #c8415f;color:#c8415f;border-radius:40px;padding:12px 20px;font:inherit;font-size:16px;font-weight:700;cursor:pointer}'+
  '.up-show{justify-self:start;background:none;border:0;color:#7c6a78;font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;padding:0}'+
  '.up-line{background:#fdf0f3;border-radius:12px;padding:10px 14px;display:grid;gap:2px}.up-line .k{font-size:20px;line-height:1.5}.up-line .t{font-size:13px;color:#7c6a78}'+
  '.ro{display:none;font-size:12.5px;color:#7c6a78}body.ro-on #up .ro{display:block}'+
  '.up-opts{display:grid;gap:8px}.up-opts button{font:inherit;font-size:16px;text-align:left;background:#fff;border:1.5px solid #dcc9c9;border-radius:14px;padding:12px 14px;cursor:pointer;color:#3a2b38;min-height:48px}'+
  '.up-opts button .ro{margin-top:2px}.up-opts button:disabled{cursor:default}.up-opts button.bad{background:#fdecee;border-color:#e9b9c0;color:#9a3a4c}.up-opts button.good{background:#e8efe8;border-color:#9dc3a5;font-weight:700}'+
  '.up-why{background:#e8efe8;border-radius:12px;padding:10px 14px;font-size:14px;line-height:1.5}'+
  '.up-next{justify-self:end;background:#c8415f;color:#fff;border:0;border-radius:40px;padding:12px 24px;font:inherit;font-size:15px;font-weight:700;cursor:pointer}'+
  '.up-slots{display:flex;flex-wrap:wrap;gap:6px;min-height:52px;padding:8px;border-radius:12px;background:#fdf0f3;border:1.5px dashed #e3b8c4}'+
  '.up-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}'+
  '.up-chip{font:inherit;font-size:18px;background:#fff;border:1.5px solid #dcc9c9;border-radius:12px;padding:8px 14px;cursor:pointer;color:#3a2b38;min-height:44px}.up-chip.used{opacity:.25;pointer-events:none}'+
  '.up-slots .up-chip{background:#ffe9a8;border-color:#e0bd5c}.up-slots.bad{animation:upsh .35s}.up-slots.good .up-chip{background:#e8efe8;border-color:#9dc3a5}'+
  '@keyframes upsh{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
  '.up-obj{display:grid;place-items:center;padding:6px 0}'+
  '.up-placa{background:#2f3e5c;color:#fff;border:4px solid #c9c1d8;border-radius:14px;padding:16px 26px;text-align:center;min-width:240px}.up-placa .n{font-size:24px;font-weight:800;letter-spacing:.05em}.up-placa .h{font-size:30px;font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums}'+
  '.up-tk{position:relative;background:#fff7e0;border:2px dashed #c9a447;border-radius:12px;padding:14px 22px;text-align:center;min-width:240px}.up-tk .n{font-size:22px;font-weight:800}.up-tk .h{font-size:26px;font-weight:800;margin-top:4px}'+
  '.up-clk{width:170px;height:170px}.up-chip2{display:none}'+
  '.up-cena{font-size:14px;color:#7c6a78;margin:0}'+
  '.up-res{display:grid;gap:10px;text-align:center}.up-star{font-size:40px;letter-spacing:6px}'+
  '.up-rows{display:grid;gap:6px;text-align:left}.up-row{display:flex;justify-content:space-between;gap:8px;background:#fdf6f2;border-radius:12px;padding:9px 14px;font-size:14px}.up-row.ok b{color:#3f6a4a}.up-row.err b{color:#9a3a4c}'+
  '.up-resp{display:grid;gap:8px}.up-in2[hidden]{display:none}.up-in2{display:flex;gap:8px}.up-inp{flex:1;min-width:0;font:inherit;font-size:17px;border:1.5px solid #dcc9c9;border-radius:12px;padding:12px;color:#3a2b38;background:#fff}'+
  '.up-send,.up-mic,.up-dica{font:inherit;font-size:15px;font-weight:700;border-radius:12px;border:1.5px solid #dcc9c9;background:#fff;color:#3a2b38;padding:0 16px;min-height:46px;cursor:pointer}.up-send{background:#c8415f;border-color:#c8415f;color:#fff}.up-mic{border-color:#c8415f;color:#c8415f}'+
  '.up-row2{display:flex;gap:8px;flex-wrap:wrap}.up-modo{margin:0;font-size:13.5px;color:#7c6a78}.up-semfala{font:inherit;font-size:12.5px;background:none;border:0;text-decoration:underline;color:#7c6a78;cursor:pointer;min-height:46px}.up-st{font-size:13.5px;min-height:20px;color:#7c6a78}.up-send:disabled,.up-mic:disabled,.up-dica:disabled,.up-inp:disabled{opacity:.5;cursor:default}'+
  '@media (prefers-reduced-motion:reduce){.up-slots.bad{animation:none}}';
  var st=null;
  function $(s,r){return (r||st.root).querySelector(s);}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function falaP(t){ try{ if(st.o.say) st.o.say(t,'ja-JP'); }catch(e){} }
  function falaG(t){ try{ if(st.o.sayGravado) st.o.sayGravado(t,'ja-JP'); }catch(e){} }
  function erro(){ st.erros[st.k]=(st.erros[st.k]||0)+1; ((st.cur&&st.cur.hab)||[]).forEach(function(h){ st.hab[h]=(st.hab[h]||0)+1; }); try{ if(st.o.onMistake) st.o.onMistake(); }catch(e){} }
  function clockSVG(h,m){
    var a=((h%12)+m/60)*30, b=m*6, tick='';
    for(var k=0;k<12;k++){ var r=k*Math.PI/6; tick+='<circle cx="'+(50+39*Math.sin(r)).toFixed(1)+'" cy="'+(50-39*Math.cos(r)).toFixed(1)+'" r="'+(k%3?1.6:2.8)+'" fill="#7c6a78"/>'; }
    return '<svg class="up-clk" viewBox="0 0 100 100" role="img" aria-label="Relógio"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#b7a6dc" stroke-width="5"/>'+tick+
      '<line x1="50" y1="50" x2="50" y2="29" stroke="#3a2b38" stroke-width="4.5" stroke-linecap="round" transform="rotate('+a+' 50 50)"/>'+
      '<line x1="50" y1="50" x2="50" y2="17" stroke="#3a2b38" stroke-width="3" stroke-linecap="round" transform="rotate('+b+' 50 50)"/><circle cx="50" cy="50" r="3" fill="#c8415f"/></svg>';
  }
  function objeto(o){
    if(!o) return '';
    if(o.tipo==='placa') return '<div class="up-obj"><div class="up-placa" lang="ja"><div class="n">'+esc(o.nome)+'</div><div class="h">'+esc(o.hora)+'</div></div></div>';
    if(o.tipo==='ingresso') return '<div class="up-obj"><div class="up-tk" lang="ja"><div class="n">'+esc(o.nome)+'</div><div class="h">'+esc(o.dia)+' · '+esc(o.hora)+'</div></div></div>';
    if(o.tipo==='relogio') return '<div class="up-obj">'+clockSVG(o.h,o.m)+'</div>';
    return '';
  }
  function pills(){ var P=st.p.etapas; $('.up-pills').innerHTML=P.map(function(e,i){return '<span class="'+(i<st.k?'ok':i===st.k?'now':'')+'">'+(i<st.k?'✓ ':'')+esc(e.nome)+'</span>';}).join('')+'<span class="'+(st.k===P.length?'now':'')+'">Resultado</span>'; }
  function nextStage(){
    st.k++; st.i=0; pills();
    var e=st.p.etapas[st.k];
    if(!e){ resultado(); return; }
    if(e.tipo==='chamada'){ chamada(); return; }
    abertura(e);
  }
  function abertura(e){
    $('.up-main').innerHTML='<div class="up-card"><p class="up-h">'+esc(e.nome)+'</p><p class="up-sub">'+esc(e.instr)+'</p><button type="button" class="up-next" data-a="go">Começar →</button></div>';
    $('.up-main').onclick=function(ev){ if(ev.target.closest('[data-a=go]')) item(); };
    try{ $('.up-main').scrollIntoView({block:'nearest'}); }catch(_){}
  }
  function item(){
    var e=st.p.etapas[st.k], it=e.itens[st.i];
    if(!it){ nextStage(); return; }
    ({ouvir:vOuvir,montar:vMontar,ler:vLer,surpresa:vSurpresa})[e.tipo](e,it);
    try{ $('.up-main').scrollIntoView({block:'nearest'}); }catch(_){}
  }
  function cont(e){ return '<div class="up-cnt">'+(st.i+1)+' de '+e.itens.length+'</div>'; }
  function avanca(){ st.i++; item(); }
  /* resposta aberta: a pessoa ESCREVE (kana ou romaji) ou FALA; sem alternativas */
  function norm(t){ return String(t||'').toLowerCase().replace(/[āâ]/g,'a').replace(/[īî]/g,'i').replace(/[ūû]/g,'u').replace(/[ēê]/g,'e').replace(/[ōô]/g,'o')
    .replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);}).replace(/[\s\-、。,.!?！？「」…・~〜]/g,''); }
  function bate(txt,kws,min){ var t=norm(txt); if(!t) return false;
    var n=kws.filter(function(k){ return k.split('|').some(function(a){ a=norm(a); return a&&t.indexOf(a)>-1; }); }).length;
    return n>=(min||kws.length); }
  function resposta(card,it,opt){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition, tries=0, fechado=false;
    var box=document.createElement('div'); box.className='up-resp';
    st.cur=it; var modo=it.modo||'livre', soFala=(modo==='falar'&&!!SR), soEscreve=(modo==='escrever'); if(soEscreve) SR=null;
    box.innerHTML='<p class="up-modo">'+(soFala?'🗣️ Responda <b>falando</b>.':soEscreve?'✍️ Responda <b>escrevendo</b> (kana ou romaji).':'Escreva (kana ou romaji) ou fale.')+'</p>'+
      '<div class="up-in2"'+(soFala?' hidden':'')+'><input type="text" class="up-inp" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escreva em kana ou romaji (ex.: kuji ou くじ)" aria-label="Sua resposta">'+
      '<button type="button" class="up-send">Enviar</button></div><div class="up-row2">'+(SR?'<button type="button" class="up-mic">🎤 Falar</button>':'')+'<button type="button" class="up-dica">💡 Dica</button>'+(soFala?'<button type="button" class="up-semfala">Não posso falar agora</button>':'')+'</div><div class="up-st" aria-live="polite"></div>';
    card.appendChild(box);
    var inp=box.querySelector('.up-inp'), st2=box.querySelector('.up-st'), mic=box.querySelector('.up-mic');
    function termina(ok){ fechado=true; inp.disabled=true; box.querySelector('.up-send').disabled=true; if(mic) mic.disabled=true; box.querySelector('.up-dica').disabled=true;
      var w=document.createElement('div'); w.className='up-why'; var h='';
      if(ok) h+='<b>✓ Isso!</b> '; else h+='Sem problema. ';
      if(it.model) h+='Resposta: <b lang="ja">'+esc(it.model)+'</b>'+(it.modelRo?'<span class="ro"> '+esc(it.modelRo)+'</span>':'');
      if(it.tr) h+='<br>'+esc(it.tr);
      if(it.why) h+='<br>'+esc(it.why);
      w.innerHTML=h; card.appendChild(w);
      if(ok&&it.model) falaG(it.say2||it.model);
      var n=document.createElement('button'); n.type='button'; n.className='up-next'; n.textContent='Continuar →'; n.onclick=opt.next||avanca; card.appendChild(n); }
    function julga(txt){ if(fechado) return; txt=String(txt||'').trim(); if(!txt){ st2.textContent='Escreva ou fale a sua resposta.'; return; }
      if(bate(txt,it.kws,it.min)) termina(true);
      else{ tries++; erro(); inp.value=''; if(tries>=3) termina(false); else { st2.textContent='Ainda não. Tente de novo'+(tries===1?' (a 💡 Dica ajuda).':'.'); inp.focus(); } } }
    box.querySelector('.up-send').onclick=function(){ julga(inp.value); };
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); julga(inp.value); } });
    box.querySelector('.up-dica').onclick=function(){ st2.textContent='💡 '+(it.dica||'Ouça de novo com calma.'); };
    var sf=box.querySelector('.up-semfala'); if(sf) sf.onclick=function(){ box.querySelector('.up-in2').hidden=false; sf.remove(); inp.focus(); };
    if(mic) mic.onclick=function(){ if(fechado) return; try{speechSynthesis.cancel();}catch(e){}
      var rec=new SR(); rec.lang='ja-JP'; rec.interimResults=false; rec.maxAlternatives=3; st2.textContent='🎧 Estou ouvindo...'; mic.disabled=true;
      rec.onresult=function(ev){ var txt=''; for(var i=0;i<ev.results[0].length;i++) txt+=' '+ev.results[0][i].transcript; mic.disabled=false; inp.value=ev.results[0][0].transcript; julga(txt); };
      rec.onerror=function(){ mic.disabled=false; st2.textContent='Não consegui ouvir. Fale de novo.'; tries++; if(tries>=2&&sf){ box.querySelector('.up-in2').hidden=false; sf.remove(); st2.textContent='Tudo bem, pode escrever a resposta.'; } };
      rec.onend=function(){ mic.disabled=false; };
      try{ rec.start(); }catch(e){ mic.disabled=false; } };
  }
  function vOuvir(e,it){
    var m=$('.up-main'); m.innerHTML='<div class="up-card">'+cont(e)+'<p class="up-q">Ouça e escreva o que você ouviu, ou repita em voz alta.</p><button type="button" class="up-play">🔊 Ouvir</button></div>';
    var card=$('.up-card',m); $('.up-play',m).onclick=function(){ falaP(it.say); };
    resposta(card,it,{}); setTimeout(function(){ if(st) falaP(it.say); },250);
  }
  function vMontar(e,it){
    var m=$('.up-main'); m.innerHTML='<div class="up-card">'+cont(e)+'<p class="up-q">Diga ou escreva em japonês:</p><p class="up-h">“'+esc(it.pt)+'”</p></div>';
    resposta($('.up-card',m),it,{});
  }
  function vLer(e,it){
    var m=$('.up-main'), q=it.qs[st.q||0]; st.q=st.q||0;
    m.innerHTML='<div class="up-card">'+cont(e)+objeto(it.obj)+'<p class="up-q">'+esc(q.q)+'</p></div>';
    resposta($('.up-card',m),q,{next:function(){ if(st.q<it.qs.length-1){ st.q++; item(); } else { st.q=0; avanca(); } }});
  }
  function vSurpresa(e,it){
    var m=$('.up-main'); m.innerHTML='<div class="up-card">'+cont(e)+'<p class="up-cena">'+esc(it.cena)+'</p>'+objeto(it.obj)+
      '<button type="button" class="up-play">🔊 Ouvir</button><div class="up-line"><div class="k" lang="ja">'+esc(it.kana)+'</div><div class="ro">'+esc(it.ro||'')+'</div><div class="t" hidden>'+esc(it.tr)+'</div></div>'+
      '<button type="button" class="up-show">ver a tradução</button><p class="up-q">Responda em japonês (escrevendo ou falando).</p></div>';
    var card=$('.up-card',m); $('.up-play',m).onclick=function(){ falaP(it.say); };
    $('.up-show',m).onclick=function(){ $('.up-line .t',m).hidden=false; this.remove(); };
    resposta(card,it,{}); setTimeout(function(){ if(st) falaP(it.say); },250);
  }
  function chamada(){
    st.cur={hab:['escuta','fala']};
    $('.up-main').innerHTML='<div class="up-card"><p class="up-h">📞 Chamada de vídeo</p><p class="up-sub">'+esc(st.p.etapas[st.k].instr)+'</p><button type="button" class="up-next" data-a="liga">Ligar →</button></div>';
    $('.up-main').onclick=function(ev){ if(!ev.target.closest('[data-a=liga]')) return;
      st.root.hidden=true;
      var volta=function(){ if(!st) return; st.root.hidden=false; nextStage(); };
      try{ st.o.chamada(volta,function(){ erro(); }); }catch(e){ volta(); } };
  }
  function resultado(){
    var P=st.p.etapas, tot=0, linhas='';
    P.forEach(function(e,i){ var n=st.erros[i]||0; tot+=n; linhas+='<div class="up-row '+(n?'err':'ok')+'"><span>'+esc(e.nome)+'</span><b>'+(n?n+(n>1?' erros':' erro'):'sem erros')+'</b></div>'; });
    var H=[['escuta','👂','Escuta'],['fala','🗣️','Fala'],['leitura','👀','Leitura'],['escrita','✍️','Escrita']], hl='';
    H.forEach(function(h){ var n=st.hab[h[0]]||0; hl+='<div class="up-row '+(n?'err':'ok')+'"><span>'+h[1]+' '+h[2]+'</span><b>'+(n?n+(n>1?' erros':' erro'):'sem erros')+'</b></div>'; });
    var pior=H.slice().sort(function(a,b){return (st.hab[b[0]]||0)-(st.hab[a[0]]||0);})[0], dicaHab=(st.hab[pior[0]]||0)>1?'<p class="up-sub">Habilidade para treinar mais: <b>'+pior[1]+' '+pior[2].toLowerCase()+'</b>.</p>':'';
    var est=tot<=1?3:tot<=4?2:1, rever='';
    var piores=P.map(function(e,i){return {e:e,n:st.erros[i]||0};}).filter(function(x){return x.n>1;});
    if(piores.length) rever='<p class="up-sub">Para fixar: revise <b>'+piores.map(function(x){return esc(x.e.nome.toLowerCase());}).join('</b> e <b>')+'</b> na aula de '+esc(st.p.titulo)+'. <a href="'+esc(st.p.aula)+'">Abrir a aula →</a></p>';
    try{ var sv=JSON.parse(localStorage.getItem('utopiaProva1')||'{}'); var a=sv[st.terr]; if(!a||est>=a.estrelas){ sv[st.terr]={estrelas:est,erros:tot}; localStorage.setItem('utopiaProva1',JSON.stringify(sv)); } }catch(_){}
    $('.up-main').onclick=null;
    $('.up-main').innerHTML='<div class="up-card up-res"><p class="up-h">Resultado da prova</p><div class="up-star" aria-label="'+est+' de 3 estrelas">'+'★'.repeat(est)+'<span style="opacity:.25">'+'★'.repeat(3-est)+'</span></div>'+
      '<p class="up-sub">'+(est===3?'Você mandou muito bem!':est===2?'Bom caminho! Alguns pontos para fixar.':'Você chegou até o fim. Vale rever a aula e tentar de novo depois.')+'</p><p class="up-sub" style="margin:0"><b>As 4 habilidades</b></p><div class="up-rows">'+hl+'</div>'+dicaHab+'<p class="up-sub" style="margin:0"><b>Por etapa</b></p><div class="up-rows">'+linhas+'</div>'+rever+
      '<button type="button" class="up-next" style="justify-self:center" data-a="fim">🏅 Receber o carimbo</button></div>';
    $('.up-main').addEventListener('click',function(ev){ if(!ev.target.closest('[data-a=fim]')) return; var cb=st.o.onDone; fecha(); if(cb) cb(); });
    pills();
  }
  function fecha(){ try{speechSynthesis.cancel();}catch(e){} if(st&&st.root) st.root.remove(); st=null; }
  function start(terr,o){
    var p=(window.PROVAS||{})[terr]; if(!p) return false;
    if(!document.getElementById('up-css')){ var s=document.createElement('style'); s.id='up-css'; s.textContent=CSS; document.head.appendChild(s); }
    var old=document.getElementById('up'); if(old) old.remove();
    var root=document.createElement('div'); root.id='up'; root.setAttribute('role','dialog'); root.setAttribute('aria-label','Prova em etapas');
    root.innerHTML='<div class="up-in"><div class="up-top"><b>🏅 Prova · '+esc(p.titulo)+'</b><button type="button" class="up-x">✕ Sair</button></div><div class="up-pills"></div><div class="up-main"></div></div>';
    document.body.appendChild(root);
    st={root:root,p:p,o:o||{},terr:terr,k:-1,i:0,q:0,erros:{},hab:{},cur:null};
    $('.up-x').onclick=function(){ if(!confirm('Sair da prova? O carimbo só sai ao terminar todas as etapas.')) return; var cb=st.o.onExit; fecha(); if(cb) cb(); };
    nextStage();
    return true;
  }
  window.UniProva={start:start,existe:function(t){return !!(window.PROVAS||{})[t];}};
})();
