#!/usr/bin/env node
// Concept 01 "THE RELEASE": every generated SVG on the page, plus the text twin of the logo.
//   node docs/front-page/the-release/src/art.mjs
// Grown from the prototype concepts/01-the-release/gen-hero.mjs (left untouched).
// Writes into ../assets/:
//   hero-dark.svg, hero-light.svg          the logo: NFO viewer (dark) and green-bar printout (light)
//   bar-01..07-{dark,light}.svg, bar-eof-*  section bars  ░▒▓█▀▀▀[ 02/07 ]▀█▓▒░
//   batches-dark.svg, batches-light.svg    the numbered flow: one gallery, 01-10, "use 3", 11-20
//   hero-twin.txt                          the logo as plain text (77 columns)
// Deterministic: no randomness, no clock. Counts come from the catalogue loader.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pixelPath, pixelWidth, logoGrid, cellPath, shadePatterns, shadeFill } from './font.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', 'assets');
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const { loadCatalogue } = await import(pathToFileURL(path.join(ROOT, 'tools/generator/hybrid-catalogue.mjs')).href);
const cat = loadCatalogue();
const STYLES = cat.distinct.length; // 153
const FAMILIES = new Set(cat.distinct.map((s) => s.id.split('-')[0])).size; // 13
if (STYLES !== 153 || FAMILIES !== 13) console.warn(`note: catalogue now says ${STYLES} styles / ${FAMILIES} families`);
const VERSION = '0.1.0';
const SECTIONS = 7;

fs.mkdirSync(OUT, { recursive: true });
const write = (name, text) => {
  const out = text.replace(/\n\s+/g, '\n');
  fs.writeFileSync(path.join(OUT, name), out);
  console.log(`${name.padEnd(22)} ${(Buffer.byteLength(out) / 1024).toFixed(1).padStart(5)} KB`);
};

const PAL = {
  dark: { bg: '#07080b', ink: '#eef3fb', shade: '#3d63a8', dim: '#6a7d9e', accent: '#ffb347', rule: '#1a2233', frame: '#1f2a3d' },
  light: { bg: '#f6f2e6', ink: '#1c1c1e', shade: '#1c1c1e', dim: '#6b6b63', accent: '#b5401f', rule: '#d6e6d0', frame: '#d9d3c2' },
};

// ---------------------------------------------------------------- hero ----------
const CW = 12, CH = 24;            // one CP437 cell (8x16 at 1.5x)
const W = 960, H = 360;            // 80 x 15 cells
const logo = logoGrid('README.NFO');
const LW = Math.max(...logo.map((row) => row.length)); // 67 cells
const LX = Math.round((W - LW * CW) / 2);
const LY = 4 * CH;
const logoD = cellPath(logo, LX, LY, CW, CH);

