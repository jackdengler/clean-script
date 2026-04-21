import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

export interface SceneListItem {
  id: string;
  filename: string;
  order: number;
  title: string;
  location?: string;
}

interface Props {
  slug: string;
  items: SceneListItem[];
  onReorder: (next: SceneListItem[]) => void;
}

export function SceneReorderList({ slug, items, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <SortableRow key={item.id} item={item} slug={slug} displayOrder={idx + 1} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ item, slug, displayOrder }: { item: SceneListItem; slug: string; displayOrder: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="card flex items-center gap-3">
      <button
        type="button"
        className="text-neutral-400 hover:text-neutral-700 touch-none select-none cursor-grab"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <Link to={`/p/${slug}/scenes/${item.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500 w-8">{String(displayOrder).padStart(3, '0')}</span>
          <span className="font-medium truncate">{item.title || '(untitled scene)'}</span>
        </div>
        {item.location && <div className="text-xs text-neutral-500 ml-10 truncate">{item.location}</div>}
      </Link>
    </li>
  );
}
