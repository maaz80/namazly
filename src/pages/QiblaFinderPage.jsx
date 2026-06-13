import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiLocationMarker } from 'react-icons/hi';
import { TbCompass } from 'react-icons/tb';
import { MdVibration } from 'react-icons/md';
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

// Kaaba Coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
            
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

export default function QiblaFinderPage() {
  const navigate = useNavigate();

  // SEO Optimization
  usePageMeta(
    'Qibla Finder Online — Accurate Kaaba Direction Compass | Namazly',
    'Find the exact Qibla direction online using your device\'s compass and location. Easy-to-use, sensor-based Qibla finder tool.',
    '/qibla'
  );

  // States
  const [coordinates, setCoordinates] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [heading, setHeading] = useState(0); // Device absolute orientation heading
  const [sensorStatus, setSensorStatus] = useState('unsupported'); // 'unsupported', 'permission_needed', 'ready', 'active'
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const hasVibratedRef = useRef(false);
  const headingRef = useRef(0);
  const isFirstHeadingRef = useRef(true);

  // Geolocation trigger
  const requestLocation = () => {
    setGpsLoading(true);
    setGpsError(false);
    
    if (!navigator.geolocation) {
      setGpsError(true);
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        const b = calculateBearing(latitude, longitude, KAABA_LAT, KAABA_LON);
        setBearing(b);
        setGpsError(false);
        setGpsLoading(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsError(true);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Try GPS on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const handleOrientation = useCallback((e) => {
    let currentHeading = null;
    const useAbsolute = 'ondeviceorientationabsolute' in window;
    
    // Check iOS webkitCompassHeading first
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      currentHeading = e.webkitCompassHeading;
    } else if (e.absolute === true) {
      if (e.alpha !== null) {
        currentHeading = (360 - e.alpha) % 360;
      }
    } else if (!useAbsolute && e.alpha !== null) {
      // Fallback for devices/browsers that do not support deviceorientationabsolute
      currentHeading = (360 - e.alpha) % 360;
    }

    if (currentHeading !== null) {
      let smoothed;
      if (isFirstHeadingRef.current) {
        smoothed = currentHeading;
        isFirstHeadingRef.current = false;
      } else {
        const prev = headingRef.current;
        let diff = currentHeading - prev;
        // Shortest path interpolation (-180 to 180)
        diff = ((diff + 180) % 360 + 360) % 360 - 180;
        // Exponential Moving Average filter (0.15 for smooth and responsive feel)
        smoothed = (prev + diff * 0.15 + 360) % 360;
      }
      headingRef.current = smoothed;
      setHeading(smoothed);
      setSensorStatus('active');
    }
  }, []);

  // Handle Device Orientation
  useEffect(() => {
    const useAbsolute = 'ondeviceorientationabsolute' in window;
    if (window.DeviceOrientationEvent) {
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        // iOS requires permission request triggered via user interaction
        setSensorStatus('permission_needed');
      } else {
        // Android / other browsers
        setSensorStatus('ready');
        if (useAbsolute) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // iOS orientation request permission
  const requestOrientationPermission = () => {
    if (
      typeof window.DeviceOrientationEvent !== 'undefined' &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      window.DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            setSensorStatus('ready');
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setSensorStatus('unsupported');
          }
        })
        .catch((err) => {
          console.error('Sensor permission error:', err);
        });
    }
  };

  // needle angle calculation
  const needleAngle = bearing !== null 
    ? (sensorStatus === 'active' ? (bearing - heading + 360) % 360 : bearing) 
    : 0;

  // Rotate compass rose to keep absolute North facing top
  const plateAngle = sensorStatus === 'active' ? -heading : 0;

  // Determine if device is perfectly aligned with the Qibla (within 6 degrees)
  const isAligned = bearing !== null && (
    Math.abs((bearing - heading + 360) % 360) < 6 || 
    Math.abs((bearing - heading + 360) % 360) > 354
  );

  // Trigger haptic vibration once when alignment is achieved
  useEffect(() => {
    if (isAligned && sensorStatus === 'active') {
      if (!hasVibratedRef.current) {
        if (vibrationEnabled && window.navigator.vibrate) {
          window.navigator.vibrate(150);
        }
        hasVibratedRef.current = true;
      }
    } else {
      hasVibratedRef.current = false;
    }
  }, [isAligned, sensorStatus, vibrationEnabled]);

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
            Qibla Compass
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              aria-label={vibrationEnabled ? 'Disable vibration' : 'Enable vibration'}
              className={`p-2 rounded-xl glass-card border border-white/60 cursor-pointer bg-transparent transition-colors ${
                vibrationEnabled ? 'text-sage-700 hover:bg-white/40' : 'text-sage-400'
              }`}
            >
              <MdVibration className="w-4 h-4" />
            </button>
            <button
              onClick={requestLocation}
              disabled={gpsLoading}
              aria-label="Refresh location"
              className="p-2 rounded-xl glass-card border border-white/60 text-sage-700 hover:bg-white/40 cursor-pointer bg-transparent disabled:opacity-50"
            >
              <HiLocationMarker className={`w-4 h-4 ${gpsLoading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="relative z-10 max-w-md mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center gap-8 animate-fade-in text-center">
        
        {gpsError ? (
          /* GPS Error / Disabled View */
          <div className="glass-card rounded-3xl p-6 border border-white/80 space-y-5 shadow-md animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-2xl text-rose-500 shadow-inner">
              📍
            </div>
            <div className="space-y-1">
              <h2 className="poppins-regular text-lg font-bold text-sage-900">GPS Location Disabled</h2>
              <p className="poppins-regular text-xs text-sage-500 leading-relaxed">
                Finding the Qibla requires active GPS coordinates to compute the exact angle relative to the Kaaba.
              </p>
            </div>

            <button
              onClick={requestLocation}
              className="w-full py-3 rounded-2xl poppins-regular text-xs font-bold text-white bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 shadow-md transition-all active:scale-95 cursor-pointer border-0"
            >
              Activate GPS (जीपीएस चालू करें)
            </button>

            <div className="text-left text-[11px] leading-relaxed text-sage-600 bg-white/20 p-3 rounded-2xl border border-white/40 space-y-1">
              <strong className="block text-sage-800">How to fix location settings:</strong>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Click the lock/info icon next to the URL in your browser address bar.</li>
                <li>Make sure the <strong>Location</strong> permission is set to <strong>Allow</strong>.</li>
                <li>Ensure location services (GPS) are turned ON in your phone's system settings.</li>
              </ol>
            </div>
          </div>
        ) : gpsLoading ? (
          /* Loading Skeleton View */
          <div className="space-y-6 flex flex-col items-center animate-pulse">
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-28 h-5 bg-sage-200/60 rounded-full" />
              <div className="w-36 h-8 bg-sage-300/40 rounded-2xl" />
              <div className="w-44 h-4 bg-sage-200/40 rounded-lg" />
            </div>
            
            {/* Pulsing Outer Ring */}
            <div className="w-72 h-72 rounded-full border-4 border-white/60 bg-white/20 flex items-center justify-center shadow-inner">
              <div className="w-56 h-56 rounded-full border border-dashed border-sage-200/40 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-sage-300/30" />
              </div>
            </div>

            {/* Calibration skeleton */}
            <div className="w-full h-24 bg-white/20 rounded-2xl border border-white/40" />
          </div>
        ) : (
          /* Geolocation Success View */
          <div className="space-y-6 flex flex-col items-center">
            
            {/* Degree & Status Header */}
            <div>
              {bearing !== null && (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    GPS Connected
                  </div>
                  <h1 className="poppins-regular text-3xl font-black text-sage-900 mt-2 tracking-tight">
                    Qibla: {Math.round(bearing)}°
                  </h1>
                  {sensorStatus === 'active' ? (
                    isAligned ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider animate-bounce border border-emerald-300/40">
                        🎯 Aligned with Kaaba (क़िबला)
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-sage-100/80 text-sage-600 text-[10px] font-bold uppercase tracking-wider border border-sage-200">
                        Rotate device to align
                      </span>
                    )
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200/40">
                      Desktop Mode: Point N indicator to true North
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Premium Compass */}
            <div className="flex justify-center select-none">
              <div className={`w-72 h-72 rounded-full border-4 relative flex items-center justify-center shadow-[0_8px_32px_0_rgba(31,67,54,0.15)] bg-white/25 backdrop-blur-md transition-all duration-300 ${
                isAligned && sensorStatus === 'active'
                  ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-50/10'
                  : 'border-white/90'
              }`}>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sage-500/5 to-cream-500/5 blur-sm" />

                {/* Rotating Compass Plate */}
                <div 
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{ transform: `rotate(${plateAngle}deg)` }}
                >
                  {/* Cardinal Directions */}
                  <span className="absolute top-5 text-sm font-black text-rose-600 tracking-tight">N</span>
                  <span className="absolute right-5 text-xs font-black text-sage-600">E</span>
                  <span className="absolute bottom-5 text-xs font-black text-sage-600">S</span>
                  <span className="absolute left-5 text-xs font-black text-sage-600">W</span>

                  {/* Math SVG Ticks */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = i * 30;
                      const isCardinal = angle % 90 === 0;
                      const rad = (angle * Math.PI) / 180;
                      const x1 = 100 + 86 * Math.sin(rad);
                      const y1 = 100 - 86 * Math.cos(rad);
                      const x2 = 100 + (isCardinal ? 74 : 80) * Math.sin(rad);
                      const y2 = 100 - (isCardinal ? 74 : 80) * Math.cos(rad);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isCardinal ? "rgba(212, 160, 23, 0.8)" : "rgba(61, 130, 101, 0.2)"}
                          strokeWidth={isCardinal ? 1.5 : 1}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Rotating Qibla Needle */}
                <div 
                  className="w-full h-full absolute inset-0 flex items-center justify-center z-10"
                  style={{ transform: `rotate(${needleAngle}deg)` }}
                >
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <defs>
                      <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="needleGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffd700" />
                        <stop offset="100%" stopColor="#d4a017" />
                      </linearGradient>
                      <linearGradient id="needleEmerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                    </defs>
                    
                    {/* Needle tail */}
                    <polygon
                      points="100,100 95,124 100,119 105,124"
                      fill="rgba(61, 130, 101, 0.25)"
                    />
                    
                    {/* Needle head */}
                    <polygon
                      points="100,28 92,100 100,95"
                      fill="url(#needleEmerald)"
                      filter="url(#needleGlow)"
                    />
                    <polygon
                      points="100,28 108,100 100,95"
                      fill="url(#needleGold)"
                      filter="url(#needleGlow)"
                    />
                    
                    {/* Mosque icon on needle tip */}
                    <g transform="translate(88, 8)">
                      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#d4a017" strokeWidth="1.5" />
                      <text x="12" y="15.5" textAnchor="middle" fontSize="11">🕌</text>
                    </g>
                  </svg>
                </div>

                {/* Center Pivot Pin */}
                <div className="w-7 h-7 rounded-full bg-white border border-sage-300 flex items-center justify-center z-20 shadow-sm">
                  <TbCompass className="w-4 h-4 text-sage-600 animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Calibration and iOS sensor button */}
            <div className="w-full space-y-3">
              {sensorStatus === 'permission_needed' && (
                <button
                  onClick={requestOrientationPermission}
                  className="w-full py-3 rounded-2xl poppins-regular text-xs font-bold text-white bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 shadow-md transition-all active:scale-95 cursor-pointer border-0"
                >
                  Enable Compass Sensors (कंपास ऑन करें)
                </button>
              )}

              <div className="glass-card rounded-2xl p-4 border border-white/60 text-[10px] text-sage-500 leading-normal space-y-1">
                <p className="font-semibold text-sage-700">💡 Calibrating Accuracy:</p>
                <p>1. Keep your phone flat on your hand (do not hold it tilted).</p>
                <p>2. Wave your phone in a horizontal figure-8 pattern a few times to reset internal magnetic compass sensors.</p>
                <p>3. Keep away from metallic cases, magnets, or electronic devices to avoid magnetic interference.</p>
              </div>
            </div>
            
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
