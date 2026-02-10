
import React, { useState, useMemo } from 'react';
import { Trip } from '../types';

interface ReportsProps {
  trips: Trip[];
}

const Reports: React.FC<ReportsProps> = ({ trips }) => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [selectedGallery, setSelectedGallery] = useState<Trip | null>(null);

  const approvedTrips = useMemo(() => {
    let filtered = trips.filter(t => t.status === 'Aprovado');
    if (dateFilter.start) filtered = filtered.filter(t => t.date >= dateFilter.start);
    if (dateFilter.end) filtered = filtered.filter(t => t.date <= dateFilter.end);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips, dateFilter]);

  const totalKm = useMemo(() => approvedTrips.reduce((acc, t) => acc + ((t.kmFinal || 0) - t.kmInitial), 0), [approvedTrips]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {selectedGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6" onClick={() => setSelectedGallery(null)}>
           <div className="bg-white p-6 rounded-3xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-black text-gray-800">Galeria de Evidências</h3>
                    <p className="text-sm text-gray-500">{selectedGallery.driverName} • {selectedGallery.vehiclePlate}</p>
                 </div>
                 <button onClick={() => setSelectedGallery(null)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   {img: selectedGallery.photoInitial, label: 'Partida', time: selectedGallery.startTime},
                   {img: selectedGallery.factoryArrivalPhoto, label: 'Chegada Fáb.', time: selectedGallery.factoryArrivalTime},
                   {img: selectedGallery.factoryDeparturePhoto, label: 'Saída Fáb.', time: selectedGallery.factoryDepartureTime},
                   {img: selectedGallery.photoFinal, label: 'Destino', time: selectedGallery.endTime},
                 ].map((ev, idx) => (
                   ev.img ? (
                     <div key={idx} className="space-y-2">
                        <img src={ev.img} className="w-full h-48 object-cover rounded-xl border" />
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase text-gray-400">{ev.label}</p>
                           <p className="text-xs font-bold text-indigo-600">{ev.time}</p>
                        </div>
                     </div>
                   ) : <div key={idx} className="h-48 bg-gray-50 rounded-xl border border-dashed flex items-center justify-center text-gray-300">N/A</div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatório de Frota</h2>
          <p className="text-gray-500">Histórico detalhado de quilometragem e fotos</p>
        </div>
        <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
           <i className="fas fa-check-double"></i>
           <span>Auditado: {totalKm} KM</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Início</label>
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Fim</label>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
        </div>
        <button onClick={() => setDateFilter({ start: '', end: '' })} className="px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Limpar</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase text-[10px]">Período</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase text-[10px]">Motorista / Veículo</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase text-[10px]">Rota</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase text-[10px]">Evidências</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase text-[10px] text-center">Distância</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {approvedTrips.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Nenhum dado encontrado para os filtros selecionados.</td></tr>
              ) : (
                approvedTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700">{formatDate(trip.date)}</div>
                      <div className="text-[10px] text-gray-400">{trip.endDate ? `Fim: ${formatDate(trip.endDate)}` : 'Mesmo dia'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{trip.driverName}</div>
                      <div className="text-[10px] font-mono font-bold text-indigo-500">{trip.vehiclePlate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 flex items-center">
                        <span className="font-medium">{trip.origin}</span>
                        <i className="fas fa-long-arrow-alt-right mx-2 text-gray-300"></i>
                        <span className="font-medium">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedGallery(trip)} className="flex -space-x-2 hover:space-x-1 transition-all">
                        <img src={trip.photoInitial} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        {trip.factoryArrivalPhoto && <img src={trip.factoryArrivalPhoto} className="w-8 h-8 rounded-full border-2 border-white object-cover" />}
                        {trip.photoFinal && <img src={trip.photoFinal} className="w-8 h-8 rounded-full border-2 border-white object-cover" />}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-600 font-black">+</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-800 font-black rounded-xl text-xs border">
                        {(trip.kmFinal || 0) - trip.kmInitial} KM
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
