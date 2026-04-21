import { useRef, type KeyboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}

const INDENT = '  ';
const BULLETS = ['●', '○', '◦'];
const CIRCLE_CHARS = '●○◦';
const LEGACY_CHARS = '-*+';

function bulletFor(level: number): string {
  return BULLETS[Math.min(Math.max(level, 0), BULLETS.length - 1)];
}

function isCircleMarker(marker: string): boolean {
  const c = marker.trim();
  return c.length === 1 && (CIRCLE_CHARS.includes(c) || LEGACY_CHARS.includes(c));
}

export function MarkdownEditor({ value, onChange, placeholder, minRows = 14 }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      applyIndent(e.currentTarget, e.shiftKey);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
      handleEnter(e);
      return;
    }
  }

  function setSelection(el: HTMLTextAreaElement, start: number, end: number) {
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start;
      el.selectionEnd = end;
    });
  }

  function handleChange(next: string) {
    if (value === '' && next !== '' && !matchBulletPrefix(next)) {
      const seeded = `${bulletFor(0)} ${next}`;
      onChange(seeded);
      const el = ref.current;
      if (el) setSelection(el, seeded.length, seeded.length);
      return;
    }
    onChange(next);
  }

  function handleEnter(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start !== end) return;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = before.slice(lineStart);
    const bullet = matchBulletPrefix(currentLine);

    if (!bullet) {
      e.preventDefault();
      const insert = `\n${bulletFor(0)} `;
      const newValue = before + insert + after;
      const newCaret = start + insert.length;
      onChange(newValue);
      setSelection(el, newCaret, newCaret);
      return;
    }

    const isEmpty = currentLine.trim() === bullet.marker.trim();
    if (isEmpty) {
      e.preventDefault();
      if (bullet.indent.length >= INDENT.length) {
        const newLevel = Math.floor(bullet.indent.length / INDENT.length) - 1;
        const newIndent = INDENT.repeat(newLevel);
        const newMarker = isCircleMarker(bullet.marker) ? `${bulletFor(newLevel)} ` : bullet.marker;
        const newLine = newIndent + newMarker;
        const newValue = before.slice(0, lineStart) + newLine + after;
        const newCaret = lineStart + newLine.length;
        onChange(newValue);
        setSelection(el, newCaret, newCaret);
        return;
      }
      const newValue = before.slice(0, lineStart) + after;
      const newCaret = lineStart;
      onChange(newValue);
      setSelection(el, newCaret, newCaret);
      return;
    }

    e.preventDefault();
    const level = Math.floor(bullet.indent.length / INDENT.length);
    const marker = isCircleMarker(bullet.marker) ? `${bulletFor(level)} ` : nextMarker(bullet.marker);
    const insert = '\n' + bullet.indent + marker;
    const newValue = before + insert + after;
    const newCaret = start + insert.length;
    onChange(newValue);
    setSelection(el, newCaret, newCaret);
  }

  function applyIndent(el: HTMLTextAreaElement, outdent: boolean) {
    const { selectionStart, selectionEnd } = el;
    const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const afterNl = value.indexOf('\n', selectionEnd);
    const lastLineEnd = afterNl === -1 ? value.length : afterNl;
    const region = value.slice(firstLineStart, lastLineEnd);
    const lines = region.split('\n');

    let deltaFirst = 0;
    let deltaTotal = 0;
    const adjusted = lines.map((line, idx) => {
      const bullet = matchBulletPrefix(line);
      if (bullet) {
        const rest = line.slice(bullet.indent.length + bullet.marker.length);
        const currentLevel = Math.floor(bullet.indent.length / INDENT.length);
        if (outdent && currentLevel === 0) return line;
        const newLevel = outdent ? currentLevel - 1 : currentLevel + 1;
        const newIndent = INDENT.repeat(newLevel);
        const newMarker = isCircleMarker(bullet.marker) ? `${bulletFor(newLevel)} ` : bullet.marker;
        const newLine = newIndent + newMarker + rest;
        const delta = newLine.length - line.length;
        if (idx === 0) deltaFirst += delta;
        deltaTotal += delta;
        return newLine;
      }
      if (outdent) {
        let strip = 0;
        if (line.startsWith(INDENT)) strip = INDENT.length;
        else if (line.startsWith(' ')) strip = 1;
        if (strip === 0) return line;
        if (idx === 0) deltaFirst -= strip;
        deltaTotal -= strip;
        return line.slice(strip);
      }
      if (idx === 0) deltaFirst += INDENT.length;
      deltaTotal += INDENT.length;
      return INDENT + line;
    });

    const newRegion = adjusted.join('\n');
    if (newRegion === region) return;
    const newValue = value.slice(0, firstLineStart) + newRegion + value.slice(lastLineEnd);
    onChange(newValue);
    const newStart = Math.max(firstLineStart, selectionStart + deltaFirst);
    const newEnd = selectionStart === selectionEnd
      ? newStart
      : Math.max(newStart, selectionEnd + deltaTotal);
    setSelection(el, newStart, newEnd);
  }

  function onToolbarIndent(outdent: boolean) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    applyIndent(el, outdent);
  }

  function onToolbarNewBullet() {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const atLineStart = start === 0 || before.endsWith('\n');
    const prefix = atLineStart ? '' : '\n';
    const insert = `${prefix}${bulletFor(0)} `;
    const newValue = before + insert + after;
    const newCaret = start + insert.length;
    onChange(newValue);
    setSelection(el, newCaret, newCaret);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onToolbarNewBullet}
          className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          aria-label="New bullet"
        >
          {bulletFor(0)} New
        </button>
        <button
          type="button"
          onClick={() => onToolbarIndent(true)}
          className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          aria-label="Outdent"
        >
          ← Outdent
        </button>
        <button
          type="button"
          onClick={() => onToolbarIndent(false)}
          className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          aria-label="Indent"
        >
          → Indent
        </button>
      </div>
      <textarea
        ref={ref}
        className="input font-mono text-[14px] leading-relaxed"
        rows={minRows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

interface BulletMatch {
  indent: string;
  marker: string;
}

function matchBulletPrefix(line: string): BulletMatch | null {
  const m = line.match(/^(\s*)([●○◦]\s+|[-*+]\s+|\d+\.\s+)/);
  if (!m) return null;
  return { indent: m[1], marker: m[2] };
}

function nextMarker(marker: string): string {
  const numMatch = marker.match(/^(\d+)\.\s+$/);
  if (numMatch) return `${Number(numMatch[1]) + 1}. `;
  return marker;
}
