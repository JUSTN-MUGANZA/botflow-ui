'use client';

import { useFlowStore } from '@/lib/store';
import { MessageSquare, HelpCircle, Split, Flag, MessageCircle, ToggleRight } from 'lucide-react';
import React from 'react';

export default function RightSidebar() {
  const nodes = useFlowStore(state => state.nodes);
  const updateNodeText = useFlowStore(state => state.updateNodeText);
  const deleteNode = useFlowStore(state => state.deleteNode);

  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full z-10 shrink-0 p-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Propriétés du nœud</h3>
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center p-6">
          <p className="text-sm text-gray-400">Sélectionnez un nœud pour voir ses propriétés.</p>
        </div>
      </aside>
    );
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'message': return { label: 'Message', icon: <MessageSquare size={16} className="text-blue-500" /> };
      case 'question': return { label: 'Question', icon: <HelpCircle size={16} className="text-emerald-500" /> };
      case 'condition': return { label: 'Condition', icon: <Split size={16} className="text-amber-500" /> };
      case 'end': return { label: 'Fin', icon: <Flag size={16} className="text-rose-500" /> };
      default: return { label: 'Inconnu', icon: <MessageCircle size={16} /> };
    }
  };

  const typeInfo = getTypeInfo(selectedNode.type || '');

  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full z-10 shrink-0">
      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Propriétés du nœud</h3>

        {/* Type Dropdown (Visuel uniquement pour l'instant) */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
            {typeInfo.icon}
            <span className="text-sm font-medium text-gray-800">{typeInfo.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {selectedNode.type === 'condition' ? 'Condition (Si réponse = ...)' : 'Contenu du message'}
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
            <textarea
              className="w-full p-3 text-sm text-gray-800 focus:outline-none resize-none bg-white"
              rows={5}
              value={selectedNode.data.text}
              onChange={(e) => updateNodeText(selectedNode.id, e.target.value)}
              placeholder={selectedNode.type === 'condition' ? 'Ex: Oui, Non...' : 'Tapez votre texte ici...'}
            />
            <div className="bg-gray-50 p-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Variables disponibles</span>
              <span className="cursor-pointer hover:text-indigo-600 font-bold text-lg leading-none">+</span>
            </div>
          </div>
        </div>

        {/* Paramètres */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-800 mb-4">Paramètres</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Délai avant le prochain nœud</span>
              <ToggleRight size={24} className="text-indigo-600" />
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <input type="number" defaultValue={1} className="w-16 p-2 text-sm text-center focus:outline-none" />
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-l border-gray-200 w-full">secondes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2.5 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors text-sm font-bold"
        >
          Supprimer le nœud
        </button>
      </div>
    </aside>
  );
}
