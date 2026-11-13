// Handheld tracker colours and cursor grammar become a compact pattern-heart.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=R(31,48,186,201,'#2e314a','rx="26"')+R(44,61,160,176,'#f8e4ef','rx="17"');
for(let r=0;r<3;r++)for(let c=0;c<3;c++)body+=R(58+c*44,77+r*44,36,36,(r+c)%2?'#fff6f1':'#ade4e7','rx="4"');
body+=P('M78  90 H106V119H137V 90 H164V143L120 188L78 146Z','#ea758d')+P('M55 195L 80 211L55 226Z','#2e314a')+R(101,207,80,8,'#a37ca0','rx="4"');
body+=word({x:259,y:95,width:498,height:117,weight:17,ink:'var(--ink)',inks:[null,null,null,null,null,'#b56380','#b56380','#b56380']});
save(18,{body,name:'Pocket mixtape',description:'A cyan-and-pink phrase grid forms a heart inside a handheld badge. A playful identity for the patterns in what you love.',choices:['The tracker cursor becomes a play arrow for your own mix','One large heart replaces tiny note codes while retaining the reference’s palette and grid structure']});
