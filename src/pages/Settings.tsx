import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
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

        <button className="btn-danger w-full" onClick={disconnect}>Disconnect</button>

        <section className="card text-sm text-neutral-600">
          <h2 className="font-semibold text-neutral-900 mb-2">About</h2>
          <p>Everything you write is stored as Markdown + JSON files in your GitHub repo. You can view or edit them directly at github.com.</p>
        </section>
      </div>
    </Layout>
  );
}
