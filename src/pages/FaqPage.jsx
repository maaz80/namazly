import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineChevronDown, 
  HiOutlineSearch, 
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineCalculator,
  HiOutlineArrowLeft
} from 'react-icons/hi';
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

const FAQ_DATA = [
  {
    question: "What is Qaza Namaz (Salah) and why is it mandatory?",
    answer: "Qaza Namaz refers to a namaz that was missed during its prescribed time. In Islamic jurisprudence (Shariah), performing missed obligatory (Fard) namaz is considered a spiritual debt owed to Allah, and it is mandatory (Fard) to make them up as soon as possible.",
    category: "shariah"
  },
  {
    question: "How does the Namazly Qaza Calculator estimate my missed namaz?",
    answer: "Our smart Qaza Calculator takes your age, the age of puberty (when namaz becomes obligatory in Islam), and the approximate years or months you prayed regularly. It then calculates the remaining duration of missed days and converts them into precise counts for all 6 daily obligatory namaz, including Isha Witr.",
    category: "calculation"
  },
  {
    question: "What is the menstruation (period) deduction feature for sisters?",
    answer: "Under Islamic Shariah, women are exempt from performing namaz during their menstruation cycle, and they are not required to make them up later. By selecting the female gender option in our calculator, you can input your average period length, and the calculator will automatically subtract those days from your total missed Qaza days.",
    category: "calculation"
  },
  {
    question: "Are Witr prayers obligatory to make up in Qaza Namaz?",
    answer: "According to the Hanafi school of Islamic jurisprudence, the three Rakat Witr prayer of Isha is Wajib (necessary/obligatory) and must be made up if missed, bringing the daily makeup prayers to 6. If you follow another Madhab (Shafi'i, Maliki, Hanbali) where Witr is Sunnah, you can manually adjust your Witr tracker to zero on the dashboard.",
    category: "shariah"
  },
  {
    question: "Is my personal prayer data secure with Namazly?",
    answer: "Yes, Namazly is privacy-first. In Guest mode, your calculations and logs are stored strictly inside your browser's local storage (LocalStorage) and never leave your device. If you log in with Google, your records are safely synchronized to a secure database so you can access them on other devices.",
    category: "security"
  },
  {
    question: "Can I use Namazly offline without an internet connection?",
    answer: "Absolutely. Namazly is built as a Progressive Web App (PWA). You can install it on your smartphone or desktop (via the 'Install App' prompt or browser menu). Once installed, it works fully offline. Guest users can update trackers, and signed-in users' data will auto-sync once a connection is re-established.",
    category: "app"
  },
  {
    question: "Will I lose my records if I clear my browser cache?",
    answer: "In Guest mode, yes, because browser data is stored locally. To prevent accidental data loss, we recommend signing in with your Google account. This automatically transfers your local offline progress to our secure cloud database, safeguarding it permanently.",
    category: "security"
  },
  {
    question: "How do I adjust the Hijri dates on the Islamic Calendar?",
    answer: "Since Islamic months depend on moon sightings, Hijri dates can vary by 1 or 2 days globally. On the Islamic Calendar page, you can use the 'Moonsighting Adjustment' dropdown to shift the calendar date back or forward (-2 to +2 days) to match your local community.",
    category: "app"
  },
  {
    question: "Is Namazly free, and does it show advertisements?",
    answer: "Namazly is 100% free and has no subscription fees or intrusive pop-up ads. It is created solely with sincerity as Sadaqah Jariyah (continuous charity) to support the Muslim Ummah in fulfilling their worship obligations.",
    category: "security"
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All FAQs', icon: HiOutlineQuestionMarkCircle },
  { id: 'calculation', label: 'Calculations', icon: HiOutlineCalculator },
  { id: 'shariah', label: 'Islamic Rules', icon: HiOutlineSparkles },
  { id: 'security', label: 'Data & Privacy', icon: HiOutlineShieldCheck }
];

export default function FaqPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(null);

  usePageMeta(
    'Frequently Asked Questions — Namazly Qaza Namaz Calculator',
    'Get answers to commonly asked questions about Qaza Namaz calculation, Islamic rulings on missed namaz, data sync, and using the Namazly app.',
    '/faq'
  );

  // Dynamic JSON-LD structured data for Google SEO Rich Snippets
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQ_DATA.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-structured-data';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          
          <span className="poppins-regular text-lg font-bold gradient-text">FAQs</span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main id="main-content" tabIndex="-1" className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10 flex-1 flex flex-col justify-start w-full animate-fade-in">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Find quick answers to common queries regarding calculations, Islamic guidelines, offline capabilities, and cloud privacy.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-sage-400" />
          </div>
          <input
            type="text"
            placeholder="Search questions or keywords (e.g. Witr, guest, period)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedIndex(null); // Collapse open accordion to avoid confusion
            }}
            aria-label="Search FAQs"
            className="block w-full pl-11 pr-4 py-3.5 border-0 rounded-2xl poppins-regular text-sm text-sage-800
                       glass-card shadow-md focus:ring-2 focus:ring-sage-500 outline-none placeholder-sage-400
                       transition-all duration-200"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setExpandedIndex(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold poppins-regular transition-all duration-200 border-0 cursor-pointer ${
                  isActive 
                    ? 'bg-sage-600 text-white shadow-md transform scale-[1.03]' 
                    : 'bg-white/50 text-sage-600 hover:bg-white/80 shadow-sm'
                }`}
              >
                <Icon className="text-sm" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Container */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div 
                  key={index} 
                  className="glass-card rounded-2xl shadow-sm border border-white/70 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleExpand(index)}
                    aria-expanded={isExpanded}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer border-0 bg-transparent"
                  >
                    <span className="poppins-regular text-sm sm:text-base font-bold text-sage-800 hover:text-sage-900 transition-colors duration-150">
                      {faq.question}
                    </span>
                    <HiOutlineChevronDown 
                      className={`w-5 h-5 text-sage-500 transition-transform duration-300 flex-shrink-0 ${
                        isExpanded ? 'rotate-180 text-sage-700' : ''
                      }`} 
                    />
                  </button>
                  
                  {/* Dynamic Height Expandable Answer Panel */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[300px] border-t border-sage-100/50 bg-white/20' : 'max-h-0'
                    }`}
                  >
                    <p className="px-5 py-4 poppins-regular text-xs sm:text-sm text-sage-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 glass-card rounded-3xl border border-white/70 shadow-sm">
              <span className="text-3xl" role="img" aria-label="Magnifying glass">🔍</span>
              <h3 className="poppins-regular text-base font-semibold text-sage-700 mt-2">No matching FAQs found</h3>
              <p className="poppins-regular text-xs text-sage-400 mt-1">
                Try adjusting your search terms or selecting another category.
              </p>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="mt-12 glass-card rounded-2xl p-5 text-center border border-white/70 shadow-sm">
          <h3 className="poppins-regular text-sm font-semibold text-sage-800">Still have questions?</h3>
          <p className="poppins-regular text-xs text-sage-500 mt-1">
            If you need further help or want to suggest new features, feel free to contact us.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sage-600 to-sage-500 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 border-0 cursor-pointer"
          >
            Contact Support
          </button>
        </div>

      </main>
      <Footer />
    </div>
  );
}
