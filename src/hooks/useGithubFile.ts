import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../context/ConfigContext';
import { enqueue, isNetworkError } from '../lib/offlineQueue';

export function useGithubFile(path: string | null) {
  const client = useClient();
  return useQuery({
    queryKey: ['file', path],
    queryFn: async () => {
      if (!path) return null;
      return client.getFile(path);
    },
    enabled: !!path,
  });
}

function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function usePutFile() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, content, message }: { path: string; content: string; message: string }) => {
      if (!isOnline()) {
        enqueue({ kind: 'put', path, content, message });
        return;
      }
      try {
        await client.putFile(path, content, message);
      } catch (err) {
        if (isNetworkError(err)) {
          enqueue({ kind: 'put', path, content, message });
          return;
        }
        throw err;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['file', vars.path] });
      const parts = vars.path.split('/');
      parts.pop();
      qc.invalidateQueries({ queryKey: ['dir', parts.join('/')] });
    },
  });
}

export function useDeleteFile() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, message }: { path: string; message: string }) => {
      if (!isOnline()) {
        enqueue({ kind: 'delete', path, message });
        return;
      }
      try {
        await client.deleteFile(path, message);
      } catch (err) {
        if (isNetworkError(err)) {
          enqueue({ kind: 'delete', path, message });
          return;
        }
        throw err;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['file', vars.path] });
      const parts = vars.path.split('/');
      parts.pop();
      qc.invalidateQueries({ queryKey: ['dir', parts.join('/')] });
    },
  });
}
