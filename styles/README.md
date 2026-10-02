# Style catalogue

152 retro styles that could become a GitHub README header, in 13 families. Researched on 2026-09-30 from Pouet, Demozoo, 16colo.rs, asciiarena, textfiles.com, Wikipedia and the artists' and tools' own pages.

- [INDEX.md](INDEX.md): every style in one table, with medium, build difficulty and impact.
- One page per family (below): each style with what it looks like, palette, lettering, motion, how it becomes a README header, how to build it, what must not be copied, and links to the references.
- [styles.json](styles.json): the same data, for the tool to read. `node tools/build-styles.mjs` rebuilds the pages from it.

The six styles built before this research (scene NFO, Amiga cracktro, keygen dialog, C64 loader, CRT terminal, ANSI BBS) are in [../examples](../examples), and nothing here repeats them. Since then, every one of the 152 distinct styles here has been built as a header: 36 for ULTRA-SATISFACTORY ([../examples/ultra-satisfactory](../examples/ultra-satisfactory)) and the other 116 for Castaway ([../examples/castaway](../examples/castaway)). Each set's index links every header to its style entry.

## The four things you asked for

### "Where's the Razor 1911 one"

There isn't one Razor 1911 cracktro look. Their logo and effects changed almost every release across 40 years. The one thing that stayed the same is the NFO: the same brush-script logo, signed by JED of ACiD, opens their NFOs from 1994 to 2023. So "the Razor one" is seven styles:

