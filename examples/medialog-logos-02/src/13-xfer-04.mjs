// A glossy signature bar, widened vertically enough to keep the title readable at 203px.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const defs=gradient('club',[[0,'#308ac0'],[1,'#263e7e']],{vertical:false})+'<clipPath id="bar"><rect x="28" y=" 70 " width="758" height="156" rx="12"/></clipPath>';
let body=R(25,67,764,162,'#152744','rx="14"')+R(29,71,756,154,'url(#club)','rx="10"');
let stripes='';for(let i=0;i<35;i++)stripes+=L(`M${i*29-100}  70 L${i*29+55} 225`,'#73b1d5',5,'opacity=".18"');
body+=`<g clip-path="url(#bar)">${stripes}${P('M28 70H787V120Q427  70 28 153Z','#fff','opacity=".18"')}</g>`;
body+=P('M54 146L98 85H150L196 146L149 207H98Z','#e8cc79','stroke="#143951" stroke-width="5"')+P('M122 181C75 149  90 118 121 137C151 115 172 147 122 181Z','#2f638d');
body+=word({x:246,y: 90,width:511,height:118,kind:'tech',weight:14,ink:'#fff8e5',outline:'#173357',outlineWidth:4});
save(13,{body,defs,name:'Culture club card',description:'A blue forum-era membership strip with a gold heart badge. A compact identity that feels like belonging to a small club of people with good recommendations.',choices:['The badge identifies shared taste rather than a rank or paid membership','The userbar gloss and stripes are broad enough to remain legible without microscopic captions']});
