import { useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocxExport } from '../hooks/useDocxExport';
import { useFlowStore } from '../store/useFlowStore';
import { ListingEditor } from '../components/ListingEditor/ListingEditor';
import { ListingPreview } from '../components/ListingEditor/ListingPreview';
import { ListingSettings as ListingSettingsPanel } from '../components/ListingEditor/ListingSettings';
import { Button } from '../components/common/Button';
import { getDefaultSettings } from '../utils/exportDocx';
import type { ListingSettings } from '../types';

const DEFAULT_CODE = `export function bubbleSort(source: number[]): number[] {
  const arr = [...source];
  const n = arr.length;
  for (let i = 0; i < n - 1; i += 1) {
    for (let j = 0; j < n - 1 - i; j += 1) {
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}
`;

export function ListingPage(): JSX.Element {
  const [settings, setSettings] = useLocalStorage<ListingSettings>(
    'gost-listing-settings',
    getDefaultSettings(),
  );
  const [code, setCode] = useLocalStorage<string>('gost-listing-code', DEFAULT_CODE);
  const schemaPng = useFlowStore((s) => s.schemaPng);
  const setPage = useFlowStore((s) => s.setPage);

  const { isExporting, error, exportFile } = useDocxExport();

  const handleListingOnly = useCallback(async (): Promise<void> => {
    await exportFile(settings, code, null, 'listing.docx');
  }, [exportFile, settings, code]);

  const handleCombined = useCallback(async (): Promise<void> => {
    if (!schemaPng) {
      window.alert(
        'Схема ещё не экспортирована. Перейдите в «Блок-схема» и нажмите «Экспорт PNG (2×)».',
      );
      return;
    }
    await exportFile(settings, code, schemaPng, 'schema-and-listing.docx');
  }, [exportFile, settings, code, schemaPng]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-300 bg-white px-3 py-2">
        <Button size="sm" onClick={handleListingOnly} disabled={isExporting}>
          Скачать .docx (листинг)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCombined}
          disabled={isExporting || !schemaPng}
        >
          Скачать .docx (схема + листинг)
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPage('flow')}
        >
          ← К схеме
        </Button>
        <div className="ml-auto text-xs">
          {!schemaPng && (
            <span className="text-amber-600">
              Схема не загружена в память — объединённый экспорт недоступен.
            </span>
          )}
          {isExporting && <span className="text-gray-500">Формирование .docx…</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ListingSettingsPanel settings={settings} onChange={setSettings} />
        <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-gray-300">
          <div className="min-h-0 overflow-hidden">
            <ListingEditor code={code} language={settings.language} onChange={setCode} />
          </div>
          <div className="min-h-0 overflow-hidden">
            <ListingPreview settings={settings} code={code} />
          </div>
        </div>
      </div>
    </div>
  );
}
