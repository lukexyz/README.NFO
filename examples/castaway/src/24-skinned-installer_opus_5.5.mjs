#!/usr/bin/env node
// CASTAWAY as a skinned installer: a non-rectangular gadget window that floats on the page.
//
// Style: "Skinned rip installer" (catalogue pc-06). The trope, from the turn of the 2000s: a
// custom-shaped window instead of a dialog box, a lit logo sign bolted to its top-left corner,
// a short button column (INSTALL, NFO, MUSIC, EXIT), a riveted viewport with release info and
// one modest effect (a rotating, morphing 3D dot object), a progress bar, a small music
// toggle and a credits strip along the bottom edge. Nothing is copied from any real installer:
// no group name, wordmark, skin or tune. The skin maker named here, SETUP-ON-SEA, is invented,
// and the only thing this installer installs is Castaway itself, which is the owner's own work.
//
// Regenerate:  node examples/castaway/src/24-skinned-installer_opus_5.5.mjs
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). All lettering is drawn:
// a 5x7 bitmap face (one <path> per glyph, text is <use>) and a chamfered vector face for the
// sign. No <text>, no fonts, no external files.
//
// One loop is 45 s: fifteen bars of the project's theme (80 BPM, a bar every 3 s, a beat every
// 0.75 s). Everything moves on the beat. The cursor presses INSTALL, the progress bar climbs
// one segment a beat to 99 % and stops there (ETA: 10:00:00, which never changes), five pages
// of release info dissolve through a pixel cloud while the dot object morphs palm -> clock
// face -> sound wave -> coconut -> iced coffee. In the porthole a shark in headphones crosses
// behind the island, nodding. Then the cursor presses EXIT, and she does: she picks up the
// iced coffee from the sand, walks out over the water, comes back with a fresh one and plants
// it where the old one stood, so the loop closes. The resting frame (prefers-reduced-motion)
// is the 99 % wait.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '24-skinned-installer_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const W = 1000, H = 584;
const T = 45; // loop, seconds
const BEAT = 0.75;
const PI = Math.PI;

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------
const n = (v, d = 2) => {
  let s = (+v).toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
};
const pct = (t) => n((((t % T) + T) % T) / T * 100, 3);
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);
const css = ['.w{animation:45s step-end infinite}'];
let kfId = 0;

// Opacity switched on in the given windows [a, b) (seconds, may wrap past T), stepped. Returns
// the element's class list; `hidden` makes the element invisible when animation is off (the
// resting frame is the 99 % wait).
function windowAnim(ons, hidden = false, period = T) {
  const md = (t) => +((((t % period) + period) % period).toFixed(4)) % period; // no float drift
  const on = (t) => ons.some(([a, b]) => {
    a = md(a); b = md(b);
    return a <= b ? t >= a && t < b : t >= a || t < b;
  });
  const cuts = [...new Set(ons.flat().map(md))].sort((x, y) => x - y);
  const name = `w${(kfId++).toString(36)}`;
  let kf = `0%{opacity:${on(0) ? 1 : 0}}`;
  for (const c of cuts) if (c > 0) kf += `${n(c / period * 100, 2)}%{opacity:${on(c) ? 1 : 0}}`;
  css.push(`.${name}{animation-name:${name}${period !== T ? `;animation-duration:${n(period, 3)}s` : ''}${hidden ? ';opacity:0' : ''}}@keyframes ${name}{${kf}}`);
  return `w ${name}`;
}
// Arbitrary stepped declarations: pts = [[t, 'transform:...'], ...] held until the next point.
function stepAnim(pts, period = T, extra = '') {
  const name = `s${(kfId++).toString(36)}`;
  pts = [...pts].sort((a, b) => a[0] - b[0]);
  const last = pts[pts.length - 1][1];
  let kf = pts[0][0] > 0 ? `0%{${last}}` : '';
  for (const [t, d] of pts) kf += `${n(t / period * 100, 2)}%{${d}}`;
  kf += `100%{${last}}`;
  css.push(`.${name}{animation:${name} ${n(period, 3)}s step-end infinite${extra}}@keyframes ${name}{${kf}}`);
  return name;
}

// ---------------------------------------------------------------------------------------------
// 5x7 bitmap face (capitals, digits, punctuation). Text is <use> of one path per glyph.
// ---------------------------------------------------------------------------------------------
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.##..|.##..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  ';': '.....|.##..|.##..|.....|.##..|.##..|.#...',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
  ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '·': '.....|.....|.....|.##..|.##..|.....|.....',
  '♦': '.....|..#..|.###.|#####|.###.|..#..|.....',
};
// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, px = 1) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${n(ox + r.x * px)} ${n(oy + r.y * px)}h${n(r.w * px)}v${n(r.h * px)}h${n(-r.w * px)}z`).join('');
}
const glyphIds = new Map();
const ID_CHARS = 'abcefghijklmnopqrsuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // no 't' or 'd' (title, desc)
const gid = (ch) => {
  if (!F5[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) {
    const k = glyphIds.size;
    glyphIds.set(ch, k < ID_CHARS.length ? ID_CHARS[k] : `g${k}`);
  }
  return glyphIds.get(ch);
};
const textW = (str, s) => ([...str].length * 6 - 1) * s;
// One line of text: a group placed at (x, y) and scaled, then one <use> per glyph.
function text(str, x, y, s, fill, cls = '') {
  let u = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') u += `<use href="#${gid(ch)}" x="${i * 6}"/>`; });
  return `<g${cls ? ` class="${cls}"` : ''} transform="translate(${n(x)} ${n(y)}) scale(${n(s, 3)})" fill="${fill}">${u}</g>`;
}
const textC = (str, cx, y, s, fill, cls) => text(str, cx - textW(str, s) / 2, y, s, fill, cls);
const textR = (str, rx, y, s, fill, cls) => text(str, rx - textW(str, s), y, s, fill, cls);

// Multi-colour pixel sprite: rows of palette characters, one merged path per colour.
function sprite(rows, pal, ox = 0, oy = 0, px = 1) {
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy, px);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
}

// ---------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------
const C = {
  ink: '#151b22',
  steelHi: '#e4eaf0', steelLo: '#424c58',
  navy: '#07113a', navy2: '#0e2163',
  cyan: '#46dbff', pale: '#def6ff', dim: '#5d6e8e',
  amber: '#ffc24a',
  coral: '#e46f58', coralD: '#c4553f', cream: '#f2e9d6', creamD: '#cbb995',
  skin: '#edb38c', skinD: '#d39472', hair: '#5a3322', hairD: '#43251a',
};

// ---------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------
const SIGN = { x: 24, y: 14, w: 532, h: 112 };
const VP = { x: 58, y: 146, w: 504, h: 270 }; // blue riveted frame
const IN = { x: 72, y: 160, w: 476, h: 242 }; // navy glass
const DOT = { cx: 158, cy: 284 }; // dot object centre
const TX = 250; // text column left
const BTN = { x: 586, w: 98, h: 48, ys: [162, 224, 286, 348] };
const PORT = { cx: 836, cy: 244, R: 148, ring: 132, glass: 116 };
const PROG = { x: 58, y: 428, w: 636, h: 56 };
const RAIL = { x: 88, y: 502, w: 856, h: 36 };

const defs = [];
const body = [];

// ---------------------------------------------------------------------------------------------
// Gradients and filters
// ---------------------------------------------------------------------------------------------
defs.push(
  `<linearGradient id="lSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3ccd5"/><stop offset=".45" stop-color="#97a3af"/><stop offset="1" stop-color="#66717e"/></linearGradient>`,
  `<linearGradient id="lSteelD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c5763"/><stop offset="1" stop-color="#2a323c"/></linearGradient>`,
  `<radialGradient id="rHousing" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#dfe6ec"/><stop offset=".55" stop-color="#97a3af"/><stop offset="1" stop-color="#55606d"/></radialGradient>`,
  `<linearGradient id="lBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a82e0"/><stop offset=".5" stop-color="#2b5bb8"/><stop offset="1" stop-color="#1a3a82"/></linearGradient>`,
  `<radialGradient id="rBlue" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#5a92ee"/><stop offset=".7" stop-color="#2a58b4"/><stop offset="1" stop-color="#193678"/></radialGradient>`,
  `<linearGradient id="lRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0533a"/><stop offset=".55" stop-color="#c3261a"/><stop offset="1" stop-color="#7c120b"/></linearGradient>`,
  `<linearGradient id="lSignGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c0c06"/><stop offset=".5" stop-color="#170502"/><stop offset="1" stop-color="#2a0a04"/></linearGradient>`,
  `<linearGradient id="lLetter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6b8"/><stop offset=".3" stop-color="#ffd94a"/><stop offset=".68" stop-color="#ff9d22"/><stop offset="1" stop-color="#ff5a12"/></linearGradient>`,
  `<linearGradient id="lBtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#456fb6"/><stop offset="1" stop-color="#213e78"/></linearGradient>`,
  `<linearGradient id="lBtnH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f95ec"/><stop offset="1" stop-color="#2d58ad"/></linearGradient>`,
  `<linearGradient id="lBtnP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3266"/><stop offset="1" stop-color="#2f58a6"/></linearGradient>`,
  `<linearGradient id="lSeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".45" stop-color="#ffb52e"/><stop offset="1" stop-color="#e2700f"/></linearGradient>`,
  `<linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d9ae8"/><stop offset="1" stop-color="#a6dcff"/></linearGradient>`,
  `<linearGradient id="lSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3aa6e6"/><stop offset=".35" stop-color="#1b80cc"/><stop offset="1" stop-color="#0d5ea8"/></linearGradient>`,
  `<linearGradient id="lTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c47e58"/><stop offset=".55" stop-color="#a1603f"/><stop offset="1" stop-color="#77412b"/></linearGradient>`,
  `<radialGradient id="rVig" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#03163c" stop-opacity="0"/><stop offset="1" stop-color="#03163c" stop-opacity=".5"/></radialGradient>`,
  `<radialGradient id="rBolt" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#9aa5b1"/><stop offset="1" stop-color="#4b5561"/></radialGradient>`,
  `<radialGradient id="rLed" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff8d0"/><stop offset=".5" stop-color="#ffb62e"/><stop offset="1" stop-color="#b85a00"/></radialGradient>`,
  `<radialGradient id="rLedG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eaffe8"/><stop offset=".5" stop-color="#4fe36a"/><stop offset="1" stop-color="#16752a"/></radialGradient>`,
  `<filter id="fShadow" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur stdDeviation="7"/></filter>`,
  `<filter id="fGlow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>`,
  `<clipPath id="cGlass"><circle cx="${PORT.cx}" cy="${PORT.cy}" r="${PORT.glass}"/></clipPath>`,
  `<clipPath id="cText"><rect x="${TX - 6}" y="${IN.y + 6}" width="${IN.x + IN.w - TX}" height="${IN.h - 12}"/></clipPath>`,
  `<clipPath id="cStrip"><rect x="${RAIL.x + 12}" y="${RAIL.y + 6}" width="${RAIL.w - 24}" height="${RAIL.h - 12}" rx="3"/></clipPath>`,
);
// Rivets and slotted bolts are symbols, placed with <use>.
defs.push(`<circle id="rv" r="2.4" fill="url(#rBolt)" stroke="#2a323c" stroke-width=".7"/>`,
  `<g id="bt"><circle r="5" fill="url(#rBolt)" stroke="${C.ink}"/><path d="M-3.1 0H3.1" stroke="#3a434e" stroke-width="1.2"/></g>`);
