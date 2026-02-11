
import React, { useState } from 'react';
import { User, Trip, TripStatus } from '../types';
import TripForm from './TripForm';

interface DashboardDriverProps {
  user: User;
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
}

const DashboardDriver: React.FC<DashboardDriverProps> = ({ user, trips, onAddTrip, onUpdateTrip }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filtra viagens nulas ou objetos vazios que podem vir da sincronização com a planilha
  const safeTrips = Array.isArray(trips) ? trips.filter(t => t && t.id) : [];

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Na Fábrica': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Em Trânsito': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getNextActionLabel = (status: TripStatus) => {
    switch(status) {
      case 'Em Andamento': return 'Chegada Fábrica';
      case 'Na Fábrica': return 'Saída Fábrica';
      case 'Em Trânsito': return 'Finalizar Viagem';
      default: return 'Detalhes';
    }
  };

  const openForm = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowForm(true);
  };

  const handleNewTrip = () => {
    setSelectedTrip(null);
    setShowForm(true);
  };

  const isIntermediate = (status: TripStatus) => ['Em Andamento', 'Na Fábrica', 'Em Trânsito'].includes(status);

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '--/--/----';
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return '--/--/----';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Minha Escala</h2>
          <p className="text-gray-500 font-medium">Fluxo: Início → Fábrica → Destino</p>
        </div>
        <button
          onClick={handleNewTrip}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <i className="fas fa-plus text-sm"></i>
          <span>Nova Viagem</span>
        </button>
      </div>

      <div className="grid gap-5">
        {safeTrips.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-truck-loading text-3xl text-gray-200"></i>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
          </div>
        ) : (
          safeTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusColor(trip.status)}`}>
                      <i className={`fas ${trip.status === 'Na Fábrica' ? 'fa-industry' : trip.status === 'Em Trânsito' ? 'fa-route' : 'fa-truck-moving'} mr-2`}></i>
                      {trip.status}
                    </span>
                    <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">{trip.vehiclePlate}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                    {/* Fix: use startDate instead of date */}
                    {formatDate(trip.startDate)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200 ring-4 ring-indigo-50"></div>
                      <div>
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Ponto de Partida</div>
                        <div className="font-black text-gray-800 text-base">{trip.origin || 'N/A'} <span className="text-indigo-500 text-xs ml-2">({trip.startTime || '--:--'})</span></div>
                      </div>
                    </div>
                    {trip.destination && (
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 ring-4 ring-emerald-50"></div>
                        <div>
                          <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Destino Final</div>
                          <div className="font-black text-gray-800 text-base">{trip.destination} <span className="text-emerald-500 text-xs ml-2">({trip.endTime || '--:--'})</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    {isIntermediate(trip.status) ? (
                      <button
                        onClick={() => openForm(trip)}
                        className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center shadow-lg
                          ${trip.status === 'Em Andamento' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 
                            trip.status === 'Na Fábrica' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                      >
                        <i className={`fas ${trip.status === 'Em Andamento' ? 'fa-industry' : trip.status === 'Na Fábrica' ? 'fa-truck-loading' : 'fa-flag-checkered'} mr-3 text-sm`}></i>
                        {getNextActionLabel(trip.status)}
                      </button>
                    ) : (
                      <button
                        onClick={() => openForm(trip)}
                        className="w-full md:w-auto px-6 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                </div>

                {trip.adminComment && (
                  <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 text-[11px] text-red-700 flex items-start italic leading-relaxed">
                    <i className="fas fa-comment-dots mr-3 mt-1 text-sm"></i>
                    <div><span className="font-black not-italic block uppercase text-[8px] opacity-60 mb-1">Mensagem Administrativa:</span> "{trip.adminComment}"</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TripForm 
          user={user} 
          existingTrip={selectedTrip}
          onClose={() => setShowForm(false)} 
          onSubmit={(data) => {
            if (selectedTrip) onUpdateTrip(data);
            else onAddTrip(data);
            setShowForm(false);
          }} 
        />
      )}
    </div>
  );
};

export default DashboardDriver;
