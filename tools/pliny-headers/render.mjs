// Original code-native art for the shared five-style draw. No third-party artwork or fonts.
// Each project wrapper supplies its key and the draw position. Dimensions are shared for comparison.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/pliny-headers/projects.json'), 'utf8'));
export const STYLES = [
  { id: 'idle-10', slug: '01-off-air', name: 'Off-air test card', note: 'Calibration geometry, signal bars and an idle station ident, interpreted for this project.' },
  { id: 'asia-03', slug: '02-telnet-board', name: 'Taiwanese BBS board', note: 'Inverse-video terminal headers, project-specific records and illustrative push comments.' },
  { id: 'demo-01', slug: '03-demo-titles', name: 'PC demo opening titles', note: 'Plain VGA pixel lettering, procedural scenery and a slowly changing title sequence.' },
  { id: 'ansi-09', slug: '04-viewdata', name: 'Monochrome viewdata', note: 'A monochrome service terminal with numbered choices, cell mosaics and a choice cursor.' },
  { id: 'vap-09', slug: '05-luna-desktop', name: 'Luna desktop', note: 'Original rolling hills, blue window chrome and a desktop application for this project.' },
];

// An original 5x7 uppercase face. Each glyph becomes a path; image rendering never fetches a font.
const FONT = {
  A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
  0:['01110','10001','10011','10101','11001','10001','01110'],1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00010','00100','01000','11111'],3:['11110','00001','00001','01110','00001','00001','11110'],
  4:['00010','00110','01010','10010','11111','00010','00010'],5:['11111','10000','10000','11110','00001','00001','11110'],6:['01110','10000','10000','11110','10001','10001','01110'],7:['11111','00001','00010','00100','01000','01000','01000'],
  8:['01110','10001','10001','01110','10001','10001','01110'],9:['01110','10001','10001','01111','00001','00001','01110'],
  ' ':['00000','00000','00000','00000','00000','00000','00000'],'-':['00000','00000','00000','11111','00000','00000','00000'],'.':['00000','00000','00000','00000','00000','00110','00110'],':':['00000','00110','00110','00000','00110','00110','00000'],
  '/':['00001','00001','00010','00100','01000','10000','10000'],'+':['00000','00100','00100','11111','00100','00100','00000'],'>':['10000','01000','00100','00010','00100','01000','10000'],
  '<':['00001','00010','00100','01000','00100','00010','00001'],'[':['01110','01000','01000','01000','01000','01000','01110'],']':['01110','00010','00010','00010','00010','00010','01110'],
  '=':['00000','00000','11111','00000','11111','00000','00000'],'!':['00100','00100','00100','00100','00100','00000','00100'],'?':['01110','10001','00001','00010','00100','00000','00100'],
  '_':['00000','00000','00000','00000','00000','00000','11111'],'*':['00000','10101','01110','11111','01110','10101','00000'],
  ',':['00000','00000','00000','00000','00110','00110','00100'],
};
const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const n = (v) => +v.toFixed(3);
const rect = (x,y,w,h,fill,extra='') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${extra}/>`;
const line = (x1,y1,x2,y2,stroke,width=1,extra='') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
function glyphPath(rows) {
  return rows.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==='1'?[`M${x} ${y}h1v1h-1Z`]:[])).join('');
}
const defsFont = () => Object.entries(FONT).map(([char,rows])=>`<path id="g${char.codePointAt(0)}" d="${glyphPath(rows)}"/>`).join('');
function text(s,x,y,scale=2,fill='#fff',extra='') {
  const chars=[...String(s).toUpperCase()];
  for(const char of chars) if(!FONT[char]) throw new Error(`Unmapped character: ${char} in ${s}`);
  return `<g fill="${fill}" transform="translate(${n(x)} ${n(y)}) scale(${scale})" ${extra}>${chars.map((c,i)=>`<use href="#g${c.codePointAt(0)}" x="${i*6}"/>`).join('')}</g>`;
}
const center = (s,y,scale=2,fill='#fff',extra='') => text(s,(960-(String(s).length*6-1)*scale)/2,y,scale,fill,extra);
const fit = (s,x,y,w,max=4,fill='#fff',extra='') => text(s,x,y,Math.min(max,w/Math.max(1,String(s).length*6-1)),fill,extra);

// Three project emblems, drawn from primitives rather than borrowed logos.
function emblem(key,x,y,size,ink='#eee',paper='none') {
  let shape;
  if(key==='naturalis-historia') shape=`<path d="M8 22Q28 10 48 24Q68 10 88 22V79Q68 67 48 82Q28 67 8 79Z" fill="${paper}" stroke="${ink}" stroke-width="4"/><path d="M48 24V82M17 31Q31 26 39 32M17 42Q31 37 39 43M17 53Q31 48 39 54M57 32Q69 26 80 31M57 43Q69 37 80 42M57 54Q69 48 80 53" fill="none" stroke="${ink}" stroke-width="2"/><path d="M42 11L48 2L54 11" fill="none" stroke="${ink}" stroke-width="3"/>`;
  else if(key==='gl4ss') shape=`<circle cx="48" cy="48" r="42" fill="${paper}" stroke="${ink}" stroke-width="3"/><path d="M10 48Q48 7 86 48Q48 89 10 48Z" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="48" cy="48" r="13" fill="${ink}"/><path d="M38 26H58L39 70H57M48 7V16M48 80V89M7 48H16M80 48H89" fill="none" stroke="${ink}" stroke-width="3"/>`;
  else shape=`<path d="M48 6C28 6 10 39 10 61C10 83 27 91 48 91C69 91 86 83 86 61C86 39 68 6 48 6Z" fill="${paper}" stroke="${ink}" stroke-width="4"/><path d="M12 58H84M19 43H77M26 29H70M24 74H72" stroke="${ink}" stroke-width="2"/><path d="M34 47H62V70H34ZM38 47V39Q48 24 58 39V47" fill="${paper}" stroke="${ink}" stroke-width="3"/>`;
  return `<g transform="translate(${x} ${y}) scale(${size/96})">${shape}</g>`;
}

function landscape(key,x,y,w,h,{night=false,pixel=false}={}) {
  const sky=night?'#111831':key==='naturalis-historia'?'#bbad93':key==='gl4ss'?'#84c1c9':'#9a9bbd';
  let out=rect(0,0,640,240,sky);
  for(let i=0;i<26;i++) if(night) out+=rect((i*97+17)%640,(i*31+9)%110,2,2,i%3?'#8294bf':'#edcd8c');
  out+=`<circle cx="${key==='naturalis-historia'?490:110}" cy="62" r="${night?22:30}" fill="${night?'#d2d9dc':'#e5d4a2'}"/>`;
  if(key==='naturalis-historia') {
    out+=`<path d="M0 172L85 147L188 156L312 51L331 51L429 165L521 153L640 176V240H0Z" fill="${night?'#3f4a69':'#717967'}"/><path d="M250 104L312 51L331 51L383 112L328 92L311 75L302 95Z" fill="#a4957d"/><g class="smoke" opacity=".42"><ellipse cx="326" cy="32" rx="13" ry="12" fill="#c6bcbc"/><ellipse cx="343" cy="19" rx="18" ry="10" fill="#a8a9b5"/></g>`;
    out+=rect(0,192,640,48,night?'#26384e':'#587e88');
    for(let i=0;i<6;i++){out+=rect(54+i*23,141,9,65,'#c0bca3');out+=rect(51+i*23,138,15,5,'#e3d3b3');}
    out+=`<path d="M47 138L116 113L186 138Z" fill="#d1c3a2"/>`;
    out+=`<g class="boat"><path d="M443 208H506L489 222H455Z" fill="#1c2835"/><path d="M470 170V209M472 171L494 203H474Z" stroke="#d6c5a5" fill="#d6c5a5" stroke-width="2"/></g>`;
  } else if(key==='gl4ss') {
    out+=`<path d="M0 160L101 111L154 136L203 109L302 158L405 103L512 141L640 93V240H0Z" fill="${night?'#273650':'#668784'}"/>`;
    out+=rect(0,188,640,52,'#284f68');
    out+=`<g class="old-era">${rect(260,126,74,65,'#ccbea0')}<path d="M248 126L298 99L346 126Z" fill="#e6d0a2"/>${[0,1,2,3].map(i=>rect(266+i*18,130,7,60,'#8b917f')).join('')}</g>`;
    out+=`<g class="new-era" opacity="0">${[0,1,2,3,4,5].map(i=>rect(224+i*25,110-i%3*18,18,78+i%3*18,['#76a4ba','#4e739b','#b1c4bf'][i%3])).join('')}<path d="M204 146L399 125" stroke="#b9eee2" stroke-width="3"/></g>`;
    out+=`<path d="M0 218Q160 201 320 218T640 218" fill="none" stroke="#54879a" stroke-width="2"/>`;
  } else {
    out+=`<path d="M0 174L68 147L166 167L248 128L343 155L428 120L526 153L640 119V240H0Z" fill="#404661"/>`;
    out+=rect(0,196,640,44,'#25314c');
    out+=`<path d="M0 223Q40 185 80 223T160 223T240 223T320 223T400 223T480 223T560 223T640 223" stroke="#7c80ad" stroke-width="2" fill="none"/>`;
    for(let i=0;i<18;i++)out+=rect(36+i*32,100+(i*17)%60,8,8,i%2?'#6374a5':'#a486bc','opacity=".45"');
    out+=`<g class="hidden-layer" opacity=".25">${emblem('st3gg',255,83,117,'#e3b3f4','none')}</g>`;
  }
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 640 240" preserveAspectRatio="none" ${pixel?'shape-rendering="crispEdges"':''}>${out}</svg>`;
}

