'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFlowStore } from '@/lib/store';
import { Send, Bot, User, X } from 'lucide-react';

type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

type HistoryLog = {
  step: number;
  nodeType: string;
  text: string;
  status: 'done' | 'waiting';
};

export default function Simulator({ onClose }: { onClose: () => void }) {
  const { nodes, edges } = useFlowStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  type ChoiceOption = { label: string; nextNodeId: string; handle: string };
  const [options, setOptions] = useState<ChoiceOption[]>([]);
  
  const [stepCount, setStepCount] = useState(1);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, options]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    startSimulation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSimulation = () => {
    setMessages([]);
    setHistory([]);
    setOptions([]);
    setIsTyping(true);
    setStepCount(1);
    
    const targetIds = new Set(edges.map(e => e.target));
    const rootNodes = nodes.filter(n => !targetIds.has(n.id));
    
    if (rootNodes.length > 0) {
      setTimeout(() => {
        processNode(rootNodes[0].id, 1);
      }, 500);
    } else {
      setIsTyping(false);
      setMessages([{ id: 'err', sender: 'bot', text: "Erreur : aucun point de départ." }]);
    }
  };

  const processNode = (nodeId: string, currentStep: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      setIsTyping(false);
      return;
    }

    setIsTyping(false);
    
    const nodeText = node.data.text || (node.type === 'end' ? 'Fin du flux' : '...');

    if (node.type === 'message') {
      setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'bot', text: nodeText }]);
      setHistory(prev => [...prev, { step: currentStep, nodeType: 'Message', text: nodeText, status: 'done' }]);
      
      const outgoingEdge = edges.find(e => e.source === nodeId);
      if (outgoingEdge) {
        setIsTyping(true);
        setTimeout(() => processNode(outgoingEdge.target, currentStep + 1), 1000);
      }
    } 
    else if (node.type === 'question') {
      setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'bot', text: nodeText }]);
      
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      const conditionNodes = outgoingEdges
        .map(e => nodes.find(n => n.id === e.target))
        .filter(n => n?.type === 'condition') as typeof nodes;

      const choices: ChoiceOption[] = [];

      conditionNodes.forEach(cond => {
        if (cond.data.text) {
          choices.push({ label: cond.data.text, nextNodeId: cond.id, handle: 'true' });
        }
      });

      // Vérifier si l'un des nœuds condition a une sortie "Non" (false) connectée
      const hasFalseEdge = conditionNodes.find(cond => edges.find(e => e.source === cond.id && e.sourceHandle === 'false'));
      if (hasFalseEdge) {
        const firstCondText = conditionNodes[0]?.data.text?.toLowerCase();
        const fallbackLabel = firstCondText === 'oui' ? 'Non' : 'Autre';
        choices.push({ label: fallbackLabel, nextNodeId: hasFalseEdge.id, handle: 'false' });
      }
      
      setOptions(choices);
      setHistory(prev => [
        ...prev, 
        { step: currentStep, nodeType: 'Question', text: nodeText, status: 'done' },
        { step: currentStep, nodeType: 'Attente', text: 'En attente de réponse...', status: 'waiting' }
      ]);
      setStepCount(currentStep);
    }
    else if (node.type === 'end') {
      setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'bot', text: nodeText }]);
      setHistory(prev => [...prev, { step: currentStep, nodeType: 'Fin', text: nodeText, status: 'done' }]);
      setOptions([]);
    }
  };

  const handleOptionClick = (option: ChoiceOption) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'user', text: option.label }]);
    setOptions([]);
    setIsTyping(true);
    
    setHistory(prev => {
      const newHist = [...prev];
      const waitIndex = newHist.findIndex(h => h.status === 'waiting');
      if (waitIndex >= 0) {
        newHist.splice(waitIndex, 1);
      }
      return newHist;
    });
    
    const conditionOutgoingEdge = edges.find(e => e.source === option.nextNodeId && e.sourceHandle === option.handle);
    
    setTimeout(() => {
      if (conditionOutgoingEdge) {
        processNode(conditionOutgoingEdge.target, stepCount + 1);
      } else {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Fin de la conversation." }]);
      }
    }, 600);
  };

  const handleSendInput = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    
    const text = inputText.trim();
    setInputText('');
    
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'user', text }]);
    
    const matchedOption = options.find(opt => opt.label.toLowerCase() === text.toLowerCase());
    
    setOptions([]);
    setIsTyping(true);
    
    setHistory(prev => {
      const newHist = [...prev];
      const waitIndex = newHist.findIndex(h => h.status === 'waiting');
      if (waitIndex >= 0) newHist.splice(waitIndex, 1);
      return newHist;
    });

    setTimeout(() => {
      if (matchedOption) {
        const conditionOutgoingEdge = edges.find(e => e.source === matchedOption.nextNodeId && e.sourceHandle === matchedOption.handle);
        if (conditionOutgoingEdge) {
          processNode(conditionOutgoingEdge.target, stepCount + 1);
        } else {
          setIsTyping(false);
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Fin de la conversation." }]);
        }
      } else {
        // Fallback sur le lien 'false' si le texte ne correspond pas
        const fallbackOption = options.find(opt => opt.handle === 'false');
        if (fallbackOption) {
          const conditionOutgoingEdge = edges.find(e => e.source === fallbackOption.nextNodeId && e.sourceHandle === 'false');
          if (conditionOutgoingEdge) {
            processNode(conditionOutgoingEdge.target, stepCount + 1);
            return;
          }
        }

        setIsTyping(false);
        if (options.length > 0) {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Je n'ai pas bien compris. Veuillez choisir l'une des options proposées." }]);
          setOptions(options); // restore options
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Fin de la conversation." }]);
        }
      }
    }, 600);
  };

  return (
    <div className="w-full h-full flex bg-white dark:bg-gray-900 relative rounded-tl-xl overflow-hidden transition-colors">
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10">
        <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Simulateur</h3>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border-r border-gray-100 dark:border-gray-800 flex flex-col pt-10">
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900 custom-scrollbar">
          
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm text-[14px] leading-relaxed font-medium ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {options.length > 0 && (
              <div className="flex flex-row justify-center gap-3 mt-4">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-[14px] transition-all hover:shadow-md active:scale-95 ${
                      idx === 0 ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300' : 
                      idx === 1 ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300' :
                      'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendInput} className="h-[68px] border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3 bg-white dark:bg-gray-900 px-6">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Votre réponse..." 
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !inputText.trim()} className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* History */}
      <div className="w-[380px] flex flex-col pt-10 shrink-0 bg-white">
        <div className="px-6 py-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Historique du simulateur</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
          <div className="flex flex-col">
            {history.map((log, i) => (
              <div key={i} className="flex gap-4 relative pb-6">
                {i !== history.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100"></div>}
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                  log.status === 'waiting' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {log.status === 'waiting' ? '↑' : log.step}
                </div>
                
                <div className="flex-1 pt-0.5">
                  <div className="text-sm font-bold text-gray-800 mb-1">{log.nodeType}</div>
                  <div className={`text-xs ${log.status === 'waiting' ? 'text-indigo-600 italic font-semibold' : 'text-gray-500 font-medium'}`}>
                    {log.status !== 'waiting' && <span className="inline-block mr-1">👋</span>}
                    {log.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
