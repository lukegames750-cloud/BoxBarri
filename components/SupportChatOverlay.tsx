
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from './UI';

interface SupportMsg {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export const SupportChatOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<SupportMsg[]>([
    {
      id: 'initial',
      sender: 'agent',
      text: 'Hola, soy Lucía de Soporte Central de BarriBox. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMsg: SupportMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Actúa como Lucía, una operadora de soporte HUMANO real de BarriBox. 
      REGLAS DE IDENTIDAD:
      - Tú eres Lucía. Eres una trabajadora de BarriBox.
      - Hablas con el repartidor o cliente que tiene un problema.
      - Tu tono es empático, humano y resolutivo.
      - JAMÁS digas que eres una IA. Eres Lucía de soporte.
      
      Mensaje del usuario: "${currentInput}"
      Respuesta de Lucía (breve, máximo 30 palabras):`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const agentMsg: SupportMsg = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: response.text || "Disculpa, he tenido un pequeño error de conexión. ¿Puedes repetir?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0518] flex flex-col animate-in slide-in-from-bottom duration-500">
      <header className="p-6 border-b border-white/10 flex justify-between items-center glass">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] rounded-2xl flex items-center justify-center font-black text-white shadow-lg overflow-hidden border border-white/20">
              <span className="text-xl">👩‍💼</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#0a0518] rounded-full"></div>
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-none">Lucía (Soporte Real)</h3>
            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1">Conectada • BarriBox Central</p>
          </div>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end self-end' : 'items-start self-start'}`}
          >
            {/* ETIQUETA DE IDENTIDAD CLARA */}
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${msg.sender === 'user' ? 'text-purple-300/40 mr-2' : 'text-pink-400 ml-2'}`}>
              {msg.sender === 'user' ? 'Tú (Enviado)' : 'LUCÍA (BARRIBOX SOPORTE)'}
            </span>

            <div 
              className={`p-5 rounded-[2.2rem] shadow-xl ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white rounded-tr-none' 
                  : 'bg-[#1a1433] border-2 border-[#ec4899]/30 text-white rounded-tl-none'
              }`}
            >
              <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
              <span className="text-[8px] font-black uppercase tracking-widest block mt-2 opacity-30">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="self-start flex flex-col items-start max-w-[85%]">
            <span className="text-[8px] font-black uppercase tracking-widest mb-1.5 text-pink-400 ml-2">Lucía está escribiendo...</span>
            <div className="bg-[#1a1433] p-5 rounded-[2.2rem] rounded-tl-none animate-pulse border-2 border-[#ec4899]/10">
               <div className="flex gap-1.5">
                 <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pb-12 bg-[#0a0518] border-t border-white/5">
        <div className="flex gap-3">
          <input 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 bg-[#160d2d] border-2 border-[#2d1b54] p-5 rounded-[2rem] text-sm font-bold text-white placeholder-purple-300/20 focus:outline-none focus:border-[#8b5cf6] transition-all"
          />
          <button 
            disabled={!inputText.trim() || isThinking}
            onClick={handleSend}
            className="w-16 h-16 bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
