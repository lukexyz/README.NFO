// Synthwave: a slatted sunset sinks into the gutter of an open book whose pages are the laser grid.
import {P,L,R,G,f,lg,save} from './lib.mjs';
const GRID='#b75cff',NIGHT='#1b1a3c';
// Open book: page tops rise to the outer corners and dip into the gutter; bottoms follow the same curve.
const gx=120,gt=160,gb=234,ox=24,oy=136,by=212;// gutter top/bottom, outer corner x offset, outer top y, outer bottom y
const page=s=>{const x=gx+s*(gx-ox);return `M${gx} ${gt}Q${f(gx+s*50)} ${oy-14} ${f(x)} ${oy}V${by}Q${f(gx+s*50)} ${by-12} ${gx} ${gb}Z`;};
// A curve between the top and bottom edges at fraction t, for the receding grid lines.
const across=(s,t)=>{const x=gx+s*(gx-ox),lerp=(a,b)=>f(a+(b-a)*t);return `M${gx} ${lerp(gt,gb)}Q${f(gx+s*50)} ${lerp(oy-14,by-12)} ${f(x)} ${lerp(oy,by)}`;};
// Rays from the vanishing point at the top of the gutter out to the bottom edge.
const ray=(s,k)=>{const x=gx+s*(gx-ox)*k;const y=by+(gb-by)*(1-k)**1.6;return `M${gx} ${gt}L${f(x)} ${f(y+2)}`;};
const sunR=80,sunY=152;
// Sun slats: hard gaps that thicken toward the horizon, cut with a mask so the page shows through.
const slats=[[103,2.5],[115,4],[126,5.5],[137,7],[148,8.5]];
const defs=lg('sun',[[0,'#ffe36e'],[.38,'#ffb547'],[.72,'#ff7a3a'],[1,'#f0473f']],[0,72,0,164],'gradientUnits="userSpaceOnUse"')
 +`<clipPath id="sky"><rect x="0" y="0" width="240" height="170"/></clipPath>`
 +`<mask id="slats"><rect x="0" y="0" width="240" height="300" fill="#fff"/>${slats.map(([y,h])=>R(30,y,180,h,'#000')).join('')}</mask>`
 +`<clipPath id="pages"><path d="${page(-1)}"/><path d="${page(1)}"/></clipPath>`;
const sun=G(G(`<circle cx="${gx}" cy="${sunY}" r="${sunR}" fill="url(#sun)"/>`,'','mask="url(#slats)"'),'','clip-path="url(#sky)"');
const grid=[.36,.68].flatMap(t=>[-1,1].map(s=>L(across(s,t),GRID,3.6)))
 .concat([-1,1].flatMap(s=>[.42,.8].map(k=>L(ray(s,k),GRID,3.6)))).join('');
const book=P(page(-1),NIGHT)+P(page(1),NIGHT)
 +G(grid,'','clip-path="url(#pages)" opacity=".85"')
 +P(page(-1),'none',`stroke="${GRID}" stroke-width="5" stroke-linejoin="round"`)
 +P(page(1),'none',`stroke="${GRID}" stroke-width="5" stroke-linejoin="round"`);
const icon=sun+book;
save(2,{icon,defs,name:'Sunset chapter',description:'A slatted synthwave sun, yellow to orange to red, sinks into the gutter of an open book whose night-blue pages carry the violet laser grid.',choices:['The outrun horizon becomes the top edge of the pages, and the floor grid recedes toward the gutter','No sky, palm trees or chrome lettering: just the sun and the book']});
