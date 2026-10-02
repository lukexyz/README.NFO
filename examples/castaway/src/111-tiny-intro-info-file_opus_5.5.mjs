// Tiny-intro info file header for the Castaway README (style catalogue entry demo-05).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/111-tiny-intro-info-file_opus_5.5.mjs
// It rewrites examples/castaway/111-tiny-intro-info-file_opus_5.5.md. Edit this file, not the .md.
//
// The style: the small text file that travels with a 256-byte or 4k competition entry and is
// several times the size of the program it describes. A narrow measure (40 columns here), a
// three-line centred header (the title in quotes with its size and platform, then "by", then
// "for" a party and a year), rules cut to exactly the measure, notes in parentheses addressed to
// the organisers (how to run it, and what to put on the big-screen slide), a greetings block
// under a spaced-capitals heading, justified to the measure, and an end marker.
// The fancy variant (the second card, in a <details>) has a small slanted logo signed by its
// artist, then a box drawn with pipes, dots, dashes and backticks, with the title on a bracketed
// plaque set into its top edge and labelled fields inside.
// Credited reference, looked at for layout only: the info files in the Revision 2023 256-byte
// intro directory on archive.scene.org. None of their wording, greetings, logos or names is
// reproduced here; the layout is generic.
//
// Everything named here is made up for this header: the party (Sitzfleisch 2o26, which does not
// exist), its 10h wild compo, the crew (Wait Staff), the coder (halfshell) and the logo artist
// (sl0th). The island, the palm, her, the raft and the slanted alphabet are drawn new.
//
// The joke the style hands Castaway: the info file is longer than the plot. The plot is
// plot.txt, and the card's last line but one counts both in bytes, as DOS text files (one byte
// a character, CR LF at each line end). The count is part of what it counts, so it is solved
// by iteration.
//
// Rules this script enforces: every card line fits its measure, is printable 7-bit ASCII (plus
// the CP437 note, which GitHub's monospace stack has), has no trailing whitespace and no tabs;
// the prose has no em dashes; the slanted logo reads back as "castaway". The main card sits in
// an HTML table, where a blank line would end the HTML block, so its one empty line is written
// as an empty <b></b>: GitHub keeps the line, and nothing shows on it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '111-tiny-intro-info-file_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 40; // the measure

// Counts that move as the project grows. Checked on AS_OF, read-only, in D:/python/castaway:
//   python -B -c "import tomllib; print(len(tomllib.load(open('activities.toml','rb'))['activities']))"
//   find media/audio -name '*.wav' | wc -l
// The page only says "more than 90" and "more than 150", so it ages well; these two guard that.
// Also checked then, and printed below: the video is 24 fps ([video] fps in activities.toml, the
// user's choice of 2026-10-01; it was 30 before), 13 of the activities are chained follow-ups
// rather than timer picks, and a 200-seed simulation (schedule.py's simulate(), run in memory)
// gives medians of 157 regular, 30 occasional, 13 rare and 2 super rare, with her busy 28.5% of
// the time: "under a third".
const AS_OF = '2026-10-02';
const ACTIVITIES = 94;
const SOUND_FILES = 181;
if (ACTIVITIES <= 90 || SOUND_FILES <= 150) throw new Error('the "more than" claims no longer hold');

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
const rep = (ch, n) => (n > 0 ? ch.repeat(n) : '');
const len = (s) => [...s].length;
const trimEnd = (s) => s.replace(/\s+$/, '');
const center = (s, w = W) => trimEnd(rep(' ', Math.floor((w - len(s)) / 2)) + s);
const right = (s, w = W) => rep(' ', w - len(s)) + s;
const pad = (s, w) => s + rep(' ', w - len(s));
const rule = (ch = '-', w = W) => rep(ch, w);
const spaced = (t) => [...t.toUpperCase()].join(' ');
const fmt = (n) => n.toLocaleString('en-GB');
// Art blocks are written raw; a ¬ stands for a backtick, which a template literal cannot hold.
const art = (s) => s.raw[0].replace(/¬/g, '`').split('\n').slice(1, -1).map(trimEnd);

