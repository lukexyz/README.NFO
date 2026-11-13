// Music-disk jukebox: an arched navy cabinet with gold columns, a record turning behind the dome
// and a track list whose selected row sits on a red bar.
import {P,L,R,C,G,f,rr,lg,rg,tile,rim,save} from './lib.mjs';
const body='M40 244V128A80 80 0 0 1 200 128V244Z';
const dome='M68 172V130A52 52 0 0 1 172 130V172Z';
let grooves='';
for(const r of [36,31,26,21])grooves+=C(120,140,r,'none','stroke="#2b3550" stroke-width="1.6"');
const record=C(120,140,40,'#0b0f1a')+grooves+C(120,140,13,'#c4473d')+C(120,140,3,'#f6f3eb')
 +P('M120 100A40 40 0 0 1 156 122L120 140Z','#ffffff','opacity=".09"');
// Track list: three rows, times right-aligned, the middle one selected.
const rows=R(64,178,112,40,'#0b0f1a','rx="5"')
 +R(72,184,58,5,'#9fb4d4')+R(150,184,18,5,'#9fb4d4')
 +R(68,195,104,11,'#c4473d','rx="2"')+R(72,198,64,5,'#f6f3eb')+R(150,198,18,5,'#f6f3eb')
 +R(72,211,46,5,'#6c84a8')+R(150,211,18,5,'#6c84a8');
let grille='';
for(let i=0;i<7;i++)grille+=R(72+i*14.5,226,7,12,'#0b0f1a','rx="2"');
const defs=lg('gold',[[0,'#f6d48d'],[.5,'#d39a5c'],[1,'#8a5a2c']],[0,0,1,0])+lg('arch',[[0,'#f6e3b8'],[1,'#d39a5c']])
 +`<clipPath id="dome"><path d="${dome}"/></clipPath>`+rg('glow',[[0,'#f6d48d',.55],[1,'#f6d48d',0]]);
const icon=C(120,128,92,'url(#glow)')
 +P(body,tile,`stroke="${rim}" stroke-width="3"`)
 +P('M48 236V128A72 72 0 0 1 192 128V236','none','stroke="url(#arch)" stroke-width="7"')
 +R(40,128,14,116,'url(#gold)')+R(186,128,14,116,'url(#gold)')
 +R(44,140,6,92,'#fff','opacity=".25" rx="3"')+R(190,140,6,92,'#fff','opacity=".25" rx="3"')
 +P(dome,'#26365c')+G(record,'','clip-path="url(#dome)"')+P(dome,'none','stroke="#f6e3b8" stroke-width="4"')
 +rows+grille;
save(3,{icon,defs,name:'Jukebox',description:'An arched navy jukebox with gold columns plays a record under its dome; below, a track list holds the selected album on a red bar.',choices:['The chip-music jukebox screen becomes the cabinet itself: a dome, gold columns and a three-row track list with right-aligned times','A red selection bar and a red record label are the only strong colours against navy and gold']});
