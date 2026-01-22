
import React, { useState, useEffect } from 'react';
import { User, Order, UserRole, OrderStatus, PackageSize, ChatMessage, PickupPoint } from './types';
import { NEIGHBORHOODS, generateOrderId, generateConfirmCode, PICKUP_POINTS } from './constants';
import TabCliente from './tabs/TabCliente';
import TabRepartidor from './tabs/TabRepartidor';
import TabRastreo from './tabs/TabRastreo';
import TabDatos from './tabs/TabDatos';
import { TabPuntos } from './tabs/TabPuntos';
import { TabAyuda } from './tabs/TabAyuda';
import { TabCompras } from './tabs/TabCompras';
import { BarriAssistant } from './components/BarriAssistant';
import { Button, BarriBoxLogo, Input, Select, Card } from './components/UI';

const STORAGE_KEYS = {
  USERS: 'barribox_v6_users',
  ORDERS: 'barribox_v6_orders',
  CURRENT_USER: 'barribox_v6_session'
};

const INITIAL_ITEMS = [
  'Patinete Xiaomi Pro', 'Televisor Samsung 4K', 'Zapatillas Nike Air', 'Cafetera Nespresso', 
  'Monitor Gaming 27"', 'Bicicleta de Montaña', 'Silla de Escritorio', 'Microondas LG'
];

