// FILE_ID.DIZ miniature header for the Castaway README (style catalogue entry nfo-05).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/43-file-id-diz_opus_5.5.mjs
// It rewrites examples/castaway/43-file-id-diz_opus_5.5.md and
// examples/castaway/assets/43-file-id-diz_opus_5.5-block.svg. Edit this file, not those.
//
// The style: the FILE_ID.DIZ, the stamp-sized description that BBS software pulled out of an
// upload and printed in the file list. Clark Development made it for PCBDescribe; the shareware
// guidance around it allowed 10 lines of 45 characters and asked for no high ASCII and no
// centring or formatting; from about 1993 the release groups
// squeezed a logo, a rule with a tag in it, a title line and a disk counter into that space
// anyway. Three manners are drawn here: the outline logo (underscore roofs, slash walls), the
// framed card (colon columns either side, arrow rules), and the block variant, in which every
// empty cell around solid block letters is a capital letter, so the background hides a message.
// Credited references (none of their art, letterforms, names, slogans or tags is reproduced
// here): the Razor 1911, The Humble Guys, INC and Pentagram DIZ files at artscene.textfiles.com,
// Remorse pack 15's DIZ, Richard Holler's FILE_ID.DIZ FAQ and Gleb J. Albert's WiderScreen essay.
//
// Everything named here is invented: the crew ONEBAR (named after the one bar of signal at the
// top of the palm, and the one bar of music every gag waits for) and its artist tag zZ, who is
// asleep. The outline alphabet, the block glyphs, the island jokes and the hidden message are new.
//
// The hero card is 7-bit ASCII, exactly 45 columns by 10 lines, and every one of its lines is
// the full 45 wide, so a <div align="center"> can centre the whole card on GitHub without
// knocking the lines out of register. The script refuses to write if that ever stops being true,
// if a code-block line is wider than 80 columns, carries a tab or trailing space, or if the copy
// picks up an em dash or a word the brief keeps out of the header.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '43-file-id-diz_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}-block.svg`);
const SVG_REF = `assets/${SLUG}-block.svg`;

// Facts that move. Checked read-only against D:/python/castaway on AS_OF:
//   python -B -c "import tomllib; d=tomllib.load(open('activities.toml','rb')); print(len(d['activities']))"
// gave 94 (it grows every few hours, so the copy says "more than 90"); the tiers quoted in the
// gag listing are each activity's `tier` in activities.toml on that day (the owner has said the
// tiers get rebalanced at the end, so the listing carries its date). Sound files: more than 150.
const AS_OF = '2026-10-01';
const AS_OF_BBS = '10-01-26'; // the same day, written the way a 1993 file list writes it

const DIZ_W = 45; // PCBDescribe's width
const DIZ_H = 10; // and its height

// ---------------------------------------------------------------------------------------------
// 1. The outline alphabet. Six rows: a roof of underscores, then five rows of walls. Stems are
//    one space wide, so eight letters fit in 43 columns. Drawn by hand; a '·' is a space that
//    has to survive (trailing spaces would otherwise be lost in this file).
// ---------------------------------------------------------------------------------------------
const art = (s) => s.raw[0].split('\n').slice(1, -1).map((r) => r.replace(/\u00b7/g, ' '));
const OUTLINE = {
  C: art`
·___·
/·__|
|·|··
|·|··
|·|__
\___|
`,
  A: art`
··__··
·/··\·
/·/\·\
|·__·|
|·||·|
|_||_|
`,
  S: art`
·___·
/·__|
|·|_·
\_··\
·_|·|
|___/
`,
  T: art`
·___·
|_·_|
·|·|·
·|·|·
·|·|·
·|_|·
`,
  W: art`
·_··_·
|·||·|
|·||·|
|·||·|
\····/
·\/\/·
`,
  Y: art`
·_·_·
|·|·|
|·|·|
\_·_/
·|·|·
·|_|·
`,
};
const OUT_H = 6;
for (const [k, g] of Object.entries(OUTLINE)) {
  if (g.length !== OUT_H || g.some((r) => r.length !== g[0].length)) throw new Error(`outline glyph ${k} is ragged`);
}

