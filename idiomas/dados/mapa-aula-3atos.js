/* Motor gamificado dos 12 mapas de contexto — Fluxo direto de 3 Atos (Quadrado Elemental):
   Ato 1 (💧 Água): Explorar Hotspots na cena → Ato 2 (🔥 Fogo): Agir no diálogo → Ato 3 (🌱 Terra): Gravar frase no Caderno.
   Apoio contínuo: 🌬️ Ar (guia de bolso), Romaji ON/OFF (localStorage['utopiaRomaji']),
   XP (localStorage['utopiaSave1']), progresso elemental (localStorage['utopiaMapas1']) e Caderno (localStorage['uniCadernoNotas']). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const IS_LOCAL=location.hostname==='localhost'||location.hostname==='127.0.0.1';
const AV=window.UtopiaAvatar;
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const tok=s=>{ if(typeof s!=='string') return s; const [k,r]=s.split('|'); return {k,r:r||'',h:k}; };
const RR=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;

/* ---------- voz: gravação da professora quando existe; senão TTS ja-JP ---------- */
const chaveAudio=t=>String(t||'').replace(/[\s、。，．,.!！?？…・「」『』（）()]/g,'');
let audioAtual=null;
function speakTTS(t,rate){
  try{
    if(!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);
    u.lang='ja-JP';
    u.rate=(rate||.86)*(window.UniVel?UniVel.get():1);
    const v=speechSynthesis.getVoices().find(x=>/^ja/i.test(x.lang));
    if(v) u.voice=v;
    window.__uttr=u;
    setTimeout(()=>{ try{ speechSynthesis.resume(); speechSynthesis.speak(u); }catch(e){} },40);
  }catch(e){}
}
function speak(t,rate){
  try{ if(audioAtual){ audioAtual.pause(); audioAtual=null; } if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  const id=(window.AUDIO_MAP||{})[chaveAudio(t)];
  if(!id) return speakTTS(t,rate);
  try{
    const a=new Audio(AUDIO_PRONTO[id]||((window.AUDIO_BASE||'/idiomas/audio/')+id+'.mp3'));
    audioAtual=a;
    if(window.UniVel) UniVel.aplica(a,(rate&&rate<.7)?.75:1);
    else if(rate&&rate<.7){ a.playbackRate=.75; a.preservesPitch=true; }
    let caiu=false;
    const cair=()=>{ if(caiu||audioAtual!==a) return; caiu=true; audioAtual=null; speakTTS(t,rate); };
    a.onerror=cair;
    const pr=a.play();
    if(pr&&pr.catch) pr.catch(cair);
  }catch(e){ speakTTS(t,rate); }
}

/* ---------- nova ordem pedagógica dos 12 mapas ---------- */
const TITULOS={aeroporto:'Aeroporto',sinalizacao:'Sinalização',trens:'Trens',hotel:'Hotel',kombini:'Konbini',restaurante:'Restaurante',apresentacao:'Apresentação',horas:'Horas',planos:'Planos',compras:'Compras',roupas:'Roupas',emergencia:'Emergência'};
const ORDEM=Object.keys(TITULOS);
const TIT_EN={aeroporto:'Airport',sinalizacao:'Signs',trens:'Trains',hotel:'Hotel',kombini:'Konbini',restaurante:'Restaurant',apresentacao:'Introductions',horas:'Time',planos:'Plans',compras:'Shopping',roupas:'Clothes',emergencia:'Emergency'};
const TIT_JA={aeroporto:'くうこう',sinalizacao:'かんばん',trens:'でんしゃ',hotel:'ホテル',kombini:'コンビニ',restaurante:'しょくどう',apresentacao:'じこしょうかい',horas:'じかん',planos:'やくそく',compras:'かいもの',roupas:'ふく',emergencia:'きんきゅう'};
const PROVA_TERR={aeroporto:'aeroporto',sinalizacao:'placas',trens:'trens',hotel:'hotel',kombini:'conbini',restaurante:'restaurante',apresentacao:'base',horas:'numeros',planos:'planos',compras:'compras',roupas:'roupas',emergencia:'sos'};

/* ---------- desenhos SVG próprios ---------- */
const SVGI={
  pasupooto:'<rect x="24" y="12" width="52" height="74" rx="7" fill="#7d2b3a"/><rect x="24" y="12" width="9" height="74" rx="4" fill="#6a2231"/><circle cx="54" cy="44" r="13" fill="none" stroke="#e3b341" stroke-width="3"/><path d="M41 44h26M54 31v26" stroke="#e3b341" stroke-width="2"/><rect x="40" y="66" width="28" height="4" rx="2" fill="#e3b341"/>',
  biza:'<rect x="20" y="12" width="58" height="76" rx="7" fill="#fff" stroke="#d8c6c9" stroke-width="3"/><g stroke="#e3d3d6" stroke-width="4" stroke-linecap="round"><path d="M31 28h36M31 40h28M31 52h20"/></g><g transform="rotate(-14 60 68)"><circle cx="60" cy="68" r="15" fill="#fff3f1" stroke="#c94a4a" stroke-width="3"/><path d="M53 68l5 5 9-10" fill="none" stroke="#c94a4a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  nimotsu:'<path d="M38 24v-6a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v6" fill="none" stroke="#8a6a5a" stroke-width="5"/><rect x="18" y="24" width="64" height="58" rx="10" fill="#e98aa0"/><rect x="18" y="24" width="64" height="58" rx="10" fill="none" stroke="#d9506f" stroke-width="3"/><path d="M36 26v54M64 26v54" stroke="#fff" stroke-width="4" opacity=".7"/><circle cx="30" cy="86" r="4" fill="#7c6a78"/><circle cx="70" cy="86" r="4" fill="#7c6a78"/>',
  yoyaku:'<path d="M12 30h76v12a8 8 0 0 0 0 16v12H12V58a8 8 0 0 0 0-16z" fill="#cfe6f3" stroke="#7aa8d6" stroke-width="3"/><path d="M62 32v36" stroke="#7aa8d6" stroke-width="2.5" stroke-dasharray="4 4"/><path d="M26 50l8 8 14-16" fill="none" stroke="#7fa487" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="50" r="5" fill="#d9506f"/>',
  kankou:'<rect x="14" y="30" width="72" height="50" rx="10" fill="#3a2b38"/><rect x="32" y="22" width="22" height="12" rx="4" fill="#3a2b38"/><circle cx="50" cy="55" r="17" fill="#b7a6dc" stroke="#fff" stroke-width="4"/><circle cx="45" cy="50" r="5" fill="#fff" opacity=".8"/><rect x="68" y="38" width="10" height="6" rx="2" fill="#f3c969"/>',
  mokutekichi:'<ellipse cx="50" cy="86" rx="24" ry="6" fill="#e5cbb9"/><path d="M50 84C34 62 24 50 24 37a26 26 0 0 1 52 0c0 13-10 25-26 47z" fill="#d9506f"/><circle cx="50" cy="37" r="10" fill="#fff"/>',
  tookyoo:'<rect x="10" y="58" width="16" height="30" rx="2" fill="#b7a6dc"/><rect x="74" y="50" width="16" height="38" rx="2" fill="#b7a6dc"/><rect x="28" y="66" width="12" height="22" rx="2" fill="#cfe6f3"/><rect x="60" y="64" width="12" height="24" rx="2" fill="#cfe6f3"/><path d="M50 8L36 88h28z" fill="none" stroke="#d9506f" stroke-width="4" stroke-linejoin="round"/><path d="M41 60h18M44 40h12M38 76h24" stroke="#d9506f" stroke-width="4"/><circle cx="50" cy="8" r="3" fill="#d9506f"/>',
  futatsu:'<g transform="translate(-6 30) scale(.58)"><path d="M38 24v-6a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v6" fill="none" stroke="#8a6a5a" stroke-width="5"/><rect x="18" y="24" width="64" height="58" rx="10" fill="#e98aa0"/></g><g transform="translate(46 30) scale(.58)"><path d="M38 24v-6a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v6" fill="none" stroke="#8a6a5a" stroke-width="5"/><rect x="18" y="24" width="64" height="58" rx="10" fill="#7aa8d6"/></g><circle cx="50" cy="20" r="14" fill="#f3c969"/><text x="50" y="27" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="#3a2b38">2</text>'
};
const isSvg=ic=>ic&&ic.startsWith('svg:');
const gsv=ic=>SVGI[ic.slice(4)]||(A&&A.svgi&&A.svgi[ic.slice(4)])||'';
const iconHTML=ic=>isSvg(ic)?`<svg viewBox="0 0 100 100" aria-hidden="true">${gsv(ic)}</svg>`:`<span class="emo" aria-hidden="true">${ic}</span>`;
const iconInStage=(ic,x,y,s)=>isSvg(ic)?`<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 100 100">${gsv(ic)}</svg>`
  :`<text x="${x+s/2}" y="${y+s*0.78}" text-anchor="middle" font-size="${s*0.8}">${ic}</text>`;

/* ---------- romaji automático sobre kana ---------- */
const RO_DI={きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',てぃ:'ti',でぃ:'di',うぃ:'wi',うぇ:'we',うぉ:'wo',ちぇ:'che',しぇ:'she',じぇ:'je'};
const RO_1={あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o',ゃ:'ya',ゅ:'yu',ょ:'yo',ゔ:'vu'};
const MAC={a:'ā',i:'ī',u:'ū',e:'ē',o:'ō'};
const RK_FIX={'は':'wa','へ':'e','を':'o','こんにちは':'konnichiwa','こんばんは':'konbanwa','せんせい':'sensei','すみません':'sumimasen','ううん':'uun','じゃない':'janai','ここが':'koko ga','では':'dewa','じゃ':'ja'};
function roWord(k){
  if(RK_FIX[k]) return RK_FIX[k];
  let m;
  if(k.length>2 && /(です|ます|ません)か$/.test(k)) return roWord(k.slice(0,-1))+' ka';
  if(k.length>2 && k.endsWith('です')) return roWord(k.slice(0,-2))+' desu';
  if((m=k.match(/^(では|じゃ)(.+)$/))) return RK_FIX[m[1]]+' '+roWord(m[2]);
  if(k.length>1 && /[はを]$/.test(k)) return roWord(k.slice(0,-1))+(k.endsWith('は')?' wa':' o');
  return roRaw(k);
}
function roRaw(k){
  const h=k.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)); let out='',i=0;
  while(i<h.length){
    const two=h.slice(i,i+2), c=h[i];
    if(c==='っ'){ const nx=RO_DI[h.slice(i+1,i+3)]||RO_1[h[i+1]]||''; out+=nx.startsWith('ch')?'t':(nx[0]||''); i++; continue; }
    if(c==='ー'){ const v=out.slice(-1); out=MAC[v]?out.slice(0,-1)+MAC[v]:out; i++; continue; }
    if(RO_DI[two]){ out+=RO_DI[two]; i+=2; continue; }
    if(c==='ん' && /^[あいうえおやゆよ]/.test(h[i+1]||'')){ out+="n'"; i++; continue; }
    out+=RO_1[c]!==undefined?RO_1[c]:c; i++;
  }
  return out.replace(/ou/g,'ō').replace(/uu/g,'ū');
}
function rk(html){
  if(typeof html!=='string') return html;
  return html.split(/(<ruby[\s\S]*?<\/ruby>|<[^>]+>)/).map(part=>part.startsWith('<')?part:part.replace(/[ぁ-ゖァ-ヺー]+/g,m=>`<ruby class="rk">${m}<rt>${roWord(m)}</rt></ruby>`)).join('');
}

/* ---------- romaji → hiragana (entrada livre no Ato 3) ---------- */
const RM=('a:あ i:い u:う e:え o:お ka:か ki:き ku:く ke:け ko:こ sa:さ shi:し si:し su:す se:せ so:そ ta:た chi:ち ti:ち tsu:つ tu:つ te:て to:と '+
  'na:な ni:に nu:ぬ ne:ね no:の ha:は hi:ひ fu:ふ hu:ふ he:へ ho:ほ ma:ま mi:み mu:む me:め mo:も ya:や yu:ゆ yo:よ ra:ら ri:り ru:る re:れ ro:ろ '+
  'wa:わ wo:を ga:が gi:ぎ gu:ぐ ge:げ go:ご za:ざ ji:じ zi:じ zu:ず ze:ぜ zo:ぞ da:だ di:ぢ du:づ de:で do:ど ba:ば bi:び bu:ぶ be:べ bo:ぼ pa:ぱ pi:ぴ pu:ぷ pe:ぺ po:ぽ '+
  'kya:きゃ kyu:きゅ kyo:きょ sha:しゃ shu:しゅ sho:しょ cha:ちゃ chu:ちゅ cho:ちょ nya:にゃ nyu:にゅ nyo:にょ '+
  'ja:じゃ ju:じゅ jo:じょ').split(' ').reduce((o,p)=>{ const [k,v]=p.split(':'); o[k]=v; return o; },{});
function romaji2kana(s){
  s=String(s||'').trim();
  if(/[぀-ヿ一-鿿]/.test(s)) return s;
  const low=s.toLowerCase().replace(/ā/g,'aa').replace(/ī/g,'ii').replace(/ū/g,'uu').replace(/ē/g,'ee').replace(/ō/g,'oo').replace(/[^a-z'\s]/g,'');
  let out='',i=0;
  while(i<low.length){
    const c=low[i];
    if(c===' '){ out+=' '; i++; continue; }
    if(c==="'"){ i++; continue; }
    if(c==='n' && (i+1>=low.length || !/[aiueoy]/.test(low[i+1]))){ out+='ん'; i+=(low[i+1]==='n'||low[i+1]==="'")?2:1; continue; }
    if(i+1<low.length && c===low[i+1] && /[kstpcgzdbfhjmrwy]/.test(c)){ out+='っ'; i++; continue; }
    let hit=false;
    for(const L of [3,2,1]){ const k=low.substr(i,L); if(RM[k]){ out+=RM[k]; i+=L; hit=true; break; } }
    if(!hit) i++;
  }
  return out.trim()||s;
}

/* ---------- avatar e nome do aluno ---------- */
let me=null, prof={};
try{ const a=AV&&AV.load(); if(a&&a.sel) me=Object.assign({},a.sel); prof=(a&&a.profile)||{}; }catch(e){}
if(!me) me={hair:'pony',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'pinku',acc:[],traits:[],skin:4};
const meName=prof.kata||prof.name||'Você';
function latinoParaKana(s){
  s=String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z\s]/g,'').trim().split(/\s+/)[0]||'';
  if(!s) return '';
  const V={a:'ア',i:'イ',u:'ウ',e:'エ',o:'オ'};
  const AIUEO='aiueo', isV=ch=>!!ch&&AIUEO.includes(ch), R={k:'カキクケコ',g:'ガギグゲゴ',s:'サシスセソ',z:'ザジズゼゾ',t:'タチツテト',d:'ダヂヅデド',n:'ナニヌネノ',h:'ハヒフヘホ',b:'バビブベボ',p:'パピプペポ',m:'マミムメモ',r:'ラリルレロ'};
  const SM={ya:'ヤ',yu:'ユ',yo:'ヨ',wa:'ワ',wo:'ウォ',we:'ウェ',wi:'ウィ'}, DI0={sh:'シャシシュシェショ',ch:'チャチチュチェチョ',j:'ジャジジュジェジョ',ny:'ニャニニュニェニョ',ry:'リャリリュリェリョ',ty:'チャチチュチェチョ'}, DI={}; Object.keys(DI0).forEach(k=>DI[k]=DI0[k].match(/.[ャュェョ]?/g));
  const ENDV={t:'ト',d:'ド',k:'ク',g:'グ',s:'ス',z:'ズ',r:'ル',l:'ル',m:'ム',p:'プ',b:'ブ',f:'フ',h:'',x:'クス',c:'ク',v:'ブ',w:'',y:'イ'};
  s=s.replace(/l/g,'r').replace(/rr/g,'r').replace(/ch/g,'sh').replace(/c([ei])/g,'s$1').replace(/c/g,'k').replace(/qu/g,'k').replace(/q/g,'k').replace(/ss/g,'s').replace(/(?<![cspt])h(?=[aeiou])/g,'').replace(/ph/g,'f').replace(/th/g,'t').replace(/x/g,'ks').replace(/v/g,'b').replace(/y$/,'i');
  let o='',i=0;
  while(i<s.length){
    const c=s[i], c2=s.slice(i,i+2), c3=s.slice(i,i+3);
    if(isV(c)){ o+=V[c]; i++; continue; }
    if(c==='n' && !isV(s[i+1]) && s[i+1]!=='y'){ o+='ン'; i++; continue; }
    if(DI[c2]&&isV(s[i+2])){ o+=DI[c2][AIUEO.indexOf(s[i+2])]||''; i+=3; continue; }
    if(DI[c3]&&isV(s[i+3])){ o+=DI[c3][AIUEO.indexOf(s[i+3])]; i+=4; continue; }
    if(DI[c]&&isV(s[i+1])){ o+=DI[c][AIUEO.indexOf(s[i+1])]; i+=2; continue; }
    if(SM[c2]){ o+=SM[c2]; i+=2; continue; }
    if(c===s[i+1] && !isV(c)){ o+='ッ'; i++; continue; }
    if(R[c]&&isV(s[i+1])){ o+=R[c][AIUEO.indexOf(s[i+1])]; i+=2; continue; }
    if(c==='h'&&isV(s[i+1])){ o+=R.h[AIUEO.indexOf(s[i+1])]; i+=2; continue; }
    if(c==='f'&&isV(s[i+1])){ o+=({a:'ファ',i:'フィ',u:'フ',e:'フェ',o:'フォ'})[s[i+1]]; i+=2; continue; }
    if(c==='j'&&isV(s[i+1])){ o+=DI.j[AIUEO.indexOf(s[i+1])]; i+=2; continue; }
    if(c==='w'&&isV(s[i+1])){ o+=SM['w'+s[i+1]]||'ウ'; i+=2; continue; }
    o+=(ENDV[c]!==undefined?ENDV[c]:''); i++;
  }
  return o;
}
const kataDigitada=/^[぀-ヿ・ー\s]+$/.test(prof.kata||'')?prof.kata.trim():'';
const kataAuto=kataDigitada?'':latinoParaKana(prof.name);
const kanaName=kataDigitada||kataAuto||'マリア';
const roName=kanaName==='マリア'&&!kataDigitada&&!kataAuto?'Maria':(prof.name||kanaName);
const nomeAuto=!kataDigitada&&!!kataAuto;
const meBaseFace=me.face||'egao';
const fillName=s=>String(s||'').replace(/\{NOME\}/g,kanaName).replace(/\{NOMERO\}/g,roName);

/* ---------- progresso & XP ---------- */
const GKEY='utopiaSave1', MKEY='utopiaMapas1', CKEY='uniCadernoNotas';
let g=null; try{ g=JSON.parse(localStorage.getItem(GKEY)||'null'); }catch(e){}
g=Object.assign({name:'',xp:0,maxXp:100,level:1,hp:10,maxHp:10,done:{}},g||{});
let M=null; try{ M=JSON.parse(localStorage.getItem(MKEY)||'null'); }catch(e){}
M=M||{};
function persist(){ try{ localStorage.setItem(GKEY,JSON.stringify(g)); localStorage.setItem(MKEY,JSON.stringify(M)); }catch(e){} }
function gainXP(n){
  g.xp+=n; let up=false;
  while(g.xp>=g.maxXp){ g.xp-=g.maxXp; g.level++; g.maxHp+=5; g.hp=g.maxHp; g.maxXp=Math.round(g.maxXp*1.2); up=true; }
  persist(); showXP();
  if(up) toast(`✨ Nível ${g.level}! ${AV&&AV.titleHTML?AV.titleHTML(g.level):''}`);
}
function showXP(){ if($('xp')) $('xp').textContent=`✨ Nv ${g.level} · ${g.xp}/${g.maxXp} XP`; }
function toast(html){ const t=document.createElement('div'); t.className='toast'; t.innerHTML=html; document.body.appendChild(t); setTimeout(()=>t.remove(),3200); }
function lerNotaCaderno(slug){
  try{ return (JSON.parse(localStorage.getItem(CKEY)||'[]')).find(n=>n&&n.mapa===slug)||null; }catch(e){ return null; }
}
/* nota no Caderno de Unir Versos (o mesmo do botão Caderno): uma nota por mapa, criada uma vez e depois só completada */
function gravaNoCaderno(entry){
  const vai=()=>{ const CD=window.UniCaderno; if(!CD) return;
    const K='uniNotaMapa_'+A.slug; let id=null; try{ id=localStorage.getItem(K); }catch(_){}
    let n=id&&CD.obter(id);
    if(!n){ n=CD.nova(); try{ localStorage.setItem(K,n.id); }catch(_){}
      CD.atualizar(n.id,{t:entry.titulo,x:entry.titulo+'\n\n'+(entry.molde?('Molde: '+entry.molde+'\n\n'):'')+'Minhas frases:\n'+entry.conteudo+'\n'}); }
    else if(!String(n.x||'').includes(entry.conteudo)){ CD.atualizar(n.id,{x:String(n.x||'').replace(/\s*$/,'')+'\n'+entry.conteudo+'\n'}); }
    try{ CD.agora(); }catch(_){}
  };
  if(window.UniCaderno) return vai();
  const sc=document.createElement('script'); sc.src='/caderno-dados.js?v=2'; sc.onload=vai; document.head.appendChild(sc);
}
function salvarNotaCaderno(conteudo){
  const txt=String(conteudo||'').trim(); if(!txt) return false;
  try{
    const hist=JSON.parse(localStorage.getItem(CKEY)||'[]');
    const entry={
      id:A.slug+'-'+Date.now(),
      titulo:`Mapa ${A.num} · ${A.titulo}`,
      mapa:A.slug,
      data:new Date().toLocaleDateString('pt-BR'),
      molde:(A.cadernoPrompt&&A.cadernoPrompt.molde)||'',
      conteudo:txt
    };
    const i=hist.findIndex(n=>n&&n.mapa===A.slug);
    if(i>=0) hist[i]=entry; else hist.unshift(entry);
    localStorage.setItem(CKEY,JSON.stringify(hist));
    gravaNoCaderno(entry);
    return true;
  }catch(e){ return false; }
}

/* ---------- frases de socorro 🌬️ Ar ---------- */
const AR=[
  {ic:'⏳',quero:'Preciso de um tempinho',sub:'Respirar · ganhar tempo sem silêncio congelante',frases:[
    {h:'あの、ちょっと '+RR('待','ま')+'って ください',k:'あの、ちょっと まって ください',r:'ano, chotto matte kudasai',pt:'hum, só um instante, por favor'},
    {h:'ええと…',k:'ええと',r:'ēto…',pt:'vejamos… / deixe-me ver…'},
    {h:RR('少々','しょうしょう')+' お'+RR('待','ま')+'ちください',k:'しょうしょう おまちください',r:'shōshō omachi kudasai',pt:'um momento, por favor (formal)'}]},
  {ic:'🙋',quero:'Avisar que estou aprendendo japonês',sub:'Declarar · tirar o peso da perfeição',frases:[
    {h:RR('日本語','にほんご')+'を '+RR('勉強中','べんきょうちゅう')+'です',k:'にほんごを べんきょうちゅうです',r:'nihongo o benkyō-chū desu',pt:'estou estudando japonês'},
    {h:'あまり '+RR('上手','じょうず')+'じゃ ありません',k:'あまり じょうずじゃ ありません',r:'amari jōzu ja arimasen',pt:'ainda não falo muito bem'},
    {h:'よく わかりませんでした',k:'よく わかりませんでした',r:'yoku wakarimasen deshita',pt:'não compreendi bem'}]},
  {ic:'🐢',quero:'Pedir para falar devagar ou repetir',sub:'Ajustar o ritmo da conversa',frases:[
    {h:'もう'+RR('一度','いちど')+' お'+RR('願','ねが')+'いします',k:'もういちど おねがいします',r:'mō ichido onegaishimasu',pt:'mais uma vez, por favor'},
    {h:'ゆっくり '+RR('話','はな')+'して ください',k:'ゆっくり はなして ください',r:'yukkuri hanashite kudasai',pt:'fale mais devagar, por favor'},
    {h:RR('書','か')+'いて もらえますか',k:'かいて もらえますか',r:'kaite moraemasu ka',pt:'pode escrever para mim?'}]},
  {ic:'🔎',quero:'Confirmar se entendi',sub:'Checar antes de agir',frases:[
    {h:'これで '+RR('合','あ')+'って いますか',k:'これで あって いますか',r:'kore de atte imasu ka',pt:'está certo assim?'},
    {h:RR('大丈夫','だいじょうぶ')+'ですか',k:'だいじょうぶですか',r:'daijōbu desu ka',pt:'tudo bem? / sem problemas?'},
    {h:'いいですか',k:'いいですか',r:'ii desu ka',pt:'posso? / está liberado?'}]},
  {ic:'🚪',quero:'Encerrar com educação',sub:'Sair com simpatia',frases:[
    {h:'わかりました。ありがとうございます',k:'わかりました。ありがとうございます',r:'wakarimashita. arigatō gozaimasu',pt:'entendi. muito obrigado(a)!'},
    {h:RR('大丈夫','だいじょうぶ')+'です。すみません',k:'だいじょうぶです。すみません',r:'daijōbu desu. sumimasen',pt:'não precisa, obrigado(a)'}]}
];

/* ---------- glossário palavra por palavra ---------- */
const GLOSS={
  'は':['wa','(assunto)','Partícula: lê-se "wa".',1],'が':['ga','(sujeito / existência)','Partícula.',1],'を':['o','(objeto)','Partícula: lê-se "o".',1],
  'に':['ni','em / para / a','Partícula de destino ou horário.',1],'で':['de','com / em','Partícula de meio ou lugar.',1],'の':['no','de','Liga duas palavras.',1],
  'と':['to','e / citação','Partícula.',1],'も':['mo','também','Partícula.',1],'から':['kara','a partir de','Começo.',1],'まで':['made','até','Fim.',1],
  'です':['desu','é / são','Fecha a frase com educação.',1],'か':['ka','(pergunta)','Transforma em pergunta.',1],'ね':['ne','né?','Concordância.',1],'よ':['yo','viu? / alerta','Ênfase.',1],
  'ご':['go','(educação)','Prefixo educado.',1],'お':['o','(educação)','Prefixo educado.',1],
  'もくてき':['mokuteki','motivo',''],'なん':['nan','o quê',''],'どこ':['doko','onde',''],'いくつ':['ikutsu','quantos',''],
  'なまえ':['namae','nome',''],'なんぱく':['nanpaku','quantas noites',''],'よてい':['yotei','plano',''],'こちら':['kochira','aqui / este',''],
  'へや':['heya','quarto',''],'しちじ':['shichi-ji','7 horas',''],'ほかに':['hoka ni','além disso',''],'なにか':['nani ka','alguma coisa',''],
  'いかが':['ikaga','como / que tal',''],'いらっしゃいませ':['irasshaimase','bem-vindo(a)!',''],'なんめいさま':['nanmei-sama','quantas pessoas',''],
  'ちゅうもん':['chūmon','pedido',''],'きまり':['kimari','decidido',''],'のみもの':['nomimono','bebida',''],'おまたせしました':['o-matase shimashita','aqui está / desculpe a demora',''],
  'ラーメン':['rāmen','lámen',''],'りよう':['riyō','uso',''],'もち':['mochi','ter consigo',''],'いじょう':['ijō','só isso',''],'よろしい':['yoroshii','tudo bem (educado)',''],
  'どちら':['dochira','onde / qual',''],'にひゃくえん':['nihyaku-en','200 ienes',''],'さんばんせん':['sanbansen','plataforma 3',''],'さがし':['sagashi','procurar',''],
  'せんごひゃくえん':['sen-gohyaku-en','1.500 ienes',''],'にわりびき':['niwaribiki','20% de desconto',''],'どれ':['dore','qual',''],'なさいます':['nasaimasu','escolher (educado)',''],
  'しはらい':['shiharai','pagamento',''],'どう':['dō','como',''],'どうぞ':['dōzo','por favor / à vontade',''],'ごらんください':['go-ran kudasai','olhe à vontade',''],
  'そう':['sō','assim',''],'はい':['hai','sim',''],'この':['kono','este',''],'しろ':['shiro','branco',''],'どうしましたか':['dō shimashita ka','o que aconteceu?',''],
  'かおいろ':['kaoiro','cor do rosto',''],'わるい':['warui','ruim',''],'だいじょうぶ':['daijōbu','tudo bem',''],'いきます':['ikimasu','ir',''],
  'あっ':['a!','ah!',''],'あの':['ano','aquele',''],'ひと':['hito','pessoa',''],'たおれました':['taoremashita','desmaiou / caiu',''],
  'ファティマ':['Fatima','Fátima',''],'くに':['kuni','país',''],'ごじ':['go-ji','5 horas',''],'ツアー':['tsuā','tour',''],'もう':['mō','já',''],
  'おわりました':['owarimashita','acabou',''],'さんじ':['san-ji','3 horas',''],'きます':['kimasu','vir',''],'ひま':['hima','livre',''],'いい':['ii','bom',''],
  'いつ':['itsu','quando',''],'どようび':['doyōbi','sábado',''],'あいません':['aimasen','encontrar (~ませんか = convite)',''],'ざんねん':['zannen','que pena',''],
  'じゃあ':['jā','então',''],'あと':['ato','depois',''],'のみません':['nomimasen','beber (~ませんか = convite)',''],'こまり':['komari','precisando de ajuda',''],
  'いみ':['imi','significado',''],'あちら':['achira','ali (educado)',''],'こ':['ko','criança',''],'せん':['sen','faixa / linha',''],'そと':['soto','fora',''],
  'よかった':['yokatta','que bom',''],'たばこ':['tabako','cigarro',''],'すっています':['sutte imasu','está fumando',''],'ここ':['koko','aqui',''],
  'しごと':['shigoto','trabalho',''],'きょう':['kyō','hoje',''],'あした':['ashita','amanhã',''],'いま':['ima','agora',''],'なんじ':['nan-ji','que horas',''],
  'ちょっと':['chotto','um pouco… (recusa gentil)',''],'こんばん':['konban','hoje à noite',''],'えいが':['eiga','filme',''],'おちゃ':['o-cha','chá',''],
  'でぐち':['deguchi','saída',''],'よみます':['yomimasu','ler',''],'トイレ':['toire','banheiro',''],'きんえん':['kin\'en','proibido fumar',''],'しゅみ':['shumi','hobby',''],
  'はじめまして':['hajimemashite','prazer em conhecer',''],'よろしく':['yoroshiku','conto com você',''],'おねがいします':['onegaishimasu','por favor',''],
  'きっぷ':['kippu','bilhete',''],'びょういん':['byōin','hospital',''],'ふくろ':['fukuro','sacola',''],'おべんとう':['o-bentō','bentô',''],
  'あたためます':['atatamemasu','esquentar',''],'ポイントカード':['pointo kādo','cartão de pontos',''],'いろ':['iro','cor',''],'サイズ':['saizu','tamanho',''],
  'ちょうしょく':['chōshoku','café da manhã',''],'かぎ':['kagi','chave',''],'よやく':['yoyaku','reserva',''],'にもつ':['nimotsu','bagagem',''],
  'ビザ':['biza','visto',''],'ございます':['gozaimasu','tem (educado)',''],'ありますか':['arimasu ka','tem?',''],'もくてきち':['mokutekichi','destino',''],
  'えき':['eki','estação',''],'やさい':['yasai','legumes',''],'たべられない':['taberarenai','não pode comer',''],'もの':['mono','coisa',''],
  'だし':['dashi','caldo','⚠️ Muitas vezes leva peixe.'],'ほんだし':['hondashi','caldo em pó de peixe','⚠️ Base de peixe (かつおぶし).'],
  'かつおぶし':['katsuobushi','peixe bonito seco',''],'すみません':['sumimasen','com licença / desculpe',''],'ベジタリアン':['bejitarian','vegetariano(a)',''],
  'にく':['niku','carne',''],'さかな':['sakana','peixe',''],'サラダ':['sarada','salada',''],'とうにゅう':['tōnyū','leite de soja','']
};
function quebraFrase(say,words){
  const W={}; (words||[]).forEach(w=>{ const k=String(w.k||'').replace(/<[^>]+>/g,'').replace(/[…。！？]/g,''); if(k) W[k]=w; });
  const has=k=>W[k]||GLOSS[k], out=[];
  String(say).split(/[\s、。！？!?…〜~「」"“”]+/).filter(Boolean).forEach(ch=>{
    let i=0;
    while(i<ch.length){
      let hit=null;
      for(let L=ch.length-i;L>0;L--){ const s=ch.slice(i,i+L); if(has(s)){ hit=s; break; } }
      if(!hit){ const last=out[out.length-1]; if(ch[i]==='ー'&&last){ last.k+='ー'; i++; continue; } out.push({k:ch[i],ro:'',pt:'',nota:'',g:1}); i++; continue; }
      const w=W[hit], gl=GLOSS[hit];
      out.push(w&&!(gl&&gl[3])?{k:hit,ro:w.r||(gl&&gl[0])||'',pt:w.pt||(gl&&gl[1])||'',nota:(gl&&gl[2])||''}
                               :{k:hit,ro:gl[0],pt:gl[1],nota:gl[2]||'',g:!!gl[3]});
      i+=hit.length;
    }
  });
  return out;
}
function quebraHTML(say){
  const list=quebraFrase(say,A.words);
  return `<div class="quebra"><p class="pt" style="margin:0 0 6px">Palavra por palavra:</p>${list.map((p,i)=>`
    <div class="qb${p.g?' g':''}"><button type="button" class="qbk" data-qb="${i}" aria-label="Ouvir ${p.k}">🔊 <b lang="ja">${p.k}</b></button>
      <div class="qbt"><span class="ro">${p.ro}</span> <span class="qbpt">${p.pt}</span>${p.nota?`<small>${p.nota}</small>`:''}</div></div>`).join('')}</div>`;
}

/* ---------- pré-carregamento de áudios ---------- */
let preBaixou=false; const AUDIO_PRONTO={};
function preBaixaAudios(){
  if(preBaixou||!window.AUDIO_MAP||!window.fetch) return; preBaixou=true;
  const base=window.AUDIO_BASE||'/idiomas/audio/', ids=new Set();
  const varre=v=>{
    if(typeof v==='string'){ const k=chaveAudio(v.split('|')[0].replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'')); const id=window.AUDIO_MAP[k]; if(id) ids.add(id); }
    else if(Array.isArray(v)) v.forEach(varre);
    else if(v&&typeof v==='object') Object.values(v).forEach(varre);
  };
  try{ varre(A); }catch(e){}
  const fila=[...ids];
  const um=()=>{ const id=fila.shift(); if(!id) return; fetch(base+id+'.mp3').then(r=>r.ok?r.blob():null).then(b=>{ if(b) AUDIO_PRONTO[id]=URL.createObjectURL(b); }).catch(()=>{}).then(um); };
  const vai=()=>{ for(let i=0;i<4;i++) um(); };
  if(window.requestIdleCallback) requestIdleCallback(vai,{timeout:2000}); else setTimeout(vai,800);
}

