#!/usr/bin/env node
// MediaLog README header: "VHS Tape" (02-vhs-tape_opus_5.5), catalogue entry vap-03.
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock reads).
//   node examples/medialog/src/02-vhs-tape_opus_5.5.mjs
// writes examples/medialog/assets/02-vhs-tape_opus_5.5.svg       the banner: one room, ten years, one tape
//    and examples/medialog/assets/02-vhs-tape_opus_5.5-bars.svg  the colour bars at the head of the tape
//
// THE STYLE is the picture off a worn VHS tape in a dark room, as revived by late-night
// lo-fi: a 4:3 frame with rounded corners on a black surround, a blocky on-screen
// display (PLAY with a triangle, SP under it, a counter, a two-line date stamp), a
// tracking band crawling up the picture, a torn head-switching strip along the bottom,
// colour smeared to the right, lifted blacks, scanlines and the odd white dropout.
//
// THE IDEA: MediaLog as a home video. One living room at night, recorded over ten
// years and lit by whatever was on: the telly (watched), the reading lamp (read), the
// record player (listened to), the telly again with a game on (played). The deck
// index-searches backwards through the tape, newest first, the way the timeline reads.
// The camcorder burned a date stamp into every recording, and the stamp is only ever
// as good as the log: a day, then just a month (FEB. -- 2026), then a day in 2016, and
// finally a game nobody can place, where the auto tracking hunts for a date, gives up
// and settles on SOMETIME IN 2015-2019. The older the recording, the more worn the
// tape. Nobody ever logged a time of day, so the clock line just says --:--.
// Small things nobody asked for: the line under the title changes its verb with the
// light; the audiobook makes it waver between READ and LISTENED TO; SP turns into LP
// while the record is on; the plant on the window sill is a sprout in 2016 and the shelf
// has fewer books; the tea only steams while someone is reading; the queue in the TV
// drama moves, and stays exactly as long.
//
// THE COLOUR BARS are the head of the same tape, at 0:00:00: one bar per kind of media
// in MediaLog's own colours, so the kinds are legible before the programme starts.
//
// ONE 24-SECOND LOOP: four recordings of about 5.3 s, each followed by a 0.7 s index
// search (REW, REW, REW, then one long FF back to the newest). Every jump in the
// picture, the counter and the stamp happens inside a search, so the loop has no seam.
//
// LETTERING, no <text> anywhere:
//   * "Index Mono": an 8x12 bitmap face with two-pixel strokes, capitals only, drawn
//     for this header in the spirit of VCR character generators. Each glyph is one
//     merged-rect path in <defs>; each line of text is a <g> of <use>s, defined once
//     and placed twice (shadow, then ink).
//   * The title is a heavy condensed mixed-case MediaLog, drawn here as outlines on a
//     100-unit cap height, with the owner's open-book logo mark beside it, a hard
//     offset navy shadow (the app has one under its search box) and a red/cyan fringe.
//     It is part of the recording, so it shakes and tears with the picture, but it is
//     never blurred.
//
// prefers-reduced-motion stops everything at 0:03 of the loop: PLAY held, the TV drama
// on, the line reading EVERYTHING YOU'VE WATCHED, ON ONE TIMELINE.
//
// Every title, creator, studio and label on the tape is invented. The logo mark and the
// kind colours are MediaLog's own.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '02-vhs-tape_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);
const OUT_BARS = resolve(here, `../assets/${SLUG}-bars.svg`);

const W = 840; // the whole banner
const H = 640;
const FX = 20; // the 4:3 picture, inset on the black surround
const FY = 20;
const FW = 800;
const FH = 600;
const FLOOR = 478; // where the far wall meets the floor

const n2 = (v) => +(+v).toFixed(2);
const n1 = (v) => +(+v).toFixed(1);
const P = (pts) => pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L');

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ palette
// The room is graded through a tired tape: indigo walls, plum shadows, blacks that are
// never black. The kind colours are MediaLog's own (sampled from the app); the light
// colours are those kinds, brightened the way a lamp or a screen would throw them.
const KIND = {
  movies: '#c23b3b',
  tv: '#2879b8',
  anime: '#2879b8',
  books: '#a96d12',
  comics: '#b8327f',
  manga: '#b8327f',
  games: '#5f8a14',
  podcasts: '#6c44bf',
  music: '#0e8a73',
  videos: '#6b2f5b',
};
const C = {
  surround: '#07050c',
  lifted: '#1a1530',
  wallTop: '#1b1535',
  wallLow: '#2a2050',
  stripe: '#2c2356',
  skirting: '#191230',
  floor: '#150e27',
  board: '#1e1636',
  rug: '#2a1842',
  rugEdge: '#43275f',
  wood: '#2c1f40',
  woodLit: '#3d2c56',
  woodDark: '#1b1329',
  sofa: '#150f29',
  sofaTop: '#2a2047',
  tvBody: '#2e2649',
  tvDark: '#1f1936',
  bezel: '#141020',
  glass: '#0c1220',
  navy: '#18223a', // the app's ink
  osd: '#f7f4ff',
  osdShadow: '#0a0614',
  dim: '#c9bfe6',
  tA: '#ffffff',
  tB: '#fff3fb',
  red: '#ff3d6e',
  cyan: '#3ff0ff',
  shadow: '#0b0f2c',
};

// ------------------------------------------------------------------ the tape
// Four recordings, newest first. Each has its own light, verb, date stamp and entry.
const LOOP = 24;
const SPS = 24; // timeline samples per second
const STILL = 3.0; // the reduced-motion frame
const EPS = 1e-6;
const SEG = [
  {
    t0: 0.0,
    t1: 5.3,
    verb: 'WATCHED',
    light: '#4b9bff',
    rim: '#a9d4ff',
    tint: '#9ccaff',
    kind: KIND.tv,
    era: 2026,
    speed: 'SP',
    counter: 6730, // 1:52:10
    stamp: ['--:--', 'MAR. 21 2026'],
    card: { head: '2025-2029 · 2026', title: 'THE LONG QUEUE', react: '♥', lines: ['TV SHOW · S2 E1-10'], note: ["SAID 'ONE MORE' 9 TIMES."] },
  },
  {
    t0: 6.0,
    t1: 11.3,
    verb: 'READ',
    light: '#ffa63a',
    rim: '#ffd59a',
    tint: '#ffcf86',
    kind: KIND.books,
    era: 2026,
    speed: 'SP',
    counter: 6362, // 1:46:02
    stamp: ['--:--', 'FEB. -- 2026'],
    card: { head: '2025-2029 · 2026', title: 'MOSTLY PUDDLES', react: '¶', lines: ['BOOK · AUDIOBOOK', 'O. PIBWORTH'], note: ['LISTENED. COUNTS AS READ.'] },
  },
  {
    t0: 12.0,
    t1: 17.3,
    verb: 'LISTENED TO',
    light: '#25dcb8',
    rim: '#9af5e0',
    tint: '#97f1dc',
    kind: KIND.music,
    era: 2016,
    speed: 'LP', // a long-playing record, on a tape in long play. Nobody asked.
    counter: 1661, // 0:27:41
    stamp: ['--:--', 'NOV. 12 2016'],
    card: { head: '2015-2019 · 2016', title: 'SOFT FURNISHINGS', react: '♥', lines: ['ALBUM', 'THE DRAUGHT EXCLUDERS'], note: ['SIDE B, MOSTLY.'] },
  },
  {
    t0: 18.0,
    t1: 23.2,
    verb: 'PLAYED',
    light: '#8be03a',
    rim: '#d0f79a',
    tint: '#c8f283',
    kind: KIND.games,
    era: 2016,
    speed: 'SP',
    counter: 499, // 0:08:19
    stamp: ['SOMETIME IN', '2015-2019'],
    card: { head: 'SOMETIME IN 2015-2019', title: 'SNAIL DERBY DELUXE', react: '', lines: ['¤ GREAT, I THINK.', 'GAME · MILDLY INTERACTIVE'], note: [] },
  },
];
// the search after each recording: REW back through the tape, then FF home
const SEARCH = [
  { a: 5.3, b: 6.0, dir: -1, label: 'INDEX -1' },
  { a: 11.3, b: 12.0, dir: -1, label: 'INDEX -24' },
  { a: 17.3, b: 18.0, dir: -1, label: 'INDEX -1' },
  { a: 23.2, b: 24.0, dir: 1, label: 'INDEX +26' },
];
// which recording is on the picture: it changes halfway through each search
const MIDS = SEARCH.map((s) => (s.a + s.b) / 2);
const picSeg = (t) => (t < MIDS[0] ? 0 : t < MIDS[1] ? 1 : t < MIDS[2] ? 2 : t < MIDS[3] ? 3 : 0);
const playIdx = (t) => SEG.findIndex((s) => t >= s.t0 - EPS && t < s.t1 - EPS);
const searchIdx = (t) => SEARCH.findIndex((s) => t >= s.a - EPS && t < s.b - EPS);
const segT = (t, k) => {
  // seconds since recording k started playing (negative while it is arriving on FF)
  const d = t - SEG[k].t0;
  return k === 0 && t > 20 ? d - LOOP : d;
};

// ------------------------------------------------------------------ keyframe helpers
const css = [];
let uid = 0;
const trackCache = new Map();
const px = (v) => (n2(v || 0) === 0 ? '0' : `${n2(v)}px`);
const decl = (v) => {
  const out = [];
  if (v.x !== undefined || v.y !== undefined) out.push(`transform:translate(${px(v.x)},${px(v.y)})`);
  if (v.o !== undefined) out.push(`opacity:${v.o}`);
  return out.join(';');
};
const attrOf = (v) => {
  let s = '';
  if (v.x !== undefined || v.y !== undefined) s += ` transform="translate(${n2(v.x || 0)} ${n2(v.y || 0)})"`;
  if (v.o !== undefined) s += ` opacity="${v.o}"`;
  return s;
};
// Samples sample(t) -> {x, y, o} across the loop and writes hard-cut keyframes for it.
// Returns the element's attributes: its class, and its state in the still frame.
function track(sample, { dur = LOOP, still = STILL, sps = SPS } = {}) {
  const n = Math.round(dur * sps);
  const frames = [];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / sps;
    const v = decl(sample(i === n ? 0 : t));
    if (v !== prev || i === n) {
      frames.push(`${+((i / n) * 100).toFixed(2)}%{${v}}`);
      prev = v;
    }
  }
  const key = `${dur}|${frames.join('')}`;
  let name = trackCache.get(key);
  if (!name) {
    name = 'k' + (uid++).toString(36);
    trackCache.set(key, name);
    css.push(`@keyframes ${name}{${frames.join('')}}.${name}{animation:${name} ${dur}s step-end infinite}`);
  }
  return ` class="${name}"${attrOf(sample(still))}`;
}
const shown = (fn, opts) => track((t) => ({ o: fn(t) ? 1 : 0 }), opts);

