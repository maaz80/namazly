import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineDocumentText } from 'react-icons/hi';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

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

export default function DisclaimerPage() {
  const navigate = useNavigate();

  usePageMeta(
    'Legal Disclaimer — Important Usage Warnings | Namazly',
    'Read the Namazly disclaimer regarding Islamic calculations, moonsighting adjustments, and prayer time estimations.',
    '/disclaimer'
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
          
          <span className="poppins-regular text-lg font-bold gradient-text">Disclaimer</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-start w-full animate-fade-in">
        
        {/* Title */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-200 to-sage-300/40 flex items-center justify-center shadow-md">
            <HiOutlineDocumentText className="text-2xl text-sage-700" />
          </div>
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            Usage <span className="gradient-text">Disclaimer</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm mt-1">
            Last Updated: June 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 space-y-6 text-left">
          
          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">1. Educational &amp; Estimation Purposes Only</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              All tools, calculators, and estimations provided by Namazly are intended solely for educational and organizational purposes. The calculated results are mathematical estimates of missed salah based on the inputs you provide. They should not be treated as absolute, binding religious decrees (fatwa).
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">2. Scholarly Consultation Recommended</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              Rules and regulations concerning missed prayers (Qaza Salah), menstruation (Haiz) exemptions, and Wajib (necessary) vs. Sunnah prayers can differ across various Islamic schools of thought (Madhhabs: Hanafi, Shafi'i, Maliki, Hanbali). For complex personal circumstances or specific rulings, we strongly recommend consulting a qualified Islamic scholar or local Imam.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">3. Geolocation &amp; Timings Accuracy</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              Namaz timings displayed on this app are fetched dynamically via public third-party APIs (e.g. Aladhan API) using your coordinates or manual city inputs. While we verify these sources, differences in calculation methods (e.g. angle adjustments) may exist. Please verify timings with your local mosque for congregational salah.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">4. Moonsighting &amp; Hijri Dates</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              Hijri dates are mathematically estimated. Because Islamic months begin with the physical moonsighting, actual dates may vary by 1-2 days. Use our Moonsighting Adjustment tool on the Calendar page to synchronize dates with your local community.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">5. Limitation of Liability</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              Namazly and its developers shall not be held liable for any discrepancies, errors, or perceived inaccuracies in salah counts, timings, calendar dates, or other data offered on the app.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
