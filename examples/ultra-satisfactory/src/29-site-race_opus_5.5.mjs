// "Site Race" header for the ULTRA-SATISFACTORY README (style catalogue entry xfer-01).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/ultra-satisfactory/src/29-site-race_opus_5.5.mjs
// It rewrites examples/ultra-satisfactory/29-site-race_opus_5.5.md. Edit this file, not the .md.
//
// The style: what a private FTP site said to the people racing files onto it, around 1998-2008.
// After every upload the site's checking script answered with a small ASCII box (a rule that
// starts with a full stop, "| + " rows, a closing rule from a backtick to an apostrophe with a
// "#"/":" bar and a done/total counter in it), it kept a directory whose name was a progress
// bar, swapped that for a COMPLETE bar at the end, and printed race statistics in a 70-column
// frame with letter-spaced headings. The reference for those layouts is the pzs-ng zipscript's
// default templates; the frame, bar and table technique is generic, the wording and every name
// here are this project's own. It is 7-bit ASCII only, so it needs no image at all.
//
// What is being raced is THIS app and its own open data: the nine production machines "upload"
// the 211 recipes. Nothing here refers to a copy of the game.
//
// Every number is one the app shows or was checked against ultra_satisfactory/data.py on
// 2026-09-30 (recipes and alternates per machine, the rates in SITE WHO, the Screw recipe,
// the building categories, the phase parts). The script re-adds them and refuses to write if
// they stop summing to 211 recipes, 88 alternates, 477 buildings or 18 phase orders.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '29-site-race_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 70; // the statistics frame is 70 columns wide, so the session is too
const MAST = 78; // the masthead hangs four columns out either side of it
const BOX = 52; // the per-file reply box is 52

const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const TAG = '[TMP]'; // the site's short name. invented: TEMPORARY, est. phase 1, now load-bearing
const RELEASE = 'ULTRA-SATISFACTORY.Companion.App.v0.0.1.Apache2-LUKEXYZ';

// ---------------------------------------------------------------- the data
// name, MW (null: the data lists 0 for it, so no figure is printed), machine recipes, alternates
const MACHINES = [
  ['Assembler', 15, 58, 31],
  ['Constructor', 4, 39, 8],
  ['Manufacturer', 55, 38, 19],
  ['Refinery', 30, 29, 17],
  ['Packager', 10, 20, 0],
  ['Blender', 75, 13, 6],
  ['Foundry', 16, 7, 5],
  ['Smelter', 4, 4, 1],
  ['Particle Accelerator', null, 3, 1],
];
const RECIPES = 211, ALTERNATES = 88, ITEMS = 140, BUILDINGS = 477;
const CATEGORIES = [
  ['structure', 333], ['logistics', 59], ['decor', 26], ['power', 15], ['transit', 14],
  ['production', 9], ['special', 7], ['storage', 7], ['extraction', 7],
];
const PHASES = [
  ['Automation.Basics', [[50, 'Smart Plating'], [100, 'Versatile Framework'], [500, 'Automated Wiring']]],
  ['Logistics.And.Steel', [[500, 'Automated Wiring'], [500, 'Modular Frame'], [100, 'Smart Plating'], [500, 'Versatile Framework']]],
  ['Oil.And.Computers', [[2500, 'Versatile Framework'], [500, 'Modular Engine'], [100, 'Adaptive Control Unit']]],
  ['Nuclear.And.Endgame', [[1000, 'Assembly Director System'], [500, 'Magnetic Field Generator'], [100, 'Nuclear Pasta'], [25, 'Thermal Propulsion Rocket']]],
  ['Alien.Tech.And.Quantum', [[500, 'Biochemical Sculptor'], [100, 'AI Expansion Server'], [100, 'Neural-Quantum Processor'], [100, 'Ballistic Warp Drive']]],
];
// machine, what it is making, output per minute: the standard recipe, one machine
const WHO = [
  ['Smelter', 'Iron.Ingot', 30],
  ['Foundry', 'Steel.Ingot', 45],
  ['Constructor', 'Screw', 40],
  ['Assembler', 'Versatile.Framework', 5],
  ['Manufacturer', 'Modular.Engine', 1],
  ['Refinery', 'Plastic', 20],
  ['Packager', 'Packaged.Water', 60],
  ['Blender', 'Cooling.System', 6],
  ['Particle Accelerator', 'Nuclear.Pasta', 0.5],
];
const sum = (a) => a.reduce((t, n) => t + n, 0);
const must = (ok, msg) => { if (!ok) throw new Error(msg); };
must(sum(MACHINES.map((m) => m[2])) === RECIPES, 'machine recipes do not add up to 211');
must(sum(MACHINES.map((m) => m[3])) === ALTERNATES, 'alternates do not add up to 88');
must(sum(CATEGORIES.map((c) => c[1])) === BUILDINGS, 'building categories do not add up to 477');
must(CATEGORIES.find((c) => c[0] === 'production')[1] === MACHINES.length, 'production count is not the machine count');
must(WHO.length === MACHINES.length && WHO.every(([m]) => MACHINES.some(([n]) => n === m)), 'SITE WHO does not list each machine once');
const ORDERS = sum(PHASES.map((p) => p[1].length));
const PARTS = sum(PHASES.flatMap((p) => p[1].map((o) => o[0])));
must(ORDERS === 18 && PARTS === 7775, 'phase orders changed');

