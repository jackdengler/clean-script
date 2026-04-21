import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectLayout } from '../../components/ProjectLayout';
import { EntityList, type EntityListItem } from '../../components/EntityList';
import { VisualGrid, type VisualGridItem } from '../../components/VisualGrid';
import { useGithubDir } from '../../hooks/useGithubDir';
import { useClient } from '../../context/ConfigContext';
import { entityDir, entityPath, type EntityKind } from '../../lib/paths';
import { parseMarkdown, stringifyMarkdown } from '../../lib/markdown';
import { slugify } from '../../lib/slug';

interface Props {
  kind: EntityKind;
  singular: string;
  newButtonLabel?: string;
  emptyLabel: string;
  view?: 'list' | 'grid';
}

export function EntityListTab({ kind, singular, newButtonLabel, emptyLabel, view = 'list' }: Props) {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const dirPath = entityDir(slug, kind);
  const { data: entries, isLoading } = useGithubDir(dirPath);
  const client = useClient();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function createNew() {
    setBusy(true);
    try {
      const name = prompt(`Name the new ${singular}:`);
      if (!name) { setBusy(false); return; }
      const baseSlug = slugify(name);
      const filename = `${baseSlug}.md`;
      const body = stringifyMarkdown({ title: name }, '\n');
      await client.putFile(entityPath(slug, kind, filename), body, `add ${singular} ${name}`);
      qc.invalidateQueries({ queryKey: ['dir', dirPath] });
      navigate(`/p/${slug}/${kind}/${baseSlug}`);
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? 'Failed to create');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProjectLayout
      slug={slug}
      right={<button className="btn-primary text-sm" disabled={busy} onClick={createNew}>{newButtonLabel ?? `+ ${singular}`}</button>}
    >
      {isLoading ? <div className="text-sm text-neutral-500">Loading…</div> : (
        <EntityBodies slug={slug} kind={kind} files={entries ?? []} view={view} emptyLabel={emptyLabel} />
      )}
    </ProjectLayout>
  );
}

function EntityBodies({
  slug,
  kind,
  files,
  view,
  emptyLabel,
}: {
  slug: string;
  kind: EntityKind;
  files: { name: string; path: string; type: 'file' | 'dir' }[];
  view: 'list' | 'grid';
  emptyLabel: string;
}) {
  const mdFiles = useMemo(() => files.filter((f) => f.type === 'file' && f.name.endsWith('.md')), [files]);
  const client = useClient();

  // Fetch each file lazily for preview; for simplicity we load filenames only and show title from slug.
  // We fetch a handful of fields by reading the files in parallel.
  const [enriched, setEnriched] = useState<Record<string, { title: string; subtitle?: string; image?: string }>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result: Record<string, { title: string; subtitle?: string; image?: string }> = {};
      await Promise.all(
        mdFiles.map(async (f) => {
          const file = await client.getFile(f.path);
          if (!file) return;
          const { frontmatter } = parseMarkdown(file.content);
          const title = typeof frontmatter.title === 'string' && frontmatter.title
            ? frontmatter.title
            : typeof frontmatter.name === 'string' && frontmatter.name
              ? frontmatter.name
              : deSlug(f.name.replace(/\.md$/, ''));
          let subtitle: string | undefined;
          if (kind === 'characters') {
            const role = typeof frontmatter.role === 'string' ? frontmatter.role : '';
            const arc = typeof frontmatter.arc === 'string' ? frontmatter.arc : '';
            subtitle = [role, arc].filter(Boolean).join(' — ') || undefined;
          } else if (kind === 'locations') {
            subtitle = typeof frontmatter.category === 'string' ? frontmatter.category : undefined;
          } else if (kind === 'music') {
            const artist = typeof frontmatter.artist === 'string' ? frontmatter.artist : '';
            const cue = typeof frontmatter.cue === 'string' ? frontmatter.cue : '';
            subtitle = [artist, cue].filter(Boolean).join(' · ') || undefined;
          } else if (kind === 'scenes') {
            subtitle = typeof frontmatter.location === 'string' ? frontmatter.location : undefined;
          }
          const image = typeof frontmatter.image === 'string' ? frontmatter.image : undefined;
          result[f.name] = { title, subtitle, image };
        }),
      );
      if (!cancelled) setEnriched(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [mdFiles, client, kind]);

  if (mdFiles.length === 0) {
    return <div className="text-sm text-neutral-500 italic py-4">{emptyLabel}</div>;
  }

  if (view === 'grid') {
    const items: VisualGridItem[] = mdFiles.map((f) => {
      const id = f.name.replace(/\.md$/, '');
      const info = enriched[f.name];
      return { id, title: info?.title ?? deSlug(id), image: info?.image };
    });
    return <VisualGrid slug={slug} items={items} />;
  }

  const items: EntityListItem[] = mdFiles.map((f) => {
    const id = f.name.replace(/\.md$/, '');
    const info = enriched[f.name];
    return {
      id,
      title: info?.title ?? deSlug(id),
      subtitle: info?.subtitle,
      image: info?.image,
    };
  });
  return <EntityList slug={slug} kind={kind} items={items} emptyLabel={emptyLabel} />;
}

function deSlug(s: string): string {
  return s.replace(/^\d+-/, '').replace(/-/g, ' ');
}
