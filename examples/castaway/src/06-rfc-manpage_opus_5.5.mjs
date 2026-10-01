// RFC / man page header for the Castaway README (catalogue style hack-03: "Standards plain text").
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/06-rfc-manpage_opus_5.5.mjs
// It rewrites examples/castaway/06-rfc-manpage_opus_5.5.md. Edit this file, not that one.
//
// The style: the two canonical plain-text documents of internet and Unix culture. An RFC in the
// paginated format of RFC 2223 (72 columns, 58 lines a page, two-column first-page header,
// centred title, 3-space body indent, running header and "[Page N]" footer on every page), and
// a section 1 manual page (NAME, SYNOPSIS, DESCRIPTION, OPTIONS... 7-space indent, title and
// footer lines). Only the layouts are reused. The series ("Request for Calm"), the working group
// and the organisation are invented, the memo number is the project's default seed, and nothing
// here claims to be a real RFC or any standards body's work.
//
// Nothing is laid out by hand that a machine could get wrong:
//   * The body is typeset by this file: hard-wrapped at 72 columns with two spaces after a full
//     stop, paginated at 58 lines with keep-together figures, headings kept with their text and
//     no one-line widows or orphans.
//   * The Table of Contents on page 1 is filled in from where each heading actually landed.
//   * Figure 1 (the duty cycle) is drawn from the first half hour of the default run, seed 1992,
//     as printed by `python -B tools/schedule.py` on 2026-10-01. The ship in Figure 4 is the same
//     run. Every other number is from activities.toml, MUSING.md or the tools, checked that day.
// The build refuses to write anything if a line is over 72 columns, has trailing spaces or a
// non-ASCII character, if a page runs over 58 lines, or if the prose grows an em dash.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '06-rfc-manpage_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);

const W = 72; // RFC 2223: at most 72 characters a line
const PAGE = 58; // and 58 lines a page, footer included
const DATE = 'October 2026';
const AUTHOR = 'Luke';
const SERIES = 'Request for Calm';
const NUMBER = 1992; // the default seed in activities.toml
const SHORT_TITLE = 'Castaway';
const CATEGORY = 'Informational';

// ------------------------------------------------------------------ counts that drift
// Checked read-only against D:/python/castaway on 2026-10-01 at about 13:15, after activities.toml
// grew from 81 to 92 activities and media/audio from 129 to 151 files. Other sessions keep adding
// to both, so the prose says "at the time of writing". Re-check before this becomes the README:
//   python -B -c "import tomllib,collections as c;d=tomllib.load(open('activities.toml','rb'));
//     a=d['activities'];print(len(a),c.Counter(v['tier'] for v in a.values()),len(d['state']))"
//   python -B tools/schedule.py --json <somewhere outside the project>/run.json   (seed 1992)
const ACTIVITY_COUNT = 92;
const TIER_COUNTS = { regular: 9, occasional: 35, rare: 31, super_rare: 6, chained: 11 };
// how many of each tier came round in the default run (seed 1992, 10:00:00)
const DEFAULT_RUN = { regular: 159, occasional: 32, rare: 13, super_rare: 1, chained: 14 };
const BUSY_PERCENT = 28; // "She is busy 28% of the run" in the same run
const SOUND_FILES = 151; // media/audio/audio_catalog.json, and the last count in MUSING.md
const WORLD_FLAGS = 11; // [state] in activities.toml; the record format below gives them 16 bits
if (Object.values(TIER_COUNTS).reduce((t, n) => t + n, 0) !== ACTIVITY_COUNT) throw new Error('tier counts do not add up');
if (WORLD_FLAGS > 16) throw new Error('the record format has run out of flag bits');

// ------------------------------------------------------------------ inline markup
// Text is built as plain strings. Bold, italic and links are zero-width marker characters, so
// widths can be measured exactly; HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const I = (s) => `\u0005${s}\u0006`;
const A = (s, href) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[-]/g, '').replace(/[\u0001\u0002\u0004\u0005\u0006]/g, '');
const len = (s) => [...visible(s)].length;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) =>
  esc(s)
    .replace(/\u0001/g, '<b>')
    .replace(/\u0002/g, '</b>')
    .replace(/\u0005/g, '<i>')
    .replace(/\u0006/g, '</i>')
    .replace(/\u0003([-])/g, (_, c) => `<a href="${esc(links[c.charCodeAt(0) - 0xe000])}">`)
    .replace(/\u0004/g, '</a>');

// The files a README at the project root can link to.
const FILES = {
  activities: 'activities.toml',
  musing: 'MUSING.md',
  serve: 'tools/serve.py',
  schedule: 'tools/schedule.py',
  audio: 'tools/make_audio.py',
  demo: 'tools/render_demo.py',
  web: 'web/index.html',
};
const LOCAL = 'http://127.0.0.1:8765/';
const file = (k) => A(FILES[k], FILES[k]);
const cite = (tag, k) => A(`[${tag}]`, FILES[k]);
const local = () => A(LOCAL, LOCAL);

