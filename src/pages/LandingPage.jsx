import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Page meta hook ──────────────────────────────────────── */
function usePageMeta(title, description) {
  useEffect(() => {
    // Update document title
    document.title = title;
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    // Update OG title/desc dynamically
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc  = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDesc)  ogDesc.setAttribute('content', description);
  }, [title, description]);
}

/* ── Decorative background orbs ─────────────────────────── */
const Orbs = () => (
  <div aria-hidden="true">
    <div
      className="pointer-events-none fixed top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full opacity-30 animate-float"
      style={{ background: 'radial-gradient(circle, #93c0a9 0%, transparent 70%)' }}
    />
    <div
      className="pointer-events-none fixed bottom-[-15%] left-[-8%] w-[560px] h-[560px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, #3d8265 0%, transparent 70%)', animationDelay: '3s' }}
    />
    <div
      className="pointer-events-none fixed top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle, #d4a017 0%, transparent 70%)' }}
    />
  </div>
);

/* ── Moon/star SVG ───────────────────────────────────────── */
const MoonStar = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-12 h-12"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M36 24c0 6.627-5.373 12-12 12S12 30.627 12 24s5.373-12 12-12c1.06 0 2.09.138 3.07.398C24.39 15.2 23 18.45 23 22c0 5.523 4.477 10 10 10 1.38 0 2.69-.28 3.88-.785C36.614 29.487 36 26.816 36 24z"
      fill="url(#moonGrad)"
    />
    <circle cx="38" cy="10" r="2" fill="#d4a017" opacity="0.8" />
    <circle cx="42" cy="18" r="1.5" fill="#d4a017" opacity="0.6" />
    <circle cx="34" cy="6" r="1" fill="#d4a017" opacity="0.9" />
    <defs>
      <linearGradient id="moonGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3d8265" />
        <stop offset="1" stopColor="#1f4336" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Feature pill ────────────────────────────────────────── */
const FeaturePill = ({ icon, text }) => (
  <div
    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card-deep text-sm text-sage-700"
    role="listitem"
  >
    <span aria-hidden="true" className="text-base">{icon}</span>
    <span className="poppins-regular">{text}</span>
  </div>
);

/* ── Google Sign-in Button ───────────────────────────────── */
function GoogleSignInButton({ onCredential, isLoading }) {
  return (
    <div className="flex justify-center">
      {isLoading ? (
        <div
          role="status"
          aria-label="Signing you in"
          aria-live="polite"
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl glass-card border border-white/80 text-sage-700 poppins-regular font-medium"
        >
          <div
            className="w-5 h-5 rounded-full animate-spin"
            style={{ border: '2px solid #c1dace', borderTopColor: '#2d6850' }}
            aria-hidden="true"
          />
          Signing you in…
        </div>
      ) : (
        <div className="w-full flex justify-center overflow-hidden">
          <GoogleLogin
            onSuccess={onCredential}
            onError={() => console.error('Google sign-in failed')}
            shape="rectangular"
            size="large"
            width="280"
            text="signin_with"
            logo_alignment="left"
          />
        </div>
      )}
    </div>
  );
}

