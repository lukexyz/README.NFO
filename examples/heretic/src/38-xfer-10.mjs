import fs from 'node:fs';
import path from 'node:path';
import {DIR,R,T,write} from './lib.mjs';
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return((crc^0xffffffff)>>>0).toString(16).toUpperCase().padStart(8,'0');}
const files=['01-vap-12.svg','08-vap-04.svg','12-mach-07.svg'];
const rows=files.map(name=>({name,crc:crc32(fs.readFileSync(path.join(DIR,'assets',name)))}));
const text='; HERETIC / generated header-asset receipt\n; CRC32 values computed from actual bundled SVG bytes\n\n'+rows.map(row=>row.name.padEnd(24)+row.crc).join('\n')+'\n\nThis receipt covers header artwork, not model weights.\nPython / directional ablation / AGPL-3.0';
let body=R(25,21,910,358,'#0b0c0f','stroke="#9099a7"')+R(26,22,908,35,'#333d50')+T('HERETIC / NFO VIEWER + ASSET RECEIPT',41,47,22,'#e1e9f3')+T('ACTUAL BUNDLED HEADER CHECKSUMS',47,100,21,'#a1b7cc');
rows.forEach((row,i)=>{body+=T(row.name,47,152+i*52,23,'#e1e9f3')+T(row.crc,570,152+i*52,23,'#83d3a1')+T('CRC32',795,152+i*52,18,'#c1c8d2');});
body+=T('Artwork receipt / not model verification',47,330,19,'#a1b7cc')+T('p-e-w/heretic / Python / AGPL-3.0',47,360,16,'#687f9a');
write(38,{body,text,background:'#242a35',summary:'An SFV-style viewer displaying real CRC32 values for three bundled Heretic header assets.',choices:['Checksum columns are computed from this delivery, not invented','The viewer clearly separates artwork integrity from model verification']});
