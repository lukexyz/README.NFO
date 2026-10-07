import {R,T,write} from './lib.mjs';
let body=T('C:\\RESEARCH> REM HERETIC',28,45,25,'#aaa')+T('HERETIC',29,123,63,'#fff')+T('Python transformer research',29,161,23,'#aaa')+T('Directional ablation  |  Optuna search',29,211,22,'#aaa');
const glyphs='DIRECTIONALABLATION';
for(let i=0;i<glyphs.length;i++)body+=T(glyphs[i],100+i*37,254+(i%3)*22,21,['#ffff55','#55ffff','#ff55ff'][i%3],`class="fall" style="animation-delay:${i*.2}s"`);
body+=T('Decorative falling-letter payload. No executable code.',29,374,16,'#777');
write(18,{body,background:'#000',css:'.fall{animation:fall 9s ease-in-out infinite alternate}@keyframes fall{to{transform:translateY(55px)}}',summary:'A decorative DOS host screen whose ablation letters fall out of the research transcript while the project name stays fixed.',choices:['Only letters representing a direction fall away','The header explicitly identifies the payload as decorative, with no malware code']});
