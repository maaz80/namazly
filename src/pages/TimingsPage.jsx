import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

/* Decorative background orbs */
const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 20% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle at 80% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

const PRAYER_NAMES = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha'
};

const PRAYER_ICONS = {
  Fajr: '🌅',
  Sunrise: '☀️',
  Dhuhr: '☀️',
  Asr: '🌥️',
  Maghrib: '🌆',
  Isha: '🌌'
};

const parsePrayerTime = (timeStr, baseDate = new Date()) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export default function TimingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Location states
  const [city, setCity] = useState(() => localStorage.getItem('namazly_city') || 'Mumbai');
  const [country, setCountry] = useState(() => localStorage.getItem('namazly_country') || 'India');
  const [searchCity, setSearchCity] = useState(city);
  const [searchCountry, setSearchCountry] = useState(country);
  const [usingCoords, setUsingCoords] = useState(false);

  // Timings from API
  const [timings, setTimings] = useState(null);
  const [meta, setMeta] = useState(null);

  // Real-time calculation states
  const [prayerState, setPrayerState] = useState(null);
  const timerRef = useRef(null);

  usePageMeta(
    'Daily Namaz Timings — Namazly | Real-time Prayer Schedule',
    'Get precise, location-based daily prayer times, dynamic remaining countdowns, and automatic geolocation updates.',
    '/timings'
  );

  // Fetch timings by Coords or City/Country
  const fetchTimings = async (lat = null, lon = null) => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (lat !== null && lon !== null) {
        url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.code === 200) {
        setTimings(data.data.timings);
        setMeta(data.data.meta);
        if (lat !== null && lon !== null) {
          setUsingCoords(true);
          // try parsing location details if available from API metadata
          const localCity = data.data.meta.timezone?.split('/').pop()?.replace('_', ' ') || 'Local Coordinates';
          setCity(localCity);
          setSearchCity(localCity);
        } else {
          setUsingCoords(false);
          localStorage.setItem('namazly_city', city);
          localStorage.setItem('namazly_country', country);
        }
      } else {
        setError('Could not retrieve prayer times. Please verify the city name.');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Attempt Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchTimings(latitude, longitude);
        },
        () => {
          // If denied, fetch by pre-saved or default City/Country
          fetchTimings();
        }
      );
    } else {
      fetchTimings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate countdown and active prayer in real-time
  useEffect(() => {
    if (!timings) return;

    const updateTimer = () => {
      const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const now = new Date();
      
      // Parse timings
      const parsedTimes = PRAYER_KEYS.map(key => {
        const timeStr = timings[key];
        return {
          key,
          time: parsePrayerTime(timeStr, now)
        };
      });

      parsedTimes.sort((a, b) => a.time - b.time);

      let nextIndex = parsedTimes.findIndex(p => p.time > now);
      let current = null;
      let next = null;

      if (nextIndex === -1) {
        current = parsedTimes[parsedTimes.length - 1]; // Isha
        next = {
          key: 'Fajr',
          time: new Date(parsedTimes[0].time.getTime() + 24 * 60 * 60 * 1000)
        };
      } else if (nextIndex === 0) {
        current = {
          key: 'Isha',
          time: new Date(parsedTimes[parsedTimes.length - 1].time.getTime() - 24 * 60 * 60 * 1000)
        };
        next = parsedTimes[0];
      } else {
        current = parsedTimes[nextIndex - 1];
        next = parsedTimes[nextIndex];
      }

      const diffMs = next.time - now;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const countdownStr = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');

      setPrayerState({
        currentPrayer: current.key,
        nextPrayer: next.key,
        countdown: countdownStr
      });
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [timings]);

  // Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    setCity(searchCity);
    setCountry(searchCountry);
  };

  // Re-fetch when city/country values are committed
  useEffect(() => {
    if (loading) return; // avoid double fetch on init
    fetchTimings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, country]);

  // Get current location from coordinates button
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimings(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Location permission was denied by browser.');
          setLoading(false);
        }
      );
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">Daily Namaz Timings</span>
          
          <div className="w-10" />
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 w-full space-y-6">

        {/* Top Header Card */}
        <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="text-center md:text-left">
            <h1 className="poppins-regular text-2xl sm:text-3xl font-bold text-sage-900 leading-tight">
              {city}
            </h1>
            <p className="poppins-regular text-sage-500 font-semibold mt-0.5 text-xs sm:text-sm flex items-center justify-center md:justify-start gap-1">
              <span>📍</span>
              <span>{usingCoords ? 'Auto-detected via GPS' : `${city}, ${country}`}</span>
            </p>
          </div>

          <button
            onClick={handleUseLocation}
            className="px-4 py-2 rounded-xl glass-card border border-white/80 text-xs font-semibold text-sage-700 hover:bg-white/95 hover:text-sage-900 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎯</span>
            <span>Use GPS Location</span>
          </button>
        </section>

        {/* Countdown banner & Search section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Real-time Countdown Banner (Columns 1 & 2) */}
          <section className="lg:col-span-2 w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 h-full text-center sm:text-left bg-gradient-to-br from-sage-50/50 via-white/50 to-cream-50/30">
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
                  Upcoming Prayer
                </span>
                <h2 className="poppins-regular text-3xl font-black text-sage-900">
                  {prayerState ? prayerState.nextPrayer : '...'}
                </h2>
                <p className="poppins-regular text-xs text-sage-500">
                  Current active prayer period: <span className="font-semibold text-sage-700">{prayerState ? prayerState.currentPrayer : '...'}</span>
                </p>
              </div>

              {/* Glowing countdown circle */}
              <div className="flex flex-col items-center justify-center glass-card-deep border border-white/85 rounded-full w-32 h-32 sm:w-36 sm:h-36 shadow-lg shadow-sage-600/5 border-sage-200/30 relative">
                <span className="poppins-regular text-2xl sm:text-3xl font-black gradient-text tracking-tight tabular-nums">
                  {prayerState ? prayerState.countdown : '00:00:00'}
                </span>
                <span className="poppins-regular text-[9px] font-semibold text-sage-400 uppercase tracking-widest mt-1">
                  Remaining
                </span>
                {/* Micro animation glow dot */}
                <span className="absolute top-3 right-8 w-2 h-2 rounded-full bg-gold-400 animate-ping" />
              </div>
            </div>
          </section>

          {/* Location Manual Search (Column 3) */}
          <section className="lg:col-span-1 w-full animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between h-full">
              <div>
                <h3 className="poppins-regular text-sm font-bold text-sage-900 flex items-center gap-1.5 mb-1">
                  <span>🔍</span>
                  <span>Search Prayer Times</span>
                </h3>
                <p className="poppins-regular text-[11px] text-sage-400 mb-3">
                  Enter any global city to fetch accurate local timings.
                </p>
                <form onSubmit={handleSearchSubmit} className="space-y-2.5">
                  <div>
                    <label htmlFor="search-city" className="sr-only">City</label>
                    <input
                      id="search-city"
                      type="text"
                      placeholder="City (e.g. London)"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="search-country" className="sr-only">Country</label>
                    <input
                      id="search-country"
                      type="text"
                      placeholder="Country (e.g. United Kingdom)"
                      value={searchCountry}
                      onChange={(e) => setSearchCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer border-0"
                  >
                    Fetch Timings
                  </button>
                </form>
              </div>
            </div>
          </section>

        </div>

        {/* Timings List Card */}
        <section className="animate-slide-up w-full" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-sm">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-sage-300 border-t-sage-600 animate-spin" />
                <p className="poppins-regular text-sage-500 text-xs">Fetching prayer times…</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-rose-500 poppins-regular text-sm space-y-2">
                <p className="text-2xl">⚠️</p>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => fetchTimings()}
                  className="px-4 py-1.5 rounded-xl glass-card text-xs text-sage-700 hover:bg-white border border-white mt-2 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Column Headers for larger screens */}
                <div className="hidden sm:grid sm:grid-cols-3 px-4 py-2 text-xs font-bold text-sage-400 uppercase tracking-widest border-b border-sage-100/60 pb-3">
                  <span>Prayer</span>
                  <span className="text-center">Start Time</span>
                  <span className="text-right">Status</span>
                </div>

                {/* Prayers Schedule */}
                <div className="divide-y divide-sage-100/40">
                  {Object.keys(PRAYER_NAMES).map((key) => {
                    const name = PRAYER_NAMES[key];
                    const rawTime = timings?.[key];
                    if (!rawTime) return null;

                    // Clean time string for display (strip 24-hr layout offset details)
                    const displayTime = rawTime.split(' ')[0];

                    const isCurrent = prayerState?.currentPrayer === key;
                    const isNext = prayerState?.nextPrayer === key;

                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-2 sm:grid-cols-3 items-center px-4 py-3.5 sm:py-4 transition-all duration-200
                          ${isCurrent 
                            ? 'bg-sage-600/10 border-l-4 border-sage-500 rounded-lg sm:rounded-xl shadow-sm'
                            : 'hover:bg-white/10'
                          }
                        `}
                      >
                        {/* Name & Icon */}
                        <div className="flex items-center gap-3">
                          <span className="text-xl sm:text-2xl filter drop-shadow-sm leading-none">
                            {PRAYER_ICONS[key] || '🕌'}
                          </span>
                          <div className="text-left">
                            <h3 className={`poppins-regular text-sm font-semibold text-sage-900`}>
                              {name}
                            </h3>
                            <p className="text-[10px] text-sage-400 sm:hidden">Start time</p>
                          </div>
                        </div>

                        {/* Start Time */}
                        <div className="text-right sm:text-center">
                          <span className="poppins-regular text-sm font-bold text-sage-800 tabular-nums">
                            {displayTime}
                          </span>
                        </div>

                        {/* Status (Large screens) or badges */}
                        <div className="hidden sm:flex items-center justify-end">
                          {isCurrent ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-200 text-sage-800 font-bold text-[10px] tracking-wider uppercase poppins-regular animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
                              Active Now
                            </span>
                          ) : isNext ? (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] tracking-wider uppercase poppins-regular">
                              ⏳ Up Next
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest poppins-regular">
                              Completed
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Location API reference and date info */}
                <div className="pt-4 border-t border-sage-100/60 flex flex-col sm:flex-row justify-between items-center text-[10px] text-sage-400 gap-2">
                  <p>Gregorian Date: <span className="font-semibold text-sage-500">{meta?.date?.gregorian?.date}</span> &bull; Hijri: <span className="font-semibold text-sage-500">{meta?.date?.hijri?.day} {meta?.date?.hijri?.month?.en} {meta?.date?.hijri?.year} AH</span></p>
                  <p>Calculation Method: <span className="font-semibold text-sage-500">{meta?.method?.name || 'Standard Islamic'}</span></p>
                </div>

              </div>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-sage-400 poppins-regular mt-4">
        <p>Namazly &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
