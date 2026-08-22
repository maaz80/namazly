import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import InstallPwaModal from './components/InstallPwaModal';
// ── Code-split routes — loaded on demand ──────────────────
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const TimingsPage  = lazy(() => import('./pages/TimingsPage'));
const HadithPage   = lazy(() => import('./pages/HadithPage'));
const ReviewsPage  = lazy(() => import('./pages/ReviewsPage'));
const GuidePage    = lazy(() => import('./pages/GuidePage'));
const AboutPage    = lazy(() => import('./pages/AboutPage'));
const ContactPage  = lazy(() => import('./pages/ContactPage'));
const FaqPage      = lazy(() => import('./pages/FaqPage'));
const PrivacyPage   = lazy(() => import('./pages/PrivacyPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const AdminLogin   = lazy(() => import('./pages/AdminLogin'));
const AdminDash    = lazy(() => import('./pages/AdminDashboard'));
const ZakatCalculatorPage = lazy(() => import('./pages/ZakatCalculatorPage'));
const TasbihPage = lazy(() => import('./pages/TasbihPage'));
// const HalalCheckerPage = lazy(() => import('./pages/HalalCheckerPage'));
const QiblaFinderPage = lazy(() => import('./pages/QiblaFinderPage'));
const MosqueFinderPage = lazy(() => import('./pages/MosqueFinderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const MasailPage = lazy(() => import('./pages/MasailPage'));
const MaslaDetailPage = lazy(() => import('./pages/MaslaDetailPage'));

// ── Route guards ──────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/" replace />;
};

// ── Page-level Suspense fallback ──────────────────────────
const PageLoader = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="min-h-screen flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 50%, #eef2ee 100%)' }}
  >
    <div className="text-center">
      <div
        className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
        style={{ border: '3px solid #c1dace', borderTopColor: '#3d8265' }}
        aria-hidden="true"
      />
      <p className="poppins-regular text-sage-500 text-sm">Loading…</p>
    </div>
  </div>
);

// ── Routes ────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only track if the React router path matches the actual browser address bar path
    // (This avoids tracking the home page "/" during transitional lazy-loading / initial router sync)
    if (location.pathname === window.location.pathname) {
      import('./utils/analytics')
        .then((m) => {
          m.trackPageView(location.pathname);
        })
        .catch((err) => console.error('Failed to track pageview:', err));
    }
  }, [location.pathname]);

  useEffect(() => {
    // Wait 2.5 seconds (after load and interaction CPU is idle) before fetching analytics
    const timer = setTimeout(() => {
      import('./utils/analytics')
        .then((m) => {
          m.trackVisit(user?.email);
        })
        .catch((err) => console.error('Failed to load analytics dynamically:', err));
    }, 2500);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      /> */}
      <Route
        path="/"
        element={
          <Dashboard />
        }
      />
      <Route
        path="/calendar"
        element={
          <CalendarPage />
        }
      />
      <Route
        path="/timings"
        element={
          <TimingsPage />
        }
      />
      <Route
        path="/hadith"
        element={
          <HadithPage />
        }
      />
      <Route
        path="/reviews"
        element={
          <ReviewsPage />
        }
      />
      <Route
        path="/guide"
        element={
          <GuidePage />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage />
        }
      />
      <Route
        path="/contact"
        element={
          <ContactPage />
        }
      />
      <Route
        path="/faq"
        element={
          <FaqPage />
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <PrivacyPage />
        }
      />
      <Route
        path="/disclaimer"
        element={
          <DisclaimerPage />
        }
      />
      <Route path="/masail" element={<MasailPage />} />
      <Route path="/masail/:slug" element={<MaslaDetailPage />} />
      <Route path="/zakat-calculator" element={<ZakatCalculatorPage />} />
      <Route path="/tasbih" element={<TasbihPage />} />
      {/* <Route path="/halal-checker" element={<HalalCheckerPage />} /> */}
      <Route path="/halal-checker" element={<Navigate to="/" replace />} />
      <Route path="/qibla" element={<QiblaFinderPage />} />
      <Route path="/nearby-mosques" element={<MosqueFinderPage />} />
      <Route path="/1adminMs1" element={<AdminLogin />} />
      <Route path="/1adminMs1/dashboard" element={<AdminDash />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
}

// ── App root ──────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <InstallPwaModal />
      </BrowserRouter>
    </AuthProvider>
  );
}
