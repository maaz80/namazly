import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';
import api from '../utils/api';
import { HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

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

export default function MasailPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [searchText, setSearchText] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [page, setPage] = useState(1);
  
  const [masailList, setMasailList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewsMap, setViewsMap] = useState({});

  usePageMeta(
    'Islamic Masail & Answers — Ask and Learn Rulings | Namazly',
    'Explore authentic solutions to Islamic rulings (Masail) regarding Wazu, Namaz, cleanliness, and daily issues with reliable scholars references.',
    '/masail'
  );

  // Load from local static JSON and fetch view counts from the server
  useEffect(() => {
    // 1. Fetch the 5000 masail from public JSON
    fetch('/masail.json')
      .then(res => res.json())
      .then(data => {
        setMasailList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading masail.json:", err);
        setLoading(false);
      });

    // 2. Fetch the view counts map from database
    api.get('/masail/views')
      .then(res => {
        if (res.data && res.data.success) {
          setViewsMap(res.data.viewsMap || {});
        }
      })
      .catch(err => console.error("Error loading live views map:", err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchText(searchQuery);
  };

  const handleCategoryChange = (cat) => {
    setPage(1);
    setActiveCategory(cat);
  };

  // 1. Filter by category and search query
  const filteredMasail = useMemo(() => {
    return masailList.filter(item => {
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }
      if (searchText) {
        const query = searchText.toLowerCase();
        const questionMatch = item.question?.toLowerCase().includes(query);
        const answerMatch = item.answer?.toLowerCase().includes(query);
        return questionMatch || answerMatch;
      }
      return true;
    });
  }, [masailList, activeCategory, searchText]);

  // 2. Paginate (12 items per page)
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredMasail.length / itemsPerPage) || 1;

  const displayedMasail = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredMasail.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMasail, page]);

  const categoriesList = useMemo(() => {
    const categories = new Set(masailList.map(m => m.category));
    return ['All', ...categories];
  }, [masailList]);

  return (
    <div className="min-h-screen relative flex flex-col"
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
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">Islamic Masail & Answers</span>
          
          <div className="w-10" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" tabIndex="-1" className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Section */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3 bg-gradient-to-br from-sage-50/50 via-white/50 to-cream-50/30">
          <span className="px-3 py-1 rounded-full bg-emerald-200/50 text-emerald-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            📖 Fatawa Usmani (Mufti Taqi Usmani)
          </span>
          <h1 className="poppins-regular text-2xl sm:text-3xl font-black text-sage-900 leading-tight">
            Authentic Answers to Your Queries
          </h1>
          <p className="poppins-regular text-xs sm:text-sm text-sage-700 max-w-2xl mx-auto leading-relaxed">
            Is website par maujood tamam deeni masail aur unke jawabaat maroof Islamic jurist aur scholar <strong>Mufti Muhammad Taqi Usmani Sahab</strong> ki mashhoor kitab <strong>'Fatawa Usmani'</strong> se liye gaye hain. Yeh masail Darul Uloom Karachi ke registers se compile kiye gaye hain, jisme aapko Namaz, Wazu, aur Ghusl ke alawa jadeed (modern) masail aur Islamic banking ke hawale se authentic Shariah rulings milengi.
          </p>
        </section>

        {/* Filters and Search Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-1 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-400">
                <HiOutlineSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rulings (e.g. Wazu)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-card-deep border border-white/60 text-xs focus:bg-white focus:outline-none placeholder-sage-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-md transition-all cursor-pointer border-0"
            >
              Search
            </button>
          </form>

          {/* Categories Horizontal Tabs */}
          <div className="md:col-span-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer poppins-regular
                  ${activeCategory === cat
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'glass-card border border-white/80 text-sage-700 hover:bg-white/80'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </section>

        {/* Results Area */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-3xl p-5 shadow-sm flex flex-col justify-between text-left h-56 shimmer-block"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-4 bg-sage-200/50 rounded-full" />
                      <div className="w-12 h-3 bg-sage-200/30 rounded-lg" />
                    </div>
                    <div className="w-3/4 h-5 bg-sage-200/60 rounded-lg" />
                    <div className="space-y-1.5">
                      <div className="w-full h-3.5 bg-sage-200/40 rounded" />
                      <div className="w-full h-3.5 bg-sage-200/40 rounded" />
                      <div className="w-2/3 h-3.5 bg-sage-200/40 rounded" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-sage-100/40 flex justify-between items-center">
                    <div className="w-20 h-3 bg-sage-200/30 rounded-lg" />
                    <div className="w-16 h-3 bg-sage-200/50 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedMasail.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center text-sage-500 poppins-regular text-sm space-y-2">
              <p className="text-3xl">🔍</p>
              <p className="font-semibold">No Masail found matching your criteria.</p>
              <p className="text-xs text-sage-400">Try searching for different keywords or checking another category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedMasail.map((item) => (
                  <Link
                    key={item._id}
                    to={`/masail/${item.slug}`}
                    className="glass-card rounded-3xl p-5 hover:bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left group no-underline"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-sage-200/50 text-[10px] font-bold text-sage-800 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-sage-400 font-semibold flex items-center gap-1">
                          👁️ {viewsMap[item.slug] || 0} views
                        </span>
                      </div>
                      <h2 className="poppins-regular text-base font-bold text-sage-900 leading-snug group-hover:text-sage-700 transition-colors">
                        {item.question}
                      </h2>
                      <p className="poppins-regular text-xs text-sage-600 line-clamp-3 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-sage-100/40 flex flex-col md:flex-row gap-3 items-end md:items-center justify-between text-[10px] text-sage-400 font-medium">
                      <span>Ref: <strong className="text-sage-500">{item.reference || 'N/A'}</strong></span>
                      <span className="text-sage-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Read Answer <span className="text-xs">&rarr;</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                    aria-label="Previous Page"
                    className="p-2.5 rounded-xl glass-card border border-white/80 text-sage-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:text-sage-900 active:scale-95 transition-all cursor-pointer"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-sage-600 font-semibold poppins-regular px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                    aria-label="Next Page"
                    className="p-2.5 rounded-xl glass-card border border-white/80 text-sage-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:text-sage-900 active:scale-95 transition-all cursor-pointer"
                  >
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
