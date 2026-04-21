import { Link } from 'react-router-dom';
import type { ProjectMeta } from '../lib/project';

interface Props {
  project: ProjectMeta;
  onDelete?: (project: ProjectMeta) => void;
  busy?: boolean;
}

export function ProjectCard({ project, onDelete, busy }: Props) {
  return (
    <div className="card relative hover:border-accent-400 transition-colors">
      <Link to={`/p/${project.slug}/brainstorming`} className="block pr-10">
        <div className="font-semibold text-neutral-900">{project.title || project.slug}</div>
        {project.logline && (
          <div className="text-sm text-neutral-600 mt-1 line-clamp-3">{project.logline}</div>
        )}
        <div className="text-xs text-neutral-400 mt-2">
          Updated {formatDate(project.updatedAt)}
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-red-600 disabled:opacity-40"
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
