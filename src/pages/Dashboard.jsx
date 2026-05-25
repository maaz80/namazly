import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QazaCalculator from '../components/QazaCalculator';
import PrayerTracker from '../components/PrayerTracker';
import StatsSummary from '../components/StatsSummary';
import AuthModal from '../components/AuthModal';
import api from '../utils/api';
import { PRAYERS } from '../utils/constants';

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
          This will permanently reset <span className="font-semibold text-rose-500">all your Qaza prayer counts</span> to zero.
          This action <span className="font-semibold">cannot be undone</span>.
        </p>

        {/* Warning box */}
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 px-4 py-3 mb-5">
          <p className="poppins-regular text-xs text-rose-600 leading-relaxed">
            ⚠️ All prayer records (Fajr, Dhuhr, Asr, Maghrib, Isha, Witr) will be set to <span className="font-bold">0 rakats</span>.
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
            Yes, Clear All 🗑️
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

// Module-level variable to lock the layout alignment for the entire session
let sessionLockedHasData = null;

export default function Dashboard() {
  const { user, updateQazaRecord } = useAuth();
  const [qazaRecord, setQazaRecord] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [initialHasData, setInitialHasData] = useState(() => {
    if (sessionLockedHasData !== null) {
      return sessionLockedHasData;
    }
    return false;
  });

  /* Update page title per auth state */
  useEffect(() => {
    document.title = user
      ? `${user.name?.split(' ')[0]}'s Qaza Tracker — Namazly`
      : 'Dashboard — Namazly | Qaza Prayer Tracker';
  }, [user]);

  /* Fetch latest records on mount, or reset instantly on logout */
  useEffect(() => {
    if (sessionLockedHasData !== null) {
      // Already locked for this session, keep the layout order static
      setInitialHasData(sessionLockedHasData);
      setLoading(false);

      // Refresh records in background to keep data state fresh
      if (user) {
        const cached = localStorage.getItem(`namazly_user_record_${user.id}`);
        if (cached) {
          try {
            setQazaRecord(JSON.parse(cached));
          } catch (err) {
            console.error('Failed to parse cached records:', err);
          }
        }
        api.get('/records')
          .then(({ data }) => {
            setQazaRecord(data.qazaRecord);
            updateQazaRecord(data.qazaRecord);
            localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(data.qazaRecord));
          })
          .catch((err) => console.error('Failed to refresh records:', err));
      } else {
        const guestRecord = localStorage.getItem('namazly_guest_record');
        if (guestRecord) {
          try {
            setQazaRecord(JSON.parse(guestRecord));
          } catch (err) {
            console.error('Failed to parse guest records:', err);
          }
        }
      }
      return;
    }

    if (user) {
      // 1. Instantly load from localStorage cache if it exists to avoid Render cold-start spinners
      const cached = localStorage.getItem(`namazly_user_record_${user.id}`);
      let localHasData = false;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setQazaRecord(parsed);
          localHasData = PRAYERS.some((p) => (parsed?.[p.key] ?? 0) > 0);
          sessionLockedHasData = localHasData;
          setInitialHasData(localHasData);
          setLoading(false);
        } catch (err) {
          console.error('Failed to parse cached records:', err);
        }
      }

      // 2. Refresh from backend in background
      const fetchRecords = async () => {
        try {
          const { data } = await api.get('/records');
          setQazaRecord(data.qazaRecord);
          updateQazaRecord(data.qazaRecord);
          // Sync backend data to cache
          localStorage.setItem(`namazly_user_record_${user.id}`, JSON.stringify(data.qazaRecord));
          
          // If no cache was loaded on mount, set initialHasData from DB fetch
          if (sessionLockedHasData === null) {
            const dbHasData = PRAYERS.some((p) => (data.qazaRecord?.[p.key] ?? 0) > 0);
            sessionLockedHasData = dbHasData;
            setInitialHasData(dbHasData);
          }
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
      let guestHasData = false;
      const empty = {};
      PRAYERS.forEach((p) => { empty[p.key] = 0; });
      
      if (guestRecord) {
        try {
          const parsed = JSON.parse(guestRecord);
          setQazaRecord(parsed);
          guestHasData = PRAYERS.some((p) => (parsed?.[p.key] ?? 0) > 0);
        } catch (err) {
          console.error('Failed to parse guest records:', err);
          setQazaRecord(empty);
        }
      } else {
        setQazaRecord(empty);
      }
      sessionLockedHasData = guestHasData;
      setInitialHasData(guestHasData);
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

  /* Called when calculator outputs a day count — replaces (not adds to) existing data */
  const handleCalculatorApply = useCallback(async (days) => {
    const updated = {};
    PRAYERS.forEach((p) => {
      updated[p.key] = days * p.rakats; // SET, not add
    });

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
        aria-label="Loading your prayer records"
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
        aria-label="Qaza prayer tracker dashboard"
      >
        {/* Welcome banner */}
        <div className="mb-8 animate-fade-in">
          <p className="poppins-regular text-sage-500 text-sm mb-1">{getGreeting()},</p>
          <h1 className="poppins-regular text-3xl md:text-4xl font-bold">
            <span className="gradient-text">{user ? user.name?.split(' ')[0] : 'Guest'}</span>
            <span className="text-sage-800 text-2xl md:text-3xl font-medium"> 🌙</span>
          </h1>
          <p className="poppins-regular text-sage-500 mt-1.5">
            {user ? 'May Allah accept your prayers and ease your journey.' : 'Estimate, track, and manage your missed prayers locally.'}
          </p>
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
        {(() => {
          return (
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
              {/* 1. Stats Summary (Total Prayer Box) — Always top on mobile */}
              <div
                className="order-1 lg:col-span-1 w-full animate-slide-up"
                style={{ animationDelay: '0.1s' }}
              >
                <StatsSummary qazaRecord={qazaRecord} />
              </div>

              {/* 2. Prayer Tracker */}
              <div
                className={`lg:col-span-2 animate-slide-up w-full ${initialHasData ? 'order-2' : 'order-3'}`}
                style={{ animationDelay: '0.15s' }}
              >
                <PrayerTracker
                  qazaRecord={qazaRecord}
                  onUpdate={handleRecordUpdate}
                  isGuest={!user}
                  onSaveAttempt={() => setIsAuthModalOpen(true)}
                />
              </div>

              {/* 3. Calculator & Clear Data Button */}
              <div
                className={`space-y-6 lg:col-span-1 w-full ${initialHasData ? 'order-3' : 'order-2'}`}
              >
                {/* Calculator */}
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
                    <span>🗑️</span>
                    <span>Clear All Data</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer note */}
        <p className="text-center poppins-regular text-sage-400 text-sm mt-12 opacity-70 leading-relaxed">
          وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
        </p>
        <p className="text-center poppins-regular text-sage-400 text-xs mt-1 mb-6 opacity-60">
          "And establish prayer and give zakah" — Quran 2:43
        </p>
      </main>

      {/* On-Demand Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

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
