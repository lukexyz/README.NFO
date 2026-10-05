import { svg, px, writeHeader } from './lib.mjs';

const grey='#d2d2d2', blue='#00007f';
const log=(text,y,colour='#000000')=>px(text,34,y,1.8,colour);
let body=`<rect x="10" y="10" width="940" height="412" fill="${grey}" stroke="#7f7f7f" stroke-width="2"/><path d="M11 421V11H949" fill="none" stroke="#ffffff" stroke-width="2"/><rect x="18" y="18" width="924" height="28" fill="${blue}"/>${px('#README.NFO [6] [+NT] : A FIRST IMPRESSION IN EVERY STYLE',30,27,1.7,'#ffffff')}<rect x="916" y="23" width="20" height="18" fill="${grey}"/>${px('X',923,29,1,'#000000')}${px('FILE   VIEW   CHANNEL   WINDOW   HELP',28,58,1.6,'#000000')}<rect x="24" y="82" width="736" height="282" fill="#ffffff" stroke="#7f7f7f"/><rect x="776" y="82" width="162" height="282" fill="#ffffff" stroke="#7f7f7f"/>${log('* visitor joined #readme.nfo',96,'#009300')}${log('* topic: retro headers / text art + SVG / MIT',118,'#00007f')}${log('<archive>',150,'#9c009c')}${px('README.NFO',174,147,8,'url(#art-colours)')}<rect class="paste-cover" x="171" y="145" width="484" height="61" fill="#ffffff"/>${log('<archive> 152 styles. 13 families. Your next README.',225,'#009393')}${log('<visitor> !copy',248)}${log('<toolkit> pick a header, copy its .md and SVG, customise.',271,'#00007f')}<g class="joined">${log('* styles and examples are back in the channel',306,'#009300')}${log('<maintainer> keep your favourite numbers',330,'#7f0000')}</g><g class="split">${log('* styles quit (archive.local preview.local)',306,'#ff0000')}${log('* examples quit (archive.local preview.local)',330,'#ff0000')}</g>`;
const nicks=['maintainer','archive','+toolkit','styles','examples','visitor'];
const atRows=[14,17,23,21,23,16,15];
const atPath=atRows.map((row,y)=>Array.from({length:5},(_,x)=>row&(1<<(4-x))?`M${x} ${y}h1v1h-1z`:'').join('')).join('');
nicks.forEach((nick,i)=>{
  const y=101+i*26;
  if(i<2) body+=`<path d="${atPath}" transform="translate(788 ${y}) scale(1.7)" fill="#00007f"/>`;
  body+=px(nick,i<2?798.2:788,y,1.7,i<2?'#00007f':'#000000');
});
body+=`<rect x="24" y="380" width="914" height="26" fill="#ffffff" stroke="#7f7f7f"/>${px('!README.NFO  /  PICK A STYLE. MAKE IT YOURS. _',34,388,1.7,'#000000')}`;
const image=svg({width:960,height:432,background:'#7f7f7f',body,
  title:'README.NFO — colour-art channel window',description:'A grey chat client shows #readme.nfo, a colour-cell repository logo, role-based nicknames, a copy command and a brief fictional netsplit.',
  defs:'<linearGradient id="art-colours"><stop stop-color="#0000fc"/><stop offset=".25" stop-color="#009393"/><stop offset=".5" stop-color="#009300"/><stop offset=".75" stop-color="#9c009c"/><stop offset="1" stop-color="#fc7f00"/></linearGradient>',
  css:'.paste-cover{transform:scaleY(0);transform-origin:171px 145px;animation:paste 22s steps(7) infinite}.joined{opacity:1;animation:joined 22s steps(1) infinite}.split{opacity:0;animation:split 22s steps(1) infinite}@keyframes paste{0%,10%,100%{transform:scaleY(0)}11%{transform:scaleY(1)}27%{transform:scaleY(0)}}@keyframes joined{0%,69%,88%,100%{opacity:1}70%,87%{opacity:0}}@keyframes split{0%,69%,88%,100%{opacity:0}70%,87%{opacity:1}}',
});
writeHeader(21,{image,summary:'A grey IRC channel window, a bot-pasted colour logo and a brief fictional netsplit.',alt:'A generic IRC client showing the README.NFO channel, a colour-cell logo, role nicknames and copy instructions.'});
