export const ROOT = 'movies';

export const globalBrainstormingPath = () => 'brainstorming.md';

export const projectDir = (slug: string) => `${ROOT}/${slug}`;
export const projectMetaPath = (slug: string) => `${projectDir(slug)}/project.json`;
export const outlinePath = (slug: string) => `${projectDir(slug)}/outline.md`;
export const projectBrainstormPath = (slug: string) => `${projectDir(slug)}/brainstorming.md`;

export const charactersDir = (slug: string) => `${projectDir(slug)}/characters`;
export const scenesDir = (slug: string) => `${projectDir(slug)}/scenes`;
export const locationsDir = (slug: string) => `${projectDir(slug)}/locations`;
export const visualsDir = (slug: string) => `${projectDir(slug)}/visuals`;
export const musicDir = (slug: string) => `${projectDir(slug)}/music`;

export type EntityKind = 'characters' | 'scenes' | 'locations' | 'visuals' | 'music';

export function entityDir(slug: string, kind: EntityKind): string {
  switch (kind) {
    case 'characters': return charactersDir(slug);
    case 'scenes': return scenesDir(slug);
    case 'locations': return locationsDir(slug);
    case 'visuals': return visualsDir(slug);
    case 'music': return musicDir(slug);
  }
}

export function entityPath(slug: string, kind: EntityKind, filename: string): string {
  return `${entityDir(slug, kind)}/${filename}`;
}
