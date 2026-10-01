// Tractor-feed printout header for the Castaway README (catalogue style print-04).
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). Run:
//   node examples/castaway/src/08-tractor-feed_opus_5.5.mjs
// It rewrites, relative to this file:
//   ../08-tractor-feed_opus_5.5.md               the header itself (markdown + HTML)
//   ../assets/08-tractor-feed_opus_5.5.svg       the printer, printing (animated)
//   ../assets/08-tractor-feed_opus_5.5-card.svg  the run card (static)
// Edit this file, not those.
//
// The style: continuous stationery. Green-bar paper with sprocket strips down both edges, a
// job banner page with the name in giant letters built from the letter itself, field lines
// above and below it, heavy rules across the fold, and the job's listing after it, all in
// 9-pin dot-matrix type. Plus an 80-column punched card. All of that is generic and drawn
// here from scratch: the font, the giant letters, the island picture, the printer (its maker,
// DOLDRUMS, is invented) and the card face. No real printer, program or card form is copied.
//
// What gets printed is real. The listing is an excerpt of what tools/schedule.py's report
// prints for the default run (10:00:00, seed 1992), taken on 2026-10-01 by importing that
// script's own simulate() and report() with `python -B` (nothing written to the project):
//   cd D:/python/castaway && python -B -c "import sys; sys.path.insert(0,'tools'); ..."
// Only wholesome rows are excerpted. The schedule is still being edited, so the numbers will
// drift; re-run it and update REPORT below if you want them current.
//
// How the animation works. The job is PERIOD (30 lines, one 5-inch sheet). The window shows
// VIS = PERIOD + 7 lines, so one complete CASTAWAY banner is always in view. At t=0 the head
// sits on global line H0; during one loop it prints PERIOD lines, each revealed by a clip rect
// that slides with the head, and the paper steps up one line per line feed (hard steps, no
// easing). After PERIOD feeds the paper looks exactly like it did at t=0, so the loop is
// seamless. The bars (6 lines), sprocket holes (3 lines) and folds (30 lines) all repeat
// within PERIOD too.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '08-tractor-feed_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_CARD = path.resolve(HERE, '..', 'assets', `${SLUG}-card.svg`);
const SVG_REF = `assets/${SLUG}.svg`;
const CARD_REF = `assets/${SLUG}-card.svg`;

// ------------------------------------------------------------------ helpers
const f1 = (n) => String(Math.round(n * 10) / 10);
const f2 = (n) => String(Math.round(n * 100) / 100);
const f3 = (n) => String(Math.round(n * 1000) / 1000);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mod = (a, n) => ((a % n) + n) % n;
const lerp = (a, b, t) => a + (b - a) * t;
const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

// ------------------------------------------------------------------ the 9-pin font
// 5x7 capitals on pins 1-7, descenders on pins 8-9. Rows top to bottom, '#' = a dot.
// (Bitmap adapted from the 5x7 face in one of the ultra-satisfactory generators.)
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
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.',
  l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
  p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.',
  z: '.....|.....|#####|...#.|..#..|.#...|#####',
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
  ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  _: '.....|.....|.....|.....|.....|.....|.....|#####',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
};
const glyphRows = (ch) => {
  const g = F5[ch];
  if (g === undefined) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return g.split('|');
};

// 3x5 face for the card's preprinted digits and column numbers.
const T3 = {
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '###|..#|###|#..|###', 3: '###|..#|.##|..#|###',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|###|..#|###', 6: '###|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|###',
};

// ------------------------------------------------------------------ the giant letters
// One banner letter is 8 columns by 7 print lines; each cell is printed as the letter itself.
const BIG = {
  C: ['.CCCCCC.', 'CC....CC', 'CC......', 'CC......', 'CC......', 'CC....CC', '.CCCCCC.'],
  A: ['...AA...', '..AAAA..', '.AA..AA.', 'AA....AA', 'AAAAAAAA', 'AA....AA', 'AA....AA'],
  S: ['.SSSSSS.', 'SS....SS', 'SS......', '.SSSSSS.', '......SS', 'SS....SS', '.SSSSSS.'],
  T: ['TTTTTTTT', '...TT...', '...TT...', '...TT...', '...TT...', '...TT...', '...TT...'],
  W: ['WW....WW', 'WW....WW', 'WW....WW', 'WW.WW.WW', 'WW.WW.WW', 'WWWWWWWW', '.WW..WW.'],
  Y: ['YY....YY', 'YY....YY', '.YY..YY.', '..YYYY..', '...YY...', '...YY...', '...YY...'],
};
const NAME = 'CASTAWAY';
const giantRow = (r) => ' ' + [...NAME].map((L) => BIG[L][r].replace(/\./g, ' ').replace(/[A-Z]/g, L)).join('  ');

// ------------------------------------------------------------------ what gets printed
const COLS = 80;
const starLine = (s) => {
  const n = COLS - s.length;
  return '*'.repeat(Math.floor(n / 2)) + s + '*'.repeat(n - Math.floor(n / 2));
};
const FIELD_TOP = starLine(' START **** JOB 1992 **** DELIVER TO: 1 PALM, 1 RAFT **** NO RUSH ');
const FIELD_BOT = starLine(' NOTE: A SHIP WENT PAST AT 0:24:18. SHE WAS BUSY WITH A COCONUT. ');

// Real report lines, verbatim: tools/schedule.py's report for the default run (10:00:00,
// seed 1992), as printed on 2026-10-01 after the schedule had grown to 92 activities. The
// schedule changes daily, so a fresh run will differ: re-run it and paste the new lines here.
// Only wholesome rows are excerpted.
const REPORT = {
  head: 'CASTAWAY SCHEDULE: 10:00:00 run, seed 1992 (all activities, assets or not)',
  cols: '  activity                status         runs  about every     lasts  % of run',
  regular: '  REGULAR  (every 0:02:00 to 0:05:00)',
  occasional: '  OCCASIONAL  (every 0:12:00 to 0:25:00)',
  rare: '  RARE  (every 0:30:00 to 1:00:00)',
  superRare: '  SUPER RARE  (every 3:00:00 to 6:00:00, max 3 per run)',
  chained: "  CHAINED  (Never picked by a timer: only started by another activity's `then`.)",
  rows: {
    coconut_sip: '    coconut_sip           ready            29      0:20:41   0:00:39      3.1%',
    stroll: '    stroll                ready            34      0:17:39   0:00:32      3.0%',
    jog_lap: '    jog_lap               ready            19      0:31:35   0:00:30      1.6%',
    fishing_quiet: '    fishing_quiet         ready            19      0:31:35   0:01:38      5.2%',
    sandcastle: '    sandcastle            ready            10      1:00:00   0:01:24      2.3%',
    ship_passes_unseen: '    ship_passes_unseen    ready             9      1:06:40   0:02:03      3.1%',
    message_in_bottle: '    message_in_bottle     ready             1     10:00:00   0:01:47      0.3%',
    turtle_visit: '    turtle_visit          ready             0        never',
    delivery_drone: '    delivery_drone        ready             0        never',
    signal_hunt: '    signal_hunt           ready             1     10:00:00   0:02:35      0.4%',
    cat_visit: '    cat_visit             ready             5      2:00:00   0:21:56     18.3%',
    shark_nod: '    shark_nod             ready             0        never',
    tour_boat_selfies: '    tour_boat_selfies     ready             0        never',
    rescue_almost: '    rescue_almost         ready             1     10:00:00   0:01:54      0.3%',
    leave_any_time: '    leave_any_time        ready             0        never',
    tide_takes_sandcastle: '    tide_takes_sandcastle ready            10      1:00:00   0:00:06      0.2%',
    bottle_reply: '    bottle_reply          ready             1     10:00:00   0:00:54      0.1%',
  },
  busy: '  She is busy 28% of the run and idling 72% (the calm lofi baseline).',
  cat: '  The cat visits 5 times, on the island 1:49:40 in total.',
  first: '  FIRST 0:30:00',
  events: [
    '    0:19:39  stroll                  0:00:33   castaway',
    '    0:24:09  coconut_sip             0:00:51   castaway',
    '    0:24:18  ship_passes_unseen      0:02:28   sea_sky',
    '    0:28:09  jog_lap                 0:00:22   castaway',
  ],
};

