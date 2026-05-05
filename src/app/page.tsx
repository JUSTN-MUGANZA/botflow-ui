'use client';

import { useState, useEffect } from 'react';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import Simulator from '@/components/simulator/Simulator';
import { Play, Undo, Redo, Upload, Download, Moon, Settings, Sun } from 'lucide-react';
import { useFlowStore } from '@/lib/store';
import { useStore } from 'zustand';

export default function Home() {
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { nodes, edges } = useFlowStore();
  const setFlow = useFlowStore((state) => state.setFlow);
  
  const undo = useStore(useFlowStore.temporal, (state) => state.undo);
  const redo = useStore(useFlowStore.temporal, (state) => state.redo);
  const pastStates = useStore(useFlowStore.temporal, (state) => state.pastStates);
  const futureStates = useStore(useFlowStore.temporal, (state) => state.futureStates);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const exportToJson = () => {
    const flow = { nodes, edges };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "botflow_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importFromJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.nodes && parsed.edges) {
            setFlow(parsed.nodes, parsed.edges);
          }
        } catch (error) {
          console.error("Erreur lors de l'importation du fichier", error);
          alert("Fichier non valide ou corrompu.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <main className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 flex-col overflow-hidden font-sans transition-colors">
      {/* Header */}
      <header className="h-[60px] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-20 transition-colors">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white font-black text-lg leading-none">B</span>
            </div>
            <h1 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">BotFlow</h1>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Inscription à l'événement</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button 
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo size={16} />
            </button>
          </div>

          <button onClick={exportToJson} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Upload size={16} /> Exporter
          </button>

          <button onClick={importFromJson} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Download size={16} /> Importer
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-md ml-2"
          >
            <Play size={16} fill="currentColor" /> Simuler
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        
        <div className="flex-1 relative flex flex-col min-w-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
          <div className="flex-1 relative">
             <FlowCanvas />
          </div>
          
          {simulatorOpen && (
            <div className="h-[380px] border-t border-gray-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] flex shrink-0 z-30 animate-in slide-in-from-bottom-full duration-300">
               <Simulator onClose={() => setSimulatorOpen(false)} />
            </div>
          )}
        </div>

        <RightSidebar />
      </div>
    </main>
  );
}