// Many small rectangles as a few paths, grouped by colour and (bucketed) opacity.
function rectPaths(list, steps = 20) {
  const groups = new Map();
  for (const { x, y, w, h, fill, op = 1 } of list) {
    const key = `${fill}|${(Math.round(op * steps) / steps).toFixed(2)}`;
    if (!groups.has(key)) groups.set(key, '');
    groups.set(key, groups.get(key) + `M${n1(x)} ${n1(y)}h${n1(w)}v${n1(h)}h${n1(-w)}z`);
  }
  return [...groups]
    .map(([k, d]) => {
      const [fill, op] = k.split('|');
      return `<path fill="${fill}"${op === '1.00' ? '' : ` opacity="${+op}"`} d="${d}"/>`;
    })
    .join('');
}
// a rectangle, written as a path because it is shorter
const rect = (x, y, w, h, fill, extra = '') => `<path d="M${n2(x)} ${n2(y)}h${n2(w)}v${n2(h)}h${n2(-w)}z" fill="${fill}"${extra}/>`;
const circ = (cx, cy, r, fill, extra = '') => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="${fill}"${extra}/>`;
const ell = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(rx)}" ry="${n2(ry)}" fill="${fill}"${extra}/>`;
const poly = (pts, fill, extra = '') => `<path d="M${P(pts)}Z" fill="${fill}"${extra}/>`;
const line = (pts, stroke, sw, extra = '') => `<path d="M${P(pts)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

// ------------------------------------------------------------------ "Index Mono"
// 8x12 cells, two-pixel strokes, capitals only. '¶' is a thumbs-up (liked), '¤' a
// little deadpan face (a custom verdict). ▶ and ◀ are generated below.
const GW = 8;
const GH = 12;
const ADV = 10;
const G = {
  A: ['.######.', '########', '##....##', '##....##', '##....##', '########', '########', '##....##', '##....##', '##....##', '##....##', '##....##'],
  B: ['#######.', '########', '##....##', '##....##', '##....##', '#######.', '########', '##....##', '##....##', '##....##', '########', '#######.'],
  C: ['.#######', '########', '##......', '##......', '##......', '##......', '##......', '##......', '##......', '##......', '########', '.#######'],
  D: ['#######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '#######.'],
  E: ['########', '########', '##......', '##......', '##......', '#######.', '#######.', '##......', '##......', '##......', '########', '########'],
  F: ['########', '########', '##......', '##......', '##......', '#######.', '#######.', '##......', '##......', '##......', '##......', '##......'],
  G: ['.#######', '########', '##......', '##......', '##......', '##..####', '##..####', '##....##', '##....##', '##....##', '########', '.#######'],
  H: ['##....##', '##....##', '##....##', '##....##', '##....##', '########', '########', '##....##', '##....##', '##....##', '##....##', '##....##'],
  I: ['.######.', '.######.', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '.######.', '.######.'],
  J: ['..######', '..######', '......##', '......##', '......##', '......##', '......##', '......##', '##....##', '##....##', '########', '.######.'],
  K: ['##....##', '##...###', '##..###.', '##.###..', '#####...', '####....', '####....', '#####...', '##.###..', '##..###.', '##...###', '##....##'],
  L: ['##......', '##......', '##......', '##......', '##......', '##......', '##......', '##......', '##......', '##......', '########', '########'],
  M: ['##....##', '###..###', '########', '##.##.##', '##.##.##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##'],
  N: ['##....##', '###...##', '###...##', '####..##', '##.##.##', '##.##.##', '##..####', '##...###', '##...###', '##....##', '##....##', '##....##'],
  O: ['.######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '.######.'],
  P: ['#######.', '########', '##....##', '##....##', '##....##', '########', '#######.', '##......', '##......', '##......', '##......', '##......'],
  Q: ['.######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##.##.##', '##..####', '##...###', '########', '.#######'],
  R: ['#######.', '########', '##....##', '##....##', '##....##', '########', '#######.', '##.##...', '##..##..', '##...##.', '##....##', '##....##'],
  S: ['.#######', '########', '##......', '##......', '##......', '#######.', '.#######', '......##', '......##', '......##', '########', '#######.'],
  T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  U: ['##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '.######.'],
  V: ['##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '.##..##.', '.##..##.', '.##..##.', '..####..', '..####..', '...##...'],
  W: ['##....##', '##....##', '##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '###..###', '##....##'],
  X: ['##....##', '##....##', '.##..##.', '.##..##.', '..####..', '...##...', '...##...', '..####..', '.##..##.', '.##..##.', '##....##', '##....##'],
  Y: ['##....##', '##....##', '.##..##.', '.##..##.', '..####..', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  Z: ['########', '########', '......##', '.....##.', '....##..', '...##...', '..##....', '.##.....', '##......', '##......', '########', '########'],
  0: ['.######.', '########', '##....##', '##...###', '##..####', '##.##.##', '##.##.##', '####..##', '###...##', '##....##', '########', '.######.'],
  1: ['...##...', '..###...', '.####...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '.######.', '.######.'],
  2: ['.######.', '########', '##....##', '......##', '......##', '.#######', '#######.', '##......', '##......', '##......', '########', '########'],
  3: ['#######.', '########', '......##', '......##', '......##', '.######.', '.#######', '......##', '......##', '......##', '########', '#######.'],
  4: ['##....##', '##....##', '##....##', '##....##', '##....##', '########', '########', '......##', '......##', '......##', '......##', '......##'],
  5: ['########', '########', '##......', '##......', '##......', '#######.', '########', '......##', '......##', '......##', '########', '#######.'],
  6: ['.#######', '########', '##......', '##......', '##......', '#######.', '########', '##....##', '##....##', '##....##', '########', '.######.'],
  7: ['########', '########', '......##', '......##', '.....##.', '....##..', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  8: ['.######.', '########', '##....##', '##....##', '##....##', '.######.', '########', '##....##', '##....##', '##....##', '########', '.######.'],
  9: ['.######.', '########', '##....##', '##....##', '##....##', '########', '.#######', '......##', '......##', '......##', '########', '#######.'],
  '.': ['........', '........', '........', '........', '........', '........', '........', '........', '........', '........', '...##...', '...##...'],
  ',': ['........', '........', '........', '........', '........', '........', '........', '........', '........', '...##...', '...##...', '..##....'],
  ':': ['........', '........', '...##...', '...##...', '........', '........', '........', '........', '...##...', '...##...', '........', '........'],
  '-': ['........', '........', '........', '........', '........', '.######.', '.######.', '........', '........', '........', '........', '........'],
  "'": ['...##...', '...##...', '...##...', '...##...', '........', '........', '........', '........', '........', '........', '........', '........'],
  '!': ['...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '........', '........', '...##...', '...##...'],
  '?': ['.######.', '########', '##....##', '......##', '.....##.', '....##..', '...##...', '...##...', '........', '........', '...##...', '...##...'],
  '/': ['......##', '......##', '.....##.', '.....##.', '....##..', '....##..', '...##...', '...##...', '..##....', '..##....', '.##.....', '##......'],
  '+': ['........', '........', '...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...', '........', '........'],
  '·': ['........', '........', '........', '........', '........', '...##...', '...##...', '........', '........', '........', '........', '........'],
  '■': ['........', '########', '########', '########', '########', '########', '########', '########', '########', '########', '########', '........'],
  '♥': ['........', '........', '.##..##.', '########', '########', '########', '########', '.######.', '..####..', '...##...', '........', '........'],
  '♪': ['...##...', '...###..', '...####.', '...##.##', '...##..#', '...##...', '...##...', '...##...', '.####...', '#####...', '#####...', '.###....'],
  '¶': ['....##..', '...###..', '...##...', '..###...', '########', '##.#####', '##.#####', '##.#####', '##.#####', '##.#####', '##.####.', '........'],
  '¤': ['........', '.######.', '########', '#..##..#', '#..##..#', '########', '########', '##....##', '########', '.######.', '........', '........'],
  ' ': ['........', '........', '........', '........', '........', '........', '........', '........', '........', '........', '........', '........'],
};
// solid triangles for the transport arrows, cut from the cell's own grid
{
  const tri = [];
  for (let r = 0; r < GH; r++) {
    const d = Math.abs(r + 0.5 - GH / 2);
    const w = Math.max(1, Math.round(GW * (1 - d / (GH / 2))));
    tri.push('#'.repeat(w).padEnd(GW, '.'));
  }
  G['▶'] = tri;
  G['◀'] = tri.map((row) => [...row].reverse().join(''));
}
const gid = (ch) => 'g' + ch.codePointAt(0).toString(16);
const usedGlyphs = new Set();
// One glyph as one path: horizontal runs, merged downwards while they repeat.
function glyphPath(rows) {
  const runs = [];
  const open = new Map();
  rows.forEach((row, y) => {
    const here = new Set();
    for (let x = 0; x < row.length; ) {
      if (row[x] !== '#') {
        x++;
        continue;
      }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      here.add(key);
      const r = open.get(key);
      if (r && r.y + r.h === y) r.h++;
      else {
        const nr = { x, w: x2 - x, y, h: 1 };
        runs.push(nr);
        open.set(key, nr);
      }
      x = x2;
    }
    for (const k of [...open.keys()]) if (!here.has(k)) open.delete(k);
  });
  return runs.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
// Each distinct line of text is defined once and used for both shadow and ink.
const lineDefs = new Map();
function lineId(str) {
  if (!lineDefs.has(str)) {
    const id = 't' + lineDefs.size.toString(36);
    let g = '';
    [...str].forEach((ch, i) => {
      if (!G[ch]) throw new Error(`Index Mono has no glyph for "${ch}"`);
      if (ch === ' ') return;
      usedGlyphs.add(ch);
      g += `<use href="#${gid(ch)}"${i ? ` x="${i * ADV}"` : ''}/>`;
    });
    lineDefs.set(str, { id, g });
  }
  return lineDefs.get(str).id;
}
const textW = (str, u) => ([...str].length * ADV - (ADV - GW)) * u;
// A line of Index Mono, top-left of its first cell at (x, y), pixel size u.
function osd(str, x, y, u, { fill = C.osd, anchor = 'start', shadow = true, sh = C.osdShadow, shOp = 0.85, extra = '' } = {}) {
  const w = textW(str, u);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const id = lineId(str);
  let s = '';
  if (shadow) s += `<use href="#${id}" transform="translate(${n2(x0 + u)} ${n2(y + u)}) scale(${u})" fill="${sh}" opacity="${shOp}"/>`;
  s += `<use href="#${id}" transform="translate(${n2(x0)} ${n2(y)}) scale(${u})" fill="${fill}"${extra}/>`;
  return s;
}

// ------------------------------------------------------------------ the title
// Heavy condensed outlines on a 100-unit cap height (x-height 72, descender to 128).
// Round corners are quadratic; counters are evenodd holes.
const WM = [
  ['M', 76, 'M0 100V0H22L38 50L54 0H76V100H56V44L44 80H32L20 44V100Z'],
  ['e', 56, 'M56 84Q56 100 40 100H16Q0 100 0 84V44Q0 28 16 28H40Q56 28 56 44V70H24Q20 70 20 74V80Q20 84 24 84ZM24 44H32Q36 44 36 48V52Q36 56 32 56H24Q20 56 20 52V48Q20 44 24 44Z'],
  ['d', 56, 'M36 0H56V100H16Q0 100 0 84V44Q0 28 16 28H36ZM24 44H36V84H24Q20 84 20 80V48Q20 44 24 44Z'],
  ['i', 20, 'M0 28H20V100H0ZM0 0H20V18H0Z'],
  ['a', 54, 'M2 30Q8 28 16 28H38Q54 28 54 44V100H14Q0 100 0 86V74Q0 60 14 60H36V48Q36 44 32 44H2ZM22 74H36V86H22Q18 86 18 82V78Q18 74 22 74Z'],
  ['L', 46, 'M0 0H20V84H46V100H0Z'],
  ['o', 54, 'M16 28H38Q54 28 54 44V84Q54 100 38 100H16Q0 100 0 84V44Q0 28 16 28ZM24 44H30Q34 44 34 48V80Q34 84 30 84H24Q20 84 20 80V48Q20 44 24 44Z'],
  ['g', 56, 'M16 28H56V114Q56 128 42 128H4V112H36V100H16Q0 100 0 84V44Q0 28 16 28ZM24 44H36V84H24Q20 84 20 80V48Q20 44 24 44Z'],
];
const WM_GAP = { M: 8, e: 7, d: 7, i: 7, a: 9, L: 6, o: 7 };
// shift a path's absolute coordinates by dx (all commands here are absolute)
function shiftPath(d, dx) {
  return d.replace(/([MLHVQZ])([^MLHVQZ]*)/g, (m, cmd, args) => {
    const nums = args.trim() ? args.trim().split(/[ ,]+/).map(Number) : [];
    if (cmd === 'H') return 'H' + nums.map((v) => n2(v + dx)).join(' ');
    if (cmd === 'V') return 'V' + nums.join(' ');
    if (cmd === 'Z') return 'Z';
    return cmd + nums.map((v, i) => (i % 2 === 0 ? n2(v + dx) : v)).join(' ');
  });
}
function wordmark() {
  let x = 0;
  let d = '';
  for (const [ch, w, path] of WM) {
    d += shiftPath(path, x);
    x += w + (WM_GAP[ch] || 0);
  }
  return { d, width: x };
}
// The logo mark: an open book, a play triangle on the left page, a pen on the right.
const BOOK_W = 110;
const BOOK_PAGES = 'M0 16L50 24V100L0 92ZM58 24L108 16V92L58 100Z';
function bookInk() {
  const tri = 'M14 42L38 58L14 74Z';
  const p0 = [70, 86];
  const u = [0.514, -0.857];
  const nn = [0.857, 0.514];
  const at = (s, k) => [p0[0] + u[0] * s + nn[0] * k, p0[1] + u[1] * s + nn[1] * k];
  const body = [at(13, 5.2), at(60, 5.2), at(60, -5.2), at(13, -5.2)];
  const nib = [at(0, 0), at(13, 5.2), at(13, -5.2)];
  return tri + 'M' + P(body) + 'Z' + 'M' + P(nib) + 'Z';
}

// ------------------------------------------------------------------ the room
// Elevation of a living room at night, drawn straight on. Static parts first; anything
// that differs between recordings (lights, the TV, the plant, the props) is per segment.
function wall() {
  let s = rect(0, 0, FW, FLOOR + 2, 'url(#gWall)');
  let d = '';
  for (let x = 8; x < FW; x += 30) d += `M${x} 0h13v${FLOOR}h-13z`;
  s += `<path d="${d}" fill="${C.stripe}" opacity=".45"/>`;
  s += rect(0, FLOOR - 11, FW, 11, C.skirting) + rect(0, FLOOR - 11, FW, 1.5, '#3a2d5e');
  return s;
}
function floor() {
  let s = rect(0, FLOOR, FW, FH - FLOOR, C.floor);
  s += ell(104, FLOOR + 3, 92, 5, '#0a0614', ' opacity=".7"') + ell(231, FLOOR + 3, 40, 4, '#0a0614', ' opacity=".6"');
  s += ell(400, FLOOR + 3, 134, 6, '#0a0614', ' opacity=".7"') + ell(682, FLOOR + 3, 100, 5, '#0a0614', ' opacity=".7"');
  let d = '';
  for (const y of [487, 498, 511, 526, 544, 565]) d += `M0 ${y}h${FW}v1h-${FW}z`;
  s += `<path d="${d}" fill="${C.board}"/>`;
  s += poly([[168, 485], [632, 485], [690, 532], [110, 532]], C.rug);
  s += `<path d="M${P([[174, 489], [626, 489], [678, 528], [122, 528]])}Z" fill="none" stroke="${C.rugEdge}" stroke-width="2" stroke-dasharray="6 4"/>`;
  return s;
}

// The bookshelf: books in muted night colours, a few spines in the kind colours.
// Books bought after 2016 are drawn on their own layer, so the 2016 shelf has gaps.
const SHELF = { x0: 24, x1: 184, top: 150, rows: [[160, 232], [242, 314], [324, 396], [406, 470]] };
const BOOKC = ['#4b3466', '#5a3550', '#3b3a6a', '#6b4a45', '#4a2d50', '#2f4560', '#5d4a2e', '#55305e', '#3a2f55', '#6a3b4f', '#7a5a2a', '#7a2f5e'];
let BOOKS = null;
function shelfBooks() {
  if (BOOKS) return BOOKS;
  const r = mulberry32(2016);
  const list = [];
  SHELF.rows.forEach(([y0, y1], row) => {
    let x = SHELF.x0 + 10;
    const end = SHELF.x1 - 10;
    while (x < end - 6) {
      const kind = r();
      if (kind < 0.08 && x < end - 40) {
        // a stack of comics lying flat
        const n = 3 + Math.floor(r() * 3);
        const w = 30 + r() * 8;
        for (let i = 0; i < n; i++) list.push({ x: x + r() * 3, y: y1 - (i + 1) * 5.5, w, h: 5, fill: i % 2 ? '#8e2f6a' : '#5e2a63', late: row === 3 });
        x += w + 4;
        continue;
      }
      if (kind < 0.16) {
        // a gap, or a run of manga: thin, identical spines
        if (r() < 0.5) {
          x += 6 + r() * 10;
          continue;
        }
        const n = 4 + Math.floor(r() * 4);
        const h = (y1 - y0) * 0.7;
        for (let i = 0; i < n && x < end - 6; i++) {
          list.push({ x, y: y1 - h, w: 6, h, fill: '#8a2d68', band: '#f0b0d8', late: i > 2 });
          x += 6.6;
        }
        x += 2;
        continue;
      }
      const w = 7 + r() * 10;
      const h = (y1 - y0) * (0.62 + r() * 0.34);
      const fill = r() < 0.18 ? (r() < 0.6 ? '#8a5a1a' : '#9a6a22') : BOOKC[Math.floor(r() * BOOKC.length)];
      list.push({ x, y: y1 - h, w, h, fill, band: r() < 0.45 ? '#e8d9ff' : null, late: r() < 0.32 });
      x += w + 0.8 + (r() < 0.15 ? 3 : 0);
    }
  });
  BOOKS = list.filter((b) => b.x + b.w < SHELF.x1 - 9);
  return BOOKS;
}
function bookshelf() {
  const { x0, x1, top } = SHELF;
  let s = rect(x0, top, x1 - x0, FLOOR - top, C.wood);
  s += rect(x0 + 8, top + 8, x1 - x0 - 16, FLOOR - top - 14, C.woodDark);
  for (const [y0] of SHELF.rows.slice(1)) s += rect(x0, y0 - 10, x1 - x0, 10, C.woodLit) + rect(x0, y0 - 10, x1 - x0, 1.5, '#4d3a6a');
  s += rect(x0, top, x1 - x0, 10, C.woodLit) + rect(x0 - 4, top - 4, x1 - x0 + 8, 6, '#3a2a52');
  s += rect(36, top - 10, 44, 6, '#7a2f5e') + rect(38, top - 15, 40, 5, '#4a2d50') + rect(35, top - 20, 45, 5, '#8e2f6a') + rect(40, top - 24, 36, 4, '#5a3550');
  s += rect(150, top - 26, 8, 22, '#3b3a6a') + rect(159, top - 22, 7, 18, '#6b4a45');
  s += rect(x0, FLOOR - 8, x1 - x0, 8, '#22182f');
  return s;
}
function booksLayer(late) {
  const list = shelfBooks().filter((b) => !!b.late === late);
  let s = rectPaths(list.map((b) => ({ ...b, op: 1 })));
  const bands = [];
  for (const b of list) {
    if (!b.band) continue;
    bands.push({ x: b.x + 1, y: b.y + 4, w: b.w - 2, h: 2, fill: b.band, op: 0.35 });
    bands.push({ x: b.x + 1, y: b.y + b.h - 7, w: b.w - 2, h: 1.6, fill: b.band, op: 0.25 });
  }
  s += rectPaths(bands);
  // a shadow down the left of every spine, so they read as separate books
  s += rectPaths(list.filter((b) => b.w > 4).map((b) => ({ x: b.x, y: b.y, w: 1.4, h: b.h, fill: '#0c0814', op: 0.45 })));
  return s;
}
// Highlights on the side of every book that faces the light (x of the light source).
function booksLit(lx, col, op) {
  const list = shelfBooks();
  return rectPaths(
    list.map((b) => {
      const right = lx > b.x;
      const k = Math.max(0.25, 1 - Math.abs(lx - b.x) / 260);
      return { x: right ? b.x + b.w - 2 : b.x, y: b.y + 1, w: 2, h: b.h - 2, fill: col, op: op * k };
    }),
  );
}

// The plant on the window sill. In 2016 it is a sprout.
function leaf(cx, cy, ang, len, wid, fill) {
  const a = (ang * Math.PI) / 180;
  const tx = cx + Math.cos(a) * len;
  const ty = cy + Math.sin(a) * len;
  const mx = cx + Math.cos(a) * len * 0.5;
  const my = cy + Math.sin(a) * len * 0.5;
  const nx = -Math.sin(a) * wid;
  const ny = Math.cos(a) * wid;
  return `<path d="M${n2(cx)} ${n2(cy)}Q${n2(mx + nx)} ${n2(my + ny)} ${n2(tx)} ${n2(ty)}Q${n2(mx - nx)} ${n2(my - ny)} ${n2(cx)} ${n2(cy)}Z" fill="${fill}"/>`;
}
function plant(big) {
  const cx = 752;
  const base = WIN.y + WIN.h + 4;
  let s = poly([[cx - 13, base - 22], [cx + 13, base - 22], [cx + 10, base], [cx - 10, base]], '#5a3346') + rect(cx - 14, base - 25, 28, 5, '#6d3f55');
  if (!big) {
    s += line([[cx, base - 24], [cx, base - 32]], '#2f7a5c', 2);
    s += leaf(cx, base - 31, -150, 9, 3.5, '#3a9a6e') + leaf(cx, base - 31, -30, 9, 3.5, '#2f8a60');
    return s;
  }
  const leaves = [
    [-170, 40, 8, '#1f5a48'], [-145, 50, 9, '#2a7058'], [-122, 54, 9, '#1f5a48'], [-100, 58, 10, '#2f7c60'], [-80, 52, 9, '#2a7058'],
    [-60, 46, 9, '#1f5a48'], [-150, 34, 7, '#348a68'], [-110, 40, 8, '#3a9a72'], [-75, 36, 7, '#348a68'], [-130, 30, 7, '#3a9a72'],
    [-20, 30, 7, '#2a7058'],
  ];
  for (const [a, l, w, f] of leaves) s += leaf(cx, base - 24, a, l, w, f);
  return s;
}

function sideTableAndLamp() {
  let s = rect(198, 412, 66, 7, C.woodLit) + rect(204, 419, 54, 4, C.woodDark);
  s += rect(204, 419, 5, FLOOR - 419, C.wood) + rect(253, 419, 5, FLOOR - 419, C.wood) + rect(206, 454, 50, 4, C.wood);
  // lamp: base, stem, shade (the shade is per segment: off, or lit)
  s += ell(231, 410, 12, 3, '#2a2140') + rect(225, 400, 12, 10, '#3a3052') + rect(229, 368, 4, 33, '#4a4064');
  // a mug of tea
  s += rect(244, 400, 11, 12, '#4f3566') + rect(244, 400, 11, 1.6, '#6e4f8a');
  s += `<path d="M255 403h2.5q2 0 2 2.2v1.6q0 2.2-2 2.2H255" fill="none" stroke="#4f3566" stroke-width="1.8"/>`;
  return s;
}
// Steam off the tea, only while someone is reading.
function steam() {
  let s = `<g fill="none" stroke="#ffe8c8" stroke-width="1.4" stroke-linecap="round">`;
  [[246.5, 0], [249.5, -0.9], [252.5, -1.7]].forEach(([x, delay]) => {
    s += `<path class="st" style="animation-delay:${delay}s" opacity=".45" d="M${x} 397q-2.4 -4 0 -8t0 -8"/>`;
  });
  return s + '</g>';
}
const SHADE = [[214, 338], [248, 338], [258, 370], [204, 370]];
function lampShade(on) {
  if (!on) return poly(SHADE, '#463a62') + poly([[214, 338], [248, 338], [250, 344], [212, 344]], '#54477a');
  let s = poly(SHADE, 'url(#gShade)');
  s += ell(231, 370, 27, 3.4, '#fff1c9');
  return s;
}

const TV = { x: 290, y: 272, w: 220, h: 152 };
const SCR = { x: 310, y: 287, w: 152, h: 114 }; // the picture tube's visible area (4:3)
const TVK = SCR.w / 124; // the TV programmes are drawn on a 124 x 94 grid
function tvSet() {
  const { x, y, w, h } = TV;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${C.tvBody}"/>`;
  s += `<rect x="${x}" y="${y + h - 14}" width="${w}" height="14" rx="6" fill="${C.tvDark}"/>`;
  s += rect(x + 8, y + 2, w - 16, 1.6, '#4a3f6e');
  s += `<rect x="${SCR.x - 9}" y="${SCR.y - 8}" width="${SCR.w + 18}" height="${SCR.h + 16}" rx="14" fill="${C.bezel}"/>`;
  // side panel: two knobs, a channel window and a speaker grille
  s += circ(488, 298, 7, '#3b3159') + circ(488, 298, 2.4, '#1a1430') + circ(488, 324, 7, '#3b3159') + circ(488, 324, 2.4, '#1a1430');
  s += rect(480, 338, 16, 8, '#0b0814') + rect(483, 340, 10, 4, '#e0546a', ' opacity=".5"');
  let g = '';
  for (let yy = 354; yy < 404; yy += 5) g += `M480 ${yy}h16v2h-16z`;
  s += `<path d="${g}" fill="#18122a"/>`;
  s += rect(306, y + h, 16, 3, '#1a1430') + rect(478, y + h, 16, 3, '#1a1430');
  return s;
}
function cabinet() {
  let s = rect(272, 424, 256, 8, C.woodLit) + rect(272, 424, 256, 1.5, '#4d3a6a');
  s += rect(278, 432, 244, FLOOR - 432, '#251a38') + rect(288, 437, 224, 37, '#140e22');
  // the VCR, its clock showing dashes, as it always has
  s += rect(294, 444, 104, 22, '#1d1830') + rect(294, 444, 104, 1.4, '#3a3158') + rect(308, 451, 58, 6, '#09060f') + rect(372, 450, 20, 8, '#0b1a1c');
  s += rect(374, 453, 3, 2, '#3fd6c6', ' opacity=".7"') + rect(379, 453, 3, 2, '#3fd6c6', ' opacity=".7"') + rect(385, 453, 3, 2, '#3fd6c6', ' opacity=".7"');
  // the games console: a grey box with two ports
  s += rect(410, 448, 94, 22, '#2b2846') + rect(410, 448, 94, 4, '#3f3a62') + rect(416, 458, 9, 5, '#120e1f') + rect(429, 458, 9, 5, '#120e1f') + rect(474, 456, 22, 3, '#1a1530');
  return s;
}
function sideboard() {
  let s = rect(586, 412, 192, 7, C.woodLit) + rect(586, 412, 192, 1.5, '#4d3a6a');
  s += rect(592, 419, 180, FLOOR - 419, '#251a38') + rect(681, 423, 2, 50, '#1a1229');
  s += rect(668, 442, 8, 3, '#4a3a66') + rect(688, 442, 8, 3, '#4a3a66');
  // turntable: the plinth's front, the record seen from just above, the tonearm
  s += rect(600, 394, 96, 18, '#3a2d55') + rect(600, 394, 96, 2, '#54447a') + rect(606, 402, 10, 4, '#1a1430');
  s += ell(642, 394, 36, 7.5, '#1d1730') + ell(642, 393, 33, 6.6, '#0a0712');
  s += `<ellipse cx="642" cy="393" rx="26" ry="5.2" fill="none" stroke="#1d1830" stroke-width=".8"/><ellipse cx="642" cy="393" rx="19" ry="3.8" fill="none" stroke="#1d1830" stroke-width=".8"/>`;
  s += line([[686, 386], [684, 392], [664, 394]], '#8f85b8', 1.6) + circ(686, 385, 3, '#5d5285');
  // amplifier with two VU meters (lit when the record is on)
  s += rect(702, 380, 70, 32, '#2a2340') + rect(702, 380, 70, 1.6, '#433a66');
  s += rect(707, 386, 28, 16, '#120e1f') + rect(739, 386, 28, 16, '#120e1f');
  s += circ(716, 407, 1.8, '#55497a') + circ(728, 407, 1.8, '#55497a') + circ(758, 407, 1.8, '#55497a');
  return s;
}
// The album sleeve leaning on the wall behind the record player: a soft-furnished sun.
function sleeve() {
  let s = `<g transform="rotate(-4 642 368)">`;
  s += rect(612, 338, 60, 58, '#2b5f63');
  s += rect(612, 370, 60, 26, '#1f4a52') + circ(642, 370, 13, '#e9b3a0') + rect(612, 370, 60, 1.5, '#9fd9cf');
  s += rect(612, 376, 60, 3, '#2b6f6a') + rect(612, 383, 60, 3, '#2b6f6a') + rect(612, 390, 60, 3, '#2b6f6a');
  s += '</g>';
  return s;
}
// The window: night sky, a moon, a city that is also up late.
const WIN = { x: 618, y: 120, w: 154, h: 208 };
function windowView() {
  const { x, y, w, h } = WIN;
  let s = rect(x - 6, y - 6, w + 12, h + 12, '#2f2550');
  s += rect(x, y, w, h, 'url(#gNight)');
  const r = mulberry32(77);
  const stars = [];
  for (let i = 0; i < 26; i++) stars.push({ x: x + 4 + r() * (w - 8), y: y + 4 + r() * (h * 0.5), w: 1.4, h: 1.4, fill: '#e9e2ff', op: 0.4 + r() * 0.5 });
  s += rectPaths(stars);
  const tw = [[640, 140], [702, 132], [664, 178], [760, 196], [628, 214]];
  tw.forEach(([sx, sy], i) => {
    s += `<rect class="tw" style="animation-delay:${-i * 1.3}s" x="${sx}" y="${sy}" width="2" height="2" fill="#ffffff"/>`;
  });
  s += circ(738, 158, 22, '#c9b8ff', ' opacity=".12"') + circ(738, 158, 16, '#e3d8ff', ' opacity=".18"') + circ(738, 158, 11, '#f4eeff');
  s += circ(734, 155, 2.4, '#ddd0f5') + circ(741, 162, 1.6, '#ddd0f5');
  // skyline
  const bl = [[618, 286, 22], [640, 270, 18], [658, 292, 26], [684, 262, 16], [700, 280, 24], [724, 296, 18], [742, 274, 30]];
  let d = '';
  const win = [];
  const rw = mulberry32(5);
  for (const [bx, by, bw] of bl) {
    d += `M${bx} ${y + h}V${by}h${bw}V${y + h}z`;
    for (let yy = by + 5; yy < y + h - 4; yy += 7)
      for (let xx = bx + 3; xx < bx + bw - 3; xx += 6) if (rw() < 0.3) win.push({ x: xx, y: yy, w: 2.4, h: 3, fill: rw() < 0.7 ? '#ffcf8a' : '#ff9fd6', op: 0.75 });
  }
  s += `<path d="${d}" fill="#120f2b"/>` + rectPaths(win);
  // glazing bars and sill
  s += rect(x + w / 2 - 2, y, 4, h, '#2f2550') + rect(x, y + 98, w, 4, '#2f2550');
  s += rect(x - 12, y + h + 4, w + 24, 8, '#3a2c56') + rect(x - 12, y + h + 4, w + 24, 1.5, '#55447e');
  // a curtain gathered on the left
  s += rect(592, 106, 192, 4, '#3a2d58');
  s += `<path d="M598 110H636Q630 200 640 342H596Q604 220 598 110Z" fill="#3a2054"/>`;
  s += `<path d="M606 110Q610 220 604 342M618 110Q622 230 616 342M628 110Q626 220 632 342" fill="none" stroke="#2a1640" stroke-width="3"/>`;
  return s;
}
// The back of the sofa, in the foreground: the camcorder sat behind it.
const SOFA_TOP = 'M-10 540Q-6 508 40 506Q150 500 250 507Q262 510 270 512Q400 497 530 512Q538 510 550 507Q650 500 760 506Q806 508 810 540';
function sofa() {
  let s = `<path d="${SOFA_TOP}V610H-10Z" fill="url(#gSofa)"/>`;
  s += `<path d="${SOFA_TOP}" fill="none" stroke="${C.sofaTop}" stroke-width="7" opacity=".9"/>`;
  s += `<path d="M262 512Q266 540 262 610M538 512Q534 540 538 610" fill="none" stroke="#0a0614" stroke-width="3"/>`;
  // a knitted throw over the left end
  s += `<path d="M58 506Q110 500 168 503L176 600H70Q60 560 58 506Z" fill="#2a1838"/>`;
  let d = '';
  for (let x = 74; x < 170; x += 12) d += `M${x} ${504 + (x - 74) * 0.02}L${x + 4} 600`;
  s += `<path d="${d}" fill="none" stroke="#3a2450" stroke-width="3"/>`;
  return s;
}
// Props left on the back of the sofa, one per recording.
function props(k, col) {
  if (k === 0) {
    // the remote
    return `<g transform="rotate(-6 352 500)">${rect(330, 494, 46, 11, '#0f0b1b')}${rect(330, 494, 46, 2, col, ' opacity=".8"')}${rect(336, 498, 4, 3, '#c94a6a')}${rect(344, 498, 3, 3, '#3a3158')}${rect(350, 498, 3, 3, '#3a3158')}${rect(356, 498, 3, 3, '#3a3158')}</g>`;
  }
  if (k === 1) {
    // headphones: it was an audiobook
    let s = `<path d="M334 504Q336 480 356 480Q376 480 378 504" fill="none" stroke="#0f0b1b" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M336 492Q340 482 356 482Q372 482 376 492" fill="none" stroke="${col}" stroke-width="1.5" opacity=".8"/>`;
    s += `<rect x="326" y="494" width="14" height="16" rx="5" fill="#0f0b1b"/><rect x="372" y="494" width="14" height="16" rx="5" fill="#0f0b1b"/>`;
    s += rect(328, 495, 10, 1.6, col, ' opacity=".8"') + rect(374, 495, 10, 1.6, col, ' opacity=".8"');
    return s;
  }
  if (k === 3) {
    // a controller, its cable trailing back towards the console
    let s = `<path d="M372 502Q392 494 404 470" fill="none" stroke="#0f0b1b" stroke-width="2"/>`;
    s += `<path d="M330 498Q332 490 342 490H368Q378 490 380 498L382 506Q382 512 375 511L366 505H344L335 511Q328 512 328 506Z" fill="#0f0b1b"/>`;
    s += `<path d="M334 494Q336 491 342 491H368Q374 491 376 494" fill="none" stroke="${col}" stroke-width="1.5" opacity=".85"/>`;
    s += rect(338, 495, 7, 2, '#3a3158') + rect(340.5, 492.5, 2, 7, '#3a3158') + circ(366, 495, 1.6, '#d8506a') + circ(371, 497.5, 1.6, '#e0c040');
    return s;
  }
  return '';
}