// One job = one 5-inch sheet = 30 lines at 6 lines per inch.
const PERIOD_LINES = [
  { band: 'top' },
  { text: FIELD_TOP, em: true },
  {},
  ...[0, 1, 2, 3, 4, 5, 6].map((r) => ({ text: giantRow(r), em: true, giant: true })),
  {},
  { text: FIELD_BOT, em: true },
  {},
  { text: REPORT.head },
  { text: REPORT.cols },
  { text: REPORT.regular },
  { text: REPORT.rows.coconut_sip },
  { text: REPORT.occasional },
  { text: REPORT.rows.ship_passes_unseen },
  { text: REPORT.rare },
  { text: REPORT.rows.cat_visit },
  { text: REPORT.superRare },
  { text: REPORT.rows.leave_any_time },
  { text: REPORT.busy },
  { text: REPORT.first, pic: 0 },
  { text: '    ...', pic: 1 }, // the excerpt skips the first 19 minutes, and says so
  ...REPORT.events.slice(0, 3).map((e, i) => ({ text: e, pic: i + 2 })),
  { band: 'bottom' },
];
const P = PERIOD_LINES.length;
if (P !== 30) throw new Error(`period is ${P} lines, expected 30`);
for (const L of PERIOD_LINES) if (L.text && L.text.length > COLS) throw new Error(`line over ${COLS}: ${L.text}`);

// ------------------------------------------------------------------ geometry
// 96 user units to the inch. 10 characters per inch, 6 lines per inch; the dot grid is
// square at 60 dpi: a character cell is 6 dots, a line is 10 dots.
const IN = 96;
const D = IN / 60; // dot pitch
const CW = 6; // dots per character
const LH = 10; // dots per line
const LINE = LH * D; // 16 units
const VB_W = 1000, VB_H = 700;
const PAPER_X = 44, PAPER_W = 9.5 * IN; // 912
const STRIP = 0.5 * IN; // 48
const SHEET_X = PAPER_X + STRIP, SHEET_W = PAPER_W - 2 * STRIP; // 92, 816
const TEXT_X = SHEET_X + (SHEET_W - COLS * CW * D) / 2; // 116
const TOP = 8; // y of the top of window row 0 (at scroll 0)
const VIS = P + 7; // lines in the window: always one whole banner in view
const H0 = VIS - 1; // the head line at t=0 is the bottom row of the window
const HEAD_Y = TOP + H0 * LINE; // top of the line being printed (584)
const PRINTER_Y = HEAD_Y + LINE + 1; // 601
const PIC_COL = 57;
const PIC_W = 132, PIC_H = 50;

