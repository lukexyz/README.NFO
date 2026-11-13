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
import { loadCatalogue, makePlan } from './generator/hybrid-catalogue.mjs';
import { galleryHtml } from './generator/hybrid-output.mjs';
import { validateResponse, imageIssues } from './generator/author.mjs';

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

test('CLI shorthand and explicit flags agree; subcommands, agents and invalid inputs', () => {
  assert.deepEqual(parseArguments(['github.com/someone/sample', '-10']), parseArguments(['--repo=github.com/someone/sample', '--count', '10']));
  assert.equal(parseArguments([]).command, 'run');
  assert.equal(parseArguments([]).repo, undefined, 'no argument means the current folder');
  assert.equal(parseArguments(['--project', 'project.json']).count, 10);
  assert.deepEqual([parseArguments(['more', '-4']).command, parseArguments(['more', '-4']).count], ['more', 4]);
  assert.deepEqual([parseArguments(['use', '14']).command, parseArguments(['use', '14']).number], ['use', 14]);
  assert.equal(parseArguments(['--codex', '--model', 'gpt-x', '--jobs', '2']).agent, 'codex');
  assert.equal(parseArguments(['--jobs', '2']).jobs, 2);
  assert.equal(parseArguments(['--json']).json, true);
  for (const args of [['someone/sample', '-0'], ['someone/sample', '-999'], ['someone/sample', '--count', '2.5'], ['someone/sample', '--count'], ['--repo', 'someone/sample', '--project', 'x.json'], ['someone/sample', '--force'], ['someone/sample', '-10', '--count', '6'], ['use'], ['use', 'x'], ['--claude', '--codex'], ['--jobs', '0'], ['--jobs', '9'], ['--model', 'a b'], ['a/b', 'c/d']]) assert.throws(() => parseArguments(args), undefined, JSON.stringify(args));
});

test('fetch uses real metadata, README description fallback and byte-ranked languages', async () => {
  const calls = [];
  const result = await fetchProject(parseRepository('someone/sample'), { token: 'test-token', fetcher: async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/languages')) return response({ Python: 2, JavaScript: 9 });
    if (url.endsWith('/readme')) return response('# Sample\n\nThis is the actual project description.\n\n## Installation\n## [Usage](#usage)\n', 200, true);
    return response({ full_name: 'someone/sample', url: 'https://api.github.com/repos/someone/sample', name: 'Sample', description: null, stargazers_count: 42, forks_count: 3, license: { spdx_id: 'MIT' }, topics: ['sample'] });
  } });
  assert.equal(result.description, 'This is the actual project description.');
  assert.deepEqual(result.languages, ['JavaScript', 'Python']);
  assert.deepEqual(result.sections, ['Installation', 'Usage']);
  assert.equal(result.stars, 42);
  assert.equal(result.url, 'https://github.com/someone/sample');
  assert.ok(calls.every(call => call.options.headers.Authorization === 'Bearer test-token'));
  assert.equal(calls.length, 3);
});

test('missing optional GitHub data keeps useful metadata; access failures explain the remedy', async () => {
  const warnings = [];
  const result = await fetchProject(parseRepository('someone/sample'), { env: {}, tokenSource: async () => undefined, warn: message => warnings.push(message), fetcher: async url => {
    if (url.endsWith('/languages')) return response({}, 403);
    if (url.endsWith('/readme')) return response('', 404, true);
    return response({ full_name: 'someone/sample', language: 'Rust' });
  } });
  assert.deepEqual(result.languages, ['Rust']);
  assert.equal(result.stars, null);
  assert.equal(result.license, 'UNSPECIFIED');
  assert.equal(warnings.length, 1);
  for (const [status, pattern] of [[404, /not found or private.*project folder/], [403, /rate limit/], [429, /rate limit/], [500, /HTTP 500/]]) {
    await assert.rejects(fetchProject(parseRepository('someone/sample'), { env: {}, tokenSource: async () => undefined, fetcher: async () => response({}, status) }), pattern);
  }
});

test('selection is reproducible and contains different compositions', () => {
  const selected = selectDesigns(10, 'favourites');
  assert.equal(new Set(selected.map(design => design.id)).size, 10);
  assert.deepEqual(selected.map(design => design.id), selectDesigns(10, 'favourites').map(design => design.id));
  assert.notDeepEqual(selected.map(design => design.id), selectDesigns(10, 'another').map(design => design.id));
  assert.throws(() => selectDesigns(designs.length+1, 'bad'));
});

