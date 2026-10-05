// The saved random draw is embedded here so isolated validation needs only
// this builder and the forty numbered Markdown files. Do not redraw it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OPTIONS = [
  ['01-mach-11','Pinball dot-matrix display (orange plasma DMD)','mach-11','animated-svg'],
  ['02-hack-09','MUD session transcript (login banner, room block, exits line, HP prompt)','hack-09','text-only'],
  ['03-hack-14','Digital rain banner (light falling through fixed glyph columns, resolving into the title)','hack-14','animated-svg'],
  ['04-trk-07','Multi-chip tracker (FamiTracker / DefleMask / Furnace)','trk-07','animated-svg'],
  ['05-trk-10','Piano roll and falling notes (up to black MIDI)','trk-10','animated-svg'],
  ['06-demo-11','Apple II crack screen: six-colour hi-res panels and 40-column credits','demo-11','text-plus-svg'],
  ['07-demo-01','PC demo opening titles and part-credit cards (Second Reality manner)','demo-01','animated-svg'],
  ['08-vap-03','VHS tape and late-night lo-fi: OSD, tracking and chroma bleed','vap-03','animated-svg'],
  ['09-c64-05','Razor 1911 Amiga cracktro (Sector9, 1990-91): logo plate, deep-blue panel, rainbow copper text','c64-05','text-plus-svg'],
  ['10-ansi-05','BBS data screens: stats header, last callers, file-area table','ansi-05','text-plus-svg'],
  ['11-demo-04','256-byte intro: bit-pattern textures in the default VGA palette','demo-04','animated-svg'],
  ['12-vap-09','Windows XP Luna: blue title bars and the green hill','vap-09','animated-svg'],
  ['13-hack-15','Decrypt reveal: a scrambled text block that resolves into plaintext','hack-15','animated-svg'],
  ['14-pc-05','Win32 new old-school cracktro: metal logo, twister, sine scroller','pc-05','animated-svg'],
  ['15-ansi-04','ANSImation: the modem-speed draw-in','ansi-04','animated-svg'],
  ['16-nfo-01','PC NFO: brush-script block logo (the Razor 1911 and Fairlight look, after JED)','nfo-01','text-plus-svg'],
  ['17-hack-16','3D file-system landscape (pedestals and wires, or the glass-tower data city)','hack-16','animated-svg'],
  ['18-hack-17','Phreak tone pad: 4x4 keypad matrix with dual-tone scope traces','hack-17','animated-svg'],
  ['19-ansi-06','Door game screen (narrated location, bracketed hotkeys, command prompt)','ansi-06','text-plus-svg'],
  ['20-asia-05','MML listing: the project name as a tune in plain text','asia-05','text-only'],
  ["21-hack-11","mIRC channel window with colour-code block art and netsplit","hack-11","animated-svg"],
  ["22-print-03","Magazine type-in listing: BASIC, DATA blocks and a checksum column","print-03","text-only"],
  ["23-mach-07","Game Boy DMG boot: logo drop on a four-shade green LCD","mach-07","animated-svg"],
  ["24-asia-04","Shift_JIS AA: proportional-font line art inside an anonymous forum post","asia-04","static-svg"],
  ["25-pc-13","Vector objects: wireframe, glenz, vector balls, dot scroller, metaballs","pc-13","animated-svg"],
  ["26-print-02","Netlabel cassette: J-card with obi strip, and a shell whose reels turn","print-02","animated-svg"],
  ["27-asia-01","FM-synth status display: one piano keyboard per channel, level bars and spectrum (MMDSP / FMDSP lineage)","asia-01","animated-svg"],
  ["28-c64-13","Atari ST menu disk: key-numbered game list, big gradient scroller, scanline rasters","c64-13","text-plus-svg"],
  ["29-c64-06","Amiga megademo menu and trainer menu: chrome logo, giant scroller, dotted-leader option list","c64-06","text-plus-svg"],
  ["30-ansi-12","Braille-dot terminal graphics (modern TUI dashboard)","ansi-12","text-only"],
  ["31-idle-01","Atari Video Music: pulsing two-part diamonds in a tiled array","idle-01","animated-svg"],
  ["32-trk-09","Oscilloscope view (one scope per channel)","trk-09","animated-svg"],
  ["33-c64-08","Bobs and dot objects: a sphere chain on a Lissajous path, a rotating dot cube","c64-08","animated-svg"],
  ["34-pc-07","Text-mode poster installer (Razor 1911, 2024-26)","pc-07","text-plus-svg"],
  ["35-demo-06","Demoparty results.txt (with the invitation text as its companion)","demo-06","text-only"],
  ["36-idle-10","Off-air idle: colour bars, test card and the hopping 'no signal' box","idle-10","animated-svg"],
  ["37-demo-02","PC demo READ.ME: paged info file with index, member table and cut-here form","demo-02","text-only"],
  ["38-c64-07","Vertical copper bars ('Kefrens bars' / 'Alcatraz bars'): ribbons twisting down the screen","c64-07","animated-svg"],
  ["39-vap-11","Classic Mac OS: 1-bit System 6/7 desktop","vap-11","static-svg"],
  ["40-hack-18","CTF challenge board and scoreboard (category tiles, top-ten score graph, rank table)","hack-18","animated-svg"],
];
const esc = (value) => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const catalogue = (id) => `../../styles/${id.split('-')[0]}.md#${id}`;
const strip = (markdown) => markdown
  .replace(/^<!-- README\.NFO candidate[^\n]*-->\s*/,'')
  .replace(/^> \*\*Candidate \d+\*\*[^\n]*\n?/gm,'')
  .replace(/^\[Generator\]\(src\/[^\n]+\) · \[All(?: \d+)? candidates\]\(README\.md\)\s*$/gm,'')
  .trim();
