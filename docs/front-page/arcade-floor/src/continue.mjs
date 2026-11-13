#!/usr/bin/env node
// Concept 06 (ARCADE FLOOR): assets/continue.svg, the core numbered flow as one 18 s loop.
//   node docs/front-page/arcade-floor/src/continue.mjs
// 01-10 land 3 at a time (CREDIT 1) -> the cursor taps 03 -> 03 flies into a mini README ->
// CONTINUE? counts 9..1 -> CREDIT 2 divider -> 11-20 drop in on the same page.
// The un-animated state IS the reduced-motion still: 01-20 visible, 03 installed in the README.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeWriter, textWidth } from './font.mjs';
import { vignette } from './minicards.mjs';
import { root } from './scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets');
const require = createRequire(path.join(root, 'package.json'));
const { svgPolicyIssues } = await import(pathToFileURL(path.join(root, 'tools/lib/checks.mjs')).href);
const W = makeWriter('c');
const { text, centred } = W;

const T = 18;
const pct = (s) => `${((s / T) * 100).toFixed(2)}%`;
const AMBER = '#ffb000', CYAN = '#7fe3ff', INK = '#e8ecf8', DIM = '#8b93a7';
const VW = 720, VH = 300;

// Grid geometry
const CW = 80, CH = 44, GAP = 10, X0 = 22;
const rowY = [52, 104, 190, 242];
const cardPos = (n) => {
  const i = (n - 1) % 10, batch = n > 10 ? 1 : 0;
  return { x: X0 + (i % 5) * (CW + GAP), y: rowY[batch * 2 + Math.floor(i / 5)] };
};
const card = (n, picked) => {
  const num = String(n).padStart(2, '0');
  return `<rect x="-2" y="-2" width="${CW + 4}" height="${CH + 4}" rx="3" fill="${picked ? AMBER : '#2c3040'}"/>
  <svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">${vignette(n - 1, CW, CH)}</svg>
  <rect width="${textWidth(num, 2) + 6}" height="18" fill="${picked ? AMBER : '#000'}" opacity="${picked ? 1 : 0.85}"/>
  ${text(num, 3, 2, 2, picked ? '#000' : AMBER)}`;
};

// Landing times: 3 at a time (the target CLI authors 3 headers in parallel).
const land = (n) => (n <= 10 ? 0.3 + Math.floor((n - 1) / 3) * 0.9 : 11.9 + Math.floor((n - 11) / 3) * 0.6);
let css = '';
let cards = '';
for (let n = 1; n <= 20; n++) {
  const { x, y } = cardPos(n);
  const t = land(n);
  css += `.k${n}{animation:k${n} ${T}s linear infinite}@keyframes k${n}{0%,${pct(t)}{opacity:0;transform:translateY(-12px)}${pct(t + 0.35)},${pct(17.4)}{opacity:1;transform:none}${pct(17.9)},100%{opacity:0;transform:none}}\n`;
  // Empty numbered slots for 01-10 sit under the cards, so the panel never starts blank:
  // the gallery page opens at once and fills as headers land.
  const slot = n <= 10 ? `<rect x="0" y="0" width="${CW}" height="${CH}" rx="3" fill="#161927" stroke="#2c3040" stroke-width="2" stroke-dasharray="5 4"/>${centred(String(n).padStart(2, '0'), CW / 2, CH / 2 - 7, 2, '#3a3f55')}` : '';
  cards += `<g transform="translate(${x} ${y})">${slot}<g class="k${n}">${card(n, n === 3)}</g></g>\n`;
}

