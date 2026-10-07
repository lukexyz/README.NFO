import {R,T,W,write} from './lib.mjs';
import {asciiLettering} from './drawing.mjs';
let body=R(19,24,922,352,'#000','stroke="#0ff" stroke-width="3"')+T('MODEM ART / HERETIC',42,57,19,'#ffff55')+W(65,96,15,'#0ff');
body+=T('Directional ablation / Python / Optuna',63,248,22,'#fff')+T('The complete name remains visible during draw-in.',63,291,17,'#aaa');
for(let x=66;x<867;x+=26)body+=R(x,326,18,15,'#ffff55','opacity=".5"');
body+=R(68,326,18,15,'#fff','class="cursor"');
write(17,{body,background:'#000',css:'.cursor{animation:cursor 8s linear infinite}@keyframes cursor{to{transform:translateX(780px)}}',summary:'A cyan-and-yellow ANSI stage with a travelling character cursor and complete Heretic block lettering.',choices:['The delivery cursor moves through a research-message row','Static full lettering remains readable at time zero and with reduced motion'],text:asciiLettering('HERETIC')+'\n\nDIRECTIONAL ABLATION / PYTHON / OPTUNA\nhttps://github.com/p-e-w/heretic'});
