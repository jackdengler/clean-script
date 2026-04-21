import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';

export function ProjectList() {
  const { data, isLoading, error } = useProjects();

  return (
    <Layout
      title="Movie Planner"
      right={<Link to="/projects/new" className="btn-primary text-sm">+ New</Link>}
    >
      <Link
        to="/brainstorming"
        className="card block mb-4 bg-accent-50 border-accent-200 hover:border-accent-400"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-semibold text-neutral-900">General Brainstorming</div>
            <div className="text-xs text-neutral-600">Ideas floating before they become a project</div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Your Movies</h2>
      </div>

      {isLoading && <div className="text-sm text-neutral-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">Failed to load: {(error as Error).message}</div>}
      {data && data.length === 0 && (
        <div className="card text-center py-8">
          <div className="text-3xl mb-2">🎬</div>
          <div className="font-medium">No movies yet</div>
          <p className="text-sm text-neutral-500 mt-1 mb-3">Start your first project.</p>
          <Link to="/projects/new" className="btn-primary">Create project</Link>
        </div>
      )}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </div>
      )}
    </Layout>
  );
}
