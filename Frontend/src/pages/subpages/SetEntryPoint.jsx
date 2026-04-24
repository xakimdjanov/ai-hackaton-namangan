import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { MapPin, Loader2, CheckCircle2, XCircle, Navigation, ArrowLeft } from 'lucide-react';

export default function SetEntryPoint() {
  const [status, setStatus] = useState('waiting'); // waiting | loading | success | error
  const [coords, setCoords] = useState(null);
  const [parking, setParking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/parking').then(({ data }) => {
      const myId = localStorage.getItem('userId');
      const p = data.find(p => String(p.adminId) === String(myId)) || data[0];
      setParking(p);
    });
  }, []);

  const handleCapture = () => {
    setStatus('loading');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg("Bu qurilma GPS-ni qo'llab-quvvatlamaydi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setCoords({ latitude, longitude });

        if (!parking) {
          setStatus('error');
          setErrorMsg("Sizga biriktirilgan parkovka topilmadi.");
          return;
        }

        try {
          await api.put(`/parking/${parking.id}/location`, { latitude, longitude });
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setErrorMsg("Server bilan aloqa xatosi. Qayta urinib ko'ring.");
        }
      },
      (err) => {
        setStatus('error');
        setErrorMsg("GPS aniqlanmadi. Iltimos brauzer GPS ruxsatini bering.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">

        {/* Waiting state */}
        {status === 'waiting' && (
          <div className="animate-fade-in space-y-10">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 scale-150" />
              <div className="relative bg-white border border-emerald-100 p-10 rounded-[40px] shadow-xl shadow-emerald-500/10">
                <Navigation size={72} className="text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                Kirish Nuqtasi
              </h1>
              <p className="text-slate-400 font-medium leading-relaxed px-6">
                Parkovkaning <strong className="text-slate-900 underline decoration-emerald-200">kirish joyida</strong> turing va tugmani bosing.
              </p>
            </div>

            {parking && (
              <div className="glass-card p-6 flex items-center gap-5 text-left">
                <div className="bg-rose-50 p-4 rounded-2xl">
                  <MapPin className="text-rose-500" size={28} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Joriy Manzil</p>
                  <p className="font-black text-slate-800 text-lg leading-tight">{parking.name?.uz || parking.name}</p>
                  <p className="text-xs font-mono text-slate-300 mt-1">
                    {Number(parking.latitude).toFixed(4)}, {Number(parking.longitude).toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleCapture}
                className="btn-primary w-full py-6 flex items-center justify-center gap-4 text-lg shadow-xl shadow-festival-pink/30"
              >
                <MapPin size={28} />
                GEOLOKATSIYANI SAQLASH
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="flex items-center justify-center gap-2 mx-auto text-slate-400 hover:text-slate-600 font-black uppercase text-[11px] tracking-widest transition-all"
              >
                <ArrowLeft size={16} /> Panelga qaytish
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && (
          <div className="animate-fade-in space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 scale-150 animate-pulse" />
              <div className="relative bg-white border border-blue-100 p-10 rounded-[40px] shadow-xl">
                <Loader2 size={72} className="text-blue-500 animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">GPS Aniqlanmoqda</h2>
              <p className="text-slate-400 font-medium px-8">Iltimos, tashqi muhitda turing va ruxsat bering</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
              <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && coords && (
          <div className="animate-slide-up space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 scale-150" />
              <div className="relative bg-white border border-emerald-100 p-10 rounded-[40px] shadow-xl">
                <CheckCircle2 size={72} className="text-emerald-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-emerald-600 tracking-tight uppercase">Saqlab olindi!</h2>
              <p className="text-slate-400 font-medium tracking-tight">Parkovka kirish manzili muvaffaqiyatli yangilandi</p>
            </div>
            <div className="glass-card p-6 space-y-4 text-left border-emerald-100 bg-emerald-50/30">
              <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest">Yangi koordinatalar</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Latitude</p>
                  <p className="font-mono font-black text-emerald-600">{coords.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Longitude</p>
                  <p className="font-mono font-black text-emerald-600">{coords.longitude.toFixed(6)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic text-center font-medium">
                Endi turistlar navigatsiyasi aynan shu nuqtaga to'g'ri yo'naltiriladi.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
            >
              ASOSIY PANELGA QAYTISH
            </button>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="animate-slide-up space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-rose-500 rounded-full blur-3xl opacity-20 scale-150" />
              <div className="relative bg-white border border-rose-100 p-10 rounded-[40px] shadow-xl">
                <XCircle size={72} className="text-rose-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-rose-600 tracking-tight uppercase">Xatolik!</h2>
              <p className="text-rose-900/60 font-medium px-8 leading-relaxed">{errorMsg}</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setStatus('waiting')}
                className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
              >
                QAYTA URINIB KO'RISH
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center justify-center gap-2 mx-auto text-slate-400 font-black uppercase text-[11px] tracking-widest"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
