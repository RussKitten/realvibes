import { useCallback, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Palette } from '../components/FlowEditor/Palette';
import { FlowCanvas } from '../components/FlowEditor/FlowCanvas';
import { Inspector } from '../components/FlowEditor/Inspector';
import { CppImportModal } from '../components/FlowEditor/CppImportModal';
import { Button } from '../components/common/Button';
import { useFlowStore } from '../store/useFlowStore';
import {
  copyToClipboard,
  downloadDataUrl,
  exportToPng,
  exportToSvg,
} from '../utils/exportImage';

type Busy = 'png' | 'svg' | 'copy' | null;

export function FlowPage(): JSX.Element {
  const nodes = useFlowStore((s) => s.nodes);
  const clear = useFlowStore((s) => s.clear);
  const loadExample = useFlowStore((s) => s.loadExample);
  const setSchemaPng = useFlowStore((s) => s.setSchemaPng);

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cppOpen, setCppOpen] = useState<boolean>(false);

  const handlePng = useCallback(async (): Promise<void> => {
    setBusy('png');
    setError(null);
    setNotice(null);
    try {
      const dataUrl = await exportToPng(nodes);
      downloadDataUrl(dataUrl, 'schema-gost.png');
      setSchemaPng(dataUrl);
      setNotice('PNG сохранён и помещён в память для объединённого .docx');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка экспорта PNG');
    } finally {
      setBusy(null);
    }
  }, [nodes, setSchemaPng]);

  const handleSvg = useCallback(async (): Promise<void> => {
    setBusy('svg');
    setError(null);
    setNotice(null);
    try {
      const dataUrl = await exportToSvg(nodes);
      downloadDataUrl(dataUrl, 'schema-gost.svg');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка экспорта SVG');
    } finally {
      setBusy(null);
    }
  }, [nodes]);

  const handleCopy = useCallback(async (): Promise<void> => {
    setBusy('copy');
    setError(null);
    setNotice(null);
    try {
      await copyToClipboard(nodes);
      setNotice('Схема скопирована в буфер как PNG');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось скопировать');
    } finally {
      setBusy(null);
    }
  }, [nodes]);

  const handleClear = useCallback((): void => {
    if (window.confirm('Очистить схему?')) {
      clear();
    }
  }, [clear]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-300 bg-white px-3 py-2">
        <Button
          size="sm"
          onClick={handlePng}
          disabled={busy !== null || nodes.length === 0}
        >
          Экспорт PNG (2×)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSvg}
          disabled={busy !== null || nodes.length === 0}
        >
          Экспорт SVG
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          disabled={busy !== null || nodes.length === 0}
        >
          Копировать в буфер
        </Button>
        <div className="mx-2 h-5 w-px bg-gray-300" />
        <Button size="sm" variant="secondary" onClick={() => setCppOpen(true)}>
          Импорт C++
        </Button>
        <Button size="sm" variant="secondary" onClick={loadExample}>
          Загрузить пример
        </Button>
        <Button size="sm" variant="danger" onClick={handleClear}>
          Очистить
        </Button>
        <div className="ml-auto flex items-center gap-3 text-xs">
          {busy && <span className="text-gray-500">Обработка…</span>}
          {notice && <span className="text-emerald-600">{notice}</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Palette />
        <div className="flex-1">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
        <Inspector />
      </div>
      <CppImportModal open={cppOpen} onClose={() => setCppOpen(false)} />
    </div>
  );
}
