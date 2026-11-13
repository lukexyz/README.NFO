// Graphic adaptation of multicolour C64 logo/DYCP grammar; no character art.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const stops=[[0,'#ecfaff'],[.34,'#ecfaff'],[.34,'#83daed'],[.64,'#83daed'],[.64,'#788ad7'],[1,'#788ad7']];
const defs=gradient('ramp',stops)+gradient('ramp-type',stops,{userSpace:true,start:9,end:77});
let body=R(19,62,777,173,'#2f254d','rx="16"');
for(let y=70;y<231;y+=13)body+=R(25,y,765,3,'#49355d');
body+=L('M35 57H781','#9f87c2',6)+L('M35 240H781','#9f87c2',6);
const ribbon='M57 95H85V74H152V95H180V159H152V181H128V204H107V181H84V159H57Z';
body+=P(ribbon,'#141b39','stroke="#11142f" stroke-width="10"')+P(ribbon,'url(#ramp)')+P('M91 102H148V145H91Z','#31264e')+R(98,82,40,7,'#fff7c0');
body+=word({x:236,y:86,width:514,height:123,kind:'tech',weight:18,ink:'url(#ramp-type)',outline:'#101729',outlineWidth:7});
for(let i=0;i<6;i++)body+=`<g class="note" style="animation-delay:-${i*.5}s">${C(288+i*72,211+Math.sin(i*.9)*7,5,['#ffc982','#ffefad','#93eeed'][i%3])}</g>`;
save(2,{body,defs,css:'.note{animation:sine 4s ease-in-out infinite}@keyframes sine{50%{transform:translateY(-7px)}}',name:'Save-slot romance',description:'A chunky multicolour save-slot heart, with six little timeline moments riding a soft demo-scene wave.',choices:['The emblem is a save slot that resolves into a heart','Six dots stand for films, books, shows, games, albums and podcasts, with no tiny labels']});
