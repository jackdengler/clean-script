import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SceneReorderList, type SceneListItem } from '../../components/SceneReorderList';
import { useGithubDir } from '../../hooks/useGithubDir';
import { useClient } from '../../context/ConfigContext';
import { scenesDir, entityPath } from '../../lib/paths';
import { parseMarkdown, stringifyMarkdown } from '../../lib/markdown';
import { pad3, sceneFilename, slugify } from '../../lib/slug';

export function ScenesTab() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const client = useClient();
  const qc = useQueryClient();

  const dirPath = scenesDir(slug);
  const { data: entries, isLoading } = useGithubDir(dirPath);

  const [items, setItems] = useState<SceneListItem[]>([]);
  const [loadedFiles, setLoadedFiles] = useState(false);
  const [busy, setBusy] = useState(false);

  const mdFiles = useMemo(
    () => (entries ?? []).filter((f) => f.type === 'file' && f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name)),
    [entries],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadedFiles(false);
      const result: SceneListItem[] = [];
      for (const f of mdFiles) {
        const file = await client.getFile(f.path);
        const parsed = parseMarkdown(file?.content ?? '');
        const orderMatch = f.name.match(/^(\d+)-/);
        const order = orderMatch ? Number(orderMatch[1]) : 0;
        const id = f.name.replace(/\.md$/, '');
        const title = typeof parsed.frontmatter.title === 'string' && parsed.frontmatter.title
          ? parsed.frontmatter.title
          : id.replace(/^\d+-/, '').replace(/-/g, ' ');
        const location = typeof parsed.frontmatter.location === 'string' ? parsed.frontmatter.location : undefined;
        result.push({ id, filename: f.name, order, title, location });
      }
      if (!cancelled) {
        setItems(result);
        setLoadedFiles(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mdFiles, client]);

  async function createScene() {
    const title = prompt('Scene title:');
    if (!title) return;
    setBusy(true);
    try {
      const nextOrder = items.length + 1;
      const filename = sceneFilename(nextOrder, title);
      const content = stringifyMarkdown({ title, number: nextOrder }, '\n');
      await client.putFile(entityPath(slug, 'scenes', filename), content, `add scene ${title}`);
      qc.invalidateQueries({ queryKey: ['dir', dirPath] });
      navigate(`/p/${slug}/scenes/${filename.replace(/\.md$/, '')}`);
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? 'Failed to create scene');
    } finally {
      setBusy(false);
    }
  }

  async function handleReorder(next: SceneListItem[]) {
    setItems(next);
    setBusy(true);
    try {
      const moves: { oldFilename: string; newFilename: string; content: string }[] = [];
      for (let i = 0; i < next.length; i++) {
        const item = next[i];
        const newOrder = i + 1;
        const expectedPrefix = pad3(newOrder);
        const currentPrefix = item.filename.match(/^\d+/)?.[0];
        if (currentPrefix === expectedPrefix) continue;
        const file = await client.getFile(entityPath(slug, 'scenes', item.filename));
        if (!file) continue;
        const parsed = parseMarkdown(file.content);
        parsed.frontmatter.number = newOrder;
        const newFilename = `${expectedPrefix}-${slugify(item.title)}.md`;
        moves.push({
          oldFilename: item.filename,
          newFilename,
          content: stringifyMarkdown(parsed.frontmatter, parsed.body),
        });
        next[i] = { ...item, filename: newFilename, order: newOrder, id: newFilename.replace(/\.md$/, '') };
      }
      for (const m of moves) {
        await client.deleteFile(entityPath(slug, 'scenes', m.oldFilename), `reorder: remove ${m.oldFilename}`);
      }
      for (const m of moves) {
        await client.putFile(entityPath(slug, 'scenes', m.newFilename), m.content, `reorder: add ${m.newFilename}`);
      }
      setItems([...next]);
      qc.invalidateQueries({ queryKey: ['dir', dirPath] });
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? 'Reorder failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProjectLayout
      slug={slug}
      right={<button className="btn-primary text-sm" disabled={busy} onClick={createScene}>+ Scene</button>}
    >
      {isLoading || !loadedFiles ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-neutral-500 italic py-4">No scenes yet. Tap “+ Scene” to add one.</div>
      ) : (
        <>
          <p className="text-xs text-neutral-500 mb-3">Drag ⋮⋮ to reorder.</p>
          <SceneReorderList slug={slug} items={items} onReorder={handleReorder} />
        </>
      )}
    </ProjectLayout>
  );
}
