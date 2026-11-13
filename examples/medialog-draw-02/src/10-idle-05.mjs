// Mystify's paired trails are redrawn as facing diary pages, with a Marquee footer.
import {R,P,L,C,T,word,B,save} from './lib.mjs';
let s='';
for(let i=10;i>=0;i--){const d=i*7;s+=`<g class="trail" style="animation-delay:-${i*.14}s" opacity="${.14+(10-i)*.065}">${L(`M${586-d} ${90+d}L${779-d/2} ${151+d/2}L${749+d/3} ${368-d}L${572-d} ${286+d/2}Z`,'#3dd8df',1.3)}${L(`M${779-d/2} ${151+d/2}L${935-d/2} ${65+d}L${956-d} ${276+d/2}L${749+d/3} ${368-d}Z`,'#fa7bae',1.3)}</g>`;}
s+=R(29,154,534,160,'#030609')+word(49,167,57,'#e9eff6')+T('A media diary you share.',48,284,28,'#94c4cc');
s+=B('WATCHED',53,58,1.55,'#8d9cac')+B('READ',875,419,1.55,'#ef9bca')+B('PLAYED',58,369,1.55,'#a5ddd4')+B('LISTENED',417,94,1.55,'#b8a5da');
s+=L('M38 443H962','#29464f',1)+T('Everything you’ve been into. On one timeline.',40,485,29,'#e9eff6');
s+=C(501,385,3,'#eff9f9')+C(390,113,2,'#69717f')+C(310,351,1,'#b0b5c0');
save(10,{body:s,background:'#030609',height:522,css:'.trail{transform-box:view-box;transform-origin:760px 235px;animation:mystify 16s ease-in-out infinite alternate}@keyframes mystify{to{transform:translate(-8px,12px) rotate(5deg) skewY(-4deg)}}',summary:'Two pages, endless stories',choices:['The two Mystify polygons take the shape of facing diary pages','Watched, read, played and listened orbit one calm central wordmark, above the continuous timeline caption']});
