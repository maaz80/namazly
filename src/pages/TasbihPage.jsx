import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineVolumeUp, HiOutlineVolumeOff, HiOutlineRefresh, HiOutlineChevronDown } from 'react-icons/hi';
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

const PRESET_DHIKRS = [
  { english: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { english: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { english: 'Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ' },
  { english: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ' },
  { english: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ' },
  { english: 'Custom', arabic: 'ذِكْر' }
];

export default function TasbihPage() {
  const navigate = useNavigate();

  // SEO Optimization
  usePageMeta(
    'Digital Tasbih Counter Online — Dhikr & Tasbeeh Tracker | Namazly',
    'Count and track your daily Dhikr easily with our minimal online Tasbih counter. Supports custom dhikr options, vibration haptic feedback, and audio alert support.',
    '/tasbih'
  );

  // Core state
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(PRESET_DHIKRS[0]);
  const [customText, setCustomText] = useState('');
  const [target, setTarget] = useState(33); // 33, 99, 100, 0 (Unlimited)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [history, setHistory] = useState({});

  // Audio synthesizers (no external asset dependencies)
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio Context failed to play:', e);
    }
  };

  const playTargetSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Target chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio Context failed to play:', e);
    }
  };

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('namazly_tasbih_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update history in localStorage
  const updateHistory = (dhikrName, amount) => {
    const today = new Date().toISOString().split('T')[0];
    const newHistory = { ...history };
    if (!newHistory[today]) {
      newHistory[today] = {};
    }
    const currentVal = newHistory[today][dhikrName] || 0;
    newHistory[today][dhikrName] = currentVal + amount;
    setHistory(newHistory);
    localStorage.setItem('namazly_tasbih_history', JSON.stringify(newHistory));
  };

  const activeDhikrName = selectedDhikr.english === 'Custom' ? (customText.trim() || 'Custom') : selectedDhikr.english;

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);

    // Haptic feedback
    if (vibrationEnabled && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }

    // Play sound / check target
    if (target > 0 && nextCount === target) {
      playTargetSound();
      if (vibrationEnabled && window.navigator.vibrate) {
        window.navigator.vibrate([80, 50, 80]);
      }
      updateHistory(activeDhikrName, target);
      setCount(0); // Auto reset to 0 upon reaching target
    } else {
      playClickSound();
    }
  };

  const handleManualReset = () => {
    if (count > 0) {
      updateHistory(activeDhikrName, count);
    }
    setCount(0);
  };

  const handleDhikrChange = (e) => {
    // Save current session before changing
    if (count > 0) {
      updateHistory(activeDhikrName, count);
    }
    setCount(0);
    const index = e.target.value;
    setSelectedDhikr(PRESET_DHIKRS[index]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHistory = history[todayStr] || {};
  const hasHistory = Object.keys(todayHistory).length > 0;

  return (
    <div className="min-h-screen relative flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              if (count > 0) updateHistory(activeDhikrName, count);
              navigate('/');
            }}
            className="flex items-center gap-1 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-xs sm:text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <span className="poppins-regular text-sm sm:text-base font-bold gradient-text">
            Tasbih Counter
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="p-2 rounded-xl glass-card border border-white/60 text-sage-700 hover:bg-white/40 cursor-pointer bg-transparent animate-scale-in"
            >
              {soundEnabled ? <HiOutlineVolumeUp className="w-4 h-4" /> : <HiOutlineVolumeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              aria-label={vibrationEnabled ? 'Disable vibration' : 'Enable vibration'}
              className={`p-2 rounded-xl glass-card border border-white/60 cursor-pointer bg-transparent transition-colors ${
                vibrationEnabled ? 'text-sage-700 hover:bg-white/40' : 'text-sage-400'
              }`}
            >
              <MdVibration className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="relative z-10 max-w-md mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center gap-8 animate-fade-in">
        
        {/* Selector Panel */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 space-y-4 shadow-sm">
          {/* Dhikr selection */}
          <div className="relative">
            <label htmlFor="dhikr-select" className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider mb-1">
              Select Dhikr (ज़िक्र)
            </label>
            <div className="relative">
              <select
                id="dhikr-select"
                onChange={handleDhikrChange}
                value={PRESET_DHIKRS.findIndex(d => d.english === selectedDhikr.english)}
                className="w-full pl-4 pr-10 py-3 rounded-xl glass-card-deep border border-white/60 text-sm font-semibold text-sage-800 focus:outline-none appearance-none cursor-pointer"
              >
                {PRESET_DHIKRS.map((d, index) => (
                  <option key={index} value={index}>
                    {d.english} — {d.arabic}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sage-600">
                <HiOutlineChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Custom Text input */}
          {selectedDhikr.english === 'Custom' && (
            <div className="animate-fade-in">
              <label htmlFor="custom-dhikr-input" className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider mb-1">
                Enter Custom Dhikr
              </label>
              <input
                id="custom-dhikr-input"
                type="text"
                placeholder="e.g. SubhanAllahi wa bihamdihi"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {/* Target Limit Selection */}
          <div>
            <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider mb-2">
              Target (टारगेट)
            </span>
            <div className="flex gap-2 justify-between">
              {[33, 99, 100, 0].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    if (count > 0) updateHistory(activeDhikrName, count);
                    setCount(0);
                    setTarget(t);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    target === t
                      ? 'bg-sage-600 border-sage-600 text-white shadow-sm'
                      : 'glass-card border-white/60 text-sage-700 hover:bg-white/60'
                  }`}
                >
                  {t === 0 ? 'No Limit' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Counter Display (Big Minimal Circle) */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <span className="poppins-regular text-2xl font-bold text-sage-800 block mb-1">
              {selectedDhikr.english === 'Custom' ? (customText || 'Custom Dhikr') : selectedDhikr.english}
            </span>
            <span className="amiri-regular text-xl text-sage-500 font-semibold block min-h-[30px]">
              {selectedDhikr.arabic}
            </span>
          </div>

          <button
            onClick={handleIncrement}
            aria-label={`Increment Tasbih. Current count: ${count}`}
            className="w-56 h-56 rounded-full glass-card border-4 border-white flex flex-col items-center justify-center shadow-lg hover:shadow-xl active:scale-[0.96] transition-all duration-150 cursor-pointer bg-white/20 select-none relative overflow-hidden group border-box"
          >
            {/* Soft Ripple visual */}
            <span className="absolute inset-0 bg-sage-500/10 rounded-full scale-0 group-active:scale-100 transition-transform duration-300" />
            
            <span className="poppins-regular text-5xl font-black text-sage-900 block relative z-10 leading-none">
              {count}
            </span>
            {target > 0 && (
              <span className="text-[10px] font-bold text-sage-500 mt-2 uppercase tracking-wider block relative z-10">
                Target: {target}
              </span>
            )}
          </button>

          <button
            onClick={handleManualReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card border border-white/60 text-xs font-bold text-sage-600 hover:text-sage-800 transition-all cursor-pointer bg-transparent"
          >
            <HiOutlineRefresh className="w-3.5 h-3.5" />
            <span>Reset Count</span>
          </button>
        </div>

        {/* Today's History Panel */}
        {hasHistory && (
          <div className="glass-card rounded-3xl p-5 border border-white/80 space-y-3 shadow-sm animate-fade-in">
            <h3 className="poppins-regular text-[10px] font-bold text-sage-500 uppercase tracking-wider border-b border-sage-100/50 pb-1.5">
              Today's Session History (आज का रिकॉर्ड)
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(todayHistory).map(([dhikr, val]) => (
                <div key={dhikr} className="flex justify-between items-center text-xs text-sage-700 font-semibold">
                  <span>{dhikr}</span>
                  <span className="bg-sage-100/60 px-2 py-0.5 rounded-lg text-sage-800 font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
