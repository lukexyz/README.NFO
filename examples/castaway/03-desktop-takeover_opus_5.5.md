<p align="center">
  <img src="assets/03-desktop-takeover_opus_5.5.svg" width="832" alt="Castaway, drawn as an old teal desktop that an island takes over. The word castaway is the darker-teal wallpaper; two icons, MUSING.md and activities.toml; a grey taskbar with a start button that says Wait and a clock at 10:00:00. One window titled Castaway pages through the pitch: a 10-hour lo-fi island video after a 1992 screensaver; 92 activities, each starting on the next 3-second bar of the music; every sound synthesized in code; run python tools/serve.py and open 127.0.0.1:8765. Then the window is minimised and the teal turns out to be sea. The wallpaper word becomes clouds, and under a palm a young woman in a coral tank top and headphones sips a coconut, eyes closed, while a ship sails past behind her. A hermit crab wearing a coconut walks along the taskbar. When she looks up and waves, the sea is empty. Somebody moves the mouse and the desktop comes back.">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>A 10-hour lo-fi island video in which almost nothing happens, on purpose.</b><br>
  <sub>working title &middot; an unofficial remake inspired by the 1992 screensaver <i>Johnny Castaway</i> &middot; 16:9, 1080p, 30 fps &middot; always daytime</sub>
</p>

One young woman, one tall palm, one raft and a lot of time. She mostly idles, nodding to the music on her headphones, and every so often something happens: a message in a bottle washes straight back, a drone delivers another pair of headphones, a shark in headphones nods along. And a ship sails past exactly while she is sipping a coconut with her eyes closed. She never sees it.

**92 activities**, all in [`activities.toml`](activities.toml): 81 on four timers (regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, super rare every 3 to 6 hours) and 11 follow-ups that something else sets off. Each one waits for the next bar of the music (every 3 seconds), so the gags land on the beat. Lanes let things overlap, which is how the ship gets past.

**Every sound is synthesized from code** by [`tools/make_audio.py`](tools/make_audio.py): 151 files, and no samples, borrowed loops or recordings, so no third-party licence applies.

**Run it**, then open <a href="http://127.0.0.1:8765/">http://127.0.0.1:8765/</a> for the live preview and the export to a YouTube-ready MP4:

```sh
python tools/serve.py
```

<sub>The desktop in the banner is a drawing. The mouse is the only thing in it that is ever in a hurry.</sub>

<details>
<summary><b>Task List</b>: six lanes, which is how a ship gets past unseen</summary>

```text
┌─ Island Task List ─────────────────────────────────────────────────────┐
│                                                                        │
│  Lane       Runs                                 In the banner         │
│  ────────   ──────────────────────────────────   ───────────────────   │
│  castaway   her, one activity at a time          coconut_sip           │
│  sea_sky    the ship, the drone, boats, a shark  ship_passes_unseen    │
│  cat        the stray cat, when it visits        out on its crate      │
│  turtle     the sea turtle                       somewhere, dozing     │
│  shore      the tide washing things away         waiting for a castle  │
│  garden     the kumara patch                     nothing planted yet   │
│                                                                        │
│  ship_passes_unseen prefers to start while she is busy (coconut_sip,   │
│  sandcastle, fishing_quiet or jog_lap) and will wait up to 10 minutes  │
│  for the chance. Eyes closed, headphones on: the schedule is on the    │
│  ship's side.                                                          │
│                                                                        │
│                      [ End Task ]   [ Let It Sail ]                    │
└────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>Screen Saver settings</b>: what a 10-hour run looks like</summary>

```text
┌─ Screen Saver: Castaway ───────────────────────────────────────────────┐
│                                                                        │
│  Wait   [  2 ] to [  5 ] minutes    regular      about 155 a run       │
│  Wait   [ 12 ] to [ 25 ] minutes    occasional   about 30              │
│  Wait   [ 30 ] to [ 60 ] minutes    rare         about 13              │
│  Wait   [  3 ] to [  6 ] hours      super rare   about 2 (3 at most)   │
│                                     chained      about 20 follow-ups   │
│                                                                        │
│  Run length ... 10:00:00            Seed ....... 1992                  │
│  Start on ..... the next bar        One bar .... 3 seconds             │
│                                                                        │
│  Same seed, same schedule, event for event. She is busy about a third  │
│  of the time and idling the rest. Both are the point.                  │
│                                                                        │
│  Counts are medians of 200 simulated runs. One run, event by event:    │
│  python tools/schedule.py                                              │
└────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>Things that happen</b>, eventually: the gags</summary>

