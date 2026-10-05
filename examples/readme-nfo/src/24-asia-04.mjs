import { svg, px, writeHeader } from './lib.mjs';

// Original punctuation outlines at proportional advances. No platform font,
// inherited AA mascot or forum artwork is needed to keep the joins aligned.
const glyph={
  ' ':[5,''], '　':[11,''], ' ':[4,''],
  '／':[16,'M15 1L1 17'], '＼':[16,'M1 1L15 17'],
  '￣':[16,'M0 1H16'], '＿':[16,'M0 17H16'],
  '｜':[16,'M8 0V18'], '∧':[16,'M1 15L8 3 15 15'],
  '⊂':[16,'M14 4H8Q2 4 2 9Q2 14 8 14H14'],
  '⊃':[16,'M2 4H8Q14 4 14 9Q14 14 8 14H2'],
  'ω':[15,'M1 6V11Q1 16 5 16Q8 16 8 11V9M8 11Q8 16 11 16Q14 16 14 11V6'],
  '(':[7,'M6 1Q0 9 6 17'], ')':[7,'M1 1Q7 9 1 17'],
  '＜':[16,'M14 2L2 9 14 16'], '＞':[16,'M2 2L14 9 2 16'],
  '・':[8,'M4 8h.01'], ':':[4,'M2 6h.01M2 13h.01'],
  '.':[3,'M1 16h.01'], ';':[4,'M2 6h.01M2 13L1 17'],
};
function aa(lines,x,y,scale=1){
  let output='';
  lines.forEach((line,row)=>{
    let advance=0;
    for(const char of line){const [w,d]=glyph[char]||glyph[' '];if(d)output+=`<path d="${d}" transform="translate(${advance} ${row*18})"/>`;advance+=w;}
  });
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke="#222" fill="none" stroke-width="1.2" stroke-linecap="round">${output}</g>`;
}
const balloon=aa(['　／'+'￣'.repeat(26)+'＼','＜'+'　'.repeat(38)+' '+' '+'＞','　＼'+'＿'.repeat(26)+'／'],65,76,1.6);
const friend=aa(['　　　　　　＿＿＿＿','　　　　　／　　　／｜','　　　　　｜　ω　｜｜','　　　　　｜　　　｜／','　　　⊂　｜　　　｜　⊃','　　　　　｜＿＿＿｜','　　　　　　／　＼','　　　　　(＿)　(＿)'],106,191,1.3);
const paper=aa(['＿'.repeat(21)],506,204)+aa(['＿'.repeat(21)],506,296)+aa(['｜','｜','｜','｜','｜'],498,224)+aa(['｜','｜','｜','｜','｜'],836,224);
const image=svg({width:960,height:399,background:'#f0efec',
  title:'README.NFO — anonymous AA forum post',description:'A static monochrome anonymous forum post. Original proportional punctuation outlines form a speech balloon around README.NFO and a small folded-page archivist beside a catalogue card.',
  body:`<rect x="14" y="14" width="932" height="372" fill="#faf9f5" stroke="#d0cfcb"/>${px('24 NAME: ANONYMOUS   2026/10/05   ID:NFO13',30,30,1.6,'#444')}${px('SUBJECT: A HEADER FOR EVERY BLANK README',30,51,1.4,'#777')}${balloon}${px('README.NFO',272,104,7,'#222')}${friend}${paper}${px('NFO',206,291,1.8,'#222')}${px('152 STYLES',614,235,1.9,'#222')}${px('13 FAMILIES',609,262,1.9,'#222')}${px('TEXT + SVG',614,289,1.9,'#222')}${px('THE ARCHIVE IS OPEN. TAKE A LOOK YOU LIKE.',399,195,1.4,'#333')}${px('MIT / COPY / CUSTOMISE / SHARE',495,366,1.4,'#777')}`,
});
writeHeader(24,{image,summary:'A static anonymous forum post with a proportional punctuation balloon and an original folded-page AA archivist.',alt:'Monochrome anonymous forum post: README.NFO inside an AA speech balloon, with an original folded-page figure and catalogue card.'});
