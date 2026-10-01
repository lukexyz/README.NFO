// PGP clearsigned message header for the Castaway README (style catalogue entry hack-04:
// "PGP clearsigned message block (cypherpunk list post)").
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/76-clearsigned-message_opus_5.5.mjs
// It rewrites examples/castaway/76-clearsigned-message_opus_5.5.md. Edit this file, not that one.
//
// THE STYLE
// The cleartext signature framework of OpenPGP (RFC 4880, section 7): a "-----BEGIN PGP SIGNED
// MESSAGE-----" line, a "Hash:" armor header, exactly one blank line, the text itself with every
// line that starts with a hyphen dash-escaped as "- -", then an ASCII-armoured signature block:
// optional Comment: headers, a blank line, a rectangle of base64 64 characters wide, a short
// last line, the "=" CRC-24 checksum line and the END delimiter. The zine-footer variant (a
// "PUBLIC KEY BLOCK", a taller base64 rectangle) closes the README in a <details> block. The
// letter closes the way a 1990s list manifesto does: a name, an address and a date on three
// lines. The delimiter format is an open standard; nothing is copied from any real post, key or
// signature.
//
// NOTHING HERE IS FAKE
// The catalogue's caveat is that a made-up signature block misleads people into trusting it, so
// this one is real: every byte of the armour is built here, from scratch, as OpenPGP v4 packets
// (an Ed25519 key, algorithm 22; a canonical-text signature, type 0x01, over SHA-256), and the
// message verifies with stock GnuPG (checked with GnuPG 2.4.9 on 2026-10-01):
//   gpg --import README.md
//   sed -n '/^-----BEGIN PGP SIGNED/,/^-----END/p' README.md | gpg --verify
// (Plain `gpg --verify README.md` says Good signature too, then trips over the key block.)
// The key, though, is a DEMO key, and says so in its own user ID: its secret half is the SHA-256
// of the sentence in KEY_PHRASE below (printed in the README too), so anyone can sign as "Palm
// Notary". The signature therefore proves only that not one byte of
// the text has changed, and nothing about who wrote it. The README says exactly that.
// To sign the same letter with a real key instead (no logo, then: gpg cannot do that part):
//   node examples/castaway/src/76-clearsigned-message_opus_5.5.mjs --body | gpg --clearsign
//
// THE PICTURES INSIDE THE BASE64
// Base64 is an alphabet of letters, digits, "+" and "/", and four characters always encode three
// bytes. So any 64-character line made of that alphabet is the encoding of some 48 bytes. The
// generator draws a picture out of base64 characters (the CASTAWAY logo for the signature, the
// palm's portrait for the key), decodes it to bytes, and stores those bytes in a notation
// subpacket (type 20) in the HASHED area of the signature, padded so the bytes land on a line
// boundary of the armour. When the packet is armoured again, the picture comes back out, line
// for line, inside a real, verifying signature. The pictures are signed too: change one "M" in
// the logo and the block stops verifying (the armour's CRC-24 notices first; fix that up and
// the signature fails instead).
//
// Everything is new and invented: the Palm Notary (the demo key's name), the notation domain
// one-palm.invalid (.invalid is reserved and never resolves), the letter, the logo font and the
// palm. Castaway is Luke's own project; the jokes are about it and nothing else.
//
// The build refuses to write anything if a body line is over 70 columns, has trailing spaces or
// a character outside printable 7-bit ASCII, if any armour line is not where the picture put it,
// or if the signature does not verify under Node's own Ed25519 check.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '76-clearsigned-message_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// 0. Fixed inputs. Same inputs, same bytes, every run.
// ---------------------------------------------------------------------------------------------
const KEY_PHRASE = 'Castaway demo key. The palm notary signs anything. Seed 1992. Trust nobody.';
const USER_ID = 'Palm Notary (demo key)';
const NOTATION_DOMAIN = 'one-palm.invalid';
const KEY_TIME = Date.UTC(2026, 9, 1, 0, 0, 0) / 1000; // 1 Oct 2026, 00:00:00 UTC
const SIG_TIME = Date.UTC(2026, 9, 1, 10, 0, 0) / 1000; // 1 Oct 2026, 10:00:00 UTC (a Thursday)
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LINE = 64; // base64 characters per armour line (GnuPG's width; the spec allows 76)
const LINE_BYTES = (LINE / 4) * 3; // 48 bytes per armour line

