import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectLayout } from '../../components/ProjectLayout';
import { SaveStatus } from '../../components/Layout';
import { SectionedList } from '../../components/SectionedList';
import { useGithubFile, usePutFile } from '../../hooks/useGithubFile';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { tabPath, type TabKind } from '../../lib/paths';

interface Props {
  kind: TabKind;
  commitLabel: string;
  itemLabel: string;
  addLabel: string;
  reorderable?: boolean;
  emptyHint?: string;
}

export function SectionedTab(props: Props) {
  const { slug = '' } = useParams();
  const path = tabPath(slug, props.kind);
  return <Inner {...props} key={path} slug={slug} path={path} />;
}

function Inner({
  slug, path, commitLabel, itemLabel, addLabel, reorderable, emptyHint,
}: Props & { slug: string; path: string }) {
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

  const { state, lastSavedAt } = useDebouncedSave({
    value: text,
    initial,
    enabled: initial !== null,
    onSave: async (v) => {
      await put.mutateAsync({ path, content: v, message: `${commitLabel} for ${slug}` });
    },
  });

  return (
    <ProjectLayout slug={slug} right={<SaveStatus state={state} lastSavedAt={lastSavedAt} />}>
      {isLoading && initial === null ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <SectionedList
          value={text}
          onChange={setText}
          reorderable={reorderable}
          addLabel={addLabel}
          itemLabel={itemLabel}
          emptyHint={emptyHint}
        />
      )}
    </ProjectLayout>
  );
}
