// Non-rectangular gadget skin, simplified into a portable memory projector.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const defs=gradient('case',[[0,'#70c9c8'],[.45,'#2d7c85'],[1,'#173a54']]);
let body=P('M41 89L79 52H171L207 88V201L169 234H75L41 202Z','url(#case)','stroke="#172b44" stroke-width="8"')+P('M62 102L87 76H163L185 102V189L163 211H86L62 187Z','#122d40');
body+=R(77,94,94,72,'#8adad0','rx="9"')+P('M107 109L147 130L107 152Z','#123347')+C(100,191,9,'#ffb56d')+C(145,191,9,'#519cac')+L('M185 126L222 103V159L185 145','#345e72',7);
body+=word({x:256,y:94,width:511,height:117,kind:'tech',weight:17,ink:'var(--ink)',inks:[null,null,null,null,null,'#d28343','#d28343','#d28343']});
body+=R(260,219,207,9,'#4ea6a7','rx="4"')+R(481,219,61,9,'#e8a86d','rx="4"');
save(1,{body,defs,name:'Pocket premiere',description:'A teal gadget with a glowing play window: your entire cultural life feels like something worth carrying around.',choices:['The projector window turns a software skin into a compact media emblem','Two simple controls suggest remembering and sharing without inventing interface labels']});
