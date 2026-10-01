// C64 disk directory art ("dir art") header for the Castaway README (style c64-04).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/10-dir-art_opus_5.5.mjs
// It rewrites examples/castaway/10-dir-art_opus_5.5.md. Edit this file, not that.
//
// The style: on a Commodore 64 you look at a floppy with LOAD"$",8 and LIST. Every file
// is one line: a block count, a quoted 16-character name and a file type. The listing is
// unsorted and nobody checks the names, so people drew pictures with them, one row of
// PETSCII graphics per (empty, 0-block, DEL) file. The listing format is a machine
// convention; the picture, the lettering and every word here are new.
//
// Nothing in the listing is decoration:
//   * every character inside the quotes exists in the C64's own uppercase/graphics set,
//     and the build refuses to run if one does not (see PETSCII below);
//   * every row is laid out exactly as the 1541 drive pads it: the block count, a space,
//     padding so the quotes line up, the name padded to 16, then the file type;
//   * the block counts on the real entries are real numbers from the project, and
//     BLOCKS FREE is 664 minus all of them, as a real 1541 would print it;
//   * each disk would fit: no more than 144 entries, no more than 664 blocks.
// The numbers were read from D:/python/castaway on 2026-10-01 (activities.toml, the
// audio folder, and `python tools/schedule.py` for the seed-1992 run on side B).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '10-dir-art_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}-blue-screen.svg`);
const SVG_REF = `assets/${SLUG}-blue-screen.svg`;
// The alt text is built from the same entries as the listing, so its numbers cannot drift.
const svgAlt = (entries, free) => {
  const real = entries.filter((e) => !e.name.startsWith('EVERY')).map((e) => `${e.blocks} ${e.name}`);
  return 'Side A of the Castaway disk listed on a Commodore 64 screen, light blue characters on dark blue inside a light blue border. '
    + 'LOAD"$",8, SEARCHING FOR $, LOADING, READY. and LIST, then the disk name CASTAWAY with the ID LO-FI in reverse video, '
    + 'and a picture drawn in file names: CAST AWAY in line letters between two block rules, a cloud, a gull and the sun, '
    + 'a palm with drooping fronds and one coconut, a ship on the horizon, her sitting on the sand with headphones and a coconut, the raft and the waves. '
    + `Then the real entries (${real.slice(0, 1).join('')}, the four EVERY timers, ${real.slice(1).join(', ')}), `
    + `the signature ART BY BOLLARD, ${free} BLOCKS FREE. and READY. with a blinking cursor.`;
};

// ------------------------------------------------------------------ PETSCII
// The characters a 1541 directory name can show, as Unicode, with their codes in the
// C64's uppercase/graphics set. A name cannot contain a quote (it ends the name), and
// the C64 has no lower case here, no underscore (its code prints a left arrow), no
// backslash, braces or tilde, and its solid blocks are reverse-video characters, which
// this listing does without.
// Every graphic used here is also a single-width glyph in GitHub's monospace fonts.
const PETSCII = new Map();
const addRun = (chars, first) => [...chars].forEach((c, i) => PETSCII.set(c, first + i));
addRun(' !', 0x20);
addRun("#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[£]↑←", 0x23);
for (const [ch, code] of Object.entries({
  '─': 0xc0, '♠': 0xc1, '│': 0xdd, '╮': 0xc9, '╰': 0xca, '╯': 0xcb, '╲': 0xcd, '╱': 0xce,
  '●': 0xd1, '♥': 0xd3, '╭': 0xd5, '╳': 0xd6, '○': 0xd7, '♣': 0xd8, '♦': 0xda, '┼': 0xdb,
  'π': 0xde, '▌': 0xa1, '▄': 0xa2, '▒': 0xa6, '├': 0xab, '└': 0xad, '┐': 0xae, '┌': 0xb0,
  '┴': 0xb1, '┬': 0xb2, '┤': 0xb3, '┘': 0xbd,
})) PETSCII.set(ch, code);

// ------------------------------------------------------------------ inline markup
// Lines are built as plain strings; bold, italics and links are zero-width markers so
// widths can be measured exactly. HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const I = (s) => `\u0006${s}\u0007`;
const A = (s, href) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004\u0006\u0007]/g, '');
const len = (s) => [...visible(s)].length;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0006/g, '<i>').replace(/\u0007/g, '</i>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (_, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');

// ------------------------------------------------------------------ the 1541's layout
const DISK_BLOCKS = 664; // a freshly formatted 1541 disk
const MAX_ENTRIES = 144; // 18 directory sectors of 8 entries
const NOTE_COL = 31; // where the pencilled margin notes start
const PAGE_W = 80;

function checkName(name, where) {
  const n = [...name].length;
  if (n > 16) throw new Error(`${where}: "${name}" is ${n} characters; a 1541 name holds 16`);
  for (const ch of name) {
    if (!PETSCII.has(ch)) throw new Error(`${where}: "${ch}" in "${name}" is not a PETSCII character`);
  }
}

