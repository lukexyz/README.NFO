import { svg, px, center, writeHeader } from './lib.mjs';

const defs=`<linearGradient id="metal" x2="0" y2="1"><stop stop-color="#707c99"/><stop offset=".17" stop-color="#f5f9ff"/><stop offset=".43" stop-color="#a3bed3"/><stop offset=".49" stop-color="#fafdff"/><stop offset=".5" stop-color="#364355"/><stop offset=".73" stop-color="#536f88"/><stop offset="1" stop-color="#c9edff"/></linearGradient>
 <linearGradient id="ribbon" x2="1" y2="0"><stop stop-color="#251240"/><stop offset=".3" stop-color="#964fe9"/><stop offset=".49" stop-color="#f9d3ff"/><stop offset=".5" stop-color="#522478"/><stop offset="1" stop-color="#2a113d"/></linearGradient>
 <linearGradient id="fade" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <mask id="reflection"><rect x="100" y="199" width="760" height="92" fill="url(#fade)"/></mask>
 <clipPath id="scrollclip"><rect x="131" y="311" width="697" height="44"/></clipPath>`;
let twist='';for(const side of [74,886]) for(let row=0;row<52;row++) {
  const y=39+row*5;
  twist+=`<g transform="translate(${side} ${y})"><g class="slice" style="animation-delay:${-row*.045}s"><rect x="-25" y="0" width="50" height="5" fill="url(#ribbon)"/><path d="M-25 0H25" stroke="#d8a5ff" stroke-opacity=".45" stroke-width=".65"/></g></g>`;
}
const logo=center('README.NFO',111,10,'url(#metal)',960,'stroke="#f7edff" stroke-width=".1"');
let letters='';const scroll='TEXT ART + SVG / PICK A LOOK / MAKE IT YOURS / ';
for(let i=0;i<scroll.length;i++)letters+=`<g transform="translate(${140+i*17} 325)"><g class="wave" style="animation-delay:${-i*.13}s">${px(scroll[i],0,0,2.4,'#f6b8ff')}</g></g>`;
const image=svg({height:380,background:'#05050a',defs,
 css:'.slice{transform:scaleX(.7);animation:twist 5s ease-in-out infinite}.wave{animation:sine 4s ease-in-out infinite}.scroller{animation:scroll 25s linear infinite}@keyframes twist{0%,100%{transform:scaleX(.9)}50%{transform:scaleX(.08)}}@keyframes sine{0%,100%{transform:translateY(-8px)}50%{transform:translateY(8px)}}@keyframes scroll{to{transform:translateX(-150px)}}',
 description:'A large original chrome pixel logo for README.NFO, with purple ribbon twisters, a mirror reflection and a pink sine-wave scroller. 152 researched styles across thirteen families.',
 body:`<path d="M107 302H853M129 309H831" stroke="#58306c" stroke-width="1"/>
 <g fill="#a7acc7" opacity=".6"><rect x="183" y="43" width="2" height="2"/><rect x="778" y="78" width="2" height="2"/><rect x="648" y="39" width="2" height="2"/><rect x="303" y="82" width="2" height="2"/><rect x="499" y="59" width="2" height="2"/><rect x="195" y="245" width="2" height="2"/><rect x="807" y="247" width="2" height="2"/></g>
 ${twist}
 ${center('README.NFO',118,10,'#3a1b50',960,'stroke="#1d1027" stroke-width=".2"')}
 ${logo}
 <g mask="url(#reflection)"><g transform="translate(0 396) scale(1 -1)">${logo}</g></g>
 ${center('THE RETRO HEADER COLLECTION',44,2,'#bf9bde')}
 ${center('152 RESEARCHED STYLES / 13 FAMILIES',255,2,'#d3d9e3')}
 ${center('ORIGINAL TEXT + SVG / MIT LICENSE',282,1.8,'#949ba9')}
 <g clip-path="url(#scrollclip)"><g class="scroller">${letters}</g></g>`
});
writeHeader(14,{image,summary:'Cold chrome, a faded mirror floor, purple ribbon twisters and a pink sine-wave scroller.',alt:'A chrome README.NFO pixel logo flanked by animated purple twisters, with a reflection and a pink sine scroller.'});
