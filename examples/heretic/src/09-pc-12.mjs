import {R,L,T,W,write} from './lib.mjs';
let body='';
for(let row=0;row<10;row++)for(let col=0;col<23;col++) {
 const x=col*45-20+Math.sin(row*.5)*36,y=160+row*22+Math.sin(col*.4)*26,c=`hsl(${col*14+row*8} 90% ${30+row*2}%)`;
 body+=`<path d="M${x} ${y}l18-8 17 8-18 9z" fill="${c}"/><path d="M${x} ${y}v17l17 8v-16z" fill="${c}" opacity=".5"/><path d="M${x+17} ${y+9}l18-9v17l-18 8z" fill="${c}" opacity=".75"/>`;
}
body+=W(480,31,14,'#b7ffe1',{center:true})+T('DIRECTIONAL FIELD / HERETIC',480,143,22,'#d7e7ef','text-anchor="middle"')+R(0,354,960,46,'#050a13')+T('Ablation vectors across a transformer landscape',480,383,22,'#d7e7ef','text-anchor="middle"');
write(9,{body,background:'#02050a',summary:'A saturated perspective field of neon cubes, with an original segmented Heretic wordmark anchored above it.',choices:['Each cube is a conceptual transformer cell','The wave landscape supplies spatial structure instead of a flat title panel']});
