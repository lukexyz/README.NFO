import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { main } from './generate.mjs';
import { parseArguments, normaliseProject } from './generator/project.mjs';
import { catalogue } from './generator/catalogue.mjs';
import { renderDesign, designs } from './generator/designs.mjs';
import { createTerminal, estimateBatch, estimateText } from './generator/terminal.mjs';
import { createRuntimeReporter } from './generator/agents.mjs';
import { browserCommand, openGallery } from './generator/browser.mjs';

const project=normaliseProject({fullName:'someone/display',name:'DISPLAY',description:'Original headers for a project.',languages:['JavaScript'],license:'MIT'});
function capture(isTTY=false) { let output='';return {isTTY,write:value=>{output+=value;},read:()=>output}; }
function temporary() { return fs.mkdtempSync(path.join(os.tmpdir(),'readme-nfo-display-')); }
function cleanup(directory) {
  const relative=path.relative(os.tmpdir(),directory);
  assert.ok(relative.startsWith('readme-nfo-display-')&&!relative.includes(path.sep));
  fs.rmSync(directory,{recursive:true,force:true});
}
const statuses={claude:{id:'claude',label:'Claude Code',ready:true,installed:true,account:'Claude Max plan'},codex:{id:'codex',label:'Codex',ready:false,installed:false,hint:'Install Codex'}};
const fixtureDriver=status=>({id:status.id,label:status.label,modelLabel:'fixture-model',account:status.account,
  author:async(prompt,schema,directory,{onRuntime})=>{
    onRuntime({model:'claude-fixture'});
    const id=schema.properties.candidates.items.properties.id.enum[0];
    return {candidates:[{id,svg:renderDesign(designs[0],normaliseProject({fullName:'display',name:'display'})),artDecisions:['Fixture emblem','Fixture layout']}]};
  }});
const fixtureDeps=(directory,stream,extra={})=>({cwd:directory,stream,errStream:capture(),detect:async()=>statuses,driverFactory:fixtureDriver,openBrowser:async()=>true,interactive:false,...extra});

test('count bounds follow the canonical catalogue and display flags parse',()=>{
  for(const count of [15,16,catalogue.length])assert.equal(parseArguments(['someone/display',`-${count}`]).count,count);
  assert.throws(()=>parseArguments(['someone/display',`-${catalogue.length+1}`]),new RegExp(`1 and ${catalogue.length}`));
  const options=parseArguments(['more','--no-open','--no-color']);
  assert.equal(options.open,false);assert.equal(options.color,false);
});

test('model reporting handles split chunks and ignores model-like text in the prompt',()=>{
  const updates=[],report=createRuntimeReporter(value=>updates.push(value));
  report('OpenAI Codex v1\n--------\nmodel: gpt-test');
  report('\nprovider: openai\n--------\nuser\nmodel: malicious\n');
  report('provider: malicious\n');
  assert.deepEqual(updates,[{model:'gpt-test',provider:'openai'}]);
});

test('time estimates are honest: per agent, per round of parallel jobs',()=>{
  assert.deepEqual(estimateBatch(10,{jobs:3,agent:'claude'}),{minimum:160,maximum:720,approximate:true});
  assert.deepEqual(estimateBatch(10,{jobs:1,agent:'codex'}),{minimum:1200,maximum:4200,approximate:true});
  assert.equal(estimateText(2,{jobs:3,agent:'claude'}),'~1-3 min estimate');
});

