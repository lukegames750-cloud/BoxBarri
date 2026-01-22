
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, Order, UserRole, OrderStatus } from '../types';

interface BarriProps {
  user: User;
  orders: Order[];
  onAction: (action: string, params: any) => void;
}

export const BarriAssistant: React.FC<BarriProps> = ({ user, orders, onAction }) => {
  const [status, setStatus] = useState<'sleeping' | 'listening' | 'processing' | 'speaking'>('sleeping');
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const isComponentMounted = useRef(true);
  const restartTimeoutRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  const killEverything = () => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    clearTimeout(silenceTimerRef.current);
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    setStatus('sleeping');
  };

  const speak = (text: string, onEnd?: () => void) => {
    killEverything();
    setStatus('speaking');
    isSpeakingRef.current = true;
    setAiText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (!isComponentMounted.current) return;
      if (onEnd) {
        setTimeout(() => onEnd(), 500);
      } else {
        setTimeout(() => startListening(true), 600);
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setTimeout(() => startListening(true), 600);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = (isWakeWordMode: boolean) => {
    if (!isComponentMounted.current || isSpeakingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    if (isWakeWordMode) {
      setStatus('sleeping');
      setTranscript('');
    } else {
      setStatus('listening');
      setTranscript(`Escuchando a ${user.nombre}...`);
    }

    recognition.onresult = (event: any) => {
      const results = event.results;
      const current = results[results.length - 1][0].transcript.toLowerCase();
      
      if (isWakeWordMode) {
        if (current.includes('hola') || current.includes('barri') || current.includes('oye')) {
          recognition.onend = null;
          recognition.stop();
          handleWakeUp();
        }
      } else {
        setTranscript(current);
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (current.trim().length > 1) {
            recognition.onend = null;
            recognition.stop();
            processInput(current);
          }
        }, 1800);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') return; 
      if (isComponentMounted.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => startListening(isWakeWordMode), 1000);
      }
    };

    recognition.onend = () => {
      if (isComponentMounted.current && !isSpeakingRef.current && status !== 'processing') {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (status === 'sleeping' || status === 'listening') {
             startListening(isWakeWordMode);
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch(e) {
      setTimeout(() => startListening(isWakeWordMode), 1000);
    }
  };

  const handleWakeUp = () => {
    speak(`Dime ${user.nombre}, ¿en qué puedo ayudarte?`, () => {
      startListening(false);
    });
  };

  const processInput = async (input: string) => {
    if (!input || input.length < 2) {
      startListening(true);
      return;
    }

    setStatus('processing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const marketOrders = orders.filter(o => !o.repartidorId);
      const myOrders = orders.filter(o => o.repartidorId === user.id && o.estado !== OrderStatus.FINALIZADO);

      const contextMarket = marketOrders.map(o => `[ID:${o.id}, Item:${o.itemNombre}, Origen:${o.origen}]`).join(', ');
      const contextMy = myOrders.map(o => `[ID:${o.id}, Item:${o.itemNombre}, Cliente:${o.clientNombre}, Destino:${o.destino}, Estado:${o.estado}]`).join(', ');

      const prompt = `Eres Barri, el asistente logístico de ÉLITE de BarriBox. Tu misión es ser un guía detallista para el repartidor ${user.nombre}.
      
      PERSONALIDAD:
      - Eres un experto en el barrio.
      - Hablas con detalle, como si estuvieras viendo un mapa de tráfico en tiempo real.
      - Eres proactivo y analítico. Dirígete al usuario siempre como ${user.nombre}.
      
      DATOS DISPONIBLES:
      - Mercado libre: ${contextMarket}
      - Paquetes de ${user.nombre}: ${contextMy}

      ACCIONES TÉCNICAS:
      - [NAVIGATE:tab] (inicio, rastreo, puntos, ayuda, datos)
      - [ASSIGN:id] (Asignar paquete)
      - [SEND_MESSAGE:orderId:texto] (Mensajería)
      - [OPEN_CHAT:id] (Abrir chat)

      INSTRUCCIONES DE RESPUESTA PARA "RUTAS" O "¿QUÉ HAGO?":
      1. ANALIZA los paquetes de ${user.nombre}.
      2. INVENTA detalles realistas de tráfico y disponibilidad de clientes.
      3. RECOMIENDA: "${user.nombre}, te recomiendo entregar primero el..." explicando motivos de cercanía y tiempo.
      4. Si pide asignar algo, explica por qué es una buena idea elegir ese local.

      IMPORTANTE: Sé detallado, profesional y llama al usuario por su nombre: ${user.nombre}. Máximo 80 palabras.
      ENTRADA: "${input}"`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const response = result.text || `Lo siento ${user.nombre}, no te oí bien.`;
      
      if (response.includes('[NAVIGATE:')) {
        const tab = response.match(/\[NAVIGATE:(.*?)\]/)?.[1];
        if (tab) onAction('NAVIGATE', { tab });
      }
      
      if (response.includes('[ASSIGN:')) {
        const id = response.match(/\[ASSIGN:(.*?)\]/)?.[1];
        if (id) onAction('ASSIGN', { id });
      }

      if (response.includes('[SEND_MESSAGE:')) {
        const parts = response.match(/\[SEND_MESSAGE:(.*?):(.*?)\]/);
        if (parts) onAction('SEND_MESSAGE', { orderId: parts[1], text: parts[2] });
      }

      if (response.includes('[OPEN_CHAT:')) {
        const id = response.match(/\[OPEN_CHAT:(.*?)\]/)?.[1];
        if (id) onAction('OPEN_CHAT', { id });
      }
      
      const cleanResponse = response.replace(/\[.*?\]/g, '').trim();
      speak(cleanResponse || `Hecho, ${user.nombre}.`);
    } catch (e) {
      speak(`Lo siento ${user.nombre}, perdí la conexión.`);
    }
  };

  const toggleAssistant = () => {
    if (status === 'sleeping') {
      handleWakeUp();
    } else {
      killEverything();
      setTimeout(() => startListening(true), 1000);
    }
  };

  useEffect(() => {
    isComponentMounted.current = true;
    startListening(true);
    return () => {
      isComponentMounted.current = false;
      killEverything();
    };
  }, []);

  return (
    <div className="fixed bottom-32 right-6 z-[500] flex flex-col items-end gap-3 pointer-events-none">
      {status !== 'sleeping' && (
        <div className={`w-72 p-6 glass rounded-[2.5rem] border-2 shadow-2xl animate-in slide-in-from-right pointer-events-auto ${
          status === 'listening' ? 'border-cyan-500 ring-4 ring-cyan-500/10' : 
          status === 'processing' ? 'border-amber-500 animate-pulse' : 'border-purple-500'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-cyan-500 animate-ping' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Guía de Ruta</span>
          </div>
          <p className="text-[13px] font-bold text-white leading-relaxed">
            {status === 'listening' ? (transcript || `Dime ${user.nombre}...`) : (aiText || transcript || "Analizando...")}
          </p>
        </div>
      )}

      <button 
        onClick={toggleAssistant}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto border-4 active:scale-90 shadow-2xl relative ${
          status === 'sleeping' ? 'bg-[#100a26] border-white/10' : 
          status === 'listening' ? 'bg-white border-cyan-500 scale-110 shadow-cyan-500/40 shadow-2xl' :
          status === 'processing' ? 'bg-amber-500 border-white/20' : 'bg-white border-purple-500'
        }`}
      >
        {status === 'sleeping' ? (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-cyan-400 tracking-tighter">BARRI</span>
            <div className="w-4 h-0.5 bg-cyan-400/50 rounded-full mt-0.5"></div>
          </div>
        ) : (
          <div className="flex gap-1.5 items-end h-7">
            <div className={`w-1 rounded-full transition-all ${status === 'listening' ? 'h-7 bg-cyan-500' : 'h-3 bg-purple-500 animate-bounce'}`}></div>
            <div className={`w-1 rounded-full transition-all ${status === 'listening' ? 'h-4 bg-cyan-400' : 'h-7 bg-purple-400 animate-bounce delay-75'}`}></div>
            <div className={`w-1 rounded-full transition-all ${status === 'listening' ? 'h-7 bg-cyan-500' : 'h-3 bg-purple-500 animate-bounce delay-150'}`}></div>
          </div>
        )}
      </button>
    </div>
  );
};
