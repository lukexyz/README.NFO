// Beamer contrast and large presentation type become a premiere ticket.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R(24,41,764,214,'#172033','rx="26"')+P('M46 88H189V116Q158 146 189 176V205H46V176Q75 146 46 116Z','#f6d251');
body+=P('M88 112L146 146L88 180Z','#19243a')+L('M204 80V216','#69728a',3,'stroke-dasharray="8 12"');
body+=word({x:243,y:85,width:509,height:132,kind:'round',weight:18,ink:'#f5f0df'});
save(2,{body,name:'Your name on the ticket',description:'A bold premiere ticket and oversized warm-white lettering. The collection gets the same billing as the films, books and records inside it.',choices:['A punched ticket is the shared invitation','Projector-scale typography is kept large enough to read across a tiny navigation bar']});
