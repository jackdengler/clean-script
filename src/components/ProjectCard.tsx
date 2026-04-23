import { Link } from 'react-router-dom';
import type { ProjectMeta } from '../lib/project';

interface Props {
  project: ProjectMeta;
  onDelete?: (project: ProjectMeta) => void;
  onExport?: (project: ProjectMeta) => void;
  busy?: boolean;
  exporting?: boolean;
}

export function ProjectCard({ project, onDelete, onExport, busy, exporting }: Props) {
  return (
    <div className="card relative hover:border-accent-400 transition-colors">
      <Link to={`/p/${project.slug}/brainstorming`} className="block pr-16">
        <div className="font-semibold text-neutral-900">{project.title || project.slug}</div>
        {project.logline && (
          <div className="text-sm text-neutral-600 mt-1 line-clamp-3">{project.logline}</div>
        )}
        <div className="text-xs text-neutral-400 mt-2">
          Updated {formatDate(project.updatedAt)}
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex gap-0.5">
        {onExport && (
          <button
            type="button"
            className="p-2 text-neutral-400 hover:text-accent-600 disabled:opacity-40"
            aria-label={`Export ${project.title || project.slug}`}
            disabled={exporting}
            title="Export as .zip"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onExport(project);
            }}
          >
            {exporting ? '…' : '⬇'}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-40"
            aria-label={`Delete ${project.title || project.slug}`}
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(project);
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
