import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import api from '../../utils/api';
import { Car, ArrowLeft, Loader2, Save } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = { width: '100%', height: '400px', borderRadius: '32px' };

export default function EditParking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', latitude: 41.0001, longitude: 71.6726, totalSlots: 0, adminId: '' });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    fetchParking();
    fetchAdmins();
  }, [id]);

  const fetchParking = async () => {
    try {
      const { data } = await api.get(`/parking/${id}`);
      setFormData({ 
        name: data.name, 
        latitude: +data.latitude, 
        longitude: +data.longitude, 
        totalSlots: data.totalSlots, 
        adminId: data.adminId || '' 
      });
    } catch (err) {
      alert('Ma\'lumotni yuklashda xatolik');
      navigate('/super-admin');
    } finally {
        setFetching(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/users');
      setAdmins(data.filter(u => u.role === 'admin'));
    } catch (err) { console.error('Adminlarni olishda xatolik'); }
  };

  const onMapClick = (e) => {
    setFormData({ ...formData, latitude: e.latLng.lat(), longitude: e.latLng.lng() });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/parking/${id}`, formData);
      setLoading(false);
      navigate('/super-admin');
    } catch (err) {
      setLoading(false);
      alert('Xatolik yuz berdi');
    }
  };

  if (fetching) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/super-admin')} className="group flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all mb-8">
            <ArrowLeft size={20} />
            <span className="font-black uppercase tracking-widest text-[11px]">Orqaga qaytish</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="glass-card p-10">
                <div className="flex items-center gap-6 mb-10">
                    <div className="bg-blue-500 p-5 rounded-3xl shadow-xl shadow-blue-500/20">
                        <Car size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tahrirlash</h1>
                        <p className="text-slate-400 font-medium">Parkovka ID: #{id}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Parkovka Nomi</label>
                        <input className="input-field w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>

                    <div>
                        <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Mas'ul Administrator</label>
                        <select 
                            className="input-field w-full bg-white appearance-none"
                            value={formData.adminId}
                            onChange={e => setFormData({...formData, adminId: e.target.value})}
                        >
                            <option value="">Tanlanmagan</option>
                            {admins.map(a => (
                                <option key={a.id} value={a.id}>{a.username} (ID: {a.id})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Slotlar Soni</label>
                        <input type="number" className="input-field w-full" value={formData.totalSlots} onChange={e => setFormData({...formData, totalSlots: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Kenglik (Lat)</p>
                            <p className="text-sm font-mono font-black text-blue-500">{formData.latitude.toFixed(6)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Uzunlik (Lng)</p>
                            <p className="text-sm font-mono font-black text-blue-500">{formData.longitude.toFixed(6)}</p>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary py-5 flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> O'zgarishlarni Saqlash</>}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-4">Xaritadan belgilash</p>
                <div className="glass-card p-4 h-full">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={{ lat: formData.latitude, lng: formData.longitude }}
                            zoom={15}
                            onClick={onMapClick}
                            options={{ disableDefaultUI: false }}
                        >
                            <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                        </GoogleMap>
                    ) : <div className="bg-slate-100 h-[400px] rounded-[32px] animate-pulse" />}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
