# Pliny — one draw, three interpretations

Fifteen original README headers for three repositories by [elder-plinius](https://github.com/elder-plinius).

**[Open the side-by-side comparison](../comparisons/pliny-first-draw/index.html)** — five rows, three repos per row, motion controls, enlarged views and SVG downloads. The page embeds every asset and works offline.

| Repository | Saved gallery | Scene direction |
| --- | --- | --- |
| [NATURALIS-HISTORIA](https://github.com/elder-plinius/NATURALIS-HISTORIA) | [Five headers](naturalis-historia/README.md) | The first encyclopedia, illustrated. |
| [GL4SS](https://github.com/elder-plinius/GL4SS) | [Five headers](gl4ss/README.md) | A place. A year. A window through time. |
| [ST3GG](https://github.com/elder-plinius/ST3GG) | [Five headers](st3gg/README.md) | A message beneath the surface. |

The same five references apply to every repository, with independent compositions and motion:

1. **Off-air test card** — `idle-10`
2. **Taiwanese BBS board** — `asia-03`
3. **PC demo opening titles** — `demo-01`
4. **Monochrome viewdata** — `ansi-09`
5. **Luna desktop** — `vap-09`

The selection was drawn without replacement from the 152 non-duplicate catalogue entries and is saved in [draw.json](../comparisons/pliny-first-draw/draw.json). Rebuilding preserves that draw.

```sh
node tools/pliny-headers/build.mjs
```

Edit project wording in [projects.json](../tools/pliny-headers/projects.json) and original SVG scenes in [render.mjs](../tools/pliny-headers/render.mjs). Individual generators sit beside each set in `src/`; gallery builders can also run independently.

These are unofficial design studies. Source README descriptions were checked on 2026-10-05. Terminal comments, sample file names and status activity are illustrative. SVGs support reduced motion and use no remote assets; Chinese terminal labels use a local system font fallback.