const bolt = (x, y, r = 5, rot = 35) => `<use href="#bt" transform="translate(${n(x)} ${n(y)}) rotate(${Math.round(rot)})${r !== 5 ? ` scale(${n(r / 5, 3)})` : ''}"/>`;
const rivet = (x, y, r = 2.4) => (r === 2.4 ? `<use href="#rv" x="${n(x)}" y="${n(y)}"/>`
  : `<use href="#rv" transform="translate(${n(x)} ${n(y)}) scale(${n(r / 2.4, 3)})"/>`);

// ---------------------------------------------------------------------------------------------
// Silhouette pieces (also used for the drop shadow)
// ---------------------------------------------------------------------------------------------
const SLAB = 'M64 92H700L720 112V470L696 494H74L40 460V116Z';
const ARM = 'M690 352H958L984 378V472L960 496H690Z';
const shadowShapes =
  `<path d="${SLAB}"/><path d="${ARM}"/><circle cx="${PORT.cx}" cy="${PORT.cy}" r="${PORT.R}"/>` +
  `<rect x="${SIGN.x}" y="${SIGN.y}" width="${SIGN.w}" height="${SIGN.h}" rx="10"/>` +
  `<rect x="${RAIL.x}" y="${RAIL.y}" width="${RAIL.w}" height="${RAIL.h}" rx="8"/>`;
body.push(`<g transform="translate(9 13)" fill="#000" opacity=".32" filter="url(#fShadow)">${shadowShapes}</g>`);

// ---------------------------------------------------------------------------------------------
// Pipes and cables (behind the body)
// ---------------------------------------------------------------------------------------------
function pipe(d, w = 16, cls = '') {
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"${cls}>` +
    `<path d="${d}" stroke="${C.ink}" stroke-width="${w + 4}"/>` +
    `<path d="${d}" stroke="#6f7b88" stroke-width="${w}"/>` +
    `<path d="${d}" stroke="#a9b4bf" stroke-width="${w * 0.55}" transform="translate(-1.6 -1.6)"/>` +
    `<path d="${d}" stroke="#eef3f7" stroke-width="${w * 0.16}" opacity=".85" transform="translate(-3 -3)"/></g>`;
}
const collar = (x, y, vertical) => vertical
  ? `<rect x="${x - 13}" y="${y - 5}" width="26" height="10" rx="2" fill="url(#lSteel)" stroke="${C.ink}" stroke-width="1.5"/>${rivet(x - 7, y)}${rivet(x + 7, y)}`
  : `<rect x="${x - 5}" y="${y - 13}" width="10" height="26" rx="2" fill="url(#lSteel)" stroke="${C.ink}" stroke-width="1.5"/>${rivet(x, y - 7)}${rivet(x, y + 7)}`;
// Top pipe: from the sign's right end over to the porthole housing, with a gauge on it.
body.push(pipe('M548 62H732Q748 62 748 78V140'));
// Left pipe: from under the sign down the side into the credits rail.
body.push(pipe('M28 112V486Q28 520 62 520H96', 14));
// Cables slung under the rail.
function cable(d, col, hi) {
  return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${hi}" stroke-width="1.6" stroke-linecap="round" opacity=".7" transform="translate(-1 -1.5)"/>`;
}
body.push(
  cable('M168 536C176 604 300 606 318 536', '#b8352b', '#ff8a70'),
  cable('M268 536C290 596 480 612 512 534', '#2c64c4', '#8fb8ff'),
  cable('M690 536C706 600 852 604 884 536', '#262d35', '#7d8995'),
);
for (const x of [168, 318, 268, 512, 690, 884]) body.push(`<rect x="${x - 7}" y="530" width="14" height="12" rx="2" fill="url(#lSteelD)" stroke="${C.ink}" stroke-width="1.2"/>`);

// ---------------------------------------------------------------------------------------------
// Main slab and arm
// ---------------------------------------------------------------------------------------------
body.push(`<path d="${SLAB}" fill="url(#lSteel)" stroke="${C.ink}" stroke-width="3"/>`);
body.push(`<path d="M46 456V118L66 98H698" fill="none" stroke="${C.steelHi}" stroke-width="2" opacity=".7"/>`);
body.push(`<path d="M714 114V468L694 488H76" fill="none" stroke="${C.steelLo}" stroke-width="2" opacity=".8"/>`);
for (let y = 160; y <= 440; y += 40) body.push(rivet(49, y));
// Arm under the porthole.
body.push(`<path d="${ARM}" fill="url(#lSteel)" stroke="${C.ink}" stroke-width="3"/>`);
body.push(`<path d="M694 490V356H956" fill="none" stroke="${C.steelHi}" stroke-width="2" opacity=".6"/>`);

// ---------------------------------------------------------------------------------------------
// Viewport: blue riveted frame, navy glass, cyan frame lines
// ---------------------------------------------------------------------------------------------
body.push(`<rect x="${VP.x}" y="${VP.y}" width="${VP.w}" height="${VP.h}" rx="12" fill="url(#lBlue)" stroke="#0b1838" stroke-width="2.5"/>`);
body.push(`<rect x="${VP.x + 2.5}" y="${VP.y + 2.5}" width="${VP.w - 5}" height="${VP.h - 5}" rx="10" fill="none" stroke="#8fb6f5" stroke-width="1.2" opacity=".55"/>`);
for (let x = VP.x + 18; x < VP.x + VP.w - 10; x += 39) { body.push(rivet(x, VP.y + 7), rivet(x, VP.y + VP.h - 7)); }
for (let y = VP.y + 40; y < VP.y + VP.h - 20; y += 38) { body.push(rivet(VP.x + 7, y), rivet(VP.x + VP.w - 7, y)); }
body.push(`<rect x="${IN.x}" y="${IN.y}" width="${IN.w}" height="${IN.h}" rx="6" fill="${C.navy}" stroke="#000" stroke-width="1.5"/>`);
// faint floor rings under the dot object
body.push(`<ellipse cx="${DOT.cx}" cy="${DOT.cy + 92}" rx="66" ry="10" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".22"/>`);
body.push(`<ellipse cx="${DOT.cx}" cy="${DOT.cy + 92}" rx="40" ry="6" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".14"/>`);
// cyan frame lines
const fl = { x: IN.x + 6, y: IN.y + 6, w: IN.w - 12, h: IN.h - 12 };
body.push(`<rect x="${fl.x}" y="${fl.y}" width="${fl.w}" height="${fl.h}" rx="3" fill="none" stroke="${C.cyan}" stroke-width="1.2" opacity=".7"/>`);
body.push(`<path d="M${TX - 12} ${fl.y + 6}V${fl.y + fl.h - 6}" stroke="${C.cyan}" stroke-width="1" opacity=".45"/>`);
body.push(`<path d="M${TX - 4} ${IN.y + 34}H${fl.x + fl.w - 6}" stroke="${C.cyan}" stroke-width="1" opacity=".6"/>`);
// corner ticks on the dot area
for (const [x, y, dx, dy] of [[fl.x + 6, fl.y + 6, 1, 1], [TX - 18, fl.y + 6, -1, 1], [fl.x + 6, fl.y + fl.h - 6, 1, -1], [TX - 18, fl.y + fl.h - 6, -1, -1]]) {
  body.push(`<path d="M${x} ${y + dy * 10}V${y}H${x + dx * 10}" fill="none" stroke="${C.cyan}" stroke-width="1.6"/>`);
}

