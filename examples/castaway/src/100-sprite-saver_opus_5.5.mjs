#!/usr/bin/env node
// CASTAWAY README header: "Sprite Screensaver Module" (100-sprite-saver_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock).
//   node examples/castaway/src/100-sprite-saver_opus_5.5.mjs
// writes
//   examples/castaway/assets/100-sprite-saver_opus_5.5.svg        (the saver)
//   examples/castaway/assets/100-sprite-saver_opus_5.5-panel.svg  (its control panel)
//
// The style (catalogue entry idle-08) is the early-90s modular screen saver:
// a black screen crossed by many copies of one small pixel sprite, all on
// the same diagonal at two or three speeds, each flipping through a few
// frames; a simpler companion sprite mixed in; a scrolling message line;
// and a control panel with a module list, a preview and a slider or two.
// No name, module, artwork or object of the real thing is used. There are
// no toasters, no toast and nothing with wings: the flock is sea turtles,
// which have flippers, and the companions are messages in bottles.
//
// The joke. Castaway is ten hours of a woman idling on a tiny island while
// every so often something happens. A screen saver is the same deal: a
// flock that never stops, and every so often a cameo. So the turtles take
// one flipper stroke per beat (80 BPM, the theme's tempo), and between them
// the island's gags drift through the open water under the title, one at a
// time (never over a letter of the name): her,
// walking over the water with an iced coffee ("she could leave any time"),
// the stray cat on her crate, and the coconut walking off with a hermit crab
// under it. The control panel lists the gags as modules, puts the schedule's
// real numbers on its sliders, and greys out the genre's famous slider as
// "Darkness: locked, always daytime" (a project rule: no night scenes).
//
// Every sprite, the title lettering and both bitmap faces are drawn here.
// Sprites are built from a few shapes (turtle, bottle) or typed in as pixel
// rows (cat, crab, her), shaded with darker rims, merged into one <path>
// per colour, defined once and placed with <use>.
//
// Motion is CSS only, all of it stepped: each sprite is a <g> whose
// translate runs in whole 2-px-left, 1-px-down steps (steps(n)), holding
// one <use> per frame whose opacity is switched by a step-end keyframe.
// Each lane's sprite leaves the screen and re-enters at the same moment,
// so every loop is seamless. Cameos share one 48 s timetable. Reduced
// motion switches every animation off; each sprite's transform attribute
// and base opacity hold its t = 0 pose, so the still is the opening frame,
// one pose per sprite, with the title, the message line and her mid-stride.
//
// Dev aid: SPRITE_SHEET=<path.svg> also writes a zoomed sheet of every
// sprite frame to that path (nothing else is written outside assets/).

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '100-sprite-saver_opus_5.5';
const SHEET = process.env.SPRITE_SHEET || '';

// ---------------------------------------------------------------- grid
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Array(w * h).fill(null); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : null; }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = c; }
}
function fromArt(rows, key, g = null, ox = 0, oy = 0) {
  const w = Math.max(...rows.map((r) => r.length));
  g = g || new Grid(w, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === '.' || ch === ' ') return;
    const c = key[ch];
    if (!c) throw new Error(`no colour for "${ch}"`);
    g.set(x + ox, y + oy, c);
  }));
  return g;
}
// merge runs: same colour, same x span in consecutive rows -> one rect
function rects(g) {
  const out = new Map();
  let open = new Map();
  for (let y = 0; y < g.h; y++) {
    const next = new Map();
    let x = 0;
    while (x < g.w) {
      const c = g.get(x, y);
      if (c === null) { x++; continue; }
      let x1 = x + 1;
      while (x1 < g.w && g.get(x1, y) === c) x1++;
      const k = `${c}|${x}|${x1}`;
      let r = open.get(k);
      if (r) r[3]++;
      else {
        r = [x, y, x1 - x, 1];
        if (!out.has(c)) out.set(c, []);
        out.get(c).push(r);
      }
      next.set(k, r);
      x = x1;
    }
    open = next;
  }
  return out;
}
function paths(g, ox = 0, oy = 0) {
  let s = '';
  for (const [c, rs] of rects(g)) {
    s += `<path fill="${c}" d="${rs.map(([x, y, w, h]) => `M${x + ox} ${y + oy}h${w}v${h}h-${w}z`).join('')}"/>`;
  }
  return s;
}
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------------------------------------------------------------- sprites
// Sea turtle, side view, swimming left. Built from a few shapes in body
// space, then shaded part by part: every part gets a darker rim where it
// meets the black or a part behind it, like hand-placed outline pixels.
const SKIN = { fill: '#5cbb6c', edge: '#1c6436', spot: '#b4e886', far: '#2d8048' };
const SHELL = { fill: '#cc8b3c', edge: '#5a3212', line: '#8c5523', hi: '#f6cd6c', rim: '#7b4719', dot: '#c88c46' };
const BELLY = { fill: '#f2dc9e', edge: '#a6864a' };
const CREAM = { fill: '#f6e9c9', edge: '#c3ad84' };
const TW = 30, TH = 22;
function turtle(frame, phones = false) {
  const fa = [-40, -6, 34, 12][frame];
  const ra = [30, 22, 12, 20][frame];
  const z = { far: 0, rear: 1, shell: 2, rim: 3, plas: 4, neck: 5, head: 6, front: 7 };
  const grp = { far: 'far', rear: 'rear', shell: 'shell', rim: 'shell', plas: 'plas', neck: 'head', head: 'head', front: 'front' };
  const inE = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  // a paddle: root at (x0, y0), pointing at ang degrees, widest a third of the way out
  const limb = (x, y, x0, y0, ang, len, w0, w1, bulge, bend = 0) => {
    const a = (ang * Math.PI) / 180;
    const dx = Math.cos(a), dy = Math.sin(a);
    const px = x - x0, py = y - y0;
    const s = px * dx + py * dy;
    if (s < -0.8 || s > len) return false;
    const u = Math.max(0, s) / len;
    const t = -px * dy + py * dx - bend * u * (1 - u) * len;
    return Math.abs(t) <= w0 + (w1 - w0) * u + bulge * Math.sin(Math.PI * Math.min(1, u * 1.4));
  };
  const lab = new Grid(TW, TH);
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const X = x + 0.5, Y = y + 0.5;
    let L = null;
    if (limb(X, Y, 13.4, 12.6, fa - 12, 10.5, 1.2, 0.4, 0.7, 0.12)) L = 'far';
    if (limb(X, Y, 25.4, 13.0, ra, 5.2, 1.4, 0.6, 0.5)) L = 'rear';
    if (inE(X, Y, 17.5, 11.6, 9.6, 5.8) && Y <= 11.6) L = 'shell';
    if (Y > 11.6 && Y <= 13.1 && inE(X, Y, 17.7, 11.9, 10.3, 3.0)) L = 'rim';
    if (Y > 13.1 && Y <= 14.6 && inE(X, Y, 17.0, 12.9, 7.8, 2.1)) L = 'plas';
    if (X >= 8.4 && X <= 12.6 && Y >= 11.2 && Y <= 14.6) L = 'neck';
    if (inE(X, Y, 6.0, 12.4, 4.3, 3.0)) L = 'head';
    if (limb(X, Y, 12.2, 13.8, fa, 12.5, 1.5, 0.45, 1.1, 0.18)) L = 'front';
    lab.set(x, y, L);
  }
  const g = new Grid(TW, TH);
  const edge = (x, y, L) => N4.some(([dx, dy]) => {
    const n = lab.get(x + dx, y + dy);
    return n === null || (grp[n] !== grp[L] && z[n] < z[L]);
  });
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const L = lab.get(x, y);
    if (!L) continue;
    const e = edge(x, y, L);
    let c;
    if (L === 'far') c = e ? SKIN.edge : SKIN.far;
    else if (L === 'rear' || L === 'front') {
      c = e ? SKIN.edge : SKIN.fill;
      if (!e && L === 'front' && (x * 3 + y * 5) % 7 === 0) c = SKIN.spot;
    } else if (L === 'shell') {
      const top1 = lab.get(x, y - 1) !== 'shell';
      const top2 = lab.get(x, y - 2) !== 'shell';
      if (e) c = SHELL.edge;
      else if ((top1 && x < 23) || (top2 && x < 17)) c = SHELL.hi;
      else if (y === 9 && x >= 10 && x <= 25) c = SHELL.line;
      else if (y < 9 && (x === 15 || x === 21)) c = SHELL.line;
      else if (y > 9 && (x === 12 || x === 18 || x === 24)) c = SHELL.line;
      else c = SHELL.fill;
    } else if (L === 'rim') c = e && lab.get(x, y + 1) === null ? SHELL.edge : x % 3 === 1 ? SHELL.dot : SHELL.rim;
    else if (L === 'plas') c = e ? BELLY.edge : BELLY.fill;
    else c = e ? SKIN.edge : SKIN.fill; // head, neck
    g.set(x, y, c);
  }
  // face: eye, a mouth line, two head spots
  g.set(4, 11, '#0c140e');
  g.set(2, 13, SKIN.edge);
  g.set(3, 13, SKIN.edge);
  g.set(7, 10, SKIN.spot);
  g.set(8, 13, SKIN.spot);
  if (phones) {
    // a cream band hugging the crown, and one cup over the ear
    for (let x = 3; x <= 8; x++) {
      let y = 0;
      while (y < TH && lab.get(x, y) !== 'head') y++;
      g.set(x, y - 1, x === 3 ? CREAM.edge : CREAM.fill);
    }
    for (const [x, y] of [[7, 11], [8, 11], [7, 12], [8, 12]]) g.set(x, y, CREAM.fill);
    for (const [x, y] of [[9, 11], [9, 12], [7, 13], [8, 13]]) g.set(x, y, CREAM.edge);
  }
  return g;
}

