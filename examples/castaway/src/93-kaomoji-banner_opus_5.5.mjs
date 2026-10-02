// Kaomoji and one-line AA header (catalogue entry asia-07) for the Castaway README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/93-kaomoji-banner_opus_5.5.mjs
// It rewrites examples/castaway/93-kaomoji-banner_opus_5.5.md. Edit this file, not the .md.
//
// The style. Upright faces built from brackets and symbols (Japan, from 1986), which grew arms,
// props and half-width katakana sound words on the 2channel boards and became one-line banners.
// Nothing has to line up with the row above, so they survive any font: every line in this header
// is its own centred line of text in the page font, and each glyph may come from a different
// fallback font on the reader's machine. That is the look, not a bug. No images at all.
//
// The cast is a set of faces defined once, below:
//   her        d(･ω･)b    the d and the b are her cream headphones. From behind she is d(  ｡  )b,
//                         and the ｡ (a half-width full stop, which sits low) is her low bun.
//   the shark  d(˘皿˘)b    also in headphones; 皿 is the usual kaomoji mouth for bared teeth.
//   the cat    (=･ω･=)    grey tabby; it arrives on a crate ▤.
// and so on. Faces that are a named 2channel character's identity (Mona, Giko, Morara, Boon,
// Shobon) and the over-used western memes (shrug, table flip, Lenny, deal-with-it sunglasses)
// are deliberately not used.
//
// What the header does, top to bottom:
//   1. the celebration banner: the name between two arms-up faces on a heavy rule, as the h1;
//   2. the wall: sixty identical nodding faces, one per bar of music, wrapped by the browser so
//      it reflows at any width. Two are impostors: the shark in headphones, and a double pair;
//   3. a turning-head strip: she looks all the way round, and ｼｰﾝ (silence);
//   4. the pitch;
//   5. the four timers as a crescendo: the rarer the event, the longer the rule and the louder
//      the face, ending in the キタ━━━ banner ("it's here!") that the boards kept for the
//      long-awaited thing finally happening;
//   6. synthesized sound, and how to run it;
//   7. folded away: the gag reel one line each, a dictionary of the sound words, the cast, the
//      orz family (Japan, Korea, China and Taiwan), the numbers, and credits with a bow.
//
// Japanese, Korean and Chinese used here (all checked): キタ (kita, "it's here", 来た), ｼｰﾝ
// (shīn, manga's sound of silence), ｼｬｶｼｬｶ (music leaking from headphones), ｼｬｶ (the shaka hand
// sign, as Japanese surfers call it), ﾄﾞﾝﾌﾞﾗｺ (the peach bobbing down the river in Momotarō),
// ｵﾜﾀ (owata, "it's all over", 終わった), ㅠ (the Hangul vowel yu, used as tears), 囧 (jiǒng,
// an old character for a lit window, used in China and Taiwan as a dismayed face). The other
// sound words and their meanings are in SOUND_WORDS.
//
// Facts. Every number is from D:/python/castaway (activities.toml, MUSING.md, tools/*) or the
// orchestrator's checked list of 2026-10-01, re-checked on 2026-10-02: activities.toml held 94
// activities (81 on timers, 13 chained); the header says "more than 90" so it ages well. The
// video is 24 fps since the 2026-10-01 decision in MUSING.md (it was 30). 12,000 bars =
// 10:00:00 / 3 s. Sound files: "more than 150" (181 in media/audio/audio_catalog.json). The gags
// shown are all in activities.toml and all wholesome.
//
// GitHub. Everything that holds a face sits in a raw HTML block (p/h1/table, align="center"),
// so Markdown never touches the faces (no stray emphasis from _ or *). Text is HTML-escaped.
// Each face is glued together with &nbsp; and invisible WORD JOINERs, so a narrow screen wraps
// only between faces, never inside one. Faces carry aria-hidden where a caption already says
// what they show (a screen reader would otherwise spell out every bracket), and katakana, hangul
// and hanzi carry lang= so fallback fonts and screen-reader voices pick the right language.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '93-kaomoji-banner_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------- helpers
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const WJ = String.fromCharCode(0x2060); // WORD JOINER: invisible, forbids a line break where it sits
const ZWSP = String.fromCharCode(0x200b); // ZERO WIDTH SPACE: invisible, allows a line break here
const langOf = (s) => {
  if (/\u56e7/.test(s)) return 'zh'; // 囧
  if (/[\u3130-\u318f\uac00-\ud7af]/.test(s)) return 'ko'; // hangul
  // Any other face with a non-ASCII character is a Japanese emoticon: lang="ja" makes every
  // symbol in it (arcs, tildes, rules, dots) fall back to the same Japanese font, as on the boards.
  if (/[^\x00-\x7f]/.test(s)) return 'ja';
  return '';
};
// One unbreakable unit: escaped, spaces made non-breaking, word joiners between characters,
// and a lang= span (ja, or ko/zh for the hangul and hanzi faces) when it is not plain ASCII.
const u = (s) => {
  const body = esc([...s].join(WJ)).replace(/ /g, '&nbsp;');
  const lang = langOf(s);
  return lang ? `<span lang="${lang}">${body}</span>` : body;
};
// A line of units with breakable gaps between them.
const line = (units, gap = '&nbsp; ') => units.map(u).join(` ${gap}`);
const hide = (s) => `<span aria-hidden="true">${s}</span>`;
const sub = (s) => `<sub>${s}</sub>`;
const a = (href, text = href) => `<a href="${href}">${esc(text)}</a>`;
const code = (s) => `<code>${esc(s)}</code>`;
// Plain prose with any katakana/hangul/hanzi run wrapped in its lang= span.
const prose = (s) => esc(s).replace(/[\u3040-\u30ff\uff61-\uff9f\u4e00-\u9fff\u3130-\u318f\uac00-\ud7af]+/g, (m) => `<span lang="${langOf(m)}">${m}</span>`);

