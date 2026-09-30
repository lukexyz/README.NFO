// Generated Banner header for the ULTRA-SATISFACTORY README (style catalogue entry nfo-09).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/ultra-satisfactory/src/32-generated-banner_opus_5.5.mjs
// It rewrites examples/ultra-satisfactory/32-generated-banner_opus_5.5.md. Edit this file, not the .md.
//
// The style is the type-a-word, stamp-it-from-a-font banner: the look of FIGlet (Glenn Chappell
// and Ian Chai, 1991) and TOIlet (Sam Hocevar, 2006). Those are credited references. No font
// file of theirs was read or converted: the alphabets below ("dies") were drawn for this
// header, and the engine underneath them is a small banner setter written from the published
// description of how such fonts are laid out (full width, kerning, smushing). With six rows and
// four characters to draw with, plain letters such as H or L can only come out one way, so
// some glyphs will resemble those in stock outline fonts. That is convergence, not a copy.
//
//   GUSSET  6 rows  outline letters from _ | / \ < >, squared, with the top-left and
//                   bottom-right corners of the round letters clipped off like a gusset
//                   plate, and an I drawn as an I-beam so it cannot be mistaken for a stem.
//                   Smushes: neighbours share a wall.
//                   Sets SATISFACTORY and the headings inside the fold-outs.
//   CRATE   7 rows  a pixel alphabet. Each pixel is stamped as an ink pair: [] by default,
//                   ## as RIVET, or any other ink. --shear leans it one column per row (SKID).
//                   Sets ULTRA.
//   KEYCAP  3 rows  every character in its own box; the boxes smush into one strip.
//                   Sets the three tab names.
//   SHIM    3 rows  a small single-stroke alphabet. Fine in a terminal, hard to read at
//                   GitHub's 1.45 line height, so the page only shows it as a specimen and
//                   says so.
//
// The name is set as two lines of exactly the same width: ULTRA- in CRATE is 80 columns, and
// SATISFACTORY in GUSSET is 101 columns at full width, 88 kerned and 80 smushed. The script
// stops if the two ever differ, because the copy says they match. Under SATISFACTORY, and
// under every heading stamped in GUSSET, runs a chain dimension the press writes from its own
// measurements: a tick at the end of every letter, a + where two letters share a wall, and
// the letter in plain type, so the word can be read even where the outline is hard going at
// GitHub's line height.
//
// The header is text only, 7-bit ASCII, 80 columns: it renders the same everywhere and needs
// no image. The script refuses to write a line wider than 80 columns or a character outside
// printable ASCII, and it strips trailing whitespace.
//
// The same engine sets any other name:
//   node 32-generated-banner_opus_5.5.mjs --say "YOUR REPO" --die gusset
//   node 32-generated-banner_opus_5.5.mjs --say "V2" --die crate --ink "##" --shear
//   node 32-generated-banner_opus_5.5.mjs --say "SCREW" --die gusset --mode full   (or kern, smush)
//   node 32-generated-banner_opus_5.5.mjs --flf gusset > gusset.flf   (a FIGfont 2 file)
// With --say or --flf it only prints to stdout and writes nothing. The --flf export follows
// the FIGfont 2 layout but has not been loaded into a FIGlet implementation: treat it as
// untested.
//
// Every number in the copy is either one the app shows (140 items, 211 recipes, 88 alternates,
// 477 buildings, 9 production machines, 333 structure pieces, 5 phases) or is measured from the banner by this script
// at build time (columns, letters, joints, shared walls, repeated letters, the number of
// faces and drawings). Check the app before changing the first kind.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', '32-generated-banner_opus_5.5.md');
const W = 80;
const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';

// ================================================================ the dies
// A die source is a block of text: "@X" starts glyph X, and the next `height` lines are its
// rows. Rows are right-padded to the glyph's widest row, so trailing blanks need not be typed.
function parseDie(src, height) {
  const glyphs = {};
  const lines = src.replace(/^\n/, '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('@')) continue;
    const ch = lines[i].slice(1);
    const rows = lines.slice(i + 1, i + 1 + height).map((l) => l.replace(/\s+$/, ''));
    if (rows.length !== height || rows.some((r) => r.startsWith('@'))) throw new Error(`glyph ${ch}: expected ${height} rows`);
    const w = Math.max(...rows.map((r) => r.length));
    glyphs[ch] = rows.map((r) => r.padEnd(w));
    i += height;
  }
  return glyphs;
}

