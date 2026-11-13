#!/usr/bin/env node
// MediaLog as a DOS text-mode tracker, playing your life back as a song.
//
// Style: "DOS text-mode trackers" (catalogue trk-04), in the gold school of Scream Tracker 3:
// an olive-gold panel, black value fields whose stepped outlines are lit pale yellow on the
// bottom and right and shaded brown on the top and left, green values, pale yellow key hints
// with dot leaders, a dotted rule with a centred section title, brown channel tabs, grey
// pattern text with dots for empty fields and every fourth row tinted. Nothing is copied from
// a real screen: the 8x8 face, the big heavy condensed face, the layout, every label and value
// are drawn for this header. MediaLog's own mark (an open book, play on the left page, a pen on
// the right) and its kind colours are the owner's brand, echoed on purpose.
//
// The idea: MediaLog's line is "Everything you've watched, read, played, listened to, on one
// timeline". Four verbs, one timeline: so the module has four channels (01 Watched, 02 Read,
// 03 Played, 04 Listened to) and one pattern list. The kinds of media are the instruments,
// each in its own colour. Orders are the five-year blocks, patterns are years, and every
// entry is a note: title and reaction on the note row, creator under it, details under that.
// The row column holds dates in MediaLog's own precisions: "14 Jan", "?? Mar" when only the
// month is known, and "?? ???" for "sometime in 2015-2019".
//
// The notes rotate through the channels (watched, read, played, listened to, again), so the
// pattern is an arpeggio and the verb in the Song field cycles with it, in the colour of
// whatever is playing. The effect column annotates the diary in tracker:
//   SB0/SB1  pattern loop: "Watched the finale again." The playback really goes back a row.
//   H44      vibrato: "Episode 9. Voice went wobbly."
//   D0F      volume slide down: "Fell asleep before the fact."
//   T20      the slowest tempo there is: a game about being a glacier.
//   ^^^      note cut: "Still can't."
// A podcast logged as 2020-2024 is one long held note, until the next listen in channel 04 cuts
// it. The song ends on today (10 Oct 2026), where the cursor waits in channel 03 and the Note
// line asks the home page's question: "What did you play?" Then it starts again in 2016.
//
// Every title, creator, studio, artist and note here is invented (Moby-Dick is public domain).
//
// Regenerate:  node examples/medialog/src/01-text-mode-tracker_opus_5.5.mjs
// Plain Node, no dependencies, deterministic (no clock, no randomness).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '01-text-mode-tracker_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Geometry: an 80-column screen of 8 px cells, rows 9 px tall (an 8x8 face plus one line).
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 47, CW = 8, RH = 9, GY = 1;   // GY: glyph top inside its row
const MG = 6, BZ = 14;                                 // gold margin, bezel
const SW = COLS * CW, SH = ROWS * RH;
const VBW = SW + 2 * (MG + BZ), VBH = SH + 2 * (MG + BZ);
const X = (c) => c * CW;
const Y = (r) => r * RH;

// Rows the layout refers to.
const R_FIELDS = 9;            // Song / Instrument / Order / Pattern
const R_KEYS = 14;             // key hints, three rows
const R_STATUS = 18;           // status line: Playing, Order, Row, Channels, Time
const R_RULE = 20;             // dotted rule and section title
const R_TABS = 21;             // channel tabs
const PT = 22, V = 20;         // pattern window: first row, visible rows
const BAND = 6;                // the current row, counted from the window top
const R_NOTE = 43;             // the Note line
const R_LEG = 45;              // the instrument (kind) strip

// Pattern columns: 7-character row labels, then four channels of 17 cells with a gap.
const LBL = 0, LBLW = 7;
const CH0 = 8, CHW = 17, CHS = 18;
const chCol = (c) => CH0 + c * CHS;
const TXTW = 13, FXC = 14;      // text field (13 cells), effect field at cell 14 (3 cells)

// ---------------------------------------------------------------------------------------------
// Palette. The panel, edges, labels, values and pattern grey follow the gold school (values
// re-measured from a reference screen); the kind colours are MediaLog's, lifted so they read
// on black.
// ---------------------------------------------------------------------------------------------
const P = {
  gold: '#A69255', ink: '#2A2620', brown: '#514528', pale: '#FFDF86', shade: '#302C28',
  black: '#000000', green: '#00B200', grey: '#9A9692', dim: '#77736C', dot: '#5C5852',
  fx: '#D9CFA8', year: '#463C22', tint: '#26231F', tint16: '#332E27', bandEdge: '#7C6C42',
  bezel: '#17150F', bezelHi: '#2C281F',
};
const KINDS = [
  { name: 'Movies', c: '#F06A60' },
  { name: 'TV shows', c: '#5AA8EE' },
  { name: 'Anime', c: '#5AA8EE' },
  { name: 'Books', c: '#E9A33A' },
  { name: 'Comics', c: '#E86BB4' },
  { name: 'Manga', c: '#E86BB4' },
  { name: 'Games', c: '#9DCD3E' },
  { name: 'Podcasts', c: '#A88DF6' },
  { name: 'Music', c: '#2FCDAA' },
  { name: 'Videos', c: '#BC82AC' },
];
const K = Object.fromEntries(KINDS.map((k, i) => [k.name, i]));
const VERBS = ['watched', 'read', 'played', 'listened to'];
const TABS = ['01: Watched', '02: Read', '03: Played', '04: Listened to'];

// Glyph stand-ins for MediaLog's reactions.
const LOVE = '♥', LIKE = '¤', FACE = '☺';