// ------------------------------------------------------------------ what is on the telly
// THE LONG QUEUE (S2): a queue outside a door. The queue moves. It stays as long.
function personShape(x, foot, v) {
  const tones = ['#0e2850', '#12305c', '#0b2246', '#163866'];
  const col = tones[v % 4];
  const tall = v % 3 === 1 ? -3 : v % 5 === 2 ? 4 : 0;
  let s = circ(x, foot - 20 + tall, 3.6, col) + `<rect x="${n2(x - 4)}" y="${n2(foot - 16 + tall)}" width="8" height="${n2(14 - tall)}" rx="3" fill="${col}"/>`;
  s += rect(x - 3, foot - 3, 2.4, 3, col) + rect(x + 0.6, foot - 3, 2.4, 3, col);
  if (v % 4 === 3) s += rect(x - 4.5, foot - 25 + tall, 9, 2, col) + rect(x - 3, foot - 28 + tall, 6, 3.4, col);
  return s;
}
const TVG = { x: 0, y: 0, w: 124, h: 94 };
function tvQueue() {
  const { x, y, w, h } = TVG;
  let base = rect(x, y, w, h, '#3f7fc8') + rect(x, y, w, 26, '#5b97d8') + rect(x, y + 24, w, 2, '#2c66ad');
  base += rect(x, y + h - 14, w, 14, '#1d4a82') + rect(x, y + h - 14, w, 1.5, '#7fb2e8');
  base += rect(100, 34, 18, 46, '#132f5c') + rect(98, 30, 22, 4, '#2c5f9f') + rect(101, 23, 16, 6, '#d6ebff') + circ(114, 58, 1.4, '#9fc8f0');
  base += rect(x + 6, y + 34, 22, 16, '#2c66ad') + rect(x + 34, y + 34, 22, 16, '#2c66ad') + rect(x + 62, y + 34, 22, 16, '#2c66ad');
  const foot = y + h - 13;
  let s = base;
  const steps = (t) => {
    const d = segT(t, 0);
    return d < 1.8 ? 0 : d < 3.6 ? 1 : 2;
  };
  for (let k = 0; k <= 2; k++) {
    let g = '';
    for (let i = k; i < k + 8; i++) {
      const px = 90 - 11.5 * (i - k);
      g += personShape(px, foot, i);
    }
    s += `<g${shown((t) => steps(t) === k)}>${g}</g>`;
  }
  return s;
}
// SNAIL DERBY DELUXE: three snails, three lanes, no hurry.
function snail(x, yc, shell) {
  let s = rect(x - 7, yc + 1, 15, 4, '#d9f7a6') + rect(x + 6, yc - 4, 1.6, 6, '#d9f7a6') + rect(x + 9, yc - 3, 1.6, 5, '#d9f7a6');
  s += rect(x + 5.4, yc - 5.4, 2.8, 2.8, '#203a10') + rect(x + 8.4, yc - 4.4, 2.8, 2.8, '#203a10');
  s += circ(x - 1, yc - 2, 5.6, shell) + `<path d="M${n2(x - 1)} ${n2(yc - 2)}m-2.4 0a2.4 2.4 0 1 1 2.4 2.4" fill="none" stroke="#1a2a10" stroke-width="1.2"/>`;
  return s;
}
function tvSnails() {
  const { x, y, w, h } = TVG;
  let s = rect(x, y, w, h, '#0f2c14');
  s += rect(x, y, w, 12, '#0a1f0d');
  // a little HUD: three shells and some score blocks
  s += rect(x + 6, y + 4, 4, 4, '#ffd84a') + rect(x + 12, y + 4, 4, 4, '#ff8ad8') + rect(x + 18, y + 4, 4, 4, '#7af0ff');
  s += rect(x + w - 34, y + 4, 28, 4, '#9be86a', ' opacity=".8"');
  const lanes = [[y + 14, '#164a1d'], [y + 41, '#2a7a31'], [y + 68, '#164a1d']];
  for (const [ly, col] of lanes) s += rect(x, ly, w, 25, col) + rect(x, ly + 25, w, 2, '#8fe07a', ' opacity=".55"');
  let dash = '';
  for (let xx = 4; xx < 104; xx += 10) dash += `M${xx} ${y + 27}h5v1h-5zM${xx} ${y + 54}h5v1h-5z`;
  s += `<path d="${dash}" fill="#c8f5a8" opacity=".5"/>`;
  // finish line, chequered
  let ch = '';
  for (let yy = y + 14; yy < y + h; yy += 3) ch += `M${(yy - y) % 6 ? 108 : 111} ${yy}h3v3h-3z`;
  s += rect(108, y + 14, 6, h - 14, '#e8ffd0') + `<path d="${ch}" fill="#0f2c14"/>`;
  const racers = [[y + 29, '#ffd84a', 3.4, 8], [y + 56, '#ff8ad8', 4.4, 14], [y + 83, '#7af0ff', 2.6, 6]];
  for (const [yc, shellCol, speed, x0] of racers) {
    const mv = track((t) => {
      const d = t >= 17.4 ? t - 18 : 0;
      return { x: Math.round(Math.max(0, d) * speed) };
    });
    s += `<g${mv}><g transform="translate(${x0} ${yc}) scale(1.3) translate(${-x0} ${-yc})">${snail(x0, yc, shellCol)}</g></g>`;
  }
  return s;
}
// The tube when it is off: dark glass with a reflection of whatever is lit.
function tvOff(col, side) {
  const { x, y, w, h } = TVG;
  let s = rect(x, y, w, h, C.glass);
  s += ell(side < 0 ? x + 26 : x + w - 26, y + 22, 22, 10, col, ' opacity=".22"');
  s += `<path d="M${x + 10} ${y + h - 8}L${x + w - 30} ${y + 8}" stroke="#ffffff" stroke-width="10" opacity=".035"/>`;
  return s;
}