/* ---------- estado global da aula (3 Atos) ---------- */
const ATOS=[
  {n:1, key:'agua', ico:'💧', nome:'Palavras da cena', sub:'Água · Conhecer e jogar'},
  {n:2, key:'fogo', ico:'🔥', nome:'Agir no diálogo', sub:'Fogo · Responder'},
  {n:3, key:'terra', ico:'🌱', nome:'Gravar no Caderno', sub:'Terra · Registrar'}
];
let A=null, P=null;
let ato=0; // 0 = Ato 1 (Hotspots), 1 = Ato 2 (Diálogo), 2 = Ato 3 (Caderno)
let ci=0, bank=[], placed=[], done={}, okPt={}, mood='idle', stageOpt={}, errosTurno={}, propsCena={};
let CENAS=[], CENAS_N=[], CENAS_V=null, VEG=false;
const wordH=w=>w.h||w.k;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;

/* ---------- palco protagonista + cor progressiva + hotspots ---------- */
function charSVG(sel,x,y,w,cls,extra){
  const h=w*300/240;
  return `<g class="char ${cls}"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 240 300">${AV?AV.markup(sel,{noBg:true,still:true}):''}${extra||''}</svg></g>`;
}
function calcSatLevel(){
  if(!A||!P) return 0;
  const hs=(A.cen&&A.cen.hotspots)||[];
  const hsCount=hs.filter((_,k)=>P.hotspots&&P.hotspots[k]).length;
  const terraOk=!!(P.steps[4]||lerNotaCaderno(A.slug));
  if(terraOk || ato===2 || P.steps[2]) return 3;
  if(ato===1 || P.steps[1]) return 2;
  if(hsCount>0) return 1;
  return 0;
}
function ensureStageChrome(){
  const sw=document.querySelector('.stage-wrap'); if(!sw) return null;
  let bg=$('stageBg'); if(!bg){ bg=document.createElement('img'); bg.className='stage-bg'; bg.id='stageBg'; bg.alt=''; sw.prepend(bg); }
  let tag=$('atoTag'); if(!tag){ tag=document.createElement('div'); tag.className='ato-tag'; tag.id='atoTag'; sw.appendChild(tag); }
  let pp=$('progPill'); if(!pp){ pp=document.createElement('div'); pp.className='prog-pill'; pp.id='progPill'; sw.appendChild(pp); }
  let pl=$('plLayer'); if(!pl){ pl=document.createElement('div'); pl.className='pl-layer'; pl.id='plLayer'; sw.appendChild(pl); }
  let ly=$('hsLayer'); if(!ly){ ly=document.createElement('div'); ly.className='hs-layer'; ly.id='hsLayer'; sw.appendChild(ly); }
  if(!$('propsCena')){ const pc=document.createElement('div'); pc.className='props-cena'; pc.id='propsCena'; sw.appendChild(pc); }
  if(!$('clip')){ const cp=document.createElement('div'); cp.className='clip'; cp.id='clip'; cp.hidden=true; sw.appendChild(cp); }
  if(!$('falaCena')){ const f=document.createElement('div'); f.className='fala-cena'; f.id='falaCena'; f.hidden=true; sw.appendChild(f); }
  return {sw,bg,tag,pp,ly};
}
function renderStage(){
  const o=stageOpt, c=A.cen, n=A.npc;
  const npcFace=mood==='wrong'?'bikkuri':(n.sel.face||'egao');
  const meFace=mood==='ok'?'egao':mood==='wrong'?'bikkuri':meBaseFace;
  const npcCls=mood==='ok'?'nod':mood==='wrong'?'tilt':'idle';
  const meCls=mood==='ok'?'hop':mood==='wrong'?'shake':'idle';
  const sat=String(calcSatLevel());
  const ui=ensureStageChrome();
  const bgUrl=`/idiomas/img/cenas/${A.slug}.webp`;
  if(ui){
    if(ui.bg.dataset.slug!==A.slug){ ui.bg.dataset.slug=A.slug; ui.bg.src=bgUrl; ui.bg.alt='Cenário: '+A.titulo;
      /* japonês escrito nas placas em branco da ilustração */
      const pl=$('plLayer'); if(pl) pl.innerHTML=((A.cen&&A.cen.placas)||[]).map(p=>`<div class="placa-txt" lang="ja" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;${p.alto?`height:${p.alto}%;`:''}--fs:${p.fs||1.6};${p.fundo?`background:${p.fundo};`:''}">${String(p.t).replace(/\n/g,'<br>')}</div>`).join(''); }
    { const pl=$('plLayer'); if(pl) pl.dataset.sat=sat; }
    ui.bg.dataset.sat=sat;
  }
  const stg=$('stage');
  stg.setAttribute('viewBox','0 0 400 225');
  stg.dataset.sat=sat;
  if(ato===0){
    stg.innerHTML='';
  } else {
    const stamp=o.stamp?`<g class="thump"><circle cx="200" cy="64" r="20" fill="#fffd" stroke="#c94a4a" stroke-width="3"/><text x="200" y="70" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="14" font-weight="800" fill="#c94a4a">OK</text></g>`:'';
    stg.innerHTML=`
      <defs><linearGradient id="stageShade" x1="0" y1="0" x2="0" y2="1"><stop offset="55%" stop-color="#3a2b38" stop-opacity="0"/><stop offset="100%" stop-color="#3a2b38" stop-opacity=".22"/></linearGradient></defs>
      <rect width="400" height="225" fill="url(#stageShade)"/>
      ${(()=>{ const cl=(A.clipe||assist)&&ato===1; return charSVG(Object.assign({},n.sel,{face:npcFace}),cl?26:20,cl?100:76,cl?96:118,npcCls,n.extra); })()}
      ${mood==='wrong'&&!((A.clipe||assist)&&ato===1)?`<g class="q"><circle cx="136" cy="78" r="16" fill="#fff" stroke="#cfe0f0" stroke-width="2"/><text x="136" y="85" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="20" font-weight="800" fill="#4f8fc4">?</text></g>`:''}
      ${(A.clipe||assist)&&ato===1?'':stamp}
      <g class="${o.enter?'enter':''}"><g class="char ${meCls}">
        ${c.meProp?iconInStage(c.meProp,234,174,30):''}
        <svg x="${(A.clipe||assist)&&ato===1?278:256}" y="${(A.clipe||assist)&&ato===1?100:70}" width="${(A.clipe||assist)&&ato===1?96:128}" height="${(A.clipe||assist)&&ato===1?120:160}" viewBox="0 0 240 300">${AV?AV.markup(Object.assign({},me,{face:meFace}),{noBg:true,still:true}):''}</svg>
      </g></g>`;
  }

  if(ui){
    const cur=ATOS[ato];
    ui.tag.textContent=`Ato ${cur.n} · ${cur.ico} ${cur.nome}`;
    const terraOk=!!(P.steps[4]||lerNotaCaderno(A.slug));
    ui.pp.innerHTML=`<i class="${P.steps[1]?'on agua':''}" title="Água"></i><i class="${P.steps[2]?'on fogo':''}" title="Fogo"></i><i class="${terraOk?'on terra':''}" title="Terra"></i>`;
    renderHotspots(ui.ly);
    { const pc=$('propsCena'), pos=A.cen.propsPos, L=Object.keys(propsCena).sort().map(k=>propsCena[k]).filter(Boolean);
      if(pc){ pc.hidden=!pos||!L.length||ato!==1; if(pos){ pc.style.left=pos.x+'%'; pc.style.top=pos.y+'%'; } pc.innerHTML=L.map((e,i)=>`<span style="animation-delay:${i*.05}s">${e}</span>`).join(''); } }
  }
}
function setStage(o){ stageOpt=o||{}; renderStage(); }

