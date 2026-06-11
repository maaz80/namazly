import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser, HiOutlineCash, HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineArrowLeft } from 'react-icons/hi';
import { MdContactMail } from 'react-icons/md';
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

export default function ContactPage() {
  const navigate = useNavigate();
  const [copiedText, setCopiedText] = useState(null); // 'upi' | 'email' | null

  usePageMeta(
    'Contact Developer & Support — Qaza Namaz App | Namazly',
    'Reach out to Maaz Shakeel, the developer of Namazly. Feel free to contact for support, queries, feedback, or support via UPI donation.',
    '/contact'
  );

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

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
          
          <span className="poppins-regular text-lg font-bold gradient-text">Contact &amp; Support</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main id="main-content" tabIndex="-1" className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-center animate-fade-in w-full">
        
        {/* Title */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          {/* <MdContactMail className="text-4xl text-sage-500" /> */}
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            Contact &amp; <span className="gradient-text">Support</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm mt-1 max-w-md mx-auto">
            Have questions, feedback, or want to support our project? Feel free to reach out to the developer.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
          
          {/* Card 1: Developer Information */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 flex flex-col justify-between">
            <div>
              <h2 className="poppins-regular text-xl font-bold text-sage-900 mb-2 flex items-center gap-2 border-b border-sage-100/50 pb-2">
                <HiOutlineUser className="text-2xl text-sage-500" />
                Developer Details
              </h2>
              <p className="poppins-regular text-sage-500 text-xs sm:text-sm mb-6 leading-relaxed">
                Namazly is proudly developed and maintained by <strong>Maaz Shakeel</strong>. You can contact the developer directly for suggestions, custom features, or general feedback.
              </p>

              {/* Developer Info rows */}
              <div className="space-y-4">
                {/* Developer Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600 shadow-sm flex-shrink-0">
                    <HiOutlineUser className="text-lg" />
                  </div>
                  <div>
                    <p className="poppins-regular text-[10px] text-sage-400 font-medium uppercase tracking-wider">Name</p>
                    <p className="poppins-regular text-sm font-bold text-sage-800 leading-tight">Maaz Shakeel</p>
                  </div>
                </div>

                {/* Direct Phone Call */}
                <a
                  href="tel:+919616584237"
                  className="flex items-center gap-3 no-underline group/item hover:bg-white/40 p-1.5 -mx-1.5 rounded-2xl transition-colors duration-150"
                  title="Call Phone Number"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0 group-hover/item:scale-105 transition-transform">
                    <HiOutlinePhone className="text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="poppins-regular text-[10px] text-sage-400 font-medium uppercase tracking-wider">Phone</p>
                    <p className="poppins-regular text-sm font-bold text-sage-800 leading-tight group-hover/item:text-emerald-700 transition-colors">+91 9616584237</p>
                  </div>
                </a>

                {/* Email Address */}
                <div className="flex items-center gap-3 justify-between group/item">
                  <a
                    href="mailto:maazsshakeel34@gmail.com"
                    className="flex items-center gap-3 no-underline flex-1 min-w-0 hover:bg-white/40 p-1.5 -mx-1.5 rounded-2xl transition-colors duration-150"
                    title="Send Email"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0 group-hover/item:scale-105 transition-transform">
                      <HiOutlineMail className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="poppins-regular text-[10px] text-sage-400 font-medium uppercase tracking-wider">Email</p>
                      <p className="poppins-regular text-sm font-bold text-sage-800 leading-tight group-hover/item:text-blue-700 transition-colors truncate">maazsshakeel34@gmail.com</p>
                    </div>
                  </a>
                  <button
                    onClick={() => copyToClipboard('maazsshakeel34@gmail.com', 'email')}
                    className="p-2.5 rounded-xl border border-sage-200/60 bg-white/70 hover:bg-white text-sage-600 hover:text-sage-800 transition-all flex-shrink-0 cursor-pointer"
                    title="Copy Email to Clipboard"
                  >
                    {copiedText === 'email' ? <HiOutlineCheck className="text-emerald-600 text-lg" /> : <HiOutlineClipboardCopy className="text-lg" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Support / Donation */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 flex flex-col justify-between">
            <div>
              <h2 className="poppins-regular text-xl font-bold text-sage-900 mb-2 flex items-center gap-2 border-b border-sage-100/50 pb-2">
                <HiOutlineCash className="text-2xl text-sage-500" />
                Support Namazly
              </h2>
              <p className="poppins-regular text-sage-500 text-xs sm:text-sm mb-6 leading-relaxed">
                Namazly is entirely free to use and contains zero trackers. To help cover database and hosting costs, we display a few minimal advertisements. If this application helped your calculations or spiritual consistency, please consider supporting the project.
              </p>

              {/* Donation box */}
              {/* <div className="rounded-2xl border border-amber-200/50 bg-amber-50/40 px-4 py-3 mb-6">
                <p className="poppins-regular text-[11px] text-amber-800 leading-relaxed">
                  📢 Sadaqah Jariyah (Ongoing Charity): Every contribution helps us keep the app running smoothly and minimizes our reliance on advertisements. May Allah reward you beautifully!
                </p>
              </div> */}

              {/* UPI ID block */}
              <div className="rounded-2xl border border-sage-200/60 bg-white/70 p-4 flex items-center justify-between gap-3 shadow-inner">
                <div className="min-w-0 flex-1">
                  <p className="poppins-regular text-[10px] text-sage-400 font-semibold uppercase tracking-wider">UPI ID for Donations</p>
                  <p className="poppins-regular text-sm font-bold text-sage-800 leading-none mt-1 truncate">9616584237@ybl</p>
                </div>
                <button
                  onClick={() => copyToClipboard('9616584237@ybl', 'upi')}
                  className={`px-4 py-2.5 rounded-xl poppins-regular text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5
                              ${copiedText === 'upi'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white hover:bg-sage-50/50 border-sage-200/60 text-sage-700 shadow-sm'}`}
                >
                  {copiedText === 'upi' ? (
                    <>
                      <HiOutlineCheck className="text-base" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineClipboardCopy className="text-base" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
