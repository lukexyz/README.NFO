import {R,T,W,write} from './lib.mjs';
let body='';
for(let x=0;x<960;x+=32){body+=R(x,0,32,16,'#e4c490')+R(x,384,32,16,'#e4c490');}
body+=W(480,58,15,'#b53120',{center:true})+W(480,50,15,'#e4c490',{center:true})+T('OPEN MODEL QUEST',480,189,26,'#e4c490','text-anchor="middle"');
const commands=['READ THE PROJECT','DIRECTIONAL ABLATION','OPTUNA SEARCH'];commands.forEach((label,i)=>{body+=T(label,337,246+i*34,22,'#a3a3a3');});
body+='<path d="M289 228h16v16h-16v16h-16v-16h-16v-16h16v-16h16z" fill="#b53120"/>'+T('p-e-w/heretic / AGPL-3.0',480,361,17,'#a3a3a3','text-anchor="middle"');
write(16,{body,background:'#0f0f0f',summary:'An original four-colour console title card with a stepped wordmark and a directional sprite cursor.',choices:['A forked arrow is the original menu sprite','The menu names actual research components rather than fictional game levels'],text:'HERETIC / OPEN MODEL QUEST\n\n> READ THE PROJECT\n  DIRECTIONAL ABLATION\n  OPTUNA SEARCH\n\nFour-colour title-card study; not a hardware palette measurement.'});
