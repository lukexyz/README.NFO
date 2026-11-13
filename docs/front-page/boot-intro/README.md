<!-- README.NFO header: start -->
<p align="center"><a href="#-press-start"><picture>
<source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg">
<source media="(prefers-color-scheme: light)" srcset="assets/hero-light.svg">
<img src="assets/hero-light.svg" width="100%" alt="README.NFO intro screen: a chrome README.NFO logo over a starfield. An engine field switches between Claude Code and Codex, a facts field reads your folder, PRESS SPACE blinks, and a sine-wave scroller runs along the bottom.">
</picture></a></p>
<!-- README.NFO header: end -->
<p align="center"><sub>Hero drawn in styles <a href="../../../styles/c64.md#c64-12">c64-12</a> and <a href="../../../styles/c64.md#c64-02">c64-02</a> by <a href="src/hero.mjs">a seeded Node script</a>.</sub></p>

<h1 align="center">Retro headers for your README</h1>

<p align="center">README.NFO draws ten one-off retro headers for your project with <b>Claude Code</b> or <b>Codex</b>, numbers them, and puts the one you pick at the top of your README.</p>

<p align="center">
<a href="https://claude.com/claude-code"><img src="assets/engine-claude.svg" width="260" alt="Sign in to Claude Code"></a>
<a href="https://developers.openai.com/codex"><img src="assets/engine-codex.svg" width="260" alt="Or sign in to Codex"></a>
</p>

<p align="center"><a href="#-press-start"><b>► Press start</b></a> · <a href="#-numbered-every-batch">Numbered, every batch</a> · <a href="#-intro-select">Intro select</a> · <a href="#-release-info">Release info</a></p>

<p align="center"><img src="assets/bar-1.svg" width="100%" height="8" alt=""></p>

## ► Press start

```sh
npx readme-nfo
```

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. In your project's folder, run the line above.
3. A gallery opens with 10 numbered headers. Type the number you like
   and it goes at the top of your README. Review with `git diff`, then commit.

**Claude or Codex?** It uses whichever one you're signed in to, and asks once
if you have both. To choose: `npx readme-nfo --claude` or `npx readme-nfo --codex`.

**Private repos work.** It reads your project folder, not GitHub, so there's no
token to set. Your project facts go only to the agent you picked.

**No flags needed.** The defaults are good.

<sub>Needs Node.js 22+. One header took 74 s on Claude Sonnet and 2 min 31 s on Codex in our tests; ten take a few minutes, 3 at a time.</sub>

<p align="center"><img src="assets/bar-2.svg" width="100%" height="8" alt=""></p>

## ► Numbered, every batch

<p align="center"><img src="assets/flow.svg" width="100%" alt="One gallery page: batch 1 fills with headers 01 to 10, header 03 is picked and lands at the top of a README, then batch 2 adds 11 to 20 on the same page."></p>

**Want more?** `npx readme-nfo more` gives 10 new styles, numbered 11-20, on the
same gallery page. No style repeats. `npx readme-nfo use 14` swaps your header.

```text
DISK 1 ... npx readme-nfo
           headers 01-10
PICK ..... npx readme-nfo use 3
           #3 goes in README
DISK 2 ... npx readme-nfo more
           headers 11-20
```

> [!TIP]
> Or just ask your agent: *"Get me 10 headers from README.NFO"*, then
> *"number 3"*, or *"make 10 more"*.

- **One gallery page holds every batch.** Numbers keep counting (21-30, 31-40 and on) and styles never repeat.
- **It never commits.** `use 3` writes `.github/readme-nfo/header.svg`, `.github/readme-nfo/LICENSE` and one marked block at the top of README.md. Review with `git diff`, then commit.
- **Undo:** delete the block and the `.github/readme-nfo/` folder.

<details><summary><b>What a run looks like</b></summary>

```text
$ npx readme-nfo
FACTS  read from this folder
AGENT  Claude Code
       (switch: --codex)
DRAW   10 of 153 styles,
       3 at a time
OPEN   gallery, fills 01-10
01 ok  02 ok  03 ok  04 ok
05 ok  06 ok  07 ok  08 ok
09 ok  10 ok
Install which header? [1-10] 3
WROTE  .github/readme-nfo/
       header.svg
EDIT   README.md
Review with git diff, then
commit.
```

</details>

<details><summary><b>What lands in your README</b></summary>

```html
<!-- README.NFO header: start -->
<p align="center"><img
src=".github/readme-nfo/header.svg"
width="100%" alt="my-app header">
</p>
<!-- README.NFO header: end -->
```