// ------------------------------------------------------------------ light, per recording
function lightRig(k) {
  const sg = SEG[k];
  let s = '';
  if (k === 0 || k === 3) {
    // the telly: a cool pool from the middle of the room, a halo round the set
    s += rect(0, 0, FW, FH, `url(#gL${k})`);
    s += ell(386, 344, 170, 124, sg.light, ' opacity=".12"');
    s += ell(390, 502, 240, 28, sg.light, ' opacity=".18"');
    s += rect(272, 424, 256, 2, sg.rim, ' opacity=".75"') + rect(586, 412, 70, 2, sg.rim, ' opacity=".4"') + rect(198, 412, 66, 2, sg.rim, ' opacity=".5"');
    s += rect(SHELF.x1 - 3, SHELF.top, 3, FLOOR - SHELF.top, sg.rim, ' opacity=".35"') + rect(592, 419, 3, 59, sg.rim, ' opacity=".4"');
    s += booksLit(386, sg.rim, 0.32);
  }
  if (k === 1) {
    // the reading lamp: warm, low, to the left
    s += rect(0, 0, FW, FH, 'url(#gL1)');
    s += poly([[204, 370], [258, 370], [306, 478], [156, 478]], 'url(#gCone)');
    s += ell(231, 332, 64, 32, sg.light, ' opacity=".18"');
    s += rect(198, 412, 66, 2, sg.rim, ' opacity=".9"') + rect(SHELF.x1 - 3, SHELF.top, 3, FLOOR - SHELF.top, sg.rim, ' opacity=".7"');
    s += rect(TV.x, TV.y + 10, 2, TV.h - 20, sg.rim, ' opacity=".55"') + rect(272, 424, 90, 2, sg.rim, ' opacity=".6"');
    s += booksLit(231, sg.rim, 0.7);
  }
  if (k === 2) {
    // the record player and the amp's meters: teal, off to the right
    s += rect(0, 0, FW, FH, 'url(#gL2)');
    s += ell(688, 398, 130, 52, sg.light, ' opacity=".2"');
    s += ell(688, 398, 70, 26, sg.light, ' opacity=".18"');
    s += rect(586, 412, 192, 2, sg.rim, ' opacity=".85"') + rect(606, 332, 178, 2, sg.rim, ' opacity=".6"');
    s += rect(TV.x + TV.w - 2, TV.y + 10, 2, TV.h - 20, sg.rim, ' opacity=".6"') + rect(438, 424, 90, 2, sg.rim, ' opacity=".55"');
    s += booksLit(690, sg.rim, 0.18);
  }
  return s;
}
// the rim of light along the top of the sofa, brightest under the light
function sofaRim(k) {
  return `<path d="${SOFA_TOP}" fill="none" stroke="url(#gRim${k})" stroke-width="3.2"/>`;
}