// Message in a bottle: sea glass, a rolled note, a cork. Tumbles end over
// end in eight 45-degree frames, sampled from the shape at each angle.
const GLASS = { fill: '#3fbfa4', edge: '#17685a', glint: '#e4fff4', note: '#f6e9c9', noteEdge: '#c3ad84', cork: '#b97b3e', corkEdge: '#6a4019' };
const BW = 17;
function bottle(frame) {
  const a = (frame * 45 * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a);
  const c = BW / 2;
  const lab = new Grid(BW, BW);
  for (let y = 0; y < BW; y++) for (let x = 0; x < BW; x++) {
    const X = x + 0.5 - c, Y = y + 0.5 - c;
    const u = X * ca + Y * sa, v = -X * sa + Y * ca;
    const av = Math.abs(v);
    let L = null;
    if (u >= -5.6 && u <= 1.8 && av <= 2.5 && !(u < -4.6 && av > 1.7)) L = 'glass';
    if (u > 1.8 && u <= 3.4 && av <= 2.5 - (u - 1.8) * 1.0) L = 'glass';
    if (u > 3.4 && u <= 5.0 && av <= 1.05) L = 'glass';
    if (u > 5.0 && u <= 6.6 && av <= 1.15) L = 'cork';
    if (u >= -3.9 && u <= 0.9 && av <= 1.0) L = 'note';
    if (u >= -2.6 && u <= -0.6 && v >= 1.4 && v <= 2.2) L = 'glint';
    lab.set(x, y, L);
  }
  const g = new Grid(BW, BW);
  for (let y = 0; y < BW; y++) for (let x = 0; x < BW; x++) {
    const L = lab.get(x, y);
    if (!L) continue;
    const out = N4.some(([dx, dy]) => lab.get(x + dx, y + dy) === null);
    let col;
    if (L === 'cork') col = out ? GLASS.corkEdge : GLASS.cork;
    else if (out) col = GLASS.edge;
    else if (L === 'note') col = GLASS.note;
    else if (L === 'glint') col = GLASS.glint;
    else col = GLASS.fill;
    g.set(x, y, col);
  }
  return g;
}

// The stray cat, grey tabby with a white chest, sitting on a crate that
// floats on its own small piece of sea. Four frames: the tail flicks, she
// blinks once.
const CAT_KEY = {
  k: '#2c2c30', g: '#9c9ca4', d: '#5c5c66', w: '#f2f2ee', E: '#c8e04a', p: '#f08aa0',
  K: '#3a2410', L: '#c9935a', M: '#a06a36', P: '#7a4c24', n: '#e8d8b0',
  s: '#7fd0f0', S: '#ffffff',
};
const CAT_BODY = [
  '...k......k.........',
  '..kgk....kgk........',
  '..kggkkkkggk........',
  '..kgdggggdgk........',
  '..kggdggdggk........',
  '..kgEggggEgk........',
  '..kgggppgggk........',
  '...kgwwwwgk.........',
  '....kwwwwk..........',
  '...kgwwwwgk.........',
  '..kggwwwwggk........',
  '..kgdwwwwdgk........',
  '..kggwwwwggk........',
  '..kgwwkkwwgk........',
];
const CRATE = [
  'KKKKKKKKKKKKKKKKKKKK',
  'KPnLLLLLLLLLLLLLLnPK',
  'KPPMMMMMMMMMMMMMMPPK',
  'KKKKKKKKKKKKKKKKKKKK',
  'KPnLLLLLLLLLLLLLLnPK',
  'KPPMMMMMMMMMMMMMMPPK',
  'KKKKKKKKKKKKKKKKKKKK',
  'KPnLLLLLLLLLLLLLLnPK',
  'KPPMMMMMMMMMMMMMMPPK',
  'KKKKKKKKKKKKKKKKKKKK',
];
const CAT_TAIL = [
  // tail up, curling
  ['...........kk.......', '...........kdk......', '...........kgk......', '..........kgk.......', '.........kdk........', '.........kgk........', '........kgk.........'],
  // tail swished out to the side
  ['....................', '....................', '....................', '....................', '..............kk....', '.........kkkkkgdk...', '........kgdgdgkk....'],
];
const WAVES = [
  ['.s..ss.....ss....s..', 'SsssssssssssssssssSs'],
  ['ss....s..ss....ss...', 'sSssssssssSsssssssss'],
];
const CW = 20, CH = 26;
function catCrate(frame) {
  const g = new Grid(CW, CH);
  const tail = CAT_TAIL[frame === 1 ? 1 : 0];
  fromArt(tail, CAT_KEY, g, 0, 6);
  fromArt(CAT_BODY, CAT_KEY, g, 2, 0);
  if (frame === 3) { g.set(4, 5, CAT_KEY.d); g.set(9, 5, CAT_KEY.d); }
  fromArt(CRATE, CAT_KEY, g, 0, 14);
  fromArt(WAVES[frame % 2], CAT_KEY, g, 0, 24);
  return g;
}

// A coconut walking off with a hermit crab under it.
const CRAB_KEY = { k: '#2a170a', b: '#8c5a2c', B: '#b67e44', R: '#ec5b33', r: '#a8341c', e: '#101010', w: '#ffffff' };
const NUT = [
  '.......kkkkk......',
  '.....kkbbbbbkk....',
  '....kbbBbbbbbbk...',
  '...kbbbbbbBbbbbk..',
  '...kbBbbbbbbbbbk..',
  '..kbbbbbbBbbbBbbk.',
  '..kbbbBbbbbbbbbbk.',
  '..kbbbbbbbbBbbbbk.',
  '...kbbBbbbbbbbbk..',
  '...kkbbbbbbbbbkk..',
  '.....kkkkkkkkk....',
];
const CRAB_FRONT = [
  'w.w...............',
  'e.e...............',
  'R.R...............',
  '.R................',
];
const CRAB_LEGS = [
  ['RR..R...R...R..R..', 'r....r...R...r..r.', '......r.......r...'],
  ['.R...R...R...R....', '.r...r...r...r....', '..r...r...r...r...'],
  ['..R..R...R..RR....', '.r..r...r....r...r', '...r.......r......'],
  ['.R...R...R...R....', '.r...r...r...r....', '..r...r...r...r...'],
];
const NW = 18, NH = 14;
function crabNut(frame) {
  const g = new Grid(NW, NH);
  fromArt(NUT, CRAB_KEY, g, 0, 0);
  fromArt(CRAB_FRONT, CRAB_KEY, g, 0, 5 + (frame % 2));
  fromArt(CRAB_LEGS[frame], CRAB_KEY, g, 0, 10);
  // claw
  g.set(0, 9, CRAB_KEY.R); g.set(1, 9, CRAB_KEY.R); g.set(0, 10 - (frame % 2), CRAB_KEY.r);
  return g;
}

