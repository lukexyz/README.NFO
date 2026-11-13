// Original diary sprites, plus companion play tokens. No historical saver characters.
import {R,P,L,C,B,save,colors} from './lib.mjs';
function book(x,y,c){return `<g transform="translate(${x} ${y})"><g class="drift">${R(0,8,22,31,c)+R(24,8,22,31,'#ece6c9')+R(19,5,7,38,'#7f91a2')+R(3,12,13,3,'#eee5b8')+R(3,20,13,3,'#eee5b8')+R(29,14,11,3,'#4b6773')+R(29,23,11,3,'#4b6773')+R(4,40,39,4,'#3b4857')}</g></g>`;}
let s='';for(let i=0;i<15;i++){let x=(i*193)%970,y=(i*71)%328;if(y>100&&y<233)y=30+(i%2)*251;s+=book(x,y,colors[i%6]);}
for(let i=0;i<10;i++)s+=P(`M${25+i*99} ${25+(i*47)%310}l9 5-9 5Z`,'#687f8c');
s+=R(145,121,710,148,'#020609')+B('MEDIALOG',201,147,12.5,'#e9f0d2',610)+B('LET YOUR MEMORIES WANDER.',273,249,2.5,'#a9bdcc');
s+=R(131,361,738,116,'#c5c6c2','stroke="#f1f0e8" stroke-width="3"')+R(137,367,726,23,'#f7f7ed')+B('DIARY DRIFT / MODULE SETTINGS',162,374,1.6,'#162433');
s+=B('MODULE: SHARED MEMORIES',154,407,1.8,'#253347')+B('PACE: TAKE YOUR TIME',154,443,1.8,'#253347')+L('M517 444H753','#485261',3)+R(602,434,16,20,'#f6f5e9','stroke="#3b4354" stroke-width="2"')+B('PREVIEW',730,407,1.4,'#263646');
save(5,{body:s,background:'#020609',height:505,css:'.drift{animation:drift 14s ease-in-out infinite alternate}@keyframes drift{to{transform:translate(-55px,30px)}}',summary:'Diary Drift screensaver',choices:['The repeated sprite is an open diary, accompanied by play tokens','A fictional module panel says shared memories and take your time, without invented usage numbers']});
