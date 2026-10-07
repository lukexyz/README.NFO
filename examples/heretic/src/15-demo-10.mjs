import {R,T,W,write} from './lib.mjs';
let body='';const colors=['#000080','#800080','#ff0080','#ff8000','#808000','#00ffff'];
for(let y=0;y<400;y+=10)for(let x=0;x<960;x+=20){const i=(Math.floor(y/50)+Math.floor(x/160))%6;body+=R(x,y,20,10,(x/20+y/10)%4?colors[i]:'#000');}
body+=R(70,75,820,195,'#000')+W(480,112,15,'#ffff80',{center:true,maxWidth:760})+T('HERETIC / FAT PIXEL RESEARCH',480,241,20,'#ff80ff','text-anchor="middle"')+R(0,304,960,57,'#000080')+T('PYTHON   /   DIRECTIONAL ABLATION   /   OPTUNA',480,340,21,'#fff','text-anchor="middle"');
write(15,{body,background:'#000',summary:'A CPC Mode-0 study with double-wide brick pixels, three-level RGB colours and a heavy golden wordmark.',choices:['Raster bands follow successive research stages','Wide pixel dithering changes the title construction and entire picture grain']});