// ---------------------------------------------------------------------------------------------
// 1. Byte helpers and OpenPGP framing
// ---------------------------------------------------------------------------------------------
const sha256 = (...parts) => crypto.createHash('sha256').update(Buffer.concat(parts)).digest();
const sha1 = (...parts) => crypto.createHash('sha1').update(Buffer.concat(parts)).digest();
const u8 = (...n) => Buffer.from(n);
const u16 = (n) => u8((n >> 8) & 255, n & 255);
const u32 = (n) => u8((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);

// A deterministic byte stream (SHA-256 in counter mode) for the filler around the pictures.
function byteStream(label) {
  let counter = 0;
  let pool = Buffer.alloc(0);
  return (n) => {
    while (pool.length < n) pool = Buffer.concat([pool, sha256(Buffer.from(`${label}#${counter++}`))]);
    const out = pool.subarray(0, n);
    pool = pool.subarray(n);
    return Buffer.from(out);
  };
}

// RFC 4880 4.2.2 new-format lengths (also used, minus the tag, for subpacket lengths).
function lengthOctets(len) {
  if (len < 192) return u8(len);
  if (len < 8384) return u8(((len - 192) >> 8) + 192, (len - 192) & 255);
  return Buffer.concat([u8(255), u32(len)]);
}
const packet = (tag, body) => Buffer.concat([u8(0xc0 | tag), lengthOctets(body.length), body]);
const subpacket = (type, data) => Buffer.concat([lengthOctets(data.length + 1), u8(type), data]);

// Multiprecision integer: bit count, then the big-endian bytes without leading zeros.
function mpi(bytes) {
  let i = 0;
  while (i < bytes.length - 1 && bytes[i] === 0) i++;
  const b = bytes.subarray(i);
  const bits = (b.length - 1) * 8 + (b[0] === 0 ? 0 : 32 - Math.clz32(b[0]));
  return Buffer.concat([u16(bits), b]);
}

// Notation data (5.2.3.16): 4 flag octets (all zero: not human-readable), name and value lengths.
const notation = (name, value) =>
  subpacket(20, Buffer.concat([u8(0, 0, 0, 0), u16(name.length), u16(value.length), Buffer.from(name), value]));

// ASCII armour body: base64 at 64 a line, then "=" and the base64 of the CRC-24.
function crc24(bytes) {
  let crc = 0xb704ce;
  for (const b of bytes) {
    crc ^= b << 16;
    for (let i = 0; i < 8; i++) {
      crc <<= 1;
      if (crc & 0x1000000) crc ^= 0x1864cfb;
    }
  }
  return crc & 0xffffff;
}
function armour(bytes) {
  const b64 = bytes.toString('base64');
  const rows = [];
  for (let i = 0; i < b64.length; i += LINE) rows.push(b64.slice(i, i + LINE));
  const c = crc24(bytes);
  rows.push('=' + u8((c >> 16) & 255, (c >> 8) & 255, c & 255).toString('base64'));
  return rows;
}

// ---------------------------------------------------------------------------------------------
// 2. The demo key: Ed25519 from a public sentence (so: not a secret, by design)
// ---------------------------------------------------------------------------------------------
const seed = sha256(Buffer.from(KEY_PHRASE));
const privateKey = crypto.createPrivateKey({
  key: Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), seed]),
  format: 'der',
  type: 'pkcs8',
});
const publicKey = crypto.createPublicKey(privateKey);
const rawPublic = Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url');
const ED25519_OID = Buffer.from('2b06010401da470f01', 'hex'); // 1.3.6.1.4.1.11591.15.1
const keyBody = Buffer.concat([
  u8(4), u32(KEY_TIME), u8(22), u8(ED25519_OID.length), ED25519_OID, mpi(Buffer.concat([u8(0x40), rawPublic])),
]);
const keyHashPrefix = Buffer.concat([u8(0x99), u16(keyBody.length), keyBody]);
const fingerprint = sha1(keyHashPrefix);
const keyId = fingerprint.subarray(12);
const FPR = fingerprint.toString('hex').toUpperCase();