// README sheet (right). The slot holds the installed header at 2.3x the card size.
const SX = 498, SY = 40, SWd = 204, SHt = 244;
const SLOT = { x: SX + 12, y: SY + 34, s: 2.25 };
const slotW = CW * SLOT.s, slotH = CH * SLOT.s;
const p3 = cardPos(3);
const sheet = `<g>
  <rect x="${SX}" y="${SY}" width="${SWd}" height="${SHt}" rx="6" fill="#f6f8fa" stroke="#d0d7de" stroke-width="2"/>
  <rect x="${SX}" y="${SY}" width="${SWd}" height="24" rx="6" fill="#e6eaef"/><rect x="${SX}" y="${SY + 18}" width="${SWd}" height="6" fill="#e6eaef"/>
  ${text('README.MD', SX + 10, SY + 6, 2, '#1f2328')}
  <g class="empty"><rect x="${SLOT.x}" y="${SLOT.y}" width="${slotW}" height="${slotH}" rx="3" fill="#eef1f4" stroke="#8c959f" stroke-width="2" stroke-dasharray="6 5"/>
  ${centred('YOUR HEADER', SLOT.x + slotW / 2, SLOT.y + slotH / 2 - 7, 2, '#8c959f')}</g>
  <rect x="${SX + 12}" y="${SY + 148}" width="120" height="12" fill="#1f2328"/>
  ${[0, 1, 2].map((j) => `<rect x="${SX + 12}" y="${SY + 172 + j * 14}" width="${[176, 150, 168][j]}" height="6" fill="#afb8c1"/>`).join('')}
</g>`;
const fly = `<g class="fly">${card(3, true)}</g>`;
css += `.fly{transform:translate(${SLOT.x}px,${SLOT.y}px) scale(${SLOT.s});animation:fly ${T}s ease-in-out infinite}
@keyframes fly{0%,${pct(5.3)}{opacity:0;transform:translate(${p3.x}px,${p3.y}px) scale(1)}${pct(5.4)}{opacity:1;transform:translate(${p3.x}px,${p3.y}px) scale(1)}${pct(6.6)},${pct(17.4)}{opacity:1;transform:translate(${SLOT.x}px,${SLOT.y}px) scale(${SLOT.s})}${pct(17.9)},100%{opacity:0;transform:translate(${SLOT.x}px,${SLOT.y}px) scale(${SLOT.s})}}
.empty{opacity:0;animation:empty ${T}s linear infinite}@keyframes empty{0%,${pct(6.5)}{opacity:1}${pct(6.7)},${pct(17.8)}{opacity:0}100%{opacity:1}}
`;

// Install tag under the sheet; "NUMBER 3 / NPX README-NFO USE 3" shows under the grid as 03 is tapped.
const tag = `<g class="tag">${centred('03 INSTALLED', SX + SWd / 2, SY + SHt - 26, 2, '#1a7f37')}</g>`;
css += `.tag{animation:tag ${T}s linear infinite}@keyframes tag{0%,${pct(6.6)}{opacity:0}${pct(6.9)},${pct(17.4)}{opacity:1}${pct(17.9)},100%{opacity:0}}\n`;

const lowerCx = X0 + (5 * CW + 4 * GAP) / 2;
// Cursor: an arrow that glides to 03 and taps.
const arrow = 'M0 0v20l5-5 4 9 4-2-4-9h7z';
const cx = p3.x + CW * 0.62, cy = p3.y + CH * 0.55;
const cursor = `<g class="cur"><path d="${arrow}" fill="#fff" stroke="#000" stroke-width="1.5"/></g>
<circle class="ring" cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${AMBER}" stroke-width="3"/>
<g class="use">${centred('"NUMBER 3"', lowerCx, 186, 4, INK)}${centred('NPX README-NFO USE 3', lowerCx, 232, 2, CYAN)}</g>`;
css += `.cur{opacity:0;animation:cur ${T}s ease-in-out infinite}@keyframes cur{0%,${pct(3.9)}{opacity:0;transform:translate(${cx + 150}px,${cy + 90}px)}${pct(4.1)}{opacity:1;transform:translate(${cx + 150}px,${cy + 90}px)}${pct(4.8)},${pct(5.6)}{opacity:1;transform:translate(${cx}px,${cy}px)}${pct(5.9)},100%{opacity:0;transform:translate(${cx}px,${cy}px)}}
.ring{opacity:0;transform-origin:${cx}px ${cy}px;animation:ring ${T}s ease-out infinite}@keyframes ring{0%,${pct(4.85)}{opacity:0;transform:scale(.4)}${pct(4.9)}{opacity:1;transform:scale(.4)}${pct(5.5)},100%{opacity:0;transform:scale(1.6)}}
.use{opacity:0;animation:use ${T}s linear infinite}@keyframes use{0%,${pct(4.9)}{opacity:0}${pct(5.0)},${pct(6.8)}{opacity:1}${pct(7.0)},100%{opacity:0}}
`;

