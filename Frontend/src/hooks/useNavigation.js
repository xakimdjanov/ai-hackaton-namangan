import { useState, useEffect, useRef, useCallback } from 'react';

const REROUTE_THRESHOLD_M   = 60;
const STEP_ARRIVE_THRESHOLD_M = 30;

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

function pointToSegmentDist(p, a, b) {
  const dx = b.lat - a.lat, dy = b.lng - a.lng;
  if (dx === 0 && dy === 0) return haversineMetres(p, a);
  const t = Math.max(0, Math.min(1, ((p.lat - a.lat) * dx + (p.lng - a.lng) * dy) / (dx * dx + dy * dy)));
  return haversineMetres(p, { lat: a.lat + t * dx, lng: a.lng + t * dy });
}

function directionEmoji(type) {
  const i = type.toLowerCase();
  if (i.includes('left'))      return '↰';
  if (i.includes('right'))     return '↱';
  if (i.includes('u-turn'))    return '↩';
  if (i.includes('roundabout'))return '🔄';
  if (i.includes('arrive'))    return '🏁';
  return '↑';
}

export default function useNavigation({ mapRef, speak }) {
  const [userPos, setUserPos]           = useState(null);
  const [route, setRoute]               = useState(null);
  const [steps, setSteps]               = useState([]);
  const [stepIndex, setStepIndex]       = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [summary, setSummary]           = useState(null);
  const [gpsError, setGpsError]         = useState(null);

  const watchIdRef        = useRef(null);
  const rendererRef       = useRef(null);
  const destinationRef    = useRef(null);
  const isReroutingRef    = useRef(false);
  const lastSpokenIdx     = useRef(-1);
  const osrmPathRef       = useRef([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS qo'llab-quvvatlanmaydi.");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      (err) => setGpsError(`GPS Xatosi: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  const calculateRoute = useCallback(async (origin, destination, mode = 'driving') => {
    if (!origin || !destination) return;
    const osrmMode = mode === 'walking' ? 'foot' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?steps=true&overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) {
        if (mode === 'driving') return calculateRoute(origin, destination, 'walking');
        speak && speak("Yo'nalish topilmadi.");
        return;
      }

      const route = data.routes[0];
      const leg = route.legs[0];
      const distM = Math.round(route.distance);
      const distText = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`;
      const durText = `${Math.floor(route.duration / 60)} daqiqa`;

      if (window.google && mapRef.current) {
        if (rendererRef.current) rendererRef.current.setMap(null);
        const coords = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
        const poly = new window.google.maps.Polyline({
          path: coords, strokeColor: '#4A90E2', strokeWeight: 6, strokeOpacity: 0.92, map: mapRef.current
        });
        rendererRef.current = { setMap: (m) => poly.setMap(m) };
        const bounds = new window.google.maps.LatLngBounds();
        coords.forEach(c => bounds.extend(c));
        mapRef.current.fitBounds(bounds, { top: 100, bottom: 220, left: 40, right: 40 });
      }

      const parsed = (leg.steps || []).map((s, i) => ({
        idx: i,
        instruction: s.maneuver?.instruction || s.name || `${i + 1}-qadam`,
        emoji: directionEmoji(s.maneuver?.type || ''),
        distanceM: Math.round(s.distance),
        distanceText: s.distance >= 1000 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`,
        endLat: s.maneuver.location[1],
        endLng: s.maneuver.location[0],
      }));

      osrmPathRef.current = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setRoute(data);
      setSteps(parsed);
      setStepIndex(0);
      setSummary({ distance: distText, duration: durText });
      setIsNavigating(true);
      isReroutingRef.current = false;
    } catch (err) {
      if (mode === 'driving') calculateRoute(origin, destination, 'walking');
    }
  }, [mapRef, speak]);

  const startNavigation = useCallback((destination) => {
    destinationRef.current = destination;
    if (userPos) calculateRoute(userPos, destination);
    else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(loc);
          calculateRoute(loc, destination);
        },
        () => speak && speak('GPS aniqlanmadi.'),
        { enableHighAccuracy: true }
      );
    }
  }, [userPos, calculateRoute, speak]);

  const stopNavigation = useCallback(() => {
    if (rendererRef.current) rendererRef.current.setMap(null);
    setIsNavigating(false);
    setRoute(null);
    setSteps([]);
    setSummary(null);
    destinationRef.current = null;
    isReroutingRef.current = false;
    lastSpokenIdx.current = -1;
  }, []);

  useEffect(() => {
    if (!isNavigating || !userPos || steps.length === 0) return;
    const currentStep = steps[stepIndex];
    if (!currentStep) return;

    if (mapRef.current) mapRef.current.panTo(userPos);

    if (stepIndex !== lastSpokenIdx.current) {
      lastSpokenIdx.current = stepIndex;
      const isLast = stepIndex === steps.length - 1;
      const lang = localStorage.getItem('appLang') || 'uz';
      const msg = isLast ? "Yetib keldingiz." : `${currentStep.instruction}. ${currentStep.distanceText} keyin.`;
      speak && speak(msg, lang);
    }

    const distToStepEnd = haversineMetres(userPos, { lat: currentStep.endLat, lng: currentStep.endLng });
    if (distToStepEnd < STEP_ARRIVE_THRESHOLD_M) {
      if (stepIndex < steps.length - 1) setStepIndex(prev => prev + 1);
      else stopNavigation();
    }

    if (!isReroutingRef.current && osrmPathRef.current.length > 1) {
      const path = osrmPathRef.current;
      let minDist = Infinity;
      for (let i = 0; i < path.length - 1; i++) {
        const d = pointToSegmentDist(userPos, path[i], path[i+1]);
        if (d < minDist) minDist = d;
      }
      if (minDist > REROUTE_THRESHOLD_M) {
        isReroutingRef.current = true;
        calculateRoute(userPos, destinationRef.current);
      }
    }
  }, [userPos, isNavigating, steps, stepIndex, mapRef, speak, stopNavigation, calculateRoute]);

  const currentStep = steps[stepIndex] || null;
  const progress = steps.length > 0 ? Math.round((stepIndex / steps.length) * 100) : 0;

  return {
    userPos, isNavigating, route, steps, stepIndex, currentStep,
    summary, progress, gpsError, startNavigation, stopNavigation,
  };
}