// ---------------------------------------------------------------------------------------------
// The dot object: 72 dots, three turns a loop, morphing between five shapes at page changes.
// Positions are precomputed per beat and played back with SMIL values lists.
// ---------------------------------------------------------------------------------------------
const ND = 56;
function centred(pts) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const m = (y0 + y1) / 2;
  const out = pts.map(([x, y, z]) => [x, y - m, z]);
  if (out.length !== ND) throw new Error(`shape has ${out.length} dots`);
  return out.sort((a, b) => a[1] - b[1] || Math.atan2(a[2], a[0]) - Math.atan2(b[2], b[0]));
}
const SH = {};
{ // palm on an island
  const p = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * 2 * PI; p.push([-6 + 50 * Math.cos(a), 70, 50 * Math.sin(a)]); }
  for (let i = 0; i < 10; i++) { const t = i / 9; p.push([-16 + 16 * t + 7 * Math.sin(PI * t), 66 - 104 * t, 0]); }
  for (let f = 0; f < 6; f++) {
    const a = f / 6 * 2 * PI + 0.3;
    for (let j = 1; j <= 6; j++) { const s = j / 6, d = 11 * j; p.push([d * Math.cos(a), -40 - 18 * s + 34 * s * s, d * Math.sin(a)]); }
  }
  SH.palm = centred(p);
}
{ // a clock face (the schedule): rim, minute hand, hour hand, hub
  const p = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * PI; p.push([62 * Math.cos(a), 62 * Math.sin(a), 0]); }
  for (let i = 1; i <= 9; i++) p.push([0, -i * 5.4, 0]);
  for (let i = 1; i <= 6; i++) p.push([i * 5 * Math.cos(0.5), i * 5 * Math.sin(0.5), 0]);
  p.push([0, 0, 0]);
  SH.clock = centred(p);
}
{ // a sound wave wrapped into a crown
  const p = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * PI; p.push([66 * Math.cos(a), 24 * Math.sin(4 * a), 66 * Math.sin(a)]); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; p.push([32 * Math.cos(a), -16 * Math.sin(2 * a) + 0.01, 32 * Math.sin(a)]); }
  SH.wave = centred(p);
}
{ // a coconut (Fibonacci sphere)
  const p = [];
  for (let i = 0; i < ND; i++) {
    const y = 1 - (i + 0.5) / ND * 2, r = Math.sqrt(1 - y * y), a = i * PI * (3 - Math.sqrt(5));
    p.push([62 * r * Math.cos(a), 62 * y, 62 * r * Math.sin(a)]);
  }
  SH.coconut = centred(p);
}
{ // an iced coffee with a straw
  const p = [];
  for (let k = 0; k < 3; k++) {
    const y = -26 + k * 31, r = 33 - k * 3.5;
    for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * PI + k * 0.26; p.push([r * Math.cos(a), y, r * Math.sin(a)]); }
  }
  for (let i = 0; i < 10; i++) { const a = i / 10 * 2 * PI; p.push([39 * Math.cos(a), -40, 39 * Math.sin(a)]); }
  for (let i = 0; i < 6; i++) { const t = i / 5; p.push([6 + 14 * t, -48 - 44 * t, 0]); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * 2 * PI; p.push([11 * Math.cos(a), 36, 11 * Math.sin(a)]); }
  SH.cup = centred(p);
}
// Page boundaries, in beats: the dots burst between shapes on these beats.
const KB = [11, 23, 35, 47, 59];
const ORDER = ['palm', 'clock', 'wave', 'coconut', 'cup'];
const NK = T / BEAT; // 60
function modelAt(k, i) {
  // which shape, or a burst between two
  for (let b = 0; b < KB.length; b++) {
    if (k === KB[b]) {
      const A = SH[ORDER[b]][i], B = SH[ORDER[(b + 1) % 5]][i];
      return A.map((v, j) => (v + B[j]) / 2 * 1.38);
    }
  }
  const kk = k % NK;
  let idx = 0;
  for (let b = 0; b < KB.length; b++) if (kk > KB[b]) idx = b + 1;
  return SH[ORDER[idx % 5]][i];
}
const TILT = 0.32, THETA0 = 0.5;
function project([x, y, z], th) {
  const c = Math.cos(th), s = Math.sin(th);
  const x1 = x * c + z * s, z1 = -x * s + z * c;
  const y2 = y * Math.cos(TILT) - z1 * Math.sin(TILT), z2 = y * Math.sin(TILT) + z1 * Math.cos(TILT);
  const p = 380 / (380 + z2);
  return [x1 * p, y2 * p, p];
}
{
  let anim = '', still = '';
  for (let i = 0; i < ND; i++) {
    const pos = [], rad = [];
    for (let k = 0; k <= NK; k++) {
      const th = THETA0 + 2 * PI * 3 * k / NK;
      const [X, Y, p] = project(modelAt(k % NK === 0 ? 0 : k, i), th);
      pos.push(`${Math.round(X)},${Math.round(Y)}`);
      rad.push(Math.max(1, Math.min(4, Math.round(2.5 * p * p))));
    }
    anim += `<circle r="${rad[0]}"><animateMotion dur="${T}s" repeatCount="indefinite" calcMode="linear" values="${pos.join(';')}"/>` +
      `<animate attributeName="r" dur="${T}s" repeatCount="indefinite" values="${rad.filter((_, k) => k % 2 === 0).join(';')}"/></circle>`;
    const [x0, y0] = pos[0].split(',');
    still += `<circle cx="${x0}" cy="${y0}" r="${rad[0]}"/>`;
  }
  body.push(`<g transform="translate(${DOT.cx} ${DOT.cy})" fill="#9cf2ff">` +
    `<g class="dotsA">${anim}</g><g class="dotsS">${still}</g></g>`);
  css.push('.dotsS{display:none}');
}

// ---------------------------------------------------------------------------------------------
// Viewport pages: five pages of release info, each 12 beats, swapped under a pixel cloud.
// ---------------------------------------------------------------------------------------------
const PAGES = [
  { head: 'RELEASE.NFO', lines: [
    'CASTAWAY (WORKING TITLE)',
    'A TEN-HOUR LO-FI ISLAND',
    'VIDEO. ONE PALM, ONE',
    'RAFT, ONE YOUNG WOMAN',
    'IN HEADPHONES. SHE',
    'IDLES. EVERY SO OFTEN,',
    'SOMETHING HAPPENS.',
  ] },
  { head: 'SCHEDULE.TOML', lines: [
    'MORE THAN 90 ACTIVITIES',
    'ON FOUR TIMERS:',
    'REGULAR ..... 2-5 MIN',
    'OCCASIONAL .. 12-25 MIN',
    'RARE ........ 30-60 MIN',
    'SUPER RARE .. 3-6 HOURS',
    'GAGS START ON THE BAR.',
  ] },
  { head: 'MUSIC.NFO', lines: [
    'EVERY SOUND IS MADE BY',
    'CODE: NO SAMPLES, STOCK',
    'LOOPS OR RECORDINGS.',
    'THEME: 60 S, 80 BPM,',
    'F MAJOR, KALIMBA LEAD.',
    '-14 LUFS. NOBODY HAS',
    'HEARD IT YET.',
  ] },
  { head: 'COMPONENTS', lines: [
    '[X] ONE TALL PALM',
    '[X] BOTTLE (COMES BACK)',
    '[X] SHARK IN HEADPHONES',
    '[X] CRAB IN A COCONUT',
    '[X] CAT ON A CRATE',
    '[X] DRONE: HEADPHONES',
    '[ ] RESCUE (UNAVAILABLE)',
  ] },
  { head: 'EXIT', lines: [
    'EXIT? SURE. SHE COULD',
    'LEAVE ANY TIME.',
    'SHE WALKS OUT OVER THE',
    'WATER, AND COMES BACK',
    'WITH AN ICED COFFEE.',
    'THEN SETUP STARTS OVER.',
    'ON THE BAR, OBVIOUSLY.',
  ] },
];
const PAGE_START = (p) => (KB[(p + 4) % 5] * BEAT) % T; // page p appears on the burst before it
{
  let s = `<g clip-path="url(#cText)">`;
  PAGES.forEach((pg, p) => {
    for (const l of pg.lines) if ([...l].length > 24) throw new Error(`page line too long: ${l}`);
    const a = PAGE_START(p), b = (a + 12 * BEAT) % T;
    s += `<g class="${windowAnim([[a, b]], p !== 0)}">`;
    s += text(pg.head, TX, IN.y + 14, 2, C.cyan) + textR(`${p + 1}/5`, IN.x + IN.w - 14, IN.y + 14, 2, C.cyan);
    pg.lines.forEach((l, i) => {
      const y = IN.y + 50 + i * 26;
      if (l.startsWith('[X]')) s += text('[X]', TX, y, 2, C.cyan) + text(l.slice(3), TX + 36, y, 2, C.pale);
      else if (l.startsWith('[ ]')) s += text(l, TX, y, 2, C.dim);
      else s += text(l, TX, y, 2, i === 0 && p === 0 ? '#ffd94a' : C.pale);
    });
    s += '</g>';
  });
  // The pixel cloud: 12 px blocks in ten random groups. On each page change the groups land one
  // by one (a noise field of navy, blue and dim cyan), the text underneath is swapped, and the
  // groups lift again in the same random order.
  const COLS = ['#08123a', '#11296e', '#08123a', '#24589e', '#0c1b4e', '#08123a', '#163a8c', '#08123a', '#2d84bd', '#0c1b4e'];
  const groups = Array.from({ length: 10 }, () => []);
  for (let y = IN.y + 12; y < IN.y + IN.h; y += 12) for (let x = TX; x < IN.x + IN.w; x += 12) groups[Math.floor(rnd() * 10)].push([x, y]);
  const P = 12 * BEAT; // 9 s
  groups.forEach((g, k) => {
    const off = 0.07 * (k + 1), on = 8.25 + 0.065 * k;
    const name = `cv${k}`;
    css.push(`.${name}{opacity:0;animation:${name} ${P}s step-end -${BEAT}s infinite}@keyframes ${name}{0%{opacity:1}${n(off / P * 100, 2)}%{opacity:0}${n(on / P * 100, 2)}%,100%{opacity:1}}`);
    // each block is a zero-length square-capped stroke; relative moves keep the path short
    const d = g.map(([x, y], i) => (i ? `m${x - g[i - 1][0]} ${y - g[i - 1][1]}h0` : `M${x} ${y}h0`)).join('');
    s += `<path class="${name}" d="${d}" stroke="${COLS[k]}" stroke-width="12" stroke-linecap="square"/>`;
  });
  s += '</g>';
  body.push(s);
}