// Labels and the CREDIT 2 divider.
const label1 = `${text('CREDIT 1', X0, 26, 2, AMBER)}${text('NPX README-NFO', X0 + 110, 26, 2, DIM)}`;
const divider = `<g class="div2"><path d="M${X0} ${171}H${X0 + 5 * CW + 4 * GAP}" stroke="#3a3f55" stroke-width="2" stroke-dasharray="4 4"/>
  <rect x="${X0}" y="160" width="${textWidth('CREDIT 2', 2) + 12}" height="22" fill="#10121c"/>${text('CREDIT 2', X0 + 4, 164, 2, AMBER)}
  <rect x="${X0 + 104}" y="160" width="${textWidth('NPX README-NFO MORE', 2) + 12}" height="22" fill="#10121c"/>${text('NPX README-NFO MORE', X0 + 110, 164, 2, DIM)}</g>`;
css += `.div2{animation:div2 ${T}s linear infinite}@keyframes div2{0%,${pct(11.5)}{opacity:0}${pct(11.7)},${pct(17.4)}{opacity:1}${pct(17.9)},100%{opacity:0}}\n`;

// While 01-10 land: a note that headers are drawn 3 at a time.
const drawing = `<g class="drawing">${text('DRAWING 3 AT A TIME', X0, 172, 2, DIM)}</g>`;
css += `.drawing{opacity:0;animation:drawing ${T}s linear infinite}@keyframes drawing{0%{opacity:1}${pct(3.7)}{opacity:1}${pct(3.9)},100%{opacity:0}}\n`;

// CONTINUE? 9..1 over the empty lower rows, 0.5 s a digit (2 changes a second, no flashing).
let count = `<g class="cont">${centred('CONTINUE?', lowerCx, 198, 4, '#ff5a7a')}`;
for (let d = 9; d >= 1; d--) count += `<g class="d${d}">${centred(String(d), lowerCx, 242, 5, AMBER)}</g>`;
count += '</g>';
css += `.cont{opacity:0;animation:cont ${T}s linear infinite}@keyframes cont{0%,${pct(6.9)}{opacity:0}${pct(7.1)},${pct(11.4)}{opacity:1}${pct(11.6)},100%{opacity:0}}\n`;
for (let d = 9; d >= 1; d--) {
  const a = 7.0 + (9 - d) * 0.5;
  css += `.d${d}{opacity:0;animation:d${d} ${T}s steps(1) infinite}@keyframes d${d}{0%{opacity:0}${pct(a)}{opacity:1}${pct(a + 0.5)},100%{opacity:0}}\n`;
}

css += `@media (prefers-reduced-motion:reduce){
  *{animation:none!important}
  .cur,.ring,.use,.cont,.empty,.drawing{display:none}
}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-label="A numbered gallery: headers 01 to 10 arrive, number 3 goes into the README, then 10 more arrive numbered 11 to 20 on the same page.">
<title>A numbered gallery: 01 to 10, number 3 installed in the README, then 11 to 20 on the same page.</title>
<style>${css}</style>
<defs>${W.defs()}</defs>
<rect x="1" y="1" width="${VW - 2}" height="${VH - 2}" rx="12" fill="#10121c" stroke="#3a3f55" stroke-width="2"/>
${label1}
${cards}
${divider}
${count}
${drawing}
${sheet}
${fly}
${tag}
${cursor}
</svg>
`;
fs.writeFileSync(path.join(out, 'continue.svg'), svg);
const issues = svgPolicyIssues(svg);
console.log(`continue.svg: ${(svg.length / 1024).toFixed(1)} KB, policy: ${issues.length ? issues.join('; ') : 'ok'}`);
if (svg.length / 1024 > 60) console.log('WARN continue.svg is over the 60 KB budget');
