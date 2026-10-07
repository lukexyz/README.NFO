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
import { loadCatalogue, makePlan, splitCounts, readHistory } from './generator/hybrid-catalogue.mjs';
import { generateBatch, readSavedPlan } from './generator/batch.mjs';
import { validateResponse, imageIssues, authorImages } from './generator/author.mjs';

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
  for (const args of [[], ['someone/sample', '-0'], ['someone/sample', '-999'], ['someone/sample', '--count', '2.5'], ['someone/sample', '--count'], ['--repo', 'someone/sample', '--project', 'x.json'], ['someone/sample', '--force'], ['someone/sample', '-10', '--count', '6']]) assert.throws(() => parseArguments(args));
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

test('executable generates an offline batch and reports errors with a nonzero exit', () => {
  const directory = temporary();
  try {
    const cli = fileURLToPath(new URL('./generate.mjs', import.meta.url));
    const fixture = path.join(directory, 'project.json');
    fs.writeFileSync(fixture, JSON.stringify(project));
    const args = ['--project', fixture, '-10', '--creativity', '0', '--seed', 'cli', '--out', path.join(directory, 'out'), '--no-open'];
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: directory });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Created 10 headers/);
    assert.ok(fs.existsSync(path.join(directory, 'out', 'index.html')));
    const rerun = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: directory });
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /already exists/);
    const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8', cwd: directory });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /--creativity/);
    assert.match(help.stdout, /reusable/);
  } finally { removeTemporary(directory); }
});

test('creativity is a batch fraction, including the single-dash alias, not an invalid or clamped temperature', () => {
  assert.deepEqual(splitCounts(10, .9), {fresh:9,prebuilt:1});
  assert.deepEqual(splitCounts(10, 0), {fresh:0,prebuilt:10});
  assert.deepEqual(splitCounts(10, 1), {fresh:10,prebuilt:0});
  assert.deepEqual(splitCounts(12, .9), {fresh:11,prebuilt:1});
  assert.equal(parseArguments(['someone/sample']).creativity,1);
  assert.equal(parseArguments(['someone/sample','-creativity','0.9']).creativity,.9);
  for(const value of ['-1','1.1','NaN','Infinity','banana'])assert.throws(()=>parseArguments(['someone/sample','--creativity',value]));
  assert.throws(()=>parseArguments(['someone/sample','--resume','old']));
});

test('hybrid draws cover the catalogue, exclude past styles, never substitute, and repeat with the same inputs', () => {
  const catalogue=loadCatalogue();assert.ok(catalogue.distinct.length>=152);
  const used=new Set(['nfo-01','trk-07','print-02']);
  const first=makePlan(project,{count:10,creativity:.9,seed:'hybrid',used,catalogue});
  assert.deepEqual(first.counts,{fresh:9,prebuilt:1});
  assert.equal(first.prebuiltLibrarySize,designs.length);
  assert.equal(new Set(first.options.map(p=>p.id)).size,10);
  assert.ok(first.options.every(p=>!used.has(p.id)&&!p.style.duplicate_of));
  assert.deepEqual(first,makePlan(project,{count:10,creativity:.9,seed:'hybrid',used,catalogue}));
  const full=makePlan(project,{count:catalogue.distinct.length,creativity:1,seed:'all',catalogue});
  assert.equal(full.options.length,catalogue.distinct.length);
});

test('author response validation rejects missing, repeated, unsafe and malformed SVGs', () => {
  const options=makePlan(project,{count:2,creativity:1,seed:'check'}).options;
  const image=renderDesign(designs[0],project);
  const candidates=options.map(p=>({id:p.id,svg:image,artDecisions:['A project metaphor','A specific layout']}));
  assert.equal(validateResponse({candidates},options,project).size,2);
  assert.throws(()=>validateResponse({candidates:candidates.slice(0,1)},options,project),/wrong number/);
  assert.throws(()=>validateResponse({candidates:[candidates[0],candidates[0]]},options,project),/repeated/);
  assert.throws(()=>validateResponse({candidates:[{...candidates[0],svg:'<svg><script>run()</script></svg>'},candidates[1]]},options,project));
  assert.throws(()=>validateResponse({candidates:[{...candidates[0],artDecisions:[]},candidates[1]]},options,project),/artistic/);
  assert.ok(imageIssues('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g></svg>').length);
});

test('standalone history excludes both new manifests and legacy preset names and fails on exhaustion',async()=>{
  const directory=temporary();
  const dependencies={authorCheck:async()=>{throw new Error('Should not invoke author');},log:()=>{}};
  try {
    const one=await generateBatch(project,{count:10,creativity:0,seed:'one',out:path.join(directory,'one')},dependencies);
    const two=await generateBatch(project,{count:10,creativity:0,seed:'two',out:path.join(directory,'two')},dependencies);
    assert.ok(two.plan.options.every(p=>!one.plan.options.some(old=>old.id===p.id)));
    const history=readHistory(project,directory);assert.equal(history.used.size,20);
    const remaining=designs.length-20;
    await assert.rejects(generateBatch(project,{count:remaining+1,creativity:0,out:path.join(directory,'three')},dependencies),new RegExp(`Only ${remaining} unused`));
    assert.equal(fs.existsSync(path.join(directory,'three')),false);
    const repeat=await generateBatch(project,{count:10,creativity:0,allowRepeats:true,out:path.join(directory,'repeat')},dependencies);
    assert.equal(repeat.plan.options.length,10);
    const legacy=path.join(directory,'legacy');fs.mkdirSync(legacy);fs.writeFileSync(path.join(legacy,'manifest.json'),JSON.stringify({project:project.fullName,options:[{id:'tracker'}]}));
    assert.ok(readHistory(project,directory).used.has('trk-07'));
  } finally {removeTemporary(directory);}
});

