// Scene Release NFO header for the ULTRA-SATISFACTORY README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/ultra-satisfactory/src/01-nfo-release_opus_5.5.mjs
// It rewrites examples/ultra-satisfactory/01-nfo-release_opus_5.5.md. Edit this file, not the .md.
//
// The whole header is text: 80-column <pre> blocks drawn with CP437-era characters
// (blocks, shades and box drawing), so links and bold work inside the art. Every line is
// measured: the script refuses to write a line wider than 80 columns, a framed line that is
// not exactly 80, or a character outside the safe set, and it strips trailing whitespace.
//
// Every number in the copy is either one the app shows (140 items, 211 recipes, 88 alternates,
// 477 buildings by category, 5 phases and their parts, "Control Terminal v1.0" as its subtitle)
// or was checked against ultra_satisfactory/data.py: the three recipes in the field test, the
// Assembler being tier 2 at 15 MW, and 102 of the 333 structure entries having "ramp" in the
// name. Check again before changing one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', '01-nfo-release_opus_5.5.md');
const W = 80;

const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';

// ---------------------------------------------------------------- inline markup
// Lines are built as plain strings. Bold and links are zero-width marker characters,
// so widths can be measured exactly and the HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href = s) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const len = (s) => [...visible(s)].length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const padL = (s, n) => ' '.repeat(Math.max(0, n - len(s))) + s;
const center = (s, n = W) => {
  const left = Math.floor((n - len(s)) / 2);
  return padR(' '.repeat(Math.max(0, left)) + s, n);
};
// Left text and right text pushed to opposite ends of a field.
const spread = (l, r, n) => {
  if (len(l) + len(r) + 2 > n) throw new Error(`spread too wide (${len(l) + len(r) + 2} > ${n}): ${visible(l)} | ${visible(r)}`);
  return l + ' '.repeat(n - len(l) - len(r)) + r;
};
// "key ..... value" with dot leaders.
const kv = (k, v, keyWidth) => {
  if (len(k) > keyWidth - 3) throw new Error(`key "${visible(k)}" leaves fewer than 2 leader dots at width ${keyWidth}`);
  return `${k} ${'.'.repeat(keyWidth - len(k) - 1)} ${v}`;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (m, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');

// ---------------------------------------------------------------- the logo
// Two fonts, one character cell per "pixel": █ full, ▀ top half, ▄ bottom half.
// BIG: 7 rows, three-column strokes. For ULTRA.
const BIG = {
  U: ['███     ███', '███     ███', '███     ███', '███     ███', '███     ███', '███▄   ▄███', ' ▀███████▀ '],
  L: ['███       ', '███       ', '███       ', '███       ', '███       ', '███       ', '██████████'],
  T: ['███████████', '    ███    ', '    ███    ', '    ███    ', '    ███    ', '    ███    ', '    ███    '],
  R: ['█████████▄ ', '███    ▀███', '███     ███', '███    ▄███', '█████████▀ ', '███  ▀███▄ ', '███    ▀███'],
  A: [' ▄███████▄ ', '███▀   ▀███', '███     ███', '███████████', '███     ███', '███     ███', '███     ███'],
};
// WIDE: 5 rows, two-column strokes, six columns a letter. For SATISFACTORY, which then fills
// the line: 11 letters x 6 + the I x 2 + 11 one-column gaps = 79, plus one column of shadow.
const WIDE = {
  S: ['▄█████', '██    ', '▀████▄', '    ██', '█████▀'],
  A: ['▄████▄', '██  ██', '██████', '██  ██', '██  ██'],
  T: ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
  I: ['██', '██', '██', '██', '██'],
  F: ['██████', '██    ', '█████ ', '██    ', '██    '],
  C: ['▄█████', '██    ', '██    ', '██    ', '▀█████'],
  O: ['▄████▄', '██  ██', '██  ██', '██  ██', '▀████▀'],
  R: ['█████▄', '██  ██', '█████▀', '██ ▀█▄', '██  ██'],
  Y: ['██  ██', '██  ██', '▀████▀', '  ██  ', '  ██  '],
};
// The app's emblem, redrawn at two pixels per text row: a hexagon with a cog inside. 14 x 14.
// The cog is a 6 x 6 wheel with a 2 x 2 centre hole and a tooth north, south, east and west.
// It is drawn on text-row boundaries (pixel rows 4-5, 6-7, 8-9), so the gaps GitHub leaves
// between rows of blocks fall between its parts instead of through them.
const EMBLEM = [
  '.....####.....',
  '...###..###...',
  '.###......###.',
  '##....##....##',
  '##..######..##',
  '##..######..##',
  '##.###..###.##',
  '##.###..###.##',
  '##..######..##',
  '##..######..##',
  '##....##....##',
  '.###......###.',
  '...###..###...',
  '.....####.....',
];
if (EMBLEM.some((row, r) => row !== EMBLEM[EMBLEM.length - 1 - r] || row !== [...row].reverse().join(''))) throw new Error('emblem is not symmetric');

function renderLogo() {
  const ROWS = 14;
  const ULTRA_ROW = 0, SATIS_ROW = 8;
  const cells = Array.from({ length: ROWS }, () => new Array(W).fill(' '));
  const put = (word, font, x0, row0, gap) => {
    let x = x0;
    for (const ch of word) {
      font[ch].forEach((line, r) => [...line].forEach((c, k) => { if (c !== ' ') cells[row0 + r][x + k] = c; }));
      x += font[ch][0].length + gap;
    }
    return x - gap;
  };
  const ultraEnd = put('ULTRA', BIG, 0, ULTRA_ROW, 2);
  const satisEnd = put('SATISFACTORY', WIDE, 0, SATIS_ROW, 1);
  if (satisEnd !== W - 1) throw new Error(`SATISFACTORY ends at column ${satisEnd}, expected ${W - 1}`);
  const solid = cells.map((row) => row.map((c) => c !== ' '));

  // Chrome fade, the way scene logos did it: ULTRA runs solid, then two rows of dark shade,
  // then a last row of medium shade, and lands on a light shade drop shadow. SATISFACTORY
  // stays solid, which is the app's own split (tinted ULTRA, white SATISFACTORY) in one
  // colour. Half blocks in the faded rows become shade too, so no bright corner pokes out.
  const FADE = [[4, '▓'], [5, '▓'], [6, '▒']];
  for (const [r, shade] of FADE) for (let x = 0; x < W; x++) if (solid[ULTRA_ROW + r][x]) cells[ULTRA_ROW + r][x] = shade;

  // Drop shadow in light shade, one cell right and one down. ULTRA gets the full shadow.
  // SATISFACTORY only casts it below its baseline: with one-column letter gaps a side shadow
  // would weld the letters together.
  for (let r = 0; r < ROWS - 1; r++) for (let x = 0; x < W - 1; x++) {
    if (!solid[r][x] || solid[r + 1][x + 1]) continue;
    if (r >= SATIS_ROW && r !== SATIS_ROW + 4) continue;
    cells[r + 1][x + 1] = '░';
  }

  // Emblem, right of ULTRA, flush with the right edge.
  const ex = W - EMBLEM[0].length;
  if (ex < ultraEnd + 3) throw new Error('emblem collides with ULTRA');
  for (let r = 0; r < EMBLEM.length / 2; r++) for (let x = 0; x < EMBLEM[0].length; x++) {
    const t = EMBLEM[r * 2][x] === '#', b = EMBLEM[r * 2 + 1][x] === '#';
    if (t || b) cells[r][ex + x] = t && b ? '█' : t ? '▀' : '▄';
  }

  // The app's own subtitle, as a plate under the emblem.
  const plate = 'TERMiNAL v1.0';
  const px = ex + Math.floor((EMBLEM[0].length - plate.length) / 2);
  [...plate].forEach((c, k) => {
    if (cells[7][px + k] !== ' ') throw new Error('emblem plate collides with a shadow');
    cells[7][px + k] = c;
  });
  return cells.map((row) => row.join('').trimEnd());
}

// The tagline rides a conveyor belt: crates (■) on a belt (═), moving right (→).
function beltLine(text) {
  const side = Math.floor((W - len(text) - 4) / 2);
  const belt = (n) => [...'═■═══■═══■═══■═══'].slice(0, n - 1).join('') + '→';
  return center(`${belt(side)}  ${text}  ${belt(side)}`);
}

// ---------------------------------------------------------------- frames and boxes
// One joined double-line frame: two columns on top, one full-width section beneath.
function frame({ left, right, bottom, split = 38 }) {
  const a = split, b = W - 3 - a;
  const head = (t) => `══[ ${B(t)} ]`;
  const fill = (s, n) => s + '═'.repeat(n - len(s));
  const rows = Math.max(left.rows.length, right.rows.length);
  const cell = (s = '', n) => {
    if (len(s) > n - 2) throw new Error(`frame cell too wide (${len(s)} > ${n - 2}): ${visible(s)}`);
    return ' ' + padR(s, n - 1);
  };
  const out = ['╔' + fill(head(left.title), a) + '╦' + fill(head(right.title), b) + '╗'];
  for (let i = 0; i < rows; i++) out.push('║' + cell(left.rows[i], a) + '║' + cell(right.rows[i], b) + '║');
  out.push('╠' + fill(head(bottom.title), a) + '╩' + '═'.repeat(b) + '╣');
  for (const row of bottom.rows) out.push('║' + cell(row, W - 2) + '║');
  out.push('╚' + '═'.repeat(W - 2) + '╝');
  for (const l of out) if (len(l) !== W) throw new Error(`frame line is ${len(l)} cols: ${visible(l)}`);
  return out;
}
const DOUBLE = { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' };
const SINGLE = { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' };
function box(title, body, width, S = SINGLE, lead = 1) {
  const inner = width - 2;
  const head = `${S.h.repeat(lead)}[ ${B(title)} ]`;
  const out = [S.tl + head + S.h.repeat(inner - len(head)) + S.tr];
  for (const line of body) {
    if (len(line) > inner - 2) throw new Error(`box "${title}" line too wide (${len(line)} > ${inner - 2}): ${visible(line)}`);
    out.push(S.v + padR(` ${line}`, inner) + S.v);
  }
  out.push(S.bl + S.h.repeat(inner) + S.br);
  return out;
}
// Columns laid side by side; every piece is padded to its column width.
function columns(...cols) {
  const rows = Math.max(...cols.map(([, lines]) => lines.length));
  return Array.from({ length: rows }, (_, r) => cols.map(([w, lines]) => padR(lines[r] ?? '', w)).join(''));
}
function rule(label, ch = '─', at = 'center') {
  const mid = label ? `[ ${B(label)} ]` : '';
  if (at === 'left') return ch.repeat(2) + mid + ch.repeat(W - 2 - len(mid));
  const left = Math.floor((W - len(mid)) / 2);
  return ch.repeat(left) + mid + ch.repeat(W - left - len(mid));
}
function releaseRule(name, disks) {
  const left = '══[ ' + B(name) + ' ]';
  const right = '[ ' + disks + ' ]═══';
  return left + '═'.repeat(W - len(left) - len(right)) + right;
}
// A ruled table. widths are inner cell widths (without the one-space padding either side).
function table(widths, head, groups, indent = 2) {
  const pad = ' '.repeat(indent);
  const line = (l, m, r) => pad + l + widths.map((w) => '─'.repeat(w + 2)).join(m) + r;
  const row = (cellsIn) => pad + '│' + cellsIn.map((c, i) => {
    const s = c ?? '';
    if (len(s) > widths[i]) throw new Error(`table cell too wide (${len(s)} > ${widths[i]}): ${visible(s)}`);
    return ' ' + (typeof head[i] === 'object' && head[i].right ? padL(s, widths[i]) : padR(s, widths[i])) + ' ';
  }).join('│') + '│';
  const out = [line('┌', '┬', '┐'), row(head.map((h) => B(typeof h === 'object' ? h.text : h))), line('├', '┼', '┤')];
  groups.forEach((g, i) => {
    g.forEach((r) => out.push(row(r)));
    out.push(i === groups.length - 1 ? line('└', '┴', '┘') : line('├', '┼', '┤'));
  });
  return out;
}

// ---------------------------------------------------------------- the .nfo, first screen
const info = frame({
  left: {
    title: 'RELEASE iNFO',
    rows: [
      kv('release', B('ULTRA-SATISFACTORY'), 13),
      kv('type', 'companion app', 13),
      kv('for', 'the game Satisfactory', 13),
      kv('official', 'no. a fan project', 13),
      kv('protection', 'none. it\'s ' + A('Apache 2.0', 'LICENSE'), 13),
      kv('format', 'Python + Streamlit', 13),
      kv('price', '0. sleep not included', 13),
    ],
  },
  right: {
    title: 'PAYLOAD',
    rows: [
      kv('items', B('140') + ' craftable', 13),
      kv('recipes', B('211') + ' (88 alternates)', 13),
      kv('buildings', B('477') + ' player-buildable', 13),
      kv('machines', B('9') + ' that do the work', 13),
      kv('phases', B('5') + ', Space Elevator', 13),
      kv('runs on', '2nd monitor or browser', 13),
      kv('spaghetti', 'bring your own', 13),
    ],
  },
  bottom: {
    title: 'iNSTALL NOTES',
    rows: [
      spread(B('1.') + ' python -m pip install -r requirements.txt', 'Python 3.10+, repo root', 76),
      spread(B('2.') + ' python -m streamlit run app/app.py', 'serves http://localhost:8501', 76),
      spread(B('3.') + ' park it on monitor two. alt-tab responsibly.', 'more: ' + A('#run-it-locally'), 76),
      spread(B('or') + ' skip 1-3: ' + A(LIVE), 'live, no install', 76),
    ],
  },
});

// A five-column gutter with one arrow in it, level with the row that gets clicked.
const arrow = (row) => Array.from({ length: 6 }, (_, r) => (r === row ? ' ══→ ' : ''));
const flow = [
  rule('ONE CLiCK APART'),
  ...columns(
    [22, box('OBJECTiVES', [
      'phase 2 of 5 wants',
      B('Modular Frame') + ' x500',
      'Smart Plating x100',
      'and 2 more parts',
    ], 22)],
    [5, arrow(2)],
    [31, box('iTEMS', [
      'Reinforced Iron Plate 3/min',
      'Iron Rod ........... 12/min',
      '→ Modular Frame ..... 2/min',
      B('Assembler') + ' · 60 s · 15 MW',
    ], 31)],
    [5, arrow(4)],
    [17, box('BUiLDiNGS', [
      'Assembler',
      'tier 2, 15 MW',
      'what it costs',
      'what it makes',
    ], 17)],
  ),
  center('bold is a click. in the app every ingredient, product and machine is a link.'),
];

const main = [
  center('░▒▓█   ' + B('JUST ONE MORE BELT') + '   proudly presents   █▓▒░'),
  '',
  ...renderLogo(),
  beltLine('every recipe, building and objective, one click apart'),
  '',
  releaseRule('ULTRA-SATISFACTORY.Control.Terminal.v1.0.Apache2-J1MB', '01/01'),
  '',
  ...info,
  '',
  ...flow,
];

// ---------------------------------------------------------------- the site plan
// Original block art, one character per cell: a production line from the miner to the Space
// Elevator, standing on a conveyor belt. Generic shapes only, nothing traced from the game.
const SPRITES = [
  ['miner', [
    '        ',
    '        ',
    '        ',
    '   ▄▄   ',
    '   ██   ',
    '  ▄██▄  ',
    ' ▄█▀▀█▄ ',
    '▄█▀██▀█▄',
  ]],
  ['smelter', [
    '       ░▒░',
    '     ░▒░  ',
    '    ▒░    ',
    '   ██     ',
    '   ██     ',
    '▄▄▄██▄▄▄▄▄',
    '██▀▀▀▀▀▀██',
    '██ ░▒▒░ ██',
  ]],
  ['constructor', [
    '            ',
    '            ',
    '            ',
    '            ',
    '▄▄▄▄▄▄▄▄▄▄▄▄',
    '██▀▀▀▀▀▀▀▀██',
    '██ ■ ■■ ■ ██',
    '████████████',
  ]],
  ['assembler', [
    '                ',
    '                ',
    '                ',
    '   ▄█   ▄█   ▄█ ',
    ' ▄███ ▄███ ▄███ ',
    '████████████████',
    '██  ███  ███  ██',
    '████████████████',
  ]],
  ['elevator', [
    '    ██    ',
    '    ██    ',
    '   ▄██▄   ',
    '   ▀██▀   ',
    '    ██    ',
    '    ██    ',
    '  ▄████▄  ',
    '▄████████▄',
  ]],
];
function sitePlan() {
  const rows = SPRITES[0][1].length;
  for (const [name, art] of SPRITES) {
    if (art.length !== rows || art.some((l) => [...l].length !== [...art[0]].length)) throw new Error(`sprite "${name}" is not a rectangle`);
  }
  const widths = SPRITES.map(([, art]) => [...art[0]].length);
  const total = widths.reduce((a, b) => a + b, 0);
  const gap = Math.floor((W - 4 - total) / (SPRITES.length - 1));
  if (gap < 3) throw new Error('site plan sprites do not fit in 80 columns');
  const cells = Array.from({ length: rows + 2 }, () => new Array(W).fill(' '));
  // The belt: crates every fourth cell, heading right.
  for (let c = 1; c < W - 2; c++) cells[rows][c] = c % 4 === 2 ? '■' : '═';
  cells[rows][W - 2] = '→';
  let x = Math.floor((W - total - gap * (SPRITES.length - 1)) / 2);
  SPRITES.forEach(([name, art], i) => {
    art.forEach((line, r) => [...line].forEach((ch, k) => { if (ch !== ' ') cells[r][x + k] = ch; }));
    const lx = x + Math.floor((widths[i] - name.length) / 2);
    [...name].forEach((ch, k) => { cells[rows + 1][lx + k] = ch; });
    x += widths[i] + gap;
  });
  return cells.map((row) => row.join(''));
}

// ---------------------------------------------------------------- the rest of the .nfo
// Word-wrap text (bold/link markers have no width) with a first-line prefix and a hanging indent.
// Spaces inside a link are glued, so a link never breaks across lines (its underline would run
// through the indent).
const GLUE = '\u0000';
const glue = (s) => s.replace(/\u0003[^\u0004]*\u0004/g, (m) => m.replace(/ /g, GLUE));
const unglue = (s) => s.replace(/\u0000/g, ' ');
function wrap(text, width, first = '', rest = ' '.repeat(len(first))) {
  const out = [];
  let line = first;
  let empty = true;
  for (const word of glue(text).split(/\s+/)) {
    const candidate = empty ? line + word : `${line} ${word}`;
    if (!empty && len(candidate) > width) {
      out.push(line);
      line = rest + word;
    } else line = candidate;
    empty = false;
  }
  out.push(line);
  return out.map(unglue);
}
function centerWrap(items, width, sep = ' · ') {
  const out = [];
  let line = '';
  for (const item of items) {
    const candidate = line ? line + sep + item : item;
    if (len(candidate) > width && line) {
      out.push(center(line));
      line = item;
    } else line = candidate;
  }
  if (line) out.push(center(line));
  return out;
}
const section = (title) => ['', rule(title, '─', 'left'), ''];
const bullets = (items, mark = '+') => items.flatMap((t) => wrap(t, W - 2, `  ${mark} `, '    '));
// "key .... long value" where the value wraps under itself.
const kvWrap = (k, v, keyWidth) => wrap(v, W - 2, '  ' + kv(k, '', keyWidth), ' '.repeat(keyWidth + 3));

// Space Elevator phases exactly as the app's OBJECTIVES tab lists them, plus how each one feels.
const PHASES = [
  ['Automation basics', [['Smart Plating', 50], ['Versatile Framework', 100], ['Automated Wiring', 500]],
    ['belts still tidy.', 'enjoy it while it lasts.']],
  ['Logistics & steel', [['Automated Wiring', 500], ['Modular Frame', 500], ['Smart Plating', 100], ['Versatile Framework', 500]],
    ['the first spaghetti.', '"i\'ll tidy it up later."', 'you will not.']],
  ['Oil & computers', [['Versatile Framework', 2500], ['Modular Engine', 500], ['Adaptive Control Unit', 100]],
    ['pipes. so many pipes.', 'you own a whiteboard now.']],
  ['Nuclear & endgame', [['Assembly Director System', 1000], ['Magnetic Field Generator', 500], ['Nuclear Pasta', 100], ['Thermal Propulsion Rocket', 25]],
    ['yes, Nuclear Pasta is a', 'real part. we checked.', 'the spaghetti is canon.']],
  ['Alien tech & quantum', [['Biochemical Sculptor', 500], ['AI Expansion Server', 100], ['Neural-Quantum Processor', 100], ['Ballistic Warp Drive', 100]],
    ['daylight is a rumour.', 'the base has a skyline.', 'one more belt, though.']],
];
const phaseTable = table(
  [2, 25, 25, 5],
  ['##', 'phase', 'the elevator wants', { text: 'qty', right: true }],
  PHASES.map(([name, parts, mood], i) => parts.map(([part, qty], r) => [
    r === 0 ? String(i + 1).padStart(2, '0') : '',
    r === 0 ? B(name) : mood[r - 1] ?? '',
    part,
    `x${qty}`,
  ])),
);

const phases = [
  ...section('PHASE LiST').slice(1),
  ...wrap('the five Space Elevator phases, as the ' + B('OBJECTiVES') + ' tab lists them. pick one, see the parts and the counts, click a part for its recipe.', W - 2, '  ', '  '),
  '',
  ...phaseTable.map((l) => center(l.trim())),
  '',
  center('five phases. eighteen line items. one Space Elevator that never says thanks.'),
];

// The 477 buildings by category, as the app groups them.
const MANIFEST = [
  ['structure', 333], ['logistics', 59], ['decor', 26], ['power', 15], ['transit', 14],
  ['production', 9], ['special', 7], ['storage', 7], ['extraction', 7],
];
const manifestTotal = MANIFEST.reduce((n, [, c]) => n + c, 0);
if (manifestTotal !== 477) throw new Error(`building manifest adds up to ${manifestTotal}, not 477`);
if (PHASES.reduce((n, [, parts]) => n + parts.length, 0) !== 18) throw new Error('phase line items no longer add up to eighteen');
const bar = (n) => '■'.repeat(Math.max(1, Math.round((n / 333) * 50)));

const rest = [
  ...section('SiTE PLAN').slice(1),
  ...sitePlan(),
  '',
  center("artist's impression. yours has more spaghetti, and it is load-bearing."),
  ...section('FiELD TEST: A TYPiCAL 3 A.M.'),
  '  03:02  the elevator wants ' + B('Modular Frame') + '. click.',
  '         3 Reinforced Iron Plate + 12 Iron Rod → 2. Assembler, 60 s, 15 MW.',
  '  03:02  click ' + B('Reinforced Iron Plate') + '.',
  '         6 Iron Plate + 12 Screw → 1. Assembler, 12 s, 15 MW.',
  '  03:03  click ' + B('Screw') + '.',
  '         1 Iron Rod → 4 Screw. Constructor, 6 s, 4 MW.',
  '  03:03  click ' + B('Constructor') + '. it\'s a building. of course it\'s a building.',
  '  03:04  alt-tab back. lay just one more belt.',
  '  05:47  birds.',
  ...section('BUiLDiNG MANiFEST'),
  ...MANIFEST.map(([name, n]) => '  ' + kv(name, padL(String(n), 3), 14) + '  ' + bar(n)),
  '  ' + ' '.repeat(15) + '───',
  '  ' + kv('total', B(String(manifestTotal)), 14) + '  333 are structure pieces. 102 of those say "Ramp".',
  '',
  ...wrap('the 9 that do the actual work: Assembler, Blender, Constructor, Foundry, Manufacturer, Packager, Particle Accelerator, Refinery, Smelter.', W - 2, '  ', '  '),
  ...section('RELEASE NOTES'),
  ...bullets([
    'three tabs: ' + B('OBJECTiVES') + ', ' + B('iTEMS') + ', ' + B('BUiLDiNGS') + '. parts, ingredients and products open recipes. machines open buildings. the full tour is in ' + A('#whats-inside') + '.',
    'search is per keystroke. type "scr" and Screw is already on screen, judging you.',
    'it is one Streamlit file, ' + A('app/app.py') + ', with streamlit-aggrid doing the searchable grids.',
    'the live build is stlite: Streamlit running in your browser on WebAssembly. GitHub Actions republishes it on every push to main.',
    'it also deploys as a full Streamlit server on Modal (' + A('modal_app.py') + '). more in ' + A('#how-its-built') + '.',
  ]),
  ...section('PROTECTiON'),
  ...wrap('none. the code is ' + A('Apache 2.0', 'LICENSE') + ': read it, fork it, bolt a fourth tab on. the game data and the images keep their own licences, see ' + A('#data--credits') + '.', W - 2, '  ', '  '),
  ...section('REQUiREMENTS'),
  ...kvWrap('to run it', 'Python 3.10+ and two commands. or a browser and zero.', 13),
  ...kvWrap('to need it', 'one factory that got out of hand.', 13),
  ...kvWrap('the game', 'not included. this is a lookup tool. get Satisfactory from the people who made it.', 13),
  ...kvWrap('monitors', 'two is ideal. one and alt-tab works. a phone works.', 13),
  ...kvWrap('sleep', 'optional.', 13),
  ...section('KNOWN iSSUES'),
  ...bullets([
    'does not untangle your belts. it only tells you what they should be carrying.',
    'will not stop you starting "a small side factory".',
    'lookups take one click, so "i was checking a recipe" no longer covers a two hour absence.',
  ], '-'),
];

// ---------------------------------------------------------------- greetz
const meter = (n, w = 10) => '■'.repeat(n) + '·'.repeat(w - n);
// The intro tune as a four-channel tracker pattern (note, instrument, volume). Three machines
// play. Channel four is you, resting until the last row. Row 04 is the playhead.
const REST = '··· ·· ···';
const PATTERN = [
  ['C-2 01 v40', 'F-2 02 v30', 'C-5 03 v28', REST],
  [REST, REST, 'D#5 03 ···', REST],
  ['C-2 01 v28', 'F-2 02 ···', 'G-5 03 ···', REST],
  [REST, 'G#2 02 v30', 'C-6 03 ···', REST],
  ['C-2 01 v40', REST, 'A#5 03 v28', REST],
  [REST, 'A#2 02 v30', 'G-5 03 ···', REST],
  ['C-2 01 v28', 'A#2 02 ···', 'D#5 03 ···', REST],
  ['C-2 01 v40', 'C-3 02 v30', 'G-5 03 ···', 'C-1 04 v02'],
];
const CHANNELS = [['miner', 7], ['smelter', 6], ['assembler', 4], ['you', 1]];
const PLAYHEAD = 4;
const tracker = table(
  [2, 10, 10, 10, 10],
  ['##', ...CHANNELS.map(([name]) => name)],
  [PATTERN.map((row, i) => [String(i).padStart(2, '0'), ...row])],
).map((line, i) => {
  const r = i - 3; // three lines of table head come first
  if (r === PLAYHEAD) return line.replace(/\S.*$/, (m) => B(m));
  const side = r >= 0 && r < CHANNELS.length ? padR(CHANNELS[r][0], 10) + meter(CHANNELS[r][1], 8)
    : r === PLAYHEAD + 1 ? '(go to bed)' : '';
  return side ? `${line}  ${side}` : line;
});
const diz = box('FiLE_iD.DiZ', [
  center(B('ULTRA-SATiSFACTORY') + '  [01/01]', 35),
  'every recipe, building and Space',
  'Elevator objective, 1 click apart.',
  '140 items, 211 recipes,',
  '477 buildings, 5 phases, 0 keys.',
  'unofficial fan project. Apache 2.0.',
  center('released by J1MB, belt division', 35),
], 39, SINGLE, 2);
const field = (label, value) => padR(label, 8) + '[ ' + padR(value, 23) + ' ]';
const recipegen = box('J1MB RECiPEGEN v1.0', [
  field('item', B('Modular Frame')),
  field('needs', '3 Reinforced Iron Plate'),
  field('', '12 Iron Rod'),
  field('machine', 'Assembler, 60 s, 15 MW'),
  '',
  '[ Generate ]  [ Alt-tab ]  [ Exit ]',
  'generates recipes. never keys.',
], 39, DOUBLE, 2);

const greetz = [
  ...section('CREDiTS, THE TRUE KiND').slice(1),
  ...kvWrap(A('greeny/SatisfactoryTools', 'https://github.com/greeny/SatisfactoryTools'), 'the game data (data/data.json). none of this exists without it.', 28),
  ...kvWrap(A('the Satisfactory Wiki', 'https://satisfactory.wiki.gg'), 'the item and building images, under ' + A('CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/') + '.', 28),
  ...kvWrap('Coffee Stain Studios', 'made the game. not affiliated with this release in any way. we just can\'t stop playing it.', 28),
  ...section('GREETZ'),
  center('greetz ride the belt out to'),
  '',
  ...centerWrap([
    'the Manifold Mafia', 'the Load Balancer Liberation League', 'Spaghetti Logistics Ltd',
    'Power Shards Anonymous', 'the Foundation Alignment Society (world grid chapter)',
    'the Hypertube Cannon Test Pilots', 'the Blueprint Hoarders', 'Team "It Works, Don\'t Touch It"',
    'everyone whose temporary belt is now load-bearing',
    'every lizard doggo who dragged home something it shouldn\'t have',
    'whoever is alt-tabbed right now while a Manufacturer starves',
    'and you, at 3 a.m., saying "just one more belt"',
  ], 74),
  '',
  center('no greetz to clipping conveyors, or to the power grid at 99%.'),
  ...section('NOW PLAYiNG'),
  '  ♪ one_more_belt.xm · 4ch · 140 bpm, one per item · looping since phase 1',
  '',
  ...tracker,
  ...section('THE CREW'),
  '  ' + kv('code', 'one Streamlit file that got out of hand', 18),
  '  ' + kv('packer', 'stlite. the whole app, in a tab, on WebAssembly', 18),
  '  ' + kv('courier', 'GitHub Actions. ships on every push to main', 18),
  '  ' + kv('quality control', 'the Space Elevator. it counts. it always counts', 18),
  '  ' + kv('ascii', 'J1MB art division, drawn between belts', 18),
  '',
  ...columns([41, diz], [39, recipegen]),
  '',
  center('░▒▓█  J1MB: efficiency first. sleep is an alternate recipe.  █▓▒░'),
];

// ---------------------------------------------------------------- write + verify
// Printable ASCII plus the CP437-era glyphs that render single-width in GitHub's mono fonts.
const SAFE = /^[\x20-\x7e─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬░▒▓█▀▄▌▐■♪♫•·→]*$/u;
function verify(name, lines) {
  lines.forEach((l, i) => {
    const w = len(l);
    if (w > W) throw new Error(`${name} line ${i + 1} is ${w} cols: ${visible(l)}`);
    if (!SAFE.test(visible(l))) throw new Error(`${name} line ${i + 1} has a risky character: ${visible(l)}`);
    if (/—|–/.test(l)) throw new Error(`${name} line ${i + 1} has a dash the house style bans`);
  });
}
const clean = (lines) => lines.map((l) => l.replace(/\s+$/, ''));
const pre = (lines) => ['<pre>', ...clean(lines).map(toHtml), '</pre>'].join('\n');
const blocks = { main, phases, rest, greetz };
for (const [name, lines] of Object.entries(blocks)) verify(name, lines);

// Prose outside the art follows the target repo's house style: each line opens with the bolt.
const BOLT = '\u26a1';
const details = (summary, lines) => ['<details>', `<summary>${BOLT} ${summary}</summary>`, '', pre(lines), '', '</details>', ''];

const md = [
  '<!-- Header 01-nfo-release_opus_5.5 for ULTRA-SATISFACTORY. Generated by src/01-nfo-release_opus_5.5.mjs: edit that, not this. -->',
  '',
  pre(main),
  '',
  `${BOLT} **ULTRA-SATISFACTORY**, translated from .nfo: a companion app for the factory-building game *Satisfactory* that puts every recipe, building and Space Elevator objective one click apart. Three cross-linked tabs, **Objectives**, **Items** and **Buildings**, mean that "what goes into a Modular Frame again?" costs one alt-tab instead of one evening. [Open it live in your browser](${LIVE}) with nothing to install, or [run it locally](#run-it-locally) with two commands. Unofficial fan project, not affiliated with Coffee Stain Studios.`,
  '',
  ...details('<b>[ PHASE LiST ]</b> &nbsp;what the Space Elevator wants, all five phases', phases),
  ...details('<b>[ READ THE REST OF THE .NFO ]</b> &nbsp;site plan, 3 a.m. field test, building manifest, release notes, known issues', rest),
  ...details('<b>[ GREETZ ]</b> &nbsp;the real credits, the crew, the intro music and a FILE_ID.DIZ', greetz),
].join('\n');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ` + Object.entries(blocks).map(([n, l]) => `${n} ${l.length} lines`).join(', '));
