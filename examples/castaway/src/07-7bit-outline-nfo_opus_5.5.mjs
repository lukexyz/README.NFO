// 7-bit Outline NFO header for the Castaway README (style catalogue entry nfo-04).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/07-7bit-outline-nfo_opus_5.5.mjs
// It rewrites examples/castaway/07-7bit-outline-nfo_opus_5.5.md. Edit this file, not the .md.
//
// The style: the minority branch of PC release-scene NFOs (late 1990s to the 2010s) that drew
// with plain keyboard characters instead of CP437 blocks. A slanted outline logo in the Amiga
// manner, a rule through the letters' feet that ends in arrowheads, dot-leader field rows,
// headings letter-spaced with full stops and sunk in a notch between two small boxes, frames of
// pipes and underscores with one edge left open, and a closing rule carrying a slogan.
// Credited references (none of their art, names, slogans or tags is reproduced here): the
// RELOADED DOX infofile of 11/2009, the outline Razor 1911 logos by nerv (2009) and sns of SAC
// (1999), a Quartex NFO of 1997 and griskokare's Amiga-style tribute of 2013/14.
//
// Everything here is new: the crew (MILLPOND) and its waiting division, the artist tag (kmr),
// the alphabet, the sun, the palm, the raft and the ship. The header is 7-bit ASCII at 78 columns, so it reads
// the same in every monospace font and in both GitHub themes. The script refuses a line wider
// than 78 columns, a character outside printable ASCII or trailing whitespace, and it stops if
// the logo does not read back as CASTAWAY from its own bitmaps.
//
// HOW THE LOGO IS DRAWN
// Each letter is a small bitmap in sheared space: one bitmap row per text row, and every row
// sits one column further right than the row below it, which is what makes the letters lean.
// The outline is traced from the ink, not typed: a change from paper to ink along a row
// becomes a slash on that row, and a change between one row and the next becomes an
// underscore on the upper row. Letters are traced one at a time and their edges merged, so
// where two letters touch they share a single wall, as in the originals. Each roof starts with
// a spike (a slash and an opening bracket), and on the baseline the rule runs through the gaps
// between the feet and on into the artist's tag and an arrowhead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '07-7bit-outline-nfo_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 78; // the NFO page width

// Counts that move as the project grows. Checked on AS_OF, read-only, from D:/python/castaway:
//   python -B -c "import tomllib; print(len(tomllib.load(open('activities.toml','rb'))['activities']))"
//   find media/audio -name '*.wav' | wc -l      (also the file count in media/audio/audio_catalog.json)
// Re-check both and update these before the header goes into the real README.
const AS_OF = '2026-10-01';
const ACTIVITIES = 92;
const SOUND_FILES = 151;

// ---------------------------------------------------------------------------------------------
// 1. The alphabet. '#' is ink. Seven rows; stems three cells wide, counters two. The W's middle
//    stem only rises halfway, so it cannot be mistaken for the A beside it.
// ---------------------------------------------------------------------------------------------
const H = 7;
const GLYPHS = {
  C: ['########', '###.....', '###.....', '###.....', '###.....', '###.....', '########'],
  A: ['########', '###..###', '###..###', '########', '###..###', '###..###', '###..###'],
  S: ['########', '###.....', '###.....', '########', '.....###', '.....###', '########'],
  T: ['#########', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...'],
  W: ['###......###', '###......###', '###......###', '###..##..###', '###..##..###', '###..##..###', '############'],
  Y: ['###..###', '###..###', '###..###', '########', '..###...', '..###...', '..###...'],
};

// Trace a word. Returns H + 1 rows: row 0 is the roof line, rows 1..H the letters.
function outline(word, indent) {
  const V = new Set();
  const HZ = new Set();
  const starts = [];
  let s0 = 0;
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    const w = g[0].length;
    starts.push(s0);
    const ink = (y, s) => y >= 1 && y <= H && s >= 0 && s < w && g[y - 1][s] === '#';
    for (let y = 1; y <= H; y++) for (let s = 0; s <= w; s++) if (ink(y, s - 1) !== ink(y, s)) V.add(`${y},${s0 + s}`);
    for (let y = 1; y <= H + 1; y++) for (let s = 0; s < w; s++) if (ink(y - 1, s) !== ink(y, s)) HZ.add(`${y},${s0 + s}`);
    s0 += w; // no gap: the next letter's left wall is this letter's right wall
  }
  const K = H + 1 + indent;
  const rows = Array.from({ length: H + 1 }, () => Array(W + 8).fill(' '));
  for (const k of HZ) {
    const [y, s] = k.split(',').map(Number);
    rows[y - 1][s - y + K] = '_';
  }
  for (const k of V) {
    const [y, s] = k.split(',').map(Number);
    rows[y][s - y - 1 + K] = '/';
  }
  for (const s of starts) {
    const c = s + K - 1;
    if (rows[0][c] === '_') {
      rows[0][c] = '/';
      rows[0][c + 1] = '(';
    }
  }
  return rows.map((r) => r.join('').replace(/\s+$/, ''));
}