// Her: brown hair in a low bun, cream headphones, coral tank top, cream
// shorts, bare feet. She is walking out over the water and back with an
// iced coffee ("she could leave any time"). Four frames, one step a beat.
const HER_KEY = {
  k: '#2b1a12', h: '#5a3218', H: '#83522a', s: '#f0bf98', S: '#c98a66', e: '#2b1a12',
  c: '#f2765f', C: '#c4503f', w: '#f6e9c9', W: '#c9b48c', l: '#cfe8f5', i: '#8a5428', L: '#ffffff', r: '#e2483f',
  o: '#6cc8ec', O: '#ffffff',
};
const HER_TOP = [
  '.....kkkk.....',
  '....khhhhkk...',
  '...khhhhHhhk..',
  '...khhhhhhwk..',
  '..khhhhhhhwhk.',
  '..kkshhhhwwwk.',
  '..ksesshhwWwkk',
  '.ksssshhhwwwhk',
  '..kssssshhhkhk',
  '..rksssshkkkk.',
  '..r.kkssk.....',
  'kLLLkkcccck...',
  'kllikssccck...',
  'kiiisscccCk...',
  'kiiik.ScccCk..',
  '.kkk..cccCCk..',
  '......kccCCk..',
  '.....kwwwwWk..',
  '.....kwwwwWWk.',
  '.....kwwkkWWk.',
];
const HER_LEGS = [
  ['.....kssk.kSk.', '....kssk..kSk.', '....ksk...kSSk', '...kssk....kSk', '...ksk.....kSk', '..kssk.....kSk', '.ksssk....kSSk', 'o.ooo.o..o.oo.'],
  ['.....kssSk....', '.....kssSk....', '.....kssSSk...', '.....kssk.SSk.', '.....kssk..kk.', '.....kssk.....', '....ksssk.....', '...o.ooo.o....'],
  ['.....kSSk.ksk.', '....kSSk..ksk.', '....kSk...kssk', '...kSSk....ksk', '...kSk.....ksk', '..kSSk.....ksk', '.kSSSk....kssk', '.o.ooo.o..oo.o'],
  ['.....kSSsk....', '.....kSSsk....', '.....kSSssk...', '.....kSSk.ssk.', '.....kSSk..kk.', '.....kSSk.....', '....kSSSk.....', '..o.ooo.o.....'],
];
const HW = 14, HH = 28;
function her(frame) {
  const g = new Grid(HW, HH);
  fromArt(HER_TOP, HER_KEY, g, 0, 0);
  fromArt(HER_LEGS[frame], HER_KEY, g, 0, 20);
  return g;
}

// ---------------------------------------------------------------- PRNG
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

// ---------------------------------------------------------------- fonts
// SYS: a bold bitmap face, cap height 8, 2-px stems. The core of this table
// is carried over from this repo's 60 one-bit desktop generator (drawn
// there, not copied from any system font); Q, X, Z and a few marks are new.
const SYS = {
  A: '..##..|.####.|##..##|##..##|######|##..##|##..##|##..##',
  B: '#####.|##..##|##..##|#####.|##..##|##..##|##..##|#####.',
  C: '.####.|##..##|##....|##....|##....|##....|##..##|.####.',
  D: '####..|##.##.|##..##|##..##|##..##|##..##|##.##.|####..',
  E: '######|##....|##....|#####.|##....|##....|##....|######',
  F: '######|##....|##....|#####.|##....|##....|##....|##....',
  G: '.####.|##..##|##....|##....|##.###|##..##|##..##|.#####',
  H: '##..##|##..##|##..##|######|##..##|##..##|##..##|##..##',
  I: '##|##|##|##|##|##|##|##',
  J: '....##|....##|....##|....##|....##|##..##|##..##|.####.',
  K: '##..##|##.##.|####..|###...|####..|##.##.|##..##|##..##',
  L: '##....|##....|##....|##....|##....|##....|##....|######',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##|##...##',
  N: '##...##|###..##|####.##|##.####|##..###|##...##|##...##|##...##',
  O: '.####.|##..##|##..##|##..##|##..##|##..##|##..##|.####.',
  P: '#####.|##..##|##..##|##..##|#####.|##....|##....|##....',
  Q: '.####.|##..##|##..##|##..##|##..##|##.###|##..##|.###.#',
  R: '#####.|##..##|##..##|##..##|#####.|##.##.|##..##|##..##',
  S: '.####.|##..##|##....|.####.|....##|....##|##..##|.####.',
  T: '######|..##..|..##..|..##..|..##..|..##..|..##..|..##..',
  U: '##..##|##..##|##..##|##..##|##..##|##..##|##..##|.####.',
  V: '##..##|##..##|##..##|##..##|##..##|.####.|.####.|..##..',
  W: '##...##|##...##|##...##|##.#.##|##.#.##|#######|###.###|.#...#.',
  X: '##..##|##..##|.####.|..##..|..##..|.####.|##..##|##..##',
  Y: '##..##|##..##|##..##|.####.|..##..|..##..|..##..|..##..',
  Z: '######|....##|...##.|..##..|.##...|##....|##....|######',
  a: '......|......|.####.|....##|.#####|##..##|##..##|.#####',
  b: '##....|##....|#####.|##..##|##..##|##..##|##..##|#####.',
  c: '.....|.....|.####|##...|##...|##...|##...|.####',
  d: '....##|....##|.#####|##..##|##..##|##..##|##..##|.#####',
  e: '......|......|.####.|##..##|######|##....|##....|.####.',
  f: '..###|.##..|####.|.##..|.##..|.##..|.##..|.##..',
  g: '......|......|.#####|##..##|##..##|##..##|##..##|.#####|....##|.####.',
  h: '##....|##....|#####.|##..##|##..##|##..##|##..##|##..##',
  i: '##|..|##|##|##|##|##|##',
  j: '...##|.....|...##|...##|...##|...##|...##|...##|##.##|.###.',
  k: '##....|##....|##..##|##.##.|####..|#####.|##.##.|##..##',
  l: '##|##|##|##|##|##|##|##',
  m: '........|........|#######.|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##',
  n: '......|......|#####.|##..##|##..##|##..##|##..##|##..##',
  o: '......|......|.####.|##..##|##..##|##..##|##..##|.####.',
  p: '......|......|#####.|##..##|##..##|##..##|##..##|#####.|##....|##....',
  q: '......|......|.#####|##..##|##..##|##..##|##..##|.#####|....##|....##',
  r: '.....|.....|##.##|####.|###..|##...|##...|##...',
  s: '......|......|.####.|##....|.####.|....##|....##|#####.',
  t: '.##..|.##..|#####|.##..|.##..|.##..|.##..|..###',
  u: '......|......|##..##|##..##|##..##|##..##|##..##|.#####',
  v: '......|......|##..##|##..##|##..##|##..##|.####.|..##..',
  w: '........|........|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|.######.',
  x: '......|......|##..##|##..##|.####.|.####.|##..##|##..##',
  y: '......|......|##..##|##..##|##..##|##..##|##..##|.#####|....##|.####.',
  z: '......|......|######|...##.|..##..|.##...|##....|######',
  0: '.####.|##..##|##..##|##.###|###.##|##..##|##..##|.####.',
  1: '..##|.###|####|..##|..##|..##|..##|..##',
  2: '.####.|##..##|....##|...##.|..##..|.##...|##....|######',
  3: '.####.|##..##|....##|..###.|....##|....##|##..##|.####.',
  4: '...##.|..###.|.####.|##.##.|##.##.|######|...##.|...##.',
  5: '######|##....|#####.|....##|....##|....##|##..##|.####.',
  6: '..###.|.##...|##....|#####.|##..##|##..##|##..##|.####.',
  7: '######|....##|...##.|...##.|..##..|..##..|.##...|.##...',
  8: '.####.|##..##|##..##|.####.|##..##|##..##|##..##|.####.',
  9: '.####.|##..##|##..##|##..##|.#####|....##|...##.|.###..',
  '.': '..|..|..|..|..|..|##|##',
  ',': '..|..|..|..|..|..|##|##|.#|#.',
  ':': '..|..|##|##|..|..|##|##',
  '-': '....|....|....|....|####|....|....|....',
  '/': '.....##|....##.|....##.|...##..|..##...|.##....|.##....|##.....',
  "'": '##|##|#.|..|..|..|..|..',
  '!': '##|##|##|##|##|##|..|##',
  '?': '.####.|##..##|....##|...##.|..##..|..##..|......|..##..',
  '(': '.##|##.|##.|##.|##.|##.|##.|.##',
  ')': '##.|.##|.##|.##|.##|.##|.##|##.',
  '*': '.......|...#...|...#...|..###..|#######|..###..|...#...|...#...',
};
// BODY: a small regular face, cap height 7, 1-px stems (same provenance).
const BODY = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#|#|#|#|#|#|#',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  4: '..#.|.##.|#.#.|#.#.|####|..#.|..#.',
  5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.',
  7: '####|...#|..#.|..#.|.#..|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  '-': '...|...|...|###|...|...|...',
  '/': '...#|...#|..#.|..#.|.#..|.#..|#...',
  ':': '.|.|#|.|.|.|#',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  ',': '.|.|.|.|.|.|#|#',
  "'": '#|#|.|.|.|.|.',
  '+': '...|...|.#.|###|.#.|...|...',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '!': '#|#|#|#|#|.|#',
  '%': '#...#|#..#.|..#..|.#...|#..#.|#...#|.....',
  '~': '.....|.....|.#..#|#.##.|.....|.....|.....',
  '<': '...|..#|.#.|#..|.#.|..#|...',
  '>': '...|#..|.#.|..#|.#.|#..|...',
  '=': '...|...|###|...|###|...|...',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  J: '...#|...#|...#|...#|...#|#..#|.##.',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
};
function makeFont(table, { space, gap = 1 }) {
  const cache = new Map();
  const glyph = (ch) => {
    if (!cache.has(ch)) {
      const src = table[ch];
      if (src === undefined) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
      const rows = src.split('|');
      const w = rows[0].length;
      rows.forEach((r) => { if (r.length !== w) throw new Error(`glyph ${ch} row "${r}" is not ${w} wide`); });
      cache.set(ch, rows);
    }
    return cache.get(ch);
  };
  const adv = (ch) => (ch === ' ' ? space : glyph(ch)[0].length + gap);
  return { glyph, adv, width: (str) => [...str].reduce((w, ch) => w + adv(ch), 0) - gap };
}
const sys = makeFont(SYS, { space: 4 });
const body = makeFont(BODY, { space: 3 });
// draw text with its cap top at y; ink is a colour or (char, index) => colour
function text(g, font, str, x, y, ink) {
  let cx = x;
  [...str].forEach((ch, n) => {
    if (ch !== ' ') {
      const c = typeof ink === 'function' ? ink(ch, n) : ink;
      font.glyph(ch).forEach((row, j) => [...row].forEach((b, i) => { if (b === '#') g.set(cx + i, y + j, c); }));
    }
    cx += font.adv(ch);
  });
  return cx - x;
}
// a 1-px keyline around everything already drawn (8-neighbour)
function keyline(g, ink = '#000000') {
  const add = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.get(x, y) !== null) continue;
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
      const n = g.get(x + dx, y + dy);
      if (n !== null && n !== ink) { near = true; break; }
    }
    if (near) add.push([x, y]);
  }
  for (const [x, y] of add) g.set(x, y, ink);
  return g;
}

