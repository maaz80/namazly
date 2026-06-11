import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 20% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle at 80% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

export default function NotFoundPage() {
  const navigate = useNavigate();

  usePageMeta(
    'Page Not Found (404) | Namazly',
    'The page you are looking for does not exist on Namazly. Return to the dashboard to calculate and manage your Qaza Namaz.'
  );

  return (
    <div className="min-h-screen relative flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            aria-label="Go to Dashboard"
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Dashboard</span>
          </button>
          <span className="poppins-regular text-lg font-bold gradient-text">Namazly</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 404 Body */}
      <main id="main-content" className="relative z-10 max-w-lg mx-auto px-6 py-16 text-center flex-1 flex flex-col justify-center items-center space-y-6">
        
        {/* Animated Moon/Star Icon container */}
        <div className="relative w-36 h-36 flex items-center justify-center bg-white/40 rounded-full shadow-inner border border-white/80 animate-pulse">
          <span className="text-6xl select-none" role="img" aria-label="Crescent Moon">🌙</span>
          <div className="absolute -top-1 -right-1 text-2xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold poppins-regular uppercase tracking-widest border border-rose-200/50">
            Error 404
          </span>
          <h1 className="poppins-regular text-3xl sm:text-4xl font-extrabold text-sage-900 leading-tight">
            Page Not Found
          </h1>
          <p className="poppins-regular text-sm text-sage-600 max-w-sm mx-auto leading-relaxed">
            Afsos! Ye page website par maujood nahi hai. Shayad URL me mistake hai ya page remove ho chuka hai.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          aria-label="Back to home page dashboard"
          className="px-6 py-3 rounded-2xl poppins-regular text-sm font-semibold text-white bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 transition-all active:scale-95 shadow-md cursor-pointer border-0"
        >
          Back to Dashboard
        </button>
      </main>

      <Footer />
    </div>
  );
}
