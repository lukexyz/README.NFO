#!/usr/bin/env node
// Concept 02 BOOT INTRO: assets/social.png (1280x640), GitHub's social
// preview size. It is the reduced-motion still of hero-dark.svg (logo, both
// engines, the scroller parked), rendered by Chromium.
//   node docs/front-page/boot-intro/src/social.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { ROOT, DIR } from './picks.mjs';

const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ args: ['--force-prefers-reduced-motion'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, reducedMotion: 'reduce' });
const host = path.join(DIR, 'assets', '_social.html');
const svg = pathToFileURL(path.join(DIR, 'assets', 'hero-dark.svg')).href;
fs.writeFileSync(host, `<body style="margin:0;background:#0d1117"><img src="${svg}" width="1280" height="640" style="display:block"></body>`);
await page.goto(pathToFileURL(host).href);
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(DIR, 'assets', 'social.png') });
fs.rmSync(host);
await browser.close();
console.log('social.png', (fs.statSync(path.join(DIR, 'assets', 'social.png')).size / 1024).toFixed(1), 'KB');
