import React from 'react';
import { useNavigate } from 'react-router-dom';

const MoonStar = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className="w-6 h-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M24 6 a12 12 0 0 0 18 18 18 18 0 1 1-18-18Z"
      fill="url(#footerMoonGrad)"
    />
    <circle cx="38" cy="10" r="1.5" fill="#d4a017" opacity="0.8" />
    <circle cx="34" cy="6" r="1"   fill="#d4a017" opacity="0.9" />
    <defs>
      <linearGradient id="footerMoonGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3d8265" />
        <stop offset="1" stopColor="#1f4336" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full mt-16 border-t border-white/60 glass-card bg-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Col 1: Branding & Description */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <MoonStar />
              <span className="poppins-regular text-lg font-bold gradient-text tracking-tight">
                Namazly
              </span>
            </div>
            <p className="poppins-regular text-xs text-sage-500 leading-relaxed max-w-sm">
              Namazly is a privacy-first, distraction-free Qaza Namaz tracking application designed to help Muslims easily calculate, organize, and steadily reduce their missed salah.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="poppins-regular text-xs font-bold text-sage-800 uppercase tracking-wider">Quick Utilities</h4>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <button onClick={() => navigate('/calendar')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Islamic Calendar
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/timings')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Namaz Timings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/hadith')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Hadith of the Day
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/guide')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Usage Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="poppins-regular text-xs font-bold text-sage-800 uppercase tracking-wider">Legal &amp; Support</h4>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <button onClick={() => navigate('/about')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  About Namazly
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/disclaimer')} className="poppins-regular text-xs text-sage-500 hover:text-sage-700 transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-sage-100/50 my-6" />

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="poppins-regular text-[10px] text-sage-400">
            &copy; {currentYear} Namazly. All rights reserved.
          </p>
          <p className="poppins-regular text-[10px] text-sage-400 italic">
            Namazly is free and open, built with sincerity as Sadaqah Jariyah.
          </p>
        </div>

      </div>
    </footer>
  );
}
