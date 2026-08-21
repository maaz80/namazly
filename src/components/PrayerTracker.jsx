import React, { useState, useCallback } from 'react';
import { PRAYERS } from '../utils/constants';
import PrayerRow from './PrayerRow';
import api from '../utils/api';

export default function PrayerTracker({ qazaRecord, onUpdate, isGuest, onSaveAttempt }) {
  const [bulkSaving, setBulkSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = useCallback((newRecord) => {
    onUpdate(newRecord);
  }, [onUpdate]);

  /* Manual "Save All" as a fallback */
  const handleSaveAll = async () => {
    if (isGuest) {
      onSaveAttempt();
      return;
    }
    setBulkSaving(true);
    try {
      const payload = {};
      PRAYERS.forEach((p) => { payload[p.key] = qazaRecord?.[p.key] ?? 0; });
      const { data } = await api.put('/records', payload);
      onUpdate(data.qazaRecord);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save all failed:', err);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl py-6 px-3 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-md">
            <span className="text-white text-lg">🕌</span>
          </div>
          <div>
            <h2 className="poppins-regular text-xl font-bold text-sage-900">Namaz Tracker</h2>
            <p className="poppins-regular text-xs text-sage-500">Tap ± to update pending rakats</p>
          </div>
        </div>

        {/* Save all button */}
        <button
          onClick={handleSaveAll}
          disabled={bulkSaving}
          className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl poppins-regular text-sm font-medium
                      transition-all duration-200 active:scale-95
                      ${saved
              ? 'bg-sage-100/80 text-sage-600 border border-sage-200/60'
              : 'bg-white/70 text-sage-700 border border-white/80 hover:bg-white/90 shadow-sm'}`}
        >
          {bulkSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>✓ Saved</>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save All
            </>
          )}
        </button>
      </div>

      {/* Column labels */}
      <div className="hidden md:flex items-center gap-3 md:gap-4 px-5 mb-3">
        <div className="flex-[2] poppins-regular text-[10px] uppercase tracking-widest text-sage-400 font-semibold">
          Namaz
        </div>
        <div className="flex-[1.5] text-center poppins-regular text-[10px] uppercase tracking-widest text-sage-400 font-semibold">
          Pending Rakats
        </div>
        <div className="flex-shrink-0 w-[120px] md:w-[140px] text-center poppins-regular text-[10px] uppercase tracking-widest text-sage-400 font-semibold">
          Adjust
        </div>
      </div>

      {/* Prayer rows */}
      <div className="space-y-3">
        {PRAYERS.map((prayer, idx) => (
          <div key={prayer.key} className="animate-slide-up" style={{ animationDelay: `${idx * 0.07}s` }}>
            <PrayerRow
              prayer={prayer}
              value={qazaRecord?.[prayer.key] ?? 0}
              onUpdate={handleUpdate}
              isSaving={bulkSaving}
              isGuest={isGuest}
              qazaRecord={qazaRecord}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-sage-100/60 flex flex-wrap gap-x-6 gap-y-1">
        <p className="poppins-regular text-xs text-sage-400">
          <span className="font-semibold text-sage-600">+ button</span> = Add that prayer's rakats
        </p>
        <p className="poppins-regular text-xs text-sage-400">
          <span className="font-semibold text-sage-600">− button</span> = Mark that prayer's rakats complete
        </p>
        <p className="poppins-regular text-xs text-sage-400">
          <span className="font-semibold text-sage-600">R</span> = Rakat step size
        </p>
      </div>
    </div>
  );
}
