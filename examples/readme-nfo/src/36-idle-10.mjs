import {svg,px,center,writeHeader} from './lib.mjs';
const colours=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];
let bars='',grid='',border='',steps='',spokes='';
for(let i=0;i<7;i++)bars+=`<rect x="${i*960/7}" y="35" width="${960/7+1}" height="273" fill="${colours[i]}"/><rect x="${i*960/7}" y="308" width="${960/7+1}" height="32" fill="${['#0000c0','#131313','#c000c0','#131313','#00c0c0','#131313','#c0c0c0'][i]}"/>`;
bars+='<path d="M0 340h165v78H0z" fill="#001536"/><path d="M165 340h165v78H165z" fill="#fff"/><path d="M330 340h165v78H330z" fill="#37113d"/><path d="M690 340h28v78h-28z" fill="#0d0d0d"/><path d="M718 340h28v78h-28z" fill="#151515"/><path d="M746 340h28v78h-28z" fill="#202020"/>';
for(let x=0;x<=960;x+=48)grid+=`<path d="M${x} 35v383"/>`;
for(let y=35;y<=418;y+=24)grid+=`<path d="M0 ${y}h960"/>`;
for(let i=0;i<40;i++)border+=`<rect x="${i*24}" y="35" width="24" height="12" fill="${i%2?'#fff':'#000'}"/><rect x="${i*24}" y="406" width="24" height="12" fill="${i%2?'#000':'#fff'}"/>`;
for(let i=0;i<12;i++){const v=Math.round(255*i/11);steps+=`<rect x="${288+i*32}" y="275" width="32" height="48" fill="rgb(${v} ${v} ${v})"/>`;}
for(let i=0;i<48;i++){const a=i*Math.PI/24;spokes+=`<path d="M480 155L${480+96*Math.cos(a)} ${155+96*Math.sin(a)}" stroke="${i%2?'#000':'#fff'}" stroke-width="3"/>`;}
const ident='<rect x="195" y="206" width="570" height="66" fill="#060606"/>'+center('README.NFO',221,5,'#f5f5e9');
const test=`<rect y="35" width="960" height="383" fill="#979797"/><g fill="none" stroke="#d0d0d0">${grid}</g>${border}<circle cx="480" cy="226" r="183" fill="#eaeaea" stroke="#000" stroke-width="3"/><g clip-path="url(#cardCircle)">${spokes}${colours.map((c,i)=>`<rect x="${280+i*57}" y="170" width="57" height="36" fill="${c}"/>`).join('')}${steps}<g stroke="#111" stroke-width="2"><path d="M310 350h340M340 340v52m35-52v52m35-52v52m35-52v52m35-52v52m35-52v52m35-52v52m35-52v52m35-52v52"/></g></g>${ident}`;
const image=svg({height:452,background:'#101010',defs:'<clipPath id="cardCircle"><circle cx="480" cy="226" r="182"/></clipPath>',css:'.card{opacity:1;animation:card 24s steps(1) infinite}.bars{opacity:0;animation:bars 24s steps(1) infinite}.hop{animation:hop 24s steps(1) infinite}@keyframes card{0%,49%{opacity:1}50%,99%{opacity:0}100%{opacity:1}}@keyframes bars{0%,49%{opacity:0}50%,99%{opacity:1}100%{opacity:0}}@keyframes hop{0%,24%{transform:translate(0,0)}25%,49%{transform:translate(612px,0)}50%,74%{transform:translate(612px,330px)}75%,99%{transform:translate(0,330px)}}',title:'README.NFO — off-air test card',description:'An original circle-and-grid broadcast card alternates slowly with seven colour bars. README.NFO stays on the ident plate while a blue NO SIGNAL box hops around the frame.',body:
px('PUBLIC FILES / HEADER SERVICE',22,12,1.8,'#ecece3')+px('152 STYLES / 13 FAMILIES / MIT',616,12,1.6,'#a0a0a0')+
`<g class="card">${test}</g><g class="bars">${bars}${ident}</g><g class="hop"><rect x="22" y="58" width="278" height="37" fill="#0a2a82"/>${px('NO SIGNAL / TRY A STYLE',37,69,1.8,'#fff')}</g>`+
center('THIS SPACE RESERVED FOR YOUR NEXT FIRST IMPRESSION',430,1.6,'#b9b9b9')});
writeHeader(36,{image,summary:'An original off-air circle test card, seven colour bars and a slow-hopping NO SIGNAL box.'});
