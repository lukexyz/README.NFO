import {R,C,L,T,write} from './lib.mjs';
const alphabet={H:'M0 0l-3 62M38-2l-2 62M-1 31l38-2',E:'M0 0l-1 60h38M0 0h40M-1 30h31',R:'M0 62V0q42-5 40 17q-2 18-38 15M14 34l32 29',T:'M-6 0l48-2M17 2l-4 61',I:'M0 0h32M15 0l-2 62M-2 62h32',C:'M41 6Q-5-12-5 30Q-5 73 41 55'};
let body='';
[...'HERETIC'].forEach((letter,i)=>{body+=`<g transform="translate(${90+i*113} ${83+i%2*5}) scale(1.6)">${L(alphabet[letter],'#e8f0ff',2.5,'stroke-linecap="round" stroke-linejoin="round"')}</g>`;});
body+=L('M72 211q370-19 783-3','#e8f0ff',2)+L('M95 270q10-47 71-33l17 43-58 23zM183 280l42-32 47 52M272 300l45-29 42 20','#dce9ff',2.5);
for(const [x,y] of [[407,273],[505,308],[595,266]])body+=C(x,y,15,'none','stroke="#e8f0ff" stroke-width="2"');
body+=L('M422 273l69 35M520 308l60-42','#e8f0ff',2)+T('one direction / drawn out of the model',68,364,24,'#e8f0ff','font-family="Georgia,serif" font-style="italic"')+`<g transform="translate(756 206) rotate(-27)">${R(0,-9,171,18,'#3cb043')}${R(137,-9,12,18,'#ffd400')}<path d="M0-9-25 0 0 9Z" fill="#e4c388"/><path d="M-19-2-25 0-19 2Z" fill="#17202c"/></g>`;
write(39,{body,background:'#2b5fa8',summary:'A blue-paper pencil sketch with seven original single-stroke letters, an open model graph and the pencil touching the newest line.',choices:['Heretic lettering is manually drawn with varied strokes and baseline','A broken graph direction and the pencil point make ablation a physical drawing action']});
