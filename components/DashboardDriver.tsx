
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
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const openFinishForm = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowForm(true);
  };

  const handleNewTrip = () => {
    setSelectedTrip(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel do Motorista</h2>
          <p className="text-gray-500">Controle de início e fim de viagens</p>
        </div>
        <button
          onClick={handleNewTrip}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <i className="fas fa-play"></i>
          <span>Iniciar Viagem</span>
        </button>
      </div>

      <div className="grid gap-4">
        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border text-center text-gray-400">
            Nenhuma viagem iniciada ou registrada.
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status)}`}>
                      {trip.status === 'Em Andamento' && <i className="fas fa-truck-moving mr-1"></i>}
                      {trip.status}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold">{trip.vehiclePlate}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(trip.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Origem</div>
                    <div className="font-bold text-gray-900">{trip.origin} <span className="text-indigo-600 ml-2">({trip.startTime})</span></div>
                    <div className="text-xs text-gray-500">KM Inicial: {trip.kmInitial}</div>
                  </div>

                  {trip.status === 'Em Andamento' ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => openFinishForm(trip)}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow hover:bg-green-700 transition-all active:scale-95 flex items-center"
                      >
                        <i className="fas fa-flag-checkered mr-2"></i> Finalizar Viagem
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 md:text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Destino</div>
                      <div className="font-bold text-gray-900">{trip.destination} <span className="text-purple-600 ml-2">({trip.endTime})</span></div>
                      <div className="text-xs text-gray-500">KM Final: {trip.kmFinal} | Total: {(trip.kmFinal || 0) - trip.kmInitial} KM</div>
                    </div>
                  )}
                </div>

                {trip.adminComment && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border text-xs text-gray-600 italic">
                    <span className="font-bold text-gray-400 block mb-1 uppercase">Observação Admin:</span>
                    "{trip.adminComment}"
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