// ---------------------------------------------------------------------------------------------
// Button column
// ---------------------------------------------------------------------------------------------
const CLICK_INSTALL = 3.75, CLICK_EXIT = 34.5;
body.push(`<rect x="${BTN.x - 10}" y="${VP.y}" width="${BTN.w + 20}" height="${VP.h}" rx="8" fill="url(#lSteelD)" stroke="${C.ink}" stroke-width="2.5"/>`);
body.push(`<path d="M${BTN.x - 8} ${VP.y + VP.h - 3}H${BTN.x + BTN.w + 8}" stroke="#7d8996" stroke-width="1.5" opacity=".6"/>`);
const LABELS = ['INSTALL', 'NFO', 'MUSIC', 'EXIT'];
function button(i, state) {
  const y = BTN.ys[i], x = BTN.x;
  const face = state === 'p' ? 'url(#lBtnP)' : state === 'h' ? 'url(#lBtnH)' : 'url(#lBtn)';
  const lab = state === 'p' ? '#ffd23a' : state === 'h' ? '#fff3a6' : '#e6efff';
  const dy = state === 'p' ? 1.5 : 0;
  let s = `<rect x="${x}" y="${y}" width="${BTN.w}" height="${BTN.h}" rx="5" fill="${face}" stroke="#0a1530" stroke-width="2"/>`;
  if (state !== 'p') s += `<path d="M${x + 3} ${y + BTN.h - 4}V${y + 3}H${x + BTN.w - 4}" fill="none" stroke="#a9c6f6" stroke-width="1.5" opacity=".8"/><path d="M${x + 4} ${y + BTN.h - 2.5}H${x + BTN.w - 2.5}V${y + 4}" fill="none" stroke="#0d1d44" stroke-width="1.5"/>`;
  else s += `<path d="M${x + 3} ${y + BTN.h - 4}V${y + 3}H${x + BTN.w - 4}" fill="none" stroke="#0d1d44" stroke-width="1.5"/>`;
  s += textC(LABELS[i], x + BTN.w / 2, y + (BTN.h - 14) / 2 + dy, 2, lab);
  if (state === 'h' || state === 'p') s += `<circle cx="${x + 9}" cy="${y + BTN.h / 2 + dy}" r="2.6" fill="url(#rLed)"/>`;
  return s;
}
for (let i = 0; i < 4; i++) body.push(button(i, 'n'));
// INSTALL: hover, press, hover again; EXIT the same.
const hov = (i, ons) => body.push(`<g class="${windowAnim(ons)}" opacity="0">${button(i, 'h')}</g>`);
const prs = (i, ons) => body.push(`<g class="${windowAnim(ons)}" opacity="0">${button(i, 'p')}</g>`);
hov(0, [[3.3, CLICK_INSTALL - 0.1], [CLICK_INSTALL + 0.25, 4.7]]);
prs(0, [[CLICK_INSTALL - 0.1, CLICK_INSTALL + 0.25]]);
hov(3, [[CLICK_EXIT - 0.45, CLICK_EXIT - 0.1], [CLICK_EXIT + 0.25, CLICK_EXIT + 1.4]]);
prs(3, [[CLICK_EXIT - 0.1, CLICK_EXIT + 0.25]]);
// The attribute opacity="0" is the resting state; the class animation overrides it.

// ---------------------------------------------------------------------------------------------
// Progress panel: status line, percent, ETA (never changes) and a 34-segment bar.
// ---------------------------------------------------------------------------------------------
body.push(`<rect x="${PROG.x}" y="${PROG.y}" width="${PROG.w}" height="${PROG.h}" rx="8" fill="url(#lSteelD)" stroke="${C.ink}" stroke-width="2.5"/>`);
body.push(`<path d="M${PROG.x + 3} ${PROG.y + PROG.h - 3}H${PROG.x + PROG.w - 3}" stroke="#7d8996" stroke-width="1.5" opacity=".6"/>`);
const BAR = { x: PROG.x + 12, y: PROG.y + 30, w: PROG.w - 24, h: 18 };
body.push(`<rect x="${BAR.x}" y="${BAR.y}" width="${BAR.w}" height="${BAR.h}" rx="3" fill="#0a111c" stroke="#000" stroke-width="1.5"/>`);
const NSEG = 34;
const START = CLICK_INSTALL, STEPS = 28, DONE = START + STEPS * BEAT; // 24.75 s: 99 %
const RESET = KB[4] * BEAT; // 44.25 s
const pctAt = (i) => Math.round(99 * i / STEPS);
{
  // All segments are drawn lit; a cover (track colour plus unlit segments) slides right one
  // whole segment pitch at a time, so its unlit segments always sit exactly on the real ones.
  const pitch = (BAR.w - 6) / NSEG;
  let segs = '';
  for (let j = 0; j < NSEG; j++) segs += `M${n(BAR.x + 3 + j * pitch)} ${BAR.y + 3}h${n(pitch - 3)}v${BAR.h - 6}h${n(-(pitch - 3))}z`;
  defs.push(`<path id="segs" d="${segs}"/>`);
  body.push(`<use href="#segs" fill="url(#lSeg)"/>`);
  defs.push(`<clipPath id="cBar"><rect x="${BAR.x + 1.5}" y="${BAR.y + 1.5}" width="${BAR.w - 3}" height="${BAR.h - 3}"/></clipPath>`);
  const lit = (i) => Math.floor(pctAt(i) * NSEG / 100);
  const pts = [[0, 'transform:translateX(0)']];
  for (let i = 1; i <= STEPS; i++) pts.push([START + i * BEAT, `transform:translateX(${n(lit(i) * pitch)}px)`]);
  pts.push([RESET, 'transform:translateX(0)']);
  const cov = stepAnim(pts);
  body.push(`<g clip-path="url(#cBar)"><g class="${cov}" transform="translate(${n(lit(STEPS) * pitch)} 0)">` +
    `<rect x="${BAR.x + 1.5}" y="${BAR.y + 1.5}" width="${BAR.w - 3}" height="${BAR.h - 3}" fill="#0a111c"/><use href="#segs" fill="#1b2738"/></g></g>`);
}
const STATUS = [
  [RESET, START, 'READY: 10:00:00 OF ISLAND'],
  [START, 7.5, 'COPYING ACTIVITIES.TOML'],
  [7.5, 11.25, 'TUNING THE NOD TO 80 BPM'],
  [11.25, 15, 'SYNTHESIZING A KALIMBA'],
  [15, 18.75, 'PLANTING ONE KUMARA'],
  [18.75, 22.5, 'LOOPING THE OCEAN (60 S)'],
  [22.5, DONE, 'UNPACKING THE QUIET'],
  [DONE, CLICK_EXIT, 'NOW WE WAIT. ON PURPOSE.'],
  [CLICK_EXIT, RESET, 'PAUSED: SHE WENT FOR COFFEE'],
];
const ST_Y = PROG.y + 10;
for (const [a, b, s] of STATUS) {
  body.push(text(s, PROG.x + 12, ST_Y, 2, '#9fe8ff', windowAnim([[a, b]], s !== 'NOW WE WAIT. ON PURPOSE.')));
}
body.push(textR('ETA 10:00:00', PROG.x + PROG.w - 12, ST_Y, 2, C.amber));
{
  // Percent as an odometer: a tens strip (blank, 1-9) and a units strip (0-9), each stepped
  // to its row on the beat, clipped to one character cell.
  const PX = PROG.x + PROG.w - 12 - textW('ETA 10:00:00', 2) - 16;
  const x0 = PX - textW('99%', 2), ROW = 20;
  const odo = (fn, x, digits) => {
    const pts = [[0, `transform:translateY(${-digits.indexOf(fn(0)) * ROW}px)`]];
    for (let i = 1; i <= STEPS; i++) pts.push([START + i * BEAT, `transform:translateY(${-digits.indexOf(fn(pctAt(i))) * ROW}px)`]);
    pts.push([RESET, `transform:translateY(${-digits.indexOf(fn(0)) * ROW}px)`]);
    let strip = '';
    digits.forEach((dg, r) => { if (dg !== ' ') strip += text(dg, x, ST_Y + r * ROW, 2, '#ffffff'); });
    return `<g class="${stepAnim(pts)}" transform="translate(0 ${-digits.indexOf(fn(99)) * ROW})">${strip}</g>`;
  };
  const TENS = [...' 123456789'], UNITS = [...'0123456789'];
  defs.push(`<clipPath id="cPct"><rect x="${x0 - 2}" y="${ST_Y - 2}" width="26" height="18"/></clipPath>`);
  body.push(`<g clip-path="url(#cPct)">${odo((v) => (v < 10 ? ' ' : String(Math.floor(v / 10))), x0, TENS)}${odo((v) => String(v % 10), x0 + 12, UNITS)}</g>`);
  body.push(text('%', x0 + 24, ST_Y, 2, '#ffffff'));
}

