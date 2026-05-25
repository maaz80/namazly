import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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
      d="M24 6 a12 12 0 0 0 18 18 18 18 0 1 1-18-18Z"
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
function GoogleSignInButton({ onClick, isLoading }) {
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
        <button
          onClick={onClick}
          aria-label="Sign in with Google"
          className="w-[280px] mx-auto flex items-center justify-center gap-2.5 py-3 rounded-xl
                     poppins-regular text-sm font-semibold text-sage-700 bg-white/60 border border-white/80
                     hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        await login(null, tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err) {
        setError('Sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed');
    }
  });

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
              onClick={() => googleLogin()}
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
