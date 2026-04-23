export interface Section {
  id: string;
  title: string;
  body: string;
}

export interface ParsedDoc {
  preamble: string;
  sections: Section[];
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `s-${Date.now().toString(36)}-${idCounter}`;
}

export function parseSections(md: string): ParsedDoc {
  const lines = md.split(/\r?\n/);
  const sections: Section[] = [];
  let preamble = '';
  let current: Section | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      current.body = buffer.join('\n').replace(/^\n+|\n+$/g, '');
      sections.push(current);
    } else {
      preamble = buffer.join('\n').replace(/^\n+|\n+$/g, '');
    }
    buffer = [];
  };

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      current = { id: nextId(), title: m[1].trim(), body: '' };
    } else {
      buffer.push(line);
    }
  }
  flush();

  return { preamble, sections };
}

export function serializeDoc(doc: ParsedDoc): string {
  const parts: string[] = [];
  if (doc.preamble.trim()) parts.push(doc.preamble.trim());
  for (const s of doc.sections) {
    const title = (s.title || 'Untitled').trim();
    const body = s.body.trim();
    parts.push(body ? `## ${title}\n\n${body}` : `## ${title}`);
  }
  return parts.join('\n\n') + '\n';
}

export function newSection(title = 'New entry'): Section {
  return { id: nextId(), title, body: '' };
}

export function preview(body: string, max = 140): string {
  const flat = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_~`>#-]+/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max - 1).trimEnd() + '…';
}
