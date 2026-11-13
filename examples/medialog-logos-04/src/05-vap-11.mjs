// One-bit desktop: a pinstriped window with a hard shadow holds an open diary; one page is dithered, an arrow points in.
// Coordinates sit on the 4-unit grid, so at 203 × 74 every rule lands on a whole pixel.
import {P,R,G,save} from './lib.mjs';
const N='#18223a',W='#f6f3eb';
const dither=`<pattern id="dither" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${W}"/><rect width="4" height="4" fill="${N}"/><rect x="4" y="4" width="4" height="4" fill="${N}"/></pattern>`;
const x0=24,y0=60,x1=196,y1=220,bar=28;
let stripes='';
for(const y of [y0+6,y0+12,y0+18])stripes+=R(x0+6,y,x1-x0-12,3,N);
const win=R(x0+10,y0+10,x1-x0,y1-y0,'var(--shadow)')
 +R(x0,y0,x1-x0,y1-y0,W,`stroke="${N}" stroke-width="4"`)
 +stripes
 +R(x0+12,y0+4,28,20,W)+R(x0+16,y0+6,16,16,W,`stroke="${N}" stroke-width="4"`)
 +R(84,y0+4,52,20,W)+R(x0,y0+bar,x1-x0,4,N);
// Open diary in thick one-bit strokes; the left page is a checkerboard grey, the right holds ruled lines.
const book=P('M44 112Q74 102 108 114V198Q76 186 44 196Z','url(#dither)')
 +P('M44 112Q74 102 108 114V198Q76 186 44 196Z','none',`stroke="${N}" stroke-width="6" stroke-linejoin="round"`)
 +P('M108 114Q142 102 176 112V196Q144 186 108 198Z',W,`stroke="${N}" stroke-width="6" stroke-linejoin="round"`)
 +R(120,128,44,5,N)+R(120,144,44,5,N)+R(120,160,30,5,N)
 +P('M42 202Q76 192 108 206Q140 192 178 202',  'none',`stroke="${N}" stroke-width="6" stroke-linecap="round"`)
 +R(156,104,10,30,'var(--accent)')+P('M156 134L161 128L166 134Z',W);
// Classic arrow pointer, white with a dark outline.
const arrow=G(P('M0 0V52L12 40L22 62L32 57L22 36H39Z',W,`stroke="${N}" stroke-width="4" stroke-linejoin="miter"`),'translate(178 176)','class="cursor"');
const icon=win+book+arrow;
const css=':root{--shadow:#18223a}@media(prefers-color-scheme:dark){:root{--shadow:#5d6f88}}.cursor{animation:nudge 5s ease-in-out infinite}@keyframes nudge{0%,70%,100%{transform:translate(178px,176px)}80%{transform:translate(170px,166px)}88%{transform:translate(172px,168px)}}';
save(5,{icon,defs:dither,css,name:'System diary',description:'A one-bit window with a pinstriped title bar and a hard drop shadow holds an open diary; one page is checkerboard grey and an arrow pointer reaches in.',choices:['Desktop-era one-bit rules: pinstripe title bar, close box, hard shadow and dithered grey, aligned to whole pixels','Black and white become brand navy and warm paper; a tan ribbon is the only extra colour'],motion:'The pointer nudges toward the diary every five seconds.'});