// ------------------------------------------------------------------ typesetting
// Two spaces after a full stop, as the RFC Editor's typewriter intended.
const twoSpace = (s) => s.replace(/([.?!][")\]\u0002\u0004]?) (?=[A-Z0-9"(\[\u0001\u0003])/g, '$1  ');

// Cross-references and dates never break across a line ("Figure / 1" is how memos get lost).
// A lone "a" or "A" never ends a line either.
const glue = (s) =>
  s.replace(/(^| )([Aa]) (?=[a-z0-9])/g, '$1$2 ').replace(/\b(Figure|Section|Table) (\d)/g, '$1 $2').replace(/\b(\d+) (October) (\d{4})/g, '$1 $2 $3');

function wrap(text, indent = 3, hang = indent, width = W) {
  const parts = glue(twoSpace(text)).split(/( +)/);
  const out = [];
  let cur = '';
  let curLen = 0;
  let sep = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i % 2 === 1) {
      sep = p;
      continue;
    }
    if (p === '') continue;
    const wl = len(p);
    if (curLen === 0) {
      const ind = out.length === 0 ? indent : hang;
      cur = ' '.repeat(ind) + p;
      curLen = ind + wl;
    } else if (curLen + sep.length + wl <= width) {
      cur += sep + p;
      curLen += sep.length + wl;
    } else {
      out.push(cur);
      cur = ' '.repeat(hang) + p;
      curLen = hang + wl;
    }
  }
  if (curLen) out.push(cur);
  return out.map((l) => l.replace(/ /g, ' ')); // a no-break space only holds words together
}
const nb = (s) => s.replace(/ /g, ' ');

const center = (s, width = W) => ' '.repeat(Math.max(0, Math.floor((width - len(s)) / 2))) + s;
const padTo = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
function threePart(l, c, r, width = W) {
  const cs = Math.floor((width - len(c)) / 2);
  const left = padTo(l, cs) + c;
  const out = padTo(left, width - len(r)) + r;
  if (len(l) >= cs || len(left) > width - len(r)) throw new Error(`three-part line collides: ${visible(out)}`);
  return out;
}
const twoCol = (l, r, width = W) => (r ? padTo(l, width - len(r)) + r : l);

// ------------------------------------------------------------------ blocks
// h: section heading (kept with what follows); p: paragraph (may split across pages, never
// leaving a single line behind); fig: figure or table (kept together); dl: definition with a
// hanging indent; li: "o" bullet; raw: lines as given.
const h = (num, title, opts = {}) => ({ t: 'h', num, title, ...opts });
const p = (text) => ({ t: 'p', text });
const dl = (term, text) => ({ t: 'p', text: `${term}  ${text}`, hang: 6 });
const li = (text) => ({ t: 'p', text: `o  ${text}`, hang: 6 });
const fig = (lines, caption) => ({ t: 'fig', lines, caption });
const notes = (items) => ({ t: 'pl', lines: items.flatMap(([n, text]) => wrap(`(${n})  ${text}`, 3, 8)) });

function render(b) {
  if (b.t === 'h') return [B(b.num ? `${b.num}  ${b.title}` : b.title)];
  if (b.t === 'p') return wrap(b.text, 3, b.hang ?? 3);
  if (b.t === 'pl') return b.lines;
  if (b.t === 'fig') return b.caption ? [...b.lines, '', center(b.caption)] : b.lines;
  throw new Error(`unknown block ${b.t}`);
}

// ------------------------------------------------------------------ figures

// Figure 1: the first half hour of the default run, seed 1992, as printed by
// `python -B tools/schedule.py` on 2026-10-01 ("FIRST 0:30:00"). Start and length in seconds.
// Her lane is drawn anonymously; only the activities this header talks about are named in it.
const FIRST_HALF_HOUR = {
  castaway: [
    [12, 49], [249, 93], [456, 42], [624, 31], [834, 33], [957, 41],
    [1179, 33], // stroll
    [1449, 51], // coconut_sip, 0:24:09
    [1689, 22], // jog_lap
  ],
  sea_sky: [[1458, 148]], // ship_passes_unseen, 0:24:18 to 0:26:46
};
const CELL = 30; // seconds a column
const COLS = 1800 / CELL;
function laneRow(spans) {
  let row = '';
  for (let c = 0; c < COLS; c++) {
    const a = c * CELL;
    const b = a + CELL;
    let busy = 0;
    for (const [s, d] of spans) busy += Math.max(0, Math.min(b, s + d) - Math.max(a, s));
    row += busy >= CELL / 2 ? '#' : '.';
  }
  return row;
}
const fmtMS = (s) => `${Math.floor(s / 60)} minutes ${s % 60} seconds`;
const busyFirst = FIRST_HALF_HOUR.castaway.reduce((t, [, d]) => t + d, 0);
function dutyFigure() {
  const LABEL = 12; // 3 indent + 9 label
  const axis = [];
  let line = ' '.repeat(LABEL);
  for (let m = 0; m <= 30; m += 5) {
    const col = LABEL + (m * 60) / CELL;
    const lab = `0:${String(m).padStart(2, '0')}`;
    const at = m === 30 ? LABEL + COLS - lab.length : col;
    line = padTo(line, at) + lab;
  }
  axis.push(line);
  let ticks = ' '.repeat(LABEL);
  for (let c = 0; c < COLS; c++) ticks += c % 10 === 0 || c === COLS - 1 ? '|' : ' ';
  return [
    axis[0],
    ticks,
    `   castaway ${laneRow(FIRST_HALF_HOUR.castaway)}`,
    `   sea_sky  ${laneRow(FIRST_HALF_HOUR.sea_sky).replace(/#/g, '=')}`,
    ' '.repeat(LABEL + laneRow(FIRST_HALF_HOUR.sea_sky).indexOf('#')) + '^ Section 5',
    '            # busy   . idle   = ship   one column = 30 seconds',
  ];
}

