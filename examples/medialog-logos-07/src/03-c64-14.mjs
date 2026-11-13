// Chip-music jukebox as a book: embossed grey metal pages on a brown-and-gold binding; the right page is a
// track list in green and blue with times set right, the selected tune on a red bar; the left page carries a
// raised title plate over a strip of rainbow blocks.
import {P,L,R,G,f,poly,save} from './lib.mjs';
const GX=120,GAP=3,OX=30,IT=98,IB=212,OT=90,OB=202;
const corners=s=>{const xi=GX+s*GAP,xo=GX+s*(GX-OX);return [[xi,IT],[xo,OT],[xo,OB],[xi,IB]];};
// u runs from the gutter (0) to the outer edge (1), t from the top (0) to the bottom (1).
const at=(s,u,t)=>{const [[xi],[xo]]=corners(s),top=IT+(OT-IT)*u,bot=IB+(OB-IB)*u;return [f(xi+(xo-xi)*u),f(top+(bot-top)*t)];};
// A band along a page between u0 and u1, centred on t, th thick.
const band=(s,u0,u1,t,th,fill)=>{const k=th/2/(IB-IT);return P(poly([at(s,u0,t-k),at(s,u1,t-k),at(s,u1,t+k),at(s,u0,t+k)]),fill);};
const GREEN='#2c8a46',BLUE='#2f5cc0',RED='#c8342a',CREAM='#f6f0e0';
// Track list: name from the gutter side, time set right; rows alternate green and blue; row 2 is selected.
const names=[.5,.38,.56,.3];
let list='';
names.forEach((n,i)=>{
 const t=.2+i*.2,ink=i%2?BLUE:GREEN;
 if(i===1)list+=band(1,.06,.94,t,15,RED);
 list+=band(1,.1,.1+n,t,6,i===1?CREAM:ink)+band(1,.76,.9,t,6,i===1?CREAM:ink);
});
const rainbow=['#d8352a','#f08a24','#f2cf3a','#4cb04a','#2f9fd0','#3d5bd8','#8a4fd0'];
let strip='';rainbow.forEach((c,i)=>strip+=band(-1,.8-i*.09,.8-(i+1)*.09+.012,.58,9,c));
// Raised title plate: the same grey lifted by a light top edge and a dark bottom edge.
const plate=band(-1,.16,.84,.27,30,'#c4c8d0')+band(-1,.16,.84,.27-13/114,3,'#ffffff')+band(-1,.16,.84,.27+13/114,3,'#7d8392');
const page=s=>P(poly(corners(s)),'url(#metal)');
const bevel=s=>{const [a,b,c,d]=corners(s);return L(`M${d}L${a}L${b}`,'#ffffff',3,'opacity=".85"')+L(`M${b}L${c}L${d}`,'#6f7584',3);};
const defs=`<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e5ea"/><stop offset="1" stop-color="#c3c7cf"/></linearGradient>`;
const cover='M120 104L24 96V212L120 222L216 212V96Z';
const icon=P(cover,'#6b4424','stroke="#2a1a0e" stroke-width="3" stroke-linejoin="round"')+L('M27 99V209M213 99V209','#d9a54e',3)
 +page(-1)+page(1)+bevel(-1)+bevel(1)
 +plate+strip+list
 +[-1,1].map(s=>P(poly(corners(s)),'none','stroke="#2a2e38" stroke-width="2.5" stroke-linejoin="round"')).join('');
save(3,{icon,defs,name:'Chapter select',description:'An open book with embossed grey metal pages on a brown-and-gold binding: the right page is a track list of chapters in green and blue with times set right and the selected one on a red bar, and the left page has a raised title plate over a strip of rainbow blocks.',choices:['The music disk’s menu of tunes becomes a contents page, so choosing a chapter looks like choosing a tune','Embossed grey, a red selection bar and a rainbow strip carry the 16-bit jukebox; the binding takes the brown and gold of the drawn cabinet']});
