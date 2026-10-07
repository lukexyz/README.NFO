import {R,T,W,write} from './lib.mjs';
let body=R(0,0,960,98,'#516ed0')+R(0,98,960,47,'#809bdc')+R(0,145,960,255,'#568d63');
for(let row=0;row<12;row++){const y=147+row*row*1.7,h=4+row*2;for(let col=0;col<20;col++)body+=R(col*(32+row*4)-row*34,y,32+row*4,h,(row+col)%2?'#729c50':'#447a57');}
for(let i=0;i<15;i++)body+=`<path d="M${470+i*5} 147L${i*140-500} 400" fill="none" stroke="#d9b980" stroke-width="4"/>`;
body+=`<g transform="matrix(1 0 .28 .58 90 192)">${W(90,30,15,'#fff1bf')}${T('ABLATION ROUTE',110,166,23,'#263e31')}</g>`+T('HERETIC / MODEL MAP',30,52,28,'#fff')+T('Illustrative plane; no game or model benchmark.',30,91,16,'#e0e9ff');
write(19,{body,background:'#2f5276',summary:'A Mode-7-like ground map with the Heretic wordmark painted onto a receding, textured ablation route.',choices:['Project identity belongs to the transformed ground plane','Ablation becomes an open route across a schematic model landscape']});
