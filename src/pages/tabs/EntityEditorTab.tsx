import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { FrontmatterForm } from '../../components/FrontmatterForm';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { useGithubFile, usePutFile, useDeleteFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { entityDir, entityPath, type EntityKind } from '../../lib/paths';
import { parseMarkdown, stringifyMarkdown, type Frontmatter } from '../../lib/markdown';
import { characterSchema, locationSchema, musicSchema, visualSchema, type FieldSchema } from '../../lib/schemas';

interface Props {
  kind: Exclude<EntityKind, 'scenes'>;
  singular: string;
  bodyLabel?: string;
  bodyPlaceholder?: string;
}

const SCHEMAS: Record<Props['kind'], FieldSchema[]> = {
  characters: characterSchema,
  locations: locationSchema,
  visuals: visualSchema,
  music: musicSchema,
};

export function EntityEditorTab({ kind, singular, bodyLabel = 'Notes', bodyPlaceholder }: Props) {
  const { slug = '', id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const filename = `${id}.md`;
  const path = entityPath(slug, kind, filename);
  const schema = SCHEMAS[kind];
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
      await put.mutateAsync({ path, content: v, message: `update ${singular} ${id}` });
    },
  });

  async function handleDelete() {
    if (!confirm(`Delete this ${singular}? This removes the file from GitHub.`)) return;
    try {
      await del.mutateAsync({ path, message: `remove ${singular} ${id}` });
      qc.invalidateQueries({ queryKey: ['dir', entityDir(slug, kind)] });
      navigate(`/p/${slug}/${kind}`);
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? 'Failed to delete');
    }
  }

  const title = useMemo(() => {
    const t = fm.title ?? fm.name;
    return typeof t === 'string' && t ? t : id;
  }, [fm, id]);

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} />}>
      <div className="mb-2 text-sm text-neutral-500">{singular}</div>
      <h1 className="text-xl font-bold mb-4 break-words">{title}</h1>

      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <>
          <section className="card mb-4">
            <FrontmatterForm schema={schema} value={fm} onChange={setFm} />
          </section>

          {kind === 'visuals' && typeof fm.image === 'string' && fm.image && (
            <section className="card mb-4">
              <div className="label">Preview</div>
              <img src={fm.image} alt={title} className="w-full rounded-md bg-neutral-100" />
            </section>
          )}

          <section className="mb-6">
            <div className="label">{bodyLabel}</div>
            <MarkdownEditor value={body} onChange={setBody} placeholder={bodyPlaceholder} minRows={10} />
          </section>

          <button className="btn-danger w-full" onClick={handleDelete}>
            Delete {singular}
          </button>
        </>
      )}
    </ProjectLayout>
  );
}
