import { svg, px, center, writeHeader } from './lib.mjs';

const dark='#081820', mid='#346856', light='#88c070', off='#e0f8d0';
const title=center('README.NFO',26,2,dark,160);
const book=`<path d="M48 60h29l3 4 3-4h29v38H84l-4 4-4-4H48z" fill="${mid}"/><path d="M51 64h25v29H51zm33 0h25v29H84z" fill="${off}"/><path d="M79 67h2v27h-2zM55 70h17v2H55zm0 6h17v2H55zm0 6h12v2H55zM88 70h17v2H88zm0 6h17v2H88zm0 6h12v2H88z" fill="${dark}"/>`;
const titleFrame=`${title}${center('RETRO HEADERS',47,1,dark,160)}${book}${center('152 STYLES / 13 FAMILIES',111,.7,dark,160)}${center('PRESS README',129,1,dark,160)}`;
const bootLogo=center('README.NFO',61,2,dark,160);
const image=svg({width:960,height:398,background:dark,
  title:'README.NFO — four-shade handheld boot',description:'An original 160-by-144 green LCD shows a dropping README.NFO wordmark, then a tiled open-book title screen. Only four shades are used.',
  defs:'<clipPath id="screen"><rect width="160" height="144"/></clipPath><pattern id="pixels" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M0 0H1M0 0V1" stroke="#e0f8d0" stroke-width=".12" stroke-opacity=".34"/></pattern>',
  css:'.boot{opacity:0;animation:boot 15s steps(1) infinite -3s}.title-card{opacity:1;animation:titlecard 15s steps(1) infinite -3s}.drop{animation:drop 15s linear infinite -3s}.ghost{opacity:.2;animation:drop 15s linear infinite -2.8s}@keyframes boot{0%,29%{opacity:1}30%,100%{opacity:0}}@keyframes titlecard{0%,29%{opacity:0}30%,100%{opacity:1}}@keyframes drop{0%{transform:translateY(-82px)}19%,100%{transform:translateY(0)}}',
  body:`<rect x="12" y="12" width="936" height="374" rx="10" fill="${mid}"/><rect x="282" y="18" width="396" height="362" rx="7" fill="${dark}"/>${px('README.NFO',34,52,3,off)}${px('POCKET ARCHIVE',34,90,1.8,light)}${px('TEXT ART',34,159,2,off)}${px('+ SVG',34,184,2,off)}${px('152 STYLES',34,260,2,off)}${px('13 FAMILIES',34,291,2,off)}${px('OPEN THE BOOK',718,61,2,off)}${px('PICK A LOOK',718,101,2,light)}${px('MAKE IT YOURS',718,141,2,light)}<g transform="translate(288 25) scale(2.4)" clip-path="url(#screen)"><rect width="160" height="144" fill="${light}"/><g class="title-card">${titleFrame}</g><g class="boot"><g class="ghost">${bootLogo}</g><g class="drop">${bootLogo}</g>${center('BOOTING THE ARCHIVE',124,.8,mid,160)}</g><rect width="160" height="144" fill="url(#pixels)"/></g><circle cx="738" cy="251" r="6" fill="${light}"/>${px('READY / MIT',718,281,2,off)}${px('160 X 144 / FOUR SHADE LCD',718,343,1.1,light)}`,
});
writeHeader(23,{image,summary:'A four-shade green 160×144 LCD: the logo drops, pauses, then opens an original tile-built book title screen.',alt:'README.NFO on an original green four-shade LCD with a dropping wordmark and an open-book title card.'});