// ------------------------------------------------------------------ the island picture
// Dot graphics, printed beside the first-half-hour lines: the island, the palm, the raft,
// her with a coconut, and a ship on the horizon going past while she is busy with it.
function islandPicture() {
  const W = PIC_W, H = PIC_H;
  const g = Array.from({ length: H }, () => new Uint8Array(W));
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const on = (x, y) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = 1; };
  const off = (x, y) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = 0; };
  const dith = (x, y, lvl) => lvl * 16 > B4[y & 3][x & 3];
  const disc = (cx, cy, r, lvl = 1) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.2 && dith(x, y, lvl)) on(x, y);
      }
    }
  };
  const seg = (x0, y0, x1, y1, w = 1, fn = on) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
    for (let i = 0; i <= n; i++) {
      const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n);
      if (w <= 1) fn(x, y);
      else for (let dy = -(w - 1) / 2; dy <= (w - 1) / 2 + 0.01; dy += 0.5) for (let dx = -(w - 1) / 2; dx <= (w - 1) / 2 + 0.01; dx += 0.5) fn(x + dx, y + dy);
    }
  };
  const quad = (p0, p1, p2, t) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ];
  const rnd = mulberry32(0x1992);

  // sky: a sun and two distant birds on the left, the ship's smoke on the right
  const SUN = [9, 7];
  for (let a = 0; a < 360; a += 15) on(SUN[0] + 3.6 * Math.cos((a * Math.PI) / 180), SUN[1] + 3.6 * Math.sin((a * Math.PI) / 180));
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    seg(SUN[0] + 5.6 * Math.cos(a), SUN[1] + 5.6 * Math.sin(a), SUN[0] + 7 * Math.cos(a), SUN[1] + 7 * Math.sin(a));
  }
  for (const [bx, by] of [[24, 5], [31, 8]]) { on(bx - 2, by - 1); on(bx - 1, by); on(bx, by + 1); on(bx + 1, by); on(bx + 2, by - 1); }

  // the horizon, and the ship on it, smoke trailing back: it is leaving
  const HZ = 17;
  for (let x = 0; x < W; x++) on(x, HZ);
  const SX = 98; // stern
  for (let y = HZ - 3; y <= HZ; y++) {
    const k = y - (HZ - 3);
    for (let x = SX + k * 0.6; x <= SX + 24 - k * 1.1; x++) on(x, y);
  }
  for (let x = SX + 3; x <= SX + 15; x++) { on(x, HZ - 5); if (x % 2) on(x, HZ - 4); else on(x, HZ - 6); }
  for (let y = HZ - 9; y <= HZ - 6; y++) { on(SX + 9, y); on(SX + 10, y); on(SX + 11, y); }
  seg(SX + 19, HZ - 10, SX + 19, HZ - 4);
  for (const [sx, sy] of [[SX + 8, HZ - 11], [SX + 6, HZ - 12], [SX + 7, HZ - 13], [SX + 4, HZ - 13], [SX + 2, HZ - 14], [SX, HZ - 14], [SX - 3, HZ - 15], [SX - 6, HZ - 15], [SX - 10, HZ - 16]]) on(sx, sy);

  // the island: a low mound of stippled sand under a solid rim
  const IX = 50, IY = 38, RX = 31, RY = 8;
  const inIsland = (x, y) => ((x - IX) / RX) ** 2 + ((y - IY) / RY) ** 2 <= 1 && y <= IY + 1;
  for (let y = IY - RY; y <= IY + 1; y++) {
    for (let x = IX - RX; x <= IX + RX; x++) {
      if (!inIsland(x, y)) continue;
      const rim = !inIsland(x, y - 1) || !inIsland(x, y - 2) && (x + y) % 2 === 0;
      if (rim || dith(x, y, 0.16)) on(x, y);
    }
  }
  // foam along the waterline, and the sea: wave marks, more of them closer in
  for (let x = IX - RX - 3; x <= IX + RX + 3; x += 2) on(x, IY + 2 + Math.round(Math.sin(x * 0.7)));
  const RAFT = [92, 36];
  for (let y = HZ + 4; y < H; y += 3) {
    let x = Math.floor(rnd() * 10);
    while (x < W - 4) {
      const clear = ((x + 2 - IX) / (RX + 6)) ** 2 + ((y - IY + 1) / (RY + 4)) ** 2 > 1
        && !(x > RAFT[0] - 6 && x < RAFT[0] + 26 && y > RAFT[1] - 5 && y < RAFT[1] + 7);
      if (clear) { on(x, y); on(x + 1, y - 1); on(x + 2, y - 1); on(x + 3, y); on(x + 4, y); }
      x += Math.round(lerp(20, 9, y / H) + rnd() * 10);
    }
  }
  // a bush at the left end
  disc(27, 32.5, 2.4, 0.7); disc(31.5, 31, 2.4, 0.7); disc(24, 34, 1.6, 0.7);

  // the palm: tall and slender, curving, notched bark, then the crown
  const t0 = [55, 33], t1 = [61, 19], t2 = [45, 9];
  for (let i = 0; i <= 64; i++) {
    const [x, y] = quad(t0, t1, t2, i / 64);
    on(x, y); on(x + 1, y);
    if (i % 4 === 0 && i < 60) off(x + 1, y);
  }
  const C = t2;
  const fronds = [[[-14, -5], [-26, 5]], [[-8, -8], [-19, -3]], [[0, -9], [9, -7]],
    [[10, -7], [19, 1]], [[10, -1], [15, 8]], [[-10, 0], [-14, 9]]];
  for (const [[cx, cy], [ex, ey]] of fronds) {
    const p1 = [C[0] + cx, C[1] + cy], p2 = [C[0] + ex, C[1] + ey];
    for (let i = 0; i <= 32; i++) {
      const [x, y] = quad(C, p1, p2, i / 32);
      on(x, y);
      if (i > 6 && i % 3 === 0 && i < 30) { on(x, y + 1); on(x + (ex > 0 ? 0.6 : -0.6), y + 2); }
    }
  }
  disc(44, 11.4, 1.2); disc(47, 11.2, 1.1);

  // the raft, three logs and two ties
  for (const ly of [RAFT[1], RAFT[1] + 2, RAFT[1] + 4]) for (let x = RAFT[0]; x <= RAFT[0] + 20; x++) on(x, ly);
  for (const lx of [RAFT[0] - 1, RAFT[0] + 21]) { on(lx, RAFT[1] + 1); on(lx, RAFT[1] + 3); }
  for (const lx of [RAFT[0] + 4, RAFT[0] + 16]) { off(lx, RAFT[1]); off(lx, RAFT[1] + 4); on(lx, RAFT[1] + 1); on(lx, RAFT[1] + 3); }

  // her: hand-placed dots, the way printer clip art was made. She sits cross-legged on the
  // sand right of the palm, facing us and so facing away from the ship: big cream headphones
  // (band and cups), hair framing her face, eyes shut, a coconut with a straw, a tank top
  // (dithered) and shorts. Fully dressed, as always.
  const HER = [
    '....#######.....',
    '...#.......#....',
    '..#..#####..#...',
    '.##.#######.##..',
    '.##.#.....#.##..',
    '.##.#.#.#.#.##..',
    '.##.#.....#.##..',
    '.....#..##......',
    '......###.#.....',
    '.......#...###..',
    '....######.####.',
    '...##.#.#.#.##..',
    '...#.#.#.#......',
    '....#######.....',
    '..#.........#...',
    '.#.#########.#..',
    '..##.......##...',
  ];
  const HX = 61, HY = 31 - (HER.length - 1); // feet on the sand at y 31
  // clear a one-dot margin round her (the horizon, waves and sand stop at her outline)
  HER.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== '#') return;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (y + dy < HER.length - 2) off(HX + x + dx, HY + y + dy);
  }));
  HER.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') on(HX + x, HY + y); }));

  // split into print lines: band k holds rows k*10 .. k*10+9
  const bands = [];
  for (let k = 0; k < H / LH; k++) {
    const dots = [];
    for (let y = k * LH; y < (k + 1) * LH; y++) for (let x = 0; x < W; x++) if (g[y][x]) dots.push([x, y - k * LH]);
    bands.push(dots);
  }
  return bands;
}
const PIC = islandPicture();

// dots -> compact path data (zero-length subpaths, drawn as round dots by round caps)
function dotPath(dots, ox = 0, oy = 0) {
  let d = '', px = null, py = null;
  for (const [x0, y0] of dots) {
    const x = x0 + ox, y = y0 + oy;
    d += px === null ? `M${f2(x)} ${f2(y)}h0` : `m${f2(x - px)} ${f2(y - py)}h0`;
    px = x; py = y;
  }
  return d;
}

// ------------------------------------------------------------------ the ink
const INK_DARK = [34, 36, 40], INK_FADED = [104, 107, 112];
function inkFor(i, bucket) {
  const r = mulberry32(0xb00 + i)();
  const fade = 0.04 + r * 0.16 + bucket * 0.09; // the ribbon is tired towards the right
  return hex(INK_DARK.map((v, k) => lerp(v, INK_FADED[k], fade)));
}

const usedGlyphs = new Set();
function lineExtent(L) {
  if (L.band) return { x0: 0, x1: COLS * CW - 1 };
  let x0 = Infinity, x1 = -Infinity;
  if (L.text) {
    [...L.text].forEach((ch, c) => { if (ch !== ' ') { x0 = Math.min(x0, c * CW); x1 = Math.max(x1, c * CW + 4); } });
  }
  if (L.pic !== undefined && PIC[L.pic].length) {
    for (const [x] of PIC[L.pic]) { x0 = Math.min(x0, PIC_COL * CW + x); x1 = Math.max(x1, PIC_COL * CW + x); }
  }
  return x0 === Infinity ? null : { x0, x1 };
}
function lineDef(L, i) {
  let s = '';
  if (L.band) {
    const rows = L.band === 'top' ? [3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6];
    s += `<path class="bd" stroke="${inkFor(i, 1)}" d="${rows.map((r) => `M0 ${r}h${COLS * CW - 1}.5`).join('')}"/>`;
  }
  if (L.text) {
    const buckets = [[], [], [], []];
    const mode = L.giant ? 'b' : L.em ? 'e' : 'd';
    [...L.text].forEach((ch, c) => {
      if (ch === ' ') return;
      usedGlyphs.add(mode + ch);
      buckets[Math.min(3, Math.floor(c / 20))].push(`<use href="#${gid(ch, mode)}"${c ? ` x="${c * CW}"` : ''}/>`);
    });
    buckets.forEach((b, k) => { if (b.length) s += `<g stroke="${inkFor(i, L.giant ? k * 0.35 : k)}">${b.join('')}</g>`; });
  }
  if (L.pic !== undefined) s += `<path class="pc" stroke="${inkFor(i, 2)}" d="${dotPath(PIC[L.pic], PIC_COL * CW, 0)}"/>`;
  return s ? `<g id="L${i}"${L.giant ? ' class="gi"' : ''}>${s}</g>` : '';
}
// Three print modes, as on the real thing: draft (one dot), emphasized (each dot struck again
// half a dot to the right) and bold (emphasized, then the whole line struck again half a dot
// lower). The giant banner letters are printed bold so they read from across the room.
const MODES = { d: [[0, 0]], e: [[0, 0], [0.5, 0]], b: [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]] };
const gid = (ch, mode = 'd') => mode + ch.codePointAt(0).toString(36);
function glyphDef(key) {
  const [mode, ch] = [key[0], key.slice(1)];
  const dots = [];
  glyphRows(ch).forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') for (const [dx, dy] of MODES[mode]) dots.push([x + dx, y + dy]);
  }));
  return `<path id="${gid(ch, mode)}" d="${dotPath(dots)}"/>`;
}