// Figure 2: the binary encoding nobody uses. Fields are [name, bits]; 32 bits a row. Every field
// is wide enough for the real values (checked 2026-10-01): weights go up to 4, cooldowns to 14400 s,
// durations to 1606 s, max_per_run to 2, beats to 22 a routine, follow-up waits from 2 s to 10800 s,
// 6 lanes and 11 world flags.
const RECORD_ROWS = [
  [['Tier', 3], ['Weight', 5], ['Lanes', 6], ['H', 1], ['N', 1], ['Cooldown (seconds)', 16]],
  [['Shortest (seconds)', 16], ['Longest (seconds)', 16]],
  [['Requires', 16], ['Requires Not', 16]],
  [['Sets', 16], ['Clears', 16]],
  [['Wait From (seconds)', 16], ['Wait To (seconds)', 16]],
  [['Then', 8], ['Max', 2], ['Reserved', 16], ['Beats', 6]],
];
function recordFigure() {
  const ind = '   ';
  const rule = ind + '+' + '-+'.repeat(32);
  const out = [
    ind + ' 0                   1                   2                   3',
    ind + ' 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1',
    rule,
  ];
  for (const row of RECORD_ROWS) {
    if (row.reduce((t, [, n]) => t + n, 0) !== 32) throw new Error('record row is not 32 bits');
    let s = ind + '|';
    for (const [name, bits] of row) {
      const cell = bits * 2 - 1;
      if (name.length > cell) throw new Error(`field name too long: ${name}`);
      const l = Math.floor((cell - name.length) / 2);
      s += ' '.repeat(l) + name + ' '.repeat(cell - name.length - l) + '|';
    }
    out.push(s, rule);
  }
  const wide = (text, edge = '|') => {
    const cell = 63;
    const l = Math.floor((cell - text.length) / 2);
    return ind + edge + ' '.repeat(l) + text + ' '.repeat(cell - text.length - l) + edge;
  };
  out.push(wide(''), wide('Beats (variable)', '/'), wide(''), rule);
  out.push(wide('About (variable, deadpan)'), rule);
  return out;
}

// Figure 3: the beats of message_in_bottle, from activities.toml.
const BOTTLE_BEATS = [
  ['write a note', 20, 40],
  ['roll, bottle, cork', 5, 8],
  ['walk to the waterline', 4, 8],
  ['throw', 2, 3],
  ['watch it bob away', 15, 25],
  ['it drifts back', 20, 35],
  ['deadpan', 4, 6],
  ['pick it up', 3, 4],
  ['walk back', 4, 8],
];
function beatsFigure() {
  return BOTTLE_BEATS.map(([what, a, b], i) => {
    const left = `      ${i + 1}.  ${what} `;
    const right = ` ${String(a).padStart(2)} to ${String(b).padStart(2)} s`;
    let dots = '';
    while (left.length + dots.length + right.length < 58) dots += '.';
    return left + dots + right;
  });
}

// Figure 4: the ship, seed 1992. Hand-drawn, checked below.
const SHIP_FIGURE = [
  '              Castaway           Coconut               Ship',
  '                 |                  |                    :',
  '   0:24:09       |----(1) sip------>|                    :',
  '   0:24:18       |                  |                   +-+ (2)',
  '                 |                  |                   | |',
  '   0:25:00       |<---(3) empty-----|                   | |',
  '                 |                  x                   | |',
  '                 |   (4) idle                           | |',
  '                 |                                      | |',
  '   0:26:46       |                                      +-+ (5)',
  '                 |                                       :',
];

// Table 1. Counts per tier are from activities.toml; the last column is how many of each came
// round in the default run (seed 1992), from the same run as Figures 1 and 4.
function tierTable() {
  const cols = [12, 22, 12, 11];
  const T = TIER_COUNTS;
  const R = DEFAULT_RUN;
  const runs = Object.values(R).reduce((t, n) => t + n, 0);
  const rows = [
    ['Tier', 'Comes round every', 'Activities', 'Seed 1992'],
    null,
    ['regular', '2 to 5 minutes', T.regular, R.regular],
    ['occasional', '12 to 25 minutes', T.occasional, R.occasional],
    ['rare', '30 to 60 minutes', T.rare, R.rare],
    ['super rare', '3 to 6 hours (max 3)', T.super_rare, R.super_rare],
    ['chained', 'when told to', T.chained, R.chained],
    null,
    ['total', '', ACTIVITY_COUNT, runs],
  ];
  const rule = '   +' + cols.map((c) => '-'.repeat(c)).join('+') + '+';
  const out = [rule];
  for (const r of rows) {
    if (!r) {
      out.push(rule);
      continue;
    }
    // words flush left, numbers flush right, as a table of numbers should be
    const cells = r.map((cell, i) => {
      const inner = cols[i] - 2;
      const txt = typeof cell === 'number' ? String(cell).padStart(inner) : cell.padEnd(inner);
      if (txt.length > inner) throw new Error(`table cell too wide: ${cell}`);
      return ' ' + txt + ' ';
    });
    out.push('   |' + cells.join('|') + '|');
  }
  out.push(rule);
  return out;
}

// ------------------------------------------------------------------ the memo
const shipSecondsAfter = 1606 - 1500; // the ship leaves at 0:26:46; the coconut ends at 0:25:00