// ---------------------------------------------------------------- GUSSET
// Row 0 carries only top edges. Rows 1-5 are the body; row 5 closes the feet.
// Strokes are hollow and three columns wide; counters are two columns wide, so a stroke and
// a counter never look alike. Round letters are not round: they are plates with the top-left
// and the bottom-right corner cut.
const GUSSET = {
  name: 'GUSSET', height: 6, mode: 'smush', gap: 1, space: 4,
  glyphs: parseDie(String.raw`
@A
  _____
 / __  |
| |__| |
|  __  |
| |  | |
|_|  |_|
@B
 _____
|  __ \
| |__| |
|  __ <
| |__| |
|_____/
@C
  _____
 / ____|
| |
| |
| |____
|______|
@D
 _____
|  __ \
| |  | |
| |  | |
| |__| |
|_____/
@E
 ______
|  ____|
| |___
|  ___|
| |____
|______|
@F
 ______
|  ____|
| |___
|  ___|
| |
|_|
@G
  _____
 / ____|
| |  __
| | |_ |
| |__| |
|_____/
@H
 _    _
| |  | |
| |__| |
|  __  |
| |  | |
|_|  |_|
@I
 ___
|_ _|
 | |
 | |
_| |_
|___|
@J
      _
     | |
     | |
 _   | |
| |__| |
|_____/
@K
 _   _
| | / /
| |/ /
|   <
| |\ \
|_| \_\
@L
 _
| |
| |
| |
| |____
|______|
@M
 _     _
|  \ /  |
|   V   |
| |\_/| |
| |   | |
|_|   |_|
@N
 _    _
|  \ | |
|   \| |
| |\   |
| | \  |
|_|  \_|
@O
  _____
 / __  |
| |  | |
| |  | |
| |__| |
|_____/
@P
  _____
 / __  |
| |__| |
|  ____|
| |
|_|
@Q
  _____
 / __  |
| |  | |
| |  | |
| |__\ \
|_____\_\
@R
  _____
 / __  |
| |__| |
|     _/
| | \ \
|_|  \_\
@S
  _____
 / ____|
| |____
|____  |
 ____| |
|_____/
@T
 _____
|_   _|
  | |
  | |
  | |
  |_|
@U
 _    _
| |  | |
| |  | |
| |  | |
| |__| |
|_____/
@V
 _    _
| |  | |
| |  | |
 \ \/ /
  \  /
   \/
@W
 _     _
| |   | |
| | _ | |
| |/ \| |
|  / \  |
|_/   \_|
@X
__   __
\ \ / /
 \ V /
  > <
 / _ \
/_/ \_\
@Y
__   __
\ \ / /
 \ V /
  | |
  | |
  |_|
@Z
 _____
|___  |
   / /
  / /
 / /__
/_____|
@0
  ____
 / __ \
| |  | |
| |  | |
| |__| |
 \____/
@1
  _
 / |
/_ |
 | |
 | |
 |_|
@2
 ______
|____  |
 ____| |
|  ____|
| |____
|______|
@3
 ______
|____  |
  ___| |
 |___  |
 ____| |
|_____/
@4
 _    _
| |  | |
| |__| |
|____  |
     | |
     |_|
@5
 ______
|  ____|
| |____
|____  |
 ____| |
|_____/
@6
  _____
 / ____|
| |____
|  __  |
| |__| |
|_____/
@7
 ______
|____  |
     | |
     | |
     | |
     |_|
@8
  _____
 / __  |
| |__| |
|  __  |
| |__| |
|_____/
@9
  _____
 / __  |
| |__| |
|____  |
 ____| |
|_____/
@-


 ____
|____|


@.




 _
|_|
@!
 _
| |
| |
|_|
 _
|_|
@:

 _
|_|
 _
|_|

@+

   _
 _| |_
|_   _|
  |_|

`, 6),
};

// ---------------------------------------------------------------- CRATE
// A pixel alphabet, 7 rows, two-pixel stems and one-pixel bars. '#' is a pixel. At stamping
// time each pixel becomes an ink pair, so one die gives several textures.
const CRATE = {
  name: 'CRATE', height: 7, mode: 'full', gap: 1, space: 3,
  glyphs: parseDie(`
@A
.####.
##..##
##..##
######
##..##
##..##
##..##
@B
#####.
##..##
##..##
#####.
##..##
##..##
#####.
@C
.#####
##....
##....
##....
##....
##....
.#####
@D
#####.
##..##
##..##
##..##
##..##
##..##
#####.
@E
######
##....
##....
#####.
##....
##....
######
@F
######
##....
##....
#####.
##....
##....
##....
@G
.#####
##....
##....
##.###
##..##
##..##
.#####
@H
##..##
##..##
##..##
######
##..##
##..##
##..##
@I
##
##
##
##
##
##
##
@J
....##
....##
....##
....##
....##
##..##
.####.
@K
##..##
##.##.
####..
###...
####..
##.##.
##..##
@L
##....
##....
##....
##....
##....
##....
######
@M
##....##
###..###
########
##.##.##
##....##
##....##
##....##
@N
##...##
###..##
####.##
##.####
##..###
##...##
##...##
@O
.####.
##..##
##..##
##..##
##..##
##..##
.####.
@P
#####.
##..##
##..##
#####.
##....
##....
##....
@Q
.####.
##..##
##..##
##..##
##.###
##..##
.####.#
@R
#####.
##..##
##..##
#####.
##.##.
##..##
##..##
@S
.#####
##....
##....
.####.
....##
....##
#####.
@T
######
..##..
..##..
..##..
..##..
..##..
..##..
@U
##..##
##..##
##..##
##..##
##..##
##..##
.####.
@V
##..##
##..##
##..##
##..##
##..##
.####.
..##..
@W
##....##
##....##
##....##
##.##.##
########
###..###
##....##
@X
##..##
##..##
.####.
..##..
.####.
##..##
##..##
@Y
##..##
##..##
.####.
..##..
..##..
..##..
..##..
@Z
######
....##
...##.
..##..
.##...
##....
######
@0
.####.
##..##
##.###
###.##
##..##
##..##
.####.
@1
..##
.###
..##
..##
..##
..##
..##
@2
.####.
##..##
....##
...##.
..##..
.##...
######
@3
#####.
....##
....##
.####.
....##
....##
#####.
@4
##..##
##..##
##..##
######
....##
....##
....##
@5
######
##....
##....
#####.
....##
....##
#####.
@6
.####.
##....
##....
#####.
##..##
##..##
.####.
@7
######
....##
...##.
..##..
..##..
..##..
..##..
@8
.####.
##..##
##..##
.####.
##..##
##..##
.####.
@9
.####.
##..##
##..##
.#####
....##
....##
.####.
@-
.....
.....
.....
#####
.....
.....
.....
@.
..
..
..
..
..
..
##
@!
##
##
##
##
##
..
##
@%
##...#
##..##
...##.
..##..
.##...
##..##
#...##
`, 7),
};

