import {R,C,L,T,write} from './lib.mjs';
let body=R(28,29,76,59,'#16286b','stroke="#e0efff" stroke-width="3"')+T('H',66,77,43,'#fff','text-anchor="middle" font-weight="bold"')+T('HERETIC',125,64,49,'#ffff68','font-family="Arial,sans-serif" font-weight="900"')+T('Research forecast',128,93,23,'#fff')+T('OPEN DIRECTIONS',920,56,17,'#fff','text-anchor="end"')+T('illustrative forecast',920,85,15,'#d5d9e8','text-anchor="end"');
body+=R(101,119,758,224,'#1c2a5d','rx="4" stroke="#4476ca" stroke-width="4"')+T('Language Models',126,158,25,'#ffff68','font-weight="bold"');
body+=C(214,223,29,'#ffd77b','stroke="#0c1735" stroke-width="4"');
for(let i=0;i<8;i++){const a=i*Math.PI/4;body+=L(`M${214+Math.cos(a)*40} ${223+Math.sin(a)*40}l${Math.cos(a)*16} ${Math.sin(a)*16}`,'#ffd77b',5);}
[['Implementation','Python'],['Direction','Ablation'],['Search','Optuna / TPE']].forEach(([a,b],i)=>{body+=T(a+':',338,216+i*42,23,'#fff')+T(b,831,216+i*42,23,'#fff','text-anchor="end" font-weight="bold"');});
body+=R(0,365,960,35,'#19366c')+T('p-e-w/heretic  /  automatic research, open model horizons',27,390,19,'#fff');
write(8,{body,background:'url(#weather)',defs:'<linearGradient id="weather" x2="0" y2="1"><stop stop-color="#180f57"/><stop offset=".5" stop-color="#38194a"/><stop offset="1" stop-color="#b9570d"/></linearGradient>',summary:'An indigo-to-orange forecast broadcast, with a sun emblem and label/value rows describing Heretic research.',choices:['The forecast describes model research instead of invented weather','A directional sun and explicit illustrative label establish the metaphor']});
