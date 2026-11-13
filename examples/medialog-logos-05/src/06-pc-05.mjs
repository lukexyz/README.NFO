// New old-school cracktro: a brushed-chrome clapperboard on a mirror floor, framed by two twister columns.
import {P,R,C,G,f,rr,lg,rim,save} from './lib.mjs';
const x0=20,y0=52,W=200,H=192,floor=184;
// Twister: horizontal slices of a rotating square ribbon; the visible faces swap as it turns.
function twister(cx,top,bottom,phase){
 let out='';const half=9,step=4;
 for(let y=top;y<bottom;y+=step){
  const a=phase+(y-top)*.055;
  const faces=[0,1,2,3].map(k=>{const t=a+k*Math.PI/2;return {x1:Math.sin(t)*half,x2:Math.sin(t+Math.PI/2)*half,k,light:Math.cos(t+Math.PI/4)};});
  for(const fc of faces){
   if(fc.x2<=fc.x1)continue;
   const shade=.35+.65*Math.max(0,fc.light);
   const col=fc.k%2?`rgba(196,71,61,${f(shade)})`:`rgba(246,227,184,${f(shade)})`;
   out+=R(cx+fc.x1,y,fc.x2-fc.x1,step+.6,col);
  }
 }
 return out;
}
// Clapperboard: striped arm hinged open above a striped bar and a chrome slate.
const stripes=(x,y,w,h,id)=>{let s='';for(let i=-1;i<8;i++)s+=P(`M${f(x+i*18)} ${y+h}L${f(x+i*18+10)} ${y}H${f(x+i*18+19)}L${f(x+i*18+9)} ${y+h}Z`,'#18223a');return G(R(x,y,w,h,'url(#chrome)')+s,'',`clip-path="url(#${id})"`);};
const board=G(
 G(stripes(70,98,106,16,'arm'),'rotate(-17 72 116)')
 +stripes(70,118,104,16,'bar')
 +R(70,136,104,48,'url(#chrome)','rx="3"')
 +R(80,148,84,3,'#18223a','opacity=".55"')+R(80,160,36,3,'#18223a','opacity=".55"')+R(126,160,38,3,'#18223a','opacity=".55"')+R(80,172,84,3,'#18223a','opacity=".55"')
 +C(76,116,4,'#d9dee8')+C(76,116,1.6,'#18223a'),'');
const defs=lg('chrome',[[0,'#f4f7fb'],[.42,'#aab4c4'],[.5,'#ffffff'],[.56,'#59647c'],[1,'#c9d0dc']])
 +lg('floor',[[0,'#1a2238'],[1,'#05070c']])
 +lg('fade',[[0,'#ffffff',.45],[.7,'#ffffff',0]])
 +`<mask id="reflect" maskUnits="userSpaceOnUse" x="0" y="${floor}" width="240" height="70"><rect x="0" y="${floor}" width="240" height="70" fill="url(#fade)"/></mask>`
 +`<clipPath id="bar"><rect x="70" y="118" width="104" height="16" rx="2"/></clipPath><clipPath id="arm"><rect x="70" y="98" width="106" height="16" rx="2"/></clipPath>`
 +`<clipPath id="stage"><path d="${rr(x0,y0,W,H,18)}"/></clipPath>`;
let stars='';
for(const [x,y,r] of [[64,70,1.6],[96,64,1.2],[150,72,1.8],[182,90,1.2],[118,84,1.2],[58,104,1.2],[172,64,1.2]])stars+=C(x,y,r,'#f6f3eb','opacity=".7"');
const icon=G(R(x0,y0,W,H,'#0a0d16')+stars+R(x0,floor,W,H-(floor-y0),'url(#floor)')
 +G(G(board,`translate(0 ${2*floor}) scale(1 -1)`),'','mask="url(#reflect)"')
 +twister(38,y0,y0+H,0)+twister(202,y0,y0+H,1.3)
 +R(x0,floor,W,1.6,'#9fb0c8','opacity=".6"'),'','clip-path="url(#stage)"')
 +board
 +P(rr(x0,y0,W,H,18),'none',`stroke="${rim}" stroke-width="3"`);
save(6,{icon,defs,name:'Final cut',description:'A brushed-chrome clapperboard stands on a glossy mirror floor between two cream-and-red twister columns, the cracktro centrepiece turned into a film mark.',choices:['The metal logo, mirror reflection and twisters of the 2000s cracktro revival frame a clapperboard instead of lettering','A chrome band with a white horizon gives the steel finish; red and cream twisters are the only colour']});
