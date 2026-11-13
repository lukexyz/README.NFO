// A surreal memory museum, distilled to one marble heart and a few perspective tiles.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R(25,40,177,211,'#ff8daf','rx="10"');
body+=P('M40 213L130 184L199 204V251H40Z','#201e37');
body+=P('M63 220L89 211L114 218L89 230ZM116 204L139 196L164 204L141 213ZM116 235L144 225L175 235L146 246Z','#fd9dc1');
body+=P('M84 192V165H142V192L130 204H72Z','#dadbe7')+R(72,166,59,27,'#fcfbf3');
body+=P('M109 151C86 134 61 113 66 92C71 71 98 68 110 90C125 64 157 76 158 98C160 121 136 135 109 151Z','#514663');
body+=P('M109 143C87 127 70 109 74 91C81 77 99 77 111 99C122 78 145 80 150 96C154 112 133 130 109 143Z','#faf9ee');
body+=L('M83 100Q94 87 100 98M99 128L111 119M130 97L139 105','#c5bccf',4);
body+=word({x:247,y:84,width:514,height:122,kind:'round',weight:17,ink:'#6ae4c4',outline:'#253052',outlineWidth:5});
body+=L('M256 221H732','#e46b96',5)+C(758,221,8,'#e46b96');
save(3,{body,name:'Museum of you',description:'A marble heart on a tiny plinth: the things you love become your personal collection. Mint lettering and a pink checker plinth keep the vaporwave reference instantly readable.',choices:['An original heart sculpture replaces the historical bust','The checker plinth turns personal taste into a miniature collection']});
