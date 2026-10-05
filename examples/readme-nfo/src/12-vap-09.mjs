import { svg, px, writeHeader } from './lib.mjs';

const defs=`<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0863c3"/><stop offset="1" stop-color="#8ccff4"/></linearGradient>
 <linearGradient id="hill" x2="0" y2="1"><stop stop-color="#92cc24"/><stop offset="1" stop-color="#299d24"/></linearGradient>
 <linearGradient id="hill2" x2="0" y2="1"><stop stop-color="#69b82b"/><stop offset="1" stop-color="#187421"/></linearGradient>
 <linearGradient id="bar" x2="0" y2="1"><stop stop-color="#0997ff"/><stop offset=".08" stop-color="#0053ee"/><stop offset=".4" stop-color="#0050ee"/><stop offset=".88" stop-color="#0066ff"/><stop offset="1" stop-color="#003dd7"/></linearGradient>
 <linearGradient id="control" x2="0" y2="1"><stop stop-color="#9cc7ff"/><stop offset=".4" stop-color="#347afb"/><stop offset="1" stop-color="#0046cc"/></linearGradient>
 <linearGradient id="close" x2="0" y2="1"><stop stop-color="#fda184"/><stop offset=".2" stop-color="#e56e4e"/><stop offset="1" stop-color="#c5321b"/></linearGradient>
 <linearGradient id="green" x2="0" y2="1"><stop stop-color="#7ec764"/><stop offset=".4" stop-color="#299230"/><stop offset="1" stop-color="#126c1a"/></linearGradient>
 <linearGradient id="progress" x2="0" y2="1"><stop stop-color="#9add78"/><stop offset=".3" stop-color="#57b82e"/><stop offset=".7" stop-color="#45a822"/><stop offset="1" stop-color="#8acb5a"/></linearGradient>
 <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter><clipPath id="meter"><rect x="152" y="275" width="652" height="16" rx="2"/></clipPath>`;
let blocks='';for(let i=0;i<54;i++)blocks+=`<rect x="${152+i*16}" y="275" width="11" height="16" rx="1" fill="url(#progress)"/>`;
const image=svg({height:410,background:'#86c7ed',defs,
 css:'.clouds{animation:cloud 50s linear infinite alternate}.progress{animation:load 10s linear infinite}@keyframes cloud{to{transform:translateX(40px)}}@keyframes load{from{transform:translateX(-180px)}to{transform:translateX(0)}}',
 description:'An original green-hill desktop with a nostalgic blue-and-cream window for README.NFO. The library contains 152 styles across thirteen families and uses the MIT licence.',
 body:`<rect width="960" height="410" fill="url(#sky)"/>
 <g class="clouds" fill="#fff" opacity=".76" filter="url(#soft)"><ellipse cx="139" cy="55" rx="84" ry="17"/><ellipse cx="193" cy="38" rx="56" ry="22"/><ellipse cx="754" cy="38" rx="97" ry="16"/></g>
 <path d="M0 276Q197 173 441 278T960 252V410H0Z" fill="url(#hill)"/>
 <path d="M0 326Q245 280 465 326T960 301V410H0Z" fill="url(#hill2)"/>
 <rect x="96" y="69" width="774" height="276" rx="9" fill="#123250" opacity=".3"/>
 <rect x="90" y="63" width="780" height="276" rx="8" fill="#0831d9"/>
 <rect x="94" y="93" width="772" height="242" fill="#ece9d8"/>
 <path d="M98 63H862Q870 63 870 71V95H90V71Q90 63 98 63" fill="url(#bar)"/>
 <path d="M110 70h11l4 5h13v14h-28z" fill="#ffde72" stroke="#7d5917"/>
 ${px('README.NFO - HEADER LIBRARY',148,76,2,'#0f1089')}${px('README.NFO - HEADER LIBRARY',147,75,2,'#fff')}
 <rect x="784" y="69" width="22" height="22" rx="3" fill="url(#control)" stroke="#fff"/><path d="M789 85h12" stroke="#fff" stroke-width="2"/>
 <rect x="810" y="69" width="22" height="22" rx="3" fill="url(#control)" stroke="#fff"/><rect x="815" y="75" width="12" height="10" fill="none" stroke="#fff" stroke-width="2"/>
 <rect x="836" y="69" width="22" height="22" rx="3" fill="url(#close)" stroke="#fff"/><path d="m842 75 10 10m0-10-10 10" stroke="#fff" stroke-width="2"/>
 <path d="M126 132h39l11 11h40v65h-90z" fill="#cf9a27" stroke="#966513" stroke-width="2"/>
 <path d="M124 151h94l-10 60h-94z" fill="#f9d367" stroke="#bc8a2d" stroke-width="2"/>
 <path d="M130 158h75" stroke="#ffe8a6" stroke-width="3"/>
 ${px('README.NFO',248,133,6,'#132d6c')}
 ${px('YOUR NEXT REPOSITORY, IN CHARACTER.',248,190,2,'#394858')}
 <rect x="248" y="221" width="219" height="31" rx="3" fill="#fffdf4" stroke="#b7b8a6"/>
 ${px('152 STYLES',268,231,2,'#316426')}
 <rect x="479" y="221" width="219" height="31" rx="3" fill="#fffdf4" stroke="#b7b8a6"/>
 ${px('13 FAMILIES',499,231,2,'#316426')}
 <rect x="145" y="269" width="667" height="28" rx="3" fill="#fff" stroke="#789dbc"/>
 <g clip-path="url(#meter)"><g class="progress">${blocks}</g></g>
 ${px('READY TO COPY / TEXT ART + ANIMATED SVG / MIT',147,310,1.7,'#435361')}
 <rect y="371" width="960" height="39" fill="url(#bar)"/>
 <path d="M0 371H99Q115 371 118 385V410H0Z" fill="url(#green)" stroke="#185f27"/>
 ${px('OPEN',23,384,2.1,'#fff')}
 <rect x="135" y="378" width="243" height="25" rx="3" fill="#1552cf" stroke="#6298ff"/>
 ${px('README.NFO',151,386,1.8,'#fff')}
 <rect x="770" y="371" width="190" height="39" fill="#1597ee"/>
 ${px('MIT / 20 PICKS',789,386,1.7,'#fff')}
 <path d="M716 303h196q12 0 12 12v31q0 12-12 12h-42l-13 15v-15H716q-12 0-12-12v-31q0-12 12-12" fill="#ffffdc" stroke="#716f55"/>
 <circle cx="724" cy="324" r="8" fill="#2472c6"/>${px('I',721,321,1,'#fff')}
 ${px('PICK A LOOK.',741,317,1.6,'#272c3d')}${px('MAKE IT YOURS.',741,335,1.6,'#272c3d')}`
});
writeHeader(12,{image,summary:'An original hill-and-sky desktop, glossy blue window chrome and a cream header-library dialog.',alt:'README.NFO displayed in a nostalgic blue title-bar window over an original green hill.'});
