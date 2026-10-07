import {R,L,T,write} from './lib.mjs';
const segments=[[[0,0],[40,0]],[[0,0],[0,35]],[[40,0],[40,35]],[[0,35],[20,35]],[[20,35],[40,35]],[[0,35],[0,70]],[[40,35],[40,70]],[[0,70],[40,70]],[[0,0],[20,35]],[[40,0],[20,35]],[[20,35],[0,70]],[[20,35],[40,70]],[[20,0],[20,35]],[[20,35],[20,70]]];
const letters={H:[1,2,3,4,5,6],E:[0,1,3,4,5,7],R:[0,1,2,3,4,5,11],T:[0,12,13],I:[0,7,12,13],C:[0,1,5,7]};
let body=R(32,37,896,297,'#051014','rx="24" stroke="#263d44" stroke-width="4"');
[...'HERETIC'].forEach((letter,i)=>{const x=99+i*112,y=105;segments.forEach(([a,b],s)=>{body+=L(`M${x+a[0]*1.8} ${y+a[1]*1.8}L${x+b[0]*1.8} ${y+b[1]*1.8}`,'#6fffe9',6,`opacity="${letters[letter].includes(s)?1:.07}" stroke-linecap="round"`);});});
body+=T('MODEL    /    ABLATION    /    SEARCH',480,282,21,'#ff7a1a','text-anchor="middle"')+T('HERETIC / PYTHON / AGPL-3.0',480,375,20,'#7faaa7','text-anchor="middle"');
write(32,{body,background:'#111c22',summary:'A blue-green starburst VFD faceplate with separately constructed Heretic segment cells and orange research annunciators.',choices:['Fourteen-segment lettering is drawn specifically for the seven-letter name','Workflow stages become fixed front-panel annunciators']});
