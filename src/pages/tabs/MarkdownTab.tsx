import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { useGithubFile, usePutFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { tabPath, type TabKind } from '../../lib/paths';

interface Props {
  kind: TabKind;
  placeholder?: string;
  commitLabel: string;
}

export function MarkdownTab({ kind, placeholder, commitLabel }: Props) {
  const { slug = '' } = useParams();
  const path = tabPath(slug, kind);
  return (
    <TabEditor
      key={path}
      slug={slug}
      path={path}
      placeholder={placeholder}
      commitLabel={commitLabel}
    />
  );
}

interface EditorProps {
  slug: string;
  path: string;
  placeholder?: string;
  commitLabel: string;
}

function TabEditor({ slug, path, placeholder, commitLabel }: EditorProps) {
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
      await put.mutateAsync({ path, content: v, message: `${commitLabel} for ${slug}` });
    },
  });

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} />}>
      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <MarkdownEditor value={text} onChange={setText} placeholder={placeholder} minRows={24} />
      )}
    </ProjectLayout>
  );
}
