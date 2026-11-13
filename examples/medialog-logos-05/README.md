# MediaLog — compact logo collection 05

[Open the actual-size gallery](gallery.html) · [Contact sheet](preview.png) · [Symbols](icons.png) · [Saved selection](draw.json) · [Project brief](project.json) · [Checks](qa.json)

Ten original graphic logos, designed for **203 × 74 pixels** (viewBox 812 × 296), each aimed at a kind of media rather than the diary book. No ASCII or character art, and no animation. Every style is new to MediaLog: the seven graphic styles left unused after collection 04, plus three media-led styles added to the graphic pool for this set (a TV test card, a pinball dot-matrix display and an FM-synth status screen). Primary #18223a and one plain wordmark throughout. The saved selection records the scope.

Each design includes a self-contained static SVG, a 64 × 64 icon-only SVG, and transparent 812 × 296 PNG exports for light and dark surroundings. Adaptive SVG colours follow the embedding page’s colour scheme. PNGs are browser exports of the SVG artwork.

| # | Logo | Leads with | Style | Files |
| --- | --- | --- | --- | --- |
| 1 | [Now showing](01-mach-12.md) | Films | [mach-12](../../styles/mach.md#mach-12) | [SVG](assets/01-mach-12.svg) · [Icon](assets/01-mach-12-icon.svg) · [Light PNG](assets/01-mach-12-light.png) · [Dark PNG](assets/01-mach-12-dark.png) |
| 2 | [Off air](02-idle-10.md) | Shows | [idle-10](../../styles/idle.md#idle-10) | [SVG](assets/02-idle-10.svg) · [Icon](assets/02-idle-10-icon.svg) · [Light PNG](assets/02-idle-10-light.png) · [Dark PNG](assets/02-idle-10-dark.png) |
| 3 | [Jukebox](03-c64-14.md) | Albums | [c64-14](../../styles/c64.md#c64-14) | [SVG](assets/03-c64-14.svg) · [Icon](assets/03-c64-14-icon.svg) · [Light PNG](assets/03-c64-14-light.png) · [Dark PNG](assets/03-c64-14-dark.png) |
| 4 | [Extra ball](04-mach-11.md) | Games | [mach-11](../../styles/mach.md#mach-11) | [SVG](assets/04-mach-11.svg) · [Icon](assets/04-mach-11-icon.svg) · [Light PNG](assets/04-mach-11-light.png) · [Dark PNG](assets/04-mach-11-dark.png) |
| 5 | [Channel keys](05-asia-01.md) | Albums | [asia-01](../../styles/asia.md#asia-01) | [SVG](assets/05-asia-01.svg) · [Icon](assets/05-asia-01-icon.svg) · [Light PNG](assets/05-asia-01-light.png) · [Dark PNG](assets/05-asia-01-dark.png) |
| 6 | [Final cut](06-pc-05.md) | Films | [pc-05](../../styles/pc.md#pc-05) | [SVG](assets/06-pc-05.svg) · [Icon](assets/06-pc-05-icon.svg) · [Light PNG](assets/06-pc-05-light.png) · [Dark PNG](assets/06-pc-05-dark.png) |
| 7 | [On air](07-idle-02.md) | Podcasts | [idle-02](../../styles/idle.md#idle-02) | [SVG](assets/07-idle-02.svg) · [Icon](assets/07-idle-02-icon.svg) · [Light PNG](assets/07-idle-02-light.png) · [Dark PNG](assets/07-idle-02-dark.png) |
| 8 | [Fire button](08-demo-08.md) | Games | [demo-08](../../styles/demo.md#demo-08) | [SVG](assets/08-demo-08.svg) · [Icon](assets/08-demo-08-icon.svg) · [Light PNG](assets/08-demo-08-light.png) · [Dark PNG](assets/08-demo-08-dark.png) |
| 9 | [Stacked](09-demo-11.md) | Books | [demo-11](../../styles/demo.md#demo-11) | [SVG](assets/09-demo-11.svg) · [Icon](assets/09-demo-11-icon.svg) · [Light PNG](assets/09-demo-11-light.png) · [Dark PNG](assets/09-demo-11-dark.png) |
| 10 | [Review slip](10-print-05.md) | Books, Films, Albums | [print-05](../../styles/print.md#print-05) | [SVG](assets/10-print-05.svg) · [Icon](assets/10-print-05-icon.svg) · [Light PNG](assets/10-print-05-light.png) · [Dark PNG](assets/10-print-05-dark.png) |

## Use a logo

Copy the chosen SVG and [MIT notice](LICENSE.README-NFO.txt) into your project. The gallery’s Markdown uses `docs/brand/medialog-logos-05/assets/`; change the path if you save it elsewhere. Retain the font notice with the full wordmark. Keep the width and height at 203 × 74, or scale both proportionally. There is no unreadable tagline inside the mark.

Rebuild vector artwork and gallery with `node examples/medialog-logos-05/src/build.mjs`. Export PNGs with `node examples/medialog-logos-05/src/export-png.mjs` from this repository (Playwright and Chromium required). Source generators are independent compositions; `lib.mjs` contains drawing primitives and reads `wordmark.json`. The wordmark uses DejaVu Sans Bold, converted to paths; retain [its font notice](LICENSE.FONT.txt). To change the title, edit `src/outline-wordmark.py` and run it with Python and fontTools. The font is bundled for reproducibility.

[Other examples](../README.md)
