// Original skinned player: a life playlist, with date precision replacing elapsed time.
import {R,L,P,T,B,C,colors,media,save} from './lib.mjs';
const edge=(x,y,w,h,title)=>R(x,y,w,h,'#292942','stroke="#61617b" stroke-width="3"')+R(x+6,y+6,w-12,19,'#181829')+B(title,x+23,y+10,1.3,'#e4d296')+L(`M${x+10} ${y+5}H${x+w-10}`,'#c6b989',1);
let s=R(0,0,1000,510,'#0e101a');
s+=edge(25,26,566,222,'MEDIALOG / PERSONAL PLAYBACK')+R(42,65,531,105,'#050709');
s+=B('MEDIALOG',61,80,9.5,'#c6f389',480)+B('A MEDIA DIARY YOU SHARE',61,151,1.8,'#62cf9c');
for(let i=0;i<26;i++){const h=8+(i*17%43);s+=`<g class="bar" style="animation-delay:-${i*.23}s">${R(45+i*7,226-h,4,h,'#85e665')+R(45+i*7,226-h,4,4,'#ffbb57')}</g>`;}
s+=R(252,186,314,9,'#0c0e16')+R(252,186,185,9,'#b9ae74')+R(432,181,10,19,'#f0e1a5');
['|<','>','||','[]','>|'].forEach((v,i)=>s+=R(253+i*46,210,39,25,'#abb0b5','stroke="#e1e2d4"')+B(v,261+i*46,217,1.5,'#222536'));
s+=edge(25,264,566,214,'MEMORY MIX / HOW IT WAS')+R(41,301,534,159,'#141521');
['WATCHED','READ','PLAYED','LISTENED'].forEach((m,i)=>{const x=70+i*132;s+=B(m,x-13,318,1.4,'#d5cfaf',119)+R(x+24,341,5,80,'#655e36')+L(`M${x+8} 353h38m-38 20h38m-38 20h38m-38 20h38`,'#35374d',1)+R(x+13,355+(i*13%45),28,10,'#e6d28c')+B(['LOVED','LIKED','REVISIT','SHARE'][i],x-10,437,1.4,'#89d395',115);});
s+=edge(610,26,365,452,'PLAYLIST / ONE TIMELINE');
s+=R(625,64,334,369,'#050709')+B('WHEN / WHAT / HOW',640,77,1.5,'#baba85');
const rows=[['A FILM','LAST NIGHT'],['A BOOK','SOMETIME IN 2015-2019'],['A SHOW','THIS WEEK'],['A GAME','ONE SUMMER'],['AN ALBUM','ON REPEAT'],['A PODCAST','ON THE WAY HOME']];
rows.forEach(([a,b],i)=>{const y=112+i*48;s+=R(631,y,320,44,i===1?'#1419a8':'#0b1012')+B('0'+(i+1),640,y+7,1.6,colors[i])+B(a,677,y+7,1.8,'#abef9c')+B(b,677,y+27,1.1,'#b9bbd3');});
s+=B('FRIENDS & ME',639,414,1.6,'#efdea7')+B('LOG   RECALL   SHARE',636,453,1.45,'#d5d4b6');
save(2,{body:s,height:510,css:'.bar{transform-box:fill-box;transform-origin:bottom;animation:eq 2.4s steps(5,end) infinite}@keyframes eq{50%{transform:scaleY(.4)}}',summary:'Your life, on the playlist',choices:['Playlist rows are media memories with exact or approximate dates','Equaliser channels use watched, read, played and listened, with reactions replacing invented performance metrics']});
