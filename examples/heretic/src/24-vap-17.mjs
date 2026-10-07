import {R,C,L,T,write} from './lib.mjs';
let body='';const colors=['#ff68a8','#64cff7','#f7e752','#ca7cd8','#3968cb'];
for(let i=0;i<26;i++){const x=(i*179+19)%960,y=(i*73+17)%400;body+=i%3?L(`M${x} ${y}l15-12 16 24 16-12`,'#151b31',4):C(x,y,19,colors[i%5]);}
body+=R(25,268,119,73,'#3968cb')+'<path d="M851 71l72 103h-133z" fill="#ff68a8" stroke="#151b31" stroke-width="4"/>';
[...'HERETIC'].forEach((letter,i)=>{const x=196+i*88,y=193+(i%2?12:-8),angle=(i%3-1)*7;body+=T(letter,x+6,y+8,93,'#10152b',`font-family="Arial Black,Arial,sans-serif" font-weight="900" transform="rotate(${angle} ${x} ${y})"`)+T(letter,x,y,93,colors[i%5],`font-family="Arial Black,Arial,sans-serif" font-weight="900" stroke="#10152b" stroke-width="2" paint-order="stroke" transform="rotate(${angle} ${x} ${y})"`);});
body+=T('open directions / automatic model research',480,290,23,'#172641','text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold"')+T('PYTHON   //   OPTUNA   //   AGPL-3.0',480,337,18,'#172641','text-anchor="middle"');
write(24,{body,background:'#f5ddc2',summary:'A playful Memphis laminate with independently tilted Heretic letters, hard shadows and scattered research confetti.',choices:['Each letter follows its own direction instead of one uniform wordmark','Research components form a sober baseline under the deliberately unruly geometry']});
