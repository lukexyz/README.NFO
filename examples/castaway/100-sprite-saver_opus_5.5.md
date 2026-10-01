<p align="center">
  <img src="assets/100-sprite-saver_opus_5.5.svg" width="100%" alt="CASTAWAY in big blocky pixel capitals, lit in flat bands of cream, sun yellow, orange and coral over a plum block shadow, on the black screen of a beige 1990s monitor that is running a screen saver. Seventeen pixel-art sea turtles, one of them in tiny cream headphones, paddle across the screen on the same diagonal, top right to bottom left, one flipper stroke per beat at 80 BPM, the fast ones overtaking the slow ones, with five tumbling messages in bottles among them. A white glint sparkles on a letter once a bar. Now and then a cameo crosses in front of the title: the castaway herself, a young woman in cream headphones, a coral tank top and cream shorts, walking over the water with an iced coffee; a grey tabby cat sitting on a floating crate; a coconut walking off on hermit crab legs. A message line scrolls along the bottom: CASTAWAY, a lo-fi island video for very long afternoons; she idles, nodding to the music, and every so often something happens; a bottle washes straight back; a hermit crab walks off wearing a coconut; more than 90 activities, every one on the beat; every sound synthesized from code; python tools/serve.py. The monitor's badge reads SEA STATE 14C.">
</p>

<h1 align="center">CASTAWAY</h1>

<p align="center">
  <b>A lo-fi island video for very long afternoons. Leave it running: something will turn up.</b><br>
  <sub>working title · an unofficial remake inspired by the 1992 screensaver <i>Johnny Castaway</i> · 16:9, 1080p, 30 fps · always daytime</sub>
</p>

A stationary-frame video for YouTube, in the spirit of the ten-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music on her headphones. Every so often, something happens. A message in a bottle washes straight back. A sea turtle drops by. A coconut falls on a hermit crab, and the crab walks off wearing it. She walks out over the water and comes back with an iced coffee, because she could leave any time. Then she goes back to idling, which is most of the video, and that is the point.

**More than 90 activities** live in [`activities.toml`](activities.toml), on four timers: every 2 to 5 minutes for the everyday things, then 12 to 25 minutes, 30 to 60 minutes, and every 3 to 6 hours for the super rare ones. Every activity waits for the next bar of the music (one bar is 3 seconds), so the gags land on the beat. So do the turtles.

**Every sound is synthesized from code** in [`tools/make_audio.py`](tools/make_audio.py): more than 150 files, and not one sample, loop or recording among them, so no third-party licence applies.

```sh
python tools/serve.py
# then open http://127.0.0.1:8765/
```

<p align="center">
  <sub>Live preview in the browser, then export to a YouTube-ready MP4. Plain ES modules, no build step, no npm packages.</sub>
</p>

<p align="center">
  <img src="assets/100-sprite-saver_opus_5.5-panel.svg" width="100%" alt="The saver's control panel: a grey 1990s window titled Broad Daylight, with a small sun icon. At left, a Modules list: Sea Turtles (selected), Bottle Returned, Cat on a Crate, Coconut Crab, Leave Any Time, Signal Hunt, Shark Nodding, Parcel Drone and Ticker Tape, each with a tiny icon, and a scroll bar whose thumb is very small, over the note showing 9 of 90+. In the middle, a Preview window where turtles and a bottle swim past, the buttons Demo and Nap, and Saver set to On. At right, Sea Turtles: 17 turtles and 5 bottles cross on one diagonal, a stroke a beat. Sliders: Turtles, from few to many; Something happens, a scale from 1 minute to 6 hours marked with the four timers in green, blue, orange and coral; She is busy, filled to a third; and Darkness, greyed out and locked, always daytime. A Ticker field holds the message line. The footer reads Broad Daylight 1.0, Sea State Software, and run: python tools/serve.py.">
</p>

<p align="center">
  <sub>The darkness slider is greyed out on purpose. It is always daytime on this island: that is a project rule, not a setting.</sub>
</p>

<details>
<summary><b>Modules</b>: every gag on the list, one line each</summary>

