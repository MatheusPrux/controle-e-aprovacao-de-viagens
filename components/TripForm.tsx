
import React, { useState } from 'react';
import { User, Trip } from '../types';

interface TripFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (trip: Trip) => void;
}

const TripForm: React.FC<TripFormProps> = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    origin: '',
    destination: '',
    kmInitial: '',
    kmFinal: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const initial = Number(formData.kmInitial);
    const final = Number(formData.kmFinal);

    if (final <= initial) {
      setError('O KM Final deve ser maior que o KM Inicial.');
      return;
    }

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      driverId: user.id,
      driverName: user.name,
      date: formData.date,
      origin: formData.origin,
      destination: formData.destination,
      kmInitial: initial,
      kmFinal: final,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newTrip);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Nova Viagem</h2>
            <p className="text-indigo-100 text-sm opacity-80">Preencha os dados abaixo</p>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-500 p-2 rounded-full transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>
            <div className="hidden sm:block"></div>

            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Origem</label>
              <input
                type="text"
                required
                placeholder="Ex: Porto Alegre"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Destino</label>
              <input
                type="text"
                required
                placeholder="Ex: Caxias do Sul"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">KM Inicial</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.kmInitial}
                onChange={(e) => setFormData({ ...formData, kmInitial: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">KM Final</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.kmFinal}
                onChange={(e) => setFormData({ ...formData, kmFinal: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              ENVIAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
