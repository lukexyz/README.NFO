#!/usr/bin/env node
// Concept 06 (ARCADE FLOOR) hero: the attract-mode cabinet. Promoted from
// concepts/06-arcade-floor/proto-hero.mjs (left untouched).
//   node docs/front-page/arcade-floor/src/hero.mjs
// Writes assets/cabinet.svg (960x600, self-contained, glyphs as paths, reduced-motion still) and
// assets/social.png (1280x640, the reduced-motion TITLE still). Counts come from git and the catalogue.
//
// 24 s loop, four 6 s scenes on the CRT:
//   TITLE      starfield, HI-SCORE, INSERT COIN, NPX README-NFO, STYLES · FAMILIES
//   DEMO PLAY  three real header stills (JPEG data URIs, captured at t = 3 s)
//   NUMBERED   2x5 numbered cards, 03 picked; then 11-20 drop in
//   HOW TO PLAY  sign in, run, pick a number; private repos work
// Constant: chrome wordmark with a light sweep every 8 s, 1P CLAUDE / 2P CODEX buttons, coin LED at 1 Hz.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeWriter, textWidth } from './font.mjs';
import { vignette } from './minicards.mjs';
import { root } from './scan.mjs';
import { slot, freeze } from './freeze.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.join(root, 'package.json'));
const { chromium } = require('playwright');
const { checkCatalogue, svgPolicyIssues } = await import(pathToFileURL(path.join(root, 'tools/lib/checks.mjs')).href);

// ---------- facts (computed) ----------
const tracked = execSync('git ls-files examples', { cwd: root, encoding: 'utf8' }).split('\n');
const perSet = {};
for (const f of tracked) {
  const m = f.match(/^examples\/([^/]+)\/\d+-[^/]+\.md$/);
  if (m && !/-logos-/.test(m[1])) perSet[m[1]] = (perSet[m[1]] || 0) + 1;
}
const headers = Object.values(perSet).reduce((s, n) => s + n, 0);
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'styles/styles.json'), 'utf8'));
const styles = checkCatalogue(catalogue).distinct.length;
const families = catalogue.families.length;
console.log({ headers, styles, families });

const W = makeWriter('h');
const { text, centred } = W;

// ---------- demo frames: real headers rendered to JPEG and embedded ----------
const FRAMES = [
  ['castaway/assets/01-mode7-island_opus_5.5.svg', 'CASTAWAY', 'cover'],
  ['heretic/assets/15-demo-10.svg', 'HERETIC', 'cover'],
  ['naturalis-historia/assets/03-demo-titles.svg', 'NATURALIS HISTORIA', 'cover'],
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 448, height: 224 } });
const frames = [];
for (const [rel, name, fit] of FRAMES) {
  const host = path.join(out, '_frame.html');
  const file = path.join(root, 'examples', rel);
  // Frozen at exactly 3 s (see freeze.mjs) so the embedded JPEGs are reproducible.
  const blur = fit === 'contain' ? `<div style="position:absolute;left:-16px;top:-16px;width:480px;height:256px;filter:blur(10px) brightness(.35)">${slot(0, 'width:100%;height:100%')}</div>` : '';
  const items = fit === 'contain' ? [{ file, fit: 'cover' }, { file, fit: 'contain' }] : [{ file, fit }];
  fs.writeFileSync(host, `<body style="margin:0;background:#000;position:relative;width:448px;height:224px;overflow:hidden">${blur}${slot(items.length - 1, 'position:absolute;inset:0;width:448px;height:224px')}`);
  await page.goto(pathToFileURL(host).href);
  await freeze(page, items, 3000);
  const buf = await page.screenshot({ type: 'jpeg', quality: 50 });
  frames.push({ name, b64: buf.toString('base64'), kb: buf.length / 1024 });
  fs.rmSync(host);
}

// ---------- seeded starfield ----------
let seed = 1992;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const starLayer = (n, size, fill) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = Math.floor(rnd() * 600), y = Math.floor(rnd() * 300);
    d += `M${x} ${y}h${size}v${size}h-${size}z M${x + 600} ${y}h${size}v${size}h-${size}z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
};

// ---------- scenes (CRT coordinates: 600 x 300) ----------
const T = 24;
const pct = (s) => `${((s / T) * 100).toFixed(3)}%`;
const AMBER = '#ffcc33', CYAN = '#7fe3ff', LILAC = '#c9b8ff';

const sceneA = `<g class="sA">
  <g class="st3">${starLayer(40, 1, '#3a4466')}</g><g class="st2">${starLayer(28, 2, '#6c7aa8')}</g><g class="st1">${starLayer(14, 3, '#c9d4ff')}</g>
  ${centred(`HI-SCORE ${headers}`, 300, 16, 3, '#ff5a5a')}
  <g class="blink">${centred('INSERT COIN', 303, 77, 8, '#000')}${centred('INSERT COIN', 300, 74, 8, AMBER)}</g>
  <rect x="${300 - textWidth('NPX README-NFO', 4) / 2 - 16}" y="${158}" width="${textWidth('NPX README-NFO', 4) + 32}" height="${28 + 24}" rx="6" fill="#0c1a2a" stroke="#2c5a7a" stroke-width="2"/>
  ${centred('NPX README-NFO', 300, 170, 4, CYAN)}
  ${centred(`${styles} STYLES · ${families} FAMILIES`, 300, 252, 3, LILAC)}
