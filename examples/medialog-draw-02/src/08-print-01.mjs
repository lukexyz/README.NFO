// Swapper's floppy: original multi-stroke lettering and an invitation passed to friends.
import {R,P,L,C,T,B,word,save} from './lib.mjs';
function disk(x,y,a,color,label,front=false){let d=R(0,0,322,343,color,'rx="8"')+R(17,20,288,175,'#f3efde','rx="3"')+R(17,303,19,20,'#111e32')+R(255,215,25,17,'#111e32')+R(62,216,172,126,'#adb9bb')+R(160,238,43,83,'#243c51');
for(let i=0;i<18;i++)d+=L(`M67 ${221+i*6}H151`,'#c7cecc',1);
if(front){d+=word(30,44,30,'#243854','marker')+word(30,44,30,'#f3efde')+L('M28 87Q158 96 288 86M31 94Q157 103 284 94','#243854',2)+T('A media diary you share.',30,129,20,'#264c85','font-style="italic"')+T('pass it on / keep the memories',31,158,15,'#466485','font-style="italic"')+C(266,177,13,'none','stroke="#ac4849" stroke-width="2"')+T('1',262,183,17,'#ac4849');}
else d+=T(label,29,66,23,'#305079','font-style="italic"')+L('M30 79H289','#6982a2',1);
return `<g transform="translate(${x} ${y}) rotate(${a} 161 172)">${d}</g>`;}
let s=R(0,0,1000,530,'#e5dfce');
s+=P('M605 71L947 113L905 439L562 397Z','#ccc2ae')+P('M611 61L953 103L911 429L568 387Z','#f5ecd7')+L('M611 61L753 258L953 103M568 387L720 235M911 429L790 245','#c6bca6',2);
s+=disk(259,70,13,'#7a4854','LISTENED')+disk(165,64,2,'#354856','WATCHED / PLAYED')+disk(60,121,-8,'#28669a','',true);
s+=`<g transform="translate(598 154) rotate(5)">${R(0,0,323,294,'#fffbed')}${T('Dear future me,',24,42,24,'#2b517f','font-style="italic"')}${L('M24 66H299M24 104H299M24 142H299M24 180H299M24 218H299','#d2d4d0',1)}${T('What did you watch?',24,91,20,'#2b517f')}${T('What stayed with you?',24,129,20,'#2b517f')}${T('When was it?',24,167,20,'#2b517f')}${T('Who should hear about it?',24,205,20,'#2b517f')}${T('All on one timeline.',24,266,22,'#a14d4c','font-style="italic"')}</g>`;
s+=T('MEMORIES ARE BETTER PASSED AROUND.',43,502,15,'#526275','letter-spacing="2"');
save(8,{body:s,height:530,summary:'The diary swap',choices:['A fan of disks separates watched, played and listened memories, with the diary on the front label','A handwritten note asks when it was and who should hear about it, turning the swap into a social invitation']});
