// README.NFO BBS logon screen: the front-page hero for concept 05.
// 960x600, an 80x25-style screen (25 rows of 24 px). Glyphs are <use> references to path glyphs built
// from the repo's own original 5x7 font (examples/readme-nfo/src/lib.mjs): no <text>, no fonts, no
// external refs. Counts come from inventory.mjs. Motion: the screen paints in row by row like a modem
// draw (about 4 s, steps() cover rects), then a lightbar walks [D] to [G] on a 13.2 s loop and the
// cursor blinks at 1 Hz. prefers-reduced-motion shows the finished screen with the bar on [D].
//   node hero-bbs.mjs <out.svg>
import fs from 'node:fs';
import { ROOT, inventory, PROJECT } from './inventory.mjs';
const [out] = process.argv.slice(2);
const { F, callers } = await inventory();

// ---- font ----
const lib = fs.readFileSync(`${ROOT}/examples/readme-nfo/src/lib.mjs`, 'utf8');
const FONT = Function(`return ${lib.match(/const FONT = (\{[\s\S]*?\n\});/)[1]}`)();
FONT['·'] = [0, 0, 0, 4, 0, 0, 0];
FONT['\''] = [4, 4, 8, 0, 0, 0, 0];
const used = new Set();
const gid = (ch) => `g${ch.codePointAt(0).toString(16)}`;
function glyphPath(ch) {
  const g = FONT[ch] || FONT['?'];
  let d = '';
  for (let r = 0; r < 7; r++) {
    let c = 0;
    while (c < 5) {
      if (g[r] & (1 << (4 - c))) { let e = c; while (e + 1 < 5 && g[r] & (1 << (4 - e - 1))) e++; d += `M${c} ${r}h${e - c + 1}v1h-${e - c + 1}z`; c = e + 1; } else c++;
    }
  }
  return d;
}
function txt(s, x, y, scale, fill, cls = '') {
  let body = '';
  for (const [i, ch] of [...String(s).toUpperCase()].entries()) {
    if (ch === ' ') continue;
    used.add(ch);
    body += `<use href="#${gid(ch)}" x="${i * 6}"/>`;
  }
  return `<g${cls ? ` class="${cls}"` : ''} transform="translate(${x} ${y}) scale(${scale})" fill="${fill}">${body}</g>`;
}
const tw = (s, scale) => (String(s).length * 6 - 1) * scale;
// a line made of [text, colour] runs
function runs(parts, x, y, scale) {
  let s = '', cx = x;
  for (const [t, c] of parts) { s += txt(t, cx, y, scale, c); cx += t.length * 6 * scale; }
  return s;
}
const runsW = (parts, scale) => tw(parts.map((p) => p[0]).join(''), scale);

// ---- palette (ANSI 16 plus a violet for the logo fade) ----
const C = { black: '#000000', blue: '#0000aa', cyan: '#00aaaa', grey: '#aaaaaa', dgrey: '#555555', lblue: '#5555ff', lcyan: '#55ffff', lmag: '#ff55ff', mag: '#aa00aa', yellow: '#ffff55', white: '#ffffff', violet: '#aa55ff' };
const W = 960, H = 600;
let body = '';

// status bar
body += `<rect width="${W}" height="28" fill="${C.blue}"/>`;
body += txt('README.NFO BBS', 14, 7, 2, C.yellow);
const node = 'NODE 1 · LOCAL · ANSI';
body += txt(node, Math.round((W - tw(node, 2)) / 2), 7, 2, C.white);
body += txt('ONLINE', W - 14 - tw('ONLINE', 2), 7, 2, C.lcyan);

// logo: README.NFO in the 5x7 font, each pixel split into two half-block bands, cyan-to-violet fade,
// magenta dither shadow, a 2 px italic step per band
const LOGO = 'README.NFO', U = 15, V = 18;
const lw = (LOGO.length * 6 - 1) * U, lx = Math.round((W - lw) / 2) - 13, ly = 42;
const slant = (b) => (13 - b) * 2;
const ramp = ['#ffffff', C.lcyan, C.lcyan, '#55eeff', '#55ddff', '#55c4ff', '#55aaff', '#5590ff', '#5577ff', C.lblue, '#7755ff', '#8855ff', C.violet, '#9944ee'];
const bands = ramp.map(() => '');
let shadow = '';
for (const [i, ch] of [...LOGO].entries()) {
  const g = FONT[ch];
  for (let r = 0; r < 7; r++) {
    let c = 0;
    while (c < 5) {
      if (g[r] & (1 << (4 - c))) {
        let e = c; while (e + 1 < 5 && g[r] & (1 << (4 - e - 1))) e++;
        const x = lx + (i * 6 + c) * U, w = (e - c + 1) * U, y = ly + r * V;
        bands[r * 2] += `M${x + slant(r * 2)} ${y}h${w}v${V / 2}h-${w}z`;
        bands[r * 2 + 1] += `M${x + slant(r * 2 + 1)} ${y + V / 2}h${w}v${V / 2}h-${w}z`;
        shadow += `M${x + 6 + slant(r * 2 + 1)} ${y + 6}h${w}v${V}h-${w}z`;
        c = e + 1;
      } else c++;
    }
  }
}
body += `<path d="${shadow}" fill="url(#dither)"/>`;
body += bands.map((d, i) => `<path d="${d}" fill="${ramp[i]}"/>`).join('');
body += `<g fill="#000" opacity=".45">${Array.from({ length: 7 }, (_, r) => `<rect x="${lx}" y="${ly + r * V + V / 2 - 1}" width="${lw + 30}" height="1"/>`).join('')}</g>`;

