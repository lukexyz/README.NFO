#!/usr/bin/env node
// Concept 02 BOOT INTRO: the hero intro screen, in a dark-page and a
// light-page bezel. Deterministic (seeded stars, no clock, no randomness).
//   node docs/front-page/boot-intro/src/hero.mjs
// Writes ../assets/hero-dark.svg and ../assets/hero-light.svg.
// Every glyph is an original bitmap from fonts.mjs, drawn as <symbol>/<use>;
// there is no <text>. Motion is CSS only and stops under reduced motion,
// where a composed still (logo, both engines, a parked scroller) shows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FONT5, bold8, LOGO, layoutCells, cellsToPath, glyphPath, mulberry32 } from './fonts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '..', 'assets');
fs.mkdirSync(assets, { recursive: true });

const W = 960, H = 480;
const SX = 22, SY = 20, SW = 916, SH = 412; // the screen
const f1 = (n) => +n.toFixed(1);
const f3 = (n) => +n.toFixed(3);

// ---------- copy (decorative only: the README carries every instruction) ----------
const TOP_LEFT = 'A RETRO HEADER FOR EVERY REPO';
const TOP_RIGHT = '153 STYLES · 13 FAMILIES';
const PRESS = '► PRESS SPACE ▼';
const SCROLL = 'README.NFO · 153 STYLES · 13 FAMILIES · DRAWN FRESH FOR YOUR PROJECT · '
  + 'ASK FOR 10 · SAY A NUMBER · MAKE 10 MORE · CLAUDE CODE OR CODEX · '
  + 'PRIVATE REPOS WELCOME · GREETINGS TO 16COLO.RS · DEMOZOO · POUET · TEXTFILES.COM · ';
const PARKED = 'ASK FOR 10 · SAY A NUMBER';

// ---------- 5x7 label glyphs ----------
const used5 = new Set([...TOP_LEFT, ...TOP_RIGHT, ...PRESS, ...'ENGINE◄►CLAUDE CODE/XFACTSYOURFOLDER', ...'README.NFO']);
const sym5 = [...used5].filter((c) => c !== ' ').map((c) => {
  const id = 'a' + c.codePointAt(0).toString(36);
  return { c, id, el: `<symbol id="${id}" overflow="visible"><path d="${glyphPath(FONT5[c] || FONT5['?'])}"/></symbol>` };
});
const id5 = Object.fromEntries(sym5.map((s) => [s.c, s.id]));
// A string of 5x7 glyphs at scale s, left edge x, top y.
function label(str, x, y, s, fill, extra = '') {
  const uses = [...str].map((c, i) => (c === ' ' ? '' : `<use href="#${id5[c]}" x="${i * 6}"/>`)).join('');
  return `<g transform="translate(${f1(x)} ${y}) scale(${s})" fill="${fill}"${extra}>${uses}</g>`;
}
const labelW = (str, s) => (str.length * 6 - 1) * s;

// ---------- 8x8 bold scroller glyphs at 5 px a pixel ----------
const G = 5, ADV = 40;
const used8 = new Set([...SCROLL, ...PARKED]);
const sym8 = [...used8].filter((c) => c !== ' ').map((c) => {
  const id = 'b' + c.codePointAt(0).toString(36);
  const rows = bold8(c);
  return {
    c, id,
    el: `<symbol id="${id}" overflow="visible"><path d="${glyphPath(rows, G, 3, 3)}" fill="#1a0630"/><path d="${glyphPath(rows, G)}" fill="url(#cg)"/></symbol>`,
  };
});
const id8 = Object.fromEntries(sym8.map((s) => [s.c, s.id]));

