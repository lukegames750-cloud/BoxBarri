
import React, { useState } from 'react';
import { Partner, Order, PackageSize, OrderStatus, User } from '../types';
import { Card, Input, Button, Select } from '../components/UI';
import { PICKUP_POINTS, PRICE_TABLE } from '../constants';

const PARTNERS: Partner[] = [
  { id: 'p1', nombre: 'Amazon', logo: '📦', color: '#ff9900' },
  { id: 'p2', nombre: 'Ontime', logo: '🚚', color: '#004a99' },
  { id: 'p3', nombre: 'Paack', logo: '🚀', color: '#e41c2c' },
  { id: 'p4', nombre: 'UPS', logo: '🤎', color: '#351c15' },
];

export const TabCompras: React.FC<{ currentUser: User, onCreateOrder: (o: Partial<Order>) => void }> = ({ currentUser, onCreateOrder }) => {
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<{ nombre: string, precio: number } | null>(null);
  const [selectedPointId, setSelectedPointId] = useState(PICKUP_POINTS[0].id);

  const handleBuy = () => {
    const point = PICKUP_POINTS.find(p => p.id === selectedPointId);
    onCreateOrder({
      itemNombre: checkoutItem?.nombre,
      puntoRecogidaId: selectedPointId,
      origen: point?.nombre || 'Punto Colaborador',
      destino: 'Mi domicilio en ' + currentUser.zona,
      tamano: PackageSize.M,
      precioEstimado: PRICE_TABLE[PackageSize.M],
      estado: OrderStatus.LLEGADO_AL_PUNTO,
      instrucciones: `Comprado en ${selectedPartner?.nombre}. Por favor recoger y entregar en casa.`
    });
    setCheckoutItem(null);
    setSelectedPartner(null);
    setSearch('');
  };

  if (checkoutItem) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-bottom duration-500 bg-[#0a0518] min-h-screen text-white">
        <header className="flex items-center gap-4">
           <button onClick={() => setCheckoutItem(null)} className="p-4 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
           </button>
           <h2 className="text-2xl font-black tracking-tighter">Pasar por Caja</h2>
        </header>
        
        <Card className="p-10 space-y-8 border-2 border-[#8b5cf6]/20 bg-[#160d2d]">
           <div className="text-center space-y-2">
             <div className="w-20 h-20 bg-[#8b5cf6]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-[#8b5cf6]/20">
                <span className="text-4xl">🛒</span>
             </div>
             <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{checkoutItem.nombre}</h3>
             <p className="text-[10px] text-purple-300/40 uppercase font-black tracking-widest">Importado desde {selectedPartner?.nombre}</p>
           </div>

           <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
             <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Precio Final</span>
             <span className="text-3xl font-black text-[#ec4899]">{checkoutItem.precio}€</span>
           </div>

           <Select label="Punto BarriBox de Entrega" value={selectedPointId} onChange={e => setSelectedPointId(e.target.value)}>
             {PICKUP_POINTS.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.barrio})</option>)}
           </Select>

           <Button variant="primary" fullWidth className="py-7 rounded-[2.5rem] shadow-2xl neon-shadow-purple" onClick={handleBuy}>
             Confirmar Compra
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in pb-32">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white">Market</h1>
        <p className="text-pink-300/40 text-[10px] font-black uppercase tracking-[0.4em]">BarriBox Shopping Experience</p>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-purple-300/30 group-focus-within:text-[#8b5cf6] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input 
          type="text"
          placeholder="Busca cualquier producto..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#160d2d] border-2 border-[#2d1b54] rounded-[2rem] pl-14 pr-6 py-5 focus:border-[#8b5cf6] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all text-white font-bold placeholder-purple-300/20 shadow-xl"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute inset-y-0 right-5 flex items-center text-purple-300/30 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PARTNERS.map(p => (
          <Card 
            key={p.id} 
            onClick={() => setSelectedPartner(p)} 
            className={`p-6 flex flex-col items-center gap-3 border-2 transition-all active:scale-95 ${selectedPartner?.id === p.id ? 'border-[#8b5cf6] bg-[#8b5cf6]/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-[#2d1b54]'}`}
          >
            <span className="text-3xl">{p.logo}</span>
            <span className="font-black uppercase text-[10px] tracking-[0.2em]">{p.nombre}</span>
          </Card>
        ))}
      </div>

      {selectedPartner && (
        <section className="space-y-4 animate-in slide-in-from-right duration-300">
           <div className="flex justify-between items-center px-2">
             <h3 className="text-[10px] font-black uppercase text-purple-300/30 tracking-widest">Resultados en {selectedPartner.nombre}</h3>
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           </div>
           
           <div className="grid gap-4">
              {(search.length > 1 ? [search] : ['Tostadora Retro', 'Silla Ergonómica', 'Auriculares Pro']).map(item => (
                <Card key={item} className="flex justify-between items-center p-6 border border-white/5 hover:border-[#ec4899]/30">
                   <div className="flex-1 min-w-0">
                     <h4 className="font-black text-white truncate text-lg uppercase tracking-tight">{item}</h4>
                     <p className="text-[10px] text-green-400 font-black tracking-widest uppercase">Envío BarriBox Disponible</p>
                   </div>
                   <Button variant="glass" className="py-3 px-6 rounded-2xl border-2 border-[#ec4899]/20 text-[#ec4899] font-black" onClick={() => setCheckoutItem({ nombre: item, precio: item === search ? 34.99 : 45.99 })}>
                     🛒
                   </Button>
                </Card>
              ))}
           </div>
        </section>
      )}

      {!selectedPartner && (
        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-6">
           <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 10h10"/><path d="M7 14h10"/><path d="M7 18h10"/></svg>
           <p className="text-xs font-black uppercase tracking-[0.3em]">Selecciona un partner para empezar</p>
        </div>
      )}
    </div>
  );
};

export default TabCompras;
