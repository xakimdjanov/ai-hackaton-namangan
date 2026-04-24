import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Leaf } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', username);

      if (data.role === 'super_admin') navigate('/super-admin');
      else if (data.role === 'admin') navigate('/admin');
      else navigate('/tourist');
    } catch (err) {
      setError('Xato login yoki parol');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="glass-card w-full max-w-md p-10 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-xl shadow-emerald-500/20 mb-4">
            <Leaf size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Namangan</h1>
          <p className="text-slate-400 font-medium">Smart Shahar Navigatsiyasi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Login</label>
            <input 
              type="text" 
              className="input-field w-full" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Foydalanuvchi nomi"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Parol</label>
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
          <button type="submit" className="btn-primary w-full py-4.5">
            Tizimga kirish
          </button>
          
          <div className="pt-4 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm">
              Akkauntingiz yo'qmi? <Link to="/register" className="text-emerald-500 font-bold hover:underline ml-1">Ro'yxatdan o'tish</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