// One recording: everything in the room that depends on it.
function recording(k) {
  const sg = SEG[k];
  let s = lightRig(k);
  // the telly's picture, over the light it throws
  s += `<g clip-path="url(#cScr)"><g transform="translate(${SCR.x} ${SCR.y}) scale(${n2(TVK)})">`;
  if (k === 0) s += tvQueue();
  else if (k === 3) s += tvSnails();
  else s += tvOff(sg.light, k === 1 ? -1 : 1);
  s += '</g>';
  if (k === 0 || k === 3) s += rect(SCR.x, SCR.y, SCR.w, SCR.h, 'url(#gTube)') + rect(SCR.x, SCR.y, SCR.w, SCR.h, 'url(#pTube)');
  s += '</g>';
  s += `<rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" rx="12" fill="none" stroke="${C.bezel}" stroke-width="5"/>`;
  s += lampShade(k === 1);
  if (k === 1) s += steam();
  if (k === 2) {
    // the record turns, the meters dance, the LED is on
    s += `<g transform="translate(642 393) scale(1 .2)"><g class="spin"><path d="M0 -30A30 30 0 0 1 21 21" fill="none" stroke="#3a3458" stroke-width="3"/><circle r="8" fill="${sg.light}" opacity=".85"/><rect x="-1" y="-8" width="2" height="5" fill="#0a0712"/></g></g>`;
    s += rect(707, 386, 28, 16, '#1d6f62') + rect(739, 386, 28, 16, '#1d6f62') + rect(707, 386, 28, 16, 'url(#gVu)') + rect(739, 386, 28, 16, 'url(#gVu)');
    s += `<g transform="translate(721 401)"><path class="vu1" d="M0 0L-8 -12" stroke="#0a2a26" stroke-width="1.4"/></g><g transform="translate(753 401)"><path class="vu2" d="M0 0L-7 -12" stroke="#0a2a26" stroke-width="1.4"/></g>`;
    s += rect(608, 402, 4, 2, '#7fffe0') + rect(606, 400, 8, 6, '#7fffe0', ' opacity=".25"');
  }
  if (k === 3) s += rect(490, 450, 4, 2, '#b8ff6a') + rect(488, 448, 8, 6, '#b8ff6a', ' opacity=".25"');
  return s;
}