// ---------------------------------------------------------------------------------------------
// An original 8x8 face: 2 px stems, 1 px bars, capitals 7 rows tall, lower case with a
// 5-row body; g, j, p, q and y lift their bowls a row so the tails fit the cell.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
const G = (ch, ...rows) => FONT.set(ch, rows);
G('A', '..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##');
G('B', '######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.');
G('C', '..####.', '.##..##', '##.....', '##.....', '##.....', '.##..##', '..####.');
G('D', '#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..');
G('E', '#######', '##.....', '##.....', '#####..', '##.....', '##.....', '#######');
G('F', '#######', '##.....', '##.....', '#####..', '##.....', '##.....', '##.....');
G('G', '..####.', '.##..##', '##.....', '##..###', '##...##', '.##..##', '..#####');
G('H', '##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##');
G('I', '.####..', '..##...', '..##...', '..##...', '..##...', '..##...', '.####..');
G('J', '...####', '....##.', '....##.', '....##.', '##..##.', '##..##.', '.####..');
G('K', '##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##');
G('L', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######');
G('M', '##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##');
G('N', '##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##');
G('O', '..###..', '.##.##.', '##...##', '##...##', '##...##', '.##.##.', '..###..');
G('P', '######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....');
G('Q', '..###..', '.##.##.', '##...##', '##...##', '##.#.##', '.##.##.', '..##.##');
G('R', '######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##');
G('S', '.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.');
G('T', '######.', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...');
G('U', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.');
G('V', '##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...');
G('W', '##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##');
G('X', '##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##');
G('Y', '##..##.', '##..##.', '##..##.', '.####..', '..##...', '..##...', '..##...');
G('Z', '#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######');
G('a', '.......', '.......', '.####..', '....##.', '.#####.', '##..##.', '.###.##');
G('b', '##.....', '##.....', '#####..', '##..##.', '##..##.', '##..##.', '#####..');
G('c', '.......', '.......', '.####..', '##..##.', '##.....', '##..##.', '.####..');
G('d', '....##.', '....##.', '.#####.', '##..##.', '##..##.', '##..##.', '.#####.');
G('e', '.......', '.......', '.####..', '##..##.', '######.', '##.....', '.####..');
G('f', '..###..', '.##..#.', '.##....', '####...', '.##....', '.##....', '####...');
G('g', '.......', '.......', '.###.##', '##..##.', '##..##.', '.#####.', '....##.', '#####..');
G('h', '##.....', '##.....', '##.##..', '###.##.', '##..##.', '##..##.', '##..##.');
G('i', '..##...', '.......', '.###...', '..##...', '..##...', '..##...', '.####..');
G('j', '....##.', '.......', '...###.', '....##.', '....##.', '....##.', '##..##.', '.####..');
G('k', '##.....', '##.....', '##..##.', '##.##..', '####...', '##.##..', '##..##.');
G('l', '.###...', '..##...', '..##...', '..##...', '..##...', '..##...', '.####..');
G('m', '.......', '.......', '##.##..', '#######', '##.#.##', '##.#.##', '##...##');
G('n', '.......', '.......', '#####..', '##..##.', '##..##.', '##..##.', '##..##.');
G('o', '.......', '.......', '.####..', '##..##.', '##..##.', '##..##.', '.####..');
G('p', '.......', '.......', '#####..', '##..##.', '##..##.', '#####..', '##.....', '##.....');
G('q', '.......', '.......', '.#####.', '##..##.', '##..##.', '.#####.', '....##.', '....##.');
G('r', '.......', '.......', '##.##..', '###.##.', '##.....', '##.....', '##.....');
G('s', '.......', '.......', '.#####.', '##.....', '.####..', '....##.', '#####..');
G('t', '.##....', '.##....', '#####..', '.##....', '.##....', '.##.##.', '..###..');
G('u', '.......', '.......', '##..##.', '##..##.', '##..##.', '##..##.', '.#####.');
G('v', '.......', '.......', '##..##.', '##..##.', '##..##.', '.####..', '..##...');
G('w', '.......', '.......', '##...##', '##.#.##', '##.#.##', '#######', '.##.##.');
G('x', '.......', '.......', '##..##.', '.####..', '..##...', '.####..', '##..##.');
G('y', '.......', '.......', '##..##.', '##..##.', '##..##.', '.#####.', '....##.', '.####..');
G('z', '.......', '.......', '######.', '...##..', '..##...', '.##....', '######.');
G('0', '.####..', '##..##.', '##.###.', '######.', '###.##.', '##..##.', '.####..');
G('1', '..##...', '.###...', '..##...', '..##...', '..##...', '..##...', '.####..');
G('2', '.####..', '##..##.', '....##.', '..###..', '.##....', '##.....', '######.');
G('3', '.####..', '##..##.', '....##.', '..###..', '....##.', '##..##.', '.####..');
G('4', '...##..', '..###..', '.####..', '##.##..', '######.', '...##..', '...##..');
G('5', '######.', '##.....', '#####..', '....##.', '....##.', '##..##.', '.####..');
G('6', '..###..', '.##....', '##.....', '#####..', '##..##.', '##..##.', '.####..');
G('7', '######.', '##..##.', '...##..', '..##...', '..##...', '..##...', '..##...');
G('8', '.####..', '##..##.', '##..##.', '.####..', '##..##.', '##..##.', '.####..');
G('9', '.####..', '##..##.', '##..##.', '.#####.', '....##.', '...##..', '.###...');
G('.', '.......', '.......', '.......', '.......', '.......', '..##...', '..##...');
G(',', '.......', '.......', '.......', '.......', '.......', '..##...', '..##...', '.##....');
G(':', '.......', '..##...', '..##...', '.......', '.......', '..##...', '..##...');
G(';', '.......', '..##...', '..##...', '.......', '.......', '..##...', '..##...', '.##....');
G("'", '..##...', '..##...', '.##....', '.......', '.......', '.......', '.......');
G('"', '.##.##.', '.##.##.', '.......', '.......', '.......', '.......', '.......');
G('-', '.......', '.......', '.......', '.#####.', '.......', '.......', '.......');
G('_', '.......', '.......', '.......', '.......', '.......', '.......', '.......', '#######');
G('/', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '#......');
G('(', '...##..', '..##...', '.##....', '.##....', '.##....', '..##...', '...##..');
G(')', '.##....', '..##...', '...##..', '...##..', '...##..', '..##...', '.##....');
G('[', '.####..', '.##....', '.##....', '.##....', '.##....', '.##....', '.####..');
G(']', '.####..', '...##..', '...##..', '...##..', '...##..', '...##..', '.####..');
G('!', '..##...', '..##...', '..##...', '..##...', '..##...', '.......', '..##...');
G('?', '.####..', '##..##.', '....##.', '...##..', '..##...', '.......', '..##...');
G('&', '.###...', '##.##..', '.###...', '.###.##', '##.###.', '##..##.', '.###.##');
G('+', '.......', '..##...', '..##...', '######.', '..##...', '..##...', '.......');
G('=', '.......', '.......', '######.', '.......', '######.', '.......', '.......');
G('#', '.##.##.', '.##.##.', '#######', '.##.##.', '#######', '.##.##.', '.##.##.');
G('*', '.......', '.##.##.', '..###..', '#######', '..###..', '.##.##.', '.......');
G('<', '....##.', '...##..', '..##...', '.##....', '..##...', '...##..', '....##.');
G('>', '.##....', '..##...', '...##..', '....##.', '...##..', '..##...', '.##....');
G('^', '...#...', '..###..', '.##.##.', '##...##', '.......', '.......', '.......');
G('~', '.......', '.......', '.###.##', '##.###.', '.......', '.......', '.......');
G('%', '##...##', '##..##.', '...##..', '..##...', '.##....', '##..##.', '#...##.');
G('|', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...');
G('·', '.......', '.......', '.......', '...##..', '...##..', '.......', '.......');
// MediaLog's reactions, drawn as redefined characters: a heart, a thumbs-up, a little face.
G(LOVE, '.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...');
G(LIKE, '...##..', '..##...', '.###...', '#.#####', '#.####.', '#.#####', '#.####.');
G(FACE, '.#####.', '#######', '##.#.##', '#######', '#.###.#', '##...##', '.#####.');
G('♪', '...##..', '...###.', '...#.##', '...#...', '.###...', '####...', '.##....');
G('▶', '.#.....', '.##....', '.###...', '.####..', '.###...', '.##....', '.#.....');

const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
const used = new Set();
function glyphPath(ch) {
  let d = '';
  FONT.get(ch).forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== '#') { x++; continue; }
      let w = 1;
      while (row[x + w] === '#') w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w;
    }
  });
  return d;
}

