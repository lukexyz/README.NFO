// Text-zine issue header for the Castaway README (style catalogue entry hack-01).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/75-text-zine-header_opus_5.5.mjs
// It rewrites examples/castaway/75-text-zine-header_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// Hacker text zines (the Phrack lineage, 1985 to now) ship as bundles of numbered plain-text
// files, and every file opens with the same centred masthead and a "file N of M" line, so any
// one file identifies the whole issue. The conventions borrowed here, as the catalogue reads
// them off the real issues:
//   - the masthead: a name between double equals signs, centred, and two lines below it a
//     centred hex line "Volume 0x.., Issue 0x.., File #0x.. of 0x.." (hex since 2000);
//   - the stack of eight 75-column bars, each "|=" + hyphens + "=|", text bars carrying
//     "=[ text ]=" centred in the hyphen run, in the 2016 order: blank, title, blank, author,
//     contact, blank, date, blank;
//   - flush-left "--[ Heading" section titles, never closed;
//   - the 2016 contents form: two-space indent, hex index, title, dot leader, the author at
//     the right, a blank line between rows, a long title wrapping with its leader below;
//   - a FIGlet-style 6-row outline wordmark in underscores, pipes, slashes and parentheses;
//   - in the folded files, the older and sister forms, one per file: the 1998-99 "---["
//     article line with longer hyphen runs for lower headings (file 0x03), the 1996 article
//     header with the title between two rows of capital X (0x04), a sister zine's flush-left
//     "File #N of M" and "Released:" lines over a centred, underlined title (0x06), the 1985
//     sponsor-board logo with a number-and-speed line and "Presents...." (0x07), and the 1996
//     ".oO name Oo." bubble, letter-spaced issue name between 20-underscore rules and a credits
//     block with right-aligned role labels (0x08);
//   - the file ends with an ASCII-armoured block and a final bar with "[ EOF ]" at its left.
// Credited references, of which only the layout grammar is used (no names, masthead wording,
// logo, department names or text): Phrack issues 1, 49, 53-58, 69 and 72; LOD/H Technical
// Journal 1; 40Hex 1. The armoured block at the end is NOT a key: it is a bottle. Its body is
// base64 of a short note (decode it), with a real CRC-24 checksum line, as armour has.
//
// Everything named here is invented: the Tideline Desk (the zine's staff), and the
// departments Washback, Table of Tides, Tidewrack (with its "In the offing" box), Signal and
// Noise and Running Aground, and the Palm Top, the sponsor "board" at the top of the palm
// with one bar of signal. The wordmark letterforms, the palm logo and the cat are drawn for
// this header (the face has rounded parenthesis terminals on C, S, T and Y).
// Castaway is Luke's own project; the jokes are about it and nothing else.
//
// THE OUTPUT is 7-bit ASCII inside <pre>, at most 75 columns, with <b> and <a> only. The
// script refuses a line wider than 75 columns, a character outside printable ASCII, a tab or
// trailing whitespace, a glyph whose rows differ in width, an em dash in the prose, and a few
// words the brief keeps out of the text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '75-text-zine-header_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 75; // the page width of every file in the issue

// ---------------------------------------------------------------------------------------------
// 0. Facts this issue quotes, in one place (checked against D:/python/castaway on 2026-10-01).
// ---------------------------------------------------------------------------------------------
const FILES = 8; // files in the issue: the visible header plus seven folds
const hex = (n, pad = 2) => '0x' + n.toString(16).padStart(pad, '0');
const RUN_SECONDS = 10 * 3600; // 10:00:00
const SEED = 1992;
const ACTIVITIES_ON_DATE = 94; // len(activities) on 2026-10-01, read with tomllib
const TIERS = [
  // name, every (min, max) in seconds, words, median per 10 h (200 simulated runs)
  ['regular', 120, 300, '2 to 5 min', 155],
  ['occasional', 720, 1500, '12 to 25 min', 30],
  ['rare', 1800, 3600, '30 to 60 min', 13],
  ['super rare', 10800, 21600, '3 to 6 hours', 2],
];