function hero(theme) {
  const p = PAL[theme];
  const dark = theme === 'dark';
  const fill = (c) => shadeFill(c, p.shade);
  const cells = (xCell, yPx, str, h = CH) => [...str].map((c, i) => {
    const f = fill(c);
    return f ? `<rect x="${xCell * CW + i * CW}" y="${yPx}" width="${CW}" height="${h}" fill="${f}"/>` : '';
  }).join('');

  // side fades ░▒▓█ … █▓▒░, thinning towards the floor, with ▄▄▄ caps
  const lCell = LX / CW - 5, rCell = LX / CW + LW + 1;
  let fades = '';
  ['█▓▒░', '▓▒░ ', '▒░  ', '░   '].forEach((s, i) => {
    fades += cells(lCell, LY + i * CH, s);
    fades += cells(rCell, LY + i * CH, [...s].reverse().join(''));
  });
  fades += `<rect x="${lCell * CW}" y="${LY - CH / 2}" width="${3 * CW}" height="${CH / 2}" fill="${p.shade}"/>`;
  fades += `<rect x="${(rCell + 1) * CW}" y="${LY - CH / 2}" width="${3 * CW}" height="${CH / 2}" fill="${p.shade}"/>`;

  // floor bar: dark mode runs a ▒▓█▓▒ pulse through a ░ strip; light mode prints a still ░▒▓▒…▒▓▒░
  const floorY = LY + 6 * CH + CH / 2;
  const floorX = lCell * CW, floorN = LW + 10, floorW = floorN * CW;
  const waveTile = [...'░░░░░░░░░▒▓█▓▒░░░░░░░░░░'];
  const waveP = waveTile.length * CW;
  let floor;
  if (dark) {
    const n = floorN + 2 * waveTile.length;
    const strip = Array.from({ length: n }, (_, i) => {
      const f = fill(waveTile[i % waveTile.length]);
      return `<rect x="${i * CW}" y="0" width="${CW}" height="${CH / 2}" fill="${f}"/>`;
    }).join('');
    floor = `<clipPath id="fc"><rect x="${floorX}" y="${floorY}" width="${floorW}" height="${CH / 2}"/></clipPath>`
      + `<g clip-path="url(#fc)"><g class="wave"><g transform="translate(${floorX - waveP} ${floorY})">${strip}</g></g></g>`;
  } else {
    const s = '░▒▓' + '▒'.repeat(floorN - 6) + '▓▒░';
    floor = `<g transform="translate(${floorX} ${floorY})">${[...s].map((c, i) => `<rect x="${i * CW}" y="0" width="${CW}" height="${CH / 2}" fill="${fill(c)}"/>`).join('')}</g>`;
  }

  const tag = 'R E T R O   R E A D M E   H E A D E R S';
  const tagD = pixelPath(tag, (W - pixelWidth(tag, 3)) / 2, floorY + CH + 18, 3);
  const ver = `V${VERSION}`;
  const verX = LX + LW * CW - pixelWidth(ver, 2) - 12, verY = LY - 22;
  const verD = pixelPath(ver, verX, verY, 2);
  const status = `${STYLES} STYLES · ${FAMILIES} FAMILIES · MIT`;
  const statusD = pixelPath('README.NFO', 56, 22, 2) + pixelPath(status, W - 56 - pixelWidth(status, 2), 22, 2);

  const plate = dark
    ? `<rect width="${W}" height="${H}" fill="${p.bg}"/><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${p.frame}"/>`
    : `<rect width="${W}" height="${H}" fill="${p.bg}"/>`
      + Array.from({ length: Math.ceil(H / (2 * CH)) }, (_, i) => `<rect x="44" y="${i * 2 * CH + CH}" width="${W - 88}" height="${CH}" fill="${p.rule}" opacity=".55"/>`).join('')
      + Array.from({ length: Math.floor(H / CH) }, (_, i) => `<circle cx="20" cy="${i * CH + CH / 2}" r="5.5" fill="#e4dfd1"/><circle cx="${W - 20}" cy="${i * CH + CH / 2}" r="5.5" fill="#e4dfd1"/>`).join('')
      + `<path d="M40 0V${H}M${W - 40} 0V${H}" stroke="${p.frame}" stroke-dasharray="3 3"/>`;

  const defs = shadePatterns(p.shade, p.bg) + (dark
    ? `<linearGradient id="lg" x1="0" y1="${LY}" x2="0" y2="${LY + 6 * CH}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#dfe8f6"/><stop offset=".62" stop-color="#8fb0e4"/><stop offset="1" stop-color="#3d63a8"/></linearGradient>`
      + `<linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<clipPath id="lc"><path d="${logoD}"/></clipPath>`
    : '');

  // dark: glint 2.3 s every 9 s, floor pulse every 6 s, amber cursor at 0.8 Hz.
  // light: prints in once (15 rows in 2 s, head riding the edge), then holds still. Keyframe 0% is the
  // finished page, so a still taken before the clock starts (or an unticked offscreen image) is complete.
  const css = dark
    ? `.glint{animation:glint 9s linear infinite}
       @keyframes glint{0%{transform:translateX(-260px) skewX(-24deg)}25.6%{transform:translateX(${W + 120}px) skewX(-24deg)}100%{transform:translateX(${W + 120}px) skewX(-24deg)}}
       .wave{animation:wave 6s linear infinite}
       @keyframes wave{from{transform:translateX(0)}to{transform:translateX(${waveP}px)}}
       .cur{animation:blink 1.25s steps(1) infinite}
       @keyframes blink{50%{opacity:0}}
       @media (prefers-reduced-motion:reduce){.glint{animation:none;display:none}.wave{animation:none;transform:translateX(${waveP / 2}px)}.cur{animation:none}}`
    : `.reveal{animation:print 2s forwards}
       @keyframes print{0%{transform:scaleY(1);animation-timing-function:steps(1,end)}0.5%{transform:scaleY(0);animation-timing-function:steps(${H / CH},end)}100%{transform:scaleY(1)}}
       .head{animation:head 2s forwards}
       @keyframes head{0%{transform:translateY(0);opacity:0;animation-timing-function:steps(1,end)}0.5%{transform:translateY(0);opacity:.7;animation-timing-function:steps(${H / CH},end)}99%{opacity:.7}100%{transform:translateY(${H}px);opacity:0}}
       @media (prefers-reduced-motion:reduce){.reveal{animation:none}.head{animation:none;display:none}}`;

  const body = `<path d="${statusD}" fill="${p.dim}"/>
    <rect x="56" y="44" width="${W - 112}" height="2" fill="${dark ? p.rule : '#bdd3b5'}"/>
    ${fades}
    <path d="${logoD}" fill="${dark ? 'url(#lg)' : p.ink}"/>
    ${dark ? `<g clip-path="url(#lc)"><rect class="glint" x="0" y="${LY - 10}" width="110" height="${6 * CH + 20}" fill="url(#gl)" opacity=".75"/></g>` : ''}
    ${floor}
    <path d="${tagD}" fill="${p.ink}"/>
    <g fill="${p.accent}"><path d="${verD}"/><rect class="cur" x="${verX + pixelWidth(ver, 2) + 4}" y="${verY}" width="8" height="14"/></g>`;

  const content = dark ? plate + body
    : `${plate}<clipPath id="pr"><rect class="reveal" x="0" y="0" width="${W}" height="${H}"/></clipPath><g clip-path="url(#pr)">${body}</g>
       <rect class="head" x="44" y="-6" width="${W - 88}" height="6" fill="#9a9384" opacity=".6"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="README.NFO: retro README headers. ${STYLES} styles in ${FAMILIES} families. MIT.">
<style>${css}</style>
<defs>${defs}</defs>
${content}
</svg>
`;
}
for (const t of ['dark', 'light']) write(`hero-${t}.svg`, hero(t));

