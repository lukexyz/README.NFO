// Flat colours, silhouettes, curved type. A record is also a pair of overlapping friend circles.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=C(121,146,99,'#ed5d95')+P('M30 182V156H57V177H80V199H109V229H181L194 218A98 98 0 0 1 30 182Z','#d8bd3b');
body+=C(119,145,67,'#efc64c')+C(119,145,44,'#ee729d')+C(119,145,18,'#1b2737');
body+=C(77,129,17,'#172439')+C(160,129,17,'#172439')+P('M57 174Q59 147 77 147Q95 147 101 174ZM136 174Q138 147 160 147Q182 147 184 174Z','#172439');
body+=word({x:251,y:91,width:501,height:115,ink:'var(--ink)',weight:18,wave:-12});
body+=P('M294 234V218H414V230H498V211H599V226H739V244H294Z','#74b980');
save(4,{body,name:'Good company',description:'Two friends inside a record-like circle, paired with a gently curved wordmark and a stepped stripe. Bold shapes, warm colours, no fine print.',choices:['The circle combines a record groove with a shared social space','Two silhouettes and the continuous stepped baseline turn the diary into something you share']});
