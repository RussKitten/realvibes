import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { GostNodeData, GostNodeKind } from '../../types';
import { GOST_COLORS } from '../../gost/constants';

const STROKE_WIDTH = 1.5;
const VECTOR = 'non-scaling-stroke' as const;

interface ShapeProps {
  kind: GostNodeKind;
}

function Shape({ kind }: ShapeProps): JSX.Element {
  const stroke = GOST_COLORS.stroke;
  const fill = GOST_COLORS.fill;
  const common = { stroke, fill, strokeWidth: STROKE_WIDTH, vectorEffect: VECTOR };

  switch (kind) {
    case 'start-end':
      return <rect x="1" y="1" width="98" height="98" rx="49" ry="49" {...common} />;
    case 'process':
      return <rect x="1" y="1" width="98" height="98" {...common} />;
    case 'decision':
      return <polygon points="50,1 99,50 50,99 1,50" {...common} />;
    case 'input-output':
      return <polygon points="20,1 99,1 80,99 1,99" {...common} />;
    case 'predefined-process':
      return (
        <g>
          <rect x="1" y="1" width="98" height="98" {...common} />
          <line x1="15" y1="1" x2="15" y2="99" {...common} />
          <line x1="85" y1="1" x2="85" y2="99" {...common} />
        </g>
      );
    case 'document':
      return <path d="M 1 1 L 99 1 L 99 82 C 75 100 25 64 1 82 Z" {...common} />;
    case 'data':
      return <polygon points="1,1 80,1 99,99 20,99" {...common} />;
    case 'connector':
      return <circle cx="50" cy="50" r="49" {...common} />;
    case 'comment':
      return (
        <g>
          <path d="M 1 1 L 99 1 L 99 99 L 1 99 Z" fill={fill} stroke="none" />
          <path d="M 1 1 L 99 1 L 99 99 L 1 99" fill="none" stroke={stroke} strokeWidth={STROKE_WIDTH} vectorEffect={VECTOR} />
          <line x1="1" y1="1" x2="1" y2="99" stroke={stroke} strokeWidth={STROKE_WIDTH} strokeDasharray="5 4" vectorEffect={VECTOR} />
        </g>
      );
    default:
      return <rect x="1" y="1" width="98" height="98" {...common} />;
  }
}

function GostNodeComponent({ data, selected }: NodeProps<Node<GostNodeData>>): JSX.Element {
  return (
    <div className={`relative h-full w-full ${selected ? 'gost-node-selected' : ''}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <Shape kind={data.kind} />
      </svg>

      {/* Явные id — ключевое исправление */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] leading-tight text-black">
        <span className="break-words">{data.label}</span>
      </div>
    </div>
  );
}

export const GostNode = memo(GostNodeComponent);
export const nodeTypes = { gost: GostNode } as const;
