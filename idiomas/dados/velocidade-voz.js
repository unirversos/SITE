/* Unirversos · velocidade da voz: um controle só para o site inteiro (fica guardado neste aparelho) */
(function(){
  var K='uniVelVoz', MIN=.5, MAX=1.2;
  function ler(){ try{ var v=parseFloat(localStorage.getItem(K)); if(v>=MIN&&v<=MAX) return v; }catch(e){} return 1; }
  var vel=ler();
  window.UniVel={ get:function(){ return vel; },
    set:function(v){ vel=Math.min(MAX,Math.max(MIN,Math.round(v*20)/20)); try{ localStorage.setItem(K,String(vel)); }catch(e){} atualiza(); },
    /* aplica ao elemento de áudio */
    aplica:function(a,extra){ try{ a.playbackRate=vel*(extra||1); a.preservesPitch=true; a.mozPreservesPitch=true; a.webkitPreservesPitch=true; }catch(e){} } };
  var box,btn,rng,out;
  function rotulo(){ return vel===1?'normal':(vel<1?'mais lenta ':'mais rápida ')+(vel===1?'':'×'+vel.toFixed(2).replace(/0$/,'')); }
  function atualiza(){ if(!btn) return; btn.textContent=(vel<1?'🐢':vel>1?'🐇':'🔊')+' voz '+(vel===1?'normal':'×'+vel.toFixed(2).replace(/0$/,'')); rng.value=vel; out.textContent=rotulo(); }
  function monta(){
    if(box||!document.body) return;
    var css=document.createElement('style');
    css.textContent='#uniVel{position:fixed;left:12px;bottom:12px;z-index:60;font:600 13px/1.2 "Zen Maru Gothic",system-ui,sans-serif;color:#3a2b38}'
     +'#uniVel button.uv-b{min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;font:inherit;cursor:pointer;box-shadow:0 4px 14px -6px rgba(58,43,56,.35)}'
     +'#uniVel .uv-p{display:none;margin-bottom:8px;padding:12px 14px;border-radius:14px;border:1.5px solid #ecdadd;background:#fff;box-shadow:0 8px 22px -10px rgba(58,43,56,.4);width:min(260px,calc(100vw - 24px))}'
     +'#uniVel.aberto .uv-p{display:block}'
     +'#uniVel input[type=range]{width:100%;min-height:44px;accent-color:#c23f5e}'
     +'#uniVel .uv-t{display:flex;justify-content:space-between;color:#6b5a67;font-weight:500;font-size:12px}'
     +'#uniVel .uv-o{margin:2px 0 6px;font-weight:700}'
     +'body{padding-bottom:76px}'
     +'@media print{#uniVel{display:none}body{padding-bottom:0}}';
    document.head.appendChild(css);
    box=document.createElement('div'); box.id='uniVel';
    box.innerHTML='<div class="uv-p" role="group" aria-label="Velocidade da voz"><div class="uv-o" id="uvO"></div><input id="uvR" type="range" min="'+MIN+'" max="'+MAX+'" step="0.05" aria-label="Velocidade da voz"><div class="uv-t"><span>🐢 mais lenta</span><span>mais rápida 🐇</span></div></div><button type="button" class="uv-b" id="uvB" aria-expanded="false"></button>';
    document.body.appendChild(box);
    btn=box.querySelector('#uvB'); rng=box.querySelector('#uvR'); out=box.querySelector('#uvO');
    btn.onclick=function(){ var a=box.classList.toggle('aberto'); btn.setAttribute('aria-expanded',a?'true':'false'); };
    rng.oninput=function(){ window.UniVel.set(parseFloat(rng.value)); };
    atualiza();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',monta); else monta();
})();
