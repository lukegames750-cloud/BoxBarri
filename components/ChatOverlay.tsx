
import React, { useState, useEffect, useRef } from 'react';
import { Order, ChatMessage } from '../types';
import { Button } from './UI';
import { GoogleGenAI } from '@google/genai';

interface Props {
  order: Order;
  currentUserId: string;
  onClose: () => void;
  onSend: (text: string, isAI?: boolean) => void;
}

export const ChatOverlay: React.FC<Props> = ({ order, currentUserId, onClose, onSend }) => {
  const [text, setText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [order.chat]);

  const handleAIService = async (userText: string) => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Actúa como el sistema inteligente de BarriBox. El cliente ${order.clientNombre} está hablando con el repartidor ${order.repartidorNombre || 'aún no asignado'}.
      ESTADO ACTUAL DEL PEDIDO:
      - ID: ${order.id}
      - Item: ${order.itemNombre}
      - Estado: ${order.estado}
      - Destino: ${order.destino}
      - Ubicación: El repartidor está en ${order.estado === 'En ruta' ? 'camino (10 min)' : 'el punto de recogida'}.
      
      Mensaje del usuario: "${userText}"
      
      Responde de forma natural, empática y breve (máximo 20 palabras). Si el estado es "En ruta", inventa un tiempo estimado creíble basado en el tráfico del barrio. Siempre saluda por el nombre si lo conoces.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const aiText = response.text || "No puedo procesar eso ahora mismo.";
      // IMPORTANTE: Pasamos true para indicar que es un mensaje de IA
      onSend(aiText, true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  const submitMsg = () => {
    if (!text.trim()) return;
    const userMsg = text;
    onSend(userMsg, false); // Mensaje del usuario (isAI = false)
    setText('');
    
    if (userMsg.includes('?') || userMsg.toLowerCase().includes('donde') || userMsg.toLowerCase().includes('cuanto')) {
      handleAIService(userMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0518] flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0518]/90 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#3b82f6] to-[#0ea5e9] rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(59,130,246,0.3)]">AI</div>
          <div>
            <h3 className="text-sm font-black text-white leading-none">{order.itemNombre}</h3>
            <p className="text-[9px] font-black text-[#3b82f6] uppercase tracking-widest leading-none mt-1">Soporte Inteligente</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse">
        {isThinking && (
          <div className="self-start bg-[#160d2d] p-4 rounded-3xl rounded-tl-none animate-pulse border border-[#3b82f6]/20">
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        {[...order.chat].reverse().map(msg => {
          const isMe = msg.senderId === currentUserId;
          const isAI = msg.senderId === 'ai-system';
          
          let bubbleStyles = "";
          if (isMe) {
            bubbleStyles = "bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] self-end rounded-tr-none";
          } else if (isAI) {
            bubbleStyles = "bg-gradient-to-br from-[#3b82f6] to-[#0ea5e9] self-start rounded-tl-none shadow-[0_0_15px_rgba(59,130,246,0.15)]";
          } else {
            bubbleStyles = "bg-[#160d2d] border border-[#2d1b54] self-start rounded-tl-none";
          }

          return (
            <div key={msg.id} className={`max-w-[85%] p-4 rounded-3xl ${bubbleStyles}`}>
              {!isMe && <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">{msg.senderNombre}</p>}
              <p className="text-sm font-semibold text-white leading-relaxed">{msg.text}</p>
              <span className={`text-[8px] font-black uppercase tracking-widest block mt-2 opacity-40`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-[#0a0518] border-t border-white/5 space-y-4 pb-10">
        <div className="flex gap-3">
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitMsg()}
            placeholder="Escribe aquí..."
            className="flex-1 bg-[#160d2d] border-2 border-[#2d1b54] p-5 rounded-2xl text-sm font-bold text-white placeholder-purple-300/20 focus:outline-none focus:border-[#8b5cf6] transition-all"
          />
          <button 
            disabled={!text.trim() || isThinking}
            onClick={submitMsg}
            className="w-14 h-14 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-30 active:scale-90 transition-all"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
