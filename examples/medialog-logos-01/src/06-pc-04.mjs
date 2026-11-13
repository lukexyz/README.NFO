// Heavy VGA metal: a media vault with one continuous magenta timeline.
import {P,L,R,C,G,word,star,gradient,save} from './lib.mjs';
const stops=[[0,'#fff'],[.17,'#b3defb'],[.46,'#637ab7'],[.49,'#f5fdff'],[.53,'#fff'],[.56,'#3e2945'],[.74,'#ac7687'],[1,'#efcbb4']];
const defs=gradient('chrome',stops)+gradient('chrome-type',stops,{userSpace:true,start:9,end:77})+gradient('bar',[[0,'#59457f'],[.45,'#ff9ade'],[.65,'#d060b9'],[1,'#3d386a']]);
let body=R(31,88,750,17,'url(#bar)','rx="8"')+R(31,208,750,17,'url(#bar)','rx="8"');
const medallion='M66 59H150L198 105V194L150 237H66L26 194V105Z';
body+=P(medallion,'#28344f','stroke="#bac7db" stroke-width="7"')+P('M70 76H145L181 110V187L145 221H70L43 187V110Z','url(#chrome)');
body+=L('M72 184V112L103 155L132 112V184H160','#192942',13)+L('M66 183V109L97 150L126 109V181H154','#edf6fa',5);
body+=word({x:244,y:87,width:520,height:120,kind:'tech',weight:21,ink:'url(#chrome-type)',outline:'#25314b',outlineWidth:8,slant:-5});
body+=star(737,92,14,'#fff9f7')+star(57,80,11,'#fff9f7');
save(6,{body,defs,name:'Memory vault',description:'A chrome ML medallion and a heavy metal wordmark, crossed by pink VGA bars. Like a collector’s badge for your own cultural history.',choices:['An interlocked ML makes the icon work as a standalone avatar','The two gradient rails join emblem and title like tracks through a collection']});
