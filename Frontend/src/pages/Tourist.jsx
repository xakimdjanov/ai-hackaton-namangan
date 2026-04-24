import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import api from '../utils/api';
import useNavigation from '../hooks/useNavigation';
import useVoice from '../hooks/useVoice';
import {
  Navigation, Car, Mic, ChevronRight, Compass, LogIn, User, LogOut,
  X, Clock, Route, ChevronDown, ChevronUp, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAcON_sCVD-B2gRh9-rF71YRvwa22HCip0";

const MAP_STYLE = { width: '100%', height: '100vh' };
const NAMANGAN = { lat: 41.0022, lng: 71.6698 };

function haversineMetres(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

const i18n = {
  uz: {
    welcome: "Salom! Qayerga borishni xohlaysiz?",
    places: "Joylar",
    parking: "Parkovka",
    go: "Borish",
    freeSlots: "Bo'sh joylar",
    full: "To'liq band",
    calculating: "Yo'nalish hisoblanmoqda...",
    navStopped: "Navigatsiya to'xtatildi.",
    arrived: "Tabriklaymiz! Manzilga yetib keldingiz.",
    rerouting: "Yo'nalishdan chiqdingiz. Qayta hisoblanmoqda...",
    noRoute: "Yo'nalish topilmadi.",
    loading: "Yuklanmoqda...",
    gpsOff: "GPS aniqlanmadi.",
    panel: "Panel",
    login: "Kirish",
    slotsLeft: "ta bo'sh joy bor",
    searchPlaceholder: "Qidirish..."
  },
  en: {
    welcome: "Hello! Where do you want to go?",
    places: "Places",
    parking: "Parking",
    go: "Navigate",
    freeSlots: "Free Slots",
    full: "All Full",
    calculating: "Calculating route...",
    navStopped: "Navigation stopped.",
    arrived: "Congratulations! You have arrived.",
    rerouting: "Off track. Recalculating...",
    noRoute: "No route found.",
    loading: "Loading...",
    gpsOff: "GPS not detected.",
    panel: "Admin",
    login: "Login",
    slotsLeft: "slots available",
    searchPlaceholder: "Search..."
  },
  ru: {
    welcome: "Привет! Куда вы хотите отправиться?",
    places: "Места",
    parking: "Парковка",
    go: "Поехать",
    freeSlots: "Свободно",
    full: "Мест нет",
    calculating: "Расчет маршрута...",
    navStopped: "Навигация остановлена.",
    arrived: "Поздравляем! Вы приехали.",
    rerouting: "Сбились с пути. Перерасчет...",
    noRoute: "Маршрут не найден.",
    loading: "Загрузка...",
    gpsOff: "GPS не обнаружен.",
    panel: "Панель",
    login: "Вход",
    slotsLeft: "свободных мест",
    searchPlaceholder: "Поиск..."
  }
};

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

export default function Tourist() {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GMAPS_KEY });

  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { speak, stop } = useVoice();

  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'uz');
  const t = i18n[lang];

  const [locations, setLocations] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('places');
  const [category, setCategory] = useState('all');
  const [message, setMessage] = useState(t.welcome);

  const [stepsOpen, setStepsOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role'));

  const smartSpeak = useCallback((text) => {
    speak(text, lang);
    setMessage(text);
  }, [speak, lang]);

  const {
    userPos, isNavigating, steps, currentStep, stepIndex,
    summary, progress, gpsError,
    startNavigation, stopNavigation,
  } = useNavigation({ mapRef, speak: smartSpeak });

  useEffect(() => {
    fetchData();
    setRole(localStorage.getItem('role'));
  }, []);

  const fetchData = async () => {
    try {
      const [locRes, parkRes] = await Promise.all([
        api.get('/locations'),
        api.get('/parking'),
      ]);
      setLocations(locRes.data);
      setParkings(parkRes.data);
    } catch (e) { console.error(e); }
  };

  const sortedPlaces = (() => {
    let list = activeTab === 'places' ? locations : parkings;
    if (activeTab === 'places' && category !== 'all') {
      list = list.filter(item => item.category === category);
    }
    if (userPos && list.length > 0) {
      return [...list].sort((a, b) => {
        const distA = haversineMetres(userPos, { lat: +a.latitude, lng: +a.longitude });
        const distB = haversineMetres(userPos, { lat: +b.latitude, lng: +b.longitude });
        return distA - distB;
      });
    }
    return list;
  })();

  const categories = [
    { id: 'all', label: 'Barchasi', icon: '📍', color: '#FF4D6D' },
    { id: 'park', label: 'Parklar', icon: '🌳', color: '#00C896' },
    { id: 'restaurant', label: 'Ovqatlanish', icon: '🍲', color: '#FFAA00' },
    { id: 'mosque', label: 'Masjid', icon: '🕌', color: '#00A3FF' },
    { id: 'ablution', label: 'Tahoratxona', icon: '💧', color: '#00D1FF' },
    { id: 'attraction', label: 'Atraksion', icon: '🎡', color: '#9D50BB' },
    { id: 'ice_cream', label: 'Muzqaymoq', icon: '🍦', color: '#F8A5C2' },
    { id: 'photo', label: 'Chiroyli joylar', icon: '📸', color: '#6D5DFE' },
    { id: 'shopping', label: 'Do\'kon', icon: '🛒', color: '#778CA3' },
  ];

  const handleGo = async (dest) => {
    setSelected(null);
    let targetLat = +dest.latitude;
    let targetLng = +dest.longitude;
    let label = typeof dest.name === 'object' ? (dest.name[lang] || dest.name.uz) : dest.name;

    if (dest.type === 'parking') {
      try {
        const { data: slots } = await api.get(`/slots?parkingId=${dest.id}&status=free`);
        const gpsSlot = slots.find(s => s.latitude && s.longitude);
        if (gpsSlot) {
          targetLat = +gpsSlot.latitude;
          targetLng = +gpsSlot.longitude;
          label = `${typeof dest.name === 'object' ? (dest.name[lang] || dest.name.uz) : dest.name} — ${gpsSlot.slotNumber}`;
        }
      } catch (_) { }
    }
    startNavigation({ lat: targetLat, lng: targetLng }, label);
  };

  const handleStop = () => {
    stopNavigation();
    stop();
    setMessage(t.navStopped);
    setStepsOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate('/tourist');
    window.location.reload();
  };

  if (loadError) return <div className="p-8 text-gray-800">Xarita yuklashda xato</div>;
  if (!isLoaded) return <div className="p-8 text-gray-800">Yuklanmoqda...</div>;

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden">

      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={userPos || NAMANGAN}
        zoom={14}
        onLoad={m => { mapRef.current = m; }}
        options={{ styles: lightMapStyle, disableDefaultUI: true, gestureHandling: 'greedy' }}
      >
        {userPos && (
          <Marker position={userPos} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#4A90E2', fillOpacity: 1, strokeColor: '#FFF', strokeWeight: 3 }} />
        )}

        {parkings.map(p => (
          <Marker
            key={`pk-${p.id}`}
            position={{ lat: +p.latitude, lng: +p.longitude }}
            label={{ text: 'P', color: '#FFF', fontWeight: 'bold' }}
            onClick={() => { 
                const name = typeof p.name === 'object' ? (p.name[lang] || p.name.uz) : p.name;
                setSelected({ ...p, type: 'parking' }); 
                smartSpeak(`${name}. ${p.freeSlots} ta bo'sh.`); 
            }}
          />
        ))}

        {!isNavigating && locations.map(l => (
          <Marker
            key={`poi-${l.id}`}
            position={{ lat: +l.latitude, lng: +l.longitude }}
            onClick={() => { 
                const name = typeof l.name === 'object' ? (l.name[lang] || l.name.uz) : l.name;
                setSelected({ ...l, type: 'place' }); 
                smartSpeak(name); 
            }}
            icon={{ path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 8, fillColor: '#FF4D6D', fillOpacity: 1, strokeColor: '#FFF', strokeWeight: 2 }}
          />
        ))}
      </GoogleMap>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Combined Top Bar */}
          <div className="flex justify-end pointer-events-auto">
            <div className="glass-card p-1.5 flex items-center gap-3 shadow-xl">
              {/* Language Switcher */}
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {['uz', 'en', 'ru'].map(l => (
                  <button key={l} onClick={() => { setLang(l); localStorage.setItem('appLang', l); window.location.reload(); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                {role ? (
                  <>
                    <button onClick={() => navigate(role === 'super_admin' ? '/super-admin' : '/admin')} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                      {t.panel}
                    </button>
                    <button onClick={handleLogout} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Chiqish">
                      <LogOut size={20} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                    <span>{t.login || 'Kirish'}</span>
                    <User size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Voice Assistant Greeting */}
          <div className="pointer-events-auto">
            <div className="glass-card p-5 md:p-7 flex items-center gap-6 shadow-2xl border-b-8 border-rose-500/30 animate-slide-down">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-20 animate-pulse" />
                <div className="relative bg-rose-500 text-white p-5 rounded-full shadow-lg shadow-rose-500/40 transform hover:scale-110 transition-all">
                  <Mic size={32} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {message}
                </p>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-300 mt-2">Ovozli yordamchi faol</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Overlay */}
      {isNavigating && (
        <div className="fixed top-24 left-4 right-4 z-50 pointer-events-auto">
          <div className="max-w-xl mx-auto glass-card overflow-hidden">
            <div className="h-1 bg-gray-100"><div className="h-1 bg-blue-500" style={{ width: `${progress}%` }} /></div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1 text-blue-500"><Route size={18} /><span className="font-black">{summary?.distance}</span></div>
                <div className="flex items-center gap-1 text-gray-400"><Clock size={16} /><span className="text-sm">{summary?.duration}</span></div>
              </div>
              <button onClick={handleStop} className="p-2 bg-red-50/50 text-red-500 rounded-xl"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sidebar UI */}
      {!isNavigating && (
        <div className="fixed bottom-0 left-0 right-0 md:top-24 md:left-4 md:w-96 z-30 p-4 space-y-3 pointer-events-auto">
          {selected && (
            <div className="glass-card p-5 animate-slide-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-800">
                    {typeof selected.name === 'object' ? (selected.name[lang] || selected.name.uz) : selected.name}
                  </h3>
                  <p className="text-xs text-gray-400 uppercase font-bold">{selected.type === 'parking' ? t.parking : '📍 Joy'}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 bg-gray-50 rounded-lg"><X size={16} /></button>
              </div>
              <button onClick={() => handleGo(selected)} className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-3"><Navigation size={22} /> {t.go}</button>
            </div>
          )}

          <div className="glass-card p-1.5 flex gap-1.5">
            <button onClick={() => { setActiveTab('places'); setSelected(null); }} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'places' ? 'bg-festival-pink text-white shadow-lg shadow-festival-pink/20' : 'text-gray-400'}`}>{t.places}</button>
            <button onClick={() => { setActiveTab('parking'); setSelected(null); }} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'parking' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400'}`}>{t.parking}</button>
          </div>

          {activeTab === 'places' && !selected && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap font-bold text-[11px] transition-all border ${category === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {!selected && (
            <div className="glass-card overflow-y-auto max-h-[40vh] md:max-h-[60vh] divide-y divide-gray-100 no-scrollbar">
              {sortedPlaces.map(item => (
                <button key={item.id} onClick={() => setSelected({ ...item, type: activeTab === 'places' ? 'place' : 'parking' })}
                  className="w-full p-4 hover:bg-gray-50 transition-all text-left flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Compass className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-800 truncate">
                      {typeof item.name === 'object' ? (item.name[lang] || item.name.uz) : item.name}
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${activeTab === 'parking' ? (Number(item.freeSlots) > 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`}>
                      {activeTab === 'parking' ? (Number(item.freeSlots) > 0 ? `${item.freeSlots} bo'sh` : t.full) : (item.category || 'Joy')}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-200" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isNavigating && (
        <button onClick={fetchData} className="absolute bottom-4 right-4 z-20 bg-white shadow-xl p-3 rounded-full border border-gray-100 pointer-events-auto" style={{ marginBottom: '280px' }}>
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      )}
    </div>
  );
}
