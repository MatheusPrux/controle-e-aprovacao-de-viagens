
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister?: (user: User) => void;
  existingUsers: User[];
  isRemote?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, existingUsers, isRemote }) => {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRemote) {
        // Envia para o handleLogin do App.tsx que fará o fetch via GET
        await onLogin({ id: formData.id, password: formData.password } as User);
      } else {
        const user = existingUsers.find(u => u.id === formData.id && u.password === formData.password);
        if (user) onLogin(user);
        else setError('ID ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-900 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md transform transition-all border border-indigo-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <i className="fas fa-truck-moving text-indigo-600 text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Entrar no Sistema</h2>
          <p className="text-gray-400 mt-2 text-xs font-bold uppercase tracking-widest">Controle de Frota Logística</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase flex items-center space-x-3 border border-red-100 shadow-sm">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">ID do Usuário</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="block w-full px-5 py-4 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all font-bold text-gray-800"
                placeholder="Ex: Admin ou Motorista01"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-5 py-4 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all font-bold text-gray-800"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Autenticando...
              </span>
            ) : 'Acessar Painel'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
            As informações de acesso são <br/> sincronizadas com a planilha mestre.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