function offAir(p,key) {
  const bars=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];
  let b=rect(0,0,960,540,'#080a0b')+rect(18,18,924,504,'#202225','rx="12"');
  b+=bars.map((c,i)=>rect(26+i*908/7,59,908/7+0.1,317,c)).join('');
  b+=['#0000c0','#111','#c000c0','#111','#00c0c0','#111','#c0c0c0'].map((c,i)=>rect(26+i*908/7,376,908/7+.1,34,c)).join('');
  b+=[['#151b43',26,166],['#eee',192,180],['#351335',372,158],['#111',530,230],['#171717',760,60],['#222',820,57],['#090909',877,57]].map(([c,x,w])=>rect(x,410,w,100,c)).join('');
  b+=center('ELDER-PLINIUS / INDEPENDENT ARCHIVE CHANNEL',31,1.8,'#d9d9d9');
  b+=`<defs><clipPath id="circle"><circle cx="480" cy="234" r="147"/></clipPath><pattern id="testgrid" width="26" height="26" patternUnits="userSpaceOnUse">${rect(0,0,26,26,'#d0d0cb')}${line(0,0,26,0,'#444',1)}${line(0,0,0,26,'#444',1)}</pattern></defs>`;
  b+=`<circle cx="480" cy="234" r="149" fill="#111"/><g clip-path="url(#circle)">${rect(332,86,296,298,'url(#testgrid)')}${rect(332,111,296,86,'#1d2528')}${emblem(key,430,111,100,p.accent,'#1d2528')}${bars.map((c,i)=>rect(332+i*296/7,294,296/7+.1,43,c)).join('')}${Array.from({length:12},(_,i)=>rect(332+i*296/12,338,296/12+.1,44,`rgb(${i*22},${i*22},${i*22})`)).join('')}</g>`;
  b+=rect(129,205,702,75,'#070707');
  const sc=key==='naturalis-historia'?4.8:9;
  b+=center(p.display,219,sc,'#f6f5e8');
  b+=rect(103,418,754,25,'#0b0c0f')+rect(148,468,664,26,'#0b0c0f');
  b+=center(p.facts.join(' / '),427,1.6,'#c9ced0');
  b+=center('SILENT TEST TRANSMISSION - README EDITION',477,1.6,'#aaa');
  b+=`<g class="signal">${rect(41,76,270,50,'#0b0c0f','stroke="#f2efe1" stroke-width="1"')}${text(key==='gl4ss'?'NO TEMPORAL SIGNAL':key==='st3gg'?'PAYLOAD NOT VISIBLE':'ARCHIVE OFF AIR',54,86,1.6,'#fff')}${text('CHECK THE SOURCE',54,108,1.3,p.accent)}</g>`;
  return {body:b,css:'@keyframes hop{0%,24%{transform:translate(0,0)}25%,49%{transform:translate(575px,26px)}50%,74%{transform:translate(564px,345px)}75%,100%{transform:translate(0,325px)}}.signal{animation:hop 16s steps(1,end) infinite}',description:`${p.display} as an off-air station test card. The project emblem occupies a circle-and-grid pattern; a signal box changes position every four seconds.`};
}

