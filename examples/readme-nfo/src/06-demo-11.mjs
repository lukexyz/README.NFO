import { svg, px, center, writeHeader } from './lib.mjs';

const colours = ['#ff9800', '#00fa32', '#f343ff', '#347bff', '#ffffff'];
const title = [...'README.NFO'].map((letter, index) => px(letter, 156 + index * 66, 122, 11, colours[index % colours.length])).join('');
let blocks = '';
for (let row = 0; row < 4; row++) for (let column = 0; column < 12; column++) {
  blocks += `<rect x="${66 + column * 14}" y="${58 + row * 14}" width="14" height="14" fill="${colours[(row + column) % 4]}"/>`;
  blocks += `<rect x="${726 + column * 14}" y="${58 + row * 14}" width="14" height="14" fill="${colours[(row + column + 2) % 4]}"/>`;
}
const image = svg({ height: 448, background: '#000000', title: 'README.NFO — six-colour title screen',
  description: 'An original black title screen with green, violet, orange and blue block panels, a multicolour README.NFO title and centred forty-column credits.',
  body: `<g shape-rendering="crispEdges">
    <rect x="42" y="28" width="876" height="386" fill="none" stroke="#347bff" stroke-width="7"/>
    <path d="M42 28H252V42H56V210H42ZM918 414H708V400H904V232H918Z" fill="#ff9800"/>
    ${blocks}${center('PRESENTS', 70, 4, '#ffffff')}
    ${px('README.NFO', 157, 122, 11, '#f343ff', 'opacity=".42"')}${title}
    <rect x="70" y="218" width="820" height="7" fill="#00fa32"/>
    <rect x="70" y="232" width="820" height="7" fill="#f343ff"/>
    ${center('RETRO HEADERS FOR YOUR REPOSITORY', 265, 3, '#ffffff')}
    ${center('152 STYLES / 13 FAMILIES', 304, 3, '#00fa32')}
    ${center('WRITTEN IN TEXT + SVG', 343, 3, '#ff9800')}
    ${center('DISTRIBUTED UNDER MIT', 378, 2, '#ffffff')}
    <rect x="70" y="432" width="820" height="2" fill="#303039"/>
  </g>` });
const lines = [
  'PRESENTS', '', 'README.NFO', '',
  'RETRO HEADERS FOR YOUR REPOSITORY',
  '152 STYLES / 13 FAMILIES', '',
  'WRITTEN IN TEXT + SVG',
  'DISTRIBUTED UNDER MIT', '',
  'THANKS TO THE OPEN SOURCE COMMUNITY',
].map((line) => line.padStart(Math.floor((40 + line.length) / 2), ' ').padEnd(40, ' '));
const markdown = `<p align="center"><img src="assets/06-demo-11.svg" width="100%" alt="README.NFO in an original six-colour block title screen"></p>\n\n<pre>\n${lines.join('\n')}\n</pre>\n\n[Browse the styles](../../styles/INDEX.md) · [Example galleries](../README.md) · [MIT licence](../../LICENSE)`;
writeHeader(6, { image, markdown, summary: 'Six-colour title panels with a narrow, forty-column companion credit screen.' });