// ---------------------------------------------------------------- SHIM
// Three rows, single stroke, four columns a letter, for secondary headings. One column
// between letters, no smushing.
const SHIM = {
  name: 'SHIM', height: 3, mode: 'full', gap: 1, space: 3,
  glyphs: parseDie(String.raw`
@A
 __
|__|
|  |
@B
 __
|__)
|__)
@C
 ___
|
|___
@D
 __
|  \
|__/
@E
 ___
|__
|___
@F
 ___
|__
|
@G
 ___
| __
|__|
@H

|__|
|  |
@I

|
|
@J

   |
|__|
@K

|_/
| \
@L

|
|___
@M

|\/|
|  |
@N

|\ |
| \|
@O
 __
|  |
|__|
@P
 __
|__)
|
@Q
 __
|  |
|__\
@R
 __
|__)
|  \
@S
 ___
(__
___)
@T
_____
  |
  |
@U

|  |
|__|
@V

\  /
 \/
@W

|  |
|/\|
@X

\_/
/ \
@Y

\_/
 |
@Z
____
  _/
_/__
@0
 __
|/ |
|__|
@1

/|
 |
@2
 __
 __|
|__
@3
 __
 __|
 __|
@4

|__|
   |
@5
 ___
|__
 __)
@6
 __
|__
|__|
@7
___
  /
 /
@8
 __
|__|
|__|
@9
 __
|__|
 __|
@-

__

@.


.
@,


,
@:

.
.
@!

|
.
`, 3),
};

// ---------------------------------------------------------------- KEYCAP
// No drawn glyphs: every character gets a box. Smushing merges the side walls, so a word
// becomes one strip of keys. Made at stamping time for whatever character is asked for.
const KEYCAP = {
  name: 'KEYCAP', height: 3, mode: 'smush', space: 3,
  glyph: (ch) => [' ___ ', `| ${ch} |`, '|___|'],
};

const DIES = { gusset: GUSSET, crate: CRATE, shim: SHIM, keycap: KEYCAP };
for (const die of [GUSSET, CRATE, SHIM]) {
  for (const [ch, rows] of Object.entries(die.glyphs)) {
    if (rows.length !== die.height) throw new Error(`${die.name} ${ch}: ${rows.length} rows`);
    if (!rows.some((r) => (die === CRATE ? r.includes('#') : r.trim() !== ''))) throw new Error(`${die.name} ${ch}: empty glyph`);
  }
}

// ================================================================ the press
// HARD is the hardblank: a space that may not be squeezed out. It becomes a real space at the end.
const HARD = '\u0000';
// Smushing rules, as the banner fonts of this school describe them:
//   equal character: two of the same become one;
//   underscore: an underscore gives way to any wall character.
// Nothing else may share a column, so no letter ever loses a corner to its neighbour.
const WALLS = '|/\\[]{}()<>';
function smushChar(l, r) {
  if (l === ' ') return r;
  if (r === ' ') return l;
  if (l === HARD || r === HARD) return null;
  if (l === r) return l;
  if (l === '_' && WALLS.includes(r)) return r;
  if (r === '_' && WALLS.includes(l)) return l;
  return null;
}
const lead = (s) => s.length - s.trimStart().length;
const trail = (s) => s.length - s.trimEnd().length;