const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<'welcome' | 'login_choice' | 'login_list' | 'register' | 'main'>('welcome');
  const [activeTab, setActiveTab] = useState<'inicio' | 'market' | 'rastreo' | 'puntos' | 'ayuda' | 'datos'>('inicio');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<PickupPoint | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const savedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (savedUsers) setAllUsers(JSON.parse(savedUsers, dateReviver));
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders, dateReviver));
    } else {
      const initialOrders: Order[] = INITIAL_ITEMS.map((item, i) => ({
        id: `BBX-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        itemNombre: item,
        clientId: 'system-' + i,
        clientNombre: 'Vecino ' + (i + 1),
        puntoRecogidaId: PICKUP_POINTS[i % PICKUP_POINTS.length].id,
        origen: PICKUP_POINTS[i % PICKUP_POINTS.length].nombre,
        destino: `Carrer de la pau, ${10 + i}`,
        tamano: i % 2 === 0 ? PackageSize.M : PackageSize.S,
        instrucciones: 'Dejar en el punto.',
        precioEstimado: 4.50,
        estado: OrderStatus.LLEGADO_AL_PUNTO,
        createdAt: new Date(),
        updatedAt: new Date(),
        clienteConfirmado: false,
        confirmationCode: generateConfirmCode(),
        chat: []
      }));
      setOrders(initialOrders);
    }
    
    if (savedSession) {
      const user = JSON.parse(savedSession, dateReviver);
      setCurrentUser(user);
      setAppState('main');
    }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);
  
  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      estado: status, 
      repartidorId: currentUser?.id, 
      repartidorNombre: currentUser?.nombre,
      updatedAt: new Date() 
    } : o));
  };

  const handleSendMessage = (orderId: string, text: string, isAI: boolean = false) => {
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: isAI ? 'ai-system' : (currentUser?.id || 'sys'),
      senderNombre: isAI ? 'Barri Assistant' : (currentUser?.nombre || 'Barri'),
      text,
      timestamp: new Date()
    };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, chat: [...o.chat, msg] } : o));
  };

  const handleBarriAction = (action: string, params?: any) => {
    if (action === 'NAVIGATE') setActiveTab(params.tab);
    if (action === 'ASSIGN') {
      const orderId = params.id;
      if (orderId) {
        handleUpdateStatus(orderId, OrderStatus.ASIGNADO);
        setActiveTab('inicio');
      }
    }
    if (action === 'SEND_MESSAGE') {
      const { orderId, text } = params;
      if (orderId && text) {
        handleSendMessage(orderId, text, false);
      }
    }
    if (action === 'OPEN_CHAT') {
      const orderId = params.id;
      if (orderId) { 
        setOpenChatOrderId(orderId); 
        setActiveTab('inicio'); 
      }
    }
  };

  if (appState === 'welcome') {
    return (
      <div className="h-screen bg-[#0a0518] flex flex-col items-center justify-between p-12 text-center animate-in fade-in duration-700">
        <div className="flex-1 flex flex-col items-center justify-center">
          <BarriBoxLogo size="lg" className="mb-8 scale-150" />
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">BarriBox</h1>
          <p className="text-[#8b5cf6] text-xs font-black uppercase tracking-[0.6em] mb-12">Logística Vecinal</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4 mb-8">
          <Button variant="primary" fullWidth className="py-7 text-lg rounded-[2.5rem] shadow-2xl neon-shadow-purple" onClick={() => setAppState('login_choice')}>Continuar</Button>
          <Button variant="glass" fullWidth className="py-6 rounded-[2.5rem]" onClick={() => setAppState('register')}>Registrarme</Button>
        </div>
      </div>
    );
  }

  if (appState === 'login_choice') {
    return (
      <div className="h-screen bg-[#0a0518] p-10 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="mb-12">
          <button onClick={() => setAppState('welcome')} className="p-4 bg-white/5 rounded-full border border-white/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-4xl font-black text-white tracking-tighter">Inicia Sesión</h2>
          <p className="text-purple-300/30 font-black uppercase text-[10px] tracking-widest mt-2">Selecciona tu perfil operativo</p>
        </header>

        <div className="flex-1 flex flex-col gap-6 justify-center">
           <Card onClick={() => { setLoginRole(UserRole.REPARTIDOR); setAppState('login_list'); }} className="p-10 flex flex-col items-center gap-6 border-2 border-[#ec4899]/20 hover:border-[#ec4899] group bg-gradient-to-b from-[#160d2d] to-[#0a0518]">
              <span className="text-6xl group-hover:scale-110 transition-transform">🛵</span>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white">Soy Repartidor</h3>
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Quiero entregar paquetes</p>
              </div>
           </Card>

           <Card onClick={() => { setLoginRole(UserRole.CLIENTE); setAppState('login_list'); }} className="p-10 flex flex-col items-center gap-6 border-2 border-[#8b5cf6]/20 hover:border-[#8b5cf6] group bg-gradient-to-b from-[#160d2d] to-[#0a0518]">
              <span className="text-6xl group-hover:scale-110 transition-transform">📦</span>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white">Soy Cliente</h3>
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">Quiero recibir envíos</p>
              </div>
           </Card>
        </div>
      </div>
    );
  }

  if (appState === 'login_list') {
    const filteredUsers = allUsers.filter(u => u.rol === loginRole);
    return (
      <div className="h-screen bg-[#0a0518] p-10 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="mb-12">
          <button onClick={() => setAppState('login_choice')} className="p-4 bg-white/5 rounded-full border border-white/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-4xl font-black text-white tracking-tighter">Usuarios</h2>
          <p className="text-purple-300/30 font-black uppercase text-[10px] tracking-widest mt-2">{loginRole === UserRole.REPARTIDOR ? 'Repartidores' : 'Clientes'} activos</p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
               <span className="text-5xl">🔍</span>
               <p className="text-xs font-black uppercase tracking-widest">No hay cuentas de este tipo</p>
               <Button variant="outline" onClick={() => setAppState('register')}>Crear una ahora</Button>
            </div>
          ) : (
            filteredUsers.map(u => (
              <Card 
                key={u.id}
                onClick={() => { setCurrentUser(u); setAppState('main'); }}
                className={`p-6 flex items-center gap-5 border-2 hover:scale-[1.02] transition-all ${u.rol === UserRole.REPARTIDOR ? 'border-[#ec4899]/20' : 'border-[#8b5cf6]/20'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl ${u.rol === UserRole.REPARTIDOR ? 'bg-[#ec4899]' : 'bg-[#8b5cf6]'}`}>
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex-1 min-w-0">
                   <p className="font-black text-white text-lg truncate">{u.nombre}</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{u.zona}</p>
                </div>
                <div className="text-purple-300/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (appState === 'register') {
    return (
      <div className="h-screen bg-[#0a0518] p-10 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="mb-10">
           <button onClick={() => setAppState('welcome')} className="p-4 bg-white/5 rounded-full border border-white/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-4xl font-black text-white tracking-tighter">Únete al Barrio</h2>
          <p className="text-gray-500 font-medium text-sm">Crea tu cuenta BarriBox ahora</p>
        </header>

        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          const name = target.nombre.value;
          const tel = target.tel.value;

          // Validaciones finales
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            alert("El nombre solo puede contener letras.");
            return;
          }
          if (tel.length !== 9) {
            alert("El teléfono debe tener exactamente 9 dígitos.");
            return;
          }

          const newUser: User = {
            id: 'u-' + Date.now(),
            nombre: name,
            contacto: tel,
            zona: target.zona.value,
            rol: target.rol.value as UserRole,
            verificado: true,
            config: { letrasGrandes: false, altoContraste: false, vozActiva: true }
          };
          setAllUsers([...allUsers, newUser]);
          setCurrentUser(newUser);
          setAppState('main');
        }} className="space-y-6 flex-1 overflow-y-auto pb-10">
          <Input 
            name="nombre" 
            label="Nombre y Apellidos" 
            placeholder="Introduce solo letras..." 
            required 
            pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
            title="Solo se permiten letras"
          />
          <Input 
            name="tel" 
            label="Teléfono (9 dígitos)" 
            type="tel"
            placeholder="Ej: 600000000" 
            required 
            maxLength={9}
            pattern="[0-9]{9}"
            title="Introduce 9 números"
          />
          <Select name="zona" label="Tu Barrio de Residencia">
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select name="rol" label="¿Cómo participarás?">
            <option value={UserRole.CLIENTE}>Soy Cliente (Quiero recibir)</option>
            <option value={UserRole.REPARTIDOR}>Soy Repartidor (Quiero entregar)</option>
          </Select>
          
          <div className="pt-4">
            <Button type="submit" variant="primary" fullWidth className="py-7 rounded-[2.5rem] shadow-2xl neon-shadow-purple text-lg">Empezar ahora</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#0a0518] relative shadow-2xl text-white overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-32">
        {activeTab === 'inicio' && (currentUser?.rol === UserRole.REPARTIDOR ? (
          <TabRepartidor currentUser={currentUser} orders={orders} onUpdateStatus={handleUpdateStatus} onSendMessage={handleSendMessage} voiceChatId={openChatOrderId} onVoiceChatClose={() => setOpenChatOrderId(null)} />
        ) : (
          <TabCliente currentUser={currentUser} orders={orders} onCreateOrder={(o) => {
             const newOrder: Order = {
               ...o as Order,
               id: generateOrderId(),
               createdAt: new Date(),
               updatedAt: new Date(),
               clienteConfirmado: false,
               confirmationCode: generateConfirmCode(),
               chat: []
             };
             setOrders([...orders, newOrder]);
          }} onUpdateStatus={handleUpdateStatus} onSendMessage={handleSendMessage} setActiveTab={setActiveTab} voiceChatId={openChatOrderId} onVoiceChatClose={() => setOpenChatOrderId(null)} />
        ))}
        {activeTab === 'market' && currentUser && (
          <TabCompras currentUser={currentUser} onCreateOrder={(o) => {
            const newOrder: Order = {
              ...o as Order,
              id: generateOrderId(),
              clientNombre: currentUser.nombre,
              clientId: currentUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              clienteConfirmado: false,
              confirmationCode: generateConfirmCode(),
              chat: []
            } as Order;
            setOrders([...orders, newOrder]);
            setActiveTab('inicio');
          }} />
        )}
        {activeTab === 'rastreo' && <TabRastreo orders={orders} currentUser={currentUser} navigationPoint={navigationTarget} onClearNavigation={() => setNavigationTarget(null)} />}
        {activeTab === 'puntos' && <TabPuntos currentUser={currentUser} onNavigateToPoint={(p) => { setNavigationTarget(p); setActiveTab('rastreo'); }} />}
        {activeTab === 'ayuda' && <TabAyuda orders={orders} tickets={[]} currentUser={currentUser} onAddTicket={() => {}} />}
        {activeTab === 'datos' && <TabDatos currentUser={currentUser} orders={orders} onUpdateUser={setCurrentUser} onLogout={() => { setCurrentUser(null); setAppState('welcome'); }} onSwitchRole={() => {
          const updated = { ...currentUser, rol: currentUser.rol === UserRole.CLIENTE ? UserRole.REPARTIDOR : UserRole.CLIENTE };
          setCurrentUser(updated);
          setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        }} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/5 px-4 py-6 flex justify-around items-center z-[150]">
        <NavBtn act={activeTab==='inicio'} icon="home" onClick={()=>setActiveTab('inicio')} />
        {currentUser?.rol === UserRole.CLIENTE && (
          <NavBtn act={activeTab==='market'} icon="cart" onClick={()=>setActiveTab('market')} />
        )}
        <NavBtn act={activeTab==='rastreo'} icon="radar" onClick={()=>setActiveTab('rastreo')} />
        <NavBtn act={activeTab==='puntos'} icon="map" onClick={()=>setActiveTab('puntos')} />
        <NavBtn act={activeTab==='ayuda'} icon="help" onClick={()=>setActiveTab('ayuda')} />
        <NavBtn act={activeTab==='datos'} icon="user" onClick={()=>setActiveTab('datos')} />
      </nav>

      {currentUser?.config?.vozActiva && (
        <BarriAssistant 
          user={currentUser} 
          orders={orders} 
          onAction={handleBarriAction} 
        />
      )}
    </div>
  );
};

const NavBtn = ({act, icon, onClick}: any) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${act ? 'bg-[#8b5cf6] text-white' : 'text-purple-300/30'}`}>
      {icon === 'home' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}
      {icon === 'cart' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
      {icon === 'radar' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>}
      {icon === 'map' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/></svg>}
      {icon === 'help' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>}
      {icon === 'user' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
  </button>
);

export default App;
