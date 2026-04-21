import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { useClient } from '../context/ConfigContext';
import { archiveProject } from '../lib/archive';
import type { ProjectMeta } from '../lib/project';

export function ProjectList() {
  const { data, isLoading, error } = useProjects();
  const client = useClient();
  const qc = useQueryClient();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const del = useMutation({
    mutationFn: async (project: ProjectMeta) => {
      setDeletingSlug(project.slug);
      return archiveProject(client, project.slug);
    },
    onSuccess: (destPath, project) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setNotice(`Archived “${project.title}” to ${destPath}`);
      setDeletingSlug(null);
    },
    onError: (err: unknown) => {
      alert((err as { message?: string })?.message ?? 'Failed to archive project');
      setDeletingSlug(null);
    },
  });

  function handleDelete(project: ProjectMeta) {
    const name = project.title || project.slug;
    const ok = confirm(
      `Delete “${name}”?\n\n` +
        `The project folder will be moved to archive/ in your data repo so nothing is lost — you can restore it by moving the files back in GitHub.`,
    );
    if (!ok) return;
    del.mutate(project);
  }

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

      {notice && (
        <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 flex items-start gap-2">
          <div className="flex-1">{notice}</div>
          <button type="button" className="text-emerald-700 underline" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

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
          {data.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              onDelete={handleDelete}
              busy={deletingSlug === p.slug}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
