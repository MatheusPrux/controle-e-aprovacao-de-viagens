
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister?: (user: User) => void;
  existingUsers: User[];
  isRemote?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, existingUsers, isRemote }) => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRemote) {
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
    <div className="min-h-screen flex items-center justify-center bg-[#001A33] p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>

      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md transform transition-all border border-white/20 relative z-10">
        <div className="text-center mb-10">
          <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
            <i className="fas fa-truck-moving text-[#F15A24] text-5xl"></i>
          </div>
          <h2 className="text-3xl font-black text-[#001A33] tracking-tighter uppercase italic">Grupo Filler</h2>
          <p className="text-gray-400 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Logística & Distribuição</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase flex items-center space-x-3 border border-red-100 animate-bounce">
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
                className="block w-full px-6 py-5 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:ring-8 focus:ring-orange-500/5 focus:border-[#F15A24] outline-none transition-all font-bold text-gray-800"
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
                className="block w-full px-6 py-5 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:ring-8 focus:ring-orange-500/5 focus:border-[#F15A24] outline-none transition-all font-bold text-gray-800"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-2xl shadow-xl shadow-orange-500/20 text-xs font-black uppercase tracking-[0.2em] text-white bg-[#F15A24] hover:bg-[#d84e1d] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-circle-notch fa-spin mr-3"></i>
                Verificando...
              </span>
            ) : 'Acessar Operação'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
            Desde 1991 movendo o Brasil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
