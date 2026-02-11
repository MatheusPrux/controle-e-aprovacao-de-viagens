
import React, { useState, useMemo } from 'react';
import { Trip } from '../types';

interface ReportsProps {
  trips: Trip[];
}

const Reports: React.FC<ReportsProps> = ({ trips }) => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [plateFilter, setPlateFilter] = useState('');
  const [selectedGallery, setSelectedGallery] = useState<Trip | null>(null);

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
    if (/^\d{2}:\d{2}/.test(val)) return val.substring(0, 5);
    return val;
  };

  const uniquePlates = useMemo(() => {
    const plates = new Set<string>();
    trips.forEach(t => { if (t.vehiclePlate) plates.add(t.vehiclePlate); });
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

  const exportToExcel = () => {
    if (approvedTrips.length === 0) {
      alert("Não há dados filtrados para exportar.");
      return;
    }

    const dataToExport = approvedTrips.map(trip => ({
      ID: trip.id,
      Motorista: trip.driverName,
      Placa: trip.vehiclePlate,
      'Data Início': formatDateDisplay(trip.startDate),
      'Hora Início': formatTimeDisplay(trip.startTime),
      'KM Inicial': trip.kmInitial,
      'Fábrica': trip.factoryName || 'N/A',
      'KM Final': trip.kmFinal || 0,
      'Saldo KM': (Number(trip.kmFinal) || 0) - (Number(trip.kmInitial) || 0),
      'Nº DT': trip.numero_dt || '',
      'Comissão (R$)': trip.valor_comissao || 0,
      'Status': trip.status,
      'Comentário': trip.adminComment || ''
    }));

    // @ts-ignore
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    // @ts-ignore
    const wb = XLSX.utils.book_new();
    // @ts-ignore
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Filler");
    // @ts-ignore
    XLSX.writeFile(wb, `Relatorio_Filler_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (approvedTrips.length === 0) {
      alert("Não há dados filtrados para exportar.");
      return;
    }

    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.setTextColor(0, 26, 51); // Navy Filler
    doc.text("Relatório de Viagens - Filler Logística", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.text(`Filtro Placa: ${plateFilter || 'Todas'}`, 14, 33);
    doc.text(`Período: ${dateFilter.start || 'Início'} até ${dateFilter.end || 'Fim'}`, 14, 38);

    // Resumo KM
    doc.setFillColor(241, 90, 36); // Orange Filler
    doc.rect(14, 45, 182, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`TOTAL QUILOMETRAGEM AUDITADA: ${totalKm} KM`, 20, 53);

    const tableRows = approvedTrips.map(trip => [
      formatDateDisplay(trip.startDate),
      trip.driverName,
      trip.vehiclePlate,
      trip.kmInitial,
      trip.kmFinal || 0,
      (Number(trip.kmFinal) || 0) - (Number(trip.kmInitial) || 0),
      trip.status
    ]);

    // @ts-ignore
    doc.autoTable({
      startY: 65,
      head: [['Data', 'Motorista', 'Placa', 'KM Inicial', 'KM Final', 'Saldo', 'Status']],
      body: tableRows,
      headStyles: { fillColor: [0, 26, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 249] },
      margin: { top: 65 },
      theme: 'grid'
    });

    doc.save(`Relatorio_Filler_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const PhotoItem = ({ src, label }: { src?: string, label: string }) => {
    const directSrc = getDirectLink(src);
    return (
      <div className="relative aspect-square rounded-[2rem] bg-gray-100 overflow-hidden border-2 border-gray-50 shadow-sm group cursor-pointer" onClick={() => directSrc && window.open(directSrc, '_blank')}>
        {directSrc ? (
          <img src={directSrc} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('placehold.co')) img.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=Erro+Imagem`;
          }} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300"><i className="fas fa-image-slash"></i></div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Abrir</div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {selectedGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm" onClick={() => setSelectedGallery(null)}>
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-[#001A33]/10" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-10 border-b pb-8 border-gray-100">
                 <div>
                    <h3 className="text-3xl font-black text-[#001A33] tracking-tighter uppercase italic">Audit Log <span className="text-orange-500">Detalhado</span></h3>
                    <p className="text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest">
                       Operador: <span className="text-orange-500">{selectedGallery.driverName}</span> 
                       <span className="mx-4 text-gray-200">|</span> 
                       Placa: <span className="text-[#001A33]">{selectedGallery.vehiclePlate}</span>
                    </p>
                 </div>
                 <button onClick={() => setSelectedGallery(null)} className="p-5 bg-gray-50 rounded-full hover:bg-orange-50 transition-all text-gray-400 hover:text-orange-600">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.photoInitial} label="Painel Saída" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-[#001A33] uppercase opacity-40">1. Partida</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.origin}</p>
                       <p className="text-xs font-mono font-black text-indigo-600 mt-1">{formatTimeDisplay(selectedGallery.startTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.factoryArrivalPhoto} label="Entrada Fábrica" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-orange-400 uppercase opacity-60">2. Chegada Fábrica</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.factoryName}</p>
                       <p className="text-xs font-mono font-black text-orange-500 mt-1">{formatTimeDisplay(selectedGallery.factoryArrivalTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100">
                       <i className="fas fa-clock text-4xl mb-3 opacity-20"></i>
                       <span className="text-3xl font-black text-gray-800 tracking-tighter">{formatTimeDisplay(selectedGallery.factoryDepartureTime)}</span>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-orange-400 uppercase opacity-60">3. Saída Fábrica</p>
                       <p className="text-sm font-black text-gray-400 italic">Ponto de Transição</p>
                       <p className="text-xs font-mono font-black text-orange-500 mt-1">{formatTimeDisplay(selectedGallery.factoryDepartureTime)}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <PhotoItem src={selectedGallery.photoFinal} label="Painel Chegada" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-emerald-500 uppercase opacity-60">4. Chegada Final</p>
                       <p className="text-sm font-black text-gray-800">{selectedGallery.destination}</p>
                       <p className="text-xs font-mono font-black text-emerald-600 mt-1">{formatTimeDisplay(selectedGallery.endTime)}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 bg-[#001A33] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border-b-8 border-orange-500">
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-white/10">
                       <i className="fas fa-route text-orange-500"></i>
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase opacity-40 block tracking-[0.3em] mb-2">Total Registrado</span>
                       <span className="text-5xl font-black tracking-tighter italic">{(Number(selectedGallery.kmFinal) || 0) - (Number(selectedGallery.kmInitial) || 0)} <span className="text-xl uppercase not-italic opacity-30">KM</span></span>
                    </div>
                 </div>
                 <div className="text-right relative z-10">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Documentação DT</p>
                    <p className="text-3xl font-black text-orange-500 tracking-tighter italic">#{selectedGallery.numero_dt || 'N/A'}</p>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              </div>

              {selectedGallery.adminComment && (
                <div className="mt-8 p-8 bg-orange-50 rounded-[2rem] border-2 border-orange-100">
                   <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center">
                      <i className="fas fa-comment-alt mr-2"></i> Observações da Auditoria
                   </p>
                   <p className="text-gray-800 font-bold leading-relaxed italic text-lg">"{selectedGallery.adminComment}"</p>
                </div>
              )}
           </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#001A33] tracking-tighter uppercase italic leading-none">Controle de <span className="text-orange-500">Frota</span></h2>
          <p className="text-gray-400 font-bold mt-4 flex items-center uppercase text-[10px] tracking-widest">
             <span className="w-3 h-3 rounded-full bg-orange-500 mr-3 animate-pulse"></span>
             Histórico de Atividades Consolidadas
          </p>
        </div>
        <div className="bg-white border-2 border-orange-50 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-8 border-b-4 border-orange-500">
           <div className="w-16 h-16 bg-[#001A33] text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg shadow-orange-500/10">
              <i className="fas fa-check-double text-orange-500"></i>
           </div>
           <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Quilometragem Auditada</span>
              <span className="text-5xl font-black text-[#001A33] tracking-tighter leading-none italic">{totalKm} <span className="text-lg uppercase opacity-20 not-italic">KM</span></span>
           </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Data Inicial</label>
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="w-full p-5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold focus:border-orange-500 transition-all" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Data Final</label>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="w-full p-5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold focus:border-orange-500 transition-all" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Placa Veículo</label>
          <select value={plateFilter} onChange={e => setPlateFilter(e.target.value)} className="w-full p-5 border-2 border-gray-50 rounded-2xl text-sm bg-gray-50 outline-none font-bold focus:border-orange-500 transition-all uppercase">
            <option value="">FILTRAR TODOS</option>
            {uniquePlates.map(plate => <option key={plate} value={plate}>{plate}</option>)}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button onClick={() => { setDateFilter({ start: '', end: '' }); setPlateFilter(''); }} className="h-[64px] px-6 text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-[0.2em] transition-all hover:bg-orange-50 rounded-2xl border-2 border-gray-100">Reset</button>
            <button onClick={exportToExcel} className="h-[64px] px-6 bg-[#001A33] text-white rounded-2xl flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg border-b-4 border-emerald-500">
               <i className="fas fa-file-excel text-emerald-500"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">Excel</span>
            </button>
            <button onClick={exportToPDF} className="h-[64px] px-6 bg-[#001A33] text-white rounded-2xl flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg border-b-4 border-orange-500">
               <i className="fas fa-file-pdf text-orange-500"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#001A33] border-b border-orange-500">
              <tr>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Registro</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Operador</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Doc. DT</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] text-center">Timeline</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Auditoria</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] text-center">Mídia</th>
                <th className="px-10 py-10 font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] text-center">KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {approvedTrips.length === 0 ? (
                <tr><td colSpan={7} className="px-10 py-32 text-center text-gray-300 italic font-black text-2xl uppercase tracking-[0.5em] opacity-20">Nenhum Registro Filler</td></tr>
              ) : (
                approvedTrips.map(trip => {
                   const diff = (Number(trip.kmFinal) || 0) - (Number(trip.kmInitial) || 0);
                   return (
                  <tr key={trip.id} className="hover:bg-orange-50/10 transition-all group border-l-4 border-transparent hover:border-orange-500">
                    <td className="px-10 py-8">
                      <div className="font-black text-[#001A33] text-xl tracking-tighter italic">{formatDateDisplay(trip.startDate)}</div>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Lote #{trip.id}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 text-base uppercase italic">{trip.driverName}</div>
                      <div className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg inline-block mt-3 uppercase tracking-widest border border-orange-100">{trip.vehiclePlate}</div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="font-black text-lg text-[#001A33] italic">#{trip.numero_dt || '---'}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="inline-grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10px] font-black font-mono bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <span className="text-right text-gray-400 uppercase tracking-tighter">PARTIDA:</span>
                          <span className="text-left text-indigo-600 italic">{formatTimeDisplay(trip.startTime)}</span>
                          <span className="text-right text-gray-400 uppercase tracking-tighter">ENTRADA:</span>
                          <span className="text-left text-orange-500 italic">{formatTimeDisplay(trip.factoryArrivalTime)}</span>
                          <span className="text-right text-gray-400 uppercase tracking-tighter">SAÍDA:</span>
                          <span className="text-left text-orange-600 italic">{formatTimeDisplay(trip.factoryDepartureTime)}</span>
                          <span className="text-right text-gray-400 uppercase tracking-tighter">CHEGADA:</span>
                          <span className="text-left text-emerald-600 italic">{formatTimeDisplay(trip.endTime)}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 max-w-[200px]">
                       {trip.adminComment ? (
                         <div className="bg-gray-50 p-3 rounded-xl text-[11px] font-bold text-gray-600 italic line-clamp-2 border border-gray-100 relative group/msg">
                           "{trip.adminComment}"
                           <div className="absolute hidden group-hover/msg:block bottom-full left-0 mb-2 bg-[#001A33] text-white p-4 rounded-2xl w-64 z-50 text-xs shadow-2xl border border-orange-500">
                             {trip.adminComment}
                           </div>
                         </div>
                       ) : (
                         <span className="text-[10px] font-black text-gray-300 uppercase italic">Sem observações</span>
                       )}
                    </td>
                    <td className="px-10 py-8 text-center">
                      <button onClick={() => setSelectedGallery(trip)} className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-orange-500 text-orange-500 hover:text-white rounded-2xl transition-all border border-orange-500/20 hover:border-orange-500 font-black uppercase text-[10px] tracking-widest shadow-sm">
                        <i className="fas fa-images text-base"></i>
                        <span>Audit Log</span>
                      </button>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="bg-[#001A33] text-orange-500 font-black px-8 py-4 rounded-[1.5rem] text-lg italic shadow-lg shadow-black/10 tracking-tighter">
                        {isNaN(diff) || diff < 0 ? 0 : diff} <span className="text-[10px] not-italic opacity-40">KM</span>
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