| ID | Style | Years |
| --- | --- | --- |
| [nfo-01](nfo.md#nfo-01) | Brush-script block logo NFO (also Fairlight's look) | 1992 to now |
| [c64-05](c64.md#c64-05) | Amiga cracktro: logo plate, deep-blue panel, rainbow wavy text | 1990-91 |
| [pc-01](pc.md#pc-01) | DOS cracktro: flat colour field, pixel logo, centred presents-text | 1996-98 |
| [pc-12](pc.md#pc-12) | Neon cube field with scanlines | 2010-12 |
| [pc-03](pc.md#pc-03) | Chrome spheres over a checkerboard | 2016 |
| [pc-07](pc.md#pc-07) | Text-mode poster installer: giant block letters in two flat colours | 2024-26 |
| [pc-11](pc.md#pc-11) | BIOS setup screen that starts misbehaving | 2025 |

A header can be drawn in any of these manners. It must not use the Razor 1911 name, numerals, logos or slogans as its own.

### "Or chiptune ones"

A README can't play sound, so these are what chip music looks like.

| ID | Style |
| --- | --- |
| [trk-01](trk.md#trk-01) | ProTracker: grey embossed panel over four black pattern windows |
| [trk-04](trk.md#trk-04) | DOS text-mode trackers: Scream Tracker gold, Impulse Tracker tan |
| [trk-05](trk.md#trk-05) | LSDj, the Game Boy tracker |
| [trk-08](trk.md#trk-08) | Open Cubic Player with a text-mode spectrum analyser |
| [trk-09](trk.md#trk-09) | One oscilloscope per channel |
| [trk-11](trk.md#trk-11) | Winamp's three-window stack |
| [asia-01](asia.md#asia-01) | Japanese FM-synth display: one piano keyboard per channel |
| [print-02](print.md#print-02) | Netlabel cassette with turning reels and a J-card track list |

All eleven tracker and player styles are in [trk.md](trk.md).

### "Other epic NFO ascii artist ones"

| ID | School | Named artists and groups |
| --- | --- | --- |
| [nfo-01](nfo.md#nfo-01) | PC brush-script block logo | JED of ACiD |
| [nfo-02](nfo.md#nfo-02) | PC shaded block logo with fades and debris | Superior Art Creations: Roy, Hetero, cH, Ferrex, nerv |
| [nfo-03](nfo.md#nfo-03) | Poster NFO: a full-canvas shaded painting with the text set inside | ISO-era release groups |
| [nfo-06](nfo.md#nfo-06) | Amiga description logos: compact Topaz outline | Rotox, Enforcer, Rat, Skin |
| [nfo-07](nfo.md#nfo-07) | Amiga colly era: full-width logos and page layout | Desoto, Stylez, Skin; Arclite, DeZign, Low Profile |
| [nfo-08](nfo.md#nfo-08) | PC newschool: dollar-sign blob lettering | Remorse 1981 |
| [ansi-01](ansi.md#ansi-01) | ANSI logo colly: gradient block letters between cut lines | ACiD, iCE, Blocktronics |
| [ansi-03](ansi.md#ansi-03) | Illustrated ANSI: toon mascots and comic-book scrollers | Toon Goon of iCE, Blocktronics |

Block-character art shows gaps between rows in GitHub's text blocks, so the shaded schools are best drawn as SVG from the character grid. The slash-and-underscore Amiga schools survive as plain text.

### "Where is the vapour wave"

| ID | Style |
| --- | --- |
| [vap-01](vap.md#vap-01) | Classic vaporwave: pink ground, checker floor, statue, Japanese subtitle, a Windows 95 window |
| [vap-02](vap.md#vap-02) | Fullwidth text header: vaporwave as plain text |
| [vap-03](vap.md#vap-03) | Worn VHS tape: PLAY overlay, tracking band, colour bleed |
| [vap-04](vap.md#vap-04) | Signalwave: the 1990s weather-forecast screen |
| [vap-05](vap.md#vap-05) | Synthwave / outrun: sunset and laser grid. A different thing from vaporwave, and the most overused header on GitHub |
| [vap-07](vap.md#vap-07) | Windows 95 desktop: setup wizard, error cascade or a Defrag map |
| [vap-11](vap.md#vap-11) | Classic 1-bit Mac desktop |
| [vap-12](vap.md#vap-12) | Geocities homepage with clickable 88x31 buttons |

Styles that depend on a photo or a 3D render (marble busts, mall interiors, anime stills) translate poorly to SVG. Styles made of interface chrome, grids and type translate well.

## Highest impact

The researchers rated these 5 out of 5.

| ID | Style | Build |
| --- | --- | --- |
| [pc-03](pc.md#pc-03) | Chrome spheres over a checkerboard | Medium |
| [c64-11](c64.md#c64-11) | Spaceballs "State of the Art": silhouette cut out of moire rings | Medium |
| [trk-01](trk.md#trk-01) | ProTracker editor screen | Medium |
| [nfo-02](nfo.md#nfo-02) | Shaded block NFO logo with fades and debris | Medium |
| [nfo-03](nfo.md#nfo-03) | Poster NFO | Hard |
| [ansi-03](ansi.md#ansi-03) | Illustrated ANSI | Hard |
| [ansi-08](ansi.md#ansi-08) | Teletext page with mosaic graphics | Medium |
| [vap-07](vap.md#vap-07) | Windows 95 desktop | Easy |
| [mach-10](mach.md#mach-10) | Vector arcade and XY oscilloscope: beam-drawn glowing lines | Medium |
| [mach-11](mach.md#mach-11) | Pinball dot-matrix display | Medium |
| [hack-13](hack.md#hack-13) | War-room big board: vector world map, tracks and counters | Medium |
| [hack-16](hack.md#hack-16) | 3D file-system landscape | Medium |
| [asia-01](asia.md#asia-01) | FM-synth status display | Medium |
| [asia-02](asia.md#asia-02) | PC-98 visual-novel screen | Medium |
| [idle-06](idle.md#idle-06) | 3D Pipes screensaver | Medium |
| [print-02](print.md#print-02) | Netlabel cassette | Easy |

## Families

| Family | Styles | Second check |
| --- | --- | --- |
| [PC cracktros and keygen intros](pc.md) | 14 | Yes |
| [C64, Amiga and Atari ST](c64.md) | 14 | Yes |
| [Trackers and chiptune visuals](trk.md) | 11 | Yes |
| [NFO and ASCII art schools](nfo.md) | 11 | Yes |
| [ANSI art, BBS and text-mode](ansi.md) | 12 | Yes |
| [Vaporwave and internet-era aesthetics](vap.md) | 18 | Yes |
| [Retro machine, console and arcade screens](mach.md) | 15 | Yes |
| [Hacker, phreak and zine culture](hack.md) | 18 | Yes |
| [Japan and East Asia](asia.md) | 7 | No |
| [Screensavers, idle screens and visualisers](idle.md) | 10 | No |
| [How the files moved](xfer.md) | 10 | No |
| [The demoscene proper](demo.md) | 11 | No |
| [Physical media and print ephemera](print.md) | 5 | No |

That is 156 entries. Four are the same style researched twice (Teletext, PETSCII, Winamp, the blue error screen), which leaves 152 distinct styles. The duplicates are marked on their pages.

## How far to trust this

- **Second check.** The first eight families were each researched by one agent and then checked by a second, who opened the reference links and made 254 corrections in total. The last five families were added in a gap-filling pass and were not checked by a second reviewer.
- **Search ran out.** The session's web-search allowance was used up part-way through. Later work used direct page fetches only, so discovery of specialist write-ups was limited.
- **Unreachable sources.** Defacto2, the main archive of release NFOs and cracktros, blocked automated access throughout, so nothing rests on it. Other unreachable sites are listed in each family's research notes.
- **Seen, not watched.** Most visual descriptions come from one screenshot per production. Motion is inferred from comments and effect names. The film interfaces rest on written descriptions.
- **Colours.** Hex values were read off screenshots or are community conventions, unless the entry says they are documented.
- **Build notes.** Where an SVG technique is called tested, it was tested in Chromium only.
- **Voice.** Each family page opens with its reviewer's own summary, written in the first person.

## Rules for using a style

- Real groups and artists are credited references, not identities to borrow. Every entry says what must not be copied: names, logos, wordmarks, letterforms, slogans.
- The general technique or effect is free to reuse: a plasma, a checker floor, shaded block lettering, a tracker grid.
- No artwork is reproduced in this catalogue. It describes styles in words and links to examples.

## Treatments, not styles

Five entries are effects to lay over another style, not headers in their own right: glitch ([vap-16](vap.md#vap-16)), worn VHS ([vap-03](vap.md#vap-03)), the decrypt reveal ([hack-15](hack.md#hack-15)), digital rain ([hack-14](hack.md#hack-14)) and the modem-speed ANSI draw-in ([ansi-04](ansi.md#ansi-04)). The other overlaps and shared building blocks are listed at the end of [INDEX.md](INDEX.md).