</g>`;

const sceneB = frames.map((f, i) => `<g class="sB${i}">
  <image x="0" y="38" width="600" height="300" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${f.b64}" transform="translate(0 -38)"/>
  <rect x="12" y="12" width="${textWidth('DEMO PLAY', 3) + 16}" height="37" fill="#000" opacity=".8"/>${text('DEMO PLAY', 20, 20, 3, AMBER)}
  <rect x="12" y="251" width="${textWidth(f.name, 3) + 16}" height="37" fill="#000" opacity=".8"/>${text(f.name, 20, 259, 3, '#ffffff')}
</g>`).join('\n');

// NUMBERED: 2 rows of 5 mini cards. 03 is picked; then 11-20 drop in.
const CW = 100, CH = 58, GX = 12, GY = 14, X0 = (600 - (5 * CW + 4 * GX)) / 2, Y0 = 62;
const miniCard = (num, vi, x, y, picked = false) => `<g transform="translate(${x} ${y})">
  <rect x="-3" y="-3" width="${CW + 6}" height="${CH + 6}" rx="4" fill="${picked ? AMBER : '#2c3040'}"/>
  <svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">${vignette(vi, CW, CH)}</svg>
  <rect x="0" y="0" width="${textWidth(num, 2) + 8}" height="20" fill="${picked ? AMBER : '#000'}" opacity="${picked ? 1 : 0.85}"/>
  ${text(num, 4, 3, 2, picked ? '#000' : AMBER)}
</g>`;
const grid = (start, picked, cls) => Array.from({ length: 10 }, (_, i) => {
  const n = start + i;
  const x = X0 + (i % 5) * (CW + GX), y = Y0 + Math.floor(i / 5) * (CH + GY);
  return `<g class="${cls}${i}">${miniCard(String(n).padStart(2, '0'), (n - 1) % 20, x, y, n === picked)}</g>`;
}).join('');
const sceneC = `<g class="sC">
  <g class="c1">
    ${centred('YOUR GALLERY: 01-10', 300, 18, 4, AMBER)}
    ${grid(1, 3, 'ca')}
    <g class="tap">${centred('"NUMBER 3"', 300, 228, 4, '#ffffff')}${centred('NPX README-NFO USE 3', 300, 266, 3, CYAN)}</g>
  </g>
  <g class="c2">
    ${centred('10 MORE: 11-20', 300, 18, 4, AMBER)}
    ${grid(11, 0, 'cb')}
    ${centred('"MAKE 10 MORE"', 300, 228, 4, '#ffffff')}${centred('NO STYLE REPEATS', 300, 266, 3, CYAN)}
  </g>
</g>`;

const how = [['1', 'SIGN IN CLAUDE/CODEX', '#ffffff'], ['2', 'NPX README-NFO', CYAN], ['3', 'PICK A NUMBER', '#ffffff']];
const sceneD = `<g class="sD">
  ${centred('HOW TO PLAY', 300, 16, 5, AMBER)}
  ${how.map(([n, t, c], i) => `<rect x="46" y="${70 + i * 56}" width="36" height="40" rx="4" fill="${AMBER}"/>${text(n, 52, 76 + i * 56, 4, '#000')}${text(t, 100, 76 + i * 56, 4, c)}`).join('\n  ')}
  ${centred('PRIVATE REPOS WORK · NO TOKEN', 300, 252, 3, '#46e08a')}