function bbs(p,key) {
  let b=rect(0,0,960,540,'#050505')+rect(18,18,924,504,'#0a0b0c','stroke="#34373b" stroke-width="2"');
  b+=rect(30,30,900,26,'#183687')+text('ARCHIVE NET / BOARD LIST',42,37,1.8,'#eee')+text('READ ONLY',780,37,1.6,'#67eeee');
  b+=text('[Q] EXIT   [R] READ   [/] FIND',42,68,1.7,'#9da2aa');
  b+=emblem(key,42,106,91,p.accent,'#050505');
  b+=fit(p.display,164,108,728,key==='naturalis-historia'?5.4:8.5,p.accent);
  b+=fit(p.pitch,164,170,720,1.8,'#dbdfe0');
  b+=rect(30,204,900,23,'#bbbfc8')+text('NO.  BOARD        CLASS  DESCRIPTION                         REF.',41,211,1.65,'#090b10');
  p.boards.forEach(([board,type,desc,count],i)=>{
    const y=243+i*38;
    b+=text(String(i+1).padStart(3,'0'),41,y,1.7,'#727b85')+text(board,92,y,1.7,'#e8e8e3')+text(type,264,y,1.6,['#67f0e6','#eac277','#cc99ea'][i]);
    b+=fit(desc,350,y,494,1.5,'#c6be9e')+text(count,859,y,1.4,'#eee');
  });
  b+=`<path class="lightbar" d="M33 262H927" stroke="#c6c6d0" stroke-width="1" opacity=".6"/>`;
  b+=rect(30,351,900,24,'#294137')+text('RE: WHAT LIVES BEHIND THIS TITLE',42,359,1.6,'#a5ebbe');
  p.comments.forEach((comment,i)=>{
    const y=391+i*29;
    b+=`<g class="reply reply${i}">${text(i===1?'>':'+',42,y,1.9,i===1?'#ed7777':'#ddd')}${text(['FOLIO','DIAL','LAYER'][i],69,y,1.5,'#e0cb5b')}${fit(comment,143,y,626,1.55,'#bca666')}${text(`10/05 0${i}:00`,780,y,1.1,'#798388')}</g>`;
  });
  b+=rect(30,486,199,24,'#54cbd2')+text('READ / COMPARE',41,494,1.45,'#092441');
  b+=rect(229,486,260,24,'#b342af')+text('SCRIPTED SAMPLE THREAD',239,494,1.4,'#fff4a0');
  b+=rect(489,486,441,24,'#c7c9cf')+text('NO LIVE USERS OR TRAFFIC COUNTS',500,494,1.4,'#222');
  return {body:b,css:'@keyframes bar{0%,32%{transform:translateY(0)}33%,65%{transform:translateY(38px)}66%,100%{transform:translateY(76px)}}.lightbar{animation:bar 12s steps(1,end) infinite}@keyframes arrive{0%,10%{opacity:0}20%,86%{opacity:1}100%{opacity:0}}.reply{animation:arrive 12s steps(1,end) infinite}.reply1{animation-delay:1s}.reply2{animation-delay:2s}',description:`A Taiwanese BBS-inspired screen for ${p.display}. Board entries describe real project components. Original, illustrative comments arrive beneath the list; no live users or popularity figures are implied.`};
}

function demo(p,key) {
  let b=rect(0,0,960,540,'#030406');
  b+=landscape(key,0,71,960,371,{night:true,pixel:true});
  for(let i=0;i<22;i++)b+=rect(0,71+i*17,960,1,'#030406','opacity=".22"');
  b+=center('AN ELDER-PLINIUS PROJECT',28,1.6,'#aab1b8');
  const sc=key==='naturalis-historia'?8.5:16;
  const y=key==='naturalis-historia'?150:177;
  b+=`<g class="main-title">${p.lines.map((s,i)=>center(s,y+i*87,sc,'#fff3d1')).join('')}${center(p.pitch,key==='naturalis-historia'?333:323,2,'#cddddd')}</g>`;
  b+=`<g class="part-card" opacity="0">${center('PART 01 / THE PROJECT',196,3,'#a6ced9')}${center(key==='naturalis-historia'?'TEXT - LATIN + ENGLISH':key==='gl4ss'?'SCENE - PLACE + YEAR + HOUR':'CARRIER - PICTURE + SOUND',243,2.5,'#f1d6a6')}${center('CODE - ELDER-PLINIUS',286,2.5,'#d6dde9')}</g>`;
  b+=center(p.facts.join(' / '),468,1.7,'#b4c0c9');
  b+=center('VGA TITLE STUDY / SILENT ANIMATED SVG',506,1.2,'#707b88');
  return {body:b,css:'@keyframes main{0%,58%,100%{opacity:1}65%,86%{opacity:0}}@keyframes part{0%,58%,100%{opacity:0}66%,85%{opacity:1}}.main-title{animation:main 18s linear infinite}.part-card{animation:part 18s linear infinite}@keyframes boat{to{transform:translateX(90px)}}.boat{animation:boat 18s linear infinite alternate}@keyframes smoke{to{transform:translate(12px,-6px);opacity:.15}}.smoke{animation:smoke 6s ease-in-out infinite alternate}@keyframes future{0%,35%,100%{opacity:0}48%,85%{opacity:1}}.new-era{animation:future 18s linear infinite}.old-era{animation:future 18s linear infinite reverse}@keyframes reveal{to{opacity:.85}}.hidden-layer{animation:reveal 6s ease-in-out infinite alternate}',description:`${p.display} in the manner of early PC demo opening titles: original procedural horizon art, unoutlined pixel lettering, long title holds and a brief part-credit card.`};
}

function mosaic(key,x,y,unit=7) {
  const grids={
    'naturalis-historia':['0000000000000000','0111111001111110','0100001111000010','0111101001111010','0100001001000010','0111101001111010','0100001001000010','0111101001111010','0100001001000010','0111111001111110','0000000110000000'],
    gl4ss:['0000001111000000','0000110000110000','0011001111001100','0110011001100110','1100110110110011','0110011001100110','0011001111001100','0000110000110000','0000001111000000','0000000110000000','0000001111000000'],
    st3gg:['0000001111000000','0000110000110000','0001100110011000','0011001001001100','0110010000100110','1100100000010011','1111111111111111','1100011111100011','0110000110000110','0011110000111100','0000011111100000'],
  };
  return `<g transform="translate(${x} ${y})">${grids[key].flatMap((row,yy)=>[...row].flatMap((v,xx)=>v==='1'?[rect(xx*unit,yy*unit,unit-1,unit-1,'#b5b6b1')]:[])).join('')}</g>`;
}

function viewdata(p,key) {
  let b=rect(0,0,960,540,'#141718')+rect(34,18,892,504,'#96918a','rx="27"')+rect(54,35,852,460,'#262825','rx="23"')+rect(79,55,802,416,'#090b0a','rx="8"');
  b+=rect(346,505,268,6,'#635f59','rx="3"');
  b+=`<defs><clipPath id="paint"><rect class="paint" x="80" y="55" width="800" height="416"/></clipPath></defs><g clip-path="url(#paint)">`;
  b+=text('P0001  /  PRIVATE READER SERVICE',103,72,1.6,'#929890')+text('C',843,72,1.7,'#e2e6dc');
  b+=rect(99,108,762,71,'#bec2b7')+fit(p.display,122,127,714,key==='naturalis-historia'?4.7:6.6,'#111510');
  b+=fit(p.pitch,117,193,727,1.65,'#c0c5bb');
  p.menus.forEach((menu,i)=>{
    const y=238+i*40;
    b+=rect(118,y-4,31,25,'#c2c4b9')+text(String(i+1),127,y,2,'#10150f')+fit(menu,167,y+1,465,1.85,'#d7dccf');
  });
  b+=mosaic(key,695,255,8);
  b+=text('CHOICE ..',118,409,1.8,'#949e90')+rect(241,407,12,19,'#d3d8cc','class="cursor"');
  [['SEND',118,'OPEN'],['INDEX',348,'MENU'],['NEXT',588,'PAGE']].forEach(([label,x,action])=>{
    b+=rect(x,443,label.length*11+12,21,'#a5ada0')+text(label,x+6,448,1.55,'#101710')+text(action,x+label.length*11+23,448,1.5,'#a5ada0');
  });
  b+='</g>';
  return {body:b,css:'@keyframes paint{from{transform:scaleY(.025)}to{transform:scaleY(1)}}.paint{transform-box:fill-box;transform-origin:top;animation:paint 3s steps(25,end) both}@keyframes blink{50%{opacity:0}}.cursor{animation:blink 1.2s steps(1,end) infinite}',description:`A monochrome viewdata terminal for ${p.display}. A numbered menu, double-height title band and original cell mosaic paint down the screen once, followed by a blinking choice cursor.`};
}

