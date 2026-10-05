import {svg,px,center,writeHeader} from './lib.mjs';
let lines='';for(let y=68;y<94;y+=4)lines+=`<path d="M105 ${y}h718"/>`;
const folder=(x,y,label)=>`<path d="M${x} ${y+10}h18v-7h21v7h28v44h-67z" fill="#fff" stroke="#000" stroke-width="3"/><path d="M${x} ${y+16}h67" stroke="#000"/><rect x="${x-7}" y="${y+62}" width="${label.length*8.4+8}" height="16" fill="#fff"/>${px(label,x-3,y+66,1.4,'#000')}`;
const image=svg({height:456,background:'#fff',defs:'<pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#000"/></pattern><pattern id="stripes" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h4" stroke="#000"/></pattern>',title:'README.NFO — one-bit desktop',description:'An original black-and-white desktop with checkerboard dither, pinstripe title bar, folded document icon, folder icons, menu choices and a repository information window.',body:
'<rect width="960" height="456" fill="url(#dither)"/><rect x="0" y="0" width="960" height="34" fill="#fff" stroke="#000" stroke-width="2"/>'+px('R',14,9,2,'#000')+px('FILE   STYLES   EXAMPLES   TOOLS',54,9,2,'#000')+
'<path d="M105 65h738v300H105z" fill="#000"/><rect x="98" y="58" width="738" height="300" fill="#fff" stroke="#000" stroke-width="3"/>'+
`<g stroke="#000" stroke-width="1">${lines}</g><rect x="115" y="69" width="15" height="15" fill="#fff" stroke="#000" stroke-width="2"/><rect x="319" y="63" width="300" height="28" fill="#fff"/>`+center('README.NFO',70,2.8,'#000',938)+
'<path d="M99 97h737M806 97v261" stroke="#000" stroke-width="2"/><rect x="809" y="127" width="24" height="172" fill="url(#dither)"/><path d="M808 98h26v27h-26zM808 301h26v26h-26zM810 167h22v54h-22z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M815 117l6-10 6 10zM815 309l6 10 6-10z" fill="#000"/>'+
'<path d="M127 123h60l22 22v70h-82zM187 123v22h22" fill="#fff" stroke="#000" stroke-width="3"/><path d="M141 162h54m-54 12h54m-54 12h42" stroke="#000" stroke-width="3"/>'+px('README.NFO',246,132,5,'#000')+
px('A HEADER LIBRARY FOR YOUR NEXT REPOSITORY.',246,187,1.8,'#000')+px('152 STYLES / 13 FAMILIES / TEXT + SVG',127,242,2,'#000')+
'<rect x="130" y="287" width="270" height="44" rx="10" fill="#fff" stroke="#000" stroke-width="4"/><rect x="136" y="293" width="258" height="32" rx="7" fill="none" stroke="#000" stroke-width="1"/>'+px('CHOOSE A LOOK',170,302,2.4,'#000')+
'<rect x="432" y="289" width="335" height="40" rx="8" fill="#fff" stroke="#000" stroke-width="2"/>'+px('COPY / CUSTOMISE / MIT',450,302,2.4,'#000')+
folder(41,365,'STYLES')+folder(813,365,'EXAMPLES')});
writeHeader(39,{image,summary:'Two colours, checker dither, pinstripe chrome and an original document window: a quiet one-bit desktop.'});