// ---------------------------------------------------------------- the cast
const HER = {
  idle: 'd(･ω･)b',
  nod: 'd(-ω-)b',
  bliss: 'd(˘ω˘)b',
  wide: 'd(°ω°)b',
  sweat: 'd(･ω･;)b',
  wince: 'd(>ω<)b',
  shock: 'Σd(°Д°)b',
  joy: 'd(°∀°)b',
  cheer: 'ヽd(≧ω≦)bﾉ',
  palms: 'd(ლ_ლ)b',
  back: 'd(  ｡  )b',
};
const CAT = { up: '(=･ω･=)', nap: '(=-ω-=)zzZ' };
const SHARK = 'd(˘皿˘)b';
const TURTLE = { up: '(⌒⌒)ε･)', nap: '(⌒⌒)ε-)' };
const CRAB = 'ε●з';
const BRO = 'ﾐ(＾▽＾)ﾉ';
const DRONE = '×━┳━×';
const FISH = '<゜)))彡';
const SPARE = 'd　b';

// The turning-head strip: front, turning to her left, one eye left, the back of her head (with
// the bun), coming round from the other side, front again. The gaps are sized so every frame is
// about as wide as the front face in a typical Japanese fallback font (･ and ｡ are half-width).
const STRIP = ['d(･ω･)b', 'd(  ･ω)b', 'd(    ･)b', HER.back, 'd(･    )b', 'd(ω･  )b', 'd(･ω･)b'];

// The four timers as a crescendo. Each rule is longer than the last. A face is a list of units
// joined by an invisible ZERO WIDTH SPACE: on a desktop each rule runs straight into the face, one
// unbroken banner as the boards typed it, and a phone may still break it apart there.
const TIERS = [
  { every: 'every 2 to 5 min', face: [HER.idle], eg: 'a coconut, a jog, some fishing' },
  { every: 'every 12 to 25 min', face: ['━', HER.wide, '━!'], eg: 'a sea turtle drops by' },
  { every: 'every 30 to 60 min', face: ['━━━', HER.shock, '━━━!!'], eg: 'a shark in headphones (see above)' },
  { every: 'every 3 to 6 hours', face: ['キタ━━━━━', HER.joy, '━━━━━!!!!'], eg: 'she walks off across the sea, and back' },
];

