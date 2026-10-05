import { svg, px, center, writeHeader } from './lib.mjs';

const glyphs = ['0','1','7','A','F','R','N','+','/','<','>','#'];
const defs = glyphs.map((char, i) => `<symbol id="glyph-${i}" viewBox="0 0 5 7">${px(char,0,0,1,'currentColor')}</symbol>`).join('')
  + '<radialGradient id="quiet"><stop stop-color="#000905" stop-opacity=".97"/><stop offset=".72" stop-color="#000503" stop-opacity=".88"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><linearGradient id="cover" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000"/><stop offset=".35" stop-color="#000"/><stop offset=".48" stop-color="#000" stop-opacity=".16"/><stop offset=".50" stop-color="#000" stop-opacity="0"/><stop offset=".51" stop-color="#000"/><stop offset="1" stop-color="#000"/></linearGradient>';
let rain = '';
for(let col=0; col<48; col++) {
  const x = 8+col*20;
  let cells = '';
  for(let row=0; row<17; row++) {
    const index = (col*17+row*13+row*col)%glyphs.length;
    cells += `<use href="#glyph-${index}" x="${x}" y="${row*19-5}" width="10" height="14" color="${(col+row)%9===0?'#bdffd2':'#28d65b'}"/>`;
  }
  const duration = 9+(col*7%13)*.8;
  rain += `<g>${cells}<rect class="shade" x="${x-2}" y="-640" width="16" height="1280" fill="url(#cover)" style="animation-duration:${duration}s;animation-delay:-${col*1.37%duration}s"/></g>`;
}
const image = svg({width:960,height:324,background:'#000503',defs,
  title: 'README.NFO — digital rain',
  description: 'Independent streams of fixed phosphor glyphs light downward behind a locked README.NFO title. A green code rain header with 152 styles and thirteen families.',
  css: '.shade{animation:down 12s linear infinite}.lock{opacity:1;animation:lock 12s ease-in-out infinite}@keyframes down{from{transform:translateY(-250px)}to{transform:translateY(390px)}}@keyframes lock{0%,28%,80%,100%{opacity:1}37%,65%{opacity:.83}}',
  body: `${rain}<ellipse cx="480" cy="162" rx="410" ry="150" fill="url(#quiet)"/><g class="lock">${center('README.NFO',118,10,'#d7ffe2')}${center('152 STYLES / 13 FAMILIES',216,2,'#55eb82')}${center('MAKE YOUR FIRST IMPRESSION.',250,2,'#a1caae')}</g>`,
});
writeHeader(3, {image, summary:'Independent phosphor streams keep falling while the repository title locks into the centre.', alt:'README.NFO glows pale green in a field of slowly falling digital rain.'});
