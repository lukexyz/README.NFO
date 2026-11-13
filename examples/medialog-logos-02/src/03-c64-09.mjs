// Copper colour fields folded into a loop of joined timelines.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const stops=[[0,'#60bfc5'],[.32,'#60bfc5'],[.32,'#819be1'],[.5,'#819be1'],[.5,'#c97eab'],[.72,'#c97eab'],[.72,'#e99b60'],[1,'#e99b60']];
const defs=gradient('ribbon',stops)+gradient('type',stops,{userSpace:true,start:9,end:77});
let body=L('M46 171C26 92 120 72 140 139C158 206 213 175 209 128C205 85 146 65 115 131C86 194 55 212 46 171Z','url(#ribbon)',32);
body+=L('M53 165C35 105 113 84 132 139','#d4f6eb',6)+L('M145 158Q171 208 203 159','#753f72',7);
body+=word({x:257,y:91,width:508,height:122,kind:'tech',weight:19,ink:'url(#type)',outline:'var(--ink)',outlineWidth:3});
save(3,{body,defs,name:'One continuous loop',description:'A thick multicolour ribbon folds into an infinity loop. Different kinds of media become one continuous history.',choices:['Two looping paths join into a single diary rather than separate libraries','Broad copper bands survive reduction to 203 pixels']});
