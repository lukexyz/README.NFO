// Published DTMF frequencies as a decorative, silent dual-tone instrument.
import {svg,px,center,writeHeader} from './lib.mjs';
const rows=[697,770,852,941],cols=[1209,1336,1477,1633],keys=['123A','456B','789C','*0#D'];
const seq=['1','5','2','1','3'];
let pad='',css='',bars='';
for(let r=0;r<4;r++)for(let c=0;c<4;c++){
 const x=90+c*69,y=166+r*48,key=keys[r][c];
 pad+=`<g><rect x="${x}" y="${y}" width="57" height="35" rx="4" fill="#0d2340"/>
 <rect x="${x}" y="${y-3}" width="57" height="35" rx="4" fill="#d9e0dd" stroke="#f7f9eb"/>
 <rect class="key k${r}${c}" x="${x}" y="${y-3}" width="57" height="35" rx="4" fill="#ffbd54"/>${px(key,x+21,y+5,2.5,'#10283e')}</g>`;
 const slots=seq.flatMap((v,i)=>v===key?[i]:[]);
 if(slots.length){
  bars+=`<g class="key k${r}${c}"><rect x="80" y="${y+9}" width="283" height="5" fill="#ffbd54" opacity=".65"/><rect x="${x+26}" y="154" width="5" height="191" fill="#ffbd54" opacity=".65"/></g>`;
  const stops=slots.flatMap(i=>[`${i*14}%{opacity:1}`,`${i*14+11}%{opacity:0}`]);
  css+=`.k${r}${c}{animation:key${r}${c} 8s steps(1) infinite}@keyframes key${r}${c}{0%{opacity:0}${stops.join('')}99%,100%{opacity:0}}`;
 }
}
for(let r=0;r<4;r++)pad+=px(String(rows[r]),40,175+r*48,1.3,'#94b9ce');
for(let c=0;c<4;c++)pad+=px(String(cols[c]),96+c*69,141,1.15,'#94b9ce');
const wave=(f,g,y,amp=17)=>Array.from({length:440},(_,i)=>`${442+i},${(y+amp*Math.sin(2*Math.PI*f*i/36000)+(g?amp*Math.sin(2*Math.PI*g*i/36000):0)).toFixed(2)}`).join(' ');
let scopes='',readout=px('DIAL:',63,372,1.6,'#ffc46b');
for(const [n,key] of ['1','5','2','3'].entries()){
 const r=keys.findIndex(row=>row.includes(key)),c=keys[r].indexOf(key),lo=rows[r],hi=cols[c];
 const stops=seq.map((value,i)=>`${i*14}%{opacity:${value===key?1:0}}`).join('');
 css+=`.tone${n}{opacity:${n?0:1};animation:tone${n} 8s steps(1) infinite}@keyframes tone${n}{${stops}100%{opacity:${key==='3'?1:0}}}`;
 scopes+=`<g class="tone${n}">`+px(`ROW / ${lo} HZ`,451,146,1.2,'#6dd9a7')+px(`COL / ${hi} HZ`,451,209,1.2,'#c8d598')+
 `<polyline points="${wave(lo,0,183)}" fill="none" stroke="#5bf6b1" stroke-width="1.7"/><polyline points="${wave(hi,0,245)}" fill="none" stroke="#d2ed89" stroke-width="1.7"/><polyline class="sum" points="${wave(lo,hi,314,13)}" fill="none" stroke="#bcffd7" stroke-width="2"/></g>`;
}
for(const [i,digit]of seq.entries()){
 const x=127+i*16+(i>2?18:0);
 readout+=px(digit,x,372,1.6,'#ffc46b',`class="digit${i}"`);
 if(i)css+=`.digit${i}{animation:digit${i} 8s steps(1) infinite}@keyframes digit${i}{0%{opacity:0}${i*14}%{opacity:1}100%{opacity:1}}`;
}
readout+=px('/',174,372,1.6,'#ffc46b');
const image=svg({height:426,background:'#080f1e',defs:'<linearGradient id="case" x2="0" y2="1"><stop stop-color="#2a6295"/><stop offset="1" stop-color="#122c51"/></linearGradient><pattern id="scopeGrid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0v22" fill="none" stroke="#143a2c"/></pattern>',css:'.key{opacity:0}.k00{opacity:1}.sum{stroke-dasharray:3 0;animation:scope 4s linear infinite}@keyframes scope{50%{transform:translateY(-2px)}}'+css,
title:'README.NFO — dual-tone pad',description:'A blue retro keypad with sixteen keys, row and column frequencies, and two real sine waves plus their summed trace. The decorative readout dials 152 styles and 13 families without audio.',body:
'<rect x="20" y="20" width="920" height="386" rx="22" fill="url(#case)" stroke="#5d8fad"/>'+center('README.NFO',42,5,'#eef2e7')+
center('PUBLIC FILES / SILENT DUAL-TONE EDITION',89,1.6,'#b3cbd9')+
'<rect x="422" y="133" width="480" height="225" rx="8" fill="#06170f" stroke="#7b9e8d"/><rect x="432" y="143" width="460" height="205" fill="url(#scopeGrid)"/>'+bars+pad+scopes+
px('SUM / TWO TONES',451,272,1.2,'#aee0c7')+
'<rect x="46" y="365" width="854" height="24" rx="4" fill="#071526"/>'+readout+px('STYLES / FAMILIES / TEXT + SVG / MIT',401,372,1.5,'#a7bbcb')});
writeHeader(18,{image,summary:'A blue tone pad, sixteen ivory keys and real dual-frequency scope traces; it silently dials 152 / 13.'});
