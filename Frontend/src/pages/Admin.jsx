import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  RefreshCw, Navigation, PlusCircle, Loader2, XCircle, Layers,
  Zap, Star, Car, Grid3X3, Trash2
} from 'lucide-react';


const STATUS_META = {
  free:     { label: "Bo'sh",   color: 'bg-emerald-50 text-emerald-600 border-emerald-100',  dot: 'bg-emerald-500' },
  occupied: { label: 'Band',    color: 'bg-rose-50 text-rose-600 border-rose-100',          dot: 'bg-rose-500' },
  reserved: { label: 'Rezerv', color: 'bg-amber-50 text-amber-600 border-amber-100',      dot: 'bg-amber-500' },
};

const TYPE_ICONS = {
  standard: <Car size={16} />,
  vip:      <Star size={16} className="text-amber-500" />,
  disabled: <span className="text-[9px] font-black text-blue-500">♿</span>,
  electric: <Zap size={16} className="text-emerald-500" />,
};

export default function Admin() {
  const [parking,  setParking]  = useState(null);
  const [slots,    setSlots]    = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [showGen, setShowGen]   = useState(false);
  const [genForm, setGenForm]   = useState({ capacity: 20, colsPerRow: 5, type: 'standard' });
  const [generating, setGenerating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const myId = localStorage.getItem('userId');
      const { data: parkings } = await api.get('/parking');
      const p = parkings.find(park => String(park.adminId) === String(myId)) || null;
      
      setParking(p);
      if (p) {
        const [slotsRes, summaryRes] = await Promise.all([
          api.get(`/slots?parkingId=${p.id}`),
          api.get(`/slots/summary?parkingId=${p.id}`),
        ]);
        setSlots(slotsRes.data);
        setSummary(summaryRes.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };


  const cycleStatus = async (slot) => {
    const CYCLE = { free: 'occupied', occupied: 'free', reserved: 'free' };
    const next = CYCLE[slot.status];
    setTogglingId(slot.id);
    try {
      const { data } = await api.put(`/slots/${slot.id}/status`, { status: next });
      setSlots(prev => prev.map(s => s.id === slot.id ? data : s));
      const { data: sum } = await api.get(`/slots/summary?parkingId=${parking.id}`);
      setSummary(sum);
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
    setTogglingId(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const { data } = await api.post('/slots/generate', {
        parkingId: parking.id,
        capacity:  parseInt(genForm.capacity),
        colsPerRow: parseInt(genForm.colsPerRow),
        type: genForm.type,
      });
      setShowGen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
    setGenerating(false);
  };

  const deleteSlot = async (slot) => {
    if (!confirm(`${slot.slotNumber} slotni o'chirish?`)) return;
    try {
      await api.delete(`/slots/${slot.id}`);
      setSlots(prev => prev.filter(s => s.id !== slot.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Faqat bo\'sh slotlar o\'chiriladi');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Loader2 size={48} className="text-festival-pink animate-spin" />
    </div>
  );

  if (!parking) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-center px-6">
      <div className="space-y-4">
        <XCircle size={56} className="text-festival-pink mx-auto" />
        <h2 className="text-2xl font-black text-slate-800">Parkovka biriktirilmagan</h2>
        <p className="text-slate-400 font-medium">Super Admin tomonidan parkovka biriktirilishi kerak.</p>
      </div>
    </div>
  );

  const fillPct = summary ? Math.round(((summary.total - summary.free) / Math.max(summary.total, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between glass-card p-6">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Parkovka Admin</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{parking.name?.uz || parking.name}</h1>
          </div>
          <button onClick={fetchData} className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-100 transition-all text-slate-400">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Bo'sh",   value: summary.free,     color: 'text-emerald-500' },
              { label: 'Band',    value: summary.occupied,  color: 'text-rose-500' },
              { label: 'Rezerv', value: summary.reserved,  color: 'text-amber-500' },
              { label: 'Jami',   value: summary.total,     color: 'text-slate-900' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] uppercase text-slate-400 font-black mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Fill bar */}
        {summary && summary.total > 0 && (
          <div className="glass-card p-6 space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
              <span className="text-slate-400">To'lganlik holati</span>
              <span className={fillPct >= 90 ? 'text-rose-500' : fillPct >= 60 ? 'text-amber-500' : 'text-emerald-500'}>
                {fillPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div className={`h-3.5 rounded-full transition-all duration-700 ${fillPct >= 90 ? 'bg-rose-500' : fillPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setShowGen(true)}
            className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-rose-50 hover:border-rose-100 transition-all group active:scale-95 border-transparent">
            <div className="bg-rose-50 p-3 rounded-2xl group-hover:bg-rose-100 transition-all">
              <Grid3X3 size={28} className="text-rose-500" />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase text-slate-800 tracking-tight">Slot Qo'shish</p>
              <p className="text-[10px] text-slate-400 font-medium">Auto-gen</p>
            </div>
          </button>

          <button onClick={() => navigate(`/admin/garages?parkingId=${parking.id}`)}
            className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-indigo-50 hover:border-indigo-100 transition-all group active:scale-95 border-transparent">
            <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-100 transition-all">
              <Layers size={28} className="text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase text-slate-800 tracking-tight">Garajlar</p>
              <p className="text-[10px] text-slate-400 font-medium">Boshqarish</p>
            </div>
          </button>

          <button onClick={() => navigate('/admin/set-entry')}
            className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-emerald-50 hover:border-emerald-100 transition-all group active:scale-95 border-transparent">
            <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-100 transition-all">
              <Navigation size={28} className="text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase text-slate-800 tracking-tight">Kirish Yo'li</p>
              <p className="text-[10px] text-slate-400 font-medium">Markerlar</p>
            </div>
          </button>
        </div>

        {/* Slot Grid */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-500">Slotlar jadvali</h2>
            <div className="flex gap-3 text-[10px] font-bold">
              {Object.entries(STATUS_META).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${v.dot}`} /> {v.label}
                </span>
              ))}
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Grid3X3 size={48} className="text-slate-100 mx-auto" />
              <p className="text-slate-300 font-medium">Bu yerda hozircha slotlar yo'q</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {slots.map(slot => {
                const meta = STATUS_META[slot.status];
                const busy = togglingId === slot.id;
                return (
                  <div key={slot.id} className="relative group">
                    <button
                      onClick={() => cycleStatus(slot)}
                      disabled={busy}
                      className={`w-full aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${meta.color} ${busy ? 'opacity-50' : 'hover:-translate-y-1 shadow-sm'}`}
                    >
                      {busy
                        ? <Loader2 size={14} className="animate-spin" />
                        : <>
                            <span className="opacity-60">{TYPE_ICONS[slot.type]}</span>
                            <span className="text-[11px] font-black leading-none">{slot.slotNumber}</span>
                          </>
                      }
                    </button>
                    {slot.status === 'free' && (
                      <button
                        onClick={() => deleteSlot(slot)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end md:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-sm p-8 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Slotlarni yaratish</h2>
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Slotlar soni</label>
                <input className="input-field w-full" type="number" min="1" max="500" value={genForm.capacity}
                  onChange={e => setGenForm({...genForm, capacity: e.target.value})} required />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Turi</label>
                <select className="input-field w-full bg-white" value={genForm.type}
                  onChange={e => setGenForm({...genForm, type: e.target.value})}>
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="disabled">Nogironlar uchun</option>
                  <option value="electric">Elektr avtomobil</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowGen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Bekor qilish
                </button>
                <button type="submit" disabled={generating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {generating ? <Loader2 className="animate-spin" /> : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