function renderHotspots(ly){
  const list=(A&&A.cen&&A.cen.hotspots)||[];
  if(!list.length || ato!==1 || A.clipe || assist){ ly.innerHTML=''; return; }
  /* no diálogo os personagens ocupam as laterais: só ficam as pistas do meio e do alto da cena */
  const ver=h=>ato!==1||(h.x>=35&&h.x<=63)||h.y<32;
  ly.innerHTML=list.map((h,i)=>!ver(h)?'':`<button type="button" class="hs-dot${P.hotspots&&P.hotspots[i]?' visto':''}" style="left:${h.x}%;top:${h.y}%" data-hs="${i}" title="${h.pt}" aria-label="${h.pt}"><span>♪</span></button>`).join('');
  ly.onclick=e=>{ const b=e.target.closest('.hs-dot'); if(!b) return; e.stopPropagation(); openHotspot(+b.dataset.hs); };
}

function openHotspot(idx){
  const list=(A&&A.cen&&A.cen.hotspots)||[], h=list[idx]; if(!h) return;
  if(ato===0&&f1Atual()===1&&esc&&esc.alvo!=null) return respondeEscuta(idx);
  if(ato===1){ /* pista: no diálogo, tocar num ponto da cena só lembra o que é */
    const w=(A.words||[]).find(x=>x.id===h.wordId); speak(h.say);
    document.querySelectorAll('.toast').forEach(t=>t.remove());
    toast(`🔍 <span lang="ja">${h.say}</span>${w?` · ${w.pt}`:''}`); return; }
  P.hotspots=P.hotspots||{};
  const novo=!P.hotspots[idx];
  P.hotspots[idx]=1;
  if(novo){
    if(h.wordId) P.words[h.wordId]=1;
    gainXP(5);
  } else {
    persist();
  }
  const vistos=list.filter((_,k)=>P.hotspots&&P.hotspots[k]).length;
  if(vistos>=list.length && novo){ sparkle(['💧','✨','🎵']); f1Ver=0;
    const fb=$('f1Body'); if(fb&&!$('f1Prox')){ fb.insertAdjacentHTML('beforeend','<div class="row"><span class="spacer"></span><button type="button" class="btn primary" id="f1Prox">👂 Agora: ouça e ache na cena →</button></div>'); $('f1Prox').onclick=()=>{ f1Ver=1; renderF1(); }; }
    if($('f1Nav')) renderF1Nav(); }
  speak(h.say);
  renderSteps();
  renderStage();
  const w=(A.words||[]).find(x=>x.id===h.wordId);
  const pil=$('hsPilula');
  if(pil){
    pil.hidden=false;
    pil.innerHTML=`<div class="pilula">
      <div class="pil-head"><span class="pil-tag">🔍 ${h.pt}</span><button type="button" class="btn small" id="pilSay">🔊 Ouvir</button></div>
      <div class="pil-jp" lang="ja">${rk(h.say)}</div>
      ${w?`<div class="pil-word"><span class="pil-ic">${iconHTML(w.ic)}</span><div><b>${wordH(w)}</b> <span class="ro">(${w.r})</span> = <b>${w.pt}</b>${w.tip?`<div class="pil-tip">💡 ${w.tip}</div>`:''}</div></div>`:''}
    </div>`;
    $('pilSay').onclick=()=>speak(h.say);
  }
  const cnt=$('hsContagem');
  if(cnt) cnt.innerHTML=list.map((_,i)=>`<i class="${P.hotspots&&P.hotspots[i]?'on':''}"></i>`).join('')+`<span>${vistos}/${list.length}</span>`;
  const chips=$('hsChips');
  if(chips){ const ch=chips.querySelector(`[data-hs="${idx}"]`); if(ch) ch.classList.add('visto'); }
}

