import {R,T,write} from './lib.mjs';
let body='';const colors=['#7d69d8','#bf69bc','#d36661','#d6ac65','#a8cc75','#70c6ae','#7ca9e0'];
for(let level=0;level<7;level++)for(let i=0;i<10;i++)for(const sx of [-1,1])for(const sy of [-1,1]) {
  const x=480+sx*(26+level*38+i*8),y=169+sy*(12+level*15+Math.sin(i)*18);
  body+=R(Math.round(x/8)*8,Math.round(y/8)*8,8,8,colors[level],`opacity="${.3+i*.06}"`);
}
body+=R(0,304,960,96,'#07090e')+T('HERETIC / DIRECTIONAL LIGHT',28,342,28,'#dcdfcf');
for(let i=0;i<28;i++)body+=R(30+i*19,364,15,14,colors[i%7]);
body+=T('mirrored ablation study',613,379,16,'#b0bbb8');
write(2,{body,background:'#000',summary:'A four-way mirrored light-synth trail, with directional-ablation seeds and a ROM-like status line.',choices:['One vector seed expands symmetrically instead of using a generic background','Heretic becomes the synthesizer status readout'],css:'rect[opacity]{animation:trail 9s ease-in-out infinite alternate}@keyframes trail{to{opacity:.8}}'});
