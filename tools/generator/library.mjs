// Reusable compositions; catalogue references describe their visual grammar.
import { lettering as text, paragraph, rect, svg, short } from './svg.mjs';
const title = (p,x,y,o={}) => text(p.name,x,y,{scale:8,...o});
const pitch = (p,x,y,o={}) => paragraph(p.description||p.fullName,x,y,o);
const labels = p => [...new Set([...p.languages,...p.topics,...p.sections])];
const facts = p => `${p.languages[0]||'UNLISTED'} / ${p.license}`;

function floppy(p) {
  let body='';
  for(let i=2;i>=0;i--) {
    const x=48+i*22,y=43+i*15;
    body+=rect(x,y,355,300,['#244e75','#59714b','#6b5175'][i],'rx="12" stroke="#a8a6a0" stroke-width="2"');
    if(i===0) body+=rect(x+48,y,259,91,'#c6c3ac')+rect(x+191,y+13,56,65,'#313b3d')+rect(x+29,y+125,297,133,'#f2e8c9','rx="4"')+title(p,x+43,y+143,{scale:4.5,maxWidth:270,fill:'#223a40'})+text(short(p.owner,24),x+43,y+194,{scale:1.6,maxWidth:266,fill:'#63716b'})+text(short(p.languages.join(' / '),26),x+43,y+227,{scale:1.5,maxWidth:266,fill:'#63716b'})+rect(x+27,y+273,23,16,'#192c35');
  }
  body+=text('PROJECT / ARCHIVE LABEL',475,59,{scale:1.7,fill:'#acb8ae'})+title(p,475,107,{scale:6,maxWidth:439,fill:'#f7ebc5'})+pitch(p,475,179,{columns:39,lines:4,scale:1.8,maxWidth:440,fill:'#c6cec0'})+text(p.fullName,475,308,{scale:1.6,maxWidth:439,fill:'#aac6d0'})+text(facts(p),475,346,{scale:1.4,maxWidth:439,fill:'#acb8ae'});
  return {body,background:'#17252a'};
}

function paper(p) {
  let body=rect(26,20,908,360,'#f1edda','stroke="#bebea8"');
  for(let y=41;y<380;y+=41)body+=rect(62,y,836,21,'#dce4c8');
  for(let y=39;y<380;y+=25)for(const x of [42,918])body+=`<circle cx="${x}" cy="${y}" r="5" fill="#566760"/>`;
  body+=text('REPOSITORY LISTING / TRACTOR FEED',86,47,{scale:1.7,fill:'#557363'})+title(p,86,107,{scale:9,maxWidth:784,fill:'#29473b'})+pitch(p,86,208,{columns:73,lines:3,scale:1.8,maxWidth:784,fill:'#426554'})+text(p.fullName,86,307,{scale:1.8,maxWidth:784,fill:'#29473b'})+text(facts(p),86,350,{scale:1.5,maxWidth:784,fill:'#557363'});
  return {body,background:'#566760'};
}

function phone(p) {
  let body=rect(74,16,280,373,'#203441','rx="42" stroke="#567080" stroke-width="3"')+rect(101,54,225,219,'#adbb78','rx="8" stroke="#121c1a" stroke-width="6"');
  body+=text('PROJECT',119,75,{scale:1.6,fill:'#243728'})+title(p,119,121,{scale:5,maxWidth:190,fill:'#243728'})+text(short(p.languages[0]||p.owner,17),119,195,{scale:1.8,maxWidth:190,fill:'#243728'})+rect(155,239,113,15,'#364530');
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)body+=rect(112+col*72,294+row*26,55,17,'#607b83','rx="8"')+text(String(1+row*3+col),133+col*72,299+row*26,{scale:1,fill:'#e3e6cc'});
  body+=text('POCKET REPOSITORY',405,53,{scale:2,fill:'#a8c496'})+title(p,405,111,{scale:7,maxWidth:505,fill:'#e5edc8'})+pitch(p,405,195,{columns:43,lines:4,scale:1.8,maxWidth:505,fill:'#b2c7b7'})+text(p.fullName,405,314,{scale:1.7,maxWidth:505,fill:'#a8c496'})+text(facts(p),405,353,{scale:1.4,maxWidth:505,fill:'#b2c7b7'});
  return {body,background:'#142321'};
}

function dmd(p) {
  let body=rect(25,44,910,310,'#100907','rx="16" stroke="#613521" stroke-width="5"');
  for(let y=62;y<337;y+=9)for(let x=45;x<921;x+=9)body+=`<circle cx="${x}" cy="${y}" r="2.2" fill="#412016"/>`;
  body+=text('PROJECT / DOT MATRIX',480,81,{center:true,scale:2,fill:'#ee9b45'})+title(p,480,141,{center:true,scale:10,maxWidth:833,fill:'#ffc576'})+text(p.fullName,480,252,{center:true,scale:2,maxWidth:833,fill:'#f4a050'})+text(short(p.description||facts(p),78),480,307,{center:true,scale:1.65,maxWidth:833,fill:'#ee9b45'});
  return {body,background:'#29201b'};
}