/* ── Landing Page ────────────────────────────────────────── */
export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  usePageMeta(
    'Namazly — Qaza Prayer Tracker & Calculator',
    'Calculate, track, and reduce your missed Qaza prayers with Namazly. Beautiful, cloud-synced, and free.'
  );

  const handleCredentialResponse = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      await login(credentialResponse.credential);
      navigate('/dashboard');
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 50%, #eef2ee 100%)' }}
    >
      <Orbs />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        aria-hidden="true"
      />

      {/* ── Header ────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between gap-3 px-4 pt-5 md:px-12"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <MoonStar />
          <span
            className="poppins-regular text-2xl font-bold gradient-text tracking-tight"
            aria-label="Namazly — Home"
          >
            Namazly
          </span>
        </div>
        <div className="shrink-0 px-3 sm:px-4 py-1.5 rounded-full glass-card-deep text-xs text-sage-600 poppins-regular tracking-wide">
          Free to use
        </div>
      </header>

      {/* ── Main Hero ─────────────────────────────────────── */}
      <main
        className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pb-8 sm:py-3 pt-4"
        id="main-content"
      >
        <div className="max-w-4xl w-full text-center animate-fade-in">

          {/* Live badge */}
          <div
            className="items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-sage-700 poppins-regular mb-8 shadow-sm hidden md:inline-flex"
            aria-label="Track your Qaza Namaz — free Islamic prayer tracker"
          >
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" aria-hidden="true" />
            Track your Qaza Namaz
          </div>

          {/* ── Headline ──────────────────────────────────── */}
          <h1 className="poppins-regular text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
            <span className="gradient-text">Never Lose Track</span>
            <br />
            <span className="text-sage-900 text-3xl sm:text-4xl md:text-5xl font-semibold">
              of Your Missed Prayers
            </span>
          </h1>

          {/* Arabic tagline */}
          <p
            className="poppins-regular text-base sm:text-xl text-sage-600 mb-4 opacity-80 leading-relaxed"
            lang="ar"
            dir="rtl"
            aria-label="Arabic: Make up your missed prayers"
          >
            اقضوا ما فاتكم من الصلوات
          </p>

          <p className="poppins-regular text-sage-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-md mx-auto">
            Calculate, track, and reduce your Qaza prayers with a beautiful,
            distraction-free experience.
          </p>

          {/* ── Sign-in Card ──────────────────────────────── */}
          <section
            aria-labelledby="signin-heading"
            className="glass-card rounded-3xl p-5 sm:p-8 mb-8 shadow-xl animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="mb-6">
              <h2 id="signin-heading" className="poppins-regular text-2xl font-semibold text-sage-900 mb-1">
                Get Started
              </h2>
              <p className="poppins-regular text-sage-500 text-sm">
                Sign in to sync your records across all devices
              </p>
            </div>

            <GoogleSignInButton
              onCredential={handleCredentialResponse}
              isLoading={isLoading}
            />

            <div className="flex items-center justify-center gap-3 my-4 max-w-[280px] mx-auto" aria-hidden="true">
              <div className="flex-1 h-[1px] bg-sage-200/50" />
              <span className="poppins-regular text-[10px] text-sage-400 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-[1px] bg-sage-200/50" />
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              aria-label="Continue without signing in — use as guest"
              className="w-[280px] mx-auto flex items-center justify-center gap-2 py-3 rounded-xl
                         poppins-regular text-sm font-semibold text-sage-700 bg-white/60 border border-white/80
                         hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Calculate &amp; Track as Guest</span>
              <svg
                className="w-4 h-4 text-sage-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
                focusable="false"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="mt-4 text-sm text-rose-500 poppins-regular animate-fade-in"
              >
                {error}
              </p>
            )}

            <p className="mt-5 text-xs text-sage-400 poppins-regular leading-relaxed">
              By signing in, you agree to our privacy-first approach.
              <br />Your data is yours, always.
            </p>
          </section>

          {/* ── Feature pills ─────────────────────────────── */}
          <ul
            className="flex flex-wrap justify-center gap-3 animate-slide-up list-none p-0"
            style={{ animationDelay: '0.4s' }}
            aria-label="Key features"
          >
            <FeaturePill icon="🕌" text="All 6 Daily Prayers" />
            <FeaturePill icon="📊" text="Smart Calculator" />
            <FeaturePill icon="☁️" text="Cloud Sync" />
            <FeaturePill icon="📱" text="Mobile Friendly" />
          </ul>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        className="relative z-10 text-center py-6 text-xs text-sage-400 poppins-regular"
        role="contentinfo"
      >
        <p>Built with sincerity &bull; Namazly &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
