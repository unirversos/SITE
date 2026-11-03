/* Leitor de reservas (hotel, ingresso, PDF, .ics): tudo lido no navegador, nada é enviado.
   Mesma lógica do importador de 'Minha viagem', reunida aqui para o calendário. */
(function(){
'use strict';
const D=s=>new Date(s+'T12:00:00');
const MESES={jan:1,janeiro:1,january:1,fev:2,fevereiro:2,feb:2,february:2,mar:3,'março':3,marco:3,march:3,abr:4,abril:4,apr:4,april:4,mai:5,maio:5,may:5,jun:6,junho:6,june:6,jul:7,julho:7,july:7,ago:8,agosto:8,aug:8,august:8,set:9,setembro:9,sep:9,sept:9,september:9,out:10,outubro:10,oct:10,october:10,nov:11,novembro:11,november:11,dez:12,dezembro:12,dec:12,december:12};
const p2=n=>String(n).padStart(2,'0');
function okData(y,m,d){ y=+y;m=+m;d=+d; if(!(y>2000&&y<2100&&m>=1&&m<=12&&d>=1&&d<=31)) return ''; return y+'-'+p2(m)+'-'+p2(d); }
function acharDatas(t){
  const out=[], add=(i,v)=>{ if(v&&!out.some(o=>Math.abs(o.i-i)<3)) out.push({i,v}); }; let m;
  const R1=/(\d{4})[-\/.年](\d{1,2})[-\/.月](\d{1,2})/g; while((m=R1.exec(t))) add(m.index,okData(m[1],m[2],m[3]));
  const R2=/\b(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})\b/g; while((m=R2.exec(t))){ let d=+m[1],mo=+m[2]; if(mo>12&&d<=12){const x=d;d=mo;mo=x;} add(m.index,okData(m[3],mo,d)); }
  const R3=/\b(\d{1,2})(?:º|°)?\s*(?:de\s+)?([a-zA-Zçã]{3,9})\.?,?\s*(?:de\s+)?(\d{4})\b/g; while((m=R3.exec(t))){ const mo=MESES[m[2].toLowerCase()]; if(mo) add(m.index,okData(m[3],mo,m[1])); }
  const R4=/\b([a-zA-Zçã]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/g; while((m=R4.exec(t))){ const mo=MESES[m[1].toLowerCase()]; if(mo) add(m.index,okData(m[3],mo,m[2])); }
  // sem ano, como no Booking: "15 DEZEMBRO / Terça-feira". O dia da semana (ou a próxima ocorrência) define o ano.
  const R5=/(?<![\d\/.-])(\d{1,2})(?:º|°)?\s+(?:de\s+)?([a-zA-Zçã]{3,9})\b(?!\.?,?\s*(?:de\s+)?\d{4})/g; while((m=R5.exec(t))){ const mo=MESES[m[2].toLowerCase()]; if(mo) add(m.index,okData(anoSem(+m[1],mo,t.slice(m.index+m[0].length,m.index+m[0].length+40)),mo,m[1])); }
  const R6=/\b([a-zA-Zçã]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?!,?\s*\d{4})(?![:\d])/g; while((m=R6.exec(t))){ const mo=MESES[m[1].toLowerCase()]; if(mo) add(m.index,okData(anoSem(+m[2],mo,t.slice(m.index+m[0].length,m.index+m[0].length+40)),mo,m[2])); }
  return out.sort((a,b)=>a.i-b.i);
}
const SEM_ID={domingo:0,sunday:0,segunda:1,monday:1,terca:2,tuesday:2,quarta:3,wednesday:3,quinta:4,thursday:4,sexta:5,friday:5,sabado:6,saturday:6};
function anoSem(d,mo,depois){
  const hoje=new Date(), y0=hoje.getFullYear();
  const w=depois.match(/^[\s,.\-–]*(domingo|segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
  if(w){ const alvo=SEM_ID[w[1].toLowerCase().replace('ç','c').replace('á','a')];
    for(const y of [y0,y0+1,y0-1,y0+2]) if(new Date(Date.UTC(y,mo-1,d)).getUTCDay()===alvo) return y; }
  const lim=new Date(Date.UTC(y0,hoje.getMonth(),hoje.getDate()-7));
  return new Date(Date.UTC(y0,mo-1,d))>=lim?y0:y0+1;
}
function acharHora(t){
  let m=t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/i);
  const m2=t.match(/\b([01]?\d|2[0-3])(?::([0-5]\d)|h([0-5]\d)?)(?!\d)/i);
  if(m&&(!m2||m.index<=m2.index)){ let h=+m[1]%12; if(/p/i.test(m[3])) h+=12; return p2(h)+':'+(m[2]||'00'); }
  if(m2) return p2(+m2[1])+':'+(m2[2]||m2[3]||'00');
  return '';
}
function aposRotulo(t,rot,n,ultima){ // primeira data/hora logo depois de um rótulo como "check-in"
  const re=new RegExp(rot.source,'gi'); let m;
  while((m=re.exec(t))){ const ini=m.index+m[0].length; let jan=t.slice(ini,ini+(n||140));
    const prox=jan.search(/check-?in|check-?out|sa[ií]da|entrada|chegada|departure|arrival|チェック/i); if(prox>=0) jan=jan.slice(0,prox);
    const ds=acharDatas(jan);
    if(ds.length){ const depois=jan.slice(ds[0].i+4); let hora=acharHora(depois);
      if(ultima){ const fx=depois.match(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/); if(fx) hora=p2(+fx[2].split(':')[0])+':'+fx[2].split(':')[1]; }
      return {data:ds[0].v,hora}; } }
  return null;
}
const CID_ALIAS=[['Tóquio',/t[oó]qui?o|tokyo|東京/i],['Kyoto',/kyoto|quioto|京都/i],['Osaka',/[oō]saka|大阪/i],['Nara',/\bnara\b|奈良/i],['Kobe',/k[oō]be|神戸/i],['Yokohama',/yokohama|横浜/i],['Kamakura',/kamakura|鎌倉/i],['Hakone',/hakone|箱根/i],['Nikko',/nikk[oō]|日光/i],['Chiba',/chiba|urayasu|maihama|千葉|浦安/i],['Nagoya',/nagoya|名古屋/i],['Takayama',/takayama|高山/i],['Kanazawa',/kanazawa|金沢/i],['Hiroshima',/hiroshima|広島/i],['Fukuoka',/fukuoka|hakata|福岡|博多/i],['Sapporo',/sapporo|札幌/i],['Okinawa',/okinawa|naha|沖縄|那覇/i],['Himeji',/himeji|姫路/i]];
function acharCidade(...txts){ for(const t of txts){ if(!t) continue; let best=null; for(const [c,re] of CID_ALIAS){ const m=t.match(re); if(m&&(!best||m.index<best.i)) best={c,i:m.index}; } if(best) return best.c; } return ''; }
const ATR=[['pokepark',/pok[eé]park/i],['ghibli-park',/ghibli\s*park|ジブリパーク/i],['ghibli-mitaka',/ghibli|ジブリ美術館/i],['pokemon-cafe',/pok[eé]mon\s*caf[eé]|ポケモンカフェ/i],['kirby',/kirby|カービィ/i],['disney',/disney(land|sea)?|ディズニー/i],['doraemon',/fujiko|doraemon|藤子/i],['usj',/universal\s*studios|\busj\b|super\s*nintendo\s*world|ユニバーサル/i],['harrypotter',/warner\s*bros|harry\s*potter|ハリー/i],['biovortex',/biovortex/i],['teamlab-tokyo',/team\s*lab/i],['nintendo-museum',/nintendo\s*museum|museu\s*da\s*nintendo|ニンテンドーミュージアム/i],['toyosu',/toyosu|豊洲/i],['shibuya-sky',/shibuya\s*sky/i],['saihoji',/saih[oō]-?ji|koke-?dera|西芳寺|苔寺/i],['katsura',/katsura|sh[uū]gakuin|桂離宮|修学院/i],['comiket',/comiket|comic\s*market|コミケ/i],['jumpfesta',/jump\s*festa|ジャンプフェスタ/i],['sumo',/\bsum[oô]\b|相撲/i]];
const acharAtracao=t=>{ for(const [id,re] of ATR) if(re.test(t)) return id; return ''; };
const PLATS=[['Booking',/booking\.com/i],['Agoda',/agoda/i],['Airbnb',/airbnb/i],['Expedia',/expedia/i],['Hotels.com',/hotels\.com/i],['Rakuten Travel',/rakuten/i],['Jalan',/jalan/i],['Trip.com',/trip\.com/i],['Klook',/klook/i],['KKday',/kkday/i],['Lawson Ticket',/lawson|l-tike/i],['Ticket Pia',/ticket\s*pia|チケットぴあ/i]];
function linhaApos(t,re){ const m=t.match(re); if(!m) return ''; let v=(m[1]||'').trim(); if(!v){ const resto=t.slice(m.index+m[0].length).split(/\n/).map(s=>s.trim()).filter(Boolean); v=resto[0]||''; } return v.slice(0,160); }
function lerTexto(t){
  t=t.replace(/\r/g,''); const r={}, achou=[], low=t.toLowerCase();
  r.plataforma=(PLATS.find(p=>p[1].test(t))||[''])[0];
  const cod=t.match(/(?:confirma[cç][aã]o\s+(?:de|da)\s+reserva|n[uú]mero\s+de\s+confirma[cç][aã]o|c[oó]digo\s+de\s+confirma[cç][aã]o|confirmation\s+(?:number|no\.?|code)|booking\s+(?:number|id|no\.?|reference)|n[uú]mero\s+da\s+reserva|c[oó]digo\s+(?:da|de)\s+reserva|id\s+da\s+reserva|reservation\s+(?:number|code|no\.?|id)|予約番号)[ \t]*[:：#nº°.]*[ \t]*([A-Z0-9\-.]*\d[A-Z0-9\-.]*[A-Z0-9])/i);
  r.reserva=cod?cod[1].replace(/\.$/,''):'';
  const vou=t.match(/(?:c[oó]digo\s+do\s+voucher|voucher\s*(?:no\.?|number|code|n[uú]mero)?|ticket\s*(?:no\.?|number|code)|n[uú]mero\s+do\s+ingresso|order\s*(?:no\.?|number|id)|n[uú]mero\s+do\s+pedido|booking\s+code|チケット番号|受付番号)[ \t]*[:：#nº°]*[ \t]*([A-Z0-9\-]*\d[A-Z0-9\-]*)/i);
  r.voucher=vou?vou[1]:'';
  const pin=t.match(/c[oó]digo\s+pin\s*[:：]?\s*(\d{3,8})|\bpin\s*(?:code)?\s*[:：]\s*(\d{3,8})/i); r.pin=pin?(pin[1]||pin[2]):'';
  const tel=t.match(/(?:telefone|phone|tel\.?|電話)\s*[:：]?\s*(\+?\d[\d\s\-().]{7,}\d)/i); r.telefone=tel?tel[1].trim():'';
  let end=linhaApos(t,/(?:endere[cç]o|address|localiza[cç][aã]o|location|住所)\s*[:：]?[ \t]*([^\n]*)/i);
  if(!end){ const l=t.split('\n').map(s=>s.trim()).find(s=>/\d+-\d+(-\d+)?\b.*(-ku|-shi|-cho|chome|tokyo|kyoto|osaka)|[都道府]\S*[区市町村]/i.test(s)); end=l||''; }
  if(/[぀-ヿ一-鿿]/.test(end)) r.endereco=end; else r.enderecoLat=end;
  r.cidade=acharCidade(end,t);
  r.atr=acharAtracao(t);
  const ent=aposRotulo(t,/check-?in|entrada|chegada|arrival|チェックイン/), sai=aposRotulo(t,/check-?out|sa[ií]da|departure|チェックアウト/,140,true);
  const vis=aposRotulo(t,/data\s+da\s+visita|date\s+of\s+(?:visit|use)|visit\s+date|data\s+de\s+uso|data\s+do\s+evento|event\s+date|利用日|来場日|入場日/);
  const todas=acharDatas(t);
  // tipo
  let sh=0, si=0;
  if(sai) sh+=2; if(ent) sh+=1; if(/\b(hotel|hostel|ryokan|inn|resort|guest\s*house|apartment|lodge|capsule|minshuku)\b|noites?|nights?|泊/i.test(t)) sh+=1; if(['Booking','Agoda','Airbnb','Expedia','Hotels.com','Rakuten Travel','Jalan'].includes(r.plataforma)) sh+=1;
  if(r.atr) si+=2; if(vis) si+=2; if(/voucher|ingresso|e-?ticket|ticket|admission|qr\s*code|チケット|入場/i.test(t)) si+=1; if(['Klook','KKday','Lawson Ticket','Ticket Pia'].includes(r.plataforma)) si+=1;
  r.tipo=si>sh?'ingresso':'hotel';
  // datas
  r.entrada=ent?ent.data:(todas[0]?todas[0].v:''); r.checkin=ent?ent.hora:'';
  r.saida=sai?sai.data:(todas.find(d=>d.v>r.entrada)||{}).v||''; r.checkout=sai?sai.hora:'';
  if(r.entrada&&!(r.saida>r.entrada)){ // rótulos juntos ("ENTRADA SAÍDA") e valores depois: usa a ordem das datas e as frases de horário
    const ds=[...new Set(todas.map(d=>d.v))]; if(ds.length>=2){ r.entrada=ds[0]; r.saida=ds.find(v=>v>r.entrada)||''; }
    const hh=x=>{ const m=x&&x.match(/(\d{1,2})[:h](\d{2})/); return m?p2(+m[1])+':'+m[2]:''; };
    const hi=t.match(/(?:a\s+partir\s+d[ao]s?|from|after|desde)\s*(?:as\s*)?(\d{1,2}[:h]\d{2})/i), ho=t.match(/(?:at[eé]\s+(?:as\s*)?|until|before|antes\s+d[ao]s?)\s*(\d{1,2}[:h]\d{2})/i);
    if(hi) r.checkin=hh(hi[1]); if(ho) r.checkout=hh(ho[1]);
  }
  const v1=vis||ent; r.data=v1?v1.data:(todas[0]?todas[0].v:''); r.hora=v1?v1.hora:acharHora(t);
  // nome do hotel
  let nome=linhaApos(t,/(?:nome\s+do\s+hotel|hotel\s+name|propriedade|property|acomoda[cç][aã]o|accommodation|hospedagem|宿泊施設)\s*[:：][ \t]*([^\n]*)/i);
  if(!nome){ for(const l of t.split('\n')){ for(const seg of l.split(/\.\s+|\s+[|•·—–-]\s+|\s{2,}/)){ const s=seg.trim(); if(s.length>3&&s.length<70&&/\b(hotel|hostel|ryokan|inn|resort|guest\s*house|lodge|capsule|minshuku)\b|ホテル|旅館/i.test(s)&&!/check|confirma|reserva|booking\.com|agoda|obrigad|thank|dear|prezad/i.test(s)){ nome=s; break; } } if(nome) break; } }
  if(!nome) nome=linhaApos(t,/(?:atividade|activity|produto|product|evento|event|bilhete|ticket\s+name)[ \t]*[:：][ \t]*([^\n]*)/i);
  r.nome=nome.replace(/[.,;]+$/,'');
  r.pagarLocal=/pagar\s+(?:no|na)\s+(?:local|hotel|propriedade|acomoda)|pay\s+at\s+(?:the\s+)?(?:property|hotel)|payment\s+at\s+(?:the\s+)?(?:property|hotel)|pagamento\s+(?:no|na)\s+(?:hotel|propriedade|acomoda|check-?in)|pay\s+(?:during|upon|on)\s+(?:your\s+)?(?:stay|arrival)|pay\s+(?:at|upon)\s+check-?in|paga(?:r|mento)\s+(?:ao|no)\s+chegar/i.test(t);
  r.comprado=!!r.voucher||/pagamento\s+confirmado|payment\s+(?:completed|confirmed|received)|compra\s+confirmada|order\s+confirmed|confirmado\s+e\s+emitido|emitido|issued|purchase\s+(?:complete|confirmed)|thank\s+you\s+for\s+your\s+(?:purchase|order)|購入完了/i.test(t);
  return r;
}
/* .ics */
function lerICS(txt){
  txt=txt.replace(/\r?\n[ \t]/g,''); const evs=[]; const re=/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g; let m;
  const un=v=>v.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
  while((m=re.exec(txt))){ const b=m[1];
    const prop=n=>{ const x=b.match(new RegExp('^'+n+'((?:;[^:\\n]*)?):(.*)$','mi')); return x?{p:x[1]||'',v:un(x[2].trim())}:null; };
    const dt=x=>{ if(!x) return null; const d=x.v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(?:\d{2})?)?(Z)?/); if(!d) return null;
      if(d[4]&&d[6]){ const u=new Date(Date.UTC(+d[1],+d[2]-1,+d[3],+d[4],+d[5])+9*3600e3); return {data:u.toISOString().slice(0,10),hora:u.toISOString().slice(11,16),dia:false}; }
      return {data:d[1]+'-'+d[2]+'-'+d[3],hora:d[4]?d[4]+':'+d[5]:'',dia:!d[4]}; };
    const sum=prop('SUMMARY'), loc=prop('LOCATION'), desc=prop('DESCRIPTION'), ini=dt(prop('DTSTART')), fim=dt(prop('DTEND'));
    evs.push({titulo:sum?sum.v:'(sem título)',local:loc?loc.v:'',desc:desc?desc.v:'',ini,fim}); }
  return evs;
}
function icsParaDados(e){
  const r=lerTexto([e.titulo,e.desc,e.local?'Endereço: '+e.local:''].join('\n'));
  if(e.local){ if(/[぀-ヿ一-鿿]/.test(e.local)){ r.endereco=e.local; r.enderecoLat=''; } else { r.enderecoLat=e.local; r.endereco=''; } r.cidade=acharCidade(e.local,e.titulo,e.desc)||r.cidade; }
  const noites=e.ini&&e.fim?noites_(e.ini.data,e.fim.data):0;
  if(noites>=1&&!r.atr) r.tipo='hotel';
  if(e.ini){ r.entrada=e.ini.data; r.checkin=e.ini.hora||r.checkin; r.data=e.ini.data; r.hora=e.ini.hora||r.hora; }
  if(e.fim&&noites>=1){ r.saida=e.fim.data; r.checkout=e.fim.hora||r.checkout; }
  if(!r.nome) r.nome=e.titulo;
  return r;
}
const noites_=(a,b)=>Math.round((D(b)-D(a))/864e5);
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let pdfjsPronto=null;
function carregarPDFjs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(!pdfjsPronto) pdfjsPronto=new Promise((ok,erro)=>{ const sc=document.createElement('script'); sc.src=PDFJS+'pdf.min.js';
    sc.onload=()=>{ try{ pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'; ok(pdfjsLib); }catch(e){ erro(e); } };
    sc.onerror=()=>{ pdfjsPronto=null; erro(new Error('rede')); }; document.head.appendChild(sc); });
  return pdfjsPronto;
}
async function textoDoPDF(f){ // lido aqui no navegador; o arquivo não é enviado
  const lib=await carregarPDFjs(); const pdf=await lib.getDocument({data:await f.arrayBuffer()}).promise; let txt='';
  for(let i=1;i<=pdf.numPages;i++){ const pg=await pdf.getPage(i), c=await pg.getTextContent(); let y=null;
    for(const it of c.items){ const yy=it.transform?it.transform[5]:null; if(y!==null&&yy!==null&&Math.abs(yy-y)>2) txt+='\n'; else if(txt&&!/\s$/.test(txt)) txt+=' ';
      txt+=it.str; if(it.hasEOL) txt+='\n'; if(yy!==null) y=yy; }
    txt+='\n'; }
  return txt.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
}
window.LeitorReserva={lerTexto:lerTexto,lerICS:lerICS,icsParaDados:icsParaDados,textoDoPDF:textoDoPDF};
})();