// ---------------------------------------------------------------- the title
// Block capitals on a 2x2-pixel cell grid, 3-cell stems, cut corners. Lit
// like a period chrome logo, but in flat bands of island colour: a cream
// rim, sun yellow, a pale horizon line, then orange and coral, on a plum
// block shadow and a black keyline.
const TITLE_GLYPHS = {
  C: ['..########', '.#########', '##########', '###.......', '###.......', '###.......', '###.......', '###.......', '###.......', '###.......', '##########', '.#########', '..########'],
  A: ['..######..', '.########.', '##########', '###....###', '###....###', '##########', '##########', '##########', '###....###', '###....###', '###....###', '###....###', '###....###'],
  S: ['..########', '.#########', '##########', '###.......', '###.......', '#########.', '##########', '.#########', '.......###', '.......###', '##########', '#########.', '########..'],
  T: ['##########', '##########', '##########', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...'],
  W: ['###.......###', '###.......###', '###.......###', '###.......###', '###..###..###', '###..###..###', '###..###..###', '###..###..###', '###..###..###', '###..###..###', '#############', '.###########.', '..####.####..'],
  Y: ['###....###', '###....###', '###....###', '###....###', '####..####', '##########', '.########.', '..######..', '...####...', '...####...', '...####...', '...####...', '...####...'],
};
const TITLE_BANDS = [[0, '#fff6d6'], [2, '#ffcf3a'], [12, '#fff1b4'], [13, '#ff913a'], [19, '#f05a4c']];
const TITLE_SHADOW = '#6b2a66';
function titleGrid(word) {
  const cell = 2, gap = 2 * cell, depth = 3;
  const wide = [...word].reduce((w, ch) => w + TITLE_GLYPHS[ch][0].length * cell + gap, -gap);
  const hgt = 13 * cell;
  const mask = new Grid(wide, hgt);
  let x0 = 0;
  for (const ch of word) {
    TITLE_GLYPHS[ch].forEach((row, r) => [...row].forEach((b, c) => {
      if (b !== '#') return;
      for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) mask.set(x0 + c * cell + dx, r * cell + dy, 1);
    }));
    x0 += TITLE_GLYPHS[ch][0].length * cell + gap;
  }
  const g = new Grid(wide + depth + 2, hgt + depth + 2);
  for (let d = depth; d >= 1; d--) for (let y = 0; y < hgt; y++) for (let x = 0; x < wide; x++) if (mask.get(x, y)) g.set(x + 1 + d, y + 1 + d, TITLE_SHADOW);
  for (let y = 0; y < hgt; y++) for (let x = 0; x < wide; x++) {
    if (!mask.get(x, y)) continue;
    let c = TITLE_BANDS[0][1];
    for (const [from, col] of TITLE_BANDS) if (y >= from) c = col;
    g.set(x + 1, y + 1, c);
  }
  return keyline(g);
}

// ---------------------------------------------------------------- the saver
const PX = 4; // svg units per screen pixel
const SW = 300, SH = 148; // the screen, in pixels
const SX = 40, SY = 32; // screen origin in svg units
const VB_W = 1280, VB_H = 688;
const BEAT = 0.75; // 80 BPM
const fmt = (n) => (Math.round(n * 1000) / 1000).toString();
// Frame-flip delays are multiples of 3/32 s, so they are written exactly
// (5 places): rounded to 3, neighbouring frames would overlap or leave a gap
// for half a millisecond at every switch, and a frame caught on that edge
// shows two poses at once (or none).
const fmtx = (n) => (Math.round(n * 100000) / 100000).toString();

// Every sprite rides a straight diagonal: 2 px left and 1 px down per step,
// in from the top or right edge, out at the bottom or left edge. A lane is
// the line x + 2y = c; its sprite re-enters the moment it leaves, so each
// lane always holds exactly one sprite and the screen never looks empty.
// The first step starts wholly off screen and the last step ends wholly off
// screen, so nothing pops at an edge when a lane wraps round.
function lanePath(c, w, h, scrW = SW, scrH = SH) {
  const yIn = Math.max(-h, Math.floor((c - scrW) / 2));
  const yOff = Math.min(scrH, Math.ceil((c + w) / 2));
  return { x0: c - 2 * yIn, y0: yIn, n: yOff - yIn + 1 };
}

// ink bounds of a sprite over all its frames, [x0, y0, x1, y1] inclusive
function inkBox(grids) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const g of grids) for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.get(x, y) === null) continue;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}
const at = ([x0, y0, x1, y1], dx, dy) => [x0 + dx, y0 + dy, x1 + dx, y1 + dy];
const hits = (a, b, m = 0) => a[0] <= b[2] + m && b[0] <= a[2] + m && a[1] <= b[3] + m && b[1] <= a[3] + m;
const onScreen = (b) => hits(b, [0, 0, SW - 1, SH - 1]);

// the flock: t = turtle, h = the turtle in headphones, b = a bottle
const FLOCK_KINDS = [...'ttbtttbtthttbttbtttbtt'];
const FLOCK = { turtles: FLOCK_KINDS.filter((k) => k !== 'b').length, bottles: FLOCK_KINDS.filter((k) => k === 'b').length };