const picks = OPTIONS.map(([slug,name,id,medium]) => {
  const markdown = fs.readFileSync(path.join(DIR,`${slug}.md`),'utf8').replace(/\r\n/g,'\n');
  const number = slug.slice(0,2);
  const header = strip(markdown);
  const summary = markdown.match(/^> \*\*Candidate \d+\*\* · \[[^\]]+\]\([^\n]+?\) · (.+)$/m)?.[1] || name;
  const image = header.match(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/i)?.[1];
  let textHTML = '';
  if (!image) {
    const pre = header.match(/<pre>[\s\S]*?<\/pre>/i)?.[0];
    const fenced = header.match(/```[^\n]*\n([\s\S]*?)\n```/)?.[1];
    textHTML = pre || `<pre>${esc(fenced || header)}</pre>`;
  }
  return {slug,name,id,medium,number,header,summary,image,textHTML};
});

const index = [
  '# README.NFO — 40 headers to choose from', '',
  'Forty original headers for [README.NFO itself](../../README.md), drawn in two random batches from the 152 distinct catalogue styles on 5 October 2026. [Draw one](draw.json) and [draw two](draw-2.json) record the selections; the second batch excludes every style used in the first.', '',
  '**Home README:** [16 — Brush-script NFO](16-nfo-01.md) is the main header. The favourites below it are [04 — Tracker](04-trk-07.md), [26 — Cassette](26-print-02.md), [36 — Off-air test card](36-idle-10.md) and [38 — Copper ribbons](38-c64-07.md), with [12 — Luna desktop](12-vap-09.md) and [25 — Vector objects](25-pc-13.md) completing the preview gallery. [See the home README](../../README.md). All forty candidates remain available to copy and compare.', '',
  '**New batch:** [Candidates 21–30](page-3.md) · [Candidates 31–40](page-4.md) · [Interactive new batch](gallery.html#batch-2).', '',
  '**Browse all:** [Interactive gallery and favourites](gallery.html) · [01–10](page-1.md) · [11–20](page-2.md) · [21–30](page-3.md) · [31–40](page-4.md). Tick favourites in the browser and copy their numbers. Your existing selection is retained when local storage is available.', '',
  'Each numbered Markdown file contains a copyable header. SVGs live in `assets/`; generators live in `src/`. Rebuild the index and pages with `node examples/readme-nfo/src/build-gallery.mjs`. The names below identify catalogue references; the artwork and repository branding are original.', '',
  '| # | Option | Preview | Style | Full page |',
  '| --- | --- | --- | --- | --- |',
  ...picks.map((pick,i) => `| ${pick.number} | [${pick.name}](${pick.slug}.md) | ${pick.image ? `<a href="${pick.slug}.md"><img src="${pick.image}" width="240" alt="Candidate ${pick.number}: ${esc(pick.summary)}"></a>` : '**Pure text**'} | [${pick.id}](${catalogue(pick.id)}) | [${String(Math.floor(i/10)*10+1).padStart(2,'0')}–${Math.floor(i/10)*10+10}](page-${Math.floor(i/10)+1}.md) |`), '',
  '[Other example galleries](../README.md) · [Style catalogue](../../styles/INDEX.md) · [MIT licence](../../LICENSE)', '',
];
fs.writeFileSync(path.join(DIR,'README.md'),index.join('\n'));
for(let p=0;p<Math.ceil(picks.length/10);p++) {
  const range=String(p*10+1).padStart(2,'0')+'–'+Math.min((p+1)*10,picks.length);
  const neighbours=[];
  if(p>0)neighbours.push('[← Previous](page-'+p+'.md)');
  if((p+1)*10<picks.length)neighbours.push('[Next →](page-'+(p+2)+'.md)');
  const nav='[All 40 candidates](README.md) · [Interactive favourites](gallery.html) · '+neighbours.join(' · ');
  const page=['# README.NFO headers '+range,'',nav,'','Keep the numbers of your favourites. Each header below is also saved in its own Markdown file.',''];
  for(const pick of picks.slice(p*10,p*10+10)) page.push('---','','## '+pick.number+' · '+pick.name,'','[Copy this header]('+pick.slug+'.md) · ['+pick.id+']('+catalogue(pick.id)+') · [Generator](src/'+pick.slug+'.mjs)','',pick.header,'');
  page.push('---','',nav,'');
  fs.writeFileSync(path.join(DIR,'page-'+(p+1)+'.md'),page.join('\n'));
}