// Word-wrap to a width (ragged right).
function wrap(text, width) {
  const out = [];
  let cur = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (len(next) > width && cur) {
      out.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

// Justify a greetings list to exactly `width` columns, the way a careful .diz does it by hand.
// Items are comma separated. Line breaks are chosen together, not greedily: a small dynamic
// programme picks the breaks that leave the least spare room per line (squared, so one very
// loose line costs more than two slightly loose ones). The spare columns on each line then go
// to the gaps after commas, round robin from the left, and spill into the other gaps only if
// the commas would open up too wide. The last line is centred, and so is an optional tail.
function justify(items, width, tail = '') {
  const words = items.flatMap((item, i) => {
    const parts = item.split(' ');
    if (i < items.length - 1) parts[parts.length - 1] += ',';
    return parts;
  });
  const n = words.length;
  const span = (i, j) => words.slice(i, j).reduce((k, w) => k + len(w), 0) + (j - i - 1);
  const best = Array(n + 1).fill(Infinity);
  const from = Array(n + 1).fill(0);
  best[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j <= n; j++) {
      const slack = width - span(i, j);
      if (slack < 0) break;
      const cost = (j === n ? 0 : slack * slack) + best[j];
      if (cost < best[i]) {
        best[i] = cost;
        from[i] = j;
      }
    }
  }
  const lines = [];
  for (let i = 0; i < n; i = from[i]) lines.push(words.slice(i, from[i]));
  const out = lines.map((ws, li) => {
    if (li === lines.length - 1 || ws.length === 1) return center(ws.join(' '), width);
    const gaps = ws.length - 1;
    const spare = width - ws.reduce((k, w) => k + len(w), 0) - gaps;
    const commaGaps = [...Array(gaps).keys()].filter((g) => ws[g].endsWith(','));
    const others = [...Array(gaps).keys()].filter((g) => !ws[g].endsWith(','));
    const pool = commaGaps.length && spare <= 2 * commaGaps.length ? commaGaps : [...commaGaps, ...others];
    const extra = Array(gaps).fill(0);
    for (let k = 0; k < spare; k++) extra[pool[k % pool.length]]++;
    return ws.map((w, i) => (i < gaps ? w + rep(' ', 1 + extra[i]) : w)).join('');
  });
  return [...out, ...(tail ? wrap(tail, width).map((l) => center(l, width)) : [])];
}

// Order a list of single-word handles so each line of "a, b, c," comes as close to `width` as
// possible: a subset-sum over the remaining handles picks the fullest line first (a handle
// costs its length plus a comma and a space; the line loses its last space). Ties keep the
// handles nearest the front of the list. What is left over makes the last, centred line.
function packHandles(handles, width) {
  let rest = [...handles];
  const order = [];
  while (rest.length) {
    const fit = Array(width + 2).fill(null);
    fit[0] = [];
    rest.forEach((h, idx) => {
      const wgt = len(h) + 2;
      for (let t = width + 1; t >= wgt; t--) if (!fit[t] && fit[t - wgt]) fit[t] = [...fit[t - wgt], idx];
    });
    let t = width + 1;
    while (!fit[t]) t--;
    const pick = fit[t];
    if (t < width - 3) {
      order.push(...rest); // not enough left to fill a line: keep them for the last line
      break;
    }
    order.push(...pick.map((k) => rest[k]));
    rest = rest.filter((_, k) => !pick.includes(k));
  }
  return order;
}

// ---------------------------------------------------------------------------------------------
// 1. The island, for the top of the main card: one tall palm with ringed bark and two coconuts
//    (the o's either side of the crown, so the crown reads as a palm and not a parasol), her, two bushes
//    and the raft on the water, signed by its artist in the corner as a .diz logo would be.
//    She is the (o) under the note: the brackets are her headphones.
// ---------------------------------------------------------------------------------------------
const ISLAND = art`
                   __     __
              _.-''  '.  .'  ''-._
           .-'   _.--''\/''--._   '-.
         .'   .-'     _/\_     '-.   '.
        /   .'      .'o||o'.      '.   \
           /       /   ))   \       \
                  '   ((     '
          ♪            ))
         (o)          ((
         /|\   ,;;,    ))  ,;,
   ___.--/ \-''''''-.-((-''-._  ______
~~(___________________________)~\_\_\_\~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ sl0th
`;

// ---------------------------------------------------------------------------------------------
// 2. The slanted alphabet, for the deluxe card's logo. Each glyph is drawn on four rows (roof,
//    two rows of x-height, descender), already leaning: a stroke that goes on down a row moves
//    one column left. Glyphs sit edge to edge; their own blank columns are the letter spacing.
// ---------------------------------------------------------------------------------------------
const GLYPHS = {
  c: ['  __', ' /  ', '/__ ', '    '],
  a: ['  __', ' __/', '/_/ ', '    '],
  s: ['  __', ' /_ ', '__/ ', '    '],
  t: ['  _/_', '  /  ', ' /_  ', '     '],
  w: ['      ', ' / / /', '/_/_/ ', '      '],
  y: ['     ', ' /  /', '/__/ ', '__/  '],
};
function slanted(word) {
  const rows = ['', '', '', ''];
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    for (let r = 0; r < 4; r++) rows[r] += g[r];
  }
  return rows;
}
// Read a logo back glyph by glyph, so a broken table cannot ship silently.
function readBack(rows) {
  let x = 0;
  let word = '';
  const width = Math.max(...rows.map(len));
  while (x < width) {
    const hit = Object.entries(GLYPHS).find(([, g]) => g.every((gr, r) => pad(rows[r], 99).slice(x, x + gr.length) === gr));
    if (!hit) break;
    word += hit[0];
    x += hit[1][0].length;
  }
  return word;
}

