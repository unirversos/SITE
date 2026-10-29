/* Palco da Prova: o mesmo cenário da aula (recepção, balcão, atendente) com o avatar do aluno,
   que reage às respostas. Lê window.AULAS[slug] (cen, npc) carregado de /idiomas/dados/aulas/<slug>.js */
(function(){
  var AV=window.UtopiaAvatar, st={aula:null, svg:null, fx:null, mood:'idle', me:null, timer:null};
  function charSVG(sel,x,y,w,cls){ var h=w*300/240;
    return '<g class="pc-char '+cls+'"><svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="0 0 240 300">'+AV.markup(sel,{noBg:true,still:true})+'</svg></g>'; }
  function icon(ic,x,y,s){ if(!ic) return '';
    if(String(ic).indexOf('svg:')===0){ var g=(st.aula.svgi&&st.aula.svgi[ic.slice(4)])||''; return g?'<svg x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" viewBox="0 0 100 100">'+g+'</svg>':''; }
    return '<text x="'+(x+s/2)+'" y="'+(y+s*0.78)+'" text-anchor="middle" font-size="'+(s*0.8)+'">'+ic+'</text>'; }
  function draw(opt){
    var a=st.aula; if(!a||!st.svg||!AV) return;
    var o=opt||{}, c=a.cen||{}, n=a.npc, mood=st.mood;
    var meBase=(st.me&&st.me.face)||'egao';
    var npcFace=mood==='wrong'?'bikkuri':(n.sel.face||'egao');
    var meFace=mood==='ok'?'egao':mood==='wrong'?'bikkuri':meBase;
    var npcCls=mood==='ok'?'nod':mood==='wrong'?'tilt':'idle', meCls=mood==='ok'?'hop':mood==='wrong'?'shake':'idle';
    var ct=c.counter;
    var counter=ct?'<g><rect x="14" y="150" width="196" height="62" rx="10" fill="'+(ct.color||'#e7cdb9')+'"/><rect x="8" y="140" width="208" height="16" rx="7" fill="'+(ct.top||'#f6e5d8')+'"/>'+
      (ct.label?'<rect x="'+(112-ct.label.length*7-12)+'" y="168" width="'+(ct.label.length*14+24)+'" height="22" rx="11" fill="#fff" opacity=".85"/><text x="112" y="183" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="11" font-weight="700" fill="#7c6a78">'+ct.label+'</text>':'')+
      '<g transform="translate(140 104)">'+(c.prop||'')+'</g></g>':(c.prop?'<g transform="translate(140 160)">'+c.prop+'</g>':'');
    var stamp=o.stamp?'<g class="pc-thump"><circle cx="'+(ct?178:150)+'" cy="'+(ct?128:60)+'" r="17" fill="#fff8" stroke="#c94a4a" stroke-width="2.5"/><text x="'+(ct?178:150)+'" y="'+(ct?133:65)+'" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="12" font-weight="800" fill="#c94a4a">OK</text></g>':'';
    st.svg.innerHTML=
      '<rect width="400" height="250" fill="'+(c.wall||'#fbefe6')+'"/>'+(c.back||'')+
      '<g transform="translate(280 16)">'+(c.board||'')+'</g>'+
      '<rect y="196" width="400" height="54" fill="'+(c.floor||'#f1dccd')+'"/><path d="M0 196 H400" stroke="#0001" stroke-width="3"/>'+
      charSVG(Object.assign({},n.sel,{face:npcFace}),42,52,124,npcCls)+
      (mood==='wrong'?'<g class="pc-q"><circle cx="160" cy="58" r="16" fill="#fff" stroke="#cfe0f0" stroke-width="2"/><text x="160" y="65" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="20" font-weight="800" fill="#4f8fc4">?</text></g>':'')+
      counter+stamp+
      '<g class="pc-char '+meCls+'">'+(c.meProp?icon(c.meProp,214,182,30):'')+
      '<svg x="236" y="62" width="148" height="185" viewBox="0 0 240 300">'+AV.markup(Object.assign({},st.me,{face:meFace}),{noBg:true,still:true})+'</svg></g>';
  }
  function mount(svg,fx,aula){
    try{ var a=AV.load(); st.me=(a&&a.sel)?Object.assign({},a.sel):{hair:'pony',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'pinku',acc:[],traits:[],skin:4}; }catch(e){ st.me={hair:'pony',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'pinku',acc:[],traits:[],skin:4}; }
    st.svg=svg; st.fx=fx; st.aula=aula; st.mood='idle'; draw();
  }
  function mood(m,ms){ st.mood=m; draw(); clearTimeout(st.timer); if(m!=='idle') st.timer=setTimeout(function(){ st.mood='idle'; draw(); },ms||1500); }
  function sparkle(list,n){ if(!st.fx) return;
    for(var k=0;k<(n||10);k++){ var s=document.createElement('span'); s.className='pc-spark'; s.textContent=list[k%list.length];
      s.style.left=(8+Math.random()*84)+'%'; s.style.top=(35+Math.random()*45)+'%'; s.style.animationDelay=(k*0.06)+'s';
      st.fx.appendChild(s); (function(x){ setTimeout(function(){ x.remove(); },2000); })(s); } }
  function stampOK(){ draw({stamp:true}); }
  window.UniPalco={mount:mount,mood:mood,sparkle:sparkle,stamp:stampOK,ready:function(){ return !!st.aula; }};
})();
