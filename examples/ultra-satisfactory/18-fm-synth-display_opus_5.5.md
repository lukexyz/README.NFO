<p align="center">
  <img src="assets/18-fm-synth-display_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY drawn as the status screen of an early-1990s FM-synth music player: one lavender colour on black, with lime green used only for the keys that are sounding. A wide wordmark reads ULTRA SATISFACTORY over a bar that says: a companion app for the factory-building game Satisfactory, unofficial fan project. On the left are nine track strips, one per production machine, each a line of readouts above a miniature eight-octave piano keyboard with one lit key: 01 Smelter, Iron Ingot, 30 a minute; 02 Foundry, Steel Ingot, 45; 03 Constructor, Screw, 40; 04 Assembler, Reinforced Iron Plate, 5; 05 Manufacturer, Heavy Modular Frame, 2; 06 Refinery, Plastic, 20; 07 Packager, Packaged Water, 60; 08 Blender, Cooling System, 6; and a PCM track, Particle Accelerator, Nuclear Pasta, 0.5. Each key steps once for every item its machine makes, in real time, and a small slice bar fills towards the next one. On the right, a control panel boxes the three tabs, Objectives, Items and Buildings, joined by dashed rules, above the click-through chain part, recipe, machine, building; slanted segment digits count 140 items, 211 recipes, 88 alternates, 477 buildings and 5 phases. Below that are a 31-bar spectrum analyser of output rates with peak-hold ticks, and power level bars with pan dials marked manifold on the left and balancer on the right. Along the bottom the now-playing line reads: every recipe, building and objective, one click apart, over a file selector listing Play it live, What's inside, Run it locally, How it's built, Data and credits, and License.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Play it live in your browser</b></a> &nbsp;·&nbsp; <a href="#run-it-locally">run it locally</a> &nbsp;·&nbsp; unofficial fan project, not affiliated with Coffee Stain Studios
</p>

