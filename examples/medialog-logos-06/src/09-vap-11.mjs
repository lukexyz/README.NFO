// Classic Mac OS, 1-bit: an open book drawn as a Kare-style bitmap icon in black and white only, greys
// made from a checker dither, a hard drop shadow and the arrow pointer. Each icon pixel is exactly two
// screen pixels at 203 x 74, so the bitmap stays crisp.
import {P,save} from './lib.mjs';
const K='#000000',Wt='#ffffff',S=8,X0=24,Y0=84,COLS=24;
// The left page column by column (cols 1-11, gutter at 11): top and bottom rows of its outline. The right
// page mirrors it. Pages rise toward the outer corners and dip into the gutter; the cover shows below them.
const TOP=[0,1,0,0,0,0,1,1,1,2,2,3],BOT=[0,13,13,13,13,14,14,14,14,15,15,15];
const cell=new Map();// key "x,y" -> 'k' ink, 'w' paper, 'd' dither
const put=(x,y,v)=>{cell.set(x+','+y,v);cell.set((COLS-1-x)+','+y,v);};
for(let c=1;c<=11;c++){
 for(let y=TOP[c];y<=BOT[c];y++)put(c,y,(y===TOP[c]||y===BOT[c]||c===1||c===11)?'k':'w');
 // Cover below the pages: a dithered band with an ink bottom edge.
 put(c,BOT[c]+1,'d');put(c,BOT[c]+2,'k');
}
for(let y=2;y<=15;y++)put(0,y,'k');
put(1,14,'d');put(1,15,'k');
// Three lines of words on each page.
const words={4:[[3,6],[8,9]],7:[[3,8]],10:[[3,5],[7,9]]};
for(const [y,runs] of Object.entries(words))for(const [p,q] of runs)for(let x=p;x<=q;x++)put(x,+y,'k');
for(const [key,v] of cell)if(v==='d'){const [x,y]=key.split(',').map(Number);cell.set(key,(x+y)%2?'k':'w');}
const sq=(x,y,s=S,ox=X0,oy=Y0)=>`M${ox+x*s} ${oy+y*s}h${s}v${s}h-${s}z`;
let ink='',paper='',shadow='';
for(const [key,v] of cell){const [x,y]=key.split(',').map(Number);if(v==='k')ink+=sq(x,y);else paper+=sq(x,y);shadow+=sq(x+1,y+1);}
// Arrow pointer at half the pixel size: one screen pixel per bitmap pixel.
const ARROW=['#','##','#.#','#..#','#...#','#....#','#.....#','#......#','#...####','#..#','#.#','##'];
let aInk='',aPaper='';ARROW.forEach((row,y)=>[...row].forEach((ch,x)=>{const d=sq(x,y,4,180,176);if(ch==='#')aInk+=d;else aPaper+=d;}));
const icon=P(shadow,K)+P(paper,Wt)+P(ink,K)+P(aPaper,Wt)+P(aInk,K);
save(9,{icon,name:'Read me',description:'An open book as a 1-bit Kare-style icon: black outlines on white pages, words as runs of black pixels, checker-dithered grey for the cover, a hard black drop shadow and the arrow pointer resting on a page.',choices:['Black and white only: every grey is a dither, and the shadow is a hard offset with no blur','Each icon pixel is exactly two screen pixels at the native 203 × 74 size, so the bitmap stays crisp']});
