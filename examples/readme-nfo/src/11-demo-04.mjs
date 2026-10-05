import { svg, px, center, writeHeader } from './lib.mjs';

// A literal XOR field on an 8-pixel grid, using the sixteen EGA/VGA colours.
const palette = ['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa',
  '#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
let field = '';
for (let y=0;y<32;y++) for(let x=0;x<32;x++) {
  const index=(x^y)&15;
  field += `<rect x="${x*8}" y="${y*8}" width="8" height="8" fill="${palette[index]}"/>`;
}
const image=svg({height:320,background:'#000000',
  defs:`<pattern id="xor" width="256" height="256" patternUnits="userSpaceOnUse">${field}</pattern><clipPath id="frame"><rect width="960" height="320"/></clipPath>`,
  css:'.field{animation:travel 28s linear infinite}@keyframes travel{to{transform:translate(-256px,-256px)}}',
  description:'A low-resolution VGA XOR texture drifts behind a large outlined README.NFO title. Original geometric pattern; 152 styles in thirteen families.',
  body:`<g clip-path="url(#frame)"><rect class="field" x="0" y="0" width="1216" height="576" fill="url(#xor)" opacity=".63"/></g>
    ${center('README.NFO',115,11,'#000000',960,'stroke="#000" stroke-width=".8" stroke-linejoin="miter"')}
    ${center('README.NFO',111,11,'#ffffff',960,'stroke="#000" stroke-width=".18" stroke-linejoin="miter"')}
    <rect x="24" y="25" width="247" height="28" fill="#000"/>
    ${px('X XOR Y / MODE 13H',35,33,1.8,'#fff')}
    <rect x="24" y="268" width="379" height="28" fill="#000"/>
    ${px('152 STYLES / 13 FAMILIES / MIT',35,276,2,'#55ffff')}
    <rect x="711" y="268" width="225" height="28" fill="#000"/>
    ${px('TEXT + SVG HEADERS',722,276,2,'#ffff55')}`
});
writeHeader(11,{image,summary:'A tiny-intro XOR quilt in the sixteen VGA colours, with a crisp block title and slow pixel-grid drift.',alt:'README.NFO in white pixel capitals over an animated multicoloured VGA XOR texture.'});
