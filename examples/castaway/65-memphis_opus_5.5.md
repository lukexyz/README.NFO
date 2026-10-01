<p align="center">
  <img src="assets/65-memphis_opus_5.5.svg" width="100%" alt="CASTAWAY, in eight chunky hand-cut capitals, each a different colour and tilt (red, yellow, blue, black-and-white stripes, pink, teal, lilac, orange) with heavy black outlines and hard black shadows, across the top of a warm white laminate covered in small black squiggles, zigzags and coloured confetti, with big flat shapes laid over it: a pink quarter circle with blue stairs, a teal disc, a lilac half-disc, a striped slab, a yellow triangle and a checkerboard. Stickers on the left read: ISLAND FOR ONE. FULLY FURNISHED: 1 PALM, 1 RAFT AND 1 PAIR OF HEADPHONES. 10 HOURS. MOSTLY NOTHING. EVERY FEW MINUTES, A GAG, AND IT LANDS ON THE BEAT. EVERY SOUND SYNTHESIZED FROM CODE. NO SAMPLES. And a terminal chip: python tools/serve.py. On the right, a chunky window titled CASTAWAY, LIVE PREVIEW shows the island redrawn in the same style: a palm with a black-and-white striped trunk on a terrazzo sandbank, a sea of white squiggles, a raft, a bottle, a sun with a striped lower half, a woman in a coral tank top, cream shorts and cream headphones sitting and nodding to the beat, a shark fin wearing headphones nodding along, a coconut walking on crab legs, and a drone carrying a parcel of headphones. The control bar counts the bars of the theme, BAR 01/20 to 20/20, and reads 10:00:00.">
</p>

<h1 align="center">CASTAWAY</h1>

<p align="center">
  <b>An island for one, fully furnished: one palm, one raft, one pair of headphones, and ten hours in which almost nothing happens. On purpose.</b>
</p>

<p align="center">
  A stationary-frame lo-fi video for YouTube. A young woman sits on a tiny island with one tall palm, nodding to the music on her headphones. Every few minutes, something happens. A message in a bottle washes straight back. A drone delivers a parcel, and the parcel is more headphones. A shark in headphones surfaces and nods to the same beat. Then everybody goes back to nodding.<br>
  <sub>An unofficial remake, inspired by the small-island routines and visual comedy of the 1992 screensaver <i>Johnny Castaway</i>. Sunny, hand-painted coastal anime. 16:9, 1080p, 30 fps. Always daytime.</sub>
</p>

<p align="center">
  <b>The schedule:</b> more than 90 activities on four timers, from everyday routines every 2 to 5 minutes to super-rare callbacks every 3 to 6 hours. Each one waits for the next bar of the music, so every gag lands on the beat.<br>
  <b>The sound:</b> every note, wave and splash is synthesized from code in <a href="tools/make_audio.py"><code>tools/make_audio.py</code></a>. No samples, no borrowed loops, no recordings.
</p>

```sh
python tools/serve.py
# then open http://127.0.0.1:8765/
```

<p align="center">
  <sub>Live preview in the browser, then export a frame-exact, YouTube-ready MP4. Plain ES modules, no build step, no npm.<br>
  Assembly not required. Waiting is.</sub>
</p>

<p align="center">
  <img src="assets/65-memphis_opus_5.5-divider.svg" width="100%" alt="A strip of the same squiggle laminate, with a black-and-white striped block in the middle.">
</p>

<details>
<summary><b>CATALOGO 1992</b>: eight pieces that turn up on their own</summary>
<br>
<p align="center">
  <img src="assets/65-memphis_opus_5.5-catalogo.svg" width="100%" alt="A page from an imaginary design catalogue, CATALOGO 1992, stamped GRUPPO ISOLOTTO: eight cards, each a flat colour panel with one big shape behind one object, a number tab, an Italian name and two lines in English. 01 BOTTIGLIA, a green bottle with a note and an arrow looping back: a message, it washes straight back. 02 PACCO, a drone carrying a parcel with headphones on it: by drone, contains more headphones. 03 TARTARUGA, a turtle with a zigzag shell: visits, stays a bit, says nothing. 04 GATTO, a grey tabby with a white chest napping on a floating crate: arrives on a crate, naps up the palm. 05 SQUALO, a shark fin in cream headphones with a music note: wears headphones, nods on the beat. 06 COCCO, a coconut on crab legs: lands on a crab, walks off with it. 07 SEGNALE, a phone over a palm crown and one signal bar of four: one bar, only at the top of the palm. 08 CAFFÈ FREDDO, an iced coffee with a striped straw: she walks out over the sea to get one.">
</p>

The catalogue is a joke. The pieces are not: every one of them is an activity in [`activities.toml`](activities.toml), with its own timer, its own lane and its own synthesized sounds.

| N° | piece | what happens | in the schedule |
|:---:|:---|:---|:---|
| 01 | **Bottiglia** (bottle) | She sends a message in a bottle. It washes straight back. Much later, a different bottle brings a reply. | `message_in_bottle`, `bottle_reply` |
| 02 | **Pacco** (parcel) | A delivery drone drops a parcel. It contains another pair of headphones. | `delivery_drone` |
| 03 | **Tartaruga** (turtle) | A sea turtle swims in, crawls up beside her, and they both doze off. | `turtle_visit` |
| 04 | **Gatto** (cat) | A grey tabby with a white chest arrives on a crate, climbs the palm and naps. One day it floats away again. It comes back another time. | `cat_visit` |
| 05 | **Squalo** (shark) | A fin circles the island. The shark surfaces in headphones and nods to the same beat. They nod. It leaves. | `shark_nod` |
| 06 | **Cocco** (coconut) | A coconut falls on a passing hermit crab. Then the coconut walks off. | `coconut_crab` |
| 07 | **Segnale** (signal) | One bar of signal, available only at the top of the palm. | `signal_hunt` |
| 08 | **Caffè freddo** (iced coffee) | She could leave any time. She walks out over the water, and comes back with an iced coffee. Never explained. | `leave_any_time` |

