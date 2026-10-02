<p align="center">
  <img src="assets/97-classic-saver-set_opus_5.5.svg" width="100%" alt="CASTAWAY in big sun-yellow serif capitals with jagged, unsmoothed edges, on the black screen of an old screen saver. Behind the name, two thin-line quadrilaterals bounce off the edges of the screen, each trailing a ribbon of colour-shifting copies. Every so often, always on the bar line, the two polygons snap into a picture for a bar or two, with a caption beside it: a ship (she was busy), a message in a bottle (it washes straight back), a sandcastle that the tide flattens, a shark fin nodding on the beat (a shark in headphones), and an iced coffee with a straw (she could leave any time, she came back with an iced coffee). Then they fly apart again as if nothing happened. Under the name: a ten-hour lo-fi island video in which almost nothing happens, on purpose. Along the bottom a cyan marquee scrolls the pitch: she idles, nodding to the music on her headphones; every 2 to 5 minutes something happens, always on the next bar; more than 90 activities, most of them on four timers; every sound is synthesized from code; python tools/serve.py, then open http://127.0.0.1:8765/; always daytime.">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>A ten-hour lo-fi island video. You leave it on. That is the whole idea.</b><br>
  <sub>working title &middot; an unofficial remake inspired by the 1992 screensaver <i>Johnny Castaway</i> &middot; 16:9 &middot; 1080p &middot; 30 fps &middot; always daytime</sub>
</p>

Screen savers were invented so that a picture left on all day would not burn itself into the screen. Castaway is a picture you leave on all day: one tiny island, one tall palm, a raft, and a young woman nodding to the music on her headphones. So, to be on the safe side, every few minutes something happens. A message in a bottle washes straight back. A drone delivers a parcel, and the parcel is another pair of headphones. A shark in headphones nods along to the beat. She walks out over the water and comes back with an iced coffee. She could leave any time.

**The schedule:** more than 90 activities in [`activities.toml`](activities.toml). Most sit on four timers, from regular (every 2 to 5 minutes) to super rare (every 3 to 6 hours, three at most); the rest are follow-ups that another gag sets off. Every one waits for the next bar of the music, so the gags land on the beat.<br>
**The sound:** all of it synthesized from code by [`tools/make_audio.py`](tools/make_audio.py). No samples, no loops, no recordings, so no third-party licence.

```sh
python tools/serve.py
# then open http://127.0.0.1:8765/
```

<p><sub>Live preview in the browser, and export to a frame-exact, YouTube-ready MP4 from the same page. Plain ES modules, no build step, no npm. The banner above does not stop either; move your mouse all you like.</sub></p>

<details>
<summary><b>Setup...</b>: the timers, the seed, and a Speed slider that only goes to Slow</summary>
<br>

<p align="center">
  <img src="assets/97-classic-saver-set_opus_5.5-setup.svg" width="100%" alt="A grey dialog titled Castaway Setup with a navy title bar, floating over a starfield in which the odd little palm island flies past with the stars. A group box, Something happens every, lists Regular 2 to 5 min, Occasional 12 to 25 min, Rare 30 to 60 min and Super rare 3 to 6 hours. Buttons: OK, Cancel, Test. Fields: Length 10:00:00, Seed 1992, Bar 3 s. A Speed scroll bar runs from Slow to Fast, and Fast is greyed out; every few seconds the pointer drags the thumb towards Fast, lets go, and it springs back to Slow. Ticked: Start every gag on the next bar, Always daytime, Synthesize every sound from code. Not ticked: Hurry. The Text field says python tools/serve.py, then open http://127.0.0.1:8765/, and the Text Example box scrolls it in yellow.">
</p>

