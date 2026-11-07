/* Chamada de vídeo simulada: a prova do mapa vira uma ligação com o personagem do mapa.
   Não é uma chamada real: o personagem é um roteiro (voz gravada/do aparelho); o microfone só confere as palavras.
   Uso: UniChamada.start(terrId, {say, roSpan, nome, onDone, onHangup, onMistake}) → true se há roteiro para o mapa. */
(function(){
  var AV=function(){return window.UtopiaAvatar;};
  var CSS='#uc{position:fixed;inset:0;z-index:300;background:#2b2330;color:#fff;display:flex;flex-direction:column;font-family:inherit;overflow-y:auto}'+
  '#uc[hidden]{display:none}.uc-in{width:100%;max-width:560px;margin:0 auto;padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px}'+
  '.uc-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;opacity:.9}'+
  '.uc-top b{font-weight:700}.uc-live{display:inline-flex;align-items:center;gap:6px}.uc-live i{width:9px;height:9px;border-radius:50%;background:#ff5a6b;animation:ucb 1.2s infinite}'+
  '@keyframes ucb{50%{opacity:.25}}'+
  '.uc-tile{position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:8/5;box-shadow:0 6px 24px rgba(0,0,0,.4)}'+
  '.uc-tile svg.uc-main{width:100%;height:100%;display:block}'+
  '.uc-name{position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,.55);padding:3px 10px;border-radius:12px;font-size:12px}'+
  '.uc-self{position:absolute;right:10px;bottom:10px;width:27%;aspect-ratio:1;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,.8);background:#f4e8ff}'+
  '.uc-self svg{width:100%;height:100%;display:block}'+
  '.uc-wave{position:absolute;left:10px;top:10px;display:none;gap:3px;align-items:flex-end;height:16px}.uc-tile.talk .uc-wave{display:flex}'+
  '.uc-wave span{width:3px;background:#9fe3b0;border-radius:2px;animation:ucw .7s ease-in-out infinite}.uc-wave span:nth-child(2){animation-delay:.15s}.uc-wave span:nth-child(3){animation-delay:.3s}'+
  '@keyframes ucw{0%,100%{height:4px}50%{height:15px}}'+
  '.uc-dots{display:flex;gap:6px;justify-content:center}.uc-dots i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.25)}.uc-dots i.on{background:#9fe3b0}.uc-dots i.now{background:#fff}'+
  '.uc-cap{background:rgba(255,255,255,.08);border-radius:14px;padding:14px 16px;min-height:86px}'+
  '.uc-cap .k{font-size:21px;line-height:1.5}.uc-cap .ro{display:none;font-size:13px;opacity:.8}.ro-on .uc-cap .ro{display:block}'+
  '.uc-cap .tr{font-size:14px;opacity:.85;margin-top:6px}.uc-cap button{background:none;border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:20px;padding:4px 12px;font-size:12.5px;margin:6px 6px 0 0;cursor:pointer}'+
  '.uc-ans{display:flex;flex-direction:column;gap:10px;align-items:stretch}'+
  '.uc-mic{background:#ff5a6b;color:#fff;border:0;border-radius:40px;padding:15px;font-size:16px;font-weight:700;cursor:pointer}.uc-mic:disabled{opacity:.5}'+
  '.uc-st{font-size:13.5px;min-height:20px;text-align:center;opacity:.92}'+
  '.uc-hint{font-size:13px;opacity:.85;text-align:center}'+
  '.uc-opts{display:grid;gap:8px}.uc-opts button{background:#fff;color:#2b2330;border:0;border-radius:12px;padding:12px;font-size:17px;cursor:pointer}'+
  '.uc-write{display:flex;gap:8px}.uc-inp{flex:1;min-width:0;font:inherit;font-size:16px;border:0;border-radius:12px;padding:12px;color:#2b2330}.uc-send{background:#9fe3b0;color:#1d3a27;border:0;border-radius:12px;padding:0 16px;font:inherit;font-weight:700;cursor:pointer}'+
  '.uc-bye{align-self:center;background:#e0384c;color:#fff;border:0;border-radius:40px;padding:10px 22px;font-size:14px;cursor:pointer}'+
  '.pc-char{transform-box:fill-box;transform-origin:50% 100%}.uc-tile.talk .uc-npc{animation:ucbob .5s ease-in-out infinite}'+
  '@keyframes ucbob{50%{transform:translateY(-3px)}}';
  var st=null;
  function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function match(txt,kws,min){txt=String(txt||'').toLowerCase();var sem=txt.replace(/[\s\-、。,.!?！？]/g,'');
    var n=kws.filter(function(k){return k.split('|').some(function(a){a=a.toLowerCase();return a&&(txt.indexOf(a)>-1||sem.indexOf(a.replace(/[\s\-]/g,''))>-1);});}).length;
    return n>=(min||1);}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function aula(slug){return (window.AULAS||{})[slug];}
  function npcSVG(a,mood){
    var c=(a&&a.cen)||{},n=a&&a.npc,A=AV();
    var face=mood==='wrong'?'bikkuri':(n&&n.sel.face)||'egao';
    var sel=Object.assign({},n.sel,{face:face});
    return '<svg class="uc-main" viewBox="0 0 400 250" role="img" aria-label="'+esc(n.nome)+'"><rect width="400" height="250" fill="'+(c.wall||'#fbefe6')+'"/>'+(c.back||'')+
      '<rect y="196" width="400" height="54" fill="'+(c.floor||'#f1dccd')+'"/>'+
      '<g class="uc-npc pc-char"><svg x="108" y="20" width="184" height="230" viewBox="0 0 240 300">'+A.markup(sel,{noBg:true,still:true})+(n.extra||'')+'</svg></g></svg>';
  }
  function selfSVG(){
    var A=AV(),a=A.load(),sel=(a&&a.sel)||{hair:'pony',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'pinku',acc:[],traits:[],skin:4};
    return '<svg viewBox="40 46 160 160">'+A.markup(sel,{noBg:true,still:true})+'</svg>';
  }
  function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function stop(){try{speechSynthesis.cancel();}catch(e){} if(st&&st.timer)clearInterval(st.timer); if(st&&st.rec){try{st.rec.abort();}catch(e){}}}
  function fala(txt){ try{ if(st.o.say)st.o.say(txt,"ja-JP"); }catch(e){} var tile=st.root.querySelector('.uc-tile'); tile.classList.add('talk'); setTimeout(function(){tile.classList.remove('talk');},Math.min(4200,900+txt.length*260)); }
  function mood(m){ var tile=st.root.querySelector('.uc-tile'); var s=tile.querySelector('svg.uc-main'); var ns=el(npcSVG(st.a,m)); tile.replaceChild(ns,s); if(m!=='idle')setTimeout(function(){ if(!st)return; var t2=st.root.querySelector('.uc-tile'),s2=t2.querySelector('svg.uc-main'); t2.replaceChild(el(npcSVG(st.a,'idle')),s2);},1400); }
  function legenda(t,extra){
    var cap=st.root.querySelector('.uc-cap'), o=st.o;
    cap.innerHTML='<div class="k" lang="ja">'+esc(t.kana)+'</div><div class="ro">'+esc(t.ro)+'</div>'+
      '<button type="button" data-a="ouvir">🔊 ouvir de novo</button><button type="button" data-a="tr">🫣 ver tradução</button><div class="tr" hidden>'+esc(t.tr)+'</div>';
    cap.onclick=function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.a==='ouvir')fala(t.say);else{cap.querySelector('.tr').hidden=false;b.remove();}};
    if(extra)cap.insertAdjacentHTML('beforeend',extra);
  }
  function dots(){var d=st.root.querySelector('.uc-dots');d.innerHTML=st.c.turnos.map(function(_,i){return '<i class="'+(i<st.i?'on':i===st.i?'now':'')+'"></i>';}).join('');}
  function turno(){
    var t=st.c.turnos[st.i]; st.tries=0; dots(); legenda(t); fala(t.say); resp();
  }
  function resp(){
    var t=st.c.turnos[st.i], ans=st.root.querySelector('.uc-ans'), SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    ans.innerHTML=(SR?'<button type="button" class="uc-mic">🎤 Responder em japonês</button>':'')+'<div class="uc-st"></div><div class="uc-hint"></div><div class="uc-opts"></div>';
    var mic=ans.querySelector('.uc-mic'), msg=ans.querySelector('.uc-st'), hint=ans.querySelector('.uc-hint'), opts=ans.querySelector('.uc-opts');
    function certo(txt){
      msg.textContent='✓ Entendi!'; if(txt)hint.textContent='Você disse: “'+txt+'”';
      if(mic)mic.disabled=true; opts.innerHTML=''; var wb=ans.querySelector('.uc-write'); if(wb)wb.remove(); mood('ok'); st.i++;
      setTimeout(function(){ if(!st)return; if(st.i>=st.c.turnos.length)fim(); else turno(); },1300);
    }
    function mostraOpcoes(motivo){
      /* sem alternativas: depois de 3 erros, mostra a resposta de exemplo e segue */
      hint.innerHTML=motivo+(t.model?' Resposta de exemplo: <b lang="ja">'+esc(t.model)+'</b>'+(t.modelRo?' <span class="ro">'+esc(t.modelRo)+'</span>':''):'');
      opts.innerHTML=''; var b=document.createElement('button');b.type='button';b.textContent='Continuar →';
      b.onclick=function(){ certo(); }; opts.appendChild(b);
    }
    function escreve(){
      var w=document.createElement('div'); w.className='uc-write'; w.innerHTML='<input type="text" class="uc-inp" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ou escreva em kana ou romaji" aria-label="Sua resposta"><button type="button" class="uc-send">Enviar</button>';
      ans.insertBefore(w,msg);
      var inp=w.querySelector('.uc-inp');
      function envia(){ var v=inp.value.trim(); if(!v) return; if(match(v,t.kws,t.min)) certo(v); else{ st.tries++; if(st.o.onMistake)st.o.onMistake(); inp.value=''; msg.textContent='Ainda não. Tente de novo.'; mood('wrong'); if(st.tries>=3){ mostraOpcoes('Sem problema.'); w.remove(); } } }
      w.querySelector('.uc-send').onclick=envia; inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); envia(); } });
    }
    escreve();
    if(!SR){ msg.textContent='Seu navegador não ouve o microfone. Escreva a resposta.'; return; }
    mic.onclick=function(){
      try{speechSynthesis.cancel();}catch(e){}
      var rec=new SR(); st.rec=rec; rec.lang='ja-JP'; rec.interimResults=false; rec.maxAlternatives=3;
      msg.textContent='🎧 Estou ouvindo...'; mic.disabled=true;
      rec.onresult=function(ev){
        var txt='';for(var i=0;i<ev.results[0].length;i++)txt+=' '+ev.results[0][i].transcript;
        if(match(txt,t.kws,t.min)) certo(ev.results[0][0].transcript);
        else{ st.tries++; mic.disabled=false; hint.textContent='Ouvi: “'+ev.results[0][0].transcript+'”'; msg.textContent='Não deu para entender. Tente de novo.'; mood('wrong'); fala('もう一度、お願いします。');
          if(st.tries>=3) mostraOpcoes('Sem problema.'); }
      };
      rec.onerror=function(){ mic.disabled=false; msg.textContent='Não consegui ouvir.'; st.tries++; if(st.tries>=2) msg.textContent='Se o microfone não funciona, escreva a resposta.'; };
      rec.onend=function(){ if(mic.disabled && msg.textContent.indexOf('ouvindo')>-1){mic.disabled=false;msg.textContent='';} };
      try{rec.start();}catch(e){ mic.disabled=false; }
    };
  }
  function fim(){
    var f=st.c.fim; st.i=st.c.turnos.length; dots(); legenda(f); fala(f.say); mood('ok');
    st.root.querySelector('.uc-ans').innerHTML='<div class="uc-st">✓ Chamada concluída. Você foi até o fim em japonês!</div>';
    setTimeout(function(){ var cb=st&&st.o.onDone; var root=st.root; stop(); root.hidden=true; st=null; if(cb)cb(); },3600);
  }
  function start(terr,o){
    var c=(window.CHAMADAS||{})[terr]; if(!c||!AV()||!aula(c.slug))return false;
    if(!document.getElementById('uc-css')){var s=document.createElement('style');s.id='uc-css';s.textContent=CSS;document.head.appendChild(s);}
    var root=document.getElementById('uc'); if(root)root.remove();
    root=el('<div id="uc" role="dialog" aria-label="Chamada de vídeo simulada"><div class="uc-in">'+
      '<div class="uc-top"><span class="uc-live"><i></i><b>Chamada simulada</b></span><span class="uc-time">00:00</span></div>'+
      '<div class="uc-tile">'+npcSVG(aula(c.slug),'idle')+'<div class="uc-wave"><span></span><span></span><span></span></div><div class="uc-name">'+esc(c.quem)+'</div><div class="uc-self">'+selfSVG()+'</div></div>'+
      '<div class="uc-dots"></div><div class="uc-cap"></div><div class="uc-ans"></div>'+
      '<button type="button" class="uc-bye">📞 Encerrar chamada</button></div></div>');
    document.body.appendChild(root);
    st={root:root,c:c,a:aula(c.slug),o:o||{},i:0,tries:0,t0:Date.now(),rec:null};
    st.timer=setInterval(function(){var e=root.querySelector('.uc-time');if(e)e.textContent=fmt(Math.floor((Date.now()-st.t0)/1000));},1000);
    root.querySelector('.uc-bye').onclick=function(){ if(!confirm('Encerrar a chamada? O carimbo só sai ao terminar a conversa.'))return; var cb=st.o.onHangup; stop(); root.remove(); st=null; if(cb)cb(); };
    legenda(c.abre);
    root.querySelector('.uc-ans').innerHTML='<button type="button" class="uc-mic" id="uc-go">📞 Atender a chamada</button>';
    root.querySelector('#uc-go').onclick=function(){ this.disabled=true; fala(c.abre.say); setTimeout(function(){ if(st)turno(); },1800); };
    return true;
  }
  window.UniChamada={start:start,existe:function(t){return !!(window.CHAMADAS||{})[t];}};
})();