// ---------------------------------------------------------------- section bars ----------
// ░▒▓█▀▀▀▀…▀▀[ 02/07 ]▀▀█▓▒░, decorative (alt=""). 960x36 viewBox, shown at width="100%"
// (about 31 px tall in the 838 px column, 12 px on a 309 px phone).
function bar(label, theme, centred = false) {
  const p = PAL[theme];
  const BW = 960, BH = 36, y0 = 2, CHB = 32, PX = 3;
  const ink = p.shade, txt = p.ink, plate = p.bg;
  const cell = (c, i) => `<rect x="${i * CW}" y="${y0}" width="${CW}" height="${CHB}" fill="${shadeFill(c, ink)}"/>`;
  const left = [...'░▒▓█'].map((c, i) => cell(c, i)).join('');
  const right = [...'█▓▒░'].map((c, i) => cell(c, 76 + i)).join('');
  const tw = pixelWidth(label, PX);
  const tx = centred ? Math.round((BW - tw) / 2) : 76 * CW - 2 * CW - 24 - 12 - tw; // right-aligned, two rule cells before the fade
  const bL = tx - 22, bR = tx + tw + 12;   // bracket left edges, each bracket 10 wide
  const ruleY = y0 + 12, ruleH = 8;
  const rules = `<rect x="${4 * CW}" y="${ruleY}" width="${bL - 12 - 4 * CW}" height="${ruleH}" fill="${ink}"/>`
    + `<rect x="${bR + 22}" y="${ruleY}" width="${76 * CW - bR - 22}" height="${ruleH}" fill="${ink}"/>`;
  const brackets = `<path d="M${bL} ${y0 + 2}h10v5h-5v18h5v5h-10zM${bR} ${y0 + 2}h10v28h-10v-5h5v-18h-5z" fill="${ink}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}" aria-hidden="true">
<defs>${shadePatterns(ink, plate)}</defs>
<rect width="${BW}" height="${BH}" fill="${plate}"/>${left}${rules}${brackets}<path d="${pixelPath(label, tx, y0 + 6, PX)}" fill="${txt}"/>${right}
</svg>
`;
}
for (const t of ['dark', 'light']) {
  for (let n = 1; n <= SECTIONS; n++) write(`bar-0${n}-${t}.svg`, bar(`${String(n).padStart(2, '0')}/${String(SECTIONS).padStart(2, '0')}`, t));
  write(`bar-eof-${t}.svg`, bar('EOF', t, true));
}