// Text as <use> of glyph paths, one per character, in a group placed at (x, y) in pixels;
// spaces cost nothing.
function txtAt(x, y, str) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} in ${JSON.stringify(str)}`);
    used.add(ch);
    out += i ? `<use href="#${gid(ch)}" x="${i * CW}"/>` : `<use href="#${gid(ch)}"/>`;
  });
  return out ? `<g transform="translate(${x} ${y})">${out}</g>` : '';
}
const txt = (col, row, str) => txtAt(X(col), Y(row) + GY, str);
const ink = (fill, body, extra = '') => (body ? `<g fill="${fill}"${extra}>${body}</g>` : '');
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
const len = (s) => [...s].length;
const labelR = (end, row, s) => txt(end - len(s) + 1, row, s);
function fit(s, n, what) {
  if (len(s) > n) throw new Error(`${what} too long (${len(s)} > ${n}): ${s}`);
  return s;
}

// ---------------------------------------------------------------------------------------------
// The big face: heavy and condensed like MediaLog's headings, drawn on a 5 px grid. Stems are
// two units, counters one; capitals nine units tall, the body six, the g's tail two more.
// ---------------------------------------------------------------------------------------------
const BIG = {
  M: ['##...##', '###.###', '#######', '##.#.##', '##.#.##', '##...##', '##...##', '##...##', '##...##'],
  e: ['', '', '', '.###.', '##.##', '#####', '##...', '##.##', '.###.'],
  d: ['...##', '...##', '...##', '.####', '##.##', '##.##', '##.##', '##.##', '.####'],
  i: ['##', '##', '', '##', '##', '##', '##', '##', '##'],
  a: ['', '', '', '.###.', '...##', '.####', '##.##', '##.##', '.####'],
  L: ['##...', '##...', '##...', '##...', '##...', '##...', '##...', '##...', '#####'],
  o: ['', '', '', '.###.', '##.##', '##.##', '##.##', '##.##', '.###.'],
  g: ['', '', '', '.####', '##.##', '##.##', '##.##', '##.##', '.####', '...##', '####.'],
};
// MediaLog's mark: an open book, a play triangle on the left page, a pen on the right page.
const MARK = [
  '...................##',
  '..................###',
  '#########.#######.##.',
  '#.......###.....##..#',
  '#..#....#.#....##...#',
  '#..##...#.#...##....#',
  '#..###..#.#..##.....#',
  '#..####.#.#.##......#',
  '#..###..#.#.#.......#',
  '#..##...#.#.##......#',
  '#..#....#.#.........#',
  '#.......#.#.........#',
  '#########.#.#########',
  '.........###.........',
];
// Merge a bitmap into one path of horizontal runs, at (x0, y0) with unit u.
function bitmapPath(rows, x0, y0, u) {
  let d = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== '#') { x++; continue; }
      let w = 1;
      while (row[x + w] === '#') w++;
      d += `M${x0 + x * u} ${y0 + y * u}h${w * u}v${u}h-${w * u}z`;
      x += w;
    }
  });
  return d;
}
function bigWord(word, x0, y0, u, gap) {
  let d = '', x = x0;
  for (const ch of word) {
    const rows = BIG[ch];
    const w = Math.max(...rows.map((r) => r.length));
    d += bitmapPath(rows.map((r) => r.padEnd(w, '.')), x, y0, u);
    x += (w + gap) * u;
  }
  return { d, width: x - gap * u - x0 };
}

// ---------------------------------------------------------------------------------------------
// Insets: black fields over a union of cell rectangles, with the gold school's stepped edges:
// 2 px of brown above and left, 2 px of pale yellow below and right.
// ---------------------------------------------------------------------------------------------
function inset(cellRects, opts = {}) {
  const padT = opts.padT ?? 1, padB = opts.padB ?? 1;
  const cells = new Set();
  for (const [c0, r0, c1, r1] of cellRects)
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells.add(`${c},${r}`);
  const has = (c, r) => cells.has(`${c},${r}`);
  // A cell's box: rows grow by padT above the first row of a run and padB below the last.
  const top = (c, r) => Y(r) - (has(c, r - 1) ? 0 : padT);
  const bot = (c, r) => Y(r + 1) + (has(c, r + 1) ? 0 : padB);
  let blk = '', dk = '', lt = '';
  for (const key of cells) {
    const [c, r] = key.split(',').map(Number);
    const x = X(c), y0 = top(c, r), y1 = bot(c, r);
    blk += `M${x} ${y0}h${CW}v${y1 - y0}h-${CW}z`;
    if (!has(c, r - 1)) dk += `M${x - (has(c - 1, r) ? 0 : 2)} ${y0 - 2}h${CW + (has(c - 1, r) ? 0 : 2)}v2h-${CW + (has(c - 1, r) ? 0 : 2)}z`;
    if (!has(c - 1, r)) dk += `M${x - 2} ${y0}h2v${y1 - y0}h-2z`;
    if (!has(c, r + 1)) lt += `M${x} ${y1}h${CW + (has(c + 1, r) ? 0 : 2)}v2h-${CW + (has(c + 1, r) ? 0 : 2)}z`;
    if (!has(c + 1, r)) lt += `M${x + CW} ${y0 - (has(c, r - 1) ? 0 : 2)}h2v${y1 - y0 + (has(c, r - 1) ? 0 : 2)}h-2z`;
  }
  let notches = '';
  // A notch: the inner corner at the top left of a hanging box (cell c, r) cut at 45 degrees,
  // its slope drawn as brown steps, as the gold school joins a field that hangs off another.
  for (const [c, r, n] of opts.notches || []) {
    const x = X(c), y = top(c, r);
    // black fills the corner; the pale edge above stops where the slope starts, and the slope
    // is a 2 px brown stair that runs into the box's left edge
    let blkN = '', st = '';
    for (let i = 0; i < n; i++) {
      blkN += `M${x - n + i} ${y + i}h${n - i}v1h-${n - i}z`;
      st += `M${x - n + i - 2} ${y + i}h2v1h-2z`;
    }
    notches += `<path d="${blkN}" fill="${P.black}"/><path d="${st}" fill="${P.brown}"/>`;
  }
  return `<path d="${dk}" fill="${P.brown}"/><path d="${lt}" fill="${P.pale}"/><path d="${blk}" fill="${P.black}"/>${notches}`;
}

// ---------------------------------------------------------------------------------------------
// The song: twenty entries and today, in order. One slot each, three rows: the note row
// (title and reaction), the creator, the details (or a short custom verdict). ch: the verb
// channel. fx: effect column per row. note: the Note line while the slot plays.
// ---------------------------------------------------------------------------------------------
const SONG = [
  // Order 000: 2015-2019
  { blk: '2015-2019', pat: '2016', day: ' 3 Feb', yr: '2016', ch: 0, k: 'Movies', t: 'Owl Lawyer', r: LIKE, by: 'Petra Holm', x: '', note: 'Cinema. Sat behind a tall man.' },
  { blk: '2015-2019', pat: '2016', day: '?? Apr', yr: '2016', ch: 1, k: 'Comics', t: 'Beekeeper X', r: LOVE, by: 'Ola Brandt', x: '', note: 'Read it outside. One bee.' },
  { blk: '2015-2019', pat: '2016', day: '19 Aug', yr: '2016', ch: 2, k: 'Games', t: 'Pebble Sim', r: LIKE, by: 'Small Rocks', x: '', note: 'Sorted 40,000 pebbles. Calm now.' },
  { blk: '2015-2019', pat: '2016', day: '26 Nov', yr: '2016', ch: 3, k: 'Music', t: 'Cat Waltzes', r: LOVE, by: 'Pip Calloway', x: '', note: 'The cat left during track 2.' },
  { blk: '2015-2019', pat: '????', day: '?? ???', yr: '2015-19', ch: 0, k: 'Movies', t: 'Mayor Bot 2', r: LIKE, by: 'Rex Bexley', x: '', note: "Haven't seen the first one." },
  { blk: '2015-2019', pat: '????', day: '?? ???', yr: '2015-19', ch: 1, k: 'Books', t: 'Moby-Dick', r: FACE, by: 'H. Melville', x: 'Long. Wet.', note: 'Long. Wet. Finished it, sometime.' },
  { blk: '2015-2019', pat: '????', day: '?? ???', yr: '2015-19', ch: 2, k: 'Games', t: 'Sock Puzzle', r: LIKE, by: 'Odd Pair', x: '', note: 'One sock still missing.' },
  // Order 001: 2020-2024
  { blk: '2020-2024', pat: '2020-24', day: '2020-24', yr: '', ch: 3, k: 'Podcasts', t: 'Ask a Buoy', r: LOVE, by: 'Dot Ferris', x: 'E1-212', note: '212 episodes. Still a buoy.', hold: true },
  { blk: '2020-2024', pat: '2022', day: '14 Jan', yr: '2022', ch: 0, k: 'TV shows', t: 'Floor Four', r: LOVE, by: 'Ines Marlow', x: 'S3 E1-6', fx: ['SB0', 'SB1', ''], loop: true, note: 'Watched the finale again. Same floor.' },
  { blk: '2020-2024', pat: '2022', day: '?? Mar', yr: '2022', ch: 1, k: 'Books', t: 'Salt Hours', r: LIKE, by: 'Iris Penhale', x: 'audiobook', note: 'Read it with my ears.' },
  { blk: '2020-2024', pat: '2022', day: ' 2 Dec', yr: '2022', ch: 2, k: 'Games', t: 'Lair Lease', r: LIKE, by: 'Gloam Works', x: '', note: "Fixed the dragon's boiler. Got a card." },
  { blk: '2020-2024', pat: '2024', day: '?? Jun', yr: '2024', ch: 3, k: 'Music', t: 'Polka Gold', r: LOVE, by: 'Mo Bellows', x: '', note: 'Danced. Neighbours knocked.' },
  // Order 002: 2025-2029
  { blk: '2025-2029', pat: '2025', day: ' 5 Apr', yr: '2025', ch: 0, k: 'Anime', t: 'Paper Ronin', r: LOVE, by: 'Studio Hob', x: 'S1 E1-12', fx: ['', 'H44', ''], note: 'Episode 9. Voice went wobbly.' },
  { blk: '2025-2029', pat: '2025', day: '?? Jul', yr: '2025', ch: 1, k: 'Manga', t: 'Ramen Ghost', r: LIKE, by: 'Rin Kosaka', x: '', note: 'Hungry now.' },
  { blk: '2025-2029', pat: '2025', day: '30 Nov', yr: '2025', ch: 2, k: 'Games', t: 'Grow Moss', r: LOVE, by: 'Slow Pond', x: '', note: 'Nothing happened. Lovely.' },
  { blk: '2025-2029', pat: '2025', day: '?? Dec', yr: '2025', ch: 3, k: 'Podcasts', t: 'Quiet Facts', r: LIKE, by: 'Hollis Grey', x: 'E40', fx: ['', 'D0F', ''], note: 'Fell asleep before the fact.' },
  { blk: '2025-2029', pat: '2026', day: ' 2 Jan', yr: '2026', ch: 0, k: 'Videos', t: 'Juggle 101', r: FACE, by: 'Wren Dodd', x: "Still can't.", fx: ['', '', '^^^'], note: "Still can't. Dropped the remote." },
  { blk: '2025-2029', pat: '2026', day: '?? Feb', yr: '2026', ch: 1, k: 'Books', t: 'Nine Lamps', r: LIKE, by: 'Ida Crane', x: 'ebook', note: 'Read it in one sitting. Four days.' },
  { blk: '2025-2029', pat: '2026', day: '14 Mar', yr: '2026', ch: 2, k: 'Games', t: 'Glacier Run', r: LIKE, by: 'Firn Games', x: '', fx: ['', 'T20', ''], note: 'Moved 2 cm. Thrilling.' },
  { blk: '2025-2029', pat: '2026', day: ' 9 Oct', yr: '2026', ch: 3, k: 'Music', t: 'Queue Music', r: LOVE, by: 'Line Busy', x: '', note: 'Still on hold.', hold: true },
  // Today: nothing logged yet. The cursor waits in channel 03.
  { blk: '2025-2029', pat: '2026', day: '10 Oct', yr: '2026', ch: 2, today: true, note: 'Today. What did you play?' },
];

// ---------------------------------------------------------------------------------------------
// Timeline. One row every ROWT seconds, three rows a slot; the pattern loop in slot 8 plays
// its first two rows twice. The loop is exactly the length of the song.
// ---------------------------------------------------------------------------------------------
const ROWT = 0.75;
const N = SONG.length * 3;                 // loop rows
const seq = [];                            // row index at each step
SONG.forEach((s, i) => {
  const r0 = i * 3;
  if (s.loop) seq.push(r0, r0 + 1, r0, r0 + 1, r0 + 2);
  else seq.push(r0, r0 + 1, r0 + 2);
});
const LOOP = seq.length * ROWT;
// When each slot becomes current (its note row reaches the band) and how long it stays.
const slotT = [];
{
  let step = 0;
  SONG.forEach((s, i) => {
    slotT.push(step * ROWT);
    step += s.loop ? 5 : 3;
  });
}
const slotEnd = (i) => (i + 1 < SONG.length ? slotT[i + 1] : LOOP);

// ---------------------------------------------------------------------------------------------
// CSS animation registry (discrete keyframes, held until the next one)
// ---------------------------------------------------------------------------------------------
const css = [];
let animN = 0;
const pct = (t, period) => +((t / period) * 100).toFixed(4);
function holdAnim(frames, period = LOOP) {
  const name = `k${(animN++).toString(36)}`;
  css.push(`@keyframes ${name}{${frames.map(([t, d]) => `${pct(t, period)}%{${d}}`).join('')}}`);
  css.push(`.${name}{animation:${name} ${period}s steps(1,end) infinite}`);
  return name;
}
// Visible only during the given [t0, t1) intervals of the loop.
function during(intervals) {
  const frames = [];
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  if (!sorted.length || sorted[0][0] > 0) frames.push([0, 'opacity:0']);
  for (const [t0, t1] of sorted) {
    frames.push([t0, 'opacity:1']);
    if (t1 < LOOP) frames.push([t1, 'opacity:0']);
  }
  // merge duplicate times (an interval ending where the next begins)
  const out = [];
  for (const f of frames) {
    if (out.length && Math.abs(out[out.length - 1][0] - f[0]) < 1e-9) out[out.length - 1] = f;
    else out.push(f);
  }
  return holdAnim(out);
}
// A field whose value changes with the slot: stacked values in a one-row viewport, stepped.
function slotTicker(x, y, w, values, colours) {
  const uniq = [];
  const key = (v, c) => `${c}|${v}`;
  values.forEach((v, i) => { if (!uniq.some((u) => key(u.v, u.c) === key(v, colours[i]))) uniq.push({ v, c: colours[i] }); });
  const idx = values.map((v, i) => uniq.findIndex((u) => key(u.v, u.c) === key(v, colours[i])));
  const frames = [];
  idx.forEach((k, i) => {
    if (i && k === idx[i - 1]) return;
    frames.push([slotT[i], `transform:translateY(${-k * RH}px)`]);
  });
  const cls = holdAnim(frames);
  const byColour = new Map();
  uniq.forEach((u, k) => {
    if (!byColour.has(u.c)) byColour.set(u.c, '');
    byColour.set(u.c, byColour.get(u.c) + txtAt(0, k * RH + GY, u.v));
  });
  let body = '';
  for (const [c, b] of byColour) body += ink(c, b);
  return `<svg x="${x}" y="${y}" width="${w}" height="${RH}" viewBox="0 0 ${w} ${RH}"><g class="${cls}">${body}</g></svg>`;
}

// A counter that changes at its own times (every row, or every second): stacked values in a
// one-row viewport, stepped. Values repeat, so each distinct value is drawn once, into a shared
// stack in <defs> that the counter shows twice: a hard shade one pixel down and right, then the
// face, as the key hints are drawn.
const tickDefs = [];
function stepTicker(x, y, w, values, times, face, shade) {
  const uniq = [...new Set(values)];
  const frames = [];
  values.forEach((v, i) => {
    if (i && v === values[i - 1]) return;
    frames.push([times[i], `transform:translateY(${-uniq.indexOf(v) * RH}px)`]);
  });
  const cls = holdAnim(frames);
  const id = `tk${tickDefs.length}`;
  tickDefs.push(`<g id="${id}">${uniq.map((v, k) => txtAt(0, k * RH + GY, v)).join('')}</g>`);
  const one = (dx, col) => `<svg x="${x + dx}" y="${y + dx}" width="${w}" height="${RH}" viewBox="0 0 ${w} ${RH}"><g class="${cls}"><use href="#${id}" fill="${col}"/></g></svg>`;
  return one(1, shade) + one(0, face);
}
const ORDERS = ['2015-2019', '2020-2024', '2025-2029'];

// ---------------------------------------------------------------------------------------------
// Screen content
// ---------------------------------------------------------------------------------------------
const back = [];     // backgrounds and insets
const top = [];      // everything drawn after the pattern
const T = { ink: [], brown: [], pale: [], shade: [], green: [] };

// --- The title: the mark and MEDIALOG in the big face, pale yellow over a hard brown shadow.
{
  const U = 5, MU = 3;
  const mx = X(2), my = 9;
  const word = bigWord('MediaLog', mx + 21 * MU + 12, 6, U, 1);
  const markD = bitmapPath(MARK, mx, my, MU);
  back.push(`<path d="${markD}" fill="${P.shade}" transform="translate(3 3)"/><path d="${markD}" fill="${P.pale}"/>`);
  back.push(`<path d="${word.d}" fill="${P.shade}" transform="translate(3 3)"/><path d="${word.d}" fill="${P.pale}"/>`);
}
T.pale.push(txt(2, 7, 'Copyright (C) sometime in 2025-2029'));
T.shade.push(txt(2, 7, 'Copyright (C) sometime in 2025-2029'));

// --- Right block: how the log is shown (the home page's first chip, the feed, its order, the
// timeline's blocks), in a stepped inset.
{
  const lab = 59, v0 = 61;
  T.ink.push(labelR(lab, 1, 'Filter'), labelR(lab, 2, 'Feed'), labelR(lab, 3, 'Sort'), labelR(lab, 4, 'Block'));
  back.push(inset([[v0, 1, v0 + 11, 2], [v0, 3, v0 + 6, 4]]));
  T.green.push(txt(v0, 1, 'Everything'), txt(v0, 2, 'Friends & me'), txt(v0, 3, 'By date'), txt(v0, 4, '5 years'));
}

// --- The fields: Song (the line, its verb cycling), Instrument (the kind), Order, Pattern, Row.
{
  const r = R_FIELDS, v0 = 12;
  T.ink.push(labelR(10, r, 'Song'), labelR(10, r + 1, 'Instrument'), labelR(10, r + 2, 'Order'), labelR(10, r + 3, 'Pattern'));
  back.push(inset([[v0, r, v0 + 47, r], [v0, r + 1, v0 + 27, r + 1], [v0, r + 2, v0 + 8, r + 2], [v0, r + 3, v0 + 6, r + 3],
    [v0 + 16, r + 2, v0 + 21, r + 3]], { notches: [[v0 + 16, r + 2, 9]] }));
  T.ink.push(labelR(v0 + 14, r + 3, 'Row'));
  // Song: "Everything you've ", the verb in the colour of what is playing, ", on one timeline."
  const pre = "Everything you've ";
  T.pale.push(txt(v0, r, pre));
  const verbs = SONG.map((s) => (s.today ? 'played' : VERBS[s.ch]));
  const vcol = SONG.map((s) => (s.today ? P.pale : KINDS[K[s.k]].c));
  // the tail moves with the verb's length, so it is a ticker too
  const tails = SONG.map((s, i) => `${verbs[i]}, on one timeline.`);
  const xv = X(v0 + pre.length);
  // verb and tail as one ticker per colour: the verb in colour, the rest pale yellow
  top.push(slotTicker(xv, Y(r), X(30), verbs, vcol));
  top.push(slotTicker(xv, Y(r), X(30), tails.map((t, i) => ' '.repeat(len(verbs[i])) + t.slice(len(verbs[i]))), SONG.map(() => P.pale)));
  // Instrument: the kind, numbered as on the home page's chips.
  const inst = SONG.map((s) => (s.today ? '00: Everything' : `${String(K[s.k] + 1).padStart(2, '0')}: ${s.k}`));
  const icol = SONG.map((s) => (s.today ? P.green : KINDS[K[s.k]].c));
  top.push(slotTicker(X(v0), Y(r + 1), X(28), inst, icol));
  top.push(slotTicker(X(v0), Y(r + 2), X(9), SONG.map((s) => s.blk), SONG.map(() => P.green)));
  top.push(slotTicker(X(v0), Y(r + 3), X(7), SONG.map((s) => s.pat), SONG.map(() => P.green)));
  top.push(slotTicker(X(v0 + 16), Y(r + 3), X(6), SONG.map((s) => s.day.trim()), SONG.map(() => P.green)));
  // Right of the fields, where the free-memory readouts go: what is left, and what is new.
  T.ink.push(txt(64, r + 1, 'FreeTime'), labelR(78, r + 1, '0K'));
  T.ink.push(txt(64, r + 2, 'Kinds'), labelR(78, r + 2, '10'));
  T.ink.push(txt(64, r + 3, 'Threads'), labelR(78, r + 3, '3 new'));
}

// --- Key hints, dot leaders, pale yellow on a hard shadow.
{
  const keys = [
    [2, 'ESC ..... Home'], [2, 'F2 ...... My log'], [2, 'F3 ...... Discover'],
    [25, 'CTRL-L .. Log it'], [25, 'CTRL-F .. Title or creator'], [25, 'F5/F8 ... Friends / Everyone'],
  ];
  keys.forEach(([c, s], i) => {
    const row = R_KEYS + (i % 3);
    T.shade.push(txt(c, row, s));
    T.pale.push(txt(c, row, s));
  });
  [[57, 'ALT-S ... Sometime in'], [57, 'F9 ...... Filters'], [57, 'F10 ..... Talked about']].forEach(([c, s], i) => {
    T.shade.push(txt(c, R_KEYS + i, s));
    T.pale.push(txt(c, R_KEYS + i, s));
  });
}

// --- The status line, as the gold school prints it above the section title: what is playing,
// the order and row counters (ticking with every row, and stepping back for the pattern loop),
// the channel count, and a Time counter that runs once a second through the loop.
{
  const r = R_STATUS;
  const lastOrder = Math.max(...SONG.map((s) => ORDERS.indexOf(s.blk)));
  const p3 = (n) => String(n).padStart(3, '0');
  const s1 = 'Playing, Order: ', s2 = `/${p3(lastOrder)}, Row: `, s3 = `/${p3(N - 1)}, 4 Channels`;
  const cOrd = 2 + s1.length, cRow = cOrd + 3 + s2.length;
  T.ink.push(txt(2, r, s1), txt(cOrd + 3, r, s2), txt(cRow + 3, r, s3));
  const stepTimes = seq.map((_, i) => i * ROWT);
  const ordVals = seq.map((row) => p3(ORDERS.indexOf(SONG[Math.floor(row / 3)].blk)));
  const rowVals = seq.map((row) => p3(row));
  const secs = Array.from({ length: Math.floor(LOOP) + 1 }, (_, i) => i);
  const timeVals = secs.map((s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  T.ink.push(txt(70, r, 'Time'));
  top.push(stepTicker(X(cOrd), Y(r), X(3), ordVals, stepTimes, P.pale, P.shade));
  top.push(stepTicker(X(cRow), Y(r), X(3), rowVals, stepTimes, P.pale, P.shade));
  top.push(stepTicker(X(75), Y(r), X(4), timeVals, secs, P.pale, P.shade));
}

// --- The dotted rule and the section title.
{
  const title = 'My log (F2)';
  const c0 = Math.floor((COLS - title.length) / 2);
  T.ink.push(txt(c0, R_RULE, title));
  let d = '';
  for (let x = X(1); x < X(c0 - 1); x += 4) d += `M${x} ${Y(R_RULE) + 5}h2v1h-2z`;
  for (let x = X(c0 + title.length + 1); x < X(COLS - 1); x += 4) d += `M${x} ${Y(R_RULE) + 5}h2v1h-2z`;
  back.push(`<path d="${d}" fill="${P.brown}"/>`);
}

// ---------------------------------------------------------------------------------------------
// The pattern
// ---------------------------------------------------------------------------------------------
// Build the loop rows: per row a label and four cells { text, colour }, effects, held notes.
const rows = Array.from({ length: N }, () => ({
  label: '', labelCls: 'ink', cells: [null, null, null, null], fx: ['', '', '', ''],
  hold: [null, null, null, null], brk: 0,
}));
SONG.forEach((s, i) => {
  const r0 = i * 3;
  rows[r0].label = s.day;
  rows[r0 + 1].label = s.yr;
  rows[r0 + 1].labelCls = 'year';
  // pattern breaks: a new year (1); a new five-year block, or the top of the song (2)
  if (i === 0) rows[r0].brk = 2;
  else if (SONG[i - 1].pat !== s.pat) rows[r0].brk = SONG[i - 1].blk !== s.blk ? 2 : 1;
  if (s.today) {
    // the end of the song, as the order list would mark it
    rows[r0 + 2].label = '---';
    rows[r0 + 2].labelCls = 'year';
    return;
  }
  const col = KINDS[K[s.k]].c;
  rows[r0].cells[s.ch] = { text: `${fit(s.t, 11, 'title')} ${s.r}`, colour: col };
  rows[r0 + 1].cells[s.ch] = { text: fit(s.by, TXTW, 'creator'), colour: P.grey };
  if (s.x) rows[r0 + 2].cells[s.ch] = { text: fit(s.x, TXTW, 'details'), colour: P.dim };
  (s.fx || []).forEach((f, j) => { if (f) rows[r0 + j].fx[s.ch] = f; });
});
// Held notes: a line down the channel from under the entry's last line of text until the next
// note in the same channel cuts it (or the song ends).
SONG.forEach((s, i) => {
  if (!s.hold) return;
  let end = N;
  for (let j = i + 1; j < SONG.length; j++) if (!SONG[j].today && SONG[j].ch === s.ch) { end = j * 3; break; }
  for (let r = i * 3 + (s.x ? 3 : 2); r < end; r++) rows[r].hold[s.ch] = KINDS[K[s.k]].c;
});

// The strip: element k shows loop row (k - BAND) mod N, so translating it by -r rows puts row
// r on the band. N + V elements cover every window position without a seam.
const NS = N + V;
const rowOf = (k) => (((k - BAND) % N) + N) % N;
const WX0 = X(CH0) - 4, WX1 = X(chCol(3) + CHW) + 4;   // channel area, pixel extent
const WY0 = Y(PT);
let tint4 = '', tint16 = '', brkD = '';
const cellText = new Map();   // colour -> uses
const fxText = [];
const labels = { ink: [], year: [] };
const addText = (colour, s) => { cellText.set(colour, (cellText.get(colour) || '') + s); };
for (let k = 0; k < NS; k++) {
  const r = rowOf(k), row = rows[r], y = k * RH;
  const band = `M${WX0} ${y}h${WX1 - WX0}v${RH}h-${WX1 - WX0}z`;
  if (r % 16 === 0) tint16 += band;
  else if (r % 4 === 0) tint4 += band;
  for (let c = 0; c < 4; c++) {
    const x = X(chCol(c));
    const cell = row.cells[c];
    if (cell) addText(cell.colour, txtAt(x, y + GY, cell.text));
    if (row.fx[c]) fxText.push(txtAt(x + X(FXC), y + GY, row.fx[c]));
  }
  if (row.brk === 2) brkD += `M${WX0} ${y}h${WX1 - WX0}v1h-${WX1 - WX0}z`;
  else if (row.brk === 1) for (let x = WX0; x < WX1; x += 6) brkD += `M${x} ${y}h3v1h-3z`;
  if (row.label) labels[row.labelCls].push(txtAt(X(LBL) + X(LBLW - len(row.label)), y + GY, row.label));
}
// Empty fields show the gold school's dots (a 2x2 dot per character cell). They come from one
// pattern tile, on rectangles merged into vertical runs per channel: 't' an empty text field,
// 'h' a text field under a held note (its first cell carries the hold line), 'f' an empty
// effect field.
const runs = { t: [], h: [], f: [] };
const holdRuns = [];
for (let c = 0; c < 4; c++) {
  for (const field of ['text', 'fx', 'hold']) {
    let start = 0, state;
    for (let k = 0; k <= NS; k++) {
      let st = 'end';
      if (k < NS) {
        const row = rows[rowOf(k)];
        if (field === 'text') st = row.cells[c] ? '' : row.hold[c] ? 'h' : 't';
        else if (field === 'fx') st = row.fx[c] ? '' : 'f';
        else st = row.hold[c] || '';
      }
      if (st !== state) {
        if (state && state !== 'end') {
          if (field === 'hold') holdRuns.push([c, start, k - start, state]);
          else runs[state].push([c, start, k - start]);
        }
        start = k;
        state = st;
      }
    }
  }
}
const runRect = ([c, k0, n], dx, w) => `<rect x="${X(chCol(c)) + dx}" y="${k0 * RH}" width="${w}" height="${n * RH}"/>`;
const dotsEl = runs.t.map((r) => runRect(r, 0, X(TXTW))).join('')
  + runs.h.map((r) => runRect(r, CW, X(TXTW - 1))).join('')
  + runs.f.map((r) => runRect(r, X(FXC), X(3))).join('');
let dotTile = '';
[...'··· ·· ·· ···'].forEach((ch, i) => { if (ch === '·') dotTile += `<rect x="${i * CW + 3}" y="4" width="2" height="2"/>`; });
for (let i = FXC; i < FXC + 3; i++) dotTile += `<rect x="${i * CW + 3}" y="4" width="2" height="2"/>`;
const holdEl = holdRuns.map(([c, k0, n, col]) => rect(X(chCol(c)) + 3, k0 * RH, 2, n * RH, col)).join('');

// The strip's motion: one keyframe per row step (the pattern loop goes back a row).
const stripFrames = seq.map((r, i) => [i * ROWT, `transform:translateY(${-r * RH}px)`]);
const stripCls = holdAnim(stripFrames);
// The band: a pale wash over the current row, a shade stronger while a note row is on it
// (note on), settling for the rest of the slot.
const bandFrames = [];
seq.forEach((r, i) => {
  const s = SONG[Math.floor(r / 3)];
  const on = r % 3 === 0 && !s.today;
  const op = `opacity:${on ? 0.3 : 0.17}`;
  if (!bandFrames.length || bandFrames[bandFrames.length - 1][1] !== op) bandFrames.push([i * ROWT, op]);
});
const bandCls = holdAnim(bandFrames);

// Channel backgrounds (static), the tints (moving), the band (static), the content (moving).
const bandY = WY0 + BAND * RH;
const pat = [];
for (let c = 0; c < 4; c++) pat.push(rect(X(chCol(c)) - 4, WY0, X(CHW) + 8, V * RH, P.black));
pat.push(`<g clip-path="url(#pw)"><g transform="translate(0 ${WY0})"><g class="${stripCls}">`
  + `<path d="${tint4}" fill="${P.tint}"/><path d="${tint16}" fill="${P.tint16}"/></g></g>`
  + `<g transform="translate(0 ${WY0})"><g class="${stripCls}">`
  + `<path d="${brkD}" fill="${P.bandEdge}"/>`
  + `<g fill="url(#dt)">${dotsEl}</g>`
  + holdEl
  + [...cellText].map(([c, b]) => ink(c, b)).join('')
  + ink(P.fx, fxText.join(''))
  + '</g></g>'
  + rect(WX0, bandY, WX1 - WX0, RH, P.pale, ` class="${bandCls}" opacity="0.17"`)
  + '</g>');
// gold separators between channels, 4 px wide, as in the gold school
for (let c = 1; c < 4; c++) pat.push(rect(X(chCol(c)) - 6, WY0, 4, V * RH, P.gold));
// The cursor: a pale block on the band in channel 03 while today plays, blinking once a second.
{
  const todayIdx = SONG.findIndex((s) => s.today);
  const ts = slotT[todayIdx], te = slotEnd(todayIdx);
  const blink = holdAnim([[0, 'opacity:1'], [0.5, 'opacity:0']], 1);
  const vis = during([[ts, te]]);
  pat.push(`<g class="${vis}" opacity="0"><g class="${blink}">${rect(X(chCol(SONG[todayIdx].ch)) - 1, bandY, CW + 2, RH, P.pale)}</g></g>`);
}
// Row labels on the gold, moving with the strip; the band's label sits in a pale box.
pat.push(rect(X(LBL), bandY, X(LBLW), RH, P.pale));
pat.push(`<svg x="0" y="${WY0}" width="${X(LBLW)}" height="${V * RH}" viewBox="0 0 ${X(LBLW)} ${V * RH}"><g class="${stripCls}">`
  + ink(P.ink, labels.ink.join('')) + ink(P.year, labels.year.join('')) + '</g></svg>');

// Channel tabs: brown tabs with pale yellow names; while a channel's note plays, a square in
// the colour of its kind lights beside the name.
{
  const y = Y(R_TABS);
  top.push(rect(X(1), y + RH - 2, X(COLS - 2), 2, P.brown));
  for (let c = 0; c < 4; c++) {
    const x = X(chCol(c));
    top.push(rect(x - 4, y, X(CHW) + 8, RH, P.brown));
    T.pale.push(txtAt(x, y + GY, TABS[c]));
    const ivs = new Map();
    SONG.forEach((s, i) => {
      if (s.today || s.ch !== c) return;
      const col = KINDS[K[s.k]].c;
      if (!ivs.has(col)) ivs.set(col, []);
      ivs.get(col).push([slotT[i], slotEnd(i)]);
    });
    const sx = x + X(len(TABS[c])) + 4;
    for (const [col, iv] of ivs) top.push(rect(sx, y + 2, 6, 5, col, ` class="${during(iv)}" opacity="0"`));
  }
}

// --- The Note line: the entry's note while its slot plays.
{
  const r = R_NOTE, v0 = 6;
  T.ink.push(labelR(4, r, 'Note'));
  back.push(inset([[v0, r, 78, r]]));
  const notes = SONG.map((s) => {
    const lead = s.today ? '▶' : s.r;
    return fit(`${lead} ${s.note}`, 72, 'note');
  });
  const ncol = SONG.map((s) => (s.today ? P.pale : P.pale));
  top.push(slotTicker(X(v0), Y(r), X(73), notes, ncol));
}

// --- The instrument strip: every kind in its own colour, as on the home page's chips.
{
  const r = R_LEG;
  back.push(inset([[1, r, 78, r]]));
  let c = 1;
  KINDS.forEach((k) => {
    top.push(rect(X(c) + 1, Y(r) + 2, 5, 5, k.c));
    top.push(ink(k.c, txt(c + 1, r, k.name)));
    c += 1 + len(k.name) + 1;
  });
  if (c - 1 > 79) throw new Error('instrument strip too long');
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
const textLayer = ink(P.shade, T.shade.join(''), ' transform="translate(1 1)"') + ink(P.ink, T.ink.join(''))
  + ink(P.brown, T.brown.join('')) + ink(P.pale, T.pale.join('')) + ink(P.green, T.green.join(''));
const glyphDefs = [...used].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('');
const defs = `<defs>${glyphDefs}${tickDefs.join('')}<pattern id="dt" patternUnits="userSpaceOnUse" x="${X(CH0)}" y="0" width="${X(CHS)}" height="${RH}"><g fill="${P.dot}">${dotTile}</g></pattern><clipPath id="pw"><rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${V * RH}"/></clipPath></defs>`;

