
export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type TripStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  origin: string;
  destination: string;
  kmInitial: number;
  kmFinal: number;
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
