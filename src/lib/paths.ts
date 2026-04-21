export const ROOT = 'movies';
export const ARCHIVE_ROOT = 'archive';

export const globalBrainstormingPath = () => 'brainstorming.md';

export const projectDir = (slug: string) => `${ROOT}/${slug}`;
export const archiveProjectDir = (slug: string, stamp: string) => `${ARCHIVE_ROOT}/${slug}-${stamp}`;

export const projectMetaPath = (slug: string) => `${projectDir(slug)}/project.json`;
export const projectBrainstormPath = (slug: string) => `${projectDir(slug)}/brainstorming.md`;
export const charactersPath = (slug: string) => `${projectDir(slug)}/characters.md`;
export const scenesPath = (slug: string) => `${projectDir(slug)}/scenes.md`;
export const locationsPath = (slug: string) => `${projectDir(slug)}/locations.md`;
export const musicPath = (slug: string) => `${projectDir(slug)}/music.md`;

export type TabKind = 'brainstorming' | 'characters' | 'scenes' | 'locations' | 'music';

export function tabPath(slug: string, kind: TabKind): string {
  switch (kind) {
    case 'brainstorming': return projectBrainstormPath(slug);
    case 'characters': return charactersPath(slug);
    case 'scenes': return scenesPath(slug);
    case 'locations': return locationsPath(slug);
    case 'music': return musicPath(slug);
  }
}