// ------------------------------------------------------------------ the title card
const TITLE_K = 0.9;
const TITLE_TOP = 80;
function titleCard() {
  const { width } = wordmark();
  const gap = 24;
  const total = BOOK_W + gap + width;
  const tx = FW / 2 - (total * TITLE_K) / 2;
  const g = (inner) => `<g transform="translate(${n2(tx)} ${TITLE_TOP}) scale(${TITLE_K})">${inner}</g>`;
  const both = (fill, dx = 0, dy = 0, extra = '') => `<use href="#lockup" transform="translate(${dx} ${dy})" fill="${fill}"${extra}/>`;
  let s = '';
  // a thick dark outline and the hard offset shadow, as in the app
  s += g(`<use href="#lockup" transform="translate(7 7)" fill="${C.shadow}" stroke="${C.shadow}" stroke-width="9" stroke-linejoin="round"/>` + `<use href="#lockup" fill="${C.shadow}" stroke="${C.shadow}" stroke-width="7" stroke-linejoin="round"/>`);
  s += g(both(C.red, -2.4, 0, ' opacity=".9"') + both(C.cyan, 2.4, 0, ' opacity=".9"'));
  // the fill: white over the colour of whatever is lit
  SEG.forEach((sg, k) => {
    const vis = shown((t) => picSeg(t) === k);
    s += `<g${vis}>${g(both(`url(#gT${k})`))}</g>`;
  });
  s += g(both('url(#pTitle)'));
  s += g(`<path d="${bookInk()}" fill="${C.navy}"/>`);
  return s;
}
// EVERYTHING YOU'VE ____, / ON ONE TIMELINE. with the verb in a block of the light's colour
const LINE_U = 1.8;
const LINE_Y = [212, 240];
function verbLine(verb, col) {
  const pre = "EVERYTHING YOU'VE ";
  const full = `${pre}${verb},`;
  const w = textW(full, LINE_U);
  const x0 = FW / 2 - w / 2;
  const vx = x0 + [...pre].length * ADV * LINE_U;
  const vw = textW(verb, LINE_U);
  let s = osd(pre.trimEnd(), x0, LINE_Y[0], LINE_U);
  s += rect(vx - 5 + 3, LINE_Y[0] - 4 + 3, vw + 10, GH * LINE_U + 8, C.osdShadow, ' opacity=".5"');
  s += rect(vx - 5, LINE_Y[0] - 4, vw + 10, GH * LINE_U + 8, col);
  s += osd(verb, vx, LINE_Y[0], LINE_U, { fill: '#120b22', shadow: false });
  s += osd(',', vx + vw + 2 * LINE_U, LINE_Y[0], LINE_U);
  return s;
}
function titleLines() {
  let s = '';
  SEG.forEach((sg, k) => {
    if (k === 1) {
      // the audiobook: READ, mostly, but it wavers
      const waver = (t) => t >= 8.3 && t < 8.9;
      s += `<g${shown((t) => picSeg(t) === 1 && !waver(t))}>${verbLine('READ', sg.light)}</g>`;
      s += `<g${shown((t) => picSeg(t) === 1 && waver(t))}>${verbLine('LISTENED TO', sg.light)}</g>`;
      return;
    }
    s += `<g${shown((t) => picSeg(t) === k)}>${verbLine(sg.verb, sg.light)}</g>`;
  });
  s += osd('ON ONE TIMELINE.', FW / 2, LINE_Y[1], LINE_U, { anchor: 'middle' });
  return s;
}

// ------------------------------------------------------------------ recorded captions
// The camcorder's date stamp and the entry card are part of the recording.
const ST_U = 2.4;
const ST_X = 38;
const ST_Y = [506, 540];
function stamp() {
  let s = '';
  SEG.forEach((sg, k) => {
    if (k === 3) return;
    const vis = shown((t) => picSeg(t) === k);
    s += `<g${vis}>${osd(sg.stamp[0], ST_X, ST_Y[0], ST_U)}${osd(sg.stamp[1], ST_X, ST_Y[1], ST_U)}</g>`;
  });
  // SOMETIME IN: the stamp hunts for a date, cannot find one, and settles
  const guesses = ['JUN. 03 2017', 'SEP. 21 2015', 'APR. 30 2018', 'JAN. 08 2019', 'OCT. 14 2016', 'MAY. 27 2018', 'AUG. 02 2015', 'DEC. 19 2017', 'MAR. 11 2019'];
  const HUNT0 = 17.65;
  const HUNT1 = 19.9;
  guesses.forEach((gs, i) => {
    const vis = shown((t) => t >= HUNT0 && t < HUNT1 && Math.floor((t - HUNT0) * 6 + EPS) % guesses.length === i);
    s += `<g${vis}>${osd(gs, ST_X, ST_Y[1], ST_U)}</g>`;
  });
  s += `<g${shown((t) => t >= HUNT0 && t < HUNT1)}>${osd('--:--', ST_X, ST_Y[0], ST_U)}</g>`;
  s += `<g${shown((t) => t >= HUNT1 && t < MIDS[3])}>${osd('SOMETIME IN', ST_X, ST_Y[0], ST_U)}${osd('2015-2019', ST_X, ST_Y[1], ST_U)}</g>`;
  return s;
}
const CARD_R = 764;
const CARD_BOTTOM = 568;
function card(k) {
  const sg = SEG[k];
  const c = sg.card;
  const rows = [];
  rows.push({ str: c.head, u: 1.2, fill: C.dim, gap: 7 });
  rows.push({ str: c.title + (c.react ? ' ' + c.react : ''), u: 1.7, fill: '#ffffff', gap: 8 });
  for (const l of c.lines) rows.push({ str: l, u: 1.4, fill: sg.rim, gap: 6 });
  for (const l of c.note) rows.push({ str: l, u: 1.4, fill: '#e4dcff', gap: 6 });
  const pad = 13;
  const bar = 6;
  const wMax = Math.max(...rows.map((r) => textW(r.str, r.u)));
  const hTot = rows.reduce((a, r) => a + GH * r.u + r.gap, 0) - rows.at(-1).gap;
  const x0 = CARD_R - wMax - pad * 2 - bar;
  const y0 = CARD_BOTTOM - hTot - pad * 2;
  let s = rect(x0 + 4, y0 + 4, CARD_R - x0, CARD_BOTTOM - y0, '#05030a', ' opacity=".55"');
  s += rect(x0, y0, CARD_R - x0, CARD_BOTTOM - y0, '#0d0918', ' opacity=".84"');
  s += rect(x0, y0, bar, CARD_BOTTOM - y0, sg.kind) + rect(x0 + bar, y0, 1.5, CARD_BOTTOM - y0, sg.rim, ' opacity=".6"');
  let y = y0 + pad;
  for (const r of rows) {
    s += osd(r.str, x0 + bar + pad, y, r.u, { fill: r.fill, shOp: 0.6 });
    y += GH * r.u + r.gap;
  }
  return s;
}
function cards() {
  let s = '';
  SEG.forEach((sg, k) => {
    const vis = shown((t) => playIdx(t) === k);
    s += `<g${vis}>${card(k)}</g>`;
  });
  return s;
}

// ------------------------------------------------------------------ the deck's display
const OSD_U = 2.3;
const hms = (v) => `${Math.floor(v / 3600)}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
function counterAt(t) {
  const pi = playIdx(t);
  if (pi >= 0) return SEG[pi].counter + Math.floor(t - SEG[pi].t0 + EPS);
  const si = searchIdx(t);
  const s = SEARCH[si];
  const from = SEG[si].counter + Math.round(SEG[si].t1 - SEG[si].t0);
  const to = SEG[(si + 1) % 4].counter;
  const f = Math.min(1, Math.floor(((t - s.a) / (s.b - s.a)) * 4 + EPS) / 3);
  return Math.round(from + (to - from) * f);
}
function deckOsd() {
  let s = '';
  // PLAY: blinks for the first second after every search, then holds
  const play = shown((t) => {
    const pi = playIdx(t);
    if (pi < 0) return false;
    const d = t - SEG[pi].t0;
    return !(d >= 0.5 && d < 1.0);
  });
  s += `<g${play}>${osd('PLAY ▶', 38, 28, OSD_U)}</g>`;
  s += `<g${shown((t) => searchIdx(t) >= 0 && SEARCH[searchIdx(t)].dir < 0)}>${osd('◀◀ REW', 38, 28, OSD_U)}</g>`;
  s += `<g${shown((t) => searchIdx(t) === 3)}>${osd('▶▶ FF', 38, 28, OSD_U)}</g>`;
  // SP, except while the record is on, and the index count during a search
  s += `<g${shown((t) => playIdx(t) >= 0 && SEG[playIdx(t)].speed === 'SP')}>${osd('SP', 38, 58, OSD_U)}</g>`;
  s += `<g${shown((t) => playIdx(t) === 2)}>${osd('LP', 38, 58, OSD_U)}</g>`;
  SEARCH.forEach((se, i) => {
    s += `<g${shown((t) => searchIdx(t) === i)}>${osd(se.label, 38, 58, OSD_U)}</g>`;
  });
  // the tape counter, top right
  const values = new Set();
  for (let i = 0; i < LOOP * SPS; i++) values.add(counterAt(i / SPS));
  for (const v of values) s += `<g${shown((t) => counterAt(t) === v)}>${osd(hms(v), 762, 28, OSD_U, { anchor: 'end' })}</g>`;
  // the tracking meter, while the deck hunts for a date that was never written down
  const TR0 = 18.0;
  const TR1 = 21.4;
  const trOn = (t) => t >= TR0 && t < TR1;
  s += `<g${shown(trOn)}>${osd('TRACKING', 400, 26, 1.8, { anchor: 'middle' })}`;
  const cells = 15;
  const cw = 9;
  const cg = 3;
  const bw = cells * (cw + cg) - cg;
  const bx = 400 - bw / 2;
  let cellsSvg = '';
  for (let i = 0; i < cells; i++) cellsSvg += `<rect x="${n2(bx + i * (cw + cg))}" y="54" width="${cw}" height="12" fill="none" stroke="${C.osd}" stroke-width="1.6"/>`;
  s += `<g opacity=".9">${cellsSvg}</g>`;
  const path = [7, 6, 4, 3, 5, 8, 10, 11, 9, 6, 4, 6, 8, 7, 7];
  path.forEach((cell, i) => {
    const vis = shown((t) => trOn(t) && Math.min(path.length - 1, Math.floor((t - TR0) * 5 + EPS)) === i);
    s += `<g${vis}>${rect(bx + cell * (cw + cg) - 1, 52, cw + 2, 16, C.osd)}</g>`;
  });
  s += '</g>';
  return s;
}

// ------------------------------------------------------------------ tape defects
function noiseFrames(seed, w, h, count, nf, { x0 = 0, dark = 0.25, maxLen = 70, op = [0.35, 0.95] } = {}) {
  const r = mulberry32(seed);
  const frames = [];
  for (let f = 0; f < nf; f++) {
    const list = [];
    for (let i = 0; i < count; i++) {
      const len = 3 + r() * maxLen * (r() < 0.2 ? 2.2 : 1);
      const x = x0 + r() * w;
      const y = Math.floor(r() * h);
      const hh = r() < 0.7 ? 1 : 2;
      const fill = r() < dark ? '#241a3c' : '#ffffff';
      list.push({ x, y, w: len, h: hh, fill, op: op[0] + (op[1] - op[0]) * r() });
    }
    frames.push(rectPaths(list, 4));
  }
  return frames;
}
// Each frame is shown for 1/nf of the period, staggered so one is up at a time.
function flicker(frames, period) {
  const nf = frames.length;
  const kf = `@keyframes nz${nf}{0%{opacity:1}${n2(100 / nf)}%{opacity:0}100%{opacity:0}}.nz${nf}{animation-name:nz${nf};animation-timing-function:step-end;animation-iteration-count:infinite}`;
  if (!css.includes(kf)) css.push(kf);
  return frames.map((f, i) => `<g class="nz${nf}" style="animation-duration:${period}s;animation-delay:${n2((-i * period) / nf)}s" opacity="${i === 0 ? 1 : 0}">${f}</g>`).join('');
}

const BAND_H = 10;
const BAND_SHIFT = 16;
const BAND_PERIOD = 11;
const BAND_STILL = 452;
const HS_H = 12;
function trackingBand() {
  // a thin band crawls up the frame; inside it the picture is torn sideways and
  // streaked. The copy counter-moves with identical timing, so it stays registered.
  const steps = BAND_PERIOD * 15;
  css.push(`@keyframes band{from{transform:translate(0,${FH + 4}px)}to{transform:translate(0,${-BAND_H - 4}px)}}`);
  css.push(`@keyframes bandc{from{transform:translate(${BAND_SHIFT}px,${-FH - 4}px)}to{transform:translate(${BAND_SHIFT}px,${BAND_H + 4}px)}}`);
  css.push(`.band{animation:band ${BAND_PERIOD}s steps(${steps}) infinite}.bandc{animation:bandc ${BAND_PERIOD}s steps(${steps}) infinite}`);
  const nz = noiseFrames(404, FW, BAND_H, 20, 4, { maxLen: 90, dark: 0.15 });
  let s = `<g class="band" transform="translate(0 ${BAND_STILL})">`;
  s += `<g clip-path="url(#cBand)"><use href="#pic" class="bandc" transform="translate(${BAND_SHIFT} ${-BAND_STILL})"/>`;
  s += rect(0, 0, BAND_SHIFT, BAND_H, C.lifted) + rect(0, 0, FW, BAND_H, '#e9e4ff', ' opacity=".14"') + '</g>';
  s += flicker(nz, 0.5);
  s += rect(0, -1, FW, 1, '#ffffff', ' opacity=".2"');
  return s + '</g>';
}
// SOMETIME IN: a second, wider band of trouble while the deck hunts, then calmer.
const BIG_H = 34;
function badTracking() {
  const on = (t) => t >= 17.9 && t < MIDS[3];
  const yOf = (t) => Math.round(476 - (t - 17.9) * 30);
  const shiftOf = (t) => (t < 19.9 ? 26 + Math.round(8 * Math.sin(t * 9)) : 12);
  const outer = track((t) => (on(t) ? { y: yOf(t), o: 1 } : { y: 300, o: 0 }), { still: 0, sps: 8 });
  const inner = track((t) => (on(t) ? { x: shiftOf(t), y: -yOf(t) } : { x: 0, y: -300 }), { still: 0, sps: 8 });
  const nz = noiseFrames(909, FW, BIG_H, 38, 4, { maxLen: 120, dark: 0.3, op: [0.3, 0.9] });
  let s = `<g${outer}><g clip-path="url(#cBig)"><use href="#pic"${inner}/>`;
  s += rect(0, 0, FW, BIG_H, '#e9e4ff', ' opacity=".18"') + rect(0, BIG_H / 2, FW, 2, '#ffffff', ' opacity=".3"') + '</g>';
  s += flicker(nz, 0.375);
  s += rect(0, -1, FW, 1, '#ffffff', ' opacity=".3"') + rect(0, BIG_H, FW, 1, '#ffffff', ' opacity=".25"');
  return s + '</g>';
}
function headSwitch() {
  const y0 = FH - HS_H;
  const shifts = [14, 20, 12, 24, 17, 10, 22, 15, 19, 13, 25, 16];
  const k1 = shifts.map((v, i) => `${n2((i / shifts.length) * 100)}%{transform:translate(${v}px,0)}`).join('');
  const k2 = shifts.map((v, i) => `${n2((i / shifts.length) * 100)}%{transform:translate(${Math.round(v * 0.4)}px,0)}`).join('');
  css.push(`@keyframes hs1{${k1}100%{transform:translate(${shifts[0]}px,0)}}@keyframes hs2{${k2}100%{transform:translate(${Math.round(shifts[0] * 0.4)}px,0)}}`);
  css.push(`.hs1{animation:hs1 1.5s step-end infinite}.hs2{animation:hs2 1.5s step-end infinite}`);
  let s = `<g clip-path="url(#cHs2)"><use href="#pic" class="hs2" transform="translate(6 0)"/></g>`;
  s += `<g clip-path="url(#cHs1)"><use href="#pic" class="hs1" transform="translate(14 0)"/></g>`;
  s += rect(0, y0, FW, HS_H, '#f1ecff', ' opacity=".12"') + rect(0, y0, FW, 1, '#ffffff', ' opacity=".3"');
  const nz = noiseFrames(505, FW, HS_H, 32, 4, { maxLen: 80, dark: 0.35, op: [0.45, 1] });
  s += `<g transform="translate(0 ${y0})">${flicker(nz, 0.5)}</g>`;
  return s;
}
// The index search: noise bars sweeping the picture, the picture washed and slipping.
function searchBars() {
  const nz = noiseFrames(606, FW + 300, 30, 110, 2, { x0: -150, maxLen: 44, dark: 0.4, op: [0.5, 1] });
  const bar = `<rect x="-160" width="${FW + 320}" height="30" fill="#ebe6ff" opacity=".45"/><rect x="-160" y="30" width="${FW + 320}" height="8" fill="#1b1530" opacity=".25"/>${flicker(nz, 0.5)}`;
  const vis = shown((t) => searchIdx(t) >= 0);
  const mv = track((t) => {
    const si = searchIdx(t);
    if (si < 0) return { y: 0 };
    const f = (t - SEARCH[si].a) / (SEARCH[si].b - SEARCH[si].a);
    return { y: Math.round((SEARCH[si].dir < 0 ? f : 1 - f) * 260) };
  }, { sps: 12 });
  let s = `<g${vis}>${rect(0, 0, FW, FH, '#d8ccff', ' opacity=".1"')}<g${mv}>`;
  for (const y0 of [40, 330]) s += `<g transform="translate(0 ${y0})">${bar}</g>`;
  return s + '</g></g>';
}
// One-line white dropouts, more of them the older the recording.
function dropouts() {
  const at = [2.2, 7.4, 9.9, 12.9, 14.1, 15.8, 16.6, 18.6, 19.3, 20.4, 21.7, 22.5];
  let s = '';
  at.forEach((t0, i) => {
    const r = mulberry32(900 + i);
    const y = 70 + r() * 440;
    const x = r() * 620;
    const w = 40 + r() * 160;
    s += `<rect${shown((t) => t >= t0 && t < t0 + 2 / 24)} x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="1.6" fill="#fff"/>`;
  });
  return s;
}
function chromaNoise() {
  const r = mulberry32(321);
  const list = [];
  for (let i = 0; i < 120; i++) {
    const y = Math.floor(r() * FH);
    list.push({ x: r() * FW, y, w: 20 + r() * 140, h: 1, fill: r() < 0.5 ? '#ff5fd0' : '#5fe6ff', op: 0.05 + r() * 0.06 });
  }
  return rectPaths(list);
}
// The whole picture slips a pixel or two now and then; more in a search, more when old.
function jitter() {
  const r = mulberry32(55);
  const wob = [];
  for (let i = 0; i < 40; i++) wob.push(Math.round(r() * 8 - 4));
  return track((t) => {
    if (searchIdx(t) >= 0) return { x: wob[Math.floor(t * 12) % 40] };
    if (t >= 17.9 && t < 19.9) return { x: Math.round(wob[Math.floor(t * 8) % 40] * 0.6) };
    for (const [a, b, v] of [[2.4, 2.55, 2], [4.1, 4.2, -1], [8.0, 8.1, 1], [10.2, 10.3, -2], [13.3, 13.45, 2], [15.1, 15.2, -1], [16.4, 16.5, 2], [20.6, 20.75, -2], [22.1, 22.2, 1]]) if (t >= a && t < b) return { x: v };
    return { x: 0 };
  });
}
// Colour smear to the right: stronger on the older recordings.
function smear() {
  const wear = [0.13, 0.15, 0.24, 0.3];
  const a = track((t) => ({ o: wear[picSeg(t)] }));
  const b = track((t) => ({ o: n2(wear[picSeg(t)] * 0.4) }));
  return `<use href="#scene" transform="translate(4 0)"${a}/><use href="#scene" transform="translate(9 0)"${b}/>`;
}

// ------------------------------------------------------------------ assemble the banner
function banner() {
  const statics = wall() + windowView() + sleeve() + bookshelf() + booksLayer(false) + sideTableAndLamp() + tvSet() + cabinet() + sideboard() + floor();
  // ten years apart: the 2026 shelf has more books on it, and the plant has grown
  let per = `<g${shown((t) => picSeg(t) <= 1)}>${booksLayer(true)}${plant(true)}</g><g${shown((t) => picSeg(t) >= 2)}>${plant(false)}</g>`;
  SEG.forEach((sg, k) => {
    per += `<g${shown((t) => picSeg(t) === k)}>${recording(k)}</g>`;
  });
  // the foreground sofa sits in front of the lights, its rim drawn per recording
  const scene = statics + per;
  const sofaLayer = sofa();
  let rims = '';
  SEG.forEach((sg, k) => {
    rims += `<g${shown((t) => picSeg(t) === k)}>${sofaRim(k)}${props(k, sg.rim)}</g>`;
  });
  const grade = rect(0, 0, FW, FH, 'url(#gGrade)');
  const pic = `<g id="scene">${scene}${sofaLayer}${rims}${grade}</g><g id="ttl">${titleCard()}${titleLines()}</g><g id="rec">${stamp()}${cards()}</g>`;
  const deck = deckOsd();

  const { d: wmD } = wordmark();
  const lockupGap = 24;
  const gradT = SEG.map((sg, k) => `<linearGradient id="gT${k}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="128"><stop offset="0" stop-color="${C.tA}"/><stop offset=".46" stop-color="${C.tB}"/><stop offset=".72" stop-color="${sg.tint}"/><stop offset="1" stop-color="${sg.tint}"/></linearGradient>`).join('');
  const lightGrads = [
    `<radialGradient id="gL0" gradientUnits="userSpaceOnUse" cx="386" cy="344" r="440"><stop offset="0" stop-color="${SEG[0].light}" stop-opacity=".5"/><stop offset=".3" stop-color="${SEG[0].light}" stop-opacity=".22"/><stop offset=".7" stop-color="${SEG[0].light}" stop-opacity=".06"/><stop offset="1" stop-color="${SEG[0].light}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="gL1" gradientUnits="userSpaceOnUse" cx="231" cy="356" r="390"><stop offset="0" stop-color="${SEG[1].light}" stop-opacity=".55"/><stop offset=".3" stop-color="${SEG[1].light}" stop-opacity=".24"/><stop offset=".7" stop-color="${SEG[1].light}" stop-opacity=".06"/><stop offset="1" stop-color="${SEG[1].light}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="gL2" gradientUnits="userSpaceOnUse" cx="688" cy="398" r="400"><stop offset="0" stop-color="${SEG[2].light}" stop-opacity=".55"/><stop offset=".3" stop-color="${SEG[2].light}" stop-opacity=".24"/><stop offset=".7" stop-color="${SEG[2].light}" stop-opacity=".05"/><stop offset="1" stop-color="${SEG[2].light}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="gL3" gradientUnits="userSpaceOnUse" cx="386" cy="344" r="440"><stop offset="0" stop-color="${SEG[3].light}" stop-opacity=".46"/><stop offset=".3" stop-color="${SEG[3].light}" stop-opacity=".2"/><stop offset=".7" stop-color="${SEG[3].light}" stop-opacity=".05"/><stop offset="1" stop-color="${SEG[3].light}" stop-opacity="0"/></radialGradient>`,
  ].join('');
  const rimGrads = SEG.map((sg, k) => {
    const cx = [386, 231, 688, 386][k] / FW;
    return `<linearGradient id="gRim${k}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${FW}" y2="0"><stop offset="0" stop-color="${sg.rim}" stop-opacity="0"/><stop offset="${n2(Math.max(0.01, cx - 0.32))}" stop-color="${sg.rim}" stop-opacity="0"/><stop offset="${n2(cx)}" stop-color="${sg.rim}" stop-opacity=".95"/><stop offset="${n2(Math.min(0.99, cx + 0.32))}" stop-color="${sg.rim}" stop-opacity="0"/><stop offset="1" stop-color="${sg.rim}" stop-opacity="0"/></linearGradient>`;
  }).join('');

  const defs = `<defs>
<linearGradient id="gSofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f1738"/><stop offset=".25" stop-color="${C.sofa}"/><stop offset="1" stop-color="#0d0919"/></linearGradient>
<linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.wallTop}"/><stop offset="1" stop-color="${C.wallLow}"/></linearGradient>
<linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1033"/><stop offset=".65" stop-color="#1c2260"/><stop offset="1" stop-color="#3a2a70"/></linearGradient>
<linearGradient id="gVu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff7e2"/><stop offset="1" stop-color="#2fb89a"/></linearGradient>
<linearGradient id="gShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a8"/><stop offset="1" stop-color="#ffb24a"/></linearGradient>
<linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SEG[1].light}" stop-opacity=".34"/><stop offset="1" stop-color="${SEG[1].light}" stop-opacity="0"/></linearGradient>
<radialGradient id="gTube" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".6" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
<pattern id="pTube" width="4" height="2.4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".22"/></pattern>
<linearGradient id="gGrade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3cff" stop-opacity=".1"/><stop offset=".5" stop-color="#a03cff" stop-opacity="0"/><stop offset="1" stop-color="#ff3fb0" stop-opacity=".1"/></linearGradient>
${gradT}${lightGrads}${rimGrads}
<pattern id="pTitle" width="8" height="4" patternUnits="userSpaceOnUse"><rect width="8" height="1.2" fill="#2a1450" opacity=".14"/></pattern>
<radialGradient id="gVig" cx=".5" cy=".5" r=".74"><stop offset=".62" stop-color="#14082a" stop-opacity="0"/><stop offset="1" stop-color="#14082a" stop-opacity=".6"/></radialGradient>
<linearGradient id="gGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="pScan" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height="1.1" fill="#12062a" opacity=".16"/></pattern>
<clipPath id="cFrame"><rect width="${FW}" height="${FH}" rx="30"/></clipPath>
<clipPath id="cScr"><rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" rx="12"/></clipPath>
<clipPath id="cBand"><rect width="${FW}" height="${BAND_H}"/></clipPath>
<clipPath id="cBig"><rect width="${FW}" height="${BIG_H}"/></clipPath>
<clipPath id="cHs1"><rect y="${FH - HS_H / 2}" width="${FW}" height="${HS_H / 2}"/></clipPath>
<clipPath id="cHs2"><rect y="${FH - HS_H}" width="${FW}" height="${HS_H / 2}"/></clipPath>
<g id="lockup" fill-rule="evenodd"><path d="${BOOK_PAGES}"/><path transform="translate(${BOOK_W + lockupGap} 0)" d="${wmD}"/></g>
${[...usedGlyphs].map((ch) => `<path id="${gid(ch)}" d="${glyphPath(G[ch])}"/>`).join('\n')}
${[...lineDefs.values()].map(({ id, g }) => `<g id="${id}">${g}</g>`).join('\n')}
</defs>`;

  const jit = jitter();
  const body =
    `<rect width="${W}" height="${H}" rx="24" fill="${C.surround}"/>` +
    `<g transform="translate(${FX} ${FY})"><g clip-path="url(#cFrame)">` +
    rect(0, 0, FW, FH, C.lifted) +
    `<g${jit}><g id="pic">${pic}</g>${smear()}</g>` +
    chromaNoise() +
    trackingBand() +
    badTracking() +
    headSwitch() +
    searchBars() +
    dropouts() +
    rect(0, 0, FW, FH, 'url(#gVig)') +
    rect(0, 0, FW, FH, 'url(#gGlare)') +
    `<g>${deck}</g>` +
    rect(0, 0, FW, FH, 'url(#pScan)') +
    `</g><rect x=".75" y=".75" width="${FW - 1.5}" height="${FH - 1.5}" rx="30" fill="none" stroke="#2c2340" stroke-width="1.5"/></g>`;

  css.push(`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1.8s linear infinite}`);
  css.push(`@keyframes tw{0%,100%{opacity:.9}50%{opacity:.25}}.tw{animation:tw 6.5s ease-in-out infinite}`);
  css.push(`@keyframes st{0%{transform:translate(0,4px);opacity:0}35%{opacity:.6}100%{transform:translate(0,-12px);opacity:0}}.st{animation:st 2.6s linear infinite}`);
  css.push(`@keyframes vu1{0%,100%{transform:rotate(0deg)}20%{transform:rotate(38deg)}35%{transform:rotate(22deg)}55%{transform:rotate(50deg)}70%{transform:rotate(30deg)}85%{transform:rotate(44deg)}}.vu1{animation:vu1 1.3s steps(8) infinite}`);
  css.push(`@keyframes vu2{0%,100%{transform:rotate(6deg)}25%{transform:rotate(44deg)}40%{transform:rotate(18deg)}60%{transform:rotate(52deg)}80%{transform:rotate(26deg)}}.vu2{animation:vu2 1.1s steps(8) infinite}`);
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="MediaLog: everything you've watched, read, played, listened to, on one timeline. A home video of one living room, on a worn VHS tape.">
<title>MediaLog: everything you've watched, read, played, listened to, on one timeline</title>
<style>${css.join('\n')}</style>
${defs}
${body}
</svg>
`;
}

// ------------------------------------------------------------------ the colour bars
// The head of the tape, at 0:00:00: test bars before the programme, one per kind, in
// MediaLog's own colours. TV shows share blue with anime and comics share magenta with
// manga, so those bars carry two names. EVERYTHING, the first chip, is all of them.
const BARS = [
  ['MOVIES', '', KIND.movies],
  ['TV SHOWS', 'ANIME', KIND.tv],
  ['BOOKS', '', KIND.books],
  ['COMICS', 'MANGA', KIND.comics],
  ['GAMES', '', KIND.games],
  ['PODCASTS', '', KIND.podcasts],
  ['MUSIC', '', KIND.music],
  ['VIDEOS', '', KIND.videos],
];
function colourBars() {
  css.length = 0;
  usedGlyphs.clear();
  lineDefs.clear();
  trackCache.clear();
  uid = 0;
  const BW = 840;
  const BH = 150;
  const PX = 12;
  const PW = 816;
  const PH = 126;
  const TOP = 82;
  const MID = 10;
  const bw = PW / BARS.length;
  const LU = 1.1;
  const DUR = 9;
  let bars = '';
  let labels = '';
  BARS.forEach(([a, b, col], i) => {
    const x = i * bw;
    bars += rect(x, 0, bw + 0.5, TOP, col) + rect(x, 0, bw + 0.5, 3, '#ffffff', ' opacity=".18"');
    const y2 = TOP - 10 - GH * LU;
    if (b) {
      labels += osd(a, x + 9, y2 - GH * LU - 6, LU, { shOp: 0.55 }) + osd(b, x + 9, y2, LU, { shOp: 0.55 });
    } else labels += osd(a, x + 9, y2, LU, { shOp: 0.55 });
  });
  // the castellated strip: the colours in reverse, between lifted blacks
  BARS.forEach((bar, i) => {
    bars += rect(i * bw, TOP, bw + 0.5, MID, i % 2 ? '#0d0918' : BARS[BARS.length - 1 - i][2]);
  });
  // EVERYTHING: the app's navy chip, with every colour along its top
  const y3 = TOP + MID;
  const h3 = PH - y3;
  bars += rect(0, y3, bw * 2, h3, C.navy);
  for (let x = 0, i = 0; x < bw * 2; x += 6, i++) bars += rect(x, y3, 6.5, 5, BARS[i % BARS.length][2]);
  labels += osd('EVERYTHING', bw, y3 + 5 + (h3 - 5 - GH * 1.3) / 2, 1.3, { anchor: 'middle', shOp: 0.6 });
  // the ID box
  bars += rect(bw * 2, y3, bw * 4, h3, '#efeafb');
  labels += osd('MEDIALOG · EACH KIND HAS ITS COLOUR', bw * 4, y3 + (h3 - GH * LU) / 2, LU, { anchor: 'middle', fill: C.navy, shadow: false });
  // PLUGE: three blacks that are never quite black
  ['#07050c', '#140f24', '#261e3f'].forEach((c, i) => {
    bars += rect(bw * 6 + (i * bw * 2) / 3, y3, (bw * 2) / 3 + 0.5, h3, c);
  });
  // the deck's display: the very start of the tape
  const deck = osd('PLAY ▶', 12, 9, 1.5) + osd('SP', 12, 33, 1.5) + osd('0:00:00', PW - 12, 9, 1.5, { anchor: 'end' });

  // a thin tracking band, the torn bottom lines, the odd slip
  const BAND = 5;
  // (the band crawls up the bars only, so the EVERYTHING chip and the ID box stay clean)
  const B0 = TOP + MID - BAND;
  css.push(`@keyframes cb{from{transform:translate(0,${B0}px)}to{transform:translate(0,${-BAND - 2}px)}}@keyframes cbc{from{transform:translate(9px,${-B0}px)}to{transform:translate(9px,${BAND + 2}px)}}`);
  css.push(`.cb{animation:cb ${DUR}s steps(${DUR * 15}) infinite}.cbc{animation:cbc ${DUR}s steps(${DUR * 15}) infinite}`);
  const nz = noiseFrames(31, PW, BAND, 12, 4, { maxLen: 90, dark: 0.2 });
  // (the still frame parks the band on the castellated strip, clear of the labels)
  let band = `<g class="cb" transform="translate(0 ${TOP + 2})"><g clip-path="url(#cbBand)"><use href="#bars" class="cbc" transform="translate(9 ${-TOP - 2})"/></g>${flicker(nz, 0.5)}</g>`;
  const hsn = noiseFrames(37, PW, 6, 22, 4, { maxLen: 70, dark: 0.3, op: [0.45, 1] });
  css.push(`@keyframes cbh{0%{transform:translate(9px,0)}25%{transform:translate(14px,0)}50%{transform:translate(7px,0)}75%{transform:translate(12px,0)}}.cbh{animation:cbh 1s step-end infinite}`);
  band += `<g clip-path="url(#cbHs)"><use href="#bars" class="cbh" transform="translate(9 0)"/></g><g transform="translate(0 ${PH - 6})">${flicker(hsn, 0.5)}</g>`;
  const slip = track((t) => ({ x: (t >= 1.2 && t < 1.3) || (t >= 4.1 && t < 4.17) ? 2 : t >= 4.17 && t < 4.25 ? -1 : 0 }), { dur: DUR, still: 0 });
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

  const defs = `<defs>
<pattern id="pScan" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height="1.1" fill="#12062a" opacity=".2"/></pattern>
<radialGradient id="gVig" cx=".5" cy=".5" r=".8"><stop offset=".6" stop-color="#14082a" stop-opacity="0"/><stop offset="1" stop-color="#14082a" stop-opacity=".5"/></radialGradient>
<linearGradient id="gGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="cbFrame"><rect width="${PW}" height="${PH}" rx="12"/></clipPath>
<clipPath id="cbBand"><rect width="${PW}" height="${BAND}"/></clipPath>
<clipPath id="cbHs"><rect y="${PH - 6}" width="${PW}" height="6"/></clipPath>
${[...usedGlyphs].map((ch) => `<path id="${gid(ch)}" d="${glyphPath(G[ch])}"/>`).join('\n')}
${[...lineDefs.values()].map(({ id, g }) => `<g id="${id}">${g}</g>`).join('\n')}
</defs>`;
  const body =
    `<rect width="${BW}" height="${BH}" rx="18" fill="${C.surround}"/>` +
    `<g transform="translate(${PX} ${PX})"><g clip-path="url(#cbFrame)">` +
    rect(0, 0, PW, PH, C.lifted) +
    `<g${slip}><g id="bars"><g id="barcols">${bars}</g>${labels}</g><use href="#barcols" transform="translate(4 0)" opacity=".2"/></g>` +
    band +
    rect(0, 0, PW, PH, 'url(#gVig)') +
    rect(0, 0, PW, PH, 'url(#gGlare)') +
    deck +
    rect(0, 0, PW, PH, 'url(#pScan)') +
    `</g><rect x=".75" y=".75" width="${PW - 1.5}" height="${PH - 1.5}" rx="12" fill="none" stroke="#2c2340" stroke-width="1.5"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}" role="img" aria-label="Colour bars at the head of the tape, one per kind of media, in MediaLog's colours">
<title>MediaLog colour bars: each kind has its colour</title>
<style>${css.join('\n')}</style>
${defs}
${body}
</svg>
`;
}

mkdirSync(dirname(OUT), { recursive: true });
const svg = banner();
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
const svgBars = colourBars();
writeFileSync(OUT_BARS, svgBars);
console.log(`wrote ${OUT_BARS} (${(svgBars.length / 1024).toFixed(1)} KB)`);
