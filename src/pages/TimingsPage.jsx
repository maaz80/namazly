import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

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

const CALCULATION_METHODS = [
  { id: '1', name: 'University of Islamic Sciences, Karachi (South Asia)' },
  { id: '2', name: 'Islamic Society of North America (ISNA)' },
  { id: '3', name: 'Muslim World League (MWL)' },
  { id: '4', name: 'Umm Al-Qura University, Makkah' },
  { id: '5', name: 'Egyptian General Authority of Survey' },
  { id: '7', name: 'Institute of Geophysics, University of Tehran' },
  { id: '8', name: 'Gulf Region' },
  { id: '9', name: 'Kuwait' },
  { id: '10', name: 'Qatar' },
  { id: '11', name: 'Majlis Ugama Islam Singapura' },
  { id: '12', name: 'Union Organization islamique de France' },
  { id: '13', name: 'Diyanet İşleri Başkanlığı (Turkey)' },
  { id: '14', name: 'Spiritual Administration of Muslims of Russia' },
  { id: '15', name: 'Moonsighting Committee Worldwide' }
];

const SCHOOLS = [
  { id: '0', name: 'Standard (Shafi\'i, Maliki, Hanbali)' },
  { id: '1', name: 'Hanafi' }
];

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
  const [city, setCity] = useState(() => localStorage.getItem('namazly_city') || 'Jaunpur');
  const [stateName, setStateName] = useState(() => localStorage.getItem('namazly_state') || 'Uttar Pradesh');
  const [country, setCountry] = useState(() => localStorage.getItem('namazly_country') || 'India');
  const [usingCoords, setUsingCoords] = useState(false);
  const [coords, setCoords] = useState(null);

  // Dropdown / Form selection states
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedState, setSelectedState] = useState(stateName);
  const [selectedCity, setSelectedCity] = useState(city);

  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [customState, setCustomState] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Country, State, City fetching lists
  const [countriesList, setCountriesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Timing Calculation states
  const [method, setMethod] = useState(() => localStorage.getItem('namazly_timing_method') || '1');
  const [school, setSchool] = useState(() => localStorage.getItem('namazly_timing_school') || '1');

  // Timings from API
  const [timings, setTimings] = useState(null);
  const [meta, setMeta] = useState(null);

  // Real-time calculation states
  const [prayerState, setPrayerState] = useState(null);
  const timerRef = useRef(null);
  const lastFetchedRef = useRef({ city: '', country: '', method: '', school: '', lat: null, lon: null });

  usePageMeta(
    `Today Namaz Timing & Prayer Timings (${city}) — Live Daily Schedule | Namazly`,
    `Check today's accurate Namaz timing and prayer timings for Fajr, Dhuhr, Asr, Maghrib & Isha in ${city}, ${country}. Live countdown, Hanafi/Shafi calculation methods & automatic GPS location updates.`,
    '/timings'
  );

  // Load all countries and states on mount
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error && resData.data) {
          const sorted = resData.data.sort((a, b) => a.name.localeCompare(b.name));
          setCountriesList(sorted);
        }
      })
      .catch(err => console.error("Error fetching countries/states list:", err));
  }, []);

  // Compute states for selected country
  const statesList = useMemo(() => {
    const found = countriesList.find(c => c.name === selectedCountry);
    if (!found || !found.states) return [];
    return [...found.states].sort((a, b) => a.name.localeCompare(b.name));
  }, [countriesList, selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCitiesList([]);
      return;
    }
    setCitiesLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country: selectedCountry,
        state: selectedState
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (!resData.error && resData.data) {
          const sorted = resData.data.sort((a, b) => a.localeCompare(b));
          setCitiesList(sorted);
        } else {
          setCitiesList([]);
        }
      })
      .catch(err => {
        console.error("Error fetching cities:", err);
        setCitiesList([]);
      })
      .finally(() => {
        setCitiesLoading(false);
      });
  }, [selectedCountry, selectedState]);

  // Automatically select first city when list changes
  useEffect(() => {
    if (citiesList.length > 0) {
      if (!citiesList.includes(selectedCity)) {
        setSelectedCity(citiesList[0]);
      }
    } else {
      setSelectedCity('');
    }
  }, [citiesList]);

  // Sync dropdown inputs when active location changes (e.g. from GPS)
  useEffect(() => {
    setSelectedCountry(country);
    setSelectedState(stateName);
    setSelectedCity(city);
  }, [city, stateName, country]);

  // Fetch timings by Coords or City/Country
  const fetchTimings = async (lat = null, lon = null, targetCity = city, targetCountry = country, forceCityName = false) => {
    const latVal = forceCityName ? null : (lat !== null ? lat : (usingCoords && coords ? coords.lat : null));
    const lonVal = forceCityName ? null : (lon !== null ? lon : (usingCoords && coords ? coords.lon : null));

    // Skip duplicate fetches
    if (
      targetCity === lastFetchedRef.current.city &&
      targetCountry === lastFetchedRef.current.country &&
      method === lastFetchedRef.current.method &&
      school === lastFetchedRef.current.school &&
      latVal === lastFetchedRef.current.lat &&
      lonVal === lastFetchedRef.current.lon &&
      timings !== null
    ) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      let url = '';
      if (latVal !== null && lonVal !== null) {
        url = `https://api.aladhan.com/v1/timings?latitude=${latVal}&longitude=${lonVal}&method=${method}&school=${school}`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(targetCity)}&country=${encodeURIComponent(targetCountry)}&method=${method}&school=${school}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.code === 200) {
        setTimings(data.data.timings);
        setMeta(data.data.meta);

        // Update ref with successfully fetched parameters
        lastFetchedRef.current = {
          city: latVal !== null ? (data.data.meta.timezone?.split('/').pop()?.replace('_', ' ') || 'Local Coordinates') : targetCity,
          country: latVal !== null ? targetCountry : targetCountry,
          method,
          school,
          lat: latVal,
          lon: lonVal
        };

        if (latVal !== null && lonVal !== null) {
          setUsingCoords(true);
          setCoords({ lat: latVal, lon: lonVal });
        } else {
          setUsingCoords(false);
          setCoords(null);
          localStorage.setItem('namazly_city', targetCity);
          localStorage.setItem('namazly_country', targetCountry);
          localStorage.setItem('namazly_state', stateName);
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

  // Fetch timings on mount
  useEffect(() => {
    fetchTimings();
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
    
    let finalCountry = '';
    let finalState = '';
    let finalCity = '';

    if (isCustomInput) {
      if (!customCountry.trim() || !customCity.trim()) return;
      finalCountry = customCountry.trim();
      finalState = customState.trim();
      finalCity = customCity.trim();
    } else {
      if (!selectedCountry || !selectedCity) return;
      finalCountry = selectedCountry;
      finalState = selectedState;
      finalCity = selectedCity;
    }

    setCountry(finalCountry);
    setStateName(finalState);
    setCity(finalCity);

    // Force fetch timings using city name search, ignoring any active coordinate/GPS mode
    fetchTimings(null, null, finalCity, finalCountry, true);
  };

  // Re-fetch when city, country, method, or school values change
  useEffect(() => {
    if (loading) return; // avoid double fetch on init
    fetchTimings(null, null, city, country);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, country, method, school]);

  // Get current location from coordinates button
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latVal = position.coords.latitude;
          const lonVal = position.coords.longitude;
          try {
            // Reverse geocode to find exact City, State, Country
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latVal}&longitude=${lonVal}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const detectedCity = geoData.city || geoData.locality || geoData.village || geoData.town || 'Local Coordinates';
            const detectedState = geoData.principalSubdivision || '';
            const detectedCountry = geoData.countryName || 'India';
            
            setCountry(detectedCountry);
            setStateName(detectedState);
            setCity(detectedCity);
            
            fetchTimings(latVal, lonVal, detectedCity, detectedCountry);
          } catch (err) {
            console.error('Error reverse geocoding:', err);
            fetchTimings(latVal, lonVal);
          }
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
            onClick={() => navigate('/')}
            aria-label="Go to Dashboard"
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
      <main id="main-content" tabIndex="-1" className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 w-full space-y-6">

        {/* ── JSON-LD Structured Data for Search Engine Crawlers ───────────────── */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://namazly.in/timings#webpage",
                "url": "https://namazly.in/timings",
                "name": `Today Namaz Timing & Prayer Timings in ${city} | Namazly`,
                "description": `Get precise today Namaz timing and daily prayer schedule for Fajr, Dhuhr, Asr, Maghrib, and Isha in ${city}, ${country}. Includes live countdown, Hanafi and Shafi calculation methods, and automatic location detection.`,
                "inLanguage": "en",
                "isPartOf": {
                  "@type": "WebSite",
                  "@id": "https://namazly.in/#website",
                  "name": "Namazly",
                  "url": "https://namazly.in/"
                }
              },
              {
                "@type": "FAQPage",
                "@id": "https://namazly.in/timings#faq",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is today's Namaz timing for my location?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Today's Namaz timing (prayer timing) varies based on your geographic location and sun position. Namazly automatically detects your city or GPS coordinates to display accurate daily start times for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What is the difference between Hanafi and Shafi Asr prayer timings?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "In the Shafi, Maliki, and Hanbali schools of thought, Asr timing begins when an object's shadow equals its height (1x shadow ratio). In the Hanafi school of jurisprudence, Asr timing begins when the shadow of an object reaches twice its height plus the shadow length at noon (2x shadow ratio)."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How are daily Namaz timings calculated?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Daily Namaz timings are calculated using astronomical solar position calculations based on zenith angles, latitude, longitude, and established Islamic calculation conventions like the University of Islamic Sciences Karachi, ISNA, MWL, and Umm Al-Qura Makkah."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What are the 5 obligatory Namaz timings in Islam?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "The five obligatory daily prayers (Salah / Namaz) are Fajr (Dawn prayer before sunrise), Dhuhr (Noon prayer after midday sun passes zenith), Asr (Late afternoon prayer), Maghrib (Sunset prayer immediately after sun sets), and Isha (Night prayer after twilight disappears)."
                    }
                  }
                ]
              }
            ]
          })}
        </script>

        {/* Top Header Card */}
        <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="text-center md:text-left">
            <h1 className="poppins-regular text-2xl sm:text-3xl font-bold text-sage-900 leading-tight">
              Today Namaz Timing &amp; Prayer Timings <span className="text-sage-600 font-medium block sm:inline text-xl sm:text-2xl">in {city}</span>
            </h1>
            <p className="poppins-regular text-sage-500 font-semibold mt-1 text-xs sm:text-sm flex items-center justify-center md:justify-start gap-1">
              <span>📍 {usingCoords ? 'Auto-detected via GPS' : `${city}, ${country}`}</span>
            </p>
          </div>

          <button
            onClick={handleUseLocation}
            className="px-4 py-2 rounded-xl glass-card border border-white/80 text-xs font-semibold text-sage-700 hover:bg-white/95 hover:text-sage-900 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
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
              <div className="flex flex-col items-center justify-center glass-card-deep border rounded-full w-32 h-32 sm:w-36 sm:h-36 shadow-lg shadow-sage-600/5 border-sage-200/30 relative">
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
                  Select a country and city, or type your own.
                </p>
                <form onSubmit={handleSearchSubmit} className="space-y-2.5 text-left">
                  
                  {/* Toggle Custom Input checkbox */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <input
                      type="checkbox"
                      id="use-custom-input"
                      checked={isCustomInput}
                      onChange={(e) => setIsCustomInput(e.target.checked)}
                      className="cursor-pointer rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                    />
                    <label htmlFor="use-custom-input" className="poppins-regular text-[10px] font-semibold text-sage-600 cursor-pointer select-none">
                      Type manually (Shehar ka naam likhein)
                    </label>
                  </div>

                  {!isCustomInput ? (
                    <>
                      {/* Country Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="search-country" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          Country
                        </label>
                        <select
                          id="search-country"
                          value={selectedCountry}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedCountry(val);
                            // Find the states of this country and set first one as default
                            const countryData = countriesList.find(c => c.name === val);
                            if (countryData && countryData.states && countryData.states.length > 0) {
                              const sortedStates = [...countryData.states].sort((a, b) => a.name.localeCompare(b.name));
                              setSelectedState(sortedStates[0].name);
                            } else {
                              setSelectedState('');
                            }
                            setSelectedCity('');
                          }}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs text-sage-800 bg-white/50 focus:bg-white focus:outline-none cursor-pointer"
                        >
                          {countriesList.length === 0 ? (
                            <option value="">Loading countries...</option>
                          ) : (
                            countriesList.map((c) => (
                              <option key={c.name} value={c.name} className="bg-emerald-50 text-sage-900">{c.name}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* State Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="search-state" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          State
                        </label>
                        <select
                          id="search-state"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedCity('');
                          }}
                          disabled={statesList.length === 0}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs text-sage-800 bg-white/50 focus:bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          {statesList.length === 0 ? (
                            <option value="">No states found</option>
                          ) : (
                            statesList.map((s) => (
                              <option key={s.name} value={s.name} className="bg-emerald-50 text-sage-900">{s.name}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* City Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="search-city" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          City
                        </label>
                        <select
                          id="search-city"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          disabled={citiesList.length === 0 || citiesLoading}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs text-sage-800 bg-white/50 focus:bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          {citiesLoading ? (
                            <option value="">Loading cities...</option>
                          ) : citiesList.length === 0 ? (
                            <option value="">No cities found</option>
                          ) : (
                            <>
                              <option value="">-- Select City --</option>
                              {citiesList.map((ct) => (
                                <option key={ct} value={ct} className="bg-emerald-50 text-sage-900">{ct}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Custom Country Input */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="custom-country-input" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          Country Name
                        </label>
                        <input
                          id="custom-country-input"
                          type="text"
                          placeholder="e.g. India"
                          value={customCountry}
                          onChange={(e) => setCustomCountry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                          required
                        />
                      </div>

                      {/* Custom State Input */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="custom-state-input" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          State Name
                        </label>
                        <input
                          id="custom-state-input"
                          type="text"
                          placeholder="e.g. Uttar Pradesh"
                          value={customState}
                          onChange={(e) => setCustomState(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                          required
                        />
                      </div>

                      {/* Custom City Input */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="custom-city-input" className="poppins-regular text-[10px] font-semibold text-sage-600">
                          City Name
                        </label>
                        <input
                          id="custom-city-input"
                          type="text"
                          placeholder="e.g. Jaunpur"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                          required
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer border-0 mt-2"
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
          <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
            
            {/* Preferences / Calculation Settings Section */}
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 space-y-3">
              <h3 className="poppins-regular text-xs font-bold text-sage-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span>⚙️</span>
                <span>Calculation Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="pref-method" className="poppins-regular text-[11px] font-semibold text-sage-600">
                    Calculation Method
                  </label>
                  <select
                    id="pref-method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs text-sage-800 bg-white/50 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {CALCULATION_METHODS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-emerald-50 text-sage-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="pref-school" className="poppins-regular text-[11px] font-semibold text-sage-600">
                    Asr Jurisprudence (Madhhab)
                  </label>
                  <select
                    id="pref-school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-card-deep border border-white/60 text-xs text-sage-800 bg-white/50 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {SCHOOLS.map((s) => (
                      <option key={s.id} value={s.id} className="bg-emerald-50 text-sage-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="poppins-regular text-[10px] text-sage-500 leading-relaxed">
                💡 <strong>Discrepancy Tip:</strong> Different regions use different calculation methods (e.g. Karachi in South Asia, ISNA in North America) and jurisprudence schools. Adjust these options to match your local mosque's timings.
              </p>
            </div>

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

        {/* SEO Text Content & Educational Guide Section */}
        <article className="glass-card rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-slide-up text-sage-900" style={{ animationDelay: '0.25s' }}>
          <header className="space-y-2 border-b border-sage-100/60 pb-4">
            <h2 className="poppins-regular text-xl md:text-2xl font-bold text-sage-900">
              Complete Guide to Today Namaz Timing &amp; Daily Prayer Timings
            </h2>
            <p className="poppins-regular text-xs md:text-sm text-sage-600 leading-relaxed">
              Offering daily Salah (Namaz) at its designated time is one of the five mandatory pillars of Islam. Having access to accurate <strong>today Namaz timing</strong> for your exact city ensures that your Fajr, Dhuhr, Asr, Maghrib, and Isha prayers are performed punctually, whether you are at home, at work, or travelling.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="poppins-regular text-base font-bold text-sage-800 flex items-center gap-2">
                <span>🌅</span> The 5 Daily Namaz Timings Explained
              </h3>
              <ul className="space-y-2 text-xs md:text-sm text-sage-700 list-disc pl-5 leading-relaxed">
                <li><strong>Fajr Timing (Dawn Prayer):</strong> Starts at true dawn (Subh Sadiq) when light first spreads horizontally, and ends right before sunrise.</li>
                <li><strong>Dhuhr Timing (Zohr / Midday):</strong> Begins after the sun passes its zenith (midday peak) and starts declining toward the west.</li>
                <li><strong>Asr Timing (Late Afternoon):</strong> Begins in the afternoon when shadows reach prescribed lengths (1x for Shafi, 2x for Hanafi) and ends before sunset.</li>
                <li><strong>Maghrib Timing (Sunset Prayer):</strong> Starts immediately after the sun's disk fully sets below the horizon.</li>
                <li><strong>Isha Timing (Night Prayer):</strong> Starts when evening twilight disappears completely from the sky and lasts until Fajr dawn.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="poppins-regular text-base font-bold text-sage-800 flex items-center gap-2">
                <span>⚖️</span> Calculation Methods &amp; Asr Madhhab Differences
              </h3>
              <p className="text-xs md:text-sm text-sage-700 leading-relaxed">
                Namaz timings are calculated based on solar twilight angles and geographic coordinates. Different Islamic authorities recommend regional parameters:
              </p>
              <ul className="space-y-1.5 text-xs text-sage-700 list-disc pl-5 leading-relaxed">
                <li><strong>Karachi Method (South Asia):</strong> Uses 18° Fajr &amp; 18° Isha angles (Standard across India, Pakistan, and Bangladesh).</li>
                <li><strong>ISNA (North America):</strong> Uses 15° Fajr &amp; 15° Isha calculation angles.</li>
                <li><strong>Muslim World League (MWL):</strong> Standard 18° Fajr &amp; 17° Isha angles.</li>
                <li><strong>Hanafi vs Shafi Asr Timing:</strong> Hanafi jurisprudence calculates Asr when shadow length is twice an object's height (2x), whereas Shafi, Maliki, and Hanbali use single shadow length (1x).</li>
              </ul>
            </section>
          </div>

          {/* Interactive Utility Cross-Links */}
          <section className="pt-4 border-t border-sage-100/60">
            <h3 className="poppins-regular text-sm font-bold text-sage-800 mb-3">
              Explore Islamic Utilities &amp; Prayer Tools on Namazly:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <a href="/calendar" className="p-3 rounded-xl glass-card-deep hover:bg-white/80 transition-all text-sage-800 font-semibold no-underline text-center">
                📅 Islamic Calendar
              </a>
              <a href="/qibla" className="p-3 rounded-xl glass-card-deep hover:bg-white/80 transition-all text-sage-800 font-semibold no-underline text-center">
                🧭 Qibla Finder
              </a>
              <a href="/nearby-mosques" className="p-3 rounded-xl glass-card-deep hover:bg-white/80 transition-all text-sage-800 font-semibold no-underline text-center">
                🕌 Nearby Mosques
              </a>
              <a href="/masail" className="p-3 rounded-xl glass-card-deep hover:bg-white/80 transition-all text-sage-800 font-semibold no-underline text-center">
                📖 Islamic Masail
              </a>
            </div>
          </section>

          {/* FAQ Accordion Section for SEO & User Clarity */}
          <section className="pt-4 border-t border-sage-100/60 space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">
              Frequently Asked Questions — Today Namaz Timing &amp; Prayer Times
            </h2>
            <div className="space-y-3">
              <details className="group glass-card-deep rounded-2xl p-4 cursor-pointer">
                <summary className="poppins-regular text-xs sm:text-sm font-semibold text-sage-900 flex justify-between items-center list-none">
                  <span>How do I find today's accurate Namaz timing for my location?</span>
                  <span className="text-sage-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2.5 text-xs text-sage-600 leading-relaxed">
                  Simply click <strong>"Use GPS Location"</strong> at the top to automatically detect your coordinates, or select your country, state, and city from the search dropdown. Namazly calculates live daily prayer timings according to your exact latitude and longitude.
                </p>
              </details>

              <details className="group glass-card-deep rounded-2xl p-4 cursor-pointer">
                <summary className="poppins-regular text-xs sm:text-sm font-semibold text-sage-900 flex justify-between items-center list-none">
                  <span>Why does Asr prayer timing vary between local mosques?</span>
                  <span className="text-sage-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2.5 text-xs text-sage-600 leading-relaxed">
                  Asr timing differs because of school of jurisprudence (Madhhab). The Hanafi Madhhab starts Asr prayer later (shadow equals twice object height), whereas Shafi, Maliki, and Hanbali start earlier (shadow equals single object height). You can toggle between Hanafi and Standard rules under <strong>Calculation Settings</strong> above.
                </p>
              </details>

              <details className="group glass-card-deep rounded-2xl p-4 cursor-pointer">
                <summary className="poppins-regular text-xs sm:text-sm font-semibold text-sage-900 flex justify-between items-center list-none">
                  <span>What should I do if I miss a Namaz timing?</span>
                  <span className="text-sage-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2.5 text-xs text-sage-600 leading-relaxed">
                  If a prayer is missed due to sleep or forgetfulness, it becomes a <strong>Qaza Namaz</strong> and should be performed as soon as possible. You can use the main <a href="/" className="text-sage-700 underline font-medium">Namazly Qaza Manager</a> to track and calculate your pending missed prayers systematically.
                </p>
              </details>

              <details className="group glass-card-deep rounded-2xl p-4 cursor-pointer">
                <summary className="poppins-regular text-xs sm:text-sm font-semibold text-sage-900 flex justify-between items-center list-none">
                  <span>Are prayer timings updated dynamically for travellers?</span>
                  <span className="text-sage-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2.5 text-xs text-sage-600 leading-relaxed">
                  Yes! When travelling across cities or timezones, click "Use GPS Location" to automatically re-calculate today's Namaz timing for your current location.
                </p>
              </details>
            </div>
          </section>
        </article>

      </main>

      <Footer />
    </div>
  );
}
