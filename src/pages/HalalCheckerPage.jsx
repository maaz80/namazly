import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiSearch, 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiOutlineCamera, 
  HiX, 
  HiOutlineRefresh, 
  HiOutlineDocumentText,
  HiOutlineClipboardList
} from 'react-icons/hi';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';
import { INGREDIENTS_DATABASE } from '../data/additivesData';

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

const POPULAR_SEARCHES = ['E120', 'E471', 'E441', 'E322', 'Gelatin', 'Lard', 'MSG'];

// Helper Component for image fallbacks
const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-12 h-12 rounded-xl bg-sage-100/80 border border-white/60 flex items-center justify-center text-sage-500 font-bold text-xs shrink-0 select-none">
        FOOD
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-12 h-12 rounded-xl object-cover border border-white/60 shadow-sm shrink-0"
    />
  );
};

const ProductImageLarge = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-sage-100 border border-white/80 flex items-center justify-center text-sage-500 font-bold text-sm mx-auto select-none">
        NO IMAGE
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/80 shadow-md mx-auto"
    />
  );
};

export default function HalalCheckerPage() {
  const navigate = useNavigate();
  
  // Navigation Tabs: 'product' (Scan/Search Product), 'additives' (Search E-Numbers), 'text' (Scan Text Paragraph)
  const [activeTab, setActiveTab] = useState('product');
  
  // Tab 1: Product Search & Scan States
  const [productQuery, setProductQuery] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [productSearchError, setProductSearchError] = useState(null);
  
  // Camera Barcode Scanning States
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const scannerInstanceRef = useRef(null);

  // Tab 2: Additive Search States
  const [additiveQuery, setAdditiveQuery] = useState('');

  // Tab 3: Text Scanner States
  const [pastedText, setPastedText] = useState('');
  const [textScanResult, setTextScanResult] = useState(null);

  // SEO Optimization
  usePageMeta(
    'Halal Food & E-Numbers Scanner — Scan Products & Ingredients | Namazly',
    'Verify Halal, Haram, or Mushbooh status instantly. Scan product barcodes using your camera, search by name, or check food additives and E-numbers.',
    '/halal-checker'
  );

  // Cleanup active camera scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(err => console.error("Scanner cleanup failed:", err));
      }
    };
  }, []);

  // Normalize query to compare easily (e.g. remove spaces, lower case)
  const normalizedAdditiveQuery = additiveQuery.trim().toLowerCase().replace(/\s+/g, '');

  // Tab 2: Local Additive Search Filter
  const additiveSearchResults = useMemo(() => {
    if (!normalizedAdditiveQuery) return [];
    
    return INGREDIENTS_DATABASE.filter(item => {
      const normalizedId = item.id.toLowerCase().replace(/\s+/g, '');
      const normalizedName = item.name.toLowerCase().replace(/\s+/g, '');
      return normalizedId.includes(normalizedAdditiveQuery) || normalizedName.includes(normalizedAdditiveQuery);
    });
  }, [normalizedAdditiveQuery]);

  // Dynamic Scan Logic for Ingredients
  const analyzeIngredients = (ingredientsText) => {
    if (!ingredientsText) {
      return {
        status: 'unknown',
        matchedItems: [],
        hasPorkOrLard: false
      };
    }

    const normalizedText = ingredientsText.toLowerCase().replace(/[\s\-_]+/g, '');
    const matchedItems = [];

    // 1. Scan E-numbers (match patterns like e100, e471, e120)
    const eNumberRegex = /e\d+[a-z]?/g;
    const eNumbersFound = normalizedText.match(eNumberRegex) || [];
    const uniqueENumbers = Array.from(new Set(eNumbersFound));

    uniqueENumbers.forEach(eCode => {
      const matchedItem = INGREDIENTS_DATABASE.find(item => item.id === eCode);
      if (matchedItem) {
        matchedItems.push(matchedItem);
      }
    });

    // 2. Scan named common ingredients
    const namedIngredients = [
      { key: 'gelatin', terms: ['gelatin', 'gelatine'] },
      { key: 'lard', terms: ['lard'] },
      { key: 'pork', terms: ['pork', 'pig', 'swine'] },
      { key: 'alcohol', terms: ['alcohol', 'ethanol', 'ethylalcohol'] },
      { key: 'carmine', terms: ['carmine', 'carminic'] },
      { key: 'cochineal', terms: ['cochineal'] },
      { key: 'rennet', terms: ['rennet'] },
      { key: 'pepsin', terms: ['pepsin'] },
      { key: 'cysteine', terms: ['cysteine'] },
      { key: 'whey', terms: ['whey'] }
    ];

    namedIngredients.forEach(({ key, terms }) => {
      const isFound = terms.some(term => normalizedText.includes(term));
      if (isFound) {
        const alreadyAdded = matchedItems.some(item => item.id === key);
        if (!alreadyAdded) {
          const matchedItem = INGREDIENTS_DATABASE.find(item => item.id === key);
          if (matchedItem) {
            matchedItems.push(matchedItem);
          }
        }
      }
    });

    // 3. Special Case Override: Soya/Soy Lecithin (E322 is generally animal/plant, but if soy, it is 100% Halal)
    const containsSoyLecithin = normalizedText.includes('soyalecithin') || 
                                normalizedText.includes('soya-lecithin') || 
                                normalizedText.includes('soylecithin') || 
                                normalizedText.includes('soy-lecithin');
    if (containsSoyLecithin) {
      const e322Idx = matchedItems.findIndex(item => item.id === 'e322');
      if (e322Idx !== -1) {
        matchedItems[e322Idx] = {
          ...matchedItems[e322Idx],
          status: 'halal',
          details: 'Soy-derived Lecithin is plant-based and 100% Halal. (Overridden from general animal/plant lecithin).'
        };
      }
    }

    // 4. Check for direct Pork/Lard
    const hasPorkOrLard = normalizedText.includes('pork') || normalizedText.includes('lard') || normalizedText.includes('pig') || normalizedText.includes('swine');

    // 5. Overall Status Decision
    let status = 'halal';
    if (hasPorkOrLard || matchedItems.some(item => item.status === 'haram')) {
      status = 'haram';
    } else if (matchedItems.some(item => item.status === 'mushbooh')) {
      status = 'mushbooh';
    }

    return {
      status,
      matchedItems,
      hasPorkOrLard
    };
  };

  // Search Products from Open Food Facts API
  const handleProductSearch = async (queryText) => {
    if (!queryText.trim()) return;
    setIsProductLoading(true);
    setProductSearchError(null);
    setSelectedProduct(null);
    setProductsList([]);

    const trimmedQuery = queryText.trim();
    const isBarcode = /^\d+$/.test(trimmedQuery);

    try {
      if (isBarcode) {
        // Direct API Barcode Query
        const barcodeUrl = `https://world.openfoodfacts.org/api/v2/product/${trimmedQuery}?fields=code,product_name,brands,image_front_thumb_url,image_front_url,ingredients_text,labels_tags`;
        const response = await fetch(barcodeUrl, {
          headers: { 'User-Agent': 'NamazlyFoodChecker/1.0 (maaz@shakeel.com)' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 1 && data.product) {
            const analysis = analyzeIngredients(data.product.ingredients_text);
            setSelectedProduct({
              ...data.product,
              ...analysis
            });
            return;
          }
        }
        // Fallback to text search if barcode product not directly found in catalog
      }

      // Query CGI Search API
      const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmedQuery)}&search_simple=1&action=process&json=1&page_size=12`;
      const searchResponse = await fetch(searchUrl, {
        headers: { 'User-Agent': 'NamazlyFoodChecker/1.0 (maaz@shakeel.com)' }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.products && searchData.products.length > 0) {
          const parsedList = searchData.products.map(p => {
            return {
              ...p,
              ...analyzeIngredients(p.ingredients_text)
            };
          });
          setProductsList(parsedList);
        } else {
          setProductSearchError(`No product found for "${trimmedQuery}".`);
        }
      } else {
        setProductSearchError("Failed to fetch products. Please check your network connection.");
      }
    } catch (err) {
      console.error(err);
      setProductSearchError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProductLoading(false);
    }
  };

  // Keyboard Enter key trigger
  const handleKeyDown = (e, searchFn, query) => {
    if (e.key === 'Enter') {
      searchFn(query);
    }
  };

  // Lazy-load camera barcode scanner
  const startCameraScanner = async () => {
    setIsScanning(true);
    setScannerError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Delay slightly to ensure browser has rendered scanner element viewport
      setTimeout(() => {
        const html5Qrcode = new Html5Qrcode("barcode-scanner-viewport");
        scannerInstanceRef.current = html5Qrcode;

        html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const boxWidth = Math.min(width * 0.85, 280);
              const boxHeight = Math.min(height * 0.35, 100);
              return { width: boxWidth, height: boxHeight };
            }
          },
          (decodedText) => {
            // Success
            setProductQuery(decodedText);
            handleProductSearch(decodedText);
            stopCameraScanner();
          },
          () => {
            // Verbose logging suppression (no-op)
          }
        ).catch(err => {
          console.error("Camera initiation error:", err);
          setScannerError("Camera permission denied or camera not found.");
          setIsScanning(false);
        });
      }, 150);
    } catch (err) {
      console.error("Failed to load scanner module:", err);
      setScannerError("Could not load barcode scanner. Please enter code manually.");
      setIsScanning(false);
    }
  };

  const stopCameraScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop()
        .then(() => {
          setIsScanning(false);
          scannerInstanceRef.current = null;
        })
        .catch(err => {
          console.error("Failed to stop scanner:", err);
          setIsScanning(false);
          scannerInstanceRef.current = null;
        });
    } else {
      setIsScanning(false);
    }
  };

  // Tab 3: Parse manual pasted text block
  const handleTextScan = () => {
    if (!pastedText.trim()) return;
    const result = analyzeIngredients(pastedText);
    setTextScanResult(result);
  };

  // Reset text scanner
  const handleResetTextScan = () => {
    setPastedText('');
    setTextScanResult(null);
  };

  // Highlight words inside ingredients block
  const renderHighlightedText = (ingredientsText, matchedItems) => {
    if (!ingredientsText) return <span className="text-sage-400 italic">No ingredient list available.</span>;

    // Get unique E-numbers and terms to check
    const highlightTerms = matchedItems.map(item => item.id.toUpperCase());
    matchedItems.forEach(item => {
      const words = item.id.split('/');
      words.forEach(w => {
        if (w.trim().length > 3) {
          highlightTerms.push(w.trim().toUpperCase());
        }
      });
    });

    // Mandatory override words
    const forceHighlight = ['PORK', 'LARD', 'PIG', 'SWINE', 'GELATIN', 'GELATINE', 'ALCOHOL', 'ETHANOL', 'CARMINE', 'COCHINEAL'];
    const allHighlightTerms = Array.from(new Set([...highlightTerms, ...forceHighlight]));
    allHighlightTerms.sort((a, b) => b.length - a.length);

    if (allHighlightTerms.length === 0) return <span>{ingredientsText}</span>;

    const escapedTerms = allHighlightTerms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    const parts = ingredientsText.split(regex);
    return (
      <span className="leading-relaxed">
        {parts.map((part, index) => {
          const isMatched = regex.test(part) || allHighlightTerms.includes(part.toUpperCase());
          if (isMatched) {
            const lowerPart = part.toLowerCase();
            let itemStatus = 'mushbooh';
            
            if (lowerPart.includes('pork') || lowerPart.includes('lard') || lowerPart.includes('pig') || lowerPart.includes('swine')) {
              itemStatus = 'haram';
            } else {
              const matched = matchedItems.find(item => 
                item.id === lowerPart || 
                item.id === 'e' + lowerPart.replace(/\D/g, '') || 
                item.name.toLowerCase().includes(lowerPart)
              );
              if (matched) {
                itemStatus = matched.status;
              }
            }

            let bgClass = 'bg-amber-100 text-amber-800 border-amber-300';
            if (itemStatus === 'haram') {
              bgClass = 'bg-rose-100 text-rose-800 border-rose-300';
            } else if (itemStatus === 'halal') {
              bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            }

            return (
              <span key={index} className={`px-1.5 py-0.5 mx-0.5 rounded-md border text-[11px] font-bold font-mono inline-block select-none ${bgClass}`}>
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

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
            Namazly Halal Checker
          </span>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main Container */}
      <main id="main-content" className="relative z-10 max-w-lg mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-5 animate-fade-in">
        
        {/* Banner Section */}
        <section className="text-center space-y-1">
          <span className="px-3 py-1 rounded-full bg-sage-200/50 text-sage-800 text-[10px] font-bold poppins-regular uppercase tracking-wider">
            UPGRADED SCANNER
          </span>
          <h1 className="poppins-regular text-xl sm:text-2xl font-black text-sage-900">
            Halal Food &amp; Additive Checker
          </h1>
          <p className="poppins-regular text-[11px] text-sage-500 max-w-xs mx-auto leading-normal">
            Verify products or E-numbers immediately against Sharia-compliant guidelines.
          </p>
        </section>

        {/* Tab Buttons (Grid of 3) */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-sage-200/30 border border-white/80 shadow-inner">
          <button
            onClick={() => { setActiveTab('product'); setSelectedProduct(null); stopCameraScanner(); }}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              activeTab === 'product'
                ? 'bg-white text-sage-900 shadow-sm'
                : 'bg-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            🔍 Scan Product
          </button>
          <button
            onClick={() => { setActiveTab('additives'); stopCameraScanner(); }}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              activeTab === 'additives'
                ? 'bg-white text-sage-900 shadow-sm'
                : 'bg-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            🧪 E-Numbers
          </button>
          <button
            onClick={() => { setActiveTab('text'); stopCameraScanner(); }}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-sage-900 shadow-sm'
                : 'bg-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            📝 Scan Text
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PRODUCT SEARCH & CAMERA BARCODE SCANNER */}
        {/* ======================================================== */}
        {activeTab === 'product' && !selectedProduct && (
          <div className="space-y-4">
            
            {/* Search Input Box with Barcode Trigger */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-400">
                  <HiSearch className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter Product name or Barcode..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleProductSearch, productQuery)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-white/80 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium text-sage-800 shadow-sm transition-all placeholder-sage-400"
                />
              </div>
              <button
                onClick={isScanning ? stopCameraScanner : startCameraScanner}
                title="Scan barcode with camera"
                className={`p-3 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                  isScanning 
                    ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600' 
                    : 'bg-white border-white/80 text-sage-700 hover:bg-sage-100 shadow-sm'
                }`}
              >
                {isScanning ? <HiX className="w-5 h-5" /> : <HiOutlineCamera className="w-5 h-5" />}
              </button>
            </div>

            {/* Camera Viewport Overlay */}
            {isScanning && (
              <div className="glass-card rounded-3xl p-4 border border-white/80 shadow-md flex flex-col items-center gap-3 animate-scale-in">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">
                    Place Barcode inside the box
                  </span>
                  <button onClick={stopCameraScanner} className="text-sage-400 hover:text-rose-500 border-0 bg-transparent cursor-pointer">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Viewport for scanning */}
                <div id="barcode-scanner-viewport" className="w-full max-w-sm aspect-video rounded-2xl overflow-hidden border border-white/60 bg-black/10 relative"></div>
                
                <p className="text-[10px] text-sage-500 leading-normal text-center">
                  Make sure there is sufficient light and hold the phone steady.
                </p>
              </div>
            )}

            {scannerError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/50 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
                <HiXCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{scannerError}</span>
              </div>
            )}

            {/* Loading Spinner */}
            {isProductLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-3 border-sage-300 border-t-sage-800 animate-spin" />
                <span className="text-xs text-sage-500 font-semibold poppins-regular">Fetching product details...</span>
              </div>
            )}

            {/* Search error info */}
            {productSearchError && !isProductLoading && (
              <div className="glass-card rounded-3xl p-6 text-center border border-rose-100/50 shadow-sm animate-fade-in space-y-3">
                <HiExclamationCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-sage-900 leading-tight">Product Not Found</h3>
                <p className="text-xs text-sage-500 leading-relaxed max-w-xs mx-auto">
                  {productSearchError} We couldn't find this product in Open Food Facts.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('text')}
                    className="px-4 py-2 rounded-xl bg-sage-800 text-white font-bold text-xs hover:bg-sage-900 border-0 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    Paste Ingredients Instead
                  </button>
                </div>
              </div>
            )}

            {/* Results list from Open Food Facts */}
            {productsList.length > 0 && !isProductLoading && (
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider px-1">
                  Found {productsList.length} products
                </span>
                
                <div className="flex flex-col gap-2.5">
                  {productsList.map((product) => {
                    const isHalal = product.status === 'halal';
                    const isHaram = product.status === 'haram';
                    const isMushbooh = product.status === 'mushbooh';
                    
                    return (
                      <div
                        key={product.code}
                        onClick={() => setSelectedProduct(product)}
                        className="glass-card rounded-2xl p-3 border border-white/80 shadow-sm hover:shadow-md hover:bg-white/60 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <ProductImage src={product.image_front_thumb_url} alt={product.product_name} />
                          <div className="overflow-hidden">
                            <h3 className="text-xs font-bold text-sage-900 truncate leading-snug">
                              {product.product_name || 'Unknown Product'}
                            </h3>
                            <span className="text-[10px] text-sage-500 font-semibold truncate block">
                              {product.brands || 'No Brand'}
                            </span>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="shrink-0">
                          {isHalal && (
                            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-0.5">
                              <HiCheckCircle className="w-3.5 h-3.5" />
                              <span>Halal</span>
                            </span>
                          )}
                          {isHaram && (
                            <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50 font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-0.5">
                              <HiXCircle className="w-3.5 h-3.5" />
                              <span>Haram</span>
                            </span>
                          )}
                          {isMushbooh && (
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-0.5">
                              <HiExclamationCircle className="w-3.5 h-3.5" />
                              <span>Doubtful</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SELECTED PRODUCT DETAIL PANEL */}
        {/* ======================================================== */}
        {activeTab === 'product' && selectedProduct && (
          <div className="space-y-4 animate-scale-in">
            {/* Header / Back Action */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-1.5 text-sage-600 hover:text-sage-900 border-0 bg-transparent cursor-pointer font-bold text-xs"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span>Back to search results</span>
            </button>

            {/* Product summary card */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md flex flex-col gap-4">
              <div className="text-center space-y-2">
                <ProductImageLarge src={selectedProduct.image_front_url || selectedProduct.image_front_thumb_url} alt={selectedProduct.product_name} />
                <div>
                  <h2 className="text-base font-extrabold text-sage-900 leading-tight">
                    {selectedProduct.product_name}
                  </h2>
                  <span className="text-xs text-sage-500 font-semibold mt-0.5 block">
                    Brand: {selectedProduct.brands || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Huge Status Block */}
              <div className="text-center">
                {selectedProduct.status === 'halal' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center gap-1.5 shadow-sm">
                    <HiCheckCircle className="w-10 h-10 text-emerald-600" />
                    <span className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider">Halal</span>
                    <p className="text-[11px] text-emerald-700 max-w-xs leading-normal font-semibold">
                      Is product ke ingredients bilkul safe hain. Isme koi bhi Haram ya Doubtful (Mushbooh) ingredient nahi mila hai.
                    </p>
                  </div>
                )}
                {selectedProduct.status === 'haram' && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col items-center gap-1.5 shadow-sm">
                    <HiXCircle className="w-10 h-10 text-rose-600" />
                    <span className="text-sm font-extrabold text-rose-800 uppercase tracking-wider">Haram Detected</span>
                    <p className="text-[10px] text-rose-600 max-w-xs leading-normal">
                      {selectedProduct.hasPorkOrLard 
                        ? 'This product contains Pork/Lard derivatives which are strictly prohibited in Islam.' 
                        : 'This product contains verified Haram food additives/E-numbers.'}
                    </p>
                  </div>
                )}
                {selectedProduct.status === 'mushbooh' && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col items-center gap-1.5 shadow-sm">
                    <HiExclamationCircle className="w-10 h-10 text-amber-600" />
                    <span className="text-sm font-extrabold text-amber-800 uppercase tracking-wider">Doubtful (Mushbooh)</span>
                    <p className="text-[10px] text-amber-600 max-w-xs leading-normal">
                      Contains emulsifiers or additives that can be sourced from either animal fat or plant fat. Please check for a vegan/halal label.
                    </p>
                  </div>
                )}
              </div>

              {/* Highlighted Ingredients Text Block */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">
                  Ingredients Scan Report:
                </span>
                <div className="p-3.5 rounded-2xl border border-white/60 bg-white/20 text-sage-700 text-xs leading-relaxed text-left max-h-48 overflow-y-auto">
                  {renderHighlightedText(selectedProduct.ingredients_text, selectedProduct.matchedItems)}
                </div>
              </div>

              {/* Matched Additives Breakdown Table */}
              {selectedProduct.matchedItems.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">
                    Flagged Additives / Ingredients Detail:
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    {selectedProduct.matchedItems.map(item => {
                      const isHalal = item.status === 'halal';
                      const isHaram = item.status === 'haram';
                      const isMushbooh = item.status === 'mushbooh';
                      
                      return (
                        <div key={item.id} className="p-3 rounded-2xl border border-white/40 bg-white/10 text-left space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-sage-800">{item.name}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              isHalal ? 'bg-emerald-100 text-emerald-800' :
                              isHaram ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[9px] text-sage-500 font-semibold block uppercase">Source: {item.source}</span>
                          <p className="text-[10px] text-sage-600 leading-normal">{item.details}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Disclaimer footer */}
              <p className="text-[9px] text-sage-400 text-center leading-normal max-w-xs mx-auto">
                Always review details on the physical packaging. Ingredients datasets are crowdsourced from Open Food Facts.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: OFFLINE ADDITIVES / E-NUMBERS DIRECT SEARCH */}
        {/* ======================================================== */}
        {activeTab === 'additives' && (
          <div className="space-y-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-400">
                <HiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search E-number (e.g. E120) or Name..."
                value={additiveQuery}
                onChange={(e) => setAdditiveQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-white/80 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium text-sage-800 shadow-sm transition-all placeholder-sage-400"
              />
            </div>

            {/* Popular searches chips */}
            {!additiveQuery && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider text-center">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setAdditiveQuery(term)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold glass-card border border-white/60 text-sage-700 hover:bg-white/60 active:scale-95 cursor-pointer transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results lookup list */}
            {additiveQuery && (
              <div className="space-y-3">
                {additiveSearchResults.length > 0 ? (
                  additiveSearchResults.map((item) => {
                    const isHalal = item.status === 'halal';
                    const isHaram = item.status === 'haram';
                    const isMushbooh = item.status === 'mushbooh';

                    return (
                      <div
                        key={item.id}
                        className="glass-card rounded-3xl p-4 border border-white/80 shadow-sm space-y-3 animate-scale-in"
                      >
                        {/* Header info */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xs sm:text-sm font-bold text-sage-950 leading-tight">
                              {item.name}
                            </h2>
                            <span className="text-[9px] font-semibold text-sage-500 uppercase tracking-wider block mt-0.5">
                              Source: {item.source}
                            </span>
                          </div>

                          {/* Status badge */}
                          {isHalal && (
                            <div className="flex items-center gap-0.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-bold text-[9px] uppercase tracking-wider shrink-0">
                              <HiCheckCircle className="w-3.5 h-3.5" />
                              <span>Halal</span>
                            </div>
                          )}
                          {isHaram && (
                            <div className="flex items-center gap-0.5 px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200/50 font-bold text-[9px] uppercase tracking-wider shrink-0">
                              <HiXCircle className="w-3.5 h-3.5" />
                              <span>Haram</span>
                            </div>
                          )}
                          {isMushbooh && (
                            <div className="flex items-center gap-0.5 px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200/50 font-bold text-[9px] uppercase tracking-wider shrink-0">
                              <HiExclamationCircle className="w-3.5 h-3.5" />
                              <span>Doubtful</span>
                            </div>
                          )}
                        </div>

                        {/* Details explanation */}
                        <div className="text-left text-[11px] leading-relaxed text-sage-600 bg-white/20 p-3 rounded-xl border border-white/40">
                          <strong className="block text-sage-800 mb-0.5">Islamic Ruling / Description:</strong>
                          {item.details}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-card rounded-3xl p-6 text-center text-xs text-sage-500 border border-white/80 animate-fade-in">
                    No verified additive found for "<strong>{additiveQuery}</strong>".
                    <p className="mt-2 text-[10px] leading-relaxed">
                      Tip: Try typing just the number (e.g. <strong>120</strong> instead of E120) or check the spelling.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PARAGRAPH TEXT SCANNER */}
        {/* ======================================================== */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            
            {/* Input form */}
            {!textScanResult ? (
              <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4 animate-scale-in">
                <div className="flex items-center gap-2 text-sage-800">
                  <HiOutlineClipboardList className="w-5 h-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Paste Ingredients Text</h3>
                </div>
                
                <textarea
                  placeholder="Copy and paste the list of ingredients from a food packaging here... (e.g., wheat flour, sugar, gelatin E441, cochineal E120, lecithin...)"
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-white/60 bg-white/30 text-xs text-sage-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 shadow-inner resize-none placeholder-sage-400 font-medium"
                />

                <button
                  onClick={handleTextScan}
                  disabled={!pastedText.trim()}
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider border-0 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    pastedText.trim()
                      ? 'bg-sage-800 text-white hover:bg-sage-900'
                      : 'bg-sage-300 text-sage-100 cursor-not-allowed shadow-none'
                  }`}
                >
                  <HiOutlineDocumentText className="w-4 h-4" />
                  <span>Scan Ingredients Text</span>
                </button>
              </div>
            ) : (
              // Scanning results layout
              <div className="space-y-4 animate-scale-in">
                <button
                  onClick={handleResetTextScan}
                  className="flex items-center gap-1 text-sage-600 hover:text-sage-900 border-0 bg-transparent cursor-pointer font-bold text-xs"
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                  <span>Scan another ingredient text</span>
                </button>

                {/* Overall Verdict Card */}
                <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md flex flex-col gap-4">
                  <div className="text-center space-y-1">
                    <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">Overall Verdict</span>
                    
                    {textScanResult.status === 'halal' && (
                      <div className="flex flex-col items-center gap-1.5 py-3 text-emerald-800">
                        <HiCheckCircle className="w-12 h-12 text-emerald-600" />
                        <span className="text-sm font-extrabold uppercase tracking-wide">Halal (Isme koi Haram cheez nahi mili)</span>
                      </div>
                    )}
                    {textScanResult.status === 'haram' && (
                      <div className="flex flex-col items-center gap-1.5 py-3 text-rose-800">
                        <HiXCircle className="w-12 h-12 text-rose-600" />
                        <span className="text-sm font-extrabold uppercase tracking-wide">Haram Ingredients Detected</span>
                      </div>
                    )}
                    {textScanResult.status === 'mushbooh' && (
                      <div className="flex flex-col items-center gap-1.5 py-3 text-amber-800">
                        <HiExclamationCircle className="w-12 h-12 text-amber-600" />
                        <span className="text-sm font-extrabold uppercase tracking-wide">Mushbooh (Doubtful) Ingredients</span>
                      </div>
                    )}
                  </div>

                  {/* Highlighted text block */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">Highlighted ingredients:</span>
                    <div className="p-3 rounded-2xl border border-white/40 bg-white/20 text-left text-xs leading-relaxed text-sage-700">
                      {renderHighlightedText(pastedText, textScanResult.matchedItems)}
                    </div>
                  </div>

                  {/* Additives matched breakdown */}
                  {textScanResult.matchedItems.length > 0 ? (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-sage-500 uppercase tracking-wider">Detected Additive details:</span>
                      
                      <div className="flex flex-col gap-2">
                        {textScanResult.matchedItems.map(item => {
                          const isHalal = item.status === 'halal';
                          const isHaram = item.status === 'haram';
                          const isMushbooh = item.status === 'mushbooh';
                          
                          return (
                            <div key={item.id} className="p-3 rounded-2xl border border-white/40 bg-white/10 text-left space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-bold text-sage-800">{item.name}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  isHalal ? 'bg-emerald-100 text-emerald-800' :
                                  isHaram ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <span className="text-[9px] text-sage-500 font-semibold block uppercase">Source: {item.source}</span>
                              <p className="text-[10px] text-sage-600 leading-normal">{item.details}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed text-center">
                      No matching E-numbers or critical food additives found. Please double-check other ingredients manually.
                    </div>
                  )}

                  {/* Reset button */}
                  <div className="pt-2">
                    <button
                      onClick={handleResetTextScan}
                      className="w-full py-2.5 rounded-2xl bg-sage-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-sage-900 border-0 cursor-pointer shadow-md active:scale-95 transition-all"
                    >
                      Clear &amp; Scan New
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
