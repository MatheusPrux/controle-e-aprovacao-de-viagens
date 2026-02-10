
import React, { useMemo, useState } from 'react';
import { Trip, TripStatus } from '../types';

interface DashboardAdminProps {
  trips: Trip[];
  onUpdateStatus: (tripId: string, status: 'Aprovado' | 'Rejeitado', comment: string) => void;
}

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ trips, onUpdateStatus }) => {
  const [activeComment, setActiveComment] = useState<{ [key: string]: string }>({});
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const pendingTrips = useMemo(() => trips.filter(t => t.status === 'Pendente'), [trips]);
  const processedTrips = useMemo(() => trips.filter(t => t.status === 'Aprovado' || t.status === 'Rejeitado'), [trips]);

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
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-full rounded-xl shadow-2xl" alt="Zoom" />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel de Aprovação</h2>
          <p className="text-gray-500">Aprove viagens finalizadas com auditoria de fotos</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-center">
          <span className="text-indigo-600 font-bold block text-xl">{pendingTrips.length}</span>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Aguardando</span>
        </div>
      </div>

      <section className="space-y-4">
        {pendingTrips.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
            Nenhuma viagem pronta para aprovação no momento.
          </div>
        ) : (
          pendingTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{trip.driverName.charAt(0)}</div>
                   <div>
                      <p className="font-bold text-gray-900">{trip.driverName}</p>
                      <p className="text-[10px] font-mono text-indigo-500">{trip.vehiclePlate}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Solicitado em:</p>
                   <p className="text-xs font-bold text-gray-600">{new Date(trip.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border relative">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">Início: {trip.origin} ({trip.startTime})</p>
                  <p className="font-black text-xl">{trip.kmInitial} KM</p>
                  <button onClick={() => setSelectedPhoto(trip.photoInitial)} className="absolute top-4 right-4 w-12 h-12 rounded border-2 border-white shadow overflow-hidden">
                    <img src={trip.photoInitial} className="w-full h-full object-cover" alt="init" />
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border relative">
                  <p className="text-[10px] font-bold text-purple-500 uppercase mb-2">Fim: {trip.destination} ({trip.endTime})</p>
                  <p className="font-black text-xl">{trip.kmFinal} KM</p>
                  <button onClick={() => setSelectedPhoto(trip.photoFinal || null)} className="absolute top-4 right-4 w-12 h-12 rounded border-2 border-white shadow overflow-hidden">
                    <img src={trip.photoFinal} className="w-full h-full object-cover" alt="end" />
                  </button>
                </div>
              </div>

              <div className="text-center py-2 bg-indigo-600 rounded-xl text-white">
                 <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Quilometragem Auditada</p>
                 <p className="text-2xl font-black">{(trip.kmFinal || 0) - trip.kmInitial} KM</p>
              </div>

              <div className="space-y-3">
                <textarea
                  placeholder="Observações ou justificativa..."
                  value={activeComment[trip.id] || ''}
                  onChange={(e) => handleCommentChange(trip.id, e.target.value)}
                  className="w-full p-3 border rounded-xl text-sm h-20 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <div className="flex gap-3 justify-end">
                   <button onClick={() => onUpdateStatus(trip.id, 'Rejeitado', activeComment[trip.id] || '')} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95">Rejeitar</button>
                   <button onClick={() => onUpdateStatus(trip.id, 'Aprovado', activeComment[trip.id] || '')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow shadow-indigo-100 active:scale-95">Aprovar Viagem</button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {processedTrips.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Histórico Recente</h3>
          <div className="bg-white rounded-2xl border overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-bold">
                  <tr>
                    <th className="px-6 py-3">Veículo</th>
                    <th className="px-6 py-3">Motorista</th>
                    <th className="px-6 py-3">KM Total</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {processedTrips.slice(0, 5).map(trip => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{trip.vehiclePlate}</td>
                      <td className="px-6 py-4 font-medium">{trip.driverName}</td>
                      <td className="px-6 py-4">{(trip.kmFinal || 0) - trip.kmInitial} KM</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status)}`}>{trip.status}</span>
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