function buildSaver() {
  const rnd = mulberry32(1992);
  const defs = [];
  const css = [];
  const sprite = (id, g) => defs.push(`<g id="${id}">${paths(g)}</g>`);
  [0, 1, 2, 3].forEach((f) => sprite(`t${f}`, turtle(f)));
  [0, 1, 2, 3].forEach((f) => sprite(`h${f}`, turtle(f, true)));
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((f) => sprite(`b${f}`, bottle(f)));
  [0, 1, 2, 3].forEach((f) => sprite(`c${f}`, catCrate(f)));
  [0, 1, 2, 3].forEach((f) => sprite(`n${f}`, crabNut(f)));
  [0, 1, 2, 3].forEach((f) => sprite(`g${f}`, her(f)));

  // Frame flipping: class v{kind}{slot}; slot k is shown during the k-th
  // part of the kind's cycle. A sprite's frame f uses slot (f - phase).
  // Turtles take one stroke per beat; she takes one step per beat.
  const cyc = { t: [4, BEAT], h: [4, BEAT], b: [8, 2 * BEAT], c: [4, 4 * BEAT], n: [4, BEAT / 2], g: [4, 2 * BEAT] };
  const used = new Set();
  const frameClass = (kind, slot) => {
    const [nf, dur] = cyc[kind];
    const name = `v${kind}${slot}`;
    if (!used.has(name)) {
      used.add(name);
      css.push(`.${name}{animation:q${nf} ${fmtx(dur)}s step-end infinite;animation-delay:${fmtx(-dur + (slot * dur) / nf)}s;opacity:${slot === 0 ? 1 : 0}}`);
    }
    return name;
  };
  css.push('@keyframes q4{0%{opacity:1}25%,100%{opacity:0}}');
  css.push('@keyframes q8{0%{opacity:1}12.5%,100%{opacity:0}}');
  const frames = (kind, phase) => {
    const nf = cyc[kind][0];
    let s = '';
    for (let f = 0; f < nf; f++) s += `<use href="#${kind}${f}" class="${frameClass(kind, (f - phase + nf) % nf)}"/>`;
    return s;
  };

  // the title, fixed in the middle
  const tg = titleGrid('CASTAWAY');
  const tx = Math.round((SW - tg.w) / 2), ty = 40;

  // Cameos: one at a time, on their own timetable, in the open water under
  // the title. A 48 s loop (16 bars): her with the iced coffee, the cat on
  // her crate, the crab in the coconut. Each crosses once, then waits off
  // screen. Their lanes start right of the title's last column on every row
  // the title fills, so a cameo never covers a letter of the name.
  const CAMEO_LOOP = 48;
  const clear = tx + tg.w + 2 * (ty + tg.h - 1);
  const cameos = [
    { kind: 'g', w: HW, h: HH, c: clear + 2, speed: 10, start: -4.5 },
    { kind: 'c', w: CW, h: CH, c: clear + 6, speed: 8, start: 13 },
    { kind: 'n', w: NW, h: NH, c: clear + 16, speed: 12, start: 31 },
  ];
  // where each cameo stands at t = 0 (also its reduced-motion pose)
  cameos.forEach((cm) => {
    Object.assign(cm, lanePath(cm.c, cm.w, cm.h));
    cm.k = cm.start > 0 ? cm.n : Math.min(cm.n, Math.floor(-cm.start * cm.speed));
  });

  // The opening frame is also the reduced-motion still, so it is kept
  // tidy: no flock sprite starts on the message line or on a cameo. A lane
  // whose drawn start lands on one is moved along its own diagonal to the
  // nearest step that is clear of those, of the title and of every other
  // sprite. Only the start moves; lanes, speeds and the PRNG draws do not.
  const MY = SH - 19, MSPEED = 24;
  const INK = {
    t: inkBox([0, 1, 2, 3].map((f) => turtle(f))), h: inkBox([0, 1, 2, 3].map((f) => turtle(f, true))),
    b: inkBox([0, 1, 2, 3, 4, 5, 6, 7].map(bottle)),
    g: inkBox([0, 1, 2, 3].map(her)), c: inkBox([0, 1, 2, 3].map(catCrate)), n: inkBox([0, 1, 2, 3].map(crabNut)),
  };
  const ticker = [0, MY - 1, SW - 1, MY + 10];
  const titleBox = [tx, ty, tx + tg.w - 1, ty + tg.h - 1];
  const cameoBoxes = cameos.map((cm) => at(INK[cm.kind], cm.x0 - 2 * cm.k, cm.y0 + cm.k)).filter(onScreen);

  // lanes for the flock: 17 turtles (one wearing headphones) and 5 bottles
  const kinds = FLOCK_KINDS;
  const speeds = { slow: 8, mid: 11, fast: 15 };
  const tiers = ['mid', 'fast', 'slow', 'mid', 'slow', 'fast', 'mid', 'slow', 'mid', 'fast', 'slow', 'mid', 'fast', 'slow', 'mid', 'slow', 'fast', 'mid', 'slow', 'fast', 'mid', 'slow'];
  const cMin = -60, cMax = SW + 2 * SH - 8;
  const flock = kinds.map((kind, i) => {
    const [w, h] = kind === 'b' ? [BW, BW] : [TW, TH];
    const c = Math.round(cMin + ((i + 0.5) * (cMax - cMin)) / kinds.length + (rnd() - 0.5) * 12);
    const { x0, y0, n } = lanePath(c, w, h);
    const k0 = Math.floor(rnd() * n);
    const phase = Math.floor(rnd() * cyc[kind][0]);
    return { kind, i, x0, y0, n, k0, phase };
  });
  const boxOf = (s, k = s.k0) => at(INK[s.kind], s.x0 - 2 * k, s.y0 + k);
  const blocked = (b) => hits(b, ticker, 2) || cameoBoxes.some((o) => hits(b, o, 6));
  const inside = (b) => b[0] >= 0 && b[1] >= 0 && b[2] < SW && b[3] < SH;
  flock.forEach((s) => {
    if (!onScreen(boxOf(s)) || !blocked(boxOf(s))) return;
    // the nearest clear step wholly on screen; failing that (a lane that
    // only crosses the screen through the message line), the nearest step
    // wholly off it, so that sprite has just left as the still is taken
    const free = (k) => {
      const b = boxOf(s, k);
      return inside(b) && !blocked(b) && !hits(b, titleBox, 2) &&
        flock.every((o) => o === s || !hits(b, boxOf(o), 2));
    };
    const away = (k) => !onScreen(boxOf(s, k));
    for (const ok of [free, away]) {
      for (let d = 1; d < s.n; d++) {
        const k = [s.k0 + d, s.k0 - d].find((j) => j >= 0 && j < s.n && ok(j));
        if (k !== undefined) { s.k0 = k; return; }
      }
    }
  });

  let lanes = '';
  flock.forEach(({ kind, i, x0, y0, n, k0, phase }) => {
    const sp = speeds[kind === 'b' && tiers[i] === 'fast' ? 'mid' : tiers[i]];
    const dur = n / sp;
    const delay = -((k0 + 0.5) / n) * dur;
    const name = `L${i}`;
    css.push(`@keyframes ${name}{from{transform:translate(${x0}px,${y0}px)}to{transform:translate(${x0 - 2 * n}px,${y0 + n}px)}}`);
    css.push(`.${name}{animation:${name} ${fmt(dur)}s steps(${n}) infinite;animation-delay:${fmt(delay)}s}`);
    lanes += `<g class="${name}" transform="translate(${x0 - 2 * k0} ${y0 + k0})">${frames(kind, phase)}</g>`;
  });

  let cams = '';
  cameos.forEach((cm, i) => {
    const { x0, y0, n, k } = cm;
    const dur = n / cm.speed;
    const pct = (dur / CAMEO_LOOP) * 100;
    const name = `C${i}`;
    css.push(`@keyframes ${name}{0%{transform:translate(${x0}px,${y0}px);animation-timing-function:steps(${n},end)}${fmt(pct)}%,100%{transform:translate(${x0 - 2 * n}px,${y0 + n}px)}}`);
    const delay = cm.start > 0 ? cm.start - CAMEO_LOOP : cm.start;
    css.push(`.${name}{animation:${name} ${CAMEO_LOOP}s linear infinite;animation-delay:${fmt(delay)}s}`);
    // static position (reduced motion): where it is at t = 0
    cams += `<g class="${name}" transform="translate(${x0 - 2 * k} ${y0 + k})">${frames(cm.kind, 0)}</g>`;
  });

  const title =`<g transform="translate(${tx} ${ty})">${paths(tg)}</g>`;

  // glints: a small star sparkles on a letter, one per bar, in turn
  const glintSmall = fromArt(['.w.', 'www', '.w.'], { w: '#ffffff' });
  const glintBig = fromArt(['...w...', '...w...', '..www..', 'wwwwwww', '..www..', '...w...', '...w...'], { w: '#ffffff' });
  defs.push(`<g id="gs">${paths(glintSmall, -1, -1)}</g><g id="gb">${paths(glintBig, -3, -3)}</g>`);
  const GL = 9; // three bars
  css.push('@keyframes gS{0%{opacity:1}2%{opacity:0}4%{opacity:1}6%,100%{opacity:0}}');
  css.push('@keyframes gB{0%{opacity:0}2%{opacity:1}4%,100%{opacity:0}}');
  css.push(`.gS{animation:gS ${GL}s step-end infinite;opacity:0}.gB{animation:gB ${GL}s step-end infinite;opacity:0}`);
  let glints = '';
  [[8, 6], [96, 4], [178, 18]].forEach(([gx, gy], i) => {
    const d = fmt(-GL + i * 3 + 0.75);
    glints += `<g transform="translate(${tx + gx} ${ty + gy})"><use href="#gs" class="gS" style="animation-delay:${d}s"/><use href="#gb" class="gB" style="animation-delay:${d}s"/></g>`;
  });

  // the scrolling message line
  const MSG = 'CASTAWAY * a lo-fi island video for very long afternoons * she idles, nodding to the music, and every so often something happens * a bottle washes straight back * a hermit crab walks off wearing a coconut * more than 90 activities, every one on the beat * every sound synthesized from code * python tools/serve.py * ';
  const mw = sys.width(MSG) + sys.adv(' ');
  const mg = new Grid(mw + 2, 13);
  text(mg, sys, MSG, 1, 1, (ch, n) => (ch === '*' ? '#ff7a5c' : n < 8 ? '#ffd84a' : '#f6efd9'));
  keyline(mg);
  defs.push(`<g id="msg">${paths(mg, -1, -1)}</g>`);
  css.push(`@keyframes msg{from{transform:translate(0px,0px)}to{transform:translate(-${mw}px,0px)}}`);
  css.push(`.msg{animation:msg ${fmt(mw / MSPEED)}s steps(${mw}) infinite}`);
  const msg = `<g transform="translate(6 ${MY})"><g class="msg"><use href="#msg"/><use href="#msg" x="${mw}"/></g></g>`;

  // the monitor
  const bez = [];
  bez.push(`<rect x="1" y="1" width="${VB_W - 2}" height="${VB_H - 2}" rx="28" fill="#d9d3c5" stroke="#9c9586" stroke-width="2"/>`);
  bez.push(`<path d="M30 ${VB_H - 4}H${VB_W - 30}" stroke="#b9b2a2" stroke-width="3"/>`);
  bez.push(`<path d="M24 6H${VB_W - 24}" stroke="#f3efe6" stroke-width="3"/>`);
  bez.push(`<rect x="${SX - 12}" y="${SY - 12}" width="${SW * PX + 24}" height="${SH * PX + 24}" rx="16" fill="#a8a192"/>`);
  bez.push(`<rect x="${SX - 10.5}" y="${SY - 10.5}" width="${SW * PX + 24}" height="${SH * PX + 24}" rx="16" fill="none" stroke="#ece7dc" stroke-width="2"/>`);
  bez.push(`<rect x="${SX - 4}" y="${SY - 4}" width="${SW * PX + 8}" height="${SH * PX + 8}" rx="12" fill="#3a3832"/>`);
  // a little embossed maker's plate at left, a power light and two
  // thumbwheels at right
  const plate = new Grid(80, 9);
  text(plate, body, 'SEA STATE', 0, 1, '#6d675a');
  text(plate, body, '14C', 56, 1, '#8b8474');
  const by = SY + SH * PX + 22;
  bez.push(`<g transform="translate(${SX + 4} ${by}) scale(3)">${paths(plate)}</g>`);
  bez.push(`<rect x="${VB_W - 236}" y="${by + 2}" width="14" height="14" rx="3" fill="#2f9e4f" stroke="#7d776a" stroke-width="2"/>`);
  bez.push(`<rect x="${VB_W - 234}" y="${by + 4}" width="5" height="4" fill="#9af0b0"/>`);
  for (const x of [VB_W - 196, VB_W - 124]) {
    bez.push(`<rect x="${x}" y="${by + 1}" width="56" height="16" rx="5" fill="#bdb6a6" stroke="#8f887a" stroke-width="2"/>`);
    for (let k = 0; k < 6; k++) bez.push(`<rect x="${x + 7 + k * 8}" y="${by + 4}" width="3" height="10" fill="#9a9384"/>`);
  }

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}" shape-rendering="crispEdges">`);
  out.push('<title>CASTAWAY: a screen saver module</title>');
  out.push('<desc>A beige monitor runs a screen saver: sea turtles, messages in bottles and the odd cameo cross a black screen on one diagonal while the word CASTAWAY stays put and a message line scrolls along the bottom.</desc>');
  out.push(`<style>${css.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`);
  out.push(`<defs><clipPath id="scr"><rect x="${SX}" y="${SY}" width="${SW * PX}" height="${SH * PX}" rx="8"/></clipPath>${defs.join('')}</defs>`);
  out.push(bez.join(''));
  out.push(`<g clip-path="url(#scr)"><rect x="${SX}" y="${SY}" width="${SW * PX}" height="${SH * PX}" fill="#000"/>`);
  out.push(`<g transform="translate(${SX} ${SY}) scale(${PX})">${lanes}${title}${glints}${cams}${msg}</g></g>`);
  out.push('</svg>');
  return out.join('\n');
}