function sparkle(list){
  const fx=$('fx'); if(!fx) return;
  for(let k=0;k<10;k++){
    const s=document.createElement('span'); s.className='spark'; s.textContent=list[k%list.length];
    s.style.left=(20+Math.random()*65)+'%'; s.style.top=(25+Math.random()*45)+'%';
    s.style.animationDelay=(k*0.06)+'s';
    fx.appendChild(s); setTimeout(()=>s.remove(),1700);
  }
}

/* ---------- barra dos 3 Atos (substitui as 6 abas antigas) ---------- */
function renderSteps(){
  const terraOk=!!(P.steps[4]||lerNotaCaderno(A.slug));
  const feitos=[!!P.steps[1], !!P.steps[2], terraOk];
  $('steps').innerHTML=ATOS.map((a,k)=>`
    <button type="button" class="ato-btn ${a.key} ${k===ato?'now':''} ${feitos[k]?'done':''}" data-ato="${k}">
      <span class="ato-num">Ato 0${a.n}</span>
      <span class="ato-ico">${feitos[k]?'✓':a.ico}</span>
      <span class="ato-nome">${a.nome}</span>
      <small class="ato-sub">${a.sub}</small>
    </button>`).join('');
}

function goAto(n){
  preBaixaAudios();
  ato=Math.max(0,Math.min(2,n));
  mood='idle';
  document.body.dataset.ato=ATOS[ato].key; if(ato!==0) fala(null); if($('clip')){ $('clip').hidden=true; $('clip').innerHTML=''; clearTimeout(clipT); } if(ato!==1){ assist=null; } document.body.classList.toggle('modo-clipe',!!(A&&A.clipe&&ato===1)); document.body.classList.toggle('modo-a1',ato===0);
  renderSteps();
  [stAto1,stAto2,stAto3][ato]();
}

/* ---------- ATO 1 · 💧 ÁGUA · na cena: explorar → ouça e ache → monte a frase ---------- */
const F1=[{ico:'👀',nome:'Explorar'},{ico:'👂',nome:'Ouça e ache'},{ico:'🧩',nome:'Monte a frase'}];
let f1Ver=null, esc=null, mi=0, msel=null;
function a1(){ P.a1=P.a1||{esc:0,mol:{}}; P.a1.mol=P.a1.mol||{}; return P.a1; }
const hsLista=()=>(A&&A.cen&&A.cen.hotspots)||[];
const hsComPalavra=()=>hsLista().map((h,i)=>({h,i,w:(A.words||[]).find(x=>x.id===h.wordId)})).filter(o=>o.w);
const explorou=()=>hsLista().every((_,k)=>P.hotspots&&P.hotspots[k]);
const molDone=k=>Object.keys((a1().mol[k])||{}).length>=Math.min(2,combos(A.moldes[k]));
const moldesOk=()=>!(A.moldes||[]).length||(A.moldes||[]).every((_,k)=>molDone(k));
function combos(m){ return (m.slots||[]).reduce((n,o)=>n*o.length,1); }
function f1Auto(){ if(!explorou()) return 0; if(!a1().esc&&hsComPalavra().length>=2) return 1; if(!moldesOk()) return 2; return 2; }
function f1Atual(){ return f1Ver!=null?f1Ver:f1Auto(); }
function fecharAto1(){ if(P.steps[1]) return; P.steps[1]=1; persist(); gainXP(10); sparkle(['💧','✨','🌸','⭐']); renderSteps(); renderStage(); }
function mostraPalco(){ const sw=document.querySelector('.stage-wrap'); if(!sw) return; const r=sw.getBoundingClientRect(); if(r.top<0||r.top>innerHeight*.5) try{ sw.scrollIntoView({block:'start',behavior:'smooth'}); }catch(e){} }
function fala(html){ const f=$('falaCena'); if(!f) return; if(!html){ f.hidden=true; return; } f.hidden=false; f.innerHTML=html; }

/* Ato 1 novo: 👀 conhecer as palavras da cena (voz + romaji) → 🃏 jogo da memória → diálogo */
let a1Fase='conhecer', a1i=0, memo=null;
function palavrasCena(){
  const usa=new Set(JSON.stringify(A.cenas||[]).match(/[ぁ-んァ-ヶー一-龯]+/g)||[]);
  const ws=(A.words||[]).slice();
  return ws.sort((x,y)=>(usa.has(y.k)?1:0)-(usa.has(x.k)?1:0)||ws.indexOf(x)-ws.indexOf(y));
}
function stAto1(){
  setStage({enter:true}); fala(null);
  const W=palavrasCena(); if(!P.a1n) P.a1n={};
  a1Fase=P.a1n.jogo?'fim':P.a1n.conheceu?'jogo':'conhecer'; a1i=0; memo=null;
  $('panel').innerHTML=`
    <div class="row clip-topo"><span class="elem agua"><i></i>Ato 1 de 3 · 💧 Palavras da cena</span></div>
    ${A.fio&&A.fio.gancho?`<p class="a1-missao"><b>Missão:</b> ${A.fio.gancho}</p>`:''}
    <div class="clip-mob" id="clipMob"></div>
    <nav class="f1-nav" id="a1Nav"></nav>
    <div class="row"><span class="spacer"></span><button type="button" class="btn small" id="btnIrAto2">Ir para o diálogo →</button></div>`;
  $('btnIrAto2').onclick=()=>goAto(1);
  $('a1Nav').onclick=e=>{ const b=e.target.closest('[data-f]'); if(!b) return; a1Fase=b.dataset.f; a1i=0; memo=null; renderA1(); };
  renderA1();
}
function a1Nav(){ const feito={conhecer:!!P.a1n.conheceu,jogo:!!P.a1n.jogo};
  $('a1Nav').innerHTML=[['conhecer','👀','Conhecer as palavras'],['jogo','🃏','Jogo da memória']].map(([f,i,n])=>`<button type="button" class="f1-b${a1Fase===f||(a1Fase==='fim'&&f==='jogo')?' now':''}${feito[f]?' ok':''}" data-f="${f}"><span>${feito[f]?'✓':i}</span>${n}</button>`).join(''); }
