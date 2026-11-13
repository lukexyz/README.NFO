#!/usr/bin/env node
// Full-page screenshots of a concept's preview.html (run render.mjs first).
//   node tools/front-page/shoot.mjs <conceptDir> [--times=0,4000] [--modes=desktop-light,desktop-dark,mobile-dark]
//                                               [--scale=1] [--fold] [--reduced-motion]
// Writes <conceptDir>/shots/<mode>-t<ms>.png for each time after page load, and checks that every
// README image loaded, the README column width and whether the page scrolls sideways.
//   --modes           any of desktop-light, desktop-dark, mobile-light, mobile-dark
//   --scale=2         device pixel ratio (sharper, bigger files)
//   --fold            also save the first screen only (<mode>-fold-t<ms>.png): what a visitor sees before scrolling
//   --reduced-motion  emulate prefers-reduced-motion: reduce (files get a -reduced suffix)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const [target] = args.filter((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: node tools/front-page/shoot.mjs <conceptDir> [--times=0,4000] [--modes=...] [--scale=1] [--fold] [--reduced-motion]');
  process.exit(2);
}
const conceptDir = path.resolve(target);
const preview = path.join(conceptDir, 'preview.html');
if (!fs.existsSync(preview)) {
  console.error(`No preview.html in ${conceptDir}: run render.mjs on it first.`);
  process.exit(2);
}
const times = flag('times', '0,4000').split(',').map((t) => Number(t.trim())).filter((t) => Number.isFinite(t) && t >= 0).sort((a, b) => a - b);
const scale = Number(flag('scale', '1')) || 1;
const reduced = args.includes('--reduced-motion');
const fold = args.includes('--fold');
const MODES = {
  'desktop-light': { viewport: { width: 1280, height: 900 }, colorScheme: 'light', hash: 'light-desktop-shot' },
  'desktop-dark': { viewport: { width: 1280, height: 900 }, colorScheme: 'dark', hash: 'dark-desktop-shot' },
  'mobile-light': { viewport: { width: 375, height: 812 }, colorScheme: 'light', hash: 'light-mobile-shot', isMobile: true, hasTouch: true },
  'mobile-dark': { viewport: { width: 375, height: 812 }, colorScheme: 'dark', hash: 'dark-mobile-shot', isMobile: true, hasTouch: true },
};
const modes = flag('modes', 'desktop-light,desktop-dark,mobile-dark').split(',').map((m) => m.trim()).filter(Boolean);
for (const m of modes) if (!MODES[m]) { console.error(`Unknown mode "${m}". Use: ${Object.keys(MODES).join(', ')}`); process.exit(2); }

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. From the repository root run: npm install');
  process.exit(1);
}

function cachedBrowsers() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH
    || (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ms-playwright')
      : process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright') : path.join(os.homedir(), '.cache', 'ms-playwright'));
  let dirs = [];
  try { dirs = fs.readdirSync(base).filter((d) => /^chromium(_headless_shell)?-\d+$/.test(d)); } catch { return { base, exes: [] }; }
  dirs.sort((a, b) => Number(b.split('-').pop()) - Number(a.split('-').pop()) || (a.includes('headless') ? 1 : -1));
  const rel = ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-headless-shell-win64/chrome-headless-shell.exe',
    'chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-headless-shell-linux64/chrome-headless-shell',
    'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    'chrome-headless-shell-mac-arm64/chrome-headless-shell'];
  return { base, exes: dirs.flatMap((d) => rel.map((r) => path.join(base, d, r))).filter((f) => fs.existsSync(f)) };
}

