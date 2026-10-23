export function Header(): JSX.Element {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-300 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-[10px] font-bold leading-none text-white">
          ГОСТ
        </div>
        <h1 className="text-base font-semibold text-gray-900">
          Редактор блок-схем и листингов · 19.701-90
        </h1>
      </div>
      <div className="text-xs text-gray-500">v1.0 · React + TypeScript</div>
    </header>
  );
}