// ---------------------------------------------------------------------------------------------
// The sign: CASTAWAY in lit orange-to-yellow capitals in a red bevelled frame, bolted on.
// ---------------------------------------------------------------------------------------------
const SG = {
  C: [6, 'M1 0H6V2H2V7H6V9H1L0 8V1Z'],
  A: [6, 'M1 0H5L6 1V9H4V5.5H2V9H0V1ZM2 2V3.5H4V2Z'],
  S: [6, 'M1 0H6V2H2V3.5H5L6 4.5V8L5 9H0V7H4V5.5H1L0 4.5V1Z'],
  T: [6, 'M0 0H6V2H4V9H2V2H0Z'],
  W: [8, 'M0 0H2V7H3V3H5V7H6V0H8V8L7 9H1L0 8Z'],
  Y: [6, 'M0 0H2V3H4V0H6V4L5 5H4V9H2V5H1L0 4Z'],
};
{
  const { x, y, w, h } = SIGN;
  body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#lRed)" stroke="#2a0503" stroke-width="3"/>`);
  body.push(`<path d="M${x + 4} ${y + h - 8}V${y + 8}Q${x + 4} ${y + 4} ${x + 8} ${y + 4}H${x + w - 8}" fill="none" stroke="#ff9a7c" stroke-width="2" opacity=".85"/>`);
  body.push(`<path d="M${x + 8} ${y + h - 4}H${x + w - 8}Q${x + w - 4} ${y + h - 4} ${x + w - 4} ${y + h - 8}V${y + 8}" fill="none" stroke="#4a0804" stroke-width="2"/>`);
  const g = { x: x + 16, y: y + 14, w: w - 32, h: h - 28 };
  body.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="5" fill="url(#lSignGlass)" stroke="#3d0603" stroke-width="2"/>`);
  body.push(`<path d="M${g.x + 2} ${g.y + g.h - 2}H${g.x + g.w - 2}V${g.y + 2}" fill="none" stroke="#ff7a5a" stroke-width="1.2" opacity=".5"/>`);
  for (const [bx, by] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9], [x + w / 2, y + 7], [x + w / 2, y + h - 7]]) body.push(bolt(bx, by, 5, 30 + bx % 50));
  // letters
  const word = 'CASTAWAY', U = 7.3, GAP = 1.25;
  const total = [...word].reduce((s, ch) => s + SG[ch][0], 0) + GAP * (word.length - 1);
  const lx = g.x + (g.w - total * U) / 2 + 6, ly = g.y + (g.h - 9 * U) / 2;
  let d = '', cx = 0;
  for (const ch of word) {
    const [cw, p] = SG[ch];
    d += p.replace(/([MLHVZ])([^MLHVZ]*)/g, (m, cmd, args) => {
      if (cmd === 'Z') return 'Z';
      const v = args.trim().split(/[ ,]+/).map(Number);
      if (cmd === 'H') return `H${n(v[0] + cx)}`;
      if (cmd === 'V') return `V${n(v[0])}`;
      return `${cmd}${n(v[0] + cx)} ${n(v[1])}`;
    });
    cx += cw + GAP;
  }
  const place = (dx, dy) => `translate(${n(lx + dx)} ${n(ly + dy)}) scale(${U}) skewX(-7)`;
  defs.push(`<path id="sign" d="${d}" fill-rule="evenodd"/>`, `<clipPath id="cSign"><use href="#sign" transform="${place(0, 0)}"/></clipPath>`);
  const glow = windowAnim([[0, 13.0], [13.12, 13.24], [13.36, T]]);
  body.push(`<g opacity=".85"><g class="${glow}" filter="url(#fGlow)"><use href="#sign" transform="${place(0, 0)}" fill="#ff7a1a" stroke="#ff9a2a" stroke-width=".9"/></g></g>`);
  body.push(`<use href="#sign" transform="${place(1.8, 2.6)}" fill="#5a1205"/>`);
  body.push(`<use href="#sign" transform="${place(0, 0)}" fill="url(#lLetter)" stroke="#6b1a04" stroke-width=".18"/>`);
  body.push(`<use href="#sign" transform="${place(-0.3, -0.4)}" fill="none" stroke="#fffbe0" stroke-width=".07" opacity=".7"/>`);
  // a gleam sweeps across the letters every 9 s
  const gleam = stepAnim([[0, 'transform:translateX(-60px)'], [1.2, 'transform:translateX(-60px);animation-timing-function:linear'], [2.4, 'transform:translateX(560px)']], 9);
  css.push(`.${gleam}{transform:translateX(-60px)}`);
  body.push(`<g clip-path="url(#cSign)"><path class="${gleam}" d="M${g.x} ${g.y + g.h}l26 -${g.h}h18l-26 ${g.h}z" fill="#fffde8" opacity=".55"/></g>`);
  // the tag hanging under the sign
  const tg = { x: x + w - 178, y: y + h - 4, w: 164, h: 24 };
  body.push(`<rect x="${tg.x}" y="${tg.y}" width="${tg.w}" height="${tg.h}" rx="4" fill="#260904" stroke="#8c1a10" stroke-width="2"/>`);
  body.push(rivet(tg.x + 8, tg.y + 12, 2.2), rivet(tg.x + tg.w - 8, tg.y + 12, 2.2));
  body.push(textC('WORKING TITLE', tg.x + tg.w / 2, tg.y + 6, 1.75, '#ffcf5a'));
}

// ---------------------------------------------------------------------------------------------
// Gauge on the top pipe, and the antenna with its one bar of signal.
// ---------------------------------------------------------------------------------------------
{
  const gx = 642, gy = 62, r = 25;
  body.push(`<circle cx="${gx}" cy="${gy}" r="${r + 5}" fill="url(#rHousing)" stroke="${C.ink}" stroke-width="2.5"/>`);
  body.push(`<circle cx="${gx}" cy="${gy}" r="${r}" fill="#f3f0e4" stroke="#3a434e" stroke-width="1.5"/>`);
  const arc = (a0, a1, col) => {
    const p = (a) => [gx + (r - 5) * Math.cos(a), gy + (r - 5) * Math.sin(a)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `<path d="M${n(x0)} ${n(y0)}A${r - 5} ${r - 5} 0 0 1 ${n(x1)} ${n(y1)}" fill="none" stroke="${col}" stroke-width="4"/>`;
  };
  body.push(arc(PI * 0.8, PI * 1.35, '#3cbf5a'), arc(PI * 1.35, PI * 1.9, '#e9b23a'), arc(PI * 1.9, PI * 2.2, '#d9402e'));
  for (let i = 0; i <= 8; i++) { const a = PI * 0.8 + i / 8 * PI * 1.4; body.push(`<path d="M${n(gx + (r - 2) * Math.cos(a))} ${n(gy + (r - 2) * Math.sin(a))}L${n(gx + (r - 8) * Math.cos(a))} ${n(gy + (r - 8) * Math.sin(a))}" stroke="#2a323c" stroke-width="1"/>`); }
  body.push(textC('CALM', gx, gy + 8, 1.2, '#2a323c'));
  const nd = stepAnim([[0, 'transform:rotate(-8deg)'], [0.25, 'transform:rotate(-3deg)']], BEAT);
  css.push(`.${nd}{transform-origin:${gx}px ${gy}px}`);
  body.push(`<g class="${nd}"><path d="M${gx} ${gy}L${n(gx + (r - 6) * Math.cos(PI * 1.06))} ${n(gy + (r - 6) * Math.sin(PI * 1.06))}" stroke="#c22416" stroke-width="2" stroke-linecap="round"/></g>`);
  body.push(`<circle cx="${gx}" cy="${gy}" r="3" fill="url(#rBolt)" stroke="${C.ink}" stroke-width=".8"/>`);
  body.push(collar(568, 62, false), collar(716, 62, false), collar(748, 118, true));
}
{
  const a = -40 * PI / 180, bx = PORT.cx + PORT.R * Math.cos(a), by = PORT.cy + PORT.R * Math.sin(a);
  body.push(`<path d="M${n(bx)} ${n(by)}L962 44" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/><path d="M${n(bx)} ${n(by)}L962 44" stroke="#b9c3cd" stroke-width="2.4" stroke-linecap="round"/>`);
  body.push(`<circle cx="962" cy="40" r="6" fill="#d9402e" stroke="${C.ink}" stroke-width="1.5"/><circle cx="960" cy="38" r="1.8" fill="#ffb3a0"/>`);
  // signal meter: one bar out of four, on a strut from the housing
  body.push(`<path d="M906 60L906 114" stroke="${C.ink}" stroke-width="7"/><path d="M906 60L906 114" stroke="#8d99a6" stroke-width="3.5"/>`);
  body.push(`<rect x="886" y="22" width="52" height="40" rx="5" fill="url(#lSteelD)" stroke="${C.ink}" stroke-width="2"/>`);
  for (let i = 0; i < 4; i++) {
    const hh = 6 + i * 7;
    body.push(`<rect x="${894 + i * 10}" y="${54 - hh}" width="7" height="${hh}" rx="1" fill="${i === 0 ? '#5df07a' : '#1b2430'}" stroke="#05080c" stroke-width=".8"/>`);
  }
}

// ---------------------------------------------------------------------------------------------
// The porthole housing
// ---------------------------------------------------------------------------------------------
body.push(`<circle cx="${PORT.cx}" cy="${PORT.cy}" r="${PORT.R}" fill="url(#rHousing)" stroke="${C.ink}" stroke-width="3"/>`);
body.push(`<circle cx="${PORT.cx}" cy="${PORT.cy}" r="${PORT.R - 4}" fill="none" stroke="${C.steelHi}" stroke-width="1.5" opacity=".5"/>`);
body.push(`<circle cx="${PORT.cx}" cy="${PORT.cy}" r="${PORT.ring}" fill="url(#rBlue)" stroke="#0b1838" stroke-width="2.5"/>`);
for (let i = 0; i < 16; i++) {
  const a = i / 16 * 2 * PI + 0.1;
  body.push(rivet(PORT.cx + 124 * Math.cos(a), PORT.cy + 124 * Math.sin(a), 3.4));
}
for (let i = 0; i < 6; i++) {
  const a = i / 6 * 2 * PI + PI / 6;
  body.push(bolt(PORT.cx + 140 * Math.cos(a), PORT.cy + 140 * Math.sin(a), 4.5, i * 40));
}

// ---------------------------------------------------------------------------------------------
// The island, seen through the porthole. Always daytime.
// ---------------------------------------------------------------------------------------------
const scene = [];
const GX = PORT.cx, GY = PORT.cy, GR = PORT.glass;
const HORIZON = 236;
scene.push(`<rect x="${GX - GR}" y="${GY - GR}" width="${GR * 2}" height="${HORIZON - (GY - GR)}" fill="url(#lSky)"/>`);
scene.push(`<circle cx="772" cy="166" r="22" fill="#fff6c8" opacity=".35"/><circle cx="772" cy="166" r="11" fill="#fffbe6"/>`);
function cloud(x, y, s) {
  // puffs on a flat, rounded base, over a soft blue underside
  const c = [[-14, -2, 6], [-4, -6, 9], [8, -4, 8], [17, -1, 5]];
  const k = (v) => n(v * s, 1);
  const blob = (oy) => {
    let d = '';
    for (const [dx, dy, r] of c) d += `M${n(x + (dx - r) * s, 1)} ${n(y + (dy + oy) * s, 1)}a${k(r)} ${k(r)} 0 1 0 ${k(2 * r)} 0a${k(r)} ${k(r)} 0 1 0 ${k(-2 * r)} 0z`;
    return d + `M${n(x - 20 * s, 1)} ${n(y + (oy - 3) * s, 1)}h${k(42)}a${k(3.5)} ${k(3.5)} 0 0 1 0 ${k(7)}h${k(-42)}a${k(3.5)} ${k(3.5)} 0 0 1 0 ${k(-7)}z`;
  };
  return `<path d="${blob(1.8)}" fill="#cfe3f6"/><path d="${blob(0)}" fill="#fff"/>`;
}
{
  let cl = '';
  for (const off of [0, 240]) cl += cloud(760 + off, 196, 1) + cloud(842 + off, 150, 1.25) + cloud(918 + off, 186, 0.8);
  css.push(`.cld{animation:cld ${T}s linear infinite}@keyframes cld{from{transform:translateX(0)}to{transform:translateX(-240px)}}`);
  scene.push(`<g class="cld">${cl}</g>`);
}
scene.push(`<rect x="${GX - GR}" y="${HORIZON}" width="${GR * 2}" height="${GY + GR - HORIZON}" fill="url(#lSea)"/>`);
scene.push(`<rect x="${GX - GR}" y="${HORIZON - 1.5}" width="${GR * 2}" height="3" fill="#d4f0ff" opacity=".7"/>`);
// wave dashes, two sets that swap every beat
{
  const sets = [[], []];
  for (const set of sets) {
    let tries = 0;
    while (set.length < 22 && tries++ < 500) {
      const x = GX - GR + rnd() * GR * 2, y = HORIZON + 8 + rnd() * (GR + GY - HORIZON - 10);
      const len = 4 + rnd() * (6 + (y - HORIZON) * 0.08);
      if (((x - 826) / 108) ** 2 + ((y - 305) / 30) ** 2 < 1) continue;
      set.push(`M${n(x, 1)} ${n(y, 1)}h${n(len, 1)}`);
    }
  }
  const a = stepAnim([[0, 'opacity:1'], [BEAT, 'opacity:0']], 2 * BEAT);
  const b = stepAnim([[0, 'opacity:0'], [BEAT, 'opacity:1']], 2 * BEAT);
  scene.push(`<path class="${a}" d="${sets[0].join('')}" stroke="#e8f8ff" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`);
  scene.push(`<path class="${b}" d="${sets[1].join('')}" stroke="#e8f8ff" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`);
  css.push(`.${b}{opacity:0}`);
}
// The shark in headphones crosses behind the island, nodding on every beat.
{
  const SY = 262, X0 = 962, X1 = 690, t0 = 9, t1 = 33, steps = Math.round((t1 - t0) / BEAT);
  const mv = stepAnim([
    [0, `transform:translate(${X0}px,${SY}px)`],
    [t0, `transform:translate(${X0}px,${SY}px);animation-timing-function:steps(${steps},end)`],
    [t1, `transform:translate(${X1}px,${SY}px)`],
  ]);
  const bob = stepAnim([[0, 'transform:translateY(1.5px)'], [BEAT * 0.3, 'transform:translateY(0)']], BEAT);
  scene.push(`<g class="${mv}" transform="translate(742 ${SY})"><g class="${bob}">` +
    `<ellipse cx="9" cy="0.5" rx="15" ry="2.4" fill="#d9f2ff" opacity=".7"/>` +
    `<path d="M24 -1l7 -2M25 1.5l7 1" stroke="#e8f8ff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>` +
    `<path d="M0 0C2 -6 6 -13 12 -17C11 -10 13 -4 18 0Z" fill="#687b8e" stroke="#2c3a48" stroke-width="1"/>` +
    `<path d="M2.5 -2C4 -7 7 -12 11.5 -15.5" fill="none" stroke="#a9bccc" stroke-width="1.2"/>` +
    `<path d="M4 -7C4 -24 19 -24 16 -7" fill="none" stroke="${C.cream}" stroke-width="1.8"/>` +
    `<ellipse cx="4" cy="-6.5" rx="2.3" ry="3" fill="${C.cream}" stroke="#9b8c6c" stroke-width=".7"/>` +
    `<ellipse cx="16" cy="-6.5" rx="2.3" ry="3" fill="${C.cream}" stroke="#9b8c6c" stroke-width=".7"/>` +
    `</g></g>`);
}
// island: shallows, foam (the shore waves step on the beat), sand, greenery
scene.push(`<ellipse cx="826" cy="305" rx="94" ry="23" fill="#52cbd6" opacity=".85"/>`);
{
  const fo = stepAnim([[0, 'stroke-dashoffset:0'], [BEAT, 'stroke-dashoffset:6']], 2 * BEAT);
  scene.push(`<ellipse class="${fo}" cx="826" cy="304" rx="81" ry="17.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="8 4" opacity=".9"/>`);
}
scene.push(`<ellipse cx="826" cy="303" rx="68" ry="13.5" fill="#d6b670"/><ellipse cx="823" cy="300" rx="64" ry="11" fill="#f3dea4"/>`);
scene.push(`<ellipse cx="760" cy="306" rx="6" ry="3.5" fill="#8b949c"/><ellipse cx="759" cy="305" rx="3" ry="1.4" fill="#c2c9cf"/><ellipse cx="878" cy="309" rx="4" ry="2.4" fill="#8b949c"/>`);
function bush(x, y, s, cols = ['#3e8f34', '#6dbb46']) {
  let d0 = '', d1 = '';
  for (let i = 0; i < 6; i++) {
    const a = PI + (i + 0.5) / 6 * PI, L = (7 + (i % 2) * 3) * s;
    const tx = x + L * Math.cos(a), ty = y + L * Math.sin(a) * 0.9;
    const seg = `M${n(x - 2 * s)} ${n(y)}Q${n((x + tx) / 2 - 2 * s)} ${n((y + ty) / 2 - 2 * s)} ${n(tx)} ${n(ty)}Q${n((x + tx) / 2 + 2 * s)} ${n((y + ty) / 2 + 1 * s)} ${n(x + 2 * s)} ${n(y)}Z`;
    if (i % 2) d1 += seg; else d0 += seg;
  }
  return `<path d="${d0}" fill="${cols[0]}"/><path d="${d1}" fill="${cols[1]}"/>`;
}
scene.push(bush(778, 298, 1), bush(870, 301, 0.9), bush(858, 296, 0.7));
// raft at the shore
{
  let r = '';
  r += `<path d="M882 309q22 4 48 0" fill="none" stroke="#2c6f9a" stroke-width="3" opacity=".35"/>`;
  for (let i = 0; i < 5; i++) {
    const y = 296 + i * 3.1, x = 885 - i * 1.2;
    r += `<rect x="${n(x)}" y="${n(y)}" width="44" height="3.6" rx="1.8" fill="${i % 2 ? '#94553a' : '#ad6a47'}" stroke="#5a2f1e" stroke-width=".7"/>`;
    r += `<path d="M${n(x + 3)} ${n(y + 1)}h36" stroke="#d69a70" stroke-width=".7" opacity=".7"/>`;
  }
  r += `<path d="M893 295.5l-1.6 15.5M918 295.5l-1.6 15.5" stroke="#eadbb2" stroke-width="1.6"/>`;
  r += `<path d="M876 312q14 3 28 0t28 0" fill="none" stroke="#e8f8ff" stroke-width="1.4" opacity=".85"/>`;
  scene.push(r);
}
// the palm: a slender curved trunk and a crown of jagged fronds
{
  const B = [848, 302], Cc = [834, 238], Tp = [866, 180];
  const q = (t) => [0, 1].map((j) => (1 - t) ** 2 * B[j] + 2 * (1 - t) * t * Cc[j] + t * t * Tp[j]);
  const dq = (t) => [0, 1].map((j) => 2 * (1 - t) * (Cc[j] - B[j]) + 2 * t * (Tp[j] - Cc[j]));
  const L = [], R = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, [x, y] = q(t), [dx, dy] = dq(t), m = Math.hypot(dx, dy), w = 4.2 - 2 * t;
    L.push(`${n(x + dy / m * w, 1)} ${n(y - dx / m * w, 1)}`); R.push(`${n(x - dy / m * w, 1)} ${n(y + dx / m * w, 1)}`);
  }
  scene.push(`<path d="M${L.join('L')}L${R.reverse().join('L')}Z" fill="url(#lTrunk)" stroke="#5e3220" stroke-width=".8"/>`);
  let rings = '';
  for (let t = 0.07; t < 0.97; t += 0.075) {
    const [x, y] = q(t), [dx, dy] = dq(t), m = Math.hypot(dx, dy), w = 4.2 - 2 * t;
    rings += `M${n(x + dy / m * w, 1)} ${n(y - dx / m * w, 1)}Q${n(x, 1)} ${n(y + 1.6, 1)} ${n(x - dy / m * w, 1)} ${n(y + dx / m * w, 1)}`;
  }
  scene.push(`<path d="${rings}" fill="none" stroke="#6a3826" stroke-width=".9" opacity=".7"/>`);
  const [cxp, cyp] = Tp;
  const frond = (ang, len, droop, col, rib) => {
    const a = ang * PI / 180, tip = [cxp + len * Math.cos(a), cyp + len * Math.sin(a) + droop];
    const ctl = [cxp + len * 0.5 * Math.cos(a), cyp + len * 0.5 * Math.sin(a) - 9];
    const f = (t) => [0, 1].map((j) => (1 - t) ** 2 * [cxp, cyp][j] + 2 * (1 - t) * t * ctl[j] + t * t * tip[j]);
    const fd = (t) => [0, 1].map((j) => 2 * (1 - t) * (ctl[j] - [cxp, cyp][j]) + 2 * t * (tip[j] - ctl[j]));
    const up = [], dn = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, [x, y] = f(t), [dx, dy] = fd(t), m = Math.hypot(dx, dy);
      const w = 6.5 * Math.sin(PI * Math.min(1, t * 1.08)) * (i % 2 ? 1.25 : 0.7);
      up.push(`${n(x + dy / m * w, 1)} ${n(y - dx / m * w, 1)}`); dn.push(`${n(x - dy / m * w * 0.8, 1)} ${n(y + dx / m * w * 0.8, 1)}`);
    }
    const ribd = Array.from({ length: 9 }, (_, i) => f(i / 8).map((v) => n(v, 1)).join(' ')).join('L');
    return `<path d="M${up.join('L')}L${dn.reverse().join('L')}Z" fill="${col}"/><path d="M${ribd}" fill="none" stroke="${rib}" stroke-width=".9"/>`;
  };
  for (const [a, l, dr] of [[-150, 40, 16], [-30, 42, 18], [-110, 30, 4], [-70, 30, 4]]) scene.push(frond(a, l, dr, '#2f7c34', '#5ea84a'));
  for (const [a, l, dr] of [[180, 46, 26], [0, 50, 28], [-165, 42, 8], [-12, 44, 10], [150, 34, 22], [30, 36, 22], [-90, 26, 2]]) scene.push(frond(a, l, dr, '#3f9c3a', '#8fd062'));
  scene.push(`<circle cx="${cxp - 3}" cy="${cyp + 4}" r="3.6" fill="#6b4226"/><circle cx="${cxp + 3}" cy="${cyp + 5}" r="3.6" fill="#5b371f"/><circle cx="${cxp}" cy="${cyp + 8}" r="3.3" fill="#6b4226"/>`);
}
// her iced coffee, planted in the sand (except while she takes it back for a refill)
function cup(x, y, s = 1) {
  return `<path d="M${n(x - 2.6 * s)} ${n(y - 7 * s)}L${n(x + 2.6 * s)} ${n(y - 7 * s)}L${n(x + 2 * s)} ${n(y)}L${n(x - 2 * s)} ${n(y)}Z" fill="#a8704a" stroke="#6b4a33" stroke-width=".6"/>` +
    `<path d="M${n(x - 2.4 * s)} ${n(y - 5.6 * s)}h${n(4.8 * s)}" stroke="#f3e6cf" stroke-width="${n(1.1 * s)}"/>` +
    `<path d="M${n(x - 3 * s)} ${n(y - 7.4 * s)}h${n(6 * s)}" stroke="#ffffff" stroke-width="${n(1.4 * s)}" stroke-linecap="round"/>` +
    `<path d="M${n(x + 0.6 * s)} ${n(y - 7.4 * s)}l${n(1.4 * s)} ${n(-4 * s)}" stroke="#58c46a" stroke-width="${n(0.9 * s)}" stroke-linecap="round"/>`;
}
const LEAVE = KB[3] * BEAT; // 35.25 s: the EXIT page appears
const GONE = LEAVE + 12 * BEAT / 2; // 39.75
const BACK = GONE + 2 * BEAT; // 41.25
{
  const cls = windowAnim([[RESET, LEAVE]]);
  scene.push(`<g class="${cls}">${cup(786, 307, 1)}</g>`);
}
// Her: small and simple. Coral tank top, cream shorts, cream headphones, a low bun, bare feet.
function girl({ step = false, holding = false, nod = '' } = {}) {
  let s = '';
  const leg = (x0, x1) => `<path d="M${x0} -16L${x1} -2" stroke="${C.skin}" stroke-width="2.7" stroke-linecap="round"/>`;
  const foot = (x) => `<ellipse cx="${n(x + 1)}" cy="-1.2" rx="2.4" ry="1.2" fill="${C.skinD}"/>`;
  if (step) s += leg(-1.4, -5) + leg(1.4, 4.6) + foot(-5.6) + foot(4.4);
  else s += leg(-1.6, -1.8) + leg(1.6, 2) + foot(-2.4) + foot(1.8);
  s += `<path d="M-5.2 -24H5.2L5.7 -15H0.7L0 -18L-0.7 -15H-5.7Z" fill="${C.cream}" stroke="${C.creamD}" stroke-width=".6"/>`;
  // back arm
  s += `<path d="M-4.4 -34.5L-6 -27.5L-5.6 -21.5" fill="none" stroke="${C.skinD}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M-4.8 -35.6Q0 -38.4 4.8 -35.6L5.2 -23.4H-5.2Z" fill="${C.coral}"/><path d="M1.8 -36.8Q4.2 -36.4 4.8 -35.6L5.2 -23.4H2.4Z" fill="${C.coralD}" opacity=".6"/>`;
  s += `<path d="M-3.6 -36.2L-3.2 -38.4M3.2 -36.2L2.8 -38.4" stroke="${C.coral}" stroke-width="1.2"/>`;
  s += `<rect x="-1.2" y="-40.2" width="2.6" height="4" fill="${C.skin}"/>`;
  // front arm: hanging, or holding the iced coffee
  if (holding) s += `<path d="M4.6 -34.5L6.4 -28.6L10.2 -29.6" fill="none" stroke="${C.skin}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>` + cup(11.2, -27.6, 0.95);
  else s += `<path d="M4.6 -34.5L6.2 -28L5.8 -21.8" fill="none" stroke="${C.skin}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`;
  // head (nods on the beat)
  s += `<g${nod ? ` class="${nod}"` : ''}>` +
    `<circle cx="0.8" cy="-44" r="5.4" fill="${C.skin}"/>` +
    `<path d="M-4.8 -43.2Q-5.2 -50 0.8 -50.2Q6 -50 6.4 -45.6Q3.6 -47.4 -0.6 -46.2Q-2.2 -42.6 -4.4 -40.4Z" fill="${C.hair}"/>` +
    `<circle cx="-5.4" cy="-40.8" r="2.7" fill="${C.hairD}"/>` +
    `<path d="M-3.4 -44.4C-3.8 -53 4.8 -53.2 4.6 -46" fill="none" stroke="${C.cream}" stroke-width="1.7"/>` +
    `<ellipse cx="-1.4" cy="-43.4" rx="2.3" ry="2.9" fill="${C.cream}" stroke="#a8977a" stroke-width=".6"/>` +
    `<circle cx="4" cy="-44.2" r=".65" fill="#3b2318"/>` +
    `</g>`;
  return s;
}
{
  const HX = 800, HY = 304;
  const nod = stepAnim([[0, 'transform:translateY(1px) rotate(6deg)'], [BEAT * 0.32, 'transform:none']], BEAT);
  css.push(`.${nod}{transform-origin:0.8px -39px;transform-box:view-box}`);
  // position: idle, then out over the water to the right (15 px a half-beat), away, then back
  const pts = [[0, 'transform:translateX(0)']];
  const H2 = BEAT / 2;
  for (let i = 1; i <= 12; i++) pts.push([LEAVE + i * H2, `transform:translateX(${i * 15}px)`]);
  for (let i = 0; i <= 8; i++) pts.push([BACK + i * H2, `transform:translateX(${n(180 - i * 22.5)}px)`]);
  const mv = stepAnim(pts);
  const legA = stepAnim([[0, 'opacity:1'], [H2, 'opacity:0']], BEAT);
  const legB = stepAnim([[0, 'opacity:0'], [H2, 'opacity:1']], BEAT);
  const ripple = `<ellipse cx="0" cy="-0.5" rx="9" ry="2.2" fill="none" stroke="#fff" stroke-width="1.1" opacity=".8"/>`;
  const idle = windowAnim([[RESET, LEAVE]]);
  const outR = windowAnim([[LEAVE, GONE]], true);
  const inL = windowAnim([[BACK, RESET]], true);
  scene.push(`<g transform="translate(${HX} ${HY})"><g class="${mv}">` +
    `<g class="${idle}">${girl({ nod })}</g>` +
    `<g class="${outR}">${ripple}<g class="${legA}">${girl({ holding: true, nod })}</g><g class="${legB}">${girl({ step: true, holding: true, nod })}</g></g>` +
    `<g class="${inL}">${ripple}<g transform="scale(-1 1)"><g class="${legA}">${girl({ holding: true, nod })}</g><g class="${legB}">${girl({ step: true, holding: true, nod })}</g></g></g>` +
    `</g></g>`);
}
// glass: vignette, reflections
scene.push(`<circle cx="${GX}" cy="${GY}" r="${GR}" fill="url(#rVig)"/>`);
body.push(`<g clip-path="url(#cGlass)">${scene.join('')}</g>`);
{
  const arcP = (r, a0, a1) => {
    const p = (a) => `${n(GX + r * Math.cos(a))} ${n(GY + r * Math.sin(a))}`;
    return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
  };
  body.push(`<path d="${arcP(102, PI * 1.08, PI * 1.42)}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".2"/>`);
  body.push(`<path d="${arcP(90, PI * 1.16, PI * 1.3)}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".22"/>`);
  body.push(`<circle cx="${GX}" cy="${GY}" r="${GR}" fill="none" stroke="#06102a" stroke-width="3.5"/>`);
  body.push(`<circle cx="${GX}" cy="${GY}" r="${GR + 3}" fill="none" stroke="#9cc0f5" stroke-width="1" opacity=".6"/>`);
}
// plate under the porthole
{
  const s = 'LIVE PREVIEW', w = textW(s, 1.5) + 18, x = PORT.cx - w / 2, y = PORT.cy + PORT.R - 22;
  body.push(`<rect x="${n(x)}" y="${y}" width="${n(w)}" height="17" rx="3" fill="#1c232b" stroke="#000" stroke-width="1.2"/>`);
  body.push(textC(s, PORT.cx, y + 3.5, 1.5, '#c9d4de'));
}

