// A MilkDrop waveform becomes a six-loop taste constellation around a play-shaped opening.
import {P,L,R,C,G,word,save} from './lib.mjs';
let petals='';
const hues=['#886fe2','#b775db','#f782bd','#ffc27b','#62cfbd','#6ea9f0'];
for(let i=0;i<6;i++)petals+=G(L('M121 146C51 124 62 50 108 50C154 50 161 114 121 146Z',hues[i],14),`rotate(${i*60} 121 146)`);
let body=`<g class="constellation">${petals}</g>`+C(121,146,35,'var(--paper)')+P('M109 123L146 146L109 169Z','var(--ink)');
body+=word({x:251,y:89,width:511,height:121,kind:'round',weight:17,ink:'var(--ink)'});
body+=C(263,233,5,'#8a7bd4')+L('M282 233H730','#9c8bce',4)+C(751,233,5,'#62b6ad');
save(10,{body,css:'.constellation{transform-origin:121px 146px;animation:breathe 12s ease-in-out infinite}@keyframes breathe{50%{transform:rotate(8deg) scale(.95)}}',name:'Taste constellation',description:'Six coloured waveform loops share one centre: all your kinds of media, and the tastes that overlap with your friends. A gentle visualiser motion keeps the emblem alive.',choices:['Six loops represent the six media types named in the brief','The overlapping orbits describe shared taste, while one line connects the whole name']});
