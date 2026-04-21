export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

export function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

export function sceneFilename(order: number, title: string): string {
  return `${pad3(order)}-${slugify(title)}.md`;
}
