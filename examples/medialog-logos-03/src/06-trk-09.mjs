// A single audio trace draws the pages and joins them at the spine.
import {L,ink,accent,save} from './lib.mjs';
const icon=L('M32 181V110Q67 98 94 116L119 146L144 116Q174 98 208 110V181Q169 170 119 206Q70 170 32 181Z',ink,11)+L('M48 151H68L80 131L95 170L119 145L143 168L157 130L171 151H192',accent,8)+L('M119 150V206',ink,9);
save(6,{icon,name:'Read between the beats',description:'A simple waveform runs through an open diary. Listening and reading share the same continuous line.',choices:['The scope line is turned into one coherent book symbol','The warm trace is secondary to the large navy silhouette']});
