/* Unirversos · Planeta Utopia — desenho do avatar (compartilhado pelo Ateliê, pelo jogo e pelos mapas).
   Uso: UtopiaAvatar.svg(sel, {viewBox:'30 30 180 180'}) devolve um <svg> pronto.
   O avatar salvo fica em localStorage['utopiaAvatar1'] = {sel, profile, learned}. */
(function(){
const HEX={'kuro': '#2b2730', 'chairo': '#7a4b2a', 'kiniro': '#d9a93c', 'aka': '#d2463f', 'ao': '#3e6fc4', 'shiro': '#f2efe9', 'pinku': '#f19bb5', 'murasaki': '#8a62b8', 'midori': '#4f9a6a'};
const SKINS=['#fbe3d2','#f3cfb3','#e9b98f','#d79f73','#b97c52','#93603d','#6b4428','#4a2e1c'];
const DEFAULT={hair:'mijikai',hairColor:'kuro',face:'egao',clothes:'parka',clothColor:'midori',acc:[],traits:[],bg:'sora',skin:3,age:20};
let S=DEFAULT;
const has=id=>(S.acc||[]).includes(id)||(S.traits||[]).includes(id);

function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;
  const c=v=>Math.max(0,Math.min(255,v));return '#'+((1<<24)+(c(r)<<16)+(c(g)<<8)+c(b)).toString(16).slice(1);}
const INK='#3a2b38', MOUTH='#8c3d4c';
const BODY='M44 300 C46 238 70 214 120 212 C170 214 194 238 196 300 Z';

function drawBg(id){
  if(id==='sora') return `<rect width="240" height="300" fill="#bfe0f2"/>
    <g fill="#fff" opacity=".9"><ellipse cx="50" cy="60" rx="32" ry="12"/><ellipse cx="68" cy="52" rx="20" ry="13"/><ellipse cx="190" cy="100" rx="30" ry="10"/><ellipse cx="200" cy="93" rx="16" ry="10"/></g>`;
  if(id==='umi') return `<rect width="240" height="300" fill="#d4ecf5"/><circle cx="190" cy="60" r="20" fill="#f7d77a"/>
    <path d="M0 215 Q30 205 60 215 T120 215 T180 215 T240 215 V300 H0Z" fill="#5aa6c9"/><path d="M0 240 Q30 230 60 240 T120 240 T180 240 T240 240 V300 H0Z" fill="#4a90b4"/>`;
  if(id==='sakura'){ let p=''; [[30,0],[80,2.2],[150,4.1],[205,1.3],[110,5.6],[180,3.2]].forEach(([x,d])=>{p+=`<ellipse class="petal" style="animation-delay:-${d}s" cx="${x}" cy="0" rx="5" ry="3" fill="#f4a6bf"/>`});
    return `<rect width="240" height="300" fill="#fbe3ea"/><path d="M0 40 Q60 30 90 60 M50 36 Q60 10 80 8" stroke="#8b5e4a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#f4a6bf"><circle cx="90" cy="60" r="9"/><circle cx="80" cy="8" r="8"/><circle cx="30" cy="34" r="8"/><circle cx="64" cy="44" r="6"/></g>${p}`; }
  if(id==='yoru'){ let s=''; [[30,40],[70,90],[200,40],[180,130],[40,160],[215,200],[120,30]].forEach(([x,y],i)=>{s+=`<circle class="twinkle" style="animation-delay:${i*.3}s" cx="${x}" cy="${y}" r="2" fill="#fff6c8"/>`});
    return `<rect width="240" height="300" fill="#2a2850"/><circle cx="185" cy="68" r="22" fill="#f6e7a8"/><circle cx="196" cy="60" r="20" fill="#2a2850"/>${s}`; }
  return `<rect width="240" height="300" fill="#e6efe3"/><path d="M0 240 L70 120 L130 210 L180 150 L240 230 V300 H0Z" fill="#8fae95"/>
    <path d="M52 151 L70 120 L88 151 L79 145 L70 152 L61 145Z" fill="#fff"/><circle cx="200" cy="54" r="16" fill="#f3c97a"/>`;
}

function curls(cx,cy,r,from,to,step,size,fill){let s='';for(let a=from;a<=to;a+=step){const t=a*Math.PI/180;s+=`<circle cx="${(cx+r*Math.cos(t)).toFixed(1)}" cy="${(cy+r*Math.sin(t)).toFixed(1)}" r="${size}" fill="${fill}"/>`;}return s;}

function drawHairBack(style,h){
  const d=shade(h,-18);
  if(style==='nagai') return `<path d="M58 120 C48 190 50 250 72 268 L168 268 C190 250 192 190 182 120 Z" fill="${d}"/>`;
  if(style==='pony') return `<path d="M164 92 C214 92 226 172 198 222 C202 172 186 130 158 112 Z" fill="${d}"/>`;
  if(style==='odango') return `<circle cx="120" cy="50" r="25" fill="${h}"/><path d="M106 70 Q120 62 134 70" stroke="${d}" stroke-width="3" fill="none"/>`;
  if(style==='kurukuru') return curls(120,124,64,190,350,20,21,d)+curls(120,150,66,10,170,40,18,d);
  if(style==='afuro') return `<circle cx="120" cy="112" r="80" fill="${d}"/>`+curls(120,112,80,0,345,15,15,d);
  return '';
}
function drawHairFront(style,h){
  const d=shade(h,-22);
  const cap=`<path d="M60 134 C56 74 88 56 120 56 C152 56 184 74 180 134 C172 108 158 96 140 92 C130 106 110 108 92 100 C80 108 68 120 60 134 Z" fill="${h}"/>
    <path d="M92 100 C110 108 130 106 140 92" stroke="${d}" stroke-width="2" fill="none" opacity=".5"/>`;
  let extra='';
  if(style==='nagai') extra=`<path d="M60 126 C54 182 58 228 74 252 C82 232 80 182 76 142 Z" fill="${h}"/><path d="M180 126 C186 182 182 228 166 252 C158 232 160 182 164 142 Z" fill="${h}"/>`;
  if(style==='pony') extra=`<circle cx="166" cy="94" r="7" fill="#e5607e"/>`;
  if(style==='odango') extra=`<ellipse cx="120" cy="72" rx="16" ry="5" fill="#e5607e"/>`;
  if(style==='kurukuru') return cap+curls(120,112,54,200,340,20,15,h);
  if(style==='afuro') return cap+curls(120,108,58,190,350,13,13,h);
  if(style==='bouzu') return `<path d="M62 124 C60 66 92 60 120 60 C148 60 180 66 178 124 C170 100 150 88 120 88 C90 88 70 100 62 124 Z" fill="${h}" opacity=".88"/>`;
  if(style==='mitsuami'){ const braid=x=>{let b='';for(let y=146,i=0;y<=242;y+=16,i++) b+=`<ellipse cx="${x+(i%2?2:-2)}" cy="${y}" rx="9" ry="11" fill="${i%2?h:d}"/>`;return b+`<circle cx="${x}" cy="256" r="6" fill="#e5607e"/>`;};
    extra=braid(66)+braid(174); }
  if(style==='mijikai') extra=`<path d="M62 128 C60 140 62 150 66 156 C68 144 68 136 70 126 Z" fill="${h}"/><path d="M178 128 C180 140 178 150 174 156 C172 144 172 136 170 126 Z" fill="${h}"/>`;
  return extra+cap;
}
function drawBody(cl,c,s){
  const d=shade(c,-30), lt=shade(c,40);
  let x='';
  if(cl==='tshirt') x=`<path d="M101 211 Q120 238 139 211 Z" fill="${s}"/><path d="M70 238 L76 300 M170 238 L164 300" stroke="${d}" stroke-width="2" opacity=".5"/>`;
  if(cl==='parka') x=`<path d="M101 211 Q120 236 139 211 Z" fill="${s}"/><path d="M82 214 Q120 254 158 214" stroke="${d}" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M110 238 L108 270 M130 238 L132 270" stroke="${lt}" stroke-width="3" stroke-linecap="round"/><rect x="86" y="264" width="68" height="30" rx="12" fill="none" stroke="${d}" stroke-width="2.5"/>`;
  if(cl==='seetaa') x=`<rect x="102" y="194" width="36" height="26" rx="9" fill="${shade(c,-12)}"/>`+[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>`<path d="M${56+i*10} 284 V300" stroke="${d}" stroke-width="2" opacity=".5"/>`).join('');
  if(cl==='suutsu') x=`<path d="M103 211 L120 252 L137 211 Z" fill="#f7f2ea"/><path d="M98 212 L114 266 M142 212 L126 266" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <g fill="${d}"><circle cx="120" cy="272" r="3"/><circle cx="120" cy="288" r="3"/></g>`;
  if(cl==='kimono'){const obi=c==='#d9a93c'?'#8a62b8':'#d9a93c';
    x=`<path d="M102 211 L120 252 L138 211 Z" fill="${s}"/><path d="M96 212 L128 262" stroke="#f7f2ea" stroke-width="9"/><path d="M144 212 L116 254" stroke="#f7f2ea" stroke-width="9"/>
    <rect x="40" y="262" width="160" height="22" fill="${obi}"/><rect x="40" y="270" width="160" height="4" fill="${shade(obi,-30)}"/>`;}
  if(cl==='wanpiisu') x=`<path d="M101 211 Q120 236 139 211 Z" fill="${s}"/><ellipse cx="106" cy="218" rx="15" ry="8" fill="#f7f2ea"/><ellipse cx="134" cy="218" rx="15" ry="8" fill="#f7f2ea"/>
    <g fill="${lt}"><circle cx="120" cy="244" r="3.5"/><circle cx="120" cy="262" r="3.5"/><circle cx="120" cy="280" r="3.5"/></g>`;
  return `<rect x="106" y="174" width="28" height="44" rx="10" fill="${s}"/><rect x="106" y="174" width="28" height="12" fill="${shade(s,-20)}" opacity=".35"/>
    <path d="${BODY}" fill="${c}"/><g clip-path="url(#bodyclip)">${x}</g>`;
}
function drawHead(s){ return `<ellipse cx="62" cy="138" rx="9" ry="12" fill="${shade(s,-10)}"/><ellipse cx="178" cy="138" rx="9" ry="12" fill="${shade(s,-10)}"/><ellipse cx="120" cy="128" rx="58" ry="62" fill="${s}"/>`; }
function eyeOpen(x,r){return `<circle cx="${x}" cy="136" r="${r}" fill="${INK}"/><circle cx="${x+2.5}" cy="133" r="2.4" fill="#fff"/>`;}
function drawFace(f){
  const blush=(has('hoppe')?`<ellipse cx="84" cy="154" rx="10" ry="6" fill="#f19bb5" opacity=".55"/><ellipse cx="156" cy="154" rx="10" ry="6" fill="#f19bb5" opacity=".55"/>`:'')
    +(f==='bikkuri'||f==='okoru'?'':`<path d="M88 118 Q98 114 108 117 M132 117 Q142 114 152 118" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`);
  const st=`stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"`;
  if(f==='egao') return blush+`<path d="M88 138 Q98 127 108 138" ${st}/><path d="M132 138 Q142 127 152 138" ${st}/><path d="M108 158 Q120 172 132 158" ${st}/>`;
  if(f==='bikkuri') return blush+eyeOpen(98,7)+eyeOpen(142,7)+`<path d="M88 116 Q98 110 108 116" ${st} stroke-width="3"/><path d="M132 116 Q142 110 152 116" ${st} stroke-width="3"/><ellipse cx="120" cy="166" rx="7" ry="9" fill="${MOUTH}"/>`;
  if(f==='nemui') return blush+`<path d="M88 135 Q98 142 108 135" ${st}/><path d="M132 135 Q142 142 152 135" ${st}/><path d="M113 163 Q120 166 127 163" ${st} stroke-width="3"/>
    <text class="zz" x="168" y="96" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="${INK}">z</text>`;
  if(f==='uinku') return blush+eyeOpen(98,7)+`<path d="M132 137 Q142 128 152 137" ${st}/><path d="M108 156 Q120 174 132 156 Z" fill="${MOUTH}"/>`;
  return blush+`<path d="M86 118 L108 127" ${st}/><path d="M154 118 L132 127" ${st}/>`+eyeOpen(98,5.5)+eyeOpen(142,5.5)+`<path d="M110 167 Q120 159 130 167" ${st}/>
    <g stroke="#d2463f" stroke-width="3" stroke-linecap="round"><path d="M160 80 l8 0 M164 76 l0 8"/></g>`;
}
function drawTraitsFace(h){
  let t='';
  if(has('hige')) t+=`<path d="M68 148 C70 204 100 198 120 198 C140 198 170 204 172 148 C166 176 148 184 120 184 C92 184 74 176 68 148 Z" fill="${h}"/><path d="M104 154 Q120 148 136 154 Q128 158 120 156 Q112 158 104 154Z" fill="${h}"/>`;
  if(has('sobakasu')) t+=`<g fill="#a8653f" opacity=".55">${[[80,146],[87,150],[78,154],[86,157],[154,146],[161,150],[152,154],[160,157]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>`;
  if(has('hokuro')) t+=`<circle cx="136" cy="172" r="2.2" fill="${INK}"/>`;
  return t;
}
function drawWheelchair(){
  const wheel=x=>`<g stroke="#4a4652" fill="none"><circle cx="${x}" cy="292" r="44" stroke-width="7"/><circle cx="${x}" cy="292" r="36" stroke-width="2.5" stroke="#8f8a99"/>${[0,45,90,135].map(a=>`<path d="M${x} 292 l${(36*Math.cos(a*Math.PI/180)).toFixed(1)} ${(36*Math.sin(a*Math.PI/180)).toFixed(1)} M${x} 292 l${(-36*Math.cos(a*Math.PI/180)).toFixed(1)} ${(-36*Math.sin(a*Math.PI/180)).toFixed(1)}" stroke-width="2"/>`).join('')}</g><circle cx="${x}" cy="292" r="5" fill="#4a4652"/>`;
  return `<path d="M40 232 L40 300 M200 232 L200 300" stroke="#4a4652" stroke-width="6" stroke-linecap="round"/><path d="M30 232 L50 232 M190 232 L210 232" stroke="#4a4652" stroke-width="6" stroke-linecap="round"/>`+wheel(28)+wheel(212);
}
function drawAcc(a){
  if(a==='hijabu') return `<path fill-rule="evenodd" fill="#3f8f8a" d="M44 142 C40 58 88 48 120 48 C152 48 200 58 196 142 C196 196 182 222 156 232 L84 232 C58 222 44 196 44 142 Z M74 136 a46 52 0 1 0 92 0 a46 52 0 1 0 -92 0 Z"/><path d="M76 120 C90 84 150 84 164 120" stroke="#2f716d" stroke-width="3" fill="none" opacity=".6"/>`;
  if(a==='nekutai') return `<path d="M114 214 L126 214 L123 222 L130 262 L120 274 L110 262 L117 222 Z" fill="#3e6fc4"/><path d="M114 214 L126 214 L123 222 L117 222 Z" fill="#2f5aa3"/>`;
  if(a==='hochouki') return `<path d="M182 124 C196 128 194 152 184 156" stroke="#e5607e" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="180" cy="140" r="3.5" fill="#c94a68"/>`;
  if(a==='megane') return `<g fill="#fff" fill-opacity=".18" stroke="${INK}" stroke-width="3"><circle cx="98" cy="136" r="14"/><circle cx="142" cy="136" r="14"/></g>
    <path d="M112 134 Q120 129 128 134 M84 133 L64 128 M156 133 L176 128" stroke="${INK}" stroke-width="3" fill="none"/>`;
  if(a==='boushi') return `<ellipse cx="114" cy="74" rx="66" ry="22" fill="#7d6bb3"/><ellipse cx="114" cy="70" rx="58" ry="16" fill="#9584c8"/><rect x="110" y="44" width="8" height="12" rx="4" fill="#7d6bb3"/>`;
  if(a==='ribon') return `<g transform="translate(158 80)"><path d="M0 0 L-24 -14 L-22 14 Z" fill="#e5607e"/><path d="M0 0 L24 -14 L22 14 Z" fill="#e5607e"/><circle r="6" fill="#c94a68"/></g>`;
  if(a==='heddohon') return `<path d="M58 132 C58 44 182 44 182 132" stroke="#3a3340" stroke-width="9" fill="none"/><rect x="46" y="116" width="20" height="38" rx="9" fill="#f19bb5"/><rect x="174" y="116" width="20" height="38" rx="9" fill="#f19bb5"/>`;
  return '';
}

let clipN=0;
function markup(sel,opt){
  opt=opt||{}; S=Object.assign({},DEFAULT,sel||{}); S.acc=S.acc||[]; S.traits=S.traits||[];
  const clip='uabody'+(++clipN), changed=opt.changed||null, h=HEX[S.hairColor]||HEX.kuro, c=HEX[S.clothColor]||HEX.midori, s=SKINS[S.skin]||SKINS[3];
  const cls=k=>changed===k?(k==='bg'?'ua-fade':'ua-pop'):''; const hij=S.acc.includes('hijabu');
  return `<defs><clipPath id="${clip}"><path d="${BODY}"/></clipPath></defs>
   ${opt.noBg?'':`<g class="${cls('bg')}">${drawBg(S.bg)}</g>`}
   <g class="${opt.still?'':'char'}">
    <g class="${cls('hair')}">${hij?'':drawHairBack(S.hair,h)}</g>
    <g class="${cls('trait')}">${has('kurumaisu')?drawWheelchair():''}</g>
    <g class="${cls('body')}">${drawBody(S.clothes,c,s).replace('url(#bodyclip)','url(#'+clip+')')}</g>
    <g class="${cls('skin')}">${drawHead(s)}</g>
    <g class="${cls('face')}">${drawFace(S.face)}</g>
    <g class="${cls('trait')}">${drawTraitsFace(h)}</g>
    <g class="${cls('hair')}">${hij?'':drawHairFront(S.hair,h)}</g>
    <g class="${cls('acc')}">${(hij?['hijabu']:[]).concat(S.acc.filter(a=>a!=='hijabu'),has('hochouki')&&!hij?['hochouki']:[]).map(drawAcc).join('')}</g>
   </g>`;
}
function svg(sel,opt){ opt=opt||{}; return `<svg viewBox="${opt.viewBox||'0 0 240 300'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opt.label||'Avatar'}" style="display:block;width:100%;height:100%">${markup(sel,opt)}</svg>`; }
const TITLES=[['見習い旅人','みならい たびびと','aprendiz de viagem'],['駆け出し冒険者','かけだし ぼうけんしゃ','iniciante na aventura'],['言葉の探検家','ことばの たんけんか','quem explora palavras'],['ユートピアの案内人','ユートピアの あんないにん','guia de Utopia'],['言葉の魔法使い','ことばの まほうつかい','mestre das palavras'],['伝説の旅人','でんせつの たびびと','lenda das viagens']];
function title(level){ return TITLES[Math.max(0,Math.min(TITLES.length-1,(level||1)-1))]; }
function titleHTML(level){ const t=title(level); return `<ruby>${t[0]}<rt>${t[1]}</rt></ruby>`; }
const KEY='utopiaAvatar1';
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; } }
function save(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} }
function injectCSS(){ if(document.getElementById('ua-css')) return; const st=document.createElement('style'); st.id='ua-css'; st.textContent='\n.ua-pop{animation:uaPop .5s cubic-bezier(.3,1.6,.5,1);transform-box:fill-box;transform-origin:center}\n.ua-fade{animation:uaFade .5s ease}\n@keyframes uaPop{0%{transform:scale(.55);opacity:0}100%{transform:scale(1);opacity:1}}\n@keyframes uaFade{from{opacity:0}}\n.char{animation:uaBob 3.4s ease-in-out infinite}\n@keyframes uaBob{50%{transform:translateY(-4px)}}\n.petal{animation:uaFall 7s linear infinite}\n@keyframes uaFall{from{transform:translate(0,-40px) rotate(0)}to{transform:translate(-30px,340px) rotate(260deg)}}\n.twinkle{animation:uaTw 2.4s ease-in-out infinite}\n@keyframes uaTw{50%{opacity:.25}}\n.zz{animation:uaZz 2.2s ease-in-out infinite}\n@keyframes uaZz{from{opacity:0;transform:translate(0,6px)}50%{opacity:1}to{opacity:0;transform:translate(8px,-10px)}}\n@media (prefers-reduced-motion:reduce){.ua-pop,.ua-fade,.char,.petal,.twinkle,.zz{animation:none!important}}\n'; document.head.appendChild(st); }
window.UtopiaAvatar={markup,svg,load,save,injectCSS,title,titleHTML,KEY,HEX,SKINS,DEFAULT,TITLES};
})();