const GROUPS = [
  {
    summary: (a, b) =>
      `<b>Pages ${a} to ${b}</b>: Introduction, Terminology and The Schedule, with a table, for seriousness, and a chart of her doing nothing`,
    blocks: [
      h('1.', 'Introduction', { toc: true }),
      p('Ten-hour lo-fi videos ask very little of the viewer and, in return, offer very little. This memo proposes a small amendment: offer very little, but every so often, offer a coconut that gets up and walks away with a hermit crab wearing it.'),
      p(`The picture is one fixed shot, 16:9, rendered at 1080p and 30 frames a second. It is always daytime. The island holds one tall palm, one raft and one castaway: a young woman with brown hair in a loose low bun, cream headphones, a coral tank top, cream shorts and bare feet. In the default run she is busy ${BUSY_PERCENT}% of the time. The other ${100 - BUSY_PERCENT}% is the point.`),
      h('2.', 'Terminology', { toc: true }),
      p('The key words "MUST", "MUST NOT", "SHOULD" and "MAY" in this memo are to be read in the usual way, but slowly.'),
      dl('Castaway:', 'The woman on the island. Her headphones are load-bearing; see Section 5.'),
      dl('Idle:', 'What she does between activities: nodding to the music, sitting against the palm, reading, or writing in a notebook. Idle is the default state and the main attraction.'),
      dl('Activity:', `Anything that is not idle. There are ${ACTIVITY_COUNT} at the time of writing, each with step-by-step beats, how long it lasts and how often it comes round ${cite('ACTIVITIES', 'activities')}.`),
      dl('Beat:', 'One step of an activity, such as "throw" or "deadpan".'),
      dl('Bar:', 'Three seconds. One bar of the theme at 80 BPM.'),
      dl('Lane:', 'Anything that can only do one thing at a time. She is a lane. So is the sea.'),
      dl('Gag:', 'An activity in which somebody misses something. Usually her.'),
      h('3.', 'The Schedule', { toc: true }),
      p('Activities MUST NOT be played in order. Each tier has its own timer. When it goes off, one activity from that tier is picked by weight, from those whose lanes are free, whose cooldown has passed and whose requirements hold. If two tiers are due at once, the rarer one wins.'),
      h('3.1.', 'Tiers'),
      fig(tierTable(), 'Table 1: Tiers, and How Many Came Round with Seed 1992'),
      p('A chained activity is never picked by a timer. Another activity starts it, later: the tide takes the sandcastle 5 to 30 minutes after it is built, and a reply to her message in a bottle washes up 1 to 3 hours after the bottle came back.'),
      h('3.2.', 'Lanes'),
      p('Each actor has a lane: castaway, cat, turtle, sea_sky, shore and garden. An activity holds its lanes until it ends, and activities in different lanes MAY overlap. A ship (sea_sky) can therefore sail past while she (castaway) is busy with a coconut. This is the classic joke, and Section 5 specifies it in full.'),
      h('3.3.', 'The Bar'),
      p('Every activity MUST start on the next bar line of the music, that is, on a multiple of 3 seconds, so every gag lands on the beat. An activity that falls due between bars waits for the next one. It does not mind.'),
      h('3.4.', 'Duty Cycle'),
      p(`The number of this memo is the default seed. The same seed gives the same video, event for event. Figure 1 is the first half hour of the default run, from ${cite('SCHEDULE', 'schedule')}.`),
      fig(dutyFigure(), 'Figure 1: The First 30 Minutes, Seed 1992'),
      p(`She is busy for ${fmtMS(busyFirst)} of the 30. This is plenty.`),
    ],
  },
  {
    summary: (a, b) =>
      `<b>Pages ${a} to ${b}</b>: a binary record format that nothing uses, and The Ship, with a sequence diagram of her not seeing it`,
    blocks: [
      h('4.', 'Activity Record Format', { toc: true }),
      p(`Activities are carried in a TOML file ${cite('ACTIVITIES', 'activities')}. For completeness, Figure 2 gives a binary encoding. Implementations MUST NOT use it. None does. It is included because a protocol without a diagram did not feel finished.`),
      fig(recordFigure(), 'Figure 2: Activity Record (Unused)'),
      dl('Tier:', `3 bits. ${['0 regular', '1 occasional', '2 rare', '3 super rare', '4 chained', '5 once'].map(nb).join(', ')}. Values 6 and 7 are reserved for tiers so rare that nothing in them would ever happen.`),
      dl('Weight:', '5 bits. Relative chance of being picked when the tier\'s timer goes off.'),
      dl('Lanes:', '6 bits, one per lane, in the order of Section 3.2.'),
      dl('H (Headphones):', '1 bit. MUST be 1.'),
      dl('N (Noticed):', '1 bit. Whether she notices what happens. MUST be 0 for ship_passes_unseen (Section 5). It is 1 for rescue_almost, which happens at most once a video (Section 10).'),
      dl('Cooldown:', '16 bits. Seconds before the activity MAY be picked again. The coconut that lands on the hermit crab waits 5400.'),
      dl('Shortest, Longest:', '16 bits each. Bounds on how long a run lasts. Each run draws a fresh value between them.'),
      dl('Requires, Requires Not, Sets, Clears:', `16 bits each, one per world flag, such as "a sandcastle is standing", "the cat is present" or "a bottle awaits a reply". The island has ${WORLD_FLAGS} flags at the time of writing. The other ${16 - WORLD_FLAGS} bits are for later.`),
      dl('Wait From, Wait To:', '16 bits each. Seconds before the follow-up activity starts. The longest wait is 10800: for a reply to a bottle, or for a kumara to flower.'),
      dl('Then:', '8 bits. Which activity follows, if any.'),
      dl('Max:', '2 bits. Most runs of this activity in one video, or 0 for no limit. "She could leave any time" has a Max of 1.'),
      dl('Reserved:', '16 bits. Reserved for a second palm. MUST be zero.'),
      dl('Beats:', '6 bits, a count, then the steps, in order. Each gives what happens, the drawing to use, how many seconds it lasts and, optionally, a sound. Figure 3 decodes the beats of message_in_bottle (occasional, cooldown 7200, then bottle_reply after 3600 to 10800 seconds).'),
      fig(beatsFigure(), 'Figure 3: Beats of message_in_bottle'),
      dl('About:', 'What happens, in plain words, such as "Writes a note, bottles it, throws it... it washes straight back to her feet." It is the only field anyone reads.'),
      h('5.', 'The Ship', { toc: true, newPage: true }), // gets a page to itself, with its figure
      p(`The ship (ship_passes_unseen, occasional) is the reason for this memo. When its timer goes off it SHOULD wait, for up to ten minutes, until she is busy with a coconut, a sandcastle, a fishing rod or a jog. It then crosses the horizon in 90 to 150 seconds. She MUST NOT see it. The mechanism is the headphones. ${nb('Figure 4')} shows the exchange as it happens in the default run.`),
      fig(SHIP_FIGURE, 'Figure 4: Ship Passes Unseen, Seed 1992'),
      notes([
        [1, 'She wanders into the shade and sips a coconut, eyes closed, completely content.'],
        [2, `A ship appears on the horizon. ${nb('N = 0.')}`],
        [3, 'The coconut is finished. She returns to idle.'],
        [4, `The ship stays on the horizon for a further ${shipSecondsAfter} seconds. ${nb('N = 0.')}`],
        [5, `The ship leaves. ${nb('N = 0.')} No rescue occurs.`],
      ]),
    ],
  },
  {
    summary: (a, b) =>
      `<b>Pages ${a} to ${b}</b>: Implementation Status, four kinds of Considerations (the hammock, the synthesizer, the coconut and the shark), References, and where to send a bottle`,
    blocks: [
      h('6.', 'Implementation Status', { toc: true }),
      p(`Two implementations exist.  The current one is a web page ${cite('WEB', 'web')}, served by ${cite('SERVE', 'serve')}, with a live preview and export to a YouTube-ready MP4. It is plain ES modules, with no build step and no npm packages. Export is frame-exact and runs in the browser (WebCodecs H.264) at 68 to 78 frames a second at 1080p30 in Chrome. The server then mixes the sound and joins the two. Motion defaults to hard cuts and stepped movement.`),
      p(`The other, ${cite('RENDER-DEMO', 'demo')}, is the older Python reference renderer. It gains no new features. It renders the scripted demo cut, or, with --dev, a reel of every activity in turn with a heads-up display. ${cite('SCHEDULE', 'schedule')} validates the schedule and simulates a ten-hour run.`),
      p('Scene life adds 26 entries in the background, at most two events on screen at once. Shore waves and drifting cloud shadows are built. Distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.'),
      h('7.', 'Operational Considerations for Single-Palm Deployments', { toc: true }),
      p('The island provides one palm. Implementations SHOULD expect the following.'),
      li('Hammock: she weaves a beautiful hammock, ties one end to the palm and looks around for a second tree. There is not one. The other end goes to the raft.'),
      li('Lookout: she builds a platform in the palm\'s crown, with a ladder. As she climbs, the palm bends slowly under her weight until the platform is at ground level. She steps off.'),
      li('Fire by friction: she works a bow drill until a flame catches, and leaps up with her arms raised. A wave puts it out.'),
      li('Spear fishing: a heroic lunge, and a miss. The fish take turns jumping over the spear. A gull drops one at her feet, out of pity.'),
      li('Signal: none at ground level. There is one bar at the top of the palm, so she climbs it.'),
      li('Kumara: once planted, it grows leafy 90 to 150 minutes later and flowers 2 to 3 hours after that. Nobody remarks on it.'),
      h('8.', 'Audio Considerations', { toc: true }),
      p(`Every sound is synthesized from code in ${cite('MAKE-AUDIO', 'audio')}. No samples, loops or recordings are used, so no third-party licence applies. There are ${SOUND_FILES} sound files at the time of writing.`),
      p('The theme is a seamless 60-second loop at 80 BPM in F major: a ii-V-I-vi progression over 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl surface noise. The ocean is a second seamless 60-second loop. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels MAY be set in master and per routine.'),
      p('Nobody has listened to any of it yet. Reviews are therefore neither positive nor negative, in keeping with the rest of the protocol.'),
      h('9.', 'Security Considerations', { toc: true }),
      p('The coconut is not authenticated. It MAY fall from the palm onto a passing hermit crab. The coconut then gets up and walks away, with the crab wearing it. No crab is harmed.'),
      p('Messages in bottles are delivered on a best-effort basis. The first is returned to sender within a minute. A different bottle, carrying a reply, MAY arrive hours later. Neither is encrypted.'),
      p('A delivery drone MAY lower a parcel onto the island. It contains another pair of headphones. This does not improve her chances of noticing the ship.'),
      p('A stray cat, a grey tabby with a white chest, MAY drift in on a crate, climb the palm and sleep. One day it hops back on the crate and floats away. It comes back another time. It is never asked for credentials.'),
      p('She MAY leave at any time. She stands, stretches and walks out across the water, out of frame. The island sits empty for twenty seconds. She walks back with an iced coffee. This path is not documented further.'),
      h('10.', 'Interoperability Considerations', { toc: true }),
      p('A shark MAY circle the island, surface in headphones and nod to the same beat. They nod together, and it leaves. The shark is the only other party known to implement Section 3.3.'),
      p('A sea turtle MAY swim in and crawl up beside her. They both doze off. This is the most successful exchange in the protocol.'),
      p('A small tour boat MAY pull up so that everyone aboard can take selfies with her in the background. Nobody offers a lift.'),
      p('A ship MAY, at most once a video, acknowledge her (rescue_almost, super rare). She finally spots it and waves like mad. It sounds its horn back, then sails on. She shrugs and puts the music back on.'),
      p('A bro on an electric hydrofoil board MAY carve in close. She runs over to wave. He waves back with a big smile and a shaka, then carves off. She is left with her hands in the air, and a double face palm follows.'),
      h('11.', 'References', { toc: true }),
      ...[
        ['ACTIVITIES', 'activities', '"Castaway: activities and how often they happen"', `${ACTIVITY_COUNT} activities at the time of writing.`],
        ['MUSING', 'musing', '"Castaway: working learnings"', 'Read "Current state" first.'],
        ['SERVE', 'serve', '"Web renderer: live preview and MP4 export"', ''],
        ['WEB', 'web', '"Web renderer page"', ''],
        ['SCHEDULE', 'schedule', '"Schedule validator and ten-hour simulator"', ''],
        ['MAKE-AUDIO', 'audio', '"Sound synthesizer"', 'No samples were harmed.'],
        ['RENDER-DEMO', 'demo', '"Reference renderer and dev reel"', ''],
      ].map(([tag, k, title, extra]) => ({ t: 'ref', tag, k, title, extra })),
      h('Appendix A.', 'Manual Page', { toc: true }),
      p('The manual page for both implementations, CASTAWAY(1), follows this memo. Manual pages are not paginated, so it has no page number. It has not asked for one.'),
      h('', 'Acknowledgements', { toc: true }),
      p('The author thanks the sea turtle, who dozed through every review; the shark, for keeping time; the hermit crab, for agreeing to wear the coconut; and the gull, for the fish.'),
      h('', 'Author\'s Address', { toc: true }),
      fig([
        `   ${AUTHOR}`,
        '   One Palm, One Bar',
        '   The island, a little right of the palm',
        '',
        '   Email: by bottle (replies take one to three hours)',
      ]),
    ],
  },
];

