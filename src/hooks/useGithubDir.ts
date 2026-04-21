import { useQuery } from '@tanstack/react-query';
import { useClient } from '../context/ConfigContext';

export function useGithubDir(path: string | null) {
  const client = useClient();
  return useQuery({
    queryKey: ['dir', path],
    queryFn: async () => {
      if (!path) return [];
      return client.listDir(path);
    },
    enabled: !!path,
  });
}
