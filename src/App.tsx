import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { Setup } from './pages/Setup';
import { Settings } from './pages/Settings';
import { ProjectList } from './pages/ProjectList';
import { GlobalBrainstorming } from './pages/GlobalBrainstorming';
import { NewProject } from './pages/NewProject';
import { MarkdownTab } from './pages/tabs/MarkdownTab';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 14,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'movie-planner-cache-v1',
});

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 14 }}
    >
      <ConfigProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ConfigProvider>
    </PersistQueryClientProvider>
  );
}

function Shell() {
  const { config } = useConfig();

  if (!config) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<Navigate to="/" replace />} />
      <Route path="/" element={<ProjectList />} />
      <Route path="/brainstorming" element={<GlobalBrainstorming />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/settings" element={<Settings />} />

      <Route path="/p/:slug" element={<Navigate to="brainstorming" replace />} />
      <Route path="/p/:slug/brainstorming" element={<MarkdownTab kind="brainstorming" commitLabel="update brainstorming" placeholder="Themes, what-ifs, half-ideas. Use bullets — hit return to add more." />} />
      <Route path="/p/:slug/characters" element={<MarkdownTab kind="characters" commitLabel="update characters" />} />
      <Route path="/p/:slug/scenes" element={<MarkdownTab kind="scenes" commitLabel="update scenes" />} />
      <Route path="/p/:slug/locations" element={<MarkdownTab kind="locations" commitLabel="update locations" />} />
      <Route path="/p/:slug/music" element={<MarkdownTab kind="music" commitLabel="update music" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
