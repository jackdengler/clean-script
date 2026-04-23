import JSZip from 'jszip';
import type { GithubClient } from './github';
import { projectDir, projectMetaPath, ROOT } from './paths';
import { newProjectMeta, type ProjectMeta } from './project';
import { slugify } from './slug';
import { uniqueSlugInDir } from './unique';

export async function exportProjectZip(
  client: GithubClient,
  slug: string,
): Promise<Blob> {
  const dir = projectDir(slug);
  const files = await client.listDirRecursive(dir);
  const zip = new JSZip();
  const prefix = dir + '/';

  for (const f of files) {
    const file = await client.getFile(f.path);
    if (!file) continue;
    const rel = f.path.startsWith(prefix) ? f.path.slice(prefix.length) : f.path;
    zip.file(rel, file.content);
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function importProjectZip(
  client: GithubClient,
  fileBlob: File,
): Promise<{ slug: string; title: string }> {
  const zip = await JSZip.loadAsync(fileBlob);
  const entries = Object.values(zip.files).filter((f) => !f.dir);
  if (entries.length === 0) throw new Error('Zip is empty.');

  const metaEntry = entries.find((e) => e.name === 'project.json' || e.name.endsWith('/project.json'));
  let meta: ProjectMeta;
  let title: string;
  if (metaEntry) {
    const raw = await metaEntry.async('string');
    const parsed = JSON.parse(raw) as ProjectMeta;
    title = parsed.title || parsed.slug || 'Imported project';
    meta = { ...parsed, title };
  } else {
    title = fileBlob.name.replace(/\.zip$/i, '') || 'Imported project';
    meta = newProjectMeta({ slug: slugify(title), title, logline: '' });
  }

  const slug = await uniqueSlugInDir(client, ROOT, slugify(title));
  meta.slug = slug;
  const now = new Date().toISOString();
  meta.updatedAt = now;
  if (!meta.createdAt) meta.createdAt = now;

  const msg = `import project ${slug}`;
  await client.putFile(projectMetaPath(slug), JSON.stringify(meta, null, 2) + '\n', msg);

  // Strip a leading directory if the zip wraps files in a project folder.
  const commonPrefix = detectCommonPrefix(entries.map((e) => e.name));

  for (const e of entries) {
    let rel = e.name;
    if (commonPrefix && rel.startsWith(commonPrefix)) rel = rel.slice(commonPrefix.length);
    if (!rel || rel === 'project.json') continue;
    const content = await e.async('string');
    await client.putFile(`${projectDir(slug)}/${rel}`, content, msg);
  }

  return { slug, title };
}

function detectCommonPrefix(names: string[]): string | null {
  if (names.length === 0) return null;
  const first = names[0];
  const idx = first.indexOf('/');
  if (idx < 0) return null;
  const candidate = first.slice(0, idx + 1);
  return names.every((n) => n.startsWith(candidate)) ? candidate : null;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
