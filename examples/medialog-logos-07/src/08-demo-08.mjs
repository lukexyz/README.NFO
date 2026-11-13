// Attribute-grid book: an open book in pixel art where colour may change only at the edges of 8 x 8 cells, one
// ink and one paper to a cell; outside the book the paper is empty. Where the red ribbon crosses the black text,
// the cells can hold only one ink, so the text beside the ribbon turns red: attribute clash. Cells either side of
// the gutter drop the bright bit, shading the pages in blocks.
import {R,G,save} from './lib.mjs';
const PX=4,X0=24,Y0=60,CW=6,CH=6,W=CW*8,H=CH*8;// one art pixel is one screen pixel at 203 x 74
const BRIGHT={k:'#000000',b:'#2443ff',r:'#ff2a1f',y:'#ffd93b'},DIM={k:'#000000',b:'#1b34c4',r:'#cc1f17',y:'#d6ad1f'};
const art=[...Array(H)].map(()=>Array(W).fill(null));
const put=(x,y,c)=>{if(x>=0&&x<W&&y>=0&&y<H)art[y][x]=c;};
// Page tops rise from the gutter inside the first two cell rows; page bottoms are flat on a cell edge, and the
// cover below them dips at the spine.
const top=x=>{const u=Math.min(Math.abs(x-23.5)/22,1);return Math.round(11-9*Math.sin(Math.PI*u*.7));};
for(let x=0;x<W;x++){
 for(let y=top(x);y<32;y++)put(x,y,'y');
 const g=Math.abs(x-23.5),low=g<4?2:g<10?1:0;
 for(let y=32;y<36+low;y++)put(x,y,'b');
}
for(let y=16;y<32;y++){put(23,y,'k');put(24,y,'k');}
// Text only in fully yellow cells: a short heading clear of the gutter's curve, then four lines, the last short.
for(const [y,a,b] of [[11,3,12],[17,3,20],[21,3,20],[25,3,20],[29,3,12]])for(let x=a;x<=b;x++){put(x,y,'k');put(47-x,y,'k');}
// Ribbon down the right page from under the top edge, across the cover and out below, with a notched end.
for(let y=16;y<46;y++)for(let x=34;x<=36;x++)if(!(y>=44&&x===35))put(x,y,'r');
// Per cell: empty pixels, if any, are the paper; otherwise the commonest colour is. The ribbon, where present,
// takes the ink; anything else that is not the paper becomes the ink.
let body='';
for(let cy=0;cy<CH;cy++)for(let cx=0;cx<CW;cx++){
 const n=new Map();
 for(let y=cy*8;y<cy*8+8;y++)for(let x=cx*8;x<cx*8+8;x++){const c=art[y][x];n.set(c,(n.get(c)||0)+1);}
 const order=[...n.entries()].sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
 const paper=n.has(null)?null:order[0],rest=order.filter(c=>c!==paper);
 const ink=rest.includes('r')?'r':rest[0];
 const pal=cx===2||cx===3?DIM:BRIGHT;
 for(let y=cy*8;y<cy*8+8;y++){
  let run=null;
  for(let x=cx*8;x<=cx*8+8;x++){
   const raw=x<cx*8+8?art[y][x]:undefined,c=raw===undefined?undefined:raw===paper?paper:ink;
   if(run&&c!==run.c){if(run.c)body+=R(X0+run.x*PX,Y0+y*PX,(x-run.x)*PX,PX,pal[run.c]);run=null;}
   if(!run&&c!==undefined)run={x,c};
  }
 }
}
save(8,{icon:G(body,'','shape-rendering="crispEdges"'),name:'Colour clash',description:'An open book in 8-bit pixel art on an attribute grid, one ink and one paper to each 8 × 8 cell: yellow pages with black lines of text on a blue cover, and a red ribbon whose cells turn the text beside it red; the cells either side of the gutter lose their bright bit, shading the pages in blocks.',choices:['Colour set per cell, not per pixel, so the ribbon clashes with the text it crosses, as sprites did on the hardware','No border, plasma or tile: the book stands alone, one screen pixel to each art pixel at 203 × 74']});
