<p align="center">
  <img src="assets/09-pinball-dmd_opus_5.5.svg" width="830" alt="CASTAWAY on the orange dot-matrix score display of an imaginary 1990s pinball machine by the invented Becalmed Amusement Works, in a black bezel marked 1 player, 10-hour ball, free play. It runs a 60-second attract loop, 20 bars of 3 seconds, and slides or cuts between screens on the bar. Title: CASTAWAY in giant glowing dot letters with a sparkle sweeping across, under the line One palm, one raft, no hurry, and over the line A 10-hour lo-fi island video, then Inspired by a 1992 screensaver. Island: a sun, two drifting clouds, a tall palm, a raft bobbing in time, and a small young woman in headphones holding a coconut up to her face, nodding on every beat, while a ship sails right past behind her and toots. She lowers the coconut too late; a question mark appears. Award, with one inverted flash: SHIP MISSED. Coconut in the way. She was busy. It happens. Rules, one line per beat: She idles. And nods to the music. Every so often, something happens. Then 81 activities counts up: in four tiers, each one starts on the next bar. Scores for a typical 10-hour run: regular 155, occasional 30, rare 13, super rare 2; busy a third of the time. Message in a bottle: she throws it, it splashes down and floats straight back to her feet; bottle returned; a reply comes later, in a different bottle. Special delivery: a drone drops a parcel, which opens to reveal headphones; contents: another pair. Shark sighted: a fin wearing headphones nods on the beat; he is just here for the music. Hermit crab: a coconut falls from the palm onto a crab, BONK, and the crab walks off wearing it; new shell, upgrade: coconut, no refunds. Signal hunt: 1 bar, top of the palm only. Sound test: samples used spins and lands on 0; every sound is code, and nobody has heard it yet. Then 80 BPM with a beat lamp, F major, ii-V-I-vi, 20 bars of 3 seconds, so is this screen. Press start: python tools/serve.py types itself out, then open 127.0.0.1:8765.">
</p>

<h1 align="center">CASTAWAY</h1>

<p align="center">
  <b>A ten-hour lo-fi video of a tiny island on which almost nothing happens. On purpose.</b><br>
  <sub>Unofficial and drawn from scratch: in the spirit of <i>Johnny Castaway</i>, the 1992 desert-island screensaver. Not affiliated with it or its owners.</sub>
</p>

One young woman, one tall palm, one raft and a great deal of time. She idles, nodding to the music in her headphones, and every so often something happens: a message in a bottle washes straight back, a drone delivers a parcel that turns out to be another pair of headphones, a shark in headphones nods along on the beat, and a ship sails past exactly while she is busy with a coconut. She does not see it. She never sees it. Sunny, hand-painted coastal anime, always daytime, 16:9 at 1080p and 30 fps, made for YouTube.

**[81 activities](activities.toml)** in four tiers (plus chained follow-ups), from *regular* (every 2 to 5 minutes) to *super rare* (every 3 to 6 hours), and each one starts on the next bar of the music, every 3 seconds, so the gags land on the beat. **Every sound is synthesized from code** by [`tools/make_audio.py`](tools/make_audio.py): no samples, no stock loops, no recordings, so no licences to worry about.

```sh
python tools/serve.py
# then open http://127.0.0.1:8765/
```

<p align="center">
  <a href="tools/serve.py"><kbd>PRESS START</kbd></a>
  <a href="activities.toml"><kbd>RULE CARD</kbd></a>
  <a href="tools/schedule.py"><kbd>SIMULATE A RUN</kbd></a>
  <a href="MUSING.md"><kbd>OPERATOR'S LOG</kbd></a>
  <kbd>TILT</kbd> <i>(please don't: it's an island)</i>
</p>

The renderer is [a web page](web/index.html) with a live preview and one button for a YouTube-ready MP4: frame-exact H.264 straight out of the browser (WebCodecs, 68 to 78 frames a second at 1080p30 in Chrome), with the sound mixed in by the server. Plain ES modules, no build step, no npm. It is in development: no video is out yet, and nobody has heard the soundtrack yet, not even the code that wrote it.

<details>
<summary><b>RULE CARD</b>: how a ten-hour game plays out</summary>

```text
 ┌────────────────────────────────────────────────────────────────────────────┐
 │ CASTAWAY                                   1 PLAYER · 10-HOUR BALL         │
 │ ────────────────────────────────────────────────────────────────────────── │
 │ 1. SHE IDLES, nodding to the music in her headphones. That is most of      │
 │    the game, and it is meant to be.                                        │
 │                                                                            │
 │ 2. Every tier has its own timer. When one goes off, an activity from       │
 │    that tier starts on the next bar of the music: every 3 seconds.         │
 │                                                                            │
 │    TIER          COMES ROUND EVERY      IN A TYPICAL 10-HOUR RUN           │
 │    regular       2 to 5 minutes         about 155                          │
 │    occasional    12 to 25 minutes       about 30                           │
 │    rare          30 to 60 minutes       about 13                           │
 │    super rare    3 to 6 hours           about 2 (3 a run at most)          │
 │    chained       only after another     about 20 follow-ups                │
 │                                                                            │
 │ 3. LANES let things overlap. A ship may cross the horizon while she is     │
 │    busy with a coconut. She will not see it. This is the main rule.        │
 │                                                                            │
 │ 4. She is busy about a third of the time. The rest is waiting.             │
 │                                                                            │
 │ 5. SAME SEED, SAME VIDEO. Default run 10:00:00, seed 1992.                 │
 │ ────────────────────────────────────────────────────────────────────────── │
 │ 81 activities in the four timed tiers as of 2026-10-01, plus chained       │
 │ follow-ups. Typical counts are the median of 200 simulated runs.           │
 │ python tools/schedule.py checks this card and simulates a 10-hour run.     │
 └────────────────────────────────────────────────────────────────────────────┘
```

