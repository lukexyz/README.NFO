// Three faceted slabs replace the neon cube field with a small stack of saved objects.
import {P,L,ink,paper,soft,blue,accent,save} from './lib.mjs';
let icon='';
for(const [y,c] of [[186,ink],[158,blue],[130,ink]]){
 icon+=P(`M31 ${y}L119 ${y-48}L207 ${y}V${y+20}L119 ${y+68}L31 ${y+20}Z`,c);
 icon+=P(`M31 ${y}L119 ${y+48}L207 ${y}L119 ${y-48}Z`,y===130?paper:soft);
 icon+=L(`M119 ${y+48}V${y+61}`,paper,5);
}
icon+=P('M69 129L119 101L169 129L119 157Z',ink)+P('M118 101L145 116L96 143L69 129Z',accent);
save(20,{icon,name:'Collected moments',description:'Three faceted layers make a small stack of keepsakes, with one warm band crossing the top.',choices:['The cube-field grammar becomes a tangible collection of media objects','A limited palette and three large layers replace the rainbow field and tiny cells']});
