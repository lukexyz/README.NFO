// The personal-web guestbook becomes a real book-shaped conversation.
import {P,L,ink,paper,accent,save} from './lib.mjs';
const icon=P('M32 90Q77 76 119 101Q161 76 206 90V193Q169 184 141 199L115 226V207Q76 181 32 195Z',ink)+P('M45 104Q77 95 109 114V185Q79 168 45 178Z',paper)+P('M128 114Q159 95 192 104V178Q157 168 128 185Z',paper)+P('M154 100H171V150L162 142L154 150Z',accent)+L('M62 128L91 137M62 152L85 160',ink,6);
save(5,{icon,name:'The shared journal',description:'A guestbook becomes a conversation bubble, with a warm bookmark tucked into the right page.',choices:['The speech tail makes the diary feel shared','The personal-web reference comes through its guestbook idea, with all interface clutter removed']});