// Read the bitmaps back as a word, so a broken glyph table cannot ship silently.
function readBack(word) {
  const key = Object.fromEntries(Object.entries(GLYPHS).map(([k, g]) => [g.join('|'), k]));
  return [...word].map((ch) => key[GLYPHS[ch].join('|')]).join('');
}

// ---------------------------------------------------------------------------------------------
// 2. Markup. Lines are written with two tokens so widths are measured on the visible text:
//    {b:text} is bold, {a:href|text} is a link. Everything else is escaped for <pre>.
// ---------------------------------------------------------------------------------------------
const TOKEN = /\{b:([^{}]*)\}|\{a:([^|{}]*)\|([^{}]*)\}/g;
const vis = (line) => line.replace(TOKEN, (m, b, href, text) => (b !== undefined ? b : text));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function html(line) {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    out += esc(line.slice(last, m.index));
    if (m[1] !== undefined) out += `<b>${esc(m[1])}</b>`;
    else out += `<a href="${m[2]}">${esc(m[3])}</a>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}

const rep = (ch, n) => (n > 0 ? ch.repeat(n) : '');
const center = (s, w = W) => rep(' ', Math.floor((w - vis(s).length) / 2)) + s;
// Art blocks are written raw; a ¬ stands for a backtick, which a template literal cannot hold.
const art = (s) => s.raw[0].replace(/¬/g, '`').split('\n').slice(1, -1);

// Field row: value :..... LEFT.LABEL .. RIGHT.LABEL .....: value
// The two dots of the spine sit in the same columns on every row, so a stack of rows grows a
// seam down the middle of the page.
const SPINE = 38;
function field(lv, ll, rl, rv) {
  const left = `  ${lv} :`;
  const lDots = SPINE - 1 - vis(left).length - ll.length - 1;
  const right = `: ${rv}`;
  const rDots = W - (SPINE + 3) - rl.length - 1 - vis(right).length;
  if (lDots < 2 || rDots < 2) throw new Error(`field row too long: ${ll} / ${rl}`);
  return `${left}${rep('.', lDots)} ${ll} .. ${rl} ${rep('.', rDots)}${right}`;
}

// Notched heading: the rule runs into two small empty boxes, and between them it drops a row
// to make a notch. The title sits in the notch as letter-spaced capitals, the words joined by a
// full stop ("T H E . F A C T S"), as in the 2009 dox infofile.
const spaced = (t) => t.toUpperCase().split(' ').map((w) => [...w].join(' ')).join(' . ');
function notch(title) {
  const t = `  ${spaced(title)}  `;
  const x = Math.floor((W - t.length - 10) / 2);
  const top = `${rep('_', x)}.___.${rep(' ', t.length)}.___.${rep('_', W - x - t.length - 10)}`;
  const bot = `${rep(' ', x)}|___|${t}|___|`;
  return [top, bot];
}

// Frame: pipes and underscores, a full stop at two corners, the right-hand edge left open.
function frame(lines) {
  const out = [` .${rep('_', W - 4)}`];
  for (const l of lines) out.push(l === '' ? ' |' : ` |  ${l}`);
  out.push(` |${rep('_', W - 4)}.`);
  return out;
}

// Table in the older variant: pipes, hyphens, full-stop corners, labels right-aligned.
function table(head, rows, widths) {
  const cell = (s, w, right) => (right ? rep(' ', w - s.length) + s : s + rep(' ', w - s.length));
  const line = (cells) => `  | ${cells.map((c, i) => cell(c, widths[i], i === 0)).join(' : ')} |`;
  const rule = (a, b, c) => `  ${a}${widths.map((w) => rep('-', w + 2)).join(b)}${c}`;
  return [rule('.', '.', '.'), line(head), rule('|', '+', '|'), ...rows.map(line), rule("'", "'", "'")];
}

// Closing rule: an apostrophe at one end, the slogan in square brackets, an arrowhead at the other.
function closing(slogan) {
  const mid = `[ ${slogan} ]`;
  const left = Math.floor((W - 2 - mid.length) / 2);
  return `'${rep('-', left)}${mid}${rep('-', W - 2 - left - mid.length)}>`;
}

// Word-wrap visible text (tokens count as their visible text and are never split).
function wrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (vis(next).length > width && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Definition list: key, a dot leader, then the description wrapped under itself.
function deflist(items, col = 38) {
  const out = [];
  for (const [k, d] of items) {
    const head = `  ${k} `;
    const dots = col - 1 - vis(head).length;
    if (dots < 2) throw new Error(`deflist key too long: ${vis(k)}`);
    const body = wrap(d, W - col);
    out.push(`${head}${rep('.', dots)} ${body[0]}`);
    for (const b of body.slice(1)) out.push(`${rep(' ', col)}${b}`);
  }
  return out;
}

const side = (left, right, lw) => {
  const n = Math.max(left.length, right.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const l = left[i] || '';
    const r = right[i] || '';
    out.push(`  ${l}${rep(' ', lw - vis(l).length)}${r}`.replace(/\s+$/, ''));
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// 3. The logo block
// ---------------------------------------------------------------------------------------------
const WORD = 'CASTAWAY';
if (readBack(WORD) !== WORD) throw new Error('logo does not read back as CASTAWAY');
const LOGO_INDENT = 2;
const logo = outline(WORD, LOGO_INDENT);

// The rule passes through the letters' feet: on the baseline every gap between the feet
// becomes rule, and it runs on past the last letter into the artist's tag and an arrowhead.
function footRule(base, tag) {
  const chars = base.padEnd(W, ' ').split('');
  const first = chars.findIndex((c) => c !== ' ');
  chars[0] = '<';
  for (let i = 1; i < first; i++) chars[i] = '-';
  for (let i = first; i < W - 1; i++) if (chars[i] === ' ') chars[i] = '-';
  const at = W - 3 - tag.length;
  for (let i = 0; i < tag.length; i++) chars[at + i] = tag[i];
  chars[W - 1] = '>';
  return chars.join('');
}
logo[H] = footRule(logo[H], ' kmr ');


// ---------------------------------------------------------------------------------------------
// 4. The page
// ---------------------------------------------------------------------------------------------
const LINKS = {
  musing: 'MUSING.md',
  toml: 'activities.toml',
  serve: 'tools/serve.py',
  schedule: 'tools/schedule.py',
  audio: 'tools/make_audio.py',
  demo: 'tools/render_demo.py',
  web: 'web/index.html',
  local: 'http://127.0.0.1:8765/',
};
const A = (k, text = LINKS[k]) => `{a:${LINKS[k]}|${text}}`;

// The island, drawn for this header. A tall palm with a segmented trunk on a small hump of
// sand; her, very small, with a coconut; the raft bobbing at the shore; and, far off on the
// horizon behind her back, a ship going past. The horizon breaks round the trunk.
const ISLAND = art`
         _.--._    _.--._        \|/
      .-'  __ ¬\  /' __  ¬-.     -O-
    .'  .-'  ¬-.\/.-'  ¬-.  ¬.   /|\
   /  .'    _.-'||¬-._    ¬.  \
     /    .'    ))    ¬.    ¬
         '     ((       ¬      |\
                ))           __|_\_
 -- --- ----- -((- ---- ---- \____/
       o     _.-))-._
   .__/|o_.-'        ¬-._
---'                     ¬(_)(_)(_)-
`;
const INTRO = [
  '',
  'One small island, one tall palm, one',
  'raft. She sits in cream headphones and',
  'nods to the beat. Every few minutes,',
  'something happens: a coconut, a bottle,',
  'a turtle, a shark that also nods. Then',
  'she goes back to nodding. For 10 hours.',
  '',
  '{b:Out at sea, a ship sails past.}',
  '{b:She is busy with a coconut.}',
];

const top = [
  center('.:  {b:M.I.L.L.P.O.N.D}  :.  waiting division  .:  presents, eventually  :.'),
  '',
  ...logo.map((l) => `{b:${l}}`),
  center('{b:Castaway.Ten.Hours.Of.Almost.Nothing.1080p30-MILLPOND}'),
  center('a lo-fi island video in the spirit of a 1992 desert-island screensaver'),
  '',
  ...notch('what happens'),
  ...side(INTRO, ISLAND, 40),
  '',
  ...notch('the facts'),
  field('10:00:00', 'RUN.LENGTH', 'SEED', '1992'),
  field(String(ACTIVITIES), 'ACTIVITIES', 'STATUS', 'in dev'),
  field('every 3 s', 'ONE.BAR', 'GAGS.START.ON', 'the next one'),
  field(String(SOUND_FILES), 'SOUND.FILES', 'MADE.FROM', 'code, only'),
  field('0', 'SAMPLES', 'NIGHT.SCENES', '0, by policy'),
  field(`python ${A('serve')}`, 'RUN', 'OPEN', A('local')),
  '',
  closing('nothing happens. on purpose. mostly.'),
];

const schedule = [
  ...notch('the schedule'),
  '',
  `  ${A('toml')} lists ${ACTIVITIES} activities (as of ${AS_OF}). Each has`,
  '  step-by-step beats, how long it lasts and how often it comes round.',
  '',
  ...table(
    ['tier', 'comes round every', 'in a typical 10-hour run'],
    [
      ['regular', '2 to 5 minutes', 'about 155'],
      ['occasional', '12 to 25 minutes', 'about 30'],
      ['rare', '30 to 60 minutes', 'about 13'],
      ['super rare', '3 to 6 hours', 'about 2, and never more than 3'],
      ['chained', 'on cue from another', 'about 20 follow-ups'],
    ],
    [10, 19, 30],
  ),
  '    typical: the median of 200 simulated runs, as the file itself says.',
  '',
  field('1992', 'SEED', 'SAME.SEED', 'same schedule'),
  field('about 1/3', 'BUSY', 'IDLING', 'the rest'),
  '',
  '  Lanes let things overlap. She has one lane. The cat, the turtle, the sea',
  '  and sky, the shore and the kumara patch each have their own. So a ship',
  '  can sail past while she is busy with a coconut, and she does not look',
  '  up. That is the whole joke. It has been the whole joke since 1992.',
  '',
  `  python ${A('schedule')} ...... validates the file, simulates 10 hours`,
];

const gags = [
  ...notch('the gags'),
  ...frame([
    '',
    'message in a bottle ..... washes straight back. later, a different',
    '                          bottle brings a reply',
    'delivery drone .......... the parcel is another pair of headphones',
    'sea turtle .............. crawls up beside her. they both doze off',
    'stray cat ............... grey tabby, white chest. arrives on a crate,',
    '                          climbs the palm, naps. one day it floats off',
    '                          again. another day it comes back',
    'signal hunt ............. one bar of signal, at the top of the palm',
    'shark ................... wears headphones. nods to the beat',
    'tour boat ............... selfies, with her in the background. nobody',
    '                          offers a lift',
    'coconut ................. falls on a hermit crab. then walks off, with',
    '                          the crab wearing it',
    'hydrofoil bro ........... waves a shaka, carves off',
    'she could leave any time  walks out over the water, comes back with',
    '                          an iced coffee. never explained',
    'waving for rescue ....... once in a long while she spots a ship and',
    '                          waves like mad. it honks back. it sails on',
    'bushcraft ............... fire by friction, a hammock, a lookout up',
    '                          the palm, spear fishing',
    'kumara .................. planted. grows over the course of the video',
    'everyday ................ coconut sipping, fishing, jogging laps, a',
    '                          sandcastle the tide takes',
    '',
  ]),
];

const sound = [
  ...notch('sound'),
  '',
  field(String(SOUND_FILES), 'SOUND.FILES', 'SAMPLES', '0'),
  field('0', 'RECORDINGS', 'THIRD.PARTY.LICENCES', '0'),
  field('60 s', 'THEME', 'TEMPO', '80 BPM'),
  field('F major', 'KEY', 'CHORDS', 'ii-V-I-vi'),
  field('20', 'BARS', 'ONE.BAR', 'exactly 3 s'),
  field('-14 LUFS', 'LOUDNESS', 'TRUE.PEAK', '-1 dBTP or below'),
  '',
  '  Electric piano, a kalimba lead, soft drums, and the ticks, pops and faint',
  '  hiss of a vinyl record that does not exist. All of it is synthesized by',
  `  ${A('audio')}: no samples, no borrowed loops, no recordings, so no`,
  '  third-party licence applies. The theme is a seamless 60-second loop, and',
  '  so is the ocean. Levels are adjustable in master and per routine.',
  '',
  field('nobody', 'HEARD.BY', 'REVIEWS', 'pending'),
];

const tools = [
  ...notch('the tools'),
  '',
  ...deflist([
    [`python ${A('serve')}`, `the renderer: a web page with live preview and export to a YouTube-ready MP4, at ${A('local')}`],
    [`python ${A('schedule')}`, 'validates the schedule and simulates a 10-hour run'],
    [`python ${A('demo')} --dev`, 'a dev reel of every activity with a heads-up display (the older Python reference renderer)'],
    [A('web'), 'the page itself'],
    [A('musing'), 'the working notes'],
  ], 40),
  '',
  '  Plain ES modules, no build step, no npm packages. The browser encodes',
  '  frame-exact H.264 with WebCodecs, 68 to 78 frames a second at 1080p30 in',
  '  Chrome, and the server mixes the sound and joins the two into an MP4.',
  '  Hard cuts and stepped movement are the motion defaults.',
  '',
  ...notch('greetz'),
  '',
  '  to the hermit crab, who wears a coconut well. to the grey tabby, who',
  '  came on a crate and leaves on one. to the shark in headphones, who keeps',
  '  better time than most drummers. to the drone, for the spare headphones.',
  '  to the turtle, for the nap. to the tour boat, for the photos. to the',
  '  bro on the hydrofoil: shaka received. and to every ship that sailed past',
  '  while she was busy. she never knew you were there.',
  '',
  ...notch('respect'),
  '',
  '  to a certain 1992 desert-island screensaver, for proving that a very',
  '  small island and a lot of waiting can be enough. this is an unofficial',
  '  remake inspired by it, with its own character, art and music, and no',
  '  affiliation with it or with its owners.',
  '',
  '  logo, palm, raft, ship and leader rows by kmr of MILLPOND. 7-bit ascii',
  '  in 78 columns. no blocks were harmed in the making of this file. the',
  '  crew, its waiting division and the tag kmr exist only in this file.',
  '',
  closing('the ship has already gone'),
];

// ---------------------------------------------------------------------------------------------
// 5. Checks and output
// ---------------------------------------------------------------------------------------------
function check(lines, where) {
  lines.forEach((l, i) => {
    const v = vis(l);
    if (v.length > W) throw new Error(`${where} line ${i + 1} is ${v.length} columns: ${v}`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`${where} line ${i + 1} has a non-ASCII character: ${v}`);
    if (/\s$/.test(v)) throw new Error(`${where} line ${i + 1} has trailing whitespace: ${v}`);
  });
}
const pre = (lines, where) => {
  check(lines, where);
  return `<pre>\n${lines.map(html).join('\n')}\n</pre>`;
};
const details = (summary, lines, where) => ['<details>', `<summary>${summary}</summary>`, '', pre(lines, where), '', '</details>'].join('\n');

const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(top, 'top'),
  '',
  '**Castaway** (working title) is a stationary-frame lo-fi video for YouTube, in the spirit of the 10-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music on her headphones, and every so often something happens, always on the next bar of the music. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*. Every sound in it is synthesized from code.',
  '',
  `To run it: \`python tools/serve.py\`, then open ${LINKS.local} for the live preview and the MP4 export. The schedule lives in [activities.toml](activities.toml) and the working notes in [MUSING.md](MUSING.md). In development: no video has been published yet.`,
  '',
  details(`<b>${spaced('the schedule')}</b> &nbsp;${ACTIVITIES} activities, four tiers, and a ship she never sees`, schedule, 'schedule'),
  '',
  details(`<b>${spaced('the gags')}</b> &nbsp;what interrupts the nodding`, gags, 'gags'),
  '',
  details(`<b>${spaced('sound')}</b> &nbsp;${SOUND_FILES} files, 0 samples, 0 listeners so far`, sound, 'sound'),
  '',
  details(`<b>${spaced('the tools')}</b> &nbsp;how it renders, greetz and respect`, tools, 'tools'),
  '',
].join('\n');

fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${md.length} bytes)`);
