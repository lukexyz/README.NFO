// The original navy logo-plate grammar becomes a compact, stamped bookplate.
import {P,L,R,ink,paper,accent,save} from './lib.mjs';
const icon=R(28,68,183,165,'#18223a','rx="35"')+R(38,78,163,145,'none','rx="27" stroke="#74889a" stroke-width="4"')+P('M64 110Q 90 99 119 117Q147 99 176 110V186Q146 177 119 195Q 90 177 64 186Z','#f6f3eb')+L('M119 120V188','#18223a',7)+P('M148 109H162V152L155 146L148 152Z',accent);
save(14,{icon,name:'The bookplate',description:'A navy badge holding a cream open book, edged like a small stamped ownership plate.',choices:['The badge gives the diary a clear standalone app identity','One warm bookmark replaces the source’s rainbow ornament']});
