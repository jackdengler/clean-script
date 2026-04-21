import { useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Opts<T> {
  value: T;
  initial: T | null;
  onSave: (v: T) => Promise<void>;
  delayMs?: number;
  enabled?: boolean;
}

export function useDebouncedSave<T>({ value, initial, onSave, delayMs = 1000, enabled = true }: Opts<T>) {
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef<T | null>(initial);
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  useEffect(() => {
    lastSavedRef.current = initial;
  }, [initial]);

  useEffect(() => {
    if (!enabled) return;
    if (lastSavedRef.current !== null && equal(lastSavedRef.current, value)) return;
    const handle = setTimeout(async () => {
      try {
        setState('saving');
        await onSave(valueRef.current);
        lastSavedRef.current = valueRef.current;
        setState('saved');
        setError(null);
      } catch (e: unknown) {
        setState('error');
        setError((e as { message?: string })?.message ?? 'Save failed');
      }
    }, delayMs);
    return () => clearTimeout(handle);
  }, [value, enabled, delayMs, onSave]);

  return { state, error };
}

function equal<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
