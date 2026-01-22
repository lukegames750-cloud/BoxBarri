
import React, { useState } from 'react';
import { Button } from './UI';

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const screens = [
    {
      title: "Paquetería de Barrio",
      desc: "Conectamos puntos de recogida locales con vecinos para entregas rápidas y seguras en tu zona.",
      icon: "📦",
      color: "bg-[#10b981]"
    },
    {
      title: "Colaboración Real",
      desc: "Repartidores locales y comercios del barrio unidos para una logística más sostenible.",
      icon: "🏘️",
      color: "bg-[#f97316]"
    },
    {
      title: "Seguridad Total",
      desc: "Seguimiento en tiempo real y confirmación por código para que tu paquete esté siempre a salvo.",
      icon: "🛡️",
      color: "bg-[#3b82f6]"
    }
  ];

  return (
    <div className="h-screen bg-[#0a0518] flex flex-col p-10 text-white animate-in fade-in">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className={`w-32 h-32 ${screens[step].color} rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl animate-bounce`}>
          {screens[step].icon}
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tighter">{screens[step].title}</h2>
          <p className="text-gray-400 font-medium leading-relaxed">{screens[step].desc}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center gap-2 mb-6">
          {screens.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-[#10b981]' : 'w-2 bg-white/10'}`}></div>
          ))}
        </div>
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => step < 2 ? setStep(step + 1) : onComplete()}
        >
          {step < 2 ? "Siguiente" : "Empezar Ahora"}
        </Button>
        <button onClick={onComplete} className="w-full text-xs font-bold text-gray-500 uppercase tracking-widest py-2">Saltar</button>
      </div>
    </div>
  );
};
