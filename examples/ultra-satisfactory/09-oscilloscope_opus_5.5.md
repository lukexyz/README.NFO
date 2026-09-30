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