// References render as RFC 7322 entries: tag in a 15-column gutter, text hanging beside it.
function renderBlock(b) {
  if (b.t === 'ref') {
    const tagCol = 18;
    const lines = wrap(`${b.title}, ${file(b.k)}.${b.extra ? ' ' + b.extra : ''}`, tagCol, tagCol);
    lines[0] = padTo(`   ${cite(b.tag, b.k)}`, tagCol) + lines[0].slice(tagCol);
    return lines;
  }
  return render(b);
}

// ------------------------------------------------------------------ pagination
const BODY = PAGE - 6; // running header + 2 blank lines above, 2 blank lines + footer below
const tocPages = new Map();

function paginate(blocks) {
  const pages = [];
  let cur = [];
  const flush = () => {
    while (cur.length && cur[cur.length - 1] === '') cur.pop();
    if (cur.length) pages.push(cur);
    cur = [];
  };
  const rendered = blocks.map(renderBlock);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const lines = rendered[i];
    const sep = () => (cur.length ? 1 : 0);
    const room = () => BODY - cur.length - sep();
    const together = b.t === 'fig' || b.t === 'ref' || lines.length <= 3;
    let need = lines.length;
    if (b.t === 'h') {
      // a heading travels with the next block, or with at least two lines of it
      const next = rendered[i + 1] || [];
      const nb = blocks[i + 1];
      const keep = nb && (nb.t === 'fig' || nb.t === 'ref' || next.length <= 3) ? next.length : Math.min(2, next.length);
      need = 1 + 1 + keep;
    }
    if (b.t === 'h' || together) {
      if (need > room() || b.newPage) flush();
      if (lines.length > BODY) throw new Error('block taller than a page');
      if (cur.length) cur.push('');
      if (b.t === 'h' && b.toc) tocPages.set(b.num + b.title, pages.length);
      cur.push(...lines);
      continue;
    }
    // a paragraph: split if it must, leaving at least two lines on each side
    if (lines.length <= room()) {
      if (cur.length) cur.push('');
      cur.push(...lines);
      continue;
    }
    let take = room();
    if (lines.length - take < 2) take = lines.length - 2;
    if (take >= 2) {
      cur.push('');
      cur.push(...lines.slice(0, take));
      flush();
      cur.push(...lines.slice(take));
    } else {
      flush();
      cur.push(...lines);
    }
  }
  flush();
  return pages;
}

