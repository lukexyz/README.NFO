// An original ASCII dungeon whose six rooms are connected by one timeline.
import {R,B,T,save,colors} from './lib.mjs';
const map=[
'  +-----------+        +-----------+        +-----------+',
'  | FILM    ! |########| BOOK    ? |########| SHOW    * |',
'  | ......... |        | ......... |        | ......... |',
'  +-----+-----+        +-----+-----+        +-----+-----+',
'        #                    #                    #',
'  @#####.####################.####################.####>',
'        #                    #                    #',
'  +-----+-----+        +-----+-----+        +-----+-----+',
'  | GAME    ) |        | ALBUM   = |        | PODCAST ( |',
'  | ......... |########| ......... |########| ......... |',
'  +-----------+        +-----------+        +-----------+',
];
let s=B('MEDIALOG',40,36,10.2,'#d7eacb')+B('YOU FOUND A MEMORY. ADD IT TO YOUR TIMELINE.',42,123,2.2,'#e7d99b');
map.forEach((row,i)=>{s+=`<text x="45" y="${180+i*21}" font-family="Consolas, monospace" font-size="22" xml:space="preserve" fill="${i===5?'#ead778':'#819891'}">${row.replaceAll('&','&amp;').replaceAll('>','&gt;')}</text>`;});
s+=B('@ YOU    ! WATCHED    ? READ    ) PLAYED    = LISTENED',44,437,1.8,'#bcc9b7');
s+=R(31,471,938,37,'#233b34')+B('NAME:MEDIALOG   QUEST:REMEMBER   PARTY:FRIENDS & ME',46,483,1.9,'#e1edc9')+B('WHEN:EXACT OR SOMETIME   HOW:YOUR WORDS   PATH:ONE TIMELINE',43,531,1.9,'#bdcdbc');
save(3,{body:s,background:'#080f0d',height:565,summary:'A dungeon of remembered things',choices:['Six media rooms open onto a single corridor through time','The player is you and the party is friends; uncertain dates are valid inventory, not missing data'],text:'MediaLog — a media diary you share.\nYou found a memory. Add it to your timeline.\n\n'+map.join('\n')+'\n\n@ you   ! watched   ? read   ) played   = listened\nWhen: exact or sometime. How: your words. Party: friends & me.'});
