
import { PackageSize, OrderStatus, Neighborhood, PickupPoint } from './types';

export const COLORS = {
  bg: '#0a0518',
  primary: '#8b5cf6', // Púrpura Original
  secondary: '#ec4899', // Rosa Original
  accent: '#3b82f6',
  card: '#160d2d',
  cardBorder: '#2d1b54',
};

export const NEIGHBORHOOD_DATA: Neighborhood[] = [
  { id: 'n1', nombre: 'La Maurina', lat: 41.5601, lng: 1.9961 },
  { id: 'n2', nombre: 'Roc Blanc', lat: 41.5560, lng: 1.9920 },
  { id: 'n3', nombre: 'Les Arenes', lat: 41.5720, lng: 2.0430 },
  { id: 'n4', nombre: 'Ca n\'Aurell', lat: 41.5615, lng: 2.0035 },
  { id: 'n5', nombre: 'Centre', lat: 41.5630, lng: 2.0112 },
  { id: 'n6', nombre: 'Sant Pere Nord', lat: 41.5750, lng: 2.0180 },
  { id: 'n7', nombre: 'Can Palet', lat: 41.5540, lng: 2.0200 },
  { id: 'n8', nombre: 'Vallparadís', lat: 41.5635, lng: 2.0195 },
  { id: 'n9', nombre: 'Torre-sana', lat: 41.5700, lng: 2.0500 },
  { id: 'n10', nombre: 'La Grípia', lat: 41.5780, lng: 2.0450 },
  { id: 'n11', nombre: 'Can Roca', lat: 41.5830, lng: 2.0080 },
];

export const NEIGHBORHOODS = NEIGHBORHOOD_DATA.map(n => n.nombre);

export const PRICE_TABLE: Record<PackageSize, number> = {
  [PackageSize.S]: 3.50,
  [PackageSize.M]: 5.50,
  [PackageSize.L]: 8.50,
};

export const generatePickupPoints = (neighborhoodName: string): PickupPoint[] => {
  const n = NEIGHBORHOOD_DATA.find(x => x.nombre === neighborhoodName) || NEIGHBORHOOD_DATA[0];
  return [
    { id: `p-${n.id}-1`, nombre: `Kiosco ${n.nombre}`, direccion: `Carrer Major, 10`, barrio: n.nombre, lat: n.lat + 0.001, lng: n.lng + 0.001, horario: '08:00 - 20:00' },
    { id: `p-${n.id}-2`, nombre: `Farmacia ${n.nombre}`, direccion: `Avinguda Principal, 44`, barrio: n.nombre, lat: n.lat - 0.001, lng: n.lng + 0.002, horario: '09:00 - 21:00' },
    { id: `p-${n.id}-3`, nombre: `Café del Barri`, direccion: `Placa del Poble, 1`, barrio: n.nombre, lat: n.lat + 0.002, lng: n.lng - 0.001, horario: '07:00 - 19:00' },
  ];
};

export const PICKUP_POINTS: PickupPoint[] = NEIGHBORHOOD_DATA.flatMap(n => generatePickupPoints(n.nombre));

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.CREADO]: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  [OrderStatus.LLEGADO_AL_PUNTO]: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  [OrderStatus.ASIGNADO]: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  [OrderStatus.RECOGIDO]: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  [OrderStatus.EN_RUTA]: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  [OrderStatus.ENTREGADO]: 'bg-green-500/20 text-green-300 border-green-500/50',
  [OrderStatus.FINALIZADO]: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
  [OrderStatus.INCIDENCIA]: 'bg-red-500/20 text-red-300 border-red-500/50',
  [OrderStatus.EN_REVISION]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  [OrderStatus.RESUELTO]: 'bg-green-600/20 text-green-400 border-green-600/50',
  [OrderStatus.REEMBOLSADO]: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
};

export const generateOrderId = () => `BBX-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
export const generateConfirmCode = () => Math.floor(1000 + Math.random() * 9000).toString();
