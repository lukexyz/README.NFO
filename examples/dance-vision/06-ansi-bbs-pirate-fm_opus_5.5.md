<p align="center">
  <img src="assets/06-ansi-bbs-pirate-fm_opus_5.5.svg" width="832" alt="Dance Vision 87.87 FM, drawn as a 1990s ANSI BBS login screen. A modem dials in and the screen draws itself row by row: a magenta and cyan DANCE VISION logo between bouncing VU meters, then a diagram of a phone sending only 33 joints through a websocket relay on port 8787, topped with a pirate radio mast, to a TV studio where five stick figures dance under a hopping spotlight. Below that, a caller panel (video: none, app: none, account: none, phones: 6 a room) and tonight's line-up of six East London venues, a blinking PRESS ANY KEY, a shout-out scroller and a status bar with the quick start, npm run party.">
</p>

<p align="center">
  <b>DANCE VISION · 87.87 FM</b> · the pirate motion-capture sound system<br>
  <sub>broadcasting from a phone propped against your telly to E8 and surrounding areas · keep it locked</sub>
</p>

**Dance Vision** turns your phone into a motion-capture rig and your telly into a dance floor. Scan the QR code, prop the phone against the TV and you're on air: a stick figure in a shared room with everyone else who dialled in. No app, no account, and no video ever leaves your phone. Just the joints.

- **Your phone is the transmitter.** The pose model runs on the phone, in the browser, and sends 33 joints × {x,y,z}, about 1.6 KB a frame, up to 20 times a second. That's the whole broadcast: nobody downstream could film you if they tried.
- **Phone → relay → telly.** A websocket relay on port 8787 carries the joints to Studio, a three.js room on the TV with the music, six East London venues and up to 12 dancers: six phones and a backing crew of six.

```sh
npm run party    # then open http://127.0.0.1:8787/ and it opens Controller
```

<pre>
══════════════════════════════════════════════════════════════════════════════
 DANCE VISION BBS  -=[ MAIN MENU ]=-  node 1 of 6 · 87.87 FM · 14400 baud
──────────────────────────────────────────────────────────────────────────────
  <a href="#run-the-app">[P] Party</a> ........ start the rave    <a href="docs/SAMPLE-MOVES.md">[S] Sample moves</a> ..... the crew's moves
  <a href="#venues">[V] Venues</a> ....... 6 rooms, E1-E14   <a href="YOUTUBE_WORKFLOW.md">[Y] YouTube maps</a> ..... nick the moves
  <a href="docs/MULTIPLAYER.md">[M] Multiplayer</a> .. phones, QR codes  <a href="MUSINGS.md">[B] Build decisions</a> .. how it got here
  <a href="#verification">[T] Tests</a> ........ smoke it first    <a href="#top">[G] Goodbye</a> .......... ATH0, NO CARRIER
══════════════════════════════════════════════════════════════════════════════
 Select [P V M T S Y B G] or press any key (still a README) &gt; _
</pre>

<details>
<summary><b>DANCEVSN.NFO</b> · release info, install, tonight's rooms, greetz</summary>

```text
      ___     _    _  _   ___  ___    __   __ ___  ___  ___   ___   _  _
     |   \   /_\  | \| | / __|| __|   \ \ / /|_ _|/ __||_ _| / _ \ | \| |
     | |) | / _ \ | .` || (__ | _|     \ V /  | | \__ \ | | | (_) || .` |
     |___/ /_/ \_\|_|\_| \___||___|     \_/  |___||___/|___| \___/ |_|\_|

        -=[ 87.87 FM · the pirate motion-capture sound system · E8 ]=-

 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  RELEASE INFO
   Title ............ Dance Vision (dance-vision)
   Supplied by ...... the Overground Offset Sound System
   Cracked by ....... nobody. there is nothing to crack
   Protection ....... none. no app, no account, no video
   Format ........... 33 joints x {x,y,z} per frame, ~1.6 KB, up to 20 fps
   Transmitter ...... your phone, propped against the telly
   Aerial ........... a websocket relay on :8787 (spiritually, a tower block)
   Receiver ......... Studio: three.js on the TV, the music and the venues
   Capacity ......... 6 phones a room + a backing crew of 6 = 12 dancers
   Prototype ........ Unity, 2021. three webcams, instructor on the wall
   Browser build .... 2026-09-13. one webcam, pose model on-device, 18 fps
   Rating ........... [##########] would dance in a chicken shop again

  SIGNAL PATH
     you         phone (browser)           relay          telly (Studio)
      o    cam  [ pose model   ] joints  [ ws    ] joints  [ three.js     ]
     /|\  ====> [ 33 x {x,y,z} ] ======> [ :8787 ] ======> [ music, cam   ]
     / \        [ frames: none ] ~30KB/s [       ]         [ 6 you + crew ]

  INSTALL
   1. npm run party
   2. open http://127.0.0.1:8787/ (that's Controller)
   3. Open TV studio in a window on the HDMI telly, then click Fill the TV
   4. scan the room QR with your phone, prop it up, step back
   5. dance. the relay only ever sees your joints

  TONIGHT'S ROOMS (press V on the TV to cycle them)
   Big Screen Energy ............. Hackney Wick warehouse, huge LED wall
   Main Character Syndrome ....... Shoreditch rooftop, one cover star
   Gentrifried Chicken ........... Dalston chicken shop disco, 3am
   Mind The Gyrate ............... Night Tube disco, eastbound
   Our Lady of Perpetual Squats .. roofless Hackney church rave
   Hostile Twerkover ............. Canary Wharf helipad, drone swarm
   every minute or so a countdown names a dancer (phone dancers first),
   then they get the camera, a spin and a cheering crew

  GREETZ
   MC Pose Model · DJ 33 Joints at 33 rpm · DJ Three.js
   the Relay on the door · the Kingsland Road Keyframers
   Mare Street Massive · Clapton Kinetic · the Dalston Delta-Time Posse
   the Hackney Wick Kinematics Crew · the Overground, for every 4am ride home
   the chicken shop that knows the order
   everyone's downstairs neighbour (sorry about the squats)

  NO LOVE TO
   anyone who films you dancing. we couldn't if we tried: no video ever
   leaves the phone

 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
      keep it locked · 87.87 FM · selecta, wheel it up · ATH0 · NO CARRIER
```

</details>
