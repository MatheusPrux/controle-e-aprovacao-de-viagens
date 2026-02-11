
import React, { useState, useEffect } from 'react';
import { User, AuthState, Trip, TripStatus, UserRole } from './types';
import Login from './components/Login';
import DashboardDriver from './components/DashboardDriver';
import DashboardAdmin from './components/DashboardAdmin';
import Reports from './components/Reports';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz0m8ogQreDFsW9IXPdRSzUIPsMSqI7BFD3ZqcyIM4GdgT4_UG9spNFiJCX7V6mHqZJOw/exec';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'reports' | 'users'>('dashboard');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('trip_auth_session');
    try {
      return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTrips();
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('trip_auth_session', JSON.stringify(auth));
  }, [auth]);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const response = await fetch(`${WEB_APP_URL}?action=getTrips&t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow',
      });
      const result = await response.json();
      if (result.success) {
        setTrips(Array.isArray(result.trips) ? result.trips : []);
      }
    } catch (error) {
      console.error("Erro ao carregar viagens:", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogin = async (idFromLogin: string, passwordFromLogin: string) => {
    try {
      const params = new URLSearchParams({
        action: 'login',
        id: String(idFromLogin),
        password: String(passwordFromLogin)
      });
      const response = await fetch(`${WEB_APP_URL}?${params.toString()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const result = await response.json();
      if (result.success && result.user) {
        setAuth({ user: result.user, isAuthenticated: true });
      } else {
        alert(result.message || "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert("Falha ao conectar com o servidor.");
    }
  };

  const syncTripWithSheets = async (trip: Trip) => {
    try {
      const sanitizedTrip = {
        ...trip,
        id: String(trip.id),
        kmInitial: Number(trip.kmInitial) || 0,
        kmFinal: trip.kmFinal ? Number(trip.kmFinal) : 0,
        valor_comissao: trip.valor_comissao ? Number(trip.valor_comissao) : 0,
        photoInitial: trip.photoInitial || '',
        factoryArrivalPhoto: trip.factoryArrivalPhoto || '',
        photoFinal: trip.photoFinal || '',
        createdAt: typeof trip.createdAt === 'string' ? trip.createdAt : new Date().toISOString()
      };
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveTrip', trip: sanitizedTrip })
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setTrips([]);
    localStorage.removeItem('trip_auth_session');
    setView('dashboard');
  };

  const addTrip = (trip: Trip) => {
    const maxId = trips.reduce((max, t) => {
      const idNum = Number(t.id);
      return !isNaN(idNum) ? Math.max(max, idNum) : max;
    }, 0);
    const tripWithId = { ...trip, id: String(maxId + 1) };
    setTrips(prev => [tripWithId, ...prev]);
    syncTripWithSheets(tripWithId);
  };

  const updateExistingTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    syncTripWithSheets(updatedTrip);
  };

  const updateTripStatus = (tripId: string, status: TripStatus, comment: string, extras?: { numero_dt?: string, valor_comissao?: number }) => {
    setTrips(prev => {
      return prev.map(t => {
        if (t.id === tripId) {
          const updated = { 
            ...t, 
            status, 
            adminComment: String(comment),
            numero_dt: extras?.numero_dt ? String(extras.numero_dt) : t.numero_dt,
            valor_comissao: extras?.valor_comissao !== undefined ? Number(extras.valor_comissao) : t.valor_comissao
          };
          syncTripWithSheets(updated);
          return updated;
        }
        return t;
      });
    });
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={(u) => handleLogin(u.id, u.password || '')} existingUsers={[]} isRemote={true} />;
  }

  const isStaff = auth.user.role === 'super_admin' || auth.user.role === 'manager';

  return (
    <div className="min-h-screen bg-gray-100 pb-10 font-sans">
      <nav className="bg-[#001A33] text-white p-4 shadow-xl sticky top-0 z-50 border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('dashboard')}>
              <div className="bg-[#F15A24] p-2 rounded-lg group-hover:scale-110 transition-transform">
                <i className="fas fa-truck-fast text-white text-xl"></i>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Grupo Filler <span className="text-orange-500">Log</span></h1>
            </div>
            {isStaff && (
              <div className="flex space-x-1 ml-4 bg-black/20 p-1 rounded-xl">
                <button 
                  onClick={() => setView('dashboard')} 
                  className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all ${view === 'dashboard' ? 'bg-[#F15A24] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Gestão
                </button>
                <button 
                  onClick={() => setView('reports')} 
                  className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all ${view === 'reports' ? 'bg-[#F15A24] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Relatórios
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black leading-none uppercase tracking-tight">{auth.user.name}</p>
              <p className="text-[9px] text-orange-400 uppercase tracking-widest mt-1 font-black opacity-80">
                {auth.user.role === 'super_admin' ? 'Super Admin' : auth.user.role === 'manager' ? 'Manager' : 'Motorista'}
              </p>
            </div>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/80 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 border border-white/5">
              <i className="fas fa-power-off text-sm"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {loadingTrips && trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#001A33]">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#F15A24] rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-6 opacity-60">Sincronizando com Grupo Filler...</p>
          </div>
        ) : view === 'reports' && isStaff ? (
          <Reports trips={trips} />
        ) : isStaff ? (
          <DashboardAdmin 
            trips={trips} 
            userRole={auth.user.role} 
            onUpdateStatus={updateTripStatus} 
          />
        ) : (
          <DashboardDriver 
            user={auth.user} 
            trips={trips.filter(t => t && t.driverId === auth.user?.id)} 
            onAddTrip={addTrip} 
            onUpdateTrip={updateExistingTrip} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