function chrome(p) {
  let body='<path d="M0 232H960V400H0Z" fill="#151324"/>';
  for(let row=0;row<7;row++)for(let col=0;col<14;col++)if((row+col)%2)body+=`<path d="M${col*90-150+row*8} ${244+row*23}h${94-row*3}l18 24h-${103-row*3}z" fill="#746c94" opacity=".6"/>`;
  for(const [cx,cy,r] of [[169,134,78],[771,152,61],[651,288,36]])body+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#metal)" stroke="#b4bacc" stroke-width="2"/>`;
  body+=rect(247,67,485,216,'#101725','fill-opacity=".94" stroke="#6c7d9c" rx="9"')+title(p,480,108,{center:true,scale:8,maxWidth:441,fill:'#f6e9cf'})+pitch(p,269,180,{columns:39,lines:3,scale:1.7,maxWidth:442,fill:'#b5c2d4'})+text(facts(p),480,257,{center:true,scale:1.5,maxWidth:442,fill:'#b5c2d4'})+text(p.fullName,40,369,{scale:1.8,maxWidth:880,fill:'#e8dce9'});
  return {body,background:'#080d1b',defs:'<radialGradient id="metal" cx=".32" cy=".25"><stop stop-color="#fff"/><stop offset=".28" stop-color="#c9dce8"/><stop offset=".55" stop-color="#47617b"/><stop offset=".7" stop-color="#182137"/><stop offset=".84" stop-color="#9fb3c9"/><stop offset="1" stop-color="#384254"/></radialGradient>'};
}

function commander(p) {
  let body=rect(22,22,916,354,'#0829a7','stroke="#b6d5ed" stroke-width="2"')+title(p,41,42,{scale:4,maxWidth:870,fill:'#fff8b3'});
  for(let col=0;col<2;col++) {
    const x=38+col*451;
    body+=rect(x,97,435,231,'#063091','stroke="#b6d5ed"')+text(col?'DOCUMENTATION':'LANGUAGES',x+17,113,{scale:2,fill:'#b5d2df'});
    const rows=col?p.sections:p.languages;
    rows.slice(0,7).forEach((label,i)=>{body+=rect(x+7,148+i*23,421,20,i===0?'#307c9d':'#063091')+text(label,x+17,154+i*23,{scale:1.65,maxWidth:400,fill:i===0?'#f9f3cb':'#b5d2df'});});
  }
  body+=text(p.fullName,42,344,{scale:1.7,maxWidth:871,fill:'#f9f3cb'});
  return {body,background:'#071b67'};
}

function gameboy(p) {
  let body=rect(94,16,774,370,'#c7c4b2','rx="30" stroke="#8d8e80" stroke-width="3"')+rect(124,43,713,298,'#364844','rx="16"')+rect(157,69,647,238,'#a7b957','stroke="#112d26" stroke-width="3"');
  body+=title(p,480,113,{center:true,scale:8.5,maxWidth:590,fill:'#253d28'})+text(p.fullName,480,204,{center:true,scale:1.7,maxWidth:590,fill:'#425834'})+text(short(p.description||facts(p),63),480,256,{center:true,scale:1.55,maxWidth:590,fill:'#425834'})+text('REPOSITORY / FOUR-SHADE LCD',157,355,{scale:1.6,maxWidth:638,fill:'#354743'});
  return {body,background:'#566253'};
}

function mac(p) {
  let body='';
  for(let y=0;y<400;y+=8)for(let x=0;x<960;x+=8)body+=rect(x,y,2,2,'#8d958d');
  body+=rect(0,0,960,29,'#f2f1dc')+text(`${p.name}  FILE  EDIT  VIEW`,25,9,{scale:1.55,maxWidth:903,fill:'#18251d'})+rect(94,66,781,274,'#15241a')+rect(88,60,781,274,'#f2f1dc','stroke="#18251d" stroke-width="2"');
  for(let y=67;y<91;y+=4)body+=rect(102,y,752,1,'#18251d');
  body+=rect(351,65,255,26,'#f2f1dc')+text(p.fullName,480,73,{center:true,scale:1.4,maxWidth:245,fill:'#18251d'})+title(p,121,113,{scale:7,maxWidth:718,fill:'#18251d'})+pitch(p,121,187,{columns:63,lines:3,scale:1.8,maxWidth:718,fill:'#374637'})+text(facts(p),121,294,{scale:1.6,maxWidth:718,fill:'#18251d'});
  return {body,background:'#c4c9b5'};
}

