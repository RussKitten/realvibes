import { useState } from 'react';
import { Button } from '../common/Button';
import { useFlowStore } from '../../store/useFlowStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CppImportModal({ open, onClose }: Props): JSX.Element | null {
  const importCppCode = useFlowStore((s) => s.importCppCode);
  const [code, setCode] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleImport = async (): Promise<void> => {
    if (code.trim().length === 0) {
      setError('Вставьте код C++.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await importCppCode(code);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка парсинга');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded bg-white p-4 shadow-xl">
        <h2 className="mb-2 text-base font-semibold">Импорт блок-схемы из C++</h2>
        <p className="mb-2 text-xs text-gray-500">
          Вставьте исходный код C++ (функции, ветвления, циклы, вызовы, cout/cin).
          Схема будет построена автоматически и размещена на холсте.
        </p>
        <textarea
          className="mb-3 min-h-[300px] w-full rounded border border-gray-300 p-2 font-mono text-xs"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`#include <iostream>\nusing namespace std;\n\nint main() {\n  int n;\n  cin >> n;\n  if (n > 0) cout << "positive";\n  else cout << "negative";\n  return 0;\n}`}
        />
        {error && <div className="mb-2 text-xs text-red-600">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleImport} disabled={busy}>
            {busy ? 'Парсинг…' : 'Построить схему'}
          </Button>
        </div>
      </div>
    </div>
  );
}
