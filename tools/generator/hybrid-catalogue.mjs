import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';
import { checkCatalogue } from '../lib/checks.mjs';
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
export const slugFor=(number,id)=>`${String(number).padStart(2,'0')}-${id}`;
// Draw `count` distinct styles that are not in `used`, numbered from `start` (numbering never restarts).
export function makePlan(project,{count=10,seed=randomBytes(16).toString('hex'),used=new Set(),format='all',start=1,catalogue:checked=loadCatalogue()}={}) {
  if(!Number.isInteger(count)||count<1)throw new Error('Invalid header count.');
  if(!Number.isInteger(start)||start<1)throw new Error('Invalid first header number.');
  const eligible=checked.distinct.filter(style=>!used.has(style.id)&&supportsFormat(style,format));
  if(count>eligible.length)throw new Error(eligible.length?`Only ${eligible.length} unused styles remain for this gallery; ask for -${eligible.length} or fewer.`:`Every one of the ${checked.distinct.length} styles is already in this gallery. Pick one with npx readme-nfo use N.`);
  const fresh=shuffled(eligible,`${seed}:fresh`).slice(0,count);
  const options=shuffled(fresh.map(style=>({id:style.id,name:style.name,mode:'fresh',style})),`${seed}:order`).map((pick,index)=>({...pick,number:start+index,slug:slugFor(start+index,pick.id),family:checked.family.get(pick.id)}));
  return {project:project.fullName,seed:String(seed),count,format,catalogueSize:checked.distinct.length,start,options};
}
// Technique samples come only from the shipped bundle (built from committed example sets).
let samples;
export function loadSamples() {
  if(samples===undefined) {
    const file=path.join(ROOT,'styles/samples.json');
    samples=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')).samples||{}:{};
  }
  return samples;
}
export function sampleFor(id) {
  const sample=loadSamples()[id];
  return sample?{file:sample.file,source:sample.source}:null;
}
