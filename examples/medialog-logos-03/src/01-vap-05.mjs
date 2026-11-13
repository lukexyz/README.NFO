// Outrun horizon geometry translated into an open-book sunrise; brand palette overrides neon.
import {P,L,C,ink,paper,accent,save} from './lib.mjs';
const icon=C(121,116,53,accent)+P('M30 122Q73 106 119 133Q162 106 209 122V207Q163 189 119 216Q75 189 30 207Z',ink)+P('M43 137Q79 126 110 146V194Q77 178 43 190Z',paper)+P('M129 146Q164 126 196 137V190Q163 178 129 194Z',paper)+L('M63 151L94 157M146 157L178 151',ink,6)+L('M66 175L94 180M146 180L176 175',ink,6);
save(1,{icon,name:'The next chapter',description:'An open book becomes a small horizon, with a warm sun rising behind its pages.',choices:['The receding landscape becomes the fold of a diary','One quiet ochre sun replaces the neon palette; the name stays plain']});
