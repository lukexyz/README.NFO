// Usenet line art header for the Castaway README (style nfo-10, "the signed picture").
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/11-usenet-line-art_opus_5.5.mjs
// It rewrites examples/castaway/11-usenet-line-art_opus_5.5.md. Edit this file, not that.
//
// The style: in the 1990s, ASCII art on Usenet (alt.ascii-art and friends) and in email
// signatures meant small figurative pictures in plain 7-bit ASCII, under 72 columns, signed
// with the artist's initials against the lower edge. Its best-known practitioner, Joan G.
// Stark (who signed "jgs"), drew in the "line style": contours only, each mark chosen by
// where its ink sits in the character cell. Low marks ( _ . , ) middle marks ( - ~ = ) and
// high marks ( ' " ` ^ ) are strung together to make gentle slopes, parentheses, slashes and
// pipes make the steep edges, and o O @ 6 make eyes and dots. A picture usually came with one
// line of lettering. That technique is all this file borrows: every picture here is new, drawn
// for this project, and signed with invented initials ("op"), never with anyone else's.
//
// The header is one Usenet article: headers, one line of lettering, a picture with its
// caption set beside it in the sky, a reply to a lurker's questions in quoted style, and a
// four-line signature (the alt.ascii-art FAQ asked for four or fewer). Two follow-ups fold
// away below it: a sheet of small signed pictures of the project's gags, and the numbers.
//
// Rules the build enforces (it throws rather than write a broken file):
//   * every character of every article is 7-bit printable ASCII, as Usenet intended;
//   * every line is under 72 columns (the FAQ's limit), with no tabs and no trailing spaces;
//   * every picture is signed "op" somewhere on its last two rows;
//   * the "Lines:" header counts the body it sits above, as a newsreader would.
// One deliberate liberty: a real signature separator is "-- " (dash, dash, space). The
// README lint forbids trailing spaces, so here it is written "--".
//
// Pictures are drawn as text stamps, composed back to front. In the stamps a space is
// transparent, '#' is an opaque blank (it rubs out what is behind), and '´' stands for a
// backtick, which cannot appear inside a JavaScript template literal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '11-usenet-line-art_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const MAX_COLS = 71; // "keep it under 72"

// ------------------------------------------------------------------ inline markup
// Lines are built as plain strings. Bold and links are zero-width markers, so widths can
// be measured exactly; HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[-]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const len = (s) => [...visible(s)].length;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([-])/g, (_, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');
// Mark up the first occurrence of `text` on a line (after layout, so widths are unchanged).
const markup = (line, text, wrap) => {
  const at = line.indexOf(text);
  if (at < 0) throw new Error(`cannot find "${text}" in: ${line}`);
  return line.slice(0, at) + wrap(text) + line.slice(at + text.length);
};

// ------------------------------------------------------------------ the canvas
const canvas = (w, h) => Array.from({ length: h }, () => Array(w).fill(' '));
const stamp = (g, r, c, art) => {
  art.replace(/^\n/, '').replace(/\n$/, '').split('\n').forEach((l, i) => {
    [...l].forEach((ch, j) => {
      if (ch === ' ') return;
      if (!g[r + i] || c + j < 0 || c + j >= g[0].length) throw new Error(`stamp spills off the canvas at row ${r + i}, col ${c + j}`);
      g[r + i][c + j] = ch === '#' ? ' ' : ch === '´' ? '`' : ch;
    });
  });
};
const rows = (g) => g.map((r) => r.join('').replace(/\s+$/, ''));
const art = (s) => rows((() => {
  const lines = s.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const g = canvas(Math.max(...lines.map((l) => [...l].length)), lines.length);
  stamp(g, 0, 0, s);
  return g;
})());

// ------------------------------------------------------------------ one line of lettering
// Drawn for this header: a lowercase line hand in the same marks as the pictures. The wave
// along the baseline runs into the tail of the y.
const LETTERING = art(String.raw`
   .--.                .
  /       .--.   .--  -+-   .--.   .   .   .--.   .   .
 |       (   |   ´-.   |   (   |   | | |  (   |   |   |
  ´--'    ´--'´  --'   ´-   ´--'´  ´-'-'   ´--'´  ´--'|
   _.-~-._.-~-._.-~-._.-~-._.-~-._.-~-._.-~-._.-~-._.--'
`);

