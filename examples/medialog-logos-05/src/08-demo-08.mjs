// Attribute-grid joystick: a ball-top stick drawn in pixels, coloured only per 8 x 8 cell, over a chunky
// two-blue plasma inside a coloured border. Where the ball meets the shaft, the cell takes one ink: attribute clash.
import {P,R,G,f,rr,rim,save} from './lib.mjs';
const px=5,cellPx=4,cells=8,ox=40,oy=72;// 32 x 32 pixels in 8 x 8 cells; each cell is 20 units
const INK={red:'#ff3b30',white:'#ffffff',yellow:'#ffd23f',blue:'#3557e0'};
const art=[
 '................................',
 '.............######.............',
 '...........##########...........',
 '..........###...######..........',
 '..........##.....#####..........',
 '.........####...#######.........',
 '.........##############.........',
 '..........############..........',
 '..........############..........',
 '...........##########...........',
 '.............######.............',
 '...............##...............',
 '...............##...............',
 '...............##...............',
 '...............##...............',
 '...............##...............',
 '...............##...............',
 '...............##...............',
 '.......###.....##...............',
 '......#####....##...............',
 '......#####..######.............',
 '.......###..########............',
 '....########################....',
 '...##########################...',
 '...##########################...',
 '...##########################...',
 '...##########################...',
 '....########################....',
 '................................',
 '................................',
 '................................',
 '................................',
];
// One ink per cell, chosen by what the cell mostly holds.
const inkFor=(ci,cj)=>{
 if(cj<=2)return INK.red;// the ball
 if(cj<=4&&ci>=3&&ci<=4)return INK.white;// the shaft
 if(cj===4&&ci<=2)return INK.red;// fire button
 return INK.yellow;// base
};
// Paper: a cell-resolution plasma in two blues and black.
const plasma=(ci,cj)=>{const v=Math.sin(ci*.9)+Math.sin(cj*.8+1)+Math.sin((ci+cj)*.55);return v>1?'#2a46c9':v>-.4?'#14216b':'#060a20';};
let body='';
for(let cj=0;cj<cells;cj++)for(let ci=0;ci<cells;ci++){
 const x=ox+ci*cellPx*px,y=oy+cj*cellPx*px;
 body+=R(x,y,cellPx*px,cellPx*px,plasma(ci,cj));
 const ink=inkFor(ci,cj);
 for(let j=0;j<cellPx;j++)for(let i=0;i<cellPx;i++)if(art[cj*cellPx+j][ci*cellPx+i]==='#')body+=R(x+i*px,y+j*px,px+.2,px+.2,ink);
}
// Border with two raster stripes, as demo effects spill into it.
const border=P(rr(20,52,200,200,14),'#c4473d',`stroke="${rim}" stroke-width="3"`)
 +R(20,58,200,4,'#ffd23f')+R(20,66,200,2,'#ffffff','opacity=".7"')+R(20,236,200,4,'#ffd23f')+R(20,244,200,2,'#ffffff','opacity=".7"');
const defs=`<clipPath id="bord"><path d="${rr(20,52,200,200,14)}"/></clipPath>`;
const icon=G(border,'','clip-path="url(#bord)"')+P(rr(20,52,200,200,14),'none',`stroke="${rim}" stroke-width="3"`)+body;
save(8,{icon,defs,name:'Fire button',description:'A ball-top joystick in red, white and yellow is drawn on the attribute grid of an 8-bit home computer: colour changes only at cell edges, over a chunky blue plasma inside a red border.',choices:['Pixels stay fine while colour is set per 8 × 8 cell, so the stick and ball share inks the way the hardware forces','Two yellow raster stripes run into the border; saturated reds and yellows replace the neon cyan and magenta of the original palette']});
