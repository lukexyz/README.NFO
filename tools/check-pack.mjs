#!/usr/bin/env node
// Asserts what `npm pack` ships: the CLI, its modules, the catalogue and the samples bundle,
// and none of the example sets (samples reach users only through styles/samples.json).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Under npm run, npm_execpath is npm's own CLI script, so no shell is needed on Windows.
const args = ['pack', '--dry-run', '--json', '--ignore-scripts'];
const result = process.env.npm_execpath?.endsWith('.js')
  ? spawnSync(process.execPath, [process.env.npm_execpath, ...args], { cwd: root, encoding: 'utf8' })
  : spawnSync('npm', args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
if (result.status !== 0) { console.error(result.stderr); process.exit(1); }
const [pack] = JSON.parse(result.stdout.slice(result.stdout.indexOf('[')));
const files = new Set(pack.files.map(file => file.path.replace(/\\/g, '/')));
const required = ['package.json', 'LICENSE', 'tools/generate.mjs', 'tools/generator/agents.mjs', 'tools/generator/install.mjs', 'tools/generator/batch.mjs', 'tools/lib/checks.mjs', 'styles/styles.json', 'styles/samples.json'];
const missing = required.filter(file => !files.has(file));
const stray = [...files].filter(file => file.startsWith('examples/') || file.startsWith('docs/') || file.startsWith('comparisons/'));
if (pack.name !== 'readme-nfo' || missing.length || stray.length) {
  console.error(`npm pack check failed for ${pack.name}@${pack.version}.${missing.length ? `\nMissing: ${missing.join(', ')}` : ''}${stray.length ? `\nUnexpected: ${stray.slice(0, 10).join(', ')}` : ''}`);
  process.exit(1);
}
console.log(`npm pack ships ${pack.name}@${pack.version}: ${files.size} files, ${Math.round(pack.size / 1024)} KB, including styles/samples.json.`);
