
import React, { useState, useEffect } from 'react';
import { User, Trip, TripStatus } from '../types';

interface TripFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (trip: Trip) => void;
  existingTrip?: Trip | null;
}

const VEHICLES = ['JDJ-3G68', 'IRY-5E14', 'DBB-9B61'];

const TripForm: React.FC<TripFormProps> = ({ user, onClose, onSubmit, existingTrip }) => {
  // Define o passo atual com base no status da viagem existente
  const getInitialStep = () => {
    if (!existingTrip) return 'start';
    if (existingTrip.status === 'Em Andamento') return 'arrival';
    if (existingTrip.status === 'Na Fábrica') return 'departure';
    if (existingTrip.status === 'Em Trânsito') return 'finish';
    return 'start';
  };

  const [mode, setMode] = useState(getInitialStep());
  const [formData, setFormData] = useState({
    date: existingTrip?.date || new Date().toISOString().split('T')[0],
    vehiclePlate: existingTrip?.vehiclePlate || VEHICLES[0],
    kmInitial: existingTrip?.kmInitial?.toString() || '',
    photoInitial: existingTrip?.photoInitial || '',
    origin: existingTrip?.origin || '',
    startTime: existingTrip?.startTime || '',
    
    factoryArrivalTime: '',
    factoryArrivalPhoto: '',
    factoryDepartureTime: '',
    factoryDeparturePhoto: '',

    kmFinal: '',
    photoFinal: '',
    destination: '',
    endTime: '',
    endDate: existingTrip?.endDate || new Date().toISOString().split('T')[0]
  });

  const [currentAutoTime, setCurrentAutoTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAutoTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'start') {
      if (!formData.origin || !formData.kmInitial || !formData.photoInitial) {
        setError('Preencha os campos de início.');
        return;
      }
      onSubmit({
        id: crypto.randomUUID(),
        driverId: user.id,
        driverName: user.name,
        vehiclePlate: formData.vehiclePlate,
        date: formData.date,
        kmInitial: Number(formData.kmInitial),
        photoInitial: formData.photoInitial,
        startTime: currentAutoTime,
        origin: formData.origin,
        status: 'Em Andamento',
        createdAt: new Date().toISOString(),
      });
    } else if (mode === 'arrival') {
      if (!formData.factoryArrivalPhoto) {
        setError('A foto da chegada é obrigatória.');
        return;
      }
      onSubmit({
        ...existingTrip!,
        factoryArrivalTime: currentAutoTime,
        factoryArrivalPhoto: formData.factoryArrivalPhoto,
        status: 'Na Fábrica'
      });
    } else if (mode === 'departure') {
      if (!formData.factoryDeparturePhoto) {
        setError('A foto da saída é obrigatória.');
        return;
      }
      onSubmit({
        ...existingTrip!,
        factoryDepartureTime: currentAutoTime,
        factoryDeparturePhoto: formData.factoryDeparturePhoto,
        status: 'Em Trânsito'
      });
    } else if (mode === 'finish') {
      if (!formData.destination || !formData.kmFinal || !formData.photoFinal) {
        setError('Preencha os campos de finalização.');
        return;
      }
      const initial = Number(existingTrip?.kmInitial);
      const final = Number(formData.kmFinal);
      if (final <= initial) {
        setError('O KM Final deve ser maior que o Inicial.');
        return;
      }
      onSubmit({
        ...existingTrip!,
        kmFinal: final,
        photoFinal: formData.photoFinal,
        destination: formData.destination,
        endTime: currentAutoTime,
        endDate: formData.endDate,
        status: 'Pendente'
      });
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'start': return 'Iniciar Viagem';
      case 'arrival': return 'Chegada na Fábrica';
      case 'departure': return 'Saída da Fábrica';
      case 'finish': return 'Finalizar Viagem';
      default: return 'Viagem';
    }
  };

  const getColor = () => {
    switch(mode) {
      case 'start': return 'bg-indigo-600';
      case 'arrival': return 'bg-amber-500';
      case 'departure': return 'bg-orange-600';
      case 'finish': return 'bg-green-600';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className={`${getColor()} p-6 text-white flex justify-between items-center transition-colors duration-500`}>
          <div>
            <h2 className="text-xl font-bold">{getTitle()}</h2>
            <p className="text-white/80 text-[10px] uppercase tracking-widest">Ação em tempo real</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleAction} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i> {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center">
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Hora Atual</p>
                <p className="text-2xl font-black text-gray-800">{currentAutoTime}</p>
             </div>
             <i className="fas fa-clock text-gray-200 text-3xl"></i>
          </div>

          {mode === 'start' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Veículo</label>
                  <select value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none">
                    {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Origem</label>
                <input type="text" placeholder="Ex: Garagem Matriz" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KM Inicial</label>
                <input type="number" placeholder="KM Painel" value={formData.kmInitial} onChange={e => setFormData({...formData, kmInitial: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto Odômetro Inicial</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-indigo-200 rounded-xl p-4 hover:border-indigo-400 transition-colors">
                  <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'photoInitial')} />
                  {formData.photoInitial ? <img src={formData.photoInitial} className="h-12 w-12 object-cover rounded-lg mr-3" /> : <i className="fas fa-camera text-indigo-400 text-xl mr-3"></i>}
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">{formData.photoInitial ? 'Trocar Foto' : 'Capturar Foto'}</p>
                </label>
              </div>
            </div>
          )}

          {mode === 'arrival' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-800 font-medium">Você está marcando sua chegada na fábrica para carregamento/descarregamento.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto da Chegada na Fábrica</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-amber-200 rounded-xl p-6 hover:border-amber-400 transition-colors">
                  <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'factoryArrivalPhoto')} />
                  {formData.factoryArrivalPhoto ? <img src={formData.factoryArrivalPhoto} className="h-16 w-16 object-cover rounded-lg mr-4" /> : <i className="fas fa-industry text-amber-400 text-2xl mr-4"></i>}
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Tirar Foto do Local</p>
                </label>
              </div>
            </div>
          )}

          {mode === 'departure' && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-xs text-orange-800 font-medium">Você está saindo da fábrica e iniciando o trajeto para o destino final.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto da Saída da Fábrica</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-colors">
                  <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'factoryDeparturePhoto')} />
                  {formData.factoryDeparturePhoto ? <img src={formData.factoryDeparturePhoto} className="h-16 w-16 object-cover rounded-lg mr-4" /> : <i className="fas fa-truck-loading text-orange-400 text-2xl mr-4"></i>}
                  <p className="text-[10px] font-bold text-orange-600 uppercase">Tirar Foto da Carga/Nota</p>
                </label>
              </div>
            </div>
          )}

          {mode === 'finish' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data Fim</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destino</label>
                  <input type="text" placeholder="Local de entrega" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KM Final</label>
                <input type="number" placeholder="KM Painel" value={formData.kmFinal} onChange={e => setFormData({...formData, kmFinal: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto Odômetro Final</label>
                <label className="flex items-center justify-center cursor-pointer bg-white border-2 border-dashed border-green-200 rounded-xl p-4 hover:border-green-400 transition-colors">
                  <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'photoFinal')} />
                  {formData.photoFinal ? <img src={formData.photoFinal} className="h-12 w-12 object-cover rounded-lg mr-3" /> : <i className="fas fa-camera text-green-400 text-xl mr-3"></i>}
                  <p className="text-[10px] font-bold text-green-500 uppercase">Capturar Foto Final</p>
                </label>
              </div>
            </div>
          )}

          <button type="submit" className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${getColor()} hover:opacity-90`}>
            {mode === 'start' ? 'CONFIRMAR INÍCIO' : 
             mode === 'arrival' ? 'CONFIRMAR CHEGADA' :
             mode === 'departure' ? 'CONFIRMAR SAÍDA' : 'FINALIZAR VIAGEM'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