`npx readme-nfo use 7` replaces it with header 07. Batches stay in `readme-headers/`, which is kept out of git.

</details>

<details><summary><b>Options</b></summary>

- `--claude` or `--codex`: choose the agent
- `-6`: six headers instead of ten
- `more`: ten new styles, numbered on from the last batch
- `use N`: install header N
- `--model NAME`: choose the agent's model
- `--jobs N`: headers drawn at once (default 3)
- `--resume DIR`: finish a batch that stopped
- `--out DIR`: save the batch somewhere else
- `--no-open`: don't open the gallery
- **Not cloned?** `npx readme-nfo github.com/you/project` reads it from GitHub instead. For a private one it uses your `gh` sign-in.

</details>

<details><summary><b>No agent found, or something failed?</b></summary>

- **No agent found?** Sign in to one, then run `npx readme-nfo` again: start `claude` and log in, or run `codex login`.
- **Chose one that isn't signed in?** `--claude` and `--codex` stop before writing anything and print how to sign in.
- **A header failed?** It gets one retry. If it fails again it is skipped and the rest of the batch carries on.

</details>

<p align="center"><img src="assets/bar-3.svg" width="100%" height="8" alt=""></p>

## ► Intro select

<p align="center"><b>51 headers from 6 projects, all 13 style families.</b><br>Each was drawn for a real project. Click one for its page and source.</p>

<p align="center">
<a href="../../../examples/castaway/57-synthwave-outrun_opus_5.5.md"><img src="../../../examples/castaway/assets/57-synthwave-outrun_opus_5.5.svg" width="437" alt="01 Castaway: sunset road (animated)"></a>
<a href="../../../examples/ultra-satisfactory/42-aero-gloss_opus_5.5.md"><img src="../../../examples/ultra-satisfactory/assets/42-aero-gloss_opus_5.5.svg" width="367" alt="02 ULTRA-SATISFACTORY: aero gloss (animated)"></a>
<br><sub>01 sunset road <i>(Castaway)</i> &nbsp;·&nbsp; 02 aero gloss <i>(ULTRA-SATISFACTORY)</i></sub>
</p>

<p align="center">
<a href="../../../examples/castaway/01-mode7-island_opus_5.5.md"><img src="../../../examples/castaway/assets/01-mode7-island_opus_5.5.svg" width="402" alt="03 Castaway: mode 7 island (animated)"></a>
<a href="../../../examples/castaway/14-off-air_opus_5.5.md"><img src="../../../examples/castaway/assets/14-off-air_opus_5.5.svg" width="402" alt="04 Castaway: off-air test card (animated)"></a>
<br><sub>03 mode 7 island <i>(Castaway)</i> &nbsp;·&nbsp; 04 off-air test card <i>(Castaway)</i></sub>
</p>

<p align="center">
<a href="../../../examples/castaway/65-memphis_opus_5.5.md"><img src="../../../examples/castaway/assets/65-memphis_opus_5.5.svg" width="402" alt="05 Castaway: memphis poster (animated)"></a>
<a href="../../../examples/ultra-satisfactory/12-cassette-jcard_opus_5.5.md"><img src="../../../examples/ultra-satisfactory/assets/12-cassette-jcard_opus_5.5.svg" width="402" alt="06 ULTRA-SATISFACTORY: cassette J-card (animated)"></a>
<br><sub>05 memphis poster <i>(Castaway)</i> &nbsp;·&nbsp; 06 cassette J-card <i>(ULTRA-SATISFACTORY)</i></sub>
</p>

<p align="center"><b>Same style, three projects.</b> One off-air brief, drawn three times.</p>

<p align="center">
<a href="../../../examples/naturalis-historia/01-off-air.md"><img src="../../../examples/naturalis-historia/assets/01-off-air.svg" width="270" alt="Off-air test card header for Naturalis Historia (animated)"></a>
<a href="../../../examples/gl4ss/01-off-air.md"><img src="../../../examples/gl4ss/assets/01-off-air.svg" width="270" alt="Off-air test card header for GL4SS (animated)"></a>
<a href="../../../examples/st3gg/01-off-air.md"><img src="../../../examples/st3gg/assets/01-off-air.svg" width="270" alt="Off-air test card header for ST3GG (animated)"></a>
<br><sub>Naturalis Historia &nbsp;·&nbsp; GL4SS &nbsp;·&nbsp; ST3GG</sub>
</p>

<p align="center"><b>The wall: 07 to 46.</b> <sub>► marks an animated original.</sub></p>

