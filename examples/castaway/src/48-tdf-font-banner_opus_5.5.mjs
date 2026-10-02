// TheDraw-style font banner header for the Castaway README (style catalogue entry ansi-02).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/48-tdf-font-banner_opus_5.5.mjs
// It rewrites examples/castaway/48-tdf-font-banner_opus_5.5.md and the colour proof in
// examples/castaway/assets/48-tdf-font-banner_opus_5.5-colour.svg. Edit this file, not those.
//
// THE STYLE
// The DOS ANSI editors of the late 1980s and 1990s (TheDraw, Ian E. Davis, 1986, is the one
// everyone remembers) had a font manager: you typed a word and it stamped big letters from a
// font file. Thousands of BBS headers were set that way, so every repeated letter in them is
// the same letter, on one baseline. The font files came in three types: Outline (hollow
// letters traced in box-drawing lines), Block (solid blocks and shades in one colour) and Color
// (every cell with its own colour). In the Outline type, as the reverse-engineered file
// specification describes it, the double line always sits on the top of a beam and on the
// right of a column, with single lines on the other two sides: that is what the 'lit edge'
// style below does, and why the letters look lit from the top right.
//
// WHAT IS HERE (all of it new, nothing taken from any real font file)
// One typeface, SWASH, drawn for this header as 41 small bitmaps (26 capitals, 10 digits,
// five marks) on a 6-row grid. From those bitmaps the script sets:
//   - the Outline type: the edges of each bitmap are traced on the lattice between its pixels,
//     and every lattice point becomes the box-drawing character that joins its edges. This is
//     the header itself, plain text in <pre> blocks, so it needs no image.
//   - the Color and Block types, for the colour proof in the SVG (inside a <details>): the
//     Color type one pixel per cell, lit from the same top right as the outline (white top
//     faces and right edges, brown left edges, grey counters, a shadow falling down-left),
//     the Block type at half-cell height in one colour, typing what is on the island now.
// The foundry (EBB & KERN) and the face (SWASH) exist only in this file. A swash is the sheet
// of water that runs up the beach after a wave breaks, and also the flourish on a fancy
// letter. This face has the first kind only.
//
// The outline tracing uses only the pieces the reverse-engineered .TDF outline format has
// placeholders for (═ ─ │ ║ ╒ ╗ ╓ ┐ ╚ ╛ └ ╜), with the double line on the top of every beam
// and the right of every column, as that specification says the format always draws them.
//
// The script refuses a <pre> line wider than 80 columns, trailing whitespace, a tab, a
// character outside ASCII and the box/block set, a glyph that would make an ambiguous joint,
// a pangram that is missing a letter, and a banner that does not read back as its word.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '48-tdf-font-banner_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}-colour.svg`);
const SVG_REL = `assets/${SLUG}-colour.svg`;
const PAGE = 80; // widest a <pre> line may be: the classic 80 columns

// Counts that move as the project grows, checked read-only in D:/python/castaway on AS_OF:
//   python -B -c "import tomllib; d=tomllib.load(open('activities.toml','rb')); print(len(d['activities']))"
//   find media/audio -name '*.wav' | wc -l
// The header only says "more than" these, so it ages well; re-check before it goes live.
const AS_OF = '2026-10-02';
const ACTIVITIES_FLOOR = 90; // 94 on AS_OF: 81 on four timers, 13 chained
const SOUNDS_FLOOR = 150; // 181 on AS_OF

