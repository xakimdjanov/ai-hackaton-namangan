import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Navigation, Loader2, CheckCircle2, XCircle, PlusCircle } from 'lucide-react';

export default function AddSpot() {
  const [status, setStatus] = useState('waiting'); // waiting | loading | success | error
  const [coords, setCoords] = useState(null);
  const [parking, setParking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/parking').then(({ data }) => {
      setParking(data[0] || null);
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
          await api.post('/spots', {
            parkingId: parking.id,
            latitude,
            longitude,
          });
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setErrorMsg("Server xatosi. Qayta urinib ko'ring.");
        }
      },
      () => {
        setStatus('error');
        setErrorMsg("GPS aniqlanmadi. Brauzer GPS ruxsatini bering.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-festival-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center text-white">

        {status === 'waiting' && (
          <div className="animate-fade-in space-y-10">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-festival-pink rounded-full blur-3xl opacity-20 scale-150" />
              <div className="relative bg-festival-pink/10 border border-festival-pink/30 p-10 rounded-full">
                <PlusCircle size={72} className="text-festival-pink" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase tracking-tight leading-none">
                Yangi Joy<br />Qo'shish
              </h1>
              <p className="text-white/40 text-sm leading-relaxed px-6">
                Usha joyning <strong className="text-white">markaziga boring</strong> va turing.<br />
                Tayyor bo'lgach quyidagi tugmani bosing.
              </p>
            </div>

            {parking && (
              <div className="glass-card p-4 text-left border-white/10">
                <p className="text-[10px] text-white/20 uppercase font-bold mb-1 tracking-widest">Parkovka</p>
                <p className="font-black text-xl">{parking.name?.uz || parking.name}</p>
                <p className="text-xs text-white/30 mt-1">
                  Hozirgi joylar soni:{' '}
                  <span className="text-festival-green font-bold">{parking.totalSpots || 0} ta</span>
                </p>
              </div>
            )}

            <button
              onClick={handleCapture}
              className="w-full bg-festival-pink hover:bg-festival-pink/90 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-2xl shadow-festival-pink/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
            >
              <Navigation size={28} />
              TURGAN JOYIMNI OL
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="text-white/20 hover:text-white/50 text-sm transition-all underline underline-offset-4"
            >
              Bekor qilish
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="animate-fade-in space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-festival-pink rounded-full blur-3xl opacity-20 scale-150 animate-pulse" />
              <div className="relative bg-festival-pink/10 border border-festival-pink/30 p-10 rounded-full">
                <Loader2 size={72} className="text-festival-pink animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase">GPS Aniqlanmoqda...</h2>
              <p className="text-white/40 text-sm">Biroz kuting...</p>
            </div>
          </div>
        )}

        {status === 'success' && coords && (
          <div className="animate-slide-up space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-festival-green rounded-full blur-3xl opacity-30 scale-150" />
              <div className="relative bg-festival-green/10 border border-festival-green/30 p-10 rounded-full">
                <CheckCircle2 size={72} className="text-festival-green" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase text-festival-green">Joy Saqlandi!</h2>
              <p className="text-white/40 text-sm">Yana boshqa joy qo'shishingiz mumkin</p>
            </div>
            <div className="glass-card p-6 text-left bg-festival-green/5 border border-festival-green/20 space-y-3">
              <p className="text-xs text-white/30 uppercase font-bold">Koordinatalar</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/30">Lat</p>
                  <p className="font-mono text-sm font-bold text-festival-green">{coords.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/30">Lng</p>
                  <p className="font-mono text-sm font-bold text-festival-green">{coords.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStatus('waiting')}
                className="w-full bg-festival-pink hover:bg-festival-pink/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                + Yana joy qo'shish
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Panelga qaytish
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-slide-up space-y-8">
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 bg-festival-pink rounded-full blur-3xl opacity-20 scale-150" />
              <div className="relative bg-festival-pink/10 border border-festival-pink/30 p-10 rounded-full">
                <XCircle size={72} className="text-festival-pink" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase text-festival-pink">Xatolik!</h2>
              <p className="text-white/40 text-sm px-6">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => setStatus('waiting')} className="w-full bg-festival-pink hover:bg-festival-pink/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all">
                Qayta Urinish
              </button>
              <button onClick={() => navigate('/admin')} className="text-white/20 hover:text-white/50 text-sm transition-all underline underline-offset-4">
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