// The wall: nodding faces, wrapped by the browser. Two impostors, placed so that on a desktop
// README (about twelve faces a row) they land mid-row, two rows apart.
const WALL = {
  count: 60,
  odd: { 17: 'd(-皿-)b♪', 44: `d${HER.nod}b♪` },
  caption: 'A few of the 12,000 bars in a 10-hour run, one nod each. One of these is a shark in headphones. One of them has had a delivery.',
};

// ---------------------------------------------------------------- the gag reel
// Each gag: one line of units, then what happens. Only gags in activities.toml, all wholesome.
const GAGS = [
  {
    aa: [`${HER.idle}ﾉ⌒▭`, 'ﾎﾟﾁｬﾝ', '～～～', 'ｻﾞｻﾞｰﾝ', '▭ｺﾛﾝ', HER.sweat],
    what: 'She writes a note, bottles it and throws it out to sea. It washes straight back to her feet. Hours later a different bottle washes up. It is a reply.',
  },
  {
    aa: [DRONE, 'ｳｨｰﾝ', '▣', 'ﾊﾟｶｯ', `[ ${SPARE} ]`, HER.wide, `d${HER.idle}b?`],
    what: 'A delivery drone lowers a parcel and leaves. Inside: another pair of headphones. (The double pair is wishful thinking.)',
  },
  {
    aa: ['●ｺﾞﾂﾝ!', HER.wince, '･･･', CRAB, 'ﾄｺﾄｺ'],
    what: 'She is reading against the palm when a coconut drops squarely onto a passing hermit crab. She winces behind her book. Then the coconut walks off.',
  },
  {
    aa: ['～～▲～～', 'ﾁｬﾎﾟﾝ', `${SHARK}♪`, `${HER.bliss}♪`],
    what: 'A fin circles the island. The shark surfaces in headphones, nodding on the same beat. They nod. It leaves.',
  },
  {
    aa: ['ﾄﾞﾝﾌﾞﾗｺ', `▤${CAT.up}`, 'ﾖｼﾞﾖｼﾞ', CAT.nap, '･･･', `▤${CAT.up}ﾉ`, 'ﾄﾞﾝﾌﾞﾗｺ'],
    what: 'A stray cat (grey tabby, white chest) floats in on a crate, climbs the palm and naps. One day it floats off again. It comes back another time.',
  },
  {
    aa: [`${HER.idle}ﾉ□`, '?', 'ﾖｼﾞﾖｼﾞ', 'ヽd(≧ω≦)bﾉ□▂', 'ﾋﾟｺﾝ'],
    what: 'No signal. She wanders round with her phone up, climbs the palm, and finds one bar, at the very top.',
  },
  {
    aa: ['ｻﾞｻﾞｰﾝ', TURTLE.up, HER.idle, '･･･', TURTLE.nap, HER.bliss, 'ｳﾄｳﾄ'],
    what: 'A sea turtle swims in, crawls up beside her, and they both doze off.',
  },
  {
    aa: ['ﾊﾟｼｬ', 'v(^_^)(^▽^)v', 'ﾊﾟｼｬ', '･･･', HER.idle],
    what: 'A small tour boat pulls up. Everyone takes selfies with her in the background. Nobody offers a lift.',
  },
  {
    aa: ['ｽｲｰ', `${BRO} ｼｬｶ!`, HER.cheer, '･･･', HER.palms],
    what: 'A bro on an electric hydrofoil carves in close. She runs over, waving. He gives her a shaka and a big smile and carves off. Double face palm.',
  },
  {
    aa: ['ｸﾙｸﾙｸﾙ', 'ﾎﾞｯ!', HER.cheer, 'ｻﾞﾊﾞｰﾝ', 'ｼﾞｭｯ', HER.idle],
    what: 'Fire by friction: a bow drill until her arms shake, one curl of smoke, a flame. She leaps up, arms raised. A wave puts it out.',
  },
  {
    aa: ['▁▃▅▃▁', 'ﾍﾟﾀﾍﾟﾀ', '～～ｻﾞﾊﾞｰﾝ', '▁▁▁▁▁', 'orz'],
    what: 'She builds a sandcastle. It stays on the beach until the tide comes for it. The tide always comes for it.',
  },
  {
    aa: [`ﾉ━━━ ${FISH}`, `⌒━━━⌒${FISH}`, '･･･', '～v～', `ﾎﾟﾄｯ ${FISH}`],
    what: 'Spear fishing: a heroic lunge, a miss, and the fish take turns jumping over the spear. A gull drops one at her feet, out of pity.',
  },
  {
    aa: [`${HER.idle}つ｡`, 'ﾎﾟﾝﾎﾟﾝ', '･･･', 'ψ', 'ﾆｮｷﾆｮｷ', '･･･', '✿'],
    what: 'She plants a kumara. Hours later it has quietly grown leaves. Later still it flowers, pale lavender. It is a ten-hour video: it has time.',
  },
  {
    aa: [HER.idle, 'ﾃｸﾃｸ', '～～～', 'ｼｰﾝ', '～～～', 'ﾃｸﾃｸ', `${HER.bliss}つ□`],
    what: 'She could leave any time. She walks out across the water and out of frame, the island sits empty for twenty seconds, and she walks back with an iced coffee. Never explained.',
  },
];

