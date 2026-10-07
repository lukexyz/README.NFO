import {R,L,T,W,write} from './lib.mjs';
let body='';
for(let row=0;row<5;row++)for(let col=0;col<60;col++)if((row*7+col*11)%9<4)body+=R(47+col*14,235+row*13,7,7,'#cbd3df',`opacity="${.6-row*.1}"`);
body+=W(50,77,19,'url(#ink)',{maxWidth:860})+L('M28 40H932M28 334H932','#5b6774');
body+=T('D I R E C T I O N A L   A B L A T I O N',480,304,20,'#d7e0e7','text-anchor="middle"')+T('PYTHON :..... LANGUAGE    <->    LICENCE .....: AGPL-3.0',480,365,16,'#9ca8b9','text-anchor="middle"');
write(3,{body,background:'#080a0d',defs:'<linearGradient id="ink" x2="0" y2="1"><stop stop-color="#eef3f5"/><stop offset=".55" stop-color="#a4aebb"/><stop offset="1" stop-color="#29313e"/></linearGradient>',summary:'Tall condensed NFO slabs dissolve into shaded debris over mirrored Heretic information fields.',choices:['The ablation metaphor appears as disappearing letter feet','Python and AGPL-3.0 become mirrored dot-leader fields']});
