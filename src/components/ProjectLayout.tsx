import type { ReactNode } from 'react';
import { Layout } from './Layout';
import { ProjectTabs } from './ProjectTabs';
import { useProject } from '../hooks/useProjects';

interface Props {
  slug: string;
  right?: ReactNode;
  children: ReactNode;
}

export function ProjectLayout({ slug, right, children }: Props) {
  const { data: project } = useProject(slug);
  const title = project?.title || slug;
  return (
    <Layout
      title={title}
      subtitle={project?.logline}
      back="/"
      right={right}
      tabs={<ProjectTabs slug={slug} />}
    >
      {children}
    </Layout>
  );
}
