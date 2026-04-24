import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Users, Car, MapPin, Eye, Clock, PlusCircle, Edit2, Trash2 } from 'lucide-react';


export default function SuperAdmin() {
  const [parkings, setParkings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchParkings();
    fetchLocations();
    fetchUsers();
  }, []);

  const fetchParkings = async () => {
    const { data } = await api.get('/parking');
    setParkings(data);
  };

  const fetchLocations = async () => {
    const { data } = await api.get('/locations');
    setLocations(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-1">Admin Markazi</h1>
            <p className="text-slate-400 font-medium tracking-tight">Smart Shahar boshqaruv tizimi</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
                onClick={() => setShowUsers(!showUsers)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-black uppercase text-[11px] tracking-widest ${showUsers ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Users size={18} /> {showUsers ? "Ma'lumotlar" : "Foydalanuvchilar"}
            </button>
            <button onClick={() => navigate('/super-admin/add-admin')} className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all font-black uppercase text-[11px] tracking-widest text-slate-500">
              <PlusCircle size={18} className="text-festival-pink" /> Admin
            </button>
            <button onClick={() => navigate('/super-admin/add-joy')} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl hover:bg-emerald-100 transition-all font-black uppercase text-[11px] tracking-widest text-emerald-600">
              <MapPin size={18} /> Joylar
            </button>
            <button onClick={() => navigate('/super-admin/add-parking')} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px]">
              <Plus size={18} /> Parkovka
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 border-l-8 border-rose-500">
            <div className="bg-rose-50 p-3 rounded-2xl w-fit mb-4 text-rose-500">
              <Car size={32} />
            </div>
            <h3 className="text-slate-400 text-[11px] uppercase font-black tracking-widest mb-1">Jami Parkovkalar</h3>
            <p className="text-4xl font-black text-slate-900">{parkings.length}</p>
          </div>
          <div className="glass-card p-8 border-l-8 border-emerald-500">
            <div className="bg-emerald-50 p-3 rounded-2xl w-fit mb-4 text-emerald-500">
              <Users size={32} />
            </div>
            <h3 className="text-slate-400 text-[11px] uppercase font-black tracking-widest mb-1">Jami Foydalanuvchilar</h3>
            <p className="text-4xl font-black text-slate-900">{users.length}</p>
          </div>
          <div className="glass-card p-8 border-l-8 border-blue-500">
            <div className="bg-blue-50 p-3 rounded-2xl w-fit mb-4 text-blue-500">
              <MapPin size={32} />
            </div>
            <h3 className="text-slate-400 text-[11px] uppercase font-black tracking-widest mb-1">Umumiy Maydon</h3>
            <p className="text-4xl font-black text-slate-900">
              {parkings.reduce((acc, p) => acc + (parseFloat(p.totalArea) || 0), 0)} <span className="text-sm font-bold text-slate-400 uppercase ml-1">m²</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        {!showUsers ? (
          <div className="space-y-8">
            {/* Parkings Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Parkovkalar nazorati</h2>
                <span className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  Tizimda: {parkings.length} ta
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                      <th className="p-5 font-black">Nomi</th>
                      <th className="p-5 font-black">Koordinatalar</th>
                      <th className="p-5 font-black">Maydon</th>
                      <th className="p-5 font-black">Admin ID</th>
                      <th className="p-5 font-black text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parkings.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/10 transition-all font-medium">
                        <td className="p-5 font-black text-slate-900">{p.name?.uz || p.name}</td>
                        <td className="p-5 text-slate-400 font-mono text-xs">
                          {parseFloat(p.latitude).toFixed(4)}, {parseFloat(p.longitude).toFixed(4)}
                        </td>
                        <td className="p-5 font-bold text-slate-600">{p.totalArea} m²</td>
                        <td className="p-5 text-slate-400">#{p.adminId || 'Yo\'q'}</td>
                        <td className="p-5 text-right">
                          <button onClick={() => navigate(`/super-admin/edit-parking/${p.id}`)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* POI Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Diqqatga sazovor joylar</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                        <th className="p-5 font-black">Nomi</th>
                        <th className="p-5 font-black">Koordinatalar</th>
                        <th className="p-5 font-black">Tavsif</th>
                        <th className="p-5 font-black text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map(l => (
                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/10 transition-all font-medium">
                            <td className="p-5 font-black text-emerald-600">{l.name?.uz || l.name}</td>
                            <td className="p-5 text-slate-400 font-mono text-xs">
                              {parseFloat(l.latitude).toFixed(4)}, {parseFloat(l.longitude).toFixed(4)}
                            </td>
                            <td className="p-5 text-slate-500 text-sm line-clamp-1 max-w-xs">{l.description?.uz || l.description}</td>
                            <td className="p-5 text-right">
                              <button className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                <Edit2 size={18} />
                              </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden animate-fade-in shadow-xl">
             <div className="p-8 border-b border-slate-100 bg-white flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tizim Foydalanuvchilari</h2>
                <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Jami: {users.length}
                </span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                        <th className="p-6">ID</th>
                        <th className="p-6">Foydalanuvchi nomi</th>
                        <th className="p-6">Rol (Vazifasi)</th>
                        <th className="p-6 text-right">Holat</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-bold group">
                        <td className="p-6 text-slate-400 font-mono text-xs">#{u.id}</td>
                        <td className="p-6 text-slate-900 uppercase tracking-tight">{u.username}</td>
                        <td className="p-6">
                            <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${u.role === 'super_admin' ? 'bg-slate-900 text-white' : u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                              {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Parking Admin' : 'Turist'}
                            </span>
                        </td>
                        <td className="p-6 text-right">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
