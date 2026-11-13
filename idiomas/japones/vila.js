/* Vila da trilha: o mapinha em pixel art da trilha do japonês.
   Uso: VilaTrilha.render(el,{mapas:[{slug,nome,desc,terr,aula,prova}],avatar:{cabelo,pele,roupa}})
   Desenho original, feito em código. Cada carimbo (prova) colore um lugar da vila. */
(function(){
const CSS=`
.vila{position:relative;width:100%;max-width:460px;margin:0 auto;container-type:inline-size;overflow:hidden;line-height:0;border:3px solid #3a2b38;border-radius:6px;box-shadow:4px 4px 0 #3a2b38;background:#e3ecdf}
.vila canvas{display:block;width:100%;height:auto;image-rendering:pixelated;image-rendering:crisp-edges}
.vl-camada{position:absolute;inset:0;line-height:1.2;--px:"DotGothic16","Zen Maru Gothic",system-ui,sans-serif}
.vl-reg{position:absolute;left:3cqw;font-family:var(--px);font-size:3.9cqw;background:#fffaf3;color:#3a2b38;border:2px solid #3a2b38;border-radius:4px;padding:.4cqw 1.8cqw;box-shadow:2px 2px 0 #3a2b38;white-space:nowrap}
.vl-reg.ok{background:#4f7a58;color:#fff}
.vl-est{position:absolute;width:29.2cqw;height:17.2%;transform:translateX(-50%);background:none;border:0;padding:0;cursor:pointer;font:inherit;color:#3a2b38;-webkit-tap-highlight-color:transparent}
.vl-est .vl-nm{position:absolute;left:50%;bottom:0;transform:translateX(-50%);font-family:var(--px);font-size:3.5cqw;background:#fffaf3;border:2px solid #3a2b38;border-radius:4px;padding:.2cqw 1.5cqw;white-space:nowrap}
.vl-est .vl-num{position:absolute;left:1cqw;top:9%;font-family:var(--px);font-size:3.3cqw;min-width:5.6cqw;height:5.6cqw;display:grid;place-items:center;background:#fff;border:2px solid #3a2b38;border-radius:3px}
.vl-est.feito .vl-num{background:#4f7a58;color:#fff}
.vl-est.aqui .vl-nm{background:#c23f5e;color:#fff}
.vl-est:focus-visible{outline:none}
.vl-est:focus-visible .vl-nm{outline:3px solid #b7a6dc;outline-offset:2px}
.vl-est.salao{width:44cqw;height:15%}
.vl-px{border:3px solid #3a2b38;border-radius:6px;box-shadow:4px 4px 0 #3a2b38;background:#fffaf3}
.vl-b{display:inline-block;font-family:"DotGothic16","Zen Maru Gothic",system-ui,sans-serif;font-size:15px;line-height:1.3;text-decoration:none;border:3px solid #3a2b38;border-radius:6px;background:#fff;color:#3a2b38;padding:7px 14px;box-shadow:3px 3px 0 #3a2b38;cursor:pointer}
.vl-b:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #3a2b38}
.vl-b.pri{background:#c23f5e;color:#fff}
.vl-b.ok{background:#4f7a58;color:#fff}
.vl-b.sm{font-size:16px;padding:0;border-width:2px;box-shadow:2px 2px 0 #3a2b38}
.vl-b:focus-visible{outline:3px solid #b7a6dc;outline-offset:3px}
.vl-folha{position:fixed;left:0;right:0;bottom:0;padding:0 10px max(12px,env(safe-area-inset-bottom,0px));transform:translateY(115%);transition:transform .25s;z-index:60;pointer-events:none;color:#3a2b38;visibility:hidden}
.vl-folha.aberta{transform:none;visibility:visible}
.vl-folha .vl-in{max-width:460px;margin:0 auto;padding:14px;display:grid;gap:8px;pointer-events:auto;position:relative}
.vl-folha .vl-rg{font-family:"DotGothic16",system-ui,sans-serif;font-size:12px;letter-spacing:.1em;color:#c23f5e;margin:0}
.vl-folha h2{font-family:"DotGothic16","Zen Maru Gothic",system-ui,sans-serif;font-weight:400;font-size:22px;margin:0;padding-right:40px}
.vl-folha p{margin:0;font-size:14.5px}
.vl-folha .vl-st{font-size:13px;color:#6b5a67}
.vl-folha .vl-ac{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
.vl-folha .vl-x{position:absolute;right:10px;top:10px;width:32px;height:32px}
@media (prefers-reduced-motion:reduce){.vl-folha{transition:none}}
`;
let inst=null;
function inicia(el,dados){
if(!document.getElementById('vl-css')){const st=document.createElement('style');st.id='vl-css';st.textContent=CSS;document.head.appendChild(st);}
el.classList.add('vila');
el.innerHTML='<canvas width="192" height="580" aria-hidden="true"></canvas><div class="vl-camada"></div>';
const COR=Object.assign({cabelo:'#2b2730',pele:'#d79f73',roupa:'#4f7a58'},dados.avatar||{});

const W=192,H=580;
const INK='#3a2b38',PINK='#c23f5e',BLUSH='#f8dde1',SAGE='#4f7a58',SAGEL='#a9c4a4',TAUPE='#816c5b',GOLD='#d9a93c',LAV='#b7a6dc',LAVL='#e6def5',CREAM='#fff7ea',WHITE='#ffffff',DARK='#5a4658',WOOD='#e9c9a8',LIT='#f9dc8c',GLASS='#cfe3e6';
const REG=['Chegada','Primeiros dias','Pela cidade','Encontros'];
const FLOR=['#a9c4a4','#f3b3c3','#ecc65a','#b7a6dc'];
const MAPAS=dados.mapas.map(m=>[m.slug,m.nome,m.desc,m.terr]);
const COLX=[40,96,152], rowPy=r=>98+r*120, SALAO_Y=550;
const ST=MAPAS.map((m,i)=>{const r=Math.floor(i/3),c=i%3;return {x:r%2?COLX[2-c]:COLX[c],py:rowPy(r),r};});
/* caminho: ziguezague com as curvas passando pelas bordas */
const PTS=[],SI=[];
for(let r=0;r<4;r++){
  for(let c=0;c<3;c++){const s=ST[r*3+c];PTS.push([s.x,s.py]);SI[r*3+c]=PTS.length-1;}
  const ex=r%2?6:186; PTS.push([ex,rowPy(r)]); PTS.push([ex,r<3?rowPy(r+1):SALAO_Y]);
}
PTS.push([96,SALAO_Y]); SI[12]=PTS.length-1;

const S={aula:dados.mapas.map(m=>!!m.aula),prova:dados.mapas.map(m=>!!m.prova),at:0};
const falta=()=>{const i=S.aula.findIndex((a,k)=>!(a&&S.prova[k]));return i<0?12:i;};
S.at=falta();
const reduz=matchMedia('(prefers-reduced-motion:reduce)').matches;
const cv=el.querySelector('canvas'),ctx=cv.getContext('2d');
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const g=bg.getContext('2d');

function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
let rnd=1;const rand=()=>{rnd=(rnd*16807)%2147483647;return rnd/2147483647;};

/* ---------- desenho do cenário (fica em cache) ---------- */
function desenhaFundo(){
  rnd=7;
  g.fillStyle='#e3ecdf';g.fillRect(0,0,W,H);
  for(let i=0;i<900;i++){g.fillStyle=rand()<.5?'#d5e2d0':'#edf3ea';g.fillRect(Math.floor(rand()*W),Math.floor(rand()*H),rand()<.3?2:1,1);}
  for(let r=1;r<4;r++){const y=10+r*120-2;g.fillStyle='#c9d8c4';for(let x=4;x<W-4;x+=6)g.fillRect(x,y,3,1);}
  /* caminho */
  const todos=S.prova.every(Boolean);
  for(let k=0;k<PTS.length-1;k++){
    let i=SI.findIndex(v=>v>=k+1); const ok=i===12?todos:S.prova[i];
    const [x0,y0]=PTS[k],[x1,y1]=PTS[k+1];
    const x=Math.min(x0,x1)-4,y=Math.min(y0,y1)-4,w=Math.abs(x1-x0)+8,h=Math.abs(y1-y0)+8;
    g.fillStyle=ok?'#c9b294':'#cfc6c4';g.fillRect(x-1,y-1,w+2,h+2);
    g.fillStyle=ok?'#fbeed8':'#efe8e4';g.fillRect(x,y,w,h);
  }
  for(let k=0;k<PTS.length-1;k++){
    let i=SI.findIndex(v=>v>=k+1); const ok=i===12?todos:S.prova[i];
    const [x0,y0]=PTS[k],[x1,y1]=PTS[k+1];
    const x=Math.min(x0,x1)-3,y=Math.min(y0,y1)-3,w=Math.abs(x1-x0)+6,h=Math.abs(y1-y0)+6;
    g.fillStyle=ok?'#fbeed8':'#efe8e4';g.fillRect(x,y,w,h);
    g.fillStyle=ok?'#ead7b8':'#e0d7d3';
    for(let a=x+1;a<x+w-1;a+=4)for(let b=y+1;b<y+h-1;b+=3)if(((a*7+b*13)%5)<2)g.fillRect(a+((b/3|0)%2),b,2,1);
    if(ok){ /* florzinhas na beira do caminho colorido */
      const r=Math.min(3,Math.floor((Math.min(y0,y1)-10)/120)),len=Math.abs(x1-x0)+Math.abs(y1-y0),hz=y0===y1;
      for(let d=8;d<len-4;d+=11){const s=(d/11|0)%2?6:-7;
        const fx=hz?Math.min(x0,x1)+d:x0+s, fy=hz?y0+(s>0?5:-7):Math.min(y0,y1)+d;
        if(hz&&s<0) continue; /* em cima ficam os prédios */
        g.fillStyle=FLOR[Math.max(1,r)];g.fillRect(fx,fy,2,2);g.fillStyle='#fff';g.fillRect(fx,fy,1,1);}
    }
  }
  /* árvores, prédios, postes */
  for(let r=0;r<4;r++){const py=rowPy(r);[68,124].forEach((tx,j)=>{
    const viz=ST.map((s,i)=>i).filter(i=>ST[i].r===r&&Math.abs(ST[i].x-tx)<40);
    arvore(tx,py-9,FLOR[r],viz.some(i=>S.prova[i]));});}
  MAPAS.forEach((m,i)=>{const s=ST[i];predio(i,s.x,s.py-8,S.prova[i]);poste(s.x+21,s.py-8,S.prova[i]);});
  salao(96,SALAO_Y-8,todos);
}
let P=c=>c;
const fade=c=>c===INK?'#aa9fa8':mix(c,'#f3eeea',.8);
function arvore(x,y,cor,ok){P=ok?c=>c:fade;
  g.fillStyle=P(INK);g.fillRect(x-6,y-18,12,12);g.fillRect(x-4,y-20,8,2);
  g.fillStyle=P(cor);g.fillRect(x-5,y-17,10,10);g.fillRect(x-3,y-19,6,2);
  g.fillStyle=P(mix(cor,'#ffffff',.45));g.fillRect(x-3,y-16,2,2);g.fillRect(x+1,y-13,2,1);
  g.fillStyle=P(TAUPE);g.fillRect(x-1,y-6,2,6);
}
function poste(x,y,ok){P=ok?c=>c:fade;
  g.fillStyle=P(INK);g.fillRect(x+2,y-14,1,14);g.fillRect(x,y-19,5,5);
  g.fillStyle=ok?LIT:'#f1ece8';g.fillRect(x+1,y-18,3,3);
}
function predio(i,cx,by,ok){
  P=ok?c=>c:fade; const X=cx-22,Y=by-48;
  const r=(dx,dy,w,h,c)=>{g.fillStyle=P(c);g.fillRect(X+dx,Y+dy,w,h);};
  const b=(dx,dy,w,h,c)=>{r(dx-1,dy-1,w+2,h+2,INK);r(dx,dy,w,h,c);};
  const win=(dx,dy,w,h)=>{r(dx-1,dy-1,w+2,h+2,INK);g.fillStyle=ok?LIT:'#eef3f3';g.fillRect(X+dx,Y+dy,w,h);if(ok){g.fillStyle='#fff3c9';g.fillRect(X+dx,Y+dy,1,h);}};
  switch(i){
  case 0: /* aeroporto */
    b(2,28,40,20,CREAM);win(5,32,34,5);r(2,28,40,2,LAV);b(19,40,6,8,TAUPE);
    b(33,10,5,18,WHITE);b(30,5,11,6,LAV);win(32,7,7,2);
    r(4,12,18,5,INK);r(5,13,16,3,WHITE);r(11,8,5,13,INK);r(12,9,3,11,LAVL);r(4,9,4,4,INK);r(5,10,2,3,PINK);r(19,14,2,1,GLASS);
    break;
  case 1: /* sinalização */
    r(20,8,3,40,INK);r(21,9,1,39,TAUPE);
    b(6,11,15,6,SAGE);r(8,13,9,2,WHITE);r(7,14,2,1,WHITE);
    b(23,19,15,6,PINK);r(26,21,9,2,WHITE);r(35,22,2,1,WHITE);
    b(8,27,13,6,GOLD);r(10,29,9,2,WHITE);
    r(37,32,1,16,INK);b(34,25,7,7,PINK);r(35,28,5,1,WHITE);
    r(14,44,16,4,INK);r(15,45,14,3,SAGEL);
    break;
  case 2: /* trens */
    b(2,17,40,5,SAGE);r(2,21,40,1,mix(SAGE,'#000000',.2));
    b(15,8,14,7,WHITE);r(18,11,8,1,PINK);
    r(4,23,2,25,INK);r(38,23,2,25,INK);
    b(8,28,28,16,CREAM);r(8,37,28,3,SAGE);win(11,30,6,5);win(19,30,6,5);win(27,30,6,5);
    r(11,45,5,3,INK);r(28,45,5,3,INK);r(8,43,28,1,TAUPE);
    break;
  case 3: /* hotel */
    b(8,7,28,41,BLUSH);b(6,4,32,3,PINK);
    for(let a=0;a<3;a++)for(let c=0;c<4;c++){ if(c===3&&a===1) continue; win(11+a*9,11+c*8,4,5);}
    b(17,40,10,8,TAUPE);r(21,40,1,8,INK);r(14,37,16,3,INK);r(15,38,14,2,PINK);
    break;
  case 4: /* konbini */
    b(3,24,38,24,WHITE);r(3,24,38,3,SAGE);r(3,27,38,2,PINK);
    b(14,15,16,8,CREAM);r(17,18,10,2,SAGE);
    win(6,33,14,11);win(24,33,12,15);r(30,33,1,15,INK);r(6,45,14,3,SAGEL);
    break;
  case 5: /* restaurante */
    b(6,20,32,28,WOOD);b(3,14,38,6,DARK);r(3,18,38,1,INK);
    r(11,29,22,19,INK);r(12,37,20,11,DARK);r(12,30,20,7,PINK);r(18,31,1,6,mix(PINK,'#000000',.3));r(25,31,1,6,mix(PINK,'#000000',.3));r(14,32,2,2,WHITE);r(21,32,2,2,WHITE);r(28,32,2,2,WHITE);
    r(1,24,1,3,INK);b(0,27,4,7,PINK);if(ok){g.fillStyle=LIT;g.fillRect(X+1,Y+29,2,3);}
    win(8,23,5,4);
    break;
  case 6: /* horas: torre do relógio */
    b(15,8,14,40,CREAM);b(13,5,18,3,PINK);b(17,2,10,3,PINK);r(21,0,2,2,INK);
    b(17,11,10,10,WHITE);r(21,13,1,4,INK);r(22,16,3,1,INK);r(21,12,1,1,PINK);
    win(19,26,6,6);b(19,39,6,9,TAUPE);
    r(6,42,8,6,INK);r(7,43,6,5,SAGEL);r(30,42,8,6,INK);r(31,43,6,5,SAGEL);
    break;
  case 7: /* compras */
    b(5,22,34,26,CREAM);b(4,17,36,6,WHITE);for(let a=0;a<7;a+=2)r(4+a*5+ (a?1:0),17,5,6,GOLD);r(4,23,36,1,INK);
    win(8,28,13,13);r(12,35,6,6,PINK);r(14,35,2,6,GOLD);r(12,37,6,1,GOLD);r(13,33,4,2,GOLD);
    b(26,29,9,19,TAUPE);r(33,38,1,2,GOLD);
    break;
  case 8: /* roupas */
    b(5,16,34,32,LAVL);b(3,12,38,4,LAV);
    win(8,21,16,22);r(15,24,2,2,TAUPE);r(13,26,6,5,PINK);r(12,31,8,7,PINK);r(15,38,2,5,TAUPE);r(12,31,8,1,mix(PINK,'#000000',.25));
    b(28,29,8,19,WHITE);r(29,38,1,2,GOLD);r(28,25,8,2,LAV);
    break;
  case 9: /* apresentação: pracinha */
    r(19,28,6,20,INK);r(20,29,4,19,TAUPE);
    r(9,5,26,25,INK);r(12,3,20,2,INK);r(10,6,24,23,'#f3b3c3');r(13,4,18,2,'#f3b3c3');
    r(13,9,3,3,'#fbd9e1');r(24,13,3,2,'#fbd9e1');r(17,20,2,2,'#fbd9e1');
    b(2,41,13,3,TAUPE);r(3,44,2,4,INK);r(12,44,2,4,INK);
    b(29,41,13,3,TAUPE);r(30,44,2,4,INK);r(39,44,2,4,INK);
    if(ok){b(1,29,9,7,WHITE);r(3,31,1,2,PINK);r(5,31,1,2,PINK);r(7,31,1,2,PINK);b(34,29,9,7,WHITE);r(36,32,5,1,SAGE);}
    break;
  case 10: /* planos: cinema */
    b(4,19,36,29,DARK);b(2,10,40,9,CREAM);r(7,13,30,3,PINK);
    for(let a=0;a<8;a++){g.fillStyle=ok?LIT:'#e9e2dd';g.fillRect(X+4+a*5,Y+11,2,1);g.fillRect(X+4+a*5,Y+17,2,1);}
    b(8,25,8,12,PINK);r(10,27,4,4,GOLD);b(28,25,8,12,LAV);r(30,29,4,4,WHITE);
    b(18,32,8,16,TAUPE);r(22,32,1,16,INK);
    break;
  case 11: /* emergência: posto */
    b(8,24,28,24,WHITE);b(6,20,32,4,'#7d6bb0');
    r(19,12,6,8,INK);r(20,13,4,7,PINK);if(ok){g.fillStyle='#ff9db0';g.fillRect(X+21,Y+14,2,3);}
    r(21,26,2,6,PINK);r(19,28,6,2,PINK);
    win(11,31,5,6);win(28,31,5,6);b(18,36,8,12,TAUPE);
    break;
  }
}
function salao(cx,by,todos){
  P=c=>c; const X=cx-32,Y=by-52;
  const r=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(X+dx,Y+dy,w,h);};
  const b=(dx,dy,w,h,c)=>{r(dx-1,dy-1,w+2,h+2,INK);r(dx,dy,w,h,c);};
  b(0,24,64,28,CREAM);b(-2,20,68,4,PINK);
  b(16,9,32,11,LAV);b(22,4,20,5,LAV);r(24,6,6,2,LAVL);
  r(29,-6,6,6,INK);r(30,-5,4,4,GOLD);r(26,-3,12,1,INK);r(31,1,2,3,INK);
  [5,15,45,55].forEach(x=>{b(x,27,4,25,WHITE);});
  b(25,30,14,22,todos?LIT:BLUSH);r(31,30,1,22,INK);r(26,31,5,1,'#ffffff');
  r(10,32,3,6,INK);r(11,33,1,4,todos?LIT:GLASS);r(51,32,3,6,INK);r(52,33,1,4,todos?LIT:GLASS);
}

/* ---------- camada HTML: nomes e botões ---------- */
const camada=el.querySelector('.vl-camada');
function montaCamada(){
  let h='';
  for(let r=0;r<4;r++){const ok=[0,1,2].every(c=>S.prova[r*3+c]);
    h+=`<span class="vl-reg${ok?' ok':''}" style="top:${((10+r*120+3)/H*100).toFixed(2)}%">${r+1} · ${REG[r]}${ok?' ✓':''}</span>`;}
  MAPAS.forEach((m,i)=>{const s=ST[i];const est=S.prova[i]?'carimbado':S.aula[i]?'falta a prova':'a fazer';
    h+=`<button class="vl-est${S.prova[i]?' feito':''}${S.at===i?' aqui':''}" data-i="${i}" style="left:${(s.x/W*100).toFixed(2)}%;top:${((s.py-78)/H*100).toFixed(2)}%" aria-label="Mapa ${i+1}, ${m[1]}: ${est}"><span class="vl-num">${S.prova[i]?'✓':i+1}</span><span class="vl-nm">${m[1]}</span></button>`;});
  h+=`<button class="vl-est salao${S.at===12?' aqui':''}" data-i="12" style="left:50%;top:${((SALAO_Y-64)/H*100).toFixed(2)}%" aria-label="Planeta Utopia, o Salão: sempre aberto"><span class="vl-nm">Salão · Planeta Utopia</span></button>`;
  camada.innerHTML=h;
}
camada.addEventListener('click',e=>{const b=e.target.closest('.vl-est');if(!b)return;irPara(+b.dataset.i);});

/* ---------- avatar ---------- */
const AV={pos:SI[S.at],alvo:SI[S.at],x:PTS[SI[S.at]][0],y:PTS[SI[S.at]][1],andando:false,dest:S.at};
function irPara(i){
  AV.dest=i;AV.alvo=SI[i];
  if(reduz){AV.pos=AV.alvo;[AV.x,AV.y]=PTS[AV.pos];chegou();return;}
  if(Math.abs(AV.x-PTS[AV.alvo][0])+Math.abs(AV.y-PTS[AV.alvo][1])<1){chegou();return;}
  AV.andando=true;fechaFolha(true);
}
function chegou(){AV.andando=false;S.at=AV.dest;montaCamada();abreFolha(AV.dest);}
function passo(dt){
  if(!AV.andando)return;
  let resta=95*dt;
  while(resta>0){
    /* próximo ponto do caminho na direção do alvo */
    let prox=AV.pos;
    if(Math.abs(AV.x-PTS[AV.pos][0])+Math.abs(AV.y-PTS[AV.pos][1])<.01){ if(AV.pos===AV.alvo){chegou();return;} prox=AV.pos+(AV.alvo>AV.pos?1:-1); AV.pos=prox; }
    const [tx,ty]=PTS[prox],dx=tx-AV.x,dy=ty-AV.y,d=Math.abs(dx)+Math.abs(dy);
    if(d<=resta){AV.x=tx;AV.y=ty;resta-=d;if(prox===AV.alvo){chegou();return;}}
    else{AV.x+=Math.sign(dx)*Math.min(resta,Math.abs(dx));AV.y+=Math.sign(dy)*Math.min(resta,Math.abs(dy));resta=0;}
  }
}
function boneco(t){
  const x=Math.round(AV.x),y=Math.round(AV.y)+2,f=AV.andando&&Math.floor(t*8)%2;
  const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
  ctx.globalAlpha=.25;R(-5,-1,10,2,INK);ctx.globalAlpha=1;
  if(f){R(-3,-5,2,4,INK);R(1,-4,2,3,INK);}else{R(-3,-4,2,4,INK);R(1,-4,2,4,INK);}
  R(-5,-11,10,7,INK);R(-4,-10,8,6,COR.roupa);R(-5,-9,1,4,COR.pele);R(4,-9,1,4,COR.pele);
  R(-5,-20,10,10,INK);R(-4,-17,8,6,COR.pele);R(-4,-19,8,3,COR.cabelo);R(-4,-16,1,2,COR.cabelo);R(3,-16,1,2,COR.cabelo);
  R(-2,-15,1,2,INK);R(1,-15,1,2,INK);R(-3,-13,1,1,'#e78a9b');R(2,-13,1,1,'#e78a9b');
}

/* ---------- animação ---------- */
const brilho=[];
function estoura(i){const s=i<12?ST[i]:{x:96,py:SALAO_Y};for(let k=0;k<26;k++){const a=Math.random()*6.28,v=20+Math.random()*45;brilho.push({x:s.x,y:s.py-30,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,t:0,c:[PINK,GOLD,LAV,'#ffffff'][k%4]});}}
const petalas=Array.from({length:28},(_,k)=>({r:k%4,x:Math.random()*W,y:Math.random()*118,v:6+Math.random()*8,f:Math.random()*6}));
let ult=0;
function quadro(ms){
  const t=ms/1000,dt=Math.min(.05,t-ult||0);ult=t;
  passo(dt);
  ctx.drawImage(bg,0,0);
  /* luz dos postes acesos */
  MAPAS.forEach((m,i)=>{if(!S.prova[i])return;const s=ST[i];ctx.globalAlpha=.16+.08*Math.sin(t*3+i);ctx.fillStyle=LIT;ctx.fillRect(s.x+19,s.py-29,9,9);ctx.fillRect(s.x+21,s.py-31,5,13);ctx.globalAlpha=1;});
  /* pétalas nas regiões completas */
  if(!reduz) petalas.forEach(p=>{if(![0,1,2].every(c=>S.prova[p.r*3+c]))return;
    p.y=(p.y+p.v*dt)%118;const px=(p.x+Math.sin(t+p.f)*6+W)%W;ctx.fillStyle=p.r?FLOR[p.r]:'#ffffff';ctx.fillRect(Math.round(px),Math.round(10+p.r*120+p.y),2,1);});
  /* seta no próximo passo */
  const prox=falta();
  if(prox<12&&prox!==S.at&&!AV.andando){const s=ST[prox],yy=s.py-62+Math.round(Math.sin(t*5)*1.5);ctx.fillStyle=INK;ctx.fillRect(s.x-4,yy-1,9,4);ctx.fillRect(s.x-2,yy+3,5,2);ctx.fillRect(s.x,yy+5,1,1);ctx.fillStyle=PINK;ctx.fillRect(s.x-3,yy,7,2);ctx.fillRect(s.x-1,yy+2,3,2);}
  boneco(t);
  for(let k=brilho.length-1;k>=0;k--){const b=brilho[k];b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=70*dt;if(b.t>.9){brilho.splice(k,1);continue;}ctx.fillStyle=b.c;ctx.fillRect(Math.round(b.x),Math.round(b.y),2,2);}
  requestAnimationFrame(quadro);
}

/* ---------- folha de baixo ---------- */
let folha=document.getElementById('vl-folha');
if(!folha){folha=document.createElement('div');folha.id='vl-folha';folha.className='vl-folha';folha.setAttribute('role','dialog');folha.setAttribute('aria-labelledby','vl-f-t');
  folha.innerHTML='<div class="vl-in vl-px"><button type="button" class="vl-b sm vl-x" id="vl-f-x" aria-label="Fechar">×</button><p class="vl-rg" id="vl-f-rg"></p><h2 id="vl-f-t"></h2><p id="vl-f-d"></p><p class="vl-st" id="vl-f-st"></p><div class="vl-ac" id="vl-f-ac"></div></div>';
  document.body.appendChild(folha);}
const $=id=>document.getElementById('vl-'+id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let aberta=-1;
function abreFolha(i){
  aberta=i;
  if(i===12){$('f-rg').textContent='FIM DO CAMINHO';$('f-t').textContent='O Salão';$('f-d').textContent='O lugar onde os aventureiros se encontram. Sempre aberto.';
    $('f-st').textContent=S.prova.every(Boolean)?'Você chegou com os 12 carimbos.':'Dá para entrar a qualquer hora, mesmo sem todos os carimbos.';
    $('f-ac').innerHTML='<a class="vl-b pri" href="/idiomas/planeta-utopia/salao/">Entrar no Salão</a>';}
  else{const m=MAPAS[i],a=S.aula[i],p=S.prova[i];
    $('f-rg').textContent=`REGIÃO ${ST[i].r+1} · ${REG[ST[i].r].toUpperCase()}`;$('f-t').textContent=`${i+1} · ${m[1]}`;$('f-d').textContent=m[2];
    $('f-st').textContent=p?(a?'Carimbado ✓ Este lugar já está colorido.':'Carimbado ✓ Falta só rever a aula.'):a?'Aula feita. Falta a prova para ganhar o carimbo.':'A fazer: primeiro a aula, depois a prova.';
    $('f-ac').innerHTML=`<a class="vl-b ${a?'ok':'pri'}" href="/idiomas/mapas/${esc(m[0])}/aula/">${a?'Aula ✓':'Aula'}</a><a class="vl-b ${p?'ok':(a?'pri':'')}" href="/idiomas/planeta-utopia/?lang=ja&terr=${esc(m[3])}&from=trilha">${p?'Prova ✓':'Prova'}</a>`+(p?`<button type="button" class="vl-b" data-a="prox">${i<11?'Próximo lugar →':'Ir ao Salão →'}</button>`:'');}
  folha.classList.add('aberta');
}
function fechaFolha(){folha.classList.remove('aberta');aberta=-1;}
$('f-x').onclick=fechaFolha;
$('f-ac').onclick=e=>{const b=e.target.closest('button[data-a="prox"]');if(b&&aberta>=0&&aberta<12)irPara(aberta+1);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&aberta>=0)fechaFolha();});

desenhaFundo();montaCamada();requestAnimationFrame(quadro);
return {atualiza(d){const antes=S.prova.slice();S.aula=d.mapas.map(m=>!!m.aula);S.prova=d.mapas.map(m=>!!m.prova);desenhaFundo();montaCamada();if(aberta>=0)abreFolha(aberta);
  if(!reduz)S.prova.forEach((v,k)=>{if(v&&!antes[k])estoura(k);});}};
}
window.VilaTrilha={render(el,dados){ if(inst&&inst.el===el&&el.querySelector('canvas')){inst.api.atualiza(dados);} else {inst={el,api:inicia(el,dados)};} }};
})();