// =============================================================================================
// 1. SWASH. '#' is ink. Six rows. Stems are two pixels wide and beams one pixel tall, which
//    traces to "│ ║" for a stem and "═" over "─" for a beam. Bowls (B D P R 5) step in at the
//    corners; everything else is square. The 0 is a pixel narrower than the O.
// =============================================================================================
const FONT_NAME = 'SWASH';
const FOUNDRY = 'EBB & KERN';
const GH = 6;
const GLYPHS = {
  A: ['#######', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['#######', '##.....', '##.....', '##.....', '##.....', '#######'],
  D: ['######.', '##...##', '##...##', '##...##', '##...##', '######.'],
  E: ['#######', '##.....', '#####..', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '#####..', '##.....', '##.....', '##.....'],
  G: ['#######', '##.....', '##.....', '##..###', '##..###', '#######'],
  H: ['##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['.....##', '.....##', '.....##', '##...##', '##...##', '#######'],
  K: ['##...##', '##..##.', '#####..', '##..##.', '##...##', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##########', '##..##..##', '##..##..##', '##......##', '##......##', '##......##'],
  N: ['##....##', '###...##', '####..##', '##.##.##', '##..####', '##...###'],
  O: ['#######', '##...##', '##...##', '##...##', '##...##', '#######'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....'],
  Q: ['#######', '##...##', '##...##', '##...##', '##..###', '#######'],
  R: ['######.', '##...##', '##...##', '######.', '##..##.', '##...##'],
  S: ['#######', '##.....', '#######', '.....##', '.....##', '#######'],
  T: ['########', '...##...', '...##...', '...##...', '...##...', '...##...'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '#######'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..'],
  W: ['##......##', '##......##', '##..##..##', '##..##..##', '##..##..##', '##########'],
  X: ['##...##', '##...##', '.#####.', '##...##', '##...##', '##...##'],
  Y: ['##....##', '##....##', '########', '...##...', '...##...', '...##...'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '#######'],
  0: ['######', '##..##', '##..##', '##..##', '##..##', '######'],
  1: ['####.', '..##.', '..##.', '..##.', '..##.', '#####'],
  2: ['#######', '.....##', '#######', '##.....', '##.....', '#######'],
  3: ['#######', '.....##', '..#####', '.....##', '.....##', '#######'],
  4: ['##...##', '##...##', '#######', '.....##', '.....##', '.....##'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '######.'],
  6: ['#######', '##.....', '#######', '##...##', '##...##', '#######'],
  7: ['#######', '.....##', '....##.', '...##..', '...##..', '...##..'],
  8: ['#######', '##...##', '#######', '##...##', '##...##', '#######'],
  9: ['#######', '##...##', '#######', '.....##', '.....##', '#######'],
  ':': ['..', '##', '..', '..', '##', '..'],
  '.': ['..', '..', '..', '..', '..', '##'],
  '-': ['....', '....', '####', '....', '....', '....'],
  '!': ['##', '##', '##', '##', '..', '##'],
  '?': ['######.', '....##.', '..###..', '..##...', '.......', '..##...'],
};
const SPACE_W = 2; // a word space, in pixels (traces to three columns)
for (const [ch, g] of Object.entries(GLYPHS)) {
  if (g.length !== GH || g.some((r) => r.length !== g[0].length || /[^#.]/.test(r))) throw new Error(`glyph ${ch} is not a ${GH}-row bitmap`);
}

// =============================================================================================
// 2. Tracing. A glyph w pixels wide traces to w + 1 columns and GH + 1 rows: lattice point
//    (i, j) is the corner shared by pixels (i-1..i, j-1..j). An edge runs between two lattice
//    points wherever ink meets paper. Each edge gets a weight from the style (1 single, 2
//    double), and each lattice point becomes the one box-drawing character with those arms.
// =============================================================================================
const BOX = new Map();
const box = (ch, u, d, l, r) => BOX.set(`${u}${d}${l}${r}`, ch);
// single
box('─', 0, 0, 1, 1); box('│', 1, 1, 0, 0); box('┌', 0, 1, 0, 1); box('┐', 0, 1, 1, 0); box('└', 1, 0, 0, 1); box('┘', 1, 0, 1, 0);
box('├', 1, 1, 0, 1); box('┤', 1, 1, 1, 0); box('┬', 0, 1, 1, 1); box('┴', 1, 0, 1, 1); box('┼', 1, 1, 1, 1);
// double
box('═', 0, 0, 2, 2); box('║', 2, 2, 0, 0); box('╔', 0, 2, 0, 2); box('╗', 0, 2, 2, 0); box('╚', 2, 0, 0, 2); box('╝', 2, 0, 2, 0);
box('╠', 2, 2, 0, 2); box('╣', 2, 2, 2, 0); box('╦', 0, 2, 2, 2); box('╩', 2, 0, 2, 2); box('╬', 2, 2, 2, 2);
// single verticals, double horizontals
box('╒', 0, 1, 0, 2); box('╕', 0, 1, 2, 0); box('╘', 1, 0, 0, 2); box('╛', 1, 0, 2, 0); box('╞', 1, 1, 0, 2); box('╡', 1, 1, 2, 0);
box('╤', 0, 1, 2, 2); box('╧', 1, 0, 2, 2); box('╪', 1, 1, 2, 2);
// double verticals, single horizontals
box('╓', 0, 2, 0, 1); box('╖', 0, 2, 1, 0); box('╙', 2, 0, 0, 1); box('╜', 2, 0, 1, 0); box('╟', 2, 2, 0, 1); box('╢', 2, 2, 1, 0);
box('╥', 0, 2, 1, 1); box('╨', 2, 0, 1, 1); box('╫', 2, 2, 1, 1);

// Edge weights: the top of a beam, the bottom of a beam, the left of a column, the right of one.
// Placeholders A to L of the reverse-engineered outline format, as code page 437 draws them.
const TDF_PIECES = '═─│║╒╗╓┐╚╛└╜';
const STYLES = {
  lit: { top: 2, bottom: 1, left: 1, right: 2 },
  single: { top: 1, bottom: 1, left: 1, right: 1 },
  double: { top: 2, bottom: 2, left: 2, right: 2 },
};

function traceGlyph(rows, style) {
  const h = rows.length, w = rows[0].length;
  const ink = (x, y) => x >= 0 && y >= 0 && x < w && y < h && rows[y][x] === '#';
  const hEdge = (i, j) => (i < 0 || i >= w || ink(i, j - 1) === ink(i, j) ? 0 : ink(i, j) ? style.top : style.bottom);
  const vEdge = (i, j) => (j < 0 || j >= h || ink(i - 1, j) === ink(i, j) ? 0 : ink(i - 1, j) ? style.right : style.left);
  const out = [];
  for (let j = 0; j <= h; j++) {
    let line = '';
    for (let i = 0; i <= w; i++) {
      const tl = ink(i - 1, j - 1), tr = ink(i, j - 1), bl = ink(i - 1, j), br = ink(i, j);
      if (tl === br && tr === bl && tl !== tr) throw new Error(`diagonal joint at ${i},${j}: redraw the glyph`);
      const k = `${vEdge(i, j - 1)}${vEdge(i, j)}${hEdge(i - 1, j)}${hEdge(i, j)}`;
      line += k === '0000' ? ' ' : BOX.get(k) ?? (() => { throw new Error(`no box character for arms ${k}`); })();
    }
    out.push(line);
  }
  return out;
}

// Set a line of text in SWASH. Returns the rows and where each glyph landed.
function setWord(text, style = STYLES.lit, spacing = 1) {
  const rows = Array(GH + 1).fill('');
  const spans = [];
  let x = 0;
  [...text].forEach((ch, k) => {
    const gap = k ? spacing : 0;
    let g;
    if (ch === ' ') g = Array(GH + 1).fill(' '.repeat(SPACE_W + 1));
    else if (GLYPHS[ch]) g = traceGlyph(GLYPHS[ch], style);
    else throw new Error(`SWASH has no glyph for ${JSON.stringify(ch)}`);
    for (let y = 0; y <= GH; y++) rows[y] += ' '.repeat(gap) + g[y];
    spans.push({ ch, x0: x + gap, x1: x + gap + g[0].length - 1 });
    x += gap + g[0].length;
  });
  // Read it back: the traced banner must hold exactly the glyphs asked for, in order.
  const again = spans.filter((s) => s.ch !== ' ').map((s) => rows.map((r) => r.slice(s.x0, s.x1 + 1)).join('\n'));
  const want = [...text].filter((c) => c !== ' ').map((c) => traceGlyph(GLYPHS[c], style).join('\n'));
  if (again.join('|') !== want.join('|')) throw new Error(`banner "${text}" does not read back`);
  // The lit style may only use the twelve line pieces the outline format has placeholders for.
  if (style === STYLES.lit) for (const ch of rows.join('')) if (ch !== ' ' && !TDF_PIECES.includes(ch)) throw new Error(`"${ch}" in "${text}" is not an outline piece`);
  return { rows: rows.map((r) => r.replace(/\s+$/, '')), spans, width: x };
}
// Because it is a font, it sets any word made of its glyphs:
//   node examples/castaway/src/48-tdf-font-banner_opus_5.5.mjs --set "SEA 2" [lit|single|double]
// prints the banner and writes nothing.
if (process.argv[2] === '--set') {
  const s = setWord(process.argv[3] ?? 'SWASH', STYLES[process.argv[4] ?? 'lit']);
  console.log(`${s.rows.join('\n')}\n(${s.width} columns)`);
  process.exit(0);
}
// Several words side by side, each with its own style, separated by gap columns.
function sideBySide(blocks, gap = 3) {
  const h = Math.max(...blocks.map((b) => b.length));
  const widths = blocks.map((b) => Math.max(...b.map((l) => [...l].length)));
  const out = [];
  for (let y = 0; y < h; y++) out.push(blocks.map((b, k) => (b[y] ?? '').padEnd(widths[k])).join(' '.repeat(gap)).replace(/\s+$/, ''));
  return out;
}

// =============================================================================================
// 3. <pre> plumbing: lines are built from plain text and links, measured by what shows.
// =============================================================================================
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const A = (href, label = href) => ({ href, label });
const vis = (seg) => (typeof seg === 'string' ? seg : seg.label);
const html = (seg) => (typeof seg === 'string' ? escHtml(seg) : `<a href="${seg.href}">${escHtml(seg.label)}</a>`);
const OK_CHAR = /^[\x20-\x7E\u2500-\u259F\u00B7\u2022\u2192\u266A\u266B]$/u;
function pre(lines) {
  const out = lines.map((line) => {
    const segs = Array.isArray(line) ? line : [line];
    const shown = segs.map(vis).join('');
    const w = [...shown].length;
    if (w > PAGE) throw new Error(`pre line is ${w} columns: ${shown}`);
    if (/\s$/.test(shown)) throw new Error(`trailing whitespace: "${shown}"`);
    for (const ch of shown) if (!OK_CHAR.test(ch)) throw new Error(`character ${JSON.stringify(ch)} not allowed: ${shown}`);
    return segs.map(html).join('');
  });
  return `<pre>\n${out.join('\n')}\n</pre>`;
}
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - [...s].length));
const centre = (s, w = PAGE) => ' '.repeat(Math.max(0, Math.floor((w - [...s].length) / 2))) + s;
// Leader rows: "  LABEL ....... text", with continuation lines hung under the text.
function leaders(items, labelW = 14, indent = 2) {
  const out = [];
  for (const [label, ...lines] of items) {
    const lead = `${' '.repeat(indent)}${label} ${'.'.repeat(Math.max(2, labelW - label.length - 1))} `;
    lines.forEach((l, k) => {
      const head = k === 0 ? lead : ' '.repeat(lead.length);
      out.push(Array.isArray(l) ? [head, ...l] : head + l);
    });
  }
  return out;
}

// A frame in the lit style, to match the letters: double along the top and down the right,
// single down the left and along the bottom. Labels sit in the top and bottom borders.
function litFrame(rows, { tl = '', tr = '', bl = '', br = '' } = {}) {
  const inner = PAGE - 4;
  const border = (l, r, a, z, line) => {
    const L = l ? `${line} ${l} ` : '', R = r ? ` ${r} ${line}` : '';
    const fill = PAGE - 2 - [...L].length - [...R].length;
    if (fill < 1) throw new Error('frame labels too long');
    return a + L + line.repeat(fill) + R + z;
  };
  return [
    border(tl, tr, '╒', '╗', '═'),
    ...rows.map((r) => {
      const segs = Array.isArray(r) ? r : [r];
      const w = [...segs.map(vis).join('')].length;
      if (w > inner) throw new Error(`frame row too wide (${w})`);
      return ['│ ', ...segs, `${' '.repeat(inner - w)} ║`];
    }),
    border(bl, br, '└', '╜', '─'),
  ];
}
// Text beside a banner: lines of text start at column `at`, on banner rows from `from`.
function beside(banner, text, at, from = 0) {
  const h = Math.max(banner.length, from + text.length);
  const out = [];
  for (let y = 0; y < h; y++) {
    const b = banner[y] ?? '';
    const t = text[y - from];
    out.push((t === undefined ? b : pad(b, at) + t).replace(/\s+$/, ''));
  }
  return out;
}

// =============================================================================================
// 4. The header: a specimen card for CASTAWAY, set in SWASH, lit edge, spacing 1
// =============================================================================================
const hero = setWord('CASTAWAY');
if (hero.width !== PAGE - 4) throw new Error(`hero is ${hero.width} columns; the card holds ${PAGE - 4}`);

// The three A's, each bracketed, the brackets joined: one drawing, used three times.
function bracketRows(spans) {
  const a = spans.filter((s) => s.ch === 'A');
  const r1 = Array(PAGE).fill(' '), r2 = Array(PAGE).fill(' ');
  const mids = a.map((s) => {
    for (let x = s.x0; x <= s.x1; x++) r1[x] = '─';
    r1[s.x0] = '└'; r1[s.x1] = '┘';
    const m = Math.floor((s.x0 + s.x1) / 2);
    r1[m] = '┬';
    return m;
  });
  for (let x = mids[0]; x <= mids[2]; x++) r2[x] = '─';
  r2[mids[0]] = '└'; r2[mids[2]] = '┘'; r2[mids[1]] = '┴';
  const label = (from, to, text) => {
    const s = ` ${text} `, at = Math.ceil((from + to - [...s].length) / 2) + 1;
    if (at <= from + 1 || at + s.length >= to) throw new Error(`label "${text}" does not fit its bracket`);
    [...s].forEach((c, k) => { r2[at + k] = c; });
  };
  label(mids[0], mids[1], 'one A, drawn once');
  label(mids[1], mids[2], 'stamped 3 times');
  return [r1, r2].map((r) => r.join('').replace(/\s+$/, ''));
}

const heroPre = pre([
  ...litFrame(['', ...hero.rows, ...bracketRows(hero.spans)], {
    tl: `font: ${FONT_NAME}`, tr: 'type: outline ═ edges: lit',
    bl: 'typed: CASTAWAY_', br: 'rows: 7 ─ spacing: 1',
  }),
  '',
  centre('one island, painted once, on screen for ten hours.'),
  centre('she idles. every so often, something happens. on the beat.'),
]);

// ---------------------------------------------------------------------------------------------
// Section banners, each with a few lines of copy set beside it
// ---------------------------------------------------------------------------------------------
function section(word, blurb = [], style = STYLES.lit) {
  const s = setWord(word, style);
  const at = s.width + 4;
  for (const l of blurb) if (at + [...l].length > PAGE) throw new Error(`blurb too wide beside ${word}: ${l}`);
  return beside(s.rows, blurb, at, Math.max(0, Math.floor((GH + 1 - blurb.length) / 2)));
}
const rule = '─'.repeat(PAGE);
const note = (s) => (s ? `  ${s}` : '');
const notes = (...ls) => ls.map(note);

// GAGS ----------------------------------------------------------------------------------------
const gagsPre = pre([
  ...section('GAGS', [
    `more than ${ACTIVITIES_FLOOR} activities, most of them on`,
    'four timers. a few, in no order. each',
    'one starts on the next bar of the',
    'music, so every gag lands on the',
    'beat.',
  ]),
  rule,
  ...leaders([
    ['BOTTLE', 'a message in a bottle washes straight back. later, a', 'different bottle brings a reply.'],
    ['DRONE', 'a delivery drone drops off a parcel. it is another pair', 'of headphones.'],
    ['TURTLE', 'a sea turtle swims in and crawls up beside her. they both', 'doze off. this counts as an event.'],
    ['CAT', 'a grey tabby with a white chest arrives on a crate, climbs', 'the palm and naps. one day it floats away again. another', 'day, it comes back.'],
    ['SIGNAL', 'there is one bar of signal on the island. it is at the', 'top of the palm.'],
    ['SHARK', 'a shark in headphones goes by, nodding to the beat. nobody', 'asks what it is listening to.'],
    ['TOUR BOAT', 'a boat of selfie-takers. the island is the background.'],
    ['COCONUT', 'falls on a hermit crab. then the coconut walks off, with', 'the crab wearing it.'],
    ['ICED COFFEE', 'she could leave any time. she walks out over the water', 'and comes back with an iced coffee.'],
    ['HYDROFOIL', 'a bro on an electric hydrofoil throws a shaka and carves', 'off.'],
    ['BUSHCRAFT', 'fire by friction, a hammock, a lookout up the palm, spear', 'fishing.'],
    ['KUMARA', 'planted once. grows, slowly, over the course of the video.'],
    ['RESCUE', 'she finally spots a ship and waves like mad. it sounds its', 'horn back, then sails on. she puts the music back on.'],
    ['EVERY DAY', 'coconut sipping, fishing, jogging laps, a stroll to the', 'waterline, and a sandcastle that the tide takes.'],
  ], 15),
  rule,
  ...notes(
    'and a ship, which waits until she is busy before it sails past. it is',
    'very good at waiting. so is she.',
  ),
]);

// 10:00:00 ------------------------------------------------------------------------------------
function table(head, rows) {
  const w = head.map((h, k) => Math.max(h.length, ...rows.map((r) => r[k].length)) + 2);
  const line = (l, m, r) => `  ${l}${w.map((n) => '─'.repeat(n)).join(m)}${r}`;
  const row = (cells) => `  │${cells.map((c, k) => ` ${c.padEnd(w[k] - 1)}`).join('│')}│`;
  return [line('┌', '┬', '┐'), row(head), line('├', '┼', '┤'), ...rows.map(row), line('└', '┴', '┘')];
}
const timersPre = pre([
  ...section('10:00:00', [
    'the default run:',
    'ten hours, seed 1992.',
    'same seed, same ten',
    'hours, every time.',
  ]),
  '',
  ...table(['timer', 'goes off every', 'in a typical 10-hour run'], [
    ['regular', '2 to 5 minutes', 'about 155'],
    ['occasional', '12 to 25 minutes', 'about 30'],
    ['rare', '30 to 60 minutes', 'about 13'],
    ['super rare', '3 to 6 hours', 'about 2, and never more than 3'],
    ['chained', 'when another says so', 'about 20 follow-ups'],
  ]),
  ['    typical: the median of 200 simulated runs, as ', A('activities.toml'), ' says.'],
  '',
  ...notes(
    'she is busy about a third of the time. the other two thirds are the show.',
    'every activity starts on the next bar of the music, every 3 seconds, so',
    'the gags land on the beat the way the letters land on the grid.',
    '',
    'lanes let things overlap. she has one; the cat, the turtle, the sea and',
    'sky, the shore and even the kumara patch each have their own. so the cat',
    'can nap up the palm while she does something else entirely.',
    '',
    'scene life: 26 entries, 4 always on and 22 timed. shore waves and',
    'drifting cloud shadows are built. birds, planes with vapour trails,',
    'whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower',
    'are planned.',
  ),
  '',
  ['  python ', A('tools/schedule.py'), '  validates the schedule and simulates a 10-hour run'],
]);

// SOUND ---------------------------------------------------------------------------------------
const soundPre = pre([
  ...section('80 BPM', [
    'every sound is synthesized',
    'from code. no samples, no',
    'stock loops, no',
    'recordings, so no',
    'third-party licence.',
  ]),
  rule,
  ...leaders([
    ['THEME', 'a seamless 60-second loop in F major, ii-V-I-vi: 20 bars', 'of exactly 3 seconds each.'],
    ['BAND', 'electric piano, a kalimba lead, soft drums, and the surface', 'noise of a vinyl record that does not exist.'],
    ['OCEAN', 'also a seamless 60-second loop.'],
    ['FILES', [`more than ${SOUNDS_FLOOR}, all made by `, A('tools/make_audio.py'), '.']],
    ['LEVELS', '-14 LUFS, true peak at or below -1 dBTP. adjustable in', 'master and per routine.'],
    ['HEARD BY', 'nobody yet. reviews pending.'],
  ], 12),
  rule,
  ...notes(
    'a bar is 3 seconds and the gap between letters is one column. everything',
    'here snaps to a grid of some kind.',
  ),
]);

// Command rows: a lead (segments) with dot leaders out to column `col`, then hung text.
function hang(lead, lines, col = 38) {
  const w = [...lead.map(vis).join('')].length;
  if (w + 3 > col) throw new Error(`lead too long: ${lead.map(vis).join('')}`);
  return lines.map((l, k) => [...(k ? [' '.repeat(col)] : [...lead, ` ${'.'.repeat(col - w - 2)} `]), ...(Array.isArray(l) ? l : [l])]);
}

// RUN IT --------------------------------------------------------------------------------------
const runPre = pre([
  ...section('RUN IT', [
    'two commands and a',
    'browser. no build step,',
    'no npm packages.',
  ]),
  rule,
  ...hang(['  python ', A('tools/serve.py')], [
    'the renderer: a web page with live',
    ['preview at ', A('http://127.0.0.1:8765/'), ' and'],
    'export to a YouTube-ready MP4',
  ]),
  ...hang(['  python ', A('tools/schedule.py')], ['validates the schedule and simulates a', '10-hour run']),
  ...hang(['  python ', A('tools/render_demo.py'), ' --dev'], ['a dev reel of every activity with a', 'heads-up display (the older Python', 'reference renderer)']),
  ...hang(['  ', A('web/index.html')], ['the page itself']),
  ...hang(['  ', A('MUSING.md')], ['the working notes']),
  rule,
  ...notes(
    'the browser encodes frame-exact H.264 with WebCodecs, 68 to 78 frames a',
    'second at 1080p30 in Chrome, and the server mixes the sound and joins',
    'the two into an MP4. hard cuts and stepped movement are the motion',
    'defaults, which is how a font manager moves too: one whole letter at a',
    'time.',
  ),
]);

// SWASH: the specimen ------------------------------------------------------------------------
const PANGRAM = ['A QUIET CAT DOZES. SHE JOGS, NODS, WAVES AT A', 'HYDROFOIL. A DRONE BOX. KUMARA. PALM.'];
{
  const letters = new Set(PANGRAM.join('').replace(/[^A-Z]/g, ''));
  if (letters.size !== 26) throw new Error(`pangram is missing ${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter((c) => !letters.has(c)).join('')}`);
}
const glyphCount = Object.keys(GLYPHS).length;
const caps = Object.keys(GLYPHS).filter((c) => /[A-Z]/.test(c)).length;
const digits = Object.keys(GLYPHS).filter((c) => /[0-9]/.test(c)).length;
const marks = Object.keys(GLYPHS).filter((c) => !/[A-Z0-9]/.test(c));
const styleA = (st) => traceGlyph(GLYPHS.A, STYLES[st]);
const specimenRows = [
  ...section(FONT_NAME, ['an outline', 'face by', FOUNDRY]),
  rule,
  ...leaders([
    ['NAME', 'a swash is the sheet of water that runs up the beach after', 'a wave breaks. it is also the flourish on a fancy letter.', 'this face has the first kind only.'],
    ['GRID', `${GH} pixels tall, traced to ${GH + 1} rows. stems 2 wide, beams 1 tall`],
    ['GLYPHS', `${glyphCount}: ${caps} capitals, ${digits} digits, and ${marks.join(' ')}`],
    ['MISSING', 'lowercase, most punctuation, and night-time'],
    ['SPACING', '1 column. no kerning. every gap is the same gap.'],
    ['PIECES', `${[...TDF_PIECES].length}: ${[...TDF_PIECES].join(' ')}, the line pieces behind`, 'placeholders A to L of an outline font file. a letter may', 'use those and nothing else, and the script checks.'],
    ['EDGES', 'lit: double lines on the top and the right, the two sides', 'the sun reaches, single lines on the others. the sun', 'never sets here: no night is a project rule, and now it', 'is a font rule too.'],
  ], 12),
  rule,
  ...setWord('ABCDEFGH').rows, '',
  ...setWord('IJKLMNOP').rows, '',
  ...setWord('QRSTUVWX').rows, '',
  ...setWord('YZ 01234').rows, '',
  ...setWord('56789 :.-!?').rows,
  rule,
  ...beside(sideBySide([styleA('lit'), styleA('single'), styleA('double')], 6), [
    'the same A in three edge styles:',
    'lit, single and double. the header',
    'uses lit. the other two are for',
    'other islands.',
  ], 42, 1),
  ['lit', 'single', 'double'].map((n) => pad(' '.repeat(Math.floor((8 - n.length) / 2)) + n, 14)).join('').replace(/\s+$/, ''),
  rule,
  ...notes(
    'a pangram: every letter of the alphabet, and every word of it',
    'happens on the island.',
    '',
    `    ${PANGRAM[0]}`,
    `    ${PANGRAM[1]}`,
  ),
];
const specimenPre = pre(specimenRows);

// COLOPHON ------------------------------------------------------------------------------------
const colophonPre = pre(notes(
  `set in ${FONT_NAME}, by ${FOUNDRY}, a type foundry that exists only in this`,
  `file. ${glyphCount} glyphs, each drawn as a small bitmap and traced into box-drawing`,
  'lines by the generator, the way an outline font file stores its letters',
  'as placeholder line pieces that the editor turns into box drawing.',
  '',
  'after the font managers of the DOS ANSI editors of the late 1980s and',
  '1990s (TheDraw, 1986, by Ian E. Davis, is the one people remember): you',
  'typed a word and it was stamped from a font file, so every A in a banner',
  'was the same A. no real font file was opened, copied or traced for this',
  'one, and nothing here is affiliated with any of them.',
  '',
  'Castaway is an unofficial remake inspired by Johnny Castaway, the 1992',
  'desert-island screensaver, with its own character, art and music. it is',
  'not affiliated with that screensaver or with its owners.',
  '',
  'greetz to the hermit crab, for wearing a coconut with confidence. to the',
  'grey tabby, for arriving and leaving by crate. to the shark, for keeping',
  'the beat. to the turtle, for sharing a nap. and to the kumara, for',
  'growing at all.',
));

// =============================================================================================
// 5. The colour proof (SVG). The same SWASH bitmaps as a Color-type font (CASTAWAY) and a
//    Block-type font (what is happening now), on an 80-column text screen of 8 x 16 cells in
//    the sixteen text-mode colours. One loop is 60 s: the theme's 20 bars of 3 s. Words change
//    on a bar line and stamp in one letter per sixteenth note (80 BPM), as if typed into a
//    font manager. Mostly the word is IDLE.
// =============================================================================================
const VGA = {
  black: '#000000', blue: '#0000AA', green: '#00AA00', cyan: '#00AAAA', brown: '#AA5500', lgrey: '#AAAAAA',
  dgrey: '#555555', lgreen: '#55FF55', lcyan: '#55FFFF', lred: '#FF5555', yellow: '#FFFF55', white: '#FFFFFF',
};
const COLS = 80, ROWS = 18, CW = 8, CH = 16, SPAD = 16;
const SW = COLS * CW, SH = ROWS * CH, VBW = SW + SPAD * 2, VBH = SH + SPAD * 2;
const LOOP = 60, BAR = 3, BEAT = 0.75, SIXTEENTH = BEAT / 4;

// ---------------------------------------------------------------------------------------------
// The small print: an 8 x 16 text-mode bitmap face (capitals, digits, a few marks), the same
// letterforms the other Castaway headers' text screens use.
// ---------------------------------------------------------------------------------------------
const TFONT = new Map();
function tdef(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => { let v = 0; for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c); g[top + i] = v; });
  TFONT.set(ch, g);
}
const TCAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(TCAPS)) tdef(ch, 2, rows);
tdef('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');
tdef('.', 10, '...##.. ...##..');
tdef(',', 9, '...##.. ...##.. ...##.. ..##...');
tdef(':', 5, '...##.. ...##.. ....... ....... ...##.. ...##..');
tdef('-', 7, '#######');
tdef('/', 4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......');
tdef('&', 2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##');
tdef('·', 7, '...##.. ...##..');
TFONT.set(' ', new Array(16).fill(0));

// Bitmap rows -> one compact path of rectangles (runs along a row, merged down while they match).
function runsToPath(rowRuns, sx = 1, sy = 1) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rowRuns.length; y++) {
    const next = [];
    for (const [x0, w] of rowRuns[y]) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${r.x * sx} ${r.y * sy}h${r.w * sx}v${r.h * sy}h${-r.w * sx}z`).join('');
}
const runsOf = (row) => {
  const runs = [];
  for (let x = 0; x < row.length;) { if (row[x]) { const s = x; while (x < row.length && row[x]) x++; runs.push([s, x - s]); } else x++; }
  return runs;
};
const tglyphIds = new Map();
function tgid(ch) {
  if (!TFONT.has(ch)) throw new Error(`no small glyph for ${JSON.stringify(ch)}`);
  if (!tglyphIds.has(ch)) tglyphIds.set(ch, `t${tglyphIds.size.toString(36)}`);
  return tglyphIds.get(ch);
}
// A line of small text at a cell position, in one colour.
function stext(row, col, str, colour) {
  if (col < 0 || col + [...str].length > COLS) throw new Error(`text off screen: ${str}`);
  const uses = [...str].map((ch, i) => (ch === ' ' ? '' : `<use href="#${tgid(ch)}" x="${(col + i) * CW}"/>`)).join('');
  return `<g fill="${VGA[colour]}" transform="translate(0 ${row * CH})">${uses}</g>`;
}

// ---------------------------------------------------------------------------------------------
// The cell canvas. A cell is 2 x 2 units of 4 x 8 px, which is all the half blocks need. A unit
// holds a colour key, or a shade key ('░fg/bg') that is drawn with a dot pattern.
// ---------------------------------------------------------------------------------------------
const HALVES = { '█': [1, 1, 1, 1], '▀': [1, 1, 0, 0], '▄': [0, 0, 1, 1], '▌': [1, 0, 1, 0], '▐': [0, 1, 0, 1] };
class Cells {
  constructor(w = COLS * 2, h = ROWS * 2) { this.w = w; this.h = h; this.u = new Array(w * h).fill(null); }
  unit(x, y, key) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.u[y * this.w + x] = key; }
  // One text cell: a block or shade character in fg over bg (bg null keeps what is there).
  cell(col, row, ch, fg, bg = 'black') {
    const q = HALVES[ch];
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([dx, dy], k) => {
      const key = q ? (q[k] ? fg : bg) : `${ch}${fg}/${bg}`;
      if (key && !(q && key === 'black' && bg === 'black' && !q[k])) this.unit(col * 2 + dx, row * 2 + dy, key);
    });
  }
  // Half-height pixels for the Block type: pixel (x, y) is one column wide and half a row tall.
  half(col, hy, key) { this.unit(col * 2, hy, key); this.unit(col * 2 + 1, hy, key); }
  // Paths, one per key, in px. Shade keys come back with their pattern.
  paths() {
    const keys = [...new Set(this.u.filter((k) => k && k !== 'black'))];
    return keys.map((key) => {
      const rows = [];
      for (let y = 0; y < this.h; y++) rows.push(runsOf(Array.from({ length: this.w }, (_, x) => this.u[y * this.w + x] === key)));
      return { key, d: runsToPath(rows, CW / 2, CH / 2) };
    });
  }
}
// Shade patterns, aligned to the screen: light = 1 dot in 4, medium = 2 in 4, dark = 3 in 4.
const shadeDefs = new Map();
function fillOf(key) {
  if (VGA[key]) return VGA[key];
  const m = /^([░▒▓])(\w+)\/(\w+)$/.exec(key);
  if (!m) throw new Error(`bad colour key ${key}`);
  const [, ch, fg, bg] = m;
  if (!shadeDefs.has(key)) {
    const id = `p${shadeDefs.size}`;
    const dots = { '░': 'M0 0h2v2h-2z', '▒': 'M0 0h2v2h-2zM2 2h2v2h-2z', '▓': 'M0 0h4v2h-4zM2 2h2v2h-2z' }[ch];
    const back = bg === 'black' ? '' : `<rect width="4" height="4" fill="${VGA[bg]}"/>`;
    shadeDefs.set(key, { id, svg: `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse">${back}<path d="${dots}" fill="${VGA[fg]}"/></pattern>` });
  }
  return `url(#${shadeDefs.get(key).id})`;
}
const drawCells = (cells) => cells.paths().map(({ key, d }) => `<path fill="${fillOf(key)}" d="${d}"/>`).join('');

// ---------------------------------------------------------------------------------------------
// Color type: one pixel per cell. Lit from the top right, like the outline: the top face is
// white over yellow, the right edge has a white half column, the left edge a brown one, the
// bottom a brown half row. Closed counters are dark grey shade; the shadow falls down and to
// the left, away from the sun.
// ---------------------------------------------------------------------------------------------
function inkMap(word, spacing = 1) {
  const glyphs = [...word].map((c) => GLYPHS[c] ?? (() => { throw new Error(`no glyph ${c}`); })());
  const w = glyphs.reduce((s, g, k) => s + g[0].length + (k ? spacing : 0), 0);
  const map = Array.from({ length: GH }, () => Array(w).fill(0));
  const boxes = [];
  let x0 = 0;
  glyphs.forEach((g, k) => {
    if (k) x0 += spacing;
    for (let y = 0; y < GH; y++) for (let x = 0; x < g[0].length; x++) if (g[y][x] === '#') map[y][x0 + x] = 1;
    boxes.push([x0, g[0].length]);
    x0 += g[0].length;
  });
  return { map, w, boxes };
}
function colourType(cells, word, col0, row0) {
  const { map, w, boxes } = inkMap(word);
  const ink = (x, y) => y >= 0 && y < GH && x >= 0 && x < w && map[y][x] === 1;
  // shadow first, one cell down and one to the left
  for (let y = 0; y <= GH; y++) for (let x = -1; x < w; x++) if (!ink(x, y) && ink(x + 1, y - 1)) cells.cell(col0 + x, row0 + y, '░', 'dgrey');
  // counters: paper inside a glyph's box that cannot reach the box's edge
  for (const [bx, bw] of boxes) {
    const seen = new Set();
    const stack = [];
    for (let y = 0; y < GH; y++) for (let x = bx; x < bx + bw; x++) {
      if ((y === 0 || y === GH - 1 || x === bx || x === bx + bw - 1) && !ink(x, y)) stack.push([x, y]);
    }
    while (stack.length) {
      const [x, y] = stack.pop();
      const k = `${x},${y}`;
      if (seen.has(k) || x < bx || x >= bx + bw || y < 0 || y >= GH || ink(x, y)) continue;
      seen.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (let y = 0; y < GH; y++) for (let x = bx; x < bx + bw; x++) if (!ink(x, y) && !seen.has(`${x},${y}`)) cells.cell(col0 + x, row0 + y, '▒', 'dgrey');
  }
  for (let y = 0; y < GH; y++) for (let x = 0; x < w; x++) {
    if (!ink(x, y)) continue;
    const c = col0 + x, r = row0 + y;
    if (!ink(x, y - 1)) cells.cell(c, r, '▀', 'white', 'yellow');
    else if (!ink(x + 1, y)) cells.cell(c, r, '▐', 'white', 'yellow');
    else if (!ink(x - 1, y)) cells.cell(c, r, '▌', 'brown', 'yellow');
    else cells.cell(c, r, '█', 'yellow');
  }
  return w;
}

// ---------------------------------------------------------------------------------------------
// Block type: one colour, light cyan, half a row per pixel, with a light-shade drop shadow in
// the same colour (down and to the left). Each glyph is a symbol, stamped where it is needed.
// ---------------------------------------------------------------------------------------------
const blockIds = new Map();
function blockGlyph(ch) {
  if (blockIds.has(ch)) return blockIds.get(ch);
  const g = GLYPHS[ch];
  const gw = g[0].length;
  const c = new Cells((gw + 2) * 2, GH + 1); // one spare column on the left for the shadow
  const ink = (x, y) => y >= 0 && y < GH && x >= 0 && x < gw && g[y][x] === '#';
  for (let y = 0; y <= GH; y++) for (let x = -1; x < gw; x++) if (!ink(x, y) && ink(x + 1, y - 1)) c.half(x + 1, y, '░lcyan/black');
  for (let y = 0; y < GH; y++) for (let x = 0; x < gw; x++) if (ink(x, y)) c.half(x + 1, y, 'lcyan');
  const id = `b${blockIds.size}`;
  blockIds.set(ch, { id, svg: `<symbol id="${id}" overflow="visible">${drawCells(c)}</symbol>`, w: gw });
  return blockIds.get(ch);
}

// ---------------------------------------------------------------------------------------------
// Timing: step visibility classes over the 60 s loop (and over a 3 s bar for the beat lights)
// ---------------------------------------------------------------------------------------------
const css = [];
const visCache = new Map();
const pct = (t, P) => `${+((100 * t) / P).toFixed(4)}%`;
function stepVis(intervals, P = LOOP) {
  const iv = [];
  for (const [from, to] of intervals) {
    const a = ((from % P) + P) % P, b = a + (to - from);
    if (to - from >= P) iv.push([0, P]);
    else if (b <= P) iv.push([a, b]);
    else { iv.push([a, P]); iv.push([0, b - P]); }
  }
  iv.sort((p, q) => p[0] - q[0]);
  const key = `${P}|${JSON.stringify(iv)}`;
  if (visCache.has(key)) return visCache.get(key);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const name = `v${visCache.size.toString(36)}`;
  const pts = new Map([[0, on(0) ? 1 : 0]]);
  for (const [a, b] of iv) { if (a > 0) pts.set(a, 1); if (b < P) pts.set(b, on(b) ? 1 : 0); }
  let kf = '';
  for (const [t, v] of [...pts].sort((p, q) => p[0] - q[0])) kf += `${pct(t, P)}{opacity:${v}}`;
  kf += `100%{opacity:${on(0) ? 1 : 0}}`;
  css.push(`@keyframes ${name}{${kf}}.${name}{opacity:${on(0) ? 1 : 0};animation:${name} ${P}s step-end infinite}`);
  visCache.set(key, name);
  return name;
}
const during = (intervals, inner, P = LOOP) => `<g class="${stepVis(intervals, P)}">${inner}</g>`;

// What is on the island, bar by bar. A gag holds for one bar; IDLE holds for the rest. The
// last IDLE runs over the loop point into bar 1, so the first frame already reads IDLE.
const NOW = [
  { word: 'COCONUT', from: 3, to: 4, caption: 'FALLS ON A HERMIT CRAB. THE CRAB WALKS OFF IN IT.' },
  { word: 'IDLE', from: 4, to: 7 },
  { word: 'BOTTLE', from: 7, to: 8, caption: 'A MESSAGE IN A BOTTLE. IT WASHES STRAIGHT BACK.' },
  { word: 'IDLE', from: 8, to: 11 },
  { word: 'TURTLE', from: 11, to: 12, caption: 'A SEA TURTLE VISITS. THEY BOTH DOZE OFF.' },
  { word: 'IDLE', from: 12, to: 14 },
  { word: 'DRONE', from: 14, to: 15, caption: 'A PARCEL ARRIVES. IT IS MORE HEADPHONES.' },
  { word: 'IDLE', from: 15, to: 17 },
  { word: 'SHARK', from: 17, to: 18, caption: 'A SHARK IN HEADPHONES, NODDING ON THE BEAT.' },
  { word: 'IDLE', from: 18, to: 23 },
];
const IDLE_CAPTION = 'SHE NODS TO THE MUSIC. NOTHING ELSE HAPPENS.';
{
  let bars = 0;
  NOW.forEach((s, k) => { const nxt = NOW[(k + 1) % NOW.length]; if ((s.to % 20) !== nxt.from) throw new Error(`gap after ${s.word}`); bars += s.to - s.from; });
  if (bars !== LOOP / BAR) throw new Error(`the words fill ${bars} bars, not ${LOOP / BAR}`);
}

// ---------------------------------------------------------------------------------------------
// The screen
// ---------------------------------------------------------------------------------------------
const L = { top: 0, logo: 2, label: 10, word: 11, caption: 15, bottom: 17 };
const still = new Cells();
// top and bottom bars
for (let c = 0; c < COLS; c++) { still.cell(c, L.top, '█', 'blue'); still.cell(c, L.bottom, '█', 'blue'); }
const logoW = inkMap('CASTAWAY').w;
const LOGO_COL = Math.floor((COLS - logoW) / 2);
colourType(still, 'CASTAWAY', LOGO_COL, L.logo);
const WORD_COL = LOGO_COL;
// The island, small, at the right of the word line, in a little daylight window: half-row
// pixels, as the Block type uses. s sky, u/U the sun (top right, where the letters are lit
// from), g/G frond greens, t trunk, y sand, b sea, C wave crests. One tall palm, leaning a
// little toward the sun; no one under it at this size: she is in the word line.
const ISLAND = [
  'sssssssssssss',
  'sssgGgssssuus',
  'sgGGGGGgsuUUu',
  'ggsstGsgsuUUu',
  'gssstsssssuus',
  'sssstssssssss',
  'sssstssssssss',
  'bbbtbbbbbbCbb',
  'bbytyyybbbbbb',
  'byyyyyyyybbCb',
  'bbCbbbbbbbbbb',
  'bbbbbbCbbbbbb',
];
const ISLAND_COL = COLS - 1 - ISLAND[0].length, ISLAND_HY = (L.caption + 1) * 2 - ISLAND.length;
const ISLAND_INK = { s: 'cyan', u: 'yellow', U: 'white', g: 'green', G: 'lgreen', t: 'brown', y: 'yellow', b: 'blue', C: 'lcyan' };
ISLAND.forEach((row, y) => {
  if (row.length !== ISLAND[0].length) throw new Error(`island row ${y} is ${row.length} wide`);
  [...row].forEach((k, x) => { if (!ISLAND_INK[k]) throw new Error(`island key ${k}`); still.half(ISLAND_COL + x, ISLAND_HY + y, ISLAND_INK[k]); });
});

const layers = [];
layers.push(drawCells(still));
const rightAlign = (s, end = COLS - 1) => end - [...s].length;
layers.push(
  stext(L.top, 1, FONT_NAME, 'yellow'),
  stext(L.top, 1 + FONT_NAME.length, '  ·  COLOUR TYPE AND BLOCK TYPE  ·  SPACING 1', 'lgrey'),
  stext(L.top, rightAlign(FOUNDRY), FOUNDRY, 'lcyan'),
  stext(L.label, WORD_COL, 'NOW ON THE ISLAND', 'lred'),
  stext(L.bottom, 1, 'BAR', 'lgrey'),
  stext(L.bottom, 7, '/20', 'lgrey'),
  stext(L.bottom, 17, '80 BPM  ·  F MAJOR  ·  SEED 1992', 'lgrey'),
  stext(L.bottom, rightAlign('NOT TO SCALE'), 'NOT TO SCALE', 'yellow'),
);
// the bar counter, one number per bar
for (let b = 0; b < LOOP / BAR; b++) layers.push(during([[b * BAR, (b + 1) * BAR]], stext(L.bottom, 5, String(b + 1).padStart(2, '0'), 'white')));
// four beat lights after it: dim, and the current beat lit
const BEAT_COL = 11;
const dot = (k, fill) => `<rect x="${(BEAT_COL + k) * CW + 2}" y="${L.bottom * CH + 6}" width="4" height="4" fill="${VGA[fill]}"/>`;
for (let k = 0; k < 4; k++) {
  layers.push(dot(k, 'dgrey'));
  layers.push(during([[k * BEAT, (k + 1) * BEAT]], dot(k, 'yellow'), BAR));
}

// the words, stamped one letter per sixteenth
const blockDefs = [];
const wordLayer = [];
for (const seg of NOW) {
  const t0 = seg.from * BAR, t1 = seg.to * BAR;
  let col = WORD_COL;
  const ends = [];
  [...seg.word].forEach((ch, i) => {
    const g = blockGlyph(ch);
    const at = t0 + i * SIXTEENTH;
    wordLayer.push(during([[at, t1]], `<use href="#${g.id}" x="${(col - 1) * CW}" y="${L.word * CH}"/>`));
    col += g.w;
    ends.push([at, col]);
    col += 1;
  });
  // the cursor sits one column after the last letter stamped, and blinks on the beat
  ends.forEach(([at, c], i) => {
    const until = i + 1 < ends.length ? ends[i + 1][0] : t1;
    wordLayer.push(during([[at, until]], `<rect class="blink" x="${(c + 1) * CW}" y="${(L.word + 2) * CH + 8}" width="${CW}" height="${CH / 2}" fill="${VGA.lgrey}"/>`));
  });
  if (col >= ISLAND_COL - 1) throw new Error(`${seg.word} and its cursor run into the island`); // the cursor sits in column col
  if (WORD_COL + (seg.caption ?? IDLE_CAPTION).length >= ISLAND_COL - 1) throw new Error(`caption for ${seg.word} runs into the island`);
  wordLayer.push(during([[t0, t1]], stext(L.caption, WORD_COL, seg.caption ?? IDLE_CAPTION, seg.caption ? 'white' : 'lgrey')));
}
for (const { svg } of blockIds.values()) blockDefs.push(svg);
css.push(`@keyframes bl{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.blink{animation:bl ${BEAT}s step-end infinite}`);
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const SVG_TITLE = 'CASTAWAY, set in SWASH colour type';
const SVG_ALT = 'An 80-column text screen in the sixteen-colour DOS text palette: a colour proof of the SWASH font. '
  + 'A blue bar at the top reads SWASH, colour type and block type, spacing 1, EBB & KERN. Below it, CASTAWAY in big slab capitals, '
  + 'yellow with white top faces and white right edges, brown left edges, grey dotted counters and a dotted shadow falling down and to the left: lit from the top right. '
  + 'Under the label NOW ON THE ISLAND, a smaller light cyan block-letter word is typed in on the bar lines, one letter per sixteenth note: mostly IDLE, '
  + 'captioned SHE NODS TO THE MUSIC. NOTHING ELSE HAPPENS. Now and then it is COCONUT, BOTTLE, TURTLE, DRONE or SHARK, each with a one-line caption, '
  + 'and then IDLE again. At the right, a tiny palm island in a daylight window: cyan sky, a yellow sun in the top right corner, blue sea. A bottom bar counts BAR 01/20 to 20/20 with four beat lights, 80 BPM, F MAJOR, SEED 1992, and NOT TO SCALE.';
const tglyphDefs = [...tglyphIds].map(([ch, id]) => {
  const g = TFONT.get(ch);
  return `<path id="${id}" d="${runsToPath(g.map((v) => runsOf(Array.from({ length: 8 }, (_, x) => (v >> (7 - x)) & 1))))}"/>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${escHtml(SVG_TITLE)}</title><desc id="d">${escHtml(SVG_ALT)}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${tglyphDefs}${[...shadeDefs.values()].map((s) => s.svg).join('')}${blockDefs.join('')}</defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="10" fill="#000000"/>`
  + `<rect x="0.5" y="0.5" width="${VBW - 1}" height="${VBH - 1}" rx="9.5" fill="none" stroke="#2A2A3A"/>`
  + `<g transform="translate(${SPAD} ${SPAD})" shape-rendering="crispEdges">${layers.join('')}${wordLayer.join('')}</g>`
  + '</svg>\n';
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------------------------
const details = (summary, body) => ['<details>', `<summary>${summary}</summary>`, '', body, '', '</details>', ''];
const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Counts checked ${AS_OF}. -->`,
  '',
  heroPre,
  '',
  `**Castaway** (working title) is a stationary-frame lo-fi video for YouTube: one tiny island, one tall palm, one raft, and a young woman in cream headphones with ten hours to fill. She mostly idles, nodding to the music. Every so often, something happens. It is an unofficial remake inspired by the small-island routines and visual comedy of *Johnny Castaway*, the 1992 desert-island screensaver, repainted as a sunny, hand-painted coastal scene: 16:9, 1080p, 30 fps, and always daytime.`,
  '',
  `A bottle washes straight back. A drone delivers more headphones. A shark in headphones nods along. [activities.toml](activities.toml) holds more than ${ACTIVITIES_FLOOR} activities, most of them on four timers, and every one starts on the next bar of the music, so the gags land on the beat. Every sound is synthesized from code: no samples, no stock loops, no recordings.`,
  '',
  '```sh',
  'python tools/serve.py',
  '# then open http://127.0.0.1:8765/ for the live preview and the MP4 export',
  '```',
  '',
  `<sub>In development: no video has been published yet. Set in ${FONT_NAME}, an outline face with exactly one A and no swashes.</sub>`,
  '',
  '<br>',
  '',
  ...details('<b>GAGS</b> · what lands on the island, on the beat', gagsPre),
  ...details('<b>10:00:00</b> · four timers, one seed, a great deal of nodding', timersPre),
  ...details('<b>80 BPM</b> · every sound made by code, none of it heard yet', soundPre),
  ...details('<b>RUN IT</b> · the renderer, the schedule check and the dev reel', runPre),
  ...details(`<b>${FONT_NAME}</b> · the typeface: the colour proof, every glyph, three edge styles`, [
    `<p align="center"><img src="${SVG_REL}" width="100%" alt="${escHtml(SVG_ALT).replace(/"/g, '&quot;')}"></p>`,
    '',
    specimenPre,
  ].join('\n')),
  ...details('<b>COLOPHON</b> · who made the letters, and respect', colophonPre),
].join('\n');
for (const line of md.split('\n')) if (/—/.test(line)) throw new Error(`em dash in: ${line}`);
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} (${md.length} bytes)`);