const runningHeader = threePart(`${SERIES} ${NUMBER}`, SHORT_TITLE, DATE);
const footer = (n) => threePart(AUTHOR, CATEGORY, `[Page ${n}]`);

let pageNo = 2;
const groupPages = [];
for (const g of GROUPS) {
  const before = tocPages.size;
  const pages = paginate(g.blocks);
  // tocPages holds page indexes local to this group; make them absolute
  let k = 0;
  for (const [key, idx] of tocPages) {
    if (k++ >= before) tocPages.set(key, idx + pageNo);
  }
  const numbered = pages.map((body, i) => [runningHeader, '', '', ...body, '', '', footer(pageNo + i)]);
  groupPages.push({ first: pageNo, last: pageNo + pages.length - 1, pages: numbered, summary: g.summary });
  pageNo += pages.length;
}

// ------------------------------------------------------------------ page 1
function tocLine(num, title, page, depth) {
  const numPart = !num ? '' : /^\d/.test(num) ? padTo(num, depth ? 6 : 4) : `${num}  `;
  const lead = '   ' + '  '.repeat(depth) + numPart + title;
  const right = String(page).padStart(4);
  // xml2rfc's spaced dot leader: dots on odd columns, so every row's dots line up, with at
  // least one space after the title and before the page number
  let s = lead + ' ';
  while (s.length < W - right.length) s += s.length % 2 ? '.' : ' ';
  return s.replace(/\s+$/, '').padEnd(W - right.length) + right;
}