test('bundle is portable, records the data and seed, and refuses to overwrite output', () => {
  const directory = temporary();
  try {
    const bundle = createBundle(project, { count: 10, seed: 'portable' });
    const target = writeBundle(bundle, path.join(directory, 'headers'));
    assert.ok(bundle.files.has('LICENSE') && bundle.files.has('index.html'));
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

test('executable rejects retired options without creating a gallery and shows the new help', () => {
  const directory = temporary();
  try {
    const cli = fileURLToPath(new URL('./generate.mjs', import.meta.url));
    const fixture = path.join(directory, 'project.json');
    fs.writeFileSync(fixture, JSON.stringify(project));
    const args = ['--project', fixture, '-10', '--creativity', '0', '--seed', 'cli', '--out', path.join(directory, 'out'), '--no-open'];
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: directory });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Every header is freshly authored.*Remove the creativity option/);
    assert.equal(fs.existsSync(path.join(directory, 'out')), false);
    const resume = spawnSync(process.execPath, [cli, '--resume', 'x', '--json'], { encoding: 'utf8', cwd: directory });
    assert.equal(resume.status, 1);
    assert.match(JSON.parse(resume.stdout).error, /npx readme-nfo retry/);
    const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8', cwd: directory });
    assert.equal(help.status, 0);
    for (const text of ['npx readme-nfo more', 'npx readme-nfo use 3', '--claude, --codex', '--jobs', 'brief', 'check', 'not GitHub']) assert.ok(help.stdout.includes(text), text);
    assert.doesNotMatch(help.stdout, /creativity|prebuilt|standalone|--resume/i);
  } finally { removeTemporary(directory); }
});

test('all spellings of the retired creativity setting give actionable guidance', () => {
  assert.equal('creativity' in parseArguments(['someone/sample']),false);
  for(const value of ['0','0.9','1','banana'])for(const flag of ['--creativity','-creativity']) {
    assert.throws(()=>parseArguments(['someone/sample',flag,value]),/Remove the creativity option/);
    assert.throws(()=>parseArguments(['someone/sample',`${flag}=${value}`]),/Remove the creativity option/);
  }
  assert.throws(()=>parseArguments(['someone/sample','--resume','old']));
});

test('every draw is freshly authored across the full catalogue, excludes used styles and numbers on', () => {
  const catalogue = loadCatalogue(); assert.ok(catalogue.distinct.length >= 152);
  const used = new Set(['nfo-01', 'trk-07', 'print-02']);
  const first = makePlan(project, { count: 10, seed: 'fresh', used, catalogue });
  assert.ok(first.options.every(p => p.mode === 'fresh' && !p.presetId));
  assert.equal('creativity' in first, false);
  assert.equal(new Set(first.options.map(p => p.id)).size, 10);
  assert.ok(first.options.every(p => !used.has(p.id) && !p.style.duplicate_of));
  assert.deepEqual(first, makePlan(project, { count: 10, seed: 'fresh', used, catalogue }));
  assert.deepEqual(first.options.map(p => p.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const later = makePlan(project, { count: 3, seed: 'more', start: 11, catalogue });
  assert.deepEqual(later.options.map(p => p.slug.slice(0, 3)), ['11-', '12-', '13-']);
  const full = makePlan(project, { count: catalogue.distinct.length, seed: 'all', catalogue });
  assert.equal(full.options.length, catalogue.distinct.length);
  assert.throws(() => makePlan(project, { count: 1, used: new Set(catalogue.distinct.map(style => style.id)), catalogue }), /Every one of the/);
});

test('author response validation rejects missing, repeated, unsafe and malformed SVGs', () => {
  const options=makePlan(project,{count:2,seed:'check'}).options;
  const image=renderDesign(designs[0],project);
  const candidates=options.map(p=>({id:p.id,svg:image,artDecisions:['A project metaphor','A specific layout']}));
  assert.equal(validateResponse({candidates},options,project).size,2);
  assert.throws(()=>validateResponse({candidates:candidates.slice(0,1)},options,project),/wrong number/);
  assert.throws(()=>validateResponse({candidates:[candidates[0],candidates[0]]},options,project),/repeated/);
  assert.throws(()=>validateResponse({candidates:[{...candidates[0],svg:'<svg><script>run()</script></svg>'},candidates[1]]},options,project));
  assert.throws(()=>validateResponse({candidates:[{...candidates[0],artDecisions:[]},candidates[1]]},options,project),/artistic/);
  assert.ok(imageIssues('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g></svg>').length);
});

test('catalogue scenes without local renderers are still freshly authored',()=>{
  const catalogue=loadCatalogue();
  for(const id of ['vap-04','mach-09','vap-03','xfer-07']) {
    assert.ok(catalogue.byId.has(id));
    assert.ok(!designs.some(design=>design.styleId===id),`${id} requires actual authoring; no generic preset`);
    const draw=makePlan(project,{count:1,seed:id,used:new Set(catalogue.distinct.filter(style=>style.id!==id).map(style=>style.id)),catalogue});
    assert.equal(draw.options[0].id,id);assert.equal(draw.options[0].mode,'fresh');
  }
  assert.equal(new Set(designs.map(design=>design.render)).size,designs.length);
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
    const state = { batches: [{ batch: 1, from: 1, to: 2, agent: 'claude' }, { batch: 2, from: 3, to: 3, agent: 'codex' }],
      headers: [1, 2, 3].map(number => ({ number, id: 'nfo-0' + number, family: 'nfo', slug: '0' + number + '-nfo-0' + number, batch: number < 3 ? 1 : 2, status: number === 2 ? 'failed' : 'ok', svg: 'assets/x.svg' })) };
    await page.setContent(galleryHtml(state, hostile));
    assert.equal(await page.locator('article').count(), 3);
    assert.equal(await page.locator('h2.credit').count(), 2);
    assert.equal(await page.locator('img[onerror]').count(), 0);
    assert.equal(await page.locator('article .num').first().textContent(), '01');
    assert.equal(await page.locator('footer code').first().textContent(), 'npx readme-nfo use 1');
  } finally { await browser.close(); }
});
