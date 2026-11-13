// Crack-screen panels as a book stack: thick single-colour frames become covers, white title bars carry
// the green and violet fringes of an early hi-res screen, and a white open book rests on top.
import {P,L,R,G,f,rr,rim,save} from './lib.mjs';
const BLACK='#05060a',FR={orange:'#ff9933',green:'#3fd14f',violet:'#a65cff',blue:'#3d7bff'};
// A white bar with a violet fringe on its left edge and a green fringe on its right, on a seven-pixel rhythm.
const fringed=(x,y,w,h)=>R(x-3.5,y,3.5,h,FR.violet)+R(x+w,y,3.5,h,FR.green)+R(x,y,w,h,'#ffffff');
function book(x,y,w,h,frame,rot,title){
 const t=7;
 return G(R(x,y,w,h,frame,'rx="3"')+R(x+t,y+t,w-2*t,h-2*t,BLACK)
  +fringed(x+t+10,y+h/2-3.5,title,7)
  +R(x+w-t-14,y+t+3,3.5,h-2*t-6,frame,'opacity=".9"'),`rotate(${rot} ${x+w/2} ${y+h/2})`);
}
// Open book on top: two white pages with fringed edges.
const open=G(
 P('M120 112Q100 98 70 102V128Q100 124 120 138Z','#ffffff')+P('M120 112Q140 98 170 102V128Q140 124 120 138Z','#ffffff')
 +R(66,102,3.5,26,FR.violet)+R(170.5,102,3.5,26,FR.green)
 +L('M80 110Q98 107 112 114M80 119Q98 116 112 123','#05060a',3)+L('M128 114Q142 107 160 110M128 123Q142 116 160 119','#05060a',3),'');
const icon=P(rr(20,52,200,200,18),BLACK,`stroke="${rim}" stroke-width="3"`)
 +book(36,206,168,34,FR.orange,0,96)
 +book(46,172,150,34,FR.blue,-2,70)
 +book(40,140,160,34,FR.green,1.5,84)
 +open
 +R(52,246,136,2,'#ffffff','opacity=".14"');
save(9,{icon,name:'Stacked',description:'Three framed crack-screen panels become a stack of books — orange, blue and green covers with white titles that carry green and violet colour fringes — with an open book resting on top.',choices:['The thick single-colour frames and white type of early hi-res title cards become book covers and spine titles','Colour fringes on every white edge mimic how hi-res white picks up green and violet; nothing is lettered']});