function luna(p,key) {
  let b=`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#1956a6"/><stop offset="1" stop-color="#8ccada"/></linearGradient><linearGradient id="hill" x2="0" y2="1"><stop stop-color="#89b92d"/><stop offset="1" stop-color="#326c25"/></linearGradient><linearGradient id="bar" x2="0" y2="1"><stop stop-color="#4bacff"/><stop offset=".12" stop-color="#0863f2"/><stop offset=".82" stop-color="#0862e5"/><stop offset="1" stop-color="#003cad"/></linearGradient></defs>`;
  b+=rect(0,0,960,540,'url(#sky)');
  b+=`<g class="clouds" fill="#eef8fb" opacity=".82"><ellipse cx="166" cy="74" rx="94" ry="18"/><ellipse cx="188" cy="56" rx="54" ry="24"/><ellipse cx="763" cy="117" rx="75" ry="15"/><ellipse cx="741" cy="99" rx="39" ry="21"/></g><path d="M0 343Q276 172 588 336Q775 372 960 299V540H0Z" fill="url(#hill)"/><path d="M0 427Q362 260 960 418V540H0Z" fill="#4b982c"/>`;
  b+=rect(56,67,848,414,'#0844bb','rx="9"')+rect(61,103,838,373,'#ece9d8')+rect(58,69,844,34,'url(#bar)','rx="7"');
  b+=fit(`${p.display} - PROJECT EXPLORER`,74,80,693,1.95,'#fff');
  [['-',818,'#267bf4'],['+',845,'#267bf4'],['X',872,'#dc6749']].forEach(([s,x,c])=>{b+=rect(x,74,23,23,c,'rx="4" stroke="#d9eafa"')+text(s,x+6,80,1.8,'#fff');});
  b+=text('FILE   VIEW   TOOLS   HELP',77,117,1.45,'#343a42');
  b+=rect(74,139,175,273,'#d9e6f4')+rect(254,139,630,273,'#fff','stroke="#8a9db3"');
  b+=text('PROJECT TASKS',87,154,1.45,'#244775');
  p.menus.forEach((s,i)=>b+=fit(s,91,190+i*40,144,1.15,'#225b9c'));
  b+=emblem(key,116,330,91,'#4782a7','none');
  b+=landscape(key,270,156,598,170,{night:key==='st3gg'});
  b+=rect(270,334,598,62,'#f0eee5')+fit(p.display,283,344,560,2.2,'#203a58')+fit(p.facts.join(' / '),283,373,558,1.35,'#616653');
  b+=rect(74,425,810,32,'#e1dfce','stroke="#a5a79d"')+text('PREVIEW',85,436,1.3,'#455460');
  b+=rect(177,432,268,18,'#fff','stroke="#8e9b9f"');
  for(let i=0;i<14;i++)b+=rect(181+i*18,435,13,12,'#5aae38',`class="progress p${i}"`);
  b+=fit(key==='naturalis-historia'?'OPEN THE BOOK / FOLLOW FORTUNA':key==='gl4ss'?'TURN THE DIAL / HOLD TWO ERAS':'INSPECT THE CARRIER / LOOK DEEPER',464,436,406,1.25,'#385735');
  b+=rect(0,502,960,38,'url(#bar)')+rect(0,502,135,38,'#378737','rx="14"')+text('CARRIERS',11,515,2,'#fff');
  b+=rect(143,507,568,27,'#3987e6','rx="3" stroke="#86b7f3"')+fit(p.display,160,515,530,1.6,'#fff');
  b+=rect(828,503,132,37,'#1a8edf')+text('10:05',848,515,2,'#fff');
  const progress=Array.from({length:14},(_,i)=>`.p${i}{animation-delay:${i*.12}s}`).join('');
  return {body:b,css:`@keyframes cloud{to{transform:translateX(48px)}}.clouds{animation:cloud 34s linear infinite alternate}@keyframes progress{0%,24%,85%,100%{opacity:.22}30%,75%{opacity:1}}.progress{animation:progress 5s linear infinite}${progress}@keyframes future{0%,35%,100%{opacity:0}48%,85%{opacity:1}}.new-era{animation:future 14s linear infinite}.old-era{animation:future 14s linear infinite reverse}@keyframes reveal{to{opacity:.95}}.hidden-layer{animation:reveal 5s ease-in-out infinite alternate}`,description:`${p.display} on an original Luna-era hill-and-sky desktop. A project explorer contains a custom landscape, section shortcuts and a marching progress strip; no Windows logo or wallpaper is reproduced.`};
}

// Shared references, independent compositions: a service page is not always a menu,
// a BBS is not always a board list, and an off-air screen is not always a colour-bar logo.
const wide = (s,x,y,size,fill) => `<text x="${x}" y="${y}" fill="${fill}" style="font-family:Microsoft JhengHei,Noto Sans CJK TC,sans-serif" font-size="${size}" textLength="${s.length*size}" lengthAdjust="spacingAndGlyphs">${s}</text>`;

