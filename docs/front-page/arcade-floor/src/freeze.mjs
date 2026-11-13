// Deterministic stills of animated SVGs, so a rebuild gives byte-identical JPEGs.
// An <img> runs its SVG on the wall clock, so a wait-then-screenshot lands on a slightly
// different frame each run. Instead the host page holds empty placeholders
// (<div data-freeze="i">), each placeholder gets the SVG markup in its own shadow root
// (scoped styles and ids, so two copies of one SVG cannot clash), and every CSS and SMIL
// animation is paused at exactly `ms`.
import fs from 'node:fs';

const FIT = { cover: 'xMidYMid slice', top: 'xMidYMin slice', contain: 'xMidYMid meet' };

// Placeholder markup for a host page. `style` positions and sizes the box.
export const slot = (i, style) => `<div data-freeze="${i}" style="${style}"></div>`;

// Fill the placeholders on an already loaded page and pause everything at `ms`.
// items: [{ file, fit }] indexed like the slot() calls.
export async function freeze(page, items, ms) {
  const svgs = items.map(({ file, fit }) => ({
    markup: fs.readFileSync(file, 'utf8').replace(/^<\?xml[^>]*>\s*/, ''),
    par: FIT[fit] || FIT.cover,
  }));
  await page.evaluate(async ({ svgs, ms }) => {
    for (const host of document.querySelectorAll('[data-freeze]')) {
      const { markup, par } = svgs[Number(host.dataset.freeze)];
      const root = host.attachShadow({ mode: 'open' });
      root.innerHTML = markup;
      const svg = root.querySelector('svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', par);
      svg.style.display = 'block';
      getComputedStyle(svg).opacity; // start CSS animations before seeking them
      if (svg.pauseAnimations) { svg.pauseAnimations(); svg.setCurrentTime(ms / 1000); }
      for (const a of root.getAnimations()) { a.pause(); a.currentTime = ms; }
    }
    await Promise.all([...document.querySelectorAll('[data-freeze]')]
      .flatMap((h) => [...h.shadowRoot.querySelectorAll('image')])
      .map((im) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = im.getAttribute('href') || im.getAttribute('xlink:href'); })));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, { svgs, ms });
}
