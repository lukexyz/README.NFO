// Four-channel tracker hardware becomes a four-part waveform M.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R( 30,57,190,187,'#829198','rx="17"')+R(39,65,172,169,'#c1c5be','rx="11"')+R(53,81,144,133,'#182737','rx="9"');
for(const [i,h] of [79,42,57,100].entries())body+=R(67+i*31,193-h,17,h,i%2?'#5c91bd':'#e7d077','rx="3"');
body+=L('M60 155L81 155L95 112L112 177L129 128L146 154H187','#f5e69b',5)+C( 60,224,3,'#48606f')+C(191,224,3,'#48606f');
body+=word({x:264,y:95,width:493,height:117,kind:'tech',weight:16,ink:'var(--ink)'})+L('M269 223H373V217H469V227H566V213H754','#758e9b',5);
save(14,{body,name:'Four-track mind',description:'Four chunky tracks and a golden waveform sit inside a brushed-grey badge. Watching, reading, playing and listening become parts of the same mix.',choices:['Four large tracks directly reference the four verbs in the brief','The waveform runs continuously across them, expressing one shared timeline']});
