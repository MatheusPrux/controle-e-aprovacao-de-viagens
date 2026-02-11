
import React, { useMemo, useState } from 'react';
import { Trip, TripStatus, UserRole } from '../types';

interface DashboardAdminProps {
  trips: Trip[];
  userRole: UserRole;
  onUpdateStatus: (tripId: string, status: TripStatus, comment: string, extras?: { numero_dt: string, valor_comissao: number }) => void;
}

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ trips, userRole, onUpdateStatus }) => {
  const [activeComment, setActiveComment] = useState<{ [key: string]: string }>({});
  const [activeFinance, setActiveFinance] = useState<{ [key: string]: { dt: string, val: string } }>({});
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'pending' | 'approved'>('pending');
  
  const filteredTrips = useMemo(() => {
    if (filterMode === 'pending') return trips.filter(t => t && t.status === 'Pendente');
    return trips.filter(t => t && t.status === 'Aprovado');
  }, [trips, filterMode]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const handleAction = (tripId: string, status: TripStatus) => {
    const finance = activeFinance[tripId] || { dt: '', val: '' };
    const comment = activeComment[tripId] || '';

    if (status === 'Aprovado') {
      if (!finance.dt || !finance.val) {
        alert("Erro: Preencha o Nº da DT e o Valor da Comissão para aprovar.");
        return;
      }
    }

    // Limpeza rigorosa: Coluna Q (DT) como string numérica limpa, Coluna R (Comissão) como Number
    const cleanDt = finance.dt.replace(/\D/g, ''); // Apenas números para a DT
    const cleanVal = Number(finance.val.replace(',', '.')); // Conversão segura para número

    onUpdateStatus(tripId, status, comment, {
      numero_dt: cleanDt,
      valor_comissao: isNaN(cleanVal) ? 0 : cleanVal
    });
  };

  const isFormValid = (tripId: string) => {
    const finance = activeFinance[tripId];
    if (!finance) return false;
    
    const valAsNumber = Number(finance.val.replace(',', '.'));
    return finance.dt.trim() !== '' && !isNaN(valAsNumber) && valAsNumber >= 0;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white/10" alt="Evidência" />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Auditoria de Viagens</h2>
          <p className="text-gray-500 font-bold mt-2">Nível: <span className="text-indigo-600 uppercase">{userRole}</span> • Validação Logística</p>
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setFilterMode('pending')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            Aguardando ({trips.filter(t => t.status === 'Pendente').length})
          </button>
          {userRole === 'super_admin' && (
            <button 
              onClick={() => setFilterMode('approved')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              Histórico / Edição
            </button>
          )}
        </div>
      </div>

      <section className="space-y-10">
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-gray-100 text-center text-gray-300">
             <i className="fas fa-clipboard-check text-4xl mb-4"></i>
             <p className="font-black uppercase tracking-widest text-[10px]">Tudo validado por aqui!</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const kmDiff = Number(trip.kmFinal || 0) - Number(trip.kmInitial || 0);
            return (
              <div key={trip.id} className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                <div className="bg-gray-50/50 p-8 border-b flex justify-between items-center flex-wrap gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                      {trip.driverName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-black text-gray-950 text-xl tracking-tight leading-none">{trip.driverName}</p>
                        <span className="text-[10px] font-black text-indigo-500 uppercase mt-2 block">{trip.vehiclePlate} • {formatDate(trip.startDate)}</span>
                    </div>
                  </div>
                  <div className="bg-white px-5 py-2 rounded-xl border border-gray-100 shadow-sm text-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">ID Viagem</span>
                    <span className="text-sm font-black text-gray-800">#{trip.id}</span>
                  </div>
                </div>

                <div className="p-10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div onClick={() => setSelectedPhoto(trip.photoInitial || null)} className="relative group cursor-pointer aspect-square rounded-[2rem] overflow-hidden bg-gray-100 shadow-md">
                      {trip.photoInitial ? <img src={trip.photoInitial} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="flex h-full items-center justify-center text-gray-300">SEM FOTO</div>}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-xl text-[10px] text-white font-bold">SAÍDA: {trip.startTime}</div>
                    </div>
                    <div onClick={() => setSelectedPhoto(trip.factoryArrivalPhoto || '')} className="relative group cursor-pointer aspect-square rounded-[2rem] overflow-hidden bg-gray-100 shadow-md">
                      {trip.factoryArrivalPhoto ? <img src={trip.factoryArrivalPhoto} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300 text-[10px] font-bold">SEM FOTO FÁBRICA</div>}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-xl text-[10px] text-white font-bold">CHEGADA: {trip.factoryArrivalTime}</div>
                    </div>
                    <div className="aspect-square rounded-[2rem] bg-orange-50 border-2 border-orange-100 flex flex-col items-center justify-center text-orange-600">
                      <span className="text-2xl font-black tracking-tighter">{trip.factoryDepartureTime || '--:--'}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">SAÍDA FÁBRICA</span>
                    </div>
                    <div onClick={() => setSelectedPhoto(trip.photoFinal || '')} className="relative group cursor-pointer aspect-square rounded-[2rem] overflow-hidden bg-gray-100 shadow-md">
                      {trip.photoFinal ? <img src={trip.photoFinal} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300 text-[10px] font-bold">SEM FOTO FINAL</div>}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-xl text-[10px] text-white font-bold">FIM: {trip.endTime}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nº da DT *</label>
                              <input 
                                type="text" 
                                value={activeFinance[trip.id]?.dt || trip.numero_dt || ''} 
                                onChange={(e) => setActiveFinance({...activeFinance, [trip.id]: {...(activeFinance[trip.id] || {dt:'', val:''}), dt: e.target.value}})}
                                placeholder="Apenas números"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-400" 
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Valor Comissão (R$) *</label>
                              <input 
                                type="text" 
                                value={activeFinance[trip.id]?.val || (trip.valor_comissao !== undefined ? trip.valor_comissao.toString() : '')} 
                                onChange={(e) => setActiveFinance({...activeFinance, [trip.id]: {...(activeFinance[trip.id] || {dt:'', val:''}), val: e.target.value}})}
                                placeholder="0,00"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-400" 
                              />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Comentário Administrativo</label>
                          <textarea
                            value={activeComment[trip.id] || trip.adminComment || ''}
                            onChange={(e) => setActiveComment({...activeComment, [trip.id]: e.target.value})}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm h-24 resize-none outline-none focus:bg-white transition-all"
                            placeholder="Notas da auditoria..."
                          ></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col h-full justify-between">
                        <div className="bg-indigo-900 rounded-[2rem] p-6 text-white mb-6 shadow-inner">
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Resumo KM</span>
                              <span className="text-indigo-400 font-black">{isNaN(kmDiff) ? 0 : kmDiff} KM PERCORRIDO</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                              <div><p className="text-[9px] opacity-40 uppercase">Início (Painel)</p><p className="font-bold">{Number(trip.kmInitial) || 0}</p></div>
                              <div><p className="text-[9px] opacity-40 uppercase">Fim (Painel)</p><p className="font-bold">{Number(trip.kmFinal) || '--'}</p></div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button onClick={() => handleAction(trip.id, 'Rejeitado')} className="flex-1 py-5 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all">Rejeitar</button>
                          <button 
                            disabled={!isFormValid(trip.id) && trip.status === 'Pendente'}
                            onClick={() => handleAction(trip.id, 'Aprovado')} 
                            className={`flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all ${isFormValid(trip.id) || trip.status === 'Aprovado' ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          >
                            {trip.status === 'Aprovado' ? 'Salvar Edição' : 'Aprovar e Validar'}
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default DashboardAdmin;
