export type FrontmatterValue = string | number | boolean | string[];
export type Frontmatter = Record<string, FrontmatterValue>;

export interface ParsedMarkdown {
  frontmatter: Frontmatter;
  body: string;
}

const FENCE = '---';

export function parseMarkdown(input: string): ParsedMarkdown {
  const text = input ?? '';
  if (!text.startsWith(FENCE + '\n') && !text.startsWith(FENCE + '\r\n')) {
    return { frontmatter: {}, body: text };
  }
  const afterOpen = text.slice(text.indexOf('\n') + 1);
  const endIdx = afterOpen.indexOf('\n' + FENCE);
  if (endIdx === -1) {
    return { frontmatter: {}, body: text };
  }
  const rawFm = afterOpen.slice(0, endIdx);
  let rest = afterOpen.slice(endIdx + 1 + FENCE.length);
  if (rest.startsWith('\r\n')) rest = rest.slice(2);
  else if (rest.startsWith('\n')) rest = rest.slice(1);
  return { frontmatter: parseFrontmatter(rawFm), body: rest };
}

function parseFrontmatter(src: string): Frontmatter {
  const out: Frontmatter = {};
  const lines = src.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    const rawValue = m[2];
    if (rawValue === '' || rawValue === '~' || rawValue === 'null') {
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const li = lines[j];
        const lm = li.match(/^\s*-\s+(.*)$/);
        if (!lm) break;
        items.push(unquote(lm[1]));
        j++;
      }
      if (items.length > 0) {
        out[key] = items;
        i = j;
        continue;
      }
      out[key] = '';
      i++;
      continue;
    }
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inner = rawValue.slice(1, -1).trim();
      out[key] = inner ? inner.split(',').map((s) => unquote(s.trim())) : [];
    } else if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
      out[key] = Number(rawValue);
    } else if (rawValue === 'true' || rawValue === 'false') {
      out[key] = rawValue === 'true';
    } else {
      out[key] = unquote(rawValue);
    }
    i++;
  }
  return out;
}

function unquote(s: string): string {
  if (s.length >= 2) {
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
  }
  return s;
}

export function stringifyMarkdown(fm: Frontmatter, body: string): string {
  const keys = Object.keys(fm);
  if (keys.length === 0) return body ?? '';
  const lines: string[] = [FENCE];
  for (const k of keys) {
    const v = fm[k];
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
      } else {
        lines.push(`${k}:`);
        for (const item of v) lines.push(`  - ${quoteIfNeeded(String(item))}`);
      }
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      lines.push(`${k}: ${v}`);
    } else {
      lines.push(`${k}: ${quoteIfNeeded(String(v ?? ''))}`);
    }
  }
  lines.push(FENCE);
  lines.push('');
  return lines.join('\n') + (body ?? '');
}

function quoteIfNeeded(s: string): string {
  if (s === '') return '""';
  if (/[:#\n"'\[\]]/.test(s) || /^[\s-]/.test(s) || /\s$/.test(s)) {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return s;
}
