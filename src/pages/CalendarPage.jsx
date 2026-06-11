import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

/* ── Decorative background orbs ─────────────────────────── */
const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 80% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle at 20% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ISLAMIC_EVENTS = [
  { name: 'Islamic New Year', month: 'muharram', day: 1, emoji: '🌙', desc: 'Marks the beginning of the Hijri year (1 Muharram).' },
  { name: 'Ashura', month: 'muharram', day: 10, emoji: '🕌', desc: 'Day of fasting and remembrance (10 Muharram).' },
  { name: 'Mawlid al-Nabi', month: 'rabialawwal', day: 12, emoji: '✨', desc: 'Birth anniversary of Prophet Muhammad (PBUH) (12 Rabi\' al-Awwal).' },
  { name: 'Laylat al-Miraj', month: 'rajab', day: 27, emoji: '🌌', desc: 'The Prophet\'s Night Journey & Ascension to Heaven (27 Rajab).' },
  { name: 'Laylat al-Bara\'ah', month: 'shaban', day: 15, emoji: '💡', desc: 'Night of Forgiveness and Salvation (15 Sha\'ban).' },
  { name: 'Start of Ramadan', month: 'ramadan', day: 1, emoji: '🌙', desc: 'First day of the holy month of fasting (1 Ramadan).' },
  { name: 'Laylat al-Qadr', month: 'ramadan', day: 27, emoji: '⭐', desc: 'The Night of Power, better than a thousand months (27 Ramadan).' },
  { name: 'Eid al-Fitr', month: 'shawwal', day: 1, emoji: '🎉', desc: 'Festival celebrating the end of Ramadan (1 Shawwal).' },
  { name: 'Day of Arafah', month: 'dhualhijjah', day: 9, emoji: '🕋', desc: 'The pinnacle day of the Hajj pilgrimage (9 Dhu al-Hijjah).' },
  { name: 'Eid al-Adha', month: 'dhualhijjah', day: 10, emoji: '🐑', desc: 'The Festival of Sacrifice (10 Dhu al-Hijjah).' }
];

