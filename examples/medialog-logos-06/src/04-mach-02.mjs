// Kickstart insert-disk card, with a book: a white hand in a hard black outline holds up a periwinkle
// hardback whose grey metal title plate stands in for the disk shutter. Flat fills and outlines only.
import {P,L,R,G,f,poly,save} from './lib.mjs';
const K='#000022',PERI='#7a7ad2',PERI2='#5c5cb4',WHITE='#ffffff',STEEL='#b4b4c2',SLOT='#5a5a78';
const o=`stroke="${K}" stroke-width="5" stroke-linejoin="round"`;
// Book, drawn upright and then tilted.
const book=G(
 P(poly([[60,64],[168,64],[168,194],[60,194]]),WHITE,o)// page block, offset behind the cover
 +L('M158 72V186M163 74V188M66 188H160',K,2.2,'opacity=".5"')
 +P(poly([[48,52],[152,52],[152,182],[48,182]]),PERI,o)
 +R(48,52,16,130,PERI2)+L('M64 54V180',K,4)// spine edge and hinge
 +P(poly([[80,72],[134,72],[134,104],[80,104]]),STEEL,o)// metal title plate, a nod to the disk shutter
 +R(100,79,12,18,SLOT)
 +P(poly([[48,52],[152,52],[152,182],[48,182]]),'none',o),
 'rotate(-12 100 116)');
// Hand: palm and fingers sit behind the book; the thumb lies across the front of the cover.
const back=P('M150 254L132 228Q122 210 124 192L132 150L176 128L204 150Q212 166 206 184L196 206Q190 222 200 240L204 254Z',WHITE,o);
const thumb=P('M122 206Q112 196 108 182L100 160Q96 146 106 142Q116 140 122 152L136 176Q146 190 142 202',WHITE,o)
 +L('M104 152Q110 146 116 152',K,3.4);// thumbnail
const cuff=L('M146 246Q176 236 204 246',K,4);
const icon=back+book+thumb+cuff;
save(4,{icon,name:'Insert book',description:'The Kickstart insert-disk hand, white with a hard black outline, holds up a periwinkle hardback instead of a floppy; a grey metal title plate with a dark slot stands in for the disk shutter.',choices:['The 1.x insert-disk card: flat white, periwinkle and grey with one-weight black outlines','The book replaces the disk, so the old prompt becomes an invitation to log what you are reading']});