</g>`;

// ---------- animation ----------
const fade = 0.25;
const showFor = (a, b) => `0%{opacity:0}${a > 0 ? `${pct(a - fade)}{opacity:0}` : ''}${pct(a)}{opacity:1}${pct(b - fade)}{opacity:1}${pct(b)}{opacity:0}100%{opacity:0}`;
let cardCss = '';
for (let i = 0; i < 10; i++) {
  // 01-10 land 3 at a time from 12.2 s; 11-20 drop 3 at a time from 15.2 s.
  const a = 12.2 + Math.floor(i / 3) * 0.35, b = 15.2 + Math.floor(i / 3) * 0.35;
  cardCss += `.ca${i}{animation:ca${i} ${T}s linear infinite}@keyframes ca${i}{0%,${pct(a)}{opacity:0;transform:translateY(-14px)}${pct(a + 0.3)},100%{opacity:1;transform:none}}`;
  cardCss += `.cb${i}{animation:cb${i} ${T}s linear infinite}@keyframes cb${i}{0%,${pct(b)}{opacity:0;transform:translateY(-14px)}${pct(b + 0.3)},100%{opacity:1;transform:none}}`;
}
const css = `
.sA,.sB0,.sB1,.sB2,.sC,.sD{opacity:0}
.sA{animation:sA ${T}s linear infinite}@keyframes sA{0%{opacity:1}${pct(6 - fade)}{opacity:1}${pct(6)}{opacity:0}${pct(T - fade)}{opacity:0}100%{opacity:1}}
.sB0{animation:sB0 ${T}s linear infinite}@keyframes sB0{${showFor(6, 8)}}
.sB1{animation:sB1 ${T}s linear infinite}@keyframes sB1{${showFor(8, 10)}}
.sB2{animation:sB2 ${T}s linear infinite}@keyframes sB2{${showFor(10, 12)}}
.sC{animation:sC ${T}s linear infinite}@keyframes sC{${showFor(12, 18)}}
.sD{animation:sD ${T}s linear infinite}@keyframes sD{${showFor(18, 24)}}
.c1{animation:c1 ${T}s linear infinite}@keyframes c1{0%,${pct(14.9)}{opacity:1}${pct(15.1)},100%{opacity:0}}
.c2{animation:c2 ${T}s linear infinite}@keyframes c2{0%,${pct(15.0)}{opacity:0}${pct(15.2)},100%{opacity:1}}
.tap{animation:tap ${T}s linear infinite}@keyframes tap{0%,${pct(13.4)}{opacity:0}${pct(13.6)},100%{opacity:1}}
${cardCss}
.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.st1{animation:drift 10s linear infinite}.st2{animation:drift 18s linear infinite}.st3{animation:drift 30s linear infinite}
@keyframes drift{to{transform:translateX(-600px)}}
.sweep{animation:sweep 8s ease-in-out infinite}@keyframes sweep{0%{transform:translateX(-260px)}45%,100%{transform:translateX(1000px)}}
.led{animation:blink 1s steps(1) infinite}
@media (prefers-reduced-motion:reduce){
  .sB0,.sB1,.sB2,.sC,.sD,.sweep{display:none}
  .sA,.blink,.st1,.st2,.st3,.led{animation:none}
  .sA{opacity:1}
}`;

// ---------- cabinet ----------
const word = 'README.NFO';
const ws = 9;
const wx = Math.round(480 - textWidth(word, ws, true) / 2);
const wordmark = (fill, dx = 0, dy = 0) => text(word, wx + dx, 28 + dy, ws, fill, { bold: true });
const tagline = 'RETRO HEADERS FOR YOUR README';
const body = `
<ellipse cx="480" cy="592" rx="440" ry="7" fill="#000" opacity=".22"/>
<rect x="30" y="4" width="900" height="588" rx="18" fill="#151722" stroke="#4a5060" stroke-width="2"/>
<g clip-path="url(#sides)">
  <path d="M20 520 L200 120 L240 120 L60 520Z" fill="#ff8a3d"/><path d="M70 520 L250 120 L290 120 L110 520Z" fill="#ff3d9a"/><path d="M120 520 L300 120 L340 120 L160 520Z" fill="#3dd6ff"/>
  <path d="M760 520 L940 120 L980 120 L800 520Z" fill="#ff8a3d"/><path d="M810 520 L990 120 L1030 120 L850 520Z" fill="#ff3d9a"/><path d="M860 520 L1040 120 L1080 120 L900 520Z" fill="#3dd6ff"/>
</g>
<rect x="44" y="16" width="872" height="124" rx="10" fill="url(#marquee)" stroke="#7a6cff" stroke-width="2"/>
${wordmark('#000', 4, 5)}${wordmark('url(#chrome)')}
<g clip-path="url(#wordClip)"><rect class="sweep" x="0" y="20" width="120" height="90" fill="url(#sweepG)" transform="translate(-260 0)"/></g>
${centred(tagline, 480, 104, 3, LILAC)}
<rect x="172" y="150" width="616" height="332" rx="14" fill="#0b0c12" stroke="#2c3040" stroke-width="2"/>
<g transform="translate(180 166)">
  <rect width="600" height="300" rx="18" fill="#04050a"/>
  <g clip-path="url(#crt)">
    ${sceneA}
    ${sceneB}
    ${sceneC}
    ${sceneD}
    <rect width="600" height="300" fill="url(#scan)"/>
    <rect width="600" height="300" fill="url(#glass)"/>
  </g>
  <rect width="600" height="300" rx="18" fill="none" stroke="#000" stroke-width="6" opacity=".6"/>
