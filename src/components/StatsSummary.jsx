import React from 'react';
import { PRAYERS } from '../utils/constants';

export default function StatsSummary({ qazaRecord }) {
  const total = PRAYERS.reduce((sum, p) => sum + (qazaRecord?.[p.key] ?? 0), 0);
  const completed = PRAYERS.every((p) => (qazaRecord?.[p.key] ?? 0) === 0);

  const maxVal = Math.max(...PRAYERS.map((p) => qazaRecord?.[p.key] ?? 0), 1);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-lg">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <p className="poppins-regular text-xs text-sage-500 uppercase tracking-wider mb-0.5">Total Pending</p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="poppins-regular text-3xl sm:text-4xl font-bold gradient-text">{total.toLocaleString()}</span>
            <span className="poppins-regular text-sm text-sage-400">rakats</span>
          </div>
        </div>

        {completed ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-100/80 rounded-full">
            <span className="text-sage-500 text-sm">✅</span>
            <span className="poppins-regular text-xs text-sage-600 font-medium">All clear!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 w-24 justify-center py-1.5 bg-amber-100/80 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="poppins-regular text-[10px] text-amber-700 font-medium">In progress</span>
          </div>
        )}
      </div>

      {/* Mini bars */}
      <div className="space-y-2.5">
        {PRAYERS.map((p) => {
          const val = qazaRecord?.[p.key] ?? 0;
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={p.key} className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
                <span className="poppins-regular text-xs text-sage-600 truncate">{p.label}</span>
              </div>
              <div className="flex-1 h-2 bg-sage-100/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.dot} transition-all duration-500`}
                  style={{ width: `${pct}%`, opacity: 0.7 }}
                />
              </div>
              <span className="poppins-regular text-xs font-semibold text-sage-700 w-12 text-right">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
