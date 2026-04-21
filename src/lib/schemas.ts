export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'url' | 'tags';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
}

export const characterSchema: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe' },
  { key: 'role', label: 'Role', type: 'select', options: ['protagonist', 'antagonist', 'supporting', 'minor'] },
  { key: 'age', label: 'Age', type: 'text', placeholder: '32 / mid-30s / ageless' },
  { key: 'arc', label: 'Arc (one line)', type: 'text', placeholder: 'From cynic to believer' },
];

export const sceneSchema: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', placeholder: 'Jane meets the stranger' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Diner off Route 9' },
  { key: 'time', label: 'Time of day', type: 'select', options: ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS'] },
  { key: 'characters', label: 'Characters', type: 'tags', placeholder: 'Jane, Stranger' },
  { key: 'purpose', label: 'Purpose of scene', type: 'text', placeholder: 'Establish threat' },
];

export const locationSchema: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'The Lighthouse' },
  { key: 'category', label: 'Category', type: 'select', options: ['interior', 'exterior', 'mixed', 'other'] },
  { key: 'tags', label: 'Tags', type: 'tags', placeholder: 'coastal, isolated, night' },
];

export const visualSchema: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', placeholder: 'Final shot reference' },
  { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...' },
  { key: 'tags', label: 'Tags', type: 'tags', placeholder: 'color, mood, lighting' },
];

export const musicSchema: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', placeholder: 'Opening credits cue' },
  { key: 'artist', label: 'Artist', type: 'text', placeholder: 'Nick Cave' },
  { key: 'url', label: 'Link', type: 'url', placeholder: 'https://open.spotify.com/...' },
  { key: 'cue', label: 'Cue / where in film', type: 'text', placeholder: 'Plays over Jane’s drive into town' },
];