// ---------------------------------------------------------------- inline markup
// Lines are plain strings. Bold and links are zero-width control-character markers, so widths
// are measured exactly and the HTML is produced at the very end:
//   \x01 ... \x02            bold
//   \x03 N \x06 ... \x04     link number N
//   \x05                     a space inside either, which the word wrapper may not break at
const links = [];
const hold = (s) => s.replace(/ /g, '\x05');
const B = (s) => `\x01${hold(s)}\x02`;
const A = (s, href = s) => {
  links.push(href);
  return `\x03${links.length - 1}\x06${hold(s)}\x04`;
};
const visible = (s) => s.replace(/\x03\d+\x06/g, '').replace(/[\x01\x02\x04]/g, '').replace(/\x05/g, ' ');
const len = (s) => visible(s).length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const padL = (s, n) => ' '.repeat(Math.max(0, n - len(s))) + s;
const spread = (l, r, n = W) => {
  must(len(l) + len(r) + 2 <= n, `spread too wide: ${visible(l)} | ${visible(r)}`);
  return l + ' '.repeat(n - len(l) - len(r)) + r;
};
const wrap = (text, width) => {
  const out = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && len(line) + 1 + len(word) > width) { out.push(line); line = word; } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\x05/g, ' ')
  .replace(/\x01/g, '<b>').replace(/\x02/g, '</b>')
  .replace(/\x03(\d+)\x06/g, (m, n) => `<a href="${links[Number(n)]}">`)
  .replace(/\x04/g, '</a>');

