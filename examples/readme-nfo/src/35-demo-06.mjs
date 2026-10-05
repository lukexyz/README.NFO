import fs from 'node:fs';
import path from 'node:path';
import { DIR, INFO, esc, writeHeader } from './lib.mjs';

const catalogue=JSON.parse(fs.readFileSync(path.join(DIR,'../../styles/styles.json'),'utf8'));
const familyRows=catalogue.families.map(f=>({key:f.key,name:f.title,count:f.styles.filter(s=>!s.duplicate_of).length})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
const width=76;
const center=text=>' '.repeat(Math.floor((width-text.length)/2))+text;
const rule='-'.repeat(width);
const lines=[
 center('R E A D M E . N F O'),
 center('HEADER JAM / RESULTS.TXT'),
 center('CATALOGUE COUNTS - NO BALLOTS WERE CAST'),
 '',rule,'',
 'STYLE COVERAGE COMPO',
 '- ---- -------------------------------------------------------------- ---- -',
 ' Rank  Cards  Family',
 '',
];
for(let i=0;i<familyRows.length;i++) {
 const f=familyRows[i];
 const label=f.name.length>48?f.name.slice(0,45)+'...':f.name;
 lines.push(` ${String(i+1).padStart(2,'0')}.   ${String(f.count).padStart(3)}   ${label}`);
}
lines.push('',rule,'','DELIVERY COMPO','- ---- -------------------------------------------------------------- ---- -',
 ' 01.   152   Researched style cards             by styles/',
 ` 02.   ${String(INFO.candidates).padStart(3)}   README.NFO header candidates         by examples/readme-nfo/`,
 ' 03.    13   Distinct visual families           by the catalogue',
 ' 04.     2   Header formats: text art + SVG     by the examples',
 '',rule,
 ' 152 distinct styles / 13 families / original recipes / MIT licence',
 ' [ STYLE CATALOGUE ]   [ ALL CANDIDATES ]   [ MIT LICENCE ]',
 rule);
for(const line of lines)if(line.length>80)throw Error(`Text row exceeds 80 columns: ${line}`);
let text=esc(lines.join('\n'));
text=text.replace('[ STYLE CATALOGUE ]','<a href="../../styles/INDEX.md">[ STYLE CATALOGUE ]</a>')
 .replace('[ ALL CANDIDATES ]','<a href="README.md">[ ALL CANDIDATES ]</a>')
 .replace('[ MIT LICENCE ]','<a href="../../LICENSE">[ MIT LICENCE ]</a>');
writeHeader(35,{markdown:`<pre>\n${text}\n</pre>`,summary:'A demoparty-style results file ranks real catalogue coverage and delivery counts; no fictional votes.'});