css.unshift('svg{shape-rendering:crispEdges}');
// Reduced motion: hold the frame where the finale is playing again (slot 8, second pass).
const HOLD_T = slotT[8] + 2.5 * ROWT;
css.push(`@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important;animation-delay:-${HOLD_T}s!important}}`);

const TITLE = 'MediaLog, as a DOS text-mode tracker';
const DESC = 'An olive-gold tracker screen. MediaLog in big pale yellow letters beside its open-book '
  + 'mark; the Song field reads: Everything you\'ve watched, on one timeline, with the verb cycling '
  + 'through read, played and listened to. Four channels, Watched, Read, Played and Listened to, '
  + 'play a life of invented entries from 2016 to today, coloured by kind, with dates, creators, '
  + 'reactions and notes.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>${defs}`
  + `<rect width="${VBW}" height="${VBH}" rx="14" fill="${P.bezel}"/>`
  + `<rect x="1.5" y="1.5" width="${VBW - 3}" height="${VBH - 3}" rx="13" fill="none" stroke="${P.bezelHi}"/>`
  + `<g transform="translate(${BZ + MG} ${BZ + MG})">`
  + rect(-MG, -MG, SW + MG * 2, SH + MG * 2, P.gold)
  + rect(-MG, -MG, SW + MG * 2, 2, P.pale) + rect(-MG, -MG, 2, SH + MG * 2, P.pale)
  + back.join('') + pat.join('') + top.join('') + textLayer
  + '</g></svg>\n';

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), loop ${LOOP}s`);
