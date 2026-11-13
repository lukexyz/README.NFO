// Windows 95 setup grammar: gathering six kinds of culture into one timeline.
import {R,P,L,C,T,B,bevel,icon,colors,media,save} from './lib.mjs';
let s=bevel(39,26,922,454)+R(46,33,908,31,'#000080')+B('MEDIALOG - PUT IT ALL ON ONE TIMELINE',61,41,1.9,'#fff');
s+=bevel(924,38,23,21)+B('X',932,43,1.4,'#111');
s+=R(57,80,244,324,'#182c63')+icon(1,122,117,111,'#eff4d7')+B('MEDIA',80,267,6,'#fff')+B('LOG',80,322,6,'#9abfe9');
s+=T('Your culture, collected.',326,116,36,'#1a2335','font-weight="700"')+T('Film. Book. Show. Game. Album. Podcast.',328,151,19,'#38415a');
media.forEach((m,i)=>{const x=328+(i%3)*197,y=181+Math.floor(i/3)*64;s+=bevel(x,y,183,48,'#efefe8',true)+icon(i,x+10,y+11,25,colors[i])+B(m,x+46,y+19,1.6,'#1b2a43',129);});
s+=L('M354 340H895','#737f92',3);
[['WHEN',354],['HOW IT WAS',615],['SHARE',895]].forEach(([v,x])=>{s+=C(x,340,7,'#000080')+B(v,x-(v.length*4.4),363,1.5,'#242c44');});
s+=T('Precise date or “sometime”. Your words. Your people.',328,399,18,'#303b55');
s+=L('M58 420H941','#808080',2)+L('M58 422H941','#fff',2)+B('A MEDIA DIARY YOU SHARE',61,447,1.7,'#253547');
['< BACK','NEXT >','CANCEL'].forEach((t,i)=>s+=bevel(571+i*124,437,112,28)+B(t,585+i*124,447,1.5,'#222')); 
save(7,{body:s,background:'#008080',height:507,summary:'The one-timeline setup wizard',choices:['The wizard collects the six supported media types in their screenshot-inspired colours','Its steps are when, how it was and share; approximate dates remain welcome']});
