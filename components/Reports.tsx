
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
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {selectedGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm" onClick={() => setSelectedGallery(null)}>
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-10 border-b pb-6 border-gray-100">
                 <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Audit Log Detalhado</h3>
                    <p className="text-gray-500 font-bold mt-2">
                       Motorista: <span className="text-indigo-600">{selectedGallery.driverName}</span> 
                       <span className="mx-3 text-gray-200">|</span> 
                       Veículo: <span className="text-indigo-600">{selectedGallery.vehiclePlate}</span>
                    </p>
                 </div>
                 <button onClick={() => setSelectedGallery(null)} className="p-5 bg-gray-50 rounded-full hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-900 group">
                    <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform"></i>
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   {img: selectedGallery.photoInitial, label: '1. Partida', sub: selectedGallery.origin, time: selectedGallery.startTime, icon: 'fa-play', color: 'indigo'},
                   {img: selectedGallery.factoryArrivalPhoto, label: '2. Chegada Fáb.', sub: selectedGallery.factoryName, time: selectedGallery.factoryArrivalTime, icon: 'fa-industry', color: 'amber'},
                   {img: null, label: '3. Saída Fáb.', sub: selectedGallery.factoryName, time: selectedGallery.factoryDepartureTime, icon: 'fa-clock', color: 'orange', noPhoto: true},
                   {img: selectedGallery.photoFinal, label: '4. Destino Final', sub: selectedGallery.destination, time: selectedGallery.endTime, icon: 'fa-flag-checkered', color: 'emerald'},
                 ].map((ev, idx) => (
                   <div key={idx} className="group flex flex-col items-center">
                      <div className={`w-full aspect-square relative overflow-hidden rounded-[2.5rem] bg-gray-50 border-4 border-transparent hover:border-${ev.color}-400 transition-all duration-500 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center`}>
                         {ev.noPhoto ? (
                           <div className="flex flex-col items-center justify-center text-orange-400">
                             <i className={`fas ${ev.icon} text-6xl mb-4 opacity-40`}></i>
                             <span className="text-[12px] font-black tracking-widest uppercase">Somente Horário</span>
                           </div>
                         ) : ev.img ? (
                           <img src={ev.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={ev.label} />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                             <i className={`fas ${ev.icon} text-5xl mb-3 opacity-20`}></i>
                             <span className="text-[10px] font-black tracking-widest uppercase">Sem Registro</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="mt-6 text-center w-full">
                         <p className={`text-[10px] font-black uppercase text-${ev.color}-500 tracking-[0.2em] mb-1`}>{ev.label}</p>
                         <h4 className="text-sm font-black text-gray-900 uppercase truncate leading-tight mb-3">{ev.sub || '---'}</h4>
                         <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-inner">
                            <i className={`fas fa-clock text-[11px] text-${ev.color}-300 mr-2`}></i>
                            <span className="text-sm font-black text-gray-800 font-mono tracking-tighter">{ev.time || '--:--'}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-black">
                       <i className="fas fa-route text-indigo-400"></i>
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase opacity-40 block tracking-widest mb-1">Cálculo de Auditoria</span>
                       <span className="text-3xl font-black tracking-tighter">Distância: {(selectedGallery.kmFinal || 0) - selectedGallery.kmInitial} KM</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-x-12 gap-y-2 border-l border-white/10 pl-12 text-right">
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest text-left">Leitura Inicial:</p>
                    <p className="text-sm font-black font-mono">{selectedGallery.kmInitial} KM</p>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest text-left">Leitura Final:</p>
                    <p className="text-sm font-black font-mono">{selectedGallery.kmFinal || '--'} KM</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Controle de Frota</h2>
          <p className="text-gray-500 font-bold mt-2 flex items-center">
             <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
             Monitoramento de horários e rotas aprovadas
          </p>
        </div>
        <div className="bg-white border-2 border-emerald-50 p-6 rounded-[2rem] shadow-xl shadow-emerald-100/40 flex items-center gap-6">
           <div className="w-14 h-14 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-xl shadow-lg shadow-emerald-200">
              <i className="fas fa-check-double"></i>
           </div>
           <div>
              <span className="text-[11px] font-black text-emerald-300 uppercase tracking-widest block mb-1">Acumulado Auditado</span>
              <span className="text-4xl font-black text-emerald-950 tracking-tighter leading-none">{totalKm} <span className="text-sm uppercase opacity-40">KM</span></span>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">De</label>
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="w-full p-4.5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all outline-none font-bold" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Até</label>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="w-full p-4.5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all outline-none font-bold" />
        </div>
        <button onClick={() => setDateFilter({ start: '', end: '' })} className="h-[58px] px-10 text-[12px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-all hover:bg-indigo-50 rounded-[1.5rem] border-2 border-transparent hover:border-indigo-100">Reset</button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em]">Registro</th>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em]">Condutor</th>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em]">Itinerário</th>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em] text-center">Timeline</th>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em] text-center">Fotos</th>
                <th className="px-10 py-8 font-black text-gray-400 uppercase text-[11px] tracking-[0.2em] text-center">Saldo KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {approvedTrips.length === 0 ? (
                <tr><td colSpan={6} className="px-10 py-24 text-center text-gray-300 italic font-black text-xl uppercase tracking-widest opacity-30">Sem registros para o período</td></tr>
              ) : (
                approvedTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="font-black text-gray-950 text-xl tracking-tighter">{formatDate(trip.date)}</div>
                      <div className="flex items-center mt-1">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{trip.startTime}</span>
                         <i className="fas fa-arrow-right mx-2 text-[8px] text-gray-200"></i>
                         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{trip.endTime || 'Em Curso'}</span>
                      </div>
                      {trip.endDate && trip.endDate !== trip.date && (
                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2">FIM: {formatDate(trip.endDate)}</div>
                      )}
                    </td>
                    <td className="px-10 py-6">
                      <div className="font-black text-gray-900 text-base">{trip.driverName}</div>
                      <div className="text-[11px] font-black text-indigo-500 bg-indigo-50/50 border border-indigo-100 px-3 py-1 rounded-xl inline-block mt-2 uppercase tracking-widest">{trip.vehiclePlate}</div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-800">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                           <span className="text-gray-950">{trip.origin}</span>
                        </div>
                        {trip.factoryName && (
                          <div className="flex items-center gap-3 text-[11px] font-black text-amber-600 bg-amber-50 self-start px-3 py-1 rounded-full border border-amber-100/50">
                             <i className="fas fa-industry text-[10px]"></i>
                             <span>{trip.factoryName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-800">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <span className="text-gray-950">{trip.destination}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <div className="inline-grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] font-black font-mono">
                          <span className="text-right text-gray-300 uppercase tracking-widest">Partida:</span>
                          <span className="text-left text-indigo-600">{trip.startTime}</span>
                          {trip.factoryArrivalTime && (
                            <>
                              <span className="text-right text-gray-300 uppercase tracking-widest">Entrada:</span>
                              <span className="text-left text-amber-500">{trip.factoryArrivalTime}</span>
                              <span className="text-right text-gray-300 uppercase tracking-widest">Saída:</span>
                              <span className="text-left text-orange-600">{trip.factoryDepartureTime}</span>
                            </>
                          )}
                          <span className="text-right text-gray-300 uppercase tracking-widest">Chegada:</span>
                          <span className="text-left text-emerald-600">{trip.endTime}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => setSelectedGallery(trip)} className="inline-flex p-2 bg-white rounded-[1.25rem] border-2 border-gray-100 shadow-sm hover:border-indigo-400 hover:shadow-indigo-100 transition-all -space-x-5 hover:space-x-1">
                        <img src={trip.photoInitial} className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-sm" />
                        {trip.factoryArrivalPhoto && <img src={trip.factoryArrivalPhoto} className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-sm" />}
                        {trip.photoFinal && <img src={trip.photoFinal} className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-sm" />}
                        <div className="w-10 h-10 rounded-xl border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg shadow-indigo-100">+</div>
                      </button>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="bg-gray-50 text-gray-950 font-black px-6 py-3 rounded-2xl border border-gray-100 text-sm shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 tracking-tight">
                        {(trip.kmFinal || 0) - trip.kmInitial} KM
                      </div>
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
