import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineShieldCheck } from 'react-icons/hi';
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

export default function PrivacyPage() {
  const navigate = useNavigate();

  usePageMeta(
    'Privacy Policy — Namazly | Privacy First Qaza Tracker',
    'Namazly is a privacy-first app. Read our Privacy Policy to see how we protect your personal salah details and sync them securely.',
    '/privacy-policy'
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
          
          <span className="poppins-regular text-lg font-bold gradient-text">Privacy Policy</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-start w-full animate-fade-in">
        
        {/* Title */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-200 to-sage-300/40 flex items-center justify-center shadow-md">
            <HiOutlineShieldCheck className="text-2xl text-sage-700" />
          </div>
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm mt-1">
            Last Updated: June 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 space-y-6 text-left">
          
          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">1. Our Commitment to Privacy</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              At Namazly, we believe your spiritual records and salah history are highly personal and sacred. We are committed to maintaining a secure, distraction-free environment that puts your privacy first. We do not engage in user tracking, pixel targeting, or data harvesting.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">2. Information Collection &amp; Use</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              We collect minimal information required to deliver the core tracking and calculation services:
            </p>
            <ul className="poppins-regular text-xs sm:text-sm text-sage-600 space-y-2 pl-4 list-disc">
              <li>
                <span className="font-semibold text-sage-800">Guest Data:</span> In Guest mode, all your Qaza salah records, calendar offsets, and location coordinates are stored strictly inside your browser's local cache (LocalStorage). This data never leaves your device unless you sign in.
              </li>
              <li>
                <span className="font-semibold text-sage-800">Account Data:</span> When you sign in with Google, we securely receive your name, email address, and profile photo URL. This information is used solely to authenticate your account and synchronize your data.
              </li>
              <li>
                <span className="font-semibold text-sage-800">Salah Logs:</span> For registered users, we save your Qaza salah counts in our secure cloud database so that your records are kept safe and synchronized across devices.
              </li>
            </ul>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">3. Data Sharing &amp; Third-Party Services</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              We do not sell, trade, or transfer your personal Qaza salah logs or accounts details to advertisers or third parties. We use Google OAuth solely for authentication purposes. We utilize Google Analytics (GA4) with IP anonymization enabled to measure traffic volume and optimize our services. We do not use advertising cookies, and we do not track your activity across other websites.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">4. Data Security</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              We implement industry-standard database security protocols to protect your registered account credentials and Qaza logs. Guests are responsible for securing their local devices, as clearing browser cache may delete local guest data.
            </p>
          </section>

          <hr className="border-sage-100/50" />

          <section className="space-y-2">
            <h2 className="poppins-regular text-lg font-bold text-sage-900">5. Updates to This Policy</h2>
            <p className="poppins-regular text-sage-600 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our app utilities. We encourage you to review this page periodically. Continued use of Namazly signifies your consent to the terms of this policy.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
