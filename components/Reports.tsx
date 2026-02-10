
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
    return approvedTrips.reduce((acc, t) => acc + (t.kmFinal - t.kmInitial), 0);
  }, [approvedTrips]);

  const handleExport = () => {
    alert('Funcionalidade de exportação (PDF/Excel) simulada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatório de Viagens</h2>
          <p className="text-gray-500">Visualização consolidada de viagens aprovadas</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
        >
          <i className="fas fa-file-export"></i>
          <span>Exportar Dados</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Data Inicial</label>
          <input 
            type="date" 
            value={dateFilter.start}
            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Data Final</label>
          <input 
            type="date" 
            value={dateFilter.end}
            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button 
          onClick={() => setDateFilter({ start: '', end: '' })}
          className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Limpar Filtros
        </button>
        
        <div className="w-full sm:w-auto ml-auto pt-2 sm:pt-0">
           <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center justify-between sm:justify-start sm:space-x-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total KM</span>
              <span className="text-xl font-extrabold text-indigo-600">{totalKm} KM</span>
           </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600">Data</th>
                <th className="px-6 py-4 font-bold text-gray-600">Solicitante</th>
                <th className="px-6 py-4 font-bold text-gray-600">Origem</th>
                <th className="px-6 py-4 font-bold text-gray-600">Destino</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-center">KM Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {approvedTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhuma viagem aprovada encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                approvedTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(trip.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-gray-700">{trip.driverName}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.origin}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.destination}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs">
                        {trip.kmFinal - trip.kmInitial} KM
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
