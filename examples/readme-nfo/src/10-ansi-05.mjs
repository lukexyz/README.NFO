import {svg,px,writeHeader} from './lib.mjs';

const colours=['#e6fc66','#96ee69','#59e7ba','#76ebee','#e7f6ef'];
let logo='';
for(const [i,letter] of [...'README.NFO'].entries()) logo+=px(letter,54+i*42,55,7,colours[Math.floor(i/2)]);
const rows=[['01','STYLES/','152','STYLE CATALOGUE'],['02','EXAMPLES/','13','VISUAL FAMILIES'],['03','TOOLS/','SVG','PREVIEW + VALIDATE'],['04','LICENSE','MIT','COPY / CUSTOMISE / SHARE']];
let table='';
for(const [i,row] of rows.entries()){
 const y=192+i*34;
 if(i===0)table+=`<rect x="43" y="${y-7}" width="864" height="29" fill="#102c33"/>`;
 table+=px(row[0],58,y,2,'#969eb4')+px(row[1],137,y,2,'#78eae7')+px(row[2],414,y,2,'#bfe991')+px(row[3],516,y,2,'#e4e8ee');
}
const image=svg({height:410,background:'#0a0c11',title:'README.NFO — bulletin board file area',
 description:'A cyan-and-green bulletin-board directory screen. The README.NFO logo and repository stats sit over a ruled file-area table, coloured inverse hotkeys, and a command prompt.',
 body:`<g shape-rendering="crispEdges"><path d="M24 21H936V389H24Z" fill="none" stroke="#4f5468" stroke-width="2"/>
  <path d="M32 29H928V122H32Z" fill="#10151e"/>
  ${px('THE RETRO HEADER ARCHIVE',54,33,2,'#879093')}${logo}
  <path d="M524 39V106" stroke="#4f5468" stroke-width="2"/>
  ${px('STYLES : 152',560,42,2,'#bfe991')}${px('FAMILIES : 13',560,66,2,'#76e3df')}${px('LICENCE : MIT',560,90,2,'#e6fc66')}
  ${px('FILE AREA / PUBLIC ACCESS',54,140,2,'#e4e8ee')}${px('04 ENTRIES',768,140,2,'#e179c4')}
  <path d="M43 168H907M43 329H907" stroke="#6b748b" stroke-width="2"/>
  ${table}
  <rect x="54" y="344" width="22" height="20" fill="#76e3df"/>${px('S',61,347,2,'#0a0c11')}${px('STYLES',88,347,2,'#bcc6ce')}
  <rect x="239" y="344" width="22" height="20" fill="#bfe991"/>${px('E',246,347,2,'#0a0c11')}${px('EXAMPLES',273,347,2,'#bcc6ce')}
  <rect x="470" y="344" width="22" height="20" fill="#e6fc66"/>${px('T',477,347,2,'#0a0c11')}${px('TOOLS',504,347,2,'#bcc6ce')}
  <rect x="658" y="344" width="22" height="20" fill="#e179c4"/>${px('Q',665,347,2,'#0a0c11')}${px('QUIT',692,347,2,'#bcc6ce')}
  ${px('README.NFO > SELECT A FILE AREA',54,374,1,'#76e3df')}<rect x="244" y="374" width="5" height="7" fill="#76e3df"/>
  <rect x="891" y="36" width="17" height="17" fill="#e179c4"/><path d="M895 40h9v9h-9z" fill="#10151e"/>
 </g>`});
const widths=[4,13,7,41];
const border=`+${'-'.repeat(68)}+`;
const tableRule=`+${widths.map(w=>'-'.repeat(w)).join('+')}+`;
const textRow=values=>'|'+values.map((value,i)=>` ${value}`.padEnd(widths[i])).join('|')+'|';
const descriptions=['Researched retro style catalogue','Text and SVG visual families','Local previews and validation','Copy, customise and share'];
const text=[border,
  '| README.NFO       STYLES: 152   FAMILIES: 13   LICENCE: MIT'.padEnd(69)+'|',
  tableRule,...rows.map((row,i)=>textRow([...row.slice(0,3),descriptions[i]])),tableRule,
  '| [S] styles   [E] examples   [T] tools'.padEnd(69)+'|',border].join('\n');
const markdown=`<p align="center"><img src="assets/10-ansi-05.svg" width="100%" alt="README.NFO bulletin-board file directory with stats, rows and coloured hotkeys"></p>\n\n\`\`\`text\n${text}\n\`\`\`\n\n[S: Styles](../../styles/INDEX.md) · [E: Examples](../README.md) · [T: Tools](../../tools/preview.mjs) · [MIT licence](../../LICENSE)`;
writeHeader(10,{image,markdown,summary:'BBS data screen with a stats masthead, directory table and inverse-video hotkeys.'});
