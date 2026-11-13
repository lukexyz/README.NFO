// Off-air hardback: a book standing in three-quarter view whose cover is a broadcast test pattern, seven
// colour bars over a strip of castellations and a black-level band, with its cream page edges turned to us.
import {P,L,R,G,f,poly,save} from './lib.mjs';
// Corners: cover top-left (hinge side), cover top-right (front corner), fore-edge top-right (back); all 150 high.
const CL=[50,72],CR=[154,92],FR=[184,78],HT=150;
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],dn=(p,k=HT)=>add(p,[0,k]);
const A=sub(CR,CL),D=sub(FR,CR),top=(u,v)=>add(add(CL,A,u),D,v);
// Flat cover art, w x h, mapped onto the cover face.
const w=112,h=166;
const bars=['#c9c6bd','#d8b450','#5fae9f','#67a157','#93608c','#c4473d','#3d5fae'];// 75 % bars in brand-friendly tones
const castle=['#3d5fae','#10141f','#93608c','#10141f','#5fae9f','#10141f','#c9c6bd'];
const bw=w/7,tb=h*.6,mb=h*.08,by=tb+mb,bh=h-by;
let art='';
bars.forEach((c,i)=>art+=R(i*bw,0,bw+.4,tb,c));
castle.forEach((c,i)=>art+=R(i*bw,tb,bw+.4,mb,c));
art+=R(0,by,w,bh,'#0c0f18')+R(0,by,bw*1.25,bh,'#1d2c55')+R(bw*1.25,by,bw*1.25,bh,'#f6f3eb')+R(bw*2.5,by,bw*1.25,bh,'#3b2a5c')
 +R(bw*5,by,bw*.33,bh,'#05070c')+R(bw*5.66,by,bw*.33,bh,'#1a2030');
const m=[A[0]/w,A[1]/w,0,HT/h,CL[0],CL[1]].map(f).join(' ');
const coverFace=poly([CL,CR,dn(CR),dn(CL)]);
const defs=`<clipPath id="cover"><path d="${coverFace}"/></clipPath>`;
const edge='stroke="var(--rim)" stroke-width="3.5" stroke-linejoin="round"';
// Fore-edge: boards at either side, cream page block set in from the head and tail, with page lines.
const fe=(u,k)=>add(add(CR,D,u),[0,k]);
const foreEdge=poly([CR,FR,dn(FR),dn(CR)]);
const block=poly([fe(.16,5),fe(.84,5),fe(.84,HT-5),fe(.16,HT-5)]);
let pageLines='';for(let k=22;k<HT-12;k+=16)pageLines+=`M${fe(.2,k)}L${fe(.8,k)}`;
// Top: boards round a cream page block.
const tops=poly([top(.05,.16),top(.96,.16),top(.96,.84),top(.05,.84)]);
const icon=
 P(foreEdge,'var(--rim)',edge)+P(block,'#f6f3eb')+L(pageLines,'#c9c1ae',1.6)
 +P(poly([CL,CR,FR,top(0,1)]),'var(--rim)',edge)+P(tops,'#f6f3eb')
 +G(G(art,`matrix(${m})`),'','clip-path="url(#cover)"')
 +L(`M${add(CL,A,.085)}L${dn(add(CL,A,.085))}`,'#05070c',2.5,'opacity=".4"')// hinge groove
 +P(coverFace,'none',edge);
save(2,{icon,defs,name:'Test card',description:'A hardback standing in three-quarter view whose cover is a broadcast test pattern: seven colour bars over a strip of castellations and a black-level band with its white square, its cream page edges turned toward you.',choices:['The colour bars that fill the screen after closedown fill a book cover instead, so the symbol is a book first and television second','Bars are pulled toward ochre, teal, plum and brick to keep clear of neon cyan and magenta; no station box or lettering']});
