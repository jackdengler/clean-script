import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useConfig, useClient } from '../context/ConfigContext';
import { Layout } from '../components/Layout';

export function Settings() {
  const { config, clear } = useConfig();
  const navigate = useNavigate();

  function disconnect() {
    if (confirm('Disconnect? Your token will be removed from this device. Your data in the GitHub repo stays intact.')) {
      clear();
      navigate('/setup');
    }
  }

  return (
    <Layout title="Settings" back="/">
      <div className="space-y-4">
        <section className="card">
          <h2 className="font-semibold mb-2">Connection</h2>
          {config ? (
            <dl className="text-sm space-y-1">
              <div className="flex justify-between"><dt className="text-neutral-500">Owner</dt><dd>{config.owner}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Repo</dt><dd>{config.repo}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Branch</dt><dd>{config.branch}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Folder</dt><dd>{config.basePath || '(root)'}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Token</dt><dd>•••• stored on device</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-neutral-500">Not connected.</p>
          )}
        </section>

        {config && <RateLimitCard />}

        <button className="btn-danger w-full" onClick={disconnect}>Disconnect</button>

        <section className="card text-sm text-neutral-600">
          <h2 className="font-semibold text-neutral-900 mb-2">About</h2>
          <p>Everything you write is stored as Markdown + JSON files in your GitHub repo. You can view or edit them directly at github.com.</p>
        </section>
      </div>
    </Layout>
  );
}

function RateLimitCard() {
  const client = useClient();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['rateLimit'],
    queryFn: () => client.getRateLimit(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const used = data ? data.limit - data.remaining : 0;
  const pct = data ? Math.round((data.remaining / Math.max(data.limit, 1)) * 100) : 0;
  const lowHint = data ? data.remaining < Math.max(100, data.limit * 0.1) : false;
  const barColor = lowHint ? 'bg-red-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500';
  const resetDate = data ? new Date(data.reset * 1000) : null;

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">GitHub API</h2>
        <button
          type="button"
          className="text-xs text-accent-600 hover:underline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-neutral-500">Checking rate limit…</p>
      ) : !data ? (
        <p className="text-sm text-neutral-500">Rate limit unavailable.</p>
      ) : (
        <>
          <div className="text-sm flex justify-between mb-1">
            <span className="text-neutral-500">Remaining</span>
            <span className="tabular-nums">
              {data.remaining.toLocaleString()} / {data.limit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-neutral-100 rounded overflow-hidden" role="progressbar" aria-valuenow={data.remaining} aria-valuemin={0} aria-valuemax={data.limit}>
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-neutral-500 mt-2 flex justify-between">
            <span>{used.toLocaleString()} used this hour</span>
            {resetDate && <span>Resets {resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
          {lowHint && (
            <p className="text-xs text-red-600 mt-2">
              Running low — saves may start failing. Wait for reset or reduce activity.
            </p>
          )}
        </>
      )}
    </section>
  );
}
