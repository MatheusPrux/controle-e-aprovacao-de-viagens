
export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type TripStatus = 'Em Andamento' | 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  
  // Part 1 (Obrigatório no Início)
  date: string;
  kmInitial: number;
  photoInitial: string; 
  startTime: string; 
  origin: string;

  // Part 2 (Obrigatório na Finalização)
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
