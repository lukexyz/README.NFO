// Light-synth mandala: chunky seed patterns ripple out in four-fold mirror symmetry around a podcast microphone.
import {P,L,R,C,G,f,rr,rim,save} from './lib.mjs';
const N=16,cell=12,x0=24,y0=56;// 16 x 16 cells, mirrored about the centre lines
const SEQ=['#f6e7c1','#e9b65a','#e0874c','#b4625a','#5f86b8','#3a5791','#24345f'];// seven-step sequence: outer (newest) rings warm, inner rings cool
const grid=Array.from({length:N/2},()=>Array(N/2).fill(-1));
// One seed at the centre has expanded through its levels in pairs of rings; the levels between have faded
// to black. Distance is diamond-shaped, as on a cell grid, and the quarter is mirrored through both axes.
const rings={3:0,4:1,7:2,8:3,11:4,12:5};
for(let i=0;i<N/2;i++)for(let j=0;j<N/2;j++){const d=i+j;if(d in rings)grid[i][j]=rings[d];}
let cells='';
const c=N/2;
for(let i=0;i<c;i++)for(let j=0;j<c;j++){
 const v=grid[i][j];if(v<0)continue;
 // Quarter (i,j) counts outward from the centre; mirror through both axes.
 for(const [u,w] of [[c+i,c+j],[c-1-i,c+j],[c+i,c-1-j],[c-1-i,c-1-j]])cells+=R(x0+u*cell+.6,y0+w*cell+.6,cell-1.2,cell-1.2,SEQ[v]);
}
// Microphone on a stand, on a dark plate so it separates from the pattern.
const mic=P(rr(86,78,68,140,30),'#0b0f1c')
 +P(rr(104,86,32,62,16),'#f6f3eb')
 +R(108,100,24,3.4,'#18223a')+R(108,110,24,3.4,'#18223a')+R(108,120,24,3.4,'#18223a')+R(108,130,24,3.4,'#18223a')
 +L('M96 124V136Q96 164 120 164Q144 164 144 136V124','#f6f3eb',7)
 +L('M120 164V194','#f6f3eb',7)+R(100,194,40,8,'#f6f3eb','rx="4"');
const defs=`<clipPath id="field"><path d="${rr(20,52,200,200,20)}"/></clipPath>`;
const icon=G(R(20,52,200,200,'#0b0f1c')+cells,'','clip-path="url(#field)"')+mic

 +P(rr(20,52,200,200,20),'none',`stroke="${rim}" stroke-width="3"`);
save(7,{icon,defs,name:'On air',description:'A podcast microphone stands at the centre of a four-fold light-synth mandala: chunky seed patterns ripple outward through seven colours, from cream and amber to deep blue.',choices:['Seeds expand through seven levels on a coarse cell grid and are mirrored through both axes, as in the light synth','The pattern frames a microphone so the symbol reads as listening and talking: podcasts']});