// ---------------------------------------------------------------------------------------------
// 1. Small helpers
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const art = (s) => s.replace(/^\r?\n/, '').replace(/\r?\n$/, '').split(/\r?\n/);
// Inline markup for text lines: **bold** becomes <b>, [text](href) becomes <a href>.
// Widths are measured on the plain text, so markup costs no columns.
// Link text may not contain "[", so a bracket just before a link stays plain text.
const MARK = /\*\*(.+?)\*\*|\[([^[\]\n]+)\]\(([^)\s]+)\)/g;
const plain = (line) => line.replace(MARK, (m, b, t) => (b !== undefined ? b : t));
const len = (line) => plain(line).length;
function html(line) {
  let out = '';
  let last = 0;
  line.replace(MARK, (m, b, t, href, at) => {
    out += esc(line.slice(last, at));
    if (b !== undefined) out += `<b>${esc(b)}</b>`;
    else out += `<a href="${href}">${esc(t)}</a>`;
    last = at + m.length;
    return m;
  });
  return out + esc(line.slice(last));
}
const centre = (s, width = W) => ' '.repeat(Math.max(0, Math.floor((width - len(s)) / 2))) + s;
const right = (s, width = W) => ' '.repeat(Math.max(0, width - len(s))) + s;
const spaced = (word, gap = 1) => word.split('').join(' '.repeat(gap));

// Hard-wrap a paragraph (markup-aware: never splits inside ** ** or [ ]( )).
function wrap(text, width = 72, indent = '', first = indent) {
  const tokens = [];
  const re = /\*\*.+?\*\*\S*|\[[^\]\n]+\]\([^)\s]+\)\S*|\S+/g;
  let m;
  while ((m = re.exec(text))) tokens.push(m[0]);
  const lines = [];
  let cur = first;
  let curLen = first.length;
  let empty = true;
  for (const t of tokens) {
    const tl = len(t);
    if (!empty && curLen + 1 + tl > width) {
      lines.push(cur);
      cur = indent + t;
      curLen = indent.length + tl;
    } else {
      cur += (empty ? '' : ' ') + t;
      curLen += (empty ? 0 : 1) + tl;
    }
    empty = false;
  }
  lines.push(cur);
  return lines;
}
const para = (text, width = 72, indent = '') => wrap(text, width, indent);

// ---------------------------------------------------------------------------------------------
// 2. The zine's grammar: masthead, hex line, bars, headings, contents rows, EOF bar
// ---------------------------------------------------------------------------------------------
const NAME = 'Castaway';
const masthead = (file) => [
  centre(`==**${NAME}**==`),
  '',
  centre(`Volume 0x00, Issue 0x01, File #${hex(file)} of ${hex(FILES)}`),
];
// One bar: "|=" + 71 inner columns + "=|". A text bar centres "=[ text ]=" in the hyphen run.
function bar(text = null, boldText = false) {
  const inner = W - 4;
  if (text === null) return '|=' + '-'.repeat(inner) + '=|';
  const shown = boldText ? `**${text}**` : text;
  const tok = `=[ ${shown} ]=`;
  const t = len(tok);
  if (t > inner - 4) throw new Error(`bar text too long: ${text}`);
  const l = Math.floor((inner - t) / 2);
  return '|=' + '-'.repeat(l) + tok + '-'.repeat(inner - t - l) + '=|';
}
const bars = (items) => items.map((it) => (Array.isArray(it) ? bar(it[0], true) : bar(it)));
// A tag bar, tag at the left end of the run: "|=[ 0x01 ]=-----...-----=|"
function tagBar(tag) {
  const head = `|=[ ${tag} ]=`;
  return head + '-'.repeat(W - len(head) - 2) + '=|';
}
const EOF_BAR = tagBar('EOF');
const h = (title) => `--[ ${title}`;

// A contents row, 2016 form: "  0x01  Title ......... author", the author ending at column W.
// A title too long for one line wraps, and the leader goes on the second line.
function tocRow(n, title, author) {
  const lead = `  ${hex(n)}  `;
  const room = W - lead.length - len(author) - 5;
  const out = [];
  let line = title;
  if (len(title) > room) {
    const words = title.split(' ');
    let first = '';
    // break early enough that the second line carries a few words, not one
    while (words.length && len(first + ' ' + words[0]) <= W - lead.length - 15) {
      first = (first ? first + ' ' : '') + words.shift();
    }
    out.push(lead + first);
    line = words.join(' ');
  }
  const pre = (out.length ? ' '.repeat(lead.length) : lead) + line + ' ';
  const dots = W - len(pre) - len(author) - 1;
  if (dots < 3) throw new Error(`no room for a leader: ${title}`);
  out.push(pre + '.'.repeat(dots) + ' ' + author);
  return out;
}