// ---------------------------------------------------------------- sound words
// [word as typed on the boards, reading, what it means, where it would be in Castaway]
const SOUND_WORDS = [
  ['ｼｰﾝ', 'shīn', 'silence; nothing happening', 'most of the ten hours'],
  ['ｼｬｶｼｬｶ', 'shakashaka', 'music leaking out of headphones', 'her, all day'],
  ['ｻﾞｻﾞｰﾝ', 'zazān', 'waves breaking on a shore', 'the ocean loop, always on'],
  ['ﾎﾟﾁｬﾝ', 'pochan', 'something small plopping into water', 'the bottle, going out'],
  ['ｺﾛﾝ', 'koron', 'something small rolling to a stop', 'the bottle, coming back'],
  ['ｳｨｰﾝ', 'wīn', 'the whirr of a small motor', 'the delivery drone'],
  ['ﾊﾟｶｯ', 'paka', 'a lid popping open', 'the parcel'],
  ['ｺﾞﾂﾝ', 'gotsun', 'a hard bonk', 'coconut, meet crab'],
  ['ﾄｺﾄｺ', 'tokotoko', 'small, busy footsteps', 'the coconut, leaving'],
  ['ﾁｬﾎﾟﾝ', 'chapon', 'a soft splash', 'the shark, surfacing'],
  ['ﾄﾞﾝﾌﾞﾗｺ', 'donburako', 'something big bobbing along (the peach in Momotarō)', 'the cat, on its crate'],
  ['ﾖｼﾞﾖｼﾞ', 'yojiyoji', 'clambering up', 'the palm, for signal or a nap'],
  ['ﾋﾟｺﾝ', 'pikon', 'a notification blip', 'one bar'],
  ['ｳﾄｳﾄ', 'utouto', 'nodding off', 'the turtle visit'],
  ['ﾊﾟｼｬ', 'pasha', 'a camera shutter', 'the tour boat'],
  ['ｽｲｰ', 'suī', 'gliding along smoothly', 'the hydrofoil'],
  ['ｼｬｶ', 'shaka', 'the hand sign, in surf talk', 'the hydrofoil bro (no relation to ｼｬｶｼｬｶ)'],
  ['ｸﾙｸﾙ', 'kurukuru', 'spinning round and round', 'the bow drill'],
  ['ﾎﾞｯ', 'bo', 'a flame catching', 'fire by friction'],
  ['ｻﾞﾊﾞｰﾝ', 'zabān', 'a big wave crashing in', 'the fire, the sandcastle'],
  ['ｼﾞｭｯ', 'ju', 'the hiss of water on a fire', 'the fire, briefly'],
  ['ﾍﾟﾀﾍﾟﾀ', 'petapeta', 'patting', 'the sandcastle'],
  ['ﾎﾟﾝﾎﾟﾝ', 'ponpon', 'light pats', 'the kumara, tucked in'],
  ['ﾆｮｷﾆｮｷ', 'nyokinyoki', 'shooting up', 'the kumara, hours later'],
  ['ﾃｸﾃｸ', 'tekuteku', 'walking steadily, a fair way', 'across the water, and back'],
  ['ﾎﾟﾄｯ', 'poto', 'something small dropping', 'the gull\'s fish'],
  ['ﾄﾞｷﾄﾞｷ', 'dokidoki', 'a pounding heart', 'the first listen to the soundtrack'],
];

