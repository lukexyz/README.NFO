# ULTRA-SATISFACTORY header examples

Twelve retro README headers for [ULTRA-SATISFACTORY](https://github.com/lukexyz/ULTRA-SATISFACTORY), a companion app for the game *Satisfactory*. Each one replaces the title and one-line pitch at the top of that README. 01 to 06 use the same six styles as the [Dance Vision examples](../dance-vision), redrawn around a factory. 07 to 12 use six styles drawn at random from the [style catalogue](../../styles).

Each example is its own `.md` in this folder. Animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/ultra-satisfactory/src/<option>.mjs`). Rebuild this page with `node examples/ultra-satisfactory/src/build-gallery.mjs`. Anchor and file links were written for the ULTRA-SATISFACTORY repo root, so they don't resolve here. Every number quoted (140 items, 211 recipes, 477 buildings, recipe rates and cycle times) was checked against that repo's data on 2026-09-30.

Unofficial fan work, not affiliated with Coffee Stain Studios. The art is original. The keygen and cracktro styling is parody of the app itself, which is free and Apache 2.0: nothing here cracks, unlocks or offers a key for the game. Every crew, label, party and cabinet maker named is invented.

| # | Option | Style | What it is |
| --- | --- | --- | --- |
| 01 | [Scene Release NFO](01-nfo-release_opus_5.5.md) | original six | Pure text: an 80-column .NFO with a block-character logo and hex-cog emblem, RELEASE INFO, PAYLOAD and INSTALL NOTES, and a three-tab flow diagram. Phase list, factory skyline, credits and greetz are collapsed. No images, works everywhere. |
| 02 | [Amiga Cracktro](02-amiga-cracktro_opus_5.5.md) | original six | Animated SVG: a chrome logo over copper bars and a starfield, above a pixel production line (Smelter, Constructor, Assembler, Space Elevator) and a sine scroller. Below it, a ProTracker pattern where the channels are machines and the notes are real per-minute recipe rates. |
| 03 | [Keygen Dialog](03-keygen-dialog_opus_5.5.md) | original six | Animated SVG: a skinned mid-2000s keygen window that generates recipes, not keys. It types an item, scrambles, and settles on four real recipes with machine, cycle time, power and rates, above a strip linking the three tabs. |
| 04 | [C64 SID Loader](04-c64-loader_opus_5.5.md) | original six | Animated SVG on a 15 s loop: the C64 boots, LOAD"ULTRA-SATISFACTORY",8,1, turbo-loader stripes, then a title screen where a pointer clicks through the three tabs while a conveyor feeds an Assembler. Quick start as a BASIC listing. |
| 05 | [Control Terminal](05-crt-terminal_opus_5.5.md) | original six | Animated SVG: an amber phosphor CRT that boots, shows ACCESS GRANTED, then looks up Space Elevator phase 2, the Modular Frame recipe and the Assembler. Quick start as a shell session. |
| 06 | [ANSI BBS](06-ansi-bbs_opus_5.5.md) | original six | Animated SVG: a 16-colour ANSI BBS login for THE CLOGGED MERGER BBS, with the Modular Frame recipe running through an Assembler, the five Space Elevator phases as the line-up and the nine production machines as the shift roster. Below it, a BBS menu with real links. |
| 07 | [Demoparty Compo Slides](07-compo-slides_opus_5.5.md) | [demo-07](../../styles/demo.md#demo-07) | Animated SVG: a demoparty big screen seen over a crowd, cycling through a title slide, a countdown, one slide per app tab and a prize-giving with score bars. Below it, a text results table ranking ten real recipes by items per minute. |
| 08 | [MilkDrop Visualiser](08-milkdrop-visualiser_opus_5.5.md) | [idle-04](../../styles/idle.md#idle-04) | Animated SVG: an early-2000s music visualiser with nothing playing. Rings zoom out of a hex-cog behind the title and cross-fade through three presets, one per tab. A playlist of 16 real recipes is collapsed below. |
| 09 | [Oscilloscope Channels](09-oscilloscope_opus_5.5.md) | [trk-09](../../styles/trk.md#trk-09) | Animated SVG: the title as a glowing trace above a 3x3 grid of scopes, one per production machine, each with its own waveform and a real recipe readout (items per minute, cycle seconds, MW). Channel 10 is the Pioneer, flatlining. |
| 10 | [Arcade Attract Mode](10-arcade-attract_opus_5.5.md) | [mach-08](../../styles/mach.md#mach-08) | Animated SVG: an arcade cabinet front whose screen loops a title card, a to-scale screw-factory demo and a high-score table of the five Space Elevator phases. INSERT NOTHING: free play, it is Apache 2.0. |
| 11 | [Win32 Cracktro](11-win32-cracktro_opus_5.5.md) | [pc-05](../../styles/pc.md#pc-05) | Animated SVG: a mid-2000s Windows cracktro with a bevelled chrome logo on a mirror floor between two twisting steel girders, a three-page text-writer and a dot-matrix sine scroller. An 80-column NFO is collapsed below. |
| 12 | [Netlabel Cassette](12-cassette-jcard_opus_5.5.md) | [print-02](../../styles/print.md#print-02) | Animated SVG: an orange cassette with turning reels beside its opened J-card and obi strip. The track list is twelve recipes whose running times are their real craft cycles, and the deck counter adds them up. |

<br>

---

## 01 · Scene Release NFO

<sub><code>01-nfo-release_opus_5.5.md</code></sub>

<!-- Header 01-nfo-release_opus_5.5 for ULTRA-SATISFACTORY. Generated by src/01-nfo-release_opus_5.5.mjs: edit that, not this. -->

<pre>
              ░▒▓█   <b>JUST ONE MORE BELT</b>   proudly presents   █▓▒░

███     ███  ███         ███████████  █████████▄    ▄███████▄        ▄▄█▀▀█▄▄
███░    ███░ ███░         ░░░███░░░░░ ███░░░░▀███  ███▀░░░▀███    ▄█▀▀  ▄▄  ▀▀█▄
███░    ███░ ███░            ███░     ███░    ███░ ███░░   ███░   ██  ██████  ██
███░    ███░ ███░            ███░     ███░   ▄███░ ███████████░   ██ ███  ███ ██
▓▓▓░    ▓▓▓░ ▓▓▓░            ▓▓▓░     ▓▓▓▓▓▓▓▓▓▓░░ ▓▓▓░░░░░▓▓▓░   ██  ██████  ██
▓▓▓▓   ▓▓▓▓░ ▓▓▓░            ▓▓▓░     ▓▓▓░░▓▓▓▓▓░  ▓▓▓░    ▓▓▓░   ▀█▄▄  ▀▀  ▄▄█▀
 ▒▒▒▒▒▒▒▒▒░░ ▒▒▒▒▒▒▒▒▒▒      ▒▒▒░     ▒▒▒░  ░▒▒▒▒  ▒▒▒░    ▒▒▒░      ▀▀█▄▄█▀▀
  ░░░░░░░░░   ░░░░░░░░░░      ░░░      ░░░    ░░░░  ░░░     ░░░   TERMiNAL v1.0
▄█████ ▄████▄ ██████ ██ ▄█████ ██████ ▄████▄ ▄█████ ██████ ▄████▄ █████▄ ██  ██
██     ██  ██   ██   ██ ██     ██     ██  ██ ██       ██   ██  ██ ██  ██ ██  ██
▀████▄ ██████   ██   ██ ▀████▄ █████  ██████ ██       ██   ██  ██ █████▀ ▀████▀
    ██ ██  ██   ██   ██     ██ ██     ██  ██ ██       ██   ██  ██ ██ ▀█▄   ██
█████▀ ██  ██   ██   ██ █████▀ ██     ██  ██ ▀█████   ██   ▀████▀ ██  ██   ██
 ░░░░░░ ░░  ░░   ░░   ░░ ░░░░░░ ░░     ░░  ░░ ░░░░░░   ░░   ░░░░░░ ░░  ░░   ░░
═■═══■═══■→  every recipe, building and objective, one click apart  ═■═══■═══■→

══[ <b>ULTRA-SATISFACTORY.Control.Terminal.v1.0.Apache2-J1MB</b> ]═════════[ 01/01 ]═══

╔══[ <b>RELEASE iNFO</b> ]════════════════════╦══[ <b>PAYLOAD</b> ]══════════════════════════╗
║ release ..... <b>ULTRA-SATISFACTORY</b>     ║ items ....... <b>140</b> craftable           ║
║ type ........ companion app          ║ recipes ..... <b>211</b> (88 alternates)     ║
║ for ......... the game Satisfactory  ║ buildings ... <b>477</b> player-buildable    ║
║ official .... no. a fan project      ║ machines .... <b>9</b> that do the work      ║
║ protection .. none. it's <a href="LICENSE">Apache 2.0</a>  ║ phases ...... <b>5</b>, Space Elevator       ║
║ format ...... Python + Streamlit     ║ runs on ..... 2nd monitor or browser  ║
║ price ....... 0. sleep not included  ║ spaghetti ... bring your own          ║
╠══[ <b>iNSTALL NOTES</b> ]═══════════════════╩═══════════════════════════════════════╣
║ <b>1.</b> python -m pip install -r requirements.txt         Python 3.10+, repo root ║
║ <b>2.</b> python -m streamlit run app/app.py           serves http://localhost:8501 ║
║ <b>3.</b> park it on monitor two. alt-tab responsibly.        more: <a href="#run-it-locally">#run-it-locally</a> ║
║ <b>or</b> skip 1-3: <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/">https://lukexyz.github.io/ULTRA-SATISFACTORY/</a>  live, no install ║
╚══════════════════════════════════════════════════════════════════════════════╝

──────────────────────────────[ <b>ONE CLiCK APART</b> ]───────────────────────────────
┌─[ <b>OBJECTiVES</b> ]─────┐     ┌─[ <b>iTEMS</b> ]───────────────────┐     ┌─[ <b>BUiLDiNGS</b> ]─┐
│ phase 2 of 5 wants │     │ Reinforced Iron Plate 3/min │     │ Assembler     │
│ <b>Modular Frame</b> x500 │ ══→ │ Iron Rod ........... 12/min │     │ tier 2, 15 MW │
│ Smart Plating x100 │     │ → Modular Frame ..... 2/min │     │ what it costs │
│ and 2 more parts   │     │ <b>Assembler</b> · 60 s · 15 MW    │ ══→ │ what it makes │
└────────────────────┘     └─────────────────────────────┘     └───────────────┘
  bold is a click. in the app every ingredient, product and machine is a link.
</pre>

⚡ **ULTRA-SATISFACTORY**, translated from .nfo: a companion app for the factory-building game *Satisfactory* that puts every recipe, building and Space Elevator objective one click apart. Three cross-linked tabs, **Objectives**, **Items** and **Buildings**, mean that "what goes into a Modular Frame again?" costs one alt-tab instead of one evening. [Open it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/) with nothing to install, or [run it locally](#run-it-locally) with two commands. Unofficial fan project, not affiliated with Coffee Stain Studios.

<details>
<summary>⚡ <b>[ PHASE LiST ]</b> &nbsp;what the Space Elevator wants, all five phases</summary>

<pre>
──[ <b>PHASE LiST</b> ]────────────────────────────────────────────────────────────────

  the five Space Elevator phases, as the <b>OBJECTiVES</b> tab lists them. pick one,
  see the parts and the counts, click a part for its recipe.

     ┌────┬───────────────────────────┬───────────────────────────┬───────┐
     │ <b>##</b> │ <b>phase</b>                     │ <b>the elevator wants</b>        │   <b>qty</b> │
     ├────┼───────────────────────────┼───────────────────────────┼───────┤
     │ 01 │ <b>Automation basics</b>         │ Smart Plating             │   x50 │
     │    │ belts still tidy.         │ Versatile Framework       │  x100 │
     │    │ enjoy it while it lasts.  │ Automated Wiring          │  x500 │
     ├────┼───────────────────────────┼───────────────────────────┼───────┤
     │ 02 │ <b>Logistics &amp; steel</b>         │ Automated Wiring          │  x500 │
     │    │ the first spaghetti.      │ Modular Frame             │  x500 │
     │    │ "i'll tidy it up later."  │ Smart Plating             │  x100 │
     │    │ you will not.             │ Versatile Framework       │  x500 │
     ├────┼───────────────────────────┼───────────────────────────┼───────┤
     │ 03 │ <b>Oil &amp; computers</b>           │ Versatile Framework       │ x2500 │
     │    │ pipes. so many pipes.     │ Modular Engine            │  x500 │
     │    │ you own a whiteboard now. │ Adaptive Control Unit     │  x100 │
     ├────┼───────────────────────────┼───────────────────────────┼───────┤
     │ 04 │ <b>Nuclear &amp; endgame</b>         │ Assembly Director System  │ x1000 │
     │    │ yes, Nuclear Pasta is a   │ Magnetic Field Generator  │  x500 │
     │    │ real part. we checked.    │ Nuclear Pasta             │  x100 │
     │    │ the spaghetti is canon.   │ Thermal Propulsion Rocket │   x25 │
     ├────┼───────────────────────────┼───────────────────────────┼───────┤
     │ 05 │ <b>Alien tech &amp; quantum</b>      │ Biochemical Sculptor      │  x500 │
     │    │ daylight is a rumour.     │ AI Expansion Server       │  x100 │
     │    │ the base has a skyline.   │ Neural-Quantum Processor  │  x100 │
     │    │ one more belt, though.    │ Ballistic Warp Drive      │  x100 │
     └────┴───────────────────────────┴───────────────────────────┴───────┘

  five phases. eighteen line items. one Space Elevator that never says thanks.
</pre>

</details>

<details>
<summary>⚡ <b>[ READ THE REST OF THE .NFO ]</b> &nbsp;site plan, 3 a.m. field test, building manifest, release notes, known issues</summary>

<pre>
──[ <b>SiTE PLAN</b> ]─────────────────────────────────────────────────────────────────

                      ░▒░                                               ██
                    ░▒░                                                 ██
                   ▒░                                                  ▄██▄
     ▄▄           ██                              ▄█   ▄█   ▄█         ▀██▀
     ██           ██          ▄▄▄▄▄▄▄▄▄▄▄▄      ▄███ ▄███ ▄███          ██
    ▄██▄       ▄▄▄██▄▄▄▄▄     ██▀▀▀▀▀▀▀▀██     ████████████████         ██
   ▄█▀▀█▄      ██▀▀▀▀▀▀██     ██ ■ ■■ ■ ██     ██  ███  ███  ██       ▄████▄
  ▄█▀██▀█▄     ██ ░▒▒░ ██     ████████████     ████████████████     ▄████████▄
 ═■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══■═══→
   miner        smelter       constructor         assembler          elevator

     artist's impression. yours has more spaghetti, and it is load-bearing.

──[ <b>FiELD TEST: A TYPiCAL 3 A.M.</b> ]──────────────────────────────────────────────

  03:02  the elevator wants <b>Modular Frame</b>. click.
         3 Reinforced Iron Plate + 12 Iron Rod → 2. Assembler, 60 s, 15 MW.
  03:02  click <b>Reinforced Iron Plate</b>.
         6 Iron Plate + 12 Screw → 1. Assembler, 12 s, 15 MW.
  03:03  click <b>Screw</b>.
         1 Iron Rod → 4 Screw. Constructor, 6 s, 4 MW.
  03:03  click <b>Constructor</b>. it's a building. of course it's a building.
  03:04  alt-tab back. lay just one more belt.
  05:47  birds.

──[ <b>BUiLDiNG MANiFEST</b> ]─────────────────────────────────────────────────────────

  structure .... 333  ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  logistics ....  59  ■■■■■■■■■
  decor ........  26  ■■■■
  power ........  15  ■■
  transit ......  14  ■■
  production ...   9  ■
  special ......   7  ■
  storage ......   7  ■
  extraction ...   7  ■
                 ───
  total ........ <b>477</b>  333 are structure pieces. 102 of those say "Ramp".

  the 9 that do the actual work: Assembler, Blender, Constructor, Foundry,
  Manufacturer, Packager, Particle Accelerator, Refinery, Smelter.

──[ <b>RELEASE NOTES</b> ]─────────────────────────────────────────────────────────────

  + three tabs: <b>OBJECTiVES</b>, <b>iTEMS</b>, <b>BUiLDiNGS</b>. parts, ingredients and products
    open recipes. machines open buildings. the full tour is in <a href="#whats-inside">#whats-inside</a>.
  + search is per keystroke. type "scr" and Screw is already on screen,
    judging you.
  + it is one Streamlit file, <a href="app/app.py">app/app.py</a>, with streamlit-aggrid doing the
    searchable grids.
  + the live build is stlite: Streamlit running in your browser on
    WebAssembly. GitHub Actions republishes it on every push to main.
  + it also deploys as a full Streamlit server on Modal (<a href="modal_app.py">modal_app.py</a>). more
    in <a href="#how-its-built">#how-its-built</a>.

──[ <b>PROTECTiON</b> ]────────────────────────────────────────────────────────────────

  none. the code is <a href="LICENSE">Apache 2.0</a>: read it, fork it, bolt a fourth tab on. the
  game data and the images keep their own licences, see <a href="#data--credits">#data--credits</a>.

──[ <b>REQUiREMENTS</b> ]──────────────────────────────────────────────────────────────

  to run it ... Python 3.10+ and two commands. or a browser and zero.
  to need it .. one factory that got out of hand.
  the game .... not included. this is a lookup tool. get Satisfactory from the
                people who made it.
  monitors .... two is ideal. one and alt-tab works. a phone works.
  sleep ....... optional.

──[ <b>KNOWN iSSUES</b> ]──────────────────────────────────────────────────────────────

  - does not untangle your belts. it only tells you what they should be
    carrying.
  - will not stop you starting "a small side factory".
  - lookups take one click, so "i was checking a recipe" no longer covers a
    two hour absence.
</pre>

</details>

<details>
<summary>⚡ <b>[ GREETZ ]</b> &nbsp;the real credits, the crew, the intro music and a FILE_ID.DIZ</summary>

<pre>
──[ <b>CREDiTS, THE TRUE KiND</b> ]────────────────────────────────────────────────────

  <a href="https://github.com/greeny/SatisfactoryTools">greeny/SatisfactoryTools</a> ... the game data (data/data.json). none of this
                               exists without it.
  <a href="https://satisfactory.wiki.gg">the Satisfactory Wiki</a> ...... the item and building images, under
                               <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.
  Coffee Stain Studios ....... made the game. not affiliated with this release
                               in any way. we just can't stop playing it.

──[ <b>GREETZ</b> ]────────────────────────────────────────────────────────────────────

                          greetz ride the belt out to

            the Manifold Mafia · the Load Balancer Liberation League
                Spaghetti Logistics Ltd · Power Shards Anonymous
             the Foundation Alignment Society (world grid chapter)
           the Hypertube Cannon Test Pilots · the Blueprint Hoarders
                        Team "It Works, Don't Touch It"
               everyone whose temporary belt is now load-bearing
        every lizard doggo who dragged home something it shouldn't have
          whoever is alt-tabbed right now while a Manufacturer starves
                and you, at 3 a.m., saying "just one more belt"

         no greetz to clipping conveyors, or to the power grid at 99%.

──[ <b>NOW PLAYiNG</b> ]───────────────────────────────────────────────────────────────

  ♪ one_more_belt.xm · 4ch · 140 bpm, one per item · looping since phase 1

  ┌────┬────────────┬────────────┬────────────┬────────────┐
  │ <b>##</b> │ <b>miner</b>      │ <b>smelter</b>    │ <b>assembler</b>  │ <b>you</b>        │
  ├────┼────────────┼────────────┼────────────┼────────────┤
  │ 00 │ C-2 01 v40 │ F-2 02 v30 │ C-5 03 v28 │ ··· ·· ··· │  miner     ■■■■■■■·
  │ 01 │ ··· ·· ··· │ ··· ·· ··· │ D#5 03 ··· │ ··· ·· ··· │  smelter   ■■■■■■··
  │ 02 │ C-2 01 v28 │ F-2 02 ··· │ G-5 03 ··· │ ··· ·· ··· │  assembler ■■■■····
  │ 03 │ ··· ·· ··· │ G#2 02 v30 │ C-6 03 ··· │ ··· ·· ··· │  you       ■·······
  <b>│ 04 │ C-2 01 v40 │ ··· ·· ··· │ A#5 03 v28 │ ··· ·· ··· │</b>
  │ 05 │ ··· ·· ··· │ A#2 02 v30 │ G-5 03 ··· │ ··· ·· ··· │  (go to bed)
  │ 06 │ C-2 01 v28 │ A#2 02 ··· │ D#5 03 ··· │ ··· ·· ··· │
  │ 07 │ C-2 01 v40 │ C-3 02 v30 │ G-5 03 ··· │ C-1 04 v02 │
  └────┴────────────┴────────────┴────────────┴────────────┘

──[ <b>THE CREW</b> ]──────────────────────────────────────────────────────────────────

  code ............. one Streamlit file that got out of hand
  packer ........... stlite. the whole app, in a tab, on WebAssembly
  courier .......... GitHub Actions. ships on every push to main
  quality control .. the Space Elevator. it counts. it always counts
  ascii ............ J1MB art division, drawn between belts

┌──[ <b>FiLE_iD.DiZ</b> ]────────────────────┐  ╔══[ <b>J1MB RECiPEGEN v1.0</b> ]════════════╗
│     <b>ULTRA-SATiSFACTORY</b>  [01/01]     │  ║ item    [ <b>Modular Frame</b>           ] ║
│ every recipe, building and Space    │  ║ needs   [ 3 Reinforced Iron Plate ] ║
│ Elevator objective, 1 click apart.  │  ║         [ 12 Iron Rod             ] ║
│ 140 items, 211 recipes,             │  ║ machine [ Assembler, 60 s, 15 MW  ] ║
│ 477 buildings, 5 phases, 0 keys.    │  ║                                     ║
│ unofficial fan project. Apache 2.0. │  ║ [ Generate ]  [ Alt-tab ]  [ Exit ] ║
│   released by J1MB, belt division   │  ║ generates recipes. never keys.      ║
└─────────────────────────────────────┘  ╚═════════════════════════════════════╝

       ░▒▓█  J1MB: efficiency first. sleep is an alternate recipe.  █▓▒░
</pre>

</details>

<br>

---

## 02 · Amiga Cracktro

<sub><code>02-amiga-cracktro_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5.svg" width="100%" alt="Amiga demoscene-style intro banner. 'Manifold Destiny presents' above ULTRA-SATISFACTORY in chunky chrome letters: ULTRA in ice cyan between two turning hex-cog emblems, SATISFACTORY in silver and gold, over sweeping copper raster bars and a parallax starfield. The subtitle reads Objectives, Items, Buildings, every recipe one click apart. Below it, in front of a distant factory skyline with blinking chimney beacons, a pixel production line runs on a conveyor belt: ingots leave a glowing Smelter, a Constructor's press thumps on the beat, an Assembler bolts parts into frames and a Space Elevator sends a pod up a tether that rises out of the frame. A sine-wave scroller opens with 'Every recipe, one click apart!' and the footer reads: live in your browser, lukexyz.github.io/ULTRA-SATISFACTORY">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: every recipe, building and Space Elevator objective, one click apart.</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>. Park it on the second monitor, the phone or one alt-tab away,
  and stop doing belt maths in your head at 3&nbsp;a.m.<br>
  ⚡ Three tabs, everything cross-linked: <b>OBJECTIVES</b> (what each Space Elevator phase wants, and how many),
  <b>ITEMS</b> (search as you type, recipe cards with per-minute rates) and <b>BUILDINGS</b> (build costs, what each one makes, Mk-by-Mk upgrades).<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. This bit is free.
</p>

<p align="center">
  ⚡&nbsp;
  <code>ITEMS:&nbsp;140</code>&nbsp;
  <code>RECIPES:&nbsp;211&nbsp;(88&nbsp;alt)</code>&nbsp;
  <code>BUILDINGS:&nbsp;477</code>&nbsp;
  <code>PROTECTION:&nbsp;none&nbsp;(Apache&nbsp;2.0)</code>&nbsp;
  <code>BELTS:&nbsp;just&nbsp;one&nbsp;more</code>
</p>

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

<p align="center">
  ⚡ Python 3.10+, run from the repo root, then open <b>http://localhost:8501</b>. The long version is in <a href="#run-it-locally">Run&nbsp;it&nbsp;locally</a>.<br>
  ⚡ Or install nothing: it runs <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>live&nbsp;in&nbsp;your&nbsp;browser</b></a>,
  a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to <code>main</code>.
</p>

<p align="center"><sub>⚡ &#9835; NOW PLAYING: FACTORY.MOD &middot; channels are machines, notes are items per minute, straight from the app's data &#9835;</sub></p>

```text
╔════════════════════════════════════════════════════════════════════════╗
║ FACTORY.MOD   ORE → INGOT → PART → FRAME   BPM 120   PAT 03   SLEEP 00 ║
╠════╦════════════════╦════════════════╦════════════════╦════════════════╣
║ ## ║ 1 SMELTER      ║ 2 CONSTRUCTOR  ║ 3 ASSEMBLER    ║ 4 MANUFACTURER ║
╠════╬════════════════╬════════════════╬════════════════╬════════════════╣
║ 00 ║ FEI 030 002 04 ║ PLT 020 006 04 ║ RIP 005 012 15 ║ HMF 002 030 55 ║
║ 01 ║ --- --- --- -- ║ ROD 015 004 04 ║ --- --- --- -- ║ --- --- --- -- ║
║ 02 ║ CUI 030 002 04 ║ SCR 040 006 04 ║ ROT 004 015 15 ║ --- --- --- -- ║
║ 03 ║ --- --- --- -- ║ --- --- --- -- ║ --- --- --- -- ║ --- --- --- -- ║
║>04<║ FEI 030 002 04 ║ WIR 030 004 04 ║ MFR 002 060 15 ║ MEN 001 060 55 ║
║ 05 ║ --- --- --- -- ║ CBL 030 002 04 ║ --- --- --- -- ║ --- --- --- -- ║
║ 06 ║ CAI 015 004 04 ║ PLT 020 006 04 ║ SPL 002 030 15 ║ ACU 001 120 55 ║
║ 07 ║ --- --- --- -- ║ ROD 015 004 04 ║ --- --- --- -- ║ --- --- --- -- ║
╚════╩════════════════╩════════════════╩════════════════╩════════════════╝
 each note: ITEM, items per minute, cycle in seconds, machine MW
 (standard recipes, one machine each)
 FEI Iron Ingot   CUI Copper Ingot   CAI Caterium Ingot   PLT Iron Plate
 ROD Iron Rod   SCR Screw   WIR Wire   CBL Cable   ROT Rotor
 RIP Reinforced Iron Plate   MFR Modular Frame   SPL Smart Plating
 HMF Heavy Modular Frame   MEN Modular Engine   ACU Adaptive Control Unit
 --- machine idle (unacceptable)
```

<details>
<summary>⚡ <b>ULTRA-SATISFACTORY.NFO</b>: release notes, install, files, the Space Elevator shopping list and greetz</summary>

```text
                      ██  ██ ██     ▀▀██▀▀ ██▀▀█▄ ▄█▀▀█▄
                      ██  ██ ██       ██   ██▄▄█▀ ██▄▄██
                      ▀█▄▄█▀ ██▄▄▄▄   ██   ██ ▀█▄ ██  ██
▄█▀▀▀▀ ▄█▀▀█▄ ▀▀██▀▀ ██ ▄█▀▀▀▀ ██▀▀▀▀ ▄█▀▀█▄ ▄█▀▀▀▀ ▀▀██▀▀ ▄█▀▀█▄ ██▀▀█▄ ██  ██
 ▀▀▀█▄ ██▄▄██   ██   ██  ▀▀▀█▄ ██▀▀▀  ██▄▄██ ██       ██   ██  ██ ██▄▄█▀  ▀██▀
▄▄▄▄█▀ ██  ██   ██   ██ ▄▄▄▄█▀ ██     ██  ██ ▀█▄▄▄▄   ██   ▀█▄▄█▀ ██ ▀█▄   ██
        ═════  M A N I F O L D   D E S T I N Y   P R E S E N T S  ═════

╔═════════════════════════════════════════════════════════════════════════════╗
║ RELEASE ..... ULTRA-SATISFACTORY         TYPE ....... companion app         ║
║ SUPPLIED BY . greeny/SatisfactoryTools   PACKED BY .. one Streamlit file    ║
║ PROTECTION .. none (Apache 2.0)          RUNS ON .... Python or a browser   ║
║ ITEMS ....... 140 craftable              RECIPES .... 211 (88 alternates)   ║
║ BUILDINGS ... 477                        PHASES ..... 5, Space Elevator     ║
║ GAME ........ sold separately            SLEEP ...... an alternate recipe   ║
╚═════════════════════════════════════════════════════════════════════════════╝

── RELEASE NOTES ──────────────────────────────────────────────────────────────
  * Every recipe, building and Space Elevator objective, one click apart.
  * Three tabs: OBJECTIVES, ITEMS, BUILDINGS. Everything links: click an
    ingredient for its recipe, click the machine for its building.
  * Recipe cards show per-minute rates, cycle time and power draw, so the
    belt maths happens on the second monitor and not in your head.
  * Runs next to the game: second monitor, phone, or one alt-tab away.
  * Does not build the factory for you. We checked. Twice.
  * Does not judge your spaghetti either. It is load-bearing.

── INSTALL ────────────────────────────────────────────────────────────────────
  1. python -m pip install -r requirements.txt
  2. python -m streamlit run app/app.py
  3. open http://localhost:8501 and drag it to the other monitor
  4. alt-tab back in. Tell nobody how long you were gone.
  Or install nothing: https://lukexyz.github.io/ULTRA-SATISFACTORY/

── FILES ──────────────────────────────────────────────────────────────────────
  app/app.py ................... the app: a single Streamlit file
  ultra_satisfactory/data.py ... loads the game data
  data/data.json ............... the recipe book
  modal_app.py ................. the same app as a server on Modal
  LICENSE ...................... Apache 2.0. Protection: none.

── THE SPACE ELEVATOR SHOPPING LIST (AS THE APP LISTS IT) ─────────────────────
  1 Automation basics .... Smart Plating x50 * Versatile Framework x100
                           * Automated Wiring x500
  2 Logistics & steel .... Automated Wiring x500 * Modular Frame x500
                           * Smart Plating x100 * Versatile Framework x500
  3 Oil & computers ...... Versatile Framework x2500 * Modular Engine x500
                           * Adaptive Control Unit x100
  4 Nuclear & endgame .... Assembly Director System x1000
                           * Magnetic Field Generator x500
                           * Nuclear Pasta x100 * Thermal Propulsion Rocket x25
  5 Alien tech & quantum . Biochemical Sculptor x500 * AI Expansion Server x100
                           * Neural-Quantum Processor x100
                           * Ballistic Warp Drive x100
  Pick a phase in OBJECTIVES, click a part, get its recipe.

── GREETZ ─────────────────────────────────────────────────────────────────────
  The Spaghetti Logistics Union * Bus Lane Bandits * Overclockers Anonymous
  * The Load Balancer Lads * everyone whose "temporary" belt is still there
  200 hours later * whoever is still hand-feeding a constructor. We see you.

── NO GREETZ ──────────────────────────────────────────────────────────────────
  Belts that clip through other belts. You know what you did.

── SMALL PRINT ────────────────────────────────────────────────────────────────
  Unofficial fan project, not affiliated with Coffee Stain Studios.
  Game data: greeny/SatisfactoryTools. Item and building images:
  Satisfactory Wiki, CC BY-NC-SA 4.0. Code: Apache 2.0.

     ═════  efficiency is mandatory. sleep is an alternate recipe.  ═════
```

</details>

<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5-rule.svg" width="100%" alt="A strip of conveyor belt carrying pixel ingots, plates, screws and frames off to the right">
</p>

<br>

---

## 03 · Keygen Dialog

<sub><code>03-keygen-dialog_opus_5.5.md</code></sub>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/03-keygen-dialog_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY recipe generator: an animated pixel-art parody of a mid-2000s keygen window, oddly shaped and dark, released by the made-up Dept. of Spaghetti Logistics, with a hexagon-and-cog emblem bolted over one corner. A neon cyan and chrome logo reads ULTRA SATISFACTORY above a ticker playing ultra_satisfactory.xm and a pumping spectrum analyser. It makes recipes, not keys: an item is typed in, GENERATE is clicked, and the RECIPE and MACHINE fields scramble and then settle on the real answer. First Modular Frame: 3 Reinforced Iron Plate + 12 Iron Rod, Assembler, 60 s, 15 MW, out 2/min; then Versatile Framework, Iron Plate and Rotor. A readout says PROTECTION: NONE, LICENCE: APACHE 2.0, and the EXIT button turns into NOPE when the mouse gets close. Below, conveyor belts link the three tabs: OBJECTIVES (Space Elevator, 5 phases), click a part, ITEMS (140 items, 211 recipes, 88 alternates), click the machine, BUILDINGS (477 buildings, 9 machines). The chin reads: makes recipes, not keys, unofficial fan tool."></a>
</p>

<h1 align="center">ULTRA-SATISFACTORY &middot; <code>recipegen.exe</code></h1>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>&nbsp;[ LIVE ]&nbsp;</kbd></a>&nbsp;
  <a href="#run-it-locally"><kbd>&nbsp;[ RUN ]&nbsp;</kbd></a>&nbsp;
  <a href="#whats-inside"><kbd>&nbsp;[ WHAT'S INSIDE ]&nbsp;</kbd></a>&nbsp;
  <a href="#how-its-built"><kbd>&nbsp;[ HOW IT'S BUILT ]&nbsp;</kbd></a>&nbsp;
  <a href="#data--credits"><kbd>&nbsp;[ CREDITS ]&nbsp;</kbd></a>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: **every recipe, building and Space Elevator objective, one click apart.** Park it on the second monitor, your phone, or the far side of an alt-tab, and look things up before the belt backs up. Yes, it is dressed as a keygen. It generates recipes, not keys: the app is free, open source and has nothing to unlock.

- ⚡ **Three tabs.** `OBJECTIVES`: pick a Space Elevator phase, see the parts it wants and how many. `ITEMS`: search as you type, get recipe cards with per-minute rates, the machine, its cycle time and its power draw. `BUILDINGS`: build costs, what each one makes, and Mk-by-Mk upgrade paths.
- ⚡ **Everything links.** Click a part to open its recipe, click the machine to open its building, lose forty minutes, call it planning.
- ⚡ **Zero install.** It runs live in your browser at [lukexyz.github.io/ULTRA-SATISFACTORY](https://lukexyz.github.io/ULTRA-SATISFACTORY/).
- ⚡ **Quick start.** `python -m pip install -r requirements.txt`, then `python -m streamlit run app/app.py`, then open `http://localhost:8501`. Python 3.10+, run from the repo root: see [Run it locally](#run-it-locally).
- ⚡ **Unofficial fan project**, not affiliated with Coffee Stain Studios. Protection: none. Licence: [Apache 2.0](LICENSE).

<details>
<summary>⚡ <b>[ ABOUT ]</b> read <code>ultra_satisfactory.nfo</code>: release info, install, the Space Elevator shopping list, greetz</summary>

```text
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║         ░▒▓█  DEPT. OF SPAGHETTI LOGISTICS   p r e s e n t s  █▓▒░         ║
║                                                                            ║
║                    U L T R A - S A T I S F A C T O R Y                     ║
║     recipe generator  ·  generates recipes  ·  that is the whole trick     ║
║                                                                            ║
╠══════════════════════════════[ RELEASE iNFO ]══════════════════════════════╣
║   RELEASE ....... ULTRA-SATISFACTORY, control terminal v1.0                ║
║   SUPPLIER ...... a pioneer at 3 a.m. who alt-tabbed "for a second"        ║
║   CRACKER ....... not needed. protection: none. licence: Apache 2.0        ║
║   TYPE .......... companion app. it generates recipes, never keys          ║
║   PAYLOAD ....... 140 items, 211 recipes (88 alternates), 477 buildings    ║
║   REQUIRES ...... a browser. Python 3.10+ to run it on your own machine    ║
║   THE GAME ...... not included, not ours, worth buying. unofficial fan     ║
║                   project, not affiliated with Coffee Stain Studios        ║
╠════════════════════════════════[ iNSTALL ]═════════════════════════════════╣
║   0. or skip all of this: https://lukexyz.github.io/ULTRA-SATISFACTORY/    ║
║   1. python -m pip install -r requirements.txt                             ║
║   2. python -m streamlit run app/app.py                                    ║
║   3. open http://localhost:8501 on the second monitor                      ║
║   4. alt-tab back. the belts did not stop while you were away              ║
╠══════════════════════[ SPACE ELEVATOR SHOPPiNG LiST ]══════════════════════╣
║   PHASE 1  Automation basics                                               ║
║              Smart Plating ............................. x50               ║
║              Versatile Framework ...................... x100               ║
║              Automated Wiring ......................... x500               ║
║   PHASE 2  Logistics & steel                                               ║
║              Automated Wiring ......................... x500               ║
║              Modular Frame ............................ x500               ║
║              Smart Plating ............................ x100               ║
║              Versatile Framework ...................... x500               ║
║   PHASE 3  Oil & computers                                                 ║
║              Versatile Framework ..................... x2500               ║
║              Modular Engine ........................... x500               ║
║              Adaptive Control Unit .................... x100               ║
║   PHASE 4  Nuclear & endgame                                               ║
║              Assembly Director System ................ x1000               ║
║              Magnetic Field Generator ................. x500               ║
║              Nuclear Pasta ............................ x100               ║
║              Thermal Propulsion Rocket ................. x25               ║
║   PHASE 5  Alien tech & quantum                                            ║
║              Biochemical Sculptor ..................... x500               ║
║              AI Expansion Server ...................... x100               ║
║              Neural-Quantum Processor ................. x100               ║
║              Ballistic Warp Drive ..................... x100               ║
║                                                                            ║
║   The OBJECTIVES tab does this per phase. Click a part, get its recipe.    ║
╠══════════════════════════════[ SUPPLiED BY ]═══════════════════════════════╣
║   GAME DATA ..... greeny/SatisfactoryTools                                 ║
║   iMAGES ........ the Satisfactory Wiki, CC BY-NC-SA 4.0                   ║
║   CODE .......... Apache 2.0. take it, fork it, overclock it               ║
╠═════════════════════════════════[ GREETZ ]═════════════════════════════════╣
║   everyone whose "temporary" belt is now load-bearing  ·  the manifold     ║
║   faithful  ·  the load-balancer purists (you are both right)  ·  anyone   ║
║   who opened a Hard Drive and got alternates they did not ask for  ·       ║
║   the AWESOME Sink, for eating our mistakes without judgement              ║
║                                                                            ║
║                    -=[ just one more belt, then bed ]=-                    ║
╚════════════════════════════════════════════════════════════════════════════╝
```

</details>

<br>

---

## 04 · C64 SID Loader

<sub><code>04-c64-loader_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/04-c64-loader_opus_5.5.svg" width="800" alt="ULTRA-SATISFACTORY on a Commodore 64: it boots to READY., types LOAD&quot;ULTRA-SATISFACTORY&quot;,8,1, lists 140 items, 211 recipes, 477 buildings and 5 phases coming off the disk while turbo stripes roll in the border, and types RUN. Then a demoscene intro screen: the colour-cycling ULTRA SATISFACTORY logo between two hexagon emblems with turning cogs, the line EVERY RECIPE AND BUILDING, ONE CLICK APART, and a pointer clicking through the three tabs: OBJECTIVES (Space Elevator phase 2 wants Modular Frame x500), ITEMS (the Modular Frame recipe) and BUILDINGS (the Assembler). Below, a conveyor feeds plates and rods into a stamping assembler and Modular Frames roll out; a SID panel plays Just One More Belt by DJ Splitter and MC Merger over a sine scroller.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Park it on the second monitor, prop it up on your phone, or alt-tab out at 3 a.m. because you have forgotten what goes in a Modular Frame. Again.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Run it in your browser, nothing to install</b></a> · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a>
</p>

<p align="center">
  ⚡ Three tabs: <kbd>OBJECTIVES</kbd> what each Space Elevator phase wants
  → <kbd>ITEMS</kbd> how to make it
  → <kbd>BUILDINGS</kbd> what makes it
</p>

```text
10 REM *** ULTRA-SATISFACTORY QUICK START ***  PROTECTION: NONE (APACHE 2.0)
20 REM PYTHON 3.10+, FROM THE REPO ROOT:
30 SYS "python -m pip install -r requirements.txt"
40 SYS "python -m streamlit run app/app.py"
50 OPEN "http://localhost:8501" : REM PARK IT ON THE SECOND MONITOR
60 PRINT "JUST ONE MORE BELT. "; : GOTO 60
RUN
JUST ONE MORE BELT. JUST ONE MORE BELT. JUST ONE MORE BELT. JUST ONE MORE BELT.
?OUT OF SLEEP  ERROR IN 60
READY.
```

<p align="center">
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. Factory sold separately.</sub>
</p>

<details>
<summary>⚡ <b>ULTRASAT.NFO</b>: release notes, the click path, the Space Elevator's shopping list, greetz (protection: none)</summary>

```text
       ████    ████  ████          ████████████  ██████████        ████
       ████░░  ████░░████░░          ░░████░░░░░░████░░░░████    ████████
      ████░░░ ████░░████░░░           ████░░░   ████░░░ ████░░████ ░░░████░
      ████░░  ████░░████░░            ████░░    ██████████░░░░████████████░░
     ████░░░ ████░░████░░░           ████░░░   ████████░░░░░ ████░░░░████░░░
     ████░░  ████░░████░░            ████░░    ████░░████    ████░░  ████░░
      ████████ ░░░████████████      ████░░░   ████░░░ ████░ ████░░░ ████░░░
        ░░░░░░░░    ░░░░░░░░░░░░      ░░░░      ░░░░    ░░░░  ░░░░    ░░░░

        S  A  T  I  S  F  A  C  T  O  R  Y             control terminal v1.0

═════════════════════════════════════════════════════════════════════════════
  MANIFOLD DESTINY PRESENTS ............................ ULTRA-SATISFACTORY
═════════════════════════════════════════════════════════════════════════════

  RELEASE TYPE .. companion app / second-monitor furniture / 3 a.m. enabler
  GOES WITH ..... Satisfactory, the factory-building game (sold separately:
                  this is a lookup tool, the game is not in the box)
  CONTENTS ...... 140 items, 211 recipes (88 of them alternates),
                  477 buildings, 5 Space Elevator phases, 0 excuses
  PROTECTION .... none. it's Apache 2.0. go on, read the source
  PACKED WITH ... Python, one Streamlit app (app/app.py), streamlit-aggrid
  LOADER ........ python -m streamlit run app/app.py
  ALSO RUNS ..... in a browser tab (stlite: Streamlit on WebAssembly,
                  republished on every push to main) and as a server on Modal
  SUPPLIED BY ... greeny/SatisfactoryTools (game data)
                  Satisfactory Wiki (images, CC BY-NC-SA 4.0)
  FILENAME ...... 18 characters. a real 1541 takes 16. we asked nicely

─── ONE CLICK APART ─────────────────────────────────────────────────────────

   OBJECTIVES             ITEMS                         BUILDINGS
  ┌─────────────────┐    ┌─────────────────────────┐    ┌─────────────────┐
  │ PHASE 2 wants   │    │ 3 Reinforced Iron Plate │    │ ASSEMBLER       │
  │ Modular Frame   │═══>│ 12 Iron Rod             │    │ production, T2  │
  │ x500            │    │ Assembler, 60 s, 15 MW  │═══>│ 15 MW           │
  │                 │    │ = 2 Modular Frame       │    │ makes 39 items  │
  └─────────────────┘    └─────────────────────────┘    └─────────────────┘
    click the part         click the machine             click any of them

─── THE SPACE ELEVATOR WOULD LIKE ───────────────────────────────────────────

  1  AUTOMATION BASICS ...... Smart Plating x50, Versatile Framework x100,
                              Automated Wiring x500
  2  LOGISTICS & STEEL ...... Automated Wiring x500, Modular Frame x500,
                              Smart Plating x100, Versatile Framework x500
  3  OIL & COMPUTERS ........ Versatile Framework x2500, Modular Engine x500,
                              Adaptive Control Unit x100
  4  NUCLEAR & ENDGAME ...... Assembly Director System x1000,
                              Magnetic Field Generator x500,
                              Nuclear Pasta x100,
                              Thermal Propulsion Rocket x25
  5  ALIEN TECH & QUANTUM ... Biochemical Sculptor x500,
                              AI Expansion Server x100,
                              Neural-Quantum Processor x100,
                              Ballistic Warp Drive x100

     it does not say please. it has never said please.

─── GREETZ ──────────────────────────────────────────────────────────────────

  DJ Splitter & MC Merger * the night shift at Belt Fiction * Overclock
  Holmes * the Load Balancer Lads * everyone whose "temporary" starter base
  is now load-bearing * the pioneer who built a railway to avoid a 200 m
  walk * whoever said "I'll tidy the spaghetti later" (you won't) * lizard
  doggos everywhere

  NO RESPECT TO: belts that clip through walls. we see you.

─── unofficial fan project, not affiliated with Coffee Stain Studios ────────
───────────────────────────────── every crew and DJ name above is made up ───
```

</details>

<br>

---

## 05 · Control Terminal

<sub><code>05-crt-terminal_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/05-crt-terminal_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY on an amber phosphor CRT control terminal. A boot log types out: CONTROL TERMINAL V1.0, data.json: 140 items, 211 recipes (88 alternates), 477 buildings, space elevator: 5 phases. ACCESS GRANTED appears in block letters between hazard stripes. Then three queries: phase 2 lists the Space Elevator parts, item MODULAR FRAME opens its recipe card (3 Reinforced Iron Plate and 12 Iron Rod a minute in, 2 Modular Frame a minute out, Assembler, 60 s cycle, 15 MW) and starts two ASCII conveyor belts feeding an Assembler, and building ASSEMBLER opens the building card. A progress bar fills to 500 Modular Frames while the clock runs from 03:00 to 07:10.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.
</p>

<p align="center">
  ⚡
  <a href="#run-it-locally"><kbd>F1 run it</kbd></a>
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>F2 live in your browser</kbd></a>
  <a href="#whats-inside"><kbd>F3 what's inside</kbd></a>
  <a href="#how-its-built"><kbd>F4 how it's built</kbd></a>
  <kbd>F10 sleep</kbd> <i>(denied)</i>
</p>

```console
$ whoami
pioneer (groups: belts, spaghetti, denial). awake since 03:00.

$ cat README.1st
You are in the factory. You need a recipe. Do not open 40 wiki tabs.
Alt-tab here, type the item, read the card, click through to the machine.
Runs on a second monitor, a phone, or one alt-tab away from the belts.

  OBJECTIVES   pick a Space Elevator phase: the parts it wants, and how many
  ITEMS        search as you type: per-minute rates, machine, cycle, power
  BUILDINGS    every building: what it costs, what it makes, Mk upgrades

Unofficial fan project. Not affiliated with Coffee Stain Studios.

$ python -m pip install -r requirements.txt
$ python -m streamlit run app/app.py
  → http://localhost:8501   (Python 3.10+, run it from the repo root)

$ echo "$NO_INSTALL"
https://lukexyz.github.io/ULTRA-SATISFACTORY/   (the whole app, in a tab)
```

<details>
<summary>⚡ <b>CTRLTERM.NFO</b>: release info, protection: none, greetz</summary>

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ ░▒▓█  U L T R A - S A T I S F A C T O R Y  █▓▒░          CTRLTERM.NFO · 2026 ║
╠═════════════════════════════════[ release ]══════════════════════════════════╣
║                                                                              ║
║   release ......... ULTRA-SATISFACTORY, amber phosphor edition               ║
║   released by ..... the Spaghetti Logic night shift                          ║
║   supplied by ..... greeny/SatisfactoryTools (the game data)                 ║
║   images by ....... the Satisfactory Wiki (CC BY-NC-SA 4.0)                  ║
║   protection ...... none. the app is Apache 2.0: read it, fork it, ship it   ║
║   generates ....... recipes. only ever recipes                               ║
║   requires ........ Python 3.10+, or nothing but a browser tab               ║
║   the game ........ Satisfactory, by Coffee Stain Studios. sold separately   ║
║   affiliation ..... none. unofficial fan project. we just like belts         ║
║                                                                              ║
╠════════════════════════════════[ inventory ]═════════════════════════════════╣
║                                                                              ║
║   140 craftable items ........ searched on every keystroke                   ║
║   211 machine recipes ........ 88 of them alternates                         ║
║   477 buildings .............. 9 production machines, 333 structure pieces,  ║
║                                59 logistics, 26 decor, 15 power, 14 transit, ║
║                                7 special, 7 storage, 7 extraction            ║
║     5 Space Elevator phases .. parts and counts, one click from a recipe     ║
║                                                                              ║
╠══════════════════════════════[ space elevator ]══════════════════════════════╣
║                                                                              ║
║   1  Automation basics ..... Smart Plating x50, Versatile Framework x100,    ║
║                              Automated Wiring x500                           ║
║   2  Logistics & steel ..... Automated Wiring x500, Modular Frame x500,      ║
║                              Smart Plating x100, Versatile Framework x500    ║
║   3  Oil & computers ....... Versatile Framework x2500, Modular Engine x500, ║
║                              Adaptive Control Unit x100                      ║
║   4  Nuclear & endgame ..... Assembly Director System x1000,                 ║
║                              Magnetic Field Generator x500,                  ║
║                              Nuclear Pasta x100,                             ║
║                              Thermal Propulsion Rocket x25                   ║
║   5  Alien tech & quantum .. Biochemical Sculptor x500,                      ║
║                              AI Expansion Server x100,                       ║
║                              Neural-Quantum Processor x100,                  ║
║                              Ballistic Warp Drive x100                       ║
║                                                                              ║
╠══════════════════════════[ the clock is not lying ]══════════════════════════╣
║                                                                              ║
║   Phase 2 wants 500 Modular Frames. One Assembler makes 2 a minute.          ║
║   500 / 2 = 250 minutes = 4 h 10. Watch the clock in the title bar: it       ║
║   leaves 03:00 when the belts start and reads 07:10 when the bar is full.    ║
║   The belts are to scale too: 3, 12 and 2 items a minute.                    ║
║   Build a second Assembler. Then a third. This is how it starts.             ║
║                                                                              ║
║   Small print: the factory on screen is staged. The app looks things up;     ║
║   it does not count your frames or pull the lever. The arithmetic is real.   ║
║                                                                              ║
╠══════════════════════════════════[ greetz ]══════════════════════════════════╣
║                                                                              ║
║   the Mk.1 Belt Preservation Society · Manifold Truthers Local 477 ·         ║
║   Load Balancers Anonymous · the Floating Foundation Guild ·                 ║
║   everyone who said "I'll tidy the spaghetti later" and never did ·          ║
║   whoever is still hand-feeding a Biomass Burner at 03:00. we see you.       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

</details>

<details>
<summary>⚡ <b>floorplan.txt</b>: how the factory is wired</summary>

```text
  data/data.json ═══> ultra_satisfactory/data.py ═══> app/app.py
  the game data       loads it, works out the         one Streamlit app,
                      per-minute rates                three tabs
                                                          ║
        ╔══════════════════════════╦══════════════════════╩═══════╗
        ║                          ║                              ║
    OBJECTIVES ═ click a part ═> ITEMS ═ click the machine ═> BUILDINGS
    5 phases,                    140 items,                   477 buildings,
    parts + counts               211 recipes                  cost + products

  ships three ways
    your machine ....... python -m streamlit run app/app.py   (port 8501)
    your browser ....... stlite build on GitHub Pages: no install, no server
    somebody's cloud ... modal_app.py: a full Streamlit server on Modal
```

</details>

<br>

---

## 06 · ANSI BBS

<sub><code>06-ansi-bbs_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/06-ansi-bbs_opus_5.5.svg" width="832" alt="ULTRA-SATISFACTORY, drawn as a 1990s ANSI BBS login screen. A modem dials in and the screen draws itself row by row: a big cyan ULTRA over a white SATISFACTORY, a hexagon emblem with a turning cog, and the ident of THE CLOGGED MERGER BBS (sysop Belt Daddy, caller Pioneer #0140, last on at 3 A.M.). Below are three panels in the app's tab colours. ITEMS shows a recipe card as a production line: 3 Reinforced Iron Plate and 12 Iron Rod ride conveyors into an Assembler (60 s, 15 MW) and 2 Modular Frame ride out. OBJECTIVES lists the five Space Elevator phases like a rave line-up. BUILDINGS is the shift roster of nine production machines. Then a file transfer counting up to 140 items, 211 recipes and 477 buildings, a blinking PRESS ANY KEY, a scroller, and a status bar with the run command and the live URL.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · now calling THE CLOGGED MERGER BBS, the factory-floor bulletin board<br>
  <sub>⚡ SysOp: Belt Daddy · node 1 of 1 · the shift never ends · an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Park it on a second monitor, a phone, or the far side of an alt-tab, and look things up before the belt backs up.

⚡ Three tabs, all wired into each other: **Objectives** (what the Space Elevator wants next, and how many), **Items** (search as you type; recipe cards with per-minute rates, the machine, its cycle time and power draw) and **Buildings** (build costs, what each one makes, Mk-by-Mk upgrade paths). Click any part and you're on its recipe. It is 3 a.m. You only came to check one thing.

⚡ Two commands and you're dialled in (Python 3.10+, run from the repo root). Or install nothing at all: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<pre>
══════════════════════════════════════════════════════════════════════════════
 THE CLOGGED MERGER BBS  -=[ MAIN MENU ]=-  node 1 of 1 · 14400 baud · 03:07
──────────────────────────────────────────────────────────────────────────────
  <a href="#whats-inside">[O] Objectives</a> ... 5 phases          <a href="#how-its-built">[H] How it's built</a> . one Streamlit app
  <a href="#whats-inside">[I] Items</a> ........ 211 recipes       <a href="#data--credits">[D] Data &amp; credits</a> . who to thank
  <a href="#whats-inside">[B] Buildings</a> .... 477 to build      <a href="app/app.py">[S] Source</a> ......... app/app.py
  <a href="#run-it-locally">[R] Run it</a> ....... two commands      <a href="#license">[A] Apache 2.0</a> ..... protection: none
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/">[L] Live</a> ......... in your browser   <a href="#top">[G] Goodbye</a> ........ ATH0, NO CARRIER
══════════════════════════════════════════════════════════════════════════════
 Select [O I B R L H D S A G] or press any key (still a README) &gt; _
</pre>

<details>
<summary>⚡ <b>MERGER.NFO</b> · release info, the line-up in full, house rules, greetz</summary>

```text
             _   _ _   _____ ___    _
            | | | | | |_   _| _ \  /_\
            | |_| | |__ | | |   / / _ \
             \___/|____||_| |_|_\/_/ \_\   S A T I S F A C T O R Y

      -=[ THE CLOGGED MERGER BBS · the factory-floor bulletin board ]=-

 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  RELEASE INFO
   Title ............ ULTRA-SATISFACTORY
   Type ............. companion app for the game Satisfactory. a lookup tool
   The game ......... not included, not ours. go and buy it, it's very good
   Released by ...... THE CLOGGED MERGER BBS (sysop: Belt Daddy)
   Supplied by ...... greeny/SatisfactoryTools (the data)
                      the Satisfactory Wiki (the images)
   Cracked by ....... nobody. this app was never locked
   Protection ....... none. it's Apache 2.0
   Format ........... one Streamlit app, app/app.py. Python 3.10+
   Contents ......... 140 items, 211 recipes (88 alternates), 477 buildings,
                      5 Space Elevator phases
   Runs on .......... a second monitor, a phone, the far side of alt-tab
   Rating ........... [##########] would alt-tab again

  THE RECIPE CARD ON THE SCREEN ABOVE
    3 Reinforced Iron Plate  3/min ═╗
                                    ╠═[ ASSEMBLER ]═► 2 Modular Frame  2/min
   12 Iron Rod              12/min ═╝   60 s · 15 MW
   the belts up there are to scale: rods are packed 4x tighter than plates

  INSTALL
   1. python -m pip install -r requirements.txt
   2. python -m streamlit run app/app.py
   3. open http://localhost:8501
   4. or install nothing: https://lukexyz.github.io/ULTRA-SATISFACTORY/

  THE LINE-UP (Space Elevator, all five phases, doors whenever you're ready)
   1 AUTOMATION BASICS
     Smart Plating x50 · Versatile Framework x100 · Automated Wiring x500
   2 LOGISTICS & STEEL
     Automated Wiring x500 · Modular Frame x500 · Smart Plating x100
     Versatile Framework x500
   3 OIL & COMPUTERS
     Versatile Framework x2500 · Modular Engine x500
     Adaptive Control Unit x100
   4 NUCLEAR & ENDGAME
     Assembly Director System x1000 · Magnetic Field Generator x500
     Nuclear Pasta x100 · Thermal Propulsion Rocket x25
   5 ALIEN TECH & QUANTUM
     Biochemical Sculptor x500 · AI Expansion Server x100
     Neural-Quantum Processor x100 · Ballistic Warp Drive x100

  THE SHIFT ROSTER (9 production machines, 0 tea breaks)
   Assembler · Blender · Constructor · Foundry · Manufacturer · Packager
   Particle Accelerator · Refinery · Smelter
   + 468 more things to build: 333 structure pieces, 59 logistics, 26 decor,
     15 power, 14 transit, 7 special, 7 storage, 7 extraction

  HOUSE RULES
   1. spaghetti is a layout, not a failure
   2. "just one more belt" is not a unit of time
   3. nobody rebuilds the starter base. we all said we would
   4. an alternate recipe is not a personality (there are 88. collect them)
   5. if it runs at 99.8% efficiency, no it doesn't, go and look

  GREETZ
   the Manifold Militia · the Load Balancer Purists · Clipping Anonymous
   the Temporary Belt Preservation Society (est. three saves ago)
   everyone whose power grid is one more Smelter away from a blackout
   whoever is on the other side of that alt-tab, still holding W

  NO LOVE TO
   the one splitter facing the wrong way. you know where it is. we don't

  SMALL PRINT
   unofficial fan project, not affiliated with Coffee Stain Studios.
   game data: greeny/SatisfactoryTools. images: Satisfactory Wiki,
   CC BY-NC-SA 4.0. the code is Apache 2.0.

 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        the shift never ends · 14400 baud · ATH0 · NO CARRIER
```

</details>

<br>

---

## 07 · Demoparty Compo Slides

<sub><code>07-compo-slides_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/07-compo-slides_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY on the big screen at BOTTLENECK 2026, an invented demoparty, seen over the heads of the crowd in a dark hall. The beamer shows an entry slide: companion app compo, entry 01, ULTRA in neon cyan and SATISFACTORY in white next to a hexagon emblem with a turning cog, by lukexyz, with the comment: every recipe, building and Space Elevator objective, one click apart. A corner timer counts down to the next competition. Then the slides rotate: a huge timer counts 00:03, 00:02, 00:01, NOW for the tab compo; entry 01 OBJECTIVES, 5 Space Elevator phases; entry 02 ITEMS, 140 craftable items, with 211 machine recipes in the data; entry 03 BUILDINGS, 477 buildings; then an end-of-compo slide: voting is closed, it never opened, the belt decides. Last comes the prize-giving, revealed from last place up with score bars: 3rd OBJECTIVES 5 points, 2nd ITEMS 140 points, 1st BUILDINGS 477 points. Confetti falls and the crowd throws its arms in the air.">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: now showing on the big screen</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.<br>
  ⚡ Keep it on the second monitor, the phone, or one alt-tab away, for when it is 3&nbsp;a.m. and you need to know what goes into a Modular Frame. It is 3 Reinforced Iron Plates and 12 Iron Rods. You're welcome.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Watch the entry live in your browser</b></a>, nothing to install · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">credits</a>
</p>

⚡ **The tab compo: three entries, one app.** Everything links: click an ingredient or product to open its recipe, click the machine to open its building.

- ⚡ <kbd>01</kbd> **OBJECTIVES** by Elevator Pitch. Pick a Space Elevator phase, see the parts it needs and how many, click a part for its recipe.
- ⚡ <kbd>02</kbd> **ITEMS** by Ctrl+F Collective. Search as you type. Recipe cards show the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products.
- ⚡ <kbd>03</kbd> **BUILDINGS** by Foundation Issues. Every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.

⚡ **Organisers: to run the entry on the compo machine** you need Python 3.10+ and two commands, typed from the repo root.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Streamlit serves it at `http://localhost:8501`; the long version is under [Run it locally](#run-it-locally). No compo machine? The [browser build](https://lukexyz.github.io/ULTRA-SATISFACTORY/) is the whole app in a tab.

⚡ **Prizegiving, items-per-minute compo.** Last place first, as tradition demands. Nobody voted. The belt decided.

```text
 BOTTLENECK 2026 / ITEMS-PER-MINUTE COMPO / PRIZEGIVING        last place first

  #  TITLE                 BY           PTS  SHARE OF THE TOP SCORE
 10. Modular Engine        Manufacturer   1  █
  9. Modular Frame         Assembler      2  █▌
  8. Rotor                 Assembler      4  ███▌
  7. Reinforced Iron Plate Assembler      5  ████▌
  5. Caterium Ingot        Smelter       15  █████████████
  5. Iron Rod              Constructor   15  █████████████
  4. Iron Plate            Constructor   20  █████████████████
  2. Wire                  Constructor   30  █████████████████████████▌
  2. Iron Ingot            Smelter       30  █████████████████████████▌
  1. Screw                 Constructor   40  ██████████████████████████████████

 PTS = items per minute out of one machine on the standard recipe.
 Ten of the app's 211 recipes. The other 201 were too busy working to enter.
```

<p align="center">
  <sub>⚡ BOTTLENECK 2026 is an invented demoparty and its crews are made up. The numbers are real: they are what the app shows.<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The lookups are free.</sub>
</p>

<details>
<summary>⚡ <b>Timetable</b>: the Space Elevator stage, phase by phase, with what it wants and how many</summary>

```text
 BOTTLENECK 2026 / TIMETABLE / SPACE ELEVATOR STAGE         doors: never closed

 SLOT     COMPO                  WHAT THE ELEVATOR WANTS              HOW MANY
 PHASE 1  Automation basics      Smart Plating ......................      x50
                                 Versatile Framework ................     x100
                                 Automated Wiring ...................     x500
 PHASE 2  Logistics & steel      Automated Wiring ...................     x500
                                 Modular Frame ......................     x500
                                 Smart Plating ......................     x100
                                 Versatile Framework ................     x500
 PHASE 3  Oil & computers        Versatile Framework ................    x2500
                                 Modular Engine .....................     x500
                                 Adaptive Control Unit ..............     x100
 PHASE 4  Nuclear & endgame      Assembly Director System ...........    x1000
                                 Magnetic Field Generator ...........     x500
                                 Nuclear Pasta ......................     x100
                                 Thermal Propulsion Rocket ..........      x25
 PHASE 5  Alien tech & quantum   Biochemical Sculptor ...............     x500
                                 AI Expansion Server ................     x100
                                 Neural-Quantum Processor ...........     x100
                                 Ballistic Warp Drive ...............     x100
 AFTER    Sleep                  cancelled. PHASE 1 of the next save is on

 The OBJECTIVES tab is this timetable, except every part is a link to its
 recipe and nobody makes you sit on a folding chair.
```

</details>

<details>
<summary>⚡ <b>Entry form</b>: slide text, notes for the organisers, credits, greetings, house rules</summary>

```text
=== BOTTLENECK 2026 / ENTRY FORM ==============================================
 title ......... ULTRA-SATISFACTORY
 author ........ lukexyz
 compo ......... companion app (new this year. one entry. it is this one)
 platform ...... Python 3.10+ with Streamlit, or any browser tab
 contents ...... 140 craftable items
                 211 machine recipes, 88 of them alternates
                 477 buildings, 9 of them production machines
                 5 Space Elevator phases
 licence ....... Apache 2.0 for the code
 protection .... none. it is open source. there is nothing to unlock

=== SLIDE TEXT (this goes on the big screen) ==================================
 Every recipe, building and Space Elevator objective, one click apart.

=== NOTES FOR THE ORGANISERS (this does not) ==================================
 - It is a lookup tool. It will not build the factory for you. We asked.
 - No compo machine needed: the browser build is Streamlit running on
   WebAssembly (stlite), republished by GitHub Actions on every push to main.
 - It also deploys as a full Streamlit server on Modal (modal_app.py).
 - The 88 alternates are in the data. Item cards show the standard recipe.
 - One Streamlit app, app/app.py, with streamlit-aggrid for the searchable
   grids. The game data is loaded by ultra_satisfactory/data.py.
 - Unofficial fan project, not affiliated with Coffee Stain Studios.
   Satisfactory is their game and it is sold separately.

=== CREDITS ===================================================================
 game data ..... greeny/SatisfactoryTools
 images ........ the Satisfactory Wiki (CC BY-NC-SA 4.0)
 slides ........ drawn from scratch. the font, the crowd and the confetti too

=== GREETINGS =================================================================
 Elevator Pitch · Ctrl+F Collective · Foundation Issues · Headlift Anonymous ·
 the Hypertube Cannon Appreciation Society · Team Blueprint Regret ·
 everyone whose "temporary" test line is now load-bearing ·
 and whoever is still in the hall at 3 a.m. saying "results, then bed"

=== HOUSE RULES ===============================================================
 1. No sleeping in the main hall. Nobody was going to.
 2. Entries run from the repo root.
 3. The belt is always right.
```

</details>

<br>

---

## 08 · MilkDrop Visualiser

<sub><code>08-milkdrop-visualiser_opus_5.5.md</code></sub>

<!-- Header 08-milkdrop-visualiser_opus_5.5 for ULTRA-SATISFACTORY. Generated by src/08-milkdrop-visualiser_opus_5.5.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/08-milkdrop-visualiser_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as a music visualiser with nothing playing. Waveform rings are born around a gold hexagon with a turning cyan cog in it and fly outward, rotating and fading, into a mandala tunnel on black; a mirrored echo doubles the pattern and a grid of small motion-vector marks shows the flow. ULTRA in neon cyan and SATISFACTORY in white sit under the emblem, above the line: every recipe, building and Space Elevator objective, one click apart. Every twelve seconds the preset blends into the next, one per tab of the app: OBJECTIVES, a purple five-armed spiral; ITEMS, a pink cog with bouncing teeth; BUILDINGS, blue nested hexagons. Overlay text reads fps: 60.0, F1: help, the preset name Belt Choir - Objectives (what the Elevator wants).milk, now playing: nothing. the factory hums, and live: lukexyz.github.io/ULTRA-SATISFACTORY">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  ⚡ Nothing is playing. That hum is the factory, and it would like to know why you alt-tabbed out at 3&nbsp;a.m. to look up a Rotor.
</p>

<p align="center">
  ⚡ Three presets, which the app insists on calling tabs: <b>OBJECTIVES</b> (what each Space Elevator phase wants, and how many), <b>ITEMS</b> (search as you type, recipe cards with per-minute rates) and <b>BUILDINGS</b> (what each one makes, tier by tier, Mk by Mk).<br>
  ⚡ Click a part, land on its recipe. Click the machine, land on its building. Second monitor, phone or one alt-tab away.
</p>

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

<p align="center">
  ⚡ Python 3.10+, run from the repo root, then open <b>http://localhost:8501</b>. The long version is under <a href="#run-it-locally">Run&nbsp;it&nbsp;locally</a>.<br>
  ⚡ Or install nothing and <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>press&nbsp;play&nbsp;in&nbsp;your&nbsp;browser</b></a>: the whole app runs inside the tab, no server to start.<br>
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. Contains no audio. May contain traces of hum.</sub>
</p>

<details>
<summary>⚡ <b>F1: help</b> (what the keys would do, and what the three presets are)</summary>

```text
╭──────────────────────────────────────────────────────────────────────────────╮
│  ULTRA-SATISFACTORY · HELP                       close: the little triangle  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  F1 ......... this help. you found it                                        │
│  F2 ......... song title. nothing is playing: that hum is the factory        │
│  F4 ......... preset name. there are three, one per tab of the app           │
│  F5 ......... frame rate. it reads 60.0 because 60.0 is what got drawn       │
│  T .......... launch the title animation. too late: it is the big one        │
│  SPACE ...... next preset: Objectives → Items → Buildings → round again      │
│  ALT+TAB .... back to the game. the only shortcut that matters               │
│  ESC ........ go to bed. not bound                                           │
│                                                                              │
│  (no key is wired to anything. it is a picture. the app is real.)            │
│  (the Iron Rod count is real too: a preset lasts 12 s, a rod takes 4.)       │
│                                                                              │
├─[ the three presets ]────────────────────────────────────────────────────────┤
│                                                                              │
│  OBJECTIVES   purple, five spiral arms: one per Space Elevator phase.        │
│               pick a phase, see the parts it needs and how many,             │
│               click a part for its recipe                                    │
│                                                                              │
│  ITEMS        pink, a cog with twelve bouncing teeth. 140 items,             │
│               searched on every keystroke. recipe cards: ingredients         │
│               with per-minute rates, the machine, its cycle time and         │
│               power draw, and the products                                   │
│                                                                              │
│  BUILDINGS    blue, nested hexagons. 477 buildings and what each one         │
│               makes, grouped by tier, plus Mk-by-Mk upgrade paths for        │
│               miners, conveyors, pipelines and storage                       │
│                                                                              │
│  everything links: click an ingredient or a product and its recipe           │
│  opens. click the machine and its building opens.                            │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```

</details>

<details>
<summary>⚡ <b>FACTORY_HUM.M3U</b>: 16 real recipes as a playlist, plus the Space Elevator set list</summary>

```text
 FACTORY_HUM.M3U                16 tracks · 6:21 · repeat: all, forever

  #   TRACK                     LENGTH   PER MIN   VENUE          POWER
 ──   ───────────────────────   ──────   ───────   ────────────   ─────
 01   Iron Ingot                 0:02      30      Smelter         4 MW
 02   Copper Ingot               0:02      30      Smelter         4 MW
 03   Caterium Ingot             0:04      15      Smelter         4 MW
 04   Iron Plate                 0:06      20      Constructor     4 MW
 05   Iron Rod                   0:04      15      Constructor     4 MW
 06   Screw                      0:06      40      Constructor     4 MW
 07   Wire                       0:04      30      Constructor     4 MW
 08   Cable                      0:02      30      Constructor     4 MW
 09   Reinforced Iron Plate      0:12       5      Assembler      15 MW
 10   Rotor                      0:15       4      Assembler      15 MW
 11   Smart Plating              0:30       2      Assembler      15 MW
 12   Versatile Framework        0:24       5      Assembler      15 MW
 13   Modular Frame              1:00       2      Assembler      15 MW
 14   Heavy Modular Frame        0:30       2      Manufacturer   55 MW
 15   Modular Engine             1:00       1      Manufacturer   55 MW
 16   Adaptive Control Unit      2:00       1      Manufacturer   55 MW

 LENGTH is one machine cycle. PER MIN is what one machine puts out.
 Standard recipes, one machine each, nothing overclocked. The app has all
 211 recipes (88 of them alternates). These 16 just made the album.

 ♪ SET LIST: what the Space Elevator wants, phase by phase

 1  Automation basics     Smart Plating x50 · Versatile Framework x100 ·
                          Automated Wiring x500
 2  Logistics & steel     Automated Wiring x500 · Modular Frame x500 ·
                          Smart Plating x100 · Versatile Framework x500
 3  Oil & computers       Versatile Framework x2500 · Modular Engine x500 ·
                          Adaptive Control Unit x100
 4  Nuclear & endgame     Assembly Director System x1000 ·
                          Magnetic Field Generator x500 · Nuclear Pasta x100 ·
                          Thermal Propulsion Rocket x25
 5  Alien tech & quantum  Biochemical Sculptor x500 ·
                          AI Expansion Server x100 ·
                          Neural-Quantum Processor x100 ·
                          Ballistic Warp Drive x100

 Phase 3 alone wants 2500 Versatile Framework. One Assembler plays track 12
 at 5 a minute: 2500 / 5 = 500 minutes = 8 h 20 of the same song.
 Five Assemblers do it in 1 h 40, in five-part harmony. Build the choir.
```

</details>

<details>
<summary>⚡ <b>Preset info</b>: the numbers, the wiring, credits and greetz</summary>

```ini
; ultra-satisfactory.preset
; not a real preset file. it is a README wearing one.

[what]
name         = ULTRA-SATISFACTORY
is           = a companion app for the game Satisfactory
does         = looks things up: recipes, buildings, Space Elevator objectives
does_not     = play music, count your frames, or hear a beat. the pulse
               in the middle is a timer
affiliation  = none. unofficial fan project, not affiliated with Coffee
               Stain Studios. Satisfactory is their game. this hums along

[field]
items        = 140     ; craftable
recipes      = 211     ; machine recipes, 88 of them alternates
buildings    = 477     ; 9 production machines, 333 structure pieces,
                       ; 59 logistics, 26 decor, 15 power, 14 transit,
                       ; 7 special, 7 storage, 7 extraction
phases       = 5       ; Space Elevator
tabs         = 3       ; Objectives, Items, Buildings
decay        = 0.98    ; of your evening, per frame
zoom         = "just one more belt"

[signal chain]
source       = data/data.json              ; the game data
loader       = ultra_satisfactory/data.py  ; works out the per-minute rates
output       = app/app.py                  ; one Streamlit app, three tabs,
                                           ; streamlit-aggrid for the grids

[outputs]
local        = python -m streamlit run app/app.py    ; localhost:8501
browser      = lukexyz.github.io/ULTRA-SATISFACTORY  ; nothing to install
cloud        = modal_app.py                          ; Streamlit on Modal
; the browser one is a stlite build: Streamlit on WebAssembly, republished
; by GitHub Actions on every push to main

[credits]
game_data    = greeny/SatisfactoryTools
images       = the Satisfactory Wiki (CC BY-NC-SA 4.0)
licence      = Apache 2.0, for the code. copy protection: none. remix it
visualiser   = a homage to MilkDrop by Ryan Geiss. the look only: no preset,
               no code and no artwork was borrowed. nothing is listening

[greetz]
to           = the Belt Choir (sopranos on Mk.1, basses on Mk.5)
             + the Hum Appreciation Society
             + Friends of the Idle Constructor
             + the Committee for Perfectly Parallel Pipes
             + everyone who has left the game running just for the hum
             + whoever is awake at 3 a.m. with 40 Screws a minute and a dream
```

</details>

<p align="center">
  <img src="assets/08-milkdrop-visualiser_opus_5.5-scope.svg" width="100%" alt="A stopped player's oscilloscope: a flat line with a faint hum on it, carrying small hexagons along like a conveyor belt. Stopped, 0:00 of 6:21, 0 kbps. The hum is real.">
</p>

<br>

---

## 09 · Oscilloscope Channels

<sub><code>09-oscilloscope_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/09-oscilloscope_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as an oscilloscope view, the way chiptune videos show a song one channel at a time. The name glows across the top as a vector trace, ULTRA in cyan and SATISFACTORY in white, above the tab names Objectives, Items and Buildings and the line: every recipe, one click apart. Below is a three by three grid of scope cells, one per production machine, each with a moving waveform and a real recipe readout. 1 Smelter: Iron Ingot, 30 a minute, 2 second cycle, 4 MW, a pulse wave. 2 Constructor: Screw, 40 a minute, 6 seconds, 4 MW, a narrow pulse arpeggio. 3 Assembler: Modular Frame, 2 a minute, 60 seconds, 15 MW, a stepped triangle. 4 Foundry: Steel Ingot, 45 a minute, 4 seconds, 16 MW, a sawtooth. 5 Manufacturer: Heavy Modular Frame, 2 a minute, 30 seconds, 55 MW, a wavetable. 6 Refinery: Plastic, 20 a minute, 6 seconds, 30 MW, a sine. 7 Packager: Packaged Water, 60 a minute, 2 seconds, 10 MW, a plucked square wave. 8 Blender: Cooling System, 6 a minute, 10 seconds, 75 MW, an FM bell. 9 Particle Accelerator: Nuclear Pasta, 0.5 a minute, 120 seconds, noise. Channel 10, the Pioneer, is a flat line: sleep, 0 a minute, no signal since 03:00, just one more belt.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> is a companion app for the factory-building game <i>Satisfactory</i>.<br>
  ⚡ Every recipe, building and Space Elevator objective, one click apart.
</p>

<p align="center">
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>&#9835; play it live in your browser</b></a>
  &nbsp;&middot;&nbsp; <a href="#run-it-locally">run it locally</a>
  &nbsp;&middot;&nbsp; <a href="#whats-inside">what's inside</a>
  &nbsp;&middot;&nbsp; <a href="#how-its-built">how it's built</a>
</p>

⚡ That thing up there is an oscilloscope view: how chiptune people film a song, one scope per sound channel. This song is a factory. Nine channels, one per production machine, and the numbers under each trace are real recipes out of the app. Channel 10 is you. It is flat, because it is 3 a.m. and you alt-tabbed out to look up Heavy Modular Frames instead of going to bed.

| Tab | What it plays |
| :--- | :--- |
| ⚡&nbsp;**OBJECTIVES** | Pick a Space Elevator phase: the parts it wants, and how many. Click a part for its recipe. |
| ⚡&nbsp;**ITEMS** | Search as you type. Recipe cards: per-minute rates, machine, cycle time, power draw. |
| ⚡&nbsp;**BUILDINGS** | Every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths. |

⚡ Everything links: click an ingredient, get its recipe. Click the machine, get its building. Park it on the second monitor, the phone, or one alt-tab from the spaghetti.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Python 3.10+, run from the repo root, and Streamlit serves it at `http://localhost:8501`. The long version is in [Run it locally](#run-it-locally).<br>
⚡ Or install nothing: the [live build](https://lukexyz.github.io/ULTRA-SATISFACTORY/) runs the whole app in your browser tab.

<p align="center"><sub>
  ⚡ 140 craftable items &middot; 211 machine recipes (88 of them alternates) &middot; 477 buildings &middot; 5 Space Elevator phases &middot; 0 hours of sleep<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. Bring your own copy of the game.
</sub></p>

<details>
<summary>⚡ <b>Channel sheet</b>: what each scope is playing, and which parts of the picture are true</summary>

```text
 FACTORY FLOOR (3 A.M. MIX)      10 channels · 8 bars · 120 BPM · loops forever

 CH  MACHINE          NOW PLAYING          /MIN  CYCLE   MW  VOICE
 01  Smelter          Iron Ingot             30    2 s    4  pulse, width sweep
 02  Constructor      Screw                  40    6 s    4  pulse arpeggio
 03  Assembler        Modular Frame           2   60 s   15  stepped triangle
 04  Foundry          Steel Ingot            45    4 s   16  chugging sawtooth
 05  Manufacturer     Heavy Modular Frame     2   30 s   55  wavetable pad
 06  Refinery         Plastic                20    6 s   30  sliding sine
 07  Packager         Packaged Water         60    2 s   10  plucked square
 08  Blender          Cooling System          6   10 s   75  FM bell
 09  Particle Accel.  Nuclear Pasta         0.5  120 s  yes  noise
 10  Pioneer          Sleep                   0      -    -  flat line

 TRUE      every number: the standard recipe for one machine, exactly as the
           ITEMS tab shows it (items per minute, cycle time, machine MW)
 TRUE      the app: 140 craftable items, 211 machine recipes, 88 alternates,
           477 buildings, 5 Space Elevator phases, three tabs
 NOT TRUE  the waveforms. Nobody put a probe on a Smelter. Each machine got the
           voice that suits it: the Constructor thumps, the Refinery sloshes,
           a Heavy Modular Frame takes four ingredients so the Manufacturer
           gets four harmonics, and the Particle Accelerator is, of course,
           noise
 HONEST    the MW on channel 09. The data lists the Particle Accelerator at
           0 MW, which nobody believes, so the scope just says "yes"
 SILENT    channel 10. No signal since 03:00. Just one more belt
```

</details>

<details>
<summary>⚡ <b>Description box</b>: who made what, the small print, and greetz</summary>

```text
 ULTRA-SATISFACTORY · the bit under the video that nobody expands

 WRITTEN IN ..... Python, as a single Streamlit app (app/app.py)
 GRIDS BY ....... streamlit-aggrid, for the searchable tables
 GAME DATA ...... greeny/SatisfactoryTools, loaded from data/data.json
 PICTURES ....... the Satisfactory Wiki, CC BY-NC-SA 4.0
 STREAMS FROM ... GitHub Pages: a stlite build, Streamlit on WebAssembly,
                  republished by GitHub Actions on every push to main
 ALSO TOURS ..... a full Streamlit server on Modal (modal_app.py)
 LICENCE ........ Apache 2.0 for the code. Protection: none. Read LICENSE
 THE GAME ....... Satisfactory, by Coffee Stain Studios. Not ours, not
                  affiliated, not included. Go buy it, then come back

 PERFORMED BY ... The Overclocked Nine (Smelter, Constructor, Assembler,
                  Foundry, Manufacturer, Packager, Particle Accelerator,
                  Refinery, Blender) with a Pioneer on silence
 RECORDED AT .... Bottleneck Bay 4, in one take, because nobody could find
                  the off switch
 RELEASED ON .... Ninety Degree Turns Only, the label for people who rebuild
                  a working factory because a belt was one tile off

 GREETZ ......... everyone who said "just one more belt" and saw the sun rise
                  · the second monitor · the person who labels their storage
                  · whoever keeps feeding the AWESOME Sink instead of tidying
 NO GREETZ ...... doing belt maths in your head · the splitter that was a
                  merger all along · the one Constructor you forgot to
                  connect to power
```

</details>

<br>

---

## 10 · Arcade Attract Mode

<sub><code>10-arcade-attract_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/10-arcade-attract_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY as an arcade cabinet in attract mode. A lit marquee reads ULTRA SATISFACTORY: Throughput Amusement Co. presents a companion app for Satisfactory, unofficial fan project. The portrait monitor has a score header (ITEMS 000140, RECIPES 000211, BUILDINGS 000477) and hard-cuts between three screens: a title card with the pitch (every recipe, building and objective, one click apart) and an output-per-minute legend (Screw 40, Iron Ingot 30, Iron Plate 20, Iron Rod 15, Rotor 4, plus 88 alternates); a demo shift where one Smelter, two Constructors and three more Constructors turn 30 Iron Ore a minute into 120 Screws a minute on belts drawn to scale, while a small pioneer paces the aisle and a counter ticks up two screws a second, in real time; and a high-score table ranking the five Space Elevator phases by parts wanted: 3100, 1625, 1600, 800 and 650. INSERT NOTHING blinks above FREE PLAY: IT'S APACHE 2.0. Bezel cards explain the three tabs (Objectives, Items, Buildings) and the operator settings; the control panel has a joystick, three tab-coloured buttons, a coin slot taped over with the word FREE, and the two commands that start the app.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ The cabinet is in attract mode because you left to fix one belt, four hours ago. An unofficial fan project, not affiliated with Coffee Stain Studios.</sub>
</p>

<p align="center">
  ⚡
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>1P START: play it in your browser</kbd></a>
  <a href="#run-it-locally"><kbd>2P START: run it locally</kbd></a>
  <a href="#whats-inside"><kbd>HOW TO PLAY</kbd></a>
  <a href="#how-its-built"><kbd>OPERATOR'S MANUAL</kbd></a>
  <kbd>COIN</kbd> <i>(rejected: free play)</i>
</p>

⚡ Three buttons, three tabs: **Objectives** (what each Space Elevator phase wants, and how many), **Items** (search as you type; recipes with per-minute rates) and **Buildings** (every building and what it makes). Everything links: a part is one click from its recipe, a machine one click from its building. Park it on a second monitor, a phone, or the far side of an alt-tab.

⚡ Keep your coin: the code is [Apache 2.0](LICENSE). Two commands (Python 3.10+, from the repo root), or none at all: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<details>
<summary>⚡ <b>HIGH SCORES</b>: the whole score table, for monitors that only do one colour</summary>

```text
        ITEMS            RECIPES           BUILDINGS
       000140             000211              000477

                 - SPACE ELEVATOR ORDERS -
                  parts wanted, per phase

     RANK   SCORE    NAME   PHASE
     1ST    003100   BLT    3  OIL & COMPUTERS
                            Versatile Framework ....... x2500
                            Modular Engine ............  x500
                            Adaptive Control Unit .....  x100

     2ND    001625   SPG    4  NUCLEAR & ENDGAME
                            Assembly Director System .. x1000
                            Magnetic Field Generator ..  x500
                            Nuclear Pasta .............  x100
                            Thermal Propulsion Rocket .   x25

     3RD    001600   3AM    2  LOGISTICS & STEEL
                            Automated Wiring ..........  x500
                            Modular Frame .............  x500
                            Versatile Framework .......  x500
                            Smart Plating .............  x100

     4TH    000800   ALT    5  ALIEN TECH & QUANTUM
                            Biochemical Sculptor ......  x500
                            AI Expansion Server .......  x100
                            Neural-Quantum Processor ..  x100
                            Ballistic Warp Drive ......  x100

     5TH    000650   TAB    1  AUTOMATION BASICS
                            Automated Wiring ..........  x500
                            Versatile Framework .......  x100
                            Smart Plating .............   x50

                  THE ELEVATOR ALWAYS WINS

             INSERT NOTHING        CREDIT 00
              FREE PLAY: IT'S APACHE 2.0
```

⚡ The scores are real: each one is a phase's part counts added up, exactly as the Objectives tab lists them. The initials are not real. Nobody called BLT has ever finished Phase 3. Your factory is not on the board, and it knows why.

</details>

<details>
<summary>⚡ <b>DEMO SHIFT</b>: what the little factory on the screen is doing, with the maths</summary>

```text
   - OUTPUT PER MINUTE -      standard recipes, as the Items tab shows them

   SCREW ........ 40/MIN   Constructor, 6 s, 4 MW   1 Iron Rod -> 4 Screw
   IRON INGOT ... 30/MIN   Smelter, 2 s, 4 MW       1 Iron Ore -> 1 Iron Ingot
   IRON PLATE ... 20/MIN   Constructor, 6 s, 4 MW   3 Iron Ingot -> 2 Iron Plate
   IRON ROD ..... 15/MIN   Constructor, 4 s, 4 MW   1 Iron Ingot -> 1 Iron Rod
   ROTOR ........  4/MIN   Assembler, 15 s, 15 MW   5 Iron Rod + 25 Screw -> 1
   ? ............ ??/MIN   88 alternate recipes are in the data as well

   THE DEMO LINE
                                  30/min                30/min
   Iron Ore ═══> [ SMELTER x1 ] ═══════> [ CONSTRUCTOR x2 ] ═══════╗
                                Iron Ingot              Iron Rod   ║
                                                                   ║
   [ CRATE ] <═══════════════════════════ [ CONSTRUCTOR x3 ] <═════╝
                       Screw, 120/min

   6 machines, 24 MW, 30 Iron Ore a minute in, 120 Screws a minute out.
   Every belt on the screen moves at one speed, so the gap between items
   is the rate: an ingot every 2 s, a rod every 2 s, two screws a second.
   The counter is in real time too. It reaches 13 before the cut.
```

⚡ Small print: the demo is staged. The app looks recipes up; it does not run your factory, count your screws or judge your spaghetti. The arithmetic is real.

</details>

<details>
<summary>⚡ <b>SERVICE MENU</b>: operator settings, what's in the cabinet, credits, greetz</summary>

```text
  THROUGHPUT AMUSEMENT CO.            SERVICE MENU            CABINET REV 0.0.1
  ─────────────────────────────────────────────────────────────────────────────
  DIP SWITCHES
   COINAGE ........... free play. the code is Apache 2.0: read it, fork it
   PLAYERS ........... 1, and a spare monitor, a phone, or alt-tab
   DIFFICULTY ........ spaghetti
   SLEEP ............. disabled
   CONTINUE? ......... always
   ATTRACT SOUND ..... none. that hum is your factory

  IN THE CABINET
   140 craftable items ....... searched on every keystroke
   211 machine recipes ....... 88 of them alternates
   477 buildings ............. 9 production machines, 333 structure pieces,
                               59 logistics, 26 decor, 15 power, 14 transit,
                               7 special, 7 storage, 7 extraction
     5 Space Elevator phases . parts and counts, one click from a recipe

  BOARD SET
   app/app.py ................ the whole game board: one Streamlit app
   ultra_satisfactory/ ....... data.py loads data/data.json, works out rates
   streamlit-aggrid .......... the searchable grids
   GitHub Pages .............. a stlite build: Streamlit in your browser
   modal_app.py .............. the same app as a full server, on Modal

  CREDITS (REAL)
   game data ................. greeny/SatisfactoryTools
   item and building images .. the Satisfactory Wiki (CC BY-NC-SA 4.0)
   the game .................. Satisfactory, by Coffee Stain Studios.
                               not included, not ours, sold separately
   affiliation ............... none. unofficial fan project

  GREETZ (INVENTED, LIKE THE INITIALS)
   the Overflow Valve Appreciation Club · Night Shift at Pipe 4 ·
   the Society for Perfectly Straight Belts (membership: 0) ·
   everyone who typed "screw" into a search box at 3 a.m. ·
   BLT, SPG, 3AM, ALT and TAB, still on the board, still not asleep

  NO GREETZ
   the screw. it knows what it did

  Throughput Amusement Co. does not exist. Please do not send it coins.
  ─────────────────────────────────────────────────────────────────────────────
```

</details>

<br>

---

## 11 · Win32 Cracktro

<sub><code>11-win32-cracktro_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/11-win32-cracktro_opus_5.5.svg" width="100%" alt="A README banner in the style of a mid-2000s Windows cracktro. TORQUE DIRTY presents ULTRA-SATISFACTORY as a bevelled chrome logo: ULTRA in cyan chrome above SATISFACTORY in silver, standing on a mirror floor with its reflection, stars flying outward behind it, a sheen sweeping across the letters. On each side a square steel girder (one face hazard tape, one riveted plate, one a cyan light bar, one a lattice truss) is twisted like a wrung towel between two chucks. A text writer types three pages: a companion app for the factory game Satisfactory, every recipe, building and Space Elevator objective, one click apart, tabs Objectives, Items and Buildings; then the two commands to run it and the no-install address lukexyz.github.io/ULTRA-SATISFACTORY; then 140 items, 211 recipes (88 alternate), 477 buildings, 5 Space Elevator phases, protection none (Apache 2.0), unofficial fan project. Along the bottom a gold dot-matrix scroller rides a sine wave.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ wrung out by TORQUE DIRTY &middot; protection: none, it's Apache 2.0 &middot; an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ A companion app for the factory-building game *Satisfactory*. It lives next to the game (the other monitor, a phone, the far side of an alt-tab) and answers the 3&nbsp;a.m. question: what goes into that, how many a minute, and which machine do I blame? Your spreadsheet may now retire.

- ⚡ **OBJECTIVES**: pick a Space Elevator phase, see what it wants and how many. Click a part, get its recipe.
- ⚡ **ITEMS**: search as you type. Recipe cards: ingredients per minute, the machine, its cycle time, its power draw.
- ⚡ **BUILDINGS**: every building and what it makes, by tier, plus Mk-by-Mk upgrade paths.

⚡ All of it bolted together: click an ingredient, land on its recipe; click the machine, land on its building.

⚡ Two commands, no installer wizard (Python 3.10+, from the repo root, then open `http://localhost:8501`):

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or install nothing at all: it runs **[live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**, a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`. DirectX not required.

<p align="center">
  ⚡ <a href="#whats-inside">what's inside</a> &middot; <a href="#run-it-locally">run it locally</a> &middot; <a href="#how-its-built">how it's built</a> &middot; <a href="#data--credits">data &amp; credits</a> &middot; <a href="#license">license</a> &middot; <kbd>ESC</kbd> back to the factory
</p>

<details>
<summary>⚡ <b>TORQUE.NFO</b>: the intro again in 80 columns, a sample lookup, install notes, how the twister twists, greetz</summary>

```text
[=====o=====]                                                      [=====o=====]
  |=======|                T O R Q U E     D I R T Y                |##|\\\\\\|
 |#|=======|                    proudly presents                   |####|\\\\\\|
|####|======|                                                      |#####|\\\\\|
|######|====|     ╔═════════════════════════════════════════╗      |######|\\\\|
|#######|===|     ║   U L T R A - S A T I S F A C T O R Y   ║      |#######|\\\|
 |#######|=|      ╚═════════════════════════════════════════╝       |#######|\|
  |#######|   every recipe, building and Space Elevator objective,  |########||
 |/|#######|                    one click apart                     ||########|
|///|#######|                                                       |=|#######|
|////|######|   WHAT ......... companion app for Satisfactory      |====|######|
|/////|#####|   INSIDE ....... 140 items, 211 recipes (88 alt),    |======|####|
|//////|####|                  477 buildings, 5 elevator phases     |======|##|
|///////|###|   PROTECTION ... none. It is Apache 2.0.               |=======|
 |///////|#|    REQUIRES ..... Python 3.10+, or a browser tab       |X|=======|
  |///////|     DIRECTX ...... not required                        |XXXXX|=====|
 ||////////|    INTRO ........ 1 SVG, 0 lines of JavaScript        |XXXXXXX|===|
 |X|///////|    GIRDERS ...... 2, twisted. They signed a waiver.    ||XXXXXXXX|
|XXX|///////|   THE GAME ..... sold separately. Fan project.       |\\\\|XXXXXX|
|XXXX|//////|                                                      |\\\\\\\|XXX|
|XXXXX|/////|   press any key. nothing happens. it is a README.      |\\\\\\\|
[=====o=====]                                                      [=====o=====]

── ONE CLICK APART, DEMONSTRATED ───────────────────────────────────────────────
  Modular Frame ........... 2/min   Assembler    60 s cycle   15 MW
      in: 3 Reinforced Iron Plate + 12 Iron Rod   out: 2   (click the plate)
  Reinforced Iron Plate ... 5/min   Assembler    12 s cycle   15 MW
      in: 6 Iron Plate + 12 Screw   out: 1                  (click the plate)
  Iron Plate ............. 20/min   Constructor   6 s cycle    4 MW
      in: 3 Iron Ingot   out: 2                             (click the ingot)
  Iron Ingot ............. 30/min   Smelter       2 s cycle    4 MW
      in: 1 Iron Ore   out: 1                   (the ore you dig up yourself)
  Three clicks from frame to ingot. Standard recipes, one machine each.

── INSTALL NOTES ───────────────────────────────────────────────────────────────
  1. python -m pip install -r requirements.txt
  2. python -m streamlit run app/app.py
  3. open http://localhost:8501 on whichever screen the game is not on
  4. there is no step 4. No installer wizard, no browser toolbar, no reboot.
     It is a free lookup tool under Apache 2.0.
  Or skip all four: https://lukexyz.github.io/ULTRA-SATISFACTORY/

── THE SPACE ELEVATOR, FIVE PHASES (as the app names them) ─────────────────────
  1 Automation basics     2 Logistics & steel     3 Oil & computers
  4 Nuclear & endgame     5 Alien tech & quantum
  Phase 3 alone wants 2500 Versatile Framework. One Assembler makes 5 a
  minute, so that is 500 minutes of one Assembler. Put the kettle on.

── HOW THE TWISTER TWISTS ──────────────────────────────────────────────────────
  No GIF, no video, no JavaScript: one SVG file and some CSS keyframes.
  Each girder is 60 slices. Every slice plays the same 12 second
  animation, 72 ms out of step with the slice next to it. That lag is the
  twist. Faces: hazard tape, riveted plate, light bar, lattice truss.
  Music: none. Hum a chiptune. We trust you.
  Torque applied: excessive. Torque authorised: also excessive.

── GREETZ ──────────────────────────────────────────────────────────────────────
  The Overtightened Bolt Collective · Lefty Loosey Ltd
  · The Quarter-Turn Club · Rivet Counters International
  · The Stripped Thread Support Group
  · whoever is holding the other end of this girder
  · everyone who alt-tabbed here for one recipe and is still reading greetz

── NO GREETZ ───────────────────────────────────────────────────────────────────
  The Screw. 40 a minute per Constructor and the factory still wants more.
  We twist things for a living and even we are tired of screwing.

── SMALL PRINT ─────────────────────────────────────────────────────────────────
  An unofficial fan project, not affiliated with Coffee Stain Studios.
  The game is theirs and is sold separately. The game data comes from
  greeny/SatisfactoryTools. The item and building images come from the
  Satisfactory Wiki (CC BY-NC-SA 4.0). The code is Apache 2.0.
  TORQUE DIRTY is made up. The girders are fine. They asked to go again.

        ═════  torque responsibly. or don't. the girders like it.  ═════
```

</details>

<br>

---

## 12 · Netlabel Cassette

<sub><code>12-cassette-jcard_opus_5.5.md</code></sub>

<p align="center">
  <img src="assets/12-cassette-jcard_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as a netlabel cassette, laid out on a cutting mat. A translucent orange cassette with a black label reading ULTRA-SATISFACTORY, SIDE A, C-6, 5:31; its reels turn, the tape pack on the left shrinks while the one on the right grows, and after six tracks the cassette flips over to SIDE B. Below it, a green-ink index card lists twelve recipes as tracks, with each item's craft cycle as its running time. Side A, Smelter and Constructor: Iron Ingot 0:02, Copper Ingot 0:02, Iron Plate 0:06, Iron Rod 0:04, Screw 0:06, Cable 0:02. Side B, Assembler and Manufacturer: Rotor 0:15, Smart Plating 0:30, Modular Frame 1:00, Versatile Framework 0:24, Modular Engine 1:00, Adaptive Control Unit 2:00. A highlighter marks the track now playing, and someone has written YOUR SAVE: 600 HRS in ballpoint. Along the bottom edge sits the top of a tape deck: a play lamp, a three-digit counter that adds up the craft seconds played on this side (022 when side A ends, 309 when side B ends) and a two-row level meter labelled BELT and HISS. On the right the J-card lies open: a flap with the counts (140 items, 211 recipes, 477 buildings, 5 phases) and the credits, a navy spine with ULTRA-SATISFACTORY in gold and the catalogue number BH-140-211-477, and a sunset front cover with a factory skyline, the title ULTRA SATIS-FACTORY and three stripes for the tabs OBJECTIVES, ITEMS and BUILDINGS. An obi strip down the cover carries the name in katakana, the pitch (every recipe, building and Space Elevator objective, one click apart) and the price: 0 yen, free forever.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Out now on Belt Hiss Tapes, a label that does not exist, on a format your PC cannot play. Luckily it is an app. Press play anyway.
</p>

<p align="center">
  ⚡
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>► PLAY</kbd></a> live in your browser &nbsp;
  <a href="#run-it-locally"><kbd>● REC</kbd></a> dub a local copy &nbsp;
  <a href="#whats-inside"><kbd>►► FF</kbd></a> what's inside &nbsp;
  <a href="#how-its-built"><kbd>◄◄ REW</kbd></a> how it's built &nbsp;
  <kbd>■ STOP</kbd> <i>not fitted</i>
</p>

⚡ You play it alongside the game: second monitor, phone, or the far side of an alt-tab at 3 a.m., when the belts have backed up and you cannot remember what goes in a Rotor. Three tabs, and everything links: click a part for its recipe, click the machine for its building.

- ⚡ <kbd>OBJECTIVES</kbd> pick a Space Elevator phase, see the parts it wants and how many.
- ⚡ <kbd>ITEMS</kbd> search as you type. Recipe cards show per-minute rates, the machine, its cycle time and its power draw.
- ⚡ <kbd>BUILDINGS</kbd> every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths.

⚡ To dub your own copy: Python 3.10+ and two commands, run from the repo root. The long version is under [Run it locally](#run-it-locally).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py        # now playing on http://localhost:8501
```

⚡ No deck, no Python, no patience? [Play it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): nothing to install, nothing to rewind.

<p align="center">
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The tape is not sold at all.</sub>
</p>

<details>
<summary>⚡ <b>Liner notes</b>: the index card as text, the catalogue number decoded, the Space Elevator suite, credits and thanks</summary>

```text
ULTRA-SATISFACTORY · VARIOUS MACHINES     BELT HISS TAPES · BH-140-211-477 · C-6
┌─[A] SIDE A · smelter + constructor ─┬─[B] SIDE B · assembler + manufacturer ─┐
│ 1  Iron Ingot ............... 0:02  │ 1  Rotor ....................... 0:15  │
│ 2  Copper Ingot ............. 0:02  │ 2  Smart Plating ............... 0:30  │
│ 3  Iron Plate ............... 0:06  │ 3  Modular Frame ............... 1:00  │
│ 4  Iron Rod ................. 0:04  │ 4  Versatile Framework ......... 0:24  │
│ 5  Screw .................... 0:06  │ 5  Modular Engine .............. 1:00  │
│ 6  Cable .................... 0:02  │ 6  Adaptive Control Unit ....... 2:00  │
├─────────────────────────────────────┴────────────────────────────────────────┤
│ NR [ ] on [x] off      BELTS [x] spaghetti [ ] tidy      DATE  3 a.m. again  │
│ Running time = one craft cycle of the standard recipe.  0:22 + 5:09 = 5:31   │
└──────────────────────────────────────────────────────────────────────────────┘

ULTRA-SATISFACTORY                                        BELT HISS TAPES · 2026
various machines                                         cat. no. BH-140-211-477
════════════════════════════════════════════════════════════════════════════════

THE CATALOGUE NUMBER IS THE TRACK COUNT
  140 ....... craftable items, searched on every keystroke
  211 ....... machine recipes, 88 of them alternates
  477 ....... buildings you can build: 9 production machines, 333 structure
              pieces, 59 logistics, 26 decor, 15 power, 14 transit,
              7 special, 7 storage, 7 extraction
    5 ....... Space Elevator phases (the hidden tracks, below)

ABOUT THE RUNNING TIMES
  Every time on the card is real: it is the craft cycle of that item's
  standard recipe, in minutes and seconds. A Modular Frame takes 60 s in an
  Assembler, so track B3 runs 1:00. The whole tape runs 5:31.
  The counter on the deck adds the craft seconds up as they play: it reads
  022 when side A runs out and 309 at the end of side B.
  Your save file runs somewhat longer.

HIDDEN TRACKS: THE SPACE ELEVATOR SUITE, IN FIVE MOVEMENTS
  I    Automation basics ...... Smart Plating x50, Versatile Framework x100,
                                Automated Wiring x500
  II   Logistics & steel ...... Automated Wiring x500, Modular Frame x500,
                                Smart Plating x100, Versatile Framework x500
  III  Oil & computers ........ Versatile Framework x2500, Modular Engine x500,
                                Adaptive Control Unit x100
  IV   Nuclear & endgame ...... Assembly Director System x1000,
                                Magnetic Field Generator x500,
                                Nuclear Pasta x100,
                                Thermal Propulsion Rocket x25
  V    Alien tech & quantum ... Biochemical Sculptor x500,
                                AI Expansion Server x100,
                                Neural-Quantum Processor x100,
                                Ballistic Warp Drive x100

PERSONNEL
  Smelter ............ ingots. 4 MW. has never once complained
  Constructor ........ plates, rods, screws, cable. 4 MW. the workhorse
  Assembler .......... 15 MW. the rhythm section
  Manufacturer ....... 55 MW. lead machine. very loud
  also appearing ..... Blender, Foundry, Packager, Particle Accelerator,
                       Refinery

PRODUCTION
  recorded at ........ app/app.py: one Streamlit app, three tabs
  mastered by ........ ultra_satisfactory/data.py, straight from data/data.json
  searchable grids ... streamlit-aggrid
  pressed at ......... GitHub Pages: a stlite build (Streamlit in the browser,
                       via WebAssembly), republished by GitHub Actions on
                       every push to main
  also touring ....... modal_app.py: a full Streamlit server on Modal

CREDITS
  game data .......... greeny/SatisfactoryTools
  pictures ........... the Satisfactory Wiki (CC BY-NC-SA 4.0)
  code licence ....... Apache 2.0. home taping is encouraged: fork it
  the game ........... Satisfactory, by Coffee Stain Studios. sold separately.
                       this is an unofficial fan project, not affiliated

THANKS
  the Sawtooth Roof Appreciation Society · the Pencil Rewinders' Union ·
  the Headlift Support Group (meets upstairs, arrives eventually) ·
  everyone who built the stairs last · whoever keeps petting the Lizard
  Doggo instead of fixing the power. you are the real take-up reel.

SMALL PRINT
  Belt Hiss Tapes is made up, and so are the tape and the deck. The app is
  real. The reels in the picture keep a constant tape speed, so the emptier
  hub turns faster. This helps nobody.
  No cassettes were harmed. Several belts were.
════════════════════════════════════════════════════════════════════════════════
```

</details>

<details>
<summary>⚡ <b>Care of your tape</b>: troubleshooting for pioneers</summary>

```text
SYMPTOM                        REMEDY
─────────────────────────────  ─────────────────────────────────────────────────
tape will not play             it is a web app. open the link instead
port 8501 already taken        that is the last copy you dubbed. still running
belts backed up                ITEMS tab: type the part, read the per-minute
                               rates, build one more machine
forgot what phase 3 wants      OBJECTIVES tab. it wants 2500 Versatile
                               Frameworks. sit down first
cannot find the Assembler      BUILDINGS tab, or click the machine on any
                               recipe card. everything links
it is 3 a.m.                   correct. no remedy is known
tape chewed by the deck        there is no tape. check the belts instead
```

</details>