// ------------------------------------------------------------------ the timeline
const PRINT_V = 700; // dots a second while the head is printing (about 117 characters a second)
const SEEK_V = 2400; // dots a second when it is only moving
const FEED_GAP = 0.1; // pause between the end of a line and its line feed
const SETTLE = 0.07; // pause after a line feed before the head moves again
const BLANK = 0.12; // a line with nothing on it: just the feed
function timeline() {
  const head = [];
  const feeds = [];
  const reveals = [];
  const first = lineExtent(PERIOD_LINES[H0 % P]);
  const X0 = first.x0;
  let X = X0;
  let t = 0;
  head.push([0, X]);
  t += SETTLE;
  head.push([t, X]);
  for (let gl = H0; gl < H0 + P; gl++) {
    const L = PERIOD_LINES[gl % P];
    const e = lineExtent(L);
    const last = gl === H0 + P - 1;
    if (e) {
      const ltr = Math.abs(X - e.x0) <= Math.abs(X - e.x1);
      const s = ltr ? e.x0 : e.x1, en = ltr ? e.x1 : e.x0;
      if (s !== X) { t += Math.abs(s - X) / SEEK_V + 0.03; head.push([t, s]); }
      const a = t;
      t += (e.x1 - e.x0) / PRINT_V;
      head.push([t, en]);
      X = en;
      reveals.push({ gl, a, b: t, ltr, ...e });
      t += FEED_GAP;
    } else {
      t += BLANK;
    }
    if (last && X !== X0) { // park the head where the loop starts, during the last feed
      head.push([t, X]);
      t += Math.abs(X - X0) / SEEK_V + 0.05;
      head.push([t, X0]);
      X = X0;
    }
    feeds.push(t);
    if (!last) { t += SETTLE; head.push([t, X]); }
  }
  return { head, feeds, reveals, T: t };
}