function a1Por(html){ /* na imagem (computador) ou logo abaixo dela (celular) */
  const mob=window.matchMedia&&matchMedia('(max-width:640px)').matches, cp=$('clip');
  cp.hidden=mob; cp.innerHTML=mob?'':`<div class="a1-ov">${html}</div>`; $('clipMob').innerHTML=mob?`<div class="a1-ov mob">${html}</div>`:'';
  return mob?$('clipMob'):cp;
}
const roA1=w=>`<span class="ro-sempre">${w.r}</span>`;
function renderA1(){
  a1Nav(); const W=palavrasCena();
  if(a1Fase==='conhecer'){
    const w=W[a1i], ult=a1i===W.length-1;
    const el=a1Por(`<div class="a1-card" lang="ja">
        <div class="a1-ic">${iconHTML(w.ic)}</div>
        <b class="a1-jp">${wordH(w)}</b>${roA1(w)}<span class="a1-pt">${w.pt}</span>
        ${w.tip?`<small class="a1-tip">${rk(w.tip)}</small>`:''}
        <div class="a1-bt"><button type="button" class="a1-r" data-a="ant" ${a1i?'':'disabled'} aria-label="Anterior">◀</button>
          <button type="button" class="a1-r som" data-a="som" aria-label="Ouvir">🔊</button><button type="button" class="a1-r" data-a="dev" aria-label="Devagar">🐢</button>
          <button type="button" class="a1-go" data-a="prox">${ult?'🃏 Vamos jogar →':'próxima ▶'}</button></div>
        <div class="a1-dots">${W.map((_,k)=>`<i class="${k<a1i?'on':k===a1i?'now':''}"></i>`).join('')}<span>${a1i+1}/${W.length}</span></div>
      </div>`);
    el.querySelectorAll('[data-a]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const a=b.dataset.a;
      if(a==='som') speak(w.k); if(a==='dev') speak(w.k,.55);
      if(a==='ant'&&a1i>0){ a1i--; renderA1(); }
      if(a==='prox'){ if(!ult){ a1i++; renderA1(); } else { P.a1n.conheceu=1; persist(); a1Fase='jogo'; memo=null; renderA1(); } } });
    speak(w.k); return;
  }
  if(a1Fase==='jogo'){
    if(!memo){ const n=Math.ceil(W.length/Math.ceil(W.length/6)), rodadas=[]; for(let k=0;k<W.length;k+=n) rodadas.push(W.slice(k,k+n)); memo={rodadas,r:0}; novaRodada(); }
    const R=memo.rodadas, cartas=memo.cartas;
    const el=a1Por(`<div class="memo">
        <div class="memo-h"><b>🃏 Ache os pares: a palavra e o que ela quer dizer</b><span>Rodada ${memo.r+1}/${R.length} · ${memo.pares}/${R[memo.r].length} pares</span></div>
        <div class="memo-g" style="--cols:${cartas.length>8?4:cartas.length>6?4:3}">${cartas.map((c,k)=>{ const w=c.w, ab=c.vira||c.ok;
          return `<button type="button" class="mc${ab?' ab':''}${c.ok?' ok':''}${c.erro?' erro':''}" data-k="${k}" ${c.ok?'disabled':''}>
            <span class="mc-v">🌸</span><span class="mc-f">${c.t==='jp'?`<b lang="ja">${w.k}</b>${roA1(w)}`:`<i>${iconHTML(w.ic)}</i><small>${w.pt}</small>`}</span></button>`; }).join('')}</div>
      </div>`);
    el.querySelector('.memo-g').onclick=e=>{ e.stopPropagation(); const b=e.target.closest('.mc'); if(!b||memo.trava) return; viraCarta(+b.dataset.k); };
    return;
  }
  /* fim */
  const el=a1Por(`<div class="a1-card fim"><div class="a1-ic">🌸</div><b class="a1-jp">よく できました！</b><span class="ro-sempre">yoku dekimashita!</span>
      <span class="a1-pt">Você já conhece as ${W.length} palavras desta cena. Agora assista à cena inteira.</span>
      <div class="a1-bt"><button type="button" class="a1-r" data-a="rev">🃏 jogar de novo</button><button type="button" class="a1-go" data-a="dial">▶ Assistir à cena →</button></div></div>`);
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); if(b.dataset.a==='dial') goAto(1); else { a1Fase='jogo'; memo=null; renderA1(); } });
}
function novaRodada(){ const ws=memo.rodadas[memo.r]; memo.cartas=shuffle(ws.flatMap(w=>[{w,t:'jp'},{w,t:'pt'}])); memo.pares=0; memo.aberta=null; memo.trava=false; }
function viraCarta(k){
  const c=memo.cartas[k]; if(c.ok||c.vira) return;
  c.vira=true; if(c.t==='jp') speak(c.w.k);
  if(memo.aberta==null){ memo.aberta=k; return renderA1(); }
  const o=memo.cartas[memo.aberta]; memo.aberta=null;
  if(o.w===c.w){ o.ok=c.ok=true; o.vira=c.vira=false; memo.pares++; if(c.t!=='jp') speak(c.w.k); sparkle(['✨','🌸']); renderA1();
    if(memo.pares===memo.rodadas[memo.r].length){ memo.trava=true; setTimeout(()=>{ memo.trava=false;
      if(memo.r<memo.rodadas.length-1){ memo.r++; novaRodada(); renderA1(); }
      else { const first=!P.a1n.jogo; P.a1n.jogo=1; if(!P.steps[1]){ P.steps[1]=1; gainXP(10); } persist(); renderSteps(); a1Fase='fim'; sparkle(['💧','🎉','✨','⭐']); renderA1(); } },900); }
  } else { o.erro=c.erro=true; memo.trava=true; renderA1(); setTimeout(()=>{ o.vira=c.vira=o.erro=c.erro=false; memo.trava=false; renderA1(); },1000); }
}
function renderF1(){
  const f=f1Atual(), feito=[explorou(),!!a1().esc||hsComPalavra().length<2,moldesOk()];
  $('f1Nav').innerHTML=F1.map((x,k)=>`<button type="button" class="f1-b${k===f?' now':''}${feito[k]?' ok':''}" data-f="${k}"><span>${feito[k]?'✓':x.ico}</span>${x.nome}</button>`).join('');
  const b=$('btnIrAto2'); if(b){ const pronto=feito.every(Boolean); b.classList.toggle('primary',pronto); b.textContent=pronto?'💧 Ato 1 completo! Ir para o Ato 2: Agir no diálogo →':'Ir para o Ato 2: Agir no diálogo →'; }
  if(feito.every(Boolean)) fecharAto1();
  renderStage();
  if(f===0) return f1Explorar();
  if(f===1) return f1Escuta();
  return f1Moldes();
}
function f1Explorar(){
  fala(null);
  const hs=hsLista(), vistos=hs.filter((_,k)=>P.hotspots&&P.hotspots[k]).length;
  $('f1Body').innerHTML=`${A.intro.txt.map(t=>`<p class="lead">${t}</p>`).join('')}
    ${hs.length?`<div class="hs-box">
      <div class="hs-head"><b>👀 Toque nos círculos ♪ da cena para ouvir o que é cada coisa</b><div class="contagem" id="hsContagem">${hs.map((_,i)=>`<i class="${P.hotspots&&P.hotspots[i]?'on':''}"></i>`).join('')}<span>${vistos}/${hs.length}</span></div></div>
      <div class="hs-chips" id="hsChips">${hs.map((h,i)=>`<button type="button" class="hs-chip${P.hotspots&&P.hotspots[i]?' visto':''}" data-hs="${i}">♪ ${h.pt}</button>`).join('')}</div>
    </div><div id="hsPilula" hidden></div>`:''}
    ${explorou()?`<div class="row"><span class="spacer"></span><button type="button" class="btn primary" id="f1Prox">👂 Agora: ouça e ache na cena →</button></div>`:''}`;
  if($('hsChips')) $('hsChips').onclick=e=>{ const b=e.target.closest('.hs-chip'); if(b) openHotspot(+b.dataset.hs); };
  if($('f1Prox')) $('f1Prox').onclick=()=>{ f1Ver=1; renderF1(); };
}
/* 👂 ouça e ache: o personagem pergunta onde está; a pessoa toca no objeto certo da cena */
function f1Escuta(){
  const L=hsComPalavra();
  if(L.length<2){ f1Ver=2; return renderF1(); }
  if(!esc||esc.fim) esc={fila:shuffle(L.map(o=>o.i)),acertos:0,erros:0,alvo:null,fim:false};
  if(esc.alvo==null) esc.alvo=esc.fila.shift();
  const o=L.find(x=>x.i===esc.alvo), w=o.w, h=o.h;
  /* objeto: "〜は どこですか？"; frase (cumprimento, pedido…): o personagem diz a frase e a pessoa toca onde ela acontece */
  const q=h.onde?`${w.k}は どこですか？`:h.say, qro=h.onde?`${w.r} wa doko desu ka?`:String(h.say).split(/\s+/).map(roWord).join(' ');
  fala(`<span class="fc-who">${A.npc.nome}</span><b lang="ja">${q}</b><span class="ro">${qro}</span><button type="button" class="fc-say" id="fcSay" aria-label="Ouvir de novo">🔊</button>`);
  $('falaCena').querySelector('#fcSay').onclick=e=>{ e.stopPropagation(); speak(q); };
  $('f1Body').innerHTML=`<div class="hs-box esc">
      <div class="hs-head"><b>👂 Ouça e toque, na cena, no lugar certo</b><div class="contagem">${L.map((_,k)=>`<i class="${k<esc.acertos?'on':''}"></i>`).join('')}<span>${esc.acertos}/${L.length}</span></div></div>
      <p class="pt" style="margin:0">Sem português aqui: só o ouvido. O que a pessoa disse está no balão da cena.</p>
      <div class="row"><button type="button" class="btn" id="escOuvir">🔊 Ouvir de novo</button></div>
      <p class="hint" id="escHint"></p></div>`;
  $('escOuvir').onclick=()=>speak(q);
  mostraPalco(); speak(q);
}
function respondeEscuta(idx){
  const L=hsComPalavra(), h=hsLista()[idx];
  if(idx===esc.alvo){
    esc.acertos++; speak(h.say); mood='ok'; sparkle(['👂','✨','💧']);
    if(esc.fila.length){ esc.alvo=null; setTimeout(()=>{ mood='idle'; f1Escuta(); },1100); }
    else { esc.fim=true; esc.alvo=null; a1().esc=1; persist(); gainXP(10); fala(`<b>せいかい！</b> <span>Você achou tudo só de ouvir.</span>`);
      $('f1Body').innerHTML=`<div class="hs-box esc ok"><div class="hs-head"><b>👂 Ouvido afiado! ${L.length}/${L.length}</b></div></div><div class="row"><span class="spacer"></span><button type="button" class="btn primary" id="f1Prox">🧩 Agora: monte a frase →</button></div>`;
      $('f1Prox').onclick=()=>{ f1Ver=2; renderF1(); }; renderF1Nav(); }
  } else {
    esc.erros++; const w=(A.words||[]).find(x=>x.id===h.wordId);
    speak(h.say);
    const eh=$('escHint'); if(eh) eh.innerHTML=`Isso aí é <b lang="ja">${w?w.k:h.say}</b>${w?` <span class="ro">(${w.r})</span>`:''}. Ouça de novo e procure outra coisa.`;
  }
}
function renderF1Nav(){ const f=f1Atual(), feito=[explorou(),!!a1().esc||hsComPalavra().length<2,moldesOk()];
  $('f1Nav').innerHTML=F1.map((x,k)=>`<button type="button" class="f1-b${k===f?' now':''}${feito[k]?' ok':''}" data-f="${k}"><span>${feito[k]?'✓':x.ico}</span>${x.nome}</button>`).join(''); }
/* 🧩 monte a frase: troca as peças do molde e ouve; a frase aparece no balão da cena */
function moldePartes(m,sel){ return m.parts.map(p=>typeof p==='number'?Object.assign({slot:true},sel[p]):tok(p)); }
function moldeTexto(m,sel,key){ const t=m[key]; if(typeof t==='function') return t(sel); if(t) return t.replace(/\{(\d)\}/g,(_,d)=>sel[+d][key]); return sel[0][key]; }
function f1Moldes(){
  const MS=A.moldes||[]; if(!MS.length){ $('f1Body').innerHTML='<p class="pt">Este mapa não tem moldes.</p>'; return; }
  mi=Math.min(mi,MS.length-1); const m=MS[mi];
  if(!msel||msel.mi!==mi) msel={mi,sel:m.slots.map(o=>o[0])};
  const sel=msel.sel, partes=moldePartes(m,sel), jp=partes.map(p=>p.h||p.k).join(' '), say=partes.map(p=>p.k).join(' '), ro=partes.map(p=>p.r).join(' ');
  const pt=moldeTexto(m,sel,'pt'), ouvidas=Object.keys(a1().mol[mi]||{}).length, precisa=Math.min(2,combos(m));
  fala(`<span class="fc-who">${meName}</span><b lang="ja">${jp}</b><span class="ro">${ro}</span><span class="fc-pt">${pt}</span>`);
  $('f1Body').innerHTML=`<div class="mol-tabs">${MS.map((x,k)=>`<button type="button" class="mol-t${k===mi?' now':''}${molDone(k)?' ok':''}" data-m="${k}">${molDone(k)?'✓':k+1}</button>`).join('')}</div>
    <div class="mol-card">
      <div class="mol-h"><b>🧩 ${m.titulo}</b><span class="mol-n">${Math.min(ouvidas,precisa)}/${precisa} versões</span></div>
      <div class="mol-tpl" lang="ja">${m.tpl} <span class="ro">· ${m.tplRo}</span></div>
      ${m.slots.map((ops,si)=>`<div class="mol-ops">${ops.map((o,oi)=>`<button type="button" class="mol-op${sel[si]===o?' now':''}" data-s="${si}" data-o="${oi}"><b lang="ja">${o.h||o.k}</b><small>${o.r}</small></button>`).join('')}</div>`).join('')}
      <p class="pt" style="margin:0">💡 ${m.gram}${m.use?` <span class="mol-use">· ${m.use}</span>`:''}</p>
      <p class="pt" style="margin:0">Troque as peças e ouça: cada frase nova aparece no balão da cena. Ouça <b>${precisa} versões</b> para fechar este molde.</p>
      <div class="row"><button type="button" class="btn primary" id="molOuvir">🔊 Ouvir a frase</button><span class="spacer"></span>${mi<MS.length-1&&molDone(mi)?'<button type="button" class="btn" id="molProx">Próximo molde →</button>':''}</div>
    </div>`;
  const ouvir=()=>{ speak(say); const k=sel.map(o=>o.k).join('|'); const r=a1().mol; r[mi]=r[mi]||{}; const novo=!r[mi][k]; r[mi][k]=1; persist();
    if(novo&&molDone(mi)&&Object.keys(r[mi]).length===precisa){ sparkle(['🧩','✨','🌸']); gainXP(5); }
    mood='ok'; renderStage(); setTimeout(()=>{ mood='idle'; },900);
    f1Moldes(); renderF1Nav(); if(moldesOk()&&explorou()&&(a1().esc||hsComPalavra().length<2)) { renderF1Nav(); fecharAto1(); const b=$('btnIrAto2'); if(b){ b.classList.add('primary'); b.textContent='💧 Ato 1 completo! Ir para o Ato 2: Agir no diálogo →'; } } };
  $('molOuvir').onclick=ouvir;
  $('f1Body').querySelectorAll('.mol-op').forEach(b=>b.onclick=()=>{ sel[+b.dataset.s]=m.slots[+b.dataset.s][+b.dataset.o]; ouvir(); });
  $('f1Body').querySelectorAll('.mol-t').forEach(b=>b.onclick=()=>{ mi=+b.dataset.m; f1Moldes(); });
  if($('molProx')) $('molProx').onclick=()=>{ mi++; f1Moldes(); };
}

/* ---------- ATO 2 · 🔥 FOGO · Agir no diálogo ---------- */
const SEQS=c=>[{ans:c.ans,ansPt:c.ansPt}].concat(c.alts||[]);
const NSLOT=c=>Math.max(...SEQS(c).map(q=>q.ans.length));
const CASA=(c,q)=>q.ans.length===placed.length&&placed.every((k,j)=>[].concat(q.ans[j]).some(t=>t.k===bank[k].k));
function bancoDe(c){
  const vis=new Set(), out=[];
  [].concat(...SEQS(c).map(q=>[].concat(...q.ans))).concat(c.extra).forEach(t=>{ if(!vis.has(t.k)){ vis.add(t.k); out.push(t); } });
  return shuffle(out);
}
function trocaVeg(on){ VEG=on; CENAS=(VEG&&CENAS_V)?CENAS_V:CENAS_N; done={}; okPt={}; ci=0; }

