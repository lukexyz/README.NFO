import {R,T,W,write} from './lib.mjs';
let body=R(82,17,796,366,'#346856','rx="8"')+R(112,39,736,322,'#e0f8d0');
for(let x=120;x<841;x+=8)for(let y=47;y<355;y+=8)body+=R(x,y,6,6,'#88c070','opacity=".18"');
body+=W(480,112,12,'#081820',{center:true,maxWidth:668})+T('H E R E T I C',480,90,19,'#346856','text-anchor="middle"');
body+=T('DIRECTIONAL ABLATION',480,249,22,'#346856','text-anchor="middle"')+T('PYTHON / AGPL-3.0',480,289,19,'#346856','text-anchor="middle"')+R(450,314,60,8,'#081820');
write(12,{body,background:'#081820',summary:'A four-shade LCD boot plate with an original tile wordmark, visible pixel gaps and a held research title screen.',choices:['The seven-letter name is redrawn as tile-built boot lettering','Exactly four green shades keep the model-research title within the LCD grammar']});