// Set a word. `kern[i]` pulls letter i+1 left by that many columns over letter i; where two
// letters land on the same cell a wall beats an underscore, which beats a space.
function setOutline(word, kern) {
  const rows = Array.from({ length: OUT_H }, () => []);
  const rank = (c) => (c === ' ' ? 0 : c === '_' ? 1 : 2);
  let x = 0;
  [...word].forEach((ch, i) => {
    const g = OUTLINE[ch];
    if (!g) throw new Error(`no outline glyph for ${ch}`);
    if (i > 0) x -= kern[i - 1] || 0;
    for (let y = 0; y < OUT_H; y++) {
      for (let j = 0; j < g[y].length; j++) {
        const c = g[y][j];
        const cur = rows[y][x + j] || ' ';
        rows[y][x + j] = rank(c) >= rank(cur) ? c : cur;
      }
    }
    x += g[0].length;
  });
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => Array.from({ length: w }, (_, i) => r[i] || ' ').join(''));
}

// A and S get a column of air between them; S, T and A share walls. Six rows, the most the
// format's logos ever took, so the card keeps room for a rule and three text lines.
const LOGO = setOutline('CASTAWAY', [0, -1, 1, 1, 0, 0, 0]);
const LOGO_W = LOGO[0].length;
if (LOGO_W !== DIZ_W - 2) throw new Error(`logo is ${LOGO_W} wide; the card has room for ${DIZ_W - 2}`);

// ---------------------------------------------------------------------------------------------
// 2. The card. Every line is exactly 45 columns and ends in ink, so it centres as one block.
// ---------------------------------------------------------------------------------------------
const rep = (ch, n) => (n > 0 ? ch.repeat(n) : '');
const centreIn = (s, w, fill = ' ') => {
  const l = Math.floor((w - s.length) / 2);
  return rep(fill, l) + s + rep(fill, w - l - s.length);
};
// A title line in the DIZ manner: words, a leader, and the counter hard against the right edge.
const counterLine = (title, part, w = DIZ_W) => {
  const tail = ` [${part}]`;
  const dots = w - title.length - tail.length;
  if (dots < 0) throw new Error(`title too long for ${w}: ${title}`);
  return dots === 0 ? title + tail : `${title} ${rep('.', dots - 1)}${tail}`;
};

const RULE = (() => {
  const label = '[ ONEBAR PRESENTS ]';
  const tag = ' zZ ';
  const inner = DIZ_W - 2;
  const left = 10;
  const mid = inner - left - label.length - tag.length - 2;
  return `<${rep('~', left)}${label}${rep('~', mid)}${tag}~~>`;
})();

// Logo, one rule, then the title line with its counter and two centred lines: the layout
// the format settled on. The last line is the one every DIZ had room for: what it needs.
const CARD = [
  ...LOGO.map((r) => `:${r}:`),
  RULE,
  'CASTAWAY: NOTHING HAPPENS ON SCHEDULE [01/10]',
  `:${centreIn('A TEN-HOUR LO-FI ISLAND VIDEO FOR YOUTUBE', DIZ_W - 2)}:`,
  `:${centreIn('ALL SOUND FROM CODE.  REQUIRES: TEN HOURS', DIZ_W - 2)}:`,
];

function checkCard(lines, name) {
  if (lines.length !== DIZ_H) throw new Error(`${name}: ${lines.length} lines, a DIZ has ${DIZ_H}`);
  lines.forEach((l, i) => {
    if (l.length !== DIZ_W) throw new Error(`${name} line ${i + 1} is ${l.length} wide: ${JSON.stringify(l)}`);
    if (!/^[\x21-\x7e][\x20-\x7e]*[\x21-\x7e]$/.test(l)) throw new Error(`${name} line ${i + 1} is not 7-bit ink-to-ink: ${JSON.stringify(l)}`);
  });
}
checkCard(CARD, 'card');

