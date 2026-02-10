
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8">
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative group max-w-4xl max-h-[90vh]">
             <img src={selectedPhoto} className="w-full h-full object-contain rounded-2xl shadow-2xl" alt="Evidence Zoom" />
             <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:bg-white/20 transition-all">
                <i className="fas fa-times"></i>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Auditoria de Viagens</h2>
          <p className="text-gray-500 font-medium">Verifique as evidências e os horários de passagem</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border-2 border-indigo-100 text-center shadow-lg shadow-indigo-100/50">
          <span className="text-indigo-600 font-black block text-3xl leading-none">{pendingTrips.length}</span>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 block">Para Aprovar</span>
        </div>
      </div>

      <section className="space-y-8">
        {pendingTrips.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check-double text-3xl text-indigo-300"></i>
             </div>
             <p className="text-gray-800 font-black text-xl mb-1 uppercase">Fluxo Limpo</p>
             <p className="text-gray-400 font-medium">Todas as viagens pendentes foram processadas.</p>
          </div>
        ) : (
          pendingTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="bg-gray-50/50 p-6 border-b flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-200">
                     {trip.driverName.charAt(0)}
                   </div>
                   <div>
                      <p className="font-black text-gray-900 text-lg leading-none">{trip.driverName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-mono font-black text-white bg-indigo-500 px-2 py-0.5 rounded-md uppercase tracking-wider">{trip.vehiclePlate}</span>
                        <span className="text-xs font-bold text-gray-400 italic">Início: {formatDate(trip.date)}</span>
                        {trip.endDate && trip.endDate !== trip.date && (
                          <span className="text-xs font-bold text-emerald-600 italic">Fim: {formatDate(trip.endDate)}</span>
                        )}
                      </div>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Solicitado em</p>
                  <p className="text-sm font-black text-gray-800">{new Date(trip.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} • {new Date(trip.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-end mb-6">
                   <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest border-b-2 border-indigo-50 pb-1">Cronologia de Evidências</h4>
                   {trip.factoryName && (
                     <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-wider">
                       <i className="fas fa-industry mr-2"></i> {trip.factoryName}
                     </span>
                   )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Foto 1: Início */}
                  <div className="group space-y-3">
                     <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-indigo-400 transition-all shadow-md" onClick={() => setSelectedPhoto(trip.photoInitial)}>
                        <img src={trip.photoInitial} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-900 font-black shadow-xl">{trip.startTime}</span>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">1. Partida</p>
                        <p className="text-[11px] font-bold text-gray-800 truncate">{trip.origin}</p>
                     </div>
                  </div>
                  
                  {/* Foto 2: Chegada Fábrica */}
                  <div className="group space-y-3">
                     <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-amber-400 transition-all shadow-md" onClick={() => setSelectedPhoto(trip.factoryArrivalPhoto || null)}>
                        {trip.factoryArrivalPhoto ? (
                          <>
                            <img src={trip.factoryArrivalPhoto} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-900 font-black shadow-xl">{trip.factoryArrivalTime}</span>
                          </>
                        ) : <div className="w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300"><i className="fas fa-camera text-2xl mb-2"></i><span className="text-[10px] font-bold">SEM FOTO</span></div>}
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">2. Chegada Fábrica</p>
                        <p className="text-[11px] font-bold text-amber-600 truncate">{trip.factoryName || 'N/A'}</p>
                     </div>
                  </div>

                  {/* INFO 3: Saída Fábrica (Sem Foto) */}
                  <div className="space-y-3">
                     <div className="w-full h-40 bg-orange-50 rounded-2xl border-2 border-orange-100 flex flex-col items-center justify-center text-orange-600 shadow-sm">
                        <i className="fas fa-clock text-3xl mb-3"></i>
                        <span className="text-xl font-black">{trip.factoryDepartureTime || '--:--'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Horário de Saída</span>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">3. Saída Fábrica</p>
                        <p className="text-[11px] font-bold text-orange-600 truncate">Apenas Registro Horário</p>
                     </div>
                  </div>

                  {/* Foto 4: Final */}
                  <div className="group space-y-3">
                     <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-green-400 transition-all shadow-md" onClick={() => setSelectedPhoto(trip.photoFinal || null)}>
                        {trip.photoFinal ? (
                          <>
                            <img src={trip.photoFinal} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-900 font-black shadow-xl">{trip.endTime}</span>
                          </>
                        ) : <div className="w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300"><i className="fas fa-camera text-2xl mb-2"></i><span className="text-[10px] font-bold">SEM FOTO</span></div>}
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">4. Destino Final</p>
                        <p className="text-[11px] font-bold text-green-600 truncate">{trip.destination}</p>
                     </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Notas de Auditoria</label>
                    <textarea
                      placeholder="Alguma ressalva sobre a rota ou horários?"
                      value={activeComment[trip.id] || ''}
                      onChange={(e) => setActiveComment({...activeComment, [trip.id]: e.target.value})}
                      className="w-full p-4 border-2 border-gray-50 rounded-2xl text-sm h-28 bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all"
                    ></textarea>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => onUpdateStatus(trip.id, 'Rejeitado', activeComment[trip.id] || '')}
                      className="flex-1 md:flex-none px-10 py-4 bg-white border-2 border-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                      REJEITAR
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(trip.id, 'Aprovado', activeComment[trip.id] || '')}
                      className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                      APROVAR
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 px-8 py-5 flex justify-between items-center text-white">
                 <div className="flex items-center gap-10">
                    <div>
                       <span className="text-[9px] font-black uppercase opacity-60 block tracking-widest mb-1">Início da Rota</span>
                       <div className="flex items-center gap-2">
                          <i className="fas fa-tachometer-alt text-indigo-300"></i>
                          <span className="font-black text-lg">{trip.kmInitial} KM</span>
                       </div>
                    </div>
                    <i className="fas fa-chevron-right text-white/20 text-xl"></i>
                    <div>
                       <span className="text-[9px] font-black uppercase opacity-60 block tracking-widest mb-1">Final da Rota</span>
                       <div className="flex items-center gap-2">
                          <i className="fas fa-flag-checkered text-indigo-300"></i>
                          <span className="font-black text-lg">{trip.kmFinal} KM</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black uppercase opacity-60 block tracking-widest mb-1">Distância Auditada</span>
                    <span className="text-3xl font-black">{(trip.kmFinal || 0) - trip.kmInitial} <span className="text-sm opacity-60">KM</span></span>
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
