// Builds the Castaway header gallery: examples/castaway/README.md is the index of every header,
// and the headers themselves are stitched onto pages of twenty (page-1.md, page-2.md, ...),
// because all of them on one page would be too large for GitHub to render.
//   node examples/castaway/src/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');
const PER_PAGE = 20;
// [slug, name, one-line description, catalogue style id]
// 01 to 20: styles drawn at random from ../../styles
const OPTIONS = [
["01-mode7-island_opus_5.5", "Mode 7 Island", "Animated SVG: a 256x144 early-90s rotating-floor title screen where one island map, redrawn in 48 depth-scaled strips, swings round a palm while she sips a coconut, a ship slips behind her head, and CASTAWAY is painted in the sand.", "mach-15"],
  ["02-bbs-stats_opus_5.5", "BBS Data Screens", "Animated SVG: Castaway as a 1990s BBS post-login screen, with a gradient logo, stats strip, a lightbar stepping through the island's visitors as last callers, hotkeys, a half-block island, and a ruled file-area table and FILE_ID.DIZ.", "ansi-05"],
  ["03-desktop-takeover_opus_5.5", "Fake Desktop Takeover", "Animated SVG: a period teal desktop with a castaway wallpaper and one dialog that an island takes over, where a ship sails past while she sips a coconut, with the gags, schedule and sound in pop-up dialog boxes below.", "pc-10"],
  ["04-fullwidth_opus_5.5", "Fullwidth Text", "Pure text: a vaporwave record sleeve in a pre block, with the name in fullwidth capitals and a Japanese subtitle beside a half-block palm, a shade-block sea, and the schedule set as a track list with real durations.", "vap-02"],
  ["05-shiftjis-aa_opus_5.5", "Shift_JIS AA", "Animated SVG: a 2channel-style thread with original Shift_JIS line art. CASTAWAY is spelled in the kanji 島, a girl in headphones sips a coconut under a palm, and a ship hoots past unnoticed.", "asia-04"],
  ["06-rfc-manpage_opus_5.5", "RFC / Man Page", "Pure text: a paginated 72-column RFC memo (Request for Calm 1992) plus a CASTAWAY(1) man page. Its tables, charts and diagrams are built from the real schedule's seed-1992 run.", "hack-03"],
  ["07-7bit-outline-nfo_opus_5.5", "7-bit Outline NFO", "Pure text: a 78-column 7-bit outline NFO with a slanted slash-and-underscore CASTAWAY logo, an ASCII island where a ship passes unseen, dot-leader fact rows and notched sections in details blocks.", "nfo-04"],
  ["08-tractor-feed_opus_5.5", "Tractor-Feed Printout", "Animated SVG: a nine-pin printer feeding green-bar tractor paper, printing a CASTAWAY banner page and an excerpt of the real schedule report beside a dot-matrix island picture, plus a static 80-column punched card with the run command.", "print-04"],
  ["09-pinball-dmd_opus_5.5", "Pinball Dot-Matrix Display", "Animated SVG: a 128x32 orange plasma pinball display by an invented maker. Its 60-second attract loop shows the title, the ship sailing past while she sips a coconut, a SHIP MISSED award, real schedule scores, gags and PRESS START.", "mach-11"],
  ["10-dir-art_opus_5.5", "C64 Directory Art", "Pure text: a Commodore 64 disk directory listing whose 0-block file names draw CASTAWAY, a palm island, a ship and her, with real project counts as block sizes, plus a blue-screen SVG twin.", "c64-04"],
  ["11-usenet-line-art_opus_5.5", "Usenet Line Art", "Pure text: a monochrome 7-bit ASCII Usenet post with a hand-drawn line-style picture of the island, palm, raft, turtle and an unseen passing ship, signed \"op\", plus folded follow-ups with nine more signed gag pictures and the facts.", "nfo-10"],
  ["12-bios-hijack_opus_5.5", "BIOS Setup Hijack", "Animated SVG: a navy 80x25 firmware setup screen whose menus are Castaway's real settings, until Save & Exit lets the island take over the panel, the divider becomes a palm, and a ship passes while she sips a coconut.", "pc-11"],
  ["13-bouncing-logo_opus_5.5", "Bouncing Idle Logo", "Animated SVG: a CASTAWAY wordmark with a palm-tree T bounces round a black 16:9 idle screen, changes colour at each bounce and hits a corner every 45 s, while a ship sails past unnoticed.", "idle-09"],
  ["14-off-air_opus_5.5", "Off-Air Idle", "Animated SVG: a 33-second off-air loop on an invented station, a circle test card whose picture is the island and the signal-hunt gag, then SMPTE colour bars with a hopping ident box, snow and a NO SIGNAL box.", "idle-10"],
  ["15-kefrens-bars_opus_5.5", "Vertical Copper Bars", "Animated SVG: Amiga-style vertical copper bars in sea, sun and coral braid behind CASTAWAY in sandcastle-brick capitals, with her nodding to the beat in the crook of the Y and a giant scroller of the gags.", "c64-07"],
  ["16-tfile_opus_5.5", "BBS T-File", "Pure text: a 78-column BBS t-file in the cDc tradition, with a slash-stroke palm emblem bursting through a double ASCII frame, a field guide to the schedule, gag bulletin and tool notes in folds, and a boxed board directory of project links.", "hack-02"],
  ["17-module-player_opus_5.5", "Text-Mode Module Player", "Animated SVG: Castaway's synthesized 60-second theme playing in an invented DOS text-mode module player, with the real score scrolling, a measured spectrum analyser, a CASTAWAY equaliser and a tiny unseen ship.", "trk-08"],
  ["18-tui-monitor_opus_5.5", "TUI Monitor", "Animated SVG: Castaway as a full-screen terminal process monitor, with lane meters as CPU cores, activities as a tree of processes, an F-key strip and a status line that watches a ship pass while she sips a coconut.", "hack-07"],
  ["19-megademo-menu_opus_5.5", "Megademo Menu", "Animated SVG: an Amiga megademo part-select menu with a chrome CASTAWAY logo, starfield, giant scroller and a blue-to-pink dotted-leader list of island gags whose cursor flips each pick to its timer, plus MAYBE.", "c64-06"],
  ["20-apple2-screen_opus_5.5", "Apple II Title Screen", "Animated SVG: an early-80s Apple II style six-colour hi-res title screen for Castaway, with block-capital CASTAWAY, an island scene where a ship passes unseen, 40-column credits and a stacked-panel credits page.", "demo-11"],
  // 21 to 116: every remaining style in the catalogue
  ["21-flat-field-dos-intro_opus_5.5","Flat-Field DOS Intro","Animated SVG: a mid-90s DOS intro on a flat turquoise field: bevelled sand-gold CASTAWAY logo, a rope-lashed plank plaque, outlined capitals typed page by page over slowly clicking cogs.","pc-01"],
  ["22-plasma-embossed-logo_opus_5.5","Plasma Field, Embossed Logo","Animated SVG: a lagoon-teal DOS plasma whose palette cycles every 12 s, with CASTAWAY pressed in as leaning Roman capitals, letterbox bars, and a tiny nodding sprite of her typing ten pages of gags.","pc-02"],
  ["23-dos-vga-loader_opus_5.5","Early DOS VGA Loader","Animated SVG: an early-1990s DOS VGA loader with a riveted chrome CASTAWAY plate, palette-cycled blue diamonds, copper bars, a magenta arc-text hammock with her in it, and a choppy sunset scroller.","pc-04"],
  ["24-skinned-installer_opus_5.5","Skinned Installer","Animated SVG: a steel-and-blue skinned installer for Castaway with a lit sign, morphing dot viewport and porthole island; it installs on the beat, stops at 99 percent, ETA 10:00:00.","pc-06"],
  ["25-f-key-options-menu_opus_5.5","F-Key Options Menu","Animated SVG: a 90s-2000s PC F-key options menu for CASTAWAY +10, with a per-letter rainbow logo, an island window, a spinning starfish, VU meters and ten locked options that flip back on the beat.","pc-08"],
  ["26-vector-objects_opus_5.5","Vector Objects","Animated SVG: a demoscene vector-object intro, with a translucent glenz crystal ringed by a dot scroller, a vector-ball CASTAWAY title that flips on the bar, a text writer, and a strip of wireframe props.","pc-13"],
  ["27-texture-movers_opus_5.5","Rotozoomer and Tunnel","Animated SVG: a teal checkered ring tunnel, one ring per beat, flies toward a sunny island window under a pixel CASTAWAY logo, with gag signs swerving past, plus a rotozoomer band for the run command.","pc-14"],
  ["28-c64-one-screen-intro_opus_5.5","C64 One-Screen Intro","Animated SVG: a Commodore 64 one-screen intro with a raster-rolling CASTAWAY logo, pink and blue text bars, an info block, two nodding sprites and a 2x2 greetings scroller.","c64-01"],
  ["29-c64-dycp-scroller_opus_5.5","C64 DYCP Scroller","Animated SVG: a C64 DYCP demo part with a striped two-row CAST/AWAY logo on mauve raster panels, a sine-wave scroller carrying the gags as sprites, and a small pixel island.","c64-02"],
  ["30-petscii-picture_opus_5.5","PETSCII Picture","Animated SVG: a C64 PETSCII picture (40x25 cells, one cyan background) of an island; CASTAWAY in reverse-video block letters, a coconut-on-crab gag, a dozing turtle, beat-timed captions.","c64-03"],
  ["31-amiga-logo-plate-intro_opus_5.5","Amiga Logo-Plate Intro","Animated SVG: an early-1990s Amiga logo-plate intro with a chrome capsule CASTAWAY, eight pages of wavy colour-cycling rainbow capitals and a dense 8-pixel text page.","c64-05"],
  ["32-bobs-dot-objects_opus_5.5","Bobs and Dot Objects","Animated SVG: an early Amiga bobs and dot-object screen, with 29 blue shaded balls and a coconut looping a figure of eight round a turning dot palm, a nodding castaway and a gradient CASTAWAY logo.","c64-08"],
  ["33-copper-only-screen_opus_5.5","Copper-Only Screen","Animated SVG: an Amiga copper-only screen. CASTAWAY sits over rolling diagonal colour bands, above SUN, ISLAND and LANES windows of pure colour effects, with a WAIT WAIT WAIT MOVE bar stepping on the beat.","c64-09"],
  ["34-moire-silhouette_opus_5.5","Moire Silhouette","Animated SVG: a dancing palm, a small woman in headphones and a coconut-wearing crab cut out of drifting moire rings in clashing colours that switch every bar, over CASTAWAY on a flat strip.","c64-11"],
  ["35-hand-pixelled-chrome-logo_opus_5.5","Hand-Pixelled Chrome Logo","Animated SVG: CASTAWAY as an Amiga-style chrome logo, sky over a zigzag horizon over sand, mirrored in a pixel sea, with a sleeping cat, beat-timed glints and a rotating subtitle.","c64-12"],
  ["36-st-menu-disk_opus_5.5","Atari ST Menu Disk","Animated SVG: an Atari ST menu-disk screen for Castaway, with rolling red rasters, a line-wobbling slab logo, a dithered island picture, a numbered key list and a big pink scroller.","c64-13"],
  ["37-chip-music-jukebox_opus_5.5","Chip-Music Jukebox","Animated SVG: an Atari ST-style chip-music jukebox panel with an embossed CASTAWAY title, a red-bar track list of the project's real sound files and times, and an island window acting out each gag.","c64-14"],
  ["38-sample-list-board_opus_5.5","Sample List Message Board","Pure text: a tracker module's sample list used as a message board, two 31-slot lists with CAST AWAY in block pixels, real activity ids as instruments and the Python defs that make their sounds, with real lengths.","trk-02"],
  ["39-dos-gui-tracker_opus_5.5","DOS GUI Tracker","Animated SVG: Castaway as the 640x400 screen of an invented mid-90s DOS GUI tracker, scrolling one real minute of the theme while a shark nods along on channel 7.","trk-03"],
  ["40-text-mode-tracker_opus_5.5","DOS Text-Mode Tracker","Animated SVG: an invented tan DOS text-mode tracker Info Page whose letter-shaped channel windows spell CASTAWAY; her channel goes silent for 27 rows while the theme plays on.","trk-04"],
  ["41-sid-tracker-text_opus_5.5","SID Tracker in Text Mode","Pure text: an 80x25 three-voice SID tracker edit screen in a <pre>, showing one real minute of the ten-hour run, with an animated 16-colour bitmap-font SVG twin behind F1.","trk-06"],
  ["42-multi-chip-tracker_opus_5.5","Multi-Chip Tracker","Animated SVG: an invented multi-chip chiptune tracker scrolling minute 24 of Castaway's real schedule, with island lanes as channels, the synthesized theme as an FM chip, live scopes and a lit piano strip.","trk-07"],
  ["43-file-id-diz_opus_5.5","FILE_ID.DIZ Miniature","Pure text: a 45 by 10 plain-ASCII FILE_ID.DIZ card with an outline CASTAWAY logo, arrow rule and [01/10] counter, plus an animated SVG block-letter DIZ hiding a message in its gaps.","nfo-05"],
  ["44-amiga-description-logo_opus_5.5","Amiga Description Logo","Animated SVG: CASTAWAY as a cream-on-teal Amiga description logo of slashes and underscores; a tide washes it away every 30 s and a cursor retypes it, plus a residents sheet.","nfo-06"],
  ["45-newschool-ascii_opus_5.5","Newschool ASCII","Pure text: 1990s PC newschool ASCII header, CASTAWAY poured from dollar signs with d/b/Y/P rounded edges, a ramp-shaded sun and sea, a lowercase signature, and collapsible sections.","nfo-08"],
  ["46-teletype-picture_opus_5.5","Teletype Picture","Animated SVG: a radioteletype picture on paper, CASTAWAY as bare paper in overstruck M/W, a telegram and a typed island, retyped line by line as the paper steps up.","nfo-11"],
  ["47-ansi-logo-colly_opus_5.5","ANSI Logo Colly","Animated SVG: a 1990s PC ANSI logo colly page, CASTAWAY in shaded block letters wading in a dithered sea between dashed cut lines, plus four more logos (DRONE, SHARK, CRAB, BOTTLE) and a text roster.","ansi-01"],
  ["48-tdf-font-banner_opus_5.5","TheDraw-Style Font Banner","Pure text: CASTAWAY in a self-drawn TheDraw-style outline font made of box-drawing lines, with type-specimen sections and an animated 16-colour DOS colour-proof SVG inside a details block.","ansi-02"],
  ["49-ansimation_opus_5.5","ANSImation Draw-In","Animated SVG: an 80x25 ANSI screen that paints in at 9600 baud behind a block cursor, then loops a 12-bar half-block island cartoon with a coconut-wearing crab and a shark in headphones.","ansi-04"],
  ["50-door-game-screen_opus_5.5","Door Game Screen","Animated SVG: Castaway played as a 1990s BBS door game on an 80x25 ANSI screen: stencil title, a narrated location with bracketed hotkeys, and a story where the bottle she throws comes straight back.","ansi-06"],
  ["51-ripscrip-screen_opus_5.5","RIPscrip Vector Screen","Animated SVG: a 1990s RIPscrip BBS screen in the 16 EGA colours, with a dithered sky, a palm island, a parchment menu of her activities and a bevelled button; once a minute it redraws itself command by command.","ansi-07"],
  ["52-teletext-page_opus_5.5","Teletext Page","Animated SVG: a working teletext page from an invented service, RAFTEXT, with a mosaic CASTAWAY wordmark and island, a ticking clock, a rolling page counter and five pages flipping like coloured-key presses.","ansi-08"],
  ["53-viewdata-page_opus_5.5","Minitel / Viewdata Page","Animated SVG: an invented 1980s viewdata terminal paints a grey 40-column Castaway service page at 1200 bit/s, with a mosaic island, numbered menu, input dot and function keys.","ansi-09"],
  ["54-text-mode-demo-effect_opus_5.5","Text-Mode Demo Effect","Animated SVG: an 80x50 VGA text-mode demo screen in 16 colours, with a palette-cycled shade-character sea and sky around a tiny island, block-letter CASTAWAY plate, a tunnel cut and a one-cell scroller.","ansi-11"],
  ["55-braille-dot-graphics_opus_5.5","Braille-Dot Terminal Graphics","Pure text: a Braille-dot terminal dashboard (btop/drawille style) with the CASTAWAY wordmark over a dotted island, a tiered event graph and block meters from one simulated run, plus a half-block colour SVG.","ansi-12"],
  ["56-vhs-tape_opus_5.5","VHS Tape","Animated SVG: a worn 4:3 VHS playback of a sunny lo-fi island with PLAY/SP and 12:00 OSD, tracking noise, captions and a coconut-on-crab gag that loops by rewinding, plus a VCR timer-menu schedule.","vap-03"],
  ["57-synthwave-outrun_opus_5.5","Synthwave / Outrun","Animated SVG: a synthwave poster with a chrome CASTAWAY, a neon 'golden hours', a striped sun that never sets, a magenta grid sea, and her island, a shark in headphones and a hydrofoil bro.","vap-05"],
  ["58-city-pop-sleeve_opus_5.5","Future Funk / City Pop Sleeve","Animated SVG: a Nagai-style city pop LP on pink pool tiles, with an obi in vertical katakana, the record half out, a back-cover track list of gags and a drifting caustic pool.","vap-06"],
  ["59-luna-desktop_opus_5.5","Mid-2000s Luna Desktop","Animated SVG: a mid-2000s blue-and-green desktop where a browser window plays the island live preview while pale yellow tray balloons report each gag.","vap-09"],
  ["60-one-bit-desktop_opus_5.5","One-Bit Desktop","Animated SVG: a 1-bit classic Mac desktop. A Castaway window shows a dithered island, a 'Please wait' dialog fills a beat at a time, and the Gags menu drops down to start a gag (Get Rescued is greyed out).","vap-11"],
  ["61-web-1-homepage_opus_5.5","Web 1.0 Homepage","Animated SVG kit: a late-1990s free homepage for Castaway, with starry tile, 3D rainbow logo, annotated island photo, marquee, under-construction sign, hit counter, webring and clickable 88x31 buttons.","vap-12"],
  ["62-instant-messenger_opus_5.5","Instant Messenger Window","Animated SVG: a mid-2000s instant messenger in which castaway signs in from her palm with one bar of signal, explains the 10-hour lo-fi island video in coral handwriting, then goes Away as you nudge her.","vap-14"],
  ["63-y2k-cybercore_opus_5.5","Y2K / Cybercore","Animated SVG: a Y2K techno-poster brochure, with CASTAWAY in cut-corner capitals inside a candy-blue lozenge, a chrome ring, orbiting gag icons, a lime lens on the island and a live readout of the schedule.","vap-15"],
  ["64-glitch-art_opus_5.5","Glitch Art","Animated SVG: glitch-art banner, a plain white CASTAWAY over a sunny island still that slices, RGB-splits, datamoshes and pixel-sorts on every 3-second bar, with H.264 frame captions.","vap-16"],
  ["65-memphis_opus_5.5","Memphis","Animated SVG: a Memphis squiggle-laminate banner with CASTAWAY in hopping, tilted hand-cut capitals, deadpan stickers and a live-preview window of the island, plus an eight-card Italian design catalogue of the gags.","vap-17"],
  ["66-neon-signage_opus_5.5","Cyberpunk Neon Signage","Animated SVG: CASTAWAY in pink glass-tube neon over a rainy alley of kana blade signs, a cycling billboard and an LED queue display, opening at the far end on a noon island.","vap-18"],
  ["67-tape-loader_opus_5.5","ZX Spectrum Tape Loader","Animated SVG: Castaway as an 8-bit cassette loading screen. Pilot and data stripes roll in the border while an island picture loads line by line in memory order, then turns to colour one 8x8 cell row at a time.","mach-01"],
  ["68-insert-disk-boot_opus_5.5","Insert-Disk Boot Screen","Animated SVG: a late-80s home-computer boot sequence for Castaway: insert-disk card, a four-colour desktop with an island window and title-bar gag captions, and a red-framed alert that says nothing has failed.","mach-02"],
  ["69-twin-panel-commander_opus_5.5","Twin-Panel Commander","Animated SVG: Castaway as a blue twin-panel DOS file manager. Its C:\\ISLAND listing (ship.pas, crab.hat, bottle.msg) plays out in a half-block Quick View over a 60-second loop.","mach-03"],
  ["70-handheld-boot-logo_opus_5.5","Handheld Boot Logo","Animated SVG: an invented late-1980s handheld whose four-shade green LCD drops the CASTAWAY wordmark, cuts to a pixel-island title card, then plays a deadpan attract-mode story.","mach-07"],
  ["71-console-title-screen_opus_5.5","8-Bit Console Title Screen","Animated SVG: an 8-bit console title card for Castaway. Its T is a palm, debugger panels show the palettes and zone map, a coconut cursor walks the menu and PUSH START blinks before a cut to a demo where nobody scores.","mach-09"],
  ["72-vector-beam-display_opus_5.5","Vector Beam Display","Animated SVG: CASTAWAY in beam-drawn wireframe stroke capitals on a vector arcade screen with coral, aqua and sand overlay strips, a turntable wireframe island, four gags a minute, plus an XY-scope chord panel.","mach-10"],
  ["73-vfd-front-panel_opus_5.5","VFD Front Panel","Animated SVG: an invented late-80s hi-fi receiver whose blue-green VFD scrolls CASTAWAY and the gags in 16-segment cells over a fixed-graphic island, with a 60 s clock and meters following the theme's score.","mach-12"],
  ["74-mono-phone-lcd_opus_5.5","Monochrome Phone LCD","Animated SVG: an invented coral candybar phone lying on island sand, its 84x48 two-tone green LCD showing CASTAWAY and turning picture-message pages of island gags on the bar.","mach-13"],
  ["75-text-zine-header_opus_5.5","Text-Zine Issue Header","Pure text: a hacker text-zine issue in 75-column 7-bit ASCII, with a hex masthead, bar stack, outline CASTAWAY wordmark, dot-leader contents, seven folded files and an EOF bar.","hack-01"],
  ["76-clearsigned-message_opus_5.5","Clearsigned Message Block","Pure text: a real, verifying OpenPGP clearsigned letter from the island, with the CASTAWAY logo drawn in the signature's base64, plus a demo key block holding a palm portrait.","hack-04"],
  ["77-tool-console-banner_opus_5.5","Tool Console Banner","Pure text: a security-tool console in which a seeded banner of a palm island filled with the letter C, an aligned =[ stats block and a port-scan report of the island present Castaway's own files.","hack-05"],
  ["78-fetch-card_opus_5.5","Fetch Card","Animated SVG: a sunny tiling-desktop screenshot where an invented islandfetch prints a neofetch-style card for Castaway beside a live island preview whose gags each rerun reports as missed.","hack-06"],
  ["79-roguelike-screen_opus_5.5","Roguelike Screen","Animated SVG: an 80x24 NetHack-style screen where letter-shaped rooms spell CASTAWAY, corridors end at a sea of braces, and she is the @ on an island while the message line narrates a minute of gags.","hack-08"],
  ["80-mud-transcript_opus_5.5","MUD Session Transcript","Pure text: a MUD telnet session in 7-bit ASCII with a letter-spaced CASTAWAY greeting, island picture, login, room block with linked exits, an H/M/V prompt and seven command folds.","hack-09"],
  ["81-falling-letters-screen_opus_5.5","Falling-Letters Screen","Animated SVG: an 80x25 DOS screen whose readme letters fall on the beat and heap up like sand, then turn into a palm island she walks to with an iced coffee.","hack-10"],
  ["82-irc-channel-window_opus_5.5","IRC Channel Window","Animated SVG: a late-1990s IRC client window where a bot pastes the island and a CASTAWAY logo in colour-cell art, while the channel log runs a 10-hour video in one minute, netsplit included.","hack-11"],
  ["83-diskmag-reader_opus_5.5","Diskmag Reader","Animated SVG: a 1990s PC diskmag reader with a painted CASTAWAY logo, two-column pages a mouse pointer slides through, a status box with tune player, and a sunny island strip.","hack-12"],
  ["84-war-room-big-board_opus_5.5","War-Room Big Board","Animated SVG: an early-80s war-room big board with three glowing vector screens (island chart, Pacific tracks, climbing counters), a green typed terminal and a noughts-and-crosses game that always draws.","hack-13"],
  ["85-digital-rain_opus_5.5","Digital Rain Banner","Animated SVG: aqua digital rain over a fixed glyph grid locks into an amber CASTAWAY, then rewrites itself as an island with sea, palm, her and a coconut-hatted crab.","hack-14"],
  ["86-decrypt-reveal_opus_5.5","Decrypt Reveal","Animated SVG: a terminal decrypt reveal where dim scrambled symbols resolve on the beat into a gradient CASTAWAY logo, a message header of event timers and a daylight island picture.","hack-15"],
  ["87-file-system-landscape_opus_5.5","3D File-System Landscape","Animated SVG: Castaway's real folder tree as an early-90s 3D file-system landscape, with pedestals, file boxes, pulsing wires and glass code towers on a sunny lagoon, and a ten-stop flyover HUD.","hack-16"],
  ["88-tone-pad_opus_5.5","Tone Pad","Animated SVG: a blue phreak-style tone pad on a sunny island dials CAST AWAY, lighting each key's row and column while a green scope draws the real dual tones; she nods in the background.","hack-17"],
  ["89-ctf-board_opus_5.5","CTF Challenge Board","Animated SVG: a dark capture-the-flag board for Castaway, with gag tiles turning green on the beat, a step graph and re-ranking table of the schedule's lanes, a sunny island acting out each solve, and a freeze.","hack-18"],
  ["90-pc-98-adventure-screen_opus_5.5","PC-98 Adventure Screen","Animated SVG: a 640x400, 16-colour Japanese adventure screen; a dithered island, a kanji command menu stepping on the bar and a message window typing each gag, ending in the serve.py command.","asia-02"],
  ["91-ptt-telnet-board_opus_5.5","PTT Telnet Board","Animated SVG: a Taiwanese telnet-board post in 80-column bitmap type with block-character island art and push/boo comments scrolling on the beat, plus a board-list screen of Castaway stats.","asia-03"],
  ["92-japanese-basic-power-on_opus_5.5","Japanese BASIC Power-On","Animated SVG: an imaginary 1980s Japanese computer boots into 'Island BASIC', counts 12000 BARS OK, repaints a striped 8-colour island under an F-key bar, then a blue 40-column screen.","asia-06"],
  ["93-kaomoji-banner_opus_5.5","Kaomoji and One-Line AA","Pure text: a kaomoji README with a heavy-rule celebration banner, a wall of sixty nodding headphone faces hiding a shark, a turning-head strip, a キタ━━━ timer crescendo and katakana sound words.","asia-07"],
  ["94-pulsing-diamonds_opus_5.5","Pulsing Diamonds Light Box","Animated SVG: an invented 1970s music-visualiser light box. A 5 x 2 grid of two-part diamonds pulses on black above a cream faceplate of knobs and buttons, then becomes one big diamond island with a palm.","idle-01"],
  ["95-light-synth_opus_5.5","Light Synth","Animated SVG: a mid-80s light-synth screen where a cursor drops seeds that grow into mirrored rainbow mandalas (palm, wave, turtle, drone, kumara), above a ROM-font status line reading CASTAWAY.","idle-02"],
  ["96-feedback-fire_opus_5.5","Feedback Fire","Animated SVG: a 1990s feedback-fire music visualiser where one white scope line with a palm island in it burns its own echoes outward through four drifting palettes, on a 24 s loop.","idle-03"],
  ["97-classic-saver-set_opus_5.5","Classic Screensaver Set","Animated SVG: an early-90s screen-saver set where two Mystify-style polygons snap into Castaway's gags on the bar under a jagged yellow serif, plus a grey Setup dialog whose Speed slider only goes to Slow.","idle-05"],
  ["98-3d-pipes_opus_5.5","3D Pipes","Animated SVG: a 3D Pipes screensaver in which six glossy lane-coloured pipes grow on the beat around an ivory pipe-built CASTAWAY she sits on, with a coconut joint and a block dissolve.","idle-06"],
  ["99-3d-maze_opus_5.5","3D Maze","Animated SVG: a 1990s 3D maze screensaver raycast in brick, wood and ceiling tile, following a coconut-wearing crab past a CASTAWAY sign, flipped by a grey rock, beside a live overlay map.","idle-07"],
  ["100-sprite-saver_opus_5.5","Sprite Screensaver Module","Animated SVG: an early-90s modular screen saver on a beige monitor, with sea turtles and bottles crossing on one diagonal, island cameos, a ticker line and a slider control panel.","idle-08"],
  ["101-echomail-reader_opus_5.5","Echomail Reader","Animated SVG: Castaway as an echomail message in a GoldED-style DOS reader, with kludges, quotes, tear and origin lines, and a half-block island picture where her bottle drifts straight back.","xfer-02"],
  ["102-pack-list_opus_5.5","Pack List","Pure text: an IRC XDCC bot pastes Castaway's own pack list (bold ** headers, #N rows with gets and sizes, ^- notes) into a terminal channel window, under a CASTAWAY logo in hash marks.","xfer-03"],
  ["103-sitebot-announce_opus_5.5","Sitebot Announce","Animated SVG: a big pixel CASTAWAY over a dark IRC window where an invented sitebot announces the island's gags one bracketed, colour-coded line per 3-second bar of the theme.","xfer-06"],
  ["104-p2p-transfer-window_opus_5.5","P2P Transfer Window","Animated SVG: an invented 2000s file-sharing client window whose downloads, eMule-style chunk bars and yellow upload bars are Castaway's own gags, beside a pixel-art island preview.","xfer-07"],
  ["105-two-pane-transfer-client_opus_5.5","Two-Pane Transfer Client","Animated SVG: an invented two-site FXP transfer client (Tombolo FXP) under a pixel island, moving Castaway's gags between /island and /sea over a 60-second loop.","xfer-09"],
  ["106-sfv-check_opus_5.5","SFV Check","Animated SVG: castaway.sfv in a dark NFO viewer, a block-letter CASTAWAY and palm in the comment lines, 15 real CRC-32s of the project's synthesized sounds checked OK one per beat.","xfer-10"],
  ["107-demo-opening-titles_opus_5.5","PC Demo Opening Titles","Animated SVG: early-90s PC demo opening titles for Castaway, with fade-up text cards, a panning pixel island in letterbox bars, then sliding ROLE - NAME credit cards for each gag.","demo-01"],
  ["108-demo-read-me_opus_5.5","PC Demo READ.ME","Pure text: a 78-column early-90s PC demo READ.ME, with a boxed title card, a dot-leader index and eight folded pages: member table, Q&A, flagged scene-life list and a cut-here membership form.","demo-02"],
  ["109-procedural-effects_opus_5.5","Full-Frame Procedural Effects","Animated SVG: a 30-second, four-part 1993 VGA demo intro for Castaway, with a voxel island scene, a fire effect, shade bobs and an endless Koch-snowflake coastline zoom, all from one Node generator.","demo-03"],
  ["110-256-byte-intro_opus_5.5","256-Byte Intro","Animated SVG: a PC 256-byte-intro pastiche in the stock VGA palette, CASTAWAY knocked out over five looping effects (XOR sea with her island, chessboard sand, Sierpinski zoom, rings, checkerboards).","demo-04"],
  ["111-tiny-intro-info-file_opus_5.5","Tiny-Intro Info File","Pure text: a 40-column demoparty .diz card with an ASCII island, notes for the organisers, a justified greetings list and a self-counting byte total, plus a boxed deluxe card with a slanted logo.","demo-05"],
  ["112-party-results_opus_5.5","Demoparty results.txt","Pure text: a 79-column demoparty results.txt with a signed outline ASCII logo, scored by seconds on screen in one simulated 10-hour run, plus an invitation text with rules, prizes and how to run it.","demo-06"],
  ["113-atari-8-bit-demo_opus_5.5","Atari 8-Bit Demo Screen","Animated SVG: an Atari 8-bit demo screen with CASTAWAY in 16-shade wide-pixel chrome under rolling hue bands, a wide-pixel island with sprites, and the real 10-hour schedule scrolling as a four-colour row.","demo-09"],
  ["114-cpc-demo-screen_opus_5.5","Amstrad CPC Demo Screen","Animated SVG: a borderless 8-bit demo screen in double-wide pixels and three-level RGB, with a dithered CASTAWAY logo, a raster-band island scene, a split-colour strip and a wide scroller.","demo-10"],
  ["115-swapper-floppy_opus_5.5","Swapper's Floppy","Animated SVG: a flat lay of hand-labelled 3.5-inch swap disks on sand, CASTAWAY in marker, a dot-matrix gag list, a bottle, a letter and a coconut-wearing crab.","print-01"],
  ["116-scene-paperwork_opus_5.5","Scene Paperwork","Animated SVG: a photocopied scene-style tick-box swap letter from the island lying on sunny sand, ticked box by box with a red pen, plus a text party pre-invitation with a reply coupon.","print-05"],
];
const styleLink = (id) => `[${id}](../../styles/${id.split('-')[0]}.md#${id})`;
const num = (slug) => slug.split('-')[0];
const pages = [];
for (let i = 0; i < OPTIONS.length; i += PER_PAGE) pages.push(OPTIONS.slice(i, i + PER_PAGE));
const pageFile = (p) => `page-${p + 1}.md`;
const pageOf = (i) => Math.floor(i / PER_PAGE);
const range = (page) => `${num(page[0][0])} to ${num(page[page.length - 1][0])}`;

