import {svg,px,center,writeHeader} from './lib.mjs';
let stars='';for(let i=0;i<72;i++){const x=(i*173+57)%930+15,y=(i*67+23)%185;stars+=`<rect x="${x}" y="${y}" width="${i%7?1:2}" height="${i%7?1:2}" fill="${i%3?'#556da3':'#c7d0de'}"/>`;}
const story=[
'README.NFO — THE HEADER EXCHANGE',
'-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=',
'You dock at a quiet station full of forgotten display hardware.',
'Orange dots glow above the airlock. Copper bars ripple down a wall.',
'On every shelf: another way to make a repository feel like yours.',
'The curator hands you 152 styles and a licence to take them home...',
'',
'Sector: 013        Cargo: TEXT + SVG        Credits: MIT',
'',
'[C] Catalogue     [G] Galleries     [T] Tools     [L] Licence',
'',
'Command [READ ME]: _'];
const image=svg({height:424,background:'#02050c',defs:'<pattern id="planet" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#1939a3"/></pattern>',css:'.cursor{animation:blink 2s steps(1) infinite}@keyframes blink{50%{opacity:.2}}',title:'README.NFO — the header exchange door game',description:'A space-station door game with stencil-like title, planet vignette, second-person narration, catalogue choices and a command prompt.',body:
stars+'<circle cx="863" cy="19" r="112" fill="#081750"/><circle cx="863" cy="19" r="112" fill="url(#planet)"/>'+
'<path d="M25 132h240m430 0h240M86 154h130m530 0h140" stroke="#17305e"/>'+center('README.NFO',56,6,'#8997ba')+center('README.NFO',51,6,'#f1f3ef')+
center('THE HEADER EXCHANGE / SECTOR 013',109,1.8,'#dea1e9')+
'<path d="M33 158h894v194H33z" fill="#02050c" stroke="#183e89"/>'+px('DOCKING BAY / PUBLIC ARCHIVE',51,171,2,'#fafbe6')+
['YOU DOCK AT A STATION FULL OF FORGOTTEN DISPLAY HARDWARE.',
'ORANGE DOTS GLOW ABOVE THE AIRLOCK. COPPER BARS RIPPLE.',
'ON EVERY SHELF: A WAY TO MAKE A REPOSITORY FEEL LIKE YOURS.',
'TAKE 152 STYLES AND A LICENCE TO BRING THEM HOME...'].map((s,i)=>px(s,51,208+i*26,1.8,'#77d598')).join('')+
px('CARGO: TEXT + SVG    LICENCE: MIT',51,323,1.8,'#deb871')+
px('[C] CATALOGUE   [G] GALLERIES   [T] TOOLS   [L] LICENCE',39,370,1.9,'#e8db6d')+
px('COMMAND [READ ME]:',39,399,1.9,'#d588ca')+'<rect class="cursor" x="263" y="399" width="12" height="14" fill="#d588ca"/>'});
writeHeader(19,{image,summary:'An original space-station door game: narrated arrival, a starfield, bracketed choices and a command prompt.',markdown:[
'<p align="center"><img src="assets/19-ansi-06.svg" width="100%" alt="README.NFO space door game header"></p>',
'','[C — Catalogue](../../styles/INDEX.md) · [G — Galleries](../README.md) · [T — Tools](../../tools/preview.mjs) · [L — Licence](../../LICENSE)',
'','<details><summary>Copy the text screen</summary>','','```text',...story,'```','','</details>'].join('\n')});
