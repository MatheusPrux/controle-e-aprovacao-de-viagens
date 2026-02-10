
import React, { useState, useMemo } from 'react';
import { Trip } from '../types';

interface ReportsProps {
  trips: Trip[];
}

const Reports: React.FC<ReportsProps> = ({ trips }) => {
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  });

  const approvedTrips = useMemo(() => {
    let filtered = trips.filter(t => t.status === 'Aprovado');
    
    if (dateFilter.start) {
      filtered = filtered.filter(t => t.date >= dateFilter.start);
    }
    if (dateFilter.end) {
      filtered = filtered.filter(t => t.date <= dateFilter.end);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips, dateFilter]);

  const totalKm = useMemo(() => {
    return approvedTrips.reduce((acc, t) => acc + ((t.kmFinal || 0) - t.kmInitial), 0);
  }, [approvedTrips]);

  const handleExport = () => {
    alert('Exportação gerada com as métricas de veículo, datas e horários auditados.');
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatório de Logística</h2>
          <p className="text-gray-500">Métricas de frota e quilometragem auditada</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
        >
          <i className="fas fa-file-csv"></i>
          <span>Exportar Relatório</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Início do Período</label>
          <input 
            type="date" 
            value={dateFilter.start}
            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Fim do Período</label>
          <input 
            type="date" 
            value={dateFilter.end}
            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button 
          onClick={() => setDateFilter({ start: '', end: '' })}
          className="px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
        >
          Reset
        </button>
        
        <div className="w-full sm:w-auto ml-auto pt-2 sm:pt-0">
           <div className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-between sm:justify-start sm:space-x-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Auditoria</span>
              <span className="text-xl font-black">{totalKm} KM</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-600">Veículo</th>
                <th className="px-6 py-5 font-bold text-gray-600">Motorista</th>
                <th className="px-6 py-5 font-bold text-gray-600">Período</th>
                <th className="px-6 py-5 font-bold text-gray-600">Origem → Destino</th>
                <th className="px-6 py-5 font-bold text-gray-600 text-center">Distância</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {approvedTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                    Nenhuma viagem auditada para este período.
                  </td>
                </tr>
              ) : (
                approvedTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 font-mono font-bold rounded-lg text-xs">
                        {trip.vehiclePlate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{trip.driverName}</div>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase">Aprovado</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-700">
                        {formatDate(trip.date)} {trip.startTime}
                      </div>
                      <div className="text-xs font-medium text-gray-400">
                        Até {trip.endDate ? formatDate(trip.endDate) : formatDate(trip.date)} {trip.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 font-medium">
                        <span className="text-indigo-600 font-bold">{trip.origin}</span>
                        <i className="fas fa-long-arrow-alt-right mx-2 text-gray-300"></i>
                        <span className="text-purple-600 font-bold">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-black rounded-xl text-xs border border-indigo-100">
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
