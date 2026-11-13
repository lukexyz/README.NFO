// Wide, extruded, banded chrome with a hard warm/cool horizon.
import {P,L,R,C,G,word,gradient,star,save} from './lib.mjs';
const stops=[[0,'#b6c5ff'],[.22,'#dbe5ff'],[.22,'#8490cd'],[.45,'#f1fbff'],[.49,'#f1fbff'],[.5,'#532647'],[.7,'#b56e73'],[.7,'#efb283'],[1,'#ffe0aa']];
const defs=gradient('steel',stops)+gradient('letters',stops,{userSpace:true,start:0,end:90});
let body=P('M29 155L122 61L219 143L133 231Z','#253149','stroke="#bdc9e7" stroke-width="5"')+P('M42 148L122 70L204 141L129 217Z','url(#steel)')+L('M 80 164L121 119L163 156M 90 178L129 138L169 173','#2f405b',9);
body+=word({x:260,y:97,width:502,height:121,ink:'#6a3e56',kind:'round',weight:23,slant:-8})+word({x:252,y:89,width:502,height:121,ink:'url(#letters)',kind:'round',weight:20,outline:'#28354e',outlineWidth:5,slant:-8});
body+=star(91,87,12,'#fff')+star(734,109,13,'#fff');
save(17,{body,defs,name:'Chrome keepsake',description:'A polished, faceted keepsake and an extruded wordmark with a sharp reflected horizon. More like an engraved personal badge than a screen.',choices:['Two folded chevrons inside the gem suggest stacked saved moments','Cool sky and warm ground share the same lettering, linking past and present']});
