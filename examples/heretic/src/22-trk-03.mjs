import {R,L,T,write} from './lib.mjs';
let body=R(13,13,934,374,'#497582','stroke="#8adbf3" stroke-width="2"')+T('HERETIC',218,65,46,'#fff','font-family="Arial,sans-serif" font-weight="900"')+T('Model research / illustrative tracker',219,91,16,'#cdebf1');
body+=R(25,26,171,122,'#000','stroke="#8adbf3"')+T('ORDER',38,47,16,'#ffff82');
['MODEL','VECTOR','SEARCH','EVAL'].forEach((s,i)=>{body+=T(String(i).padStart(2,'0')+' '+s,38,70+i*22,16,'#ffff82');});
for(let i=0;i<8;i++){const x=213+i%4*121,y=110+Math.floor(i/4)*48;body+=R(x,y,115,43,'#000','stroke="#8adbf3"')+L(`M${x+5} ${y+24}q15-20 30 0t30 0t30 0`,'#ffff82',1.4);}
body+=R(711,27,222,171,'#000','stroke="#8adbf3"')+T('COMPONENTS',723,51,16,'#fff');['Python','Transformers','Ablation','Optuna','AGPL-3.0'].forEach((s,i)=>{body+=T(`${i+1}. ${s}`,723,78+i*24,16,i?'#a5d9e9':'#ffff82');});
for(let col=0;col<6;col++){const x=26+col*151;body+=R(x,221,145,145,'#000','stroke="#8adbf3"');for(let row=0;row<6;row++)body+=T(`${row.toString(16)}  ${['C-4','D#4','...'][((col+row)%3)]}  ${col.toString(16)}0`,x+8,243+row*22,14,row===3?'#fff':'#ffff82');}
write(22,{body,background:'#18282c',summary:'A dense teal FastTracker-like research workstation with scope cells, component list and explicitly decorative pattern notes.',choices:['Song-order slots become model, vector, search and evaluation stages','Instrument names describe the actual Python research stack']});