// ------------------------------------------------------------------ the picture
// The island, the palm, her (eyes shut, busy with a coconut), the raft, a bottle on its way
// back, the visiting turtle, and a ship on the horizon that she is not going to see.
function picture() {
  const g = canvas(MAX_COLS, 18);
  const at = (r, c, s) => stamp(g, r, c, s);
  // the caption, in the sky
  at(0, 46, String.raw`
castaway (working title)
a ten-hour lo-fi video:
one island, one palm,
one raft, her.
`);
  // horizon
  at(9, 0, String.raw`
 ______                  _____ ____ __ _____ ____ ___  __ _________ ___
`);
  // a gull
  at(1, 40, String.raw`
\/
`);
  // the ship, sitting on the horizon, smoke going up
  at(5, 46, String.raw`
          , o O
       ___|_|___
  ____|_________|____
  \ o  o  o  o  o  o /
   \________________/
`);
  // the palm's crown
  at(0, 0, String.raw`
                 _
          _.-~~-' ´.     _.--._
       .-'  _.--._  \  .' _.._ ´-._
     .'  .-' \  \ ´. \/ .'\  \ ´-. ´-.
    /  .' \   \    ´(@@)'  \   \  ´.  ´.
   / .'    \   \   /))\     \   \   ´.  \
   |/           \ / (( ´     ´       ´. |
   '             '   \\               ´.'
`);
  // the trunk, down through the horizon
  at(8, 19, String.raw`
##))##
##((##
  ||
`);
  // the island
  at(11, 0, String.raw`
     _.--         -''''-.__
  .-'   ,          \|/     ´-.
.'         .          ,       ´.
~~~ ~~~~~~ ~~~~ ~~~~~~ ~~~~ ~~~~~~ ~~~
`);
  // her (the horizon stops short of her head, so it cannot be read as her arms)
  at(9, 7, String.raw`
  d(-_-)b
  _\)_(@)
  (__/#\__)
`);
  // the raft
  at(12, 38, String.raw`
    ______________
   /_/_/_/_/_/_/_/
  (_)(_)(_)(_)(_)(_)~~
`);
  // the bottle, washing straight back
  at(15, 6, String.raw`
   _
  | |
~/   \~
`);
  // the sea
  at(15, 0, String.raw`
                 ~~~~         ~~~       ~~
   ~~~       ~~       ~~~~        ~~~
`);
  // the turtle
  at(15, 44, String.raw`
          _.-""-._
   ,-.  .'\__/\__/´.
  ( o )/__/  \/  \__\~~
`);
  at(17, 68, 'op');
  return rows(g).map((l) => (l.includes('castaway (working') ? markup(l, 'castaway', B) : l));
}