function memphis(p) {
  let body='';
  const colors=['#e8829b','#85cac7','#f2d178','#829fe1'];
  for(let i=0;i<16;i++){const x=(i*173+31)%960,y=(i*89+29)%400;body+=i%2?`<circle cx="${x}" cy="${y}" r="${13+i%4*8}" fill="none" stroke="${colors[i%4]}" stroke-width="9"/>`:`<path d="m${x} ${y} 19-17 18 26 21-16" fill="none" stroke="${colors[i%4]}" stroke-width="7"/>`;}
  body+=rect(73,80,828,254,'#273849')+rect(61,67,828,254,'#fff1d2','stroke="#273849" stroke-width="3"')+title(p,91,99,{scale:8,maxWidth:765,fill:'#273849'})+pitch(p,91,181,{columns:66,lines:3,scale:1.8,maxWidth:765,fill:'#596473'})+text(p.fullName,91,280,{scale:1.8,maxWidth:765,fill:'#596473'});
  return {body,background:'#f1bcae'};
}

function pencil(p) {
  let body=rect(25,24,909,353,'#eee9d8');
  for(let y=60;y<360;y+=23)body+=rect(43,y,869,1,'#c4d0c8');
  body+=rect(83,24,1,353,'#d4aaa1');
  for(let i=0;i<7;i++) {const x=132+i%3*70,y=102+Math.floor(i/3)*79;body+=`<circle cx="${x}" cy="${y}" r="17" fill="#eee9d8" stroke="#586961" stroke-width="2"/><path d="M${x+17} ${y}l49 ${i%2?47:-26}" stroke="#586961" fill="none" stroke-width="1.5"/>`;}
  body+=title(p,357,98,{scale:7,maxWidth:525,fill:'#344d42'})+pitch(p,357,179,{columns:45,lines:4,scale:1.8,maxWidth:525,fill:'#637066'})+text(p.fullName,357,313,{scale:1.65,maxWidth:525,fill:'#344d42'})+text('ILLUSTRATIVE PROJECT GRAPH',110,349,{scale:1.3,maxWidth:772,fill:'#637066'});
  return {body,background:'#61746a'};
}

function player(p) {
  let body=rect(30,34,366,318,'#28324d','stroke="#808ca4" stroke-width="3"')+rect(43,47,340,89,'#111928')+title(p,56,62,{scale:4,maxWidth:314,fill:'#b8e581'})+text('ILLUSTRATIVE PLAYER',56,108,{scale:1.3,maxWidth:314,fill:'#79989b'});
  for(let i=0;i<22;i++)body+=rect(54+i*14,198-(i%6)*6,8,23+(i%6)*6,'#afd970');
  body+=rect(43,238,340,101,'#10192b');
  labels(p).slice(0,4).forEach((label,i)=>{body+=text(`${i+1}. ${short(label,26)}`,55,250+i*21,{scale:1.5,maxWidth:315,fill:'#9ecc88'});});
  body+=title(p,435,66,{scale:7,maxWidth:484,fill:'#e0e6cf'})+pitch(p,435,160,{columns:42,lines:4,scale:1.8,maxWidth:484,fill:'#a8bdba'})+text(p.fullName,435,282,{scale:1.6,maxWidth:484,fill:'#afd970'})+text(facts(p),435,329,{scale:1.4,maxWidth:484,fill:'#a8bdba'});
  return {body,background:'#161e32'};
}

function bios(p) {
  let body=rect(22,21,916,356,'#071d86','stroke="#aabacf" stroke-width="3"')+text('REPOSITORY SETUP UTILITY',480,42,{center:true,scale:2.3,fill:'#cdd8e8'})+rect(36,77,888,29,'#537faa')+text('PROJECT   LANGUAGES   DOCUMENTATION',52,86,{scale:1.8,maxWidth:852,fill:'#f3f0cc'})+title(p,53,143,{scale:7,maxWidth:854,fill:'#f3f0cc'})+pitch(p,53,220,{columns:75,lines:3,scale:1.8,maxWidth:854,fill:'#c0cce4'})+text(p.fullName,53,316,{scale:1.7,maxWidth:854,fill:'#f3f0cc'})+text(facts(p),53,355,{scale:1.5,maxWidth:854,fill:'#c0cce4'});
  return {body,background:'#051549'};
}

export const additionalDesigns = [
  {id:'floppy',styleId:'print-01',name:'Swapper’s floppy',render:floppy},
  {id:'printout',styleId:'print-04',name:'Tractor-feed printout',render:paper},
  {id:'phone',styleId:'mach-13',name:'Pocket LCD',render:phone},
  {id:'dot-matrix',styleId:'mach-11',name:'Pinball dot matrix',render:dmd},
  {id:'chrome',styleId:'pc-03',name:'Chrome and checkerboard',render:chrome},
  {id:'commander',styleId:'mach-03',name:'Twin-panel commander',render:commander},
  {id:'gameboy',styleId:'mach-07',name:'Four-shade boot screen',render:gameboy},
  {id:'mac',styleId:'vap-11',name:'One-bit desktop',render:mac},
  {id:'memphis',styleId:'vap-17',name:'Memphis laminate',render:memphis},
  {id:'pencil',styleId:'pc-09',name:'Pencil notebook',render:pencil},
  {id:'player',styleId:'trk-11',name:'Classic player stack',render:player},
  {id:'bios',styleId:'pc-11',name:'Firmware setup',render:bios},
];
