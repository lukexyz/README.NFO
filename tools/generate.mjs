#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArguments, fetchProject, normaliseProject } from './generator/project.mjs';
import { designs, renderDesign } from './generator/designs.mjs';
import { loadCatalogue } from './generator/hybrid-catalogue.mjs';
import { generateBatch, readSavedPlan } from './generator/batch.mjs';
import { createTerminal } from './generator/terminal.mjs';
import { openGallery } from './generator/browser.mjs';
import { inspectAuthorRuntime } from './generator/codex-runtime.mjs';

const HELP = `README.NFO — generate headers for your GitHub project

  readme-nfo github.com/owner/repo -10
  readme-nfo --repo owner/repo --count 10 --out ./my-headers

  --count N       Number of headers (default 10; up to the distinct catalogue size)
  --creativity F  Fraction newly authored, 0–1 (default 0); -creativity also works
                  Ten headers at 0.9 = nine fresh scenes plus one prebuilt scene
  --exclude FILE  Exclude an earlier draw/manifest (repeatable)
  --allow-repeats Explicitly permit previous styles again
  --resume PATH   Finish a saved batch without redrawing
  --out PATH      Write to a new directory (default ./readme-headers/owner-repo)
  --seed TEXT     Repeat a selection; otherwise choose a fresh random seed
  --project FILE  Use a saved project.json instead of fetching GitHub
  --format TYPE   Filter catalogue treatments: all, svg or text (default all)
  --no-open       Print the gallery link without opening your default browser
  --no-color      Disable terminal colours
  --help          Show this help

Public repositories work directly. For private repositories or higher GitHub
rate limits, set GH_TOKEN or GITHUB_TOKEN in your environment.
Fresh scenes use the full catalogue and require a signed-in Codex CLI.
Standalone mode uses ${designs.length} distinct reusable compositions; the full
catalogue is available for newly authored scenes. Prior batches in the output
folder are excluded automatically; an exhausted pool fails rather than repeats.
Generates SVGs, editable sources, a saved draw, gallery, Markdown and MIT notice.
`;

export async function main(args = process.argv.slice(2), {stream=process.stdout,batch=generateBatch,inspectRuntime=inspectAuthorRuntime,openBrowser=openGallery,fetcher=fetchProject} = {}) {
  const catalogue=loadCatalogue();
  const options = parseArguments(args, catalogue.distinct.length);
  if (options.help) { stream.write(HELP); return; }
  const terminal=createTerminal({stream,color:options.color});
  const saved=options.resume?readSavedPlan(options.resume):null;
  terminal.banner(saved?.plan.count||options.count,catalogue.distinct.length,saved?.plan.format||options.format);
  if (options.out && fs.existsSync(path.resolve(options.out))) throw new Error('That output directory already exists. Choose a new --out directory.');
  let project;
  if(saved) {
    project=saved.project;
  } else if (options.project) {
    project = normaliseProject(JSON.parse(fs.readFileSync(path.resolve(options.project), 'utf8')));
  } else {
    terminal.line(`  Reading ${options.repository.fullName}...`);
    project = await fetcher(options.repository, { warn: message => terminal.warning(message) });
  }
  let timer, destination;
  try {
    const {bundle,output,plan} = await batch(project,options,{catalogue,
      log: message=>terminal.line(`  ${message}`),
      onPlan: async (draw,directory)=>{
        destination=directory;
        const details=draw.counts.fresh?await inspectRuntime():{};
        terminal.runtime(draw,details);
        const sampleStart=performance.now();renderDesign(designs[0],project);
        terminal.estimate(draw.count,performance.now()-sampleStart,Boolean(options.project||options.resume),draw.counts.fresh);
        terminal.line(`  OUTPUT     ${directory}`);
        if(draw.counts.fresh && stream.isTTY)timer=setInterval(()=>terminal.tick(),1000);
      },
      onRuntime: details=>terminal.resolvedRuntime(details),
      onProgress: (done,total,label)=>terminal.progress(done,total,label),
    });
    clearInterval(timer);terminal.finish();
    terminal.line(`  Created ${bundle.picks.length} headers in ${output}`);
    const gallery=path.join(output,'index.html');
    terminal.line(`  GALLERY    ${pathToFileURL(gallery).href}`);
    terminal.line(`  SEED       ${plan.seed}`);
    if(options.open) {
      if(await openBrowser(gallery))terminal.line('  BROWSER    Opened your default browser.');
      else terminal.warning('Could not open the default browser. Use the gallery link above.');
    }
    return {bundle,output,plan};
  } catch(error) {
    terminal.finish();
    if(destination&&fs.existsSync(path.join(destination,'draw.json')))terminal.line(`  RESUME     readme-nfo --resume ${JSON.stringify(destination)}`);
    throw error;
  } finally {clearInterval(timer);terminal.finish();}
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  main().catch(error => { console.error(`README.NFO: ${error.message}`); process.exitCode = 1; });
}
