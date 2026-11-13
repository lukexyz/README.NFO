// Tape-loader border colours turned into a stack of chronological tabs.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body='';
for(const [i,c] of ['#ed4457','#f4cc43','#59ba83','#4aaed0'].entries())body+=G(P('M40  80 H128L168 118V176H40Z',c),`translate(${i*17} ${i*16})`);
body+=P('M87 129L150 165L87 202Z','#17243e')+P('M97 146L128 165L97 184Z','#fff');
body+=word({x:263,y:93,width:494,height:122,kind:'tech',weight:18,ink:'var(--ink)'});
body+=L('M261 224H367','#ed4457',6)+L('M376 224H484','#f4cc43',6)+L('M493 224H602','#59ba83',6)+L('M611 224H756','#4aaed0',6);
save(6,{body,name:'Colour arrives last',description:'Four bright memory tabs stack into a play-shaped badge. Spectrum-era loading colours become an instantly recognisable archive mark.',choices:['Overlapping tabs suggest moments filed in chronological order','One shared play cutout unites the stack without adding tiny media icons']});
