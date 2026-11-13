// Netlabel cassette: a navy shell with an obi-strip label, ruled like a diary page, and reels that keep turning.
import {P,R,C,G,f,lg,rim,save} from './lib.mjs';
function hub(cx,cy,cls){
 let teeth='';
 for(let k=0;k<6;k++)teeth+=R(-2.6,-10.5,5.2,5,'#18223a',`transform="rotate(${k*60})"`);
 return G(G(C(0,0,11,'#f6f3eb')+C(0,0,6.6,'#18223a')+teeth,'',`class="${cls}"`),`translate(${cx} ${cy})`);
}
// An original block "A" for side A, drawn as a path.
const A='M37 160L44 128H51L58 160H51.5L50 152H45L43.5 160ZM46 146H49L47.5 137Z';
const icon=P('M30 80H210A14 14 0 0 1 224 94V204A14 14 0 0 1 210 218H30A14 14 0 0 1 16 204V94A14 14 0 0 1 30 80Z','var(--tile)',`stroke="${rim}" stroke-width="3"`)
 +P('M62 218L72 194H168L178 218Z','#26345a')+C(98,207,4.5,'#0c1222')+C(142,207,4.5,'#0c1222')
 +[[28,92],[212,92],[28,206],[212,206]].map(([x,y])=>C(x,y,3.4,'#3d4c72')).join('')
 +R(30,92,180,92,'#f6f3eb','rx="6"')
 +P('M30 98A6 6 0 0 1 36 92H60V184H36A6 6 0 0 1 30 178Z','#c4473d')+P(A,'#f6f3eb')
 +R(36,99,18,3,'#f6f3eb','opacity=".75"')+R(36,105,12,3,'#f6f3eb','opacity=".75"')
 +R(70,103,128,4,'#9aa9bc')+R(70,113,92,4,'#9aa9bc')+R(168,113,30,4,'#ae8660')
 +R(72,124,128,48,'#0c1222','rx="24"')
 +'<circle cx="104" cy="148" r="20" fill="#5b4334"><animate attributeName="r" values="20;14;20" dur="80s" repeatCount="indefinite"/></circle>'
 +'<circle cx="168" cy="148" r="14" fill="#5b4334"><animate attributeName="r" values="14;20;14" dur="80s" repeatCount="indefinite"/></circle>'
 +R(72,124,128,48,'url(#glass)','rx="24"')
 +hub(104,148,'reel')+hub(168,148,'reel fast')
 +R(124,138,24,20,'#26345a','rx="3"');
const defs=lg('glass',[[0,'#ffffff',.16],[.45,'#ffffff',0],[1,'#ffffff',0]]);
const css='.reel{transform-box:fill-box;transform-origin:center;animation:spin 3.2s linear infinite}.fast{animation-duration:2.4s}@keyframes spin{to{transform:rotate(360deg)}}';
save(3,{icon,defs,css,name:'Side A',description:'A navy cassette with an obi-strip label ruled like a diary page; the reels keep turning and the tape slowly winds from one side to the other.',choices:['The netlabel J-card becomes a cream label with a signal-red obi strip and a drawn side-A mark','Ruled label lines and a tan underline make the tape a mixtape journal, not a music-only mark'],motion:'Reels turn continuously; the tape packs swap size over forty seconds.'});
