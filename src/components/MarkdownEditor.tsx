import { useRef, useState, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder, minRows = 14 }: Props) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter' || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start !== end) return;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = before.slice(lineStart);
    const bullet = matchBulletPrefix(currentLine);
    if (!bullet) return;

    const isEmpty = currentLine.trim() === bullet.marker.trim();
    if (isEmpty) {
      e.preventDefault();
      const newValue = before.slice(0, lineStart) + after;
      const newCaret = lineStart;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = newCaret;
      });
      return;
    }

    e.preventDefault();
    const insert = '\n' + bullet.indent + nextMarker(bullet.marker);
    const newValue = before + insert + after;
    const newCaret = start + insert.length;
    onChange(newValue);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = newCaret;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={`text-xs px-2 py-1 rounded ${mode === 'edit' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`text-xs px-2 py-1 rounded ${mode === 'preview' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`}
        >
          Preview
        </button>
      </div>
      {mode === 'edit' ? (
        <textarea
          ref={ref}
          className="input font-mono text-[14px] leading-relaxed"
          rows={minRows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="card prose-mobile min-h-[200px]">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <div className="text-neutral-400 italic">Nothing to preview yet.</div>
          )}
        </div>
      )}
    </div>
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
