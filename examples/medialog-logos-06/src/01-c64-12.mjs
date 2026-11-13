// Hand-pixelled chrome on a hardback: the cover takes the banded sky-and-ground fill of a 16-bit chrome
// logo, split by a hard zigzag horizon, with a dark outline, a light bevel edge and a solid extruded side.
import {P,L,R,G,f,rr,poly,glint,lg,save} from './lib.mjs';
const OUT='#0b1020',BACK='#22305a',PAGE='#f4eedf',PAGE2='#d9cfb6';
const x0=50,y0=58,w=124,h=170,dx=20,dy=14;
// Banded ramps: each colour is a hard step, as on a 16- or 32-colour palette.
const bands=(id,cols,dir=[0,0,0,1])=>lg(id,cols.flatMap((c,i)=>[[i/cols.length,c],[(i+1)/cols.length,c]]),dir);
const SKY=['#1c2c74','#2f4cae','#5878d8','#8eaaf0','#c6d8fb','#f2f7ff'];
const GROUND=['#3b1208','#74270b','#b4481a','#e57a2a','#ffb44a','#ffe08a'];
const hy=y0+h*.5;// horizon
// Zigzag horizon across the cover, a little wider than the cover so the clip trims it cleanly.
const zig=[];for(let i=0;i<=8;i++)zig.push([x0-8+i*(w+16)/8,hy+(i%2?-7:5)]);
const ground=poly([...zig,[x0+w+8,y0+h+4],[x0-8,y0+h+4]]);
const cover=rr(x0,y0,w,h,[4,8,8,4]);
const defs=`<clipPath id="cover"><path d="${cover}"/></clipPath>`
 +bands('sky',SKY,[0,0,0,1])+bands('ground',GROUND,[0,0,0,1]);
const body=
 // Back board and page block, offset down and to the right like an extruded logo side.
 P(rr(x0+dx,y0+dy,w,h,[4,8,8,4]),BACK,`stroke="${OUT}" stroke-width="5" stroke-linejoin="round"`)
 +P(rr(x0+dx-7,y0+dy-6,w-3,h-4,[2,4,4,2]),PAGE,`stroke="${OUT}" stroke-width="3"`)
 +L(`M${x0+w+4} ${y0+h-6}H${x0+w+dx-10}M${x0+w+4} ${y0+h+3}H${x0+w+dx-11}`,PAGE2,2.4)
 +L(`M${x0+12} ${y0+h+5}H${x0+w-6}`,PAGE2,2.4)
 // Ribbon bookmark hanging out of the pages.
 +P(`M${x0+w-44} ${y0+h-8}H${x0+w-28}V${y0+h+30}L${x0+w-36} ${y0+h+23}L${x0+w-44} ${y0+h+30}Z`,'#d8352a',`stroke="${OUT}" stroke-width="4" stroke-linejoin="round"`)
 // Front board: sky above the horizon, ground below, clipped to the cover.
 +G(R(x0-4,y0-4,w+8,h*.56,'url(#sky)')+P(ground,'url(#ground)')
   +L(poly(zig).replace(/Z$/,''),OUT,4)
   +L(poly(zig.map(([x,y])=>[x,y+5])).replace(/Z$/,''),'#ffd890',2,'opacity=".7"'),'','clip-path="url(#cover)"')
 // Hinge groove near the spine, with a light bevel line beside it.
 +L(`M${x0+19} ${y0+3}V${y0+h-3}`,OUT,4.5)+L(`M${x0+24} ${y0+6}V${y0+h-6}`,'#ffffff',2.4,'opacity=".55"')
 // Light inner edge for the bevel, then the dark outline.
 +P(rr(x0+5,y0+5,w-10,h-10,[2,5,5,2]),'none','stroke="#ffffff" stroke-opacity=".5" stroke-width="2.5"')
 +P(cover,'none',`stroke="${OUT}" stroke-width="6" stroke-linejoin="round"`);
const icon=G(body,`translate(${-6} 0) skewX(-6) translate(${f(Math.tan(6*Math.PI/180)*150)} 0)`)
 +glint(178,66,19,"#ffffff");
save(1,{icon,defs,name:'Chrome hardback',description:'A hardback in 16-bit chrome: the cover is filled with banded sky blues above a hard zigzag horizon and warm oranges below, with a dark outline, a light bevel edge, a cream page block for its extruded side and a white sparkle on the corner.',choices:['The chrome logo’s banded fill, horizon, outline, bevel and extrusion are applied to a single book instead of lettering','No tile or border: the book stands on its own beside the wordmark']});
