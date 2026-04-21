import type { GithubClient } from './github';
import { archiveProjectDir, projectDir } from './paths';

export function archiveTimestamp(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    '-' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

export async function archiveProject(client: GithubClient, slug: string): Promise<string> {
  const src = projectDir(slug);
  const stamp = archiveTimestamp();
  const dest = archiveProjectDir(slug, stamp);

  const files = await client.listDirRecursive(src);
  if (files.length === 0) {
    throw new Error(`Project folder ${src} is empty or missing.`);
  }

  for (const entry of files) {
    const rel = entry.path.slice(src.length + 1);
    const destPath = `${dest}/${rel}`;
    const file = await client.getFile(entry.path);
    if (!file) continue;
    await client.putFile(destPath, file.content, `archive ${slug}: copy ${rel}`);
    await client.deleteFile(entry.path, `archive ${slug}: remove ${rel}`);
  }

  return dest;
}
