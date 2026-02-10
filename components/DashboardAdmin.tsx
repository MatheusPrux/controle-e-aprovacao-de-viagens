
import React, { useMemo, useState } from 'react';
import { Trip, TripStatus } from '../types';

interface DashboardAdminProps {
  trips: Trip[];
  onUpdateStatus: (tripId: string, status: 'Aprovado' | 'Rejeitado', comment: string) => void;
}

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ trips, onUpdateStatus }) => {
  const [activeComment, setActiveComment] = useState<{ [key: string]: string }>({});
  const pendingTrips = useMemo(() => trips.filter(t => t.status === 'Pendente'), [trips]);
  const processedTrips = useMemo(() => trips.filter(t => t.status !== 'Pendente'), [trips]);

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handleCommentChange = (id: string, value: string) => {
    setActiveComment(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel de Aprovação</h2>
          <p className="text-gray-500">Gerencie as solicitações dos motoristas</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center space-x-2">
          <span className="text-indigo-600 font-bold text-xl">{pendingTrips.length}</span>
          <span className="text-indigo-600 text-sm font-medium uppercase tracking-wider">pendentes</span>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Solicitações Pendentes</h3>
        {pendingTrips.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-200 text-center">
            <i className="fas fa-check-double text-gray-300 text-3xl mb-3"></i>
            <p className="text-gray-500">Tudo em dia! Nenhuma solicitação pendente.</p>
          </div>
        ) : (
          pendingTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-6 hover:border-indigo-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {trip.driverName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{trip.driverName}</h3>
                    <p className="text-xs text-gray-400">Solicitado em {new Date(trip.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-gray-50 p-3 rounded-xl flex-1 md:max-w-md">
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Trajeto</p>
                      <p className="text-sm font-semibold truncate">{trip.origin} → {trip.destination}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Distância</p>
                      <p className="text-sm font-bold text-indigo-600">{trip.kmFinal - trip.kmInitial} KM</p>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Comentário (Opcional)</label>
                <textarea
                  placeholder="Escreva um comentário para o motorista..."
                  value={activeComment[trip.id] || ''}
                  onChange={(e) => handleCommentChange(trip.id, e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none bg-gray-50/50"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => onUpdateStatus(trip.id, 'Rejeitado', activeComment[trip.id] || '')}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center"
                >
                  <i className="fas fa-times mr-2"></i> Rejeitar
                </button>
                <button
                  onClick={() => onUpdateStatus(trip.id, 'Aprovado', activeComment[trip.id] || '')}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center"
                >
                  <i className="fas fa-check mr-2"></i> Aprovar
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {processedTrips.length > 0 && (
        <section className="space-y-4 opacity-75">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Histórico Recente</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-bold text-gray-600">Motorista</th>
                    <th className="px-6 py-3 font-bold text-gray-600">Rota</th>
                    <th className="px-6 py-3 font-bold text-gray-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {processedTrips.slice(0, 5).map(trip => (
                    <tr key={trip.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium">{trip.driverName}</td>
                      <td className="px-6 py-4 text-gray-500">{trip.origin} → {trip.destination}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardAdmin;
