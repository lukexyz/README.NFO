// MML Listing header for the ULTRA-SATISFACTORY README (style catalogue entry asia-05).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/ultra-satisfactory/src/36-mml-listing_opus_5.5.mjs
// It rewrites examples/ultra-satisfactory/36-mml-listing_opus_5.5.md. Edit this file, not the .md.
//
// The header is a song file: Music Macro Language in the dialect of PMD, the NEC PC-98 music
// driver by M. Kajihara (KAJA). PMD is a tool being credited here, not an identity being worn,
// and the tune, the voice numbers and every name in the listing are original. Text only, 7-bit
// ASCII, 80 columns: the style has no palette and no box characters.
//
// The listing is not decoration. This script contains a reader for the subset of PMD MML the
// song uses (header lines, FM voice tables, part lines, part limits, loops, ties, rhythm patterns). It
// performs every part note by note and refuses to write the file unless they all add up to the
// same number of clocks. The facts in the comments are either numbers the app shows or recipes
// checked against ultra_satisfactory/data.py on 2026-09-30 (cycle times and power draws): check
// again before changing one. It has NOT been through the real compiler (MC.EXE); the listing
// says so.
//
// Two optional extras, both off unless asked for, both written only where you point them:
//   --mml=FILE   the listing as a plain .MML file (CRLF, ASCII), for anyone with a PMD compiler
//   --wav=FILE   a rough bounce of the tune through a toy FM/square/noise synth (--loops=N, default 2)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '36-mml-listing_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 80;
const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const NAME = 'ULTRA-SATISFACTORY';
const option = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

// ---------------------------------------------------------------- inline markup
// Lines are plain strings. Bold and links are zero-width markers, so widths are measured on
// what the reader sees and the HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href = s) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[-]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const len = (s) => visible(s).length;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([-])/g, (m, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');
const rule = (label) => `; ${label} ${'='.repeat(W - 3 - len(label))}`;
// "MML            ; comment" with the comment starting at a fixed column.
const at = (mml, col, comment) => {
  if (len(mml) + 1 > col) throw new Error(`no room for the comment at column ${col}: ${visible(mml)}`);
  return mml + ' '.repeat(col - len(mml)) + comment;
};

// ---------------------------------------------------------------- song constants
// PMD counts a whole note as 96 clocks by default, and #Tempo is how many times 48 clocks
// (a half note) go by in a minute. Everything timed in the comments is derived from these.
const ZENLEN = 96;
const TEMPO = 60;
const BAR = ZENLEN; // 4/4
const CLOCKS_PER_SECOND = (TEMPO * 48) / 60;
const BAR_SECONDS = BAR / CLOCKS_PER_SECOND;
const INTRO_BARS = 2;
const INTRO = INTRO_BARS * BAR;

