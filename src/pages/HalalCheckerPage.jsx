import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiSearch, HiCheckCircle, HiXCircle, HiExclamationCircle } from 'react-icons/hi';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

/* Decorative background orbs */
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

const INGREDIENTS_DATABASE = [
  { id: 'E100', name: 'Curcumin (E100)', status: 'halal', source: 'Plant-derived', details: 'Natural yellow food color extracted from turmeric root. Completely Halal.' },
  { id: 'E101', name: 'Riboflavin (E101)', status: 'halal', source: 'Synthetic or Plant', details: 'Vitamin B2. Yellow food coloring. Halal.' },
  { id: 'E120', name: 'Carmine / Cochineal (E120)', status: 'haram', source: 'Insect-derived', details: 'Red color obtained from crushed cochineal insects. Considered Haram in Hanafi jurisprudence and most major schools.' },
  { id: 'E202', name: 'Potassium Sorbate (E202)', status: 'halal', source: 'Synthetic', details: 'Common preservative, chemically synthesized. Halal.' },
  { id: 'E211', name: 'Sodium Benzoate (E211)', status: 'halal', source: 'Synthetic', details: 'Food preservative, chemically synthesized. Halal.' },
  { id: 'E300', name: 'Ascorbic Acid (E300)', status: 'halal', source: 'Plant or Synthetic', details: 'Vitamin C. Commonly derived from citrus fruits or manufactured synthetically. Halal.' },
  { id: 'E322', name: 'Lecithin (E322)', status: 'mushbooh', source: 'Soy, Egg, or Animal fat', details: 'If source is soy or egg, it is Halal. If derived from animal fat, it depends on Sharia-compliant slaughter. Check label for "Soy Lecithin" or vegetarian marker.' },
  { id: 'E330', name: 'Citric Acid (E330)', status: 'halal', source: 'Plant-derived', details: 'Acidity regulator obtained from citrus fruits. Halal.' },
  { id: 'E407', name: 'Carrageenan (E407)', status: 'halal', source: 'Seaweed-derived', details: 'Gelling agent and thickener extracted from red seaweed. Halal.' },
  { id: 'E412', name: 'Guar Gum (E412)', status: 'halal', source: 'Plant-derived', details: 'Natural thickener obtained from guar beans. Halal.' },
  { id: 'E415', name: 'Xanthan Gum (E415)', status: 'halal', source: 'Bacterial Fermentation', details: 'Produced by the fermentation of glucose/sucrose. Halal.' },
  { id: 'E422', name: 'Glycerol / Glycerin (E422)', status: 'mushbooh', source: 'Plant, Petroleum, or Animal fat', details: 'Vegetable glycerin is Halal. Animal-derived glycerin is Mushbooh as it may come from non-dhabihah animals or swine.' },
  { id: 'E441', name: 'Gelatine (E441)', status: 'mushbooh', source: 'Animal Bones or Skin', details: 'Derived from animal collagen. Haram if from pigs or non-halal slaughtered animals. Only Halal if certified from Halal-slaughtered bovine or fish.' },
  { id: 'E471', name: 'Mono- and Di-glycerides (E471)', status: 'mushbooh', source: 'Plant or Animal fats', details: 'Emulsifier commonly used in breads and confectionery. Often plant-derived (Halal) but can be animal-derived. Look for vegetarian/halal label.' },
  { id: 'E621', name: 'Monosodium Glutamate / MSG (E621)', status: 'halal', source: 'Plant Fermentation', details: 'Flavor enhancer made from fermented sugarcane, starch, or molasses. Halal.' },
  { id: 'E901', name: 'Beeswax (E901)', status: 'halal', source: 'Insect secretion', details: 'Natural wax secreted by honeybees. Halal to consume.' },
  { id: 'E904', name: 'Shellac (E904)', status: 'mushbooh', source: 'Insect secretion', details: 'Glazing agent from lac bugs. Halal in Shafi\'i, but considered Mushbooh or Haram in Hanafi due to insect origins.' },
  { id: 'E951', name: 'Aspartame (E951)', status: 'halal', source: 'Synthetic', details: 'Low-calorie artificial sweetener. Halal.' },
  { id: 'E960', name: 'Steviol Glycosides (E960)', status: 'halal', source: 'Plant-derived', details: 'Natural sweetener derived from Stevia leaves. Halal.' },
  { id: 'gelatin', name: 'Gelatin', status: 'mushbooh', source: 'Animal source', details: 'Common in gummies and desserts. If pork or non-halal animal source, it is Haram. Check for Halal certification.' },
  { id: 'carmine', name: 'Carmine', status: 'haram', source: 'Insect-derived', details: 'Natural red dye made from crushed insects. Haram in most schools.' },
  { id: 'whey', name: 'Whey Protein / Whey powder', status: 'halal', source: 'Milk-derived', details: 'Obtained during cheese making. If microbial rennet was used, it is Halal. Generally accepted as Halal in Western markets.' },
  { id: 'rennet', name: 'Rennet', status: 'mushbooh', source: 'Animal stomach enzyme', details: 'Used to curdle cheese. Halal if from microbial source or halal-slaughtered animals. Otherwise Mushbooh.' },
  { id: 'alcohol', name: 'Ethyl Alcohol / Ethanol', status: 'haram', source: 'Fermentation', details: 'Intoxicating alcohol used in beverages is Haram. Small trace amounts in natural flavourings are tolerated by some scholars if non-intoxicating.' },
  { id: 'lard', name: 'Lard', status: 'haram', source: 'Pork fat', details: 'Fat obtained from pigs. Strictly Haram.' },
  { id: 'cysteine', name: 'L-Cysteine (E920)', status: 'mushbooh', source: 'Human hair, feathers, or synthetic', details: 'Flour treatment agent. If from human hair, it is Haram. If from feathers (halal slaughtered) or synthetic, it is Halal. Mushbooh.' },
  { id: 'cochineal', name: 'Cochineal', status: 'haram', source: 'Insect-derived', details: 'Red dye obtained from cochineal bugs. Haram in Hanafi school.' },
  { id: 'shellac', name: 'Shellac', status: 'mushbooh', source: 'Insect excretion', details: 'Glazing agent. Rulings differ: Halal in Shafi\'i, Mushbooh/Haram in Hanafi.' },
  { id: 'pepsin', name: 'Pepsin', status: 'mushbooh', source: 'Pig stomach enzyme', details: 'Enzyme used in cheese or digestion aids. Often derived from swine, making it Haram. Check sources.' }
];

