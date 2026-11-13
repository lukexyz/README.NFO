// A play arrow trapped in an orbital timeline; original continuous vector lettering.
import {P,L,R,C,G,word,save} from './lib.mjs';
const trace=L('M66 212L149 56L205 159L66 212M93 188L169 144L129 106Z','#8affd6',6);
const orbit='<ellipse cx="130" cy="143" rx="95" ry="56" transform="rotate(-29 130 143)" fill="none" stroke="#4ac2ed" stroke-width="5"/>';
let body=R(21,38,770,223,'#081622','rx="22"');
const mark=trace+orbit+C(47,180,7,'#c9ffe9')+C(213,106,7,'#c9ffe9');
body+=`<g opacity=".25" filter="url(#halo)">${mark}</g>`+mark;
const title=word({x:266,y:99,width:476,height:106,kind:'tech',weight:6,ink:'#c6fff2'});
body+=`<g opacity=".5" filter="url(#halo)">${title}</g>`+title;
body+=L('M278 222H570','#31888c',3)+C(593,222,4,'#89e9d3');
save(5,{body,defs:'<filter id="halo" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>',name:'Orbit trace',description:'A glowing play arrow sits inside an orbital timeline. One clean phosphor line carries the brand.',choices:['Two bright points on the orbit read as shared moments','The triangular trace suggests watching, while the orbit supplies the timeline']});
