
import React, { useState } from 'react';
import { User, Trip, TripStatus } from '../types';
import TripForm from './TripForm';

interface DashboardDriverProps {
  user: User;
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
}

const DashboardDriver: React.FC<DashboardDriverProps> = ({ user, trips, onAddTrip }) => {
  const [showForm, setShowForm] = useState(false);

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: TripStatus) => {
    switch (status) {
      case 'Aprovado': return <i className="fas fa-check-circle mr-1"></i>;
      case 'Rejeitado': return <i className="fas fa-times-circle mr-1"></i>;
      default: return <i className="fas fa-clock mr-1"></i>;
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Minhas Viagens</h2>
          <p className="text-gray-500">Acompanhe o status de suas solicitações</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <i className="fas fa-plus"></i>
          <span>Nova Solicitação</span>
        </button>
      </div>

      <div className="grid gap-4">
        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-route text-gray-300 text-3xl"></i>
            </div>
            <p className="text-gray-500 font-medium">Você ainda não possui viagens registradas.</p>
            <p className="text-sm text-gray-400">Clique no botão acima para iniciar uma nova viagem.</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 transition-all flex flex-col">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    {trip.status}
                  </span>
                  <span className="text-sm text-gray-400 flex items-center">
                    <i className="far fa-calendar-alt mr-2"></i>
                    {new Date(trip.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <div className="w-0.5 h-6 bg-gray-200"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Trajeto</div>
                      <div className="text-gray-800 font-semibold text-lg leading-tight">{trip.origin} <span className="text-gray-300 font-normal mx-1">→</span> {trip.destination}</div>
                    </div>
                  </div>

                  <div className="sm:pl-10 sm:border-l border-gray-100 flex flex-col justify-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Quilometragem</div>
                    <div className="text-gray-800 flex items-baseline space-x-2">
                      <span className="text-xl font-extrabold text-indigo-600">{trip.kmFinal - trip.kmInitial}</span>
                      <span className="text-sm font-bold text-indigo-400">KM TOTAL</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {trip.kmInitial} → {trip.kmFinal}
                    </div>
                  </div>
                </div>

                {trip.adminComment && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                    <div className="absolute -top-2 left-4 px-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">Feedback do Admin</div>
                    <p className="text-sm text-gray-600 italic">"{trip.adminComment}"</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50/50 px-5 py-2 text-[10px] text-gray-400 flex justify-between items-center border-t border-gray-50">
                <span>ID: {trip.id.substring(0, 8)}</span>
                <span>Criado em {new Date(trip.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TripForm 
          user={user} 
          onClose={() => setShowForm(false)} 
          onSubmit={(newTrip) => {
            onAddTrip(newTrip);
            setShowForm(false);
          }} 
        />
      )}
    </div>
  );
};

export default DashboardDriver;
