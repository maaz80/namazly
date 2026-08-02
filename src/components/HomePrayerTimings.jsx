import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineLocationMarker, 
  HiOutlinePencil, 
  HiOutlineChevronRight, 
  HiX,
  HiOutlineClock
} from 'react-icons/hi';
import { TbCurrentLocation } from 'react-icons/tb';

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_LABELS = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
};

const PRAYER_ICONS = {
  Fajr: '🌅',
  Sunrise: '☀️',
  Dhuhr: '☀️',
  Asr: '🌥️',
  Maghrib: '🌆',
  Isha: '🌌',
};

// Helper: Convert "18:45" or "05:12" to "6:45 PM" / "5:12 AM"
function format12Hour(timeStr) {
  if (!timeStr) return '';
  const clean = timeStr.split(' ')[0];
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// Parse "HH:MM" relative to a base date
function parsePrayerTime(timeStr, baseDate = new Date()) {
  const clean = timeStr.split(' ')[0];
  const [hours, minutes] = clean.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function HomePrayerTimings() {
  const navigate = useNavigate();

  // Location state
  const [city, setCity] = useState(() => localStorage.getItem('namazly_city') || 'Jaunpur');
  const [country, setCountry] = useState(() => localStorage.getItem('namazly_country') || 'India');
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('namazly_coords');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal / Location Edit state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editCity, setEditCity] = useState(city);
  const [editCountry, setEditCountry] = useState(country);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  // Timings & Meta state
  const [timings, setTimings] = useState(() => {
    const cached = localStorage.getItem('namazly_cached_timings');
    return cached ? JSON.parse(cached) : null;
  });
  const [hijriDate, setHijriDate] = useState(() => localStorage.getItem('namazly_cached_hijri') || '');
  const [loading, setLoading] = useState(!timings);

  // Real-time prayer state: { nextPrayer, currentPrayer, diffMs, countdownStr }
  const [prayerState, setPrayerState] = useState(null);

  // Fetch timings function
  const fetchTimings = useCallback(async (targetCity = city, targetCountry = country, latLon = coords) => {
    setLoading(true);
    try {
      let url = '';
      if (latLon && latLon.lat && latLon.lon) {
        url = `https://api.aladhan.com/v1/timings?latitude=${latLon.lat}&longitude=${latLon.lon}&method=1&school=1`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(targetCity)}&country=${encodeURIComponent(targetCountry)}&method=1&school=1`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.code === 200) {
        const fetchedTimings = data.data.timings;
        setTimings(fetchedTimings);
        localStorage.setItem('namazly_cached_timings', JSON.stringify(fetchedTimings));

        // Hijri date parsing
        if (data.data.date?.hijri) {
          const h = data.data.date.hijri;
          const hStr = `${h.day} ${h.month.en} ${h.year} AH`;
          setHijriDate(hStr);
          localStorage.setItem('namazly_cached_hijri', hStr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prayer timings:', err);
    } finally {
      setLoading(false);
    }
  }, [city, country, coords]);

  // Initial fetch
  useEffect(() => {
    fetchTimings();
  }, [fetchTimings]);

  // Real-time calculation loop
  useEffect(() => {
    if (!timings) return;

    const updateTimer = () => {
      const now = new Date();
      const parsed = PRAYER_KEYS.map((key) => ({
        key,
        time: parsePrayerTime(timings[key], now),
      }));

      parsed.sort((a, b) => a.time - b.time);

      let nextIndex = parsed.findIndex((p) => p.time > now);
      let current = null;
      let next = null;

      if (nextIndex === -1) {
        current = parsed[parsed.length - 1]; // Isha
        next = {
          key: 'Fajr',
          time: new Date(parsed[0].time.getTime() + 24 * 60 * 60 * 1000),
        };
      } else if (nextIndex === 0) {
        current = {
          key: 'Isha',
          time: new Date(parsed[parsed.length - 1].time.getTime() - 24 * 60 * 60 * 1000),
        };
        next = parsed[0];
      } else {
        current = parsed[nextIndex - 1];
        next = parsed[nextIndex];
      }

      const diffMs = next.time - now;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hPad = String(hours).padStart(2, '0');
      const mPad = String(minutes).padStart(2, '0');
      const sPad = String(seconds).padStart(2, '0');

      setPrayerState({
        currentKey: current ? current.key : null,
        nextKey: next ? next.key : null,
        diffMs,
        countdownStr: `${hPad}h ${mPad}m ${sPad}s`,
        shortCountdownStr: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timings]);

  // Handle location update form submit
  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!editCity.trim()) return;
    const newCity = editCity.trim();
    const newCountry = editCountry.trim() || 'India';

    setCity(newCity);
    setCountry(newCountry);
    setCoords(null);

    localStorage.setItem('namazly_city', newCity);
    localStorage.setItem('namazly_country', newCountry);
    localStorage.removeItem('namazly_coords');

    fetchTimings(newCity, newCountry, null);
    setIsLocationModalOpen(false);
  };

  // Handle Geolocation auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latLon = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(latLon);
        localStorage.setItem('namazly_coords', JSON.stringify(latLon));

        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latLon.lat}&longitude=${latLon.lon}&localityLanguage=en`
          );
          const revData = await revRes.json();
          if (revData && (revData.city || revData.locality)) {
            const detectedCity = revData.city || revData.locality;
            const detectedCountry = revData.countryName || country;
            setCity(detectedCity);
            setCountry(detectedCountry);
            setEditCity(detectedCity);
            setEditCountry(detectedCountry);
            localStorage.setItem('namazly_city', detectedCity);
            localStorage.setItem('namazly_country', detectedCountry);
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
        }

        fetchTimings(city, country, latLon);
        setLocLoading(false);
        setIsLocationModalOpen(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocError('Unable to retrieve location. Please type your city manually.');
        setLocLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="w-full">
      {/* Ultra Compact Minimalist Glass Card */}
      <div className="glass-card rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-md border border-white/80 transition-all duration-200 relative overflow-hidden">
        
        {/* Top Mini Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-sage-100/50 text-xs">
          
          {/* Location & Hijri Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => {
                setEditCity(city);
                setEditCountry(country);
                setLocError('');
                setIsLocationModalOpen(true);
              }}
              title="Change location"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-100/80 hover:bg-sage-200 transition-colors text-sage-800 poppins-regular font-semibold cursor-pointer border-0 text-[11px]"
            >
              <HiOutlineLocationMarker className="w-3 h-3 text-sage-600 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{city}</span>
              <HiOutlinePencil className="w-2.5 h-2.5 text-sage-500 opacity-70 shrink-0" />
            </button>

            {hijriDate && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-sage-700 bg-amber-50/70 border border-amber-200/50 px-2 py-0.5 rounded-full">
                🌙 {hijriDate}
              </span>
            )}
          </div>

          {/* Active Countdown & Full Timings Link */}
          <div className="flex items-center gap-2 shrink-0">
            {prayerState && prayerState.nextKey && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-700 text-white text-[11px] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="poppins-regular font-medium">
                  <strong>{PRAYER_LABELS[prayerState.nextKey]}</strong> in{' '}
                  <span className="font-mono font-bold">{prayerState.shortCountdownStr}</span>
                </span>
              </div>
            )}

            <button
              onClick={() => navigate('/timings')}
              className="flex items-center gap-0.5 text-[11px] font-semibold text-sage-700 hover:text-sage-900 transition-colors cursor-pointer bg-transparent border-0 px-1 py-0.5"
              aria-label="Full Timings"
            >
              <span className="hidden xs:inline">Timings</span>
              <HiOutlineChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 6 Ultra-Compact Prayer Tiles Strip */}
        {loading && !timings ? (
          <div className="flex items-center justify-center py-3">
            <div className="w-4 h-4 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
            <span className="ml-2 text-[11px] text-sage-600 font-medium">Loading timings…</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2">
            {PRAYER_KEYS.map((key) => {
              const rawTime = timings ? timings[key] : '';
              const time12 = format12Hour(rawTime);
              const isNext = prayerState?.nextKey === key;
              const isCurrent = prayerState?.currentKey === key;

              return (
                <div
                  key={key}
                  className={`rounded-xl p-2 sm:p-2.5 text-center transition-all duration-200 flex flex-col justify-between items-center relative ${
                    isNext
                      ? 'bg-gradient-to-b from-sage-600 to-sage-700 text-white shadow-sm scale-[1.02] ring-1 ring-sage-400 z-10'
                      : isCurrent
                      ? 'bg-sage-100/90 text-sage-900 border border-sage-200/80 shadow-xs'
                      : 'bg-white/50 hover:bg-white/80 text-sage-800 border border-white/70 shadow-xs'
                  }`}
                >
                  {isNext && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-sage-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs leading-none tracking-wider">
                      NEXT
                    </span>
                  )}

                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-xs sm:text-sm">{PRAYER_ICONS[key]}</span>
                    <span
                      className={`poppins-regular text-xs sm:text-[11px] font-semibold truncate ${
                        isNext ? 'text-sage-100' : 'text-sage-700'
                      }`}
                    >
                      {PRAYER_LABELS[key]}
                    </span>
                  </div>

                  <p
                    className={`poppins-regular text-xs sm:text-xs font-bold tracking-tight mt-1 leading-tight ${
                      isNext ? 'text-white' : 'text-sage-900'
                    }`}
                  >
                    {time12 || '--:--'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Location Edit Modal */}
      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(31,67,54,0.3)', backdropFilter: 'blur(8px)' }}
        >
          <div className="glass-card rounded-3xl p-5 max-w-xs w-full shadow-2xl animate-scale-in border border-white/80">
            <div className="flex items-center justify-between pb-2.5 border-b border-sage-100/60 mb-3">
              <h3 className="poppins-regular text-sm font-bold text-sage-900 flex items-center gap-1.5">
                <HiOutlineLocationMarker className="text-sage-600" />
                <span>Change Location</span>
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-sage-400 hover:text-sage-700 transition-colors bg-transparent border-0 cursor-pointer"
                aria-label="Close"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-sage-700 mb-1">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Jaunpur, Mumbai, London"
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-white/80 text-sage-900 text-xs poppins-regular focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sage-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  placeholder="e.g. India, UK, USA"
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-white/80 text-sage-900 text-xs poppins-regular focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              {locError && (
                <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {locError}
                </p>
              )}

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl font-semibold text-white text-xs bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 shadow-sm transition-all active:scale-95 cursor-pointer border-0"
                >
                  Save Location
                </button>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locLoading}
                  className="w-full py-2 rounded-xl font-semibold text-sage-700 text-xs bg-white/80 hover:bg-white border border-sage-200 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {locLoading ? (
                    <span className="w-3 h-3 border-2 border-sage-400 border-t-sage-700 rounded-full animate-spin" />
                  ) : (
                    <TbCurrentLocation className="w-3.5 h-3.5 text-sage-600" />
                  )}
                  <span>Detect My Location (GPS)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