// ---------------------------------------------------------------------------------------------
// 3. The words. Everything in the cards is real README content, only compressed. Each claim
//    was checked against the project on AS_OF (read-only): tools/serve.py imports tomllib
//    (Python 3.11+; serve.py, render_demo.py, schedule.py and make_audio.py all compile under
//    3.11) and joins sound and video with ffmpeg; an export's sound is mixed by render_demo.py,
//    which imports numpy and Pillow; the page's keydown handler plays and pauses on space and has
//    no quit key, and its speed menu says sound plays at 1x only.
// ---------------------------------------------------------------------------------------------
const PLOT = ['she nods. something happens. she nods.'];

const HEADER = ['"castaway" - 10h lo-fi for youtube', 'by halfshell / wait staff', 'for sitzfleisch 2o26, 10h wild compo'];

const ORGAS = [
  'runtime is 10:00:00. all of it, please',
  'needs: python 3.11+ numpy pillow ffmpeg',
  'start: python tools/serve.py',
  'open:  http://127.0.0.1:8765/',
  'space plays. sound plays at 1x only',
  'no key quits. close the tab, gently',
];

const SLIDE = ['she nods. sometimes something happens.', 'every sound is synthesized from code.'];

// Greetings go to handles, run together as handles are. Their order is free, so packHandles()
// orders them to fill each line as near to the measure as it can (see below). The ships get
// lines of their own.
const GREETS = [
  'hermitcrab', 'coconut', 'greytabby', 'crate', 'seaturtle', 'shark', 'drone', 'tourboat',
  'selfies', 'foilbro', 'bottle', 'penpal', 'kumara', 'palmtree', 'raft', 'tide', 'sandcastle',
  'icedcoffee', 'signal', 'hammock', 'lookout', 'spear',
];
const GREETS_TAIL = 'and every ship she was too busy to see';

const dosBytes = (lines) => lines.reduce((n, l) => n + len(l) + 2, 0);

