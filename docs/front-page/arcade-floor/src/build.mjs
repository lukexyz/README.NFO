#!/usr/bin/env node
// Rebuilds everything for concept 06 (ARCADE FLOOR), in order:
//   picks gate -> floor cards -> hero + social -> continue loop -> nav buttons -> README.md
//   node docs/front-page/arcade-floor/src/build.mjs [--skip-cards]
// Then render and shoot with tools/front-page/render.mjs and shoot.mjs.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const steps = ['picks.mjs', 'cards.mjs', 'hero.mjs', 'continue.mjs', 'buttons.mjs', 'readme.mjs']
  .filter((s) => !(s === 'cards.mjs' && process.argv.includes('--skip-cards')));
for (const s of steps) {
  console.log(`\n== ${s}`);
  execFileSync(process.execPath, [path.join(here, s)], { stdio: 'inherit' });
}
