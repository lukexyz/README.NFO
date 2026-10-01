<p align="center">
  <img src="assets/13-bouncing-logo_opus_5.5.svg" width="100%" alt="CASTAWAY as the idle screen of a disc player left on all day. On a black 16:9 screen in a dark rounded bezel, the wordmark CASTAWAY, heavy oblique capitals whose T is a palm tree growing out of a flat oval island marked LO-FI ISLAND, drifts diagonally, bounces off the edges and changes colour at every bounce: coral, sun yellow, lagoon, palm green, sea blue, hibiscus pink, lilac. Every 45 seconds it hits a corner exactly, top right at 0:16 and top left at 1:01, and turns sun-bleached cream with a soft flash and ripples. The bezel reads CASTAWAY, a 10-hour lo-fi island video, and counts down to the next corner. The captions go NOT YET, CLOSER, SO CLOSE, then CORNER! EVERYONE SAW IT. Meanwhile a small grey steamer sails along the bottom of the screen, and the next caption admits that nobody saw it. Between corners the captions explain the project: she idles, nodding to the music; every so often something happens, always on the next bar; every sound is synthesized from code; ten hours, seed 1992, always daytime; run it with python tools/serve.py and open http://127.0.0.1:8765/.">
</p>

<h1 align="center">CASTAWAY</h1>

<p align="center">
  <b>Ten hours of one tiny island. Almost nothing happens, on purpose.</b>
</p>

<p align="center">
  A stationary-frame lo-fi video for YouTube: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly sits there nodding to the music on her headphones. Every so often, something happens. A message in a bottle washes straight back. A drone delivers a parcel, and the parcel is another pair of headphones. A shark in headphones nods along to the beat. And a ship sails past, exactly while she is busy with a coconut.<br>
  <sub>An unofficial remake, inspired by the small-island routines and visual comedy of the 1992 screensaver <i>Johnny Castaway</i>. Sunny, hand-painted coastal anime. 16:9, 1080p, 30 fps, and always daytime.</sub>
</p>

<p align="center">
  <b>The schedule:</b> ninety-odd activities, from everyday routines every 2 to 5 minutes to super-rare callbacks every 3 to 6 hours. Each one starts on the next bar of the music, so every gag lands on the beat.<br>
  <b>The sound:</b> every note, gull and wave is synthesized from code in <a href="tools/make_audio.py"><code>tools/make_audio.py</code></a>. No samples, no borrowed loops, no recordings, so no third-party licence.
</p>

```sh
python tools/serve.py
# then open http://127.0.0.1:8765/
```

<p align="center">
  <sub>Live preview in the browser, then export a frame-exact, YouTube-ready MP4. Plain ES modules, no build step, no npm.<br>
  The logo above hits a corner every 45 seconds and the countdown is exact. You will still miss the ship.</sub>
</p>

<details>
<summary><b>THE CORNER, EXPLAINED</b>: the bounce maths, and why the countdown is never wrong</summary>

```text
 FLAT CALM HOME VIDEO                         IDLE SCREEN · SERVICE NOTES
 ─────────────────────────────────────────────────────────────────────────
 ACROSS ............ 5.0 s per horizontal crossing
 DOWN .............. 4.5 s per vertical crossing
 CORNER ............ both bounces land at once: every 45 s
 LOOP .............. 90 s, then the same path again, bounce for bounce
 WHERE ............. top right at 0:16, top left at 1:01

 THE RUN-UP TO EVERY CORNER (the misses close in by half a second)
   missed by 1.5 s ..... NOT YET.
   missed by 1.0 s ..... CLOSER...
   missed by 0.5 s ..... SO CLOSE.
   missed by 0.0 s ..... CORNER! EVERYONE SAW IT.
   meanwhile ........... a ship sailed past. nobody saw that.

 COLOURS ........... 36 bounces a loop, a new colour at each one: coral,
                     sun, lagoon, palm, sea, hibiscus and lilac, and
                     sun-bleached cream for a corner
 STANDBY LIGHT ..... pulses at 80 BPM, the tempo of the theme. it nods
                     along, like her
 REDUCED MOTION .... the logo waits in the corner it was always heading
                     for. the ship waits too. nobody looks
```

The countdown can be exact because nothing in the picture is left to chance: even the colour order comes from a fixed seed. Castaway works the same way: a run is seeded (`seed = 1992` in [activities.toml](activities.toml)), and the same seed gives the same video, event for event. The video's version of a corner hit is the super-rare tier: once every 3 to 6 hours, never more than 3 times a run.

