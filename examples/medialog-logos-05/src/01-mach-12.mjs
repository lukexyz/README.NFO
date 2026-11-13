// VCR front panel: a teal vacuum-fluorescent readout behind smoked glass, playing a film at 1:58 with a lit reel annunciator.
// Unlit segments stay faintly visible, so every digit shows the ghost of an 8.
import {P,R,C,G,f,poly,rr,lg,rim,save} from './lib.mjs';
const LIT='#8ff5dc',HALO='#2fd1b4',ORANGE='#ff9a3d',GHOST='opacity=".1"';
// Seven-segment digit as hexagonal bars a-g.
const DIGITS={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg'};
function digit(x,y,w,h,t,ch){
 const g=t*.22,xl=x+t/2,xr=x+w-t/2,yt=y+t/2,ym=y+h/2,yb=y+h-t/2;
 const H=(cx,cy,len)=>poly([[cx-len/2,cy],[cx-len/2+t/2,cy-t/2],[cx+len/2-t/2,cy-t/2],[cx+len/2,cy],[cx+len/2-t/2,cy+t/2],[cx-len/2+t/2,cy+t/2]]);
 const V=(cx,cy,len)=>poly([[cx,cy-len/2],[cx+t/2,cy-len/2+t/2],[cx+t/2,cy+len/2-t/2],[cx,cy+len/2],[cx-t/2,cy+len/2-t/2],[cx-t/2,cy-len/2+t/2]]);
 const seg={a:H((xl+xr)/2,yt,xr-xl-2*g),g:H((xl+xr)/2,ym,xr-xl-2*g),d:H((xl+xr)/2,yb,xr-xl-2*g),
  f:V(xl,(yt+ym)/2,ym-yt-2*g),b:V(xr,(yt+ym)/2,ym-yt-2*g),e:V(xl,(ym+yb)/2,yb-ym-2*g),c:V(xr,(ym+yb)/2,yb-ym-2*g)};
 const lit=DIGITS[ch]??'';
 return {ghost:Object.values(seg).map(d=>P(d,LIT)).join(''),lit:[...lit].map(k=>P(seg[k],LIT)).join('')};
}
const slant='translate(0 150) skewX(-7) translate(0 -150)';
let ghost='',lit='';
for(const [x,ch] of [[58,'1'],[112,'5'],[154,'8']]){const d=digit(x,120,34,62,9,ch);ghost+=d.ghost;lit+=d.lit;}
lit+=R(98,136,8,8,LIT)+R(98,160,8,8,LIT);
// Annunciators: play lit, pause and record ghosted, film reel lit in orange.
lit+=P('M30 88L50 99L30 110Z',LIT);
ghost+=R(58,89,6,20,LIT)+R(68,89,6,20,LIT)+C(88,99,7,LIT);
let reel=C(198,100,15.5,ORANGE);
for(let k=0;k<5;k++){const a=k*2*Math.PI/5-Math.PI/2;reel+=C(198+8.6*Math.cos(a),100+8.6*Math.sin(a),3.4,'#071214');}
reel+=C(198,100,2.6,'#071214')+R(108,94,68,10,ORANGE,'rx="2" opacity=".1"');
// Progress through the film: 16 bar segments, 11 lit.
for(let i=0;i<16;i++){const x=30+i*11.4;(i<11?(s=>lit+=s):(s=>ghost+=s))(R(x,198,8.4,8,LIT,'rx="1"'));}
const defs=lg('glass',[[0,'#ffffff',.1],[.35,'#ffffff',0]],[0,0,.6,1])
 +'<filter id="vfd" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
 +'<filter id="amber" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
const icon=P(rr(14,74,212,148,20),'#071214',`stroke="${rim}" stroke-width="3"`)
 +G(ghost,slant,GHOST)+G(lit,slant,'filter="url(#vfd)"')
 +G(reel,'','filter="url(#amber)"')
 +P(rr(14,74,212,148,20),'url(#glass)')
 +R(28,82,184,1.5,'#ffffff','opacity=".12"');
save(1,{icon,defs,name:'Now showing',description:'A video-recorder front panel reads ▶ 1:58 in teal fluorescent segments behind smoked glass, with an orange film-reel annunciator and a progress bar most of the way through.',choices:['Seven-segment digits keep their ghosted unlit segments; annunciators become play, pause, record and a film reel','A runtime and a part-filled progress bar make the panel about watching films, not hi-fi; no lettering is used']});
