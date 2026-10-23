import type { ListingSettings as ListingSettingsType } from '../../types';

interface ListingSettingsProps {
  settings: ListingSettingsType;
  onChange: (next: ListingSettingsType) => void;
}

export function ListingSettings({ settings, onChange }: ListingSettingsProps): JSX.Element {
  const update = <K extends keyof ListingSettingsType>(
    key: K,
    value: ListingSettingsType[K],
  ): void => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <section className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-gray-300 bg-white p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Параметры листинга
      </h2>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Шрифт
        <select
          value={settings.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="Courier New">Courier New</option>
          <option value="Consolas">Consolas</option>
          <option value="Lucida Console">Lucida Console</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Размер шрифта, pt
        <input
          type="number"
          min={8}
          max={14}
          value={settings.fontSize}
          onChange={(e) => update('fontSize', Number(e.target.value) || 10)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Строк на странице
        <input
          type="number"
          min={10}
          max={200}
          value={settings.linesPerPage}
          onChange={(e) => update('linesPerPage', Number(e.target.value) || 50)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Язык
        <input
          type="text"
          value={settings.language}
          onChange={(e) => update('language', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Подпись листинга (над таблицей)
        <input
          type="text"
          value={settings.caption}
          onChange={(e) => update('caption', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Заголовок столбца «код»
        <input
          type="text"
          value={settings.tableTitle}
          onChange={(e) => update('tableTitle', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={settings.showLineNumbers}
          onChange={(e) => update('showLineNumbers', e.target.checked)}
        />
        Показывать номера строк
      </label>

      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Ширина столбца «№», см
        <input
          type="number"
          min={0.6}
          max={4}
          step={0.1}
          value={settings.lineNumberColumnWidth}
          onChange={(e) =>
            update('lineNumberColumnWidth', Number(e.target.value) || 1.5)
          }
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>
    </section>
  );
}