// ------------------------------------------------------------------ the gallery
// Small pictures of things the schedule really does, for the follow-up. Each is signed.
// `wide` pieces take a whole line; the rest are hung in pairs.
const GALLERY = [
  {
    name: 'shark',
    art: String.raw`
   ,   '                ,  .-.  '
  d(-_-)b               d/  |b
  _\)_(\_               /   |
 (__/ \__)             /    |
_.-------._ ~~~ ~~~~~ /_____|~~~~
   ~~~~      ~~~~       ~~~~   op
`,
    caption: 'the shark. it surfaces in headphones, nodding to the same beat. they nod. it leaves.',
  },
  {
    name: 'cat',
    // tabby stripes on the brow, eyes shut, the white chest left blank between the legs
    art: String.raw`
     /\.--./\
    / ,'''', \
   (  -    -  )
  =-.   Y    .-=
     ´-.__.-'
     /'    ´\
    ( (    ) )___
  __(_(____)_)___)__
 |\________________/|
 ||    |     |     ||
~||____|_____|_____||~ op
`,
    caption: 'the cat. grey tabby, white chest. arrives on a crate, climbs the palm, naps. one day it floats off. it comes back.',
  },
  {
    name: 'coconut',
    art: String.raw`
         _.----._
       .'  o  o  ´.
      /      o     \
     |              |  oo
      \            /   ||
       ´-.______.-'   _//
       /\/\/\  /\/\/\(_/  op
`,
    caption: 'a coconut fell on a hermit crab. the coconut is now leaving.',
  },
  {
    name: 'drone',
    art: String.raw`
                   -===-   -===-
                      |__.-.__|
                         ´-'
      .--.
     d    b
  ___|____|___
 |\__________/|
 |            |
 |____________| op
`,
    caption: 'a delivery drone. inside the parcel: another pair of headphones.',
  },
  {
    name: 'signal',
    art: String.raw`
           .------.
           | Y.   |
           |      |
           ´------'
              \\
     _.-~~-._  \\  _.-~~-._
   .'  _.-~~ d(o_o)b ~~-._ ´.
  / .-'  \  \  \/  /  / ´-. \
 /.'      \   (@@)   /     ´.\
              ))            op
`,
    caption: 'the signal hunt. one bar, at the very top of the palm.',
  },
  {
    name: 'coffee',
    art: String.raw`
         d(^_^)b    /
          /)_(\____[=]
          (___)    |_|
           / \
  ~~ ~~~  /   \  ~~~~ ~~~
    ~~~~   ~~~  ~~~    ~~  op
`,
    caption: 'she could leave any time. she walks out over the water and comes back with an iced coffee.',
  },
  {
    name: 'sandcastle',
    art: String.raw`
          |>
       _  |  _           .-~~-.
      | |_|_| |        .' .-. )
  _   |  ___  |   _  .'  ( '-'
 | |__|_|   |_|__| |    ´-.
_|_________________|_~~~ ~~ ´~ op
`,
    caption: 'a sandcastle. the tide comes for it. she builds another.',
  },
  {
    name: 'tour boat',
    art: String.raw`
      []  []    []   []
      \o  o/   \o/   o/
 ______|__|_____|____|____
 \   o    o    o    o    /
~~\_____________________/~~ op
`,
    caption: 'a tour boat. everyone takes a selfie with her in the background. nobody offers a lift.',
  },
  {
    name: 'hammock',
    wide: true,
    art: String.raw`
        _.-~~-.    _.--._
     .-'  _.-. \  / .-. ´-.
   .'  .-'  \ ´.\/.' /   ´. ´.
  /  .'  \   ´(@@)'   \    ´. \
  | /         /))\          \ |
  '           ((             ´'
               \\
               ||´-._
               ||    ´-._                       ______________
               ||        ´-.__d(-_-)b__.--''''-/_/_/_/_/_/_/_/
               ||             ´------'        (_)(_)(_)(_)(_)(_)
  ~~~ ~~~ ~~~__||__~~~ ~~~~ ~~~ ~~~~ ~~~ ~~~ ~~~~ ~~~~~ ~~~~ ~~ op
`,
    caption: 'bushcraft. she weaves a beautiful hammock and ties one end to the palm. there is no second tree. the other end goes on the raft.',
  },
];

const PAIR_COL = 36; // where the right-hand picture of a pair starts
const CAP_W = 33; // caption width in a pair

const wrap = (text, width) => {
  const out = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > width) { out.push(line); line = word; } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
};

function galleryLines() {
  const out = [];
  const pieces = GALLERY.map((p) => ({ ...p, lines: art(p.art) }));
  for (const p of pieces) {
    const last2 = p.lines.slice(-2).join('\n');
    if (!/\bop\b/.test(last2)) throw new Error(`${p.name}: unsigned (no "op" on its last two rows)`);
    const w = Math.max(...p.lines.map((l) => l.length));
    if (!p.wide && w > PAIR_COL - 2) throw new Error(`${p.name}: ${w} wide, too wide to hang in a pair`);
  }
  let i = 0;
  while (i < pieces.length) {
    const a = pieces[i];
    if (a.wide) {
      out.push(...a.lines, '', ...wrap(a.caption, 66).map((l) => `  ${l}`), '');
      i += 1;
      continue;
    }
    const b = pieces[i + 1] && !pieces[i + 1].wide ? pieces[i + 1] : null;
    i += b ? 2 : 1;
    // bottom-align the two pictures so their waterlines sit on the same row
    const h = Math.max(a.lines.length, b ? b.lines.length : 0);
    const pad = (ls) => [...Array(h - ls.length).fill(''), ...ls];
    const la = pad(a.lines);
    const lb = b ? pad(b.lines) : [];
    const ca = wrap(a.caption, CAP_W);
    const cb = b ? wrap(b.caption, CAP_W) : [];
    const join = (l, r) => (r ? l.padEnd(PAIR_COL) + r : l).replace(/\s+$/, '');
    for (let k = 0; k < h; k++) out.push(join(la[k], lb[k] || ''));
    out.push('');
    for (let k = 0; k < Math.max(ca.length, cb.length); k++) out.push(join(`  ${ca[k] || ''}`, cb[k] ? `  ${cb[k]}` : ''));
    out.push('', '');
  }
  while (out[out.length - 1] === '') out.pop();
  return out;
}

