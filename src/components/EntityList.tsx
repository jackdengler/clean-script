import { Link } from 'react-router-dom';
import type { EntityKind } from '../lib/paths';

export interface EntityListItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

interface Props {
  slug: string;
  kind: EntityKind;
  items: EntityListItem[];
  emptyLabel: string;
}

export function EntityList({ slug, kind, items, emptyLabel }: Props) {
  if (items.length === 0) {
    return <div className="text-sm text-neutral-500 italic py-4">{emptyLabel}</div>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={`/p/${slug}/${kind}/${item.id}`} className="card flex items-center gap-3 hover:border-accent-400">
            {item.image && (
              <img
                src={item.image}
                alt=""
                className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-neutral-100"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{item.title || '(untitled)'}</div>
              {item.subtitle && <div className="text-xs text-neutral-500 truncate">{item.subtitle}</div>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
