// Raster-split graphic eye and matching original title; no character cells.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const stops=[[0,'#dce8c7'],[.3,'#dce8c7'],[.3,'#84c3c5'],[.56,'#84c3c5'],[.56,'#8893d2'],[.8,'#8893d2'],[.8,'#b18cb7'],[1,'#b18cb7']];
const defs=gradient('iris',stops)+gradient('title',stops,{userSpace:true,start:9,end:77});
let body=R(22, 50,770,201,'#272b48','rx="24"');
body+=P('M38 149Q80 77 130 77Q181 77 219 149Q177 226 130 226Q79 226 38 149Z','url(#iris)');
body+=C(130,150,42,'#272b48')+P('M114 120L160 150L114 180Z','#d9e8d7');
body+=word({x:265,y:93,width:487,height:120,kind:'tech',weight:19,ink:'url(#title)'});
body+=L('M262 229H752','#af8bad',5);
save(20,{body,defs,name:'The watching eye',description:'A raster-banded eye hides a play arrow at its centre. Watching becomes noticing—and keeping a record of what mattered.',choices:['The eye is drawn as a single memorable silhouette rather than a literal screen','One palette flows through both emblem and wordmark, making the whole lockup feel unified']});
