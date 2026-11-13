// Light-synth book: the cursor has traced an open book, mirrored across the gutter, and every seed along its
// trail has expanded outward in chunky cells through the colour sequence, so the outline glows in rainbow ripples.
import {R,G,save} from './lib.mjs';
const CELL=8,GX=120,GY=148;// cell (i, j) is centred on (GX + 8i, GY + 8j); i = 0 is the gutter
const SEQ=['#f5a524','#e8623a','#a64fc9','#4f63d8'];// newest to oldest; no pale first step, so it holds on white
// The left page by column |i| = 0..10: top and bottom rows of its outline. The right page mirrors it.
const TOP=[-3,-4,-4,-5,-5,-5,-5,-5,-5,-4,-4],BOT=[8,8,8,7,7,7,7,7,7,7,7];
const key=(i,j)=>i+','+j,trail=new Set(),inside=new Set();
const mark=(i,j)=>{trail.add(key(i,j));trail.add(key(-i,j));};
for(let c=0;c<=10;c++){
 const p=Math.max(c-1,0);
 for(let j=Math.min(TOP[c],TOP[p]);j<=Math.max(TOP[c],TOP[p]);j++)mark(c,j);// top edge, joined across steps
 for(let j=Math.min(BOT[c],BOT[p]);j<=Math.max(BOT[c],BOT[p]);j++)mark(c,j);// bottom edge
 if(c===0||c===10)for(let j=TOP[c];j<=BOT[c];j++)mark(c,j);// gutter and outer edge
}
for(let c=1;c<10;c++)for(let j=TOP[c]+1;j<BOT[c];j++)for(const s of [1,-1])if(!trail.has(key(s*c,j)))inside.add(key(s*c,j));
// Lines of text on each page, one cell high; the last line of the paragraph is short.
const text=new Set();
for(const [j,a,b] of [[-1,2,8],[1,2,8],[3,2,8],[5,5,8]])for(let c=a;c<=b;c++){text.add(key(c,j));text.add(key(-c,j));}
// Ripples: breadth-first from the trail, outward only (diamond-shaped rings, as on the original).
const d=new Map([...trail].map(k=>[k,0])),q=[...trail].map(k=>k.split(',').map(Number));
for(let h=0;h<q.length;h++){const [i,j]=q[h],v=d.get(key(i,j));if(v>=3)continue;
 for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=key(i+a,j+b);if(!d.has(k)&&!inside.has(k)){d.set(k,v+1);q.push([i+a,j+b]);}}}
// The oldest ring is fading: only every other cell is still lit.
let body='';
const cell=(i,j,c)=>R(GX+i*CELL-CELL/2+.6,GY+j*CELL-CELL/2+.6,CELL-1.2,CELL-1.2,c);
for(const [k,v] of d){const [i,j]=k.split(',').map(Number);if(v===3&&(i+j)%2)continue;body+=cell(i,j,SEQ[v]);}
for(const k of text){const [i,j]=k.split(',').map(Number);body+=cell(i,j,SEQ[0]);}
save(7,{icon:G(body),name:'Light reading',description:'An open book traced by a light synthesizer: the trail is mirrored across the gutter, and every seed along it has expanded outward in chunky cells through amber, orange-red, violet and a fading blue, so the outline glows in rainbow ripples round clear pages and amber lines of text.',choices:['The light synth’s mirrored, expanding seeds draw the book itself: the trail is the outline, the ripples its glow','Mirror symmetry about the gutter replaces the four-fold mandala, and there is no black screen or tile']});
