// Twenty tiny vector vignettes that stand in for "a header" on the hero's NUMBERED scene and in
// continue.svg. Each is drawn in a w x h box at the origin, with no text, so they stay a few hundred
// bytes each. They hint at the range (sunsets, checker floors, raster bars, terminals...) without
// copying any real header.
const P = ['#ff4f9a', '#ffb000', '#3dd6ff', '#9b6bff', '#46e08a', '#ff6a3d', '#f5f0e6', '#1e90ff'];

export function vignette(i, w, h) {
  const k = i % 20;
  const r = (x, y, ww, hh, f, extra = '') => `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${f}"${extra}/>`;
  switch (k) {
    case 0: { // sunset over a grid
      let s = r(0, 0, w, h, '#2a0f4a') + `<circle cx="${w / 2}" cy="${h * 0.58}" r="${h * 0.3}" fill="#ffb000"/>` + r(0, h * 0.58, w, h * 0.42, '#14062a');
      for (let j = 1; j < 4; j++) s += r(0, h * 0.58 + j * h * 0.1, w, 1, '#ff4f9a');
      for (let j = -3; j <= 3; j++) s += `<path d="M${w / 2 + j * 4} ${h * 0.58}L${w / 2 + j * w * 0.3} ${h}" stroke="#ff4f9a" stroke-width="1"/>`;
      return s;
    }
    case 1: { // checker floor and a sphere
      let s = r(0, 0, w, h, '#0c1f4a');
      const n = 8;
      for (let x = 0; x < n; x++) for (let y = 0; y < 3; y++) if ((x + y) % 2 === 0) s += r((x * w) / n, h * 0.55 + (y * h * 0.15), w / n, h * 0.15, '#e8ecf8');
      return s + `<circle cx="${w * 0.35}" cy="${h * 0.38}" r="${h * 0.18}" fill="#9fd8ff"/><circle cx="${w * 0.31}" cy="${h * 0.33}" r="${h * 0.06}" fill="#fff"/>`;
    }
    case 2: { // raster bars
      let s = r(0, 0, w, h, '#05060a');
      ['#ff4f9a', '#ffb000', '#46e08a', '#3dd6ff', '#9b6bff'].forEach((c, j) => { s += r(0, h * 0.12 + j * h * 0.17, w, h * 0.09, c); });
      return s;
    }
    case 3: { // starfield and a wordmark bar
      let s = r(0, 0, w, h, '#04050a');
      for (let j = 0; j < 14; j++) s += r((j * 37) % w, (j * 23) % h, 2, 2, '#c9d4ff');
      return s + r(w * 0.15, h * 0.4, w * 0.7, h * 0.2, '#7fe3ff');
    }
    case 4: { // test card bars
      let s = '';
      ['#e8ecf8', '#ffd84a', '#3dd6ff', '#46e08a', '#ff4f9a', '#ff3b3b', '#1e3cff'].forEach((c, j) => { s += r((j * w) / 7, 0, w / 7 + 0.5, h * 0.7, c); });
      return s + r(0, h * 0.7, w, h * 0.3, '#111');
    }
    case 5: { // teletext blocks
      let s = r(0, 0, w, h, '#000') + r(0, 0, w, h * 0.22, '#1e3cff') + r(w * 0.1, h * 0.05, w * 0.6, h * 0.12, '#ffd84a');
      for (let j = 0; j < 4; j++) s += r(w * 0.08, h * 0.32 + j * h * 0.15, w * (0.4 + (j % 2) * 0.3), h * 0.07, j % 2 ? '#46e08a' : '#3dd6ff');
      return s;
    }
    case 6: { // green terminal
      let s = r(0, 0, w, h, '#031a0c');
      for (let j = 0; j < 6; j++) s += r(w * 0.08, h * 0.12 + j * h * 0.13, w * [0.7, 0.4, 0.8, 0.55, 0.3, 0.6][j], h * 0.06, '#46e08a');
      return s;
    }
    case 7: { // island and palm
      let s = r(0, 0, w, h * 0.55, '#7fd8ff') + r(0, h * 0.55, w, h * 0.45, '#1e90ff');
      s += `<ellipse cx="${w / 2}" cy="${h * 0.62}" rx="${w * 0.22}" ry="${h * 0.08}" fill="#ffd27a"/>`;
      s += r(w / 2 - 1, h * 0.25, 2, h * 0.35, '#7a4a1a') + `<path d="M${w / 2} ${h * 0.25}l-${w * 0.14} ${h * 0.08}M${w / 2} ${h * 0.25}l${w * 0.14} ${h * 0.08}M${w / 2} ${h * 0.25}l-${w * 0.06} ${h * 0.14}M${w / 2} ${h * 0.25}l${w * 0.06} ${h * 0.14}" stroke="#2fae4a" stroke-width="3"/>`;
      return s;
    }
    case 8: { // waveform scope
      let d = `M0 ${h / 2}`;
      for (let x = 0; x <= w; x += 4) d += `L${x} ${(h / 2 + Math.sin(x / 6) * h * 0.28).toFixed(1)}`;
      return r(0, 0, w, h, '#06140f') + `<path d="${d}" fill="none" stroke="#46e08a" stroke-width="2"/>`;
    }
    case 9: { // memphis confetti on cream
      let s = r(0, 0, w, h, '#f5e6c8');
      s += `<circle cx="${w * 0.2}" cy="${h * 0.3}" r="${h * 0.12}" fill="#ff4f9a"/>` + r(w * 0.55, h * 0.15, w * 0.2, h * 0.2, '#3dd6ff');
      s += `<path d="M${w * 0.1} ${h * 0.75}q${w * 0.1}-${h * 0.2} ${w * 0.2} 0t${w * 0.2} 0" fill="none" stroke="#1a1a1a" stroke-width="2"/>`;
      return s + `<path d="M${w * 0.7} ${h * 0.85}l${w * 0.1}-${h * 0.3}l${w * 0.1} ${h * 0.3}z" fill="#ffb000"/>`;
    }
    case 10: { // bricks
      let s = r(0, 0, w, h, '#5a1e14');
      for (let y = 0; y < 6; y++) for (let x = -1; x < 6; x++) s += r(x * (w / 5) + (y % 2 ? w / 10 : 0) + 1, y * (h / 6) + 1, w / 5 - 2, h / 6 - 2, '#b8452e');
      return s;
    }
    case 11: { // bob chain
      let s = r(0, 0, w, h, '#05060a');
      for (let j = 0; j < 9; j++) { const a = (j / 9) * Math.PI * 2; s += `<circle cx="${(w / 2 + Math.sin(a) * w * 0.32).toFixed(1)}" cy="${(h / 2 + Math.sin(a * 2) * h * 0.25).toFixed(1)}" r="${(h * 0.08).toFixed(1)}" fill="#3d7aff"/>`; }
      return s;
    }
    case 12: { // desktop window
      let s = r(0, 0, w, h, '#3a9a7a') + r(w * 0.12, h * 0.15, w * 0.76, h * 0.65, '#d8dce6') + r(w * 0.12, h * 0.15, w * 0.76, h * 0.12, '#1e3cff');
      return s + r(w * 0.2, h * 0.38, w * 0.3, h * 0.06, '#555') + r(w * 0.2, h * 0.5, w * 0.45, h * 0.06, '#555') + r(0, h * 0.88, w, h * 0.12, '#c0c4cc');
    }
    case 13: { // LCD
      let s = r(0, 0, w, h, '#2a3a20') + r(w * 0.1, h * 0.12, w * 0.8, h * 0.76, '#a8c87a');
      return s + r(w * 0.2, h * 0.35, w * 0.6, h * 0.14, '#2a3a20') + r(w * 0.3, h * 0.58, w * 0.4, h * 0.07, '#2a3a20');
    }
    case 14: { // equaliser
      let s = r(0, 0, w, h, '#0b0c18');
      const hs = [0.5, 0.8, 0.35, 0.65, 0.9, 0.45, 0.7, 0.3];
      hs.forEach((v, j) => { s += r(w * 0.08 + j * w * 0.11, h * (0.9 - v * 0.8), w * 0.08, h * v * 0.8, j % 3 ? '#3dd6ff' : '#ffb000'); });
      return s;
    }
    case 15: { // diamonds
      let s = r(0, 0, w, h, '#1a1030');
      for (let j = 0; j < 4; j++) { const cx = w * (0.15 + j * 0.23); s += `<path d="M${cx} ${h * 0.2}l${w * 0.09} ${h * 0.3}l-${w * 0.09} ${h * 0.3}l-${w * 0.09}-${h * 0.3}z" fill="${P[j]}"/>`; }
      return s;
    }
    case 16: { // vaporwave bust-ish pink
      let s = r(0, 0, w, h, '#ff9ad5') + r(0, h * 0.6, w, h * 0.4, '#2a1060');
      for (let x = 0; x < 8; x++) if (x % 2) s += r((x * w) / 8, h * 0.6, w / 8, h * 0.2, '#e8ecf8');
      return s + `<circle cx="${w * 0.7}" cy="${h * 0.32}" r="${h * 0.18}" fill="#f5f0e6"/>`;
    }
    case 17: { // NFO text block
      let s = r(0, 0, w, h, '#0d1117');
      for (let j = 0; j < 5; j++) s += r(w * 0.1 + (j % 2) * 4, h * 0.14 + j * h * 0.16, w * [0.8, 0.6, 0.75, 0.5, 0.65][j], h * 0.08, j ? '#8b93a7' : '#e8ecf8');
      return s;
    }
    case 18: { // plasma stripes
      let s = '';
      for (let j = 0; j < 8; j++) s += r(0, (j * h) / 8, w, h / 8 + 0.5, ['#3d0a5a', '#7a1a8a', '#c43a8a', '#ff6a3d', '#ffb000', '#ff6a3d', '#c43a8a', '#7a1a8a'][j]);
      return s;
    }
    default: { // vhs tape label
      let s = r(0, 0, w, h, '#1a1a1a') + r(w * 0.1, h * 0.2, w * 0.8, h * 0.45, '#f5f0e6');
      return s + r(w * 0.1, h * 0.2, w * 0.8, h * 0.1, '#ff3b3b') + `<circle cx="${w * 0.32}" cy="${h * 0.8}" r="${h * 0.09}" fill="#555"/><circle cx="${w * 0.68}" cy="${h * 0.8}" r="${h * 0.09}" fill="#555"/>`;
    }
  }
}
