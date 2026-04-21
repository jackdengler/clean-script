import { useEffect, useState } from 'react';
import { Layout, SaveStatus } from '../components/Layout';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { useGithubFile, usePutFile } from '../hooks/useGithubFile';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { globalBrainstormingPath } from '../lib/paths';

export function GlobalBrainstorming() {
  const path = globalBrainstormingPath();
  const { data, isLoading } = useGithubFile(path);
  const put = usePutFile();

  const [text, setText] = useState('');
  const [initial, setInitial] = useState<string | null>(null);

  useEffect(() => {
    if (data !== undefined && initial === null) {
      const content = data?.content ?? '';
      setText(content);
      setInitial(content);
    }
  }, [data, initial]);

  const { state } = useDebouncedSave({
    value: text,
    initial,
    enabled: initial !== null,
    onSave: async (v) => {
      await put.mutateAsync({ path, content: v, message: 'update brainstorming' });
    },
  });

  return (
    <Layout
      title="General Brainstorming"
      back="/"
      right={<SaveStatus state={state} />}
    >
      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <MarkdownEditor
          value={text}
          onChange={setText}
          placeholder="Write out any idea — a scene, a line, a what-if. No pressure, no project."
          minRows={20}
        />
      )}
    </Layout>
  );
}
