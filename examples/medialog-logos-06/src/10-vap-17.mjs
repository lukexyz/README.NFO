// Memphis: a flat yellow paperback with a black-and-white striped spine and a red quarter-circle, thick
// black outlines and a hard offset shadow, set off-grid against a cobalt circle, a squiggle and a triangle.
import {P,L,R,C,G,f,save} from './lib.mjs';
const K='#111111',YEL='#ffd23f',RED='#e8432e',COBALT='#2f5bd3',MINT='#5fd3a5';
const o=`stroke="${K}" stroke-width="5" stroke-linejoin="round"`;
const x0=62,y0=66,w=104,h=154;
const cover=`M${x0} ${y0}H${x0+w}V${y0+h}H${x0}Z`;
// Stripes for the spine, clipped to it.
let stripes='';for(let i=-6;i<12;i++)stripes+=L(`M${x0-10} ${y0+i*14}L${x0+40} ${y0+i*14+28}`,K,5.5);
const defs=`<clipPath id="spine"><rect x="${x0}" y="${y0}" width="26" height="${h}"/></clipPath><clipPath id="cover"><path d="${cover}"/></clipPath>`;
const css='.shade{fill:#111111}@media(prefers-color-scheme:dark){.shade{fill:#f6f3eb}}';
const book=
 P(`M${x0+12} ${y0+12}H${x0+w+18}V${y0+h+12}H${x0+12}Z`,'','class="shade"')// hard offset shadow
 +P(`M${x0+8} ${y0+6}H${x0+w+10}V${y0+h-6}H${x0+8}Z`,'#ffffff',o)// page block
 +L(`M${x0+w+4} ${y0+18}V${y0+h-18}`,K,2.6)
 +P(cover,YEL,o)
 +G(R(x0,y0,26,h,'#ffffff')+stripes,'','clip-path="url(#spine)"')
 +G(C(x0+w,y0+h,52,RED),'','clip-path="url(#cover)"')
 +L(`M${x0+26} ${y0}V${y0+h}`,K,5)
 +P(cover,'none',o);
const icon=C(166,92,38,COBALT)
 +G(book,`rotate(-7 ${x0+w/2} ${y0+h/2})`)
 +L('M16 116Q22 102 29 116T42 116T55 116',RED,6.5)
 +P('M36 196L52 224H20Z',MINT,`stroke="${K}" stroke-width="4" stroke-linejoin="round"`);
save(10,{icon,defs,css,name:'Paperback party',description:'A flat yellow paperback in thick black outline with a black-and-white striped spine, a red quarter-circle on its cover and a hard offset shadow, set off-grid against a cobalt circle, a red squiggle and a mint triangle.',choices:['Memphis: flat clashing colour, stripes against saturated fills, primitive shapes off-grid and solid offset shadows, with no gradients or perspective','The scatter is kept to three shapes so the book stays the subject']});