function stAto2(){ if(!(P.assistiu||{})[VEG?'v':'n']&&!jaVez) return assistir(); loadCena(ci); }
/* ---------- ▶ ASSISTIR (input): a cena inteira passa sozinha antes da sua vez ---------- */
let assist=null, jaVez=false;
const tok0=t=>[].concat(t)[0], tokK=t=>{ t=tok0(t); return typeof t==='string'?t.split('|')[0]:t.k; }, tokR=t=>{ t=tok0(t); return typeof t==='string'?(t.split('|')[1]||''):(t.r||''); };
const durFala=t=>1300+String(t).replace(/<[^>]+>/g,'').length*170;
function assistir(){
  clearTimeout(clipT); fala(null); propsCena={}; done={}; okPt={};
  assist={i:0,f:'leg',pausa:false,fim:false};
  $('panel').innerHTML=`
    <div class="row clip-topo"><span class="elem fogo"><i></i>Ato 2 de 3 · ▶ Assista à cena</span><span class="spacer"></span><div class="stamps" id="stamps"></div></div>
    <p class="a1-missao">Só assista e escute: é a cena inteira, do jeito que acontece no Japão. Depois é a sua vez.</p>
    <div class="clip-mob" id="clipMob"></div>
    <div class="row as-ctl"><button class="btn small" type="button" id="asPausa">⏸ pausar</button><button class="btn small" type="button" id="asDeNovo">↺ do começo</button>
      <span class="spacer"></span><button class="btn small" type="button" id="asVez">🎤 Pular para a sua vez →</button></div>`;
  $('asPausa').onclick=()=>{ assist.pausa=!assist.pausa; $('asPausa').textContent=assist.pausa?'▶ continuar':'⏸ pausar'; if(!assist.pausa) passoAssist(); else clearTimeout(clipT); };
  $('asDeNovo').onclick=()=>assistir();
  $('asVez').onclick=()=>comecarVez();
  stageOpt={}; $('clip').hidden=false; document.body.classList.add('modo-clipe'); renderStage(); passoAssist(); mostraPalco();
}
function passoAssist(){
  if(!assist||assist.pausa||ato!==1) return;
  const c=CENAS[assist.i]; if(!c) return fimAssist();
  const ans=c.ans, jp=ans.map(tokK).join(' '), ro=ans.map(tokR).join(' '), rea=(c.reage||[])[0];
  $('stamps').innerHTML=CENAS.map((_,k)=>`<span class="stamp ${k<assist.i?'ok':k===assist.i?'now':''}">${k<assist.i?'✓':k+1}</span>`).join('');
  const quem=c.quem||A.npc.nome, cp=$('clip'); let npc='',me='',leg='',prox,espera;
  if(assist.f==='leg'){ if(!c.clima){ assist.f='npc'; return passoAssist(); }
    leg=`<div class="clip-leg"><span>${c.clima}</span></div>`; prox='npc'; espera=2400; }
  else if(assist.f==='npc'){ npc=balaoA(quem,c.q,c.ro,c.pt,'npc'); speak(c.say); prox='me'; espera=durFala(c.say); }
  else if(assist.f==='me'){ npc=balaoA(quem,c.q,c.ro,c.pt,'npc apaga'); me=balaoA(meName,jp,ro,c.ansPt,'me'); speak(jp); prox=rea&&rea.jp?'rea':'next'; espera=durFala(jp);
    mood='ok'; if(rea&&rea.prop&&!rea.jp){ propsCena[assist.i]=rea.prop; } renderStage(); }
  else if(assist.f==='rea'){ npc=balaoA(quem,rea.jp,roFrase(rea.jp),rea.t,'npc rea'); me=balaoA(meName,jp,ro,c.ansPt,'me ok apaga'); speak(rea.jp);
    if(rea.prop) propsCena[assist.i]=rea.prop; renderStage(); prox='next'; espera=durFala(rea.jp); }
  cp.innerHTML=`${leg}<div class="clip-npc">${npc}</div><div class="clip-me">${me}</div>`;
  if($('clipMob')) $('clipMob').innerHTML='';
  clipT=setTimeout(()=>{ mood='idle'; if(prox==='next'){ assist.i++; assist.f='leg'; } else assist.f=prox; passoAssist(); },espera);
}
function balaoA(who,jp,ro,pt,cls){ return `<div class="cb ${cls}"><span class="cb-who">${who}</span><b lang="ja">${jp}</b><span class="ro">${ro}</span><small class="cb-pt">${pt}</small></div>`; }
function fimAssist(){
  assist.fim=true; (P.assistiu=P.assistiu||{})[VEG?'v':'n']=1; persist();
  $('stamps').innerHTML=CENAS.map(()=>`<span class="stamp ok">✓</span>`).join('');
  $('clip').innerHTML=`<div class="a1-ov"><div class="a1-card"><div class="a1-ic">🎬</div><b class="a1-jp">つぎは あなたの ばん！</b><span class="ro-sempre">tsugi wa anata no ban!</span>
    <span class="a1-pt">Agora é a sua vez de falar.</span>
    <div class="a1-bt"><button type="button" class="a1-r" id="asRever">↺ ver de novo</button><button type="button" class="a1-go" id="asIr">🎤 Começar →</button></div></div></div>`;
  $('asRever').onclick=e=>{ e.stopPropagation(); assistir(); };
  $('asIr').onclick=e=>{ e.stopPropagation(); comecarVez(); };
}
function comecarVez(){ clearTimeout(clipT); assist=null; jaVez=true; propsCena={}; done={}; okPt={}; mood='idle'; $('clip').innerHTML=''; $('clip').hidden=!A.clipe; loadCena(0); }
function loadCena(n){
  if(A.clipe) return loadClipe(n);
  ci=Math.max(0,Math.min(CENAS.length-1,n));
  const c=CENAS[ci];
  bank=bancoDe(c); placed=[]; mood='idle';
  $('panel').innerHTML=`
    <div class="row"><span class="elem fogo"><i></i>Ato 2 de 3 · 🔥 Fogo · Agir no Diálogo</span><span class="spacer"></span><div class="stamps" id="stamps"></div></div>
    ${CENAS_V?`<div class="row"><button class="btn small vegbtn" type="button" id="btnVeg" aria-pressed="${VEG}">🥗 ${VEG?'Modo vegetariano ativo · voltar ao normal':'Praticar cena adaptada (vegetariana / ほんだし)'}</button></div>`:''}
    ${c.clima?`<p class="clima">🎬 ${rk(c.clima)}</p>`:''}${c.nota?`<p class="nota-cult">${rk(c.nota)}</p>`:''}
    <div class="talk" style="padding:0"><div class="bubble npc" id="npcBubble"></div><div class="bubble me" id="meBubble"></div></div>
    <p class="hint" id="hint"></p>
    <div class="bank" id="bank"></div>
    <div class="actions">
      <button class="btn" type="button" id="btnListen">🔊 Ouvir</button>
      <button class="btn" type="button" id="btnSlow">🐢 Devagar</button>
      ${c.molde!=null?'<button class="btn" type="button" id="btnMolde">📐 Ver molde</button>':''}
      <button class="btn" type="button" id="btnClear">↺ Limpar</button>
      <button class="btn primary" type="button" id="btnCheck" disabled>Responder</button>
      <button class="btn primary" type="button" id="btnNext" hidden>Próximo turno →</button>
    </div>
    <div class="exnav">
      <button class="btn small" type="button" id="exPrev" ${ci===0?'disabled':''}>← Turno anterior</button>
      <button class="btn small" type="button" id="exRedo">↺ Refazer turno</button>
    </div>`;
  if($('btnVeg')) $('btnVeg').onclick=()=>{ trocaVeg(!VEG); loadCena(0); };
  $('exPrev').onclick=()=>{ if(ci>0) loadCena(ci-1); };
  $('exRedo').onclick=()=>{ delete done[ci]; loadCena(ci); };
  wireCena(); renderCena();
  hint(done[ci]?'Você já resolveu este turno.':(c.dica?`🎯 ${c.dica}${(nomeAuto&&JSON.stringify(c.ans).includes(kanaName))?` Seu nome em katakana saiu como <b>${kanaName}</b>.`:''} · `:'')+'Toque nas peças <b>na ordem certa</b> para responder.');
  speak(c.say);
}
function hint(t){ if($('hint')) $('hint').innerHTML=t; }

function renderCena(){
  setStage({stamp:!!done[ci]});
  const c=CENAS[ci], ok=!!done[ci];
  $('npcBubble').innerHTML=`
    <div class="who"><span>${c.quem||A.npc.nome}</span><button class="say" type="button" id="sayQ" aria-label="Ouvir">🔊</button></div>
    <div class="jp" lang="ja">${c.q}</div><div class="ro">${c.ro}</div><div class="pt">${c.pt}</div>
    <button class="btn qbbtn" type="button" id="qbCena" aria-expanded="false">🔍 Palavra por palavra</button><div id="qbCenaBox"></div>`;
  $('sayQ').onclick=()=>speak(c.say);
  $('qbCena').onclick=()=>{
    const bx=$('qbCenaBox'), ab=!bx.innerHTML;
    bx.innerHTML=ab?quebraHTML(c.say):'';
    $('qbCena').setAttribute('aria-expanded',String(ab));
    if(ab){ const list=quebraFrase(c.say,A.words); bx.onclick=e=>{ const b=e.target.closest('.qbk'); if(b) speak(list[+b.dataset.qb].k); }; }
  };
  $('meBubble').className='bubble me'+(ok?' ok':'');
  $('meBubble').innerHTML=`
    <div class="who"><span>${meName}</span>${ok?'<span>✓ resolvido</span>':''}</div>
    ${(c.tarefa&&!ok)?`<div class="tarefa">🎯 ${typeof c.tarefa==='string'?c.tarefa:'Responda: “'+c.ansPt+'”'}</div>`:''}
    <div class="slots">${Array.from({length:NSLOT(c)},(_,k)=>{ const t=placed[k]!==undefined?bank[placed[k]]:null;
      return t?`<button type="button" class="slot filled" data-k="${k}"><span><b>${t.k}</b><small>${t.r}</small></span></button>`:`<span class="slot"></span>`; }).join('')}</div>
    ${ok?`<div class="pt">${okPt[ci]||c.ansPt}</div>`:''}`;
  $('bank').innerHTML=bank.map((t,k)=>`<button type="button" class="tile ${placed.includes(k)?'used':''}" data-k="${k}" ${ok?'disabled':''}><b>${t.k}</b><small>${t.r}</small></button>`).join('');
  const full=SEQS(c).some(q=>q.ans.length===placed.length);
  $('btnCheck').disabled=!full||ok; $('btnCheck').hidden=ok;
  $('btnNext').hidden=!ok&&!IS_LOCAL;
  $('btnNext').textContent=ci<CENAS.length-1?'Próximo turno →':'Concluir diálogo · Ir para o Ato 3 🌱 →';
  $('btnClear').hidden=ok;
  $('stamps').innerHTML=CENAS.map((_,k)=>`<span class="stamp ${done[k]?'ok':k===ci?'now':''}">${done[k]?'OK':k+1}</span>`).join('');
}

function wireCena(){
  $('bank').onclick=e=>{
    const b=e.target.closest('.tile'); if(!b||done[ci]) return;
    const k=+b.dataset.k; if(placed.includes(k)||placed.length>=NSLOT(CENAS[ci])) return;
    placed.push(k); speak(bank[k].k); mood='idle'; renderCena();
  };
  $('meBubble').onclick=e=>{
    const b=e.target.closest('.slot.filled'); if(!b||done[ci]) return;
    placed.splice(+b.dataset.k,1); mood='idle'; renderCena();
  };
  $('btnClear').onclick=()=>{ placed=[]; mood='idle'; renderCena(); };
  $('btnListen').onclick=()=>speak(CENAS[ci].say);
  $('btnSlow').onclick=()=>speak(CENAS[ci].say,.55);
  if($('btnMolde')) $('btnMolde').onclick=()=>{
    const k=CENAS[ci].molde, m=A.moldes[k];
    if(m) hint(`📐 <b>Molde:</b> ${m.tpl.replace(/<\/?i>/g,'')} <span class="ro">(${m.tplRo})</span> · ${m.gram}`);
  };
  $('btnCheck').onclick=()=>{
    const c=CENAS[ci], hit=SEQS(c).find(q=>CASA(c,q)), right=!!hit;
    if(right){
      done[ci]=true; okPt[ci]=hit.ansPt; mood='ok';
      const rIdx=SEQS(c).findIndex(q=>CASA(c,q)), rea=(c.reage||[])[rIdx]; if(rea&&rea.prop) propsCena[ci]=rea.prop; else delete propsCena[ci];
      renderCena();
      speak(placed.map(k=>bank[k].k).join(' '));
      sparkle(['🔥','💖','✨','🌸','⭐']);
      hint(`<b>せいかい！</b> ${hit.ansPt}${rea?`<span class="reage">💬 ${rk(rea.t)}</span>`:(SEQS(c).length>1?' <span class="ro">(há mais de um jeito certo)</span>':'')}`);
    } else {
      mood='wrong'; renderStage();
      if(c.erroNpc){
        /* 1º erro: só a reação do personagem; do 2º em diante, a dica também */
        errosTurno[ci]=(errosTurno[ci]||0)+1;
        const partes=String(c.erroNpc).split(/\s*(?=Dica:|Comece|Responda com|Confirme:|Use )/);
        const reacao=partes[0], dica=partes.slice(1).join(' ');
        const txt=(errosTurno[ci]>1||!dica)?c.erroNpc:reacao;
        hint(`<span class="erro-npc">💬 <b>${c.quem||A.npc.nome}:</b> ${txt}</span>${errosTurno[ci]>1||!dica?(c.molde!=null?' Toque em <b>📐 Ver molde</b> ou ajuste as peças no balão.':' Ajuste as peças no balão e tente de novo.'):' Tente de novo.'}`);
      } else {
        hint(`<b>Hmm…</b> a pessoa ficou confusa. ${c.molde!=null?'Toque em <b>📐 Ver molde</b> ou ':''}toque numa peça do balão para trocar.`);
      }
      setTimeout(()=>{ if(mood==='wrong'){ mood='idle'; renderStage(); } },2200);
    }
  };
  $('btnNext').onclick=()=>{
    if(ci<CENAS.length-1) return loadCena(ci+1);
    const first=!P.steps[2];
    P.steps[2]=1; persist();
    if(first) gainXP(20);
    sparkle(['🔥','🎉','✨','⭐']);
    goAto(2);
  };
}

