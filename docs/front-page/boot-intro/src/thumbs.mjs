#!/usr/bin/env node
// Concept 02 BOOT INTRO: the 40 "little monitor" wall tiles, 07-46.
//   node docs/front-page/boot-intro/src/thumbs.mjs
// Renders each pick's SVG with Chromium forced to prefers-reduced-motion, so
// every tile is the artist's composed still, into a 300x168 JPEG with a 4 px
// screen edge, the number burned in top left and an amber ► badge top right
// when the original animates. Writes ../assets/thumbs/NN.jpg and a contact
// sheet ../assets/thumbs/_sheet.png (not linked from the README).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { FONT5, glyphPath } from './fonts.mjs';
import { loadPicks, ROOT, DIR } from './picks.mjs';

const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const out = path.join(DIR, 'assets', 'thumbs');
fs.mkdirSync(out, { recursive: true });
const { wall } = loadPicks();

const TW = 300, TH = 168, E = 4, SW = TW - 2 * E, SH = TH - 2 * E;
const pix = (str, x, y, s, fill) => `<path transform="translate(${x} ${y})" d="${[...str].map((c, i) => glyphPath(FONT5[c], s, i * 6 * s, 0)).join('')}" fill="${fill}"/>`;

function card(e) {
  const src = pathToFileURL(path.join(ROOT, e.svg)).href;
  const r = e.w / e.h;
  const cover = r > 1.45 && r < 2.2;
  const screen = cover
    ? `<img src="${src}" style="position:absolute;inset:0;width:${SW}px;height:${SH}px;object-fit:cover">`
    : `<img src="${src}" style="position:absolute;inset:-14px;width:${SW + 28}px;height:${SH + 28}px;object-fit:cover;filter:blur(9px) brightness(.35) saturate(1.2)">
       <img src="${src}" style="position:absolute;inset:0;width:${SW}px;height:${SH}px;object-fit:contain">`;
  const num = String(e.n).padStart(2, '0');
  const badge = e.animated
    ? `<rect x="${TW - E - 27}" y="${E}" width="27" height="31" fill="#000" opacity=".82"/>${pix('►', TW - E - 21, E + 5, 3, '#ffb000')}`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#000">
<div style="position:relative;width:${TW}px;height:${TH}px;background:#0b0d12;overflow:hidden">
  <div style="position:absolute;left:${E}px;top:${E}px;width:${SW}px;height:${SH}px;overflow:hidden;background:#000">${screen}</div>
  <div style="position:absolute;left:${E}px;top:${E}px;width:${SW}px;height:${SH}px;background:repeating-linear-gradient(0deg,rgba(0,0,0,.14) 0 1px,transparent 1px 3px),radial-gradient(ellipse at center,transparent 62%,rgba(0,0,0,.45))"></div>
  <svg style="position:absolute;left:0;top:0" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" shape-rendering="crispEdges">
    <rect x=".5" y=".5" width="${TW - 1}" height="${TH - 1}" fill="none" stroke="#5d6473"/>
    <rect x="1.5" y="1.5" width="${TW - 3}" height="${TH - 3}" fill="none" stroke="#2a2f3a" stroke-width="2"/>
    <rect x="${E - .5}" y="${E - .5}" width="${SW + 1}" height="${SH + 1}" fill="none" stroke="#000"/>
    <rect x="${E}" y="${E}" width="45" height="31" fill="#000" opacity=".82"/>
    ${pix(num, E + 6, E + 5, 3, '#ffd84a')}
    ${badge}
  </svg>
</div></body></html>`;
}

const browser = await chromium.launch({ args: ['--force-prefers-reduced-motion'] });
const page = await browser.newPage({ viewport: { width: TW, height: TH }, reducedMotion: 'reduce' });
const host = path.join(out, '_host.html');
let total = 0;
for (const e of wall) {
  fs.writeFileSync(host, card(e));
  await page.goto(pathToFileURL(host).href);
  await page.waitForLoadState('load');
  await page.waitForTimeout(350);
  const file = path.join(out, `${String(e.n).padStart(2, '0')}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: TW, height: TH } });
  const kb = fs.statSync(file).size / 1024;
  total += kb;
  console.log(String(e.n).padStart(2, '0'), kb.toFixed(1).padStart(5), 'KB', e.page);
}
fs.rmSync(host, { force: true });
console.log(`tiles ${wall.length}, ${total.toFixed(0)} KB, mean ${(total / wall.length).toFixed(1)} KB`);

// Contact sheet for review (5 a row at display size).
const sheet = path.join(out, '_sheet.html');
fs.writeFileSync(sheet, `<body style="margin:0;padding:8px;background:#fff;width:${5 * 154}px">${wall.map((e) => `<img src="${String(e.n).padStart(2, '0')}.jpg" width="150" height="84" style="margin:2px">`).join('')}</body>`);
await page.setViewportSize({ width: 5 * 154 + 16, height: 900 });
await page.goto(pathToFileURL(sheet).href);
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, '_sheet.png'), fullPage: true });
fs.rmSync(sheet);
await browser.close();
