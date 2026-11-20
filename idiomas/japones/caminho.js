/* Trilha · o caminho ilustrado dos 12 mapas (substitui a vila em pixel art).
   Mesmo uso da vila: VilaTrilha.render(el,{mapas:[{slug,nome,desc,terr,aula,prova}],avatar}).
   Cada lugar mostra a ilustração do mapa: apagada até concluir (aula + prova), colorida depois. */
(function(){
const REG=['Chegada','Primeiros dias','Encontros','Pela cidade'];
const CSS=`
.cm{display:grid;gap:14px;max-width:640px;margin:0 auto}
.cm-reg{display:grid;gap:8px}
.cm-rt{font-family:"Baloo 2",sans-serif;font-size:15px;font-weight:700;color:#816c5b;padding:0 4px;display:flex;align-items:center;gap:8px}
.cm-rt::after{content:"";flex:1;height:2px;background:repeating-linear-gradient(90deg,#d9c8b8 0 6px,transparent 6px 11px)}
.cm-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cm-l{position:relative;display:block;border-radius:14px;overflow:hidden;background:#fff;border:1.5px solid #ecdadd;text-decoration:none;color:#3a2b38;transition:transform .15s,box-shadow .15s}
.cm-l:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(58,43,56,.12)}
.cm-l img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;filter:grayscale(.85) sepia(.2) brightness(1.03);transition:filter .6s}
.cm-l.meio img{filter:grayscale(.35) sepia(.1)}
.cm-l.ok img{filter:none}
.cm-l .cm-n{position:absolute;left:6px;top:6px;min-width:24px;height:24px;padding:0 6px;border-radius:12px;background:rgba(255,255,255,.92);font:700 12px/24px "Baloo 2",sans-serif;text-align:center}
.cm-l.ok .cm-n{background:#4f7a58;color:#fff}
.cm-l .cm-nm{display:block;padding:5px 8px 6px;font-weight:700;font-size:13px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-l .cm-st{display:block;padding:0 8px 7px;font-size:11.5px;color:#705f6c;margin-top:-3px}
.cm-l.aqui{border-color:#c23f5e;box-shadow:0 0 0 3px #f8dde1}
.cm-av{position:absolute;right:6px;top:6px;width:38px;height:38px;border-radius:50%;background:#fff;border:2px solid #c23f5e;overflow:hidden;animation:cmPula 1.6s ease-in-out infinite}
.cm-av svg{display:block;width:100%;height:100%}
@keyframes cmPula{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.cm-salao{display:flex;align-items:center;gap:10px;justify-content:center;padding:10px;border-radius:14px;border:1.5px dashed #d9c8b8;color:#705f6c;text-decoration:none;font-weight:700}
.cm-salao.ok{border-style:solid;border-color:#a9c4a4;background:#e8efe8;color:#3e6347}
@media (prefers-reduced-motion:reduce){.cm-av{animation:none}.cm-l img{transition:none}}
@media (max-width:420px){.cm-l .cm-nm{font-size:12px}.cm-av{width:30px;height:30px}}`;
function render(el,dados){
  if(!document.getElementById('cm-css')){ const st=document.createElement('style'); st.id='cm-css'; st.textContent=CSS; document.head.appendChild(st); }
  const M=dados.mapas||[], fim=M.map(m=>m.aula&&m.prova), aqui=fim.indexOf(false);
  let av=''; try{ const A=window.UtopiaAvatar, a=A&&A.load(), s=a&&a.sel; if(s) av=`<span class="cm-av" aria-hidden="true">${A.svg(s,{viewBox:'50 50 140 140',noBg:true})}</span>`; }catch(e){}
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let h='<div class="cm">';
  for(let r=0;r<4;r++){
    h+=`<div class="cm-reg"><div class="cm-rt">${r+1} · ${REG[r]}</div><div class="cm-row">`;
    for(let c=0;c<3;c++){ const i=r*3+c, m=M[i]; if(!m) continue;
      const ok=fim[i], meio=!ok&&m.aula, eu=i===aqui;
      const st=ok?'✓ concluído':eu?'você está aqui':meio?'falta a prova':'a fazer';
      h+=`<a class="cm-l${ok?' ok':''}${meio?' meio':''}${eu?' aqui':''}" href="#p-${m.slug}" title="${esc(m.desc||'')}">
        <img src="/idiomas/img/cenas/${m.slug}.webp" alt="" loading="lazy"><span class="cm-n">${i+1}</span>${eu?av:''}
        <span class="cm-nm">${esc(m.nome)}</span><span class="cm-st">${st}</span></a>`;
    }
    h+='</div></div>';
  }
  const tudo=aqui<0;
  h+=`<a class="cm-salao${tudo?' ok':''}" href="/idiomas/planeta-utopia/salao/">🪐 Salão · Planeta Utopia${tudo?' — você chegou!':''}</a></div>`;
  el.innerHTML=h;
}
window.VilaTrilha={render};
})();
