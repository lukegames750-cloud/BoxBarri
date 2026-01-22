
import React, { useState, useMemo } from 'react';
import { PICKUP_POINTS, NEIGHBORHOOD_DATA } from '../constants';
import { Card, Button, StatusBadge } from '../components/UI';
import { PickupPoint, User } from '../types';

interface TabPuntosProps {
  currentUser: User;
  onNavigateToPoint: (point: PickupPoint) => void;
}

export const TabPuntos: React.FC<TabPuntosProps> = ({ currentUser, onNavigateToPoint }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);

  const neighborhood = useMemo(() => 
    NEIGHBORHOOD_DATA.find(n => n.nombre === currentUser.zona) || NEIGHBORHOOD_DATA[0],
    [currentUser.zona]
  );

  const filteredPoints = useMemo(() => 
    PICKUP_POINTS.filter(p => p.barrio === neighborhood.nombre),
    [neighborhood]
  );

  const mapStyle = [
    'style=element:geometry|color:0x242f3e',
    'style=element:labels.text.stroke|color:0x242f3e',
    'style=element:labels.text.fill|color:0x746855',
    'style=feature:administrative.locality|element:labels.text.fill|color:0xd59563',
    'style=feature:poi|visibility:off',
    'style=feature:road|element:geometry|color:0x38414e',
    'style=feature:water|element:geometry|color:0x17263c'
  ].join('&');

  const renderMap = (full: boolean) => (
    <div className={`relative bg-[#160d2d] overflow-hidden transition-all duration-500 ${full ? 'flex-1' : 'h-80 rounded-[3rem] shadow-2xl border-2 border-[#2d1b54]'}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${neighborhood.lat},${neighborhood.lng}&zoom=${full ? 17 : 16}&size=600x800&sensor=false&scale=2&${mapStyle}')`,
          opacity: 0.6
        }}
      ></div>

      {filteredPoints.map(p => {
        const top = 50 + (neighborhood.lat - p.lat) * 12000;
        const left = 50 + (p.lng - neighborhood.lng) * 12000;
        return (
          <button 
            key={p.id}
            onClick={(e) => { e.stopPropagation(); setSelectedPoint(p); }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <div className={`w-8 h-8 rounded-full border-2 border-white/20 shadow-xl flex items-center justify-center transition-all ${selectedPoint?.id === p.id ? 'bg-[#ec4899] scale-125 shadow-[#ec4899]/50' : 'bg-[#8b5cf6]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </button>
        );
      })}

      {!full && (
        <button onClick={() => setIsFullScreen(true)} className="absolute bottom-6 right-6 glass p-4 rounded-2xl shadow-2xl border border-white/10 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="3"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col h-full bg-[#0a0518] text-white transition-all ${isFullScreen ? 'fixed inset-0 z-[70]' : 'p-6 space-y-6'}`}>
      {isFullScreen ? (
        <div className="flex-1 flex flex-col">
          <header className="p-6 flex justify-between items-center border-b border-white/5">
            <div>
              <h2 className="text-2xl font-black text-white">{neighborhood.nombre}</h2>
              <p className="text-[10px] text-purple-300/40 font-bold uppercase tracking-widest">Puntos Logísticos</p>
            </div>
            <button onClick={() => setIsFullScreen(false)} className="p-4 bg-white/5 rounded-full border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>
          {renderMap(true)}
          {selectedPoint && (
            <div className="p-10 glass border-t border-white/10 rounded-t-[4rem] shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                 <div className="space-y-1">
                   <h3 className="text-2xl font-black text-white leading-tight">{selectedPoint.nombre}</h3>
                   <p className="text-purple-300/40 font-bold text-sm uppercase tracking-tight">{selectedPoint.direccion}</p>
                 </div>
                 <StatusBadge status={'LLEGADO_AL_PUNTO' as any} />
              </div>
              <Button 
                variant="primary" 
                fullWidth 
                className="py-6 text-lg rounded-[2.5rem] neon-shadow-purple"
                onClick={() => {
                  onNavigateToPoint(selectedPoint);
                }}
              >
                Obtener Direcciones
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <header>
            <h1 className="text-4xl font-black text-white tracking-tighter">Puntos</h1>
            <p className="text-purple-300/30 text-xs font-black uppercase tracking-[0.3em] mt-1">Terrassa • {neighborhood.nombre}</p>
          </header>
          {renderMap(false)}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-purple-300/20 uppercase tracking-widest ml-2">Locales de Barrio</h3>
            <div className="grid gap-4">
              {filteredPoints.map(p => (
                <Card key={p.id} onClick={() => { setSelectedPoint(p); setIsFullScreen(true); }} className={`flex gap-5 items-center ${selectedPoint?.id === p.id ? 'border-[#8b5cf6]' : ''}`}>
                  <div className="w-14 h-14 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#8b5cf6]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-lg truncate">{p.nombre}</h4>
                    <p className="text-[10px] text-purple-300/40 font-bold uppercase truncate">{p.direccion}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
