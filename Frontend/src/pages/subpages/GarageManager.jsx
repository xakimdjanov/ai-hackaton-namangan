import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { Layers, ArrowLeft, PlusCircle, Edit3, Car, DollarSign, Loader2,
  CheckCircle2, XCircle, TrendingUp, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const TYPE_LABELS = { open: 'Ochiq', closed: 'Yopiq', underground: 'Yerto\'la' };
const TYPE_COLORS = { open: 'text-emerald-500', closed: 'text-blue-500', underground: 'text-slate-400' };

export default function GarageManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parkingId = searchParams.get('parkingId');

  const [parking, setParking] = useState(null);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGarage, setEditGarage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
    name: '', type: 'open', capacity: '', pricePerHour: ''
  });

  useEffect(() => {
    fetchAll();
  }, [parkingId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [parkRes, garageRes] = await Promise.all([
        api.get('/parking'),
        api.get(`/garages?parkingId=${parkingId}`)
      ]);
      const p = parkRes.data.find(p => p.id === parseInt(parkingId)) || parkRes.data[0];
      setParking(p);
      setGarages(garageRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditGarage(null);
    setForm({ name: '', type: 'open', capacity: '', pricePerHour: '' });
    setShowForm(true);
  };

  const openEdit = (g) => {
    setEditGarage(g);
    setForm({ name: g.name, type: g.type, capacity: g.capacity, pricePerHour: g.pricePerHour });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editGarage) {
        await api.put(`/garages/${editGarage.id}`, form);
      } else {
        await api.post('/garages', { ...form, parkingId: parseInt(parkingId), capacity: parseInt(form.capacity) });
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
    setSaving(false);
  };

  const handleSlot = async (garage, delta) => {
    setTogglingId(garage.id);
    try {
      const { data } = await api.put(`/garages/${garage.id}/slots`, { delta });
      setGarages(garages.map(g => g.id === garage.id ? { ...g, bookedSlots: data.bookedSlots, availableSlots: data.availableSlots, status: data.status } : g));
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Garajni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/garages/${id}`);
    fetchAll();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Loader2 size={48} className="text-festival-pink animate-spin" />
    </div>
  );

  const totalCap = garages.reduce((a, g) => a + g.capacity, 0);
  const totalFree = garages.reduce((a, g) => a + Math.max(0, g.availableSlots || (g.capacity - g.bookedSlots)), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between glass-card p-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl transition-all border border-slate-100 text-slate-400">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Bo'limlar nazorati</p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{parking?.name?.uz || parking?.name}</h1>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <PlusCircle size={18} /> Garaj qo'shish
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-black text-slate-900">{garages.length}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Garajlar</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-black text-emerald-500">{totalFree}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Bo'sh</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-black text-slate-900">{totalCap}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Jami sig'im</p>
          </div>
        </div>

        {/* Garages List */}
        {garages.length === 0 ? (
          <div className="glass-card p-16 text-center space-y-4">
            <Layers size={48} className="text-slate-100 mx-auto" />
            <p className="text-slate-300 font-medium tracking-tight">Xali garajlar qo'shilmagan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {garages.map(g => {
              const avail = Math.max(0, g.availableSlots !== undefined ? g.availableSlots : g.capacity - g.bookedSlots);
              const fillPct = g.capacity > 0 ? Math.round((g.bookedSlots / g.capacity) * 100) : 0;
              const isFull = avail <= 0;

              return (
                <div key={g.id} className={`glass-card overflow-hidden transition-all duration-300 hover:shadow-md border border-transparent ${isFull ? 'hover:border-rose-100' : 'hover:border-emerald-100'}`}>
                  {/* Status Progress Line */}
                  <div className="h-1.5 w-full bg-slate-50">
                    <div className={`h-1.5 transition-all duration-700 ${isFull ? 'bg-rose-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${fillPct}%` }} />
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{g.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-xs font-black uppercase tracking-wider ${TYPE_COLORS[g.type]}`}>{TYPE_LABELS[g.type]}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-xs font-bold text-slate-400">{g.pricePerHour.toLocaleString()} so'm/soat</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {isFull ? 'TO\'LGAN' : 'BO\'SH JOY BAR'}
                        </span>
                        <button onClick={() => openEdit(g)} className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all text-slate-400">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Slot visual progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                        <span className="text-slate-400">To'lganlik: {fillPct}%</span>
                        <span className={isFull ? 'text-rose-500 font-black' : 'text-emerald-500 font-black'}>
                          {avail} bo'sh / {g.capacity} ta
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${isFull ? 'bg-rose-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Control Panel */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest">Onlayn Slot Boshqaruvi</p>
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => handleSlot(g, -1)}
                          disabled={togglingId === g.id || g.bookedSlots === 0}
                          className="bg-slate-50 hover:bg-emerald-50 text-emerald-600 p-3 rounded-2xl transition-all border border-slate-100 disabled:opacity-20"
                        >
                          {togglingId === g.id ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={22} strokeWidth={3} />}
                        </button>
                        <span className="text-3xl font-black w-12 text-center text-slate-900">{g.bookedSlots}</span>
                        <button
                          onClick={() => handleSlot(g, 1)}
                          disabled={togglingId === g.id || isFull}
                          className="bg-slate-50 hover:bg-rose-50 text-rose-600 p-3 rounded-2xl transition-all border border-slate-100 disabled:opacity-20"
                        >
                          {togglingId === g.id ? <Loader2 size={18} className="animate-spin" /> : <ChevronUp size={22} strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end md:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-10 animate-slide-up border-t-8 border-rose-500">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
              {editGarage ? 'Garaj Ma\'lumotlari' : 'Yangi Garaj'}
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block mb-2">Parkovka/Garaj nomi</label>
                <input className="input-field w-full" placeholder="A-blok, Yerto'la 2..." value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block mb-2">Sharoit turi</label>
                <select className="input-field w-full bg-white" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="open">Ochiq maydon</option>
                  <option value="closed">Yopiq (Bino)</option>
                  <option value="underground">Yerto'la (Underground)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block mb-2">Sig'im</label>
                  <input className="input-field w-full font-black text-blue-500" type="number" min="1" placeholder="30" value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block mb-2">Narxi (so'm)</label>
                  <input className="input-field w-full font-black text-emerald-600" type="number" min="0" placeholder="5000" value={form.pricePerHour}
                    onChange={e => setForm({ ...form, pricePerHour: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-4.5 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all">
                  Yopish
                </button>
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" /> : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