// ------------------------------------------------------------------ the main SVG
function buildSvg() {
  const { head, feeds, reveals, T } = timeline();
  const pct = (t) => f3((t / T) * 100) + '%';
  const TT = f3(T) + 's';
  const lineDefs = PERIOD_LINES.map(lineDef).join('');
  const glyphDefs = [...usedGlyphs].sort().map(glyphDef).join('');

  // --- paper (moves) ---
  const gFrom = -2, gTo = H0 + P + 2; // global lines that get paper under them
  const yOf = (gl) => TOP + gl * LINE;
  let paper = '';
  const pTop = yOf(gFrom), pBot = yOf(gTo);
  paper += `<rect class="sh" x="${SHEET_X}" y="${pTop}" width="${SHEET_W}" height="${pBot - pTop}"/>`;
  let bars = '';
  for (let gl = gFrom - mod(gFrom, 6); gl < gTo; gl += 6) bars += `M${SHEET_X} ${yOf(gl)}h${SHEET_W}v${3 * LINE}h-${SHEET_W}z`;
  paper += `<path class="gb" d="${bars}"/>`;
  paper += `<rect class="st" x="${PAPER_X}" y="${pTop}" width="${STRIP}" height="${pBot - pTop}"/>`;
  paper += `<rect class="st" x="${SHEET_X + SHEET_W}" y="${pTop}" width="${STRIP}" height="${pBot - pTop}"/>`;
  let holes = '';
  for (let gl = gFrom - mod(gFrom, 3); gl < gTo; gl += 3) {
    const cy = yOf(gl) + 1.5 * LINE;
    for (const cx of [PAPER_X + STRIP / 2, SHEET_X + SHEET_W + STRIP / 2]) holes += `M${f1(cx - 7.5)} ${f1(cy)}a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0z`;
  }
  paper += `<path class="hl" d="${holes}"/>`;
  // the punched rim inside each hole catches a little light
  paper += `<path class="hr" d="${holes}"/>`;
  paper += `<path class="pf" d="M${SHEET_X} ${pTop}V${pBot}M${SHEET_X + SHEET_W} ${pTop}V${pBot}"/>`;
  let folds = '';
  let creases = '';
  for (let gl = gFrom - mod(gFrom, P) + P; gl < gTo; gl += P) {
    folds += `M${PAPER_X} ${yOf(gl)}h${PAPER_W}`;
    creases += `<rect x="${PAPER_X}" y="${yOf(gl) - 7}" width="${PAPER_W}" height="14" fill="url(#crease)"/>`;
  }
  paper += creases + `<path class="fd" d="${folds}"/>`;

  // ink, in dot units
  let ink = '';
  let clips = '';
  let css = '';
  for (let gl = -1; gl < H0 + P; gl++) {
    const i = mod(gl, P);
    if (!lineExtent(PERIOD_LINES[i])) continue;
    const use = `<use href="#L${i}" y="${gl * LH}"/>`;
    if (gl < H0) { ink += use; continue; }
    const r = reveals.find((v) => v.gl === gl);
    const w = r.x1 - r.x0 + 2;
    clips += `<clipPath id="c${gl}"><rect class="k${gl}" x="${r.x0 - 1}" y="${gl * LH - 1}" width="${w}" height="${LH + 1}"/></clipPath>`;
    ink += `<g clip-path="url(#c${gl})">${use}</g>`;
    const from = `transform:translateX(${r.ltr ? -w : w}px)`;
    css += `.k${gl}{animation:k${gl} ${TT} linear infinite}@keyframes k${gl}{0%,${pct(r.a)}{${from}}${pct(r.b)},100%{transform:none}}`;
  }
  paper += `<g transform="translate(${f2(TEXT_X + D / 2)} ${f2(TOP + D / 2)}) scale(${D})" class="ink">${ink}</g>`;

  // --- the feed ---
  let feedK = '0%{transform:none}';
  feeds.forEach((t, k) => { feedK += `${k === feeds.length - 1 ? '100%' : pct(t)}{transform:translateY(-${(k + 1) * LINE}px)}`; });
  css += `.pp{animation:feed ${TT} step-end infinite}@keyframes feed{${feedK}}`;

  // --- the head ---
  const hx = (X) => f2(TEXT_X + (X + 2.5) * D);
  let headK = '';
  let lastP = -1;
  for (const [t, X] of head) {
    const p = Math.min(100, (t / T) * 100);
    if (p <= lastP) continue;
    headK += `${f3(p)}%{transform:translateX(${hx(X)}px)}`;
    lastP = p;
  }
  if (lastP < 100) headK += `100%{transform:translateX(${hx(head[0][1])}px)}`;
  css += `.hd{animation:hd ${TT} linear infinite}@keyframes hd{${headK}}`;
  // the DATA lamp is lit while a line is printing
  let lampK = '0%{opacity:.25}';
  for (const r of reveals) lampK += `${pct(r.a)}{opacity:.25}${pct(r.a + 0.001)}{opacity:1}${pct(r.b)}{opacity:1}${pct(r.b + 0.001)}{opacity:.25}`;
  css += `.lp{animation:lp ${TT} step-end infinite}@keyframes lp{${lampK}100%{opacity:.25}}`;

  // --- the printer (fixed) ---
  const py = PRINTER_Y;
  let pr = '';
  // shadow the lid throws up the paper
  pr += `<rect x="${PAPER_X}" y="${py - 12}" width="${PAPER_W}" height="12" fill="url(#lid)"/>`;
  // the carriage: rail, ribbon and the head, seen through the smoked cover
  pr += `<rect x="12" y="${py}" width="${VB_W - 24}" height="48" rx="3" fill="#15171a"/>`;
  pr += `<rect x="70" y="${py + 7}" width="${VB_W - 140}" height="6" fill="#050506"/>`; // ribbon
  pr += `<rect x="60" y="${py + 30}" width="${VB_W - 120}" height="5" rx="2.5" fill="url(#rod)"/>`; // rail
  // the print head (moves): pin plate at the top, fins below
  const hg = `<g class="hd" transform="translate(${hx(lineExtent(PERIOD_LINES[H0 % P]).x1)} 0)">`
    + `<rect x="-17" y="${py + 24}" width="34" height="17" rx="3" fill="#202226"/>`
    + `<rect x="-13" y="${py - 9}" width="26" height="37" rx="3" fill="url(#headMetal)"/>`
    + `<path d="M-10 ${py + 2}h20M-10 ${py + 6}h20M-10 ${py + 10}h20M-10 ${py + 14}h20M-10 ${py + 18}h20" stroke="#3d4148" stroke-width="1.8"/>`
    + `<rect x="-13" y="${py - 9}" width="26" height="1.6" rx=".8" fill="#fff" opacity=".45"/>`
    + `<rect x="-6" y="${py - 11.5}" width="12" height="4" rx="1" fill="#141518"/>`
    + `<circle cx="0" cy="${py + 33}" r="2.4" fill="#7c828a"/>`
    + `</g>`;
  pr += hg;
  // smoked acrylic cover over the carriage
  pr += `<rect x="12" y="${py + 2}" width="${VB_W - 24}" height="46" rx="3" fill="#2a2522" opacity=".5"/>`;
  pr += `<path d="M120 ${py + 2}h90l-40 46h-90zM250 ${py + 2}h24l-40 46h-24z" fill="#fff" opacity=".05"/>`;
  pr += `<rect x="12" y="${py}" width="${VB_W - 24}" height="1.5" fill="#fff" opacity=".18"/>`;
  // tear bar along the top of the cover, with its teeth
  let teeth = `M${SHEET_X - 10} ${py + 2}`;
  for (let x = SHEET_X - 10; x < SHEET_X + SHEET_W + 10; x += 6) teeth += `l3 -2.6l3 2.6`;
  pr += `<path d="${teeth}v4H${SHEET_X - 10}z" fill="#aeb3ba"/>`;
  // body
  const by = py + 48;
  pr += `<path d="M0 ${by + 6}q0 -6 8 -6h${VB_W - 16}q8 0 8 6V${VB_H}H0z" fill="url(#body)"/>`;
  pr += `<rect x="6" y="${by}" width="${VB_W - 12}" height="1.6" fill="#fff" opacity=".55"/>`;
  pr += `<rect x="6" y="${by + 1.6}" width="${VB_W - 12}" height="1.2" fill="#8c846f" opacity=".5"/>`;
  // badge: maker and model, debossed
  pr += label('DOLDRUMS', 40, by + 17, 2.2, '#7d7461', '#f3eddf') + label('DM-81  9-PIN', 41, by + 37, 1.2, '#8d846f', '#f3eddf');
  // the maker's mark: three flat stripes, sea, shallows and sunburn
  [['#2f8fc4', 0], ['#3bb7ad', 1], ['#e8806a', 2]].forEach(([c, k]) => { pr += `<rect x="154" y="${by + 17 + k * 5.2}" width="30" height="4" rx="1" fill="${c}"/>`; });
  // vents
  let vents = '';
  for (let k = 0; k < 14; k++) vents += `M${330 + k * 22} ${by + 16}h12v20h-12z`;
  pr += `<path d="${vents}" fill="#a39a83"/><path d="${vents.replace(/v20/g, 'v3')}" fill="#6f6754"/>`;
  // control panel: lamps and keys
  const cx0 = 690;
  pr += `<rect x="${cx0}" y="${by + 10}" width="268" height="38" rx="5" fill="#2b2a28"/>`;
  pr += `<rect x="${cx0}" y="${by + 10}" width="268" height="1.5" rx=".75" fill="#000" opacity=".5"/>`;
  const lamps = [['POWER', '#7bdc6a', ''], ['ON LINE', '#7bdc6a', ''], ['DATA', '#ffb347', 'lp']];
  lamps.forEach(([name, col, cls], k) => {
    const lx = cx0 + 22 + k * 52;
    pr += `<circle cx="${lx}" cy="${by + 21}" r="3.6" fill="#141414"/><circle${cls ? ` class="${cls}"` : ''} cx="${lx}" cy="${by + 21}" r="2.8" fill="${col}"/>`;
    pr += label(name, lx - (name.length * 6 * 0.8) / 2 + 0.4, by + 31, 0.8, '#c9c2b1');
  });
  [['LF', 0], ['FF', 1]].forEach(([name, k]) => {
    const kx = cx0 + 176 + k * 44;
    pr += `<rect x="${kx}" y="${by + 16}" width="34" height="24" rx="3" fill="#d9d2c0"/><rect x="${kx}" y="${by + 36}" width="34" height="4" rx="2" fill="#a59c86"/>`;
    pr += label(name, kx + 17 - 5.5, by + 22, 1, '#5f5848');
  });
  // the tractors, gripping the sprocket strips
  for (const tx of [PAPER_X - 5, SHEET_X + SHEET_W - 5]) {
    const tw = STRIP + 10;
    pr += `<rect x="${tx}" y="${py - 26}" width="${tw}" height="44" rx="6" fill="#1d1f23"/>`;
    pr += `<rect x="${tx + 4}" y="${py - 23}" width="${tw - 8}" height="27" rx="4" fill="#3a3d43"/>`;
    pr += `<rect x="${tx + 4}" y="${py - 23}" width="${tw - 8}" height="1.6" rx=".8" fill="#fff" opacity=".2"/>`;
    let ridges = '';
    for (let k = 0; k < 5; k++) ridges += `M${tx + 10} ${py - 17 + k * 4}h${tw - 20}`;
    pr += `<path d="${ridges}" stroke="#2a2c31" stroke-width="1.6"/>`;
    pr += `<circle cx="${tx + tw / 2}" cy="${py + 10}" r="4" fill="#4a4e55"/><circle cx="${tx + tw / 2}" cy="${py + 10}" r="1.6" fill="#1d1f23"/>`;
  }

  // --- assemble ---
  const style = `
.sh{fill:#fbfbf5}.gb{fill:#ddefd8}.st{fill:#f4f2ea}.hl{fill:#16191d}.hr{fill:none;stroke:#cfccbf;stroke-width:1.2}
.pf{stroke:#c8c6ba;stroke-width:.8;stroke-dasharray:2 2.5}.fd{stroke:#9fa69b;stroke-width:1;stroke-dasharray:3 2.2}
.ink{fill:none;stroke-linecap:round;stroke-width:1.12}.gi{stroke-width:1.2}.bd{stroke-width:1.5;stroke-dasharray:0 1}.pc{stroke-width:1.05}
@media (prefers-color-scheme:dark){.sh{fill:#e9e9e1}.gb{fill:#cde0c8}.st{fill:#e0ded4}}
${css}
@media (prefers-reduced-motion:reduce){.pp,.hd,.lp,[class^=k]{animation:none!important}}`;
  const defs = `<defs>
<clipPath id="panel"><rect width="${VB_W}" height="${VB_H}" rx="16"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14171c"/><stop offset="1" stop-color="#252a31"/></linearGradient>
<linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14171c" stop-opacity=".92"/><stop offset=".45" stop-color="#14171c" stop-opacity=".35"/><stop offset="1" stop-color="#14171c" stop-opacity="0"/></linearGradient>
<linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="crease" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".07"/><stop offset=".52" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7dbe0"/><stop offset=".5" stop-color="#8b9098"/><stop offset="1" stop-color="#4b4f55"/></linearGradient>
<linearGradient id="headMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ced4"/><stop offset=".45" stop-color="#959ba3"/><stop offset="1" stop-color="#5a5f67"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dfcd"/><stop offset=".55" stop-color="#d8d0bb"/><stop offset="1" stop-color="#bfb59c"/></linearGradient>
<linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
${glyphDefs}
${lineDefs}
${clips}
</defs>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}" role="img" aria-label="CASTAWAY, a job banner page on green-bar tractor-feed paper, printing">
<title>CASTAWAY: job 1992, printing on green-bar paper</title>
<desc>A job banner page on green-bar tractor-feed paper with sprocket strips: CASTAWAY in giant letters built from the letters themselves between two field lines, then an excerpt of the real schedule report for seed 1992 and a small dot-matrix picture of her on the island while a ship passes behind her. An invented nine-pin printer prints it line by line as the paper steps up.</desc>
<style>${style}</style>
${defs}
<g clip-path="url(#panel)">
<rect width="${VB_W}" height="${VB_H}" fill="url(#bg)"/>
<rect x="${PAPER_X - 14}" y="0" width="14" height="${VB_H}" fill="url(#side)" transform="matrix(-1 0 0 1 ${2 * PAPER_X - 14} 0)"/>
<rect x="${PAPER_X + PAPER_W}" y="0" width="14" height="${VB_H}" fill="url(#side)"/>
<g class="pp">${paper}</g>
<rect width="${VB_W}" height="44" fill="url(#topfade)"/>
${pr}
</g>
<rect x=".75" y=".75" width="${VB_W - 1.5}" height="${VB_H - 1.5}" rx="15.25" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="1.5"/>
</svg>
`;
  return { svg, T };
}

