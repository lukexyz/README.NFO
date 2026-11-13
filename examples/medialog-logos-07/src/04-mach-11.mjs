// Pinball dot-matrix book: a hardback drawn only in round orange plasma dots at three brightness levels, square
// to the dot grid: bright edges, a dim cover with a bright award star, its page block, a ribbon and a sparkle.
import {C,G,f,save} from './lib.mjs';
// Dim, lit and bright. On a dark page they glow; on a light page the order of strength holds, deepest orange brightest.
const LV=[null,'var(--l1)','var(--l2)','var(--l3)'];
const css='.dmd{--l1:#f2aa66;--l2:#ea7f1c;--l3:#c95200}@media(prefers-color-scheme:dark){.dmd{--l1:#b35300;--l2:#ff7a00;--l3:#ffc27a}}';
const PITCH=8,RAD=3.1,X0=48,Y0=56;// dot (0,0) is the cover's top-left corner
const COLS=16,ROWS=21;
const lv=new Map(),set=(i,j,l)=>lv.set(i+','+j,Math.max(l,lv.get(i+','+j)??0));
// Five-pointed star, tested at dot centres.
const sx=7.5,sy=7.8,star=[...Array(10)].map((_,k)=>{const a=-Math.PI/2+k*Math.PI/5,r=k%2?2.3:5.6;return [sx+r*Math.cos(a),sy+r*Math.sin(a)];});
const inStar=(x,y)=>{let c=false;for(let a=0,b=9;a<10;b=a++){const [xi,yi]=star[a],[xj,yj]=star[b];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){
 const edge=i===0||i===COLS-1||j===0||j===ROWS-1;
 set(i,j,edge||inStar(i,j)?3:i===2?2:1);
}
// Page block peeking out right and below, then a ribbon with a notched end.
for(let j=1;j<=ROWS;j++)set(COLS,j,2);
for(let i=1;i<=COLS;i++)set(i,ROWS,2);
for(let j=ROWS;j<ROWS+3;j++)for(let i=10;i<=12;i++)if(!(j===ROWS+2&&i===11))set(i,j,3);
// Award sparkle beside the top-right corner: bright centre, lit arms, dim tips.
for(const [i,j,l] of [[19,1,3],[18,1,2],[20,1,2],[19,0,2],[19,2,2],[21,1,1],[19,-1,1],[19,3,1]])set(i,j,l);
let dots='';
for(const [k,l] of lv){const [i,j]=k.split(',').map(Number);dots+=C(X0+PITCH*(i+.5),Y0+PITCH*(j+.5),RAD,LV[l]);}
const defs='<filter id="plasma" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
save(4,{icon:G(dots,'','class="dmd" filter="url(#plasma)"'),defs,css,name:'Extra chapter',description:'A hardback drawn only in round orange plasma dots: bright edges round a dim cover with a hinge line and a bright award star, its page block peeking out, a notched ribbon and a sparkle beside the corner.',choices:['The backbox display’s grid of round dots and stepped brightness draw a book, with dark gaps instead of a panel','A star on the cover and a sparkle are the award frame; no score digits or lettering']});
