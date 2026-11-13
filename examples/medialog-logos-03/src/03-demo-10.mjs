// CPC block proportions become a bold, three-volume collection. No character cells.
import {P,L,R,ink,paper,blue,accent,save} from './lib.mjs';
const icon=R(32,92,43,122,ink,'rx="5"')+R(86,70,43,144,ink,'rx="5"')+P('M142 87L181 76L216 200L177 211Z',blue)+L('M46 113H62M46 188H62M99 93H116M99 185H116',paper,6)+L('M158 106L174 102',paper,6)+R(31,226,188,9,ink,'rx="4"')+R(99,120,17,30,accent,'rx="2"');
save(3,{icon,name:'A shelf of your own',description:'Three substantial spines and one leaning volume. A small personal library for every kind of media.',choices:['Unequal heights suggest different experiences sharing one shelf','The chunky block reference is confined to the emblem; the title is normal type']});
