import {R,C,L,T,write} from './lib.mjs';
let body=R(0,0,960,400,'url(#dither)')+R(0,0,960,28,'#fff')+T('H   File   Edit   Model   Directions',19,21,17,'#000','font-family="Arial,sans-serif" font-weight="bold"')+R(91,65,780,294,'#000')+R(84,58,780,294,'#fff','stroke="#000" stroke-width="2"');
for(let y=65;y<90;y+=4)body+=L(`M91 ${y}H856`,'#000',1);
body+=R(316,63,299,30,'#fff')+T('heretic / research desktop',466,83,17,'#000','text-anchor="middle"')+R(98,66,16,16,'#fff','stroke="#000"')+T('HERETIC',131,157,56,'#000','font-family="Arial,sans-serif" font-weight="bold"');
body+=T('One direction removed. Research remains.',132,192,19,'#000');
for(const [x,y] of [[172,250],[226,286],[281,249]])body+=C(x,y,16,'#fff','stroke="#000" stroke-width="2"');
body+=L('M188 250l38 36 39-37','#000',2)+T('MODEL  →  ABLATION',330,259,21,'#000')+R(588,288,235,38,'#fff','rx="8" stroke="#000" stroke-width="3"')+T('Open README',705,314,18,'#000','text-anchor="middle"')+T('Python / AGPL-3.0',130,326,15,'#000');
write(11,{body,background:'#fff',defs:'<pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#000"/></pattern>',summary:'A strictly black-and-white research desktop with striped chrome, hard shadow and a removable direction diagram.',choices:['A model-node sketch replaces the stock desktop icon','The window presents directional ablation with 1-bit geometry']});