const tocEntries = [];
for (const g of GROUPS) {
  for (const b of g.blocks) {
    if (b.t !== 'h' || !b.toc) continue;
    const depth = /^\d+\.\d+\./.test(b.num) ? 1 : 0;
    tocEntries.push(tocLine(b.num, b.title, tocPages.get(b.num + b.title), depth));
  }
}

const HEADER_LEFT = [
  'Very Small Island Working Group',
  `${SERIES}: ${NUMBER}`,
  'Obsoletes: Nothing',
  'Updates: Every 2 to 5 Minutes',
  `Category: ${CATEGORY}`,
  'Running Time: 10:00:00',
];
const HEADER_RIGHT = [AUTHOR, 'One Palm, One Bar', DATE];
const TITLE = 'Castaway: A Standard for Ten Hours of Almost Nothing';

const page1 = [
  ...HEADER_LEFT.map((l, i) => twoCol(l, HEADER_RIGHT[i])),
  '',
  '',
  center(B(TITLE)),
  '',
  B('Abstract'),
  '',
  ...wrap(
    `This memo specifies Castaway, a ten-hour lo-fi video and an unofficial remake inspired by the 1992 screensaver Johnny Castaway. A young woman sits on a tiny island with one tall palm, a raft and her headphones, nodding to the music. Every so often, on the beat, something happens: her message in a bottle washes straight back, a drone delivers more headphones, a shark in headphones nods along. A schedule of ${ACTIVITY_COUNT} activities and four timers decides when. A ship passes on the horizon while she is busy with a coconut. She does not see it. This is the protocol working as intended.`,
  ),
  '',
  B('Status of This Memo'),
  '',
  ...wrap(
    `This memo is in development and no video has been published. Every sound is synthesized from code in ${file('audio')}, with no samples, loops or recordings, and nobody has listened to it yet. Distribution of this memo is unlimited. To preview the routines live and export an MP4:`,
  ),
  '',
  `      $ ${B(`python ${file('serve')}`)}`,
  `      then open ${local()}`,
  '',
  B('Table of Contents'),
  '',
  ...tocEntries,
];
const PAGE1 = [...page1, '', '', footer(1)];

// ------------------------------------------------------------------ CASTAWAY(1)
const MAN_NAME = 'CASTAWAY(1)';
const man = [];
const mh = (s) => man.push(B(s));
const mp = (text, indent = 7) => man.push(...wrap(text, indent, indent));
const mopt = (opt, text) => {
  man.push('       ' + opt);
  mp(text, 14);
};
const blank = () => man.push('');
const flag = (s) => B(s);
const arg = (s) => I(s);

