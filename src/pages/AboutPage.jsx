import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { HiOutlineBookOpen, HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi';
import usePageMeta from '../hooks/usePageMeta';

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

export default function AboutPage() {
  const navigate = useNavigate();

  usePageMeta(
    'About Namazly — Qaza Salah Tracker & Privacy First App',
    'Learn about Namazly, a beautiful, privacy-first Qaza namaz tracking application designed to help Muslims easily fulfill their missed salah.',
    '/about'
  );

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      <Navbar onAuthClick={() => navigate('/')} />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-center animate-fade-in">
        
        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-4xl">🌙</span>
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            About <span className="gradient-text">Namazly</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm mt-1 max-w-md mx-auto">
            A beautiful, distraction-free Islamic utility designed to help you organize and complete your Qaza Namaz.
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 space-y-6">
          
          {/* Mission Section */}
          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2">
              <HiOutlineSparkles className="text-xl text-sage-500" />
              Our Mission
            </h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              Every missed prayer is a spiritual debt. Calculating and keeping track of years of missed salah (Qaza-e-Umri) manually can feel overwhelming. Namazly is built to eliminate the complexity by offering a clean, simple, and visually rewarding interface to estimate, organize, and steadily reduce your pending prayers.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          {/* Privacy Section */}
          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2">
              <HiOutlineShieldCheck className="text-xl text-sage-500" />
              Privacy-First & Secure
            </h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              We strongly believe your spiritual records are sacred. Namazly guarantees:
            </p>
            <ul className="poppins-regular text-xs sm:text-sm text-sage-600 space-y-1.5 pl-4 list-disc">
              {/* <li><span className="font-semibold text-sage-800">Minimal Advertisements:</span> We display a few unobtrusive ads strictly to generate a little income for server hosting and active database maintenance.</li> */}
              <li><span className="font-semibold text-sage-800">No User Tracking:</span> We do not use analytical cookies, pixel trackers, or background telemetry.</li>
              <li><span className="font-semibold text-sage-800">Local Caching:</span> Guests can calculate and store all records strictly inside their browser.</li>
              <li><span className="font-semibold text-sage-800">Cloud Sync:</span> Users signing in via Google have their records stored in a secure cloud database.</li>
            </ul>
          </section>

          <hr className="border-sage-100/50" />

          {/* Core Tech Section */}
          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2">
              <HiOutlineBookOpen className="text-xl text-sage-500" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Advanced Qaza Calculator</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Quickly compute Qaza Salah based on years, days, or custom durations (includes menstruation cycle deductions).</p>
                </div>
              </div>
              {/* <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Instant Offline Caching</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Loads your data instantly from cached memory, bypasses slow server wake-ups, and syncs in the background.</p>
                </div>
              </div> */}
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Hadith of the Day</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Daily curated authentic Hadiths in English and Arabic, with share and copy options.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Installable PWA App</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Add to your home screen for standalone fullscreen native utility and offline use.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Daily GPS Prayer Timings</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Real-time local prayer times with automated GPS geolocation detection or manual search.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Interactive Islamic Calendar</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Browse Hijri-Gregorian dates, flag holidays, and fine-tune dates with moonsighting offset settings.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Interactive Progress & Stats</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Visualize your completed salah percentage, total Rakat counts, and maintain active logs.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">Secure Cloud Sync</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Link your Google account to back up and sync your progress seamlessly across multiple devices.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <HiOutlineCheckCircle className="text-sage-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-regular text-xs font-bold text-sage-800 leading-tight">User Reviews &amp; Feedback</h4>
                  <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Submit star ratings and comments, read other user reviews, and submit constructive feedback.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <p className="text-center poppins-regular text-sage-400 text-xs mt-8 opacity-70 leading-relaxed">
          Namazly is open, free, and built as an ongoing charity (Sadaqah Jariyah).
        </p>
      </main>
    </div>
  );
}
