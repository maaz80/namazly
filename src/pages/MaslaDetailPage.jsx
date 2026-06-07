import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';
import api from '../utils/api';
import { HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineBookOpen, HiOutlineUser } from 'react-icons/hi';

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

export default function MaslaDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [masla, setMasla] = useState(null);
  const [related, setRelated] = useState([]);

  // Dynamically configure meta parameters based on active content
  const pageTitle = masla ? `${masla.question} — Answer & Reference | Namazly` : 'Islamic Ruling details | Namazly';
  const pageDesc = masla ? masla.answer.slice(0, 155) : 'Read detailed Islamic rulings (Masla & Jawab) with verified scholar and book references.';

  usePageMeta(pageTitle, pageDesc, `/masail/${slug}`);

  const fetchMaslaDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/masail/detail/${slug}`);
      if (res.data.success) {
        setMasla(res.data.masla);
        setRelated(res.data.related);
      } else {
        setError('Masla not found.');
      }
    } catch (err) {
      setError('Connection error or Masla not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaslaDetails();
    // Scroll to top when loading new masla
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/masail')}
            className="flex items-center gap-1.5 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>All Masail</span>
          </button>
          
          <span className="poppins-regular text-sm text-sage-500 font-bold hidden sm:inline">Islamic Rulings Q&A</span>
          
          <div className="shrink-0 px-3 py-1.5 rounded-full glass-card-deep text-xs text-sage-600 poppins-regular tracking-wide">
            Verified reference
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-8 flex-1 w-full space-y-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-sage-300 border-t-sage-600 animate-spin" />
            <p className="poppins-regular text-sage-500 text-xs">Loading ruling details…</p>
          </div>
        ) : error ? (
          <div className="text-center py-32 text-rose-500 poppins-regular text-sm space-y-2">
            <p className="text-2xl">⚠️</p>
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => navigate('/masail')}
              className="px-4 py-1.5 rounded-xl glass-card text-xs text-sage-700 hover:bg-white border border-white mt-2 cursor-pointer"
            >
              Back to List
            </button>
          </div>
        ) : (
          <article className="space-y-6 animate-fade-in text-left">
            
            {/* Category and Views Breadcrumb */}
            <div className="flex items-center justify-between text-xs text-sage-400 font-semibold">
              <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 uppercase tracking-wider">
                {masla.category}
              </span>
              <span className="flex items-center gap-1">
                👁️ {masla.views || 0} times read
              </span>
            </div>

            {/* Question Details */}
            <header className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-500/10">
              <span className="text-xs font-bold text-sage-500 uppercase tracking-widest block mb-1">
                Question / Sawaal
              </span>
              <h1 className="poppins-regular text-lg sm:text-2xl font-bold text-sage-900 leading-snug">
                {masla.question}
              </h1>
            </header>

            {/* Answer Details */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-sage-500 uppercase tracking-widest block mb-2">
                  Answer / Jawaab
                </span>
                <p className="poppins-regular text-sm sm:text-base text-sage-800 leading-relaxed whitespace-pre-line font-medium">
                  {masla.answer}
                </p>
              </div>

              {/* Reference details metadata card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-sage-100/60 text-xs">
                
                {/* Scholar Authority */}
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sage-50/40 border border-sage-100/50">
                  <span className="p-2 rounded-xl bg-sage-600/10 text-sage-600">
                    <HiOutlineUser className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Authority / Fatwa By</span>
                    <p className="font-semibold text-sage-800 mt-0.5">{masla.authority || 'Darul Ifta'}</p>
                  </div>
                </div>

                {/* Book Reference */}
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sage-50/40 border border-sage-100/50">
                  <span className="p-2 rounded-xl bg-sage-600/10 text-sage-600">
                    <HiOutlineBookOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Book Reference / Hawala</span>
                    <p className="font-semibold text-sage-800 mt-0.5">{masla.reference || 'N/A'}</p>
                  </div>
                </div>

              </div>

            </section>

            {/* Related Questions Section */}
            {related && related.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-sage-200/40">
                <h2 className="poppins-regular text-sm font-bold text-sage-800 uppercase tracking-wider flex items-center gap-1">
                  <span>📚</span>
                  <span>Related Rulings (Muta'alliqa Masail)</span>
                </h2>
                
                <div className="divide-y divide-sage-100/50 rounded-3xl border border-white/60 bg-white/20 backdrop-blur-sm overflow-hidden">
                  {related.map((item) => (
                    <Link
                      key={item._id}
                      to={`/masail/${item.slug}`}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-white/50 transition-colors group no-underline text-left"
                    >
                      <span className="poppins-regular text-xs sm:text-sm font-semibold text-sage-900 group-hover:text-sage-700 leading-snug truncate pr-4">
                        {item.question}
                      </span>
                      <HiOutlineChevronRight className="w-4 h-4 text-sage-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </article>
        )}

      </main>

      <Footer />
    </div>
  );
}
