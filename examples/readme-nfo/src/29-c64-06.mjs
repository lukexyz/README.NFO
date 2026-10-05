import {svg,px,center,writeHeader} from './lib.mjs';

let stars='';
for(let i=0;i<100;i++)stars+=`<rect x="${(i*179+47)%960}" y="${(i*73+19)%464}" width="${i%13?1:2}" height="${i%13?1:2}" fill="${i%3?'#7089a9':'#ffffff'}" opacity="${i%3?.45:.9}"/>`;
const options=[['STYLE CATALOGUE','152'],['VISUAL FAMILIES','013'],['TEXT + SVG','YES'],['EDITABLE SOURCES','YES'],['BROAD REUSE','MIT']];
let list='';
for(const [index,[name,value]] of options.entries()){
 const line=`${name}${'.'.repeat(26-name.length)}${value}`;
 list+=center(line,277+index*29,2.3,['#7bafff','#969fff','#b28aef','#cf86db','#ed9eca'][index]);
}
const image=svg({height:464,background:'#020206',title:'README.NFO — megademo selector',
 description:'A blue-white chrome README.NFO logo over a sparse starfield. A giant white scroller sits above a blue-to-pink dotted-leader selector with accurate archive facts.',
 defs:`<linearGradient id="chrome" x2="0" y2="1"><stop stop-color="#102b5f"/><stop offset=".18" stop-color="#3a78b8"/><stop offset=".38" stop-color="#b0d8f5"/><stop offset=".46" stop-color="#ffffff"/><stop offset=".48" stop-color="#ffffff"/><stop offset=".5" stop-color="#2a394f"/><stop offset=".64" stop-color="#69798d"/><stop offset=".84" stop-color="#cad7e3"/><stop offset="1" stop-color="#eff7fc"/></linearGradient><clipPath id="scrollclip"><rect y="157" width="960" height="69"/></clipPath>`,
 css:`.stars{animation:stars 32s linear infinite}.scroll{animation:scroll 30s ease-in-out infinite}@keyframes stars{0%,100%{transform:translateX(0)}50%{transform:translateX(-16px)}}@keyframes scroll{0%,30%,100%{transform:translateX(0)}65%,80%{transform:translateX(-900px)}}`,
 body:`<g class="stars">${stars}</g>${center('README.NFO',44,11,'#071021',970)}${center('README.NFO',39,11,'url(#chrome)')}
    ${center('R E T R O   H E A D E R   A R C H I V E',132,1.8,'#87b4df')}
    <g clip-path="url(#scrollclip)"><g class="scroll">${center('TEXT + SVG',164,9,'#ffffff')}${px('MAKE IT YOURS',1120,164,8,'#ffffff')}</g></g>
    ${center('- SELECT YOUR NEXT LOOK -',241,2.3,'#afc9e6')}
    ${list}
    <path d="M222 423H738" stroke="#37486b"/><rect x="221" y="431" width="518" height="22" fill="#80afff"/>
    ${center('OPEN THE ARCHIVE',436,1.5,'#061222')}`});
const width=49;
const text=['README.NFO / RETRO HEADER ARCHIVE','','- SELECT YOUR NEXT LOOK -',...options.map(([name,value])=>name+' '.repeat(2)+'.'.repeat(width-name.length-value.length-4)+'  '+value),'','OPEN THE ARCHIVE / COPY / CUSTOMISE / SHARE'].join('\n');
const markdown=`<p align="center"><img src="assets/29-c64-06.svg" width="100%" alt="README.NFO chrome megademo selector with starfield, white scroller and dotted menu"></p>\n\n\`\`\`text\n${text}\n\`\`\`\n\n[Style catalogue](../../styles/INDEX.md) · [Example galleries](../README.md) · [Editable preview tools](../../tools/preview.mjs) · [MIT reuse](../../LICENSE)`;
writeHeader(29,{image,markdown,summary:'Chrome title, sparse starfield, giant white scroller and a blue-to-pink dotted selector.'});
