
import React, { useMemo, useState } from 'react';
import { Order, OrderStatus, User, UserRole, PickupPoint } from '../types';
import { StatusBadge, Card, Button } from '../components/UI';

interface Props {
  orders: Order[];
  currentUser: User;
  navigationPoint?: PickupPoint | null;
  onClearNavigation?: () => void;
}

const TabRastreo: React.FC<Props> = ({ orders, currentUser, navigationPoint, onClearNavigation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isRepartidor = currentUser.rol === UserRole.REPARTIDOR;

  const activeOrder = useMemo(() => {
    if (isRepartidor) {
      return orders.find(o => 
        o.repartidorId === currentUser.id && 
        o.estado !== OrderStatus.FINALIZADO
      ) || orders.find(o => o.repartidorId === currentUser.id && o.estado === OrderStatus.ASIGNADO);
    } else {
      return orders.find(o => 
        o.clientId === currentUser.id && 
        o.estado !== OrderStatus.FINALIZADO
      );
    }
  }, [orders, currentUser.id, isRepartidor]);

  // Si estamos navegando a un punto específico, priorizamos esa vista
  const isNavigatingToPoint = !!navigationPoint;

  const steps = [
    { s: OrderStatus.CREADO, t: "Solicitud" },
    { s: OrderStatus.LLEGADO_AL_PUNTO, t: "En Punto" },
    { s: OrderStatus.RECOGIDO, t: "Recogido" },
    { s: OrderStatus.EN_RUTA, t: "En Camino" },
    { s: OrderStatus.ENTREGADO, t: "¡Llegó!" },
  ];

  const progressPercent = useMemo(() => {
    if (isNavigatingToPoint) return 45; // Simulación de progreso de navegación
    if (!activeOrder) return 0;
    switch (activeOrder.estado) {
      case OrderStatus.CREADO: return 5;
      case OrderStatus.LLEGADO_AL_PUNTO: return 20;
      case OrderStatus.ASIGNADO: return 35;
      case OrderStatus.RECOGIDO: return 50;
      case OrderStatus.EN_RUTA: return 75;
      case OrderStatus.ENTREGADO: 
      case OrderStatus.FINALIZADO: return 100;
      case OrderStatus.INCIDENCIA: return 85;
      default: return 0;
    }
  }, [activeOrder?.estado, isNavigatingToPoint]);

  const renderMap = (expanded: boolean) => (
    <div className={`relative overflow-hidden transition-all duration-500 ease-in-out bg-[#0c081d] ${
      expanded 
        ? 'fixed inset-0 z-[100] flex flex-col' 
        : 'h-96 mx-6 rounded-[3.5rem] border-2 border-[#2d1b54] shadow-2xl'
    }`}>
      {/* Información Superior en Mapa Expandido */}
      {expanded && (activeOrder || isNavigatingToPoint) && (
        <div className="p-8 pt-12 flex justify-between items-center bg-gradient-to-b from-[#0a0518] to-transparent z-[120]">
           <div>
             <h2 className="text-2xl font-black text-white">
               {isNavigatingToPoint ? navigationPoint?.nombre : activeOrder?.itemNombre}
             </h2>
             <p className="text-xs text-pink-500 font-bold uppercase">
               {isNavigatingToPoint ? navigationPoint?.direccion : activeOrder?.destino}
             </p>
           </div>
           {!isNavigatingToPoint && activeOrder && <StatusBadge status={activeOrder.estado} />}
           {isNavigatingToPoint && (
             <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-sm bg-blue-500/20 text-blue-300 border-blue-500/50">
               Navegando
             </span>
           )}
        </div>
      )}

      {/* Botón de Cerrar/Expandir */}
      <button 
        onClick={() => setIsExpanded(!expanded)}
        style={{ pointerEvents: 'auto' }}
        className={`absolute z-[150] p-5 glass rounded-2xl shadow-2xl border border-white/10 transition-all active:scale-90 flex items-center justify-center ${
          expanded ? 'bottom-10 right-10 scale-125' : 'bottom-6 right-6'
        }`}
      >
        {expanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="3"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        )}
      </button>

      <div className="flex-1 relative flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 400 500" className={`w-full h-full ${expanded ? 'max-h-[85vh]' : 'max-h-[50vh]'}`}>
          <g opacity="0.15">
             <rect x="80" y="40" width="40" height="60" rx="4" fill="#2d1b54" />
             <rect x="180" y="60" width="30" height="40" rx="4" fill="#2d1b54" />
             <rect x="260" y="140" width="60" height="80" rx="4" fill="#2d1b54" />
             <rect x="40" y="220" width="50" height="50" rx="4" fill="#2d1b54" />
             <rect x="160" y="320" width="40" height="90" rx="4" fill="#2d1b54" />
             <rect x="320" y="300" width="40" height="40" rx="4" fill="#2d1b54" />
          </g>

          <g stroke="#1a1433" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4">
            <path d="M20 40 H380 M20 120 H380 M20 200 H380 M20 280 H380 M20 360 H380 M20 440 H380" />
            <path d="M60 20 V480 M140 20 V480 M220 20 V480 M300 20 V480 M380 20 V480" />
          </g>

          {/* RUTA DINÁMICA: Cambia si es navegación a punto */}
          <path d={isNavigatingToPoint ? "M60 120 L220 120 L220 360 L140 360" : "M60 120 L140 120 L140 280 L300 280 L300 440"} stroke="#1e1b4b" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d={isNavigatingToPoint ? "M60 120 L220 120 L220 360 L140 360" : "M60 120 L140 120 L140 280 L300 280 L300 440"} stroke={isNavigatingToPoint ? "#3b82f6" : (isRepartidor ? "#ec4899" : "#8b5cf6")} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="8,12" className="animate-route-flow" />

          {/* INICIO */}
          <g transform="translate(60, 120)">
            <circle r="8" fill="#8b5cf6" />
          </g>

          {/* DESTINO FINAL (Si es punto de navegación) */}
          {isNavigatingToPoint && (
            <g transform="translate(140, 360)">
              <circle r="25" fill="#3b82f6" opacity="0.1" className="animate-pulse" />
              <path d="M-10 10 L0 -10 L10 10 Z" fill="#3b82f6" />
              <text y="30" textAnchor="middle" fill="#3b82f6" className="text-[10px] font-black uppercase tracking-tighter">Punto</text>
            </g>
          )}

          {/* DESTINO FINAL (Si es pedido) */}
          {!isNavigatingToPoint && (
            <g transform="translate(300, 440)">
              <circle r="25" fill="#ec4899" opacity="0.1" className="animate-pulse" />
              <path d="M-10 10 L0 -10 L10 10 Z" fill="#ec4899" />
            </g>
          )}

          {/* ICONO EN MOVIMIENTO */}
          <g style={{ 
            transform: `translate(${
              isNavigatingToPoint 
                ? (progressPercent < 30 ? 60 + (progressPercent * 5.3) : progressPercent < 75 ? 220 : 220 - (progressPercent - 75) * 3.2)
                : (progressPercent < 20 ? 60 + (progressPercent * 4) : progressPercent < 50 ? 140 : progressPercent < 75 ? 140 + (progressPercent - 50) * 6.4 : 300)
            }px, ${
              isNavigatingToPoint
                ? (progressPercent < 30 ? 120 : progressPercent < 75 ? 120 + (progressPercent - 30) * 5.3 : 360)
                : (progressPercent < 20 ? 120 : progressPercent < 50 ? 120 + (progressPercent - 20) * 5.3 : progressPercent < 75 ? 280 : 280 + (progressPercent - 75) * 6.4)
            }px)`,
            transition: 'all 1.5s linear'
          }}>
            <circle r="30" fill={isNavigatingToPoint ? "#3b82f6" : (isRepartidor ? "#ec4899" : "#8b5cf6")} opacity="0.25" className="animate-ping" />
            <rect x="-18" y="-18" width="36" height="36" rx="10" fill={isNavigatingToPoint ? "#3b82f6" : (isRepartidor ? "#ec4899" : "#8b5cf6")} stroke="white" strokeWidth="2" />
            <text y="6" textAnchor="middle" fill="white" className="text-[14px] font-black">{isNavigatingToPoint ? '📍' : (isRepartidor ? '🛵' : '📦')}</text>
          </g>
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0518]">
      <header className="p-8 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Radar</h1>
          <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.3em]">{currentUser.zona}</p>
        </div>
        {isNavigatingToPoint && (
          <button 
            onClick={onClearNavigation}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase rounded-full tracking-widest active:scale-95 transition-all"
          >
            Detener Guía
          </button>
        )}
      </header>

      {(activeOrder || isNavigatingToPoint) ? (
        <div className="flex-1 flex flex-col">
          {renderMap(isExpanded)}
          {!isExpanded && (
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 animate-in slide-in-from-bottom duration-500 pb-32">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  {isNavigatingToPoint ? 'Ruta al Establecimiento' : 'Hoja de Ruta Digital'}
                </h3>
                <span className="text-xs font-black text-[#ec4899] bg-[#ec4899]/10 px-3 py-1 rounded-full">{progressPercent}%</span>
              </div>
              
              {isNavigatingToPoint ? (
                <Card className="p-8 space-y-6 border-2 border-blue-500/30 bg-blue-500/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/40">
                        🏢
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-white">{navigationPoint?.nombre}</h4>
                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">{navigationPoint?.direccion}</p>
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4 border-t border-white/5">
                      <div className="flex-1 text-center">
                        <span className="block text-xl font-black text-white">4 min</span>
                        <span className="text-[8px] uppercase font-black text-gray-500">Tiempo estimado</span>
                      </div>
                      <div className="w-px h-10 bg-white/5"></div>
                      <div className="flex-1 text-center">
                        <span className="block text-xl font-black text-green-400">Poca</span>
                        <span className="text-[8px] uppercase font-black text-gray-500">Gente ahora</span>
                      </div>
                   </div>
                </Card>
              ) : (
                <div className="space-y-6">
                  {steps.map((step, idx) => {
                    const isPast = steps.findIndex(s => s.s === activeOrder?.estado) >= idx;
                    const isCurrent = step.s === activeOrder?.estado;
                    return (
                      <div key={idx} className="flex gap-6 relative group">
                        {idx < steps.length - 1 && (
                          <div className={`absolute left-4 top-8 bottom-[-24px] w-0.5 transition-all duration-1000 ${isPast ? (isRepartidor ? 'bg-[#ec4899]' : 'bg-[#8b5cf6]') : 'bg-white/5'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${isPast ? (isRepartidor ? 'bg-[#ec4899]' : 'bg-[#8b5cf6]') + ' border-transparent shadow-lg' : 'bg-[#160d2d] border-white/10 opacity-30'}`}>
                          {isPast ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6 9 17l-5-5"/></svg>
                          ) : (
                            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                          )}
                        </div>
                        <div className={`flex-1 transition-all duration-500 ${isPast ? 'opacity-100' : 'opacity-20'}`}>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{step.s}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
           <div className="w-32 h-32 rounded-[3rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-5xl">📡</div>
           <h3 className="text-xl font-black uppercase tracking-tighter mt-6">Radar en Espera</h3>
           <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/40 mt-2">Selecciona un envío o un punto logístico</p>
        </div>
      )}

      <style>{`
        @keyframes route-flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-route-flow {
          animation: route-flow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TabRastreo;
