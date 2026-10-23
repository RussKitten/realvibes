import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type Node,
} from '@xyflow/react';
import type { GostNodeData, GostNodeKind, PageId } from '../types';
import { GOST_BLOCKS } from '../gost/constants';
import { initCppParser, parseCpp } from '../utils/cppParser';
import { cppAstToFlow } from '../utils/cppToFlow';
import { layoutFlow } from '../utils/layoutFlow';

interface FlowState {
  nodes: Node<GostNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  page: PageId;
  schemaPng: string | null;

  setPage: (page: PageId) => void;
  setSchemaPng: (dataUrl: string | null) => void;

  onNodesChange: OnNodesChange<Node<GostNodeData>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (connection: Connection) => void;

  addNode: (kind: GostNodeKind, position: { x: number; y: number }) => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeKind: (id: string, kind: GostNodeKind) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  importCppCode: (code: string) => Promise<void>;

  clear: () => void;
  loadExample: () => void;
}

const DEFAULT_EDGE_STYLE = {
  type: 'smoothstep' as const,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#000' },
  style: { stroke: '#000', strokeWidth: 1.5 },
  labelStyle: { fontSize: 11, fill: '#000' },
  labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
  labelBgPadding: [4, 2] as [number, number],
  labelBgBorderRadius: 4,
};

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      page: 'flow',
      schemaPng: null,

      setPage: (page) => set({ page }),
      setSchemaPng: (schemaPng) => set({ schemaPng }),

      onNodesChange: (changes) =>
        set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

      onEdgesChange: (changes) =>
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

      onConnect: (connection) =>
        set((state) => ({
          edges: addEdge({ ...connection, ...DEFAULT_EDGE_STYLE }, state.edges),
        })),

      addNode: (kind, position) =>
        set((state) => {
          const spec = GOST_BLOCKS[kind];
          const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const node: Node<GostNodeData> = {
            id,
            type: 'gost',
            position,
            style: { width: spec.defaultWidth, height: spec.defaultHeight },
            data: { label: spec.labelRu, kind },
          };
          return { nodes: [...state.nodes, node], selectedNodeId: id };
        }),

      updateNodeLabel: (id, label) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, label } } : n,
          ),
        })),

      updateNodeKind: (id, kind) =>
        set((state) => {
          const spec = GOST_BLOCKS[kind];
          return {
            nodes: state.nodes.map((n) =>
              n.id === id
                ? {
                    ...n,
                    style: {
                      ...n.style,
                      width: spec.defaultWidth,
                      height: spec.defaultHeight,
                    },
                    data: { ...n.data, kind },
                  }
                : n,
            ),
          };
        }),

      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        })),

      selectNode: (selectedNodeId) => set({ selectedNodeId }),

      importCppCode: async (code) => {
        await initCppParser();
        const root = parseCpp(code);
        const { nodes: newNodes, edges: newEdges } = cppAstToFlow(root, code);
        const layouted = await layoutFlow(newNodes, newEdges);
        set({
          nodes: layouted,
          edges: newEdges,
          selectedNodeId: null,
          schemaPng: null,
        });
      },

      clear: () =>
        set({ nodes: [], edges: [], selectedNodeId: null, schemaPng: null }),

      loadExample: () =>
        set(() => {
          const mk = (
            id: string,
            kind: GostNodeKind,
            label: string,
            x: number,
            y: number,
          ): Node<GostNodeData> => {
            const spec = GOST_BLOCKS[kind];
            return {
              id,
              type: 'gost',
              position: { x, y },
              style: { width: spec.defaultWidth, height: spec.defaultHeight },
              data: { label, kind },
            };
          };

          const edge = (
            id: string,
            source: string,
            target: string,
            sourceHandle: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
            targetHandle: 'top' | 'bottom' | 'left' | 'right' = 'top',
            label?: string,
          ): Edge => ({
            id,
            source,
            target,
            sourceHandle,
            targetHandle,
            label,
            ...DEFAULT_EDGE_STYLE,
          });

          const nodes: Node<GostNodeData>[] = [
            mk('n1', 'start-end', 'Начало', 420, 0),
            mk('n2', 'input-output', 'Ввод массива A и n', 400, 140),
            mk('n3', 'process', 'i = 1', 420, 280),
            mk('n4', 'decision', 'i < n ?', 420, 400),
            mk('n5', 'process', 'j = 1', 420, 560),
            mk('n6', 'decision', 'j <= n - i ?', 420, 680),
            mk('n7', 'decision', 'A[j] > A[j+1] ?', 420, 840),
            mk('n8', 'process', 'swap A[j], A[j+1]', 720, 860),
            mk('n9', 'process', 'j = j + 1', 420, 1020),
            mk('n10', 'process', 'i = i + 1', 420, 1160),
            mk('n11', 'input-output', 'Вывод массива A', 400, 1300),
            mk('n12', 'start-end', 'Конец', 420, 1440),
          ];

          const edges: Edge[] = [
            edge('e1-2', 'n1', 'n2'),
            edge('e2-3', 'n2', 'n3'),
            edge('e3-4', 'n3', 'n4'),
            edge('e4-5', 'n4', 'n5', 'bottom', 'top', 'да'),
            edge('e4-11', 'n4', 'n11', 'right', 'top', 'нет'),
            edge('e5-6', 'n5', 'n6'),
            edge('e6-7', 'n6', 'n7', 'bottom', 'top', 'да'),
            edge('e6-10', 'n6', 'n10', 'right', 'top', 'нет'),
            edge('e7-8', 'n7', 'n8', 'right', 'left', 'да'),
            edge('e7-9', 'n7', 'n9', 'bottom', 'top', 'нет'),
            edge('e8-9', 'n8', 'n9', 'bottom', 'right'),
            edge('e9-6', 'n9', 'n6', 'left', 'left'),
            edge('e10-4', 'n10', 'n4', 'right', 'right'),
            edge('e11-12', 'n11', 'n12'),
          ];

          return { nodes, edges, selectedNodeId: null };
        }),
    }),
    {
      name: 'gost-flow-store',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        schemaPng: state.schemaPng,
      }),
    },
  ),
);

export const emptyGostNodeData: GostNodeData = {
  label: 'Новый блок',
  kind: 'process',
};
