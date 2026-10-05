import { svg, px, writeHeader } from './lib.mjs';

const colours=['#ff3b25','#23e5f0','#ffe82d','#78ed31','#ef39d8','#5b6cff','#ffab27','#21ebad'];
let diamonds='';
for(let r=0;r<2;r++) for(let c=0;c<4;c++) {
  const n=r*4+c,cx=133+c*229,cy=72+r*130;
  diamonds+=`<g transform="translate(${cx} ${cy})"><g class="outer" style="animation-delay:${-n*.6}s"><path d="M0-58 76 0 0 58-76 0Z" fill="${colours[n]}"/></g><g class="inner" style="animation-delay:${-n*.75}s"><path d="M0-33 43 0 0 33-43 0Z" fill="#000"/><path d="M0-18 23 0 0 18-23 0Z" fill="${colours[(n+3)%8]}"/></g></g>`;
}
let controls='';
const knobs=['GAIN L','GAIN R','COLOUR','CONTOUR','MODE'];
for(let i=0;i<5;i++) {
  const cx=305+i*67;
  controls+=`<circle cx="${cx}" cy="318" r="17" fill="#171819" stroke="#5e605f" stroke-width="2"/><circle cx="${cx}" cy="318" r="13" fill="#292c2c"/><path d="M${cx} 304v9" stroke="#f2edda" stroke-width="2"/>${px(knobs[i],cx-20,348,1.1,'#383b38')}`;
}
for(const [i,label] of ['TEXT','SVG','MIT'].entries()) {
  const x=664+i*89;
  controls+=`<rect x="${x}" y="305" width="76" height="28" fill="#8b8f85"/><rect x="${x+2}" y="307" width="72" height="24" fill="${i===1?'#35382f':'#f6f0d8'}" stroke="#393c35"/>${px(label,x+15,315,1.5,i===1?'#a4ff69':'#252923')}`;
}
const image=svg({height:380,background:'#000',
  css:'.outer{animation:left 12s steps(1) infinite}.inner{animation:right 9s steps(1) infinite}@keyframes left{0%,100%{transform:scale(.84)}8%{transform:scale(.65)}17%{transform:scale(.91)}25%{transform:scale(.72)}33%{transform:scale(1)}42%{transform:scale(.76)}50%{transform:scale(.88)}58%{transform:scale(.58)}67%{transform:scale(.82)}75%{transform:scale(.98)}83%{transform:scale(.67)}92%{transform:scale(.89)}}@keyframes right{0%,100%{transform:scale(.86)}13%{transform:scale(.54)}25%{transform:scale(.99)}38%{transform:scale(.72)}50%{transform:scale(.63)}63%{transform:scale(.95)}75%{transform:scale(.58)}88%{transform:scale(.8)}}',
  description:'Eight original two-part diamonds pulse on black in saturated TV colours. A cream control faceplate labels the project README.NFO, 152 styles, thirteen families, text and SVG.',
  body:`${diamonds}<rect y="280" width="960" height="100" fill="#d9d2ba"/><rect y="280" width="960" height="5" fill="#514e42"/>
  ${px('README.NFO',27,301,3.3,'#202822')}${px('RETRO HEADER VISUALISER',29,335,1.5,'#43473c')}${px('152 STYLES / 13 FAMILIES',29,355,1.4,'#43473c')}
  <path d="M271 293v74M642 293v74" stroke="#a59e87"/>${controls}
  ${px('PICK A LOOK / MAKE IT YOURS',665,350,1.2,'#383b38')}`
});
writeHeader(31,{image,summary:'Eight two-part TV diamonds pulse independently above an original cream visualiser faceplate.',alt:'Eight colourful pulsing diamonds over a cream README.NFO faceplate with five round knobs and text, SVG and MIT buttons.'});