// ---------------------------------------------------------------- the logo
// The bar characters are the whole palette: "#" is a file that has arrived, ":" one that has
// not. ULTRA is a finished bar, every cell "#", with the letters left out of it. SATISFACTORY
// stands underneath in "#". That is the app's own title split (tinted ULTRA, plain
// SATISFACTORY) done with one character.
// A text cell is about 1 wide to 2.4 tall, so ULTRA is drawn two columns to the pixel and
// SATISFACTORY with two-column stems: both get the same stroke weight. Its counters are one
// column wide, so the letters stand two columns apart or they run together.
// The ULTRA letters are holes, and a hole two columns wide next to a wall two columns wide
// reads as stripes, not letters: the walls between them are four columns, twice the stroke.
const PIXEL = {
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
};
const STEM = {
  S: ['.####', '##...', '.###.', '...##', '####.'],
  A: ['.###.', '##.##', '#####', '##.##', '##.##'],
  T: ['####', '.##.', '.##.', '.##.', '.##.'],
  I: ['##', '##', '##', '##', '##'],
  F: ['#####', '##...', '####.', '##...', '##...'],
  C: ['.####', '##...', '##...', '##...', '.####'],
  O: ['.###.', '##.##', '##.##', '##.##', '.###.'],
  R: ['####.', '##.##', '####.', '##.#.', '##.##'],
  Y: ['##..##', '##..##', '.####.', '..##..', '..##..'],
};
const setWord = (word, font, scale, gap) => {
  const rows = Array.from({ length: 5 }, () => '');
  [...word].forEach((ch, i) => font[ch].forEach((line, r) => {
    rows[r] += [...line].map((c) => c.repeat(scale)).join('') + (i < word.length - 1 ? '.'.repeat(gap) : '');
  }));
  return rows;
};
function logo() {
  const ultra = setWord('ULTRA', PIXEL, 2, 4);
  const satis = setWord('SATISFACTORY', STEM, 1, 2);
  must(satis[0].length === MAST, `SATISFACTORY is ${satis[0].length} columns, expected ${MAST}`);
  const inner = MAST - 2, side = (inner - ultra[0].length) / 2;
  must(Number.isInteger(side) && side >= 3, 'ULTRA does not centre in the bar');
  const blank = '.'.repeat(inner);
  const bar = [blank, ...ultra.map((r) => '.'.repeat(side) + r + '.'.repeat(side)), blank]
    .map((r) => '[' + r.replace(/#/g, ' ').replace(/\./g, '#') + ']');
  return [...bar, ...satis.map((r) => r.replace(/\./g, ' '))];
}

// ---------------------------------------------------------------- the race furniture
// A "#"/":" bar of n cells with `done` of `total` present.
const meter = (n, done, total) => {
  const filled = Math.round((n * done) / total);
  return '[' + '#'.repeat(filled) + ':'.repeat(n - filled) + ']';
};
// The directory whose name is the progress meter. It truncates: 210 of 211 is 99%, not 100%,
// and the last cell stays ":" until the last file lands.
const progressDir = (done, total, n = 20) => {
  const filled = Math.floor((n * done) / total);
  return `[${'#'.repeat(filled)}${':'.repeat(n - filled)}] - ${padL(String(Math.floor((100 * done) / total)), 3)}% Complete - ${TAG}`;
};
const completeBar = (stats) => `${TAG} - ( ${stats} - ${B('COMPLETE')} ) - ${TAG}`;

// The per-file reply box, 52 columns.
function replyBox(title, rows, done, total) {
  const head = `.-== ${title} ==`;
  const counter = `[${padL(String(done), 3)}/${padR(String(total), 3)}]`;
  const foot = '`-' + meter(24, done, total);
  const out = [
    head + '-'.repeat(BOX - 1 - len(head)) + '.',
    ...rows.map((r) => {
      must(len(r) <= BOX - 6, `reply row too wide (${len(r)}): ${visible(r)}`);
      return '| + ' + padR(r, BOX - 6) + ' |';
    }),
    foot + '-'.repeat(BOX - len(foot) - len(counter) - 3) + counter + "--'",
  ];
  out.forEach((l) => must(len(l) === BOX, `reply box line is ${len(l)} columns: ${visible(l)}`));
  return out;
}
const okRow = (key, text) => padR(`${key}: oK!`, 17) + text;
// Notes in the margin to the right of a reply box.
const beside = (box, notes, gap = 2) => box.map((l, i) => (notes[i] ? l + ' '.repeat(gap) + notes[i] : l));

// The statistics frame, 70 columns: stepped letter-spaced heading, rows of
// rank / name / four right-aligned figures with unit suffixes, a dash-space-dash divider
// and a Total row.
const RULE_TOP = '.' + '-'.repeat(W - 2) + '.';
const RULE_BOTTOM = '`' + '-'.repeat(W - 2) + "'";
const DIVIDER = '|' + '- '.repeat((W - 2) / 2) + '|';
const statHead = (title, note = '') => {
  const left = `|-=[ ${B([...title].join(' '))} ]=`;
  must(len(left) <= 35, `heading too long: ${title}`);
  must(len(note) <= 31, `heading note too long: ${note}`);
  return [
    left + '-'.repeat(36 - len(left)) + '.' + padL(note, 31) + ' |',
    '|' + ' '.repeat(36) + '`' + '-'.repeat(17) + '====' + '-'.repeat(10) + '|',
  ];
};
const statRow = (rank, name, a, b, c, d) => `| ${padL(String(rank), 3)} ${padR(name, 29)} ${padL(a, 8)} ${padL(b, 5)} ${padL(c, 6)} ${padL(d, 10)} |`;
const statTotal = (n, note, b, d) => `| ${padL(String(n), 3)} Total ${padL(note, 32)} ${padL(b, 5)} 100.0% ${padL(d, 10)} |`;
const statNote = (text) => `| ${padR(text, W - 4)} |`;
const pct = (n, total) => ((100 * n) / total).toFixed(1) + '%';
const frameCheck = (lines) => { lines.forEach((l) => must(len(l) === W, `frame line is ${len(l)} columns: ${visible(l)}`)); return lines; };

// What the client typed, and the site's numbered replies (a dash after the code means
// "more lines follow", as in any FTP reply).
const cmd = (s) => 'ftp> ' + B(s);
const reply = (code, ...lines) => (lines.length === 1 ? [`${code} ${lines[0]}`] : lines.map((l, i) => `${code}${i < lines.length - 1 ? '-' : ' '} ${l}`));
const say = (code, text) => reply(code, ...wrap(text, W - 5));

// ---------------------------------------------------------------- first screen
const machineTop = frameCheck([
  RULE_TOP,
  ...statHead('MACHINETOP', 'F: recipes    ALT: alternates'),
  ...MACHINES.map(([name, mw, recipes, alts], i) => statRow(i + 1, i === 0 ? B(name) : name, (mw === null ? '??' : mw) + 'MW', recipes + 'F', pct(recipes, RECIPES), alts + 'ALT')),
  DIVIDER,
  statTotal(MACHINES.length, '??: the data says 0. sure.  ', RECIPES + 'F', ALTERNATES + 'ALT'),
  RULE_BOTTOM,
]);

const indent = (lines) => lines.map((l) => ' '.repeat((MAST - W) / 2) + l);
const main = [
  ...logo(),
  '',
  ...indent([
  ...reply(220, `${TAG} TEMPORARY. est. phase 1. still up. now load-bearing.`),
  cmd(`cd /apps/${RELEASE}`),
  ...reply(250,
    'a companion app for the factory game Satisfactory: every recipe,',
    'building and Space Elevator objective, one click apart.'),
  cmd('ls'),
  spread(progressDir(RECIPES - 1, RECIPES), `${RECIPES - 1} of ${RECIPES}. one to go.`),
  cmd(`put recipe.${RECIPES}.of.${RECIPES}`),
  ...beside(replyBox(B('ULTRA-SATISFACTORY') + ' beltscript', [
    okRow('SFV-file', `${ITEMS} items, ${RECIPES} recipes`),
    okRow('CRC-Check', `${BUILDINGS} buildings, ${PHASES.length} phases`),
    okRow('Tabs', `${B('OBJECTiVES')} ${B('iTEMS')} ${B('BUiLDiNGS')}`),
    okRow('Live', A('in your browser, no install', LIVE)),
    okRow('Local', A('two commands: run it locally', '#run-it-locally')),
    padR('Official: nO!', 17) + 'unofficial fan project',
  ], RECIPES, RECIPES), ['', ...[1, 2, 3, 4, 5, 6].map((k) => `${meter(10, k, 6)} ${k}/6`)]), // the six checks on the last file, one bar each
  cmd('ls'),
  spread(completeBar(`${MACHINES.length}M ${RECIPES}F`), 'M: machines. F: recipes.'),
  cmd('site stat'),
  ...machineTop,
  ]),
];

// ---------------------------------------------------------------- details 1: the directory
const entry = (name, text) => wrap(text, W - 15).map((t, i) => padR(i === 0 ? name : '', 15) + t);
const listing = [
  cmd('ls'),
  completeBar(`${MACHINES.length}M ${RECIPES}F`),
  ...entry(B('OBJECTiVES/'), 'pick a Space Elevator phase, see the parts it needs and how many. click a part for its recipe.'),
  ...entry(B('iTEMS/'), 'search every item as you type. recipe cards show the ingredients per minute, the machine with its cycle time and power draw, and the products.'),
  ...entry(B('BUiLDiNGS/'), 'every building and what it makes, grouped by tier. Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.'),
  ...entry(A('app/app.py'), 'the app: a single Streamlit file. a monolith, like your first factory.'),
  ...entry(A('modal_app.py'), 'the same app as a full Streamlit server, on Modal.'),
  ...entry(A('LICENSE'), 'Apache 2.0. nothing to unlock. it was never locked.'),
  ...say(226, `everything links: click an ingredient or product to open its recipe, click the machine to open its building. ${A('#whats-inside')}`),
  '',
  cmd('site run'),
  ...beside(replyBox(B('ULTRA-SATISFACTORY') + ': run it', [
    'python -m pip install -r requirements.txt',
    'python -m streamlit run app/app.py',
    okRow('Python', '3.10+, from the repo root'),
    okRow('Serving', 'http://localhost:8501'),
  ], 2, 2), ['', '<- command one', '<- command two', '', '<- that is all']),
  ...reply(200, `or install nothing: ${A(LIVE)}`,
    'the whole app in a tab: stlite runs Streamlit on WebAssembly.',
    'GitHub Actions publishes it again on every push to main.'),
  '',
  cmd('cd ..'),
  cmd('ls'),
  B(RELEASE),
  '(incomplete)-Your.Factory.Phase.3.Oil.And.Computers-YOU',
  '(no-nfo)-Temporary.Belt.Now.Load.Bearing-YOU',
  '(incomplete)-Tidy.Main.Bus.For.Real.This.Time-YOU',
  '(no-nfo)-Storage.Box.Of.Screws.Number.Nine-YOU',
  cmd('ls Your.Factory.Phase.3.Oil.And.Computers-YOU'),
  progressDir(2, 5),
  ...say(226, '2 phases of 5. the missing file is the one input your Manufacturer is starved of. the app cannot build it for you. it can tell you, in one click, what it is.'),
];

// ---------------------------------------------------------------- details 2: more stats
const buildTop = frameCheck([
  RULE_TOP,
  ...statHead('BUILDTOP', 'B: buildings you can place'),
  ...CATEGORIES.map(([name, n], i) => statRow(i + 1, name, '', n + 'B', pct(n, BUILDINGS), meter(8, n, BUILDINGS))),
  DIVIDER,
  statTotal(CATEGORIES.length, '', BUILDINGS + 'B', meter(8, 1, 1)),
  RULE_BOTTOM,
]);
const shareSum = sum(CATEGORIES.map(([, n]) => Number(((100 * n) / BUILDINGS).toFixed(1)))).toFixed(1);
const order = ([n, name]) => padL('x' + n, 5) + ' ' + name;
const phaseList = PHASES.flatMap(([name, orders], i) => {
  const total = sum(orders.map((o) => o[0]));
  const rows = [];
  for (let k = 0; k < orders.length; k += 2) rows.push('   ' + padR(order(orders[k]), 33) + (orders[k + 1] ? order(orders[k + 1]) : ''));
  return [spread(B(`Phase.${i + 1}.${name}`), `( ${total}P ${orders.length}F )`), ...rows];
});
const stats = [
  cmd('site stat buildings'),
  ...buildTop,
  ...reply(200,
    ...(shareSum === '100.0' ? [] : [`yes, the share column adds up to ${shareSum}. it is overclocked.`]),
    `${MACHINES.length} of the ${BUILDINGS} do the work. the other ${BUILDINGS - MACHINES.length} hold them up, feed them,`,
    `or stand nearby looking good. the tidy-factory people use all ${CATEGORIES[0][1]}`,
    'structure pieces. the spaghetti people never opened that tab.'),
  '',
  cmd('ls -R /elevator'),
  ...phaseList,
  ...say(226, `${PHASES.length} phases, ${ORDERS} orders, ${PARTS} parts. P: parts. F: lines on the order form. the ${B('OBJECTiVES')} tab lists them like this: pick a phase, click a part, get its recipe. no spreadsheet was harmed.`),
];

// ---------------------------------------------------------------- details 3: who, nukes, credits
const whoRow = (name, verb, what, rate) => `| ${padR(name, 21)} ${verb} ${padR(what, 29)} ${padL(rate, 9)} |`;
const who = frameCheck([
  RULE_TOP,
  ...statHead('WHO', 'standard recipe, one machine'),
  ...WHO.map(([name, what, rate]) => whoRow(name, 'STOR', what, rate.toFixed(1) + '/min')),
  whoRow('you', 'IDLE', '"just checking a recipe"', '2h 14m'),
  DIVIDER,
  statNote(`${WHO.length} uploading, 1 idle. the idle one is the bottleneck. it always is.`),
  RULE_BOTTOM,
]);
const credit = (k, text) => wrap(text, W - 5 - 11).map((t, i) => padR(i === 0 ? k : '', 11) + t);
const rest = [
  cmd('site who'),
  ...who,
  '',
  cmd('site dupe screw'),
  ...reply(200, `${B('Screw')}: 1 Iron Rod -> 4 Screw. Constructor, 6 s, 4 MW. 40/min.`,
    'dupe. you already own nine storage boxes of these.'),
  cmd('site nuke Spaghetti.Bus.v2.FINAL-YOU 3 belts.run.the.wrong.way'),
  ...reply(200, 'nuked x3. the tidy-factory people send their regards.'),
  cmd('site nuke Load.Balancer.For.Two.Smelters-YOU 2 use.a.manifold'),
  ...reply(200, 'nuked x2. the manifold people send theirs.'),
  cmd('site nuke Pipe.Clipped.Through.A.Wall-YOU 1 we.all.saw.it'),
  ...reply(550, 'what pipe. nobody here saw a pipe.'),
  cmd('site unnuke Temporary.Belt.Now.Load.Bearing-YOU'),
  ...reply(550, 'it was never nuked. nobody dares. it is holding up the roof.'),
  '',
  cmd('site credits'),
  ...reply(211,
    ...credit('game data', `${A('greeny/SatisfactoryTools', 'https://github.com/greeny/SatisfactoryTools')} (data/data.json). none of this exists without it.`),
    ...credit('images', `${A('the Satisfactory Wiki', 'https://satisfactory.wiki.gg')}, under ${A('CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/')}.`),
    ...credit('the game', 'made by Coffee Stain Studios. this is an unofficial fan project, not affiliated with them. get the game from them.'),
    ...credit('this app', `${A('Apache 2.0', 'LICENSE')}. one Streamlit file. ${A('#how-its-built')}`),
    ...credit('the rest', A('#data--credits')),
    ...credit('raced', 'this app and its own open data. nothing else. ever.')),
  cmd('quit'),
  ...reply(221, 'goodbye. a fuse just blew. the race was at 98%.'),
];

// ---------------------------------------------------------------- write + verify
// 7-bit printable ASCII only: that is the style, and it renders the same in any mono font.
function verify(name, lines) {
  const bad = [], max = name === 'main' ? MAST : W;
  lines.forEach((l, i) => {
    const v = visible(l);
    if (v.length > max) bad.push(`${name} line ${i + 1} is ${v.length} columns: ${v}`);
    if (!/^[\x20-\x7e]*$/.test(v)) bad.push(`${name} line ${i + 1} is not 7-bit ASCII: ${v}`);
  });
  return bad;
}
const clean = (lines) => lines.map((l) => l.replace(/\s+$/, ''));
const pre = (lines) => ['<pre>', ...clean(lines).map(toHtml), '</pre>'].join('\n');
const blocks = { main, listing, stats, rest };
const bad = Object.entries(blocks).flatMap(([name, lines]) => verify(name, lines));
must(bad.length === 0, bad.join('\n'));

// Prose outside the art follows the target repo's house style: each line opens with the
// lightning bolt (U+26A1), and there are no en or em dashes (U+2013, U+2014).
const BOLT = String.fromCodePoint(0x26a1);
const BANNED_DASH = new RegExp('[' + String.fromCodePoint(0x2013) + String.fromCodePoint(0x2014) + ']');
const details = (summary, lines) => ['<details>', `<summary>${BOLT} ${summary}</summary>`, '', pre(lines), '', '</details>', ''];
const prose = [
  `${BOLT} **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Three tabs, **Objectives**, **Items** and **Buildings**, all linked to each other, so you can look a thing up and be back before the Manufacturer notices. [Open it live in your browser](${LIVE}), nothing to install, or [run it locally](#run-it-locally) with two commands. The race above is real data: nine machines, 211 recipes, 88 of them alternates. Unofficial fan project, not affiliated with Coffee Stain Studios.`,
];
for (const p of prose) must(!BANNED_DASH.test(p), 'prose has a dash the house style bans');

const md = [
  `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(main),
  '',
  ...prose,
  '',
  ...details('<b>ftp&gt; ls</b> &nbsp;what is in the directory: three tabs, two commands, and the things you left (incomplete)', listing),
  ...details('<b>ftp&gt; site stat buildings</b> &nbsp;all 477 buildings by category, and what the Space Elevator wants in all five phases', stats),
  ...details('<b>ftp&gt; site who</b> &nbsp;who is uploading right now, a few nukes, and the real credits', rest),
].join('\n') + '\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ` + Object.entries(blocks).map(([n, l]) => `${n} ${l.length} lines`).join(', '));
