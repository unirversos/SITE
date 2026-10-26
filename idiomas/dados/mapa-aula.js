/* Motor das aulas dos mapas de contexto — Situação → Palavras → Moldes → Ouvir → Cena, com o avatar do aluno.
   Lê os dados de window.AULAS[slug] (um arquivo por mapa em /idiomas/dados/aulas/). Usa avatar.js (UtopiaAvatar).
   Progresso: XP soma em localStorage['utopiaSave1'] (o mesmo do Ateliê e da carteirinha);
   palavras e etapas de cada mapa ficam em localStorage['utopiaMapas1']. */
(function(){
const $=id=>document.getElementById(id);
const AV=window.UtopiaAvatar;
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const tok=s=>{ if(typeof s!=='string') return s; const [k,r]=s.split('|'); return {k,r:r||'',h:k}; };
/* voz: toca a gravação da professora quando existe; senão, a voz do aparelho */
const chaveAudio=t=>String(t||'').replace(/[\s、。，．,.!！?？…・「」『』（）()]/g,'');
let audioAtual=null;
function speakTTS(t,rate){ try{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='ja-JP'; u.rate=rate||.85;
  const v=speechSynthesis.getVoices().find(x=>/^ja/i.test(x.lang)); if(v) u.voice=v; speechSynthesis.speak(u);}catch(e){} }
function speak(t,rate){
  try{ if(audioAtual){ audioAtual.pause(); audioAtual=null; } if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  const id=(window.AUDIO_MAP||{})[chaveAudio(t)];
  if(!id) return speakTTS(t,rate);
  try{ const a=new Audio((window.AUDIO_BASE||'/idiomas/audio/')+id+'.mp3'); audioAtual=a;
    if(rate&&rate<.7){ a.playbackRate=.75; a.preservesPitch=true; }
    let caiu=false; const cair=()=>{ if(caiu||audioAtual!==a) return; caiu=true; audioAtual=null; speakTTS(t,rate); };
    a.onerror=cair; const pr=a.play(); if(pr&&pr.catch) pr.catch(cair);
  }catch(e){ speakTTS(t,rate); }
}
const WORD_XP=5;
const TITULOS={aeroporto:'Aeroporto',hotel:'Hotel',restaurante:'Restaurante',kombini:'Konbini',trens:'Trens',compras:'Compras',roupas:'Roupas',emergencia:'Emergência',apresentacao:'Apresentação',horas:'Horas',planos:'Planos',sinalizacao:'Sinalização'};
const ORDEM=Object.keys(TITULOS);

/* ---------- desenhos próprios (Aeroporto) ---------- */
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


/* ---------- romaji em cima do kana que aparece no meio do texto em português ---------- */
const RO_DI={きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',てぃ:'ti',でぃ:'di',うぃ:'wi',うぇ:'we',うぉ:'wo',ちぇ:'che',しぇ:'she',じぇ:'je'};
const RO_1={あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o',ゃ:'ya',ゅ:'yu',ょ:'yo',ゔ:'vu'};
const MAC={a:'ā',i:'ī',u:'ū',e:'ē',o:'ō'};
const RK_FIX={'は':'wa','へ':'e','を':'o','こんにちは':'konnichiwa','こんばんは':'konbanwa','せんせい':'sensei','すみません':'sumimasen','ううん':'uun','じゃない':'janai','ここが':'koko ga','では':'dewa','じゃ':'ja'};
function roWord(k){ if(RK_FIX[k]) return RK_FIX[k];
  let m;
  if(k.length>2 && /(です|ます|ません)か$/.test(k)) return roWord(k.slice(0,-1))+' ka';
  if(k.length>2 && k.endsWith('です')) return roWord(k.slice(0,-2))+' desu';
  if((m=k.match(/^(では|じゃ)(.+)$/))) return RK_FIX[m[1]]+' '+roWord(m[2]);
  if(k.length>1 && /[はを]$/.test(k)) return roWord(k.slice(0,-1))+(k.endsWith('は')?' wa':' o');
  return roRaw(k); }
function roRaw(k){
  const h=k.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)); let out='',i=0;
  while(i<h.length){ const two=h.slice(i,i+2), c=h[i];
    if(c==='っ'){ const nx=RO_DI[h.slice(i+1,i+3)]||RO_1[h[i+1]]||''; out+=nx.startsWith('ch')?'t':(nx[0]||''); i++; continue; }
    if(c==='ー'){ const v=out.slice(-1); out=MAC[v]?out.slice(0,-1)+MAC[v]:out; i++; continue; }
    if(RO_DI[two]){ out+=RO_DI[two]; i+=2; continue; }
    if(c==='ん' && /^[あいうえおやゆよ]/.test(h[i+1]||'')){ out+="n'"; i++; continue; }
    out+=RO_1[c]!==undefined?RO_1[c]:c; i++; }
  return out.replace(/ou/g,'ō').replace(/uu/g,'ū'); }
function rk(html){ if(typeof html!=='string') return html;
  return html.split(/(<ruby[\s\S]*?<\/ruby>|<[^>]+>)/).map(part=>part.startsWith('<')?part:part.replace(/[ぁ-ゖァ-ヺー]+/g,m=>`<ruby class="rk">${m}<rt>${roWord(m)}</rt></ruby>`)).join(''); }

/* ---------- aluno ---------- */
let me=null, prof={}; try{ const a=AV.load(); if(a&&a.sel) me=Object.assign({},a.sel); prof=(a&&a.profile)||{}; }catch(e){}
if(!me) me={hair:'pony',hairColor:'chairo',face:'egao',clothes:'parka',clothColor:'pinku',acc:[],traits:[],skin:4};
const meName=prof.kata||prof.name||'Você';
const kanaName=/^[぀-ヿ・ー\s]+$/.test(prof.kata||'')?prof.kata.trim():'マリア';
const roName=kanaName==='マリア'?'Maria':(prof.name||kanaName);
const meBaseFace=me.face||'egao';
const fillName=s=>s.replace(/\{NOME\}/g,kanaName).replace(/\{NOMERO\}/g,roName);

/* ---------- progresso ---------- */
const GKEY='utopiaSave1', MKEY='utopiaMapas1';
let g=null; try{ g=JSON.parse(localStorage.getItem(GKEY)||'null'); }catch(e){}
g=Object.assign({name:'',xp:0,maxXp:100,level:1,hp:10,maxHp:10,done:{}},g||{});
let M=null; try{ M=JSON.parse(localStorage.getItem(MKEY)||'null'); }catch(e){}
M=M||{};
function persist(){ try{ localStorage.setItem(GKEY,JSON.stringify(g)); localStorage.setItem(MKEY,JSON.stringify(M)); }catch(e){} }
function gainXP(n){ g.xp+=n; let up=false;
  while(g.xp>=g.maxXp){ g.xp-=g.maxXp; g.level++; g.maxHp+=5; g.hp=g.maxHp; g.maxXp=Math.round(g.maxXp*1.2); up=true; }
  persist(); showXP();
  if(up) toast(`Nível ${g.level}! Novo título: ${AV.titleHTML?AV.titleHTML(g.level):''}`); }
function showXP(){ $('xp').textContent=`Nv ${g.level} · XP ${g.xp}/${g.maxXp}`; }
function toast(html){ const t=document.createElement('div'); t.className='toast'; t.innerHTML=html; document.body.appendChild(t); setTimeout(()=>t.remove(),3200); }

/* ---------- estado ---------- */
let STEPS=['Situação','Palavras','Moldes','Ouvir','Cena','Consulta'];
const RR=(k,f)=>`<ruby>${k}<rt>${f}</rt></ruby>`;
const AR=[
  {ic:'⏳',quero:'Preciso de um tempinho',sub:'Respirar · ganhar tempo sem silêncio congelante',frases:[
    {h:'あの、ちょっと '+RR('待','ま')+'って ください',k:'あの、ちょっと まって ください',r:'ano, chotto matte kudasai',pt:'hum, só um instante, por favor'},
    {h:'ええと…',k:'ええと',r:'ēto…',pt:'vejamos… / deixe-me ver… (é natural, não é falha)'},
    {h:RR('少々','しょうしょう')+' お'+RR('待','ま')+'ちください',k:'しょうしょう おまちください',r:'shōshō omachi kudasai',pt:'um momento, por favor (mais formal)'}]},
  {ic:'🙋',quero:'Quero avisar que não falo bem japonês',sub:'Declarar · assumir o nível e tirar o peso da perfeição',frases:[
    {h:RR('日本語','にほんご')+'を '+RR('勉強中','べんきょうちゅう')+'です',k:'にほんごを べんきょうちゅうです',r:'nihongo o benkyō-chū desu',pt:'estou estudando japonês'},
    {h:'あまり '+RR('上手','じょうず')+'じゃ ありません',k:'あまり じょうずじゃ ありません',r:'amari jōzu ja arimasen',pt:'ainda não falo muito bem'},
    {h:'よく わかりませんでした',k:'よく わかりませんでした',r:'yoku wakarimasen deshita',pt:'não compreendi bem'}],
   nota:'Declarar cedo muda o jeito que a pessoa fala com você: quase todo mundo desacelera.'},
  {ic:'🐢',quero:'Quero que fale devagar, repita ou escreva',sub:'Pedir ajuste · fazer a outra pessoa adaptar o ritmo',frases:[
    {h:'もう'+RR('一度','いちど')+' お'+RR('願','ねが')+'いします',k:'もういちど おねがいします',r:'mō ichido onegaishimasu',pt:'mais uma vez, por favor'},
    {h:'ゆっくり '+RR('話','はな')+'して ください',k:'ゆっくり はなして ください',r:'yukkuri hanashite kudasai',pt:'fale mais devagar, por favor'},
    {h:RR('英語','えいご')+'でも いいですか',k:'えいごでも いいですか',r:'eigo demo ii desu ka',pt:'pode ser em inglês?'},
    {h:RR('書','か')+'いて もらえますか',k:'かいて もらえますか',r:'kaite moraemasu ka',pt:'pode escrever para mim? (números, endereços, nomes)'}]},
  {ic:'🔎',quero:'Quero confirmar se entendi',sub:'Confirmar · checar antes de agir',frases:[
    {h:'これで '+RR('合','あ')+'って いますか',k:'これで あって いますか',r:'kore de atte imasu ka',pt:'está certo assim? / é isso?'},
    {h:'〜と いう '+RR('意味','いみ')+'ですか',k:'という いみですか',r:'~ to iu imi desu ka',pt:'quer dizer que ~? (repita o que entendeu antes)'},
    {h:RR('大丈夫','だいじょうぶ')+'ですか',k:'だいじょうぶですか',r:'daijōbu desu ka',pt:'tudo bem? / sem problemas?'},
    {h:'いいですか',k:'いいですか',r:'ii desu ka',pt:'posso? / está liberado? (mostrando o celular, apontando um assento)'}],
   nota:'A técnica mais útil de todas: repita o pedaço que você entendeu e pergunte. Não precisa de gramática nova.'},
  {ic:'🚪',quero:'Quero encerrar com educação',sub:'Sair · encerrar com simpatia, mesmo sem ter resolvido',frases:[
    {h:'わかりました。ありがとうございます',k:'わかりました。ありがとうございます',r:'wakarimashita. arigatō gozaimasu',pt:'entendi. muito obrigado(a)!'},
    {h:'また '+RR('来','き')+'ます',k:'また きます',r:'mata kimasu',pt:'volto depois (ótimo para sair de lojas)'},
    {h:RR('大丈夫','だいじょうぶ')+'です。すみません',k:'だいじょうぶです。すみません',r:'daijōbu desu. sumimasen',pt:'não precisa, obrigado(a) / desculpe o incômodo'},
    {h:RR('失礼','しつれい')+'します',k:'しつれいします',r:'shitsurei shimasu',pt:'com licença / até logo (ao sair, ao desligar o telefone)'}],
   nota:'Desistir de uma conversa é uma habilidade, não uma derrota.'}
];
const AR_NAO=['Sorrir e assentir sem entender. Custa mais caro depois.','Repetir はい como quem concorda: muitas vezes はい quer dizer só "estou ouvindo".','Esperar entender tudo antes de falar. Não funciona assim para ninguém.'];
let A=null, P=null;   // aula atual e progresso dela
let step=0, wi=0, quiz=null, mi=0, msel=[], oi=0, oAns=null, ci=0, bank=[], placed=[], done={}, mood='idle', stageOpt={}, OUVIR=[], CENAS=[];

/* ---------- palco ---------- */
function charSVG(sel,x,y,w,cls,extra){ const h=w*300/240;
  return `<g class="char ${cls}"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 240 300">${AV.markup(sel,{noBg:true,still:true})}${extra||''}</svg></g>`; }
function renderStage(){
  const o=stageOpt, c=A.cen, n=A.npc;
  const npcFace = mood==='wrong'?'bikkuri':(n.sel.face||'egao');
  const meFace = mood==='ok'?'egao':mood==='wrong'?'bikkuri':meBaseFace;
  const npcCls = mood==='ok'?'nod':mood==='wrong'?'tilt':'idle';
  const meCls = mood==='ok'?'hop':mood==='wrong'?'shake':'idle';
  const board = o.icon
    ? `<g class="q"><circle cx="318" cy="52" r="42" fill="#fff" stroke="#f0c6ce" stroke-width="3"/><circle cx="300" cy="102" r="7" fill="#fff" stroke="#f0c6ce" stroke-width="2.5"/><circle cx="294" cy="116" r="4" fill="#fff" stroke="#f0c6ce" stroke-width="2"/>${iconInStage(o.icon,286,20,64)}</g>`
    : `<g transform="translate(280 16)">${c.board||''}</g>`;
  const ct=c.counter;
  const counter = ct?`<g><rect x="14" y="150" width="196" height="62" rx="10" fill="${ct.color||'#e7cdb9'}"/><rect x="8" y="140" width="208" height="16" rx="7" fill="${ct.top||'#f6e5d8'}"/>
      ${ct.label?`<rect x="${112-ct.label.length*7-12}" y="168" width="${ct.label.length*14+24}" height="22" rx="11" fill="#fff" opacity=".85"/><text x="112" y="183" text-anchor="middle" font-family="Zen Maru Gothic, sans-serif" font-size="11" font-weight="700" fill="#7c6a78">${ct.label}</text>`:''}
      <g transform="translate(140 104)">${c.prop||''}</g></g>`:(c.prop?`<g transform="translate(140 160)">${c.prop}</g>`:'');
  const stamp = o.stamp?`<g class="thump"><circle cx="${ct?178:150}" cy="${ct?128:60}" r="15" fill="#fff8" stroke="#c94a4a" stroke-width="2.5"/><text x="${ct?178:150}" y="${ct?133:65}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="12" font-weight="800" fill="#c94a4a">OK</text></g>`:'';
  $('stage').innerHTML=`
    <rect width="400" height="250" fill="${c.wall||'#fbefe6'}"/>
    ${c.back||''}
    ${board}
    <rect y="196" width="400" height="54" fill="${c.floor||'#f1dccd'}"/><path d="M0 196 H400" stroke="#0001" stroke-width="3"/>
    <g fill="#0000000d">${[0,1,2,3,4,5,6,7].map(k=>`<rect x="${k*52+8}" y="214" width="34" height="5" rx="2"/>`).join('')}</g>
    ${o.noNpc?'':charSVG(Object.assign({},n.sel,{face:npcFace}),42,52,124,npcCls,n.extra)}
    ${mood==='wrong'&&!o.noNpc?`<g class="q"><circle cx="160" cy="58" r="16" fill="#fff" stroke="#cfe0f0" stroke-width="2"/><text x="160" y="65" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="20" font-weight="800" fill="#4f8fc4">?</text></g>`:''}
    ${counter}${stamp}
    <g class="${o.enter?'enter':''}"><g class="char ${meCls}">
      ${c.meProp?iconInStage(c.meProp,214,182,30):''}
      <svg x="236" y="62" width="148" height="185" viewBox="0 0 240 300">${AV.markup(Object.assign({},me,{face:meFace}),{noBg:true,still:true})}</svg>
    </g></g>`;
}
function setStage(o){ stageOpt=o||{}; renderStage(); }

/* ---------- utilidades ---------- */
function gainWord(id){ if(P.words[id]) return false; P.words[id]=1; gainXP(WORD_XP); return true; }
function sparkle(list){ const fx=$('fx');
  for(let k=0;k<10;k++){ const s=document.createElement('span'); s.className='spark'; s.textContent=list[k%list.length];
    s.style.left=(60+Math.random()*35)+'%'; s.style.top=(30+Math.random()*40)+'%'; s.style.animationDelay=(k*0.07)+'s';
    fx.appendChild(s); setTimeout(()=>s.remove(),1800); } }
function renderSteps(){
  STEPS=C()?['Situação','Palavras','Moldes','Ouvir','Cena','Consulta']:['Situação','Palavras','Moldes','Ouvir','Cena'];
  $('steps').innerHTML=STEPS.map((s,k)=>`<button type="button" class="step ${k===step?'now':P.steps[k]?'done':''}" data-s="${k}"><span class="n">${P.steps[k]&&k!==step?'✓':k+1}</span>${s}</button>`).join('');
}
function go(n){ step=n; mood='idle'; renderSteps(); [stSituacao,stPalavras,stMoldes,stOuvir,stCena,stConsulta][n](); try{ $('steps').scrollIntoView({block:'start',behavior:'smooth'}); }catch(e){} }
function finish(n){ P.steps[n]=1; persist(); }
const wordH=w=>w.h||w.k;

/* ---------- 1. situação ---------- */
function stSituacao(){
  setStage({enter:true});
  const it=A.intro;
  $('panel').innerHTML=`
    <h2>${it.titulo}</h2>
    ${it.txt.map(t=>`<p class="lead">${t}</p>`).join('')}
    <div><p class="goals-t">No fim desta aula você vai conseguir:</p>
    <ul class="goals">${it.metas.map((m,i)=>`<li><span class="gn">${String(i+1).padStart(2,'0')}</span><span>${m}</span></li>`).join('')}</ul></div>
    <p class="pt" style="margin:0">Travou em qualquer momento? Toque em <b>🌬️ Ar · socorro</b>, lá em cima.</p>
    <div class="row"><span class="spacer"></span><button class="btn primary" type="button" id="goWords">Conhecer as palavras →</button></div>`;
  $('goWords').onclick=()=>{ finish(0); go(1); };
}

/* ---------- 2. palavras ---------- */
function stPalavras(){ quiz=null; showWord(); }
function showWord(){
  const W=A.words, w=W[wi]; const isNew=gainWord(w.id);
  setStage({icon:w.ic, noNpc:true});
  $('panel').innerHTML=`
    <div class="row"><h2>Palavras: ${A.titulo}</h2><span class="spacer"></span><div class="dots">${W.map((x,k)=>`<span class="dot ${k===wi?'cur':P.words[x.id]?'seen':''}"></span>`).join('')}</div></div>
    <div class="wcard">
      <div class="wicon">${iconHTML(w.ic)}</div>
      <div>
        <div class="wjp">${wordH(w)} <button class="say" type="button" id="sayW" aria-label="Ouvir">🔊</button></div>
        <div class="ro">${w.r}</div>
        <div><b>${w.pt}</b> · <span class="en" lang="en">${w.en}</span> ${isNew?`<span class="newxp">+${WORD_XP} XP</span>`:''}</div>
        ${w.tip?`<div class="tip">💡 ${w.tip}</div>`:''}
      </div>
    </div>
    <div class="row">
      <button class="btn" type="button" id="wPrev" ${wi===0?'disabled':''}>← Anterior</button>
      <span class="spacer"></span>
      ${wi<W.length-1?`<button class="btn primary" type="button" id="wNext">Próxima palavra →</button>`:`<button class="btn primary" type="button" id="wQuiz">Jogo rápido: ouça e toque 🎧</button>`}
    </div>`;
  speak(w.k);
  $('sayW').onclick=()=>speak(w.k);
  $('wPrev').onclick=()=>{ wi--; showWord(); };
  if($('wNext')) $('wNext').onclick=()=>{ wi++; showWord(); };
  if($('wQuiz')) $('wQuiz').onclick=startQuiz;
}
function startQuiz(){ quiz={order:shuffle(A.words.map(w=>w.id)).slice(0,5), n:0}; showQuiz(); }
function showQuiz(){
  const W=Object.fromEntries(A.words.map(w=>[w.id,w])), id=quiz.order[quiz.n], w=W[id];
  const opts=shuffle([id].concat(shuffle(A.words.map(x=>x.id).filter(x=>x!==id)).slice(0,3)));
  mood='idle'; setStage({noNpc:true});
  $('panel').innerHTML=`
    <div class="row"><h2>Ouça e toque na figura</h2><span class="spacer"></span><span class="pt">${quiz.n+1} de ${quiz.order.length}</span></div>
    <div class="row"><button class="btn bigplay" type="button" id="qPlay">🔊 Ouvir a palavra</button></div>
    <div class="pick" id="pick">${opts.map(o=>`<button type="button" class="pickb" data-id="${o}">${iconHTML(W[o].ic)}<span>${W[o].pt}</span></button>`).join('')}</div>
    <p class="hint" id="qHint"></p>`;
  setTimeout(()=>speak(w.k),250);
  $('qPlay').onclick=()=>speak(w.k);
  let locked=false;
  $('pick').onclick=e=>{ const b=e.target.closest('.pickb'); if(!b||locked) return;
    if(b.dataset.id===id){ locked=true; b.classList.add('right'); mood='ok'; setStage({icon:w.ic,noNpc:true}); sparkle(['✨','💖','⭐']);
      $('qHint').innerHTML=`<b>${wordH(w)}</b> <span class="ro">${w.r}</span> = ${w.pt} ✓`;
      setTimeout(()=>{ quiz.n++; if(quiz.n<quiz.order.length) showQuiz(); else endQuiz(); },1400);
    } else { b.classList.add('wrong'); $('qHint').innerHTML='Quase! Ouça de novo 🔊'; speak(w.k); } };
}
function endQuiz(){
  finish(1); renderSteps(); mood='ok'; setStage({noNpc:true}); sparkle(['🎉','✨','💖']);
  $('panel').innerHTML=`<h2>Você já conhece as ${A.words.length} palavras deste mapa! 🎉</h2>
    <p class="lead">Agora vamos encaixar essas palavras em <b>moldes</b>: frases prontas com um espaço para trocar.</p>
    <div class="row"><button class="btn" type="button" id="again">Rever palavras</button><span class="spacer"></span><button class="btn primary" type="button" id="goM">Aprender os moldes →</button></div>`;
  $('again').onclick=()=>{ wi=0; showWord(); }; $('goM').onclick=()=>go(2);
}

/* ---------- 3. moldes ---------- */
function moldeParts(m,sel){ return m.parts.map(p=>typeof p==='number'?Object.assign({slot:true},sel[p]):tok(p)); }
function moldeText(m,sel,key){ const t=m[key]; if(typeof t==='function') return t(sel); if(t) return t.replace(/\{(\d)\}/g,(_,d)=>sel[+d][key]); return sel[0][key]; }
function stMoldes(){ msel=A.moldes[mi].slots.map(s=>s[0]); showMolde(false); }
function showMolde(speakIt){
  const MS=A.moldes, m=MS[mi], parts=moldeParts(m,msel);
  mood='idle'; setStage({});
  $('panel').innerHTML=`
    <h2>Molde ${mi+1} de ${MS.length}: ${m.titulo}</h2>
    <div class="molde">
      <div class="tpl">${m.tpl} <span class="ro" style="font-weight:600">· ${m.tplRo}</span></div>
      <div class="sent">${parts.map(p=>p.slot?`<span class="sl">${p.h||p.k}</span>`:(p.h||p.k)).join(' ')} <button class="say" type="button" id="sayM" aria-label="Ouvir">🔊</button></div>
      <div class="ro">${parts.map(p=>p.r).join(' ')}</div>
      <div><b>${moldeText(m,msel,'pt')}</b> · <span class="en" lang="en">${moldeText(m,msel,'en')}</span></div>
      ${m.slots.map((opts,si)=>`<div class="chips" data-si="${si}">${opts.map((o,oi)=>`<button type="button" class="chip" data-v="${oi}" aria-pressed="${msel[si]===o}"><b>${o.k}</b><small>${o.r}</small></button>`).join('')}</div>`).join('')}
      <p class="pt" style="margin:0">👆 Troque a palavra e ouça a frase mudar.</p>
    </div>
    <div class="gram">📐 ${m.gram}</div>
    ${m.audio?audioBox(m.audio):''}
    <p class="pt" style="margin:0">🎯 ${m.use}</p>
    <div class="row">
      <button class="btn" type="button" id="mPrev" ${mi===0?'disabled':''}>← Anterior</button><span class="spacer"></span>
      ${mi<MS.length-1?`<button class="btn primary" type="button" id="mNext">Próximo molde →</button>`:`<button class="btn primary" type="button" id="mDone">Treinar o ouvido →</button>`}
    </div>`;
  const say=()=>speak(parts.map(p=>p.k).join(' '));
  if(speakIt) say();
  $('sayM').onclick=say;
  $('panel').querySelectorAll('.chips').forEach(row=>row.onclick=e=>{ const b=e.target.closest('.chip'); if(!b) return;
    const si=+row.dataset.si; msel[si]=m.slots[si][+b.dataset.v]; showMolde(true); });
  $('mPrev').onclick=()=>{ mi--; stMoldes(); };
  if($('mNext')) $('mNext').onclick=()=>{ mi++; stMoldes(); };
  if($('mDone')) $('mDone').onclick=()=>{ finish(2); go(3); };
}

/* ---------- 4. ouvir ---------- */
function stOuvir(){ oi=0; OUVIR=CENAS.map(c=>({say:c.say,q:c.q,ro:c.ro,right:c.pt,opts:shuffle([c.pt].concat(c.distr))})); showOuvir(); }
function showOuvir(){
  const o=OUVIR[oi]; oAns=null;
  mood='idle'; setStage({});
  $('panel').innerHTML=`
    <div class="row"><h2>O que a pessoa disse?</h2><span class="spacer"></span><span class="pt">${oi+1} de ${OUVIR.length}</span></div>
    <p class="pt" style="margin:0">Ouça sem ler. Pode repetir quantas vezes quiser.</p>
    <div class="row"><button class="btn bigplay" type="button" id="oPlay">🔊 Ouvir</button><button class="btn" type="button" id="oSlow">🐢 Mais devagar</button></div>
    <div class="opts" id="opts">${o.opts.map((t,k)=>`<button type="button" class="opt" data-k="${k}">${t}</button>`).join('')}</div>
    <div id="oRev"></div>`;
  setTimeout(()=>speak(o.say),250);
  $('oPlay').onclick=()=>speak(o.say);
  $('oSlow').onclick=()=>speak(o.say,.55);
  $('opts').onclick=e=>{ const b=e.target.closest('.opt'); if(!b||oAns) return;
    if(o.opts[+b.dataset.k]!==o.right){ b.classList.add('wrong'); mood='wrong'; renderStage(); setTimeout(()=>{mood='idle';renderStage();},1500); return; }
    oAns=true; b.classList.add('right'); mood='ok'; renderStage(); sparkle(['✨','🎧','💖']);
    $('oRev').innerHTML=`<div class="reveal"><div class="jp">${o.q}</div><div class="ro">${o.ro}</div><div class="pt">${o.right}</div></div>
      <div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn primary" type="button" id="oNext">${oi<OUVIR.length-1?'Próxima →':'Ir para a cena! →'}</button></div>`;
    $('oNext').onclick=()=>{ if(oi<OUVIR.length-1){ oi++; showOuvir(); } else { finish(3); go(4); } };
  };
}

/* ---------- 5. cena ---------- */
function stCena(){ loadCena(ci); }
function loadCena(n){
  ci=n; const c=CENAS[ci]; bank=shuffle([].concat(...c.ans).concat(c.extra)); placed=[]; mood='idle';
  $('panel').innerHTML=`
    <div class="row"><h2>Responda na cena</h2><span class="spacer"></span><div class="stamps" id="stamps"></div></div>
    ${ci===0&&A.cenaAudio?audioBox(A.cenaAudio):''}
    <div class="talk" style="padding:0"><div class="bubble npc" id="npcBubble"></div><div class="bubble me" id="meBubble"></div></div>
    <p class="hint" id="hint"></p>
    <div class="bank" id="bank"></div>
    <div class="actions">
      <button class="btn" type="button" id="btnListen">🔊 Ouvir de novo</button>
      ${c.molde!=null?'<button class="btn" type="button" id="btnMolde">📐 Ver o molde</button>':''}
      <button class="btn" type="button" id="btnClear">↺ Recomeçar a frase</button>
      <button class="btn primary" type="button" id="btnCheck" disabled>Responder</button>
      <button class="btn primary" type="button" id="btnNext" hidden>Próxima →</button>
    </div>`;
  wireCena(); renderCena();
  hint(done[ci]?'Você já resolveu esta parte.':(c.dica?`🎯 ${c.dica} · `:'')+'Toque nas peças <b>na ordem da frase</b>. Para tirar uma peça, toque nela no balão.');
  speak(c.say);
}
function hint(t){ $('hint').innerHTML=t; }
function audioBox(a){ return `<div class="voz"><div class="voz-t">🎙️ ${a.titulo||'Explicação da professora'}</div><audio controls preload="none" src="${a.src}"></audio>${a.nota?`<div class="pt">${a.nota}</div>`:''}</div>`; }
function renderCena(){
  setStage({stamp:!!done[ci]});
  const c=CENAS[ci], ok=!!done[ci];
  $('npcBubble').innerHTML=`<div class="who"><span>${c.quem||A.npc.nome}</span><button class="say" type="button" id="sayQ" aria-label="Ouvir">🔊</button></div>
    <div class="jp">${c.q}</div><div class="ro">${c.ro}</div><div class="pt">${c.pt}</div>`;
  $('sayQ').onclick=()=>speak(c.say);
  $('meBubble').className='bubble me'+(ok?' ok':'');
  $('meBubble').innerHTML=`<div class="who"><span>${meName}</span>${ok?'<span>✓ resolvido</span>':''}</div>
    <div class="slots">${c.ans.map((_,k)=>{ const t=placed[k]!==undefined?bank[placed[k]]:null;
      return t?`<button type="button" class="slot filled" data-k="${k}"><span><b>${t.k}</b><small>${t.r}</small></span></button>`:`<span class="slot"></span>`; }).join('')}</div>
    ${ok?`<div class="pt">${c.ansPt}</div>`:''}`;
  $('bank').innerHTML=bank.map((t,k)=>`<button type="button" class="tile ${placed.includes(k)?'used':''}" data-k="${k}" ${ok?'disabled':''}><b>${t.k}</b><small>${t.r}</small></button>`).join('');
  const full=placed.length===c.ans.length;
  $('btnCheck').disabled=!full||ok; $('btnCheck').hidden=ok;
  $('btnNext').hidden=!ok; $('btnNext').textContent=ci<CENAS.length-1?'Próxima →':'Ver minha insígnia ✨';
  $('btnClear').hidden=ok;
  $('stamps').innerHTML=CENAS.map((_,k)=>`<span class="stamp ${done[k]?'ok':k===ci?'now':''}">${done[k]?'OK':k+1}</span>`).join('');
}
function wireCena(){
  $('bank').onclick=e=>{ const b=e.target.closest('.tile'); if(!b||done[ci]) return; const k=+b.dataset.k; if(placed.includes(k)) return;
    if(placed.length>=CENAS[ci].ans.length) return; placed.push(k); speak(bank[k].k); mood='idle'; renderCena(); };
  $('meBubble').onclick=e=>{ const b=e.target.closest('.slot.filled'); if(!b||done[ci]) return; placed.splice(+b.dataset.k,1); mood='idle'; renderCena(); };
  $('btnClear').onclick=()=>{ placed=[]; mood='idle'; renderCena(); };
  $('btnListen').onclick=()=>speak(CENAS[ci].say);
  if($('btnMolde')) $('btnMolde').onclick=()=>{ const k=CENAS[ci].molde, m=A.moldes[k]; hint(`📐 Molde ${k+1}: <b>${m.tpl.replace(/<\/?i>/g,'')}</b> <span class="ro">${m.tplRo}</span> · ${m.titulo}`); };
  $('btnCheck').onclick=()=>{
    const c=CENAS[ci], right=placed.every((k,j)=>[].concat(c.ans[j]).some(t=>t.k===bank[k].k));
    if(right){ done[ci]=true; mood='ok'; renderCena(); speak(placed.map(k=>bank[k].k).join(' ')); sparkle(['💖','✨','🌸','⭐','✨']); hint(`<b>せいかい！</b> ${c.ansPt}`); }
    else { mood='wrong'; renderStage(); hint(`<b>Hmm…</b> a pessoa ficou confusa. ${c.molde!=null?'Toque em <b>📐 Ver o molde</b> ou ':''}tire uma peça do balão e tente outra ordem.`);
      setTimeout(()=>{ if(mood==='wrong'){ mood='idle'; renderStage(); } },2200); }
  };
  $('btnNext').onclick=()=>{
    if(ci<CENAS.length-1) return loadCena(ci+1);
    const first=!P.steps[4]; finish(4); renderSteps(); if(first) gainXP(20);
    mood='ok'; setStage({stamp:true}); sparkle(['🌍','💖','✨','🎉','🌸','⭐']);
    hint(`${A.emoji} <b>${A.insignia||('Insígnia '+A.titulo+' conquistada!')}</b> ${A.fim}${first?' <span class="newxp">+20 XP</span>':''}${A.fimLink?` <a href="${A.fimLink[1]}">${A.fimLink[0]}</a>`:''}`); $('btnNext').hidden=true;
    if(typeof A.onFinish==='function'){ try{ A.onFinish(); }catch(e){} }
    if(C()){ const b=document.createElement('button'); b.className='btn primary'; b.type='button'; b.textContent='📚 Abrir a consulta deste mapa →'; b.onclick=()=>go(5); $('btnNext').after(b); }
  };
}

/* ---------- 6. consulta (caderno de campo do mapa) ---------- */
const C=()=>(window.CONSULTA||{})[A.slug];
const CAT={obj:['coisa','#C0913F','#FBF2DF'],act:['ação','#5E9179','#EAF3EE'],dir:['direção','#6E77BE','#EEEFF9'],urg:['urgência','#C4685F','#FBEAE6']};
function stConsulta(){
  const c=C(); mood='idle'; setStage({});
  if(!c){ $('panel').innerHTML='<h2>Consulta</h2><p class="lead">Este mapa ainda não tem consulta.</p>'; return; }
  finish(5); renderSteps();
  const says=[];
  const sayBtn=t=>{ says.push(t); return `<button class="say" type="button" data-say="${says.length-1}" aria-label="Ouvir">🔊</button>`; };
  $('panel').innerHTML=`
    <h2>📚 Consulta · ${A.titulo}</h2>
    <p class="lead">Seu caderno de campo deste mapa: todas as peças, os moldes, o que prestar atenção ao ouvir e frases de exemplo. Volte aqui sempre que precisar.</p>
    ${c.missao?`<p class="gram">${rk(c.missao)}</p>`:''}
    <h3 class="ch">🧩 Todas as peças</h3>
    <div class="legend">${Object.values(CAT).map(([n,col,bg])=>`<span style="border-color:${col};background:${bg}">${n}</span>`).join('')}</div>
    <div class="cgrid">${c.pecas.map(p=>{ const k=CAT[p.cat]||CAT.obj; return `<div class="cpeca" style="border-left-color:${k[1]}"><div class="jp">${p.h} ${sayBtn(p.s)}</div><div class="ro">${p.r}</div><div class="pt">${rk(p.pt)}</div></div>`; }).join('')}</div>
    <h3 class="ch">📐 Moldes</h3>
    <div class="clist">${c.moldes.map(m=>`<div class="cmolde"><div class="who">${m.label}</div><div class="jp">${m.h} ${m.s?sayBtn(m.s):''}</div><div class="ro">${m.r}</div><div><b>${rk(m.pt)}</b></div>${m.troca&&m.troca.length>1?`<div class="pt">Troque por: ${m.troca.map(t=>`${t.h} <span class="ro">(${t.r})</span>`).join(' · ')}</div>`:''}${m.hint?`<div class="pt">💡 ${rk(m.hint)}</div>`:''}</div>`).join('')}</div>
    <h3 class="ch">📡 Radar: o que prestar atenção ao ouvir</h3>
    <div class="clist">${c.radar.map(r=>`<div class="cradar"><div class="kw">${r.kw}</div><div><b>${rk(r.mean)}</b></div><div class="pt">${rk(r.resp)}</div></div>`).join('')}</div>
    ${c.frases.length?`<h3 class="ch">💬 Frases de exemplo</h3><div class="clist">${c.frases.map(f=>`<div class="cfrase"><span class="tagw">${f.who==='ouvido'?'👂 você ouve':'👄 você fala'}</span><div class="jp">${f.h} ${sayBtn(f.s)}</div><div class="ro">${f.r}</div><div class="pt">${rk(f.pt)}</div></div>`).join('')}</div>`:''}
    ${c.quiz.length?`<h3 class="ch">✅ Teste rápido</h3><div class="clist">${c.quiz.map((q,qi)=>`<div class="cquiz" data-q="${qi}"><b>${rk(q.q)}</b><div class="opts">${q.opts.map((o,oi)=>`<button type="button" class="opt" data-o="${oi}">${o}</button>`).join('')}</div><div class="pt why" hidden>${rk(q.why)}</div></div>`).join('')}</div>`:''}
    <div class="row"><button class="btn" type="button" id="cTop">↑ Voltar ao topo</button><span class="spacer"></span><button class="btn primary" type="button" id="cCena">Refazer a cena →</button></div>`;
  $('panel').querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak(says[+b.dataset.say]));
  $('panel').querySelectorAll('.cquiz').forEach(box=>box.onclick=e=>{ const b=e.target.closest('.opt'); if(!b) return; const q=c.quiz[+box.dataset.q];
    box.querySelectorAll('.opt').forEach(x=>x.classList.remove('right','wrong')); b.classList.add(+b.dataset.o===q.a?'right':'wrong');
    if(+b.dataset.o===q.a) box.querySelector('.why').hidden=false; });
  $('cTop').onclick=()=>{ try{ $('steps').scrollIntoView({behavior:'smooth'}); }catch(e){} };
  $('cCena').onclick=()=>{ done={}; ci=0; go(4); };
}

/* ---------- montagem ---------- */
function prep(c){ return Object.assign({},c,{ans:c.ans.map(s=>Array.isArray(s)?s.map(x=>tok(fillName(x))):tok(fillName(s))),extra:c.extra.map(s=>tok(fillName(s))),q:fillName(c.q),say:fillName(c.say),ro:fillName(c.ro),ansPt:fillName(c.ansPt||'')}); }
function prepMolde(m){ return Object.assign({},m,{slots:m.slots.map(opts=>opts.map(o=>Object.assign(tok(fillName(o[0])),{pt:fillName(o[1]),en:fillName(o[2]),h:o[3]||tok(fillName(o[0])).k})))}); }
function loadAula(slug){
  const raw=window.AULAS[slug]; if(!raw) return;
  A=Object.assign({},raw,{moldes:raw.moldes.map(prepMolde).map(m=>Object.assign(m,{titulo:rk(m.titulo),gram:rk(m.gram),use:rk(m.use)})),
    intro:{titulo:rk(raw.intro.titulo),txt:raw.intro.txt.map(rk),metas:raw.intro.metas.map(rk)},
    words:raw.words.map(w=>Object.assign({},w,{tip:rk(w.tip)})), fim:rk(raw.fim||''), insignia:raw.insignia?rk(raw.insignia):raw.insignia});
  CENAS=raw.cenas.map(prep).map(c=>Object.assign(c,{pt:rk(c.pt),ansPt:rk(c.ansPt),dica:c.dica?rk(c.dica):c.dica,distr:(c.distr||[]).map(rk)}));
  P=M[slug]=Object.assign({words:{},steps:{}},M[slug]||{});
  step=0; wi=0; mi=0; oi=0; ci=0; done={}; $('fx').innerHTML='';
  document.title=A.docTitle||`Aula ${String(ORDEM.indexOf(A.slug)+1).padStart(2,'0')} · ${A.titulo} | Mapas de contexto · Unirversos`;
  $('eyebrow').innerHTML=`${A.eyebrow||('Mapa de contexto '+A.num)} · ${A.titulo} · <span style="text-transform:none;letter-spacing:.05em">${A.jp}</span>`;
  $('h1').textContent=A.h1;
  $('stage').setAttribute('aria-label','Cena: '+A.titulo);
  const L=$('links'); if(L&&A.linkList){ L.innerHTML=A.linkList.map(([t,h])=>`<a href="${h}">${t}</a>`).join(''); }
  else if(L&&A.links!==false){
    const order=ORDEM; const k=order.indexOf(slug), nx=order[k+1];
    L.innerHTML=`<a href="/idiomas/japones/">🗺️ Todos os mapas</a>${nx?`<a href="/idiomas/mapas/${nx}/aula/">Próxima aula: ${TITULOS[nx]||nx} →</a>`:''}`; }
  showXP(); go(0);
}

/* ---------- ar, romaji, seletor ---------- */
$('arList').innerHTML=AR.map((g,gi)=>`<details class="gaveta"><summary><span class="gi">${g.ic}</span><span><b>${g.quero}</b><small>${g.sub}</small></span></summary><div class="gbody">${g.frases.map((f,fi)=>`<button type="button" class="arp" data-g="${gi}" data-f="${fi}"><span>🔊</span><span><span class="jp">${f.h}</span><br><span class="ro">${f.r}</span> <span class="pt">${f.pt}</span></span></button>`).join('')}${g.nota?`<p class="pt gnota">💡 ${rk(g.nota)}</p>`:''}</div></details>`).join('')+`<details class="gaveta nao"><summary><span class="gi">🚫</span><span><b>O que não fazer</b><small>armadilhas comuns</small></span></summary><div class="gbody"><ul>${AR_NAO.map(t=>`<li class="pt">${rk(t)}</li>`).join('')}</ul></div></details>`;
$('arList').onclick=e=>{ const b=e.target.closest('.arp'); if(b) speak(AR[+b.dataset.g].frases[+b.dataset.f].k); };
$('arList').addEventListener('toggle',e=>{ if(e.target.open) $('arList').querySelectorAll('details.gaveta').forEach(d=>{ if(d!==e.target) d.open=false; }); },true);
$('btnAr').onclick=()=>{ $('drawer').hidden=false; };
$('btnArClose').onclick=()=>{ $('drawer').hidden=true; };
$('drawer').onclick=e=>{ if(e.target===$('drawer')) $('drawer').hidden=true; };
let ro=true; try{ ro=localStorage.getItem('utopiaRomaji')!=='0'; }catch(e){}
function applyRo(){ document.body.classList.toggle('no-ro',!ro); $('btnRo').textContent='Romaji: '+(ro?'sim':'não'); $('btnRo').setAttribute('aria-pressed',String(ro)); }
$('btnRo').onclick=()=>{ ro=!ro; try{ localStorage.setItem('utopiaRomaji',ro?'1':'0'); }catch(e){} applyRo(); };
$('steps').addEventListener('click',e=>{ const b=e.target.closest('.step'); if(b) go(+b.dataset.s); });
applyRo();

const picker=$('picker');
const loaded=ORDEM.filter(s=>window.AULAS[s]);
const start=document.body.dataset.mapa || loaded[0];
if(picker){
  const order=loaded;
  const draw=cur=>{ picker.innerHTML=order.map(s=>`<button type="button" data-s="${s}" aria-pressed="${s===cur}">${window.AULAS[s].emoji} ${window.AULAS[s].titulo}</button>`).join(''); };
  picker.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; draw(b.dataset.s); loadAula(b.dataset.s); };
  draw(start);
}
loadAula(start);
if(window.AUDIO_CREDITO){ const cr=document.createElement('p'); cr.className='credito-voz'; cr.textContent='Vozes sintéticas: '+window.AUDIO_CREDITO+'. Aos poucos, as gravações da professora vão substituindo.'; document.body.appendChild(cr); }
window.__aulaFrases=()=>({A,CENAS,moldeParts,AR}); // usado só para levantar as frases a gravar
})();