// ------------------------------------------------------------------ the articles
const FROM = 'From: Ottilie Penhallow <op@NOSPAM.lagoon.invalid>';
const GROUPS = 'Newsgroups: alt.ascii.tiny-islands,alt.lofi.nothing-happens';
const MSGID = '<seed-1992.one-palm@lagoon.invalid>';
const lnk = (path) => A(path, path);
// "left ...... right", with the right-hand text starting in a fixed column
const leader = (left, right, col = 40) => `${left} ${'.'.repeat(Math.max(2, col - len(left) - 2))} ${right}`;
const LOCAL = 'http://127.0.0.1:8765/';
// How many [activities.*] tables activities.toml holds. It moves (81 -> 92 on 2026-10-01 alone),
// so re-check before publishing, read-only:
//   python -B -c "import tomllib; print(len(tomllib.load(open('activities.toml','rb'))['activities']))"
const ACTIVITIES = 92;

const PICTURE = picture();
if (!/\bop\b/.test(PICTURE.slice(-2).join('\n'))) throw new Error('the picture is unsigned');
const mainBody = [
  '',
  ...LETTERING,
  '',
  ...PICTURE,
  '',
  'In article <lurk.41@inlet.invalid>, a lurker wrote:',
  '> does anything actually happen in it?',
  '',
  'Every few minutes, something. A turtle swims in and they both doze',
  'off. A bottle goes out and washes straight back. A coconut falls on',
  'a hermit crab, who walks off wearing it. In between, she nods to the',
  'music. For ten hours. On purpose.',
  '',
  '> there is a ship behind her.',
  '',
  'There is. She is busy with a coconut. She will not see it.',
  '',
  '> how do I watch it?',
  '',
  'Instructions in sig.',
  '',
  '--',
  `   _\\/_     Ottilie Penhallow (op), drawing one island since tuesday`,
  `    ))      python ${lnk('tools/serve.py')}, then open ${A(LOCAL, LOCAL)}`,
  `  ~~||~~    "she could leave any time."`,
];
const mainArticle = [
  FROM,
  GROUPS,
  markup('Subject: [ASCII] Castaway (was: Re: does anything happen?)', 'Castaway', B),
  'Date: Thu, 1 Oct 2026 09:41:07 +0100',
  `Message-ID: ${MSGID}`,
  `Lines: ${mainBody.length - 1}`, // the blank line after the headers is not body
  ...mainBody,
];

const gallery = galleryLines();
const HOW_MANY = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][GALLERY.length];
const galleryArticle = [
  FROM,
  'Subject: Re: [ASCII] Castaway (requests)',
  `References: ${MSGID}`,
  '',
  `You asked for more. Here are ${HOW_MANY}, and every one of them is in the`,
  'schedule. Same island, same initials. If you repost one, leave the',
  'initials on. That is the rule.',
  '',
  '',
  ...gallery,
  '',
  '--',
  'op',
];