- A message in a bottle that washes straight back. Hours later, a different bottle brings a reply.
- A delivery drone. The parcel is another pair of headphones.
- A sea turtle who comes to visit.
- A stray cat that arrives on a crate, climbs the palm, naps, and one day floats away again. It comes back another time.
- The signal hunt: one bar of signal, at the top of the palm.
- A shark wearing headphones, nodding to the beat.
- A tour boat full of selfie-takers.
- A coconut falls on a hermit crab, and then the coconut walks off with the crab wearing it. (It is the one on the taskbar.)
- She could leave any time: she walks out over the water and comes back with an iced coffee. Never explained.
- A bro on an electric hydrofoil, who waves a shaka and carves off.
- Bushcraft: fire by friction, a hammock, a lookout up the palm, spear fishing.
- A kumara she plants, which grows over the course of the video.
- And the everyday ones: coconut sipping, fishing, jogging laps, a sandcastle that the tide takes, waving for rescue.

Scene life runs underneath all of it: shore waves and drifting cloud shadows are built; distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.

</details>

<details>
<summary><b>Sound</b>: what the note in the tray is playing</summary>

```text
 ♪ theme   seamless 60 s loop, 80 BPM, F major, ii-V-I-vi
           20 bars of exactly 3 s: electric piano, kalimba lead,
           soft drums, vinyl ticks and hiss

   0     6           18          30                48          60 s
   ├─────┼───────────┼───────────┼─────────────────┼───────────┤
   intro  groove      + kalimba   theme             breakdown
   keys

 ~ ocean   also a seamless 60 s loop
 = mix     -14 LUFS, true peak at or below -1 dBTP
           levels adjustable in master and per routine
 ? heard   not yet, by anyone. The meters are happy. The ears are pending.
```

All 151 files come out of [`tools/make_audio.py`](tools/make_audio.py). No samples, no borrowed loops, no recordings.

</details>

<details>
<summary><b>Tools</b>: the four you will actually use</summary>

- [`python tools/serve.py`](tools/serve.py), then <a href="http://127.0.0.1:8765/">http://127.0.0.1:8765/</a>: the renderer ([`web/index.html`](web/index.html)). Live preview, and frame-exact export in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome); the server mixes the sound and joins the two into an MP4. Plain ES modules, no build step, no npm packages.
- [`python tools/schedule.py`](tools/schedule.py): validates the schedule and simulates a 10-hour run.
- [`python tools/render_demo.py --dev`](tools/render_demo.py): a dev reel of every activity with a heads-up display (the older Python reference renderer).
- [`tools/make_audio.py`](tools/make_audio.py): where every sound comes from.

Hard cuts and stepped movement are the motion defaults. More in [`MUSING.md`](MUSING.md).

</details>

<details>
<summary><b>About this desktop</b>: credits and greetz</summary>

```text
┌─ About Castaway ───────────────────────────────────────────────────────┐
│                                                                        │
│   castaway (working title)                                             │
│   brought to your desktop by the Mouse Stillness Society               │
│                                                                        │
│   The banner is one SVG file and some CSS: 30 seconds, which is 10     │
│   bars of the theme, which is 40 beats. The island takes over in hard  │
│   cuts and stepped moves, because those are the project's own motion   │
│   defaults. The clock says 10:00:00 because that is how long a run     │
│   lasts. The start button says Wait because that is most of the job.   │
│                                                                        │
│   Greetz to the Horizon Watch Committee (still watching), the Idle     │
│   Hands Listening Club, the Shade Allocation Office, the Coconut       │
│   Shell Housing Co-op, Palm Frond Facilities, and the Department of    │
│   Leaving It Running.                                                  │
│                                                                        │
│   Unofficial. Inspired by a 1992 screensaver, not affiliated with it.  │
│   Always daytime.                                                      │
│                                                                        │
│                              [    OK    ]                              │
└────────────────────────────────────────────────────────────────────────┘
```

</details>
