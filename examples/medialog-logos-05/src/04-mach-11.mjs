// Pinball dot-matrix display: a game controller drawn in round orange plasma dots, with three brightness levels.
import {R,C,rr,P,f,rim,save} from './lib.mjs';
const cols=25,rows=15,pitch=8,x0=20,y0=88,rad=3.1;
const LV=['#3a1a04','#a34c00','#ff7a00','#ffb867'];// unlit, dim, lit, bright
const inRR=(x,y,x1,y1,x2,y2,r)=>{const cx=Math.max(x1+r,Math.min(x,x2-r)),cy=Math.max(y1+r,Math.min(y,y2-r));return (x-cx)**2+(y-cy)**2<=r*r;};
function level(u,v){
 const body=inRR(u,v,3.5,2.6,20.5,8.6,2.6)||Math.hypot(u-6.7,v-9.2)<=3.3||Math.hypot(u-17.3,v-9.2)<=3.3;
 if(!body)return 0;
 const dpad=(Math.abs(u-7)<=1.6&&Math.abs(v-5.6)<=.6)||(Math.abs(u-7)<=.6&&Math.abs(v-5.6)<=1.6);
 const btn=Math.hypot(u-15.6,v-6.6)<=1||Math.hypot(u-17.9,v-4.7)<=1;
 const mid=(Math.abs(u-10.8)<=.5||Math.abs(u-13.2)<=.5)&&Math.abs(v-6)<=.4;
 if(dpad||btn||mid)return 0;
 if(v<=3.2)return 3;// top edge catches the light
 if(v>=10.6||(v>=9.6&&(u<4.5||u>19.5)))return 1;// grip undersides
 return 2;
}
let dots='';
for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
 const l=level(i,j);
 dots+=C(x0+pitch*(i+.5),y0+pitch*(j+.5),rad,LV[l]);
}
const defs='<filter id="plasma" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
const icon=P(rr(12,78,216,140,18),'#0d0704',`stroke="${rim}" stroke-width="3"`)
 +`<g filter="url(#plasma)">${dots}</g>`
 +R(24,84,192,1.5,'#ffffff','opacity=".1"');
save(4,{icon,defs,name:'Extra ball',description:'A game controller drawn in round orange plasma dots on a pinball backbox display, lit at three brightness levels with dark gaps between the dots.',choices:['The dot-matrix grid with visible unlit dots and stepped brightness carries the backbox look into a square-ish panel','A controller, not text or a score, makes it the games mark of the set']});
