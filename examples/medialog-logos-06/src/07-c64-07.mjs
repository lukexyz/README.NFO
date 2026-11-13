// Kefrens copper bars as a bookshelf: every spine is a vertical bar shaded in hard colour bands, dark at
// the edges and bright in the middle; later bars overlap earlier ones, and the last book leans in
// whole-pixel steps like a bar shifted one scanline at a time.
import {P,L,R,G,f,lg,save} from './lib.mjs';
const RAMPS={
 warm:['#3a0b06','#7d1d0b','#c4430f','#f08c26','#ffd46c','#fff4c8'],
 cool:['#071436','#123a8a','#1f6fd0','#3fb0f0','#9fe3ff','#f0fbff'],
 violet:['#1e0a3a','#4a1a8a','#7a3fd0','#a874f0','#d6b8ff','#f8f0ff'],
};
// Symmetric banded ramp across the bar: edge, ..., centre, ..., edge, each band a hard step.
const bar=(id,c)=>{const seq=[...c,...c.slice(0,-1).reverse()],n=seq.length;return lg(id,seq.flatMap((col,i)=>[[f(i/n),col],[f((i+1)/n),col]]),[0,0,1,0]);};
const defs=Object.entries(RAMPS).map(([k,c])=>bar(k,c)).join('');
const base=228;
const spines=[[36,32,130,'warm'],[66,30,156,'cool'],[94,34,122,'violet'],[126,31,146,'warm']];
const band=(x,w,y,c)=>R(x,y,w,4.5,c,'opacity=".8"');
let books='';
for(const [x,w,h,k] of spines){
 const top=base-h,edge=RAMPS[k][0];
 books+=R(x,top,w,h,`url(#${k})`)+band(x,w,top+12,edge)+band(x,w,top+20,edge)+band(x,w,base-18,edge);
}
// Leaning book: ten slices, each shifted a whole step left as it rises, until it rests on its neighbour.
const lw=30,lh=134,slices=10,step=2.4,lx=181;
let lean='';
for(let i=0;i<slices;i++){const y=base-(i+1)*lh/slices,x=lx-i*step;lean+=R(x,y,lw,lh/slices+.6,'url(#cool)');}
lean+=[base-18,base-lh+12,base-lh+20].map(y=>{const i=Math.min(slices-1,Math.floor((base-y)/(lh/slices)));return band(lx-i*step,lw,y,RAMPS.cool[0]);}).join('');
const shelf=L(`M28 ${base+5}H214`,'var(--ink)',7);
const icon=books+lean+shelf;
save(7,{icon,defs,name:'Copper shelf',description:'A row of book spines drawn as Kefrens copper bars: each spine shaded in hard bands, dark at the edges and bright in the centre, in red-gold, blue and violet ramps, with the last book leaning in whole-pixel steps.',choices:['Vertical copper bars with stepped ramps, overlapping as later bars do, become spines with a few dark bands','No big scroller and no black backdrop: just the shelf']});
