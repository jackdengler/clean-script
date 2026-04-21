import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { FrontmatterForm } from '../../components/FrontmatterForm';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { useGithubFile, usePutFile, useDeleteFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { entityPath, scenesDir } from '../../lib/paths';
import { parseMarkdown, stringifyMarkdown, type Frontmatter } from '../../lib/markdown';
import { sceneSchema } from '../../lib/schemas';

export function SceneEditorTab() {
  const { slug = '', id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const filename = `${id}.md`;
  const path = entityPath(slug, 'scenes', filename);
  const { data, isLoading } = useGithubFile(path);
  const put = usePutFile();
  const del = useDeleteFile();

  const [fm, setFm] = useState<Frontmatter>({});
  const [body, setBody] = useState('');
  const [initial, setInitial] = useState<string | null>(null);

  useEffect(() => {
    if (data !== undefined && initial === null) {
      const parsed = parseMarkdown(data?.content ?? '');
      setFm(parsed.frontmatter);
      setBody(parsed.body);
      setInitial(stringifyMarkdown(parsed.frontmatter, parsed.body));
    }
  }, [data, initial]);

  const serialized = useMemo(() => stringifyMarkdown(fm, body), [fm, body]);

  const { state } = useDebouncedSave({
    value: serialized,
    initial,
    enabled: initial !== null,
    onSave: async (v) => {
      await put.mutateAsync({ path, content: v, message: `update scene ${id}` });
    },
  });

  async function handleDelete() {
    if (!confirm('Delete this scene? This removes the file from GitHub.')) return;
    try {
      await del.mutateAsync({ path, message: `remove scene ${id}` });
      qc.invalidateQueries({ queryKey: ['dir', scenesDir(slug)] });
      navigate(`/p/${slug}/scenes`);
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? 'Failed to delete');
    }
  }

  const sceneNumber = useMemo(() => {
    const m = id.match(/^(\d+)-/);
    return m ? m[1] : '';
  }, [id]);

  const title = useMemo(() => {
    return typeof fm.title === 'string' && fm.title ? fm.title : id.replace(/^\d+-/, '').replace(/-/g, ' ');
  }, [fm, id]);

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} />}>
      <div className="mb-2 text-sm text-neutral-500">
        Scene{sceneNumber && <> #{sceneNumber}</>}
      </div>
      <h1 className="text-xl font-bold mb-4 break-words">{title}</h1>

      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <>
          <section className="card mb-4">
            <FrontmatterForm schema={sceneSchema} value={fm} onChange={setFm} />
          </section>

          <section className="mb-6">
            <div className="label">Scene description / action</div>
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder="What happens? Beats, blocking, tone."
              minRows={14}
            />
          </section>

          <button className="btn-danger w-full" onClick={handleDelete}>Delete scene</button>
        </>
      )}
    </ProjectLayout>
  );
}