</details>

<details>
<summary><b>PROGRAMME GUIDE</b>: what a typical ten hours looks like, and what turns up</summary>

```text
 CASTAWAY · 10:00:00 · SEED 1992 · ALWAYS DAYTIME
 ─────────────────────────────────────────────────────────────────────────
 TIER           COMES ROUND EVERY       IN A TYPICAL RUN
 regular        2 to 5 minutes          about 155
 occasional     12 to 25 minutes        about 30
 rare           30 to 60 minutes        about 13
 super rare     3 to 6 hours            about 2 (never more than 3)
 chained        when another one        about 20 follow-ups
                says so
 ─────────────────────────────────────────────────────────────────────────
 busy about a third of the time, idling the rest, starting on the bar
 (one bar = 3 s). counts: the median of 200 simulated runs, as the
 schedule's own header puts it

 NOW SHOWING, EVERY SO OFTEN
   · a message in a bottle that washes straight back. a different
     bottle, later, brings a reply
   · a delivery drone. the parcel: another pair of headphones
   · a sea turtle who visits
   · a grey tabby who arrives on a crate, climbs the palm, naps, and
     one day floats away again (and comes back another time)
   · the signal hunt: one bar of signal, at the top of the palm
   · a shark in headphones, nodding to the beat
   · a tour boat of selfie-takers
   · a coconut falls on a hermit crab. the coconut walks off
   · she could leave any time: she walks out over the water and comes
     back with an iced coffee
   · a bro on an electric hydrofoil: a shaka, a carve, gone
   · bushcraft: fire by friction, a hammock, a lookout up the palm,
     spear fishing
   · a kumara, planted, growing over the course of the video
   · a sandcastle. the tide takes it
   · waving for rescue. see: ship, above
```

Lanes let things overlap: she has one, and the cat, the turtle, the sea and sky, the shore and even the kumara patch each have their own. So a ship can sail past while she is busy with a coconut. That is the whole joke, and it is in the schedule on purpose. Run `python tools/schedule.py` to check the schedule and simulate a ten-hour run.

</details>

<details>
<summary><b>SETUP MENU</b>: the tools, the sound, credits and greetz</summary>

```text
 SETUP MENU                                         FLAT CALM HOME VIDEO
 ─────────────────────────────────────────────────────────────────────────
 PICTURE
   python tools/serve.py ......... the renderer: a web page with a live
                                   preview at http://127.0.0.1:8765/
   EXPORT ........................ frame-exact H.264 in the browser
                                   (WebCodecs: 68 to 78 frames a second
                                   at 1080p30 in Chrome). the server
                                   mixes the sound and joins the two
                                   into an MP4
   python tools/schedule.py ...... validates the schedule, simulates a
                                   ten-hour run
   python tools/render_demo.py --dev
                                   a dev reel of every activity with a
                                   heads-up display (the older Python
                                   reference renderer)
   MOTION ........................ hard cuts and stepped movement
 SOUND
   python tools/make_audio.py .... synthesizes all of it from code
   THEME ......................... a seamless 60 s loop: 80 BPM, F major,
                                   ii-V-I-vi, 20 bars of exactly 3 s.
                                   electric piano, kalimba lead, soft
                                   drums, vinyl crackle
   OCEAN ......................... also a seamless 60 s loop
   LEVELS ........................ -14 LUFS, true peak at or below
                                   -1 dBTP; master and per-routine
                                   volumes
   LISTENED TO BY ................ nobody, yet. it has passed its
                                   loudness checks, which is more than
                                   most of us can say
 STATUS
   in development. no video has been published, so there is no link.
   the working notes live in MUSING.md

 CREDITS
   the island, her, the gags ..... Castaway
   the idle screen ............... Flat Calm Home Video, which does not
                                   exist and has never made a television
   the inspiration ............... Johnny Castaway (1992), which belongs
                                   to its owners. this is an unofficial
                                   remake, in spirit only

 GREETZ
   the Corner Watch Society (meets wherever a logo is about to land),
   the Half-Second Club (one near miss before every corner, guaranteed),
   and the ship, which keeps coming back. one day somebody will look.
```

</details>

<p align="center"><sub>Flat Calm Home Video, the Corner Watch Society and the Half-Second Club are invented. The ship is drawn along the bottom of the screen, in case anybody ever looks.</sub></p>
