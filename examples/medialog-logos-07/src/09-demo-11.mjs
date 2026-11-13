// Apple II title card as a hardback: a black cover inside a thick orange frame, a title of chunky blocks each in a
// different hi-res colour, and white credit lines that pick up a violet fringe on one side and green on the other,
// as white does on a hi-res screen; the page block's white edge is fringed the same way.
import {P,L,R,G,f,rr,save} from './lib.mjs';
const BLACK='#05060a',ORANGE='#ff9933',GREEN='#3fd14f',VIOLET='#a65cff',BLUE='#3d7bff';
const x0=66,y0=66,w=106,h=150,fr=10,sp=20;// cover, frame width, spine-side frame width
// White with a violet fringe on its left edge and a green fringe on its right, on a seven-pixel rhythm.
const fringed=(x,y,ww,hh)=>R(x-3.5,y,3.5,hh,VIOLET)+R(x+ww,y,3.5,hh,GREEN)+R(x,y,ww,hh,'#ffffff');
const ix=x0+sp,iw=w-sp-fr;
const title=[GREEN,VIOLET,BLUE].map((c,i)=>R(ix+8+i*20,y0+34,16,26,c)).join('');
const credits=fringed(ix+10,y0+80,iw-20,7)+fringed(ix+17,y0+95,iw-34,7);
let lines='';for(let k=18;k<h-14;k+=14)lines+=`M${x0+w+1} ${y0-4+k}H${x0+w+9}`;
const book=
 P(rr(x0+12,y0-9,w,h,[2,5,5,2]),'var(--rim)')// back board
 +R(x0+w-4,y0-5,13,h-8,'#ffffff')+L(lines,'#c9c9d2',1.4)+R(x0+w+9,y0-5,3.5,h-8,GREEN)// page block, fringed green outside
 +R(x0+12,y0-5,w-16,5,'#ffffff')+R(x0+8.5,y0-5,3.5,5,VIOLET)// and along its top
 +P(`M${x0+w-30} ${y0+h-4}H${x0+w-22}V${y0+h+20}L${x0+w-26} ${y0+h+16}L${x0+w-30} ${y0+h+20}Z`,GREEN)// ribbon
 +R(x0,y0,w,h,ORANGE,'rx="3"')+R(ix,y0+fr,iw,h-2*fr,BLACK)
 +R(x0+5,y0+16,sp-10,3,BLACK)+R(x0+5,y0+h-19,sp-10,3,BLACK)// bands on the spine side
 +R(x0+sp-4,y0,2,h,'#000000','opacity=".3"')// hinge
 +title+credits;
save(9,{icon:G(book,`rotate(-5 ${x0+w/2} ${y0+h/2})`),name:'Title card',description:'A hardback whose cover is an early home-computer title card: black inside a thick orange frame banded on the spine side, a title of three chunky blocks in green, violet and blue, and white credit lines fringed violet on one side and green on the other, with a green ribbon and the page block’s white edge fringed the same way.',choices:['The crack screen’s framed panel and multicoloured block title become a book cover, with credits in place of any group name','Colour fringes on every white edge mimic how hi-res white picks up green and violet; nothing is lettered']});
