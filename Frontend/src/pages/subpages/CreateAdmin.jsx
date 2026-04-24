import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Users, ArrowLeft, ShieldPlus } from 'lucide-react';

export default function CreateAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { username, password, role: 'admin' });
      alert('Admin muvaffaqiyatli yaratildi!');
      navigate('/super-admin');
    } catch (err) {
      alert('Xatolik yuz berdi');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/super-admin')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-black uppercase text-[11px] tracking-widest">
          <ArrowLeft size={20} /> Orqaga
        </button>
        
        <div className="glass-card p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-festival-pink/10 p-5 rounded-3xl mb-4">
              <ShieldPlus size={40} className="text-festival-pink" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yangi Admin</h1>
            <p className="text-slate-400 font-medium">Tizim uchun boshqaruvchi qo'shish</p>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Foydalanuvchi nomi (Login)</label>
              <input 
                type="text" 
                className="input-field w-full" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masalan: admin_namangan"
                required 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Maxfiy parol</label>
              <input 
                type="password" 
                className="input-field w-full" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="btn-primary w-full py-5">
              Adminni Saqlash
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
