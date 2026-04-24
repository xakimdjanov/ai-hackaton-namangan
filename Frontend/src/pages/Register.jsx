import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Sparkles } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', username);
      navigate('/tourist');
    } catch (err) {
      setError(err.response?.data?.error || 'Ro\'yxatdan o\'tishda xatolik');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="glass-card w-full max-w-md p-10 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-festival-pink/10 p-5 rounded-[32px] shadow-xl shadow-festival-pink/10 mb-4">
            <UserPlus size={40} className="text-festival-pink" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Qo'shiling</h1>
          <p className="text-slate-400 font-medium">Namangan Smart Navigatsiya tizimi</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Login tanlang</label>
            <input 
              type="text" 
              className="input-field w-full" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masalan: ali_nur"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Xavfsiz parol</label>
            <input 
              type="password" 
              className="input-field w-full" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
          
          <div className="pt-2">
            <button type="submit" className="btn-primary w-full py-4.5 flex items-center justify-center gap-2">
               Hisob yaratish <Sparkles size={18} />
            </button>
          </div>

          <div className="pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm">
              Akkauntingiz bormi? <Link to="/login" className="text-rose-500 font-bold hover:underline ml-1">Kirish sahifasi</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