// A v4 signature packet whose hashed area carries `value` in a notation named `name`.
// `hashedPrefix` is what is hashed before the signature fields (the text, or the key + user ID).
function signature({ type, hashedPrefix, extraHashed = [], name, value }) {
  const hashedSub = Buffer.concat([
    subpacket(2, u32(SIG_TIME)),
    ...extraHashed,
    notation(name, value),
  ]);
  const head = Buffer.concat([u8(4, type, 22, 8), u16(hashedSub.length), hashedSub]);
  const digest = sha256(hashedPrefix, head, u8(4, 0xff), u32(head.length));
  const sig = crypto.sign(null, digest, privateKey);
  if (!crypto.verify(null, digest, publicKey, sig)) throw new Error('Ed25519 self-check failed');
  // Issuer fingerprint and key ID go in the unhashed area (allowed, and gpg finds the key by
  // either), which keeps the hashed area short enough for the picture to start on armour line 2.
  const unhashed = Buffer.concat([subpacket(33, Buffer.concat([u8(4), fingerprint])), subpacket(16, keyId)]);
  const full = Buffer.concat([
    head, u16(unhashed.length), unhashed, digest.subarray(0, 2), mpi(sig.subarray(0, 32)), mpi(sig.subarray(32)),
  ]);
  // Where the notation value sits inside the packet body (for the picture alignment).
  const valueAt = 4 + 2 + hashedSub.length - value.length;
  return { full, valueAt };
}

// Build a signature whose notation holds `picture` (rows of 64 base64 characters), padded with
// filler so the picture starts exactly at the beginning of an armour line. `before` is how many
// bytes of armoured data precede this signature packet (the key and user ID, for the key block).
function pictureSignature({ before, picture, fillerLabel, ...rest }) {
  for (const row of picture) {
    if (row.length !== LINE || [...row].some((ch) => !B64.includes(ch)))
      throw new Error(`picture row is not ${LINE} base64 characters: ${row}`);
  }
  const art = Buffer.from(picture.join(''), 'base64');
  const filler = byteStream(fillerLabel);
  let pad = 0;
  for (let tries = 0; tries < 10; tries++) {
    const value = Buffer.concat([Buffer.alloc(pad), art]);
    const trial = signature({ ...rest, value });
    const header = lengthOctets(trial.full.length).length + 1;
    const offset = before + header + trial.valueAt;
    const need = (LINE_BYTES - (offset % LINE_BYTES)) % LINE_BYTES;
    if (need === pad) {
      const real = signature({ ...rest, value: Buffer.concat([filler(pad), art]) });
      return { packet: packet(2, real.full), firstRow: (offset + pad) / LINE_BYTES };
    }
    pad = need;
  }
  throw new Error('picture alignment did not settle');
}

