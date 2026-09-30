// Scene Release NFO header for the Dance Vision README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/dance-vision/src/01-nfo-release_opus_5.5.mjs
// It rewrites examples/dance-vision/01-nfo-release_opus_5.5.md. Edit this file, not the .md.
//
// The whole header is text: an 80-column <pre> drawn with CP437-era characters
// (blocks, shades and box drawing). Every line is measured: the script refuses to
// write a line wider than 80 columns or one with a character outside the safe set,
// and it strips trailing whitespace.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', '01-nfo-release_opus_5.5.md');
const W = 80;

// ---------------------------------------------------------------- inline markup
// Lines are built as plain strings. Bold and links are zero-width marker characters,
// so widths can be measured exactly and the HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const len = (s) => [...visible(s)].length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const center = (s, n) => {
  const left = Math.floor((n - len(s)) / 2);
  return padR(' '.repeat(Math.max(0, left)) + s, n);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (m, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');

// ---------------------------------------------------------------- the logo font
// 7 text rows per letter. Each cell is two vertical pixels: █ both, ▀ top, ▄ bottom.
const FONT = {
  D: ['█████████▄ ', '███    ▀███', '███     ███', '███     ███', '███     ███', '███    ▄███', '█████████▀ '],
  A: [' ▄███████▄ ', '███▀   ▀███', '███     ███', '███████████', '███     ███', '███     ███', '███     ███'],
  N: ['████▄   ███', '█████▄  ███', '███▀██▄ ███', '███ ▀██▄███', '███  ▀█████', '███   ▀████', '███    ▀███'],
  C: [' ▄████████', '███▀      ', '███       ', '███       ', '███       ', '███▄      ', ' ▀████████'],
  E: [' ▄████████', '███▀      ', '███       ', '████████  ', '███       ', '███▄      ', ' ▀████████'],
  V: ['███     ███', '███     ███', '███▄   ▄███', '▀███▄ ▄███▀', ' ▀███▄███▀ ', '  ▀█████▀  ', '    ▀█▀    '],
  I: ['███', '███', '███', '███', '███', '███', '███'],
  S: [' ▄█████████', '███▀       ', '███        ', '▀█████████▄', '        ███', '       ▄███', '█████████▀ '],
  O: [' ▄███████▄ ', '███▀   ▀███', '███     ███', '███     ███', '███     ███', '███▄   ▄███', ' ▀███████▀ '],
};

// A pixel canvas with two pixels per text row.
function makeLayer(rows) {
  return Array.from({ length: rows * 2 }, () => new Array(W).fill(0));
}
function stampCells(layer, cells, x0, row0) {
  cells.forEach((line, r) => {
    [...line].forEach((c, k) => {
      if (c === '█' || c === '▀') layer[(row0 + r) * 2][x0 + k] = 1;
      if (c === '█' || c === '▄') layer[(row0 + r) * 2 + 1][x0 + k] = 1;
    });
  });
}
function stampWord(layer, word, x0, row0, gap = 2) {
  let x = x0;
  for (const ch of word) {
    stampCells(layer, FONT[ch], x, row0);
    x += FONT[ch][0].length + gap;
  }
  return x - gap;
}
function stampPixels(layer, art, x0, y0) {
  art.forEach((line, y) => [...line].forEach((c, x) => { if (c === '#') layer[y0 + y][x0 + x] = 1; }));
}

// A stick figure raising the roof, one leg kicked out, in half-block pixels: 13 wide, 16 tall.
// Goalpost arms and a bent leg on purpose: a plain \o/ with splayed legs reads as a letter X
// next to VISION, and a disco point reads as a K.
const DANCER = [
  '##.........##',
  '.#.........#.',
  '.#...###...#.',
  '.#...###...#.',
  '.##...#...##.',
  '..#########..',
  '......#......',
  '......#......',
  '......#......',
  '.....###.....',
  '....#...#....',
  '...#.....#...',
  '...#......##.',
  '..#........#.',
  '..#.........#',
  '.##.........#',
];

function renderLogo() {
  const ROWS = 16;
  const letters = makeLayer(ROWS);
  const figure = makeLayer(ROWS);
  const endDance = stampWord(letters, 'DANCE', 2, 0);
  stampWord(letters, 'VISION', 17, 8);
  stampPixels(figure, DANCER, 1, 16);

  // Drop shadow: one column right and down, in light shade. It only falls outside the letters
  // (flood-filled from the edges), so counters in D, A, O stay clean and a one-column gap
  // separates each letter from the next.
  const H = ROWS * 2;
  const outside = Array.from({ length: H }, () => new Array(W).fill(0));
  const todo = [];
  for (let x = 0; x < W; x++) todo.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) todo.push([0, y], [W - 1, y]);
  while (todo.length) {
    const [x, y] = todo.pop();
    if (x < 0 || y < 0 || x >= W || y >= H || outside[y][x] || letters[y][x]) continue;
    outside[y][x] = 1;
    todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const shadow = makeLayer(ROWS);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!letters[y][x]) continue;
    for (const [dx, dy] of [[1, 1], [1, 2]]) {
      const X = x + dx, Y = y + dy;
      if (Y < H && X < W && outside[Y][X]) shadow[Y][X] = 1;
    }
  }

  const grid = Array.from({ length: ROWS }, () => new Array(W).fill(' '));
  for (let r = 0; r < ROWS; r++) for (let x = 0; x < W; x++) {
    const t = letters[r * 2][x] || figure[r * 2][x];
    const b = letters[r * 2 + 1][x] || figure[r * 2 + 1][x];
    // The bottom two rows of each word are dithered for that chrome-fade look.
    const fade = letters[r * 2][x] && letters[r * 2 + 1][x] && r % 8 >= 5;
    if (fade) grid[r][x] = '▓';
    else if (t && b) grid[r][x] = '█';
    else if (t) grid[r][x] = '▀';
    else if (b) grid[r][x] = '▄';
    else if (shadow[r * 2][x] || shadow[r * 2 + 1][x]) grid[r][x] = '░';
  }

  // Spectrum analyser to the right of DANCE: LED segments fade from █ to ░ with height.
  const bars = [4, 7, 5, 6, 3];
  const shadeFor = (level) => (level >= 5 ? '░' : level >= 3 ? '▒' : level >= 2 ? '▓' : '█');
  bars.forEach((h, i) => {
    const x = endDance + 3 + i * 3;
    for (let level = 0; level < h; level++) grid[6 - level][x] = grid[6 - level][x + 1] = shadeFor(level);
  });
  return grid.map((row) => row.join('').trimEnd());
}

