import {R,C,L,T,write} from './lib.mjs';
let body='';
for(let layer=0;layer<12;layer++){const r=151-layer*10;body+=`<path d="M480 ${36+layer*7}l${r} ${r*.69}-${r} ${r*.54}-${r}-${r*.54}z" fill="${['#202b31','#34414a','#6c7880','#afbbb8'][layer%4]}" opacity=".72"/>`;}
body+=L('M347 134 480 196 613 134M480 50V196','#e3eee4',5)+C(480,196,18,'#e3eee4')+L('M480 196v40','#e3eee4',3);
for(let side of [38,912])for(let row=0;row<18;row++)body+=R(side,row*21+8,10,16,'#8c9b9c',`opacity="${.2+(row%5)*.13}"`);
body+=T('HERETIC',480,318,77,'#e1ece0','text-anchor="middle" font-family="Impact,Arial Narrow,sans-serif" font-weight="bold" letter-spacing="7"')+T('D I R E C T I O N A L   A B L A T I O N',480,357,19,'#a5b5b2','text-anchor="middle"')+T('PYTHON ..... MODEL RESEARCH  ↔  OPEN DIRECTIONS ..... AGPL-3.0',480,383,13,'#728780','text-anchor="middle"');
write(20,{body,background:'#080e10',summary:'A shaded NFO poster dominated by an abstract model-direction sculpture, with condensed lettering at its foot.',choices:['A removed vector is sculpted as the central open branch','Shaded margin pillars carry the illustration into mirrored research fields']});
