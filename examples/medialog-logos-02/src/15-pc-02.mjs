// Monochrome plasma with an embossed serif title; static broad bands preserve small-size contrast.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const defs=gradient('emerald',[[0,'#17493b'],[.45,'#428f68'],[.65,'#255945'],[1,'#112c2c']]);
let body=R(23,43,766,211,'url(#emerald)','rx="28"');
body+=P('M23 110Q130 30 244 109T497 122T789 93V123Q650 211 502 152T235 149T23 155Z','#6da878','opacity=".36"');
body+=P('M23 223Q161 170 268 214T485 224T789 192V253H23Z','#0e342c','opacity=".55"');
body+=L('M62 193L129 81L191 192Z','#bfe3a3',9)+L('M84 180L130 116L168 180Z','#729c73',9)+C(129,166,14,'#d8ecb4');
body+=word({x:253,y:93,width:506,height:126,kind:'serif',weight:13,ink:'#173b32',outline:'#102e2a',outlineWidth:5})+word({x:249,y:89,width:506,height:126,kind:'serif',weight:13,ink:'#d8e8b9'});
save(15,{body,defs,name:'Pressed into memory',description:'An emerald plasma seal with carved, pale serif lettering. The emblem is a moment preserved inside a triangular frame.',choices:['The enclosed bright point is a saved experience','Embossed lettering suggests a memory pressed into a lasting material']});
