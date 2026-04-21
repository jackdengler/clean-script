import type { GithubClient } from './github';

export async function uniqueSlugInDir(
  client: GithubClient,
  dir: string,
  baseSlug: string,
): Promise<string> {
  const entries = await client.listDir(dir);
  const taken = new Set(entries.filter((e) => e.type === 'dir').map((e) => e.name));
  if (!taken.has(baseSlug)) return baseSlug;
  let i = 2;
  while (taken.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

export async function uniqueFilenameInDir(
  client: GithubClient,
  dir: string,
  baseSlug: string,
  ext = '.md',
): Promise<string> {
  const entries = await client.listDir(dir);
  const taken = new Set(entries.filter((e) => e.type === 'file').map((e) => e.name));
  const first = `${baseSlug}${ext}`;
  if (!taken.has(first)) return first;
  let i = 2;
  while (taken.has(`${baseSlug}-${i}${ext}`)) i++;
  return `${baseSlug}-${i}${ext}`;
}
