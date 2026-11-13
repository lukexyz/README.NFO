# MediaLog — compact logo collection

[Open the actual-size gallery](gallery.html) · [Contact sheet](preview.png) · [Saved random draw](draw.json) · [Project brief](project.json) · [Checks](qa.json)

Ten original graphic logos, designed for **203 × 74 pixels** (viewBox 812 × 296). No ASCII or character art. Motifs reinterpret a shared media diary; the screenshot supplied the size and aspect ratio. A graphic-first pool was frozen before the random draw, with previous saved styles excluded.

Each design includes a self-contained SVG, a static SVG, and transparent 812 × 296 PNG exports for light and dark surroundings. Adaptive SVG colours follow the embedding page’s colour scheme. Dark-panel designs retain their panel. PNGs are browser exports of the SVG artwork.

| # | Logo | Style | Files |
| --- | --- | --- | --- |
| 1 | [Signal saved](01-vap-16.md) | [vap-16](../../styles/vap.md#vap-16) | [SVG](assets/01-vap-16.svg) · [Static](assets/01-vap-16-still.svg) · [Light PNG](assets/01-vap-16-light.png) · [Dark PNG](assets/01-vap-16-dark.png) |
| 2 | [Save-slot romance](02-c64-02.md) | [c64-02](../../styles/c64.md#c64-02) | [SVG](assets/02-c64-02.svg) · [Static](assets/02-c64-02-still.svg) · [Light PNG](assets/02-c64-02-light.png) · [Dark PNG](assets/02-c64-02-dark.png) |
| 3 | [Museum of you](03-vap-01.md) | [vap-01](../../styles/vap.md#vap-01) | [SVG](assets/03-vap-01.svg) · [Static](assets/03-vap-01-still.svg) · [Light PNG](assets/03-vap-01-light.png) · [Dark PNG](assets/03-vap-01-dark.png) |
| 4 | [Good company](04-c64-10.md) | [c64-10](../../styles/c64.md#c64-10) | [SVG](assets/04-c64-10.svg) · [Static](assets/04-c64-10-still.svg) · [Light PNG](assets/04-c64-10-light.png) · [Dark PNG](assets/04-c64-10-dark.png) |
| 5 | [Orbit trace](05-mach-10.md) | [mach-10](../../styles/mach.md#mach-10) | [SVG](assets/05-mach-10.svg) · [Static](assets/05-mach-10-still.svg) · [Light PNG](assets/05-mach-10-light.png) · [Dark PNG](assets/05-mach-10-dark.png) |
| 6 | [Memory vault](06-pc-04.md) | [pc-04](../../styles/pc.md#pc-04) | [SVG](assets/06-pc-04.svg) · [Static](assets/06-pc-04-still.svg) · [Light PNG](assets/06-pc-04-light.png) · [Dark PNG](assets/06-pc-04-dark.png) |
| 7 | [Little culture goblin](07-ansi-03.md) | [ansi-03](../../styles/ansi.md#ansi-03) | [SVG](assets/07-ansi-03.svg) · [Static](assets/07-ansi-03-still.svg) · [Light PNG](assets/07-ansi-03-light.png) · [Dark PNG](assets/07-ansi-03-dark.png) |
| 8 | [Still feeling it](08-idle-03.md) | [idle-03](../../styles/idle.md#idle-03) | [SVG](assets/08-idle-03.svg) · [Static](assets/08-idle-03-still.svg) · [Light PNG](assets/08-idle-03-light.png) · [Dark PNG](assets/08-idle-03-dark.png) |
| 9 | [One more watch](09-idle-09.md) | [idle-09](../../styles/idle.md#idle-09) | [SVG](assets/09-idle-09.svg) · [Static](assets/09-idle-09-still.svg) · [Light PNG](assets/09-idle-09-light.png) · [Dark PNG](assets/09-idle-09-dark.png) |
| 10 | [Taste constellation](10-idle-04.md) | [idle-04](../../styles/idle.md#idle-04) | [SVG](assets/10-idle-04.svg) · [Static](assets/10-idle-04-still.svg) · [Light PNG](assets/10-idle-04-light.png) · [Dark PNG](assets/10-idle-04-dark.png) |

## Use a logo

Copy the chosen SVG and [MIT notice](LICENSE.README-NFO.txt) into your project. The gallery’s Markdown uses `docs/brand/medialog-logos-01/assets/`; change the path if you save it elsewhere. Keep the width and height at 203 × 74, or scale both proportionally. There is no unreadable tagline inside the mark.

Rebuild vector artwork and gallery with `node examples/medialog-logos-01/src/build.mjs`. Export PNGs with `node examples/medialog-logos-01/src/export-png.mjs` from this repository (Playwright and Chromium required). Source generators are independent compositions; `lib.mjs` contains the original letter paths and drawing primitives.

[Other examples](../README.md)
