
import React, { useState, useEffect } from 'react';
import { User, AuthState, Trip, TripStatus, UserRole } from './types';
import Login from './components/Login';
import DashboardDriver from './components/DashboardDriver';
import DashboardAdmin from './components/DashboardAdmin';
import Reports from './components/Reports';

// URL da Web App vinculada à conta Filler
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
        setAuth({ 
          user: result.user, 
          isAuthenticated: true 
        });
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
      // Objeto higienizado para envio à Planilha (Colunas A-V)
      const sanitizedTrip = {
        ...trip,
        id: String(trip.id),
        kmInitial: Number(trip.kmInitial) || 0,
        kmFinal: trip.kmFinal ? Number(trip.kmFinal) : 0,
        valor_comissao: trip.valor_comissao ? Number(trip.valor_comissao) : 0,
        // Garantindo que as fotos (Base64 ou Links) sejam incluídas no POST
        photoInitial: trip.photoInitial || '',
        factoryArrivalPhoto: trip.factoryArrivalPhoto || '',
        photoFinal: trip.photoFinal || '',
        createdAt: typeof trip.createdAt === 'string' ? trip.createdAt : new Date().toISOString()
      };

      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Necessário para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveTrip',
          trip: sanitizedTrip
        })
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
    <div className="min-h-screen bg-gray-200 pb-10 font-sans">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <i className="fas fa-truck-fast text-2xl"></i>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">SISTEMA LOG</h1>
            </div>
            {isStaff && (
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => setView('dashboard')} 
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:bg-indigo-500'}`}
                >
                  Gestão
                </button>
                <button 
                  onClick={() => setView('reports')} 
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === 'reports' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:bg-indigo-500'}`}
                >
                  Relatórios
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{auth.user.name}</p>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest mt-1 font-black">
                {auth.user.role === 'super_admin' ? 'Super Admin' : auth.user.role === 'manager' ? 'Manager' : 'Motorista'}
              </p>
            </div>
            <button onClick={handleLogout} className="bg-indigo-700 hover:bg-red-500 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95">
              <i className="fas fa-power-off"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {loadingTrips && trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-6 opacity-60">Sincronizando com a Planilha...</p>
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
