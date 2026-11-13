#!/usr/bin/env node
// Builds styles/samples.json: one MIT technique sample per catalogue style, taken only from
// example sets committed to git (read from HEAD), never from untracked or uncommitted work.
//   node tools/build-samples.mjs          write the bundle
//   node tools/build-samples.mjs --check  fail if the bundle is stale
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SAMPLE_LIMIT = 9000;
const OUTPUT = path.join(ROOT, 'styles', 'samples.json');

// File list and bytes both come from a git revision, so working-tree edits never leak in.
export function committedFiles(root = ROOT, revision = 'HEAD') {
  const list = spawnSync('git', ['ls-tree', '-r', '-z', '--name-only', revision, '--', 'examples'], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (list.status !== 0) throw new Error(`git ls-tree failed: ${list.stderr || list.error?.message}`);
  const names = list.stdout.split('\0').filter(name => /\.(?:md|mjs)$/.test(name));
  const batch = spawnSync('git', ['cat-file', '--batch'], { cwd: root, input: names.map(name => `${revision}:${name}`).join('\n') + '\n', windowsHide: true, maxBuffer: 512 * 1024 * 1024 });
  if (batch.status !== 0) throw new Error(`git cat-file failed: ${batch.stderr}`);
  const files = new Map(), out = batch.stdout;
  let offset = 0;
  for (const name of names) {
    const end = out.indexOf(10, offset);
    const header = out.subarray(offset, end).toString();
    const size = Number(header.split(' ')[2]);
    if (!Number.isInteger(size)) throw new Error(`Unexpected git cat-file output for ${name}: ${header}`);
    files.set(name, out.subarray(end + 1, end + 1 + size).toString('utf8'));
    offset = end + 1 + size + 1;
  }
  return files;
}

export function buildSamples(root = ROOT, files = committedFiles(root)) {
  const tracked = new Set(files.keys());
  const styles = JSON.parse(fs.readFileSync(path.join(root, 'styles', 'styles.json'), 'utf8'));
  const ids = new Set(styles.families.flatMap(family => family.styles.map(style => style.id)));
  // readme-nfo first (it was drawn for this project's own headers), then sets alphabetically.
  const sets = [...new Set([...tracked].map(file => file.split('/')[1]).filter(Boolean))]
    .sort((a, b) => a === 'readme-nfo' ? -1 : b === 'readme-nfo' ? 1 : a.localeCompare(b));
  const samples = {};
  const styleRefs = text => [...text.matchAll(/#([a-z][a-z0-9]*-\d{2})\)/g)].map(match => match[1]).filter(id => ids.has(id));
  const add = (id, source) => {
    if (samples[id] || !tracked.has(source)) return;
    samples[id] = { file: source, source: files.get(source).replace(/\r\n/g, '\n').slice(0, SAMPLE_LIMIT) };
  };
  for (const set of sets) {
    const markdownFiles = [...tracked].filter(file => file.startsWith(`examples/${set}/`) && /^[^/]+\.md$/.test(file.slice(`examples/${set}/`.length))).sort();
    // 1. A numbered header page that links its own style.
    for (const page of markdownFiles.filter(file => /\/\d[^/]*\.md$/.test(file))) {
      const source = page.replace(/\/([^/]+)\.md$/, '/src/$1.mjs');
      for (const id of styleRefs(files.get(page))) add(id, source);
    }
    // 2. Index tables (README.md, page-N.md): one header link and its style link on the same row.
    for (const index of markdownFiles) {
      for (const line of files.get(index).split(/\r?\n/)) {
        const headers = [...new Set([...line.matchAll(/\]\((\d[^)/#]*)\.md\)/g)].map(match => match[1]))];
        if (headers.length !== 1) continue;
        for (const id of styleRefs(line)) add(id, `examples/${set}/src/${headers[0]}.mjs`);
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(samples).sort(([a], [b]) => a.localeCompare(b)));
  return { generator: 'tools/build-samples.mjs', note: 'MIT technique samples from committed README.NFO example sets.', count: Object.keys(sorted).length, samples: sorted };
}

export const serialise = bundle => JSON.stringify(bundle) + '\n';

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const contents = serialise(buildSamples());
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
    if (current !== contents) { console.error('styles/samples.json is stale. Run: node tools/build-samples.mjs'); process.exit(1); }
    console.log('styles/samples.json is up to date.');
  } else {
    fs.writeFileSync(OUTPUT, contents);
    console.log(`Wrote styles/samples.json (${JSON.parse(contents).count} samples, ${Math.round(contents.length / 1024)} KB).`);
  }
}
