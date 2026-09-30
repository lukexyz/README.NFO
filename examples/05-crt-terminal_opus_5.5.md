<p align="center">
  <img src="assets/05-crt-terminal_opus_5.5.svg" width="100%" alt="Dance Vision on a green phosphor CRT terminal. A typed log reads: ssh dancer@telly, pose model loaded: 33 joints, camera frames transmitted: 0. ACCESS GRANTED appears in big block letters, three ASCII stick figures dance in a studio pane, a packet hops from phone to pose model to joints to websocket relay to TV studio, and a hex dump of a joint packet scrolls past.">
</p>

<p align="center">
  <b>Dance Vision</b> · your phone is the mocap rig · your telly is the dance floor · your face stays home
</p>

<p align="center">
  <a href="#run-the-app"><kbd>F1 run the app</kbd></a>
  <a href="#venues"><kbd>F2 venues</kbd></a>
  <a href="docs/MULTIPLAYER.md"><kbd>F3 multiplayer</kbd></a>
  <a href="YOUTUBE_WORKFLOW.md"><kbd>F4 map a YouTube video</kbd></a>
  <kbd>F10 quit</kbd> <i>(you won't)</i>
</p>

```console
you@hackney:~/dance-vision$ whoami
33 joints and a dream. no face on file.

you@hackney:~/dance-vision$ cat README.1st
Dance Vision turns your phone into a motion-capture rig and your telly into a
dance floor. Scan the QR code, prop the phone against the TV, and you show up
as a stick figure in a shared room with everyone else who joined.
No app. No account. No video ever leaves your phone: just the joints.

you@hackney:~/dance-vision$ npm run party
  → http://127.0.0.1:8787/   opens Controller. Open /studio on the HDMI telly.

you@hackney:~/dance-vision$ traceroute --from=phone --to=telly
 1  phone    camera + pose model, all in the browser     video out: 0 bytes
 2  ws       33 joints x {x,y,z} per frame               ~1.6 KB a frame
 3  relay    passes the joints to the host               never sees your face
 4  studio   three.js room on the telly: music, lights, up to 6 phones
```

<details>
<summary><b>DVTERM.NFO</b>: release info, protection: none, greetz</summary>

```text
╔════════════════════════════════════════════════════════════════════════════╗
║ ░▒▓█  D A N C E   V I S I O N  █▓▒░                   DVTERM.NFO · E8 2026 ║
╠════════════════════════════════[ release ]═════════════════════════════════╣
║                                                                            ║
║   release ......... dance-vision, green phosphor edition                   ║
║   supplied by ..... the Mare Street Moonwalkers                            ║
║   cracked by ...... nobody. there was nothing to crack                     ║
║   protection ...... none needed: camera pixels never leave the phone       ║
║   payload ......... 33 joints x {x,y,z}, ~1.6 KB a frame, 0 bytes of face  ║
║   players ......... up to 6 phones. dignity optional                       ║
║   requires ........ a phone, a pc, a telly, npm. rhythm not enforced       ║
║   prototype ....... unity, 2021: 3 webcam players, instructor on the wall  ║
║   first boot ...... 2026-09-13: one webcam, pose model on-device, 18 fps   ║
║                                                                            ║
╠══════════════════════════════[ entry points ]══════════════════════════════╣
║                                                                            ║
║   /controller ..... library, playback, players and settings                ║
║   /studio ......... the telly: room, music, choreography, phone relay      ║
║   /camera.html .... the phone: camera + pose model, reached via the QR     ║
║   /mapper ......... editable dance maps: waveform, move picker, publish    ║
║                                                                            ║
╠════════════════════════════════[ features ]════════════════════════════════╣
║                                                                            ║
║   six East London venues, each with a spotlight moment: a countdown        ║
║   names a dancer, then they get the camera, a spin and a cheering crew.    ║
║   YouTube dance videos can be mapped into choreography for the crew.       ║
║                                                                            ║
╠═════════════════════════════════[ greetz ]═════════════════════════════════╣
║                                                                            ║
║   the Clapton Cha-Cha Collective · Haggerston Hip Replacements ·           ║
║   the N38 Night Bus Breakers · Ridley Road Robots · every nan who ever     ║
║   did the Macarena at a wedding · and whoever keeps the chicken shop       ║
║   open till 4. you know who you are. we know what you ordered.             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

</details>

<details>
<summary><b>schematics.txt</b>: the original napkin diagram</summary>

```text
  you          phone (browser)       relay         host             tv

   o    cam  +--------------+ joints +----+ joints +------------+ +-----------+
  /|\  ====> | pose model   | =====> | ws | =====> | three.js   |=| \o/ o/ o  |
  / \        | 33 x {x,y,z} | 1.6 KB +----+        | cam, music | |  |  | /|\ |
             | frames: none | a frame              | 6 phones   | | / \/ \/ \ |
             +--------------+                      +------------+ +-----------+
   ^                                                                    |
   +----------- you watch yourself dance, about three seconds late -----+
```

</details>
