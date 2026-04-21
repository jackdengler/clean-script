import { Link } from 'react-router-dom';

export interface VisualGridItem {
  id: string;
  title: string;
  image?: string;
}

interface Props {
  slug: string;
  items: VisualGridItem[];
}

export function VisualGrid({ slug, items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-neutral-500 italic py-4">
        No visuals yet. Paste image URLs for mood-board inspiration.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/p/${slug}/visuals/${item.id}`}
          className="block rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 hover:border-accent-400"
        >
          <div className="aspect-square bg-neutral-100 overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl">🎬</div>
            )}
          </div>
          <div className="px-2 py-1.5 text-xs truncate">{item.title || '(untitled)'}</div>
        </Link>
      ))}
    </div>
  );
}
