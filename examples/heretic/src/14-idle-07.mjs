import {R,C,L,T,write} from './lib.mjs';
let body='<path d="M0 0H960L632 104H328Z" fill="#d7d4c6"/><path d="M0 400H960L632 300H328Z" fill="#805e3c"/><path d="M0 0 328 104V300L0 400Z" fill="#a84632"/><path d="M960 0 632 104V300l328 100Z" fill="#994032"/>'+R(328,104,304,196,'#bb6150');
for(let row=0;row<10;row++){const y=row*40;body+=L(`M0 ${y}L328 ${104+y*.49}M960 ${y}L632 ${104+y*.49}`,'#e5a58c',2);}
for(let i=1;i<8;i++){body+=L(`M${i*120} 400L${328+i*38} 300`,'#523c29',2)+L(`M${i*120} 0L${328+i*38} 104`,'#afafa3',1);}
body+=R(347,132,266,110,'#fff3cf','stroke="#332720" stroke-width="5"')+T('HERETIC',480,192,42,'#433d31','text-anchor="middle" font-weight="bold"')+T('OPEN DIRECTION',480,223,17,'#6b5942','text-anchor="middle"')+C(480,278,13,'#63b78d');
body+=R(25,25,167,111,'#13261e','fill-opacity=".8"')+L('M43 43h128v75H73V65h65v36h-42','#b1d1b8',3)+C(160,103,5,'#66da7d')+T('vector exit',23,374,20,'#fff');
write(14,{body,background:'#bb6150',summary:'A brick maze corridor whose far-wall Heretic poster and vector-exit map turn ablation into a navigation metaphor.',choices:['The far wall carries the project identity as a physical poster','An open route through the overlay map represents a freed direction']});
