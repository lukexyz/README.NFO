import {writeHeader,esc} from './lib.mjs';
const W=76;
const centred=s=>'|'+s.padStart(Math.floor((W-2+s.length)/2)).padEnd(W-2)+'|';
const border='+'+'-'.repeat(W-2)+'+';
const index=(label,page,href)=>`        <a href="${href}">${label}</a>${'.'.repeat(49-label.length)}${page}`;
const lines=[border,
centred('= = = R E A D M E . N F O = = ='),
centred('PUBLIC FILES / 2026'),border,
centred('Retro headers for your next repository'),
centred('152 styles / 13 families / text + SVG / MIT'),border,'',
'                              M A I N   I N D E X','',
index('The style catalogue','01','../../styles/INDEX.md'),
index('The finished galleries','02','../README.md'),
index('Your next first impression','03','README.md'),
index('The licence notice','04','../../LICENSE'),'',
'                                   - 01 -','',
'        THE DEMO','        ========',
'        A blank repository deserves a memorable first screen.',
'        Copy a header, change its words, and let your README make',
'        an entrance: terminal, tracker, copper, chrome, dots or paper.','',
'        FILE CREW','        ---------',
'        AREA           CONTENT                  POSITION',
'        ---------------------------------------------------------',
'        styles/        152 researched looks     reference library',
'        examples/      Markdown + SVG           finished productions',
'        tools/         build + preview          workshop',
'        LICENSE        MIT                      permission slip','',
'                                   - 02 -','',
'        Q: May I use these headers in my own repository?',
'        A: Yes. Keep the MIT notice with the copied material.','',
'        Q: Which one should I choose?',
'        A: The one that feels like the project you are making.','',
'--- CUT HERE! ---------------- CUT HERE! ---------------- CUT HERE! --------',
'        REQUEST FOR A DIFFERENT FIRST IMPRESSION',
'        Project name : __________________________________________',
'        Favourite #s : __________________________________________',
'        Desired mood : [ ] quiet  [ ] loud  [ ] nostalgic  [ ] strange',
'---------------------------------------------------------------------------'];
const content=lines.map(s=>s.includes('<a href=')?s:esc(s)).join('\n');
writeHeader(37,{summary:'A pure-text paged READ.ME with a dot-leader index, file crew, FAQ and cut-here request form.',markdown:`<pre>\n${content}\n</pre>`});