function mainCard(bytes) {
  return [
    ...ISLAND,
    '',
    ...HEADER.map((h) => center(h)),
    rule(),
    center('(for the orgas)'),
    ...ORGAS,
    rule(),
    center('(for the big screen)'),
    ...SLIDE.map((s) => center(s)),
    rule(),
    center(`- ${spaced('greetings')} -`),
    ...justify(packHandles(GREETS, W), W, GREETS_TAIL),
    rule(),
    center(`this file: ${fmt(bytes)} bytes. the plot: ${dosBytes(PLOT)}.`),
    center('-[ e o f ]-'),
  ];
}
// The card's size is printed inside the card, so solve for it.
function solve(build) {
  let bytes = 0;
  for (let i = 0; i < 10; i++) {
    const next = dosBytes(build(bytes));
    if (next === bytes) return { lines: build(bytes), bytes };
    bytes = next;
  }
  throw new Error('byte count did not settle');
}

// ---------------------------------------------------------------------------------------------
// 4. The deluxe card: logo, then the box. Inside the box, text is 36 columns.
// ---------------------------------------------------------------------------------------------
const IN = W - 4;
function box(sections, plaque, foot) {
  const pl = `[ ${plaque} ]`;
  const at = W - 2 - len(pl); // the plaque ends one dash short of the right-hand corner
  const out = [];
  out.push(`${rep(' ', at)}.${rep('-', len(pl) - 2)}.`);
  out.push(`.${rep('-', at - 1)}${pl}-.`);
  out.push(`|${rep(' ', at - 1)}'${rep('-', len(pl) - 2)}' |`);
  sections.forEach((sec, i) => {
    if (i) out.push(`|${rep(' ', W - 2)}|`);
    for (const l of sec) {
      if (len(l) > IN) throw new Error(`box line too long (${len(l)}): ${l}`);
      out.push(`| ${pad(l, IN)} |`);
    }
  });
  out.push(`|${rep(' ', W - 2)}|`);
  const ft = `[ ${foot} ]`;
  out.push(`¬${rep('-', W - 4 - len(ft))}${ft}--'`.replace('¬', '`'));
  return out;
}
const bullet = (text) => wrap(text, IN - 4).map((l, i) => (i ? `    ${l}` : `  * ${l}`));
const indent = (text) => wrap(text, IN - 2).map((l) => `  ${l}`);
const dots = (k, v) => `  ${k} ${rep('.', 13 - len(k))} ${v}`;

// The deluxe card greets the cast one per line, so the greetings double as the gag list.
const DELUXE_GREETS = [
  'the hermit crab, in its coconut',
  'the tabby, asleep up the palm',
  'the sea turtle, just visiting',
  'the shark, nodding on the beat',
  'the drone, and spare headphones',
  'the tour boat and its selfies',
  'the hydrofoil bro (shaka!)',
  'the bottle that washed back',
  'whoever wrote back',
  'the kumara, still growing',
  'one bar of signal, up the palm',
  'the iced coffee. no questions',
  // ship_passes_unseen: prefer_during her busy routines, prefer_wait = "0:10:00".
  'and the ship, which waits up to ten minutes for her to get busy',
];

