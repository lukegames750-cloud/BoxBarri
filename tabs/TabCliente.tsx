
import React, { useState, useEffect } from 'react';
import { User, Order, PackageSize, OrderStatus } from '../types';
import { Button, Card, Input, Select, StatusBadge } from '../components/UI';
import { PRICE_TABLE, PICKUP_POINTS } from '../constants';
import { ChatOverlay } from '../components/ChatOverlay';

interface TabClienteProps {
  currentUser: User;
  orders: Order[];
  onCreateOrder: (order: Partial<Order>) => void;
  onUpdateStatus: (id: string, s: OrderStatus, evidence?: string, rating?: number) => void;
  onSendMessage: (id: string, t: string, isAI?: boolean) => void;
  setActiveTab: (tab: any) => void;
  // Added props to fix App.tsx type error
  voiceChatId?: string | null;
  onVoiceChatClose?: () => void;
}

const TabCliente: React.FC<TabClienteProps> = ({ 
  currentUser, 
  orders, 
  onCreateOrder, 
  onUpdateStatus, 
  onSendMessage, 
  setActiveTab,
  // Added destructured props
  voiceChatId,
  onVoiceChatClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showRatingFor, setShowRatingFor] = useState<string | null>(null);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    itemNombre: '',
    origen: '',
    destino: '',
    tamano: PackageSize.S,
    instrucciones: '',
    puntoRecogidaId: PICKUP_POINTS[0].id
  });

  // Added effect to react to voice assistant triggers for chat
  useEffect(() => {
    if (voiceChatId) {
      setActiveChatOrderId(voiceChatId);
    }
  }, [voiceChatId]);

  // Handler to properly close chat and notify voice assistant if needed
  const handleCloseChat = () => {
    setActiveChatOrderId(null);
    if (onVoiceChatClose) onVoiceChatClose();
  };

  const myOrders = orders.filter(o => o.clientId === currentUser.id);
  const activeChatOrder = orders.find(o => o.id === activeChatOrderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const point = PICKUP_POINTS.find(p => p.id === formData.puntoRecogidaId);
    
    onCreateOrder({
      itemNombre: formData.itemNombre,
      clientId: currentUser.id,
      puntoRecogidaId: formData.puntoRecogidaId,
      origen: point ? point.nombre : 'Punto Desconocido',
      destino: formData.destino,
      tamano: formData.tamano,
      instrucciones: formData.instrucciones,
      precioEstimado: PRICE_TABLE[formData.tamano],
      estado: OrderStatus.CREADO,
    });

    setIsCreating(false);
    setFormData({ itemNombre: '', origen: '', destino: '', tamano: PackageSize.S, instrucciones: '', puntoRecogidaId: PICKUP_POINTS[0].id });
  };

  const handleFinish = (orderId: string) => {
    onUpdateStatus(orderId, OrderStatus.FINALIZADO, undefined, rating);
    setShowRatingFor(null);
  };

  const handleNoReceived = (orderId: string) => {
    onUpdateStatus(orderId, OrderStatus.INCIDENCIA);
    setActiveTab('rastreo');
  };

  if (isCreating) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right duration-300 bg-[#0a0518] min-h-screen text-white">
        <header className="flex items-center gap-4">
          <button onClick={() => setIsCreating(false)} className="p-4 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-3xl font-black tracking-tight">Nuevo Envío</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          <Input 
            label="¿Qué enviamos?" 
            placeholder="Ej: Laptop, Zapatillas, Libro..." 
            value={formData.itemNombre}
            onChange={e => setFormData({...formData, itemNombre: e.target.value})}
            required
          />
          
          <Select 
            label="Punto de Recogida (Entrega ahí)" 
            value={formData.puntoRecogidaId} 
            onChange={e => setFormData({...formData, puntoRecogidaId: e.target.value})}
          >
            {PICKUP_POINTS.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.barrio})</option>
            ))}
          </Select>

          <Input 
            label="Dirección de Destino" 
            placeholder="Calle, número, piso..." 
            value={formData.destino} 
            onChange={e => setFormData({...formData, destino: e.target.value})}
            required
          />

          <Select 
            label="Tamaño del Paquete" 
            value={formData.tamano} 
            onChange={e => setFormData({...formData, tamano: e.target.value as PackageSize})}
          >
            <option value={PackageSize.S}>S - Sobre / Pequeño (3.50€)</option>
            <option value={PackageSize.M}>M - Caja Mediana (5.50€)</option>
            <option value={PackageSize.L}>L - Bulto Grande (8.50€)</option>
          </Select>

          <Button type="submit" variant="primary" fullWidth className="py-7 text-xl rounded-[3rem] neon-shadow-purple mt-4">
            Solicitar BarriBox
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 relative pb-32">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Mis Envíos</h1>
          <p className="text-purple-300/40 text-[10px] font-black uppercase tracking-[0.4em]">Panel de Control</p>
        </div>
        <Button variant="glass" className="w-14 h-14 p-0 rounded-2xl border-2 border-[#ec4899]/30" onClick={() => setIsCreating(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="4"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </Button>
      </header>

      <section className="space-y-6">
        {myOrders.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-20 flex flex-col items-center gap-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Sin actividad operativa</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {myOrders.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map(order => {
              const needsConfirmation = order.estado === OrderStatus.ENTREGADO && !order.clienteConfirmado;
              const hasRepartidor = !!order.repartidorId;
              const isIncidency = order.estado === OrderStatus.INCIDENCIA;
              
              return (
                <Card key={order.id} className={`p-8 space-y-6 transition-all ${needsConfirmation ? 'border-[#ec4899] border-2 shadow-[0_0_30px_rgba(236,72,153,0.15)]' : ''} ${isIncidency ? 'border-red-500 shadow-[0_0_20px_rgba(239,44,44,0.1)]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-purple-300/30 uppercase tracking-widest mb-1 block">{order.id}</span>
                      <h3 className="text-xl font-black text-white truncate">{order.itemNombre || 'Paquete'}</h3>
                      {order.repartidorNombre && (
                         <p className="text-[10px] text-[#8b5cf6] font-black uppercase mt-1 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full"></span>
                           Repartidor: {order.repartidorNombre}
                         </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={order.estado} />
                      {hasRepartidor && order.estado !== OrderStatus.FINALIZADO && (
                        <button 
                          onClick={() => setActiveChatOrderId(order.id)}
                          className="w-10 h-10 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center border border-[#8b5cf6]/20 active:scale-90 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {needsConfirmation && (
                    <div className="space-y-3 animate-in zoom-in-95">
                       <div className="p-5 bg-[#ec4899]/10 rounded-3xl border border-[#ec4899]/20 text-center">
                          <p className="text-[10px] font-black uppercase text-pink-300 tracking-widest">Confirmación Necesaria</p>
                          <p className="text-xs text-white/60 font-medium mt-1">¿Has recibido tu paquete en destino?</p>
                       </div>
                       <Button variant="secondary" fullWidth className="py-6 rounded-2xl shadow-xl" onClick={() => setShowRatingFor(order.id)}>
                          Sí, confirmar recepción
                       </Button>
                       <button 
                         onClick={() => handleNoReceived(order.id)}
                         className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-500 transition-colors py-2"
                       >
                         No, no lo he recibido
                       </button>
                    </div>
                  )}

                  {!needsConfirmation && order.estado !== OrderStatus.FINALIZADO && !isIncidency && (
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ 
                         width: order.estado === OrderStatus.CREADO ? '10%' : 
                               order.estado === OrderStatus.LLEGADO_AL_PUNTO ? '30%' :
                               order.estado === OrderStatus.RECOGIDO ? '60%' :
                               order.estado === OrderStatus.EN_RUTA ? '85%' : '100%'
                       }}></div>
                    </div>
                  )}
                  
                  {isIncidency && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-red-500 tracking-widest">⚠️ Reclamación abierta</p>
                      <p className="text-[10px] text-red-300/60 font-medium mt-1">Hemos notificado al repartidor que no has recibido el paquete. Consulta el Radar.</p>
                    </div>
                  )}

                  {order.estado === OrderStatus.FINALIZADO && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={i < (order.ratingRepartidor || 0) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                       ))}
                       <span className="text-[9px] font-black uppercase text-gray-500 ml-auto tracking-widest">Servicio Finalizado</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de Valoración */}
      {showRatingFor && (
        <div className="fixed inset-0 z-[100] bg-[#0a0518]/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in">
           <Card className="w-full max-w-xs p-10 space-y-10 text-center border-[#ec4899] shadow-[0_0_60px_rgba(236,72,153,0.3)] rounded-[4rem]">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter">¡Entregado!</h3>
                <p className="text-[10px] text-purple-300/60 font-black uppercase tracking-widest">Valora la experiencia con el repartidor</p>
              </div>
              
              <div className="flex justify-center gap-4">
                 {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="transition-all active:scale-75">
                       <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill={rating >= star ? "#ec4899" : "none"} stroke="#ec4899" strokeWidth="2.5" className={`${rating >= star ? 'drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'opacity-20'}`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                 ))}
              </div>

              <Button variant="secondary" fullWidth className="py-6 rounded-3xl text-lg font-black tracking-widest" onClick={() => handleFinish(showRatingFor)}>
                 Cerrar Envío
              </Button>
           </Card>
        </div>
      )}

      {activeChatOrder && (
        <ChatOverlay 
          order={activeChatOrder} 
          currentUserId={currentUser.id} 
          onClose={handleCloseChat} 
          onSend={(t, isAI) => onSendMessage(activeChatOrder.id, t, isAI)} 
        />
      )}
    </div>
  );
};

export default TabCliente;