// Stamp one glyph onto the end of a line. Returns how many columns the two overlap.
//   full:  no overlap; every glyph keeps its own box and the die's gap beside it.
//   kern:  slide left until some row touches.
//   smush: kern, then one column more if every touching row can share a character.
function overlapFor(line, glyph, mode) {
  if (mode === 'full' || line[0].length === 0) return 0;
  let best = Infinity;
  for (let r = 0; r < glyph.length; r++) {
    const L = line[r], G = glyph[r];
    const lBlank = L.trim() === '', gBlank = G.trim() === '';
    let amt = (lBlank ? L.length : trail(L)) + (gBlank ? G.length : lead(G));
    if (mode === 'smush' && !lBlank && !gBlank) {
      const lch = L[L.length - 1 - trail(L)], rch = G[lead(G)];
      if (smushChar(lch, rch) !== null) amt += 1;
    }
    best = Math.min(best, amt);
  }
  return Math.min(best, glyph[0].length, line[0].length);
}
function stamp(line, glyph, mode) {
  const n = overlapFor(line, glyph, mode);
  const inked = (c) => c !== ' ' && c !== HARD;
  // A column counts as a shared wall only if some row has ink from both letters in it.
  let walls = 0;
  for (let k = 0; k < n; k++) {
    if (line.some((L, r) => inked(L[L.length - n + k]) && inked(glyph[r][k]))) walls += 1;
  }
  const out = line.map((L, r) => {
    const G = glyph[r];
    let head = L.slice(0, L.length - n);
    for (let k = 0; k < n; k++) {
      const c = smushChar(L[L.length - n + k], G[k]);
      if (c === null) throw new Error(`smush collision between "${L[L.length - n + k]}" and "${G[k]}"`);
      head += c;
    }
    return head + G.slice(n);
  });
  return { rows: out, shared: n, walls };
}

// Set a string in a die. Options: mode (full | kern | smush), ink (pixel dies), shear.
// Returns the rows plus what the press measured: width, joints, columns overlapped, walls
// shared, and the column span of every letter (so the page can dimension them).
function set(text, die, opt = {}) {
  const mode = opt.mode ?? die.mode;
  const ink = opt.ink ?? '[]';
  const unit = die === CRATE ? ink.length : 1;   // columns per pixel
  let line = Array.from({ length: die.height }, () => '');
  let shared = 0, walls = 0, joints = 0, first = true, afterSpace = false;
  const spans = [];
  for (const ch of text) {
    let g;
    if (ch === ' ') g = Array.from({ length: die.height }, () => HARD.repeat(die.space * unit));
    else if (die.glyph) g = die.glyph(ch);
    else {
      g = die.glyphs[ch] ?? die.glyphs[ch.toUpperCase()];
      if (!g) throw new Error(`${die.name} has no glyph for "${ch}"`);
      if (die === CRATE) g = g.map((row) => [...row].map((p) => (p === '#' ? ink : ' '.repeat(unit))).join(''));
    }
    if (!first && die.gap && mode === 'full') line = line.map((l) => l + HARD.repeat(die.gap * unit));
    const res = stamp(line, g, mode);
    if (!first && ch !== ' ') { joints += 1; shared += res.shared; walls += res.walls; }
    if (ch !== ' ') {
      const start = line[0].length - res.shared;
      spans.push({ ch, start, end: start + g[0].length - 1, walls: first ? 0 : res.walls, wordStart: first || afterSpace });
    }
    afterSpace = ch === ' ';
    line = res.rows;
    first = false;
  }
  let rows = line.map((l) => l.replaceAll(HARD, ' '));
  if (opt.shear) rows = rows.map((l, r) => ' '.repeat(die.height - 1 - r) + l);
  const width = Math.max(...rows.map((l) => l.trimEnd().length));
  return { rows: rows.map((l) => l.padEnd(width).slice(0, width)), width, joints, shared, walls, spans };
}

// ================================================================ FIGfont export
// Writes a die as a FIGfont version 2 file so other banner setters can load it.
// Header: signature+hardblank, height, baseline, max length, old layout, comment lines,
// print direction, full layout, codetag count. Then ASCII 32-126 and the seven Deutsch
// characters, each glyph `height` lines ending in the endmark, the last line in two.
function flf(die, ink = '[]') {
  // The hardblank is $ by convention. KEYCAP draws every printable character, $ included,
  // so it takes DEL instead, which the format allows.
  const hb = die.glyph ? '\x7f' : '$';
  const glyphFor = (ch) => {
    if (ch === ' ') return Array.from({ length: die.height }, () => hb.repeat(die.space));
    if (die.glyph) return die.glyph(ch);
    let g = die.glyphs[ch] ?? die.glyphs[ch.toUpperCase()];
    if (!g) return Array.from({ length: die.height }, () => '');
    if (die === CRATE) g = g.map((row) => [...row].map((p) => (p === '#' ? ink : ' '.repeat(ink.length))).join('') + hb.repeat(ink.length));
    else if (die.gap) g = g.map((row) => row + (die.mode === 'smush' ? ' ' : hb).repeat(die.gap));
    return g;
  };
  const codes = [];
  for (let c = 32; c <= 126; c++) codes.push(String.fromCharCode(c));
  const german = ['A', 'O', 'U', 'a', 'o', 'u', 's'];
  const all = [...codes, ...german].map(glyphFor);
  const maxLen = Math.max(...all.map((g) => g[0].length)) + 2;
  const smush = die.mode === 'smush';
  const oldLayout = smush ? 3 : -1;          // rules 1 + 2, or full width
  const fullLayout = smush ? 3 + 128 : 0;    // the same rules, smushing on by default
  const comments = [
    `${die.name}, a die from the header generator for ULTRA-SATISFACTORY.`,
    'Capitals, digits and a little punctuation; lowercase maps to',
    'capitals and anything undrawn is empty.',
    'Drawn for that header, not converted from another font file.',
  ];
  const out = [`flf2a${hb} ${die.height} ${die.height} ${maxLen} ${oldLayout} ${comments.length} 0 ${fullLayout} 0`, ...comments];
  for (const g of all) g.forEach((row, r) => out.push(row + (r === g.length - 1 ? '@@' : '@')));
  return out.join('\n') + '\n';
}

