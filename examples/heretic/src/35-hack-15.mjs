import {R,T,W,write} from './lib.mjs';
let body='';const alphabet='01?#+=*:/<>%';
for(let row=0;row<13;row++){let line='';for(let col=0;col<62;col++)line+=alphabet[(row*11+col*7)%alphabet.length];body+=T(line,32,38+row*25,19,'#4a5568',`opacity="${row%3?.28:.5}"`);}
body+=R(57,96,846,138,'#0a0e14','fill-opacity=".9"')+W(480,123,12,'#6cb6ff',{center:true})+T('DIRECTIONAL ABLATION',480,286,28,'#b1d8ff','text-anchor="middle"')+T('Resolving the research signal / typographic study',480,340,20,'#8eb2d5','text-anchor="middle"');
write(35,{body,background:'#0a0e14',summary:'A dim field of scramble cells resolves around a permanently readable blue Heretic name and ablation line.',choices:['The final project identity is visible before any animation','Scrambled typography supplies a signal-recovery metaphor rather than an encryption claim'],css:'text[opacity]{animation:scramble 11s ease-in-out infinite alternate}@keyframes scramble{to{opacity:.16}}'});