// ---------- logo ----------
const CELL = 11;
const logo = layoutCells('README.NFO', LOGO, { gap: 1, leanEvery: 3 });
const LW = logo.width * CELL, LX = Math.round(W / 2 - LW / 2), LY = 60, LH = 9 * CELL;
const logoD = cellsToPath(logo.cells, CELL, LX, LY);
const has = (x, y) => logo.cells.has(`${x},${y}`);
const topLit = new Set(), botShade = new Set(), leftLit = new Set();
for (const k of logo.cells) {
  const [x, y] = k.split(',').map(Number);
  if (!has(x, y - 1)) topLit.add(k);
  if (!has(x, y + 1)) botShade.add(k);
  if (!has(x - 1, y)) leftLit.add(k);
}
const strip = (set, dx, dy, w, h) => {
  let d = '';
  for (const k of set) {
    const [x, y] = k.split(',').map(Number);
    d += `M${LX + x * CELL + dx} ${LY + y * CELL + dy}h${w}v${h}h-${w}z`;
  }
  return d;
};

// ---------- starfield ----------
const rnd = mulberry32(1990);
function stars(n, w, h, fill, dur, cls) {
  let d = '';
  const pts = Array.from({ length: n }, () => [Math.floor(rnd() * SW), SY + 2 + Math.floor(rnd() * (SH - 6))]);
  for (const copy of [0, SW]) for (const [x, y] of pts) d += `M${SX + x + copy} ${y}h${w}v${h}h-${w}z`;
  return `<path class="${cls}" d="${d}" fill="${fill}"/>`;
}

// ---------- scroller ----------
const P = 12; // phase groups; wavelength = 12 glyphs = 480 px
let text = SCROLL;
while (text.length % P) text += ' ';
const N = text.length;
const SPEED = 180, AMP = 24, BASE = 316 + AMP;
const L = N * ADV;
const LAP = f3(L / SPEED);
const T = f3((P * ADV) / SPEED);
const X0 = SX + 26;
const visible = Math.ceil(SW / ADV) + 2;
const groups = Array.from({ length: P }, () => []);
for (let i = 0; i < N + visible; i++) {
  const c = text[i % N];
  if (c === ' ') continue;
  groups[i % P].push(`<use href="#${id8[c]}" x="${X0 + i * ADV}" y="${BASE}"/>`);
}
const SAMPLES = 24;
const bobKeys = Array.from({ length: SAMPLES + 1 }, (_, s) => {
  const f = s / SAMPLES;
  return `${f1(f * 100)}%{transform:translateY(${f1(-AMP * Math.sin(2 * Math.PI * f))}px)}`;
}).join('');
const bobCss = groups.map((_, k) => `.b${k}{animation-delay:${f3((k * T) / P - T)}s}`).join('');

// Parked scroller for the still: 32 px glyphs on a frozen wave.
const parkS = 0.8, parkAdv = ADV * parkS;
const parkX = Math.round(W / 2 - (PARKED.length * parkAdv) / 2);
const parked = [...PARKED].map((c, i) => (c === ' ' ? '' : `<use href="#${id8[c]}" transform="translate(${f1(parkX + i * parkAdv)} ${f1(BASE + 4 + 14 * Math.sin((2 * Math.PI * i) / 12))}) scale(${parkS})"/>`)).join('');

// ---------- loader strip ----------
const LS = 3, CH = 6 * LS; // 18 px a character
const F1W = labelW('ENGINE ◄ CLAUDE/CODEX ►', LS) + 24;
const F2W = labelW('FACTS ◄ YOUR FOLDER ►', LS) + 24;
const GAP = 20, FY = 198, FH = 33;
const F1X = Math.round(W / 2 - (F1W + GAP + F2W) / 2), F2X = F1X + F1W + GAP;
const TY = FY + (FH - 7 * LS) / 2;
function field(x, w) {
  return `<rect x="${x}" y="${FY}" width="${w}" height="${FH}" fill="#2b303b"/>`
    + `<path d="M${x} ${FY}h${w}v2H${x + 2}v${FH - 2}h-2z" fill="#6b7386"/>`
    + `<path d="M${x + w} ${FY + FH}h-${w}v-2h${w - 2}V${FY}h2z" fill="#0e1015"/>`;
}
// Right part ("◄ VALUE ►") centred in the 16 characters after the label.
function engineValue(str, valueFill, cls) {
  const x0 = F1X + 12 + 7 * CH + ((16 - str.length) * CH) / 2;
  const a = str.indexOf(' '), b = str.lastIndexOf(' ');
  return `<g class="${cls}">`
    + label('◄', x0, TY, LS, '#ffd84a')
    + label(str.slice(a + 1, b), x0 + (a + 1) * CH, TY, LS, valueFill)
    + label('►', x0 + b * CH + CH, TY, LS, '#ffd84a') + '</g>';
}