// ================================================================ command line
const argv = process.argv.slice(2);
const arg = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] ?? '' : null; };
if (arg('flf') !== null) {
  const die = DIES[arg('flf').toLowerCase()];
  if (!die) throw new Error(`no such die. try: ${Object.keys(DIES).join(', ')}`);
  process.stdout.write(flf(die, arg('ink') ?? '[]'));
  process.exit(0);
}
if (arg('say') !== null) {
  const die = DIES[(arg('die') ?? 'gusset').toLowerCase()];
  if (!die) throw new Error(`no such die. try: ${Object.keys(DIES).join(', ')}`);
  const res = set(arg('say'), die, { mode: arg('mode') ?? undefined, ink: arg('ink') ?? undefined, shear: argv.includes('--shear') });
  console.log(res.rows.map((l) => l.trimEnd()).join('\n'));
  console.error(`${die.name}: ${res.width} col, ${res.joints} joints, ${res.walls} walls shared`);
  process.exit(0);
}

// ================================================================ page tools
// Lines are plain strings. Bold and links are zero-width markers, so widths can be measured
// exactly; the HTML is produced at the very end.
const links = [];
const MARK_LINK = 0xe000;
const B = (s) => `\x01${s}\x02`;
const A = (s, href = s) => {
  links.push(href);
  return `\x03${String.fromCharCode(MARK_LINK + links.length - 1)}${s}\x04`;
};
const visible = (s) => [...s].filter((c) => c.charCodeAt(0) > 4 && c.charCodeAt(0) < MARK_LINK).join('');
const len = (s) => visible(s).length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const center = (s, n = W) => ' '.repeat(Math.max(0, Math.floor((n - len(s)) / 2))) + s;
const indent = (rows, n) => rows.map((r) => (r === '' ? '' : ' '.repeat(n) + r));
const spread = (l, r, n = W) => {
  if (len(l) + len(r) + 2 > n) throw new Error(`spread too wide: ${visible(l)} | ${visible(r)}`);
  return l + ' '.repeat(n - len(l) - len(r)) + r;
};
// "key ..... value" with dot leaders; extra lines hang under the value.
const kv = (k, lines, keyWidth) => [].concat(lines).map((v, i) =>
  (i === 0 ? `${k} ${'.'.repeat(keyWidth - len(k) - 1)} ` : ' '.repeat(keyWidth + 1)) + v);
// Art on the left in a fixed-width column, text on the right, starting `top` rows down.
const beside = (left, width, right, top = 0) => {
  const n = Math.max(left.length, right.length + top);
  return Array.from({ length: n }, (_, r) => padR(left[r] ?? '', width) + (right[r - top] ?? ''));
};
// Bold a block of art row by row, keeping the bold off the blanks at either end.
const boldRows = (rows) => rows.map((r) => (r.trim() === '' ? '' : r.replace(/^(\s*)(.*?)(\s*)$/, (m, a, b, c) => a + B(b) + c)));
// A drafting dimension line: |<------ label ------>|
const dimension = (width, label) => {
  const room = width - 4 - len(label) - 2;
  if (room < 4) throw new Error(`dimension label too long for ${width} col: ${label}`);
  const l = Math.floor(room / 2);
  return `|<${'-'.repeat(l)} ${label} ${'-'.repeat(room - l)}>|`;
};
// A chain dimension under a stamped word: a tick wherever a letter ends, a + where that
// column is a wall two letters share, and the letter itself, in plain type, mid-span.
// Each word gets its own chain; the space between words stays blank.
const chain = (res) => {
  const row = Array.from({ length: res.width }, () => ' ');
  res.spans.forEach((s, i) => {
    const next = res.spans[i + 1];
    const from = s.wordStart ? s.start : res.spans[i - 1].end;
    for (let c = from; c < s.end; c++) if (row[c] === ' ') row[c] = '-';
    if (s.wordStart) row[s.start] = '|';
    row[s.end] = next && !next.wordStart && next.walls > 0 ? '+' : '|';
    const mid = Math.round((from + s.end) / 2);
    if (row[mid] !== '-') throw new Error(`no room to label ${s.ch}`);
    row[mid] = B(s.ch);
  });
  return row.join('').replace(/\s+$/, '');
};
// Fold-out headings are stamped in GUSSET and dimensioned the same way as the name.
const heading = (text) => { const res = set(text, GUSSET); return [...res.rows, chain(res)]; };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => {
  let out = '';
  const chars = [...esc(s)];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '\x01') out += '<b>';
    else if (c === '\x02') out += '</b>';
    else if (c === '\x03') out += `<a href="${links[chars[++i].charCodeAt(0) - MARK_LINK]}">`;
    else if (c === '\x04') out += '</a>';
    else out += c;
  }
  return out;
};

