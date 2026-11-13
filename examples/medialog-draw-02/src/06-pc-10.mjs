// Fake desktop cracked open to expose a social timeline underneath.
import {R,P,L,C,T,B,icon,bevel,save} from './lib.mjs';
let s=T('MediaLog',48,123,112,'#006969','font-weight="900" letter-spacing="-6"');
const hole='M497 159L583 197L665 146L724 188L859 171L822 237L962 275L906 333L949 395L826 384L755 451L679 399L572 444L590 352L515 309L548 245Z';
s+=P(hole,'#060a13','stroke="#87cebf" stroke-width="2"');
for(let i=0;i<9;i++)s+=`<g clip-path="url(#hole)">${L(`M${430+i*74} 150L${518+i*30} 444M490 ${180+i*30}Q720 ${145+i*39} 1000 ${180+i*30}`,'#632c3e',1)}</g>`;
s+=L('M704 213V394','#f08987',3);
['WATCHED','READ','PLAYED','LISTENED'].forEach((t,i)=>{s+=C(704,229+i*47,6,'#f08987')+B(t,731,223+i*47,1.7,'#f4d9cb')+L(`M691 ${229+i*47}H${665-i%2*18}`,'#f08987',2);});
s+=L('M665 146L695 92L648 46M962 275L990 232M515 309L465 355L402 331M755 451L782 476','#6bc8bf',2);
s+=icon(1,43,170,36,'#e7f2d4')+B('My log',26,223,1.4,'#fff')+icon(2,43,267,36,'#e7f2d4')+B('Friends',23,318,1.4,'#fff');
s+=bevel(146,184,350,236)+R(152,191,338,27,'#000080')+B('MEDIALOG',163,198,1.9,'#fff')+R(158,231,326,176,'#075d58');
s+=B('A MEDIA DIARY',178,255,2.65,'#e9f1d1')+B('YOU SHARE.',178,285,2.65,'#e9f1d1')+B('Everything you have',177,339,1.65,'#9cded6')+B('been into, together.',177,364,1.65,'#9cded6');
s+=bevel(0,470,1000,40)+bevel(7,477,92,26)+B('START',20,484,1.7,'#151f2b')+bevel(111,477,212,26)+B('One timeline',125,484,1.7,'#151f2b')+B('FRIENDS & ME',805,484,1.7,'#151f2b');
save(6,{body:s,background:'#008080',height:510,defs:`<clipPath id="hole">${P(hole,'#fff')}</clipPath>`,summary:'A timeline under the desktop',choices:['The crack reveals a continuous diary of watched, read, played and listened','Desktop icons are My log and Friends, with the core shared-diary pitch in the foreground dialog']});
