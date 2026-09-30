<p align="center">
  <img src="assets/04-c64-loader_opus_5.5.svg" width="800" alt="Dance Vision on a Commodore 64: it boots to READY., types LOAD&quot;DANCE VISION&quot;,8,1, loads with rolling turbo stripes in the border and types RUN. Then a cracktro title screen: the colour-cycling DANCE VISION logo over raster bars, PHONE = MOCAP RIG, TELLY = DANCE FLOOR, five stick figures dancing in sync on a light-up floor, a dance spotlight countdown that puts YOU in the zone while the crew cheers, then everybody hands up; a SID panel playing Chicken Shop Shuffle by DJ Last Orders, a sine scroller, and the line: no video leaves your phone, just joints.">
</p>

<h1 align="center">Dance Vision</h1>

<p align="center">
  <b>Your phone is the mocap rig. Your telly is the dance floor.</b><br>
  Scan a QR code, prop the phone against the telly, and you load in as a stick figure
  in one room with everyone else who joined. No app. No account.
  <b>No video ever leaves your phone: just the joints.</b><br>
  <i>Dance like nobody's watching, because technically nobody is.</i>
</p>

<p align="center">
  <b>phone</b> <sub>pose model, in the browser</sub>
  → <code>33 joints ≈ 1.6 KB</code> → <b>websocket relay</b> →
  <b>telly</b> <sub>Studio: three.js, music, up to 6 phones + crew</sub>
</p>

```text
10 REM *** DANCE VISION QUICK START *** PROTECTION: NONE
20 SYS "npm run party"
30 OPEN "http://127.0.0.1:8787/" : REM THAT'S CONTROLLER
40 REM CLICK "OPEN TV STUDIO", DRAG IT TO THE TELLY, SCAN THE QR
50 PRINT "\o/ "; : GOTO 50
RUN
\o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/ \o/
BREAK IN 50
READY.
```

<details>
<summary><b>DANCEVIS.NFO</b>: how it works, credits, greetz (protection: none)</summary>

```text
     ████████          ████      ████    ████    ████████    ████████████
     ████░░████      ████████    ██████  ████░░████░░░░████  ████░░░░░░░░░░
    ████░░░ ████░ ████ ░░░████░ ████████████░░████░░░    ░░░████░░░
    ████░░  ████░░████████████░░████████████░░████░░        ████████
   ████░░░ ████░░████░░░░████░░████░░██████░░████░░░       ████░░░░░░░
   ████░░████░░░░████░░  ████░░████░░  ████░░████░░  ████  ████░░
  ████████ ░░░░ ████░░░ ████░░████░░░ ████░░░ ████████ ░░░████████████
    ░░░░░░░░      ░░░░    ░░░░  ░░░░    ░░░░    ░░░░░░░░    ░░░░░░░░░░░░
   ████    ████  ████████    ████████    ████████    ████████    ████    ████
   ████░░  ████░░  ████░░░░████░░░░████    ████░░░░████░░░░████  ██████  ████░░
  ████░░░ ████░░░ ████░░░ ████░░░    ░░░░ ████░░░ ████░░░ ████░░████████████░░░
  ████░░  ████░░  ████░░    ████████      ████░░  ████░░  ████░░████████████░░
 ████░░░ ████░░░ ████░░░      ░░░████░   ████░░░ ████░░░ ████░░████░░██████░░░
   ████████░░░░  ████░░  ████    ████░░  ████░░  ████░░  ████░░████░░  ████░░
    ████░░░░░ ████████░   ████████ ░░░████████░   ████████ ░░░████░░░ ████░░░
      ░░░░      ░░░░░░░░    ░░░░░░░░    ░░░░░░░░    ░░░░░░░░    ░░░░    ░░░░

═════════════════════════════════════════════════════════════════════════════
  THE HACKNEY 1541 MASSIVE PRESENTS ..................... DANCE VISION
═════════════════════════════════════════════════════════════════════════════

  RELEASE TYPE .. party game / mocap rig / reason to move the sofa
  ORIGINAL ...... Unity prototype, 2021: three players on webcams,
                  instructor video on the wall
  BROWSER CUT ... 2026-09-13: one webcam, pose model on-device, 18 fps
  PROTECTION .... none. no app, no account, no video, no excuses
  FORMAT ........ 33 joints x {x,y,z}, ~1.6 KB a frame, 0 bytes of video
                  (33 joints, 33 rpm: it's basically vinyl)
  PLAYERS ....... up to 6 phones + a backing crew, one telly
  VENUES ........ six, all East London, all with a dance spotlight:
                  Big Screen Energy · Main Character Syndrome
                  Gentrifried Chicken · Mind The Gyrate
                  Our Lady of Perpetual Squats · Hostile Twerkover
  TRAINER ....... YouTube dance videos, mapped into editable choreography
  LOADER ........ npm run party

─── HOW IT WORKS ────────────────────────────────────────────────────────────

    YOU       PHONE (browser)         RELAY          TELLY (/studio)
             ┌────────────────┐      ┌──────┐      ┌─────────────────────┐
     o   cam │ pose model     │joints│      │joints│ three.js + music    │
    /|\ ───> │ 33 x {x,y,z}   │═════>│  ws  │═════>│ 6 phones + a crew   │
    / \      │ video out: 0   │20 fps│      │      │  \o/  o/  \o/  \o   │
             └────────────────┘      └──────┘      └─────────────────────┘

─── GREETZ ──────────────────────────────────────────────────────────────────

  DJ Last Orders * MC Salt Beef * the Mare Street Massive * Lil' Half-Price
  Wings * whoever held the Overground doors at Dalston Junction * every
  chicken shop still frying at 3am * your nan, who does the running man
  better than you and knows it

  NO RESPECT TO: anyone filming the dance floor. we don't. just joints.

─────────────────────────────────────────────────── all names made up, bruv ─
```

</details>
