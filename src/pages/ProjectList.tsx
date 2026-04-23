import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { useClient } from '../context/ConfigContext';
import { archiveProject } from '../lib/archive';
import type { ProjectMeta } from '../lib/project';
import { exportProjectZip, importProjectZip, triggerDownload } from '../lib/projectIO';

export function ProjectList() {
  const { data, isLoading, error } = useProjects();
  const client = useClient();
  const qc = useQueryClient();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [exportingSlug, setExportingSlug] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleExport(project: ProjectMeta) {
    try {
      setExportingSlug(project.slug);
      const blob = await exportProjectZip(client, project.slug);
      triggerDownload(blob, `${project.slug}.zip`);
      setNotice(`Exported “${project.title || project.slug}” as .zip`);
    } catch (err) {
      alert((err as { message?: string })?.message ?? 'Export failed');
    } finally {
      setExportingSlug(null);
    }
  }

  async function handleImport(file: File) {
    try {
      setImportBusy(true);
      const result = await importProjectZip(client, file);
      qc.invalidateQueries({ queryKey: ['projects'] });
      setNotice(`Imported “${result.title}” as ${result.slug}`);
    } catch (err) {
      alert((err as { message?: string })?.message ?? 'Import failed');
    } finally {
      setImportBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <Layout
      title="Movie Planner"
      right={
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importBusy}
            title="Import a project .zip"
          >
            {importBusy ? 'Importing…' : 'Import'}
          </button>
          <Link to="/projects/new" className="btn-primary text-sm">+ New</Link>
        </div>
      }
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
              onExport={handleExport}
              busy={deletingSlug === p.slug}
              exporting={exportingSlug === p.slug}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