<p align="center">
<a href="../../../examples/heretic/21-pc-11.md"><img src="assets/thumbs/07.jpg" width="150" height="84" alt="07 Heretic: BIOS gone wrong"></a>
<a href="../../../examples/castaway/03-desktop-takeover_opus_5.5.md"><img src="assets/thumbs/08.jpg" width="150" height="84" alt="08 Castaway: hijacked desktop (animated)"></a>
<a href="../../../examples/castaway/30-petscii-picture_opus_5.5.md"><img src="assets/thumbs/09.jpg" width="150" height="84" alt="09 Castaway: PETSCII picture (animated)"></a>
<a href="../../../examples/heretic/33-c64-14.md"><img src="assets/thumbs/10.jpg" width="150" height="84" alt="10 Heretic: chip jukebox"></a>
<a href="../../../examples/heretic/28-c64-08.md"><img src="assets/thumbs/11.jpg" width="150" height="84" alt="11 Heretic: bob chain (animated)"></a>
<a href="../../../examples/castaway/42-multi-chip-tracker_opus_5.5.md"><img src="assets/thumbs/12.jpg" width="150" height="84" alt="12 Castaway: multi-chip tracker (animated)"></a>
<a href="../../../examples/heretic/22-trk-03.md"><img src="assets/thumbs/13.jpg" width="150" height="84" alt="13 Heretic: teal tracker desk"></a>
<a href="../../../examples/castaway/44-amiga-description-logo_opus_5.5.md"><img src="assets/thumbs/14.jpg" width="150" height="84" alt="14 Castaway: outline logo NFO (animated)"></a>
<a href="../../../examples/heretic/03-nfo-02.md"><img src="assets/thumbs/15.jpg" width="150" height="84" alt="15 Heretic: shaded slab NFO"></a>
<a href="../../../examples/castaway/52-teletext-page_opus_5.5.md"><img src="assets/thumbs/16.jpg" width="150" height="84" alt="16 Castaway: teletext page (animated)"></a>
</p>
<p align="center"><sub>07 BIOS gone wrong · 08 hijacked desktop · 09 PETSCII picture · 10 chip jukebox · 11 bob chain · 12 multi-chip tracker · 13 teal tracker desk · 14 outline logo NFO · 15 shaded slab NFO · 16 teletext page</sub></p>

<p align="center">
<a href="../../../examples/castaway/50-door-game-screen_opus_5.5.md"><img src="assets/thumbs/17.jpg" width="150" height="84" alt="17 Castaway: door game screen (animated)"></a>
<a href="../../../examples/heretic/17-ansi-04.md"><img src="assets/thumbs/18.jpg" width="150" height="84" alt="18 Heretic: ANSI stage (animated)"></a>
<a href="../../../examples/gl4ss/04-viewdata.md"><img src="assets/thumbs/19.jpg" width="150" height="84" alt="19 GL4SS: viewdata terminal (animated)"></a>
<a href="../../../examples/castaway/58-city-pop-sleeve_opus_5.5.md"><img src="assets/thumbs/20.jpg" width="150" height="84" alt="20 Castaway: city-pop sleeve (animated)"></a>
<a href="../../../examples/gl4ss/05-luna-desktop.md"><img src="assets/thumbs/21.jpg" width="150" height="84" alt="21 GL4SS: glossy desktop (animated)"></a>
<a href="../../../examples/ultra-satisfactory/26-vaporwave_opus_5.5.md"><img src="assets/thumbs/22.jpg" width="150" height="84" alt="22 ULTRA-SATISFACTORY: marble collage (animated)"></a>
<a href="../../../examples/ultra-satisfactory/27-signalwave-forecast_opus_5.5.md"><img src="assets/thumbs/23.jpg" width="150" height="84" alt="23 ULTRA-SATISFACTORY: cable forecast (animated)"></a>
<a href="../../../examples/castaway/60-one-bit-desktop_opus_5.5.md"><img src="assets/thumbs/24.jpg" width="150" height="84" alt="24 Castaway: 1-bit desktop (animated)"></a>
<a href="../../../examples/castaway/09-pinball-dmd_opus_5.5.md"><img src="assets/thumbs/25.jpg" width="150" height="84" alt="25 Castaway: pinball display (animated)"></a>
<a href="../../../examples/ultra-satisfactory/10-arcade-attract_opus_5.5.md"><img src="assets/thumbs/26.jpg" width="150" height="84" alt="26 ULTRA-SATISFACTORY: arcade attract (animated)"></a>
</p>
<p align="center"><sub>17 door game screen · 18 ANSI stage · 19 viewdata terminal · 20 city-pop sleeve · 21 glossy desktop · 22 marble collage · 23 cable forecast · 24 1-bit desktop · 25 pinball display · 26 arcade attract</sub></p>

