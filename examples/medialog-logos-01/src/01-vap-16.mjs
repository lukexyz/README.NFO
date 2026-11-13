// A saved moment + reply bubble: short signal echoes; the main wordmark never disappears.
import {P,L,R,C,G,word,save} from './lib.mjs';
const silhouette='M63 60H167Q185 60 185 78V160Q185 180 165 180H129L101 211V180H63Q45 180 45 160V80Q45 60 63 60Z';
let icon=G(P(silhouette,'#ff4fbd'),'translate(13 5)')+G(P(silhouette,'#12dce6'),'translate(-5 -5)')+P(silhouette,'#18263c')+P('M91 88L147 121L91 153Z','#edffff');
icon+=R(31,109,30,9,'#13e0db')+R(178,147,26,8,'#ff51b5')+R(157,193,18,7,'#13e0db');
let body=icon+word({x:252,y:88,width:507,height:110,kind:'tech',weight:17,ink:'var(--ink)'});
body+=`<g class="echo">${word({x:258,y:88,width:507,height:110,kind:'tech',weight:17,ink:'#13d6d5'})}</g>`;
body+=L('M258 224H516','#13c5c9',5)+L('M545 224H610','#fa43b0',5)+C(634,224,5,'#fa43b0');
save(1,{body,defs:'<clipPath id="slice"><rect x="237" y="136" width="560" height="8"/></clipPath>',css:'.echo{clip-path:url(#slice);opacity:.8;animation:echo 8s steps(1,end) infinite}@keyframes echo{0%,87%,94%,100%{transform:translateX(0)}89%,92%{transform:translateX(10px)}}',name:'Signal saved',description:'A play button becomes a saved moment and a conversation. Cyan and pink signal offsets give the mark a clean, deliberate glitch.',choices:['One speech-tail mark joins experiencing and sharing','The timeline ends in a saved pink dot; glitch is confined to one small stripe']});