test('terminal shows the agent row, parallel headers and truthful batch progress',()=>{
  const stream=capture(true);let elapsed=0;
  const terminal=createTerminal({stream,color:false,now:()=>elapsed});
  terminal.banner(10,catalogue.length,3);
  terminal.agent({label:'Claude Code',hint:'switch: --codex',account:'Claude Max plan',model:'sonnet'});
  terminal.plan({from:11,to:20,total:10,styles:153});terminal.estimate(10,{jobs:3,agent:'claude'});
  terminal.headerStep({number:11},'drawing');terminal.headerStep({number:12},'drawing');
  elapsed=61000;terminal.headerStep({number:13},'repairing');terminal.tick();
  const output=stream.read();
  assert.match(output,/AGENT    Claude Code \(switch: --codex\)/);
  assert.match(output,/DRAW 10 \/ 153 STYLES \/ 3 AT A TIME \/ 11-20/);
  assert.match(output,/NOW      11 drawing 1:01  12 drawing 1:01  13 repair 0:00/);
  assert.match(output,/0% 0\/10 ready/);assert.doesNotMatch(output,/100%|\x1b\[(?:3[0-9]|0)m/);
  terminal.headerDone({number:11},{ok:true,attempts:2},74);terminal.headerDone({number:12},{ok:false,issue:'Bad SVG'});
  assert.match(stream.read(),/20% 1\/10 ready, 1 skipped/);
  assert.match(stream.read(),/12 skipped: Bad SVG/);
  terminal.resolvedRuntime({provider:'custom-gateway'});
  assert.match(stream.read(),/custom-gateway account/);
  terminal.finish();
});

test('redirected output prints one plain line per event and no cursor movement',()=>{
  const stream=capture(false);
  const terminal=createTerminal({stream,color:true});
  terminal.banner(2,153,3);terminal.agent({label:'Codex',hint:'switch: --claude',account:'ChatGPT sign-in'});
  terminal.plan({from:1,to:2,total:2,styles:153});terminal.headerStep({number:1},'drawing');terminal.headerDone({number:1},{ok:true,attempts:1},40);
  const output=stream.read();
  assert.doesNotMatch(output,/\x1b/);
  assert.match(output,/README\.NFO \/ 2 new headers \/ 153 styles \/ 2 at a time/);
  assert.match(output,/^AGENT Codex \(switch: --claude\)$/m);assert.match(output,/^HEADER 01 ready in 40 s$/m);
});

test('browser launcher uses argument arrays and safely passes Windows paths through the environment',async()=>{
  const file=path.resolve("gallery ' $ ` & space/index.html");
  const windows=browserCommand(file,'win32');assert.equal(windows.options.shell,false);assert.equal(windows.options.windowsHide,true);
  assert.equal(windows.args.at(-1),'Start-Process -FilePath $env:README_NFO_GALLERY_URL');
  assert.match(windows.options.env.README_NFO_GALLERY_URL,/^file:/);
  assert.equal(browserCommand(file,'darwin').command,'open');
  assert.equal(browserCommand(file,'linux').command,'xdg-open');
  for(const code of [0,1]) {
    const success=await openGallery(file,{platform:'win32',spawnProcess:()=>{
      const child=new EventEmitter();child.kill=()=>{};setImmediate(()=>child.emit('close',code));return child;
    }});assert.equal(success,code===0);
  }
});

test('interactive output stays in one fixed frame across ticks, model updates and parallel headers',()=>{
  for(const columns of [90,42]) {
    let row=0,highWater=0,elapsed=0;const chunks=[];
    const stream={isTTY:true,columns,write:value=>{
      chunks.push(value);
      for(const token of value.match(/\x1b\[[0-9;]*[A-Za-z]|\n|[^\n\x1b]+/g)||[]) {
        if(token==='\n')row++;
        else if(/^\x1b\[\d+A$/.test(token))row-=Number(token.slice(2,-1));
        highWater=Math.max(highWater,row);
        assert.ok(row>=0,'Updates never move above the original frame');
      }
    }};
    const terminal=createTerminal({stream,color:true,now:()=>elapsed});
    terminal.banner(10,153,3);terminal.project('lukexyz/Flightvision');
    terminal.agent({label:'Claude Code',hint:'switch: --codex',account:'Claude Max plan',model:'sonnet'});
    terminal.plan({from:1,to:10,total:10,styles:153});terminal.estimate(10,{jobs:3,agent:'claude'});terminal.destination('file:///D:/headers/index.html');
    for(const number of [1,2,3])terminal.headerStep({number},'drawing');
    for(let index=0;index<60;index++){elapsed+=1000;terminal.tick();}
    terminal.resolvedRuntime({model:'fixture-model'});
    terminal.warning('Fixture notice');
    terminal.headerDone({number:1},{ok:true,attempts:1},60);
    terminal.headerStep({number:4},'drawing');
    assert.equal(highWater,13,'The full running display occupies exactly 14 rows');
    for(const chunk of chunks) {
      const plain=chunk.replace(/\x1b\[[0-9;]*[A-Za-z]/g,'').replace(/^\r/,'');
      assert.equal(plain.split('\n').length,14);
      assert.ok(plain.split('\n').every(line=>line.length<=columns-2),'No wrapping that would break cursor positioning');
    }
    const last=chunks.at(-1).replace(/\x1b\[[0-9;]*[A-Za-z]/g,'');
    assert.match(last,/01 ready in 60 s/);assert.match(last,/10% 1\/10/);
    terminal.finish();assert.equal(highWater,14);
  }
});

test('nothing is written when no agent is signed in, and the error names both sign-ins',async()=>{
  const directory=temporary();
  try {
    fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify({name:'display'}));
    const none={claude:{...statuses.claude,ready:false,hint:'run claude, then /login'},codex:{...statuses.codex}};
    await assert.rejects(main(['-1'],fixtureDeps(directory,capture(),{detect:async()=>none})),/Claude Code: run claude, then \/login[\s\S]*Codex: Install Codex/);
    await assert.rejects(main(['--claude','-1'],fixtureDeps(directory,capture(),{detect:async()=>none})),/Claude Code is not ready/);
    assert.equal(fs.existsSync(path.join(directory,'readme-headers')),false);
  } finally {cleanup(directory);}
});

test('a CLI run opens the gallery at once, reports progress and ends with next-step lines',async()=>{
  const directory=temporary(),stream=capture();
  try {
    fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify({name:'display',description:'Original headers for a project.'}));
    let opened=0;
    const result=await main(['-3','--seed','display'],fixtureDeps(directory,stream,{openBrowser:async file=>{
      opened++;assert.equal(file,path.join(directory,'readme-headers','index.html'));
      assert.match(fs.readFileSync(file,'utf8'),/DRAWING&hellip;/,'opened before headers land');return true;}}));
    assert.equal(opened,1);assert.equal(result.headers.length,3);
    const output=stream.read();
    assert.match(output,/MODEL claude-fixture \(reported by the agent\)/);
    assert.match(output,/READY\s+3 of 3 headers \(01-03\)/);
    assert.match(output,/GALLERY\s+file:/);
    assert.match(output,/INSTALL\s+npx readme-nfo use <N>/);assert.match(output,/MORE\s+npx readme-nfo more/);
    assert.doesNotMatch(output,/RETRY/);
  } finally {cleanup(directory);}
});

test('a failed browser launch keeps a usable gallery link; --no-open never launches',async()=>{
  const directory=temporary();
  try {
    fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify({name:'display'}));
    const stream=capture();await main(['-1'],fixtureDeps(directory,stream,{openBrowser:async()=>false}));
    assert.match(stream.read(),/Could not open your browser/);assert.match(stream.read(),/GALLERY\s+file:/);
    await main(['more','-1','--no-open'],fixtureDeps(directory,capture(),{openBrowser:()=>assert.fail('Disabled browser must stay closed')}));
  } finally {cleanup(directory);}
});
