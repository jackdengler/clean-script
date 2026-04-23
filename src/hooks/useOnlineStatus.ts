import { useEffect, useState } from 'react';
import { loadQueue, subscribeQueue } from '../lib/offlineQueue';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

export function useQueueSize(): number {
  const [size, setSize] = useState<number>(() => loadQueue().length);
  useEffect(() => {
    const update = () => setSize(loadQueue().length);
    const off = subscribeQueue(update);
    window.addEventListener('storage', update);
    return () => {
      off();
      window.removeEventListener('storage', update);
    };
  }, []);
  return size;
}