// Silkscreened labels on the printer body: solid pixels from the 5x7 face.
function label(text, x, y, px, fill, hilite) {
  let d = '';
  [...text].forEach((ch, i) => {
    if (ch === ' ') return;
    glyphRows(ch).forEach((row, ry) => {
      let run = -1;
      for (let rx = 0; rx <= row.length; rx++) {
        const lit = row[rx] === '#';
        if (lit && run < 0) run = rx;
        if (!lit && run >= 0) { d += `M${f2(x + (i * 6 + run) * px)} ${f2(y + ry * px)}h${f2((rx - run) * px)}v${f2(px)}h-${f2((rx - run) * px)}z`; run = -1; }
      }
    });
  });
  const base = `<path d="${d}" fill="${fill}"/>`;
  return hilite ? `<path d="${d}" fill="${hilite}" transform="translate(0 ${f2(px * 0.6)})" opacity=".8"/>` + base : base;
}

// ------------------------------------------------------------------ the run card
// 7 3/8 x 3 1/4 inches, 80 columns x 12 rows, rectangular holes, one cut corner,
// columns 73-80 for the deck's sequence field. Card code is the standard 12-row code.
const HOL = {};
[...'ABCDEFGHI'].forEach((ch, i) => { HOL[ch] = [12, i + 1]; });
[...'JKLMNOPQR'].forEach((ch, i) => { HOL[ch] = [11, i + 1]; });
[...'STUVWXYZ'].forEach((ch, i) => { HOL[ch] = [0, i + 2]; });
[...'0123456789'].forEach((ch, i) => { HOL[ch] = [i]; });
Object.assign(HOL, { ' ': [], '-': [11], '/': [0, 1], ':': [2, 8], '.': [12, 3, 8], '*': [11, 4, 8], ',': [0, 3, 8] });
const CARD_TEXT = 'PYTHON TOOLS/SERVE.PY    THEN OPEN HTTP://127.0.0.1:8765/';
const CARD_SEQ = 'CAST1992';

