import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { useGithubFile, usePutFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { outlinePath } from '../../lib/paths';

export function OutlineTab() {
  const { slug = '' } = useParams();
  const path = outlinePath(slug);
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
      await put.mutateAsync({ path, content: v, message: `update outline for ${slug}` });
    },
  });

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} />}>
      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <MarkdownEditor value={text} onChange={setText} minRows={24} />
      )}
    </ProjectLayout>
  );
}
