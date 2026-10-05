import {svg,px,center,writeHeader} from './lib.mjs';

const shades=['#220000','#440000','#660011','#880011','#aa2211','#cc3311','#ee5511','#ff8822'];
let rasters='',picture='';
for(let row=0;row<40;row++)rasters+=`<rect y="${row*10}" width="960" height="10" fill="${shades[Math.abs(7-row%16)]}" opacity=".45"/>`;
for(let row=0;row<17;row++)for(let column=0;column<31;column++){
 const y=155+row*8,x=593+column*8;
 const mountain=Math.floor(7+4*Math.sin(column*.22)+2*Math.sin(column*.57));
 let colour=shades[Math.min(7,Math.floor(row/2))];
 if(row>=mountain)colour=['#220022','#440033','#660033'][(column+row)%3];
 if(column>21&&column<27&&row>1&&row<7&&((column-24)**2+(row-4)**2)<10)colour='#ffcc55';
 picture+=`<rect x="${x}" y="${y}" width="8" height="8" fill="${colour}"/>`;
 if((row+column)%2===0)picture+=`<rect x="${x}" y="${y}" width="2" height="2" fill="#000" opacity=".22"/>`;
}
const scroller=center('RETRO HEADERS / TEXT + SVG',357,5.5,'url(#scroll)')+px('MAKE IT YOURS',1150,357,6,'url(#scroll)');
const image=svg({height:444,background:'#050000',title:'README.NFO — menu disk',
 description:'An original warm-gradient menu-disk title over rolling red raster bands, a key-numbered repository menu, a pixel sunset panel and a large bottom scroller.',
 defs:`<linearGradient id="logo" x2="0" y2="1"><stop stop-color="#ffff99"/><stop offset=".3" stop-color="#ffdd44"/><stop offset=".31" stop-color="#ffbb22"/><stop offset=".6" stop-color="#ff9922"/><stop offset=".61" stop-color="#ff6611"/><stop offset="1" stop-color="#cc2200"/></linearGradient><linearGradient id="scroll" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".3" stop-color="#ffffcc"/><stop offset=".6" stop-color="#ffbb55"/><stop offset="1" stop-color="#ff5522"/></linearGradient><clipPath id="rasterclip"><rect width="960" height="331"/></clipPath><clipPath id="scrollclip"><rect x="24" y="344" width="912" height="65"/></clipPath>`,
 css:`.rasters{animation:rasters 18s linear infinite}.scroll{animation:scroll 32s ease-in-out infinite}@keyframes rasters{from{transform:translateY(-10px)}to{transform:translateY(10px)}}@keyframes scroll{0%,30%,100%{transform:translateX(0)}70%,80%{transform:translateX(-900px)}}`,
 body:`<g clip-path="url(#rasterclip)"><g class="rasters">${rasters}</g></g>
    ${center('README.NFO',47,9,'#13000a',970)}${center('README.NFO',41,9,'url(#logo)')}
    ${center('ARCHIVE MENU / DISK 028',115,2,'#ffeebb')}
    <rect x="35" y="151" width="501" height="167" fill="#15040b" stroke="#dd5544" stroke-width="2"/>
    ${px('1...STYLE CATALOGUE',59,173,3,'#ffffaa')}${px('2...EXAMPLE GALLERIES',59,210,3,'#ffffff')}${px('3...PREVIEW + VALIDATE',59,247,3,'#ffffff')}${px('SPACE...MAKE IT YOURS',59,284,2.5,'#ffcc77')}
    <rect x="572" y="139" width="280" height="177" fill="#13000d" stroke="#aa4466" stroke-width="3"/>${picture}
    ${px('152 STYLES / 13 FAMILIES',578,297,1.6,'#fff0aa')}
    <rect x="24" y="342" width="912" height="69" fill="#0c0312"/><path d="M24 342H936M24 411H936" stroke="#dd6644" stroke-width="2"/>
    <g clip-path="url(#scrollclip)"><g class="scroll">${scroller}</g></g>
    ${px('SELECT A SECTION ABOVE. COPY / CUSTOMISE / SHARE UNDER MIT.',35,425,1.6,'#ffd2aa')}`});
const entries=['1 ... STYLE CATALOGUE .............. 152 STYLES','2 ... EXAMPLE GALLERIES ............ 13 FAMILIES','3 ... PREVIEW + VALIDATE ........... LOCAL TOOLS','SPACE ... COPY, CUSTOMISE, SHARE ... MIT'];
const text=['README.NFO / ARCHIVE MENU / DISK 028','',...entries].join('\n');
const markdown=`<p align="center"><img src="assets/28-c64-13.svg" width="100%" alt="README.NFO menu disk with orange logo, red rasters, numbered menu and pixel sunset"></p>\n\n\`\`\`text\n${text}\n\`\`\`\n\n[1: Styles](../../styles/INDEX.md) · [2: Examples](../README.md) · [3: Preview tools](../../tools/preview.mjs) · [Space: MIT reuse](../../LICENSE)`;
writeHeader(28,{image,markdown,summary:'A menu disk with red scanline rasters, warm logo, numbered keys and a pixel sunset.'});