```text
 BROAD DAYLIGHT · MODULES                                  showing 13 of 90+
 ────────────────────────────────────────────────────────────────────────────
 Sea Turtles ........ a sea turtle visits the island. on the saver, there
                      are seventeen, and they keep time.
 Bottle, Returned ... she sends a message in a bottle. it washes straight
                      back. much later, a different bottle brings a reply.
 Cat on a Crate ..... a stray cat (grey tabby, white chest) arrives on a
                      crate, climbs the palm and naps. one day it floats
                      away again. another day, it comes back.
 Coconut Crab ....... a coconut falls on a hermit crab. the coconut walks
                      off, with the crab wearing it.
 Leave Any Time ..... she walks out over the water and comes back with an
                      iced coffee.
 Signal Hunt ........ there is one bar of signal. it is at the top of the
                      palm.
 Shark, Nodding ..... a shark wearing headphones nods to the beat.
 Parcel Drone ....... a delivery drone brings a parcel. it is another pair
                      of headphones.
 Tour Boat .......... a boat of selfie-takers goes by.
 Shaka .............. a bro on an electric hydrofoil waves a shaka and
                      carves off.
 Bushcraft .......... fire by friction, a hammock, a lookout up the palm,
                      spear fishing.
 Kumara ............. she plants one. it grows over the course of the video.
 Ticker Tape ........ the line along the bottom of the saver. the only
                      module that is not on the island.
 ────────────────────────────────────────────────────────────────────────────
 also: coconut sipping, fishing, jogging laps, a sandcastle the tide takes,
 waving for rescue, and a great deal of nodding along.
```

</details>

<details>
<summary><b>Something happens</b>: the four timers, and what a typical ten hours holds</summary>

```text
 TIMER         COMES ROUND EVERY     IN A TYPICAL 10-HOUR RUN
 ────────────────────────────────────────────────────────────────────
 regular       2 to 5 minutes        about 155
 occasional    12 to 25 minutes      about 30
 rare          30 to 60 minutes      about 13
 super rare    3 to 6 hours          about 2 (never more than 3)
 chained       when another one      follow-ups, such as the tide
               says so               after a sandcastle
 ────────────────────────────────────────────────────────────────────
 typical = the median of 200 simulated runs. she is busy about a third
 of the time and idling the rest. default run: 10:00:00, seed 1992.

 ON THE BAR ..... every start snaps to the next bar of the theme, so
                  gags land on the beat (one bar = 3 s at 80 BPM)
 LANES .......... things can overlap: a ship can sail past while she
                  is busy with a coconut, which is the classic joke
 SCENE LIFE ..... 4 always-on effects and 22 timed events: shore waves
                  and drifting cloud shadows are built; birds, planes,
                  whales, dolphins, sailboats, a gecko and a rain
                  shower are planned
```

`python tools/schedule.py` validates [`activities.toml`](activities.toml) and simulates a ten-hour run.

</details>

<details>
<summary><b>Sound</b>: synthesized, all of it, and not yet heard</summary>

```text
 THEME ........... a seamless 60 s loop: 80 BPM, F major, ii-V-I-vi,
                   20 bars of exactly 3 s
 VOICES .......... electric piano, kalimba lead, soft drums, vinyl crackle
 OCEAN ........... its own seamless 60 s loop
 LEVELS .......... mix at -14 LUFS, true peak at or below -1 dBTP;
                   master volume and a level per routine
 FILES ........... more than 150, every one made by tools/make_audio.py
 SAMPLES ......... none
 LOOPS ........... none borrowed
 RECORDINGS ...... none
 HEARD BY ........ nobody yet. the turtles are keeping an open mind.
```

</details>

<details>
<summary><b>Running it</b>: the renderer, the scheduler and an older reel</summary>

```text
 python tools/serve.py               the renderer: a web page with live
                                     preview, at http://127.0.0.1:8765/
 python tools/schedule.py            validate the schedule, simulate a
                                     ten-hour run
 python tools/render_demo.py --dev   a dev reel of every activity with a
                                     heads-up display (the older Python
                                     reference renderer)
```

Export happens in the browser and is frame-exact (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome); the server mixes the sound and joins the two into an MP4. Hard cuts and stepped movement are the motion defaults, which is also how the turtles above get about. The page itself is [`web/index.html`](web/index.html); the working notes are in [`MUSING.md`](MUSING.md). Status: in development, nothing published yet.

</details>

<details>
<summary><b>About this saver</b>: credits, greetz and a disclaimer</summary>

Broad Daylight, Sea State Software and the 14C monitor are made up. The banner is a picture of a screen saver in the style of the modular desk-toy savers of the early 1990s, drawn pixel by pixel for this README; the island has no screen saver and does not need one. It has turtles. Castaway itself is an unofficial remake inspired by the 1992 screensaver *Johnny Castaway*, which belongs to its owners.

Greetz to the Turtle Census Bureau (they counted seventeen, twice), the Noon Shift (still on) and the Hatchling Club (still paddling).

</details>

<p align="center">
  <sub>Move the mouse to wake her. She is not asleep. She is listening to music.</sub>
</p>