const cards = picks.map((pick) => `<article class="card" id="candidate-${pick.number}" data-batch="${Number(pick.number)<=20?1:2}">
  <header class="card-heading"><label><input type="checkbox" value="${pick.number}" aria-label="Choose candidate ${pick.number}"><span class="number">${pick.number}</span><span>${esc(pick.name)}</span></label><span class="format">${pick.medium==='text-only'?'TEXT':pick.medium==='text-plus-svg'?'TEXT + SVG':pick.medium==='static-svg'?'STATIC SVG':'ANIMATED SVG'}</span></header>
  <div class="art${pick.image?'':' text-art'}">${pick.image?`<img src="${pick.image}" alt="${esc(pick.summary)}" width="960" loading="lazy">`:pick.textHTML}</div>
  <p class="description">${esc(pick.summary)}</p>
  <footer><a href="${pick.slug}.md">Copyable header</a><a href="${catalogue(pick.id)}">${pick.id}</a><a href="src/${pick.slug}.mjs">Generator</a></footer>
</article>`).join('\n');
const script = `
const filters = [...document.querySelectorAll('[data-show-batch]')];
function filterBatch(batch) {
  document.querySelectorAll('.card').forEach(card => { card.hidden = batch !== 'all' && card.dataset.batch !== batch; });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.showBatch === batch)));
}
const batchFromHash = () => location.hash === '#batch-2' ? '2' : location.hash === '#batch-1' ? '1' : 'all';
filters.forEach(button => button.addEventListener('click', () => {
  filterBatch(button.dataset.showBatch);
  history.replaceState(null, '', button.dataset.showBatch === 'all' ? location.pathname : '#batch-' + button.dataset.showBatch);
}));
window.addEventListener('hashchange', () => filterBatch(batchFromHash()));
filterBatch(batchFromHash());
const storageKey = 'readme-nfo-favourites-2026-10-05';
const boxes = [...document.querySelectorAll('input[type="checkbox"]')];
const selected = document.getElementById('selected');
const count = document.getElementById('count');
const status = document.getElementById('status');
const numbers = () => boxes.filter(box => box.checked).map(box => box.value);
let saved = [];
try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
if (!Array.isArray(saved)) saved = [];
boxes.forEach(box => { box.checked = saved.includes(box.value); });
function update() {
  const chosen = numbers();
  selected.value = chosen.join(', ');
  count.textContent = chosen.length + ' selected';
  boxes.forEach(box => box.closest('.card').classList.toggle('chosen', box.checked));
  try { localStorage.setItem(storageKey, JSON.stringify(chosen)); } catch {}
}
boxes.forEach(box => box.addEventListener('change', () => { update(); status.textContent = ''; }));
document.getElementById('clear').addEventListener('click', () => { boxes.forEach(box => box.checked = false); update(); status.textContent = 'Selection cleared.'; });
document.getElementById('copy').addEventListener('click', async () => {
  const chosen = numbers();
  if (!chosen.length) { status.textContent = 'Tick a few favourites first.'; return; }
  selected.focus(); selected.select();
  let copied = false;
  try { await navigator.clipboard.writeText(chosen.join(', ')); copied = true; } catch {}
  if (!copied) { try { copied = document.execCommand('copy'); } catch {} }
  status.textContent = copied ? 'Favourite numbers copied.' : 'The numbers are selected. Press Ctrl+C to copy.';
});
document.getElementById('theme').addEventListener('click', () => {
  const dark = getComputedStyle(document.documentElement).getPropertyValue('--theme').trim() === 'dark';
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
});
update();
`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark light"><title>README.NFO — 40 header candidates</title>
<style>
:root{--theme:dark;--bg:#0b1017;--panel:#141c27;--text:#e8edf5;--muted:#98a8bc;--line:#344354;--accent:#9bea93;--input:#080d14;color-scheme:dark;scroll-behavior:smooth}
@media(prefers-color-scheme:light){:root{--theme:light;--bg:#edf0f5;--panel:#fff;--text:#1b283b;--muted:#536780;--line:#c5d0dc;--accent:#17653a;--input:#f6f8fa;color-scheme:light}}
:root[data-theme="light"]{--theme:light;--bg:#edf0f5;--panel:#fff;--text:#1b283b;--muted:#536780;--line:#c5d0dc;--accent:#17653a;--input:#f6f8fa;color-scheme:light}
:root[data-theme="dark"]{--theme:dark;--bg:#0b1017;--panel:#141c27;--text:#e8edf5;--muted:#98a8bc;--line:#344354;--accent:#9bea93;--input:#080d14;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent);text-underline-offset:3px}button,input{font:inherit}button{background:var(--panel);color:var(--text);border:1px solid var(--line);padding:9px 14px;border-radius:7px;cursor:pointer}button:hover{border-color:var(--accent)}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.wrap{max-width:1320px;margin:auto;padding:36px 26px}.intro{max-width:900px;margin-bottom:24px}.eyebrow{font:13px/1.5 monospace;letter-spacing:2px;color:var(--accent)}h1{font-size:clamp(30px,5vw,56px);line-height:1.08;letter-spacing:-2px;margin:10px 0 16px}.intro p{color:var(--muted);max-width:740px}.toplinks{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}.selection{position:sticky;top:0;z-index:2;background:var(--bg);border-block:1px solid var(--line);padding:14px 0;margin:26px 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap}.selection strong{font-size:14px;min-width:90px}.selection input{flex:1;min-width:180px;width:200px;padding:9px 12px;border:1px solid var(--line);border-radius:7px;background:var(--input);color:var(--text);font-family:monospace}.selection #status{width:100%;font-size:13px;color:var(--muted);min-height:0}.selection #status:empty{display:none}#copy{background:var(--accent);color:var(--bg);border-color:var(--accent);font-weight:600}.batches{display:flex;gap:10px;flex-wrap:wrap}.batches [aria-pressed="true"]{border-color:var(--accent);color:var(--accent)}.card[hidden]{display:none}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.card{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;transition:border-color .15s,box-shadow .15s}.card.chosen{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}.card-heading{padding:17px 18px;display:flex;gap:10px;align-items:flex-start;justify-content:space-between}.card-heading label{display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:600;line-height:1.4;cursor:pointer}.card-heading input{accent-color:var(--accent);width:18px;height:18px;margin:2px 0;flex-shrink:0}.number{font:700 19px/1.15 monospace;color:var(--accent)}.format{font:10px/1.4 monospace;color:var(--muted);white-space:nowrap;padding-top:4px}.art{background:#080d13}.art img{display:block;width:100%;height:auto}.text-art{color:#e8edf5;overflow:auto}.text-art pre{margin:0;padding:24px 20px;font:12px/1.5 ui-monospace,Consolas,monospace;tab-size:4;white-space:pre;min-width:fit-content}.text-art a{color:#95d5ff}.description{font-size:14px;color:var(--muted);margin:17px 18px}.card footer{display:flex;gap:16px;flex-wrap:wrap;padding:0 18px 19px;font-size:12px}.closing{color:var(--muted);font-size:13px;margin:34px 0 8px}.closing a{color:inherit}@media(max-width:900px){.grid{grid-template-columns:1fr}.wrap{padding:24px 18px}.card-heading{padding:15px}.selection{gap:8px}.selection button{padding:8px 10px;font-size:14px}.selection input{min-width:140px}.format{max-width:70px;white-space:normal;text-align:right}}@media(prefers-reduced-motion:reduce){:root{scroll-behavior:auto}.card{transition:none}}
</style></head><body><main class="wrap"><header class="intro"><div class="eyebrow">README.NFO / FIRST IMPRESSIONS</div><h1>Forty possible beginnings.</h1><p>Two random batches of twenty styles, each made into a header for this repository. New candidates are numbered 21–40. Tick around five favourites, then copy their numbers and send them back. The home README opens with 16 and features 04, 26, 36, 38, 12 and 25. You can still compare all forty and save your own favourites.</p><nav class="toplinks" aria-label="Gallery navigation"><a href="README.md">Markdown index</a><a href="page-1.md">Full headers 01–10</a><a href="page-2.md">Full headers 11–20</a><a href="page-3.md">New 21–30</a><a href="page-4.md">New 31–40</a><a href="draw.json">Draw one</a><a href="draw-2.json">Draw two</a></nav></header>
<nav class="batches" aria-label="Choose a batch"><button type="button" data-show-batch="all" aria-pressed="true">All 40</button><button type="button" data-show-batch="1" aria-pressed="false">First 20</button><button type="button" data-show-batch="2" aria-pressed="false">New 21–40</button></nav>
<section class="selection" aria-label="Your favourites"><strong id="count">0 selected</strong><input id="selected" aria-label="Selected candidate numbers" readonly placeholder="Tick favourites below"><button id="copy" type="button">Copy favourites</button><button id="clear" type="button">Clear</button><button id="theme" type="button">Light / dark</button><span id="status" role="status" aria-live="polite"></span></section>
<section class="grid" aria-label="Forty header candidates">${cards}</section>
<p class="closing">Two non-repeating draws saved on 5 October 2026 from 152 distinct catalogue styles. Selection stays in this browser when local storage is available. <a href="../../LICENSE">MIT licence</a> · <a href="../README.md">Other galleries</a> · <a href="../../README.md">Repository README</a>.</p></main><script>${script}</script></body></html>\n`;
fs.writeFileSync(path.join(DIR,'gallery.html'),html);
console.log('wrote README.NFO index, four full-header pages and interactive gallery');
