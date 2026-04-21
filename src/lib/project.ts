import type { TemplateId } from './templates';

export interface ProjectMeta {
  slug: string;
  title: string;
  logline: string;
  template: TemplateId;
  createdAt: string;
  updatedAt: string;
}

export function newProjectMeta(input: {
  slug: string;
  title: string;
  logline: string;
  template: TemplateId;
}): ProjectMeta {
  const now = new Date().toISOString();
  return {
    slug: input.slug,
    title: input.title,
    logline: input.logline,
    template: input.template,
    createdAt: now,
    updatedAt: now,
  };
}
