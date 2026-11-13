#!/usr/bin/env node
// Renders the 50 numbered floor cards (300x192 JPEG, shown at 148x95) from picks.src.txt.
//   node docs/front-page/arcade-floor/src/cards.mjs
// Each card: a still of the real header (frozen at exactly t = 3 s, or the pick's own time), framed as a cabinet screen, with a
// strip carrying the burned-in number, a short neutral label and an amber ► badge when the original
// is animated. This is the same card the target CLI gallery would use (pipeline change 6).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPicks } from './picks.mjs';
import { pixelPath, textWidth } from './font.mjs';
import { root } from './scan.mjs';
import { slot, freeze } from './freeze.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets', 'floor');
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.join(root, 'package.json'));
const { chromium } = require('playwright');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function firstTextBlock(md) {
  const fence = md.match(/```(?:text)?\r?\n([\s\S]*?)\r?\n```/);
  const pre = md.match(/<pre>\r?\n?([\s\S]*?)<\/pre>/i);
  const pick = !pre || (fence && fence.index < pre.index) ? fence?.[1] : pre[1];
  if (pick === undefined) throw new Error('no text block');
  return pick.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

const SW = 292, SH = 156; // screen
function screenHtml(p) {
  if (p.fit === 'text') {
    const all = firstTextBlock(fs.readFileSync(path.join(root, p.md), 'utf8')).split(/\r?\n/);
    const lines = p.lines ? all.slice(p.lines[0], p.lines[1]) : all.slice(0, 16);
    const cols = Math.max(...lines.map((l) => [...l].length));
    const scale = Math.min((SW - 16) / (cols * 7.48), (SH - 12) / (lines.length * 19.72));
    const w = cols * 7.48 * scale, h = lines.length * 19.72 * scale;
    return `<div style="position:absolute;inset:0;background:#151b23;overflow:hidden">
      <pre style="position:absolute;margin:0;left:${(SW - w) / 2}px;top:${(SH - h) / 2}px;transform:scale(${scale});transform-origin:0 0;font:700 13.6px/19.72px Consolas,'Liberation Mono',monospace;color:#f0f6fc;white-space:pre">${esc(lines.join('\n'))}</pre></div>`;
  }
  // Animated originals are frozen at exactly p.t ms (see freeze.mjs), so stills are reproducible.
  const box = `position:absolute;inset:0;width:${SW}px;height:${SH}px`;
  if (p.fit === 'contain') {
    return `<div style="position:absolute;left:-14px;top:-14px;width:${SW + 28}px;height:${SH + 28}px;filter:blur(10px) brightness(.4)">${slot(0, 'width:100%;height:100%')}</div>
      ${slot(1, box)}`;
  }
  return slot(0, box);
}
const freezeItems = (p) => {
  if (p.fit === 'text') return [];
  const file = path.join(root, p.svg);
  return p.fit === 'contain' ? [{ file, fit: 'cover' }, { file, fit: 'contain' }] : [{ file, fit: p.fit }];
};

function cardHtml(p) {
  const num = pixelPath(p.n, 9, 167, 3);
  const label = pixelPath(p.label, 58, 171, 2);
  const badge = p.animated ? `<path d="M276 168h4l12 10.5-12 10.5h-4z" fill="#ffb000"/>` : '';
  return `<!doctype html><html><body style="margin:0;background:#05060a">
  <div style="position:relative;width:300px;height:192px;background:linear-gradient(#1b1e2b,#0c0d14);overflow:hidden">
    <div style="position:absolute;left:4px;top:4px;width:${SW}px;height:${SH}px;overflow:hidden;background:#000;border-radius:3px">${screenHtml(p)}
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.14) 0 1px,transparent 1px 3px)"></div>
      <div style="position:absolute;inset:0;box-shadow:inset 0 0 18px rgba(0,0,0,.55)"></div>
    </div>
    <svg style="position:absolute;left:0;top:0" width="300" height="192" viewBox="0 0 300 192">
      <rect x="0" y="162" width="300" height="30" fill="#0b0c12"/>
      <rect x="0" y="162" width="300" height="1" fill="#3a3f55"/>
      <rect x="4" y="165" width="${textWidth(p.n, 3) + 10}" height="25" rx="3" fill="#ffb000"/>
      <path d="${num}" fill="#0b0c12"/>
      <path d="${label}" fill="#e8ecf8"/>
      ${badge}
    </svg>
    <div style="position:absolute;inset:0;border:2px solid #3a3f55;box-sizing:border-box;border-radius:4px"></div>
  </div></body></html>`;
}

const picks = loadPicks();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 300, height: 192 } });
const host = path.join(out, '_host.html');
let total = 0;
for (const p of picks) {
  fs.writeFileSync(host, cardHtml(p));
  await page.goto(pathToFileURL(host).href);
  await freeze(page, freezeItems(p), p.t);
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(out, `${p.n}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 300, height: 192 } });
  const kb = fs.statSync(file).size / 1024;
  total += kb;
  console.log(p.n, p.label.padEnd(13), p.fit.padEnd(7), kb.toFixed(1).padStart(5), 'KB', p.md);
}
fs.rmSync(host, { force: true });
await browser.close();
console.log(`cards: ${picks.length}, total ${total.toFixed(0)} KB, mean ${(total / picks.length).toFixed(1)} KB`);
