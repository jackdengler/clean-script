import { useEffect, useMemo, useRef, useState } from 'react';
import { RichEditor } from './RichEditor';
import { newSection, parseSections, preview, serializeDoc, type Section } from '../lib/sections';

interface Props {
  value: string;
  onChange: (md: string) => void;
  reorderable?: boolean;
  addLabel?: string;
  itemLabel?: string;
  emptyHint?: string;
}

export function SectionedList({
  value,
  onChange,
  reorderable = true,
  addLabel = 'Add entry',
  itemLabel = 'entry',
  emptyHint,
}: Props) {
  // Parse the markdown into sections once per incoming value change. We keep
  // the parsed sections in state so editing a single card doesn't force a
  // full re-parse (which would churn ids and collapse expanded cards).
  const [state, setState] = useState(() => parseSections(value));
  const lastSerializedRef = useRef(value);

  useEffect(() => {
    if (value !== lastSerializedRef.current) {
      setState(parseSections(value));
      lastSerializedRef.current = value;
    }
  }, [value]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function commit(next: typeof state) {
    setState(next);
    const md = serializeDoc(next);
    lastSerializedRef.current = md;
    onChange(md);
  }

  function update(id: string, patch: Partial<Section>) {
    commit({
      ...state,
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function remove(id: string) {
    if (!confirm(`Delete this ${itemLabel}?`)) return;
    commit({ ...state, sections: state.sections.filter((s) => s.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = state.sections.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= state.sections.length) return;
    const next = state.sections.slice();
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    commit({ ...state, sections: next });
  }

  function moveTo(id: string, targetIndex: number) {
    const idx = state.sections.findIndex((s) => s.id === id);
    if (idx < 0 || idx === targetIndex) return;
    const next = state.sections.slice();
    const [item] = next.splice(idx, 1);
    const insertAt = targetIndex > idx ? targetIndex - 1 : targetIndex;
    next.splice(insertAt, 0, item);
    commit({ ...state, sections: next });
  }

  function addNew() {
    const s = newSection(`New ${itemLabel}`);
    commit({ ...state, sections: [...state.sections, s] });
    setExpandedId(s.id);
  }

  const count = state.sections.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          {count} {count === 1 ? itemLabel : `${itemLabel}s`}
        </div>
        <button type="button" className="btn-primary" onClick={addNew}>
          + {addLabel}
        </button>
      </div>

      {count === 0 && (
        <div className="card text-sm text-neutral-500">
          {emptyHint ?? `No ${itemLabel}s yet. Tap "${addLabel}" to start.`}
        </div>
      )}

      <ul className="space-y-2">
        {state.sections.map((s, i) => {
          const isExpanded = expandedId === s.id;
          const isDragging = dragId === s.id;
          return (
            <li
              key={s.id}
              className={`card p-0 overflow-hidden transition-opacity ${isDragging ? 'opacity-40' : ''}`}
              onDragOver={(e) => {
                if (!reorderable || !dragId || dragId === s.id) return;
                e.preventDefault();
              }}
              onDrop={(e) => {
                if (!reorderable || !dragId) return;
                e.preventDefault();
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const after = e.clientY - rect.top > rect.height / 2;
                moveTo(dragId, after ? i + 1 : i);
                setDragId(null);
              }}
            >
              <div className="flex items-start gap-1 p-3">
                {reorderable && (
                  <button
                    type="button"
                    aria-label={`Drag to reorder ${s.title || itemLabel}`}
                    className="hidden sm:flex shrink-0 text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing px-1 py-1 select-none"
                    draggable
                    onDragStart={(e) => {
                      setDragId(s.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </button>
                )}
                <button
                  type="button"
                  className="flex-1 text-left min-w-0"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="font-medium text-neutral-900 truncate">
                    {s.title || <span className="text-neutral-400">Untitled</span>}
                  </div>
                  {!isExpanded && (
                    <div className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                      {preview(s.body) || <span className="text-neutral-300">Empty — tap to add notes</span>}
                    </div>
                  )}
                </button>
                {reorderable && (
                  <div className="flex sm:hidden flex-col shrink-0">
                    <button
                      type="button"
                      aria-label="Move up"
                      className="text-neutral-500 hover:text-neutral-900 px-2 py-0.5 text-sm disabled:opacity-30"
                      onClick={() => move(s.id, -1)}
                      disabled={i === 0}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      className="text-neutral-500 hover:text-neutral-900 px-2 py-0.5 text-sm disabled:opacity-30"
                      onClick={() => move(s.id, 1)}
                      disabled={i === state.sections.length - 1}
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
              {isExpanded && (
                <ExpandedSectionEditor
                  section={s}
                  onTitleChange={(title) => update(s.id, { title })}
                  onBodyChange={(body) => update(s.id, { body })}
                  onClose={() => setExpandedId(null)}
                  onDelete={() => remove(s.id)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ExpandedProps {
  section: Section;
  onTitleChange: (t: string) => void;
  onBodyChange: (b: string) => void;
  onClose: () => void;
  onDelete: () => void;
}

function ExpandedSectionEditor({ section, onTitleChange, onBodyChange, onClose, onDelete }: ExpandedProps) {
  // RichEditor is keyed by section id so it fully remounts per entry.
  const key = useMemo(() => section.id, [section.id]);
  return (
    <div className="border-t border-neutral-100 px-3 pb-3 pt-3 bg-neutral-50">
      <label className="label" htmlFor={`title-${section.id}`}>Title</label>
      <input
        id={`title-${section.id}`}
        className="input mb-3"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <label className="label">Notes</label>
      <RichEditor
        key={key}
        value={section.body}
        onChange={onBodyChange}
        placeholder="Details, beats, notes…"
      />
      <div className="mt-3 flex items-center justify-between">
        <button type="button" className="btn-danger" onClick={onDelete}>Delete</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