// ---------------------------------------------------------------------------------------------
// 3. The spec sheet: the same card under a column ruler, one line per hour of video.
// ---------------------------------------------------------------------------------------------
const RULER = '....:....1....:....2....:....3....:....4....:';
if (RULER.length !== DIZ_W) throw new Error('ruler');
const HOUR_NOTES = [
  'logo',
  'logo',
  'logo, still',
  'logo. she nods',
  'logo. she nods',
  'logo, last of it',
  'the crew takes a bow',
  'the title, at last',
  'the plot',
  'system requirements',
];
if (HOUR_NOTES.length !== DIZ_H) throw new Error('one note per hour');
const SPEC = [
  `        ${RULER}`,
  ...CARD.map((l, i) => `  ${String(i).padStart(2)}h   ${l}   ${HOUR_NOTES[i]}`),
  `  10h   ${centreIn('(end of file. she is still nodding.)', DIZ_W)}`.replace(/\s+$/, ''),
];

// ---------------------------------------------------------------------------------------------
// 4. File area 2: every gag as an upload, with its DIZ title line and part counter. `every` is
//    the activity's tier timer in activities.toml on AS_OF; chained ones only follow another.
// ---------------------------------------------------------------------------------------------
const EVERY = { reg: '2-5 min', occ: '12-25 min', rare: '30-60 min', sup: '3-6 h', chain: 'chained' };
const GAGS = [
  ['COCONUT.SIP', 'reg', 'COCONUT SIPPING', '1/1', 'eyes shut. completely content.'],
  ['FISHING.NIL', 'reg', 'FISHING', '1/1', 'a nibble. no fish. the fish are fine.'],
  ['JOG.LAP', 'reg', 'JOGGING LAPS', '1/1', 'the length of the island and back. brief.'],
  ['CASTLE.SND', 'reg', 'SANDCASTLE', '1/2', 'a really good one.'],
  ['TIDE.TOK', 'chain', 'THE TIDE', '2/2', 'takes the sandcastle.'],
  ['BOTTLE.OUT', 'occ', 'MESSAGE IN A BOTTLE', '1/2', 'thrown out to sea. washes straight back.'],
  ['BOTTLE.IN', 'chain', 'A DIFFERENT BOTTLE', '2/2', 'hours later. it is a reply. she smiles.'],
  ['TURTLE.ZZZ', 'occ', 'SEA TURTLE', '1/1', 'crawls up beside her. they both doze off.'],
  ['CRAB.HAT', 'occ', 'COCONUT, MEET HERMIT CRAB', '1/1', 'a direct hit. then the coconut walks off.'],
  ['SHIP.NOT', 'occ', 'A SHIP', '0/1', 'sails past while she is busy. seen: 0.'],
  ['KUMARA.PLT', 'occ', 'KUMARA', '1/3', 'planted. that is all, for now.'],
  ['KUMARA.LVS', 'chain', 'KUMARA', '2/3', 'hours later: leaves. nobody remarks on it.'],
  ['KUMARA.FLW', 'chain', 'KUMARA', '3/3', 'later still: a few pale lavender flowers.'],
  ['DRONE.PKG', 'rare', 'DELIVERY DRONE', '1/2', 'in the parcel: another pair of headphones.'],
  ['BOX.SEA', 'chain', 'THE EMPTY BOX', '2/2', 'a wave takes it out to sea.'],
  ['SIGNAL.BAR', 'rare', 'SIGNAL HUNT', '1/1', 'one bar. at the very top of the palm.'],
  ['CAT.NAP', 'rare', 'STRAY CAT, GREY TABBY', '1/1', 'white chest. comes by crate, climbs the palm, naps. one day it floats off. it comes back another time.'],
  ['SHARK.BPM', 'rare', 'SHARK', '1/1', 'in headphones, nodding to the same beat.'],
  ['SELFIES.JPG', 'rare', 'TOUR BOAT', '1/1', 'everyone takes a selfie with her in the background. nobody offers a lift.'],
  ['SHAKA.BRO', 'rare', 'HYDROFOIL BRO', '1/1', 'she runs to wave. a shaka. he carves off.'],
  ['FIRE.BOW', 'rare', 'BUSHCRAFT: FIRE', '1/4', 'by friction. smoke! a flame! a wave.'],
  ['HAMMOCK.TIE', 'rare', 'BUSHCRAFT: HAMMOCK', '2/4', 'one palm. the other end goes on the raft.'],
  ['LOOKOUT.UP', 'rare', 'BUSHCRAFT: LOOKOUT', '3/4', 'up the palm. the palm bends. ground floor.'],
  ['SPEAR.FSH', 'rare', 'BUSHCRAFT: SPEAR FISHING', '4/4', 'misses. a gull drops her one, out of pity.'],
  ['ICED.COF', 'sup', 'SHE COULD LEAVE ANY TIME', '1/1', 'walks out over the water. comes back with an iced coffee. never explained.'],
  ['RESCUE.WAV', 'sup', 'WAVING FOR RESCUE', '1/1', 'a ship! she waves like mad. it honks back. it sails on. music back on.'],
];