<p align="center">
<a href="../../../examples/ultra-satisfactory/40-power-on-self-test_opus_5.5.md"><img src="assets/thumbs/27.jpg" width="150" height="84" alt="27 ULTRA-SATISFACTORY: power-on self test (animated)"></a>
<a href="../../../examples/heretic/16-mach-09.md"><img src="assets/thumbs/28.jpg" width="150" height="84" alt="28 Heretic: console title card"></a>
<a href="../../../examples/heretic/12-mach-07.md"><img src="assets/thumbs/29.jpg" width="150" height="84" alt="29 Heretic: LCD boot plate"></a>
<a href="../../../examples/castaway/87-file-system-landscape_opus_5.5.md"><img src="assets/thumbs/30.jpg" width="150" height="84" alt="30 Castaway: file-system city (animated)"></a>
<a href="../../../examples/castaway/78-fetch-card_opus_5.5.md"><img src="assets/thumbs/31.jpg" width="150" height="84" alt="31 Castaway: fetch card (animated)"></a>
<a href="../../../examples/heretic/18-hack-10.md"><img src="assets/thumbs/32.jpg" width="150" height="84" alt="32 Heretic: DOS host screen (animated)"></a>
<a href="../../../examples/castaway/90-pc-98-adventure-screen_opus_5.5.md"><img src="assets/thumbs/33.jpg" width="150" height="84" alt="33 Castaway: PC-98 adventure (animated)"></a>
<a href="../../../examples/castaway/05-shiftjis-aa_opus_5.5.md"><img src="assets/thumbs/34.jpg" width="150" height="84" alt="34 Castaway: Shift-JIS text art (animated)"></a>
<a href="../../../examples/st3gg/02-telnet-board.md"><img src="assets/thumbs/35.jpg" width="150" height="84" alt="35 ST3GG: telnet board (animated)"></a>
<a href="../../../examples/castaway/98-3d-pipes_opus_5.5.md"><img src="assets/thumbs/36.jpg" width="150" height="84" alt="36 Castaway: 3D pipes (animated)"></a>
</p>
<p align="center"><sub>27 power-on self test · 28 console title card · 29 LCD boot plate · 30 file-system city · 31 fetch card · 32 DOS host screen · 33 PC-98 adventure · 34 Shift-JIS text art · 35 telnet board · 36 3D pipes</sub></p>

<p align="center">
<a href="../../../examples/heretic/02-idle-02.md"><img src="assets/thumbs/37.jpg" width="150" height="84" alt="37 Heretic: light synth (animated)"></a>
<a href="../../../examples/heretic/14-idle-07.md"><img src="assets/thumbs/38.jpg" width="150" height="84" alt="38 Heretic: brick maze"></a>
<a href="../../../examples/ultra-satisfactory/33-sysop-dashboard_opus_5.5.md"><img src="assets/thumbs/39.jpg" width="150" height="84" alt="39 ULTRA-SATISFACTORY: sysop dashboard (animated)"></a>
<a href="../../../examples/ultra-satisfactory/35-terminal-session_opus_5.5.md"><img src="assets/thumbs/40.jpg" width="150" height="84" alt="40 ULTRA-SATISFACTORY: terminal session (animated)"></a>
<a href="../../../examples/castaway/110-256-byte-intro_opus_5.5.md"><img src="assets/thumbs/41.jpg" width="150" height="84" alt="41 Castaway: 256-byte intro (animated)"></a>
<a href="../../../examples/naturalis-historia/03-demo-titles.md"><img src="assets/thumbs/42.jpg" width="150" height="84" alt="42 Naturalis Historia: demo titles (animated)"></a>
<a href="../../../examples/ultra-satisfactory/41-attribute-grid-demo_opus_5.5.md"><img src="assets/thumbs/43.jpg" width="150" height="84" alt="43 ULTRA-SATISFACTORY: attribute grid (animated)"></a>
<a href="../../../examples/heretic/15-demo-10.md"><img src="assets/thumbs/44.jpg" width="150" height="84" alt="44 Heretic: brick-pixel study"></a>
<a href="../../../examples/castaway/08-tractor-feed_opus_5.5.md"><img src="assets/thumbs/45.jpg" width="150" height="84" alt="45 Castaway: green-bar paper (animated)"></a>
<a href="../../../examples/ultra-satisfactory/31-type-in-listing_opus_5.5.md"><img src="assets/thumbs/46.jpg" width="150" height="84" alt="46 ULTRA-SATISFACTORY: type-in listing (animated)"></a>
</p>
<p align="center"><sub>37 light synth · 38 brick maze · 39 sysop dashboard · 40 terminal session · 41 256-byte intro · 42 demo titles · 43 attribute grid · 44 brick-pixel study · 45 green-bar paper · 46 type-in listing</sub></p>