test('standalone draws never relabel a generic fallback as an unimplemented catalogue scene',()=>{
  const catalogue=loadCatalogue();
  for(const id of ['vap-04','mach-09','vap-03','xfer-07']) {
    assert.ok(catalogue.byId.has(id));
    assert.ok(!designs.some(design=>design.styleId===id),`${id} requires actual authoring; no generic preset`);
    const draw=makePlan(project,{count:1,creativity:1,seed:id,used:new Set(catalogue.distinct.filter(style=>style.id!==id).map(style=>style.id)),catalogue});
    assert.equal(draw.options[0].id,id);assert.equal(draw.options[0].mode,'fresh');
  }
  assert.throws(()=>makePlan(project,{count:catalogue.distinct.length,creativity:0,catalogue}),/distinct compositions.*--creativity 1/);
  assert.equal(new Set(designs.map(design=>design.render)).size,designs.length);
});

test('a failed author preserves its draw, resumes without fetching or redrawing, and exports rebuilding sources',async()=>{
  const directory=temporary(),output=path.join(directory,'batch');let checks=0;
  try {
    const deps={log:()=>{},authorCheck:async()=>{checks++;},author:async()=>{throw new Error('Test author failure');}};
    await assert.rejects(generateBatch(project,{count:10,creativity:.9,seed:'resume',out:output},deps),/Test author/);
    const original=fs.readFileSync(path.join(output,'draw.json'),'utf8');
    assert.equal(fs.existsSync(path.join(output,'index.html')),false);
    const saved=readSavedPlan(output);assert.deepEqual(saved.plan.counts,{fresh:9,prebuilt:1});
    deps.author=async(p,options)=>new Map(options.map(pick=>[pick.id,{svg:renderDesign(designs[0],p),artDecisions:['Project architecture motif','Custom information layout']}])) ;
    const finished=await generateBatch(project,{resume:output},deps);
    assert.equal(fs.readFileSync(path.join(output,'draw.json'),'utf8'),original);
    const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
    assert.equal(manifest.status,'complete');assert.deepEqual(manifest.counts,{fresh:9,prebuilt:1});
    assert.ok(manifest.options.filter(p=>p.mode==='fresh').every(p=>p.artDecisions.length===2));
    assert.equal(checks,2);
    const first=finished.plan.options[0],src=path.join(output,'src',`${first.slug}.mjs`),asset=path.join(output,'assets',`${first.slug}.svg`);
    const before=fs.readFileSync(asset,'utf8');
    const rebuilt=spawnSync(process.execPath,[src],{encoding:'utf8'});assert.equal(rebuilt.status,0,rebuilt.stderr);
    assert.equal(fs.readFileSync(asset,'utf8'),before);
  } finally {removeTemporary(directory);}
});

test('authoring saves headers individually and preserves completed progress when the next header fails',async()=>{
  const {EventEmitter}=await import('node:events');
  const {PassThrough}=await import('node:stream');
  const directory=temporary(),options=makePlan(project,{count:4,creativity:1,seed:'groups'}).options;
  let calls=0;const stages=[],saved=[];
  const runner=(_executable,args)=>{
    calls++;
    const child=new EventEmitter();child.stdin=new PassThrough();child.stderr=new PassThrough();child.kill=()=>{};
    child.stdin.resume();
    child.stdin.on('finish',()=>queueMicrotask(()=>{
      if(calls===2){child.stderr.write('Fixture failure');child.emit('exit',1);return;}
      const schema=JSON.parse(fs.readFileSync(args[args.indexOf('--output-schema')+1],'utf8'));
      const ids=schema.properties.candidates.items.properties.id.enum;
      assert.equal(ids.length,1);
      const result={candidates:ids.map(id=>({id,svg:renderDesign(designs[0],project),artDecisions:['Project motif','Custom composition']}))};
      fs.writeFileSync(args[args.indexOf('--output-last-message')+1],JSON.stringify(result));child.emit('exit',0);
    }));
    return child;
  };
  try {
    await assert.rejects(authorImages(project,options,directory,{runner,log:()=>{},
      onHeaderProgress:(pick,step)=>stages.push([pick.id,step]),
      onImage:pick=>{assert.ok(fs.existsSync(path.join(directory,'assets',`${pick.slug}.svg`)));saved.push(pick.id);},
    }),/Fixture failure/);
    assert.equal(calls,2);
    assert.deepEqual(stages.filter(([id])=>id===options[0].id).map(([,step])=>step),[0,1,2,3,4,5]);
    assert.deepEqual(stages.filter(([id])=>id===options[1].id).map(([,step])=>step),[0,1,2]);
    assert.deepEqual(saved,[options[0].id]);
    for(const pick of options.slice(1))assert.equal(fs.existsSync(path.join(directory,'assets',`${pick.slug}.svg`)),false);
  }finally{removeTemporary(directory);}
});

test('unavailable fresh authoring fails without creating or substituting a preset batch',async()=>{
  const directory=temporary(),output=path.join(directory,'missing');
  try {
    await assert.rejects(generateBatch(project,{count:10,creativity:.9,out:output},{authorCheck:async()=>{throw new Error('Codex missing');},log:()=>{}}),/Codex missing/);
    assert.equal(fs.existsSync(output),false);
  } finally {removeTemporary(directory);}
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