// Word-wrap plain text to a width.
function wrap(text, width) {
  const out = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > width && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

const LIST_NAME = 12;
const LIST_EVERY = 9;
const LIST_DESC = LIST_NAME + 1 + LIST_EVERY + 2; // column the description starts in
function gagListing() {
  const out = [];
  const head = 'FILE AREA 2: GAGS';
  const right = `${GAGS.length} files. 1 island. as of ${AS_OF_BBS}`;
  out.push(`${head}${rep(' ', LIST_DESC + DIZ_W - head.length - right.length)}${right}`);
  out.push('');
  out.push(`${'Filename'.padEnd(LIST_NAME)} ${'Every'.padEnd(LIST_EVERY)}  Description`);
  out.push(`${rep('-', LIST_NAME)} ${rep('-', LIST_EVERY)}  ${rep('-', DIZ_W)}`);
  for (const [file, tier, title, part, more] of GAGS) {
    if (!/^[A-Z0-9_]{1,8}\.[A-Z0-9_]{1,3}$/.test(file)) throw new Error(`not an 8.3 name: ${file}`);
    out.push(`${file.padEnd(LIST_NAME)} ${EVERY[tier].padEnd(LIST_EVERY)}  ${counterLine(title, part)}`);
    for (const l of wrap(more, DIZ_W - 2)) out.push(`${rep(' ', LIST_DESC - 2)}| ${l}`);
  }
  out.push(`${rep('-', LIST_NAME)} ${rep('-', LIST_EVERY)}  ${rep('-', DIZ_W)}`);
  out.push(`${GAGS.length} files. ships sailed past: some. ships seen: see RESCUE.WAV.`);
  return out;
}
const LISTING = gagListing();

// ---------------------------------------------------------------------------------------------
// 5. The block variant, as an SVG: 45 x 10 text cells of 8 x 16 pixels, drawn the way a DOS
//    file viewer shows them. Solid half-block letters spell 80BPM; every other cell of the logo
//    rows is a capital from a hidden message, read left to right, top to bottom. A cursor reads
//    it out in inverse video, one cell at a time. GitHub keeps SVGs in <img>, so there is no
//    <text>: glyphs come from a CP437-style 8 x 16 bitmap font, as <use> of shared paths.
// ---------------------------------------------------------------------------------------------
const CW = 8;
const CH = 16;
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
// VGA-style capitals and digits (technique and rows after the font in 12-bios-hijack).
const CAPS = {
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
  T: '######. ######. #.##.#. ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '##..##. ##..##. ##..##. ##..##. .####.. ..##... ..##... ..##... ..##... .####..',
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
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');
const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Bitmap -> compact path: horizontal runs, merged downwards while they line up.
function runsToPath(rowRuns, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rowRuns.length; y++) {
    const next = [];
    for (const [x0, w] of rowRuns[y]) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) {
        o.h++;
        next.push(o);
      } else {
        const r = { x: x0, w, y, h: 1 };
        rects.push(r);
        next.push(r);
      }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
function glyphPath(g) {
  const rows = g.map((v) => {
    const runs = [];
    for (let x = 0; x < 8;) {
      if ((v >> (7 - x)) & 1) {
        const s = x;
        while (x < 8 && ((v >> (7 - x)) & 1)) x++;
        runs.push([s, x - s]);
      } else x++;
    }
    return runs;
  });
  return runsToPath(rows);
}
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no bitmap glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}

// The block glyphs, 7 x 14 half-cell pixels each ('#' is ink). Two pixel rows make one text
// row: both lit is a full block, top only an upper half block, bottom only a lower half block.
const BLOCK = {
  8: ['.#####.', '#######', '##...##', '##...##', '##...##', '.#####.', '.#####.', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.', '.......'],
  0: ['.#####.', '#######', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.', '.......'],
  B: ['######.', '#######', '##...##', '##...##', '##...##', '######.', '######.', '##...##', '##...##', '##...##', '##...##', '#######', '######.', '.......'],
  P: ['######.', '#######', '##...##', '##...##', '##...##', '#######', '######.', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '.......'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.......'],
};
const BLOCK_WORD = '80BPM';
const BLOCK_ROWS = 7; // text rows of logo
const BLOCK_GAP = 2; // empty columns between letters

// Lay the block word out on the 45-column grid: returns [row][col] of 'full'|'top'|'bot'|null.
function blockCells() {
  const glyphW = 7;
  const total = BLOCK_WORD.length * glyphW + (BLOCK_WORD.length - 1) * BLOCK_GAP;
  const x0 = Math.floor((DIZ_W - total) / 2);
  const cells = Array.from({ length: BLOCK_ROWS }, () => Array(DIZ_W).fill(null));
  [...BLOCK_WORD].forEach((ch, i) => {
    const g = BLOCK[ch];
    if (!g || g.length !== BLOCK_ROWS * 2 || g.some((r) => r.length !== glyphW)) throw new Error(`block glyph ${ch} is ragged`);
    const cx = x0 + i * (glyphW + BLOCK_GAP);
    for (let r = 0; r < BLOCK_ROWS; r++) {
      for (let c = 0; c < glyphW; c++) {
        const top = g[r * 2][c] === '#';
        const bot = g[r * 2 + 1][c] === '#';
        cells[r][cx + c] = top && bot ? 'full' : top ? 'top' : bot ? 'bot' : null;
      }
    }
  });
  return cells;
}

// The hidden message, run together the way the INC card ran its words, then the credits.
// The script stops if it does not fill every empty cell exactly.
// Written as sentences (for the alt text), set as capitals with everything else squeezed out.
const HIDDEN = [
  'Every sound is made from code.',
  'No samples, no recordings.',
  'The ocean loops every minute.',
  'Nobody has heard any of it yet.',
  'Respect to the shark for keeping time.',
  'zZ of ONEBAR.',
];
const HIDDEN_CAPS = HIDDEN.join('').toUpperCase().replace(/[^A-Z]/g, '');

// Text rows under the logo: title with the counter (bar 01 of the theme's 20), then two lines.
const BLOCK_TEXT = [
  counterLine('CASTAWAY OST: THE THEME, 60 S LOOP', '01/20'),
  centreIn('80 BPM. F MAJOR. II-V-I-VI. 20 BARS OF 3 S', DIZ_W),
  centreIn('SYNTHESIZED FROM CODE.  ONEBAR / zZ', DIZ_W),
];
// The viewer's status line, as wide as the card, in inverse video.
const STATUS = (() => {
  const l = ' FILE_ID.DIZ  45 X 10';
  const r = 'READ THE GAPS ';
  return l + rep(' ', DIZ_W - l.length - r.length) + r;
})();
const BLOCK_ALT = `The Castaway theme's own FILE_ID.DIZ, in a DOS file viewer: light grey on black, 45 columns by 10 lines. 80BPM in solid half-block letters fills the top seven lines, and every empty cell around and inside the letters is a dimmer capital letter. Read in order, the capitals say: ${HIDDEN.join(' ')} Below the logo: ${BLOCK_TEXT.map((t) => t.trim().replace(/ \.+ /, ' ')).join('; ')}. The viewer's status line reads FILE_ID.DIZ 45 X 10, READ THE GAPS. An inverse-video cursor reads the hidden message out, one letter at a time, and every letter it has read turns bright white, until the whole message stands out from the gaps; then it starts again.`;

function buildBlockSvg() {
  const cells = blockCells();
  // reading order of the empty logo cells
  const slots = [];
  for (let r = 0; r < BLOCK_ROWS; r++) for (let c = 0; c < DIZ_W; c++) if (!cells[r][c]) slots.push([r, c]);
  const msg = HIDDEN_CAPS;
  if (msg.length !== slots.length) throw new Error(`hidden message is ${msg.length} letters; the gaps hold ${slots.length}`);

  const PADX = 2; // cells of panel margin
  const PADY = 1;
  const W = (DIZ_W + PADX * 2) * CW;
  const statusY = (DIZ_H + PADY * 2) * CH;
  const H = statusY + CH + PADY * CH;
  const fg = '#b4b4b4';
  const hi = '#f4f4f4'; // high-intensity white, for letters already read
  const bg = '#08090c';

  // block pixels (8 x 8 half cells) as merged runs
  const halfRows = [];
  for (let r = 0; r < BLOCK_ROWS; r++) {
    for (const half of [0, 1]) {
      const runs = [];
      for (let c = 0; c < DIZ_W;) {
        const k = cells[r][c];
        const lit = k === 'full' || (half === 0 && k === 'top') || (half === 1 && k === 'bot');
        if (lit) {
          const s = c;
          while (c < DIZ_W && (cells[r][c] === 'full' || (half === 0 && cells[r][c] === 'top') || (half === 1 && cells[r][c] === 'bot'))) c++;
          runs.push([s * CW, (c - s) * CW]);
        } else c++;
      }
      halfRows.push(runs);
    }
  }
  // expand to 8-pixel tall rows so runsToPath merges them into tall rects
  const pixRows = [];
  for (const runs of halfRows) for (let k = 0; k < 8; k++) pixRows.push(runs);
  const blockPath = runsToPath(pixRows);

  // filler letters
  const useRow = (r, c0, str) => {
    let s = '';
    [...str].forEach((ch, i) => {
      if (ch !== ' ') s += `<use href="#${gid(ch)}" x="${(c0 + i) * CW}"/>`;
    });
    return s ? `<g transform="translate(0 ${r * CH})">${s}</g>` : '';
  };
  let filler = '';
  {
    const byRow = new Map();
    slots.forEach(([r, c], i) => {
      if (!byRow.has(r)) byRow.set(r, Array(DIZ_W).fill(' '));
      byRow.get(r)[c] = msg[i];
    });
    for (const [r, arr] of byRow) filler += useRow(r, 0, arr.join(''));
  }
  let textRows = '';
  BLOCK_TEXT.forEach((t, i) => {
    if (t.length !== DIZ_W) throw new Error(`block card text line ${i} is ${t.length} wide`);
    textRows += useRow(BLOCK_ROWS + i, 0, t);
  });

  // the reading cursor: one cell, stepping through the slots at 8 a second, holding at the
  // start and the end. Discrete SMIL steps; CSS hides it for reduced motion.
  const STEP = 0.125;
  const HOLD_START = 16; // steps
  const HOLD_END = 32;
  const seq = [];
  for (let k = 0; k < HOLD_START; k++) seq.push(slots[0]);
  for (const s of slots) seq.push(s);
  for (let k = 0; k < HOLD_END; k++) seq.push(slots[slots.length - 1]);
  const dur = +(seq.length * STEP).toFixed(3);
  const vals = seq.map(([r, c]) => `${c * CW},${r * CH}`).join(';');
  // What has been read so far lights up: every row above the cursor in full, and its own row
  // up to and including the cursor's cell. Two clip rectangles, stepped with the cursor.
  const readAbove = seq.map(([r]) => r * CH).join(';');
  const readRowY = seq.map(([r]) => r * CH).join(';');
  const readRowW = seq.map(([, c]) => (c + 1) * CW).join(';');
  const step = (attr, values) => `<animate attributeName="${attr}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" values="${values}"/>`;

  // the status bar text, inverse video (set before the glyph table is written out)
  if (STATUS.length !== DIZ_W) throw new Error('status line width');
  const statusText = useRow(0, 0, STATUS);
  const statusW = STATUS.length * CW;
  const glyphDefs = [...glyphIds.entries()].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');

  const ox = PADX * CW;
  const oy = PADY * CH;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">Castaway: FILE_ID.DIZ, block variant</title>
<desc id="d">${esc(BLOCK_ALT)}</desc>
<style>
.ink{fill:${fg}}
.dim{fill:${fg};opacity:.62}
.hi{fill:${hi}}
.inv{fill:${bg}}
@media (prefers-reduced-motion: reduce){.cursor,.read{display:none}}
</style>
<defs>${glyphDefs}<g id="msg">${filler}</g><rect id="cur" width="${CW}" height="${CH}"><animateTransform attributeName="transform" type="translate" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" values="${vals}"/></rect><clipPath id="cc"><use href="#cur"/></clipPath><clipPath id="rd"><rect width="${DIZ_W * CW}" height="0">${step('height', readAbove)}</rect><rect height="${CH}" width="${CW}">${step('y', readRowY)}${step('width', readRowW)}</rect></clipPath></defs>
<rect width="${W}" height="${H}" rx="10" fill="${bg}"/>
<g transform="translate(${ox} ${oy})">
<path class="ink" d="${blockPath}"/>
<use href="#msg" class="dim"/>
<use href="#msg" class="hi read" clip-path="url(#rd)"/>
<g class="ink">${textRows}</g>
<g class="cursor"><use href="#cur" class="hi"/><use href="#msg" class="inv" clip-path="url(#cc)"/></g>
</g>
<g transform="translate(${ox} ${statusY})"><rect width="${statusW}" height="${CH}" class="ink"/><g class="inv">${statusText}</g></g>
</svg>
`;
  return { svg, msg, slots: slots.length };
}

// ---------------------------------------------------------------------------------------------
// 6. Markdown.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const pre = (lines) => `<pre>\n${lines.map(esc).join('\n')}\n</pre>`;

const block = buildBlockSvg();

const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<div align="center">

${pre(CARD)}

<p><b>Castaway</b> (working title) · a ten-hour lo-fi island video · in development<br>
<sub>The FILE_ID.DIZ: 45 columns by 10 lines and no high ASCII, as the guidelines asked. One line per hour.</sub></p>

</div>

**Castaway** is a stationary-frame lo-fi video for YouTube, in the spirit of the ten-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding along to the music in her cream headphones, and every so often something happens. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, painted sunny and coastal: 16:9, 1080p, and always daytime.

**Nothing happens, on schedule.** [activities.toml](activities.toml) books more than 90 activities, most of them on four timers: an everyday routine every 2 to 5 minutes, a small gag every 12 to 25, a set piece every 30 to 60, and every 3 to 6 hours, something super rare. A bottle she throws washes straight back. A drone lowers a parcel: another pair of headphones. A coconut lands on a hermit crab, and the crab walks off wearing it. Every activity starts on the next bar of the music, every 3 seconds, so even the gags arrive on the beat.

**Every sound is synthesized from code** by [tools/make_audio.py](tools/make_audio.py): more than 150 files, with no samples, no borrowed loops and no recordings among them. The theme is a seamless 60-second loop at 80 BPM in F major. Nobody has heard any of it yet, which is very on brand.

\`\`\`sh
python tools/serve.py       # then open http://127.0.0.1:8765/
python tools/schedule.py    # check the schedule, simulate a 10-hour run
\`\`\`

<details>
<summary><b>SPEC SHEET</b> · ten lines, ten hours, one line per hour</summary>

${pre(SPEC)}

FILE_ID.DIZ was invented by Clark Development for its PCBDescribe utility, and the shareware guidelines that grew up around it asked for a description up to 10 lines of 45 characters, with no high ASCII and no centring or formatting, please. This card has no high ASCII. The logo is formatting and the last two lines are centred; nobody is perfect.

The video is ten hours long, so the card runs one line per hour. Six of the ten are logo, which is roughly the video's own ratio: she is busy about a third of the time and idling the rest. The counter, \`[01/10]\`, is disk 01 of 10. Disks 02 to 10 are the same island, later. The system requirements are accurate.

</details>

<details>
<summary><b>FILE_ID.DIZ, BLOCK VARIANT</b> · the theme's card, with a message in the gaps</summary>

<p align="center"><img src="${SVG_REF}" width="784" alt="${attr(BLOCK_ALT)}"></p>

The other way to fill 45 by 10: solid half-block letters, and every empty cell a capital, so the background is text and can hide a message. Block letters do not survive GitHub's code-block line spacing, so this one is drawn, cell by cell, as a DOS file viewer would show it, with a cursor that reads the gaps for you and leaves the message lit behind it. Its counter, \`[01/20]\`, is bar 01 of the theme's 20: the theme is a seamless 60-second loop of 20 bars of exactly 3 seconds, at 80 BPM in F major, a ii-V-I-vi progression with electric piano, a kalimba lead, soft drums and vinyl crackle. The ocean is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and every level can be set in master and per routine.

</details>

<details>
<summary><b>FILE AREA 2: GAGS</b> · ${GAGS.length} of the gags as uploads, each with its own counter</summary>

${pre(LISTING)}

Each gag is an activity in [activities.toml](activities.toml); the Every column is the timer its tier runs on, and "chained" ones only ever follow the one above them, an hour or three later for the bottle and the kumara. A typical 10-hour run (the median of 200 simulated runs, as the file itself puts it) has about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus the follow-ups. The default run is 10:00:00 on seed 1992, so the same seed always gives the same ten hours. Lanes let things overlap, which is how a ship gets past while she is busy.

</details>

<details>
<summary><b>THE SMALL PRINT</b> · how it renders, what is built, greetz</summary>

- **The renderer** is a web page, [web/index.html](web/index.html), served by [tools/serve.py](tools/serve.py) at http://127.0.0.1:8765/ with a live preview and an export to a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. The browser encodes frame-exact H.264 with WebCodecs (68 to 78 frames a second in Chrome, measured at 1080p30), and the server mixes the sound and joins the two. Hard cuts and stepped movement are the motion defaults.
- **The schedule** is checked by [tools/schedule.py](tools/schedule.py), which also simulates a 10-hour run. [tools/render_demo.py](tools/render_demo.py) \`--dev\` renders a dev reel of every activity with a heads-up display (the older Python reference renderer).
- **Her:** a young woman with brown hair in a loose low bun and cream headphones. She does not appear on this card at all: 45 columns is not enough island.
- **Scene life:** 26 entries. Built so far: shore waves and drifting cloud shadows. On the way: distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower.
- **Status:** in development. No video has been published and there is no public link. The working log is [MUSING.md](MUSING.md).
- **Greetz** to the hermit crab (the coconut suits you), the grey tabby (see you next crate), the shark (respect for the timekeeping), the turtle, the drone, the tour boat, the bro on the hydrofoil, whoever wrote back, and the ships, which we are assured were there.
- **Credits:** card, logo, listing and block letters by zZ of ONEBAR, a crew named after the one bar of signal at the top of the palm and the one bar of music that every gag waits for. zZ is asleep. ONEBAR and zZ are made up.

<sub>Castaway is an unofficial remake inspired by the 1992 screensaver <i>Johnny Castaway</i>, which belongs to its owners; this project is not affiliated with them. Clark Development, PCBDescribe and FILE_ID.DIZ are named only to explain the format.</sub>

</details>
`;

// ---------------------------------------------------------------------------------------------
// 7. Checks, then write.
// ---------------------------------------------------------------------------------------------
function checkMarkdown(text) {
  if (/\u2014/.test(text)) throw new Error('an em dash crept in');
  const banned = /\b(crack|cracked|trainer|cheat|warez|keygen|pirate|rip|virus)\b/i;
  const plain = text.replace(/<!--[\s\S]*?-->/g, '').replace(/alt="[^"]*"/g, (m) => m); // alt text is checked too
  const hit = plain.match(banned);
  if (hit) throw new Error(`banned word in header text: ${hit[0]}`);
  // code blocks and <pre> blocks
  const blocks = [...text.matchAll(/<pre>\n([\s\S]*?)\n<\/pre>/g)].map((m) => m[1].split('\n'));
  const fences = [...text.matchAll(/```[a-z]*\n([\s\S]*?)\n```/g)].map((m) => m[1].split('\n'));
  for (const b of [...blocks, ...fences]) {
    for (const raw of b) {
      const l = raw.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      if (l.length > 80) throw new Error(`code line is ${l.length} wide: ${l}`);
      if (/\t/.test(l)) throw new Error('tab in a code block');
      if (/\s$/.test(l)) throw new Error(`trailing whitespace: ${JSON.stringify(l)}`);
      if (/[^\x20-\x7e]/.test(l)) throw new Error(`non-ASCII in a code block: ${JSON.stringify(l)}`);
    }
  }
}
checkMarkdown(md);
checkMarkdown(block.svg); // the SVG's description says the same things

fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, block.svg);
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} and ${path.relative(process.cwd(), OUT_SVG)} (${(block.svg.length / 1024).toFixed(1)} KB, ${block.slots} hidden letters)`);
