import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';
import { checkCatalogue } from '../lib/checks.mjs';
import { designs, presets, presetStyleIds } from './designs.mjs';
import { supportsFormat } from './catalogue.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export function loadCatalogue() {
  const source = JSON.parse(fs.readFileSync(path.join(ROOT,'styles/styles.json'),'utf8'));
  const checked = checkCatalogue(source);
  if(checked.errors.length)throw new Error(checked.errors.join('\n'));
  return {...checked,family:new Map(source.families.flatMap(group=>group.styles.map(style=>[style.id,group.key]))),researched:source.researched};
}
export function shuffled(values,seed) {
  const result=[...values];let counter=0;
  const random=maximum=>{const bound=Math.floor(0x100000000/maximum)*maximum;let value;do{value=createHash('sha256').update(JSON.stringify([seed,counter++])).digest().readUInt32BE(0);}while(value>=bound);return value%maximum;};
  for(let i=result.length-1;i>0;i--){const j=random(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;
}
export function splitCounts(count,creativity) {
  if(!Number.isInteger(count)||count<1||!Number.isFinite(creativity)||creativity<0||creativity>1)throw new Error('Invalid count or creativity.');
  const fresh=Math.round(count*creativity);return {fresh,prebuilt:count-fresh};
}
function previousIds(previous,checked) {
  const ids=[];
  for(const pick of previous.options||[]) {
    const id=pick.styleId||presetStyleIds[pick.id]||designs.find(d=>d.id===pick.id)?.styleId||pick.id;
    let style=checked.byId.get(id);if(!style)continue;
    while(style.duplicate_of)style=checked.byId.get(style.duplicate_of);ids.push(style.id);
  }
  return ids;
}
export function readHistory(project,directory,excludeFiles=[],{allowRepeats=false,catalogue:checked=loadCatalogue()}={}) {
  const used=new Set(),sources=[];
  if(!allowRepeats&&fs.existsSync(directory))for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    if(!entry.isDirectory()||entry.isSymbolicLink())continue;
    const file=path.join(directory,entry.name,'manifest.json');if(!fs.existsSync(file))continue;
    try{const previous=JSON.parse(fs.readFileSync(file,'utf8'));if(previous.project!==project.fullName||(previous.status&&previous.status!=='complete'))continue;previousIds(previous,checked).forEach(id=>used.add(id));sources.push(file);}catch{}
  }
  for(const file of excludeFiles){const previous=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));if(!Array.isArray(previous.options)||previous.options.some(p=>!p?.id))throw new Error(`Invalid previous draw: ${file}`);previousIds(previous,checked).forEach(id=>used.add(id));sources.push(path.resolve(file));}
  return {used,sources};
}
export function makePlan(project,{count=10,creativity=0,seed=randomBytes(16).toString('hex'),used=new Set(),historySources=[],format='all',catalogue:checked=loadCatalogue()}={}) {
  const counts=splitCounts(count,creativity);
  const available=designs.filter(d=>!used.has(d.styleId)&&supportsFormat(checked.byId.get(d.styleId),format));
  if(counts.prebuilt>available.length)throw new Error(`Only ${available.length} unused prebuilt compositions remain; this run needs ${counts.prebuilt}. The catalogue has ${checked.distinct.length} style briefs, but standalone mode has ${designs.length} distinct compositions. Choose --creativity 1 for full-catalogue authoring, or --allow-repeats to reuse styles from earlier batches.`);
  const prebuilt=shuffled(available,`${seed}:prebuilt`).slice(0,counts.prebuilt);
  const excluded=new Set([...used,...prebuilt.map(d=>d.styleId)]);
  const eligible=checked.distinct.filter(style=>!excluded.has(style.id)&&supportsFormat(style,format));
  if(counts.fresh>eligible.length)throw new Error(`Only ${eligible.length} unused catalogue styles remain; this run needs ${counts.fresh}. Use --allow-repeats to start a new cycle explicitly.`);
  const fresh=shuffled(eligible,`${seed}:fresh`).slice(0,counts.fresh);
  const options=shuffled([...prebuilt.map(d=>({id:d.styleId,presetId:d.id,name:d.name,mode:'prebuilt',style:checked.byId.get(d.styleId)})),...fresh.map(style=>({id:style.id,name:style.name,mode:'fresh',style}))],`${seed}:order`).map((pick,index)=>({...pick,number:index+1,slug:`${String(index+1).padStart(2,'0')}-${pick.id}`,family:checked.family.get(pick.id)}));
  return {schemaVersion:2,project:project.fullName,seed:String(seed),creativity,count,counts,format,catalogueSize:checked.distinct.length,prebuiltLibrarySize:designs.length,excludedIds:[...used].sort(),historySources,researched:checked.researched,options};
}
export function sampleFor(id) {
  const folder=path.join(ROOT,'examples');if(!fs.existsSync(folder))return null;
  const sets=fs.readdirSync(folder,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).sort((a,b)=>a==='readme-nfo'?-1:b==='readme-nfo'?1:a.localeCompare(b));
  for(const set of sets)for(const file of fs.readdirSync(path.join(folder,set)).filter(name=>/^\d.*\.md$/.test(name))) {
    const markdown=fs.readFileSync(path.join(folder,set,file),'utf8');if(!markdown.includes(`#${id})`))continue;
    const source=path.join(folder,set,'src',file.replace(/\.md$/,'.mjs'));if(!fs.existsSync(source))continue;
    return {file:`examples/${set}/src/${path.basename(source)}`,source:fs.readFileSync(source,'utf8').slice(0,9000)};
  }
  return null;
}