const svgSaver = buildSaver();
mkdirSync(resolve(here, '../assets'), { recursive: true });
writeFileSync(resolve(here, `../assets/${SLUG}.svg`), svgSaver);
console.log(`wrote assets/${SLUG}.svg (${(svgSaver.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------- the control panel
// The saver's control panel, a platinum window of the period (drawn here,
// not copied from any real system): a list of modules at left, each one a
// gag from the island, a live preview in the middle, and the module's
// sliders at right, carrying real numbers from the schedule. The famous
// slider of the genre is here too, as "Darkness", greyed out and stuck at
// noon, because the island has a rule: it is always daytime.
const P = 3; // svg units per panel pixel
const PW = 420, PH = 208;
const UI = {
  k: '#000000', win: '#dddddd', white: '#ffffff', shade: '#9a9a9a', light: '#f6f6f6', ridge: '#8a8a8a',
  navy: '#2a2f86', grey: '#8c8c8c', dither: '#bdbdbd', bezel: '#3a3832',
  reg: '#4fb36a', occ: '#2fa8d8', rare: '#f2a33a', srare: '#ef5a4c',
};
const ICON_KEY = {
  g: '#4fb36a', G: '#1c6436', b: '#cc8b3c', B: '#f6cd6c', k: '#000000', c: '#b97b3e', t: '#3fbfa4', T: '#17685a',
  w: '#f6e9c9', y: '#9c9ca4', d: '#5c5c66', E: '#c8e04a', p: '#f08aa0', R: '#ec5b33', e: '#101010',
  r: '#e2483f', L: '#ffffff', l: '#cfe8f5', i: '#8a5428', o: '#a0a0a0', s: '#7f8c9a', S: '#4c5866', W: '#2fa8d8',
  x: '#c99a5a', X: '#8a6230', n: '#e8d8b0', Y: '#ffd84a',
};
const ICONS = {
  turtle: ['.....g.....', '....ggg....', '.g..bbb..g.', '.ggbbBbbgg.', '..bBbBbBb..', '..bbBbBbb..', '..bBbBbBb..', '.ggbbBbbgg.', '.g..bbb..g.', '.....g.....', '...........'],
  bottle: ['.........kk', '........kck', '.......kTk.', '......ktk..', '....kkttk..', '...kttwtk..', '..kttwtk...', '.kttwtTk...', '.kttTTk....', '..kkkk.....', '...........'],
  cat: ['...........', '.k.......k.', '.yk.....ky.', '.yykkkkkyy.', '.yyydydyyy.', '.yEyyyyyEy.', '.yyyypyyyy.', '..ywwwwwy..', '...kkkkk...', '...........', '...........'],
  crab: ['...........', '...kkkkk...', '..kbbBbbk..', '.kbBbbbBbk.', '.kbbbBbbbk.', 'RkbBbbbbbk.', 'eRkbbbBbk..', '.R.kkkkk...', '.R.R...R.R.', 'R.R.....R.R', '...........'],
  coffee: ['......r....', '.....r.....', '...LLrLL...', '..kLLLLLk..', '...klllk...', '...kiiik...', '...kiiik...', '...kiiik...', '....kik....', '....kkk....', '...........'],
  signal: ['.........oo', '.........oo', '.........oo', '......oo.oo', '......oo.oo', '...oo.oo.oo', '...oo.oo.oo', 'gg.oo.oo.oo', 'gg.oo.oo.oo', '...........', '...........'],
  // a dorsal fin (sloped front, steep back) in a pair of headphones
  shark: ['....ddddd..', '...d..s..d.', '..kk.ss.kk.', '..kksss.kk.', '...sssS....', '..ssssSS...', '.sssssSSs..', 'ssssssSSSs.', 'WWWWWWWWWWW', '.W..W..W..W', '...........'],
  parcel: ['...........', '.kkkkkkkkk.', '.kxxxnxxxk.', '.kxxxnxxxk.', '.kkkkkkkkk.', '.kXXXnXXXk.', '.kXXXnXXXk.', '.kXXXnXXXk.', '.kkkkkkkkk.', '...........', '...........'],
  ticker: ['...........', '...........', 'kkkkkkkkkkk', 'kYkkYYkkkYY', 'YkYkYkYkYkk', 'YYYkYYkkYkk', 'YkYkYkYkYkk', 'YkYkYYkkkYY', 'kkkkkkkkkkk', '...........', '...........'],
};
const SUN = fromArt(['....Y....', '.Y.....Y.', '...YYY...', '..YYYYY..', 'Y.YYYYY.Y', '..YYYYY..', '...YYY...', '.Y.....Y.', '....Y....'], { Y: '#f2a33a' });

function buildPanel(counts) {
  const css = [];
  const g = new Grid(PW, PH);
  const box = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g.set(i, j, c); };
  const ring = (x, y, w, h, c) => { box(x, y, w, 1, c); box(x, y + h - 1, w, 1, c); box(x, y, 1, h, c); box(x + w - 1, y, 1, h, c); };
  const put = (src, x, y) => { for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) if (src.get(i, j)) g.set(x + i, y + j, src.get(i, j)); };
  const right = (font, str, rx, y, c) => text(g, font, str, rx - font.width(str), y, c);

  // window, hard shadow, title bar with ridges, close box
  const WW = PW - 2, WH = PH - 2;
  box(2, 2, WW, WH, UI.k);
  box(0, 0, WW, WH, UI.win);
  ring(0, 0, WW, WH, UI.k);
  box(1, 1, WW - 2, 1, UI.white);
  box(1, 1, 1, WH - 2, UI.white);
  for (let y = 3; y <= 10; y += 2) { box(2, y, WW - 4, 1, UI.ridge); box(2, y + 1, WW - 4, 1, UI.white); }
  const title = 'Broad Daylight';
  const tw = sys.width(title) + SUN.w + 6;
  const tx0 = Math.round((WW - tw) / 2);
  box(tx0 - 6, 2, tw + 12, 10, UI.win);
  put(SUN, tx0, 2);
  text(g, sys, title, tx0 + SUN.w + 6, 3, UI.k);
  box(7, 2, 13, 10, UI.win);
  ring(8, 2, 11, 10, UI.k);
  box(0, 13, WW, 1, UI.k);

  // module list
  text(g, sys, 'Modules', 10, 20, UI.k);
  const LX = 10, LY = 32, LW = 142, ROW = 13;
  const items = [
    ['turtle', 'Sea Turtles'], ['bottle', 'Bottle, Returned'], ['cat', 'Cat on a Crate'],
    ['crab', 'Coconut Crab'], ['coffee', 'Leave Any Time'], ['signal', 'Signal Hunt'],
    ['shark', 'Shark, Nodding'], ['parcel', 'Parcel Drone'], ['ticker', 'Ticker Tape'],
  ];
  const LH = items.length * ROW + 2;
  box(LX, LY, LW, LH, UI.white);
  ring(LX, LY, LW, LH, UI.k);
  items.forEach(([icon, name], i) => {
    const y = LY + 1 + i * ROW;
    const sel = i === 0;
    if (sel) box(LX + 1, y, LW - 13, ROW, UI.navy);
    if (sel) box(LX + 2, y + 1, 13, 11, UI.white);
    put(fromArt(ICONS[icon], ICON_KEY), LX + 3, y + 1);
    text(g, body, name, LX + 19, y + 3, sel ? UI.white : UI.k);
  });
  // scroll bar: a long list, a small thumb (there are more than 90 of them)
  const SBX = LX + LW - 12;
  box(SBX, LY, 1, LH, UI.k);
  for (let y = LY + 12; y < LY + LH - 12; y++) for (let x = SBX + 1; x < LX + LW - 1; x++) if ((x + y) % 2 === 0) g.set(x, y, UI.dither);
  box(SBX, LY + 11, 12, 1, UI.k);
  box(SBX, LY + LH - 12, 12, 1, UI.k);
  const arrow = (y, up) => { for (let r = 0; r < 4; r++) box(SBX + 6 - r, up ? y + 3 + r : y + 6 - r, 1 + 2 * r, 1, UI.k); };
  arrow(LY, true);
  arrow(LY + LH - 12, false);
  box(SBX + 1, LY + 14, 10, 8, UI.win);
  ring(SBX, LY + 13, 12, 10, UI.k);
  text(g, body, 'showing 9 of 90+', LX, LY + LH + 4, UI.grey);

  // preview
  text(g, sys, 'Preview', 162, 20, UI.k);
  const VX = 162, VY = 32, VW = 120, VH = 84;
  box(VX, VY, VW, VH, UI.bezel);
  ring(VX, VY, VW, VH, UI.k);
  box(VX + 4, VY + 4, VW - 8, VH - 8, '#000000');
  // buttons
  const button = (x, y, w, label, dflt) => {
    box(x + 1, y, w - 2, 16, UI.win); box(x, y + 1, w, 14, UI.win);
    box(x + 2, y, w - 4, 1, UI.k); box(x + 2, y + 15, w - 4, 1, UI.k);
    box(x, y + 2, 1, 12, UI.k); box(x + w - 1, y + 2, 1, 12, UI.k);
    g.set(x + 1, y + 1, UI.k); g.set(x + w - 2, y + 1, UI.k); g.set(x + 1, y + 14, UI.k); g.set(x + w - 2, y + 14, UI.k);
    if (dflt) {
      box(x + 1, y - 3, w - 2, 2, UI.k); box(x + 1, y + 17, w - 2, 2, UI.k);
      box(x - 3, y + 1, 2, 14, UI.k); box(x + w + 1, y + 1, 2, 14, UI.k);
      for (const [dx, dy] of [[-2, -1], [-1, -2], [w, -2], [w + 1, -1], [-2, 16], [-1, 17], [w, 17], [w + 1, 16]]) { g.set(x + dx, y + dy, UI.k); }
    }
    text(g, sys, label, x + Math.round((w - sys.width(label)) / 2), y + 4, UI.k);
  };
  button(VX + 4, VY + VH + 9, 50, 'Demo', true);
  button(VX + 64, VY + VH + 9, 52, 'Nap', false);
  // on / off
  const radio = (x, y, on, label) => {
    const o = ['..###..', '.#...#.', '#.....#', '#.....#', '#.....#', '.#...#.', '..###..'];
    o.forEach((row, j) => [...row].forEach((b, i) => { if (b === '#') g.set(x + i, y + j, UI.k); else if (Math.abs(i - 3) + Math.abs(j - 3) < 3) g.set(x + i, y + j, UI.white); }));
    if (on) box(x + 2, y + 2, 3, 3, UI.k);
    text(g, body, label, x + 10, y, UI.k);
  };
  text(g, body, 'Saver:', VX, 152, UI.k);
  radio(VX + 34, 152, true, 'On');
  radio(VX + 66, 152, false, 'Off');
  // the ticker's own text, in a text field (the message line on the saver)
  const FX = LX + 40, FY = 168, FW = VX + VW - FX;
  text(g, body, 'Ticker:', LX, FY + 4, UI.k);
  box(FX, FY, FW, 15, UI.white);
  ring(FX, FY, FW, 15, UI.k);
  box(FX + 1, FY + 1, FW - 2, 1, UI.shade);
  box(FX + 1, FY + 1, 1, 13, UI.shade);
  const fieldText = 'CASTAWAY * a lo-fi island video for very long';
  const fw = text(g, body, fieldText, FX + 4, FY + 4, UI.k);
  box(FX + 4 + fw, FY + 3, 1, 10, UI.k);

  // module settings
  const RX = 294, RW = 116;
  text(g, sys, 'Sea Turtles', RX, 20, UI.k);
  [`${counts.turtles} turtles and ${counts.bottles}`, 'bottles cross on one', 'diagonal, a stroke a beat.'].forEach((l, i) => text(g, body, l, RX, 34 + i * 10, UI.k));
  const track = (y, c = UI.white) => { box(RX, y, RW, 6, c); ring(RX, y, RW, 6, UI.k); };
  const thumb = (x, y, hollow = false) => {
    const t = ['#######', '#.....#', '#.....#', '#.....#', '#.....#', '.#...#.', '..#.#..', '...#...'];
    t.forEach((row, j) => [...row].forEach((b, i) => {
      if (b === '#') g.set(x - 3 + i, y + j, hollow ? UI.grey : UI.k);
      else if (j < 7 && Math.abs(i - 3) <= (j < 5 ? 2 : 6 - j)) g.set(x - 3 + i, y + j, hollow ? UI.win : UI.light);
    }));
  };
  // 1. turtles
  let y = 70;
  text(g, body, 'Turtles', RX, y, UI.k);
  right(body, 'few - many', RX + RW, y, UI.grey);
  track(y + 12);
  thumb(RX + Math.round(RW * 0.72), y + 9);
  // 2. now and then: the four timers on a log scale, 1 min to 6 h
  y = 96;
  text(g, body, 'Now and then', RX, y, UI.k);
  track(y + 12);
  const lx = (min) => RX + 1 + Math.round(((RW - 2) * Math.log(min)) / Math.log(360));
  for (const [a, b, c] of [[2, 5, UI.reg], [12, 25, UI.occ], [30, 60, UI.rare], [180, 360, UI.srare]]) box(lx(a), y + 13, Math.max(2, lx(b) - lx(a)), 4, c);
  text(g, body, '1 min', RX, y + 21, UI.grey);
  right(body, '6 h', RX + RW, y + 21, UI.grey);
  // 3. busy
  y = 132;
  text(g, body, 'She is busy', RX, y, UI.k);
  right(body, 'a third', RX + RW, y, UI.k);
  track(y + 12);
  box(RX + 1, y + 13, Math.round((RW - 2) / 3), 4, UI.navy);
  // 4. darkness: greyed out, stuck at noon
  y = 158;
  text(g, body, 'Darkness', RX, y, UI.grey);
  right(body, 'locked', RX + RW, y, UI.grey);
  for (let j = y + 12; j < y + 18; j++) for (let i = RX; i < RX + RW; i++) {
    const edge = j === y + 12 || j === y + 17 || i === RX || i === RX + RW - 1;
    if (edge ? (i + j) % 2 === 0 : false) g.set(i, j, UI.grey);
  }
  thumb(RX + 4, y + 9, true);
  text(g, body, 'always daytime', RX, y + 21, UI.grey);

  // footer
  box(6, 189, WW - 12, 1, UI.shade);
  box(6, 190, WW - 12, 1, UI.white);
  text(g, body, 'Broad Daylight 1.0   Sea State Software', 10, 194, UI.k);
  right(body, 'run: python tools/serve.py', WW - 10, 194, UI.k);

  // the live preview: a few turtles and a bottle, in sprite pixels at 2 units
  const defs = [];
  [0, 1, 2, 3].forEach((f) => defs.push(`<g id="t${f}">${paths(turtle(f))}</g>`));
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((f) => defs.push(`<g id="b${f}">${paths(bottle(f))}</g>`));
  const MS = 3;
  const mw = ((VW - 8) * P) / MS, mh = ((VH - 8) * P) / MS;
  css.push('@keyframes q4{0%{opacity:1}25%,100%{opacity:0}}@keyframes q8{0%{opacity:1}12.5%,100%{opacity:0}}');
  const slots = new Set();
  const fr = (kind, nf, dur, phase) => {
    let s = '';
    for (let f = 0; f < nf; f++) {
      const slot = (f - phase + nf) % nf;
      const name = `v${kind}${slot}`;
      if (!slots.has(name)) {
        slots.add(name);
        css.push(`.${name}{animation:q${nf} ${fmtx(dur)}s step-end infinite;animation-delay:${fmtx(-dur + (slot * dur) / nf)}s;opacity:${slot === 0 ? 1 : 0}}`);
      }
      s += `<use href="#${kind}${f}" class="${name}"/>`;
    }
    return s;
  };
  let lanes = '';
  [['t', -14, 0.3, 11], ['t', 46, 0.62, 8], ['b', 104, 0.45, 8], ['t', 160, 0.15, 13], ['t', 222, 0.8, 10]].forEach(([kind, c, ph, sp], i) => {
    const [w, h] = kind === 'b' ? [BW, BW] : [TW, TH];
    const { x0, y0, n } = lanePath(c, w, h, mw, mh);
    const dur = n / sp;
    const k0 = Math.floor(ph * n);
    const name = `P${i}`;
    css.push(`@keyframes ${name}{from{transform:translate(${x0}px,${y0}px)}to{transform:translate(${x0 - 2 * n}px,${y0 + n}px)}}`);
    css.push(`.${name}{animation:${name} ${fmt(dur)}s steps(${n}) infinite;animation-delay:${fmt(-((k0 + 0.5) / n) * dur)}s}`);
    lanes += `<g class="${name}" transform="translate(${x0 - 2 * k0} ${y0 + k0})">${kind === 'b' ? fr('b', 8, 2 * BEAT, i % 8) : fr('t', 4, BEAT, i % 4)}</g>`;
  });

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW * P} ${PH * P}" width="${PW * P}" height="${PH * P}" shape-rendering="crispEdges">`);
  out.push('<title>Broad Daylight: the CASTAWAY saver control panel</title>');
  out.push('<desc>A platinum control panel window. Modules: Sea Turtles (selected), Bottle Returned, Cat on a Crate, Coconut Crab, Leave Any Time, Signal Hunt, Shark Nodding, Parcel Drone, Ticker Tape. Sliders: Turtles, Now and then (the four timers, from every 2 minutes to every 6 hours), She is busy (a third), and Darkness, greyed out and locked: always daytime.</desc>');
  out.push(`<style>${css.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`);
  out.push(`<defs><clipPath id="pv"><rect x="${(VX + 4) * P}" y="${(VY + 4) * P}" width="${(VW - 8) * P}" height="${(VH - 8) * P}"/></clipPath>${defs.join('')}</defs>`);
  out.push(`<g transform="scale(${P})">${paths(g)}</g>`);
  out.push(`<g clip-path="url(#pv)"><g transform="translate(${(VX + 4) * P} ${(VY + 4) * P}) scale(${MS})">${lanes}</g></g>`);
  out.push('</svg>');
  return out.join('\n');
}