// ---------------------------------------------------------------------------------------------
// Arm: music toggle, beat lights, maker's plate
// ---------------------------------------------------------------------------------------------
{
  const y0 = 404;
  body.push(text('MUSIC', 708, y0 - 2, 1.75, '#1f2730'));
  body.push(`<rect x="708" y="${y0 + 14}" width="54" height="22" rx="11" fill="#1a2129" stroke="${C.ink}" stroke-width="2"/>`);
  body.push(`<rect x="710" y="${y0 + 16}" width="50" height="18" rx="9" fill="#2a6b3a"/>`);
  body.push(`<circle cx="750" cy="${y0 + 25}" r="10" fill="url(#rBolt)" stroke="${C.ink}" stroke-width="1.5"/>`);
  body.push(text('ON', 716, y0 + 21, 1.4, '#c8ffd2'));
  body.push(`<circle cx="776" cy="${y0 + 25}" r="5" fill="url(#rLedG)" stroke="${C.ink}" stroke-width="1"/>`);
  body.push(text('BEAT', 800, y0 - 2, 1.75, '#1f2730'));
  for (let i = 0; i < 4; i++) {
    const x = 806 + i * 20, y = y0 + 25;
    body.push(`<circle cx="${x}" cy="${y}" r="6.5" fill="#3a2a10" stroke="${C.ink}" stroke-width="1.2"/>`);
    const cls = stepAnim([[0, 'opacity:0'], [i * BEAT, 'opacity:1'], [i * BEAT + 0.38, 'opacity:0']], 4 * BEAT);
    if (i) css.push(`.${cls}{opacity:0}`);
    body.push(`<circle class="${cls}" cx="${x}" cy="${y}" r="5.5" fill="url(#rLed)"/>`);
  }
  body.push(text('80 BPM', 888, y0 - 2, 1.75, '#1f2730'));
  body.push(text('F MAJOR', 888, y0 + 18, 1.75, '#1f2730'));
  body.push(text('SYNTH', 888, y0 + 38, 1.75, '#1f2730'));
  // maker's plate
  const s = 'SKIN BY SETUP-ON-SEA', w = textW(s, 1.5) + 22;
  body.push(`<rect x="706" y="${y0 + 52}" width="${n(w)}" height="20" rx="3" fill="#cfd6dc" stroke="#3a434e" stroke-width="1.4"/>`);
  body.push(rivet(713, y0 + 62, 2), rivet(706 + w - 7, y0 + 62, 2));
  body.push(text(s, 717, y0 + 57, 1.5, '#2a323c'));
}

