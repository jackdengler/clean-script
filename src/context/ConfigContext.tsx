import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GithubClient } from '../lib/github';
import { loadConfig, saveConfig as save, clearConfig, type AppConfig } from '../lib/storage';

interface ConfigContextValue {
  config: AppConfig | null;
  client: GithubClient | null;
  setConfig: (c: AppConfig) => void;
  clear: () => void;
}

const Ctx = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AppConfig | null>(() => loadConfig());

  useEffect(() => {
    if (config) save(config);
  }, [config]);

  const client = useMemo(() => (config ? new GithubClient(config) : null), [config]);

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      client,
      setConfig: (c) => setConfigState(c),
      clear: () => {
        clearConfig();
        setConfigState(null);
      },
    }),
    [config, client],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfig(): ConfigContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConfig must be used inside ConfigProvider');
  return v;
}

export function useClient(): GithubClient {
  const { client } = useConfig();
  if (!client) throw new Error('GitHub client unavailable — complete Setup first');
  return client;
}
