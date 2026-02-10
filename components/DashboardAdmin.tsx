
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

  return (
    <div className="space-y-8">
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative group max-w-4xl max-h-[90vh]">
             <img src={selectedPhoto} className="w-full h-full object-contain rounded-2xl shadow-2xl" alt="Evidence Zoom" />
             <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full text-white">
                <i className="fas fa-times"></i>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel de Auditoria</h2>
          <p className="text-gray-500">Fluxo completo de evidências fotográficas</p>
        </div>
        <div className="bg-indigo-50 px-5 py-2.5 rounded-2xl border border-indigo-100 text-center shadow-sm">
          <span className="text-indigo-600 font-black block text-2xl">{pendingTrips.length}</span>
          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Pendentes</span>
        </div>
      </div>

      <section className="space-y-6">
        {pendingTrips.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
             <i className="fas fa-check-circle text-4xl mb-4 text-indigo-100"></i>
             <p className="font-medium">Tudo em dia! Sem solicitações no momento.</p>
          </div>
        ) : (
          pendingTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-6 border-b flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                     {trip.driverName.charAt(0)}
                   </div>
                   <div>
                      <p className="font-black text-gray-900 leading-none">{trip.driverName}</p>
                      <p className="text-xs font-mono text-indigo-500 mt-1.5">{trip.vehiclePlate} • {new Date(trip.date).toLocaleDateString('pt-BR')}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Solicitado em</p>
                  <p className="text-xs font-bold text-gray-700">{new Date(trip.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Evidências da Rota</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Foto 1: Início */}
                  <div className="space-y-2">
                     <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(trip.photoInitial)}>
                        <img src={trip.photoInitial} className="w-full h-32 object-cover rounded-xl border shadow-sm group-hover:brightness-75 transition-all" />
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] text-white font-bold">{trip.startTime}</span>
                     </div>
                     <p className="text-[9px] font-bold text-center text-gray-500 uppercase tracking-tighter">1. Início: {trip.origin}</p>
                  </div>
                  
                  {/* Foto 2: Chegada Fábrica */}
                  <div className="space-y-2">
                     <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(trip.factoryArrivalPhoto || null)}>
                        {trip.factoryArrivalPhoto ? (
                          <>
                            <img src={trip.factoryArrivalPhoto} className="w-full h-32 object-cover rounded-xl border shadow-sm group-hover:brightness-75 transition-all" />
                            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] text-white font-bold">{trip.factoryArrivalTime}</span>
                          </>
                        ) : <div className="w-full h-32 bg-gray-50 rounded-xl border border-dashed flex items-center justify-center text-gray-300"><i className="fas fa-image"></i></div>}
                     </div>
                     <p className="text-[9px] font-bold text-center text-gray-500 uppercase tracking-tighter">2. Chegada Fábrica</p>
                  </div>

                  {/* Foto 3: Saída Fábrica */}
                  <div className="space-y-2">
                     <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(trip.factoryDeparturePhoto || null)}>
                        {trip.factoryDeparturePhoto ? (
                          <>
                            <img src={trip.factoryDeparturePhoto} className="w-full h-32 object-cover rounded-xl border shadow-sm group-hover:brightness-75 transition-all" />
                            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] text-white font-bold">{trip.factoryDepartureTime}</span>
                          </>
                        ) : <div className="w-full h-32 bg-gray-50 rounded-xl border border-dashed flex items-center justify-center text-gray-300"><i className="fas fa-image"></i></div>}
                     </div>
                     <p className="text-[9px] font-bold text-center text-gray-500 uppercase tracking-tighter">3. Saída Fábrica</p>
                  </div>

                  {/* Foto 4: Final */}
                  <div className="space-y-2">
                     <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(trip.photoFinal || null)}>
                        {trip.photoFinal ? (
                          <>
                            <img src={trip.photoFinal} className="w-full h-32 object-cover rounded-xl border shadow-sm group-hover:brightness-75 transition-all" />
                            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] text-white font-bold">{trip.endTime}</span>
                          </>
                        ) : <div className="w-full h-32 bg-gray-50 rounded-xl border border-dashed flex items-center justify-center text-gray-300"><i className="fas fa-image"></i></div>}
                     </div>
                     <p className="text-[9px] font-bold text-center text-gray-500 uppercase tracking-tighter">4. Destino: {trip.destination}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comentários de Auditoria</label>
                    <textarea
                      placeholder="Alguma ressalva sobre os KMs ou fotos?"
                      value={activeComment[trip.id] || ''}
                      onChange={(e) => setActiveComment({...activeComment, [trip.id]: e.target.value})}
                      className="w-full p-3 border rounded-2xl text-sm h-24 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    ></textarea>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => onUpdateStatus(trip.id, 'Rejeitado', activeComment[trip.id] || '')}
                      className="flex-1 md:flex-none px-8 py-3 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                      REJEITAR
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(trip.id, 'Aprovado', activeComment[trip.id] || '')}
                      className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      APROVAR
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 px-6 py-3 flex justify-between items-center text-white">
                 <div className="flex items-center gap-6">
                    <div>
                       <span className="text-[8px] font-bold uppercase opacity-70 block tracking-widest">KM Inicial</span>
                       <span className="font-bold">{trip.kmInitial}</span>
                    </div>
                    <i className="fas fa-arrow-right text-white/30 text-xs"></i>
                    <div>
                       <span className="text-[8px] font-bold uppercase opacity-70 block tracking-widest">KM Final</span>
                       <span className="font-bold">{trip.kmFinal}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[8px] font-bold uppercase opacity-70 block tracking-widest">Percorrido</span>
                    <span className="text-lg font-black">{(trip.kmFinal || 0) - trip.kmInitial} KM</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default DashboardAdmin;