function archiveCard(p) {
  let b=rect(0,0,960,540,'#cfc9b7');
  for(let i=0;i<25;i++)b+=line(i*40,0,i*40,540,'#9c998c',1);
  for(let i=0;i<14;i++)b+=line(0,i*40,960,i*40,'#9c998c',1);
  b+=rect(20,20,920,500,'none','stroke="#292e29" stroke-width="5"');
  for(let i=0;i<24;i++) {b+=rect(22+i*38,22,19,12,i%2?'#ded9c8':'#303630');b+=rect(22+i*38,506,19,12,i%2?'#303630':'#ded9c8');}
  b+=`<circle cx="681" cy="265" r="194" fill="#e5dfcd" stroke="#282e28" stroke-width="6"/><circle cx="681" cy="265" r="159" fill="none" stroke="#727565" stroke-width="2"/>`;
  for(let i=0;i<37;i++){const a=i*Math.PI*2/37;b+=`<circle cx="${n(681+177*Math.cos(a))}" cy="${n(265+177*Math.sin(a))}" r="${i===36?7:3}" fill="${i===36?'#886a32':'#74786a'}"/>`;}
  b+=emblem('naturalis-historia',620,133,125,'#263829','#e5dfcd');
  for(let i=0;i<8;i++)b+=rect(552+i*32,295,32,52,`rgb(${35+i*28},${39+i*27},${35+i*27})`);
  b+=text('XXXVII',602,369,4.8,'#293a2c');
  b+=text('NATVRALIS',57,116,6.8,'#242d28')+text('HISTORIA',57,179,7.5,'#242d28');
  b+=text('ARCHIVE TELEVISION',61,272,2.1,'#494e42')+text('37 BOOKS / 1065 CHAPTERS',61,308,1.7,'#4d5147');
  b+=text('LATIN - ENGLISH',61,346,2.2,'#3f4939')+text('CALIBRATION PLATE 01',61,433,1.8,'#665b43');
  b+=`<g class="archive-ident">${rect(507,455,356,29,'#252f28')}${text('THE FIRST ENCYCLOPEDIA',521,464,1.6,'#e8dfb9')}</g>`;
  b+=text('OFF AIR / FORTUNA IS READING',61,474,1.4,'#292d28');
  return {body:b,css:'@keyframes archive-hop{0%,49%{transform:translate(0,0)}50%,100%{transform:translate(-430px,-385px)}}.archive-ident{animation:archive-hop 16s steps(1,end) infinite}',description:'A museum-like monochrome archive test plate. Thirty-seven calibration dots circle an original open book; an off-air station label hops between two positions. The geometry belongs to the encyclopedia, not a generic TV ident.'};
}

function temporalCard(p) {
  let b=rect(0,0,960,540,'#070e19')+rect(22,23,916,494,'#111c28','stroke="#324f6d" stroke-width="2"');
  b+=text('GL4SS',47,49,9,'#d2e9e8')+text('TEMPORAL RECEIVER',405,59,2.8,'#78a9c1');
  b+=text('BAY OF NAPLES / AD 79 / AFTERNOON',407,93,1.7,'#8b9caa');
  b+=landscape('gl4ss',43,142,874,252,{night:true,pixel:true});
  b+=rect(43,142,874,252,'#102232','opacity=".25"');
  for(let i=0;i<19;i++)b+=line(43,149+i*13,917,149+i*13,'#061525',3);
  b+=`<g class="lockbox">${rect(271,222,420,77,'#101623','stroke="#9ac7d1" stroke-width="2"')}${text('NO SIGNAL FROM THIS YEAR',292,239,2.65,'#e9eee7')}${text('TUNE ANOTHER STATION',327,275,1.6,'#d1bd80')}</g>`;
  const bars=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];
  b+=bars.map((c,i)=>rect(43+i*874/7,402,874/7+.1,27,c)).join('');
  b+=text('284 STATIONS',44,449,2,'#94acb4')+text('55 JOURNEYS',393,449,2,'#94acb4')+text('PAST / FUTURE',677,449,2,'#94acb4');
  b+=text('THE PICTURE WAITS. THE DIAL MOVES.',44,488,1.7,'#638197');
  return {body:b,css:'@keyframes lockbox{0%,32%{transform:translate(0,0)}33%,65%{transform:translate(-197px,-51px)}66%,100%{transform:translate(200px,64px)}}.lockbox{animation:lockbox 18s steps(1,end) infinite}@keyframes epoch{0%,42%,100%{opacity:0}49%,91%{opacity:.8}}.new-era{animation:epoch 18s linear infinite}',description:'A lost television signal from AD 79. A blue temporal receiver contains a scan-lined coastal feed and a wandering no-signal box, with a separate seven-bar calibration strip and station readouts.'};
}

function fieldBoard(p) {
  let b=rect(0,0,960,540,'#050607')+rect(18,21,924,26,'#26377a');
  b+=text('FIELD.LOG / GL4SS / ARTICLE 079',31,29,1.7,'#fff')+wide('文章',854,41,17,'#dbebf7');
  b+=text('AUTHOR: DIAL   BOARD: TIME.TRAVEL',30,65,1.6,'#d4c570')+text('TITLE: ONE PLACE / THREE AGES',30,95,2.1,'#70d5db');
  b+=line(30,127,930,127,'#74777b',1)+text('GL4SS',37,150,9,'#a4dde0');
  b+=text('PLACE  BAY OF NAPLES',395,154,2,'#eee')+text('YEAR   AD 79',395,185,2,'#efd096')+text('HOUR   AFTERNOON',395,216,2,'#b8c6cb');
  // A character-cell coast and survey line, rather than a masthead above a board table.
  const coast=['         .........          ','     ....::::::..           ','  ...::::::....             ',' ..::::..     .....         ','..::..      ...::::...      ',':::..  ....:::::::....      ','..   ...::::..    ........  ',' ....::::..    ....:::::::..'];
  coast.forEach((row,i)=>b+=text(row,36,270+i*16,1.45,i%3?'#67b6d0':'#84d1c8'));
  b+=rect(385,267,535,126,'#0c1921','stroke="#28566a"');
  b+=text('THEN',400,280,1.3,'#a1ccd0')+text('NOW',812,280,1.3,'#a1ccd0');
  b+=landscape('gl4ss',398,309,508,68,{night:false,pixel:true});
  b+=`<path class="year-scan" d="M422 304V385" stroke="#eec779" stroke-width="3"/>`;
  const replies=['PICK A PLACE. KEEP THE COORDINATES.','HOLD THE FRAME. TURN THE YEAR.','THE SAME COAST, A DIFFERENT WORLD.'];
  replies.forEach((s,i)=>{const y=421+i*28;b+=wide(i===1?'噓':'推',30,y+12,17,i===1?'#e87977':'#ddd')+text(['MAP:','TIME:','VIEW:'][i],62,y,1.6,'#ded067')+text(s,131,y,1.6,'#b99f63');});
  b+=rect(20,511,920,20,'#c5ced3')+text('SCRIPTED FIELD REPORT / NO LIVE COMMENTS',32,516,1.3,'#202f35');
  return {body:b,css:'@keyframes survey{to{transform:translateX(465px)}}.year-scan{animation:survey 12s ease-in-out infinite alternate}@keyframes eras{0%,30%,100%{opacity:0}45%,85%{opacity:1}}.new-era{animation:eras 12s linear infinite}',description:'GL4SS as a Taiwanese BBS field-report article: coordinate readouts, a cell-art coastline and an era-comparison scan, followed by an original scripted push/boo comment column.'};
}

