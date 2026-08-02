import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QazaCalculator from '../components/QazaCalculator';
import PrayerTracker from '../components/PrayerTracker';
import StatsSummary from '../components/StatsSummary';
import HomePrayerTimings from '../components/HomePrayerTimings';

const AuthModal = lazy(() => import('../components/AuthModal'));
import api from '../utils/api';
import { PRAYERS } from '../utils/constants';
import { HiStar, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineBookOpen } from 'react-icons/hi';
import { IoIosArrowForward } from "react-icons/io";
import { getOptimizedAvatar } from '../utils/avatar';
import Footer from '../components/Footer';

/* ── Clear All Confirmation Modal ────────────────────── */
function ClearAllModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(31,67,54,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-scale-in">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🗑️</span>
        </div>

        <h3 className="poppins-regular text-xl font-bold text-sage-900 text-center mb-2">
          Clear All Data?
        </h3>
        <p className="poppins-regular text-sage-500 text-sm text-center mb-5 leading-relaxed">
          This will permanently reset <span className="font-semibold text-rose-500">all your Qaza namaz counts</span> to zero.
          This action <span className="font-semibold">cannot be undone</span>.
        </p>

        {/* Warning box */}
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 px-4 py-3 mb-5">
          <p className="poppins-regular text-xs text-rose-600 leading-relaxed">
            ⚠️ All namaz records (Fajr, Dhuhr, Asr, Maghrib, Isha, Witr) will be set to <span className="font-bold">0 rakats</span>.
            Make sure you truly want to start fresh before confirming.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl poppins-regular font-medium text-sage-600 text-sm
                       bg-sage-50/60 hover:bg-sage-100/60 border border-sage-200/60
                       transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Keep Data
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl poppins-regular font-semibold text-white text-sm
                       bg-gradient-to-r from-rose-500 to-red-500
                       hover:from-rose-600 hover:to-red-600
                       shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

/* Decorative background */
const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle at 80% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 20% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle, #f0c97a 0%, transparent 70%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

/* Greeting based on time */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

const ARTICLES = [
  {
    title: "How to Calculate Qaza Namaz: A Step-by-Step Guide",
    tag: "Calculation & Tracking",
    summary: "Learn how to easily perform Qaza Namaz calculations for missed prayers in Islam. Get accurate counts for Qaza-e-Umri based on puberty and missed years.",
    content: "Performing missed prayers or Qaza Salah is an obligatory debt (Fard) in Islamic jurisprudence. If you have years of pending prayers, calculating them manually can be difficult. The best way is to use a Qaza Namaz calculator online to estimate your missed prayers from the age of puberty (Baligh). Our tool allows sisters to input their menstruation cycles to deduct exempt days, ensuring precise tracking. To pray Qaza Namaz fast and efficiently, we recommend tracking each Qaza-e-Umri daily alongside your regular Salah."
  },
  {
    title: "The Rules of Qaza Salah: Obligation of Missed Prayers",
    tag: "Islamic Rulings",
    summary: "What does the Quran and Hadith say about missed prayers in Islam? Learn the rulings on Qaza Namaz and the obligation of Witr Qaza.",
    content: "Missing a prayer is a serious matter, and according to the consensus of scholars (including Deoband and traditional schools), making up missed prayers is mandatory. In the Hanafi madhhab, the three Rakat Witr prayer of Isha is Wajib, meaning Witr Qaza Namaz is also obligatory to make up. When performing Qaza, one must make a clear Niyat (intention) for the specific missed prayer (e.g., 'I intend to pray the first missed Fajr'). There are three prohibited times for Qaza Namaz: during sunrise (Tulu), sunset (Ghurub), and when the sun is at its zenith (Zawaal)."
  },
  {
    title: "How to Perform Qaza-e-Umri Salah Quickly & Consistently",
    tag: "Salah Recovery",
    summary: "Tips on how to pray missed prayers in Islam and maintain a consistent recovery track without getting overwhelmed.",
    content: "Many Muslims struggle with the order (Tarteeb) of performing Qaza prayers. If you have years of missed prayers, the most practical method is to pray one Qaza Salah alongside each daily Fard prayer. For example, pray one Qaza Fajr right after your daily Fajr. To make the process faster, you can focus on the obligatory parts (Fard and Wajib) of the Salah and keep a structured tracker. Using an online Qaza tracker like Namazly helps you sync your progress to the cloud so you never lose count of your Qaza-e-Umri recovery journey."
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, updateQazaRecord } = useAuth();
  const [dashboardReviews, setDashboardReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveArticleIndex((prev) => (prev + 1) % ARTICLES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);
  const [qazaRecord, setQazaRecord] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`namazly_user_record_${user.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (err) {
          console.error('Failed to parse cached records:', err);
        }
      }
      return {};
    } else {
      const guestRecord = localStorage.getItem('namazly_guest_record');
      if (guestRecord) {
        try {
          return JSON.parse(guestRecord);
        } catch (err) {
          console.error('Failed to parse guest records:', err);
        }
      }
      const empty = {};
      PRAYERS.forEach((p) => { empty[p.key] = 0; });
      return empty;
    }
  });

  const [loading, setLoading] = useState(() => {
    if (!user) return false;
    const cached = localStorage.getItem(`namazly_user_record_${user.id}`);
    if (cached) return false;
    return true;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isData, setIsData] = useState(false);
  /* Update page title per auth state */
  useEffect(() => {
    document.title = user
      ? `${user.name?.split(' ')[0]}'s Qaza Calculator — Namazly`
      : 'Qaza Namaz Calculator and Manager | Namazly';
  }, [user]);

  /* Fetch latest records on mount, or reset instantly on logout */
  useEffect(() => {
    if (user) {
      const cached = localStorage.getItem(`namazly_user_record_${user.id}`);
      if (cached) {
        try {
          setQazaRecord(JSON.parse(cached));
          setLoading(false);
        } catch (err) {
          console.error('Failed to parse cached records:', err);
        }
      } else {
        setLoading(true);
      }

      // Refresh from backend in background
      const fetchRecords = async () => {
        try {
          const { data } = await api.get('/records');
          setQazaRecord(data.qazaRecord);
          updateQazaRecord(data.qazaRecord);
          // Sync backend data to cache
          localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(data.qazaRecord));
        } catch (err) {
          console.error('Failed to fetch records:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRecords();
    } else {
      // user is guest — load guest records
      const guestRecord = localStorage.getItem('namazly_guest_record');
      const empty = {};
      PRAYERS.forEach((p) => { empty[p.key] = 0; });

      if (guestRecord) {
        try {
          setQazaRecord(JSON.parse(guestRecord));
        } catch (err) {
          console.error('Failed to parse guest records:', err);
          setQazaRecord(empty);
        }
      } else {
        setQazaRecord(empty);
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* Sync local storage guest record with database upon sign in */
  useEffect(() => {
    if (user) {
      const guestRecord = localStorage.getItem('namazly_guest_record');
      if (guestRecord) {
        const syncGuestRecord = async () => {
          try {
            const parsed = JSON.parse(guestRecord);
            const { data } = await api.put('/records', parsed);
            setQazaRecord(data.qazaRecord);
            updateQazaRecord(data.qazaRecord);
            localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(data.qazaRecord));
            localStorage.removeItem('namazly_guest_record');
          } catch (err) {
            console.error('Failed to sync guest record:', err);
          }
        };
        syncGuestRecord();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* Fetch newest reviews on mount for dashboard footer */
  useEffect(() => {
    const fetchDashboardReviews = async () => {
      try {
        const { data } = await api.get('/reviews');
        if (data.success) {
          setDashboardReviews(data.reviews.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchDashboardReviews();
  }, []);

  /* Called when calculator outputs a day count — replaces (not adds to) existing data */
  const handleCalculatorApply = useCallback(async (days) => {
    const updated = {};
    PRAYERS.forEach((p) => {
      updated[p.key] = days * p.rakats; // SET, not add
    });

    // Track namaz calculation in analytics dynamically
    import('../utils/analytics')
      .then(({ trackNamazCalculation }) => trackNamazCalculation())
      .catch(err => console.error('Failed to load analytics dynamically on calculate:', err));

    if (!user) {
      setQazaRecord(updated);
      localStorage.setItem('namazly_guest_record', JSON.stringify(updated));
      setIsAuthModalOpen(true);
    } else {
      try {
        const { data } = await api.put('/records', updated);
        setQazaRecord(data.qazaRecord);
        updateQazaRecord(data.qazaRecord);
        localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(data.qazaRecord));
      } catch (err) {
        console.error('Failed to apply calculator result:', err);
      }
    }
  }, [user, updateQazaRecord]);

  /* Clear all prayer records */
  const handleClearAll = useCallback(async () => {
    const empty = {};
    PRAYERS.forEach((p) => { empty[p.key] = 0; });

    if (!user) {
      setQazaRecord(empty);
      localStorage.setItem('namazly_guest_record', JSON.stringify(empty));
    } else {
      try {
        const { data } = await api.put('/records', empty);
        setQazaRecord(data.qazaRecord);
        updateQazaRecord(data.qazaRecord);
        localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(empty));
      } catch (err) {
        console.error('Failed to clear records:', err);
      }
    }
  }, [user, updateQazaRecord]);

  /* Called by PrayerRow after each debounced save or guest change */
  const handleRecordUpdate = useCallback((newRecord) => {
    setQazaRecord(newRecord);
    if (user) {
      updateQazaRecord(newRecord);
      localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(newRecord));
    } else {
      localStorage.setItem('namazly_guest_record', JSON.stringify(newRecord));
    }
  }, [user, updateQazaRecord]);

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading your namaz records"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 50%, #eef2ee 100%)' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
            style={{ border: '3px solid #c1dace', borderTopColor: '#3d8265' }}
            aria-hidden="true"
          />
          <p className="poppins-regular text-sage-500 text-sm">Loading your records…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />

      <main
        className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10"
        id="main-content"
        tabIndex="-1"
        aria-label="Qaza namaz manager dashboard"
      >
        {/* Welcome banner */}
        <div className="mb-6">
          <p className="poppins-regular text-sage-500 text-sm mb-1">{getGreeting()},</p>
          <h1 className="poppins-regular text-3xl md:text-4xl font-bold">
            <span className="gradient-text">{user ? user.name?.split(' ')[0] : 'Namazly'}</span>
            <span className="text-sage-800 text-2xl md:text-3xl font-medium"> 🌙</span>
          </h1>
          <p className="poppins-regular text-sage-500 mt-1.5">
            {user ? 'May Allah accept your namaz and ease your journey.' : 'Estimate, track, and manage your missed namaz locally.'}
          </p>
        </div>

        {/* Minimalist Top Prayer Timings */}
        <div className="mb-6 animate-fade-in">
          <HomePrayerTimings />
        </div>

        {/* Guest Mode Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-3xl glass-card border-amber-300/40 bg-amber-50/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div className="text-left">
                <p className="poppins-regular text-sm font-semibold text-sage-900 leading-tight">Guest Tracking Mode</p>
                <p className="poppins-regular text-xs text-sage-500 mt-0.5">Your progress is currently saved in this browser. Sign in to sync permanently to the cloud.</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Sign In to Sync
            </button>
          </div>
        )}

        {/* Layout grid */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
          {/* Left Column (Stats Summary & Calculator stacked closely) */}
          <div className="space-y-6 lg:col-span-1 w-full flex flex-col">
            {/* 1. Stats Summary (Total Prayer Box) */}
            <div
              className="w-full animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <StatsSummary qazaRecord={qazaRecord} />
            </div>

            {/* 3. Calculator */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <QazaCalculator onApply={handleCalculatorApply} />
            </div>

            {/* Clear All Data button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <button
                onClick={() => setShowClearModal(true)}
                className="w-full py-3 rounded-2xl poppins-regular font-semibold text-rose-500 text-sm
                           bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/60
                           hover:border-rose-300/80 shadow-sm hover:shadow-md
                           transition-all duration-200 active:scale-[0.98] cursor-pointer
                           flex items-center justify-center gap-2"
              >
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Right Column (2. Prayer Tracker) */}
          <div
            className="lg:col-span-2 animate-slide-up w-full"
            style={{ animationDelay: '0.15s' }}
          >
            <PrayerTracker
              qazaRecord={qazaRecord}
              onUpdate={handleRecordUpdate}
              isGuest={!user}
              onSaveAttempt={() => setIsAuthModalOpen(true)}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 space-y-4 animate-fade-in content-auto">
          <div className="flex items-center justify-between border-b border-sage-100/50 pb-2">
            <h2 className="poppins-regular text-base sm:text-lg font-bold text-sage-900 flex items-center gap-2">
              User Reviews
            </h2>
            <button
              onClick={() => navigate('/reviews')}
              className="text-xs font-semibold text-sage-600 hover:text-sage-800 transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1"
            >
              <span>View All</span>
              <span><IoIosArrowForward /></span>
            </button>
          </div>

          {loadingReviews ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
            </div>
          ) : dashboardReviews.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center text-sage-500 text-xs border border-white/60">
              No reviews yet. <span onClick={() => navigate('/reviews')} className="text-sage-600 underline font-semibold cursor-pointer">Be the first to rate us!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardReviews.map(rev => {
                const isGuest = !rev.user;
                const name = isGuest ? rev.guestName : rev.user.name;
                const avatar = isGuest ? null : rev.user.avatar;
                const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'G';
                const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={rev._id}
                    className="glass-card rounded-2xl p-4 shadow-sm border border-white/70 flex flex-col justify-between gap-3 text-xs leading-relaxed"
                  >
                    <div className="space-y-1.5">
                      {/* Rating Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <HiStar
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400' : 'text-sage-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-sage-400 font-semibold">{dateStr}</span>
                      </div>

                      {/* Comment */}
                      <p className="text-sage-600 italic leading-snug">
                        "{rev.comment.length > 80 ? rev.comment.substring(0, 80) + '...' : rev.comment}"
                      </p>
                    </div>

                    {/* Reviewer */}
                    <div className="flex items-center gap-2 pt-2 border-t border-sage-100/30">
                      {avatar ? (
                        <img
                          src={getOptimizedAvatar(avatar, 48)}
                          onError={(e) => { e.currentTarget.src = '/icon-48.png'; }}
                          alt={name}
                          width="22"
                          height="22"
                          className="w-5.5 h-5.5 rounded-full border border-white object-cover bg-sage-50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 text-white flex items-center justify-center font-bold text-[8px] border border-white/80">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sage-800 truncate leading-tight">{name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Articles SEO Carousel */}
        <section className="mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2">
              <span>Islamic Articles</span>
            </h2>

            {/* Manual Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveArticleIndex((prev) => (prev - 1 + ARTICLES.length) % ARTICLES.length)}
                aria-label="Previous Article"
                className="w-12 h-12 flex items-center justify-center rounded-xl glass-card border border-white/60 hover:bg-white/80 active:scale-90 transition-all text-sage-600 cursor-pointer bg-transparent"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveArticleIndex((prev) => (prev + 1) % ARTICLES.length)}
                aria-label="Next Article"
                className="w-12 h-12 flex items-center justify-center rounded-xl glass-card border border-white/60 hover:bg-white/80 active:scale-90 transition-all text-sage-600 cursor-pointer bg-transparent"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 shadow-md border border-white/80 relative overflow-hidden bg-gradient-to-br from-sage-50/20 to-cream-50/20 min-h-[350px] sm:min-h-[260px] md:min-h-[320px]">
            {ARTICLES.map((article, idx) => {
              const isActive = idx === activeArticleIndex;
              return (
                <article
                  key={idx}
                  className={`transition-all duration-500 ease-in-out ${
                    isActive ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 absolute top-6 left-6 right-6 md:top-8 md:left-8 md:right-8 pointer-events-none z-0'
                  }`}
                >
                  <div className="space-y-3 text-left">
                    <span className="px-2.5 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
                      {article.tag}
                    </span>
                    <h3 className="poppins-regular text-xl font-bold text-sage-900 leading-tight">
                      {article.title}
                    </h3>
                    <p className="poppins-regular text-xs font-semibold text-sage-400">
                      {article.summary}
                    </p>
                    <p className="poppins-regular text-xs sm:text-sm text-sage-600 leading-relaxed pt-1 select-text">
                      {article.content}
                    </p>
                  </div>
                </article>
              );
            })}

            {/* Pagination Indicator Dots */}
            <div className="flex justify-center mt-3">
              {ARTICLES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveArticleIndex(idx)}
                  className="w-12 h-12 flex items-center justify-center border-0 bg-transparent cursor-pointer transition-all"
                  aria-label={`Go to article ${idx + 1}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeArticleIndex ? 'bg-sage-600 w-5' : 'bg-sage-200 hover:bg-sage-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <p className="text-center poppins-regular text-sage-400 text-sm mt-12 opacity-70 leading-relaxed">
          وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
        </p>
        <p className="text-center poppins-regular text-sage-400 text-xs mt-1 mb-6 opacity-60">
          "And establish prayer and give zakah" — Quran 2:43
        </p>
      </main>

      <Footer />

      {/* On-Demand Authentication Modal */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearModal && (
        <ClearAllModal
          onConfirm={() => {
            handleClearAll();
            setShowClearModal(false);
          }}
          onCancel={() => setShowClearModal(false)}
        />
      )}
    </div>
  );
}
