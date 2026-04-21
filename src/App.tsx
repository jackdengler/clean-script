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
import { OutlineTab } from './pages/tabs/OutlineTab';
import { BrainstormingTab } from './pages/tabs/BrainstormingTab';
import { EntityListTab } from './pages/tabs/EntityListTab';
import { EntityEditorTab } from './pages/tabs/EntityEditorTab';
import { ScenesTab } from './pages/tabs/ScenesTab';
import { SceneEditorTab } from './pages/tabs/SceneEditorTab';

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

      <Route path="/p/:slug" element={<Navigate to="outline" replace />} />
      <Route path="/p/:slug/outline" element={<OutlineTab />} />
      <Route path="/p/:slug/brainstorming" element={<BrainstormingTab />} />

      <Route path="/p/:slug/characters" element={<EntityListTab kind="characters" singular="character" emptyLabel="No characters yet." />} />
      <Route path="/p/:slug/characters/:id" element={<EntityEditorTab kind="characters" singular="character" bodyLabel="Backstory, voice, notes" />} />

      <Route path="/p/:slug/scenes" element={<ScenesTab />} />
      <Route path="/p/:slug/scenes/:id" element={<SceneEditorTab />} />

      <Route path="/p/:slug/locations" element={<EntityListTab kind="locations" singular="location" emptyLabel="No locations yet." />} />
      <Route path="/p/:slug/locations/:id" element={<EntityEditorTab kind="locations" singular="location" bodyLabel="Description, mood, details" />} />

      <Route path="/p/:slug/visuals" element={<EntityListTab kind="visuals" singular="visual" emptyLabel="No visuals yet. Paste an image URL." view="grid" />} />
      <Route path="/p/:slug/visuals/:id" element={<EntityEditorTab kind="visuals" singular="visual" bodyLabel="Notes" bodyPlaceholder="Why this image? What does it evoke?" />} />

      <Route path="/p/:slug/music" element={<EntityListTab kind="music" singular="music" emptyLabel="No music yet." />} />
      <Route path="/p/:slug/music/:id" element={<EntityEditorTab kind="music" singular="music" bodyLabel="Notes" bodyPlaceholder="Why this track? When does it play?" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