</g>
<path d="M40 492 H920 L940 590 H20 Z" fill="url(#panel)" stroke="#4a5060" stroke-width="2"/>
<path d="M42 494 H918" stroke="#6a7090" stroke-width="2"/>
<ellipse cx="112" cy="560" rx="38" ry="12" fill="#0a0b10"/><rect x="108" y="522" width="8" height="38" fill="#9aa3b5"/>
<circle cx="112" cy="520" r="17" fill="#e8323c"/><circle cx="106" cy="514" r="5" fill="#fff" opacity=".55"/>
<circle cx="242" cy="542" r="22" fill="#7a3a10"/><circle cx="242" cy="538" r="20" fill="#ff8a3d"/><circle cx="236" cy="532" r="6" fill="#fff" opacity=".5"/>
${text('1P CLAUDE', 276, 528, 4, '#ffb27a')}
<circle cx="546" cy="542" r="22" fill="#0f5a6e"/><circle cx="546" cy="538" r="20" fill="#3dd6ff"/><circle cx="540" cy="532" r="6" fill="#fff" opacity=".5"/>
${text('2P CODEX', 580, 528, 4, '#8fe9ff')}
<rect x="800" y="504" width="104" height="80" rx="6" fill="#0a0b10" stroke="#4a5060" stroke-width="2"/>
${text('COIN', 818, 516, 3, '#9aa3b5')}
<rect x="846" y="542" width="12" height="30" rx="2" fill="#000" stroke="#6a7090" stroke-width="2"/>
<circle class="led" cx="824" cy="557" r="6" fill="#ff3b3b"/><circle cx="882" cy="557" r="6" fill="#ff3b3b"/>
`;
const wordClip = [...word].map((ch, i) => `<use href="#${W.id(ch, true)}" transform="translate(${wx + i * 7 * ws} 28) scale(${ws})"/>`).join('');
const defs = `<defs>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="7" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".42" stop-color="#9fd8ff"/><stop offset=".5" stop-color="#2b3c8f"/>
    <stop offset=".58" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff4f6d"/>
  </linearGradient>
  <linearGradient id="marquee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1260"/><stop offset="1" stop-color="#0b0624"/></linearGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2e45"/><stop offset="1" stop-color="#14161f"/></linearGradient>
  <linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="glass" cx=".35" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".35"/></pattern>
  <clipPath id="crt"><rect width="600" height="300" rx="18"/></clipPath>
  <clipPath id="sides"><rect x="44" y="150" width="128" height="332"/><rect x="788" y="150" width="128" height="332"/></clipPath>
  ${W.defs()}
  <clipPath id="wordClip">${wordClip}</clipPath>
</defs>`;
const alt = `README.NFO arcade cabinet. The screen loops: insert coin, demo play of three real headers, a numbered gallery where you pick 3 and get 11 to 20, and how to play.`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600" role="img" aria-label="${alt}">
<title>${alt}</title>
<style>${css}</style>${defs}${body}</svg>
`;
const file = path.join(out, 'cabinet.svg');
fs.writeFileSync(file, svg);
const issues = svgPolicyIssues(svg);
console.log(`cabinet.svg: ${(svg.length / 1024).toFixed(1)} KB (frames ${frames.map((f) => f.kb.toFixed(1)).join(' + ')} KB raw), policy: ${issues.length ? issues.join('; ') : 'ok'}, <text>: ${(svg.match(/<text\b/g) || []).length}`);
if (svg.length / 1024 > 125) console.log('WARN cabinet.svg is over the 125 KB budget');
await browser.close();

// ---------- social preview: the reduced-motion still on a dark plate ----------
const rm = await chromium.launch({ args: ['--force-prefers-reduced-motion'] });
const sp = await rm.newPage({ viewport: { width: 1280, height: 640 } });
const social = path.join(out, '_social.html');
fs.writeFileSync(social, `<body style="margin:0;width:1280px;height:640px;background:radial-gradient(circle at 50% 40%,#1d1640,#07080d 70%);display:flex;align-items:center;justify-content:center"><img src="${pathToFileURL(file).href}" height="600">`);
await sp.goto(pathToFileURL(social).href);
await sp.waitForTimeout(2500);
await sp.screenshot({ path: path.join(out, 'social.png') });
fs.rmSync(social);
await rm.close();
console.log('social.png', (fs.statSync(path.join(out, 'social.png')).size / 1024).toFixed(0), 'KB');