// ================================================================ the job
const MAKER = 'SMUSH & SONS PRESSWORKS';
const ultra = set('ULTRA-', CRATE);
const satis = set('SATISFACTORY', GUSSET);
const satisFull = set('SATISFACTORY', GUSSET, { mode: 'full' });
const satisKern = set('SATISFACTORY', GUSSET, { mode: 'kern' });
const LETTERS = ultra.spans.filter((s) => /[A-Z]/.test(s.ch)).length + satis.spans.length;
// Letters SATISFACTORY uses more than once. The press stamps each from the same glyph, and the
// copy says "we diffed them", so diff them: between its two edge columns (which a neighbour
// may share) every copy of a letter must come out the same, or the script stops.
const inside = (res, s) => res.rows.map((r) => r.slice(s.start + 1, s.end)).join('/');
const repeats = [];
for (const s of satis.spans) {
  const same = satis.spans.filter((t) => t.ch === s.ch);
  if (same.length < 2 || repeats.some(([c]) => c === s.ch)) continue;
  if (same.some((t) => inside(satis, t) !== inside(satis, same[0]))) throw new Error(`the ${s.ch}'s differ (the QC report says they match)`);
  repeats.push([s.ch, same.length]);
}
// How the joints came out: a wall shared, a corner tucked into a clipped corner (columns
// overlap but no wall is shared), or letters that only touch.
const joints = satis.spans.slice(1).map((s, i) => {
  const prev = satis.spans[i];
  return { pair: `${prev.ch} and ${s.ch}`, kind: s.walls > 0 ? 'wall' : s.start <= prev.end ? 'tuck' : 'touch' };
});
const nJoint = (kind) => joints.filter((j) => j.kind === kind).length;
if (nJoint('wall') !== satis.walls) throw new Error('joint count and wall count disagree');
const blockW = Math.max(ultra.width, satis.width);
const blockX = Math.floor((W - blockW) / 2);

// ---------------------------------------------------------------- first screen
// The three tabs are set as strips of keys, because that is what they are.
const tab = (name, text) => beside(boldRows(set(name, KEYCAP).rows), 43, text, 1);
const main = [
  spread(B(MAKER), 'job 0001 :: sheet 1 of 1 :: stamped, not drawn'),
  '='.repeat(W),
  '',
  ...indent(boldRows(ultra.rows), blockX + Math.floor((blockW - ultra.width) / 2)),
  ...indent(satis.rows, blockX + Math.floor((blockW - satis.width) / 2)),
  ...indent([chain(satis)], blockX + Math.floor((blockW - satis.width) / 2)),
  ...indent([dimension(blockW, `${blockW} col :: ${LETTERS} letters :: ${satis.walls} shared walls :: 0 artists`)], blockX),
  '',
  center('every recipe, building and Space Elevator objective, one click apart.'),
  center('a companion app for the factory game Satisfactory. park it on monitor two,'),
  center('for when a Manufacturer starves and you cannot remember what it eats.'),
  ...indent([
    ...tab('OBJECTIVES', [
      'pick a Space Elevator phase, see its',
      'parts and counts, click for recipes.',
    ]),
    ...tab('ITEMS', [
      'search every item as you type. cards',
      'show rates, machine, cycle and MW.',
    ]),
    ...tab('BUILDINGS', [
      'every building and what it makes, by',
      'tier, plus Mk-by-Mk upgrade paths.',
    ]),
  ], 1),
  '',
  ` ${B('run it')}    $ python -m pip install -r requirements.txt`,
  spread('           $ python -m streamlit run app/app.py', `${A('#run-it-locally')} `),
  spread(` ${B('or don\'t')}  ${A(LIVE)}`, 'live, in your browser '),
  '='.repeat(W),
  center(`unofficial fan project :: not affiliated with Coffee Stain Studios :: ${A('Apache 2.0', 'LICENSE')}`),
];

