import {R,L,T,write} from './lib.mjs';
let body=T('HERETIC RESEARCH SETUP',480,42,30,'#fff','text-anchor="middle"')+R(24,68,912,239,'#0000a8','stroke="#fff" stroke-width="2"')+L('M480 68V307','#fff');
for(let row=0;row<10;row++){const y=97+row*19;body+=R(46,y,405,12,`hsl(${15+row*24} 85% 55%)`);body+=T('◀'.repeat(Math.max(1,5-Math.abs(row-5))),499,y+11,16,'#41a9ff');}
body+=T('Directional ablation',675,135,22,'#ffff55','text-anchor="middle"')+T('Python / Optuna / TPE',675,185,21,'#fff','text-anchor="middle"')+T('AGPL-3.0',675,231,20,'#fff','text-anchor="middle"')+T('Effect layer: illustrative',675,274,15,'#b1cbff','text-anchor="middle"');
body+=R(24,318,912,55,'#0000a8','stroke="#fff"')+T('READ README   |   INSPECT DIRECTION   |   SEARCH PARAMETERS',480,353,17,'#ffff55','text-anchor="middle"');
write(21,{body,background:'#0000a8',summary:'A split BIOS utility whose left panel breaks into orange-magenta rasters while research facts stay on the right.',choices:['A directional-arrow cluster disrupts the firmware menu','The research configuration panel carries only verified tools and licence']});