// ---------------------------------------------------------------- the cast, as faces
const CAST = [
  [HER.idle, 'her. The d and the b are her cream headphones.'],
  [HER.back, 'her, from behind. The ｡ is the low bun.'],
  [CAT.up, 'the stray cat (grey tabby, white chest), on the days it visits'],
  [TURTLE.up, 'the sea turtle'],
  [SHARK, 'the shark, also in headphones'],
  [CRAB, 'the hermit crab, wearing a coconut'],
  [BRO, 'the bro on the electric hydrofoil'],
  [DRONE, 'the delivery drone'],
  [SPARE, 'what was in the parcel'],
  [FISH, 'a fish, mid-leap'],
  ['～v～', 'the gull'],
  ['▤', 'a crate. The cat\'s.'],
];

// ---------------------------------------------------------------- the orz family
const ORZ = [
  ['orz', 'Japan: a figure on hands and knees. The o is the head, bowed to the sand.'],
  ['_|￣|○', 'Japan: the older, full-width spelling, facing the other way.'],
  ['OTL', 'Korea: the same figure in capitals. O head, T arms and back, L legs.'],
  ['囧rz', 'China and Taiwan: 囧 (jiǒng), an old character for a lit window, now a dismayed face, as the head.'],
  ['(ㅠ_ㅠ)', 'Korea: ㅠ, the vowel yu, twice, as two streams of tears.'],
];

// ---------------------------------------------------------------- the page
const out = [];
const block = (...lines) => out.push(lines.join('\n'), '');
const P = (...rows) => block('<p align="center">', rows.join('<br>\n'), '</p>');
// A raw HTML table: rows of cells, each cell [html, align?]. No blank lines inside, so GitHub
// keeps it as one HTML block and Markdown never reaches the faces.
const table = (rows, head) => [
  '<table>',
  ...(head ? [`<tr>${head.map(([h, al]) => `<th${al ? ` align="${al}"` : ''}>${h}</th>`).join('')}</tr>`] : []),
  ...rows.map((r) => `<tr>${r.map(([c, al]) => `<td${al ? ` align="${al}"` : ''}>${c}</td>`).join('')}</tr>`),
  '</table>',
].join('\n');

out.push(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`, '');

// 1. the banner: a screen reader hears "CASTAWAY" and nothing else. The rules touch the faces, as
// the boards typed them; an invisible ZERO WIDTH SPACE still lets a phone break the line there.
block(`<h1 align="center">${hide(`${u('━━━')}${ZWSP}${u(HER.cheer)}`)} &nbsp;CASTAWAY&nbsp; ${hide(`${u(HER.cheer)}${ZWSP}${u('━━━!!')}`)}</h1>`);

P(`<b>${esc('Ten hours on one very small island. She nods along. Every so often, something happens.')}</b>`);

// 2. the wall
const wall = Array.from({ length: WALL.count }, (_, i) => WALL.odd[i] ?? `${HER.nod}♪`);
P(hide(wall.map(u).join(' ')), sub(esc(WALL.caption)));

// 3. the turning-head strip
P(
  hide(`${line(STRIP)} &nbsp;&nbsp; ${u('ｼｰﾝ')}`),
  sub(prose('She looks all the way round. Nothing. ｼｰﾝ (shīn) is how a manga spells silence.')),
);

// 4. the pitch
P(
  `<b>Castaway</b> ${esc('(working title) is a stationary-frame lo-fi video for YouTube, the ten-hour kind: a young woman alone on a tiny island with one tall palm, a raft and a pair of cream headphones. She mostly idles, nodding to the music, while more than 90 activities wait their turn. An unofficial remake inspired by the small-island routines of the 1992 screensaver')} <i>Johnny Castaway</i>. ${esc('Always daytime.')}`,
);

// 5. the crescendo: timers line up on the right, the faces build a pyramid in the middle, the
// examples hang off the left. The rarer the timer, the louder the face.
block(
  '<div align="center">',
  table(TIERS.map((t, i) => [
    [esc(t.every), 'right'],
    [hide(((f) => (i >= 2 ? `<b>${f}</b>` : f))(t.face.map(u).join(ZWSP))), 'center'],
    [esc(t.eg)],
  ])),
  '</div>',
);
P(sub(prose('Four timers, and how excited to get about each. Every gag waits for the next bar of the music, so it lands on the beat. キタ (kita): "it\'s here!", as typed on Japanese text boards when the long-awaited thing finally happens.')));

// 6. sound, and how to run it
P(
  `${hide(u('♪ ∿∿∿'))} &nbsp;<b>${esc('every sound is synthesized from code')}</b>&nbsp; ${hide(u('∿∿∿ ♪'))}`,
  sub(`${esc('No samples, no loops, no recordings: more than 150 sounds written by')} ${a('tools/make_audio.py')}${esc(', from the 60-second theme (80 BPM, F major, electric piano and a kalimba lead) to the gulls. Nobody has heard any of it yet.')} ${hide(u(HER.idle))} ${u('ﾄﾞｷﾄﾞｷ')}`),
);

block(
  '```sh',
  'python tools/serve.py      # then open http://127.0.0.1:8765/',
  'python tools/schedule.py   # validate the schedule, simulate a 10-hour run',
  '```',
);

