/* Salão · jogos de cena (arrastar e soltar)
   Cinco cenas: Caixa do Konbini, Detetive de Mensagens, Sobreviva ao Izakaya,
   O Arquiteto de Quartos e Passaporte na Alfândega.
   Cada jogo é um objeto { ic, nome, sub, desc, novo(), render(st,c), acao(a,st,c), tick?, vista? }.
   O estado (st) só tem texto, números e mapas simples, para ir igual ao Firebase (jogar juntos)
   ou ficar só no aparelho (jogar sozinho, que é o padrão).
   Quem desenha a tela, trata o arrastar/tocar e guarda o estado é o código do Salão (index.html). */
(function(){
'use strict';
var E=function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var num=function(v){ return +v||0; };
function rnd(seed){ var s=(seed|0)||1; return function(){ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; }; }
function embaralha(a,seed){ var r=rnd(seed), b=a.slice(); for(var i=b.length-1;i>0;i--){ var j=Math.floor(r()*(i+1)); var t=b[i]; b[i]=b[j]; b[j]=t; } return b; }

/* todas as falas em japonês dos jogos (para saber quais ainda precisam de voz gravada) */
var FALAS=[];
function F(jp,ro,pt){ FALAS.push(jp); return {jp:jp,ro:ro,pt:pt}; }
/* uma linha: japonês + romaji (só aparece com o botão) + tradução */
function T(x,c){
  var som=(c.grav&&c.grav(x.jp))?'<button type="button" class="cn-som" data-fala="'+E(x.jp)+'" aria-label="Ouvir">🔊</button>':'';
  return '<span class="cn-lin"><span class="cn-jp" lang="ja">'+E(x.jp)+'</span>'+som+'<span class="wro cn-ro"'+(c.ro?'':' hidden')+'>'+E(x.ro)+'</span><span class="cn-pt">'+E(x.pt)+'</span></span>';
}
function rot(jp,ro,pt,c){ return '<span class="cn-lin cn-rot"><span lang="ja">'+E(jp)+'</span><span class="wro cn-ro"'+(c.ro?'':' hidden')+'> · '+E(ro)+'</span><small>'+E(pt)+'</small></span>'; }
function estrelas(n){ n=Math.max(0,Math.min(3,n)); return '⭐'.repeat(n)+'☆'.repeat(3-n); }

var CENAS={};

/* ============================================================
   1. CAIXA DO KONBINI — "O Turno da Manhã"
   números, contadores, alimentos e perguntas de atendimento
   ============================================================ */
var K={
  cliente:F('おはようございます！ さけの おにぎりを ふたつと、アイスコーヒーを ひとつ ください。あっ、やっぱり、さけを ひとつ ツナに かえてください！','Ohayō gozaimasu! Sake no onigiri o futatsu to, aisu kōhī o hitotsu kudasai. A, yappari, sake o hitotsu tsuna ni kaete kudasai!','Bom dia! Me vê dois onigiris de salmão e um café gelado, por favor. Ah, não, espera... troca um de salmão por um de atum!'),
  A:F('コーヒーを あたためますか？','Kōhī o atatamemasu ka?','Vai querer aquecer o café?'),
  B:F('ふくろは いりますか？','Fukuro wa irimasu ka?','Precisa de sacola plástica?'),
  C:F('おなまえは なんですか？','Onamae wa nan desu ka?','Qual é o seu nome?'),
  ok:F('たすかりました！ ありがとう！','Tasukarimashita! Arigatō!','Obrigado, salvou minha manhã!'),
  no:F('もう いいです！ でんしゃに おくれる！','Mō ii desu! Densha ni okureru!','Deixa pra lá, vou perder meu trem!')
};
var KI=[
  ['sake','🍙','おにぎり','onigiri','salmão','さけ','sake'],
  ['tuna','🍙','おにぎり','onigiri','atum','ツナ','tsuna'],
  ['umeboshi','🍙','おにぎり','onigiri','ameixa em conserva','うめぼし','umeboshi'],
  ['bento','🍱','おべんとう','obentō','bentô de frango','とり','tori'],
  ['ocha','🍵','おちゃ','ocha','chá verde','',''],
  ['cafe','🧋','アイスコーヒー','aisu kōhī','café gelado','',''],
  ['napkin','🧻','ナプキン','napukin','guardanapos','','']
];
function kItem(id){ for(var i=0;i<KI.length;i++) if(KI[i][0]===id) return KI[i]; return null; }
function kBotao(it,c,extra){
  var nome=it[5]?it[2]+' ('+it[5]+')':it[2], ro=it[6]?it[3]+' ('+it[6]+')':it[3];
  return '<span class="cn-em">'+it[1]+'</span><b lang="ja">'+E(nome)+'</b><span class="wro cn-ro"'+(c.ro?'':' hidden')+'>'+E(ro)+'</span><small>'+E(it[4])+'</small>';
}
function kTotal(s){ var t=0; for(var k in (s||{})) t+=num(s[k]); return t; }
CENAS.konbini={
  ic:'🏪', nome:'Caixa do Konbini', sub:'Números · atendimento', desc:'O Turno da Manhã',
  novo:function(){ return {fase:'pedido',t0:Date.now(),estrelas:3,pontos:0}; },
  render:function(st,c){
    var sac=st.sacola||{}, tot=kTotal(sac);
    var estr='<div class="cn-estr" aria-label="Reputação da loja">'+estrelas(st.estrelas==null?3:num(st.estrelas))+' <small>reputação</small></div>';
    var bal='<div class="cn-cliente"><span class="cn-av">🧑‍💼</span><div class="cn-balao">'+T(K.cliente,c)+'</div></div>';
    if(st.fim){
      var ok=st.res==='ok', motivo={itens:'Os itens não batiam com o pedido (o cliente trocou um onigiri no meio da frase!).',tempo:'A paciência do cliente acabou.',pergunta:'A pergunta de atendimento não era a certa para esse pedido.','tempo-pergunta':'Demorou para perguntar e o cliente foi embora.'}[st.motivo]||'';
      return estr+bal+'<div class="cn-res '+(ok?'ok':'no')+'"><b>'+(ok?'🎉 Cliente atendido! +100 pontos':'😮‍💨 Cliente perdido (−1 estrela)')+'</b><p>'+T(ok?K.ok:K.no,c)+'</p>'+(ok?'<p class="sub">O cliente pediu dois onigiris, mas trocou um de salmão por um de atum: no fim, <b>1 salmão + 1 atum + 1 café gelado</b>. Depois dos itens, a pergunta certa era se ele precisa de sacola (<span lang="ja">ふくろ</span>).</p>':'<p class="sub">'+E(motivo)+' Resposta certa: <b>1 salmão + 1 atum + 1 café gelado</b>, e perguntar se precisa de sacola.</p>')+'</div>';
    }
    var barra='<div class="cn-pac" role="img" aria-label="Paciência do cliente"><i data-barra></i></div><p class="sub cn-seg" data-seg></p>';
    var prat='<div class="cn-prat" role="group" aria-label="Prateleira">'+KI.map(function(it){ return '<button type="button" class="cn-peca'+(c.sel===it[0]?' sel':'')+'" data-drag="'+it[0]+'" data-a="sel" data-item="'+it[0]+'">'+kBotao(it,c)+'</button>'; }).join('')+'</div>';
    var chips=Object.keys(sac).filter(function(k){ return num(sac[k])>0; }).map(function(k){ var it=kItem(k); var n=num(sac[k]); return Array(n+1).join('<button type="button" class="cn-chip" data-a="tira" data-item="'+k+'" title="Tirar da sacola">'+it[1]+' '+E(it[5]||it[2])+' ✕</button>'); }).join('');
    var bolsa='<div class="cn-sacola" data-a="zona" data-zona="sacola"><b>🛍️ <span lang="ja">ふくろ</span> <small>('+tot+' de 3)</small></b><div class="cn-chips">'+(chips||'<span class="sub">Arraste os itens do pedido até aqui, ou toque no item e depois na sacola.</span>')+'</div></div>';
    if(st.fase==='pergunta'){
      var ord=(st.ord||'ABC').split('');
      var bal3='<div class="cn-opts" role="group" aria-label="O que você pergunta ao cliente?">'+ord.map(function(o){ return '<button type="button" class="cn-fala" data-a="resp" data-op="'+o+'">'+T(K[o],c)+'</button>'; }).join('')+'</div><div class="cn-pac q" role="img" aria-label="Tempo para perguntar"><i data-qbarra></i></div>';
      return estr+bal+barra+bolsa+'<p class="cn-dica"><b>Pergunte ao cliente</b> (5 segundos, o relógio do pedido está parado):</p>'+bal3;
    }
    return estr+bal+barra+'<p class="cn-dica">Monte o pedido <b>já corrigido</b> (leia com atenção até o fim!).</p>'+bolsa+prat;
  },
  acao:function(a,st,c){
    var sac=st.sacola||{};
    if(st.fim) return null;
    if(st.fase==='pedido' && a.t==='poe' && a.zona==='sacola' && kItem(a.item)){
      var tot=kTotal(sac); if(tot>=3) return null;
      var n2={}; for(var k in sac) n2[k]=num(sac[k]); n2[a.item]=num(n2[a.item])+1;
      var p={}; p['sacola/'+a.item]=n2[a.item];
      if(tot+1>=3){
        var certo=num(n2.sake)===1&&num(n2.tuna)===1&&num(n2.cafe)===1&&kTotal(n2)===3;
        if(certo){ p.fase='pergunta'; p.gasto=c.now-num(st.t0); p.qt0=c.now; p.ord=embaralha(['A','B','C'],c.now).join(''); }
        else{ p.fim=true; p.res='erro'; p.motivo='itens'; p.estrelas=2; }
      }
      return p;
    }
    if(st.fase==='pedido' && a.t==='tira' && num(sac[a.item])>0){ var q={}; q['sacola/'+a.item]=num(sac[a.item])>1?num(sac[a.item])-1:null; return q; }
    if(st.fase==='pergunta' && a.t==='resp'){
      if(a.op==='B') return {fim:true,res:'ok',pontos:100,estrelas:3};
      return {fim:true,res:'erro',motivo:'pergunta',estrelas:2};
    }
    return null;
  },
  tick:function(st,c){
    if(st.fim) return null;
    if(st.fase==='pedido' && c.now-num(st.t0)>=30000) return {fim:true,res:'erro',motivo:'tempo',estrelas:2};
    if(st.fase==='pergunta' && c.now-num(st.qt0)>=5000) return {fim:true,res:'erro',motivo:'tempo-pergunta',estrelas:2};
    return null;
  },
  vista:function(st,c,box){
    var b=box.querySelector('[data-barra]'), s=box.querySelector('[data-seg]'), q=box.querySelector('[data-qbarra]');
    var gasto=st.fase==='pergunta'?num(st.gasto):c.now-num(st.t0);
    var pct=Math.max(0,Math.min(100,100-gasto/300));
    if(b){ b.style.width=pct+'%'; b.parentNode.classList.toggle('pouco',pct<30); }
    if(s) s.textContent=(st.fase==='pergunta'?'⏸ relógio parado · ':'⏱ ')+'paciência do cliente: '+Math.max(0,Math.ceil((30000-gasto)/1000))+' s';
    if(q) q.style.width=Math.max(0,Math.min(100,100-(c.now-num(st.qt0))/50))+'%';
  }
};

/* ============================================================
   2. DETETIVE DE MENSAGENS — "O Guarda-Chuva Perdido"
   leitura, horários, lugares e contexto
   ============================================================ */
var D={
  m1:F('としょかんを でるとき、あおい かさを わすれた！','Toshokan o deru toki, aoi kasa o wasureta!','Ao sair da biblioteca, esqueci meu guarda-chuva azul!'),
  m2:F('みたよ！ 2かいの じどうはんばいきの ちかくに あったよ。','Mita yo! Nikai no jidōhanbaiki no chikaku ni atta yo.','Eu vi! Estava perto da máquina de bebidas do 2º andar.'),
  m3:F('ほんとう？ とって きて くれる？ 5じに えきの カフェで コーヒーを おごるよ。','Hontō? Totte kite kureru? Goji ni eki no kafe de kōhī o ogoru yo.','Sério? Você pega pra mim? Te pago um café às 17h na cafeteria da estação.'),
  m4:F('いいよ！ えきへ いく まえに、うけつけに あずけて おくね。もって あるくのは いやだから。','Ii yo! Eki e iku mae ni, uketsuke ni azukete oku ne. Motte aruku no wa iya dakara.','Fechado! Vou deixar guardado na recepção antes de ir para a estação, não quero ficar carregando.'),
  foto:F('カフェの あかい かさ','Kafe no akai kasa','Foto: guarda-chuva vermelho na cafeteria (de outro dia).'),
  nota:F('あした 9じ: テスト','Ashita kuji: tesuto','Amanhã 9h: prova.')
};
/* id, japonês, romaji, português, slot certo (ou ''), emoji */
var DI=[
  ['rec','としょかんの うけつけ','toshokan no uketsuke','Recepção da biblioteca','onde','🛎️'],
  ['recep','うけつけの ひと','uketsuke no hito','Recepcionista (guardado na recepção)','quem','🧑‍💼'],
  ['antes','5じ まえ','goji mae','Antes das 17h','hora','🕔'],
  ['cafe','えきの カフェ','eki no kafe','Cafeteria da estação','','☕'],
  ['verm','あかい かさ','akai kasa','Guarda-chuva vermelho','','☂️'],
  ['maq','じどうはんばいき','jidōhanbaiki','Máquina de bebidas','','🥤'],
  ['mari','まりさん','mari-san','Mari','','🙋‍♀️'],
  ['depois','5じの あと','goji no ato','Depois das 17h','','🕕']
];
var DS=[['onde','どこに ある？','doko ni aru?','Onde está?'],['quem','だれが もってる？','dare ga motteru?','Com quem ficou?'],['hora','なんじまでに とりに いく？','nanji made ni tori ni iku?','Que horas buscar?']];
function dItem(id){ for(var i=0;i<DI.length;i++) if(DI[i][0]===id) return DI[i]; return null; }
function dErros(st){ var sl=st.slots||{}, e={}; DS.forEach(function(s){ var it=dItem(sl[s[0]]); if(!it||it[4]!==s[0]) e[s[0]]=1; }); return e; }
CENAS.detetive={
  ic:'🕵️', nome:'Detetive de Mensagens', sub:'Leitura · horários · lugares', desc:'O Guarda-Chuva Perdido',
  novo:function(){ return {tent:0}; },
  render:function(st,c){
    var sl=st.slots||{}, aba=c.ui.detAba||'chat';
    var tabs='<div class="cn-abas" role="tablist">'+[['chat','💬 Grupo da faculdade'],['fotos','🖼️ Fotos'],['notas','📝 Notas']].map(function(a){ return '<button type="button" role="tab" class="'+(aba===a[0]?'on':'')+'" aria-selected="'+(aba===a[0])+'" data-a="ui" data-k="detAba" data-v="'+a[0]+'">'+a[1]+'</button>'; }).join('')+'</div>';
    var corpo;
    if(aba==='chat'){
      corpo='<div class="cn-chat">'+[['けんじ','14:10',D.m1,0],['まり','14:12',D.m2,1],['けんじ','14:15',D.m3,0],['まり','14:16',D.m4,1]].map(function(m){ return '<div class="cn-msg'+(m[3]?' m':'')+'"><b>'+E(m[0])+' <small>'+m[1]+'</small></b>'+T(m[2],c)+'</div>'; }).join('')+'</div>';
    }else if(aba==='fotos'){
      corpo='<div class="cn-fotos"><div class="cn-foto"><span>☂️</span>'+T(D.foto,c)+'</div></div>';
    }else{
      corpo='<div class="cn-notas"><div class="cn-nota">'+T(D.nota,c)+'</div></div>';
    }
    var erros=st.chk?dErros(st):{};
    var quadro='<div class="cn-quadro"><b>🗂️ Quadro de evidências</b>'+DS.map(function(s){
      var it=dItem(sl[s[0]]), bad=st.chk&&erros[s[0]];
      return '<div class="cn-slot'+(it?' cheio':'')+(bad?' err':'')+(st.fim?' certo':'')+'" data-a="zona" data-subst="1" data-zona="s:'+s[0]+'"><span class="cn-slot-t">'+rot(s[1],s[2],s[3],c)+'</span>'+(it?'<button type="button" class="cn-etq" data-drag="'+it[0]+'" data-a="sel" data-item="'+it[0]+'">'+it[5]+' <span lang="ja">'+E(it[1])+'</span><small>'+E(it[3])+'</small></button>'+(st.fim?'':'<button type="button" class="cn-x" data-a="tira" data-slot="'+s[0]+'" aria-label="Tirar do quadro">✕</button>'):'<em>solte aqui</em>')+'</div>';
    }).join('')+'</div>';
    var usados={}; for(var k in sl) usados[sl[k]]=1;
    var pool='<div class="cn-pool" data-a="zona" data-zona="barra"><b>Pistas</b> <small>arraste para o quadro (ou toque na pista e depois no quadro)</small><div class="cn-etqs">'+DI.filter(function(it){ return !usados[it[0]]; }).map(function(it){ return '<button type="button" class="cn-etq'+(c.sel===it[0]?' sel':'')+'" data-drag="'+it[0]+'" data-a="sel" data-item="'+it[0]+'">'+it[5]+' <span lang="ja">'+E(it[1])+'</span><span class="wro cn-ro"'+(c.ro?'':' hidden')+'> '+E(it[2])+'</span><small>'+E(it[3])+'</small></button>'; }).join('')+'</div></div>';
    var cheio=DS.every(function(s){ return sl[s[0]]; });
    var alerta='';
    if(st.chk && !st.fim){
      var usouFalso=['cafe','verm'].some(function(id){ return ['onde','quem','hora'].some(function(s){ return sl[s]===id; }); });
      alerta='<div class="cn-alerta">'+(usouFalso?'Ops! Esse guarda-chuva não é o do Kenji. Leia a última mensagem da Mari com atenção!':'Hmm, alguma pista não bate com o que foi dito no chat. Releia as mensagens, principalmente a da Mari às 14:16.')+'</div>';
    }
    if(st.fim) return '<div class="cn-celular">'+tabs+corpo+'</div>'+quadro+'<div class="cn-carimbo">CASO ENCERRADO <small lang="ja">かいけつ！</small></div><div class="cn-res ok"><p>☂️ O Kenji pegou o guarda-chuva azul, secinho, na recepção da biblioteca, antes de a chuva cair.</p><p class="sub">A pista da Mari (<span lang="ja">うけつけに あずけて おくね</span>) mudou o lugar do guarda-chuva: antes era a máquina de bebidas, depois virou a recepção. E o café é só às 17h, então ele precisa buscar <b>antes</b> (<span lang="ja">まえ</span>).</p></div>';
    return '<div class="cn-celular">'+tabs+corpo+'</div>'+quadro+pool+alerta+'<div class="row" style="justify-content:center"><button type="button" class="btn pri" data-a="resolve"'+(cheio?'':' disabled')+'>🔎 Resolver o caso</button></div>';
  },
  acao:function(a,st,c){
    if(st.fim) return null;
    var sl=st.slots||{};
    if(a.t==='poe' && dItem(a.item)){
      var p={chk:null};
      for(var k in sl) if(sl[k]===a.item) p['slots/'+k]=null;
      if(a.zona==='barra') return p;
      if(a.zona.indexOf('s:')!==0) return null;
      p['slots/'+a.zona.slice(2)]=a.item; return p;
    }
    if(a.t==='tira' && sl[a.slot]){ var q={chk:null}; q['slots/'+a.slot]=null; return q; }
    if(a.t==='resolve'){
      if(!DS.every(function(s){ return sl[s[0]]; })) return null;
      var e=dErros(st);
      if(!Object.keys(e).length) return {fim:true,res:'ok',chk:1};
      return {chk:1,tent:num(st.tent)+1};
    }
    return null;
  }
};

/* ============================================================
   3. SOBREVIVA AO IZAKAYA — "O Brinde com o Chefe"
   formalidade (polido x informal) e vocabulário de restaurante
   ============================================================ */
var Z={
  chefe:F('きょうは わたしが おごります。なんでも ちゅうもん してください。わたしは ビールに あう かるい ものが いいですね。','Kyō wa watashi ga ogorimasu. Nandemo chūmon shite kudasai. Watashi wa biiru ni au karui mono ga ii desu ne.','Hoje eu pago! Peçam o que quiserem. Eu quero apenas algo leve para acompanhar a bebida.'),
  A:F('おい、ビール もってきて！ かんぱい しようぜ！','Oi, biiru motte kite! Kanpai shiyō ze!','Ô cara, traz uma cerveja aí pro chefe e manda ver no brinde!'),
  B:F('すみません、ビールと えだまめを おねがいします。ぶちょう、ごちそうに なります。ありがとうございます。','Sumimasen, biiru to edamame o onegai shimasu. Buchō, gochisō ni narimasu. Arigatō gozaimasu.','Com licença, por favor, traga uma cerveja e um edamame. Muito obrigado pela gentileza, Sr. Tanaka.'),
  C:F('いますぐ たべものを もってこい。','Ima sugu tabemono o motte koi.','Eu ordeno que traga a comida agora.'),
  okf:F('いい ちゅうもんですね！ かんぱい！','Ii chūmon desu ne! Kanpai!','Excelente escolha! Saúde!'),
  nA:F('ちょっと！ ぶちょうだよ！ ていねいな ことばで はなして！','Chotto! Buchō da yo! Teinei na kotoba de hanashite!','Ei, ele é o diretor! Use linguagem formal!'),
  nC:F('それは しつれいだよ…！ もっと ていねいに おねがいして！','Sore wa shitsurei da yo...! Motto teinei ni onegai shite!','Isso é falta de educação...! Peça com mais cuidado!')
};
var ZI=[['edamame','🌱','えだまめ','edamame','edamame (leve)'],['yakitori','🍢','やきとり','yakitori','espetinho'],['biiru','🍺','ビール','biiru','cerveja'],['juice','🧃','ジュース','jūsu','suco']];
function zClima(n){ return n>=70?['Ambiente Agradável','boa']:n<=30?['Climão','ruim']:['Ambiente neutro','media']; }
CENAS.izakaya={
  ic:'🍻', nome:'Sobreviva ao Izakaya', sub:'Formalidade · restaurante', desc:'O Brinde com o Chefe',
  novo:function(){ return {fase:'pedido',clima:50,tent:0}; },
  render:function(st,c){
    var cl=num(st.clima), zc=zClima(cl);
    var medidor='<div class="cn-clima '+zc[1]+'"><span>Clima da mesa</span><div class="cn-mede"><i style="width:'+cl+'%"></i></div><b>'+zc[0]+'</b></div>';
    var peca=st.mesa&&ZI.filter(function(i){ return i[0]===st.mesa; })[0];
    var cena='<div class="cn-izk"><div class="cn-pess"><span class="cn-av">👴</span><b>'+rot('たなか ぶちょう','Tanaka buchō','Sr. Tanaka (chefe)',c)+'</b></div>'+
      '<div class="cn-pess"><span class="cn-av">👩</span><b>'+rot('ゆき','Yuki','colega',c)+'</b></div>'+
      '<button type="button" class="cn-pess cn-gar" data-a="garcom"><span class="cn-av">🧑‍🍳</span><b>'+rot('てんいん','ten\'in','garçom',c)+'</b><small>toque para chamar</small></button></div>';
    var mesaT='<div class="cn-mesaT" data-a="zona" data-zona="tanaka"><b>🍽️ Na frente do Sr. Tanaka</b><div>'+(peca?'<span class="cn-em">'+peca[1]+'</span> <span lang="ja">'+E(peca[2])+'</span>':'<span class="sub">arraste um petisco até aqui</span>')+'</div></div>';
    var bal='<div class="cn-balao chefe">'+T(Z.chefe,c)+'</div>';
    if(st.fim){
      return medidor+bal+'<div class="cn-brinde">🍻 <span lang="ja">かんぱい！</span></div><div class="cn-res ok"><p>'+T(Z.okf,c)+'</p><p class="sub">Você usou a linguagem polida (<span lang="ja">おねがいします</span>, <span lang="ja">ごちそうに なります</span>) e agradeceu o chefe. '+(num(st.tent)?'Tentativas erradas: '+num(st.tent)+'.':'De primeira!')+'</p></div>';
    }
    var bandeja='<div class="cn-bandeja"><b>Bandeja</b><div class="cn-prat">'+ZI.map(function(i){ return '<button type="button" class="cn-peca'+(c.sel===i[0]?' sel':'')+'" data-drag="'+i[0]+'" data-a="sel" data-item="'+i[0]+'"><span class="cn-em">'+i[1]+'</span><b lang="ja">'+E(i[2])+'</b><span class="wro cn-ro"'+(c.ro?'':' hidden')+'>'+E(i[3])+'</span><small>'+E(i[4])+'</small></button>'; }).join('')+'</div></div>';
    if(st.fase==='pedido'){
      var dica=st.dica==='errado'?'<p class="cn-alerta">O chefe pediu algo <b>leve</b> (<span lang="ja">かるい</span>) para acompanhar a bebida. Qual petisco combina?</p>':st.dica==='vazio'?'<p class="cn-alerta">Primeiro escolha o que vai para a frente do Sr. Tanaka.</p>':'';
      return medidor+cena+bal+'<p class="cn-dica"><b>1.</b> Leve à frente do chefe o petisco que ele pediu. <b>2.</b> Chame o garçom.</p>'+mesaT+bandeja+dica;
    }
    var ord=(st.ord||'ABC').split(''), er=st.errados||{};
    var yuki=st.ult==='A'?'<div class="cn-balao yuki">👩 '+T(Z.nA,c)+'</div>':st.ult==='C'?'<div class="cn-balao yuki">👩 '+T(Z.nC,c)+'</div>':'';
    return medidor+cena+mesaT+'<p class="cn-dica"><b>Como você fala com o garçom (e com o chefe)?</b></p><div class="cn-opts">'+ord.map(function(o){ return '<button type="button" class="cn-fala'+(er[o]?' errado':'')+'" data-a="resp" data-op="'+o+'"'+(er[o]?' disabled':'')+'>'+T(Z[o],c)+'</button>'; }).join('')+'</div>'+yuki;
  },
  acao:function(a,st,c){
    if(st.fim) return null;
    if(st.fase==='pedido'){
      if(a.t==='poe' && a.zona==='tanaka' && ZI.some(function(i){ return i[0]===a.item; })) return {mesa:a.item,dica:null};
      if(a.t==='poe' && a.zona==='barra') return {mesa:null};
      if(a.t==='garcom'){
        if(!st.mesa) return {dica:'vazio'};
        if(st.mesa!=='edamame') return {dica:'errado',mesa:null};
        return {fase:'fala',dica:null,ord:embaralha(['A','B','C'],c.now).join('')};
      }
      return null;
    }
    if(st.fase==='fala' && a.t==='resp' && Z[a.op] && ['A','B','C'].indexOf(a.op)>=0){
      if(a.op==='B') return {fim:true,res:'ok',clima:Math.max(70,Math.min(100,num(st.clima)+40)),ult:null};
      var p={clima:Math.max(0,num(st.clima)-30),ult:a.op,tent:num(st.tent)+1}; p['errados/'+a.op]=1; return p;
    }
    return null;
  }
};

/* ============================================================
   4. O ARQUITETO DE QUARTOS — "A Mudança do Studio"
   preposições de lugar e móveis
   ============================================================ */
var Q={
  n1:F('ベッドを おくの かべに つけてください。','Beddo o oku no kabe ni tsukete kudasai.','Coloque a cama encostada na parede do fundo.'),
  n2:F('ナイトテーブルを ベッドの みぎに おいてください。','Naito tēburu o beddo no migi ni oite kudasai.','Coloque a mesa de cabeceira à direita da cama.'),
  n3:F('ランプを ナイトテーブルの うえに おいてください。','Ranpu o naito tēburu no ue ni oite kudasai.','Coloque o abajur em cima da mesa de cabeceira.'),
  n4:F('カーペットを へやの まんなかに おいて、かぎを カーペットの したに かくしてください。','Kāpetto o heya no mannaka ni oite, kagi o kāpetto no shita ni kakushite kudasai.','Coloque o tapete no centro do quarto e esconda a chave embaixo do tapete.'),
  n5:F('リュックを ベッドの ひだりに おいてください。','Ryukku o beddo no hidari ni oite kudasai.','Deixe a mochila ao lado esquerdo da cama.'),
  ok:F('かんぺき！ ぜんぶ たのんだ とおりだ！','Kanpeki! Zenbu tanonda tōri da!','Perfeito! Tudo exatamente onde eu pedi!'),
  chave:F('あれ？ かぎが みえる！ どろぼうに みつかるよ！ カーペットの したって いったのに！','Are? Kagi ga mieru! Dorobō ni mitsukaru yo! Kāpetto no shita tte itta noni!','Ué, qualquer ladrão veria a chave aí! Eu pedi EMBAIXO do tapete!'),
  e_cama:F('ベッドは おくの かべに つけて！','Beddo wa oku no kabe ni tsukete!','A cama tem que ficar encostada na parede do fundo (a de cima).'),
  e_mesa:F('ナイトテーブルは ベッドの みぎ！','Naito tēburu wa beddo no migi!','A mesa de cabeceira fica à direita da cama (do seu lado direito da tela).'),
  e_abajur:F('ランプは ナイトテーブルの うえ！','Ranpu wa naito tēburu no ue!','O abajur fica em cima da mesa de cabeceira.'),
  e_tapete:F('カーペットは へやの まんなか！','Kāpetto wa heya no mannaka!','O tapete fica bem no centro do quarto.'),
  e_mochila:F('リュックは ベッドの ひだり！','Ryukku wa beddo no hidari!','A mochila fica à esquerda da cama.')
};
var QI=[['cama','🛏️','ベッド','beddo','cama'],['mesa','🗄️','ナイトテーブル','naito tēburu','mesa de cabeceira'],['abajur','💡','ランプ','ranpu','abajur'],['tapete','🟫','カーペット','kāpetto','tapete'],['mochila','🎒','リュック','ryukku','mochila'],['chave','🔑','かぎ','kagi','chave']];
var QCOL=5, QROW=5, QANC={mesa:1,tapete:1};
function qItem(id){ for(var i=0;i<QI.length;i++) if(QI[i][0]===id) return QI[i]; return null; }
function qCru(st,id){ var v=(st.pos||{})[id]; if(!v) return null; var i=v.indexOf(':'), t=v.slice(0,i), r=v.slice(i+1);
  if(t==='c'){ var p=r.split(','); return {t:'c',c:+p[0],r:+p[1]}; } return {t:t,a:r}; }
/* onde o item está de fato: célula do chão, ou "em cima/embaixo" de um móvel que esteja no chão */
function qLugar(st,id){ var l=qCru(st,id); if(!l) return null; if(l.t==='c') return l; var a=qCru(st,l.a); return (a&&a.t==='c')?l:null; }
function qOk(st){
  var cama=qLugar(st,'cama'), mesa=qLugar(st,'mesa'), aba=qLugar(st,'abajur'), tap=qLugar(st,'tapete'), ch=qLugar(st,'chave'), moc=qLugar(st,'mochila');
  var cel=function(l){ return l&&l.t==='c'; };
  return {
    cama: cel(cama)&&cama.r===0,
    mesa: cel(mesa)&&cel(cama)&&mesa.r===cama.r&&mesa.c===cama.c+1,
    abajur: !!(aba&&aba.t==='on'&&aba.a==='mesa'),
    tapete: cel(tap)&&tap.c===2&&tap.r===2,
    chave: !!(ch&&ch.t==='under'&&ch.a==='tapete'),
    mochila: cel(moc)&&cel(cama)&&moc.r===cama.r&&moc.c===cama.c-1
  };
}
CENAS.quartos={
  ic:'🛋️', nome:'O Arquiteto de Quartos', sub:'Lugares · móveis', desc:'A Mudança do Studio',
  novo:function(){ return {tent:0}; },
  render:function(st,c){
    var errs=st.errs||{};
    var bilhete='<div class="cn-bilhete"><b>📝 Bilhete do morador</b><ol>'+[Q.n1,Q.n2,Q.n3,Q.n4,Q.n5].map(function(n){ return '<li>'+T(n,c)+'</li>'; }).join('')+'</ol></div>';
    var cell=function(cc,rr){
      var cont='', tem=null;
      QI.forEach(function(it){ var l=qLugar(st,it[0]); if(l&&l.t==='c'&&l.c===cc&&l.r===rr) tem=it; });
      if(tem){
        cont+='<button type="button" class="cn-mov'+(errs[tem[0]]?' err':'')+(c.sel===tem[0]?' sel':'')+'" data-drag="'+tem[0]+'" data-a="sel" data-item="'+tem[0]+'" title="'+E(tem[4])+'">'+tem[1]+'</button>';
        if(QANC[tem[0]]){
          var sobre=null, sob=null;
          QI.forEach(function(it){ var l=qLugar(st,it[0]); if(l&&l.a===tem[0]){ if(l.t==='on') sobre=it; else sob=it; } });
          cont+='<span class="cn-sub u'+(sobre?' tem':'')+'" data-a="zona" data-zona="on:'+tem[0]+'"><i lang="ja">うえ</i>'+(sobre?'<button type="button" class="cn-mov p'+(errs[sobre[0]]?' err':'')+(c.sel===sobre[0]?' sel':'')+'" data-drag="'+sobre[0]+'" data-a="sel" data-item="'+sobre[0]+'">'+sobre[1]+'</button>':'')+'</span>';
          cont+='<span class="cn-sub d'+(sob?' tem':'')+'" data-a="zona" data-zona="under:'+tem[0]+'"><i lang="ja">した</i>'+(sob?'<button type="button" class="cn-mov p'+(errs[sob[0]]?' err':'')+(c.sel===sob[0]?' sel':'')+'" data-drag="'+sob[0]+'" data-a="sel" data-item="'+sob[0]+'">'+sob[1]+'</button>':'')+'</span>';
        }
      }
      return '<div class="cn-cel'+(rr===0?' fundo':'')+(tem&&tem[0]==='tapete'?' tap':'')+'" data-a="zona" data-zona="c:'+cc+','+rr+'">'+cont+'</div>';
    };
    var grade='';
    for(var r=0;r<QROW;r++) for(var cc=0;cc<QCOL;cc++) grade+=cell(cc,r);
    var planta='<div class="cn-sala"><div class="cn-parede"><span lang="ja">おくの かべ</span> <small>parede do fundo</small></div><div class="cn-planta">'+grade+'</div><div class="cn-porta"><span lang="ja">ひだり</span> ← &nbsp; → <span lang="ja">みぎ</span> <small>(esquerda · direita)</small> &nbsp;·&nbsp; 🚪 <span lang="ja">ドア</span></div></div>';
    var fora=QI.filter(function(it){ return !qLugar(st,it[0]); });
    var barra='<div class="cn-prat cn-barra" data-a="zona" data-zona="barra" role="group" aria-label="Móveis e objetos">'+(fora.length?fora.map(function(it){ return '<button type="button" class="cn-peca'+(c.sel===it[0]?' sel':'')+'" data-drag="'+it[0]+'" data-a="sel" data-item="'+it[0]+'"><span class="cn-em">'+it[1]+'</span><b lang="ja">'+E(it[2])+'</b><span class="wro cn-ro"'+(c.ro?'':' hidden')+'>'+E(it[3])+'</span><small>'+E(it[4])+'</small></button>'; }).join(''):'<span class="sub">Tudo no quarto. Dá para arrastar de novo se quiser mudar algo.</span>')+'</div>';
    if(st.fim) return bilhete+planta+'<div class="cn-res ok"><p>🧑‍🔧 '+T(Q.ok,c)+'</p><p class="sub">O morador levantou o tapete, pegou a chave e acendeu o abajur. '+(num(st.tent)?'Chamadas antes de acertar: '+num(st.tent)+'.':'De primeira!')+'</p></div>';
    var msg='';
    if(st.chk){
      var ch=qLugar(st,'chave');
      if(errs.chave && ch && ch.t==='on') msg='<div class="cn-alerta">🧑‍🔧 '+T(Q.chave,c)+'</div>';
      else{ var primeiro=['cama','mesa','abajur','tapete','chave','mochila'].filter(function(k){ return errs[k]; })[0];
        var map={cama:Q.e_cama,mesa:Q.e_mesa,abajur:Q.e_abajur,tapete:Q.e_tapete,mochila:Q.e_mochila,chave:Q.chave};
        if(primeiro) msg='<div class="cn-alerta">🧑‍🔧 '+T(map[primeiro],c)+'<small>O item que está errado pisca em vermelho.</small></div>'; }
    }
    if(st.aviso) msg+='<p class="cn-alerta">'+E(st.aviso)+'</p>';
    return bilhete+barra+planta+msg+'<div class="row" style="justify-content:center"><button type="button" class="btn pri" data-a="chama" '+(fora.length?'disabled':'')+'>🔔 Pronto! Chamar morador</button></div>';
  },
  acao:function(a,st,c){
    if(st.fim) return null;
    var pos=st.pos||{};
    if(a.t==='poe' && qItem(a.item)){
      var p={aviso:null}, z=a.zona||'';
      if(z==='barra'){ p['pos/'+a.item]=null; p['errs/'+a.item]=null; return p; }
      if(z.indexOf('c:')===0){
        var rc=z.slice(2).split(','); var cc=+rc[0], rr=+rc[1];
        var ocupado=QI.some(function(it){ var l=qLugar(st,it[0]); return it[0]!==a.item&&l&&l.t==='c'&&l.c===cc&&l.r===rr; });
        if(ocupado) return {aviso:'Já tem um móvel nesse lugar. Para pôr algo em cima ou embaixo, use o うえ / した do móvel.'};
        p['pos/'+a.item]='c:'+cc+','+rr; p['errs/'+a.item]=null; return p;
      }
      var m=/^(on|under):(mesa|tapete)$/.exec(z);
      if(m){
        if(QANC[a.item]||a.item==='cama') return {aviso:'Móveis grandes ficam no chão; só objetos pequenos vão em cima ou embaixo.'};
        if(!qLugar(st,m[2])||qLugar(st,m[2]).t!=='c') return {aviso:'Primeiro ponha esse móvel no quarto.'};
        p['pos/'+a.item]=m[1]+':'+m[2]; p['errs/'+a.item]=null; return p;
      }
      return null;
    }
    if(a.t==='chama'){
      var ok=qOk(st), bad=Object.keys(ok).filter(function(k){ return !ok[k]; });
      if(!bad.length) return {fim:true,res:'ok',aviso:null};
      var q={chk:1,tent:num(st.tent)+1,aviso:null}; QI.forEach(function(it){ q['errs/'+it[0]]=bad.indexOf(it[0])>=0?1:null; });
      return q;
    }
    return null;
  }
};

/* ============================================================
   5. PASSAPORTE NA ALFÂNDEGA — "Voo 402 — Chegadas Internacionais"
   datas, duração, profissões e contradições
   (o arquivo de roteiro veio cortado depois do cenário: as 4 chegadas abaixo
    são uma proposta nova, feita a partir do objetivo; é só trocar a lista VIAJANTES)
   ============================================================ */
var VIAJANTES=[
  {nome:'マリア・シルバ',ro:'Maria Shiruba',emoji:'👩‍🏫',
   fala:F('わたしは せんせいです。にほんに いつか います。かんこうです。','Watashi wa sensei desu. Nihon ni itsuka imasu. Kankō desu.','Sou professora. Fico cinco dias no Japão. É turismo.'),
   prof:['せんせい','sensei','professora'],chega:'11がつ 17にち',sai:'11がつ 22にち',dur:['いつか','itsuka','5 dias'],ok:true,
   por:'Tudo bate: professora nos dois lugares e de 17 a 22 de novembro são 5 dias (いつか).'},
  {nome:'ジョン・スミス',ro:'Jon Sumisu',emoji:'🧔',
   fala:F('わたしは かいしゃいんです。にほんに みっか います。','Watashi wa kaishain desu. Nihon ni mikka imasu.','Sou funcionário de empresa. Fico três dias no Japão.'),
   prof:['かいしゃいん','kaishain','funcionário de empresa'],chega:'12がつ 1にち',sai:'12がつ 10にち',dur:['みっか','mikka','3 dias'],ok:false,campo:'datas',
   por:'Contradição: de 1º a 10 de dezembro são 9 dias (ここのか), não 3 (みっか). A duração não bate com as datas.'},
  {nome:'ケン・タナカ',ro:'Ken Tanaka',emoji:'👨‍💼',
   fala:F('わたしは かいしゃいんです。にほんに みっか います。しごとで きました。','Watashi wa kaishain desu. Nihon ni mikka imasu. Shigoto de kimashita.','Sou funcionário de empresa. Fico três dias no Japão. Vim a trabalho.'),
   prof:['かいしゃいん','kaishain','funcionário de empresa'],chega:'3がつ 2にち',sai:'3がつ 5にち',dur:['みっか','mikka','3 dias'],ok:true,
   por:'Tudo bate: funcionário de empresa nos dois lugares e de 2 a 5 de março são 3 dias (みっか).'},
  {nome:'ルーカス・ペレイラ',ro:'Rūkasu Pereira',emoji:'🧑‍🎓',
   fala:F('わたしは がくせいです。にほんに みっか います。','Watashi wa gakusei desu. Nihon ni mikka imasu.','Sou estudante. Fico três dias no Japão.'),
   prof:['いしゃ','isha','médico'],chega:'10がつ 5にち',sai:'10がつ 8にち',dur:['みっか','mikka','3 dias'],ok:false,campo:'prof',
   por:'Contradição: no cartão a profissão é médico (いしゃ), mas ele diz que é estudante (がくせい). As datas estão certas (3 dias).'}
];
CENAS.alfandega={
  ic:'🛂', nome:'Passaporte na Alfândega', sub:'Datas · profissões', desc:'Voo 402 — Chegadas Internacionais',
  novo:function(){ return {r:0,pts:0,ord:embaralha([0,1,2,3],Date.now()).join('')}; },
  render:function(st,c){
    var ord=(st.ord||'0123').split('').map(Number), r=num(st.r), N=ord.length;
    if(st.fim) return '<div class="cn-res '+(num(st.pts)>=3?'ok':'no')+'"><b>'+(num(st.pts)>=3?'🎉':'🌸')+' '+num(st.pts)+' de '+N+' decisões certas</b><p class="sub">Dica: leia as datas e conte os dias, depois compare a profissão do cartão com o que o viajante diz.</p></div>';
    var v=VIAJANTES[ord[r]], car=st.c;
    var campoErr=function(f){ return (car&&!v.ok&&v.campo===f)?' err':''; };
    var cartao='<div class="cn-cartao" data-a="zona" data-zona="cartao"><b>📇 <span lang="ja">にゅうこくカード</span> <small>cartão de imigração</small></b>'+
      '<dl><dt>'+rot('なまえ','namae','nome',c)+'</dt><dd lang="ja">'+E(v.nome)+'</dd>'+
      '<dt>'+rot('しょくぎょう','shokugyō','profissão',c)+'</dt><dd class="'+campoErr('prof').trim()+'" lang="ja">'+E(v.prof[0])+' <small>'+E(v.prof[2])+'</small></dd>'+
      '<dt>'+rot('とうちゃく','tōchaku','chegada',c)+'</dt><dd class="'+campoErr('datas').trim()+'" lang="ja">'+E(v.chega)+'</dd>'+
      '<dt>'+rot('しゅっぱつ','shuppatsu','saída',c)+'</dt><dd class="'+campoErr('datas').trim()+'" lang="ja">'+E(v.sai)+'</dd>'+
      '<dt>'+rot('たいざい','taizai','estadia',c)+'</dt><dd class="'+campoErr('datas').trim()+'" lang="ja">'+E(v.dur[0])+' <small>('+E(v.dur[2])+')</small></dd></dl>'+
      (car?'<div class="cn-sel '+(car==='ok'?'verde':'verm')+'">'+(car==='ok'?'どうぞ':'ストップ')+'</div>':'')+'</div>';
    var cena='<div class="cn-guiche"><div class="cn-viaj"><span class="cn-av">'+v.emoji+'</span><div class="cn-balao"><b lang="ja">'+E(v.nome)+'</b>'+T(v.fala,c)+'</div></div>'+cartao+'</div>';
    var cab='<p class="cn-dica">viajante '+(r+1)+' de '+N+'</p>';
    if(car){
      var acertou=(car==='ok')===v.ok;
      return cab+cena+'<div class="cn-res '+(acertou?'ok':'no')+'"><b>'+(acertou?'✅ Decisão certa':'❌ Não era essa')+'</b><p class="sub">'+E(v.por)+'</p></div><div class="row" style="justify-content:center"><button type="button" class="btn pri" data-a="prox">'+(r+1>=N?'Ver resultado':'Próximo viajante →')+'</button></div>';
    }
    var carimbos='<div class="cn-carimbos"><button type="button" class="cn-carimbo-b verde" data-drag="ok" data-a="carimba" data-v="ok"><span lang="ja">どうぞ</span><small>VERDE · Aprovado</small></button><button type="button" class="cn-carimbo-b verm" data-drag="no" data-a="carimba" data-v="no"><span lang="ja">ストップ</span><small>VERMELHO · Recusado</small></button></div>';
    return cab+cena+'<p class="cn-dica">Compare o que ele <b>diz</b> com o que está no cartão: datas, dias de estadia e profissão. Carimbe (toque ou arraste o carimbo até o cartão).</p>'+carimbos;
  },
  acao:function(a,st,c){
    if(st.fim) return null;
    var ord=(st.ord||'0123').split('').map(Number), r=num(st.r), v=VIAJANTES[ord[r]];
    if(!st.c && (a.t==='carimba' || (a.t==='poe' && a.zona==='cartao'))){
      var voto=a.t==='carimba'?a.v:a.item; if(voto!=='ok'&&voto!=='no') return null;
      return {c:voto,pts:num(st.pts)+(((voto==='ok')===v.ok)?1:0)};
    }
    if(st.c && a.t==='prox'){
      if(r+1>=ord.length) return {fim:true,res:'fim'};
      return {r:r+1,c:null};
    }
    return null;
  }
};

window.CENAS=CENAS;
window.CENAS_ORDEM=['konbini','detetive','izakaya','quartos','alfandega'];
window.CENAS_FALAS=FALAS;
})();
