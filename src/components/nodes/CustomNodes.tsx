import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNodeData, useFlowStore } from '@/lib/store';

// Helper for finding node index
const useNodeIndex = (id: string) => {
  const nodes = useFlowStore(state => state.nodes);
  return nodes.findIndex(n => n.id === id) + 1;
};

const NodeWrapper = ({ id, type, title, colorClass, children, selected = false, showHandles = true }: any) => {
  const index = useNodeIndex(id);
  
  return (
    <div className={`min-w-[240px] max-w-[280px] bg-white rounded-xl border transition-all shadow-sm
      ${selected ? 'border-indigo-500 shadow-md ring-4 ring-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
    >
      {/* Target Handle (Left) */}
      {showHandles && type !== 'start' && (
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white" />
      )}
      
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 ${colorClass} rounded-t-[11px]`}>
        <div className="bg-white/80 w-5 h-5 rounded flex items-center justify-center text-[10px] font-black text-gray-700">
          {index}
        </div>
        <div className="font-bold text-[13px] tracking-wide text-gray-800 flex-1">{title}</div>
      </div>
      
      {/* Body */}
      <div className="p-4 text-[13px] text-gray-600 leading-relaxed font-medium">
        {children}
      </div>

      {/* Default Source Handle (Right) */}
      {showHandles && type !== 'end' && type !== 'condition' && (
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400 border-2 border-white" />
      )}
    </div>
  );
};

export const MessageNode = ({ id, data, selected }: NodeProps<FlowNodeData>) => (
  <NodeWrapper id={id} type="message" title="Message" colorClass="bg-blue-100" selected={selected}>
    {data.text ? (
      <div className="flex gap-2">
        <span>👋</span> <span>{data.text}</span>
      </div>
    ) : (
      <span className="text-gray-400 italic">Vide...</span>
    )}
  </NodeWrapper>
);

export const QuestionNode = ({ id, data, selected }: NodeProps<FlowNodeData>) => (
  <NodeWrapper id={id} type="question" title="Question" colorClass="bg-emerald-100" selected={selected}>
    <div className="mb-4">
      {data.text || <span className="text-gray-400 italic">Vide...</span>}
    </div>
    
    <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-t border-gray-100 pt-2">
      <span className="text-emerald-600/70">Oui</span>
      <span className="text-rose-600/70">Non</span>
    </div>
  </NodeWrapper>
);

export const ConditionNode = ({ id, data, selected }: NodeProps<FlowNodeData>) => (
  <NodeWrapper id={id} type="condition" title="Condition" colorClass="bg-amber-100" selected={selected} showHandles={false}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white" />
    
    <div className="mb-4 flex items-center gap-1.5">
      <span className="text-gray-500">Si réponse =</span>
      <span className="font-bold text-amber-600">{data.text || '...'}</span>
    </div>

    <div className="flex items-center justify-between text-xs font-bold border-t border-gray-100 pt-3 px-2">
      <div className="text-emerald-500 relative">
        Oui
        <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-emerald-400 border-2 border-white absolute -bottom-[19px] left-1/2 -translate-x-1/2" />
      </div>
      <div className="text-rose-500 relative">
        Non
        <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-rose-400 border-2 border-white absolute -bottom-[19px] left-1/2 -translate-x-1/2" />
      </div>
    </div>
  </NodeWrapper>
);

export const EndNode = ({ id, data, selected }: NodeProps<FlowNodeData>) => (
  <NodeWrapper id={id} type="end" title="Fin" colorClass="bg-rose-100" selected={selected} showHandles={false}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
    {data.text || <span className="text-gray-500">Fin de la conversation.</span>}
  </NodeWrapper>
);

export const nodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  condition: ConditionNode,
  end: EndNode,
};
