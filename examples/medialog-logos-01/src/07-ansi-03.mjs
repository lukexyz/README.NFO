// The comic/mascot half of the illustrated-ANSI reference, drawn entirely as smooth vectors.
// No ASCII characters, cell grid, shade characters or text-mode assets.
import {P,L,R,C,G,word,star,save} from './lib.mjs';
let mascot=P('M67 68Q104 44 150 70L189 99L175 189L137 222L66 208L38 161Z','#9e7dea','stroke="#20283f" stroke-width="10"');
mascot+=P('M91 80L150 82L176 105L154 185L109 199L60 177L54 129Z','#c4a0f7')+P('M65 171L151 185L137 209L70 197Z','#7864b6');
mascot+=C(92,122,21,'#fff')+C(143,128,21,'#fff')+C(98,128,8,'#18283d')+C(149,134,8,'#18283d')+L('M100 169Q119 184 141 166','#263146',8);
mascot+=L('M42 117Q22 133 28 155M179 155L201 143L200 125','#222d42',9)+C(25,158,10,'#ffda79');
let body=G(mascot,'rotate(-7 117 145)')+star(202,72,18,'#ecaa36')+star(41,226,11,'#9978d4');
body+=word({x:246,y:82,width:510,height:121,kind:'round',weight:22,ink:'#fff8df',outline:'#26283f',outlineWidth:14,slant:-7,wave:4});
body+=P('M270 230Q450 253 750 210L741 232Q463 275 270 242Z','#9c79d9');
save(7,{body,name:'Little culture goblin',description:'An original pocket-sized mascot: a happy little creature made from a saved story. Thick comic outlines, cream lettering and a purple swoosh keep it clear at tiny sizes.',choices:['The mascot is a folded saved-story shape with a face, not a generic animal','Its raised hand turns the logo into a friendly invitation to share a favourite']});
