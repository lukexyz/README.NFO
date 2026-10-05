import { svg, px, center, writeHeader } from './lib.mjs';

const title = center('README.NFO', 66, 12, '#ff8818', 768);
const footer = center('RETRO HEADER ARCADE', 174, 6, '#d76304', 768);
const stats = center('152', 48, 18, '#ff922b', 768) + center('STYLES TO PLAY', 174, 5, '#ff7a00', 768);
const families = center('13', 48, 18, '#ff922b', 768) + center('FAMILIES / MIT', 174, 5, '#ff7a00', 768);
const image = svg({ width: 768, height: 256, background: '#080300',
  title: 'README.NFO — pinball dot-matrix display',
  description: 'Orange plasma dots cycle between the repository title, 152 researched styles and thirteen families. A pinball attract display for retro headers.',
  defs: '<pattern id="unlit" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.1" fill="#291000"/></pattern><pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.1" fill="white"/></pattern><mask id="perforated" maskUnits="userSpaceOnUse" x="0" y="24" width="768" height="192"><rect x="0" y="24" width="768" height="192" fill="url(#dots)"/></mask><linearGradient id="glass" x2="0" y2="1"><stop stop-color="#261308"/><stop offset="1" stop-color="#0a0400"/></linearGradient>',
  css: '.first{opacity:1;animation:first 18s steps(1) infinite}.second{opacity:0;animation:second 18s steps(1) infinite}.third{opacity:0;animation:third 18s steps(1) infinite}.spark{opacity:.45;animation:sweep 9s steps(128) infinite}@keyframes first{0%,35%,95%,100%{opacity:1}36%,94%{opacity:0}}@keyframes second{0%,35%,66%,100%{opacity:0}36%,65%{opacity:1}}@keyframes third{0%,65%,95%,100%{opacity:0}66%,94%{opacity:1}}@keyframes sweep{from{transform:translateX(-42px)}to{transform:translateX(810px)}}',
  body: `<rect x="0" y="20" width="768" height="200" fill="url(#glass)"/><rect x="0" y="24" width="768" height="192" fill="url(#unlit)"/><g mask="url(#perforated)"><g class="first">${title}${footer}<g class="spark"><rect x="0" y="54" width="6" height="114" fill="#fff0b9"/></g></g><g class="second">${stats}</g><g class="third">${families}</g></g>${px('PLAYER 01', 12, 5, 1.5, '#75451e')}${px('FREE PLAY', 666, 5, 1.5, '#75451e')}${center('PICK A STYLE. MAKE IT YOURS.', 235, 2, '#d78a46', 768)}`,
});
writeHeader(1, { image, summary: 'Orange plasma dots, a travelling sparkle and a slow pinball attract loop.', alt: 'README.NFO in orange dot-matrix letters; the display cycles through 152 styles and 13 families.' });
