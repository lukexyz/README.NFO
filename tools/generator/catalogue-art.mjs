// Copyable text companions for the independently composed local scenes.
import { short } from './svg.mjs';
const labelsFor = p => [...new Set([...p.sections,...p.languages,...p.topics])].slice(0,8);

export function renderText(style,p) {
  const name=p.name, labels=labelsFor(p), pitch=p.description||p.fullName;
  const heading=[name,'='.repeat(Math.min(76,[...name].length+8)),short(pitch,76),''];
  const rows=labels.map((label,i)=>`${String(i+1).padStart(2,'0')}  ${short(label,66)}`);
  const footer=['',p.url,`Languages: ${p.languages.join(', ')||'unlisted'} | Licence: ${p.license}`];
  let lines;
  switch(style.id) {
    case 'vap-02': lines=[...heading.map(line=>line.replace(/[!-~]/g,ch=>String.fromCharCode(ch.charCodeAt(0)+0xfee0))),...rows]; break;
    case 'asia-07': lines=[`( ^_^ )  ${name}  ( ^_^ )`,'',short(pitch,72),'',...rows.map(line=>`  > ${line}`)]; break;
    case 'hack-03': lines=[`${name.toUpperCase()}(1)                  PROJECT MANUAL`, '', 'NAME',`    ${name} - ${short(pitch,62)}`,'','CONTENTS',...rows.map(row=>'    '+row)]; break;
    case 'hack-04': lines=['-----BEGIN PROJECT NOTE-----','Unsigned decorative header.','',...heading,...rows,'','-----END PROJECT NOTE-----']; break;
    case 'hack-09': lines=[`Welcome to ${name}.`,'',short(pitch,76),'','Visible exits:',...rows.map(row=>'  '+row),'','> read documentation']; break;
    case 'trk-02': lines=[...heading,'SLOT  SAMPLE / PROJECT COMPONENT',...rows.map(row=>row.replace('  ','    ')),'','This list describes components; no audio is played.']; break;
    case 'trk-06': lines=[...heading,'CH1             CH2             CH3',...rows.map((row,i)=>`${i.toString(16).padStart(2,'0')}  ${short(row,56)}`),'','Illustrative tracker listing.']; break;
    case 'c64-04': lines=[`0 "${short(name.toUpperCase(),32)}"`,...rows.map((row,i)=>`${String(i+1).padStart(3)} "${short(row,40)}" PRG`),'','PROJECT DIRECTORY / no invented file sizes']; break;
    case 'print-03': case 'asia-05': lines=heading.map((line,i)=>`${10+i*10} REM ${line}`).concat(rows.map((row,i)=>`${100+i*10} REM ${row}`)); break;
    case 'demo-06': lines=[...heading,'PROJECT CONTENTS / NAVIGATION ORDER','----------------------------------',...rows]; break;
    case 'hack-01': case 'hack-02': case 'demo-02': lines=[`|=---[ ${name} ]${'-'.repeat(Math.max(0,54-name.length))}=|`,'',short(pitch,76),'','--[ Contents ]--',...rows,'','--[ End of header ]--']; break;
    case 'nfo-05': case 'demo-05': lines=[`+${'-'.repeat(38)}+`,`| ${short(name,36).padEnd(36)} |`,`+${'-'.repeat(38)}+`,...pitch.match(/.{1,38}(?:\s|$)|.{1,38}/g),...rows.map(row=>short(row,38))]; break;
    case 'ansi-12': lines=[...heading,'\u28ff\u28f6\u28e4\u28c0  PROJECT COMPONENTS',...rows]; break;
    case 'hack-19': lines=[...heading,'Illustrative startup sequence:','Loading project... Ok',`* ${name}`,'',...rows.map(row=>'* '+row)]; break;
    default: lines=[`+${'-'.repeat(74)}+`,...heading,...rows,`+${'-'.repeat(74)}+`];
  }
  return [...lines,...footer].join('\n')+'\n';
}
