import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';
import api from '../utils/api';
import { HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { MASAIL_DATA } from '../utils/masailData';

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

const staticCategories = ['All', ...new Set(MASAIL_DATA.map(m => m.category))];

export default function MasailPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState(''); // debounced/submit search
  const [page, setPage] = useState(1);
  
  // Start with static dataset so LCP and SEO index render immediately
  const [masailList, setMasailList] = useState(MASAIL_DATA);
  const [dbCategories, setDbCategories] = useState([]);
  const [viewsMap, setViewsMap] = useState({});

  usePageMeta(
    'Islamic Masail & Answers — Ask and Learn Rulings | Namazly',
    'Explore authentic solutions to Islamic rulings (Masail) regarding Wazu, Namaz, cleanliness, and daily issues with reliable scholars references.',
    '/masail'
  );

  // Background fetch to load live view counts and merge newly added/dynamic database items
  useEffect(() => {
    api.get('/masail?limit=250')
      .then(res => {
        if (res.data && res.data.success) {
          const dbMasail = res.data.masail;
          const merged = [...dbMasail];
          
          // Fallback merge: ensure all static items are in the array
          MASAIL_DATA.forEach(staticItem => {
            if (!merged.some(m => m.slug === staticItem.slug)) {
              merged.push(staticItem);
            }
          });
          
          setMasailList(merged);
          
          if (res.data.categories) {
            setDbCategories(res.data.categories);
          }

          // Build views map
          const map = {};
          dbMasail.forEach(m => {
            map[m.slug] = m.views;
          });
          setViewsMap(map);
        }
      })
      .catch(err => console.error("Error loading live masail database:", err));
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
  const filteredMasail = React.useMemo(() => {
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

  const displayedMasail = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredMasail.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMasail, page]);

  const categoriesList = React.useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories;
    }
    return staticCategories;
  }, [dbCategories]);

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
        <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3 animate-fade-in bg-gradient-to-br from-sage-50/50 via-white/50 to-cream-50/30">
          <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            Deeni Masail
          </span>
          <h1 className="poppins-regular text-3xl sm:text-4xl font-black text-sage-900 leading-tight">
            Authentic Answers to Your Queries
          </h1>
          <p className="poppins-regular text-xs sm:text-sm text-sage-600 max-w-lg mx-auto">
            Find rulings based on authentic books and Islamic authorities regarding Wazu, Salah, and daily life.
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
          {displayedMasail.length === 0 ? (
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

                    <div className="pt-4 mt-4 border-t border-sage-100/40 flex items-center justify-between text-[10px] text-sage-400 font-medium">
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