Also in the range, uncatalogued: a tour boat of selfie-takers, a bro on an electric hydrofoil who waves a shaka and carves off, bushcraft (fire by friction, a hammock, a lookout up the palm, spear fishing), a kumara she plants that grows over the course of the video, coconut sipping, fishing, jogging laps, and a sandcastle that the tide takes.

</details>

<details>
<summary><b>SCHEDA TECNICA</b>: the spec sheet (schedule, sound, picture)</summary>

```text
 CASTAWAY                                 SCHEDA TECNICA  ·  SPEC SHEET
 ──────────────────────────────────────────────────────────────────────
 MODEL ............ island for one, fully furnished
 CONTENTS ......... 1 palm (tall), 1 raft, 1 pair of headphones (cream)
 OCCUPANT ......... one young woman: coral tank top, cream shorts,
                    brown hair in a loose low bun, bare feet. she nods
 FINISH ........... sunny, hand-painted coastal anime. always daytime
 FORMAT ........... 16:9 · 1080p · 30 fps · default run 10:00:00
 SEED ............. 1992. same seed, same video, event for event

 TIMER               EVERY             TYPICAL 10-HOUR RUN
   regular ......... 2 to 5 min        about 155 events
   occasional ...... 12 to 25 min      about 30
   rare ............ 30 to 60 min      about 13
   super rare ...... 3 to 6 hours      about 2 (never more than 3)
   + chained follow-ups: the tide takes the sandcastle, and so on
   (median of 200 simulated runs)

 BUSY ............. about a third of the time. idle for the rest
 LANES ............ she has one. the cat, the turtle, the sea and sky,
                    the shore and the garden have their own, so a ship
                    can sail past while she is busy with a coconut.
                    (it waits for her to get busy. she never sees it)
 ON THE BEAT ...... every activity starts on the next bar: every 3 s
 SCENE LIFE ....... 26 entries: shore waves and drifting cloud shadows
                    are built; birds, planes, whales, dolphins,
                    sailboats, sandpipers, a gecko and a rain shower
                    are planned
 MOTION ........... hard cuts and stepped movement by default

 SOUND ............ synthesized from code. no samples, loops or
                    recordings, so no third-party licence applies
   theme .......... seamless 60 s loop · 80 BPM · F major · ii-V-I-vi
                    20 bars of exactly 3 s: electric piano, kalimba
                    lead, soft drums, vinyl crackle
   ocean .......... seamless 60 s loop
   files .......... more than 150, and counting
   mix ............ -14 LUFS, true peak at or below -1 dBTP
   levels ......... adjustable: in master, and per routine
   listened to .... not yet. by anyone. it is very patient
```

The banner keeps the same time: its master loop is the theme's 20 bars of 3 seconds, the counter steps once a bar, the letters hop once a bar, and she and the shark nod once a beat (0.75 s at 80 BPM). Counts are as of 2026-10-01; more activities arrive every few hours.

</details>

<details>
<summary><b>THE TOOLS</b>: preview, export, schedule, sound</summary>
<br>

| file | what it does |
|:---|:---|
| [`tools/serve.py`](tools/serve.py) | The renderer: a web page with live preview at http://127.0.0.1:8765/. It exports frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome); the server mixes the sound and joins the two into a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. The page itself is [`web/index.html`](web/index.html). |
| [`tools/schedule.py`](tools/schedule.py) | Validates [`activities.toml`](activities.toml) and simulates a 10-hour run. `python tools/schedule.py` |
| [`tools/render_demo.py`](tools/render_demo.py) | The older Python reference renderer. `python tools/render_demo.py --dev` renders a dev reel of every activity with a heads-up display. |
| [`tools/make_audio.py`](tools/make_audio.py) | Where every sound is synthesized: the theme, the ocean, and every splash, scuttle and toot. |
| [`MUSING.md`](MUSING.md) | The working log: what holds now, what was decided, and what is still open. |

Status: in development. No video has been published yet, so there is nothing to link to. There is, however, a great deal of waiting already done.

</details>

<details>
<summary><b>CREDITI</b>: credits, and what is made up</summary>
<br>

- **The look** is after the Memphis Group (Milan, 1980 to 1987) and the squiggles-and-confetti graphics it sent through late-80s pop culture. Credited as a reference only: the squiggle laminate, the shapes and the lettering here are drawn from scratch by a seeded generator, and no real print, piece of furniture or typeface is copied.
- **The idea** is an unofficial homage to *Johnny Castaway* (1992), which belongs to its owners. Nothing from it is used here.
- **Invented for this page:** Gruppo Isolotto (the "islet group", the design collective that supposedly made the island) and its Catalogo 1992. Neither exists, which is the least surprising fact on this page.
- **The Italian** is real and literal: *isolotto* is a small island, *catalogo* a catalogue, *scheda tecnica* a spec sheet, *crediti* credits; the pieces are bottle, parcel, turtle, cat, shark, coconut, signal and iced coffee.
- **Every sound** in the video is synthesized from code. **Every picture** here is original vector art from a seeded generator, so it comes out the same, byte for byte, every time. Much like a 10-hour run with seed 1992.

</details>