// ---------------------------------------------------------------------------------------------
// Credits rail along the bottom edge: a scrolling strip naming code, graphics and music.
// ---------------------------------------------------------------------------------------------
{
  const { x, y, w, h } = RAIL;
  body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#lSteelD)" stroke="${C.ink}" stroke-width="2.5"/>`);
  body.push(`<rect x="${x + 12}" y="${y + 6}" width="${w - 24}" height="${h - 12}" rx="3" fill="#06090d" stroke="#000" stroke-width="1"/>`);
  body.push(bolt(x + 6.5, y + h / 2, 4), bolt(x + w - 6.5, y + h / 2, 4));
  const msg = 'CASTAWAY (WORKING TITLE) ♦ A TEN-HOUR LO-FI ISLAND VIDEO ♦ CODE: PLAIN ES MODULES, NO BUILD STEP ♦ ' +
    'GRAPHICS: HAND-PAINTED, ALWAYS DAYTIME ♦ MUSIC: SYNTHESIZED FROM CODE, NO SAMPLES ♦ WAITING: HER ♦ ' +
    'SKIN: SETUP-ON-SEA ♦ UNOFFICIAL, INSPIRED BY A 1992 DESERT-ISLAND SCREENSAVER ♦ ';
  const L = [...msg].length * 12;
  const speed = 64;
  css.push(`.mq{animation:mq ${n(L / speed, 3)}s linear infinite}@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-${L}px)}}`);
  defs.push(`<g id="mqText">${text(msg, 0, 0, 2, C.amber)}</g>`);
  body.push(`<g clip-path="url(#cStrip)"><g class="mq"><use href="#mqText" x="${x + 22}" y="${y + 11}"/><use href="#mqText" x="${x + 22 + L}" y="${y + 11}"/></g></g>`);
}