const getNormalizedMonthKey = (monthStr) => {
  const norm = monthStr.toLowerCase();
  if (norm.includes('muharram')) return 'muharram';
  if (norm.includes('safar')) return 'safar';
  if (norm.includes('rabi') && (norm.includes('awwal') || norm.includes(' i') || norm.endsWith(' i'))) return 'rabialawwal';
  if (norm.includes('rabi') && (norm.includes('thani') || norm.includes('akhir') || norm.includes('ii'))) return 'rabialthani';
  if (norm.includes('jumada') && (norm.includes('awwal') || norm.includes(' i') || norm.endsWith(' i'))) return 'jumadaalawwal';
  if (norm.includes('jumada') && (norm.includes('thani') || norm.includes('akhir') || norm.includes('ii'))) return 'jumadaalthani';
  if (norm.includes('rajab')) return 'rajab';
  if (norm.includes('shaban') || norm.includes('sha\'ban')) return 'shaban';
  if (norm.includes('ramadan')) return 'ramadan';
  if (norm.includes('shawwal')) return 'shawwal';
  if (norm.includes('qi\'dah') || norm.includes('qada') || norm.includes('qidah') || norm.includes('qi’dah')) return 'dhualqadah';
  if (norm.includes('hijjah')) return 'dhualhijjah';
  return norm.replace(/[^a-z]/g, '');
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hijriOffset, setHijriOffset] = useState(() => {
    const saved = localStorage.getItem('namazly_hijri_offset');
    return saved !== null ? parseInt(saved, 10) : -1;
  });

  usePageMeta(
    'Islamic Calendar — Clean Hijri-Gregorian Dual View | Namazly',
    'Interactive Hijri & Gregorian dual calendar with moonsighting adjustment controls and upcoming Islamic holidays.',
    '/calendar'
  );

  useEffect(() => {
    localStorage.setItem('namazly_hijri_offset', hijriOffset.toString());
  }, [hijriOffset]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Days calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Helper to format Hijri Date with offset
  const getHijriDate = (year, month, day, offset = 0) => {
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + offset);

    try {
      const dayFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric' });
      const monthFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'long' });
      const yearFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric' });

      const hDay = parseInt(dayFormatter.format(date), 10) || 1;
      const hMonthStr = monthFormatter.format(date);
      const hYearStr = yearFormatter.format(date).replace('AH', '').trim();

      return {
        day: hDay,
        month: hMonthStr,
        monthKey: getNormalizedMonthKey(hMonthStr),
        year: hYearStr
      };
    } catch (e) {
      // Fallback in case Intl calendar fails
      return { day: day, month: 'Ramadan', monthKey: 'ramadan', year: '1447' };
    }
  };

  // Get active Hijri month range represented in this Gregorian month
  const firstDayHijri = getHijriDate(currentYear, currentMonth, 1, hijriOffset);
  const lastDayHijri = getHijriDate(currentYear, currentMonth, daysInMonth, hijriOffset);

  let hijriMonthHeading = firstDayHijri.month;
  if (firstDayHijri.month !== lastDayHijri.month) {
    hijriMonthHeading = `${firstDayHijri.month} / ${lastDayHijri.month}`;
  }
  const hijriYearHeading = firstDayHijri.year === lastDayHijri.year 
    ? `${firstDayHijri.year} AH` 
    : `${firstDayHijri.year} – ${lastDayHijri.year} AH`;

  // Generate calendar days
  const calendarCells = [];
  // Empty slots for preceding month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() && 
                    currentMonth === new Date().getMonth() && 
                    currentYear === new Date().getFullYear();
    const hijri = getHijriDate(currentYear, currentMonth, d, hijriOffset);
    
    // Check if this Hijri day matches any Islamic holiday
    const matchingHoliday = ISLAMIC_EVENTS.find(
      (e) => e.month === hijri.monthKey && e.day === hijri.day
    );

    calendarCells.push({
      gregorianDay: d,
      hijriDay: hijri.day,
      hijriMonth: hijri.month,
      hijriYear: hijri.year,
      isToday,
      holiday: matchingHoliday || null
    });
  }

  // Filter events that occur or are close to this month for the quick list
  const currentMonthEvents = ISLAMIC_EVENTS.map(event => {
    // Estimate corresponding Gregorian dates for events
    // Find matching days in the rendered month
    const matchingCell = calendarCells.find(cell => cell && cell.holiday?.name === event.name);
    return {
      ...event,
      cell: matchingCell || null
    };
  });

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">Islamic Calendar</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main Container */}
      <main id="main-content" tabIndex="-1" className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 w-full space-y-6">
        
        {/* Top Control Bar */}
        <section className="glass-card rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="text-center md:text-left">
            <h1 className="poppins-regular text-2xl sm:text-3xl font-bold text-sage-900 leading-tight">
              {GREGORIAN_MONTHS[currentMonth]} {currentYear}
            </h1>
            <p className="poppins-regular text-gold-500 font-semibold mt-0.5 text-sm sm:text-base flex items-center justify-center md:justify-start gap-1">
              <span>🕌</span>
              <span>{hijriMonthHeading} {hijriYearHeading}</span>
            </p>
          </div>

          {/* Calendar navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-10 h-10 rounded-xl glass-card border border-white/80 text-sage-700 hover:bg-white/95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-xl glass-card border border-white/80 text-xs font-semibold text-sage-700 hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-10 h-10 rounded-xl glass-card border border-white/80 text-sage-700 hover:bg-white/95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Hijri Adjustment Control */}
        <section className="glass-card rounded-3xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-4 animate-fade-in text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-sage-700">
            <span className="text-base sm:text-lg">🌙</span>
            <div>
              <p className="poppins-regular font-bold leading-tight">Hijri Adjustment</p>
              <p className="poppins-regular text-[10px] sm:text-xs text-sage-400">Fine-tune according to your local moonsighting</p>
            </div>
          </div>
          <div className="flex items-center gap-1 glass-card-deep rounded-2xl p-1 border border-white/40">
            <button
              onClick={() => setHijriOffset(prev => Math.max(-2, prev - 1))}
              className="px-2.5 py-1 rounded-xl text-sage-600 hover:bg-white/60 active:scale-90 font-bold transition-all cursor-pointer"
            >
              &minus;
            </button>
            <span className="w-12 text-center poppins-regular font-bold text-sage-800">
              {hijriOffset >= 0 ? `+${hijriOffset}` : hijriOffset} d
            </span>
            <button
              onClick={() => setHijriOffset(prev => Math.min(2, prev + 1))}
              className="px-2.5 py-1 rounded-xl text-sage-600 hover:bg-white/60 active:scale-90 font-bold transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </section>

        {/* Main Grid & Holiday layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Grid (Columns 1 & 2) */}
          <section className="lg:col-span-2 space-y-2 w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card rounded-3xl p-3 sm:p-4 shadow-sm overflow-hidden">
              
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-sage-400 poppins-regular uppercase tracking-wider">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  if (cell === null) {
                    return (
                      <div 
                        key={`empty-${idx}`} 
                        className="aspect-square rounded-2xl bg-sage-50/10 opacity-30" 
                      />
                    );
                  }

                  const { gregorianDay, hijriDay, isToday, holiday } = cell;

                  return (
                    <div
                      key={`day-${gregorianDay}`}
                      className={`relative aspect-square rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center transition-all p-1 group
                        ${isToday 
                          ? 'bg-sage-600 border-sage-700 text-white shadow-md shadow-sage-600/10 scale-100 z-10' 
                          : holiday 
                            ? 'bg-amber-50/60 border-amber-300/60 text-sage-900 hover:bg-amber-100/60' 
                            : 'bg-white/40 border-white/60 text-sage-800 hover:bg-white/80'
                        }
                      `}
                    >
                      {/* Gregorian Day (Main) */}
                      <span className="poppins-regular text-sm sm:text-lg font-bold tracking-tight">
                        {gregorianDay}
                      </span>

                      {/* Hijri Day (Sub) */}
                      <span className={`poppins-regular text-[9px] sm:text-xs font-semibold mt-0.5 sm:mt-1
                        ${isToday 
                          ? 'text-white/80' 
                          : holiday 
                            ? 'text-amber-600' 
                            : 'text-sage-400'
                        }
                      `}>
                        {hijriDay}
                      </span>

                      {/* Holiday indicator dot */}
                      {holiday && !isToday && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      )}

                      {/* Desktop Hover Tooltip */}
                      {holiday && (
                        <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 glass-card p-2 rounded-xl text-left shadow-lg scale-0 group-hover:scale-100 transition-transform origin-bottom z-20 text-[10px] leading-relaxed text-sage-700">
                          <p className="font-bold text-amber-600">{holiday.emoji} {holiday.name}</p>
                          <p className="mt-0.5">{hijriDay} {cell.hijriMonth}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* Upcoming Holy Days / Events (Column 3) */}
          <section className="lg:col-span-1 space-y-4 w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-3xl p-5 shadow-sm space-y-4 flex flex-col h-full justify-between">
              <div>
                <h3 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2 mb-1">
                  <span>📅</span>
                  <span>Islamic Holy Days</span>
                </h3>
                <p className="poppins-regular text-xs text-sage-500 leading-relaxed mb-4">
                  Important events occurring during this month or throughout the Islamic year.
                </p>

                {/* Vertical events stack */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {currentMonthEvents.map((event) => {
                    const isOccurrence = event.cell !== null;
                    return (
                      <div
                        key={event.name}
                        className={`p-3 rounded-2xl border transition-all flex items-start gap-3 text-xs leading-relaxed
                          ${isOccurrence
                            ? 'bg-amber-50/50 border-amber-300/40 shadow-sm'
                            : 'bg-white/30 border-white/50'
                          }
                        `}
                      >
                        <span className="text-lg py-0.5">{event.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="poppins-regular font-bold text-sage-900 text-xs">{event.name}</h4>
                            {isOccurrence && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold poppins-regular shrink-0">
                                This Month ({event.cell.gregorianDay} {GREGORIAN_MONTHS[currentMonth].substring(0, 3)})
                              </span>
                            )}
                          </div>
                          <p className="poppins-regular text-sage-500 mt-1 text-[11px] leading-tight">
                            {event.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom quote */}
              <div className="border-t border-sage-100/60 pt-4 mt-2">
                <p className="poppins-regular text-[10px] text-sage-400 italic text-center leading-relaxed">
                  "Indeed, the number of months with Allah is twelve [lunar] months..." <br />— Quran 9:36
                </p>
              </div>

            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
