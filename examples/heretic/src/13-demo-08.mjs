import {R,T,W,write} from './lib.mjs';
const palette=['#0000d7','#d70000','#d700d7','#00d700','#00d7d7','#d7d700'];let body='';
for(let row=0;row<20;row++)for(let col=0;col<32;col++){const index=(Math.floor(Math.sin(col*.4)*3+Math.cos(row*.55)*3)+12)%6;body+=R(col*30,row*20,30,20,palette[index]);if((row+col)%3===0)body+=R(col*30+5,row*20+5,20,10,'#000');}
body+=R(60,100,840,122,'#000')+W(480,125,12,'#fff',{center:true})+R(120,261,720,52,'#000')+T('REDEFINED DIRECTIONS / HERETIC',480,295,25,'#00ffff','text-anchor="middle"')+T('Attribute-grid study / Python research',480,371,19,'#fff','text-anchor="middle"');
write(13,{body,background:'#000',summary:'A ZX-style attribute-grid effect, with hard colour cells and a white bitmap title across a black interruption.',choices:['The colour-field discontinuity acts as a removed model direction','All colour changes occur on explicit cells instead of smooth gradients']});