man.push(threePart(MAN_NAME, 'Island Commands Manual', MAN_NAME));
blank();
mh('NAME');
mp('castaway - ten hours on a very small island, mostly nodding');
blank();
mh('SYNOPSIS');
// continuation lines line up under the first option, as man(1) lays them out
const synopsis = (cmd, ...rows) => {
  const lead = `       ${cmd}`;
  if (!rows.length) man.push(lead);
  rows.forEach((r, i) => man.push((i ? ' '.repeat(len(lead) + 1) : lead + ' ') + r));
};
synopsis(B('python tools/serve.py'), `[${flag('--port')} ${arg('PORT')}]`);
synopsis(
  B('python tools/schedule.py'),
  `[${flag('--seed')} ${arg('N')}] [${flag('--length')} ${arg('H:MM:SS')}]`,
  `[${flag('--show')} ${arg('H:MM:SS')}] [${flag('--ready-only')}] [${flag('--demo')}]`,
  `[${flag('--json')} ${arg('FILE')}] [${flag('--file')} ${arg('TOML')}]`,
);
synopsis(B('python tools/render_demo.py'), `[${flag('--dev')} [${flag('--only')} ${arg('NAME')}[,${arg('NAME')}]...]]`);
synopsis(B('python tools/make_audio.py'));
blank();
mh('DESCRIPTION');
mp('Castaway is a stationary-frame lo-fi video for YouTube: one fixed shot of a young woman on a tiny island with one tall palm and a raft, 16:9, 1080p, 30 frames a second, always daytime. She idles, nodding to the music on her headphones. Every so often, on the next bar, something happens.');
blank();
mp(`${B('serve.py')} serves the renderer at ${local()}: a live preview of each routine, and export to an MP4 ready for YouTube.`);
blank();
mp(`${B('schedule.py')} validates ${file('activities')} and simulates a run, printing how often each of the ${ACTIVITY_COUNT} activities came round, and the first half hour event by event.`);
blank();
mp(`${B('render_demo.py')}, the older reference renderer, renders the scripted demo cut, or a dev reel of every activity in turn.`);
blank();
mp(`${B('make_audio.py')} synthesizes every sound from code.`);
blank();
mh('OPTIONS');
mopt(`${flag('--port')} ${arg('PORT')}`, 'Listen on PORT instead of 8765. Only 127.0.0.1 is used.');
blank();
mopt(`${flag('--seed')} ${arg('N')}`, 'Same seed, same video, event for event. The default is 1992.');
blank();
mopt(`${flag('--length')} ${arg('H:MM:SS')}`, 'Override the run length. The default is 10:00:00.');
blank();
mopt(`${flag('--show')} ${arg('H:MM:SS')}`, 'How much of the timeline to print. The default is 0:30:00, which is how Figure 1 of the memo was made.');
blank();
mopt(flag('--ready-only'), 'Simulate only the activities whose assets exist today.');
blank();
mopt(flag('--demo'), 'Lay out the scripted demo cut instead.');
blank();
mopt(`${flag('--json')} ${arg('FILE')}`, 'Also write every simulated event to FILE, for the renderer.');
blank();
mopt(`${flag('--file')} ${arg('TOML')}`, 'Read the schedule from TOML instead of activities.toml.');
blank();
mopt(flag('--dev'), 'Render the dev reel instead of the demo cut: every activity in turn, with a heads-up display.');
blank();
mopt(`${flag('--only')} ${arg('NAME')}[,${arg('NAME')}]...`, 'Dev reel: just these activities.');
blank();
mh('EXIT STATUS');
mp('She does not exit. The video ends at 10:00:00 with her still on the island. See BUGS.');
blank();
mh('FILES');
man.push(`       ${file('activities')}`);
mp(`All ${ACTIVITY_COUNT} activities: tiers, lanes, beats, cooldowns.`, 14);
man.push(`       ${file('musing')}`);
mp('The working log. Read "Current state" first.', 14);
man.push(`       ${file('web')}`);
mp('The renderer page.', 14);
blank();
mh('SEE ALSO');
mp(`${SERIES} ${NUMBER}, coconut(5), hermit-crab(7), shark(6)`);
blank();
mh('BUGS');
mp('A ship sails past while she is busy. This is intended.');
blank();
mp('The tide takes the sandcastle. This is also intended.');
blank();
mp('She can leave any time. She walks out over the water and comes back with an iced coffee. This is not explained.');
blank();
man.push(threePart('Castaway (in development)', DATE, MAN_NAME));

// ------------------------------------------------------------------ checks
function check(name, lines, maxLines = Infinity) {
  if (lines.length > maxLines) throw new Error(`${name}: ${lines.length} lines, over ${maxLines}`);
  for (const l of lines) {
    const v = visible(l);
    if (v.length > W) throw new Error(`${name}: ${v.length} columns: "${v}"`);
    if (/\s$/.test(v)) throw new Error(`${name}: trailing space: "${v}"`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`${name}: non-ASCII: "${v}"`);
  }
}
check('page 1', PAGE1, PAGE);
for (const g of groupPages) g.pages.forEach((pg, i) => check(`page ${g.first + i}`, pg, PAGE));
check('manual page', man);
// the hand-drawn ship must agree with the run it claims to show
if (SHIP_FIGURE[2].indexOf('|') !== SHIP_FIGURE[1].indexOf('|')) throw new Error('ship figure lifeline drifts');

// ------------------------------------------------------------------ the markdown
const pre = (lines) => ['<pre>', ...lines.map((l) => toHtml(l.replace(/\s+$/, ''))), '</pre>'].join('\n');
const total = pageNo - 1;

const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(PAGE1),
  '',
  ...groupPages.flatMap((g) => [
    '<details>',
    `<summary>${g.summary(g.first, g.last)}</summary>`,
    '',
    ...g.pages.flatMap((pg) => [pre(pg), '']),
    '</details>',
    '',
  ]),
  '<details>',
  `<summary><b>CASTAWAY(1)</b>: the manual page, for anyone who will not read ${total} pages about a coconut</summary>`,
  '',
  pre(man),
  '',
  '</details>',
  '',
].join('\n');

if (/—/.test(md)) throw new Error('em dash in the header');
for (const line of md.split('\n')) if (/[ \t]+$/.test(line)) throw new Error(`trailing whitespace: "${line}"`);
fs.writeFileSync(OUT_MD, md);
console.log(
  `wrote ${path.relative(process.cwd(), OUT_MD)}: ${md.length} bytes; page 1 is ${PAGE1.length} lines, ` +
    `${total} pages in all (${groupPages.map((g) => g.pages.map((pg) => pg.length).join('/')).join(', ')}), manual page ${man.length} lines`,
);
