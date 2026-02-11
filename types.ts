
export type UserRole = 'super_admin' | 'manager' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type TripStatus = 'Em Andamento' | 'Na Fábrica' | 'Em Trânsito' | 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Trip {
  id: string; // Coluna A
  driverId: string; // Coluna B
  driverName: string; // Coluna C
  vehiclePlate: string; // Coluna D
  startDate: string; // Coluna E
  endDate?: string; // Coluna F
  
  kmInitial: number; // Coluna G
  origin: string; // Coluna H
  startTime: string; // Coluna I

  factoryName?: string; // Coluna J
  factoryArrivalTime?: string; // Coluna K
  factoryDepartureTime?: string; // Coluna L

  kmFinal?: number; // Coluna M
  endTime?: string; // Coluna N
  destination?: string; // Coluna O
  
  status: TripStatus; // Coluna P
  numero_dt?: string; // Coluna Q
  valor_comissao?: number; // Coluna R

  // Campos de evidência (fotos - enviadas como base64 no objeto)
  photoInitial?: string; 
  factoryArrivalPhoto?: string;
  photoFinal?: string; 
  
  adminComment?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
