import type { GithubClient } from './github';

export interface QueuedWrite {
  id: string;
  kind: 'put' | 'delete';
  path: string;
  content?: string;
  message: string;
  createdAt: number;
}

const STORAGE_KEY = 'offline-queue-v1';

export function loadQueue(): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedWrite[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
    notify();
  } catch {
    // ignore storage errors
  }
}

export function enqueue(entry: Omit<QueuedWrite, 'id' | 'createdAt'>): QueuedWrite {
  const queue = loadQueue();
  // For put operations on the same path, replace the existing entry — we only
  // care about the latest content, not every keystroke that happened offline.
  const filtered = entry.kind === 'put'
    ? queue.filter((q) => !(q.kind === 'put' && q.path === entry.path))
    : queue;
  const item: QueuedWrite = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  filtered.push(item);
  saveQueue(filtered);
  return item;
}

export function queueSize(): number {
  return loadQueue().length;
}

export function clearQueue(): void {
  saveQueue([]);
}

export async function flushQueue(client: GithubClient): Promise<{ flushed: number; remaining: number }> {
  let queue = loadQueue();
  let flushed = 0;
  while (queue.length > 0) {
    const [next, ...rest] = queue;
    try {
      if (next.kind === 'put') {
        await client.putFile(next.path, next.content ?? '', next.message);
      } else {
        await client.deleteFile(next.path, next.message);
      }
      queue = rest;
      saveQueue(queue);
      flushed += 1;
    } catch {
      // Stop on first failure — preserve order and try again later.
      return { flushed, remaining: queue.length };
    }
  }
  return { flushed, remaining: 0 };
}

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => {
    try { l(); } catch { /* ignore */ }
  });
}
export function subscribeQueue(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; message?: string; status?: number };
  if (e.status && e.status >= 400) return false;
  const msg = (e.message ?? '').toLowerCase();
  return (
    e.name === 'TypeError' ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('offline')
  );
}