// ---------------------------------------------------------------- QC report
const fits = (w) => (w > W ? `${B(String(w))} col. does not fit.` : `${B(String(w))} col. ships.`);
const spacing = (mode, title, note, total) => [
  spread(B(title), `SATISFACTORY: ${fits(total)}`, W - 4),
  ...beside(set('SCREW', GUSSET, { mode }).rows, 48, note, 1),
  '',
];
// The joints line is written from what the press measured, so it cannot drift from the banner.
const pairsOf = (kind) => joints.filter((j) => j.kind === kind).map((j) => j.pair);
const listOf = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a[0]);
const jointLines = [`${joints.length}. ${nJoint('wall')} share a wall: count the + under the banner.`];
if (nJoint('tuck')) {
  const p = pairsOf('tuck');
  jointLines.push(`${p.length} tuck${p.length > 1 ? '' : 's'} a corner into a clipped one (${p.map((x) => x.replace(' and ', '')).join(', ')}).`);
}
if (nJoint('touch')) {
  const p = pairsOf('touch');
  jointLines.push(`${listOf(p)} would not share. there is always one.`);
}
const qc = [
  ...heading('QC REPORT'),
  `job 0001 :: ${B('ULTRA-SATISFACTORY')} :: inspected by a for-loop, signed by nobody`,
  '-'.repeat(W),
  '',
  `${B('1. SPACING.')} the page is ${W} columns and SATISFACTORY is twelve letters. there`,
  'are three ways to stamp a word and only one of them fits. shown here on SCREW,',
  'because there is a storage box of those in your base right now and it is full.',
  '',
  ...indent([
    ...spacing('full', 'full width', [
      'every letter gets its own box',
      'and keeps it. fair, even and',
      'wasteful. a load balancer.',
    ], satisFull.width),
    ...spacing('kern', 'kerned', [
      'letters slide left until',
      'something touches. tidier.',
      'still two walls at each joint',
      'where one would do.',
    ], satisKern.width),
    ...spacing('smush', 'smushed', [
      'neighbours share one wall.',
      'closer than HR guidelines',
      'allow. this is a manifold,',
      'and it shipped.',
    ], satis.width),
  ], 2),
  B('2. INSPECTION.'),
  '',
  ...indent([
    ...kv('letters stamped', `${LETTERS} and a hyphen, off 2 dies: ${B('CRATE')} on top, ${B('GUSSET')} below`, 20),
    ...kv('repeats', [
      `in SATISFACTORY: ${repeats.map(([c, n]) => `${c} x${n}`).join(', ')}. identical between the`,
      'walls. we diffed them. a human would have made them',
      'charming. we made them on time.',
    ], 20),
    ...kv('joints', jointLines, 20),
    ...kv('line width', [
      `${W} col allowed, ${blockW} used, both lines. waste: ${W - blockW} col.`,
      `column ${W + 1} is where the spaghetti starts.`,
    ], 20),
    ...kv('the press', [
      'one input, one output, no opinions. in factory',
      'terms: a Constructor.',
    ], 20),
    ...kv('incidents', [
      'a fuse went halfway through an S. we restamped it.',
      'you cannot tell which S. that is the point.',
    ], 20),
    ...kv('artists harmed', '0. artists involved: also 0.', 20),
    ...kv('verdict', `${B('PASS.')} ship it. the Space Elevator does not read fonts.`, 20),
  ], 2),
];
if (ultra.width !== satis.width) throw new Error(`the two lines of the name differ: ${ultra.width} vs ${satis.width} col (the QC report says they match)`);

// ---------------------------------------------------------------- die catalogue
const rivet = (n) => set(n, CRATE, { ink: '##' }).rows;
const plate = (n, label) => [...rivet(n), '', ...label];
const plates = (l, r) => beside(l, 44, r);
// Every face in the catalogue goes through dieHead, so the count in the copy is a count.
let FACES = 0;
const dieHead = (name, spec) => { FACES += 1; return `${B(name)} :: ${spec}`; };
const DRAWN = Object.values(DIES).filter((d) => d.glyphs).length;   // dies with drawn glyphs
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const diesBody = [
  '-'.repeat(W),
  '',
  dieHead('CRATE', '7 rows :: ink []'),
  '',
  ...indent(set('BOXES', CRATE).rows, 2),
  '',
  '  every pixel is a storage box, two brackets wide. nobody looked inside.',
  '  it is screws. it is always screws.',
  '',
  dieHead('RIVET', 'the CRATE die inked with ## :: for counting what the app holds'),
  '',
  ...indent([
    ...plates(plate('140', ['craftable items, one search box']), plate('211', ['machine recipes, 88 of them', 'alternates'])),
    '',
    ...plates(plate('477', ['buildings: 9 production machines and', '333 structure pieces to hide them in']), plate('5', ['Space Elevator phases.', 'one lift.'])),
  ], 2),
  '',
  dieHead('SKID', 'the CRATE die sheared a column a row :: ink //'),
  '',
  ...indent(set('BELTS', CRATE, { ink: '//', shear: true }).rows, 2),
  '',
  '  this one came off the line leaning. the belt was running the wrong way, so',
  '  we called it italic and overclocked it.',
  '',
  dieHead('GUSSET', '6 rows :: outline :: smushes :: the I is an I-beam'),
  '',
  ...indent(heading('SPAGHETTI'), 2),
  '',
  '  the round letters get their corners clipped off, like a gusset plate. unlike',
  '  the pipe through your wall, this clipping is on purpose and we admit to it.',
  '  set in GUSSET, even that word looks planned. the tidy-factory people asked',
  '  for it. the spaghetti people were not consulted and like it anyway.',
  '',
  dieHead('SHIM', `3 rows :: for small headings :: ${B('FAILED INSPECTION')}`),
  '',
  ...beside(indent(set('TEMPORARY', SHIM).rows, 2), 50, ['', '<- it says TEMPORARY.', '   we are fairly sure.']),
  '',
  '  it was only meant to hold a heading up for an afternoon. in a terminal it',
  '  reads fine. at this line spacing it reads like a dropped box of screws, so',
  '  QC pulled it from the page. it is still in the build. nobody dares take',
  '  it out.',
  '',
  dieHead('KEYCAP', '3 rows :: one box a letter, side walls shared'),
  '',
  ...beside(indent(set('ALT TAB', KEYCAP).rows, 2), 36, [
    'the full control scheme. the app',
    'lives on the other side of it.',
  ], 1),
];
const dies = [
  ...heading('THE DIES'),
  `${MAKER} :: ${WORDS[FACES]} faces off ${WORDS[DRAWN]} drawings. no hands were involved.`,
  ...diesBody,
];