const faqArticle = [
  FROM,
  'Subject: Re: [ASCII] Castaway (how often, though?)',
  `References: ${MSGID}`,
  '',
  'In article <lurk.42@inlet.invalid>, the same lurker wrote:',
  '> but how often is "every so often"?',
  '',
  `${lnk('activities.toml')} lists ${ACTIVITIES} activities, each with its beats, how long it`,
  'lasts and how often it comes round. There are four timers:',
  '',
  '    regular ........ every 2 to 5 minutes ..... about 155 a run',
  '    occasional ..... every 12 to 25 minutes ... about 30',
  '    rare ........... every 30 to 60 minutes ... about 13',
  '    super rare ..... every 3 to 6 hours ....... about 2 (3 at most)',
  '',
  'plus 15 to 20 chained follow-ups, such as the tide coming for the',
  'sandcastle. Those are typical counts from 200 simulated 10-hour runs.',
  'She is busy for under a third of the time and idles for the rest.',
  'Lanes let things overlap, which is how a ship gets past while she is',
  'busy. Every activity starts on the next bar of the music, every 3',
  'seconds, so the gags land on the beat. The default run is 10:00:00,',
  'seed 1992.',
  '',
  '> and the scenery?',
  '',
  '26 entries of scene life. Two are built: waves on the shore, and',
  'cloud shadows drifting over the sea. The other 24 are planned, among',
  'them distant birds, planes with vapour trails, whale pods, dolphins,',
  'sailboats, sandpipers, a gecko and a rain shower. It is always',
  'daytime. That is a rule.',
  '',
  '> what does it sound like?',
  '',
  'Nobody knows yet. Every sound is synthesized from code by',
  `${lnk('tools/make_audio.py')}: no samples, no loop packs, no recordings,`,
  'so no third-party licence applies. The theme is a seamless 60-second',
  'loop at 80 BPM in F major, ii-V-I-vi: 20 bars of exactly 3 seconds,',
  'with electric piano, a kalimba lead, soft drums and a vinyl hiss.',
  'The ocean is a seamless 60-second loop too. The mix sits at -14 LUFS',
  'with true peak at or below -1 dBTP, and every level can be set in',
  'master and per routine. It has been measured thoroughly. It has not',
  'yet been heard by anyone.',
  '',
  '> and the renderer?',
  '',
  `A web page (${lnk('web/index.html')}) with a live preview and an export to a`,
  'YouTube-ready MP4. Plain ES modules, no build step, no npm. It exports',
  'frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a',
  'second at 1080p30 in Chrome); the server mixes the sound and joins',
  'the two. 16:9, 1080p, 30 fps. Motion: hard cuts and stepped',
  'movement, by default.',
  '',
  leader(`    python ${lnk('tools/serve.py')}`, `then ${A(LOCAL, LOCAL)}`),
  leader(`    python ${lnk('tools/schedule.py')}`, 'check it, simulate 10 hours'),
  leader(`    python ${lnk('tools/render_demo.py')} --dev`, 'a dev reel, every activity'),
  '',
  '> is it out?',
  '',
  `No. It is in development: no video yet, no link. Notes: ${lnk('MUSING.md')}.`,
  '',
  '--',
  'op',
];

// ------------------------------------------------------------------ checks
const checkBlock = (lines, where) => {
  lines.forEach((l, i) => {
    const v = visible(l);
    if ([...v].length > MAX_COLS) throw new Error(`${where} line ${i + 1} is ${[...v].length} wide: ${v}`);
    if (/\s$/.test(v)) throw new Error(`${where} line ${i + 1} has trailing space: ${v}`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`${where} line ${i + 1} is not 7-bit printable ASCII: ${v}`);
  });
};
checkBlock(mainArticle, 'article');
checkBlock(galleryArticle, 'gallery');
checkBlock(faqArticle, 'faq');

// ------------------------------------------------------------------ the markdown around it
const PROSE = [
  '**Castaway** (working title) is a ten-hour lo-fi video for YouTube: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music in her headphones, and every few minutes something happens, always on the beat. Every sound, from the kalimba theme to the waves, is synthesized from code, and nobody has heard any of it yet. It is an unofficial homage to the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, with a new castaway and a sunny, hand-painted coastal anime look. It is always daytime, and it is still in development.',
];
for (const p of PROSE) if (/[–—]/.test(p)) throw new Error('house style: no dashes of that kind in prose');

const pre = (lines) => `<pre>\n${lines.map(toHtml).join('\n')}\n</pre>`;
const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(mainArticle),
  '',
  ...PROSE,
  '',
  '```sh',
  'python tools/serve.py      # then open http://127.0.0.1:8765/',
  'python tools/schedule.py   # check the schedule, simulate a 10-hour run',
  '```',
  '',
  '<details>',
  `<summary><b>Re: [ASCII] Castaway (requests)</b>: ${HOW_MANY} more small pictures, all signed</summary>`,
  '',
  pre(galleryArticle),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>Re: [ASCII] Castaway (how often, though?)</b>: the schedule, the sound, the renderer</summary>',
  '',
  pre(faqArticle),
  '',
  '</details>',
  '',
].join('\n');
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} (${mainArticle.length} + ${galleryArticle.length} + ${faqArticle.length} lines)`);
