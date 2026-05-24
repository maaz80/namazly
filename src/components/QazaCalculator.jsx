import React, { useState } from 'react';
import { PRAYERS, DAYS_PER_MONTH } from '../utils/constants';

/* ── helpers ─────────────────────────────────────────── */
function calcTotalMonths(years, months) {
  return years * 12 + months;
}

function calcGrossDays(years, months) {
  return calcTotalMonths(years, months) * DAYS_PER_MONTH;
}

function calcDeductedDays(years, months, gender, cycleDays) {
  if (gender !== 'female') return 0;
  return calcTotalMonths(years, months) * cycleDays;
}

function calcNetDays(years, months, gender, cycleDays) {
  const gross = calcGrossDays(years, months);
  const deducted = calcDeductedDays(years, months, gender, cycleDays);
  return Math.max(0, gross - deducted);
}

function calcRakatsForPrayer(days, prayer) {
  return days * prayer.rakats;
}

function calcTotalRakats(days) {
  return PRAYERS.reduce((sum, prayer) => sum + calcRakatsForPrayer(days, prayer), 0);
}

/* ── Gender Selector ─────────────────────────────────── */
function GenderSelector({ gender, onChange }) {
  return (
    <div className="flex rounded-2xl bg-white/40 border border-white/70 p-1 gap-1 mb-5">
      <button
        type="button"
        onClick={() => onChange('male')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl poppins-regular text-sm font-semibold
                    transition-all duration-200 active:scale-95 cursor-pointer
                    ${gender === 'male'
            ? 'bg-gradient-to-r from-sage-600 to-sage-500 text-white shadow-md'
            : 'text-sage-500 hover:text-sage-700 hover:bg-white/50'}`}
      >
        <span>♂</span>
        <span>Male</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('female')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl poppins-regular text-sm font-semibold
                    transition-all duration-200 active:scale-95 cursor-pointer
                    ${gender === 'female'
            ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md'
            : 'text-sage-500 hover:text-sage-700 hover:bg-white/50'}`}
      >
        <span>♀</span>
        <span>Female</span>
      </button>
    </div>
  );
}

/* ── Cycle Days Slider ───────────────────────────────── */
function CycleDaysInput({ cycleDays, onChange }) {
  return (
    <div className="glass-card-deep rounded-2xl px-4 py-4 mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="poppins-regular text-xs font-semibold text-rose-500 uppercase tracking-wider mb-0.5">
            ♀ Average Period Cycle
          </p>
          <p className="poppins-regular text-[10px] text-sage-400 leading-snug">
            Days per month exempted from prayer obligation
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100/60 border border-rose-200/50 flex-shrink-0">
          <span className="poppins-regular text-xl font-bold text-rose-500">{cycleDays}</span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={3}
        max={10}
        step={1}
        value={cycleDays}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #fb7185 0%, #fb7185 ${((cycleDays - 3) / 7) * 100}%, rgba(255,255,255,0.5) ${((cycleDays - 3) / 7) * 100}%, rgba(255,255,255,0.5) 100%)`,
          outline: 'none',
        }}
      />

      {/* Tick labels */}
      <div className="flex justify-between mt-1.5 px-0.5">
        {[3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
          <span
            key={d}
            className={`poppins-regular text-[9px] font-medium transition-colors ${d === cycleDays ? 'text-rose-500' : 'text-sage-300'}`}
          >
            {d}
          </span>
        ))}
      </div>

      <p className="poppins-regular text-[10px] text-sage-400 mt-2 leading-snug">
        Most scholars recommend <span className="font-semibold text-rose-400">7 days</span> as the default estimate.
        Adjust based on your personal cycle.
      </p>
    </div>
  );
}

