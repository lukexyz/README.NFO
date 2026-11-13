// Rewatch energy. A new italic wordmark above a timeline-disc, never a historical DVD logo.
import {P,L,R,C,G,word,save} from './lib.mjs';
let logo=word({x:126,y:66,width:580,height:120,kind:'tech',weight:19,ink:'currentColor',slant:-12});
logo+='<ellipse cx="397" cy="213" rx="267" ry="25" fill="currentColor"/>';
logo+=P('M168 213Q304 192 413 207Q534 226 625 208','none','stroke="#101724" stroke-width="5"');
logo+=C(244,205,7,'#101724')+C(415,208,7,'#101724')+C(570,214,7,'#101724');
const body=R(22,32,768,235,'#101724','rx="28"')+`<g class="bounce" style="color:#ab9bff">${logo}</g>`;
save(9,{body,css:'.bounce{animation:ricochet 16s linear infinite}@keyframes ricochet{0%,100%{transform:translate(-12px,-6px);color:#ab9bff}25%{transform:translate(12px,5px);color:#6ee8d6}50%{transform:translate(-12px,5px);color:#f3a5d5}75%{transform:translate(12px,-6px);color:#ffd886}}',name:'One more watch',description:'An oversized oblique wordmark above a compressed timeline-disc. A restrained screensaver ricochet changes colour while the name stays easy to read.',choices:['The disc carries three saved moments instead of a secondary tiny caption','Motion is kept within a few screen pixels so the mark remains a usable navigation logo']});
