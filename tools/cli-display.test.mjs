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
import { generateBatch } from './generator/batch.mjs';
import { createTerminal } from './generator/terminal.mjs';
import { inspectAuthorRuntime, createRuntimeReporter } from './generator/codex-runtime.mjs';
import { browserCommand, openGallery } from './generator/browser.mjs';

const project=normaliseProject({fullName:'someone/display',name:'DISPLAY',description:'Original headers for a project.',languages:['JavaScript'],license:'MIT'});
function capture(isTTY=false) { let output='';return {isTTY,write:value=>{output+=value;},read:()=>output}; }
function temporary() { return fs.mkdtempSync(path.join(os.tmpdir(),'readme-nfo-display-')); }
function cleanup(directory) {
  const relative=path.relative(os.tmpdir(),directory);
  assert.ok(relative.startsWith('readme-nfo-display-')&&!relative.includes(path.sep));
  fs.rmSync(directory,{recursive:true,force:true});
}
function loginRunner(message,code=0) {
  return (command,args,options)=>{
    assert.equal(command,'codex');assert.deepEqual(args,['login','status']);assert.equal(options.shell,false);
    const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};
    setImmediate(()=>{child.stderr.emit('data',message);child.emit('close',code);});return child;
  };
}

test('count bounds follow the canonical catalogue and display flags work on new and resumed runs',()=>{
  for(const count of [15,16,catalogue.length])assert.equal(parseArguments(['someone/display',`-${count}`]).count,count);
  assert.throws(()=>parseArguments(['someone/display',`-${catalogue.length+1}`]),new RegExp(`1 and ${catalogue.length}`));
  const options=parseArguments(['--resume','saved','--no-open','--no-color']);
  assert.equal(options.open,false);assert.equal(options.color,false);
});

test('account reporting identifies auth type without exposing a key or running inference',async()=>{
  const chatgpt=await inspectAuthorRuntime({env:{},runner:loginRunner('Logged in using ChatGPT')});
  assert.equal(chatgpt.auth,'chatgpt');assert.match(chatgpt.billing,/Your signed-in ChatGPT/);
  const api=await inspectAuthorRuntime({env:{},runner:loginRunner('Logged in using an API key: sk-secret')});
  assert.equal(api.auth,'api-key');assert.doesNotMatch(JSON.stringify(api),/sk-secret/);
  const override=await inspectAuthorRuntime({env:{CODEX_API_KEY:'sk-hidden'},runner:()=>assert.fail('Override needs no probe')});
  assert.equal(override.auth,'api-key');assert.doesNotMatch(JSON.stringify(override),/sk-hidden/);
  assert.equal((await inspectAuthorRuntime({env:{},runner:loginRunner('Not logged in',1)})).auth,'unknown');
});

test('model reporting handles split chunks and ignores model-like text in the prompt',()=>{
  const updates=[],report=createRuntimeReporter(value=>updates.push(value));
  report('OpenAI Codex v1\n--------\nmodel: gpt-test');
  report('\nprovider: openai\n--------\nuser\nmodel: malicious\n');
  report('provider: malicious\n');
  assert.deepEqual(updates,[{model:'gpt-test',provider:'openai'}]);
});

test('terminal keeps incomplete authoring progress truthful and respects disabled colours',()=>{
  const stream=capture(true);let elapsed=0;
  const terminal=createTerminal({stream,color:false,now:()=>elapsed});
  terminal.banner(16,catalogue.length,'all');
  terminal.runtime({counts:{fresh:15,prebuilt:1}},{billing:'Your signed-in ChatGPT account / Codex allowance'});
  terminal.estimate(16,5,true,15);terminal.progress(1,16,'Saved nfo-01');elapsed=10000;terminal.tick();terminal.finish();
  const output=stream.read();assert.match(output,/LARGE DRAW \(>15\)/);assert.match(output,/Rough planning estimate/);
  assert.match(output,/elapsed 10s/);assert.doesNotMatch(output,/100%|0 AI credits|\x1b\[(?:3[0-9]|0)m/);
  terminal.resolvedRuntime({provider:'custom-gateway'});
  assert.match(stream.read(),/configured custom-gateway provider account/);
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

test('a full local-library CLI run warns, completes progress and opens only the finished gallery',async()=>{
  const directory=temporary(),stream=capture();
  try {
    const fixture=path.join(directory,'project.json'),output=path.join(directory,'headers');
    fs.writeFileSync(fixture,JSON.stringify(project));let opened=0;
    const result=await main(['--project',fixture,`-${designs.length}`,'--seed','display','--out',output],{stream,
      inspectRuntime:()=>assert.fail('Local runs need no Codex account probe'),
      openBrowser:async file=>{opened++;assert.equal(file,path.join(output,'index.html'));assert.ok(fs.existsSync(file));
        assert.equal(JSON.parse(fs.readFileSync(path.join(output,'manifest.json'))).status,'complete');return true;},
    });
    assert.equal(result.bundle.picks.length,designs.length);assert.equal(opened,1);
    assert.match(stream.read(),/0 AI credits/);assert.match(stream.read(),/LARGE DRAW \(>15\)/);
    assert.match(stream.read(),new RegExp(`100% ${designs.length}/${designs.length}`));
    assert.match(stream.read(),/GALLERY\s+file:/);assert.match(stream.read(),/Opened your default browser/);
  } finally {cleanup(directory);}
});

test('fresh CLI display reports resolved model, account and saved progress without invoking an AI service',async()=>{
  const directory=temporary(),stream=capture();
  try {
    const fixture=path.join(directory,'project.json');fs.writeFileSync(fixture,JSON.stringify(project));
    const observed=[];
    const batch=(data,options,hooks)=>generateBatch(data,options,{...hooks,authorCheck:async()=>{},
      author:async(data,picks,output,{onRuntime,onImage})=>{
        onRuntime({model:'gpt-test',provider:'openai'});
        const result=new Map();
        for(const pick of picks){result.set(pick.id,{svg:renderDesign(designs[0],data),artDecisions:['Original emblem','Project-specific composition']});onImage(pick);}
        return result;
      },onProgress:(done,total,label)=>{observed.push(done);hooks.onProgress(done,total,label);},
    });
    await main(['--project',fixture,'-3','--creativity','1','--out',path.join(directory,'headers'),'--no-open'],{stream,batch,
      inspectRuntime:async()=>({billing:'Your signed-in ChatGPT account / Codex allowance'}),openBrowser:()=>assert.fail('Disabled browser must stay closed')});
    assert.deepEqual(observed,[0,1,2,3]);assert.match(stream.read(),/gpt-test \(reported by Codex\)/);
    assert.match(stream.read(),/Your signed-in ChatGPT account/);assert.doesNotMatch(stream.read(),/0 AI credits/);
  } finally {cleanup(directory);}
});

test('failed generation never opens a browser and a launcher failure retains a usable gallery link',async()=>{
  const directory=temporary();
  try {
    const fixture=path.join(directory,'project.json');fs.writeFileSync(fixture,JSON.stringify(project));
    await assert.rejects(main(['--project',fixture,'-1'],{stream:capture(),batch:async()=>{throw new Error('Failed batch');},openBrowser:()=>assert.fail('No browser on failed batch')}),/Failed batch/);
    const stream=capture();await main(['--project',fixture,'-1','--out',path.join(directory,'headers')],{stream,openBrowser:async()=>false});
    assert.match(stream.read(),/GALLERY\s+file:/);assert.match(stream.read(),/Could not open the default browser/);
  } finally {cleanup(directory);}
});
