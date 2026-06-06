import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, 
  HiOutlineCalculator, 
  HiOutlineCalendar, 
  HiOutlineClock, 
  HiOutlineCloudUpload, 
  HiOutlineShieldCheck,
  HiOutlineArrowLeft,
  HiOutlineStar,
  HiOutlineChatAlt2
} from 'react-icons/hi';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

/* Decorative background orbs */
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

export default function GuidePage() {
  const navigate = useNavigate();

  usePageMeta(
    'User Usage Guide — Namazly | How to Track Qaza Namaz',
    'A complete user guide and instruction manual explaining how to estimate qaza namaz, navigate the Islamic calendar, and track daily timings.',
    '/guide'
  );

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4 text-sage-600" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">Usage Guide</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Banner Card */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-200 to-sage-300/40 flex items-center justify-center mx-auto shadow-md">
            <HiOutlineBookOpen className="text-3xl text-sage-700" />
          </div>
          <h1 className="poppins-regular text-3xl font-black text-sage-900 tracking-tight leading-tight">
            Namazly User Guide
          </h1>
          <p className="poppins-regular text-sm text-sage-600 max-w-md mx-auto leading-relaxed">
            Welcome to the instruction manual. Learn how to estimate, track, and manage your prayers seamlessly with Namazly's features.
          </p>
        </section>

        {/* Instructions Grid */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>

          {/* 1. Quick Start */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineCloudUpload className="text-xl text-sage-500" />
              <span>1. Quick Start: Guest vs. Cloud Sync</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <div className="p-4 rounded-2xl bg-white/40 border border-white/60 space-y-2">
                <h3 className="font-bold text-sage-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Guest Mode (Offline-first)
                </h3>
                <p>
                  You can use Namazly instantly without registering. Any calculated and recorded namaz are stored securely directly inside your browser's local storage.
                </p>
                <p className="text-[11px] text-sage-400">
                  ⚠️ Clearing your browser cache or cookies may wipe guest tracker history.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-sage-50/40 border border-sage-200/50 space-y-2">
                <h3 className="font-bold text-sage-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                  Cloud Sync (Google Account)
                </h3>
                <p>
                  Sign in with Google at any time. Namazly will automatically migrate all your local guest records straight into the secure cloud database.
                </p>
                <p className="text-[11px] text-sage-400">
                  ✅ Access and update your records on any smartphone, tablet, or desktop.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Missed Prayers Tracker & Calculator */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineCalculator className="text-xl text-sage-500" />
              <span>2. Qaza Tracker & Smart Calculator</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <div className="space-y-2">
                <h3 className="font-bold text-sage-800">📊 Calculating Missed Namaz</h3>
                <p>
                  Unsure how many namaz you have missed? Open the <strong>Qaza Calculator</strong> on your dashboard. Enter your age of puberty, current age, and the years you spent praying regularly. 
                </p>
                <p>
                  Tapping Apply Calculation automatically generates your total missed namaz counts, converting years/days into specific Rakat totals for each of the daily prayers (Fajr, Zohar, Asr, Maghrib, Isha Farz, and Isha Witr).
                </p>
              </div>
              <div className="space-y-2 border-t border-sage-100/40 pt-3">
                <h3 className="font-bold text-sage-800">♀ Female Menstruation Exemption Deduction</h3>
                <p>
                  For sisters, select <strong>Female</strong> gender inside the calculator. This displays a slider to input your average period duration (e.g. 7 days).
                </p>
                <p>
                  The calculator automatically computes and deducts your average monthly period days from your total missed Qaza days (since women are exempt from namaz obligations and making them up during menstruation under Shariah). It provides a full breakdown (Gross days vs. Period exemption days) before replacing counts.
                </p>
              </div>
              <div className="space-y-2 border-t border-sage-100/40 pt-3">
                <h3 className="font-bold text-sage-800">✅ Recording Your Progress</h3>
                <p>
                  As you make up your missed prayers, tap the green `+` button on any prayer card to increment your count. If you make a mistake, tap `-` to decrement.
                </p>
                <p>
                  The <strong>Stats Summary</strong> card dynamically updates your percentage completed, total rakats prayed, and visualizes your progress to keep you motivated.
                </p>
              </div>
              <div className="space-y-2 border-t border-sage-100/40 pt-3">
                <h3 className="font-bold text-sage-800">🗑️ Restarting Fresh</h3>
                <p>
                  If you wish to reset all counts to zero, tap the red **Clear All Data** button at the bottom of the page, review the prompt, and confirm to start fresh.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Dual Islamic Calendar */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineCalendar className="text-xl text-sage-500" />
              <span>3. Dual Hijri-Gregorian Calendar</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <p>
                The <strong>Islamic Calendar</strong> page displays a dual grid combining standard Gregorian dates with their corresponding Islamic Hijri date.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">🌙 Moonsighting Adjustment</h3>
                  <p>
                    Because Islamic months depend on regional moon sightings, Hijri dates can vary by 1–2 days. Use the Adjustment Control panel on the calendar page to shift the Hijri dates backward or forward (`-2` to `+2` days) to align with your local mosque.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">🕋 Islamic Holidays & Holy Days</h3>
                  <p>
                    Important events (such as the start of Ramadan, Eid al-Fitr, Eid al-Adha, and Ashura) are listed dynamically. Any holiday occurring in the currently viewed month is flagged automatically on the calendar grid with a gold indicator.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Daily Namaz Timings */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineClock className="text-xl text-sage-500" />
              <span>4. Real-time Namaz Timings Dashboard</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <p>
                The <strong>Daily Namaz Timings</strong> page fetches precise prayer starting times using a secure connection to the global Aladhan API.
              </p>
              <div className="space-y-2">
                <h3 className="font-bold text-sage-800">🎯 GPS Coordinates vs. Manual Search</h3>
                <p>
                  By default, Namazly requests browser Geolocation. Granting access allows us to pinpoint your exact coordinates and load local prayer timings. If denied, the page falls back to manual mode. You can enter any global city and country in the search panel to look up times.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-sage-100/40 pt-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">⏳ Next Prayer Countdown</h3>
                  <p>
                    A real-time countdown display (`HH:MM:SS`) is rendered at the top, updating every second to show precisely how much time remains before the next prayer starts.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">🟢 Current Active Prayer</h3>
                  <p>
                    The currently active prayer is highlighted automatically in the timings sheet with a glowing border, a pulsing marker, and an "Active Now" badge.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Hadith of the Day */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineStar className="text-xl text-sage-500" />
              <span>5. Hadith of the Day & Sharing</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <p>
                The <strong>Hadith of the Day</strong> page displays a beautiful daily curated authentic Hadith to keep you spiritually inspired.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">✨ English & Arabic Views</h3>
                  <p>
                    Read the original Arabic text in elegant typography alongside its authentic English translation and narrator references.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">🔄 Randomizer & Sharing</h3>
                  <p>
                    Click the <strong>Random Hadith</strong> button to load other inspiring lessons. Use the <strong>Copy Text</strong> or <strong>Share</strong> buttons to copy the full formatted text or send it directly to your family and friends.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. User Reviews & Feedback */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineChatAlt2 className="text-xl text-sage-500" />
              <span>6. User Reviews &amp; Feedback</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <p>
                We highly value community feedback. The <strong>User Reviews</strong> page allows you to share your experiences and see what other brothers and sisters say.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">⭐ Rating & Comments</h3>
                  <p>
                    Provide a star rating from 1 to 5 stars, write your comment/suggestions, and submit. If you are signed in, it will show your verified name and profile picture. If you are a guest, you can enter any name you like.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sage-800">📊 Dashboard Reviews Widget</h3>
                  <p>
                    A clean widget displaying the most recent user reviews is also visible at the bottom of the main <strong>Dashboard</strong> page, encouraging community interaction and continuous development.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Privacy First Philosophy */}
          <section className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-4">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2.5 pb-2 border-b border-sage-100/60">
              <HiOutlineShieldCheck className="text-xl text-sage-500" />
              <span>7. Our Privacy-First Commitment</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed poppins-regular text-sage-600">
              <p>
                Namazly is built with complete sincerity as an open utility for Muslims around the world.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>**No Ads or Distractions**: Namazly is entirely free, contains zero ads, and does not sell features or track your browsing habits.</li>
                <li>**Secure Google Auth**: Google Sign-in is handled securely. We only store your email, name, avatar link, and qaza namaz counts.</li>
                <li>**Zero Metadata Selling**: We never sell, rent, or share personal profiles or location data with third parties.</li>
              </ul>
            </div>
          </section>

        </div>

      </main>
      <Footer />
    </div>
  );
}
