import { svg, px, center, writeHeader } from './lib.mjs';

let skyline = '', stars = '', ground = '';
for (let index = 0; index < 28; index++) {
  const x = index * 44, height = 28 + (index * 37 % 83), y = 250 - height;
  skyline += `<path d="M${x} 250V${y}h28l12 -10v${height + 10}Z" fill="${['#303959','#485379','#727eaa'][index % 3]}"/>
    <path d="M${x + 28} ${y}l12 -10v${height + 10}h-12Z" fill="#222a49"/>`;
  for (let window = 0; window < Math.floor(height / 15); window++) skyline += `<rect x="${x + 5}" y="${y + 8 + window * 15}" width="13" height="3" fill="#a0b5df" opacity=".45"/>`;
}
for (let index = 0; index < 55; index++) stars += `<rect x="${(index * 173 + 29) % 960}" y="${49 + (index * 43 % 96)}" width="${index % 9 ? 1 : 2}" height="1" fill="#b5c3dc" opacity="${.3 + index % 4 * .12}"/>`;
for (let index = 0; index < 13; index++) ground += `<path d="M480 250L${-260 + index * 120} 314" stroke="#64a98d" stroke-width="1"/>`;
for (const y of [258, 269, 285, 307]) ground += `<path d="M0 ${y}H960" stroke="#64a98d" stroke-width="1"/>`;
const image = svg({ height: 370, background: '#000000', title: 'README.NFO — demo opening',
  description: 'A letterboxed steel-blue skyline pans over green vector ground behind a held README.NFO title and gently fading production cards.',
  defs: `<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#080c1a"/><stop offset="1" stop-color="#303859"/></linearGradient><clipPath id="scene"><rect y="44" width="960" height="270"/></clipPath>`,
  css: `.pan{animation:pan 28s linear infinite}.credits{animation:fade 15s ease-in-out infinite}.card2{animation-delay:-5s}.card3{animation-delay:-10s}@keyframes pan{from{transform:translateX(0)}to{transform:translateX(-44px)}}@keyframes fade{0%,100%{opacity:.35;transform:translateY(4px)}30%,70%{opacity:1;transform:translateY(0)}}`,
  body: `<g clip-path="url(#scene)"><rect y="44" width="960" height="270" fill="url(#sky)"/>${stars}
    <g class="pan">${skyline}</g><path d="M0 250H960V314H0Z" fill="#1a503f"/>${ground}
    <path d="M0 245H960" stroke="#9aaad0" opacity=".3"/>
    ${center('README.NFO', 102, 10, '#080c1a', 970)}
    ${center('README.NFO', 96, 10, '#e3e6f4')}
    ${center('A RETRO HEADER COLLECTION', 194, 3, '#a6bed7')}
  </g>
  ${px('LUKE WOODS PRESENTS', 24, 19, 2, '#c2c9dd')}${px('PART 07 / 20', 792, 19, 2, '#737b98')}
  <g class="credits">${px('CODE', 52, 338, 2, '#858faf')}${px('TEXT + SVG', 118, 338, 2, '#dfe5ef')}</g>
  <g class="credits card2">${px('DESIGN', 368, 338, 2, '#858faf')}${px('13 FAMILIES', 462, 338, 2, '#dfe5ef')}</g>
  <g class="credits card3">${px('RELEASE', 714, 338, 2, '#858faf')}${px('MIT', 822, 338, 2, '#dfe5ef')}</g>` });
writeHeader(7, { image, alt: 'README.NFO demo title above a steel-blue skyline and green vector ground', summary: 'A letterboxed demo opening: held title, drifting horizon, and production credits.' });