// ---------------------------------------------------------------- boxes
const DOUBLE = { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' };
const SINGLE = { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' };
function box(title, body, width, S = DOUBLE) {
  const inner = width - 2;
  const head = `${S.h.repeat(2)}[ ${B(title)} ]`;
  const out = [S.tl + head + S.h.repeat(inner - len(head)) + S.tr];
  for (const line of body) {
    if (len(line) > inner - 2) throw new Error(`box "${title}" line too wide (${len(line)} > ${inner - 2}): ${visible(line)}`);
    out.push(S.v + padR(` ${line}`, inner) + S.v);
  }
  out.push(S.bl + S.h.repeat(inner) + S.br);
  return out;
}
function sideBySide(a, b, gap = 2) {
  const wa = Math.max(...a.map(len));
  const rows = Math.max(a.length, b.length);
  return Array.from({ length: rows }, (_, i) => padR(a[i] ?? '', wa) + ' '.repeat(gap) + (b[i] ?? ''));
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
const kv = (k, v, keyWidth = 14) => `${k} ${'.'.repeat(keyWidth - len(k) - 1)} ${v}`;

// ---------------------------------------------------------------- the .nfo
const logoLines = renderLogo();

const release = box('RELEASE iNFO', [
  kv('cracked by', 'O.L.F. (E8 division)'),
  kv('supplier', 'your cracked phone'),
  kv('cracker', 'on-device pose model'),
  kv('protection', 'none whatsoever'),
  kv('requires', 'a browser. no app'),
  kv('account', 'lol, no'),
  kv('format', '33 pose landmarks'),
  kv('video out', B('0 bytes') + '. just joints'),
  kv('phones', 'up to 6 per room'),
  kv('released', '2026-09-13'),
], 39);

const install = box('iNSTALL NOTES', [
  B('1.') + ' npm run party',
  B('2.') + ' open http://127.0.0.1:8787/',
  '   (it opens Controller)',
  B('3.') + ' hit Open TV studio, drag it',
  '   onto the telly, Fill the TV',
  B('4.') + ' scan the room QR on your phone',
  B('5.') + ' prop it up against the telly',
  B('6.') + ' step back. dance. no refunds.',
  B('7.') + ' repeat till the neighbours knock',
  '   more: ' + A('#run-the-app', '#run-the-app'),
], 39);

// Columns laid side by side; every piece is padded to its column width.
function columns(...cols) {
  const rows = Math.max(...cols.map(([, lines]) => lines.length));
  return Array.from({ length: rows }, (_, r) => cols.map(([w, lines]) => padR(lines[r] ?? '', w)).join(''));
}
const tinyBox = (w, lines) => [
  '┌' + '─'.repeat(w - 2) + '┐',
  ...lines.map((l) => '│ ' + padR(l, w - 4) + ' │'),
  '└' + '─'.repeat(w - 2) + '┘',
];
const flow = [
  rule('HOW iT WORKS'),
  ...columns(
    [12, ['   o   cam', '  /|\\  ───→', '  / \\', '  you']],
    [16, tinyBox(16, [B('PHONE'), 'pose model', 'camera stays'])],
    [8, [' joints', ' ═════→']],
    [14, tinyBox(14, [B('RELAY'), 'node + ws', 'on your PC'])],
    [8, [' joints', ' ═════→']],
    [22, tinyBox(22, [B('TELLY') + '      \\o/  o/', '/studio     |  /|', 'three.js   / \\ / \\'])],
  ),
  center('video that leaves your phone: ' + B('0 bytes') + '. the relay carries joints, not pixels.', W),
];

const main = [
  center('·  •  ·   ' + B('THE OVERGROUND LIBERATION FRONT') + '   proudly presents   ·  •  ·', W),
  '',
  ...logoLines,
  center('♪  your phone is the mocap rig  ·  your telly is the dance floor  ♪', W),
  '',
  releaseRule('Dance.Vision.2026.Incl.QR.Keymaker-OLF', '01/01'),
  '',
  ...sideBySide(release, install),
  '',
  ...flow,
];

// ---------------------------------------------------------------- the rest of the .nfo
// Word-wrap text (bold/link markers are fine: they have no width) to a width, with a first-line prefix and a hanging indent.
function wrap(text, width, first = '', rest = ' '.repeat(len(first))) {
  const out = [];
  let line = first;
  let empty = true;
  for (const word of text.split(/\s+/)) {
    const candidate = empty ? line + word : `${line} ${word}`;
    if (!empty && len(candidate) > width) {
      out.push(line);
      line = rest + word;
    } else line = candidate;
    empty = false;
  }
  out.push(line);
  return out;
}
function centerWrap(items, width, sep = ' · ') {
  const out = [];
  let line = '';
  for (const item of items) {
    const candidate = line ? line + sep + item : item;
    if (len(candidate) > width && line) {
      out.push(center(line, W));
      line = item;
    } else line = candidate;
  }
  if (line) out.push(center(line, W));
  return out;
}
const section = (title) => ['', rule(title, '─', 'left'), ''];
const bullets = (items) => items.flatMap((t) => wrap(t, W - 2, '  + ', '    '));

const rest = [
  ...section('WHAT\'S iN THE BOX').slice(1),
  '  ' + kv(B('/controller'), 'the PC remote. library, playback, players, settings', 18),
  '  ' + kv(B('/studio'), 'the telly. three.js room, music, choreography, relay', 18),
  '  ' + kv(B('/camera.html'), 'the phone. camera + pose model. the QR lands here', 18),
  '  ' + kv(B('/mapper'), 'dance map editor. waveform, move picker, publish', 18),
  ...section('RELEASE NOTES'),
  ...bullets([
    'you turn up as a stick figure next to a backing crew who idle like they are queueing for a club, then dance once the music actually starts.',
    'six East London venues, each with a spotlight moment: every minute or so a 10 second countdown names a dancer, then they get the camera, a spin and a cheering crew. the Midnight Studio stays the default. press V on the telly to cycle.',
    'YouTube dance videos can be downloaded, reviewed and mapped into editable choreography in /mapper. see ' + A('YOUTUBE_WORKFLOW.md', 'YOUTUBE_WORKFLOW.md') + '.',
    'camera pixels never leave the phone. the relay carries landmarks, and phones get room state back, never each other\'s poses.',
  ]),
  ...section('PROTECTiON'),
  '  none. no DRM, no login, no video uploads. the only thing tracking you is you.',
  ...section('REQUiREMENTS'),
  '  ' + kv('the PC', 'Node + npm, a browser, an HDMI cable', 13),
  '  ' + kv('the telly', 'anything with an HDMI port', 13),
  '  ' + kv('the phones', 'a browser with a camera that reaches the PC over', 13),
  '  ' + ' '.repeat(14) + 'https. plain http on the LAN will not open the camera.',
  '  ' + ' '.repeat(14) + 'setup: ' + A('docs/MULTIPLAYER.md', 'docs/MULTIPLAYER.md'),
  '  ' + kv('dignity', 'optional', 13),
  ...section('HiSTORY'),
  '  ' + kv('2021', 'Unity prototype: 3 players on webcams, instructor on the wall', 13),
  '  ' + kv('2026-09-13', 'first browser build. one webcam, on-device, 18 fps', 13),
  '  ' + kv('2026-09', 'phones, the telly, dance maps, six venues. you are here', 13),
];

// Tracker pattern: the chiptune in the keygen you never had to run.
function tracker() {
  const cell = (s) => ` ${s} `;
  const rows = [
    ['C-2 01 v40', 'C-3 02 ···', 'E-5 03 v30', 'C-6 04 v18'],
    ['··· ·· ···', '··· ·· ···', 'G-5 03 ···', '··· ·· ···'],
    ['··· ·· ···', 'C-3 02 ···', 'B-5 03 ···', 'C-6 04 v10'],
    ['··· ·· ···', '··· ·· ···', 'E-6 03 ···', '··· ·· ···'],
    ['C-2 01 v40', 'G-2 02 ···', 'E-5 03 v30', 'C-6 04 v18'],
    ['··· ·· ···', '··· ·· ···', 'G-5 03 ···', '··· ·· ···'],
    ['··· ·· ···', 'A#2 02 ···', 'B-5 03 ···', 'C-6 04 v10'],
    ['··· ·· ···', '··· ·· ···', 'D-6 03 ···', 'C-6 04 v10'],
  ];
  const playing = 4;
  const heads = ['ch1 kick', 'ch2 bass', 'ch3 lead', 'ch4 hats'];
  const meters = [7, 9, 5, 3];
  // LED meters use ■ rather than shades: Windows draws ░▒▓ from a taller fallback font.
  const meter = (n, w = 10) => '■'.repeat(n) + '·'.repeat(w - n);
  const out = [
    '  ♪ now playing: olf-keygen.xm ─ "Last Overground Home" ─ 4ch ─ 125 bpm',
    '',
    '  ┌────┬' + heads.map(() => '─'.repeat(12)).join('┬') + '┐',
    '  │ ## │' + heads.map((h) => cell(padR(h, 10))).join('│') + '│',
    '  ├────┼' + heads.map(() => '─'.repeat(12)).join('┼') + '┤',
  ];
  rows.forEach((r, i) => {
    const num = String(i).padStart(2, '0');
    const body = `│ ${num} │` + r.map(cell).join('│') + '│';
    const side = i < heads.length ? `  ${heads[i].slice(4)} ${meter(meters[i])}` : '';
    out.push('  ' + (i === playing ? B(body) : body) + side);
  });
  out.push('  └────┴' + heads.map(() => '─'.repeat(12)).join('┴') + '┘');
  return out;
}

const diz = box('FiLE_iD.DiZ', [
  center(B('DANCE ViSiON 2026') + '  [01/01]', 34),
  'phone = mocap rig. telly = floor.',
  '33 landmarks out. 0 bytes of video.',
  'up to 6 phones. no app. no account.',
  center('cracked by O.L.F. (E8 division)', 34),
], 40, SINGLE);
const keygen = box('OLF KEYGEN v17', [
  'name    [ your stage name      ]',
  'serial  [ NONE-NEEDED-0BYTES   ]',
  '',
  '[ Generate ] [ Scan QR ] [ Exit ]',
  '♪ last_overground_home.xm',
], 38);

const greetz = [
  ...section('GREETZ').slice(1),
  center('greetz fly out to', W),
  '',
  ...centerWrap([
    'the Kingsland Road Krumpers', 'the Dalston Junction Jivers', 'Mare Street Moonwalkers',
    'Homerton Hip Swingers', 'the London Fields Lockers', 'the Shoreditch Shufflers (ironically)',
    'Clapton Pond Poppers', 'the Bethnal Green Breakdance Appreciation Society',
    'the pigeons of Ridley Road (best footwork in E8)', 'every chicken shop still open at 2am',
    'the last Overground home', 'whoever propped their phone on a pint glass',
    'and your nan, who absolutely has moves',
  ], 72),
  '',
  center('respect to the stick figures: no faces, no names, all heart.', W),
  center('no greetz to the bloke who says "i don\'t dance". you do now, mate.', W),
  ...section('NOW PLAYiNG'),
  ...tracker(),
  ...section('THE CREW'),
  '  ' + kv('cracker', 'the pose model. it did all the work', 17),
  '  ' + kv('supplier', 'your phone. it did not consent to this', 17),
  '  ' + kv('courier', 'the websocket relay', 17),
  '  ' + kv('quality control', 'the telly', 17),
  '  ' + kv('ascii', 'O.L.F. art division, somewhere off Mare Street', 17),
  '',
  ...sideBySide(diz, keygen),
  '',
  center('░▒▓█  O.L.F. ─ we don\'t crack software, we crack hips  █▓▒░', W),
];

// ---------------------------------------------------------------- write + verify
// Printable ASCII plus the CP437-era glyphs that render single-width in GitHub's mono fonts.
const SAFE = /^[\x20-\x7e─│┌┐└┘├┤┬┴┼═║╔╗╚╝░▒▓█▀▄▌▐■♪♫•·→]*$/u;
function verify(name, lines) {
  lines.forEach((l, i) => {
    const w = len(l);
    if (w > W) throw new Error(`${name} line ${i + 1} is ${w} cols: ${visible(l)}`);
    if (!SAFE.test(visible(l))) throw new Error(`${name} line ${i + 1} has a risky character: ${visible(l)}`);
  });
}
const clean = (lines) => lines.map((l) => l.replace(/\s+$/, ''));
const pre = (lines) => ['<pre>', ...clean(lines).map(toHtml), '</pre>'].join('\n');
for (const [name, lines] of Object.entries({ main, rest, greetz })) verify(name, lines);

const md = [
  '<!-- Header 01-nfo-release_opus_5.5. Generated by examples/dance-vision/src/01-nfo-release_opus_5.5.mjs: edit that, not this. -->',
  '',
  pre(main),
  '',
  '**Dance Vision**, translated from .nfo: your phone becomes a motion-capture rig and your telly becomes a dance floor. Scan a QR code, prop the phone against the TV, and you turn up as a stick figure in a shared room with everyone else who joined. The pose model runs in the phone\'s browser and only joint positions travel to the PC, so there is no app, no account, and no video ever leaves your phone. The TV side, Studio, is just another browser window you drag onto the telly.',
  '',
  '<details>',
  '<summary><b>[ READ THE REST OF THE .NFO ]</b> &nbsp;what\'s in the box, release notes, requirements, history</summary>',
  '',
  pre(rest),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>[ GREETZ ]</b> &nbsp;plus the keygen music, the crew and a FILE_ID.DIZ</summary>',
  '',
  pre(greetz),
  '',
  '</details>',
  '',
].join('\n');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: main ${main.length} lines, rest ${rest.length}, greetz ${greetz.length}`);
