"""Rebuild the plain wordmark from the bundled, licensed font (requires fontTools)."""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

root = Path(__file__).resolve().parent
font = TTFont(root / 'fonts' / 'DejaVuSans-Bold.ttf')
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
kern = {}
for table in font['kern'].kernTables:
    kern.update(table.kernTable)
pen, bounds = SVGPathPen(glyphs), BoundsPen(glyphs)
x, previous = 0, None
for char in 'MediaLog':
    name = cmap[ord(char)]
    if previous:
        x += kern.get((previous, name), 0)
    for target in (pen, bounds):
        glyphs[name].draw(TransformPen(target, (1, 0, 0, 1, x, 0)))
    x += font['hmtx'][name][0]
    previous = name
data = {'text': 'MediaLog', 'typeface': 'DejaVu Sans Bold', 'license': '../LICENSE.FONT.txt', 'bounds': bounds.bounds, 'path': pen.getCommands()}
(root / 'wordmark.json').write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
print('Outlined the plain MediaLog wordmark.')
