import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHadithOfTheDay, getRandomHadith } from '../utils/hadiths';
import { HiOutlineArrowLeft, HiOutlineDuplicate, HiOutlineShare, HiOutlineRefresh, HiOutlineCheck } from 'react-icons/hi';
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

export default function HadithPage() {
  const navigate = useNavigate();
  const [hadith, setHadith] = useState(() => getHadithOfTheDay());
  const [isDaily, setIsDaily] = useState(true);
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(true);

  usePageMeta(
    'Daily Hadith — Namazly | Hadith of the Day',
    'Read beautiful, curated daily Hadiths on prayer, character, and Islamic teachings with Arabic and English translation.',
    '/hadith'
  );

  const handleCopy = async () => {
    const shareText = `Hadith of the Day 🌙\n\nArabic:\n"${hadith.arabic}"\n\nTranslation:\n"${hadith.english}"\n\n— Narrated by ${hadith.narrator} (${hadith.source}, ${hadith.reference})\n\nRead more on Namazly`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleShare = async () => {
    const shareText = `Hadith of the Day 🌙\n\n"${hadith.english}"\n\n— Narrated by ${hadith.narrator} (${hadith.source})`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Hadith of the Day — Namazly',
          text: shareText,
          url: window.location.origin
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleGetRandom = () => {
    setAnimate(false);
    setTimeout(() => {
      const random = getRandomHadith(hadith.id);
      setHadith(random);
      setIsDaily(false);
      setAnimate(true);
    }, 150);
  };

  const handleGetDaily = () => {
    setAnimate(false);
    setTimeout(() => {
      setHadith(getHadithOfTheDay());
      setIsDaily(true);
      setAnimate(true);
    }, 150);
  };

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">Hadith of the Day</span>
          
          <div className="w-10" />
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 flex-1 w-full flex flex-col items-center justify-center space-y-6">
        
        {/* Toggle Controls */}
        <div className="flex items-center gap-2 glass-card-deep rounded-2xl p-1 border border-white/40 shadow-sm animate-fade-in">
          <button
            onClick={handleGetDaily}
            className={`px-4 py-2 rounded-xl poppins-regular text-xs font-semibold transition-all duration-200 cursor-pointer border-0
              ${isDaily 
                ? 'bg-sage-600 text-white shadow-sm' 
                : 'text-sage-700 hover:bg-white/40'
              }
            `}
          >
            🌙 Hadith of the Day
          </button>
          <button
            onClick={handleGetRandom}
            className={`px-4 py-2 rounded-xl poppins-regular text-xs font-semibold transition-all duration-200 cursor-pointer border-0 flex items-center gap-1.5
              ${!isDaily 
                ? 'bg-sage-600 text-white shadow-sm' 
                : 'text-sage-700 hover:bg-white/40'
              }
            `}
          >
            <HiOutlineRefresh className={`w-3.5 h-3.5 ${!isDaily ? 'animate-spin-slow' : ''}`} />
            <span>Random Hadith</span>
          </button>
        </div>

        {/* Hadith Card */}
        <div 
          className={`w-full glass-card rounded-3xl p-6 sm:p-10 shadow-xl border border-white/90 relative overflow-hidden transition-all duration-300 transform
            ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
        >
          {/* Decorative Corner Icon */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-sage-400/10 to-sage-500/0 rounded-full blur-xl pointer-events-none" />

          {/* Heading */}
          <div className="flex items-center justify-between border-b border-sage-100/50 pb-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
              {isDaily ? 'Today\'s Verse' : 'Random Selection'}
            </span>
            <span className="text-sage-400 text-xs font-semibold poppins-regular">
              {hadith.source}
            </span>
          </div>

          {/* Hadith Content Container */}
          <div className="space-y-6 text-center">
            {/* Arabic script */}
            <p 
              className="text-2xl sm:text-3xl leading-loose font-medium text-sage-950 px-2 select-all"
              style={{ 
                fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Segoe UI', serif",
                direction: 'rtl' 
              }}
            >
              {hadith.arabic}
            </p>

            {/* Narrator */}
            <p className="poppins-regular text-sage-500 italic text-xs sm:text-sm pt-2">
              Narrated by <span className="font-semibold text-sage-800">{hadith.narrator} (RA)</span>:
            </p>

            {/* Translation */}
            <blockquote className="poppins-regular text-base sm:text-lg font-medium text-sage-800 leading-relaxed max-w-xl mx-auto px-4 border-l-2 border-sage-400/40 select-all">
              "{hadith.english}"
            </blockquote>

            {/* Reference info */}
            <p className="poppins-regular text-[11px] sm:text-xs text-sage-400 font-semibold tracking-wide pt-4">
              Reference: <span className="text-sage-500">{hadith.reference}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 border-t border-sage-100/50 mt-8 pt-6">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-xs font-semibold text-sage-700 hover:bg-white/95 hover:text-sage-900 active:scale-95 transition-all cursor-pointer"
              title="Copy Hadith to Clipboard"
            >
              {copied ? (
                <>
                  <HiOutlineCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <HiOutlineDuplicate className="w-4 h-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-xs font-semibold text-sage-700 hover:bg-white/95 hover:text-sage-900 active:scale-95 transition-all cursor-pointer"
              title="Share Hadith"
            >
              <HiOutlineShare className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Bottom Tip */}
        <p className="poppins-regular text-[10px] text-sage-400 text-center leading-relaxed">
          Prophet Muhammad (ﷺ) said: "Convey from me even if it is a single verse." <br />— Sahih al-Bukhari 3461
        </p>

      </main>

      <Footer />
    </div>
  );
}
