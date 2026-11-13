// An orbital line connects a compact open diary to one other point.
import {P,L,C,ink,paper,blue,accent,save} from './lib.mjs';
const icon=L('M40 170C-2 122 158 53 203 102C238 143 78 221 40 170Z',blue,8)+P('M64 108Q91 94 119 117Q148 94 177 108V183Q148 169 119 191Q89 169 64 183Z',ink)+L('M119 121V181',paper,6)+L('M77 126L103 132M136 132L162 126',paper,5)+C(205,107,13,accent)+P('M161 187L181 196L166 202Z',ink);
save(4,{icon,name:'In your orbit',description:'An open diary sits inside one calm orbital line. A single warm point suggests someone else entering the conversation.',choices:['The orbit is a connection around a diary rather than a planet','Chrome and techno lettering are removed in favour of navy, line and space']});