function carrierBoard(p) {
  let b=rect(0,0,960,540,'#070708')+rect(19,19,922,31,'#49366b');
  b+=text('FILE.AREA / ST3GG',33,29,2,'#e9dcff')+wide('看板',830,42,18,'#e9dcff');
  b+=text('ST3GG',33,79,10,'#d4a3ef')+text('[I] IMAGE  [A] AUDIO  [T] TEXT',374,84,1.65,'#ada2b6')+text('CARRIER PREVIEW / READ ONLY',374,117,1.65,'#837d92');
  b+=rect(28,179,545,23,'#adb1b6')+text('FILE               TYPE     ACTION',39,186,1.7,'#080a11');
  const rows=[['CARRIER.PNG','IMAGE','INSPECT'],['SIGNAL.WAV','AUDIO','LISTEN'],['NOTE.TXT','TEXT','READ'],['LAYER.DAT','DATA','COMPARE']];
  rows.forEach(([file,type,action],i)=>{const y=224+i*40;b+=text(file,42,y,1.7,'#ddd')+text(type,283,y,1.7,'#cca3d9')+text(action,393,y,1.7,'#bcb78b');});
  b+=rect(598,179,328,232,'#111722','stroke="#65708d"');
  b+=text('VISIBLE / HIDDEN',615,193,1.6,'#b5c1d7');
  for(let i=0;i<12;i++)for(let j=0;j<17;j++)b+=rect(614+j*17,225+i*13,15,11,['#3c476a','#515c7c','#667391','#89979f'][(i*3+j*5)%4]);
  b+=`<g class="secret" opacity=".15">${emblem('st3gg',684,239,142,'#e8cbef','none')}</g>`;
  b+=line(30,413,928,413,'#384152',1);
  ['ONE FILE. MORE THAN ONE READING.','THIS SCREEN IS AN ORIGINAL VISUAL STUDY.'].forEach((s,i)=>b+=wide('推',35,450+i*31,17,'#ddd')+text(i?'VIEW:':'LAYER:',67,438+i*31,1.5,'#dbc86c')+text(s,143,438+i*31,1.65,'#bca779'));
  b+=rect(20,505,921,23,'#b0b5bc')+text('DEMO FILE NAMES / NO REAL PAYLOAD / NO LIVE TRANSFER',32,513,1.45,'#23232b');
  return {body:b,css:'@keyframes secret{0%,20%,100%{opacity:.12}50%,75%{opacity:.9}}.secret{animation:secret 9s ease-in-out infinite}',description:'A BBS file area rather than a board list. Illustrative image, audio and text carriers sit beside a block-art preview whose second layer emerges and recedes. The file names and comments are fictional sample content.'};
}

function eraDemo(p) {
  let b=rect(0,0,960,540,'#020308')+text('GL4SS',58,89,14,'#f3e0b5');
  b+=text('EX LOCO / PER VITRUM / AD OMNE TEMPUS',62,219,1.6,'#98adb7');
  // Three separately drawn part thumbnails are the credit-card subjects.
  const panels=[{x:58,year:'AD 79',tone:'#78725d'},{x:350,year:'1969',tone:'#486b84'},{x:642,year:'3050',tone:'#405277'}];
  panels.forEach(({x,year,tone},i)=>{
    b+=rect(x,272,258,144,tone);
    if(i===0){for(let j=0;j<5;j++)b+=rect(x+26+j*37,329,16,70,'#c0b49c');b+=`<path d="M${x+12} 327L${x+128} 289L${x+244} 327Z" fill="#b9a77c"/>`;}
    if(i===1){for(let j=0;j<6;j++){b+=rect(x+11+j*41,317-j%2*23,31,100+j%2*23,'#77919b');b+=rect(x+17+j*41,332-j%2*23,18,34,'#b5cec8');}}
    if(i===2){for(let j=0;j<7;j++){b+=`<path d="M${x+13+j*34} 416V${309-j%3*17}L${x+31+j*34} ${286-j%3*17}V416" fill="#6986a8"/>`;b+=line(x+13+j*34,340,x+31+j*34,334,'#a1dbd8',2);}}
    b+=rect(x,399,258,17,'#0b111b')+text(year,x+11,404,1.4,'#ddd');
  });
  b+=`<g class="journey"><path d="M58 439H900" stroke="#293546" stroke-width="1"/><circle cx="66" cy="439" r="5" fill="#c7f0e9"/></g>`;
  b+=text('SAME PLACE',62,472,2.5,'#afcdd3')+text('THREE WINDOWS',558,472,2.5,'#afcdd3');
  b+=text('A TITLE SEQUENCE THROUGH TIME / 55 CURATED JOURNEYS',61,516,1.45,'#6f7d95');
  return {body:b,css:'@keyframes journey{0%{transform:translateX(0)}100%{transform:translateX(823px)}}.journey circle{animation:journey 18s cubic-bezier(.3,.05,.5,1) infinite alternate}',description:'A PC demo part-credit composition for GL4SS: the same place appears as an ancient temple, twentieth-century skyline and future city. A travelling cue joins three original thumbnails beneath a plain pixel title.'};
}

function hiddenDemo(p) {
  let b=rect(0,0,960,540,'#030716');
  // A horizon of original transmission lines. The hidden title is another spatial layer.
  for(let i=0;i<34;i++){const y=244+i*8;const c=i%4?'#2c345e':'#475786';b+=line(0,y,960,y,c,1);}
  for(let i=-15;i<16;i++)b+=line(480+i*19,244,480+i*110,532,'#3b4678',1);
  for(let i=0;i<67;i++)b+=rect((i*73+19)%960,(i*37+7)%211,2,2,i%4?'#536389':'#bcb8d8');
  b+=`<g class="secret-title" opacity=".25">${center('ST3GG',135,17,'#e3c3f1')}</g>`;
  b+=`<g class="carrier-lines" stroke="#7582b0" stroke-width="2" opacity=".65">${Array.from({length:23},(_,i)=>`<path d="M0 ${110+i*9}Q240 ${75+i*9} 480 ${110+i*9}T960 ${110+i*9}" fill="none"/>`).join('')}</g>`;
  b+=center('THE CARRIER IS THE FIRST PICTURE',358,2.35,'#d9dfeb');
  b+=center('THE MESSAGE IS THE SECOND',399,2.6,'#cba5dd');
  b+=center('IMAGE / AUDIO / TEXT / DOCUMENTS',473,1.7,'#8d9ab8');
  b+=center('AN ORIGINAL DEMO PART / NO EMBEDDED PAYLOAD',515,1.2,'#657191');
  return {body:b,css:'@keyframes hidden-title{0%,15%,100%{opacity:.25}36%,73%{opacity:1}}.secret-title{animation:hidden-title 14s ease-in-out infinite}@keyframes carrier{0%,15%,100%{opacity:.8;transform:translateY(0)}36%,73%{opacity:.06;transform:translateY(16px)}}.carrier-lines{animation:carrier 14s ease-in-out infinite}',description:'A PC demo title hidden behind a wave carrier and a perspective wire floor. The ST3GG name gradually becomes the second picture. This is an original visual metaphor, not an encoded payload.'};
}

