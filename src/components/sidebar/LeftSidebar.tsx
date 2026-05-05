'use client';

import { MessageSquare, HelpCircle, Split, Flag, Plus } from 'lucide-react';
import React from 'react';
import { useFlowStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

const nodeTypesList = [
  { type: 'message', label: 'Message', description: 'Le bot envoie un message', icon: <MessageSquare size={16} className="text-blue-500" />, bgColor: 'bg-blue-50', iconBg: 'bg-blue-100' },
  { type: 'question', label: 'Question', description: 'Le bot pose une question', icon: <HelpCircle size={16} className="text-emerald-500" />, bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
  { type: 'condition', label: 'Condition', description: 'Branchement logique', icon: <Split size={16} className="text-amber-500" />, bgColor: 'bg-amber-50', iconBg: 'bg-amber-100' },
  { type: 'end', label: 'Fin', description: 'Termine le flux', icon: <Flag size={16} className="text-rose-500" />, bgColor: 'bg-rose-50', iconBg: 'bg-rose-100' },
];

export default function LeftSidebar() {
  const nodes = useFlowStore(state => state.nodes);
  const addNode = useFlowStore(state => state.addNode);
  const resetFlow = useFlowStore(state => state.resetFlow);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = (nodeType: string) => {
    const offset = nodes.length * 20;
    const newNode = {
      id: uuidv4(),
      type: nodeType,
      position: { x: 250 + (offset % 200), y: 150 + (offset % 200) },
      data: { text: '' },
    };
    addNode(newNode);
  };

  return (
    <aside className="w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full z-10 shrink-0 transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <Plus size={18} /> Ajouter un nœud
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Nœuds */}
        <div className="p-4 pt-2">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Nœuds</h3>
          <div className="flex flex-col gap-2">
            {nodeTypesList.map((nt) => (
              <div
                key={nt.type}
                className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer transition-all active:scale-[0.98] ${nt.bgColor}`}
                onDragStart={(e) => onDragStart(e, nt.type)}
                onClick={() => onNodeClick(nt.type)}
                draggable
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${nt.iconBg} dark:opacity-80`}>
                  {nt.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{nt.label}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{nt.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flows */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Flows</h3>
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg cursor-pointer">
              Inscription à l'événement
            </div>
            <div 
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer" 
              onClick={() => {
                if(window.confirm('Voulez-vous basculer vers le flux "FAQ Bot" ? Les modifications non sauvegardées seront perdues.')) {
                  resetFlow();
                }
              }}
            >
              FAQ Bot
            </div>
            <div 
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer" 
              onClick={() => {
                if(window.confirm('Voulez-vous basculer vers le flux "Support client" ? Les modifications non sauvegardées seront perdues.')) {
                  resetFlow();
                }
              }}
            >
              Support client
            </div>
            <div 
              className="px-3 py-2 mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
              onClick={() => {
                if(window.confirm('Voulez-vous vraiment effacer le flow actuel pour en créer un nouveau ?')) {
                  resetFlow();
                }
              }}
            >
              <Plus size={16} /> Nouveau flow
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