- ⚡ `01 LIVE.OPM` **[Play it live](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**: the whole app in a browser tab. Nothing to install.
- ⚡ `02 INSIDE.OPM` **[What's inside](#whats-inside)**: three tabs. **Objectives**: pick a Space Elevator phase, see the parts it wants and how many. **Items**: search as you type, get recipe cards with per-minute rates, the machine, its cycle time and its power draw. **Buildings**: every building and what it makes, plus Mk-by-Mk upgrade paths. Everything links: a part is one click from its recipe, a machine one click from its building.
- ⚡ `03 RUN.OPM` **[Run it locally](#run-it-locally)**: two commands and Python 3.10+, from the repo root. They are right under this list.
- ⚡ `04 BUILT.OPM` **[How it's built](#how-its-built)**: Python, one Streamlit app ([`app/app.py`](app/app.py)), streamlit-aggrid for the grids, stlite for the browser build.
- ⚡ `05 CREDITS.OPM` **[Data & credits](#data--credits)**: game data from greeny/SatisfactoryTools, images from the Satisfactory Wiki.
- ⚡ `06 LICENSE.OPM` **[License](#license)**: [Apache 2.0](LICENSE). Protection: none. Copy it, fork it, clip it through a wall and pretend not to notice.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

⚡ That screen is what music players looked like on Japanese home computers in the early nineties: no notes scrolling past, just one tiny piano per sound channel with the sounding key lit. This one is wired to a factory. Nine tracks, nine production machines, and every lit key is one item coming off the line, in real time. The Packager lands a note a second. The Manufacturer manages two a minute. The Particle Accelerator plays one note every two minutes and considers it a solo.

⚡ It makes no sound. GitHub strips audio out of READMEs, and your factory is loud enough. Park the real app on a second monitor, your phone, or the far side of an alt-tab.

<details>
<summary>⚡ <b>TRACK SHEET</b>: what each keyboard is playing, and which numbers are real (all of them)</summary>

```text
 OUTPUT-PER-MINUTE DISPLAY           9 tracks · 120 s loop · C minor pentatonic

 TRK  MACHINE               NOW MAKING              OPM  KEY-ON   CYC   MW IN  @
 01   Smelter               Iron Ingot               30   2.00s    2s    4  1  3
 02   Foundry               Steel Ingot              45   1.33s    4s   16  2  2
 03   Constructor           Screw                    40   1.50s    6s    4  1 20
 04   Assembler             Reinforced Iron Plate     5  12.00s   12s   15  2 27
 05   Manufacturer          Heavy Modular Frame       2  30.00s   30s   55  4 19
 06   Refinery              Plastic                  20   3.00s    6s   30  1 11
 07   Packager              Packaged Water           60   1.00s    2s   10  2 13
 08   Blender               Cooling System            6  10.00s   10s   75  4  7
 PCM  Particle Accelerator  Nuclear Pasta           0.5 120.00s  120s  ---  2  2

 OPM     output per minute of the standard recipe, as the Items tab shows it
 KEY-ON  60 / OPM. One lit key is one item off the line, averaged, in real time
 CYC     the machine's cycle time          MW  its power draw
 IN      how many different ingredients    @   item cards that use that machine
 ---     the data lists no power figure for the Particle Accelerator. Nor do we

 POLYRHYTHM   every 12 seconds, tracks 07 02 03 01 06 04 land
              12 : 9 : 8 : 6 : 4 : 1 key-ons
 PAN LAW      left is manifold, right is load balancer. The dials keep flipping
 FUSE STATUS  holding. It has not seen track 08 kick yet
 ENVELOPE     attack instant · decay none · sustain all night · release never
 BEDTIME      --:--  (never set)
```

⚡ On the real hardware the FM chip went by OPM, and the ninth voice was a sample channel, hence eight OPM tracks and one PCM. Here OPM stands for Output Per Minute, which is what a factory game was always going to do to that acronym.

⚡ Nobody composed the polyrhythm. It is what those six recipes do when you leave them running. It was a temporary arrangement and it is now load-bearing. Every note is in C minor pentatonic, so whatever the machines do, it is in key.

⚡ Track 03 has played one screw every second and a half since you opened this page. Nobody ordered that many. That is where the storage boxes come from.

</details>

<details>
<summary>⚡ <b>OUTPUT SPECTRUM</b>: the analyser is a real histogram, and the peak ticks are telling the truth</summary>

```text
 OUTPUT SPECTRUM      standard recipes by output rate · 31 bars · 104 items

   /MIN ITEMS                           /MIN ITEMS
   0.25    1  =                            15    6  ======
    0.4    1  =                            20   11  ===========
    0.5    2  ==                         22.5    1  =
   0.75    1  =                            25    2  ==
      1    6  ======                       30   12  ============
    1.5    1  =                            40    5  =====
  1.875    2  ==                           45    1  =
      2    3  ===                          50    3  ===
    2.5    4  ====                         60    7  =======
   3.75    2  ==                           75    1  =
      4    2  ==                          100    1  =
      5   10  ==========                  120    3  ===
      6    2  ==                          250    1  =
    7.5    4  ====                        360    1  =
     10    6  ======                     1500    1  =
   12.5    1  =
```

⚡ Of the 140 items the app lists, 104 have a standard machine recipe in the data. Sort them by how many a minute that recipe puts out and you get 31 different rates, from 0.25 to 1500: one analyser bar each. The bars bounce because it is an analyser and bouncing is its whole job, but the white peak-hold slice on each one tops out at the real count, on a square-root scale. The tallest is 30 a minute, shared by 12 items. The factory's favourite note, if you like.

⚡ The level bars under it are power draw in MW on a log scale, from the Smelter's 4 to the Blender's 75. Each one kicks when its machine finishes an item and sags until the next. The slice bar on every track strip is the same thing seen from the other side: progress towards the next key-on.

</details>

<details>
<summary>⚡ <b>LINER NOTES</b>: set list, what's in the box, credits, thanks</summary>

```text
 SET LIST      the five Space Elevator phases, as the Objectives tab lists them

  1  Automation basics      Smart Plating x50 · Versatile Framework x100 ·
                            Automated Wiring x500
  2  Logistics & steel      Automated Wiring x500 · Modular Frame x500 ·
                            Smart Plating x100 · Versatile Framework x500
  3  Oil & computers        Versatile Framework x2500 · Modular Engine x500 ·
                            Adaptive Control Unit x100
  4  Nuclear & endgame      Assembly Director System x1000 ·
                            Magnetic Field Generator x500 · Nuclear Pasta x100 ·
                            Thermal Propulsion Rocket x25
  5  Alien tech & quantum   Biochemical Sculptor x500 ·
                            AI Expansion Server x100 ·
                            Neural-Quantum Processor x100 ·
                            Ballistic Warp Drive x100

 IN THE BOX
  140 craftable items ..... searched on every keystroke
  211 machine recipes ..... 88 of them alternates
  477 buildings ........... 9 production machines, 333 structure pieces,
                            59 logistics, 26 decor, 15 power, 14 transit,
                            7 special, 7 storage, 7 extraction
    5 phases .............. see above. The elevator is never full

 PERSONNEL (REAL)
  game data ............... greeny/SatisfactoryTools
  item, building images ... the Satisfactory Wiki (CC BY-NC-SA 4.0)
  driver .................. Python, one Streamlit app, streamlit-aggrid
  venues .................. GitHub Pages (a stlite build: Streamlit in your
                            browser via WebAssembly) and Modal (a full server)
  the game ................ Satisfactory, by Coffee Stain Studios. Not
                            included and not ours: this is an unofficial fan
                            project, not affiliated with them

 PERSONNEL (INVENTED)
  arranged by ............. The Unpaid Operators
  thanks .................. Envelope Pushers' Glee Club · Tripped Breaker
                            Brass · the Low-Frequency Overclockers (LFO)
  no thanks ............... whoever set the toggle to SPAGH. and left
```

⚡ The Unpaid Operators do not exist, and neither do the nine machines: the display is a drawing. On the real chip every voice was built from four "operators", and nobody paid those either. The recipes, rates and counts are the app's own, checked against its data.

</details>
