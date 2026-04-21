import { Octokit } from '@octokit/rest';
import type { AppConfig } from './storage';

export interface FileData {
  path: string;
  content: string;
  sha: string;
}

export interface DirEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
}

export class GithubClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;
  private basePath: string;

  constructor(config: AppConfig) {
    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch;
    this.basePath = (config.basePath ?? '').replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private absPath(path: string): string {
    const clean = path.replace(/^\/+/, '');
    return this.basePath ? `${this.basePath}/${clean}` : clean;
  }

  async getFile(path: string): Promise<FileData | null> {
    try {
      const res = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.absPath(path),
        ref: this.branch,
      });
      const data = res.data;
      if (Array.isArray(data) || data.type !== 'file') return null;
      const content = decodeBase64((data as { content: string }).content);
      return { path, content, sha: data.sha };
    } catch (err: unknown) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async putFile(path: string, content: string, message: string): Promise<void> {
    const existing = await this.getFile(path);
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: this.absPath(path),
      message,
      content: encodeBase64(content),
      branch: this.branch,
      sha: existing?.sha,
    });
  }

  async deleteFile(path: string, message: string): Promise<void> {
    const existing = await this.getFile(path);
    if (!existing) return;
    await this.octokit.repos.deleteFile({
      owner: this.owner,
      repo: this.repo,
      path: this.absPath(path),
      message,
      sha: existing.sha,
      branch: this.branch,
    });
  }

  async listDir(path: string): Promise<DirEntry[]> {
    try {
      const res = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.absPath(path),
        ref: this.branch,
      });
      if (!Array.isArray(res.data)) return [];
      const prefixLen = this.basePath ? this.basePath.length + 1 : 0;
      return res.data.map((item) => ({
        name: item.name,
        path: prefixLen ? item.path.slice(prefixLen) : item.path,
        type: item.type === 'dir' ? 'dir' : 'file',
        sha: item.sha,
      }));
    } catch (err: unknown) {
      if (isNotFound(err)) return [];
      throw err;
    }
  }

  async verify(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.octokit.repos.get({ owner: this.owner, repo: this.repo });
      return { ok: true, message: 'Connected.' };
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Unknown error';
      return { ok: false, message: msg };
    }
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { status?: number }).status === 404;
}

function encodeBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function decodeBase64(s: string): string {
  const clean = s.replace(/\n/g, '');
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