// ---------- index ----------
const index = [
  '# Castaway header examples',
  '',
  `${OPTIONS.length} retro README headers for Castaway (working title), a ten-hour lo-fi island video for YouTube: a young woman alone on a tiny island, idling to the music, while a schedule of gags plays out on the beat. It is an unofficial remake inspired by the 1992 screensaver *Johnny Castaway*, and is not affiliated with it or its owners. The project lives in \`D:/python/castaway\` and has no README yet: each header here is a candidate for the top of that future README.`,
  '',
  'There is one header for every style in the [style catalogue](../../styles) apart from the 36 built only for the ULTRA-SATISFACTORY set: 01 to 20 were drawn at random, 21 to 116 are all the rest. Each example is its own `.md` in this folder; animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/castaway/src/<option>.mjs`). File links were written for the castaway project root, so they don\'t resolve here.',
  '',
  'Counts quoted (activities, sound files) were checked against the project on 2026-10-01 and 2026-10-02, and the project keeps growing, so they will drift. Every crew, board, station, maker and person named is invented; real groups and products are style references only.',
  '',
  `**Pages:** ${pages.map((page, p) => `[${range(page)}](${pageFile(p)})`).join(' · ')}. Rebuild with \`node examples/castaway/src/build-gallery.mjs\`.`,
  '',
  '| # | Option | Style | Page | What it is |',
  '| --- | --- | --- | --- | --- |',
  ...OPTIONS.map(([slug, name, blurb, id], i) => `| ${num(slug)} | [${name}](${slug}.md) | ${styleLink(id)} | [${pageOf(i) + 1}](${pageFile(pageOf(i))}) | ${blurb} |`),
  '',
];
fs.writeFileSync(path.join(DIR, 'README.md'), index.join('\n'));

// ---------- pages ----------
pages.forEach((page, p) => {
  const nav = [
    '[All headers](README.md)',
    p > 0 ? `[← ${range(pages[p - 1])}](${pageFile(p - 1)})` : null,
    p < pages.length - 1 ? `[${range(pages[p + 1])} →](${pageFile(p + 1)})` : null,
  ].filter(Boolean).join(' · ');
  const parts = [`# Castaway headers ${range(page)}`, '', nav, ''];
  for (const [slug, name] of page) {
    const body = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n').trim();
    parts.push('<br>', '', '---', '', `## ${num(slug)} · ${name}`, '', `<sub><code>${slug}.md</code></sub>`, '', body, '');
  }
  parts.push('<br>', '', '---', '', nav, '');
  fs.writeFileSync(path.join(DIR, pageFile(p)), parts.join('\n'));
});
console.log(`wrote README.md (index of ${OPTIONS.length}) and ${pages.length} pages`);
