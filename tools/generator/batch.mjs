import fs from 'node:fs';
import path from 'node:path';
import { designs, presets, renderDesign } from './designs.mjs';
import { loadCatalogue, makePlan, readHistory } from './hybrid-catalogue.mjs';
import { checkAuthor, authorImages, imageIssues } from './author.mjs';
import { createBundle, defaultOutput } from './hybrid-output.mjs';
import { normaliseProject } from './project.mjs';

function contained(root,relative) {
  const target=path.resolve(root,relative),rel=path.relative(root,target);
  if(!rel||rel.startsWith(`..${path.sep}`)||rel==='..'||path.isAbsolute(rel))throw new Error('Batch path escapes its output directory.');
  const existing=fs.existsSync(target)?target:path.dirname(target);
  if(fs.existsSync(existing)) {
    const real=path.relative(fs.realpathSync(root),fs.realpathSync(existing));
    if(real==='..'||real.startsWith(`..${path.sep}`)||path.isAbsolute(real))throw new Error('Batch symlink escapes output directory.');
  }
  return target;
}
function write(root,relative,contents) {
  const target=contained(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});
  contained(root,relative);fs.writeFileSync(target,contents);
}

export function readSavedPlan(directory) {
  const output=path.resolve(directory),plan=JSON.parse(fs.readFileSync(path.join(output,'draw.json'),'utf8'));
  const project=normaliseProject(JSON.parse(fs.readFileSync(path.join(output,'project.json'),'utf8'))),catalogue=loadCatalogue();
  if(plan.schemaVersion!==2||plan.project!==project.fullName||!Array.isArray(plan.options)||plan.options.length!==plan.count)throw new Error('Invalid saved batch draw.');
  const ids=new Set();
  for(const pick of plan.options) {
    if(!catalogue.byId.has(pick.id)||ids.has(pick.id)||!/^\d{2,3}-[a-z][a-z0-9]*-\d{2}$/.test(pick.slug)||!pick.slug.endsWith(`-${pick.id}`)||!['prebuilt','fresh'].includes(pick.mode))throw new Error('Invalid saved candidate.');
    if(pick.mode==='prebuilt'&&![...designs,...presets].some(d=>d.id===pick.presetId&&d.styleId===pick.id))throw new Error('Saved preset is unavailable.');
    ids.add(pick.id);
  }
  if(plan.counts?.fresh!==plan.options.filter(p=>p.mode==='fresh').length||plan.counts?.prebuilt!==plan.options.filter(p=>p.mode==='prebuilt').length)throw new Error('Saved creativity counts do not match the draw.');
  return {output,plan,project};
}

export async function generateBatch(project, options, {author=authorImages,authorCheck=checkAuthor,log=console.log,catalogue=loadCatalogue(),onPlan=()=>{},onProgress=()=>{},onRuntime=()=>{}}={}) {
  let output,plan;
  if(options.resume) ({output,plan,project}=readSavedPlan(options.resume));
  else {
    output=path.resolve(options.out||defaultOutput(project));
    if(fs.existsSync(output))throw new Error('Output already exists. Use --resume or choose a new --out directory.');
    const historyDirectory=options.out?path.dirname(output):path.resolve('readme-headers');
    const history=readHistory(project,historyDirectory,options.exclude,{allowRepeats:options.allowRepeats,catalogue});
    plan=makePlan(project,{...options,used:history.used,historySources:history.sources,catalogue});
    await onPlan(plan,output);
    // No batch is created if its requested engine is unavailable.
    if(plan.counts.fresh)await authorCheck();
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.mkdirSync(output);
    write(output,'draw.json',JSON.stringify(plan,null,2)+'\n');
    write(output,'project.json',JSON.stringify(project,null,2)+'\n');
    write(output,'LICENSE',fs.readFileSync(new URL('../../LICENSE',import.meta.url),'utf8'));
  }
  if(options.resume)await onPlan(plan,output);
  log(`Draw: ${plan.counts.fresh} fresh / ${plan.counts.prebuilt} prebuilt; ${plan.catalogueSize} catalogue styles, ${plan.prebuiltLibrarySize} reusable scenes.`);
  const images=new Map(), pending=[];
  const completed=new Set();
  const reportCompleted=(pick,label)=>{if(completed.has(pick.id))return;completed.add(pick.id);onProgress(completed.size,plan.count,`${label} ${pick.id}`);};
  onProgress(0,plan.count,'Preparing headers');
  for(const pick of plan.options) {
    const asset=contained(output,`assets/${pick.slug}.svg`);
    if(fs.existsSync(asset)) {
      const svg=fs.readFileSync(asset,'utf8');
      if(!imageIssues(svg,project.name).length) {images.set(pick.id,{svg});reportCompleted(pick,'Recovered');continue;}
    }
    if(pick.mode==='prebuilt') {
      const svg=renderDesign([...designs,...presets].find(d=>d.id===pick.presetId),project);
      const issues=imageIssues(svg,project.name);if(issues.length)throw new Error(`${pick.id}: ${issues.join('; ')}`);
      images.set(pick.id,{svg});write(output,`assets/${pick.slug}.svg`,svg);
      reportCompleted(pick,'Rendered');
    } else pending.push(pick);
  }
  if(pending.length) {
    if(options.resume)await authorCheck();
    const authored=await author(project,pending,output,{log,onRuntime,onImage:pick=>reportCompleted(pick,'Saved')});
    for(const pick of pending) {
      const image=authored.get(pick.id);
      if(!image)throw new Error(`Missing authored image: ${pick.id}. Resume the saved batch.`);
      const issues=imageIssues(image.svg,project.name);if(issues.length)throw new Error(`${pick.id}: ${issues.join('; ')}`);
      if(!Array.isArray(image.artDecisions)||image.artDecisions.length<2)throw new Error(`${pick.id}: artistic choices are missing.`);
      images.set(pick.id,image);write(output,`assets/${pick.slug}.svg`,image.svg);
      write(output,`src/${pick.slug}.art.json`,JSON.stringify(image.artDecisions,null,2)+'\n');
      reportCompleted(pick,'Validated');
    }
  }
  const selected=plan.options.map(pick=>{
    const image=images.get(pick.id),choices=path.join(output,'src',`${pick.slug}.art.json`);
    return {...pick,svg:image.svg,artDecisions:image.artDecisions||(fs.existsSync(choices)?JSON.parse(fs.readFileSync(choices,'utf8')):[])};
  });
  const bundle=createBundle(project,{count:plan.count,seed:plan.seed,selected,plan});
  for(const [file,contents] of bundle.files)write(output,file,contents);
  for(const pick of selected) {
    // SVG content is data, safely quoted as a JS literal. Generated code is not executed.
    const source=`// MIT — README.NFO. Editable SVG snapshot; rebuild with node src/${pick.slug}.mjs.\nimport fs from 'node:fs';\nconst image = ${JSON.stringify(pick.svg)};\nfs.mkdirSync(new URL('../assets/',import.meta.url),{recursive:true});\nfs.writeFileSync(new URL('../assets/${pick.slug}.svg',import.meta.url),image);\n`;
    write(output,`src/${pick.slug}.mjs`,source);
  }
  write(output,'qa.json',JSON.stringify({checks:['SVG XML','image policy','exact accessible project identity','complete draw membership','source and image files'],
    visualInspection:'Not performed by the CLI. Review the gallery on desktop and mobile.',counts:plan.counts},null,2)+'\n');
  return {output,plan,bundle};
}