// ---------------------------------------------------------------- credits and signature
// The app's emblem is a hexagon with a cog in it. This is the pressworks' own drawing of one,
// with its inspection stamp in the space under the cog.
const MARK = String.raw`
    ________
   /   __   \
  /  _|  |_  \
 /  |_ () _|  \
 \    |__|    /
  \  PASSED  /
   \________/
`.split('\n').slice(1, -1);
const credits = [
  ...heading('CREDITS'),
  'the true kind. no jokes in this box until the signature.',
  '-'.repeat(W),
  '',
  ...indent([
    ...kv('game data', [`${A('greeny/SatisfactoryTools', 'https://github.com/greeny/SatisfactoryTools')}. the app's recipes come from it.`], 14),
    ...kv('images', [`${A('the Satisfactory Wiki', 'https://satisfactory.wiki.gg')}, under ${A('CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/')}.`], 14),
    ...kv('the game', [
      'Coffee Stain Studios made Satisfactory. this is an unofficial',
      'fan project and is not affiliated with them. it looks things',
      'up. the game is theirs, and you get it from them.',
    ], 14),
    ...kv('the app', [
      `one Streamlit file, ${A('app/app.py')}, with streamlit-aggrid for the`,
      `grids. also deploys to Modal (${A('modal_app.py')}): ${A('#how-its-built')}.`,
    ], 14),
    ...kv('the licence', [
      `${A('Apache 2.0', 'LICENSE')} for the code. the data and the images keep`,
      `their own: ${A('#data--credits')}.`,
    ], 14),
    ...kv('the style', [
      'banners set from a font file, after FIGlet (Glenn Chappell and',
      'Ian Chai, 1991) and TOIlet (Sam Hocevar, 2006). the dies here',
      'were drawn for this job, not taken from their font files. in',
      'a grid this small an H only comes out one way, so expect a',
      'family resemblance to fonts that got there first.',
    ], 14),
  ], 2),
  '',
  '--',
  ...beside(MARK, 20, [
    B(MAKER),
    '"measure once, stamp forever"',
    '',
    'netiquette says a signature is four lines.',
    'this one is seven and has a cog in it.',
    'standards slip after phase 3.',
  ], 1),
];

// ================================================================ write + verify
const SAFE = /^[\x20-\x7e]*$/;
const problems = [];
function verify(name, lines) {
  lines.forEach((l, i) => {
    const v = visible(l).replace(/\s+$/, '');
    if (v.length > W) problems.push(`${name} line ${i + 1} is ${v.length} cols: ${v}`);
    if (!SAFE.test(v)) problems.push(`${name} line ${i + 1} has a character outside printable ASCII: ${v}`);
  });
}
const pre = (lines) => ['<pre>', ...lines.map((l) => toHtml(l).replace(/\s+$/, '')), '</pre>'].join('\n');
const blocks = { main, qc, dies, credits };
for (const [name, lines] of Object.entries(blocks)) verify(name, lines);
if (problems.length) throw new Error(['refusing to write:', ...problems].join('\n'));

// Prose outside the art follows the target repo's house style: each line opens with the bolt.
const BOLT = String.fromCodePoint(0x26a1);
const details = (summary, lines) => ['<details>', `<summary>${BOLT} ${summary}</summary>`, '', pre(lines), '', '</details>', ''];
const md = [
  '<!-- Header 32-generated-banner_opus_5.5 for ULTRA-SATISFACTORY. Generated by src/32-generated-banner_opus_5.5.mjs: edit that, not this. -->',
  '',
  pre(main),
  '',
  `${BOLT} **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Keep it on the second monitor, a phone or an alt-tab away, and look things up while the factory keeps running. [Open it live in your browser](${LIVE}) with nothing to install, or [run it locally](#run-it-locally) with two commands. Unofficial fan project, not affiliated with Coffee Stain Studios.`,
  '',
  `${BOLT} The banner was stamped from a font by a for-loop, not drawn by an artist. That is why the two S's in SATISFACTORY are the same S.`,
  '',
  ...details('<b>QC REPORT</b> &nbsp;why twelve letters only fit in 80 columns if they share walls', qc),
  ...details(`<b>THE DIES</b> &nbsp;${WORDS[FACES]} faces off ${WORDS[DRAWN]} drawings: boxes, rivets, a leaning belt, and one that failed inspection`, dies),
  ...details('<b>CREDITS</b> &nbsp;the real ones, and a signature that is too long', credits),
].join('\n');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ` + Object.entries(blocks).map(([n, l]) => `${n} ${l.length} lines`).join(', '));
