// Flat vector fills and strong plotted contours become a welcoming open journal.
import {P,L,R,ink,paper,accent,save} from './lib.mjs';
const icon=P('M35 101Q76 79 119 112Q160 79 202 101L213 206Q161 185 119 214Q76 185 25 206Z',paper,`stroke="${ink}" stroke-width="10" stroke-linejoin="round"`)+L('M119 115V212M49 119L92 137M49 146L87 162M148 134L184 120',ink,8)+P('M156 80L172 76L181 115L169 109L163 121Z',accent)+L('M39 221Q 80 205 119 229Q158 205 200 221',ink,8);
save(10,{icon,name:'Open invitation',description:'A generous open journal with gently fanned pages and a small fabric bookmark.',choices:['Strong plotted outlines keep the book friendly and legible','A slightly asymmetric bookmark gives the simple navy drawing a personal touch']});
