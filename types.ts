
export enum OrderStatus {
  CREADO = 'Creado',
  LLEGADO_AL_PUNTO = 'En Punto de Recogida',
  ASIGNADO = 'Asignado',
  RECOGIDO = 'Recogido',
  EN_RUTA = 'En ruta',
  ENTREGADO = 'Entregado',
  FINALIZADO = 'Finalizado',
  INCIDENCIA = 'Incidencia',
  EN_REVISION = 'En revisión',
  RESUELTO = 'Resuelto',
  REEMBOLSADO = 'Reembolsado (Demo)'
}

export enum PackageSize {
  S = 'S',
  M = 'M',
  L = 'L'
}

export enum UserRole {
  CLIENTE = 'Cliente',
  REPARTIDOR = 'Repartidor'
}

export interface User {
  id: string;
  nombre: string;
  contacto: string;
  zona: string;
  rol: UserRole | null;
  verificado: boolean;
  deviceId?: string;
  metodoPago?: string;
  rating?: number;
  totalEntregas?: number;
  config?: {
    letrasGrandes: boolean;
    altoContraste: boolean;
    vozActiva: boolean;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderNombre: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
}

export interface Order {
  id: string;
  itemNombre: string;
  clientId: string;
  clientNombre?: string;
  repartidorId?: string;
  repartidorNombre?: string;
  puntoRecogidaId: string;
  origen: string;
  destino: string;
  tamano: PackageSize;
  instrucciones: string;
  precioEstimado: number;
  estado: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  clienteConfirmado: boolean;
  ratingRepartidor?: number;
  confirmationCode: string;
  evidencePhoto?: string;
  chat: ChatMessage[];
}

export interface SupportTicket {
  id: string;
  orderId?: string;
  motivo: string;
  descripcion: string;
  estado: 'Abierto' | 'En revisión' | 'Resuelto' | 'Cerrado';
  fecha: Date;
}

export interface PickupPoint {
  id: string;
  nombre: string;
  direccion: string;
  barrio: string;
  lat: number;
  lng: number;
  horario: string;
}

export interface Neighborhood {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

// Added Partner interface to fix missing member error
export interface Partner {
  id: string;
  nombre: string;
  logo: string;
  color: string;
}