// ---------------------------------------------------------------------------------------------
// 3. The pictures, drawn in base64
// ---------------------------------------------------------------------------------------------
// A bold capital font on a 14 x 5 character grid (verticals 3 characters wide, which on GitHub's
// code font is about as wide as one row is tall).
const FONT = {
  C: ['..############', '###...........', '###...........', '###...........', '..############'],
  A: ['..##########..', '###........###', '##############', '###........###', '###........###'],
  S: ['..############', '###...........', '..##########..', '...........###', '############..'],
  T: ['##############', '.....####.....', '.....####.....', '.....####.....', '.....####.....'],
  W: ['###........###', '###........###', '###...##...###', '###..####..###', '.####....####.'],
  Y: ['###........###', '.###......###.', '...########...', '.....####.....', '.....####.....'],
};
const INK = 'M';
const FIELD = '+';
function bigWord(word) {
  const rows = [];
  for (let r = 0; r < 5; r++) {
    let row = word.split('').map((ch) => FONT[ch][r]).join('..');
    const left = Math.floor((LINE - row.length) / 2);
    row = '.'.repeat(left) + row + '.'.repeat(LINE - row.length - left);
    rows.push(row.replace(/#/g, INK).replace(/\./g, FIELD));
  }
  return rows;
}
// A line of words in the field: spaces become the field character.
function caption(text) {
  const left = Math.floor((LINE - text.length) / 2);
  return (' '.repeat(left) + text + ' '.repeat(LINE - text.length - left)).replace(/ /g, FIELD);
}
const LOGO = [...bigWord('CAST'), FIELD.repeat(LINE), ...bigWord('AWAY'), caption('almost nothing happens on purpose')];

// The palm's portrait for the key block. The scene is drawn with shapes in square units (a code
// cell is 1 unit wide and CELL_H units tall, which is about how GitHub's code font sits), then
// rasterised: each cell is supersampled and takes the character of the topmost shape that covers
// enough of it. Characters are chosen by how much ink they put down: + is the lightest, M the
// darkest. The castaway herself is two characters, a Q (the head, headphones and all) and an A.
const CELL_H = 2.5;
const P_ROWS = 19;
const lerp = (a, b, t) => a + (b - a) * t;
const quad = (p0, p1, p2, t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];
// A tapering stroke along a quadratic curve: covers (x, y) when it is within half the local width.
function stroke(p0, p1, p2, w0, w1) {
  const pts = Array.from({ length: 49 }, (_, i) => quad(p0, p1, p2, i / 48));
  return (x, y) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(x - (ax + u * dx), y - (ay + u * dy));
      if (d <= lerp(w0, w1, (i + u) / 48) / 2) return true;
    }
    return false;
  };
}
const disc = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const oval = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const any = (...fs) => (x, y) => fs.some((f) => f(x, y));
const SEA_Y = 16 * CELL_H; // the sea starts on row 16
const CROWN = [21, 12.5];
const FRONDS = [
  [[11, 1], [1.5, 13], 3.4], // left, high
  [[10, 9], [5, 22], 3.2], // left, low
  [[31, 0], [44, 11], 3.4], // right, high
  [[33, 9], [38, 21], 3.2], // right, low
  [[17, 3], [25, 1.2], 3.0], // top
];
// Leaflets: short strands hanging from the outer two thirds of each frond.
const leaflets = FRONDS.slice(0, 4).flatMap(([p1, p2]) =>
  [0.5, 0.67, 0.84].map((t) => {
    const [x, y] = quad(CROWN, p1, p2, t);
    const side = p2[0] < CROWN[0] ? -1 : 1;
    return stroke([x, y + 1], [x + side * 0.6, y + 3], [x + side * 1.4, y + 4.6], 1.1, 0.8);
  }),
);
const SCENE = [
  // [character, shape, how much of the cell it must cover], topmost first
  ['0', any(disc(19.6, 15.2, 1.5), disc(23, 15.6, 1.5)), 0.3], // coconuts
  ['M', any(...FRONDS.map(([p1, p2, w]) => stroke(CROWN, p1, p2, w, 1.0))), 0.34],
  ['l', any(...leaflets), 0.3],
  ['8', stroke([21, 14], [27, 27], [24.5, 39], 3.4, 2.6), 0.4], // trunk, ringed
  ['m', oval(25, SEA_Y - 0.5, 17, 4.2), 0.4], // the island
  ['O', disc(52, 7, 5.6), 0.4], // sun
  ['o', any(disc(55, 15.5, 2.6), disc(59, 13.8, 3.2), disc(63, 15.4, 2.8)), 0.45], // cloud, in front of the sun
  ['w', (x, y) => y >= SEA_Y && Math.floor(y / CELL_H) % 2 === 0, 0.5], // sea, near rows
  ['v', (x, y) => y >= SEA_Y, 0.5], // sea, far rows
];
function rasterise() {
  const rows = [];
  for (let r = 0; r < P_ROWS; r++) {
    let row = '';
    for (let c = 0; c < LINE; c++) {
      let ch = '+';
      for (const [glyph, shape, need] of SCENE) {
        let hit = 0;
        for (let sy = 0; sy < 5; sy++)
          for (let sx = 0; sx < 3; sx++) if (shape(c + (sx + 0.5) / 3, (r + (sy + 0.5) / 5) * CELL_H)) hit++;
        if (hit / 15 >= need) { ch = glyph; break; }
      }
      row += ch;
    }
    rows.push(row);
  }
  return rows;
}
// Props placed by cell after the rasterising: her, the raft and a bottle (the bottle).
function place(rows, r, c, text) {
  rows[r] = rows[r].slice(0, c) + text + rows[r].slice(c + text.length);
}
const PORTRAIT = rasterise();
place(PORTRAIT, 13, 29, 'Q');
place(PORTRAIT, 14, 29, 'A');
place(PORTRAIT, 16, 47, 'HHHHHH');
place(PORTRAIT, 17, 57, 'i');