// One directory line, padded the way the drive pads it: the count, LIST's space, then
// 3/2/1/0 spaces so that every opening quote lands in column 5, the name, spaces to fill
// the 16, a space where a "*" would mark an unclosed file, and the type.
function dirLine(blocks, name, type, href) {
  checkName(name, 'entry');
  const num = String(blocks);
  const pad = blocks < 10 ? 3 : blocks < 100 ? 2 : blocks < 1000 ? 1 : 0;
  const quoted = `"${href ? A(name, href) : name}"`;
  return `${num} ${' '.repeat(pad)}${quoted}${' '.repeat(18 - len(quoted))} ${type}`;
}

const headerLine = (name, id) => {
  checkName(name, 'disk name');
  checkName(id, 'disk id');
  if ([...id].length !== 5) throw new Error(`disk id "${id}" must fill its 5 characters`);
  return B(`0 "${name.padEnd(16)}" ${id}`);
};

const withNote = (line, note) => {
  if (!note) return line;
  const gap = Math.max(2, NOTE_COL - len(line));
  return `${line}${' '.repeat(gap)}${I(`← ${note}`)}`;
};

// A whole LIST: header, picture rows (0-block DEL files), real entries, the artist's
// signature in the last name row, BLOCKS FREE. Returns the README lines (with notes and
// links) and the bare screen lines (what the C64 itself would show) for the SVG twin.
function listing({ name, id, idNote, art, entries, sig, footerNote, cursorNote }) {
  const lines = ['LOAD"$",8', '', 'SEARCHING FOR $', 'LOADING', 'READY.', 'LIST', ''];
  const headerAt = lines.length;
  lines.push(withNote(headerLine(name, id), idNote));
  const files = []; // what goes in the directory, for the disk image
  let used = 0;
  for (const [row, note] of art) {
    if ([...row].length !== 16) throw new Error(`art row is not 16 wide: "${row}"`);
    lines.push(withNote(dirLine(0, row, 'DEL'), note));
    files.push({ blocks: 0, name: row, type: 'DEL' });
  }
  for (const e of entries) {
    lines.push(withNote(dirLine(e.blocks, e.name, e.type || 'PRG', e.href), e.note));
    files.push({ blocks: e.blocks, name: e.name, type: e.type || 'PRG' });
    used += e.blocks;
  }
  lines.push(withNote(dirLine(0, sig[0], 'DEL'), sig[1]));
  files.push({ blocks: 0, name: sig[0], type: 'DEL' });
  const count = files.length;
  if (count > MAX_ENTRIES) throw new Error(`${count} entries: a 1541 directory holds ${MAX_ENTRIES}`);
  if (used > DISK_BLOCKS) throw new Error(`${used} blocks: a 1541 disk holds ${DISK_BLOCKS}`);
  lines.push(withNote(`${DISK_BLOCKS - used} BLOCKS FREE.`, footerNote(DISK_BLOCKS - used)));
  lines.push('READY.');
  for (const l of lines) {
    if (len(l) > PAGE_W) throw new Error(`line is ${len(l)} wide: ${visible(l)}`);
    if (/\s$/.test(visible(l))) throw new Error(`trailing space: ${visible(l)}`);
  }
  // The screen: the same lines without the pencil notes, at most 40 columns.
  const screen = lines.map((l) => visible(l).split('  ← ')[0].replace(/\s+$/, ''));
  for (const s of screen) if ([...s].length > 40) throw new Error(`too wide for a C64 screen: ${s}`);
  lines.push(withNote('█', cursorNote)); // the cursor (the SVG twin draws its own, blinking)
  return { lines, screen, headerAt, used, count, disk: { name, id, files } };
}

// ------------------------------------------------------------------ side A
// The island, sixteen columns wide: title, cloud, gull and sun, the palm with one
// coconut, a ship on the horizon, her on the sand with a coconut, the raft, the sea.
const SIDE_A_ART = [
  ['▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄', 'every row of this picture is a file name'],
  [' ╭── ╭─╮ ╭── ─┬─'],
  [' │   ├─┤ ╰─╮  │ '],
  [' ╰── │ │ ──╯  │ '],
  [' ╭─╮ │ │ ╭─╮ │ │'],
  [' ├─┤ │││ ├─┤ ╰┬╯'],
  [' │ │ ╰┴╯ │ │  │ '],
  ['▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'],
  [' ╭─╮╭╮      ╲│╱ '],
  ['╭╯ ╰╯╰─╮    ─●─ ', 'the sun. always daytime: house rule'],
  ['╰──────╯ ╲╱ ╱│╲ ', 'a gull. it will take pity on her later'],
  ['   ╭───╮╭───╮   ', 'one bar of signal. up here only'],
  [' ╭─╯ ╭─╲╱─╮ ╰─╮ '],
  ['╭╯  ╱  ╱│╲ ╲  ╰╮'],
  ['│  ╱  ╱ │●╲ ╲  │', 'a coconut. hermit crabs: look up'],
  ['   ▄▌▄  ├       ', 'a ship! she will not see it'],
  ['─╲▄▄▄▄╱─┼───────', '(eyes shut, coconut, headphones on)'],
  ['  ─     ┤  ╭●╮  ', 'her. for most of the video, she nods along'],
  ['     ─  │  ╱▌○  '],
  ['  ▄▄▄▄▄▄┴▄▄╰┴╯▄ '],
  [' ╱▒▒▒▒▒▒▒▒▒▒▒▒▒╲'],
  ['╭╮  ╭╮  ╭╮  ▄▄▄▄', 'the raft. she could leave any time'],
  ['  ╰╯  ╰╯  ╰╯  ╰╯', 'shore waves, foam and all: built'],
];

