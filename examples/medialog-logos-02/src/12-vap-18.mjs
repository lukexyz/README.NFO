// Neon tube marquee: a heart is the sign, the wordmark is one unbroken shopfront glow.
import {P,L,R,C,G,word,save} from './lib.mjs';
const defs='<filter id="glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>';
const heart='M122 207C94 186 54 149 57 116C60 82 102 72 122 107C144 71 187 85 189 117C191 148 151 188 122 207Z';
const tubes=L(heart,'#fa8bbb',8)+L('M91 123L143 151L91 180Z','#7ff0e1',6)+word({x:258,y:95,width:497,height:114,weight:8,ink:'#ffe0f0'});
let body=R(22,41,771,216,'#211d34','rx="23"')+`<g class="neon-glow" filter="url(#glow)" opacity=".65">${tubes}</g>`+tubes+L('M268 221H727','#cb72a0',4)+C(750,221,5,'#85e0d8');
save(12,{body,defs,name:'After-hours favourites',description:'A pink neon heart with a cyan play cutout, beside a clean tube-letter wordmark. Your late-night discoveries have a place to glow.',choices:['A heart and play sign combine emotional reaction with watching','The composition removes street labels and rain so the name stays clear at navigation size']});
