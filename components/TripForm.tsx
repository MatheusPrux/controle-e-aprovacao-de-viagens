
import React, { useState, useEffect } from 'react';
import { User, Trip, TripStatus } from '../types';

interface TripFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (trip: Trip) => void;
  existingTrip?: Trip | null;
}

const VEHICLES = ['JDJ-3G68', 'IRY-5E14', 'DBB-9B61'];
const FACTORIES = [
  'FB IGREJINHA', 
  'FB PONTA GROSSA', 
  'FB ITU', 
  'FB JACAREI', 
  'FB ARARAQUARA'
];

const TripForm: React.FC<TripFormProps> = ({ user, onClose, onSubmit, existingTrip }) => {
  const getInitialStep = () => {
    if (!existingTrip) return 'start';
    if (existingTrip.status === 'Em Andamento') return 'arrival';
    if (existingTrip.status === 'Na Fábrica') return 'departure';
    if (existingTrip.status === 'Em Trânsito') return 'finish';
    return 'start';
  };

  const [mode, setMode] = useState(getInitialStep());
  const [formData, setFormData] = useState({
    startDate: existingTrip?.startDate || new Date().toISOString().split('T')[0],
    vehiclePlate: existingTrip?.vehiclePlate || VEHICLES[0],
    kmInitial: existingTrip?.kmInitial?.toString() || '',
    photoInitial: existingTrip?.photoInitial || '',
    origin: existingTrip?.origin || '',
    startTime: existingTrip?.startTime || '',
    
    factoryName: existingTrip?.factoryName || FACTORIES[0],
    factoryArrivalTime: '',
    factoryArrivalPhoto: '',
    factoryDepartureTime: '',

    kmFinal: '',
    photoFinal: '',
    destination: '',
    endTime: '',
    endDate: existingTrip?.endDate || new Date().toISOString().split('T')[0]
  });

  const [currentAutoTime, setCurrentAutoTime] = useState('');
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentAutoTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressing(true);
      setError('');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          // Garante que o Base64 seja limpo e tenha o prefixo correto
          setFormData(prev => ({ ...prev, [field]: result }));
        }
        setCompressing(false);
      };

      reader.onerror = () => {
        setError('Falha ao ler arquivo. Tente novamente.');
        setCompressing(false);
      };

      // Limita o processamento a arquivos de imagem
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        setError('Por favor, selecione apenas arquivos de imagem.');
        setCompressing(false);
      }
    }
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (compressing) return;
    setError('');

    if (mode === 'start') {
      if (!formData.origin || !formData.kmInitial || !formData.photoInitial) {
        setError('Campos Origem, KM e Foto Inicial são obrigatórios.');
        return;
      }
      onSubmit({
        id: 'TEMP',
        driverId: user.id,
        driverName: user.name,
        vehiclePlate: formData.vehiclePlate,
        startDate: formData.startDate,
        kmInitial: Number(formData.kmInitial),
        photoInitial: formData.photoInitial,
        startTime: currentAutoTime,
        origin: formData.origin,
        status: 'Em Andamento',
        createdAt: new Date().toISOString(),
      });
    } else {
      if (!existingTrip) return;

      if (mode === 'arrival') {
        if (!formData.factoryArrivalPhoto) {
          setError('Foto de entrada na fábrica é obrigatória.');
          return;
        }
        onSubmit({
          ...existingTrip,
          factoryName: formData.factoryName,
          factoryArrivalTime: currentAutoTime,
          factoryArrivalPhoto: formData.factoryArrivalPhoto,
          status: 'Na Fábrica'
        });
      } else if (mode === 'departure') {
        onSubmit({
          ...existingTrip,
          factoryDepartureTime: currentAutoTime,
          status: 'Em Trânsito'
        });
      } else if (mode === 'finish') {
        if (!formData.destination || !formData.kmFinal || !formData.photoFinal) {
          setError('Destino, KM Final e Foto do Painel são obrigatórios.');
          return;
        }
        const initial = Number(existingTrip.kmInitial);
        const final = Number(formData.kmFinal);
        if (final <= initial) {
          setError('O KM Final deve ser maior que o Inicial.');
          return;
        }
        onSubmit({
          ...existingTrip,
          kmFinal: final,
          photoFinal: formData.photoFinal,
          destination: formData.destination,
          endTime: currentAutoTime,
          endDate: new Date().toISOString().split('T')[0],
          status: 'Pendente'
        });
      }
    }
  };

  const getHeaderColor = () => {
    switch(mode) {
      case 'start': return 'bg-indigo-600';
      case 'arrival': return 'bg-amber-500';
      case 'departure': return 'bg-orange-600';
      case 'finish': return 'bg-emerald-600';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden my-8 transform transition-all">
        <div className={`${getHeaderColor()} p-6 text-white flex justify-between items-center transition-colors duration-500`}>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {mode === 'start' ? 'Iniciar Viagem' : 
               mode === 'arrival' ? 'Entrada na Fábrica' : 
               mode === 'departure' ? 'Saída da Fábrica' : 'Fim de Trajeto'}
            </h2>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Status: {mode}</p>
          </div>
          <button onClick={onClose} type="button" className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleAction} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center animate-pulse">
              <i className="fas fa-exclamation-triangle mr-3"></i> {error}
            </div>
          )}

          <div className="bg-gray-50 p-5 rounded-3xl border-2 border-dashed border-gray-100 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Horário Registrado</p>
                <p className="text-3xl font-black text-gray-800">{currentAutoTime}</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <i className="fas fa-camera text-indigo-400 text-xl"></i>
             </div>
          </div>

          {mode === 'start' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Veículo</label>
                  <select value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none font-bold">
                    {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Origem</label>
                <input type="text" placeholder="Cidade / Filial de saída" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">KM Painel Inicial</label>
                <input type="number" placeholder="KM de saída" value={formData.kmInitial} onChange={e => setFormData({...formData, kmInitial: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto do Painel (Saída)</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-indigo-100 rounded-2xl p-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, 'photoInitial')} />
                  {formData.photoInitial ? (
                    <div className="flex items-center">
                      <img src={formData.photoInitial} className="h-20 w-20 object-cover rounded-xl shadow-lg mr-4 border-2 border-white" />
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Foto Registrada. Toque p/ trocar.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-camera text-indigo-300 text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <p className="text-[10px] font-black text-indigo-400 uppercase">Capturar Painel</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {mode === 'arrival' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Unidade Fabril</label>
                <select 
                  value={formData.factoryName} 
                  onChange={e => setFormData({...formData, factoryName: e.target.value})} 
                  className="w-full p-5 border-2 border-amber-100 rounded-2xl text-sm bg-white font-black text-gray-800"
                >
                  {FACTORIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Foto de Entrada (Portaria)</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-amber-200 rounded-2xl p-8 hover:bg-amber-50">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, 'factoryArrivalPhoto')} />
                  {formData.factoryArrivalPhoto ? (
                    <div className="flex items-center">
                      <img src={formData.factoryArrivalPhoto} className="h-24 w-24 object-cover rounded-xl shadow-xl mr-5 border-2 border-white" />
                      <p className="text-[10px] font-black text-amber-600 uppercase">OK. Toque p/ refazer.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-industry text-amber-400 text-4xl mb-3"></i>
                      <p className="text-[10px] font-black text-amber-600 uppercase">Foto do Portão</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {mode === 'departure' && (
            <div className="bg-orange-600 p-8 rounded-[2rem] text-white text-center shadow-lg relative overflow-hidden">
               <span className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest relative z-10">Saindo de</span>
               <span className="font-black text-3xl uppercase block relative z-10">{existingTrip?.factoryName}</span>
               <p className="text-[10px] font-bold mt-4 opacity-80 uppercase italic relative z-10">Confirme a saída da fábrica agora.</p>
               <i className="fas fa-truck-departure absolute text-9xl -bottom-6 -right-6 opacity-10"></i>
            </div>
          )}

          {mode === 'finish' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Destino Final</label>
                <input type="text" placeholder="Local de descarga / Pátio" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">KM Painel Final</label>
                <input type="number" placeholder="KM de chegada" value={formData.kmFinal} onChange={e => setFormData({...formData, kmFinal: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Foto do Painel (Chegada)</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-emerald-200 rounded-2xl p-8 hover:bg-emerald-50">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, 'photoFinal')} />
                  {formData.photoFinal ? (
                    <div className="flex items-center">
                      <img src={formData.photoFinal} className="h-24 w-24 object-cover rounded-xl border-2 border-white mr-5" />
                      <p className="text-[10px] font-black text-emerald-600 uppercase">OK. Toque p/ refazer.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-flag-checkered text-emerald-400 text-4xl mb-3"></i>
                      <p className="text-[10px] font-black text-emerald-600 uppercase">Finalizar Percurso</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={compressing}
            className={`w-full py-5 text-white rounded-[1.5rem] font-black shadow-xl transition-all active:scale-95 ${getHeaderColor()} hover:brightness-110 uppercase tracking-[0.2em] text-xs flex items-center justify-center ${compressing ? 'opacity-50 cursor-wait' : ''}`}
          >
            {compressing ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {compressing ? 'Processando Imagem...' : 'Confirmar e Enviar Dados'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
