import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';

export type FlowNodeData = {
  text: string;
};

export type AppState = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<FlowNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<FlowNodeData>) => void;
  updateNodeText: (nodeId: string, text: string) => void;
  deleteNode: (nodeId: string) => void;
  resetFlow: () => void;
  setFlow: (nodes: Node<FlowNodeData>[], edges: Edge[]) => void;
};

export const useFlowStore = create<AppState>()(
  temporal(
    persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as Node<FlowNodeData>[],
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },
      updateNodeText: (nodeId, text) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, text } } : n
          ),
        });
      },
      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        });
      },
      resetFlow: () => {
        set({ nodes: [], edges: [] });
      },
      setFlow: (nodes, edges) => {
        set({ nodes, edges });
      },
    }),
    {
      name: 'botflow-storage', // name of the item in the storage (must be unique)
    }
  ),
  {
    partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
  }
)
);