function deluxeCard() {
  const logo = slanted('castaway').map((r) => trimEnd(`  ${r}`));
  // The artist's tag goes in the empty corner under the c, clear of the y's tail.
  if (logo[3].slice(0, 9).trim()) throw new Error('no room for the tag');
  logo[3] = `  sl0th${logo[3].slice(7)}`;
  const sections = [
    ['10h lo-fi island video for youtube', '16:9, 1080p, 24 fps. always daytime'],
    ['starring:', ...indent('a young woman in cream headphones, a coral tank top and cream shorts, barefoot, brown hair in a loose low bun. one tall palm. one raft. a lot of sea')],
    ['plot:', ...indent(`see plot.txt (${dosBytes(PLOT)} bytes)`)],
    [
      'timers (activities.toml), every:',
      dots('regular', '2 to 5 min'),
      dots('occasional', '12 to 25 min'),
      dots('rare', '30 to 60 min'),
      dots('super rare', '3 to 6 h, 3 at most'),
      dots('chained', 'after another one'),
    ],
    [
      'a typical 10h run (median of 200):',
      '  ~155 regular     ~30 occasional',
      '   ~13 rare         ~2 super rare',
      ...indent('plus the chained follow-ups. busy under a third of the time, idle the rest. each one starts on the next bar (3 s)'),
    ],
    [
      'requirements:',
      ...bullet('python 3.11 or newer'),
      ...bullet('for the mp4 export: numpy, pillow and ffmpeg'),
      ...bullet('a browser. chrome encodes h.264 with webcodecs: 68 to 78 frames a second at 1080p, measured'),
      ...bullet('no npm. no build step'),
    ],
    // The whole [run] table, comments left out; the array goes over two lines to fit the box.
    [
      'configuration (activities.toml):',
      '  [run]',
      '  length = "10:00:00"',
      '  seed = 1992',
      '  snap_to_bar = 3.0',
      '  rest_between = ["0:00:20",',
      '                  "0:01:00"]',
    ],
    [
      'sound (tools/make_audio.py):',
      ...bullet('all of it synthesized from code'),
      ...bullet('150+ files. no samples, no borrowed loops, no recordings, no third-party licence'),
      ...bullet('theme: a seamless 60 s loop at 80 bpm in f major, ii-V-I-vi, 20 bars of exactly 3 s'),
      ...bullet('electric piano, kalimba lead, soft drums, vinyl crackle'),
      ...bullet('ocean: also a seamless 60 s loop'),
      ...bullet('mix: -14 LUFS, true peak -1 dBTP or under. levels in master and per routine'),
      ...bullet('listened to so far by: nobody'),
    ],
    [
      'scene life:',
      ...bullet('done: shore waves, cloud shadows'),
      ...bullet('planned: birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko, a rain shower'),
    ],
    ['greets fly to:', ...DELUXE_GREETS.flatMap(bullet)],
  ];
  return [...logo, '', ...box(sections, '"castaway" 10h lo-fi', '16:9 1080p24'), right('-[ e o f ]-')];
}