// ---------------------------------------------------------------- the numbered flow ----------
// One gallery page. Batch 1 (npx readme-nfo) lands 3 at a time as 01-10; card 03 is picked
// ("use 3" puts it on top of README.md); batch 2 (npx readme-nfo more) lands as 11-20 on the
// same page. Every card is a different made-up mini scene, so no "style" repeats.
const SCENES = ['sunset', 'raster', 'checker', 'term', 'testcard', 'blocks', 'stars', 'window', 'tape', 'plasma',
  'mode7', 'pipes', 'diamonds', 'radar', 'cube', 'waves', 'peaks', 'keypad', 'copper', 'scope'];
const PALETTES = [
  ['#2b1055', '#ff6ec7', '#ffd166', '#00e5ff'], ['#001b2e', '#2ec4b6', '#e0fbfc', '#ff9f1c'],
  ['#140c1c', '#d04648', '#dad45e', '#6dc2ca'], ['#0b0f14', '#3fb950', '#a5f3a5', '#1f6f2f'],
  ['#1a1a1a', '#f4f1de', '#e07a5f', '#3d405b'], ['#0d0221', '#f72585', '#4cc9f0', '#ffd60a'],
  ['#000814', '#ffffff', '#7b8cde', '#ffd60a'], ['#0a3a74', '#d8e6f5', '#5aa9e6', '#f3c623'],
  ['#1b1b1b', '#e9c46a', '#e76f51', '#2a9d8f'], ['#120458', '#ff2a6d', '#05d9e8', '#d1f7ff'],
];
function scene(kind, pal, x, y, w, h) {
  const [bg, a, b, c] = pal;
  const R = (rx, ry, rw, rh, f, extra = '') => `<rect x="${x + rx}" y="${y + ry}" width="${rw}" height="${rh}" fill="${f}"${extra}/>`;
  let s = R(0, 0, w, h, bg);
  switch (kind) {
    case 'sunset': {
      s += `<circle cx="${x + w / 2}" cy="${y + h * 0.56}" r="${h * 0.3}" fill="${b}"/>`;
      for (let i = 0; i < 3; i++) s += R(0, h * 0.4 + i * 6, w, 2, bg);
      s += R(0, h * 0.56, w, h * 0.44, bg);
      for (let i = 0; i < 4; i++) s += R(0, h * 0.6 + i * i * 2.4, w, 1.5, a);
      for (let i = -3; i <= 3; i++) s += `<path d="M${x + w / 2 + i * 6} ${y + h * 0.56}L${x + w / 2 + i * 22} ${y + h}" stroke="${a}" stroke-width="1.5"/>`;
      break;
    }
    case 'raster':
      for (let i = 0; i < 5; i++) s += R(0, 6 + i * 12, w, 7, [a, b, c, b, a][i]);
      s += R(w * 0.2, h * 0.32, w * 0.6, h * 0.36, bg) + R(w * 0.26, h * 0.4, w * 0.48, 4, c) + R(w * 0.26, h * 0.52, w * 0.32, 4, c);
      break;
    case 'checker':
      s += R(0, 0, w, h * 0.5, a);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) if ((r + q) % 2 === 0) s += R(q * (w / 8), h * 0.5 + r * (h / 8), w / 8, h / 8, b);
      s += `<circle cx="${x + w * 0.5}" cy="${y + h * 0.45}" r="${h * 0.2}" fill="${c}"/><circle cx="${x + w * 0.45}" cy="${y + h * 0.4}" r="${h * 0.06}" fill="#fff"/>`;
      break;
    case 'term':
      s += R(4, 6, w * 0.5, 4, a) + R(4, 16, w * 0.75, 4, b) + R(4, 26, w * 0.35, 4, b) + R(4, 36, w * 0.62, 4, a) + R(4, 46, w * 0.2, 4, b) + R(4 + w * 0.22, 46, 6, 8, c);
      break;
    case 'testcard': {
      const cols = [a, b, c, '#fff', a, b, c];
      cols.forEach((f, i) => { s += R(i * (w / 7), 0, w / 7 + 0.5, h * 0.72, f); });
      s += R(0, h * 0.72, w, h * 0.28, bg) + `<circle cx="${x + w / 2}" cy="${y + h * 0.4}" r="${h * 0.22}" fill="${bg}" stroke="#fff" stroke-width="2"/>`;
      break;
    }
    case 'blocks':
      for (let i = 0; i < 4; i++) s += R(6 + i * 16, 12, 12, 26, i % 2 ? b : a) + R(6 + i * 16, 38, 12, 6, c);
      s += R(0, h - 10, w, 4, b);
      break;
    case 'stars':
      for (let i = 0; i < 18; i++) s += R((i * 37) % w, (i * 23) % (h - 4), i % 3 ? 2 : 3, i % 3 ? 2 : 3, i % 2 ? a : b);
      s += R(w * 0.18, h * 0.4, w * 0.64, 10, c);
      break;
    case 'window':
      s += R(8, 8, w - 16, h - 18, a) + R(8, 8, w - 16, 9, b) + R(w - 22, 10, 10, 5, c) + R(14, 24, w * 0.4, 4, bg) + R(14, 32, w * 0.55, 4, bg);
      break;
    case 'tape':
      s += R(6, 10, w - 12, h - 22, a) + R(14, 18, w - 28, 12, b);
      s += `<circle cx="${x + w * 0.32}" cy="${y + h * 0.66}" r="7" fill="${bg}"/><circle cx="${x + w * 0.68}" cy="${y + h * 0.66}" r="7" fill="${bg}"/>`;
      s += R(14, h - 18, w - 28, 3, c);
      break;
    case 'plasma':
      for (let i = 0; i < 6; i++) s += `<circle cx="${x + ((i * 29) % w)}" cy="${y + ((i * 17) % h)}" r="${10 + (i % 3) * 5}" fill="${[a, b, c][i % 3]}" opacity=".85"/>`;
      break;
    case 'mode7':
      s += R(0, 0, w, h * 0.42, a);
      for (let r = 0; r < 5; r++) for (let q = -2; q < 10; q++) if ((r + q) % 2 === 0) { const y0 = h * 0.42 + r * r * 2.2 + r * 4, hh = (r + 1) * 2.2 + 4, sk = (q - 4) * (r * 2 + 8); s += `<path d="M${x + w / 2 + sk} ${y + y0}h${r * 2 + 8}l${(q - 3.5) * 2} ${hh}h-${r * 2 + 12}z" fill="${b}"/>`; }
      s += R(w * 0.36, h * 0.24, w * 0.28, 10, c);
      break;
    case 'pipes':
      s += `<path d="M${x} ${y + 18}h${w * 0.6}v${h * 0.6}" stroke="${a}" stroke-width="7" fill="none"/><path d="M${x + w} ${y + 40}h-${w * 0.7}v-${h * 0.5}" stroke="${b}" stroke-width="7" fill="none"/><path d="M${x + 10} ${y + h}v-${h * 0.3}h${w * 0.8}" stroke="${c}" stroke-width="7" fill="none"/>`;
      break;
    case 'diamonds':
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) s += `<path d="M${x + q * 16 + (r % 2) * 8} ${y + r * 18}l8 9l-8 9l-8-9z" fill="${[a, b, c][(r + q) % 3]}"/>`;
      break;
    case 'radar':
      for (let k = 1; k <= 3; k++) s += `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${k * 9}" fill="none" stroke="${a}" stroke-width="1.5"/>`;
      s += `<path d="M${x + w / 2} ${y + h / 2}l26-16" stroke="${b}" stroke-width="3"/><circle cx="${x + w * 0.66}" cy="${y + h * 0.66}" r="3" fill="${c}"/>`;
      break;
    case 'cube':
      s += `<path d="M${x + w / 2} ${y + 8}l22 12l-22 12l-22-12z" fill="${a}"/><path d="M${x + w / 2 - 22} ${y + 20}l22 12v24l-22-12z" fill="${b}"/><path d="M${x + w / 2 + 22} ${y + 20}l-22 12v24l22-12z" fill="${c}"/>`;
      break;
    case 'waves':
      [a, b, c].forEach((f, k) => { let d = `M${x} ${y + 16 + k * 16}`; for (let i = 1; i <= 8; i++) d += `Q${x + i * 9 - 4.5} ${y + 16 + k * 16 + (i % 2 ? -8 : 8)} ${x + i * 9} ${y + 16 + k * 16}`; s += `<path d="${d}" stroke="${f}" stroke-width="3" fill="none"/>`; });
      break;
    case 'peaks':
      s += `<circle cx="${x + w * 0.75}" cy="${y + 16}" r="8" fill="${c}"/><path d="M${x} ${y + h}l22-34l14 18l14-28l22 44z" fill="${a}"/><path d="M${x + 36} ${y + h - 16}l14-28l8 12" stroke="${b}" stroke-width="3" fill="none"/>`;
      break;
    case 'keypad':
      for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) s += `<rect x="${x + 6 + q * 15}" y="${y + 8 + r * 17}" width="11" height="12" rx="3" fill="${[a, b, c][(r * 4 + q) % 3]}"/>`;
      break;
    case 'copper':
      for (let i = 0; i < 9; i++) s += R(i * (w / 9), 0, w / 18, h, [a, b, c][i % 3]);
      s += R(0, h * 0.4, w, 12, bg);
      break;
    case 'scope':
      for (let i = 1; i < 4; i++) s += R(0, i * (h / 4), w, 1, b) + R(i * (w / 4), 0, 1, h, b);
      { let d = `M${x} ${y + h / 2}`; for (let i = 1; i <= 14; i++) d += `L${x + i * (w / 14)} ${y + h / 2 + Math.round(Math.sin(i * 1.3) * 14)}`; s += `<path d="${d}" stroke="${a}" stroke-width="2.5" fill="none"/>`; }
      break;
    default: break;
  }
  return s;
}

