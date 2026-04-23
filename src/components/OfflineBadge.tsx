import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus, useQueueSize } from '../hooks/useOnlineStatus';
import { useConfig } from '../context/ConfigContext';
import { flushQueue } from '../lib/offlineQueue';

export function OfflineBadge() {
  const online = useOnlineStatus();
  const pending = useQueueSize();
  const { client } = useConfig();
  const qc = useQueryClient();

  useEffect(() => {
    if (!online || !client || pending === 0) return;
    let cancelled = false;
    (async () => {
      const result = await flushQueue(client);
      if (!cancelled && result.flushed > 0) {
        qc.invalidateQueries();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [online, client, pending, qc]);

  if (online && pending === 0) return null;

  const label = !online
    ? pending > 0
      ? `Offline · ${pending} pending`
      : 'Offline'
    : `Syncing ${pending}…`;
  const color = !online ? 'bg-amber-500' : 'bg-accent-600';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 -translate-x-1/2 top-2 z-40 ${color} text-white text-xs font-medium px-3 py-1 rounded-full shadow`}
    >
      {label}
    </div>
  );
}
