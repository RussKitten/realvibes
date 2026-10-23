import { useFlowStore } from '../../store/useFlowStore';
import type { PageId } from '../../types';

interface PageEntry {
  id: PageId;
  label: string;
  icon: string;
}

const pages: PageEntry[] = [
  { id: 'flow', label: 'Блок-схема', icon: '▢' },
  { id: 'listing', label: 'Листинг', icon: '≡' },
  { id: 'about', label: 'О приложении', icon: 'ℹ' },
];

export function Sidebar(): JSX.Element {
  const page = useFlowStore((s) => s.page);
  const setPage = useFlowStore((s) => s.setPage);

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-gray-300 bg-white">
      <nav className="flex flex-col gap-1 p-2">
        {pages.map((p) => {
          const active = page === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPage(p.id)}
              className={`flex items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 text-center">{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-gray-200 p-3 text-[11px] leading-tight text-gray-500">
        ЕСПД · ГОСТ 19.701-90
        <br />
        Оформление · ГОСТ 2.105-95
      </div>
    </aside>
  );
}
