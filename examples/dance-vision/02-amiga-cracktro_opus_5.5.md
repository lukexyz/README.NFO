<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5.svg" width="100%" alt="Amiga-style cracktro banner. 'The Joint Venture presents' above DANCE VISION in chunky chrome letters over sweeping copper raster bars and a parallax starfield, with the subtitle 'Your phone is the mocap rig, your telly is the dance floor'. Below it seven stick-figure dancers bob to the beat under a roving spotlight (the purple one is half a beat late), a sine-wave scroller opens with 'No video leaves the phone: just joints!', and the footer reads npm run party, then http://127.0.0.1:8787">
</p>

<h3 align="center">Dance Vision turns your phone into a mocap rig and your telly into a dance floor.</h3>

<p align="center">
  Scan a QR code, prop the phone against the telly and you appear as a stick figure in a shared room with everyone else who joined.
  No app, no account, and <b>no video ever leaves your phone: just the joints</b>.
  The pose model runs in the phone's browser; 33 joints &times; {x,y,z} (about 1.6&nbsp;KB a frame) go over a websocket relay
  to Studio, the three.js TV page, which renders the room, the music, up to six phone dancers and a backing crew.
</p>

<p align="center">
  <code>SUPPLIED&nbsp;BY:&nbsp;your&nbsp;phone</code>&nbsp;
  <code>CRACKED&nbsp;BY:&nbsp;a&nbsp;pose&nbsp;model</code>&nbsp;
  <code>PROTECTION:&nbsp;none</code>&nbsp;
  <code>VIDEO&nbsp;SENT:&nbsp;0&nbsp;bytes</code>
</p>

```sh
npm run party
```

<p align="center">
  Then open <b>http://127.0.0.1:8787/</b> (it opens Controller), pop <b>Open&nbsp;TV&nbsp;studio</b> into a window
  on the telly, hit <b>Fill&nbsp;the&nbsp;TV</b> and let the phones scan the room QR.
  The long version is in <a href="#run-the-app">Run&nbsp;the&nbsp;app</a>.
</p>

<p align="center"><sub>&#9835; NOW PLAYING: DANCEVISION.MOD &middot; channels are joints, notes are moves &#9835;</sub></p>

```text
╔═════════════════════════════════════════════════════════════════════╗
║ DANCEVISION.MOD   PHONE → RELAY → TELLY   BPM 120   PAT 07          ║
╠════╦════════════╦════════════╦════════════╦════════════╦════════════╣
║ ## ║ 1 HEAD     ║ 2 L.WRIST  ║ 3 R.WRIST  ║ 4 HIPS     ║ 5 FEET     ║
╠════╬════════════╬════════════╬════════════╬════════════╬════════════╣
║ 00 ║ ROL 06 000 ║ ASW 02 000 ║ ASW 02 000 ║ HIP 07 000 ║ KNE 01 000 ║
║ 01 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║
║ 02 ║ --- 00 000 ║ PUN 03 C40 ║ --- 00 000 ║ --- 00 000 ║ KNE 01 000 ║
║ 03 ║ --- 00 000 ║ --- 00 000 ║ PUN 03 C40 ║ --- 00 000 ║ --- 00 000 ║
║>04<║ ROL 06 A04 ║ ELB 04 000 ║ ELB 04 000 ║ HIP 07 E61 ║ 1-2 08 000 ║
║ 05 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║
║ 06 ║ --- 00 000 ║ PSH 05 000 ║ PSH 05 000 ║ --- 00 000 ║ DSS 09 000 ║
║ 07 ║ --- 00 000 ║ --- 00 000 ║ --- 00 000 ║ ROL 06 000 ║ SQR 0A F06 ║
╚════╩════════════╩════════════╩════════════╩════════════╩════════════╝
 KNE knee lifts   ASW arm sweeps   PUN side punches   ELB elbow lifts
 PSH step & arm push   1-2 one-two step   DSS double side step
 SQR squat & reach   ROL body rolls   HIP hip shake circle   --- rest
```

