
import React, { useState, useMemo } from 'react';
import { Trip } from '../types';

interface ReportsProps {
  trips: Trip[];
}

const Reports: React.FC<ReportsProps> = ({ trips }) => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [plateFilter, setPlateFilter] = useState('');
  const [selectedGallery, setSelectedGallery] = useState<Trip | null>(null);

  // Função para link direto do Drive
  const getDirectLink = (url: string | undefined) => {
    if (!url || url.length < 10) return '';
    if (url.startsWith('data:image')) return url;
    if (url.includes('drive.google.com')) {
      const match = url.match(/[-\w]{25,}/);
      if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
    }
    return url;
  };

  const formatDateDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return '--/--/----';
    const dateOnly = String(dateStr).split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateOnly;
  };

  const formatTimeDisplay = (timeVal: string | undefined) => {
    if (!timeVal) return '--:--';
    const val = String(timeVal);
    if (val.includes('T')) {
      const timePart = val.split('T')[1];
      return timePart.substring(0, 5);
    }
    if (/^\d{2}:\d{2}/.test(val)) {
      return val.substring(0, 5);
    }
    return val;
  };

  // Identifica todas as placas únicas para o filtro
  const uniquePlates = useMemo(() => {
    const plates = new Set<string>();
    trips.forEach(t => {
      if (t.vehiclePlate) plates.add(t.vehiclePlate);
    });
    return Array.from(plates).sort();
  }, [trips]);

  const approvedTrips = useMemo(() => {
    let filtered = trips.filter(t => t && t.status === 'Aprovado');
    if (dateFilter.start) filtered = filtered.filter(t => t.startDate >= dateFilter.start);
    if (dateFilter.end) filtered = filtered.filter(t => t.startDate <= dateFilter.end);
    if (plateFilter) filtered = filtered.filter(t => t.vehiclePlate === plateFilter);
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [trips, dateFilter, plateFilter]);

  const totalKm = useMemo(() => 
    approvedTrips.reduce((acc, t) => acc + ((Number(t.kmFinal) || 0) - (Number(t.kmInitial) || 0)), 0), 
  [approvedTrips]);

  const PhotoItem = ({ src, label }: { src?: string, label: string }) => {
    const directSrc = getDirectLink(src);
    return (
      <div className="relative aspect-square rounded-[2rem] bg-gray-100 overflow-hidden border-2 border-gray-50 shadow-sm group cursor-pointer" onClick={() => directSrc && window.open(directSrc, '_blank')}>
        {directSrc ? (
          <img 
            src={directSrc} 
            alt={label} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('placehold.co')) {
                img.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=Erro+Imagem`;
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
             <i className="fas fa-image-slash"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Abrir</div>
      </div>
    );
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
                 <button onClick={() => setSelectedGallery(null)} className="p-5 bg-gray-50 rounded-full hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-900">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.photoInitial} label="Painel Saída" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-indigo-500 uppercase">1. Partida</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.origin}</p>
                       <p className="text-xs font-mono font-bold text-indigo-400">{formatTimeDisplay(selectedGallery.startTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.factoryArrivalPhoto} label="Entrada Fábrica" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-amber-500 uppercase">2. Chegada Fábrica</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.factoryName}</p>
                       <p className="text-xs font-mono font-bold text-amber-400">{formatTimeDisplay(selectedGallery.factoryArrivalTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="aspect-square bg-orange-50 rounded-[2rem] flex flex-col items-center justify-center text-orange-400 border-2 border-orange-100">
                       <i className="fas fa-clock text-4xl mb-2"></i>
                       <span className="text-2xl font-black">{formatTimeDisplay(selectedGallery.factoryDepartureTime)}</span>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-orange-500 uppercase">3. Saída Fábrica</p>
                       <p className="text-sm font-black text-gray-800">Sem Registro Visual</p>
                       <p className="text-xs font-mono font-bold text-orange-400">{formatTimeDisplay(selectedGallery.factoryDepartureTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.photoFinal} label="Painel Chegada" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-emerald-500 uppercase">4. Chegada Final</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.destination}</p>
                       <p className="text-xs font-mono font-bold text-emerald-400">{formatTimeDisplay(selectedGallery.endTime)}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-black">
                       <i className="fas fa-route text-indigo-400"></i>
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase opacity-40 block tracking-widest mb-1">Audit Score</span>
                       <span className="text-3xl font-black tracking-tighter">{(Number(selectedGallery.kmFinal) || 0) - (Number(selectedGallery.kmInitial) || 0)} KM</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">DT Vinculada</p>
                    <p className="text-xl font-black text-indigo-400">{selectedGallery.numero_dt || 'N/A'}</p>
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
             Relatório de Atividades Auditadas
          </p>
        </div>
        <div className="bg-white border-2 border-emerald-50 p-6 rounded-[2rem] shadow-xl flex items-center gap-6">
           <div className="w-14 h-14 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-xl shadow-lg shadow-emerald-200">
              <i className="fas fa-check-double"></i>
           </div>
           <div>
              <span className="text-[11px] font-black text-emerald-300 uppercase tracking-widest block mb-1">Total Auditado</span>
              <span className="text-4xl font-black text-emerald-950 tracking-tighter leading-none">{totalKm} <span className="text-sm uppercase opacity-40">KM</span></span>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">De</label>
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="w-full p-4.5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Até</label>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="w-full p-4.5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Veículo</label>
          <select value={plateFilter} onChange={e => setPlateFilter(e.target.value)} className="w-full p-4.5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold">
            <option value="">TODAS AS PLACAS</option>
            {uniquePlates.map(plate => (
              <option key={plate} value={plate}>{plate}</option>
            ))}
          </select>
        </div>
        <button onClick={() => { setDateFilter({ start: '', end: '' }); setPlateFilter(''); }} className="h-[58px] px-10 text-[12px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-all hover:bg-indigo-50 rounded-[1.5rem] border-2 border-transparent">Reset</button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
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
                approvedTrips.map(trip => {
                   const diff = (Number(trip.kmFinal) || 0) - (Number(trip.kmInitial) || 0);
                   const hasAllPhotos = trip.photoInitial && trip.photoFinal;
                   return (
                  <tr key={trip.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="font-black text-gray-950 text-xl tracking-tighter">{formatDateDisplay(trip.startDate)}</div>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">ID #{trip.id}</div>
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
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-800">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <span className="text-gray-950">{trip.destination}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <div className="inline-grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-black font-mono">
                          <span className="text-right text-indigo-300 uppercase tracking-widest">Partida:</span>
                          <span className="text-left text-indigo-600">{formatTimeDisplay(trip.startTime)}</span>
                          
                          {trip.factoryArrivalTime && (
                            <>
                              <span className="text-right text-amber-300 uppercase tracking-widest">Entrada:</span>
                              <span className="text-left text-amber-500">{formatTimeDisplay(trip.factoryArrivalTime)}</span>
                            </>
                          )}

                          {trip.factoryDepartureTime && (
                            <>
                              <span className="text-right text-orange-300 uppercase tracking-widest">Saída:</span>
                              <span className="text-left text-orange-500">{formatTimeDisplay(trip.factoryDepartureTime)}</span>
                            </>
                          )}
                          
                          <span className="text-right text-emerald-300 uppercase tracking-widest">Chegada:</span>
                          <span className="text-left text-emerald-600">{formatTimeDisplay(trip.endTime)}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => setSelectedGallery(trip)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                        <i className={`fas ${hasAllPhotos ? 'fa-images' : 'fa-camera'} text-lg`}></i>
                        <span className="text-[10px] font-black uppercase">Ver Evidências</span>
                      </button>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="bg-gray-50 text-gray-950 font-black px-6 py-3 rounded-2xl border border-gray-100 text-sm shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 tracking-tight">
                        {isNaN(diff) || diff < 0 ? 0 : diff} KM
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
