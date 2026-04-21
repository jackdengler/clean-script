import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../context/ConfigContext';

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

export function usePutFile() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, content, message }: { path: string; content: string; message: string }) => {
      await client.putFile(path, content, message);
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
      await client.deleteFile(path, message);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['file', vars.path] });
      const parts = vars.path.split('/');
      parts.pop();
      qc.invalidateQueries({ queryKey: ['dir', parts.join('/')] });
    },
  });
}
