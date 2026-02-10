
import React, { useState, useEffect } from 'react';
import { User, Trip } from '../types';

interface TripFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (trip: Trip) => void;
  existingTrip?: Trip | null;
}

const VEHICLES = ['JDJ-3G68', 'IRY-5E14', 'DBB-9B61'];

const TripForm: React.FC<TripFormProps> = ({ user, onClose, onSubmit, existingTrip }) => {
  const [step, setStep] = useState(existingTrip ? 2 : 1);
  const [formData, setFormData] = useState({
    date: existingTrip?.date || new Date().toISOString().split('T')[0],
    vehiclePlate: existingTrip?.vehiclePlate || VEHICLES[0],
    kmInitial: existingTrip?.kmInitial?.toString() || '',
    photoInitial: existingTrip?.photoInitial || '',
    origin: existingTrip?.origin || '',
    startTime: existingTrip?.startTime || '',
    
    kmFinal: '',
    photoFinal: '',
    destination: '',
    endTime: '',
    endDate: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 1 && !formData.startTime) {
      setFormData(prev => ({ ...prev, startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }));
    }
    if (step === 2 && !formData.endTime) {
      setFormData(prev => ({ ...prev, endTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }));
    }
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoInitial' | 'photoFinal') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleStartTrip = () => {
    if (!formData.origin || !formData.kmInitial || !formData.photoInitial) {
      setError('Preencha todos os campos obrigatórios para iniciar a viagem.');
      return;
    }

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      driverId: user.id,
      driverName: user.name,
      vehiclePlate: formData.vehiclePlate,
      date: formData.date,
      kmInitial: Number(formData.kmInitial),
      photoInitial: formData.photoInitial,
      startTime: formData.startTime,
      origin: formData.origin,
      status: 'Em Andamento',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newTrip);
  };

  const handleFinishTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.destination || !formData.kmFinal || !formData.photoFinal) {
      setError('Preencha todos os campos para finalizar a viagem.');
      return;
    }

    const initial = Number(formData.kmInitial);
    const final = Number(formData.kmFinal);

    if (final <= initial) {
      setError('O KM Final deve ser maior que o KM Inicial.');
      return;
    }

    if (!existingTrip) return;

    const completedTrip: Trip = {
      ...existingTrip,
      kmFinal: final,
      photoFinal: formData.photoFinal,
      destination: formData.destination,
      endTime: formData.endTime,
      endDate: formData.endDate || undefined,
      status: 'Pendente', // Agora vai para o administrador
    };

    onSubmit(completedTrip);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{existingTrip ? 'Finalizar Viagem' : 'Iniciar Nova Viagem'}</h2>
            <p className="text-indigo-100 text-xs uppercase tracking-wider">{existingTrip ? 'Parte 2 de 2' : 'Parte 1 de 2'}</p>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-500 p-2 rounded-full transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data Início</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hora Automática</label>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold text-sm">{formData.startTime}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carreta</label>
                <select value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50">
                  {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Origem</label>
                <input type="text" placeholder="Cidade de Origem" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KM Inicial</label>
                <input type="number" placeholder="KM Odômetro" value={formData.kmInitial} onChange={e => setFormData({...formData, kmInitial: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto Odômetro (Início)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-indigo-200 rounded-xl p-4 text-center hover:border-indigo-400">
                    <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'photoInitial')} />
                    <i className="fas fa-camera text-indigo-400 mb-1"></i>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">Capturar</p>
                  </label>
                  {formData.photoInitial && <img src={formData.photoInitial} className="w-16 h-16 rounded-xl object-cover border" alt="preview" />}
                </div>
              </div>

              <button onClick={handleStartTrip} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                INICIAR VIAGEM
              </button>
            </div>
          ) : (
            <form onSubmit={handleFinishTrip} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Viagem Iniciada em:</p>
                <p className="text-xs font-bold">{formData.origin} | KM {formData.kmInitial}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data Final (Se Diferente)</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hora Automática</label>
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 font-bold text-sm">{formData.endTime}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destino</label>
                <input type="text" placeholder="Cidade de Destino" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KM Final</label>
                <input type="number" placeholder="KM Odômetro Final" value={formData.kmFinal} onChange={e => setFormData({...formData, kmFinal: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto Odômetro (Final)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-purple-200 rounded-xl p-4 text-center hover:border-purple-400">
                    <input type="file" accept="image/*" capture="camera" className="hidden" onChange={e => handleFileChange(e, 'photoFinal')} />
                    <i className="fas fa-camera text-purple-400 mb-1"></i>
                    <p className="text-[10px] font-bold text-purple-500 uppercase">Capturar</p>
                  </label>
                  {formData.photoFinal && <img src={formData.photoFinal} className="w-16 h-16 rounded-xl object-cover border" alt="preview" />}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95">
                FINALIZAR E ENVIAR PARA APROVAÇÃO
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripForm;