```text
 CASTAWAY SETUP                               RUN 10:00:00 . SEED 1992
 ──────────────────────────────────────────────────────────────────────
 TIMER        SOMETHING HAPPENS EVERY       IN A TYPICAL TEN-HOUR RUN
 regular      2 to 5 minutes                about 155
 occasional   12 to 25 minutes              about 30
 rare         30 to 60 minutes              about 13
 super rare   3 to 6 hours                  about 2 (never more than 3)
 chained      whenever another gag says so  follow-ups: the tide after
                                            the sandcastle, a reply
                                            after the bottle
 ──────────────────────────────────────────────────────────────────────
 she is busy about a third of the time and idling the rest. every gag
 starts on the next bar (one bar = 3 s), so it lands on the beat.
 counts are the median of 200 simulated runs. same seed, same run,
 event for event.
```

Lanes let things overlap: she has one, and the sea and sky, the cat, the turtle, the shore and the kumara patch each have their own. So a ship can sail past while she is busy with a coconut, which is the oldest joke on the island and is in the schedule on purpose. `python tools/schedule.py` validates the schedule and simulates a ten-hour run; `python tools/render_demo.py --dev` renders a dev reel of every activity with a heads-up display.

The Speed slider is not a joke about the code. It is a joke about the video.

</details>

<details>
<summary><b>CASTAWAY.INI</b>: what the lines in the banner are up to</summary>
<br>

```ini
; CASTAWAY.INI  -  settings for the saver at the top of this page
[Screen Saver.Castaway]
Polygons=2
CornersEach=4
TrailCopies=7
Loop=60 s, 20 bars of 3 s, the same length as the theme
WhenIdle=bounce off the edges, for no reason at all
EverySoOften=snap into something from the schedule, on the bar
Gags=ship, message in a bottle, sandcastle, shark, iced coffee
BusyBars=7 of 20, so about a third of the time, like her
AfterwardsActAsIfNothingHappened=1

[Marquee]
Font=a serif drawn for this page, set big, no font smoothing
Colour=sun yellow, then lagoon cyan for the line along the bottom

[Starfield]
WarpSpeed=moderate
Stars=150, white and grey
FlyingIslands=6 (our own mark: a palm on a sandbar)

[Castaway]
Length=10:00:00
Seed=1992
Theme=60 s loop, 80 BPM, F major, ii-V-I-vi, electric piano, kalimba
Ocean=60 s loop
Loudness=-14 LUFS, true peak at or below -1 dBTP
Levels=master and per routine
SoundFiles=more than 150, every one synthesized from code
ListenedToByAnyone=0 (a loudness meter has, which is a start)
Motion=hard cuts and stepped movement
Night=0
Hurry=0
```

When a gag lands in the banner, the lines hold it for exactly one or two bars, the way each activity in [`activities.toml`](activities.toml) starts on the next bar of the music. Reduced-motion settings get a still frame instead: the ship, mid-crossing, and nobody watching it.

</details>

<details>
<summary><b>Credits and greetz</b></summary>
<br>

```text
 THE ISLAND, HER, THE GAGS ......... Castaway (in development; no video
                                     has been published yet, so there is
                                     no link). working notes: MUSING.md
 THE RENDERER ...................... web/index.html, served by
                                     tools/serve.py. exports frame-exact
                                     H.264 in the browser (WebCodecs, 68
                                     to 78 frames a second at 1080p30 in
                                     Chrome); the server mixes the sound
                                     and joins the two into an MP4
 THE SAVER SET ..................... Still Water Software, which does not
                                     exist and has never shipped a disk.
                                     every line, star, island and letter
                                     above is drawn by a small Node script
                                     made for this header; nothing is
                                     taken from the real savers
 THE INSPIRATION ................... Johnny Castaway (1992), which belongs
                                     to its owners. this is an unofficial
                                     remake, in spirit only

 GREETZ
   the Society for Leaving It On, who never once pressed a key
   the Mouse Wigglers, who always did, and always at the wrong moment
   and whoever set the Speed slider to Slow and walked away
```

</details>

<p align="center"><sub>Still Water Software, the Society for Leaving It On and the Mouse Wigglers are invented. The polygons are not trying to tell you anything. Probably.</sub></p>
