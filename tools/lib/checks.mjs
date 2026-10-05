// Shared checks for the repository validator and the single-file preview.
import path from 'node:path';

export function closesFence(line, marker) {
  const closing = line.match(/^ {0,3}(`+|~+)\s*$/);
  return Boolean(closing && closing[1][0] === marker[0] && closing[1].length >= marker.length);
}

export function proseOnly(markdown) {
  let fence = null;
  return markdown.replace(/\r\n?/g, '\n').split('\n').map((line) => {
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (closesFence(line, fence)) fence = null;
      return '';
    }
    if (opening) {
      fence = opening[1];
      return '';
    }
    return line;
  }).join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/(`+)[^\n]*?\1/g, '');
}

export function localReferences(markdown, imagesOnly = false) {
  const prose = proseOnly(markdown);
  const refs = [];
  for (const match of prose.matchAll(/!?\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/g)) {
    if (!imagesOnly || match[0].startsWith('!')) refs.push(match[1] || match[2]);
  }
  const attrs = imagesOnly ? /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/gi
    : /\b(?:src|href)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  for (const match of prose.matchAll(attrs)) refs.push(match[1] || match[2]);
  for (const match of prose.matchAll(/\bsrcset\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const value = match[1] || match[2];
    // Data URIs contain commas; leave those to the browser rather than treating them as paths.
    if (!/^data:/i.test(value)) refs.push(...value.split(',').map((part) => part.trim().split(/\s+/)[0]));
  }
  return [...new Set(refs.filter((ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref)))];
}

export function localTarget(root, markdownFile, reference) {
  const decoded = decodeURIComponent(reference.split(/[?#]/)[0]);
  const target = path.resolve(path.dirname(path.join(root, markdownFile)), decoded);
  const relative = path.relative(root, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Reference escapes the repository: ${reference}`);
  }
  return target;
}

export function checkCatalogue(data) {
  const errors = [];
  const byId = new Map();
  const keys = new Set();
  if (!Array.isArray(data?.families) || !data.families.length) {
    return { errors: ['Catalogue must contain families'], byId, distinct: [] };
  }
  for (const family of data.families) {
    if (!family || typeof family.key !== 'string' || !/^[a-z][a-z0-9]*$/.test(family.key) || !Array.isArray(family.styles)) {
      errors.push('Invalid catalogue family');
      continue;
    }
    if (keys.has(family.key)) errors.push(`Duplicate family: ${family.key}`);
    keys.add(family.key);
    for (const style of family.styles) {
      if (!style || typeof style.id !== 'string' || !/^[a-z][a-z0-9]*-\d{2}$/.test(style.id)
        || !style.id.startsWith(`${family.key}-`) || typeof style.name !== 'string' || !style.name.trim()) {
        errors.push(`Invalid style in ${family.key}: ${style?.id}`);
        continue;
      }
      if (byId.has(style.id)) errors.push(`Duplicate style ID: ${style.id}`);
      byId.set(style.id, style);
    }
  }
  for (const style of byId.values()) {
    const visited = new Set([style.id]);
    let current = style;
    while (current.duplicate_of) {
      const target = current.duplicate_of;
      if (!byId.has(target)) { errors.push(`${current.id}: unknown duplicate target ${target}`); break; }
      if (visited.has(target)) { errors.push(`${style.id}: duplicate cycle`); break; }
      visited.add(target);
      current = byId.get(target);
    }
  }
  return { errors, byId, distinct: [...byId.values()].filter((style) => !style.duplicate_of) };
}

export function svgPolicyIssues(source) {
  const issues = [];
  if (/<(?:script|foreignObject)\b/i.test(source)) issues.push('scripts and foreignObject are not supported in README images');
  if (/\son[a-z]+\s*=/i.test(source)) issues.push('event handlers are not supported in README images');
  if (/(?:href|src)\s*=\s*["'](?!#|data:)[^"']+/i.test(source)) issues.push('external image resources must be embedded');
  if (/@import/i.test(source) || [...source.matchAll(/url\(\s*(['"]?)([^'"\s)]+)\1\s*\)/gi)]
    .some((match) => !/^(?:#|data:)/i.test(match[2]))) issues.push('external CSS resources must be embedded');
  const viewBox = source.match(/\bviewBox\s*=\s*["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4 || viewBox.some((n) => !Number.isFinite(n)) || viewBox[2] <= 0 || viewBox[3] <= 0) {
    issues.push('a valid viewBox is required for responsive scaling');
  }
  if (/@keyframes|<animate(?:Transform|Motion)?\b|<set\b/i.test(source) && !/prefers-reduced-motion/i.test(source)) {
    issues.push('animated SVGs must include a prefers-reduced-motion rule');
  }
  return issues;
}