const svgPanel = buildPanel(FLOCK);
writeFileSync(resolve(here, `../assets/${SLUG}-panel.svg`), svgPanel);
console.log(`wrote assets/${SLUG}-panel.svg (${(svgPanel.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------- dev sheet
if (SHEET) {
  const sets = [
    ['turtle', [0, 1, 2, 3].map((f) => turtle(f))],
    ['turtle+phones', [0, 1, 2, 3].map((f) => turtle(f, true))],
    ['bottle', [0, 1, 2, 3, 4, 5, 6, 7].map(bottle)],
    ['cat', [0, 1, 2, 3].map(catCrate)],
    ['crab', [0, 1, 2, 3].map(crabNut)],
    ['her', [0, 1, 2, 3].map(her)],
  ];
  const Z = 6;
  let y = 4, body = '';
  for (const [, frames] of sets) {
    let x = 4, hmax = 0;
    for (const f of frames) {
      body += `<g transform="translate(${x * Z} ${y * Z}) scale(${Z})"><rect width="${f.w}" height="${f.h}" fill="#111"/>${paths(f)}</g>`;
      x += f.w + 3;
      hmax = Math.max(hmax, f.h);
    }
    y += hmax + 4;
  }
  const W = 170 * Z;
  writeFileSync(SHEET, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y * Z}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#000"/>${body}</svg>`);
  console.log('sheet', SHEET);
}
