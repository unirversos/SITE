/* Unirversos · Minha frase: no fim de cada mapa, a pessoa monta uma frase sobre ela mesma
   com o molde do mapa, grava a própria voz e carimba no Caderno.
   Texto: localStorage 'utopiaFrases1' (vai para a conta). Voz: IndexedDB 'uniFrases' (fica neste aparelho).
   Uso: UniFrase.abrir(slug, {aoSalvar}) · UniFrase.lista() · UniFrase.voz(slug) → Promise<Blob|null> */
(function(){
  /* ---------- mini-dicionário (só kana: fase inicial) ---------- */
  const D={
    lugar:[['とうきょう','tōkyō','Tóquio','Tokyo'],['おおさか','ōsaka','Osaka','Osaka'],['きょうと','kyōto','Quioto','Kyoto'],['なら','nara','Nara','Nara'],['ほっかいどう','hokkaidō','Hokkaido','Hokkaido'],['おきなわ','okinawa','Okinawa','Okinawa'],['ひろしま','hiroshima','Hiroshima','Hiroshima'],['ふくおか','fukuoka','Fukuoka','Fukuoka'],['よこはま','yokohama','Yokohama','Yokohama'],['しんじゅく','shinjuku','Shinjuku','Shinjuku'],['あさくさ','asakusa','Asakusa','Asakusa'],['しぶや','shibuya','Shibuya','Shibuya'],['はらじゅく','harajuku','Harajuku','Harajuku'],['あきはばら','akihabara','Akihabara','Akihabara'],['ぎんざ','ginza','Ginza','Ginza'],['うえの','ueno','Ueno','Ueno'],['ふじさん','fujisan','monte Fuji','Mount Fuji'],
      ['トイレ','toire','banheiro','restroom'],['えき','eki','estação','station'],['でぐち','deguchi','saída','exit'],['いりぐち','iriguchi','entrada','entrance'],['コンビニ','konbini','loja de conveniência','convenience store'],['ホテル','hoteru','hotel','hotel'],['びょういん','byōin','hospital','hospital'],['やっきょく','yakkyoku','farmácia','pharmacy'],['ぎんこう','ginkō','banco','bank'],['こうえん','kōen','parque','park'],['じんじゃ','jinja','santuário','shrine'],['おてら','otera','templo','temple'],['びじゅつかん','bijutsukan','museu de arte','art museum'],['くうこう','kūkō','aeroporto','airport'],['うみ','umi','praia, mar','the sea'],['やま','yama','montanha','mountain'],['レストラン','resutoran','restaurante','restaurant'],['カフェ','kafe','café (lugar)','café'],['スーパー','sūpā','supermercado','supermarket']],
    coisa:[['タオル','taoru','toalha','towel'],['まくら','makura','travesseiro','pillow'],['ちず','chizu','mapa','map'],['かさ','kasa','guarda-chuva','umbrella'],['おみやげ','omiyage','lembrancinha','souvenir'],['おかし','okashi','doces, salgadinhos','snacks'],['Tシャツ','tīshatsu','camiseta','T-shirt'],['ぼうし','bōshi','chapéu, boné','hat'],['くつ','kutsu','sapatos','shoes'],['かばん','kaban','bolsa','bag'],['スマホ','sumaho','celular','smartphone'],['じゅうでんき','jūdenki','carregador','charger'],['きっぷ','kippu','bilhete','ticket'],['パスポート','pasupōto','passaporte','passport'],['さいふ','saifu','carteira','wallet'],['かぎ','kagi','chave','key'],['ふくろ','fukuro','sacola','bag (plastic)'],['レシート','reshīto','recibo','receipt'],['おはし','ohashi','hashi','chopsticks'],['ほん','hon','livro','book'],['マンガ','manga','mangá','manga'],['ペン','pen','caneta','pen'],['くすり','kusuri','remédio','medicine'],['せっけん','sekken','sabonete','soap'],['はブラシ','haburashi','escova de dentes','toothbrush'],['Wi-Fi','waifai','Wi-Fi','Wi-Fi'],['ゆかた','yukata','yukata','yukata'],['きもの','kimono','quimono','kimono']],
    comida:[['ラーメン','rāmen','lámen','ramen'],['すし','sushi','sushi','sushi'],['てんぷら','tenpura','tempurá','tempura'],['カレー','karē','curry','curry'],['うどん','udon','udon','udon'],['そば','soba','soba','soba'],['おにぎり','onigiri','oniguiri','rice ball'],['パン','pan','pão','bread'],['サラダ','sarada','salada','salad'],['やさい','yasai','legumes','vegetables'],['くだもの','kudamono','frutas','fruit'],['りんご','ringo','maçã','apple'],['バナナ','banana','banana','banana'],['いちご','ichigo','morango','strawberry'],['たまご','tamago','ovo','egg'],['とうふ','tōfu','tofu','tofu'],['ぎょうざ','gyōza','guioza','gyoza'],['やきとり','yakitori','yakitori','yakitori'],['おこのみやき','okonomiyaki','okonomiyaki','okonomiyaki'],['たこやき','takoyaki','takoyaki','takoyaki'],['ピザ','piza','pizza','pizza'],['ケーキ','kēki','bolo','cake'],['アイス','aisu','sorvete','ice cream'],['チョコレート','chokorēto','chocolate','chocolate'],['クッキー','kukkī','biscoito','cookie'],['もち','mochi','mochi','mochi'],['べんとう','bentō','bentô (marmita)','bento box'],['ごはん','gohan','arroz, refeição','rice, meal']],
    bebida:[['みず','mizu','água','water'],['おちゃ','ocha','chá','tea'],['コーヒー','kōhī','café','coffee'],['ブラックコーヒー','burakku kōhī','café preto','black coffee'],['こうちゃ','kōcha','chá preto','black tea'],['まっちゃラテ','maccha rate','matcha latte','matcha latte'],['とうにゅうラテ','tōnyū rate','latte com leite de soja','soy latte'],['ジュース','jūsu','suco','juice'],['オレンジジュース','orenji jūsu','suco de laranja','orange juice'],['ぎゅうにゅう','gyūnyū','leite','milk'],['ビール','bīru','cerveja','beer'],['ワイン','wain','vinho','wine'],['コーラ','kōra','refrigerante de cola','cola']],
    cor:[['くろ','kuro','preto','black'],['しろ','shiro','branco','white'],['あか','aka','vermelho','red'],['あお','ao','azul','blue'],['きいろ','kiiro','amarelo','yellow'],['みどり','midori','verde','green'],['ちゃいろ','chairo','marrom','brown'],['ピンク','pinku','rosa','pink'],['むらさき','murasaki','roxo','purple'],['グレー','gurē','cinza','gray'],['ベージュ','bēju','bege','beige'],['オレンジ','orenji','laranja (cor)','orange']],
    corpo:[['あたま','atama','cabeça','head'],['おなか','onaka','barriga','stomach'],['あし','ashi','pé, perna','foot, leg'],['て','te','mão','hand'],['は','ha','dente','tooth'],['のど','nodo','garganta','throat'],['め','me','olho','eye'],['みみ','mimi','ouvido','ear'],['せなか','senaka','costas','back'],['こし','koshi','lombar','lower back'],['むね','mune','peito','chest'],['ひざ','hiza','joelho','knee'],['かた','kata','ombro','shoulder']],
    hobby:[['アニメ','anime','anime','anime'],['マンガ','manga','mangá','manga'],['りょうり','ryōri','cozinhar','cooking'],['サッカー','sakkā','futebol','soccer'],['おんがく','ongaku','música','music'],['えいが','eiga','cinema, filmes','movies'],['どくしょ','dokusho','leitura','reading'],['りょこう','ryokō','viajar','traveling'],['しゃしん','shashin','fotografia','photography'],['ゲーム','gēmu','videogame','video games'],['ダンス','dansu','dança','dancing'],['ヨガ','yoga','ioga','yoga'],['さんぽ','sanpo','caminhar, passear','walking'],['ピアノ','piano','piano','piano'],['ギター','gitā','violão','guitar'],['え','e','desenhar, pintar','drawing'],['カラオケ','karaoke','karaokê','karaoke'],['すいえい','suiei','natação','swimming'],['ランニング','ranningu','corrida','running'],['ねること','neru koto','dormir','sleeping'],['にほんご','nihongo','japonês','Japanese']],
    hora:[['いちじ','ichiji','uma hora','one o\'clock'],['にじ','niji','duas horas','two o\'clock'],['さんじ','sanji','três horas','three o\'clock'],['よじ','yoji','quatro horas','four o\'clock'],['ごじ','goji','cinco horas','five o\'clock'],['ろくじ','rokuji','seis horas','six o\'clock'],['しちじ','shichiji','sete horas','seven o\'clock'],['はちじ','hachiji','oito horas','eight o\'clock'],['くじ','kuji','nove horas','nine o\'clock'],['じゅうじ','jūji','dez horas','ten o\'clock'],['じゅういちじ','jūichiji','onze horas','eleven o\'clock'],['じゅうにじ','jūniji','doze horas','twelve o\'clock']],
    quando:[['あした','ashita','amanhã','tomorrow'],['きょう','kyō','hoje','today'],['こんばん','konban','hoje à noite','tonight'],['あさって','asatte','depois de amanhã','the day after tomorrow'],['らいしゅう','raishū','semana que vem','next week'],['げつようび','getsuyōbi','segunda-feira','Monday'],['かようび','kayōbi','terça-feira','Tuesday'],['すいようび','suiyōbi','quarta-feira','Wednesday'],['もくようび','mokuyōbi','quinta-feira','Thursday'],['きんようび','kin\'yōbi','sexta-feira','Friday'],['どようび','doyōbi','sábado','Saturday'],['にちようび','nichiyōbi','domingo','Sunday'],['しゅうまつ','shūmatsu','fim de semana','the weekend']]
  };
  const W=[]; Object.entries(D).forEach(([cat,l])=>l.forEach(([k,r,pt,en])=>W.push({k,r,pt,en,cat})));

  /* ---------- a frase de cada mapa: molde com uma lacuna ---------- */
  const F={
    aeroporto:{n:1,e:'✈️',t:'Aeroporto',pre:'もくてきちは ',pos:' です。',rpre:'mokutekichi wa ',rpos:' desu.',pt:'Meu destino é ___.',en:'My destination is ___.',cats:['lugar'],op:['とうきょう','おおさか','きょうと','ほっかいどう']},
    hotel:{n:2,e:'🏨',t:'Hotel',pre:'',pos:'を おねがいします。',rpre:'',rpos:' o onegaishimasu.',pt:'___, por favor.',en:'___, please.',cats:['coisa','bebida'],op:['タオル','まくら','ちず','みず']},
    restaurante:{n:3,e:'🍜',t:'Restaurante',pre:'',pos:'に します。',rpre:'',rpos:' ni shimasu.',pt:'Vou querer ___.',en:'I\'ll have ___.',cats:['comida','bebida'],op:['ラーメン','すし','てんぷら','カレー']},
    kombini:{n:4,e:'🏪',t:'Konbini',pre:'',pos:'を ください。',rpre:'',rpos:' o kudasai.',pt:'Me dá ___, por favor.',en:'___, please.',cats:['comida','bebida','coisa'],op:['おにぎり','コーヒー','パン','アイス']},
    trens:{n:5,e:'🚆',t:'Trens',pre:'',pos:'に いきたいです。',rpre:'',rpos:' ni ikitai desu.',pt:'Quero ir a ___.',en:'I want to go to ___.',cats:['lugar'],op:['しんじゅく','あさくさ','きょうと','なら']},
    compras:{n:6,e:'🎁',t:'Compras',pre:'',pos:'は ありますか。',rpre:'',rpos:' wa arimasu ka.',pt:'Tem ___?',en:'Do you have ___?',cats:['coisa','comida'],op:['おみやげ','かさ','Tシャツ','おかし']},
    roupas:{n:7,e:'👚',t:'Roupas',pre:'',pos:'は ありますか。',rpre:'',rpos:' wa arimasu ka.',pt:'Tem em ___?',en:'Do you have it in ___?',cats:['cor'],op:['くろ','しろ','あか','あお']},
    emergencia:{n:8,e:'🆘',t:'Emergência',pre:'',pos:'が いたいです。',rpre:'',rpos:' ga itai desu.',pt:'Estou com dor: ___.',en:'My ___ hurts.',cats:['corpo'],op:['あたま','おなか','あし','は']},
    apresentacao:{n:9,e:'🤝',t:'Apresentação',pre:'しゅみは ',pos:' です。',rpre:'shumi wa ',rpos:' desu.',pt:'Meu hobby é ___.',en:'My hobby is ___.',cats:['hobby'],op:['アニメ','りょうり','サッカー','おんがく']},
    horas:{n:10,e:'🕒',t:'Horas',pre:'いま ',pos:' です。',rpre:'ima ',rpos:' desu.',pt:'Agora são ___.',en:'It is ___ now.',cats:['hora'],op:['くじ','じゅうじ','さんじ','しちじ']},
    planos:{n:11,e:'🎬',t:'Planos',pre:'',pos:'は どうですか。',rpre:'',rpos:' wa dō desu ka.',pt:'Que tal ___?',en:'How about ___?',cats:['quando'],op:['あした','こんばん','どようび','にちようび']},
    sinalizacao:{n:12,e:'🪧',t:'Sinalização',pre:'',pos:'は どこですか。',rpre:'',rpos:' wa doko desu ka.',pt:'Onde fica ___?',en:'Where is ___?',cats:['lugar'],op:['トイレ','でぐち','えき','コンビニ']}
  };
  const ORD=Object.keys(F);

  /* ---------- guardar ---------- */
  const K='utopiaFrases1';
  const lista=()=>{ try{ return JSON.parse(localStorage.getItem(K)||'{}')||{}; }catch(e){ return {}; } };
  const grava=o=>{ try{ localStorage.setItem(K,JSON.stringify(o)); }catch(e){} };
  function db(){ return new Promise((ok,no)=>{ try{ const r=indexedDB.open('uniFrases',1); r.onupgradeneeded=()=>r.result.createObjectStore('voz'); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }catch(e){ no(e); } }); }
  async function pegaVoz(slug){ try{ const d=await db(); return await new Promise(ok=>{ const q=d.transaction('voz').objectStore('voz').get(slug); q.onsuccess=()=>ok(q.result||null); q.onerror=()=>ok(null); }); }catch(e){ return null; } }
  async function poeVoz(slug,blob){ try{ const d=await db(); await new Promise(ok=>{ const t=d.transaction('voz','readwrite'); t.objectStore('voz').put(blob,slug); t.oncomplete=ok; t.onerror=ok; }); return true; }catch(e){ return false; } }

  /* ---------- áudio de referência ---------- */
  const chave=t=>String(t).replace(/[\s、。，．,.!！?？…・「」『』（）()]/g,'');
  let tocando=null;
  function tts(t){ try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='ja-JP'; u.rate=.85; const v=speechSynthesis.getVoices().find(x=>/^ja/i.test(x.lang)); if(v) u.voice=v; speechSynthesis.speak(u); }catch(e){} }
  function fala(t){ const id=window.AUDIO_MAP&&AUDIO_MAP[chave(t)]; if(!id) return tts(t);
    try{ if(tocando) tocando.pause(); const a=new Audio((window.AUDIO_BASE||'/idiomas/audio/')+id+'.mp3'); tocando=a; a.onerror=()=>tts(t); const p=a.play(); if(p&&p.catch) p.catch(()=>tts(t)); }catch(e){ tts(t); } }
  function tocaBlob(b){ try{ if(tocando) tocando.pause(); const a=new Audio(URL.createObjectURL(b)); tocando=a; a.play(); }catch(e){} }

  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const sem=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ぁ-ゖァ-ヺー]/g,'');
  const hira=s=>String(s).replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
  const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
  function monta(f,w){ return {k:f.pre+w.k+f.pos, r:(f.rpre+w.r+f.rpos).replace(/^./,c=>c.toUpperCase()), pt:cap(f.pt.replace('___',w.pt)), en:cap(f.en.replace('___',w.en))}; }
  function busca(q,f){ const s=sem(q); if(s.length<2&&!/[ぁ-ヺ]/.test(q)) return [];
    const hs=hira(q.trim());
    const r=W.filter(w=>sem(w.pt).includes(s)||sem(w.en).includes(s)||sem(w.r).includes(s)||hira(w.k).includes(hs));
    const vis=new Set(); return r.sort((a,b)=>(f.cats.includes(b.cat)-f.cats.includes(a.cat))||(sem(a.pt).indexOf(s)-sem(b.pt).indexOf(s))).filter(w=>!vis.has(w.k)&&vis.add(w.k)).slice(0,8); }

  /* ---------- estilos ---------- */
  function css(){ if(document.getElementById('uf-css')) return; const st=document.createElement('style'); st.id='uf-css'; st.textContent=
   '.uf-ov{position:fixed;inset:0;background:rgba(58,43,56,.42);display:grid;place-items:center;padding:14px;z-index:60}'+
   '.uf-c{background:#fdf6f4;color:#3a2b38;border-radius:22px;width:min(520px,100%);max-height:calc(100dvh - 28px);overflow:auto;padding:18px;display:grid;gap:12px;box-shadow:0 20px 50px -20px rgba(58,43,56,.6);font-family:"Zen Maru Gothic","Hiragino Maru Gothic ProN","Noto Sans JP",system-ui,sans-serif;font-size:15px;line-height:1.55}'+
   '.uf-h{display:flex;justify-content:space-between;align-items:center;gap:10px}.uf-h b{font-family:"Baloo 2",system-ui,sans-serif;font-size:20px}'+
   '.uf-b{font:inherit;font-weight:700;font-size:14px;min-height:44px;padding:0 16px;border-radius:999px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none}'+
   '.uf-b.p{background:#c23f5e;border-color:#c23f5e;color:#fff}.uf-b[disabled]{opacity:.45;cursor:default}.uf-b.rec{background:#fbe9ec;border-color:#c23f5e;color:#b23a57}'+
   '.uf-molde{background:#fff;border:1.5px solid #ecdadd;border-radius:16px;padding:14px;display:grid;gap:4px}'+
   '.uf-jp{font-size:24px;font-weight:700;line-height:1.45}.uf-gap{display:inline-block;min-width:4.5em;border-bottom:2.5px dashed #c23f5e;text-align:center;color:#c23f5e}'+
   '.uf-ro{color:#b23a57;font-weight:700;font-size:13.5px}.uf-pt{color:#6b5a67;font-size:14px}'+
   '.uf-pills{display:flex;flex-wrap:wrap;gap:6px}.uf-pills button{font:inherit;font-size:16px;font-weight:700;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid #ecdadd;background:#fff;color:#3a2b38;cursor:pointer}'+
   '.uf-pills button[aria-pressed="true"]{background:#3a2b38;border-color:#3a2b38;color:#fff}.uf-pills small{font-weight:500;font-size:11.5px;opacity:.75;margin-left:4px}'+
   '.uf-in{font:inherit;font-size:16px;width:100%;min-height:46px;padding:0 14px;border:1.5px solid #ecdadd;border-radius:14px;background:#fff;color:#3a2b38}'+
   '.uf-res{display:grid;gap:6px}.uf-res button{font:inherit;text-align:left;border:1.5px dashed #ecdadd;border-radius:12px;background:#fff;padding:8px 12px;cursor:pointer;color:#3a2b38}.uf-res button b{font-size:17px}'+
   '.uf-sub{margin:0;font-size:13px;color:#6b5a67}.uf-sec{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#816c5b;font-weight:700;margin:4px 0 -4px}'+
   '.uf-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}'+
   '.uf-ok{text-align:center;display:grid;gap:8px;justify-items:center;padding:8px 0}.uf-selo{width:96px;height:96px;border-radius:50%;border:3px solid #4f7a58;color:#4f7a58;display:grid;place-items:center;font-size:34px;transform:rotate(-10deg);animation:ufPop .45s cubic-bezier(.3,1.5,.5,1)}'+
   '@keyframes ufPop{from{transform:rotate(-10deg) scale(.4);opacity:0}to{transform:rotate(-10deg) scale(1);opacity:1}}@media (prefers-reduced-motion:reduce){.uf-selo{animation:none}}'+
   'body.no-ro .uf-ro{display:none}';
   document.head.appendChild(st); }

  /* ---------- o compositor ---------- */
  function abrir(slug,opt){ opt=opt||{}; const f=F[slug]; if(!f) return; css();
    const salvo=lista()[slug]; let w=salvo&&salvo.w?salvo.w:null, voz=null, rec=null, partes=[];
    pegaVoz(slug).then(b=>{ if(b&&!voz){ voz=b; desenha(); } });
    const ov=document.createElement('div'); ov.className='uf-ov'; ov.innerHTML='<div class="uf-c" role="dialog" aria-modal="true" aria-labelledby="ufT"></div>'; document.body.appendChild(ov);
    const c=ov.firstChild, foco=document.activeElement;
    const fecha=()=>{ try{ if(rec&&rec.state==='recording') rec.stop(); }catch(e){} ov.remove(); if(foco) try{ foco.focus(); }catch(e){} };
    ov.addEventListener('click',e=>{ if(e.target===ov||e.target.closest('[data-uf-fecha]')) fecha(); });
    ov.addEventListener('keydown',e=>{ if(e.key==='Escape') fecha(); });
    const opcoes=f.op.map(k=>W.find(x=>x.k===k&&f.cats.includes(x.cat))||W.find(x=>x.k===k));
    function desenha(){ const fr=w?monta(f,w):null;
      c.innerHTML=`<div class="uf-h"><b id="ufT">🌱 Minha frase · ${f.e} ${esc(f.t)}</b><button class="uf-b" type="button" data-uf-fecha>Fechar</button></div>
        <p class="uf-sub">Uma frase sobre você, no molde deste mapa. Ela vai para o seu Caderno, com a sua voz.</p>
        <div class="uf-molde"><div class="uf-jp" lang="ja">${esc(f.pre)}<span class="uf-gap">${w?esc(w.k):'？'}</span>${esc(f.pos)}</div>
          <div class="uf-ro">${esc(fr?fr.r:f.rpre+'___'+f.rpos)}</div><div class="uf-pt">${esc(fr?fr.pt:f.pt)}</div>
          ${fr?'<div class="uf-row"><button class="uf-b" type="button" id="ufOuve">🔊 Ouvir o modelo</button></div>':''}</div>
        <p class="uf-sec">1 · Escolha</p>
        <div class="uf-pills">${opcoes.map((o,i)=>`<button type="button" data-op="${i}" aria-pressed="${!!(w&&w.k===o.k)}"><span lang="ja">${esc(o.k)}</span><small>${esc(o.pt)}</small></button>`).join('')}</div>
        <p class="uf-sec">ou escreva a sua palavra</p>
        <input class="uf-in" id="ufBusca" type="search" autocomplete="off" placeholder="Ex.: chocolate, guarda-chuva, ピアノ" aria-label="Buscar outra palavra (em português, inglês ou kana)">
        <div class="uf-res" id="ufRes" aria-live="polite"></div>
        <p class="uf-sec">2 · Grave a sua voz</p>
        <div class="uf-row"><button class="uf-b ${rec&&rec.state==='recording'?'rec':''}" type="button" id="ufGrava" ${fr?'':'disabled'}>${rec&&rec.state==='recording'?'⏹ Parar a gravação':(voz?'🎙️ Regravar minha voz':'🎙️ Gravar minha voz')}</button>
          ${voz?'<button class="uf-b" type="button" id="ufMinha">▶ Ouvir minha voz</button>':''}</div>
        <p class="uf-sub" id="ufAviso">${fr?'A gravação fica guardada neste aparelho.':'Escolha uma palavra para montar a frase.'}</p>
        <button class="uf-b p" type="button" id="ufCarimba" ${fr?'':'disabled'} style="width:100%">🌱 Carimbar no meu Caderno</button>`;
      c.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{ w=opcoes[+b.dataset.op]; desenha(); fala(w.k); });
      const bi=c.querySelector('#ufBusca'), rs=c.querySelector('#ufRes');
      bi.oninput=()=>{ const r=busca(bi.value,f); rs.innerHTML=bi.value.trim().length<2?'':(r.length?r.map((o,i)=>`<button type="button" data-r="${i}"><b lang="ja">${esc(o.k)}</b> <span class="uf-ro">${esc(o.r)}</span> · ${esc(o.pt)}</button>`).join(''):'<p class="uf-sub">Ainda não temos essa palavra no dicionário. Tente outra parecida, ou peça para a professora incluir.</p>');
        rs.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ w=r[+b.dataset.r]; desenha(); fala(w.k); }); };
      if(c.querySelector('#ufOuve')) c.querySelector('#ufOuve').onclick=()=>fala(monta(f,w).k);
      if(c.querySelector('#ufMinha')) c.querySelector('#ufMinha').onclick=()=>tocaBlob(voz);
      c.querySelector('#ufGrava').onclick=grava2;
      c.querySelector('#ufCarimba').onclick=carimba;
    }
    async function grava2(){ const av=c.querySelector('#ufAviso');
      if(rec&&rec.state==='recording'){ rec.stop(); return; }
      if(!navigator.mediaDevices||!window.MediaRecorder){ av.textContent='Este navegador não deixa gravar áudio. Você ainda pode carimbar a frase sem a voz.'; return; }
      try{ const st=await navigator.mediaDevices.getUserMedia({audio:true}); partes=[]; rec=new MediaRecorder(st);
        rec.ondataavailable=e=>{ if(e.data&&e.data.size) partes.push(e.data); };
        rec.onstop=()=>{ st.getTracks().forEach(t=>t.stop()); voz=new Blob(partes,{type:rec.mimeType||'audio/webm'}); desenha(); };
        rec.start(); desenha(); setTimeout(()=>{ if(rec&&rec.state==='recording') rec.stop(); },15000);
      }catch(e){ av.textContent='Não consegui usar o microfone. Confira a permissão do navegador. Você pode carimbar a frase sem a voz.'; } }
    async function carimba(){ const fr=monta(f,w), L=lista(); L[slug]=Object.assign(fr,{w,t:Date.now(),voz:!!voz||!!(L[slug]&&L[slug].voz)}); grava(L);
      if(voz) await poeVoz(slug,voz);
      c.innerHTML=`<div class="uf-ok"><div class="uf-selo" aria-hidden="true">🌱</div><b style="font-family:'Baloo 2',system-ui,sans-serif;font-size:20px">Carimbada no seu Caderno!</b>
        <div class="uf-jp" lang="ja">${esc(fr.k)}</div><div class="uf-pt">${esc(fr.pt)}</div>
        <div class="uf-row" style="justify-content:center"><a class="uf-b" href="/idiomas/caderno/#frases">📒 Ver no Caderno</a><button class="uf-b p" type="button" data-uf-fecha>Continuar</button></div></div>`;
      if(typeof opt.aoSalvar==='function') try{ opt.aoSalvar(L[slug]); }catch(e){} }
    desenha(); const b0=c.querySelector('button'); if(b0) b0.focus();
  }
  window.UniFrase={abrir,lista,voz:pegaVoz,fala,tocaBlob,F,ORD};
})();
