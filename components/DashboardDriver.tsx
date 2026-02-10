
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Minhas Viagens</h2>
          <p className="text-gray-500">Fluxo: Início {"\u2192"} Fábrica {"\u2192"} Destino</p>
        </div>
        <button
          onClick={handleNewTrip}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <i className="fas fa-plus"></i>
          <span>Nova Viagem</span>
        </button>
      </div>

      <div className="grid gap-4">
        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed text-center text-gray-400">
            Comece sua primeira viagem agora!
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status)}`}>
                      <i className={`fas ${trip.status === 'Na Fábrica' ? 'fa-industry' : trip.status === 'Em Trânsito' ? 'fa-route' : 'fa-truck-moving'} mr-1`}></i>
                      {trip.status}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold">{trip.vehiclePlate}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(trip.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partida</div>
                        <div className="font-bold text-gray-800">{trip.origin} <span className="text-indigo-400 text-xs font-medium ml-1">({trip.startTime})</span></div>
                      </div>
                    </div>
                    {trip.destination && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destino</div>
                          <div className="font-bold text-gray-800">{trip.destination} <span className="text-green-400 text-xs font-medium ml-1">({trip.endTime})</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    {isIntermediate(trip.status) && (
                      <button
                        onClick={() => openForm(trip)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center shadow-md
                          ${trip.status === 'Em Andamento' ? 'bg-amber-500 hover:bg-amber-600' : 
                            trip.status === 'Na Fábrica' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        <i className={`fas ${trip.status === 'Em Andamento' ? 'fa-industry' : trip.status === 'Na Fábrica' ? 'fa-truck-loading' : 'fa-flag-checkered'} mr-2`}></i>
                        {getNextActionLabel(trip.status)}
                      </button>
                    )}
                  </div>
                </div>

                {trip.adminComment && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 flex items-start italic">
                    <i className="fas fa-comment-dots mr-2 mt-0.5"></i>
                    <div><span className="font-bold not-italic block uppercase text-[8px] opacity-70">Admin:</span> "{trip.adminComment}"</div>
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
