// Scene paperwork as a bookmark: a photocopied tick-box slip sticks out of the top of a blue cloth hardback, with a
// marker-drawn header bar, two boxes ticked in red pen beside dotted lines, and a little photocopier grain.
import {P,L,R,C,G,f,rr,save} from './lib.mjs';
const INK='#18223a',PEN='#d8352a',SHEET='#fbfaf6',CLOTH='#2f4f9e';
const x0=58,y0=128,w=124,h=114;// front cover
const dots=(x,y,len)=>{let s='';for(let i=0;i<len;i+=7)s+=R(x+i,y,3,3,INK,'opacity=".6"');return s;};
const box=(x,y)=>R(x,y,15,15,'none',`stroke="${INK}" stroke-width="3.5"`);
const tick=(x,y)=>L(`M${x+1} ${y+8}Q${x+5} ${y+11} ${x+7} ${y+16}Q${x+13} ${y+2} ${x+22} ${y-6}`,PEN,5);
// The slip, tilted, mostly hidden inside the book: only the part above the cover shows.
const slip=G(
 P(rr(98,52,78,120,3),SHEET,`stroke="${INK}" stroke-opacity=".35" stroke-width="2"`)
 +R(108,61,44,9,INK,'rx="2"')+L('M108 76Q126 73 146 75',PEN,3)
 +box(108,84)+dots(130,93,36)+tick(108,84)
 +box(108,105)+dots(130,114,30)+tick(108,105)
 +C(158,64,1.3,INK,'opacity=".35"')+C(124,100,1.1,INK,'opacity=".35"')+C(166,96,1.2,INK,'opacity=".35"'),'rotate(6 137 112)');
const icon=
 P(rr(x0+8,y0-6,w,h,[3,6,6,3]),'var(--rim)')// back board
 +P(rr(x0+5,y0-3,w-2,h-4,[2,5,5,2]),'#f6f3eb','stroke="var(--rim)" stroke-width="2.5"')// page block
 +L(`M${x0+w+2} ${y0+6}V${y0+h-12}`,'#c9c1ae',1.8)
 +slip
 +P(rr(x0,y0,w,h,[3,6,6,3]),CLOTH,'stroke="var(--rim)" stroke-width="3"')
 +R(x0+12,y0+2,2.5,h-4,'#000000','opacity=".25"')// hinge
 +P(rr(x0+34,y0+26,70,26,3),'none','stroke="#f6f3eb" stroke-opacity=".55" stroke-width="2.5"');// blind-stamped panel
save(10,{icon,name:'Book swap',description:'A blue cloth hardback with a photocopied tick-box slip sticking out of the top as a bookmark: a marker-drawn header bar and two boxes ticked in red pen beside dotted lines, with a little photocopier grain.',choices:['The swap letter that travelled with every disk becomes the note tucked into a lent book: what you thought of it, in tick boxes','Photocopier black on warm white and red pen on the slip; the book is plain cloth with a stamped panel, and no words are typed']});
