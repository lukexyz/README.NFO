// Twelve separate compositions, personalised with the target repository's actual data.
// These portable templates complement the larger catalogue of hand-drawn examples.
import { createHash } from 'node:crypto';
import { lettering as text, paragraph, rect, svg, short } from './svg.mjs';
import { additionalDesigns } from './library.mjs';
import { qualityDesigns } from './quality-library.mjs';
import { catalogue, supportsFormat, formatsFor } from './catalogue.mjs';
import { renderText } from './catalogue-art.mjs';

const title = (p, x, y, options = {}) => text(p.name, x, y, { scale: 8, ...options });
const pitch = (p, x, y, options = {}) => paragraph(p.description || p.fullName, x, y, options);
const stars = p => p.stars === null ? 'STARS N/A' : `${p.stars.toLocaleString('en-US')} STARS`;
const language = p => p.languages[0] || 'CODE';
const facts = p => `${short(language(p), 20)} / ${stars(p)} / ${short(p.license, 20)}`;
const items = p => [...new Set([...p.languages, ...p.topics, ...p.sections, p.owner, p.repo])].slice(0, 8);
const line = (x1, y1, x2, y2, stroke, extra = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" ${extra}/>`;

function tracker(p) {
  const colors = ['#59e7a4', '#75bfff', '#ffbc65', '#e0a1ff', '#ff869f'];
  const labels = items(p), hash = createHash('sha256').update(p.fullName).digest();
  let body = title(p, 30, 25, { scale: 4.4, maxWidth: 605 }) + text(stars(p), 685, 30, { scale: 1.8, maxWidth: 245, fill: '#80a4ba' });
  body += text(p.fullName, 30, 66, { scale: 1.7, maxWidth: 900, fill: '#75bfff' });
  body += rect(24, 105, 135, 216, '#0c1420', 'stroke="#34425b"') + text('ORDER', 38, 120, { scale: 2, fill: '#90a3bf' });
  for (let row = 0; row < 8; row++) body += text(`${String(row).padStart(2, '0')} ${row === 3 ? '>>' : '  '} ${short(labels[row] || p.repo, 10)}`, 38, 152 + row * 19, { scale: 1.25, maxWidth: 109, fill: row === 3 ? '#fff' : '#6a80a2' });
  for (let col = 0; col < 5; col++) {
    const x = 175 + col * 150, color = colors[col];
    body += rect(x, 105, 137, 216, '#101c2b', `stroke="${color}" stroke-opacity=".6"`) + text(short(labels[col] || p.repo, 15), x + 10, 119, { scale: 1.4, maxWidth: 116, fill: color });
    for (let row = 0; row < 9; row++) {
      if (row === 3) body += rect(x + 2, 199, 133, 19, color, 'opacity=".17" class="playhead"');
      const notes = ['C-', 'D#', 'F-', 'G-', 'A#'];
      const value = hash[(row + col * 3) % hash.length];
      body += text(`${String(row).padStart(2, '0')} ${notes[value % 5]}${2 + value % 4} ${value.toString(16).padStart(2, '0')}`, x + 10, 145 + row * 19, { scale: 1.35, maxWidth: 115, fill: row % 3 === 0 ? color : '#55718f' });
    }
    body += `<polyline points="${Array.from({ length: 27 }, (_, i) => `${x + 4 + i * 5},${344 + Math.sin(i * .8 + col) * 12}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2" class="scope" style="animation-delay:-${col}s"/>`;
  }
  body += text(facts(p), 30, 376, { scale: 1.7, maxWidth: 900, fill: '#aab7ce' });
  return { body, css: '.scope{animation:scope 2s ease-in-out infinite alternate}.playhead{animation:beat 1s steps(2) infinite}@keyframes scope{to{transform:translateY(3px)}}@keyframes beat{to{opacity:.32}}' };
}

function cassette(p) {
  let body = text('SIDE A / PUBLIC REPOSITORY', 36, 24, { scale: 1.6, fill: '#334447' });
  body += rect(35, 73, 433, 260, '#222b30', 'rx="24" stroke="#53646a" stroke-width="3"') + rect(52, 90, 399, 122, '#e6dfc5', 'rx="12"');
  body += title(p, 74, 113, { scale: 5, maxWidth: 351, fill: '#20312b' }) + text(short(p.owner, 27), 76, 168, { scale: 1.8, maxWidth: 340, fill: '#4c6359' });
  body += rect(52, 194, 399, 13, '#de753b') + rect(103, 224, 299, 62, '#111b20', 'rx="28" stroke="#758181"');
  for (const cx of [139, 369]) {
    body += `<circle cx="${cx}" cy="255" r="26" fill="#ddd9c4"/><circle cx="${cx}" cy="255" r="14" fill="#111b20"/><g class="reel" style="transform-origin:${cx}px 255px">`;
    for (let spoke = 0; spoke < 6; spoke++) body += `<path d="M${cx} 236v8" stroke="#ddd9c4" stroke-width="5" transform="rotate(${spoke * 60} ${cx} 255)"/>`;
    body += '</g>';
  }
  body += '<path d="M156 301h188l27 24H129z" fill="#121d21" stroke="#68716b"/>';
  body += rect(501, 42, 423, 302, '#fff7db', 'stroke="#b8a988" stroke-width="2"') + rect(501, 42, 35, 302, '#327fa3');
  body += title(p, 558, 62, { scale: 4, maxWidth: 343, fill: '#2f423a' });
  body += pitch(p, 558, 107, { columns: 33, lines: 3, scale: 1.5, maxWidth: 340, fill: '#5f6959', lineHeight: 19 });
  body += line(558, 173, 898, 173, '#9b9c7d');
  items(p).slice(0, 5).forEach((item, index) => { body += text(`${String(index + 1).padStart(2, '0')}  ${short(item, 30)}`, 558, 192 + index * 26, { scale: 1.65, maxWidth: 340, fill: '#3a5148' }); });
  body += text(facts(p), 36, 367, { scale: 1.75, maxWidth: 890, fill: '#455b53' });
  return { body, background: '#d8d1b4', css: '.reel{animation:reel 12s linear infinite}@keyframes reel{to{transform:rotate(360deg)}}' };
}

function offair(p) {
  const colors = ['#eee8d2', '#edd66a', '#78c8cc', '#76b975', '#ca86b5', '#c95754', '#5183b2'];
  let body = rect(20, 20, 920, 360, '#d9d9ce');
  for (let x = 20; x <= 940; x += 40) body += line(x, 20, x, 380, '#282d2e', 'stroke-opacity=".32"');
  for (let y = 20; y <= 380; y += 40) body += line(20, y, 940, y, '#282d2e', 'stroke-opacity=".32"');
  body += '<circle cx="480" cy="200" r="172" fill="#edead6" stroke="#182324" stroke-width="4"/><g clip-path="url(#disc)">';
  colors.forEach((color, index) => { body += rect(308 + index * 49, 53, 50, 130, color); });
  body += rect(308, 276, 344, 92, '#262d32');
  for (let i = 0; i < 12; i++) body += rect(308 + i * 29, 304, 29, 37, i % 2 ? '#ddd9cd' : '#1a1b21');
  body += '</g>' + rect(74, 150, 812, 108, '#111e27', 'stroke="#efe8cf" stroke-width="3"');
  body += title(p, 480, 165, { scale: 7, center: true, maxWidth: 753, fill: '#fff3c7' });
  body += text(p.fullName, 480, 228, { scale: 1.7, center: true, maxWidth: 740, fill: '#a2c4b7' });
  body += rect(60, 26, 840, 25, '#182b2b') + text(facts(p), 480, 33, { scale: 1.45, center: true, maxWidth: 817, fill: '#edeaca' });
  body += rect(60, 347, 840, 32, '#182b2b') + text(short(p.description || p.fullName, 82), 480, 358, { scale: 1.5, center: true, maxWidth: 805, fill: '#edeaca' });
  return { body, background: '#182124', defs: '<clipPath id="disc"><circle cx="480" cy="200" r="170"/></clipPath>' };
}

function copper(p) {
  let body = '';
  const colors = ['#ee62be', '#fe904f', '#50ddeb'];
  for (let band = 0; band < 3; band++) {
    body += `<g class="ribbon" style="animation-delay:-${band * 3}s">`;
    for (let row = 0; row < 20; row++) {
      const y = 64 + band * 89 + row * 3;
      body += `<path d="M-20 ${y}Q210 ${y - 52} 455 ${y + 9}T980 ${y - 12}" stroke="${colors[band]}" stroke-width="3" fill="none" opacity="${.2 + Math.sin((row + 1) / 21 * Math.PI) * .7}"/>`;
    }
    body += '</g>';
  }
  body += rect(27, 105, 906, 162, '#080b18', 'rx="6" fill-opacity=".88" stroke="#616079"');
  body += text(p.fullName, 480, 125, { center: true, scale: 1.8, maxWidth: 830, fill: '#84d2de' });
  body += title(p, 484, 159, { center: true, scale: 9, maxWidth: 835, fill: '#3e345e' }) + title(p, 480, 154, { center: true, scale: 9, maxWidth: 835, fill: '#fff3de' });
  body += text(facts(p), 480, 241, { center: true, scale: 1.8, maxWidth: 830, fill: '#dea4d8' });
  body += pitch(p, 80, 333, { columns: 74, lines: 2, scale: 1.8, maxWidth: 800, fill: '#d1c8e4' });
  return { body, background: '#060712', css: '.ribbon{animation:wave 7s ease-in-out infinite alternate}@keyframes wave{to{transform:translateY(13px)}}' };
}

function desktop(p) {
  let body = rect(0, 0, 960, 400, 'url(#sky)') + '<path d="M0 274Q180 175 428 279T960 245V400H0Z" fill="#74b834"/><path d="M0 330Q300 259 530 330T960 282V400H0Z" fill="#409834"/>';
  body += '<g fill="#fff" opacity=".72"><ellipse cx="157" cy="42" rx="82" ry="15"/><ellipse cx="209" cy="32" rx="44" ry="19"/><ellipse cx="780" cy="42" rx="90" ry="13"/></g>';
  body += rect(85, 71, 796, 268, '#235149', 'rx="9" opacity=".3"') + rect(78, 64, 796, 267, '#0642c3', 'rx="8"') + rect(82, 97, 788, 230, '#ece9d8');
  body += rect(83, 68, 786, 29, 'url(#bar)', 'rx="5"') + text(`${p.name} - PROJECT`, 97, 77, { scale: 1.8, maxWidth: 681 });
  body += rect(837, 71, 27, 23, '#d75943', 'rx="3" stroke="#fff"') + text('X', 846, 77, { scale: 1.4 });
  body += '<path d="M116 146h37l11 11h38v59h-86z" fill="#c99934"/><path d="M112 162h94l-11 58h-88z" fill="#f5d372" stroke="#b48c32"/>';
  body += title(p, 238, 136, { scale: 6.5, maxWidth: 595, fill: '#203a69' }) + pitch(p, 238, 201, { columns: 54, lines: 2, scale: 1.7, maxWidth: 589, fill: '#505c65' });
  body += rect(116, 265, 715, 22, '#fff', 'stroke="#94a6b6" rx="3"');
  for (let i = 0; i < 40; i++) body += rect(122 + i * 17.5, 270, 12, 12, '#69b745', 'rx="1"');
  body += text(facts(p), 116, 303, { scale: 1.6, maxWidth: 715, fill: '#476244' });
  body += rect(0, 365, 960, 35, 'url(#bar)') + rect(0, 365, 111, 35, '#28963f', 'rx="6"') + text('START', 18, 377, { scale: 2 });
  body += text(p.fullName, 135, 378, { scale: 1.65, maxWidth: 790 });
  return { body, background: '#8ebee3', defs: '<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0874c5"/><stop offset="1" stop-color="#a9d5eb"/></linearGradient><linearGradient id="bar" x2="0" y2="1"><stop stop-color="#4598ff"/><stop offset=".5" stop-color="#115bec"/><stop offset="1" stop-color="#073cbf"/></linearGradient>' };
}

function vectors(p) {
  let body = rect(35, 33, 890, 334, '#0c1622', 'rx="12" stroke="#304352"');
  for (let y = 100; y < 344; y += 30) body += line(50, y, 378, y, '#19303c');
  for (let x = 65; x < 371; x += 30) body += line(x, 75, x, 345, '#19303c');
  body += '<g class="object" style="transform-origin:212px 190px"><path d="M212 74 331 164 266 292 118 268 82 133Z" fill="#69e1c6" fill-opacity=".12" stroke="#72eccb" stroke-width="2"/><path d="M212 74 178 179 331 164 248 224 266 292 178 179 118 268 248 224 82 133 178 179Z" fill="none" stroke="#72eccb" stroke-width="1.5"/><path d="M82 133 331 164M212 74 266 292M118 268 331 164" stroke="#a787f7" stroke-opacity=".65"/></g>';
  body += '<ellipse cx="212" cy="190" rx="153" ry="58" fill="none" stroke="#9481cc" transform="rotate(-27 212 190)"/><circle cx="351" cy="121" r="7" fill="#f8a5cf"/>';
  body += text('REPOSITORY / VECTOR OBJECT', 421, 64, { scale: 1.6, maxWidth: 467, fill: '#6ce4c4' }) + title(p, 421, 113, { scale: 6, maxWidth: 461 });
  body += pitch(p, 421, 181, { columns: 41, lines: 4, scale: 1.8, maxWidth: 465, fill: '#a5bace' });
  body += line(421, 286, 887, 286, '#304854') + text(short(p.fullName, 47), 421, 304, { scale: 1.65, maxWidth: 465, fill: '#a787f7' });
  body += text(facts(p), 421, 339, { scale: 1.3, maxWidth: 465, fill: '#7caaa9' });
  return { body, css: '.object{animation:turn 16s ease-in-out infinite alternate}@keyframes turn{to{transform:rotate(8deg)}}' };
}

function terminal(p) {
  let body = rect(24, 23, 912, 354, '#061b13', 'rx="11" stroke="#358b60" stroke-width="2"');
  body += rect(25, 24, 910, 34, '#0e3927', 'rx="10"') + text(p.fullName, 44, 35, { scale: 1.65, maxWidth: 866, fill: '#85c69f' });
  body += text('> OPEN REPOSITORY', 45, 84, { scale: 1.8, fill: '#70b593' }) + title(p, 45, 124, { scale: 8.5, maxWidth: 864, fill: '#c1ffbe' });
  body += pitch(p, 45, 211, { columns: 74, lines: 3, scale: 1.8, fill: '#a4d8b6', maxWidth: 864 });
  body += text(`LANGUAGES: ${short(p.languages.join(' / ') || 'UNLISTED', 60)}`, 45, 293, { scale: 1.6, maxWidth: 864, fill: '#64b391' });
  body += text(`${stars(p)} / ${p.forks === null ? 'FORKS N/A' : `${p.forks} FORKS`} / ${p.license}`, 45, 331, { scale: 1.6, maxWidth: 831, fill: '#64b391' }) + rect(889, 329, 13, 16, '#c1ffbe', 'class="cursor"');
  return { body, background: '#020b08', css: '.cursor{animation:blink 1.3s steps(2) infinite}@keyframes blink{to{opacity:.25}}' };
}

function bbs(p) {
  let body = rect(22, 24, 916, 351, '#15142d', 'stroke="#7e67ac" stroke-width="3"');
  body += text('PUBLIC ACCESS / REPOSITORY BOARD', 480, 40, { center: true, scale: 1.8, fill: '#e1b86d', maxWidth: 860 });
  body += line(38, 71, 922, 71, '#66588c') + title(p, 480, 101, { center: true, scale: 8, maxWidth: 830, fill: '#aa9ef0' });
  body += text(p.fullName, 480, 174, { center: true, scale: 1.8, maxWidth: 830, fill: '#6fe0ce' });
  body += line(38, 211, 922, 211, '#66588c') + pitch(p, 51, 232, { columns: 76, lines: 3, scale: 1.8, maxWidth: 850, fill: '#d0c7e6' });
  body += rect(38, 327, 884, 30, '#282044') + text(facts(p), 51, 336, { scale: 1.6, maxWidth: 857, fill: '#e1b86d' });
  for (const x of [22, 924]) for (const y of [24, 361]) body += rect(x, y, 14, 14, '#e0b77a');
  return { body, background: '#080915' };
}

function radar(p) {
  let body = '';
  for (const radius of [38, 76, 114, 152]) body += `<circle cx="215" cy="200" r="${radius}" fill="none" stroke="#225b48"/>`;
  body += line(40, 200, 390, 200, '#225b48') + line(215, 30, 215, 370, '#225b48');
  body += '<g class="sweep" style="transform-origin:215px 200px"><path d="M215 200 215 48A152 152 0 0 1 367 200Z" fill="url(#sweep)"/><path d="M215 200V48" stroke="#89ffc0" stroke-width="2"/></g>';
  const hash = createHash('sha256').update(p.fullName).digest();
  for (let i = 0; i < 7; i++) {
    const angle = hash[i] / 256 * Math.PI * 2, radius = 45 + hash[i + 7] / 256 * 93;
    body += `<circle cx="${215 + Math.cos(angle) * radius}" cy="${200 + Math.sin(angle) * radius}" r="${3 + i % 3}" fill="#befdd7"/>`;
  }
  body += text('PROJECT SIGNAL', 423, 47, { scale: 2, fill: '#8acbb0' }) + title(p, 423, 98, { scale: 6.5, maxWidth: 502, fill: '#d3ffe4' });
  body += pitch(p, 423, 179, { columns: 43, lines: 4, scale: 1.8, maxWidth: 502, fill: '#87bca6' });
  body += line(423, 281, 916, 281, '#225b48') + text(p.fullName, 423, 304, { scale: 1.65, maxWidth: 502, fill: '#b1eaca' }) + text(facts(p), 423, 344, { scale: 1.35, maxWidth: 502, fill: '#87bca6' });
  return { body, background: '#041911', defs: '<linearGradient id="sweep"><stop stop-color="#7fffa0" stop-opacity=".25"/><stop offset="1" stop-color="#7fffa0" stop-opacity="0"/></linearGradient>', css: '.sweep{animation:radar 9s linear infinite}@keyframes radar{to{transform:rotate(360deg)}}' };
}

function neon(p) {
  let body = '<circle cx="480" cy="130" r="95" fill="url(#sun)"/>';
  for (let y = 121; y < 223; y += 12) body += rect(377, y, 206, 5, '#17152e');
  body += '<path d="M0 259 134 149 218 225 328 177 467 272 598 191 728 229 847 158 960 264V400H0Z" fill="#0e0d21" stroke="#7b4897"/>';
  for (let y = 281; y < 400; y += 20) body += line(0, y, 960, y, '#95499a', 'stroke-opacity=".6"');
  for (let x = -800; x < 1800; x += 150) body += line(480, 258, x, 400, '#95499a', 'stroke-opacity=".6"');
  body += rect(39, 99, 882, 181, '#141026', 'fill-opacity=".85" rx="8" stroke="#ee83c5"');
  body += text(p.fullName, 480, 119, { center: true, scale: 1.75, maxWidth: 830, fill: '#9ee8e5' }) + title(p, 484, 162, { center: true, scale: 8, maxWidth: 820, fill: '#995389' }) + title(p, 480, 157, { center: true, scale: 8, maxWidth: 820, fill: '#ffdfec' });
  body += text(facts(p), 480, 250, { center: true, scale: 1.7, maxWidth: 820, fill: '#9ee8e5' });
  body += rect(54, 324, 852, 52, '#100d22', 'fill-opacity=".9"') + pitch(p, 76, 337, { columns: 76, lines: 2, scale: 1.6, maxWidth: 805, fill: '#e6bfd9', lineHeight: 19 });
  return { body, background: '#17152e', defs: '<linearGradient id="sun" x2="0" y2="1"><stop stop-color="#ffd78a"/><stop offset="1" stop-color="#fb649d"/></linearGradient>' };
}

function starfield(p) {
  const hash = createHash('sha256').update(p.fullName).digest();
  let body = '<ellipse cx="710" cy="195" rx="222" ry="136" fill="#433370" opacity=".22"/>';
  for (let i = 0; i < 74; i++) {
    const x = (hash[i % 32] * 17 + i * 113) % 960, y = (hash[(i + 11) % 32] * 7 + i * 31) % 400;
    body += `<circle cx="${x}" cy="${y}" r="${i % 7 === 0 ? 2 : 1}" fill="${i % 3 ? '#9cbbd0' : '#f4dfba'}" opacity="${.25 + i % 4 * .17}"/>`;
  }
  body += '<circle cx="783" cy="111" r="58" fill="url(#planet)"/><ellipse cx="783" cy="111" rx="92" ry="20" fill="none" stroke="#f2c8a0" stroke-width="5" opacity=".7" transform="rotate(-23 783 111)"/>';
  body += text('TRANSMISSION / GITHUB', 45, 44, { scale: 1.8, maxWidth: 603, fill: '#a6dbe6' }) + title(p, 45, 105, { scale: 8, maxWidth: 619, fill: '#fff0d2' });
  body += pitch(p, 45, 213, { columns: 63, lines: 3, scale: 1.8, maxWidth: 753, fill: '#c3c4e0' });
  body += line(45, 312, 915, 312, '#53667a') + text(p.fullName, 45, 337, { scale: 1.7, maxWidth: 500, fill: '#a6dbe6' }) + text(facts(p), 556, 337, { scale: 1.4, maxWidth: 357, fill: '#edba97' });
  return { body, background: '#080e21', defs: '<linearGradient id="planet"><stop stop-color="#f2cba8"/><stop offset=".6" stop-color="#966783"/><stop offset="1" stop-color="#2b294d"/></linearGradient>' };
}

function zine(p) {
  let body = rect(25, 24, 911, 353, '#f2eed9', 'stroke="#232b2c" stroke-width="2"');
  body += rect(44, 44, 376, 309, '#ff7350') + text('PROJECT / INDEPENDENT RELEASE', 438, 47, { scale: 1.45, maxWidth: 468, fill: '#303b35' });
  body += '<path d="M76 285 110 79 304 62 388 244 251 328Z" fill="#222f2b"/><path d="M99 269 132 101 287 86 360 236 245 303Z" fill="none" stroke="#f9dc83" stroke-width="2"/>';
  body += text([...p.name].slice(0, 3).join(''), 228, 152, { center: true, scale: 14, maxWidth: 215, fill: '#f8eab4' }) + text(short(language(p), 21), 228, 246, { center: true, scale: 1.8, maxWidth: 253, fill: '#f8eab4' });
  body += title(p, 438, 100, { scale: 6, maxWidth: 467, fill: '#232d29' }) + pitch(p, 438, 167, { columns: 42, lines: 4, scale: 1.65, maxWidth: 467, fill: '#495047' });
  body += line(438, 263, 906, 263, '#74765d') + text(p.fullName, 438, 287, { scale: 1.5, maxWidth: 467, fill: '#414b40' });
  body += text(facts(p), 438, 328, { scale: 1.35, maxWidth: 467, fill: '#414b40' });
  return { body, background: '#c7cbbd' };
}

export const presetStyleIds = {tracker:'trk-07',cassette:'print-02','off-air':'idle-10',copper:'c64-07',desktop:'vap-09',vector:'pc-13',terminal:'hack-05',bbs:'ansi-05',radar:'hack-13',neon:'vap-05',starfield:'idle-05',zine:'nfo-03',...Object.fromEntries([...additionalDesigns,...qualityDesigns].map(design=>[design.id,design.styleId]))};
export const presets = Object.freeze([
  { id: 'tracker', name: 'Multi-chip tracker', render: tracker },
  { id: 'cassette', name: 'Cassette and J-card', render: cassette },
  { id: 'off-air', name: 'Off-air test card', render: offair },
  { id: 'copper', name: 'Copper ribbons', render: copper },
  { id: 'desktop', name: 'Luna desktop', render: desktop },
  { id: 'vector', name: 'Vector objects', render: vectors },
  { id: 'terminal', name: 'Phosphor terminal', render: terminal },
  { id: 'bbs', name: 'Bulletin board', render: bbs },
  { id: 'radar', name: 'Radar signal', render: radar },
  { id: 'neon', name: 'Neon horizon', render: neon },
  { id: 'starfield', name: 'Deep-space transmission', render: starfield },
  { id: 'zine', name: 'Independent zine', render: zine },
  ...additionalDesigns,
  ...qualityDesigns,
].map(design=>({...design,styleId:design.styleId||presetStyleIds[design.id]})));

// A catalogue entry is a design brief, not an implemented renderer. Only these
// independently composed scenes are eligible for standalone generation.
export const designs = Object.freeze(presets.map(preset => {
  const style=catalogue.find(style=>style.id===preset.styleId);
  if(!style)throw new Error(`Unknown preset style: ${preset.styleId}`);
  return {...style,...preset,id:style.id,formats:formatsFor(style)};
}));
export const renderTextHeader = (design, project) => renderText(design, project);

export function renderDesign(design, project) {
  return svg(project, design.name, design.render(project));
}

export function selectDesigns(count, seed, { format = 'all', exclude = [], styles } = {}) {
  const excluded = new Set(exclude.map(id => presetStyleIds[id] || presets.find(preset => preset.id === id)?.styleId || id));
  const result = designs.filter(design => supportsFormat(design, format) && !excluded.has(design.id));
  if (!Number.isInteger(count) || count < 1 || count > result.length) throw new Error(`Choose 1–${result.length} headers for the selected format and exclusions.`);
  if (styles) {
    if (styles.length !== count || new Set(styles).size !== count) throw new Error('Saved selection must contain the requested number of distinct styles.');
    return styles.map(id => {
      const design = result.find(candidate => candidate.id === id);
      if (!design) throw new Error(`Unavailable saved style: ${id}`);
      return design;
    });
  }
  let block = 0;
  // Reproducible Fisher–Yates selection, with rejection sampling to avoid modulo bias.
  const random = maximum => {
    const bound = Math.floor(0x100000000 / maximum) * maximum;
    let value;
    do { value = createHash('sha256').update(`${seed}\0${block++}`).digest().readUInt32BE(0); } while (value >= bound);
    return value % maximum;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1); [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, count);
}