// 7. folded away
const details = (summary, ...body) => block('<details>', `<summary>${summary}</summary>`, '', ...body, '</details>');

details(
  `<b>the gag reel</b>, one line each ${hide(u(HER.wide))}`,
  ...GAGS.map((g) => `<p align="center">\n${hide(line(g.aa))}<br>\n${sub(esc(g.what))}\n</p>\n`),
);

details(
  `<b>sound words</b>: a small dictionary ${u('ｼｬｶｼｬｶ')}`,
  `<p align="center">${sub(esc('Not the real sound effects (those are synthesized, see above). This is how they would be written if Castaway were a manga, half-width, the way the boards typed them.'))}</p>\n`,
  `${table(SOUND_WORDS.map(([w, r, m, where]) => [[u(w), 'center'], [`<i>${esc(r)}</i>`], [esc(m)], [prose(where)]]), [[''], ['reading', 'left'], ['means', 'left'], ['in Castaway', 'left']])}\n`,
);

details(
  `<b>the cast</b>, as faces ${hide(u(CAT.up))}`,
  `<div align="center">\n${table(CAST.map(([f, who]) => [[u(f), 'center'], [prose(who)]]))}\n</div>\n`,
);

details(
  `<b>the tide takes the sandcastle</b>, as typed around East Asia ${hide(u('orz'))}`,
  `<p align="center">\n${hide(line(['▁▃▅▃▁', '～～ｻﾞﾊﾞｰﾝ', '▁▁▁▁▁']))}<br>\n${sub(esc('The tide takes the sandcastle (it follows every sandcastle, as a chained event). Her reaction, as typed around East Asia:'))}\n</p>\n`,
  `<div align="center">\n${table(ORZ.map(([f, what]) => [[u(f), 'center'], [prose(what)]]))}\n</div>\n`,
);

