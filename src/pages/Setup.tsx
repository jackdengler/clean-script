import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GithubClient } from '../lib/github';
import { useConfig } from '../context/ConfigContext';

export function Setup() {
  const { setConfig } = useConfig();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [basePath, setBasePath] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const config = {
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      basePath: basePath.trim().replace(/^\/+|\/+$/g, ''),
    };
    const client = new GithubClient(config);
    const result = await client.verify();
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }
    setConfig(config);
    navigate('/');
  }

  return (
    <div className="min-h-full px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Movie Planner</h1>
      <p className="text-sm text-neutral-600 mb-6">
        Your planning data lives in a GitHub repo you control. Connect once and you're set.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="owner">GitHub username / org</label>
          <input id="owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="yourname" required autoCapitalize="none" autoCorrect="off" />
        </div>
        <div>
          <label className="label" htmlFor="repo">Data repo name</label>
          <input id="repo" className="input" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="my-movies" required autoCapitalize="none" autoCorrect="off" />
          <p className="text-xs text-neutral-500 mt-1">Use an existing empty repo or the same repo as this app.</p>
        </div>
        <div>
          <label className="label" htmlFor="branch">Branch</label>
          <input id="branch" className="input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" />
        </div>
        <div>
          <label className="label" htmlFor="basePath">Folder (optional)</label>
          <input id="basePath" className="input" value={basePath} onChange={(e) => setBasePath(e.target.value)} placeholder="e.g. clean-script" autoCapitalize="none" autoCorrect="off" />
          <p className="text-xs text-neutral-500 mt-1">Store files in a subfolder of the repo. Leave blank to use the repo root.</p>
        </div>
        <div>
          <label className="label" htmlFor="token">Personal access token</label>
          <input id="token" className="input" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_..." required autoCapitalize="none" autoCorrect="off" />
          <p className="text-xs text-neutral-500 mt-1">
            Stored only on this device. Create a <strong>fine-grained PAT</strong> at{' '}
            <a className="text-accent-600 underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              github.com/settings/personal-access-tokens/new
            </a>{' '}
            with <em>Contents: Read and write</em> on this repo only.
          </p>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </div>
  );
}
