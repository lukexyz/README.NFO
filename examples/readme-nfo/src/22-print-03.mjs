import { esc, writeHeader } from './lib.mjs';

const listing=[
  '10 PRINT "{CLR}{RVS}README.NFO{OFF}"',
  '20 REM RETRO HEADERS FOR YOUR REPOSITORY',
  '30 REM TYPE IT IN. MAKE IT YOURS.',
  '40 READ STYLES,FAMILIES',
  '50 PRINT STYLES;" STYLES TO EXPLORE"',
  '60 PRINT FAMILIES;" FAMILIES OF FIRST LOOKS"',
  '70 PRINT "TEXT ART + SVG / MIT LICENCE"',
  '80 PRINT "1 CATALOGUE  2 GALLERIES  3 TOOLS"',
  '90 INPUT "CHOOSE A SECTION";N',
  '100 IF N=1 THEN GOSUB 1000',
  '110 IF N=2 THEN GOSUB 1100',
  '120 IF N=3 THEN GOSUB 1200',
  '130 GOTO 80',
  '200 DATA 152,13,2026,10,5,0',
  '1000 PRINT "STYLES/INDEX.MD":RETURN',
  '1100 PRINT "EXAMPLES/README.MD":RETURN',
  '1200 PRINT "NPM RUN PREVIEW":RETURN',
];
const checksum=(line)=>[...line].reduce((sum,char)=>(sum+char.charCodeAt(0))&255,0);
const rows=listing.map(line=>`${line.padEnd(45)} :REM ${String(checksum(line)).padStart(3)}`);
const text=[
  '+------------------------------------------------------------------+',
  '| README.NFO                                         TYPE-IN DESK |',
  '| Program 1: A first impression                         ISSUE 013 |',
  '+------------------------------------------------------------------+',
  '',
  'Enter the listing below. Replace brace tokens with the matching',
  'screen keys on your chosen BASIC system. Keep your favourite style.',
  '',
  ...rows,
  '',
  'CHECK COLUMN: sum the ASCII bytes BEFORE the :REM, modulo 256.',
  'Exclude the padding spaces. Checksums describe this printed listing;',
  'brace tokens are counted literally, before keyboard substitution.',
  '',
  '                     COPY / CUSTOMISE / SHARE',
  '                    README.NFO  -  OCTOBER 2026',
].join('\n');
writeHeader(22,{markdown:`<pre>\n${esc(text)}\n</pre>\n\n[Catalogue](../../styles/INDEX.md) · [Galleries](../README.md) · [MIT licence](../../LICENSE)`,summary:'A magazine BASIC type-in page with original code, brace tokens and genuinely computed ASCII-sum checksums.'});
