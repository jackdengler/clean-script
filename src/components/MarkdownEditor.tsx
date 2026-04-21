import { useState } from 'react';
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
          className="input font-mono text-[14px] leading-relaxed"
          rows={minRows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
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