// Right-aligned labels to a colon column (the 1996 credits block).
function labelled(rows, col) {
  const out = [];
  for (const [label, value] of rows) {
    const head = ' '.repeat(Math.max(0, col - label.length)) + label + ' : ';
    const lines = wrap(value, W - 2, ' '.repeat(head.length), head);
    out.push(...lines);
  }
  return out;
}
// "name ......... value", the value starting at a fixed column.
function dotted(rows, at, indent = '  ') {
  const out = [];
  for (const [name, value] of rows) {
    const head = indent + name + ' ';
    const dots = at - head.length - 1;
    if (dots < 2) throw new Error(`no room for dots: ${name}`);
    out.push(...wrap(value, W - 2, ' '.repeat(at), head + '.'.repeat(dots) + ' '));
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 3. The wordmark: a 6-row outline face drawn for this header. Parentheses round the
//    terminals of C, S, T and Y; A has a round head; W is two posts with a tent between.
// ---------------------------------------------------------------------------------------------
const FACE = {
  C: String.raw`
   ____
  / ___)
 / /
( (
 \ \___
  \____)`,
  A: String.raw`
  ___
 / _ \
| |_| |
|  _  |
| | | |
|_| |_|`,
  S: String.raw`
  ____
 / ___)
( (__
 \__ \
 ___) )
(____/ `,
  T: String.raw`
 _____
(_   _)
  | |
  | |
  | |
  |_|  `,
  W: String.raw`
 _       _
| |     | |
| |  _  | |
| | / \ | |
| |/ _ \| |
|___/ \___|`,
  Y: String.raw`
 _     _
( \   / )
 \ \_/ /
  \   /
   | |
   |_|   `,
};
function wordmark(word, gap = 1) {
  const out = Array(6).fill('');
  for (const ch of word) {
    // Glyph rows are padded to the glyph's widest row (editors eat trailing spaces).
    const rows = art(FACE[ch]);
    if (rows.length !== 6) throw new Error(`glyph ${ch} is not 6 rows`);
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((r, i) => (out[i] += r.padEnd(w) + ' '.repeat(gap)));
  }
  const width = Math.max(...out.map((r) => r.trimEnd().length));
  const left = ' '.repeat(Math.floor((W - width) / 2));
  return out.map((r) => left + r.trimEnd());
}

// ---------------------------------------------------------------------------------------------
// 4. The hexdump of an hour: one byte per minute, the character is what started in it.
//    Illustrative only: the four timers' gaps, rolled with a seeded generator (mulberry32),
//    not a real run of the project's scheduler. The rarer tier wins a shared minute.
// ---------------------------------------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function illustrativeHour(seed, hour) {
  const rnd = mulberry32(seed);
  const marks = { regular: 'r', occasional: 'o', rare: 'R' };
  const rank = { '.': 0, r: 1, o: 2, R: 3 };
  const minutes = Array(60).fill('.');
  for (const [name, lo, hi] of TIERS.slice(0, 3)) {
    let t = Math.floor(rnd() * hi); // a timer already running when the hour starts
    while (t < (hour + 1) * 3600) {
      if (t >= hour * 3600) {
        const m = Math.floor((t - hour * 3600) / 60);
        if (rank[marks[name]] > rank[minutes[m]]) minutes[m] = marks[name];
      }
      t += lo + Math.floor(rnd() * (hi - lo + 1));
    }
  }
  return minutes;
}
function hexdump(bytes) {
  const out = [];
  for (let off = 0; off < bytes.length; off += 16) {
    const row = bytes.slice(off, off + 16);
    const hx = row.map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'));
    const a = hx.slice(0, 8).join(' ');
    const b = hx.slice(8).join(' ');
    let line = off.toString(16).padStart(4, '0') + '  ' + a.padEnd(23) + '  ' + b.padEnd(23);
    line += '  |' + row.join('') + '|';
    out.push(line);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 5. The bottle: an ASCII-armoured block in the shape of the one zines end with. It is not a
//    key. The body is base64 of a note, wrapped at 64, and the "=" line is a real CRC-24
//    (init 0xB704CE, poly 0x1864CFB) of the note, base64-encoded, as armour does it.
// ---------------------------------------------------------------------------------------------
function crc24(buf) {
  let crc = 0xb704ce;
  for (const byte of buf) {
    crc ^= byte << 16;
    for (let i = 0; i < 8; i++) {
      crc <<= 1;
      if (crc & 0x1000000) crc ^= 0x1864cfb;
    }
  }
  return crc & 0xffffff;
}
function bottle(note) {
  const buf = Buffer.from(note, 'ascii');
  const b64 = buf.toString('base64');
  const body = b64.match(/.{1,64}/g);
  const c = crc24(buf);
  const sum = Buffer.from([(c >> 16) & 255, (c >> 8) & 255, c & 255]).toString('base64');
  // round trip, so a typo can never ship an undecodable bottle
  if (Buffer.from(body.join(''), 'base64').toString('ascii') !== note) throw new Error('bottle leaks');
  return [
    '-----BEGIN MESSAGE IN A BOTTLE-----',
    'Version: Cork 0x01',
    'Comment: not a key. a bottle. it will probably be back.',
    '',
    ...body,
    '=' + sum,
    '-----END MESSAGE IN A BOTTLE-----',
  ];
}

// ---------------------------------------------------------------------------------------------
// 6. File 0x01: the part everyone sees
// ---------------------------------------------------------------------------------------------
const L = (href, text = href) => `[${text}](${href})`;
const SERVE = L('tools/serve.py');
const LOCAL = L('http://127.0.0.1:8765/');

const file01 = [
  ...masthead(1),
  '',
  ...bars([
    null,
    ['Introduction, In Which Almost Nothing Happens'],
    null,
    'Luke, for the Tideline Desk',
    'c/o the top of the palm (one bar, on a good day)',
    null,
    'October 1, 2026 (daytime, as always)',
    null,
  ]),
  '',
  ...wordmark('CASTAWAY').map((r) => `**${r}**`),
  '',
  centre(spaced('ten hours . one palm . no plot', 1)),
  '',
  h('Introduction'),
  '',
  ...para(
    `Welcome to issue ${hex(1)}. Volume ${hex(0)}, because nothing is released yet.`,
  ),
  '',
  ...para(
    `**Castaway** is a ten-hour lo-fi video for YouTube: one tiny island, one tall palm, one ` +
      `raft, and a young woman in cream headphones with ${hex(RUN_SECONDS, 4)} seconds to fill. ` +
      `She idles. She nods to the music. Every so often, on the next bar, something happens: ` +
      `her bottle washes straight back, a drone delivers more headphones, a coconut walks off ` +
      `worn by a hermit crab. Then she goes back to nodding. That is the main attraction.`,
  ),
  '',
  ...para(
    `An unofficial remake inspired by the 1992 screensaver Johnny Castaway. Sunny, ` +
      `hand-painted, always daytime, and every sound synthesized from code. In development: ` +
      `nothing is published yet, so this issue is early. The rest of it is paperwork.`,
  ),
  '',
  `    $ python ${SERVE}        then open ${LOCAL}`,
  '',
  h('Table of contents'),
  '',
  ...tocRow(1, 'Introduction', 'Tideline Desk'),
  '',
  ...tocRow(2, 'Washback: Letters That Came Straight Back', 'the sea'),
  '',
  ...tocRow(3, 'Table of Tides: The Schedule, in Hex', L('activities.toml')),
  '',
  ...tocRow(4, 'Tidewrack: Things That Washed Up', 'the tide'),
  '',
  ...tocRow(5, 'Profile on the Cat', 'the cat (dictated)'),
  '',
  ...tocRow(6, 'Signal and Noise: Every Sound, From Code', L('tools/make_audio.py')),
  '',
  ...tocRow(7, 'Running Aground: How to Run It', SERVE),
  '',
  ...tocRow(8, 'Greets, Credits, and a Message in a Bottle That Will Probably Come Back', 'everyone'),
];

// ---------------------------------------------------------------------------------------------
// 7. File 0x02: Washback. Letters arrive by bottle; replies go in square brackets.
// ---------------------------------------------------------------------------------------------
function letter(n, text, reply) {
  return [
    tagBar(hex(n)),
    '',
    ...para(text, 72, '  '),
    '',
    ...wrap(reply + ' ]', 72, '    ', '  [ '),
    '',
  ];
}
const file02 = [
  ...masthead(2),
  '',
  ...bars([null, ['Washback: Letters That Came Straight Back'], null, 'the sea', null]),
  '',
  ...para(
    'All correspondence for this desk arrives by bottle, and most of it is ours. Letters ' +
      'are printed as they washed up. Replies are in square brackets, which is how you can ' +
      'tell we are being serious.',
  ),
  '',
  ...letter(
    1,
    'Hello? Is anybody out there? I am on a very small island with one palm.',
    'This letter washed straight back to its sender, in its own bottle. We are counting it ' +
      'as a letter to the editor. A different bottle brings a real reply, later in the video. ' +
      'Keep writing.',
  ),
  ...letter(
    2,
    'Does anything actually happen?',
    'Yes. Every 2 to 5 minutes, something small. Every 12 to 25, something odd. About once ' +
      'an hour, a set piece. Every 3 to 6 hours, something big. She is busy about a third of ' +
      `the time, and the other two thirds are the point. See file ${hex(3)}.`,
  ),
  ...letter(
    3,
    'When does it get dark?',
    'It does not. Always daytime is a project rule. The sun has been informed and has not ' +
      'objected.',
  ),
  ...letter(
    4,
    'What is she listening to?',
    'A seamless 60-second loop at 80 BPM in F major, synthesized from code like every other ' +
      `sound here. Nobody has heard it yet. She nods anyway. See file ${hex(6)}.`,
  ),
  ...letter(
    5,
    'Where can I watch it?',
    'Nowhere yet. No video has been published and there is no link. You can run it ' +
      `yourself (file ${hex(7)}) and watch it at ${LOCAL}, which is as local as it gets.`,
  ),
  ...letter(
    6,
    'Is this the old screensaver?',
    'No. It is an unofficial remake inspired by the small-island routines of Johnny ' +
      'Castaway (1992), which belongs to its owners. New island, new castaway, new art, new ' +
      'code. Same idea, though: wait long enough and something happens.',
  ),
  ...letter(
    7,
    'Is the cat coming back?',
    `Yes, another time. See file ${hex(5)}. Please do not ask the cat.`,
  ),
];

// ---------------------------------------------------------------------------------------------
// 8. File 0x03: Table of Tides, under the 1998-99 "---[" article line
// ---------------------------------------------------------------------------------------------
const hourBytes = illustrativeHour(0x7c8, 3);
const tierRows = TIERS.map(([name, lo, hi, words, per]) => {
  const span = `${hex(lo, 0)} to ${hex(hi, 0)}`;
  return '  ' + name.padEnd(12) + span.padEnd(18) + words.padEnd(14) + `~${hex(per)}`.padEnd(7) + `(${per})`;
});
const file03 = [
  `---[  ${NAME}   Volume 0x00, Issue 0x01, Oct 1st 2026, file ${hex(3)} of ${hex(FILES)}`,
  '',
  '',
  '-------------------------[  **Table of Tides: The Schedule, in Hex**',
  '',
  '',
  `--------[  ${L('activities.toml')}, transcribed by the Tideline Desk`,
  '',
  '',
  ...para(
    `Everything she and her visitors can do lives in ${L('activities.toml')}: ` +
      `${hex(ACTIVITIES_ON_DATE)} activities on 2026-10-01 (${ACTIVITIES_ON_DATE}, and more ` +
      'arrive every few hours). Each tier keeps its own timer. When one goes off, an activity ' +
      'from that tier is picked by weight, from those free to go. If two tiers are due at ' +
      'once, the rarer one wins.',
  ),
  '',
  '  tier        every (seconds)   that is       per 10 h',
  '  ----------  ----------------  ------------  -------------',
  ...tierRows,
  '  chained     never on a timer: started by another activity ending',
  '',
  ...para(
    `Per-10-hour counts are the median of ${hex(200)} (200) simulated runs, plus about ` +
      `${hex(20)} chained follow-ups. Super rare: ${hex(3)} at most per run. Decimal in ` +
      'brackets, for readers who are not on an island.',
    72,
    '  ',
  ),
  '',
  h('Notes from the tide office'),
  '',
  ...wrap(
    `Every activity starts on the next bar of the music: every ${hex(3)} seconds. The gags ` +
      'land on the beat.',
    72, '    ', '  - ',
  ),
  ...wrap(
    'Lanes let things overlap. She has one lane; the cat, the turtle, the sea and sky, and ' +
      'the shore each have their own. So a ship can cross while she is busy with a coconut. ' +
      'The ship waits for her to get busy first. It has manners.',
    72, '    ', '  - ',
  ),
  ...wrap(
    'She is busy about a third of the time. In hex that is 0x0.5555..., which repeats ' +
      'forever, much like the theme.',
    72, '    ', '  - ',
  ),
  ...wrap(
    `Default run: ${hex(RUN_SECONDS, 4)} seconds (10:00:00), seed ${hex(SEED, 3)} (${SEED}). ` +
      `Check it and simulate one: python ${L('tools/schedule.py')}`,
    72, '    ', '  - ',
  ),
  '',
  h('A hexdump of an hour'),
  '',
  ...para(
    'One byte per minute; each byte is what started in that minute. Illustrative: the ' +
      'regular, occasional and rare timers rolled with a seeded coin, not a real run of the scheduler.',
  ),
  '',
  ...hexdump(hourBytes),
  '',
  '  2e "." idle, nodding   72 "r" regular   6f "o" occasional   52 "R" rare',
];

// ---------------------------------------------------------------------------------------------
// 9. File 0x04: Tidewrack, under the 1996 article header (title between rows of X)
// ---------------------------------------------------------------------------------------------
function item(n, head, text) {
  return [`[${hex(n)}] **${head}**`, ...para(text, 72, '       '), ''];
}
const XROW = 'X'.repeat(W);
const file04 = [
  ...masthead(4),
  '',
  XROW,
  '',
  centre('**Tidewrack: Things That Washed Up**'),
  '',
  centre('compiled by the tide, which takes most of it back'),
  '',
  XROW,
  '',
  ...para(
    'Things that turn up on the island, in the order the desk found them. Every one of ' +
      'them starts on the beat. None of them are rescue.',
  ),
  '',
  ...item(1, 'BOTTLE RETURNED TO SENDER',
    'She throws a message in a bottle. It washes straight back. Much later, a different ' +
      'bottle brings a reply. Correspondence is open.'),
  ...item(2, 'PARCEL DELIVERED BY AIR',
    'A delivery drone lowers a parcel. Inside: another pair of headphones.'),
  ...item(3, 'TURTLE, VISITING', 'A sea turtle comes ashore. No further business.'),
  ...item(4, 'CAT, ARRIVING BY CRATE',
    `A grey tabby with a white chest. Climbs the palm. Naps. See file ${hex(5)}.`),
  ...item(5, 'SIGNAL LOCATED',
    'One bar, at the very top of the palm. She has to climb for it. This issue was sent ' +
      'from there.'),
  ...item(6, 'SHARK, IN HEADPHONES', 'A shark surfaces wearing headphones and nods to the beat.'),
  ...item(7, 'TOURISM', 'A tour boat of selfie-takers passes. She is in all of them.'),
  ...item(8, 'COCONUT LEAVES ISLAND ON FOOT',
    'A coconut falls on a hermit crab. Then the coconut walks off, with the crab wearing it.'),
  ...item(9, 'SHE COULD LEAVE ANY TIME',
    'She walks out over the water and comes back with an iced coffee. Nobody asks.'),
  ...item(10, 'HYDROFOIL', 'A bro on an electric hydrofoil waves a shaka and carves off.'),
  ...item(11, 'BUSHCRAFT',
    'Fire by friction. A hammock. A lookout up the palm. Spear fishing.'),
  ...item(12, 'AGRICULTURE', 'She plants a kumara. It grows over the course of the video.'),
  ...item(13, 'EVERYDAY',
    'Coconut sipping, fishing, jogging laps, waving for rescue, and a sandcastle that the ' +
      'tide takes.'),
  h('In the offing'),
  '',
  ...para(
    'Visible from the shore, or coming soon, which is what the phrase means either way. ' +
      'Scene life: 26 entries, 4 always-on effects and 22 timed events. Built so far: shore ' +
      'waves and drifting cloud shadows. Planned: distant birds, planes with vapour trails, ' +
      'whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower (in daylight).',
  ),
];

// ---------------------------------------------------------------------------------------------
// 10. File 0x05: Profile on the Cat
// ---------------------------------------------------------------------------------------------
// The subject, photographed where it is usually found.
const CAT = art(String.raw`
                                  z
                          /\_/\     z
                         ( -.- )_____
                          )          )~
             _.--''''--..(__)__(__)___)..--''''--._
         _.-'      _.-''''-._ \\||// _.-''''-._      '-._
       .'       .-'          '-.\||/.-'          '-.       '.
                                 ||
                                 ||
                                 ||`);
const file05 = [
  ...masthead(5),
  '',
  ...bars([null, ['Profile on the Cat'], null, 'the cat (dictated)', null]),
  '',
  ...CAT,
  '',
  h('Specifications'),
  '',
  ...labelled(
    [
      ['Handle', 'none on file. does not come when called'],
      ['Coat', 'grey tabby, white chest'],
      ['Arrived', 'on a crate, by sea'],
      ['Address', 'the top of the palm'],
      ['Hobbies', 'climbing the palm, napping, floating away'],
      ['Departure', 'one day, on the crate, unannounced'],
      ['Returns', 'another time'],
      ['Lane', 'its own. the cat has a lane'],
    ],
    17,
  ),
  '',
  h('Questions'),
  '',
  '  Q: Favourite place on the island?',
  '  A: The top of the palm.',
  '',
  '  Q: Least favourite thing about it?',
  '  A: People climbing up there for one bar of signal.',
  '',
  '  Q: Any message for the readers?',
  '  A: (asleep)',
];

// ---------------------------------------------------------------------------------------------
// 11. File 0x06: Signal and Noise, under a sister zine's flush-left header
// ---------------------------------------------------------------------------------------------
const t06 = 'Signal and Noise: Every Sound, From Code';
const file06 = [
  `${NAME}, File #${hex(6)} of ${hex(FILES)}`,
  'Volume 0x00, Issue 0x01, Released: October 1, 2026',
  '',
  '',
  centre(`**${t06}**`),
  centre('-'.repeat(t06.length)),
  centre(`by ${L('tools/make_audio.py')}, with notes`),
  '',
  '',
  ...para(
    `Every sound in Castaway is synthesized from code, in ${L('tools/make_audio.py')}. No ` +
      'samples, no loops, no recordings, so no third-party licence applies. More than ' +
      `${hex(150)} (150) sound files so far, all made the same way.`,
  ),
  '',
  ...dotted(
    [
      ['the theme', `a seamless ${hex(60)}-second loop (60)`],
      ['tempo', `${hex(80)} BPM (80)`],
      ['key', 'F major'],
      ['changes', 'Gm9 | C13 | Fmaj9 | Dm9   (ii-V-I-vi, a chord a bar)'],
      ['bars', `${hex(20)} (20), exactly ${hex(3)} seconds each: round ${hex(5)} times`],
      ['the band', 'electric piano, kalimba lead, soft drums, vinyl crackle'],
      ['the ocean', `also a seamless ${hex(60)}-second loop`],
      ['loudness', '-14 LUFS, true peak at or below -1 dBTP'],
      ['in hex', 'no. negative numbers stay in decimal, out of respect'],
      ['the knobs', 'a master level, and one per routine'],
    ],
    17,
  ),
  '',
  h('Errata'),
  '',
  ...para(
    'Nobody has listened to any of it yet. It is code; it may be lovely. A full review ' +
      `follows in issue ${hex(2)}, once somebody presses play.`,
  ),
];

// ---------------------------------------------------------------------------------------------
// 12. File 0x07: Running Aground, opened the 1985 way: a sponsor board's logo, its number
//     and speed, then "Presents....". The board is the top of the palm.
// ---------------------------------------------------------------------------------------------
const PALMTOP = art(String.raw`
              _.---._    _.---._
          _.-'  _.-' \  / '-._  '-._        T H E   P A L M   T O P
        .'   .-'      \/      '-.   '.      =======================
       '    '         ||         '    '     one bar, if you climb
                      ||                    sysop: the cat, when present
        ~~~~~~~~~~~~~(__)~~~~~~~~~~~~~`);
const file07 = [
  ...PALMTOP,
  '',
  centre('127.0.0.1:8765 . local calls only . open daytime hours'),
  '',
  centre('Presents....'),
  '',
  ...masthead(7),
  '',
  ...bars([null, ['Running Aground: How to Run It'], null, 'tools/serve.py and friends', null]),
  '',
  h('Making landfall'),
  '',
  `  $ python ${SERVE}`,
  ...para(
    `The renderer. Open ${LOCAL} for a live preview, then export: frames are encoded in the ` +
      'browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome), and the ' +
      'server mixes the sound and joins the two into a YouTube-ready MP4.',
    72,
    '      ',
  ),
  '',
  `  $ python ${L('tools/schedule.py')}`,
  ...para('Validates the schedule and simulates a 10-hour run.', 72, '      '),
  '',
  `  $ python ${L('tools/render_demo.py')} --dev`,
  ...para(
    'A dev reel of every activity, with a heads-up display (the older Python reference ' +
      'renderer).',
    72,
    '      ',
  ),
  '',
  h('What you will not need'),
  '',
  '  - a build step',
  '  - npm packages (plain ES modules only)',
  '  - a boat',
  '',
  h('House style'),
  '',
  ...dotted(
    [
      ['picture', `16:9, 1080p, ${hex(30)} (30) frames a second`],
      ['motion', 'hard cuts and stepped movement, by default'],
      ['lighting', 'always daytime. there are no night scenes'],
      ['the page', L('web/index.html')],
      ['the logbook', `${L('MUSING.md')}, where the decisions are written down`],
    ],
    18,
  ),
];

// ---------------------------------------------------------------------------------------------
// 13. File 0x08: Greets and credits, with the 1996 ornaments, then the bottle
// ---------------------------------------------------------------------------------------------
const RULE20 = '_'.repeat(20);
const file08 = [
  ...masthead(8),
  '',
  centre('.oO Castaway Oo.'),
  '',
  centre(RULE20),
  '',
  centre(spaced('ISSUE') + '   ' + spaced('0x01')),
  centre('October 1, 2026'),
  centre(RULE20),
  '',
  '',
  h('Credits'),
  '',
  ...labelled(
    [
      ['Editor-in-Chief', 'Luke'],
      ['Staff', 'the Tideline Desk'],
      ['Schedule Clerk', 'activities.toml'],
      ['Sound Department', 'tools/make_audio.py, from code, unheard'],
      ['Signal Engineering', 'the top of the palm (one bar)'],
      ['Air Freight', 'a drone (headphones only)'],
      ['Music Critic', 'a shark, in headphones (nods)'],
      ['Visiting Columnist', 'a sea turtle'],
      ['Coconut Logistics', 'a hermit crab'],
      ['Water Sports Desk', 'a bro on a hydrofoil (shaka, gone)'],
      ['Photo Desk', 'a boat of selfie-takers'],
      ['Agriculture', 'one kumara, growing'],
      ['Rescue Coordinator', 'vacant'],
      ['Night Editor', 'vacant (there is no night)'],
    ],
    22,
  ),
  '',
  h('Greets'),
  '',
  ...para(
    'Waves across the water to the sea turtle, the grey tabby (wherever it is today), the ' +
      'hermit crab and its coconut, the shark with the good headphones, the bro on the ' +
      'hydrofoil (shaka returned), the selfie boat, the drone, the kumara, and the tide, for ' +
      'taking the sandcastle so politely.',
  ),
  '',
  ...para(
    'And to Johnny Castaway, the 1992 screensaver that started all this: an unofficial nod, ' +
      'with respect. It belongs to its owners. This island, its art, its code and every sound ' +
      'on it are new. The Tideline Desk is made up. The waiting is real.',
  ),
  '',
  h('A message in a bottle'),
  '',
  ...bottle(
    'If found, please return to sender. (It will be.) Weather: lovely. Signal: one bar, top ' +
      'of the palm. Night: none, as usual. Iced coffee: available, if you walk.',
  ),
];

// ---------------------------------------------------------------------------------------------
// 14. Assemble, check, write
// ---------------------------------------------------------------------------------------------
const FOLDS = [
  [2, 'Washback: letters that came straight back (questions, answered in brackets)', file02],
  [3, 'Table of Tides: the schedule, in hex, with a hexdump of an hour', file03],
  [4, 'Tidewrack: things that washed up (the gags)', file04],
  [5, 'Profile on the Cat: grey tabby, white chest, no comment', file05],
  [6, 'Signal and Noise: every sound, from code, unheard so far', file06],
  [7, 'Running Aground: how to run it, and what you will not need', file07],
  [8, 'Greets, credits, and a message in a bottle', file08],
];

const BANNED = /\b(crack(ed|s)?|trainers?|cheats?|warez|keygen|pirat\w*|rip(ped|s)?|virus\w*|phile|phrack)\b/i;
const problems = [];
function check(lines, where) {
  lines.forEach((l, i) => {
    const p = plain(l);
    if (p.length > W) problems.push(`${where}:${i + 1} is ${p.length} columns: ${p}`);
    if (/[^\x20-\x7e]/.test(p)) problems.push(`${where}:${i + 1} has a character outside printable ASCII`);
    if (/\s$/.test(p)) problems.push(`${where}:${i + 1} has trailing whitespace`);
    if (BANNED.test(p)) problems.push(`${where}:${i + 1} uses a word the brief keeps out: ${p}`);
  });
}
check(file01, 'file01');
for (const [n, , lines] of FOLDS) check(lines, `file${hex(n)}`);
const pre = (lines) => ['<pre>', ...lines.map(html), '</pre>'];

const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Counts checked 2026-10-01. -->`,
  '',
  ...pre(file01),
  '',
];
for (const [n, summary, lines] of FOLDS) {
  md.push('<details>');
  md.push(`<summary><b>${hex(n)}</b> &nbsp;${esc(summary)}</summary>`);
  md.push('');
  md.push(...pre(lines));
  md.push('');
  md.push('</details>');
  md.push('');
}
md.push(...pre([EOF_BAR]));
md.push('');

const prose = md.filter((l) => !l.startsWith('<pre>'));
if (md.some((l) => l.includes('\u2014'))) problems.push('an em dash got in');
if (md.some((l) => /\t/.test(l))) problems.push('a tab got in');
for (const [n, summary] of FOLDS) if (BANNED.test(summary)) problems.push(`summary ${n} uses a kept-out word`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
fs.writeFileSync(OUT, md.join('\n'));
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${md.length} lines, ${prose.length} outside pre blocks)`);
