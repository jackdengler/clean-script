import { useQuery } from '@tanstack/react-query';
import { useClient } from '../context/ConfigContext';
import { ROOT, projectMetaPath } from '../lib/paths';
import type { ProjectMeta } from '../lib/project';

export function useProjects() {
  const client = useClient();
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectMeta[]> => {
      const entries = await client.listDir(ROOT);
      const dirs = entries.filter((e) => e.type === 'dir');
      const metas = await Promise.all(
        dirs.map(async (d): Promise<ProjectMeta | null> => {
          const file = await client.getFile(projectMetaPath(d.name));
          if (!file) return null;
          try {
            const parsed = JSON.parse(file.content) as ProjectMeta;
            return { ...parsed, slug: d.name };
          } catch {
            return null;
          }
        }),
      );
      return metas
        .filter((m): m is ProjectMeta => m !== null)
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },
  });
}

export function useProject(slug: string | undefined) {
  const client = useClient();
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async (): Promise<ProjectMeta | null> => {
      if (!slug) return null;
      const file = await client.getFile(projectMetaPath(slug));
      if (!file) return null;
      return JSON.parse(file.content) as ProjectMeta;
    },
    enabled: !!slug,
  });
}
