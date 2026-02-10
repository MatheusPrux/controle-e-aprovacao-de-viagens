
import React, { useState, useEffect } from 'react';
import { User, AuthState, Trip, Notification } from './types';
import Login from './components/Login';
import DashboardDriver from './components/DashboardDriver';
import DashboardAdmin from './components/DashboardAdmin';
import Reports from './components/Reports';

const INITIAL_USERS: User[] = [
  { id: 'admin', name: 'Administrador Sistema', email: 'admin@empresa.com', role: 'admin', password: 'admin' },
  { id: 'motorista1', name: 'Matheus Prux', email: 'matheus@empresa.com', role: 'driver', password: '123' },
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'reports'>('dashboard');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('trip_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('trip_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trip_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem('trip_auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('trip_data', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('trip_users', JSON.stringify(users));
  }, [users]);

  const sendMockEmail = (to: string, subject: string, message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      to,
      subject,
      message,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    console.log(`%c[SIMULAÇÃO DE EMAIL]\nPara: ${to}\nAssunto: ${subject}\nMensagem: ${message}`, 'color: #4f46e5; font-weight: bold;');
  };

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setView('dashboard');
  };

  const addTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
    // Notify admin
    const admins = users.filter(u => u.role === 'admin');
    admins.forEach(admin => {
      sendMockEmail(admin.email, 'Nova Solicitação de Viagem', `O motorista ${trip.driverName} cadastrou uma nova viagem de ${trip.origin} para ${trip.destination}.`);
    });
  };

  const updateTripStatus = (tripId: string, status: 'Aprovado' | 'Rejeitado', comment: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const updatedTrip = { ...t, status, adminComment: comment };
        // Notify driver
        const driver = users.find(u => u.id === t.driverId);
        if (driver) {
          sendMockEmail(driver.email, `Viagem ${status}`, `Sua solicitação de ${t.origin} para ${t.destination} foi ${status.toLowerCase()}.\nComentário do Admin: ${comment || 'Sem comentários.'}`);
        }
        return updatedTrip;
      }
      return t;
    }));
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} existingUsers={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <i className="fas fa-car-side text-2xl"></i>
              <h1 className="text-xl font-bold tracking-tight">VIAGENS</h1>
            </div>
            {auth.user.role === 'admin' && (
              <div className="flex space-x-4 ml-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-500'}`}
                >
                  Gestão
                </button>
                <button 
                  onClick={() => setView('reports')}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${view === 'reports' ? 'bg-indigo-700' : 'hover:bg-indigo-500'}`}
                >
                  Relatórios
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{auth.user.name}</p>
              <p className="text-xs text-indigo-100 opacity-80 uppercase">{auth.user.role === 'admin' ? 'Administrador' : 'Motorista'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-800 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
              title="Sair"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Notificação Toast Mockup */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] w-80 space-y-2">
          {notifications.slice(0, 1).map(n => (
            <div key={n.id} className="bg-white border-l-4 border-indigo-500 p-4 rounded-lg shadow-xl animate-in slide-in-from-right-full">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Email Enviado</h4>
                <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-xs text-gray-800 font-semibold mt-1">{n.subject}</p>
              <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {view === 'reports' && auth.user.role === 'admin' ? (
          <Reports trips={trips} />
        ) : auth.user.role === 'admin' ? (
          <DashboardAdmin trips={trips} onUpdateStatus={updateTripStatus} />
        ) : (
          <DashboardDriver user={auth.user} trips={trips.filter(t => t.driverId === auth.user?.id)} onAddTrip={addTrip} />
        )}
      </main>
    </div>
  );
};

export default App;
