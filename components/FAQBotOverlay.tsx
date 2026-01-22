
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User } from '../types';

export const FAQBotOverlay: React.FC<{ onClose: () => void, currentUser: User }> = ({ onClose, currentUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 'bot-1',
      sender: 'bot',
      text: `¡Hola ${currentUser.nombre}! Soy el Asistente BarriBox. Puedo resolver tus dudas sobre pagos, escaneo o rutas en segundos. ¿En qué te ayudo?`,
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

    const userMsg = {
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
      const prompt = `Eres el Asistente Digital de BarriBox (BOT). 
      Tu objetivo es responder dudas técnicas de la app de forma rápida y eficiente.
      USUARIO ACTUAL: ${currentUser.nombre}, Rol: ${currentUser.rol}.
      
      TEMAS FRECUENTES:
      - Escaneo: Se hace desde la pestaña "Mis Rutas" pulsando el botón secundario.
      - Pagos: Los repartidores cobran 4.50€ por entrega finalizada.
      - Zonas: Operamos en Terrassa (La Maurina, Roc Blanc, etc).
      - Problemas: Si el bot no sabe algo, debe recomendar "Hablar con Lucía" en el chat humano.
      
      Responde de forma concisa, útil y directa (máximo 25 palabras).
      Mensaje: "${currentInput}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: response.text || "No entiendo la consulta. Prueba a hablar con un humano.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0518]/95 backdrop-blur-xl flex flex-col animate-in zoom-in-95 duration-300">
      <header className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            🤖
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-none">Asistente BarriBox</h3>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Bot de Respuesta Rápida</p>
          </div>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 rounded-full border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] p-5 rounded-[2rem] ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-white self-start rounded-tl-none shadow-xl'
            }`}
          >
            <p className="text-sm font-semibold">{msg.text}</p>
            <span className="text-[8px] font-black uppercase opacity-30 mt-2 block">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
        {isThinking && (
          <div className="self-start bg-white/5 p-4 rounded-3xl animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
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
            placeholder="Hazme una pregunta rápida..."
            className="flex-1 bg-[#160d2d] border-2 border-[#2d1b54] p-5 rounded-[1.5rem] text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          />
          <button 
            disabled={!inputText.trim() || isThinking}
            onClick={handleSend}
            className="w-14 h-14 bg-blue-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
