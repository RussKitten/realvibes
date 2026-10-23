import type { DragEvent } from 'react';
import { GOST_BLOCKS } from '../../gost/constants';
import type { GostNodeKind } from '../../types';
import { Tooltip } from '../common/Tooltip';

const KINDS: GostNodeKind[] = [
  'start-end',
  'process',
  'decision',
  'input-output',
  'predefined-process',
  'document',
  'data',
  'connector',
  'comment',
];

interface ShapePreviewProps {
  kind: GostNodeKind;
}

function ShapePreview({ kind }: ShapePreviewProps): JSX.Element {
  const stroke = '#000000';
  const fill = '#ffffff';
  const common = { stroke, fill, strokeWidth: 1.2 };

  switch (kind) {
    case 'start-end':
      return <rect x="1" y="1" width="38" height="18" rx="9" ry="9" {...common} />;
    case 'process':
      return <rect x="1" y="1" width="38" height="18" {...common} />;
    case 'decision':
      return <polygon points="20,1 39,10 20,19 1,10" {...common} />;
    case 'input-output':
      return <polygon points="8,1 39,1 32,19 1,19" {...common} />;
    case 'predefined-process':
      return (
        <g>
          <rect x="1" y="1" width="38" height="18" {...common} />
          <line x1="7" y1="1" x2="7" y2="19" {...common} />
          <line x1="33" y1="1" x2="33" y2="19" {...common} />
        </g>
      );
    case 'document':
      return <path d="M 1 1 L 39 1 L 39 14 C 30 20 10 8 1 14 Z" {...common} />;
    case 'data':
      return <polygon points="1,1 32,1 39,19 8,19" {...common} />;
    case 'connector':
      return <circle cx="20" cy="10" r="9" {...common} />;
    case 'comment':
      return (
        <g>
          <path d="M 1 1 L 39 1 L 39 19 L 1 19" fill="none" stroke={stroke} strokeWidth={1.2} />
          <line x1="1" y1="1" x2="1" y2="19" stroke={stroke} strokeWidth={1.2} strokeDasharray="2 2" />
        </g>
      );
    default:
      return <rect x="1" y="1" width="38" height="18" {...common} />;
  }
}

export function Palette(): JSX.Element {
  const handleDragStart =
    (kind: GostNodeKind) =>
    (e: DragEvent<HTMLDivElement>): void => {
      e.dataTransfer.setData('application/gost-kind', kind);
      e.dataTransfer.effectAllowed = 'move';
    };

  return (
    <aside className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-gray-300 bg-white p-3">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Палитра блоков
      </h2>
      <div className="flex flex-col gap-1.5">
        {KINDS.map((kind) => {
          const spec = GOST_BLOCKS[kind];
          const tooltip = `${spec.tooltip} Размер по умолчанию: ${spec.defaultWidth}×${spec.defaultHeight} px.`;
          return (
            <Tooltip key={kind} content={tooltip} side="right">
              <div
                draggable
                onDragStart={handleDragStart(kind)}
                className="flex w-full cursor-grab items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing"
                title={`ГОСТ ${spec.gostCode}`}
              >
                <svg viewBox="0 0 40 20" className="h-5 w-10 shrink-0" aria-hidden="true">
                  <ShapePreview kind={kind} />
                </svg>
                <span className="leading-tight">{spec.labelRu}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] leading-tight text-gray-500">
        Перетащите блок на холст. Соединение — потяните за маркер на блоке. Зум — колесо мыши, панорамирование — зажатая средняя кнопка мыши / пробел + drag.
      </p>
    </aside>
  );
}
