// A four-part geometric quilt: algorithmic tiling becomes a woven collection mark.
import {P,ink,soft,accent,save} from './lib.mjs';
const icon=P('M33 78H114V112H67V159H33Z',ink)+P('M126 78H207V159H173V112H126Z',soft)+P('M33 171H67V217H114V251H33Z',soft)+P('M173 171H207V251H126V217H173Z',ink)+P('M81 127H159V203H81Z',ink)+P('M100 143L143 165L100 187Z',accent);
save(12,{icon:`<g transform="translate(0 -17)">${icon}</g>`,name:'Woven together',description:'Four interlocking corners surround a small play-shaped centre. Separate experiences become a single collection.',choices:['The nested-square reference becomes a bold woven emblem','Broad alternating planes preserve the pattern without pixel noise or character art']});
