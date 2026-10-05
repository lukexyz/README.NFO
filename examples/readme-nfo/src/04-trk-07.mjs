import { svg, px, writeHeader } from './lib.mjs';

const voices = ['PULSE 1','PULSE 2','TRIANGLE','NOISE','FM'];
const modules = ['TEXT','SVG','STYLES','GALLERY','TOOLS'];
const colours = ['#5be8a0','#68ceff','#c5e978','#ffb0db','#bba6ff'];
let body = `<rect x="12" y="12" width="936" height="366" rx="5" fill="#121b25" stroke="#425163"/>${px('README.NFO',30,27,4,'#fff2ce')}${px('CHIP HEADER COLLECTION',294,40,1.5,'#8ea0b1')}${px('152 STYLES / 13 FAMILIES / MIT',628,32,1.5,'#b5c9d9')}<path d="M24 68H936" stroke="#425163"/>`;
body += `<rect x="24" y="82" width="134" height="278" fill="#09121a" stroke="#394b59"/>${px('ORDER',34,94,2,'#d4e693')}`;
for(let row=0;row<8;row++) body += `${row===2?'<rect x="30" y="164" width="122" height="24" fill="#31535d"/>':''}${px(String(row).padStart(2,'0'),34,128+row*20,1.5,row===2?'#f6f8c9':'#6b8492')}${px(`${row.toString(16).toUpperCase().padStart(2,'0')} ${((row+1)%8).toString(16).toUpperCase().padStart(2,'0')} 00`,69,128+row*20,1.5,row===2?'#ffc15c':'#80ba88')}`;
body+=px('TEMPO  140',34,309,1.5,'#7aa3b8')+px('SPEED  06',34,331,1.5,'#7aa3b8');
let scopes='';
for(let i=0;i<5;i++) {
  const x=178+i*120;
  body+=`<rect x="${x}" y="82" width="112" height="40" fill="#1d2d36" stroke="#435765"/>${px(modules[i],x+10,91,1.8,'#edc983')}${px(voices[i],x+10,111,1,'#7e9aab')}`;
  body+=`<rect x="${x}" y="126" width="112" height="5" fill="#243746"/><rect class="meter" x="${x}" y="126" width="102" height="5" fill="${colours[i]}" style="animation-delay:-${i*.43}s;transform-origin:${x}px 128px"/>`;
  body+=`<rect x="${x}" y="140" width="112" height="218" fill="#070f15" stroke="#2d3d49"/>`;
  for(let r=0;r<12;r++) {
    const y=150+r*17;
    if(r%4===0) body+=`<rect x="${x+1}" y="${y-3}" width="110" height="16" fill="#14212b"/>`;
    const notes=['C-4','E-4','G-4','A-4','---','D-5','C-5','---','G-4','E-4','---','C-4'];
    const note=notes[(r+i*2)%notes.length];
    body+=px(note,x+7,y,1.5,note==='---'?'#34454f':colours[i])+px(`0${i+1}`,x+42,y,1.5,'#679ce0')+px((r%3===0?'F06':'...'),x+67,y,1.5,r%3===0?'#e794d4':'#33434e');
  }
  const sy=92+i*52;
  scopes+=`<rect x="798" y="${sy}" width="130" height="44" rx="3" fill="#071419" stroke="#314d58"/>${px(voices[i],806,sy+4,1,'#91b7b4')}<g clip-path="url(#scope-${i})"><path class="wave" d="${wave(i,804,sy+28)}" fill="none" stroke="${colours[i]}" stroke-width="1.4" style="animation-duration:${1.5+i*.3}s"/></g>`;
}
body+=`<rect class="play" x="178" y="214" width="592" height="17" fill="#b6e1ef" fill-opacity=".1" stroke="#c4e8f1" stroke-opacity=".5"/>${scopes}${px('PLAY',806,355,1.5,'#bce67c')}${px('00:32',864,355,1.5,'#8ba7b1')}`;
function wave(i,x,y){let d=`M${x} ${y}`;for(let n=0;n<240;n+=3){const v=i<2?(Math.floor(n/12)%2?8:-8):i===2?Math.abs((n%36)-18)*.8-7:i===3?((n*17%19)-9):Math.sin(n/8)*6+Math.sin(n/3)*2;d+=`L${x+n} ${(y+v).toFixed(1)}`;}return d;}
const image=svg({width:960,height:390,background:'#050a10',body,
  defs:Array.from({length:5},(_,i)=>`<clipPath id="scope-${i}"><rect x="802" y="${92+i*52+17}" width="122" height="24"/></clipPath>`).join(''),
  title:'README.NFO — five-channel tracker',description:'A five-channel tracker pattern named for text, SVG, styles, galleries and tools. Colour-coded notes, order list, level meters and moving chip waveforms.',
  css:'.meter{animation:level 1.6s steps(6) infinite}.wave{animation:wave 2s linear infinite}.play{animation:row 8s steps(12) infinite}@keyframes level{0%,100%{transform:scaleX(.9)}25%{transform:scaleX(.48)}50%{transform:scaleX(.74)}75%{transform:scaleX(.58)}}@keyframes wave{to{transform:translateX(-36px)}}@keyframes row{0%{transform:translateY(-68px)}100%{transform:translateY(119px)}}',
});
writeHeader(4,{image,summary:'Five colour-coded chip channels for text, SVG, styles, galleries and tools, with a pattern grid and live scopes.',alt:'README.NFO as a five-channel chiptune tracker, with colour-coded notes and oscilloscope traces.'});
