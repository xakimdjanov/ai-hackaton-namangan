import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api';
import api from '../../utils/api';
import { Car, ArrowLeft, MousePointer2, Trash2, CheckCircle2, Loader2, Info, Sparkles } from 'lucide-react';
import { translateText } from '../../utils/ai';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAcON_sCVD-B2gRh9-rF71YRvwa22HCip0";

const containerStyle = {
    width: '100%',
    height: '450px',
    borderRadius: '32px',
};

const defaultCenter = { lat: 41.0001, lng: 71.6726 };

const lightMapStyle = [
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
  { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] },
  { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }
];

export default function CreateParking() {
    const [formData, setFormData] = useState({ name: '', totalArea: '', adminId: '' });
    const [points, setPoints] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiTranslating, setAiTranslating] = useState(false);
    const [fetchingAdmins, setFetchingAdmins] = useState(true);

    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    useEffect(() => {
        api.get('/users')
            .then(({ data }) => {
                setAdmins(data.filter(u => u.role === 'admin') || []);
                setFetchingAdmins(false);
            })
            .catch(() => setFetchingAdmins(false));
    }, []);

    // Avtomatik maydon hisoblash
    useEffect(() => {
        if (points.length === 4) {
            // Shoelace formula based on meters
            const latMid = (points[0].lat + points[2].lat) / 2;
            const mPerLat = 111320; 
            const mPerLng = 111320 * Math.cos(latMid * Math.PI / 180);

            let area = 0;
            for (let i = 0; i < 4; i++) {
                const j = (i + 1) % 4;
                const xi = points[i].lng * mPerLng;
                const yi = points[i].lat * mPerLat;
                const xj = points[j].lng * mPerLng;
                const yj = points[j].lat * mPerLat;
                area += (xi * yj - xj * yi);
            }
            const calculatedArea = Math.abs(area / 2);
            setFormData(prev => ({ ...prev, totalArea: Math.round(calculatedArea) }));
        }
    }, [points]);

    const onMapClick = (e) => {
        if (points.length < 4) {
            setPoints([...points, { lat: e.latLng.lat(), lng: e.latLng.lng() }]);
        }
    };

    const handleCreateParking = async (e) => {
        e.preventDefault();
        if (points.length < 4) {
            alert("Iltimos, haritada parkovkaning 4 ta burchagini belgilang.");
            return;
        }

        setLoading(true);
        setAiTranslating(true);

        try {
            // AI translation before sending
            const translatedName = await translateText(formData.name);

            const payload = {
                ...formData,
                name: translatedName || { uz: formData.name, ru: formData.name, en: formData.name },
                latitude: points[0].lat,
                longitude: points[0].lng,
            };

            await api.post('/parking', payload);
            setLoading(false);
            setAiTranslating(false);
            navigate('/super-admin');
        } catch (err) {
            setLoading(false);
            setAiTranslating(false);
            alert(err.response?.data?.error || 'Xatolik yuz berdi');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate('/super-admin')} className="group flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all">
                        <ArrowLeft size={20} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Orqaga qaytish</span>
                    </button>
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yaratish tizimi v2.0</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="glass-card p-10">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-xl shadow-rose-500/20">
                                    <Car size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Yangi Parkovka</h1>
                                    <p className="text-slate-400 font-medium mt-2">Festival hududi uchun yangi maydon</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateParking} className="space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Maydon Nomi</label>
                                        <input
                                            className="input-field w-full"
                                            placeholder="Masalan: Markaziy Bog' Parkovkasi"
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Maydon (m²)</label>
                                            <input
                                                className="input-field w-full"
                                                placeholder="500"
                                                type="number"
                                                onChange={e => setFormData({ ...formData, totalArea: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Ma'sul Admin</label>
                                            <select
                                                className="input-field w-full bg-white"
                                                onChange={e => setFormData({ ...formData, adminId: e.target.value })}
                                                disabled={fetchingAdmins}
                                            >
                                                <option value="">{fetchingAdmins ? 'Yuklanmoqda...' : 'Tanlang'}</option>
                                                {admins.map(admin => (
                                                    <option key={admin.id} value={admin.id}>{admin.username}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-1">Gips Burchaklari</label>
                                        <button type="button" onClick={() => setPoints([])} className="text-rose-500 text-[10px] font-black uppercase hover:underline transition-all">
                                            Tozalash
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} className={`h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${points[i] ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                                {points[i] ? <CheckCircle2 size={24} className="text-white" /> : <span className="font-black text-slate-300">{i + 1}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || points.length < 4}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${loading || points.length < 4 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'btn-primary'}`}
                                >
                                    {aiTranslating ? (
                                        <><Loader2 className="animate-spin" /> <Sparkles size={18} className="text-yellow-300" /> AI tarjima qilmoqda...</>
                                    ) : (
                                        loading ? <Loader2 className="animate-spin" /> : 'Parkovkani Tasdiqlash'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="glass-card p-4">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={defaultCenter}
                                    zoom={15}
                                    onClick={onMapClick}
                                    options={{
                                        styles: lightMapStyle,
                                        disableDefaultUI: false,
                                        clickableIcons: false
                                    }}
                                >
                                    {points.map((p, idx) => (
                                        <Marker
                                            key={idx}
                                            position={p}
                                            icon={{
                                                path: window.google.maps.SymbolPath.CIRCLE,
                                                fillColor: '#FF4D6D',
                                                fillOpacity: 1,
                                                strokeColor: '#FFFFFF',
                                                strokeWeight: 3,
                                                scale: 8
                                            }}
                                        />
                                    ))}
                                    {points.length > 1 && (
                                        <Polygon
                                            paths={points}
                                            options={{
                                                fillColor: "#FF4D6D",
                                                fillOpacity: 0.15,
                                                strokeColor: "#FF4D6D",
                                                strokeWeight: 4,
                                                geodesic: true
                                            }}
                                        />
                                    )}
                                </GoogleMap>
                            ) : (
                                <div style={containerStyle} className="bg-slate-50 flex items-center justify-center animate-pulse">
                                    <Loader2 className="animate-spin text-slate-200" size={40} />
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px] flex gap-5">
                            <Info size={24} className="text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-amber-600 font-black text-xs uppercase tracking-widest mb-3">Xaritadan foydalanish:</h4>
                                <ul className="text-sm text-amber-900/60 space-y-2 font-medium">
                                    <li>1. Xaritadan parkovkaning 4 ta burchagini belgilang (soat yo'nalishida).</li>
                                    <li>2. Birinchi belgilangan nuqta parkovkaning asosiy kirish manzili bo'ladi.</li>
                                    <li>3. Maydon barcha slotlar to'g'ri joylashishi uchun muhimdir.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