/* ---------- ATO 2 em modo “clipe”: tudo acontece dentro da imagem ----------
   legenda curta → o personagem fala (balão) → cartas de intenção (se houver escolha) → peças na faixa da cena →
   sua frase no balão do avatar → reação em japonês + objeto no balcão → ▶ continua */
let clipT=null, clipFase='leg', grupo=null, cEf=null;
function cenaEfetiva(c){
  if(!c.escolhas||grupo==null) return c;
  const S=SEQS(c), g=c.escolhas[grupo].seqs.map(i=>S[i]);
  return Object.assign({},c,{ans:g[0].ans,ansPt:g[0].ansPt,alts:g.slice(1)});
}
function loadClipe(n){
  ci=Math.max(0,Math.min(CENAS.length-1,n));
  const c=CENAS[ci]; grupo=null; placed=[]; mood='idle'; clearTimeout(clipT);
  cEf=cenaEfetiva(c); bank=bancoDe(cEf);
  $('panel').innerHTML=`
    <div class="row clip-topo"><span class="elem fogo"><i></i>Ato 2 de 3 · 🔥 Diálogo</span><span class="spacer"></span><div class="stamps" id="stamps"></div></div>
    <div class="row clip-ferr">
      <button class="btn small" type="button" id="exPrev" ${ci===0?'disabled':''}>← anterior</button>
      <button class="btn small" type="button" id="exRedo">↺ refazer</button>
      <button class="btn small" type="button" id="qbCena" aria-expanded="false">🔍 palavra por palavra</button>
      <span class="spacer"></span>
      <button class="btn small" type="button" id="exPular" hidden>pular ▸</button>
    </div>
    <div id="qbCenaBox"></div>`;
  $('panel').insertAdjacentHTML('afterbegin','<div class="clip-mob" id="clipMob"></div>');
  $('exPrev').onclick=()=>{ if(ci>0) loadClipe(ci-1); };
  $('exRedo').onclick=()=>{ delete done[ci]; delete propsCena[ci]; loadClipe(ci); };
  $('qbCena').onclick=()=>{ const bx=$('qbCenaBox'), ab=!bx.innerHTML; bx.innerHTML=ab?quebraHTML(c.say):''; $('qbCena').setAttribute('aria-expanded',String(ab));
    if(ab){ const list=quebraFrase(c.say,A.words); bx.onclick=e=>{ const b=e.target.closest('.qbk'); if(b) speak(list[+b.dataset.qb].k); }; } };
  $('stamps').innerHTML=CENAS.map((_,k)=>`<span class="stamp ${done[k]?'ok':k===ci?'now':''}">${done[k]?'OK':k+1}</span>`).join('');
  const cp=$('clip'); cp.hidden=false;
  if(done[ci]){ clipFase='ok'; renderStage(); return renderClipe(); }
  clipFase=c.clima?'leg':'fala'; renderStage(); renderClipe();
  if(clipFase==='leg') clipT=setTimeout(()=>{ clipFase='fala'; renderClipe(); speak(c.say); clipT=setTimeout(proximaFase,1600); },c.nota?3400:2200);
  else { speak(c.say); clipT=setTimeout(proximaFase,1400); }
  mostraPalco();
}
function proximaFase(){ const c=CENAS[ci]; if(done[ci]) return; clipFase=c.escolhas?'escolha':'montar'; renderClipe(); }
function renderClipe(){
  const c=CENAS[ci], cp=$('clip'), ok=!!done[ci], cur=cEf||c;
  const npcB=`<div class="cb npc${mood==='wrong'?' hm':''}"><span class="cb-who">${c.quem||A.npc.nome}<button type="button" class="cb-say" data-say="q" aria-label="Ouvir">🔊</button></span><b lang="ja">${c.q}</b><span class="ro">${c.ro}</span><small class="cb-pt">${c.pt}</small></div>`;
  let html='';
  if(clipFase==='leg'){
    html=`<div class="clip-leg"><span>${c.clima}</span>${c.nota?`<em>💡 ${rk(c.nota)}</em>`:''}</div>`;
  } else {
    let npc=npcB, me='';
    if(ok){ const r=(c.reage||[])[okIdx[ci]||0];
      if(r&&r.jp) npc=`<div class="cb npc rea"><span class="cb-who">${c.quem||A.npc.nome}<button type="button" class="cb-say" data-say="r" aria-label="Ouvir">🔊</button></span><b lang="ja">${r.jp}</b><span class="ro">${roFrase(r.jp)}</span><small class="cb-pt">${r.t}</small></div>`;
      me=`<div class="cb me ok"><span class="cb-who">${meName} ✓</span><b lang="ja">${okJp[ci]||''}</b><small class="cb-pt">${okPt[ci]||c.ansPt}</small></div>`;
    } else if(clipFase==='montar'){
      me=`<div class="cb me"><span class="cb-who">${meName}</span><div class="cb-slots" id="cbSlots">${Array.from({length:NSLOT(cur)},(_,k)=>{ const t=placed[k]!==undefined?bank[placed[k]]:null;
        return t?`<button type="button" class="slot filled" data-k="${k}"><b>${t.k}</b><small>${t.r}</small></button>`:`<span class="slot"></span>`; }).join('')}</div></div>`;
    }
    let hud='';
    if(ok) hud=`<div class="clip-hud fim"><button type="button" class="clip-go" id="clipGo">${ci<CENAS.length-1?'▶ continuar':'▶ fechar a cena · Ato 3 🌱'}</button></div>`;
    else if(clipFase==='escolha') hud=`<div class="clip-hud"><p class="clip-q">O que você quer?</p><div class="clip-cartas">${c.escolhas.map((e,k)=>`<button type="button" class="clip-carta" data-g="${k}"><span>${e.ico}</span>${e.t}</button>`).join('')}</div></div>`;
    else if(clipFase==='montar') hud=`<div class="clip-hud"><div class="clip-bank" id="clipBank">${bank.map((t,k)=>`<button type="button" class="tile ${placed.includes(k)?'used':''}" data-k="${k}"><b>${t.k}</b><small>${t.r}</small></button>`).join('')}</div>
      <div class="clip-ic"><button type="button" data-a="ouvir" title="Ouvir">🔊</button><button type="button" data-a="devagar" title="Devagar">🐢</button>${c.molde!=null?'<button type="button" data-a="molde" title="Ver molde">📐</button>':''}<button type="button" data-a="limpar" title="Limpar">↺</button>
      <button type="button" class="clip-ok" id="clipOk" ${SEQS(cur).some(q=>q.ans.length===placed.length)?'':'disabled'}>Responder ✓</button></div>
      <p class="clip-dica" id="clipDica">${clipDica||''}</p></div>`;
    /* no celular a faixa de jogo sai da imagem e fica logo abaixo dela */
    const mob=window.matchMedia&&matchMedia('(max-width:640px)').matches;
    html=`<div class="clip-npc">${npc}</div><div class="clip-me">${me}</div>${mob?'':hud}`;
    if($('clipMob')) $('clipMob').innerHTML=mob?hud:'';
  }
  if(clipFase==='leg'&&$('clipMob')) $('clipMob').innerHTML='';
  cp.innerHTML=html; cp.dataset.fase=ok?'ok':clipFase;
  const R=sel=>[...cp.querySelectorAll(sel)].concat($('clipMob')?[...$('clipMob').querySelectorAll(sel)]:[]);
  cp.querySelectorAll('.cb-say').forEach(b=>b.onclick=e=>{ e.stopPropagation(); if(b.dataset.say==='q') speak(c.say); else { const r=(c.reage||[])[okIdx[ci]||0]; if(r) speak(r.jp); } });
  R('.clip-carta').forEach(b=>b.onclick=e=>{ e.stopPropagation(); grupo=+b.dataset.g; cEf=cenaEfetiva(c); bank=bancoDe(cEf); placed=[]; clipFase='montar'; clipDica=''; renderClipe(); });
  if($('clipBank')) $('clipBank').onclick=e=>{ e.stopPropagation(); const b=e.target.closest('.tile'); if(!b) return; const k=+b.dataset.k; if(placed.includes(k)||placed.length>=NSLOT(cur)) return; placed.push(k); speak(bank[k].k); mood='idle'; renderClipe(); };
  if($('cbSlots')) $('cbSlots').onclick=e=>{ e.stopPropagation(); const b=e.target.closest('.slot.filled'); if(!b) return; placed.splice(+b.dataset.k,1); renderClipe(); };
  R('.clip-ic [data-a]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const a=b.dataset.a;
    if(a==='ouvir') speak(c.say); if(a==='devagar') speak(c.say,.55); if(a==='limpar'){ placed=[]; renderClipe(); }
    if(a==='molde'){ const m=A.moldes[c.molde]; if(m){ clipDica=`📐 ${m.tpl.replace(/<\/?i>/g,'')} <span class="ro">(${m.tplRo})</span>`; renderClipe(); } } });
  if($('clipOk')) $('clipOk').onclick=e=>{ e.stopPropagation(); responderClipe(); };
  if($('clipGo')) $('clipGo').onclick=e=>{ e.stopPropagation(); avancaClipe(); };
  $('exPular').hidden=!(IS_LOCAL&&!ok);
  $('exPular').onclick=()=>avancaClipe();
}
let clipDica='', okIdx={}, okJp={};
const roFrase=t=>String(t).split(/\s+/).map(p=>{ const m=p.match(/^(.*?)([！？!?。、]*)$/); return roWord(m[1])+(m[2]?m[2].replace('！','!').replace('？','?').replace('。','.').replace('、',','):''); }).join(' ');
function responderClipe(){
  const c=CENAS[ci], cur=cEf||c, hit=SEQS(cur).find(q=>CASA(cur,q));
  if(hit){
    done[ci]=true; okPt[ci]=hit.ansPt; okJp[ci]=placed.map(k=>bank[k].k).join(' ');
    const rIdx=Math.max(0,SEQS(c).findIndex(q=>CASA(c,q))); okIdx[ci]=rIdx;
    const rea=(c.reage||[])[rIdx]; if(rea&&rea.prop) propsCena[ci]=rea.prop; else delete propsCena[ci];
    mood='ok'; clipDica=''; speak(okJp[ci]); sparkle(['🔥','✨','🌸']);
    renderStage(); renderClipe();
    $('stamps').innerHTML=CENAS.map((_,k)=>`<span class="stamp ${done[k]?'ok':k===ci?'now':''}">${done[k]?'OK':k+1}</span>`).join('');
    if(rea&&rea.jp) clipT=setTimeout(()=>speak(rea.jp),1500);
  } else {
    mood='wrong'; renderStage();
    errosTurno[ci]=(errosTurno[ci]||0)+1;
    const partes=String(c.erroNpc||'').split(/\s*(?=Dica:|Comece|Responda com|Confirme:|Use )/);
    clipDica=c.erroNpc?`💬 ${errosTurno[ci]>1?rk(c.erroNpc):partes[0]}`:'💬 Hmm… a pessoa não entendeu. Troque uma peça e tente de novo.';
    renderClipe(); clipT=setTimeout(()=>{ if(mood==='wrong'){ mood='idle'; renderStage(); renderClipe(); } },1800);
  }
}
function avancaClipe(){
  if(ci<CENAS.length-1) return loadClipe(ci+1);
  const first=!P.steps[2]; P.steps[2]=1; persist(); if(first) gainXP(20); sparkle(['🔥','🎉','✨','⭐']); goAto(2);
}

