// New old-school cracktro: a brushed-chrome hardback standing on a mirror floor, its spine a twister column of
// cream and red slices, with the book's reflection fading into the floor below.
import {P,L,R,G,f,rr,lg,save} from './lib.mjs';
const x0=62,y0=56,w=116,h=136,floor=y0+h,sw=30;// cover, floor line, spine width
// Twister: horizontal slices of a rotating square ribbon; the visible faces swap as it turns.
function twister(cx,top,bottom,phase,half=10.5){
 let out='';const step=3.5;
 for(let y=top;y<bottom;y+=step){
  const a=phase+(y-top)*.06;
  for(let k=0;k<4;k++){
   const t=a+k*Math.PI/2,x1=Math.sin(t)*half,x2=Math.sin(t+Math.PI/2)*half;
   if(x2<=x1)continue;
   const shade=.4+.6*Math.max(0,Math.cos(t+Math.PI/4));
   out+=R(cx+x1,y,x2-x1,step+.5,k%2?'#c4473d':'#f6e3b8',`fill-opacity="${f(shade)}"`);
  }
 }
 return out;
}
const cover=rr(x0,y0,w,h,[3,6,6,3]);
const book=
 P(rr(x0+9,y0-7,w,h,[3,6,6,3]),'#59647c')// back board
 +P(rr(x0+6,y0-4,w-1,h-2,[2,5,5,2]),'#f3efe4','stroke="#2a3142" stroke-width="2"')// page block
 +L(`M${x0+w+3} ${y0+6}V${y0+h-10}`,'#bdb6a6',1.6)
 +P(cover,'url(#chrome)')
 +R(x0,y0,sw,h,'#10141f')+G(twister(x0+sw/2,y0+2,y0+h-2,0),'','clip-path="url(#spine)"')
 +R(x0+sw,y0,1.8,h,'#ffffff','opacity=".5"')
 +R(x0+sw+8,y0+5,w-sw-14,1.6,'#ffffff','opacity=".7"')
 +P(cover,'none','stroke="#2a3142" stroke-width="3" stroke-linejoin="round"');
const defs=lg('chrome',[[0,'#f4f7fb'],[.4,'#a9b3c3'],[.48,'#ffffff'],[.53,'#55607a'],[.75,'#8e99ad'],[1,'#d3d9e3']])
 +lg('fade',[[0,'#ffffff',.42],[.75,'#ffffff',0]])
 +`<mask id="reflect" maskUnits="userSpaceOnUse" x="0" y="${floor}" width="240" height="70"><rect x="0" y="${floor}" width="240" height="70" fill="url(#fade)"/></mask>`
 +`<clipPath id="spine"><rect x="${x0}" y="${y0}" width="${sw}" height="${h}"/></clipPath>`;
const icon=G(G(book,`translate(0 ${2*floor}) scale(1 -1)`),'','mask="url(#reflect)"')
 +L(`M${x0-22} ${floor+1}H${x0+w+30}`,'var(--blue)',2,'opacity=".6"')
 +book;
save(6,{icon,defs,name:'Twisted spine',description:'A brushed-chrome hardback stands on a glossy mirror floor, its spine a twister column of cream and red slices, with its reflection fading into the floor below.',choices:['The cracktro’s metal logo, twister and mirror floor become one book: chrome boards, a twisting spine and a reflection','The twister’s cream and red are the only colour against the steel']});