/* ── Confirmation Modal ──────────────────────────────── */
function ConfirmModal({ netDays, grossDays, deductedDays, gender, onConfirm, onCancel }) {
  const isFemale = gender === 'female';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center md:items-end justify-center p-4"
      style={{ background: 'rgba(31,67,54,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in overflow-y-auto md:max-h-[90vh] max-h-[80vh]">
        {/* Icon */}
        {/* <div className="text-4xl mb-4 text-center">🕌</div> */}

        <h3 className="poppins-regular text-xl sm:text-2xl font-bold text-sage-900 text-center mb-2">
          Replace Your Records?
        </h3>
        <p className="poppins-regular text-sage-500 text-xs text-center mb-4">
          The following Qaza prayers will <span className="font-semibold text-sage-700">replace</span> your current records:
        </p>

        {/* Replace warning */}
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 mb-5 flex items-start gap-2.5">
          <span className="text-base mt-0.5 flex-shrink-0">⚠️</span>
          <p className="poppins-regular text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">Purana data remove ho jayega.</span> Yeh new calculated values aapke
            existing records ko replace kar dengi (add nahi hongi). Agar aap sure hain toh confirm karein.
          </p>
        </div>

        {/* Female breakdown block */}
        {isFemale && (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 px-4 py-3.5 mb-5">
            <p className="poppins-regular text-xs font-bold text-rose-500 uppercase tracking-wider mb-2.5">
              ♀ Period Exemption Breakdown
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="poppins-regular text-xs text-sage-600">Gross prayer days</span>
                <span className="poppins-regular text-xs font-bold text-sage-800">{grossDays} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="poppins-regular text-xs text-rose-500">− Period exemption days</span>
                <span className="poppins-regular text-xs font-bold text-rose-500">−{deductedDays} days</span>
              </div>
              <div className="h-px bg-rose-200/60 my-1" />
              <div className="flex items-center justify-between">
                <span className="poppins-regular text-xs font-semibold text-sage-800">Active Qaza days</span>
                <span className="poppins-regular text-sm font-bold gradient-text">{netDays} days</span>
              </div>
            </div>
            <p className="poppins-regular text-[10px] text-sage-400 mt-3 leading-snug border-t border-rose-100/70 pt-2.5">
              📖 <span className="font-semibold text-sage-500">Islamic Ruling:</span> Women are exempt from making up prayers
              (Qaza) missed during menstruation (Hayd) and post-natal bleeding (Nifas). These days have
              been automatically deducted from your total.
            </p>
          </div>
        )}

        {/* Prayer breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {PRAYERS.map((p) => (
            <div
              key={p.key}
              className={`bg-gradient-to-br ${p.color} rounded-xl px-3 py-2.5 flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                <div className="min-w-0">
                  <span className="poppins-regular text-xs font-medium text-sage-800 truncate block">{p.label}</span>
                  <span className="poppins-regular text-[9px] text-sage-500">{p.arabic}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="poppins-regular text-sm font-bold text-sage-900 block">
                  {calcRakatsForPrayer(netDays, p)}
                </span>
                <span className="poppins-regular text-[9px] text-sage-500">rakats</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total rakats */}
        <div className="glass-card-deep rounded-xl px-4 py-3 text-center mb-5">
          <p className="poppins-regular text-xs text-sage-500 mb-0.5">Total rakats to be added</p>
          <p className="poppins-regular text-2xl font-bold gradient-text">{calcTotalRakats(netDays).toLocaleString()}</p>
          {isFemale && (
            <p className="poppins-regular text-[10px] text-rose-400 mt-1">
              {deductedDays} period days excluded · {grossDays} gross → {netDays} net days
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1  py-3 w-[20%] rounded-xl poppins-regular font-medium text-sage-600 text-sm sm:text-base
                       bg-sage-50/60 hover:bg-sage-100/60 border border-sage-200/60
                       transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1  py-3 min-w-[70%] rounded-xl poppins-regular font-semibold text-white text-sm sm:text-base
                       bg-gradient-to-r from-sage-600 to-sage-500
                       hover:from-sage-700 hover:to-sage-600
                       shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Yes, Replace & Save ✓
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Calculator ─────────────────────────────────── */
export default function QazaCalculator({ onApply }) {
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [gender, setGender] = useState('male');
  const [cycleDays, setCycleDays] = useState(7);
  const [calculated, setCalculated] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const y = parseInt(years || '0', 10);
  const m = parseInt(months || '0', 10);
  const grossDays = calcGrossDays(y, m);
  const deductedDays = calcDeductedDays(y, m, gender, cycleDays);
  const netDays = calcNetDays(y, m, gender, cycleDays);
  const hasInput = (years || months) && grossDays > 0;

  const handleCalculate = () => {
    if (isNaN(y) || isNaN(m) || (y === 0 && m === 0)) {
      setError('Please enter at least 1 month or 1 year.');
      return;
    }
    if (y < 0 || m < 0) {
      setError('Values must be positive.');
      return;
    }
    setError('');
    setCalculated({ netDays, grossDays, deductedDays });
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (calculated !== null) {
      onApply(calculated.netDays);
    }
    setShowConfirm(false);
    setCalculated(null);
    setYears('');
    setMonths('');
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setCalculated(null);
  };

  const handleGenderChange = (g) => {
    setGender(g);
    setError('');
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-6 md:p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-md">
            <span className="text-lg">🧮</span>
          </div>
          <div>
            <h2 className="poppins-regular text-xl font-bold text-sage-900">Qaza Calculator</h2>
            <p className="poppins-regular text-xs text-sage-500">Enter missed prayer duration to auto-calculate</p>
          </div>
        </div>

        {/* Gender Selector */}
        <GenderSelector gender={gender} onChange={handleGenderChange} />

        {/* Cycle Days Input for female */}
        {gender === 'female' && (
          <CycleDaysInput cycleDays={cycleDays} onChange={setCycleDays} />
        )}

        {/* Duration Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Years */}
          <div>
            <label className="block poppins-regular text-xs font-semibold text-sage-600 mb-1.5 uppercase tracking-wider">
              Years
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={years}
                onChange={(e) => { setYears(e.target.value); setError(''); }}
                placeholder="0"
                className="prayer-input w-full px-4 py-3 rounded-xl poppins-regular text-sage-900 font-medium
                           bg-white/60 border border-white/80 outline-none
                           focus:ring-2 focus:ring-sage-300/60 focus:border-sage-300
                           placeholder:text-sage-300 transition-all duration-200 text-center text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage-400 poppins-regular">yrs</span>
            </div>
          </div>

          {/* Months */}
          <div>
            <label className="block poppins-regular text-xs font-semibold text-sage-600 mb-1.5 uppercase tracking-wider">
              Months
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="11"
                value={months}
                onChange={(e) => { setMonths(e.target.value); setError(''); }}
                placeholder="0"
                className="prayer-input w-full px-4 py-3 rounded-xl poppins-regular text-sage-900 font-medium
                           bg-white/60 border border-white/80 outline-none
                           focus:ring-2 focus:ring-sage-300/60 focus:border-sage-300
                           placeholder:text-sage-300 transition-all duration-200 text-center text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage-400 poppins-regular">mo</span>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {hasInput && (
          <div className="glass-card-deep rounded-2xl px-4 py-4 mb-5 animate-fade-in">
            {gender === 'female' ? (
              <>
                <p className="poppins-regular text-[10px] font-semibold text-sage-400 uppercase tracking-wider mb-3">
                  Calculation Preview
                </p>
                <div className="space-y-2">
                  {/* Gross row */}
                  <div className="flex items-center justify-between">
                    <span className="poppins-regular text-xs text-sage-500">Total gross days</span>
                    <span className="poppins-regular text-sm font-bold text-sage-700">{grossDays}</span>
                  </div>
                  {/* Deduction row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="poppins-regular text-xs text-rose-400">− Period days</span>
                      <span className="poppins-regular text-[9px] text-rose-300 bg-rose-50/60 rounded px-1 py-0.5">
                        {cycleDays}d × {calcTotalMonths(y, m)} mo
                      </span>
                    </div>
                    <span className="poppins-regular text-sm font-bold text-rose-400">−{deductedDays}</span>
                  </div>
                  <div className="h-px bg-sage-200/50" />
                  {/* Net row */}
                  <div className="flex items-center justify-between">
                    <span className="poppins-regular text-xs font-semibold text-sage-700">Active Qaza days</span>
                    <span className="poppins-regular text-lg font-bold gradient-text">{netDays}</span>
                  </div>
                  {/* Rakats row */}
                  <div className="flex items-center justify-between pt-1 border-t border-sage-100/50">
                    <span className="poppins-regular text-xs text-sage-500">Total rakats</span>
                    <span className="poppins-regular text-base font-bold text-sage-700">
                      {calcTotalRakats(netDays).toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="poppins-regular text-xs text-sage-500 mb-0.5">Est. Days</p>
                  <p className="poppins-regular text-xl font-bold gradient-text">{grossDays}</p>
                </div>
                <div>
                  <p className="poppins-regular text-xs text-sage-500 mb-0.5">Rakats/day</p>
                  <p className="poppins-regular text-xl font-bold gradient-text">{calcTotalRakats(1)}</p>
                </div>
                <div>
                  <p className="poppins-regular text-xs text-sage-500 mb-0.5">Total rakats</p>
                  <p className="poppins-regular text-xl font-bold text-sage-700">{calcTotalRakats(grossDays).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-rose-500 poppins-regular mb-4 animate-fade-in">{error}</p>
        )}

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-2xl poppins-regular font-semibold text-white text-base
                     bg-gradient-to-r from-sage-600 to-sage-500
                     hover:from-sage-700 hover:to-sage-600
                     shadow-md hover:shadow-xl transition-all duration-200 active:scale-[0.98]
                     flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Calculate & Preview</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && calculated && (
        <ConfirmModal
          netDays={calculated.netDays}
          grossDays={calculated.grossDays}
          deductedDays={calculated.deductedDays}
          gender={gender}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
