// Emotional afterglow: the effect becomes a bold emblem rather than a full-screen simulation.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const flame='M115 238C33 212 24 170 58 123C60 163 84 163 85 135C84 103 111 92 111 53C160 92 193 132 182 179C171 212 145 229 115 238Z';
let body=G(P(flame,'#633c80'),'translate(14 -4) scale(1.03)')+P(flame,'#e45653')+P('M115 231C64 205 50 173 75 142C80 174 105 155 102 134C121 122 127 107 125 91C160 129 180 163 163 194C151 214 130 225 115 231Z','#ffa344');
body+=P('M119 205C91 188 79 174 87 161C94 150 110 157 117 169C126 151 143 151 148 164C154 181 137 194 119 205Z','#fff3ae');
body+=word({x:251,y:93,width:505,height:115,kind:'round',weight:19,ink:'var(--ink)',slant:-7});
body+=L('M245 225Q285 237 318 215Q350 194 380 220Q410 241 443 220Q464 208 496 223','#e4675a',7)+L('M251 241Q285 248 316 234Q347 220 382 237','#fbb56e',5);
save(8,{body,name:'Still feeling it',description:'A heart glows inside a feedback flame: the film, book or album that stays with you. A short cooling waveform becomes the underline.',choices:['The flame’s core is a heart, making the effect about feeling rather than speed','The fading waveform is the echo of an experience that remains on your timeline']});
