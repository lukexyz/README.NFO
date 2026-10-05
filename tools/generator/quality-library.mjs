import { asciiLettering, lettering, paragraph, rect, escapeXml, short } from './svg.mjs';

const mono=(value,x,y,fill='#d4e0e4',size=16,extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="ui-monospace,Consolas,monospace" font-size="${size}" ${extra}>${escapeXml(value)}</text>`;

function braille(p) {
  const rows=asciiLettering(p.name).split('\n');
  const width=Math.max(...rows.map(row=>row.length)),scale=Math.min(5,820/(width*2));
  let dots='';
  for(let y=0;y<28;y++)for(let x=0;x<width*2;x++) {
    if(rows[Math.floor(y/4)]?.[Math.floor(x/2)]!=='#'||(x+y)%5===1)continue;
    dots+=`<circle cx="${x}" cy="${y}" r=".32"/>`;
  }
  let body=rect(22,22,916,356,'#080f19','rx="6" stroke="#3b7184"')
    +mono('BRAILLE / PROJECT SIGNAL',42,49,'#7294a9',13);
  body+=/^[ -~]+$/.test(p.name)?`<g transform="translate(52 70) scale(${scale})" fill="#88e0c9">${dots}</g>`
    :mono(p.name,52,118,'#88e0c9',40);
  body+=paragraph(p.description||p.fullName,52,217,{fill:'#c1cdd6',columns:80,lines:2,scale:1.8,maxWidth:854});
  const cells=[['REPOSITORY',p.fullName],['LANGUAGE',p.languages[0]||'Unlisted'],['LICENCE',p.license]];
  cells.forEach(([label,value],i)=>{
    const x=52+i*288;
    body+=`<path d="M${x} 287h268v63h-268z" fill="none" stroke="#36586a"/>`
      +mono(label,x+12,309,'#6c94a8',11)+mono(short(value,27),x+12,333,'#e4eedf',15);
  });
  for(let x=0;x<220;x++)body+=`<circle cx="${694+x}" cy="${70+Math.sin(x*.055)*18}" r=".9" fill="#f2bf78" opacity=".65"/>`;
  return {body,background:'#05090f'};
}

function startup(p) {
  let body=lettering(p.name,24,20,{fill:'#009e9e',maxWidth:905,scale:10})
    +mono(p.url,26,115,'#2585c3',18,'text-decoration="underline"')
    +mono('Loading repository metadata...',26,161,'#ececec',18)
    +mono('Ok',400,161,'#75b800',18)
    +mono(`* repository: ${p.fullName}`,26,193,'#ececec',17)
    +mono(`* languages: ${p.languages.join(', ')||'unlisted'}`,26,221,'#ececec',17)
    +mono(`* licence: ${p.license}`,26,249,'#ececec',17)
    +paragraph(p.description||p.fullName,26,285,{fill:'#ececec',columns:83,lines:2,scale:1.8,maxWidth:908})
    +mono('Project documentation:',26,340,'#ececec',17)
    +mono(short(p.sections.slice(0,4).join(' / ')||'See repository README',94),26,372,'#a5afb2',16);
  return {body,background:'#000',height:400};
}

export const qualityDesigns=[
  {id:'braille',styleId:'ansi-12',name:'Braille-dot project signal',render:braille},
  {id:'cli-startup',styleId:'hack-19',name:'Teal CLI startup banner',render:startup},
];