// ---------------------------------------------------------------------------------------------
// 5. Lint and markup
// ---------------------------------------------------------------------------------------------
function lint(name, lines, width = W) {
  lines.forEach((l, i) => {
    const where = `${name} line ${i + 1}`;
    if (len(l) > width) throw new Error(`${where} is ${len(l)} columns: ${l}`);
    if (/\s$/.test(l)) throw new Error(`${where} has trailing whitespace`);
    if (/[^\x20-\x7e♪]/.test(l)) throw new Error(`${where} has a character outside ASCII: ${l}`);
  });
  return lines;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pre = (lines) => `<pre>\n${lines.map((l) => (l === '' ? '<b></b>' : esc(l))).join('\n')}\n</pre>`;
// A card in a one-cell table, centred, so it reads as a card and not a full-width code box.
const cardTable = (lines) => `<div align="center">\n<table><tr><td align="left">\n${pre(lines)}\n</td></tr></table>\n</div>`;

// ---------------------------------------------------------------------------------------------
// 6. The page
// ---------------------------------------------------------------------------------------------
const logoRows = slanted('castaway');
if (readBack(logoRows) !== 'castaway') throw new Error(`logo reads back as "${readBack(logoRows)}"`);

const { lines: card, bytes } = solve(mainCard);
lint('castaway.diz', card);
const deluxe = lint('castaway.diz (deluxe)', deluxeCard());
const plotBytes = dosBytes(PLOT);
const ratio = Math.round(bytes / plotBytes);

const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Counts checked ${AS_OF}. -->

${cardTable(card)}

<p align="center"><sub><b>castaway.diz</b> · 40 columns of plain text, as a tiny intro would ship it · ${fmt(bytes)} bytes, about ${ratio} times the length of the plot</sub></p>

**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman stands on a tiny island with one tall palm and a raft, nodding to the music on her headphones, and every few minutes, on the next bar of the music, something happens: a bottle she throws out washes straight back, a drone delivers another pair of headphones, a coconut lands on a hermit crab and walks off with the crab wearing it. More than 90 activities take turns (most of them on four timers, from every 2 to 5 minutes up to every 3 to 6 hours), and every sound is synthesized from code. An unofficial remake inspired by the 1992 screensaver *Johnny Castaway*: sunny, hand-painted, always daytime, and in development.

\`\`\`sh
python tools/serve.py      # then open http://127.0.0.1:8765/
python tools/schedule.py   # check the schedule, simulate a 10-hour run
\`\`\`

<details>
<summary><b>castaway.diz, deluxe</b> · the boxed one: a logo, a plaque, the timers, the actual config</summary>

${cardTable(deluxe)}

The fancy kind of info file: a small slanted logo signed by its artist, then a box with the title on a plaque in its top edge and labelled fields inside. The configuration is the real \`[run]\` table from [activities.toml](activities.toml), where an info file would quote the emulator settings the organisers must use. The typical-run counts are the medians of 200 simulated 10-hour runs, as the file itself says; [tools/schedule.py](tools/schedule.py) validates the schedule and simulates one run, seed 1992 unless told otherwise. Lanes let things overlap, which is how the sea gets on with something while she is busy.

</details>

<details>
<summary><b>plot.txt</b> · ${plotBytes} bytes, for comparison</summary>

${pre(PLOT)}

That is the whole plot, saved as a DOS text file: ${plotBytes} bytes, line end included. The info file is ${fmt(bytes)}. For a 256-byte intro this is normal: the note outweighs the program several times over.

</details>

<details>
<summary><b>the small print</b> · the format, the made-up names, how to run the rest</summary>

- **The format.** A 256-byte or 4k intro is entered in a competition with a short text file beside it, and for a 256-byte entry that file is several times the size of the program. It says what the entry is and how big, how the organisers should run it, what to put on the big-screen slide, and who the author greets. This one does the same for a ten-hour video, at 40 columns. Here the program runs for ten hours and the note still wins, because the plot fits on one line.
- **The made-up names.** *Sitzfleisch 2o26* and its 10h wild compo, the crew *Wait Staff*, the coder *halfshell* and the logo artist *sl0th* are all invented. There is no such party. (*Sitzfleisch* is German for the ability to sit still through something long. Bring some.)
- **Her.** In the art she is the \`(o)\`: the brackets are her cream headphones; the two o's up in the crown are coconuts. She is a young woman with brown hair in a loose low bun, a coral tank top, cream shorts and bare feet.
- **The renderer** is a web page, [web/index.html](web/index.html), served by [tools/serve.py](tools/serve.py) at http://127.0.0.1:8765/ with a live preview and an export to a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. The video is 16:9, 1080p at 24 fps. Chrome encodes it frame-exact as H.264 with WebCodecs (68 to 78 frames a second at 1080p, as measured), and the server mixes the sound (with numpy) and joins the two (with ffmpeg). Hard cuts and stepped movement are the motion defaults.
- **The dev reel.** [tools/render_demo.py](tools/render_demo.py) \`--dev\` renders every activity with a heads-up display (the older Python reference renderer).
- **Status.** In development. No video has been published and there is no public link. The working log is [MUSING.md](MUSING.md).

<sub>Castaway is an unofficial remake inspired by the 1992 screensaver <i>Johnny Castaway</i>, which belongs to its owners; this project is not affiliated with them. The info-file layout follows the plain text files that travel with tiny intros at demoparties; no one's wording, logo or greetings is reproduced.</sub>

</details>
`;

if (/\u2014/.test(md)) throw new Error('em dash in the page');
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: main card ${card.length} lines, ${bytes} bytes; deluxe ${deluxe.length} lines`);