// ---------------------------------------------------------------------------------------------
// 4. The letter (the signed text), and the cleartext rules that go with it
// ---------------------------------------------------------------------------------------------
const EMPTY_SHA256 = sha256(Buffer.alloc(0)).toString('hex');
const LETTER = String.raw`
To whoever finds this bottle:

CASTAWAY (working title) is a ten-hour lo-fi video. I am the young
woman on the tiny island in it, with one tall palm, a raft and cream
headphones. I nod to the music. Almost nothing happens, on purpose.
Every so often, on the next bar of the beat, something does:

- this bottle goes out and washes straight back (hello again)
- a drone lowers a parcel: another pair of headphones
- a coconut lands on a hermit crab, who walks off wearing it
- I walk out across the water for an iced coffee, then come back

More than 90 activities, most of them on four timers, from every 2
minutes to every 6 hours. Every sound is synthesized from code: no
samples, no loops, no recordings. It is always daytime.

Run it: python tools/serve.py, then open http://127.0.0.1:8765/

SHA-256 of everything that happens between gags:
${EMPTY_SHA256}

the castaway
top of the palm, one bar of signal
Thursday, 1 October 2026
`.replace(/^\n|\n$/g, '').split('\n');

for (const line of LETTER) {
  if (line.length > 70) throw new Error(`letter line over 70 columns: ${line}`);
  if (/[^\x20-\x7e]/.test(line)) throw new Error(`letter line is not printable ASCII: ${line}`);
  if (/\s$/.test(line)) throw new Error(`trailing whitespace: ${line}`);
}
if (process.argv.includes('--body')) {
  process.stdout.write(LETTER.join('\n') + '\n');
  process.exit(0);
}

// RFC 4880 7.1: what is signed is the text with trailing whitespace removed from every line,
// lines joined by CR LF, and no line ending after the last line. What is shown is dash-escaped.
const canonical = Buffer.from(LETTER.map((l) => l.replace(/[ \t]+$/, '')).join('\r\n'));
const shown = LETTER.map((l) => (l.startsWith('-') ? `- ${l}` : l));

// ---------------------------------------------------------------------------------------------
// 5. Sign, armour, and check that the pictures came out where they should
// ---------------------------------------------------------------------------------------------
const textSig = pictureSignature({
  before: 0,
  picture: LOGO,
  fillerLabel: 'castaway-logo-filler',
  type: 0x01,
  hashedPrefix: canonical,
  name: `logo@${NOTATION_DOMAIN}`,
});
const sigRows = armour(textSig.packet);

const uid = Buffer.from(USER_ID);
const keyPacket = packet(6, keyBody);
const uidPacket = packet(13, uid);
const selfSig = pictureSignature({
  before: keyPacket.length + uidPacket.length,
  picture: PORTRAIT,
  fillerLabel: 'castaway-portrait-filler',
  type: 0x13,
  hashedPrefix: Buffer.concat([keyHashPrefix, u8(0xb4), u32(uid.length), uid]),
  extraHashed: [subpacket(27, u8(0x03))], // key flags: certify, sign
  name: `portrait@${NOTATION_DOMAIN}`,
});
const keyRows = armour(Buffer.concat([keyPacket, uidPacket, selfSig.packet]));

function expectPicture(rows, picture, first, what) {
  picture.forEach((p, i) => {
    if (rows[first + i] !== p) throw new Error(`${what}: armour row ${first + i} is not the picture row ${i}`);
  });
}
expectPicture(sigRows, LOGO, textSig.firstRow, 'signature');
expectPicture(keyRows, PORTRAIT, selfSig.firstRow, 'key');

