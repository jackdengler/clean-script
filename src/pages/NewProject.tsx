import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { useClient } from '../context/ConfigContext';
import { slugify } from '../lib/slug';
import {
  charactersTemplate,
  locationsTemplate,
  musicTemplate,
  scenesTemplate,
} from '../lib/tabTemplates';
import { newProjectMeta } from '../lib/project';
import {
  ROOT,
  charactersPath,
  locationsPath,
  musicPath,
  projectBrainstormPath,
  projectMetaPath,
  scenesPath,
} from '../lib/paths';
import { uniqueSlugInDir } from '../lib/unique';

export function NewProject() {
  const navigate = useNavigate();
  const client = useClient();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const slug = await uniqueSlugInDir(client, ROOT, slugify(title));
      const meta = newProjectMeta({ slug, title, logline });
      const msg = `create project ${slug}`;
      await client.putFile(projectMetaPath(slug), JSON.stringify(meta, null, 2) + '\n', msg);
      await client.putFile(projectBrainstormPath(slug), '', msg);
      await client.putFile(charactersPath(slug), charactersTemplate, msg);
      await client.putFile(scenesPath(slug), scenesTemplate, msg);
      await client.putFile(locationsPath(slug), locationsTemplate, msg);
      await client.putFile(musicPath(slug), musicTemplate, msg);
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/p/${slug}/brainstorming`);
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

        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

        <button type="submit" className="btn-primary w-full" disabled={busy || !title.trim()}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </form>
    </Layout>
  );
}
