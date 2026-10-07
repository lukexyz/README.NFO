import {R,C,L,T,write} from './lib.mjs';
let body=R(40,24,880,346,'#a5aab3','rx="12" stroke="#e4e4e9" stroke-width="3"')+T('HERETIC',480,91,66,'#474d62','text-anchor="middle" font-family="Arial,sans-serif" font-weight="900"')+T('HERETIC',478,89,66,'#e3e6e7','text-anchor="middle" font-family="Arial,sans-serif" font-weight="900"');
for(const x of [62,898])for(const y of [46,348])body+=C(x,y,8,'#4b536b','stroke="#dadde1" stroke-width="2"');
body+=R(101,122,758,143,'#151d2a','stroke="#52586a" stroke-width="5"')+T('TOP OF RESEARCH LIST',122,147,16,'#bcc6da');
['MODEL / TRANSFORMERS','DIRECTIONAL ABLATION','PARAMETER SEARCH / OPTUNA'].forEach((s,i)=>{body+=R(118,159+i*31,724,29,i===1?'#b13646':'#151d2a')+T(s,130,181+i*31,19,i===1?'#fff':'#76c7a3');});
body+=T('READ A PAGE   /   FOLLOW A DIRECTION',480,301,25,'#263347','text-anchor="middle"');
for(let i=0;i<39;i++)body+=R(101+i*19.5,323,19.5,10,`hsl(${i*9} 80% 55%)`);
write(33,{body,background:'#283344',summary:'An embossed chip-jukebox research list with a red selected ablation row, metal studs and a rainbow key legend.',choices:['Tracks become the three documented research stages','Durations are omitted because this is not an audio player or benchmark']});
