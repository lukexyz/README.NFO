// P2P chunks become a loop of recommendations. Icon follows the name in this layout.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=word({x:42,y:94,width:518,height:119,weight:17,ink:'var(--ink)',inks:[null,null,null,null,null,'#398a8f','#398a8f','#398a8f']});
body+=L('M624 110Q691  40 742 106M751 156Q738 231 662 222M622 193Q580 165 611 125','#627b92',7);
body+=P('M736  90 L744 120L713 112Z','#627b92')+P('M677 210L651 228L680 240Z','#627b92')+R(601,76,54,54,'#78b4d1','rx="10"')+R(727,121,54,54,'#eac570','rx="10"')+R(624,192,54,54,'#76b5a1','rx="10"')+L('M616 96L641 110M741 141H766M639 212H664','#f6f6e8',6);
save(16,{body,name:'Passed around',description:'Three coloured tiles travel in a circle at the end of a two-tone wordmark. One person’s discovery becomes another person’s next favourite.',choices:['The P2P chunk vocabulary becomes a social exchange rather than transfer statistics','The emblem follows the title, making a different horizontal rhythm from the other marks']});