<details><summary><b>Intro index</b>: what each number is</summary>

```text
▄▄ FEATURED ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
01 sunset road ......... vap-05
02 aero gloss .......... vap-10
03 mode 7 island ...... mach-15
04 off-air test card .. idle-10
05 memphis poster ...... vap-17
06 cassette J-card ... print-02
▄▄ PC INTROS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
07 BIOS gone wrong ...... pc-11
08 hijacked desktop ..... pc-10
▄▄ 8-BIT AND 16-BIT ▄▄▄▄▄▄▄▄▄▄▄
09 PETSCII picture ..... c64-03
10 chip jukebox ........ c64-14
11 bob chain ........... c64-08
▄▄ TRACKERS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
12 multi-chip tracker .. trk-07
13 teal tracker desk ... trk-03
▄▄ NFO AND ASCII ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
14 outline logo NFO .... nfo-06
15 shaded slab NFO ..... nfo-02
▄▄ ANSI AND TEXT MODE ▄▄▄▄▄▄▄▄▄
16 teletext page ...... ansi-08
17 door game screen ... ansi-06
18 ANSI stage ......... ansi-04
19 viewdata terminal .. ansi-09
▄▄ INTERNET ERA ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
20 city-pop sleeve ..... vap-06
21 glossy desktop ...... vap-09
22 marble collage ...... vap-01
23 cable forecast ...... vap-04
24 1-bit desktop ....... vap-11
▄▄ MACHINES ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
25 pinball display .... mach-11
26 arcade attract ..... mach-08
27 power-on self test . mach-04
28 console title card . mach-09
29 LCD boot plate ..... mach-07
▄▄ HACKER AND ZINE ▄▄▄▄▄▄▄▄▄▄▄▄
30 file-system city ... hack-16
31 fetch card ......... hack-06
32 DOS host screen .... hack-10
▄▄ JAPAN AND EAST ASIA ▄▄▄▄▄▄▄▄
33 PC-98 adventure .... asia-02
34 Shift-JIS text art . asia-04
35 telnet board ....... asia-03
▄▄ SCREENSAVERS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
36 3D pipes ........... idle-06
37 light synth ........ idle-02
38 brick maze ......... idle-07
▄▄ HOW FILES MOVED ▄▄▄▄▄▄▄▄▄▄▄▄
39 sysop dashboard .... xfer-08
40 terminal session ... xfer-05
▄▄ DEMOSCENE ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
41 256-byte intro ..... demo-04
42 demo titles ........ demo-01
43 attribute grid ..... demo-08
44 brick-pixel study .. demo-10
▄▄ PRINT ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
45 green-bar paper ... print-04
46 type-in listing ... print-03
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

</details>

**Disk 2: plain text.** 59 of the 153 styles can be drawn as text art you paste straight in, like the [newschool logo](../../../examples/castaway/45-newschool-ascii_opus_5.5.md) and the [outline-letter NFO](../../../examples/heretic/36-nfo-04.md).

<p align="center"><a href="../../../examples/README.md"><b>All 260 headers in 8 galleries</b></a> · <a href="../../../styles/INDEX.md"><b>All 153 styles</b></a></p>

<p align="center"><img src="assets/bar-4.svg" width="100%" height="8" alt=""></p>

## ► Release info

```text
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  R E A D M E . N F O
  retro headers for your README
───────────────────────────────
 STYLES .... 153 in 13 families
 SHOWCASE .. 260 in 8 galleries
 ENGINES ... Claude Code
             Codex
 FACTS ..... your folder
 NEEDS ..... Node.js 22+
 LICENCE ... MIT
───────────────────────────────
 THANKS .... 16colo.rs · Pouet
             Demozoo
             textfiles.com
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀[ EOF ]
```

<p align="center"><a href="../../generation.md">How it works</a> · <a href="../../../styles/INDEX.md">Style catalogue</a> · <a href="../../../examples/README.md">Galleries</a> · <a href="https://github.com/lukexyz/README.NFO/issues">Issues</a> · <a href="../../../LICENSE">MIT licence</a></p>

<p align="center"><sub>Scene styling here is homage: no real group names, logos or lettering, and all the art is original.<br>The showcase headers came from long Claude Opus runs; CLI output is quicker and simpler.</sub></p>
