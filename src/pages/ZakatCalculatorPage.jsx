import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';
import { HiOutlineArrowLeft, HiOutlineQuestionMarkCircle, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';

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

export default function ZakatCalculatorPage() {
  const navigate = useNavigate();

  // SEO Optimization
  usePageMeta(
    'Zakat Calculator Online — Calculate Your Zakat Instantly | Namazly',
    'Calculate your Zakat accurately using our free, fully optimized online Zakat Calculator. Enter your Cash, Gold, Silver, and liabilities to find your Zakat due.',
    '/zakat-calculator'
  );

  // Default rates
  const [goldRate, setGoldRate] = useState(7200); // Sona rate per gram
  const [silverRate, setSilverRate] = useState(90); // Chandi rate per gram
  
  // Inputs
  const [goldWeight, setGoldWeight] = useState('');
  const [silverWeight, setSilverWeight] = useState('');
  const [cash, setCash] = useState('');
  const [investments, setInvestments] = useState('');
  const [receivables, setReceivables] = useState('');
  const [businessStock, setBusinessStock] = useState('');
  const [debts, setDebts] = useState('');
  const [expenses, setExpenses] = useState('');
  
  const [nisabType, setNisabType] = useState('silver'); 
  const [activeTab, setActiveTab] = useState('assets'); 

  // Nisab constants (Gold: 87.48g, Silver: 612.36g)
  const GOLD_NISAB_GRAMS = 87.48;
  const SILVER_NISAB_GRAMS = 612.36;

  const goldNisabValue = useMemo(() => GOLD_NISAB_GRAMS * Number(goldRate || 0), [goldRate]);
  const silverNisabValue = useMemo(() => SILVER_NISAB_GRAMS * Number(silverRate || 0), [silverRate]);
  
  const selectedNisabThreshold = useMemo(() => {
    return nisabType === 'gold' ? goldNisabValue : silverNisabValue;
  }, [nisabType, goldNisabValue, silverNisabValue]);

  // Value mapping
  const goldValue = useMemo(() => Number(goldWeight || 0) * Number(goldRate || 0), [goldWeight, goldRate]);
  const silverValue = useMemo(() => Number(silverWeight || 0) * Number(silverRate || 0), [silverWeight, silverRate]);
  
  const totalAssets = useMemo(() => {
    return (
      goldValue +
      silverValue +
      Number(cash || 0) +
      Number(investments || 0) +
      Number(receivables || 0) +
      Number(businessStock || 0)
    );
  }, [goldValue, silverValue, cash, investments, receivables, businessStock]);

  const totalDeductions = useMemo(() => {
    return Number(debts || 0) + Number(expenses || 0);
  }, [debts, expenses]);

  const netWealth = useMemo(() => {
    const wealth = totalAssets - totalDeductions;
    return wealth > 0 ? wealth : 0;
  }, [totalAssets, totalDeductions]);

  const isEligible = useMemo(() => {
    return netWealth >= selectedNisabThreshold;
  }, [netWealth, selectedNisabThreshold]);

  const zakatDue = useMemo(() => {
    return isEligible ? netWealth * 0.025 : 0;
  }, [isEligible, netWealth]);

  const handleReset = () => {
    setGoldWeight('');
    setSilverWeight('');
    setCash('');
    setInvestments('');
    setReceivables('');
    setBusinessStock('');
    setDebts('');
    setExpenses('');
    setActiveTab('assets');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to Dashboard"
            className="flex items-center gap-1 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-xs sm:text-sm font-semibold cursor-pointer bg-transparent border-0 shrink-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="inline sm:hidden">Back</span>
          </button>
          
          <span className="poppins-regular text-xs sm:text-base font-bold gradient-text truncate text-center flex-1">
            Zakat Calculator (हिसाब)
          </span>
          
          <div className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full glass-card-deep text-[8px] sm:text-xs text-sage-600 poppins-regular tracking-wide">
            <span className="hidden sm:inline">Zakat Rate: 2.5% (40wan Hissa)</span>
            <span className="inline sm:hidden">Rate: 2.5%</span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="relative z-10 max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Banner Section */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3 bg-gradient-to-br from-sage-50/50 via-white/50 to-cream-50/30">
          <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            Zakat ka aasan hisab
          </span>
          <h1 className="poppins-regular text-2xl sm:text-4xl font-black text-sage-900 leading-tight">
            Zakat ki Sahi Calculation
          </h1>
          <p className="poppins-regular text-xs sm:text-sm text-sage-600 max-w-xl mx-auto leading-relaxed">
            Zakat har us musalman par farz hai jiske paas ek saal tak minimum limit (Nisab) se zyada savings ya sona-chandi ho.
          </p>
        </section>

        {/* Live metal rates configurator */}
        <section className="glass-card rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/80">
          <div>
            <label htmlFor="gold-rate-input" className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-1">
              Sona (Gold) ka Rate (Per Gram)
            </label>
            <input
              id="gold-rate-input"
              type="number"
              value={goldRate}
              onChange={(e) => setGoldRate(e.target.value)}
              placeholder="e.g. 7200"
              aria-label="Gold rate per gram"
              className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-sage-400 mt-1 block">
              Sone ki limit (Nisab - {GOLD_NISAB_GRAMS}g): <strong>₹{Math.round(goldNisabValue).toLocaleString()}</strong>
            </span>
          </div>

          <div>
            <label htmlFor="silver-rate-input" className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-1">
              Chandi (Silver) ka Rate (Per Gram)
            </label>
            <input
              id="silver-rate-input"
              type="number"
              value={silverRate}
              onChange={(e) => setSilverRate(e.target.value)}
              placeholder="e.g. 90"
              aria-label="Silver rate per gram"
              className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-sage-400 mt-1 block">
              Chandi ki limit (Nisab - {SILVER_NISAB_GRAMS}g): <strong>₹{Math.round(silverNisabValue).toLocaleString()}</strong>
            </span>
          </div>
        </section>

        {/* Calculator Tabs for mobile-friendly view */}
        <div className="flex glass-card p-1 rounded-2xl gap-0.5">
          <button
            onClick={() => setActiveTab('assets')}
            aria-selected={activeTab === 'assets'}
            role="tab"
            className={`flex-1 py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border-0 poppins-regular flex flex-col items-center justify-center min-w-0
              ${activeTab === 'assets' ? 'bg-sage-600 text-white shadow-sm' : 'bg-transparent text-sage-600 hover:text-sage-800'}`}
          >
            <span className="truncate w-full text-center">1. Aapka Maal</span>
            <span className="text-[9px] sm:text-[10px] opacity-85 mt-0.5 font-semibold">₹{totalAssets.toLocaleString()}</span>
          </button>
          <button
            onClick={() => setActiveTab('deductions')}
            aria-selected={activeTab === 'deductions'}
            role="tab"
            className={`flex-1 py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border-0 poppins-regular flex flex-col items-center justify-center min-w-0
              ${activeTab === 'deductions' ? 'bg-sage-600 text-white shadow-sm' : 'bg-transparent text-sage-600 hover:text-sage-800'}`}
          >
            <span className="truncate w-full text-center">2. Aapka Karz</span>
            <span className="text-[9px] sm:text-[10px] opacity-85 mt-0.5 font-semibold">₹{totalDeductions.toLocaleString()}</span>
          </button>
          <button
            onClick={() => setActiveTab('result')}
            aria-selected={activeTab === 'result'}
            role="tab"
            className={`flex-1 py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border-0 poppins-regular flex flex-col items-center justify-center min-w-0
              ${activeTab === 'result' ? 'bg-sage-600 text-white shadow-sm' : 'bg-transparent text-sage-600 hover:text-sage-800'}`}
          >
            <span className="truncate w-full text-center">3. Zakat Report</span>
            <span className="text-[9px] sm:text-[10px] opacity-85 mt-0.5 font-semibold">₹{Math.round(zakatDue).toLocaleString()}</span>
          </button>
        </div>

        {/* Calculations Form */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm border border-white/80">
          
          {/* TAB 1: ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-4 animate-fade-in text-left">
              <h2 className="poppins-regular text-base font-bold text-sage-900 border-b border-sage-100/40 pb-2">
                Step 1: Apne paas maujood Paise aur Sona-Chandi likhein
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gold grams input */}
                <div>
                  <label htmlFor="gold-weight-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Sona (Gold) ka wazan (Grams me)
                    <HiInformationCircle className="text-sage-400 hover:text-sage-600 cursor-help" title="Aapke paas jitna bhi sona ya sone ke gahne hain unka weight likhein." />
                  </label>
                  <input
                    id="gold-weight-input"
                    type="number"
                    value={goldWeight}
                    onChange={(e) => setGoldWeight(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                  {goldWeight && (
                    <span className="text-[10px] text-sage-500 mt-1 block">
                      Keemat: ₹{Math.round(goldValue).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Silver grams input */}
                <div>
                  <label htmlFor="silver-weight-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Chandi (Silver) ka wazan (Grams me)
                    <HiInformationCircle className="text-sage-400 hover:text-sage-600 cursor-help" title="Aapke paas jitni chandi ya chandi ke utensils/jewelry hain unka weight likhein." />
                  </label>
                  <input
                    id="silver-weight-input"
                    type="number"
                    value={silverWeight}
                    onChange={(e) => setSilverWeight(e.target.value)}
                    placeholder="e.g. 700"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                  {silverWeight && (
                    <span className="text-[10px] text-sage-500 mt-1 block">
                      Keemat: ₹{Math.round(silverValue).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Cash assets */}
                <div>
                  <label htmlFor="cash-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Cash (Nayd paise) aur Bank Balance
                  </label>
                  <input
                    id="cash-input"
                    type="number"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Shares & Mutual Funds */}
                <div>
                  <label htmlFor="investments-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Shares ya Mutual Funds me laga paisa
                  </label>
                  <input
                    id="investments-input"
                    type="number"
                    value={investments}
                    onChange={(e) => setInvestments(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Receivables */}
                <div>
                  <label htmlFor="receivables-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Aapne jo kisi ko udhaar (Karz) diya hai
                  </label>
                  <input
                    id="receivables-input"
                    type="number"
                    value={receivables}
                    onChange={(e) => setReceivables(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Business Stock */}
                <div>
                  <label htmlFor="stock-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Business ya Dukaan ke stock ki keemat
                  </label>
                  <input
                    id="stock-input"
                    type="number"
                    value={businessStock}
                    onChange={(e) => setBusinessStock(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Assets Alert Banner */}
              <div className="p-4 mt-6 rounded-2xl bg-sage-50/60 border border-sage-100 flex justify-between items-center text-sm font-semibold text-sage-800">
                <span>Aapka total Maal (Assets):</span>
                <span className="text-base text-sage-900 font-extrabold">₹{totalAssets.toLocaleString()}</span>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setActiveTab('deductions')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition-all cursor-pointer border-0 text-center"
                >
                  <span className="hidden sm:inline">Agla Step (Karz) &rarr;</span>
                  <span className="inline sm:hidden">Agla &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DEDUCTIONS */}
          {activeTab === 'deductions' && (
            <div className="space-y-4 animate-fade-in text-left">
              <h2 className="poppins-regular text-base font-bold text-sage-900 border-b border-sage-100/40 pb-2">
                Step 2: Aap par jo Karz ya Udhaar hai wo likhein
              </h2>
              <p className="poppins-regular text-xs text-sage-500 leading-relaxed">
                Aapke upar jo loans ya bache huye bills hain jinhe jald chukana hai, unhe yahan likhein taaki wo zakat se minus ho sakein.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Debts */}
                <div>
                  <label htmlFor="debts-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Loans / Karz jo aapko chukana hai
                  </label>
                  <input
                    id="debts-input"
                    type="number"
                    value={debts}
                    onChange={(e) => setDebts(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Unpaid expenses */}
                <div>
                  <label htmlFor="expenses-input" className="block text-xs font-semibold text-sage-700 mb-1 flex items-center gap-1">
                    Ghar ke bills ya workers ki bachi hui payment
                  </label>
                  <input
                    id="expenses-input"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/60 text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Deductions Alert Banner */}
              <div className="p-4 mt-6 rounded-2xl bg-rose-50/40 border border-rose-100/30 flex justify-between items-center text-sm font-semibold text-rose-800">
                <span>Total Karz aur Udhaar (Deductions):</span>
                <span className="text-base text-rose-900 font-extrabold">₹{totalDeductions.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center gap-3 pt-4">
                <button
                  onClick={() => setActiveTab('assets')}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-sage-700 hover:bg-sage-100/50 glass-card transition-all cursor-pointer border border-white/80 text-center"
                >
                  <span className="hidden sm:inline">&larr; Pichla Step (Assets)</span>
                  <span className="inline sm:hidden">&larr; Pichla</span>
                </button>
                <button
                  onClick={() => setActiveTab('result')}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition-all cursor-pointer border-0 text-center"
                >
                  <span className="hidden sm:inline">Agla Step (Report) &rarr;</span>
                  <span className="inline sm:hidden">Agla &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESULT */}
          {activeTab === 'result' && (
            <div className="space-y-6 animate-fade-in text-left">
              <h2 className="poppins-regular text-base font-bold text-sage-900 border-b border-sage-100/40 pb-2">
                Step 3: Aapki Zakat ka Hisab (Natija)
              </h2>

              {/* Nisab Selector */}
              <div className="glass-card p-4 rounded-2xl space-y-3">
                <span className="block text-xs font-bold text-sage-500 uppercase tracking-wider">
                  Zakat ki Limit (Nisab Standard chunein)
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage-800 cursor-pointer">
                    <input
                      type="radio"
                      name="nisabType"
                      value="silver"
                      checked={nisabType === 'silver'}
                      onChange={() => setNisabType('silver')}
                      className="accent-sage-600 w-4 h-4"
                    />
                    Chandi ke hisab se (₹{Math.round(silverNisabValue).toLocaleString()}) — Recommended
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage-800 cursor-pointer">
                    <input
                      type="radio"
                      name="nisabType"
                      value="gold"
                      checked={nisabType === 'gold'}
                      onChange={() => setNisabType('gold')}
                      className="accent-sage-600 w-4 h-4"
                    />
                    Sone ke hisab se (₹{Math.round(goldNisabValue).toLocaleString()})
                  </label>
                </div>
              </div>

              {/* Final calculation report card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Net Zakatable Wealth */}
                <div className="p-5 rounded-3xl bg-sage-50/50 border border-sage-100/60 text-center space-y-1">
                  <span className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Jitne paise par Zakat lagegi</span>
                  <p className="poppins-regular text-2xl font-black text-sage-900">₹{netWealth.toLocaleString()}</p>
                  <p className="text-[9px] text-sage-400 font-medium">Assets me se Karz minus karne ke baad</p>
                </div>

                {/* Nisab Threshold */}
                <div className="p-5 rounded-3xl bg-sage-50/50 border border-sage-100/60 text-center space-y-1">
                  <span className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Zakat ki minimum limit</span>
                  <p className="poppins-regular text-2xl font-black text-sage-900">₹{Math.round(selectedNisabThreshold).toLocaleString()}</p>
                  <p className="text-[9px] text-sage-400 font-medium">Chandi ya Sona ke rate ke hisab se</p>
                </div>

                {/* Zakat Payable */}
                <div className={`p-5 rounded-3xl text-center space-y-1 border ${
                  zakatDue > 0 
                    ? 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800' 
                    : 'bg-sage-50/30 border-sage-100/60 text-sage-700'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Aapka Zakat (2.5%)</span>
                  <p className="poppins-regular text-2xl font-black text-sage-950">₹{Math.round(zakatDue).toLocaleString()}</p>
                  <p className="text-[9px] font-medium">{zakatDue > 0 ? 'Jo aapko gareebon ko dena hai' : 'Aap par Zakat farz nahi hai'}</p>
                </div>

              </div>

              {/* Status Message */}
              <div role="status" aria-live="polite" className={`p-5 rounded-3xl flex gap-3 items-start border text-xs leading-relaxed ${
                zakatDue > 0 
                  ? 'bg-emerald-100/40 border-emerald-200/60 text-emerald-800' 
                  : 'bg-amber-50/50 border-amber-200/60 text-amber-800'
              }`}>
                {zakatDue > 0 ? (
                  <>
                    <HiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong className="block text-sm mb-1 font-bold">Aap par Zakat Farz hai</strong>
                      Aapka total wealth (₹{netWealth.toLocaleString()}) Zakat ki minimum limit (₹{Math.round(selectedNisabThreshold).toLocaleString()}) se zyada hai. Aap par ₹{Math.round(zakatDue).toLocaleString()} Zakat dena wajib hai. Ise jald se jald kisi zarooratmand ko ada karein.
                    </div>
                  </>
                ) : (
                  <>
                    <HiInformationCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="block text-sm mb-1 font-bold">Aap par Zakat Farz nahi hai</strong>
                      Aapka total wealth (₹{netWealth.toLocaleString()}) Zakat ki limit (₹{Math.round(selectedNisabThreshold).toLocaleString()}) se kam hai. Isliye aap par abhi Zakat dena farz nahi hai.
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-sage-100/50">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl poppins-regular text-xs font-semibold text-sage-600 bg-sage-50/60 hover:bg-sage-100/60 border border-sage-200/60 transition-all cursor-pointer"
                >
                  Reset Calculator (Clear karein)
                </button>
                <button
                  onClick={() => setActiveTab('assets')}
                  className="flex-1 py-3 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition-all cursor-pointer border-0"
                >
                  Hisab change karein
                </button>
              </div>

            </div>
          )}

        </section>

        {/* Zakat FAQ / Guideline section */}
        <section className="glass-card rounded-3xl p-6 shadow-sm border border-white/60 space-y-4">
          <h3 className="poppins-regular text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
            <HiOutlineQuestionMarkCircle className="text-sage-500 w-5 h-5" />
            <span>Zakat ke Aasan Rules (नियम)</span>
          </h3>

          <div className="space-y-3 text-xs text-sage-600 leading-relaxed text-left">
            <div>
              <strong className="text-sage-800 block mb-0.5">1. Zakat dene ki minimum limit (Nisab) kya hai?</strong>
              Sone (Gold) ka limit 87.48 grams aur Chandi (Silver) ka limit 612.36 grams hai. Agar kisi ke paas iske barabar ya iski value ke barabar cash/maal ho, toh wo sahib-e-nisab (zakat dene ke kabil) hai. Hanafi rules me zarooratmand ke fayde ke liye aamtaur par Chandi ka limit apply kiya jata hai.
            </div>
            <div>
              <strong className="text-sage-800 block mb-0.5">2. Kis-kis maal par Zakat lagti hai?</strong>
              Zakat Cash, Gold, Silver, Share Market investments, aur Dukaan ke stock/merchandise par lagti hai. Rehne ke ghar, zati gadi, ya zati istemal ke mobile/laptop par Zakat nahi lagti.
            </div>
            <div>
              <strong className="text-sage-800 block mb-0.5">3. Zakat kab deni chahiye?</strong>
              Jab aapke paas minimum limit (Nisab) se zyada savings ya sona-chandi ho aur us par ek pura saal (1 year) guzar jaye, tab kul savings par 2.5% (40wan hissa) Zakat dena farz hota hai.
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
