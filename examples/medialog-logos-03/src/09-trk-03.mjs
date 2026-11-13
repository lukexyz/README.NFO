// A tracker panel arrangement distilled to four saved items, not an interface.
import {P,L,R,ink,paper,blue,accent,save} from './lib.mjs';
const icon=R(32,69,174,161,ink,'rx="19"')+R(48,86,66,57,paper,'rx="5"')+R(125,86,65,57,blue,'rx="5"')+R(48,154,66,59,blue,'rx="5"')+R(125,154,65,59,paper,'rx="5"')+P('M68 97L95 114L68 132Z',ink)+L('M64 184H96M157 168V198',paper,7)+P('M146 154H169V190L157 181L146 190Z',accent);
save(9,{icon,name:'Filed favourites',description:'Four carefully arranged tiles hold a play mark, a line and a bookmark. Different media, one orderly place.',choices:['The tracker’s modular panels become a compact collection symbol','Large cutouts stand in for media types, with no tiny notes, counters or labels']});
