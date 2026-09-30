<p align="center">
  <a href="#run-the-app"><img src="assets/03-keygen-dialog_opus_5.5.svg" width="100%" alt="Dance Vision keygen: an oddly shaped, dark mid-2000s keygen window, cracked by the made-up PERi-PERi POSSE and supplied by a bloke in Dalston, with a spinning record badge in the corner. A chrome and lime pixel logo reads DANCE VISION, a ticker plays dance_vision_keygen.xm and a spectrum analyser pumps. NAME reads: your phone + a telly. SERIAL scrambles into 33-JOINTS-0-PIXELS, NO-APP-NO-ACCOUNT, PHONE-RELAY-TELLY and 3AM-CHICKEN-SHOP-DISCO. Below, a phone sends 33 joints over a websocket relay to a telly where three stick figures dance; the status bar says 0 pixels uploaded, and the chin reads: dance like the neighbours are out."></a>
</p>

<h3 align="center">Dance Vision &middot; <code>dance_vision_keygen.exe</code></h3>

<p align="center">
  <a href="#run-the-app"><kbd>&nbsp;[ RUN ]&nbsp;</kbd></a>&nbsp;
  <a href="#venues"><kbd>&nbsp;[ VENUES ]&nbsp;</kbd></a>&nbsp;
  <a href="docs/MULTIPLAYER.md"><kbd>&nbsp;[ DOCS ]&nbsp;</kbd></a>&nbsp;
  <a href="MUSINGS.md"><kbd>&nbsp;[ NOTES ]&nbsp;</kbd></a>
</p>

**Dance Vision turns your phone into a motion-capture rig and your telly into a dance floor.** Scan a QR code, prop the phone against the telly, and you show up as a stick figure in a shared room with everyone else who joined. No app. No account. No video ever leaves your phone: just the joints.

- **Phone → relay → telly.** The pose model runs in the phone's browser. Only 33 joints × {x, y, z}, about 1.6 KB a frame, ride a websocket relay to the host. Your kitchen stays private.
- **The telly is a browser window.** Studio renders the room, the music, up to 6 phone dancers and a backing crew with three.js. Put it on the HDMI TV and click **Fill the TV**.
- **Quick start.** Run `npm run party`, then open **http://127.0.0.1:8787/** (it opens Controller). The full manual is under [Run the app](#run-the-app).

<details>
<summary><b>[ ABOUT ]</b> read <code>dance_vision.nfo</code>: release info, install, bonus levels, greetz</summary>

```text
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║        ░▒▓█  P E R i - P E R i   P O S S E   p r e s e n t s  █▓▒░         ║
║                                                                            ║
║                          D A N C E   V I S I O N                           ║
║              phone in  ·  telly out  ·  keygen music optional              ║
║                                                                            ║
╠══════════════════════════════[ RELEASE iNFO ]══════════════════════════════╣
║   RELEASE ...... dance-vision, browser build (first steps 2026-09-13)      ║
║   SUPPLIER ..... a bloke in Dalston                                        ║
║   ORIGIN ....... a Unity prototype from 2021, finally out of the loft      ║
║   CRACKER ...... not needed. protection: none                              ║
║   TYPE ......... phone -> websocket relay -> telly                         ║
║   PAYLOAD ...... 33 joints x {x,y,z}, ~1.6 KB a frame, 0 bytes of video    ║
║   REQUIRES ..... a PC, a telly, a phone with a camera, some floor          ║
╠════════════════════════════════[ iNSTALL ]═════════════════════════════════╣
║   1. npm run party                                                         ║
║   2. open http://127.0.0.1:8787/ ...................... opens Controller   ║
║   3. Open TV studio on the HDMI telly, click Fill the TV                   ║
║   4. scan the room QR, prop the phone against the telly, press Start       ║
║   5. dance. you are a stick figure now. nobody can see your kitchen        ║
╠══════════════════════════════[ BONUS LEVELS ]══════════════════════════════╣
║   Six East London venues. Press V on the telly to cycle them. Every        ║
║   minute or so a countdown names a dancer, then they get the camera,       ║
║   a spin and a cheering crew.                                              ║
║                                                                            ║
║   Big Screen Energy ............. Hackney Wick warehouse, huge LED wall    ║
║   Main Character Syndrome ....... Shoreditch rooftop, one cover star       ║
║   Gentrifried Chicken ........... 3am Dalston chicken shop disco           ║
║   Mind The Gyrate ............... Night Tube disco, eastbound              ║
║   Our Lady of Perpetual Squats .. roofless Hackney church rave             ║
║   Hostile Twerkover ............. Canary Wharf helipad, drone swarm        ║
╠═════════════════════════════════[ GREETZ ]═════════════════════════════════╣
║   everyone propping a phone on a stack of books  ·  the Overground,        ║
║   whenever it turns up  ·  3am chicken shops  ·  the downstairs            ║
║   neighbours (sorry)  ·  the 2021 Unity prototype, rest easy               ║
║                                                                            ║
║        -=[ no pixels were uploaded in the making of this dance ]=-         ║
╚════════════════════════════════════════════════════════════════════════════╝
```

</details>
