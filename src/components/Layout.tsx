import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';

interface LayoutProps {
  title: string;
  subtitle?: string;
  back?: string | true;
  right?: ReactNode;
  children: ReactNode;
  tabs?: ReactNode;
}

export function Layout({ title, subtitle, back, right, children, tabs }: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-full flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center gap-2 px-3 py-3">
          {back !== undefined && (
            <button
              type="button"
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              className="text-neutral-600 hover:text-neutral-900 text-sm px-1 rounded focus-visible:ring-2 focus-visible:ring-accent-500"
              aria-label="Back"
            >
              ← Back
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate font-semibold text-neutral-900">{title}</div>
            {subtitle && <div className="truncate text-xs text-neutral-500">{subtitle}</div>}
          </div>
          {right}
        </div>
        {tabs}
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 px-3 py-4 pb-24 max-w-2xl w-full mx-auto focus:outline-none">{children}</main>
      <nav aria-label="Primary" className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex justify-around py-2 text-xs">
        <Link to="/" aria-label="Projects" className="text-neutral-700 px-4 py-1 rounded">
          <span aria-hidden="true">🎬</span> Projects
        </Link>
        <Link to="/brainstorming" aria-label="Ideas" className="text-neutral-700 px-4 py-1 rounded">
          <span aria-hidden="true">💡</span> Ideas
        </Link>
        <Link to="/settings" aria-label="Settings" className="text-neutral-700 px-4 py-1 rounded">
          <span aria-hidden="true">⚙️</span> Settings
        </Link>
      </nav>
    </div>
  );
}

interface SaveStatusProps {
  state: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: number | null;
}

export function SaveStatus({ state, lastSavedAt }: SaveStatusProps) {
  const relative = useRelativeTime(lastSavedAt ?? null);
  const label =
    state === 'saving' ? 'Saving…' :
    state === 'error' ? 'Save failed' :
    state === 'saved' && relative ? `Saved ${relative}` :
    state === 'saved' ? 'Saved ✓' :
    '';
  const color =
    state === 'error' ? 'text-red-600' :
    state === 'saving' ? 'text-neutral-500' :
    state === 'saved' ? 'text-emerald-600' :
    'text-neutral-400';
  return (
    <span role="status" aria-live="polite" className={`text-xs tabular-nums ${color}`}>
      {label}
    </span>
  );
}

function useRelativeTime(ts: number | null): string {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (ts === null) return;
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, [ts]);
  if (ts === null) return '';
  const diff = Math.max(0, Math.round((now - ts) / 1000));
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.round(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString();
}