<details>
<summary><b>DANCEVISION.NFO</b>: release notes, install, files, venues and greetz</summary>

```text
   ██▀▀█▄ ▄█▀▀█▄ ██▄ ██ ▄█▀▀▀▀ ██▀▀▀▀   ██  ██ ██ ▄█▀▀▀▀ ██ ▄█▀▀█▄ ██▄ ██
   ██  ██ ██▄▄██ ██▀███ ██     ██▀▀▀    ██  ██ ██  ▀▀▀█▄ ██ ██  ██ ██▀███
   ██▄▄█▀ ██  ██ ██  ██ ▀█▄▄▄▄ ██▄▄▄▄    ▀██▀  ██ ▄▄▄▄█▀ ██ ▀█▄▄█▀ ██  ██
     ═════  T H E   J O I N T   V E N T U R E   P R E S E N T S  ═════

╔══════════════════════════════════════════════════════════════════════════╗
║ RELEASE ..... Dance Vision            DATE ....... 2026-09-13            ║
║ SUPPLIED BY . your phone              CRACKED BY . a pose model          ║
║ FORMAT ...... 33 joints x {x,y,z}     BANDWIDTH .. ~1.6 KB a frame       ║
║ PROTECTION .. none                    VIDEO SENT . 0 bytes               ║
║ HARDWARE .... a phone, a PC, a telly  PLAYERS .... up to 6 + a crew      ║
╚══════════════════════════════════════════════════════════════════════════╝

── RELEASE NOTES ───────────────────────────────────────────────────────────
  * The pose model runs in the phone's browser. No app, no account.
  * Only joints travel: phone -> websocket relay -> Studio on the telly.
  * Studio (three.js) renders the room, the music, up to 6 phone dancers
    and a backing crew.
  * Six East London venues, each with spotlight moments: a countdown
    names a dancer, then they get the camera, a spin and a cheering crew.
  * YouTube dance videos get mapped into editable choreography (/mapper).
  * 160 cheeky backing-dancer names in the pool, six picked per visit.
  * Unity prototype in 2021. First browser build 2026-09-13.

── INSTALL ─────────────────────────────────────────────────────────────────
  1. npm run party
  2. open http://127.0.0.1:8787/ (it opens Controller)
  3. "Open TV studio" in a window on the HDMI telly, click "Fill the TV"
  4. phones scan the room QR, press Start, prop against the telly, dance

── FILES ───────────────────────────────────────────────────────────────────
  /controller ..... the PC: library, playback, players and settings
  /studio ......... the telly: rendering, audio, the phone relay
  /camera.html .... the phone: camera and pose model, reached by QR
  /mapper ......... the dance map editor

── VENUES ──────────────────────────────────────────────────────────────────
  Midnight Studio ................ the default, where it all started
  Big Screen Energy .............. Hackney Wick warehouse, kiss-cam
  Main Character Syndrome ........ Shoreditch rooftop, you on a mag cover
  Gentrifried Chicken ............ Dalston chicken shop, CCTV "ENHANCE"
  Mind The Gyrate ................ Night Tube to a station named after you
  Our Lady of Perpetual Squats ... roofless church, Confession Cam
  Hostile Twerkover .............. Canary Wharf helipad, police heli
  Press V on the telly to cycle them; /studio?venue=<id> opens one.

── GREETZ ──────────────────────────────────────────────────────────────────
  Dalston Disco Division * Kingsland Road Knee Poppers * Homerton Hip
  Engineers * Mare Street Moonwalkers * the Hackney Wick Warehouse
  Wobblers * everyone still waiting for the Overground * the purple one,
  half a beat late since 2021 * whoever did the worm in the chicken shop
  at 3am

── NO GREETZ ───────────────────────────────────────────────────────────────
  People who film the dancefloor. We only pass joints around.

         ═════  what happens on the phone stays on the phone  ═════
```

</details>

<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5-rule.svg" width="100%" alt="A thin colour-cycling copper bar">
</p>
