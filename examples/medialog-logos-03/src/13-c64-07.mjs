// Copper ribbons are reinterpreted as two page ribbons with one warm reverse.
import {P,L,ink,paper,accent,save} from './lib.mjs';
const icon=P('M34 88C69 74 107 86 119 122C132 85 169 74 205 88V216C166 200 133 204 119 225C103 204 70 199 34 216Z',ink)+P('M52 105C76 100 99 114 104 137V193C91 184 73 180 52 186Z',paper)+P('M136 137C143 114 165 100 189 105V186C166 180 149 184 136 193Z',paper)+P('M181 83C204 102 195 132 175 159L160 147C178 119 184 106 168 89Z',accent);
save(13,{icon,name:'Keep your place',description:'Two pages sweep like ribbons, while a warm bookmark folds over the outside edge.',choices:['The vertical ribbon reference becomes a tactile part of the diary','The folded accent suggests returning to something you loved']});
