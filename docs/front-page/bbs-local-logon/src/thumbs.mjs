// File-area tiles for concept 05: one 296x166 JPEG per tile (shown at 148x83, so 2x on retina).
// The reduced-motion still of each header (every animated SVG in the repo has one), letterboxed on
// black inside a 4 px ANSI-blue frame (2 px as shown), with the file number burned in and an amber
// play mark for animated sources. Text-only headers render their first text block like an NFO viewer.
// Deterministic for a given Chromium build.
//   node thumbs.mjs <curation.json> <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const [curationFile, outDir] = process.argv.slice(2);
const curation = JSON.parse(fs.readFileSync(curationFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const W = 296, H = 166;
const { inventory } = await import('./inventory.mjs');
const { headers } = await inventory();

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function source(md) {
  const text = fs.readFileSync(path.join(ROOT, md), 'utf8');
  const img = text.match(/<img[^>]*src="([^"]+\.svg)"/i);
  const fence = text.match(/^```[a-z]*\n([\s\S]*?)\n```/m);
  const pre = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  const at = (m) => (m ? m.index : Infinity);
  if (img && at(img) < Math.min(at(fence), at(pre))) return { kind: 'svg', file: path.resolve(path.dirname(path.join(ROOT, md)), img[1]) };
  const body = at(pre) < at(fence) ? decode(pre[1].replace(/<[^>]+>/g, '')) : fence ? fence[1] : '(text)';
  // logo rows only: a full 40-line NFO is unreadable at tile size
  return { kind: 'text', body: body.split('\n').slice(0, 16).join('\n') };
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shell = (inner, n, anim) => `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#000}
.t{position:relative;width:${W}px;height:${H}px;box-sizing:border-box;border:4px solid #0000aa;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center}
.t img{max-width:100%;max-height:100%;display:block}
.t pre{margin:0;font:12px/1.18 Consolas,"Courier New",monospace;color:#c8c8c8;white-space:pre;transform-origin:center center}
.b{position:absolute;left:0;top:0;background:#0000aa;color:#ffff55;font:bold 22px/1 Consolas,monospace;padding:2px 7px 4px 4px}
.a{position:absolute;right:0;bottom:0;background:#000;color:#ffaa00;font:bold 20px/1 Consolas,monospace;padding:4px 5px 2px 7px;border-top-left-radius:0}
</style><div class="t" id="t">${inner}<div class="b">${n}</div>${anim ? '<div class="a">►</div>' : ''}</div>`;

const browser = await chromium.launch({ args: ['--force-prefers-reduced-motion'] }); // emulateMedia does not reach SVG inside <img>
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
const report = [];
for (const area of curation.areas) {
  for (const [i, key] of area.tiles.entries()) {
    const md = `examples/${key}.md`;
    const h = headers.find((x) => x.md === md);
    if (!h || !h.tileOk || h.family !== area.family) throw new Error(`tile not allowed: ${md}`);
    const n = String(i + 1).padStart(2, '0');
    const src = source(md);
    const inner = src.kind === 'svg' ? `<img src="${pathToFileURL(src.file).href}">` : `<pre id="p">${esc(src.body.replace(/\s+$/, ''))}</pre>`;
    const tmp = path.join(outDir, '_tile.html');
    fs.writeFileSync(tmp, shell(inner, n, h.kind === 'animated'));
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    if (src.kind === 'text') {
      await page.evaluate(([w, h]) => { const p = document.getElementById('p'); const s = Math.min((w - 10) / p.scrollWidth, (h - 8) / p.scrollHeight, 1); p.style.transform = `scale(${s})`; }, [W, H]);
    }
    await page.waitForTimeout(250);
    const name = `${area.family}-${n}.jpg`;
    await page.locator('#t').screenshot({ path: path.join(outDir, name), type: 'jpeg', quality: 82 });
    report.push({ area: area.family, n, md, kind: src.kind, kb: +(fs.statSync(path.join(outDir, name)).size / 1024).toFixed(1) });
  }
}
fs.rmSync(path.join(outDir, '_tile.html'), { force: true });
await browser.close();
const total = report.reduce((a, r) => a + r.kb, 0);
console.log(`${report.length} thumbs, ${total.toFixed(0)} KB total, max ${Math.max(...report.map((r) => r.kb))} KB, text ${report.filter((r) => r.kind === 'text').length}`);
fs.writeFileSync(path.join(outDir, 'thumbs.json'), JSON.stringify(report, null, 1));