// ---------------------------------------------------------------------------------------------
// The cursor: presses INSTALL, rests on the porthole rim, presses EXIT.
// ---------------------------------------------------------------------------------------------
{
  const REST = [714, 330], INS = [630, 190], EXI = [632, 376];
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
  const kf = [];
  const hold = (t, p) => kf.push([t, p]);
  const move = (t0, t1, a, b) => { for (let i = 0; i <= 8; i++) { const u = i / 8, e = ease(u); kf.push([t0 + (t1 - t0) * u, [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]]); } };
  hold(0, REST); move(2.0, 3.3, REST, INS); hold(CLICK_INSTALL + 0.6, INS); move(CLICK_INSTALL + 0.6, 6.0, INS, REST);
  hold(32.3, REST); move(32.3, 33.9, REST, EXI); hold(CLICK_EXIT + 1.2, EXI); move(CLICK_EXIT + 1.2, 37.4, EXI, REST); hold(T, REST);
  const press = (t) => [[t - 0.1, 0.9], [t + 0.25, 1]];
  let s = '';
  for (const [t, [x, y]] of kf) s += `${n(t / T * 100, 3)}%{transform:translate(${n(x, 1)}px,${n(y, 1)}px)}`;
  css.push(`.cur{animation:cur ${T}s linear infinite}@keyframes cur{${s}}`);
  const sc = stepAnim([[0, 'transform:scale(1)'], ...press(CLICK_INSTALL).map(([t, v]) => [t, `transform:scale(${v})`]), ...press(CLICK_EXIT).map(([t, v]) => [t, `transform:scale(${v})`])]);
  const ARROW = [
    'X...........',
    'XX..........',
    'X#X.........',
    'X##X........',
    'X###X.......',
    'X####X......',
    'X#####X.....',
    'X######X....',
    'X#######X...',
    'X########X..',
    'X#########X.',
    'X######XXXXX',
    'X###X##X....',
    'X##XX##X....',
    'X#X..X##X...',
    'XX...X##X...',
    'X.....X##X..',
    '......X##X..',
    '.......XX...',
  ];
  s = sprite(ARROW, { X: '#000', '#': '#fff' });
  const shadow = `<path d="${bitmapPath(ARROW.map((r) => r.replace(/[X#]/g, '#')), 1.4, 2)}" opacity=".35"/>`;
  body.push(`<g class="cur" transform="translate(${REST[0]} ${REST[1]})"><g class="${sc}"><g transform="scale(1.45)">${shadow}${s}</g></g></g>`);
}

// ---------------------------------------------------------------------------------------------
// Reduced motion: stop everything on the 99 % wait (already the base state of every layer),
// swap the dot animation for its still frame.
// ---------------------------------------------------------------------------------------------
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.dotsA{display:none}.dotsS{display:inline}}');

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${bitmapPath(F5[ch].split('|'))}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">` +
  `<title id="t">CASTAWAY: a skinned installer for a ten-hour lo-fi island video</title>` +
  `<desc id="d">A non-rectangular steel and blue installer window with a lit CASTAWAY sign, a release-info viewport with a rotating dot object, an INSTALL, NFO, MUSIC, EXIT button column, a porthole preview of the island, a progress bar that stops at 99 percent with an ETA of 10:00:00, and a scrolling credits strip.</desc>` +
  `<style>${css.join('')}</style><defs>${glyphDefs}${defs.join('')}</defs>${body.join('')}</svg>`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB`);
