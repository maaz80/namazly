import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import InstallPwaModal from './components/InstallPwaModal';

// ── Code-split routes — loaded on demand ──────────────────
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
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
const AppRoutes = () => (
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
      <Route path="/1adminMs1" element={<AdminLogin />} />
      <Route path="/1adminMs1/dashboard" element={<AdminDash />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

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
