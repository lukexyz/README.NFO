// Glass orb, wet highlight and fresh two-tone Web 2.0 lettering.
import {P,L,R,C,G,word,gradient,star,save} from './lib.mjs';
const defs=gradient('glass',[[0,'#a8ecff'],[.48,'#269ede'],[.49,'#0879c2'],[1,'#62cce1']]);
let body=C(120,141,92,'#176695')+C(120,136,87,'url(#glass)')+P('M48 102Q71 43 132 50Q179 50 193 105Q118 143 48 102Z','#dcfbff','class="sheen" opacity=".68"');
body+=P('M65 143Q88 128 119 151Q145 128 176 143V193Q144 176 119 199Q88 177 65 193Z','#f5fffc')+L('M119 152V191','#54b89a',6)+P('M145 167Q190 119 207 170Q192 213 150 199Q172 185 189 161Q167 177 145 184Z','#9ad77a');
body+=word({x:258,y:94,width:500,height:116,weight:15,ink:'var(--ink)',inks:[null,null,null,null,null,'#34875b','#34875b','#34875b']})+star( 70,64,13,'#fff');

save(5,{body,defs,css:'.sheen{animation:sheen 6s ease-in-out infinite}@keyframes sheen{50%{opacity:.4}}',name:'Blue sky diary',description:'A glossy blue orb holds an open diary, with a green leaf tucked into it. Bright, optimistic glass-era branding with generous, readable lettering.',choices:['The orb gathers multiple experiences into a single place','The leaf suggests a growing personal collection, not a software status badge']});
