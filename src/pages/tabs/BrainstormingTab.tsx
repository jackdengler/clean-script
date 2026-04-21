import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { useGithubFile, usePutFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { projectBrainstormPath } from '../../lib/paths';

export function BrainstormingTab() {
  const { slug = '' } = useParams();
  const path = projectBrainstormPath(slug);
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
      await put.mutateAsync({ path, content: v, message: `update brainstorming for ${slug}` });
    },
  });

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} />}>
      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <MarkdownEditor
          value={text}
          onChange={setText}
          placeholder="Dump anything — themes, what-ifs, half-ideas, notes from driving."
          minRows={24}
        />
      )}
    </ProjectLayout>
  );
}
