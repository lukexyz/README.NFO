// The daily bulletin becomes a diary page with one prominent time symbol.
import {P,L,R,C,ink,paper,blue,accent,save} from './lib.mjs';
const icon=R(38,79,166,157,ink,'rx="20"')+R(51,109,140,113,paper,'rx="8"')+L('M77 68V92M165 68V92',blue,12)+C(121,165,38,'none',`stroke="${ink}" stroke-width="8"`)+L('M121 141V165L142 177',ink,8)+C(178, 92,5,accent);
save(18,{icon,name:'Worth remembering',description:'A diary page and a clear clock face make a small mark for when it happened, as well as what it was.',choices:['The daily bulletin reference becomes a personal dated entry','One clock replaces all the tiny data rows, keeping the symbol readable']});