// ---------- assemble ----------
function build(theme) {
  const dark = theme === 'dark';
  const bezel = dark
    ? `<rect x="4.5" y="3.5" width="951" height="469" rx="22" fill="#161b22" stroke="#30363d"/>`
    : `<rect x="8" y="10" width="944" height="466" rx="22" fill="#000" opacity=".28" filter="url(#soft)"/>`
      + `<rect x="4.5" y="3.5" width="951" height="469" rx="22" fill="#2a2c33" stroke="#d0d7de"/>`
      + `<path d="M26 4.5h908" stroke="#4a4d57" stroke-width="1"/>`;
  const defs = `<defs>
<linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="${LY}" x2="0" y2="${LY + LH}">
<stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#d7ecff"/><stop offset=".42" stop-color="#7fb6ec"/>
<stop offset=".535" stop-color="#3f74b8"/><stop offset=".536" stop-color="#2a1206"/><stop offset=".62" stop-color="#6e3612"/>
<stop offset=".8" stop-color="#e5872c"/><stop offset="1" stop-color="#ffe9b0"/></linearGradient>
<linearGradient id="cg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="35">
<stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#ffe46a"/><stop offset=".58" stop-color="#ff9a2a"/>
<stop offset=".82" stop-color="#e8304e"/><stop offset="1" stop-color="#8f1a66"/></linearGradient>
<linearGradient id="cu" x1="0" x2="1"><stop offset="0" stop-color="#ff2fa0" stop-opacity="0"/><stop offset=".12" stop-color="#ff2fa0"/>
<stop offset=".35" stop-color="#ff8a1f"/><stop offset=".5" stop-color="#ffe14a"/><stop offset=".65" stop-color="#ff8a1f"/>
<stop offset=".88" stop-color="#ff2fa0"/><stop offset="1" stop-color="#ff2fa0" stop-opacity="0"/></linearGradient>
<linearGradient id="cv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/>
<stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/>
<stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/>
<stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".24"/></pattern>
<clipPath id="scr"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="12"/></clipPath>
<path id="L" d="${logoD}"/>
<clipPath id="lc"><use href="#L"/></clipPath>
${dark ? '' : '<filter id="soft" x="-5%" y="-5%" width="110%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>'}
${sym5.map((s) => s.el).join('\n')}
${sym8.map((s) => s.el).join('\n')}
</defs>`;

  const css = `<style>
.s1{animation:sf 23.1s linear infinite}.s2{animation:sf 11.55s linear infinite}.s3{animation:sf 5.78s linear infinite}
@keyframes sf{to{transform:translateX(-${SW}px)}}
.strip{animation:scr ${LAP}s linear infinite}@keyframes scr{to{transform:translateX(-${L}px)}}
.bob{animation:bob ${T}s linear infinite}@keyframes bob{${bobKeys}}${bobCss}
.gl{animation:gl 8s linear infinite}@keyframes gl{0%{transform:translateX(0)}15%,100%{transform:translateX(1060px)}}
.e1{animation:e1 8s linear infinite}@keyframes e1{0%,46%{opacity:1}50%,96%{opacity:0}100%{opacity:1}}
.e2{opacity:0;animation:e2 8s linear infinite}@keyframes e2{0%,46%{opacity:0}50%,96%{opacity:1}100%{opacity:0}}
.pr{animation:pr 2s ease-in-out infinite}@keyframes pr{50%{opacity:.25}}
.still,.e3{display:none}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.mov,.e1,.e2{display:none}.still,.e3{display:inline}}
</style>`;

  const screen = `<g clip-path="url(#scr)">
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#04050b"/>
${stars(70, 1, 1, '#5a6a8a', 23.1, 's1')}
${stars(40, 2, 2, '#9fb3d9', 11.55, 's2')}
${stars(18, 3, 2, '#ffffff', 5.78, 's3')}
${label(TOP_LEFT, 40, 34, 2, '#8fb8ff')}
${label(TOP_RIGHT, SX + SW - 18 - labelW(TOP_RIGHT, 2), 34, 2, '#8fb8ff')}
<g transform="translate(6 6)"><use href="#L" fill="none" stroke="#000" stroke-width="6"/><use href="#L" fill="#3a1572"/></g>
<use href="#L" fill="none" stroke="#000" stroke-width="6" stroke-linejoin="miter"/>
<use href="#L" fill="url(#lg)"/>
<path d="${strip(topLit, 0, 0, CELL, 2)}" fill="#fff" opacity=".9"/>
<path d="${strip(leftLit, 0, 0, 2, CELL)}" fill="#fff" opacity=".35"/>
<path d="${strip(botShade, 0, CELL - 2, CELL, 2)}" fill="#000" opacity=".35"/>
<g clip-path="url(#lc)"><g class="gl"><path d="M${LX - 120} ${LY + LH}l40 -${LH}h26l-40 ${LH}z" fill="#fff" opacity=".7"/><path d="M${LX - 76} ${LY + LH}l40 -${LH}h8l-40 ${LH}z" fill="#fff" opacity=".5"/></g></g>
<rect x="40" y="178" width="880" height="8" fill="url(#cu)"/><rect x="40" y="178" width="880" height="8" fill="url(#cv)"/>
${field(F1X, F1W)}${field(F2X, F2W)}
${label('ENGINE', F1X + 12, TY, LS, '#9fb0c8')}
${engineValue('◄ CLAUDE CODE ►', '#ffb68f', 'e1')}
${engineValue('◄ CODEX ►', '#8fdcff', 'e2')}
${engineValue('◄ CLAUDE/CODEX ►', '#ffffff', 'e3')}
${label('FACTS', F2X + 12, TY, LS, '#9fb0c8')}
${label('◄', F2X + 12 + 6 * CH, TY, LS, '#ffd84a')}
${label('YOUR FOLDER', F2X + 12 + 8 * CH, TY, LS, '#7dffb0')}
${label('►', F2X + 12 + 20 * CH, TY, LS, '#ffd84a')}
${label(PRESS, W / 2 - labelW(PRESS, LS) / 2, 245, LS, '#ffd84a', ' class="pr"')}
<g class="mov"><g class="strip">${groups.map((g, k) => `<g class="bob b${k}">${g.join('')}</g>`).join('\n')}</g></g>
<g class="still">${parked}</g>
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#scan)"/>
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#vig)"/>
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH / 2}" fill="url(#gloss)"/>
</g>`;

  const chassis = `${label('README.NFO', 40, 446, 2, dark ? '#3d4450' : '#4c505b')}
<rect x="884" y="449" width="14" height="5" fill="#2dff7a"/><rect x="881" y="446" width="20" height="11" fill="#2dff7a" opacity=".18"/>
<rect x="852" y="449" width="14" height="5" fill="${dark ? '#262c36' : '#3a3d46'}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">README.NFO intro screen: a chrome README.NFO logo over a starfield, an engine field switching between Claude Code and Codex, a facts field reading your folder, and a sine-wave scroller.</title>
${css}
${defs}
${bezel}
${screen}
${chassis}
</svg>
`;
}

for (const theme of ['dark', 'light']) {
  const svg = build(theme).replace(/\n{2,}/g, '\n');
  const file = path.join(assets, `hero-${theme}.svg`);
  fs.writeFileSync(file, svg);
  const kb = Buffer.byteLength(svg) / 1024;
  console.log(`hero-${theme}.svg ${kb.toFixed(1)} KB (scroller ${N} chars, lap ${LAP}s, logo ${LW}px)`);
  if (kb > 100) throw new Error('hero over 100 KB');
  if (/<text|<script|href="http/.test(svg)) throw new Error('forbidden element');
}
