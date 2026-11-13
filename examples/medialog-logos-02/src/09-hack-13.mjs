// Saturated tracking lines map the flow of recommendations, not fictional activity counts.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R(22,40,770,219,'#102239','rx="23"')+C(126,146,83,'none','stroke="#4ba6c0" stroke-width="5"');
body+=L('M44 146H207M126 64V229M62 104Q125 134 188 104M62 188Q125 162 188 188M126 64Q68 147 126 229M126 64Q184 147 126 229','#2d5d78',3);
body+=L('M 60 171Q105 65 180 134M89 202Q147 128 182  90','#f4b86d',7)+C(60,171,9,'#ff9285')+C(180,134,9,'#f6cd82')+C(89,202,8,'#8fe2d5');
body+=word({x:261,y:96,width:495,height:113,kind:'tech',weight:8,ink:'#e8f7ed'});
save(9,{body,name:'Culture radar',description:'A glowing globe carries a few bright recommendation routes. What your friends discover finds its way into your timeline.',choices:['The routes represent shared taste rather than geographic tracking','Three large blips replace the reference’s dense counters and labels']});