function batches(theme) {
  const p = PAL[theme];
  const dark = theme === 'dark';
  const BW = 960, M = 44, CARD = 80, GAP = (BW - 2 * M - 10 * CARD) / 9; // gap 8
  const ART = 66, CARDH = 116;
  const row1 = 106, row2 = row1 + CARDH + 112;
  const BH = row2 + CARDH + 26;
  // The loop opens on the finished page (so a still or an unticked offscreen frame shows everything),
  // clears at HOLD, then lands batch 1, the pick and batch 2 again.
  const HOLD = 1.6, LOOP = 13.6; // seconds
  const pct = (t) => `${((t / LOOP) * 100).toFixed(2)}%`;
  const kf = new Map(); // appear time -> class name
  const appear = (t) => {
    const k = t.toFixed(1);
    if (!kf.has(k)) kf.set(k, `a${kf.size}`);
    return kf.get(k);
  };

  const parts = [];
  // plate
  if (dark) parts.push(`<rect width="${BW}" height="${BH}" fill="${p.bg}"/><rect x=".5" y=".5" width="${BW - 1}" height="${BH - 1}" fill="none" stroke="${p.frame}"/>`);
  else {
    parts.push(`<rect width="${BW}" height="${BH}" fill="${p.bg}"/>`);
    for (let yy = CH; yy < BH; yy += 2 * CH) parts.push(`<rect x="${M - 4}" y="${yy}" width="${BW - 2 * M + 8}" height="${CH}" fill="${p.rule}" opacity=".45"/>`);
    for (let yy = CH / 2; yy < BH; yy += CH) parts.push(`<circle cx="20" cy="${yy}" r="5.5" fill="#e4dfd1"/><circle cx="${BW - 20}" cy="${yy}" r="5.5" fill="#e4dfd1"/>`);
    parts.push(`<path d="M36 0V${BH}M${BW - 36} 0V${BH}" stroke="${p.frame}" stroke-dasharray="3 3"/>`);
  }
  // title line: the one gallery file
  const t1 = 'README-HEADERS/INDEX.HTML', t2 = 'ONE PAGE · EVERY BATCH';
  parts.push(`<path d="${pixelPath(t1, M, 20, 3)}${pixelPath(t2, BW - M - pixelWidth(t2, 3), 20, 3)}" fill="${p.dim}"/>`);
  parts.push(`<rect x="${M}" y="50" width="${BW - 2 * M}" height="2" fill="${dark ? p.rule : '#bdd3b5'}"/>`);

  const batchLabel = (y, cmd, right, t) => {
    const cls = appear(t);
    parts.push(`<g class="${cls}"><path d="${pixelPath(cmd, M, y, 4)}" fill="${p.accent}"/><path d="${pixelPath(right, BW - M - pixelWidth(right, 3), y + 4, 3)}" fill="${p.dim}"/></g>`);
  };
  const card = (i, n, x, y, t, picked) => {
    const kind = SCENES[i % SCENES.length];
    const pal = PALETTES[(i * 3 + (i >= 10 ? 1 : 0)) % PALETTES.length];
    // empty slot (always visible): the gallery shows where a header will land
    parts.push(`<rect x="${x + 1}" y="${y + 1}" width="${CARD - 2}" height="${CARDH - 2}" fill="none" stroke="${p.frame}" stroke-width="2" stroke-dasharray="4 4"/>`);
    parts.push(`<path d="${pixelPath('··', x + CARD / 2 - pixelWidth('··', 3) / 2, y + 40, 3)}" fill="${p.frame}"/>`);
    const num = String(n).padStart(2, '0');
    const cls = appear(t);
    const frame = dark ? '#2a3550' : '#1c1c1e';
    const strip = dark ? '#0f1420' : '#1c1c1e';
    parts.push(`<g class="${cls}">`
      + `<rect x="${x}" y="${y}" width="${CARD}" height="${CARDH}" fill="${strip}" stroke="${frame}" stroke-width="2"/>`
      + `<clipPath id="c${n}"><rect x="${x + 5}" y="${y + 5}" width="${CARD - 10}" height="${ART}"/></clipPath><g clip-path="url(#c${n})">${scene(kind, pal, x + 5, y + 5, CARD - 10, ART)}</g>`
      + `<path d="${pixelPath(num, x + CARD / 2 - pixelWidth(num, 5) / 2, y + ART + 12, 5)}" fill="#eef3fb"/>`
      + '</g>');
    if (picked) {
      const pc = appear(picked);
      parts.push(`<g class="${pc}"><rect x="${x - 4}" y="${y - 4}" width="${CARD + 8}" height="${CARDH + 8}" fill="none" stroke="${p.accent}" stroke-width="4"/>`
        + `<path d="${pixelPath(num, x + CARD / 2 - pixelWidth(num, 5) / 2, y + ART + 12, 5)}" fill="${p.accent}"/></g>`);
    }
  };

  // batch 1: lands 3 at a time
  batchLabel(70, '► NPX README-NFO', '01-10', 0.2);
  for (let i = 0; i < 10; i++) card(i, i + 1, M + i * (CARD + GAP), row1, 0.6 + Math.floor(i / 3) * 0.7, i === 2 ? 3.6 : 0);
  // the pick
  const x3 = M + 2 * (CARD + GAP);
  const useCls = appear(4.0);
  const useY = row1 + CARDH + 20;
  const useTxt = 'USE 3', useRest = 'ON TOP OF YOUR README';
  parts.push(`<g class="${useCls}">`
    + `<path d="M${x3 + CARD / 2 - 10} ${useY + 10}l10-12l10 12z" fill="${p.accent}"/>`
    + `<path d="${pixelPath(useTxt, x3 + CARD / 2 + 18, useY + 2, 4)}" fill="${p.accent}"/>`
    + `<rect x="${x3 + CARD / 2 + 18 + pixelWidth(useTxt, 4) + 14}" y="${useY + 12}" width="${36}" height="4" fill="${p.accent}"/>`
    + `<path d="${pixelPath(useRest, x3 + CARD / 2 + 18 + pixelWidth(useTxt, 4) + 64, useY + 6, 3)}" fill="${p.ink}"/></g>`);
  // batch 2: same page, numbering continues, new styles only
  batchLabel(row2 - 38, '► NPX README-NFO MORE', '11-20 · NO REPEATS', 5.2);
  for (let i = 0; i < 10; i++) card(i + 10, i + 11, M + i * (CARD + GAP), row2, 5.6 + Math.floor(i / 3) * 0.7, 0);

  const keyframes = [...kf].map(([t, cls]) => `.${cls}{animation:${cls} ${LOOP}s steps(1,end) infinite}@keyframes ${cls}{0%{opacity:1}${pct(HOLD)}{opacity:0}${pct(HOLD + Number(t))}{opacity:1}100%{opacity:1}}`).join('\n');
  const css = `${keyframes}
@media (prefers-reduced-motion:reduce){${[...kf.values()].map((c) => `.${c}`).join(',')}{animation:none;opacity:1}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}" role="img" aria-label="One gallery page: npx readme-nfo gives headers 01 to 10, use 3 puts number 3 on top of your README, npx readme-nfo more adds 11 to 20 with no repeated styles.">
<style>${css}</style>
${parts.join('\n')}
</svg>
`;
}
for (const t of ['dark', 'light']) write(`batches-${t}.svg`, batches(t));

// ---------------------------------------------------------------- text twin ----------
const tag = 'R E T R O   R E A D M E   H E A D E R S';
const pad = (n) => ' '.repeat(Math.max(0, n));
const left = Math.floor((78 - LW) / 2);
const twin = [pad(left - 4) + '▄▄▄' + pad(LW + 2) + '▄▄▄'];
logo.forEach((row, y) => {
  const s = ['█▓▒░', '▓▒░ ', '▒░  ', '░   ', '    ', '    '][y];
  twin.push(pad(left - 5) + s + ' ' + row.join('').padEnd(LW, ' ') + ' ' + [...s].reverse().join(''));
});
twin.push(pad(left - 5) + '░▒▓' + '█'.repeat(LW + 4) + '▓▒░', '', pad(Math.floor((78 - tag.length) / 2)) + tag);
const twinText = twin.map((l) => l.replace(/\s+$/, '')).join('\n') + '\n';
fs.writeFileSync(path.join(OUT, 'hero-twin.txt'), twinText);
console.log(`hero-twin.txt          width ${Math.max(...twin.map((l) => [...l.replace(/\s+$/, '')].length))}`);
