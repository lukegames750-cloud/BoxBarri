
import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { SupportTicket, Order, User, UserRole } from '../types';
import { SupportChatOverlay } from '../components/SupportChatOverlay';
import { FAQBotOverlay } from '../components/FAQBotOverlay';

interface Props {
  orders: Order[];
  tickets: SupportTicket[];
  currentUser: User;
  onAddTicket: (t: SupportTicket) => void;
}

export const TabAyuda: React.FC<Props> = ({ tickets, currentUser }) => {
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isFAQBotOpen, setIsFAQBotOpen] = useState(false);
  const [callRequested, setCallRequested] = useState(false);

  const isRepartidor = currentUser.rol === UserRole.REPARTIDOR;

  const handleRequestCall = () => {
    setCallRequested(true);
    // Simulamos que se procesa la solicitud
    setTimeout(() => {
      // Opcional: resetear después de un tiempo o dejarlo como "Solicitado"
    }, 5000);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in pb-32">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white">Soporte</h1>
        <p className="text-purple-300/30 text-[10px] font-black uppercase tracking-[0.4em]">BarriBox Help Center</p>
      </header>

      <section className="space-y-6">
        {/* RECUADRO DE LLAMADA (SOLO REPARTIDORES) */}
        {isRepartidor && (
          <Card 
            className={`p-8 border-2 transition-all ${callRequested ? 'border-green-500 bg-green-500/5' : 'border-[#f59e0b]/30 hover:border-[#f59e0b]'}`}
          >
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${callRequested ? 'bg-green-500 text-white' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}`}>
                 {callRequested ? '✓' : '📞'}
               </div>
               <div className="flex-1">
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">
                   {callRequested ? 'Llamada Solicitada' : '¿Problemas en ruta?'}
                 </h3>
                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 leading-relaxed">
                   {callRequested 
                     ? `Te llamaremos al ${currentUser.contacto} en menos de 2 min.` 
                     : 'Pulsa aquí y un agente te llamará de inmediato.'}
                 </p>
               </div>
            </div>
            {!callRequested && (
              <Button 
                variant="primary" 
                fullWidth 
                className="mt-6 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-black font-black" 
                onClick={handleRequestCall}
              >
                Pedir que me llamen
              </Button>
            )}
          </Card>
        )}

        {/* CHATBOT DE AYUDA RÁPIDA (NUEVO) */}
        <Card 
          onClick={() => setIsFAQBotOpen(true)}
          className="p-8 flex items-center gap-6 border-2 border-transparent hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Asistente Logístico</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Chatbot para dudas rápidas</p>
          </div>
        </Card>

        {/* Tarjeta interactiva para iniciar chat con humano */}
        <Card 
          onClick={() => setIsSupportChatOpen(true)}
          className="p-10 text-center space-y-6 group border-2 border-transparent hover:border-[#8b5cf6]/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#8b5cf6]/10 transition-all"></div>
          
          <div className="relative">
            <div className="w-20 h-20 bg-[#8b5cf6]/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
              <span className="animate-bounce-slow">💬</span>
            </div>
            
            <div className="mt-6 space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Hablar con Lucía</h3>
              <p className="text-xs text-gray-500 font-medium px-4 leading-relaxed">
                Soporte humano personalizado para incidencias críticas o dudas complejas.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Lucía está disponible</span>
          </div>
        </Card>

        <div className="grid gap-4">
           <h3 className="text-[10px] font-black text-purple-300/20 uppercase tracking-widest ml-2">Historial de Tickets</h3>
           {tickets.length === 0 ? (
             <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
               <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad de soporte</p>
             </div>
           ) : (
             tickets.map(t => (
               <Card key={t.id} className="p-6 flex justify-between items-center border border-white/5">
                 <div>
                   <h4 className="font-black text-sm text-white uppercase tracking-tight">{t.motivo}</h4>
                   <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{t.estado}</p>
                 </div>
                 <div className={`w-2 h-2 rounded-full ${t.estado === 'Abierto' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
               </Card>
             ))
           )}
        </div>
      </section>

      {/* Overlay del chat de soporte HUMANO */}
      {isSupportChatOpen && (
        <SupportChatOverlay onClose={() => setIsSupportChatOpen(false)} />
      )}

      {/* Overlay del CHATBOT */}
      {isFAQBotOpen && (
        <FAQBotOverlay onClose={() => setIsFAQBotOpen(false)} currentUser={currentUser} />
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
