import { Link } from 'react-router-dom';
import type { ProjectMeta } from '../lib/project';

export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <Link
      to={`/p/${project.slug}/outline`}
      className="card hover:border-accent-400 transition-colors block"
    >
      <div className="font-semibold text-neutral-900">{project.title || project.slug}</div>
      {project.logline && (
        <div className="text-sm text-neutral-600 mt-1 line-clamp-3">{project.logline}</div>
      )}
      <div className="text-xs text-neutral-400 mt-2">
        Updated {formatDate(project.updatedAt)}
      </div>
    </Link>
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