// Real entries, counted on 2026-10-01 (the project is moving fast; refresh these four
// constants and side B's counts together):
//   * activities.toml holds 92 entries under [activities]: 81 in the four timed tiers
//     (regular 9, occasional 35, rare 31, super rare 6) and 11 chained follow-ups;
//   * ~155/30/13/2 events per tier in a typical 10-hour run (median of 200 simulated
//     runs, as the toml's own header says);
//   * 151 .wav files under media/audio, all written by tools/make_audio.py (MUSING.md's
//     latest entry says 151 too);
//   * 26 scene-life entries ([life] in the toml), 2 of them built.
const ACTIVITIES = 92;
const TIMED = 81;
const SOUNDS = 151;
const LIFE = 26;
const LIFE_BUILT = 2;
const SIDE_A_ENTRIES = [
  { blocks: ACTIVITIES, name: 'ACTIVITIES.TOML', type: 'SEQ', href: 'activities.toml', note: `${ACTIVITIES} things to do: ${TIMED} on four timers` },
  { blocks: 155, name: 'EVERY 2-5 MIN', href: 'tools/schedule.py', note: '~155 a run: coconut, fishing, laps' },
  { blocks: 30, name: 'EVERY 12-25 MIN', href: 'tools/schedule.py', note: '~30: the turtle, a bottle, that ship' },
  { blocks: 13, name: 'EVERY 30-60 MIN', href: 'tools/schedule.py', note: '~13: a drone, a cat on a crate, a shark' },
  { blocks: 2, name: 'EVERY 3-6 HOURS', href: 'tools/schedule.py', note: '~2: she walks off over the water' },
  { blocks: SOUNDS, name: 'MAKE←AUDIO.PY', href: 'tools/make_audio.py', note: `${SOUNDS} sounds, every one made from code` },
  { blocks: LIFE, name: 'SCENE LIFE', type: 'SEQ', href: 'activities.toml', note: `whales, birds, planes: ${LIFE_BUILT} built, ${LIFE - LIFE_BUILT} to go` },
  { blocks: 0, name: 'SERVE.PY', href: 'tools/serve.py', note: 'start here. port 8765. 0 blocks of npm' },
];

// ------------------------------------------------------------------ side B
// The stray cat (grey tabby, white chest) on the crate it arrives and leaves by.
const SIDE_B_ART = [
  ['   ╱╲     ╱╲    ', 'the cat. grey tabby, white chest'],
  ['  ╱  ╲───╱  ╲   '],
  ['  │ ●     ● │   '],
  ['  │  ╲ ♦ ╱  │╭╮ '],
  ['  ╰─┬──┴──┬─╯││ '],
  ['  ╭─┴─────┴──╯│ '],
  [' ┌┴───────────┴┐', 'arrives by crate. leaves by crate'],
  [' │╳╳╳╳╳╳╳╳╳╳╳╳╳│'],
  ['─┴─────────────┴'],
  ['╭╮  ╭╮  ╭╮  ╭╮  '],
  ['  ╰╯  ╰╯  ╰╯  ╰╯'],
];

// How often some of the routines came round in the default run (seed 1992, 10 hours,
// every activity counted whether its art exists or not), as printed by
// `python -B tools/schedule.py` on 2026-10-01. In that run: busy 28%, idle 72%; the cat
// visits 5 times and is on the island 1:49:40 in total; 9 ships pass unseen and the
// tenth (rescue_almost) is seen, honks and sails on.
const IDLE_PCT = 72;
const SIDE_B_ENTRIES = [
  { blocks: 34, name: 'STROLL', note: 'a slow lap to the waterline. it is close' },
  { blocks: 29, name: 'COCONUT SIP', note: 'eyes closed, completely content' },
  { blocks: 19, name: 'FISHING', note: 'nibbles, nothing. the usual' },
  { blocks: 19, name: 'JOG LAP', note: 'the length of the island, and back' },
  { blocks: 10, name: 'SANDCASTLE' },
  { blocks: 10, name: 'TIDE TAKES IT', note: '10 castles. 10 tides. undefeated' },
  { blocks: 9, name: 'SHIP UNSEEN', note: '9 ships. 0 seen' },
  { blocks: 5, name: 'CAT VISIT', note: 'on the island for 1:49:40, all told' },
  { blocks: 2, name: 'HAMMOCK', note: 'one palm. other end: the raft' },
  { blocks: 1, name: 'SIGNAL HUNT', note: 'one bar. top of the palm' },
  { blocks: 1, name: 'BOTTLE', note: 'thrown. straight back' },
  { blocks: 1, name: 'BOTTLE REPLY', note: 'somebody wrote back' },
  { blocks: 1, name: 'COCONUT ON CRAB', note: 'a direct hit. the crab kept it' },
  { blocks: 1, name: 'WAVE FOR RESCUE', note: 'ship 10. seen! it honked. it left' },
  { blocks: 0, name: 'DELIVERY DRONE', note: 'not this run. try another seed' },
  { blocks: 0, name: 'TURTLE VISIT' },
  { blocks: 0, name: 'SHARK NOD' },
  { blocks: 0, name: 'TOUR BOAT' },
  { blocks: 0, name: 'HYDROFOIL BRO', note: 'no shaka today' },
  { blocks: 0, name: 'LEAVE ANY TIME', note: 'she could. she did not' },
];

