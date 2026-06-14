import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiLocationMarker, HiMap } from 'react-icons/hi';
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

// Calculate distance in km using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MosqueFinderPage() {
  const navigate = useNavigate();

  // SEO Optimization
  usePageMeta(
    'Nearby Mosque Finder — Find Mosques Near You | Namazly',
    'Locate mosques and prayer rooms near your current location using our interactive map. Get directions and distances instantly.',
    '/nearby-mosques'
  );

  // States
  const [coordinates, setCoordinates] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [radius, setRadius] = useState(3000); // meters (1km, 3km, 5km)
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Dynamically load Leaflet from CDN (avoid bundler marker image bugs)
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.onload = () => setLeafletLoaded(true);
    document.body.appendChild(jsScript);
  }, []);

  // Fetch coordinates
  const requestLocation = () => {
    setGpsLoading(true);
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        setGpsLoading(false);
      },
      (error) => {
        console.warn(error);
        setErrorMsg('GPS access denied. Please allow location access to find nearby mosques.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Fetch Mosques from Overpass API (OpenStreetMap)
  const fetchNearbyMosques = async (lat, lon, rad) => {
    setLoading(true);
    setErrorMsg('');
    const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon}););out center;`;
    
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch data from OpenStreetMap server.');
      const data = await response.json();
      
      const parsed = (data.elements || []).map((el) => {
        const mLat = el.lat || (el.center && el.center.lat);
        const mLon = el.lon || (el.center && el.center.lon);
        const name = el.tags?.name || 'Masjid / Mosque';
        const distance = getDistance(lat, lon, mLat, mLon);
        
        return {
          id: el.id,
          name,
          lat: mLat,
          lon: mLon,
          distance,
          road: el.tags?.['addr:street'] || el.tags?.['addr:suburb'] || ''
        };
      });

      // Sort by closest distance
      parsed.sort((a, b) => a.distance - b.distance);
      setMosques(parsed);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to search nearby mosques. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger mosque fetch when coordinates or radius changes
  useEffect(() => {
    if (coordinates) {
      fetchNearbyMosques(coordinates.lat, coordinates.lon, radius);
    }
  }, [coordinates, radius]);

  // Handle Leaflet Map Initialization & Markers updating
  useEffect(() => {
    if (!leafletLoaded || !coordinates || !mapRef.current) return;

    const L = window.L;

    // Initialize Map if not done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([coordinates.lat, coordinates.lon], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([coordinates.lat, coordinates.lon], 14);
    }

    // Clear old markers
    markersGroup.current.clearLayers();

    // User marker (divIcon pulsing blue circle)
    const userMarkerIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="relative flex items-center justify-center"><div class="absolute w-5 h-5 rounded-full bg-blue-500/30 animate-ping"></div><div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div></div>`,
      iconSize: [20, 20]
    });
    L.marker([coordinates.lat, coordinates.lon], { icon: userMarkerIcon })
      .bindPopup('<b>You are here</b>')
      .addTo(markersGroup.current);

    // Mosque markers (divIcon green circle with mosque emoji)
    mosques.forEach((mosque) => {
      if (mosque.lat && mosque.lon) {
        const mosqueMarkerIcon = L.divIcon({
          className: 'custom-mosque-marker',
          html: `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md text-sm hover:scale-110 transition-transform">🕌</div>`,
          iconSize: [32, 32]
        });

        L.marker([mosque.lat, mosque.lon], { icon: mosqueMarkerIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; font-size:12px; padding: 2px;">
              <b style="color: #3d8265; font-size:13px;">${mosque.name}</b>
              <br/>Distance: ${mosque.distance.toFixed(2)} km
              <br/><a href="https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:6px; color:#fff; background-color:#3d8265; text-decoration:none; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:10px;">Get Directions</a>
            </div>
          `)
          .addTo(markersGroup.current);
      }
    });

  }, [leafletLoaded, coordinates, mosques]);

  return (
    <div className="min-h-screen relative flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-xs sm:text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <span className="poppins-regular text-sm sm:text-base font-bold gradient-text">
            Nearby Mosques
          </span>
          
          <button
            onClick={requestLocation}
            disabled={gpsLoading}
            aria-label="Refresh location"
            className="p-2 rounded-xl glass-card border border-white/60 text-sage-700 hover:bg-white/40 cursor-pointer bg-transparent disabled:opacity-50"
          >
            <HiLocationMarker className={`w-4 h-4 ${gpsLoading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="relative z-10 max-w-2xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-6 animate-fade-in">
        
        {/* Banner info */}
        <section className="text-center space-y-1">
          <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            Nearby Big-Named Mosques (प्रमुख मस्जिदें)
          </span>
          <h1 className="poppins-regular text-xl sm:text-2xl font-black text-sage-900">
            Nearby Big-Named Mosques
          </h1>
          <p className="poppins-regular text-[11px] text-sage-500 max-w-xs mx-auto leading-normal">
            Locate historical and major big-named mosques around your current position.
          </p>
        </section>

        {errorMsg && (
          <div className="glass-card rounded-3xl p-6 border border-white/80 space-y-4 shadow-sm text-center">
            <div className="text-2xl">📍</div>
            <p className="poppins-regular text-xs font-semibold text-rose-600">{errorMsg}</p>
            <button
              onClick={requestLocation}
              className="px-5 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition-all active:scale-95 cursor-pointer border-0"
            >
              Grant GPS Permission
            </button>
          </div>
        )}

        {!errorMsg && !coordinates && gpsLoading && (
          <div className="space-y-6 animate-pulse">
            {/* Radius slider card skeleton */}
            <div className="glass-card rounded-3xl p-4 border border-white/80 h-20 bg-white/10" />
            
            {/* Map Container skeleton */}
            <div className="w-full h-80 rounded-3xl bg-white/20 border border-white/80" style={{ minHeight: '320px' }} />
            
            {/* Mosque List skeleton */}
            <div className="space-y-3">
              <div className="w-48 h-4 bg-sage-200/50 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass-card rounded-2xl p-4 border border-white/70 h-[116px] bg-white/10" />
                <div className="glass-card rounded-2xl p-4 border border-white/70 h-[116px] bg-white/10" />
              </div>
            </div>
          </div>
        )}

        {!errorMsg && coordinates && (
          <div className="space-y-6">
            
            {/* Radius Selector Slider */}
            <div className="glass-card rounded-3xl p-4 border border-white/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">
                  Search Radius (दूरी)
                </span>
                <span className="poppins-regular text-sm font-semibold text-sage-800">
                  Mosques within {(radius / 1000).toFixed(0)} km
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {[1000, 3000, 5000, 10000].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      radius === r
                        ? 'bg-sage-600 border-sage-600 text-white shadow-sm'
                        : 'glass-card border-white/60 text-sage-700 hover:bg-white/60'
                    }`}
                  >
                    {r / 1000} km
                  </button>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-80 rounded-3xl border border-white/80 shadow-md bg-white/20 z-0"
                style={{ minHeight: '320px' }}
              />
              {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-3xl">
                  <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Mosques List */}
            <div className="space-y-3">
              <h2 className="poppins-regular text-xs font-bold text-sage-500 uppercase tracking-wider text-left border-b border-sage-100/50 pb-1.5 flex items-center gap-1.5">
                <HiMap className="w-4 h-4 text-sage-500" />
                <span>Found {mosques.length} Mosques Near You</span>
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-4 border border-white/70 shadow-sm flex flex-col justify-between items-start gap-4 h-[116px] bg-white/10"
                    >
                      <div className="space-y-2 w-full">
                        <div className="w-2/3 h-4 bg-sage-200/60 rounded" />
                        <div className="flex justify-between items-center w-full">
                          <div className="w-16 h-3 bg-sage-200/40 rounded" />
                          <div className="w-12 h-3.5 bg-sage-100/60 rounded" />
                        </div>
                      </div>
                      <div className="w-full h-8 bg-sage-200/30 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : mosques.length === 0 ? (
                <div className="glass-card rounded-3xl p-6 text-center text-xs text-sage-500 border border-white/80">
                  No mosques mapped within {(radius / 1000).toFixed(0)} km of your location. Try expanding the radius.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {mosques.map((mosque) => (
                    <div
                      key={mosque.id}
                      className="glass-card rounded-2xl p-4 border border-white/70 shadow-sm flex flex-col justify-between items-start gap-3 text-left"
                    >
                      <div className="space-y-1 w-full">
                        <h3 className="poppins-regular text-sm font-bold text-sage-900 truncate" title={mosque.name}>
                          {mosque.name}
                        </h3>
                        <div className="flex justify-between items-center text-[10px] text-sage-400 font-semibold uppercase tracking-wider">
                          <span>{mosque.road || 'Nearby Area'}</span>
                          <span className="bg-sage-100/60 px-1.5 py-0.5 rounded text-sage-800 font-bold shrink-0 ml-2">
                            {mosque.distance.toFixed(2)} km
                          </span>
                        </div>
                      </div>
                      
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2 rounded-xl text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition-all text-decoration-none"
                      >
                        Get Directions (रास्ता देखें)
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Google Maps Fallback Notice */}
              {coordinates && (
                <div className="glass-card rounded-3xl p-5 border border-white/80 text-[11px] text-sage-500 leading-relaxed space-y-2 mt-4 text-center">
                  <p className="font-semibold text-sage-700">
                    💡 Missing local neighborhood mosques?
                  </p>
                  <p>
                    OpenStreetMap is a volunteer-mapped database. If some smaller mohalla masjids are not showing, it means they haven't been drawn on the public map database yet. You can see all commercial listings on Google Maps:
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/mosque+near+me/@${coordinates.lat},${coordinates.lon},15z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md transition-all text-decoration-none border-0 cursor-pointer"
                  >
                    🔍 Search on Google Maps (गूगल मैप्स पर देखें)
                  </a>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