const signedBlock = [
  '-----BEGIN PGP SIGNED MESSAGE-----',
  'Hash: SHA256',
  '',
  ...shown,
  '-----BEGIN PGP SIGNATURE-----',
  'Comment: signed at the top of the palm, where there is one bar',
  'Comment: comments are not covered by the signature. this one may lie',
  '',
  ...sigRows,
  '-----END PGP SIGNATURE-----',
];
const keyBlock = [
  '-----BEGIN PGP PUBLIC KEY BLOCK-----',
  'Comment: Palm Notary, demo key. stand back from the screen a bit',
  '',
  ...keyRows,
  '-----END PGP PUBLIC KEY BLOCK-----',
];

// ---------------------------------------------------------------------------------------------
// 6. The README header
// ---------------------------------------------------------------------------------------------
const fprGroups = FPR.match(/.{4}/g);
const fprSpaced = fprGroups.slice(0, 5).join(' ') + '  ' + fprGroups.slice(5).join(' ');
const GPG_SAYS = [
  'gpg: Signature made Thu Oct  1 10:00:00 2026 GMT',
  `gpg:                using EDDSA key ${keyId.toString('hex').toUpperCase()}`,
  `gpg: Good signature from "${USER_ID}" [unknown]`,
  'gpg: WARNING: This key is not certified with a trusted signature!',
  'gpg:          There is no indication that the signature belongs to the owner.',
  `Primary key fingerprint: ${fprSpaced}`,
];

