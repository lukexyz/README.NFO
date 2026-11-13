#!/usr/bin/env node
// Concept 02 BOOT INTRO: four static copper bars (830x8) that sit above the
// four ## sections, stepping steel blue, violet, red and amber down the page
// like raster bars down a screen.
//   node docs/front-page/boot-intro/src/bars.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BARS = [
  ['#0b2a5c', '#4a8fe0', '#d8ecff'],
  ['#2a0b5c', '#a05cff', '#f0e0ff'],
  ['#5c0b1a', '#ff3b4e', '#ffe0e4'],
  ['#5c3a0b', '#ffb020', '#fff4d6'],
];
BARS.forEach(([dark, mid, light], i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 830 8" width="830" height="8" preserveAspectRatio="none">
<defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".3" stop-color="${mid}"/>
<stop offset=".5" stop-color="${light}"/><stop offset=".7" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<linearGradient id="h" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/>
<stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="m"><rect width="830" height="8" fill="url(#h)"/></mask></defs>
<rect width="830" height="8" fill="url(#v)" mask="url(#m)"/>
</svg>
`;
  fs.writeFileSync(path.join(here, '..', 'assets', `bar-${i + 1}.svg`), svg);
});
console.log('bar-1..4.svg written');
