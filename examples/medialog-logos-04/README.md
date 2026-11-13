# MediaLog — compact logo collection 04

[Open the actual-size gallery](gallery.html) · [Contact sheet](preview.png) · [Saved random draw](draw.json) · [Project brief](project.json) · [Checks](qa.json)

Ten original graphic logos, designed for **203 × 74 pixels** (viewBox 812 × 296). No ASCII or character art. Each symbol carries one retro machine, demo or screensaver from the catalogue into a modern mark: a handheld boot screen, demo opening titles, a netlabel cassette, a glass glenz book, a one-bit desktop window, Amiga bobs, a maze-walk library, growing pipes, an 8-bit title card and megademo chrome. Primary #18223a and one plain wordmark throughout; the book returns often, not always. All seventy previous MediaLog styles are excluded; the saved draw records the scope.

Each design includes a self-contained SVG, a static SVG, and transparent 812 × 296 PNG exports for light and dark surroundings. All ten move: the main SVG animates (CSS or SVG animation, no scripts) and stops for viewers who ask for reduced motion where CSS allows; the static SVG always holds the designed resting pose. Adaptive SVG colours follow the embedding page’s colour scheme. Every symbol also has its own 64 × 64 SVG. PNGs are browser exports of the static artwork.

| # | Logo | Style | Motion | Files |
| --- | --- | --- | --- | --- |
| 1 | [Boot log](01-mach-07.md) | [mach-07](../../styles/mach.md#mach-07) | Animated | [SVG](assets/01-mach-07.svg) · [Static](assets/01-mach-07-still.svg) · [Light PNG](assets/01-mach-07-light.png) · [Dark PNG](assets/01-mach-07-dark.png) |
| 2 | [Opening titles](02-demo-01.md) | [demo-01](../../styles/demo.md#demo-01) | Animated | [SVG](assets/02-demo-01.svg) · [Static](assets/02-demo-01-still.svg) · [Light PNG](assets/02-demo-01-light.png) · [Dark PNG](assets/02-demo-01-dark.png) |
| 3 | [Side A](03-print-02.md) | [print-02](../../styles/print.md#print-02) | Animated | [SVG](assets/03-print-02.svg) · [Static](assets/03-print-02-still.svg) · [Light PNG](assets/03-print-02-light.png) · [Dark PNG](assets/03-print-02-dark.png) |
| 4 | [Glass book](04-pc-13.md) | [pc-13](../../styles/pc.md#pc-13) | Animated | [SVG](assets/04-pc-13.svg) · [Static](assets/04-pc-13-still.svg) · [Light PNG](assets/04-pc-13-light.png) · [Dark PNG](assets/04-pc-13-dark.png) |
| 5 | [System diary](05-vap-11.md) | [vap-11](../../styles/vap.md#vap-11) | Animated | [SVG](assets/05-vap-11.svg) · [Static](assets/05-vap-11-still.svg) · [Light PNG](assets/05-vap-11-light.png) · [Dark PNG](assets/05-vap-11-dark.png) |
| 6 | [Endless loop](06-c64-08.md) | [c64-08](../../styles/c64.md#c64-08) | Animated | [SVG](assets/06-c64-08.svg) · [Static](assets/06-c64-08-still.svg) · [Light PNG](assets/06-c64-08-light.png) · [Dark PNG](assets/06-c64-08-dark.png) |
| 7 | [Library walk](07-idle-07.md) | [idle-07](../../styles/idle.md#idle-07) | Animated | [SVG](assets/07-idle-07.svg) · [Static](assets/07-idle-07-still.svg) · [Light PNG](assets/07-idle-07-light.png) · [Dark PNG](assets/07-idle-07-dark.png) |
| 8 | [Growing pipes](08-idle-06.md) | [idle-06](../../styles/idle.md#idle-06) | Animated | [SVG](assets/08-idle-06.svg) · [Static](assets/08-idle-06-still.svg) · [Light PNG](assets/08-idle-06-light.png) · [Dark PNG](assets/08-idle-06-dark.png) |
| 9 | [Press start](09-mach-09.md) | [mach-09](../../styles/mach.md#mach-09) | Animated | [SVG](assets/09-mach-09.svg) · [Static](assets/09-mach-09-still.svg) · [Light PNG](assets/09-mach-09-light.png) · [Dark PNG](assets/09-mach-09-dark.png) |
| 10 | [Chrome edition](10-c64-06.md) | [c64-06](../../styles/c64.md#c64-06) | Animated | [SVG](assets/10-c64-06.svg) · [Static](assets/10-c64-06-still.svg) · [Light PNG](assets/10-c64-06-light.png) · [Dark PNG](assets/10-c64-06-dark.png) |

## Use a logo

Copy the chosen SVG and [MIT notice](LICENSE.README-NFO.txt) into your project. The gallery’s Markdown uses `docs/brand/medialog-logos-04/assets/`; change the path if you save it elsewhere. Retain the font notice with the full wordmark. Keep the width and height at 203 × 74, or scale both proportionally. There is no unreadable tagline inside the mark. For a logo that never moves, use the static SVG.

Rebuild vector artwork and gallery with `node examples/medialog-logos-04/src/build.mjs`. Export PNGs with `node examples/medialog-logos-04/src/export-png.mjs` from this repository (Playwright and Chromium required). Source generators are independent compositions; `lib.mjs` contains drawing primitives and reads `wordmark.json`. The wordmark uses DejaVu Sans Bold, converted to paths; retain [its font notice](LICENSE.FONT.txt). To change the title, edit `src/outline-wordmark.py` and run it with Python and fontTools. The font is bundled for reproducibility.

[Other examples](../README.md)
