export interface ProjectMeta {
  slug: string;
  title: string;
  logline: string;
  createdAt: string;
  updatedAt: string;
}

export function newProjectMeta(input: {
  slug: string;
  title: string;
  logline: string;
}): ProjectMeta {
  const now = new Date().toISOString();
  return {
    slug: input.slug,
    title: input.title,
    logline: input.logline,
    createdAt: now,
    updatedAt: now,
  };
}
