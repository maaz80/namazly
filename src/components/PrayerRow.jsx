import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { HiPlus, HiMinus } from 'react-icons/hi';
import api from '../utils/api';

export default function PrayerRow({ prayer, value, onUpdate, isSaving, isGuest, qazaRecord }) {
  const [localValue, setLocalValue] = useState(value);
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  /* Sync external value (e.g., from calculator bulk-apply) */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /* Persist with debounce */
  const saveToDb = useCallback(async (newValue) => {
    setStatus('saving');
    if (isGuest) {
      const updated = { ...qazaRecord, [prayer.key]: Math.max(0, newValue) };
      onUpdate(updated);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1800);
    } else {
      try {
        const { data } = await api.patch('/records/single', {
          prayer: prayer.key,
          value: Math.max(0, newValue),
        });
        onUpdate(data.qazaRecord);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1800);
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    }
  }, [prayer.key, onUpdate, isGuest, qazaRecord]);

  const debouncedSave = useDebounce(saveToDb, 700);

  /* Adjust by this prayer's rakat count */
  const adjust = (delta) => {
    const next = Math.max(0, localValue + delta * prayer.rakats);
    setLocalValue(next);
    debouncedSave(next);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { setLocalValue(0); debouncedSave(0); return; }
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
      setLocalValue(num);
      debouncedSave(num);
    }
  };

  /* Status indicator */
  const StatusDot = () => {
    if (status === 'saving') return (
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Saving…" />
    );
    if (status === 'saved') return (
      <span className="w-1.5 h-1.5 rounded-full bg-sage-400" title="Saved" />
    );
    if (status === 'error') return (
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Error saving" />
    );
    return null;
  };

  return (
    <div className={`glass-card rounded-2xl px-3.5 py-3 sm:px-5 sm:py-4
                     flex flex-row items-center justify-between gap-2.5 sm:gap-4
                     border border-white/70 hover:border-white/90
                     transition-all duration-200 group`}>

      {/* Prayer color dot + name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-[2]">
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${prayer.dot}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="poppins-regular font-semibold text-sage-900 text-xs sm:text-sm md:text-base leading-tight truncate">
              {prayer.label}
            </span>
            <StatusDot />
          </div>
          <span className="poppins-regular text-sage-400 text-[10px] sm:text-xs leading-none mt-0.5 block">{prayer.arabic}</span>
        </div>
      </div>

      {/* Input field */}
      <div className="flex-shrink-0 mx-2 sm:mx-0 sm:flex-[1.5] flex justify-center">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          min={0}
          className="prayer-input w-12 sm:w-16 md:w-20 text-center py-2 px-1 rounded-xl
                     poppins-regular font-bold text-sm sm:text-base md:text-lg text-sage-900
                     bg-white/70 border border-white/90 outline-none
                     focus:ring-2 focus:ring-sage-300/70 focus:border-sage-300
                     transition-all duration-200"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* + button */}
        <button
          onClick={() => adjust(1)}
          title={`Add ${prayer.rakats} ${prayer.label} rakats`}
          className={`group/btn flex items-center justify-center gap-0.5
                      h-9 w-10 sm:h-12 sm:w-14 md:w-16 rounded-xl poppins-regular font-semibold
                      bg-gradient-to-br ${prayer.color}
                      border border-white/70 hover:border-white/90
                      shadow-sm hover:shadow-md
                      transition-all duration-150 active:scale-95 cursor-pointer`}
        >
          <HiPlus className="text-sage-700 text-sm sm:text-lg leading-none" />
          <span className="hidden sm:inline text-sage-500 text-[9px] leading-tight mt-0.5">{prayer.rakats}R</span>
        </button>

        {/* − button */}
        <button
          onClick={() => adjust(-1)}
          disabled={localValue <= 0}
          title={`Mark ${prayer.rakats} ${prayer.label} rakats as done`}
          className={`group/btn flex items-center justify-center gap-0.5
                      h-9 w-10 sm:h-12 sm:w-14 md:w-16 rounded-xl poppins-regular font-semibold
                      border transition-all duration-150 active:scale-95
                      ${localValue <= 0
              ? 'bg-sage-50/40 border-sage-100/60 text-sage-300 cursor-not-allowed'
              : 'bg-white/60 border-white/80 text-sage-700 hover:bg-rose-50/60 hover:border-rose-200/60 shadow-sm hover:shadow-md cursor-pointer'}`}
        >
          <HiMinus className="text-sm sm:text-lg leading-none" />
          <span className="hidden sm:inline text-[9px] leading-tight mt-0.5">{prayer.rakats}R</span>
        </button>
      </div>
    </div>
  );
}
