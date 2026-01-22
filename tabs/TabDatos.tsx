
import React, { useMemo } from 'react';
import { User, Order, UserRole, OrderStatus } from '../types';
import { Card, Button, Select } from '../components/UI';
import { NEIGHBORHOODS } from '../constants';

interface TabDatosProps {
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
  onSwitchRole: () => void;
  orders: Order[];
}

const TabDatos: React.FC<TabDatosProps> = ({ currentUser, orders, onUpdateUser, onLogout, onSwitchRole }) => {
  
  const history = orders.filter(o => 
    currentUser.rol === UserRole.CLIENTE ? o.clientId === currentUser.id : o.repartidorId === currentUser.id
  );

  const completed = history.filter(o => o.estado === OrderStatus.ENTREGADO || o.estado === OrderStatus.FINALIZADO).length;

  return (
    <div className="p-8 space-y-10 animate-in fade-in bg-[#0a0518] text-white">
      <header className="flex flex-col items-center pt-8 text-center">
        <div className="relative mb-6">
          <div className={`w-28 h-28 ${currentUser.rol === UserRole.REPARTIDOR ? 'bg-[#ec4899]' : 'bg-[#8b5cf6]'} text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10`}>
            {currentUser.nombre.charAt(0)}
          </div>
          <div className="absolute -bottom-2 right-0 bg-green-500 text-black text-[8px] font-black px-3 py-1 rounded-full border-2 border-[#0a0518] uppercase tracking-widest">Verificado</div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white">{currentUser.nombre}</h1>
        <p className="text-purple-300/40 text-[10px] font-black uppercase tracking-[0.4em] mt-1 mb-3">{currentUser.zona} • {currentUser.rol}</p>
      </header>

      {/* BOTÓN DE TRANSFORMACIÓN DE ROL */}
      <Card className="p-8 bg-gradient-to-br from-[#160d2d] to-[#2d1b54] border-2 border-[#8b5cf6]/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
         <div className="relative z-10 space-y-4">
           <div>
             <h3 className="text-lg font-black uppercase tracking-tight text-white">¿Quieres {currentUser.rol === UserRole.CLIENTE ? 'Repartir' : 'Enviar'}?</h3>
             <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Transforma tu perfil instantáneamente</p>
           </div>
           <Button 
             variant="primary" 
             fullWidth 
             className={`py-6 rounded-[2rem] font-black tracking-widest ${currentUser.rol === UserRole.CLIENTE ? 'bg-[#ec4899] hover:bg-[#db2777]' : 'bg-[#8b5cf6] hover:bg-[#7c3aed]'}`}
             onClick={onSwitchRole}
           >
             Activar Modo {currentUser.rol === UserRole.CLIENTE ? 'Repartidor' : 'Cliente'}
           </Button>
         </div>
      </Card>

      <section className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center py-8">
          <span className="text-3xl font-black text-[#8b5cf6] mb-2 leading-none">{history.length}</span>
          <span className="text-[8px] uppercase font-black text-purple-300/30 tracking-widest">Envíos</span>
        </Card>
        <Card className="flex flex-col items-center py-8">
          <span className="text-3xl font-black text-[#ec4899] mb-2 leading-none">{completed}</span>
          <span className="text-[8px] uppercase font-black text-purple-300/30 tracking-widest">Éxitos</span>
        </Card>
      </section>

      <div className="space-y-4">
        <Select label="Zona de Operación Principal" value={currentUser.zona} onChange={(e) => onUpdateUser({...currentUser, zona: e.target.value})}>
          {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" fullWidth className="py-5 rounded-[1.5rem]" onClick={onLogout}>Salir</Button>
          <Button variant="glass" fullWidth className="py-5 rounded-[1.5rem] border-red-500/20 text-red-500">Eliminar</Button>
        </div>
      </div>
    </div>
  );
};

export default TabDatos;
