import { useMemo } from 'react';
import type { ListingSettings } from '../../types';
import { paginateLines, splitCodeToLines } from '../../utils/splitCodeToLines';

interface ListingPreviewProps {
  settings: ListingSettings;
  code: string;
}

export function ListingPreview({ settings, code }: ListingPreviewProps): JSX.Element {
  const pages = useMemo(() => {
    const lines = splitCodeToLines(code);
    return paginateLines(lines, settings.linesPerPage);
  }, [code, settings.linesPerPage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-500">
        <span>Предпросмотр листинга</span>
        <span>
          {pages.length} стр. · {settings.fontFamily} {settings.fontSize} pt
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {pages.length === 0 && (
          <p className="text-xs text-gray-500">Код пуст — введите листинг слева.</p>
        )}
        {pages.map((chunk, pageIdx) => (
          <div key={pageIdx} className="mb-6">
            <div className="mb-2 text-xs font-medium text-gray-700">
              {pageIdx === 0
                ? settings.caption || 'Листинг'
                : `${settings.caption || 'Листинг'} (продолжение)`}
            </div>
            <table
              className="w-full border-collapse bg-white text-[11px] shadow"
              style={{
                fontFamily: `"${settings.fontFamily}", "Courier New", monospace`,
                fontSize: `${settings.fontSize}pt`,
              }}
            >
              <thead>
                <tr>
                  <th
                    className="border border-black px-1 py-0.5 text-center font-semibold"
                    style={{
                      width: `${settings.lineNumberColumnWidth}cm`,
                    }}
                  >
                    №
                  </th>
                  <th className="border border-black px-1 py-0.5 text-left font-semibold">
                    {settings.tableTitle || 'Код'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((line) => (
                  <tr key={line.number}>
                    <td className="border border-black px-1 py-0 text-center align-top leading-snug">
                      {settings.showLineNumbers ? line.number : ''}
                    </td>
                    <td className="whitespace-pre border border-black px-1 py-0 align-top leading-snug">
                      {line.content.length > 0 ? line.content : '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
