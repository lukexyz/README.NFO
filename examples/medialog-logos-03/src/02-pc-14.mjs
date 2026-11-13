// Nested tunnel geometry becomes a passage through successive pages.
import {P,L,ink,blue,accent,save} from './lib.mjs';
const icon=L('M38 208V94Q80 77 119 107Q161 77 203 94V208Q162 190 119 220Q77 190 38 208Z',ink,11)+L('M58 181V111Q91 105 119 128Q149 105 184 111V181',blue,9)+L('M80 161V133Q101 134 119 152Q139 134 161 133V161',accent,9)+L('M119 109V219',ink,8);
save(2,{icon,name:'Stories within stories',description:'Three nested folds create a small passage into a book, with a strong centre spine.',choices:['The tunnel reference becomes layers of remembered stories','Three broad strokes retain depth without gradients or tiny texture']});
