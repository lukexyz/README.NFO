// Read-only repository validation. Rebuilds documentation in an isolated temporary directory.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { checkCatalogue, localReferences, localTarget, svgPolicyIssues } from './lib/checks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules', '.git', '.preview']);
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const normalise = (text) => text.replace(/\r\n?/g, '\n');

function walk(directory, base = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name) || (entry.name.startsWith('.') && entry.name !== '.github')) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(absolute, base) : [path.relative(base, absolute).split(path.sep).join('/')];
  }).sort();
}

function checkReferences(file, imagesOnly) {
  for (const ref of localReferences(read(file), imagesOnly)) {
    try {
      if (!fs.existsSync(localTarget(ROOT, file, ref))) fail(file, `missing ${imagesOnly ? 'image' : 'link'}: ${ref}`);
    } catch (error) { fail(file, error.message); }
  }
}

function runGenerator(root, file) {
  const result = spawnSync(process.execPath, [file], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${file}: ${result.error?.message || result.stderr || result.stdout}`);
}

function checkGenerated(sets) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-nfo-validate-'));
  const copy = (file) => {
    const target = path.join(temporary, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), target);
  };
  try {
    const generators = ['tools/build-styles.mjs', 'tools/build-shortlist.mjs'];
    copy('styles/styles.json');
    copy('examples/shortlist.json');
    for (const set of sets) {
      const generator = `examples/${set.name}/src/build-gallery.mjs`;
      generators.push(generator);
      for (const header of set.headers) copy(`examples/${set.name}/${header}`);
    }
    // The shortlist builder checks that each of its previews exists.
    for (const pick of JSON.parse(read('examples/shortlist.json')).animated) {
      copy(`examples/${pick.set}/assets/${pick.slug}.svg`);
    }
    for (const generator of generators) copy(generator);
    // Generate the set galleries before the shortlist, then compare every generated Markdown file.
    for (const generator of [generators[0], ...generators.slice(2), generators[1]]) runGenerator(temporary, generator);
    const outputs = walk(temporary).filter((file) => file.endsWith('.md'));
    let generated = 0;
    for (const file of outputs) {
      if (/examples\/[^/]+\/\d[^/]*\.md$/.test(file)) continue; // copied inputs, not generated pages
      generated++;
      if (!fs.existsSync(path.join(ROOT, file))) fail(file, 'generated page is missing; run npm run styles and npm run gallery');
      else if (normalise(read(file)) !== normalise(fs.readFileSync(path.join(temporary, file), 'utf8'))) {
        fail(file, 'generated page is stale; run npm run styles and npm run gallery');
      }
    }
    // Catch pages left behind when a gallery shrinks or a catalogue family is removed.
    const expected = new Set(outputs);
    const oldPages = [...fs.readdirSync(path.join(ROOT, 'styles'))
      .filter((file) => file.endsWith('.md') && file !== 'README.md' && file !== 'INDEX.md')
      .map((file) => `styles/${file}`),
      ...sets.flatMap((set) => fs.readdirSync(path.join(ROOT, 'examples', set.name))
        .filter((file) => /^page-\d+\.md$/.test(file)).map((file) => `examples/${set.name}/${file}`))];
    for (const file of oldPages) if (!expected.has(file)) fail(file, 'obsolete generated page');
    console.log(`Generated pages: ${generated} compared with a fresh temporary build`);
  } catch (error) { fail('Generated pages', error.message); }
  finally {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(temporary));
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Unsafe temporary cleanup path');
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

async function checkSvgImages(files) {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.route('**/*', (route) => route.abort());
    for (let offset = 0; offset < files.length; offset += 30) {
      const sources = files.slice(offset, offset + 30).map((file) => ({ file, source: read(file) }));
      for (const { file, source } of sources) for (const issue of svgPolicyIssues(source)) fail(file, issue);
      const results = await page.evaluate(async (items) => Promise.all(items.map(async ({ file, source }) => {
        const xml = new DOMParser().parseFromString(source, 'image/svg+xml');
        if (xml.querySelector('parsererror') || xml.documentElement.localName !== 'svg'
          || xml.documentElement.namespaceURI !== 'http://www.w3.org/2000/svg') {
          return { file, error: 'invalid SVG XML' };
        }
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const image = new Image();
        let timer;
        try {
          image.src = url;
          await Promise.race([image.decode(), new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('image load timed out')), 5000);
          })]);
          if (!image.naturalWidth || !image.naturalHeight) return { file, error: 'SVG has no intrinsic image dimensions' };
          return { file };
        } catch (error) { return { file, error: `failed to load as an image: ${error.message}` }; }
        finally { clearTimeout(timer); URL.revokeObjectURL(url); }
      })), sources);
      for (const result of results) if (result.error) fail(result.file, result.error);
    }
    console.log(`SVGs: ${files.length} parsed and loaded as Chromium images`);
  } catch (error) { fail('Chromium', `${error.message}\nInstall the browser with: npx playwright install chromium`); }
  finally { if (browser) await browser.close(); }
}

async function main() {
  const files = walk(ROOT);
  const scripts = files.filter((file) => file.endsWith('.mjs'));
  for (const file of scripts) {
    const result = spawnSync(process.execPath, ['--check', path.join(ROOT, file)], { encoding: 'utf8' });
    if (result.status !== 0) fail(file, result.error?.message || result.stderr.trim());
  }
  console.log(`JavaScript: ${scripts.length} syntax checks`);

  const catalogue = JSON.parse(read('styles/styles.json'));
  const checked = checkCatalogue(catalogue);
  for (const error of checked.errors) fail('styles/styles.json', error);
  const coverage = new Set();
  const sets = fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(ROOT, 'examples', entry.name, 'src/build-gallery.mjs')))
    .map((entry) => ({ name: entry.name, headers: fs.readdirSync(path.join(ROOT, 'examples', entry.name))
      .filter((file) => /^\d.*\.md$/.test(file)).sort() }));
  if (!sets.length) fail('examples', 'no project galleries found');
  for (const set of sets) {
    const index = `examples/${set.name}/README.md`;
    const markdown = read(index);
    const indexed = [...markdown.matchAll(/^\|\s*\d+\s*\|\s*\[[^\]]+\]\(([^)]+\.md)\)/gm)].map((match) => match[1]);
    if (new Set(indexed).size !== indexed.length) fail(index, 'a header appears more than once in the index');
    for (const header of set.headers) {
      if (!indexed.includes(header)) fail(index, `header not indexed: ${header}`);
      if (!fs.existsSync(path.join(ROOT, 'examples', set.name, 'src', header.replace(/\.md$/, '.mjs')))) {
        fail(header, 'matching source generator is missing');
      }
    }
    for (const header of indexed) if (!set.headers.includes(header)) fail(index, `indexed header is missing: ${header}`);
    for (const match of markdown.matchAll(/\[([a-z0-9]+-\d{2})\]\(\.\.\/\.\.\/styles\/([a-z0-9]+)\.md#([a-z0-9]+-\d{2})\)/g)) {
      const [, id, family, anchor] = match;
      if (!checked.byId.has(id) || id !== anchor || family !== id.split('-')[0]) fail(index, `invalid catalogue link: ${match[0]}`);
      else coverage.add(id);
    }
  }
  for (const style of checked.distinct) if (!coverage.has(style.id)) fail('Catalogue coverage', `no header for ${style.id}`);
  console.log(`Galleries: ${sets.reduce((total, set) => total + set.headers.length, 0)} headers; ${coverage.size}/${checked.distinct.length} distinct styles covered`);

  const selection = JSON.parse(read('examples/shortlist.json'));
  const picks = new Set();
  for (const kind of ['animated', 'text']) {
    if (!Array.isArray(selection[kind])) { fail('Shortlist', `missing ${kind} selection`); continue; }
    for (const pick of selection[kind]) {
      if (!pick || typeof pick.set !== 'string' || typeof pick.slug !== 'string'
        || !/^[a-z0-9-]+$/.test(pick.set) || !/^\d{2,3}-[a-z0-9._-]+$/.test(pick.slug)
        || typeof pick.name !== 'string' || typeof pick.why !== 'string') {
        fail('Shortlist', 'invalid selection entry'); continue;
      }
      const id = `${pick.set}/${pick.slug}`;
      if (picks.has(id)) fail('Shortlist', `duplicate pick: ${id}`);
      picks.add(id);
      if (!sets.some((set) => set.name === pick.set && set.headers.includes(`${pick.slug}.md`))) fail('Shortlist', `unknown header: ${id}`);
      if (pick.style !== null && !checked.byId.has(pick.style)) fail('Shortlist', `unknown style: ${pick.style}`);
      if (kind === 'animated' && !fs.existsSync(path.join(ROOT, 'examples', pick.set, 'assets', `${pick.slug}.svg`))) fail('Shortlist', `missing preview: ${id}`);
      if (kind === 'text' && localReferences(read(`examples/${id}.md`), true).length) fail('Shortlist', `text-only pick contains an image: ${id}`);
    }
  }

  const markdown = files.filter((file) => file.endsWith('.md'));
  for (const file of markdown) checkReferences(file, true);
  // The examples contain links intended for the target projects. Check our navigation separately.
  for (const file of ['README.md', 'examples/README.md', 'examples/START-HERE.md',
    ...files.filter((file) => /^styles\/[^/]+\.md$/.test(file))]) checkReferences(file, false);
  console.log(`Markdown: ${markdown.length} files checked for local images and repository navigation`);

  // Invalid source data should fail cleanly before generators try to consume it.
  if (!errors.length) checkGenerated(sets);
  await checkSvgImages(files.filter((file) => file.endsWith('.svg')));
  if (errors.length) {
    console.error(`\nValidation failed (${errors.length} issues):\n${errors.map((error) => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else console.log('\nValidation passed. Working files were not modified.');
}

main().catch((error) => { console.error(`Validation failed: ${error.message}`); process.exitCode = 1; });
