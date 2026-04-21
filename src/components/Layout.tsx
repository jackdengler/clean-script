import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

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
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center gap-2 px-3 py-3">
          {back !== undefined && (
            <button
              type="button"
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              className="text-neutral-600 hover:text-neutral-900 text-sm px-1"
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
      <main className="flex-1 px-3 py-4 pb-24 max-w-2xl w-full mx-auto">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex justify-around py-2 text-xs">
        <Link to="/" className="text-neutral-700 px-4 py-1">🎬 Projects</Link>
        <Link to="/brainstorming" className="text-neutral-700 px-4 py-1">💡 Ideas</Link>
        <Link to="/settings" className="text-neutral-700 px-4 py-1">⚙️ Settings</Link>
      </nav>
    </div>
  );
}

export function SaveStatus({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  const label =
    state === 'saving' ? 'Saving…' :
    state === 'saved' ? 'Saved ✓' :
    state === 'error' ? 'Save failed' :
    '';
  const color =
    state === 'error' ? 'text-red-600' :
    state === 'saving' ? 'text-neutral-500' :
    'text-emerald-600';
  return <span className={`text-xs ${color}`}>{label}</span>;
}
