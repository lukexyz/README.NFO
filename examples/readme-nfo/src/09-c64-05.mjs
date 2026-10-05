import { svg, px, center, writeHeader } from './lib.mjs';

const rainbow = ['#ff4968','#ff9149','#ffe15b','#79df75','#53dbe5','#6797ff','#b37aff'];
let rules = '', wave = '';
for(let i=0;i<49;i++) for(const y of [125,324]) rules += `<rect x="${62+i*17}" y="${y}" width="11" height="3" fill="${rainbow[Math.floor(i/7)]}"/>`;
for(const [i,letter] of [...'README.NFO'].entries()) wave += `<g class="wave" style="animation-delay:${-i*.45}s">${px(letter,217+i*54,159,9,'url(#copper)')}</g>`;
const star = (x,y) => `<g transform="translate(${x} ${y})" fill="#a0eaff"><path d="M0 -13L3 -3L13 0L3 3L0 13L-3 3L-13 0L-3 -3Z"/><rect x="-2" y="-2" width="4" height="4" fill="#fff"/></g>`;
const image=svg({height:410,background:'#03050a',title:'README.NFO — copper-panel introduction',
  description:'An original red capsule plate above a navy panel. Rainbow pixel lettering waves gently between dashed copper rules and pale blue star sprites.',
  defs:`<linearGradient id="rim" x2="0" y2="1"><stop stop-color="#f5f5f8"/><stop offset=".25" stop-color="#999daa"/><stop offset=".5" stop-color="#3b3f4b"/><stop offset=".7" stop-color="#a5b2c9"/><stop offset="1" stop-color="#e0e7ef"/></linearGradient><linearGradient id="copper">${rainbow.map((c,i)=>`<stop offset="${i/6}" stop-color="${c}"/>`).join('')}</linearGradient><linearGradient id="red" x2="0" y2="1"><stop stop-color="#ffe4ea"/><stop offset=".25" stop-color="#ff8597"/><stop offset=".32" stop-color="#ff365c"/><stop offset="1" stop-color="#a91537"/></linearGradient>`,
  css:`.wave{animation:wave 6s ease-in-out infinite}@keyframes wave{0%,100%{transform:translateY(-3px)}50%{transform:translateY(3px)}}`,
  body:`<rect x="24" y="22" width="912" height="76" fill="#626878"/>
    <path d="M24 22H936M24 98H936M24 108H936M24 388H936" stroke="#87acd9" stroke-width="2"/>
    <rect x="24" y="109" width="912" height="278" fill="#060b35"/>
    <path d="M89 53H269M95 60H263M101 67H257M691 53H871M697 60H865M703 67H859" stroke="#262c41" stroke-width="4"/>
    <rect x="299" y="32" width="362" height="56" rx="26" fill="url(#rim)"/>
    <rect x="306" y="39" width="348" height="42" rx="20" fill="#161825"/>
    ${center('README.NFO',47,4,'url(#red)')}
    ${rules}${star(146,191)}${star(814,191)}
    <g transform="translate(38 0) skewX(-10)">${wave}</g>
    ${center('PRESENTS',250,4,'url(#copper)')}
    ${center('RETRO HEADERS / TEXT + SVG',291,3,'#d1d9ff')}
    ${center('152 STYLES  /  13 FAMILIES  /  MIT',350,2,'#82b7e6')}
    ${px('09',43,368,1,'#728ac1')}${px('OPEN THE ARCHIVE',716,368,1,'#728ac1')}`});
const border = `+${'-'.repeat(62)}+`;
const row = (line, centred = false) => `|${centred ? line.padStart(Math.floor((62+line.length)/2)).padEnd(62) : line.padEnd(62)}|`;
const text = [border, row('README.NFO', true), row('RETRO HEADERS / TEXT + SVG', true), border,
  row('  BUILT FROM    152 researched styles'), row('  ORGANIZED IN  13 visual families'),
  row('  SUPPLIED AS   Markdown + editable SVG'), row('  RELEASED AS   MIT / copy, customise, share'), border].join('\n');
const markdown=`<p align="center"><img src="assets/09-c64-05.svg" width="100%" alt="README.NFO in rainbow copper lettering beneath an original red capsule plate"></p>\n\n\`\`\`text\n${text}\n\`\`\`\n\n[Style catalogue](../../styles/INDEX.md) · [Example galleries](../README.md) · [MIT licence](../../LICENSE)`;
writeHeader(9,{image,markdown,summary:'A red logo plate, deep-blue panel and gently waving rainbow copper title.'});
