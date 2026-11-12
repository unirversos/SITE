/* Botão "Entrar" leve para páginas que ainda não carregam a conta.
   Aparece na barra do topo; logo depois carrega idiomas/dados/conta.js, que troca o botão
   pelo nome da pessoa quando já há login. */
(function(){
  var alvo=document.querySelector('.sitebar .navlinks')||document.querySelector('.nav .links');
  if(!alvo||document.querySelector('.uni-chip'))return;
  var s=document.createElement('style');
  s.textContent='.uni-chip{display:inline-flex;align-items:center;gap:6px;font-size:13px;white-space:nowrap}.uni-chip.uni-entrar button{background:#c4405f;border:1px solid #c4405f;color:#fff;font:inherit;font-size:13px;font-weight:700;padding:5px 14px;border-radius:999px;cursor:pointer}';
  document.head.appendChild(s);
  var c=document.createElement('span');c.className='uni-chip uni-entrar';
  c.innerHTML='<button type="button">Entrar</button>';
  var pedido=false;
  function carregar(abrir){
    import('/idiomas/dados/conta.js?v=6').then(function(m){ if(abrir&&window.UniConta)window.UniConta.gate&&window.UniConta.gate({titulo:'Entre na sua conta',modo:'entrar'}); }).catch(function(){});
  }
  c.querySelector('button').onclick=function(){carregar(true);};
  alvo.appendChild(c);
  var ini=function(){if(pedido)return;pedido=true;carregar(false);};
  if(window.requestIdleCallback)requestIdleCallback(ini,{timeout:2000});else setTimeout(ini,1500);
})();
