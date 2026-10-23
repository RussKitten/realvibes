import { useCallback, type DragEvent } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { useFlowStore } from '../../store/useFlowStore';
import { nodeTypes } from './GostNodes';
import type { GostNodeData, GostNodeKind } from '../../types';

type GostFlowNode = Node<GostNodeData>;

export function FlowCanvas(): JSX.Element {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);
  const selectNode = useFlowStore((s) => s.selectNode);

  const { screenToFlowPosition } = useReactFlow<GostFlowNode, Edge>();

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/gost-kind') as GostNodeKind;
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(kind, { x: position.x - 90, y: position.y - 30 });
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div className="h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow<GostFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#000' },
          style: { stroke: '#000', strokeWidth: 1.5 },
          labelStyle: { fontSize: 11, fill: '#000' },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
        }}
        proOptions={{ hideAttribution: false }}
      >
        <Background gap={15} size={1} color="#cfcfcf" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor="#e5e7eb"
          nodeStrokeColor="#000"
          maskColor="rgba(255,255,255,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
