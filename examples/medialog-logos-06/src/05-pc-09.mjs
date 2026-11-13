// Pencil on paper, the cracktro that draws itself: an open book in rough doubled outline, still being
// drawn, with a green pencil whose point rests at the end of the newest line.
import {P,L,R,G,f,save} from './lib.mjs';
// A pencil stroke: a firm line plus a fainter second pass slightly off it, broken where the grain skips.
const sk=(d,w=6,dash='')=>L(d,'var(--ink)',w,dash?`stroke-dasharray="${dash}"`:'')
 +L(d,'var(--ink)',w*.42,`opacity=".5" transform="translate(1.8 -1.6)"${dash?` stroke-dasharray="${dash}"`:''}`);
const pageL='M118 102Q86 84 38 94V198Q84 190 118 210';
const pageR='M122 102Q154 84 202 94V198Q156 190 122 210';
const cover='M32 102V206Q84 198 120 218Q156 198 208 206V102';
const lines=['M54 118Q80 112 106 120','M54 140Q80 134 106 142','M54 162Q76 157 96 162','M136 120Q160 112 186 118','M136 142Q152 136 162 137'];
const drawing=sk(pageL)+sk(pageR)+sk(cover,5.5,'90 7 60 6 200')
 +lines.map((d,i)=>sk(d,4.8,i===2?'26 6 60':'')).join('');
// Pencil, built pointing left from its tip at the origin, then laid diagonally with its point on the newest line.
const pencil=G(
 P('M0 0L22 -9V9Z','#e8c48a')+P('M0 0L8 -3.3V3.3Z','#2b2b33')
 +R(22,-9,58,18,'#3cb043')+R(22,3,58,6,'#1d6b2a')+R(22,-9,58,3.5,'#7fd77f')
 +R(80,-9,11,18,'#ffd400')+R(80,3,11,6,'#d1a600')
 +P('M91 -9H100Q104 -9 104 -5V5Q104 9 100 9H91Z','#e58a73')
 +P('M0 0L22 -9H100Q104 -9 104 -5V5Q104 9 100 9H22Z','none','stroke="#13202e" stroke-width="3" stroke-linejoin="round"'),
 'translate(162 137) rotate(-50) scale(.9)');
const icon=drawing+pencil;
save(5,{icon,name:'First draft',description:'An open book drawn in rough, doubled pencil lines, still unfinished, with a green pencil lying across it, its point resting at the end of the newest line of text.',choices:['The self-drawing cracktro: outline only, no fills, a doubled line that skips like chalk on grain, and the pencil caught mid-stroke','The blue paper is left out so the sketch sits straight on the page, in navy on light and cream on dark']});
