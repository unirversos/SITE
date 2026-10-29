/* Ilustrações dos jogos do Salão: pictogramas em SVG, pastel chapado, desenhados para o Unirversos. */
(function(){
const K='#3a2b38',PK='#f8dde1',RD='#c23f5e',SG='#cfe2d1',GD='#fbe9b0',YL='#ffd96b',LV='#e4dcf5',SK='#f6d3b3',WH='#fff',BL='#d6e8f7',BR='#d9b48a',OR='#f4a98a',DG='#5f8a68';
const st=`stroke="${K}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
const R=(x,y,w,h,f,r=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${st}/>`;
const C=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${st}/>`;
const P=(d,f='none')=>`<path d="${d}" fill="${f}" ${st}/>`;
const L=(d,c=K,w=2)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const T=(x,y,t,sz=14,f=K)=>`<text x="${x}" y="${y}" font-size="${sz}" text-anchor="middle" font-family="Baloo 2,Zen Maru Gothic,sans-serif" font-weight="800" fill="${f}">${t}</text>`;
const face=(x,y,r=8)=>C(x,y,r,SK)+`<circle cx="${x-r/3}" cy="${y-1}" r="1.2" fill="${K}"/><circle cx="${x+r/3}" cy="${y-1}" r="1.2" fill="${K}"/>`+L(`M${x-r/3} ${y+r/2.5}q${r/3} ${r/3} ${2*r/3} 0`);
const W=(bg,inner)=>`<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="30" fill="${bg}"/>${inner}</svg>`;
const V='#e8efe8',Y='#fbf1d9',B='#fdecee',P2='#efeaf8',BB='#e6f1fa';
const I={
/* elementos dos dias */
sun:W(Y,[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return L(`M${32+15*Math.cos(a)} ${32+15*Math.sin(a)}L${32+21*Math.cos(a)} ${32+21*Math.sin(a)}`,'#e0a82e',3)}).join('')+C(32,32,10,YL)),
moon:W(P2,P('M40 13a19 19 0 1 0 10 27a15 15 0 0 1-10-27z','#ffe9a8')+T(47,19,'✦',11,'#e0a82e')+T(13,40,'✦',8,'#e0a82e')),
fire:W(B,P('M32 10c3 9 13 13 13 26a13 13 0 0 1-26 0c0-7 4-9 5-16 3 3 5 5 8-10z',OR)+P('M32 30c2 5 6 7 6 13a6 6 0 0 1-12 0c0-4 3-5 3-9z',YL)),
drop:W(BB,P('M32 11c8 12 15 18 15 27a15 15 0 0 1-30 0c0-9 7-15 15-27z',BL)+L('M24 40a8 8 0 0 0 6 7','#7fb0dc',3)),
wood:W(V,R(29,38,6,15,BR,1)+C(32,27,14,SG)+C(23,35,8,SG)+C(41,35,8,SG)),
gold:W(Y,C(32,32,18,YL)+C(32,32,12,'#fbe79a')+T(32,38,'¥',16)),
earth:W(V,L('M12 52h40')+L('M32 52V36')+P('M32 40c-11 0-13-11-13-14 11 0 13 7 13 14z',SG)+P('M32 36c9 0 13-8 13-11-10 0-13 6-13 11z',SG)),
/* verbos */
wake:W(Y,R(8,40,48,10,PK,3)+C(19,38,6,WH)+face(19,36,5.5)+R(26,34,28,10,LV,3)+C(50,16,6,YL)+[0,1,2,3,4].map(i=>L(`M${50+9*Math.cos(i*1.2+3)} ${16+9*Math.sin(i*1.2+3)}l${3*Math.cos(i*1.2+3)} ${3*Math.sin(i*1.2+3)}`,'#e0a82e',2)).join('')),
eat:W(B,P('M10 30h44a22 19 0 0 1-44 0z',PK)+L('M22 23q-3-4 0-8M32 23q-3-4 0-8M42 23q-3-4 0-8','#b8a3ad',2.5)+L('M36 12l14 16M41 10l14 16',BR,3)),
drink:W(BB,P('M19 16h26l-3 31a5 5 0 0 1-5 5H27a5 5 0 0 1-5-5z',WH)+P('M21 30h22l-1.5 17a5 5 0 0 1-5 5H27.5a5 5 0 0 1-5-5z',BL)+L('M45 22h3a5.5 6 0 0 1 0 12h-4')+L('M40 8l-6 12',RD,3)),
go:W(V,C(30,15,6,SK)+L('M30 21v15M30 26l-9 7M30 26l9 5M30 36l-9 14M30 36l10 12')+L('M44 54h12m-4-4l4 4-4 4',RD,3)),
see:W(P2,P('M7 32q25-26 50 0q-25 26-50 0z',WH)+C(32,32,10,'#b9a8e0')+C(32,32,5,K)+C(35,29,1.8,WH)),
listen:W(B,L('M14 38v-6a18 18 0 0 1 36 0v6','#3a2b38',3)+R(9,36,10,17,PK,4)+R(45,36,10,17,PK,4)+T(32,34,'♪',16,RD)),
read:W(Y,P('M32 20q-11-6-23-3v32q12-3 23 3z',WH)+P('M32 20q11-6 23-3v32q-12-3-23 3z',GD)+L('M14 26q8-2 14 1M14 33q8-2 14 1M36 27q6-3 14-1M36 34q6-3 14-1')),
write:W(V,R(10,12,34,42,WH,3)+L('M16 24h22M16 32h22M16 40h14')+P('M30 52l2-9 20-20 7 7-20 20z',YL)+P('M30 52l2-9 7 7z',SK)),
sleep:W(P2,P('M26 12a15 15 0 1 0 9 24a12 12 0 0 1-9-24z','#ffe9a8')+T(44,30,'Z',17,'#8a7bc0')+T(52,19,'z',11,'#8a7bc0')+R(8,42,48,10,LV,3)+R(8,38,14,6,WH,3)),
talk:W(B,P('M8 12h28a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H21l-8 7v-7H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z',PK)+P('M28 30h26a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-3v6l-8-6H28a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4z',SG)+C(14,22,1.6,K)+C(22,22,1.6,K)+C(30,22,1.6,K)),
buy:W(Y,P('M14 24h36l3 29H11z',PK)+L('M24 24v-3a8 8 0 0 1 16 0v3')+C(32,40,8,YL)+T(32,45,'¥',11)),
work:W(BB,R(8,24,48,28,BR,5)+L('M23 24v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5')+L('M8 37h48')+R(28,33,8,8,YL,1)),
wait:W(Y,C(32,32,21,WH)+L('M32 32V19M32 32l9 5')+[0,1,2,3].map(i=>L(`M${32+17*Math.cos(i*Math.PI/2)} ${32+17*Math.sin(i*Math.PI/2)}l${2*Math.cos(i*Math.PI/2)} ${2*Math.sin(i*Math.PI/2)}`)).join('')),
return:W(V,P('M8 31l24-19 24 19z',PK)+R(14,31,36,22,GD,1)+R(28,40,9,13,BR,1)+L('M50 20q6 8-2 16m0-5l-1 6 6-1',RD,2.5)),
doit:W(P2,P('M32 8l6 16 17 1-13 11 5 17-15-10-15 10 5-17L9 25l17-1z',YL)),
come:W(B,R(30,10,24,44,BR,2)+C(36,34,1.6,K)+L('M6 32h22m-8-8l8 8-8 8',RD,3)),
enter:W(B,R(34,10,20,44,BR,2)+C(48,34,1.6,K)+L('M6 32h24m-8-8l8 8-8 8',RD,3)),
teach:W(V,R(8,10,48,32,DG,3)+T(32,34,'あ',22,WH)+L('M16 42l-4 12M48 42l4 12')+L('M44 50l12-10',BR,3)),
photo:W(P2,R(8,22,48,30,LV,6)+R(23,15,18,9,LV,3)+C(32,37,10,WH)+C(32,37,5.5,BL)+C(49,29,2,RD)),
sit:W(Y,R(20,10,7,26,BR,2)+R(18,34,32,7,BR,2)+L('M21 41v13M47 41v13')),
wear:W(B,P('M22 11l-14 8 6 11 7-3v26h26V27l7 3 6-11-14-8q-4 6-10 6t-10-6z',PK)+L('M26 11q6 6 12 0')),
touch:W(Y,P('M22 54V31a4 4 0 0 1 8 0V19a4 4 0 0 1 8 0v13a4 4 0 0 1 8 0v7a4 4 0 0 1 4 0v8c0 9-6 15-14 15z',SK)+L('M34 28v6M42 34v5','#c9a488',2)),
put:W(Y,R(10,40,44,14,BR,2)+R(24,22,16,14,PK,2)+L('M32 6v12m-6-5l6 6 6-6',RD,3)),
menu:W(B,R(14,8,36,48,WH,3)+R(14,8,36,10,PK,3)+L('M21 26h22M21 33h22M21 40h14')+T(32,16,'MENU',7)),
water:W(BB,P('M19 12h26l-3 38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z',WH)+P('M21.4 28h21.2l-1.6 22a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z',BL)+L('M27 34h8','#fff',2.5)),
smoke:W(B,R(8,34,34,8,WH,2)+R(42,34,12,8,OR,2)+L('M26 26q-5-6 0-12M36 26q-5-6 0-12','#b8a3ad',2.5)+`<circle cx="32" cy="32" r="25" fill="none" stroke="${RD}" stroke-width="4"/>`+L('M14 14l36 36',RD,4)),
noentry:W(B,C(32,32,22,RD)+R(15,27,34,10,WH,2)),
trash:W(V,R(12,13,40,7,SG,2)+L('M26 13v-4h12v4')+P('M16 20h32l-3 32a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z',SG)+L('M26 28v18M32 28v18M38 28v18')),
shoes:W(P2,P('M8 42q14 0 18-12l6 6q10 3 24 3v9H8z',PK)+L('M8 48h48')+L('M24 34l4-4M30 38l4-4')),
run:W(Y,C(37,14,6,SK)+L('M35 20l-7 16M32 25l-11 4M32 25l12-7M28 36l-11 10M28 36l12 6-3 12')+L('M10 24h8M6 32h8M12 40h6',RD,2.5)),
movie:W(P2,R(8,27,48,26,GD,3)+R(8,16,48,11,K,3)+L('M18 16l-5 11M29 16l-5 11M40 16l-5 11M51 16l-5 11',WH,3)+P('M28 34v12l11-6z',RD)),
restaurant:W(B,R(10,28,44,26,WH,2)+P('M8 16h48v12H8z',RD)+L('M20 16v12M32 16v12M44 16v12',WH,3)+R(26,36,12,18,BR,1)+R(14,34,9,8,BL,1)+R(42,34,9,8,BL,1)),
torii:W(B,P('M6 14q26 9 52 0l-2 7q-24 7-48 0z',RD)+R(13,26,38,5,RD,1)+R(17,24,6,30,RD,1)+R(41,24,6,30,RD,1)),
clock7:W(Y,C(32,32,22,WH)+L('M32 32V16M32 32l-7 12')+[0,1,2,3].map(i=>L(`M${32+18*Math.cos(i*Math.PI/2)} ${32+18*Math.sin(i*Math.PI/2)}l${2*Math.cos(i*Math.PI/2)} ${2*Math.sin(i*Math.PI/2)}`)).join('')),
friends:W(V,face(21,26,10)+face(43,26,10)+P('M7 56a14 14 0 0 1 28 0z',PK)+P('M29 56a14 14 0 0 1 28 0z',BL)),
price:W(Y,P('M10 32l20-20h24v24L34 56z',GD)+C(46,20,3.2,WH)+T(34,40,'¥',16)),
hotel:W(P2,R(14,10,36,44,LV,2)+[0,1,2].map(r=>[0,1].map(c=>R(20+c*14,16+r*9,8,6,WH,1)).join('')).join('')+R(27,42,10,12,BR,1)+T(32,38,'H',7)),
/* adjetivos */
big:W(V,C(32,32,23,SG)+L('M16 32h32m-6-6l6 6-6 6m-20-12l-6 6 6 6','#5f8a68',3)),
small:W(V,C(32,32,9,SG)+L('M8 32h12m-5-5l5 5-5 5M56 32H44m5-5l-5 5 5 5','#5f8a68',3)),
new:W(Y,R(14,30,36,24,PK,2)+R(11,23,42,8,RD,2)+L('M32 23v31')+P('M32 23q-10-12-14-4 0 5 14 4zM32 23q10-12 14-4 0 5-14 4z',RD)+T(54,14,'✦',12,'#e0a82e')+T(10,18,'✦',9,'#e0a82e')),
old:W(Y,P('M25 12h14l-2 9q12 6 9 21-3 12-14 12T16 42q-3-15 9-21z',BR)+L('M30 22l4 8-4 7','#fff',2.5)+L('M20 52h24')),
hot:W(B,R(27,8,10,34,WH,5)+C(32,47,9,RD)+L('M32 14v32',RD,4)+L('M46 14q4 5 0 10M52 12q4 7 0 14','#e0793a',2.5)),
cold:W(BB,L('M32 8v48M10 20l44 24M10 44l44-24','#7fb0dc',3.5)+L('M26 12l6 5 6-5M26 52l6-5 6 5','#7fb0dc',3)+C(32,32,3,WH)),
busy:W(B,R(9,12,46,42,WH,4)+R(9,12,46,10,RD,4)+[0,1,2,3].map(r=>[0,1,2,3].map(c=>`<rect x="${14+c*10}" y="${27+r*7}" width="7" height="4.5" rx="1" fill="${(r+c)%3?LV:PK}"/>`).join('')).join('')+L('M50 10q4-4 4 1','#7fb0dc',2.5)),
free:W(V,P('M16 26h28v11a14 14 0 0 1-28 0z',SG)+L('M44 29h3a5.5 5.5 0 0 1 0 11h-4')+L('M24 20q-3-5 0-9M32 20q-3-5 0-9M40 20q-3-5 0-9','#b8a3ad',2.5)+L('M12 54h40')),
expensive:W(Y,[0,1,2].map(i=>`<ellipse cx="30" cy="${48-i*9}" rx="16" ry="5.5" fill="${YL}" ${st}/>`).join('')+T(30,22,'¥',13)+L('M52 38V14m-6 6l6-6 6 6',RD,3)),
cheap:W(V,`<ellipse cx="30" cy="46" rx="14" ry="5" fill="${YL}" ${st}/>`+T(30,40,'¥',13)+L('M52 16v24m-6-6l6 6 6-6','#5f8a68',3)),
quiet:W(P2,face(32,32,17)+R(30,36,5,18,SK,2)+L('M26 41h12','#c23f5e',2.5)+T(52,18,'…',16,'#8a7bc0')),
lively:W(B,P('M10 54l11-28 17 17z',YL)+L('M26 28l-4 10m8-6l-4 9m8-5l-4 8')+'<g>'+[['#c23f5e',40,16],['#4f7a58',50,26],['#e0a82e',34,10],['#7fb0dc',52,12],['#b9a8e0',46,36]].map(c=>`<circle cx="${c[1]}" cy="${c[2]}" r="2.6" fill="${c[0]}"/>`).join('')+'</g>')
};
window.ILU=I;
})();
