import { useCallback, useState } from 'react';
import { saveAs } from 'file-saver';
import type { ListingSettings } from '../types';
import { buildListingDocument } from '../utils/exportDocx';

export interface UseDocxExportResult {
  isExporting: boolean;
  error: string | null;
  exportFile: (
    settings: ListingSettings,
    code: string,
    schemaPng: string | null,
    filename: string,
  ) => Promise<void>;
}

export function useDocxExport(): UseDocxExportResult {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const exportFile = useCallback(
    async (
      settings: ListingSettings,
      code: string,
      schemaPng: string | null,
      filename: string,
    ): Promise<void> => {
      setIsExporting(true);
      setError(null);
      try {
        const blob = await buildListingDocument(settings, code, schemaPng);
        saveAs(blob, filename);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось сформировать .docx');
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { isExporting, error, exportFile };
}
