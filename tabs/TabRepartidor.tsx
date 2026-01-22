
import React, { useState, useMemo, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { Button, Card, StatusBadge } from '../components/UI';
import { ChatOverlay } from '../components/ChatOverlay';
import { ScannerOverlay } from '../components/ScannerOverlay';

interface Props {
  currentUser: User;
  orders: Order[];
  onUpdateStatus: (id: string, s: OrderStatus, evidence?: string) => void;
  onSendMessage: (id: string, t: string, isAI?: boolean) => void;
  recommendedOrderId?: string | null;
  voiceChatId?: string | null;
  onVoiceChatClose?: () => void;
}

const TabRepartidor: React.FC<Props> = ({ currentUser, orders, onUpdateStatus, onSendMessage, recommendedOrderId, voiceChatId, onVoiceChatClose }) => {
  const [subTab, setSubTab] = useState<'market' | 'assigned'>('market');
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [scanningOrderId, setScanningOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (voiceChatId) {
      setActiveChatOrderId(voiceChatId);
      setSubTab('assigned');
    }
  }, [voiceChatId]);

  const marketOrders = useMemo(() => orders.filter(o => 
    !o.repartidorId && 
    (o.estado === OrderStatus.CREADO || o.estado === OrderStatus.LLEGADO_AL_PUNTO)
  ), [orders]);

  const myOrders = useMemo(() => orders.filter(o => 
    o.repartidorId === currentUser.id && 
    o.estado !== OrderStatus.FINALIZADO
  ), [orders, currentUser.id]);

  const activeChatOrder = orders.find(o => o.id === activeChatOrderId);
  const totalEarnings = orders.filter(o => o.repartidorId === currentUser.id && (o.estado === OrderStatus.FINALIZADO || o.estado === OrderStatus.ENTREGADO)).length * 4.5;

  const handleCloseChat = () => {
    setActiveChatOrderId(null);
    if (onVoiceChatClose) onVoiceChatClose();
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="p-8 pb-4 space-y-6 bg-[#0a0518]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">Logística</h1>
            <p className="text-pink-400/40 text-[10px] font-black uppercase tracking-[0.4em]">Sector {currentUser.zona}</p>
          </div>
          <div className="bg-[#160d2d] border-2 border-[#ec4899]/20 px-6 py-3 rounded-[2rem] flex flex-col items-center">
            <span className="text-[8px] uppercase font-black text-pink-300/60 tracking-widest">Cartera</span>
            <span className="text-xl font-black text-white">{totalEarnings.toFixed(2)}€</span>
          </div>
        </div>

        <div className="flex p-1 bg-[#160d2d] rounded-[2.5rem] border border-white/5 relative h-16">
          <button onClick={() => setSubTab('market')} className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-all ${subTab === 'market' ? 'text-white' : 'text-purple-300/30'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Paquetes Libres</span>
            {marketOrders.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>}
          </button>
          <button onClick={() => setSubTab('assigned')} className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-all ${subTab === 'assigned' ? 'text-white' : 'text-purple-300/30'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Mis Rutas</span>
            {myOrders.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-[#8b5cf6] rounded-full"></span>}
          </button>
          <div className="absolute top-1 bottom-1 w-[49%] bg-[#8b5cf6] rounded-[2.2rem] transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]" style={{ left: subTab === 'market' ? '4px' : '50.5%' }}></div>
        </div>
      </header>

      <div className="p-8 pt-6 pb-32 space-y-8">
        {subTab === 'market' ? (
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300/20">Mercado de Barrio</h2>
               <span className="text-[8px] font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">{marketOrders.length} disponibles</span>
            </div>
            {marketOrders.map(order => (
              <Card key={order.id} className="p-8 space-y-6 border-2 border-[#2d1b54] hover:border-[#8b5cf6]/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[18px]">{order.itemNombre.toLowerCase().includes('pati') ? '🛴' : '📦'}</span>
                        <span className="text-[10px] font-black text-purple-300/30 uppercase tracking-widest">{order.id}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white group-hover:text-[#8b5cf6] transition-colors">{order.itemNombre}</h3>
                      <div className="space-y-1 mt-3">
                        <p className="text-[10px] text-purple-300/80 font-black uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                          Comprado por: {order.clientNombre || 'Vecino'}
                        </p>
                        <p className="text-[10px] text-pink-500 font-black uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                          Recoger en: {order.origen}
                        </p>
                        <p className="text-[10px] text-purple-300/60 font-bold uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-300/20 rounded-full"></span>
                          Destino: {order.destino}
                        </p>
                      </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-green-400">4.50€</h3>
                  </div>
                </div>
                <Button variant="primary" fullWidth className="py-6 rounded-3xl text-lg font-black" onClick={() => { onUpdateStatus(order.id, OrderStatus.ASIGNADO); setSubTab('assigned'); }}>Asignarme este paquete</Button>
              </Card>
            ))}
          </section>
        ) : (
          <section className="space-y-6">
            {myOrders.map(order => (
              <Card key={order.id} id={`order-${order.id}`} className={`p-8 space-y-6 border-l-8 transition-all duration-500 ${order.id === recommendedOrderId ? 'border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.2)] scale-[1.02] ring-2 ring-[#f59e0b]/30' : 'border-[#8b5cf6]'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 block">{order.id}</span>
                    <h3 className="text-xl font-black text-white truncate">{order.itemNombre}</h3>
                  </div>
                  <StatusBadge status={order.estado} />
                </div>
                <div className="grid gap-3 pt-2">
                  {order.estado === OrderStatus.ASIGNADO && <Button variant="secondary" fullWidth className="py-6 rounded-3xl font-black text-lg" onClick={() => setScanningOrderId(order.id)}>Escanear para Recoger</Button>}
                  {order.estado === OrderStatus.RECOGIDO && <Button variant="primary" fullWidth className="py-6 rounded-3xl font-black text-lg" onClick={() => onUpdateStatus(order.id, OrderStatus.EN_RUTA)}>Iniciar Ruta de Entrega</Button>}
                  {order.estado === OrderStatus.EN_RUTA && <Button variant="primary" fullWidth className="py-6 rounded-3xl font-black text-lg bg-green-500" onClick={() => onUpdateStatus(order.id, OrderStatus.ENTREGADO)}>Finalizar Entrega</Button>}
                  <Button variant="outline" fullWidth className="py-4 rounded-2xl text-[10px]" onClick={() => setActiveChatOrderId(order.id)}>Hablar con el Cliente</Button>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>

      {scanningOrderId && <ScannerOverlay onScan={() => { onUpdateStatus(scanningOrderId, OrderStatus.RECOGIDO); setScanningOrderId(null); }} onClose={() => setScanningOrderId(null)} />}
      {activeChatOrder && <ChatOverlay order={activeChatOrder} currentUserId={currentUser.id} onClose={handleCloseChat} onSend={(t, isAI) => onSendMessage(activeChatOrder.id, t, isAI)} />}
    </div>
  );
};

export default TabRepartidor;
