// Social preview card for concept 05: the hero's reduced-motion still centred on a 1280x640 black card.
//   node social.mjs <hero.svg> <out.png>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json')); const { chromium } = require('playwright');
const [svg, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--force-prefers-reduced-motion'] });
const p = await b.newPage({ viewport: { width: 1280, height: 640 } });
const hp = out + '.html';
fs.writeFileSync(hp, `<body style="margin:0;background:#000;width:1280px;height:640px;display:flex;align-items:center;justify-content:center"><img src="${pathToFileURL(svg).href}" style="height:600px">`);
await p.goto(pathToFileURL(hp).href); await p.waitForTimeout(300);
await p.screenshot({ path: out }); fs.rmSync(hp); await b.close();
console.log(out, (fs.statSync(out).size / 1024).toFixed(0), 'KB');