The display's score screen is this card's last column, rounded the same way. The machine adds nothing for style points. There are no style points.

</details>

<details>
<summary><b>AWARDS</b>: a few of the gags, as the display would announce them</summary>

```text
  SHIP MISSED ............ a ship crosses the horizon while she is busy.
                           Headphones on. She never sees it
  BOTTLE RETURNED ........ her message in a bottle washes straight back
  REPLY RECEIVED ......... later, a different bottle brings an answer
  SPECIAL DELIVERY ....... a drone drops a parcel: another pair of headphones
  SIGNAL FOUND ........... one bar, at the very top of the palm
  SHARK SIGHTED .......... he wears headphones and nods on the beat
  NEW SHELL .............. a coconut falls on a hermit crab, who walks off
                           wearing it
  VISITOR ................ a sea turtle drops by
  STOWAWAY ............... a grey tabby with a white chest arrives on a crate,
                           climbs the palm, naps, and one day floats away again.
                           Then comes back another time
  TOUR BOAT .............. a boatload of selfie-takers
  SHAKA .................. a bro on an electric hydrofoil waves and carves off
  SHE COULD LEAVE ANY TIME she walks out over the water and comes back with
                           an iced coffee
  BUSHCRAFT .............. fire by friction, a hammock, a lookout up the palm,
                           spear fishing
  GARDEN ................. a kumara, planted, growing over the video
  TIDE WINS .............. she builds a sandcastle. The tide takes it
  RESCUE? ................ she waves for rescue. See SHIP MISSED
```

Meanwhile the scene keeps itself busy: shore waves and drifting cloud shadows are built, and birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are on the list. Twenty-six entries in all, none of them in a hurry.

</details>

<details>
<summary><b>SOUND TEST</b>: what will come out of the speakers</summary>

```text
  THEME ......... a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi):
                  20 bars of exactly 3 seconds, electric piano, kalimba lead,
                  soft drums and the pops and hiss of old vinyl
  OCEAN ......... also a seamless 60-second loop
  MIX ........... -14 LUFS, true peak at or below -1 dBTP
  LEVELS ........ adjustable in master and per routine, in activities.toml
  SAMPLES USED .. 0. Every file is synthesized by tools/make_audio.py
  LICENCES ...... none needed: no samples, stock loops or recordings
  LISTENED TO ... not yet, by anyone. The beat lamp on the display is
                  keeping time for a song it has never heard
```

The display's attract loop is also 20 bars of 3 seconds, so its cuts land where the theme's bars would. It cannot play the theme. It is a picture.

</details>

<details>
<summary><b>SERVICE MENU</b>: operator settings, the board set, credits, greetz</summary>

```text
  BECALMED AMUSEMENT WORKS            SERVICE MENU           CASTAWAY, REV 0
  ───────────────────────────────────────────────────────────────────────────
  OPERATOR SETTINGS
   BALL TIME ........... 10:00:00, the default run
   RANDOM SEED ......... 1992. Same seed, same video, event for event
   PICTURE ............. 16:9, 1080p, 30 fps, one stationary frame
   TIME OF DAY ......... daytime. Always. It is a rule
   MOTION .............. hard cuts and stepped movement
   EXTRA BALL .......... none. She could leave any time

  BOARD SET
   python tools/serve.py ............ the renderer: live preview, MP4 export
                                      (then open http://127.0.0.1:8765/)
   python tools/schedule.py ......... validates the schedule, simulates a run
   python tools/render_demo.py --dev  a dev reel of every activity, with a
                                      heads-up display (the older renderer)
   tools/make_audio.py .............. synthesizes every sound
   activities.toml .................. the whole schedule, beat by beat

  CREDITS (REAL)
   inspired by ......... Johnny Castaway, the 1992 desert-island screensaver.
                         Unofficial: not affiliated with it or its owners
   everything else ..... drawn, coded and synthesized for this project

  GREETZ (INVENTED)
   the Slack Tide Social Club · the Hermit Crab Housing Authority ·
   everyone who has left a ten-hour video on for eleven minutes ·
   the ship, which tried

  NO GREETZ
   the coconut. It knows what it did
  ───────────────────────────────────────────────────────────────────────────
```

Becalmed Amusement Works does not exist, and neither does the machine: the display is a drawing, made for this README. There is no coin slot. Please do not tilt the island.

</details>
