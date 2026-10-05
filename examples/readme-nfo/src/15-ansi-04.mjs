import { svg, px, writeHeader } from './lib.mjs';

// One independent erase cover per terminal row: CSS hides it after its character pass.
const rows=[];
rows.push({y:43,text:'+--- README.NFO / THE HEADER ARCHIVE ------------------------------------+',scale:1.7,color:'#55ffff'});
rows.push({y:88,text:'README.NFO',scale:8,color:'#ffff55',x:126});
rows.push({y:164,text:'[ 152 STYLES ]  [ 13 FAMILIES ]  [ TEXT + SVG ]',scale:2.5,color:'#ffffff',x:126});
rows.push({y:207,text:'BRING SOME CHARACTER TO YOUR NEXT REPOSITORY.',scale:2.2,color:'#55ffff',x:126});
rows.push({y:248,text:'COPY THE HEADER. MAKE IT YOURS. MIT LICENSE.',scale:2.2,color:'#aaaaaa',x:126});
rows.push({y:292,text:'[DOWNLOAD COMPLETE]   2400 BAUD   20 CANDIDATES',scale:1.8,color:'#55ff55',x:126});
let contents='';
for(const [i,row] of rows.entries()) {
 const x=row.x??52,w=Math.min(850-x,(row.text.length*6)*row.scale),h=row.scale*7;
 contents+=px(row.text,x,row.y,row.scale,row.color);
 contents+=`<g transform="translate(${x} ${row.y-2})"><rect class="cover" width="${w+8}" height="${h+6}" fill="#000" style="--end:${w+8}px;animation-delay:${i*.8}s"/><rect class="cursor" width="${row.scale*5}" height="${h+3}" fill="#fff" style="--end:${w+8}px;animation-delay:${i*.8}s"/></g>`;
}
const sprite=(color,dx=0)=>`<g transform="translate(${790+dx} 272)" fill="${color}"><path d="M0 0h20v4H0zM-4 4h28v16H-4zM0 20h20v4H0zM0 24h4v8H0zM16 24h4v8h-4z"/><rect x="2" y="8" width="4" height="4" fill="#000"/><rect x="14" y="8" width="4" height="4" fill="#000"/><path d="M4 16h12" stroke="#000" stroke-width="3"/></g>`;
const image=svg({height:340,background:'#000000',
css:'.cover{opacity:0;transform:translateX(var(--end));animation:draw .8s steps(72) both}.cursor{opacity:0;animation:cursorpass .8s steps(72) both}.sprite{animation:walk 1.2s steps(2) infinite}.blink{animation:blink 1.4s steps(1) infinite}@keyframes draw{0%{opacity:1;transform:translateX(0)}94%{opacity:1;transform:translateX(var(--end))}95%,100%{opacity:0;transform:translateX(var(--end))}}@keyframes cursorpass{0%{opacity:1;transform:translateX(0)}94%{opacity:1;transform:translateX(var(--end))}95%,100%{opacity:0;transform:translateX(var(--end))}}@keyframes walk{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes blink{0%,60%{opacity:1}61%,100%{opacity:0}}@media(prefers-reduced-motion:reduce){.cover,.cursor{display:none}}',
description:'A colourful ANSI header draws itself once at modem speed into README.NFO, 152 styles, thirteen families and a download-complete prompt. A small original block robot keeps bobbing after the reveal.',
body:`<path d="M27 25H933V315H27Z" fill="none" stroke="#0000aa" stroke-width="3"/>
<path d="M34 32H926V308H34Z" fill="none" stroke="#5555ff"/>
${contents}<g class="sprite">${sprite('#ff55ff')}</g><rect x="635" y="292" width="8" height="12" fill="#55ff55" class="blink"/>`
});
const markdown=`<p align="center"><img src="assets/15-ansi-04.svg" width="100%" alt="A bright yellow README.NFO logo and cyan ANSI text draw in at modem speed, with a small magenta robot."></p>

\`\`\`text
README.NFO / THE HEADER ARCHIVE
152 styles / 13 families / text + SVG
Bring some character to your next repository.
Copy the header. Make it yours. MIT license.
[DOWNLOAD COMPLETE]  2400 BAUD  20 CANDIDATES
\`\`\`

[Style catalogue](../../styles/INDEX.md) · [Example galleries](../README.md) · [MIT licence](../../LICENSE)`;
writeHeader(15,{image,markdown,summary:'Bright ANSI letters paint in row by row at modem speed, then a little block robot keeps the connection alive.'});
