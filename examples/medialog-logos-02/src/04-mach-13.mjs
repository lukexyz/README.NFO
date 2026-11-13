// Monochrome LCD hardware, with a graphic route through a remembered moment.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R(25,49,762,197,'#c7edbb','rx="28"')+R(48,72,158,153,'#53664c','rx="20"')+R(64,87,126,99,'#c7edbb','rx="8"');
body+=L('M82 165V117H117V145H148V110H173','#43553c',12)+R(161,153,13,13,'#43553c')+R(97,202,56,7,'#bed8ac','rx="3"');
body+=word({x:249,y:89,width:508,height:123,kind:'tech',weight:15,ink:'#43553c'});
save(4,{body,name:'Pocket nostalgia',description:'A two-tone handset badge with a tiny winding path on its screen. A diary that fits in your pocket, with the calm simplicity of an old LCD.',choices:['The screen path is a timeline reaching a saved square','Only two tones and a few large shapes are used; no status text or character art']});