// ------------------------------------------------------------------ the blue-screen twin
// An optional SVG of side A as the C64 itself shows it: 8x8 characters, light blue on
// blue inside a light blue border, the header in reverse video, and the cursor blinking
// after READY. The screen is drawn as tall as the listing, as if you had held it still.
// Letters, digits and punctuation reuse the C64-style 8x8 font from this repo's
// ultra-satisfactory C64 loader header; the PETSCII graphics are drawn here.
// One glyph per line: the character, then eight rows of eight pixels.
const FONT_SRC = `
A ...##... ..####.. .##..##. .######. .##..##. .##..##. .##..##. ........
B .#####.. .##..##. .##..##. .#####.. .##..##. .##..##. .#####.. ........
C ..####.. .##..##. .##..... .##..... .##..... .##..##. ..####.. ........
D .####... .##.##.. .##..##. .##..##. .##..##. .##.##.. .####... ........
E .######. .##..... .##..... .####... .##..... .##..... .######. ........
F .######. .##..... .##..... .####... .##..... .##..... .##..... ........
G ..####.. .##..##. .##..... .##.###. .##..##. .##..##. ..####.. ........
H .##..##. .##..##. .##..##. .######. .##..##. .##..##. .##..##. ........
I ..####.. ...##... ...##... ...##... ...##... ...##... ..####.. ........
J ...####. ....##.. ....##.. ....##.. ....##.. .##.##.. ..###... ........
K .##..##. .##.##.. .####... .###.... .####... .##.##.. .##..##. ........
L .##..... .##..... .##..... .##..... .##..... .##..... .######. ........
M .##...## .###.### .####### .##.#.## .##...## .##...## .##...## ........
N .##..##. .###.##. .######. .######. .##.###. .##..##. .##..##. ........
O ..####.. .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ........
P .#####.. .##..##. .##..##. .#####.. .##..... .##..... .##..... ........
Q ..####.. .##..##. .##..##. .##..##. .##..##. ..####.. ....###. ........
R .#####.. .##..##. .##..##. .#####.. .####... .##.##.. .##..##. ........
S ..####.. .##..##. .##..... ..####.. .....##. .##..##. ..####.. ........
T .######. ...##... ...##... ...##... ...##... ...##... ...##... ........
U .##..##. .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ........
V .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ...##... ........
W .##...## .##...## .##...## .##.#.## .####### .###.### .##...## ........
X .##..##. .##..##. ..####.. ...##... ..####.. .##..##. .##..##. ........
Y .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ........
Z .######. .....##. ....##.. ...##... ..##.... .##..... .######. ........
0 ..####.. .##..##. .##.###. .###.##. .##..##. .##..##. ..####.. ........
1 ...##... ..###... ...##... ...##... ...##... ...##... .######. ........
2 ..####.. .##..##. .....##. ....##.. ..##.... .##..... .######. ........
3 ..####.. .##..##. .....##. ...###.. .....##. .##..##. ..####.. ........
4 .....##. ....###. ...####. .##..##. .####### .....##. .....##. ........
5 .######. .##..... .#####.. .....##. .....##. .##..##. ..####.. ........
6 ..####.. .##..##. .##..... .#####.. .##..##. .##..##. ..####.. ........
7 .######. .##..##. ....##.. ...##... ...##... ...##... ...##... ........
8 ..####.. .##..##. .##..##. ..####.. .##..##. .##..##. ..####.. ........
9 ..####.. .##..##. .##..##. ..#####. .....##. .##..##. ..####.. ........
. ........ ........ ........ ........ ........ ...##... ...##... ........
, ........ ........ ........ ........ ........ ...##... ...##... ..##....
" .##..##. .##..##. .##..##. ........ ........ ........ ........ ........
: ........ ........ ...##... ........ ........ ...##... ........ ........
- ........ ........ ........ .######. ........ ........ ........ ........
$ ...##... ..#####. .##..... ..####.. .....##. .#####.. ...##... ........
← ........ ..#..... .##..... ######## ######## .##..... ..#..... ........
─ ........ ........ ........ ######## ######## ........ ........ ........
│ ...##... ...##... ...##... ...##... ...##... ...##... ...##... ...##...
┼ ...##... ...##... ...##... ######## ######## ...##... ...##... ...##...
├ ...##... ...##... ...##... ...##### ...##### ...##... ...##... ...##...
┤ ...##... ...##... ...##... #####... #####... ...##... ...##... ...##...
┬ ........ ........ ........ ######## ######## ...##... ...##... ...##...
┴ ...##... ...##... ...##... ######## ######## ........ ........ ........
╭ ........ ........ ........ .....### ....#### ...###.. ...##... ...##...
╮ ........ ........ ........ ###..... ####.... ..###... ...##... ...##...
╰ ...##... ...##... ...###.. ....#### .....### ........ ........ ........
╯ ...##... ...##... ..###... ####.... ###..... ........ ........ ........
╱ ......## .....##. ....##.. ...##... ..##.... .##..... ##...... #.......
╲ ##...... .##..... ..##.... ...##... ....##.. .....##. ......## .......#
● ........ ..####.. .######. .######. .######. .######. ..####.. ........
○ ........ ..####.. .##..##. .#....#. .#....#. .##..##. ..####.. ........
▄ ........ ........ ........ ........ ######## ######## ######## ########
▌ ####.... ####.... ####.... ####.... ####.... ####.... ####.... ####....
▒ #.#.#.#. .#.#.#.# #.#.#.#. .#.#.#.# #.#.#.#. .#.#.#.# #.#.#.#. .#.#.#.#
`;
const FONT = new Map();
for (const line of FONT_SRC.split('\n').filter((l) => l.trim())) {
  const [ch, ...rows] = line.split(' ');
  if (rows.length !== 8 || rows.some((r) => !/^[.#]{8}$/.test(r))) throw new Error(`bad glyph: ${line}`);
  FONT.set(ch, rows);
}

// Pixels -> rectangles: horizontal runs, merged downwards when a run repeats exactly.
function glyphPath(rows) {
  const rects = [];
  let open = new Map();
  for (let y = 0; y <= 8; y++) {
    const runs = new Map();
    if (y < 8) {
      const r = rows[y];
      for (let x = 0; x < 8;) {
        if (r[x] !== '#') { x++; continue; }
        let e = x;
        while (e < 8 && r[e] === '#') e++;
        runs.set(`${x},${e}`, { x, w: e - x });
        x = e;
      }
    }
    const next = new Map();
    for (const [k, run] of runs) {
      const prev = open.get(k);
      if (prev) { prev.h++; next.set(k, prev); open.delete(k); } else next.set(k, { ...run, y, h: 1 });
    }
    for (const rect of open.values()) rects.push(rect);
    open = next;
  }
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

function blueScreenSvg(screen, headerAt, alt) {
  const COLS = 40;
  // one more row for the cursor, and two empty rows under it so the cursor reads as a
  // cursor and not as a bite out of the screen's corner
  const rows = screen.length + 3;
  const BX = 32;
  const BY = 28;
  const W = COLS * 8 + 2 * BX;
  const H = rows * 8 + 2 * BY;
  const used = new Set();
  const uses = [];
  const rev = [];
  screen.forEach((line, r) => {
    const chars = [...line];
    // the header is printed in reverse video from its opening quote to the end
    const revFrom = r === headerAt ? chars.indexOf('"') : Infinity;
    if (revFrom !== Infinity) rev.push(`<rect x="${revFrom * 8}" y="${r * 8}" width="${(chars.length - revFrom) * 8}" height="8"/>`);
    chars.forEach((ch, c) => {
      if (ch === ' ') return;
      if (!FONT.has(ch)) throw new Error(`no 8x8 glyph for "${ch}"`);
      used.add(ch);
      const id = `g${ch.codePointAt(0).toString(16)}`;
      uses.push(`<use href="#${id}" x="${c * 8}" y="${r * 8}"${c >= revFrom ? ' class="rv"' : ''}/>`);
    });
  });
  const defs = [...used].sort().map((ch) => `<path id="g${ch.codePointAt(0).toString(16)}" d="${glyphPath(FONT.get(ch))}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges">
<title>Castaway, side A, listed on a Commodore 64 screen</title>
<desc>${esc(alt)}</desc>
<style>
.fg{fill:#6c5eb5}.rv{fill:#352879}
.cur{fill:#6c5eb5;animation:blink .666s steps(1,end) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.cur{animation:none}}
</style>
<defs>${defs.join('')}</defs>
<rect width="${W}" height="${H}" rx="12" fill="#6c5eb5"/>
<rect x="${BX}" y="${BY}" width="${COLS * 8}" height="${rows * 8}" fill="#352879"/>
<g transform="translate(${BX} ${BY})">
<g class="fg">${rev.join('')}</g>
<g class="fg">${uses.join('')}</g>
<rect class="cur" x="0" y="${screen.length * 8}" width="8" height="8"/>
</g>
</svg>
`;
}

// ------------------------------------------------------------------ a real disk image
// Each side is also built as a 1541 disk image (.d64: 35 tracks, 683 sectors of 256
// bytes), then listed back the way the drive turns a directory into a LIST, and the
// result must match the README character for character. The image only reaches disk
// when asked:  node examples/castaway/src/10-dir-art_opus_5.5.mjs --d64 <folder>
// The picture rows are 0-block DEL entries, as dir artists make them. The real entries
// carry their block counts and the BAM marks that many sectors as used, so BLOCKS FREE
// comes out right; there is no file data behind them, so they LIST but do not LOAD.
const SECTORS = (t) => (t <= 17 ? 21 : t <= 24 ? 19 : t <= 30 ? 18 : 17);
const sectorAt = (t, s) => {
  let n = s;
  for (let i = 1; i < t; i++) n += SECTORS(i);
  return n * 256;
};
const DIR_ORDER = [1, 4, 7, 10, 13, 16, 2, 5, 8, 11, 14, 17, 3, 6, 9, 12, 15, 18];
const TYPE_CODE = { DEL: 0x80, SEQ: 0x81, PRG: 0x82 };
const UNICODE = new Map([...PETSCII].map(([ch, code]) => [code, ch]));
const petscii = (str, size) => {
  const bytes = [...str].map((ch) => PETSCII.get(ch));
  while (bytes.length < size) bytes.push(0xa0); // shifted space ends a name
  return bytes;
};

function buildD64({ name, id, files }) {
  const img = new Uint8Array(sectorAt(36, 0));
  const free = [];
  for (let t = 1; t <= 35; t++) free[t] = new Set([...Array(SECTORS(t)).keys()]);
  const dirSectors = Math.ceil(files.length / 8);
  free[18].delete(0);
  DIR_ORDER.slice(0, dirSectors).forEach((s) => free[18].delete(s));
  let toUse = files.reduce((n, f) => n + f.blocks, 0);
  for (let t = 1; t <= 35 && toUse; t++) {
    if (t === 18) continue;
    for (const s of [...free[t]]) {
      if (!toUse) break;
      free[t].delete(s);
      toUse--;
    }
  }
  if (toUse) throw new Error('disk full');
  const bam = sectorAt(18, 0);
  img.set([18, 1, 0x41, 0], bam);
  for (let t = 1; t <= 35; t++) {
    let bits = 0;
    for (const s of free[t]) bits |= 1 << s;
    img.set([free[t].size, bits & 255, (bits >> 8) & 255, (bits >> 16) & 255], bam + 4 * t);
  }
  img.set(petscii(name, 16), bam + 0x90);
  img.set([0xa0, 0xa0, ...petscii(id, 5), 0xa0, 0xa0, 0xa0, 0xa0], bam + 0xa0);
  files.forEach((f, i) => {
    const sec = DIR_ORDER[Math.floor(i / 8)];
    const base = sectorAt(18, sec) + (i % 8) * 32;
    if (i % 8 === 0) {
      const next = DIR_ORDER[Math.floor(i / 8) + 1];
      img.set(Math.floor(i / 8) + 1 < dirSectors ? [18, next] : [0, 0xff], base);
    }
    img[base + 2] = TYPE_CODE[f.type];
    img.set(petscii(f.name, 16), base + 5);
    img.set([f.blocks & 255, f.blocks >> 8], base + 30);
  });
  return img;
}

// The drive's side of LOAD"$",8: the header from the BAM, one line per directory entry
// in the order the sectors chain, and the free count summed over every track but 18.
function listD64(img) {
  const text = (at, n) => [...img.slice(at, at + n)].map((b) => (b === 0xa0 ? ' ' : UNICODE.get(b))).join('');
  const bam = sectorAt(18, 0);
  const lines = [`0 "${text(bam + 0x90, 16)}" ${text(bam + 0xa2, 5)}`];
  const types = Object.fromEntries(Object.entries(TYPE_CODE).map(([k, v]) => [v, k]));
  for (let [t, s] = [img[bam], img[bam + 1]]; t;) {
    const at = sectorAt(t, s);
    for (let e = 0; e < 8; e++) {
      const base = at + e * 32;
      if (!img[base + 2]) continue;
      let nameBytes = [...img.slice(base + 5, base + 21)];
      const end = nameBytes.indexOf(0xa0);
      if (end >= 0) nameBytes = nameBytes.slice(0, end);
      const blocks = img[base + 30] + 256 * img[base + 31];
      const pad = blocks < 10 ? 3 : blocks < 100 ? 2 : blocks < 1000 ? 1 : 0;
      const quoted = `"${nameBytes.map((b) => UNICODE.get(b)).join('')}"`;
      lines.push(`${blocks} ${' '.repeat(pad)}${quoted.padEnd(18)} ${types[img[base + 2]]}`);
    }
    [t, s] = [img[at], img[at + 1]];
  }
  let freeBlocks = 0;
  for (let t = 1; t <= 35; t++) if (t !== 18) freeBlocks += img[bam + 4 * t];
  lines.push(`${freeBlocks} BLOCKS FREE.`);
  return lines;
}

function checkDisk(side, label) {
  const img = buildD64(side.disk);
  const listed = listD64(img);
  const printed = side.screen.slice(side.headerAt, -1); // header .. BLOCKS FREE.
  if (listed.length !== printed.length) throw new Error(`${label}: the disk lists ${listed.length} lines, the page ${printed.length}`);
  listed.forEach((l, i) => {
    if (l !== printed[i]) throw new Error(`${label}, line ${i}: disk says\n  ${l}\npage says\n  ${printed[i]}`);
  });
  return img;
}

// ------------------------------------------------------------------ the page
const pre = (lines) => `<pre>\n${lines.map(toHtml).join('\n')}\n</pre>`;

function page() {
  const sideA = listing({
    name: 'CASTAWAY',
    id: 'LO-FI',
    idNote: 'working title',
    art: SIDE_A_ART,
    entries: SIDE_A_ENTRIES,
    sig: [' ART BY BOLLARD '],
    footerNote: () => '664 minus the lot, as a real 1541 says',
    cursorNote: 'the cursor. it is also just waiting',
  });
  const sideB = listing({
    name: 'SEED 1992',
    id: '10HRS',
    idNote: 'side b: the default run, counted',
    art: SIDE_B_ART,
    entries: SIDE_B_ENTRIES,
    sig: ['  SLACKWATER 26 ', 'the crew. nothing happens, on purpose'],
    footerNote: (free) => `idle ${IDLE_PCT}% of this run. the disk: ${Math.round((100 * free) / DISK_BLOCKS)}%`,
  });
  const images = {
    'castaway-side-a.d64': checkDisk(sideA, 'side A'),
    'castaway-side-b.d64': checkDisk(sideB, 'side B'),
  };
  const alt = svgAlt(SIDE_A_ENTRIES, DISK_BLOCKS - sideA.used);
  fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
  fs.writeFileSync(OUT_SVG, blueScreenSvg(sideA.screen, sideA.headerAt, alt));
  const unseen = SIDE_B_ENTRIES.find((e) => e.name === 'SHIP UNSEEN').blocks;
  const seen = SIDE_B_ENTRIES.find((e) => e.name === 'WAVE FOR RESCUE').blocks;
  if (seen !== 1) throw new Error('the ships sentence below assumes she saw exactly one ship');
  const WORDS = 'No One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen'.split(' ');

  const md = [];
  const p = (...s) => md.push(...s, '');
  p(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`);
  p('**Castaway** · ten lo-fi hours of one woman on one very small island, doing very little, very calmly. Here is the disk.');
  p(pre(sideA.lines));
  p('**In plain words.** *Castaway* (working title) is a lo-fi video for YouTube in the spirit of the ten-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music in her headphones, and every so often something happens. It is an unofficial homage to the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, repainted sunny, coastal and lo-fi: 16:9, 1080p, 30 fps, and always daytime. The listing above draws it in file names (the title, a cloud, a gull, the sun, the palm, a ship on the horizon, her on the sand with a coconut, the raft and the sea) with the real numbers underneath.');
  p(`**Almost nothing happens, on a schedule.** [activities.toml](activities.toml) lists ${ACTIVITIES} activities, each with step-by-step beats, how long it lasts and how often it comes round. ${TIMED} of them sit on four timers: regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, super rare every 3 to 6 hours. The other ${ACTIVITIES - TIMED} only ever follow on from something else. A typical 10-hour run (median of 200 simulated ones) holds about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus about 20 chained follow-ups, and she is busy about a third of the time. Lanes let things overlap, which is how a ship gets past while she is busy with a coconut. Every activity starts on the next bar of the music, every 3 seconds, so the gags land on the beat.`);
  p(`**Every sound is synthesized from code** by [tools/make_audio.py](tools/make_audio.py): ${SOUNDS} files, none of them sampled, recorded or lifted from a loop pack, so no third-party licence applies. Nobody has listened to them yet. The island is being very brave about it.`);
  p('**Run it.** No disk drive needed: the renderer is a web page with a live preview and an export to a YouTube-ready MP4, in plain ES modules with no build step and no npm.');
  p('```sh\npython tools/serve.py       # then open http://127.0.0.1:8765/\npython tools/schedule.py    # check the schedule, simulate a 10-hour run\n```');

  p('<details>', '<summary><b>BLUE SCREEN</b> · side A as the C64 itself lists it, in its own colours and characters</summary>');
  p(`<p align="center"><img src="${SVG_REF}" width="768" alt="${esc(alt).replace(/"/g, '&quot;')}"></p>`);
  p('The same listing, drawn 8 by 8 pixels to a character: light blue on blue inside a light blue border, the disk name in reverse video as the drive sends it, and the cursor blinking after READY. A real screen is 25 rows tall, so in real life this scrolls past and you hold CTRL to slow it down. The notes on the sleeve are not on the screen.');
  p('</details>');

  p('<details>', '<summary><b>SIDE B</b> · flip the disk: the default 10-hour run, counted</summary>');
  p(pre(sideB.lines));
  p(`The default run is 10:00:00 with seed 1992, so the same seed gives the same video, event for event. These are some of the counts \`python tools/schedule.py\` printed for it on 2026-10-01, which counts every activity whether its art is finished or not; the schedule is still being tuned, so yours will differ. ${WORDS[unseen + seen]} ships came past. She saw one, waved like mad, and it honked and sailed on, which is also correct.`);
  p('</details>');

  p('<details>', '<summary><b>SLEEVE NOTES</b> · the renderer, the music on paper, the scenery, and what is not done</summary>');
  p([
    '- **Her.** A young woman with brown hair in a loose low bun, cream headphones, a coral tank top, cream shorts and bare feet. On the disk she is three characters tall.',
    '- **The renderer.** [web/index.html](web/index.html), served by [tools/serve.py](tools/serve.py) on 127.0.0.1 only. It exports frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome); the server mixes the sound and joins the two into an MP4. Hard cuts and stepped movement are the motion defaults. The older Python reference renderer, [tools/render_demo.py](tools/render_demo.py), renders a dev reel of every activity with a heads-up display when run with `--dev`.',
    '- **The music, on paper.** A seamless 60-second loop at 80 BPM in F major, a ii-V-I-vi: 20 bars of exactly 3 seconds, electric piano, a kalimba lead, soft drums, and the ticks, pops and hiss of a record that does not exist. The ocean is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and every level can be turned up, down or off in master and per routine. Whether any of it sounds nice is, at time of writing, between the island and the sea.',
    '- **Scene life.** 26 entries of things that are always on or happen now and then. Built: shore waves and drifting cloud shadows. Planned: distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower.',
    '- **Status.** In development. No video has been published and there is no public link yet. The working log is [MUSING.md](MUSING.md).',
  ].join('\n'));
  p('</details>');

  p('<details>', `<summary><b>DIR ART?</b> · what this is, and why ${DISK_BLOCKS - sideA.used} BLOCKS FREE is honest</summary>`);
  p([
    `On a Commodore 64 you see what is on a floppy by typing \`LOAD"$",8\` and \`LIST\`. Every file is one line: its size in 254-byte blocks, its name in quotes and its type. The list is never sorted and nobody checks the names, so people drew pictures in them, one row per empty 0-block DEL file, sixteen characters at a time. That is all this is.`,
    '',
    `- Every character between the quotes exists in the C64's own uppercase and graphics set, and the script that writes this page refuses to run if one does not. That is why the picture has no solid blocks (on a C64 those are reverse-video characters, and this disk keeps to plain ones) and why it says MAKE←AUDIO.PY: a C64 has no underscore, and the underscore's code prints a left arrow.`,
    `- Every line is padded the way the drive pads it, so every opening quote lands in the sixth column, whatever the block count.`,
    `- The block counts on the real entries are real numbers from the project, counted on 2026-10-01. ${DISK_BLOCKS - sideA.used} BLOCKS FREE is 664, an empty 1541 disk, minus all ${sideA.used} of them, and side B's ${DISK_BLOCKS - sideB.used} is worked out the same way. Both disks would fit: ${sideA.count} and ${sideB.count} entries, where a 1541 directory holds ${MAX_ENTRIES}.`,
    '- The script that writes this page also builds both sides as real 1541 disk images, lists them back the way the drive would, and stops unless every line matches the page. It will save the two images for an emulator if asked. Nobody has put them in one yet; the island is not in a hurry.',
    '- The pencil notes on the right are not on the disk. They are on the sleeve.',
  ].join('\n'));
  p('</details>');

  p('<details>', '<summary><b>GREETZ</b> · to the cast</summary>');
  p('Dir art by BOLLARD of SLACKWATER, a crew named after the still bit between two tides, when nothing moves and that is the point.');
  p('Greetz to the turtle, the cat on the crate (see you next time), the shark in the headphones (same beat), the hermit crab (nice coconut, it suits you), the delivery drone (more headphones, thank you), the bro on the hydrofoil (shaka received), the tour boat (nobody offered a lift), whoever wrote back, and the ship. We know you were there.');
  p('<sub>Castaway is an unofficial homage to the 1992 screensaver <i>Johnny Castaway</i>, which belongs to its owners; this project is not affiliated with them. The dir art here is new. Commodore 64 and 1541 are named here only to explain the format. BOLLARD and SLACKWATER are made up.</sub>');
  p('</details>');
  return { md: md.join('\n'), images };
}

const { md, images } = page();
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} and ${path.relative(process.cwd(), OUT_SVG)}`);
// Optional: save both sides as disk images, e.g. to try LOAD"$",8 in an emulator.
const d64At = process.argv.indexOf('--d64');
if (d64At > 0) {
  const dir = path.resolve(process.argv[d64At + 1] || '.');
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, img] of Object.entries(images)) {
    fs.writeFileSync(path.join(dir, file), img);
    console.log(`wrote ${path.join(dir, file)} (${img.length} bytes)`);
  }
}
