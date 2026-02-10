
export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type TripStatus = 'Em Andamento' | 'Na Fábrica' | 'Em Trânsito' | 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  
  // Part 1 (Início)
  date: string;
  kmInitial: number;
  photoInitial: string; 
  startTime: string; 
  origin: string;

  // Fábrica (Etapas Intermediárias)
  factoryArrivalTime?: string;
  factoryArrivalPhoto?: string;
  factoryDepartureTime?: string;
  factoryDeparturePhoto?: string;

  // Part 2 (Finalização)
  kmFinal?: number;
  photoFinal?: string; 
  endTime?: string; 
  destination?: string;
  endDate?: string; 

  status: TripStatus;
  adminComment?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  to: string;
  subject: string;
  message: string;
  timestamp: string;
}