const POPULAR_SEARCHES = ['E120', 'E471', 'E441', 'E322', 'Gelatin', 'Lard', 'MSG'];

export default function HalalCheckerPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // SEO Optimization
  usePageMeta(
    'Halal Food E-Numbers Checker — Instant Ingredient Status | Namazly',
    'Quickly check the Halal or Haram status of food additives and E-numbers. Search our verified directory of common E-numbers and ingredients.',
    '/halal-checker'
  );

  // Normalize query to compare easily (e.g. remove spaces, lower case)
  const normalizedQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    
    return INGREDIENTS_DATABASE.filter(item => {
      const normalizedId = item.id.toLowerCase().replace(/\s+/g, '');
      const normalizedName = item.name.toLowerCase().replace(/\s+/g, '');
      return normalizedId.includes(normalizedQuery) || normalizedName.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen relative flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-xs sm:text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <span className="poppins-regular text-sm sm:text-base font-bold gradient-text">
            Halal Food Checker
          </span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="relative z-10 max-w-lg mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-6 animate-fade-in">
        
        {/* Banner Section */}
        <section className="text-center space-y-1 mb-2">
          <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            E-Numbers &amp; Additives Checker
          </span>
          <h1 className="poppins-regular text-xl sm:text-2xl font-black text-sage-900">
            Halal Ingredient Checker
          </h1>
          <p className="poppins-regular text-[11px] text-sage-500 max-w-xs mx-auto leading-normal">
            Type any E-number or ingredient name (e.g. E120, Gelatin) to immediately verify its Sharia status.
          </p>
        </section>

        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-400">
            <HiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search E-number or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-white/80 focus:bg-white focus:outline-none text-sm font-medium text-sage-800 shadow-sm transition-all placeholder-sage-400"
          />
        </div>

        {/* Popular searches chips */}
        {!searchQuery && (
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider text-center">
              Popular Searches (आम खोजें)
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold glass-card border border-white/60 text-sage-700 hover:bg-white/60 active:scale-95 cursor-pointer transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Container */}
        {searchQuery && (
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((item) => {
                const isHalal = item.status === 'halal';
                const isHaram = item.status === 'haram';
                const isMushbooh = item.status === 'mushbooh';

                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4 animate-scale-in"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="poppins-regular text-lg font-bold text-sage-900 leading-tight">
                          {item.name}
                        </h2>
                        <span className="text-[10px] font-bold text-sage-400 uppercase tracking-wider block mt-0.5">
                          Source: {item.source}
                        </span>
                      </div>

                      {/* Status badge */}
                      {isHalal && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-bold text-xs uppercase tracking-wide">
                          <HiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>Halal</span>
                        </div>
                      )}
                      {isHaram && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50 font-bold text-xs uppercase tracking-wide">
                          <HiXCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>Haram</span>
                        </div>
                      )}
                      {isMushbooh && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 font-bold text-xs uppercase tracking-wide">
                          <HiExclamationCircle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Doubtful</span>
                        </div>
                      )}
                    </div>

                    {/* Details explanation */}
                    <div className="text-left text-xs leading-relaxed text-sage-600 bg-white/20 p-3.5 rounded-2xl border border-white/40">
                      <strong className="block text-sage-800 mb-0.5">Islamic Ruling / Description:</strong>
                      {item.details}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-card rounded-3xl p-6 text-center text-xs text-sage-500 border border-white/80 animate-fade-in">
                No verified additive found for "<strong>{searchQuery}</strong>". 
                <p className="mt-2 text-[10px] leading-relaxed">
                  Tip: Try typing just the number (e.g. <strong>120</strong> instead of E120) or check the spelling of the ingredient.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
