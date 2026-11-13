// 8-bit title card: a tile-built star with a hard two-colour shadow, a shimmering palette and a blinking menu cursor.
// Pixels are 12 units (3 px at 203 × 74) on one flat navy backdrop, as a cartridge title screen would use.
import {R,G,pixels,rim,save} from './lib.mjs';
const px=12;
const star=[
 '.....#.....',
 '....###....',
 '....###....',
 '####ooo####',
 '.##ooooo##.',
 '..##ooo##..',
 '..###o###..',
 '.####.####.',
 '.###...###.',
 '.##.....##.',
];
const X=54,Y=64;
const shadow=pixels(star,{'#':'#c4473d',o:'#c4473d'},{x:X+6,y:Y+6,size:px});
const body=pixels(star,{'#':'#f2c14e',o:'#f2c14e'},{x:X,y:Y,size:px});
// Palette-cycled highlight pixels: the same cells step through three entries.
const glow=G(pixels(star,{o:'#fff4cf'},{x:X,y:Y,size:px}),'','class="cycle"');
const menu=R(84,200,96,9,'#f6f3eb')+R(84,220,64,9,'#7f95b8')
 +G(R(60,197,6,15,'#f6f3eb')+R(66,200,6,9,'#f6f3eb')+R(72,203,5,3,'#f6f3eb'),'','class="blink"');
const icon=R(20,56,200,184,'var(--tile)',`rx="18" stroke="${rim}" stroke-width="3"`)+shadow+body+glow+menu;
const css='.cycle{animation:cycle 1.2s steps(1,end) infinite}@keyframes cycle{0%{fill:#fff4cf}33%{fill:#f6d58a}66%{fill:#e8a04f}}.cycle rect{fill:inherit}.cycle{fill:#fff4cf}.blink{animation:blink 1.1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}';
save(9,{icon,css,name:'Press start',description:'A tile-built gold star with a hard red shadow sits on a navy title card above a two-line menu and a blinking cursor: the rating you give, as a cartridge title screen.',choices:['An 8-bit title-screen layout: one backdrop, chunky tile-aligned pixels, a hard drop shadow and a two-entry menu','Palette cycling makes the star’s centre shimmer without moving a pixel; no lettering is placed in the symbol'],motion:'The star’s centre cycles through three palette entries and the menu cursor blinks.'});