function timeService(p) {
  let b=rect(0,0,960,540,'#222622')+rect(22,17,916,506,'#c5c4b4','rx="28"')+rect(47,38,866,459,'#10170f','rx="12"');
  b+=text('P0079 / TEMPORAL DIRECTORY',72,58,1.7,'#9da995')+text('C',869,58,1.7,'#d9decf');
  b+=rect(66,94,828,59,'#bdc5ad')+text('GL4SS',89,106,5.7,'#182114')+text('THE LOOKING GLASS',416,115,2.5,'#182114');
  b+=text('PLACE',73,182,2,'#c8d1bd')+text('BAY OF NAPLES',210,182,2.8,'#d4dbcb');
  b+=line(73,219,889,219,'#68755d',1);
  b+=text('YEAR',74,245,2.1,'#9fac91')+text('AD 79',76,288,7.4,'#d4dac9');
  b+=text('HOUR',440,245,2.1,'#9fac91')+text('15:00',440,289,5.5,'#d4dac9');
  b+=mosaic('gl4ss',741,248,8);
  b+=text('1 PLACE   2 YEAR   3 HOUR',75,386,2,'#c0c9b3');
  b+=rect(75,426,134,33,'#c2cbb5')+text('SEND',91,434,2.25,'#192412')+text('OPEN A WINDOW',232,434,2.2,'#9cac91');
  b+=rect(851,431,15,20,'#c2cbb5','class="cursor"');
  return {body:b,css:'@keyframes blink{50%{opacity:0}}.cursor{animation:blink 1.2s steps(1,end) infinite}',description:'GL4SS as a monochrome telephone-era time service. Large year and hour fields, a fixed location and a mosaic optic replace the encyclopedia menu; SEND is the lever that opens a window.'};
}

function decodeService(p) {
  let b=rect(0,0,960,540,'#b7b4aa')+rect(28,24,904,492,'#30322e','rx="20"')+rect(54,46,852,446,'#090e0b','rx="9"');
  b+=text('P0003 / CARRIER SERVICE',79,66,1.7,'#adb5a3')+text('C',866,66,1.7,'#d7dac8');
  b+=text('ST3GG',79,105,7,'#dde0cd')+text('LOOK BENEATH',475,115,2.8,'#99a68f')+text('THE SURFACE',475,150,2.8,'#99a68f');
  b+=rect(79,200,800,25,'#a6b298')+text('VISIBLE FILE                 HIDDEN READING',92,207,1.65,'#0a140b');
  b+=mosaic('st3gg',125,260,11);
  b+=text('CARRIER.PNG',103,409,1.5,'#b4c2a4');
  b+=line(374,248,374,442,'#5c6b55',2);
  ['1 INSPECT THE IMAGE','2 HEAR THE AUDIO','3 READ THE TEXT'].forEach((s,i)=>b+=text(s,421,262+i*44,2.15,'#b9c8a5'));
  b+=text('CHOICE ..',422,408,1.8,'#93a082')+rect(544,406,12,18,'#c3ccb3','class="cursor"');
  b+=text('[SEND] DECODE     [INDEX] RETURN',80,463,1.65,'#a0ac92');
  b+=`<path class="carrier-scan" d="M103 249H319" stroke="#d9e0bd" stroke-width="2"/>`;
  return {body:b,css:'@keyframes scan{to{transform:translateY(120px)}}.carrier-scan{animation:scan 6s linear infinite alternate}@keyframes blink{50%{opacity:0}}.cursor{animation:blink 1.2s steps(1,end) infinite}',description:'A viewdata decoding service with an original egg-shaped carrier mosaic on one side and inspection choices on the other. The scan line illustrates looking beneath a file, without carrying a real secret.'};
}

function xpWindow(x,y,w,h,title) {
  return rect(x,y,w,h,'#0751c8','rx="7"')+rect(x+4,y+30,w-8,h-34,'#ece9d8')+rect(x+2,y+2,w-4,29,'url(#xpbar)','rx="5"')+fit(title,x+12,y+11,w-57,1.65,'#fff')+rect(x+w-29,y+6,21,20,'#df6c49','rx="3" stroke="#e1e9f3"')+text('X',x+w-24,y+11,1.6,'#fff');
}
function xpGround() {
  return `<defs><linearGradient id="xpsky" x2="0" y2="1"><stop stop-color="#145fab"/><stop offset="1" stop-color="#b0dce8"/></linearGradient><linearGradient id="xpbar" x2="0" y2="1"><stop stop-color="#54b2ff"/><stop offset=".16" stop-color="#0868ed"/><stop offset="1" stop-color="#003da2"/></linearGradient></defs>${rect(0,0,960,540,'url(#xpsky)')}<path d="M0 376Q312 207 624 359T960 345V540H0Z" fill="#79a832"/><path d="M0 439Q468 310 960 449V540H0Z" fill="#4a852b"/>`;
}

function bookDesktop(p) {
  let b=xpGround()+xpWindow(27,30,901,456,'NATVRALIS HISTORIA / BILINGUAL LIBRARY');
  b+=rect(44,75,192,387,'#e1eafa')+text('THE LIBRARY',57,91,1.7,'#315a7f');
  ['37 BOOKS','1065 CHAPTERS','ILLUSTRATIONS','FULL-WORK SEARCH','FORTUNA'].forEach((s,i)=>b+=text(s,57,144+i*48,1.28,'#365778'));
  b+=xpWindow(259,96,363,327,'LATIN / BOOK II')+xpWindow(586,144,307,284,'ENGLISH / BOOK II');
  b+=rect(274,140,329,263,'#fff9e5')+text('DE MUNDO',291,159,3.2,'#6f582e');
  b+=emblem('naturalis-historia',348,210,158,'#9c7e49','#fff9e5');
  b+=text('NATVRALIS',290,367,2.2,'#7f633b');
  b+=rect(600,184,278,228,'#fffdf2')+text('THE WORLD',613,203,2.7,'#544c3c');
  ['THE LATIN ARRIVES FIRST.','ENGLISH FOLLOWS THE INK.','A WINDOW FOR EACH CHAPTER.'].forEach((s,i)=>b+=fit(s,614,258+i*39,247,1.45,'#6b6756'));
  b+=`<path class="ink" d="M614 383H857" stroke="#b4a58a" stroke-width="3"/>`;
  b+=rect(0,502,960,38,'url(#xpbar)')+rect(0,502,137,38,'#36812b','rx="13"')+text('LIBRARY',17,515,2.25,'#fff')+text('LATIN',165,516,1.75,'#fff')+text('ENGLISH',296,516,1.75,'#fff');
  b+=rect(592,462,317,48,'#fff6bd','rx="8" stroke="#ae9c53"')+text('FORTUNA: OPEN A RANDOM PAGE',607,477,1.45,'#695b37');
  return {body:b,css:'@keyframes ink{0%,15%{stroke-dasharray:0 243}70%,100%{stroke-dasharray:243 0}}.ink{animation:ink 8s ease-in-out infinite}',description:'The encyclopedia becomes a Luna-era bilingual library: a book tree, overlapping Latin and English reading windows, an original open-book plate and a Fortuna notification. Its composition is a reader, not a generic explorer.'};
}