details(
  `<b>the numbers</b> ${hide(u('φ(･ω･)'))}`,
  `- **The schedule.** ${a('activities.toml')} ${esc('lists more than 90 activities (94 on 2026-10-02, and growing). Most sit on four timers: regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, super rare every 3 to 6 hours (at most 3 a run). The rest are chained follow-ups, never picked by a timer: they wait for another activity to call them. In a typical 10-hour run (median of 200 simulated runs) that is about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus about 20 follow-ups. She is busy about a third of the time and idling the rest.')}`,
  `- **The beat.** ${esc('Every activity starts on the next bar of the music, every 3 seconds: 12,000 bars in the default 10:00:00 run (seed 1992). Lanes let things overlap, so a visitor can turn up while she is busy with something else.')}`,
  `- **The sound.** ${esc('All of it synthesized by')} ${a('tools/make_audio.py')}${esc(': no samples, loops or recordings, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi), 20 bars of exactly 3 seconds: electric piano, kalimba lead, soft drums, vinyl crackle. The ocean is its own seamless 60-second loop. The mix sits at -14 LUFS, true peak at or below -1 dBTP, and levels are adjustable in master and per routine. Not yet heard by anyone.')}`,
  `- **The picture.** ${esc('16:9, 1080p, 24 fps, always daytime. Hard cuts and stepped movement. Scene life: 26 entries, of which shore waves and drifting cloud shadows are built; birds, planes with vapour trails, whales, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.')}`,
  `- **The renderer.** ${esc('A web page,')} ${a('web/index.html')}${esc(', with live preview and export: plain ES modules, no build step, no npm packages. It encodes frame-exact H.264 in the browser with WebCodecs (68 to 78 frames a second in Chrome, timed at 1080p), and the server mixes the sound and joins the two into a YouTube-ready MP4.')}`,
  `- **The tools.** ${code('python tools/serve.py')} ${esc('(preview and export),')} ${code('python tools/schedule.py')} ${esc('(validate, simulate 10 hours),')} ${code('python tools/render_demo.py --dev')} ${esc('(every activity in a dev reel, with a heads-up display). The working notes are in')} ${a('MUSING.md')}${esc('.')}`,
  '',
);

details(
  `<b>credits</b> ${hide(u('m(_ _)m'))}`,
  `<p align="center">\n${hide(u('m(_ _)m'))}<br>\n${sub(esc('A bow, with a hand on the sand either side.'))}\n</p>\n`,
  `<p align="center">\n${esc('Faces typed by the Upright Faces Society, Tiny Island Branch (membership: one, plus the cat when it visits).')}<br>\n${esc('Bows to the turtle, for dozing; the shark, for keeping time; the crab, for wearing it well; the gull, for the fish; and the tide, for consistency.')}\n</p>\n`,
  `<p align="center">\n${sub(prose('Fonts: whatever your computer had. Each character in a face may come from a different one, which is how kaomoji have always looked. In Japan an arms-up face can mean hooray, or ｵﾜﾀ (owata, "it\'s all over"). On a desert island both readings are correct.'))}\n</p>\n`,
  `<p align="center">\n${sub(`${esc('Castaway is an original, unofficial project in development: no video yet, no public link, plenty of time.')} <i>Johnny Castaway</i> ${esc('and its characters belong to their owners, and this project is not affiliated with them. The Upright Faces Society is not a real society.')}`)}\n</p>\n`,
);

P(sub(`${esc('In development. Plenty of time.')} ${hide(u(`${HER.nod}♪`))}`));

const md = `${out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;

// ---------------------------------------------------------------- checks
const problems = [];
if (/[\u2013\u2014]/.test(md)) problems.push('en or em dash found');
const visible = md.replace(/<[^>]+>/g, ' ');
for (const w of ['crack', 'cracked', 'trainer', 'cheat', 'warez', 'keygen', 'pirate', 'rip', 'virus']) {
  if (new RegExp(`\\b${w}\\b`, 'i').test(visible)) problems.push(`banned word: ${w}`);
}
const fence = md.split('```')[1]?.split('\n').slice(1, -1) ?? [];
for (const l of fence) {
  if (l.length > 80 || /[^\x20-\x7e]/.test(l) || /\s$/.test(l)) problems.push(`code line: ${l}`);
}
// Inside an HTML block a blank line would hand the rest back to Markdown: none allowed there.
for (const m of md.matchAll(/<(table|h1)\b[\s\S]*?<\/\1>/g)) if (/\n\s*\n/.test(m[0])) problems.push(`blank line inside <${m[1]}>`);
if (!/CASTAWAY/.test(md) || !/<b>Castaway<\/b>/.test(md)) problems.push('the name is missing');
if (/\p{Extended_Pictographic}/u.test(md.replace(/[\u00a9\u00ae\u203c\u2049\u2122\u2139\u2194-\u21aa\u24c2\u25aa-\u25fe\u2600-\u27bf]/g, ''))) problems.push('emoji found');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${md.length} chars)`);
