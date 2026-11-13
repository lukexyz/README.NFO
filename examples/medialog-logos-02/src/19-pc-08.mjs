// Trainer toggle, faceted star and acid palette: all graphic, no function-key menu.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const defs=gradient('acid',[[0,'#e9f18c'],[1,'#73ba7c']]);
let body=R(28,76,196,148,'#243743','rx=" 70 "')+R(42,91,168,119,'#83bf83','rx="55"')+C(153,150,49,'url(#acid)')+P('M152 179C 90 146 137 118 153 138C180 116 192 149 152 179Z','#254035');
body+=L('M38 58V79M28 68H49M199 229V250M188 240H210','#81b68a',7);
body+=word({x:267,y:94,width:487,height:122,kind:'tech',weight:19,ink:'var(--ink)',slant:-8});
save(19,{body,defs,name:'Favourite mode',description:'An oversized green toggle with a heart built into its switch. The trainer-screen energy becomes a simple invitation to save what you loved.',choices:['The toggle expresses a personal favourite instead of a software cheat or capability','A heavy slanted title carries the arcade energy without tiny key labels']});
