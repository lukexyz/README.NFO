import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { parseRepository, parseArguments, normaliseProject, fetchProject } from './generator/project.mjs';
import { designs, selectDesigns, renderDesign } from './generator/designs.mjs';
import { createBundle, defaultOutput, writeBundle } from './generator/output.mjs';
import { localReferences, localTarget, svgPolicyIssues } from './lib/checks.mjs';

const project = normaliseProject({ full_name: 'someone/sample', name: 'SAMPLE', description: 'A useful project with a real description.',
  languages: ['JavaScript', 'Python'], topics: ['retro', 'tools'], sections: ['Install', 'Examples'], stars: 123, forks: 7, license: 'MIT' });
const response = (body, status = 200, text = false) => new Response(text ? body : JSON.stringify(body), { status });
const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'readme-nfo-generator-'));
function removeTemporary(directory) {
  const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
  assert.ok(relative.startsWith('readme-nfo-generator-') && !path.isAbsolute(relative) && !relative.includes(path.sep));
  fs.rmSync(directory, { recursive: true, force: true });
}

test('repository parsing supports URL, shorthand and .git while excluding non-repository URLs', () => {
  for (const value of ['someone/sample', 'github.com/someone/sample', 'https://github.com/someone/sample/', 'https://github.com/someone/sample.git']) {
    assert.equal(parseRepository(value).fullName, 'someone/sample');
  }
  for (const value of ['https://other.test/someone/sample', 'http://github.com/someone/sample', 'https://github.com/someone/sample/tree/main', 'https://github.com/someone/sample?q=1', 'https://user:secret@github.com/someone/sample', 'https://github.com:4430/someone/sample', '../sample', 'someone/.git']) {
    assert.throws(() => parseRepository(value));
  }
});

test('CLI shorthand and explicit flags agree; invalid and ambiguous inputs fail', () => {
  assert.deepEqual(parseArguments(['github.com/someone/sample', '-10']), parseArguments(['--repo=github.com/someone/sample', '--count', '10']));
  assert.equal(parseArguments(['--project', 'project.json']).count, 10);
  for (const args of [[], ['someone/sample', '-0'], ['someone/sample', '-13'], ['someone/sample', '--count', '2.5'], ['someone/sample', '--count'], ['--repo', 'someone/sample', '--project', 'x.json'], ['someone/sample', '--force'], ['someone/sample', '-10', '--count', '6']]) assert.throws(() => parseArguments(args));
});

test('fetch uses real metadata, README description fallback and byte-ranked languages', async () => {
  const calls = [];
  const result = await fetchProject(parseRepository('someone/sample'), { token: 'test-token', fetcher: async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/languages')) return response({ Python: 2, JavaScript: 9 });
    if (url.endsWith('/readme')) return response('# Sample\n\nThis is the actual project description.\n\n## Installation\n## [Usage](#usage)\n', 200, true);
    return response({ full_name: 'someone/sample', name: 'Sample', description: null, stargazers_count: 42, forks_count: 3, license: { spdx_id: 'MIT' }, topics: ['sample'] });
  } });
  assert.equal(result.description, 'This is the actual project description.');
  assert.deepEqual(result.languages, ['JavaScript', 'Python']);
  assert.deepEqual(result.sections, ['Installation', 'Usage']);
  assert.equal(result.stars, 42);
  assert.ok(calls.every(call => call.options.headers.Authorization === 'Bearer test-token'));
  assert.equal(calls.length, 3);
});

test('missing optional GitHub data keeps useful metadata; access failures explain the remedy', async () => {
  const warnings = [];
  const result = await fetchProject(parseRepository('someone/sample'), { token: undefined, warn: message => warnings.push(message), fetcher: async url => {
    if (url.endsWith('/languages')) return response({}, 403);
    if (url.endsWith('/readme')) return response('', 404, true);
    return response({ full_name: 'someone/sample', language: 'Rust' });
  } });
  assert.deepEqual(result.languages, ['Rust']);
  assert.equal(result.stars, null);
  assert.equal(result.license, 'UNSPECIFIED');
  assert.equal(warnings.length, 1);
  for (const [status, pattern] of [[404, /not found or private/], [403, /rate limit/], [429, /rate limit/], [500, /HTTP 500/]]) {
    await assert.rejects(fetchProject(parseRepository('someone/sample'), { fetcher: async () => response({}, status) }), pattern);
  }
});