function buildCard() {
  const U = 100; // units per inch
  const W = 7.375 * U, H = 3.25 * U;
  const PAD = 10; // room for the shadow
  const colX = (c) => 0.251 * U + (c - 1) * 0.087 * U; // c = 1..80
  const rowY = (r) => (r === 12 ? 0.25 : r === 11 ? 0.5 : 0.75 + 0.25 * r) * U;
  const HW = 0.055 * U, HH = 0.125 * U;
  const text = CARD_TEXT.padEnd(72, ' ') + CARD_SEQ;
  if (text.length !== 80) throw new Error('card text must be 80 columns');
  const punched = new Set();
  [...text].forEach((ch, i) => {
    const rows = HOL[ch];
    if (!rows) throw new Error(`no card code for ${ch}`);
    for (const r of rows) punched.add(`${i + 1}:${r}`);
  });
  // outline with the corner cut, then every hole as a subpath (evenodd: you see through them)
  const R = 9, CUT_X = 0.26 * U, CUT_Y = 0.44 * U;
  let d = `M${CUT_X} 0H${W - R}Q${W} 0 ${W} ${R}V${H - R}Q${W} ${H} ${W - R} ${H}H${R}Q0 ${H} 0 ${H - R}V${CUT_Y}Z`;
  for (const key of punched) {
    const [c, r] = key.split(':').map(Number);
    d += `M${f2(colX(c) - HW / 2)} ${f2(rowY(r) - HH / 2)}h${HW}v${HH}h-${HW}z`;
  }
  // preprinted digits 0-9 in every column that is not punched there; column numbers
  const t3 = (ch, x, y, s) => {
    let p = '';
    T3[ch].split('|').forEach((row, ry) => [...row].forEach((c, rx) => { if (c === '#') p += `M${f2(x + rx * s)} ${f2(y + ry * s)}h${f2(s)}v${f2(s)}h-${f2(s)}z`; }));
    return p;
  };
  // (the holes cut through them: the face is clipped by the card, holes and all)
  let symbols = '';
  for (let k = 0; k <= 9; k++) {
    symbols += `<path id="p${k}" d="${t3(String(k), -1.8, -3, 1.2)}"/>`;
    symbols += `<path id="n${k}" d="${t3(String(k), 0, 0, 0.75)}"/>`;
  }
  symbols += `<g id="col">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => `<use href="#p${r}" y="${f2(rowY(r))}"/>`).join('')}</g>`;
  let digits = '';
  for (let c = 1; c <= 80; c++) digits += `<use href="#col" x="${f2(colX(c))}"/>`;
  let colnums = '';
  for (let c = 1; c <= 80; c++) {
    const s = String(c), w = s.length * 3 * 0.75 + (s.length - 1) * 0.75;
    [...s].forEach((ch, k) => {
      const x = f2(colX(c) - w / 2 + k * 3 * 0.75 + k * 0.75);
      colnums += `<use href="#n${ch}" x="${x}" y="${f2(rowY(0) + 8.2)}"/><use href="#n${ch}" x="${x}" y="${f2(rowY(9) + 9.5)}"/>`;
    });
  }
  // the keypunch's dot-matrix print along the top edge
  let printed = '';
  [...text].forEach((ch, i) => {
    if (ch === ' ') return;
    const dots = [];
    glyphRows(ch).forEach((row, y) => [...row].forEach((cc, x) => { if (cc === '#') dots.push([x, y]); }));
    printed += dotPath(dots.map(([x, y]) => [colX(i + 1) / 1.15 - 2 + x, y]), 0, 0);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-PAD} ${-PAD} ${W + 2 * PAD} ${H + 2 * PAD}" width="${W + 2 * PAD}" height="${H + 2 * PAD}" role="img" aria-label="An 80-column punched card that says PYTHON TOOLS/SERVE.PY, THEN OPEN HTTP://127.0.0.1:8765/">
<title>The run card: python tools/serve.py, then open http://127.0.0.1:8765/</title>
<defs>
<linearGradient id="cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5ebcf"/><stop offset="1" stop-color="#eadcb7"/></linearGradient>
<clipPath id="cc"><path d="${d}" clip-rule="evenodd"/></clipPath>
${symbols}
</defs>
<path d="${d}" fill="#000" opacity=".22" fill-rule="evenodd" transform="translate(2.5 3.5)"/>
<path d="${d}" fill="url(#cs)" fill-rule="evenodd"/>
<g clip-path="url(#cc)">
<rect x="0" y="0" width="${W}" height="${0.05 * U}" fill="#e8806a"/>
<path d="M${f2(colX(72) + 0.0435 * U)} ${0.12 * U}V${H - 0.06 * U}" stroke="#e8806a" stroke-width=".8" stroke-dasharray="3 2"/>
<g fill="#9c8b68" opacity=".75">${digits}${colnums}</g>
<g transform="translate(0 ${0.06 * U}) scale(1.15)" fill="none" stroke="#2b2724" stroke-linecap="round" stroke-width="1.05"><path d="${printed}"/></g>
</g>
<path d="${d.split('M').slice(0, 2).join('M')}" fill="none" stroke="#c9b98f" stroke-width="1"/>
</svg>
`;
  return svg;
}

// ------------------------------------------------------------------ the markdown
function textBannerPage() {
  const rule = '#'.repeat(COLS);
  return [
    rule,
    FIELD_TOP,
    '',
    ...[0, 1, 2, 3, 4, 5, 6].map((r) => giantRow(r).replace(/\s+$/, '')),
    '',
    FIELD_BOT,
    rule,
  ].join('\n');
}
function textReport() {
  const R = REPORT.rows;
  return [
    REPORT.head,
    '',
    REPORT.cols,
    '',
    REPORT.regular,
    R.coconut_sip, R.stroll, R.jog_lap, R.fishing_quiet, R.sandcastle,
    '    ...',
    '',
    REPORT.occasional,
    R.ship_passes_unseen, R.message_in_bottle, R.turtle_visit,
    '    ...',
    '',
    REPORT.rare,
    R.delivery_drone, R.signal_hunt, R.cat_visit, R.shark_nod, R.tour_boat_selfies,
    '    ...',
    '',
    REPORT.superRare,
    R.rescue_almost, R.leave_any_time,
    '    ...',
    '',
    REPORT.chained,
    R.tide_takes_sandcastle, R.bottle_reply,
    '    ...',
    '',
    REPORT.busy,
    REPORT.cat,
    '',
    REPORT.first,
    '    ...',
    ...REPORT.events,
  ].join('\n');
}

// Lasts ranges and tiers: from activities.toml, 2026-10-01. Notes paraphrase each `about`.
const QUEUE = [
  ['coconut_sip', 'regular', '0:27-0:51', 'the ship waits for this'],
  ['sandcastle', 'regular', '0:57-1:54', 'builds one for the tide'],
  ['tide_takes_sandcastle', 'chained', '0:05-0:08', 'the tide accepts'],
  ['ship_passes_unseen', 'occasional', '1:30-2:30', 'waits for her to be busy'],
  ['message_in_bottle', 'occasional', '1:17-2:17', 'washes straight back'],
  ['bottle_reply', 'chained', '0:40-1:07', 'a different bottle answers'],
  ['turtle_visit', 'occasional', '3:13-6:06', 'they both doze off'],
  ['coconut_crab', 'occasional', '1:11-2:42', 'the crab leaves wearing it'],
  ['a3_kumara_planting', 'occasional', '0:25-0:44', 'it grows over the video'],
  ['delivery_drone', 'rare', '0:39-0:57', 'parcel: more headphones'],
  ['signal_hunt', 'rare', '1:54-4:10', 'one bar, top of the palm'],
  ['cat_visit', 'rare', '11:04-26:46', 'crate, palm, nap'],
  ['shark_nod', 'rare', '0:49-1:17', 'in headphones, on the beat'],
  ['tour_boat_selfies', 'rare', '0:52-1:21', 'nobody offers a lift'],
  ['efoil_bro', 'rare', '0:30-0:51', 'shaka, carve, gone'],
  ['fire_by_friction', 'rare', '0:43-1:11', 'a wave puts it out'],
  ['hammock', 'rare', '1:35-3:59', 'strung from palm to raft'],
  ['lookout', 'rare', '0:47-1:15', 'palm bends to ground level'],
  ['leave_any_time', 'super_rare', '1:19-1:59', 'back with an iced coffee'],
];
function textQueue() {
  const row = (a, b, c, d, e) => `${a.padEnd(7)}${b.padEnd(23)}${c.padEnd(12)}${d.padEnd(12)}${e}`;
  const rows = QUEUE.map(([job, tier, lasts, note], i) => row(i === 0 ? 'active' : String(i).padStart(4), job, tier, lasts, note));
  const out = [row('RANK', 'JOB', 'TIER', 'LASTS', 'NOTE'), ...rows];
  for (const l of out) if (l.length > COLS) throw new Error(`queue line over ${COLS}: ${l}`);
  return out.join('\n');
}

function buildMd() {
  const alt = 'CASTAWAY in giant letters, each one printed out of small copies of itself, on a job banner page '
    + 'of green-bar tractor-feed paper with sprocket holes down both edges. Above it the job line reads: '
    + 'START, JOB 1992, DELIVER TO: 1 PALM, 1 RAFT, NO RUSH. Below it: NOTE: A SHIP WENT PAST AT 0:24:18. '
    + 'SHE WAS BUSY WITH A COCONUT. Under that, an excerpt of the real schedule report for seed 1992: '
    + 'regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, super rare every 3 to 6 '
    + 'hours; the ship comes round 9 times, the cat 5 times, leave_any_time never; she is busy 28% of the run '
    + 'and idling 72%; and in the first half hour coconut_sip starts at 0:24:09 and ship_passes_unseen at 0:24:18. '
    + 'Beside those lines, a small dot-matrix picture: an island with one palm, her sitting on the sand in big '
    + 'headphones with a coconut and a straw, a raft, and a ship on the horizon behind her. A dot-matrix printer '
    + 'along the bottom prints the next copy line by line while the paper steps upward.';
  const cardAlt = 'An 80-column punched card, cream with a coral stripe and one cut corner, punched and printed: '
    + 'PYTHON TOOLS/SERVE.PY, THEN OPEN HTTP://127.0.0.1:8765/. Sequence field: CAST1992.';
  return `<!-- Header 08-tractor-feed_opus_5.5 for Castaway. Generated by src/08-tractor-feed_opus_5.5.mjs: edit that, not this. -->

<p align="center">
  <img src="${SVG_REF}" width="100%" alt="${esc(alt)}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>Ten hours of a woman on a very small island, in which almost nothing happens, on purpose.</b><br>
  <sub>JOB 1992 &nbsp;·&nbsp; TEN HOURS &nbsp;·&nbsp; ONE PALM &nbsp;·&nbsp; ONE RAFT &nbsp;·&nbsp; NO RUSH</sub>
</p>

Castaway is a stationary-frame lo-fi video for YouTube, the ten-hour kind you leave on: one tall palm, one raft, one young woman in cream headphones nodding to the music, and a great deal of time. Every few minutes she does something small. Every so often something happens to her. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver Johnny Castaway, painted in sunny coastal lo-fi: 16:9, 1080p at 30 fps, and always daytime. In development; no video is out yet.

A message in a bottle washes straight back. A drone delivers a parcel, and the parcel is another pair of headphones. A shark in headphones nods to the beat. A coconut falls on a hermit crab, and the crab walks off wearing it. She could leave any time: once in a very long while she walks out over the water and comes back with an iced coffee. And a ship crosses the horizon, but first it waits, up to ten minutes, for her to get busy with a coconut, a sandcastle, a fish or a lap. She never sees it. On the day this page was printed, seed 1992 sent it past at 0:24:18, nine seconds into a coconut.

**The schedule is the script.** [activities.toml](activities.toml) lists 92 activities (as of 2026-10-01), and four tiers of timers decide how often they come round: regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, and super rare every 3 to 6 hours, three a run at most. A typical ten-hour run comes to about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus a dozen or more follow-ups (a reply to a bottle, the tide coming for a sandcastle), and the rest is idling. Lanes let things overlap, which is how the ship gets past her. Every activity starts on the next bar of the music, every 3 seconds, so the gags land on the beat. Same seed, same schedule, event for event.

**Every sound is synthesized from code** by [tools/make_audio.py](tools/make_audio.py): more than 150 files and not one borrowed sample, loop or recording, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major. Nobody has listened to any of it yet. The meters have, and they say -14 LUFS.

<p align="center">
  <img src="${CARD_REF}" width="460" alt="${esc(cardAlt)}">
</p>

No card reader? Type it in:

\`\`\`sh
python tools/serve.py        # then open http://127.0.0.1:8765/
\`\`\`

That page is the renderer: a live preview, then export to a YouTube-ready MP4. It encodes frame-exact H.264 in the browser with WebCodecs, and the server mixes in the sound and joins the two. Plain ES modules, no build step, no npm packages. The working log, decisions and open questions included, is [MUSING.md](MUSING.md).

\`\`\`sh
python tools/schedule.py            # validate it, then simulate ten hours
python tools/render_demo.py --dev   # every activity, one after another
\`\`\`

<details>
<summary><b>The whole print job</b>: the banner page, then the schedule as <code>tools/schedule.py</code> prints it</summary>

<br>

\`\`\`text
${textBannerPage()}

${textReport()}
\`\`\`

The listing is real: an excerpt of what [tools/schedule.py](tools/schedule.py) printed for the default run on 2026-10-01, rows left out where you see \`...\`. The schedule changes daily, so a fresh run will differ. On this printout the turtle, the drone and the shark never come round at all, which is also how islands work. The sandcastle goes up ten times and the tide comes for it ten times. The ship comes round nine times and catches her busy eight of them, four times with a coconut; the ninth time it got tired of waiting. She could leave any time, and doesn't.

</details>

<details>
<summary><b>Print queue</b>: some of the gags, and how long each one takes</summary>

<br>

\`\`\`text
${textQueue()}
\`\`\`

Tiers and running times are from [activities.toml](activities.toml). \`python tools/schedule.py --ready-only\` simulates only what today's assets can show. Around all of it the scene keeps itself busy: shore waves and drifting cloud shadows are built, and distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.

</details>

<details>
<summary><b>Operator's notes</b>: the small print</summary>

<br>

- **Unofficial.** Castaway is inspired by Johnny Castaway (1992); that screensaver, its castaway and its publishers belong to their owners. This project is not affiliated with any of them.
- **Sound.** The theme is 20 bars of exactly 3 seconds, a ii-V-I-vi in F with electric piano, a kalimba lead, soft drums and the synthesized hiss and pop of vinyl. The ocean is its own seamless 60-second loop. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels are adjustable in master and per routine.
- **Video.** The browser export runs at 68 to 78 frames a second at 1080p30 in Chrome. Hard cuts and stepped movement are the motion defaults, which is also how this printer feeds paper.
- **Tools.** [tools/serve.py](tools/serve.py) serves the renderer, [tools/schedule.py](tools/schedule.py) validates and simulates, [tools/make_audio.py](tools/make_audio.py) makes every sound, [tools/render_demo.py](tools/render_demo.py) is the older Python reference renderer.
- **This header.** The printer, its maker DOLDRUMS, the job fields and the run card are invented, and everything in the pictures is drawn from scratch by a script, dot by dot: the font, the giant letters, the island. Job 1992 is the seed. The note on the banner page is accurate for the run printed on 2026-10-01.

</details>
`;
}

// ------------------------------------------------------------------ write
const { svg, T } = buildSvg();
const card = buildCard();
const md = buildMd();
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
fs.writeFileSync(OUT_CARD, card);
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB, loop ${T.toFixed(2)} s)`);
console.log(`wrote ${path.relative(process.cwd(), OUT_CARD)} (${(card.length / 1024).toFixed(1)} KB)`);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}`);