const fence = (lines, lang = '') => ['```' + lang, ...lines, '```'];
const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '<!-- The block below is a real OpenPGP clearsigned message. Do not reflow it: one changed byte and it stops verifying. -->',
  '',
  ...fence(signedBlock),
  '',
  '**Castaway** (working title) is a stationary-frame lo-fi video for YouTube: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She idles, nodding to the music in her headphones, and every so often a gag lands on the beat. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, painted sunny and always in daytime. It is in development, and no video has been published yet.',
  '',
  "The letter above is a real OpenPGP clearsigned message, logo and all, and it verifies. Change one word and it stops. The key that signed it is the Palm Notary's demo key, whose secret half anyone can rebuild from a published sentence, so the signature proves exactly one thing: nothing has changed. Which is also the plot.",
  '',
  ...fence([
    'python tools/serve.py      # live preview, MP4 export: http://127.0.0.1:8765/',
    'python tools/schedule.py   # check the schedule, simulate a 10-hour run',
  ], 'sh'),
  '',
  '<details>',
  '<summary><b>Verify the bottle</b>: three commands, one good signature, one honest warning</summary>',
  '',
  'From a checkout, in a throwaway keyring:',
  '',
  ...fence([
    'export GNUPGHOME="$(mktemp -d)"   # scratch keyring: the palm never meets yours',
    "gpg --import README.md            # the Palm Notary's key, further down",
    "sed -n '/^-----BEGIN PGP SIGNED/,/^-----END/p' README.md | gpg --verify",
  ], 'sh'),
  '',
  'What GnuPG 2.4.9 printed on 1 October 2026:',
  '',
  ...fence(GPG_SAYS),
  '',
  'Good signature, from a key nobody should trust. Both of those are correct. Now change one word of the letter and run it again: BAD signature. Change a `Comment:` line instead and it still verifies, because armour headers are not signed. That is why the second one warns you about the first.',
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>The fine print</b>: seven tells that this went through a real signer</summary>',
  '',
  '1. **`- - this bottle goes out`** is dash-escaping. Every line of the letter that starts with a hyphen gets a `- ` in front, so no line of text can ever pass itself off as a `-----BEGIN` line. GnuPG takes it off again before it checks.',
  '2. **`Hash: SHA256`**, then exactly one blank line, then the letter. Trailing spaces are not signed, and every line ending is signed as CR LF, whatever your system uses.',
  "3. **The logo is inside the signature, and it is signed.** Base64 is only letters, digits, `+` and `/`, so any 64 of them decode to 48 bytes. Those bytes sit in a notation packet in the signature's hashed area, placed so they start a line of their own, and they armour straight back into the picture. `gpg --verify-options show-notations --verify` lists it as `logo@one-palm.invalid`, \"not human readable\", which is fair.",
  '4. **`=` and four characters** close the block: a CRC-24 of the armour, there to catch a mangled copy, not a forger.',
  '5. **The `Comment:` lines** sit outside the signature. The first one may even be true.',
  "6. **The SHA-256 in the letter** is the hash of an empty file. Check it: `printf '' | sha256sum`.",
  `7. **The key is a demo.** Its secret half is the SHA-256 of a sentence anyone can read: \`${KEY_PHRASE}\` That is why it signs with a straight face and proves nothing about who wrote the letter.`,
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>P.S.</b> (not signed, so you will have to trust me): everything else that washes up</summary>',
  '',
  '- A different bottle, later, brings a reply.',
  '- A sea turtle visits.',
  '- A stray cat, grey tabby with a white chest, arrives on a crate, climbs my palm and naps. One day it floats away again. It comes back another time.',
  '- There is one bar of signal, at the top of the palm. I go up there.',
  '- A shark in headphones nods to the beat.',
  '- A tour boat of selfie-takers goes by.',
  '- A bro on an electric hydrofoil waves a shaka and carves off.',
  '- Bushcraft: fire by friction, a hammock, a lookout up the palm, spear fishing.',
  '- I plant a kumara. It grows over the course of the video.',
  '- I build a sandcastle. The tide takes it.',
  '- I wave for rescue.',
  '- A ship sails past while I am busy. I am told it waits until I am.',
  '',
  'The timers, as [activities.toml](activities.toml) sets them, and what a typical 10-hour run gets (the median of 200 simulated runs):',
  '',
  '| timer | comes round every | in a 10-hour run |',
  '| --- | --- | --- |',
  '| regular | 2 to 5 minutes | about 155 |',
  '| occasional | 12 to 25 minutes | about 30 |',
  '| rare | 30 to 60 minutes | about 13 |',
  '| super rare | 3 to 6 hours, at most 3 a run | about 2 |',
  '',
  'Chained follow-ups come on top (the tide only takes a sandcastle someone built). I am busy about a third of the time and idle the rest. Lanes let things overlap, every activity starts on the next 3-second bar, and the default run is 10:00:00 with seed 1992. [tools/schedule.py](tools/schedule.py) checks all of it.',
  '',
  'The sound comes from [tools/make_audio.py](tools/make_audio.py), more than 150 files of it: a seamless 60-second theme at 80 BPM in F major (electric piano, kalimba, soft drums, vinyl crackle), a seamless 60-second ocean, and the effects, mixed to -14 LUFS. Nobody has listened to any of it yet. The renderer is [web/index.html](web/index.html), plain ES modules with no build step, which exports frame-exact 1080p video in the browser; [tools/render_demo.py](tools/render_demo.py) `--dev` renders a reel of every activity. The working notes are in [MUSING.md](MUSING.md).',
  '',
  '</details>',
  '',
  '<details>',
  "<summary><b>The Palm Notary's public key</b>: the zine-footer edition, with a portrait of the notary</summary>",
  '',
  ...fence(keyBlock),
  '',
  "The portrait is stored in the key's self-signature, so the palm has notarised its own portrait. That is not how notaries work. Stand back from the screen a little.",
  '',
  '</details>',
];

for (const line of [...signedBlock, ...keyBlock, ...GPG_SAYS]) {
  if (line.length > 80) throw new Error(`code line over 80 columns: ${line}`);
  if (/[^\x20-\x7e]/.test(line) || /\s$/.test(line)) throw new Error(`bad code line: ${line}`);
}

fs.writeFileSync(OUT, md.join('\n') + '\n');
console.log(`wrote ${path.relative(process.cwd(), OUT)}  (fingerprint ${FPR})`);
console.log(`signature rows ${sigRows.length}, key rows ${keyRows.length}`);
if (process.argv.includes('--key')) console.log(keyBlock.join('\n'));