function timeDesktop(p) {
  let b=xpGround()+xpWindow(23,28,303,447,'GL4SS / TIME SETTINGS');
  b+=text('GL4SS',40,84,5.9,'#225d8a')+text('BAY OF NAPLES',40,145,2.1,'#345577');
  b+=`<circle cx="173" cy="278" r="88" fill="#f6f4e8" stroke="#6d8aa1" stroke-width="3"/>`;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;b+=line(n(173+70*Math.cos(a)),n(278+70*Math.sin(a)),n(173+80*Math.cos(a)),n(278+80*Math.sin(a)),'#547384',i%6?1:3);}
  b+=`<g class="dial-hand"><path d="M173 278L173 208" stroke="#326c9c" stroke-width="4"/></g><circle cx="173" cy="278" r="7" fill="#306b9f"/>`;
  b+=text('AD 79',110,391,3.2,'#355980')+text('284 STATIONS',76,440,1.5,'#536d77');
  b+=xpWindow(345,83,589,373,'GL4SS / HOLD AND COMPARE');
  b+=landscape('gl4ss',361,130,557,198,{night:false});
  b+=rect(361,338,557,101,'#f5f3e8');
  b+=text('PAST',376,357,2,'#536678')+text('FUTURE',789,357,2,'#536678')+line(376,403,899,403,'#75929e',5);
  b+=`<g class="slider"><rect x="404" y="390" width="16" height="26" rx="3" fill="#408bd4" stroke="#234d7d"/></g>`;
  b+=rect(0,502,960,38,'url(#xpbar)')+rect(0,502,137,38,'#3b852c','rx="13"')+text('JOURNEYS',12,516,2,'#fff')+text('55 JOURNEYS THROUGH TIME',164,516,1.65,'#fff');
  return {body:b,css:'@keyframes dial{to{transform:rotate(130deg)}}.dial-hand{transform-origin:173px 278px;animation:dial 14s ease-in-out infinite alternate}@keyframes slider{to{transform:translateX(459px)}}.slider{animation:slider 14s ease-in-out infinite alternate}@keyframes future{0%,28%,100%{opacity:0}55%,88%{opacity:1}}.new-era{animation:future 28s linear infinite}',description:'GL4SS becomes a Luna desktop instrument: a separate time-settings window with an analogue dial, a larger hold-and-compare scene and a moving era slider. The landscape changes behind the control.'};
}

export function renderHeader(key,index) {
  const p=PROJECTS[key]; const style=STYLES[index];
  if(!p||!style)throw new Error('Unknown project or style');
  const interpretations={
    'naturalis-historia': [archiveCard,bbs,demo,viewdata,bookDesktop],
    gl4ss: [temporalCard,fieldBoard,eraDemo,timeService,timeDesktop],
    st3gg: [offAir,carrierBoard,hiddenDemo,decodeService,luna],
  };
  const output=interpretations[key][index](p,key);
  const still = '.secret-title{opacity:1}.carrier-lines{opacity:.08}.secret{opacity:.75}.hidden-layer{opacity:.7}.cursor{opacity:1}';
  const selectedStill = still.replaceAll(/(^|})(\.[a-z-]+)/g, '$1svg[data-motion="still"] $2');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-labelledby="title desc"><title id="title">${esc(p.display)} — ${esc(style.name)}</title><desc id="desc">${esc(output.description)}</desc><defs>${defsFont()}</defs><style>${output.css}\n@media(prefers-reduced-motion:reduce){*{animation:none!important}${still}}\nsvg[data-motion="still"] *{animation:none!important}${selectedStill}</style>${output.body}</svg>\n`;
}

export function headerMarkdown(key,index) {
  const p=PROJECTS[key]; const s=STYLES[index];
  const terminalText={
    'naturalis-historia': ['Plain-text board list',`${p.display}\n${p.boards.map(([board,type,desc,count])=>`${board.padEnd(10)} ${type.padEnd(6)} ${desc} [${count}]`).join('\n')}\n\n${p.comments.map(c=>`+ ${c}`).join('\n')}`],
    gl4ss: ['Plain-text field report','FIELD.LOG / GL4SS / ARTICLE 079\nAUTHOR: DIAL   BOARD: TIME.TRAVEL\nPLACE  BAY OF NAPLES\nYEAR   AD 79\nHOUR   AFTERNOON\n\n+ MAP:  Pick a place. Keep the coordinates.\n> TIME: Hold the frame. Turn the year.\n+ VIEW: The same coast, a different world.'],
    st3gg: ['Plain-text file area','FILE.AREA / ST3GG\nFILE          TYPE    ACTION\nCARRIER.PNG   IMAGE   INSPECT\nSIGNAL.WAV    AUDIO   LISTEN\nNOTE.TXT      TEXT    READ\nLAYER.DAT     DATA    COMPARE\n\n+ LAYER: One file. More than one reading.\n+ VIEW:  This screen is an original visual study.'],
  }[key];
  const textFallback=index===1?`\n<details>\n<summary>${terminalText[0]}</summary>\n\n\`\`\`text\n${terminalText[1]}\n\`\`\`\n\nThese comments and file names are illustrative.\n\n</details>\n`:'';
  return `<!-- ${s.slug}: ${s.id}. Generated by src/${s.slug}.mjs; edit tools/pliny-headers/projects.json or render.mjs. -->\n\n<p align="center">\n  <img src="assets/${s.slug}.svg" alt="${p.display}: ${s.name}. ${s.note}" width="960">\n</p>\n\n<h1 align="center">${p.display}</h1>\n\n<p align="center"><strong>${p.pitch}</strong></p>\n\n<p align="center">${p.facts.map(f=>`<code>${f}</code>`).join(' · ')}</p>\n\n<p align="center"><a href="${p.live}">Open the project</a> · <a href="${p.url}">Source repository</a></p>\n${textFallback}\n<!-- Unofficial README design study. Source descriptions checked 2026-10-05. Animation depicts an illustrative screen, not live project activity. -->\n`;
}

export function writeHeader(key,index) {
  const dir=path.join(ROOT,'examples',key);const s=STYLES[index];
  fs.mkdirSync(path.join(dir,'assets'),{recursive:true});
  fs.writeFileSync(path.join(dir,'assets',`${s.slug}.svg`),renderHeader(key,index));
  fs.writeFileSync(path.join(dir,`${s.slug}.md`),headerMarkdown(key,index));
  console.log(`wrote ${key}/${s.slug}`);
}
