# Screensavers, idle screens and visualisers

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 10 styles, researched 2026-09-30. Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

This family is what a screen shows when nobody is typing: an endless loop with no input, which is exactly what a script-free animated SVG is. It splits into four schools. (1) Light synths and visualisers, from the analogue Atari Video Music (1977) through Jeff Minter's joystick-played Psychedelia (1984) to the feedback programs Cthugha (1993), Geiss (1998) and MilkDrop (2001), where each frame is a warped copy of the previous one with a waveform drawn on top. (2) Operating-system savers: the flat line-drawing Windows 3.1 set (Mystify, Starfield Simulation, Marquee) and the OpenGL set that came out of an internal contest for Windows NT 3.5 (3D Pipes, 3D Maze, 3D Text). (3) The commercial sprite saver, After Dark (Mac 1989, Windows 1991), a module host where small sprites cross a black screen and every module has sliders. (4) Appliance idle screens: the bouncing DVD-player logo and broadcast colour bars / 'no signal'. They differ mainly in what carries the picture (solid shapes, thin lines, lit 3D tubes, feedback smear, sprites, flat bars) and almost none of them carry text, so each entry says where the project name goes.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [idle-01](#idle-01) | Atari Video Music: pulsing two-part diamonds in a tiled array | Animated SVG | Easy | 3/5 |
| [idle-02](#idle-02) | Minter light synth (Psychedelia): mirrored trails of expanding pattern seeds | Animated SVG | Medium | 4/5 |
| [idle-03](#idle-03) | Feedback fire (Cthugha / Geiss): a waveform smeared by zoom-and-blur in a fire palette | Animated SVG | Medium | 4/5 |
| [idle-04](#idle-04) | MilkDrop preset: waveform ring in a zooming mandala field, with preset-name ticker | Animated SVG | Medium | 4/5 |
| [idle-05](#idle-05) | Windows 3.1 saver set: Mystify polylines, Starfield Simulation and Marquee | Animated SVG | Easy | 4/5 |
| [idle-06](#idle-06) | 3D Pipes: glossy coloured tubes growing through black space | Animated SVG | Medium | 5/5 |
| [idle-07](#idle-07) | 3D Maze: brick corridor walk with overlay map | Animated SVG | Hard | 4/5 |
| [idle-08](#idle-08) | After Dark module format: small sprites drifting diagonally, with a slider control panel | Animated SVG | Easy | 4/5 |
| [idle-09](#idle-09) | Bouncing idle logo: wordmark ricochets, changes colour, and eventually hits the corner | Animated SVG | Easy | 4/5 |
| [idle-10](#idle-10) | Off-air idle: colour bars, test card and the hopping 'no signal' box | Animated SVG | Easy | 4/5 |

---

<a name="idle-01"></a>

## idle-01 · Atari Video Music: pulsing two-part diamonds in a tiled array

**Animated SVG** · build: **Easy** · impact: **3/5** · 1977-78, Atari Video Music (model C240), a hi-fi add-on box that plugged into a television

The earliest commercial electronic music visualiser: an Atari box designed by Robert J. Brown (of the home Pong team) under the codename Project Mood, sold in 1977 for \$169.95 and dropped after about a year. It is entirely analogue, with no CPU or software, and turns the stereo signal into solid coloured shapes on a TV. It is remembered as the ancestor of every later visualiser and for cameos in music videos and TV.

**What it looks like**

- A two-part diamond on black: the outer diamond follows the left audio channel, the inner diamond the right
- Three shape modes on push buttons: solid, hole (hollow centre) and ring, plus an auto mode that cycles them
- The diamond is multiplied into a regular array by horizontal and vertical repeat buttons (Wikipedia lists 1, 2, 3, 5 across and 1, 2, 4, 8 down)
- Flat, fully saturated TV colours with hard edges, no gradients, no text anywhere on screen
- A colour knob that goes from one solid colour to a rainbow of colours across the shapes
- Two contour knobs that take the outline from soft to hard geometric; two gain knobs that set how large the shapes swell
- Motion is size only: shapes swell and shrink with loudness, they do not travel

**Palette.** Black field with flat saturated primaries and secondaries (red, cyan, yellow, green, magenta, blue). The exact hues of the unit are not documented in the sources I opened; treat any hex values as your own choice.

**Lettering.** None on screen. The only lettering is on the hardware faceplate (knob and button labels: Gain, Color, Contour, Solid, Hole, Ring, Auto). For a README, set the project name in a plain caps sans on a control strip under the picture, using those control names as the visual idiom with your own wording.

**Motion.** Each diamond scales about its own centre in stepped jumps, outer and inner on different rhythms so they drift in and out of phase; hue steps through the rainbow every few seconds; auto mode swaps solid, hole and ring. Suggested loop 12 to 16 s.

**As a README header.** A wide black SVG with a 4 x 2 or 8 x 2 array of diamonds pulsing above the fold. Under it, a thin 'faceplate' strip drawn in SVG with five round knobs and a row of square buttons; the project name sits at the left of the strip and the tagline is spelled across the button captions. No text-only fallback is needed beyond a one-line caption, since the picture has no text.

**How to build it.** Prototyped: one &lt;g&gt; symbol of two &lt;path&gt; diamonds, eight &lt;use&gt; copies, two CSS keyframe animations with steps() timing and transform-box: fill-box so each scales about its own centre, one stepped hue animation. 1 KB, renders in headless Chromium through &lt;img&gt;. Hole and ring modes are a fill swap or a stroke with no fill. A fake audio envelope is a keyframe list of 16 to 32 scale values rather than a plain ping-pong. Loop 12 to 16 s, under 40 elements, under 3 KB.

**Do not copy / caveats.** Do not use the Atari name or Fuji logo, or copy the faceplate artwork. The idea of audio-driven geometric shapes is free (the patent is from 1978 and long expired). Large full-field colour steps can be uncomfortable: keep hue steps slower than about two a second. The exact repeat counts on the buttons come from one Wikipedia passage and were not cross-checked.

**References**

- [Wikipedia: model C240, 1977, Robert J. Brown, knob and button functions, outer = left channel and inner = right](<https://en.wikipedia.org/wiki/Atari_Video_Music>)
- [AtariVideoMusic.net (fan documentation site): Project Mood, US patent 4,081,829 filed 23 Aug 1976 and granted 28 Mar 1978, all-analogue circuitry, price, discontinuation, screen appearances](<https://atarivideomusic.net/>)
- [Wikipedia music visualisation timeline placing it first, in production for only a year](<https://en.wikipedia.org/wiki/Music_visualization>)

---

<a name="idle-02"></a>

## idle-02 · Minter light synth (Psychedelia): mirrored trails of expanding pattern seeds

**Animated SVG** · build: **Medium** · impact: **4/5** · 1984-88 on 8-bit and 16-bit home computers (Psychedelia 1984 for C64, VIC-20, C16, Spectrum, MSX, CPC; Colourspace 1985 on Atari 8-bit; Trip-a-Tron 1987/88 on Atari ST and Amiga), continuing as the Virtual Light Machine on Jaguar CD and Nuon and Neon on Xbox 360

Jeff Minter's 'light synthesizer': a program you play with a joystick while music is on. A cursor drops pattern seeds along its path and each seed expands and changes shape and colour before fading, mirrored across the screen. Psychedelia takes no audio input at all, which makes it the most honest model for a silent README: the performer, not the sound, drives it.

**What it looks like**

- Black screen with a single cursor pixel; everything else is trail
- Each seed grows outward in seven discrete levels (the manual lets you define up to 7 pixels per level), each level in the next colour of a 7-step colour sequence
- Default 'quad' symmetry: the trail is mirrored through both the X and Y axes, giving a four-fold mandala; the S key steps through other mirror settings or none
- Coarse block grid: the marks are chunky cells, not smooth lines
- Eight built-in seed shapes on keys 1 to 8 (one is llama-shaped) plus eight user-defined
- Line Mode, which the manual describes as like drawing with the Aurora Borealis
- A small graduated bar at the bottom of the screen showing the value of whichever variable is being adjusted (cursor speed, buffer length, pulse speed, pulse width, smoothing delay)

**Palette.** The host machine's fixed palette on black (on the C64, its 16 colours), walked in a repeating 7-colour sequence per seed so trails read as rainbow ripples. The Amstrad review notes that version used the CPC's larger palette.

**Lettering.** None in the picture. The only text is the host computer's ROM character set in a one-line status readout naming the current variable. Put the project name there in a monospace face, with the graduated bar beside it.

**Motion.** Seeds are emitted along a curved path; each runs the same 7-step expand-and-recolour cycle, delayed by its position in the buffer, so the path looks like a travelling ripple. 'Pulse' settings emit in bursts. Suggested loop 8 to 16 s.

**As a README header.** Black SVG header, four-fold mirrored trail looping a Lissajous path so it never leaves the frame. Bottom row: project name at left in monospace, a 'variable' label and graduated bar at right carrying the tagline or version. A variant writes the project name as the path the cursor traces, so the trail spells it.

**How to build it.** Not prototyped; built from techniques that were tested in the other entries. One &lt;symbol&gt; holds seven concentric 'level' groups of small &lt;rect&gt; cells, each level shown for one step by an opacity keyframe with steps() timing and its own fill. 30 to 40 &lt;use&gt; copies placed along a precomputed path with staggered animation-delay make the trail; the whole trail group is then reused three more times with scale(-1,1), scale(1,-1) and scale(-1,-1) for quad symmetry. Roughly 60 rects plus 45 uses, 6 to 10 KB, loop 8 to 16 s. The work is in the generator that lays out the path and delays.

**Do not copy / caveats.** Do not use the Llamasoft name, the llama seed shape or Minter's preset names. The mechanism (mirrored, expanding, colour-stepping seeds) is a general technique. Sources disagree on dates: Wikipedia's VLM article says it was created in 1990, the Minter article dates VLM-1 to the 1994 Jaguar CD; Trip-a-Tron is given as 1987 in one article and 1988 in another. The Llamasoft history page at minotaurproject.co.uk could not be fetched (TLS error), so the cell resolution of the C64 display is not confirmed.

**References**

- [Wikipedia: 1984, platforms, seeds that 'expand and change shape and colour over time', no audio input, about 1 KB of 6502 code, successors Colourspace (1985) and Trip-a-Tron (1987)](<https://en.wikipedia.org/wiki/Psychedelia_(light_synthesizer)>)
- [Original C64 manual, transcribed in Rob Hogan's annotated disassembly repo: 16 patterns (8 preset, 8 user), 7 levels, symmetry, Line Mode, buffer length, pulse, sequencer, burst generators](<https://raw.githubusercontent.com/mwenge/psychedelia/master/MANUAL-C64.md>)
- [CPC Rulez: Amtix review (1985) of the Amstrad version: default quad symmetry, eight shapes on keys 1-8 including a llama](<https://cpcrulez.fr/GamesTest/psychedelia.htm>)
- [Wikipedia on Jeff Minter: the light synth line from Psychedelia to VLM and Neon with dates](<https://en.wikipedia.org/wiki/Jeff_Minter>)
- [Wikipedia on the Virtual Light Machine (Jaguar CD, Nuon)](<https://en.wikipedia.org/wiki/Virtual_Light_Machine>)

---

<a name="idle-03"></a>

## idle-03 · Feedback fire (Cthugha / Geiss): a waveform smeared by zoom-and-blur in a fire palette

**Animated SVG** · build: **Medium** · impact: **4/5** · 1993-98: Cthugha on MS-DOS (written September 1993, first public release 2.0 in March 1994, Linux 1995, Mac 1996) and the Geiss plug-in for Winamp (1998)

The first PC visualisers worked by feedback: draw the sound wave into the image, then replace the image with a warped, slightly dimmed copy of itself, many times a second. Ryan Geiss describes his plug-in as exactly two repeated steps, draw the waveform and warp the image. The result is a line that leaves flame-like wakes which swirl, zoom and fade, coloured through a palette; Cthugha named its looks Blue Fire, Metallic Lightning, Solar Flare and Oil Shimmer.

**What it looks like**

- One bright oscilloscope line (the live waveform) as the only sharp thing on screen
- Behind it, older copies of the line dragged outward, rotated and blurred into flame or smoke
- Indexed-palette colour: brightness is mapped through a fire ramp (black, deep blue or red, orange, white), so fading reads as cooling
- Fine grain in the smear: Geiss carried the rounding remainder to the next pixel, which he describes as error-diffusion dithering
- The direction of flow changes at intervals: Geiss built a second warp map in the background and switched to it on a beat
- Low-resolution, full-screen, no window chrome (DOS and early DirectX full-screen)

**Palette.** Fire ramps on black. Blue Fire: black to navy to electric blue to white. Solar Flare: black to dark red to orange to yellow-white. Metallic Lightning and Oil Shimmer are named in the sources but their exact colours are not described there.

**Lettering.** None in the effect. Cthugha and Geiss overlay at most a line of system-font text. Put the project name as one line of small monospace text in a corner, styled like a mode or palette name readout.

**Motion.** The waveform wriggles at a few cycles per second; its echoes expand and rotate away from the centre and dim; the whole field's hue or palette drifts slowly. Suggested loop 17 to 24 s (the waveform itself loops every 2 to 3 s).

**As a README header.** A black SVG band with the white waveform across the middle and its coloured wake filling the rest; project name and tagline as one monospace line top-left, a 'palette' name bottom-right. There is no text-only form.

**How to build it.** Real feedback cannot be done: SVG has no frame buffer, and a filter only ever sees the current frame, so nothing accumulates. feTurbulence plus feDisplacementMap alone gives a wobble, not a wake. What can be done honestly is an echo stack, which I prototyped: 18 copies of the waveform path, copy k scaled by 1.07^k, rotated 2.5 degrees times k, opacity 0.86^k, its SMIL path animation started 0.09 s times k earlier, all drawn through one filter (feTurbulence fractalNoise at 0.012, feDisplacementMap with its scale animated 6 to 26, then a small feGaussianBlur), with a sharp white copy on top. 61 KB with 41-point paths and 9 keyframes each (halve the points to get near 30 KB), renders in headless Chromium through &lt;img&gt;. It reads as a ribbon of flame behind a scope line. It does not swirl or pool the way the real thing does, because the warp is applied once, not compounded. Mapping grey through a fire ramp with feComponentTransfer would give the indexed-palette look; that step is untested. The animated filter repaints every frame, so keep the canvas small (800 x 240) and numOctaves at 2.

**Do not copy / caveats.** Do not use the Cthugha or Geiss names or their flame names as if they were your own product. The algorithm is freely reusable (Geiss published it). Be clear that the SVG is an imitation of feedback, not feedback. Cthugha's own site (afn.org) was unreachable, so its details rest on two Wikipedia articles. Tested in Chromium only; filter-heavy SVG animation can stutter on low-power devices.

**References**

- [Ryan Geiss's own explanation of the algorithm: two steps, precomputed warp map, bilinear interpolation from the previous frame, error-diffusion grain, two warp maps switched on a beat](<https://www.geisswerks.com/geiss/secrets.html>)
- [Geiss plug-in home page: 'written in 1998', 4.6 million downloads, version 4.29 of June 2009](<https://www.geisswerks.com/geiss/>)
- [Wikipedia on Cthugha: Kevin 'Zaph' Burfitt, dates, ports, the named flame looks, end of development January 2001](<https://en.wikipedia.org/wiki/Cthugha_(software)>)
- [Wikipedia timeline: Cthugha as one of the first visualisers for IBM PC compatibles (1993), Geiss plug-in (1998) as MilkDrop's predecessor](<https://en.wikipedia.org/wiki/Music_visualization>)

---

<a name="idle-04"></a>

## idle-04 · MilkDrop preset: waveform ring in a zooming mandala field, with preset-name ticker

**Animated SVG** · build: **Medium** · impact: **4/5** · 2001-07 on Windows, as a Winamp plug-in (MilkDrop 1.0 on 5 November 2001, twelve versions to July 2003, MilkDrop 2 with pixel shaders in 2007); alive today through projectM

Ryan Geiss's hardware-accelerated successor to his 1998 plug-in. The picture is defined by a preset, a small .milk text file of equations, and the program blends slowly from one preset to the next and reacts to beats, so it never looks the same twice. It is the thing most people actually watched while an MP3 played, and the community wrote presets by the tens of thousands.

**What it looks like**

- A closed waveform ring (or a line, or dots: eight wave modes) at the centre, redrawn every frame
- A field that zooms, rotates and warps about a movable centre and fades by a 'decay' factor (the author recommends 0.98), so old rings fly outward into symmetric mandala or tunnel shapes
- Two coloured frames hugging the screen edge: the outer border and inner border, which get pulled into the field
- A regular grid of short 'motion vector' marks (up to 64 by 48) showing the flow
- Video echo: a second, scaled and optionally flipped copy of the whole image laid over itself, which produces mirror symmetry
- Overlay text in a plain system font: preset name (F4), song title (F2), frame rate (F5), preset rating (F6), a help screen (F1), plus a launched 'song title animation' (T) and custom messages (Y)
- Slow cross-blend from one preset to another

**Palette.** No fixed palette: each preset sets wave and border colours by equation, usually cycling through the whole hue wheel at high saturation on black, with a gamma boost that blows highlights towards white.

**Lettering.** The overlay text is ordinary small system sans in white or pale colour, top corners. Presets are files named by their author and title (Wikipedia's example screenshot is one called 'Mandala Chasers'). The project name works best written as a preset name line; the tagline as the 'song title'.

**Motion.** Rings are born at the centre every fraction of a second and travel outward while rotating and fading; border frames breathe; every 15 to 20 s the colour scheme cross-fades to a second one (the preset blend). Suggested loop 30 to 40 s covering two presets.

**As a README header.** SVG header: black field, ring mandala centred or offset left, project name as the preset-name line in the top-right corner, tagline as a song-title line bottom-left, a tiny fps readout as decoration. A more useful variant puts three or four 'preset names' in rotation, each one a feature of the project, cross-fading with the colour scheme.

**How to build it.** Same limit as the feedback-fire entry: no true feedback. The MilkDrop zoom is the easier case to fake because rings flying outward are a self-similar loop. Plan (the echo-stack half of this was tested in the feedback-fire prototype; the ring version was not): 24 static closed paths, each a different snapshot of a wobbling ring; each runs one shared CSS keyframe animation that scales it from 1 to about 5 while rotating 60 degrees and fading to 0, with keyframes at 25 percent steps following an exponential so the speed looks constant; delays are staggered so a new ring is born every 0.4 s. That is one @keyframes block and 24 delays, around 15 KB. Borders are two animated &lt;rect&gt; strokes; motion vectors are one &lt;pattern&gt; of short lines; video echo is a &lt;use&gt; of the whole group with scale(-1,1) at 50 percent opacity; preset blend is a cross-fade between two colour groups. Loop 30 to 40 s, about 60 elements, 15 to 25 KB.

**Do not copy / caveats.** MilkDrop is copyright Nullsoft (now under later owners) and the name should appear only as a credit; do not reuse real preset names or authors' handles, and do not ship real .milk files as your own. The general look (ring, zoom, borders, overlay text) is free to imitate. Where the overlay text sits on screen and what the song-title animation looks like were not described in the sources I opened; only the key bindings are confirmed. Fast strobing presets are a known seizure risk in the original: keep blends slow and avoid full-field flashes.

**References**

- [Wikipedia: release dates, .milk presets, interpolation between presets, beat detection, BSD source release of 1.04 in May 2005, projectM](<https://en.wikipedia.org/wiki/MilkDrop>)
- [Ryan Geiss's MilkDrop page: 'flying through the actual soundwaves you're hearing', beat detection, copyright Nullsoft](<https://www.geisswerks.com/milkdrop/>)
- [Geiss's preset authoring guide: zoom, rot, warp, cx/cy, dx/dy, sx/sy, decay, eight wave modes, outer and inner borders, motion vectors, video echo, bass/mid/treb](<https://www.geisswerks.com/milkdrop/milkdrop_preset_authoring.html>)
- [MilkDrop 2.0d documentation (January 2008): the F-key overlays, song title animation, custom messages, sprites, hard cuts](<https://www.geisswerks.com/milkdrop/milkdrop.html>)
- [projectM, the LGPL 2.1 cross-platform reimplementation; about 10,000 presets in its default pack and 130,000+ in megapacks](<https://github.com/projectM-visualizer/projectm>)
- [Wikipedia on Nullsoft AVS (Justin Frankel, Winamp 2.61, March 2000; render/trans/misc component lists; BSD-style licence May 2005), the sibling preset system](<https://en.wikipedia.org/wiki/Advanced_Visualization_Studio>)

---

<a name="idle-05"></a>

## idle-05 · Windows 3.1 saver set: Mystify polylines, Starfield Simulation and Marquee

**Animated SVG** · build: **Easy** · impact: **4/5** · 1992-2006: shipped with Windows 3.1 and carried through to Windows XP; Marquee, Mystify and Starfield were removed in Windows Vista (which added a different saver also called Mystify)

The plain savers that came in the box: Blank Screen, Flying Windows, Marquee, Mystify and Starfield Simulation. They are drawn with simple 2D lines, dots and one line of text on black, and each has a small Setup dialog. Mystify's bouncing polygons with fading trails and the warp-speed starfield are among the most widely seen computer animations ever made, simply because every office PC ran them.

**What it looks like**

- Mystify: polygons bouncing around a black screen with each corner moving independently, each leaving a trail of fading, colour-shifting copies that weave into ribbons (the Microsoft wiki snippet I saw describes a pair of polygons with four corners each)
- Thin 1-pixel lines, no fill, no anti-aliasing
- Starfield Simulation: white dots placed at random in 3D and flown through, each reset to the distance when it passes the camera; Setup offers star density and 'warp speed'
- Flying Windows: the same code as Starfield with a logo glyph taken from the Wingdings font in place of each star
- Marquee: a single line of user text scrolling across a black or coloured background
- A small grey Setup dialog per saver, of the kind Microsoft's own sample shows: a group box, a Fast/Slow scroll bar, OK and Cancel

**Palette.** Black background. Mystify lines in two saturated hues that drift around the colour wheel; Starfield white and grey dots; Marquee text in one user-chosen colour; dialog in Windows 3.1 grey with a navy title bar.

**Lettering.** Marquee uses whatever system font the user picked, large. Dialog text is the small system sans (the sample template specifies 8-point MS Shell Dlg). Mystify and Starfield have no text.

**Motion.** Mystify: eight independent vertex coordinates per polygon ping-pong between the edges at different speeds; trails follow about a tenth of a second apart. Starfield: dots accelerate outward from the centre. Marquee: constant right-to-left scroll. Mystify need not visibly loop: with unrelated periods the repeat is minutes long.

**As a README header.** Two good layouts. (a) Mystify as the header: two trailing quadrilaterals on black with the project name set large in the centre and the tagline as a Marquee line scrolling along the bottom. (b) The Setup dialog as the text carrier: a small grey dialog titled '&lt;project&gt; Setup' floating over the running saver, its fields holding the tagline, install command and a Fast/Slow slider. Marquee alone is already a README header: one scrolling line of text, which also works as plain text without the motion.

**How to build it.** Prototyped Mystify: each polygon is four &lt;line&gt; elements whose x1, y1, x2, y2 each carry a SMIL &lt;animate values="0;max;0"&gt; with its own duration, so no keyframes need computing; each trail copy is the same set started 0.12 s later at lower opacity; colour drift is one hue animation per polygon. Two polygons with 10 trail copies is 80 lines and 320 animate elements, 34 KB, renders in headless Chromium through &lt;img&gt;. Six trail copies brings it under 20 KB. Starfield is 60 to 120 &lt;circle&gt; elements, each on one shared scale-from-centre keyframe animation with staggered delays, 5 to 10 KB. Marquee is one &lt;text&gt; with a translateX loop, under 1 KB. The dialog is static rects and text.

**Do not copy / caveats.** Do not use the Windows flag (the Flying Windows glyph) or the Microsoft or Windows names as branding; for a 'flying' variant use your own mark. Bouncing polylines, starfields and scrolling text are generic and free. The source essay says 'Windows 3.11, released in 1992'; Windows 3.1 is the 1992 release, so treat that as a slip. The 'two polygons, four corners' detail comes from a search-result snippet of a Microsoft fan wiki I could not open (it returned a payment error). Marquee's exact Setup fields were not confirmed; only Microsoft's generic sample dialog was. Colour animation was done with a CSS hue-rotate filter on a group, tested in Chromium only; animating stroke colour directly is the safer choice across browsers.

**References**

- [muffinlabs 'Before Dawn' essay: the five savers, Starfield's Setup options, Flying Windows sharing Starfield's code and taking its logo from Wingdings, Mystify's trails, After Dark's earlier 'warp'](<https://muffinlabs.com/screensavers/2-stars/>)
- [Microsoft Learn, 'Handling Screen Savers': why savers exist (phosphor burn, concealing the screen), ScreenSaverProc drawing on WM\_TIMER over a black brush, the sample Setup dialog with a Fast/Slow scroll bar](<https://learn.microsoft.com/en-us/windows/win32/lwef/screen-saver-library>)
- [Wikipedia: 3D Pipes, Beziers, Marquee, Mystify and Starfield removed in Windows Vista; a different Mystify added](<https://en.wikipedia.org/wiki/List_of_features_removed_in_Windows_Vista>)
- [Screensavers Planet listing for the original Mystify: two polygon shapes, settable number of lines and colours](<https://www.screensaversplanet.com/screensavers/mystify-511/>)
- [A browser recreation with a description of the original's behaviour (corners drifting independently, fading colour-shifting trail)](<https://jasperbernaers.com/mystify-screensaver/>)
- [XScreenSaver's Qix (Jamie Zawinski, 1992), the Unix equivalent: line segments bouncing around the screen](<https://raw.githubusercontent.com/Zygo/xscreensaver/master/hacks/config/qix.xml>)

---

<a name="idle-06"></a>

## idle-06 · 3D Pipes: glossy coloured tubes growing through black space

**Animated SVG** · build: **Medium** · impact: **5/5** · 1994-2006: Windows NT 3.5 (1994), then Windows 95 through XP; removed in Windows Vista

One of four OpenGL savers (with 3D Text, 3D Maze and 3D Flying Objects) written by the Windows OpenGL team for an internal contest meant to show off the new 3D API in NT 3.5; a marketing colleague saw them and had all four shipped before the vote finished. Pipes grow segment by segment, turning at right angles, until the screen is full, then it clears and starts again. Raymond Chen quotes Gizmodo calling it the best screensaver of all time.

**What it looks like**

- Round tubes in a few saturated colours on pure black, lit so each has a bright highlight stripe
- Pipes run only along three axes and turn at right angles on an invisible 3D grid
- Joints at the turns: ball joints (a sphere slightly fatter than the pipe), elbow joints, or a mix; from NT 4.0 the mix was one third balls and two thirds elbows
- Several pipes grow at once and pass in front of and behind one another
- When space fills, the picture is wiped and a new set begins (the 1j01 remake implements this as a dissolve)
- Easter egg: in mixed-joint mode each joint had a 1 in 1000 chance of being a Utah teapot; removed in Windows XP
- A 'flex' pipe style also existed, which used teapots in place of end caps at dead ends

**Palette.** Black background; pipe colours are strong primaries and secondaries (red, green, blue, yellow, cyan, magenta) with a white specular highlight. The sources I opened do not give the original's colour list; these are the prototype's choices.

**Lettering.** None. 3D Text, its sibling saver, is the natural title carrier: the project name as thick extruded capitals. In SVG that is a wordmark with six to eight offset copies behind it for depth.

**Motion.** Each pipe extends one grid segment every 0.2 s or so; a joint pops in at each turn; after 35 s of growth everything fades or dissolves and the loop restarts. Prototype loop 40 s.

**As a README header.** Black SVG header in which pipes grow around a reserved rectangle holding the project name (the generator simply marks those grid cells as occupied). Tagline in small text under the name. Optional: one pipe colour per top-level module of the project, with a legend. There is no text-only form.

**How to build it.** Prototyped and it reads as 3D Pipes at a glance. A generator walks six pipes over a 3D lattice, projects each segment with an oblique projection, and emits per segment a wide coloured stroke plus a thin offset white stroke at 45 percent opacity as the highlight, both with round caps; turns get a filled &lt;circle&gt; as a ball joint. Elements are written in back-to-front depth order so nearer pipes cover farther ones, while growth order is set separately by animation-delay. Draw-in is stroke-dashoffset from 1 to 0 with pathLength="1"; one shared @keyframes block ends in a fade at 94 to 98 percent. 156 segments gave 312 paths and about 90 circles, 49 KB, 40 s loop, rendered correctly in headless Chromium through &lt;img&gt;. Limits: lighting is a painted stripe, not shading; elbow joints need an arc per turn (doable, adds size); a segment cannot pass both in front of one pipe and behind another.

**Do not copy / caveats.** Do not use the Windows name or flag, and do not copy Microsoft's pipe textures. Pipes on a grid are a generic idea, as XScreenSaver's independent version shows. A teapot joint is a nice homage if you draw your own silhouette. Tested in Chromium only. 300+ animated elements is fine on desktop but should be checked on phones; offer a reduced-motion rule that shows the finished pipes.

**References**

- [Raymond Chen, The Old New Thing, 11 June 2024: the OpenGL team's contest, the four savers, marketing shipping all of them in NT 3.5](<https://devblogs.microsoft.com/oldnewthing/20240611-00/?p=109881>)
- [Raymond Chen, 24 December 2024: the teapot easter egg, the 1 in 1000 odds in mixed-joint mode, ball and elbow ratios before and after NT 4.0, flex pipes](<https://devblogs.microsoft.com/oldnewthing/20241224-00/?p=110675>)
- [The Register's write-up of the origin story, noting removal by Vista](<https://www.theregister.com/2024/06/13/windows_3d_pipes_screensaver/>)
- [1j01's web remake (Three.js, MIT): notes that the original source shipped in the NT 4.0 SDK, implements the dissolve and the teapot and candy-cane easter eggs](<https://github.com/1j01/pipes>)
- [XScreenSaver 'Pipes' by Marcelo Vianna and Jamie Zawinski, 1997: 'A growing plumbing system, with bolts and valves', with curved, ball-joint and bolted styles](<https://raw.githubusercontent.com/Zygo/xscreensaver/master/hacks/config/pipes.xml>)
- [Wikipedia: the teapot appears in Pipes only in versions before Windows XP](<https://en.wikipedia.org/wiki/Utah_teapot>)

---

<a name="idle-07"></a>

## idle-07 · 3D Maze: brick corridor walk with overlay map

**Animated SVG** · build: **Hard** · impact: **4/5** · 1995-2000: Windows 95 through Windows ME; removed in Windows XP

A first-person walk through a randomly generated maze, solved on screen by following the right-hand wall. It came from the same OpenGL contest as 3D Pipes. People remember the red brick walls, the endless turning, the rat, and the grey rock that flips the whole world upside down.

**What it looks like**

- Red brick walls, a wooden floor and a pale tiled ceiling (Wikipedia calls it asbestos tile), all texture-mapped with visible pixels
- Constant forward motion with 90-degree turns, always keeping to the right-hand wall
- A spinning grey polyhedron 'rock': touching it turns the view upside down and switches to left-wall following
- A flat rat sprite that runs the corridors; floating logo signs; globe pictures on some walls
- The exit is a floating, translucent smiley face
- Optional overlay map drawn in lines: the walker is a blue triangle, the start red, the exit green
- An option to swap the textures for animated psychedelic patterns

**Palette.** Brick red with pale mortar, brown wood, off-white ceiling, under flat lighting with no shadows; overlay map in thin bright lines with blue, red and green markers.

**Lettering.** None in the original apart from logo signs. The walls take pictures, so the project name can be a framed 'poster' on the far wall, or the caption of the overlay map.

**Motion.** Walk, stop, turn, walk. For SVG the honest versions are a straight corridor dolly that loops every 4 to 6 s, or the overlay map with a triangle tracing the right-hand wall over 30 to 60 s.

**As a README header.** Recommended: a wide header split in two. Left, a corridor view in brick with the project name on a poster on the end wall. Right, the overlay map of a small maze with a blue triangle walking it, red start and green exit, captioned with the tagline. A text-only companion is a small box-drawing maze with the name inside it.

**How to build it.** A turning first-person view needs per-frame perspective texture mapping, which SVG cannot do without scripts: transforms are affine, so bricks cannot foreshorten properly, and every turn would need its own drawn frames. What works: (1) a straight corridor built from 10 to 12 depth slices, each a scaled copy of the last about the vanishing point, the whole set scaled by one slice ratio per loop so it appears to walk forward for ever; bricks are a &lt;pattern&gt; skewed per wall, which looks right at a glance but is not true perspective; about 50 elements and 10 KB. (2) The overlay map: maze walls as one &lt;path&gt;, the walker as a triangle on &lt;animateMotion rotate="auto"&gt; along a precomputed right-hand-rule route; about 5 KB and easy. (3) The flip: rotate the corridor group 180 degrees once per loop when a grey polygon reaches the camera. Neither was prototyped.

**Do not copy / caveats.** Do not copy Microsoft's brick, floor or ceiling bitmaps, the OpenGL logo signs or the Windows flag; draw your own brick pattern. The layout idea (brick maze, rat, flip rock, smiley exit) can be evoked with original drawings. Be honest that the corridor is a trick: it cannot turn corners. The brief calls this a core vaporwave image; the sources I opened do not say so.

**References**

- [Wikipedia: versions, default textures, rat, rock that flips the view, smiley exit, right-hand rule, overlay map colours, XScreenSaver replica in 5.39 (April 2018)](<https://en.wikipedia.org/wiki/3D_Maze>)
- [XScreenSaver 'Maze3D' by Sudoer, 2018: 'A re-creation of the 3D Maze screensaver from Windows 95', with overlay, 'acid', inverter and rat options](<https://raw.githubusercontent.com/Zygo/xscreensaver/master/hacks/config/maze3d.xml>)
- [Raymond Chen: 3D Maze as one of the four NT 3.5 OpenGL contest savers](<https://devblogs.microsoft.com/oldnewthing/20240611-00/?p=109881>)
- [Wikipedia: 3D Maze and Flying Windows removed entirely in Windows XP](<https://en.wikipedia.org/wiki/List_of_features_removed_in_Windows_XP>)

---

<a name="idle-08"></a>

## idle-08 · After Dark module format: small sprites drifting diagonally, with a slider control panel

**Animated SVG** · build: **Easy** · impact: **4/5** · 1989-96: Berkeley Systems, Macintosh 1989, Windows 1991, versions 2.0 (1992), 3.0 (1994), 4.0 (1996)

The first screensaver sold as a product: a host program by Jack Eastman and Patrick Beard that ran interchangeable modules, with hundreds of third-party modules written for it. Each module is a small cartoon on a black screen with a couple of sliders. It made the screensaver a piece of desk-toy entertainment and is the reason people think of savers as funny.

**What it looks like**

- Black screen crossed by many copies of one small pixel-art sprite, all travelling the same diagonal, at two or three speeds
- Each sprite has a two- to four-frame animation cycle, redrawn with hard pixels and a limited palette
- A second, simpler companion sprite mixed in among the main ones
- Named modules with one-line premises: Starry Night (a pixelated city skyline under a night sky, the default), Warp (stars at speed), Rainstorm (rain with wind and lightning), Spotlight (a moving light spot revealing the desktop), Confetti Factory, Mowin' Man, Fish!, Messages (a scrolling line of custom text)
- Per-module sliders: the best-known one set how dark the toast was
- Bryan Braun's CSS recreation shows the whole format needs only stepped sprite frames plus a linear translate

**Palette.** Black background; sprites in the flat colours of early colour Macs and 16-colour Windows, with greys and chrome-like highlights done as two or three flat tones. No gradients.

**Lettering.** The Mac system bitmap face of the period in the control panel (Braun's recreation uses ChicagoFLF, an open-licensed lookalike). On screen the only text is the Messages module's scrolling line.

**Motion.** Sprites enter from the top-right edge and leave at the bottom-left on straight diagonals; faster ones overtake slower ones; each flips through its frames with stepped timing. Suggested loop 12 to 20 s.

**As a README header.** Black SVG header with 12 to 20 copies of an original sprite that stands for the project (a package, a gear, a paper plane: anything but a toaster) crossing diagonally, and the project name fixed in the centre or, better, scrolling as a Messages-style line. Alternative layout: a control panel window with a module list at left (the project's features as 'modules'), a small live preview, and two sliders at right carrying real settings or stats.

**How to build it.** Not prototyped, but it is the most direct fit in the family and Braun's project proves it in CSS. One &lt;symbol&gt; per animation frame; a sprite instance is a &lt;g&gt; with a translate keyframe animation (linear, 8 to 14 s, staggered delays) holding two to four &lt;use&gt; frames whose opacity is switched by a steps() keyframe. 16 instances of a 3-frame sprite is about 70 elements; pixel art drawn as &lt;rect&gt; runs or a single &lt;path&gt; per frame keeps it at 6 to 15 KB. Use shape-rendering="crispEdges". The control panel variant is static rects and text plus one sprite in the preview.

**Do not copy / caveats.** The flying toasters must not be used or imitated: Berkeley Systems sued Delrina over a parody module and a US district judge found infringement (Delrina swapped the wings for propellers), and Jefferson Airplane in turn sued Berkeley over winged toasters (dismissed because the album art had not been registered as a trademark). Avoid toasters, toast and winged household objects altogether, and do not use the After Dark name, module names or any Berkeley artwork. The format (many small sprites on a diagonal, a slider panel) is a general idea. The control panel layout described here is from general knowledge of the product, not from a source I opened; only the existence of per-module sliders is confirmed.

**References**

- [Wikipedia: Berkeley Systems, 1989 Mac and 1991 Windows, authors, third-party modules, module list with descriptions, slider, versions, the Delrina (1993) and Jefferson Airplane (1994) cases](<https://en.wikipedia.org/wiki/After_Dark_(software)>)
- [Wikipedia on Berkeley Systems: first modular saver to be sold, founders, both lawsuits, Sierra acquisition in 1997](<https://en.wikipedia.org/wiki/Berkeley_Systems>)
- [Bryan Braun's 'After Dark in CSS': thirteen modules recreated with CSS animation only](<https://www.bryanbraun.com/after-dark-css/>)
- [The repo's README: 'CSS alone', no JavaScript or GIFs; code MIT, font SIL OFL, original artwork copyright Berkeley Systems, 'use at your own risk'](<https://github.com/bryanbraun/after-dark-css>)

---

<a name="idle-09"></a>

## idle-09 · Bouncing idle logo: wordmark ricochets, changes colour, and eventually hits the corner

**Animated SVG** · build: **Easy** · impact: **4/5** · Late 1990s-2000s DVD players left idle; a meme from 2007 (The Office) and again from about 2018-19 (livestreams, recreations)

The idle screen built into DVD players: the format logo on black, drifting diagonally and bouncing off the edges, in some versions changing colour at each bounce. Everyone who watched it waited for it to land exactly in a corner. The Office made that the joke of a cold open (Launch Party, aired 11 October 2007), which the writers say came from watching the logo in their own writers' room.

**What it looks like**

- One flat-colour wordmark in a wide oval lozenge on a pure black field, nothing else
- Constant speed on a 45-degree-ish diagonal, reversing one axis at each edge
- The logo's colour changes at each bounce in some versions
- The near miss: it approaches a corner and touches one edge a moment before the other
- The rare perfect corner hit, which the internet treats as an event
- 4:3 or 16:9 television framing

**Palette.** Black background; the logo in one saturated flat colour at a time (blue, red, yellow, green, magenta, cyan, white), switching at bounces.

**Lettering.** A heavy italic sans wordmark above a flattened ellipse carrying a second small word in spaced capitals. Build your own: the project name in a bold oblique sans over your own lozenge. Do not reproduce the DVD letterforms.

**Motion.** Horizontal and vertical travel are independent ping-pongs. A corner hit happens when both reverse at the same instant, so the loop can be designed around one: with 7 s per horizontal crossing and 5 s per vertical crossing the mark hits a corner at 35 s and the whole path repeats at 70 s.

**As a README header.** The project name is the bouncing mark, so the header needs no other title. Black SVG, 800 x 240; tagline fixed in small grey text along the bottom edge, or a 'corner hits' counter in one corner as a joke. For a text fallback, a one-line caption is enough.

**How to build it.** Prototyped at 1.2 KB. Three nested &lt;g&gt;: the outer animates translateX with 'linear infinite alternate' over 7 s, the middle animates translateY the same way over 5 s, the inner holds the wordmark. Colour change on bounce: a stepped hue animation on the outer group (one step per horizontal bounce) and another on the inner (one per vertical bounce) add up automatically. A white full-frame &lt;rect&gt; flashes briefly at the 35 s corner hit. Rendered in headless Chromium through &lt;img&gt;. Choose crossing times with a small common multiple to stage the corner hit, or unrelated ones to tease for ever. About 8 elements, 70 s loop.

**Do not copy / caveats.** Never use the DVD logo or letterforms: it was a licensed format trademark. Wikipedia reports the licensing body dissolved in January 2025, but I found nothing saying the mark is free to use, so assume it is not. A bouncing rectangle is generic. The stepped hue change uses a CSS filter on SVG groups, tested in Chromium only; switching the fill colour with an explicit keyframe list is the portable route. Keep the corner-hit flash soft and single. None of the sources I opened say who wrote the original player firmware routine or when it first appeared.

**References**

- [Wikipedia: definition, colour change on collision, corner hit estimates from 2 to 45 minutes, The Office, 2021 Google easter egg, 2022 Coinbase advert](<https://en.wikipedia.org/wiki/DVD_screensaver>)
- [Mental Floss (21 August 2023): the corner-hit arithmetic on an 800 x 600 screen (every 2 min 18 s with a 140-pixel logo, 45 min 54 s at 141 pixels), the 2019 livestream](<https://www.mentalfloss.com/technology/did-the-bouncing-dvd-logo-ever-hit-the-corner-of-the-screen>)
- [Wikipedia on the episode: season 4, aired 11 October 2007, written by Jennifer Celotta, directed by Ken Whittingham; origin of the cold open](<https://en.wikipedia.org/wiki/Launch_Party>)
- [Wikipedia: the DVD format and logo were licensed through the DVD Format and Logo Licensing Corporation, which dissolved on 31 January 2025](<https://en.wikipedia.org/wiki/DVD_Forum>)
- [Wikipedia on burn-in: savers that move around 'such as those on DVD players'](<https://en.wikipedia.org/wiki/Screen_burn-in>)

---

<a name="idle-10"></a>

## idle-10 · Off-air idle: colour bars, test card and the hopping 'no signal' box

**Animated SVG** · build: **Easy** · impact: **4/5** · 1951-present: RCA bars (1951), Philips PM5544 (designed 1966-67), SMPTE bars (standardised 1978); analogue snow and later 'no signal' boxes on TVs and monitors

What a screen shows when there is nothing to show. Broadcasters put up a test pattern at sign-on and sign-off, often with a 1 kHz tone; an untuned analogue set showed snow; modern sets show a plain blue screen or a small 'no signal' box that moves about to avoid burn-in. Wikipedia notes the Philips and SMPTE patterns became pop-culture symbols of the 1980s and 90s, printed on shirts and clocks.

**What it looks like**

- SMPTE bars: seven vertical bars at 75 percent intensity, left to right grey, yellow, cyan, green, magenta, red, blue
- Under them a short strip of 'castellations': blue, black, magenta, black, cyan, black, grey
- A bottom band with a dark blue block, a 100 percent white square, a purple block, then black with three barely different near-black stripes (the PLUGE)
- Philips PM5544: a large circle on a grid of 14 by 19 lines with a castellated black-and-white border, colour bars and a grey staircase inside the circle, and a black box inside the circle for station name, clock and date
- Analogue snow: random black-and-white dots (in Swedish 'war of the ants', in Japanese 'sand storm')
- A small rectangular 'no signal' message box on black or blue that jumps to a new position every few seconds

**Palette.** 75 percent bars: grey \#C0C0C0, yellow \#C0C000, cyan \#00C0C0, green \#00C000, magenta \#C000C0, red \#C00000, blue \#0000C0; near-black \#131313; dark blue and purple blocks for the -I and +Q patches (the hex values are my RGB approximations, not from the standard). No-signal box: white text on blue or black.

**Lettering.** Station identification in a plain caps sans or a character-generator font, inside a black box; clock digits in the same face. 'No signal' boxes use the TV's on-screen-display font: coarse monospace capitals.

**Motion.** Almost none, which is the point. The ident box hops to a new spot every 4 s (stepped, no easing); a clock can tick; snow flickers. Suggested loop 16 s.

**As a README header.** Full-width bars as the header with the project name and tagline in a black ident box laid over the middle, plus a small clock or version number. Variant: a black field with a hopping box reading the project name and one status line. The bars also make a good footer or section divider at 20 pixels tall. As plain text: a row of seven labelled blocks is weak; use the SVG.

**How to build it.** Prototyped at 1.7 KB: 7 bar rects, 7 castellation rects, 4 bottom-band rects, one group for the ident box moved by a steps(1) keyframe animation through four positions over 16 s. Renders in headless Chromium through &lt;img&gt;. The PM5544-style circle pattern is about 150 static elements and 8 to 12 KB. Snow is possible with feTurbulence and an animated seed but repaints the whole filter each frame; keep it to a small area or a brief burst. About 20 elements for the bars version.

**Do not copy / caveats.** The SMPTE bar arrangement is free to use (Wikipedia says CBS put it in the public domain without patents). Do not copy broadcaster test cards that contain artwork or photographs (the BBC's Test Card F is the obvious case) or any station's ident. The Philips pattern's rights status is not stated in the sources; draw a generic circle-and-grid card instead of tracing it. The colour values given are approximations. If the catalogue's VHS entry already uses bars as a tape leader, this entry should be the off-air / no-signal variant only.

**References**

- [Wikipedia: bar order, castellations, bottom band and PLUGE, Larky and Holmes at RCA (1951), SMPTE ECR 1-1978 by Hank Mahler at CBS, 2002 Emmy, CBS placing it in the public domain, the 1 kHz tone](<https://en.wikipedia.org/wiki/SMPTE_color_bars>)
- [Wikipedia on test cards: shown at sign-on and sign-off with tone or music, the named patterns, their afterlife as 1980s-90s pop-culture symbols](<https://en.wikipedia.org/wiki/Test_card>)
- [Wikipedia on the Philips PM5544: Finn Hendil, 1966-67, circle, grid, castellated border, station ID and clock inside the circle](<https://en.wikipedia.org/wiki/Philips_circle_pattern>)
- [Wikipedia on video noise: snow when no signal is received, replaced on modern sets by a solid (often blue) screen or a 'no signal' message](<https://en.wikipedia.org/wiki/Noise_(video)>)
- [muffinlabs on Atari 'attract mode' (Atari 400/800, 1979): colours rotate after about nine minutes idle, an early burn-in guard](<https://muffinlabs.com/screensavers/1-atari/>)

---

## Research notes

- Count: the computed task text asks for three different numbers (6 to 10, 6-9, and finally 2 to 5). I followed the specific brief for this gap and returned ten entries covering items (a) to (i), with (c) and (d) kept separate because the DOS palette-fire look and the MilkDrop mandala-with-overlay-text look differ on screen. If only five are wanted, my order would be: 3D Pipes, bouncing idle logo, Windows 3.1 set (Mystify), MilkDrop preset, After Dark module format.
- Item (e), Windows Media Player / iTunes bars and waves, is not an entry. Confirmed facts: Wikipedia says Bars and Waves dates from WMP 7, Battery from version 8 and Alchemy from version 9, and that Ambience, Particle, Plenoptic and Spikes were dropped in version 11; Wikipedia says G-Force (Andy O'Meara, SoundSpectrum) was licensed for iTunes and that iTunes added Magnetosphere by The Barbarian Group in 2008. But I could not open any source that describes the pictures concretely (the WMP visualisation wiki on Fandom returned HTTP 402, Microsoft's SDK page 404), and a plain bar spectrum plus scope is already covered by the catalogue's Winamp, Open Cubic Player and oscilloscope entries. Suggest treating it as a 'full-window Now Playing pane' variant of the Winamp entry, not a new style.
- Feasibility verdict on feedback (item c): true zoom-and-blur feedback cannot be done in a script-free SVG, because there is no frame buffer and a filter sees only the current frame. feTurbulence plus feDisplacementMap plus animated transforms gives a wobbling echo stack, not accumulation. The echo stack is a fair imitation and I built one; the entries say plainly that it is an imitation.
- Prototypes: I generated six test SVGs and rendered them through &lt;img&gt; tags in headless Edge (Chromium) to check they animate with no scripts. Measured sizes: bouncing logo 1.2 KB, Mystify 34 KB (80 lines, 320 SMIL animates), 3D Pipes 49 KB (156 segments, 40 s loop), feedback echo stack 61 KB, Atari Video Music diamonds 1 KB, colour bars 1.7 KB. Files are in C:\\Users\\luked\\AppData\\Local\\Temp\\claude\\D--python-README-NFO\\ceb24e23-4d50-4a3b-af92-9f302ce95521\\scratchpad\\savers (gen.py, \*.svg, index.html, shot1.png, shot2.png). Not tested: Firefox, Safari, GitHub's image proxy, phones. The Psychedelia, MilkDrop ring, 3D Maze and After Dark entries were not prototyped.
- Cross-browser risk to check before building: three prototypes change colour with a CSS hue-rotate filter animated on SVG groups. That worked in Chromium; I did not confirm it in Safari or Firefox. Animating fill or stroke colour with explicit keyframes is the safer default.
- Search limits: the WebSearch tool was already at its session cap (200 of 200) when I started, so I worked from direct fetches of known pages plus a handful of Brave HTML searches, which then rate-limited (HTTP 429). Coverage of Mystify, Marquee and WMP is thinner than I would like as a result.
- Unreachable sources: minotaurproject.co.uk Llamasoft lightsynth history (TLS error), Fandom wikis for Mystify and WMP visualisations (HTTP 402), web.archive.org and mashable.com (blocked by the fetch tool), boingboing.net (403), the Cthugha site at afn.org and the DVD FLLC site (DNS failure), jwz.org's XScreenSaver screenshot page (returned only the word PRIVATE; I used the GitHub mirror's config files instead). Wikipedia has no article on 3D Pipes; its story rests on Raymond Chen's two posts, The Register and the remake's README.
- Date conflicts found: Wikipedia's Virtual Light Machine article says it was created in 1990, the Jeff Minter article dates VLM-1 to the 1994 Jaguar CD. Trip-a-Tron is 1987 in the Psychedelia article and 1988 in the Minter article. The muffinlabs essay says 'Windows 3.11, released in 1992'; Windows 3.1 is the 1992 release. The Mental Floss piece dates the DVD-logo livestream to 2019, Wikipedia cites a December 2018 article about it.
- Trademark summary for the family. Must not be copied: the DVD logo, the flying toasters (litigated twice; avoid winged appliances entirely), the After Dark name and module artwork, the Windows flag and Microsoft's maze textures, the OpenGL logo, the Atari name and logo, Llamasoft's llama, real MilkDrop preset names, broadcaster test cards with artwork. Freely reusable: bouncing rectangles, right-angle pipes on a grid, starfields, bouncing polylines with trails, scrolling marquee text, bar spectra, mirrored seed trails, waveform rings, diagonal sprite fields, and the SMPTE bar arrangement (Wikipedia says CBS placed it in the public domain).
- Accessibility: several originals in this family strobe. None of the proposed SVGs needs a flash faster than about two per second; the corner-hit flash should be single and soft, and each file should carry a prefers-reduced-motion rule that freezes on a finished frame (untested inside GitHub's &lt;img&gt; rendering).
