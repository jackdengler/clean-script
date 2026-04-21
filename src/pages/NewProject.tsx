import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { useClient } from '../context/ConfigContext';
import { slugify } from '../lib/slug';
import { TEMPLATES, templateById, type TemplateId } from '../lib/templates';
import { newProjectMeta } from '../lib/project';
import { ROOT, projectMetaPath, outlinePath, projectBrainstormPath } from '../lib/paths';
import { uniqueSlugInDir } from '../lib/unique';

export function NewProject() {
  const navigate = useNavigate();
  const client = useClient();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [template, setTemplate] = useState<TemplateId>('three-act');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const slug = await uniqueSlugInDir(client, ROOT, slugify(title));
      const meta = newProjectMeta({ slug, title, logline, template });
      const tpl = templateById(template);
      await client.putFile(projectMetaPath(slug), JSON.stringify(meta, null, 2) + '\n', `create project ${slug}`);
      await client.putFile(outlinePath(slug), tpl.body, `seed outline for ${slug}`);
      await client.putFile(projectBrainstormPath(slug), '', `init brainstorming for ${slug}`);
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/p/${slug}/outline`);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Failed to create project');
      setBusy(false);
    }
  }

  return (
    <Layout title="New Project" back="/">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Masterpiece" />
        </div>
        <div>
          <label className="label" htmlFor="logline">Logline</label>
          <textarea id="logline" className="input" rows={3} value={logline} onChange={(e) => setLogline(e.target.value)} placeholder="One sentence: who wants what, and what's in the way." />
        </div>
        <div>
          <label className="label">Outline template</label>
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <label key={t.id} className={`card flex items-start gap-3 cursor-pointer ${template === t.id ? 'border-accent-500 ring-2 ring-accent-200' : ''}`}>
                <input
                  type="radio"
                  name="template"
                  className="mt-1"
                  checked={template === t.id}
                  onChange={() => setTemplate(t.id)}
                />
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{t.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

        <button type="submit" className="btn-primary w-full" disabled={busy || !title.trim()}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </form>
    </Layout>
  );
}
