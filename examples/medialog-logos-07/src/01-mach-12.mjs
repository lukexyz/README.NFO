// Vacuum-fluorescent book: two smoked-glass pages whose lines of text are rows of hexagonal segments, lit
// teal up to the reading position and faintly visible beyond it, with an orange bookmark annunciator.
import {P,G,f,poly,lg,save} from './lib.mjs';
const LIT='#8ff5dc',ORANGE='#ff9a3d',GLASS='#071416';
// Each page edge is a quadratic curve: inner end at the gutter, control point, outer end. Offsets are from the gutter.
const GX=120,IN=[4,104],CT=[40,86],OUT=[90,96],H=110;
const pt=(s,[dx,dy],t)=>[GX+s*dx,dy+t*H];
const bez=(s,t,u)=>{const [a,b,c]=[IN,CT,OUT].map(q=>pt(s,q,t));const m=1-u;return [m*m*a[0]+2*m*u*b[0]+u*u*c[0],m*m*a[1]+2*m*u*b[1]+u*u*c[1]];};
const tan=(s,t,u)=>{const [a,b,c]=[IN,CT,OUT].map(q=>pt(s,q,t));return [2*(1-u)*(b[0]-a[0])+2*u*(c[0]-b[0]),2*(1-u)*(b[1]-a[1])+2*u*(c[1]-b[1])];};
const page=s=>{const [a,b,c]=[IN,CT,OUT].map(q=>pt(s,q,0)),[d,e,g]=[IN,CT,OUT].map(q=>pt(s,q,1));return `M${a}Q${b} ${c}L${g}Q${e} ${d}Z`;};
// Hexagonal segment centred on c along direction v, len long and th thick.
function seg([cx,cy],[vx,vy],len,th){
 const d=Math.hypot(vx,vy),ux=vx/d,uy=vy/d,nx=-uy,ny=ux,h=len/2,k=th/2;
 const p=(a,b)=>[cx+ux*a+nx*b,cy+uy*a+ny*b];
 return poly([p(-h,0),p(-h+k,-k),p(h-k,-k),p(h,0),p(h-k,k),p(-h+k,k)]);
}
const ROWS=[.2,.4,.6,.8],COLS=[.17,.39,.61,.83];
// Left page read; on the right page the reading position is halfway along the third line. Lines end raggedly:
// the left page's paragraph ends short, and the right page's first line leaves room for the bookmark annunciator.
const lit=(s,r,c)=>s<0||r<2||(r===2&&c<2);
const gone=(s,r,c)=>(s<0&&r===3&&c===0)||(s>0&&r===0&&c===3);// u runs from the gutter outward, so a left-page line ends at c=0
let on='',ghost='';
for(const s of [-1,1])ROWS.forEach((t,r)=>COLS.forEach((u,c)=>{
 if(gone(s,r,c))return;
 const d=seg(bez(s,t,u),tan(s,t,u),17,7);
 ghost+=P(d,LIT);if(lit(s,r,c))on+=P(d,LIT);
}));
const mark=P('M184 102H195V124L189.5 119L184 124Z',ORANGE);
const cover='M120 110Q80 92 24 102V214Q80 206 120 224Q160 206 216 214V102Q160 92 120 110Z';
const pages=[-1,1].map(s=>page(s));
const defs=lg('glass',[[0,'#ffffff',.14],[.45,'#ffffff',0]],[0,0,.5,1])
 +'<filter id="vfd" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
const icon=P(cover,'var(--rim)')
 +pages.map(d=>P(d,GLASS)).join('')
 +G(ghost,'','opacity=".1"')+G(on+mark,'','filter="url(#vfd)"')
 +pages.map(d=>P(d,'url(#glass)')+P(d,'none','stroke="var(--rim)" stroke-width="2.5" stroke-linejoin="round"')).join('');
save(1,{icon,defs,name:'Now reading',description:'An open book with smoked-glass pages, its lines of text drawn as rows of hexagonal fluorescent segments: lit teal up to the reading position halfway down the right page and faintly visible beyond it, with an orange bookmark annunciator.',choices:['The display’s ghosted unlit segments become the unread part of the page, so the book shows how far you have got','One orange annunciator, a bookmark, is the only second colour; no digits or lettering']});
