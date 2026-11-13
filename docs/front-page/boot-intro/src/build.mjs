#!/usr/bin/env node
// Rebuild every asset for concept 02 BOOT INTRO, then README.md.
//   node docs/front-page/boot-intro/src/build.mjs [--no-thumbs]
// Thumbnails and the social card need Playwright's Chromium (from the repo's
// node_modules); everything else is plain Node.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const steps = ['hero.mjs', 'bars.mjs', 'buttons.mjs', 'flow.mjs', 'social.mjs', 'thumbs.mjs', 'readme.mjs']
  .filter((s) => !(process.argv.includes('--no-thumbs') && s === 'thumbs.mjs'));
for (const s of steps) {
  console.log(`> ${s}`);
  execFileSync(process.execPath, [path.join(here, s)], { stdio: 'inherit' });
}
