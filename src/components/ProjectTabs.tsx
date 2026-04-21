import { NavLink } from 'react-router-dom';

interface TabDef {
  to: string;
  label: string;
}

export function ProjectTabs({ slug }: { slug: string }) {
  const tabs: TabDef[] = [
    { to: `/p/${slug}/brainstorming`, label: 'Brainstorming' },
    { to: `/p/${slug}/characters`, label: 'Characters' },
    { to: `/p/${slug}/scenes`, label: 'Scenes' },
    { to: `/p/${slug}/locations`, label: 'Locations' },
    { to: `/p/${slug}/music`, label: 'Music' },
  ];
  return (
    <div className="border-t border-neutral-100 overflow-x-auto no-scrollbar">
      <div className="flex gap-1 px-2 py-1 min-w-max">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-accent-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
