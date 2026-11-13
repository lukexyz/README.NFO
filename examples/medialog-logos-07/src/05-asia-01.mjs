// FM-synth channel strips as a stack of books: each book lies flat with its rounded spine to the left, and the
// edge of its page block is a miniature piano keyboard with one key lit lime, one keyboard per channel.
import {P,R,G,f,save} from './lib.mjs';
const LIME='#86f53a',KEY='#ecebf2',BLACK='#101032',EDGE='#101032';
const HAS_BLACK=[1,1,0,1,1,1,0];// after C, D, E, F, G, A, B
function book(x,y,w,kh,n,lit,cover,start=0){
 const bt=9,hb=2*bt+kh,sp=13,kx=x+sp,kr=x+w-6,kw=(kr-kx)/n;
 // One shape for both boards and the curved spine; the keyboard sits between the boards.
 const shape=`M${x+sp} ${y}H${x+w-3}Q${x+w} ${y} ${x+w} ${y+3}V${y+hb-3}Q${x+w} ${y+hb} ${x+w-3} ${y+hb}H${x+sp}A${sp} ${hb/2} 0 0 1 ${x+sp} ${y}Z`;
 let keys=R(kx,y+bt,kr-kx,kh,KEY);
 for(let i=0;i<n;i++){
  if(i===lit)keys+=R(kx+i*kw,y+bt,kw,kh,LIME);
  if(i)keys+=R(kx+i*kw-.8,y+bt,1.6,kh,'#8a8aa6');
 }
 for(let i=0;i<n-1;i++)if(HAS_BLACK[(i+start)%7])keys+=R(kx+(i+1)*kw-kw*.3,y+bt,kw*.6,kh*.58,BLACK,'rx="1"');
 return P(shape,cover)+keys+P(shape,'none',`stroke="${EDGE}" stroke-width="3" stroke-linejoin="round"`)
  +P(`M${x+sp-6} ${y+hb*.3}Q${x+3} ${y+hb/2} ${x+sp-6} ${y+hb*.7}`,'none','stroke="#ffffff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"');
}
// Three channels, staggered, each sounding a different key: a rising chord from bottom to top.
const icon=book(26,178,182,30,11,2,'#3b2f6b',0)
 +book(42,130,166,28,10,5,'#7a4fd6',3)
 +G(book(30,84,176,26,11,8,'#9a8cff',5),'rotate(-3 118 104)');
save(5,{icon,name:'Three channels',description:'A stack of three books with plum, violet and lavender covers lies with rounded spines to the left, and the edge of each page block is a miniature piano keyboard with one key lit lime, climbing from book to book like a chord.',choices:['The synth player’s one-keyboard-per-channel strips become a stack of books: white pages read as white keys','Lavender, violet and plum on the covers; lime only on the sounding keys, as on the original displays']});
