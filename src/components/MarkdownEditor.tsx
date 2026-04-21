import { useRef, type KeyboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}

const INDENT = '  ';

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
      el.selectionStart = start;
      el.selectionEnd = end;
    });
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
      // Seed a bullet on an empty first line so everything stays bulleted.
      if (value.trim() === '') {
        e.preventDefault();
        const insert = '- ';
        const newValue = insert + '\n- ';
        onChange(newValue);
        setSelection(el, newValue.length, newValue.length);
      }
      return;
    }

    const isEmpty = currentLine.trim() === bullet.marker.trim();
    if (isEmpty) {
      e.preventDefault();
      if (bullet.indent.length >= INDENT.length) {
        const newIndent = bullet.indent.slice(INDENT.length);
        const newLine = newIndent + bullet.marker;
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
    const insert = '\n' + bullet.indent + nextMarker(bullet.marker);
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

  return (
    <textarea
      ref={ref}
      className="input font-mono text-[14px] leading-relaxed"
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}

interface BulletMatch {
  indent: string;
  marker: string;
}

function matchBulletPrefix(line: string): BulletMatch | null {
  const m = line.match(/^(\s*)([-*+]\s+|\d+\.\s+)/);
  if (!m) return null;
  return { indent: m[1], marker: m[2] };
}

function nextMarker(marker: string): string {
  const numMatch = marker.match(/^(\d+)\.\s+$/);
  if (numMatch) return `${Number(numMatch[1]) + 1}. `;
  return marker;
}