// taglines
const tag = 'RETRO README HEADERS, DRAWN FRESH FOR YOUR PROJECT';
body += txt(tag, Math.round((W - tw(tag, 2)) / 2), 184, 2, C.grey);
const stats = [[`${F.styles}`, C.yellow], [' STYLES · ', C.white], [`${F.families}`, C.yellow], [' AREAS · ', C.white], [`${F.headers}`, C.yellow], [' EXAMPLES · ', C.white], ['MIT', C.yellow]];
body += runs(stats, Math.round((W - runsW(stats, 3)) / 2), 205, 3);

// panel frames (double lines, title cut into the top edge)
const frame = (x, y, w, h, color, title) => {
  let s = `<g fill="none" stroke="${color}" stroke-width="2"><rect x="${x}" y="${y}" width="${w}" height="${h}"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}"/></g>`;
  const tx = x + 22, twid = tw(title, 2) + 16;
  s += `<rect x="${tx}" y="${y - 4}" width="${twid}" height="16" fill="#000"/>` + txt(title, tx + 8, y - 6, 2, C.yellow);
  return s;
};
const PY = 246, PH = 282;
const MX = 24, MW = 536, CX = 580, CW = 356;
body += frame(MX, PY, MW, PH, C.lcyan, 'MAIN MENU');
body += frame(CX, PY, CW, PH, C.lmag, 'LAST CALLERS');

// menu
const MENU = [
  ['D', 'DOOR', 'MAKE 10 HEADERS'],
  ['I', 'INSTALL', 'PUT ONE IN YOUR README'],
  ['F', 'FILES', `${F.headers} EXAMPLES · ${F.families} AREAS`],
  ['S', 'SETUP', 'ENGINE · COUNT · MORE'],
  ['H', 'HELP', 'SIGN-IN · TIME · DATA'],
  ['G', 'GOODBYE', 'CREDITS · LICENCE'],
];
const MY = PY + 26, MS = 42;
body += `<rect class="bar" x="${MX + 12}" y="${MY - 7}" width="${MW - 24}" height="35" fill="${C.blue}"/>`;
for (const [i, [k, label, desc]] of MENU.entries()) {
  const y = MY + i * MS;
  body += txt('[', 46, y, 3, C.grey) + txt(k, 46 + 18, y, 3, C.yellow) + txt(']', 46 + 36, y, 3, C.grey);
  body += txt(label, 46 + 72, y, 3, C.white);
  body += txt(desc, 262, y + 4, 2, C.lcyan);
}
// last callers: no dot leaders, 2.5x so they hold up on phones
const CY = PY + 26, CS = 31, CSCALE = 2.5;
for (const [i, [set, n]] of callers.entries()) {
  const y = CY + i * CS, name = (PROJECT[set] || set).toUpperCase();
  body += txt(name, CX + 18, y, CSCALE, i % 2 ? C.white : C.lcyan);
  body += txt(String(n), CX + CW - 18 - tw(String(n), CSCALE), y, CSCALE, C.yellow);
}
// prompt and cursor
const prompt = 'SELECTION [D I F S H G]:';
body += txt(prompt, 24, 539, 2.5, C.white);
body += `<rect class="cur" x="${24 + tw(prompt, 2.5) + 14}" y="537" width="15" height="20" fill="${C.yellow}"/>`;
// bottom status bar
body += `<rect y="${H - 34}" width="${W}" height="34" fill="${C.cyan}"/>`;
body += runs([['ENGINES ', C.blue], ['CLAUDE CODE · CODEX', C.black]], 16, H - 25, 2.5);
const loc = [['LOCAL LOGON · ', C.blue], ['PRIVATE REPOS OK', C.black]];
body += runs(loc, W - 16 - runsW(loc, 2.5), H - 25, 2.5);

// modem paint-in: 25 rows of 24 px, each wiped left to right in 20 character steps
const ROWS = 25, RH = H / ROWS, STEP = 0.155, START = 0.2;
let covers = '';
for (let r = 0; r < ROWS; r++) covers += `<rect class="cv" y="${r * RH}" width="${W}" height="${RH + 0.5}" style="animation-delay:${(START + r * STEP).toFixed(3)}s"/>`;
const paintEnd = START + (ROWS - 1) * STEP + 0.15;
body += `<g fill="#000">${covers}</g>`;

const barSteps = MENU.map((_, i) => `${((i / MENU.length) * 100).toFixed(3)}%{transform:translateY(${i * MS}px)}`).join('');
const css = `
.cv{transform-box:fill-box;transform-origin:100% 50%;animation:wipe .15s steps(20,jump-none) both}
@keyframes wipe{from{transform:scaleX(1)}to{transform:scaleX(0);visibility:hidden}}
.bar{animation:bar 13.2s step-end ${(paintEnd + 0.4).toFixed(2)}s infinite}
@keyframes bar{${barSteps}100%{transform:translateY(0)}}
.cur{animation:blink 1s steps(1,end) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.cv{display:none}.bar,.cur{animation:none}}`;
const defs = [...used].map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('') +
  `<pattern id="dither" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="${C.mag}"/><rect x="3" y="3" width="3" height="3" fill="${C.mag}"/></pattern>`;
const desc = `README.NFO bulletin board main menu: Door (make 10 headers), Install, Files (${F.headers} examples in ${F.families} areas), Setup, Help and Goodbye, beside a last-callers list of the ${F.projects} example galleries. Engines: Claude Code or Codex. Local logon: private repos OK.`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d"><title id="t">README.NFO</title><desc id="d">${desc}</desc>
<defs>${defs}</defs><style>${css}</style>
<rect width="${W}" height="${H}" fill="#000"/>${body}</svg>
`;
fs.writeFileSync(out, svg);
console.log(`${out}: ${(svg.length / 1024).toFixed(1)} KB, paint-in ends ${paintEnd.toFixed(2)} s, facts ${JSON.stringify(F)}`);