async function launch() {
  // Playwright's reducedMotion emulation does not reach SVG documents inside <img>; Chromium's launch flag does.
  const args = reduced ? ['--force-prefers-reduced-motion'] : [];
  const tried = [];
  try { return { browser: await chromium.launch({ args }), how: 'Playwright Chromium' }; } catch (err) { tried.push(`bundled: ${err.message.split('\n')[0]}`); }
  const { base, exes } = cachedBrowsers();
  for (const exe of exes) {
    try { return { browser: await chromium.launch({ executablePath: exe, args }), how: `cached ${path.relative(base, exe)}` }; } catch (err) { tried.push(`${exe}: ${err.message.split('\n')[0]}`); }
  }
  for (const channel of ['chrome', 'msedge']) {
    try { return { browser: await chromium.launch({ channel, args }), how: `installed ${channel}` }; } catch { tried.push(`${channel}: not available`); }
  }
  console.error('Chromium is missing: no bundled, cached or installed Chrome/Edge could be launched.');
  for (const t of tried) console.error(`  tried ${t}`);
  console.error('Install it once with:  npx playwright install chromium (from the repository root)');
  process.exit(1);
}

const { browser, how } = await launch();
const shotsDir = path.join(conceptDir, 'shots');
fs.mkdirSync(shotsDir, { recursive: true });
const url = pathToFileURL(preview).href;
const files = [];
const notes = [];

await Promise.all(modes.map(async (name) => {
  const m = MODES[name];
  const ctx = await browser.newContext({
    viewport: m.viewport, colorScheme: m.colorScheme, isMobile: !!m.isMobile, hasTouch: !!m.hasTouch,
    deviceScaleFactor: scale, reducedMotion: reduced ? 'reduce' : 'no-preference', locale: 'en-GB',
  });
  const page = await ctx.newPage();
  const failed = [];
  page.on('requestfailed', (r) => failed.push(`${r.url().slice(0, 140)} (${r.failure()?.errorText})`));
  try {
    await page.goto(`${url}#${m.hash}`, { waitUntil: 'load', timeout: 60000 });
  } catch (err) {
    notes.push(`${name}: page load did not finish (${err.message.split('\n')[0]}); shooting anyway`);
  }
  const t0 = Date.now();
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  const info = await page.evaluate(() => {
    const art = document.querySelector('article.markdown-body');
    const imgs = [...document.querySelectorAll('article.markdown-body img')].map((im) => ({
      src: im.getAttribute('src'), current: im.currentSrc, ok: im.complete && im.naturalWidth > 0, shown: Math.round(im.getBoundingClientRect().width),
    }));
    const styled = getComputedStyle(document.querySelector('.markdown-body h1, .markdown-body h2, .markdown-body p, .markdown-body pre') || document.body).marginBottom !== '0px';
    return { width: art ? Math.round(art.getBoundingClientRect().width) : 0, imgs, styled,
      overflow: document.documentElement.scrollWidth - innerWidth, height: document.documentElement.scrollHeight };
  });
  const broken = info.imgs.filter((i) => !i.ok);
  notes.push(`${name}: README column ${info.width}px, page ${info.height}px tall, ${info.imgs.length - broken.length}/${info.imgs.length} images loaded`
    + `${info.styled ? '' : ', GitHub markdown CSS NOT loaded'}${info.overflow > 0 ? `, page scrolls sideways by ${info.overflow}px` : ''}`);
  for (const b of broken) notes.push(`${name}: BROKEN IMAGE ${b.src}`);
  for (const f of failed.filter((f) => !/avatars\.githubusercontent|fonts\.g/.test(f)).slice(0, 8)) notes.push(`${name}: request failed ${f}`);
  const suffix = reduced ? '-reduced' : '';
  for (const t of times) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const file = path.join(shotsDir, `${name}${suffix}-t${t}.png`);
    await page.screenshot({ path: file, fullPage: true });
    files.push(file);
    if (fold) {
      const foldFile = path.join(shotsDir, `${name}${suffix}-fold-t${t}.png`);
      await page.screenshot({ path: foldFile });
      files.push(foldFile);
    }
  }
  await ctx.close();
}));
await browser.close();

console.log(`browser  ${how}`);
for (const n of notes.sort()) console.log(`check    ${n}`);
console.log('shots');
for (const f of files.sort()) console.log(`  ${f}`);
