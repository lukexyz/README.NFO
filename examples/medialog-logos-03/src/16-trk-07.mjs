// Four tracker channels become four bookmark spines sharing the same baseline.
import {P,L,ink,blue,accent,save} from './lib.mjs';
const icon=P('M36 92H66V204L51 194L36 204Z',ink)+P('M 80 72H110V215L95 205L 80 215Z',blue)+P('M124  90 H154V204L139 194L124 204Z',ink)+P('M168 113H198V215L183 205L168 215Z',accent)+L('M28 231Q116 249 212 231',ink,9);
save(16,{icon,name:'Four kinds of favourite',description:'Four bookmarks hang at different heights above a shared curve. Watching, reading, playing and listening belong together.',choices:['The four channels map directly to the four verbs in the brief','A single baseline turns the marks into one collection instead of separate app buttons']});
