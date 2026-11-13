#!/usr/bin/env node
// Concept 01 "THE RELEASE": the numbered example tiles.
//   node docs/front-page/the-release/src/thumbs.mjs [--force]
// For every pick in picks.json: open the header's SVG in Playwright Chromium, pause every CSS and
// SMIL animation at frame_ms, screenshot it, then mount it on a black NFO card (2 px frame, pixel
// label strip "07 CASTAWAY ··· ► VAP-05"; a pick may set its own "frame" in ms) and encode a 300x192 WebP (shown at 150x96).
// Writes ../assets/tiles/NN.webp and picks.lock.json (resolved style id, animation flag, source
// hash). A tile is only re-rendered when its source SVG, caption or number changes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FONT } from './font.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const OUT = path.resolve(HERE, '..', 'assets', 'tiles');
const LOCK = path.join(HERE, 'picks.lock.json');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const force = process.argv.includes('--force');

const picks = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'));
const buildLog = fs.readFileSync(path.join(ROOT, 'examples', 'build-log.csv'), 'utf8').split(/\r?\n/).map((l) => l.split(','));
const SHORT = { castaway: 'CASTAWAY', 'ultra-satisfactory': 'ULTRA', heretic: 'HERETIC', st3gg: 'ST3GG', gl4ss: 'GL4SS', 'naturalis-historia': 'NATURALIS' };

function styleId(set, slug) {
  const row = buildLog.find((r) => r[2] === set && r[3] === `${slug}.md` && r[4]);
  if (row) return row[4];
  const m = slug.match(/^\d+-([a-z0-9]+-\d{2})$/); // heretic: 09-pc-12
  if (m) return m[1];
  const md = fs.readFileSync(path.join(ROOT, 'examples', set, `${slug}.md`), 'utf8');
  const c = md.match(/^<!-- [^:]+: ([a-z0-9]+-\d{2})\./m); // pliny sets: <!-- 04-viewdata: ansi-09.
  if (c) return c[1];
  throw new Error(`no style id for ${set}/${slug}`);
}

const lockOld = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')) : { tiles: [] };
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const shotPage = await browser.newPage({ deviceScaleFactor: 1 });
const mountPage = await browser.newPage();
await mountPage.setContent('<canvas id="c" width="300" height="192"></canvas>');

const tiles = [];
let n = 0;
for (const reel of picks.reels) {
  for (const p of reel.picks) {
    n++;
    const num = String(n).padStart(2, '0');
    const svgRel = `examples/${p.set}/assets/${p.slug}.svg`;
    const mdRel = `examples/${p.set}/${p.slug}.md`;
    for (const f of [svgRel, mdRel]) if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`missing ${f}`);
    const svg = fs.readFileSync(path.join(ROOT, svgRel), 'utf8');
    const animated = /@keyframes|<animate/i.test(svg);
    const style = styleId(p.set, p.slug);
    const hash = crypto.createHash('sha256').update(svg).update(`${num}|${style}|${animated}|${p.frame ?? picks.frame_ms}|v3`).digest('hex').slice(0, 16);
    const file = `${num}.webp`;
    const entry = { n: num, ...p, style, animated, svg: svgRel, md: mdRel, tile: file, hash };
    const old = lockOld.tiles.find((t) => t.n === num);
    if (!force && old && old.hash === hash && fs.existsSync(path.join(OUT, file))) {
      tiles.push({ ...entry, bytes: fs.statSync(path.join(OUT, file)).size });
      console.log(`${num} ${p.set}/${p.slug}  (unchanged)`);
      continue;
    }

    // 1. the frame: intrinsic size from width/height or viewBox
    const vb = svg.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
    const wAttr = svg.match(/<svg[^>]*?\swidth="([\d.]+)"/), hAttr = svg.match(/<svg[^>]*?\sheight="([\d.]+)"/);
    const sw = Number(wAttr?.[1] || vb?.[1] || 960);
    const sh = Number(hAttr?.[1] || (vb ? (vb[2] * sw) / vb[1] : 540));
    await shotPage.setViewportSize({ width: Math.round(sw), height: Math.round(sh) });
    await shotPage.goto(pathToFileURL(path.join(ROOT, svgRel)).href);
    await shotPage.waitForTimeout(150);
    await shotPage.evaluate((t) => {
      const root = document.documentElement;
      if (root.pauseAnimations) { root.pauseAnimations(); root.setCurrentTime(t / 1000); }
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
    }, p.frame ?? picks.frame_ms);
    await shotPage.waitForTimeout(80);
    const png = (await shotPage.screenshot({ type: 'png' })).toString('base64');

    // 2. the mount and the label strip, composed in a canvas and encoded as WebP
    const left = `${num} ${SHORT[p.set]}`;
    const right = style.toUpperCase();
    const dataUrl = await mountPage.evaluate(async ({ png, left, right, animated, FONT }) => {
      const c = document.getElementById('c');
      const g = c.getContext('2d');
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      g.fillStyle = '#07080b'; g.fillRect(0, 0, 300, 192);
      g.fillStyle = '#2a3550'; g.fillRect(0, 0, 300, 4); g.fillRect(0, 0, 4, 192); g.fillRect(296, 0, 4, 192); g.fillRect(0, 188, 300, 4);
      // picture well: 284 x 152, letterboxed, centred
      const WX = 8, WY = 8, WW = 284, WH = 152;
      const s = Math.min(WW / img.width, WH / img.height);
      const dw = Math.round(img.width * s), dh = Math.round(img.height * s);
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, WX + Math.round((WW - dw) / 2), WY + Math.round((WH - dh) / 2), dw, dh);
      // label strip
      g.fillStyle = '#2a3550'; g.fillRect(0, 164, 300, 4);
      const px = 2, adv = 12;
      const draw = (str, x, y, col) => {
        g.fillStyle = col;
        [...str].forEach((ch, i) => FONT[ch].forEach((row, ry) => [...row].forEach((b, rx) => { if (b === '1') g.fillRect(x + i * adv + rx * px, y + ry * px, px, px); })));
      };
      const wid = (str) => ([...str].length - 1) * adv + 5 * px;
      const y = 171;
      draw(left, 10, y, '#eef3fb');
      const rx = 290 - wid(right);
      draw(right, rx, y, '#8fb0e4');
      let dotsEnd = rx - 10;
      if (animated) { draw('►', rx - 18, y, '#ffb347'); dotsEnd = rx - 26; }
      for (let x = 10 + wid(left) + 10; x + 2 <= dotsEnd; x += 6) { g.fillStyle = '#3d4a66'; g.fillRect(x, y + 6, 2, 2); }
      return c.toDataURL('image/webp', 0.86);
    }, { png, left, right, animated, FONT });
    const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
    if (!dataUrl.startsWith('data:image/webp')) throw new Error('this Chromium cannot encode WebP');
    fs.writeFileSync(path.join(OUT, file), buf);
    tiles.push({ ...entry, bytes: buf.length });
    console.log(`${num} ${p.set}/${p.slug}  ${style}${animated ? ' anim' : ''}  ${(buf.length / 1024).toFixed(1)} KB`);
  }
}
await browser.close();
fs.writeFileSync(LOCK, JSON.stringify({ frame_ms: picks.frame_ms, tiles }, null, 1) + '\n');
const total = tiles.reduce((a, t) => a + t.bytes, 0);
console.log(`${tiles.length} tiles, ${(total / 1024).toFixed(0)} KB`);