test('selection is reproducible and contains different compositions', () => {
  const selected = selectDesigns(10, 'favourites');
  assert.equal(new Set(selected.map(design => design.id)).size, 10);
  assert.deepEqual(selected.map(design => design.id), selectDesigns(10, 'favourites').map(design => design.id));
  assert.notDeepEqual(selected.map(design => design.id), selectDesigns(10, 'another').map(design => design.id));
  assert.throws(() => selectDesigns(13, 'bad'));
});

test('bundle is portable, records the data and seed, and refuses to overwrite output', () => {
  const directory = temporary();
  try {
    const bundle = createBundle(project, { count: 10, seed: 'portable' });
    const target = writeBundle(bundle, path.join(directory, 'headers'));
    assert.equal(bundle.files.size, 25);
    const manifest = JSON.parse(fs.readFileSync(path.join(target, 'manifest.json'), 'utf8'));
    assert.equal(manifest.seed, 'portable');
    assert.equal(manifest.options.length, 10);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(target, 'project.json'), 'utf8')), project);
    for (const [file, contents] of bundle.files) if (file.endsWith('.md')) {
      for (const ref of localReferences(contents)) assert.ok(fs.existsSync(localTarget(target, file, ref)), `${file}: ${ref}`);
    }
    assert.throws(() => writeBundle(bundle, target), /already exists/);
    assert.equal(fs.readFileSync(path.join(target, '01-' + bundle.picks[0].id + '.md'), 'utf8'), bundle.picks[0].markdown);
    fs.mkdirSync(path.join(directory, 'readme-headers', 'someone-sample'), { recursive: true });
    assert.equal(defaultOutput(project, directory), path.join(directory, 'readme-headers', 'someone-sample-2'));
  } finally { removeTemporary(directory); }
});

test('executable generates an offline batch and reports errors with a nonzero exit', () => {
  const directory = temporary();
  try {
    const cli = fileURLToPath(new URL('./generate.mjs', import.meta.url));
    const fixture = path.join(directory, 'project.json');
    fs.writeFileSync(fixture, JSON.stringify(project));
    const args = ['--project', fixture, '-10', '--seed', 'cli', '--out', path.join(directory, 'out')];
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: directory });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Created 10 headers/);
    assert.ok(fs.existsSync(path.join(directory, 'out', 'index.html')));
    const rerun = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: directory });
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /already exists/);
    const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8', cwd: directory });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /1–12/);
  } finally { removeTemporary(directory); }
});

test('every design is a valid Chromium image with safe SVG content and reduced-motion support', { timeout: 60000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const hostile = normaliseProject({ ...project, name: '项目 & <script> "test"', description: '<img src=x onerror=run()> & [link](javascript:alert(1))' });
    const longName = normaliseProject({ ...project, name: 'A'.repeat(100), description: 'Long '.repeat(100) });
    for (const fixture of [project, hostile, longName]) for (const design of designs) {
      const image = renderDesign(design, fixture);
      assert.deepEqual(svgPolicyIssues(image), [], design.id);
      const result = await page.evaluate(async source => {
        const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
        const image = new Image(); image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(source)))}`;
        let decoded = true; try { await image.decode(); } catch { decoded = false; }
        document.body.replaceChildren(document.importNode(parsed.documentElement, true));
        return { parseError: !!parsed.querySelector('parsererror'), decoded, width: image.naturalWidth,
          activeAnimations: [...document.querySelectorAll('svg *')].filter(node => getComputedStyle(node).animationName !== 'none').length };
      }, image);
      assert.equal(result.parseError, false, `${design.id} XML`);
      assert.equal(result.decoded, true, `${design.id} decoding`);
      assert.ok(result.width > 0);
      assert.equal(result.activeAnimations, 0, `${design.id} reduced motion`);
    }
    const bundle = createBundle(hostile, { seed: 'escaping' });
    await page.setContent(bundle.files.get('index.html'));
    assert.equal(await page.locator('article').count(), 10);
    assert.equal(await page.locator('img[onerror]').count(), 0);
    assert.equal(await page.locator('header h1').textContent(), `${hostile.name} — 10 headers`);
    assert.equal(await page.locator('textarea').first().inputValue(), bundle.picks[0].markdown);
  } finally { await browser.close(); }
});
