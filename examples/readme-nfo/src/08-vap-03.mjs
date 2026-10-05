import { svg, px, center, writeHeader } from './lib.mjs';

let buildings = '', noise = '';
for (let index = 0; index < 36; index++) {
  const x = index * 28, h = 30 + index * 47 % 85;
  buildings += `<rect x="${x}" y="${334-h}" width="22" height="${h}" fill="${index % 2 ? '#292446' : '#242a49'}"/>`;
  for (let row=0; row < Math.floor(h/14); row++) buildings += `<rect x="${x+5}" y="${340-h+row*14}" width="3" height="3" fill="#ac689f" opacity=".5"/>`;
}
for (let index=0; index<85; index++) noise += `<rect x="${index * 67 % 960}" y="${index * 13 % 9}" width="${index % 12 + 3}" height="1" fill="${index % 2 ? '#ffffff' : '#301939'}" opacity=".4"/>`;
const image = svg({height: 420, background: '#070810', title: 'README.NFO — late-night tape',
  description: 'A purple late-night skyline and violet sun behind a crisp README.NFO title. PLAY, SP and a tape counter sit around subtle scanlines and tracking defects.',
  defs: `<linearGradient id="tape" x2="0" y2="1"><stop stop-color="#222541"/><stop offset=".57" stop-color="#715181"/><stop offset="1" stop-color="#2c2449"/></linearGradient><linearGradient id="sun" x2="0" y2="1"><stop stop-color="#cea2d7"/><stop offset="1" stop-color="#a348a6"/></linearGradient><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#171326" opacity=".25"/></pattern><clipPath id="screen"><rect x="18" y="18" width="924" height="384" rx="15"/></clipPath>`,
  css: `.tracking{animation:track 18s linear infinite}.headnoise{animation:noise .85s steps(3,end) infinite}.bleed{animation:drift 9s steps(1,end) infinite}@keyframes track{from{transform:translateY(-68px)}to{transform:translateY(345px)}}@keyframes noise{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}@keyframes drift{0%,70%,100%{transform:translateX(0)}72%,74%{transform:translateX(2px)}}`,
  body: `<g clip-path="url(#screen)"><rect x="18" y="18" width="924" height="384" fill="url(#tape)"/>
    <circle cx="698" cy="208" r="127" fill="url(#sun)" opacity=".65"/>
    <path d="M566 207H830M561 226H835M568 246H828M582 268H814M607 290H788" stroke="#604871" stroke-width="5"/>
    ${buildings}<path d="M18 334H942V402H18Z" fill="#1d243a"/>
    <path d="M18 335H942M120 402L452 335M330 402L467 335M570 402L482 335M820 402L500 335M18 348H942M18 371H942" stroke="#6a4b76" opacity=".65"/>
    <g class="bleed" opacity=".28">${center('README.NFO', 147, 10, '#f84e8b', 970)}${center('README.NFO', 147, 10, '#68cce0', 950)}</g>
    ${center('README.NFO', 147, 10, '#f5e7f7')}${center('RETRO HEADERS / TEXT + SVG', 242, 3, '#e3c3e9')}
    <rect x="18" y="18" width="924" height="384" fill="url(#scan)"/>
    <g class="tracking" opacity=".3"><rect x="18" y="69" width="924" height="7" fill="#b38dad"/><path d="M30 70H230M480 72H887M240 75H399" stroke="#fff" stroke-width="1"/></g>
    <g transform="translate(0 390)"><g class="headnoise"><rect x="18" width="924" height="10" fill="#674778" opacity=".4"/>${noise}</g></g>
    ${px('PLAY', 57, 48, 3, '#efeaf2')}<path d="M145 47l18 11 -18 11Z" fill="#efeaf2"/>${px('SP', 57, 79, 2, '#efeaf2')}
    ${px('00:01:52', 57, 344, 3, '#efeaf2')}${px('13 FAMILIES / MIT', 57, 375, 2, '#efeaf2')}
    ${px('ARCHIVE 08', 752, 53, 2, '#dbc9de')}
  </g><rect x="18" y="18" width="924" height="384" rx="15" fill="none" stroke="#52445f" stroke-width="2"/>`});
writeHeader(8, {image, alt:'README.NFO on a purple VHS title card with skyline, PLAY indicator and subtle tracking noise',summary:'Late-night tape: purple skyline, sharp title, OSD and restrained tracking drift.'});
