import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import api from '../../utils/api';
import { MapPin, ArrowLeft, Image as ImageIcon, Loader2, CloudUpload, Sparkles } from 'lucide-react';
import { translateText } from '../../utils/ai';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAcON_sCVD-B2gRh9-rF71YRvwa22HCip0";

const containerStyle = {
    width: '100%',
    height: '400px',
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

export default function CreateJoy() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        latitude: 41.0001,
        longitude: 71.6726,
        imageUrl: '',
        category: 'place',
    });

    const categories = [
        { id: 'place', label: 'Oddiy joy' },
        { id: 'park', label: 'Park' },
        { id: 'restaurant', label: 'Ovqatlanish' },
        { id: 'mosque', label: 'Masjid' },
        { id: 'ablution', label: 'Tahoratxona' },
        { id: 'attraction', label: 'Atraksion' },
        { id: 'ice_cream', label: 'Muzqaymoqxona' },
        { id: 'photo', label: 'Chiroyli joy (Photo)' },
        { id: 'shopping', label: 'Do\'kon' },
    ];

    const [loading, setLoading] = useState(false);
    const [aiTranslating, setAiTranslating] = useState(false);
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    const onMapClick = (e) => {
        setFormData({ ...formData, latitude: e.latLng.lat(), longitude: e.latLng.lng() });
    };

    const handleCreateJoy = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAiTranslating(true);
        
        try {
            // AI translation before sending
            const translatedName = await translateText(formData.name);
            const translatedDesc = await translateText(formData.description);

            const payload = {
                ...formData,
                name: translatedName || { uz: formData.name, ru: formData.name, en: formData.name },
                description: translatedDesc || { uz: formData.description, ru: formData.description, en: formData.description },
            };

            await api.post('/locations', payload);
            setLoading(false);
            setAiTranslating(false);
            navigate('/super-admin');
        } catch (err) {
            setLoading(false);
            setAiTranslating(false);
            alert('AI Xatolik yoki Server xatosi yuz berdi');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/super-admin')} className="group flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all mb-10">
                    <ArrowLeft size={20} />
                    <span className="font-black uppercase tracking-widest text-[11px]">Orqaga qaytish</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="glass-card p-10">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-xl shadow-emerald-500/20">
                                <MapPin size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Yangi Joy</h1>
                                <p className="text-slate-400 font-medium">Shaharning diqqatga sazovor nuqtasi</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateJoy} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Joy Nomi</label>
                                <input className="input-field w-full" placeholder="Masalan: Markaziy Fontan" onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Tafsilotlar</label>
                                <textarea className="input-field w-full h-28" placeholder="Joy haqida qisqacha ma'lumot..." onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Latitude</p>
                                    <p className="text-sm font-mono font-black text-emerald-600">{formData.latitude.toFixed(6)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Longitude</p>
                                    <p className="text-sm font-mono font-black text-emerald-600">{formData.longitude.toFixed(6)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Toifa (Kategoriya)</label>
                                <select
                                    className="input-field w-full bg-white cursor-pointer"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Rasm URL manzil</label>
                                <input className="input-field w-full" placeholder="https://..." onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            </div>

                            <button type="submit" disabled={loading} className="w-full btn-primary py-5 flex items-center justify-center gap-3">
                                {aiTranslating ? <><Loader2 className="animate-spin" /> AI tarjima qilmoqda...</> : (loading ? <Loader2 className="animate-spin" /> : <><CloudUpload size={20} /> Manzilni saqlash</>)}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-4">Xaritadan belgilang</p>
                        <div className="glass-card p-4">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={defaultCenter}
                                    zoom={14}
                                    onClick={onMapClick}
                                    options={{ styles: lightMapStyle, disableDefaultUI: false }}
                                >
                                    <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                </GoogleMap>
                            ) : <div className="bg-slate-100 h-[400px] rounded-[32px] animate-pulse" />}
                        </div>
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl text-xs text-blue-600 leading-relaxed font-medium">
                            Interaktiv xarita orqali nuqtani aniq belgilang. AI avtomatik ravishda nomli va tavsifni tarjima qilib, barcha tillarda (UZ, RU, EN) saqlaydi. 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