// ---------------------------------------------------------------- the banner
// The intro spells the name with the notes themselves. Whitespace means nothing in MML, so a
// part's notes can be pushed around into the rows of a 5-row pixel font: one row per part, ten
// melodic parts (A to J), ten rows. Each part plays one pitch, and the rest at the front of the
// row is sized so that all ten finish on the same clock.
// A line of text is about 2.4 times as tall as a character is wide, so strokes are two columns
// thick in both faces: WIDE is a 5x5 face with every pixel doubled, NARROW is drawn directly.
const WIDE = {
  U: ['X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  L: ['X....', 'X....', 'X....', 'X....', 'XXXXX'],
  T: ['XXXXX', '..X..', '..X..', '..X..', '..X..'],
  R: ['XXXX.', 'X...X', 'XXXX.', 'X..X.', 'X...X'],
  A: ['.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'],
};
const NARROW = {
  S: ['XXXXX', 'XX...', 'XXXXX', '...XX', 'XXXXX'],
  A: ['.XXX.', 'XX.XX', 'XXXXX', 'XX.XX', 'XX.XX'],
  T: ['XXXXXX', '..XX..', '..XX..', '..XX..', '..XX..'],
  I: ['XX', 'XX', 'XX', 'XX', 'XX'],
  F: ['XXXXX', 'XX...', 'XXXX.', 'XX...', 'XX...'],
  C: ['XXXXX', 'XX...', 'XX...', 'XX...', 'XXXXX'],
  O: ['XXXXX', 'XX.XX', 'XX.XX', 'XX.XX', 'XXXXX'],
  R: ['XXXX.', 'XX.XX', 'XXXX.', 'XX.XX', 'XX.XX'],
  Y: ['XX..XX', 'XX..XX', '.XXXX.', '..XX..', '..XX..'],
};
const bannerRows = (word, font, scale, gap) => [0, 1, 2, 3, 4].map((r) =>
  [...word].map((ch) => [...font[ch][r]].map((p) => (p === 'X' ? 'X' : ' ').repeat(scale)).join('')).join(' '.repeat(gap)));

// A rest of exactly `clocks`, written the way a person would type it.
const NICE_RESTS = { 144: 'r1.', 96: 'r1', 72: 'r2.', 48: 'r2', 36: 'r4.', 24: 'r4', 18: 'r8.', 12: 'r8', 6: 'r16', 3: 'r32' };
const restFor = (clocks) => NICE_RESTS[clocks] ?? `r%${clocks}`;

// Rows read downward D E C A F, C A G E D. Together that is a C major triad with a D minor
// triad on top: a big dominant chord, which resolves to F when the hook lands.
const BIG = { word: 'ULTRA', font: WIDE, parts: 'ABCDE', notes: 'decaf', scale: 2, gap: 3, len: 16, indent: 5 };
const SMALL = { word: 'SATISFACTORY', font: NARROW, parts: 'FGHIJ', notes: 'caged', scale: 1, gap: 1, len: 32, indent: 0 };
const banner = (spec) => bannerRows(spec.word, spec.font, spec.scale, spec.gap).map((row, r) => {
  const count = [...row].filter((c) => c === 'X').length;
  const pad = INTRO - count * (ZENLEN / spec.len);
  if (pad <= 0) throw new Error(`banner row ${spec.parts[r]} does not fit in the intro`);
  const ink = row.replace(/X/g, spec.notes[r]).replace(/\s+$/, '');
  return `${spec.parts[r]} ${restFor(pad).padEnd(5)} ${' '.repeat(spec.indent)}${B(ink)}`;
});

// ---------------------------------------------------------------- the hook
// Only a to g are notes and r is a rest, so the name cannot be spelled as a melody. But seven of
// its letters are playable, in this order, and that sequence is the first bar of the tune.
const playable = [...NAME.toLowerCase()].filter((c) => 'abcdefgr'.includes(c)).join('');
if (playable !== 'raafacr') throw new Error(`the name no longer plays "raafacr": ${playable}`);
const spelled = [...NAME].map((c) => ('abcdefgr'.includes(c.toLowerCase()) ? c.toUpperCase() : c.toLowerCase())).join(' ');
const sounded = [...NAME].map((c) => ('abcdefgr'.includes(c.toLowerCase()) ? c.toLowerCase() : ' ')).join(' ');
const HOOK_BAR_1 = 'r a a f a >c< r4';
if (HOOK_BAR_1.replace(/[^a-gr]/g, '') !== playable) throw new Error('bar 1 of the hook must spell the playable letters');

// ---------------------------------------------------------------- facts quoted in comments
// Standard recipes as the app's ITEMS tab shows them: [item, cycle seconds, machine, remark].
const CYCLES = [
  ['Iron Ingot', 2, 'Smelter', 'the bass drum'],
  ['Iron Rod', 4, 'Constructor', 'the intro'],
  ['Screw', 6, 'Constructor', ''],
  ['Reinforced Iron Plate', 12, 'Assembler', ''],
  ['Versatile Framework', 24, 'Assembler', ''],
  ['Smart Plating', 30, 'Assembler', 'one full loop'],
  ['Modular Frame', 60, 'Assembler', 'two loops'],
  ['Adaptive Control Unit', 120, 'Manufacturer', 'four loops'],
];
const PHASES = [
  ['Automation basics', ['Smart Plating x50', 'Versatile Framework x100', 'Automated Wiring x500']],
  ['Logistics & steel', ['Automated Wiring x500', 'Modular Frame x500', 'Smart Plating x100', 'Versatile Framework x500']],
  ['Oil & computers', ['Versatile Framework x2500', 'Modular Engine x500', 'Adaptive Control Unit x100']],
  ['Nuclear & endgame', ['Assembly Director System x1000', 'Magnetic Field Generator x500', 'Nuclear Pasta x100', 'Thermal Propulsion Rocket x25']],
  ['Alien tech & quantum', ['Biochemical Sculptor x500', 'AI Expansion Server x100', 'Neural-Quantum Processor x100', 'Ballistic Warp Drive x100']],
];
// Power draws the app shows for eight of the nine production machines, in MW. They are the TL
// (operator level) column of two FM voices below.
const MW = { Refinery: 30, Smelter: 4, Manufacturer: 55, Assembler: 15, Foundry: 16, Constructor: 4, Packager: 10, Blender: 75 };
const voiceRow = (nums, machine) => {
  const cells = nums.map((v, k) => String(v).padStart(k === 0 ? 6 : k === 5 || k === 9 ? 4 : 3)).join('');
  return `${cells}   ; ${machine}, ${MW[machine]} MW`;
};
const COLUMNS = ';   AR DR SR RR SL  TL KS ML DT AMS';
// One arpeggio bar per phase on SSG part G: G minor, A minor, B flat, C, D minor, a step up each.
const CLIMB_G = ['o4 l16 [g b- >d< b-]4', '[a >c e c<]4', '[b- >d f d<]4', '> [c e g e]4', '[d f a f]4 <'];

// A phase as a G line with the phase's shopping list under it. Continuation lines start with a
// space, which PMD treats as a comment line with no semicolon needed.
const phaseLines = (i) => {
  const [title, parts] = PHASES[i];
  const out = [at(`G   ${CLIMB_G[i]}`, 27, `; phase ${i + 1}, ${B(title)}. It wants:`)];
  let cur = '   ';
  parts.forEach((p, k) => {
    const piece = ` ${p}${k < parts.length - 1 ? ',' : ''}`;
    if (len(cur) + len(piece) > W - 1) { out.push(cur); cur = `   ${piece}`; } else cur += piece;
  });
  out.push(cur);
  return out;
};

// ---------------------------------------------------------------- the listing, side A
const main = [
  rule('ULTRASAT.MML'),
  '; This README header is also a song. It is MML (Music Macro Language): chip',
  '; music typed as plain text. Lowercase letters are notes, numbers are lengths,',
  '; a semicolon starts a comment. Dialect: PMD (NEC PC-98). > is up an octave.',
  '',
  `#Title     ${B(NAME)}`,
  '#Composer  the Hz & Safety Committee',
  '#Arranger  Clank & File, for ten parts, a drummer and one fuse',
  '#Memo      A companion app for the factory-building game Satisfactory:',
  '#Memo      every recipe, building and Space Elevator objective, one click apart.',
  `#Memo      Live, no install: ${A(LIVE)}`,
  '#Memo      Unofficial fan project, not affiliated with Coffee Stain Studios.',
  `#Tempo     ${TEMPO}`,
  `; ^ ${TEMPO} half notes a minute: one bar lasts ${BAR_SECONDS} s, which is one Iron Ingot out of a`,
  ';   Smelter. The whole tune is timed in ingots.',
  '',
  `; ${B('INTRO')}, two bars. All ten melodic parts pile onto one chord and spell the name.`,
  at(`ABCDE  @0 v11 o4 l${BIG.len} q1`, 26, '; FM 1 to 5: big letters, sixteenth notes'),
  at(`FGHIJ  @0 v11 o5 l${SMALL.len} q1`, 26, '; FM 6, SSG 1 to 3, ADPCM: small letters, 32nds'),
  ...banner(BIG),
  ...banner(SMALL),
  '; Read the note names downward: DECAF, CAGED. Part J has no sample loaded, so',
  '; it makes no sound. It is structural: remove it and the bottom row falls off.',
  '',
  `; ${B('HOOK')}. MML only has the notes a to g, plus r for a rest. So in the name`,
  `;   ${spelled}    exactly seven letters are music:`,
  `;   ${sounded}    and that is the tune.`,
  'ABC L @0 v12 o4 l8 q1  |A D0 p3  |B D3 p1  |C D-3 p2  |',
  `ABC [ ${B(HOOK_BAR_1)}   r a a f a >d< r4   r b- b- g b- >d< r4`,
  'ABC   r g g e g b- >c4< ]2',
  `; Parts A, B and C are the three tabs: ${B('OBJECTIVES')}, ${B('ITEMS')} and ${B('BUILDINGS')}. One`,
  '; line, three parts, a hair out of tune with each other. Everything links.',
  '',
  "; Voice 0, heard above. Its TL column is real data: each machine's power draw.",
  '@  0  4  6  =MegawattLead',
  `${COLUMNS}   ; A legal patch. Sounds like a Refinery.`,
  voiceRow([31, 7, 0, 5, 2, MW.Refinery, 1, 2, 3, 0], 'Refinery'),
  voiceRow([26, 9, 2, 7, 1, MW.Smelter, 1, 1, 3, 0], 'Smelter'),
  voiceRow([31, 8, 0, 5, 3, MW.Manufacturer, 0, 4, -3, 0], 'Manufacturer'),
  voiceRow([24, 9, 2, 7, 1, MW.Assembler, 1, 1, -3, 0], 'Assembler'),
  '',
  '; To hear it you need a PC-98. To run the app you need two lines:',
  ';   python -m pip install -r requirements.txt',
  `;   python -m streamlit run app/app.py          (more: ${A('#run-it-locally')})`,
];

// ---------------------------------------------------------------- the listing, side B
const sideB = [
  rule('ULTRASAT.MML, continued'),
  '',
  '; Two more voices. Same rule for the bass: the TL column is megawatts.',
  '@  1  5  5  =GrowlBass',
  COLUMNS,
  voiceRow([31, 12, 0, 6, 4, MW.Foundry, 1, 1, 0, 0], 'Foundry'),
  voiceRow([31, 9, 3, 8, 2, MW.Constructor, 1, 1, 0, 0], 'Constructor'),
  voiceRow([31, 11, 2, 6, 3, MW.Packager, 0, 0, 0, 0], 'Packager'),
  voiceRow([31, 10, 0, 6, 3, MW.Blender, 0, 2, 0, 0], 'Blender'),
  '; Eight machines, eight operators. At a level of 75 the Blender is in the patch',
  '; for the headcount: you cannot hear it. The ninth production machine, the',
  '; Particle Accelerator, did not fit on a four-operator chip and took it badly.',
  '@  2  4  3  =IdleHum',
  COLUMNS,
  '    18  4  1  5  2  34  0  2  2   0   ; This one is just a pad.',
  '    14  3  1  6  1   8  0  1  2   0   ; Its numbers mean nothing.',
  '    18  4  1  5  2  40  0  1 -2   0   ; Some numbers are allowed',
  '    13  3  1  6  1   8  0  2 -2   0   ; to mean nothing.',
  '',
  `; ${B('THE HOOK')}, everyone else. Eight bars, underneath parts A, B and C.`,
  'D   L @2 v9  o4 l1      [c d&d e]2',
  'E   L @2 v9  o3 l1      [a&a b-&b-]2',
  'F   L @1 v12 o2 l8  q1  [ [f>f<]4 [d>d<]4 [b->b-<]4 [c>c<]4 ]2',
  'G   L @6 v9  o5 l16     [ [f a >c< a]4 [d f a f]4 [d f b- f]4 [e g b- g]4 ]2',
  'H   L @6 v8  o5 l16     [ r2. >f c< a f  r2. >f d< a f  r2. >f d< b- f  r1 ]2',
  '; D and E hold the chords. & is a tie: where a note stays put for two bars it',
  '; is struck once and left running, like everything else in this factory.',
  '; F is the bass, bouncing between octaves like a belt with a lift in it. G is',
  '; the sparkle. H answers the hook in the gap at the end of each bar.',
  '',
  `; ${B('THE CLIMB')}. Five bars for the five Space Elevator phases, one step up each.`,
  '; The three tabs stop agreeing and spread into a chord, one whole note a phase.',
  ';              1       2       3       4       5',
  'A   o5 l1      d       e       f       g       a',
  'B   o4 l1      b-     >c       d       e       f<',
  'C   o4 l1      g       a       b-     >c       d<',
  'D   o3 l1      g       a       b-     >c       d<',
  'E   [r1]5',
  'F   [g>g<]4 [a>a<]4 [b->b-<]4 > [c>c<]4 [d>d<]4 <',
  'H   [r1]5',
  ...[0, 1, 2, 3, 4].flatMap(phaseLines),
  `; In the app: pick a phase in ${B('OBJECTIVES')}, click a part, land on its recipe.`,
  '',
  `; ${B('THE FUSE')}. It goes at the top of the climb, because of course it does. One`,
  '; bar of nothing, then one bar to get the grid back up and come around again.',
  'ABC o4 l8      r1   >c e g e c< b- g e',
  'D   o4 l1      r    e',
  'E   o3 l1      r    b-',
  'F              r1   [c>c<]4',
  'G   o5 l16     r1   [e g b- g]4',
  'H              r1   r1',
  '',
  `; ${B('DRUMS')}. K calls the patterns. The R lines define them, numbered in order.`,
  'K   R0 R1 L [R2]3 R3 [R2]3 R3 [R2]4 R3 R4 R5',
  at('R0  r1', 55, '; the power is still off'),
  at('R1  r2 l8 @4c @8c l16 @16c @16c @2c @2c', 55, '; toms, up the stairs'),
  at('R2  l8 @1c [@128c]3 @2c [@128c]3', 55, '; the beat'),
  at('R3  l8 @1c [@128c]3 @2c @128c l16 @2c @2c @64c @64c', 55, '; the beat, with a fill'),
  at('R4  l8 [@128c]8', 55, '; the fuse bar'),
  at('R5  l16 [@2c]4 [@64c]4 l8 @16c @8c @4c @1c', 55, '; the breaker goes in'),
  '; @1 is the bass drum. One in every bar of the loop, so one ingot a kick. Except',
  '; in the fuse bar: no power, no kick, no ingot. The hi-hat carries on, because',
  '; somebody put it on its own grid. There is always one person who plans.',
  'DRUM_FIGHT',
  '',
  'LOOP_SUMMARY',
];

// ---------------------------------------------------------------- the liner notes
// A PMD file can hold free text between two backticks, so the notes are still inside the song.
const dots = (k, v, w = 18) => `  ${k} ${'.'.repeat(w - len(k) - 1)} ${v}`;
const cont = (v, w = 18) => `  ${' '.repeat(w)} ${v}`;
const cycleRow = ([item, secs, machine, note]) => {
  const bars = secs / BAR_SECONDS;
  if (!Number.isInteger(bars)) throw new Error(`${item} is not a whole number of bars`);
  return `  ${String(bars).padStart(3)} ${bars === 1 ? 'bar ' : 'bars'} ${String(secs).padStart(4)} s   ${`${item}, ${machine}`.padEnd(36)}${note ? `(${note})` : ''}`.trimEnd();
};
const liner = [
  '`',
  `${B('ULTRASAT.DOC')}   Liner notes. In PMD, everything between two backticks is a`,
  'comment, so this is still a valid song file. It has just become chatty.',
  '',
  B('HOW TO READ THE LISTING'),
  '  c d e f g a b   the notes             r        a rest',
  '  b-              b flat (+ sharpens)   4 8 16   quarter, eighth, sixteenth',
  '  .               half as long again    %33      a length in raw clocks',
  '  o4              octave 4              > <      octave up, octave down',
  '  l8              default length        v12      volume',
  '  [ ... ]4        play it four times    L        loop from here, for ever',
  '  a&a             a tie: two lengths, one note, struck once',
  '  q1              stop each note one clock early, so repeats do not smear',
  '  @2              a voice on FM parts, an envelope on SSG, a drum on R lines',
  '  D3  p1 p2 p3    detune; pan right, left, centre',
  '  |A              the rest of this line is for part A only',
  '  ABC             one line sent to three parts at once',
  `  ${ZENLEN} clocks make a whole note. A to F are FM, G to I are SSG square waves,`,
  '  J is ADPCM samples, K is rhythm and R0, R1, R2 are the patterns K calls.',
  '  The rests at the front of the intro rows (r8, r%33) are sized so that all',
  '  ten parts finish spelling at the same instant.',
  '',
  B('WHAT THE APP HOLDS'),
  '  140   craftable items, searched per keystroke',
  '  211   machine recipes, 88 of them alternates',
  '  477   player-buildable buildings: 333 structure, 59 logistics, 26 decor,',
  '        15 power, 14 transit, 9 production, 7 special, 7 storage, 7 extraction',
  '    9   machines that do the actual work: Assembler, Blender, Constructor,',
  '        Foundry, Manufacturer, Packager, Particle Accelerator, Refinery, Smelter',
  '    5   Space Elevator phases, 18 line items, 0 thank-you notes',
  `  Three tabs, all cross-linked. The full tour is under ${A('#whats-inside')}.`,
  '',
  `${B('THE INGOT CLOCK')}   cycle times from the ITEMS tab, at ${BAR_SECONDS} s a bar`,
  ...CYCLES.map(cycleRow),
  '  So when a Manufacturer is starved of one input, you know how many bars of',
  '  this you will be humming while you work out which one.',
  '',
  B('CREDITS'),
  dots('Game data', `greeny/SatisfactoryTools (${A('#data--credits')})`),
  dots('Pictures', 'the Satisfactory Wiki, CC BY-NC-SA 4.0'),
  dots('The app', `Python and one Streamlit file, ${A('app/app.py')}, with`),
  cont(`streamlit-aggrid for the searchable grids (${A('#how-its-built')})`),
  dots('Live build', 'stlite: Streamlit in your browser on WebAssembly.'),
  cont('GitHub Actions republishes it on every push to main'),
  dots('Also deploys', `as a full Streamlit server on Modal (${A('modal_app.py')})`),
  dots('Licence', `Apache 2.0 (${A('LICENSE')}). Copy protection: none. Help yourself`),
  dots('The game', 'Satisfactory is by Coffee Stain Studios. This is an'),
  cont('unofficial fan project and has nothing to do with them'),
  dots('The dialect', 'PMD, the PC-98 music driver by M. Kajihara (KAJA).'),
  cont('English MML manual by Blaze and Pigu. Credited, not claimed'),
  dots('Compiled', 'not by the real thing: nobody here owns a PC-98. The'),
  cont('script that prints this listing reads it back, plays every'),
  cont('part note by note and counts the clocks. It can also bounce'),
  cont('a WAV through a toy synth of its own. Accuracy: spiritual'),
  '',
  B('GREETZ'),
  '  D3 and the Near Misses, the Part J Solidarity Fund, the Stopgap',
  '  Philharmonic, Column Q and the Circular References, the Left-Hand Belt',
  '  Society, the Forty Screws a Minute Club, the people whose manifold "will',
  '  even out", the load balancer people, who are right and tired, and whoever',
  '  clipped that pipe through the wall and said nothing.',
  '  No greetz to the fuse. It knows what it did.',
  '`',
];

// ================================================================ the reader
// A reader for the PMD MML subset used above. It follows the PMD MML manual (PMDMML.MAN, English
// translation by Blaze and Pigu): a part line starts with its letters in column 0; a line that
// starts with a space is a comment; "|A" limits the rest of a line to part A; R lines define
// rhythm patterns in order and K plays them by number; [ ]n loops; L marks the loop point; & ties
// a note to the next one; at
// the top of every pass through a loop the octave and default length go back to what they were.
const HEADERS = new Set(['Title', 'Composer', 'Arranger', 'Memo', 'Tempo']);
const VOICE_RANGES = [[0, 31], [0, 31], [0, 31], [0, 15], [0, 15], [0, 127], [0, 3], [0, 15], [-3, 7], [0, 1]]; // AR DR SR RR SL TL KS ML DT AMS
const FM = 'ABCDEF', SSG = 'GHI', PCM = 'J';
const kindOf = (p) => (p === 'K' ? 'k' : FM.includes(p) ? 'fm' : SSG.includes(p) ? 'ssg' : 'pcm');

function readSong(lines) {
  const song = { headers: [], voices: [], parts: {}, patterns: [] };
  let inBlock = false, voice = null;
  lines.forEach((raw, n) => {
    const fail = (msg) => { throw new Error(`MML line ${n + 1}: ${msg}\n    ${raw}`); };
    if (raw.startsWith('`')) { inBlock = !inBlock; return; }
    if (inBlock) return;
    const code = raw.replace(/;.*$/, '');
    if (voice && voice.rows.length < 4) {
      if (raw.startsWith(';') || code.trim() === '') return;
      const nums = code.trim().split(/[\s,]+/).map(Number);
      if (nums.length !== 10 || nums.some((v) => !Number.isInteger(v))) fail('an FM voice row needs ten integers');
      nums.forEach((v, k) => { if (v < VOICE_RANGES[k][0] || v > VOICE_RANGES[k][1]) fail(`voice value ${v} out of range in column ${k + 1}`); });
      voice.rows.push(nums);
      return;
    }
    if (raw === '' || raw.startsWith(';') || /^[ \t]/.test(raw)) return;
    if (raw.startsWith('#')) {
      const m = raw.match(/^#(\w+)[ \t]+(.+)$/);
      if (!m || !HEADERS.has(m[1])) fail('unknown # command');
      if (m[1] === 'Tempo' && !(+m[2] >= 18 && +m[2] <= 255)) fail('#Tempo must be 18 to 255');
      song.headers.push([m[1], m[2]]);
      return;
    }
    if (raw.startsWith('@')) {
      const m = raw.match(/^@\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+=(\S.*))?$/);
      if (!m) fail('an FM voice starts "@ number ALG FB =name"');
      if (+m[1] > 255 || +m[2] > 7 || +m[3] > 7) fail('voice number, ALG or FB out of range');
      voice = { num: +m[1], alg: +m[2], fb: +m[3], name: m[4], rows: [] };
      song.voices.push(voice);
      return;
    }
    const m = code.match(/^([A-R][A-R0-9]*)[ \t]+(.*)$/);
    if (!m) fail('not a part line, a # command, a voice or a comment');
    if (code.includes('`')) fail('inline backtick comments are not supported by this reader');
    const letters = m[1].replace(/[0-9]/g, '');
    if (letters === 'R') {
      // The number typed after R is only a label. Patterns are numbered in order of definition.
      if (m[1] !== `R${song.patterns.length}`) fail(`this is pattern ${song.patterns.length}, whatever its label says`);
      song.patterns.push({ items: parseMml([{ n, mml: m[2] }], 'r', song) });
      return;
    }
    // Part limits: "|AB mml" is for A and B only, "|" on its own lifts the limit.
    const segments = [];
    m[2].split('|').forEach((seg, k) => {
      if (k === 0) { segments.push([null, seg]); return; }
      const lim = seg.match(/^(!?)([A-R]*)(?:\s+(.*))?$/s);
      if (!lim) fail('a part limit needs a space before its MML');
      if (lim[1]) fail('|! is not supported by this reader');
      segments.push([lim[2] || null, lim[3] || '']);
    });
    for (const p of letters) {
      if (!(FM + SSG + PCM + 'K').includes(p)) fail(`no such part: ${p}`);
      const mine = segments.filter(([only]) => only === null || only.includes(p)).map(([, s]) => s).join(' ');
      (song.parts[p] ??= []).push({ n, mml: mine });
    }
  });
  if (inBlock) throw new Error('MML: a backtick comment is never closed');
  for (const v of song.voices) if (v.rows.length !== 4) throw new Error(`MML: voice @${v.num} has ${v.rows.length} rows`);
  return song;
}

// MML text to a small tree: notes, rests, commands, and loops with their bodies.
const SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
function parseMml(chunks, kind, song) {
  const root = [];
  const stack = [root];
  const push = (item) => stack[stack.length - 1].push(item);
  for (const { n, mml } of chunks) {
    let i = 0;
    const fail = (msg) => { throw new Error(`MML line ${n + 1}: ${msg} at "${mml.slice(i, i + 12)}"\n    ${mml}`); };
    const int = (signed = false) => {
      const m = mml.slice(i).match(signed ? /^[+-]?\d+/ : /^\d+/);
      if (!m) fail('expected a number');
      i += m[0].length;
      return +m[0];
    };
    const hasNum = () => /^\d/.test(mml.slice(i));
    // [%]length[.]: a divisor of the whole note, or a raw clock count after %. null = default.
    const length = () => {
      let clocks = null;
      if (mml[i] === '%') { i++; clocks = int(); } else if (hasNum()) {
        const d = int();
        if (d < 1 || ZENLEN % d) fail(`${d} does not divide a whole note of ${ZENLEN} clocks`);
        clocks = ZENLEN / d;
      }
      let dots_ = 0;
      while (mml[i] === '.') { i++; dots_++; }
      if (dots_ && clocks === null) fail('this reader wants a written length before a dot');
      for (let add = clocks; dots_ > 0; dots_--) {
        if (add % 2) fail('that dot lands between clocks');
        add /= 2;
        clocks += add;
      }
      return clocks;
    };
    const melodic = kind === 'fm' || kind === 'ssg' || kind === 'pcm';
    while (i < mml.length) {
      const ch = mml[i];
      if (ch === ' ') { i++; continue; }
      i++;
      if (ch === '[') { const body = []; push({ t: 'loop', body, times: 0 }); stack.push(body); continue; }
      if (ch === ']') {
        if (stack.length === 1) fail('] without [');
        stack.pop();
        const loop = stack[stack.length - 1].at(-1);
        loop.times = int();
        if (loop.times < 1 || loop.times > 255) fail('loop count out of range');
        continue;
      }
      if (kind === 'k') {
        if (ch === 'R') { const v = int(); if (!song.patterns[v]) fail(`pattern R${v} is not defined yet`); push({ t: 'R', v }); } else if (ch === 'L') push({ t: 'L' }); else fail('only R, L and loops belong on the K line');
        continue;
      }
      if (ch >= 'a' && ch <= 'g') {
        let semi = SEMI[ch];
        while (mml[i] === '+' || mml[i] === '-') { semi += mml[i] === '+' ? 1 : -1; i++; }
        const note = { t: 'note', semi, len: length(), n };
        // "&" straight after a note ties it to the next one, which must be the same pitch here.
        if (mml[i] === '&') {
          i++;
          if (kind === 'r') fail('no note-to-note ties on R lines');
          if (mml[i] === '&' || /^[%\d]/.test(mml.slice(i))) fail('only the plain note&note tie is in the subset this reader knows');
          note.tie = true;
        }
        push(note);
      } else if (ch === 'r') push({ t: 'rest', len: length() });
      else if (ch === 'l') { const l = length(); if (l === null) fail('l needs a length'); push({ t: 'l', len: l }); } else if (ch === 'v') {
        const v = int();
        if (v > (kind === 'fm' || kind === 'pcm' ? 16 : 15)) fail('volume out of range');
        push({ t: 'v', v });
      } else if (ch === '@') {
        const v = int();
        if (kind === 'fm' && !song.voices.some((x) => x.num === v)) fail(`FM voice @${v} is not defined`);
        if (kind === 'ssg' && v > 9) fail('SSG envelopes are @0 to @9');
        if (kind === 'r' && (v < 1 || v > 2047)) fail('SSG drums are @1 to @1024, or sums of them');
        push({ t: '@', v });
      } else if (melodic && ch === 'o') { const v = int(); if (v < 1 || v > 8) fail('octaves run 1 to 8'); push({ t: 'o', v }); } else if (melodic && (ch === '>' || ch === '<')) push({ t: ch });
      else if (melodic && ch === 'q') { const v = int(); if (v > 255) fail('bad q'); push({ t: 'q', v }); } else if (melodic && ch === 'p') {
        const v = int();
        if (kind === 'ssg') fail('SSG parts cannot pan');
        if (v > 3) fail('pan is 0 to 3');
        push({ t: 'p', v });
      } else if (melodic && ch === 'D') push({ t: 'D', v: int(true) });
      else if (melodic && ch === 'L') push({ t: 'L' });
      else { i--; fail(`"${ch}" is not in the subset this reader knows`); }
    }
  }
  if (stack.length !== 1) throw new Error('MML: a loop is never closed');
  return root;
}

// Play one part through: returns its note events (in clocks) and where its loop point falls.
function perform(part, song) {
  const kind = kindOf(part);
  const items = parseMml(song.parts[part], kind, song);
  const st = { octave: 4, deflen: ZENLEN / 4, vol: 12, voice: 0, q: 0, pan: 3, detune: 0 };
  const rst = { deflen: ZENLEN / 4, drum: 1 }; // the R lines share one state between them
  const events = [];
  const used = new Set();
  let ties = 0;
  let clock = 0, loopAt = null, held = null; // held: a note waiting for the other half of its tie
  const run = (list, s, depth, drums) => {
    for (const it of list) {
      if (held && it.t !== 'note') throw new Error(`MML: part ${part} has a tie (&) that is not followed by a note`);
      if (it.t === 'note') {
        const dur = it.len ?? s.deflen;
        if (drums) events.push({ start: clock, dur, drum: s.drum });
        else {
          if (s.octave < 1 || s.octave > 8) throw new Error(`MML line ${it.n + 1}: part ${part} wanders off to octave ${s.octave}`);
          const midi = (s.octave + 1) * 12 + it.semi;
          if (held) {
            if (held.midi !== midi) throw new Error(`MML line ${it.n + 1}: part ${part} ties two different pitches`);
            held.dur += dur;
            held.gate = Math.max(1, held.dur - s.q);
            ties++;
          } else {
            held = { start: clock, dur, gate: Math.max(1, dur - s.q), midi, vol: s.vol, voice: s.voice, pan: s.pan, detune: s.detune };
            events.push(held);
          }
          if (!it.tie) held = null;
        }
        clock += dur;
      } else if (it.t === 'rest') clock += it.len ?? s.deflen;
      else if (it.t === 'loop') {
        const o = s.octave, l = s.deflen;
        for (let k = 0; k < it.times; k++) { s.octave = o; s.deflen = l; run(it.body, s, depth + 1, drums); }
      } else if (it.t === 'R') { used.add(it.v); run(song.patterns[it.v].items, rst, depth + 1, true); } else if (it.t === 'L') {
        if (depth) throw new Error(`MML: part ${part} has an L inside a loop`);
        if (loopAt !== null) throw new Error(`MML: part ${part} has two L commands`);
        loopAt = clock;
      } else if (it.t === 'o') s.octave = it.v;
      else if (it.t === '>') s.octave++;
      else if (it.t === '<') s.octave--;
      else if (it.t === 'l') s.deflen = it.len;
      else if (it.t === 'v') s.vol = it.v;
      else if (it.t === '@') { if (drums) s.drum = it.v; else { s.voice = it.v; if (kind === 'fm') used.add(it.v); } } else if (it.t === 'q') s.q = it.v;
      else if (it.t === 'p') s.pan = it.v;
      else if (it.t === 'D') s.detune = it.v;
    }
  };
  run(items, st, 0, false);
  if (held) throw new Error(`MML: part ${part} ends on a tie`);
  return { part, kind, events, used, ties, total: clock, intro: loopAt ?? clock, loop: loopAt === null ? 0 : clock - loopAt, hasLoop: loopAt !== null };
}

function checkSong(lines) {
  const song = readSong(lines);
  // Every pattern is exactly one bar, played on its own.
  song.patterns.forEach((p, k) => {
    const solo = perform('K', { ...song, parts: { K: [{ n: 0, mml: `R${k}` }] } });
    if (solo.total !== BAR) throw new Error(`MML: pattern R${k} lasts ${solo.total} clocks, not one bar`);
  });
  const report = {};
  for (const p of Object.keys(song.parts).sort()) report[p] = perform(p, song);
  const loop = Object.values(report).find((r) => r.hasLoop).loop;
  for (const [p, r] of Object.entries(report)) {
    if (r.intro !== INTRO) throw new Error(`MML: part ${p} reaches the loop point at clock ${r.intro}, not ${INTRO}`);
    if (r.hasLoop && r.loop !== loop) throw new Error(`MML: part ${p} loops over ${r.loop} clocks, the others over ${loop}`);
  }
  if (loop % BAR) throw new Error('MML: the loop is not a whole number of bars');
  const voicesUsed = new Set(Object.values(report).filter((r) => r.kind === 'fm').flatMap((r) => [...r.used]));
  for (const v of song.voices) if (!voicesUsed.has(v.num)) throw new Error(`MML: voice @${v.num} is defined but never played`);
  song.patterns.forEach((p, k) => { if (!report.K.used.has(k)) throw new Error(`MML: pattern R${k} is never called`); });
  return { song, report, loop, loopBars: loop / BAR, loopSeconds: loop / CLOCKS_PER_SECOND };
}

// ---------------------------------------------------------------- check, then finish the copy
// Two comment blocks quote numbers from the check, so it runs first on the song without them.
const PLACEHOLDERS = ['DRUM_FIGHT', 'LOOP_SUMMARY'];
const draft = [...main, ...sideB.filter((l) => !PLACEHOLDERS.includes(l)), ...liner].map(visible);
const result = checkSong(draft);
const { loop, loopBars, loopSeconds, report } = result;

// Claims made in the comments, asserted against what the reader measured and the app's data.
const smartPlating = CYCLES.find(([item]) => item === 'Smart Plating');
if (loopSeconds !== smartPlating[1]) throw new Error(`the loop lasts ${loopSeconds} s, which is no longer one Smart Plating`);
if (BAR_SECONDS !== CYCLES[0][1]) throw new Error('a bar is no longer one Iron Ingot');
if (INTRO_BARS * BAR_SECONDS !== CYCLES[1][1]) throw new Error('the intro is no longer one Iron Rod');
if (!PHASES[0][1].includes('Smart Plating x50') || !PHASES[1][1].includes('Smart Plating x100')) throw new Error('Smart Plating counts changed');
if (PHASES.reduce((s, p) => s + p[1].length, 0) !== 18) throw new Error('the phases no longer have 18 line items');
// One bass drum in every bar of the loop except the fuse bar, which has none.
const kicksPerBar = Array.from({ length: loopBars }, (_, b) => report.K.events.filter((e) => e.drum === 1 && Math.floor((e.start - INTRO) / BAR) === b).length);
const fuseBar = loopBars - 2;
if (kicksPerBar.some((k, b) => k !== (b === fuseBar ? 0 : 1))) throw new Error(`bass drums per bar: ${kicksPerBar}`);
if (report.K.events.some((e) => e.drum === 1 && e.start < INTRO)) throw new Error('a bass drum before the power is on');
// Parts I and K share SSG channel 3. Measure their argument at the end of the intro.
const introDrums = report.K.events.filter((e) => e.start < INTRO);
const fightStart = Math.min(...introDrums.map((e) => e.start));
const fightSeconds = (INTRO - fightStart) / CLOCKS_PER_SECOND;
const iNotes = report.I.events.filter((e) => e.start >= fightStart);
const iRate = CLOCKS_PER_SECOND / (ZENLEN / SMALL.len);
if (report.I.hasLoop || report.I.total !== INTRO || iNotes.length !== fightSeconds * iRate) throw new Error('part I no longer plays straight through the tom fill');
if (fightSeconds !== 1 || iRate !== 16) throw new Error(`the I and K argument changed: ${fightSeconds} s at ${iRate} notes a second`);
// The eight megawatt rows were built from MW, so only their count can drift.
if (draft.filter((l) => / MW$/.test(l)).length !== Object.keys(MW).length) throw new Error('expected eight megawatt rows');

// Parts I and J stop when the intro does. Everything else comes round again.
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
const loopers = Object.values(report).filter((r) => r.hasLoop).length;
if (loopers !== Object.keys(report).length - 2 || report.I.hasLoop || report.J.hasLoop) throw new Error('the loop summary says only I and J sit the loop out');
// The pads are the only tied notes: three two-bar notes per pass through their loop, twice.
if (report.D.ties + report.E.ties !== 6 || Object.values(report).reduce((n, r) => n + r.ties, 0) !== 6) throw new Error('the tie comment no longer matches the pads');
const FILL = {
  DRUM_FIGHT: [
    '; K plays its drums on SSG channel 3, which is also part I. They cannot both',
    '; talk: a key-on from either one cuts the other off, and on a dead heat K wins.',
    '; So for the last second of the intro they interrupt each other sixteen times',
    '; a second, and after that part I is not invited back. Two machines, one belt.',
  ],
  LOOP_SUMMARY: [
    `; Every part adds up: ${INTRO} clocks of intro (${INTRO_BARS} bars), then, for the ${WORDS[loopers]} parts`,
    `; that come back, a loop of ${loop} clocks (${loopBars} bars). At ${BAR_SECONDS} s a bar the loop lasts`,
    `; ${loopSeconds} s, which is one Smart Plating out of an Assembler. Phase 1 wants 50 of`,
    `; those: 50 loops, ${(50 * loopSeconds) / 60} minutes of this. Then phase 2 asks for 100 more, and you`,
    '; start to see why people build a second Assembler.',
  ],
};
const sideBFinal = sideB.flatMap((l) => FILL[l] ?? [l]);

// ---------------------------------------------------------------- verify + write
function verify(name, lines) {
  lines.forEach((l, i) => {
    const v = visible(l);
    if (v.length > W) throw new Error(`${name} line ${i + 1} is ${v.length} cols: ${v}`);
    if (!/^[\x20-\x7e]*$/.test(v)) throw new Error(`${name} line ${i + 1} is not 7-bit ASCII: ${v}`);
    if (/\s$/.test(v)) throw new Error(`${name} line ${i + 1} has trailing whitespace: ${v}`);
  });
}
const blocks = { main, sideB: sideBFinal, liner };
for (const [name, lines] of Object.entries(blocks)) verify(name, lines);
// The file as a PC-98 would see it must still check out with those comment blocks in place.
const listing = [...main, '', ...sideBFinal, '', ...liner].map(visible);
const final = checkSong(listing);
if (final.loop !== loop) throw new Error('the finished listing does not match the draft');

const pre = (lines) => ['<pre>', ...lines.map(toHtml), '</pre>'].join('\n');
// Prose outside the listing follows the target repo's house style: each line opens with the bolt.
const BOLT = '⚡';
const details = (summary, lines) => ['<details>', `<summary>${BOLT} ${summary}</summary>`, '', pre(lines), '', '</details>', ''];

const md = [
  `<!-- Header ${SLUG} for ${NAME}. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(main),
  '',
  `${BOLT} **${NAME}** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Three cross-linked tabs, **Objectives**, **Items** and **Buildings**, sit on your second monitor and answer "what goes into that again?" before the belt backs up.`,
  '',
  `${BOLT} [Open it live in your browser](${LIVE}), nothing to install, or [run it locally](#run-it-locally) with two commands. The block above is its theme tune, typed out in Music Macro Language, and a script has counted every bar. Unofficial fan project, not affiliated with Coffee Stain Studios.`,
  '',
  ...details('<b>ULTRASAT.MML, side B</b> &nbsp;bass, drums, the climb through all five Space Elevator phases, and the fuse', sideBFinal),
  ...details('<b>ULTRASAT.DOC</b> &nbsp;liner notes: how to read MML, what the app holds, the ingot clock, credits, greetz', liner),
].join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
const clocks = Object.values(final.report).map((r) => `${r.part}:${r.intro}${r.hasLoop ? `+${r.loop}` : ''}`).join(' ');
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ` + Object.entries(blocks).map(([n, l]) => `${n} ${l.length} lines`).join(', '));
console.log(`checked ${Object.keys(final.report).length} parts, ${final.song.voices.length} voices, ${final.song.patterns.length} patterns. clocks ${clocks}`);
console.log(`loop ${loopBars} bars = ${loopSeconds} s at #Tempo ${TEMPO}`);

// ================================================================ optional: the .MML file
const mmlOut = option('mml');
if (mmlOut) {
  fs.writeFileSync(path.resolve(mmlOut), listing.join('\r\n') + '\r\n', 'latin1');
  console.log(`wrote ${mmlOut}: ${listing.length} lines of PMD MML`);
}

// ================================================================ optional: a rough bounce
// A toy, not an emulator. FM parts go through a small phase-modulation synth that does read the
// voice tables (algorithm, feedback, levels, multiples, rough envelopes); SSG parts are square
// waves with PMD's built-in software envelopes; the drums are sine thumps and seeded noise.
// Part J has no sample, so it is silent here too, and parts I and K fight over SSG channel 3
// the way the manual says they do.
const wavOut = option('wav');
if (wavOut) {
  const SR = 32000;
  const loops = Math.max(1, Number(option('loops') ?? 2));
  const sec = (clocksIn) => clocksIn / CLOCKS_PER_SECOND;
  const seconds = sec(INTRO + loops * final.loop) + 1.5;
  const left = new Float32Array(Math.ceil(seconds * SR));
  const right = new Float32Array(left.length);
  const mix = (i, v, pan) => {
    if (i < 0 || i >= left.length) return;
    left[i] += v * (pan === 1 ? 0.25 : pan === 2 ? 1 : 0.7);
    right[i] += v * (pan === 2 ? 0.25 : pan === 1 ? 1 : 0.7);
  };
  const db = (x) => 10 ** (-x / 20);
  let seed = 0x5a7150;
  const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x80000000 - 1; };

  // Each event once for the intro, then once per pass through the loop.
  const timeline = (r) => r.events.flatMap((e) => (e.start < r.intro ? [e] : Array.from({ length: loops }, (_, k) => ({ ...e, start: e.start + k * r.loop }))));

  // SSG channel 3: a key-on from I or K cuts whatever the other one was doing; K wins a tie.
  const drumStarts = timeline(final.report.K).map((e) => e.start);
  const iEvents = final.report.I.events.filter((e) => !drumStarts.includes(e.start)).map((e) => {
    const cut = Math.min(...drumStarts.filter((t) => t > e.start), Infinity);
    return { ...e, gate: Math.min(e.gate, cut - e.start) };
  });
  const iStarts = iEvents.map((e) => e.start);

  // FM: modulators per operator and the carriers, for the eight YM2608 algorithms.
  const ALGS = [
    [[[], [0], [1], [2]], [3]], [[[], [], [0, 1], [2]], [3]], [[[], [], [1], [0, 2]], [3]], [[[], [0], [], [1, 2]], [3]],
    [[[], [0], [], [2]], [1, 3]], [[[], [0], [0], [0]], [1, 2, 3]], [[[], [0], [], []], [1, 2, 3]], [[[], [], [], []], [0, 1, 2, 3]],
  ];
  const FB = [0, Math.PI / 16, Math.PI / 8, Math.PI / 4, Math.PI / 2, Math.PI, 2 * Math.PI, 4 * Math.PI];
  const FM_V = [85, 87, 90, 93, 95, 98, 101, 103, 106, 109, 111, 114, 117, 119, 122, 125, 127]; // v to V, from the manual
  const fmNote = (e, voice) => {
    const f0 = 440 * 2 ** ((e.midi - 69) / 12) * (1 + e.detune * 0.001);
    const [mods, carriers] = ALGS[voice.alg];
    const ops = voice.rows.map(([AR, DR, SR_, RR, SL, TL, , ML, DT]) => ({
      w: (2 * Math.PI * f0 * (ML || 0.5) * (1 + DT * 0.0004)) / SR,
      level: db(TL * 0.75), attack: 0.001 * 2 ** ((31 - AR) / 4), decay: DR ? 0.6 * 2 ** (DR / 2) : 0,
      sustain: SR_ ? 0.6 * 2 ** (SR_ / 2) : 0, release: 1.5 * 2 ** RR, sl: SL * 3, att: 0, phase: 0, out: 0, prev: 0,
    }));
    const gain = 0.2 * db((127 - FM_V[e.vol]) * 0.75) / Math.sqrt(carriers.length);
    const start = Math.round(sec(e.start) * SR), off = sec(e.gate) * SR;
    for (let i = 0; i < off + 0.7 * SR; i++) {
      let loudest = 96;
      const outs = ops.map((op) => op.out);
      ops.forEach((op, k) => {
        op.att += (i >= off ? op.release : op.att < op.sl ? op.decay : op.sustain) / SR;
        const env = Math.min(1, i / (op.attack * SR)) * db(op.att);
        let pm = 0;
        for (const m of mods[k]) pm += outs[m];
        pm *= 4 * Math.PI;
        if (k === 0) pm += FB[voice.fb] * (op.out + op.prev) / 2;
        op.prev = op.out;
        op.out = env * op.level * Math.sin(op.phase + pm);
        op.phase += op.w;
        if (carriers.includes(k)) loudest = Math.min(loudest, op.att);
      });
      let v = 0;
      for (const c of carriers) v += ops[c].out;
      mix(start + i, v * gain, e.pan);
      if (i >= off && loudest > 66) break;
    }
  };
  // SSG: PMD's ten built-in envelopes as E AL,DD,SR,RR (attack length, decay depth, sustain rate,
  // release rate, in clocks and volume steps), from the manual's table.
  const SSG_ENV = [[0, 0, 0, 0], [2, -1, 0, 1], [2, -2, 0, 1], [2, -2, 0, 8], [2, -1, 24, 1], [2, -2, 24, 1], [2, -2, 4, 1], [2, 1, 0, 1], [1, 2, 0, 1], [1, 2, 24, 1]];
  const ssgNote = (e) => {
    const f = 440 * 2 ** ((e.midi - 69) / 12), dt = f / SR;
    const [AL, DD, SRate, RR] = SSG_ENV[e.voice];
    const start = Math.round(sec(e.start) * SR);
    let phase = 0;
    for (let i = 0; ; i++) {
      const clk = (i / SR) * CLOCKS_PER_SECOND;
      const held = Math.min(clk, e.gate);
      let level = e.vol;
      if (held >= AL) level += DD - (SRate ? Math.floor((held - AL) / SRate) : 0);
      if (clk >= e.gate) level = RR ? level - 1 - Math.floor((clk - e.gate) / RR) : 0;
      if (level <= 0 && clk >= e.gate) break;
      level = Math.max(0, Math.min(15, level));
      // A square wave with its two edges smoothed (polyBLEP), so high notes do not alias.
      const blep = (t) => (t < dt ? ((t / dt) * 2 - (t / dt) ** 2 - 1) : t > 1 - dt ? (((t - 1) / dt) ** 2 + ((t - 1) / dt) * 2 + 1) : 0);
      const sq = (phase < 0.5 ? 1 : -1) + blep(phase) - blep((phase + 0.5) % 1);
      if (level > 0) mix(start + i, sq * 0.11 * db((15 - level) * 3), 3);
      phase = (phase + dt) % 1;
    }
  };
  // Drums, by SSG drum number: [kind, pitch in Hz, length in s, level].
  const KIT = { 1: ['thump', 110, 0.22, 0.9], 2: ['snare', 190, 0.13, 0.5], 4: ['thump', 150, 0.2, 0.6], 8: ['thump', 200, 0.18, 0.6], 16: ['thump', 270, 0.16, 0.6], 32: ['snare', 400, 0.04, 0.4], 64: ['snare', 230, 0.09, 0.45], 128: ['hat', 0, 0.035, 0.22], 256: ['hat', 0, 0.16, 0.22], 512: ['hat', 0, 0.6, 0.3], 1024: ['hat', 0, 0.35, 0.2] };
  const drumHit = (e) => {
    const [type, hz, secs, level] = KIT[e.drum & -e.drum]; // the lowest-numbered drum wins
    const start = Math.round(sec(e.start) * SR);
    const cut = Math.min(...iStarts.filter((t) => t > e.start), Infinity);
    const n = Math.min(secs * 4, sec(cut - e.start)) * SR;
    let phase = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR, env = Math.exp(-t / (secs / 3));
      let v;
      if (type === 'thump') { phase += (2 * Math.PI * hz * (0.45 + 0.55 * Math.exp(-t / 0.03))) / SR; v = Math.sin(phase); } else {
        const x = noise();
        v = type === 'hat' ? x - last : 0.7 * x + 0.5 * Math.sin(2 * Math.PI * hz * t);
        last = x;
      }
      mix(start + i, v * env * level * 0.3, 3);
    }
  };

  for (const r of Object.values(final.report)) {
    const events = r.part === 'I' ? iEvents : timeline(r);
    if (r.kind === 'fm') events.forEach((e) => fmNote(e, final.song.voices.find((v) => v.num === e.voice)));
    else if (r.kind === 'ssg') events.forEach(ssgNote);
    else if (r.kind === 'k') events.forEach(drumHit);
  }
  let peak = 0;
  for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const scale = (0.89 * 32767) / (peak || 1);
  const wav = Buffer.alloc(44 + left.length * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + left.length * 4, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24);
  wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(left.length * 4, 40);
  for (let i = 0; i < left.length; i++) { wav.writeInt16LE(Math.round(left[i] * scale), 44 + i * 4); wav.writeInt16LE(Math.round(right[i] * scale), 46 + i * 4); }
  fs.writeFileSync(path.resolve(wavOut), wav);
  console.log(`wrote ${wavOut}: ${seconds.toFixed(1)} s, intro + ${loops} loops, peak before normalising ${peak.toFixed(2)}`);
}