/* ---------- ATO 3 · 🌱 TERRA · Gravar frase no Caderno ---------- */
function stAto3(){
  setStage({stamp:true});
  const nota=lerNotaCaderno(A.slug);
  const k=ORDEM.indexOf(A.slug), nx=k>=0?ORDEM[k+1]:null, terr=PROVA_TERR[A.slug];
  const cp=A.cadernoPrompt||{molde:A.moldes[0]?A.moldes[0].tpl.replace(/<[^>]+>/g,''):'',moldeH:A.moldes[0]?A.moldes[0].tpl:'',dica:'Registre uma frase deste mapa no seu Caderno.'};
  const sugestoes=(A.moldes||[]).slice(0,3).map(m=>{
    const sel=m.slots.map(s=>s[0]);
    const parts=m.parts.map(p=>typeof p==='number'?sel[p]:tok(p));
    return {k:parts.map(p=>p.k).join(' '), r:parts.map(p=>p.r).join(' ')};
  });
  $('panel').innerHTML=`
    <span class="elem terra"><i></i>Ato 3 de 3 · 🌱 Terra · Gravar Frase no Caderno</span>
    <h2>${A.emoji} ${A.titulo} — Missão concluída!</h2>
    <p class="lead">${A.fim}</p>
    ${A.fio&&A.fio.proximo?`<div class="fio-next"><span>🗺️ ${A.fio.proximo}</span></div>`:''}
    <div class="caderno-card${nota?' ok':''}" id="cadCard">
      <div class="hc-head"><b>📒 Sua frase para o Caderno</b>${nota?'<span class="hc-badge">✓ Salvo</span>':''}</div>
      <p class="pt" style="margin:0">${cp.dica}</p>${A.ancora?`<p class="ancora">🌙 ${A.ancora}</p>`:''}
      ${cp.moldeH?`<div class="moldebox"><div class="jpl" lang="ja">${cp.moldeH}</div></div>`:''}
      ${sugestoes.length?`<div class="sug-row"><span class="pt">Ou toque num exemplo para começar:</span>${sugestoes.map((s,i)=>`<button type="button" class="sug-btn" data-sug="${i}"><b lang="ja">${s.k}</b><small class="ro">${s.r}</small></button>`).join('')}</div>`:''}
      <div class="acoes">
        ${SR?'<button type="button" class="mic" id="btnMic">🎤 Falar em japonês</button>':''}
        <button type="button" class="btn small" id="btnOuvirFrase">🔊 Ouvir minha frase</button>
      </div>
      <div class="escrita">
        <input type="text" id="inpCaderno" placeholder="Digite sua frase em kana ou romaji..." value="${(nota&&nota.conteudo||'').replace(/"/g,'&quot;')}" autocomplete="off">
        <button type="button" class="btn sage" id="btnSalvarCaderno">📒 ${nota?'Atualizar no Caderno':'Enviar frase para o Caderno'}</button>
      </div>
      <div class="estado${nota?' ok':''}" id="stCaderno">${nota?'✓ Salvo no Caderno! Esfera 🌱 Terra acesa na Trilha.':''}</div>
    </div>
    <div class="row" style="margin-top:4px">
      <a class="btn" href="/idiomas/japones/">🗺️ Voltar à Trilha</a>
      ${terr?`<a class="btn" href="/idiomas/planeta-utopia/?lang=ja&terr=${terr}&from=trilha">🏅 Prova no Planeta</a>`:''}
      <button type="button" class="btn" id="btnReplay">↺ Jogar mapa novamente</button>
      <span class="spacer"></span>
      ${nx?`<a class="btn primary" href="/idiomas/mapas/${nx}/aula/">Próximo mapa: ${TITULOS[nx]} →</a>`:''}
    </div>`;

  const inp=$('inpCaderno'), st=$('stCaderno');
  $('panel').querySelectorAll('.sug-btn').forEach(b=>b.onclick=()=>{
    const s=sugestoes[+b.dataset.sug];
    inp.value=s.k; speak(s.k); inp.focus();
  });
  $('btnOuvirFrase').onclick=()=>{ const v=inp.value.trim(); if(v) speak(romaji2kana(v)); };
  if(SR && $('btnMic')){
    $('btnMic').onclick=function(){
      const btn=this, r=new SR(); r.lang='ja-JP';
      btn.classList.add('ouvindo'); btn.textContent='🎧 Ouvindo...';
      r.onresult=ev=>{ btn.classList.remove('ouvindo'); btn.textContent='🎤 Falar em japonês'; inp.value=ev.results[0][0].transcript; speak(inp.value); };
      r.onerror=()=>{ btn.classList.remove('ouvindo'); btn.textContent='🎤 Falar em japonês'; st.className='estado erro'; st.textContent='Não pegou o áudio. Fale mais perto ou digite abaixo.'; };
      r.start();
    };
  }
  const salvar=()=>{
    const raw=inp.value.trim();
    if(!raw){ st.className='estado erro'; st.textContent='Escreva (ou fale) sua frase antes de salvar no Caderno.'; inp.focus(); return; }
    const kana=romaji2kana(raw);
    if(salvarNotaCaderno(kana)){
      const first=!P.steps[4];
      P.steps[4]=1; persist();
      if(first) gainXP(15);
      $('cadCard').classList.add('ok');
      $('btnSalvarCaderno').textContent='✓ Salvo no Caderno!';
      st.className='estado ok';
      st.textContent=`✨ Frase "${kana}" salva no Caderno! Esfera 🌱 Terra acesa na Trilha.`;
      speak(kana);
      sparkle(['🌱','📒','✨','🎉']);
      renderSteps();
      renderStage();
    }
  };
  $('btnSalvarCaderno').onclick=salvar;
  inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); salvar(); } };
  $('btnReplay').onclick=()=>{ done={}; okPt={}; propsCena={}; ci=0; goAto(0); };
}

/* ---------- preparação e carga da aula ---------- */
function prep(c){
  return Object.assign({},c,{
    ans:c.ans.map(s=>Array.isArray(s)?s.map(x=>tok(fillName(x))):tok(fillName(s))),
    extra:c.extra.map(s=>tok(fillName(s))),
    q:fillName(c.q), say:fillName(c.say), ro:fillName(c.ro), ansPt:fillName(c.ansPt||''),
    alts:(c.alts||[]).map(a=>({ans:a.ans.map(s=>Array.isArray(s)?s.map(x=>tok(fillName(x))):tok(fillName(s))),ansPt:fillName(a.ansPt||'')}))
  });
}
function prepMolde(m){
  return Object.assign({},m,{
    slots:m.slots.map(opts=>opts.map(o=>Object.assign(tok(fillName(o[0])),{pt:fillName(o[1]),en:fillName(o[2]),h:o[3]||tok(fillName(o[0])).k})))
  });
}

function loadAula(slug){
  const raw=(window.AULAS||{})[slug]; if(!raw) return;
  A=Object.assign({},raw,{
    moldes:raw.moldes.map(prepMolde).map(m=>Object.assign(m,{titulo:rk(m.titulo),gram:rk(m.gram),use:rk(m.use)})),
    intro:{titulo:rk(raw.intro.titulo),txt:raw.intro.txt.map(rk),metas:(raw.intro.metas||[]).map(rk),metasTit:raw.intro.metasTit},
    fio:raw.fio?{anterior:rk(raw.fio.anterior||''),gancho:rk(raw.fio.gancho||''),proximo:rk(raw.fio.proximo||'')}:null,
    cadernoPrompt:raw.cadernoPrompt?{molde:raw.cadernoPrompt.molde||'',moldeH:rk(raw.cadernoPrompt.molde||''),dica:rk(raw.cadernoPrompt.dica||''),dicaRaw:raw.cadernoPrompt.dica||''}:null,
    words:raw.words.map(w=>Object.assign({},w,{tip:rk(w.tip)})),
    fim:rk(raw.fim||''),
    insignia:raw.insignia?rk(raw.insignia):raw.insignia
  });
  const prepC=c=>Object.assign(c,{
    pt:rk(c.pt), ansPt:rk(c.ansPt),
    alts:c.alts.map(a=>Object.assign(a,{ansPt:rk(a.ansPt)})),
    dica:c.dica?rk(c.dica):c.dica,
    erroNpc:c.erroNpc?rk(c.erroNpc):'',
    distr:(c.distr||[]).map(rk)
  });
  CENAS=raw.cenas.map(prep).map(prepC);
  CENAS_N=CENAS;
  CENAS_V=raw.cenasVeg?raw.cenasVeg.map(prep).map(prepC):null;
  VEG=false;
  P=M[slug]=Object.assign({words:{},steps:{},hotspots:{}},M[slug]||{});
  ci=0; done={}; okPt={};
  if($('fx')) $('fx').innerHTML='';
  const pos=ORDEM.indexOf(A.slug);
  document.title=A.docTitle||`Mapa ${String(pos+1).padStart(2,'0')} · ${A.titulo} | Unirversos`;
  if($('eyebrow')) $('eyebrow').innerHTML=`Mapa ${A.num||String(pos+1).padStart(2,'0')} · ${A.titulo} · <span style="text-transform:none;letter-spacing:.05em">${A.jp}</span>`;
  if($('h1')) $('h1').textContent=A.h1;
  if($('stage')) $('stage').setAttribute('aria-label','Cena: '+A.titulo);

  /* botão extra (ex.: Restrições alimentares no Restaurante) */
  const oldB=$('btnExtra'); if(oldB) oldB.remove();
  const oldD=$('drawerExtra'); if(oldD) oldD.remove();
  if(A.extra && $('btnAr')){
    const X=A.extra, b=document.createElement('button');
    b.className='btn small'; b.type='button'; b.id='btnExtra'; b.textContent=X.btn;
    $('btnAr').before(b);
    const d=document.createElement('div'); d.className='drawer'; d.id='drawerExtra'; d.hidden=true;
    d.innerHTML=`<div class="drawer-card" role="dialog" aria-label="${X.titulo}"><div class="drawer-head"><b>${X.titulo}</b><button class="btn small" type="button" data-fecha>Fechar</button></div>
      ${X.intro?`<p class="pt">${rk(X.intro)}</p>`:''}<div class="ar-list">${X.cena?'<button type="button" class="btn primary" data-vegcena style="margin:4px 0 8px">🥗 Praticar a cena adaptada →</button>':''}${X.frases.map((f,i)=>`<button type="button" class="arp" data-x="${i}"><span>🔊</span><span><span class="jp" lang="ja">${rk(f.k)}</span><small>${rk(f.pt)}</small>${f.nota?`<small class="xnota">${rk(f.nota)}</small>`:''}</span></button>`).join('')}</div></div>`;
    document.body.appendChild(d);
    b.onclick=()=>{ d.hidden=false; };
    d.onclick=ev=>{
      if(ev.target===d||ev.target.closest('[data-fecha]')){ d.hidden=true; return; }
      if(ev.target.closest('[data-vegcena]')){ d.hidden=true; trocaVeg(true); goAto(1); return; }
      const x=ev.target.closest('.arp'); if(x) speak(X.frases[+x.dataset.x].k.replace(/＿＿/g,''));
    };
  }

  const L=$('links');
  if(L){
    const nx=pos>=0?ORDEM[pos+1]:null;
    L.innerHTML=`<a href="/idiomas/japones/">🗺️ Caminho dos 12 Mapas</a>${nx?`<a class="nx3" href="/idiomas/mapas/${nx}/aula/"><span class="l1">Próximo mapa: ${TITULOS[nx]} →</span><span class="l2" lang="en">Next: ${TIT_EN[nx]||nx}</span><span class="l3" lang="ja">つぎ：${TIT_JA[nx]||''}</span></a>`:''}`;
  }
  showXP();
  goAto(location.hash==='#cena'?1:0);
}

/* ---------- 🌬️ Ar, Romaji ON/OFF e seletor ---------- */
if($('arList')){
  if(!$('arDuvida')){ const d=document.createElement('div'); d.id='arDuvida'; $('arList').before(d); }
  $('arList').innerHTML=AR.map((g,gi)=>`<details class="gaveta"><summary><span class="gi">${g.ic}</span><span><b>${g.quero}</b><small>${g.sub}</small></span></summary><div class="gbody">${g.frases.map((f,fi)=>`<button type="button" class="arp" data-g="${gi}" data-f="${fi}"><span>🔊</span><span><span class="jp">${f.h}</span><br><span class="ro">${f.r}</span> <span class="pt">${f.pt}</span></span></button>`).join('')}</div></details>`).join('');
  $('arList').onclick=e=>{ const b=e.target.closest('.arp'); if(b) speak(AR[+b.dataset.g].frases[+b.dataset.f].k); };
  $('arList').addEventListener('toggle',e=>{ if(e.target.open) $('arList').querySelectorAll('details.gaveta').forEach(d=>{ if(d!==e.target) d.open=false; }); },true);
}
function arDuvida(){
  const box=$('arDuvida'); if(!box) return;
  const c=(ato===1&&CENAS[ci])?CENAS[ci]:null;
  if(!c||done[ci]){ box.innerHTML=''; return; }
  const B=[
    {k:'ゆっくり はなして ください',h:'ゆっくり '+RR('話','はな')+'して ください',pt:'mais devagar → ouça de novo devagar',a:'devagar'},
    {k:'これで あって いますか',h:'これで '+RR('合','あ')+'って いますか',pt:'está certo assim? → confere suas peças',a:'certo'}
  ];
  box.innerHTML=`<div class="ar-duvida"><b>💡 Ajuda rápida neste turno</b>${B.map((x,i)=>`<button type="button" class="arp" data-d="${i}"><span class="jp">${x.h}</span><small>${x.pt}</small></button>`).join('')}</div>`;
  box.onclick=e=>{
    const b=e.target.closest('[data-d]'); if(!b) return;
    const x=B[+b.dataset.d]; speak(x.k);
    if(x.a==='devagar'){ hint(`🐢 Repetindo devagar: <span class="jp">${c.q}</span>`); setTimeout(()=>speak(c.say,.55),1400); }
    else {
      const Q=SEQS(c), pre=Q.some(q=>placed.length<=q.ans.length&&placed.every((k,j)=>[].concat(q.ans[j]).some(t=>t.k===bank[k].k)));
      if(!placed.length){ const f=[].concat(Q[0].ans[0])[0]; hint(`🔎 Tente começar por <b>${f.k}</b> <span class="ro">(${f.r})</span>.`); }
      else if(pre) hint(Q.some(q=>CASA(c,q))?'🔎 はい、あっています！ Toque em <b>Responder</b>.':'🔎 Até aqui está no caminho certo, continue!');
      else hint('🔎 Alguma peça está fora do lugar. Toque nela no balão para tirar.');
    }
    $('drawer').hidden=true;
  };
}
if($('btnAr')) $('btnAr').onclick=()=>{ arDuvida(); $('drawer').hidden=false; };
if($('btnArClose')) $('btnArClose').onclick=()=>{ $('drawer').hidden=true; };
if($('drawer')) $('drawer').onclick=e=>{ if(e.target===$('drawer')) $('drawer').hidden=true; };

let ro=true; try{ ro=localStorage.getItem('utopiaRomaji')!=='0'; }catch(e){}
function applyRo(){
  document.body.classList.toggle('no-ro',!ro);
  document.body.classList.toggle('ver-ro',ro);
  if($('btnRo')){ $('btnRo').textContent='Romaji: '+(ro?'ON':'OFF'); $('btnRo').setAttribute('aria-pressed',String(ro)); }
}
if($('btnRo')) $('btnRo').onclick=()=>{ ro=!ro; try{ localStorage.setItem('utopiaRomaji',ro?'1':'0'); }catch(e){} applyRo(); };
if($('steps')) $('steps').addEventListener('click',e=>{ const b=e.target.closest('.ato-btn'); if(b) goAto(+b.dataset.ato); });
applyRo();

const picker=$('picker');
const loaded=ORDEM.filter(s=>(window.AULAS||{})[s]);
const start=document.body.dataset.mapa || loaded[0];
if(picker){
  const draw=cur=>{ picker.innerHTML=loaded.map(s=>`<button type="button" data-s="${s}" aria-pressed="${s===cur}">${window.AULAS[s].emoji} ${window.AULAS[s].titulo}</button>`).join(''); };
  picker.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; draw(b.dataset.s); loadAula(b.dataset.s); };
  draw(start);
}
loadAula(start);
window.__aulaFrases=()=>({A,CENAS,AR});
})();
