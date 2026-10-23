import { useFlowStore } from '../../store/useFlowStore';
import { GOST_BLOCKS } from '../../gost/constants';
import type { GostNodeKind } from '../../types';
import { Button } from '../common/Button';

export function Inspector(): JSX.Element {
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel);
  const updateNodeKind = useFlowStore((s) => s.updateNodeKind);
  const deleteNode = useFlowStore((s) => s.deleteNode);

  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;

  if (!node) {
    return (
      <aside className="w-64 shrink-0 overflow-y-auto border-l border-gray-300 bg-white p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Инспектор
        </h2>
        <p className="text-xs text-gray-500">
          Выберите блок на холсте, чтобы отредактировать его текст и тип по ГОСТ.
        </p>
      </aside>
    );
  }

  const kinds = Object.values(GOST_BLOCKS);
  const spec = GOST_BLOCKS[node.data.kind];

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-l border-gray-300 bg-white p-3">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Инспектор
      </h2>

      <label className="mb-1 block text-xs font-medium text-gray-700" htmlFor="node-label">
        Текст блока
      </label>
      <textarea
        id="node-label"
        className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        rows={3}
        value={node.data.label}
        onChange={(e) => updateNodeLabel(node.id, e.target.value)}
      />

      <label className="mb-1 block text-xs font-medium text-gray-700" htmlFor="node-kind">
        Тип блока (ГОСТ)
      </label>
      <select
        id="node-kind"
        className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        value={node.data.kind}
        onChange={(e) => updateNodeKind(node.id, e.target.value as GostNodeKind)}
      >
        {kinds.map((k) => (
          <option key={k.kind} value={k.kind}>
            {k.labelRu} ({k.gostCode})
          </option>
        ))}
      </select>

      <div className="mb-3 rounded bg-gray-50 p-2 text-[11px] leading-snug text-gray-600">
        <div className="font-medium text-gray-800">
          {spec.labelRu} · ГОСТ {spec.gostCode}
        </div>
        <div>{spec.tooltip}</div>
      </div>

      <div className="mb-3 text-[11px] leading-snug text-gray-500">
        ID: <span className="font-mono">{node.id}</span>
        <br />
        Позиция: x = {Math.round(node.position.x)}, y = {Math.round(node.position.y)}
        <br />
        Размер: {Math.round(Number(node.style?.width ?? spec.defaultWidth))} ×{' '}
        {Math.round(Number(node.style?.height ?? spec.defaultHeight))} px
      </div>

      <Button variant="danger" size="sm" className="w-full" onClick={() => deleteNode(node.id)}>
        Удалить блок
      </Button>
    </aside>
  );
}
