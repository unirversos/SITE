/* Unirversos · selo do avatar: mostra o avatar salvo no Ateliê em qualquer página do site.
   Uso: coloque <div id="utopia-badge"></div> onde o selo deve aparecer e carregue
   /idiomas/dados/avatar.js e depois este arquivo. Lê só o navegador (localStorage). */
(function(){
  var el=document.getElementById('utopia-badge'); if(!el) return;
  var A=window.UtopiaAvatar, a=null, g=null;
  try{ a=A&&A.load(); }catch(e){}
  try{ g=JSON.parse(localStorage.getItem('utopiaSave1')||'null'); }catch(e){}
  if(!document.getElementById('ub-css')){
    var st=document.createElement('style'); st.id='ub-css';
    st.textContent='.ub{display:inline-flex;align-items:center;gap:10px;max-width:100%;background:#fff;border:1.5px solid #ecdadd;border-radius:999px;padding:5px 14px 5px 5px;font:500 13px/1.3 "Zen Maru Gothic","Noto Sans JP",system-ui,sans-serif;color:#3a2b38;text-decoration:none}'+
      '.ub-av{width:40px;height:40px;border-radius:50%;overflow:hidden;background:#f8dde1;flex:none;display:grid;place-items:center;font-size:20px}.ub-av svg{width:100%;height:100%;display:block}'+
      '.ub-t{display:grid;min-width:0}.ub-t b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ub-t small{color:#705f6c;font-size:12px}.ub-t rt{font-size:.55em;color:#705f6c}'+
      '.ub-go{color:#c23f5e;font-weight:700;font-size:12.5px;white-space:nowrap;text-decoration:none;margin-left:4px}.ub-go:hover{text-decoration:underline}'+
      '.ub-new{border-style:dashed}';
    document.head.appendChild(st);
  }
  var atelie='/idiomas/planeta-utopia/atelie/';
  if(!a||!a.sel){
    el.innerHTML='<a class="ub ub-new" href="'+atelie+'"><span class="ub-av">🎨</span><span class="ub-t"><b>Crie o seu avatar</b><small>e leve ele para todas as aulas</small></span><span class="ub-go">Ateliê →</span></a>';
    return;
  }
  var p=a.profile||{}, nm=(p.kata||p.name||(g&&g.name)||'Viajante').replace(/[<>&"]/g,'');
  var lv=(g&&g.level)||1, title=A&&A.titleHTML?A.titleHTML(lv):'';
  var svg=A?A.svg(a.sel,{viewBox:'40 46 160 160',still:true,label:'Seu avatar'}):'🧳';
  el.innerHTML='<span class="ub"><span class="ub-av">'+svg+'</span><span class="ub-t"><b>'+nm+'</b><small>Nv. '+lv+' · '+title+'</small></span><a class="ub-go" href="'+atelie+'">editar avatar</a></span>';
})();
