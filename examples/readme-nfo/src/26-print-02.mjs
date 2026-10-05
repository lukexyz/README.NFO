import { svg, px, writeHeader } from './lib.mjs';

const reel = (x, duration) => `<g transform="translate(${x} 244)"><circle r="36" fill="#382b29"/><circle r="26" fill="#b8bdc4"/><g class="reel" style="animation-duration:${duration}s"><circle r="20" fill="#e8e9e2"/>${[0,60,120,180,240,300].map(angle=>`<path d="M-4 -20h8v9h-8Z" fill="#51545c" transform="rotate(${angle})"/>`).join('')}<circle r="9" fill="#171b23"/><circle r="4" fill="#aeb2b9"/></g></g>`;
let stair = '';
for(let row=0;row<7;row++) for(let column=0;column<7;column++) if(column>=row-1&&column<row+3) stair+=`<rect x="${573+column*24}" y="${84+row*24}" width="24" height="24" fill="${row%2?'#727985':'#454d5b'}"/>`;
const image=svg({height:424,background:'#e7e4db',title:'README.NFO — cassette and J-card',
  description:'A smoke-grey cassette with rotating white hubs sits beside its unfolded original blue-and-cream J-card, labelled README.NFO, SIDE A and SIDE B.',
  defs:`<linearGradient id="shell" x2="0" y2="1"><stop stop-color="#505963"/><stop offset=".5" stop-color="#292f3b"/><stop offset="1" stop-color="#3c424e"/></linearGradient>`,
  css:`.reel{animation:turn 19s linear infinite}@keyframes turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`,
  body:`${px('README.NFO / ARCHIVE EDITION',42,32,2,'#383f4a')}${px('26 / MIT',813,32,2,'#383f4a')}
    <rect x="49" y="103" width="400" height="250" rx="18" fill="#adaea8" opacity=".55"/>
    <rect x="42" y="96" width="400" height="250" rx="18" fill="url(#shell)" stroke="#171c25" stroke-width="3"/>
    <path d="M100 96h62v8h-62ZM318 96h62v8h-62Z" fill="#111620"/>
    <rect x="66" y="117" width="352" height="85" rx="9" fill="#e8e6dd"/>
    ${px('README.NFO',124,133,4,'#29333f')}${px('SIDE A',84,177,2,'#267bba')}${px('TEXT + SVG',285,177,2,'#29333f')}
    <rect x="96" y="211" width="292" height="67" rx="12" fill="#101721" stroke="#65717d" stroke-width="2"/>
    <path d="M148 214C205 226 279 226 336 214M148 274C210 263 274 263 336 274" fill="none" stroke="#443430" stroke-width="4"/>
    ${reel(153,19)}${reel(333,17)}
    <path d="M113 346l24 -46h210l25 46Z" fill="#242a33" stroke="#747b84" stroke-width="1"/>
    <circle cx="178" cy="319" r="8" fill="#111721"/><circle cx="308" cy="319" r="8" fill="#111721"/>
    ${[ [58,111],[426,111],[58,328],[426,328],[242,292] ].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#aeb5bc"/><path d="M${x-2} ${y}h4" stroke="#2c3540"/>`).join('')}
    <rect x="494" y="76" width="421" height="294" fill="#b5b4ae" opacity=".55"/>
    <rect x="488" y="70" width="34" height="294" fill="#2978b0"/>
    <g transform="translate(511 87) rotate(90)">${px('README.NFO / MIT',0,0,2,'#e7e8dc')}</g>
    <rect x="522" y="70" width="232" height="294" fill="#262e3b"/>
    ${stair}<path d="M548 114H744M548 137H744M548 160H744M548 183H744M548 206H744" stroke="#2788c5" stroke-width="5"/>
    <rect x="529" y="76" width="33" height="170" fill="#e8e6dd"/>
    <path d="M533 80V241M557 80V241" stroke="#263848" stroke-width="1"/>
    <g transform="translate(551 91) rotate(90)">${px('RETRO ARCHIVE',0,0,2,'#243549')}</g>
    <rect x="522" y="252" width="232" height="112" fill="#f6f2e6"/>
    ${px('README.NFO',546,270,3,'#252e38')}${px('RETRO HEADERS',547,310,2,'#2978b0')}${px('152 STYLES / 13 FAMILIES',537,341,1,'#394452')}
    <rect x="754" y="70" width="155" height="294" fill="#f6f2e6"/>
    <path d="M754 70V364" stroke="#d1cabb" stroke-dasharray="3 4"/>
    ${px('SIDE A',770,88,2,'#2978b0')}${px('01 STYLES',770,121,1.6,'#283544')}${px('02 EXAMPLES',770,149,1.6,'#283544')}${px('03 PREVIEW',770,177,1.6,'#283544')}
    <path d="M770 211H893" stroke="#9fa3a4"/>
    ${px('SIDE B',770,231,2,'#2978b0')}${px('04 COPY',770,265,1.6,'#283544')}${px('05 CUSTOMISE',770,293,1.6,'#283544')}${px('06 SHARE',770,321,1.6,'#283544')}
    ${px('A COLLECTION TO REWIND, COPY AND MAKE YOUR OWN.',42,386,2,'#38424c')}`});
writeHeader(26,{image,alt:'README.NFO on a smoke-grey cassette beside a blue and cream unfolded J-card',summary:'A cassette edition with turning hubs, an obi strip and a six-section J-card track list.'});
